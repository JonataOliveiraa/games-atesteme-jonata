import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CARD, DEPTH } from '../data/layout'
import { RULES } from '../data/rules'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { RuleId } from '../types'
import { ICON, piece, setPiece } from './art'
import type { Rect } from './guide'

export interface Card {
    show(id: RuleId): Promise<void>
    wobble(): Promise<void>
    pulse(on: boolean): void
    flash(): Promise<void>
    rect(): Rect
    destroy(): void
}

export function createCard(scene: Phaser.Scene): Card {
    const frame = scene.add.graphics()
    const paintFrame = (tone: number) => {
        frame.clear()
        frame.fillStyle(C.shadow, 0.16)
        frame.fillRoundedRect(-CARD.w / 2 + 4, -CARD.h / 2 + 7, CARD.w, CARD.h, 24)
        frame.fillStyle(tone, 1)
        frame.fillRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 24)
        frame.lineStyle(5, C.ink, 1)
        frame.strokeRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 24)
    }
    paintFrame(C.cream)

    const style = { fontFamily: FONT.black, fontSize: `${SIZE.card}px`, color: CSS.ink }
    const top = scene.add.text(0, -22, '', style).setOrigin(0.5).setResolution(2)
    const bottom = scene.add.text(0, 22, '', style).setOrigin(0.5).setResolution(2)
    const iconSize = CARD.icon * 1.4
    const iconTop = piece(scene, 'iconFlame', iconSize)
    const iconBottom = piece(scene, 'iconBelt', iconSize)
    const arrow = scene.add.text(0, 22, '→', style).setOrigin(0.5).setResolution(2)

    const box = scene.add.container(CARD.x, CARD.y, [frame, top, bottom, iconTop, iconBottom, arrow]).setDepth(DEPTH.card)
    let pulseTween: Phaser.Tweens.Tween | undefined

    return {
        async show(id) {
            const rule = RULES[id]
            const isWhile = rule.kind === 'while'
            top.setText(rule.text[0])
            bottom.setText(rule.text[1])
            setPiece(iconTop, isWhile ? ICON[rule.icon] : ICON.belt, iconSize)
            setPiece(iconBottom, isWhile ? ICON.belt : ICON[rule.icon], iconSize)
            arrow.setVisible(isWhile)
            const gap = 16
            const layoutLine = (icon: Phaser.GameObjects.Image, text: Phaser.GameObjects.Text, y: number, lead?: Phaser.GameObjects.Text) => {
                const leadW = lead ? lead.width + gap : 0
                let x = -(leadW + iconSize + gap + text.width) / 2
                if (lead) {
                    lead.setPosition(x + lead.width / 2, y)
                    x += leadW
                }
                icon.setPosition(x + iconSize / 2, y + 2)
                text.setPosition(x + iconSize + gap + text.width / 2, y)
            }
            layoutLine(iconTop, top, -22)
            layoutLine(iconBottom, bottom, 22, isWhile ? arrow : undefined)
            box.setScale(1).setAlpha(1).setAngle(0)
            await FX.popIn(scene, box, { from: 0.6, duration: 360 })
        },
        async wobble() {
            pulseTween?.remove()
            pulseTween = undefined
            box.setScale(1)
            await FX.to(scene, box, { angle: 4 }, { duration: 90, yoyo: true, repeat: 4 })
            box.setAngle(0)
            await FX.to(scene, box, { scale: 0.6, alpha: 0 }, { duration: 180, ease: 'Quad.easeIn' })
        },
        pulse(on) {
            if (on === Boolean(pulseTween)) return
            pulseTween?.remove()
            pulseTween = undefined
            box.setScale(1)
            if (on) pulseTween = scene.tweens.add({ targets: box, scale: 1.05, duration: 420, yoyo: true, repeat: -1 })
        },
        async flash() {
            for (let i = 0; i < 3; i++) {
                paintFrame(C.glowWarn)
                await FX.wait(scene, 140)
                paintFrame(C.cream)
                await FX.wait(scene, 120)
            }
        },
        rect() {
            return { x: CARD.x, y: CARD.y, w: CARD.w + 24, h: CARD.h + 24 }
        },
        destroy() {
            pulseTween?.remove()
            box.destroy()
        },
    }
}
