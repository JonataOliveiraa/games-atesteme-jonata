import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG } from '../data/files'
import { DEPTH, FUNNEL, H, RAIL, SWITCH, W, WAGON } from '../data/layout'
import { C } from '../data/theme'

export interface Yard {
    shakeFunnel(): void
    destroy(): void
}

function track(g: Phaser.GameObjects.Graphics, x1: number, y1: number, x2: number, y2: number) {
    const len = Math.hypot(x2 - x1, y2 - y1)
    const nx = (y2 - y1) / len
    const ny = -(x2 - x1) / len
    const gauge = 14
    const steps = Math.floor(len / 26)
    g.lineStyle(8, C.sleeper, 1)
    for (let i = 1; i < steps; i++) {
        const t = i / steps
        const x = Phaser.Math.Linear(x1, x2, t)
        const y = Phaser.Math.Linear(y1, y2, t)
        g.lineBetween(x - nx * 22, y - ny * 22, x + nx * 22, y + ny * 22)
    }
    g.lineStyle(5, C.rail, 1)
    g.lineBetween(x1 - nx * gauge, y1 - ny * gauge, x2 - nx * gauge, y2 - ny * gauge)
    g.lineBetween(x1 + nx * gauge, y1 + ny * gauge, x2 + nx * gauge, y2 + ny * gauge)
}

export function createYard(scene: Phaser.Scene): Yard {
    const funnel = scene.add.graphics().setDepth(DEPTH.track + 1)
    const paintFunnel = () => {
        funnel.clear()
        const half = FUNNEL.w / 2
        funnel.fillStyle(C.mint, 1)
        funnel.beginPath()
        funnel.moveTo(FUNNEL.x - half, FUNNEL.top)
        funnel.lineTo(FUNNEL.x + half, FUNNEL.top)
        funnel.lineTo(FUNNEL.x + 26, FUNNEL.mouth - 22)
        funnel.lineTo(FUNNEL.x - 26, FUNNEL.mouth - 22)
        funnel.closePath()
        funnel.fillPath()
        funnel.lineStyle(5, C.ink, 1)
        funnel.strokePath()
        funnel.fillStyle(C.cream, 1)
        funnel.fillRoundedRect(FUNNEL.x - half - 8, FUNNEL.top - 14, FUNNEL.w + 16, 22, 10)
        funnel.strokeRoundedRect(FUNNEL.x - half - 8, FUNNEL.top - 14, FUNNEL.w + 16, 22, 10)
        funnel.fillStyle(C.mintDark, 1)
        funnel.fillRect(FUNNEL.x - 26, FUNNEL.mouth - 24, 52, 24)
        funnel.strokeRect(FUNNEL.x - 26, FUNNEL.mouth - 24, 52, 24)
    }

    const art = scene.textures.exists(BG)
    let bg: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    if (art) {
        const image = scene.add.image(W / 2, H / 2, BG).setDepth(DEPTH.bg)
        image.setScale(Math.max(W / image.width, H / image.height))
        bg = image
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)
        g.fillStyle(C.wall, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.wallLine, 1)
        for (let x = 40; x < W; x += 90) g.fillRect(x, 96, 4, RAIL.y - 120)
        g.fillStyle(C.floor, 1)
        g.fillRect(0, RAIL.y, W, H - RAIL.y)
        for (const x of [180, 1100]) {
            g.fillStyle(C.sky, 1)
            g.fillCircle(x, 230, 62)
            g.lineStyle(8, C.lilac, 1)
            g.strokeCircle(x, 230, 62)
            g.lineStyle(4, C.lilac, 1)
            g.lineBetween(x - 62, 230, x + 62, 230)
            g.lineBetween(x, 168, x, 292)
        }
        const flags = [C.coral, C.mint, C.lilac, C.glow]
        g.lineStyle(3, C.woodDark, 1)
        g.lineBetween(0, 104, W, 104)
        for (let i = 0; i < 22; i++) {
            const x = 20 + i * 60
            if (Math.abs(x - FUNNEL.x) < 110) continue
            g.fillStyle(flags[i % flags.length], 1)
            g.fillTriangle(x - 16, 106, x + 16, 106, x, 132)
        }
        track(g, FUNNEL.x, FUNNEL.mouth, SWITCH.x, SWITCH.y)
        track(g, SWITCH.x, SWITCH.y, WAGON.xs.left, WAGON.mouthY)
        track(g, SWITCH.x, SWITCH.y, WAGON.xs.right, WAGON.mouthY)
        g.lineStyle(5, C.rail, 1)
        g.lineBetween(0, RAIL.y - 4, W, RAIL.y - 4)
        g.lineBetween(0, RAIL.y + 6, W, RAIL.y + 6)
        bg = g
        paintFunnel()
    }

    return {
        shakeFunnel() {
            if (art) return
            void FX.shake(scene, funnel, { amount: 5, times: 2 })
        },
        destroy() {
            bg.destroy()
            funnel.destroy()
        },
    }
}
