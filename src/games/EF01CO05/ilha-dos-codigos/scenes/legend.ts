import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { WORDS } from '../data/island'
import { DEPTH, LEGEND_BTN, LEGEND_PANEL } from '../data/layout'
import { C } from '../data/theme'
import { drawCodeIcon } from './codeIcon'
import { createTile, type Tile } from './symbols'
import type { Code } from '../types'

const ROW_TILE = 72
const ROW_GAP = 64
const BTN_ICON = 32

function paintEquals(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, color: number) {
    const bar = w * 0.26
    g.fillStyle(color, 1)
    g.fillRoundedRect(x - w / 2, y - bar * 1.4, w, bar, bar / 2)
    g.fillRoundedRect(x - w / 2, y + bar * 0.4, w, bar, bar / 2)
}

export function createLegend(scene: Phaser.Scene) {
    const button = scene.add.graphics().setDepth(DEPTH.hud)
    const buttonIcons = scene.add.container(LEGEND_BTN.x, LEGEND_BTN.y).setDepth(DEPTH.hud)

    const zone = scene.add.zone(LEGEND_BTN.x, LEGEND_BTN.y, LEGEND_BTN.w, LEGEND_BTN.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud)
        .setInteractive({ useHandCursor: true })

    const panel = scene.add.container(LEGEND_PANEL.cx, 0).setDepth(DEPTH.legend)
    const panelBg = scene.add.graphics()
    panel.add(panelBg)

    let rows: Tile[] = []
    let open = false
    let opens = 0
    let sticky = false
    let hideTimer: Phaser.Time.TimerEvent | null = null

    const paintButton = () => {
        button.clear()
        button.fillStyle(C.ink, 0.2)
        button.fillRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2, LEGEND_BTN.y - LEGEND_BTN.h / 2 + 5,
            LEGEND_BTN.w, LEGEND_BTN.h, 20,
        )
        button.fillStyle(open ? C.warn : C.cream, 1)
        button.fillRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2, LEGEND_BTN.y - LEGEND_BTN.h / 2,
            LEGEND_BTN.w, LEGEND_BTN.h, 20,
        )
        button.fillStyle(C.white, 0.5)
        button.fillRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2 + 8, LEGEND_BTN.y - LEGEND_BTN.h / 2 + 6,
            LEGEND_BTN.w - 16, 12, 6,
        )
        button.lineStyle(5, open ? C.warnDark : C.woodDark, 1)
        button.strokeRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2, LEGEND_BTN.y - LEGEND_BTN.h / 2,
            LEGEND_BTN.w, LEGEND_BTN.h, 20,
        )
    }

    const setVisible = (value: boolean) => {
        open = value
        panel.setVisible(value)
        paintButton()
    }

    const api = {
        build(from: Code, to: Code) {
            rows.forEach(tile => tile.destroy())
            rows = []
            panel.list.slice(1).forEach(child => child.destroy())
            buttonIcons.removeAll(true)

            const left = scene.add.graphics().setPosition(-44, 0)
            drawCodeIcon(left, from, BTN_ICON)
            const right = scene.add.graphics().setPosition(44, 0)
            drawCodeIcon(right, to, BTN_ICON)
            const eq = scene.add.graphics()
            paintEquals(eq, 0, 0, 24, C.inkSoft)
            buttonIcons.add([left, eq, right])

            const h = LEGEND_PANEL.pad * 2 + WORDS.length * LEGEND_PANEL.rowH
            panel.setY(LEGEND_PANEL.top + h / 2)

            panelBg.clear()
            panelBg.fillStyle(C.ink, 0.22)
            panelBg.fillRoundedRect(-LEGEND_PANEL.w / 2, -h / 2 + 7, LEGEND_PANEL.w, h, 26)
            panelBg.fillStyle(C.cream, 0.97)
            panelBg.fillRoundedRect(-LEGEND_PANEL.w / 2, -h / 2, LEGEND_PANEL.w, h, 26)
            panelBg.fillStyle(C.white, 0.6)
            panelBg.fillRoundedRect(-LEGEND_PANEL.w / 2 + 12, -h / 2 + 8, LEGEND_PANEL.w - 24, 14, 7)
            panelBg.lineStyle(6, C.woodDark, 1)
            panelBg.strokeRoundedRect(-LEGEND_PANEL.w / 2, -h / 2, LEGEND_PANEL.w, h, 26)

            const marks = scene.add.graphics()
            panel.add(marks)

            WORDS.forEach((word, i) => {
                const y = -h / 2 + LEGEND_PANEL.pad + LEGEND_PANEL.rowH * (i + 0.5)

                const a = createTile(scene, word, from, ROW_TILE)
                a.container.setPosition(-ROW_GAP, y)
                panel.add(a.container)

                const b = createTile(scene, word, to, ROW_TILE)
                b.container.setPosition(ROW_GAP, y)
                panel.add(b.container)

                paintEquals(marks, 0, y, 28, C.inkSoft)
                rows.push(a, b)
            })
        },

        setSticky(value: boolean) {
            sticky = value
            if (!value) return
            hideTimer?.remove()
            hideTimer = null
        },

        show(autoHideMs?: number) {
            hideTimer?.remove()
            hideTimer = null
            if (!open) {
                setVisible(true)
                FX.popIn(scene, panel, { from: 0.86, duration: 240 })
            }
            if (autoHideMs && !sticky) {
                hideTimer = scene.time.delayedCall(
                    FX.ms(scene, autoHideMs),
                    () => setVisible(false),
                )
            }
        },

        hide() {
            hideTimer?.remove()
            hideTimer = null
            setVisible(false)
        },

        toggle() {
            if (open) {
                api.hide()
                return
            }
            opens++
            api.show()
        },

        peek(ms: number) {
            api.show(ms)
            FX.popIn(scene, panel, { from: 1.1, duration: 260 })
        },

        get openCount() {
            return opens
        },

        setEnabled(value: boolean) {
            zone.setVisible(value)
            button.setAlpha(value ? 1 : 0.5)
            buttonIcons.setAlpha(value ? 1 : 0.5)
        },

        fade(alpha: number, ms: number) {
            scene.tweens.add({
                targets: [button, buttonIcons, panel],
                alpha,
                duration: FX.ms(scene, ms),
            })
        },

        destroy() {
            hideTimer?.remove()
            rows.forEach(tile => tile.destroy())
            panel.destroy()
            button.destroy()
            buttonIcons.destroy()
            zone.destroy()
        },
    }

    zone.on('pointerdown', () => {
        FX.press(scene, button)
        api.toggle()
    })

    paintButton()
    setVisible(false)
    return api
}
