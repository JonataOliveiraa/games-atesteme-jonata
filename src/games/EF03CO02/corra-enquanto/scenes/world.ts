import Phaser from 'phaser'
import { DEPTH, GROUND_Y, H, ROBOT_X, W, WORLD } from '../data/layout'
import { C } from '../data/theme'
import { FLAG_FRAME, SIGNAL_BOX, SIGNAL_FRAME } from '../data/rules'
import type { SignalId } from '../types'

interface Drop {
    x: number
    y: number
    len: number
    vy: number
}

/**
 * Cada condição aparece do jeito dela. A chuva é o próprio clima — molha a
 * tela inteira e escurece o dia; o semáforo e a lâmpada são coisas plantadas
 * na beira da pista. Nenhuma delas vira selo de canto.
 */
const PROP: Record<SignalId, { x: number; y: number; h: number; post?: boolean } | null> = {
    chuva: null,
    /** O poste do semáforo já chega no chão sozinho. */
    semaforo: { x: 1024, y: GROUND_Y + 14, h: 292 },
    /** A lâmpada é objeto solto: quem a planta no chão é o poste do §paintShade. */
    luz: { x: 1012, y: GROUND_Y - 148, h: 152, post: true },
}

const GROUND = GROUND_Y + 14

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

    const flagFull = 200 / SIGNAL_BOX[FLAG_FRAME].h
    const flag = hasSignals
        ? scene.add
              .image(
                  W + 400,
                  GROUND_Y + 14 + flagFull * (1 - SIGNAL_BOX[FLAG_FRAME].base),
                  'sinais',
                  FLAG_FRAME,
              )
              .setOrigin(0.5, 1)
              .setDisplaySize(flagFull, flagFull)
              .setDepth(DEPTH.prop)
        : null

    const shade = scene.add.graphics().setDepth(DEPTH.prop - 1)
    const prop = hasSignals
        ? scene.add.image(0, 0, 'sinais', 2).setOrigin(0.5, 1).setDepth(DEPTH.prop).setVisible(false)
        : null
    const propText = hasSignals
        ? null
        : scene.add
              .text(1010, GROUND_Y - 60, '', {
                  fontFamily: '"Arial Black", Arial',
                  fontSize: '34px',
                  color: '#1f2a37',
              })
              .setOrigin(0.5)
              .setDepth(DEPTH.prop)

    /** O dia fecha quando chove. É a mudança mais visível do jogo. */
    const gloom = scene.add
        .rectangle(W / 2, WORLD.top + WORLD.h / 2, W, WORLD.h, 0x2b4b6b, 0)
        .setDepth(DEPTH.rain - 1)

    const shock = scene.add.graphics().setDepth(DEPTH.prop + 2).setAlpha(0)
    shock.lineStyle(12, C.white, 1)
    shock.strokeCircle(0, 0, 120)

    const flash = scene.add
        .rectangle(W / 2, WORLD.top + WORLD.h / 2, W, WORLD.h, C.white, 0)
        .setDepth(DEPTH.rain + 1)

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

    const paintShade = (spot: { x: number; y: number; post?: boolean } | null) => {
        shade.clear()
        if (!spot) return

        shade.fillStyle(C.ink, 0.18)
        shade.fillEllipse(spot.x, GROUND - 6, spot.post ? 120 : 150, 30)

        if (!spot.post) return

        // um poste: pé no asfalto, haste, e o bocal onde a lâmpada rosqueia
        const top = spot.y - 10

        shade.fillStyle(C.ink, 1)
        shade.fillRoundedRect(spot.x - 36, GROUND - 24, 72, 26, 11)
        shade.fillRoundedRect(spot.x - 13, top, 26, GROUND - top - 14, 9)
        shade.fillStyle(C.steelDark, 1)
        shade.fillRoundedRect(spot.x - 29, GROUND - 19, 58, 16, 8)
        shade.fillRoundedRect(spot.x - 8, top + 5, 16, GROUND - top - 24, 6)
        shade.fillStyle(C.steel, 1)
        shade.fillRoundedRect(spot.x - 5, top + 9, 5, GROUND - top - 34, 3)

        shade.fillStyle(C.ink, 1)
        shade.fillRoundedRect(spot.x - 23, top - 10, 46, 22, 8)
        shade.fillStyle(C.steelDark, 1)
        shade.fillRoundedRect(spot.x - 18, top - 6, 36, 12, 5)
    }

    const announce = (x: number, y: number) => {
        shock.setPosition(x, y).setAlpha(0.9).setScale(0.6)
        scene.tweens.killTweensOf(shock)
        scene.tweens.add({
            targets: shock,
            alpha: 0,
            scale: 2.1,
            duration: 560,
            ease: 'Cubic.easeOut',
        })
        flash.setAlpha(0.45)
        scene.tweens.killTweensOf(flash)
        scene.tweens.add({ targets: flash, alpha: 0, duration: 340, ease: 'Cubic.easeOut' })
    }

    return {
        setSignal(id: SignalId, on: boolean, loud = false) {
            signal = id
            raining = id === 'chuva' && on

            const spot = PROP[id]
            const frame = on ? SIGNAL_FRAME[id].on : SIGNAL_FRAME[id].off

            if (prop) {
                if (spot) {
                    const box = SIGNAL_BOX[frame]
                    const full = spot.h / SIGNAL_BOX[SIGNAL_FRAME[id].off].h
                    prop.setVisible(true).setFrame(frame)
                    prop.setDisplaySize(full, full)
                    prop.setPosition(spot.x, spot.y + full * (1 - box.base))
                } else {
                    prop.setVisible(false)
                }
            }
            paintShade(spot)
            propText?.setText(spot ? (on ? 'ACESA' : 'APAGADA') : '')

            scene.tweens.killTweensOf(gloom)
            scene.tweens.add({
                targets: gloom,
                alpha: raining ? 0.3 : 0,
                duration: loud ? 420 : 0,
            })

            if (!raining) rain.clear()

            if (!loud) return
            announce(spot ? spot.x : W / 2, spot ? spot.y - spot.h * 0.55 : WORLD.top + 130)
            if (spot && prop) {
                scene.tweens.killTweensOf(prop)
                scene.tweens.add({
                    targets: prop,
                    scale: { from: prop.scale * 1.18, to: prop.scale },
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
            scene.tweens.killTweensOf(shock)
            scene.tweens.killTweensOf(flash)
            scene.tweens.killTweensOf(gloom)
            if (prop) scene.tweens.killTweensOf(prop)
            shock.destroy()
            flash.destroy()
            gloom.destroy()
            shade.destroy()
            scenery.destroy()
            flag?.destroy()
            prop?.destroy()
            propText?.destroy()
            rain.destroy()
        },
    }
}

export type World = ReturnType<typeof createWorld>

export const worldBottom = H
