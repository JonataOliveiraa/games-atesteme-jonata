import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { iconRef } from '../data/files'
import { BADGE, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { ERAS } from '../data/eras'
import type { Rect } from '../types'

export interface Badge {
    set(era: number, pop: boolean): void
    rect(): Rect
    destroy(): void
}

export function createBadge(scene: Phaser.Scene, era: number, usesBy?: string[]): Badge {
    const g = scene.add.graphics()
    const ring = scene.add.circle(0, 0, BADGE.portrait + 4, C.time)
    const first = iconRef(ERAS[era].portrait)
    const face = scene.add.image(0, 0, first.key, first.frame).setDisplaySize(BADGE.portrait * 2, BADGE.portrait * 2)
    const name = scene.add.text(0, 0, '', { fontFamily: FONT.black, fontSize: '28px', color: CSS.ink }).setOrigin(0, 1).setResolution(2)
    const uses = scene.add.text(0, 0, '', { fontFamily: FONT.black, fontSize: '20px', color: CSS.accent }).setOrigin(0, 0).setResolution(2)
    const box = scene.add.container(BADGE.x, BADGE.y, [g, ring, face, name, uses]).setDepth(DEPTH.badge)
    let width = 0

    const paint = (at: number) => {
        const def = ERAS[at]
        const ref = iconRef(def.portrait)
        face.setTexture(ref.key, ref.frame).setDisplaySize(BADGE.portrait * 2, BADGE.portrait * 2)
        name.setText(def.who)
        uses.setText(usesBy?.[at] ?? def.uses)
        const left = BADGE.pad + BADGE.portrait * 2 + 12
        width = left + Math.max(name.width, uses.width) + BADGE.pad + 6
        const cy = BADGE.h / 2
        ring.setPosition(BADGE.pad + BADGE.portrait, cy)
        face.setPosition(BADGE.pad + BADGE.portrait, cy)
        name.setPosition(left, cy + 4)
        uses.setPosition(left, cy + 4)
        g.clear()
        g.fillStyle(C.shadow, 0.18)
        g.fillRoundedRect(4, 6, width, BADGE.h, BADGE.h / 2)
        g.fillStyle(C.headerFace, 1)
        g.fillRoundedRect(0, 0, width, BADGE.h, BADGE.h / 2)
        g.lineStyle(3, C.headerRim, 1)
        g.strokeRoundedRect(0, 0, width, BADGE.h, BADGE.h / 2)
    }
    paint(era)

    return {
        set(at, pop) {
            paint(at)
            if (pop) void FX.popIn(scene, box, { from: 0.6, duration: 380 })
        },
        rect: () => ({ x: BADGE.x - 8, y: BADGE.y - 8, w: width + 16, h: BADGE.h + 16 }),
        destroy() {
            box.destroy()
        },
    }
}
