import Phaser from 'phaser'
import { CARD } from '../data/layout'
import { PEOPLE } from '../data/people'
import { C } from '../data/theme'
import type { Look, Mood, Role } from '../types'
import { JOAO_CELL, JOAO_SHEET, cellKey, faceSource } from '../data/files'
import { baked, hasFrame } from './art'

const FW = CARD.w
const FH = CARD.face

export const faceKey = (role: Role, mood: Mood) => `adf-face-${role}-${mood}`

export function ensureFace(scene: Phaser.Scene, role: Role, mood: Mood = 'calm'): string {
    return baked(scene, faceKey(role, mood), FW, FH, g => paintFace(g, PEOPLE[role].look, mood))
}

export interface FaceArt {
    key: string
    frame?: string
    scale: number
}

export function faceArt(scene: Phaser.Scene, role: Role, mood: Mood, fit: number): FaceArt {
    const joao = role === 'me' ? JOAO_CELL[mood] : undefined
    if (joao !== undefined && hasFrame(scene, JOAO_SHEET.key, cellKey(joao))) {
        const frame = cellKey(joao)
        return { key: JOAO_SHEET.key, frame, scale: fit / scene.textures.getFrame(JOAO_SHEET.key, frame).width }
    }
    const { sheet, cell } = faceSource(role)
    if (hasFrame(scene, sheet.key, cellKey(cell))) {
        return { key: sheet.key, frame: cellKey(cell), scale: fit / scene.textures.getFrame(sheet.key, cellKey(cell)).width }
    }
    return { key: ensureFace(scene, role, mood), scale: fit / (FW - 8) }
}

const LINE = 2.6

function shape(g: Phaser.GameObjects.Graphics, fill: number, draw: () => void, stroke = true) {
    g.fillStyle(fill, 1)
    g.lineStyle(LINE, C.ink, 1)
    draw()
    g.fillPath()
    if (stroke) g.strokePath()
}

function circle(g: Phaser.GameObjects.Graphics, fill: number, x: number, y: number, r: number) {
    g.fillStyle(fill, 1)
    g.fillCircle(x, y, r)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeCircle(x, y, r)
}

function ellipse(g: Phaser.GameObjects.Graphics, fill: number, x: number, y: number, w: number, h: number) {
    g.fillStyle(fill, 1)
    g.fillEllipse(x, y, w, h)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeEllipse(x, y, w, h)
}

function cap(g: Phaser.GameObjects.Graphics, color: number, cx: number, cy: number, r: number, drop = 0.15) {
    shape(g, color, () => {
        g.beginPath()
        g.arc(cx, cy - r * drop, r * 1.06, Math.PI, Math.PI * 2, false)
        g.closePath()
    })
}

export function paintFace(g: Phaser.GameObjects.Graphics, look: Look, mood: Mood) {
    const cx = FW / 2
    const r = look.kid ? 25 : 23
    const cy = look.kid ? 46 : 44
    const hair = look.hair

    ellipse(g, look.shirt, cx, FH + 16, 86, 54)
    g.fillStyle(look.skin, 1)
    g.fillRect(cx - 7, cy + r - 6, 14, 12)

    if (look.style === 'long') {
        shape(g, hair, () => {
            g.beginPath()
            g.arc(cx, cy - 2, r * 1.2, Math.PI, Math.PI * 2, false)
            g.lineTo(cx + r * 1.25, cy + r * 1.25)
            g.lineTo(cx - r * 1.25, cy + r * 1.25)
            g.closePath()
        })
    }
    if (look.style === 'bob') {
        shape(g, hair, () => {
            g.beginPath()
            g.arc(cx, cy, r * 1.18, Math.PI, Math.PI * 2, false)
            g.lineTo(cx + r * 1.18, cy + r * 0.75)
            g.lineTo(cx - r * 1.18, cy + r * 0.75)
            g.closePath()
        })
    }
    if (look.style === 'pony') ellipse(g, hair, cx + r * 1.05, cy + r * 0.2, r * 0.75, r * 1.5)
    if (look.style === 'pigtails') {
        ellipse(g, hair, cx - r * 1.12, cy + r * 0.15, r * 0.7, r * 0.95)
        ellipse(g, hair, cx + r * 1.12, cy + r * 0.15, r * 0.7, r * 0.95)
        circle(g, C.butter, cx - r * 0.92, cy - r * 0.32, 3.5)
        circle(g, C.butter, cx + r * 0.92, cy - r * 0.32, 3.5)
    }
    if (look.style === 'bun') circle(g, hair, cx, cy - r * 1.12, r * 0.42)
    if (look.earrings) {
        g.lineStyle(2, C.petalCore, 1)
        g.strokeCircle(cx - r * 0.98, cy + r * 0.45, 4)
        g.strokeCircle(cx + r * 0.98, cy + r * 0.45, 4)
    }

    circle(g, look.skin, cx, cy, r)

    if (look.style === 'cap') {
        cap(g, look.cap ?? C.ink, cx, cy, r, 0.12)
        ellipse(g, look.cap ?? C.ink, cx + r * 0.95, cy - r * 0.55, r * 0.75, r * 0.32)
    } else if (look.style !== 'long' && look.style !== 'bob') {
        cap(g, hair, cx, cy, r, look.style === 'bun' ? 0.25 : 0.15)
    } else {
        shape(g, hair, () => {
            g.beginPath()
            g.arc(cx, cy - r * 0.12, r * 1.08, Math.PI, Math.PI * 2, false)
            g.lineTo(cx + r * 0.2, cy - r * 0.32)
            g.closePath()
        })
    }
    if (look.style === 'curly') {
        for (let i = 0; i < 6; i++) {
            const a = Math.PI + (i + 0.5) * (Math.PI / 6)
            circle(g, hair, cx + Math.cos(a) * r * 1.02, cy - r * 0.1 + Math.sin(a) * r * 1.02, r * 0.26)
        }
    }
    if (look.style === 'spiky') {
        for (let i = 0; i < 4; i++) {
            const x = cx - r * 0.72 + i * r * 0.48
            shape(g, hair, () => {
                g.beginPath()
                g.moveTo(x - 8, cy - r * 0.92)
                g.lineTo(x, cy - r * 1.45)
                g.lineTo(x + 8, cy - r * 0.92)
                g.closePath()
            })
        }
    }
    if (look.tuft) {
        shape(g, hair, () => {
            g.beginPath()
            g.moveTo(cx - 4, cy - r * 1.1)
            g.lineTo(cx + 6, cy - r * 1.5)
            g.lineTo(cx + 9, cy - r * 1.05)
            g.closePath()
        })
    }
    if (look.bow !== undefined) {
        const bx = cx + r * 0.7
        const by = cy - r * 0.95
        shape(g, look.bow, () => {
            g.beginPath()
            g.moveTo(bx, by)
            g.lineTo(bx - 11, by - 7)
            g.lineTo(bx - 11, by + 7)
            g.closePath()
        })
        shape(g, look.bow, () => {
            g.beginPath()
            g.moveTo(bx, by)
            g.lineTo(bx + 11, by - 7)
            g.lineTo(bx + 11, by + 7)
            g.closePath()
        })
        circle(g, look.bow, bx, by, 3.5)
    }

    const ey = cy + r * 0.18
    const ex = r * 0.4
    g.fillStyle(C.blush, 0.75)
    g.fillEllipse(cx - r * 0.62, cy + r * 0.48, 11, 6)
    g.fillEllipse(cx + r * 0.62, cy + r * 0.48, 11, 6)
    g.lineStyle(1.4, C.accentDark, 0.7)
    ;[-1, 1].forEach(s => {
        for (let k = -1; k <= 1; k++) {
            const x = cx + s * r * 0.62 + k * 3.2
            g.lineBetween(x + 1.5, cy + r * 0.42, x - 1.5, cy + r * 0.54)
        }
    })
    if (look.freckles) {
        g.fillStyle(C.trunk, 0.8)
        ;[-1, 1].forEach(s => {
            g.fillCircle(cx + s * r * 0.42, cy + r * 0.36, 1.3)
            g.fillCircle(cx + s * r * 0.5, cy + r * 0.3, 1.3)
            g.fillCircle(cx + s * r * 0.34, cy + r * 0.3, 1.3)
        })
    }

    if (mood === 'cheer') {
        g.lineStyle(2.6, C.ink, 1)
        ;[-1, 1].forEach(s => {
            g.beginPath()
            g.arc(cx + s * ex, ey + 2, 5, Math.PI * 1.1, Math.PI * 1.9, false)
            g.strokePath()
        })
    } else {
        const big = mood === 'scared' ? 1.25 : 1
        ;[-1, 1].forEach(s => {
            g.fillStyle(C.ink, 1)
            g.fillEllipse(cx + s * ex, ey, 7.5 * big, 9.5 * big)
            g.fillStyle(C.white, 1)
            g.fillCircle(cx + s * ex + 1.5, ey - 2.2, 1.9)
        })
        if (mood === 'worried') {
            g.lineStyle(2.2, C.ink, 1)
            g.lineBetween(cx - ex - 5, ey - 11, cx - ex + 4, ey - 14)
            g.lineBetween(cx + ex + 5, ey - 11, cx + ex - 4, ey - 14)
        }
    }

    if (look.glasses === 'round') {
        g.lineStyle(2, C.ink, 1)
        g.strokeCircle(cx - ex, ey, 8)
        g.strokeCircle(cx + ex, ey, 8)
        g.lineBetween(cx - ex + 8, ey, cx + ex - 8, ey)
    }
    if (look.glasses === 'half') {
        g.lineStyle(2, C.ink, 1)
        ;[-1, 1].forEach(s => {
            g.beginPath()
            g.arc(cx + s * ex, ey + 1, 8, 0, Math.PI, false)
            g.closePath()
            g.strokePath()
        })
        g.lineBetween(cx - ex + 8, ey + 1, cx + ex - 8, ey + 1)
    }

    const my = cy + r * 0.62
    if (look.mustache) {
        g.fillStyle(look.hair, 1)
        g.fillEllipse(cx - 6, my - 4, 13, 6)
        g.fillEllipse(cx + 6, my - 4, 13, 6)
        g.lineStyle(1.6, C.ink, 1)
        g.strokeEllipse(cx - 6, my - 4, 13, 6)
        g.strokeEllipse(cx + 6, my - 4, 13, 6)
    }
    if (look.beard) {
        shape(g, hair, () => {
            g.beginPath()
            g.arc(cx, cy, r, Math.PI * 0.12, Math.PI * 0.88, false)
            g.arc(cx, cy + r * 0.25, r * 0.7, Math.PI * 0.82, Math.PI * 0.18, true)
            g.closePath()
        })
    }

    g.lineStyle(2.4, C.ink, 1)
    if (mood === 'talk' || mood === 'cheer') {
        g.fillStyle(C.accentDark, 1)
        g.beginPath()
        g.arc(cx, my + 1, mood === 'cheer' ? 7 : 5.5, 0, Math.PI, false)
        g.closePath()
        g.fillPath()
        g.strokePath()
    } else if (mood === 'scared') {
        g.fillStyle(C.accentDark, 1)
        g.fillEllipse(cx, my + 3, 7, 9)
        g.strokeEllipse(cx, my + 3, 7, 9)
    } else if (mood === 'worried') {
        g.beginPath()
        g.moveTo(cx - 7, my + 4)
        g.lineTo(cx - 3, my + 1)
        g.lineTo(cx + 1, my + 4)
        g.lineTo(cx + 5, my + 1)
        g.strokePath()
    } else if (!look.beard || look.kid) {
        g.beginPath()
        g.arc(cx, my - 2, 5, Math.PI * 0.2, Math.PI * 0.8, false)
        g.strokePath()
    }
    if (mood === 'scared' || mood === 'worried') {
        shape(g, 0xbfe6f2, () => {
            g.beginPath()
            g.moveTo(cx + r * 0.95, cy - r * 0.55)
            g.lineTo(cx + r * 0.82, cy - r * 0.25)
            g.arc(cx + r * 0.95, cy - r * 0.25, 4.5, Math.PI, 0, true)
            g.closePath()
        })
    }
}
