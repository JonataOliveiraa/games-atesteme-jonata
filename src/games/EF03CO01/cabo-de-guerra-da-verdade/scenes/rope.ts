import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, ROPE, markerX, ropeStep } from '../data/layout'
import { C } from '../data/theme'

export const ROPE_TEXTURE = 'corda'

function drawMarker(g: Phaser.GameObjects.Graphics) {
    const r = ROPE.marker / 2
    g.clear()
    g.fillStyle(C.ink, 0.28)
    g.fillEllipse(3, 8, r * 1.7, r * 0.7)
    g.fillStyle(C.denyDark, 1)
    g.fillRoundedRect(-r * 0.42, -r * 1.1, r * 0.84, r * 2.2, r * 0.4)
    g.fillStyle(C.deny, 1)
    g.fillRoundedRect(-r * 0.42, -r * 1.1, r * 0.84, r * 1.7, r * 0.4)
    g.fillStyle(C.white, 0.75)
    g.fillRoundedRect(-r * 0.22, -r * 0.9, r * 0.2, r * 1.1, r * 0.1)
}

export function createRope(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.rope)
    const width = ROPE.drawRight - ROPE.drawLeft

    const track = scene.add.graphics()
    const step = ropeStep()
    track.fillStyle(C.ink, 0.16)
    track.fillRoundedRect(ROPE.left, ROPE.trackY - 4, ROPE.right - ROPE.left, 8, 4)
    for (let i = -ROPE.robotSteps; i <= ROPE.steps; i++) {
        const x = markerX(i)
        const last = i === ROPE.steps
        track.fillStyle(last ? C.gold : C.ink, last ? 1 : 0.3)
        track.fillRoundedRect(x - 3, ROPE.trackY - (last ? 14 : 10), 6, last ? 28 : 20, 3)
    }
    track.fillStyle(C.ink, 0.5)
    track.fillCircle(markerX(0), ROPE.trackY, 6)
    root.add(track)

    const rope = scene.textures.exists(ROPE_TEXTURE)
        ? scene.add.tileSprite(ROPE.drawLeft + width / 2, ROPE.y, width, ROPE.thickness, ROPE_TEXTURE)
        : null

    if (rope) {
        const scale = ROPE.thickness / ROPE.textureHeight
        rope.setTileScale(scale, scale)
    }

    if (!rope) {
        const g = scene.add.graphics()
        g.fillStyle(C.woodDark, 1)
        g.fillRoundedRect(ROPE.drawLeft, ROPE.y - ROPE.thickness / 2, width, ROPE.thickness, ROPE.thickness / 2)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(ROPE.drawLeft, ROPE.y - ROPE.thickness / 2, width, ROPE.thickness * 0.7, ROPE.thickness / 2)
        root.add(g)
    } else {
        root.add(rope)
    }

    const marker = scene.add.graphics().setPosition(markerX(0), ROPE.y).setDepth(DEPTH.marker)
    drawMarker(marker)

    let position = 0

    return {
        get position() {
            return position
        },

        get container() {
            return root
        },

        async moveTo(next: number) {
            const clamped = Phaser.Math.Clamp(next, -ROPE.robotSteps, ROPE.steps)
            position = clamped
            if (rope) {
                void FX.to(scene, rope, { alpha: 0.85 }, { duration: 120, yoyo: true })
                rope.tilePositionX -= (clamped - position) * 10
            }
            await FX.to(scene, marker, { x: markerX(clamped) }, { duration: 420, ease: Ease.back(1.4) })
        },

        async slideHome() {
            position = ROPE.steps
            await FX.to(scene, marker, { x: markerX(ROPE.steps) }, { duration: 620, ease: Ease.smooth })
        },

        shiver() {
            if (!rope) return
            void FX.to(scene, rope, { y: ROPE.y - 4 }, { duration: 90, yoyo: true, repeat: 2 })
        },

        markerPoint() {
            return { x: marker.x, y: marker.y }
        },

        bounds() {
            return { x: (ROPE.left + ROPE.right) / 2, y: ROPE.y, w: ROPE.right - ROPE.left, h: step }
        },

        destroy() {
            scene.tweens.killTweensOf(marker)
            if (rope) scene.tweens.killTweensOf(rope)
            marker.destroy()
            root.destroy(true)
        },
    }
}

export type Rope = ReturnType<typeof createRope>
