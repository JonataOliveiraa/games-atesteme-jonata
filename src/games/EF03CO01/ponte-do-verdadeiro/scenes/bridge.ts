import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { ART, BG, BRIDGE, PART, PART_CELL, PARTS } from '../data/files'
import { DECK, DEPTH, H, LOCK, PULLEY, RING, W } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

const LINK = 13

export interface Bridge {
    lower(): Promise<void>
    jam(): Promise<void>
    raise(ms?: number): Promise<void>
    setRaised(): void
    showLock(on: boolean): Promise<void>
    ring(): Vec
    update(): void
    destroy(): void
}

export function createBridge(scene: Phaser.Scene, onCreak: (ms: number) => void, onThump: () => void, onClank: () => void): Bridge {
    const bg = scene.add.image(0, 0, BG).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.bg)

    const texture = scene.textures.get(BRIDGE)
    const f = ART.deck.frame
    if (!texture.has('deck')) texture.add('deck', 0, f.x, f.y, f.w, f.h)
    const deck = scene.add
        .image(DECK.hingeX, DECK.hingeY, BRIDGE, 'deck')
        .setOrigin((ART.deck.hinge.x - f.x) / f.w, (ART.deck.hinge.y - f.y) / f.h)
        .setScale(DECK.scale)
        .setAngle(DECK.raised)
        .setDepth(DEPTH.deck)

    const chain = scene.add.graphics().setDepth(DEPTH.chain)
    const lock = scene.add
        .image(LOCK.x, LOCK.y, PARTS, PART.lock)
        .setOrigin(ART.lock.x / PART_CELL, ART.lock.y / PART_CELL)
        .setScale(0)
        .setDepth(DEPTH.lock)

    const ring = (): Vec => {
        const cos = Math.cos(deck.rotation)
        const sin = Math.sin(deck.rotation)
        return { x: DECK.hingeX + RING.x * cos - RING.y * sin, y: DECK.hingeY + RING.x * sin + RING.y * cos }
    }

    const update = () => {
        const end = ring()
        const dx = end.x - PULLEY.x
        const dy = end.y - PULLEY.y
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len
        const uy = dy / len
        const sx = PULLEY.x - uy * PULLEY.r * 0.9
        const sy = PULLEY.y + ux * PULLEY.r * 0.9
        const span = Math.hypot(end.x - sx, end.y - sy)
        chain.clear()
        chain.lineStyle(8, C.chainDark, 1)
        chain.lineBetween(sx, sy, end.x, end.y)
        chain.lineStyle(4, C.chain, 1)
        chain.lineBetween(sx, sy, end.x, end.y)
        const links = Math.floor(span / LINK)
        for (let k = 1; k < links; k++) {
            const t = k / links
            chain.fillStyle(k % 2 ? C.white : C.chainDark, k % 2 ? 0.7 : 1)
            chain.fillCircle(sx + (end.x - sx) * t, sy + (end.y - sy) * t, k % 2 ? 1.8 : 2.4)
        }
    }

    return {
        async lower() {
            onCreak(900)
            await FX.to(scene, deck, { angle: 0 }, { duration: 900, ease: 'Quad.easeIn' })
            onThump()
            FX.shakeCam(scene, 'leve')
            await FX.to(scene, deck, { angle: -2.5 }, { duration: 90, ease: 'Sine.easeOut' })
            await FX.to(scene, deck, { angle: 0 }, { duration: 360, ease: Ease.settle })
        },
        async jam() {
            onCreak(520)
            await FX.to(scene, deck, { angle: DECK.jam }, { duration: 520, ease: 'Sine.easeIn' })
            onClank()
            await FX.to(scene, deck, { angle: DECK.jam + 3 }, { duration: 60, yoyo: true, repeat: 2 })
            deck.setAngle(DECK.jam)
        },
        async raise(ms = 700) {
            await FX.to(scene, deck, { angle: DECK.raised }, { duration: ms, ease: Ease.smooth })
        },
        setRaised() {
            scene.tweens.killTweensOf(deck)
            deck.setAngle(DECK.raised)
        },
        async showLock(on) {
            scene.tweens.killTweensOf(lock)
            if (!on) {
                await FX.to(scene, lock, { scale: 0 }, { duration: 180 })
                return
            }
            lock.setScale(0).setAngle(-14)
            await FX.to(scene, lock, { scale: LOCK.scale, angle: 0 }, { duration: 320, ease: Ease.back(2.4) })
        },
        ring,
        update,
        destroy() {
            scene.tweens.killTweensOf([deck, lock])
            lock.destroy()
            chain.destroy()
            deck.destroy()
            bg.destroy()
        },
    }
}
