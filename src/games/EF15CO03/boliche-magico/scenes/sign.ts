import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, SIGN } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL, chipText } from '../data/words'
import type { Rect, Term, Vec } from '../types'
import { NO, YES, paintImage } from './art'
import { termIcon } from './icons'

export interface Sign {
    reset(): void
    setTerm(term: Term, from?: Vec): Promise<void>
    setNot(on: boolean, from?: Vec): Promise<void>
    bounce(): Promise<void>
    mark(value: boolean): Promise<void>
    flip(value: boolean): Promise<void>
    blame(withNot: boolean): void
    clearMarks(): void
    rect(): Rect
    notRect(): Rect | null
    termRect(): Rect
    visible(on: boolean): void
    destroy(): void
}

interface Part {
    obj: Phaser.GameObjects.Container | Phaser.GameObjects.Text
    w: number
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

export function makeNotPill(scene: Phaser.Scene, w: number = SIGN.pillW, h: number = SIGN.chipH, size: number = SIGN.text) {
    const art = paintImage(scene, w + 6, h + 8, g => {
        g.fillStyle(C.notDark, 1)
        g.fillRoundedRect(0, 5, w, h, h / 2)
        g.fillStyle(C.not, 1)
        g.fillRoundedRect(0, 0, w, h, h / 2)
    })
    art.setOrigin(0.5, h / 2 / (h + 8))
    const label = scene.add
        .text(0, 0, LABEL.not, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    return scene.add.container(0, 0, [art, label])
}

function makeSlot(scene: Phaser.Scene) {
    const w = SIGN.slotW
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
    return { slot: scene.add.container(0, 0, [art, label]), w }
}

export function createSign(scene: Phaser.Scene): Sign {
    const box = scene.add.container(SIGN.x, SIGN.y).setDepth(DEPTH.sign)
    const lead = scene.add
        .text(0, 2, LABEL.lead, { fontFamily: FONT.black, fontSize: `${SIGN.lead}px`, color: CSS.inkSoft })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const notPill = makeNotPill(scene)
    const { slot, w: slotW } = makeSlot(scene)
    box.add([lead, notPill, slot])
    let chip: Phaser.GameObjects.Container | undefined
    let chipW = 0
    let notOn = false
    const badge = scene.add.image(0, 0, YES).setVisible(false)
    box.add(badge)

    const parts = (): Part[] => {
        const list: Part[] = [{ obj: lead, w: lead.width }]
        if (notOn) list.push({ obj: notPill, w: SIGN.pillW })
        list.push(chip ? { obj: chip, w: chipW } : { obj: slot, w: slotW })
        return list
    }

    const targets = () => {
        const list = parts()
        const total = list.reduce((s, p) => s + p.w, 0) + SIGN.gap * (list.length - 1)
        const half = total / 2
        const cx = Phaser.Math.Clamp(SIGN.x, SIGN.left + half, SIGN.right - half) - SIGN.x
        let x = cx - half
        return list.map(p => {
            const at = p.obj === lead ? x : x + p.w / 2
            x += p.w + SIGN.gap
            return { obj: p.obj, x: at }
        })
    }

    const placeBadge = () => {
        if (!chip) return
        badge.setPosition(chip.x + chipW / 2 - 8, -SIGN.chipH / 2 + 6)
    }

    const layout = (animate: boolean) => {
        const list = targets()
        list.forEach(({ obj, x }) => {
            scene.tweens.killTweensOf(obj)
            if (animate && obj.visible) void FX.to(scene, obj, { x }, { duration: TIMING.fly, ease: 'Sine.easeInOut' })
            else obj.setX(x)
        })
        notPill.setVisible(notOn)
        slot.setVisible(!chip)
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

    const sign: Sign = {
        reset() {
            chip?.destroy()
            chip = undefined
            chipW = 0
            notOn = false
            badge.setVisible(false)
            notPill.setPosition(0, 0).setScale(1)
            slot.setScale(1).setY(0)
            layout(false)
        },
        async setTerm(term, from) {
            badge.setVisible(false)
            chip?.destroy()
            const made = makeChip(scene, term)
            chip = made.chip
            chipW = made.w
            box.addAt(chip, box.list.indexOf(badge))
            chip.setVisible(false)
            const list = layout(true)
            const mine = list.find(p => p.obj === chip)
            chip.setVisible(true)
            await fly(chip, mine?.x ?? 0, from)
            placeBadge()
        },
        async setNot(on, from) {
            if (on === notOn) return
            badge.setVisible(false)
            if (on) {
                notOn = true
                notPill.setVisible(false)
                const list = layout(true)
                const mine = list.find(p => p.obj === notPill)
                notPill.setVisible(true)
                await fly(notPill, mine?.x ?? 0, from)
            } else {
                scene.tweens.killTweensOf(notPill)
                const end = from ? local(from) : { x: notPill.x, y: -60 }
                await FX.to(scene, notPill, { x: end.x, y: end.y, scale: 0.8, alpha: 0 }, { duration: TIMING.fly * 0.8, ease: 'Sine.easeIn' })
                notOn = false
                notPill.setAlpha(1).setScale(1).setY(0)
                layout(true)
            }
            await FX.wait(scene, 10)
            placeBadge()
        },
        async bounce() {
            const list = [chip, notOn ? notPill : undefined].filter(Boolean) as Phaser.GameObjects.Container[]
            await FX.to(scene, list, { y: -8 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            list.forEach(o => o.setY(0))
        },
        async mark(value) {
            if (!chip) return
            placeBadge()
            badge.setTexture(value ? YES : NO).setVisible(true).setScale(1)
            await FX.popIn(scene, badge, { from: 0.3, duration: 300 })
        },
        async flip(value) {
            void FX.to(scene, notPill, { y: -10, scale: 1.12 }, { duration: 150, yoyo: true }).then(() => notPill.setY(0).setScale(1))
            await FX.flip(scene, badge, () => badge.setTexture(value ? YES : NO), TIMING.flip)
        },
        blame(withNot) {
            if (chip) void FX.shake(scene, chip, { amount: 8, times: 5 })
            if (withNot && notOn) void FX.shake(scene, notPill, { amount: 8, times: 5 })
        },
        clearMarks() {
            scene.tweens.killTweensOf(badge)
            badge.setVisible(false).setScale(1)
        },
        rect() {
            const list = targets()
            const first = list[0]
            const last = list[list.length - 1]
            const lastW = parts()[list.length - 1].w
            const left = box.x + first.x
            const right = box.x + last.x + lastW / 2
            return { x: (left + right) / 2, y: box.y, w: right - left + 36, h: SIGN.chipH + 26 }
        },
        notRect() {
            if (!notOn) return null
            return { x: box.x + notPill.x, y: box.y, w: SIGN.pillW + 16, h: SIGN.chipH + 16 }
        },
        termRect() {
            const o = chip ?? slot
            const w = chip ? chipW : slotW
            return { x: box.x + o.x, y: box.y, w: w + 16, h: SIGN.chipH + 16 }
        },
        visible(on) {
            box.setVisible(on)
        },
        destroy() {
            scene.tweens.killTweensOf([badge, notPill, slot, lead])
            if (chip) scene.tweens.killTweensOf(chip)
            box.destroy()
        },
    }
    sign.reset()
    return sign
}
