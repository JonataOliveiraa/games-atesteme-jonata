import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BAY, BOARD, DEPTH, SEA_Y } from '../data/layout'
import type { BatherId } from '../types'
import { batherImage } from './art'
import { bayPos } from './beach'
import { makeBubble } from './bubble'

export interface BatherView {
    readonly id: BatherId
    readonly bay: number
    enter(delay: number): Promise<void>
    leave(text: string, onSplash: (x: number, y: number) => void): Promise<void>
    protest(text: string): Promise<void>
    exit(): Promise<void>
    destroy(): void
}

export function createBather(scene: Phaser.Scene, id: BatherId, bay: number): BatherView {
    const { x, feet } = bayPos(bay)
    const art = batherImage(scene, id, BAY.batherH)
    const body = scene.add.container(x, feet, [art]).setDepth(DEPTH.bather + bay)
    let bubble: Phaser.GameObjects.Container | undefined

    const say = (text: string) => {
        bubble?.destroy()
        const made = makeBubble(scene, text)
        const top = BOARD.y + BOARD.h / 2 + made.h / 2 + 8
        bubble = made.bubble.setPosition(x, Math.max(top, feet - BAY.batherH - made.h / 2 - 12)).setDepth(DEPTH.balloon - 1)
        bubble.setScale(0.5)
        void FX.to(scene, bubble, { scale: 1 }, { duration: 200, ease: 'Back.easeOut' })
    }

    return {
        id,
        bay,
        async enter(delay) {
            body.setScale(0.2).setAlpha(0)
            await FX.to(scene, body, { scale: 1, alpha: 1 }, { duration: 320, delay, ease: 'Back.easeOut' })
        },
        async leave(text, onSplash) {
            say(text)
            await FX.to(scene, body, { y: feet - 22 }, { duration: 140, yoyo: true, ease: 'Quad.easeOut' })
            await FX.wait(scene, 260)
            bubble?.destroy()
            bubble = undefined
            body.setDepth(DEPTH.running)
            const sea = { x: x + (x < 640 ? -30 : 30), y: SEA_Y + 4 }
            const hops = scene.tweens.add({ targets: art, y: -14, duration: 110, yoyo: true, repeat: -1 })
            await FX.to(scene, body, { x: sea.x, y: sea.y, scale: 0.42 }, { duration: 620, ease: 'Sine.easeIn' })
            hops.remove()
            onSplash(sea.x, sea.y)
            await FX.to(scene, body, { alpha: 0, y: sea.y + 10 }, { duration: 160 })
            body.setVisible(false)
        },
        async protest(text) {
            say(text)
            await FX.shake(scene, body, { amount: 8, times: 4 })
        },
        async exit() {
            bubble?.destroy()
            bubble = undefined
            if (!body.visible) return
            await FX.to(scene, body, { alpha: 0, scale: 0.7 }, { duration: 220 })
            body.setVisible(false)
        },
        destroy() {
            bubble?.destroy()
            body.destroy()
        },
    }
}
