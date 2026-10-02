import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLOUD, GROUND, SCENERY, SCENERY_UNIT, STREAKS } from '../data/files'
import { DEPTH, H, SIDES, W } from '../data/layout'
import type { Place } from '../types'

type Side = 'left' | 'right'
type Range = { from: number; to: number }

interface Look {
    sides: Record<Side, Range>
    pool: Record<Side, number[]>
    scale: number[]
    turns: number[]
    ground: number
    props: number
    clouds: boolean
    streaks: boolean
    dim: number
}

const SPAWN_Y = -120
const EXIT_Y = H + 120
const GAP = { min: 60, max: 120 } as const
const FADE_MS = 1600

const CLOUDS = { count: 3, speed: 1.9, alpha: 0.55, scale: { min: 0.8, max: 1.3 } } as const
const STREAK = { speed: 2.6, alpha: 0.35 } as const
const DIM_COLOR = 0x1b1446

const OPEN: Record<Side, Range> = { left: { from: 40, to: 340 }, right: SIDES.right }

const LOOKS: Record<Place, Look> = {
    earth: {
        sides: SIDES,
        pool: { left: [0, 1, 2, 3, 4, 8, 9, 0, 1], right: [6, 7, 0, 1, 5, 10, 11, 8, 6, 3] },
        scale: [0.3, 0.32, 0.24, 0.28, 0.28, 0.32, 0.45, 0.45, 0.22, 0.2, 0.32, 0.28],
        turns: [0, 1, 2, 8, 9, 10],
        ground: 1,
        props: 1,
        clouds: true,
        streaks: false,
        dim: 0,
    },
    space: {
        sides: OPEN,
        pool: { left: [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 3, 8], right: [0, 1, 2, 3, 4, 5, 6, 8, 9, 11, 4, 8] },
        scale: [0.36, 0.3, 0.22, 0.24, 0.28, 0.32, 0.4, 0.42, 0.26, 0.26, 0.32, 0.26],
        turns: [3, 4, 6, 7, 8, 9],
        ground: 0.35,
        props: 0.6,
        clouds: false,
        streaks: true,
        dim: 0.42,
    },
    moon: {
        sides: OPEN,
        pool: { left: [0, 1, 2, 3, 4, 5, 7, 8, 11, 1, 3], right: [0, 1, 2, 3, 4, 6, 8, 9, 11, 2, 4] },
        scale: [0.42, 0.26, 0.36, 0.24, 0.26, 0.34, 0.28, 0.32, 0.26, 0.34, 0.38, 0.22],
        turns: [0, 1, 2, 3, 4, 8, 11],
        ground: 1,
        props: 1,
        clouds: false,
        streaks: false,
        dim: 0.38,
    },
}

export interface World {
    readonly place: Place
    setPlace(place: Place, animate: boolean): Promise<void>
    rush(amount: number): void
    scroll(dy: number): void
    destroy(): void
}

export function createWorld(scene: Phaser.Scene, start: Place): World {
    let place = start
    let ground = scene.add.tileSprite(0, 0, W, H, GROUND[place]).setOrigin(0).setDepth(DEPTH.ground)
    const props: { image: Phaser.GameObjects.Image; speed: number }[] = []
    const next: Record<Side, number> = { left: 0, right: 0 }

    const gap = () => Phaser.Math.Between(GAP.min, GAP.max)

    const placeProp = (side: Side, y: number) => {
        const look = LOOKS[place]
        const frame = Phaser.Utils.Array.GetRandom(look.pool[side])
        const x = Phaser.Math.Between(look.sides[side].from, look.sides[side].to)
        const image = scene.add
            .image(x, y, SCENERY[place], frame)
            .setScale(look.scale[frame] * SCENERY_UNIT[place] * Phaser.Math.FloatBetween(0.85, 1.15))
            .setDepth(DEPTH.scenery)
        if (look.turns.includes(frame)) image.setAngle(Phaser.Math.Between(0, 359))
        props.push({ image, speed: look.props })
        return image
    }

    const fill = (alpha: number) => {
        ;(['left', 'right'] as Side[]).forEach(side => {
            for (let y = EXIT_Y - Phaser.Math.Between(0, 80); y > SPAWN_Y; y -= gap()) placeProp(side, y).setAlpha(alpha)
            next[side] = gap()
        })
    }
    fill(1)

    const resetCloud = (cloud: Phaser.GameObjects.Image, y: number) =>
        cloud
            .setPosition(Phaser.Math.Between(0, W), y)
            .setScale(Phaser.Math.FloatBetween(CLOUDS.scale.min, CLOUDS.scale.max))
            .setFlipX(Math.random() < 0.5)

    const clouds = Array.from({ length: CLOUDS.count }, (_, k) =>
        resetCloud(scene.add.image(0, 0, CLOUD).setAlpha(LOOKS[place].clouds ? CLOUDS.alpha : 0).setDepth(DEPTH.clouds), (k * (H + 300)) / CLOUDS.count - 150),
    )
    const streaks = scene.add
        .tileSprite(0, 0, W, H, STREAKS)
        .setOrigin(0)
        .setDepth(DEPTH.clouds)
        .setAlpha(LOOKS[place].streaks ? STREAK.alpha : 0)
    const dim = scene.add.rectangle(0, 0, W, H, DIM_COLOR, LOOKS[place].dim).setOrigin(0).setDepth(DEPTH.scenery + 1)
    let rushing = 0

    return {
        get place() {
            return place
        },
        async setPlace(to, animate) {
            if (to === place) return
            place = to
            const look = LOOKS[to]
            const fresh = scene.add.tileSprite(0, 0, W, H, GROUND[to]).setOrigin(0).setDepth(DEPTH.ground).setAlpha(animate ? 0 : 1)
            const old = ground
            ground = fresh
            if (!animate) {
                old.destroy()
                props.forEach(p => p.image.destroy())
                props.length = 0
                fill(1)
                clouds.forEach(c => c.setAlpha(look.clouds ? CLOUDS.alpha : 0))
                streaks.setAlpha(look.streaks ? STREAK.alpha : 0)
                dim.setFillStyle(DIM_COLOR, look.dim)
                return
            }
            const leaving = props.map(p => p.image)
            leaving.forEach(image => scene.tweens.add({ targets: image, alpha: 0, duration: FADE_MS * 0.6 }))
            await Promise.all([
                FX.to(scene, fresh, { alpha: 1 }, { duration: FADE_MS }),
                FX.to(scene, clouds, { alpha: look.clouds ? CLOUDS.alpha : 0 }, { duration: FADE_MS }),
                FX.to(scene, streaks, { alpha: look.streaks ? STREAK.alpha : 0 }, { duration: FADE_MS }),
            ])
            old.destroy()
            for (let i = props.length - 1; i >= 0; i--) {
                if (!leaving.includes(props[i].image)) continue
                scene.tweens.killTweensOf(props[i].image)
                props[i].image.destroy()
                props.splice(i, 1)
            }
        },
        rush(amount) {
            rushing = Phaser.Math.Clamp(amount, 0, 1)
            streaks.setAlpha(Math.max(LOOKS[place].streaks ? STREAK.alpha : 0, rushing))
        },
        scroll(dy) {
            const look = LOOKS[place]
            ground.tilePositionY -= dy * look.ground
            for (let i = props.length - 1; i >= 0; i--) {
                const p = props[i]
                p.image.y += dy * p.speed
                if (p.image.y > EXIT_Y) {
                    scene.tweens.killTweensOf(p.image)
                    p.image.destroy()
                    props.splice(i, 1)
                }
            }
            ;(['left', 'right'] as Side[]).forEach(side => {
                next[side] -= dy * look.props
                if (next[side] > 0) return
                placeProp(side, SPAWN_Y)
                next[side] = gap()
            })
            clouds.forEach(cloud => {
                cloud.y += dy * CLOUDS.speed
                if (cloud.y > H + 150) resetCloud(cloud, -150)
            })
            streaks.tilePositionY -= dy * STREAK.speed
        },
        destroy() {
            ground.destroy()
            props.forEach(p => p.image.destroy())
            props.length = 0
            clouds.forEach(cloud => cloud.destroy())
            streaks.destroy()
            dim.destroy()
        },
    }
}
