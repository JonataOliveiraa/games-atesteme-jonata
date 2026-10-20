import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALL_BODY_CELL, BALL_SHEET, ballFaceCell, cellKey, sheetScale } from '../data/files'
import { BALL, LANE, WD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { BallFace, Vec } from '../types'
import { baked } from './art'
import type { View } from './view'

export interface Ball {
    place(x: number): void
    rollTo(x: number, ms: number, ease?: string): Promise<void>
    setFace(f: BallFace): void
    exit(): Promise<void>
    comeBack(): Promise<void>
    cheer(): Promise<void>
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

    const place = (x: number) => {
        scene.tweens.killTweensOf([box, shadow])
        box.setPosition(x, y).setAlpha(1).setScale(1)
        shadow.setPosition(x, LANE.floor + 2).setAlpha(1).setScale(1)
        spin()
    }

    const rollTo = (x: number, ms: number, ease = 'Sine.easeInOut') => {
        scene.tweens.killTweensOf(box)
        if (ms > 120) onRoll(ms)
        return new Promise<void>(resolve => {
            scene.tweens.add({
                targets: box,
                x,
                duration: FX.ms(scene, ms),
                ease,
                onUpdate: () => {
                    spin()
                    shadow.setX(box.x)
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
            void FX.to(scene, box, { alpha: 1, scale: 1 }, { duration: 260 })
            void FX.to(scene, shadow, { alpha: 1 }, { duration: 260 })
            await rollTo(BALL.x, TIMING.back, 'Back.easeOut')
        },
        async cheer() {
            await FX.to(scene, box, { y: y - 30 }, { duration: 180, ease: 'Quad.easeOut', yoyo: true })
            box.setY(y)
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
