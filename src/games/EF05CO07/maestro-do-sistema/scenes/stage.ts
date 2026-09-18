import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, SEAT, STAGE, W } from '../data/layout'
import { C } from '../data/theme'
import { TEX } from './BootScene'

export interface StageView {
    /** Onde os que estão tocando estão, para a luz descer em cima deles. */
    lightOn(xs: number[]): void
    /** Quanto mais gente tocando, mais aberto e dourado fica o palco. */
    setFullness(playing: number): void
    dim(on: boolean): Promise<void>
    destroy(): void
}

export function createStage(scene: Phaser.Scene): StageView {
    if (scene.textures.exists(TEX.stage)) {
        scene.add.image(0, 0, TEX.stage).setOrigin(0, 0).setDisplaySize(W, H).setDepth(DEPTH.bg)
    } else {
        const floor = scene.add.graphics().setDepth(DEPTH.bg)
        floor.fillStyle(C.plum, 1)
        floor.fillRect(0, 0, W, STAGE.floorY)
        floor.fillStyle(C.wood, 1)
        floor.fillRect(0, STAGE.floorY, W, H - STAGE.floorY)
        for (let y = STAGE.floorY; y < H; y += 46) {
            floor.fillStyle(C.woodDark, 0.18)
            floor.fillRect(0, y, W, 3)
        }
        floor.fillStyle(C.curtain, 1)
        floor.fillRect(0, 0, 96, STAGE.floorY)
        floor.fillRect(W - 96, 0, 96, STAGE.floorY)
    }

    const warm = scene.add.graphics().setDepth(DEPTH.spot).setAlpha(0)
    warm.fillStyle(C.gold, 1)
    warm.fillRect(0, STAGE.floorY - 40, W, H - STAGE.floorY + 40)
    warm.setBlendMode(Phaser.BlendModes.ADD)

    const pools = scene.add.graphics().setDepth(DEPTH.spot).setAlpha(0)
    pools.setBlendMode(Phaser.BlendModes.ADD)

    const veil = scene.add.graphics().setDepth(DEPTH.encore - 20).setAlpha(0)
    veil.fillStyle(C.plum, 1)
    veil.fillRect(0, 0, W, H)

    const paintPools = (xs: number[]) => {
        pools.clear()
        xs.forEach(x => {
            pools.fillStyle(C.gold, 0.1)
            pools.fillEllipse(x, SEAT.footY + 14, 300, 96)
            pools.fillStyle(C.gold, 0.14)
            pools.fillEllipse(x, SEAT.footY + 14, 200, 62)
        })
        FX.kill(scene, pools)
        void FX.to(scene, pools, { alpha: xs.length ? 1 : 0 }, { duration: 420 })
    }

    return {
        lightOn: paintPools,

        setFullness: playing => {
            FX.kill(scene, warm)
            void FX.to(scene, warm,
                { alpha: Math.min(0.22, playing * 0.075) },
                { duration: 620, ease: 'Sine.easeInOut' })
        },

        dim: on => FX.to(scene, veil, { alpha: on ? 0.55 : 0 }, { duration: 420 }),

        destroy: () => {
            FX.kill(scene, [warm, pools, veil])
            warm.destroy()
            pools.destroy()
            veil.destroy()
        },
    }
}
