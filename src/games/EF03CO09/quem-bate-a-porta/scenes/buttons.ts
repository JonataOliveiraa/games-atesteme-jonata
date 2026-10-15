import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE } from '../data/files'
import { BUTTONS, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { BUTTON } from '../data/words'
import type { Action } from '../types'
import { pieceImage } from './art'

type Rect = { x: number; y: number; w: number; h: number }

/**
 * ENVIAR e NÃO ENVIAR: mesma cor, mesmo tamanho, mesmo brilho (nenhum entrega a resposta).
 * PERGUNTAR AO DAVI entra no meio só quando a informação é dele (N2).
 */
export interface Buttons {
    show(): Promise<void>
    hide(): Promise<void>
    /** mostra ou tira o PERGUNTAR, abrindo espaço no meio */
    setAsk(on: boolean): Promise<void>
    enable(on: boolean): void
    /** depois da pergunta, o PERGUNTAR apaga */
    enableAsk(on: boolean): void
    hit(px: number, py: number): Action | null
    press(action: Action): void
    center(action: Action): { x: number; y: number }
    rect(action?: Action): Rect
    destroy(): void
}

const ICON: Record<Action, number> = { send: PIECE.plane, keep: PIECE.box, ask: PIECE.ask }

export function createButtons(scene: Phaser.Scene): Buttons {
    const { w, h, y } = BUTTONS
    const make = (action: Action) => {
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 30)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 30)
        g.lineStyle(5, C.ink, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 30)
        const icon = pieceImage(scene, ICON[action], BUTTONS.icon).setPosition(-w / 2 + 50, 0)
        const label = scene.add
            .text(34, 2, BUTTON[action], { fontFamily: FONT.black, fontSize: action === 'ask' ? '24px' : '28px', color: CSS.ink, align: 'center' })
            .setOrigin(0.5)
            .setResolution(2)
        if (label.width > w - 110) label.setScale((w - 110) / label.width)
        return scene.add.container(BUTTONS.two[action === 'ask' ? 'send' : action], y, [g, icon, label]).setDepth(DEPTH.buttons).setVisible(false)
    }
    const boxes: Record<Action, Phaser.GameObjects.Container> = { send: make('send'), keep: make('keep'), ask: make('ask') }
    let enabled = false
    let askOn = false
    let askEnabled = false
    const visible = () => (Object.keys(boxes) as Action[]).filter(a => a !== 'ask' || askOn)
    const paint = () => {
        boxes.send.setAlpha(enabled ? 1 : 0.6)
        boxes.keep.setAlpha(enabled ? 1 : 0.6)
        boxes.ask.setAlpha(enabled && askEnabled ? 1 : 0.6)
    }

    return {
        async show() {
            const all = visible().map(a => boxes[a])
            all.forEach(b => b.setVisible(true).setScale(0.3))
            await FX.all(...all.map((b, i) => FX.to(scene, b, { scale: 1 }, { duration: 380, delay: i * 90, ease: 'Back.easeOut' })))
        },
        async hide() {
            const all = Object.values(boxes).filter(b => b.visible)
            await FX.all(...all.map(b => FX.to(scene, b, { scale: 0.3, alpha: 0 }, { duration: 200 })))
            all.forEach(b => b.setVisible(false).setScale(1))
            paint()
        },
        async setAsk(on) {
            if (on === askOn) return
            askOn = on
            askEnabled = on
            paint()
            const xs = on ? BUTTONS.three : BUTTONS.two
            const moves = [FX.to(scene, boxes.send, { x: xs.send }, { duration: 280, ease: 'Sine.easeInOut' }), FX.to(scene, boxes.keep, { x: xs.keep }, { duration: 280, ease: 'Sine.easeInOut' })]
            if (on) {
                boxes.ask.setPosition(BUTTONS.three.ask, y).setVisible(true).setScale(0.3)
                moves.push(FX.to(scene, boxes.ask, { scale: 1 }, { duration: 340, delay: 120, ease: 'Back.easeOut' }))
            } else moves.push(FX.to(scene, boxes.ask, { scale: 0.3 }, { duration: 200 }).then(() => void boxes.ask.setVisible(false)))
            await FX.all(...moves)
        },
        enable(on) {
            enabled = on
            paint()
        },
        enableAsk(on) {
            askEnabled = on
            paint()
        },
        hit(px, py) {
            if (!enabled) return null
            const found = visible().find(a => Math.abs(px - boxes[a].x) <= w / 2 + 8 && Math.abs(py - boxes[a].y) <= h / 2 + 8)
            if (found === 'ask' && !askEnabled) return null
            return found ?? null
        },
        press(action) {
            void FX.press(scene, boxes[action])
        },
        center(action) {
            return { x: boxes[action].x, y: boxes[action].y }
        },
        rect(action) {
            if (action) return { x: boxes[action].x, y, w: w + 24, h: h + 24 }
            const xs = visible().map(a => boxes[a].x)
            const l = Math.min(...xs)
            const r = Math.max(...xs)
            return { x: (l + r) / 2, y, w: r - l + w + 30, h: h + 24 }
        },
        destroy() {
            Object.values(boxes).forEach(b => b.destroy())
        },
    }
}
