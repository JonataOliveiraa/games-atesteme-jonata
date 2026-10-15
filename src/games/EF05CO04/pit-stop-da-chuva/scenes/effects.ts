import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'
import { DROP, PUFF, STAR, STREAK } from './art'
import type { Kart } from './kart'
import type { View } from './view'

export interface Effects {
    update(delta: number, kart: Kart, speed: number, wet: boolean): void
    splash(at: Vec): void
    smoke(at: Vec, big?: boolean): void
    dizzy(on: boolean): void
    clear(): void
    destroy(): void
}

export function createEffects(scene: Phaser.Scene, view: View): Effects {
    const live = new Set<Phaser.GameObjects.Image>()
    const streaks = Array.from({ length: 5 }, () => view.world(scene.add.image(0, 0, STREAK).setDepth(DEPTH.fx).setAlpha(0)))
    const stars = Array.from({ length: 3 }, () => view.world(scene.add.image(0, 0, STAR).setDepth(DEPTH.fx + 1).setVisible(false)))
    let sprayAcc = 0
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

    const drop = (x: number, y: number, dx: number, dy: number, size: number, ms: number) => {
        const img = spawn(DROP, x, y).setTint(C.dropLight).setDisplaySize(size, size)
        void FX.arcTo(scene, img, { x: x + dx, y: y + dy }, { height: Math.abs(dy) + 30, duration: ms }).then(() => done(img))
        void FX.to(scene, img, { alpha: 0 }, { duration: ms, delay: ms * 0.4 })
    }

    const effects: Effects = {
        update(delta, kart, speed, isWet) {
            t += delta
            const fast = Phaser.Math.Clamp((speed - 500) / 900, 0, 1)
            streaks.forEach((s, i) => {
                const phase = ((t * 1.6 + i * 230) % 600) / 600
                s.setPosition(kart.x - 180 - phase * 260, kart.ground - 26 - i * 28)
                s.setDisplaySize(120 + i * 14, 7).setAlpha(fast * 0.75 * (1 - phase))
            })
            if (isWet && speed > 250) {
                sprayAcc += delta
                while (sprayAcc > 45) {
                    sprayAcc -= 45
                    const w = kart.wheel(0)
                    drop(w.x - 20, kart.ground - 6, -Phaser.Math.Between(70, 150), -Phaser.Math.Between(20, 60), Phaser.Math.Between(7, 12), 420)
                }
            } else sprayAcc = 0
            if (dizzy) {
                const head = kart.head()
                stars.forEach((s, i) => {
                    const a = t * 0.006 + (i * Math.PI * 2) / 3
                    s.setPosition(head.x + Math.cos(a) * 46, head.y - 46 + Math.sin(a) * 12).setVisible(true)
                })
            }
        },
        splash(at) {
            for (let i = 0; i < 14; i++) {
                const dir = i % 2 ? -1 : 1
                drop(at.x, at.y, dir * Phaser.Math.Between(40, 170), -Phaser.Math.Between(40, 120), Phaser.Math.Between(8, 15), 560)
            }
        },
        smoke(at, big = false) {
            const n = big ? 3 : 1
            for (let i = 0; i < n; i++) {
                const img = spawn(PUFF, at.x + Phaser.Math.Between(-14, 14), at.y).setTint(big ? C.smokeDark : C.smoke).setScale(0.35).setAlpha(0.9)
                void FX.to(
                    scene,
                    img,
                    { x: img.x - Phaser.Math.Between(20, 70), y: img.y - Phaser.Math.Between(60, 120), scale: big ? 1.3 : 0.9, alpha: 0 },
                    { duration: 900 + i * 120 },
                ).then(() => done(img))
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
