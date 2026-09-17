import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, SPEECH } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import { TEX } from './BootScene'

export type Voice = 'robot' | 'neighbour' | 'question' | 'tip' | 'close'

export interface Speech {
    /** O robô fala, e ESPERA o CONTINUAR. Ninguém lê no tempo do jogo. */
    say(text: string): Promise<void>
    /**
     * Um vizinho fala. Mesma faixa, mas o balão é creme (a cor das plaquinhas
     * deles) e o rabinho aponta PARA BAIXO, para quem está falando.
     */
    byNeighbour(text: string, tailX: number): Promise<void>
    /** A pergunta do robô. Fica na tela, sem botão: ela não é um passo. */
    ask(text: string): Promise<void>
    /** A mesma pergunta, reposta na hora — depois de uma dica, por exemplo. */
    question(text: string): void
    pulse(): void
    /** A dica da TRAVA: entra e fica, para a criança agir com ela à vista. */
    tip(text: string): Promise<void>
    /** O fecho da rodada, com o ícone de quem resolveu. Também espera o toque. */
    close(text: string, icon?: number): Promise<void>
    clear(): void
    destroy(): void
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FAIXA DE FALA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Quatro vozes num endereço fixo, e elas não podem parecer a mesma coisa:
 *
 *   robô      balão azul-acinzentado com rabinho apontando pra ele
 *   pergunta  o mesmo balão, com um "?" rosa à esquerda
 *   dica      faixa âmbar
 *   fecho     faixa verde com o ícone de quem resolveu
 *
 * Branco NUNCA aparece aqui: branco é a cor do papel da notícia, e só dela.
 *
 * ── NADA PASSA SOZINHO ───────────────────────────────────────────────────
 *
 * As falas de história (`say` e `close`) escrevem a frase e **param**, com um
 * CONTINUAR aceso na ponta da faixa. Quem lê devagar não perde nada, e quem já
 * leu toca e segue. Um toque durante a escrita completa a frase na hora — é o
 * que todo mundo faz por instinto, e tirar isso deixa o jogo lento.
 */
export interface SpeechOptions {
    /** Chamado com `true` quando uma frase começa a ser escrita, e `false` no fim. */
    onTalk?(on: boolean, voice: Voice): void
}

export function createSpeech(scene: Phaser.Scene, options: SpeechOptions = {}): Speech {
    const root = scene.add.container(SPEECH.x, SPEECH.y).setDepth(DEPTH.speech).setAlpha(0)

    const box = scene.add.graphics()
    root.add(box)

    const mark = scene.add
        .text(38, SPEECH.h / 2 - 1, '?', {
            fontFamily: FONT.black,
            fontSize: '36px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setVisible(false)
    root.add(mark)

    const icon = scene.textures.exists(TEX.icons)
        ? scene.add.sprite(36, SPEECH.h / 2, TEX.icons, 0).setDisplaySize(42, 42).setVisible(false)
        : undefined
    if (icon) root.add(icon)

    const label = scene.add
        .text(24, SPEECH.h / 2, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.ink,
            wordWrap: { width: SPEECH.wrap },
            lineSpacing: 0,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    root.add(label)

    /* ── o CONTINUAR ─────────────────────────────────────────────────── */

    const nextX = SPEECH.w - SPEECH.nextPad - SPEECH.nextW
    const nextY = (SPEECH.h - SPEECH.nextH) / 2

    const next = scene.add.container(nextX + SPEECH.nextW / 2, nextY + SPEECH.nextH / 2).setVisible(false)
    const nextBg = scene.add.graphics()
    nextBg.fillStyle(C.ink, 1)
    nextBg.fillRoundedRect(-SPEECH.nextW / 2, -SPEECH.nextH / 2, SPEECH.nextW, SPEECH.nextH, SPEECH.nextH / 2)
    nextBg.fillStyle(C.band, 1)
    nextBg.fillRoundedRect(
        -SPEECH.nextW / 2 + 4, -SPEECH.nextH / 2 + 4,
        SPEECH.nextW - 8, SPEECH.nextH - 8, (SPEECH.nextH - 8) / 2,
    )
    nextBg.fillStyle(C.white, 0.22)
    nextBg.fillRoundedRect(-SPEECH.nextW / 2 + 12, -SPEECH.nextH / 2 + 9, SPEECH.nextW - 24, 12, 6)
    next.add(nextBg)

    const nextTxt = scene.add
        .text(-8, 0, 'CONTINUAR', {
            fontFamily: FONT.black,
            fontSize: '22px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    nextTxt.setStroke(CSS.ink, 4)
    next.add(nextTxt)

    const arrow = scene.add.graphics()
    arrow.fillStyle(C.white, 1)
    arrow.fillTriangle(SPEECH.nextW / 2 - 30, -10, SPEECH.nextW / 2 - 30, 10, SPEECH.nextW / 2 - 14, 0)
    next.add(arrow)

    root.add(next)

    /* ── o toque: pula a escrita, ou confirma a fala ─────────────────── */

    let writer: { skip(): void } | undefined
    let waiting: (() => void) | undefined
    let typing = false

    const zone = scene.add
        .zone(SPEECH.x, SPEECH.y, SPEECH.w, SPEECH.h)
        .setOrigin(0, 0)
        .setDepth(DEPTH.speech + 1)
        .setInteractive({ useHandCursor: true })
    if (zone.input) zone.input.enabled = false

    zone.on('pointerdown', () => {
        if (typing) {
            writer?.skip()
            return
        }
        const done = waiting
        waiting = undefined
        next.setVisible(false)
        if (zone.input) zone.input.enabled = false
        done?.()
    })

    let tailAt = 0

    const paint = (voice: Voice) => {
        const w = SPEECH.w
        const h = SPEECH.h
        box.clear()
        box.fillStyle(C.ink, A.shadow)
        box.fillRoundedRect(4, 6, w, h, 16)
        box.fillStyle(C.ink, 1)
        box.fillRoundedRect(0, 0, w, h, 16)

        const fill =
            voice === 'tip' ? C.amber
                : voice === 'close' ? C.green
                    : voice === 'neighbour' ? C.sign
                        : C.bubble
        box.fillStyle(fill, 1)
        box.fillRoundedRect(4, 4, w - 8, h - 8, 13)

        // A PERGUNTA é do robô, e é por isso que ela tem o balão e o rabinho
        // dele. Uma pergunta sem dono não é pergunta.
        if (voice === 'robot' || voice === 'question') {
            box.fillStyle(C.ink, 1)
            box.fillTriangle(w - 62, h - 2, w - 20, h - 2, w - 8, h + 24)
            box.fillStyle(C.bubble, 1)
            box.fillTriangle(w - 58, h - 8, w - 26, h - 8, w - 16, h + 14)
        }

        if (voice === 'neighbour') {
            const t = Phaser.Math.Clamp(tailAt - SPEECH.x, 60, w - 60)
            box.fillStyle(C.ink, 1)
            box.fillTriangle(t - 22, h - 2, t + 22, h - 2, t, h + 26)
            box.fillStyle(C.sign, 1)
            box.fillTriangle(t - 16, h - 8, t + 16, h - 8, t, h + 16)
        }

        if (voice === 'question') {
            box.fillStyle(C.band, 1)
            box.fillCircle(38, h / 2, 23)
        }
    }

    const dress = (voice: Voice, frame?: number) => {
        paint(voice)
        const withIcon = voice === 'close' && frame !== undefined && !!icon
        mark.setVisible(voice === 'question')
        if (icon) icon.setVisible(!!withIcon)
        if (withIcon && frame !== undefined) icon.setFrame(frame)
        label.setX(voice === 'question' ? 76 : withIcon ? 72 : 24)
    }

    const type = async (voice: Voice, text: string, frame?: number) => {
        writer?.skip()
        dress(voice, frame)
        label.setText('')
        next.setVisible(false)

        if (root.alpha < 1) {
            root.setAlpha(0)
            void FX.to(scene, root, { alpha: 1 }, { duration: 200 })
        }

        typing = true
        options.onTalk?.(true, voice)
        if (zone.input) zone.input.enabled = true
        writer = FX.type(scene, label, text, { delay: 18 })
        await writer
        typing = false
        options.onTalk?.(false, voice)
    }

    /** Escreve e PARA, até alguém tocar no CONTINUAR. */
    const beat = async (voice: Voice, text: string, frame?: number) => {
        await type(voice, text, frame)
        next.setVisible(true).setScale(0.8)
        void FX.to(scene, next, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        await new Promise<void>(resolve => {
            waiting = resolve
        })
    }

    return {
        say: text => beat('robot', text),

        byNeighbour: (text, x) => {
            tailAt = x
            return beat('neighbour', text)
        },

        close: (text, iconFrame) => beat('close', text, iconFrame),

        ask: async text => {
            await type('question', text)
            if (zone.input) zone.input.enabled = false
        },

        question: text => {
            writer?.skip()
            dress('question')
            label.setText(text)
            next.setVisible(false)
            root.setAlpha(1)
            if (zone.input) zone.input.enabled = false
        },

        pulse: () => {
            void FX.to(scene, root, { scale: 1.03 }, { duration: 140 })
                .then(() => FX.to(scene, root, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' }))
        },

        tip: async text => {
            await FX.to(scene, root, { alpha: 1 }, { duration: 120 })
            await type('tip', text)
            if (zone.input) zone.input.enabled = false
        },

        clear: () => {
            writer?.skip()
            waiting = undefined
            typing = false
            label.setText('')
            next.setVisible(false)
            root.setAlpha(0)
            if (zone.input) zone.input.enabled = false
        },

        destroy: () => {
            writer?.skip()
            waiting?.()
            zone.destroy()
            root.destroy(true)
        },
    }
}
