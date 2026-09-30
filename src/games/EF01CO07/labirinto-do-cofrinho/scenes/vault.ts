import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, VAULT } from '../data/layout'
import { C, LINE } from '../data/theme'
import type { Point } from '../types'
import { PIECES, VAULT_ART } from '../data/files'
import type { IdCard } from './card'

type G = Phaser.GameObjects.Graphics

const DOOR = { y: -6, r: 40 }

function paintVault(g: G, open: boolean) {
    const { w, h } = VAULT
    g.clear()
    g.fillStyle(C.shadow, 0.16)
    g.fillEllipse(0, h / 2 + 4, w + 10, 18)
    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(C.gold, 1)
    ;[-w / 2 + 14, w / 2 - 38].forEach(x => {
        g.fillRoundedRect(x, h / 2 - 12, 24, 14, 5)
        g.strokeRoundedRect(x, h / 2 - 12, 24, 14, 5)
    })
    g.fillStyle(C.aqua, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 6, 24)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h - 6, 24)
    g.lineStyle(4, C.gold, 1)
    g.strokeRoundedRect(-w / 2 + 9, -h / 2 + 9, w - 18, h - 24, 16)

    if (open) {
        g.fillStyle(C.glow, 1)
        g.fillCircle(0, DOOR.y, DOOR.r)
        g.fillStyle(C.cream, 1)
        g.fillCircle(0, DOOR.y, DOOR.r - 10)
        g.lineStyle(LINE, C.ink, 1)
        g.strokeCircle(0, DOOR.y, DOOR.r)
        g.fillStyle(C.aquaDark, 1)
        g.fillEllipse(w / 2 + 4, DOOR.y, 24, DOOR.r * 2 + 4)
        g.lineStyle(4, C.gold, 1)
        g.strokeEllipse(w / 2 + 4, DOOR.y, 24, DOOR.r * 2 + 4)
        g.lineStyle(LINE, C.ink, 1)
        g.strokeEllipse(w / 2 + 4, DOOR.y, 30, DOOR.r * 2 + 10)
        return
    }
    g.fillStyle(C.aquaDark, 1)
    g.fillCircle(0, DOOR.y, DOOR.r)
    g.lineStyle(6, C.gold, 1)
    g.strokeCircle(0, DOOR.y, DOOR.r - 3)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeCircle(0, DOOR.y, DOOR.r)
    g.lineStyle(6, C.gold, 1)
    for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 4
        g.lineBetween(Math.cos(a) * -22, DOOR.y + Math.sin(a) * -22, Math.cos(a) * 22, DOOR.y + Math.sin(a) * 22)
    }
    g.fillStyle(C.gold, 1)
    g.fillCircle(0, DOOR.y, 10)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeCircle(0, DOOR.y, 10)
}

export interface VaultView {
    readonly container: Phaser.GameObjects.Container
    readonly door: Point
    setOpen(open: boolean): void
    pulse(): Promise<void>
    receive(card: IdCard, via: Point, onShut: () => void): Promise<void>
    destroy(): void
}

export function createVault(scene: Phaser.Scene, x: number = VAULT.x, y: number = VAULT.y, scale = 1): VaultView {
    const hasArt = scene.textures.exists(PIECES)
    const g = scene.add.graphics()
    const artScale = VAULT.w / VAULT_ART.bodyW
    const art = hasArt ? scene.add.image(-VAULT.w / 2, VAULT.h / 2, PIECES, 'vaultClosed').setOrigin(0, 1).setScale(artScale) : null
    if (art) {
        g.fillStyle(C.shadow, 0.16)
        g.fillEllipse(0, VAULT.h / 2 + 2, VAULT.w + 10, 18)
    }
    const container = scene.add.container(x, y, art ? [g, art] : [g]).setDepth(DEPTH.vault).setScale(scale)
    const paint = (open: boolean) => {
        if (art) art.setFrame(open ? 'vaultOpen' : 'vaultClosed')
        else paintVault(g, open)
    }
    paint(false)
    const doorLocal = art
        ? { x: -VAULT.w / 2 + VAULT_ART.doorX * artScale, y: VAULT.h / 2 - (VAULT_ART.bodyH - VAULT_ART.doorY) * artScale }
        : { x: 0, y: DOOR.y }
    const door = () => ({ x: container.x + doorLocal.x * container.scale, y: container.y + doorLocal.y * container.scale })

    return {
        container,
        get door() {
            return door()
        },
        setOpen(open) {
            paint(open)
        },
        async pulse() {
            const base = container.scale
            await FX.to(scene, container, { scale: base * 1.12 }, { duration: 220, yoyo: true, repeat: 1, ease: 'Sine.easeInOut' })
            container.setScale(base)
        },
        async receive(card, via, onShut) {
            paint(true)
            void FX.impact(scene, container, 0.1)
            card.container.setDepth(DEPTH.flying)
            await FX.arcTo(scene, card.container, via, { height: 90, duration: 520 })
            void FX.to(scene, card.container, { angle: 720 }, { duration: 900 })
            const d = door()
            await FX.arcTo(scene, card.container, d, { height: 70, duration: 460 })
            await FX.to(scene, card.container, { scale: 0.02, alpha: 0 }, { duration: 200, ease: 'Quad.easeIn' })
            card.destroy()
            paint(false)
            onShut()
            void FX.impact(scene, container, 0.2)
            void FX.sparks(scene, d.x, d.y, { color: C.gold, count: 18, spread: 140, depth: DEPTH.flying + 2 })
            await FX.stars(scene, d.x, d.y - 20, { color: C.gold, count: 8, depth: DEPTH.flying + 2 })
        },
        destroy() {
            container.destroy()
        },
    }
}
