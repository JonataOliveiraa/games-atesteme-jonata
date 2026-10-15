import Phaser from 'phaser'
import { DEPTH, HEADER, W } from '../data/layout'
import { C } from '../data/theme'

export interface Header {
    visible(on: boolean): void
    setOffset(dy: number, alpha: number): void
    destroy(): void
}

export function createHeader(scene: Phaser.Scene): Header {
    const g = scene.add.graphics().setDepth(DEPTH.header)
    g.fillStyle(C.shadow, 0.16)
    g.fillRect(0, HEADER.h + 2, W, 8)
    g.fillStyle(C.headerFace, 1)
    g.fillRect(0, 0, W, HEADER.h)
    g.fillStyle(C.headerRim, 1)
    g.fillRect(0, HEADER.h - 6, W, 6)
    g.fillStyle(C.headerLine, 0.55)
    g.fillRect(0, HEADER.h, W, 2)
    HEADER.dividers.forEach(x => {
        g.fillStyle(C.headerRim, 1)
        g.fillRoundedRect(x - 1.5, 18, 3, HEADER.h - 40, 1.5)
    })
    return {
        visible(on) {
            g.setVisible(on)
        },
        setOffset(dy, alpha) {
            g.setY(dy).setAlpha(alpha)
        },
        destroy() {
            g.destroy()
        },
    }
}
