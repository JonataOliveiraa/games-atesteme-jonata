import Phaser from 'phaser'
import { C } from '../data/theme'

export type G = Phaser.GameObjects.Graphics

export const LW = 6

export function rr(g: G, x: number, y: number, w: number, h: number, r: number, fill: number, line = LW) {
    const radius = Math.min(r, w / 2, h / 2)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, radius)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeRoundedRect(x, y, w, h, radius)
    }
}

export function circle(g: G, x: number, y: number, r: number, fill: number, line = LW) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeCircle(x, y, r)
    }
}

export function ellipse(g: G, x: number, y: number, w: number, h: number, fill: number, line = LW) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokeEllipse(x, y, w, h)
    }
}

export function stroke(g: G, x1: number, y1: number, x2: number, y2: number, width = LW, color: number = C.ink) {
    g.lineStyle(width, color, 1)
    g.lineBetween(x1, y1, x2, y2)
    g.fillStyle(color, 1)
    g.fillCircle(x1, y1, width / 2)
    g.fillCircle(x2, y2, width / 2)
}

export function limb(g: G, x1: number, y1: number, x2: number, y2: number, width: number, fill: number) {
    stroke(g, x1, y1, x2, y2, width + LW * 2, C.ink)
    stroke(g, x1, y1, x2, y2, width, fill)
}

export function arcLine(g: G, x: number, y: number, r: number, from: number, to: number, width = LW, color: number = C.ink) {
    g.lineStyle(width, color, 1)
    g.beginPath()
    g.arc(x, y, r, from, to)
    g.strokePath()
}

export function poly(g: G, points: [number, number][], fill: number, line = LW) {
    const pts = points.map(([x, y]) => new Phaser.Math.Vector2(x, y))
    g.fillStyle(fill, 1)
    g.fillPoints(pts, true)
    if (line > 0) {
        g.lineStyle(line, C.ink, 1)
        g.strokePoints(pts, true)
    }
}

export function drop(g: G, x: number, y: number, size: number, fill: number = C.tear, angle = 0) {
    const pts: [number, number][] = []
    for (let i = 0; i <= 16; i++) {
        const t = (i / 16) * Math.PI * 2
        const r = size * (0.55 + 0.45 * Math.sin(t / 2) ** 3)
        pts.push([Math.sin(t) * r * 0.7, -Math.cos(t) * r])
    }
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    poly(
        g,
        pts.map(([px, py]) => [x + px * cos - py * sin, y + px * sin + py * cos]),
        fill,
        3,
    )
}

export function heart(g: G, x: number, y: number, size: number, fill: number) {
    const pts: [number, number][] = []
    for (let i = 0; i < 40; i++) {
        const t = (i / 40) * Math.PI * 2
        const px = 16 * Math.sin(t) ** 3
        const py = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
        pts.push([x + (px * size) / 17, y - (py * size) / 17])
    }
    poly(g, pts, fill)
}

export function note(g: G, x: number, y: number, size: number, fill: number, beamed = false) {
    const head = size * 0.34
    if (beamed) {
        rr(g, x + head * 0.7, y - size, size * 0.8, size * 0.18, 4, fill, 4)
        stroke(g, x + head * 0.8 + size * 0.8, y - size, x + head * 0.8 + size * 0.8, y - size * 0.1, 6, C.ink)
        ellipse(g, x + size * 0.8, y, head * 2, head * 1.5, fill, 4)
    }
    stroke(g, x + head * 0.8, y - size, x + head * 0.8, y, 6, C.ink)
    ellipse(g, x, y, head * 2, head * 1.5, fill, 4)
    if (!beamed) {
        g.lineStyle(6, C.ink, 1)
        g.beginPath()
        g.moveTo(x + head * 0.8, y - size)
        g.lineTo(x + head * 0.8 + size * 0.4, y - size * 0.62)
        g.strokePath()
    }
}

export type Eyes = 'open' | 'closed' | 'happy' | 'tight' | 'sad' | 'half' | 'puzzled'
export type Mouth = 'smile' | 'grin' | 'o' | 'wail' | 'bigwail' | 'flat' | 'frown' | 'yawn' | 'wavy'

export function face(g: G, x: number, y: number, r: number, eyes: Eyes, mouth: Mouth) {
    const ey = y + r * 0.08
    const sides = [-1, 1]

    g.fillStyle(C.cheek, 0.7)
    sides.forEach(s => g.fillEllipse(x + s * r * 0.6, y + r * 0.36, r * 0.3, r * 0.18))

    sides.forEach(s => {
        const ex = x + s * r * 0.36
        switch (eyes) {
            case 'open':
            case 'sad':
            case 'puzzled':
                g.fillStyle(C.ink, 1)
                g.fillEllipse(ex, ey, r * 0.26, r * 0.34)
                g.fillStyle(C.white, 1)
                g.fillCircle(ex - r * 0.05, ey - r * 0.08, r * 0.07)
                break
            case 'closed':
                arcLine(g, ex, ey - r * 0.06, r * 0.14, 0.1, Math.PI - 0.1, 5)
                break
            case 'happy':
                arcLine(g, ex, ey + r * 0.08, r * 0.14, Math.PI + 0.1, Math.PI * 2 - 0.1, 5)
                break
            case 'tight':
                g.lineStyle(5, C.ink, 1)
                g.beginPath()
                g.moveTo(ex - s * r * 0.14, ey - r * 0.12)
                g.lineTo(ex + s * r * 0.12, ey)
                g.lineTo(ex - s * r * 0.14, ey + r * 0.12)
                g.strokePath()
                break
            case 'half':
                g.fillStyle(C.ink, 1)
                g.beginPath()
                g.arc(ex, ey, r * 0.13, 0, Math.PI)
                g.closePath()
                g.fillPath()
                stroke(g, ex - r * 0.16, ey, ex + r * 0.16, ey, 5)
                break
        }
        if (eyes === 'sad') stroke(g, ex - s * r * 0.16, ey - r * 0.26, ex + s * r * 0.12, ey - r * 0.38, 5)
        if (eyes === 'puzzled' && s === 1) stroke(g, ex - r * 0.14, ey - r * 0.36, ex + r * 0.14, ey - r * 0.3, 5)
        if (eyes === 'puzzled' && s === -1) stroke(g, ex - r * 0.14, ey - r * 0.28, ex + r * 0.14, ey - r * 0.28, 5)
    })

    const my = y + r * 0.46
    switch (mouth) {
        case 'smile':
            arcLine(g, x, my - r * 0.14, r * 0.18, 0.5, Math.PI - 0.5, 5)
            break
        case 'grin':
            g.fillStyle(C.mouth, 1)
            g.beginPath()
            g.arc(x, my - r * 0.1, r * 0.22, 0, Math.PI)
            g.closePath()
            g.fillPath()
            g.lineStyle(5, C.ink, 1)
            g.strokePath()
            break
        case 'o':
            ellipse(g, x, my, r * 0.14, r * 0.18, C.mouth, 4)
            break
        case 'wail':
            ellipse(g, x, my + r * 0.04, r * 0.38, r * 0.34, C.mouth, 5)
            break
        case 'bigwail':
            ellipse(g, x, my + r * 0.08, r * 0.56, r * 0.5, C.mouth, 5)
            break
        case 'flat':
            stroke(g, x - r * 0.14, my, x + r * 0.14, my, 5)
            break
        case 'frown':
            arcLine(g, x, my + r * 0.16, r * 0.16, Math.PI + 0.6, Math.PI * 2 - 0.6, 5)
            break
        case 'yawn':
            ellipse(g, x, my + r * 0.08, r * 0.3, r * 0.48, C.mouth, 5)
            break
        case 'wavy':
            g.lineStyle(5, C.ink, 1)
            g.beginPath()
            g.moveTo(x - r * 0.18, my)
            g.lineTo(x - r * 0.06, my - r * 0.06)
            g.lineTo(x + r * 0.06, my + r * 0.04)
            g.lineTo(x + r * 0.18, my - r * 0.04)
            g.strokePath()
            break
    }
}

export type Hair = 'short' | 'braids' | 'baby' | 'bun'

export function head(g: G, x: number, y: number, r: number, hair: Hair, hairColor: number = C.hair) {
    if (hair === 'braids') {
        ;[-1, 1].forEach(s => {
            circle(g, x + s * r * 1.02, y + r * 0.5, r * 0.3, hairColor)
            circle(g, x + s * r * 0.98, y + r * 0.2, r * 0.12, C.coral, 4)
        })
    }
    if (hair === 'bun') circle(g, x, y - r * 1.02, r * 0.36, hairColor)
    if (hair !== 'baby') circle(g, x, y - r * 0.08, r * 1.04, hairColor)
    ellipse(g, x, y + r * 0.1, r * 1.86, r * 1.72, C.skin)
    if (hair !== 'baby') {
        g.fillStyle(hairColor, 1)
        g.fillEllipse(x, y - r * 0.55, r * 1.62, r * 0.62)
        g.fillEllipse(x - r * 0.5, y - r * 0.36, r * 0.5, r * 0.5)
        arcLine(g, x, y - r * 0.08, r * 1.04, Math.PI + 0.35, Math.PI * 2 - 0.35)
    } else {
        arcLine(g, x + r * 0.08, y - r * 0.84, r * 0.14, Math.PI * 0.9, Math.PI * 2.2, 5)
    }
}
