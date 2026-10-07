import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { ROBOT_ART, ROBOT_CELL, ROBOTS, robotFrame } from '../data/files'
import { BALLOON, DEPTH, H, PANEL, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { COUNT, PLATE } from '../data/words'
import type { Format, Payload, Vec } from '../types'
import { createDataView, type DataView } from './data-art'

export interface Balloon {
    say(at: Vec, text: string, tone?: 'ok' | 'oops'): Promise<void>
    hide(): void
    destroy(): void
}

export function createBalloon(scene: Phaser.Scene): Balloon {
    let box: Phaser.GameObjects.Container | undefined
    const hide = () => {
        if (!box) return
        scene.tweens.killTweensOf(box)
        box.destroy()
        box = undefined
    }
    return {
        say(at, text, tone = 'ok') {
            hide()
            const color = tone === 'oops' ? CSS.red : CSS.ink
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color })
                .setOrigin(0.5)
                .setResolution(2)
            const w = Math.max(BALLOON.minW, label.width + 48)
            const h = BALLOON.h
            const bg = scene.add.graphics()
            bg.fillStyle(C.shadow, 0.16)
            bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
            bg.fillStyle(C.white, 1)
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            const x = Phaser.Math.Clamp(at.x, w / 2 + 14, W - w / 2 - 14)
            const y = Phaser.Math.Clamp(at.y, h / 2 + 100, H - h / 2 - 30)
            const tail = Phaser.Math.Clamp(at.x - x, -w / 2 + 30, w / 2 - 30)
            bg.fillTriangle(tail - 14, h / 2 - 2, tail + 14, h / 2 - 2, tail, h / 2 + 20)
            bg.lineStyle(4, tone === 'oops' ? C.red : C.ink, 1)
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            box = scene.add.container(x, y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.7).setAlpha(0)
            return FX.to(scene, box, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        hide,
        destroy: hide,
    }
}

export interface Finale {
    show(eaten: Partial<Record<Format, Payload[]>>, robots: Format[]): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    let box: Phaser.GameObjects.Container | undefined
    let views: DataView[] = []
    return {
        async show(eaten, robots) {
            const { w, h } = PANEL
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.25)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 34)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 34)
            const parts: Phaser.GameObjects.GameObject[] = [g]
            const colW = (w - 80) / robots.length
            robots.forEach((format, k) => {
                const cx = -w / 2 + 40 + colW * (k + 0.5)
                g.fillStyle(C.creamDark, 1)
                g.fillRoundedRect(cx - colW / 2 + 12, -h / 2 + 30, colW - 24, h - 60, 24)
                const wide = robots.length <= 2
                const scale = wide ? 0.62 : 0.42
                const foot = wide ? 70 : -16
                parts.push(
                    scene.add
                        .sprite(wide ? cx - colW * 0.2 : cx, foot, ROBOTS, robotFrame(format, 'chew'))
                        .setOrigin(0.5, ROBOT_ART.foot / ROBOT_CELL)
                        .setScale(scale),
                )
                const list = eaten[format] ?? []
                const n = list.length
                parts.push(
                    scene.add
                        .text(cx, foot + (wide ? 50 : 30), `${n} ${COUNT[format][n === 1 ? 0 : 1]}`, {
                            fontFamily: FONT.black,
                            fontSize: `${SIZE.panelCount}px`,
                            color: CSS.ink,
                        })
                        .setOrigin(0.5)
                        .setResolution(2),
                )
                parts.push(
                    scene.add
                        .text(cx, -h / 2 + 58, PLATE[format], { fontFamily: FONT.black, fontSize: `${SIZE.panelCount}px`, color: CSS.blueDark })
                        .setOrigin(0.5)
                        .setResolution(2),
                )
                list.forEach((payload, i) => {
                    const tile = scene.add.graphics()
                    const size = wide ? 64 : 50
                    const gap = wide ? 74 : 56
                    const tx = wide ? cx + colW * 0.2 + (i % 2) * gap - gap / 2 : cx + ((i % 3) - 1) * gap
                    const ty = wide ? -90 + Math.floor(i / 2) * gap : 74 + Math.floor(i / 3) * gap
                    tile.fillStyle(C.screen, 1)
                    tile.fillRoundedRect(tx - size / 2, ty - size / 2, size, size, 10)
                    tile.lineStyle(3, C.screenDark, 1)
                    tile.strokeRoundedRect(tx - size / 2, ty - size / 2, size, size, 10)
                    const v = createDataView(scene)
                    v.show(payload, 'decoded', { x: tx, y: ty, w: size * 0.8, h: size * 0.72 })
                    v.freeze()
                    views.push(v)
                    parts.push(tile, v.container)
                })
            })
            box = scene.add.container(PANEL.x, -h, parts).setDepth(DEPTH.finale)
            await FX.to(scene, box, { y: PANEL.y }, { duration: 640, ease: Ease.back(1.3) })
        },
        destroy() {
            views.forEach(v => v.destroy())
            views = []
            box?.destroy()
            box = undefined
        },
    }
}
