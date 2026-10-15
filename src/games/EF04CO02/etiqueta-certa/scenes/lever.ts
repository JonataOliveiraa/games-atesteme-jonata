import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PART, TRACK_SHEET } from '../data/files'
import { DEPTH, LEVER, RIM, W } from '../data/layout'
import type { MapDef } from '../data/maps'
import { fitRimmed, shadowOf } from './art'
import type { Rect } from './board'
import type { Cam } from './camera'

export interface Levers {
    readonly states: number[]
    set(states: number[], animate?: boolean): Promise<void>
    /** k = índice da alavanca */
    onFlip(cb: (k: number, state: number) => void): void
    setEnabled(on: boolean): void
    /** retângulo no MUNDO */
    rect(k: number): Rect
    destroy(): void
}

interface Unit {
    x: number
    y: number
    hitY: number
    base: Phaser.GameObjects.Image
    handle: Phaser.GameObjects.Image
    /** as sombras no chão; a do cabo gira junto com ele */
    shadows: Phaser.GameObjects.Image[]
    zone: Phaser.GameObjects.Zone
}

const angleOf = (state: number) => (state === 0 ? LEVER.tilt : -LEVER.tilt)

export function createLevers(scene: Phaser.Scene, map: MapDef, cam: Cam): Levers {
    const states = map.switches.map(() => 0)
    const tapOnDown = map.width <= W
    let enabled = false
    let flip: (k: number, state: number) => void = () => {}
    let pressed: { k: number; id: number } | null = null

    const units: Unit[] = map.switches.map(({ lever }) => {
        const base = fitRimmed(scene, TRACK_SHEET, PART.leverBase, LEVER.base, RIM).setPosition(lever.x, lever.y).setDepth(DEPTH.lever)
        const handle = fitRimmed(scene, TRACK_SHEET, PART.leverHandle, LEVER.handle, RIM, 1)
            .setPosition(lever.x, lever.y)
            .setDepth(DEPTH.lever + 0.5)
            .setAngle(angleOf(0))
        const shadows = [base, handle].map(part => shadowOf(scene, part).setDepth(DEPTH.shadow))
        const hitY = lever.y - LEVER.handle / 2 + LEVER.base / 4
        const zone = scene.add
            .zone(lever.x, hitY, LEVER.hitW, LEVER.hitH)
            .setDepth(DEPTH.lever + 1)
            .setInteractive({ useHandCursor: true })
        return { x: lever.x, y: lever.y, hitY, base, handle, shadows, zone }
    })

    const turn = (k: number, to: number, animate: boolean) => {
        states[k] = to
        const arms = [units[k].handle, units[k].shadows[1]]
        scene.tweens.killTweensOf(arms)
        if (!animate) {
            arms.forEach(arm => arm.setAngle(angleOf(to)))
            return Promise.resolve()
        }
        return FX.to(scene, arms, { angle: angleOf(to) }, { duration: 220, ease: 'Back.easeOut' })
    }

    const flipTo = (k: number, to: number) => {
        if (!enabled || to === states[k]) return
        void turn(k, to, true)
        flip(k, to)
    }

    units.forEach((unit, k) => {
        unit.zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (tapOnDown) flipTo(k, 1 - states[k])
            else pressed = { k, id: pointer.id }
        })
        unit.zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const was = pressed
            pressed = null
            if (tapOnDown || !was || was.k !== k || was.id !== pointer.id || cam.dragging) return
            flipTo(k, 1 - states[k])
        })
    })

    const release = () => {
        pressed = null
    }
    scene.input.on(Phaser.Input.Events.POINTER_UP, release)

    const nearest = () => {
        if (units.length === 1) return 0
        const center = cam.centerX()
        let best = -1
        let gap = Infinity
        units.forEach((unit, k) => {
            const d = Math.abs(unit.x - center)
            if (d <= W / 2 && d < gap) {
                gap = d
                best = k
            }
        })
        return best
    }

    const onKey = (e: KeyboardEvent) => {
        const up = e.code === 'KeyW' || e.code === 'ArrowUp'
        const down = e.code === 'KeyS' || e.code === 'ArrowDown'
        if (!up && !down) return
        const k = nearest()
        if (k >= 0) flipTo(k, up ? 0 : 1)
    }
    scene.input.keyboard?.on('keydown', onKey)

    return {
        get states() {
            return states.slice()
        },
        async set(next, animate = false) {
            await FX.all(...units.map((_, k) => turn(k, next[k] ?? 0, animate)))
        },
        onFlip(cb) {
            flip = cb
        },
        setEnabled(on) {
            enabled = on
            if (!on) pressed = null
        },
        rect(k) {
            const unit = units[k]
            return { x: unit.x, y: unit.hitY, w: LEVER.hitW, h: LEVER.hitH }
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            scene.input.off(Phaser.Input.Events.POINTER_UP, release)
            units.forEach(unit => {
                scene.tweens.killTweensOf([unit.handle, ...unit.shadows])
                unit.shadows.forEach(shadow => shadow.destroy())
                unit.zone.destroy()
                unit.handle.destroy()
                unit.base.destroy()
            })
        },
    }
}
