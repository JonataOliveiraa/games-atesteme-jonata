import type Phaser from 'phaser'
import { C, PIN_TONE } from '../data/theme'
import type { Term } from '../types'

type G = Phaser.GameObjects.Graphics

function miniPin(g: G, cx: number, base: number, h: number, fill: number, dark: number, line = 3) {
    const head = h * 0.2
    const belly = h * 0.27
    const headY = base - h + head
    const bellyY = base - belly
    g.lineStyle(line * 2, C.line, 1)
    g.strokeCircle(cx, headY, head)
    g.strokeEllipse(cx, bellyY, belly * 2, belly * 2.1)
    g.fillStyle(dark, 1)
    g.fillCircle(cx, headY, head)
    g.fillEllipse(cx, bellyY, belly * 2, belly * 2.1)
    g.fillRect(cx - head * 0.5, headY, head, bellyY - headY)
    g.fillStyle(fill, 1)
    g.fillCircle(cx - 1.5, headY - 1, head - 2)
    g.fillEllipse(cx - 2, bellyY - 1, belly * 2 - 6, belly * 2.1 - 4)
    g.fillRect(cx - head * 0.5, headY, head - 2, bellyY - headY)
    g.fillStyle(C.white, 1)
    g.fillRect(cx - head * 0.5, headY + head * 0.95, head, Math.max(2, h * 0.04))
}

export function starShape(g: G, cx: number, cy: number, r: number, fill: number, line = 3) {
    const pts = []
    for (let i = 0; i < 10; i++) {
        const rr = i % 2 === 0 ? r : r * 0.46
        const a = -Math.PI / 2 + (i * Math.PI) / 5
        pts.push({ x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr })
    }
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, C.line, 1)
        g.strokePoints(pts, true)
    }
}

export function termIcon(g: G, t: Term, s: number) {
    const c = s / 2
    if (t.attr === 'color') {
        const tone = PIN_TONE[t.value]
        miniPin(g, c, s - 3, s - 5, tone.fill, tone.dark)
    } else if (t.attr === 'star') {
        starShape(g, c, c + 1, c - 3, C.star)
    } else if (t.attr === 'glasses') {
        const r = s * 0.2
        g.fillStyle(C.lens, 0.6)
        g.fillCircle(c - r - 2, c, r)
        g.fillCircle(c + r + 2, c, r)
        g.lineStyle(4, C.glasses, 1)
        g.strokeCircle(c - r - 2, c, r)
        g.strokeCircle(c + r + 2, c, r)
        g.lineBetween(c - 3, c - 2, c + 3, c - 2)
    } else {
        const big = t.value === 'grande'
        g.fillStyle(C.cream, 1)
        miniPin(g, big ? c + 6 : c - 8, s - 3, big ? s - 5 : s * 0.55, C.lilac, C.inkSoft, big ? 3 : 2)
        g.lineStyle(2, C.line, 0.35)
        if (big) g.strokeCircle(c - 12, s - 10, 5)
        else g.strokeCircle(c + 10, s - 16, 9)
    }
}
