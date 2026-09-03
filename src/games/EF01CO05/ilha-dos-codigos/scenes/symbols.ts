import Phaser from 'phaser'
import { ISLAND } from '../data/island'
import { glyphX } from '../data/layout'
import { C } from '../data/theme'
import type { Code, Word } from '../types'

export const SYMBOL_SHEET = 'simbolos-ilha'

export type Tone = 'idle' | 'ok' | 'wrong' | 'dim' | 'hot'

const TONES: Record<Tone, { fill: number; border: number; width: number; alpha: number }> = {
    idle: { fill: C.cream, border: C.creamEdge, width: 5, alpha: 1 },
    ok: { fill: C.cream, border: C.ok, width: 8, alpha: 1 },
    wrong: { fill: C.creamDeep, border: C.bad, width: 8, alpha: 1 },
    dim: { fill: C.creamDeep, border: C.creamEdge, width: 5, alpha: 0.4 },
    hot: { fill: C.white, border: C.warn, width: 8, alpha: 1 },
}

const rad = Phaser.Math.DegToRad

export function paintPanel(
    g: Phaser.GameObjects.Graphics,
    w: number,
    h: number,
    fill: number,
    border: number,
    width = 5,
    radius = 22,
) {
    g.clear()
    g.fillStyle(C.ink, 0.2)
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 9, w, h, radius)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(C.creamEdge, 0.26)
    g.fillRoundedRect(-w / 2 + 6, h / 2 - h * 0.19, w - 12, h * 0.13, radius * 0.4)
    g.fillStyle(C.white, 0.55)
    g.fillRoundedRect(-w / 2 + 9, -h / 2 + 7, w - 18, h * 0.17, radius * 0.4)
    g.lineStyle(width, border, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
}

function drawSun(g: Phaser.GameObjects.Graphics, s: number, color: number) {
    const r = s * 0.23
    g.fillStyle(color, 1)
    for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4
        g.fillTriangle(
            Math.cos(a) * s * 0.41, Math.sin(a) * s * 0.41,
            Math.cos(a + 0.21) * r * 1.04, Math.sin(a + 0.21) * r * 1.04,
            Math.cos(a - 0.21) * r * 1.04, Math.sin(a - 0.21) * r * 1.04,
        )
    }
    g.fillCircle(0, 0, r)
    g.fillStyle(C.cream, 0.45)
    g.fillCircle(-r * 0.3, -r * 0.32, r * 0.36)
}

function drawFish(g: Phaser.GameObjects.Graphics, s: number, color: number) {
    g.fillStyle(color, 1)
    g.fillEllipse(s * 0.05, 0, s * 0.54, s * 0.34)
    g.fillTriangle(-s * 0.12, 0, -s * 0.36, -s * 0.2, -s * 0.36, s * 0.2)
    g.fillTriangle(s * 0.0, -s * 0.15, s * 0.13, -s * 0.31, s * 0.17, -s * 0.12)
    g.fillStyle(C.cream, 1)
    g.fillCircle(s * 0.19, -s * 0.05, s * 0.04)
}

function drawMoon(g: Phaser.GameObjects.Graphics, s: number, color: number) {
    const R = s * 0.36
    const t = s * 0.15
    const points: Phaser.Math.Vector2[] = []
    for (let i = 0; i <= 22; i++) {
        const a = rad(48 + (264 * i) / 22)
        points.push(new Phaser.Math.Vector2(Math.cos(a) * R, Math.sin(a) * R))
    }
    for (let i = 22; i >= 0; i--) {
        const a = rad(48 + (264 * i) / 22)
        points.push(new Phaser.Math.Vector2(
            Math.cos(a) * (R - t) + t * 0.9,
            Math.sin(a) * (R - t),
        ))
    }
    g.fillStyle(color, 1)
    g.fillPoints(points, true)
}

function drawBead(g: Phaser.GameObjects.Graphics, word: Word, s: number) {
    const r = s * 0.31
    g.fillStyle(C.ink, 0.16)
    g.fillEllipse(0, r * 0.94, r * 1.7, r * 0.4)
    g.fillStyle(ISLAND[word].colorDark, 1)
    g.fillCircle(0, r * 0.06, r)
    g.fillStyle(ISLAND[word].color, 1)
    g.fillCircle(0, 0, r * 0.96)
    g.fillStyle(C.white, 0.22)
    g.fillCircle(-r * 0.16, -r * 0.2, r * 0.6)
    g.fillStyle(C.white, 0.75)
    g.fillEllipse(-r * 0.3, -r * 0.4, r * 0.44, r * 0.26)
    g.fillStyle(C.white, 0.85)
    g.fillCircle(r * 0.34, -r * 0.4, r * 0.09)
}

function drawDrum(
    g: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    w: number,
    color: number,
) {
    const h = w * 0.9
    const top = cy - h / 2
    const bottom = cy + h / 2
    const half = w / 2
    const foot = w * 0.42

    g.fillStyle(color, 1)
    g.fillPoints([
        new Phaser.Math.Vector2(cx - half, top),
        new Phaser.Math.Vector2(cx + half, top),
        new Phaser.Math.Vector2(cx + foot, bottom),
        new Phaser.Math.Vector2(cx - foot, bottom),
    ], true)

    g.lineStyle(Math.max(2, w * 0.07), C.cream, 1)
    for (let i = 0; i < 4; i++) {
        const t0 = i / 4
        const t1 = (i + 0.5) / 4
        const t2 = (i + 1) / 4
        g.lineBetween(
            cx - half + w * t0, top + h * 0.24,
            cx - foot + foot * 2 * t1, bottom - h * 0.18,
        )
        g.lineBetween(
            cx - foot + foot * 2 * t1, bottom - h * 0.18,
            cx - half + w * t2, top + h * 0.24,
        )
    }

    g.fillStyle(color, 1)
    g.fillEllipse(cx, top + h * 0.1, w * 1.02, w * 0.34)
    g.fillStyle(C.cream, 1)
    g.fillEllipse(cx, top + h * 0.08, w * 0.8, w * 0.22)
    g.fillStyle(color, 1)
    g.fillEllipse(cx, bottom - h * 0.06, foot * 2.04, foot * 0.5)
}

function drawBeats(g: Phaser.GameObjects.Graphics, word: Word, s: number, color: number) {
    const n = ISLAND[word].beats
    const w = n === 1 ? s * 0.5 : n === 2 ? s * 0.36 : s * 0.27
    const pitch = w * 1.14
    for (let i = 0; i < n; i++) {
        drawDrum(g, glyphX(i, n, pitch), 0, w, color)
    }
}

function drawInstrument(g: Phaser.GameObjects.Graphics, word: Word, s: number, color: number) {
    const kind = ISLAND[word].instrument

    if (kind === 'chocalho') {
        g.fillStyle(color, 1)
        g.fillRoundedRect(-s * 0.145, s * 0.08, s * 0.09, s * 0.28, s * 0.045)
        g.fillCircle(-s * 0.1, -s * 0.06, s * 0.2)
        g.fillStyle(C.cream, 1)
        g.fillCircle(-s * 0.17, -s * 0.13, s * 0.05)
        g.lineStyle(Math.max(3, s * 0.045), color, 1)
        ;[0.3, 0.42].forEach(r => {
            g.beginPath()
            g.arc(s * 0.02, -s * 0.06, r * s, rad(-50), rad(50), false)
            g.strokePath()
        })
        return
    }

    if (kind === 'splash') {
        g.fillStyle(color, 1)
        g.fillCircle(0, -s * 0.1, s * 0.15)
        g.fillTriangle(-s * 0.105, -s * 0.15, s * 0.105, -s * 0.15, 0, -s * 0.42)
        const wave: Phaser.Math.Vector2[] = []
        for (let i = 0; i <= 32; i++) {
            const t = i / 32
            wave.push(new Phaser.Math.Vector2(
                -s * 0.37 + s * 0.74 * t,
                s * 0.24 - Math.sin(t * Math.PI * 2) * s * 0.08,
            ))
        }
        g.lineStyle(Math.max(4, s * 0.062), color, 1)
        g.strokePoints(wave, false, false)
        return
    }

    drawDrum(g, 0, s * 0.08, s * 0.44, color)
    g.lineStyle(Math.max(4, s * 0.05), color, 1)
    g.lineBetween(-s * 0.3, -s * 0.32, -s * 0.11, -s * 0.13)
    g.lineBetween(s * 0.3, -s * 0.32, s * 0.11, -s * 0.13)
    g.fillStyle(color, 1)
    g.fillCircle(-s * 0.31, -s * 0.33, s * 0.05)
    g.fillCircle(s * 0.31, -s * 0.33, s * 0.05)
}

export function drawSymbol(
    g: Phaser.GameObjects.Graphics,
    word: Word,
    code: Code,
    size: number,
) {
    if (code === 'cor') {
        drawBead(g, word, size)
        return
    }
    if (code === 'batidas') {
        drawBeats(g, word, size, C.glyph)
        return
    }
    if (code === 'som') {
        drawInstrument(g, word, size, C.glyph)
        return
    }
    if (word === 'SOL') drawSun(g, size, C.glyph)
    else if (word === 'PEIXE') drawFish(g, size, C.glyph)
    else drawMoon(g, size, C.glyph)
}

function buildGlyph(
    scene: Phaser.Scene,
    word: Word,
    code: Code,
    size: number,
): Phaser.GameObjects.GameObject[] {
    if (code === 'figura' && scene.textures.exists(SYMBOL_SHEET)) {
        const sprite = scene.add.sprite(0, 0, SYMBOL_SHEET, ISLAND[word].frame)
        sprite.setDisplaySize(size * 0.86, size * 0.86)
        return [sprite]
    }
    const g = scene.add.graphics()
    drawSymbol(g, word, code, size)
    return [g]
}

export interface Tile {
    container: Phaser.GameObjects.Container
    word: Word
    code: Code
    setTone(tone: Tone): void
    destroy(): void
}

export function createTile(
    scene: Phaser.Scene,
    word: Word,
    code: Code,
    size: number,
): Tile {
    const container = scene.add.container(0, 0)
    const bg = scene.add.graphics()
    paintPanel(bg, size, size, TONES.idle.fill, TONES.idle.border, TONES.idle.width, size * 0.18)

    container.add(bg)
    buildGlyph(scene, word, code, size).forEach(part => container.add(part))

    return {
        container,
        word,
        code,
        setTone(tone: Tone) {
            const t = TONES[tone]
            paintPanel(bg, size, size, t.fill, t.border, t.width, size * 0.18)
            container.setAlpha(t.alpha)
        },
        destroy() {
            container.destroy()
        },
    }
}

export function createStrip(
    scene: Phaser.Scene,
    words: Word[],
    code: Code,
    size: number,
    pitch: number,
): { container: Phaser.GameObjects.Container; tiles: Tile[] } {
    const container = scene.add.container(0, 0)
    const tiles = words.map((word, i) => {
        const tile = createTile(scene, word, code, size)
        tile.container.setPosition(glyphX(i, words.length, pitch), 0)
        container.add(tile.container)
        return tile
    })
    return { container, tiles }
}
