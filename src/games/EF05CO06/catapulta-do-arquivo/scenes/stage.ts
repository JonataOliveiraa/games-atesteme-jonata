import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DIRT, PIECE, PIECE_SHEET, PLANK, PLANK_CORNER, cellKey } from '../data/files'
import { DEPTH, H, PLATFORM, SPRING } from '../data/layout'
import { C } from '../data/theme'
import type { MapDef } from '../types'
import { fit } from './art'
import type { World } from './world'

export interface Stage {
    bounce(spring: number): void
    destroy(): void
}

const GRASS = 26
const LINE = 5

/** o relevo de um mapa: terra repetida dentro do chão, túneis, grama, tábuas e molas */
export function createStage(scene: Phaser.Scene, map: MapDef, world: World): Stage {
    const shape = scene.make.graphics({ x: 0, y: 0 }, false)
    shape.fillStyle(0xffffff, 1)
    map.ground.forEach(line => {
        const pts = [...line, [line[line.length - 1][0], H + 20], [line[0][0], H + 20]].map(([x, y]) => new Phaser.Math.Vector2(x, y))
        shape.fillPoints(pts, true)
    })
    const dirt = scene.add.tileSprite(0, 0, map.width, H, DIRT).setOrigin(0).setDepth(DEPTH.ground)
    dirt.setMask(shape.createGeometryMask())

    const g = scene.add.graphics().setDepth(DEPTH.ground + 0.5)
    map.holes.forEach((hole, i) => {
        const top = world.holeTop(i)
        g.fillStyle(C.chamber, 1)
        g.fillRect(hole.x0, top, hole.x1 - hole.x0, H - top)
        g.fillStyle(C.chamberRim, 1)
        g.fillRect(hole.x0 + 8, top, hole.x1 - hole.x0 - 16, H - top)
        g.fillStyle(C.chamber, 1)
        g.fillRect(hole.x0 + 16, top + 30, hole.x1 - hole.x0 - 32, H - top - 30)
        g.lineStyle(LINE, C.ink, 1)
        g.lineBetween(hole.x0, top, hole.x0, H)
        g.lineBetween(hole.x1, top, hole.x1, H)
    })
    map.ground.forEach(line => {
        const at = (dy: number) => line.map(([x, y]) => new Phaser.Math.Vector2(x, y + dy))
        g.lineStyle(GRASS, C.grass, 1)
        g.strokePoints(at(6))
        g.lineStyle(8, C.grassLight, 1)
        g.strokePoints(at(-1))
        g.lineStyle(LINE, C.ink, 1)
        g.strokePoints(at(-7))
    })

    const planks = map.platforms.map(p =>
        scene.add
            .nineslice(p.x, p.y, PLANK, undefined, p.w, PLATFORM.h + 12, PLANK_CORNER, PLANK_CORNER, 0, 0)
            .setDepth(DEPTH.platform),
    )

    const springs = map.springs.map(s => {
        const ground = world.groundAt(s.x) ?? 560
        return fit(scene, PIECE_SHEET, PIECE.spring, SPRING.w).setOrigin(0.5, 1).setPosition(s.x, ground + 4).setDepth(DEPTH.platform)
    })

    return {
        bounce(i) {
            const spring = springs[i]
            if (!spring) return
            const base = spring.scaleY
            spring.setFrame(cellKey(PIECE.springDown))
            void FX.to(scene, spring, { scaleY: base * 1.25 }, { duration: 90, yoyo: true }).then(() => {
                if (spring.active) spring.setFrame(cellKey(PIECE.spring)).setScale(spring.scaleX, base)
            })
        },
        destroy() {
            dirt.clearMask(true)
            dirt.destroy()
            shape.destroy()
            g.destroy()
            planks.forEach(p => p.destroy())
            springs.forEach(s => s.destroy())
        },
    }
}
