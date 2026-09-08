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
    const w = options.w ?? CREW.plaqueW
    const h = options.h ?? CREW.plaqueH
    const iconSize = options.icon ?? CREW.plaqueIcon
    const r = CREW.plaqueR

    const root = scene.add.container(options.x, options.y)
    const bg = scene.add.graphics()
    const icon = commandIcon(scene, options.command, iconSize)
    root.add([bg, icon])

    let state: PlaqueState = 'off'

    const paint = () => {
        const fill = state === 'on' ? def.color : state === 'dead' ? C.grey : C.cream
        const edge = state === 'on' ? C.white : state === 'dead' ? C.greyDark : C.creamEdge

        bg.clear()
        bg.fillStyle(C.ink, 0.26)
        bg.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, r)
        bg.fillStyle(C.ink, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        bg.fillStyle(fill, 1)
        bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, r - 5)
        bg.fillStyle(C.white, state === 'on' ? 0.42 : 0.28)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 10, w - 28, h * 0.24, r * 0.4)
        bg.lineStyle(4, edge, 1)
        bg.strokeRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, r - 5)

        if ('setTint' in icon) {
            if (state === 'dead') icon.setTint(C.greyDark)
            else icon.clearTint()
        }
        icon.setAlpha(state === 'dead' ? 0.55 : 1)
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
