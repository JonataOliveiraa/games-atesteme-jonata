import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON, CHIPS, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { T } from '../data/timing'
import { NEXT } from '../data/words'
import type { Rect } from '../types'
import { paintImage } from './art'
import type { Picker } from './picker'

export interface Talk {
    say(name: string, tone: number, line: string, target: { x: number; y: number }): Promise<void>
    hide(): Promise<void>
    offer(lines: string[]): string[]
    keep(id: string): Promise<void>
    next(): string
    clear(): void
    rect(): Rect
    destroy(): void
}

export function createTalk(scene: Phaser.Scene, picker: Picker): Talk {
    const name = scene.add
        .text(BALLOON.pad, BALLOON.pad - 2, '', { fontFamily: FONT.black, fontSize: `${SIZE.balloonName}px`, color: CSS.accent })
        .setResolution(2)
    const body = scene.add
        .text(BALLOON.pad, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.balloon}px`,
            color: CSS.ink,
            wordWrap: { width: BALLOON.w - BALLOON.pad * 2, useAdvancedWrap: true },
            lineSpacing: 4,
        })
        .setResolution(2)
    const balloon = scene.add.container(BALLOON.x, BALLOON.y, [name, body]).setDepth(DEPTH.balloon).setAlpha(0)
    let back: Phaser.GameObjects.Image | null = null
    let height = 0
    let typing: { skip(): void } | null = null

    const paint = (tone: number, target: { x: number; y: number }) => {
        back?.destroy()
        const tipX = target.x - BALLOON.x
        const tipY = target.y - BALLOON.y
        const baseX = Math.max(46, Math.min(BALLOON.w - 60, tipX + BALLOON.tailDx))
        const top = Math.min(0, tipY)
        const left = Math.min(0, tipX)
        const right = Math.max(BALLOON.w + 4, tipX)
        const bottom = Math.max(height + 8, tipY)
        const h = height
        back = paintImage(
            scene,
            right - left,
            bottom - top,
            g => {
                g.fillStyle(C.shadow, 0.16)
                g.fillRoundedRect(4, 8, BALLOON.w, h, 26)
                g.fillStyle(C.white, 1)
                g.fillTriangle(baseX - 20, h - 4, baseX + 20, h - 4, tipX, tipY)
                g.lineStyle(4, C.line, 1)
                g.lineBetween(baseX - 20, h - 2, tipX, tipY)
                g.lineBetween(baseX + 20, h - 2, tipX, tipY)
                g.fillStyle(C.white, 1)
                g.fillRoundedRect(0, 0, BALLOON.w, h, 26)
                g.lineStyle(4, C.line, 1)
                g.strokeRoundedRect(0, 0, BALLOON.w, h, 26)
                g.fillStyle(C.white, 1)
                g.fillRect(baseX - 17, h - 6, 34, 8)
                g.fillStyle(tone, 1)
                g.fillRoundedRect(BALLOON.pad - 6, BALLOON.pad + 30, 40, 5, 2.5)
            },
            -left,
            -top,
        )
        balloon.addAt(back, 0)
    }

    let chips = new Map<string, Phaser.GameObjects.Container>()
    let rects = new Map<string, Rect>()

    const makeChip = (id: string, line: string, cy: number, primary: boolean) => {
        const w = CHIPS.w
        const h = CHIPS.h
        const fillColor = primary ? C.accent : C.white
        const edge = primary ? C.accentDark : C.accent
        const lip = primary ? C.accentDark : C.lilac
        const top = -h / 2 - 3
        const face = h - 6
        const iconX = -w / 2 + 44
        const shape = paintImage(
            scene,
            w + 4,
            h + 28,
            g => {
                g.fillStyle(C.shadow, 0.2)
                g.fillRoundedRect(-w / 2 + 3, top + 12, w, face, 28)
                g.fillStyle(lip, 1)
                g.fillRoundedRect(-w / 2, top + 7, w, face, 28)
                g.lineStyle(4, edge, 1)
                g.strokeRoundedRect(-w / 2, top + 7, w, face, 28)
                g.fillStyle(fillColor, 1)
                g.fillTriangle(w / 2 - 74, top + face - 6, w / 2 - 34, top + face - 6, w / 2 - 22, top + face + 22)
                g.lineStyle(4, edge, 1)
                g.lineBetween(w / 2 - 74, top + face - 2, w / 2 - 22, top + face + 22)
                g.lineBetween(w / 2 - 34, top + face - 2, w / 2 - 22, top + face + 22)
                g.fillStyle(fillColor, 1)
                g.fillRoundedRect(-w / 2, top, w, face, 28)
                g.lineStyle(4, edge, 1)
                g.strokeRoundedRect(-w / 2, top, w, face, 28)
                g.fillStyle(fillColor, 1)
                g.fillRect(w / 2 - 71, top + face - 6, 34, 8)
                g.fillStyle(C.white, primary ? 0.18 : 0)
                g.fillRoundedRect(-w / 2 + 10, top + 6, w - 20, 16, 8)
                if (primary) return
                g.fillStyle(C.accent, 1)
                g.fillCircle(iconX, top + face / 2, 24)
                g.fillTriangle(iconX - 14, top + face / 2 + 12, iconX - 2, top + face / 2 + 20, iconX - 20, top + face / 2 + 28)
                g.fillStyle(C.white, 1)
                ;[-9, 0, 9].forEach(dx => g.fillCircle(iconX + dx, top + face / 2, 3.6))
            },
            w / 2,
            h / 2 + 4,
        )
        const label = scene.add
            .text(primary ? 0 : 24, top + face / 2, line, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.chip}px`,
                color: primary ? CSS.white : CSS.accentDark,
                align: 'center',
                wordWrap: { width: primary ? w - 44 : w - 110, useAdvancedWrap: true },
            })
            .setOrigin(0.5)
            .setResolution(2)
        const x = CHIPS.right - w / 2
        const chip = scene.add.container(x, cy, [shape, label]).setDepth(DEPTH.chips)
        chip.setScale(0.85).setAlpha(0)
        void FX.to(scene, chip, { scale: 1, alpha: 1 }, { duration: T.chip, ease: 'Back.easeOut' })
        const rect = { x, y: cy, w, h: h + 8 }
        chips.set(id, chip)
        rects.set(id, rect)
        picker.add(id, chip, rect)
        return chip
    }

    const clear = () => {
        chips.forEach((chip, id) => {
            picker.remove(id)
            chip.destroy()
        })
        chips = new Map()
        rects = new Map()
    }

    return {
        async say(who, tone, line, target) {
            typing?.skip()
            name.setText(who)
            body.setText(line)
            body.setY(BALLOON.pad + 40)
            height = Math.max(118, body.y + body.height + BALLOON.pad)
            body.setText('')
            paint(tone, target)
            scene.tweens.killTweensOf(balloon)
            if (balloon.alpha < 1) {
                balloon.setScale(0.9).setAlpha(0)
                await FX.to(scene, balloon, { scale: 1, alpha: 1 }, { duration: T.short, ease: 'Back.easeOut' })
            } else {
                await FX.to(scene, balloon, { scale: 1.03 }, { duration: 80, yoyo: true })
                balloon.setScale(1)
            }
            const writer = FX.type(scene, body, line, { delay: T.type })
            typing = writer
            await writer
            typing = null
        },
        async hide() {
            typing?.skip()
            typing = null
            if (balloon.alpha <= 0) return
            scene.tweens.killTweensOf(balloon)
            await FX.to(scene, balloon, { alpha: 0, scale: 0.94 }, { duration: 180 })
        },
        offer(lines) {
            clear()
            const ids = lines.map((_, i) => `say:${i}`)
            let cy = CHIPS.bottom - CHIPS.h / 2 - 10
            for (let i = lines.length - 1; i >= 0; i--) {
                makeChip(ids[i], lines[i], cy, false)
                cy -= CHIPS.h + CHIPS.gap
            }
            return ids
        },
        async keep(id) {
            const chosen = chips.get(id)
            chips.forEach((chip, other) => {
                picker.remove(other)
                if (other !== id) void FX.to(scene, chip, { alpha: 0 }, { duration: 160 })
            })
            if (chosen) {
                await FX.to(scene, chosen, { y: chosen.y - 10 }, { duration: 160, ease: 'Back.easeOut' })
                await FX.wait(scene, T.keep)
                await FX.to(scene, chosen, { alpha: 0 }, { duration: 200 })
            }
            clear()
        },
        next() {
            clear()
            makeChip('next', `${NEXT}  ›`, CHIPS.bottom - CHIPS.h / 2 - 10, true)
            return 'next'
        },
        clear,
        rect: () => ({ x: BALLOON.x + BALLOON.w / 2, y: BALLOON.y + height / 2, w: BALLOON.w + 16, h: height + 16 }),
        destroy() {
            typing?.skip()
            clear()
            balloon.destroy()
        },
    }
}
