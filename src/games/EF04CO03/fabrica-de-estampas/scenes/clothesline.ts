import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BELT, BELT_SHEET, PRINT, PRINT_OF, PRINT_SHEET, ROPE_STRIP } from '../data/files'
import { COUNT, DEPTH, FABRIC, HANG, LINE } from '../data/layout'
import { C, FIG_COLOR, FONT, inkOn, SIZE } from '../data/theme'
import type { Fig } from '../types'
import { fit } from './art'
import type { Rect } from './guide'

export interface Clothesline {
    /**
     * O varal desce, o rolo sobe até a ponta dele e desenrola pendurado.
     * `turnEnds` são os quadradinhos que fecham uma volta (a emenda vem depois deles).
     */
    hang(figs: Fig[], turnEnds: number[], bundle: Phaser.GameObjects.Image): Promise<void>
    /** conta as figuras, da esquerda para a direita, com um numerinho embaixo de cada uma */
    count(fig: Fig, onNumber: (n: number) => void): Promise<number>
    rect(): Rect
    leave(): Promise<void>
    destroy(): void
}

export function createClothesline(scene: Phaser.Scene, onUnroll: () => void): Clothesline {
    let cell: number = FABRIC.cell
    let hangY = 0
    let line: Phaser.GameObjects.Container | undefined
    let squares: Array<{ fig: Fig; x: number }> = []

    const xOf = (i: number, n: number) => 640 + (i - (n - 1) / 2) * cell

    const build = () => {
        line?.destroy()
        line = scene.add.container(0, LINE.enterDy).setDepth(DEPTH.line)
        const stripH = scene.textures.get(ROPE_STRIP).getSourceImage().height || 1
        const scale = LINE.rope / stripH
        const rope = scene.add
            .tileSprite((LINE.x0 + LINE.x1) / 2, LINE.y, (LINE.x1 - LINE.x0) / scale, stripH, ROPE_STRIP)
            .setScale(scale)
        const left = fit(scene, BELT_SHEET, BELT.hook, LINE.hook).setPosition(LINE.x0 - 4, LINE.y)
        const right = fit(scene, BELT_SHEET, BELT.hook, LINE.hook).setPosition(LINE.x1 + 4, LINE.y).setFlipX(true)
        line.add([rope, left, right])
        return line
    }

    return {
        async hang(figs, turnEnds, bundle) {
            const n = figs.length
            cell = Math.min(FABRIC.cell, (LINE.x1 - LINE.x0 - 80) / n)
            hangY = LINE.y + LINE.rope / 2 + HANG.gap + cell / 2
            const box = build()
            squares = figs.map((fig, i) => ({ fig, x: xOf(i, n) }))
            await FX.to(scene, box, { y: 0 }, { duration: 420, ease: 'Back.easeOut' })

            const start = xOf(0, n) - cell / 2
            bundle.setDepth(DEPTH.hanging + 1)
            await FX.to(scene, bundle, { x: start, y: hangY, rotation: -2 }, { duration: 380, ease: 'Sine.easeInOut' })
            onUnroll()

            const top = hangY - cell / 2
            const pegAt = (x: number) => {
                const peg = fit(scene, PRINT_SHEET, PRINT.peg, cell * 0.45).setPosition(x, top - 2)
                box.add(peg)
                void FX.popIn(scene, peg, { from: 0.4, duration: 200 })
            }
            pegAt(start + 8)
            for (let i = 0; i < n; i++) {
                const x = xOf(i, n)
                const linen = fit(scene, PRINT_SHEET, PRINT.linen, cell)
                linen.setDisplaySize(cell + 1, cell)
                const mark = fit(scene, PRINT_SHEET, PRINT_OF[figs[i]], cell * 0.72)
                const square = scene.add.container(x, hangY, [linen, mark]).setScale(0, 1)
                box.addAt(square, 1)
                void FX.to(scene, square, { scaleX: 1 }, { duration: 110, ease: 'Sine.easeOut' })
                void FX.to(scene, bundle, { x: x + cell / 2, rotation: bundle.rotation + 1.2 }, { duration: 110, ease: 'Linear' })
                await FX.wait(scene, 80)
                if (turnEnds.includes(i) && i < n - 1) {
                    const g = scene.add.graphics()
                    g.lineStyle(5, C.outer, 1)
                    for (let y = top + 6; y < top + cell - 6; y += 15) g.lineBetween(x + cell / 2, y, x + cell / 2, Math.min(top + cell - 6, y + 9))
                    box.add(g)
                    pegAt(x + cell / 2)
                }
            }
            pegAt(xOf(n - 1, n) + cell / 2 - 8)
            await FX.to(scene, bundle, { alpha: 0, scale: bundle.scale * 0.4 }, { duration: 200 })
            bundle.setVisible(false)
        },
        async count(fig, onNumber) {
            const box = line
            if (!box) return 0
            let n = 0
            for (const sq of squares) {
                if (sq.fig !== fig) continue
                n += 1
                const tone = FIG_COLOR[fig].fill
                const g = scene.add.graphics()
                g.fillStyle(C.shadow, 0.18)
                g.fillCircle(2, 4, COUNT.r)
                g.fillStyle(tone, 1)
                g.fillCircle(0, 0, COUNT.r)
                g.lineStyle(4, C.ink, 1)
                g.strokeCircle(0, 0, COUNT.r)
                const label = scene.add
                    .text(0, 1, `${n}`, { fontFamily: FONT.black, fontSize: `${SIZE.count}px`, color: inkOn(tone) })
                    .setOrigin(0.5)
                    .setResolution(2)
                const tag = scene.add.container(sq.x, hangY + cell / 2 + COUNT.r - 8, [g, label])
                box.add(tag)
                onNumber(n)
                await FX.popIn(scene, tag, { from: 0.2, duration: 220 })
                await FX.wait(scene, 140)
            }
            return n
        },
        rect() {
            const n = squares.length
            return { x: 640, y: hangY + 20, w: n * cell + 40, h: cell + 90 }
        },
        async leave() {
            const box = line
            if (!box) return
            line = undefined
            await FX.to(scene, box, { y: LINE.enterDy * 2, alpha: 0 }, { duration: 420, ease: 'Back.easeIn' })
            box.destroy()
            squares = []
        },
        destroy() {
            line?.destroy()
            line = undefined
        },
    }
}
