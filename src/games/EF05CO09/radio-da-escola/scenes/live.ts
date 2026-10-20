import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { EXPR_CELL, UI2_CELL, UI2_SHEET, UI_CELL, UI_SHEET, cellKey, ownerFrame } from '../data/files'
import { OWNERS } from '../data/owners'
import { DEPTH, LIVE } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { Expr, OwnerId, Rect, Vec } from '../types'
import { fitInto } from './art'

export interface Live {
    show(id: OwnerId | null, expr: Expr): Promise<void>
    expr(expr: Expr): void
    dance(on: boolean): void
    hide(): Promise<void>
    anchor(): Vec
    rect(): Rect
    destroy(): void
}

export function createLive(scene: Phaser.Scene): Live {
    const back = scene.add.circle(LIVE.x, LIVE.y, LIVE.r, C.indigoDark).setDepth(DEPTH.live)
    const first = ownerFrame(0)
    const bust = scene.add.image(LIVE.x, LIVE.y, first.key, first.frame).setOrigin(0.5, LIVE.face).setDepth(DEPTH.live + 1)
    bust.setScale((LIVE.r * 2.3) / bust.frame.height)
    const shape = scene.make.graphics({ x: 0, y: 0 }, false)
    shape.fillStyle(0xffffff, 1)
    shape.fillCircle(LIVE.x, LIVE.y, LIVE.r)
    const mask = shape.createGeometryMask()
    bust.setMask(mask)
    const ring = fitInto(scene.add.image(LIVE.x, LIVE.y, UI_SHEET.key, cellKey(UI_CELL.live)), LIVE.ring).setDepth(DEPTH.live + 2)
    const ringScale = ring.scale
    const tag = scene.add
        .text(LIVE.x, LIVE.y + LIVE.nameY, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.name}px`,
            color: CSS.white,
            backgroundColor: CSS.pink,
            padding: { x: 16, y: 6 },
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.live + 3)
    const parts = [back, bust, ring, tag]
    parts.forEach(p => p.setAlpha(0).setVisible(false))
    let owner: OwnerId | null = null
    let shown = false

    const face = (id: OwnerId | null, expr: Expr) => {
        if (!id) {
            bust.setTexture(UI2_SHEET.key, cellKey(UI2_CELL.unknown)).setOrigin(0.5)
            bust.setScale((LIVE.r * 1.7) / Math.max(bust.frame.width, bust.frame.height))
            return
        }
        const art = ownerFrame(OWNERS[id].cell + EXPR_CELL[expr])
        bust.setTexture(art.key, art.frame).setOrigin(0.5, LIVE.face)
        bust.setScale((LIVE.r * 2.3) / bust.frame.height)
    }

    let bob: Phaser.Tweens.Tween | undefined

    const still = () => {
        bob?.stop()
        bob = undefined
        bust.setAngle(0)
    }

    return {
        async show(id, expr) {
            owner = id
            still()
            scene.tweens.killTweensOf(parts)
            shown = true
            face(id, expr)
            tag.setText(id ? OWNERS[id].name : '?')
            parts.forEach(p => p.setVisible(true))
            ring.setScale(ringScale * 0.6)
            await FX.all(
                FX.to(scene, parts, { alpha: 1 }, { duration: 260 }),
                FX.to(scene, ring, { scale: ringScale }, { duration: 360, ease: 'Back.easeOut' }),
            )
        },
        expr(expr) {
            if (!shown) return
            if (owner) face(owner, expr)
            if (expr === 'upset') void FX.shake(scene, ring, { amount: 7, times: 3 })
        },
        dance(on) {
            still()
            if (!on) return
            bob = scene.tweens.add({ targets: bust, angle: { from: -6, to: 6 }, duration: 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        async hide() {
            still()
            if (!back.visible) return
            scene.tweens.killTweensOf(parts)
            await FX.to(scene, parts, { alpha: 0 }, { duration: 240 })
            parts.forEach(p => p.setVisible(false))
            owner = null
            shown = false
        },
        anchor: () => ({ x: LIVE.x + 40, y: LIVE.y - LIVE.ring / 2 + 6 }),
        rect: () => ({ x: LIVE.x, y: LIVE.y + 14, w: LIVE.ring + 16, h: LIVE.ring + 50 }),
        destroy() {
            still()
            scene.tweens.killTweensOf(parts)
            bust.clearMask()
            mask.destroy()
            shape.destroy()
            parts.forEach(p => p.destroy())
        },
    }
}
