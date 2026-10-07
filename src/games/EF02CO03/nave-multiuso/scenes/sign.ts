import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { PIECE, PIECES, PIECE_SIZE, THING_CELL } from '../data/files'
import { DEPTH, SIGN } from '../data/layout'
import { C, CSS, FONT, TOOL_COLOR } from '../data/theme'
import { KIND_NAME, TOOL_NAME } from '../data/words'
import type { Place, Rect, SignRow } from '../types'
import { START } from './things'

export interface Sign {
    show(rows: SignRow[], key: string, place: Place): Promise<void>
    dock(): Promise<void>
    tick(group: number): void
    rect(): Rect
    hide(): void
    destroy(): void
}

const POP_MS = 260
const REVEAL_MS = 160
const DOCK_MS = 450

export function createSign(scene: Phaser.Scene): Sign {
    let rows: SignRow[] = []
    let key = ''
    let place: Place = 'earth'
    let root: Phaser.GameObjects.Container | null = null
    let lines: Phaser.GameObjects.Container[] = []

    const height = () => SIGN.pad * 2 + rows.length * SIGN.row
    const current = () => rows.findIndex(row => row.count > 0)
    const dockedAt = () => ({ x: SIGN.x + SIGN.w / 2, y: SIGN.y + height() / 2 })

    const icon = (row: SignRow, x: number) => {
        if (row.kind) return [scene.add.image(x, 0, key, START[row.kind]).setScale(SIGN.icon / THING_CELL[place])]
        const tool = row.tool!
        const g = scene.add.graphics()
        g.fillStyle(TOOL_COLOR[tool], 1)
        g.fillCircle(x, 0, SIGN.toolR)
        g.lineStyle(3, C.ink, 1)
        g.strokeCircle(x, 0, SIGN.toolR)
        return [g, scene.add.image(x, 0, PIECES, PIECE[tool]).setScale((SIGN.toolR * 2.1) / PIECE_SIZE)]
    }

    const line = (row: SignRow, index: number, now: number) => {
        const left = -SIGN.w / 2
        const y = -height() / 2 + SIGN.pad + SIGN.row / 2 + index * SIGN.row
        const done = row.count === 0
        const on = index === now
        const card = scene.add.graphics()
        const cw = SIGN.w - 16
        const ch = SIGN.row - 10
        card.fillStyle(on ? C.hint : done ? C.grey : C.white, 1)
        card.fillRoundedRect(left + 8, -ch / 2, cw, ch, 16)
        card.lineStyle(on ? 4 : 3, C.ink, on ? 1 : 0.3)
        card.strokeRoundedRect(left + 8, -ch / 2, cw, ch, 16)
        const parts: Phaser.GameObjects.GameObject[] = [card]
        if (done) {
            const check = scene.add.graphics()
            const cx = left + SIGN.countX
            check.fillStyle(C.green, 1)
            check.fillCircle(cx, 0, 17)
            check.lineStyle(3, C.ink, 1)
            check.strokeCircle(cx, 0, 17)
            check.lineStyle(5, C.white, 1)
            check.lineBetween(cx - 8, 0, cx - 2, 7)
            check.lineBetween(cx - 2, 7, cx + 9, -7)
            parts.push(check)
        } else {
            parts.push(
                scene.add
                    .text(left + SIGN.countX, 1, `${row.count}×`, { fontFamily: FONT.black, fontSize: '30px', color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
        }
        const art = icon(row, left + SIGN.iconX)
        const name = scene.add
            .text(left + SIGN.nameX, 1, row.kind ? KIND_NAME[place][row.kind] : TOOL_NAME[row.tool!], {
                fontFamily: FONT.black,
                fontSize: '21px',
                color: CSS.ink,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        const room = SIGN.w / 2 - 14 - (left + SIGN.nameX)
        if (name.width > room) name.setScale(room / name.width)
        if (done) [...art, name].forEach(o => (o as Phaser.GameObjects.Image).setAlpha(0.45))
        parts.push(...art, name)
        return scene.add.container(0, y, parts)
    }

    const render = () => {
        if (!root) return
        root.removeAll(true)
        const h = height()
        const bg = scene.add.graphics()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-SIGN.w / 2 + 4, -h / 2 + 7, SIGN.w, h, 22)
        bg.fillStyle(C.white, 0.96)
        bg.fillRoundedRect(-SIGN.w / 2, -h / 2, SIGN.w, h, 22)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-SIGN.w / 2, -h / 2, SIGN.w, h, 22)
        const now = current()
        lines = rows.map((row, index) => line(row, index, now))
        root.add([bg, ...lines])
    }

    const clear = () => {
        if (!root) return
        scene.tweens.killTweensOf(root)
        root.each((o: Phaser.GameObjects.GameObject) => scene.tweens.killTweensOf(o))
        root.destroy()
        root = null
        lines = []
    }

    return {
        async show(list, sheet, where) {
            clear()
            rows = list.map(row => ({ ...row }))
            key = sheet
            place = where
            root = scene.add.container(SIGN.bigX, SIGN.bigY).setDepth(DEPTH.controls + 10).setScale(SIGN.big)
            render()
            const shown = root
            lines.forEach(l => l.setAlpha(0).setX(-24))
            shown.setAlpha(0).setScale(SIGN.big * 0.85)
            void FX.to(scene, shown, { alpha: 1, scale: SIGN.big }, { duration: POP_MS, ease: Ease.back(1.6) })
            await FX.wait(scene, POP_MS)
            for (const l of lines) {
                if (root !== shown) return
                void FX.to(scene, l, { alpha: 1, x: 0 }, { duration: 220, ease: Ease.smooth })
                await FX.wait(scene, REVEAL_MS)
            }
        },
        async dock() {
            if (!root) return
            lines.forEach(l => {
                scene.tweens.killTweensOf(l)
                l.setAlpha(1).setX(0)
            })
            const to = dockedAt()
            void FX.to(scene, root, { x: to.x, y: to.y, scale: 1 }, { duration: DOCK_MS, ease: 'Sine.easeInOut' })
            await FX.wait(scene, DOCK_MS)
        },
        tick(group) {
            const row = rows[group]
            if (!row || row.count === 0) return
            const before = current()
            row.count -= 1
            render()
            const now = current()
            if (now >= 0 && now !== before) void FX.to(scene, lines[now], { scale: 1.08 }, { duration: 160, yoyo: true, repeat: 1 })
        },
        rect() {
            if (!root) return { x: 0, y: 0, w: 0, h: 0 }
            return { x: root.x, y: root.y, w: SIGN.w * root.scale + 24, h: height() * root.scale + 24 }
        },
        hide() {
            clear()
        },
        destroy() {
            clear()
        },
    }
}
