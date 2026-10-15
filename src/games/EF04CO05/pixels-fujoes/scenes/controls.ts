import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI, UI_SHEET, cellKey } from '../data/files'
import { DEPTH, FIRE } from '../data/layout'
import { C } from '../data/theme'
import type { Bit } from '../types'
import { glyph, pixel } from './art'

/**
 * Os botões que mandam o número, no canto de baixo à direita: 0 e 1 lado a lado.
 * Os dois têm a mesma cor: o botão diz só o número, e a cor de cada número está no combinado.
 */
export interface Controls {
    onPress(cb: (value: Bit) => void): void
    setEnabled(on: boolean): void
    setShown(on: boolean): Promise<void>
    /** só o desenho do toque: a demonstração usa isto */
    show(value: Bit): void
    ring(value: Bit): Promise<void>
    destroy(): void
}

const ART = 29

export function createControls(scene: Phaser.Scene, values: Bit[]): Controls {
    let enabled = false
    let listener: ((value: Bit) => void) | undefined
    const k = FIRE.scale
    const size = ART * k
    const lift = -k * 1.5
    const hit = FIRE.hit
    const at = (value: Bit) => ({ x: FIRE.x[value], y: FIRE.y })

    const root = scene.add.container(0, 0).setDepth(DEPTH.controls).setAlpha(0)
    const buttons = new Map<Bit, { box: Phaser.GameObjects.Container; art: Phaser.GameObjects.Image; label: Phaser.GameObjects.Image }>()
    const zones: Phaser.GameObjects.Zone[] = []

    values.forEach(value => {
        const p = at(value)
        const art = pixel(scene, UI_SHEET, UI.button, k)
        const label = glyph(scene, value, 'light', FIRE.digit * 7).setY(lift)
        const box = scene.add.container(p.x, p.y, [art, label])
        root.add(box)
        buttons.set(value, { box, art, label })
        const zone = scene.add.zone(p.x, p.y, hit, hit).setDepth(DEPTH.controls + 1).setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => fire(value))
        zones.push(zone)
    })

    const press = (value: Bit) => {
        const b = buttons.get(value)
        if (!b) return
        b.art.setFrame(cellKey(UI.buttonDown))
        b.label.setY(lift + k * 2)
        scene.time.delayedCall(110, () => {
            if (!b.art.active) return
            b.art.setFrame(cellKey(UI.button))
            b.label.setY(lift)
        })
    }

    const fire = (value: Bit) => {
        if (!enabled) return
        press(value)
        listener?.(value)
    }

    const onKey = (event: KeyboardEvent) => {
        if (event.repeat) return
        const value = values.find(v => v === event.key)
        if (!value) return
        event.preventDefault?.()
        fire(value)
    }
    scene.input.keyboard?.on('keydown', onKey)

    const setEnabled = (on: boolean) => {
        enabled = on
        zones.forEach(z => z.input && (z.input.enabled = on))
    }
    setEnabled(false)

    return {
        onPress(cb) {
            listener = cb
        },
        setEnabled,
        async setShown(on) {
            scene.tweens.killTweensOf(root)
            await FX.to(scene, root, { alpha: on ? 1 : 0 }, { duration: 260 })
        },
        show: press,
        async ring(value) {
            const b = buttons.get(value)?.box
            if (b) await FX.ping(scene, b.x, b.y, C.white, { radius: size * 0.75, duration: 560, depth: DEPTH.controls + 2 })
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            zones.forEach(z => z.destroy())
            root.destroy()
        },
    }
}
