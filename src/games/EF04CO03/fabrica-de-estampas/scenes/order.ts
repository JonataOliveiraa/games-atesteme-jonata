import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PRINT, PRINT_OF, PRINT_SHEET, UI, UI_SHEET } from '../data/files'
import { childPath, isLoop } from '../data/levels'
import { DEPTH, LOOP, ORDER } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Loop } from '../types'
import { fit, sliced } from './art'
import type { Rect } from './guide'

type Point = { x: number; y: number }

export interface OrderCard {
    /** o papel novo entra preso pelos alfinetes, com o pedido escrito */
    set(loop: Loop): Promise<void>
    leave(): Promise<void>
    /** costura o botão da volta `index` na aba do laço `path` */
    sew(path: string, index: number): Promise<void>
    /** os botões do laço saltam fora (o laço de dentro recomeça) */
    unsew(path: string): Promise<void>
    /** acende a figura do pedido (só no erro e no tutorial) e devolve onde ela está */
    light(at: string): Point
    /** onde a figura do pedido está na tela */
    figPos(at: string): Point
    rect(): Rect
    tabRect(path: string): Rect
    /** a moldura de um laço ("" é a de fora) */
    loopRect(path: string): Rect
    destroy(): void
}

interface Size {
    w: number
    h: number
}

export function createOrderCard(scene: Phaser.Scene): OrderCard {
    const box = scene.add.container(ORDER.x, ORDER.y).setDepth(DEPTH.order)
    const paper = sliced(scene, UI_SHEET, UI.paper, ORDER.w, ORDER.h, ORDER.corner)
    const content = scene.add.container(0, 6)
    box.add([paper.piece, content])
    box.setVisible(false)

    let figs = new Map<string, Phaser.GameObjects.Image>()
    let tabs = new Map<string, Phaser.GameObjects.NineSlice>()
    let frames = new Map<string, Phaser.GameObjects.NineSlice>()
    let slots = new Map<string, Point[]>()
    let sewn = new Map<string, Phaser.GameObjects.Image[]>()
    let glows: Phaser.GameObjects.Graphics[] = []
    let width: number = ORDER.w

    const measure = (loop: Loop, depth: number): Size => {
        const tab = LOOP.tab[Math.min(depth, 1)]
        const items = loop.body.map(n => (isLoop(n) ? measure(n, depth + 1) : { w: LOOP.icon, h: LOOP.icon }))
        const w = tab.w + items.reduce((s, it) => s + LOOP.gap + it.w, 0)
        const h = Math.max(tab.h, ...items.map(it => it.h))
        return { w: w + LOOP.pad * 2, h: h + LOOP.pad * 2 }
    }

    const place = (loop: Loop, depth: number, path: string, cx: number, cy: number) => {
        const size = measure(loop, depth)
        const tab = LOOP.tab[Math.min(depth, 1)]
        const frame = sliced(scene, UI_SHEET, depth ? UI.frameInner : UI.frameOuter, size.w, size.h, LOOP.corner)
        frame.piece.setPosition(cx, cy)
        content.add(frame.piece)
        frames.set(path, frame.piece)

        const left = cx - size.w / 2 + LOOP.pad
        const tx = left + tab.w / 2
        const tabImage = sliced(scene, UI_SHEET, depth ? UI.tabInner : UI.tabOuter, tab.w, tab.h, LOOP.tabCorner).piece
        tabImage.setPosition(tx, cy)
        const number = scene.add
            .text(tx, cy + tab.numberDy, `${loop.times}×`, {
                fontFamily: FONT.black,
                fontSize: `${tab.font}px`,
                color: depth ? CSS.inner : CSS.outer,
                stroke: '#ffffff',
                strokeThickness: 7,
            })
            .setOrigin(0.5)
            .setResolution(2)
        content.add([tabImage, number])
        tabs.set(path, tabImage)

        const rows = Math.ceil(loop.times / LOOP.perRow)
        const rowY = rows === 1 ? [cy + tab.h * 0.22] : [cy + tab.h * 0.13, cy + tab.h * 0.35]
        const points: Point[] = []
        for (let k = 0; k < loop.times; k++) {
            const row = Math.floor(k / LOOP.perRow)
            const inRow = Math.min(LOOP.perRow, loop.times - row * LOOP.perRow)
            const col = k % LOOP.perRow
            const p = { x: tx + (col - (inRow - 1) / 2) * LOOP.slotGap, y: rowY[row] }
            points.push(p)
            content.add(fit(scene, PRINT_SHEET, PRINT.buttonSpot, LOOP.slot).setPosition(p.x, p.y).setTint(depth ? C.innerDark : C.outerDark))
        }
        slots.set(path, points)
        sewn.set(path, [])

        let x = left + tab.w + LOOP.gap
        loop.body.forEach((node, i) => {
            const at = childPath(path, i)
            if (isLoop(node)) {
                const inner = measure(node, depth + 1)
                place(node, depth + 1, at, x + inner.w / 2, cy)
                x += inner.w + LOOP.gap
                return
            }
            const icon = fit(scene, PRINT_SHEET, PRINT_OF[node], LOOP.icon).setPosition(x + LOOP.icon / 2, cy)
            content.add(icon)
            figs.set(at, icon)
            x += LOOP.icon + LOOP.gap
        })
    }

    const clear = () => {
        content.removeAll(true)
        glows = []
        figs = new Map()
        tabs = new Map()
        frames = new Map()
        slots = new Map()
        sewn = new Map()
    }

    const world = (o: { x: number; y: number }): Point => ({
        x: box.x + content.x + o.x * content.scale,
        y: box.y + content.y + o.y * content.scale,
    })

    return {
        async set(loop) {
            clear()
            place(loop, 0, '', 0, 0)
            const size = measure(loop, 0)
            const scale = Math.min(1, (ORDER.w - ORDER.margin * 2) / size.w, (ORDER.h - 20) / size.h)
            content.setScale(scale)
            width = Phaser.Math.Clamp(size.w * scale + ORDER.margin * 2, ORDER.minW, ORDER.w)
            paper.resize(width, ORDER.h)
            scene.tweens.killTweensOf(box)
            box.setVisible(true).setAlpha(1).setAngle(-3).setPosition(ORDER.x, ORDER.y + ORDER.enterDy)
            await FX.to(scene, box, { y: ORDER.y, angle: 0 }, { duration: 520, ease: 'Back.easeOut' })
        },
        async leave() {
            scene.tweens.killTweensOf(box)
            await FX.to(scene, box, { y: ORDER.y + ORDER.enterDy, angle: 4, alpha: 0 }, { duration: 380, ease: 'Back.easeIn' })
            box.setVisible(false)
            clear()
        },
        async sew(path, index) {
            const p = slots.get(path)?.[index]
            const list = sewn.get(path)
            if (!p || !list) return
            const button = fit(scene, PRINT_SHEET, PRINT.button, LOOP.slot * 1.2).setPosition(p.x, p.y - 26)
            const scale = button.scale
            button.setScale(scale * 1.6).setAlpha(0)
            content.add(button)
            list.push(button)
            await FX.to(scene, button, { y: p.y, alpha: 1, scale }, { duration: 260, ease: 'Back.easeOut' })
            const tab = tabs.get(path)
            if (tab) void FX.press(scene, tab, 1.06)
        },
        async unsew(path) {
            const list = sewn.get(path) ?? []
            sewn.set(path, [])
            await FX.all(
                ...list.map((b, k) =>
                    FX.to(scene, b, { y: b.y - 34, alpha: 0, angle: k % 2 ? 40 : -40 }, { duration: 320, delay: k * 60, ease: 'Sine.easeOut' }).then(() =>
                        b.destroy(),
                    ),
                ),
            )
        },
        light(at) {
            const icon = figs.get(at)
            if (!icon) return { x: ORDER.x, y: ORDER.y }
            const glow = scene.add.graphics()
            glow.fillStyle(C.glow, 0.45)
            glow.fillCircle(icon.x, icon.y, LOOP.icon * 0.66)
            glow.lineStyle(6, C.glow, 1)
            glow.strokeCircle(icon.x, icon.y, LOOP.icon * 0.66)
            content.addAt(glow, content.getIndex(icon))
            glows.push(glow)
            void FX.impact(scene, icon, 0.2)
            return world(icon)
        },
        figPos(at) {
            const icon = figs.get(at)
            return icon ? world(icon) : { x: ORDER.x, y: ORDER.y }
        },
        loopRect(path) {
            const frame = frames.get(path)
            if (!frame) return this.rect()
            const p = world(frame)
            const s = content.scale
            return { x: p.x, y: p.y, w: frame.displayWidth * s + 20, h: frame.displayHeight * s + 20 }
        },
        rect() {
            return { x: ORDER.x, y: ORDER.y, w: width + 16, h: ORDER.h + 16 }
        },
        tabRect(path) {
            const tab = tabs.get(path)
            if (!tab) return this.rect()
            const p = world(tab)
            const s = content.scale
            return { x: p.x, y: p.y, w: tab.displayWidth * s + 24, h: tab.displayHeight * s + 24 }
        },
        destroy() {
            box.destroy()
        },
    }
}
