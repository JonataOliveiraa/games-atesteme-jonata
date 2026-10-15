import Phaser from 'phaser'
import { DEPTH, MINIMAP } from '../data/layout'
import { C } from '../data/theme'
import type { MapDef, Rect, Vec } from '../types'
import { baked } from './art'
import { paintGround } from './world'

export interface Minimap {
    update(pos: Vec, face: Vec): void
    visible(on: boolean): void
    rect(): Rect
    destroy(): void
}

export function createMinimap(scene: Phaser.Scene, map: MapDef): Minimap {
    const s = MINIMAP.w / map.w
    const h = map.h * s
    const key = baked(scene, `cnt-mini-${map.id}`, MINIMAP.w, h, g => {
        g.scaleCanvas(s, s)
        paintGround(g, map)
        map.props.forEach(prop => {
            if (prop.kind === 'bigTree' || prop.kind === 'smallTree') {
                g.fillStyle(C.leafDark, 1)
                g.fillCircle(prop.x, prop.y - 60, prop.kind === 'bigTree' ? 70 : 52)
            }
            if (prop.kind === 'rock') {
                g.fillStyle(C.rockDark, 1)
                g.fillCircle(prop.x, prop.y - 20, 44)
            }
        })
        if (map.pier) {
            g.fillStyle(C.wood, 1)
            g.fillRect(map.pier.x - map.pier.w / 2, map.pier.top, map.pier.w, map.pier.bottom - map.pier.top)
        }
        if (map.cliff) {
            g.fillStyle(C.rockDark, 1)
            g.fillEllipse(map.cliff.x, map.cliff.y, map.cliff.r * 2, map.cliff.r * 1.7)
            g.fillStyle(C.waterLight, 1)
            g.fillRect(map.cliff.x - 10, map.cliff.y - 110, 70, 170)
        }
    })
    const left = MINIMAP.x - MINIMAP.w / 2
    const top = MINIMAP.y - h / 2
    const frame = scene.add.graphics().setDepth(DEPTH.minimap)
    frame.fillStyle(C.headerLine, 1)
    frame.fillRoundedRect(left - 4, top - 4, MINIMAP.w + 8, h + 8, 10)
    const image = scene.add.image(MINIMAP.x, MINIMAP.y, key).setDepth(DEPTH.minimap + 1)
    const dotArt = scene.add.graphics()
    dotArt.fillStyle(C.ink, 1)
    dotArt.fillTriangle(9, -6, 9, 6, 17, 0)
    dotArt.fillStyle(C.white, 1)
    dotArt.fillCircle(0, 0, 9)
    dotArt.fillStyle(C.hair, 1)
    dotArt.fillCircle(0, 0, 6.5)
    dotArt.lineStyle(2.5, C.ink, 1)
    dotArt.strokeCircle(0, 0, 9)
    const dot = scene.add.container(0, 0, [dotArt]).setDepth(DEPTH.minimap + 2)

    return {
        update(pos, face) {
            dot.setPosition(left + pos.x * s, top + pos.y * s).setRotation(Math.atan2(face.y, face.x))
        },

        visible(on) {
            frame.setVisible(on)
            image.setVisible(on)
            dot.setVisible(on)
        },
        rect: () => ({ x: MINIMAP.x, y: MINIMAP.y, w: MINIMAP.w + 16, h: h + 16 }),
        destroy() {
            frame.destroy()
            image.destroy()
            dot.destroy()
        },
    }
}
