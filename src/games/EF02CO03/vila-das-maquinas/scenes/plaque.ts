import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { COMMANDS } from '../data/machines'
import { CREW } from '../data/layout'
import { C } from '../data/theme'
import type { Command, PlaqueState } from '../types'

const SHEET = 'icones-comandos'

export function commandIcon(scene: Phaser.Scene, command: Command, size: number) {
    const def = COMMANDS[command]

    if (scene.textures.exists(SHEET)) {
        const image = scene.add.image(0, 0, SHEET, def.frame)
        image.setDisplaySize(size, size)
        return image
    }

    const g = scene.add.graphics()
    g.fillStyle(def.color, 1)
    g.fillCircle(0, 0, size * 0.36)
    g.lineStyle(5, C.ink, 1)
    g.strokeCircle(0, 0, size * 0.36)
    return g
}

export interface PlaqueOptions {
    command: Command
    x: number
    y: number
    w?: number
    h?: number
    icon?: number
}

export function createPlaque(scene: Phaser.Scene, options: PlaqueOptions) {
    const def = COMMANDS[options.command]
    const iconSize = options.icon ?? CREW.plaqueIcon

    const root = scene.add.container(options.x, options.y)
    const bg = scene.add.graphics()
    const icon = commandIcon(scene, options.command, iconSize)
    root.add([bg, icon])

    let state: PlaqueState = 'off'

    const radius = iconSize * 0.6

    const paint = () => {
        bg.clear()

        if (state === 'on') {
            bg.fillStyle(C.ink, 0.3)
            bg.fillCircle(0, 6, radius)
            bg.fillStyle(def.color, 1)
            bg.fillCircle(0, 0, radius)
            bg.fillStyle(C.white, 0.34)
            bg.fillEllipse(-radius * 0.3, -radius * 0.42, radius * 0.95, radius * 0.44)
            bg.lineStyle(5, C.white, 1)
            bg.strokeCircle(0, 0, radius)
        } else if (state === 'dead') {
            bg.fillStyle(C.grey, 0.45)
            bg.fillCircle(0, 0, radius * 0.94)
        }

        if ('setTint' in icon) {
            if (state === 'dead') icon.setTint(C.greyDark)
            else icon.clearTint()
        }
        icon.setAlpha(state === 'dead' ? 0.5 : 1)
    }
    paint()

    return {
        root,
        command: options.command,

        get state() {
            return state
        },

        setState(next: PlaqueState) {
            state = next
            paint()
        },

        async light() {
            state = 'on'
            paint()
            void FX.ping(scene, root.x, root.y, def.color, { radius: 74, duration: 460 })
            await FX.to(scene, root, { scale: 1.16 }, { duration: 150, ease: Ease.back(2.4) })
            await FX.to(scene, root, { scale: 1 }, { duration: 130 })
        },

        async fade() {
            state = 'dead'
            paint()
            await FX.to(scene, root, { scale: 0.94 }, { duration: 180, yoyo: true })
        },

        reset() {
            state = 'off'
            paint()
            FX.kill(scene, root)
            root.setScale(1).setAlpha(1)
        },

        destroy() {
            FX.kill(scene, root)
            root.destroy(true)
        },
    }
}

export type Plaque = ReturnType<typeof createPlaque>
