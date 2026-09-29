import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON as TEX, BALLOON_2, BALLOON2_CELL, BALLOON_CELL, EXTRA_CELL, EXTRAS, PIECE_CELL, PIECES } from '../data/files'
import { BALLOON, BAND, DELIVERY, DEPTH, voiceOrigin } from '../data/layout'
import { C } from '../data/theme'
import type { Point } from '../types'
import { createPic } from './pic'

export interface Balloon {
    setY(y: number): void
    burner(on: boolean): void
    setMessage(icon: number): void
    releaseNote(): Point
    act(pose: 'talk' | 'tablet' | null, faceCell?: number): void
    readonly mouth: Point
    setLocked(on: boolean): void
    cheer(): void
    blown(): Promise<void>
    readonly x: number
    readonly y: number
    readonly container: Phaser.GameObjects.Container
    destroy(): void
}

const S = BALLOON.scale
const local = (cx: number, cy: number) => ({ x: (cx - BALLOON.cell / 2) * S, y: (cy - BALLOON.centerY) * S })

function paintFallback(g: Phaser.GameObjects.Graphics, flame: boolean) {
    g.clear()
    const r = 78
    g.fillStyle(C.shadow, 0.12)
    g.fillCircle(4, -24, r)
    g.fillStyle(C.coral, 1)
    g.fillCircle(0, -28, r)
    g.fillStyle(C.sun, 1)
    g.fillEllipse(0, -28, r * 0.9, r * 2)
    g.fillStyle(C.mint, 1)
    g.fillEllipse(0, -28, r * 0.35, r * 2)
    g.lineStyle(4, C.ink, 1)
    g.strokeCircle(0, -28, r)
    g.lineStyle(3, C.ink, 1)
    g.lineBetween(-30, 38, -22, 62)
    g.lineBetween(30, 38, 22, 62)
    if (flame) {
        g.fillStyle(C.sun, 1)
        g.fillTriangle(-12, 58, 12, 58, 0, 26)
        g.fillStyle(C.coral, 1)
        g.fillTriangle(-6, 58, 6, 58, 0, 38)
    }
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-28, 60, 56, 36, 8)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-28, 60, 56, 36, 8)
}

export function createBalloon(scene: Phaser.Scene): Balloon {
    const container = scene.add.container(BALLOON.x, (BAND.top + BAND.bottom) / 2).setDepth(DEPTH.balloon)
    const hasArt = scene.textures.exists(TEX)
    const image = hasArt
        ? scene.add
              .image(0, 0, TEX, BALLOON_CELL.idle)
              .setOrigin(0.5, BALLOON.centerY / BALLOON.cell)
              .setScale(S)
        : undefined
    const drawn = hasArt ? undefined : scene.add.graphics()
    if (drawn) paintFallback(drawn, false)
    const body = scene.add.container(0, 0, [image ?? (drawn as Phaser.GameObjects.Graphics)])

    const hookAt = (cell: number) => {
        const h = BALLOON.hooks[cell] ?? BALLOON.hooks[0]
        return local(h.x, h.y)
    }
    const hook = hookAt(BALLOON_CELL.idle)
    const dangle = scene.add.container(hook.x, hook.y)
    const string = scene.add.graphics()
    string.lineStyle(3, C.ink, 1)
    string.lineBetween(0, 0, 0, BALLOON.string)
    const note = createPic(scene, 0, BALLOON.string + BALLOON.message / 2 - 6, BALLOON.message)
    note.set(PIECES, PIECE_CELL.note, 'note')
    const drawing = createPic(scene, 0, BALLOON.string + BALLOON.message / 2, BALLOON.message * 0.55)
    dangle.add([string, note.container, drawing.container]).setVisible(false)
    const sway = scene.tweens.add({
        targets: dangle,
        angle: { from: -7, to: 7 },
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })

    const screenAt = local(DELIVERY.tablet.x, DELIVERY.tablet.y)
    const screenW = DELIVERY.tablet.w * S
    const screenH = DELIVERY.tablet.h * S
    const screenBack = scene.add.graphics()
    const face = createPic(scene, 0, 0, screenH * 1.1)
    face.set(EXTRAS, EXTRA_CELL.grandmaFace, 'vovó')
    const screen = scene.add.container(screenAt.x, screenAt.y, [screenBack, face.container]).setVisible(false)
    const paintScreen = (frame: boolean) => {
        screenBack.clear()
        if (frame) {
            screenBack.fillStyle(C.lilac, 1)
            screenBack.fillRoundedRect(-screenW / 2 - 8, -screenH / 2 - 8, screenW + 16, screenH + 16, 10)
            screenBack.lineStyle(3, C.ink, 1)
            screenBack.strokeRoundedRect(-screenW / 2 - 8, -screenH / 2 - 8, screenW + 16, screenH + 16, 10)
        }
        screenBack.fillStyle(C.cream, 1)
        screenBack.fillRoundedRect(-screenW / 2, -screenH / 2, screenW, screenH, 6)
    }

    const basket = local(BALLOON.basketX, BALLOON.basketY)
    const lock = createPic(scene, 0, 0, 58)
    lock.set(PIECES, PIECE_CELL.lock, 'lock')
    const lockHolder = scene.add.container(basket.x, basket.y, [lock.container]).setVisible(false)
    let lockTween: Phaser.Tweens.Tween | undefined

    container.add([dangle, body, screen, lockHolder])

    const pose = (cell: number, flame = false) => {
        const h = hookAt(cell)
        dangle.setPosition(h.x, h.y)
        if (image && image.texture.key !== TEX) image.setTexture(TEX, cell)
        else if (image) image.setFrame(cell)
        else if (drawn) paintFallback(drawn, flame)
    }

    let burning = false

    return {
        setY(y) {
            container.y = y
        },
        burner(on) {
            if (on === burning) return
            burning = on
            pose(on ? BALLOON_CELL.burn : BALLOON_CELL.idle, on)
            FX.kill(scene, body)
            body.setScale(1)
            if (on) void FX.to(scene, body, { scaleY: 1.03, scaleX: 0.98 }, { duration: 160 })
            else void FX.to(scene, body, { scaleY: 1, scaleX: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        setMessage(icon) {
            drawing.set(PIECES, icon, `msg ${icon}`)
            dangle.setVisible(true)
        },
        act(which, faceCell) {
            screen.setVisible(false)
            if (!which) {
                if (image) image.setTexture(TEX, BALLOON_CELL.idle)
                pose(BALLOON_CELL.idle)
                return
            }
            const hasPose = !!image && scene.textures.exists(BALLOON_2)
            if (hasPose && image) image.setTexture(BALLOON_2, BALLOON2_CELL[which])
            if (which === 'tablet') {
                face.set(EXTRAS, faceCell ?? EXTRA_CELL.grandmaFace, 'rosto')
                paintScreen(!hasPose)
                screen.setVisible(true)
                void FX.popIn(scene, screen, { from: 0.6 })
            }
            if (which === 'talk' && !hasPose) void FX.to(scene, body, { angle: 6 }, { duration: 160, yoyo: true, repeat: 1 })
        },
        get mouth() {
            return voiceOrigin(container.y)
        },
        releaseNote() {
            const point = {
                x: container.x + dangle.x,
                y: container.y + dangle.y + BALLOON.string + BALLOON.message / 2,
            }
            dangle.setVisible(false)
            return point
        },
        setLocked(on) {
            lockTween?.remove()
            lockTween = undefined
            if (on) {
                lockHolder.setVisible(true).setAngle(0).setAlpha(1).setPosition(basket.x, basket.y)
                void FX.popIn(scene, lockHolder, { from: 0.4 })
                lockTween = scene.tweens.add({
                    targets: lockHolder,
                    angle: { from: -14, to: 14 },
                    duration: 360,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
                return
            }
            if (!lockHolder.visible) return
            void FX.to(scene, lockHolder, { y: lockHolder.y + 160, angle: 200, alpha: 0 }, { duration: 620, ease: 'Quad.easeIn' }).then(
                () => {
                    if (lockHolder.active) lockHolder.setVisible(false)
                },
            )
        },
        cheer() {
            burning = false
            pose(BALLOON_CELL.cheer)
            FX.kill(scene, body)
            body.setScale(1).setY(0)
            void FX.to(scene, body, { y: -18 }, { duration: 220, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
        },
        async blown() {
            burning = false
            pose(BALLOON_CELL.blown)
            FX.kill(scene, body)
            body.setScale(1).setAngle(0)
            const tilt = image ? 0 : -8
            await FX.to(scene, body, { angle: tilt, x: -10 }, { duration: 220, ease: 'Sine.easeOut' })
            await FX.wait(scene, 500)
            await FX.to(scene, body, { angle: 0, x: 0 }, { duration: 320, ease: 'Back.easeOut' })
            pose(BALLOON_CELL.idle)
        },
        get x() {
            return container.x
        },
        get y() {
            return container.y
        },
        container,
        destroy() {
            sway.remove()
            lockTween?.remove()
            FX.kill(scene, [body, lockHolder])
            container.destroy()
        },
    }
}
