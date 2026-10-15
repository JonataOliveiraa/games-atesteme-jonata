import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BELT, BELT_SHEET, BELT_STRIP, cellKey, PRINT, PRINT_OF, PRINT_SHEET, SMUDGE_OF } from '../data/files'
import { BELT as BAND, DEPTH, FABRIC, ROLL, ROLLED, W, WINDOW } from '../data/layout'
import { C, FIG_COLOR } from '../data/theme'
import type { Fig } from '../types'
import { fit, fitHeight } from './art'
import type { Rect } from './guide'

type Point = { x: number; y: number }

export interface Fabric {
    /** o tecido novo sai do rolo até o 1º quadradinho ficar embaixo da janela */
    start(squares: number): Promise<void>
    /** o tecido anda um quadradinho para a esquerda */
    advance(): Promise<void>
    print(index: number, fig: Fig): void
    smudge(index: number, fig: Fig): void
    shake(index: number): Promise<void>
    /** a agulha costura a emenda depois do quadradinho */
    seam(index: number): Promise<void>
    /** o tecido pronto enrola e o rolo para ao lado da janela */
    rollUp(): Promise<Phaser.GameObjects.Image>
    squarePos(index: number): Point
    squareRect(index: number): Rect
    windowRect(): Rect
    clear(): void
    destroy(): void
}

export function createFabric(scene: Phaser.Scene, onBelt: () => void): Fabric {
    const cell = FABRIC.cell
    const stripH = scene.textures.get(BELT_STRIP).getSourceImage().height || 1
    const tile = BAND.h / stripH
    const belt = scene.add
        .tileSprite(W / 2, BAND.y, (W + 40) / tile, stripH, BELT_STRIP)
        .setScale(tile)
        .setDepth(DEPTH.belt)
    const frame = fitHeight(scene, BELT_SHEET, BELT.window, WINDOW.h)
        .setPosition(WINDOW.x, FABRIC.y - WINDOW.h * WINDOW.openDy)
        .setDepth(DEPTH.window)
    const roll = fit(scene, BELT_SHEET, BELT.roll, ROLL.size).setPosition(ROLL.x, ROLL.y).setDepth(DEPTH.roll)

    let strip: Phaser.GameObjects.Container | undefined
    let squares: Phaser.GameObjects.Container[] = []
    let seams: Array<{ g: Phaser.GameObjects.Graphics; i: number }> = []
    let hem: Phaser.GameObjects.Image | undefined
    let rolled: Phaser.GameObjects.Image | undefined
    let cursor = 0

    const localX = (i: number) => WINDOW.x + i * cell

    const scroll = (dx: number, duration: number) =>
        FX.to(scene, belt, { tilePositionX: belt.tilePositionX + dx / tile }, { duration, ease: 'Sine.easeInOut' })

    const inkDots = (x: number, y: number, fig: Fig) => {
        const color = FIG_COLOR[fig].fill
        for (let k = 0; k < 7; k++) {
            const a = (k / 7) * Math.PI * 2 + Math.random() * 0.4
            const dot = scene.add.circle(x, y, 4 + Math.random() * 3, color).setDepth(DEPTH.fx)
            void FX.to(scene, dot, { x: x + Math.cos(a) * 54, y: y + Math.sin(a) * 40, alpha: 0, scale: 0.4 }, { duration: 380, ease: 'Sine.easeOut' }).then(
                () => dot.destroy(),
            )
        }
    }

    const clear = () => {
        strip?.destroy()
        rolled?.destroy()
        strip = undefined
        rolled = undefined
        hem = undefined
        squares = []
        seams = []
        cursor = 0
    }

    const pos = (i: number): Point => ({ x: (strip?.x ?? 0) + localX(i), y: FABRIC.y })

    return {
        async start(n) {
            clear()
            scene.tweens.killTweensOf(frame)
            if (frame.alpha < 1) void FX.to(scene, frame, { alpha: 1 }, { duration: 300 })
            strip = scene.add.container(FABRIC.enterFrom - WINDOW.x, 0).setDepth(DEPTH.fabric)
            for (let i = 0; i < n; i++) {
                const linen = fit(scene, PRINT_SHEET, PRINT.linen, cell)
                linen.setDisplaySize(cell + 1, cell)
                const square = scene.add.container(localX(i), FABRIC.y, [linen])
                squares.push(square)
                strip.add(square)
            }
            hem = scene.add.image(0, FABRIC.y, PRINT_SHEET.key, cellKey(PRINT.hem))
            hem.setScale(cell / hem.frame.height)
            hem.setX(localX(0) - cell / 2 - hem.displayWidth / 2 + 2)
            strip.add(hem)
            onBelt()
            await FX.all(
                FX.to(scene, strip, { x: 0 }, { duration: 760, ease: 'Sine.easeOut' }),
                scroll(FABRIC.enterFrom - WINDOW.x, 760),
            )
        },
        async advance() {
            if (!strip) return
            cursor += 1
            onBelt()
            await FX.all(FX.to(scene, strip, { x: -cursor * cell }, { duration: 300, ease: 'Sine.easeInOut' }), scroll(cell, 300))
        },
        print(i, fig) {
            const square = squares[i]
            if (!square) return
            const mark = fit(scene, PRINT_SHEET, PRINT_OF[fig], cell * 0.72)
            const scale = mark.scale
            mark.setScale(scale * 1.25).setAlpha(0)
            square.add(mark)
            void FX.to(scene, mark, { scale, alpha: 1 }, { duration: 140, ease: 'Back.easeOut' })
            const p = pos(i)
            inkDots(p.x, p.y, fig)
        },
        smudge(i, fig) {
            const square = squares[i]
            if (!square) return
            const mark = fit(scene, PRINT_SHEET, SMUDGE_OF[fig], cell * 0.9)
            square.add(mark)
            void FX.popIn(scene, mark, { from: 1.3, duration: 200 })
            const p = pos(i)
            inkDots(p.x, p.y, fig)
        },
        async shake(i) {
            const square = squares[i]
            if (square) await FX.shake(scene, square, { amount: 9, times: 4 })
        },
        async seam(i) {
            if (!strip) return
            const x = localX(i) + cell / 2
            const top = FABRIC.y - cell / 2 + 6
            const bottom = FABRIC.y + cell / 2 - 6
            const g = scene.add.graphics()
            strip.add(g)
            seams.push({ g, i })
            const needle = fit(scene, PRINT_SHEET, PRINT.needle, 46).setDepth(DEPTH.fx)
            const nx = () => (strip?.x ?? 0) + x + 16
            needle.setPosition(nx(), top - 12)
            const dash = 9
            const gap = 6
            const total = Math.ceil((bottom - top) / (dash + gap))
            const run = { k: 0 }
            const draw = () => {
                g.clear()
                g.lineStyle(5, C.outer, 1)
                for (let k = 0; k < Math.floor(run.k); k++) {
                    const y0 = top + k * (dash + gap)
                    g.lineBetween(x, y0, x, Math.min(bottom, y0 + dash))
                }
                needle.setPosition(nx(), top - 12 + (run.k / total) * (bottom - top))
            }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: run,
                    k: total,
                    duration: FX.ms(scene, 320),
                    ease: 'Linear',
                    onUpdate: draw,
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            draw()
            void FX.to(scene, needle, { y: bottom + 18, alpha: 0 }, { duration: 200 }).then(() => needle.destroy())
        },
        async rollUp() {
            const n = squares.length
            const left = pos(0).x - cell / 2
            const bundle = fit(scene, BELT_SHEET, BELT.rolled, ROLLED.size * 0.55)
                .setPosition(left, FABRIC.y)
                .setDepth(DEPTH.fabric + 1)
            const small = bundle.scale
            const full = small / 0.55
            rolled = bundle
            hem?.setVisible(false)
            const run = { p: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: run,
                    p: n,
                    duration: FX.ms(scene, 130 * n),
                    ease: 'Linear',
                    onUpdate: () => {
                        bundle.x = left + run.p * cell
                        bundle.rotation = run.p * 1.4
                        bundle.setScale(small + ((full - small) * run.p) / n)
                        squares.forEach((sq, i) => sq.setVisible(i + 0.5 > run.p))
                        seams.forEach(s => s.g.setVisible(s.i + 1 > run.p))
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            squares.forEach(sq => sq.setVisible(false))
            seams.forEach(s => s.g.setVisible(false))
            bundle.setDepth(DEPTH.ask)
            await FX.all(
                FX.to(scene, bundle, { x: ROLLED.x, y: ROLLED.y, rotation: 0 }, { duration: 320, ease: 'Back.easeOut' }),
                FX.to(scene, frame, { alpha: 0 }, { duration: 260 }),
            )
            return bundle
        },
        squarePos: pos,
        squareRect(i) {
            const p = pos(i)
            return { x: p.x, y: p.y, w: cell + 18, h: cell + 18 }
        },
        windowRect() {
            return { x: frame.x, y: frame.y, w: frame.displayWidth + 16, h: frame.displayHeight + 16 }
        },
        clear,
        destroy() {
            clear()
            belt.destroy()
            frame.destroy()
            roll.destroy()
        },
    }
}
