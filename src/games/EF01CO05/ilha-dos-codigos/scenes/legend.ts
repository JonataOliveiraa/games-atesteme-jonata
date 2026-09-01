import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, LEGEND_BTN, LEGEND_PANEL } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { createCard, type Card } from './symbols'
import type { Code, Word } from '../types'

/**
 * A LEGENDA NUNCA DEIXA DE EXISTIR.
 *
 * "Sem legenda" é o estado padrão da tela nos níveis mais difíceis, mas o
 * botão continua lá o nível inteiro: esconder de vez criaria uma criança
 * presa num baú que ela não teria mais como resolver. Quantas vezes ela abriu
 * é medida — não é castigo.
 */
export function createLegend(scene: Phaser.Scene) {
    const button = scene.add.graphics().setDepth(DEPTH.hud)
    const label = scene.add.text(LEGEND_BTN.x, LEGEND_BTN.y, 'LEGENDA', {
        fontFamily: FONT.black,
        fontSize: SIZE.legendLabel,
        color: CSS.ink,
    }).setOrigin(0.5).setDepth(DEPTH.hud).setResolution(2)

    const zone = scene.add.zone(LEGEND_BTN.x, LEGEND_BTN.y, LEGEND_BTN.w, LEGEND_BTN.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud)
        .setInteractive({ useHandCursor: true })

    const panel = scene.add.container(LEGEND_PANEL.cx, 0).setDepth(DEPTH.legend)
    const panelBg = scene.add.graphics()
    panel.add(panelBg)

    let rows: Card[] = []
    let open = false
    let opens = 0
    let sticky = false
    let hideTimer: Phaser.Time.TimerEvent | null = null

    const paintButton = () => {
        button.clear()
        button.fillStyle(C.ink, 0.2)
        button.fillRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2, LEGEND_BTN.y - LEGEND_BTN.h / 2 + 5,
            LEGEND_BTN.w, LEGEND_BTN.h, 18,
        )
        button.fillStyle(open ? C.warn : C.cream, 1)
        button.fillRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2, LEGEND_BTN.y - LEGEND_BTN.h / 2,
            LEGEND_BTN.w, LEGEND_BTN.h, 18,
        )
        button.lineStyle(5, open ? C.warnDark : C.woodDark, 1)
        button.strokeRoundedRect(
            LEGEND_BTN.x - LEGEND_BTN.w / 2, LEGEND_BTN.y - LEGEND_BTN.h / 2,
            LEGEND_BTN.w, LEGEND_BTN.h, 18,
        )
    }
    paintButton()

    const clearRows = () => {
        panel.list.slice(1).forEach(child => child.destroy())
        rows = []
    }

    const setVisible = (value: boolean) => {
        open = value
        panel.setVisible(value)
        paintButton()
    }

    const api = {
        build(words: Word[], from: Code, to: Code) {
            clearRows()
            const h = LEGEND_PANEL.pad * 2 + words.length * LEGEND_PANEL.rowH
            panel.setY(LEGEND_PANEL.top + h / 2)

            panelBg.clear()
            panelBg.fillStyle(C.ink, 0.22)
            panelBg.fillRoundedRect(-LEGEND_PANEL.w / 2, -h / 2 + 7, LEGEND_PANEL.w, h, 26)
            panelBg.fillStyle(C.cream, 0.97)
            panelBg.fillRoundedRect(-LEGEND_PANEL.w / 2, -h / 2, LEGEND_PANEL.w, h, 26)
            panelBg.lineStyle(6, C.woodDark, 1)
            panelBg.strokeRoundedRect(-LEGEND_PANEL.w / 2, -h / 2, LEGEND_PANEL.w, h, 26)

            words.forEach((word, i) => {
                const y = -h / 2 + LEGEND_PANEL.pad + LEGEND_PANEL.rowH * (i + 0.5)

                const left = createCard(scene, word, from, 52)
                left.container.setPosition(-52, y)
                panel.add(left.container)

                const right = createCard(scene, word, to, 52)
                right.container.setPosition(52, y)
                panel.add(right.container)

                const equals = scene.add.text(0, y, '=', {
                    fontFamily: FONT.black,
                    fontSize: SIZE.legendTitle,
                    color: CSS.inkSoft,
                }).setOrigin(0.5).setResolution(2)
                panel.add(equals)

                rows.push(left, right)
            })
        },

        /** No nível de legenda fixa, `sticky` ignora o prazo: ela não some. */
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
                hideTimer = scene.time.delayedCall(FX.ms(scene, autoHideMs), () => setVisible(false))
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

        /** Reacende sozinha na trava: é apoio, e não a resposta. */
        peek(ms: number) {
            api.show(ms)
        },

        get openCount() {
            return opens
        },

        setEnabled(value: boolean) {
            zone.setVisible(value)
            button.setAlpha(value ? 1 : 0.5)
            label.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            hideTimer?.remove()
            clearRows()
            panel.destroy()
            button.destroy()
            label.destroy()
            zone.destroy()
        },
    }

    zone.on('pointerdown', () => {
        FX.press(scene, button)
        api.toggle()
    })

    setVisible(false)
    return api
}
