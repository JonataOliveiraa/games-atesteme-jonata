import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE, PIECES } from '../data/files'
import { TOOLS } from '../data/levels'
import { DEPTH, JOYSTICK, TOOL_BUTTONS } from '../data/layout'
import { C, TOOL_COLOR, TOOL_DARK } from '../data/theme'
import type { Tool, Vec } from '../types'

const KEYS: Record<string, Vec> = {
    ArrowLeft: { x: -1, y: 0 },
    KeyA: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    KeyD: { x: 1, y: 0 },
    ArrowUp: { x: 0, y: -1 },
    KeyW: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    KeyS: { x: 0, y: 1 },
}

export interface Controls {
    readonly vector: Vec
    onTool(fn: (tool: Tool) => void): void
    setEnabled(on: boolean): void
    select(tool: Tool): void
    press(tool: Tool): void
    hint(tool: Tool): Promise<void>
    pushStick(dir: Vec, ms: number): Promise<void>
    destroy(): void
}

export function createControls(scene: Phaser.Scene): Controls {
    let enabled = false
    let selected: Tool = 'blower'
    let toolFn: (tool: Tool) => void = () => {}
    const objects: Phaser.GameObjects.GameObject[] = []

    const stick = { x: 0, y: 0 }
    let grabbed: number | null = null
    const held = new Set<string>()

    const base = scene.add.graphics().setDepth(DEPTH.controls)
    base.fillStyle(C.shadow, 0.22)
    base.fillCircle(JOYSTICK.x + 3, JOYSTICK.y + 7, JOYSTICK.r)
    base.fillStyle(C.white, 0.55)
    base.fillCircle(JOYSTICK.x, JOYSTICK.y, JOYSTICK.r)
    base.lineStyle(5, C.ink, 1)
    base.strokeCircle(JOYSTICK.x, JOYSTICK.y, JOYSTICK.r)
    base.lineStyle(3, C.ink, 0.35)
    base.strokeCircle(JOYSTICK.x, JOYSTICK.y, JOYSTICK.r * 0.55)
    ;[0, 1, 2, 3].forEach(k => {
        const a = (k * Math.PI) / 2
        const tipX = JOYSTICK.x + Math.cos(a) * (JOYSTICK.r - 14)
        const tipY = JOYSTICK.y + Math.sin(a) * (JOYSTICK.r - 14)
        const side = a + Math.PI / 2
        base.fillStyle(C.ink, 0.45)
        base.fillTriangle(
            tipX,
            tipY,
            tipX - Math.cos(a) * 16 + Math.cos(side) * 11,
            tipY - Math.sin(a) * 16 + Math.sin(side) * 11,
            tipX - Math.cos(a) * 16 - Math.cos(side) * 11,
            tipY - Math.sin(a) * 16 - Math.sin(side) * 11,
        )
    })
    const knob = scene.add.graphics().setDepth(DEPTH.controls + 1)
    knob.fillStyle(C.shadow, 0.25)
    knob.fillCircle(2, 6, JOYSTICK.knob)
    knob.fillStyle(C.pink, 1)
    knob.fillCircle(0, 0, JOYSTICK.knob)
    knob.lineStyle(5, C.ink, 1)
    knob.strokeCircle(0, 0, JOYSTICK.knob)
    knob.fillStyle(C.white, 0.45)
    knob.fillCircle(-14, -14, 14)
    knob.setPosition(JOYSTICK.x, JOYSTICK.y)
    objects.push(base, knob)

    const setStick = (dx: number, dy: number) => {
        const len = Math.hypot(dx, dy)
        const max = JOYSTICK.r
        const k = len > max ? max / len : 1
        stick.x = (dx * k) / max
        stick.y = (dy * k) / max
        knob.setPosition(JOYSTICK.x + dx * k, JOYSTICK.y + dy * k)
    }

    const release = () => {
        grabbed = null
        stick.x = 0
        stick.y = 0
        scene.tweens.killTweensOf(knob)
        void FX.to(scene, knob, { x: JOYSTICK.x, y: JOYSTICK.y }, { duration: 120 })
    }

    const onDown = (p: Phaser.Input.Pointer) => {
        if (!enabled || grabbed !== null) return
        if (Phaser.Math.Distance.Between(p.x, p.y, JOYSTICK.x, JOYSTICK.y) > JOYSTICK.grab) return
        grabbed = p.id
        scene.tweens.killTweensOf(knob)
        setStick(p.x - JOYSTICK.x, p.y - JOYSTICK.y)
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id !== grabbed) return
        setStick(p.x - JOYSTICK.x, p.y - JOYSTICK.y)
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id === grabbed) release()
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)

    const onKeyDown = (event: KeyboardEvent) => {
        if (KEYS[event.code]) held.add(event.code)
    }
    const onKeyUp = (event: KeyboardEvent) => {
        held.delete(event.code)
    }
    scene.input.keyboard?.on('keydown', onKeyDown)
    scene.input.keyboard?.on('keyup', onKeyUp)

    const ring = new Map<Tool, Phaser.GameObjects.Graphics>()
    const boxes = new Map<Tool, Phaser.GameObjects.Container>()

    const paintRing = (tool: Tool, glow = false) => {
        const g = ring.get(tool)!
        g.clear()
        const on = tool === selected
        if (glow) {
            g.fillStyle(C.hint, 0.9)
            g.fillCircle(0, 0, TOOL_BUTTONS.r + 18)
        }
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(2, 7, TOOL_BUTTONS.r)
        if (on) {
            g.fillStyle(C.white, 1)
            g.fillCircle(0, 0, TOOL_BUTTONS.r + 10)
            g.lineStyle(5, C.ink, 1)
            g.strokeCircle(0, 0, TOOL_BUTTONS.r + 10)
        }
        g.fillStyle(on ? TOOL_COLOR[tool] : TOOL_DARK[tool], 1)
        g.fillCircle(0, 0, TOOL_BUTTONS.r)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(0, 0, TOOL_BUTTONS.r)
    }

    TOOLS.forEach(tool => {
        const g = scene.add.graphics()
        ring.set(tool, g)
        const icon = scene.add.image(0, 0, PIECES, PIECE[tool]).setScale(TOOL_BUTTONS.icon)
        const box = scene.add.container(TOOL_BUTTONS.x, TOOL_BUTTONS.y[tool], [g, icon]).setDepth(DEPTH.controls)
        boxes.set(tool, box)
        const zone = scene.add
            .zone(TOOL_BUTTONS.x, TOOL_BUTTONS.y[tool], TOOL_BUTTONS.hit, TOOL_BUTTONS.hit)
            .setDepth(DEPTH.controls + 2)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled) return
            void FX.press(scene, box)
            toolFn(tool)
        })
        objects.push(box, zone)
        paintRing(tool)
    })

    const halo = scene.add.graphics().setDepth(DEPTH.controls + 1)
    halo.lineStyle(11, C.ink, 1)
    halo.strokeCircle(0, 0, TOOL_BUTTONS.r + 17)
    halo.lineStyle(7, C.hint, 1)
    halo.strokeCircle(0, 0, TOOL_BUTTONS.r + 17)
    scene.tweens.add({ targets: halo, alpha: 0.2, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    objects.push(halo)

    const layout = () => {
        TOOLS.forEach(tool => {
            const box = boxes.get(tool)!
            box.x = TOOL_BUTTONS.x - (tool === selected ? 8 : 0)
            box.setAlpha(enabled ? 1 : 0.75)
            paintRing(tool)
            if (tool === selected) halo.setPosition(box.x, box.y)
        })
        base.setAlpha(enabled ? 1 : 0.75)
    }

    return {
        get vector() {
            if (grabbed !== null) {
                const len = Math.hypot(stick.x, stick.y)
                return len < JOYSTICK.dead ? { x: 0, y: 0 } : { x: stick.x, y: stick.y }
            }
            const v = { x: 0, y: 0 }
            held.forEach(code => {
                v.x += KEYS[code].x
                v.y += KEYS[code].y
            })
            const len = Math.hypot(v.x, v.y)
            return len > 1 ? { x: v.x / len, y: v.y / len } : v
        },
        onTool(fn) {
            toolFn = fn
        },
        setEnabled(on) {
            enabled = on
            if (!on && grabbed !== null) release()
            if (!on) held.clear()
            layout()
        },
        select(tool) {
            selected = tool
            layout()
        },
        press(tool) {
            void FX.press(scene, boxes.get(tool)!)
        },
        async hint(tool) {
            const box = boxes.get(tool)!
            for (let k = 0; k < 3; k++) {
                paintRing(tool, true)
                await FX.to(scene, box, { scale: 1.15 }, { duration: 160 })
                paintRing(tool)
                await FX.to(scene, box, { scale: 1 }, { duration: 140 })
            }
            paintRing(tool)
        },
        async pushStick(dir, ms) {
            scene.tweens.killTweensOf(knob)
            await FX.to(scene, knob, { x: JOYSTICK.x + dir.x * JOYSTICK.r, y: JOYSTICK.y + dir.y * JOYSTICK.r }, { duration: 160 })
            await FX.wait(scene, ms)
            await FX.to(scene, knob, { x: JOYSTICK.x, y: JOYSTICK.y }, { duration: 140 })
        },
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            scene.input.keyboard?.off('keydown', onKeyDown)
            scene.input.keyboard?.off('keyup', onKeyUp)
            scene.tweens.killTweensOf(halo)
            objects.forEach(o => o.destroy())
        },
    }
}
