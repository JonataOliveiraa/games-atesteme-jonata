import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CONTROL } from '../data/files'
import { DEPTH, PARK_BTN, PEDALS, WHEEL } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { BUTTON } from '../data/words'
import { controlImage } from './art'

type Rect = { x: number; y: number; w: number; h: number }
type Pedal = 'gas' | 'rev'

const inside = (px: number, py: number, r: { x: number; y: number; w: number; h: number }) =>
    Math.abs(px - r.x) <= r.w / 2 && Math.abs(py - r.y) <= r.h / 2

/**
 * O volante giratório (à esquerda) e os pedais ACELERAR e RÉ (à direita). Cada um segue o
 * próprio dedo, então dá para virar e acelerar ao mesmo tempo.
 */
export function createControls(scene: Phaser.Scene) {
    // ── volante
    const wheel = controlImage(scene, CONTROL.wheel, WHEEL.r * 2).setPosition(WHEEL.x, WHEEL.y).setDepth(DEPTH.controls)
    const turn = { deg: 0 }
    let wheelPointer: number | null = null
    let lastAngle = 0
    let keyHeld = false
    let back: Phaser.Tweens.Tween | undefined
    const paintWheel = () => wheel.setAngle(turn.deg)
    const release = () => {
        back?.remove()
        back = scene.tweens.add({ targets: turn, deg: 0, duration: FX.ms(scene, WHEEL.back), ease: 'Sine.easeOut', onUpdate: paintWheel })
    }

    // ── pedais
    const makePedal = (which: Pedal) => {
        const spec = PEDALS[which]
        const art = controlImage(scene, which === 'gas' ? CONTROL.gas : CONTROL.rev, spec.h)
        const size = art.scale
        const label = scene.add
            .text(0, -spec.h / 2 - 20, BUTTON[which], {
                fontFamily: FONT.black,
                fontSize: '18px',
                color: CSS.ink,
                backgroundColor: '#fff6e4',
                padding: { x: 8, y: 3 },
            })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(spec.x, spec.y, [art, label]).setDepth(DEPTH.controls)
        return { spec, art, size, box }
    }
    const pedals = { gas: makePedal('gas'), rev: makePedal('rev') }
    const held = new Map<number, Pedal>()
    const forced: Record<Pedal, boolean> = { gas: false, rev: false }
    const paintPedals = () => {
        ;(['gas', 'rev'] as Pedal[]).forEach(which => {
            const down = forced[which] || [...held.values()].includes(which)
            const p = pedals[which]
            p.art.setFrame(`c${down ? (which === 'gas' ? CONTROL.gasDown : CONTROL.revDown) : which === 'gas' ? CONTROL.gas : CONTROL.rev}`)
            p.art.setScale(p.size)
        })
    }
    const pedalAt = (px: number, py: number): Pedal | null =>
        inside(px, py, PEDALS.gas) ? 'gas' : inside(px, py, PEDALS.rev) ? 'rev' : null

    // ── estacionar
    const parkArt = controlImage(scene, CONTROL.park, 56).setPosition(0, -14)
    const parkBg = scene.add.graphics()
    parkBg.fillStyle(C.shadow, 0.22)
    parkBg.fillRoundedRect(-PARK_BTN.w / 2 + 4, -PARK_BTN.h / 2 + 7, PARK_BTN.w, PARK_BTN.h, 30)
    parkBg.fillStyle(C.cream, 1)
    parkBg.fillRoundedRect(-PARK_BTN.w / 2, -PARK_BTN.h / 2, PARK_BTN.w, PARK_BTN.h, 30)
    parkBg.lineStyle(5, C.ink, 1)
    parkBg.strokeRoundedRect(-PARK_BTN.w / 2, -PARK_BTN.h / 2, PARK_BTN.w, PARK_BTN.h, 30)
    const parkText = scene.add
        .text(0, 30, BUTTON.park, { fontFamily: FONT.black, fontSize: '22px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const park = scene.add.container(PARK_BTN.x, PARK_BTN.y, [parkBg, parkArt, parkText]).setDepth(DEPTH.controls).setVisible(false)
    let parkShown = false
    let onPark: () => void = () => {}

    let enabled = false

    // ── brilho no controle que está sendo usado (demonstração do tutorial)
    const ring = (x: number, y: number, w: number, h: number, round: number) => {
        const g = scene.add.graphics().setDepth(DEPTH.controls - 1).setVisible(false)
        g.lineStyle(14, C.star, 1)
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, round)
        g.fillStyle(C.glow, 0.5)
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, round)
        return g
    }
    const rings = {
        wheel: ring(WHEEL.x, WHEEL.y, WHEEL.r * 2 + 26, WHEEL.r * 2 + 26, WHEEL.r + 13),
        gas: ring(PEDALS.gas.x, PEDALS.gas.y, PEDALS.gas.w + 22, PEDALS.gas.h + 22, 26),
        rev: ring(PEDALS.rev.x, PEDALS.rev.y, PEDALS.rev.w + 22, PEDALS.rev.h + 22, 26),
    }
    const pulses: Partial<Record<keyof typeof rings, Phaser.Tweens.Tween>> = {}

    const onDown = (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (!enabled || over.length) return
        if (wheelPointer === null && Math.hypot(p.x - WHEEL.x, p.y - WHEEL.y) <= WHEEL.hit) {
            wheelPointer = p.id
            lastAngle = Math.atan2(p.y - WHEEL.y, p.x - WHEEL.x)
            back?.remove()
            return
        }
        const which = pedalAt(p.x, p.y)
        if (which) {
            held.set(p.id, which)
            paintPedals()
            return
        }
        if (parkShown && inside(p.x, p.y, PARK_BTN)) onPark()
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id === wheelPointer) {
            const a = Math.atan2(p.y - WHEEL.y, p.x - WHEEL.x)
            turn.deg = Phaser.Math.Clamp(turn.deg + Phaser.Math.RadToDeg(Phaser.Math.Angle.Wrap(a - lastAngle)), -WHEEL.max, WHEEL.max)
            lastAngle = a
            paintWheel()
            return
        }
        if (held.has(p.id)) {
            const which = pedalAt(p.x, p.y)
            if (which) held.set(p.id, which)
            else held.delete(p.id)
            paintPedals()
        }
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id === wheelPointer) {
            wheelPointer = null
            // no mouse só existe um ponteiro: o volante fica girado para dar tempo de ir ao pedal
            if (p.wasTouch) release()
        }
        if (held.delete(p.id)) paintPedals()
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)

    return {
        /** −1…1: quanto o volante está girado */
        steer() {
            return turn.deg / WHEEL.max
        },
        /** 1 acelerando, −1 de ré, 0 parado */
        throttle() {
            const values = [...held.values()]
            if (values.includes('gas') || forced.gas) return 1
            if (values.includes('rev') || forced.rev) return -1
            return 0
        },
        /** teclado: ←/→ giram o volante; soltar volta ao centro */
        keySteer(dir: number, dt: number) {
            if (!enabled || wheelPointer !== null) return
            if (dir !== 0) {
                keyHeld = true
                back?.remove()
                turn.deg = Phaser.Math.Clamp(turn.deg + dir * 300 * dt, -WHEEL.max, WHEEL.max)
                paintWheel()
            } else if (keyHeld) {
                keyHeld = false
                release()
            }
        },
        setEnabled(on: boolean) {
            enabled = on
            if (!on) {
                held.clear()
                if (wheelPointer !== null) {
                    wheelPointer = null
                    release()
                }
                paintPedals()
            }
            ;[wheel, pedals.gas.box, pedals.rev.box].forEach(o => o.setAlpha(on ? 1 : 0.75))
        },
        /** demonstração: o volante gira sozinho */
        setWheel(deg: number) {
            back?.remove()
            turn.deg = Phaser.Math.Clamp(deg, -WHEEL.max, WHEEL.max)
            paintWheel()
        },
        center() {
            release()
        },
        press(which: Pedal, on: boolean) {
            forced[which] = on
            paintPedals()
        },
        glow(which: 'wheel' | 'gas' | 'rev', on: boolean) {
            pulses[which]?.remove()
            pulses[which] = undefined
            const g = rings[which]
            g.setVisible(on).setAlpha(1)
            if (on) pulses[which] = scene.tweens.add({ targets: g, alpha: 0.6, duration: FX.ms(scene, 420), yoyo: true, repeat: -1 })
        },
        showPark(on: boolean) {
            if (on === parkShown) return
            parkShown = on
            if (on) {
                park.setVisible(true).setScale(0.4)
                void FX.to(scene, park, { scale: 1 }, { duration: 300, ease: 'Back.easeOut' })
            } else park.setVisible(false)
        },
        tapPark() {
            void FX.press(scene, park)
        },
        onPark(fn: () => void) {
            onPark = fn
        },
        wheelRect(): Rect {
            return { x: WHEEL.x, y: WHEEL.y, w: WHEEL.r * 2 + 30, h: WHEEL.r * 2 + 30 }
        },
        pedalRect(): Rect {
            const l = PEDALS.rev.x - PEDALS.rev.w / 2 - 14
            const r = PEDALS.gas.x + PEDALS.gas.w / 2 + 14
            const t = PEDALS.gas.y - PEDALS.gas.h / 2 - 44
            const b = PEDALS.gas.y + PEDALS.gas.h / 2 + 12
            return { x: (l + r) / 2, y: (t + b) / 2, w: r - l, h: b - t }
        },
        parkRect(): Rect {
            return { x: PARK_BTN.x, y: PARK_BTN.y, w: PARK_BTN.w + 24, h: PARK_BTN.h + 24 }
        },
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            back?.remove()
            wheel.destroy()
            pedals.gas.box.destroy()
            pedals.rev.box.destroy()
            park.destroy()
        },
    }
}

export type Controls = ReturnType<typeof createControls>
