import Phaser from 'phaser'
import { CODER_SHEET, DOT_KEY, FACE, TABLET_SHEET, UI_SHEET, boxKey, cellKey, fujaoKey, letterKey, type BoxState, type Face, type Sheet } from '../data/files'
import { CAP_TOP, CELL_H, FONT_CHARS, GLYPH_H, GLYPH_W, GLYPHS, LINE, fontKey, glyphKey, glyphRows, tileKey, type FontTone, type GlyphStyle } from '../data/glyphs'
import { TABLET } from '../data/layout'
import { C, isDark } from '../data/theme'

/**
 * Toda a arte do jogo é pixel art desenhada aqui, pixel por pixel: o tablet, os fujões, o codificador,
 * a interface, a fonte e as placas do cabeçalho. Cada textura nasce no tamanho de arte e é ampliada
 * em NEAREST, em escala inteira sempre que dá.
 */

type Paint = number | null

export class Pix {
    readonly w: number
    readonly h: number
    readonly data: Paint[]
    constructor(w: number, h: number) {
        this.w = w
        this.h = h
        this.data = new Array(w * h).fill(null)
    }
    get(x: number, y: number): Paint {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null
        return this.data[y * this.w + x]
    }
    set(x: number, y: number, c: Paint) {
        if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
        this.data[y * this.w + x] = c
    }
    rect(x: number, y: number, w: number, h: number, c: Paint) {
        for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c)
    }
    round(x: number, y: number, w: number, h: number, r: number, c: Paint) {
        for (let j = y; j < y + h; j++)
            for (let i = x; i < x + w; i++) {
                const cx = Math.min(Math.max(i + 0.5, x + r), x + w - r)
                const cy = Math.min(Math.max(j + 0.5, y + r), y + h - r)
                if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 <= r * r) this.set(i, j, c)
            }
    }
    disc(cx: number, cy: number, r: number, c: Paint, keep?: (x: number, y: number) => boolean) {
        for (let j = Math.floor(cy - r - 1); j <= cy + r + 1; j++)
            for (let i = Math.floor(cx - r - 1); i <= cx + r + 1; i++) {
                if ((i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 > r * r) continue
                if (keep && !keep(i, j)) continue
                this.set(i, j, c)
            }
    }
    /** cada '#' do mapa na cor, com escala inteira */
    map(rows: string[], x: number, y: number, c: Paint, k = 1) {
        rows.forEach((row, j) => [...row].forEach((ch, i) => ch === '#' && this.rect(x + i * k, y + j * k, k, k, c)))
    }
    /** troca uma cor por outra só onde já há tinta (sombra e luz por dentro do desenho) */
    tint(test: (x: number, y: number) => boolean, from: number, to: number) {
        for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.get(x, y) === from && test(x, y)) this.set(x, y, to)
    }
    /** contorno de 1 pixel em volta de tudo o que foi pintado */
    outline(c: number, diagonal = false) {
        const add: number[] = []
        for (let y = 0; y < this.h; y++)
            for (let x = 0; x < this.w; x++) {
                if (this.get(x, y) !== null) continue
                const near =
                    this.get(x - 1, y) !== null ||
                    this.get(x + 1, y) !== null ||
                    this.get(x, y - 1) !== null ||
                    this.get(x, y + 1) !== null ||
                    (diagonal &&
                        (this.get(x - 1, y - 1) !== null ||
                            this.get(x + 1, y - 1) !== null ||
                            this.get(x - 1, y + 1) !== null ||
                            this.get(x + 1, y + 1) !== null))
                if (near) add.push(y * this.w + x)
            }
        add.forEach(i => (this.data[i] = c))
    }
    draw(ctx: CanvasRenderingContext2D, ox: number, oy: number) {
        for (let y = 0; y < this.h; y++)
            for (let x = 0; x < this.w; x++) {
                const c = this.data[y * this.w + x]
                if (c === null) continue
                ctx.fillStyle = `#${c.toString(16).padStart(6, '0')}`
                ctx.fillRect(ox + x, oy + y, 1, 1)
            }
    }
}

function bakeCanvas(scene: Phaser.Scene, key: string, w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void) {
    if (scene.textures.exists(key)) return key
    const texture = scene.textures.createCanvas(key, w, h)
    if (!texture) return key
    paint(texture.getContext())
    texture.refresh()
    texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    return key
}

export function bakePix(scene: Phaser.Scene, key: string, p: Pix) {
    return bakeCanvas(scene, key, p.w, p.h, ctx => p.draw(ctx, 0, 0))
}

function bakeSheet(scene: Phaser.Scene, sheet: Sheet, cell: (index: number) => Pix) {
    bakeCanvas(scene, sheet.key, sheet.cols * sheet.cellW, sheet.rows * sheet.cellH, ctx => {
        for (let i = 0; i < sheet.cols * sheet.rows; i++) cell(i).draw(ctx, (i % sheet.cols) * sheet.cellW, Math.floor(i / sheet.cols) * sheet.cellH)
    })
}

// ───────────────────────────────────────────── placas da interface

export interface PanelStyle {
    fill: number
    light?: number
    shade?: number
    outline?: number
    /** uma faixa de 1 pixel por dentro do contorno (o aro colorido da faixa de erro) */
    inner?: number
}

/** uma placa de pixel art: contorno, cantos em degrau, luz em cima e sombra embaixo */
export function panelPix(w: number, h: number, s: PanelStyle): Pix {
    const p = new Pix(w, h)
    const o = s.outline ?? C.outline
    p.rect(0, 0, w, h, o)
    p.rect(1, 1, w - 2, h - 2, s.fill)
    if (s.inner !== undefined) {
        p.rect(1, 1, w - 2, 1, s.inner)
        p.rect(1, h - 2, w - 2, 1, s.inner)
        p.rect(1, 1, 1, h - 2, s.inner)
        p.rect(w - 2, 1, 1, h - 2, s.inner)
    }
    if (s.light !== undefined) p.rect(2, s.inner !== undefined ? 2 : 1, w - 4, 1, s.light)
    if (s.shade !== undefined) p.rect(2, h - (s.inner !== undefined ? 3 : 2), w - 4, 1, s.shade)
    ;[
        [0, 0],
        [w - 1, 0],
        [0, h - 1],
        [w - 1, h - 1],
    ].forEach(([x, y]) => p.set(x, y, null))
    p.set(1, 1, o)
    p.set(w - 2, 1, o)
    p.set(1, h - 2, o)
    p.set(w - 2, h - 2, o)
    return p
}

export function bakePanel(scene: Phaser.Scene, name: string, w: number, h: number, s: PanelStyle) {
    return bakePix(scene, `panel-${name}-${w}x${h}`, panelPix(w, h, s))
}

/** uma casa da figurinha em miniatura (combinado, ordem): a cor com luz, sombra e contorno */
export function cellPix(size: number, color: number): Pix {
    const p = new Pix(size, size)
    const [light, shade] = toneOf(color)
    p.rect(0, 0, size, size, C.outline)
    p.rect(1, 1, size - 2, size - 2, color)
    p.rect(2, 1, size - 3, 1, light)
    p.rect(1, 2, 1, size - 4, light)
    p.rect(2, size - 2, size - 3, 1, shade)
    p.rect(size - 2, 2, 1, size - 4, shade)
    return p
}

export function toneOf(color: number): [number, number] {
    if (color === C.lit) return [C.litLight, C.litShade]
    if (color === C.off) return [C.offLight, C.offShade]
    const mix = (to: number, k: number) => {
        const ch = (shift: number) => Math.round(((color >> shift) & 0xff) * (1 - k) + ((to >> shift) & 0xff) * k)
        return (ch(16) << 16) | (ch(8) << 8) | ch(0)
    }
    return [mix(0xffffff, 0.3), mix(0x000000, 0.25)]
}

// ───────────────────────────────────────────── tablet

function tablet(): Pix {
    const p = new Pix(TABLET.w, TABLET.h)
    const s = TABLET.screen
    p.round(0, 0, TABLET.w, TABLET.h, 9, C.outline)
    p.round(1, 1, TABLET.w - 2, TABLET.h - 2, 8, C.caseShade)
    p.round(1, 1, TABLET.w - 3, TABLET.h - 3, 8, C.caseLight)
    p.round(2, 2, TABLET.w - 4, TABLET.h - 4, 7, C.case)
    p.rect(s.x - 2, s.y - 2, s.w + 4, s.h + 4, C.outline)
    p.rect(s.x - 1, s.y - 1, s.w + 2, s.h + 2, C.panelDark)
    p.rect(s.x, s.y, s.w, s.h, C.screen)
    p.rect(TABLET.w / 2 - 1, 3, 2, 2, C.panelDark)
    p.set(TABLET.w / 2 - 1, 3, C.rim)
    p.rect(TABLET.w - 2, 24, 1, 10, C.caseShade)
    p.rect(TABLET.w - 1, 24, 1, 10, C.outline)
    return p
}

// ───────────────────────────────────────────── fujões

function fujao(color: number, face: Face): Pix {
    const p = new Pix(16, 16)
    const lit = !isDark(color)
    const body = color
    const [light, shade] = toneOf(color)
    p.rect(2, 2, 12, 12, body)
    ;[
        [2, 2],
        [13, 2],
        [2, 13],
        [13, 13],
    ].forEach(([x, y]) => p.set(x, y, null))
    p.rect(4, 3, 8, 1, light)
    p.rect(3, 4, 1, 7, light)
    p.set(4, 4, light)
    p.rect(4, 12, 9, 1, shade)
    p.rect(12, 4, 1, 8, shade)

    const eye = lit ? C.outline : C.text
    const dot = lit ? C.white : C.outline
    if (face === 'normal') {
        p.rect(5, 6, 2, 3, eye)
        p.rect(9, 6, 2, 3, eye)
        if (lit) {
            p.set(5, 6, dot)
            p.set(9, 6, dot)
        } else {
            p.rect(6, 7, 1, 2, dot)
            p.rect(9, 7, 1, 2, dot)
        }
    } else if (face === 'blink') {
        p.rect(5, 8, 2, 1, eye)
        p.rect(9, 8, 2, 1, eye)
    } else if (face === 'scared') {
        p.rect(4, 5, 3, 3, eye)
        p.rect(9, 5, 3, 3, eye)
        p.set(5, 6, dot)
        p.set(10, 6, dot)
        p.rect(7, 10, 2, 2, eye)
    } else {
        p.map(['.#.', '#.#'], 4, 7, eye)
        p.map(['.#.', '#.#'], 9, 7, eye)
        p.map(['#..#', '.##.'], 6, 10, eye)
    }
    if (face !== 'scared') {
        const blush = lit ? C.blush : 0x7d3c6e
        p.set(4, 10, blush)
        p.set(11, 10, blush)
    }
    p.outline(C.outline)
    return p
}

const FACES = Object.keys(FACE) as Face[]

/** o fujão de uma cor: 4 expressões numa tira, cada quadro recortado no corpo com o contorno (14 × 14) */
export function ensureFujao(scene: Phaser.Scene, color: number) {
    const key = fujaoKey(color)
    if (scene.textures.exists(key)) return key
    bakeStrip(scene, key, FACES.map(face => fujao(color, face)))
    return key
}

/** o fujão-letra: uma plaquinha creme com a letra grande e dois olhinhos nos cantos de cima */
function letterFujao(ch: string, face: Face): Pix {
    const p = new Pix(16, 16)
    p.rect(2, 2, 12, 12, C.paper)
    ;[
        [2, 2],
        [13, 2],
        [2, 13],
        [13, 13],
    ].forEach(([x, y]) => p.set(x, y, null))
    p.rect(4, 13, 9, 1, C.paperShade)
    p.rect(13, 4, 1, 9, C.paperShade)
    p.map(GLYPHS[ch] ?? GLYPHS['?'], 6, 5, C.outline)
    const eye = C.outline
    if (face === 'normal') {
        p.rect(3, 3, 1, 2, eye)
        p.rect(12, 3, 1, 2, eye)
    } else if (face === 'blink') {
        p.rect(3, 4, 2, 1, eye)
        p.rect(11, 4, 2, 1, eye)
    } else if (face === 'scared') {
        p.rect(3, 2, 2, 2, eye)
        p.rect(11, 2, 2, 2, eye)
    } else {
        p.map(['.#.', '#.#'], 2, 3, eye)
        p.map(['.#.', '#.#'], 11, 3, eye)
    }
    p.outline(C.outline)
    return p
}

export function ensureLetterFujao(scene: Phaser.Scene, ch: string) {
    const key = letterKey(ch)
    if (scene.textures.exists(key)) return key
    bakeStrip(scene, key, FACES.map(face => letterFujao(ch, face)))
    return key
}

/** uma caixinha do código (9 × 11): contorno, aro na cor da luz e o miolo conforme o estado */
export function ensureBox(scene: Phaser.Scene, state: BoxState, rim: number) {
    const key = boxKey(state, rim)
    if (scene.textures.exists(key)) return key
    const p = new Pix(9, 11)
    p.rect(0, 0, 9, 11, C.outline)
    p.rect(1, 1, 7, 9, state === 'next' ? C.white : rim)
    p.rect(2, 2, 5, 7, state === 'next' ? C.panelLight : state === 'done' ? C.panel : C.panelDark)
    return bakePix(scene, key, p)
}

function bakeStrip(scene: Phaser.Scene, key: string, cells: Pix[]) {
    bakeCanvas(scene, key, cells.length * 16, 16, ctx => cells.forEach((p, i) => p.draw(ctx, i * 16, 0)))
    const texture = scene.textures.get(key)
    cells.forEach((_, i) => texture.add(cellKey(i), 0, i * 16 + 1, 1, 14, 14))
}

// ───────────────────────────────────────────── codificador

function coder(firing: boolean): Pix {
    const p = new Pix(CODER_SHEET.cellW, CODER_SHEET.cellH)
    const dy = firing ? 2 : 0
    p.round(3, 25 + dy, 8, 12, 3, C.pinkDark)
    p.round(3, 25 + dy, 7, 11, 3, C.pink)
    p.round(37, 25 + dy, 8, 12, 3, C.pinkDark)
    p.round(38, 25 + dy, 7, 11, 3, C.pink)
    p.round(8, 17 + dy, 32, 28, 6, C.coder)
    p.rect(10, 21 + dy, 2, 21, C.coderLight)
    p.rect(13, 18 + dy, 22, 1, C.coderLight)
    p.rect(36, 21 + dy, 2, 21, C.coderDark)
    p.rect(15, 20 + dy, 18, 10, C.outline)
    p.rect(16, 21 + dy, 16, 8, C.coderScreen)
    p.rect(17, 22 + dy, 2, 1, C.panelLight)
    p.rect(14, 33 + dy, 4, 2, C.cyan)
    p.rect(20, 33 + dy, 4, 2, C.pink)
    p.rect(26, 33 + dy, 4, 2, C.lit)
    p.rect(20, 7 + dy, 8, 11, C.coder)
    p.rect(20, 7 + dy, 2, 11, C.coderLight)
    p.rect(26, 7 + dy, 2, 11, C.coderDark)
    p.rect(20, 12 + dy, 8, 2, C.pink)
    p.rect(20, 14 + dy, 8, 1, C.pinkDark)
    p.disc(24, 5 + dy, 4, C.outline)
    p.disc(24, 5 + dy, 3, firing ? C.cyanLight : C.cyan)
    p.rect(22, 3 + dy, 2, 2, C.white)
    p.outline(C.outline)
    if (firing) {
        p.set(24, 0, C.white)
        p.set(23, 1, C.cyan)
        p.set(25, 1, C.cyan)
        p.set(20, 0, C.cyan)
        p.set(28, 0, C.cyan)
    }
    return p
}

// ───────────────────────────────────────────── interface

function bracket(p: Pix, from: number, to: number, len: number, c: number) {
    const k = 2
    p.rect(from, from, len, k, c)
    p.rect(from, from, k, len, c)
    p.rect(to - len + 1, from, len, k, c)
    p.rect(to - k + 1, from, k, len, c)
    p.rect(from, to - k + 1, len, k, c)
    p.rect(from, to - len + 1, k, len, c)
    p.rect(to - len + 1, to - k + 1, len, k, c)
    p.rect(to - k + 1, to - len + 1, k, len, c)
}

function ui(index: number): Pix {
    const p = new Pix(32, 32)
    switch (index) {
        case 0:
            bracket(p, 3, 28, 7, C.textSoft)
            p.rect(15, 15, 2, 2, C.textSoft)
            p.outline(C.outline)
            break
        case 1:
            bracket(p, 6, 25, 7, C.cyan)
            p.rect(7, 9, 1, 3, C.cyanLight)
            p.rect(9, 7, 3, 1, C.cyanLight)
            p.outline(C.outline)
            break
        case 2:
        case 3: {
            const down = index === 3
            const cy = down ? 17 : 15
            p.disc(16, 18, 13, C.pinkDark)
            p.disc(16, cy, 12.5, down ? 0xe2408c : C.pink)
            p.disc(16, cy, 10.5, C.pinkLight, (x, y) => x + y < 16 + cy - (down ? 6 : 3) && (x + 0.5 - 16) ** 2 + (y + 0.5 - cy) ** 2 > (down ? 8.5 : 8) ** 2)
            p.outline(C.outline)
            break
        }
        case 4:
            p.disc(16, 16, 14, C.rim)
            p.disc(16, 16, 12, C.panelDark)
            p.disc(16, 16, 12, C.panel, (_x, y) => y > 18)
            p.outline(C.outline)
            break
        case 5:
            p.disc(16, 16, 8.5, C.cyanDark)
            p.disc(16, 15, 8, C.cyan)
            p.rect(12, 11, 3, 2, C.cyanLight)
            p.outline(C.outline)
            break
        case 6:
            p.rect(9, 9, 14, 14, C.lit)
            p.outline(C.outline)
            break
        case 7:
            p.rect(8, 8, 16, 16, C.holeRim)
            p.rect(9, 9, 14, 14, C.hole)
            p.rect(9, 22, 14, 1, C.tile)
            p.rect(22, 9, 1, 14, C.tile)
            break
    }
    return p
}

// ───────────────────────────────────────────── números (imagem) e as caixinhas do raio-x

const GLYPH_COLOR: Record<GlyphStyle, number> = { ink: C.outline, light: C.text, glow: C.cyan, mark: C.holeMark }

function bakeGlyphs(scene: Phaser.Scene) {
    Object.entries(GLYPHS).forEach(([ch, rows]) => {
        if (!/[0-9?=]/.test(ch)) return
        ;(Object.keys(GLYPH_COLOR) as GlyphStyle[]).forEach(style => {
            const framed = style === 'light'
            const pad = framed ? 1 : 0
            const p = new Pix(rows[0].length + pad * 2, GLYPH_H + pad * 2)
            p.map(rows, pad, pad, GLYPH_COLOR[style])
            if (framed) p.outline(C.outline, true)
            bakePix(scene, glyphKey(ch, style), p)
        })
        const tile = new Pix(16, 16)
        const hole = ch === '?'
        tile.rect(0, 0, 16, 16, hole ? C.hole : C.tile)
        tile.rect(0, 15, 16, 1, C.grid)
        tile.rect(15, 0, 1, 16, C.grid)
        tile.map(rows, 3, 1, hole ? C.holeMark : C.text, 2)
        bakePix(scene, tileKey(ch), tile)
    })
}

// ───────────────────────────────────────────── a fonte de texto (BitmapText)

const FONT_TONE: Record<FontTone, number> = {
    white: C.text,
    cyan: C.cyan,
    dark: C.outline,
    soft: C.textSoft,
    yellow: C.lit,
    red: C.red,
    green: C.green,
    blue: C.blue,
}
const PER_ROW = 16
const CELL_W = GLYPH_W + 1

function bakeFonts(scene: Phaser.Scene) {
    const rows = Math.ceil(FONT_CHARS.length / PER_ROW)
    const w = PER_ROW * CELL_W
    const h = rows * (CELL_H + 1)
    ;(Object.keys(FONT_TONE) as FontTone[]).forEach(tone => {
        const key = fontKey(tone)
        if (scene.cache.bitmapFont.exists(key)) return
        const p = new Pix(w, h)
        const chars: Record<number, unknown> = {}
        FONT_CHARS.forEach((ch, i) => {
            const glyph = glyphRows(ch)
            if (!glyph) return
            const x = (i % PER_ROW) * CELL_W
            const y = Math.floor(i / PER_ROW) * (CELL_H + 1)
            const gw = glyph[0].length
            p.map(glyph, x, y, FONT_TONE[tone])
            chars[ch.charCodeAt(0)] = {
                x,
                y,
                width: gw,
                height: CELL_H,
                centerX: Math.floor(gw / 2),
                centerY: Math.floor(CELL_H / 2),
                xOffset: 0,
                yOffset: 0,
                xAdvance: ch === ' ' ? 3 : gw + 1,
                data: {},
                kerning: {},
                u0: x / w,
                v0: y / h,
                u1: (x + gw) / w,
                v1: (y + CELL_H) / h,
            }
        })
        bakePix(scene, key, p)
        scene.cache.bitmapFont.add(key, {
            data: { retroFont: true, font: key, size: LINE, lineHeight: LINE, chars },
            texture: key,
            frame: null,
        })
    })
}

/** onde fica a linha de cima das maiúsculas dentro da linha da fonte (para centralizar sem os acentos) */
export const FONT_CAP = { top: CAP_TOP, height: GLYPH_H, line: LINE }

export function ensureArt(scene: Phaser.Scene) {
    bakeSheet(scene, TABLET_SHEET, () => tablet())
    ensureFujao(scene, C.lit)
    ensureFujao(scene, C.off)
    const dot = new Pix(1, 1)
    dot.set(0, 0, C.white)
    bakePix(scene, DOT_KEY, dot)
    bakeSheet(scene, CODER_SHEET, i => coder(i === 1))
    bakeSheet(scene, UI_SHEET, i => ui(i))
    bakeGlyphs(scene)
    bakeFonts(scene)
}
