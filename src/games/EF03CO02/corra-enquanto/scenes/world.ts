import Phaser from 'phaser'
import { DEPTH, GROUND_Y, H, ROBOT_X, SIGNAL, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { FLAG_FRAME, SIGNAL_FRAME } from '../data/rules'
import type { SignalId } from '../types'

interface Drop {
    x: number
    y: number
    len: number
    vy: number
}

export function createWorld(scene: Phaser.Scene) {
    const hasBackground = scene.textures.exists('fundo')
    const hasSignals = scene.textures.exists('sinais')

    let scenery: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Graphics

    if (hasBackground) {
        const tile = scene.add
            .tileSprite(0, WORLD.top, W, WORLD.h, 'fundo')
            .setOrigin(0, 0)
            .setDepth(DEPTH.world)
        tile.tileScaleX = WORLD.scale
        tile.tileScaleY = WORLD.scale
        scenery = tile
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.world)
        g.fillStyle(C.sky, 1)
        g.fillRect(0, WORLD.top, W, 250)
        g.fillStyle(0x87bc62, 1)
        g.fillRect(0, WORLD.top + 250, W, 61)
        g.fillStyle(0x6b7280, 1)
        g.fillRect(0, WORLD.top + 311, W, WORLD.h - 311)
        scenery = g
    }

    const flag = hasSignals
        ? scene.add
              .image(W + 400, GROUND_Y + 12, 'sinais', FLAG_FRAME)
              .setOrigin(0.5, 1)
              .setDisplaySize(210, 210)
              .setDepth(DEPTH.prop)
        : null

    const badge = scene.add.graphics().setDepth(DEPTH.prop)
    const icon = hasSignals
        ? scene.add
              .image(SIGNAL.x, SIGNAL.y, 'sinais', 0)
              .setDisplaySize(SIGNAL.size, SIGNAL.size)
              .setDepth(DEPTH.prop + 1)
        : null
    const iconText = hasSignals
        ? null
        : scene.add
              .text(SIGNAL.x, SIGNAL.y, '', {
                  fontFamily: '"Arial Black", Arial',
                  fontSize: '40px',
                  color: '#1f2a37',
              })
              .setOrigin(0.5)
              .setDepth(DEPTH.prop + 1)

    const r = SIGNAL.size / 2
    const paintBadge = () => {
        badge.clear()
        badge.fillStyle(C.ink, 0.2)
        badge.fillCircle(5, 10, r + 16)
        badge.fillStyle(C.ink, 1)
        badge.fillCircle(0, 0, r + 16)
        badge.fillStyle(C.cream, 1)
        badge.fillCircle(0, 0, r + 6)
        badge.fillStyle(C.white, 0.8)
        badge.fillEllipse(-18, -r + 16, SIGNAL.size * 0.6, 22)
        badge.setPosition(SIGNAL.x, SIGNAL.y)
    }

    paintBadge()
    badge.setAlpha(0)
    if (icon) icon.setAlpha(0)

    const shock = scene.add.graphics().setDepth(DEPTH.prop + 2).setAlpha(0)
    shock.lineStyle(12, C.white, 1)
    shock.strokeCircle(0, 0, SIGNAL.size / 2 + 20)
    shock.setPosition(SIGNAL.x, SIGNAL.y)

    const flash = scene.add
        .rectangle(W / 2, WORLD.top + WORLD.h / 2, W, WORLD.h, C.white, 0)
        .setDepth(DEPTH.rain + 1)

    const announce = () => {
        shock.setAlpha(0.9).setScale(0.7)
        scene.tweens.killTweensOf(shock)
        scene.tweens.add({
            targets: shock,
            alpha: 0,
            scale: 1.9,
            duration: 560,
            ease: 'Cubic.easeOut',
        })
        flash.setAlpha(0.5)
        scene.tweens.killTweensOf(flash)
        scene.tweens.add({ targets: flash, alpha: 0, duration: 320, ease: 'Cubic.easeOut' })
        scene.tweens.add({
            targets: badge,
            scale: { from: 1.16, to: 1 },
            duration: 420,
            ease: 'Back.easeOut',
        })
    }

    const rain = scene.add.graphics().setDepth(DEPTH.rain)
    const drops: Drop[] = Array.from({ length: 90 }, () => ({
        x: Math.random() * W,
        y: WORLD.top + Math.random() * WORLD.h,
        len: 16 + Math.random() * 22,
        vy: 620 + Math.random() * 340,
    }))

    let raining = false
    let signal: SignalId = 'chuva'
    let goal = 1
    let traveled = 0

    const place = () => {
        if (!flag) return
        flag.setX(ROBOT_X + (goal - traveled))
    }

    return {
        setSignal(id: SignalId, on: boolean, loud = false) {
            signal = id
            raining = id === 'chuva' && on
            const frame = on ? SIGNAL_FRAME[id].on : SIGNAL_FRAME[id].off
            if (icon) {
                scene.tweens.killTweensOf(icon)
                icon.setFrame(frame)
                icon.setDisplaySize(SIGNAL.size, SIGNAL.size)
            }
            iconText?.setText(on ? 'LIGADO' : 'PARADO')
            if (!raining) rain.clear()
            if (loud) announce()
        },

        /** O selo entra quando o laço começa a rodar, e some na hora de escolher. */
        setBadgeVisible(value: boolean) {
            scene.tweens.killTweensOf(badge)
            const targets = icon ? [badge, icon] : [badge]
            scene.tweens.add({
                targets,
                alpha: value ? 1 : 0,
                duration: 260,
                ease: 'Cubic.easeOut',
            })
            if (value) {
                badge.setScale(0.8)
                scene.tweens.add({
                    targets: badge,
                    scale: 1,
                    duration: 420,
                    ease: 'Back.easeOut',
                })
            }
        },

        setGoal(distance: number) {
            goal = distance
            traveled = 0
            place()
        },

        scroll(dx: number) {
            traveled += dx
            if (hasBackground) {
                const tile = scenery as Phaser.GameObjects.TileSprite
                tile.tilePositionX += dx / WORLD.scale
            }
            place()
        },

        get arrived() {
            return traveled >= goal
        },

        get progress() {
            return Math.min(1, traveled / goal)
        },

        tick(dt: number) {
            if (!raining) return
            rain.clear()
            rain.lineStyle(4, C.rain, 0.75)
            for (let i = 0; i < drops.length; i++) {
                const drop = drops[i]
                drop.y += drop.vy * dt
                drop.x -= 90 * dt
                if (drop.y > WORLD.top + WORLD.h) {
                    drop.y = WORLD.top - 20
                    drop.x = Math.random() * W
                }
                if (drop.x < -20) drop.x = W + 20
                rain.lineBetween(drop.x, drop.y, drop.x - 7, drop.y + drop.len)
            }
        },

        signalId() {
            return signal
        },

        destroy() {
            scene.tweens.killTweensOf(icon ?? badge)
            scene.tweens.killTweensOf(shock)
            scene.tweens.killTweensOf(flash)
            shock.destroy()
            flash.destroy()
            scenery.destroy()
            flag?.destroy()
            icon?.destroy()
            iconText?.destroy()
            badge.destroy()
            rain.destroy()
        },
    }
}

export type World = ReturnType<typeof createWorld>

export const worldBottom = H
