import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import { BALL, DEPTH } from '../data/layout'
import { createMessage } from './message'
import { settled } from './timing'
import type { MediumId, Point, SubjectDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export function createBall(scene: Phaser.Scene) {
    const holder = scene.add.container(-500, -500).setDepth(DEPTH.ball)
    const pulse = scene.add.container(0, 0)
    const skin = scene.add.container(0, 0)
    const shade = scene.add.graphics()
    shade.fillStyle(C.ink, 0.22)
    shade.fillEllipse(0, BALL * 0.56, BALL * 0.62, BALL * 0.16)
    pulse.add([shade, skin])
    holder.add(pulse)

    let idle = false

    function fill(subject: SubjectDef, medium: MediumId) {
        skin.removeAll(true)
        skin.add(createMessage(scene, subject, medium, BALL))
    }

    function startIdle() {
        if (idle) return
        idle = true
        FX.breathe(scene, fx(pulse), { grow: 1.07, duration: 940 })
    }

    function stopIdle() {
        idle = false
        FX.kill(scene, fx(pulse))
        pulse.setScale(1)
    }

    return {
        at: (): Point => ({ x: holder.x, y: holder.y }),

        show(at: Point, subject: SubjectDef, medium: MediumId) {
            stopIdle()
            fill(subject, medium)
            holder.setPosition(at.x, at.y).setAlpha(1)
            skin.setAngle(0).setAlpha(1).setScale(0.4)
            void FX.to(scene, fx(skin), { scale: 1 },
                { duration: 340, ease: Ease.back(2.2) })
            startIdle()
        },

        async passTo(to: Point) {
            stopIdle()
            await settled(scene, FX.arcTo(scene, fx(holder), to, { height: 140, duration: 520 }), 520)
            holder.setPosition(to.x, to.y)
        },

        async spinInto(subject: SubjectDef, medium: MediumId) {
            stopIdle()
            skin.setAngle(0)
            await settled(scene, FX.to(scene, fx(skin),
                { angle: 200, scaleX: 0.02, scaleY: 1.14 },
                { duration: 300, ease: 'Sine.easeIn' }), 300)

            fill(subject, medium)
            skin.setAngle(200).setScale(0.02, 1.14)

            await settled(scene, FX.to(scene, fx(skin),
                { angle: 360, scaleX: 1, scaleY: 1 },
                { duration: 380, ease: Ease.back(2.4) }), 380)
            skin.setAngle(0).setScale(1)
            startIdle()
        },

        async drop(to: Point) {
            stopIdle()
            await settled(scene, FX.to(scene, fx(holder), { x: to.x, y: to.y + 34 },
                { duration: 260 }), 260)
            await settled(scene, FX.to(scene, fx(skin), { scale: 0.15, alpha: 0 },
                { duration: 320, ease: Ease.anticipate(1.6) }), 320)
            holder.setAlpha(0)
        },

        hide() {
            stopIdle()
            holder.setAlpha(0)
        },

        destroy() {
            stopIdle()
            holder.destroy()
        },
    }
}
