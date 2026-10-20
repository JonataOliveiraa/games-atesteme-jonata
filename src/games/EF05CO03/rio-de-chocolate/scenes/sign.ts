import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { literals } from '../data/logic'
import { DEPTH, H, SIGN, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL, chipText } from '../data/words'
import type { Literal, Rect, Rule, Term } from '../types'
import { NO, YES, paintImage } from './art'

export interface Sign {
    set(rule: Rule): void
    showBig(): Promise<void>
    dock(): Promise<void>
    bounce(index: number): Promise<void>
    mark(index: number, value: boolean): Promise<void>
    flip(index: number, value: boolean): Promise<void>
    join(value: boolean): Promise<void>
    blame(index: number, withNot: boolean): void
    clearMarks(): void
    rect(): Rect
    notRect(): Rect | null
    pairRect(): Rect | null
    visible(on: boolean): void
    destroy(): void
}

interface Piece {
    literal: Literal
    not?: Phaser.GameObjects.Container
    chip: Phaser.GameObjects.Container
    badge: Phaser.GameObjects.Image
    chipW: number
}

interface Part {
    obj: Phaser.GameObjects.Container | Phaser.GameObjects.Text
    w: number
    full: number
    short: number
}

interface OpPill {
    box: Phaser.GameObjects.Container
    badge: Phaser.GameObjects.Image
}

const SWATCH: Record<string, number> = { rosa: C.rosa, verde: C.verde, marrom: C.marrom }

function icon(g: Phaser.GameObjects.Graphics, t: Term, s: number) {
    const c = s / 2
    const ink = C.line
    g.lineStyle(3, ink, 1)
    if (t.attr === 'color') {
        g.fillStyle(SWATCH[t.value], 1)
        g.fillCircle(c, c, c - 3)
        g.strokeCircle(c, c, c - 3)
        g.fillStyle(C.white, 0.6)
        g.fillCircle(c - 6, c - 6, 4)
    } else if (t.attr === 'shape') {
        g.fillStyle(C.cream, 1)
        if (t.value === 'redondo') {
            g.fillCircle(c, c, c - 4)
            g.strokeCircle(c, c, c - 4)
        } else {
            g.fillRoundedRect(4, 4, s - 8, s - 8, 6)
            g.strokeRoundedRect(4, 4, s - 8, s - 8, 6)
        }
    } else if (t.attr === 'top') {
        g.fillStyle(C.cream, 1)
        g.fillCircle(c, c, c - 3)
        g.strokeCircle(c, c, c - 3)
        if (t.value === 'granulado') {
            const colors = [C.sprinkleC, C.sprinkleB, C.sprinkleC, C.sprinkleB, C.sprinkleC]
            ;[[-8, -6], [6, -9], [9, 4], [-4, 7], [-10, 3]].forEach(([dx, dy], k) => {
                g.lineStyle(5, colors[k], 1)
                g.lineBetween(c + dx - 3, c + dy - 2, c + dx + 3, c + dy + 2)
            })
        } else if (t.value === 'listrado') {
            g.lineStyle(4, C.marromDark, 1)
            ;[-7, 0, 7].forEach(dy => g.lineBetween(c - 11, c + dy, c + 11, c + dy))
        } else {
            g.fillStyle(C.white, 1)
            g.fillEllipse(c - 5, c - 6, 12, 6)
        }
    } else {
        const small = { x: 9, y: s - 10, r: 7 }
        const large = { x: s - 16, y: c + 1, r: 14 }
        const [on, off] = t.value === 'grande' ? [large, small] : [small, large]
        g.lineStyle(2, ink, 0.35)
        g.strokeCircle(off.x, off.y, off.r)
        g.fillStyle(C.cream, 1)
        g.fillCircle(on.x, on.y, on.r)
        g.lineStyle(3, ink, 1)
        g.strokeCircle(on.x, on.y, on.r)
    }
}

function pill(scene: Phaser.Scene, text: string, fill: number, rim: number, w: number = SIGN.pillW) {
    const h = SIGN.chipH
    const art = paintImage(scene, w + 6, h + 8, g => {
        g.fillStyle(rim, 1)
        g.fillRoundedRect(0, 5, w, h, h / 2)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(0, 0, w, h, h / 2)
    })
    art.setOrigin(0.5, (h / 2) / (h + 8))
    const label = scene.add
        .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIGN.text}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    return scene.add.container(0, 0, [art, label])
}

export function createSign(scene: Phaser.Scene): Sign {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.5).setDepth(DEPTH.veil).setVisible(false)
    const box = scene.add.container(SIGN.x, SIGN.y).setDepth(DEPTH.sign)
    let card: Phaser.GameObjects.Image | undefined
    let lead: Phaser.GameObjects.Text | undefined
    let pieces: Piece[] = []
    let parts: Part[] = []
    let op: OpPill | undefined
    let ghosts: Phaser.GameObjects.Image[] = []
    let fullW = 0
    let shortW = 0
    let compact = false
    let big = false

    const clearGhosts = () => {
        ghosts.forEach(g => g.destroy())
        ghosts = []
    }

    const clearAll = () => {
        scene.tweens.killTweensOf(box)
        clearGhosts()
        box.removeAll(true)
        card = undefined
        lead = undefined
        pieces = []
        parts = []
        op = undefined
    }

    const makeChip = (t: Term) => {
        const text = scene.add
            .text(0, 0, chipText(t), { fontFamily: FONT.black, fontSize: `${SIGN.text}px`, color: CSS.ink })
            .setOrigin(0, 0.5)
            .setResolution(2)
        const w = SIGN.chipPad * 2 + SIGN.icon + 10 + text.width
        const h = SIGN.chipH
        const art = paintImage(scene, w + 6, h + 8, g => {
            g.fillStyle(C.chipRim, 1)
            g.fillRoundedRect(0, 5, w, h, 16)
            g.fillStyle(C.chipFace, 1)
            g.fillRoundedRect(0, 0, w, h, 16)
            g.lineStyle(3, C.chipRim, 1)
            g.strokeRoundedRect(1.5, 1.5, w - 3, h - 3, 15)
        })
        art.setOrigin(0.5, (h / 2) / (h + 8))
        const ic = paintImage(scene, SIGN.icon, SIGN.icon, g => icon(g, t, SIGN.icon))
        ic.setPosition(-w / 2 + SIGN.chipPad + SIGN.icon / 2, 0)
        text.setX(-w / 2 + SIGN.chipPad + SIGN.icon + 10)
        return { chip: scene.add.container(0, 0, [art, ic, text]), w }
    }

    const spread = (list: Part[], key: 'full' | 'short') => {
        const total = list.reduce((sum, p) => sum + p.w, 0) + SIGN.gap * (list.length - 1)
        let x = -total / 2
        list.forEach(p => {
            p[key] = p.obj === lead ? x : x + p.w / 2
            x += p.w + SIGN.gap
        })
        return total
    }

    const placeParts = (key: 'full' | 'short') => parts.forEach(p => p.obj.setX(p[key]))

    const layoutBig = () => {
        const h = SIGN.chipH + SIGN.cardPad * 2
        const w = fullW + SIGN.cardPad * 2
        card = paintImage(scene, w + 8, h + 10, g => {
            g.fillStyle(C.shadow, 0.2)
            g.fillRoundedRect(6, 10, w, h, 26)
            g.fillStyle(C.headerFace, 1)
            g.fillRoundedRect(0, 0, w, h, 26)
            g.lineStyle(5, C.headerRim, 1)
            g.strokeRoundedRect(2.5, 2.5, w - 5, h - 5, 24)
        })
        card.setOrigin(w / 2 / (w + 8), h / 2 / (h + 10)).setVisible(big)
        box.addAt(card, 0)
    }

    const bigScale = () => Math.min(SIGN.bigScale, SIGN.bigMaxW / (fullW + SIGN.cardPad * 2))

    const docked = () => {
        const room = SIGN.right - SIGN.left
        const s = Math.min(1, room / shortW)
        const half = (shortW * s) / 2
        return { x: Phaser.Math.Clamp(SIGN.x, SIGN.left + half, SIGN.right - half), s }
    }

    const pieceRect = (o: Phaser.GameObjects.Container, w: number): Rect => ({
        x: box.x + o.x * box.scale,
        y: box.y + o.y * box.scale,
        w: (w + 16) * box.scale,
        h: (SIGN.chipH + 16) * box.scale,
    })

    const sign: Sign = {
        set(rule) {
            clearAll()
            compact = !!rule.op
            lead = scene.add
                .text(0, 2, LABEL.lead, { fontFamily: FONT.black, fontSize: `${SIGN.lead}px`, color: CSS.inkSoft })
                .setOrigin(0, 0.5)
                .setResolution(2)
            parts = [{ obj: lead, w: lead.width, full: 0, short: 0 }]
            literals(rule).forEach((l, i) => {
                if (i > 0 && rule.op) {
                    const pillBox =
                        rule.op === 'e' ? pill(scene, LABEL.e, C.and, C.andDark, SIGN.opW) : pill(scene, LABEL.ou, C.or, C.orDark, SIGN.opW)
                    const badge = scene.add.image(SIGN.opW / 2 - 4, -SIGN.chipH / 2 + 2, YES).setVisible(false)
                    pillBox.add(badge)
                    op = { box: pillBox, badge }
                    parts.push({ obj: pillBox, w: SIGN.opW, full: 0, short: 0 })
                }
                const not = l.not ? pill(scene, LABEL.not, C.not, C.notDark) : undefined
                if (not) parts.push({ obj: not, w: SIGN.pillW, full: 0, short: 0 })
                const { chip, w } = makeChip(l.term)
                const badge = scene.add.image(w / 2 - 8, -SIGN.chipH / 2 + 6, YES).setVisible(false)
                chip.add(badge)
                parts.push({ obj: chip, w, full: 0, short: 0 })
                pieces.push({ literal: l, not, chip, badge, chipW: w })
            })
            fullW = spread(parts, 'full')
            if (compact) {
                shortW = spread(parts.slice(1), 'short')
                parts[0].short = -fullW / 2
            } else {
                parts.forEach(p => (p.short = p.full))
                shortW = fullW
            }
            parts.forEach(p => box.add(p.obj))
            layoutBig()
            if (big) {
                placeParts('full')
                box.setPosition(W / 2, SIGN.bigY).setScale(bigScale())
            } else {
                placeParts('short')
                lead.setAlpha(compact ? 0 : 1)
                const d = docked()
                box.setPosition(d.x, SIGN.y).setScale(d.s)
            }
        },
        async showBig() {
            big = true
            card?.setVisible(true)
            placeParts('full')
            lead?.setAlpha(1)
            veil.setVisible(true).setAlpha(0)
            void FX.to(scene, veil, { alpha: 0.5 }, { duration: TIMING.ruleIn })
            const s = bigScale()
            box.setAlpha(0).setPosition(W / 2, SIGN.bigY).setScale(s * 0.8)
            await FX.to(scene, box, { alpha: 1, scale: s }, { duration: TIMING.ruleIn, ease: 'Back.easeOut' })
        },
        async dock() {
            const d = docked()
            void FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.ruleIn }).then(() => veil.setVisible(false))
            if (compact && lead) {
                card?.setVisible(false)
                void FX.to(scene, lead, { alpha: 0 }, { duration: TIMING.ruleIn / 2 })
                parts.slice(1).forEach(p => void FX.to(scene, p.obj, { x: p.short }, { duration: TIMING.ruleIn, ease: 'Sine.easeInOut' }))
            }
            await FX.to(scene, box, { x: d.x, y: SIGN.y, scale: d.s }, { duration: TIMING.ruleIn, ease: 'Sine.easeInOut' })
            placeParts('short')
            big = false
            card?.setVisible(false)
        },
        async bounce(index) {
            const p = pieces[index]
            if (!p) return
            await FX.to(scene, p.chip, { y: -8 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            p.chip.setY(0)
        },
        async mark(index, value) {
            const p = pieces[index]
            if (!p) return
            p.badge.setTexture(value ? YES : NO).setVisible(true).setScale(1)
            await FX.popIn(scene, p.badge, { from: 0.3, duration: 300 })
        },
        async flip(index, value) {
            const p = pieces[index]
            if (!p) return
            if (p.not) void FX.to(scene, p.not, { y: -10, scale: 1.12 }, { duration: 150, yoyo: true }).then(() => p.not?.setY(0).setScale(1))
            await FX.flip(scene, p.badge, () => p.badge.setTexture(value ? YES : NO), TIMING.flip)
        },
        async join(value) {
            const o = op
            if (!o) return
            clearGhosts()
            const flights = pieces.map(p => {
                const ghost = scene.add.image(p.chip.x + p.badge.x, p.badge.y, p.badge.texture.key)
                box.add(ghost)
                ghosts.push(ghost)
                return FX.to(scene, ghost, { x: o.box.x, y: 0, scale: 0.5, alpha: 0.2 }, { duration: TIMING.link, ease: 'Sine.easeIn' })
            })
            await FX.all(...flights)
            clearGhosts()
            void FX.to(scene, o.box, { y: -10, scale: 1.14 }, { duration: 150, yoyo: true }).then(() => o.box.setY(0).setScale(1))
            o.badge.setTexture(value ? YES : NO).setVisible(true).setScale(1.15)
            await FX.popIn(scene, o.badge, { from: 0.3, duration: 320 })
        },
        blame(index, withNot) {
            const p = pieces[index]
            if (!p) return
            void FX.shake(scene, p.chip, { amount: 8, times: 5 })
            if (withNot && p.not) void FX.shake(scene, p.not, { amount: 8, times: 5 })
        },
        clearMarks() {
            clearGhosts()
            pieces.forEach(p => {
                scene.tweens.killTweensOf(p.badge)
                p.badge.setVisible(false).setScale(1)
            })
            if (op) {
                scene.tweens.killTweensOf(op.badge)
                op.badge.setVisible(false).setScale(1)
            }
        },
        rect() {
            const w = big ? fullW : shortW
            return { x: box.x, y: box.y, w: (w + 40) * box.scale, h: (SIGN.chipH + 30) * box.scale }
        },
        notRect() {
            const p = pieces.find(q => q.not)
            if (!p?.not) return null
            const a = pieceRect(p.not, SIGN.pillW)
            const b = pieceRect(p.chip, p.chipW)
            const left = a.x - a.w / 2
            const right = b.x + b.w / 2
            return { x: (left + right) / 2, y: a.y, w: right - left, h: Math.max(a.h, b.h) }
        },
        pairRect() {
            if (!op || pieces.length < 2) return null
            const first = pieces[0]
            const last = pieces[pieces.length - 1]
            const a = first.not ? pieceRect(first.not, SIGN.pillW) : pieceRect(first.chip, first.chipW)
            const b = pieceRect(last.chip, last.chipW)
            const left = a.x - a.w / 2
            const right = b.x + b.w / 2
            return { x: (left + right) / 2, y: b.y, w: right - left, h: b.h }
        },
        visible(on) {
            box.setVisible(on)
            if (!on) veil.setVisible(false)
        },
        destroy() {
            clearAll()
            box.destroy()
            veil.destroy()
        },
    }
    return sign
}
