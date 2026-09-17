import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export const TITLE = 'Diga quem faz o quê'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Hud {
    setDone(n: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    destroy(): void
}

export interface HudOptions {
    level: number
    machines: number
    onHelp(): void
}

export function createHud(scene: Phaser.Scene, options: HudOptions): Hud {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.shadow, 0.22)
    bar.fillRect(0, HUD.h, W, 8)
    bar.fillStyle(C.ink, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.inkSoft, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.07)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.cyan, 1)
    bar.fillRect(0, HUD.h - 5, W, 4)
    root.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, 16)
    pill.fillStyle(C.cyan, 1)
    pill.fillRoundedRect(HUD.pillX + 3, HUD.pillY + 3, HUD.pillW - 6, HUD.pillH - 10, 13)
    root.add(pill)

    const pillText = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 2, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(pillText)

    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap

    const dots = scene.add.graphics()
    const paint = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.machines; i++) {
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR + 4)
            dots.fillStyle(i < done ? C.green : C.screen, 1)
            dots.fillCircle(dotX(i), HUD.cy, HUD.dotR)
        }
    }
    paint(0)
    root.add(dots)

    const title = scene.add
        .text(HUD.titleX, HUD.cy - 2, TITLE, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.title}px`,
            color: CSS.white,
            align: 'center',
            wordWrap: { width: HUD.titleW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.ink, 6)
    root.add(title)

    const help = scene.add.graphics()
    help.fillStyle(C.ink, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR + 4)
    help.fillStyle(C.gold, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    help.fillStyle(C.white, 0.22)
    help.fillEllipse(HUD.helpX, HUD.cy - 12, HUD.helpR * 1.1, HUD.helpR * 0.5)
    root.add(help)

    const mark = scene.add
        .text(HUD.helpX, HUD.cy - 2, '?', { fontFamily: FONT.black, fontSize: '32px', color: CSS.ink })
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
        (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event?: Phaser.Types.Input.EventData) => {
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

        setHelpEnabled: on => {
            if (zone.input) zone.input.enabled = on
        },

        destroy: () => {
            FX.kill(scene, root)
            zone.destroy()
            root.destroy(true)
        },
    }
}
