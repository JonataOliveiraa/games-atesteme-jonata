import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAR, PART, TRACK_SHEET, TRAIN_SHEET } from '../data/files'
import { DEPTH, SHADOW, TRAIN } from '../data/layout'
import type { Train } from '../types'
import { fit, shadowOf } from './art'
import type { Route } from './rails'

type Point = { x: number; y: number }

export interface TrainCar {
    /** a distância da frente da locomotiva ao longo da rota */
    readonly s: number
    place(route: Route, s: number): void
    run(route: Route, to: number, ease?: string): Promise<void>
    /** o caixote do vagão, na tela */
    crate(): Point
    shake(): Promise<void>
    /** a locomotiva, para a câmera seguir */
    head(): Phaser.GameObjects.Image
    fade(ms: number): Promise<void>
    destroy(): void
}

const STEAM_MS = 260

export function createTrain(scene: Phaser.Scene, train: Train, speed: number = TRAIN.speed): TrainCar {
    const loco = fit(scene, TRAIN_SHEET, CAR.loco + (train.color % CAR.colors), TRAIN.loco).setDepth(DEPTH.train)
    const wagon = fit(scene, TRAIN_SHEET, CAR.wagon, TRAIN.wagon).setDepth(DEPTH.train)
    const box = fit(scene, TRAIN_SHEET, CAR.crate + (train.crate % CAR.crates), TRAIN.crate).setDepth(DEPTH.train + 0.5)
    const shadows = [loco, wagon].map(part => ({ part, shadow: shadowOf(scene, part).setDepth(DEPTH.shadow) }))
    let s = 0
    let route: Route | undefined
    let steamAt = 0

    const pose = () => {
        if (!route) return
        const front = route.at(s - TRAIN.loco / 2)
        loco.setPosition(front.x, front.y).setRotation(front.angle)
        const back = route.at(s - TRAIN.loco - TRAIN.gap - TRAIN.wagon / 2)
        wagon.setPosition(back.x, back.y).setRotation(back.angle)
        box.setPosition(back.x, back.y).setRotation(back.angle)
        shadows.forEach(({ part, shadow }) => shadow.setPosition(part.x + SHADOW.x, part.y + SHADOW.y).setRotation(part.rotation))
    }

    const steam = () => {
        if (!route) return
        const chimney = route.at(s - TRAIN.loco * 0.22)
        const puff = fit(scene, TRACK_SHEET, PART.steam, 46)
            .setPosition(chimney.x, chimney.y - 10)
            .setDepth(DEPTH.train + 1)
            .setAlpha(0.9)
        void FX.to(scene, puff, { alpha: 0, scale: puff.scale * 1.7, y: puff.y - 34 }, { duration: 760 }).then(() => puff.destroy())
    }

    return {
        get s() {
            return s
        },
        place(r, to) {
            route = r
            s = to
            pose()
        },
        run(r, to, ease = 'Sine.easeInOut') {
            route = r
            const from = s
            const proxy = { s: from }
            steamAt = 0
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: proxy,
                    s: to,
                    duration: FX.ms(scene, (Math.abs(to - from) / speed) * 1000),
                    ease,
                    onUpdate: (tween: Phaser.Tweens.Tween) => {
                        if (!loco.active) return
                        s = proxy.s
                        pose()
                        const elapsed = tween.elapsed
                        if (elapsed - steamAt > STEAM_MS) {
                            steamAt = elapsed
                            steam()
                        }
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
        },
        crate() {
            return { x: box.x, y: box.y }
        },
        async shake() {
            await FX.shake(scene, loco, { amount: 6, times: 3 })
        },
        head() {
            return loco
        },
        async fade(ms) {
            const ground = shadows.map(s => s.shadow)
            await FX.all(FX.to(scene, [loco, wagon, box], { alpha: 0 }, { duration: ms }), FX.to(scene, ground, { alpha: 0 }, { duration: ms }))
        },
        destroy() {
            const ground = shadows.map(s => s.shadow)
            scene.tweens.killTweensOf([loco, wagon, box, ...ground])
            ground.forEach(shadow => shadow.destroy())
            loco.destroy()
            wagon.destroy()
            box.destroy()
        },
    }
}
