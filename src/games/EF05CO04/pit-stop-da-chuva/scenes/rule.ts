import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { DEPTH, RULE } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { TIMING } from '../data/timing'
import { TIRES } from '../data/weather'
import { LABEL } from '../data/words'
import type { Branch, Rect, RuleDef } from '../types'

export interface RuleBoard {
    light(branch: Branch | null): void
    shake(branch: Branch): Promise<void>
    big(): Promise<void>
    dock(): Promise<void>
    visible(on: boolean): void
    rect(): Rect
    blockRect(branch: Branch): Rect
    destroy(): void
}

interface Block {
    branch: Branch
    box: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Graphics
    w: number
}

type Piece = { obj: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject; w: number }

const LEFT = Math.min(RULE.thenX - RULE.thenW / 2, RULE.elseX - RULE.elseW / 2)
const RIGHT = Math.max(RULE.thenX + RULE.thenW / 2, RULE.elseX + RULE.elseW / 2)
const CX = (LEFT + RIGHT) / 2

export function createRule(scene: Phaser.Scene, rule: RuleDef): RuleBoard {
    const text = (s: string, size: number, color: string) =>
        scene.add.text(0, 0, s, { fontFamily: FONT.black, fontSize: `${size}px`, color }).setOrigin(0, 0.5).setResolution(2)

    const chip = (s: string, tone: number): Piece => {
        const label = text(s, SIZE.chip, inkOn(tone)).setOrigin(0.5)
        const w = label.width + 24
        const g = scene.add.graphics()
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -RULE.chipH / 2, w, RULE.chipH, RULE.chipH / 2)
        const c = scene.add.container(0, 0, [g, label])
        return { obj: c, w }
    }

    const arrow = (): Piece => {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRect(0, -3, 20, 6)
        g.fillTriangle(18, -10, 30, 0, 18, 10)
        return { obj: g, w: 30 }
    }

    const icon = (cell: number, size: number): Piece => {
        const img = scene.add.image(0, 0, PIECE_SHEET.key, cellKey(cell))
        img.setScale(size / Math.max(img.frame.width, img.frame.height))
        return { obj: img, w: img.displayWidth }
    }

    const word = (s: string, size: number, color: string): Piece => {
        const t = text(s, size, color)
        return { obj: t, w: t.width }
    }

    const lay = (pieces: Piece[], gap: number) => {
        const total = pieces.reduce((n, p) => n + p.w, 0) + gap * (pieces.length - 1)
        let x = -total / 2
        pieces.forEach(p => {
            const isText = p.obj instanceof Phaser.GameObjects.Text
            const isArrow = p.obj instanceof Phaser.GameObjects.Graphics
            p.obj.setPosition(isText || isArrow ? x : x + p.w / 2, 0)
            x += p.w + gap
        })
        return pieces.map(p => p.obj)
    }

    const block = (branch: Branch, x: number, w: number, pieces: Piece[]): Block => {
        const bg = scene.add.graphics()
        const items = lay(pieces, 8)
        const box = scene.add.container(x - CX, 0, [bg, ...items])
        return { branch, box, bg, w }
    }

    const thenTire = TIRES[rule.then]
    const elseTire = TIRES[rule.otherwise]
    const blocks: Block[] = [
        block('then', RULE.thenX, RULE.thenW, [
            chip(LABEL.if, C.accent),
            icon(PIECE_CELL.rainCloud, RULE.icon),
            word(LABEL.raining, SIZE.rule, CSS.ink),
            arrow(),
            icon(thenTire.cell, RULE.tire),
            word(thenTire.name, SIZE.tire, CSS.then),
        ]),
        block('else', RULE.elseX, RULE.elseW, [chip(LABEL.else, C.accent), arrow(), icon(elseTire.cell, RULE.tire), word(elseTire.name, SIZE.tire, CSS.else)]),
    ]
    const root = scene.add.container(CX, RULE.y, blocks.map(b => b.box)).setDepth(DEPTH.rule)

    let lit: Branch | null = null
    const paint = () =>
        blocks.forEach(b => {
            const on = b.branch === lit
            const h = RULE.h
            b.bg.clear()
            b.bg.fillStyle(C.shadow, on ? 0.18 : 0.08)
            b.bg.fillRoundedRect(-b.w / 2 + 3, -h / 2 + 5, b.w, h, 22)
            b.bg.fillStyle(on ? C.lit : C.headerSoft, 1)
            b.bg.fillRoundedRect(-b.w / 2, -h / 2, b.w, h, 22)
            b.bg.lineStyle(on ? 5 : 3, on ? C.yes : C.headerRim, 1)
            b.bg.strokeRoundedRect(-b.w / 2, -h / 2, b.w, h, 22)
        })
    paint()

    const toScreen = (lx: number, ly: number, w: number, h: number): Rect => {
        const s = root.scaleX
        return { x: root.x + lx * s, y: root.y + ly * s, w: w * s, h: h * s }
    }

    const board: RuleBoard = {
        light(branch) {
            lit = branch
            paint()
            const b = blocks.find(x => x.branch === branch)
            if (b) void FX.to(scene, b.box, { scale: 1.06 }, { duration: 140, yoyo: true }).then(() => b.box.setScale(1))
        },
        async shake(branch) {
            const b = blocks.find(x => x.branch === branch)
            if (!b) return
            lit = branch
            paint()
            await FX.shake(scene, b.box, { amount: 8, times: 4 })
        },
        big() {
            scene.tweens.killTweensOf(root)
            root.setPosition(RULE.bigX, RULE.bigY + 30).setScale(RULE.bigScale).setVisible(true).setAlpha(0)
            return FX.to(scene, root, { alpha: 1, y: RULE.bigY }, { duration: 420, ease: 'Back.easeOut' })
        },
        dock() {
            return FX.to(scene, root, { x: CX, y: RULE.y, scale: 1 }, { duration: TIMING.rule, ease: 'Sine.easeInOut' })
        },
        visible(on) {
            root.setVisible(on)
        },
        rect() {
            return toScreen(0, 0, RIGHT - LEFT + 20, RULE.h + 16)
        },
        blockRect(branch) {
            const b = blocks.find(x => x.branch === branch) ?? blocks[0]
            return toScreen(b.box.x, 0, b.w + 14, RULE.h + 14)
        },
        destroy() {
            scene.tweens.killTweensOf([root, ...blocks.map(b => b.box)])
            root.destroy()
        },
    }
    return board
}
