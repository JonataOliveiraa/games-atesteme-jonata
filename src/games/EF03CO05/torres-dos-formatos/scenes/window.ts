import Phaser from 'phaser'
import { C, CSS, FONT, PIXEL } from '../data/theme'
import { formatOf } from '../data/levels'
import type { Payload } from '../types'

const BAR = 0x4a5f7a

/**
 * A JANELA ESTRUTURAL — o coração da habilidade.
 *
 * Ela não desenha o assunto do arquivo; desenha COMO os dados estão
 * arrumados: amostras numa linha do tempo, pontos de cor numa grade, símbolos
 * em fila ou quadros numa tira. É a mesma janela no arquivo que cai e no
 * arquivo preso — só muda de tamanho, e por isso ela é função de `w` e `h`.
 */
export function createWindow(
    scene: Phaser.Scene,
    payload: Payload,
    w: number,
    h: number,
): Phaser.GameObjects.Container {
    const root = scene.add.container(0, 0)
    const g = scene.add.graphics()
    root.add(g)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, Math.min(11, h * 0.16))
    g.fillStyle(C.panel, 1)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, Math.min(8, h * 0.13))

    const format = formatOf(payload)

    if (format === 'audio' && 'samples' in payload) {
        // AMOSTRAS NUMA LINHA DO TEMPO.
        const n = payload.samples.length
        const inner = w - 16
        const bw = inner / n
        g.fillStyle(C.inkSoft, 0.3)
        g.fillRect(-inner / 2, -1, inner, 2)
        payload.samples.forEach((value, i) => {
            const bh = Math.max(5, value * (h - 16))
            g.fillStyle(BAR, 1)
            g.fillRoundedRect(-inner / 2 + i * bw + 1, -bh / 2, bw - 3, bh, 2)
        })
        return root
    }

    if (format === 'image' && 'pixels' in payload) {
        // PONTOS DE COR EM POSIÇÕES: a grade é a estrutura.
        const rows = payload.pixels.length
        const cols = payload.pixels[0].length
        const cell = Math.min((w - 14) / cols, (h - 14) / rows)
        const gw = cell * cols
        const gh = cell * rows
        g.fillStyle(C.ink, 0.85)
        g.fillRect(-gw / 2 - 2, -gh / 2 - 2, gw + 4, gh + 4)
        payload.pixels.forEach((row, ry) =>
            row.forEach((code, cx) => {
                g.fillStyle(PIXEL[code] ?? PIXEL['.'], 1)
                g.fillRect(-gw / 2 + cx * cell + 1, -gh / 2 + ry * cell + 1, cell - 2, cell - 2)
            }),
        )
        return root
    }

    if (format === 'text' && 'tokens' in payload) {
        // SÍMBOLOS EM SEQUÊNCIA: cada ficha é uma unidade, e a ordem conta.
        const gap = 5
        const size = Math.max(10, Math.min(h * 0.34, 20))
        const chips = payload.tokens.map(token => ({ token, w: token.length * size * 0.66 + 12 }))
        const total = chips.reduce((sum, chip) => sum + chip.w, 0) + gap * (chips.length - 1)
        const scale = Math.min(1, (w - 16) / total)
        let x = -(total * scale) / 2
        chips.forEach(chip => {
            const cw = chip.w * scale
            g.fillStyle(C.inkSoft, 1)
            g.fillRoundedRect(x, -h * 0.24, cw, h * 0.48, 5)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(x + 2, -h * 0.24 + 2, cw - 4, h * 0.48 - 4, 4)
            root.add(
                scene.add
                    .text(x + cw / 2, 0, chip.token, {
                        fontFamily: FONT.black,
                        fontSize: `${Math.round(size * scale)}px`,
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
            x += cw + gap * scale
        })
        return root
    }

    if ('strip' in payload) {
        // QUADROS EM FILA: imagens que se sucedem no tempo.
        const n = payload.strip.length
        const inner = w - 16
        const fw = inner / n
        const fh = h - 20
        g.fillStyle(C.ink, 0.9)
        g.fillRect(-inner / 2 - 2, -fh / 2 - 6, inner + 4, fh + 12)
        payload.strip.forEach((code, i) => {
            g.fillStyle(PIXEL[code] ?? PIXEL['.'], 1)
            g.fillRect(-inner / 2 + i * fw + 2, -fh / 2 + 4, fw - 4, fh - 8)
        })
        // furos da fita, em cima e embaixo
        g.fillStyle(C.panel, 1)
        for (let i = 0; i < n * 2; i++) {
            const x = -inner / 2 + 3 + i * (inner / (n * 2))
            g.fillRect(x, -fh / 2 - 4, Math.max(3, fw * 0.2), 3)
            g.fillRect(x, fh / 2 + 1, Math.max(3, fw * 0.2), 3)
        }
    }

    return root
}
