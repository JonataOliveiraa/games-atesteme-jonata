import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_SHEET, cellKey } from '../data/files'
import { CARTS, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIRES } from '../data/weather'
import type { Rect, TireId } from '../types'
import { PLATE, RING } from './art'

export interface Carts {
    setEnabled(on: boolean): void
    visible(on: boolean): void
    press(tire: TireId): Promise<void>
    rect(tire: TireId): Rect
    both(): Rect
    destroy(): void
}

interface Button {
    tire: TireId
    box: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Image
    zone: Phaser.GameObjects.Zone
}

const KEYS: Record<string, number> = { a: 0, arrowleft: 0, '1': 0, d: 1, arrowright: 1, '2': 1 }

export function createCarts(scene: Phaser.Scene, order: TireId[], onPick: (tire: TireId) => void): Carts {
    let enabled = false
    let shown = true

    const buttons: Button[] = order.map((tire, i) => {
        const x = CARTS.xs[i]
        const ring = scene.add.image(0, 2, RING).setAlpha(0)
        const plate = scene.add.image(0, 0, PLATE)
        const art = scene.add.image(0, CARTS.artDY, PIECE_SHEET.key, cellKey(TIRES[tire].cart))
        art.setScale(CARTS.size / Math.max(art.frame.width, art.frame.height))
        const label = scene.add
            .text(0, CARTS.labelDY, TIRES[tire].name, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.tire}px`,
                color: tire === 'chuva' ? CSS.then : CSS.else,
            })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(x, CARTS.y, [ring, plate, art, label]).setDepth(DEPTH.carts)
        const zone = scene.add
            .zone(x, CARTS.y, CARTS.plateW + 20, CARTS.plateH + 20)
            .setDepth(DEPTH.carts + 1)
            .setInteractive({ useHandCursor: true })
        const b: Button = { tire, box, ring, zone }
        zone.on('pointerdown', () => pick(b))
        zone.on('pointerover', () => enabled && box.setScale(1.04))
        zone.on('pointerout', () => box.setScale(1))
        return b
    })

    const pick = (b: Button) => {
        if (!enabled || !shown) return
        carts.setEnabled(false)
        void FX.press(scene, b.box)
        void FX.ping(scene, b.box.x, b.box.y + CARTS.artDY, C.pulse, { radius: 110, depth: DEPTH.carts + 2 })
        onPick(b.tire)
    }

    const onKey = (e: KeyboardEvent) => {
        const i = KEYS[e.key.toLowerCase()]
        if (i === undefined || !buttons[i]) return
        pick(buttons[i])
    }
    scene.input.keyboard?.on('keydown', onKey)

    const paint = () => {
        buttons.forEach(b => {
            scene.tweens.killTweensOf(b.ring)
            b.box.setVisible(shown).setAlpha(enabled ? 1 : 0.62).setScale(1)
            b.ring.setAlpha(0)
            if (b.zone.input) b.zone.input.enabled = enabled && shown
            if (enabled && shown) {
                b.ring.setAlpha(1)
                scene.tweens.add({ targets: b.ring, alpha: 0.25, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            }
        })
    }
    paint()

    const carts: Carts = {
        setEnabled(on) {
            enabled = on
            paint()
        },
        visible(on) {
            shown = on
            paint()
        },
        async press(tire) {
            const b = buttons.find(x => x.tire === tire)
            if (!b) return
            b.box.setAlpha(1)
            void FX.ping(scene, b.box.x, b.box.y + CARTS.artDY, C.pulse, { radius: 110, depth: DEPTH.carts + 2 })
            await FX.press(scene, b.box)
            await FX.wait(scene, 250)
            paint()
        },
        rect(tire) {
            const b = buttons.find(x => x.tire === tire) ?? buttons[0]
            return { x: b.box.x, y: b.box.y, w: CARTS.plateW + 24, h: CARTS.plateH + 24 }
        },
        both() {
            const xs = buttons.map(b => b.box.x)
            const left = Math.min(...xs) - CARTS.plateW / 2 - 12
            const right = Math.max(...xs) + CARTS.plateW / 2 + 12
            return { x: (left + right) / 2, y: CARTS.y, w: right - left, h: CARTS.plateH + 24 }
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            buttons.forEach(b => {
                scene.tweens.killTweensOf([b.ring, b.box])
                b.zone.destroy()
                b.box.destroy()
            })
        },
    }
    return carts
}
