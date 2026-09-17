import Phaser from 'phaser'
import { DEPTH, H, HUD, PAPER, W } from '../data/layout'
import { A, C } from '../data/theme'

const SHEET_KEY = 'ge-desk'

/**
 * A mesa do guardião. Enquanto o PNG não existe, o fundo é desenhado — e o
 * tampo continua liso nos dois casos, porque a sombra do papel é do jogo.
 */
export function createDesk(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.desk)

    if (scene.textures.exists(SHEET_KEY)) {
        const bg = scene.add.image(W / 2, H / 2, SHEET_KEY)
        bg.setDisplaySize(W, H)
        root.add(bg)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.wallDeep, 1)
        g.fillRect(0, HUD.h, W, 110)
        g.fillStyle(C.woodTop, 1)
        g.fillRect(0, HUD.h + 110, W, H - HUD.h - 110)
        g.fillStyle(C.woodLight, 0.5)
        g.fillRect(0, HUD.h + 110, W, 14)
        g.fillStyle(C.wood, 1)
        g.fillRect(0, H - 26, W, 26)

        g.fillStyle(C.cork, 1)
        g.fillRoundedRect(950, HUD.h + 12, 280, 78, 10)
        g.lineStyle(8, C.wood, 1)
        g.strokeRoundedRect(950, HUD.h + 12, 280, 78, 10)
        root.add(g)
    }

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, A.shadow)
    shadow.fillRoundedRect(PAPER.x + 10, PAPER.y + 16, PAPER.w, PAPER.h, 10)
    root.add(shadow)

    return {
        destroy() {
            root.destroy(true)
        },
    }
}

export type Desk = ReturnType<typeof createDesk>
export const DESK_TEXTURE = SHEET_KEY
