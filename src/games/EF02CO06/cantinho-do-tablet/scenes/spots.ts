import Phaser from 'phaser'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { SpotId } from '../types'
import type { Room } from './room'

export interface Spots {
    enable(ids: SpotId[]): void
    glow(ids: SpotId[]): void
    update(time: number): void
    destroy(): void
}

export function createSpots(scene: Phaser.Scene, room: Room, ids: SpotId[], onTap: (id: SpotId) => void): Spots {
    const art = scene.add.graphics().setDepth(DEPTH.glow)
    let on = new Set<SpotId>()
    let shown = new Set<SpotId>()
    let hover: SpotId | undefined

    const zones = ids.map(id => {
        const r = room.hit(id)
        const zone = scene.add.zone(r.x, r.y, r.w, r.h).setDepth(DEPTH.glow + 1).setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        zone.on('pointerdown', () => {
            if (on.has(id)) onTap(id)
        })
        zone.on('pointerover', () => (hover = id))
        zone.on('pointerout', () => {
            if (hover === id) hover = undefined
        })
        return { id, zone }
    })

    const star = (x: number, y: number, r: number, alpha: number) => {
        const k = r * 0.3
        art.fillStyle(C.white, alpha)
        art.fillPoints(
            [
                { x, y: y - r },
                { x: x + k, y: y - k },
                { x: x + r, y },
                { x: x + k, y: y + k },
                { x, y: y + r },
                { x: x - k, y: y + k },
                { x: x - r, y },
                { x: x - k, y: y - k },
            ],
            true,
        )
    }

    return {
        enable(list) {
            on = new Set(list)
            zones.forEach(({ id, zone }) => {
                if (zone.input) zone.input.enabled = on.has(id)
            })
            if (!list.length) hover = undefined
        },
        glow(list) {
            shown = new Set(list)
        },
        update(time) {
            art.clear()
            zones.forEach(({ id, zone }, k) => {
                const r = room.hit(id)
                zone.setPosition(r.x, r.y).setSize(r.w, r.h)
                if (zone.input) zone.input.hitArea.setTo(0, 0, r.w, r.h)
                if (!shown.has(id)) return
                const pulse = 0.5 + 0.5 * Math.sin(time * 0.004 + k * 1.3)
                const strong = hover === id && on.has(id)
                const pad = 8 + pulse * 4
                const left = r.x - r.w / 2 - pad
                const top = r.y - r.h / 2 - pad
                art.lineStyle(strong ? 6 : 4, C.glow, strong ? 0.95 : 0.35 + pulse * 0.3)
                art.strokeRoundedRect(left, top, r.w + pad * 2, r.h + pad * 2, 22)
                art.lineStyle(2, C.white, strong ? 0.9 : 0.4 + pulse * 0.3)
                art.strokeRoundedRect(left + 5, top + 5, r.w + pad * 2 - 10, r.h + pad * 2 - 10, 18)
                const tw = (time * 0.002 + k) % 1
                star(left + 6, top + 6, 9 + pulse * 5, 0.5 + pulse * 0.5)
                star(left + r.w + pad * 2 - 6, top + r.h + pad * 2 - 6, 7 + (1 - pulse) * 5, 0.5 + (1 - pulse) * 0.5)
                if (tw < 0.5) star(left + r.w + pad * 2 - 4, top + 8, 6 * Math.sin(tw * Math.PI * 2), 0.9)
            })
        },
        destroy() {
            zones.forEach(({ zone }) => zone.destroy())
            art.destroy()
        },
    }
}
