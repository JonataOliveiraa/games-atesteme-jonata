import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CATAPULT_SHEET, FILE_CELL, PIECE, PIECE_SHEET, cellKey, cellScale } from '../data/files'
import { BALL, CATAPULT, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { FileId } from '../types'
import { fit } from './art'

export interface Catapult {
    readonly ball: Phaser.GameObjects.Container
    load(file: FileId): Promise<void>
    /** o puxão, relativo ao ponto de descanso, já limitado */
    pull(dx: number, dy: number): { x: number; y: number }
    velocity(): { vx: number; vy: number }
    pullLength(): number
    rest(): void
    fire(): void
    /** a linha de bolinhas até a aterrissagem, apagando para a ponta; `zoom` mantém o tamanho na tela */
    drawPreview(dots: Array<{ x: number; y: number }>, zoom?: number): void
    rect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

export function createCatapult(scene: Phaser.Scene): Catapult {
    const frame = scene.add
        .image(CATAPULT.x, CATAPULT.baseY, CATAPULT_SHEET.key, cellKey(0))
        .setOrigin(0.5, 300 / 320)
        .setScale(cellScale(scene, CATAPULT_SHEET, CATAPULT.scale))
        .setDepth(DEPTH.catapult)
    const bands = scene.add.graphics().setDepth(DEPTH.band)
    const dots = scene.add.graphics().setDepth(DEPTH.preview)

    const shell = fit(scene, PIECE_SHEET, PIECE.ball, BALL.size)
    const icon = scene.add.image(0, 0, PIECE_SHEET.key, cellKey(0))
    const ball = scene.add.container(CATAPULT.rest.x, CATAPULT.rest.y, [shell, icon]).setDepth(DEPTH.ball)

    let offset = { x: 0, y: 0 }

    const drawBands = () => {
        bands.clear()
        if (!ball.visible || Math.abs(ball.x - CATAPULT.rest.x) > CATAPULT.maxPull + 4) return
        if (Math.abs(ball.y - CATAPULT.rest.y) > CATAPULT.maxPull + 4) return
        CATAPULT.tips.forEach(tip => {
            bands.lineStyle(14, C.ink, 1)
            bands.lineBetween(tip.x, tip.y, ball.x, ball.y)
            bands.lineStyle(8, C.band, 1)
            bands.lineBetween(tip.x, tip.y, ball.x, ball.y)
        })
    }

    const place = () => {
        ball.setPosition(CATAPULT.rest.x + offset.x, CATAPULT.rest.y + offset.y)
        drawBands()
    }

    return {
        ball,
        async load(file) {
            icon.setFrame(cellKey(FILE_CELL[file]))
            icon.setScale(BALL.icon / Math.max(icon.frame.width, icon.frame.height))
            offset = { x: 0, y: 0 }
            ball.setRotation(0).setAlpha(1).setVisible(true).setScale(1)
            place()
            await FX.popIn(scene, ball, { from: 0.2, duration: 320 })
        },
        pull(dx, dy) {
            const length = Math.hypot(dx, dy)
            const k = length > CATAPULT.maxPull ? CATAPULT.maxPull / length : 1
            offset = { x: dx * k, y: Math.min(dy * k, CATAPULT.maxDown) }
            place()
            frame.setAngle(Phaser.Math.Clamp(offset.x / 30, -4, 4))
            return { x: ball.x, y: ball.y }
        },
        velocity: () => ({ vx: -offset.x * CATAPULT.power, vy: -offset.y * CATAPULT.power }),
        pullLength: () => Math.hypot(offset.x, offset.y),
        rest() {
            offset = { x: 0, y: 0 }
            frame.setAngle(0)
            void FX.to(scene, ball, { x: CATAPULT.rest.x, y: CATAPULT.rest.y }, { duration: 220, ease: 'Back.easeOut' }).then(drawBands)
            bands.clear()
        },
        fire() {
            offset = { x: 0, y: 0 }
            bands.clear()
            dots.clear()
            frame.setAngle(0)
            void FX.impact(scene, frame, 0.12)
        },
        drawPreview(list, zoom = 1) {
            dots.clear()
            const k = 1 / zoom
            const last = list.length - 1
            list.forEach((p, i) => {
                if (i === last) return
                const a = 0.95 - (0.6 * i) / Math.max(1, last)
                dots.fillStyle(C.ink, a * 0.45)
                dots.fillCircle(p.x, p.y + 2 * k, 7 * k)
                dots.fillStyle(C.preview, a)
                dots.fillCircle(p.x, p.y, 6 * k)
            })
            if (last < 1) return
            const end = list[last]
            dots.fillStyle(C.preview, 0.3)
            dots.fillCircle(end.x, end.y, BALL.r)
            dots.lineStyle(3 * k, C.preview, 0.55)
            dots.strokeCircle(end.x, end.y, BALL.r)
        },
        rect: () => ({ x: CATAPULT.x, y: 370, w: 240, h: 230 }),
        destroy() {
            bands.destroy()
            dots.destroy()
            ball.destroy()
            frame.destroy()
        },
    }
}
