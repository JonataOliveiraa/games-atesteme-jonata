import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { FRUIT_SHEET, cellKey, sheetScale } from '../data/files'
import { FRUITS, FRUIT_CELL } from '../data/fruits'
import { centroid } from '../data/geometry'
import { CARD, DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'
import type { FruitKind, Poly, Rect } from '../types'
import { paintImage, starPoints } from './art'

/**
 * O cabeçalho: o nível, as bolinhas das fases, o `?` e, no meio, o CARTÃO DO
 * PEDIDO. Ele conta a decomposição sem palavra: a fruta se parte em casinhas
 * quando a criança termina de cortar, cada casinha acende quando o pedaço
 * chega, e no fim as casinhas voltam a ser a fruta, com o selo da rainha.
 */
export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    visible(on: boolean): void
    order(kind: FruitKind): void
    split(slots: { id: number; poly: Poly }[]): Promise<void>
    replace(id: number, slots: { id: number; poly: Poly }[]): Promise<void>
    fill(id: number): Promise<void>
    join(): Promise<void>
    cardRect(): Rect
    destroy(): void
}

export interface HeaderOptions {
    level: number
    phases: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

interface Slot {
    id: number
    poly: Poly
    filled: boolean
}

const MINI = (CARD.slot * 0.86) / 460

export function createHeader(scene: Phaser.Scene, opts: HeaderOptions): Header {
    const band = paintImage(scene, W, HEADER.h + 10, g => {
        g.fillStyle(C.shadow, 0.16)
        g.fillRect(0, HEADER.h + 2, W, 8)
        g.fillStyle(C.headerFace, 1)
        g.fillRect(0, 0, W, HEADER.h)
        g.fillStyle(C.headerRim, 1)
        g.fillRect(0, HEADER.h - 6, W, 6)
        g.fillStyle(C.headerLine, 0.55)
        g.fillRect(0, HEADER.h, W, 2)
        HEADER.dividers.forEach(x => {
            g.fillStyle(C.headerRim, 1)
            g.fillRoundedRect(x - 1.5, 18, 3, HEADER.h - 40, 1.5)
        })
    })
        .setOrigin(0, 0)
        .setDepth(DEPTH.header)

    const top = HUD.y - HUD.levelH / 2
    const pill = paintImage(scene, HUD.levelW, HUD.levelH + 4, g => {
        g.fillStyle(C.headerLine, 1)
        g.fillRoundedRect(0, 4, HUD.levelW, HUD.levelH, HUD.levelH / 2)
        g.fillStyle(C.accent, 1)
        g.fillRoundedRect(0, 0, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    })
        .setOrigin(0, 0)
        .setPosition(HUD.levelX, top)
        .setDepth(DEPTH.hud)
    const levelText = scene.add
        .text(HUD.levelX + HUD.levelW / 2, HUD.y, `${LABEL.level} ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const pips = Array.from({ length: opts.phases }, (_, i) =>
        scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.headerSoft).setDepth(DEPTH.hud + 1),
    )
    let current = 0
    const paintPips = () =>
        pips.forEach((pip, i) => {
            const done = i < current
            const now = i === current
            pip.setFillStyle(done ? C.yes : now ? C.butter : C.white)
            pip.setStrokeStyle(3, C.headerLine, done || now ? 1 : 0.5)
            pip.setScale(now ? 1.15 : 1)
        })
    paintPips()

    const lives = createLives(scene, {
        total: opts.livesTotal,
        remaining: opts.livesLeft,
        gameId: opts.gameId,
        x: HUD.livesX,
        y: HUD.livesY,
        size: HUD.livesSize,
        stage: opts.stage,
        depth: DEPTH.hud + 1,
    })
    lives.container.setVisible(false)

    // ── o ?
    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.shadow, 0.25)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.headerLine, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 4}px`, color: '#ffffff' })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = false
    let shown = true
    const askHelp = () => {
        if (!helpOn || !shown) return
        scene.tweens.killTweensOf(help)
        help.setScale(1)
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'h' || event.key === 'H') askHelp()
    }
    scene.input.keyboard?.on('keydown', onKey)
    const paintHelp = () => {
        if (helpZone.input) helpZone.input.enabled = helpOn && shown
        help.setAlpha(shown ? (helpOn ? 1 : 0.45) : 0)
    }
    paintHelp()

    // ── o cartão do pedido
    const cardArt = scene.add.graphics()
    const crown = scene.add.graphics()
    const fruitIcon = scene.add.image(0, 0, FRUIT_SHEET.key, cellKey(0))
    const slotsArt = scene.add.graphics()
    const card = scene.add.container(CARD.x, CARD.y, [cardArt, slotsArt, fruitIcon, crown]).setDepth(DEPTH.card)
    let kind: FruitKind = 'morango'
    let slots: Slot[] = []
    let width = 140

    const paintCrown = (x: number) => {
        crown.clear()
        const pts = [
            { x: -16, y: 10 },
            { x: -18, y: -10 },
            { x: -8, y: -2 },
            { x: 0, y: -16 },
            { x: 8, y: -2 },
            { x: 18, y: -10 },
            { x: 16, y: 10 },
        ]
        crown.fillStyle(C.crownDark, 1)
        crown.fillPoints(pts.map(p => ({ x: p.x + 1, y: p.y + 2 })), true)
        crown.fillStyle(C.crown, 1)
        crown.fillPoints(pts, true)
        crown.lineStyle(2.5, C.line, 1)
        crown.strokePoints(pts, true)
        crown.setPosition(x, 0)
    }

    const paintCard = () => {
        const n = slots.length
        const inner = n ? n * CARD.slot + (n - 1) * CARD.gap : CARD.icon
        width = CARD.pad * 2 + CARD.crown + 14 + inner
        cardArt.clear()
        cardArt.fillStyle(C.shadow, 0.18)
        cardArt.fillRoundedRect(-width / 2 + 3, -CARD.h / 2 + 5, width, CARD.h, 18)
        cardArt.fillStyle(C.white, 1)
        cardArt.fillRoundedRect(-width / 2, -CARD.h / 2, width, CARD.h, 18)
        cardArt.lineStyle(3, C.headerRim, 1)
        cardArt.strokeRoundedRect(-width / 2, -CARD.h / 2, width, CARD.h, 18)
        const left = -width / 2 + CARD.pad
        paintCrown(left + CARD.crown / 2)
        const x0 = left + CARD.crown + 14
        fruitIcon.setPosition(x0 + CARD.icon / 2, 0)
        slotsArt.clear()
        const def = FRUITS[kind]
        slots.forEach((slot, i) => {
            const sx = x0 + i * (CARD.slot + CARD.gap) + CARD.slot / 2
            slotsArt.fillStyle(slot.filled ? C.yes : C.slot, slot.filled ? 0.18 : 1)
            slotsArt.fillRoundedRect(sx - CARD.slot / 2, -CARD.slot / 2, CARD.slot, CARD.slot, 10)
            slotsArt.lineStyle(2.5, slot.filled ? C.yesDark : C.slotRim, 1)
            slotsArt.strokeRoundedRect(sx - CARD.slot / 2, -CARD.slot / 2, CARD.slot, CARD.slot, 10)
            const c = centroid(slot.poly)
            const pts = slot.poly.map(v => ({ x: sx + (v.x - c.x) * MINI, y: (v.y - c.y) * MINI }))
            slotsArt.fillStyle(slot.filled ? def.skin : C.slotRim, slot.filled ? 1 : 0.55)
            slotsArt.fillPoints(pts, true, true)
            slotsArt.lineStyle(2, slot.filled ? def.pulpDark : C.slotRim, 1)
            slotsArt.strokePoints(pts, true, true)
            if (slot.filled) {
                const bx = sx + CARD.slot / 2 - 7
                const by = -CARD.slot / 2 + 7
                slotsArt.fillStyle(C.yesDark, 1)
                slotsArt.fillCircle(bx, by, 9)
                slotsArt.lineStyle(3, C.white, 1)
                slotsArt.strokePoints(
                    [
                        { x: bx - 4, y: by },
                        { x: bx - 1, y: by + 3 },
                        { x: bx + 4, y: by - 3 },
                    ],
                    false,
                )
            }
        })
        fruitIcon.setVisible(n === 0)
    }

    const slotX = (i: number) => {
        const left = -width / 2 + CARD.pad + CARD.crown + 14
        return CARD.x + left + i * (CARD.slot + CARD.gap) + CARD.slot / 2
    }

    const header: Header = {
        lives,
        setPhase(index) {
            current = Phaser.Math.Clamp(index, 0, opts.phases)
            paintPips()
        },
        async celebrate(index) {
            current = index + 1
            paintPips()
            const pip = pips[index]
            if (!pip) return
            void FX.sparks(scene, pip.x, pip.y, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        visible(on) {
            shown = on
            ;[band, pill, levelText, card, ...pips].forEach(o => o.setVisible(on))
            paintHelp()
        },
        order(fruit) {
            kind = fruit
            slots = []
            const k = sheetScale(scene, FRUIT_SHEET)
            fruitIcon.setFrame(cellKey(FRUIT_CELL[fruit])).setScale((CARD.icon / FRUIT_SHEET.cellW) * k)
            paintCard()
            card.setScale(1)
            void FX.popIn(scene, card, { from: 0.7, duration: 320 })
        },
        async split(list) {
            slots = list.map(s => ({ id: s.id, poly: s.poly, filled: false }))
            await FX.to(scene, card, { scaleX: 0.6 }, { duration: 120 })
            paintCard()
            await FX.to(scene, card, { scaleX: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        async replace(id, list) {
            const i = slots.findIndex(s => s.id === id)
            if (i < 0) return
            slots.splice(i, 1, ...list.map(s => ({ id: s.id, poly: s.poly, filled: false })))
            paintCard()
            void FX.sparks(scene, slotX(i), CARD.y, { color: C.butter, count: 8, spread: 40, size: 7, duration: 420, depth: DEPTH.card + 1 })
            await FX.to(scene, card, { scale: 1.08 }, { duration: 120, yoyo: true })
            card.setScale(1)
        },
        async fill(id) {
            const i = slots.findIndex(s => s.id === id)
            if (i < 0) return
            slots[i].filled = true
            paintCard()
            void FX.sparks(scene, slotX(i), CARD.y, { color: C.yes, count: 10, spread: 46, size: 7, duration: 460, depth: DEPTH.card + 1 })
        },
        async join() {
            await FX.to(scene, card, { scaleX: 0.5 }, { duration: 160 })
            slots = []
            paintCard()
            await FX.to(scene, card, { scaleX: 1 }, { duration: 260, ease: 'Back.easeOut' })
            // o selo da rainha
            const seal = scene.add.graphics().setDepth(DEPTH.card + 2)
            const pts = starPoints(0, 0, 20, 11)
            seal.fillStyle(C.crown, 1)
            seal.fillPoints(pts, true)
            seal.lineStyle(3, C.line, 1)
            seal.strokePoints(pts, true)
            seal.setPosition(CARD.x + width / 2 - 6, CARD.y - CARD.h / 2 + 8).setScale(2.4).setAlpha(0)
            await FX.to(scene, seal, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
            void FX.sparks(scene, seal.x, seal.y, { color: C.crown, count: 10, spread: 50, size: 7, duration: 480, depth: DEPTH.card + 3 })
            await FX.wait(scene, 900)
            await FX.to(scene, seal, { alpha: 0 }, { duration: 260 })
            seal.destroy()
        },
        cardRect: () => ({ x: CARD.x, y: CARD.y, w: width + 16, h: CARD.h + 16 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            card.destroy()
            levelText.destroy()
            pips.forEach(p => p.destroy())
            pill.destroy()
            band.destroy()
            lives.destroy()
        },
    }
    paintCard()
    return header
}
