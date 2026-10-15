import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAR_SHEET, cellKey } from '../data/files'
import { DEPTH, PANEL } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { FACE, PANEL_TEXT, colLabel, rowLabel } from '../data/words'
import type { Cell, Facing, Scheme } from '../types'

const ROW_CSS = '#b89cf0'
const COL_CSS = '#5fd0b0'
const CREAM = '#fff6e4'
const GAP = 12
const MINI = 18

function chip(scene: Phaser.Scene, text: string, bg: string, size: number) {
    return scene.add
        .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.ink, backgroundColor: bg, padding: { x: 10, y: 2 } })
        .setOrigin(0, 0.5)
        .setResolution(2)
}

type Part = Phaser.GameObjects.Text | Phaser.GameObjects.Container
type Shown = { cell: Cell; scheme?: Scheme; face?: Facing; rows: number; cols: number }

/** a miniatura da matriz, com a vaga pedida acesa (a representação `map`) */
function miniMap(scene: Phaser.Scene, cell: Cell, rows: number, cols: number) {
    const g = scene.add.graphics()
    const w = cols * MINI
    const h = rows * MINI
    g.fillStyle(0xfff6e4, 1)
    g.fillRoundedRect(-4, -h / 2 - 4, w + 8, h + 8, 6)
    for (let l = 1; l <= rows; l++)
        for (let c = 1; c <= cols; c++) {
            const on = l === cell[0] && c === cell[1]
            g.fillStyle(on ? C.star : 0xc7cdd8, 1)
            g.fillRect((c - 1) * MINI + 1, -h / 2 + (l - 1) * MINI + 1, MINI - 2, MINI - 2)
        }
    g.lineStyle(2, C.ink, 1)
    g.strokeRoundedRect(-4, -h / 2 - 4, w + 8, h + 8, 6)
    const box = scene.add.container(0, 0, [g])
    box.setSize(w + 8, h + 8)
    return box
}

/** "DE FRENTE" / "DE RÉ" com um carrinho virado para o lado certo (o fundo da vaga é para cima) */
function faceBadge(scene: Phaser.Scene, face: Facing) {
    const car = scene.add.image(18, 0, CAR_SHEET.key, cellKey(1))
    car.setScale(36 / car.frame.height).setRotation(face === 'front' ? 0 : Math.PI)
    const label = scene.add
        .text(40, 0, FACE[face], { fontFamily: FONT.black, fontSize: '22px', color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const bg = scene.add.graphics()
    const w = 50 + label.width
    bg.fillStyle(0xffd84d, 1)
    bg.fillRoundedRect(-6, -22, w, 44, 14)
    const box = scene.add.container(0, 0, [bg, car, label])
    box.setSize(w, 44)
    return box
}

const widthOf = (p: Part) => (p instanceof Phaser.GameObjects.Text ? p.width : p.width)

/** O painel luminoso do alto: a vaga pedida, na representação do pedido, e (N3) de frente ou de ré. */
export function createPanel(scene: Phaser.Scene) {
    const g = scene.add.graphics()
    const box = scene.add.container(PANEL.x, PANEL.y, [g]).setDepth(DEPTH.panel).setVisible(false)
    let parts: Part[] = []
    let rowPart: Part | undefined
    let colPart: Part | undefined
    let width: number = PANEL.w

    const paint = (w: number) => {
        const h = PANEL.h
        g.clear()
        g.fillStyle(C.shadow, 0.25)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 22)
        g.fillStyle(0x2e2a63, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        g.lineStyle(5, C.ink, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
    }

    const text = (s: string) =>
        scene.add.text(0, 0, s, { fontFamily: FONT.black, fontSize: '30px', color: CREAM }).setOrigin(0, 0.5).setResolution(2)

    return {
        set({ cell, scheme = 'lc', face, rows, cols }: Shown) {
            parts.forEach(p => p.destroy())
            rowPart = colPart = undefined
            if (scheme === 'map') {
                parts = [text(PANEL_TEXT.map), miniMap(scene, cell, rows, cols)]
            } else {
                rowPart = chip(scene, rowLabel(cell[0], scheme), ROW_CSS, 34)
                colPart = chip(scene, colLabel(cell[1], scheme), COL_CSS, 34)
                parts = scheme === 'lc' ? [text(PANEL_TEXT.park), rowPart, text(','), colPart] : [text(PANEL_TEXT.park), rowPart, colPart]
            }
            if (face) parts.push(faceBadge(scene, face))
            const total = parts.reduce((s, p) => s + widthOf(p), 0) + GAP * (parts.length - 1)
            width = Math.max(PANEL.w, total + 56)
            paint(width)
            let x = -total / 2
            parts.forEach(p => {
                p.setX(x)
                x += widthOf(p) + GAP
            })
            box.add(parts)
            box.setVisible(true)
            void FX.to(scene, box, { scale: 1.08 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
        },
        rect() {
            return { x: PANEL.x, y: PANEL.y, w: width + 20, h: PANEL.h + 20 }
        },
        /** o centro de baixo do chip da linha ou da coluna, na tela */
        chip(which: 'row' | 'col') {
            const p = which === 'row' ? rowPart : colPart
            if (!p) return { x: PANEL.x, y: PANEL.y }
            return { x: box.x + p.x + widthOf(p) / 2, y: box.y + 22 }
        },
        bump(which: 'row' | 'col') {
            const p = which === 'row' ? rowPart : colPart
            if (p) void FX.to(scene, p, { scale: 1.25 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
        },
        destroy() {
            box.destroy()
        },
    }
}
