import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BELT, DEPTH, FLOOR, FUNNEL, OVEN } from '../data/layout'
import { C } from '../data/theme'
import { piece, setPiece } from './art'

type Item = Phaser.GameObjects.Image

interface Piece {
    x: number
    baked: boolean
    g: Item
}

export interface Step {
    baked: number
    delivered: Item[]
}

export interface Line {
    advance(dx: number): Step
    prefill(): void
    clear(): void
    takeBaked(): Item[]
    rawOut(): Promise<void>
    dropToFloor(): Promise<void>
    destroy(): void
}

export function createLine(scene: Phaser.Scene, spacing: number, onDrop: () => void): Line {
    const pieces: Piece[] = []
    let since = 0

    const make = (x: number, falling: boolean) => {
        const g = piece(scene, 'dough', BELT.itemSize).setOrigin(0.5, 1).setPosition(x, BELT.itemBottom).setDepth(DEPTH.items)
        const p = { x, baked: false, g }
        pieces.push(p)
        if (falling) {
            const scale = g.scale
            g.setY(FUNNEL.mouth + 10).setScale(scale * 0.6)
            void FX.to(scene, g, { y: BELT.itemBottom, scale }, { duration: 260, ease: 'Bounce.easeOut' })
            onDrop()
        }
        return p
    }

    const smell = (x: number) => {
        for (let i = 0; i < 3; i++) {
            const w = scene.add.graphics({ x: x + (i - 1) * 14, y: BELT.itemBottom - BELT.itemSize }).setDepth(DEPTH.fx)
            w.lineStyle(3, C.smell, 0.9)
            w.beginPath()
            w.moveTo(0, 0)
            w.lineTo(5, -8)
            w.lineTo(-3, -16)
            w.lineTo(4, -24)
            w.strokePath()
            void FX.to(scene, w, { y: w.y - 46, alpha: 0 }, { duration: 900, delay: i * 120 }).then(() => w.destroy())
        }
    }

    return {
        advance(dx) {
            const step: Step = { baked: 0, delivered: [] }
            for (let i = pieces.length - 1; i >= 0; i--) {
                const p = pieces[i]
                const before = p.x
                p.x += dx
                p.g.setX(p.x)
                if (!p.baked && before < OVEN.bakeX && p.x >= OVEN.bakeX) {
                    p.baked = true
                    setPiece(p.g, 'cookie', BELT.itemSize)
                    step.baked += 1
                }
                if (p.baked && before < OVEN.exitX && p.x >= OVEN.exitX) smell(p.x)
                if (p.x >= BELT.right - 14) {
                    step.delivered.push(p.g)
                    pieces.splice(i, 1)
                }
            }
            since += dx
            if (since >= spacing) {
                since -= spacing
                make(BELT.dropX + since, true)
            }
            return step
        },
        prefill() {
            since = 0
            for (let k = 2; k >= 0; k--) make(BELT.dropX + spacing * k, false)
        },
        clear() {
            pieces.forEach(p => p.g.destroy())
            pieces.length = 0
            since = 0
        },
        takeBaked() {
            const out: Item[] = []
            for (let i = pieces.length - 1; i >= 0; i--) {
                if (!pieces[i].baked) continue
                out.unshift(pieces[i].g)
                pieces.splice(i, 1)
            }
            return out
        },
        async rawOut() {
            const g = piece(scene, 'dough', BELT.itemSize)
                .setOrigin(0.5, 1)
                .setPosition(OVEN.exitX - 40, BELT.itemBottom)
                .setDepth(DEPTH.oven + 1)
                .setTint(0xf4f1e8)
            const scale = g.scale
            g.setScale(scale * 0.5)
            await FX.to(scene, g, { x: OVEN.exitX + 18, scale: scale * 1.15 }, { duration: 260, ease: 'Back.easeOut' })
            scene.tweens.add({ targets: g, angle: { from: -10, to: 10 }, duration: 120, yoyo: true, repeat: 4 })
        },
        async dropToFloor() {
            const g = piece(scene, 'cookie', BELT.itemSize)
                .setPosition(BELT.right - 6, BELT.itemBottom - BELT.itemSize / 2)
                .setDepth(DEPTH.fx)
            await FX.to(scene, g, { x: BELT.right + 34, y: FLOOR.y + 70, angle: 160 }, { duration: 420, ease: 'Quad.easeIn' })
            setPiece(g, 'broken', BELT.itemSize * 1.1)
            g.setAngle(0)
            await FX.impact(scene, g, 0.2)
        },
        destroy() {
            pieces.forEach(p => p.g.destroy())
            pieces.length = 0
        },
    }
}
