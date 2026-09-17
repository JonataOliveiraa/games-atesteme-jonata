import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface Hud {
    setDone(n: number): void
    celebrate(i: number): Promise<void>
    destroy(): void
}

export interface HudOptions {
    laps: number
    onHelp(): void
}

export function createHud(scene: Phaser.Scene, options: HudOptions): Hud {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const dotX = (i: number) => W / 2 + (i - (options.laps - 1) / 2) * HUD.dotGap

    const dots = scene.add.graphics()
    const paint = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.laps; i++) {
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR + 4)
            dots.fillStyle(i < done ? C.green : C.white, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR)
        }
    }
    paint(0)
    root.add(dots)

    const help = scene.add.graphics()
    help.fillStyle(C.ink, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR + 4)
    help.fillStyle(C.rope, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    root.add(help)

    const mark = scene.add
        .text(HUD.helpX, HUD.cy - 1, '?', { fontFamily: FONT.black, fontSize: '32px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(mark)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => {
        void FX.press(scene, mark)
        options.onHelp()
    })

    return {
        setDone: paint,
        celebrate: async i => {
            paint(i + 1)
            await FX.ping(scene, dotX(i), HUD.cy, C.green, { radius: 44 })
        },
        destroy: () => {
            zone.destroy()
            root.destroy(true)
        },
    }
}
