import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ICON, iconRef } from '../data/files'
import { DEPTH, TOOLBOX } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TOOL_NAME } from '../data/words'
import type { Rect, Tool, Vec } from '../types'
import type { Audio } from './audio'

export interface Toolbox {
    show(): Promise<void>
    hide(): Promise<void>
    setEnabled(on: boolean): void
    select(tool: Tool | null): void
    posOf(tool: Tool): Vec
    rect(): Rect
    destroy(): void
}

const TOOLS: { tool: Tool; icon: number }[] = [
    { tool: 'lanca', icon: ICON.spear },
    { tool: 'vara', icon: ICON.rod },
    { tool: 'sonar', icon: ICON.phone },
]

const DEPTH_BOX = (DEPTH.badge + DEPTH.tap) / 2
const LIFT = 10
const DROP = 220

export function createToolbox(scene: Phaser.Scene, audio: Audio, onPick: (tool: Tool) => void): Toolbox {
    const { w, h } = TOOLBOX
    let enabled = false
    let shown = false
    let current: Tool | null = null
    let moving = false

    const paint = (g: Phaser.GameObjects.Graphics, on: boolean) => {
        g.clear()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 12, w, h, 22)
        g.fillStyle(on ? C.fishBtnDark : C.creamDark, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 22)
        g.fillStyle(on ? C.cream : C.white, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        if (on) {
            g.lineStyle(6, C.yes, 1)
            g.strokeRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6, 20)
        }
    }

    const buttons = TOOLS.map((t, i) => {
        const g = scene.add.graphics()
        paint(g, false)
        const ref = iconRef(t.icon)
        const icon = scene.add.image(0, -h / 2 + 14 + TOOLBOX.icon / 2, ref.key, ref.frame).setDisplaySize(TOOLBOX.icon, TOOLBOX.icon)
        const label = scene.add
            .text(0, h / 2 - 28, TOOL_NAME[t.tool], { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink, align: 'center' })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add
            .container(TOOLBOX.xs[i], TOOLBOX.y + DROP, [g, icon, label])
            .setDepth(DEPTH_BOX)
            .setAlpha(0)
            .setVisible(false)
        const zone = scene.add
            .zone(TOOLBOX.xs[i], TOOLBOX.y, w + 10, h + 16)
            .setDepth(DEPTH_BOX + 1)
            .setInteractive({ useHandCursor: true })
        if (zone.input) zone.input.enabled = false
        zone.on('pointerdown', () => press(i))
        return { ...t, g, box, zone }
    })

    const restY = (tool: Tool) => TOOLBOX.y - (tool === current ? LIFT : 0)

    const sync = () => buttons.forEach(b => b.zone.input && (b.zone.input.enabled = enabled && shown))

    const press = (index: number) => {
        if (!enabled || !shown) return
        const b = buttons[index]
        if (!b) return
        audio.click()
        void FX.press(scene, b.box)
        onPick(b.tool)
    }

    const onKey = (event: KeyboardEvent) => {
        const n = Number(event.key)
        if (n >= 1 && n <= buttons.length) press(n - 1)
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        async show() {
            if (shown) return
            shown = true
            moving = true
            sync()
            await FX.all(
                ...buttons.map((b, i) => {
                    scene.tweens.killTweensOf(b.box)
                    b.box.setVisible(true)
                    return FX.to(scene, b.box, { y: TOOLBOX.y, alpha: 1 }, { duration: 380, delay: i * 90, ease: 'Back.easeOut' })
                }),
            )
            moving = false
            if (shown) buttons.forEach(b => b.box.setY(restY(b.tool)))
        },
        async hide() {
            if (!shown) return
            shown = false
            moving = true
            sync()
            await FX.all(
                ...buttons.map(b => {
                    scene.tweens.killTweensOf(b.box)
                    return FX.to(scene, b.box, { y: TOOLBOX.y + DROP, alpha: 0 }, { duration: 260 })
                }),
            )
            moving = false
            if (!shown) buttons.forEach(b => b.box.setVisible(false))
        },
        setEnabled(on) {
            enabled = on
            sync()
        },
        select(tool) {
            current = tool
            buttons.forEach(b => {
                paint(b.g, b.tool === tool)
                if (shown && !moving) void FX.to(scene, b.box, { y: restY(b.tool) }, { duration: 180 })
            })
        },
        posOf(tool) {
            const i = Math.max(0, buttons.findIndex(b => b.tool === tool))
            return { x: TOOLBOX.xs[i], y: TOOLBOX.y }
        },
        rect: () => ({
            x: TOOLBOX.xs[0] - w / 2 - 12,
            y: TOOLBOX.y - h / 2 - LIFT - 12,
            w: TOOLBOX.xs[TOOLBOX.xs.length - 1] - TOOLBOX.xs[0] + w + 24,
            h: h + LIFT + 32,
        }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            buttons.forEach(b => {
                scene.tweens.killTweensOf(b.box)
                b.zone.destroy()
                b.box.destroy()
            })
        },
    }
}
