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
    /** Quantas salas tem este nível: uma bolinha para cada. */
    rooms: number
    /** Em que nível a partida está, de 1 a 3. */
    level: number
    /** Quantos níveis o jogo tem. */
    levels: number
    onHelp(): void
    /** O tutorial desliga o `?`: ali ele não teria o que abrir. */
    help?: boolean
}

/** A missão nunca muda: é a frase que diz o que fazer sem citar peça nenhuma. */
export const MISSION = 'Leve o robô até a porta sem ser visto.'

/**
 * O HUD diz três coisas, da esquerda para a direita: EM QUE NÍVEL a criança
 * está, O QUE ela tem de fazer, e QUANTAS SALAS faltam neste nível. Sem número
 * de ponto, sem porcentagem — o nível é um selo, e as salas são bolinhas.
 */
export function createHud(scene: Phaser.Scene, options: HudOptions): Hud {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.62)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.sign, 0.9)
    bar.fillRect(0, HUD.h - 4, W, 4)
    root.add(bar)

    /* ── o selo do nível ─────────────────────────────────────────────────── */

    const badge = scene.add.graphics()
    const bx = HUD.levelX
    badge.fillStyle(C.ink, 1)
    badge.fillRoundedRect(bx - HUD.levelW / 2 - 3, HUD.cy - 27, HUD.levelW + 6, 54, 18)
    badge.fillStyle(C.sign, 1)
    badge.fillRoundedRect(bx - HUD.levelW / 2, HUD.cy - 24, HUD.levelW, 48, 16)
    badge.fillStyle(C.white, 0.22)
    badge.fillRoundedRect(bx - HUD.levelW / 2 + 8, HUD.cy - 18, HUD.levelW - 16, 12, 6)
    root.add(badge)

    const badgeText = scene.add
        .text(bx, HUD.cy - 1, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(badgeText)

    // Os níveis que faltam, em tracinhos: mostra que o jogo tem três.
    const track = scene.add.graphics()
    for (let i = 0; i < options.levels; i++) {
        const span = 26
        const x = bx - (options.levels * span) / 2 + i * span
        track.fillStyle(i < options.level ? C.sign : C.white, i < options.level ? 1 : 0.35)
        track.fillRoundedRect(x + 3, HUD.cy + 32, span - 6, 7, 3)
    }
    root.add(track)

    /* ── a missão ────────────────────────────────────────────────────────── */

    const mission = scene.add
        .text(HUD.missionX, HUD.cy, MISSION, {
            fontFamily: FONT.black,
            fontSize: '27px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    mission.setStroke(CSS.ink, 7)
    root.add(mission)

    /* ── as salas deste nível ────────────────────────────────────────────── */

    const dotX = (i: number) => HUD.dotX + (i - (options.rooms - 1) / 2) * HUD.dotGap

    const label = scene.add
        .text(HUD.dotX, HUD.cy - 26, 'SALAS', {
            fontFamily: FONT.black,
            fontSize: '15px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setAlpha(0.8)
    root.add(label)

    const dots = scene.add.graphics()
    const paint = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.rooms; i++) {
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dotX(i), HUD.cy + 8, HUD.dotR + 4)
            dots.fillStyle(i < done ? C.green : C.white, 1)
            dots.fillCircle(dotX(i), HUD.cy + 8, HUD.dotR)
        }
    }
    paint(0)
    root.add(dots)

    /* ── o `?` ───────────────────────────────────────────────────────────── */

    const showHelp = options.help !== false

    const help = scene.add.graphics()
    help.fillStyle(C.ink, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR + 4)
    help.fillStyle(C.sign, 1)
    help.fillCircle(HUD.helpX, HUD.cy, HUD.helpR)
    root.add(help)

    const mark = scene.add
        .text(HUD.helpX, HUD.cy - 1, '?', { fontFamily: FONT.black, fontSize: '32px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(mark)

    help.setVisible(showHelp)
    mark.setVisible(showHelp)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = showHelp
    zone.on('pointerdown', () => {
        void FX.press(scene, mark)
        options.onHelp()
    })

    return {
        setDone: paint,
        celebrate: async i => {
            paint(i + 1)
            await FX.ping(scene, dotX(i), HUD.cy + 8, C.green, { radius: 40 })
        },
        destroy: () => {
            zone.destroy()
            root.destroy(true)
        },
    }
}
