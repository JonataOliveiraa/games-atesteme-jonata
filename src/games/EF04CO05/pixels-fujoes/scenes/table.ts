import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fontKey, type FontTone } from '../data/glyphs'
import { DEPTH, TABLE, U, W } from '../data/layout'
import { C } from '../data/theme'
import type { Entry, Kind } from '../types'
import { ptext } from './art'
import type { Rect } from './guide'
import { bakePanel, bakePix, cellPix } from './pixelart'

/**
 * A faixa 2 do cabeçalho é o combinado, um cartão por coisa, centrados na tela debaixo da ordem:
 * N1 [▪ ACESO = 1], N2 [▪ = 110] com cada número na cor da sua luz, N3 [O = 0100 1111] com o começo
 * dado mais apagado e separado (é igual em toda letra). Troca a cada fase.
 */
export interface Table {
    setEntries(entries: Entry[]): void
    rect(): Rect
    cardRect(id: string): Rect
    bump(id?: string): Promise<void>
    /** os números do cartão pulam um por um (ou só os `count` primeiros, em todos os cartões juntos) */
    wave(id?: string, count?: number): Promise<void>
    /** o cartão da letra na mira acende, e os números que ela já tem ficam ciano: o próximo é o 1º branco */
    track(id: string | null, done: number): void
    destroy(): void
}

const WAVE_GAP = 260
/** o espaço entre o começo dado e o resto do código */
const SPLIT = 12

type Card = {
    box: Phaser.GameObjects.Container
    plate: Phaser.GameObjects.Image
    keys: { off: string; on: string }
    code: string
    w: number
    digits: Phaser.GameObjects.BitmapText[]
}

const snap = (px: number) => Math.ceil(px / U) * U
const MAX_W = W - 48

export function createTable(scene: Phaser.Scene, kind: Kind, given: number): Table {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)
    const y = TABLE.y
    const cards = new Map<string, Card>()
    let total = 0
    let tracked: { id: string; done: number } | null = null
    const split = (i: number) => (given > 0 && i === given ? SPLIT : 0)

    const digitTone = (code: string, i: number): FontTone => {
        if (kind === 'rgb') return code[i] === '1' ? (['red', 'green', 'blue'] as FontTone[])[i] : 'soft'
        if (kind === 'ascii') return i < given ? 'soft' : 'white'
        return 'white'
    }

    /** o lado esquerdo do cartão: a casa colorida (pixel) ou a plaquinha com a letra */
    const face = (entry: Entry, k: number) => {
        if (kind === 'ascii') {
            const tile = scene.add.image(0, 0, bakePix(scene, `swatch-letra`, cellPix(TABLE.swatch / U, C.paper))).setScale(U)
            const letter = ptext(scene, 0, 2, entry.glyph ?? entry.id, Math.max(3, k + 1), 'dark')
            return { parts: [tile, letter], w: TABLE.swatch }
        }
        const swatch = scene.add.image(0, 0, bakePix(scene, `swatch-${entry.color.toString(16)}`, cellPix(TABLE.swatch / U, entry.color))).setScale(U)
        return { parts: [swatch], w: TABLE.swatch }
    }

    const paint = (id: string, done: number | null) => {
        const card = cards.get(id)
        if (!card) return
        card.digits.forEach((d, i) => d.setFont(fontKey(done !== null && i < done ? 'cyan' : digitTone(card.code, i))))
        card.plate.setTexture(done !== null ? card.keys.on : card.keys.off)
    }

    const build = (entries: Entry[], k: number, gap: number) => {
        root.removeAll(true)
        cards.clear()
        tracked = null
        const pad = 14
        const gapIn = 12
        const made = entries.map(entry => {
            const left = face(entry, k)
            const name = kind === 'bit' ? ptext(scene, 0, 2, entry.name, k, 'white') : null
            const equals = ptext(scene, 0, 2, '=', k, 'soft')
            const digits = [...entry.code].map((d, i) => ptext(scene, 0, 2, d, kind === 'bit' ? TABLE.digit : k, digitTone(entry.code, i)))
            const digitsW = digits.reduce((s, d, i) => s + d.width + split(i), 0) + (digits.length - 1) * 2
            const w = snap(pad * 2 + left.w + gapIn + (name ? name.width + gapIn : 0) + equals.width + gapIn + digitsW)
            return { entry, left, name, equals, digits, w }
        })
        total = made.reduce((s, m) => s + m.w, 0) + (made.length - 1) * gap
        let cursor = W / 2 - total / 2
        made.forEach(m => {
            const cx = cursor + m.w / 2
            cursor += m.w + gap
            const keys = {
                off: bakePanel(scene, 'card', m.w / U, TABLE.cardH / U, { fill: C.panelLight, light: C.rimLight, shade: C.panelDark }),
                on: bakePanel(scene, 'card-on', m.w / U, TABLE.cardH / U, { fill: C.panelLight, inner: C.cyan, light: C.rimLight, shade: C.panelDark }),
            }
            const plate = scene.add.image(0, 0, keys.off).setScale(U)
            let x = -m.w / 2 + pad
            m.left.parts.forEach(p => p.setX(x + m.left.w / 2))
            x += m.left.w + gapIn
            if (m.name) {
                m.name.setX(x + m.name.width / 2)
                x += m.name.width + gapIn
            }
            m.equals.setX(x + m.equals.width / 2)
            x += m.equals.width + gapIn
            m.digits.forEach((d, i) => {
                x += split(i)
                d.setX(x + d.width / 2)
                x += d.width + 2
            })
            const box = scene.add.container(cx, y, [plate, ...m.left.parts, ...(m.name ? [m.name] : []), m.equals, ...m.digits])
            root.add(box)
            cards.set(m.entry.id, { box, plate, keys, code: m.entry.code, w: m.w, digits: m.digits })
        })
        return total
    }

    return {
        setEntries(entries) {
            for (const [k, gap] of [
                [TABLE.text, TABLE.gap],
                [TABLE.text, 20],
                [2, 16],
            ] as const) {
                if (build(entries, k, gap) <= MAX_W) return
            }
        },
        rect: () => ({ x: W / 2, y, w: total + 24, h: TABLE.cardH + 16 }),
        cardRect: id => ({ x: cards.get(id)?.box.x ?? W / 2, y, w: (cards.get(id)?.w ?? 200) + 14, h: TABLE.cardH + 14 }),
        async bump(id) {
            const list = id ? [cards.get(id)?.box] : [...cards.values()].map(c => c.box)
            await FX.all(
                ...list.map((box, i) =>
                    box ? FX.wait(scene, i * 120).then(() => FX.to(scene, box, { y: y - U * 2 }, { duration: 150, yoyo: true })) : Promise.resolve(),
                ),
            )
        },
        async wave(id, count) {
            const list = id ? [cards.get(id)] : [...cards.values()]
            const hop = (d: Phaser.GameObjects.BitmapText) =>
                FX.to(scene, d, { y: 2 - U * 3, scale: 1.3 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' })
            await FX.all(
                ...list.flatMap(card =>
                    (card?.digits ?? []).slice(0, count).map((d, i) => FX.wait(scene, i * WAVE_GAP).then(() => hop(d))),
                ),
            )
        },
        track(id, done) {
            if (tracked?.id === id && tracked.done === done) return
            if (!tracked && !id) return
            if (tracked) paint(tracked.id, null)
            tracked = id && cards.has(id) ? { id, done } : null
            if (tracked) paint(tracked.id, done)
        },
        destroy() {
            root.destroy()
        },
    }
}
