import Phaser from 'phaser'
import { SHEET } from '../data/art'
import { DEPTH, H, ROOM, W } from '../data/layout'
import { A, C } from '../data/theme'

/**
 * A sala: um PNG só, esticado para a tela inteira.
 *
 * O desenho de reserva repete os TRÊS cortes que o layout usa — parede, chão e
 * tampo da bancada. Sem eles o cliente flutuaria e os botões ficariam no ar
 * enquanto a arte não chegasse, e ninguém entenderia que o jogo está certo.
 */
export function createRoom(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.room)

    if (scene.textures.exists(SHEET.room)) {
        const bg = scene.add.image(W / 2, H / 2, SHEET.room).setDisplaySize(W, H)
        bg.preFX?.addBlur(0, 2, 2, 0.35)
        root.add(bg)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 0, W, ROOM.wallLine)
        g.fillStyle(C.wallDeep, 1)
        g.fillRect(0, ROOM.wallLine - 10, W, 10)
        g.fillStyle(C.floor, 1)
        g.fillRect(0, ROOM.wallLine, W, ROOM.benchTop - ROOM.wallLine)
        g.fillStyle(C.ink, 0.35)
        g.fillRect(0, ROOM.benchTop - 6, W, 6)
        g.fillStyle(C.woodTop, 1)
        g.fillRect(0, ROOM.benchTop, W, ROOM.benchFront - ROOM.benchTop)
        g.fillStyle(C.wood, 1)
        g.fillRect(0, ROOM.benchFront, W, H - ROOM.benchFront)
        root.add(g)
    }

    // sombra logo abaixo do cabeçalho: separa a barra da parede sem uma linha
    const shade = scene.add.graphics()
    shade.fillStyle(C.ink, A.veil)
    shade.fillRect(0, 82, W, 14)
    shade.setAlpha(0.35)
    root.add(shade)

    return {
        destroy() {
            root.destroy(true)
        },
    }
}

export type Room = ReturnType<typeof createRoom>
