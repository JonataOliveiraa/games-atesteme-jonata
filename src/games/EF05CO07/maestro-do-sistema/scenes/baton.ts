import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import { ICON, TEX } from './BootScene'

export interface Baton {
    /** O arco do maestro: chega, dá a batida e sai. */
    swingTo(x: number, y: number): Promise<void>
    /** O cutucão: um arquinho pequeno na direção de quem está esperando vez. */
    nudge(x: number, y: number): Promise<void>
    show(x: number, y: number, scale?: number): void
    hide(): void
    destroy(): void
}

export function createBaton(scene: Phaser.Scene): Baton {
    const root = scene.add.container(0, 0).setDepth(DEPTH.baton).setAlpha(0)

    if (scene.textures.exists(TEX.icons)) {
        const art = scene.add.sprite(0, 0, TEX.icons, ICON.baton)
        art.setDisplaySize(170, 170)
        art.setOrigin(0.22, 0.78)
        root.add(art)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 0.28)
        g.fillRoundedRect(-4, -4, 128, 16, 8)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-6, -10, 126, 14, 7)
        g.fillStyle(C.woodDark, 1)
        g.fillRoundedRect(-22, -14, 40, 22, 11)
        g.setAngle(-28)
        root.add(g)
    }

    const fly = async (x: number, y: number, hard: boolean) => {
        FX.kill(scene, root)
        root.setPosition(x - 170, y + 190).setAngle(-64).setScale(0.62).setAlpha(0)
        await FX.all(
            FX.to(scene, root, { alpha: 1, scale: 1 }, { duration: 170 }),
            FX.to(scene, root, { x: x - 64, y: y + 66, angle: -34 }, {
                duration: 270, ease: 'Sine.easeOut',
            }),
        )
        await FX.to(scene, root, { angle: hard ? -6 : -20 }, {
            duration: hard ? 120 : 200, ease: 'Back.easeOut',
        })
        if (hard) void FX.sparks(scene, x, y, { color: C.gold, count: 12 })
        await FX.to(scene, root, { alpha: 0, scale: 0.8, x: x - 140, y: y + 150 }, { duration: 280 })
    }

    return {
        swingTo: (x, y) => fly(x, y, true),
        nudge: (x, y) => fly(x, y, false),

        show: (x, y, scale = 1) => {
            FX.kill(scene, root)
            root.setPosition(x, y).setAngle(-30).setScale(scale).setAlpha(1)
            void FX.to(scene, root, { angle: -14 }, {
                duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
            })
        },

        hide: () => {
            FX.kill(scene, root)
            root.setAlpha(0)
        },

        destroy: () => {
            FX.kill(scene, root)
            root.destroy(true)
        },
    }
}
