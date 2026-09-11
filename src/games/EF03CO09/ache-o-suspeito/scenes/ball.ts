import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALL_BOX, BALL_FRAME, BALL_SHEET, fitInside, originOf, SHEET } from '../data/art'
import { BALL, DEPTH } from '../data/layout'
import { C } from '../data/theme'

const SIZE = 66
const FLIGHT_MS = 450

type Point = { x: number; y: number }

export function createBall(scene: Phaser.Scene) {
    const trail = scene.add.graphics().setDepth(DEPTH.trail)
    let sprite: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null = null
    let scaleBase = 1

    const drop = () => {
        if (!sprite) return
        scene.tweens.killTweensOf(sprite)
        sprite.destroy()
        sprite = null
        trail.clear()
    }

    const make = () => {
        if (!scene.textures.exists(SHEET.ball)) {
            const g = scene.add.graphics().setDepth(DEPTH.ball)
            g.fillStyle(C.ink, 1)
            g.fillCircle(0, 0, SIZE / 2 + 3)
            g.fillStyle(C.paper, 1)
            g.fillCircle(0, 0, SIZE / 2)
            scaleBase = 1
            return g
        }
        const box = BALL_BOX[BALL_FRAME.appearing]
        const image = scene.add.image(0, 0, SHEET.ball, BALL_FRAME.appearing).setDepth(DEPTH.ball)
        const origin = originOf(box, BALL_SHEET.frameWidth, BALL_SHEET.frameHeight)
        image.setOrigin(origin.x, origin.y)
        scaleBase = fitInside(box, SIZE, SIZE)
        return image
    }

    const setFrame = (frame: number) => {
        if (sprite instanceof Phaser.GameObjects.Image) sprite.setFrame(frame)
    }

    return {
        async launch(to: Point) {
            drop()
            const ball = make()
            sprite = ball
            ball.setPosition(BALL.x, BALL.y).setScale(0).setAngle(0)
            await FX.to(scene, ball, { scale: scaleBase }, { duration: 130, ease: 'Back.easeOut' })
            if (!ball.active) return

            const from = { x: BALL.x, y: BALL.y }
            const control = {
                x: (from.x + to.x) / 2 + (to.x - from.x) * 0.12,
                y: Math.min(from.y, to.y) - 190,
            }
            const dots: Point[] = []
            const step = { v: 0 }

            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: step,
                    v: 1,
                    duration: FX.ms(scene, FLIGHT_MS),
                    ease: 'Sine.easeIn',
                    onUpdate: () => {
                        if (!ball.active) return
                        const t = step.v
                        const inv = 1 - t
                        const x = inv * inv * from.x + 2 * inv * t * control.x + t * t * to.x
                        const y = inv * inv * from.y + 2 * inv * t * control.y + t * t * to.y
                        ball.setPosition(x, y).setAngle(t * 300)
                        setFrame(Math.floor(t * 8) % 2 ? BALL_FRAME.flyB : BALL_FRAME.flyA)
                        dots.push({ x, y })
                        if (dots.length > 14) dots.shift()
                        trail.clear()
                        dots.forEach((dot, i) => {
                            const k = i / dots.length
                            trail.fillStyle(C.cyan, 0.32 * k)
                            trail.fillCircle(dot.x, dot.y, 4 + 9 * k)
                        })
                    },
                    onComplete: () => resolve(),
                })
            })

            if (!ball.active) return
            setFrame(BALL_FRAME.impact)
            void FX.to(scene, trail, { alpha: 0 }, { duration: 220 }).then(() => {
                trail.clear()
                trail.setAlpha(1)
            })
            await FX.to(scene, ball, { scaleX: scaleBase * 1.18, scaleY: scaleBase * 0.8 }, { duration: 90, yoyo: true })
        },

        async bounceOff() {
            const ball = sprite
            if (!ball) return
            await FX.all(
                FX.arcTo(scene, ball, { x: ball.x - 70, y: ball.y + 230 }, { height: 60, duration: 460 }),
                FX.to(scene, ball, { angle: ball.angle + 180 }, { duration: 460 }),
            )
            await FX.to(scene, ball, { alpha: 0 }, { duration: 160 })
            drop()
        },

        async vanish() {
            const ball = sprite
            if (!ball) return
            await FX.to(scene, ball, { alpha: 0, scale: scaleBase * 1.4 }, { duration: 200 })
            drop()
        },

        destroy() {
            drop()
            scene.tweens.killTweensOf(trail)
            trail.destroy()
        },
    }
}

export type Ball = ReturnType<typeof createBall>
