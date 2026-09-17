import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BUST, CELL, DEPTH, SIGN, cells, signFor } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Answer, Neighbour } from '../types'
import { BUST_FRAME } from '../data/cast'
import { TEX } from './BootScene'

export interface NeighbourView {
    readonly id: string
    readonly asked: boolean
    readonly center: { x: number; y: number }
    readonly box: { x: number; y: number; w: number; h: number }
    enter(delay: number): Promise<void>
    /** Volta ao estado de rodada nova: plaquinha fechada e pessoa fora da tela. */
    reset(): void
    reveal(answer: Answer): Promise<void>
    /** O anel que pisca dizendo "toque aqui". Só um por vez, e só no começo. */
    beacon(on: boolean): void
    jump(): Promise<void>
    call(): Promise<void>
    shine(): Promise<void>
    setEnabled(on: boolean): void
    destroy(): void
}

export interface NeighbourOptions {
    index: number
    count: number
    who: Neighbour
    onTap(id: string): void
}

/**
 * A plaquinha fechada mostra só um balão de reticências: ele tem algo a dizer, e
 * isso ninguém precisa aprender. Quem ele É não fica escrito em cima dele — ele
 * mesmo conta, na própria voz, quando entra pela primeira vez no nível.
 */
export function createNeighbour(scene: Phaser.Scene, options: NeighbourOptions): NeighbourView {
    const cell = cells(options.count)[options.index]
    const look = signFor(options.count)
    const cx = cell.cx
    const root = scene.add.container(0, 0).setDepth(DEPTH.neighbour).setAlpha(0)
    root.setY(150)

    if (scene.textures.exists(TEX.busts)) {
        const bust = scene.add
            .sprite(cx, BUST.bottom, TEX.busts, BUST_FRAME[options.who.id] ?? 0)
            .setOrigin(0.5, 1)
        bust.setScale(BUST.h / bust.height)
        root.add(bust)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.slate, 1)
        g.fillRoundedRect(cx - 70, BUST.bottom - BUST.h, 140, BUST.h, 40)
        g.fillStyle(C.ink, 1)
        g.fillCircle(cx - 22, BUST.bottom - BUST.h + 70, 12)
        g.fillCircle(cx + 22, BUST.bottom - BUST.h + 70, 12)
        root.add(g)
    }

    /* ── a plaquinha ─────────────────────────────────────────────────── */

    const sign = scene.add.container(cx, SIGN.y + SIGN.h / 2)

    const board = scene.add.graphics()
    const w = cell.w
    const h = SIGN.h
    board.fillStyle(C.ink, A.shadow)
    board.fillRoundedRect(-w / 2 + 5, -h / 2 + 7, w, h, 16)
    board.fillStyle(C.ink, 1)
    board.fillRoundedRect(-w / 2, -h / 2, w, h, 16)
    board.fillStyle(C.sign, 1)
    board.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 11)
    sign.add(board)

    // fechada: um balão de fala com reticências, grande, no meio da plaquinha
    const closed = scene.add.graphics()
    closed.fillStyle(C.ink, 1)
    closed.fillRoundedRect(-66, -32, 132, 62, 22)
    closed.fillTriangle(-18, 28, 16, 28, -4, 48)
    closed.fillStyle(C.signDeep, 1)
    closed.fillCircle(-30, -2, 10)
    closed.fillCircle(0, -2, 10)
    closed.fillCircle(30, -2, 10)
    sign.add(closed)

    const icon = scene.textures.exists(TEX.icons)
        ? scene.add.sprite(look.textPad / 2 - w / 2, 0, TEX.icons, 0).setVisible(false)
        : undefined
    if (icon) {
        icon.setDisplaySize(look.iconR * 2, look.iconR * 2)
        sign.add(icon)
    }

    const answerText = scene.add
        .text(look.textPad - w / 2, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${look.sizes[0]}px`,
            color: CSS.ink,
            wordWrap: { width: w - look.textPad - look.pad },
            lineSpacing: 1,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    sign.add(answerText)

    /**
     * A resposta cabe na plaquinha, custe o que custar. O limite de conteúdo é
     * de PALAVRAS (cinco), mas palavra comprida em célula estreita estoura a
     * caixa do mesmo jeito — e texto vazando por cima do desenho é a coisa mais
     * feia que este jogo pode mostrar. Aqui o corpo do texto desce um degrau de
     * cada vez até caber.
     */
    const fitText = (text: string) => {
        const max = h - 26
        for (const size of look.sizes) {
            answerText.setFontSize(size)
            answerText.setText(text)
            if (answerText.height <= max) return
        }
    }

    const stamp = scene.add
        .text(w / 2 - 16, h / 2 - 20, '', {
            fontFamily: FONT.black,
            fontSize: '18px',
            color: CSS.amberDeep,
        })
        .setOrigin(1, 0.5)
        .setResolution(2)
    sign.add(stamp)

    root.add(sign)

    /* ── o anel de "toque aqui" ──────────────────────────────────────── */

    const ring = scene.add.graphics().setDepth(DEPTH.sign + 2).setVisible(false)
    ring.lineStyle(8, C.white, 1)
    ring.strokeRoundedRect(-w / 2, -h / 2, w, h, 16)
    ring.setPosition(cx, SIGN.y + SIGN.h / 2)
    let ringTween: Phaser.Tweens.Tween | undefined

    /* ── o alvo: a célula inteira ────────────────────────────────────── */

    let asked = false
    let enabled = false

    const zone = scene.add
        .zone(cell.x, CELL.y, cell.w, CELL.h)
        .setOrigin(0, 0)
        .setDepth(DEPTH.sign + 1)
        .setInteractive({ useHandCursor: true })

    zone.on('pointerdown', () => {
        if (!enabled || asked) return
        options.onTap(options.who.id)
    })

    const beacon = (on: boolean) => {
        ringTween?.remove()
        ringTween = undefined
        ring.setVisible(on)
        if (!on) return
        ring.setScale(1).setAlpha(1)
        ringTween = scene.tweens.add({
            targets: ring,
            scale: 1.1,
            alpha: 0.25,
            duration: 700,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    return {
        id: options.who.id,
        get asked() {
            return asked
        },
        center: { x: cx, y: SIGN.y + SIGN.h / 2 },
        box: { x: cell.x, y: CELL.y, w: cell.w, h: CELL.h },

        reset: () => {
            asked = false
            beacon(false)
            closed.setVisible(true)
            icon?.setVisible(false)
            answerText.setText('')
            stamp.setText('')
            sign.setScale(1).setAngle(0)
            sign.setY(SIGN.y + SIGN.h / 2)
            root.setY(150).setAlpha(0)
        },

        enter: async delay => {
            await FX.wait(scene, delay)
            await FX.to(scene, root, { y: 0, alpha: 1 }, { duration: 420, ease: 'Back.easeOut' })
        },


        reveal: async answer => {
            if (asked) return
            asked = true
            beacon(false)

            await FX.flip(scene, sign, () => {
                closed.setVisible(false)
                icon?.setVisible(true)
                icon?.setFrame(answer.icon)
                fitText(answer.text)
                if (answer.stamp) stamp.setText(answer.stamp)
            })
        },

        beacon,

        jump: () => FX.to(scene, sign, { y: sign.y - 14 }, { duration: 140, yoyo: true, ease: 'Sine.easeOut' }),

        call: async () => {
            await FX.to(scene, sign, { angle: -4 }, { duration: 110, yoyo: true, repeat: 3 })
            sign.setAngle(0)
        },

        shine: () => FX.highlight(scene, sign, C.green),

        setEnabled: on => {
            enabled = on
            if (zone.input) zone.input.enabled = on
        },

        destroy: () => {
            ringTween?.remove()
            ring.destroy()
            zone.destroy()
            root.destroy(true)
        },
    }
}
