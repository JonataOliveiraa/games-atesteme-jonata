import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    level: number
    goal: string
    rounds: number
    onHelp: () => void
}

export interface Hud {
    setDone(n: number): void
    dotPoint(i: number): { x: number; y: number }
    celebrate(i: number): Promise<void>
    destroy(): void
}

export function createHud(scene: Phaser.Scene, options: HudOptions): Hud {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.white, 0.06)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.band, 1)
    bar.fillRect(0, HUD.h - 5, W, 5)
    root.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.band, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.white, 0.22)
    pill.fillRoundedRect(HUD.pillX + 10, HUD.pillY + 7, HUD.pillW - 20, 10, 5)
    root.add(pill)

    const levelText = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '20px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    levelText.setStroke(CSS.ink, 5)
    root.add(levelText)

    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap

    const dots = scene.add.graphics()
    const paint = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.rounds; i++) {
            const x = dotX(i)
            const full = i < done
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(x, HUD.cy, HUD.dotR + 4)
            dots.fillStyle(full ? C.green : C.slate, full ? 1 : 0.5)
            dots.fillCircle(x, HUD.cy, HUD.dotR)
        }
    }
    paint(0)
    root.add(dots)

    // Discreto de propósito: é lembrete, não instrução. Quem ensina o gesto é
    // o tutorial, na hora em que o gesto aparece.
    const goal = scene.add
        .text(HUD.goalX, HUD.cy, options.goal, {
            fontFamily: FONT.body,
            fontSize: '21px',
            color: CSS.white,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0.72)
    root.add(goal)

    const help = scene.add.graphics()
    help.fillStyle(C.ink, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR + 4)
    help.fillStyle(C.amber, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    root.add(help)

    const helpMark = scene.add
        .text(HUD.helpX, HUD.cy - 1, '?', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpMark)

    const helpZone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    helpZone.on('pointerdown', () => {
        void FX.press(scene, helpMark)
        options.onHelp()
    })

    return {
        setDone: paint,
        dotPoint: i => ({ x: dotX(i), y: HUD.cy }),
        celebrate: async i => {
            paint(i + 1)
            await FX.ping(scene, dotX(i), HUD.cy, C.green, { radius: 40 })
        },
        destroy: () => {
            helpZone.destroy()
            root.destroy(true)
        },
    }
}
