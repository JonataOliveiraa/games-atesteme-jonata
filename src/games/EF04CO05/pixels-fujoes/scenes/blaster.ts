import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CODER, CODER_SHEET, artScale, cellKey } from '../data/files'
import { glyphKey } from '../data/glyphs'
import { BLASTER, DEPTH, H, SHOT, W } from '../data/layout'
import { C } from '../data/theme'
import type { Bit } from '../types'
import type { Rect } from './guide'

type Point = { x: number; y: number }

/**
 * O codificador, a "mão" da primeira pessoa, colado no pé da tela. Ele balança com a mira, e cada
 * número sai dele num raio que leva o próprio número até o ponto mirado. O visor mostra o último número.
 */
export interface Blaster {
    setShown(on: boolean): Promise<void>
    update(dt: number, aimX: number, aimY: number): void
    /** resolve quando o raio chega (o alvo é seguido durante o voo) */
    fire(value: Bit, to: () => Point): Promise<void>
    rect(): Rect
    destroy(): void
}

export function createBlaster(scene: Phaser.Scene): Blaster {
    const k = artScale(scene.textures, CODER_SHEET)
    const px = BLASTER.scale
    const body = scene.add.image(0, 0, CODER_SHEET.key, cellKey(CODER.idle)).setOrigin(0.5, 1).setScale(px / k)
    const screen = BLASTER.screen
    const screenX = (screen.x + screen.w / 2 - BLASTER.cellW / 2) * px
    const screenY = -(BLASTER.cellH - screen.y - screen.h / 2) * px
    const digit = scene.add
        .image(screenX, screenY, glyphKey('0', 'glow'))
        .setScale(((screen.h - 2) * px) / 7)
        .setVisible(false)
    const root = scene.add.container(BLASTER.x, H, [body, digit]).setDepth(DEPTH.blaster)
    const beam = scene.add.graphics().setDepth(DEPTH.beam)
    const bolt = scene.add.image(0, 0, glyphKey('0', 'light')).setDepth(DEPTH.beam + 1).setVisible(false)

    let clock = 0
    let recoil = 0
    let hidden = 1
    let swayX = 0

    const muzzle = (): Point => ({
        x: root.x + (BLASTER.muzzle.x - BLASTER.cellW / 2) * px,
        y: root.y - (BLASTER.cellH - BLASTER.muzzle.y) * px,
    })

    const place = () => {
        root.setPosition(BLASTER.x + swayX, H + Math.sin(clock * 2.2) * 3 + recoil + hidden * (BLASTER.cellH * px + 20))
    }
    place()

    return {
        async setShown(on) {
            if (!on) digit.setVisible(false)
            const s = { v: hidden }
            scene.tweens.killTweensOf(s)
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: s,
                    v: on ? 0 : 1,
                    duration: FX.ms(scene, BLASTER.show),
                    ease: on ? 'Back.easeOut' : 'Sine.easeIn',
                    onUpdate: () => {
                        hidden = s.v
                        place()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
        },
        update(dt, aimX) {
            clock += dt
            recoil = Math.max(0, recoil - dt * 90)
            swayX += ((aimX - W / 2) * 0.06 - swayX) * (1 - Math.exp(-8 * dt))
            place()
        },
        fire(value, to) {
            const from = muzzle()
            body.setFrame(cellKey(CODER.fire))
            recoil = 12
            digit.setTexture(glyphKey(value, 'glow')).setVisible(true)
            bolt.setTexture(glyphKey(value, 'light')).setScale(5).setVisible(true)
            const s = { t: 0 }
            const draw = (end: Point, alpha: number) => {
                beam.clear()
                beam.lineStyle(16, C.cyan, 0.35 * alpha)
                beam.lineBetween(from.x, from.y, end.x, end.y)
                beam.lineStyle(8, C.cyan, 0.9 * alpha)
                beam.lineBetween(from.x, from.y, end.x, end.y)
                beam.lineStyle(3, C.white, alpha)
                beam.lineBetween(from.x, from.y, end.x, end.y)
            }
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: s,
                    t: 1,
                    duration: FX.ms(scene, SHOT.ms),
                    onUpdate: () => {
                        const p = to()
                        const end = { x: Phaser.Math.Linear(from.x, p.x, s.t), y: Phaser.Math.Linear(from.y, p.y, s.t) }
                        draw(end, 1)
                        bolt.setPosition(end.x, end.y)
                    },
                    onComplete: () => {
                        const end = to()
                        bolt.setVisible(false)
                        resolve()
                        const fade = { a: 1 }
                        scene.tweens.add({
                            targets: fade,
                            a: 0,
                            duration: FX.ms(scene, 140),
                            onUpdate: () => draw(end, fade.a),
                            onComplete: () => beam.clear(),
                        })
                        scene.time.delayedCall(FX.ms(scene, 70), () => body.setFrame(cellKey(CODER.idle)))
                    },
                    onStop: () => resolve(),
                })
            })
        },
        rect: () => ({ x: BLASTER.x, y: H - (BLASTER.cellH * px) / 2, w: BLASTER.cellW * px + 20, h: BLASTER.cellH * px + 20 }),
        destroy() {
            beam.destroy()
            bolt.destroy()
            root.destroy()
        },
    }
}
