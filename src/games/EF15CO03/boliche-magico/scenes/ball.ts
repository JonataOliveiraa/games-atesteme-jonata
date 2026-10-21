import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALL_BODY_CELL, BALL_SHEET, ballFaceCell, cellKey, sheetScale } from '../data/files'
import { BALL, GAUGE, LANE, WD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { BallFace, Power, Vec } from '../types'
import { SPARK, baked } from './art'
import type { View } from './view'

export interface Ball {
    place(x: number): void
    rollTo(x: number, ms: number, ease?: string): Promise<void>
    setFace(f: BallFace): void
    exit(): Promise<void>
    comeBack(): Promise<void>
    cheer(): Promise<void>
    windUp(): Promise<void>
    wobble(t: number): void
    setPower(p: Power | null): void
    readonly power: Power | null
    readonly x: number
    readonly y: number
    head(): Vec
    destroy(): void
}

const SHADOW = 'bm-ball-shadow'

export function createBall(scene: Phaser.Scene, view: View, onRoll: (ms: number) => void): Ball {
    baked(scene, SHADOW, 110, 20, g => {
        g.fillStyle(C.shadow, 0.24)
        g.fillEllipse(55, 10, 110, 20)
    })
    const y = LANE.floor - BALL.r + 2
    const s = ((BALL.r * 2) / BALL.body) * sheetScale(scene, BALL_SHEET)
    const body = scene.add.image(0, 0, BALL_SHEET.key, cellKey(BALL_BODY_CELL)).setScale(s)
    const face = scene.add.image(0, 0, BALL_SHEET.key, cellKey(ballFaceCell('normal'))).setScale(s)
    const box = view.add(scene.add.container(BALL.x, y, [body, face]), WD.ball)
    const shadow = view.add(scene.add.image(BALL.x, LANE.floor + 2, SHADOW), WD.shadow)
    const spin = () => body.setRotation(box.x / BALL.r)
    const SPEED: Record<Power, number> = { weak: 1.25, good: 1, max: 0.78 }
    let power: Power | null = null
    let lastTrail = 0
    const trail = () => {
        if (!power || power === 'weak') return
        if (Math.abs(box.x - lastTrail) < (power === 'max' ? 22 : 34)) return
        lastTrail = box.x
        const big = power === 'max'
        const p = view.add(
            scene.add
                .image(box.x - BALL.r * 0.5, y + Phaser.Math.Between(-BALL.r * 0.6, BALL.r * 0.6), SPARK)
                .setScale(big ? Phaser.Math.FloatBetween(0.9, 1.4) : 0.6)
                .setAlpha(big ? 1 : 0.8)
                .setTint(big ? C.max : C.white),
            WD.fx,
        )
        void FX.to(scene, p, { alpha: 0, scale: 0.2, y: p.y - (big ? 24 : 10), angle: 120 }, { duration: big ? 520 : 380 }).then(() => p.destroy())
    }

    const place = (x: number) => {
        scene.tweens.killTweensOf([box, shadow])
        box.setPosition(x, y).setAlpha(1).setScale(1).setAngle(0)
        shadow.setPosition(x, LANE.floor + 2).setAlpha(1).setScale(1)
        spin()
    }

    const rollTo = (x: number, ms: number, ease = 'Sine.easeInOut') => {
        scene.tweens.killTweensOf(box)
        const k = power ? SPEED[power] : 1
        if (ms > 120) onRoll(ms * k)
        lastTrail = box.x
        return new Promise<void>(resolve => {
            scene.tweens.add({
                targets: box,
                x,
                duration: FX.ms(scene, ms * k),
                ease,
                onUpdate: () => {
                    spin()
                    shadow.setX(box.x)
                    trail()
                },
                onComplete: () => resolve(),
            })
        })
    }

    return {
        place,
        rollTo,
        setFace(f) {
            face.setFrame(cellKey(ballFaceCell(f)))
        },
        async exit() {
            await rollTo(BALL.exitX, TIMING.back, 'Sine.easeIn')
            shadow.setAlpha(0)
        },
        async comeBack() {
            place(BALL.mouthX)
            box.setAlpha(0).setScale(0.7)
            shadow.setAlpha(0)
            const rolling = rollTo(BALL.x, TIMING.back, 'Back.easeOut')
            void FX.to(scene, box, { alpha: 1, scale: 1 }, { duration: 260 })
            void FX.to(scene, shadow, { alpha: 1 }, { duration: 260 })
            await rolling
            box.setAlpha(1).setScale(1)
        },
        async cheer() {
            await FX.to(scene, box, { y: y - 30 }, { duration: 180, ease: 'Quad.easeOut', yoyo: true })
            box.setY(y)
        },
        async windUp() {
            face.setFrame(cellKey(ballFaceCell('power')))
            await FX.to(scene, box, { x: BALL.x - GAUGE.back, scaleX: 0.94, scaleY: 1.06 }, { duration: 260, ease: 'Sine.easeOut' })
            shadow.setX(box.x)
            spin()
        },
        wobble(t) {
            const a = t * 5
            box.setAngle(Phaser.Math.FloatBetween(-a, a))
            body.setTint(Phaser.Display.Color.GetColor(255, Math.round(255 - t * 40), Math.round(255 - t * 70)))
        },
        setPower(p) {
            power = p
            box.setAngle(0).setScale(1)
            body.clearTint()
        },
        get power() {
            return power
        },
        get x() {
            return box.x
        },
        get y() {
            return box.y
        },
        head() {
            return view.toScreen(box.x, box.y - BALL.r)
        },
        destroy() {
            scene.tweens.killTweensOf([box, shadow])
            box.destroy()
            shadow.destroy()
        },
    }
}
