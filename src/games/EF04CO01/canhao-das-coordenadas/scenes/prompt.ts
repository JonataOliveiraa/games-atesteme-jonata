import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HINT, HINT_L2, PROMPT } from '../data/layout'
import { C, CSS, FONT, inkOf } from '../data/theme'

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

    /** A dica desce no nível 2, onde os cartões ocupam a faixa do meio. */
    let box = HINT

    const paintHint = (tone: Tone) => {
        hintBox.clear()
        if (tone === 'idle') return
        const face = tone === 'warn' ? C.amber : C.green
        const deep = tone === 'warn' ? C.amberDeep : C.greenDeep
        hintBox.fillStyle(C.ink, 0.22)
        hintBox.fillRoundedRect(box.x + 4, box.y + 8, box.w, box.h, 20)
        hintBox.fillStyle(C.ink, 1)
        hintBox.fillRoundedRect(box.x - 4, box.y - 4, box.w + 8, box.h + 8, 22)
        hintBox.fillStyle(deep, 1)
        hintBox.fillRoundedRect(box.x, box.y, box.w, box.h, 18)
        hintBox.fillStyle(face, 1)
        hintBox.fillRoundedRect(box.x, box.y, box.w, box.h - 7, 18)
        hintBox.fillStyle(C.white, 0.24)
        hintBox.fillRoundedRect(box.x + 20, box.y + 9, box.w - 40, 10, 5)
    }

    /*
     * A SEGUNDA LINHA DO NÍVEL 3.
     *
     * "MOVER L2, C2" em cima e "1 coluna →" embaixo, com a seta desenhada e um
     * quadradinho da COR da mancha que vai andar. O destino não é escrito: a
     * criança o deduz da origem mais a direção, que é justamente a manipulação
     * que a EF04CO01 pede. Escrever o destino faria o pedido responder sozinho.
     */
    const shiftBox = scene.add.graphics()
    const shiftText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.ink,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
        .setVisible(false)
    root.add(shiftBox)
    root.add(shiftText)

    const paintShift = (dr: number, dc: number, ink: number | null) => {
        shiftBox.clear()
        if (dr === 0 && dc === 0) {
            shiftText.setVisible(false)
            rule.setVisible(true)
            return
        }
        rule.setVisible(false)
        const palavra = dc !== 0 ? 'coluna' : 'linha'
        const y = PROMPT.y + PROMPT.h + 30
        const w = 300
        const x = PROMPT.x + PROMPT.w / 2 - w / 2

        shiftBox.fillStyle(C.ink, 1)
        shiftBox.fillRoundedRect(x - 3, y - 27, w + 6, 54, 27)
        shiftBox.fillStyle(C.wall, 1)
        shiftBox.fillRoundedRect(x, y - 24, w, 48, 24)

        if (ink !== null) {
            const tinta = inkOf(ink)
            shiftBox.fillStyle(C.ink, 1)
            shiftBox.fillRoundedRect(x + 12, y - 16, 34, 32, 9)
            shiftBox.fillStyle(tinta.face, 1)
            shiftBox.fillRoundedRect(x + 15, y - 13, 28, 26, 7)
        }

        shiftText.setText(`1 ${palavra}`).setPosition(x + 56, y).setVisible(true)

        // a seta: desenhada, nunca escrita como "→" numa fonte que pode faltar
        const ax = x + w - 54
        const dirX = dc !== 0 ? Math.sign(dc) : 0
        const dirY = dr !== 0 ? Math.sign(dr) : 0
        shiftBox.lineStyle(9, C.paint, 1)
        shiftBox.lineBetween(ax - dirX * 16, y - dirY * 16, ax + dirX * 16, y + dirY * 16)
        shiftBox.beginPath()
        shiftBox.moveTo(ax + dirX * 22, y + dirY * 22)
        shiftBox.lineTo(ax + dirX * 6 - dirY * 12, y + dirY * 6 - dirX * 12)
        shiftBox.lineTo(ax + dirX * 6 + dirY * 12, y + dirY * 6 + dirX * 12)
        shiftBox.closePath()
        shiftBox.fillStyle(C.paint, 1)
        shiftBox.fillPath()
    }

    return {
        setAsk(text: string) {
            ask.setText(text)
            scene.tweens.killTweensOf(ask)
            ask.setScale(0.9)
            return FX.to(scene, ask, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        /** `0, 0` esconde a linha do deslocamento e devolve a convenção L/C. */
        setShift(dr: number, dc: number, ink: number | null = null) {
            paintShift(dr, dc, ink)
        },

        /** No nível 2 a dica desce, para os cartões ocuparem a faixa do meio. */
        useLowHint(low: boolean) {
            box = low ? HINT_L2 : HINT
            hintText.setPosition(box.x + box.w / 2, box.y + box.h / 2)
            hintText.setStyle({ wordWrap: { width: box.w - 56 } })
            lock.setPosition(box.x + 34, box.y + box.h / 2)
        },

        /** `withLock` só no erro: o cadeado é o sinal de que a tarefa travou. */
        say(text: string, tone: Exclude<Tone, 'idle'>, withLock = false) {
            paintHint(tone)
            hintText.setText(text)
            hintText.setColor(tone === 'warn' ? CSS.amberInk : CSS.white)
            hintText.setX(box.x + box.w / 2 + (withLock ? 22 : 0))
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
            scene.tweens.killTweensOf([root, ask, hintText, lock, shiftBox, shiftText])
            root.destroy(true)
            lock.destroy()
        },
    }
}

export type Prompt = ReturnType<typeof createPrompt>
