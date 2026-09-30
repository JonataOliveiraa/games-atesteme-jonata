import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MACHINE as MACHINE_KEY, MACHINE_ART } from '../data/files'
import { DEPTH, MACHINE } from '../data/layout'
import { C } from '../data/theme'
import type { Point } from '../types'
import type { Audio } from './audio'
import { circle, rr } from './paint'

export interface Machine {
    readonly hatch: Point
    insertCoin(): Promise<void>
    openHatch(): Promise<void>
    closeHatch(): Promise<void>
    destroy(): void
}

export function createMachine(scene: Phaser.Scene, audio: Audio): Machine {
    const s = MACHINE.scale
    const left = MACHINE.x - (MACHINE_ART.w * s) / 2
    const top = MACHINE.foot - MACHINE_ART.h * s
    const at = (p: { x: number; y: number }) => ({ x: left + p.x * s, y: top + p.y * s })
    const slot = at(MACHINE_ART.slot)
    const hatch = at(MACHINE_ART.hatch)
    const hw = MACHINE_ART.hatch.w * s
    const hh = MACHINE_ART.hatch.h * s

    const image = scene.add.image(MACHINE.x, MACHINE.foot, MACHINE_KEY).setOrigin(0.5, 1).setScale(s).setDepth(DEPTH.machine)

    const hole = scene.add.graphics().setDepth(DEPTH.hatch).setVisible(false)
    hole.fillStyle(C.shadow, 0.85)
    hole.fillRoundedRect(hatch.x - hw / 2, hatch.y - hh / 2, hw, hh, 10)

    const doorArt = scene.add.graphics()
    rr(doorArt, -hw / 2, 0, hw, hh, 10, C.coral, 4)
    const door = scene.add.container(hatch.x, hatch.y - hh / 2, [doorArt]).setDepth(DEPTH.hatch + 1).setVisible(false)

    const coinArt = scene.add.graphics()
    circle(coinArt, 0, 0, 16, C.gold, 4)
    circle(coinArt, 0, 0, 8, C.goldDark, 0)
    const coin = scene.add.container(slot.x, slot.y - 100, [coinArt]).setDepth(DEPTH.hatch + 2).setAlpha(0)

    const glow = async () => {
        for (let i = 0; i < 3; i++) {
            image.setTint(0xfff3c4)
            await FX.wait(scene, 90)
            image.clearTint()
            await FX.wait(scene, 90)
        }
    }

    return {
        hatch,
        async insertCoin() {
            coin.setPosition(slot.x, slot.y - 100).setScale(1).setAlpha(0)
            await FX.to(scene, coin, { alpha: 1 }, { duration: 120 })
            await FX.to(scene, coin, { y: slot.y }, { duration: 300, ease: 'Quad.easeIn' })
            audio.coin()
            await FX.to(scene, coin, { scaleX: 0.15, alpha: 0 }, { duration: 140 })
            audio.whirr()
            await Promise.all([glow(), FX.shake(scene, image, { amount: 4, times: 4 })])
        },
        async openHatch() {
            hole.setVisible(true)
            door.setVisible(true).setScale(1, 1)
            await FX.to(scene, door, { scaleY: -0.35 }, { duration: 220, ease: 'Back.easeOut' })
        },
        async closeHatch() {
            await FX.to(scene, door, { scaleY: 1 }, { duration: 200, ease: 'Quad.easeIn' })
            hole.setVisible(false)
            door.setVisible(false)
        },
        destroy() {
            coin.destroy()
            door.destroy()
            hole.destroy()
            image.destroy()
        },
    }
}
