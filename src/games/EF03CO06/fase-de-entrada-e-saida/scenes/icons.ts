import Phaser from 'phaser'
import { C } from '../data/theme'

export function paintFlower(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
    const s = size / 64
    g.lineStyle(6 * s, 0x2f9e44, 1)
    g.lineBetween(x, y + 4 * s, x, y + 30 * s)
    g.fillStyle(0x2f9e44, 1)
    g.fillEllipse(x + 9 * s, y + 20 * s, 16 * s, 8 * s)
    for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
        g.fillStyle(C.ink, 1)
        g.fillCircle(x + Math.cos(a) * 12 * s, y - 8 * s + Math.sin(a) * 12 * s, 10.5 * s)
    }
    for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2
        g.fillStyle(0xf472b6, 1)
        g.fillCircle(x + Math.cos(a) * 12 * s, y - 8 * s + Math.sin(a) * 12 * s, 8.5 * s)
    }
    g.fillStyle(C.ink, 1)
    g.fillCircle(x, y - 8 * s, 8.5 * s)
    g.fillStyle(0xfacc15, 1)
    g.fillCircle(x, y - 8 * s, 6.5 * s)
}

export function paintFace(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
    const s = size / 64
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(x - 30 * s, y - 24 * s, 60 * s, 48 * s, 8 * s)
    g.fillStyle(0xdbeafe, 1)
    g.fillRoundedRect(x - 26 * s, y - 20 * s, 52 * s, 40 * s, 6 * s)
    g.fillStyle(0xf2c9a0, 1)
    g.fillCircle(x, y + 2 * s, 13 * s)
    g.fillStyle(0xf2b134, 1)
    g.fillCircle(x, y - 12 * s, 8 * s)
    g.fillStyle(C.ink, 1)
    g.fillCircle(x - 5 * s, y, 2 * s)
    g.fillCircle(x + 5 * s, y, 2 * s)
    g.lineStyle(2 * s, C.ink, 1)
    g.beginPath()
    g.arc(x, y + 5 * s, 5 * s, 0.3, Math.PI - 0.3)
    g.strokePath()
}

export function paintCursor(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number) {
    const s = size / 64
    const pts = [
        [0, 0],
        [0, 34],
        [9, 26],
        [16, 40],
        [22, 37],
        [15, 24],
        [27, 24],
    ].map(([px, py]) => new Phaser.Math.Vector2(x + (px - 12) * s, y + (py - 20) * s))
    g.fillStyle(C.white, 1)
    g.fillPoints(pts, true)
    g.lineStyle(3 * s, C.ink, 1)
    g.strokePoints(pts, true)
}

export function paintNote(g: Phaser.GameObjects.Graphics, x: number, y: number, size: number, color: number) {
    const s = size / 40
    const head = (fill: number, grow: number) => {
        g.fillStyle(fill, 1)
        g.fillEllipse(x - 6 * s, y + 12 * s, (15 + grow) * s, (11 + grow) * s)
        g.fillRect(x + 1 * s - grow * 0.5 * s, y - 16 * s - grow * 0.5 * s, (4 + grow) * s, (28 + grow) * s)
        g.fillTriangle(
            x + 1 * s,
            y - 16 * s - grow * s,
            x + (15 + grow) * s,
            y - 8 * s,
            x + 1 * s,
            y - 3 * s + grow * s,
        )
    }
    head(C.ink, 5)
    head(color, 0)
}

export function paintPaper(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    const fold = Math.min(w, h) * 0.22
    const outline = [
        [-w / 2, -h / 2],
        [w / 2 - fold, -h / 2],
        [w / 2, -h / 2 + fold],
        [w / 2, h / 2],
        [-w / 2, h / 2],
    ].map(([px, py]) => new Phaser.Math.Vector2(x + px, y + py))
    g.fillStyle(C.ink, 0.2)
    g.fillPoints(outline.map(p => new Phaser.Math.Vector2(p.x + 3, p.y + 5)), true)
    g.fillStyle(C.white, 1)
    g.fillPoints(outline, true)
    g.lineStyle(4, C.ink, 1)
    g.strokePoints(outline, true)
    g.fillStyle(C.plasticDeep, 1)
    g.fillTriangle(x + w / 2 - fold, y - h / 2, x + w / 2, y - h / 2 + fold, x + w / 2 - fold, y - h / 2 + fold)
    g.lineStyle(3, C.ink, 1)
    g.strokeTriangle(x + w / 2 - fold, y - h / 2, x + w / 2, y - h / 2 + fold, x + w / 2 - fold, y - h / 2 + fold)
}

export function paintKey(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(x - w / 2 - 3, y - h / 2 - 3, w + 6, h + 9, 10)
    g.fillStyle(C.plasticDeep, 1)
    g.fillRoundedRect(x - w / 2, y - h / 2, w, h + 3, 8)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(x - w / 2 + 3, y - h / 2 + 2, w - 6, h - 6, 6)
}
