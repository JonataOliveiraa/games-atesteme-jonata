import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { BUBBLE, DEPTH, HEADER, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import type { Vec } from '../types'

export interface Bubble {
    say(text: string, at: Vec, button?: string): Promise<void>
    think(text: string, at: Vec, ms: number): void
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
    const box = scene.add.container(0, 0, [g, label, buttonArt, buttonText]).setDepth(DEPTH.bubble).setVisible(false)
    const zone = scene.add.zone(0, 0, 10, 10).setDepth(DEPTH.bubble + 1).setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = false
    let typing: Typewriter | undefined
    let waiting: (() => void) | undefined
    let timer: Phaser.Time.TimerEvent | undefined
    let ready = false

    const release = () => {
        const w = waiting
        waiting = undefined
        w?.()
    }

    const layout = (text: string, at: Vec, button: string | undefined, small: boolean) => {
        label.setFontSize(small ? SIZE.bubble - 5 : SIZE.bubble).setText(text)
        const textH = label.height
        label.setText('')
        const bw = BUBBLE.w
        const bh = BUBBLE.pad * 2 + textH + (button ? BUBBLE.button + 12 : 0)
        const x = Phaser.Math.Clamp(at.x, bw / 2 + 16, W - bw / 2 - 16)
        const y = Math.max(HEADER.h + 16 + bh / 2, at.y - 34 - bh / 2)
        box.setPosition(x, y)
        g.clear()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-bw / 2 + 4, -bh / 2 + 6, bw, bh, 24)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
        const tx = Phaser.Math.Clamp(at.x - x, -bw / 2 + 30, bw / 2 - 30)
        const ty = Math.min(at.y - y, bh / 2 + 30)
        g.fillTriangle(tx - 16, bh / 2 - 2, tx + 16, bh / 2 - 2, tx, ty)
        g.lineStyle(4, C.line, 1)
        g.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 24)
        g.lineBetween(tx - 16, bh / 2, tx, ty)
        g.lineBetween(tx + 16, bh / 2, tx, ty)
        g.fillStyle(C.white, 1)
        g.fillRect(tx - 14, bh / 2 - 4, 28, 6)
        label.setPosition(0, -bh / 2 + BUBBLE.pad)
        buttonArt.clear()
        buttonText.setText(button ?? '')
        if (button) {
            const bwid = Math.max(140, buttonText.width + 44)
            const by = bh / 2 - BUBBLE.pad - BUBBLE.button / 2 + 6
            buttonArt.fillStyle(C.accentDark, 1)
            buttonArt.fillRoundedRect(-bwid / 2, by - BUBBLE.button / 2 + 4, bwid, BUBBLE.button, BUBBLE.button / 2)
            buttonArt.fillStyle(C.accent, 1)
            buttonArt.fillRoundedRect(-bwid / 2, by - BUBBLE.button / 2, bwid, BUBBLE.button, BUBBLE.button / 2)
            buttonText.setPosition(0, by)
        }
        zone.setPosition(x, y).setSize(bw, bh)
        if (zone.input) zone.input.hitArea.setTo(0, 0, bw, bh)
        return text
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

    const bubble: Bubble = {
        async say(text, at, button) {
            bubble.hide()
            layout(text, at, button, false)
            box.setVisible(true).setScale(0.7).setAlpha(0)
            buttonArt.setAlpha(0)
            buttonText.setAlpha(0)
            await FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 220, ease: 'Back.easeOut' })
            if (zone.input) zone.input.enabled = true
            ready = false
            typing = FX.type(scene, label, text, { delay: 26 })
            await typing
            typing = undefined
            ready = true
            if (!button) {
                if (zone.input) zone.input.enabled = false
                return
            }
            await FX.to(scene, [buttonArt, buttonText], { alpha: 1 }, { duration: 160 })
            await new Promise<void>(resolve => {
                waiting = resolve
            })
        },
        think(text, at, ms) {
            bubble.hide()
            layout(text, at, undefined, true)
            label.setText(text)
            box.setVisible(true).setScale(0.7).setAlpha(0)
            void FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 200, ease: 'Back.easeOut' })
            timer = scene.time.delayedCall(ms, () => {
                void FX.to(scene, box, { alpha: 0 }, { duration: 220 }).then(() => box.setVisible(false))
            })
        },
        hide() {
            timer?.remove()
            timer = undefined
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
