import Phaser from 'phaser'
import { DEPTH, GROUND_Y, ROBOT_SCALE, ROBOT_X } from '../data/layout'
import { C } from '../data/theme'

const FALLBACK = 'cenq-robo'

function ensureFallback(scene: Phaser.Scene) {
    if (scene.textures.exists('robo') || scene.textures.exists(FALLBACK)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(70, 150, 110, 110, 26)
    g.fillStyle(C.steel, 1)
    g.fillRoundedRect(60, 40, 130, 120, 34)
    g.fillStyle(C.gold, 1)
    g.fillCircle(105, 92, 24)
    g.generateTexture(FALLBACK, 250, 280)
    g.destroy()
}

export function createRobot(scene: Phaser.Scene, onStep: () => void) {
    ensureFallback(scene)
    const hasSheet = scene.textures.exists('robo')
    const key = hasSheet ? 'robo' : FALLBACK

    let frame = 0
    let elapsed = 0

    const sprite = scene.add
        .sprite(ROBOT_X, GROUND_Y, key, 0)
        .setOrigin(0.5, 1)
        .setScale(ROBOT_SCALE)
        .setDepth(DEPTH.robot)

    const setFrame = (index: number) => {
        if (hasSheet) sprite.setFrame(index)
    }

    const trail = scene.add.graphics().setDepth(DEPTH.robot - 1)
    const puffs: { x: number; y: number; r: number; life: number }[] = []

    return {
        get x() {
            return sprite.x
        },

        get top() {
            return GROUND_Y - sprite.displayHeight
        },

        run(dt: number, speed: number) {
            elapsed += dt * 1000
            const step = Phaser.Math.Clamp(120 * (260 / speed), 70, 180)
            while (elapsed >= step) {
                elapsed -= step
                frame = (frame + 1) % 4
                setFrame(frame)
                if (frame === 0 || frame === 2) {
                    onStep()
                    puffs.push({ x: ROBOT_X - 30, y: GROUND_Y - 6, r: 8, life: 1 })
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

        tick(dt: number) {
            trail.clear()
            for (let i = puffs.length - 1; i >= 0; i--) {
                const puff = puffs[i]
                puff.life -= dt * 1.6
                puff.x -= 190 * dt
                puff.r += 26 * dt
                if (puff.life <= 0) {
                    puffs.splice(i, 1)
                    continue
                }
                trail.fillStyle(C.white, 0.4 * puff.life)
                trail.fillCircle(puff.x, puff.y, puff.r)
            }
        },

        bounds() {
            return {
                x: sprite.x,
                y: GROUND_Y - sprite.displayHeight / 2,
                w: sprite.displayWidth + 50,
                h: sprite.displayHeight + 30,
            }
        },

        destroy() {
            scene.tweens.killTweensOf(sprite)
            trail.destroy()
            sprite.destroy()
        },
    }
}

export type Robot = ReturnType<typeof createRobot>
