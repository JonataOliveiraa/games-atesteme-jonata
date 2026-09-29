import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, NEXT } from '../data/layout'
import { C } from '../data/theme'
import type { Art } from '../types'
import type { Audio } from './audio'
import type { Board } from './board'
import type { Ladder } from './ladder'

export interface Replay {
    play(states: Art[]): Promise<void>
    waitNext(): Promise<void>
    destroy(): void
}

const STEP_MS = 520

export function createReplay(
    scene: Phaser.Scene,
    deps: { board: Board; ladder: Ladder; audio: Audio },
): Replay {
    const r = NEXT.size / 2
    const art = scene.add.graphics()
    art.fillStyle(C.shadow, 0.18)
    art.fillCircle(3, 7, r)
    art.fillStyle(C.greenDark, 1)
    art.fillCircle(0, 4, r)
    art.fillStyle(C.green, 1)
    art.fillCircle(0, 0, r)
    art.lineStyle(5, C.ink, 1)
    art.strokeCircle(0, 0, r)
    art.fillStyle(C.white, 0.25)
    art.fillEllipse(-r * 0.25, -r * 0.5, r * 0.9, r * 0.32)
    art.fillStyle(C.white, 1)
    art.fillTriangle(-r * 0.28, -r * 0.42, -r * 0.28, r * 0.42, r * 0.46, 0)
    art.lineStyle(4, C.ink, 1)
    art.strokeTriangle(-r * 0.28, -r * 0.42, -r * 0.28, r * 0.42, r * 0.46, 0)
    const button = scene.add.container(NEXT.x, NEXT.y, [art]).setDepth(DEPTH.replay).setVisible(false)

    const zone = scene.add
        .zone(NEXT.x, NEXT.y, NEXT.size + 20, NEXT.size + 20)
        .setDepth(DEPTH.replay + 1)
        .setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = false

    let waiter: (() => void) | undefined
    let pulse: Phaser.Tweens.Tween | undefined

    const release = () => {
        const done = waiter
        waiter = undefined
        if (zone.input) zone.input.enabled = false
        pulse?.remove()
        pulse = undefined
        done?.()
    }

    const press = () => {
        if (!waiter) return
        deps.audio.tap()
        const done = waiter
        waiter = undefined
        if (zone.input) zone.input.enabled = false
        pulse?.remove()
        pulse = undefined
        button.setScale(1)
        void FX.press(scene, button).then(() =>
            FX.to(scene, button, { alpha: 0, scale: 0.6 }, { duration: 180 }).then(() => {
                if (button.active) button.setVisible(false).setAlpha(1).setScale(1)
            }),
        )
        done()
    }

    zone.on('pointerdown', press)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') press()
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        async play(states) {
            const { board, ladder, audio } = deps
            ladder.unlight()
            await FX.wait(scene, 300)
            for (let i = 0; i < states.length; i++) {
                ladder.light(i)
                audio.replay(i)
                await board.setFrame(states[i])
                await FX.wait(scene, STEP_MS - 370)
            }
            await FX.wait(scene, 300)
        },
        waitNext() {
            release()
            FX.kill(scene, button)
            button.setVisible(true).setAlpha(1).setScale(1)
            return new Promise<void>(resolve => {
                waiter = resolve
                void FX.popIn(scene, button, { from: 0.4 }).then(() => {
                    if (!waiter || !button.active) return
                    if (zone.input) zone.input.enabled = true
                    pulse = scene.tweens.add({
                        targets: button,
                        scale: 1.08,
                        duration: 520,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                    })
                })
            })
        },
        destroy() {
            release()
            scene.input.keyboard?.off('keydown', onKey)
            zone.destroy()
            button.destroy()
        },
    }
}
