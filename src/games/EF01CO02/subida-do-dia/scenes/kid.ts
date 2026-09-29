import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { KID as KID_TEX, KID_CELL } from '../data/files'
import { DEPTH, KID, LADDER } from '../data/layout'
import { C } from '../data/theme'
import type { Point } from '../types'

type Pose = keyof typeof KID_CELL

export interface Kid {
    walkTo(x: number): Promise<void>
    climbTo(p: Point): Promise<void>
    slideDown(p: Point): Promise<void>
    oops(): void
    cheer(): Promise<void>
    jumpToCloud(): Promise<void>
    home(): Promise<void>
    readonly container: Phaser.GameObjects.Container
    destroy(): void
}

function paintFallback(g: Phaser.GameObjects.Graphics, pose: Pose) {
    const h = KID.height
    g.clear()
    g.lineStyle(4, C.ink, 1)
    g.fillStyle(C.paperLight, 1)
    const headR = h * 0.3
    const headY = -h + headR
    g.fillRoundedRect(-h * 0.2, -h * 0.42, h * 0.4, h * 0.36, 10)
    g.strokeRoundedRect(-h * 0.2, -h * 0.42, h * 0.4, h * 0.36, 10)
    g.lineBetween(-h * 0.1, -h * 0.06, -h * 0.12, 0)
    g.lineBetween(h * 0.1, -h * 0.06, h * 0.12, 0)
    const up = pose === 'cheer' || pose === 'slide'
    g.lineBetween(-h * 0.2, -h * 0.36, -h * 0.34, up ? -h * 0.62 : -h * 0.18)
    g.lineBetween(h * 0.2, -h * 0.36, h * 0.34, up || pose === 'climbA' ? -h * 0.62 : -h * 0.18)
    g.fillCircle(0, headY, headR)
    g.strokeCircle(0, headY, headR)
    g.fillStyle(C.blush, 1)
    g.fillEllipse(-headR * 0.55, headY + headR * 0.3, 12, 7)
    g.fillEllipse(headR * 0.55, headY + headR * 0.3, 12, 7)
    g.fillStyle(C.ink, 1)
    if (pose === 'slide') {
        g.fillCircle(-headR * 0.35, headY, 4)
        g.fillCircle(headR * 0.35, headY, 4)
        g.fillRect(-4, headY + headR * 0.35, 8, 7)
    } else {
        g.lineStyle(3, C.ink, 1)
        g.beginPath()
        g.arc(-headR * 0.35, headY + 2, 5, Math.PI, 0)
        g.strokePath()
        g.beginPath()
        g.arc(headR * 0.35, headY + 2, 5, Math.PI, 0)
        g.strokePath()
        g.beginPath()
        g.arc(0, headY + headR * 0.32, pose === 'oops' ? 4 : 7, 0, Math.PI)
        g.strokePath()
    }
}

export function createKid(scene: Phaser.Scene): Kid {
    const container = scene.add.container(KID.startX, KID.groundY).setDepth(DEPTH.kid)
    const hasArt = scene.textures.exists(KID_TEX)
    const image = hasArt
        ? scene.add
              .image(0, 0, KID_TEX, KID_CELL.idle)
              .setOrigin(0.5, KID.footY / KID.cell)
              .setScale(KID.height / KID.artH)
        : undefined
    const drawn = hasArt ? undefined : scene.add.graphics()
    const body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics = image ?? (drawn as Phaser.GameObjects.Graphics)
    const shadow = scene.add.graphics()
    shadow.fillStyle(C.shadow, 0.12)
    shadow.fillEllipse(0, 2, KID.height * 0.55, 12)
    container.add([shadow, body])

    let climbFlip = false

    const setPose = (next: Pose) => {
        if (image) image.setFrame(KID_CELL[next]).setFlipX(next === 'climbA' || next === 'climbB' ? image.flipX : false)
        else if (drawn) paintFallback(drawn, next)
        shadow.setVisible(next !== 'slide' && next !== 'climbA' && next !== 'climbB' && container.y >= KID.groundY - 4)
    }
    setPose('idle')

    const settle = () => {
        FX.kill(scene, body)
        body.setPosition(0, 0).setAngle(0).setScale(image ? KID.height / KID.artH : 1)
    }

    const face = (dx: number) => {
        if (image && dx !== 0) image.setFlipX(dx < 0)
    }

    const walkTo = async (x: number) => {
        FX.kill(scene, container)
        settle()
        const dx = x - container.x
        if (Math.abs(dx) < 2) return
        setPose('idle')
        face(dx)
        const duration = Math.max(260, Math.abs(dx) / KID.walkPxPerMs)
        const hops = Math.max(2, Math.round(duration / 220))
        const bob = scene.tweens.add({
            targets: body,
            y: -10,
            duration: duration / hops / 2,
            yoyo: true,
            repeat: hops - 1,
            ease: 'Sine.easeOut',
        })
        await FX.to(scene, container, { x }, { duration, ease: 'Linear' })
        bob.remove()
        settle()
        if (image) image.setFlipX(false)
    }

    return {
        walkTo,
        async climbTo(p) {
            FX.kill(scene, container)
            settle()
            climbFlip = !climbFlip
            setPose(climbFlip ? 'climbA' : 'climbB')
            if (image) image.setFlipX(p.x < LADDER.cx)
            await FX.to(scene, container, { x: p.x, y: p.y }, { duration: KID.climbMs, ease: Ease.back(1.2) })
        },
        async slideDown(p) {
            FX.kill(scene, container)
            settle()
            setPose('slide')
            const wobble = scene.tweens.add({
                targets: body,
                angle: { from: -6, to: 6 },
                duration: 120,
                yoyo: true,
                repeat: -1,
            })
            await FX.to(scene, container, { x: p.x, y: p.y }, { duration: KID.slideMs, ease: 'Quad.easeIn' })
            wobble.remove()
            settle()
            await FX.to(scene, body, { y: -12 }, { duration: 110, yoyo: true, ease: 'Sine.easeOut' })
            settle()
        },
        oops() {
            settle()
            setPose('oops')
            void FX.impact(scene, body, 0.12)
        },
        async cheer() {
            settle()
            setPose('cheer')
            await FX.to(scene, body, { y: -34 }, { duration: 200, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
            settle()
        },
        async jumpToCloud() {
            FX.kill(scene, container)
            settle()
            setPose('cheer')
            const x = KID.cheerX
            const y = KID.cheerY
            const fromX = container.x
            const fromY = container.y
            const peak = Math.min(fromY, y) - 90
            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, 640),
                    ease: 'Sine.easeInOut',
                    onUpdate: tween => {
                        const t = tween.getValue() ?? 0
                        const lx = Phaser.Math.Linear(fromX, x, t)
                        const ly = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * peak + t * t * y
                        if (container.active) container.setPosition(lx, ly)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            container.setPosition(x, y)
            await FX.impact(scene, body, 0.14)
            settle()
        },
        async home() {
            FX.kill(scene, container)
            settle()
            if (container.y !== KID.groundY) {
                container.setY(KID.groundY)
            }
            await walkTo(KID.startX)
            setPose('idle')
        },
        container,
        destroy() {
            FX.kill(scene, [container, body])
            container.destroy()
        },
    }
}
