import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, SIGN } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL, chipText } from '../data/words'
import type { Op, Rack, Rect, Term, Vec } from '../types'
import { NO, YES, paintImage } from './art'
import { termIcon } from './icons'

export type Side = 'left' | 'right'

export interface Sign {
    reset(rack: Rack): void
    setTerm(term: Term, from?: Vec): Promise<void>
    setNot(side: Side, on: boolean, from?: Vec): Promise<void>
    setOp(op: Op, from?: Vec): Promise<void>
    bounce(): Promise<void>
    mark(side: Side, value: boolean): Promise<void>
    flip(side: Side, value: boolean): Promise<void>
    merge(value: boolean): Promise<void>
    blame(sides: Side[], op: boolean): void
    clearMarks(): void
    rect(): Rect
    termRect(side?: Side): Rect
    opRect(): Rect | null
    visible(on: boolean): void
    destroy(): void
}

type Obj = Phaser.GameObjects.Container | Phaser.GameObjects.Text

interface Part {
    obj: Obj
    w: number
}

const OP_W = 84

export const OP_TONE: Record<Op, { fill: number; dark: number }> = {
    e: { fill: C.e, dark: C.eDark },
    ou: { fill: C.ou, dark: C.ouDark },
}

export function makeChip(scene: Phaser.Scene, t: Term, h: number = SIGN.chipH, size: number = SIGN.text, iconSize: number = SIGN.icon) {
    const text = scene.add
        .text(0, 0, chipText(t), { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const pad = SIGN.chipPad
    const w = pad * 2 + iconSize + 10 + text.width
    const art = paintImage(scene, w + 6, h + 8, g => {
        g.fillStyle(C.chipRim, 1)
        g.fillRoundedRect(0, 5, w, h, 16)
        g.fillStyle(C.chipFace, 1)
        g.fillRoundedRect(0, 0, w, h, 16)
        g.lineStyle(3, C.chipRim, 1)
        g.strokeRoundedRect(1.5, 1.5, w - 3, h - 3, 15)
    })
    art.setOrigin(0.5, h / 2 / (h + 8))
    const ic = paintImage(scene, iconSize, iconSize, g => termIcon(g, t, iconSize))
    ic.setPosition(-w / 2 + pad + iconSize / 2, 0)
    text.setX(-w / 2 + pad + iconSize + 10)
    return { chip: scene.add.container(0, 0, [art, ic, text]), w }
}

function makePill(scene: Phaser.Scene, label: string, fill: number, dark: number, w: number, h: number = SIGN.chipH, size: number = SIGN.text) {
    const art = paintImage(scene, w + 6, h + 8, g => {
        g.fillStyle(dark, 1)
        g.fillRoundedRect(0, 5, w, h, h / 2)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(0, 0, w, h, h / 2)
    })
    art.setOrigin(0.5, h / 2 / (h + 8))
    const text = scene.add
        .text(0, 0, label, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    return scene.add.container(0, 0, [art, text])
}

export const makeNotPill = (scene: Phaser.Scene, w: number = SIGN.pillW, h: number = SIGN.chipH, size: number = SIGN.text) =>
    makePill(scene, LABEL.not, C.not, C.notDark, w, h, size)

export const makeOpPill = (scene: Phaser.Scene, op: Op, w: number = OP_W, h: number = SIGN.chipH, size: number = SIGN.text + 2) =>
    makePill(scene, op === 'e' ? LABEL.e : LABEL.ou, OP_TONE[op].fill, OP_TONE[op].dark, w, h, size)

function makeSlot(scene: Phaser.Scene, w: number) {
    const h = SIGN.chipH
    const art = paintImage(scene, w + 4, h + 4, g => {
        g.fillStyle(C.slot, 1)
        g.fillRoundedRect(2, 2, w, h, 16)
        g.lineStyle(4, C.slotRim, 1)
        const dash = 14
        const gap = 9
        for (let x = 18; x < w - 14; x += dash + gap) {
            g.lineBetween(2 + x, 2, 2 + Math.min(x + dash, w - 14), 2)
            g.lineBetween(2 + x, h + 2, 2 + Math.min(x + dash, w - 14), h + 2)
        }
        for (let y = 16; y < h - 12; y += dash + gap) {
            g.lineBetween(2, 2 + y, 2, 2 + Math.min(y + dash, h - 12))
            g.lineBetween(w + 2, 2 + y, w + 2, 2 + Math.min(y + dash, h - 12))
        }
    })
    const label = scene.add
        .text(0, 1, LABEL.empty, { fontFamily: FONT.black, fontSize: '34px', color: '#b08a58' })
        .setOrigin(0.5)
        .setResolution(2)
    return scene.add.container(0, 0, [art, label])
}

export function createSign(scene: Phaser.Scene): Sign {
    const box = scene.add.container(SIGN.x, SIGN.y).setDepth(DEPTH.sign)
    const lead = scene.add
        .text(0, 2, LABEL.lead, { fontFamily: FONT.black, fontSize: `${SIGN.lead}px`, color: CSS.inkSoft })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const nots: Record<Side, Phaser.GameObjects.Container> = { left: makeNotPill(scene), right: makeNotPill(scene) }
    const slot = makeSlot(scene, SIGN.slotW)
    const opSlot = makeSlot(scene, OP_W)
    const badges: Record<Side, Phaser.GameObjects.Image> = {
        left: scene.add.image(0, 0, YES).setVisible(false),
        right: scene.add.image(0, 0, YES).setVisible(false),
    }
    const opBadge = scene.add.image(0, 0, YES).setVisible(false)
    box.add([lead, nots.left, nots.right, slot, opSlot])
    const top = [badges.left, badges.right, opBadge]
    box.add(top)

    const chips: Partial<Record<Side, { obj: Phaser.GameObjects.Container; w: number }>> = {}
    const notOn: Record<Side, boolean> = { left: false, right: false }
    let opPill: Phaser.GameObjects.Container | undefined
    let compound = false

    const addBelowBadges = (obj: Obj) => box.addAt(obj, box.list.indexOf(badges.left))

    const parts = (): Part[] => {
        const list: Part[] = [{ obj: lead, w: lead.width }]
        if (notOn.left) list.push({ obj: nots.left, w: SIGN.pillW })
        list.push(chips.left ? { obj: chips.left.obj, w: chips.left.w } : { obj: slot, w: SIGN.slotW })
        if (compound) {
            list.push(opPill ? { obj: opPill, w: OP_W } : { obj: opSlot, w: OP_W })
            if (notOn.right) list.push({ obj: nots.right, w: SIGN.pillW })
            if (chips.right) list.push({ obj: chips.right.obj, w: chips.right.w })
        }
        return list
    }

    const targets = () => {
        const list = parts()
        const total = list.reduce((s, p) => s + p.w, 0) + SIGN.gap * (list.length - 1)
        const room = SIGN.right - SIGN.left
        const scale = Math.min(1, room / total)
        const half = total / 2
        const cx = Phaser.Math.Clamp(SIGN.x, SIGN.left + half * scale, SIGN.right - half * scale)
        let x = -half
        return {
            scale,
            cx,
            list: list.map(p => {
                const at = p.obj === lead ? x : x + p.w / 2
                x += p.w + SIGN.gap
                return { obj: p.obj, x: at, w: p.w }
            }),
        }
    }

    const placeBadges = () => {
        ;(['left', 'right'] as Side[]).forEach(side => {
            const c = chips[side]
            if (c) badges[side].setPosition(c.obj.x + c.w / 2 - 8, -SIGN.chipH / 2 + 6)
        })
        const o = opPill ?? opSlot
        opBadge.setPosition(o.x + OP_W / 2 - 8, -SIGN.chipH / 2 + 6)
    }

    const layout = (animate: boolean) => {
        const { scale, cx, list } = targets()
        scene.tweens.killTweensOf(box)
        if (animate) void FX.to(scene, box, { scale, x: cx }, { duration: TIMING.fly, ease: 'Sine.easeInOut' })
        else box.setScale(scale).setX(cx)
        list.forEach(({ obj, x }) => {
            scene.tweens.killTweensOf(obj)
            if (animate && obj.visible) void FX.to(scene, obj, { x }, { duration: TIMING.fly, ease: 'Sine.easeInOut' })
            else obj.setX(x)
        })
        nots.left.setVisible(notOn.left)
        nots.right.setVisible(notOn.right)
        slot.setVisible(!chips.left)
        opSlot.setVisible(compound && !opPill)
        return list
    }

    const local = (at: Vec) => ({ x: (at.x - box.x) / box.scale, y: (at.y - box.y) / box.scale })

    const fly = async (obj: Phaser.GameObjects.Container, to: number, from?: Vec) => {
        scene.tweens.killTweensOf(obj)
        if (!from) {
            obj.setPosition(to, 0).setScale(1)
            await FX.popIn(scene, obj, { from: 0.6, duration: 260 })
            return
        }
        const start = local(from)
        obj.setPosition(start.x, start.y).setScale(1.1)
        await FX.to(scene, obj, { x: to, y: 0, scale: 1 }, { duration: TIMING.fly, ease: 'Sine.easeInOut' })
    }

    const hideBadges = () => {
        ;[...top].forEach(b => {
            scene.tweens.killTweensOf(b)
            b.setVisible(false).setScale(1).setAlpha(1)
        })
    }

    const placeChip = (side: Side, term: Term) => {
        chips[side]?.obj.destroy()
        const made = makeChip(scene, term)
        chips[side] = { obj: made.chip, w: made.w }
        addBelowBadges(made.chip)
        return made.chip
    }

    const sideRect = (side: Side): Rect => {
        const c = chips[side]
        const o = c?.obj ?? slot
        const w = c?.w ?? SIGN.slotW
        const pillW = notOn[side] ? SIGN.pillW + SIGN.gap : 0
        const left = o.x - w / 2 - pillW
        const right = o.x + w / 2
        return { x: box.x + ((left + right) / 2) * box.scale, y: box.y, w: (right - left) * box.scale + 16, h: SIGN.chipH * box.scale + 16 }
    }

    const sign: Sign = {
        reset(rack) {
            hideBadges()
            ;(['left', 'right'] as Side[]).forEach(side => {
                chips[side]?.obj.destroy()
                delete chips[side]
                notOn[side] = false
                nots[side].setPosition(0, 0).setScale(1).setAlpha(1)
            })
            opPill?.destroy()
            opPill = undefined
            compound = rack.kind !== 'one'
            if (rack.kind !== 'one') {
                placeChip('left', rack.left)
                placeChip('right', rack.right)
                if (rack.kind === 'nots') {
                    opPill = makeOpPill(scene, rack.op)
                    addBelowBadges(opPill)
                }
            }
            slot.setScale(1).setY(0)
            layout(false)
            ;(['left', 'right'] as Side[]).forEach(side => chips[side]?.obj.setY(0).setScale(1))
            opPill?.setY(0).setScale(1)
            placeBadges()
        },
        async setTerm(term, from) {
            hideBadges()
            const chip = placeChip('left', term)
            chip.setVisible(false)
            const list = layout(true)
            const mine = list.find(p => p.obj === chip)
            chip.setVisible(true)
            await fly(chip, mine?.x ?? 0, from)
            placeBadges()
        },
        async setNot(side, on, from) {
            if (on === notOn[side]) return
            hideBadges()
            const pill = nots[side]
            if (on) {
                notOn[side] = true
                pill.setVisible(false)
                const list = layout(true)
                const mine = list.find(p => p.obj === pill)
                pill.setVisible(true)
                await fly(pill, mine?.x ?? 0, from)
            } else {
                scene.tweens.killTweensOf(pill)
                const end = from ? local(from) : { x: pill.x, y: -60 }
                await FX.to(scene, pill, { x: end.x, y: end.y, scale: 0.8, alpha: 0 }, { duration: TIMING.fly * 0.8, ease: 'Sine.easeIn' })
                notOn[side] = false
                pill.setAlpha(1).setScale(1).setY(0)
                layout(true)
            }
            await FX.wait(scene, 10)
            placeBadges()
        },
        async setOp(op, from) {
            hideBadges()
            opPill?.destroy()
            opPill = makeOpPill(scene, op)
            addBelowBadges(opPill)
            opPill.setVisible(false)
            const list = layout(true)
            const mine = list.find(p => p.obj === opPill)
            opPill.setVisible(true)
            await fly(opPill, mine?.x ?? 0, from)
            placeBadges()
        },
        async bounce() {
            const list = [chips.left?.obj, chips.right?.obj, notOn.left ? nots.left : undefined, notOn.right ? nots.right : undefined, opPill].filter(
                Boolean,
            ) as Phaser.GameObjects.Container[]
            await FX.to(scene, list, { y: -8 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            list.forEach(o => o.setY(0))
        },
        async mark(side, value) {
            if (!chips[side]) return
            placeBadges()
            const b = badges[side]
            b.setTexture(value ? YES : NO).setVisible(true).setScale(1).setAlpha(1)
            await FX.popIn(scene, b, { from: 0.3, duration: 300 })
        },
        async flip(side, value) {
            const pill = nots[side]
            void FX.to(scene, pill, { y: -10, scale: 1.12 }, { duration: 150, yoyo: true }).then(() => pill.setY(0).setScale(1))
            const b = badges[side]
            await FX.flip(scene, b, () => b.setTexture(value ? YES : NO), TIMING.flip)
        },
        async merge(value) {
            placeBadges()
            const at = { x: opBadge.x, y: opBadge.y }
            await FX.all(
                ...(['left', 'right'] as Side[]).map(side =>
                    FX.to(scene, badges[side], { x: at.x, y: at.y, scale: 0.6, alpha: 0.2 }, { duration: TIMING.merge, ease: 'Sine.easeIn' }),
                ),
            )
            badges.left.setVisible(false)
            badges.right.setVisible(false)
            placeBadges()
            if (opPill) void FX.to(scene, opPill, { scale: 1.15 }, { duration: 140, yoyo: true }).then(() => opPill?.setScale(1))
            opBadge.setTexture(value ? YES : NO).setVisible(true).setScale(1).setAlpha(1)
            await FX.popIn(scene, opBadge, { from: 0.3, duration: 300 })
        },
        blame(sides, op) {
            sides.forEach(side => {
                const c = chips[side]
                if (c) void FX.shake(scene, c.obj, { amount: 8, times: 5 })
                if (notOn[side]) void FX.shake(scene, nots[side], { amount: 8, times: 5 })
            })
            if (op && opPill) void FX.shake(scene, opPill, { amount: 8, times: 5 })
        },
        clearMarks() {
            hideBadges()
            placeBadges()
        },
        rect() {
            const { list, scale, cx } = targets()
            const first = list[0]
            const last = list[list.length - 1]
            const left = first.x
            const right = last.x + last.w / 2
            return { x: cx + ((left + right) / 2) * scale, y: box.y, w: (right - left) * scale + 36, h: SIGN.chipH * scale + 26 }
        },
        termRect: (side = 'left') => sideRect(side),
        opRect() {
            if (!compound) return null
            const o = opPill ?? opSlot
            return { x: box.x + o.x * box.scale, y: box.y, w: OP_W * box.scale + 16, h: SIGN.chipH * box.scale + 16 }
        },
        visible(on) {
            box.setVisible(on)
        },
        destroy() {
            scene.tweens.killTweensOf([box, lead, slot, opSlot, nots.left, nots.right, ...top])
            ;(['left', 'right'] as Side[]).forEach(side => {
                const c = chips[side]
                if (c) scene.tweens.killTweensOf(c.obj)
            })
            if (opPill) scene.tweens.killTweensOf(opPill)
            box.destroy()
        },
    }
    layout(false)
    return sign
}
