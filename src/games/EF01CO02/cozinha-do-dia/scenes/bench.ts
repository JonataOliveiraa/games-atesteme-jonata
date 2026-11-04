import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { objectArt } from '../data/files'
import { BENCH, DEPTH } from '../data/layout'
import { TIMING } from '../data/timing'
import type { ObjectId, Rect, Vec } from '../types'
import { PAD, PAD_RING, ROUND_RING } from './art'

export interface Bench {
    setup(objects: ObjectId[]): Promise<void>
    arm(ids: ObjectId[], onPick: (id: ObjectId) => void): void
    disarm(): void
    pos(id: ObjectId): Vec
    hop(id: ObjectId): Promise<void>
    nope(id: ObjectId): Promise<void>
    press(id: ObjectId): Promise<void>
    take(id: ObjectId, hide: boolean): Phaser.GameObjects.Image
    remove(id: ObjectId): void
    show(id: ObjectId): void
    shift(id: ObjectId, dx: number): void
    restore(): void
    rect(): Rect
    clear(): void
    destroy(): void
}

interface Piece {
    id: ObjectId
    home: Vec
    icon: Phaser.GameObjects.Image
    pad?: Phaser.GameObjects.Image
    ring: Phaser.GameObjects.Image
    base: number
}

export function createBench(scene: Phaser.Scene): Bench {
    let pieces: Partial<Record<ObjectId, Piece>> = {}
    let zones: Phaser.GameObjects.Zone[] = []
    let pulse: Phaser.Tweens.Tween | undefined

    const piece = (id: ObjectId) => pieces[id] as Piece
    const list = () => Object.values(pieces) as Piece[]

    const make = (id: ObjectId, slot: number): Piece => {
        const onBlender = id === 'button'
        const home = onBlender ? { x: BENCH.slots[1], y: BENCH.buttonY } : { x: BENCH.slots[slot], y: BENCH.y }
        const size = onBlender ? BENCH.button : BENCH.object
        const pad = onBlender ? undefined : scene.add.image(home.x, home.y + 6, PAD).setDepth(DEPTH.bench)
        const ring = scene.add
            .image(home.x, home.y + (onBlender ? 0 : 8), onBlender ? ROUND_RING : PAD_RING)
            .setDepth(DEPTH.bench)
            .setVisible(false)
        const art = objectArt(id)
        const icon = scene.add.image(home.x, home.y, art.key, art.frame).setDepth(DEPTH.bench + 1)
        const base = size / Math.max(icon.frame.width, icon.frame.height)
        icon.setScale(base)
        return { id, home, icon, pad, ring, base }
    }

    const dropPiece = (p: Piece) => {
        FX.kill(scene, [p.icon, p.ring])
        p.icon.destroy()
        p.ring.destroy()
        if (p.pad) {
            FX.kill(scene, p.pad)
            p.pad.destroy()
        }
    }

    const bench: Bench = {
        async setup(objects) {
            bench.clear()
            let slot = 0
            objects.forEach(id => {
                pieces[id] = make(id, id === 'button' ? 0 : slot)
                if (id !== 'button') slot += 1
            })
            await FX.all(
                ...objects.map((id, i) => {
                    const p = piece(id)
                    const jobs = [FX.popIn(scene, p.icon, { from: 0.4, delay: i * 110, duration: TIMING.objectIn })]
                    if (p.pad) jobs.push(FX.popIn(scene, p.pad, { from: 0.6, delay: i * 110, duration: TIMING.objectIn }))
                    return Promise.all(jobs)
                }),
            )
        },
        arm(ids, onPick) {
            bench.disarm()
            const rings: Phaser.GameObjects.Image[] = []
            ids.forEach(id => {
                const p = piece(id)
                if (!p) return
                const hitW = id === 'button' ? BENCH.buttonHit : BENCH.hitW
                const hitH = id === 'button' ? BENCH.buttonHit : BENCH.hitH
                const zone = scene.add
                    .zone(p.home.x, p.home.y + (id === 'button' ? 0 : 6), hitW, hitH)
                    .setDepth(DEPTH.zones + (id === 'button' ? 1 : 0))
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerover', () => p.icon.setScale(p.base * 1.08))
                zone.on('pointerout', () => p.icon.setScale(p.base))
                zone.on('pointerdown', () => {
                    p.icon.setScale(p.base)
                    onPick(id)
                })
                zones.push(zone)
                p.ring.setVisible(true).setAlpha(1)
                rings.push(p.ring)
            })
            pulse = scene.tweens.add({ targets: rings, alpha: 0.25, duration: 560, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        disarm() {
            pulse?.remove()
            pulse = undefined
            zones.forEach(zone => zone.destroy())
            zones = []
            list().forEach(p => {
                p.ring.setVisible(false)
                p.icon.setScale(p.base)
            })
        },
        pos: id => piece(id).home,
        async hop(id) {
            const p = piece(id)
            if (!p) return
            await FX.to(scene, p.icon, { y: p.home.y - 34 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' })
            p.icon.setY(p.home.y)
        },
        async nope(id) {
            const p = piece(id)
            if (!p) return
            await FX.shake(scene, p.icon, { amount: 8, times: 3 })
            p.icon.setPosition(p.home.x, p.home.y)
        },
        async press(id) {
            const p = piece(id)
            if (!p) return
            await FX.press(scene, p.icon, 0.8)
            p.icon.setScale(p.base)
        },
        take(id, hide) {
            const p = piece(id)
            const art = objectArt(id)
            const copy = scene.add
                .image(p.icon.x, p.icon.y, art.key, art.frame)
                .setScale(p.base)
                .setDepth(DEPTH.flyer)
            if (hide) p.icon.setVisible(false)
            return copy
        },
        remove(id) {
            const p = piece(id)
            if (!p) return
            dropPiece(p)
            delete pieces[id]
        },
        show(id) {
            piece(id)?.icon.setVisible(true)
        },
        shift(id, dx) {
            const p = piece(id)
            if (p) p.icon.setX(p.home.x + dx)
        },
        restore() {
            list().forEach(p => {
                FX.kill(scene, p.icon)
                p.icon.setVisible(true).setPosition(p.home.x, p.home.y).setScale(p.base).setAlpha(1)
            })
        },
        rect() {
            const row = list().filter(p => p.pad)
            const xs = row.map(p => p.home.x)
            const left = Math.min(...xs) - BENCH.padW / 2 - 14
            const right = Math.max(...xs) + BENCH.padW / 2 + 14
            return { x: (left + right) / 2, y: BENCH.y + 6, w: right - left, h: BENCH.padH + 34 }
        },
        clear() {
            bench.disarm()
            list().forEach(dropPiece)
            pieces = {}
        },
        destroy() {
            bench.clear()
        },
    }
    return bench
}
