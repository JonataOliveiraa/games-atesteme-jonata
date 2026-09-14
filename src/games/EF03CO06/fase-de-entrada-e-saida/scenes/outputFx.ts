import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Content } from '../types'
import { paintCursor, paintFace, paintFlower, paintPaper } from './icons'

type Rect = { x: number; y: number; w: number; h: number }

export function createOutputFx(scene: Phaser.Scene) {
    const layer = scene.add.container(0, 0).setDepth(DEPTH.screenFx)
    const clear = () => {
        layer.each((child: Phaser.GameObjects.GameObject) => scene.tweens.killTweensOf(child))
        layer.removeAll(true)
    }

    const waves = async (from: { x: number; y: number }, count: number) => {
        for (let i = 0; i < count; i++) {
            const g = scene.add.graphics().setPosition(from.x, from.y)
            g.lineStyle(7, C.ink, 1)
            g.beginPath()
            g.arc(0, 0, 34, -0.7, 0.7)
            g.strokePath()
            g.lineStyle(4, C.input, 1)
            g.beginPath()
            g.arc(0, 0, 34, -0.7, 0.7)
            g.strokePath()
            layer.add(g)
            void FX.to(scene, g, { scale: 3, alpha: 0, x: from.x + 40 }, { duration: 900, ease: 'Sine.easeOut' }).then(() =>
                g.destroy(),
            )
            await FX.wait(scene, 260)
        }
    }

    const screenContent = async (screen: Rect, content: Content) => {
        if (content === 'letters') {
            const text = scene.add
                .text(screen.x, screen.y, '', {
                    fontFamily: FONT.black,
                    fontSize: `${Math.round(screen.h * 0.62)}px`,
                    color: CSS.ink,
                })
                .setOrigin(0.5)
                .setResolution(2)
            layer.add(text)
            for (const letter of 'LIA') {
                text.setText(text.text + letter)
                await FX.wait(scene, 220)
            }
            return
        }

        if (content === 'pointer') {
            const g = scene.add.graphics()
            paintCursor(g, 0, 0, screen.h * 0.55)
            g.setPosition(screen.x - screen.w * 0.28, screen.y - screen.h * 0.1)
            layer.add(g)
            await FX.to(scene, g, { x: screen.x + screen.w * 0.25, y: screen.y + screen.h * 0.12 }, { duration: 420 })
            await FX.to(scene, g, { x: screen.x - screen.w * 0.05, y: screen.y - screen.h * 0.18 }, { duration: 380 })
            await FX.to(scene, g, { scale: 0.85 }, { duration: 90, yoyo: true })
            return
        }

        const g = scene.add.graphics()
        const size = Math.min(screen.h * 1.05, screen.w * 0.6)
        if (content === 'drawing') paintFlower(g, 0, 0, size)
        else paintFace(g, 0, 0, size)
        g.setPosition(screen.x, screen.y).setScale(0.2).setAlpha(0)
        layer.add(g)
        await FX.to(scene, g, { scale: 1, alpha: 1 }, { duration: 320, ease: 'Back.easeOut' })
    }

    return {
        speaker(cone: { x: number; y: number }) {
            return waves({ x: cone.x + 30, y: cone.y }, 4)
        },

        monitor(screen: Rect, content: Content) {
            return screenContent(screen, content)
        },

        async printer(slot: { x: number; y: number; w: number }, content: Content) {
            const w = Math.min(slot.w * 0.82, 130)
            const h = w * 0.72
            const sheet = scene.add.container(slot.x, slot.y)
            const g = scene.add.graphics()
            paintPaper(g, 0, h / 2, w, h)
            sheet.add(g)
            if (content === 'letters') {
                sheet.add(
                    scene.add
                        .text(-4, h / 2 + 2, 'LIA', { fontFamily: FONT.black, fontSize: `${Math.round(h * 0.46)}px`, color: CSS.ink })
                        .setOrigin(0.5)
                        .setResolution(2),
                )
            } else if (content === 'drawing') {
                paintFlower(g, -4, h / 2 + 4, h * 0.8)
            } else if (content === 'photo') {
                paintFace(g, -4, h / 2, h * 0.9)
            }
            sheet.setScale(1, 0.05)
            layer.add(sheet)
            await FX.to(scene, sheet, { scaleY: 1 }, { duration: 560, ease: 'Sine.easeOut' })
            await FX.all(
                FX.arcTo(scene, sheet, { x: slot.x, y: slot.y - 190 }, { height: 30, duration: 420 }),
                FX.to(scene, sheet, { scale: 1.45, angle: -5 }, { duration: 420, ease: 'Back.easeOut' }),
            )
        },

        clear,

        destroy() {
            clear()
            layer.destroy(true)
        },
    }
}

export type OutputFx = ReturnType<typeof createOutputFx>
