import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BOX_KEY, PIECE_CELL, PIECE_SHEET, TRACK_KEY, cellKey } from '../data/files'
import { BOX, DEPTH, KART, LAP, STRIP, W } from '../data/layout'
import type { View } from './view'

export interface Rider {
    ride(offset: number): void
}

export interface TrackStep {
    dd: number
    speed: number
    crossed: number[]
}

export interface Track {
    readonly d: number
    readonly moving: boolean
    drive(to: number, ms: number, ease: (t: number) => number): Promise<boolean>
    halt(): void
    home(): void
    setWet(on: boolean, ms: number): Promise<void>
    attach(rider: Rider): void
    screenX(p: number): number
    update(delta: number): TrackStep
    destroy(): void
}

interface Motion {
    from: number
    to: number
    t: number
    ms: number
    ease: (t: number) => number
    resolve: (done: boolean) => void
}

export function createTrack(scene: Phaser.Scene, view: View): Track {
    const strip = view.world(scene.add.tileSprite(0, STRIP.y, W, STRIP.h, TRACK_KEY).setOrigin(0, 0).setDepth(DEPTH.strip))
    const src = scene.textures.get(TRACK_KEY).getSourceImage() as { width: number; height: number }
    const sx = W / src.width
    strip.setTileScale(sx, STRIP.h / src.height)

    const box = view.world(scene.add.image(BOX.x, BOX.base, BOX_KEY).setOrigin(0.5, 1).setDepth(DEPTH.box))
    box.setScale(BOX.w / box.width)

    const puddles = LAP.puddles.map(() => {
        const img = view.world(scene.add.image(0, LAP.puddleY, PIECE_SHEET.key, cellKey(PIECE_CELL.puddle)).setDepth(DEPTH.puddle).setAlpha(0))
        return img.setScale(LAP.puddleW / img.frame.width)
    })
    const hay = LAP.hay.map(() => {
        const img = view.world(scene.add.image(0, LAP.hayY, PIECE_SHEET.key, cellKey(PIECE_CELL.hay)).setOrigin(0.5, 1).setDepth(DEPTH.hay))
        return img.setScale(LAP.haySize / Math.max(img.frame.width, img.frame.height))
    })

    const riders: Rider[] = []
    let d = 0
    let motion: Motion | null = null

    const offset = () => (d <= LAP.length / 2 ? d : d - LAP.length)
    const screenX = (p: number) => KART.x + (p - d)

    const paint = () => {
        strip.tilePositionX = d / sx
        const ox = offset()
        box.setX(BOX.x - ox)
        riders.forEach(r => r.ride(ox))
        puddles.forEach((img, i) => img.setX(screenX(LAP.puddles[i])))
        hay.forEach((img, i) => img.setX(screenX(LAP.hay[i])))
    }

    const track: Track = {
        get d() {
            return d
        },
        get moving() {
            return motion !== null
        },
        drive(to, ms, ease) {
            motion?.resolve(false)
            return new Promise<boolean>(resolve => {
                motion = { from: d, to, t: 0, ms: FX.ms(scene, ms), ease, resolve }
            })
        },
        halt() {
            const m = motion
            motion = null
            m?.resolve(false)
        },
        home() {
            track.halt()
            d = 0
            paint()
        },
        setWet(on, ms) {
            return FX.to(scene, puddles, { alpha: on ? 1 : 0 }, { duration: ms })
        },
        attach(rider) {
            riders.push(rider)
            rider.ride(offset())
        },
        screenX,
        update(delta) {
            let dd = 0
            let crossed: number[] = []
            if (motion) {
                const prev = d
                motion.t = Math.min(motion.ms, motion.t + delta)
                const k = motion.ms > 0 ? motion.t / motion.ms : 1
                d = motion.from + (motion.to - motion.from) * motion.ease(k)
                dd = d - prev
                crossed = LAP.puddles.filter(p => prev < p && d >= p)
                if (k >= 1) {
                    const m = motion
                    motion = null
                    if (d >= LAP.length) d -= LAP.length
                    m.resolve(true)
                }
            }
            paint()
            return { dd, speed: delta > 0 ? (dd / delta) * 1000 : 0, crossed }
        },
        destroy() {
            motion = null
            scene.tweens.killTweensOf(puddles)
            strip.destroy()
            box.destroy()
            puddles.forEach(p => p.destroy())
            hay.forEach(h => h.destroy())
        },
    }
    paint()
    return track
}
