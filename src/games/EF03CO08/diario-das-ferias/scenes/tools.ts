import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL } from '../data/files'
import { ACTION, DEPTH, METER, TOOLS } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { ACTION_LABEL, TOOL_LABEL } from '../data/words'
import type { Tool } from '../types'
import { uiImage } from './art'
import type { Rect } from './guide'

/**
 * FOTO e SOM sacam (e guardam) a ferramenta. Com uma delas na mão aparece o
 * botão grande de agir: CLIQUE! (obturador) ou GRAVAR. O microfone tem um
 * medidor embaixo que mexe ao vivo com o som que está na mira.
 */
export interface Tools {
    setHeld(tool: Tool | null): void
    setEnabled(tool: Tool, on: boolean): void
    setActionEnabled(on: boolean): void
    /** volume ao vivo do microfone, de 0 a 1 */
    level(value: number, delta: number): void
    /** grava: barrinhas com o som, ou a linha reta do silêncio */
    record(hear: boolean, ms: number): Promise<void>
    rect(tool: Tool): Rect
    actionRect(): Rect
    meterRect(): Rect
    destroy(): void
}

const BARS = 22

export function createTools(scene: Phaser.Scene, handlers: { onTool(tool: Tool): void; onAction(): void }): Tools {
    const on: Record<Tool, boolean> = { photo: true, sound: true }
    let actionOn = true
    let held: Tool | null = null
    const parts: Phaser.GameObjects.GameObject[] = []

    // ── FOTO e SOM

    const buttons = (['photo', 'sound'] as Tool[]).map(tool => {
        const at = TOOLS[tool]
        const rim = scene.add.graphics()
        const art = uiImage(scene, tool === 'photo' ? UI_CELL.photo : UI_CELL.sound, TOOLS.size)
        const label = scene.add
            .text(0, TOOLS.labelDY, TOOL_LABEL[tool], {
                fontFamily: FONT.black,
                fontSize: `${SIZE.tool}px`,
                color: CSS.ink,
                stroke: CSS.white,
                strokeThickness: 7,
            })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(at.x, at.y, [rim, art, label]).setDepth(DEPTH.controls)
        const zone = scene.add
            .zone(at.x, at.y + 14, TOOLS.size + 20, TOOLS.size + 50)
            .setDepth(DEPTH.controls + 2)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!on[tool]) return
            void FX.press(scene, box)
            handlers.onTool(tool)
        })
        parts.push(box, zone)
        return { tool, box, rim, zone }
    })

    const paintButtons = () =>
        buttons.forEach(b => {
            const active = held === b.tool
            const s = TOOLS.size / 2 + 7
            b.rim.clear()
            b.rim.fillStyle(active ? C.accent : C.white, 1)
            b.rim.fillRoundedRect(-s - (active ? 5 : 0), -s - (active ? 5 : 0), (s + (active ? 5 : 0)) * 2, (s + (active ? 5 : 0)) * 2, 44)
            scene.tweens.killTweensOf(b.box)
            b.box.setScale(1)
            scene.tweens.add({ targets: b.box, y: TOOLS[b.tool].y - (active ? 12 : 0), duration: 200, ease: 'Back.easeOut' })
            b.box.setAlpha(on[b.tool] || active ? 1 : 0.4)
        })
    paintButtons()

    // ── o botão de agir

    const actionArt = scene.add.graphics()
    const actionText = scene.add
        .text(0, ACTION.labelDY, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.tool}px`,
            color: CSS.ink,
            stroke: CSS.white,
            strokeThickness: 7,
        })
        .setOrigin(0.5)
        .setResolution(2)
    const action = scene.add.container(ACTION.x, ACTION.y, [actionArt, actionText]).setDepth(DEPTH.controls).setVisible(false)
    const actionZone = scene.add
        .zone(ACTION.x, ACTION.y + 14, ACTION.r * 2 + 30, ACTION.r * 2 + 60)
        .setDepth(DEPTH.controls + 2)
        .setInteractive({ useHandCursor: true })
    actionZone.input!.enabled = false
    actionZone.on('pointerdown', () => fire())
    parts.push(action, actionZone)

    const paintAction = (tool: Tool) => {
        const r = ACTION.r
        actionArt.clear()
        actionArt.fillStyle(C.shadow, 0.25)
        actionArt.fillCircle(3, 7, r)
        actionArt.fillStyle(C.white, 1)
        actionArt.fillCircle(0, 0, r)
        actionArt.lineStyle(5, C.ink, 1)
        actionArt.strokeCircle(0, 0, r)
        if (tool === 'photo') {
            actionArt.lineStyle(6, C.ink, 0.85)
            actionArt.strokeCircle(0, 0, r - 14)
            actionArt.fillStyle(C.cream, 1)
            actionArt.fillCircle(0, 0, r - 20)
            actionArt.fillStyle(C.peach, 1)
            actionArt.fillCircle(0, 0, r - 34)
            actionArt.fillStyle(C.white, 0.6)
            actionArt.fillEllipse(-12, -14, 26, 16)
        } else {
            actionArt.fillStyle(C.coral, 1)
            actionArt.fillCircle(0, 0, r - 16)
            actionArt.lineStyle(4, C.coralDark, 1)
            actionArt.strokeCircle(0, 0, r - 16)
            actionArt.fillStyle(C.white, 0.5)
            actionArt.fillEllipse(-14, -16, 24, 14)
        }
        actionText.setText(ACTION_LABEL[tool])
    }

    const fire = () => {
        if (!held || !actionOn) return
        void FX.press(scene, action)
        handlers.onAction()
    }

    const onKey = (event: KeyboardEvent) => {
        const key = event.key.toLowerCase()
        if (key === ' ' || key === 'enter') {
            fire()
            return
        }
        const tool: Tool | null = key === 'f' || key === '1' ? 'photo' : key === 'g' || key === '2' ? 'sound' : null
        if (!tool || !on[tool]) return
        const b = buttons.find(x => x.tool === tool)
        if (b) void FX.press(scene, b.box)
        handlers.onTool(tool)
    }
    scene.input.keyboard?.on('keydown', onKey)

    // ── o medidor do microfone

    const meterBg = scene.add.graphics()
    meterBg.fillStyle(C.shadow, 0.2)
    meterBg.fillRoundedRect(-METER.w / 2 + 3, -METER.h / 2 + 5, METER.w, METER.h, 24)
    meterBg.fillStyle(C.cream, 1)
    meterBg.fillRoundedRect(-METER.w / 2, -METER.h / 2, METER.w, METER.h, 24)
    meterBg.lineStyle(4, C.ink, 1)
    meterBg.strokeRoundedRect(-METER.w / 2, -METER.h / 2, METER.w, METER.h, 24)
    const meterIcon = uiImage(scene, UI_CELL.sound, 54).setPosition(-METER.w / 2 + 40, 0)
    const recDot = scene.add.graphics()
    const bars = scene.add.graphics()
    const meter = scene.add.container(METER.x, METER.y, [meterBg, meterIcon, bars, recDot]).setDepth(DEPTH.controls).setAlpha(0)
    parts.push(meter)

    let clock = 0
    let live = 0
    let recording = false
    const heights = new Array(BARS).fill(0)
    const paintBars = () => {
        bars.clear()
        const left = -METER.w / 2 + 84
        const gap = (METER.w - 108) / BARS
        for (let i = 0; i < BARS; i++) {
            const h = Math.max(5, heights[i] * (METER.h - 22))
            bars.fillStyle(recording ? C.coralDark : C.mintDark, 1)
            bars.fillRoundedRect(left + i * gap, -h / 2, gap * 0.62, h, 3)
        }
    }
    const wiggle = (amount: number) => {
        for (let i = 0; i < BARS; i++) {
            const wave = Math.abs(Math.sin(clock / 90 + i * 1.7) * Math.cos(clock / 140 + i * 0.6))
            const target = 0.06 + amount * (0.3 + 0.7 * wave)
            heights[i] += (target - heights[i]) * 0.35
        }
        paintBars()
    }
    paintBars()

    return {
        setHeld(tool) {
            held = tool
            paintButtons()
            scene.tweens.killTweensOf([action, meter])
            if (tool) {
                paintAction(tool)
                action.setVisible(true)
                void FX.popIn(scene, action, { from: 0.4, duration: 320 })
            } else action.setVisible(false)
            if (actionZone.input) actionZone.input.enabled = !!tool && actionOn
            scene.tweens.add({ targets: meter, alpha: tool === 'sound' ? 1 : 0, duration: 220 })
        },
        setEnabled(tool, value) {
            on[tool] = value
            const b = buttons.find(x => x.tool === tool)
            if (!b) return
            b.box.setAlpha(value || held === tool ? 1 : 0.4)
            if (b.zone.input) b.zone.input.enabled = value
        },
        setActionEnabled(value) {
            actionOn = value
            action.setAlpha(value ? 1 : 0.5)
            if (actionZone.input) actionZone.input.enabled = value && !!held
        },
        level(value, delta) {
            clock += delta
            live = value
            if (!recording && held === 'sound') wiggle(live)
        },
        record(hear, ms) {
            recording = true
            const state = { t: 0 }
            return new Promise<void>(resolve => {
                const blink = scene.tweens.add({
                    targets: state,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    onUpdate: () => {
                        clock += 16
                        recDot.clear()
                        recDot.fillStyle(C.coral, Math.sin(state.t * Math.PI * 6) > 0 ? 1 : 0.25)
                        recDot.fillCircle(METER.w / 2 - 20, -METER.h / 2 + 18, 8)
                        wiggle(hear ? Math.max(0.75, live) : 0)
                    },
                    onComplete: () => done(),
                    onStop: () => done(),
                })
                const done = () => {
                    blink.remove()
                    recording = false
                    recDot.clear()
                    resolve()
                }
            })
        },
        rect(tool) {
            const at = TOOLS[tool]
            return { x: at.x, y: at.y + 14, w: TOOLS.size + 24, h: TOOLS.size + 56 }
        },
        actionRect: () => ({ x: ACTION.x, y: ACTION.y + 18, w: ACTION.r * 2 + 40, h: ACTION.r * 2 + 76 }),
        meterRect: () => ({ x: METER.x, y: METER.y, w: METER.w + 16, h: METER.h + 16 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            parts.forEach(p => {
                scene.tweens.killTweensOf(p)
                p.destroy()
            })
        },
    }
}
