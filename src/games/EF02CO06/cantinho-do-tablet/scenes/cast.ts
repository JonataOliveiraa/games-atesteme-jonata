import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { ART, CAST, CAST_CELL, POSE } from '../data/files'
import { BETO, CAT, DEPTH, LIA, TABLE_TOP } from '../data/layout'
import type { Vec } from '../types'

export type LiaPose = 'wait' | 'yay' | 'scared' | 'point'

export interface Cast {
    readonly lia: Phaser.GameObjects.Sprite
    liaPose(pose: LiaPose): void
    catJump(to: Vec): Promise<void>
    catSniff(): Promise<void>
    catScare(): Promise<void>
    catHome(): Promise<void>
    betoRun(toX: number, ms: number): Promise<void>
    betoTrip(): Promise<void>
    betoOops(): Promise<void>
    betoLeave(): Promise<void>
    betoFoot(): Vec
    reset(): void
    destroy(): void
}

const LIA_FRAME: Record<LiaPose, number> = {
    wait: POSE.liaWait,
    yay: POSE.liaYay,
    scared: POSE.liaScared,
    point: POSE.liaPoint,
}

export function createCast(scene: Phaser.Scene): Cast {
    const lia = scene.add.sprite(LIA.x, LIA.footY, CAST, POSE.liaWait).setOrigin(0.5, ART.castFoot / CAST_CELL).setScale(LIA.scale).setDepth(DEPTH.actors)
    const cat = scene.add.sprite(CAT.x, CAT.footY, CAST, POSE.catSit).setOrigin(0.5, ART.castFoot / CAST_CELL).setScale(CAT.scale).setDepth(DEPTH.actors)
    const beto = scene.add.sprite(BETO.from, BETO.footY, CAST, POSE.betoRun).setOrigin(0.5, ART.castFoot / CAST_CELL).setScale(BETO.scale).setDepth(DEPTH.actors + 2)
    let idle: Phaser.Tweens.Tween | undefined

    const breathe = () => {
        idle?.stop()
        lia.setScale(LIA.scale)
        idle = scene.tweens.add({ targets: lia, scaleY: LIA.scale * 1.025, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }

    const arc = (target: Phaser.GameObjects.Sprite, to: Vec, ms: number, lift: number) => {
        const from = { x: target.x, y: target.y }
        return new Promise<void>(resolve =>
            scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: FX.ms(scene, ms),
                ease: 'Sine.easeInOut',
                onUpdate: tween => {
                    const t = tween.getValue() ?? 0
                    target.setPosition(Phaser.Math.Linear(from.x, to.x, t), Phaser.Math.Linear(from.y, to.y, t) - Math.sin(t * Math.PI) * lift)
                },
                onComplete: () => resolve(),
            }),
        )
    }

    const run = (toX: number, ms: number) => {
        const fromX = beto.x
        return new Promise<void>(resolve =>
            scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: FX.ms(scene, ms),
                onUpdate: tween => {
                    const t = tween.getValue() ?? 0
                    beto.setPosition(Phaser.Math.Linear(fromX, toX, t), BETO.footY - Math.abs(Math.sin(t * Math.PI * 7)) * 12)
                },
                onComplete: () => {
                    beto.setY(BETO.footY)
                    resolve()
                },
            }),
        )
    }

    breathe()

    return {
        lia,
        liaPose(pose) {
            idle?.stop()
            lia.setScale(LIA.scale).setFrame(LIA_FRAME[pose])
            void FX.impact(scene, lia, pose === 'scared' ? 0.12 : 0.08).then(breathe)
        },
        async catJump(to) {
            cat.setFrame(POSE.catJump)
            await arc(cat, { x: to.x, y: TABLE_TOP }, 560, 150)
            cat.setFrame(POSE.catSniff)
            await FX.impact(scene, cat, 0.14)
        },
        async catSniff() {
            await FX.to(scene, cat, { x: cat.x + CAT.sniffDX }, { duration: 360, ease: 'Sine.easeInOut' })
            await FX.to(scene, cat, { angle: -4 }, { duration: 140, yoyo: true })
        },
        async catScare() {
            cat.setFrame(POSE.catScared)
            await FX.to(scene, cat, { y: cat.y - 40 }, { duration: 160, yoyo: true, ease: 'Quad.easeOut' })
        },
        async catHome() {
            cat.setFrame(POSE.catJump).setFlipX(true)
            await arc(cat, { x: CAT.x, y: CAT.footY }, 520, 110)
            cat.setFlipX(false).setFrame(POSE.catSit)
            await FX.impact(scene, cat, 0.1)
        },
        async betoRun(toX, ms) {
            beto.setFrame(POSE.betoRun).setFlipX(false).setAngle(0)
            await run(toX, Math.max(ms, Math.abs(toX - beto.x) / 0.55))
        },
        async betoTrip() {
            beto.setFrame(POSE.betoTrip)
            await FX.to(scene, beto, { x: beto.x - 60, angle: -10 }, { duration: 300, ease: 'Quad.easeOut' })
            await FX.to(scene, beto, { angle: 0 }, { duration: 260, ease: Ease.spring(2, 6) })
        },
        async betoOops() {
            beto.setFrame(POSE.betoOops)
            await FX.impact(scene, beto, 0.12)
        },
        async betoLeave() {
            beto.setFrame(POSE.betoWave)
            await FX.impact(scene, beto, 0.1)
            await FX.wait(scene, 260)
            beto.setFrame(POSE.betoRun).setFlipX(true)
            await run(BETO.out, 700)
        },
        betoFoot: () => ({ x: beto.x + 10, y: beto.y - 6 }),
        reset() {
            ;[cat, beto].forEach(s => scene.tweens.killTweensOf(s))
            cat.setPosition(CAT.x, CAT.footY).setFrame(POSE.catSit).setFlipX(false).setAngle(0).setScale(CAT.scale)
            beto.setPosition(BETO.from, BETO.footY).setFrame(POSE.betoRun).setFlipX(false).setAngle(0).setScale(BETO.scale)
            lia.setFrame(POSE.liaWait)
            breathe()
        },
        destroy() {
            idle?.stop()
            ;[lia, cat, beto].forEach(s => {
                scene.tweens.killTweensOf(s)
                s.destroy()
            })
        },
    }
}
