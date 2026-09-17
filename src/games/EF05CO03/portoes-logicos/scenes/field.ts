import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { SHEET, SMALL, TALL_H } from '../data/art'
import { DEPTH, H, LANE_Y, MARCO, PORTAO, TRACK, W } from '../data/layout'
import { C } from '../data/theme'
import type { Lane } from '../types'

/**
 * O campo: o cenário, a fita da trilha e o marco de altura.
 *
 * A fita é `Graphics` e não parte do PNG porque é POR CIMA DELA que a
 * criaturinha anda — um caminho pintado no fundo nunca bate no pixel com o
 * tween, e a criança vê o pé fora do chão. Aqui o desenho e o trajeto saem da
 * mesma curva.
 */
export function createField(scene: Phaser.Scene) {
    const bg = scene.add.image(W / 2, H / 2, SHEET.campo).setDepth(DEPTH.bg)
    const cover = Math.max(W / bg.width, H / bg.height)
    bg.setScale(cover)

    // ── os trajetos ──────────────────────────────────────────────────────
    // Um braço por raia: sai da bifurcação, curva para a altura da raia e segue
    // reto até a boca do portão.
    const armOf = (lane: Lane) => {
        const y = LANE_Y[lane]
        const path = new Phaser.Curves.Path()
        path.add(
            new Phaser.Curves.QuadraticBezier(
                new Phaser.Math.Vector2(TRACK.forkX, TRACK.y),
                new Phaser.Math.Vector2(TRACK.bendX - 34, TRACK.y),
                new Phaser.Math.Vector2(TRACK.bendX, y),
            ),
        )
        path.lineTo(PORTAO.cx, y)
        return path
    }

    const arms: Record<Lane, Phaser.Curves.Path> = { cima: armOf('cima'), baixo: armOf('baixo') }

    // ── a fita ───────────────────────────────────────────────────────────
    const trilha = scene.add.graphics().setDepth(DEPTH.trilha)

    const ribbon = (pts: Phaser.Math.Vector2[]) => {
        trilha.lineStyle(TRACK.w, C.trilhaDark, 1)
        trilha.strokePoints(pts, false, false)
        trilha.lineStyle(TRACK.w - 12, C.trilha, 1)
        trilha.strokePoints(pts, false, false)
    }

    const cap = (x: number, y: number) => {
        trilha.fillStyle(C.trilhaDark, 1)
        trilha.fillCircle(x, y, TRACK.w / 2)
        trilha.fillStyle(C.trilha, 1)
        trilha.fillCircle(x, y, TRACK.w / 2 - 6)
    }

    const main: Phaser.Math.Vector2[] = [
        new Phaser.Math.Vector2(TRACK.ribbonX, TRACK.y),
        new Phaser.Math.Vector2(TRACK.forkX + 30, TRACK.y),
    ]

    ribbon(main)
    ;(['cima', 'baixo'] as Lane[]).forEach(lane => ribbon(arms[lane].getPoints(48)))
    ;(['cima', 'baixo'] as Lane[]).forEach(lane => cap(PORTAO.cx, LANE_Y[lane]))

    // Pedrinhas: o mínimo de vida sem virar textura, e sempre fora do trajeto.
    trilha.fillStyle(C.trilhaDark, 0.45)
    ;[
        [120, 424],
        [232, 458],
        [300, 420],
        [548, 292],
        [640, 332],
        [742, 300],
        [548, 590],
        [660, 552],
        [760, 588],
    ].forEach(([x, y]) => trilha.fillCircle(x, y, 5))

    // ── o marco de altura ────────────────────────────────────────────────
    // Sem um padrão físico ao lado, "pequena" depende de comparar com uma
    // criaturinha que já saiu da tela. O traço fica exatamente entre as duas
    // alturas do jogo, então a leitura é direta: passou do traço, é grande.
    const limite = MARCO.baseY - (TALL_H * SMALL + TALL_H) / 2
    const marco = scene.add.container(MARCO.x, 0).setDepth(DEPTH.marco).setVisible(false)

    const poste = scene.add.graphics()
    const halfW = 13
    poste.fillStyle(C.madeiraDark, 1)
    poste.fillRoundedRect(-halfW - 3, MARCO.baseY - MARCO.h - 3, (halfW + 3) * 2, MARCO.h + 6, 10)
    poste.fillStyle(C.cream, 1)
    poste.fillRoundedRect(-halfW, MARCO.baseY - MARCO.h, halfW * 2, MARCO.h, 8)

    for (let i = 0; i < 5; i++) {
        const y = MARCO.baseY - MARCO.h + 8 + i * 25
        poste.fillStyle(i % 2 === 0 ? C.nao : C.cream, 1)
        poste.fillRect(-halfW, y, halfW * 2, 13)
    }

    poste.fillStyle(C.gold, 1)
    poste.fillRoundedRect(-halfW - 2, limite - 6, halfW * 2 + 74, 12, 6)
    poste.fillStyle(C.goldDark, 1)
    poste.fillRoundedRect(-halfW - 2, limite + 2, halfW * 2 + 74, 4, 2)
    poste.fillStyle(C.goldDark, 1)
    poste.fillTriangle(halfW + 60, limite - 6, halfW + 72, limite, halfW + 60, limite + 6)

    marco.add(poste)

    return {
        /** O trajeto de cada raia, da bifurcação à boca do portão. */
        caminho(lane: Lane) {
            return arms[lane]
        },

        async mostrarMarco(value: boolean) {
            if (marco.visible === value) return
            if (!value) {
                marco.setVisible(false)
                return
            }
            marco.setVisible(true).setAlpha(0)
            await FX.to(scene, marco, { alpha: 1 }, { duration: 320 })
        },

        marcoBounds() {
            return { x: MARCO.x + 24, y: MARCO.baseY - MARCO.h / 2, w: 150, h: MARCO.h + 40 }
        },

        destroy() {
            FX.kill(scene, marco)
            marco.destroy(true)
            trilha.destroy()
            bg.destroy()
        },
    }
}

export type Field = ReturnType<typeof createField>
