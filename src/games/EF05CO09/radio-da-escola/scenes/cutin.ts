import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DUDA_SHEET, POSE_CELL, cellKey } from '../data/files'
import { CUTIN, DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Pose, Vec } from '../types'
import { baked } from './art'

export interface Cutin {
    flash(pose: Pose): Promise<void>
    enter(pose: Pose): Promise<void>
    pose(p: Pose): void
    leave(): Promise<void>
    head(): Vec
    destroy(): void
}

const STRIPE = 'rde-stripe'

export function createCutin(scene: Phaser.Scene): Cutin {
    baked(scene, STRIPE, 1000, 220, g => {
        g.fillStyle(C.violetDark, 1)
        g.fillPoints(
            [
                { x: 0, y: 40 },
                { x: 1000, y: 0 },
                { x: 1000, y: 180 },
                { x: 0, y: 220 },
            ],
            true,
        )
        g.fillStyle(C.pink, 1)
        g.fillPoints(
            [
                { x: 0, y: 58 },
                { x: 1000, y: 18 },
                { x: 1000, y: 162 },
                { x: 0, y: 202 },
            ],
            true,
        )
        g.fillStyle(C.pinkLight, 0.6)
        for (let x = 40; x < 1000; x += 90) g.fillRect(x, 0, 18, 220)
        g.lineStyle(4, C.ink, 1)
        g.lineBetween(0, 40, 1000, 0)
        g.lineBetween(0, 220, 1000, 180)
    })
    const dim = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 1).setDepth(DEPTH.cutin - 1).setAlpha(0).setVisible(false)
    const stripe = scene.add.image(-600, CUTIN.stripeY, STRIPE).setDepth(DEPTH.cutin).setVisible(false)
    const duda = scene.add.image(-300, CUTIN.waist, DUDA_SHEET.key, cellKey(POSE_CELL.talk)).setOrigin(0.5, 1).setDepth(DEPTH.cutin + 1).setVisible(false)
    const small = CUTIN.height / duda.frame.height
    const big = CUTIN.bigHeight / duda.frame.height
    let size: number = small
    let target: number = CUTIN.x

    let side = -1

    const out = async () => {
        scene.tweens.killTweensOf([stripe, duda, dim])
        const away = side < 0 ? -320 : W + 320
        const stripeAway = side < 0 ? -600 : W + 600
        await FX.all(
            FX.to(scene, duda, { x: away }, { duration: 260, ease: 'Cubic.easeIn' }),
            FX.to(scene, stripe, { x: stripeAway, alpha: 0 }, { duration: 300, ease: 'Cubic.easeIn' }),
            dim.visible ? FX.to(scene, dim, { alpha: 0 }, { duration: 300 }) : Promise.resolve(),
        )
        ;[stripe, duda, dim].forEach(o => o.setVisible(false))
    }

    const cutin: Cutin = {
        async flash(p) {
            scene.tweens.killTweensOf([stripe, duda])
            side = 1
            size = small
            target = W - CUTIN.x
            duda.setFrame(cellKey(POSE_CELL[p])).setScale(size).setPosition(W + 320, CUTIN.waist).setVisible(true)
            stripe.setFlipX(true).setPosition(W + 600, CUTIN.stripeY).setAlpha(1).setVisible(true)
            await FX.all(
                FX.to(scene, stripe, { x: W - 360 }, { duration: 260, ease: 'Cubic.easeOut' }),
                FX.to(scene, duda, { x: target }, { duration: 300, ease: 'Back.easeOut' }),
            )
            await FX.wait(scene, TIMING.cutin)
            await out()
        },
        async enter(p) {
            scene.tweens.killTweensOf([stripe, duda, dim])
            side = -1
            size = big
            target = CUTIN.bigX
            duda.setFrame(cellKey(POSE_CELL[p])).setScale(size).setPosition(-320, H + 10).setVisible(true)
            stripe.setFlipX(false).setPosition(-600, CUTIN.stripeY).setAlpha(1).setVisible(true)
            dim.setVisible(true).setAlpha(0)
            await FX.all(
                FX.to(scene, dim, { alpha: 0.55 }, { duration: 300 }),
                FX.to(scene, stripe, { x: 420 }, { duration: 300, ease: 'Cubic.easeOut' }),
                FX.to(scene, duda, { x: target }, { duration: 380, ease: 'Back.easeOut' }),
            )
        },
        pose(p) {
            duda.setFrame(cellKey(POSE_CELL[p]))
        },
        leave: out,
        head: () => ({ x: target, y: duda.y - CUTIN.bigHeight * 0.68 * (size / big) }),
        destroy() {
            scene.tweens.killTweensOf([stripe, duda, dim])
            stripe.destroy()
            duda.destroy()
            dim.destroy()
            if (scene.textures.exists(STRIPE)) scene.textures.remove(STRIPE)
        },
    }
    return cutin
}
