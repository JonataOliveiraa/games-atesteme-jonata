import Phaser from 'phaser'
import { C, FONT, PIXEL } from '../data/theme'
import type { Payload, Rect } from '../types'

export type Look = 'structure' | 'decoded' | 'garbage'

const BAR = 0x7b5cc4
const GRID_EMPTY = 0xece3d2
const GRID_EDGE = 0x9a8a78
const TILE = 0xffffff
const TILE_EDGE = 0x9fd8c2
const FILM = 0x4a3f55
const HOLE = 0xf4ecff

export interface DataView {
    readonly container: Phaser.GameObjects.Container
    show(payload: Payload, look: Look, rect: Rect, holdMs?: number): void
    clear(): void
    reveal(t: number): void
    freeze(): void
    destroy(): void
}

export function createDataView(scene: Phaser.Scene): DataView {
    const g = scene.add.graphics()
    const container = scene.add.container(0, 0, [g])
    const letters: Phaser.GameObjects.Text[] = []
    let current: { payload: Payload; look: Look; rect: Rect } | undefined
    let progress = 1
    let clock = 0
    let frozen = false
    let hold = Infinity

    const letter = (i: number) => {
        if (!letters[i]) {
            const t = scene.add.text(0, 0, '', { fontFamily: FONT.black, color: '#4a3530' }).setOrigin(0.5).setResolution(2)
            letters[i] = t
            container.add(t)
        }
        return letters[i].setVisible(true)
    }

    const pixels = (rows: string[], r: Rect, gap: number, cut: number) => {
        const n = rows.length
        const cell = Math.min(r.w, r.h) / n
        const left = r.x - (cell * rows[0].length) / 2
        const top = r.y - (cell * n) / 2
        rows.forEach((row, y) => {
            if (y >= cut) return
            ;[...row].forEach((ch, x) => {
                const color = PIXEL[ch]
                if (color === undefined && gap === 0) return
                g.fillStyle(color ?? GRID_EMPTY, 1)
                g.fillRect(left + x * cell + gap / 2, top + y * cell + gap / 2, cell - gap, cell - gap)
                if (gap > 0) {
                    g.lineStyle(1, GRID_EDGE, 0.55)
                    g.strokeRect(left + x * cell + gap / 2, top + y * cell + gap / 2, cell - gap, cell - gap)
                }
            })
        })
    }

    const paint = () => {
        g.clear()
        letters.forEach(t => t.setVisible(false))
        if (!current) return
        const { payload: p, look, rect: r } = current
        const live = look !== 'structure'
        const shake = look === 'garbage' ? () => Phaser.Math.Between(-3, 3) : () => 0
        if (live) {
            g.fillStyle(C.screen, 1)
            g.fillRoundedRect(r.x - r.w / 2 - 4, r.y - r.h / 2 - 4, r.w + 8, r.h + 8, 8)
            g.lineStyle(2, C.screenDark, 1)
            g.strokeRoundedRect(r.x - r.w / 2 - 4, r.y - r.h / 2 - 4, r.w + 8, r.h + 8, 8)
        }

        if ('samples' in p) {
            const n = p.samples.length
            const step = r.w / n
            const width = live ? step * 0.78 : step * 0.56
            g.lineStyle(2, BAR, 0.5)
            g.lineBetween(r.x - r.w / 2, r.y, r.x + r.w / 2, r.y)
            p.samples.forEach((s, i) => {
                if (i / n >= progress) return
                const wobble = live && look === 'decoded' ? 0.65 + 0.35 * Math.sin(clock * 9 + i * 1.3) : 1
                const jitter = look === 'garbage' ? Phaser.Math.FloatBetween(0.2, 1) : 1
                const h = Math.max(4, s * r.h * 0.92 * wobble * jitter)
                g.fillStyle(look === 'garbage' ? 0x9a8fae : BAR, 1)
                g.fillRoundedRect(r.x - r.w / 2 + i * step + (step - width) / 2 + shake(), r.y - h / 2, width, h, Math.min(width / 2, 5))
            })
            return
        }

        if ('pixels' in p) {
            const cut = Math.ceil(p.pixels.length * progress)
            if (look === 'garbage') {
                const rows = p.pixels.map(row => [...row].map(ch => (Math.random() < 0.35 ? '.' : ch)).join(''))
                pixels(rows, { ...r, x: r.x + shake() }, 1, cut)
                return
            }
            pixels(p.pixels, r, live ? 0 : Math.max(2, Math.min(r.w, r.h) / 40), cut)
            return
        }

        if ('chars' in p) {
            const n = p.chars.length
            const size = Math.min(r.w / n, r.h * 0.8)
            p.chars.forEach((ch, i) => {
                if (i / n >= progress) return
                const x = r.x - (size * n) / 2 + size * (i + 0.5)
                if (!live) {
                    g.fillStyle(TILE, 1)
                    g.fillRoundedRect(x - size * 0.44, r.y - size * 0.44, size * 0.88, size * 0.88, 6)
                    g.lineStyle(2, TILE_EDGE, 1)
                    g.strokeRoundedRect(x - size * 0.44, r.y - size * 0.44, size * 0.88, size * 0.88, 6)
                }
                const t = letter(i)
                t.setText(look === 'garbage' ? '#@%&?!'[Phaser.Math.Between(0, 5)] : ch)
                t.setFontSize(Math.round(size * (live ? 0.9 : 0.62)))
                t.setPosition(x + shake(), r.y + 2)
            })
            return
        }

        const n = p.frames.length
        const fw = r.w / n
        const fh = Math.min(fw * 0.9, r.h * 0.74)
        if (!live) {
            g.fillStyle(FILM, 1)
            g.fillRoundedRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h, 6)
            for (let i = 0; i < n * 3; i++) {
                const hx = r.x - r.w / 2 + (i + 0.5) * (r.w / (n * 3))
                g.fillStyle(HOLE, 1)
                g.fillRect(hx - 3, r.y - r.h / 2 + 4, 6, 6)
                g.fillRect(hx - 3, r.y + r.h / 2 - 10, 6, 6)
            }
            p.frames.forEach((frame, i) => {
                if (i / n >= progress) return
                const fx = r.x - r.w / 2 + fw * (i + 0.5)
                g.fillStyle(C.white, 1)
                g.fillRect(fx - fh / 2 - 2, r.y - fh / 2 - 2, fh + 4, fh + 4)
                pixels(frame, { x: fx, y: r.y, w: fh, h: fh }, 0, frame.length)
            })
            return
        }
        const frame = p.frames[Math.floor(clock * 6) % n]
        pixels(look === 'garbage' ? frame.map(row => [...row].reverse().join('')) : frame, { ...r, x: r.x + shake() }, 0, frame.length)
    }

    const tick = (_: number, delta: number) => {
        if (!current || current.look === 'structure' || frozen) return
        clock += delta / 1000
        if (clock * 1000 >= hold) {
            frozen = true
            clock = 0
        }
        paint()
    }
    scene.events.on('update', tick)

    return {
        container,
        show(payload, look, rect, holdMs = Infinity) {
            current = { payload, look, rect }
            hold = holdMs
            progress = 1
            clock = 0
            frozen = false
            paint()
        },
        clear() {
            current = undefined
            paint()
        },
        reveal(t) {
            progress = Phaser.Math.Clamp(t, 0, 1)
            paint()
        },
        freeze() {
            frozen = true
            clock = 0
            paint()
        },
        destroy() {
            scene.events.off('update', tick)
            container.destroy()
        },
    }
}
