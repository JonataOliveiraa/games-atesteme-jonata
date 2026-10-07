import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { MOD_CELL, MOD_FRAME, MODULE_ART, MODULES } from '../data/files'
import { BALLOON, DEPTH, H, PANEL, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { PANEL as PANEL_WORDS } from '../data/words'
import type { ModuleId, Rect, Vec } from '../types'

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
            bg.fillTriangle(-14, h / 2 - 2, 14, h / 2 - 2, 0, h / 2 + 20)
            bg.lineStyle(4, tone === 'oops' ? C.red : C.ink, 1)
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            const x = Phaser.Math.Clamp(at.x, w / 2 + 14, W - w / 2 - 14)
            const y = Phaser.Math.Clamp(at.y, h / 2 + 100, H - h / 2 - 30)
            box = scene.add.container(x, y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.7).setAlpha(0)
            return FX.to(scene, box, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        hide,
        destroy: hide,
    }
}

export interface Coach {
    show(hole: Rect, tap: Vec): void
    hide(): void
    destroy(): void
}

export function createCoach(scene: Phaser.Scene): Coach {
    const veil = scene.add.graphics().setDepth(DEPTH.coach)
    let ring: Phaser.Time.TimerEvent | undefined

    const hide = () => {
        veil.clear()
        ring?.remove()
    }

    return {
        show(hole, at) {
            hide()
            const l = hole.x - hole.w / 2
            const t = hole.y - hole.h / 2
            veil.fillStyle(C.shadow, 0.5)
            veil.fillRect(0, 0, W, t)
            veil.fillRect(0, t + hole.h, W, H - t - hole.h)
            veil.fillRect(0, t, l, hole.h)
            veil.fillRect(l + hole.w, t, W - l - hole.w, hole.h)
            veil.lineStyle(4, C.glow, 0.9)
            veil.strokeRoundedRect(l, t, hole.w, hole.h, 14)
            ring = scene.time.addEvent({
                delay: 900,
                loop: true,
                callback: () => void FX.ping(scene, at.x, at.y, C.glow, { radius: 46, duration: 560, depth: DEPTH.coach + 1 }),
            })
        },
        hide,
        destroy() {
            hide()
            veil.destroy()
        },
    }
}

export interface Finale {
    show(order: ModuleId[]): Promise<void>
    destroy(): void
}

export function createFinale(scene: Phaser.Scene): Finale {
    let box: Phaser.GameObjects.Container | undefined
    return {
        async show(order) {
            const { w, h } = PANEL
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.25)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 34)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 34)
            const colW = (w - 120) / 3
            const cols = [-colW - 30, 0, colW + 30]
            cols.forEach(x => {
                g.fillStyle(C.panel, 1)
                g.fillRoundedRect(x - colW / 2, -h / 2 + 40, colW, h - 80, 24)
            })
            ;[cols[0] + colW / 2 + 15, cols[1] + colW / 2 + 15].forEach(x => {
                g.fillStyle(C.yellow, 1)
                g.fillTriangle(x - 12, -16, x - 12, 16, x + 14, 0)
            })
            const parts: Phaser.GameObjects.GameObject[] = [g]
            const title = (x: number, text: string) =>
                scene.add
                    .text(x, -h / 2 + 84, text, { fontFamily: FONT.black, fontSize: `${SIZE.panelCol}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2)
            parts.push(title(cols[0], PANEL_WORDS.split), title(cols[1], PANEL_WORDS.fix), title(cols[2], PANEL_WORDS.join))
            const small = 0.44
            const spread = order.map((id, k) => ({ id, x: cols[0] + (k - (order.length - 1) / 2) * 88, y: 60 + (k % 2) * 80 }))
            spread.forEach(p => {
                parts.push(
                    scene.add
                        .sprite(p.x, p.y + 40, MODULES, MOD_FRAME[p.id].off)
                        .setOrigin(0.5, MODULE_ART[p.id].bottom / MOD_CELL)
                        .setScale(small * 0.8),
                )
            })
            order.forEach((id, k) => {
                const x = cols[1] + (k - (order.length - 1) / 2) * 90
                const y = 110
                parts.push(scene.add.sprite(x, y, MODULES, MOD_FRAME[id].on).setOrigin(0.5, MODULE_ART[id].bottom / MOD_CELL).setScale(small * 0.8))
                const check = scene.add.graphics()
                check.fillStyle(C.mint, 1)
                check.fillCircle(x + 26, y - 96, 15)
                check.lineStyle(5, C.white, 1)
                check.beginPath()
                check.moveTo(x + 19, y - 96)
                check.lineTo(x + 24, y - 90)
                check.lineTo(x + 33, y - 102)
                check.strokePath()
                parts.push(check)
            })
            let bottom = 200
            order.forEach(id => {
                const a = MODULE_ART[id]
                bottom += a.seat * small
                parts.push(scene.add.sprite(cols[2], bottom, MODULES, MOD_FRAME[id].on).setOrigin(0.5, a.bottom / MOD_CELL).setScale(small))
                bottom -= (a.bottom - a.top) * small
            })
            box = scene.add.container(PANEL.x, -h, parts).setDepth(DEPTH.finale)
            await FX.to(scene, box, { y: PANEL.y }, { duration: 640, ease: Ease.back(1.3) })
        },
        destroy() {
            box?.destroy()
            box = undefined
        },
    }
}
