import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI } from '../data/files'
import { CONTROLS, DEPTH } from '../data/layout'
import { BIT_COLOR, C, FONT, SIZE, inkOn } from '../data/theme'
import type { Bit } from '../types'
import { piece, slice } from './art'

export type Rect = { x: number; y: number; w: number; h: number }

export interface Controls {
    onPress(cb: (bit: Bit) => void): void
    setEnabled(on: boolean): void
    /** o painel só aparece dentro do fio */
    setShown(on: boolean): Promise<void>
    /** só o desenho do toque: a demonstração usa isto */
    show(bit: Bit): void
    ring(bit: Bit): Promise<void>
    rect(): Rect
    destroy(): void
}

const KEYS: Record<string, Bit> = { '1': '1', w: '1', W: '1', ArrowUp: '1', '0': '0', s: '0', S: '0', ArrowDown: '0' }
const Y: Record<Bit, number> = { '1': CONTROLS.one, '0': CONTROLS.zero }

export function createControls(scene: Phaser.Scene): Controls {
    let enabled = false
    let listener: ((bit: Bit) => void) | undefined
    const panel = slice(scene, CONTROLS.x, CONTROLS.panelY, UI.panel, CONTROLS.panelW, CONTROLS.panelH, 56, 0.5)
    const root = scene.add.container(0, 0, [panel]).setDepth(DEPTH.controls).setAlpha(0)
    const buttons = {} as Record<Bit, Phaser.GameObjects.Container>
    const zones: Phaser.GameObjects.Zone[] = []

    ;(['1', '0'] as Bit[]).forEach(bit => {
        const art = piece(scene, bit === '1' ? UI.one : UI.zero, CONTROLS.size)
        const label = scene.add
            .text(0, -6, bit, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: inkOn(BIT_COLOR[bit]) })
            .setOrigin(0.5)
            .setResolution(2)
        const box = scene.add.container(CONTROLS.x, Y[bit], [art, label])
        root.add(box)
        buttons[bit] = box
        const zone = scene.add
            .zone(CONTROLS.x, Y[bit], CONTROLS.hit, CONTROLS.hit)
            .setDepth(DEPTH.controls + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => fire(bit))
        zones.push(zone)
    })

    const press = (bit: Bit) => {
        const box = buttons[bit]
        scene.tweens.killTweensOf(box)
        box.setScale(1)
        void FX.to(scene, box, { scale: 0.88 }, { duration: 70, yoyo: true })
    }

    const fire = (bit: Bit) => {
        if (!enabled) return
        press(bit)
        listener?.(bit)
    }

    const onKey = (event: KeyboardEvent) => {
        if (event.repeat) return
        const bit = KEYS[event.key]
        if (!bit) return
        event.preventDefault?.()
        fire(bit)
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
        async ring(bit) {
            const p = buttons[bit]
            await FX.ping(scene, p.x, p.y, C.white, { radius: CONTROLS.size * 0.75, duration: 520, depth: DEPTH.controls + 2 })
        },
        rect: () => ({ x: CONTROLS.x, y: CONTROLS.panelY, w: CONTROLS.panelW + 16, h: CONTROLS.panelH + 16 }),
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            zones.forEach(z => z.destroy())
            root.destroy()
        },
    }
}
