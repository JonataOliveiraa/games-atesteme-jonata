import Phaser from 'phaser'
import { SHEET } from '../data/art'
import { BIN, DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

export function createRoom(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists(SHEET.room)) {
        parts.push(scene.add.image(W / 2, H / 2, SHEET.room).setDisplaySize(W, H + 2).setDepth(DEPTH.bg))
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 0, W, 476)
        g.fillStyle(C.wood, 1)
        g.fillRect(0, 476, W, H - 476)
        g.fillStyle(C.paperDeep, 1)
        g.fillRoundedRect(228, 72, 838, 326, 26)
        g.fillStyle(C.green, 1)
        g.fillRoundedRect(BIN.x - 32, BIN.y - 42, 64, 84, 10)
        parts.push(g)
    }

    const veil = scene.add.graphics().setDepth(DEPTH.bg + 1)
    veil.fillStyle(C.wall, 0.24)
    veil.fillRect(0, 0, W, H)
    parts.push(veil)

    const board = scene.add.graphics().setDepth(DEPTH.board)
    board.fillStyle(C.ink, 0.08)
    board.fillRoundedRect(214, 96, 866, 368, 30)
    parts.push(board)

    return {
        destroy() {
            parts.forEach(part => part.destroy())
        },
    }
}

export type Room = ReturnType<typeof createRoom>
