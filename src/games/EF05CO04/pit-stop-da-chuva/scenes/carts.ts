import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAR_CELL, KART_SHEET, MOTO_SHEET, PIECE_SHEET, cellKey } from '../data/files'
import { CARTS, DEPTH, H } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { TIRES, TIRE_INK } from '../data/rules'
import type { Rect, TireId } from '../types'
import { PLATE, RING } from './art'

/**
 * A bandeja de pneus: sobe quando o carro estaciona no box. Os carrinhos têm
 * o mesmo tamanho e a mesma borda: a cor do certo não entrega a resposta.
 */
export interface Carts {
    open(): Promise<void>
    close(): Promise<void>
    setEnabled(on: boolean): void
    press(tire: TireId): Promise<void>
    rect(tire: TireId): Rect
    all(): Rect
    destroy(): void
}

interface Button {
    tire: TireId
    box: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Image
    zone: Phaser.GameObjects.Zone
    x: number
}

export function createCarts(scene: Phaser.Scene, order: TireId[], badges: boolean, onPick: (tire: TireId) => void): Carts {
    let enabled = false
    let open = false
    const n = order.length
    // No N3 os carrinhos se separam em dois grupos, um por veículo.
    const split = badges ? order.findIndex((t, i) => i > 0 && TIRES[t].vehicle !== TIRES[order[i - 1]].vehicle) : -1
    const xs = order.map((_, i) => CARTS.center + (i - (n - 1) / 2) * CARTS.gap + (split > 0 ? (i < split ? -1 : 1) * CARTS.groupGap : 0))

    const buttons: Button[] = order.map((tire, i) => {
        const def = TIRES[tire]
        const ring = scene.add.image(0, 2, RING).setAlpha(0)
        const plate = scene.add.image(0, 0, PLATE)
        const art = scene.add.image(0, CARTS.artDY, PIECE_SHEET.key, cellKey(def.cart))
        art.setScale(CARTS.size / Math.max(art.frame.width, art.frame.height))
        const label = scene.add
            .text(0, CARTS.labelDY, def.name, { fontFamily: FONT.black, fontSize: `${SIZE.cart}px`, color: CSS[TIRE_INK[tire]] })
            .setOrigin(0.5)
            .setResolution(2)
        const parts: Phaser.GameObjects.GameObject[] = [ring, plate, art, label]
        if (badges) {
            const sheet = def.vehicle === 'moto' ? MOTO_SHEET : KART_SHEET
            const badge = scene.add.image(-CARTS.plateW / 2 + 34, -CARTS.plateH / 2 + 26, sheet.key, cellKey(CAR_CELL.empty))
            badge.setScale((CARTS.badge * 1.3) / badge.frame.width)
            parts.push(badge)
        }
        const box = scene.add.container(xs[i], H + CARTS.plateH, parts).setDepth(DEPTH.carts)
        const zone = scene.add
            .zone(xs[i], CARTS.y, CARTS.plateW + 16, CARTS.plateH + 16)
            .setDepth(DEPTH.carts + 1)
            .setInteractive({ useHandCursor: true })
        const b: Button = { tire, box, ring, zone, x: xs[i] }
        zone.on('pointerdown', () => pick(b))
        zone.on('pointerover', () => enabled && box.setScale(1.04))
        zone.on('pointerout', () => box.setScale(1))
        return b
    })

    const pick = (b: Button) => {
        if (!enabled || !open) return
        carts.setEnabled(false)
        void FX.press(scene, b.box)
        void FX.ping(scene, b.x, CARTS.y + CARTS.artDY, C.pulse, { radius: 100, depth: DEPTH.carts + 2 })
        onPick(b.tire)
    }

    const onKey = (e: KeyboardEvent) => {
        const i = Number(e.key) - 1
        if (!Number.isInteger(i) || !buttons[i]) return
        pick(buttons[i])
    }
    scene.input.keyboard?.on('keydown', onKey)

    const paint = () =>
        buttons.forEach(b => {
            scene.tweens.killTweensOf(b.ring)
            b.ring.setAlpha(0)
            b.box.setAlpha(open ? 1 : 0)
            if (b.zone.input) b.zone.input.enabled = enabled && open
            if (enabled && open) {
                b.ring.setAlpha(1)
                scene.tweens.add({ targets: b.ring, alpha: 0.25, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            }
        })
    paint()

    const carts: Carts = {
        async open() {
            open = true
            paint()
            await FX.all(
                ...buttons.map((b, i) =>
                    FX.to(scene, b.box, { y: CARTS.y }, { duration: TIMING.tray, delay: i * 50, ease: 'Back.easeOut' }),
                ),
            )
        },
        async close() {
            enabled = false
            paint()
            open = true
            await FX.all(...buttons.map(b => FX.to(scene, b.box, { y: H + CARTS.plateH }, { duration: TIMING.tray * 0.8, ease: 'Sine.easeIn' })))
            open = false
            paint()
        },
        setEnabled(on) {
            enabled = on
            paint()
        },
        async press(tire) {
            const b = buttons.find(x => x.tire === tire)
            if (!b) return
            void FX.ping(scene, b.x, CARTS.y + CARTS.artDY, C.pulse, { radius: 100, depth: DEPTH.carts + 2 })
            await FX.press(scene, b.box)
        },
        rect(tire) {
            const b = buttons.find(x => x.tire === tire) ?? buttons[0]
            return { x: b.x, y: CARTS.y, w: CARTS.plateW + 20, h: CARTS.plateH + 20 }
        },
        all() {
            const left = xs[0] - CARTS.plateW / 2 - 12
            const right = xs[n - 1] + CARTS.plateW / 2 + 12
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
