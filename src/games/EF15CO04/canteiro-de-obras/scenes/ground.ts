import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, GROUND, PIECE } from '../data/layout'
import { A, C } from '../data/theme'
import type { PieceDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

interface Item {
    def: PieceDef
    holder: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
}

export interface Ground {
    deal(pieces: PieceDef[], sheet: string): Promise<void>
    setEnabled(on: boolean): void
    pulse(): void
    calm(): void
    boxOf(id: string): { x: number; y: number; w: number; h: number }
    rowBox(): { x: number; y: number; w: number; h: number }
    lift(id: string): Promise<void>
    settle(id: string): Promise<void>
    flyTo(id: string, to: { x: number; y: number }, endScale: number): Promise<void>
    glow(id: string): void
    clear(): Promise<void>
    destroy(): void
}

/** As peças ficam SOLTAS no chão de terra: sem ficha, sem prateleira, sem nome. */
export function createGround(scene: Phaser.Scene, onPick: (id: string) => void): Ground {
    let items: Item[] = []
    const pulsing: FxTarget[] = []

    const metrics = () => {
        const many = items.length >= GROUND.many
        const size = many ? GROUND.sizeMany : GROUND.size
        const gap = many ? GROUND.gapMany : GROUND.gap
        return { size, gap }
    }

    const slotX = (index: number, count: number) => {
        const { size, gap } = metrics()
        const total = count * size + (count - 1) * gap
        return GROUND.cx - total / 2 + size / 2 + index * (size + gap)
    }

    const calm = () => {
        pulsing.forEach(t => {
            FX.kill(scene, t)
            t.setScale(1)
        })
        pulsing.length = 0
    }

    const relayout = () => {
        const { size } = metrics()
        items.forEach((item, i) => {
            const target = slotX(i, items.length)
            item.zone.setPosition(target, GROUND.cy)
            item.zone.setSize(size, size)
            void FX.to(scene, fx(item.holder), { x: target }, { duration: 260, ease: 'Sine.easeInOut' })
        })
    }

    return {
        async deal(pieces, sheet) {
            calm()
            items = []
            const { size } = metrics()

            pieces.forEach((def, i) => {
                const holder = scene.add.container(slotX(i, pieces.length), GROUND.cy).setDepth(DEPTH.piece)

                const shadow = scene.add.graphics()
                shadow.fillStyle(C.shadow, A.shadow)
                shadow.fillEllipse(0, size / 2 - 14, size * 0.76, 26)
                holder.add(shadow)

                if (scene.textures.exists(sheet)) {
                    const sprite = scene.add.sprite(0, 0, sheet, def.frame).setScale((size / PIECE.cell))
                    holder.add(sprite)
                } else {
                    const g = scene.add.graphics()
                    g.fillStyle(C.paper, 1)
                    g.fillRoundedRect(-size / 2, -size / 2, size, size, 18)
                    g.lineStyle(6, C.woodDark, 1)
                    g.strokeRoundedRect(-size / 2, -size / 2, size, size, 18)
                    holder.add(g)
                }

                const zone = scene.add
                    .zone(slotX(i, pieces.length), GROUND.cy, size, size)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.piece + 1)
                    .setInteractive({ useHandCursor: true })
                zone.input!.enabled = false
                zone.on('pointerdown', () => onPick(def.id))

                items.push({ def, holder, zone })
            })

            await Promise.all(
                items.map((item, i) => {
                    item.holder.setAlpha(0).setX(item.holder.x - 90)
                    return FX.all(
                        FX.to(scene, fx(item.holder), { alpha: 1 }, { duration: 200, delay: i * 90 }),
                        FX.to(
                            scene,
                            fx(item.holder),
                            { x: slotX(i, items.length) },
                            { duration: 380, delay: i * 90, ease: 'Back.easeOut' },
                        ),
                    )
                }),
            )
        },

        setEnabled(on) {
            items.forEach(item => {
                if (item.zone.input) item.zone.input.enabled = on
            })
        },

        pulse() {
            calm()
            items.forEach((item, i) => {
                pulsing.push(fx(item.holder))
                FX.breathe(scene, fx(item.holder), { grow: 1.06, duration: 820 + i * 50 })
            })
        },

        calm,

        boxOf(id) {
            const { size } = metrics()
            const item = items.find(i => i.def.id === id)
            return { x: item?.holder.x ?? GROUND.cx, y: GROUND.cy, w: size, h: size }
        },

        rowBox() {
            const { size, gap } = metrics()
            const count = Math.max(1, items.length)
            return {
                x: GROUND.cx,
                y: GROUND.cy,
                w: count * size + (count - 1) * gap,
                h: size,
            }
        },

        async lift(id) {
            const item = items.find(i => i.def.id === id)
            if (!item) return
            item.holder.setDepth(DEPTH.fly)
            await FX.to(scene, fx(item.holder), { y: GROUND.cy - 130, scale: 1.12 }, { duration: 280, ease: 'Back.easeOut' })
        },

        async settle(id) {
            const item = items.find(i => i.def.id === id)
            if (!item) return
            await FX.to(scene, fx(item.holder), { y: GROUND.cy, scale: 1 }, { duration: 320, ease: 'Sine.easeInOut' })
            item.holder.setDepth(DEPTH.piece)
        },

        async flyTo(id, to, endScale) {
            const index = items.findIndex(i => i.def.id === id)
            if (index < 0) return
            const item = items[index]
            calm()
            item.holder.setDepth(DEPTH.fly)
            if (item.zone.input) item.zone.input.enabled = false

            const { size } = metrics()
            const shrink = (endScale * PIECE.cell) / size

            await FX.all(
                FX.arcTo(scene, fx(item.holder), to, { height: 150, duration: 480 }),
                FX.to(scene, fx(item.holder), { scale: shrink }, { duration: 480 }),
            )

            item.holder.destroy()
            item.zone.destroy()
            items.splice(index, 1)
            relayout()
        },

        glow(id) {
            const item = items.find(i => i.def.id === id)
            if (!item) return
            void FX.to(scene, fx(item.holder), { scale: 1.16 }, { duration: 260, yoyo: true, repeat: 2 })
        },

        async clear() {
            calm()
            const gone = items
            items = []
            await Promise.all(
                gone.map((item, i) =>
                    FX.to(scene, fx(item.holder), { alpha: 0, y: GROUND.cy + 40 }, { duration: 220, delay: i * 40 }),
                ),
            )
            gone.forEach(item => {
                item.holder.destroy()
                item.zone.destroy()
            })
        },

        destroy() {
            calm()
            items.forEach(item => {
                item.holder.destroy()
                item.zone.destroy()
            })
            items = []
        },
    }
}
