import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BIA, CARD, DEPTH } from '../data/layout'
import { A, C, LINE, TRAIL } from '../data/theme'
import type { BiaPose, Dir, Point } from '../types'
import { BIA_ART, BIA_CELL, BIA_SHEET } from '../data/files'
import { createIdCard, type IdCard } from './card'

const FEET = BIA.feet

type G = Phaser.GameObjects.Graphics
type Facing = 'down' | 'up' | 'side'

export interface BiaView {
    readonly container: Phaser.GameObjects.Container
    readonly x: number
    readonly y: number
    setPosition(x: number, y: number): void
    place(x: number, y: number): void
    walkTo(points: Point[], speed: number): Promise<void>
    face(dir: Dir): void
    setPose(pose: BiaPose): void
    setWalking(on: boolean): void
    tremble(on: boolean): void
    bump(): void
    pulse(): void
    shakeHead(): Promise<void>
    hop(): Promise<void>
    cardWorld(): Point
    takeCard(): IdCard
    resetCard(): void
    setCardVisible(on: boolean): void
    setTrail(on: boolean): void
    destroy(): void
}

function paintBody(g: G, facing: Facing, pose: BiaPose, frame: number) {
    const walking = pose === 'walk'
    const step = walking ? (frame ? 1 : -1) : 0
    g.clear()
    g.fillStyle(C.shadow, A.shadow)
    g.fillEllipse(0, 34, 46, 12)

    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(C.white, 1)
    if (facing === 'side') {
        g.fillRoundedRect(-9 + step * 4, 24, 11, 10, 4)
        g.strokeRoundedRect(-9 + step * 4, 24, 11, 10, 4)
        g.fillRoundedRect(-1 - step * 4, 24, 11, 10, 4)
        g.strokeRoundedRect(-1 - step * 4, 24, 11, 10, 4)
    } else {
        g.fillRoundedRect(-13, 23 + step * 2, 10, 11, 4)
        g.strokeRoundedRect(-13, 23 + step * 2, 10, 11, 4)
        g.fillRoundedRect(3, 23 - step * 2, 10, 11, 4)
        g.strokeRoundedRect(3, 23 - step * 2, 10, 11, 4)
    }

    const half = facing === 'side' ? 12 : 14
    const hem = facing === 'side' ? 18 : 22
    g.fillStyle(C.aqua, 1)
    g.beginPath()
    g.moveTo(-half, -2)
    g.lineTo(half, -2)
    g.lineTo(hem, 26)
    g.lineTo(-hem, 26)
    g.closePath()
    g.fillPath()
    g.strokePath()

    g.fillStyle(C.yellow, 1)
    if (facing === 'up') {
        g.fillRoundedRect(-15, -2, 30, 24, 8)
        g.strokeRoundedRect(-15, -2, 30, 24, 8)
        g.lineStyle(2, C.yellowDark, 1)
        g.lineBetween(-11, 7, 11, 7)
        g.lineStyle(LINE, C.ink, 1)
    } else if (facing === 'side') {
        g.fillRoundedRect(-25, -2, 13, 22, 6)
        g.strokeRoundedRect(-25, -2, 13, 22, 6)
    } else {
        g.lineStyle(4, C.yellow, 1)
        g.lineBetween(-9, -2, -9, 10)
        g.lineBetween(9, -2, 9, 10)
        g.lineStyle(LINE, C.ink, 1)
    }

    const arms: [number, number][] =
        facing !== 'down'
            ? facing === 'side'
                ? [[4 + step * 3, 10]]
                : [[-18, 8], [18, 8]]
            : pose === 'happy'
              ? [[-21, -28], [21, -28]]
              : pose === 'oops'
                ? [[-7, -5], [7, -5]]
                : pose === 'show'
                  ? [[-10, 16], [10, 16]]
                  : [[-18, 8 + step * 2], [18, 8 - step * 2]]

    const head = { x: facing === 'side' ? 3 : 0, y: -16 }
    g.fillStyle(C.hair, 1)
    const bunX = facing === 'side' ? [-12, 14] : [-16, 16]
    bunX.forEach(x => {
        g.fillCircle(x, -34, 8)
        g.strokeCircle(x, -34, 8)
    })
    g.fillStyle(facing === 'up' ? C.hair : C.skin, 1)
    g.fillCircle(head.x, head.y, 20)
    g.strokeCircle(head.x, head.y, 20)

    if (facing !== 'up') {
        g.fillStyle(C.hair, 1)
        g.slice(head.x, head.y, 20, Math.PI, Math.PI * 2, false)
        g.fillPath()
        g.fillStyle(C.skin, 1)
        g.fillEllipse(head.x + (facing === 'side' ? 4 : 0), head.y - 1, 28, 11)
        const ex = facing === 'side' ? [head.x + 1, head.x + 13] : [-8, 8]
        const ey = head.y + 4
        if (pose === 'happy') {
            g.lineStyle(LINE, C.ink, 1)
            ex.forEach(x => {
                g.beginPath()
                g.arc(x, ey + 2, 4, Math.PI + 0.3, -0.3, false)
                g.strokePath()
            })
        } else if (pose === 'oops') {
            ex.forEach(x => {
                g.fillStyle(C.white, 1)
                g.fillCircle(x, ey, 5.5)
                g.lineStyle(2, C.ink, 1)
                g.strokeCircle(x, ey, 5.5)
                g.fillStyle(C.ink, 1)
                g.fillCircle(x, ey, 2.4)
            })
        } else {
            g.fillStyle(C.ink, 1)
            ex.forEach(x => g.fillEllipse(x, ey, 7, 9))
            g.fillStyle(C.white, 1)
            ex.forEach(x => g.fillCircle(x + 1.5, ey - 2.5, 1.8))
        }
        g.fillStyle(C.blush, 0.7)
        ex.forEach((x, i) => g.fillCircle(x + (i ? 5 : -5), ey + 8, 3.2))
        const mx = (ex[0] + ex[1]) / 2
        g.lineStyle(2.5, C.ink, 1)
        if (pose === 'happy') {
            g.fillStyle(C.pinkDark, 1)
            g.slice(mx, ey + 9, 5, 0, Math.PI, false)
            g.fillPath()
        } else if (pose !== 'oops') {
            g.beginPath()
            g.arc(mx, ey + 8, 4, 0.3, Math.PI - 0.3, false)
            g.strokePath()
        }
    }

    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(C.skin, 1)
    arms.forEach(([x, y]) => {
        g.fillCircle(x, y, 5.5)
        g.strokeCircle(x, y, 5.5)
    })

    if (pose === 'oops') {
        g.fillStyle(C.drop, 1)
        g.fillTriangle(24, -44, 19, -34, 29, -34)
        g.fillCircle(24, -33, 5)
        g.lineStyle(2, C.ink, 1)
        g.strokeCircle(24, -33, 5)
    }
}

export function createBia(scene: Phaser.Scene): BiaView {
    const body = scene.add.graphics()
    const art = scene.textures.exists(BIA_SHEET) ? scene.add.image(0, FEET, BIA_SHEET, BIA_CELL.idle) : null
    if (art) {
        body.fillStyle(C.shadow, A.shadow)
        body.fillEllipse(0, FEET, 46, 12)
    }
    const halo = scene.add.graphics({ x: 0, y: FEET })
    halo.fillStyle(C.white, 0.55)
    halo.fillEllipse(0, 0, BIA.halo.w, BIA.halo.h)
    halo.lineStyle(4, C.yellow, 1)
    halo.strokeEllipse(0, 0, BIA.halo.w, BIA.halo.h)
    const haloTween = scene.tweens.add({
        targets: halo,
        scaleX: 1.14,
        scaleY: 1.14,
        alpha: 0.75,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })
    const figure = scene.add.container(0, 0, art ? [body, art] : [body])
    const glow = scene.add.circle(BIA.shoulder.x, BIA.shoulder.y, 22, C.glow, 0.7)
    const container = scene.add.container(0, 0, [halo, figure, glow]).setDepth(DEPTH.bia)
    const glowTween = scene.tweens.add({
        targets: glow,
        alpha: 0.25,
        scale: 1.25,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })

    let facing: Facing = 'down'
    let flip = false
    let pose: BiaPose = 'idle'
    let walking = false
    let frame = 0
    let travel = 0
    let card: IdCard | null = null
    let trembleTween: Phaser.Tweens.Tween | undefined
    let trailOn = true
    let last: Point | null = null
    let dotIndex = 0
    const dots = new Set<Phaser.GameObjects.Arc>()

    const artCell = (): number => {
        if (!walking && pose === 'happy') return BIA_CELL.happy
        if (!walking && pose === 'oops') return BIA_CELL.oops
        if (!walking && pose === 'show') return BIA_CELL.show
        if (facing === 'up') return walking && frame ? BIA_CELL.upB : BIA_CELL.upA
        if (facing === 'side') return walking && !frame ? BIA_CELL.sideA : BIA_CELL.sideB
        return walking ? (frame ? BIA_CELL.downB : BIA_CELL.downA) : BIA_CELL.idle
    }

    const paint = () => {
        if (art) {
            const cell = artCell()
            art.setFrame(cell)
            art.setOrigin(BIA_ART.cx[cell] / BIA_ART.cell, BIA_ART.feet[cell] / BIA_ART.cell)
            art.setScale(BIA.h / BIA_ART.h)
            art.setFlipX(flip)
            return
        }
        paintBody(body, facing, walking ? 'walk' : pose, frame)
        body.setScale(flip ? -1 : 1, 1)
    }

    const puff = () => {
        const dust = scene.add
            .circle(container.x + Phaser.Math.Between(-10, 10), container.y + FEET, 6, C.white, 0.7)
            .setDepth(DEPTH.trail + 1)
        dots.add(dust)
        scene.tweens.add({
            targets: dust,
            scale: 2.2,
            alpha: 0,
            y: dust.y - 8,
            duration: 380,
            ease: 'Sine.easeOut',
            onComplete: () => {
                dots.delete(dust)
                dust.destroy()
            },
        })
    }

    const stride = (moved: number) => {
        if (!walking || moved <= 0) return
        travel += moved
        const next = Math.floor(travel / BIA.stride) % 2
        if (next !== frame) {
            frame = next
            paint()
            puff()
        }
        const phase = (travel / BIA.stride) * Math.PI
        figure.y = -Math.abs(Math.sin(phase)) * BIA.bob
        figure.angle = Math.sin(phase) * BIA.tilt
    }

    const settle = () => {
        scene.tweens.add({ targets: figure, y: 0, angle: 0, duration: 120, ease: 'Sine.easeOut' })
    }

    const makeCard = () => {
        card = createIdCard(scene, BIA.shoulder.x, BIA.shoulder.y, CARD.mini)
        card.container.setAngle(-10)
        container.add(card.container)
        glow.setVisible(true)
    }
    makeCard()
    paint()

    const dropDot = () => {
        if (!trailOn) return
        const dot = scene.add
            .circle(container.x, container.y + 26, 7, TRAIL[dotIndex++ % TRAIL.length], 0.95)
            .setDepth(DEPTH.trail)
        dots.add(dot)
        scene.tweens.add({
            targets: dot,
            alpha: 0,
            scale: 0.4,
            duration: BIA.trailMs,
            ease: 'Sine.easeIn',
            onComplete: () => {
                dots.delete(dot)
                dot.destroy()
            },
        })
    }

    const cardWorld = (): Point => {
        const m = (card?.container ?? glow).getWorldTransformMatrix()
        return { x: m.tx, y: m.ty }
    }

    const stopTremble = () => {
        trembleTween?.remove()
        trembleTween = undefined
        card?.container.setAngle(-10)
    }

    const moveTo = (x: number, y: number) => {
        stride(Phaser.Math.Distance.Between(container.x, container.y, x, y))
        container.setPosition(x, y)
        if (!last) last = { x, y }
        if (Phaser.Math.Distance.Between(last.x, last.y, x, y) >= BIA.trailGap) {
            last = { x, y }
            dropDot()
        }
    }

    const face = (dir: Dir) => {
        const next: Facing = dir === 'up' || dir === 'down' ? dir : 'side'
        const nextFlip = dir === 'left'
        if (next === facing && nextFlip === flip) return
        facing = next
        flip = nextFlip
        paint()
    }

    const setWalking = (on: boolean) => {
        if (on === walking) return
        walking = on
        frame = 0
        travel = 0
        paint()
        if (!on) settle()
    }

    return {
        container,
        get x() {
            return container.x
        },
        get y() {
            return container.y
        },
        setPosition: moveTo,
        place(x, y) {
            container.setPosition(x, y)
            last = { x, y }
        },
        async walkTo(points, speed) {
            for (const p of points) {
                const from = { x: container.x, y: container.y }
                const dx = p.x - from.x
                const dy = p.y - from.y
                const dist = Math.hypot(dx, dy)
                if (dist < 1) continue
                face(Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
                setWalking(true)
                const proxy = { k: 0 }
                await new Promise<void>(resolve =>
                    scene.tweens.add({
                        targets: proxy,
                        k: 1,
                        duration: (dist / speed) * 1000,
                        ease: 'Linear',
                        onUpdate: () => moveTo(from.x + dx * proxy.k, from.y + dy * proxy.k),
                        onComplete: () => resolve(),
                        onStop: () => resolve(),
                    }),
                )
                if (!container.active) return
            }
            setWalking(false)
        },
        face,
        setPose(next) {
            pose = next
            if (next !== 'idle') facing = 'down'
            if (next !== 'idle') flip = false
            paint()
        },
        setWalking,
        tremble(on) {
            if (!on) return stopTremble()
            if (trembleTween || !card) return
            trembleTween = scene.tweens.add({
                targets: card.container,
                angle: { from: -22, to: 4 },
                duration: 70,
                yoyo: true,
                repeat: -1,
            })
        },
        bump() {
            void FX.shake(scene, container, { amount: 4, times: 2 })
        },
        pulse() {
            scene.tweens.killTweensOf(figure)
            figure.setScale(1)
            scene.tweens.add({
                targets: figure,
                scaleX: 1.14,
                scaleY: 1.14,
                duration: 140,
                yoyo: true,
                repeat: 1,
            })
        },
        async shakeHead() {
            scene.tweens.killTweensOf(figure)
            await FX.to(scene, figure, { angle: 10 }, { duration: 90, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
            figure.setAngle(0)
        },
        hop() {
            const y = container.y
            return FX.to(scene, container, { y: y - 26 }, { duration: 180, yoyo: true, repeat: 1, ease: 'Sine.easeOut' }).then(
                () => {
                    container.y = y
                },
            )
        },
        cardWorld,
        takeCard() {
            stopTremble()
            if (!card) makeCard()
            const taken = card as IdCard
            const at = cardWorld()
            container.remove(taken.container)
            taken.container.setPosition(at.x, at.y).setDepth(DEPTH.flying)
            card = null
            glow.setVisible(false)
            return taken
        },
        resetCard() {
            stopTremble()
            if (card) return
            makeCard()
        },
        setCardVisible(on) {
            card?.container.setVisible(on)
            glow.setVisible(on && !!card)
        },
        setTrail(on) {
            trailOn = on
            halo.setVisible(on)
        },
        destroy() {
            glowTween.remove()
            haloTween.remove()
            stopTremble()
            dots.forEach(d => d.destroy())
            dots.clear()
            container.destroy()
        },
    }
}
