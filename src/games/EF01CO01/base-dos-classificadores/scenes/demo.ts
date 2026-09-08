import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import { W, H, SKIP } from '../data/layout'
import { paintTouchRing, paintSkipButton } from './effects'

export interface DemoOptions {
    stone: Phaser.GameObjects.Sprite
    basket: Phaser.GameObjects.Sprite
    sign: Phaser.GameObjects.Container
    tone: number
    rounds?: number
    onPick?: () => void
    onDrop?: () => void
    onSkip?: () => void
}

export async function runVisualDemo(scene: Phaser.Scene, o: DemoOptions) {
    const { stone, basket, sign } = o
    const homeX = stone.x
    const homeY = stone.y
    const homeScale = stone.scale
    const stoneDepth = stone.depth
    const basketDepth = basket.depth
    const signDepth = sign.depth

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0).setDepth(100)
    stone.setDepth(120)
    basket.setDepth(118)
    sign.setDepth(118)

    const hand = scene.add.graphics().setDepth(130).setPosition(homeX, homeY).setAlpha(0)
    paintTouchRing(hand)

    const skipG = scene.add.graphics().setPosition(SKIP.cx, SKIP.cy).setDepth(132).setAlpha(0)
    paintSkipButton(skipG, SKIP.r)

    let skipped = false
    let release: () => void = () => {}
    const skipSignal = new Promise<void>(resolve => { release = resolve })
    const step = <T>(job: Promise<T>) => Promise.race([job, skipSignal])

    const skipZone = scene.add.zone(SKIP.cx, SKIP.cy, SKIP.r * 2.6, SKIP.r * 2.6)
        .setDepth(133)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            if (skipped) return
            skipped = true
            o.onSkip?.()
            FX.press(scene, skipG)
            release()
        })

    await step(FX.to(scene, veil, { fillAlpha: 0.55 }, { duration: 320 }))
    void FX.popIn(scene, skipG, { from: 0, duration: 300 }).then(() => {
        if (!skipped) FX.breathe(scene, skipG, { grow: 1.09, duration: 820 })
    })

    const rounds = o.rounds ?? 2
    for (let i = 0; i < rounds && !skipped; i += 1) {
        hand.setPosition(homeX, homeY).setScale(1).setAlpha(0)
        await step(FX.popIn(scene, hand, { from: 0, duration: 260 }))
        if (skipped) break

        await step(FX.to(scene, hand, { scale: 0.72 }, { duration: 130 }))
        if (skipped) break
        o.onPick?.()
        FX.ping(scene, homeX, homeY, o.tone, { radius: 84 })
        await step(FX.to(scene, hand, { scale: 1 }, { duration: 160, ease: Ease.back(2.4) }))
        if (skipped) break

        FX.ping(scene, sign.x, sign.y, o.tone, { radius: 110 })
        await step(FX.wait(scene, 460))
        if (skipped) break

        await step(FX.to(scene, stone, { scale: homeScale * 1.16 }, { duration: 180 }))
        if (skipped) break
        basket.setFrame(1)

        const mouthX = basket.x
        const mouthY = basket.y - 34
        await step(FX.all(
            FX.arcTo(scene, stone, { x: mouthX, y: mouthY }, { height: 130, duration: 780 }),
            FX.arcTo(scene, hand, { x: mouthX, y: mouthY + 28 }, { height: 130, duration: 780 }),
        ))
        if (skipped) break

        basket.setFrame(2)
        o.onDrop?.()
        await step(FX.to(scene, stone, { scale: homeScale * 0.2, alpha: 0 }, { duration: 260 }))
        if (skipped) break

        FX.sparks(scene, mouthX, mouthY, { color: o.tone, count: 18, spread: 150 })
        FX.impact(scene, basket, 0.18)
        await step(FX.to(scene, hand, { alpha: 0, scale: 0.6 }, { duration: 220 }))
        if (skipped) break

        await step(FX.wait(scene, 260))
        if (skipped) break
        basket.setFrame(0)

        stone.setPosition(homeX, homeY).setScale(homeScale * 0.4).setAlpha(1)
        await step(FX.to(scene, stone, { scale: homeScale }, { duration: 300, ease: Ease.back(2.2) }))
        if (skipped) break
        await step(FX.wait(scene, 320))
    }

    FX.kill(scene, [stone, hand, skipG])
    skipZone.destroy()
    skipG.destroy()
    hand.destroy()

    stone.setPosition(homeX, homeY).setScale(homeScale).setAlpha(1).setDepth(stoneDepth)
    basket.setDepth(basketDepth).setFrame(0)
    sign.setDepth(signDepth)

    await FX.to(scene, veil, { fillAlpha: 0 }, { duration: 260 })
    veil.destroy()
}
