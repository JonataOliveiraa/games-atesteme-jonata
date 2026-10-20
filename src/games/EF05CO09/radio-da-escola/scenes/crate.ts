import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL, UI_SHEET, cellKey, coverFrame } from '../data/files'
import { OWNERS } from '../data/owners'
import { CRATE, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL } from '../data/words'
import type { Cd, Layout, Rect } from '../types'
import { baked, fitInto } from './art'

export interface Crate {
    show(cds: Cd[], layout: Layout): Promise<void>
    enable(onPick: (index: number) => void): void
    disable(): void
    press(index: number): Promise<void>
    take(index: number): { x: number; y: number; size: number }
    open(index: number): Promise<void>
    close(): Promise<void>
    onOpen(cb: (index: number | null) => void): void
    clear(): void
    rect(): Rect
    casesRect(): Rect
    notesRect(): Rect
    cardRect(): Rect
    playRect(): Rect
    backRect(): Rect
    destroy(): void
}

interface Item {
    box: Phaser.GameObjects.Container
    cover: Phaser.GameObjects.Image
    border: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    x: number
    y: number
    paperH: number
}

interface Card {
    index: number
    box: Phaser.GameObjects.Container
    cover: Phaser.GameObjects.Image
    play: Phaser.GameObjects.Container
    back: Phaser.GameObjects.Container
    zones: Phaser.GameObjects.Zone[]
}

type Row = (typeof CRATE)['row'] | (typeof CRATE)['row4']

const PANEL = 'rde-card'
const DASH = 'rde-paper-dash'
const PLAY = 'rde-btn-play'
const BACK = 'rde-btn-back'

const K = CRATE.card
const G = CRATE.grid

export function createCrate(scene: Phaser.Scene): Crate {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 1).setDepth(DEPTH.veil).setAlpha(0).setVisible(false)
    const shade = scene.add
        .rectangle(W / 2, H / 2, W, H, C.shadow, 1)
        .setDepth(DEPTH.crate + 3)
        .setAlpha(0)
        .setVisible(false)
        .setInteractive()
    let items: Item[] = []
    let layout: Layout = 'row'
    let row: Row = CRATE.row
    let pick: ((index: number) => void) | null = null
    let pulse: Phaser.Tweens.Tween | undefined
    let card: Card | null = null
    let cards: Cd[] = []
    let listener: ((index: number | null) => void) | null = null
    let settle: (() => void) | null = null

    const move = (target: Phaser.GameObjects.Container, props: Record<string, unknown>, duration: number, ease: string) =>
        new Promise<void>(resolve => {
            settle = resolve
            void FX.to(scene, target, props, { duration, ease }).then(resolve)
        })

    bakeParts(scene)

    const top = () => (layout === 'grid' ? G.y - G.gapY / 2 - G.caseSize / 2 - CRATE.pad : row.caseY - row.caseSize / 2 - CRATE.pad)
    const bottomOf = (it: Item) =>
        layout === 'grid' ? it.y + G.caseSize / 2 + CRATE.pad : row.noteY + it.paperH / 2 + CRATE.pad
    const widthOf = () => (layout === 'grid' ? G.caseSize + CRATE.pad * 2 : Math.max(row.caseSize, row.noteW) + CRATE.pad * 2)

    const stopPulse = () => {
        pulse?.stop()
        pulse = undefined
        items.forEach(it => it.border.setAlpha(0))
    }

    const setZones = () => {
        const on = !!pick && !card
        items.forEach(it => {
            if (it.zone.input) it.zone.input.enabled = on
        })
        card?.zones.forEach(z => {
            if (z.input) z.input.enabled = !!pick
        })
    }

    const coverImage = (cd: Cd, x: number, y: number, size: number) => {
        const art = coverFrame(cd.cover)
        return fitInto(scene.add.image(x, y, art.key, art.frame), size * CRATE.window)
    }

    const paperParts = (cd: Cd, x: number, y: number, w: number, h: number, font: number, sign: number) => {
        if (cd.note === null) return { parts: [scene.add.image(x, y, DASH).setDisplaySize(w, h || w * 0.6)], h: h || w * 0.6 }
        const paper = scene.add.image(x, y, UI_SHEET.key, cellKey(UI_CELL.paper))
        if (h) paper.setDisplaySize(w, h)
        else fitInto(paper, w)
        const paperH = paper.displayHeight
        const note = scene.add
            .text(x, y - paperH / 2 + paperH * CRATE.noteTop, cd.note, {
                fontFamily: FONT.body,
                fontSize: `${font}px`,
                color: CSS.ink,
                align: 'center',
                wordWrap: { width: w - 56, useAdvancedWrap: true },
                lineSpacing: 2,
            })
            .setOrigin(0.5, 0)
            .setResolution(2)
        const parts: Phaser.GameObjects.GameObject[] = [paper, note]
        if (cd.owner)
            parts.push(
                scene.add
                    .text(x - w / 2 + 30, y + paperH / 2 - 18, LABEL.sign(OWNERS[cd.owner].name), {
                        fontFamily: FONT.black,
                        fontSize: `${sign}px`,
                        color: CSS.accent,
                    })
                    .setOrigin(0, 1)
                    .setResolution(2),
            )
        return { parts, h: paperH }
    }

    const frame = (w: number, y0: number, h: number) => {
        const border = scene.add.graphics()
        border.lineStyle(7, C.glow, 1)
        border.strokeRoundedRect(-w / 2, y0, w, h, 22)
        border.setAlpha(0)
        return border
    }

    const zoneFor = (x: number, y: number, w: number, h: number) => {
        const zone = scene.add
            .zone(x, y, w, h)
            .setDepth(DEPTH.crate + 1)
            .setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        return zone
    }

    const buildRow = (cd: Cd, x: number): Item => {
        const cover = coverImage(cd, 0, row.caseY, row.caseSize)
        const shell = fitInto(scene.add.image(0, row.caseY, UI_SHEET.key, cellKey(UI_CELL.case)), row.caseSize)
        const paper = paperParts(cd, 0, row.noteY, row.noteW, row.noteH, row.font, row.sign)
        const w = widthOf()
        const y0 = top()
        const h = row.noteY + paper.h / 2 + CRATE.pad - y0
        const border = frame(w, y0, h)
        const box = scene.add.container(x, 0, [border, cover, shell, ...paper.parts]).setDepth(DEPTH.crate)
        return { box, cover, border, zone: zoneFor(x, y0 + h / 2, w, h), x, y: row.caseY, paperH: paper.h }
    }

    const buildCell = (cd: Cd, x: number, y: number): Item => {
        const cover = coverImage(cd, 0, 0, G.caseSize)
        const shell = fitInto(scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.case)), G.caseSize)
        const w = widthOf()
        const border = frame(w, -w / 2, w)
        const box = scene.add.container(x, y, [border, cover, shell]).setDepth(DEPTH.crate)
        return { box, cover, border, zone: zoneFor(x, y, w, w), x, y, paperH: 0 }
    }

    const button = (x: number, key: string, label: string, ink: string) => {
        const face = scene.add.image(0, 0, key)
        const text = scene.add
            .text(24, -K.step / 2, label, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: ink })
            .setOrigin(0.5)
            .setResolution(2)
        return scene.add.container(x, K.buttonY, [face, text])
    }

    const playX = () => K.x + (K.buttonW + K.buttonGap) / 2
    const backX = () => K.x - (K.buttonW + K.buttonGap) / 2

    const buildCard = (index: number): Card => {
        const cd = cards[index]
        const panel = scene.add.image(K.x, K.y, PANEL)
        const cover = coverImage(cd, K.caseX, K.caseY, K.caseSize)
        const shell = fitInto(scene.add.image(K.caseX, K.caseY, UI_SHEET.key, cellKey(UI_CELL.case)), K.caseSize)
        const paper = paperParts(cd, K.noteX, K.noteY, K.noteW, K.noteH, K.font, K.sign)
        const play = button(playX(), PLAY, LABEL.play, CSS.ink)
        const back = button(backX(), BACK, LABEL.back, CSS.white)
        const box = scene.add.container(0, 0, [panel, cover, shell, ...paper.parts, back, play]).setDepth(DEPTH.crate + 4)
        const zones = [play, back].map(b =>
            scene.add
                .zone(b.x, b.y, K.buttonW, K.buttonH + K.step)
                .setDepth(DEPTH.crate + 5)
                .setInteractive({ useHandCursor: true }),
        )
        zones[0].on('pointerdown', () => {
            if (!pick || card?.index !== index) return
            const cb = pick
            crate.disable()
            void FX.press(scene, play, 0.94)
            cb(index)
        })
        zones[1].on('pointerdown', () => {
            if (!pick || card?.index !== index) return
            void FX.press(scene, back, 0.94)
            void crate.close()
        })
        return { index, box, cover, play, back, zones }
    }

    const dropCard = () => {
        if (!card) return
        card.zones.forEach(z => z.destroy())
        const done = settle
        settle = null
        done?.()
        card.box.destroy()
        card = null
    }

    const crate: Crate = {
        async show(cds, mode) {
            crate.clear()
            layout = mode
            cards = cds
            row = cds.length > 2 ? CRATE.row4 : CRATE.row
            items =
                mode === 'grid'
                    ? cds.map((cd, i) => {
                          const col = i % G.cols
                          const line = Math.floor(i / G.cols)
                          return buildCell(cd, W / 2 + (col - (G.cols - 1) / 2) * G.gapX, G.y + (line - 0.5) * G.gapY)
                      })
                    : cds.map((cd, i) => buildRow(cd, W / 2 + (i - (cds.length - 1) / 2) * row.gap))
            items.forEach((it, i) => {
                it.zone.on('pointerdown', () => {
                    if (!pick || card) return
                    if (layout === 'grid') {
                        void crate.open(i)
                        return
                    }
                    const cb = pick
                    crate.disable()
                    cb(i)
                })
                it.zone.on('pointerover', () => {
                    if (pick && !card) it.box.setScale(1.02)
                })
                it.zone.on('pointerout', () => it.box.setScale(1))
                it.box.setAlpha(0)
            })
            veil.setVisible(true)
            void FX.to(scene, veil, { alpha: 0.62 }, { duration: 300 })
            await FX.all(
                ...items.map((it, i) =>
                    FX.wait(scene, i * TIMING.cdGap).then(() => FX.slideIn(scene, it.box, { dy: -30, duration: TIMING.cdIn })),
                ),
            )
        },
        enable(onPick) {
            pick = onPick
            stopPulse()
            setZones()
            items.forEach(it => it.border.setAlpha(1))
            pulse = scene.tweens.add({
                targets: items.map(it => it.border),
                alpha: 0.25,
                duration: 520,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },
        disable() {
            pick = null
            setZones()
            items.forEach(it => it.box.setScale(1))
            stopPulse()
        },
        async press(index) {
            if (card && card.index === index) {
                await FX.press(scene, card.play, 0.94)
                return
            }
            const it = items[index]
            if (!it) return
            it.border.setAlpha(1)
            await FX.press(scene, it.box, 0.94)
        },
        take(index) {
            crate.disable()
            const it = items[index]
            const fromCard = card?.index === index
            items.forEach((other, i) => {
                const mine = i === index && !fromCard
                void FX.to(scene, other.box, { alpha: 0 }, { duration: mine ? TIMING.discFly : 260, delay: mine ? 120 : 0 })
            })
            void FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.discFly }).then(() => veil.setVisible(false))
            if (card && fromCard) {
                card.cover.setVisible(false)
                card.zones.forEach(z => {
                    if (z.input) z.input.enabled = false
                })
                void FX.to(scene, card.box, { alpha: 0 }, { duration: TIMING.discFly, delay: 120 })
                void FX.to(scene, shade, { alpha: 0 }, { duration: TIMING.discFly }).then(() => shade.setVisible(false))
                return { x: K.caseX, y: K.caseY, size: K.caseSize * CRATE.window }
            }
            it?.cover.setVisible(false)
            const size = layout === 'grid' ? G.caseSize : row.caseSize
            return { x: it?.x ?? W / 2, y: it?.y ?? H / 2, size: size * CRATE.window }
        },
        async open(index) {
            if (layout !== 'grid' || !cards[index]) return
            if (card?.index === index) return
            if (card) dropCard()
            const it = items[index]
            card = buildCard(index)
            const c = card
            setZones()
            items.forEach(other => other.box.setScale(1))
            listener?.(index)
            scene.tweens.killTweensOf(shade)
            shade.setVisible(true)
            void FX.to(scene, shade, { alpha: 0.55 }, { duration: 220 })
            c.box.setScale(0.3).setAlpha(0)
            c.box.setPosition((it.x - K.x) * 0.7, (it.y - K.y) * 0.7)
            await move(c.box, { scale: 1, alpha: 1, x: 0, y: 0 }, 300, 'Back.easeOut')
        },
        async close() {
            if (!card) return
            const c = card
            const it = items[c.index]
            c.zones.forEach(z => {
                if (z.input) z.input.enabled = false
            })
            scene.tweens.killTweensOf(shade)
            void FX.to(scene, shade, { alpha: 0 }, { duration: 200 }).then(() => {
                if (!card) shade.setVisible(false)
            })
            await move(c.box, { scale: 0.3, alpha: 0, x: it ? (it.x - K.x) * 0.7 : 0, y: it ? (it.y - K.y) * 0.7 : 0 }, 220, 'Sine.easeIn')
            if (card !== c) return
            dropCard()
            setZones()
            listener?.(null)
        },
        onOpen(cb) {
            listener = cb
        },
        clear() {
            crate.disable()
            const had = !!card
            dropCard()
            if (had) listener?.(null)
            items.forEach(it => {
                it.zone.destroy()
                it.box.destroy()
            })
            items = []
            cards = []
            scene.tweens.killTweensOf([veil, shade])
            veil.setAlpha(0).setVisible(false)
            shade.setAlpha(0).setVisible(false)
        },
        rect() {
            if (!items.length) return { x: W / 2, y: H / 2, w: 10, h: 10 }
            const xs = items.map(it => it.x)
            const left = Math.min(...xs) - widthOf() / 2
            const right = Math.max(...xs) + widthOf() / 2
            const y0 = top()
            const bottom = Math.max(...items.map(bottomOf))
            return { x: (left + right) / 2, y: (y0 + bottom) / 2, w: right - left + 12, h: bottom - y0 + 12 }
        },
        casesRect() {
            if (!items.length) return crate.rect()
            if (layout === 'grid') return crate.rect()
            const left = items[0].x - row.caseSize / 2
            const right = items[items.length - 1].x + row.caseSize / 2
            return { x: (left + right) / 2, y: row.caseY, w: right - left + 24, h: row.caseSize + 24 }
        },
        notesRect() {
            if (!items.length) return crate.rect()
            if (layout === 'grid') return card ? { x: K.noteX, y: K.noteY, w: K.noteW + 24, h: K.noteH + 24 } : crate.rect()
            const h = Math.max(...items.map(it => it.paperH))
            const left = items[0].x - row.noteW / 2
            const right = items[items.length - 1].x + row.noteW / 2
            return { x: (left + right) / 2, y: row.noteY, w: right - left + 24, h: h + 20 }
        },
        cardRect: () => ({ x: K.x, y: K.y, w: K.w + 16, h: K.h + 16 }),
        playRect: () => ({ x: playX(), y: K.buttonY, w: K.buttonW + 20, h: K.buttonH + K.step + 20 }),
        backRect: () => ({ x: backX(), y: K.buttonY, w: K.buttonW + 20, h: K.buttonH + K.step + 20 }),
        destroy() {
            crate.clear()
            veil.destroy()
            shade.destroy()
        },
    }
    return crate
}

function bakeParts(scene: Phaser.Scene) {
    baked(scene, PANEL, K.w, K.h, g => {
        g.fillStyle(C.shadow, 0.5)
        g.fillRoundedRect(6, 10, K.w - 12, K.h - 12, 30)
        g.fillStyle(C.card, 1)
        g.fillRoundedRect(3, 3, K.w - 6, K.h - 10, 30)
        g.lineStyle(6, C.cardRim, 1)
        g.strokeRoundedRect(3, 3, K.w - 6, K.h - 10, 30)
    })
    baked(scene, DASH, K.noteW, K.noteH, g => {
        const r = 14
        const x0 = 4
        const y0 = 4
        const x1 = K.noteW - 4
        const y1 = K.noteH - 4
        const dash = 22
        const gap = 14
        g.lineStyle(5, C.violetLight, 0.9)
        const run = (ax: number, ay: number, bx: number, by: number) => {
            const len = Math.hypot(bx - ax, by - ay)
            for (let d = 0; d < len; d += dash + gap) {
                const e = Math.min(d + dash, len)
                g.lineBetween(ax + ((bx - ax) * d) / len, ay + ((by - ay) * d) / len, ax + ((bx - ax) * e) / len, ay + ((by - ay) * e) / len)
            }
        }
        run(x0 + r, y0, x1 - r, y0)
        run(x1, y0 + r, x1, y1 - r)
        run(x1 - r, y1, x0 + r, y1)
        run(x0, y1 - r, x0, y0 + r)
    })
    const face = (key: string, tone: number, dark: number, icon: (g: Phaser.GameObjects.Graphics, x: number, y: number) => void) =>
        baked(scene, key, K.buttonW, K.buttonH + K.step, g => {
            g.fillStyle(dark, 1)
            g.fillRoundedRect(0, K.step, K.buttonW, K.buttonH, 24)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(0, 0, K.buttonW, K.buttonH, 24)
            g.lineStyle(5, C.line, 1)
            g.strokeRoundedRect(2.5, 2.5, K.buttonW - 5, K.buttonH + K.step - 5, 24)
            icon(g, 50, K.buttonH / 2)
        })
    face(PLAY, C.play, C.playDark, (g, x, y) => {
        g.fillStyle(C.line, 1)
        g.fillTriangle(x - 13, y - 18, x - 13, y + 18, x + 18, y)
    })
    face(BACK, C.back, C.backDark, (g, x, y) => {
        g.fillStyle(C.white, 1)
        g.fillTriangle(x - 18, y, x - 2, y - 16, x - 2, y + 16)
        g.fillRect(x - 4, y - 6, 22, 12)
    })
}
