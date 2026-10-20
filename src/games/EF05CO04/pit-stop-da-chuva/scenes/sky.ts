import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { CLOUDS, CLOUD_SIZE, DEPTH, H, HEADER, PIT_LANE, SKY, SUN, W } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import { WEATHERS } from '../data/rules'
import type { Rect, Weather } from '../types'
import { RAIN, SKY_KEY } from './art'
import type { View } from './view'

export interface Sky {
    readonly weather: Weather
    set(weather: Weather): void
    change(weather: Weather): Promise<void>
    update(delta: number, scroll: number): void
    rect(): Rect
    destroy(): void
}

interface CloudPair {
    gray: Phaser.GameObjects.Image
    rain: Phaser.GameObjects.Image
    speed: number
}

const ORDER: Weather[] = ['sol', 'nublado', 'chuva']

export function createSky(scene: Phaser.Scene, view: View): Sky {
    const skyH = SKY.h
    const layers = Object.fromEntries(
        ORDER.map(w => [w, view.world(scene.add.image(0, 0, SKY_KEY[w]).setOrigin(0, 0).setDisplaySize(W, skyH).setDepth(DEPTH.sky))]),
    ) as Record<Weather, Phaser.GameObjects.Image>

    const sun = view.world(scene.add.image(SUN.x, SUN.y, PIECE_SHEET.key, cellKey(PIECE_CELL.sun)).setDepth(DEPTH.sun))
    sun.setScale(SUN.size / Math.max(sun.frame.width, sun.frame.height))
    const sunScale = sun.scaleX

    const clouds: CloudPair[] = CLOUDS.map((c, i) => {
        const make = (cell: number) => {
            const img = view.world(scene.add.image(c.x, c.y, PIECE_SHEET.key, cellKey(cell)).setDepth(DEPTH.clouds))
            return img.setScale((CLOUD_SIZE * c.s) / Math.max(img.frame.width, img.frame.height))
        }
        return { gray: make(PIECE_CELL.cloud), rain: make(PIECE_CELL.rainCloud), speed: 6 + (i % 3) * 3 }
    })

    const wet = view.world(scene.add.rectangle(0, PIT_LANE.top, W, H - PIT_LANE.top, C.wet).setOrigin(0, 0).setDepth(DEPTH.wet))
    const rain = view.world(scene.add.tileSprite(0, HEADER.h, W, H - HEADER.h, RAIN).setOrigin(0, 0).setDepth(DEPTH.rain))

    let weather: Weather = 'sol'
    const all = () => [...ORDER.map(w => layers[w]), sun, ...clouds.flatMap(c => [c.gray, c.rain]), wet, rain]

    const target = (w: Weather) => {
        const def = WEATHERS[w]
        return {
            layers: ORDER.map(o => (o === w ? 1 : 0)),
            sun: def.sun ? 1 : 0,
            gray: def.clouds === 'gray' ? 1 : 0,
            rain: def.clouds === 'rain' ? 1 : 0,
            wet: def.wet,
            drops: def.raining ? 0.85 : 0,
        }
    }

    const sky: Sky = {
        get weather() {
            return weather
        },
        set(w) {
            scene.tweens.killTweensOf(all())
            weather = w
            const t = target(w)
            ORDER.forEach((o, i) => layers[o].setAlpha(t.layers[i]))
            sun.setAlpha(t.sun).setScale(sunScale).setY(SUN.y)
            clouds.forEach(c => {
                c.gray.setAlpha(t.gray)
                c.rain.setAlpha(t.rain)
            })
            wet.setAlpha(t.wet)
            rain.setAlpha(t.drops)
        },
        async change(w) {
            if (w === weather) return
            scene.tweens.killTweensOf(all())
            const t = target(w)
            const ms = TIMING.weather
            const jobs: Promise<void>[] = []
            ORDER.forEach((o, i) => jobs.push(FX.to(scene, layers[o], { alpha: t.layers[i] }, { duration: ms })))
            jobs.push(FX.to(scene, sun, { alpha: t.sun, y: t.sun ? SUN.y : SUN.y + 60 }, { duration: ms }))
            clouds.forEach((c, i) => {
                const delay = i * 90
                jobs.push(FX.to(scene, c.gray, { alpha: t.gray }, { duration: ms - delay, delay }))
                jobs.push(FX.to(scene, c.rain, { alpha: t.rain }, { duration: ms - delay, delay }))
            })
            jobs.push(FX.to(scene, wet, { alpha: t.wet }, { duration: ms }))
            jobs.push(FX.to(scene, rain, { alpha: t.drops }, { duration: ms, delay: t.drops ? ms * 0.35 : 0 }))
            weather = w
            await FX.all(...jobs)
        },
        update(delta, scroll) {
            const dt = delta / 1000
            clouds.forEach(c => {
                let x = c.gray.x + c.speed * dt - scroll * 0.06
                if (x > W + 160) x = -160
                if (x < -160) x = W + 160
                c.gray.setX(x)
                c.rain.setX(x)
            })
            if (rain.alpha > 0.01) {
                rain.tilePositionX += 260 * dt + scroll * 0.35
                rain.tilePositionY -= 950 * dt
            }
        },
        rect: () => ({ ...SKY.rect }),
        destroy() {
            scene.tweens.killTweensOf(all())
            all().forEach(o => o.destroy())
        },
    }
    sky.set('sol')
    return sky
}
