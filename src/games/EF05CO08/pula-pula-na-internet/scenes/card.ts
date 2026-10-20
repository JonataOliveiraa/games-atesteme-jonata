import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLUE_CELL, CLUE_SHEET, ITEM_CELL, ITEM_SHEET, PHOTO_SHEET, cellKey } from '../data/files'
import { CARD, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { CLUE_LABEL, KIND_NAME, LABEL } from '../data/words'
import type { ClueId, ItemDef, Vec } from '../types'

export interface Card {
    open(item: ItemDef, from: Vec, onPick: (trust: boolean) => void): Promise<void>
    verdict(item: ItemDef, correct: boolean): Promise<void>
    keep(to: Vec): Promise<void>
    block(): Promise<void>
    shake(): Promise<void>
    hide(): void
    destroy(): void
}

interface Row {
    box: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Graphics
    mark: Phaser.GameObjects.Graphics
    ok: boolean
}

const CLUES: ClueId[] = ['quem', 'quando', 'onde']
const MID = CARD.top + CARD.h / 2
const local = (y: number) => y - MID

export function createCard(scene: Phaser.Scene, sound: { tick(): void }): Card {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.5).setDepth(DEPTH.card - 1).setAlpha(0).setVisible(false)
    const panel = scene.add.container(CARD.x, MID).setDepth(DEPTH.card).setVisible(false)
    let rows: Row[] = []
    let buttons: Phaser.GameObjects.Container[] = []
    let footer: Phaser.GameObjects.Container | null = null
    let picked = false

    const text = (x: number, y: number, value: string, size: number, color: string, extra: Phaser.Types.GameObjects.Text.TextStyle = {}) =>
        scene.add
            .text(x, y, value, { fontFamily: FONT.black, fontSize: `${size}px`, color, ...extra })
            .setResolution(2)

    const fit = (t: Phaser.GameObjects.Text, w: number, h = Infinity) => {
        const k = Math.min(1, w / Math.max(1, t.width), h / Math.max(1, t.height))
        t.setScale(k)
        return t
    }

    const frame = () => {
        const g = scene.add.graphics()
        const w = CARD.w
        const h = CARD.h
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 14, w, h, 40)
        g.fillStyle(C.cardEdge, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 40)
        g.fillStyle(C.card, 1)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 34)
        g.fillStyle(C.row, 1)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, 72, { tl: 34, tr: 34, bl: 0, br: 0 })
        return g
    }

    const top = (item: ItemDef) => {
        const y = local(CARD.barY)
        const chipText = text(0, 0, KIND_NAME[item.kind], SIZE.chip, CSS.white).setOrigin(0, 0.5)
        const chipW = chipText.width + 86
        const chip = scene.add.graphics()
        chip.fillStyle(C.accent, 1)
        chip.fillRoundedRect(0, -24, chipW, 48, 24)
        const icon = scene.add.image(30, 0, ITEM_SHEET.key, cellKey(ITEM_CELL[item.kind]))
        icon.setScale(46 / icon.frame.width)
        chipText.setX(58)
        const box = scene.add.container(-CARD.w / 2 + 34, y, [chip, icon, chipText])
        const from = fit(text(-CARD.w / 2 + 34 + chipW + 20, y, item.from, SIZE.from, CSS.from).setOrigin(0, 0.5), CARD.w - chipW - 100)
        return [box, from]
    }

    const body = (item: ItemDef): Phaser.GameObjects.GameObject[] => {
        const cy = local(CARD.bodyY + CARD.bodyH / 2)
        if (item.kind === 'imagem') {
            const px = -CARD.w / 2 + 60 + CARD.photoW / 2
            const border = scene.add.graphics()
            border.fillStyle(C.shadow, 0.2)
            border.fillRoundedRect(px - CARD.photoW / 2 - 8, cy - CARD.photoH / 2 - 2, CARD.photoW + 16, CARD.photoH + 16, 10)
            border.fillStyle(C.white, 1)
            border.fillRoundedRect(px - CARD.photoW / 2 - 8, cy - CARD.photoH / 2 - 8, CARD.photoW + 16, CARD.photoH + 16, 10)
            const pic = scene.add.image(px, cy, PHOTO_SHEET.key, cellKey(item.photo ?? 0)).setDisplaySize(CARD.photoW, CARD.photoH)
            const capX = px + CARD.photoW / 2 + 36
            const room = CARD.w / 2 - 40 - capX
            const cap = text(capX, cy, item.title, SIZE.title - 4, CSS.ink, {
                wordWrap: { width: room, useAdvancedWrap: true },
            }).setOrigin(0, 0.5)
            fit(cap, room, CARD.bodyH)
            return [border, pic, cap]
        }
        if (item.kind === 'alerta') {
            const bw = CARD.w - 140
            const msg = text(0, cy + 12, item.title, SIZE.title - 2, CSS.ink, {
                align: 'center',
                wordWrap: { width: bw - 60, useAdvancedWrap: true },
            }).setOrigin(0.5)
            fit(msg, bw - 60, CARD.bodyH - 34)
            const bh = Math.min(CARD.bodyH - 6, msg.displayHeight + 34)
            const bubble = scene.add.graphics()
            bubble.fillStyle(C.chatDark, 1)
            bubble.fillRoundedRect(-bw / 2, cy + 12 - bh / 2 + 5, bw, bh, 26)
            bubble.fillStyle(C.chat, 1)
            bubble.fillRoundedRect(-bw / 2, cy + 12 - bh / 2, bw, bh, 26)
            bubble.fillTriangle(-bw / 2 + 30, cy + 12 + bh / 2 - 4, -bw / 2 + 10, cy + 12 + bh / 2 + 18, -bw / 2 + 64, cy + 12 + bh / 2 - 4)
            const fwd = text(-bw / 2 + 8, cy + 12 - bh / 2 - 6, `↪ ${LABEL.forwarded}`, SIZE.label, CSS.inkSoft).setOrigin(0, 1)
            return [bubble, fwd, msg]
        }
        const title = text(0, cy, item.title, SIZE.title, CSS.ink, {
            align: 'center',
            wordWrap: { width: CARD.w - 120, useAdvancedWrap: true },
        }).setOrigin(0.5)
        fit(title, CARD.w - 120, CARD.bodyH)
        return [title]
    }

    const makeRow = (item: ItemDef, id: ClueId, index: number): Row => {
        const y = local(CARD.rowY + index * CARD.rowGap)
        const w = CARD.rowW
        const bg = scene.add.graphics()
        const paintBg = (tone: number) => {
            bg.clear()
            bg.fillStyle(tone, 1)
            bg.fillRoundedRect(-w / 2, -CARD.rowH / 2, w, CARD.rowH, 18)
        }
        paintBg(C.row)
        const icon = scene.add.image(-w / 2 + 38, 0, CLUE_SHEET.key, cellKey(CLUE_CELL[id]))
        icon.setScale(44 / icon.frame.width)
        const label = text(-w / 2 + 72, 0, CLUE_LABEL[item.kind][id], SIZE.label, CSS.inkSoft).setOrigin(0, 0.5)
        fit(label, 230)
        const value = text(-w / 2 + 310, 0, item.clues[id].text, SIZE.value, CSS.ink).setOrigin(0, 0.5)
        fit(value, w - 310 - 70)
        const mark = scene.add.graphics()
        const box = scene.add.container(0, y, [bg, icon, label, value, mark]).setAlpha(0)
        return { box, bg, mark, ok: item.clues[id].ok }
    }

    const tick = (g: Phaser.GameObjects.Graphics, x: number, ok: boolean, r = 20) => {
        g.clear()
        g.fillStyle(ok ? C.yes : C.no, 1)
        g.fillCircle(x, 0, r)
        g.lineStyle(r * 0.28, C.white, 1)
        if (ok) {
            g.beginPath()
            g.moveTo(x - r * 0.45, 0)
            g.lineTo(x - r * 0.1, r * 0.38)
            g.lineTo(x + r * 0.5, -r * 0.38)
            g.strokePath()
        } else {
            g.lineBetween(x - r * 0.38, -r * 0.38, x + r * 0.38, r * 0.38)
            g.lineBetween(x - r * 0.38, r * 0.38, x + r * 0.38, -r * 0.38)
        }
    }

    const makeButton = (trust: boolean, onPick: (trust: boolean) => void) => {
        const w = CARD.buttonW
        const h = CARD.buttonH
        const tone = trust ? C.yes : C.no
        const dark = trust ? C.yesDark : C.noDark
        const g = scene.add.graphics()
        g.fillStyle(dark, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, h / 2)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, 0.22)
        g.fillRoundedRect(-w / 2 + 18, -h / 2 + 8, w - 36, 18, 9)
        const mark = scene.add.graphics()
        tick(mark, -w / 2 + 50, trust, 26)
        const ring = scene.add.graphics()
        ring.lineStyle(4, C.white, 1)
        ring.strokeCircle(-w / 2 + 50, 0, 26)
        const label = fit(text(22, 0, trust ? LABEL.trust : LABEL.distrust, SIZE.button, CSS.white).setOrigin(0.5), w - 120)
        const x = trust ? -CARD.buttonGap / 2 : CARD.buttonGap / 2
        const box = scene.add.container(x, local(CARD.buttonY), [g, mark, ring, label]).setSize(w, h).setAlpha(0).setScale(0.6)
        box.setInteractive({ useHandCursor: true })
        box.on('pointerdown', () => {
            if (picked) return
            picked = true
            void FX.press(scene, box)
            onPick(trust)
        })
        return box
    }

    const clear = () => {
        panel.list.forEach(o => scene.tweens.killTweensOf(o))
        panel.removeAll(true)
        rows = []
        buttons = []
        footer = null
    }

    const stamp = (label: string, tone: number) => {
        const t = text(0, 0, label, SIZE.stamp, tone === C.yes ? CSS.yes : CSS.no).setOrigin(0.5)
        const w = t.width + 60
        const h = t.height + 30
        const g = scene.add.graphics()
        g.fillStyle(C.white, 0.92)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.lineStyle(8, tone, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
        const box = scene.add.container(0, local(CARD.rowY), [g, t]).setRotation(-0.14).setScale(1.9).setAlpha(0)
        panel.add(box)
        return FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 240, ease: 'Back.easeOut' })
    }

    const hide = () => {
        clear()
        panel.setVisible(false)
        veil.setVisible(false)
    }

    return {
        async open(item, from, onPick) {
            clear()
            picked = false
            panel.add(frame())
            panel.add(top(item))
            panel.add(body(item))
            rows = CLUES.map((id, i) => makeRow(item, id, i))
            rows.forEach(r => panel.add(r.box))
            buttons = [makeButton(true, onPick), makeButton(false, onPick)]
            buttons.forEach(b => {
                b.disableInteractive()
                panel.add(b)
            })

            veil.setVisible(true).setAlpha(0)
            void FX.to(scene, veil, { alpha: 1 }, { duration: TIMING.cardIn })
            panel.setVisible(true).setAlpha(1).setRotation(0).setPosition(from.x, from.y).setScale(0.06)
            await FX.to(scene, panel, { x: CARD.x, y: MID, scale: 1 }, { duration: TIMING.cardIn, ease: 'Back.easeOut' })

            for (const r of rows) {
                await FX.wait(scene, TIMING.clue)
                r.box.setX(-30)
                void FX.to(scene, r.box, { x: 0, alpha: 1 }, { duration: 220 })
                sound.tick()
            }
            await FX.wait(scene, TIMING.clue)
            await FX.all(
                ...buttons.map((b, i) => FX.to(scene, b, { alpha: 1, scale: 1 }, { duration: TIMING.buttons, delay: i * 80, ease: 'Back.easeOut' })),
            )
            buttons.forEach(b => b.setInteractive({ useHandCursor: true }))
        },
        async verdict(item, correct) {
            buttons.forEach(b => {
                b.disableInteractive()
                void FX.to(scene, b, { alpha: 0, scale: 0.8 }, { duration: 200 })
            })
            for (const r of rows) {
                r.bg.clear()
                r.bg.fillStyle(r.ok ? C.yesSoft : C.noSoft, 1)
                r.bg.fillRoundedRect(-CARD.rowW / 2, -CARD.rowH / 2, CARD.rowW, CARD.rowH, 18)
                tick(r.mark, CARD.rowW / 2 - 36, r.ok)
                void FX.to(scene, r.box, { scale: 1.04 }, { duration: 110, yoyo: true })
                await FX.wait(scene, 120)
            }
            const msg = correct ? item.why : `${LABEL.oops} ${item.why}`
            const t = fit(text(0, 0, msg, SIZE.why, correct ? CSS.yes : CSS.oops, { align: 'center' }).setOrigin(0.5), CARD.w - 120)
            const w = Math.min(CARD.w - 60, t.displayWidth + 60)
            const h = CARD.buttonH - 8
            const g = scene.add.graphics()
            g.fillStyle(correct ? C.yesSoft : C.noSoft, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.lineStyle(4, correct ? C.yes : C.oops, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            footer = scene.add.container(0, local(CARD.buttonY), [g, t]).setScale(0.7).setAlpha(0)
            panel.add(footer)
            await FX.to(scene, footer, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
            if (correct) return
            const decisive = rows.every(r => r.ok) ? rows : rows.filter(r => !r.ok)
            decisive.forEach(r =>
                scene.tweens.add({ targets: r.box, alpha: 0.45, duration: TIMING.blink, yoyo: true, repeat: 3 }),
            )
        },
        async keep(to) {
            await stamp(LABEL.saved, C.yes)
            await FX.wait(scene, TIMING.stamp)
            void FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.cardOut })
            await FX.to(scene, panel, { x: to.x, y: to.y, scale: 0.04, alpha: 0.4 }, { duration: TIMING.cardOut, ease: 'Back.easeIn' })
            hide()
        },
        async block() {
            await stamp(LABEL.blocked, C.no)
            await FX.wait(scene, TIMING.stamp)
            void FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.cardOut })
            await FX.to(scene, panel, { y: MID + 420, rotation: 0.35, alpha: 0 }, { duration: TIMING.cardOut, ease: 'Back.easeIn' })
            hide()
        },
        async shake() {
            await FX.shake(scene, panel, { amount: 14, times: 4 })
        },
        hide,
        destroy() {
            clear()
            panel.destroy()
            veil.destroy()
        },
    }
}
