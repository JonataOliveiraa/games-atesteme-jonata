import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { BUBBLE, DEPTH, HEADER, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import type { Vec } from '../types'

export interface Bubble {
    say(text: string, at: Vec, tail: Vec, button?: string): Promise<void>
    think(text: string, at: Vec, tail: Vec, ms: number): Promise<void>
    hide(): void
    destroy(): void
}

export function createBubble(scene: Phaser.Scene): Bubble {
    const g = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${SIZE.bubble}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BUBBLE.w - BUBBLE.pad * 2, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0)
        .setResolution(2)
    const buttonArt = scene.add.graphics()
    const buttonText = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '22px', color: inkOn(C.accent) })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(0, 0, [g, label, buttonArt, buttonText]).setDepth(DEPTH.bubble).setScrollFactor(0).setVisible(false)
    const zone = scene.add.zone(0, 0, 10, 10).setDepth(DEPTH.bubble + 1).setScrollFactor(0).setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = false
    let typing: Typewriter | undefined
    let waiting: (() => void) | undefined
    let ready = false

    const release = () => {
        const w = waiting
        waiting = undefined
        w?.()
    }

    const layout = (text: string, at: Vec, tail: Vec, button: string | undefined) => {
        label.setText(text)
        const textH = label.height
        label.setText('')
        const bw = BUBBLE.w
        const bh = BUBBLE.pad * 2 + textH + (button ? BUBBLE.button + 12 : 0)
        const x = Phaser.Math.Clamp(at.x, bw / 2 + 16, W - bw / 2 - 16)
        const y = Phaser.Math.Clamp(at.y, HEADER.h + 16 + bh / 2, H - 16 - bh / 2)
        box.setPosition(x, y)
        const tx = tail.x - x
        const ty = tail.y - y
        const side = Math.abs(tx) - bw / 2 > Math.abs(ty) - bh / 2
        g.clear()
        g.fillStyle(C.shadow, 0.18)
        g.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 6, bw, bh, 24)
        g.fillStyle(C.paper, 1)
        g.lineStyle(4, C.ink, 1)
        let base: [number, number, number, number]
        if (side) {
            const sx = Math.sign(tx) * (bw / 2 - 2)
            const sy = Phaser.Math.Clamp(ty, -bh / 2 + 30, bh / 2 - 30)
            base = [sx, sy - 16, sx, sy + 16]
        } else {
            const sy = Math.sign(ty) * (bh / 2 - 2)
            const sx = Phaser.Math.Clamp(tx, -bw / 2 + 30, bw / 2 - 30)
            base = [sx - 16, sy, sx + 16, sy]
        }
        g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
        g.fillTriangle(base[0], base[1], base[2], base[3], tx, ty)
        g.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
        g.lineBetween(base[0], base[1], tx, ty)
        g.lineBetween(base[2], base[3], tx, ty)
        g.fillStyle(C.paper, 1)
        if (side) g.fillRect(base[0] - 4, base[1] + 2, 8, base[3] - base[1] - 4)
        else g.fillRect(base[0] + 2, base[1] - 4, base[2] - base[0] - 4, 8)
        label.setPosition(0, -bh / 2 + BUBBLE.pad)
        buttonArt.clear()
        buttonText.setText(button ?? '')
        if (button) {
            const bwid = Math.max(150, buttonText.width + 48)
            const by = bh / 2 - BUBBLE.pad - BUBBLE.button / 2 + 6
            buttonArt.fillStyle(C.accentDark, 1)
            buttonArt.fillRoundedRect(-bwid / 2, by - BUBBLE.button / 2 + 4, bwid, BUBBLE.button, BUBBLE.button / 2)
            buttonArt.fillStyle(C.accent, 1)
            buttonArt.fillRoundedRect(-bwid / 2, by - BUBBLE.button / 2, bwid, BUBBLE.button, BUBBLE.button / 2)
            buttonText.setPosition(0, by)
        }
        zone.setPosition(x, y).setSize(bw, bh)
        if (zone.input) zone.input.hitArea.setTo(0, 0, bw, bh)
    }

    zone.on('pointerdown', () => {
        if (!box.visible) return
        if (typing && !ready) {
            typing.skip()
            return
        }
        if (ready && waiting) {
            void FX.press(scene, buttonText)
            box.setVisible(false)
            if (zone.input) zone.input.enabled = false
            release()
        }
    })

    const show = async (text: string, at: Vec, tail: Vec, button?: string) => {
        bubble.hide()
        layout(text, at, tail, button)
        box.setVisible(true).setScale(0.7).setAlpha(0)
        buttonArt.setAlpha(0)
        buttonText.setAlpha(0)
        await FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 220, ease: 'Back.easeOut' })
        if (zone.input) zone.input.enabled = true
        ready = false
        typing = FX.type(scene, label, text, { delay: 34 })
        await typing
        typing = undefined
        ready = true
    }

    const bubble: Bubble = {
        async say(text, at, tail, button) {
            await show(text, at, tail, button)
            if (!button) {
                if (zone.input) zone.input.enabled = false
                return
            }
            await FX.to(scene, [buttonArt, buttonText], { alpha: 1 }, { duration: 160 })
            await new Promise<void>(resolve => {
                waiting = resolve
            })
        },
        async think(text, at, tail, ms) {
            await show(text, at, tail)
            if (zone.input) zone.input.enabled = false
            await FX.wait(scene, ms)
            await FX.to(scene, box, { alpha: 0 }, { duration: 220 })
            box.setVisible(false)
        },
        hide() {
            typing?.skip()
            typing = undefined
            scene.tweens.killTweensOf([box, buttonArt, buttonText])
            box.setVisible(false)
            if (zone.input) zone.input.enabled = false
            release()
        },
        destroy() {
            bubble.hide()
            zone.destroy()
            box.destroy()
        },
    }
    return bubble
}
