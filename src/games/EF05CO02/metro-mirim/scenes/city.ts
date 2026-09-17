import Phaser from 'phaser'
import { KEY } from '../data/art'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

/**
 * O fundo, e só o fundo — agora do tamanho do MUNDO da fase, não da tela.
 *
 * Ele é o mais quieto de tudo de propósito: quem tem que saltar é a estação (o
 * vértice) e o trilho (a aresta). Sem `bg-cidade.png` o jogo continua inteiro:
 * a cidade sai em `Graphics`, mais lavada ainda.
 */
export function createCity(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.city)
    const image = scene.textures.exists(KEY.city) ? scene.add.image(0, 0, KEY.city).setOrigin(0) : null
    const drawn = scene.add.graphics()
    const edge = scene.add.graphics()

    if (image) root.add(image)
    root.add(drawn)
    root.add(edge)

    return {
        setWorld(w: number, h: number) {
            if (image) image.setDisplaySize(w, h)

            drawn.clear()
            if (!image) paintCity(drawn, w, h)

            // a moldura diz onde o mapa acaba: sem ela, arrastar até a borda
            // parece defeito em vez de fim
            edge.clear()
            edge.fillStyle(C.ink, 0.1)
            edge.fillRect(0, 0, w, 14)
            edge.fillRect(0, h - 14, w, 14)
            edge.fillRect(0, 0, 14, h)
            edge.fillRect(w - 14, 0, 14, h)
            edge.lineStyle(8, C.ink, 0.25)
            edge.strokeRect(4, 4, w - 8, h - 8)
        },

        destroy() {
            root.destroy(true)
        },
    }
}

function paintCity(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.fillStyle(C.city, 1)
    g.fillRect(0, 0, w, h)

    g.fillStyle(C.grass, 0.55)
    for (let x = 120; x < w; x += 520) {
        g.fillRoundedRect(x, 140, 320, 210, 44)
        g.fillRoundedRect(x + 180, h - 330, 360, 220, 48)
    }

    g.fillStyle(C.block, 0.5)
    for (let x = 90; x < w - 140; x += 260) {
        for (let y = 120; y < h - 140; y += 220) {
            g.fillRoundedRect(x + ((y / 220) % 2) * 30, y, 150, 100, 16)
        }
    }

    g.fillStyle(C.river, 0.45)
    g.beginPath()
    g.moveTo(-40, h * 0.62)
    g.lineTo(w * 0.3, h * 0.42)
    g.lineTo(w * 0.62, h * 0.58)
    g.lineTo(w + 40, h * 0.34)
    g.lineTo(w + 40, h * 0.44)
    g.lineTo(w * 0.62, h * 0.68)
    g.lineTo(w * 0.3, h * 0.52)
    g.lineTo(-40, h * 0.72)
    g.closePath()
    g.fillPath()
}

export type City = ReturnType<typeof createCity>
