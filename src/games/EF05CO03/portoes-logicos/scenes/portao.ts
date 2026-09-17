import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PORTAO_ART, SHEET, portaoScale } from '../data/art'
import { DEPTH, LANE_Y, PORTAO } from '../data/layout'
import { C } from '../data/theme'
import type { Lane } from '../types'

/**
 * O portão. Dois quadros, e o arco está na MESMA posição nos dois — quem se
 * mexe é só a folha da porta.
 *
 * Por isso a âncora é a base da CÉLULA, e não a caixa alfa: no quadro aberto a
 * porta escancarada desce 20 px a mais, e ancorar pelo alfa faria o arco inteiro
 * pular 20 px toda vez que alguém acertasse.
 */
export function createPortao(scene: Phaser.Scene, lane: Lane) {
    const y = LANE_Y[lane]
    const scale = portaoScale(PORTAO.h)

    const sprite = scene.add
        .sprite(PORTAO.cx, y + PORTAO_ART.footPad * scale, SHEET.portao, 0)
        .setOrigin(0.5, 1)
        .setScale(scale)
        .setDepth(DEPTH.portao)

    const largura = PORTAO_ART.boxW * scale

    // ── o cadeado da trava ───────────────────────────────────────────────
    const cadeado = scene.add.container(PORTAO.cx, y - PORTAO.h / 2).setDepth(DEPTH.portaoFolha).setVisible(false)
    const cg = scene.add.graphics()
    cg.fillStyle(C.ink, 0.25)
    cg.fillRoundedRect(-27, -22, 54, 58, 12)
    cg.lineStyle(9, C.inkSoft, 1)
    cg.beginPath()
    cg.arc(0, -16, 17, Math.PI, 0)
    cg.strokePath()
    cg.fillStyle(C.goldDark, 1)
    cg.fillRoundedRect(-30, -6, 60, 48, 12)
    cg.fillStyle(C.gold, 1)
    cg.fillRoundedRect(-26, -2, 52, 40, 9)
    cg.fillStyle(C.goldDark, 1)
    cg.fillCircle(0, 16, 7)
    cg.fillRect(-3, 16, 6, 13)
    cadeado.add(cg)

    let aberto = false

    return {
        get aberto() {
            return aberto
        },

        async abrir(som?: () => void) {
            if (aberto) return
            aberto = true
            som?.()
            sprite.setFrame(1)
            await FX.impact(scene, sprite, 0.08)
        },

        fechar() {
            aberto = false
            sprite.setFrame(0)
        },

        async travar() {
            cadeado.setVisible(true).setScale(0).setAlpha(1)
            await FX.to(scene, cadeado, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
            FX.float(scene, cadeado, { amount: 5, duration: 1100 })
        },

        async destravar() {
            if (!cadeado.visible) return
            FX.kill(scene, cadeado)
            await FX.to(scene, cadeado, { scale: 0, alpha: 0 }, { duration: 200 })
            cadeado.setVisible(false)
        },

        async piscar() {
            FX.breathe(scene, sprite, { grow: 1.07, duration: 620 })
        },

        pararPiscar() {
            FX.kill(scene, sprite)
            sprite.setScale(scale)
        },

        /** A boca do portão: para onde a criaturinha caminha e onde ela some. */
        boca() {
            return { x: PORTAO.cx, y }
        },

        bounds() {
            return { x: PORTAO.cx, y: y - PORTAO.h / 2 + 10, w: largura + 20, h: PORTAO.h + 40 }
        },

        destroy() {
            FX.kill(scene, sprite)
            FX.kill(scene, cadeado)
            cadeado.destroy(true)
            sprite.destroy()
        },
    }
}

export type Portao = ReturnType<typeof createPortao>
