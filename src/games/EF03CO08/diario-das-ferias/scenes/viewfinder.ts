import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FOCUS, H, W } from '../data/layout'
import { C } from '../data/theme'
import type { Tool } from '../types'

/**
 * O que o tablet mostra por cima da praia. Sem ferramenta, uma mira pequena.
 * Com a CÂMERA, o visor de foto (cantos, grade, quadro de foco). Com o
 * MICROFONE, anéis que crescem com o volume do que está na mira.
 * O aviso de "tem coisa aqui" é igual para tudo: diz onde, nunca qual botão.
 */
export interface Lens {
    setTool(tool: Tool | null): void
    update(x: number, y: number, locked: boolean, level: number, delta: number): void
    /** o obturador fecha e abre */
    blink(): Promise<void>
    nudge(): void
    destroy(): void
}

const FRAME_INSET = 22
const CORNER = 54

export function createLens(scene: Phaser.Scene): Lens {
    const overlay = scene.add.graphics().setDepth(DEPTH.lens).setAlpha(0)
    const reticle = scene.add.graphics().setDepth(DEPTH.lens + 1)
    const irisTop = scene.add.rectangle(W / 2, -H / 4, W, H / 2, 0x111018).setDepth(DEPTH.lens + 3)
    const irisBottom = scene.add.rectangle(W / 2, H + H / 4, W, H / 2, 0x111018).setDepth(DEPTH.lens + 3)
    let tool: Tool | null = null
    let grow = 1
    let pulse = 0
    let shown = 0

    const paintOverlay = () => {
        overlay.clear()
        if (!tool) return
        const x0 = FRAME_INSET
        const y0 = FRAME_INSET
        const x1 = W - FRAME_INSET
        const y1 = H - FRAME_INSET
        const edge = tool === 'photo' ? 0x111018 : 0x4b3a7a
        overlay.fillStyle(edge, tool === 'photo' ? 0.34 : 0.22)
        overlay.fillRect(0, 0, W, y0)
        overlay.fillRect(0, y1, W, H - y1)
        overlay.fillRect(0, y0, x0, y1 - y0)
        overlay.fillRect(x1, y0, W - x1, y1 - y0)
        if (tool === 'photo') {
            overlay.lineStyle(2, C.white, 0.28)
            for (let k = 1; k < 3; k++) {
                overlay.lineBetween(x0 + ((x1 - x0) * k) / 3, y0, x0 + ((x1 - x0) * k) / 3, y1)
                overlay.lineBetween(x0, y0 + ((y1 - y0) * k) / 3, x1, y0 + ((y1 - y0) * k) / 3)
            }
            overlay.lineStyle(6, C.white, 0.9)
            ;[
                [x0, y0, 1, 1],
                [x1, y0, -1, 1],
                [x1, y1, -1, -1],
                [x0, y1, 1, -1],
            ].forEach(([x, y, sx, sy]) => {
                overlay.beginPath()
                overlay.moveTo(x, y + sy * CORNER)
                overlay.lineTo(x, y)
                overlay.lineTo(x + sx * CORNER, y)
                overlay.strokePath()
            })
        } else {
            overlay.lineStyle(5, C.lilac, 0.8)
            overlay.strokeRoundedRect(x0, y0, x1 - x0, y1 - y0, 36)
        }
    }

    const brackets = (w: number, h: number, color: number, width: number, inset: number) => {
        const hw = w / 2 - inset
        const hh = h / 2 - inset
        const len = Math.min(48, hw * 0.4)
        const draw = (stroke: number, tone: number, alpha: number) => {
            reticle.lineStyle(stroke, tone, alpha)
            ;[
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
            ].forEach(([sx, sy]) => {
                reticle.beginPath()
                reticle.moveTo(sx * hw, sy * hh - sy * len)
                reticle.lineTo(sx * hw, sy * hh)
                reticle.lineTo(sx * hw - sx * len, sy * hh)
                reticle.strokePath()
            })
        }
        draw(width + 6, C.ink, 0.45)
        draw(width, color, 1)
    }

    const cross = (color: number) => {
        reticle.lineStyle(4, C.ink, 0.4)
        reticle.lineBetween(-12, 0, 12, 0)
        reticle.lineBetween(0, -12, 0, 12)
        reticle.lineStyle(2, color, 1)
        reticle.lineBetween(-10, 0, 10, 0)
        reticle.lineBetween(0, -10, 0, 10)
    }

    const paintReticle = (locked: boolean, level: number) => {
        reticle.clear()
        const color = locked ? C.visorOn : C.visorOpen
        if (!tool) {
            reticle.lineStyle(7, C.ink, 0.4)
            reticle.strokeCircle(0, 0, locked ? 26 : 30)
            reticle.lineStyle(4, color, 1)
            reticle.strokeCircle(0, 0, locked ? 26 : 30)
            cross(color)
            return
        }
        if (tool === 'photo') {
            if (locked) {
                reticle.fillStyle(C.white, 0.1)
                reticle.fillRoundedRect(-FOCUS.w / 2 + 12, -FOCUS.h / 2 + 12, FOCUS.w - 24, FOCUS.h - 24, 16)
            }
            brackets(FOCUS.w * grow, FOCUS.h * grow, color, locked ? 9 : 6, locked ? 12 : 0)
            cross(color)
            return
        }
        const base = 70 * grow
        for (let i = 0; i < 3; i++) {
            const phase = (pulse + i / 3) % 1
            const r = base + phase * 60 * (0.4 + level)
            const alpha = (1 - phase) * (0.25 + level * 0.75)
            reticle.lineStyle(5, C.lilac, alpha)
            reticle.strokeCircle(0, 0, r)
        }
        reticle.lineStyle(9, C.ink, 0.4)
        reticle.strokeCircle(0, 0, base)
        reticle.lineStyle(locked ? 7 : 5, color, 1)
        reticle.strokeCircle(0, 0, locked ? base - 6 : base)
        cross(color)
    }

    return {
        setTool(next) {
            tool = next
            paintOverlay()
            scene.tweens.killTweensOf(overlay)
            overlay.setAlpha(0)
            if (next) scene.tweens.add({ targets: overlay, alpha: 1, duration: 260, ease: 'Sine.easeOut' })
            const k = { g: 1.35 }
            grow = k.g
            scene.tweens.add({
                targets: k,
                g: 1,
                duration: 360,
                ease: 'Back.easeOut',
                onUpdate: () => {
                    grow = k.g
                },
            })
        },
        update(x, y, locked, level, delta) {
            pulse = (pulse + delta / 900) % 1
            shown += (level - shown) * Math.min(1, delta / 120)
            reticle.setPosition(x, y)
            paintReticle(locked, shown)
        },
        async blink() {
            const close = (r: Phaser.GameObjects.Rectangle, y: number) => FX.to(scene, r, { y }, { duration: 70, ease: 'Sine.easeIn' })
            await Promise.all([close(irisTop, H / 4), close(irisBottom, H - H / 4)])
            await Promise.all([close(irisTop, -H / 4), close(irisBottom, H + H / 4)])
        },
        nudge() {
            scene.tweens.killTweensOf(reticle)
            reticle.setScale(1)
            void FX.to(scene, reticle, { scale: 0.9 }, { duration: 70, yoyo: true, repeat: 1 })
        },
        destroy() {
            ;[overlay, reticle, irisTop, irisBottom].forEach(o => {
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
        },
    }
}
