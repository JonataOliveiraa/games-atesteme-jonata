import Phaser from 'phaser'
import { FAR_KEY, NEAR_KEY, RIVER_KEY } from '../data/files'
import { BANK, H, LANES, MID_LANE, RIVER, WD, colX } from '../data/layout'
import type { Vec } from '../types'
import type { View } from './view'

export interface World {
    setColumns(n: number): void
    near(lane: number): Vec
    far(): Vec
    party(): Vec
    update(delta: number): void
    destroy(): void
}

export function createWorld(scene: Phaser.Scene, view: View): World {
    const river = view.add(scene.add.tileSprite(RIVER.fromX, 0, 10, H, RIVER_KEY).setOrigin(0, 0), WD.river)
    const near = view.add(scene.add.image(BANK.nearX, 0, NEAR_KEY).setOrigin(0, 0).setDisplaySize(BANK.nearW, H), WD.bank)
    const far = view.add(scene.add.image(0, 0, FAR_KEY).setOrigin(0, 0).setDisplaySize(BANK.farW, H), WD.bank)
    let columns = 3

    const farX = () => colX(columns + 1) - BANK.farGap

    const world: World = {
        setColumns(n) {
            columns = n
            far.setX(farX())
            river.setSize(farX() + 200 - RIVER.fromX, H)
        },
        near(lane) {
            return { x: colX(0), y: LANES[lane] }
        },
        far() {
            return { x: colX(columns + 1), y: LANES[MID_LANE] }
        },
        party() {
            return { x: farX() + BANK.party.x, y: BANK.party.y }
        },
        update(delta) {
            river.tilePositionY -= (RIVER.flow * delta) / 1000
        },
        destroy() {
            river.destroy()
            near.destroy()
            far.destroy()
        },
    }
    world.setColumns(columns)
    return world
}
