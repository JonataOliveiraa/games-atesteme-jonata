import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, POOL, W } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Swimmer } from '../types'
import { POSE, TEX } from './BootScene'

export interface Pool {
    lap(list: Swimmer[], ok: boolean, stumble: number): Promise<void>
    /** Corta a volta em andamento e limpa a água. */
    abort(): void
    destroy(): void
}

export interface PoolOptions {
    onDive(): void
    onWall(): void
    /** Quem está nadando agora, pela posição na fila. */
    onLeg?(index: number | undefined): void
}

/**
 * A perna é lenta de propósito: é aqui que a criança vê a lista sendo
 * executada, e a 0,6 s ninguém acompanhava quem era o 1º e quem vinha depois.
 */
const LEG = 1500
const RIVAL_LEG = { win: 1750, lose: 1150 }

export function createPool(scene: Phaser.Scene, options: PoolOptions): Pool {
    const root = scene.add.container(0, 0).setDepth(DEPTH.water)

    if (scene.textures.exists(TEX.bg)) {
        const bg = scene.add.image(W / 2, H / 2, TEX.bg)
        const cover = Math.max(W / bg.width, H / bg.height)
        bg.setScale(cover)
        root.add(bg)
    } else {
        const sky = scene.add.graphics()
        sky.fillStyle(C.sky, 1)
        sky.fillRect(0, 0, W, POOL.top)
        sky.fillStyle(C.tile, 1)
        sky.fillRect(0, POOL.bottom, W, H - POOL.bottom)
        root.add(sky)
    }

    const water = scene.add.graphics()
    const paintWater = () => {
        water.clear()
        water.fillStyle(C.waterDeep, 0.92)
        water.fillRect(0, POOL.top, W, POOL.bottom - POOL.top)
        water.fillStyle(C.water, 0.9)
        water.fillRect(0, POOL.top + 8, W, POOL.bottom - POOL.top - 16)

        for (const y of [POOL.mineY, POOL.rivalY, POOL.rivalY + POOL.laneH]) {
            for (let x = 12; x < W - 12; x += 36) {
                water.fillStyle(x % 72 === 12 ? C.rope : C.foam, 0.9)
                water.fillCircle(x, y, 7)
            }
        }

        water.fillStyle(C.foam, 0.28)
        water.fillRect(POOL.wallX, POOL.top, W - POOL.wallX, POOL.bottom - POOL.top)
        water.fillStyle(C.ink, A.veil * 0.4)
        water.fillRect(0, POOL.top, POOL.blockX - 40, POOL.bottom - POOL.top)
    }
    paintWater()
    root.add(water)

    const shimmer = scene.add.graphics()
    shimmer.fillStyle(C.foam, 0.18)
    for (let i = 0; i < 26; i++) {
        const y = POOL.top + 20 + Math.random() * (POOL.bottom - POOL.top - 40)
        shimmer.fillRoundedRect(Math.random() * W, y, 60 + Math.random() * 90, 5, 3)
    }
    root.add(shimmer)
    void FX.to(scene, shimmer, { alpha: 0.35 }, { duration: 2600, yoyo: true, repeat: -1 })

    const splash = scene.add.graphics().setDepth(DEPTH.swimmer + 1)

    const makeSwimmer = (laneY: number) => {
        const sprite = scene.textures.exists(TEX.swim)
            ? scene.add.sprite(POOL.blockX, laneY, TEX.swim, POSE.glide)
            : undefined
        if (sprite) {
            sprite.setDisplaySize(180, 142)
            sprite.setDepth(DEPTH.swimmer)
            sprite.setVisible(false)
        }
        return sprite
    }

    const mine = makeSwimmer(POOL.mineY + POOL.laneH / 2)
    const theirs = scene.textures.exists(TEX.rival)
        ? scene.add.sprite(POOL.blockX, POOL.rivalY + POOL.laneH / 2, TEX.rival, 0)
        : undefined
    if (theirs) {
        theirs.setDisplaySize(180, 142)
        theirs.setDepth(DEPTH.swimmer)
        theirs.setVisible(false)
    }

    // O número acompanha quem está nadando: é o que liga a ficha da tira ao
    // corpo dentro da água.
    const badge = scene.add.graphics().setDepth(DEPTH.swimmer + 2).setVisible(false)
    const badgeText = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '34px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.swimmer + 3)
        .setVisible(false)
    badgeText.setStroke(CSS.ink, 6)

    const moveBadge = (x: number, y: number) => {
        badge.clear()
        badge.fillStyle(C.ink, 1)
        badge.fillCircle(x, y, 26)
        badge.fillStyle(C.rope, 1)
        badge.fillCircle(x, y, 21)
        badgeText.setPosition(x, y - 1)
    }

    const blob = (laneY: number, color: number) =>
        scene.add.graphics().setDepth(DEPTH.swimmer).setVisible(false).setData('laneY', laneY).setData('tone', color)

    const mineBlob = blob(POOL.mineY + POOL.laneH / 2, C.card)
    const theirsBlob = blob(POOL.rivalY + POOL.laneH / 2, C.ink)

    const paintBlob = (g: Phaser.GameObjects.Graphics, x: number, color: number) => {
        const y = g.getData('laneY') as number
        g.clear()
        g.fillStyle(color, 1)
        g.fillEllipse(x, y, 108, 54)
        g.fillStyle(C.ink, 0.5)
        g.fillCircle(x + 38, y - 8, 16)
    }

    let column = 0
    const currentFrame = (pose: number) => pose * 6 + column

    let strokeTimer: Phaser.Time.TimerEvent | undefined
    const startStroke = () => {
        strokeTimer?.remove()
        let flip = false
        strokeTimer = scene.time.addEvent({
            delay: 260,
            loop: true,
            callback: () => {
                flip = !flip
                mine?.setFrame(currentFrame(flip ? POSE.strokeA : POSE.strokeB))
                theirs?.setFrame(flip ? 1 : 2)
            },
        })
    }

    const wallSplash = async (x: number, laneY: number) => {
        splash.clear()
        splash.fillStyle(C.foam, 0.9)
        for (let i = 0; i < 7; i++) {
            splash.fillCircle(x - 20 + Math.random() * 40, laneY - 30 + Math.random() * 60, 6 + Math.random() * 10)
        }
        splash.setAlpha(1)
        await FX.to(scene, splash, { alpha: 0 }, { duration: 320 })
    }

    /**
     * A geração da volta. Toda perna confere antes de nadar: uma prova que
     * perdeu a vez para de existir na hora, em vez de continuar nadando por
     * cima do que veio depois.
     */
    let lapGen = 0
    const running: Phaser.Tweens.Tween[] = []

    const clearWater = () => {
        running.splice(0).forEach(tween => tween.stop())
        mine?.setVisible(false)
        theirs?.setVisible(false)
        mineBlob.setVisible(false)
        theirsBlob.setVisible(false)
        badge.setVisible(false)
        badgeText.setVisible(false)
        strokeTimer?.remove()
        strokeTimer = undefined
    }

    const swimLeg = async (gen: number, who: Swimmer | undefined, laneY: number, ms: number, place?: number) => {
        if (gen !== lapGen) return
        const sprite = who ? mine : theirs
        const fallback = who ? mineBlob : theirsBlob
        const tone = who?.color ?? C.ink

        if (sprite) {
            if (who) column = who.frame
            sprite.setPosition(POOL.blockX, laneY)
            sprite.setFrame(who ? currentFrame(POSE.glide) : 0)
            sprite.setVisible(true)
        } else {
            paintBlob(fallback, POOL.blockX, tone)
            fallback.setVisible(true)
        }

        if (place !== undefined) {
            badgeText.setText(`${place}º`)
            moveBadge(POOL.blockX, laneY - 76)
            badge.setVisible(true)
            badgeText.setVisible(true)
        }

        options.onDive()
        const mover = { x: POOL.blockX }
        await new Promise<void>(resolve => {
            const tween = scene.tweens.add({
                targets: mover,
                x: POOL.wallX,
                duration: FX.ms(scene, ms),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    if (sprite) sprite.setX(mover.x)
                    else paintBlob(fallback, mover.x, tone)
                    if (place !== undefined) moveBadge(mover.x, laneY - 76)
                },
                onComplete: () => resolve(),
                onStop: () => resolve(),
            })
            running.push(tween)
        })
        if (gen !== lapGen) return

        options.onWall()
        void wallSplash(POOL.wallX, laneY)
        sprite?.setVisible(false)
        fallback.setVisible(false)
        if (place !== undefined) {
            badge.setVisible(false)
            badgeText.setVisible(false)
        }
    }

    const myRelay = async (gen: number, list: Swimmer[], ok: boolean, stumble: number) => {
        for (let i = 0; i < list.length; i++) {
            if (gen !== lapGen) return
            options.onLeg?.(i)
            if (!ok && i === stumble) {
                await FX.wait(scene, 620)
                if (gen !== lapGen) return
            }
            await swimLeg(gen, list[i], POOL.mineY + POOL.laneH / 2, ok ? LEG : LEG + 260, i + 1)
            await FX.wait(scene, 220)
        }
        if (gen === lapGen) options.onLeg?.(undefined)
    }

    const rivalRelay = async (gen: number, legs: number, ok: boolean) => {
        for (let i = 0; i < legs; i++) {
            if (gen !== lapGen) return
            await swimLeg(gen, undefined, POOL.rivalY + POOL.laneH / 2, ok ? RIVAL_LEG.win : RIVAL_LEG.lose)
        }
    }

    return {
        lap: async (list, ok, stumble) => {
            clearWater()
            const gen = ++lapGen
            startStroke()
            await FX.all(myRelay(gen, list, ok, stumble), rivalRelay(gen, list.length, ok))
            if (gen !== lapGen) return
            clearWater()
        },

        abort: () => {
            lapGen++
            clearWater()
            options.onLeg?.(undefined)
        },
        destroy: () => {
            strokeTimer?.remove()
            badge.destroy()
            badgeText.destroy()
            mine?.destroy()
            theirs?.destroy()
            mineBlob.destroy()
            theirsBlob.destroy()
            splash.destroy()
            root.destroy(true)
        },
    }
}
