import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CONTROL_CELL, CONTROL_SHEET, cellKey } from '../data/files'
import { CONTROLS, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { Rect } from '../types'

export type Pedal = 'gas' | 'brake' | 'pit'
export type PitState = 'off' | 'on' | 'relay'

/** Os pedais (segurar) e o TROCAR PNEU (tocar). Toque múltiplo: cada pedal guarda os dedos que o seguram. */
export interface Controls {
    readonly gas: boolean
    readonly brake: boolean
    setEnabled(on: boolean): void
    visible(on: boolean): void
    setPit(state: PitState): void
    warnBrake(on: boolean): void
    nudgePit(on: boolean): void
    show(which: Pedal, down: boolean): void
    rect(which: Pedal): Rect
    release(): void
    destroy(): void
}

interface Button {
    which: Pedal
    box: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    label: Phaser.GameObjects.Text
    icon: Phaser.GameObjects.Image
    iconY: number
    labelY: number
    zone: Phaser.GameObjects.Zone
    w: number
    h: number
    tone: number
    dark: number
    held: Set<number>
    down: boolean
}

const GAS_KEYS = new Set(['arrowright', 'd', 'arrowup', 'w'])
const BRAKE_KEYS = new Set(['arrowleft', 'a', 'arrowdown', 's'])
const PIT_KEYS = new Set([' ', 'p'])

export function createControls(scene: Phaser.Scene, onPit: () => void): Controls {
    let enabled = false
    let shown = true
    let pitState: PitState = 'off'
    const keys = { gas: false, brake: false }

    const make = (which: Pedal, tone: number, dark: number, text: string): Button => {
        const spec = CONTROLS[which]
        const face = scene.add.graphics()
        const icon = scene.add.image(0, 0, CONTROL_SHEET.key, cellKey(CONTROL_CELL[which]))
        icon.setScale(CONTROLS.icon / Math.max(icon.frame.width, icon.frame.height))
        const label = scene.add
            .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.control}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        if (which === 'pit') {
            icon.setPosition(-spec.w / 2 + 50, -2)
            label.setPosition(26, 0)
        } else {
            icon.setPosition(0, -16)
            label.setPosition(0, spec.h / 2 - 24)
        }
        const box = scene.add.container(spec.x, spec.y, [face, icon, label]).setDepth(DEPTH.controls)
        const zone = scene.add
            .zone(spec.x, spec.y, spec.w + 24, spec.h + 24)
            .setDepth(DEPTH.controls + 1)
            .setInteractive({ useHandCursor: true })
        const b: Button = { which, box, face, label, icon, iconY: icon.y, labelY: label.y, zone, w: spec.w, h: spec.h, tone, dark, held: new Set(), down: false }
        zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!enabled || !shown) return
            if (which === 'pit') {
                void FX.press(scene, box)
                onPit()
                return
            }
            b.held.add(p.id)
            paint(b)
        })
        const up = (p: Phaser.Input.Pointer) => {
            if (!b.held.delete(p.id)) return
            paint(b)
        }
        zone.on('pointerup', up)
        zone.on('pointerout', up)
        return b
    }

    const brake = make('brake', C.brake, C.brakeDark, LABEL.brake)
    const gas = make('gas', C.gas, C.gasDark, LABEL.gas)
    const pit = make('pit', C.pit, C.pitDark, LABEL.pit)
    const buttons = [brake, gas, pit]

    const isDown = (b: Button) => b.held.size > 0 || b.down || (b.which === 'gas' ? keys.gas : b.which === 'brake' ? keys.brake : false)

    function paint(b: Button) {
        const pressed = isDown(b) || (b.which === 'pit' && pitState !== 'off')
        const { w, h } = b
        const lift = pressed ? 2 : 8
        b.face.clear()
        b.face.fillStyle(C.shadow, 0.22)
        b.face.fillRoundedRect(-w / 2 + 3, -h / 2 + 10, w, h, 28)
        b.face.fillStyle(b.dark, 1)
        b.face.fillRoundedRect(-w / 2, -h / 2 + 8 - lift + 8, w, h - 8, 28)
        b.face.fillStyle(pressed ? b.dark : b.tone, 1)
        b.face.fillRoundedRect(-w / 2, -h / 2 + 8 - lift, w, h - 8, 28)
        b.face.fillStyle(C.white, pressed ? 0.15 : 0.35)
        b.face.fillRoundedRect(-w / 2 + 14, -h / 2 + 14 - lift, w - 28, 12, 6)
        b.face.lineStyle(4, C.line, 1)
        b.face.strokeRoundedRect(-w / 2, -h / 2 + 8 - lift, w, h - 8, 28)
        b.icon.setY(b.iconY - lift + 4)
        b.label.setY(b.labelY - lift + 4)
    }

    const paintAll = () => {
        buttons.forEach(b => {
            b.box.setVisible(shown).setAlpha(enabled ? 1 : 0.55)
            if (b.zone.input) b.zone.input.enabled = enabled && shown
            paint(b)
        })
        pit.label.setText(pitState === 'off' ? LABEL.pit : pitState === 'relay' ? LABEL.relayOn : LABEL.pitOn)
        pit.label.setFontSize(pitState === 'off' ? SIZE.control : SIZE.control - 2)
    }

    const onDown = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase()
        if (!enabled || !shown) return
        if (GAS_KEYS.has(k)) keys.gas = true
        else if (BRAKE_KEYS.has(k)) keys.brake = true
        else if (PIT_KEYS.has(k) && !e.repeat) {
            void FX.press(scene, pit.box)
            onPit()
        } else return
        paint(gas)
        paint(brake)
    }
    const onUp = (e: KeyboardEvent) => {
        const k = e.key.toLowerCase()
        if (GAS_KEYS.has(k)) keys.gas = false
        else if (BRAKE_KEYS.has(k)) keys.brake = false
        else return
        paint(gas)
        paint(brake)
    }
    scene.input.keyboard?.on('keydown', onDown)
    scene.input.keyboard?.on('keyup', onUp)
    const globalUp = (p: Phaser.Input.Pointer) => buttons.forEach(b => b.held.delete(p.id) && paint(b))
    scene.input.on('pointerup', globalUp)
    scene.input.on('pointerupoutside', globalUp)

    let warn: Phaser.Tweens.Tween | undefined
    let nudge: Phaser.Tweens.Tween | undefined

    const controls: Controls = {
        get gas() {
            return enabled && isDown(gas) && !isDown(brake)
        },
        get brake() {
            return enabled && isDown(brake)
        },
        setEnabled(on) {
            enabled = on
            if (!on) controls.release()
            paintAll()
        },
        visible(on) {
            shown = on
            if (!on) controls.release()
            paintAll()
        },
        setPit(state) {
            pitState = state
            paintAll()
        },
        warnBrake(on) {
            if (on && !warn) warn = scene.tweens.add({ targets: brake.box, scale: 1.12, duration: 220, yoyo: true, repeat: -1 })
            if (!on && warn) {
                warn.remove()
                warn = undefined
                brake.box.setScale(1)
            }
        },
        nudgePit(on) {
            if (on && !nudge) nudge = scene.tweens.add({ targets: pit.box, angle: 3, duration: 160, yoyo: true, repeat: -1, repeatDelay: 500 })
            if (!on && nudge) {
                nudge.remove()
                nudge = undefined
                pit.box.setAngle(0)
            }
        },
        show(which, down) {
            const b = buttons.find(x => x.which === which)
            if (!b) return
            b.down = down
            paint(b)
        },
        rect(which) {
            const s = CONTROLS[which]
            return { x: s.x, y: s.y, w: s.w + 16, h: s.h + 16 }
        },
        release() {
            keys.gas = false
            keys.brake = false
            buttons.forEach(b => {
                b.held.clear()
                b.down = false
            })
            buttons.forEach(paint)
        },
        destroy() {
            controls.warnBrake(false)
            controls.nudgePit(false)
            scene.input.keyboard?.off('keydown', onDown)
            scene.input.keyboard?.off('keyup', onUp)
            scene.input.off('pointerup', globalUp)
            scene.input.off('pointerupoutside', globalUp)
            buttons.forEach(b => {
                scene.tweens.killTweensOf(b.box)
                b.zone.destroy()
                b.box.destroy()
            })
        },
    }
    paintAll()
    return controls
}
