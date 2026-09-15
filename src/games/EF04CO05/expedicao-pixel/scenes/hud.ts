import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * O cabeçalho de ponta a ponta: pílula do NÍVEL e as bolinhas das rodadas à
 * esquerda, o nome do nível no meio, vidas e `?` à direita.
 *
 * Nenhum número de pontos, acertos ou porcentagem aparece aqui. O placar deste
 * jogo é o céu: cada fogo certo vira uma estrela que fica lá em cima.
 */

export interface HudOptions {
    level: number
    rounds: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(0x000000, 0.3)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.skyHigh, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.ink, 1)
    bar.fillRect(0, 0, W, HUD.h - 6)
    bar.fillStyle(C.white, 0.07)
    bar.fillRect(0, 0, W, 16)
    bar.fillStyle(C.warm, 1)
    bar.fillRect(0, HUD.h - 6, W, 4)
    root.add(bar)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.brassDeep, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.22)
    pill.fillRoundedRect(HUD.pillX + 13, HUD.pillY + 8, HUD.pillW - 26, 9, 5)
    root.add(pill)

    const levelText = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, `NÍVEL ${options.level}`, {
            fontFamily: FONT.black,
            fontSize: '19px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    levelText.setStroke(CSS.ink, 5)
    root.add(levelText)

    const dots = scene.add.graphics()
    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap
    const paintDots = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.rounds; i++) {
            const x = dotX(i)
            const on = i < done
            dots.fillStyle(C.ink, on ? 1 : 0.4)
            dots.fillCircle(x, HUD.cy, HUD.dotR + 3)
            dots.fillStyle(on ? C.warm : C.roof, 1)
            dots.fillCircle(x, HUD.cy, HUD.dotR)
            if (!on) continue
            // a rodada feita vira uma estrelinha, igual às do céu
            dots.fillStyle(C.white, 0.9)
            dots.fillCircle(x, HUD.cy, 5)
        }
    }
    paintDots(0)
    root.add(dots)

    const title = scene.add
        .text(HUD.titleX, HUD.cy, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.paper,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.ink, 5)
    root.add(title)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.35)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.warm, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.3)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '30px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

    // hitbox bem maior que o desenho: `?` pequeno num canto é o alvo que dedo
    // infantil mais erra
    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        void FX.press(scene, helpG)
        options.onHelp()
    })

    return {
        /** Some no lançamento e volta depois: a cena é do céu. */
        fade(to: number) {
            return FX.to(scene, root, { alpha: to }, { duration: to > 0 ? 280 : 240 })
        },

        setTitle(text: string) {
            title.setText(text)
        },

        setDone(done: number) {
            paintDots(done)
        },

        async celebrate(index: number) {
            paintDots(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.warm, { radius: 32, depth: DEPTH.hud + 2 })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
            zone.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
