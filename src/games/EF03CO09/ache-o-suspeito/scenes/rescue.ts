import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DATA_BOX, dataFrame, DATA_SHEET, fitInside, originOf, SHEET } from '../data/art'
import { DEPTH, HUD } from '../data/layout'
import { C } from '../data/theme'
import type { DataKind } from '../types'
import type { Point } from './arc'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O DADO VOLTA PARA VOCÊ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Substituiu as cópias transparentes que viajavam até um ícone de
 * desconhecidos. Aquela animação mostrava o que NÃO aconteceu — pedia que a
 * criança lesse cópias saindo como se fossem um aviso, logo depois de ela ter
 * IMPEDIDO a saída. Aqui o pictograma escapa da placa derrubada e volta para o
 * avatar no canto: o dado que ia embora continua sendo seu.
 */

export function createRescue(scene: Phaser.Scene) {
    const glow = scene.add.graphics().setDepth(DEPTH.rescue).setAlpha(0)
    let piece: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null = null

    const clear = () => {
        if (piece) {
            scene.tweens.killTweensOf(piece)
            piece.destroy()
            piece = null
        }
        scene.tweens.killTweensOf(glow)
        glow.clear()
        glow.setAlpha(0)
    }

    const make = (kind: DataKind, size: number) => {
        if (!scene.textures.exists(SHEET.data)) {
            const g = scene.add.graphics().setDepth(DEPTH.rescue)
            g.fillStyle(C.blue, 1)
            g.fillRoundedRect(-size / 2, -size / 2, size, size, 12)
            return g
        }
        const frame = dataFrame(kind)
        const box = DATA_BOX[frame]
        const image = scene.add.image(0, 0, SHEET.data, frame).setDepth(DEPTH.rescue)
        const origin = originOf(box, DATA_SHEET.frameWidth, DATA_SHEET.frameHeight)
        image.setOrigin(origin.x, origin.y)
        image.setScale(fitInside(box, size, size))
        return image
    }

    return {
        async play(from: Point, kind: DataKind, onArrive?: () => void) {
            clear()
            const item = make(kind, 86)
            piece = item
            const base = item.scale
            item.setPosition(from.x, from.y).setAlpha(0).setScale(base * 0.5)

            glow.clear()
            glow.fillStyle(C.green, 0.3)
            glow.fillCircle(0, 0, 62)
            glow.setPosition(from.x, from.y).setAlpha(0).setScale(0.4)

            await FX.all(
                FX.to(scene, item, { alpha: 1, scale: base, y: from.y - 74 }, { duration: 420, ease: 'Back.easeOut' }),
                FX.to(scene, glow as unknown as Phaser.GameObjects.Container, { alpha: 1, scale: 1 }, { duration: 420 }),
            )
            if (!item.active) return

            void FX.to(scene, glow as unknown as Phaser.GameObjects.Container, { alpha: 0 }, { duration: 300 })
            await FX.wait(scene, 200)
            if (!item.active) return

            await FX.all(
                FX.arcTo(scene, item, { x: HUD.avatarX, y: HUD.cy }, { height: 150, duration: 660 }),
                FX.to(scene, item, { scale: base * 0.28, angle: 360 }, { duration: 660 }),
            )
            if (!item.active) return

            onArrive?.()
            void FX.ping(scene, HUD.avatarX, HUD.cy, C.green, { radius: 46, depth: DEPTH.hud + 2 })
            await FX.to(scene, item, { alpha: 0, scale: base * 0.1 }, { duration: 200 })
            clear()
        },

        clear,

        destroy() {
            clear()
            glow.destroy()
        },
    }
}

export type Rescue = ReturnType<typeof createRescue>
