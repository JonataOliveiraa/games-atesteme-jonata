import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_SHEET, cellKey } from '../data/files'
import { CARTS, DEPTH, H, TAG } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { TIMING } from '../data/timing'
import { TIRES, TIRE_INK, vehicleRow } from '../data/rules'
import { CONDITION_ICON, LABEL } from '../data/words'
import type { Rect, RuleRow, TireId, Vehicle } from '../types'
import { PLATE, RING } from './art'
import { vehicleIcon } from './car'

export type Pick = TireId | Vehicle

export const isVehicle = (id: Pick): id is Vehicle => id === 'moto' || id === 'carro'

/**
 * A bandeja do box: sobe quando o carro estaciona. Na parada que pede veículo,
 * primeiro só MOTO e CARRO; depois, só os pneus daquele veículo. Todos os
 * botões têm o mesmo tamanho e a mesma borda: a cor do certo não entrega a resposta.
 * Em cima de cada um vai a linha da regra que leva a ele ("SE ☁", "SENÃO"): a regra
 * mora nos botões. Se a criança demora, as etiquetas acendem uma por uma, na ordem
 * em que a regra é lida, sem nunca marcar a certa.
 */
export interface Carts {
    open(ids: Pick[]): Promise<void>
    close(): Promise<void>
    setEnabled(on: boolean): void
    press(id: Pick): Promise<void>
    rect(id: Pick): Rect
    /** A área dos botões abertos (para o recorte do tutorial). */
    area(): Rect
    /** As etiquetas acendem uma por uma, na ordem da regra. */
    read(): void
    destroy(): void
}

interface Button {
    id: Pick
    box: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Image
    zone: Phaser.GameObjects.Zone
    tag: Phaser.GameObjects.Container | null
    x: number
}

export function createCarts(scene: Phaser.Scene, tires: TireId[], vehicles: boolean, rows: RuleRow[], onPick: (id: Pick) => void): Carts {
    let enabled = false
    let open = false
    let shown: Button[] = []

    const tag = (row: RuleRow | undefined) => {
        if (!row) return null
        const word = scene.add
            .text(0, 0, row.word, { fontFamily: FONT.black, fontSize: `${SIZE.tag}px`, color: inkOn(C.accent) })
            .setOrigin(0.5)
            .setResolution(2)
        const cw = word.width + 24
        const look = row.test ? CONDITION_ICON[row.test] : null
        const icon = look ? scene.add.image(0, 0, look.sheet, cellKey(look.cell)) : null
        icon?.setScale(TAG.icon / Math.max(icon.frame.width, icon.frame.height))
        const iw = icon ? icon.displayWidth : 0
        const w = cw + (icon ? TAG.gap + iw : 0)
        const chip = scene.add.graphics()
        chip.fillStyle(C.accent, 1)
        chip.fillRoundedRect(-w / 2, -TAG.h / 2, cw, TAG.h, TAG.h / 2)
        word.setX(-w / 2 + cw / 2)
        icon?.setX(w / 2 - iw / 2)
        const bg = scene.add.graphics()
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-w / 2 - TAG.pad, -TAG.h / 2 - TAG.pad / 2, w + TAG.pad * 2, TAG.h + TAG.pad, (TAG.h + TAG.pad) / 2)
        bg.lineStyle(3, C.headerRim, 1)
        bg.strokeRoundedRect(-w / 2 - TAG.pad, -TAG.h / 2 - TAG.pad / 2, w + TAG.pad * 2, TAG.h + TAG.pad, (TAG.h + TAG.pad) / 2)
        return scene.add.container(0, -CARTS.plateH / 2 - TAG.dy, [bg, chip, word, ...(icon ? [icon] : [])])
    }

    const make = (id: Pick): Button => {
        const ring = scene.add.image(0, 2, RING).setAlpha(0)
        const plate = scene.add.image(0, 0, PLATE)
        let art: Phaser.GameObjects.Image | Phaser.GameObjects.Container
        let name: string
        let color: string
        if (isVehicle(id)) {
            art = vehicleIcon(scene, id, CARTS.plateW - 20).setPosition(0, CARTS.artDY)
            name = id === 'moto' ? LABEL.moto : LABEL.carro
            color = CSS.ink
        } else {
            const img = scene.add.image(0, CARTS.artDY, PIECE_SHEET.key, cellKey(TIRES[id].cart))
            art = img.setScale(CARTS.size / Math.max(img.frame.width, img.frame.height))
            name = TIRES[id].name
            color = CSS[TIRE_INK[id]]
        }
        const label = scene.add
            .text(0, CARTS.labelDY, name, { fontFamily: FONT.black, fontSize: `${SIZE.cart}px`, color })
            .setOrigin(0.5)
            .setResolution(2)
        const vr = isVehicle(id) ? vehicleRow(rows, id) : null
        const top = tag(vr !== null ? rows[vr] : rows.find(r => !isVehicle(id) && r.tire === id))
        const box = scene.add
            .container(CARTS.center, H + CARTS.plateH, [ring, plate, art, label, ...(top ? [top] : [])])
            .setDepth(DEPTH.carts)
            .setVisible(false)
        const zone = scene.add
            .zone(CARTS.center, CARTS.y, CARTS.plateW + 16, CARTS.plateH + 16)
            .setDepth(DEPTH.carts + 1)
            .setInteractive({ useHandCursor: true })
        const b: Button = { id, box, ring, zone, tag: top, x: CARTS.center }
        zone.on('pointerdown', () => pick(b))
        zone.on('pointerover', () => enabled && box.setScale(1.04))
        zone.on('pointerout', () => box.setScale(1))
        return b
    }

    const buttons: Button[] = [...tires, ...(vehicles ? (['moto', 'carro'] as Vehicle[]) : [])].map(make)

    const pick = (b: Button) => {
        if (!enabled || !open || !shown.includes(b)) return
        carts.setEnabled(false)
        void FX.press(scene, b.box)
        void FX.ping(scene, b.x, CARTS.y + CARTS.artDY, C.pulse, { radius: 100, depth: DEPTH.carts + 2 })
        onPick(b.id)
    }

    const onKey = (e: KeyboardEvent) => {
        const i = Number(e.key) - 1
        if (!Number.isInteger(i) || !shown[i]) return
        pick(shown[i])
    }
    scene.input.keyboard?.on('keydown', onKey)

    let hint: Phaser.Time.TimerEvent | undefined
    const stopHint = () => {
        hint?.remove()
        hint = undefined
        shown.forEach(b => b.tag && scene.tweens.killTweensOf(b.tag) && b.tag.setScale(1))
    }
    /** Lê a regra em voz de olho: cada etiqueta cresce e volta, da esquerda para a direita. */
    const read = () =>
        shown.forEach((b, i) => {
            if (!b.tag) return
            void FX.to(scene, b.tag, { scale: 1.22 }, { duration: 200, yoyo: true, delay: i * TIMING.hintStep, ease: 'Sine.easeOut' })
        })
    const startHint = () => {
        stopHint()
        hint = scene.time.addEvent({ delay: TIMING.hintFirst, callback: () => {
            read()
            hint = scene.time.addEvent({ delay: TIMING.hintEvery, loop: true, callback: read })
        } })
    }

    const paint = () =>
        buttons.forEach(b => {
            const on = shown.includes(b)
            scene.tweens.killTweensOf(b.ring)
            b.ring.setAlpha(0)
            b.box.setVisible(on)
            if (b.zone.input) b.zone.input.enabled = on && enabled && open
            if (on && enabled && open) {
                b.ring.setAlpha(1)
                scene.tweens.add({ targets: b.ring, alpha: 0.25, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            }
        })
    paint()

    const carts: Carts = {
        async open(ids) {
            shown = ids.map(id => buttons.find(b => b.id === id)).filter((b): b is Button => !!b)
            shown.forEach((b, i) => {
                b.x = CARTS.center + (i - (shown.length - 1) / 2) * CARTS.gap
                b.box.setPosition(b.x, H + CARTS.plateH).setScale(1)
                b.zone.setPosition(b.x, CARTS.y)
            })
            open = true
            paint()
            await FX.all(
                ...shown.map((b, i) => FX.to(scene, b.box, { y: CARTS.y }, { duration: TIMING.tray, delay: i * 50, ease: 'Back.easeOut' })),
            )
        },
        async close() {
            enabled = false
            stopHint()
            paint()
            await FX.all(...shown.map(b => FX.to(scene, b.box, { y: H + CARTS.plateH }, { duration: TIMING.tray * 0.8, ease: 'Sine.easeIn' })))
            open = false
            shown = []
            paint()
        },
        setEnabled(on) {
            enabled = on
            if (on && open) startHint()
            else stopHint()
            paint()
        },
        read,
        async press(id) {
            const b = shown.find(x => x.id === id)
            if (!b) return
            void FX.ping(scene, b.x, CARTS.y + CARTS.artDY, C.pulse, { radius: 100, depth: DEPTH.carts + 2 })
            await FX.press(scene, b.box)
        },
        rect(id) {
            const b = shown.find(x => x.id === id) ?? buttons.find(x => x.id === id) ?? buttons[0]
            return { x: b.x, y: CARTS.y, w: CARTS.plateW + 20, h: CARTS.plateH + 20 }
        },
        area() {
            const xs = shown.map(b => b.x)
            const left = Math.min(...xs) - CARTS.plateW / 2 - 14
            const right = Math.max(...xs) + CARTS.plateW / 2 + 14
            const top = CARTS.y - CARTS.plateH / 2 - TAG.h - 10
            const bottom = CARTS.y + CARTS.plateH / 2 + 10
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        destroy() {
            stopHint()
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
