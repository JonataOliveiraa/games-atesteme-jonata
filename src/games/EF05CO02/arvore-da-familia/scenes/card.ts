import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_SHEET } from '../data/files'
import { CARD, DEPTH } from '../data/layout'
import { PEOPLE } from '../data/people'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Mood, PersonDef, Role, Size } from '../types'
import { CARD_ME, CARD_TEX, SHADOW, hasFrame } from './art'
import { faceArt } from './faces'

export interface Card {
    readonly role: Role
    readonly person: PersonDef
    readonly box: Phaser.GameObjects.Container
    readonly size: Size
    put(x: number, y: number, angle?: number): void
    setFace(mood: Mood): void
    setPickable(on: boolean, pulse: boolean): void
    setLifted(on: boolean): void
    flyTo(x: number, y: number, o?: { arc?: number; ms?: number; angle?: number; spin?: number }): Promise<void>
    shake(): Promise<void>
    hop(delay?: number): Promise<void>
    dropOut(): Promise<void>
    destroy(): void
}

const STRIP = CARD.face / CARD.h

export function createCard(scene: Phaser.Scene, role: Role, size: Size, text: string, onTap: (card: Card) => void): Card {
    const person = PEOPLE[role]
    const { w, h } = size
    const faceH = Math.round(h * STRIP)
    const fit = Math.min(w - 8, faceH - 7)
    const radius = Math.round((CARD.radius * w) / CARD.w)
    const drawn = hasFrame(scene, UI_SHEET.key, 'card')
    const shadow = scene.add.image(5, 8, SHADOW).setAlpha(0.18).setDisplaySize(w + 6, h + 6)
    const frame = drawn
        ? scene.add.image(0, 0, UI_SHEET.key, 'card').setDisplaySize(w, h)
        : scene.add.image(0, 0, role === 'me' ? CARD_ME : CARD_TEX).setDisplaySize(w + 6, h + 6)
    const strip = scene.add.graphics()
    if (drawn && role === 'me') {
        strip.fillStyle(C.me, 0.92)
        strip.fillRoundedRect(-w / 2 + 4, -h / 2 + faceH + 2, w - 8, h - faceH - 6, { tl: 0, tr: 0, bl: 9, br: 9 })
    }
    const face = scene.add.image(0, -h / 2 + faceH - 1, '__DEFAULT').setOrigin(0.5, 1)
    const showFace = (mood: Mood) => {
        const art = faceArt(scene, role, mood, fit)
        face.setTexture(art.key, art.frame).setScale(art.scale)
    }
    showFace('calm')
    const label = scene.add
        .text(0, -h / 2 + faceH + (h - faceH) / 2 + 1, text, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.label}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    if (label.width > w - 12) label.setScale((w - 12) / label.width)
    const ring = scene.add.graphics().setVisible(false)
    const pad = CARD.ring
    ring.lineStyle(6, C.ring, 1)
    ring.strokeRoundedRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2, radius + pad)
    const box = scene.add.container(0, 0, [shadow, ring, frame, strip, face, label]).setDepth(DEPTH.cards)
    box.setSize(w, h)
    box.setInteractive({ useHandCursor: true })
    if (box.input) box.input.enabled = false

    let lifted = false
    const pulse = (on: boolean) => {
        scene.tweens.killTweensOf(ring)
        ring.setAlpha(1).setScale(1).setVisible(on)
        if (on) scene.tweens.add({ targets: ring, alpha: 0.35, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }

    const card: Card = {
        role,
        person,
        box,
        size,
        put(x, y, angle = 0) {
            scene.tweens.killTweensOf(box)
            box.setPosition(x, y).setAngle(angle).setScale(1)
            box.setData('restY', y)
            box.setData('restAngle', angle)
        },
        setFace: showFace,
        setPickable(on, glow) {
            if (box.input) box.input.enabled = on
            if (!lifted) pulse(on && glow)
        },
        setLifted(on) {
            if (on === lifted) return
            lifted = on
            scene.tweens.killTweensOf(box)
            box.setDepth(on ? DEPTH.lifted : DEPTH.cards)
            shadow.setPosition(on ? 9 : 5, on ? 18 : 8).setAlpha(on ? 0.22 : 0.18)
            if (on) {
                pulse(false)
                ring.setVisible(true)
            } else ring.setVisible(false)
            void FX.to(scene, box, { y: box.getData('restY') - (on ? CARD.lift : 0), scale: on ? 1.08 : 1, angle: on ? 0 : box.getData('restAngle') ?? 0 }, { duration: 160, ease: 'Sine.easeOut' })
        },
        flyTo(x, y, o = {}) {
            const fromX = box.x
            const fromY = box.y
            const fromAngle = box.angle
            const toAngle = (o.angle ?? 0) + 360 * (o.spin ?? 0)
            const arc = o.arc ?? 70
            lifted = false
            ring.setVisible(false)
            scene.tweens.killTweensOf([box, ring])
            if (box.depth < DEPTH.lifted) box.setDepth(DEPTH.lifted)
            return new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: o.ms ?? 480,
                    ease: 'Sine.easeInOut',
                    onUpdate: tw => {
                        const t = tw.getValue() ?? 0
                        box.setPosition(fromX + (x - fromX) * t, fromY + (y - fromY) * t - Math.sin(t * Math.PI) * arc)
                        box.setAngle(fromAngle + (toAngle - fromAngle) * t)
                        box.setScale(1 + Math.sin(t * Math.PI) * 0.08)
                    },
                    onComplete: () => {
                        box.setPosition(x, y).setAngle(o.angle ?? 0).setScale(1).setDepth(DEPTH.cards)
                        shadow.setPosition(5, 8).setAlpha(0.18)
                        box.setData('restY', y)
                        box.setData('restAngle', o.angle ?? 0)
                        resolve()
                    },
                })
            })
        },
        async shake() {
            const x = box.x
            await FX.to(scene, box, { x: x + 9 }, { duration: 60, yoyo: true, repeat: 3 })
            box.setX(x)
        },
        async hop(delay = 0) {
            const y = box.y
            await FX.to(scene, box, { y: y - 18 }, { duration: 170, delay, yoyo: true, ease: 'Sine.easeOut' })
            box.setY(y)
        },
        async dropOut() {
            if (box.input) box.input.enabled = false
            ring.setVisible(false)
            await FX.to(scene, box, { y: box.y + 180, angle: box.angle + 35, alpha: 0 }, { duration: 620, ease: 'Sine.easeIn' })
        },
        destroy() {
            scene.tweens.killTweensOf([box, ring])
            box.destroy()
        },
    }
    box.on('pointerdown', () => onTap(card))
    return card
}
