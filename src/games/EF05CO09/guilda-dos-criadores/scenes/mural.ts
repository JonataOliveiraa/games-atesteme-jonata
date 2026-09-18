import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { ART, DEPTH, MURAL } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { SHEETS, has } from '../data/files'
import { MARK_FRAME, OBJ_FRAME, type Obra, type Sign } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Mural {
    container: Phaser.GameObjects.Container
    build(total: number): void
    slotPos(i: number): { x: number; y: number }
    /** A escala que leva a obra do tamanho da mesa ao tamanho do vão. */
    readonly slotScale: number
    /** Pendura de vez: a obra fica, e a plaquinha nasce embaixo dela. */
    hang(i: number, obra: Obra): Promise<void>
    /** Zoom nas plaquinhas, uma a uma. É a reprise do que ela montou. */
    celebrate(): Promise<void>
    box(): { x: number; y: number; w: number; h: number }
    slotBox(i: number): { x: number; y: number; w: number; h: number }
    destroy(): void
}

/**
 * O MURAL — QUE É O PLACAR, E É DIEGÉTICO
 *
 * Os três vãos e as três bolinhas do cabeçalho contam a mesma coisa, e o mural
 * é o que a criança olha. Vão vazio é um contorno fino, nunca uma caixa cheia:
 * ele tem de dizer "falta algo aqui" sem competir com a obra na mesa.
 */
export function createMural(scene: Phaser.Scene): Mural {
    const container = scene.add.container(0, 0).setDepth(DEPTH.mural)
    const vazios = scene.add.graphics()
    container.add(vazios)

    let total = 3
    const preenchidos: Phaser.GameObjects.Container[] = []

    /** A caixa do objeto inteiro: figura + moldura + plaquinha dourada. */
    const caixa = (cx: number) => ({
        x: cx - MURAL.w / 2 - MURAL.frame,
        y: MURAL.cy - MURAL.h / 2 - MURAL.frame,
        w: MURAL.w + MURAL.frame * 2,
        h: MURAL.h + MURAL.frame * 2 + MURAL.plaqueH + 4,
    })

    /**
     * O VÃO VAZIO OCUPA A MESMA CAIXA DO CHEIO.
     *
     * A plaquinha dourada é parte da MOLDURA, não um objeto solto embaixo:
     * é isso que libera os 20 px entre o mural e a obra. E o contorno do vão
     * tem de incluir o lugar dela, senão o mural cresce para baixo na hora
     * em que a obra sobe e as três peças pulam.
     */
    const paintVazios = () => {
        vazios.clear()
        for (let i = 0; i < total; i++) {
            if (preenchidos[i]) continue
            const b = caixa(MURAL.cxs[i])
            vazios.lineStyle(3, C.paperEdge, 1)
            vazios.strokeRoundedRect(b.x, b.y, b.w, b.h, MURAL.radius + 3)
            /* Um preguinho no alto do vão: o mural é um mural, e não três
               retângulos tracejados. */
            vazios.fillStyle(C.grey, 0.5)
            vazios.fillCircle(MURAL.cxs[i], b.y - 9, 5)
        }
    }

    const signOn = (node: Phaser.GameObjects.Container, sign: Sign, cx: number, y: number) => {
        if (sign.kind === 'marca' && has(scene, SHEETS.marcas.key)) {
            const img = scene.add.image(cx + 16, y, SHEETS.marcas.key, MARK_FRAME[sign.id])
            img.setDisplaySize(17, 17)
            node.add(img)
            return
        }
        node.add(
            scene.add
                .text(cx + 14, y, sign.kind === 'letras' ? sign.text : '✶', {
                    fontFamily: FONT, fontSize: '16px', color: CSS.ink,
                })
                .setOrigin(0.5)
                .setResolution(2),
        )
    }

    return {
        container,

        build(n) {
            total = n
            preenchidos.forEach(c => c.destroy())
            preenchidos.length = 0
            paintVazios()
        },

        slotPos(i) {
            return { x: MURAL.cxs[i], y: MURAL.cy }
        },

        get slotScale() {
            /* O vão guarda a mesma proporção da célula de `obras.png`, então
               uma escala só serve para os dois eixos. */
            return MURAL.w / ART.w
        },

        async hang(i, obra) {
            const cx = MURAL.cxs[i]
            const node = scene.add.container(0, 0)
            const g = scene.add.graphics()
            node.add(g)

            /* A obra que fica é um desenho novo, não a que voou: a que voou
               morre com a fase, e o mural tem de sobreviver a ela. */
            const b = caixa(cx)
            g.fillStyle(C.shadow, 0.16)
            g.fillRoundedRect(b.x + 3, b.y + 5, b.w, b.h, MURAL.radius + 3)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(b.x, b.y, b.w, b.h, MURAL.radius + 3)
            g.lineStyle(2, C.paperEdge, 1)
            g.strokeRoundedRect(b.x, b.y, b.w, b.h, MURAL.radius + 3)

            if (has(scene, SHEETS.obras.key)) {
                const img = scene.add.image(cx, MURAL.cy, SHEETS.obras.key, obra.frame)
                img.setDisplaySize(MURAL.w, MURAL.h)
                node.add(img)
            } else {
                g.fillStyle(C.wallDeep, 1)
                g.fillRoundedRect(cx - MURAL.w / 2, MURAL.cy - MURAL.h / 2, MURAL.w, MURAL.h, MURAL.radius)
            }

            /* A plaquinha dourada, dentro da moldura — é ela que faz a obra
               estar no mural por direito, e fica visível até o fim do nível. */
            const py = MURAL.cy + MURAL.plaqueDY
            const pw = MURAL.w - 6
            const ph = MURAL.plaqueH
            g.fillStyle(C.gold, 1)
            g.fillRoundedRect(cx - pw / 2, py - ph / 2, pw, ph, 6)
            g.fillStyle(C.goldSoft, 1)
            g.fillRoundedRect(cx - pw / 2 + 2, py - ph / 2 + 2, pw - 4, ph - 4, 5)
            g.lineStyle(2, C.goldDeep, 1)
            g.strokeRoundedRect(cx - pw / 2, py - ph / 2, pw, ph, 6)

            if (has(scene, SHEETS.marcas.key)) {
                const selo = scene.add.image(cx - pw / 2 + 16, py, SHEETS.marcas.key, OBJ_FRAME.selo)
                selo.setDisplaySize(17, 17)
                node.add(selo)
            }
            if (obra.sign) signOn(node, obra.sign, cx - 8, py)

            container.add(node)
            preenchidos[i] = node
            paintVazios()

            node.setAlpha(0)
            await FX.to(scene, fx(node), { alpha: 1 }, { duration: 200 })
            void FX.ping(scene, cx, MURAL.cy, C.green, { radius: 110, duration: 520, depth: DEPTH.fx })
        },

        async celebrate() {
            for (const node of preenchidos) {
                if (!node) continue
                await FX.to(scene, fx(node), { scale: 1.12 },
                    { duration: 150, yoyo: true, ease: 'Sine.easeInOut' })
            }
        },

        box() {
            const first = MURAL.cxs[0] - MURAL.w / 2
            const last = MURAL.cxs[total - 1] + MURAL.w / 2
            return {
                x: (first + last) / 2,
                y: MURAL.cy + MURAL.plaqueDY / 2,
                w: last - first + 40,
                h: MURAL.h + MURAL.plaqueDY + 20,
            }
        },

        slotBox(i) {
            return { x: MURAL.cxs[i], y: MURAL.cy + MURAL.plaqueDY / 2, w: MURAL.w + 30, h: MURAL.h + MURAL.plaqueDY + 20 }
        },

        destroy() {
            preenchidos.forEach(c => c?.destroy())
            container.destroy()
        },
    }
}
