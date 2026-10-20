import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HEADER, PIT_LANE, W } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'
import { DROP, PUFF, STAR, STREAK } from './art'
import type { Car } from './car'
import type { View } from './view'

export interface Surface {
    wet: boolean
    mud: boolean
    smoking: boolean
}

export interface Effects {
    update(delta: number, car: Car, speed: number, surface: Surface): void
    splash(at: Vec, mud: boolean): void
    smoke(at: Vec, big?: boolean): void
    mudBurst(at: Vec): void
    wind(): void
    dizzy(on: boolean): void
    clear(): void
    destroy(): void
}

export function createEffects(scene: Phaser.Scene, view: View): Effects {
    const live = new Set<Phaser.GameObjects.Image>()
    const streaks = Array.from({ length: 5 }, () => view.world(scene.add.image(0, 0, STREAK).setDepth(DEPTH.fx).setAlpha(0)))
    const stars = Array.from({ length: 3 }, () => view.world(scene.add.image(0, 0, STAR).setDepth(DEPTH.fx + 1).setVisible(false)))
    let sprayAcc = 0
    let smokeAcc = 0
    let t = 0
    let dizzy = false

    const spawn = (key: string, x: number, y: number) => {
        const img = view.world(scene.add.image(x, y, key).setDepth(DEPTH.fx))
        live.add(img)
        return img
    }
    const done = (img: Phaser.GameObjects.Image) => {
        live.delete(img)
        img.destroy()
    }

    const drop = (x: number, y: number, dx: number, dy: number, size: number, ms: number, tone: number) => {
        const img = spawn(DROP, x, y).setTint(tone).setDisplaySize(size, size)
        void FX.arcTo(scene, img, { x: x + dx, y: y + dy }, { height: Math.abs(dy) + 30, duration: ms }).then(() => done(img))
        void FX.to(scene, img, { alpha: 0 }, { duration: ms, delay: ms * 0.4 })
    }

    const effects: Effects = {
        update(delta, car, speed, surface) {
            t += delta
            const fast = Phaser.Math.Clamp((speed - 380) / 400, 0, 1)
            streaks.forEach((s, i) => {
                const phase = ((t * 1.6 + i * 230) % 600) / 600
                s.setPosition(car.x - 160 - phase * 240, car.ground - 22 - i * 24)
                s.setDisplaySize(110 + i * 14, 7).setAlpha(fast * 0.7 * (1 - phase))
            })
            if ((surface.wet || surface.mud) && speed > 160) {
                sprayAcc += delta
                const every = surface.mud ? 38 : 45
                while (sprayAcc > every) {
                    sprayAcc -= every
                    const w = car.wheel(0)
                    const tone = surface.mud ? (Math.random() < 0.5 ? C.mud : C.mudDark) : C.dropLight
                    drop(w.x - 16, car.ground - 6, -Phaser.Math.Between(70, 160), -Phaser.Math.Between(20, 70), Phaser.Math.Between(7, 13), 420, tone)
                }
            } else sprayAcc = 0
            if (surface.smoking && speed > 80) {
                smokeAcc += delta
                while (smokeAcc > 220) {
                    smokeAcc -= 220
                    effects.smoke(car.wheel(Math.random() < 0.5 ? 0 : 1))
                }
            } else smokeAcc = 0
            if (dizzy) {
                const head = car.head()
                stars.forEach((s, i) => {
                    const a = t * 0.006 + (i * Math.PI * 2) / 3
                    s.setPosition(head.x + Math.cos(a) * 46, head.y - 40 + Math.sin(a) * 12).setVisible(true)
                })
            }
        },
        splash(at, mud) {
            for (let i = 0; i < 14; i++) {
                const dir = i % 2 ? -1 : 1
                const tone = mud ? (i % 3 ? C.mud : C.mudDark) : C.dropLight
                drop(at.x, at.y, dir * Phaser.Math.Between(40, 170), -Phaser.Math.Between(40, 120), Phaser.Math.Between(8, 15), 560, tone)
            }
        },
        mudBurst(at) {
            for (let i = 0; i < 4; i++)
                drop(at.x, at.y, -Phaser.Math.Between(40, 180), -Phaser.Math.Between(60, 150), Phaser.Math.Between(10, 18), 620, i % 2 ? C.mud : C.mudDark)
        },
        smoke(at, big = false) {
            const n = big ? 3 : 1
            for (let i = 0; i < n; i++) {
                const img = spawn(PUFF, at.x + Phaser.Math.Between(-14, 14), at.y).setTint(big ? C.smokeDark : C.smoke).setScale(0.3).setAlpha(0.9)
                void FX.to(
                    scene,
                    img,
                    { x: img.x - Phaser.Math.Between(30, 90), y: img.y - Phaser.Math.Between(50, 110), scale: big ? 1.2 : 0.8, alpha: 0 },
                    { duration: 900 + i * 120 },
                ).then(() => done(img))
            }
        },
        wind() {
            for (let i = 0; i < 9; i++) {
                const y = Phaser.Math.Between(HEADER.h + 30, PIT_LANE.top + 160)
                const img = spawn(STREAK, W + Phaser.Math.Between(0, 300), y).setTint(C.white).setDisplaySize(Phaser.Math.Between(120, 220), 6).setAlpha(0.7)
                void FX.to(scene, img, { x: -260, alpha: 0.2 }, { duration: Phaser.Math.Between(520, 820), delay: i * 40 }).then(() => done(img))
            }
        },
        dizzy(on) {
            dizzy = on
            if (!on) stars.forEach(s => s.setVisible(false))
        },
        clear() {
            ;[...live].forEach(img => {
                scene.tweens.killTweensOf(img)
                done(img)
            })
            streaks.forEach(s => s.setAlpha(0))
            effects.dizzy(false)
        },
        destroy() {
            effects.clear()
            streaks.forEach(s => s.destroy())
            stars.forEach(s => s.destroy())
        },
    }
    return effects
}
