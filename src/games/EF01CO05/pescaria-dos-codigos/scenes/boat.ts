import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BOAT_CELL, BOAT_SHEET, HOOK_ART, PIECE_CELL, PIECES } from '../data/files'
import { BEAM, BOAT, DEPTH, FISH, HOOK, ROD_TIP, SAIL, WATER } from '../data/layout'
import { C } from '../data/theme'
import type { BoatPose, Point } from '../types'
import type { FishView } from './school'

export interface Boat {
    setPose(pose: BoatPose): void
    drop(to: Point): Promise<void>
    reel(): Promise<void>
    rest(): Promise<void>
    carry(fish: FishView | null): void
    bubbles(): void
    update(): void
    destroy(): void
}

const BEND = HOOK.size * 0.7
const MAST_X = 372
const MAST_TOP = 108

function paintBoat(g: Phaser.GameObjects.Graphics) {
    g.lineStyle(5, C.ink, 1)
    g.fillStyle(C.woodDark, 1)
    g.fillRect(MAST_X - 6, MAST_TOP, 12, WATER.y - MAST_TOP - 40)
    g.strokeRect(MAST_X - 6, MAST_TOP, 12, WATER.y - MAST_TOP - 40)

    g.fillStyle(C.sail, 1)
    g.beginPath()
    g.moveTo(SAIL.x + 6, SAIL.y)
    g.lineTo(SAIL.x + SAIL.w, SAIL.y - 4)
    g.lineTo(SAIL.x + SAIL.w, SAIL.y + SAIL.h + 4)
    g.lineTo(SAIL.x - 4, SAIL.y + SAIL.h)
    g.closePath()
    g.fillPath()
    g.strokePath()
    g.fillStyle(C.sailDark, 1)
    g.fillRect(SAIL.x + 2, SAIL.y + SAIL.h - 12, SAIL.w - 4, 10)

    g.fillStyle(C.wood, 1)
    g.beginPath()
    g.moveTo(150, 348)
    g.lineTo(505, 340)
    g.lineTo(470, 404)
    g.lineTo(200, 408)
    g.closePath()
    g.fillPath()
    g.strokePath()
    g.fillStyle(C.woodDark, 1)
    g.fillRect(172, 360, 312, 8)
    g.fillStyle(C.mint, 1)
    g.fillRect(162, 346, 336, 8)

    g.fillStyle(C.shirt, 1)
    g.fillRoundedRect(404, 286, 50, 58, 16)
    g.strokeRoundedRect(404, 286, 50, 58, 16)
    g.fillStyle(C.skin, 1)
    g.fillCircle(430, 256, 32)
    g.strokeCircle(430, 256, 32)
    g.fillStyle(C.hair, 1)
    g.fillEllipse(418, 238, 44, 22)
    g.fillStyle(C.hat, 1)
    g.fillRoundedRect(396, 218, 70, 22, 10)
    g.strokeRoundedRect(396, 218, 70, 22, 10)
    g.fillEllipse(431, 218, 52, 28)
    g.strokeEllipse(431, 218, 52, 28)
}

function paintFace(g: Phaser.GameObjects.Graphics, pose: BoatPose) {
    g.clear()
    g.fillStyle(C.coral, 0.8)
    g.fillEllipse(452, 268, 14, 8)
    g.lineStyle(4, C.ink, 1)
    if (pose === 'cheer') {
        g.beginPath()
        g.arc(444, 256, 6, Math.PI * 1.1, Math.PI * 1.9)
        g.strokePath()
        g.beginPath()
        g.arc(446, 270, 8, 0.1 * Math.PI, 0.9 * Math.PI)
        g.strokePath()
        g.lineStyle(10, C.skin, 1)
        g.lineBetween(412, 296, 392, 250)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(390, 246, 8)
        return
    }
    g.fillStyle(C.ink, 1)
    g.fillCircle(444, 254, pose === 'oops' ? 4 : 5)
    if (pose === 'oops') {
        g.strokeCircle(448, 272, 5)
        g.fillStyle(0x9fd9f5, 1)
        g.fillCircle(412, 238, 6)
        return
    }
    g.beginPath()
    g.arc(446, 268, 6, 0.1 * Math.PI, 0.9 * Math.PI)
    g.strokePath()
}

function paintHook(g: Phaser.GameObjects.Graphics) {
    g.lineStyle(6, C.ink, 1)
    g.beginPath()
    g.arc(0, 8, 10, 0, Math.PI)
    g.strokePath()
    g.lineBetween(10, 8, 10, -12)
    g.lineBetween(-10, 8, -14, 2)
    g.lineStyle(3, 0xdfe6ee, 1)
    g.beginPath()
    g.arc(0, 8, 10, 0, Math.PI)
    g.strokePath()
    g.lineBetween(10, 8, 10, -12)
    g.lineStyle(4, C.ink, 1)
    g.strokeCircle(10, -16, 4)
}

export function createBoat(scene: Phaser.Scene): Boat {
    const hasArt = scene.textures.exists(BOAT_SHEET)
    let image: Phaser.GameObjects.Image | undefined
    let art: Phaser.GameObjects.Graphics | undefined
    let face: Phaser.GameObjects.Graphics | undefined
    let rod: Phaser.GameObjects.Graphics | undefined

    if (hasArt) {
        image = scene.add
            .image(BOAT.x, BOAT.y, BOAT_SHEET, BOAT_CELL.idle)
            .setOrigin(0.5, BOAT.waterline / BOAT.cell)
            .setScale(BOAT.scale)
            .setDepth(DEPTH.boat)
    } else {
        art = scene.add.graphics().setDepth(DEPTH.boat)
        paintBoat(art)
        face = scene.add.graphics().setDepth(DEPTH.boat + 1)
        paintFace(face, 'idle')
        rod = scene.add.graphics().setDepth(DEPTH.boat + 1)
        rod.lineStyle(7, C.ink, 1)
        rod.lineBetween(440, 316, ROD_TIP.x, ROD_TIP.y)
        rod.lineStyle(3, C.woodDark, 1)
        rod.lineBetween(440, 316, ROD_TIP.x, ROD_TIP.y)
        rod.fillStyle(C.lilacDark, 1)
        rod.fillCircle(452, 300, 9)
        rod.lineStyle(3, C.ink, 1)
        rod.strokeCircle(452, 300, 9)
    }

    const line = scene.add.graphics().setDepth(DEPTH.line)
    const hookArt = scene.textures.exists(PIECES)
        ? scene.add.image(0, 0, PIECES, PIECE_CELL.hook).setScale(HOOK.size / HOOK_ART.h).setOrigin(0.5, HOOK_ART.ringY / 320)
        : (() => {
              const g = scene.add.graphics()
              paintHook(g)
              return g
          })()
    const hook = scene.add.container(BEAM.x, HOOK.restY, [hookArt]).setDepth(DEPTH.caught + 1)
    let carried: FishView | null = null

    const redraw = () => {
        line.clear()
        line.lineStyle(3, C.ink, 0.75)
        line.lineBetween(ROD_TIP.x, ROD_TIP.y, hook.x, hook.y)
        if (carried?.container.active) {
            carried.container.setPosition(hook.x, hook.y + BEND + FISH.mouthX)
        }
    }
    redraw()

    const dangle = () => {
        FX.kill(scene, hook)
        scene.tweens.add({ targets: hook, y: HOOK.restY + 6, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    }
    dangle()

    return {
        setPose(pose) {
            image?.setFrame(BOAT_CELL[pose])
            if (face) paintFace(face, pose)
        },
        async drop(to) {
            FX.kill(scene, hook)
            await FX.to(scene, hook, { x: to.x, y: to.y - BEND }, { duration: HOOK.dropMs, ease: 'Sine.easeIn' })
        },
        async reel() {
            FX.kill(scene, hook)
            await FX.to(scene, hook, { x: BEAM.x, y: HOOK.reelY }, { duration: HOOK.reelMs, ease: 'Sine.easeInOut' })
        },
        async rest() {
            FX.kill(scene, hook)
            await FX.to(scene, hook, { x: BEAM.x, y: HOOK.restY }, { duration: HOOK.emptyMs, ease: 'Sine.easeOut' })
            dangle()
        },
        carry(fish) {
            carried = fish
            if (fish) fish.container.setDepth(DEPTH.caught)
            redraw()
        },
        bubbles() {
            for (let i = 0; i < 3; i++) {
                const bubble = scene.add.circle(hook.x + (i - 1) * 12, hook.y, 7 - i, C.white, 0.6).setStrokeStyle(2, C.ink, 0.5)
                bubble.setDepth(DEPTH.line)
                scene.tweens.add({
                    targets: bubble,
                    y: WATER.y + 6,
                    x: bubble.x + Phaser.Math.Between(-10, 10),
                    alpha: 0,
                    delay: i * 110,
                    duration: 700,
                    ease: 'Sine.easeOut',
                    onComplete: () => bubble.destroy(),
                })
            }
        },
        update: redraw,
        destroy() {
            FX.kill(scene, hook)
            hook.destroy()
            line.destroy()
            image?.destroy()
            art?.destroy()
            face?.destroy()
            rod?.destroy()
        },
    }
}
