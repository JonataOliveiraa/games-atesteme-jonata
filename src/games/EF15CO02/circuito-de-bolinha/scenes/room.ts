import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ROOM_KEY, TABLE_KEY } from '../data/files'
import { H, SD, TABLE, W } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Stage } from './stage'

export interface Room {
    focus(on: boolean): Promise<void>
    destroy(): void
}

const VEIL = 0.55

export function createRoom(scene: Phaser.Scene, stage: Stage): Room {
    const bg = stage.add(scene.add.image(0, 0, ROOM_KEY).setOrigin(0).setDisplaySize(W, H), SD.room)
    const veil = stage.add(scene.add.rectangle(W / 2, H / 2, W * 3, H * 3, C.shadow, 1).setAlpha(0), SD.veil)
    const table = stage.add(
        scene.add.image(TABLE.cx, TABLE.top - TABLE.imageTop, TABLE_KEY).setOrigin(0.5, 0),
        SD.table,
    )
    table.setScale(TABLE.w / table.width)

    return {
        focus(on) {
            scene.tweens.killTweensOf(veil)
            return FX.to(scene, veil, { alpha: on ? VEIL : 0 }, { duration: TIMING.focus })
        },
        destroy() {
            scene.tweens.killTweensOf(veil)
            bg.destroy()
            veil.destroy()
            table.destroy()
        },
    }
}
