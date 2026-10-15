import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import type { Rect } from '../types'
import { RING, paintImage } from './art'

type Art = FxTarget

const GLOW = 0xffd23f
const GLOW_DARK = 0xe39a12

interface Entry {
    art: Art
    zone: Phaser.GameObjects.Zone
    rect: Rect
    fade?: Phaser.Tweens.Tween
}

const DIM = 0.36

export interface Picker {
    add(id: string, art: Art, rect: Rect): void
    remove(id: string): void
    has(id: string): boolean
    rect(id: string): Rect | null
    wait(ids: string[], pulse?: boolean): Promise<string>
    ghost(id: string): Promise<void>
    setAuto(on: boolean): void
    waiting(): string[]
    cancel(): void
    destroy(): void
}

export function createPicker(scene: Phaser.Scene, onPress: () => void): Picker {
    const entries = new Map<string, Entry>()
    let wanted: string[] | null = null
    let resolve: ((id: string) => void) | null = null
    let auto = false
    let glows: Phaser.GameObjects.Image[] = []

    const unglow = () => {
        glows.forEach(g => {
            scene.tweens.killTweensOf(g)
            g.destroy()
        })
        glows = []
    }

    const glow = (ids: string[]) => {
        unglow()
        ids.forEach(id => {
            const entry = entries.get(id)
            if (!entry) return
            const { w, h } = entry.rect
            const pad = 9
            const bw = w + pad * 2
            const bh = h + pad * 2
            const round = Math.abs(w - h) < 12 ? Math.min(bw, bh) / 2 : 30
            const ring = paintImage(
                scene,
                bw + 8,
                bh + 8,
                g => {
                    g.lineStyle(9, GLOW_DARK, 1)
                    g.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, round)
                    g.lineStyle(5, GLOW, 1)
                    g.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, round)
                },
                (bw + 8) / 2,
                (bh + 8) / 2,
            )
                .setPosition(entry.rect.x, entry.rect.y)
                .setDepth(DEPTH.banner + 1)
            scene.tweens.add({ targets: ring, alpha: 0.3, scale: 1.04, duration: 560, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            glows.push(ring)
        })
    }

    const paint = () => {
        entries.forEach((entry, id) => {
            const on = wanted?.includes(id) ?? false
            entry.fade?.stop()
            const alpha = wanted === null ? 1 : on ? 1 : DIM
            entry.fade = scene.tweens.add({ targets: entry.art, alpha, duration: 160 })
            if (entry.zone.input) {
                entry.zone.input.enabled = on && !auto
                entry.zone.input.cursor = on && !auto ? 'pointer' : 'default'
            }
        })
    }

    const tap = (id: string, real: boolean) => {
        if (!wanted || !wanted.includes(id)) return
        if (real && auto) return
        const entry = entries.get(id)
        const done = resolve
        wanted = null
        resolve = null
        unglow()
        onPress()
        if (entry) {
            scene.tweens.killTweensOf(entry.art)
            entry.art.setAlpha(1).setScale(1)
            void FX.to(scene, entry.art, { scale: 0.94 }, { duration: 70, yoyo: true }).then(() => entry.art.active && entry.art.setScale(1))
        }
        paint()
        done?.(id)
    }

    return {
        add(id, art, rect) {
            entries.get(id)?.zone.destroy()
            const zone = scene.add.zone(rect.x, rect.y, rect.w, rect.h).setDepth(DEPTH.ring + 1).setInteractive({ useHandCursor: true })
            if (zone.input) zone.input.enabled = false
            zone.on('pointerdown', () => tap(id, true))
            zone.on('pointerover', (pointer: Phaser.Input.Pointer) => {
                if (pointer.wasTouch || !wanted?.includes(id) || auto) return
                art.setScale(1.04)
            })
            zone.on('pointerout', () => {
                if (art.active && art.scale > 1) art.setScale(1)
            })
            entries.set(id, { art, zone, rect })
            if (wanted) paint()
        },
        remove(id) {
            const entry = entries.get(id)
            if (!entry) return
            entry.fade?.stop()
            entry.zone.destroy()
            entries.delete(id)
        },
        has: id => entries.has(id),
        rect: id => entries.get(id)?.rect ?? null,
        wait(ids, pulse = false) {
            resolve?.('')
            wanted = ids.filter(id => entries.has(id))
            paint()
            if (pulse) glow(wanted)
            else unglow()
            return new Promise<string>(r => {
                resolve = r
            })
        },
        async ghost(id) {
            const entry = entries.get(id)
            if (!entry) return
            const ring = scene.add.image(entry.rect.x, entry.rect.y, RING).setDepth(DEPTH.ring).setScale(0.3).setAlpha(0)
            ring.setTint(0xfff3a0)
            await FX.to(scene, ring, { scale: 0.62, alpha: 1 }, { duration: 420 })
            await FX.wait(scene, 380)
            tap(id, false)
            await FX.to(scene, ring, { scale: 0.9, alpha: 0 }, { duration: 380 })
            ring.destroy()
        },
        setAuto(on) {
            auto = on
            paint()
        },
        waiting: () => wanted ?? [],
        cancel() {
            const done = resolve
            wanted = null
            resolve = null
            unglow()
            paint()
            done?.('')
        },
        destroy() {
            resolve?.('')
            resolve = null
            wanted = null
            unglow()
            entries.forEach(entry => entry.zone.destroy())
            entries.clear()
        },
    }
}
