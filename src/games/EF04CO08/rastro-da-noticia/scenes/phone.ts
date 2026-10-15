import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { LOGO_SHEET, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { DEPTH, PHONE } from '../data/layout'
import { SITES } from '../data/sites'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { CaseDef, Rect, Vec } from '../types'
import { fit } from './art'

export interface PhoneCard {
    show(c: CaseDef, at: Vec): Promise<void>
    revealFrom(): Promise<void>
    bounceFrom(): Promise<void>
    tuck(to: Vec): Promise<void>
    diveIn(): Promise<void>
    rect(): Rect
    rowRect(): Rect
    screenCenter(): Vec
    hide(): void
    destroy(): void
}

const SCREEN = { x: -50, y: -97, w: 106, h: 190 }

export function createPhone(scene: Phaser.Scene): PhoneCard {
    const body = fit(scene, UI_SHEET, UI_CELL.phone, PHONE.h)
    const k = body.scale
    const sw = SCREEN.w * k
    const sh = SCREEN.h * k
    const sx = SCREEN.x * k
    const sy = SCREEN.y * k
    const bubble = scene.add.graphics()
    const headline = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.phone}px`,
            color: CSS.ink,
            align: 'left',
            wordWrap: { width: sw - 50, useAdvancedWrap: true },
        })
        .setOrigin(0, 0)
        .setResolution(2)
    const label = scene.add
        .text(0, 0, LABEL.copied, { fontFamily: FONT.body, fontSize: `${SIZE.row}px`, color: CSS.inkSoft })
        .setOrigin(0.5)
        .setResolution(2)
    const fromLogo = fit(scene, LOGO_SHEET, 0, PHONE.logo)
    const fromName = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.row}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    const from = scene.add.container(0, 0, [label, fromLogo, fromName])
    const box = scene.add.container(0, 0, [body, bubble, headline, from]).setDepth(DEPTH.phone).setVisible(false)

    const card: PhoneCard = {
        async show(c, at) {
            scene.tweens.killTweensOf([box, from])
            headline.setText(c.phone.headline).setScale(1)
            const left = sx + 16
            const top = sy + 26
            headline.setPosition(left + 12, top + 14)
            if (headline.height > sh * 0.55) headline.setScale((sh * 0.55) / headline.height)
            const textH = headline.displayHeight
            bubble.clear()
            bubble.fillStyle(C.white, 1)
            bubble.fillRoundedRect(left, top, sw - 32, textH + 28, 18)
            bubble.fillTriangle(left + 10, top + textH + 22, left + 34, top + textH + 22, left + 6, top + textH + 46)
            bubble.lineStyle(3, C.barDark, 1)
            bubble.strokeRoundedRect(left, top, sw - 32, textH + 28, 18)
            const site = SITES[c.phone.from]
            label.setText(LABEL.from)
            const rowTop = sy + sh - 118
            label.setPosition(sx + sw / 2, 0)
            fromLogo.setFrame(cellKey(site.logo))
            fromLogo.setScale(PHONE.logo / Math.max(fromLogo.frame.width, fromLogo.frame.height))
            fromLogo.setPosition(sx + sw / 2, 40)
            fromName.setText(site.name).setScale(1).setPosition(sx + sw / 2, 80)
            if (fromName.width > sw - 20) fromName.setScale((sw - 20) / fromName.width)
            from.setPosition(0, rowTop).setAlpha(0)
            box.setPosition(at.x, at.y).setScale(0.3).setAlpha(0).setAngle(0).setVisible(true)
            await FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 420, ease: 'Back.easeOut' })
            await FX.to(scene, box, { angle: 4 }, { duration: 60, yoyo: true, repeat: 3 })
            box.setAngle(0)
        },
        async revealFrom() {
            scene.tweens.killTweensOf(from)
            const y = from.y
            from.setY(y + 16)
            await FX.to(scene, from, { alpha: 1, y }, { duration: 420, ease: 'Sine.easeOut' })
        },
        async bounceFrom() {
            scene.tweens.killTweensOf(fromLogo)
            fromLogo.setY(40)
            await FX.to(scene, fromLogo, { y: 26 }, { duration: 180, yoyo: true, ease: 'Sine.easeOut' })
            fromLogo.setY(40)
        },
        async tuck(to) {
            scene.tweens.killTweensOf(box)
            await FX.to(scene, box, { x: to.x, y: to.y, scale: 0.1, alpha: 0.3 }, { duration: 600, ease: 'Sine.easeInOut' })
            box.setVisible(false)
        },
        async diveIn() {
            scene.tweens.killTweensOf(box)
            await FX.to(scene, box, { scale: 4, alpha: 0 }, { duration: 700, ease: 'Cubic.easeIn' })
            box.setVisible(false)
        },
        rect: () => ({ x: box.x, y: box.y, w: body.displayWidth + 20, h: body.displayHeight + 20 }),
        rowRect: () => ({ x: box.x + (sx + sw / 2) * box.scale, y: box.y + (from.y + 40) * box.scale, w: sw + 10, h: 130 }),
        screenCenter: () => ({ x: box.x + (sx + sw / 2) * box.scale, y: box.y + (sy + sh / 2) * box.scale }),
        hide() {
            scene.tweens.killTweensOf([box, from, fromLogo])
            box.setVisible(false)
        },
        destroy() {
            scene.tweens.killTweensOf([box, from, fromLogo])
            box.destroy()
        },
    }
    return card
}
