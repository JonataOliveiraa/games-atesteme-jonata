import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { STAGE_KEY, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { DEPTH, H, STAGE, W } from '../data/layout'
import { C } from '../data/theme'
import { baked, fitInto } from './art'

export interface Stage {
    flash(): void
    hearts(count: number): void
    destroy(): void
}

const CONE = 'rde-cone'
const BEAM_ALPHA = 0.16

export function createStage(scene: Phaser.Scene): Stage {
    const bg = scene.add.image(0, 0, STAGE_KEY).setOrigin(0, 0).setDisplaySize(W, H).setDepth(DEPTH.backdrop)
    baked(scene, CONE, 300, 820, g => {
        for (let k = 0; k < 24; k++) {
            const y0 = (820 * k) / 24
            const y1 = (820 * (k + 1)) / 24
            const w0 = 20 + (280 * k) / 24
            const w1 = 20 + (280 * (k + 1)) / 24
            g.fillStyle(0xffffff, 0.9 * (1 - k / 24))
            g.fillPoints(
                [
                    { x: 150 - w0 / 2, y: y0 },
                    { x: 150 + w0 / 2, y: y0 },
                    { x: 150 + w1 / 2, y: y1 },
                    { x: 150 - w1 / 2, y: y1 },
                ],
                true,
            )
        }
    })
    const beams = STAGE.lights.map((light, i) =>
        scene.add
            .image(light.x, light.y, CONE)
            .setOrigin(0.5, 0)
            .setAngle(light.angle)
            .setTint(i ? C.cyan : C.pink)
            .setAlpha(BEAM_ALPHA)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(DEPTH.beams),
    )
    const sweeps = beams.map((beam, i) =>
        scene.tweens.add({
            targets: beam,
            angle: STAGE.lights[i].angle + (i ? 16 : -16),
            duration: 3400 + i * 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        }),
    )
    const stars = STAGE.stars.map((s, i) => {
        const img = fitInto(scene.add.image(s.x, s.y, UI_SHEET.key, cellKey(UI_CELL.star)), 14 + (i % 3) * 6)
        img.setTint([C.white, C.lemonLight, C.pinkLight, C.cyanLight][i % 4]).setDepth(DEPTH.stars).setAlpha(0.35)
        return img
    })
    const twinkles = stars.map((img, i) =>
        scene.tweens.add({
            targets: img,
            alpha: 1,
            scale: img.scale * 1.35,
            duration: 700 + (i % 4) * 160,
            delay: i * 230,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        }),
    )
    const flyers: Phaser.GameObjects.Image[] = []

    return {
        flash() {
            beams.forEach(beam => {
                beam.setAlpha(BEAM_ALPHA * 2.2)
                void FX.to(scene, beam, { alpha: BEAM_ALPHA }, { duration: 260 })
            })
        },
        hearts(count) {
            for (let i = 0; i < count; i++) {
                const left = Math.random() < 0.5
                const x = left ? Phaser.Math.Between(30, 230) : Phaser.Math.Between(1050, 1250)
                const img = fitInto(scene.add.image(x, 680, UI_SHEET.key, cellKey(UI_CELL.heart)), Phaser.Math.Between(22, 34)).setDepth(DEPTH.hearts)
                flyers.push(img)
                void FX.to(scene, img, { y: 680 - Phaser.Math.Between(120, 200), x: x + Phaser.Math.Between(-30, 30), alpha: 0 }, { duration: 1100, delay: i * 90 }).then(() => {
                    const at = flyers.indexOf(img)
                    if (at >= 0) flyers.splice(at, 1)
                    img.destroy()
                })
            }
        },
        destroy() {
            sweeps.forEach(t => t.stop())
            twinkles.forEach(t => t.stop())
            flyers.forEach(f => f.destroy())
            stars.forEach(s => s.destroy())
            beams.forEach(b => b.destroy())
            bg.destroy()
            if (scene.textures.exists(CONE)) scene.textures.remove(CONE)
        },
    }
}
