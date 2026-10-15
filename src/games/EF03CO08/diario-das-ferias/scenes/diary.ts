import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL } from '../data/files'
import { DEPTH, DIARY } from '../data/layout'
import { C } from '../data/theme'
import type { Page } from '../types'
import { uiImage } from './art'
import type { Rect } from './guide'

/** As páginas do diário, no meio do cabeçalho: o objetivo do nível. */
export interface Diary {
    slot(i: number): { x: number; y: number }
    fill(i: number, page: Page): void
    rect(): Rect
    show(on: boolean): void
    destroy(): void
}

export function createDiary(scene: Phaser.Scene, count: number): Diary {
    const xOf = (i: number) => DIARY.x + (i - (count - 1) / 2) * DIARY.gap
    const left = xOf(0) - DIARY.w / 2 - 18
    const width = (count - 1) * DIARY.gap + DIARY.w + 36
    const height = DIARY.h + 20

    const back = scene.add.graphics().setDepth(DEPTH.hud)
    back.fillStyle(C.shadow, 0.14)
    back.fillRoundedRect(left + 3, DIARY.y - height / 2 + 5, width, height, 18)
    back.fillStyle(C.coral, 1)
    back.fillRoundedRect(left, DIARY.y - height / 2, width, height, 18)
    back.lineStyle(3, C.ink, 1)
    back.strokeRoundedRect(left, DIARY.y - height / 2, width, height, 18)

    const slots = scene.add.graphics().setDepth(DEPTH.hud + 1)
    const content: Phaser.GameObjects.GameObject[] = []
    const filled = new Set<number>()

    const paint = () => {
        slots.clear()
        for (let i = 0; i < count; i++) {
            const x = xOf(i) - DIARY.w / 2
            const y = DIARY.y - DIARY.h / 2
            slots.fillStyle(filled.has(i) ? C.white : C.cream, 1)
            slots.fillRoundedRect(x, y, DIARY.w, DIARY.h, 8)
            slots.lineStyle(3, filled.has(i) ? C.ink : C.creamDark, 1)
            slots.strokeRoundedRect(x, y, DIARY.w, DIARY.h, 8)
        }
    }
    paint()

    const objects = () => [back, slots, ...content] as Array<Phaser.GameObjects.GameObject & { setAlpha(v: number): unknown }>

    return {
        slot: i => ({ x: xOf(i), y: DIARY.y }),
        fill(i, page) {
            filled.add(i)
            paint()
            const x = xOf(i)
            if (page.tool === 'photo') {
                const img = scene.add.image(x, DIARY.y, page.key).setDepth(DEPTH.hud + 2)
                img.setScale(Math.min((DIARY.w - 10) / img.width, (DIARY.h - 10) / img.height))
                content.push(img)
            } else {
                const icon = uiImage(scene, UI_CELL.sound, 34).setPosition(x - 16, DIARY.y).setDepth(DEPTH.hud + 2)
                const bars = scene.add.graphics().setDepth(DEPTH.hud + 2)
                ;[14, 26, 18, 30].forEach((h, b) => {
                    bars.fillStyle(C.mintDark, 1)
                    bars.fillRoundedRect(x + 4 + b * 7, DIARY.y - h / 2, 4, h, 2)
                })
                content.push(icon, bars)
            }
            void FX.ping(scene, x, DIARY.y, C.yes, { radius: 50, duration: 460, depth: DEPTH.hud + 3 })
        },
        rect: () => ({ x: DIARY.x, y: DIARY.y, w: width + 16, h: height + 16 }),
        show(on) {
            objects().forEach(o => o.setAlpha(on ? 1 : 0))
        },
        destroy() {
            content.forEach(o => o.destroy())
            slots.destroy()
            back.destroy()
        },
    }
}
