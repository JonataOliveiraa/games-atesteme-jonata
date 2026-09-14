import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * O cabeçalho: as marcas de fase à esquerda, o nome da fase no meio, vidas e
 * `?` à direita.
 *
 * Nenhum ponto, porcentagem ou contagem de acertos aparece aqui — o §10 é
 * explícito. O que a criança lê como progresso são as três marcas acendendo.
 */

function paintMark(g: Phaser.GameObjects.Graphics, x: number, done: boolean) {
    const y = HUD.cy
    const r = HUD.dotR
    g.fillStyle(C.ink, done ? 1 : 0.4)
    g.fillCircle(x, y, r + 3)
    g.fillStyle(done ? C.good : C.wall, 1)
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
    phases: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.3)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.ink, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.curtain, 1)
    bar.fillRect(0, 0, W, HUD.h - 7)
    bar.fillStyle(C.white, 0.1)
    bar.fillRect(0, 0, W, 16)
    bar.fillStyle(C.outer, 1)
    bar.fillRect(0, HUD.h - 7, W, 4)
    root.add(bar)

    const marks = scene.add.graphics()
    const markX = (i: number) => HUD.dotX + i * HUD.dotGap
    const paintMarks = (done: number) => {
        marks.clear()
        for (let i = 0; i < options.phases; i++) paintMark(marks, markX(i), i < done)
    }
    paintMarks(0)
    root.add(marks)

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
    helpG.fillStyle(C.ink, 0.3)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.white, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.sheetDeep, 1)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '31px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

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
            paintMarks(done)
        },

        async celebrate(index: number) {
            paintMarks(index + 1)
            await FX.ping(scene, markX(index), HUD.cy, C.good, { radius: 34, depth: DEPTH.hud + 2 })
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
