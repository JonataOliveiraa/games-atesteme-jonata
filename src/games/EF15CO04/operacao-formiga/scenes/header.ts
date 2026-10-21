import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { orderIcon } from '../data/files'
import { ITEMS } from '../data/fruits'
import { bounds, centroid } from '../data/geometry'
import { CARD, DEPTH, HEADER, HUD, W } from '../data/layout'
import { C, FONT, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'
import type { ItemKind, OrderKind, Poly, Rect } from '../types'
import { paintImage, starPoints } from './art'

/**
 * O cabeçalho: o nível, as bolinhas das fases, o `?` e, no meio, o CARTÃO DO
 * PEDIDO. Ele conta a decomposição sem palavra: a fruta se parte em casinhas
 * quando a criança termina de cortar, cada casinha acende quando o pedaço
 * chega, e no fim as casinhas voltam a ser a fruta, com o selo da rainha.
 * No N2 a casinha cortada de novo se abre em filhas penduradas embaixo dela
 * (a árvore); no N3 o cartão vira as três tarefas diferentes.
 */
export type Task = 'clean' | 'friends' | 'carry'

export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setHelpEnabled(on: boolean): void
    visible(on: boolean): void
    order(kind: OrderKind, tree?: boolean): void
    split(slots: { id: number; poly: Poly }[]): Promise<void>
    replace(id: number, slots: { id: number; poly: Poly }[]): Promise<void>
    fill(id: number): Promise<void>
    join(): Promise<void>
    tasks(friends: number): Promise<void>
    light(task: 'clean' | 'carry'): void
    lightFriend(index: number): void
    blinkFriends(indices: number[]): void
    pulse(task: Task): Promise<void>
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
    kids: Slot[]
}

interface Tasks {
    clean: boolean
    friends: boolean[]
    carry: boolean
}

type Box = { x: number; y: number; size: number }

/** O desenho do pedaço cabe na casinha: na escala da maior fruta, ou menor se o pedaço for comprido. */
const mini = (poly: Poly, size: number) => {
    const b = bounds(poly)
    return Math.min((size * 0.86) / 460, (size * 0.86) / Math.max(b.w, b.h))
}

const filledOf = (s: Slot): boolean => (s.kids.length ? s.kids.every(filledOf) : s.filled)

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
    const fruitIcon = scene.add.image(0, 0, '__DEFAULT')
    const slotsArt = scene.add.graphics()
    const card = scene.add.container(CARD.x, CARD.y, [cardArt, slotsArt, fruitIcon, crown]).setDepth(DEPTH.card)
    let kind: OrderKind = 'morango'
    let tree = false
    let slots: Slot[] = []
    let task: Tasks | null = null
    let width = 140
    let height: number = CARD.h
    const boxes = new Map<number, Box>()
    const taskBox: { clean?: Box; friends: Box[]; carry?: Box } = { friends: [] }

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

    const check = (bx: number, by: number) => {
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

    const frame = (b: Box, lit: boolean) => {
        const h = b.size / 2
        slotsArt.fillStyle(lit ? C.yes : C.slot, lit ? 0.18 : 1)
        slotsArt.fillRoundedRect(b.x - h, b.y - h, b.size, b.size, b.size * 0.22)
        slotsArt.lineStyle(2.5, lit ? C.yesDark : C.slotRim, 1)
        slotsArt.strokeRoundedRect(b.x - h, b.y - h, b.size, b.size, b.size * 0.22)
    }

    const drawSlot = (slot: Slot, b: Box) => {
        const lit = filledOf(slot)
        frame(b, lit)
        const def = kind === 'gigante' ? null : ITEMS[kind as ItemKind]
        const c = centroid(slot.poly)
        const k = mini(slot.poly, b.size)
        const pts = slot.poly.map(v => ({ x: b.x + (v.x - c.x) * k, y: b.y + (v.y - c.y) * k }))
        slotsArt.fillStyle(lit ? (def?.skin ?? C.giant) : C.slotRim, lit ? 1 : 0.55)
        slotsArt.fillPoints(pts, true, true)
        slotsArt.lineStyle(2, lit ? (def?.pulpDark ?? C.giantDark) : C.slotRim, 1)
        slotsArt.strokePoints(pts, true, true)
        if (lit) check(b.x + b.size / 2 - 7, b.y - b.size / 2 + 7)
        boxes.set(slot.id, b)
    }

    const twoFloors = () => tree && slots.some(s => s.kids.length > 0)

    const groupW = (s: Slot) => {
        const k = s.kids.length
        return k ? k * CARD.tslot + (k - 1) * CARD.tgap : CARD.tslot
    }

    const innerOf = () => {
        if (task) {
            const n = task.friends.length
            return CARD.slot * 2 + n * CARD.slot + (n - 1) * CARD.gap + CARD.taskGap * 2
        }
        const n = slots.length
        if (!n) return CARD.icon
        if (!twoFloors()) return n * CARD.slot + (n - 1) * CARD.gap
        return slots.reduce((sum, s) => sum + groupW(s), 0) + (n - 1) * CARD.groupGap
    }

    const drop = (b: Box, lit: boolean) => {
        const r = b.size * 0.24
        const cy = b.y + 4
        slotsArt.fillStyle(lit ? C.dew : C.slotRim, lit ? 1 : 0.55)
        slotsArt.fillCircle(b.x, cy, r)
        slotsArt.fillTriangle(b.x - r * 0.92, cy - r * 0.4, b.x + r * 0.92, cy - r * 0.4, b.x, cy - r * 2.1)
        slotsArt.lineStyle(2, lit ? C.dewDark : C.slotRim, 1)
        slotsArt.strokeCircle(b.x, cy, r)
        if (lit) {
            slotsArt.fillStyle(C.white, 0.9)
            slotsArt.fillCircle(b.x - r * 0.35, cy - r * 0.2, r * 0.25)
        }
    }

    const head = (b: Box, lit: boolean) => {
        const a = lit ? 1 : 0.55
        const r = b.size * 0.26
        const cy = b.y + 5
        slotsArt.lineStyle(2.5, lit ? C.friendDark : C.slotRim, a)
        slotsArt.lineBetween(b.x - r * 0.4, cy - r * 0.8, b.x - r * 0.8, cy - r * 1.9)
        slotsArt.lineBetween(b.x + r * 0.4, cy - r * 0.8, b.x + r * 0.8, cy - r * 1.9)
        slotsArt.fillStyle(lit ? C.friend : C.slotRim, a)
        slotsArt.fillCircle(b.x, cy, r)
        slotsArt.fillCircle(b.x - r * 0.8, cy - r * 1.9, 3)
        slotsArt.fillCircle(b.x + r * 0.8, cy - r * 1.9, 3)
        slotsArt.fillStyle(lit ? C.bow : C.slotRim, a)
        slotsArt.fillTriangle(b.x + r * 0.6, cy - r * 1.4, b.x + r * 1.3, cy - r * 1.9, b.x + r * 1.2, cy - r * 1.0)
        slotsArt.fillStyle(lit ? C.white : C.slot, 1)
        slotsArt.fillCircle(b.x - r * 0.38, cy - r * 0.1, r * 0.3)
        slotsArt.fillCircle(b.x + r * 0.38, cy - r * 0.1, r * 0.3)
        slotsArt.fillStyle(lit ? C.eye : C.slotRim, 1)
        slotsArt.fillCircle(b.x - r * 0.34, cy - r * 0.04, r * 0.16)
        slotsArt.fillCircle(b.x + r * 0.42, cy - r * 0.04, r * 0.16)
    }

    const leafy = (b: Box, lit: boolean) => {
        const w = b.size * 0.74
        const h = b.size * 0.46
        slotsArt.fillStyle(lit ? C.giant : C.slotRim, lit ? 1 : 0.55)
        slotsArt.fillEllipse(b.x, b.y, w, h)
        slotsArt.lineStyle(2, lit ? C.giantDark : C.slotRim, 1)
        slotsArt.strokeEllipse(b.x, b.y, w, h)
        slotsArt.lineStyle(2, lit ? C.vein : C.slot, 1)
        slotsArt.lineBetween(b.x - w * 0.42, b.y, b.x + w * 0.42, b.y)
    }

    const paintTasks = (t: Tasks, x0: number) => {
        const s = CARD.slot
        let x = x0 + s / 2
        taskBox.clean = { x, y: 0, size: s }
        frame(taskBox.clean, t.clean)
        drop(taskBox.clean, t.clean)
        if (t.clean) check(x + s / 2 - 7, -s / 2 + 7)
        x += s / 2 + CARD.taskGap
        t.friends.forEach((lit, i) => {
            const b = { x: x + s / 2 + i * (s + CARD.gap), y: 0, size: s }
            taskBox.friends.push(b)
            frame(b, lit)
            head(b, lit)
            if (lit) check(b.x + s / 2 - 7, -s / 2 + 7)
        })
        x += t.friends.length * s + (t.friends.length - 1) * CARD.gap + CARD.taskGap
        taskBox.carry = { x: x + s / 2, y: 0, size: s }
        frame(taskBox.carry, t.carry)
        leafy(taskBox.carry, t.carry)
        if (t.carry) check(taskBox.carry.x + s / 2 - 7, -s / 2 + 7)
        ;[x0 + s + CARD.taskGap / 2, x - CARD.taskGap / 2].forEach(sx => {
            slotsArt.fillStyle(C.headerRim, 1)
            slotsArt.fillRoundedRect(sx - 1.5, -s / 2, 3, s, 1.5)
        })
    }

    const paintTree = (x0: number) => {
        let x = x0
        slots.forEach(slot => {
            const gw = groupW(slot)
            const gx = x + gw / 2
            drawSlot(slot, { x: gx, y: -CARD.floor, size: CARD.tslot })
            if (slot.kids.length) {
                const kx = (i: number) => x + CARD.tslot / 2 + i * (CARD.tslot + CARD.tgap)
                slotsArt.lineStyle(2.5, C.slotRim, 1)
                slotsArt.lineBetween(gx, -CARD.floor + CARD.tslot / 2, gx, 0)
                slotsArt.lineBetween(kx(0), 0, kx(slot.kids.length - 1), 0)
                slot.kids.forEach((kid, i) => {
                    slotsArt.lineStyle(2.5, C.slotRim, 1)
                    slotsArt.lineBetween(kx(i), 0, kx(i), CARD.floor - CARD.tslot / 2)
                    drawSlot(kid, { x: kx(i), y: CARD.floor, size: CARD.tslot })
                })
            }
            x += gw + CARD.groupGap
        })
    }

    const paintCard = () => {
        const floors = twoFloors()
        height = floors ? CARD.treeH : CARD.h
        width = CARD.pad * 2 + CARD.crown + 14 + innerOf()
        cardArt.clear()
        cardArt.fillStyle(C.shadow, 0.18)
        cardArt.fillRoundedRect(-width / 2 + 3, -height / 2 + 5, width, height, 18)
        cardArt.fillStyle(C.white, 1)
        cardArt.fillRoundedRect(-width / 2, -height / 2, width, height, 18)
        cardArt.lineStyle(3, C.headerRim, 1)
        cardArt.strokeRoundedRect(-width / 2, -height / 2, width, height, 18)
        const left = -width / 2 + CARD.pad
        paintCrown(left + CARD.crown / 2)
        const x0 = left + CARD.crown + 14
        fruitIcon.setPosition(x0 + CARD.icon / 2, 0)
        slotsArt.clear()
        boxes.clear()
        taskBox.friends = []
        taskBox.clean = undefined
        taskBox.carry = undefined
        if (task) paintTasks(task, x0)
        else if (floors) paintTree(x0)
        else slots.forEach((slot, i) => drawSlot(slot, { x: x0 + i * (CARD.slot + CARD.gap) + CARD.slot / 2, y: 0, size: CARD.slot }))
        fruitIcon.setVisible(!slots.length && !task)
    }

    const sparkAt = (b: Box | undefined, color: number) => {
        if (!b) return
        void FX.sparks(scene, CARD.x + b.x, CARD.y + b.y, { color, count: 10, spread: 46, size: 7, duration: 460, depth: DEPTH.card + 1 })
    }

    const find = (id: number): { slot: Slot; parent?: Slot } | undefined => {
        for (const s of slots) {
            if (s.id === id) return { slot: s }
            const kid = s.kids.find(k => k.id === id)
            if (kid) return { slot: kid, parent: s }
        }
        return undefined
    }

    const ring = async (list: Box[], color: number, times: number) => {
        if (!list.length) return
        const x0 = Math.min(...list.map(r => r.x - r.size / 2)) - 5
        const x1 = Math.max(...list.map(r => r.x + r.size / 2)) + 5
        const h = list[0].size + 10
        const g = scene.add.graphics().setDepth(DEPTH.card + 2)
        g.lineStyle(4, color, 1)
        g.strokeRoundedRect(-(x1 - x0) / 2, -h / 2, x1 - x0, h, 12)
        g.setPosition(CARD.x + (x0 + x1) / 2, CARD.y + list[0].y)
        await FX.to(scene, g, { scale: 1.12 }, { duration: 220, yoyo: true, repeat: times - 1, ease: 'Sine.easeInOut' })
        g.destroy()
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
        order(what, asTree = false) {
            kind = what
            tree = asTree
            slots = []
            task = null
            const icon = orderIcon(scene, what, CARD.icon)
            fruitIcon.setTexture(icon.key, icon.frame).setScale(icon.scale)
            paintCard()
            card.setScale(1)
            void FX.popIn(scene, card, { from: 0.7, duration: 320 })
        },
        async split(list) {
            slots = list.map(s => ({ id: s.id, poly: s.poly, filled: false, kids: [] }))
            await FX.to(scene, card, { scaleX: 0.6 }, { duration: 120 })
            paintCard()
            await FX.to(scene, card, { scaleX: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        async replace(id, list) {
            const hit = find(id)
            if (!hit) return
            const made: Slot[] = list.map(s => ({ id: s.id, poly: s.poly, filled: false, kids: [] }))
            if (!tree) slots.splice(slots.indexOf(hit.slot), 1, ...made)
            else if (hit.parent) hit.parent.kids.splice(hit.parent.kids.indexOf(hit.slot), 1, ...made)
            else hit.slot.kids = made
            paintCard()
            made.forEach(m => sparkAt(boxes.get(m.id), C.butter))
            await FX.to(scene, card, { scale: 1.08 }, { duration: 120, yoyo: true })
            card.setScale(1)
        },
        async fill(id) {
            const hit = find(id)
            if (!hit) return
            hit.slot.filled = true
            paintCard()
            sparkAt(boxes.get(id), C.yes)
            if (hit.parent && filledOf(hit.parent)) {
                await FX.wait(scene, 180)
                sparkAt(boxes.get(hit.parent.id), C.yes)
            }
        },
        async join() {
            await FX.to(scene, card, { scaleX: 0.5 }, { duration: 160 })
            slots = []
            task = null
            paintCard()
            await FX.to(scene, card, { scaleX: 1 }, { duration: 260, ease: 'Back.easeOut' })
            // o selo da rainha
            const seal = scene.add.graphics().setDepth(DEPTH.card + 2)
            const pts = starPoints(0, 0, 20, 11)
            seal.fillStyle(C.crown, 1)
            seal.fillPoints(pts, true)
            seal.lineStyle(3, C.line, 1)
            seal.strokePoints(pts, true)
            seal.setPosition(CARD.x + width / 2 - 6, CARD.y - height / 2 + 8).setScale(2.4).setAlpha(0)
            await FX.to(scene, seal, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
            void FX.sparks(scene, seal.x, seal.y, { color: C.crown, count: 10, spread: 50, size: 7, duration: 480, depth: DEPTH.card + 3 })
            await FX.wait(scene, 900)
            await FX.to(scene, seal, { alpha: 0 }, { duration: 260 })
            seal.destroy()
        },
        async tasks(friends) {
            await FX.to(scene, card, { scaleX: 0.6 }, { duration: 120 })
            task = { clean: false, friends: Array.from({ length: friends }, () => false), carry: false }
            paintCard()
            await FX.to(scene, card, { scaleX: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        light(which) {
            if (!task) return
            task[which] = true
            paintCard()
            sparkAt(which === 'clean' ? taskBox.clean : taskBox.carry, C.yes)
        },
        lightFriend(index) {
            if (!task || task.friends[index] === undefined) return
            task.friends[index] = true
            paintCard()
            sparkAt(taskBox.friends[index], C.yes)
        },
        blinkFriends(indices) {
            indices.forEach(i => {
                const b = taskBox.friends[i]
                if (b) void ring([b], C.oops, 1)
            })
        },
        async pulse(which) {
            const list = which === 'clean' ? [taskBox.clean] : which === 'carry' ? [taskBox.carry] : taskBox.friends
            await ring(list.filter((b): b is Box => !!b), C.butter, 2)
        },
        cardRect: () => ({ x: CARD.x, y: CARD.y, w: width + 16, h: height + 16 }),
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
