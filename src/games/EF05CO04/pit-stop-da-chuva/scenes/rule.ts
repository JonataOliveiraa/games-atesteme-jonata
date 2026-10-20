import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAR_CELL, MOTO_SHEET, PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { DEPTH, RULE } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { TIMING } from '../data/timing'
import { TIRES, TIRE_INK, rowsOf } from '../data/rules'
import { TEST_WORD } from '../data/words'
import type { Rect, RuleNode, RuleRow, Test } from '../types'

/**
 * A regra da equipe em linhas, como um programa: `SE … → pneu`, `SENÃO SE …`,
 * `SENÃO …`, e as linhas de dentro recuadas. A linha usada acende.
 */
export interface RuleBoard {
    readonly rows: RuleRow[]
    light(ids: number[] | null): void
    flash(id: number): Promise<void>
    shake(ids: number[]): Promise<void>
    big(): Promise<void>
    dock(): Promise<void>
    visible(on: boolean): void
    rect(): Rect
    rowRect(id: number): Rect
    destroy(): void
}

type Piece = { obj: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject; w: number; center: boolean }

const TEST_ICON: Record<Test, { sheet: string; cell: number; scale: number }> = {
    chovendo: { sheet: PIECE_SHEET.key, cell: PIECE_CELL.rainCloud, scale: 1 },
    lama: { sheet: PIECE_SHEET.key, cell: PIECE_CELL.mud, scale: 1 },
    moto: { sheet: MOTO_SHEET.key, cell: CAR_CELL.empty, scale: 1.5 },
}

export function createRule(scene: Phaser.Scene, rule: RuleNode): RuleBoard {
    const rows = rowsOf(rule)
    const text = (s: string, size: number, color: string) =>
        scene.add.text(0, 0, s, { fontFamily: FONT.black, fontSize: `${size}px`, color }).setOrigin(0, 0.5).setResolution(2)

    const chip = (s: string): Piece => {
        const label = text(s, SIZE.chip, inkOn(C.accent)).setOrigin(0.5)
        const w = label.width + 22
        const g = scene.add.graphics()
        g.fillStyle(C.accent, 1)
        g.fillRoundedRect(-w / 2, -RULE.chipH / 2, w, RULE.chipH, RULE.chipH / 2)
        return { obj: scene.add.container(0, 0, [g, label]), w, center: true }
    }
    const arrow = (): Piece => {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRect(0, -3, 18, 6)
        g.fillTriangle(16, -10, 28, 0, 16, 10)
        return { obj: g, w: 28, center: false }
    }
    const icon = (sheet: string, cell: number, size: number): Piece => {
        const img = scene.add.image(0, 0, sheet, cellKey(cell))
        img.setScale(size / Math.max(img.frame.width, img.frame.height))
        return { obj: img, w: img.displayWidth, center: true }
    }
    const word = (s: string, size: number, color: string): Piece => {
        const t = text(s, size, color)
        return { obj: t, w: t.width, center: false }
    }

    interface Line {
        row: RuleRow
        box: Phaser.GameObjects.Container
        bg: Phaser.GameObjects.Graphics
        x: number
        y: number
        w: number
    }

    const lines: Line[] = rows.map((row, i) => {
        const pieces: Piece[] = [chip(row.word)]
        if (row.test) {
            const t = TEST_ICON[row.test]
            pieces.push(icon(t.sheet, t.cell, RULE.icon * t.scale), word(TEST_WORD[row.test], SIZE.rule, CSS.ink))
        }
        if (row.tire) {
            const tire = TIRES[row.tire]
            pieces.push(arrow(), icon(PIECE_SHEET.key, tire.cell, RULE.icon), word(tire.name, SIZE.tire, CSS[TIRE_INK[row.tire]]))
        }
        let x = RULE.pad
        pieces.forEach(p => {
            p.obj.setPosition(p.center ? x + p.w / 2 : x, 0)
            x += p.w + RULE.gap
        })
        const w = x - RULE.gap + RULE.pad
        const bg = scene.add.graphics()
        const lx = row.indent * RULE.indent
        const ly = RULE.pad + i * RULE.rowH + RULE.rowH / 2
        const box = scene.add.container(lx, ly, [bg, ...pieces.map(p => p.obj)])
        return { row, box, bg, x: lx, y: ly, w }
    })

    const pw = Math.max(...lines.map(l => l.x + l.w)) + RULE.pad
    const ph = RULE.pad * 2 + rows.length * RULE.rowH
    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 0.16)
    frame.fillRoundedRect(4, 6, pw, ph, 20)
    frame.fillStyle(C.headerFace, 0.94)
    frame.fillRoundedRect(0, 0, pw, ph, 20)
    frame.lineStyle(3, C.headerRim, 1)
    frame.strokeRoundedRect(0, 0, pw, ph, 20)
    lines
        .filter(l => l.row.indent > 0)
        .forEach(l => {
            frame.fillStyle(C.headerRim, 1)
            frame.fillRoundedRect(l.x - RULE.indent / 2 - 2, l.y - RULE.rowH / 2 + 4, 4, RULE.rowH - 8, 2)
        })
    const inner = scene.add.container(-pw / 2, -ph / 2, [frame, ...lines.map(l => l.box)])
    const home = { x: RULE.x + pw / 2, y: RULE.y + ph / 2 }
    const root = scene.add.container(home.x, home.y, [inner]).setDepth(DEPTH.rule)

    let lit = new Set<number>()
    const paint = () =>
        lines.forEach(l => {
            const on = lit.has(l.row.id)
            const h = RULE.rowH - 6
            l.bg.clear()
            l.bg.fillStyle(on ? C.lit : C.headerSoft, on ? 1 : 0.7)
            l.bg.fillRoundedRect(2, -h / 2, l.w - 4, h, 14)
            l.bg.lineStyle(on ? 4 : 2, on ? C.yes : C.headerRim, 1)
            l.bg.strokeRoundedRect(2, -h / 2, l.w - 4, h, 14)
        })
    paint()

    const toScreen = (lx: number, ly: number, w: number, h: number): Rect => {
        const s = root.scaleX
        return { x: root.x + (lx - pw / 2) * s, y: root.y + (ly - ph / 2) * s, w: w * s, h: h * s }
    }

    const board: RuleBoard = {
        rows,
        light(ids) {
            lit = new Set(ids ?? [])
            paint()
            lines.forEach(l => {
                if (!lit.has(l.row.id)) return
                void FX.to(scene, l.box, { scale: 1.05 }, { duration: 140, yoyo: true }).then(() => l.box.setScale(1))
            })
        },
        async flash(id) {
            const l = lines[id]
            if (!l) return
            lit = new Set([id])
            paint()
            await FX.to(scene, l.box, { scale: 1.08 }, { duration: 180, yoyo: true })
            l.box.setScale(1)
        },
        async shake(ids) {
            lit = new Set(ids)
            paint()
            await FX.all(...lines.filter(l => lit.has(l.row.id)).map(l => FX.shake(scene, l.box, { amount: 8, times: 4 })))
        },
        big() {
            scene.tweens.killTweensOf(root)
            root.setPosition(RULE.bigX, RULE.bigY + 30).setScale(RULE.bigScale).setVisible(true).setAlpha(0)
            return FX.to(scene, root, { alpha: 1, y: RULE.bigY }, { duration: 420, ease: 'Back.easeOut' })
        },
        dock() {
            return FX.to(scene, root, { x: home.x, y: home.y, scale: 1 }, { duration: TIMING.rule, ease: 'Sine.easeInOut' })
        },
        visible(on) {
            root.setVisible(on)
        },
        rect() {
            return toScreen(pw / 2, ph / 2, pw + 16, ph + 16)
        },
        rowRect(id) {
            const l = lines[id] ?? lines[0]
            return toScreen(l.x + l.w / 2, l.y, l.w + 12, RULE.rowH + 6)
        },
        destroy() {
            scene.tweens.killTweensOf([root, ...lines.map(l => l.box)])
            root.destroy()
        },
    }
    return board
}
