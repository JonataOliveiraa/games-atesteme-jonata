import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * O cabeçalho de ponta a ponta: murais concluídos à esquerda, o nome do mural
 * no meio, vidas e `?` à direita.
 *
 * Nenhum número de pontos, acertos ou porcentagem aparece aqui — o §11 do
 * planejamento é explícito, e o que a criança deve ler como progresso é a
 * fachada que ela está construindo, não um placar.
 */

function paintDot(g: Phaser.GameObjects.Graphics, x: number, done: boolean) {
    const y = HUD.cy
    const r = HUD.dotR
    g.fillStyle(C.ink, done ? 1 : 0.4)
    g.fillCircle(x, y, r + 3)
    g.fillStyle(done ? C.green : C.wallDeep, 1)
    g.fillCircle(x, y, r)
    if (!done) return
    g.lineStyle(4, C.white, 1)
    g.beginPath()
    g.moveTo(x - 6, y)
    g.lineTo(x - 2, y + 5)
    g.lineTo(x + 7, y - 5)
    g.strokePath()
}

export interface HudOptions {
    murals: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.26)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.paintDeep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.paint, 1)
    bar.fillRect(0, 0, W, HUD.h - 7)
    bar.fillStyle(C.white, 0.14)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.aim, 1)
    bar.fillRect(0, HUD.h - 7, W, 4)
    root.add(bar)

    const dots = scene.add.graphics()
    const dotX = (i: number) => HUD.dotX + i * HUD.dotGap
    const paintDots = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.murals; i++) paintDot(dots, dotX(i), i < done)
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
    title.setStroke(CSS.ink, 5)
    root.add(title)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.26)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.white, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.wallDeep, 1)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '31px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

    // hitbox de 136 px: bem maior que o desenho, como pede o §7 — `?` pequeno
    // num canto é o alvo que dedo infantil mais erra
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
