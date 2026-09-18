import Phaser from 'phaser'
import { C } from '../data/theme'
import type { FileId } from '../types'

/**
 * OS SEIS SÍMBOLOS, EM `Graphics`.
 *
 * É a reserva do `arquivos.png`: o jogo tem de ser jogável e vencível com zero
 * textura carregada, e é assim que ele foi avaliado antes de a arte existir.
 * Quando a folha chegar, o `card.ts` troca isto por um `Sprite` e este módulo
 * continua aqui, intacto, para o dia em que um arquivo faltar.
 *
 * Cada símbolo é desenhado numa caixa de `size` × `size` centrada na origem.
 */
export function paintIcon(g: Phaser.GameObjects.Graphics, id: FileId, size: number) {
    const s = size / 100
    const px = (n: number) => n * s

    switch (id) {
        case 'musica': {
            g.fillStyle(C.orange, 1)
            g.fillRoundedRect(px(6), px(-44), px(10), px(74), px(5))
            g.fillRoundedRect(px(46), px(-52), px(10), px(66), px(5))
            g.fillRoundedRect(px(6), px(-52), px(50), px(14), px(6))
            g.fillEllipse(px(-6), px(30), px(34), px(26))
            g.fillEllipse(px(34), px(14), px(34), px(26))
            g.lineStyle(px(5), C.navy, 1)
            g.strokeEllipse(px(-6), px(30), px(34), px(26))
            g.strokeEllipse(px(34), px(14), px(34), px(26))
            break
        }
        case 'video': {
            g.fillStyle(C.sky, 1)
            g.fillRoundedRect(px(-50), px(-36), px(100), px(72), px(12))
            g.lineStyle(px(5), C.navy, 1)
            g.strokeRoundedRect(px(-50), px(-36), px(100), px(72), px(12))
            g.fillStyle(C.navy, 1)
            g.fillTriangle(px(-14), px(-22), px(-14), px(22), px(26), px(0))
            break
        }
        case 'foto': {
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(px(-52), px(-30), px(104), px(66), px(10))
            g.fillRoundedRect(px(-26), px(-42), px(34), px(16), px(5))
            g.lineStyle(px(5), C.navy, 1)
            g.strokeRoundedRect(px(-52), px(-30), px(104), px(66), px(10))
            g.fillStyle(C.navy, 1)
            g.fillCircle(px(0), px(4), px(24))
            g.fillStyle(C.sky, 1)
            g.fillCircle(px(0), px(4), px(13))
            g.fillStyle(C.orange, 1)
            g.fillCircle(px(36), px(-16), px(6))
            break
        }
        case 'jogo': {
            g.fillStyle(C.orange, 1)
            g.fillRoundedRect(px(-54), px(-26), px(108), px(54), px(20))
            g.lineStyle(px(5), C.navy, 1)
            g.strokeRoundedRect(px(-54), px(-26), px(108), px(54), px(20))
            g.fillStyle(C.navy, 1)
            g.fillRoundedRect(px(-38), px(-6), px(30), px(9), px(4))
            g.fillRoundedRect(px(-27), px(-17), px(9), px(30), px(4))
            g.fillCircle(px(22), px(-8), px(8))
            g.fillCircle(px(36), px(6), px(8))
            break
        }
        case 'desenho': {
            g.fillStyle(C.sky, 1)
            g.fillRoundedRect(px(-48), px(-10), px(96), px(20), px(8))
            g.lineStyle(px(5), C.navy, 1)
            g.strokeRoundedRect(px(-48), px(-10), px(96), px(20), px(8))
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(px(-10), px(-48), px(20), px(96), px(8))
            g.lineStyle(px(5), C.navy, 1)
            g.strokeRoundedRect(px(-10), px(-48), px(20), px(96), px(8))
            g.fillStyle(C.orange, 1)
            g.fillTriangle(px(-10), px(40), px(10), px(40), px(0), px(56))
            break
        }
        case 'dever': {
            g.fillStyle(C.creamSoft, 1)
            g.beginPath()
            g.moveTo(px(-38), px(-50))
            g.lineTo(px(20), px(-50))
            g.lineTo(px(40), px(-28))
            g.lineTo(px(40), px(52))
            g.lineTo(px(-38), px(52))
            g.closePath()
            g.fillPath()
            g.lineStyle(px(5), C.navy, 1)
            g.strokePath()
            g.fillStyle(C.sky, 1)
            g.fillTriangle(px(20), px(-50), px(40), px(-28), px(20), px(-28))
            g.fillStyle(C.navy, 1)
            for (let i = 0; i < 3; i++) g.fillRoundedRect(px(-26), px(-4 + i * 18), px(54), px(8), px(4))
            break
        }
    }
}
