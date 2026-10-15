import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { LOGO_CELL, LOGO_SHEET, cellKey } from '../data/files'
import { DEPTH, ORDER } from '../data/layout'
import { SITES } from '../data/sites'
import { CSS, FONT } from '../data/theme'
import { LABEL } from '../data/words'
import type { Rect, SiteId } from '../types'
import { fitInto } from './art'

export interface Order {
    ask(text: string): Promise<void>
    go(site: SiteId): Promise<void>
    origin(text?: string): Promise<void>
    clear(): void
    bounce(): Promise<void>
    rect(): Rect
    visible(on: boolean): void
    destroy(): void
}

export function createOrder(scene: Phaser.Scene): Order {
    const lead = scene.add
        .text(0, 0, '', { fontFamily: FONT.body, fontSize: '26px', color: CSS.inkSoft })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const logo = scene.add.image(0, 0, LOGO_SHEET.key, cellKey(0))
    const name = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '30px', color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const box = scene.add.container(ORDER.x, ORDER.y, [lead, logo, name]).setDepth(DEPTH.order).setAlpha(0)
    let width = 0
    let shown = true

    const layout = (leadText: string, cell: number | null, nameText: string) => {
        lead.setText(leadText)
        name.setText(nameText).setScale(1)
        logo.setVisible(cell !== null)
        if (cell !== null) fitInto(logo.setFrame(cellKey(cell)), ORDER.logo)
        const parts = [leadText ? lead.width + ORDER.gap : 0, cell !== null ? ORDER.logo + ORDER.gap : 0]
        let total = parts[0] + parts[1] + name.width
        if (total > ORDER.maxW) {
            name.setScale((ORDER.maxW - parts[0] - parts[1]) / name.width)
            total = ORDER.maxW
        }
        const left = -total / 2
        lead.setX(left)
        logo.setX(left + parts[0] + ORDER.logo / 2)
        name.setX(left + parts[0] + parts[1])
        width = total
    }

    const swap = async (leadText: string, cell: number | null, nameText: string) => {
        scene.tweens.killTweensOf(box)
        if (box.alpha > 0) await FX.to(scene, box, { alpha: 0, y: ORDER.y - 8 }, { duration: 180 })
        layout(leadText, cell, nameText)
        box.setY(ORDER.y + 10)
        await FX.to(scene, box, { alpha: shown ? 1 : 0, y: ORDER.y }, { duration: 300, ease: 'Sine.easeOut' })
    }

    return {
        ask: text => swap('', LOGO_CELL.phone, text),
        go: site => swap(LABEL.goTo, SITES[site].logo, SITES[site].name),
        origin: text => swap('', LOGO_CELL.pen, text ?? LABEL.who),
        clear() {
            scene.tweens.killTweensOf(box)
            box.setAlpha(0)
        },
        async bounce() {
            if (!logo.visible) return
            scene.tweens.killTweensOf(logo)
            logo.setY(0)
            await FX.to(scene, logo, { y: -14 }, { duration: 180, yoyo: true, ease: 'Sine.easeOut' })
            logo.setY(0)
        },
        rect: () => ({ x: ORDER.x, y: ORDER.y, w: Math.max(200, width + 40), h: 76 }),
        visible(on) {
            shown = on
            box.setVisible(on)
        },
        destroy() {
            scene.tweens.killTweensOf([box, logo])
            box.destroy()
        },
    }
}
