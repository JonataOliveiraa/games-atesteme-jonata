import Phaser from 'phaser'
import { HERO_CELL, HERO_SHEET, LIA_CELL, LIA_SHEET, PATIO_KEY, cellKey, type FigureData, type Sheet } from '../data/files'
import { CAMERA, DEPTH, H, REAL, W } from '../data/layout'
import type { Rect, Vec } from '../types'
import { SHADOW, refOf } from './art'

export interface RealWorld {
    readonly shown: boolean
    show(): void
    hide(): void
    diveIn(at: Vec): Promise<void>
    diveOut(at: Vec): Promise<void>
    liaPose(cell: number): void
    heroPose(cell: number): void
    hop(): Promise<void>
    liaHead(): Vec
    liaHand(): Vec
    heroRect(): Rect
    destroy(): void
}

export function createRealWorld(scene: Phaser.Scene): RealWorld {
    const bg = scene.add.image(0, 0, PATIO_KEY).setOrigin(0, 0).setDisplaySize(W, H)
    const shadows = [REAL.liaX, REAL.heroX].map(x => scene.add.image(x, REAL.ground - 4, SHADOW).setDisplaySize(150, 36).setAlpha(0.22))
    const figure = (sheet: Sheet, cell: number, x: number, height: number) =>
        scene.add.image(x, REAL.ground, sheet.key, cellKey(cell)).setScale(height / refOf(scene, sheet))
    const lia = figure(LIA_SHEET, LIA_CELL.idle, REAL.liaX, REAL.liaH)
    const hero = figure(HERO_SHEET, HERO_CELL.idle, REAL.heroX, REAL.heroH)
    const layer = scene.add.container(0, 0, [bg, ...shadows, lia, hero]).setDepth(DEPTH.real)
    let shown = true
    let jump = 0

    const pin = (img: Phaser.GameObjects.Image, cell: number, side: boolean, flip: boolean) => {
        img.setFrame(cellKey(cell))
        const px = (img.frame.customData as FigureData).px ?? 0.5
        const f = side && flip
        img.setFlipX(f).setOrigin(f ? 1 - px : px, 1)
    }

    const zoomAround = (at: Vec, s: number) => layer.setScale(s).setPosition(at.x * (1 - s), at.y * (1 - s))

    const real: RealWorld = {
        get shown() {
            return shown
        },
        show() {
            shown = true
            scene.tweens.killTweensOf(layer)
            zoomAround({ x: 0, y: 0 }, 1)
            layer.setAlpha(1).setVisible(true)
        },
        hide() {
            shown = false
            scene.tweens.killTweensOf(layer)
            layer.setVisible(false)
        },
        async diveIn(at) {
            const k = { s: 1 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    s: 5,
                    duration: CAMERA.diveMs,
                    ease: 'Cubic.easeIn',
                    onUpdate: () => {
                        zoomAround(at, k.s)
                        layer.setAlpha(Phaser.Math.Clamp(1.4 - k.s / 4, 0, 1))
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            real.hide()
        },
        async diveOut(at) {
            shown = true
            layer.setVisible(true)
            const k = { s: 5 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    s: 1,
                    duration: CAMERA.diveMs,
                    ease: 'Cubic.easeOut',
                    onUpdate: () => {
                        zoomAround(at, k.s)
                        layer.setAlpha(Phaser.Math.Clamp(1.4 - k.s / 4, 0, 1))
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            zoomAround({ x: 0, y: 0 }, 1)
            layer.setAlpha(1)
        },
        liaPose(cell) {
            pin(lia, cell, cell === LIA_CELL.idle, false)
        },
        heroPose(cell) {
            pin(hero, cell, cell === HERO_CELL.idle, true)
        },
        async hop() {
            const k = { t: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: 380,
                    onUpdate: () => {
                        jump = Math.sin(k.t * Math.PI) * 34
                        lia.setY(REAL.ground - jump)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            lia.setY(REAL.ground)
        },
        liaHead: () => ({ x: REAL.liaX, y: REAL.ground - lia.displayHeight }),
        liaHand: () => ({ x: REAL.liaX + 6, y: REAL.ground - lia.displayHeight * 0.47 }),
        heroRect: () => ({ x: REAL.heroX, y: REAL.ground - hero.displayHeight / 2, w: hero.displayWidth + 30, h: hero.displayHeight + 20 }),
        destroy() {
            scene.tweens.killTweensOf(layer)
            layer.destroy()
        },
    }
    real.liaPose(LIA_CELL.idle)
    real.heroPose(HERO_CELL.idle)
    return real
}
