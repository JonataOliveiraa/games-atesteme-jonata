import Phaser from 'phaser'
import {
    CURB_WX,
    CX,
    DEPTH,
    GRASS_Y,
    H,
    P_ROAD_FAR,
    P_ROAD_NEAR,
    ROAD_HALF_WX,
    STRIPE,
    W,
    pOf,
    xOf,
    yOf,
    zOf,
} from '../data/layout'
import { C } from '../data/theme'
import type { Lane, Mood } from '../types'

const CORNERS = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
]

const quad = (
    g: Phaser.GameObjects.Graphics,
    pFar: number,
    pNear: number,
    wxA: number,
    wxB: number,
) => {
    const yFar = yOf(pFar)
    const yNear = yOf(pNear)
    CORNERS[0].x = xOf(pFar, wxA)
    CORNERS[0].y = yFar
    CORNERS[1].x = xOf(pFar, wxB)
    CORNERS[1].y = yFar
    CORNERS[2].x = xOf(pNear, wxB)
    CORNERS[2].y = yNear
    CORNERS[3].x = xOf(pNear, wxA)
    CORNERS[3].y = yNear
    g.fillPoints(CORNERS, true)
}

const CLOUDS = [
    { x: 150, y: 96, s: 1, drift: 0.05 },
    { x: 470, y: 58, s: 0.62, drift: 0.03 },
    { x: 760, y: 126, s: 0.8, drift: 0.06 },
    { x: 1080, y: 74, s: 1.1, drift: 0.04 },
    { x: 1260, y: 150, s: 0.7, drift: 0.07 },
]

const P_STRIPE_MIN = 0.13

export function createTrack(scene: Phaser.Scene, mood: Mood) {
    const extras: Phaser.GameObjects.Graphics[] = []

    const sky = scene.add.graphics().setDepth(DEPTH.sky)
    sky.fillGradientStyle(mood.sky, mood.sky, mood.skyLow, mood.skyLow, 1)
    sky.fillRect(0, 0, W, GRASS_Y + 8)

    const sun = scene.add.graphics().setDepth(DEPTH.sky + 1).setPosition(1108, 116)
    sun.fillStyle(mood.sun, 0.2)
    sun.fillCircle(0, 0, 96)
    sun.fillStyle(mood.sun, 0.3)
    sun.fillCircle(0, 0, 68)
    sun.fillStyle(mood.sun, 1)
    sun.fillCircle(0, 0, 44)

    const rays = scene.add.graphics().setDepth(DEPTH.sky).setPosition(1108, 116).setAlpha(0.3)
    rays.fillStyle(mood.sun, 1)
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        rays.fillTriangle(
            Math.cos(a) * 56, Math.sin(a) * 56,
            Math.cos(a + 0.1) * 150, Math.sin(a + 0.1) * 150,
            Math.cos(a - 0.1) * 150, Math.sin(a - 0.1) * 150,
        )
    }
    scene.tweens.add({ targets: rays, rotation: Math.PI * 2, duration: 90000, repeat: -1 })
    scene.tweens.add({ targets: sun, scale: 1.04, duration: 3200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    const hills = scene.add.graphics().setDepth(DEPTH.grass - 1)
    hills.fillStyle(mood.hill, 0.55)
    for (let i = 0; i < 7; i++) hills.fillEllipse(i * 220 - 60, GRASS_Y - 6, 360, 92)
    hills.fillStyle(C.grassDark, 0.85)
    for (let i = 0; i < 9; i++) hills.fillEllipse(i * 170 + 40, GRASS_Y, 300, 64)

    const clouds = CLOUDS.map(spot => {
        const g = scene.add.graphics().setDepth(DEPTH.sky + 2).setAlpha(0.92)
        g.fillStyle(C.cloud, 1)
        g.fillEllipse(0, 0, 128 * spot.s, 52 * spot.s)
        g.fillEllipse(-38 * spot.s, 10 * spot.s, 82 * spot.s, 40 * spot.s)
        g.fillEllipse(44 * spot.s, 8 * spot.s, 94 * spot.s, 44 * spot.s)
        g.setPosition(spot.x, spot.y)
        scene.tweens.add({
            targets: g,
            y: spot.y + 8,
            duration: 5200 + spot.s * 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
        return { g, drift: spot.drift }
    })

    const birds = scene.add.graphics().setDepth(DEPTH.sky + 3).setAlpha(0.5)
    birds.lineStyle(4, C.ink, 1)
    for (const [bx, by, s] of [[0, 0, 1], [40, 14, 0.8], [78, -6, 0.7]] as const) {
        birds.beginPath()
        birds.arc(bx - 9 * s, by, 10 * s, -0.9, -0.1)
        birds.strokePath()
        birds.beginPath()
        birds.arc(bx + 9 * s, by, 10 * s, Math.PI + 0.1, Math.PI + 0.9)
        birds.strokePath()
    }
    birds.setPosition(-160, 120)
    scene.tweens.add({
        targets: birds,
        x: W + 200,
        y: 92,
        duration: 26000,
        repeat: -1,
        repeatDelay: 9000,
        onRepeat: () => birds.setPosition(-160, 100 + Math.random() * 60),
    })

    let ground: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics
    if (scene.textures.exists('grama')) {
        ground = scene.add.image(CX, H / 2, 'grama').setDisplaySize(W, H).setDepth(DEPTH.grass)
        if (mood.ground) ground.setTint(mood.ground)
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.grass)
        g.fillStyle(C.grass, 1)
        g.fillRect(0, GRASS_Y, W, H - GRASS_Y)
        ground = g
    }

    if (mood.frost) {
        const snowGround = scene.add.graphics().setDepth(DEPTH.grass + 1)
        snowGround.fillStyle(C.white, mood.frost)
        snowGround.fillRect(0, GRASS_Y - 2, W, H - GRASS_Y + 2)
        extras.push(snowGround)
    }

    const asphalt = scene.add.graphics().setDepth(DEPTH.road)
    asphalt.fillStyle(C.curbDark, 1)
    quad(asphalt, P_ROAD_FAR, P_ROAD_NEAR, -ROAD_HALF_WX - CURB_WX, ROAD_HALF_WX + CURB_WX)
    asphalt.fillStyle(C.curb, 1)
    quad(asphalt, P_ROAD_FAR, P_ROAD_NEAR, -ROAD_HALF_WX - CURB_WX, -ROAD_HALF_WX + 4)
    quad(asphalt, P_ROAD_FAR, P_ROAD_NEAR, ROAD_HALF_WX - 4, ROAD_HALF_WX + CURB_WX)
    asphalt.fillStyle(C.asphaltDark, 1)
    quad(asphalt, P_ROAD_FAR, P_ROAD_NEAR, -ROAD_HALF_WX, ROAD_HALF_WX)
    asphalt.fillStyle(C.asphalt, 1)
    quad(asphalt, P_ROAD_FAR, P_ROAD_NEAR, -ROAD_HALF_WX + 6, ROAD_HALF_WX - 6)

    const moving = scene.add.graphics().setDepth(DEPTH.stripe)

    const zNear = zOf(P_ROAD_NEAR)
    const zFar = zOf(P_STRIPE_MIN)
    const count = Math.ceil((zFar - zNear) / STRIPE.gap)
    const stripes: number[] = []
    for (let i = 0; i < count; i++) stripes.push(zNear + i * STRIPE.gap)

    const streaks = Array.from({ length: 9 }, (_, i) => ({
        z: zNear + i * 210,
        wx: (i % 2 === 0 ? -1 : 1) * (260 + (i * 47) % 190),
    }))

    const snow = mood.wild ? scene.add.graphics().setDepth(DEPTH.runner + 1) : null
    const flakes = mood.wild
        ? Array.from({ length: 46 }, () => ({
            x: Math.random() * W,
            y: Math.random() * H,
            r: 1.6 + Math.random() * 3.4,
            vy: 40 + Math.random() * 120,
            sway: Math.random() * Math.PI * 2,
        }))
        : []

    const gust = mood.wild ? scene.add.graphics().setDepth(DEPTH.runner + 2).setAlpha(0) : null
    if (gust) {
        gust.fillStyle(C.white, 0.5)
        for (let i = 0; i < 5; i++) gust.fillRoundedRect(i * 130, i * 34, 240, 7, 4)
        gust.setPosition(-400, 240)
        scene.tweens.add({
            targets: gust,
            x: W + 400,
            alpha: { from: 0, to: 0.55 },
            duration: 1400,
            repeat: -1,
            repeatDelay: 5200,
            yoyo: false,
            onRepeat: () => gust.setPosition(-400, 140 + Math.random() * 320),
        })
    }

    let lane: Lane = 0
    let flash = 0
    let boost = 0
    let dirty = true

    const draw = () => {
        if (!dirty) return
        dirty = false
        moving.clear()

        const from = lane === 0 ? -ROAD_HALF_WX + 8 : 8
        const to = lane === 0 ? -8 : ROAD_HALF_WX - 8
        moving.fillStyle(C.white, 0.09 + flash * 0.22)
        quad(moving, P_ROAD_FAR, P_ROAD_NEAR, from, to)

        moving.fillStyle(C.stripe, 0.95)
        for (let i = 0; i < stripes.length; i++) {
            const pn = pOf(stripes[i])
            if (pn < P_STRIPE_MIN) continue
            const pf = pOf(stripes[i] + STRIPE.len)
            if (pf > P_ROAD_NEAR) continue
            quad(moving, pf, pn > P_ROAD_NEAR ? P_ROAD_NEAR : pn, -STRIPE.halfWX, STRIPE.halfWX)
        }

        if (boost <= 0.02) return
        moving.fillStyle(C.white, 0.42 * boost)
        for (let i = 0; i < streaks.length; i++) {
            const pn = pOf(streaks[i].z)
            if (pn < 0.34) continue
            const pf = pOf(streaks[i].z + 320)
            if (pf > P_ROAD_NEAR) continue
            quad(
                moving,
                pf,
                pn > P_ROAD_NEAR ? P_ROAD_NEAR : pn,
                streaks[i].wx - 5,
                streaks[i].wx + 5,
            )
        }
    }

    draw()

    const fall = (dt: number) => {
        if (!snow) return
        snow.clear()
        snow.fillStyle(C.white, 0.9)
        for (let i = 0; i < flakes.length; i++) {
            const f = flakes[i]
            f.sway += dt * 2.4
            f.y += f.vy * dt
            f.x += Math.sin(f.sway) * 26 * dt
            if (f.y > H + 6) {
                f.y = -6
                f.x = Math.random() * W
            }
            snow.fillCircle(f.x, f.y, f.r)
        }
    }

    return {
        fall,

        advance(dz: number) {
            dirty = true
            const wrap = count * STRIPE.gap
            for (let i = 0; i < stripes.length; i++) {
                stripes[i] -= dz
                if (stripes[i] < zNear - STRIPE.len) stripes[i] += wrap
            }
            if (boost > 0.02) {
                for (let i = 0; i < streaks.length; i++) {
                    streaks[i].z -= dz * 1.4
                    if (streaks[i].z < zNear - 320) streaks[i].z += 9 * 210
                }
            }
            for (let i = 0; i < clouds.length; i++) {
                const x = clouds[i].g.x - dz * clouds[i].drift
                clouds[i].g.setX(x < -200 ? W + 200 : x)
            }
        },

        setLane(value: Lane) {
            lane = value
            flash = 1
            dirty = true
            scene.tweens.addCounter({
                from: 1,
                to: 0,
                duration: 420,
                ease: 'Cubic.easeOut',
                onUpdate: tween => {
                    flash = tween.getValue() ?? 0
                    dirty = true
                },
            })
        },

        setBoost(value: number) {
            const floor = mood.wild ? 0.22 : 0
            const raw = value < floor ? floor : value
            const next = raw > 1 ? 1 : raw
            if (next === boost) return
            boost = next
            dirty = true
        },

        draw,

        destroy() {
            if (gust) {
                scene.tweens.killTweensOf(gust)
                gust.destroy()
            }
            snow?.destroy()
            extras.forEach(extra => extra.destroy())
            clouds.forEach(cloud => {
                scene.tweens.killTweensOf(cloud.g)
                cloud.g.destroy()
            })
            scene.tweens.killTweensOf(birds)
            scene.tweens.killTweensOf(rays)
            scene.tweens.killTweensOf(sun)
            birds.destroy()
            rays.destroy()
            sun.destroy()
            hills.destroy()
            sky.destroy()
            ground.destroy()
            asphalt.destroy()
            moving.destroy()
        },
    }
}

export type Track = ReturnType<typeof createTrack>
