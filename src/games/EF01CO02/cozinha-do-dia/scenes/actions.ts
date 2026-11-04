import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLIENT, COUNTER, DISH } from '../data/layout'
import { ACTION_OF, LEAVES_BENCH } from '../data/levels'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Mess as MessDef, ObjectId, Vec } from '../types'
import type { Audio } from './audio'
import type { Bench } from './bench'
import type { Dish } from './dish'
import type { Mess } from './mess'

interface Parts {
    bench: Bench
    dish: Dish
    mess: Mess
    audio: Audio
}

const MATERIAL: Partial<Record<ObjectId, { color: number; size: number }>> = {
    cereal: { color: C.cereal, size: 22 },
    milk: { color: C.milk, size: 18 },
    ketchup: { color: C.ketchup, size: 18 },
    banana: { color: C.banana, size: 22 },
    syrup: { color: C.syrup, size: 18 },
    cream: { color: C.cream2, size: 18 },
}

export interface Actions {
    place(id: ObjectId, frame: string): Promise<void>
    autoPour(id: ObjectId, frame: string): Promise<void>
    press(frame: string): Promise<void>
    fail(id: ObjectId, def: MessDef): Promise<void>
    undo(): void
    destroy(): void
}

export function createActions(scene: Phaser.Scene, { bench, dish, mess, audio }: Parts): Actions {
    let tool: Phaser.GameObjects.Image | null = null
    const extras: Phaser.GameObjects.Image[] = []

    const hover = (): Vec => dish.hover()

    const shiftButton = (dx: number) => bench.shift('button', dx)

    const nozzle = (): Vec => {
        const at = hover()
        return { x: at.x + DISH.nozzleDX, y: at.y + DISH.nozzleDY }
    }

    const liftTool = async (id: ObjectId) => {
        tool = bench.take(id, true)
        const to = hover()
        audio.whoosh()
        await FX.arcTo(scene, tool, to, { height: 70, duration: TIMING.fly })
        await FX.to(scene, tool, { angle: DISH.hoverTilt }, { duration: 170, ease: 'Back.easeOut' })
    }

    const pourOnce = async (id: ObjectId, count = 7) => {
        const material = MATERIAL[id]
        if (!tool || !material) return
        const base = tool.angle
        audio.pour(id)
        void FX.to(scene, tool, { angle: base - 10 }, { duration: 110, yoyo: true })
        await mess.stream(nozzle(), dish.mouth(), material.color, count, material.size)
        tool?.setAngle(base)
    }

    const arcCopy = async (id: ObjectId, to: Vec, hide: boolean) => {
        const copy = bench.take(id, hide)
        extras.push(copy)
        audio.whoosh()
        await FX.arcTo(scene, copy, to, { height: 110, duration: TIMING.fly })
        return copy
    }

    const dropFromAbove = async (id: ObjectId, to: Vec) => {
        const copy = bench.take(id, false)
        extras.push(copy)
        audio.whoosh()
        await FX.arcTo(scene, copy, { x: to.x, y: to.y - 30 }, { height: 120, duration: TIMING.fly })
        return copy
    }

    const fallOff = async (image: Phaser.GameObjects.Image) => {
        await FX.to(scene, image, { y: image.y - 60, x: image.x + 90, angle: 90 }, { duration: 200, ease: 'Sine.easeOut' })
        await FX.to(scene, image, { y: COUNTER.top + 56, x: image.x + 220, angle: 240 }, { duration: 380, ease: 'Bounce.easeOut' })
        await FX.to(scene, image, { x: 1400, angle: 900 }, { duration: 760, ease: 'Sine.easeIn' })
    }

    const puddles = (color: number) => {
        mess.splat(DISH.x - 170, COUNTER.top + 40, color, 0.8)
        mess.splat(DISH.x + 180, COUNTER.top + 50, color, 0.6)
        mess.splat(DISH.x - 40, COUNTER.top + 78, color, 0.5)
    }

    const faceSplats = (): Vec[] => [
        { x: CLIENT.x - 40, y: CLIENT.headY - 20 },
        { x: CLIENT.x + 50, y: CLIENT.headY + 20 },
        { x: CLIENT.x + 10, y: CLIENT.headY - 70 },
    ]

    const bigBurst = (): Vec[] => {
        const spots: Vec[] = [...faceSplats()]
        for (let i = 0; i < 18; i++) spots.push({ x: Phaser.Math.Between(60, 1220), y: Phaser.Math.Between(100, 360) })
        return spots
    }

    const actions: Actions = {
        async place(id, frame) {
            const leaves = LEAVES_BENCH.includes(id)
            const copy = bench.take(id, leaves)
            if (leaves) bench.remove(id)
            audio.whoosh()
            await FX.arcTo(scene, copy, dish.mouth(), { height: 110, duration: TIMING.fly })
            copy.destroy()
            audio.place()
            await dish.swap(frame)
        },
        async autoPour(id, frame) {
            await liftTool(id)
            await pourOnce(id, 10)
            await pourOnce(id, 10)
            audio.place()
            await dish.swap(frame)
            if (tool) {
                const flying = tool
                tool = null
                await FX.to(scene, flying, { angle: 0 }, { duration: 120 })
                await FX.arcTo(scene, flying, bench.pos(id), { height: 50, duration: 340 })
                flying.destroy()
            }
            bench.show(id)
        },
        async press(frame) {
            audio.button()
            void bench.press('button')
            await FX.wait(scene, 160)
            dish.set('jar-blend')
            audio.blend(TIMING.blend)
            await dish.rattle(TIMING.blend, 0, shiftButton)
            bench.remove('button')
            audio.place()
            await dish.swap(frame)
        },
        async fail(id, def) {
            const material = MATERIAL[id]
            const mouth = dish.mouth()
            switch (def.kind) {
                case 'slip': {
                    const copy = await arcCopy(id, { x: mouth.x, y: mouth.y - 30 }, false)
                    audio.boing()
                    await fallOff(copy)
                    break
                }
                case 'puddle':
                    if (material) {
                        await liftTool(id)
                        await pourOnce(id, 10)
                        audio.splat()
                        puddles(material.color)
                    }
                    break
                case 'scatter':
                    if (id === 'sausage') {
                        const copy = await arcCopy(id, { x: DISH.x, y: DISH.y - 50 }, false)
                        audio.place()
                        await fallOff(copy)
                    } else if (material) {
                        await liftTool(id)
                        await pourOnce(id, 10)
                        dish.set(def.frame)
                        audio.splat()
                        await mess.roll({ x: DISH.x, y: DISH.y - 40 }, material.color, 9, material.size)
                    }
                    break
                case 'spill':
                    if (material) {
                        await liftTool(id)
                        await pourOnce(id, 10)
                        audio.splat()
                        await dish.swap(def.frame)
                        puddles(material.color)
                    }
                    break
                case 'splash':
                    if (material) {
                        await liftTool(id)
                        await pourOnce(id, 10)
                        await dish.swap(def.frame)
                        const fallen = def.item ? MATERIAL[def.item] : undefined
                        if (def.item && fallen && ACTION_OF[def.item] === 'pour') {
                            await mess.stream({ x: mouth.x, y: mouth.y - 170 }, mouth, fallen.color, 8, fallen.size)
                        } else if (def.item) {
                            void fallOff(await dropFromAbove(def.item, mouth))
                        }
                        audio.splat()
                        await mess.spray(mouth, [...faceSplats(), { x: DISH.x - 150, y: COUNTER.top + 40 }], material.color, 22)
                    }
                    break
                case 'overflow':
                    if (id === 'sausage') {
                        const copy = await arcCopy(id, { x: DISH.x, y: DISH.y - 120 }, false)
                        await dish.swap(def.frame)
                        audio.place()
                        await fallOff(copy)
                    } else if (id === 'banana') {
                        const copy = await arcCopy(id, { x: mouth.x, y: mouth.y - 30 }, false)
                        audio.boing()
                        dish.set(def.frame)
                        await fallOff(copy)
                    } else if (material) {
                        await liftTool(id)
                        await pourOnce(id, 12)
                        audio.splat()
                        await dish.swap(def.frame)
                        if (id === 'cereal') await mess.roll({ x: DISH.x, y: DISH.y - 120 }, material.color, 10, material.size)
                        else puddles(material.color)
                    }
                    break
                case 'bounce': {
                    if (id === 'lid') {
                        const copy = await arcCopy(id, mouth, true)
                        copy.setVisible(false)
                        audio.place()
                        await dish.swap(def.frame)
                    }
                    const item = id === 'lid' ? def.item : id
                    const itemMaterial = item ? MATERIAL[item] : undefined
                    if (item === 'milk' && itemMaterial) {
                        await liftTool(item)
                        await pourOnce(item, 10)
                        audio.boing()
                        await mess.spray(
                            mouth,
                            [
                                { x: DISH.x - 170, y: COUNTER.top + 40 },
                                { x: DISH.x + 190, y: COUNTER.top + 44 },
                                { x: DISH.x - 90, y: COUNTER.top + 70 },
                                { x: DISH.x + 90, y: COUNTER.top + 80 },
                            ],
                            itemMaterial.color,
                            20,
                        )
                    } else if (item) {
                        const copy = await arcCopy(item, { x: mouth.x, y: mouth.y - 30 }, false)
                        audio.boing()
                        await fallOff(copy)
                    }
                    break
                }
                case 'rattle':
                    audio.button()
                    void bench.press('button')
                    await FX.wait(scene, 160)
                    audio.blend(1300)
                    await dish.rattle(1300, 150, shiftButton)
                    break
                case 'burst': {
                    audio.button()
                    void bench.press('button')
                    await FX.wait(scene, 160)
                    audio.blend(600)
                    await dish.rattle(600, 0, shiftButton)
                    audio.splat()
                    FX.shakeCam(scene, 'medio')
                    dish.set(def.frame)
                    await mess.spray(mouth, bigBurst(), C.smoothie, 24)
                    break
                }
            }
        },
        undo() {
            mess.clear()
            extras.splice(0).forEach(image => {
                FX.kill(scene, image)
                image.destroy()
            })
            if (tool) {
                FX.kill(scene, tool)
                tool.destroy()
                tool = null
            }
            bench.restore()
        },
        destroy() {
            actions.undo()
        },
    }
    return actions
}
