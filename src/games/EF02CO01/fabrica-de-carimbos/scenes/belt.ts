import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, BELT_TILE, BG } from '../data/files'
import { BELT, DEPTH, H, TUNNEL, ZONE } from '../data/layout'
import { A, C } from '../data/theme'
import type { LevelDef, Toy } from '../types'
import { createToy, type ToyView } from './toy'

export interface Belt {
    set(toys: Toy[]): void
    appear(): Promise<void>
    vanish(): Promise<void>
    update(deltaMs: number): void
    setMoving(on: boolean): void
    lit(): number | null
    toy(index: number): ToyView | undefined
    take(index: number): ToyView | undefined
    waitCentered(index: number): Promise<void>
    readonly zoneRect: { x: number; y: number; w: number; h: number }
    clear(): void
    destroy(): void
}

export function createBelt(scene: Phaser.Scene, level: LevelDef): Belt {
    const half = level.zone / 2
    let loop = level.spacing * level.lineSize

    const painted = scene.textures.exists(BG)
    const frame = scene.add.graphics().setDepth(DEPTH.belt)
    if (!painted) {
        frame.fillStyle(C.shadow, 0.14)
        frame.fillRoundedRect(BELT.left, BELT.top + 8, BELT.right - BELT.left, BELT.h, 20)
        for (const x of [BELT.left + 70, (BELT.left + BELT.right) / 2, BELT.right - 70]) {
            frame.fillStyle(C.woodDark, 1)
            frame.fillRect(x - 12, BELT.top + BELT.h - 10, 24, H - BELT.top - BELT.h + 10)
            frame.lineStyle(3, C.ink, 1)
            frame.strokeRect(x - 12, BELT.top + BELT.h - 10, 24, H - BELT.top - BELT.h + 10)
        }
    }

    const tileLeft = BELT.left + BELT.roller
    const tileW = BELT.right - BELT.roller - tileLeft
    const tile = scene.textures.exists(BELT_TILE)
        ? scene.add
              .tileSprite(tileLeft, BELT.top, tileW, BELT.h - 4, BELT_TILE)
              .setOrigin(0, 0)
              .setTileScale(BELT.slat / ART.belt.slat, (BELT.h - 4) / ART.belt.h)
              .setDepth(DEPTH.belt + 1)
        : undefined

    const surface = scene.add.graphics().setDepth(DEPTH.belt + 1)
    let slatOffset = 0
    const paintSurface = () => {
        if (tile) {
            tile.tilePositionX = -slatOffset / tile.tileScaleX
            return
        }
        surface.clear()
        surface.fillStyle(C.belt, 1)
        surface.fillRoundedRect(BELT.left, BELT.top, BELT.right - BELT.left, BELT.h, 20)
        surface.fillStyle(C.beltDark, 1)
        for (let x = BELT.left + 20 + (slatOffset % BELT.slat); x < BELT.right - 14; x += BELT.slat) {
            surface.fillRect(x, BELT.top + 10, 6, BELT.h - 20)
        }
        surface.lineStyle(4, C.ink, 1)
        surface.strokeRoundedRect(BELT.left, BELT.top, BELT.right - BELT.left, BELT.h, 20)
        for (const x of [BELT.left + 22, BELT.right - 22]) {
            surface.fillStyle(C.steel, 1)
            surface.fillCircle(x, BELT.top + BELT.h / 2, 18)
            surface.strokeCircle(x, BELT.top + BELT.h / 2, 18)
            surface.fillStyle(C.ink, 1)
            surface.fillCircle(x, BELT.top + BELT.h / 2, 5)
        }
    }
    paintSurface()

    const zone = scene.add.graphics().setDepth(DEPTH.zone)
    let zoneLit = false
    const paintZone = () => {
        zone.clear()
        const alpha = zoneLit ? A.zoneLit : A.zone
        zone.fillStyle(C.zone, alpha)
        zone.fillRoundedRect(ZONE.x - half, ZONE.top, level.zone, ZONE.bottom - ZONE.top, 24)
        zone.lineStyle(4, C.glow, zoneLit ? 0.95 : 0.55)
        zone.strokeRoundedRect(ZONE.x - half, ZONE.top, level.zone, ZONE.bottom - ZONE.top, 24)
    }
    paintZone()

    const tunnels = scene.add.graphics().setDepth(DEPTH.tunnel)
    for (const x of painted ? [] : [TUNNEL.leftX, TUNNEL.rightX]) {
        const top = TUNNEL.top
        const h = TUNNEL.bottom - TUNNEL.top
        tunnels.fillStyle(C.lilac, 1)
        tunnels.fillRoundedRect(x - TUNNEL.w / 2, top, TUNNEL.w, h, { tl: 50, tr: 50, bl: 8, br: 8 })
        tunnels.lineStyle(4, C.ink, 1)
        tunnels.strokeRoundedRect(x - TUNNEL.w / 2, top, TUNNEL.w, h, { tl: 50, tr: 50, bl: 8, br: 8 })
        tunnels.fillStyle(C.tunnelDark, 1)
        tunnels.fillRoundedRect(x - TUNNEL.w / 2 + 16, top + 18, TUNNEL.w - 32, h - 30, { tl: 36, tr: 36, bl: 4, br: 4 })
    }

    let toys: (ToyView | null)[] = []
    let xs: (number | null)[] = []
    let moving = false
    let litIndex: number | null = null
    let waiter: { index: number; resolve: () => void } | undefined
    let fading = false

    const alphaAt = (x: number) => {
        if (x < BELT.fadeIn - BELT.fade || x > BELT.fadeOut + BELT.fade) return 0
        if (x < BELT.fadeIn) return (x - (BELT.fadeIn - BELT.fade)) / BELT.fade
        if (x > BELT.fadeOut) return 1 - (x - BELT.fadeOut) / BELT.fade
        return 1
    }

    const place = (time: number) => {
        toys.forEach((view, i) => {
            const x = xs[i]
            if (!view || x === null) return
            view.container.x = x
            view.container.y = BELT.top + (moving ? Math.abs(Math.sin(time / 160 + i)) * -3 : 0)
            if (!fading) view.container.setAlpha(alphaAt(x))
        })
    }

    const inZone = (): number | null => {
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i]
            if (x === null || !toys[i]) continue
            if (Math.abs(x - ZONE.x) <= half && alphaAt(x) > 0.5) return i
        }
        return null
    }

    const refreshLit = () => {
        const index = inZone()
        if (index === litIndex) return
        if (litIndex !== null) toys[litIndex]?.setLit(false)
        litIndex = index
        if (index !== null) toys[index]?.setLit(true)
        zoneLit = index !== null
        paintZone()
    }

    const clear = () => {
        waiter = undefined
        toys.forEach(view => view?.destroy())
        toys = []
        xs = []
        litIndex = null
        zoneLit = false
        paintZone()
    }

    let clock = 0

    return {
        set(list) {
            clear()
            loop = level.spacing * Math.max(list.length, 6)
            const first = ZONE.x - half - 150
            toys = list.map(toy => createToy(scene, toy))
            xs = list.map((_, i) => first - i * level.spacing)
            place(clock)
            refreshLit()
        },
        async appear() {
            await Promise.all(
                toys.map((view, i) => {
                    if (!view) return Promise.resolve()
                    view.container.setScale(0.4)
                    return FX.to(scene, view.container, { scale: 1 }, { delay: i * 60, duration: 360, ease: 'Back.easeOut' })
                }),
            )
        },
        async vanish() {
            moving = false
            fading = true
            await Promise.all(
                toys.map(view => (view ? FX.to(scene, view.container, { alpha: 0, scale: 0.6 }, { duration: 300 }) : Promise.resolve())),
            )
            fading = false
            clear()
        },
        update(deltaMs) {
            clock += deltaMs
            if (moving) {
                const step = (level.speed * deltaMs) / 1000
                slatOffset += step
                paintSurface()
                xs = xs.map((x, i) => {
                    if (x === null) return null
                    let next = x + step
                    if (next > BELT.wrap) next -= loop
                    if (waiter && waiter.index === i && x < ZONE.x && next >= ZONE.x) {
                        next = ZONE.x
                        moving = false
                        const done = waiter.resolve
                        waiter = undefined
                        done()
                    }
                    return next
                })
            }
            place(clock)
            refreshLit()
        },
        setMoving(on) {
            moving = on
        },
        lit() {
            return litIndex
        },
        toy(index) {
            return toys[index] ?? undefined
        },
        take(index) {
            const view = toys[index]
            if (!view) return undefined
            toys[index] = null
            xs[index] = null
            if (litIndex === index) {
                litIndex = null
                zoneLit = false
                paintZone()
            }
            view.setLit(false)
            return view
        },
        waitCentered(index) {
            return new Promise(resolve => {
                const x = xs[index]
                if (x !== null && x !== undefined && Math.abs(x - ZONE.x) < 2) {
                    resolve()
                    return
                }
                waiter = { index, resolve }
            })
        },
        zoneRect: { x: ZONE.x, y: (ZONE.top + ZONE.bottom) / 2, w: level.zone, h: ZONE.bottom - ZONE.top },
        clear,
        destroy() {
            clear()
            frame.destroy()
            surface.destroy()
            tile?.destroy()
            zone.destroy()
            tunnels.destroy()
        },
    }
}
