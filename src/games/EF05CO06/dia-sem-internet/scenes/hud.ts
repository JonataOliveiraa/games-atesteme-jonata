import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Hud {
    setDone(n: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    /** Sai de cena quando a câmera manda — ver scenes/cinema.ts. */
    setShown(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    level: number
    phases: number
    onHelp(): void
}

export function createHud(scene: Phaser.Scene, options: HudOptions): Hud {
    const root = scene.add.container(0, 0).setScrollFactor(0)
.setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.shadow, 0.18)
    bar.fillRect(0, HUD.h, W, 8)
    bar.fillStyle(C.navyDeep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.navy, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.06)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.orange, 1)
    bar.fillRect(0, HUD.h - 5, W, 5)
    root.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.navyDeep, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, 16)
    pill.fillStyle(C.orange, 1)
    pill.fillRoundedRect(HUD.pillX + 3, HUD.pillY + 3, HUD.pillW - 6, HUD.pillH - 10, 13)
    root.add(pill)

    const pillText = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 2, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.creamSoft,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(pillText)

    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap

    const dots = scene.add.graphics()
    const paint = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.phases; i++) {
            dots.fillStyle(C.navyDeep, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR + 4)
            dots.fillStyle(i < done ? C.green : C.navySoft, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR)
        }
    }
    paint(0)
    root.add(dots)

    const help = scene.add.graphics()
    help.fillStyle(C.navyDeep, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR + 4)
    help.fillStyle(C.gold, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    help.fillStyle(C.white, 0.22)
    help.fillEllipse(HUD.helpX, HUD.cy - 12, HUD.helpR * 1.1, HUD.helpR * 0.5)
    root.add(help)

    const mark = scene.add
        .text(HUD.helpX, HUD.cy - 2, '?', { fontFamily: FONT.black, fontSize: '32px', color: CSS.navy })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(mark)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })

    zone.on(
        'pointerdown',
        (_p: Phaser.Input.Pointer, _x: number, _y: number, event?: Phaser.Types.Input.EventData) => {
            event?.stopPropagation?.()
            void FX.press(scene, fx(mark))
            options.onHelp()
        },
    )

    return {
        setDone: paint,

        celebrate: async index => {
            paint(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.green, { radius: 38 })
        },

        setShown: on => {
            FX.kill(scene, fx(root))
            scene.tweens.add({ targets: root, alpha: on ? 1 : 0, y: on ? 0 : -18, duration: 260, ease: "Sine.easeInOut" })
        },

        setHelpEnabled: on => {
            if (zone.input) zone.input.enabled = on
            help.setAlpha(on ? 1 : 0.4)
            mark.setAlpha(on ? 1 : 0.4)
        },

        destroy: () => {
            zone.destroy()
            root.destroy()
        },
    }
}
