import Phaser from 'phaser'
import { CLEARING, DEPTH, GRID, H, W } from '../data/layout'
import { C, LINE } from '../data/theme'
import { BG } from '../data/files'
import { bake, unbake } from './bake'

type G = Phaser.GameObjects.Graphics

const hash = (a: number, b: number) => {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return s - Math.floor(s)
}

function flower(g: G, x: number, y: number, r: number, petal: number) {
    g.fillStyle(petal, 1)
    for (let k = 0; k < 5; k++) {
        const a = (k / 5) * Math.PI * 2
        g.fillCircle(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.8)
    }
    g.fillStyle(C.yellow, 1)
    g.fillCircle(x, y, r * 0.6)
}

function paintGarden(g: G) {
    g.fillStyle(C.lawnBand, 1)
    g.fillRect(0, 0, W, H)

    for (let i = 0; i < 9; i++) {
        const x = 260 + i * 118 + hash(i, 1) * 30
        const y = 18 + hash(i, 2) * 26
        const r = 30 + hash(i, 3) * 14
        g.fillStyle(C.hedgeDark, 0.35)
        g.fillCircle(x + 4, y + 8, r)
        g.fillStyle(C.hedgeTop, 1)
        g.fillCircle(x, y, r)
        g.fillStyle(C.hedgeLight, 1)
        g.fillCircle(x - r * 0.3, y - r * 0.3, r * 0.45)
    }

    const gw = GRID.cols * GRID.cell
    const gh = GRID.rows * GRID.cell
    g.fillStyle(C.lawn, 1)
    g.fillRect(GRID.x, GRID.y, gw, gh)
    for (let c = 0; c < GRID.cols; c++) {
        for (let r = 0; r < GRID.rows; r++) {
            if ((c + r) % 2) {
                g.fillStyle(C.lawnDark, 0.35)
                g.fillRect(GRID.x + c * GRID.cell, GRID.y + r * GRID.cell, GRID.cell, GRID.cell)
            }
            g.lineStyle(2, C.lawnDark, 0.9)
            for (let k = 0; k < 2; k++) {
                const x = GRID.x + c * GRID.cell + 14 + hash(c * 7 + k, r) * 58
                const y = GRID.y + r * GRID.cell + 16 + hash(r * 5 + k, c) * 56
                g.lineBetween(x - 4, y - 6, x, y)
                g.lineBetween(x + 4, y - 6, x, y)
            }
        }
    }

    g.fillStyle(C.pebbleDark, 1)
    g.fillRoundedRect(CLEARING.x - 4, CLEARING.y + 6, CLEARING.w + 8, CLEARING.h - 8, 90)
    g.fillStyle(C.pebble, 1)
    g.fillRoundedRect(CLEARING.x, CLEARING.y, CLEARING.w, CLEARING.h - 12, 86)
    for (let i = 0; i < 70; i++) {
        const x = CLEARING.x + 24 + hash(i, 9) * (CLEARING.w - 48)
        const y = CLEARING.y + 24 + hash(9, i) * (CLEARING.h - 60)
        g.fillStyle(C.pebbleDark, 0.8)
        g.fillEllipse(x, y, 14 + hash(i, i) * 10, 9 + hash(i, 3) * 6)
    }
    for (let i = 0; i < 9; i++) {
        const y = CLEARING.y + 40 + i * 66
        flower(g, W - 18, y, 6, i % 2 ? C.pink : C.white)
    }
    g.lineStyle(LINE, C.pebbleDark, 1)
    g.strokeRoundedRect(CLEARING.x, CLEARING.y, CLEARING.w, CLEARING.h - 12, 86)

    for (let x = 12; x < W; x += 44) flower(g, x, H - 4, 5, (x / 44) % 2 ? C.pink : C.white)
    for (let y = 120; y < H; y += 60) flower(g, 10, y, 5, (y / 60) % 2 ? C.white : C.lilac)
}

export interface Garden {
    destroy(): void
}

export function createGarden(scene: Phaser.Scene): Garden {
    if (scene.textures.exists(BG)) {
        const art = scene.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)
        return {
            destroy() {
                art.destroy()
            },
        }
    }
    const image = bake(scene, 'labirinto-jardim', paintGarden).setDepth(DEPTH.bg)
    return {
        destroy() {
            unbake(scene, image)
        },
    }
}
