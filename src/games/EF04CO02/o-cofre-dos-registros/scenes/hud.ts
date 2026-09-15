import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * O cabeçalho: a pílula do NÍVEL e os três ferrolhos à esquerda, o nome da
 * ficha no meio, vidas e `?` à direita.
 *
 * Os ferrolhos aparecem DUAS vezes no jogo — aqui e na porta da cápsula — e
 * isso é proposital. Num celular de 390 px a cápsula inteira mede 79 px, e um
 * ferrolho desenhado nela cairia para menos de 4 px reais: invisível. O do
 * cabeçalho é o que a criança realmente lê; o da porta é o que dá sentido à
 * cápsula abrindo.
 *
 * Nenhum número de pontos, acertos ou porcentagem aparece aqui: o §11 do
 * planejamento é explícito.
 */

function paintBolt(g: Phaser.GameObjects.Graphics, x: number, done: boolean) {
    const y = HUD.cy
    const r = HUD.dotR
    g.fillStyle(C.ink, done ? 1 : 0.4)
    g.fillCircle(x, y, r + 3)
    g.fillStyle(done ? C.green : C.hullDeep, 1)
    g.fillCircle(x, y, r)
    if (!done) {
        // o ferrolho fechado: um traço atravessado, como uma tranca
        g.lineStyle(4, C.hull, 1)
        g.beginPath()
        g.moveTo(x - 7, y)
        g.lineTo(x + 7, y)
        g.strokePath()
        return
    }
    g.lineStyle(4, C.white, 1)
    g.beginPath()
    g.moveTo(x - 6, y)
    g.lineTo(x - 2, y + 5)
    g.lineTo(x + 7, y - 5)
    g.strokePath()
}

export interface HudOptions {
    level: number
    phases: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.3)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.deep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.hullDeep, 1)
    bar.fillRect(0, 0, W, HUD.h - 7)
    bar.fillStyle(C.white, 0.1)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.aim, 1)
    bar.fillRect(0, HUD.h - 7, W, 4)
    root.add(bar)

    // a pílula do nível, no formato dominante do catálogo
    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.deep, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.aimDeep, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 13, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.28)
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
        for (let i = 0; i < options.phases; i++) paintBolt(dots, dotX(i), i < done)
    }
    paintDots(0)
    root.add(dots)

    const title = scene.add
        .text(HUD.titleX, HUD.cy, '', {
            fontFamily: FONT.black,
            fontSize: '25px',
            color: CSS.white,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.deep, 5)
    root.add(title)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.3)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.paper, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.paperDeep, 1)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '31px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

    // hitbox de 136 px, bem maior que o desenho: `?` pequeno num canto é o
    // alvo que dedo infantil mais erra
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
        setTitle(text: string) {
            title.setText(text)
        },

        setDone(done: number) {
            paintDots(done)
        },

        async celebrate(index: number) {
            paintDots(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.green, { radius: 34, depth: DEPTH.hud + 2 })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        helpBounds() {
            return { x: HUD.helpX, y: HUD.cy, w: 118, h: 118 }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
            zone.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
