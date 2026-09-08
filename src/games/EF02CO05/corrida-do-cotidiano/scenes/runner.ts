import Phaser from 'phaser'
import { DEPTH, GROUND_Y, LANE_WX, RUNNER, xOf } from '../data/layout'
import { C } from '../data/theme'
import type { Lane } from '../types'

const FALLBACK = 'ccot-runner'

function ensureFallback(scene: Phaser.Scene) {
    if (scene.textures.exists('corredor') || scene.textures.exists(FALLBACK)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(C.blueDark, 1)
    g.fillRoundedRect(96, 150, 88, 120, 24)
    g.fillStyle(C.gold, 1)
    g.fillRoundedRect(88, 80, 104, 84, 26)
    g.fillStyle(C.woodDark, 1)
    g.fillCircle(140, 62, 46)
    g.generateTexture(FALLBACK, 280, 280)
    g.destroy()
}

export function createRunner(scene: Phaser.Scene, onStep: () => void) {
    const hasSheet = scene.textures.exists('corredor')
    ensureFallback(scene)
    const key = hasSheet ? 'corredor' : FALLBACK

    const laneX = (lane: Lane) => xOf(1, lane === 0 ? -LANE_WX : LANE_WX)

    let lane: Lane = 0
    let frame = 0
    let elapsed = 0
    let ghostGap = 0
    let moving: Phaser.Tweens.Tween | null = null

    const sprite = scene.add
        .sprite(laneX(lane), GROUND_Y, key, 0)
        .setOrigin(0.5, 1)
        .setScale(RUNNER.scale)
        .setDepth(DEPTH.runner)

    const setFrame = (index: number) => {
        if (hasSheet) sprite.setFrame(index)
    }

    const puffs = Array.from({ length: 6 }, () =>
        scene.add.ellipse(0, 0, 26, 12, C.curbDark, 0.6).setDepth(DEPTH.runner - 1).setVisible(false),
    )
    let puffAt = 0

    const ghosts = Array.from({ length: 5 }, () =>
        scene.add
            .sprite(0, GROUND_Y, key, 0)
            .setOrigin(0.5, 1)
            .setDepth(DEPTH.runner - 2)
            .setTint(0xbfe6ff)
            .setVisible(false),
    )
    let ghostAt = 0

    const dust = () => {
        const puff = puffs[puffAt]
        puffAt = (puffAt + 1) % puffs.length
        scene.tweens.killTweensOf(puff)
        puff
            .setVisible(true)
            .setPosition(sprite.x + Phaser.Math.Between(-18, 18), GROUND_Y - 4)
            .setScale(1)
            .setAlpha(0.6)
        scene.tweens.add({
            targets: puff,
            alpha: 0,
            scaleX: 2.1,
            scaleY: 1.7,
            y: GROUND_Y - 26,
            duration: 460,
            ease: 'Cubic.easeOut',
            onComplete: () => puff.setVisible(false),
        })
    }

    const ghost = (strength: number) => {
        const copy = ghosts[ghostAt]
        ghostAt = (ghostAt + 1) % ghosts.length
        scene.tweens.killTweensOf(copy)
        copy
            .setVisible(true)
            .setPosition(sprite.x, sprite.y)
            .setFrame(sprite.frame.name)
            .setScale(RUNNER.scale)
            .setAlpha(0.34 * strength)
        scene.tweens.add({
            targets: copy,
            alpha: 0,
            scale: RUNNER.scale * 0.92,
            duration: 300,
            ease: 'Cubic.easeOut',
            onComplete: () => copy.setVisible(false),
        })
    }

    return {
        get lane() {
            return lane
        },

        get x() {
            return sprite.x
        },

        moveTo(value: Lane) {
            if (lane === value) return
            lane = value
            moving?.stop()
            moving = scene.tweens.add({
                targets: sprite,
                x: laneX(value),
                duration: 240,
                ease: 'Cubic.easeOut',
            })
            scene.tweens.add({
                targets: sprite,
                angle: value === 0 ? -7 : 7,
                duration: 130,
                yoyo: true,
                ease: 'Sine.easeInOut',
            })
        },

        update(dt: number, speed: number, boost = 0) {
            if (speed <= 0) return

            if (boost > 0.08) {
                ghostGap -= dt * 1000
                if (ghostGap <= 0) {
                    ghostGap = 80
                    ghost(boost)
                }
            }

            elapsed += dt * 1000
            const step = Phaser.Math.Clamp(RUNNER.frameMs * (520 / speed), 68, 170)
            while (elapsed >= step) {
                elapsed -= step
                frame = (frame + 1) % 4
                setFrame(frame)
                if (frame === 0 || frame === 2) {
                    dust()
                    onStep()
                }
            }
        },

        stand() {
            elapsed = 0
            setFrame(4)
        },

        cheer() {
            elapsed = 0
            setFrame(5)
        },

        run() {
            frame = 0
            elapsed = 0
            setFrame(0)
        },

        bounds() {
            return {
                x: sprite.x,
                y: GROUND_Y - sprite.displayHeight / 2,
                w: sprite.displayWidth + 40,
                h: sprite.displayHeight + 20,
            }
        },

        destroy() {
            moving?.stop()
            scene.tweens.killTweensOf(sprite)
            puffs.forEach(puff => {
                scene.tweens.killTweensOf(puff)
                puff.destroy()
            })
            ghosts.forEach(copy => {
                scene.tweens.killTweensOf(copy)
                copy.destroy()
            })
            sprite.destroy()
        },
    }
}

export type Runner = ReturnType<typeof createRunner>
