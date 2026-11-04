import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DISH_FRAMES, DISH_SHEETS, cellKey } from '../data/files'
import { CLIENT, DEPTH, DISH } from '../data/layout'
import { TIMING } from '../data/timing'
import type { DishId, Vec } from '../types'

export interface Dish {
    show(dish: DishId, frame: string): void
    set(frame: string): void
    swap(frame: string): Promise<void>
    mouth(): Vec
    hover(): Vec
    fill(frame: string, level: number): void
    readonly image: Phaser.GameObjects.Image
    rattle(ms: number, walk?: number, onMove?: (dx: number) => void): Promise<void>
    serve(): Promise<void>
    eaten(): Promise<void>
    hide(): void
    destroy(): void
}

export function createDish(scene: Phaser.Scene, onPuff: (x: number, y: number) => void): Dish {
    const image = scene.add.image(DISH.x, DISH.y, DISH_SHEETS.cereal.key, cellKey(0)).setOrigin(0.5, 1).setDepth(DEPTH.dish).setVisible(false)
    const rising = scene.add.image(DISH.x, DISH.y, DISH_SHEETS.cereal.key, cellKey(0)).setOrigin(0.5, 1).setDepth(DEPTH.dish).setVisible(false)
    let current: DishId = 'cereal'
    let currentFrame = ''
    let risingFrame = ''

    const frameScale = () => DISH.size / image.frame.height
    const clearFill = () => {
        risingFrame = ''
        rising.setVisible(false)
    }
    const home = () => {
        scene.tweens.killTweensOf(image)
        image.setPosition(DISH.x, DISH.y).setAngle(0).setAlpha(1)
        image.setScale(frameScale())
        clearFill()
    }

    const dish: Dish = {
        image,
        show(id, frame) {
            current = id
            currentFrame = frame
            image.setTexture(DISH_SHEETS[id].key, cellKey(DISH_FRAMES[id][frame]))
            home()
            image.setVisible(true)
        },
        set(frame) {
            currentFrame = frame
            image.setFrame(cellKey(DISH_FRAMES[current][frame]))
            home()
        },
        async swap(frame) {
            const at = dish.mouth()
            onPuff(at.x, at.y + 30)
            clearFill()
            currentFrame = frame
            image.setFrame(cellKey(DISH_FRAMES[current][frame]))
            image.setScale(frameScale())
            await FX.impact(scene, image, 0.1)
        },
        mouth: () => ({ x: DISH.x, y: DISH.y - (1 - (DISH.stack[currentFrame] ?? DISH.mouth[current]) / 320) * DISH.size }),
        hover: () => {
            const at = dish.mouth()
            const off = DISH.hover[current]
            return { x: at.x + off.x, y: at.y + off.y }
        },
        fill(frame, level) {
            const def = (DISH.fill as Record<string, { mode: 'fade' | 'wipe' | 'rise' | 'drip'; from: number; to: number }>)[frame]
            if (!def) return
            if (risingFrame !== frame) {
                risingFrame = frame
                rising.setTexture(DISH_SHEETS[current].key, cellKey(DISH_FRAMES[current][frame]))
                rising.setPosition(image.x, image.y).setScale(image.scale).setAlpha(1).setVisible(true)
            }
            const w = rising.frame.width
            const h = rising.frame.height
            const at = def.from + (def.to - def.from) * level
            if (def.mode === 'fade') rising.setAlpha(level)
            else if (def.mode === 'wipe') rising.setCrop(0, 0, w * at, h)
            else if (def.mode === 'drip') rising.setCrop(0, 0, w, h * at)
            else rising.setCrop(0, h * at, w, h * (1 - at))
        },
        async rattle(ms, walk = 0, onMove) {
            const count = Math.max(2, Math.round(ms / 70))
            const from = image.x
            for (let i = 0; i < count; i++) {
                const t = (i + 1) / count
                const away = walk * Math.sin(t * Math.PI) + (i % 2 ? 4 : -4)
                image.setAngle(i % 2 ? 2.5 : -2.5)
                image.setX(from + away)
                onMove?.(away)
                await FX.wait(scene, 70)
            }
            image.setAngle(0).setX(from)
            onMove?.(0)
        },
        async serve() {
            const base = image.scale
            await FX.arcTo(scene, image, { x: CLIENT.serveX, y: CLIENT.serveY }, { height: 50, duration: TIMING.serve })
            image.setScale(base * 0.86)
        },
        async eaten() {
            await FX.to(scene, image, { alpha: 0, scale: image.scale * 0.5 }, { duration: 300 })
            image.setVisible(false)
        },
        hide() {
            scene.tweens.killTweensOf(image)
            image.setVisible(false)
            clearFill()
        },
        destroy() {
            scene.tweens.killTweensOf(image)
            image.destroy()
            rising.destroy()
        },
    }
    return dish
}
