import Phaser from 'phaser'
import { DEPTH, FIELD, H, TABLET, W } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef } from '../types'

export const ROOM_TEXTURE = 'bg-quarto'

const BASE_CROSSING = 8

export function createTablet(scene: Phaser.Scene, level: LevelDef) {
    const palette = level.bubbleColors
    const hurry = level.crossing / BASE_CROSSING
    const root = scene.add.container(0, 0).setDepth(DEPTH.tablet)

    if (scene.textures.exists(ROOM_TEXTURE)) {
        scene.add.image(W / 2, H / 2, ROOM_TEXTURE).setDisplaySize(W, H).setDepth(DEPTH.scene)
    } else {
        const sky = scene.add.graphics().setDepth(DEPTH.scene)
        sky.fillStyle(0xcfe6f7, 1)
        sky.fillRect(0, 0, W, H)
        sky.fillStyle(0xe3b98a, 1)
        sky.fillRect(0, H * 0.72, W, H * 0.28)
    }

    const x = TABLET.cx - TABLET.w / 2
    const y = TABLET.cy - TABLET.h / 2
    const b = TABLET.bezel
    const innerX = x + b
    const innerY = y + b
    const innerW = TABLET.w - b * 2
    const innerH = TABLET.h - b * 2

    const g = scene.add.graphics()

    g.fillStyle(C.ink, 0.28)
    g.fillRoundedRect(x + 8, y + 14, TABLET.w, TABLET.h, TABLET.radius)
    g.fillStyle(C.shellDeep, 1)
    g.fillRoundedRect(x, y, TABLET.w, TABLET.h, TABLET.radius)
    g.fillStyle(C.shell, 1)
    g.fillRoundedRect(x, y, TABLET.w, TABLET.h - 10, TABLET.radius)
    g.fillStyle(C.white, 0.22)
    g.fillRoundedRect(x + 26, y + 14, TABLET.w - 52, 16, 8)

    g.fillStyle(C.shellDark, 1)
    g.fillRoundedRect(innerX - 6, innerY - 6, innerW + 12, innerH + 12, 26)
    g.fillStyle(C.screen, 1)
    g.fillRoundedRect(innerX, innerY, innerW, innerH, 22)

    FIELD.lanes.forEach((lane, i) => {
        g.fillStyle(C.white, i % 2 === 0 ? 0.5 : 0.22)
        g.fillRoundedRect(innerX + 16, lane - 78, innerW - 32, 156, 30)
    })

    g.fillStyle(C.white, 0.6)
    g.fillRoundedRect(innerX + 12, innerY + 10, innerW - 24, 40, 18)
    g.fillStyle(C.screenEdge, 0.22)
    g.fillRoundedRect(innerX + 12, innerY + innerH - 44, innerW - 24, 32, 16)

    g.fillStyle(C.shellDark, 1)
    g.fillCircle(TABLET.cx, y + b / 2, 7)
    g.fillStyle(C.ok, 1)
    g.fillCircle(x + 34, TABLET.cy, 6)

    root.add(g)

    const bubbles: Phaser.GameObjects.Graphics[] = []
    const left = innerX + 40
    const right = innerX + innerW - 40
    const bottom = innerY + innerH
    const top = innerY - 40

    for (let i = 0; i < level.ambient; i++) {
        const radius = Phaser.Math.Between(9, 26)
        const tone = palette[i % palette.length]
        const dot = scene.add.graphics()
        dot.fillStyle(tone, 0.34)
        dot.fillCircle(0, 0, radius)
        dot.lineStyle(3, tone, 0.8)
        dot.strokeCircle(0, 0, radius)
        dot.fillStyle(C.white, 0.9)
        dot.fillCircle(-radius * 0.32, -radius * 0.36, radius * 0.22)
        dot.setAlpha(0)
        root.add(dot)
        bubbles.push(dot)

        const drift = () => {
            if (!dot.active) return
            dot.setPosition(Phaser.Math.Between(left, right), bottom + radius)
            dot.setAlpha(0)
            scene.tweens.add({ targets: dot, alpha: 0.5, duration: 700 })
            scene.tweens.add({
                targets: dot,
                y: top,
                x: dot.x + Phaser.Math.Between(-50, 50),
                duration: Math.round(Phaser.Math.Between(8000, 14000) * hurry),
                ease: 'Sine.easeInOut',
                onComplete: drift,
            })
        }

        scene.time.delayedCall(Math.round(i * 520 * hurry), drift)
    }

    return {
        get container() {
            return root
        },

        bounds() {
            return { x: TABLET.cx, y: TABLET.cy, w: TABLET.w, h: TABLET.h }
        },

        destroy() {
            bubbles.forEach(dot => scene.tweens.killTweensOf(dot))
            root.destroy(true)
        },
    }
}

export type Tablet = ReturnType<typeof createTablet>
