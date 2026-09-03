import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BG, CINEMA, DEPTH, EXPLORER, H, SKY, SMALL_CHEST, TRAIL, W } from '../data/layout'
import { C } from '../data/theme'

const CHEST_SHEET = 'bau'
const EXPLORER_SHEET = 'explorador'
const WALK_ANIM = 'ilha-explorador-anda'

const STAND_OFFSET = -74

const STAR: Array<[number, number]> = [
    [0, -1], [0.28, -0.28], [1, 0], [0.28, 0.28],
    [0, 1], [-0.28, 0.28], [-1, 0], [-0.28, -0.28],
]

function drawFootprint(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(C.sandDeep, 0.3)
    g.fillEllipse(x, y + 4, 32, 16)
    for (let t = -1; t <= 1; t++) g.fillCircle(x + 18, y + 4 + t * 6, 3.8)
    g.fillStyle(C.sand, 0.95)
    g.fillEllipse(x, y, 30, 15)
    for (let t = -1; t <= 1; t++) g.fillCircle(x + 17, y + t * 6, 3.6)
}

function drawTreasureMark(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(C.sand, 0.5)
    g.fillEllipse(x, y, SMALL_CHEST.w * 1.25, 34)
    g.lineStyle(6, C.sandDeep, 0.45)
    g.strokeEllipse(x, y, SMALL_CHEST.w * 1.25, 34)
    g.fillStyle(C.ink, 0.16)
    g.fillEllipse(x, y + 4, SMALL_CHEST.w * 0.9, 16)
}

export function createIsland(scene: Phaser.Scene, chestCount: number) {
    const sky = scene.add.graphics().setDepth(DEPTH.sky)
    sky.fillStyle(C.sky, 1)
    sky.fillRect(-W, SKY.mid, W * 3, H * 2 - SKY.mid)
    sky.fillGradientStyle(C.skyTop, C.skyTop, C.skyMid, C.skyMid, 1)
    sky.fillRect(-W, -H, W * 3, H + SKY.top)
    sky.fillGradientStyle(C.skyMid, C.skyMid, C.sky, C.sky, 1)
    sky.fillRect(-W, SKY.top, W * 3, SKY.mid - SKY.top)

    const scenery: Phaser.GameObjects.GameObject[] = [sky]

    if (scene.textures.exists('bg-ilha')) {
        const bg = scene.add.image(W / 2, H / 2 + BG.dy, 'bg-ilha')
        bg.setDisplaySize(W, H).setDepth(DEPTH.scenery)
        scenery.push(bg)
    }

    const tail = scene.add.rectangle(W / 2, (BG.tail + H) / 2, W, H - BG.tail, C.sandDark)
        .setDepth(DEPTH.scenery)
    scenery.push(tail)

    const trail = scene.add.graphics().setDepth(DEPTH.trail)
    for (let i = 0, x = 150; x <= 1140; x += 58, i++) {
        const y = TRAIL.y + Math.sin(x / 130) * 5 + (i % 2 === 0 ? -9 : 9)
        drawFootprint(trail, x, y)
    }

    const marks = scene.add.graphics().setDepth(DEPTH.trail)
    TRAIL.chests.slice(0, chestCount).forEach(x => drawTreasureMark(marks, x, TRAIL.baseY + 2))

    const chests = TRAIL.chests.slice(0, chestCount).map(x => {
        const sprite = scene.add.sprite(x, TRAIL.baseY, CHEST_SHEET, 0)
            .setOrigin(0.5, 0.95)
            .setDepth(DEPTH.smallChest)
        if (scene.textures.exists(CHEST_SHEET)) {
            sprite.setDisplaySize(SMALL_CHEST.w, SMALL_CHEST.w * (250 / 300))
        } else {
            sprite.setVisible(false)
        }
        return sprite
    })

    if (scene.textures.exists(EXPLORER_SHEET) && !scene.anims.exists(WALK_ANIM)) {
        scene.anims.create({
            key: WALK_ANIM,
            frames: scene.anims.generateFrameNumbers(EXPLORER_SHEET, { frames: [0, 1] }),
            frameRate: 6,
            repeat: -1,
        })
    }

    const explorer = scene.add.sprite(EXPLORER.startX, EXPLORER.baseY, EXPLORER_SHEET, 0)
        .setOrigin(0.5, 0.98)
        .setDepth(DEPTH.explorer)
    if (scene.textures.exists(EXPLORER_SHEET)) {
        explorer.setDisplaySize(EXPLORER.h * (250 / 370), EXPLORER.h)
    } else {
        explorer.setVisible(false)
    }

    const shadow = scene.add.ellipse(explorer.x, EXPLORER.baseY + 4, 62, 16, C.ink, 0.18)
        .setDepth(DEPTH.trail)

    const pieces: Phaser.GameObjects.Graphics[] = []

    const stopAt = (index: number) => TRAIL.chests[index] + STAND_OFFSET

    return {
        async walkTo(index: number) {
            const target = stopAt(index)
            const distance = Math.abs(target - explorer.x)
            if (distance < 4) return
            if (scene.anims.exists(WALK_ANIM)) explorer.play(WALK_ANIM, true)

            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: [explorer, shadow],
                    x: target,
                    duration: FX.ms(scene, Math.max(420, distance * 2.2)),
                    ease: 'Sine.easeInOut',
                    onComplete: () => resolve(),
                })
            })

            explorer.stop()
            explorer.setFrame(0)
        },

        async travelTo(index: number) {
            const cam = scene.cameras.main
            const target = stopAt(index)
            const distance = Math.abs(target - explorer.x)
            const halfW = W / 2 / CINEMA.zoom
            const halfH = H / 2 / CINEMA.zoom
            const panX = Phaser.Math.Clamp((explorer.x + target) / 2, halfW, W - halfW)
            const panY = Phaser.Math.Clamp(EXPLORER.baseY - 46, halfH, H - halfH)

            cam.pan(panX, panY, FX.ms(scene, CINEMA.pan), 'Sine.easeInOut')
            cam.zoomTo(CINEMA.zoom, FX.ms(scene, CINEMA.pan), 'Sine.easeInOut')
            await FX.wait(scene, CINEMA.pan + 60)

            if (scene.anims.exists(WALK_ANIM)) explorer.play(WALK_ANIM, true)
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: [explorer, shadow],
                    x: target,
                    duration: FX.ms(
                        scene,
                        Math.max(CINEMA.walkMin, distance * CINEMA.walkPerPx),
                    ),
                    ease: 'Sine.easeInOut',
                    onComplete: () => resolve(),
                })
            })
            explorer.stop()
            explorer.setFrame(0)

            cam.pan(W / 2, H / 2, FX.ms(scene, CINEMA.pan), 'Sine.easeInOut')
            cam.zoomTo(1, FX.ms(scene, CINEMA.pan), 'Sine.easeInOut')
            await FX.wait(scene, CINEMA.pan + 60)
        },

        sendPiece(from: { x: number; y: number }, index: number) {
            const target = TRAIL.chests[index]
            if (target === undefined) return

            const piece = scene.add.graphics().setDepth(DEPTH.fx)
            piece.fillStyle(C.warnDark, 1)
            piece.fillCircle(0, 4, 18)
            piece.fillStyle(C.warn, 1)
            piece.fillCircle(0, 0, 18)
            piece.fillStyle(C.cream, 0.95)
            piece.fillPoints(
                STAR.map(([x, y]) => new Phaser.Math.Vector2(x * 12, y * 12)),
                true,
            )
            piece.fillStyle(C.white, 0.7)
            piece.fillCircle(-6, -7, 4)
            piece.setPosition(from.x, from.y)

            pieces.push(piece)

            scene.tweens.add({
                targets: piece,
                x: target,
                y: TRAIL.baseY - 74,
                scale: { from: 1.2, to: 0.66 },
                duration: FX.ms(scene, 620),
                ease: 'Cubic.easeInOut',
                onComplete: () => {
                    const sprite = chests[index]
                    if (sprite) {
                        sprite.setFrame(2)
                        FX.popIn(scene, sprite, { from: 0.72, duration: 300 })
                    }
                    FX.float(scene, piece, { amount: 5, duration: 1600 })
                },
            })
        },

        async celebrate() {
            explorer.stop()
            explorer.setFrame(2)

            const glow = scene.add.sprite(explorer.x, explorer.y, EXPLORER_SHEET, 2)
                .setOrigin(0.5, 0.98)
                .setDepth(DEPTH.explorer - 1)
                .setTintFill(C.warn)
                .setAlpha(0.75)
            glow.setDisplaySize(explorer.displayWidth, explorer.displayHeight)

            scene.tweens.add({
                targets: glow,
                scaleX: glow.scaleX * 1.35,
                scaleY: glow.scaleY * 1.35,
                alpha: 0,
                duration: FX.ms(scene, 620),
                ease: 'Cubic.easeOut',
                onComplete: () => glow.destroy(),
            })

            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: explorer,
                    y: EXPLORER.baseY - 26,
                    duration: FX.ms(scene, 260),
                    ease: 'Sine.easeOut',
                    yoyo: true,
                    repeat: 1,
                    onComplete: () => resolve(),
                })
            })
        },

        destroy() {
            const cam = scene.cameras.main
            cam.panEffect.reset()
            cam.zoomEffect.reset()
            cam.setZoom(1)
            cam.centerOn(W / 2, H / 2)
            scenery.forEach(o => o.destroy())
            trail.destroy()
            marks.destroy()
            pieces.forEach(p => p.destroy())
            chests.forEach(s => s.destroy())
            shadow.destroy()
            explorer.destroy()
        },
    }
}
