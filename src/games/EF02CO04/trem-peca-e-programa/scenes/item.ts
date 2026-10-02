import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ITEM_FRAME, ITEMS_SHEET, frameKey } from '../data/files'
import { ITEMS } from '../data/items'
import { DEPTH, FUNNEL, ITEM, PLATE } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { ItemId } from '../types'
import { drawItem } from './art'

export interface ItemView {
    readonly id: ItemId
    readonly container: Phaser.GameObjects.Container
    destroy(): void
}

const UNIT = 150

export function createItemArt(scene: Phaser.Scene, id: ItemId): Phaser.GameObjects.Container {
    const art = scene.add.container(0, 0)
    if (scene.textures.exists(ITEMS_SHEET)) {
        const [, , w, h] = ITEM_FRAME[id]
        art.add(scene.add.image(0, 0, ITEMS_SHEET, frameKey(id)).setScale(UNIT / Math.max(w, h)))
        return art
    }
    const g = scene.add.graphics()
    drawItem(g, id)
    art.add(g)
    return art
}

export function createItem(scene: Phaser.Scene, id: ItemId): ItemView {
    const art = createItemArt(scene, id).setScale(ITEM.size / 150)
    const container = scene.add.container(FUNNEL.x, FUNNEL.mouth, [art]).setDepth(DEPTH.item)
    return {
        id,
        container,
        destroy() {
            scene.tweens.killTweensOf(container)
            container.destroy()
        },
    }
}

export interface Plate {
    show(id: ItemId): void
    hide(): void
    destroy(): void
}

export function createPlate(scene: Phaser.Scene): Plate {
    const bg = scene.add.graphics()
    const text = scene.add
        .text(0, 1, '', { fontFamily: FONT.black, fontSize: `${SIZE.plate}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const plate = scene.add.container(PLATE.x, PLATE.y, [bg, text]).setDepth(DEPTH.plate).setAlpha(0)

    return {
        show(id) {
            text.setText(ITEMS[id].name)
            const w = text.width + PLATE.pad * 2
            bg.clear()
            bg.fillStyle(C.shadow, 0.16)
            bg.fillRoundedRect(-w / 2 + 3, -PLATE.h / 2 + 5, w, PLATE.h, PLATE.h / 2)
            bg.fillStyle(C.cream, 1)
            bg.fillRoundedRect(-w / 2, -PLATE.h / 2, w, PLATE.h, PLATE.h / 2)
            bg.lineStyle(4, C.ink, 1)
            bg.strokeRoundedRect(-w / 2, -PLATE.h / 2, w, PLATE.h, PLATE.h / 2)
            scene.tweens.killTweensOf(plate)
            plate.setAlpha(0).setScale(0.7)
            void FX.to(scene, plate, { alpha: 1, scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        hide() {
            scene.tweens.killTweensOf(plate)
            void FX.to(scene, plate, { alpha: 0 }, { duration: 140 })
        },
        destroy() {
            scene.tweens.killTweensOf(plate)
            plate.destroy()
        },
    }
}
