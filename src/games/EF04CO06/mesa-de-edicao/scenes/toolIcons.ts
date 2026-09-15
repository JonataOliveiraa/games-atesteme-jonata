import Phaser from 'phaser'
import { TOOL } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Ferramenta, Peca } from '../types'

/**
 * O DESENHO DENTRO DE CADA BOTÃO.
 *
 * O botão não diz o que a ferramenta FAZ: ele mostra em que estado a peça está
 * agora. O `A` do LETRA tem o tamanho da letra, o do FORTE está fino ou gordo,
 * o DIVIDIR mostra um cartão ou dois, o SOM mostra quantas notas estão tocando.
 *
 * Por isso nada aqui é PNG: são mostradores, e mostrador que não muda não serve.
 */

const Y = TOOL.iconDY
const STEP_Y = TOOL.labelDY - 30

const LETRA_SIZES = [24, 32, 42, 52]

/** A régua de passos embaixo do desenho: quantos degraus e em qual deles está. */
function steps(g: Phaser.GameObjects.Graphics, total: number, atual: number) {
    const w = 26
    const gap = 8
    const largura = total * w + (total - 1) * gap
    for (let i = 0; i < total; i++) {
        g.fillStyle(i < atual ? C.ink : C.wallDeep, 1)
        g.fillRoundedRect(-largura / 2 + i * (w + gap), STEP_Y, w, 8, 4)
    }
}

function card(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, face: number) {
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(x, y, w, h, 6)
    g.fillStyle(face, 1)
    g.fillRoundedRect(x + 2.5, y + 2.5, w - 5, h - 5, 4)
}

export function drawToolIcon(
    tool: Ferramenta,
    peca: Peca,
    g: Phaser.GameObjects.Graphics,
    glyph: Phaser.GameObjects.Text,
) {
    glyph.setText('')

    switch (tool) {
        case 'letra': {
            glyph.setStyle({
                fontFamily: FONT.body,
                fontSize: `${LETRA_SIZES[peca.tamanho - 1]}px`,
                fontStyle: 'normal',
                color: CSS.ink,
            })
            glyph.setText('A')
            glyph.setY(Y - 6)
            steps(g, 4, peca.tamanho)
            return
        }

        case 'forte': {
            glyph.setStyle({
                fontFamily: FONT.body,
                fontSize: '46px',
                fontStyle: peca.forte ? 'bold' : 'normal',
                color: CSS.ink,
            })
            glyph.setText('A')
            glyph.setY(Y)
            return
        }

        case 'meio': {
            const boxW = 96
            for (let i = 0; i < 3; i++) {
                const linha = i === 1 ? boxW : boxW * 0.66
                const x = peca.centro ? -linha / 2 : -boxW / 2
                g.fillStyle(C.ink, 1)
                g.fillRoundedRect(x, Y - 22 + i * 17, linha, 9, 4)
            }
            return
        }

        /*
         * DIVIDIR mostra o antes e o depois da coisa em si: um slide com texto
         * que transborda, ou dois slides em que o texto acaba dentro. A primeira
         * versão eram retângulos com barras cinzas, e ninguém entendeu.
         */
        /*
         * OS DOIS BOTÕES DA OFICINA DOS SLIDES NÃO PODEM SE PARECER.
         *
         * Na primeira versão os dois eram um retângulo branco com barras cinzas
         * dentro, e o usuário reprovou: ninguém sabia qual era qual. Agora cada
         * um tem uma FORMA que é só dele — DIVIDIR são cartões e o texto que
         * escorre para fora deles; FOTO tem sempre uma moldura de foto, cheia ou
         * vazia, e é isso que diz de que botão se trata antes do estado.
         */
        /*
         * O botão é uma MINIATURA do que está no telão.
         *
         * Desligado: um slide com a tirinha de sobra caída embaixo dele — a mesma
         * tirinha creme de borda âmbar que a criança está vendo no telão naquele
         * instante. Ligado: dois slides, e nada caído. É esse par de figuras que
         * diz o que o botão faz, sem precisar entender a palavra DIVIDIR.
         */
        case 'dividir': {
            const h = 58
            const y = Y - h / 2 - 14

            if (peca.dividido) {
                card(g, -52, y, 48, h, C.white)
                card(g, 4, y, 48, h, C.white)
                g.fillStyle(C.slate, 1)
                for (let i = 0; i < 2; i++) {
                    g.fillRoundedRect(-44, y + 13 + i * 15, 32, 7, 3)
                    g.fillRoundedRect(12, y + 13 + i * 15, 32, 7, 3)
                }
                return
            }

            card(g, -34, y, 68, h, C.white)
            g.fillStyle(C.slate, 1)
            for (let i = 0; i < 3; i++) g.fillRoundedRect(-26, y + 11 + i * 15, 52, 7, 3)

            // a tirinha que caiu, igual à do telão: creme com borda âmbar
            const sy = y + h + 8
            g.fillStyle(C.ink, 0.25)
            g.fillRoundedRect(-24, sy + 3, 64, 26, 6)
            g.fillStyle(C.paper, 1)
            g.fillRoundedRect(-26, sy, 64, 26, 6)
            g.lineStyle(3, C.amberDeep, 1)
            g.strokeRoundedRect(-26, sy, 64, 26, 6)
            g.fillStyle(C.slate, 1)
            g.fillRoundedRect(-18, sy + 10, 48, 7, 3)
            return
        }

        case 'imagem': {
            const w = 100
            const h = 72
            const x = -w / 2
            const y = Y - h / 2
            card(g, x, y, w, h, C.white)

            const fw = w - 20
            const fh = 40
            const fx = x + 10
            const fy = y + 9
            if (peca.comFoto) {
                g.fillStyle(C.blue, 0.4)
                g.fillRoundedRect(fx, fy, fw, fh, 5)
                g.fillStyle(C.green, 1)
                g.fillTriangle(fx + 6, fy + fh - 4, fx + fw * 0.42, fy + 10, fx + fw * 0.74, fy + fh - 4)
                g.fillStyle(C.amber, 1)
                g.fillCircle(fx + fw - 12, fy + 12, 6)
            } else {
                g.fillStyle(C.wallDeep, 1)
                g.fillRoundedRect(fx, fy, fw, fh, 5)
                g.lineStyle(3, C.slate, 0.8)
                g.strokeRoundedRect(fx, fy, fw, fh, 5)
                g.lineStyle(3, C.slate, 0.8)
                g.beginPath()
                g.moveTo(fx + 8, fy + fh - 7)
                g.lineTo(fx + fw * 0.42, fy + 12)
                g.lineTo(fx + fw * 0.74, fy + fh - 7)
                g.strokePath()
            }
            g.fillStyle(C.slate, 1)
            for (let i = 0; i < 2; i++) g.fillRoundedRect(x + 10, y + 56 + i * 12, w - 20, 6, 3)
            return
        }

        case 'girar': {
            const w = peca.deitado ? 82 : 50
            const h = peca.deitado ? 50 : 82
            card(g, -w / 2, Y - h / 2 + 6, w, h, C.white)
            g.fillStyle(C.slate, 0.7)
            g.fillRoundedRect(-w / 2 + 8, Y - h / 2 + 16, w - 16, h - 28, 4)
            g.fillStyle(C.amberDeep, 1)
            g.fillTriangle(34, Y - h / 2 - 4, 50, Y - h / 2 - 16, 50, Y - h / 2 + 8)
            g.lineStyle(6, C.amberDeep, 1)
            g.beginPath()
            g.arc(0, Y - h / 2 + 6, 34, Math.PI * 1.15, Math.PI * 1.85)
            g.strokePath()
            return
        }

        case 'legenda': {
            const w = 94
            const h = 64
            const x = -w / 2
            const y = Y - h / 2
            card(g, x, y, w, h, C.slate)
            g.fillStyle(C.white, 0.35)
            g.fillCircle(x + w / 2, y + 22, 12)
            if (!peca.legenda) return
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(x + 8, y + h - 24, w - 16, 18, 5)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(x + 14, y + h - 19, w - 40, 4, 2)
            g.fillRoundedRect(x + 14, y + h - 13, w - 54, 4, 2)
            return
        }

        case 'som': {
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(-44, Y - 10, 14, 20, 3)
            g.fillTriangle(-30, Y - 22, -30, Y + 22, -10, Y)
            for (let i = 0; i < 2; i++) {
                const on = peca.som - 1 > i
                g.lineStyle(6, on ? C.amberDeep : C.wallDeep, 1)
                g.beginPath()
                g.arc(-8, Y, 16 + i * 14, -Math.PI / 3, Math.PI / 3)
                g.strokePath()
            }
            steps(g, 3, peca.som)
            return
        }
    }
}
