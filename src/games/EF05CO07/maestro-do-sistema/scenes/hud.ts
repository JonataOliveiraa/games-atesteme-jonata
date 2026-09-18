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
    fases: number
    level: number
    levels: number
    onHelp(): void
}

/** A frase que nunca muda, e que não cita nenhuma peça do jogo. */
export const MISSION = 'Faça todos os programas tocarem.'

export function createHud(scene: Phaser.Scene, options: HudOptions): Hud {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.6)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.gold, 0.9)
    bar.fillRect(0, HUD.h - 4, W, 4)
    root.add(bar)

    const bx = HUD.levelX
    const badge = scene.add.graphics()
    badge.fillStyle(C.ink, 1)
    badge.fillRoundedRect(bx - HUD.levelW / 2 - 3, HUD.cy - 27, HUD.levelW + 6, 54, 18)
    badge.fillStyle(C.gold, 1)
    badge.fillRoundedRect(bx - HUD.levelW / 2, HUD.cy - 24, HUD.levelW, 48, 16)
    badge.fillStyle(C.white, 0.24)
    badge.fillRoundedRect(bx - HUD.levelW / 2 + 8, HUD.cy - 18, HUD.levelW - 16, 12, 6)
    root.add(badge)

    root.add(scene.add
        .text(bx, HUD.cy - 1, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black, fontSize: '26px', color: CSS.ink,
        })
        .setOrigin(0.5).setResolution(2))

    const track = scene.add.graphics()
    for (let i = 0; i < options.levels; i++) {
        const span = 26
        const x = bx - (options.levels * span) / 2 + i * span
        track.fillStyle(i < options.level ? C.gold : C.white, i < options.level ? 1 : 0.35)
        track.fillRoundedRect(x + 3, HUD.cy + 32, span - 6, 7, 3)
    }
    root.add(track)

    const mission = scene.add
        .text(HUD.missionX, HUD.cy, MISSION, {
            fontFamily: FONT.black, fontSize: '27px', color: CSS.white,
        })
        .setOrigin(0.5).setResolution(2)
    mission.setStroke(CSS.ink, 7)
    root.add(mission)

    const dotX = (i: number) => HUD.dotX + (i - (options.fases - 1) / 2) * HUD.dotGap

    const label = scene.add
        .text(HUD.dotX, HUD.cy - 26, 'MÚSICAS', {
            fontFamily: FONT.black, fontSize: '15px', color: CSS.white,
        })
        .setOrigin(0.5).setResolution(2).setAlpha(0.8)
    root.add(label)

    const dots = scene.add.graphics()
    const paint = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.fases; i++) {
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dotX(i), HUD.cy + 8, HUD.dotR + 4)
            dots.fillStyle(i < done ? C.gold : C.white, 1)
            dots.fillCircle(dotX(i), HUD.cy + 8, HUD.dotR)
        }
    }
    paint(0)
    root.add(dots)

    const help = scene.add.graphics()
    help.fillStyle(C.ink, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR + 4)
    help.fillStyle(C.gold, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    root.add(help)

    const mark = scene.add
        .text(HUD.helpX, HUD.cy - 1, '?', { fontFamily: FONT.black, fontSize: '32px', color: CSS.ink })
        .setOrigin(0.5).setResolution(2)
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
            await FX.ping(scene, dotX(i), HUD.cy + 8, C.gold, { radius: 40 })
        },
        destroy: () => {
            zone.destroy()
            root.destroy(true)
        },
    }
}
