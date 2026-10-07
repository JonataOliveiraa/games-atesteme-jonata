import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { PIECE, pieceFrame, SHEETS } from '../data/files'
import { pieceRect, rests, top } from '../data/flight'
import { DEPTH, FLOOR } from '../data/layout'
import type { PhaseDef, PieceDef, PieceType, Vec } from '../types'

export function registerPieceFrames(scene: Phaser.Scene) {
    ;(Object.entries(PIECE) as [PieceType, (typeof PIECE)[PieceType]][]).forEach(([type, art]) => {
        const texture = scene.textures.get(art.sheet)
        const name = pieceFrame(type)
        if (texture.has(name)) return
        const cell = SHEETS[art.sheet].frameWidth
        const cols = Math.max(1, Math.floor(texture.source[0].width / cell))
        texture.add(name, 0, (art.cell % cols) * cell + art.box.x, Math.floor(art.cell / cols) * cell + art.box.y, art.box.w, art.box.h)
    })
}

export interface Scenery {
    load(phase: Pick<PhaseDef, 'pieces' | 'robots'>): void
    knock(index: number, push: number): Promise<void>
    restore(): Promise<void>
    destroy(): void
}

interface Placed {
    def: PieceDef
    sprite: Phaser.GameObjects.Image
    home: Vec
}

export function createScenery(scene: Phaser.Scene): Scenery {
    let placed: Placed[] = []
    let locked = new Set<number>()
    let fallen = new Set<number>()

    const clear = () => {
        placed.forEach(p => {
            scene.tweens.killTweensOf(p.sprite)
            p.sprite.destroy()
        })
        placed = []
        locked = new Set()
        fallen = new Set()
    }

    const below = (i: number) => placed.map((_, k) => k).filter(k => k !== i && rests(placed[i].def, placed[k].def))
    const above = (i: number) => placed.map((_, k) => k).filter(k => k !== i && rests(placed[k].def, placed[i].def))

    return {
        load(phase) {
            clear()
            placed = phase.pieces.map((def, i) => {
                const r = pieceRect(def)
                const sprite = scene.add
                    .image(r.x, r.y, PIECE[def.type].sheet, pieceFrame(def.type))
                    .setDisplaySize(r.w, r.h)
                    .setDepth(DEPTH.piece + i * 0.01)
                return { def, sprite, home: { x: r.x, y: r.y } }
            })
            const queue = placed
                .map((_, i) => i)
                .filter(i =>
                    Object.values(phase.robots).some(
                        feet => feet && Math.abs(top(placed[i].def) - feet.y) <= 2 && Math.abs(placed[i].def.x - feet.x) <= PIECE[placed[i].def.type].w / 2,
                    ),
                )
            while (queue.length) {
                const i = queue.pop() as number
                if (locked.has(i)) continue
                locked.add(i)
                queue.push(...below(i))
            }
        },
        async knock(index, push) {
            const hit = placed[index]
            if (!hit) return
            if (locked.has(index)) {
                await FX.shake(scene, hit.sprite, { amount: 4, times: 2 })
                return
            }
            const fall = new Set<number>([index])
            const queue = [index]
            while (queue.length) {
                above(queue.pop() as number).forEach(k => {
                    if (fall.has(k) || locked.has(k)) return
                    fall.add(k)
                    queue.push(k)
                })
            }
            await Promise.all(
                [...fall].map((k, n) => {
                    const p = placed[k]
                    fallen.add(k)
                    const { w, h } = PIECE[p.def.type]
                    const long = w > h * 2
                    const angle = (long ? 8 : 90) * (n % 2 ? -1 : 1) * Math.sign(push)
                    const height = long ? h : w
                    return FX.to(
                        scene,
                        p.sprite,
                        { x: p.home.x + push * (0.7 + n * 0.35), y: FLOOR - height / 2, angle },
                        { duration: 460 + n * 90, ease: Ease.settle },
                    )
                }),
            )
        },
        async restore() {
            if (!fallen.size) return
            const back = [...fallen]
            fallen = new Set()
            await Promise.all(
                back.map((k, n) => {
                    const p = placed[k]
                    return FX.to(scene, p.sprite, { x: p.home.x, y: p.home.y, angle: 0 }, { duration: 360, delay: n * 70, ease: Ease.back(1.3) })
                }),
            )
        },
        destroy: clear,
    }
}
