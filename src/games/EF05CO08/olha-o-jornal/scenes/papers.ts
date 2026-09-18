import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import {
    CARD,
    DEPTH,
    H,
    POSE,
    POSTMAN,
    READ,
    READ_POSTMAN,
    STRIP,
    W,
} from '../data/layout'
import { A, C, CSS, FONT, SIZE } from '../data/theme'
import { has, IMAGES, SHEETS } from '../data/files'
import { originLine } from '../data/levels'
import type { Paper } from '../types'
import { drawClueIcon } from './icons'

const fx = (o: unknown) => o as unknown as FxTarget
const HALF_W = CARD.w / 2
const HALF_H = CARD.h / 2
const STEP = CARD.w + STRIP.gap

export interface Reading {
    setShown(on: boolean): void
    deal(papers: readonly Paper[], today: number, rejected: number[]): Promise<void>
    pick(index: number): Promise<void>
    pulse(index: number): void
    setEnabled(on: boolean): void
    posOf(index: number): { x: number; y: number }
    cluesOf(index: number): { x: number; y: number; w: number; h: number }
    allCards(): { x: number; y: number; w: number; h: number }
    allClues(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

interface Card {
    container: Phaser.GameObjects.Container
    g: Phaser.GameObjects.Graphics
    name: Phaser.GameObjects.Text
    headline: Phaser.GameObjects.Text
    lines: Phaser.GameObjects.Text[]
    band: Phaser.GameObjects.Text
}

export function createReading(
    scene: Phaser.Scene,
    opts: { onPick: (index: number) => void },
): Reading {
    const root = scene.add.container(0, 0).setDepth(DEPTH.card)
    const bgLayer = scene.add.container(0, 0).setDepth(DEPTH.bg)

    if (has(scene, IMAGES.kiosk)) {
        bgLayer.add(scene.add.image(W / 2, H / 2, IMAGES.kiosk).setDisplaySize(W, H))
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.wall, 1).fillRect(0, 0, W, H)
        g.fillStyle(C.counter, 1).fillRect(0, 562, W, H - 562)
        bgLayer.add(g)
    }
    const veil = scene.add.graphics()
    veil.fillStyle(C.shadow, A.shadow).fillRect(0, 0, W, H)
    bgLayer.add(veil)

    const prompt = scene.add
        .text(W / 2, READ.promptY, 'Qual jornal você vai distribuir?', {
            fontFamily: FONT,
            fontSize: `${SIZE.prompt}px`,
            color: CSS.cream,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(prompt)

    let postmanSprite: Phaser.GameObjects.Sprite | null = null
    if (has(scene, SHEETS.postman.key)) {
        const w = READ_POSTMAN.h * (POSTMAN.cellW / POSTMAN.cellH)
        postmanSprite = scene.add
            .sprite(READ_POSTMAN.cx, READ_POSTMAN.base, SHEETS.postman.key, POSE.offer)
            .setOrigin(0.5, 1)
            .setDisplaySize(w, READ_POSTMAN.h)
        root.add(postmanSprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.blue, 1)
        g.fillRect(READ_POSTMAN.cx - 60, READ_POSTMAN.base - READ_POSTMAN.h, 120, READ_POSTMAN.h)
        root.add(g)
    }

    /* ── a janela recortada e a fita que corre dentro dela ───────────────── */

    const viewTop = STRIP.cy - HALF_H - STRIP.padY
    const viewH = CARD.h + STRIP.padY * 2

    const strip = scene.add.container(STRIP.x, 0)
    root.add(strip)

    const maskG = scene.make.graphics({}, false)
    maskG.fillStyle(0xffffff, 1)
    maskG.fillRect(STRIP.x, viewTop, STRIP.w, viewH)
    strip.setMask(maskG.createGeometryMask())

    const makeCard = (): Card => {
        const container = scene.add.container(0, STRIP.cy)
        const g = scene.add.graphics()
        container.add(g)

        const mk = (size: number, colour: string, align: 'center' | 'left', wrap: number) =>
            scene.add
                .text(0, 0, '', {
                    fontFamily: FONT,
                    fontSize: `${size}px`,
                    color: colour,
                    align,
                    lineSpacing: 2,
                    wordWrap: { width: wrap },
                })
                .setOrigin(align === 'center' ? 0.5 : 0, 0.5)
                .setResolution(2)

        const name = mk(CARD.nameFont, CSS.cream, 'center', CARD.w - 30)
        name.setY(-HALF_H + CARD.nameH / 2)

        const headline = mk(CARD.headlineFont, CSS.ink, 'center', CARD.w - 44)
        headline.setY(-HALF_H + CARD.headlineTop + CARD.headlineH / 2)

        const lines = [0, 1, 2].map(i => {
            const t = mk(CARD.clueFont, CSS.inkSoft, 'left', CARD.w - CARD.clueTextX - 20)
            t.setPosition(-HALF_W + CARD.clueTextX, -HALF_H + CARD.clueTop + i * CARD.clueGap)
            return t
        })

        const band = mk(24, CSS.white, 'center', CARD.w)
        band.setText('já divulgamos esse').setY(-HALF_H + CARD.nameH + 22).setVisible(false)

        container.add([name, headline, ...lines, band])
        strip.add(container)
        return { container, g, name, headline, lines, band }
    }

    const cards: Card[] = []
    let count = 0
    let rejectedSet = new Set<number>()
    let minX: number = STRIP.x
    let maxX: number = STRIP.x
    let enabled = false

    const paint = (card: Card, index: number) => {
        const off = rejectedSet.has(index)
        const g = card.g
        g.clear()
        g.fillStyle(C.shadow, 0.28)
        g.fillRect(-HALF_W + 6, -HALF_H + 8, CARD.w, CARD.h)
        g.fillStyle(off ? C.grey : C.paper, 1)
        g.fillRect(-HALF_W, -HALF_H, CARD.w, CARD.h)
        g.lineStyle(4, C.ink, 1)
        g.strokeRect(-HALF_W, -HALF_H, CARD.w, CARD.h)

        g.fillStyle(off ? C.greyDim : C.wall, 1)
        g.fillRect(-HALF_W, -HALF_H, CARD.w, CARD.nameH)
        g.lineStyle(4, C.ink, 1)
        g.strokeRect(-HALF_W, -HALF_H, CARD.w, CARD.nameH)

        g.lineStyle(2, C.paperEdge, 1)
        g.lineBetween(-HALF_W + 22, -HALF_H + CARD.ruleY, HALF_W - 22, -HALF_H + CARD.ruleY)

        const clues = ['author', 'year', 'origin'] as const
        clues.forEach((clue, i) =>
            drawClueIcon(g, clue, -HALF_W + CARD.clueIconX, -HALF_H + CARD.clueTop + i * CARD.clueGap),
        )

        if (off) {
            g.fillStyle(C.ink, 0.74)
            g.fillRect(-HALF_W, -HALF_H + CARD.nameH, CARD.w, 44)
        }
        card.band.setVisible(off)
        card.headline.setAlpha(off ? 0.4 : 1)
        card.lines.forEach(t => t.setAlpha(off ? 0.4 : 1))
    }

    /* ── a barrinha que diz que há mais jornais de lado ──────────────────── */

    const rail = scene.add.graphics()
    root.add(rail)

    const paintRail = () => {
        rail.clear()
        if (minX === maxX) return
        const content = count * STEP - STRIP.gap
        const frac = STRIP.w / content
        const travel = maxX - minX
        const k = travel === 0 ? 0 : (maxX - strip.x) / travel
        const x0 = W / 2 - STRIP.railW / 2
        rail.fillStyle(C.cream, 0.22)
        rail.fillRoundedRect(x0, STRIP.railY, STRIP.railW, STRIP.railH, STRIP.railH / 2)
        const knobW = Math.max(56, STRIP.railW * frac)
        rail.fillStyle(C.mustard, 1)
        rail.fillRoundedRect(x0 + (STRIP.railW - knobW) * k, STRIP.railY, knobW, STRIP.railH, STRIP.railH / 2)
    }

    /* ── as duas setas de rolagem ────────────────────────────────────────── */

    const arrows = scene.add.graphics()
    root.add(arrows)

    const paintArrows = () => {
        arrows.clear()
        if (minX === maxX) return
        const draw = (cx: number, dir: -1 | 1, on: boolean) => {
            const a = on ? 1 : 0.28
            arrows.fillStyle(C.shadow, 0.25 * a)
            arrows.fillCircle(cx + 3, STRIP.arrowCy + 5, STRIP.arrowR)
            arrows.fillStyle(C.cream, a)
            arrows.fillCircle(cx, STRIP.arrowCy, STRIP.arrowR)
            arrows.lineStyle(5, C.ink, a)
            arrows.strokeCircle(cx, STRIP.arrowCy, STRIP.arrowR)
            arrows.fillStyle(C.ink, a)
            const s = 15
            if (dir < 0) arrows.fillTriangle(cx + s * 0.5, STRIP.arrowCy - s, cx + s * 0.5, STRIP.arrowCy + s, cx - s * 0.7, STRIP.arrowCy)
            else arrows.fillTriangle(cx - s * 0.5, STRIP.arrowCy - s, cx - s * 0.5, STRIP.arrowCy + s, cx + s * 0.7, STRIP.arrowCy)
        }
        draw(STRIP.arrowLeftCx, -1, strip.x < maxX - 1)
        draw(STRIP.arrowRightCx, 1, strip.x > minX + 1)
    }

    const setStripX = (x: number) => {
        strip.x = Phaser.Math.Clamp(x, minX, maxX)
        paintRail()
        paintArrows()
    }

    const slide = (dir: -1 | 1) => {
        if (!enabled || minX === maxX) return
        const to = Phaser.Math.Clamp(strip.x - dir * STEP, minX, maxX)
        void FX.to(scene, fx(strip), { x: to }, { duration: 260, ease: 'Cubic.easeOut' }).then(() => {
            paintRail()
            paintArrows()
        })
    }

    const arrowZone = (cx: number, dir: -1 | 1) => {
        const z = scene.add
            .zone(cx, STRIP.arrowCy, STRIP.arrowR * 2 + 20, STRIP.arrowR * 2 + 20)
            .setOrigin(0.5)
            .setDepth(DEPTH.card + 2)
            .setInteractive({ useHandCursor: true })
        z.on('pointerdown', () => slide(dir))
        return z
    }
    const zones = [arrowZone(STRIP.arrowLeftCx, -1), arrowZone(STRIP.arrowRightCx, 1)]

    /* ── um toque escolhe; um arrasto rola ───────────────────────────────── */

    const dragZone = scene.add
        .zone(STRIP.x + STRIP.w / 2, STRIP.cy, STRIP.w, viewH)
        .setOrigin(0.5)
        .setDepth(DEPTH.card + 1)
        .setInteractive({ useHandCursor: true })
    zones.push(dragZone)

    let dragging = false
    let dragFrom = 0
    let stripFrom = 0
    let travelled = 0

    dragZone.on('pointerdown', (p: Phaser.Input.Pointer) => {
        if (!enabled) return
        dragging = true
        dragFrom = p.x
        stripFrom = strip.x
        travelled = 0
    })
    dragZone.on('pointermove', (p: Phaser.Input.Pointer) => {
        if (!dragging) return
        travelled = Math.max(travelled, Math.abs(p.x - dragFrom))
        setStripX(stripFrom + (p.x - dragFrom))
    })
    const endDrag = (p: Phaser.Input.Pointer, tap: boolean) => {
        if (!dragging) return
        dragging = false
        if (!tap || travelled > STRIP.tapSlop) return
        const local = p.x - strip.x
        const index = Math.floor(local / STEP)
        if (index < 0 || index >= count) return
        if (local - index * STEP > CARD.w) return
        opts.onPick(index)
    }
    dragZone.on('pointerup', (p: Phaser.Input.Pointer) => endDrag(p, true))
    dragZone.on('pointerout', (p: Phaser.Input.Pointer) => endDrag(p, false))

    const setEnabled = (on: boolean) => {
        enabled = on
        dragging = false
        zones.forEach(z => {
            z.input!.enabled = on
        })
        paintArrows()
    }
    setEnabled(false)

    const cardScreenX = (i: number) => strip.x + i * STEP + HALF_W

    return {
        setShown(on) {
            root.setVisible(on)
            bgLayer.setVisible(on)
            if (!on) setEnabled(false)
        },
        async deal(papers, today, rejected) {
            count = papers.length
            rejectedSet = new Set(rejected)

            while (cards.length < count) cards.push(makeCard())
            cards.forEach((c, i) => c.container.setVisible(i < count))

            const content = count * STEP - STRIP.gap
            if (content <= STRIP.w) {
                const centred = STRIP.x + (STRIP.w - content) / 2
                minX = centred
                maxX = centred
            } else {
                minX = STRIP.x + STRIP.w - content
                maxX = STRIP.x
            }

            postmanSprite?.setFrame(rejected.length ? POSE.down : POSE.offer)

            cards.slice(0, count).forEach((card, i) => {
                const p = papers[i]
                card.name.setText(p.name.toUpperCase())
                card.headline.setText(p.headline)
                card.lines[0].setText(p.author ?? 'não diz quem escreveu')
                card.lines[1].setText(p.year === today ? 'hoje' : `de ${p.year}`)
                card.lines[2].setText(originLine(p))
                paint(card, i)
                card.container.setScale(1).setAlpha(0).setPosition(i * STEP + HALF_W, STRIP.cy - 40)
            })

            setStripX(maxX)

            await FX.all(
                ...cards.slice(0, count).map((card, i) =>
                    FX.wait(scene, i * 100).then(() =>
                        FX.to(
                            scene,
                            fx(card.container),
                            { alpha: 1, y: STRIP.cy },
                            { duration: 300, ease: 'Back.easeOut' },
                        ),
                    ),
                ),
            )
        },
        /**
         * A ESCOLHA, E O JORNAL SENDO ENROLADO.
         *
         * O cartão não some: ele VAI PARAR NA MÃO do carteiro, que tira a folha
         * da bolsa e a enrola. É o que liga a notícia lida ao rolo que voa —
         * sem essa costura, o jornal do arremesso parece outro objeto.
         */
        async pick(index) {
            setEnabled(false)
            const chosen = cards[index]
            const hands = {
                x: READ_POSTMAN.cx + 34,
                y: READ_POSTMAN.base - READ_POSTMAN.h * 0.52,
            }

            await FX.all(
                ...cards
                    .slice(0, count)
                    .filter((_, i) => i !== index)
                    .map(c => FX.to(scene, fx(c.container), { alpha: 0, scale: 0.86 }, { duration: 200 })),
                FX.to(scene, fx(chosen.container), { scale: 1.07 }, { duration: 150, ease: 'Back.easeOut' }),
            )

            /* O cartão sai da fita para poder voar por cima do recorte. */
            const from = { x: strip.x + chosen.container.x, y: chosen.container.y }
            strip.remove(chosen.container)
            root.add(chosen.container)
            chosen.container.setPosition(from.x, from.y)

            postmanSprite?.setFrame(POSE.reload)
            await FX.to(
                scene,
                fx(chosen.container),
                { x: hands.x, y: hands.y, scale: 0.16, alpha: 0 },
                { duration: 400, ease: 'Cubic.easeIn' },
            )

            if (has(scene, SHEETS.flying.key)) {
                const roll = scene.add
                    .sprite(hands.x, hands.y, SHEETS.flying.key, 2)
                    .setDisplaySize(210, 210)
                    .setDepth(DEPTH.card + 3)
                const k = { v: 0 }
                await new Promise<void>(resolve => {
                    scene.tweens.add({
                        targets: k,
                        v: 1,
                        duration: 620,
                        ease: 'Cubic.easeInOut',
                        onUpdate: () => {
                            if (!roll.active) return
                            roll.rotation = k.v * Math.PI * 2.4
                            const s = 210 - k.v * 118
                            roll.setDisplaySize(s, s)
                            roll.setFrame(k.v < 0.4 ? 2 : k.v < 0.72 ? 1 : 0)
                        },
                        onComplete: () => resolve(),
                    })
                })
                await FX.to(scene, fx(roll), { scale: roll.scale * 1.14 }, { duration: 110, yoyo: true })
                roll.destroy()
            } else {
                await FX.wait(scene, 420)
            }

            postmanSprite?.setFrame(POSE.ready)
            await FX.wait(scene, 180)

            root.remove(chosen.container)
            strip.add(chosen.container)
            chosen.container.setScale(1).setAlpha(0)
        },
        pulse(index) {
            void FX.to(
                scene,
                fx(cards[index].container),
                { scale: 1.05 },
                { duration: 260, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' },
            )
        },
        setEnabled,
        posOf(index) {
            return { x: cardScreenX(index), y: STRIP.cy }
        },
        cluesOf(index) {
            return {
                x: cardScreenX(index),
                y: STRIP.cy - HALF_H + CARD.clueTop + CARD.clueGap,
                w: CARD.w - 20,
                h: CARD.clueGap * 2 + 70,
            }
        },
        allCards() {
            return { x: STRIP.x + STRIP.w / 2, y: STRIP.cy, w: STRIP.w + 16, h: CARD.h + 20 }
        },
        allClues() {
            return {
                x: STRIP.x + STRIP.w / 2,
                y: STRIP.cy - HALF_H + CARD.clueTop + CARD.clueGap,
                w: STRIP.w + 16,
                h: CARD.clueGap * 2 + 70,
            }
        },
        destroy() {
            zones.forEach(z => z.destroy())
            maskG.destroy()
            root.destroy()
            bgLayer.destroy()
        },
    }
}
