import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, KEY, LOCK, rowX } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { createCard, type Card, type Tone } from './symbols'
import type { Code, Word } from '../types'

interface Slot {
    x: number
    socket: Phaser.GameObjects.Graphics
    padlock: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    card: Card | null
    verified: boolean
}

function paintSocket(g: Phaser.GameObjects.Graphics, size: number, tone: Tone) {
    const border = tone === 'wrong' ? C.bad : tone === 'ok' ? C.ok : C.sandDeep
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-size / 2, -size / 2 + 6, size, size, 22)
    g.lineStyle(tone === 'idle' ? 6 : 9, border, tone === 'idle' ? 0.85 : 1)
    g.strokeRoundedRect(-size / 2, -size / 2, size, size, 22)
}

function paintPadlock(g: Phaser.GameObjects.Graphics, size: number) {
    const w = size * 0.3
    const h = size * 0.26
    g.clear()
    g.lineStyle(8, C.badDark, 1)
    g.beginPath()
    g.arc(0, -h * 0.55, w * 0.32, Math.PI, 0, false)
    g.strokePath()
    g.fillStyle(C.bad, 1)
    g.fillRoundedRect(-w / 2, -h * 0.35, w, h, 7)
    g.lineStyle(4, C.badDark, 1)
    g.strokeRoundedRect(-w / 2, -h * 0.35, w, h, 7)
}

function paintKey(g: Phaser.GameObjects.Graphics, ready: boolean) {
    const body = ready ? C.warn : C.sandDeep
    const edge = ready ? C.warnDark : C.inkSoft
    g.clear()
    g.fillStyle(C.ink, 0.2)
    g.fillCircle(3, 8, KEY.r)
    g.fillStyle(C.cream, 1)
    g.fillCircle(0, 0, KEY.r)
    g.lineStyle(7, edge, 1)
    g.strokeCircle(0, 0, KEY.r)

    g.fillStyle(body, 1)
    g.fillCircle(-16, -14, 20)
    g.fillStyle(C.cream, 1)
    g.fillCircle(-16, -14, 8)
    g.fillStyle(body, 1)
    g.fillRect(-8, -14, 40, 11)
    g.fillRect(22, -3, 10, 16)
    g.fillRect(6, -3, 9, 12)
}

/**
 * A FECHADURA E A CHAVE.
 *
 * Pôr e tirar não custam nada e não têm limite. Quem cobra é a chave — é essa
 * separação que impede o jogo de punir dedo em vez de cabeça.
 */
export function createLock(
    scene: Phaser.Scene,
    handlers: { onSlot: (index: number) => void; onKey: () => void },
) {
    const slots: Slot[] = []
    let enabled = true
    let keyReady = false
    let code: Code = 'cor'

    const keyG = scene.add.graphics().setDepth(DEPTH.card)
    keyG.setPosition(KEY.x, KEY.y)
    paintKey(keyG, false)

    const keyLabel = scene.add.text(KEY.x, KEY.y + KEY.r + 16, 'ABRIR', {
        fontFamily: FONT.black,
        fontSize: SIZE.key,
        color: CSS.inkSoft,
    }).setOrigin(0.5).setDepth(DEPTH.card).setResolution(2)

    const keyZone = scene.add.zone(KEY.x, KEY.y, KEY.r * 2, KEY.r * 2)
        .setOrigin(0.5)
        .setDepth(DEPTH.card)
        .setInteractive({ useHandCursor: true })

    let breathing: Phaser.Tweens.Tween | null = null

    keyZone.on('pointerdown', () => {
        if (!enabled || !keyReady) return
        FX.press(scene, keyG)
        handlers.onKey()
    })

    const clearSlots = () => {
        slots.forEach(slot => {
            slot.card?.destroy()
            slot.socket.destroy()
            slot.padlock.destroy()
            slot.zone.destroy()
        })
        slots.length = 0
    }

    return {
        setup(count: number, targetCode: Code) {
            clearSlots()
            code = targetCode
            for (let i = 0; i < count; i++) {
                const x = rowX(i, count)
                const socket = scene.add.graphics().setPosition(x, LOCK.cy).setDepth(DEPTH.panel)
                paintSocket(socket, LOCK.size, 'idle')

                // canto, e não centro: a criança precisa continuar vendo o que pôs
                const padlock = scene.add.graphics()
                    .setPosition(x + LOCK.size * 0.34, LOCK.cy - LOCK.size * 0.32)
                    .setDepth(DEPTH.card + 2)
                    .setVisible(false)
                paintPadlock(padlock, LOCK.size)

                const zone = scene.add.zone(x, LOCK.cy, LOCK.size, LOCK.size)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (!enabled) return
                    handlers.onSlot(i)
                })

                slots.push({ x, socket, padlock, zone, card: null, verified: false })
                FX.popIn(scene, socket, { delay: i * 70 })
            }
        },

        put(index: number, word: Word, from?: { x: number; y: number }) {
            const slot = slots[index]
            if (!slot || slot.card) return
            const card = createCard(scene, word, code, LOCK.size - 12)
            card.container.setDepth(DEPTH.card)
            slot.card = card

            if (!from) {
                card.container.setPosition(slot.x, LOCK.cy)
                FX.popIn(scene, card.container, { from: 0.6, duration: 260 })
                return
            }

            card.container.setPosition(from.x, from.y)
            scene.tweens.add({
                targets: card.container,
                x: slot.x,
                y: LOCK.cy,
                duration: FX.ms(scene, 260),
                ease: 'Back.easeOut',
            })
        },

        take(index: number): Word | null {
            const slot = slots[index]
            if (!slot || !slot.card || slot.verified) return null
            const word = slot.card.word
            const card = slot.card
            slot.card = null
            slot.padlock.setVisible(false)
            paintSocket(slot.socket, LOCK.size, 'idle')
            FX.burstOut(scene, card.container, { duration: 220 })
            return word
        },

        words(): (Word | null)[] {
            return slots.map(slot => slot.card?.word ?? null)
        },

        isFull() {
            return slots.length > 0 && slots.every(slot => slot.card !== null)
        },

        verify(index: number) {
            const slot = slots[index]
            if (!slot) return
            slot.verified = true
            paintSocket(slot.socket, LOCK.size, 'ok')
            slot.card?.setTone('ok')
        },

        /** Só o encaixe travado responde: é ele, e nada mais, que destrava. */
        blame(index: number) {
            const slot = slots[index]
            if (!slot) return
            paintSocket(slot.socket, LOCK.size, 'wrong')
            slot.card?.setTone('wrong')
            slot.padlock.setVisible(true)
            FX.popIn(scene, slot.padlock, { from: 0.4, duration: 260 })
            if (slot.card) FX.shake(scene, slot.card.container, { amount: 10, times: 3 })
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        setKeyReady(value: boolean) {
            if (keyReady === value) return
            keyReady = value
            paintKey(keyG, value)
            keyLabel.setColor(value ? CSS.ink : CSS.inkSoft)
            breathing?.remove()
            breathing = null
            if (value) {
                breathing = scene.tweens.add({
                    targets: keyG,
                    scale: 1.07,
                    duration: FX.ms(scene, 620),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            } else {
                keyG.setScale(1)
            }
        },

        async turnKey() {
            breathing?.remove()
            breathing = null
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: keyG,
                    angle: 90,
                    duration: FX.ms(scene, 260),
                    ease: 'Back.easeOut',
                    yoyo: true,
                    onComplete: () => resolve(),
                })
            })
            keyG.setAngle(0)
        },

        destroy() {
            clearSlots()
            breathing?.remove()
            keyG.destroy()
            keyLabel.destroy()
            keyZone.destroy()
        },
    }
}
