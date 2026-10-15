import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey, sheetData, sweetCell, sweetSheet } from '../data/files'
import { DEPTH, LANES, SWEET, WD, colX } from '../data/layout'
import type { Rect, Sweet, Vec } from '../types'
import { BUBBLE_DOT, FOAM, RING } from './art'
import type { View } from './view'

export interface SweetView {
    def: Sweet
    col: number
    lane: number
    x: number
    y: number
    scale: number
    img: Phaser.GameObjects.Image
    foam: Phaser.GameObjects.Image
    ring: Phaser.GameObjects.Image
    gone: boolean
}

export interface Sweets {
    build(columns: Sweet[][]): void
    activate(col: number, onPick: (s: SweetView) => void): void
    deactivate(): void
    column(col: number): SweetView[]
    at(col: number, lane: number): SweetView | undefined
    rect(col: number): Rect
    bounce(s: SweetView): Promise<void>
    dip(s: SweetView): Promise<void>
    sink(s: SweetView): Promise<void>
    clear(): void
    destroy(): void
}

const FUTURE_TINT = 0x9c8f8c

export function createSweets(scene: Phaser.Scene, view: View): Sweets {
    let list: SweetView[] = []
    let zones: Phaser.GameObjects.Zone[] = []
    let pulses: Phaser.Tweens.Tween[] = []
    let extras: Phaser.GameObjects.GameObject[] = []

    const scaleFor = (def: Sweet) => {
        const sheet = sweetSheet(def.shape)
        const maxW = sheetData(scene, sheet).maxW ?? sheet.cellW
        return (SWEET.w / maxW) * (def.size === 'pequeno' ? SWEET.small : 1)
    }

    const bottomOf = (s: SweetView) => s.y + s.img.displayHeight * (1 - SWEET.top)

    const make = (def: Sweet, col: number, lane: number): SweetView => {
        const x = colX(col + 1)
        const y = LANES[lane]
        const scale = scaleFor(def)
        const img = scene.add.image(x, y, sweetSheet(def.shape).key, cellKey(sweetCell(def.color, def.top)))
        img.setOrigin(0.5, SWEET.top).setScale(scale)
        const wide = img.displayWidth
        const base = y + img.displayHeight * (1 - SWEET.top)
        const foam = scene.add.image(x, base - wide * 0.14, FOAM).setScale((wide * 1.16) / 220)
        const ring = scene.add.image(x, base - wide * 0.14, RING).setScale((wide * SWEET.ring) / 240).setVisible(false)
        view.add(foam, WD.foam)
        view.add(ring, WD.ring)
        view.add(img, WD.sweet + y / 1000)
        return { def, col, lane, x, y, scale, img, foam, ring, gone: false }
    }

    const setDim = (s: SweetView, dim: boolean) => {
        if (s.gone) return
        if (dim) s.img.setTint(FUTURE_TINT)
        else s.img.clearTint()
        s.foam.setAlpha(dim ? 0.6 : 1)
    }

    const stopPulses = () => {
        pulses.forEach(t => t.stop())
        pulses = []
        list.forEach(s => s.ring.setVisible(false).setAlpha(1))
    }

    const dropZones = () => {
        zones.forEach(z => z.destroy())
        zones = []
    }

    const sweets: Sweets = {
        build(columns) {
            sweets.clear()
            list = columns.flatMap((column, col) => column.map((def, lane) => make(def, col, lane)))
        },
        activate(col, onPick) {
            sweets.deactivate()
            list.forEach(s => setDim(s, s.col > col))
            sweets.column(col).forEach(s => {
                s.ring.setVisible(true).setAlpha(0.5).setScale(s.ring.scale)
                const base = s.ring.scale
                pulses.push(
                    scene.tweens.add({
                        targets: s.ring,
                        alpha: 1,
                        scale: base * 1.06,
                        duration: 620,
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                    }),
                )
                const center = view.toScreen(s.x, s.y + s.img.displayHeight * (0.5 - SWEET.top))
                const size = Math.max(SWEET.hit, s.img.displayWidth * view.root.scale)
                const zone = scene.add
                    .zone(center.x, center.y, size, Math.max(SWEET.hit, s.img.displayHeight * view.root.scale + 20))
                    .setDepth(DEPTH.veil - 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerover', () => s.img.setScale(s.scale * SWEET.hover))
                zone.on('pointerout', () => s.img.setScale(s.scale))
                zone.on('pointerdown', () => {
                    s.img.setScale(s.scale)
                    onPick(s)
                })
                zones.push(zone)
            })
        },
        deactivate() {
            dropZones()
            stopPulses()
            list.forEach(s => s.img.setScale(s.scale))
        },
        column(col) {
            return list.filter(s => s.col === col && !s.gone)
        },
        at(col, lane) {
            return list.find(s => s.col === col && s.lane === lane && !s.gone)
        },
        rect(col) {
            const ss = list.filter(s => s.col === col)
            const left = Math.min(...ss.map(s => s.x - s.img.displayWidth / 2))
            const right = Math.max(...ss.map(s => s.x + s.img.displayWidth / 2))
            const top = Math.min(...ss.map(s => s.y - s.img.displayHeight * SWEET.top))
            const bottom = Math.max(...ss.map(s => bottomOf(s)))
            return view.toScreenRect({ x: (left + right) / 2, y: (top + bottom) / 2, w: right - left + 40, h: bottom - top + 40 })
        },
        async bounce(s) {
            await FX.to(scene, s.img, { y: s.y - 12 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            s.img.setY(s.y)
        },
        async dip(s) {
            await FX.to(scene, s.img, { y: s.y + 10, scaleX: s.scale * 1.05, scaleY: s.scale * 0.94 }, { duration: 110 })
            await FX.to(scene, s.img, { y: s.y, scaleX: s.scale, scaleY: s.scale }, { duration: 380, ease: 'Back.easeOut' })
        },
        async sink(s) {
            s.gone = true
            s.ring.setVisible(false)
            await FX.to(scene, s.img, { angle: 6 }, { duration: 90, yoyo: true, repeat: 2 })
            s.img.setAngle(0)
            for (let i = 0; i < 6; i++) {
                const b = scene.add.image(s.x - 50 + i * 20, bottomOf(s) - 10, BUBBLE_DOT).setAlpha(0)
                view.add(b, WD.fx)
                extras.push(b)
                void FX.wait(scene, i * 120)
                    .then(() => FX.to(scene, b, { alpha: 1, y: b.y - 30, scale: 1.4 }, { duration: 500 }))
                    .then(() => {
                        extras = extras.filter(e => e !== b)
                        b.destroy()
                    })
            }
            await FX.all(
                FX.to(scene, s.img, { y: s.y + s.img.displayHeight * 0.55, alpha: 0, scaleY: s.scale * 0.6 }, { duration: 1100, ease: 'Sine.easeIn' }),
                FX.to(scene, s.foam, { alpha: 0, scale: s.foam.scale * 0.5 }, { duration: 1100 }),
            )
            s.img.setVisible(false)
            s.foam.setVisible(false)
        },
        clear() {
            sweets.deactivate()
            list.forEach(s => {
                scene.tweens.killTweensOf([s.img, s.foam, s.ring])
                s.img.destroy()
                s.foam.destroy()
                s.ring.destroy()
            })
            list = []
            extras.forEach(e => e.destroy())
            extras = []
        },
        destroy() {
            sweets.clear()
        },
    }
    return sweets
}

export const feetOn = (s: SweetView): Vec => ({ x: s.x, y: s.y })
