import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Edge, Station } from '../types'

/**
 * O fim do nível: a cidade some e sobra o grafo.
 *
 * O mundo é maior que a tela, então o desenho é REDUZIDO até caber inteiro —
 * mas em coordenada de tela, não mexendo na câmera. Mexer na câmera parecia o
 * caminho óbvio e deu errado: com zoom, o véu e a legenda (que são presos à
 * tela) encolhem junto, e o véu vira um retângulo no meio do mapa.
 */
export function createDiagram(scene: Phaser.Scene) {
    const veil = scene.add.graphics().setDepth(DEPTH.diagram).setScrollFactor(0).setAlpha(0)
    veil.fillStyle(C.ink, 0.94)
    veil.fillRect(0, 0, W, H)

    const lines = scene.add.graphics().setDepth(DEPTH.diagram + 1).setScrollFactor(0).setAlpha(0)
    const dots = scene.add.graphics().setDepth(DEPTH.diagram + 2).setScrollFactor(0).setAlpha(0)

    const caption = scene.add
        .text(W / 2, H - 88, '', {
            fontFamily: FONT.black,
            fontSize: '32px',
            color: CSS.disc,
            align: 'center',
            wordWrap: { width: 980 },
        })
        .setOrigin(0.5)
        .setDepth(DEPTH.diagram + 3)
        .setScrollFactor(0)
        .setResolution(2)
        .setAlpha(0)

    return {
        async show(world: { w: number; h: number }, stations: Station[], edges: Edge[], text: string) {
            const scale = Math.min((W - 220) / world.w, (H - 320) / world.h)
            const at = (s: { x: number; y: number }) => ({
                x: W / 2 + (s.x - world.w / 2) * scale,
                y: 300 + (s.y - world.h / 2) * scale,
            })
            const byId = new Map(stations.map(s => [s.id, s]))

            lines.clear()
            dots.clear()
            caption.setText('')

            await FX.to(scene, veil, { alpha: 1 }, { duration: 620 })
            lines.setAlpha(1)
            dots.setAlpha(1)

            for (const edge of edges) {
                const a = byId.get(edge.a)
                const b = byId.get(edge.b)
                if (!a || !b) continue
                const pa = at(a)
                const pb = at(b)
                lines.lineStyle(14, C.amber, 1)
                lines.lineBetween(pa.x, pa.y, pb.x, pb.y)
                await FX.wait(scene, 150)
            }

            for (const station of stations) {
                const p = at(station)
                dots.fillStyle(C.disc, 1)
                dots.fillCircle(p.x, p.y, 34)
                dots.fillStyle(C.ink, 1)
                dots.fillCircle(p.x, p.y, 24)
                dots.fillStyle(C.disc, 1)
                dots.fillCircle(p.x, p.y, 17)
                await FX.wait(scene, 110)
            }

            caption.setText(text)
            caption.setAlpha(1)
            FX.popIn(scene, caption)
            await FX.wait(scene, 2200)
        },

        async hide() {
            await FX.all(
                FX.to(scene, veil, { alpha: 0 }, { duration: 360 }),
                FX.to(scene, lines, { alpha: 0 }, { duration: 360 }),
                FX.to(scene, dots, { alpha: 0 }, { duration: 360 }),
                FX.to(scene, caption, { alpha: 0 }, { duration: 360 }),
            )
        },

        destroy() {
            FX.kill(scene, veil)
            veil.destroy()
            lines.destroy()
            dots.destroy()
            caption.destroy()
        },
    }
}

export type Diagram = ReturnType<typeof createDiagram>
