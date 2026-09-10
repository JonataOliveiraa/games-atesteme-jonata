import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Item } from '../types'

export interface HudOptions {
    level: number
    totalLevels: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud).setScrollFactor(0)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.22)
    bar.fillRect(0, HUD.h, W, 8)
    bar.fillStyle(C.warnDark, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.card, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.7)
    bar.fillRect(0, 0, W, 14)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.warnDark, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.warn, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 14, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.3)
    pill.fillRoundedRect(HUD.pillX + 14, HUD.pillY + 9, HUD.pillW - 28, 9, 5)

    const label =
        options.totalLevels > 1
            ? `NÍVEL ${options.level} de ${options.totalLevels}`
            : `NÍVEL ${options.level}`

    const level = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, label, {
            fontFamily: FONT.black,
            fontSize: '19px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    level.setStroke(CSS.ink, 5)

    const title = scene.add
        .text(HUD.titleX, HUD.titleY, '', {
            fontFamily: FONT.black,
            fontSize: '27px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: HUD.titleW },
        })
        .setOrigin(0.5)
        .setResolution(2)

    const slotsG = scene.add.graphics()
    let slotArt: Phaser.GameObjects.Image[] = []
    let slotItems: Item[] = []
    let filled = new Set<string>()
    let sheet = ''

    const slotX = (index: number, total: number) => {
        const width = total * HUD.slotSize + (total - 1) * HUD.slotGap
        const x0 = HUD.slotsRight - width
        return x0 + index * (HUD.slotSize + HUD.slotGap) + HUD.slotSize / 2
    }

    const paintSlots = () => {
        slotsG.clear()
        const total = slotItems.length
        for (let i = 0; i < total; i++) {
            const x = slotX(i, total)
            const done = filled.has(slotItems[i].id)
            const s = HUD.slotSize
            slotsG.fillStyle(C.ink, 1)
            slotsG.fillRoundedRect(x - s / 2 - 3, HUD.cy - s / 2 - 3, s + 6, s + 6, 16)
            slotsG.fillStyle(done ? C.ok : C.tableDeep, 1)
            slotsG.fillRoundedRect(x - s / 2, HUD.cy - s / 2, s, s, 13)
            slotsG.fillStyle(C.white, done ? 0.4 : 0.28)
            slotsG.fillRoundedRect(x - s / 2 + 6, HUD.cy - s / 2 + 5, s - 12, 10, 5)
        }
    }

    const placeSlots = () => {
        const total = slotItems.length
        slotArt.forEach((art, i) => {
            art.setPosition(slotX(i, total), HUD.cy)
            const done = filled.has(slotItems[i].id)
            art.setAlpha(done ? 1 : 0.4)
            if (done) art.clearTint()
            else art.setTint(C.inkSoft)
        })
    }

    const clearSlots = () => {
        slotArt.forEach(art => art.destroy())
        slotArt = []
    }

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.tableDeep, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.7)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    helpG.lineStyle(5, C.warnDark, 1)
    helpG.strokeCircle(0, 0, HUD.helpR)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)

    root.add([bar, pill, level, title, slotsG, helpG, helpText])

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on(
        'pointerdown',
        (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event?.stopPropagation?.()
            if (!enabled) return
            void FX.press(scene, helpG)
            options.onHelp()
        },
    )

    const edge = scene.add.graphics().setDepth(DEPTH.fx).setScrollFactor(0).setAlpha(0)

    return {
        setTitle(text: string) {
            title.setText(text)
        },

        /** O que a criança veio buscar nesta viagem, com a silhueta do que falta. */
        setSlots(items: Item[], sheetKey: string) {
            clearSlots()
            slotItems = items
            sheet = sheetKey
            filled = new Set()
            if (items.length && scene.textures.exists(sheet)) {
                slotArt = items.map(item => {
                    const art = scene.add
                        .image(0, HUD.cy, sheet, item.frame)
                        .setDisplaySize(HUD.slotSize - 14, HUD.slotSize - 14)
                        .setDepth(DEPTH.hud + 1)
                        .setScrollFactor(0)
                    root.add(art)
                    return art
                })
            }
            paintSlots()
            placeSlots()
        },

        hideSlots() {
            clearSlots()
            slotItems = []
            paintSlots()
        },

        fillSlot(itemId: string) {
            filled.add(itemId)
            paintSlots()
            placeSlots()
            const index = slotItems.findIndex(item => item.id === itemId)
            const art = slotArt[index]
            if (art) void FX.popIn(scene, art, { from: 1.7, duration: 260 })
        },

        emptySlot(itemId: string) {
            filled.delete(itemId)
            paintSlots()
            placeSlots()
        },

        slotPosition(itemId: string) {
            const index = slotItems.findIndex(item => item.id === itemId)
            return { x: slotX(Math.max(0, index), slotItems.length), y: HUD.cy }
        },

        flash(color: number) {
            edge.clear()
            edge.lineStyle(20, color, 1)
            edge.strokeRoundedRect(10, 10, W - 20, H - 20, 28)
            edge.setAlpha(0.85)
            scene.tweens.add({
                targets: edge,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
            })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        helpBounds() {
            return { x: HUD.helpX, y: HUD.cy, w: HUD.helpR * 2 + 20, h: HUD.helpR * 2 + 20 }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            clearSlots()
            root.destroy(true)
            zone.destroy()
            edge.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
