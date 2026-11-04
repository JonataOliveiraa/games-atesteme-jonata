import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLIENT_SHEET, DISH_FRAMES, DISH_SHEETS, cellKey, clientCell } from '../data/files'
import { CLIENT, PARADE, THOUGHT } from '../data/layout'
import { TIMING } from '../data/timing'
import type { AnimalId, DishId, Pose, Rect, Vec } from '../types'
import { THOUGHT_CLOUD } from './art'

export interface Client {
    enter(animal: AnimalId): Promise<void>
    think(dish: DishId, goal: string): Promise<void>
    hideThought(): Promise<void>
    pose(pose: Pose): void
    hop(): Promise<void>
    shake(): Promise<void>
    chew(): Promise<void>
    leave(): Promise<void>
    parade(animals: AnimalId[]): Promise<void>
    head(): Vec
    rect(): Rect
    thoughtRect(): Rect
    destroy(): void
}

export function createClient(scene: Phaser.Scene, parent: Phaser.GameObjects.Container): Client {
    const scaleFor = (image: Phaser.GameObjects.Image) => CLIENT.h / image.frame.height
    const body = scene.add.image(CLIENT.enterX, CLIENT.y, CLIENT_SHEET.key, cellKey(0)).setOrigin(0.5, 1)
    body.setScale(scaleFor(body)).setVisible(false)
    const cloud = scene.add.image(THOUGHT.x, THOUGHT.y, THOUGHT_CLOUD).setVisible(false)
    const goal = scene.add.image(THOUGHT.x + THOUGHT.goalDX, THOUGHT.y + THOUGHT.goalDY, DISH_SHEETS.cereal.key, cellKey(0)).setVisible(false)
    parent.add([body, cloud, goal])
    let current: AnimalId = 'cat'
    let party: Phaser.GameObjects.Image[] = []

    const hopTo = async (x: number) => {
        await FX.all(
            FX.to(scene, body, { x }, { duration: TIMING.enterHop, ease: 'Linear' }),
            FX.to(scene, body, { y: CLIENT.y - CLIENT.hop }, { duration: TIMING.enterHop / 2, yoyo: true, ease: 'Sine.easeOut' }),
        )
    }

    const client: Client = {
        async enter(animal) {
            current = animal
            client.pose('wait')
            body.setPosition(CLIENT.enterX, CLIENT.y).setVisible(true)
            const hops = 3
            for (let i = 1; i <= hops; i++) await hopTo(CLIENT.enterX + ((CLIENT.x - CLIENT.enterX) * i) / hops)
        },
        async think(dish, frame) {
            goal.setTexture(DISH_SHEETS[dish].key, cellKey(DISH_FRAMES[dish][frame]))
            const view = THOUGHT.goal[dish]
            goal.setOrigin(0.5, view.focus).setScale(view.size / goal.frame.height)
            cloud.setVisible(true).setAlpha(1).setScale(1)
            goal.setVisible(true).setAlpha(1)
            await FX.all(FX.popIn(scene, cloud, { from: 0.4, duration: 340 }), FX.popIn(scene, goal, { from: 0.4, duration: 340 }))
        },
        async hideThought() {
            await FX.to(scene, [cloud, goal], { alpha: 0 }, { duration: 200 })
            cloud.setVisible(false)
            goal.setVisible(false)
        },
        pose(pose) {
            body.setFrame(cellKey(clientCell(current, pose)))
        },
        async hop() {
            await FX.to(scene, body, { y: CLIENT.y - CLIENT.hop }, { duration: 140, yoyo: true, ease: 'Sine.easeOut' })
            body.setY(CLIENT.y)
        },
        async shake() {
            await FX.shake(scene, body, { amount: 10, times: 4 })
        },
        async chew() {
            await FX.to(scene, body, { scaleY: body.scaleY * 0.95, scaleX: body.scaleX * 1.04 }, { duration: TIMING.chew / 2, yoyo: true, ease: 'Sine.easeInOut' })
        },
        async leave() {
            client.pose('wait')
            const hops = 3
            const from = body.x
            for (let i = 1; i <= hops; i++) await hopTo(from + ((CLIENT.enterX - from) * i) / hops)
            body.setVisible(false)
        },
        async parade(animals) {
            party = animals.map((animal, i) => {
                const image = scene.add
                    .image(PARADE.xs[i], PARADE.y + CLIENT.h, CLIENT_SHEET.key, cellKey(clientCell(animal, 'eat')))
                    .setOrigin(0.5, 1)
                image.setScale(scaleFor(image))
                parent.add(image)
                return image
            })
            await FX.all(
                ...party.map((image, i) =>
                    FX.to(scene, image, { y: PARADE.y }, { duration: 420, delay: i * 120, ease: 'Cubic.easeOut' }).then(() => {
                        scene.tweens.add({ targets: image, y: PARADE.y - CLIENT.hop, duration: 260, yoyo: true, repeat: -1, delay: i * 90, ease: 'Sine.easeOut' })
                    }),
                ),
            )
        },
        head: () => ({ x: CLIENT.x, y: CLIENT.headY }),
        rect: () => ({ x: CLIENT.x, y: CLIENT.y - CLIENT.h / 2 - 40, w: 300, h: CLIENT.h - 60 }),
        thoughtRect: () => ({ x: THOUGHT.x, y: THOUGHT.y, w: cloud.width + 10, h: cloud.height + 10 }),
        destroy() {
            party.forEach(image => {
                scene.tweens.killTweensOf(image)
                image.destroy()
            })
            party = []
            FX.kill(scene, [body, cloud, goal])
            body.destroy()
            cloud.destroy()
            goal.destroy()
        },
    }
    return client
}
