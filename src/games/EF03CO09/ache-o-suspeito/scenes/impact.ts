import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    DATA_BOX,
    dataFrame,
    DATA_SHEET,
    DEST_BOX,
    DEST_SHEET,
    destFrame,
    fitInside,
    originOf,
    SHEET,
} from '../data/art'
import { DEPTH, PUBLIC_EYE } from '../data/layout'
import { C } from '../data/theme'
import type { Audience, DataKind } from '../types'

type Point = { x: number; y: number }

const COPIES = 4

export function createImpact(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.copy)
    const lines = scene.add.graphics()
    root.add(lines)

    const curve = (from: Point, to: Point, lift: number) => (t: number) => {
        const control = { x: (from.x + to.x) / 2, y: Math.max(from.y, to.y) + lift }
        const inv = 1 - t
        return {
            x: inv * inv * from.x + 2 * inv * t * control.x + t * t * to.x,
            y: inv * inv * from.y + 2 * inv * t * control.y + t * t * to.y,
        }
    }

    const dotted = (from: Point, to: Point, lift: number, alpha: number) => {
        const at = curve(from, to, lift)
        for (let i = 0; i < 26; i += 2) {
            const a = at(i / 26)
            const b = at((i + 1) / 26)
            lines.lineStyle(4, C.cyan, alpha)
            lines.lineBetween(a.x, a.y, b.x, b.y)
        }
    }

    const makeData = (kind: DataKind, size: number) => {
        if (!scene.textures.exists(SHEET.data)) {
            const g = scene.add.graphics()
            g.fillStyle(C.blue, 1)
            g.fillRoundedRect(-size / 2, -size / 2, size, size, 10)
            return g
        }
        const frame = dataFrame(kind)
        const box = DATA_BOX[frame]
        const image = scene.add.image(0, 0, SHEET.data, frame)
        const origin = originOf(box, DATA_SHEET.frameWidth, DATA_SHEET.frameHeight)
        image.setOrigin(origin.x, origin.y)
        image.setScale(fitInside(box, size, size))
        return image
    }

    const makeDest = (audience: Audience, size: number) => {
        if (!scene.textures.exists(SHEET.destinations)) {
            const g = scene.add.graphics()
            g.fillStyle(C.crowd, 1)
            g.fillCircle(0, 0, size / 2)
            return g
        }
        const frame = destFrame(audience, true)
        const box = DEST_BOX[frame]
        const image = scene.add.image(0, 0, SHEET.destinations, frame)
        const origin = originOf(box, DEST_SHEET.frameWidth, DEST_SHEET.frameHeight)
        image.setOrigin(origin.x, origin.y)
        image.setScale(fitInside(box, size, size))
        return image
    }

    const clear = () => {
        scene.tweens.killTweensOf(root.list)
        root.list.slice().forEach(child => {
            if (child !== lines) child.destroy()
        })
        lines.clear()
        lines.setAlpha(1)
        root.setAlpha(1)
    }

    return {
        async play(from: Point, kind: DataKind, audience: Audience, onCopy?: (n: number) => void) {
            clear()
            const target = { x: PUBLIC_EYE.x, y: PUBLIC_EYE.y }

            const dest = makeDest(audience, 124)
            dest.setPosition(target.x, target.y).setAlpha(0).setScale(dest.scale * 0.7)
            root.add(dest)
            await FX.to(scene, dest, { alpha: 0.9, scale: dest.scale / 0.7 }, { duration: 280, ease: 'Back.easeOut' })

            const jobs: Promise<unknown>[] = []
            for (let i = 0; i < COPIES; i++) {
                const lift = 58 + i * 26
                const copy = makeData(kind, 62)
                copy.setPosition(from.x, from.y).setAlpha(0)
                root.add(copy)
                const base = copy.scale
                const step = { v: 0 }
                jobs.push(
                    FX.wait(scene, i * 150).then(() => {
                        onCopy?.(i)
                        dotted(from, target, lift, 0.4)
                        return new Promise<void>(resolve => {
                            scene.tweens.add({
                                targets: step,
                                v: 1,
                                duration: FX.ms(scene, 620),
                                ease: 'Sine.easeInOut',
                                onStart: () => copy.setAlpha(0.62),
                                onUpdate: () => {
                                    if (!copy.active) return
                                    const at = curve(from, target, lift)(step.v)
                                    copy.setPosition(at.x, at.y)
                                    copy.setScale(base * (1 - 0.35 * step.v))
                                    copy.setAlpha(0.62 * (1 - step.v * 0.5))
                                },
                                onComplete: () => resolve(),
                            })
                        })
                    }),
                )
            }
            await FX.all(...jobs)
            await FX.to(scene, dest, { scale: dest.scale * 1.12 }, { duration: 160, yoyo: true })
            await FX.wait(scene, 340)
            await FX.to(scene, root, { alpha: 0 }, { duration: 380 })
            clear()
        },

        clear,

        destroy() {
            clear()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Impact = ReturnType<typeof createImpact>
