import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { APP_CELL, APP_SHEET, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { APP, DEPTH, TOOLS } from '../data/layout'
import { C, CSS, FONT, MODE_DARK, MODE_TONE, SIZE } from '../data/theme'
import { MODE_LABEL, TOOL_LABEL } from '../data/words'
import type { Mode, Rect, Tool } from '../types'

export interface CameraApp {
    readonly mode: Mode
    setMode(mode: Mode): void
    setTool(tool: Tool, on: boolean): void
    setEnabled(modeOn: boolean, shutterOn: boolean): void
    press(which: 'mode' | 'shutter' | Tool): Promise<void>
    shake(tool: Tool): Promise<void>
    progress(k: number | null): void
    modeRect(): Rect
    shutterRect(): Rect
    toolRect(tool: Tool): Rect
    rect(): Rect
    visible(on: boolean): void
    destroy(): void
}

export interface CameraAppOptions {
    tools: Tool[]
    onToggle: () => void
    onShutter: () => void
    onTool: (tool: Tool) => void
}

const TOOL_KEY: Record<Tool, string> = { light: 'l', zoom: 'z' }

interface ToolButton {
    tool: Tool
    box: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Image
    icon: Phaser.GameObjects.Image
    zone: Phaser.GameObjects.Zone
    on: boolean
}

export function createCameraApp(scene: Phaser.Scene, opts: CameraAppOptions): CameraApp {
    let mode: Mode = 'photo'
    let modeOn = false
    let shutterOn = false
    let recording: number | null = null

    const outlined = (w: number, h: number, r: number) => {
        const g = scene.add.graphics()
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, r)
        g.lineStyle(4, C.ink, 0.9)
        g.strokeRoundedRect(-w / 2 - 7, -h / 2 - 7, w + 14, h + 14, r)
        return g
    }

    const face = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.button)).setDisplaySize(APP.modeW, APP.modeH)
    const rim = scene.add.graphics()
    const icon = scene.add.image(0, APP.iconDY, APP_SHEET.key, cellKey(APP_CELL.camera))
    const label = scene.add
        .text(0, APP.labelDY, '', { fontFamily: FONT.black, fontSize: `${SIZE.mode}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const modeBox = scene.add.container(APP.x, APP.modeY, [outlined(APP.modeW, APP.modeH, 30), face, rim, icon, label]).setDepth(DEPTH.controls)

    const halo = scene.add.circle(0, 0, APP.shutterR + 8, C.white).setStrokeStyle(4, C.ink, 0.9)
    const button = scene.add.image(0, 0, APP_SHEET.key, cellKey(APP_CELL.shutter))
    button.setScale((APP.shutterR * 2) / Math.max(button.frame.width, button.frame.height))
    const ring = scene.add.graphics()
    const shutterBox = scene.add.container(APP.x, APP.shutterY, [halo, button, ring]).setDepth(DEPTH.controls)

    const tools: ToolButton[] = opts.tools.map(tool => {
        const y = TOOLS[tool]
        const s = TOOLS.size
        const toolFace = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.button)).setDisplaySize(s, s)
        const toolIcon = scene.add.image(0, -12, APP_SHEET.key, cellKey(tool === 'light' ? APP_CELL.bulbOff : APP_CELL.lens))
        toolIcon.setScale(48 / Math.max(toolIcon.frame.width, toolIcon.frame.height))
        const toolLabel = scene.add
            .text(0, 28, TOOL_LABEL[tool], { fontFamily: FONT.black, fontSize: '19px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(TOOLS.x, y, [outlined(s, s, 26), toolFace, toolIcon, toolLabel]).setDepth(DEPTH.controls)
        const zone = scene.add.zone(TOOLS.x, y, s + 16, s + 16).setDepth(DEPTH.controls + 2).setInteractive({ useHandCursor: true })
        return { tool, box, face: toolFace, icon: toolIcon, zone, on: false }
    })

    const paint = () => {
        const tone = MODE_TONE[mode]
        face.setTint(tone)
        rim.clear()
        rim.lineStyle(4, MODE_DARK[mode], 1)
        rim.strokeRoundedRect(-APP.modeW / 2 + 3, -APP.modeH / 2 + 3, APP.modeW - 6, APP.modeH - 6, 22)
        icon.setFrame(cellKey(mode === 'photo' ? APP_CELL.camera : APP_CELL.camcorder))
        icon.setScale(56 / Math.max(icon.frame.width, icon.frame.height))
        label.setText(MODE_LABEL[mode]).setScale(1)
        if (label.width > APP.modeW - 20) label.setScale((APP.modeW - 20) / label.width)
        const cell = recording !== null ? APP_CELL.stop : mode === 'photo' ? APP_CELL.shutter : APP_CELL.record
        button.setFrame(cellKey(cell))
        button.setScale((APP.shutterR * 2) / Math.max(button.frame.width, button.frame.height))
        ring.clear()
        if (recording !== null) {
            ring.lineStyle(10, C.red, 1)
            ring.beginPath()
            ring.arc(0, 0, APP.shutterR + 8, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * recording, false)
            ring.strokePath()
        }
        modeBox.setAlpha(modeOn ? 1 : 0.5)
        shutterBox.setAlpha(shutterOn || recording !== null ? 1 : 0.5)
        tools.forEach(t => {
            t.face.setTint(t.on ? C.sun : C.white)
            if (t.tool === 'light') t.icon.setFrame(cellKey(t.on ? APP_CELL.bulbOn : APP_CELL.bulbOff))
            t.icon.setScale((t.on ? 54 : 48) / Math.max(t.icon.frame.width, t.icon.frame.height))
            t.box.setAlpha(modeOn ? 1 : 0.5)
        })
    }

    const modeZone = scene.add.zone(APP.x, APP.modeY, APP.hit + 10, APP.modeH + 30).setDepth(DEPTH.controls + 2).setInteractive({ useHandCursor: true })
    const shutterZone = scene.add.zone(APP.x, APP.shutterY, APP.hit, APP.hit).setDepth(DEPTH.controls + 2).setInteractive({ useHandCursor: true })
    const bump = (box: Phaser.GameObjects.Container) => {
        scene.tweens.killTweensOf(box)
        box.setScale(1)
        return FX.press(scene, box)
    }
    const toggle = () => {
        if (!modeOn) return
        void bump(modeBox)
        opts.onToggle()
    }
    const shoot = () => {
        if (!shutterOn) return
        void bump(shutterBox)
        opts.onShutter()
    }
    const useTool = (t: ToolButton) => {
        if (!modeOn) return
        void bump(t.box)
        opts.onTool(t.tool)
    }
    modeZone.on('pointerdown', toggle)
    shutterZone.on('pointerdown', shoot)
    tools.forEach(t => t.zone.on('pointerdown', () => useTool(t)))
    const onKey = (event: KeyboardEvent) => {
        if (event.repeat) return
        const key = event.key.toLowerCase()
        if (key === 'f') toggle()
        if (event.key === ' ' || event.key === 'Enter') shoot()
        tools.forEach(t => {
            if (key === TOOL_KEY[t.tool]) useTool(t)
        })
    }
    scene.input.keyboard?.on('keydown', onKey)
    scene.input.keyboard?.addCapture('SPACE,ENTER')

    const tapRing = (x: number, y: number, r: number) => {
        const g = scene.add.circle(x, y, r, C.butter, 0).setStrokeStyle(8, C.butter, 1).setDepth(DEPTH.controls + 3)
        return FX.to(scene, g, { scale: 1.35, alpha: 0 }, { duration: 520 }).then(() => g.destroy())
    }
    const toolOf = (tool: Tool) => tools.find(t => t.tool === tool)

    paint()
    return {
        get mode() {
            return mode
        },
        setMode(next) {
            mode = next
            paint()
        },
        setTool(tool, on) {
            const t = toolOf(tool)
            if (t) t.on = on
            paint()
        },
        setEnabled(m, s) {
            modeOn = m
            shutterOn = s
            if (modeZone.input) modeZone.input.enabled = m
            if (shutterZone.input) shutterZone.input.enabled = s
            tools.forEach(t => {
                if (t.zone.input) t.zone.input.enabled = m
            })
            paint()
        },
        async press(which) {
            const t = which === 'mode' || which === 'shutter' ? undefined : toolOf(which)
            const box = which === 'mode' ? modeBox : which === 'shutter' ? shutterBox : t?.box
            if (!box) return
            box.setAlpha(1)
            void tapRing(box.x, box.y, which === 'mode' ? APP.modeW / 2 : which === 'shutter' ? APP.shutterR : TOOLS.size / 2)
            await bump(box)
            await FX.wait(scene, 250)
            paint()
        },
        async shake(tool) {
            const t = toolOf(tool)
            if (!t) return
            scene.tweens.killTweensOf(t.box)
            t.box.setPosition(TOOLS.x, TOOLS[tool]).setAlpha(1)
            await FX.to(scene, t.box, { x: TOOLS.x + 10 }, { duration: 55, yoyo: true, repeat: 5 })
            t.box.setPosition(TOOLS.x, TOOLS[tool])
        },
        progress(k) {
            recording = k
            paint()
        },
        modeRect: () => ({ x: APP.x, y: APP.modeY, w: APP.modeW + 24, h: APP.modeH + 24 }),
        shutterRect: () => ({ x: APP.x, y: APP.shutterY, w: APP.shutterR * 2 + 28, h: APP.shutterR * 2 + 28 }),
        toolRect: tool => ({ x: TOOLS.x, y: TOOLS[tool], w: TOOLS.size + 24, h: TOOLS.size + 24 }),
        rect: () => {
            const top = Math.min(APP.modeY - APP.modeH / 2, ...tools.map(t => TOOLS[t.tool] - TOOLS.size / 2)) - 14
            const bottom = APP.shutterY + APP.shutterR + 14
            const left = tools.length ? TOOLS.x - TOOLS.size / 2 - 14 : APP.x - Math.max(APP.modeW, APP.shutterR * 2) / 2 - 14
            const right = APP.x + Math.max(APP.modeW, APP.shutterR * 2) / 2 + 14
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        visible(on) {
            modeBox.setVisible(on)
            shutterBox.setVisible(on)
            tools.forEach(t => t.box.setVisible(on))
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            scene.input.keyboard?.removeCapture('SPACE,ENTER')
            modeZone.destroy()
            shutterZone.destroy()
            tools.forEach(t => {
                t.zone.destroy()
                scene.tweens.killTweensOf(t.box)
                t.box.destroy()
            })
            scene.tweens.killTweensOf([modeBox, shutterBox])
            modeBox.destroy()
            shutterBox.destroy()
        },
    }
}
