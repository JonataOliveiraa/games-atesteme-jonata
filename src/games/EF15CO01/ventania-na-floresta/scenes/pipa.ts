import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIPA_CELL, PIPA_SHEET, cellKey, sheetData } from '../data/files'
import { DEPTH, PIPA } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Vec } from '../types'

export interface Pipa {
    enter(): Promise<void>
    leave(): Promise<void>
    stand(x: number, y: number): void
    hopTo(x: number, hops?: number): Promise<void>
    hide(): void
    pose(cell: number): void
    face(left: boolean): void
    brace(on: boolean): void
    head(): Vec
    x(): number
    destroy(): void
}

export function createPipa(scene: Phaser.Scene): Pipa {
    const sprite = scene.add.image(0, 0, PIPA_SHEET.key, cellKey(PIPA_CELL.idle)).setOrigin(0.5, 1)
    sprite.setScale(PIPA.h / (sheetData(scene, PIPA_SHEET).maxH ?? 300))
    const shadow = scene.add.ellipse(0, -4, sprite.displayWidth * 0.7, 22, C.shadow, 0.2)
    const box = scene.add.container(PIPA.enterFrom, PIPA.y, [shadow, sprite]).setDepth(DEPTH.pipa).setVisible(false)
    let wobble: Phaser.Tweens.Tween | undefined
    let ground: number = PIPA.y

    const hopTo = async (x: number, hops: number) => {
        const from = box.x
        sprite.setFlipX(x < from)
        for (let i = 1; i <= hops; i++) {
            const to = Phaser.Math.Linear(from, x, i / hops)
            await FX.arcTo(scene, box, { x: to, y: ground }, { height: 46, duration: TIMING.enter / hops + 160 })
        }
        sprite.setFlipX(false)
    }

    return {
        async enter() {
            ground = PIPA.y
            box.setVisible(true).setPosition(PIPA.enterFrom, PIPA.y)
            sprite.setFrame(cellKey(PIPA_CELL.hop)).setAngle(0)
            await hopTo(PIPA.x, 3)
            sprite.setFrame(cellKey(PIPA_CELL.wave))
            await FX.impact(scene, sprite, 0.1)
        },
        async leave() {
            wobble?.stop()
            sprite.setAngle(0).setFrame(cellKey(PIPA_CELL.hop))
            await hopTo(PIPA.enterFrom, 3)
            box.setVisible(false)
        },
        stand(x, y) {
            wobble?.stop()
            scene.tweens.killTweensOf([box, sprite])
            ground = y
            box.setVisible(true).setPosition(x, y)
            sprite.setAngle(0).setFlipX(false).setFrame(cellKey(PIPA_CELL.idle))
        },
        async hopTo(x, hops = 2) {
            sprite.setFrame(cellKey(PIPA_CELL.hop))
            await hopTo(x, hops)
        },
        hide() {
            wobble?.stop()
            scene.tweens.killTweensOf([box, sprite])
            box.setVisible(false)
        },
        pose(cell) {
            sprite.setFrame(cellKey(cell))
        },
        face(left) {
            sprite.setFlipX(left)
        },
        brace(on) {
            wobble?.stop()
            wobble = undefined
            sprite.setAngle(0)
            if (!on) return
            sprite.setFrame(cellKey(PIPA_CELL.brace))
            wobble = scene.tweens.add({ targets: sprite, angle: 4, duration: 120, yoyo: true, repeat: -1 })
        },
        head: () => ({ x: box.x, y: box.y - sprite.displayHeight * 0.92 }),
        x: () => box.x,
        destroy() {
            wobble?.stop()
            box.destroy()
        },
    }
}
