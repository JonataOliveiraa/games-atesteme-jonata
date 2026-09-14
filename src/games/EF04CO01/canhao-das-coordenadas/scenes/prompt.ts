import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HINT, PROMPT } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PEDIDO E A DICA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Dois móveis FIXOS no lado direito: em cima o que fazer, embaixo o que houve.
 * Nenhum dos dois aparece e some — eles trocam de conteúdo. Painel que nasce e
 * morre a cada passo deixa a tela inquieta e tira o endereço das coisas: a
 * criança que já leu o pedido uma vez sabe onde reler.
 *
 * A moldura opaca não é enfeite. O fundo do pátio tem uma janela azul e uma
 * estante de tintas justamente nesta faixa, e texto solto ali vira ilegível.
 */

type Tone = 'warn' | 'good' | 'idle'

export function createPrompt(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)

    const card = scene.add.graphics()
    card.fillStyle(C.ink, 0.22)
    card.fillRoundedRect(PROMPT.x + 5, PROMPT.y + 9, PROMPT.w, PROMPT.h, 22)
    card.fillStyle(C.ink, 1)
    card.fillRoundedRect(PROMPT.x - 4, PROMPT.y - 4, PROMPT.w + 8, PROMPT.h + 8, 24)
    card.fillStyle(C.paintDeep, 1)
    card.fillRoundedRect(PROMPT.x, PROMPT.y, PROMPT.w, PROMPT.h, 20)
    card.fillStyle(C.paint, 1)
    card.fillRoundedRect(PROMPT.x, PROMPT.y, PROMPT.w, PROMPT.h - 8, 20)
    card.fillStyle(C.white, 0.26)
    card.fillRoundedRect(PROMPT.x + 20, PROMPT.y + 10, PROMPT.w - 40, 12, 6)
    root.add(card)

    const ask = scene.add
        .text(PROMPT.x + PROMPT.w / 2, PROMPT.y + PROMPT.h / 2 - 2, '', {
            fontFamily: FONT.black,
            fontSize: '44px',
            color: CSS.white,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    ask.setStroke(CSS.ink, 6)
    root.add(ask)

    /*
     * A convenção fica escrita, e fica PARADA.
     *
     * "L antes de C" é a regra que o jogo inteiro cobra; deixá-la só no
     * tutorial faria a criança depender de ter prestado atenção uma vez.
     */
    const rule = scene.add
        .text(PROMPT.x + PROMPT.w / 2, PROMPT.y + PROMPT.h + 22, 'L = linha  ·  C = coluna', {
            fontFamily: FONT.body,
            fontStyle: 'bold',
            fontSize: '22px',
            color: CSS.inkSoft,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(rule)

    const hintBox = scene.add.graphics()
    const hintText = scene.add
        .text(HINT.x + HINT.w / 2, HINT.y + HINT.h / 2, '', {
            fontFamily: FONT.body,
            fontStyle: 'bold',
            fontSize: '23px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: HINT.w - 56 },
            lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(hintBox)
    root.add(hintText)

    const lock = scene.add.graphics().setDepth(DEPTH.panel + 1).setVisible(false)
    lock.lineStyle(7, C.ink, 1)
    lock.beginPath()
    lock.arc(0, -9, 12, Math.PI, 0)
    lock.strokePath()
    lock.lineStyle(4, C.amber, 1)
    lock.beginPath()
    lock.arc(0, -9, 12, Math.PI, 0)
    lock.strokePath()
    lock.fillStyle(C.ink, 1)
    lock.fillRoundedRect(-20, -11, 40, 32, 8)
    lock.fillStyle(C.amber, 1)
    lock.fillRoundedRect(-17, -8, 34, 26, 6)
    lock.fillStyle(C.amberDeep, 1)
    lock.fillCircle(0, 2, 5)
    lock.fillRect(-2, 2, 4, 9)
    lock.setPosition(HINT.x + 34, HINT.y + HINT.h / 2)

    const paintHint = (tone: Tone) => {
        hintBox.clear()
        if (tone === 'idle') return
        const face = tone === 'warn' ? C.amber : C.green
        const deep = tone === 'warn' ? C.amberDeep : C.greenDeep
        hintBox.fillStyle(C.ink, 0.22)
        hintBox.fillRoundedRect(HINT.x + 4, HINT.y + 8, HINT.w, HINT.h, 20)
        hintBox.fillStyle(C.ink, 1)
        hintBox.fillRoundedRect(HINT.x - 4, HINT.y - 4, HINT.w + 8, HINT.h + 8, 22)
        hintBox.fillStyle(deep, 1)
        hintBox.fillRoundedRect(HINT.x, HINT.y, HINT.w, HINT.h, 18)
        hintBox.fillStyle(face, 1)
        hintBox.fillRoundedRect(HINT.x, HINT.y, HINT.w, HINT.h - 7, 18)
        hintBox.fillStyle(C.white, 0.24)
        hintBox.fillRoundedRect(HINT.x + 20, HINT.y + 9, HINT.w - 40, 10, 5)
    }

    return {
        setAsk(text: string) {
            ask.setText(text)
            scene.tweens.killTweensOf(ask)
            ask.setScale(0.9)
            return FX.to(scene, ask, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        /** `withLock` só no erro: o cadeado é o sinal de que a tarefa travou. */
        say(text: string, tone: Exclude<Tone, 'idle'>, withLock = false) {
            paintHint(tone)
            hintText.setText(text)
            hintText.setColor(tone === 'warn' ? CSS.amberInk : CSS.white)
            hintText.setX(HINT.x + HINT.w / 2 + (withLock ? 22 : 0))
            lock.setVisible(withLock)
            if (withLock) {
                scene.tweens.killTweensOf(lock)
                lock.setScale(0.3)
                void FX.to(scene, lock, { scale: 1 }, { duration: 230, ease: 'Back.easeOut' })
            }
            scene.tweens.killTweensOf(hintText)
            hintText.setAlpha(0)
            return FX.to(scene, hintText, { alpha: 1 }, { duration: 200 })
        },

        hush() {
            paintHint('idle')
            hintText.setText('')
            lock.setVisible(false)
        },

        bounds() {
            return {
                x: PROMPT.x + PROMPT.w / 2,
                y: PROMPT.y + PROMPT.h / 2,
                w: PROMPT.w + 40,
                h: PROMPT.h + 70,
            }
        },

        destroy() {
            scene.tweens.killTweensOf([root, ask, hintText, lock])
            root.destroy(true)
            lock.destroy()
        },
    }
}

export type Prompt = ReturnType<typeof createPrompt>
