import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { RECORTE, SHEET, scaleOf } from '../data/art'
import { DEPTH, FILA } from '../data/layout'
import { C, COR } from '../data/theme'
import type { Criatura } from '../types'

/**
 * A fila da onda, no canto de baixo. É o único indicador de progresso dentro da
 * partida: quantas ainda faltam. Não tem número — a fila encurtando já é a
 * contagem, e um `3 de 8` seria um texto a mais para ler.
 */
export function createFila(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.fila)
    let itens: Phaser.GameObjects.Container[] = []

    const desenhar = (c: Criatura, index: number) => {
        const item = scene.add.container(FILA.x + index * FILA.gap, FILA.y)

        const cor = COR[c.cor]
        const halo = scene.add.graphics()
        halo.fillStyle(cor.line, 0.3)
        halo.fillEllipse(0, 2, 40, 13)
        item.add(halo)

        const escala = scaleOf(c.pequena) * (FILA.h / 118)
        const sprite = scene.add
            .sprite(0, RECORTE[c.frame].footPad * escala, SHEET.criaturinhas, c.frame)
            .setOrigin(RECORTE[c.frame].originX, 1)
            .setScale(escala)
        item.add(sprite)

        root.add(item)
        return item
    }

    return {
        montar(turma: Criatura[]) {
            itens.forEach(i => i.destroy(true))
            itens = turma.map((c, i) => desenhar(c, i))
            itens.forEach((item, i) => {
                item.setAlpha(0).setY(FILA.y + 26)
                scene.tweens.add({
                    targets: item,
                    alpha: 1,
                    y: FILA.y,
                    delay: FX.ms(scene, i * 55),
                    duration: FX.ms(scene, 280),
                    ease: 'Back.easeOut',
                })
            })
        },

        /** A primeira sai para a trilha e as outras andam uma casa. */
        async chamarPrimeira() {
            const saindo = itens.shift()
            if (!saindo) return
            await FX.to(scene, saindo, { alpha: 0, y: FILA.y - 30 }, { duration: 220 })
            saindo.destroy(true)
            await FX.all(
                ...itens.map((item, i) =>
                    FX.to(scene, item, { x: FILA.x + i * FILA.gap }, { duration: 240, ease: 'Sine.easeOut' }),
                ),
            )
        },

        get restantes() {
            return itens.length
        },

        bounds() {
            return {
                x: FILA.x + (Math.max(itens.length, 1) * FILA.gap) / 2 - FILA.gap / 2,
                y: FILA.y - FILA.h / 2,
                w: Math.max(itens.length, 1) * FILA.gap + 30,
                h: FILA.h + 40,
            }
        },

        destroy() {
            FX.kill(scene, root)
            itens.forEach(i => i.destroy(true))
            itens = []
            root.destroy(true)
        },
    }
}

export type Fila = ReturnType<typeof createFila>

/** Mantido perto da fila porque é a mesma família de cor. */
export const CORES_CONFETE = [C.gold, C.ok, C.azul, C.nao]
