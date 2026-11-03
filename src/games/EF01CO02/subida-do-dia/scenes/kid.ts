import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { KID as KID_TEX, KID_CELL } from '../data/files'
import { DEPTH, KID, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Point } from '../types'

type Pose = keyof typeof KID_CELL

export interface Kid {
    walkTo(x: number): Promise<void>
    climbTo(p: Point): Promise<void>
    slideDown(p: Point): Promise<void>
    oops(): void
    idle(): void
    cheer(): Promise<void>
    jumpTo(p: Point): Promise<void>
    place(x: number, y: number): void
    appear(): Promise<void>
    vanish(): Promise<void>
    head(): Point
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
}

export function createKid(scene: Phaser.Scene): Kid {
    const container = scene.add.container(KID.startX, WORLD.groundY).setDepth(DEPTH.kid)
    const hasArt = scene.textures.exists(KID_TEX)
    const scale = KID.height / KID.artH
    const image = hasArt
        ? scene.add.image(0, 0, KID_TEX, KID_CELL.idle).setOrigin(0.5, KID.footY / KID.cell).setScale(scale)
        : undefined
    const drawn = hasArt ? undefined : scene.add.graphics()
    const body: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics = image ?? (drawn as Phaser.GameObjects.Graphics)
    const shadow = scene.add.graphics()
    shadow.fillStyle(C.shadow, 0.14)
    shadow.fillEllipse(0, 2, KID.height * 0.55, 14)
    container.add([shadow, body])

    let climbFlip = false
    let onGround = true

    const setPose = (next: Pose) => {
        if (image) image.setFrame(KID_CELL[next])
        else if (drawn) paintFallback(drawn, next)
        shadow.setVisible(onGround && next !== 'slide')
    }
    setPose('idle')

    const settle = () => {
        FX.kill(scene, body)
        body.setPosition(0, 0).setAngle(0).setScale(image ? scale : 1)
    }

    const walkTo = async (x: number) => {
        FX.kill(scene, container)
        settle()
        const dx = x - container.x
        if (Math.abs(dx) < 2) return
        onGround = true
        setPose('idle')
        if (image) image.setFlipX(dx < 0)
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
            onGround = false
            climbFlip = !climbFlip
            setPose(climbFlip ? 'climbA' : 'climbB')
            if (image) image.setFlipX(true)
            await FX.to(scene, container, { x: p.x, y: p.y }, { duration: KID.climbMs, ease: Ease.back(1.2) })
        },
        async slideDown(p) {
            FX.kill(scene, container)
            settle()
            onGround = false
            setPose('slide')
            if (image) image.setFlipX(false)
            const wobble = scene.tweens.add({
                targets: body,
                angle: { from: -6, to: 6 },
                duration: 120,
                yoyo: true,
                repeat: -1,
            })
            const far = Math.abs(p.y - container.y)
            await FX.to(scene, container, { x: p.x, y: p.y }, { duration: Math.max(260, KID.slideMs * Math.min(1.6, far / 400)), ease: 'Quad.easeIn' })
            wobble.remove()
            settle()
            onGround = true
            await FX.to(scene, body, { y: -12 }, { duration: 110, yoyo: true, ease: 'Sine.easeOut' })
            settle()
        },
        oops() {
            settle()
            setPose('oops')
            void FX.impact(scene, body, 0.12)
        },
        idle() {
            settle()
            setPose('idle')
        },
        async cheer() {
            settle()
            setPose('cheer')
            await FX.to(scene, body, { y: -34 }, { duration: 200, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
            settle()
        },
        async jumpTo(p) {
            FX.kill(scene, container)
            settle()
            onGround = false
            setPose('cheer')
            if (image) image.setFlipX(false)
            const fromX = container.x
            const fromY = container.y
            const peak = Math.min(fromY, p.y) - 110
            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: FX.ms(scene, 700),
                    ease: 'Sine.easeInOut',
                    onUpdate: tween => {
                        const t = tween.getValue() ?? 0
                        const x = Phaser.Math.Linear(fromX, p.x, t)
                        const y = (1 - t) * (1 - t) * fromY + 2 * (1 - t) * t * peak + t * t * p.y
                        if (container.active) container.setPosition(x, y)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            container.setPosition(p.x, p.y)
            await FX.impact(scene, body, 0.14)
            settle()
        },
        place(x, y) {
            FX.kill(scene, container)
            settle()
            container.setPosition(x, y).setAlpha(1).setScale(1)
            onGround = y >= WORLD.groundY - 4
            if (image) image.setFlipX(false)
            setPose('idle')
        },
        async appear() {
            FX.kill(scene, container)
            container.setAlpha(1)
            await FX.popIn(scene, container, { from: 0.4 })
        },
        async vanish() {
            FX.kill(scene, container)
            await FX.to(scene, container, { alpha: 0, scale: 0.6 }, { duration: 260 })
            container.setScale(1)
        },
        head() {
            return { x: container.x, y: container.y - KID.height }
        },
        container,
        destroy() {
            FX.kill(scene, [container, body])
            container.destroy()
        },
    }
}
