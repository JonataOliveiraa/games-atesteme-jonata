import Phaser from 'phaser'
import { SHEET } from '../data/art'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

/**
 * O posto de observação. Fundo e nada mais: tudo que se toca é desenhado por
 * cima.
 *
 * O véu é NAVY, e não creme como nos jogos de sala de aula. É ele que garante
 * o contraste do §1 do TEXTURAS.md: escurecendo o casco, o papel creme da
 * ficha vira a superfície mais clara da tela, e o ciano da seleção passa a
 * aparecer em cima dela em vez de se dissolver no azul do cenário.
 */
export function createRoom(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists(SHEET.room)) {
        const bg = scene.add
            .image(W / 2, H / 2, SHEET.room)
            .setDisplaySize(W, H + 2)
            .setDepth(DEPTH.bg)
        // borrão fraco: forte demais lê como defeito de arte. Quem manda o
        // fundo para trás é o véu, logo abaixo
        bg.preFX?.addBlur(1, 2, 2, 0.35)
        parts.push(bg)
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)

        // casco
        g.fillStyle(C.hullDeep, 1)
        g.fillRect(0, 0, W, 540)
        g.fillStyle(C.hull, 1)
        g.fillRect(240, 40, 800, 440)
        g.lineStyle(6, C.hullDeep, 1)
        g.strokeRect(240, 40, 800, 440)

        // as duas escotilhas das bordas, com água escura atrás
        ;[130, 1160].forEach(x => {
            g.fillStyle(C.deep, 1)
            g.fillCircle(x, 190, 132)
            g.fillStyle(C.water, 1)
            g.fillCircle(x, 190, 118)
            g.fillStyle(C.beam, 0.34)
            g.fillTriangle(x - 60, 72, x + 10, 72, x - 30, 308)
            g.lineStyle(14, C.hull, 1)
            g.strokeCircle(x, 190, 126)
        })

        // balcão da frente
        g.fillStyle(C.lamp, 1)
        g.fillRect(0, 536, W, H - 536)
        g.fillStyle(C.hullDeep, 0.35)
        g.fillRect(0, 536, W, 10)

        parts.push(g)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    veil.fillStyle(C.deep, 0.3)
    veil.fillRect(0, 0, W, H)
    parts.push(veil)

    return {
        destroy() {
            parts.forEach(p => p.destroy())
        },
    }
}

export type Room = ReturnType<typeof createRoom>
