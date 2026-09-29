import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, ENDING } from '../data/layout'
import { C, CSS, DIFFERENT_WORD, FONT, SAME_WORD, SIZE } from '../data/theme'
import type { Box } from './box'
import type { Rule } from '../types'
import { createFeatureIcon } from './icons'
import type { TrayView } from './tray'

export interface Sorting {
    show(rule: Rule): Promise<void>
    hide(): Promise<void>
    destroy(): void
}

function createLabel(scene: Phaser.Scene, x: number, y: number, text: string) {
    const label = scene.add
        .text(0, -2, text, { fontFamily: FONT.black, fontSize: `${SIZE.sorting}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const w = label.width + 56
    const h = 66
    const bg = scene.add.graphics()
    bg.fillStyle(C.shadow, 0.25)
    bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
    bg.fillStyle(C.gold, 1)
    bg.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, h / 2 + 4)
    bg.fillStyle(C.cabinet, 1)
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    return scene.add.container(x, y, [bg, label]).setDepth(DEPTH.sorting)
}

export function createSorting(scene: Phaser.Scene, deps: { box: Box; tray: TrayView }): Sorting {
    let parts: Phaser.GameObjects.Container[] = []
    let jumps: Phaser.Tweens.Tween[] = []

    const clear = () => {
        deps.tray.setHop(false)
        jumps.forEach(t => t.remove())
        jumps = []
        parts.forEach(p => p.destroy())
        parts = []
    }

    const hop = (target: Phaser.GameObjects.Container, delay: number) => {
        const baseY = target.y
        jumps.push(
            scene.tweens.add({
                targets: target,
                y: baseY - 14,
                duration: 260,
                delay,
                yoyo: true,
                repeat: -1,
                repeatDelay: 900,
                ease: 'Quad.easeOut',
                onStop: () => target.setY(baseY),
                onRemove: () => target.setY(baseY),
            }),
        )
    }

    return {
        async show(rule) {
            clear()
            const same = createLabel(scene, ENDING.sameX, ENDING.sameY, SAME_WORD)
            parts.push(same)
            void FX.popIn(scene, same)
            deps.box.items().forEach((v, i) => hop(v.container, 200 + i * 90))

            await FX.wait(scene, 500)
            const diff = createLabel(scene, ENDING.diffX, ENDING.diffY, DIFFERENT_WORD)
            parts.push(diff)
            void FX.popIn(scene, diff)

            deps.tray.setSpinning(false)
            deps.tray.setHop(true)
            deps.tray.outside().forEach((spot, i) => {
                const view = deps.tray.view(spot.index)
                if (!view) return
                const tag = scene.add
                    .container(spot.x, spot.y - 78 * view.container.scale, [createFeatureIcon(scene, view, rule, 18)])
                    .setDepth(DEPTH.sorting)
                parts.push(tag)
                void FX.popIn(scene, tag, { delay: 200 + i * 160 })
            })

            await FX.wait(scene, ENDING.holdMs)
        },
        async hide() {
            await FX.to(scene, parts, { alpha: 0 }, { duration: 200 })
            clear()
        },
        destroy: clear,
    }
}
