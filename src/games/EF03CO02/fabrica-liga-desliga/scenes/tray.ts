import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_FRAME } from '../data/files'
import { BELT, DEPTH, TRAY } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { piece } from './art'

type Item = Phaser.GameObjects.Image

export interface Tray {
    receive(g: Item): Promise<void>
    setCount(count: number, quota: number): void
    showCounter(on: boolean): void
    rect(): { x: number; y: number; w: number; h: number }
    slideOut(): Promise<void>
    reset(): Promise<void>
    readonly held: number
    destroy(): void
}

export function createTray(scene: Phaser.Scene): Tray {
    const [, , tw, th] = PIECE_FRAME.tray
    const trayScale = TRAY.w / tw
    const base = piece(scene, 'tray', TRAY.w).setOrigin(0.5, 1)
    const tray = scene.add.container(TRAY.x, TRAY.bottom, [base]).setDepth(DEPTH.tray)
    const floor = -th * trayScale * 0.45

    const counterBg = scene.add.graphics()
    const counterText = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.counter}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const counter = scene.add.container(TRAY.x, TRAY.counterY, [counterBg, counterText]).setDepth(DEPTH.tray)

    let held = 0
    const items: Item[] = []

    const slot = (index: number) => {
        const col = index % TRAY.cols
        const row = Math.floor(index / TRAY.cols)
        return { x: (col - (TRAY.cols - 1) / 2) * TRAY.slotGap, y: floor - row * TRAY.rowGap }
    }

    const ghosts = scene.add.graphics()
    for (let i = 0; i < TRAY.cols * 2; i++) {
        const at = slot(i)
        ghosts.fillStyle(C.white, 0.55)
        ghosts.fillEllipse(at.x, at.y + 4, TRAY.cookie, TRAY.cookie * 0.6)
        ghosts.lineStyle(2, C.ink, 0.35)
        ghosts.strokeEllipse(at.x, at.y + 4, TRAY.cookie, TRAY.cookie * 0.6)
    }
    tray.add(ghosts)

    return {
        async receive(g) {
            const index = held
            held += 1
            const at = slot(Math.min(index, TRAY.cols * 2 - 1))
            const small = (g.scale * TRAY.cookie) / BELT.itemSize
            g.setDepth(DEPTH.tray + 1).setOrigin(0.5, 0.5)
            g.setY(g.y - (g.displayHeight / 2))
            await FX.to(scene, g, { x: BELT.right + 30, y: BELT.itemBottom - 20 }, { duration: 160, ease: 'Quad.easeOut' })
            await FX.to(scene, g, { x: TRAY.x + at.x, y: TRAY.bottom + at.y, scale: small }, { duration: 260, ease: 'Bounce.easeOut' })
            tray.add(g)
            g.setPosition(at.x, at.y)
            items.push(g)
        },
        setCount(count, quota) {
            counterText.setText(`${Math.min(count, quota)} / ${quota}`)
            const w = counterText.width + 28
            const h = SIZE.counter + 16
            counterBg.clear()
            counterBg.fillStyle(count >= quota ? C.yes : C.cream, 1)
            counterBg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            counterBg.lineStyle(3, C.ink, 1)
            counterBg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            counterText.setColor(count >= quota ? CSS.white : CSS.ink)
            void FX.impact(scene, counter, 0.12)
        },
        showCounter(on) {
            counter.setVisible(on)
        },
        rect() {
            return { x: TRAY.x, y: (TRAY.counterY + TRAY.bottom) / 2, w: TRAY.w + 40, h: TRAY.bottom - TRAY.counterY + 60 }
        },
        async slideOut() {
            await FX.to(scene, [tray, counter], { x: TRAY.x + 260, alpha: 0 }, { duration: 420, ease: 'Quad.easeIn' })
        },
        async reset() {
            items.forEach(g => g.destroy())
            items.length = 0
            held = 0
            tray.setX(TRAY.x).setAlpha(0)
            counter.setX(TRAY.x).setAlpha(0)
            await FX.to(scene, [tray, counter], { alpha: 1 }, { duration: 260 })
        },
        get held() {
            return held
        },
        destroy() {
            items.forEach(g => g.destroy())
            counter.destroy()
            tray.destroy()
        },
    }
}
