import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MEL_CELL, MEL_SHEET, cellKey } from '../data/files'
import { MEL, WD } from '../data/layout'
import { TIMING } from '../data/timing'
import type { Vec } from '../types'
import { DROP } from './art'
import type { View } from './view'

export interface Mel {
    readonly x: number
    readonly y: number
    place(x: number, y: number): void
    pose(cell: number | null): void
    hopTo(to: Vec, height?: number): Promise<void>
    walkTo(to: Vec): Promise<void>
    toe(towards: Vec): Promise<void>
    back(): Promise<void>
    cheer(): Promise<void>
    fall(water: Vec): Promise<void>
    head(): Vec
    destroy(): void
}

export function createMel(scene: Phaser.Scene, view: View, onLand?: () => void): Mel {
    const img = scene.add.image(0, 0, MEL_SHEET.key, cellKey(MEL_CELL.idle)).setOrigin(0.5, 1)
    view.add(img, WD.mel)
    const scale = MEL.h / img.frame.height
    img.setScale(scale)
    let home: Vec = { x: 0, y: 0 }
    let drops: Phaser.GameObjects.Image[] = []

    const set = (cell: number) => {
        img.setFrame(cellKey(cell))
        img.setOrigin(0.5, 1)
    }

    const splash = (at: Vec) => {
        for (let i = 0; i < 12; i++) {
            const a = Math.PI + (Math.PI * i) / 11
            const d = scene.add.image(at.x, at.y, DROP).setScale(Phaser.Math.FloatBetween(0.7, 1.3))
            view.add(d, WD.fx)
            drops.push(d)
            const tx = at.x + Math.cos(a) * Phaser.Math.Between(50, 110)
            const ty = at.y + Math.sin(a) * Phaser.Math.Between(40, 90)
            void FX.arcTo(scene, d, { x: tx, y: ty + 30 }, { height: 40, duration: 520 }).then(() => {
                drops = drops.filter(x => x !== d)
                d.destroy()
            })
        }
    }

    const mel: Mel = {
        get x() {
            return home.x
        },
        get y() {
            return home.y
        },
        place(x, y) {
            scene.tweens.killTweensOf(img)
            home = { x, y }
            img.setPosition(x, y).setScale(scale).setAngle(0).setAlpha(1).setVisible(true)
            set(MEL_CELL.idle)
        },
        pose(cell) {
            set(cell ?? MEL_CELL.idle)
        },
        async hopTo(to, height = MEL.jump) {
            set(MEL_CELL.crouch)
            await FX.to(scene, img, { scaleY: scale * 0.92 }, { duration: TIMING.crouch })
            img.setScale(scale)
            set(MEL_CELL.air)
            await FX.arcTo(scene, img, to, { height, duration: TIMING.jump })
            home = { ...to }
            set(MEL_CELL.land)
            onLand?.()
            await FX.to(scene, img, { scaleX: scale * 1.06, scaleY: scale * 0.92 }, { duration: 90, yoyo: true })
            img.setScale(scale)
        },
        async walkTo(to) {
            const steps = Math.max(1, Math.round(Math.hypot(to.x - home.x, to.y - home.y) / 90))
            const from = { ...home }
            for (let i = 1; i <= steps; i++) {
                const p = { x: Phaser.Math.Linear(from.x, to.x, i / steps), y: Phaser.Math.Linear(from.y, to.y, i / steps) }
                set(MEL_CELL.land)
                await FX.arcTo(scene, img, p, { height: 18, duration: TIMING.walk / 1.6 })
            }
            home = { ...to }
            set(MEL_CELL.idle)
        },
        async toe(towards) {
            const reach = { x: home.x + MEL.toe, y: home.y + (towards.y - home.y) * 0.25 }
            set(MEL_CELL.toe)
            await FX.to(scene, img, { x: reach.x, y: reach.y }, { duration: TIMING.toe })
        },
        async back() {
            set(MEL_CELL.oops)
            await FX.arcTo(scene, img, home, { height: 30, duration: 360 })
            set(MEL_CELL.idle)
        },
        async cheer() {
            set(MEL_CELL.cheer)
            await FX.to(scene, img, { y: home.y - 26 }, { duration: 200, yoyo: true, ease: 'Sine.easeOut' })
            img.setY(home.y)
        },
        async fall(water) {
            set(MEL_CELL.oops)
            await FX.to(scene, img, { y: home.y + 26, angle: -8 }, { duration: TIMING.fall, ease: 'Sine.easeIn' })
            img.setAngle(0)
            splash(water)
            set(MEL_CELL.sunk)
            img.setPosition(water.x, water.y + 14)
            home = { x: water.x, y: water.y + 14 }
            await FX.to(scene, img, { y: home.y - 10 }, { duration: 240, yoyo: true })
            img.setY(home.y)
        },
        head() {
            return { x: home.x, y: home.y - MEL.h * 0.78 }
        },
        destroy() {
            drops.forEach(d => d.destroy())
            drops = []
            img.destroy()
        },
    }
    return mel
}
