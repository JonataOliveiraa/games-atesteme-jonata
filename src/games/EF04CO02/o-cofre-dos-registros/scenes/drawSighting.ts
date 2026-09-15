import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { LIFE_FRAME, LIFE_SHEET, SHEET, lifeOrigin, lifeScale } from '../data/art'
import { CLUE, CREATURE_SPAN, DEPTH, RING } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { CreatureId } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O ARO DE OBSERVAÇÃO E A PISTA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O aro é Graphics, não parte do fundo. Ele pisca quando a criatura chega e
 * acende de novo quando a ficha fecha — um aro pintado na textura obrigaria o
 * layout a se alinhar ao desenho, que é a armadilha de sempre.
 *
 * A pista fica LOGO ABAIXO e some só no fim da fase. A criança precisa poder
 * reler a frase a qualquer momento: esconder a pista para "aumentar a
 * dificuldade" transformaria um exercício de leitura de registro num
 * exercício de memória.
 */

/**
 * O corpo da fonte da pista é uma FAIXA, não um número.
 *
 * 38 px é o alvo do §7; o piso de 26 px é o ponto em que a frase ainda é
 * legível num celular a 30% (cerca de 8 px reais). Entre os dois, quem manda
 * é a altura da caixa.
 */
const CLUE_FONT = { base: 38, min: 26, step: 2 }

/** A altura útil da placa, descontada a margem de respiro. */
const CLUE_ROOM = CLUE.h - 22

const COLOR_OF: Record<CreatureId, number> = {
    octopus: C.octopus,
    fish: C.fish,
    crab: C.crab,
}

const FRAME_OF: Record<CreatureId, number> = {
    octopus: LIFE_FRAME.octopus,
    fish: LIFE_FRAME.fish,
    crab: LIFE_FRAME.crab,
}

/** Reserva geométrica: cada criatura vira uma silhueta com a cor dela. */
function paintStandIn(g: Phaser.GameObjects.Graphics, id: CreatureId) {
    const tint = COLOR_OF[id]
    g.clear()
    g.fillStyle(C.ink, 1)
    if (id === 'octopus') {
        g.fillCircle(0, -26, 74)
        for (let i = -2; i <= 2; i++) g.fillCircle(i * 34, 44, 20)
        g.fillStyle(tint, 1)
        g.fillCircle(0, -26, 66)
        for (let i = -2; i <= 2; i++) g.fillCircle(i * 34, 44, 15)
    } else if (id === 'fish') {
        g.fillEllipse(-8, 0, 168, 120)
        g.fillTriangle(66, 0, 108, -44, 108, 44)
        g.fillStyle(tint, 1)
        g.fillEllipse(-8, 0, 156, 108)
        g.fillTriangle(64, 0, 100, -36, 100, 36)
    } else {
        g.fillEllipse(0, 0, 176, 118)
        g.fillCircle(-78, 26, 26)
        g.fillCircle(78, 26, 26)
        g.fillStyle(tint, 1)
        g.fillEllipse(0, 0, 164, 106)
        g.fillCircle(-78, 26, 20)
        g.fillCircle(78, 26, 20)
    }
}

function paintRing(g: Phaser.GameObjects.Graphics, glow: number) {
    const r = RING.r
    g.clear()
    // a água atrás do vidro
    g.fillStyle(C.deep, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.water, 1)
    g.fillCircle(0, 0, r - 6)
    g.fillStyle(C.beam, 0.22)
    g.fillTriangle(-r * 0.5, -r, r * 0.05, -r, -r * 0.22, r)
    // o aro de metal
    g.lineStyle(16, C.hullDeep, 1)
    g.strokeCircle(0, 0, r + 8)
    g.lineStyle(9, C.hull, 1)
    g.strokeCircle(0, 0, r + 8)
    // os parafusos
    g.fillStyle(C.hullDeep, 1)
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + Math.PI / 8
        g.fillCircle(Math.cos(a) * (r + 8), Math.sin(a) * (r + 8), 5)
    }
    if (glow > 0) {
        g.lineStyle(7, C.aim, glow)
        g.strokeCircle(0, 0, r + 18)
    }
    // o brilho do vidro, sempre no mesmo canto
    g.fillStyle(C.white, 0.16)
    g.fillEllipse(-r * 0.32, -r * 0.42, r * 0.8, r * 0.44)
}

/**
 * A fita muda de cor com o que a placa carrega.
 *
 * Ciano é PISTA: a informação verdadeira contra a qual a ficha é conferida.
 * Âmbar é NOVIDADE: algo que acabou de acontecer e deixou a ficha velha. São
 * duas coisas diferentes, e a criança do nível 3 precisa ver de relance que
 * aquilo ali não é a mesma placa dos níveis anteriores.
 */
export type PlateTone = 'clue' | 'note'

function paintPlate(g: Phaser.GameObjects.Graphics, tone: PlateTone) {
    const { w, h } = CLUE
    g.clear()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, 20)
    g.fillStyle(C.hullDeep, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 22)
    g.fillStyle(C.paperDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 7, 18)
    // a fita de cima, para a pista parecer um bilhete preso na parede
    g.fillStyle(tone === 'note' ? C.amber : C.aim, 0.9)
    g.fillRoundedRect(-52, -h / 2 - 8, 104, 18, 8)
}

export function createSighting(scene: Phaser.Scene) {
    const ringRoot = scene.add.container(RING.x, RING.y).setDepth(DEPTH.ring)
    const ringG = scene.add.graphics()
    paintRing(ringG, 0)
    ringRoot.add(ringG)

    const holder = scene.add.container(0, 0).setDepth(DEPTH.creature)
    ringRoot.add(holder)

    let art: Phaser.GameObjects.Sprite | Phaser.GameObjects.Graphics | undefined
    let bob: Phaser.Tweens.Tween | undefined

    const plateRoot = scene.add
        .container(CLUE.x + CLUE.w / 2, CLUE.y + CLUE.h / 2)
        .setDepth(DEPTH.clue)
    const plateG = scene.add.graphics()
    paintPlate(plateG, 'clue')
    plateRoot.add(plateG)

    const clueText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: `${CLUE_FONT.base}px`,
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: CLUE.w - 40 },
            lineSpacing: 2,
        })
        .setOrigin(0.5)
        .setResolution(2)
    plateRoot.add(clueText)

    /**
     * ── A PLACA MEDE A FRASE ANTES DE ESCREVÊ-LA ─────────────────────────
     *
     * Com corpo fixo de 38 px, uma frase de quatro linhas mede 174 px numa
     * placa de 144: ela vazava por baixo, por cima da faixa de dica. E não
     * era hipótese — duas das dez frases do jogo faziam isso.
     *
     * Encurtar as duas não resolveria: a validação aceita até 58 caracteres,
     * e a quebra depende de ONDE as palavras cabem, não de quantas letras a
     * frase tem. "Avistei o caranguejo vermelho na caverna." tem 41 e quebra
     * em quatro linhas porque `caranguejo` não divide.
     *
     * Então quem cede é a fonte. A medição roda com o texto COMPLETO e antes
     * da máquina de escrever: durante a digitação a frase só tem menos
     * letras, logo nunca mais linhas do que o que foi medido aqui.
     */
    const fitClue = (text: string) => {
        let size = CLUE_FONT.base
        clueText.setFontSize(size)
        clueText.setText(text)
        while (size > CLUE_FONT.min && clueText.height > CLUE_ROOM) {
            size -= CLUE_FONT.step
            clueText.setFontSize(size)
        }
        clueText.setText('')
    }

    let writer: Typewriter | undefined

    const clearArt = () => {
        bob?.remove()
        bob = undefined
        if (art) {
            scene.tweens.killTweensOf(art)
            art.destroy()
            art = undefined
        }
    }

    return {
        async show(id: CreatureId, sentence: string, tone: PlateTone = 'clue') {
            clearArt()
            const frame = FRAME_OF[id]

            if (scene.textures.exists(SHEET.life)) {
                const origin = lifeOrigin(frame)
                art = scene.add
                    .sprite(0, 0, SHEET.life, frame)
                    .setOrigin(origin.x, origin.y)
                    .setScale(lifeScale(frame, CREATURE_SPAN))
            } else {
                const g = scene.add.graphics()
                paintStandIn(g, id)
                art = g
            }
            holder.add(art)

            // a criatura entra nadando pela borda do aro, não aparece do nada
            art.setAlpha(0)
            holder.setPosition(-RING.r * 1.2, 16)
            paintRing(ringG, 0.9)
            await FX.all(
                FX.to(scene, art, { alpha: 1 }, { duration: 220 }),
                FX.to(scene, holder, { x: 0, y: 0 }, { duration: 520, ease: 'Sine.easeOut' }),
            )
            paintRing(ringG, 0)
            bob = FX.float(scene, holder, { amount: 7, duration: 2600 })

            plateRoot.setScale(0.9).setAlpha(0)
            paintPlate(plateG, tone)
            fitClue(sentence)
            await FX.to(scene, plateRoot, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
            writer?.skip()
            writer = FX.type(scene, clueText, sentence, { delay: 16 })
            await writer
        },

        /**
         * Troca o texto da placa sem mexer na criatura.
         *
         * A segunda novidade do nível 3 chega com o mesmo bicho no aro: quem
         * muda é a nota. Reanimar a entrada da criatura ali daria a entender
         * que começou outra ficha, quando é a MESMA ficha recebendo mais uma
         * notícia.
         */
        async setNote(text: string, tone: PlateTone = 'note') {
            writer?.skip()
            paintPlate(plateG, tone)
            fitClue(text)
            plateRoot.setAlpha(1)
            await FX.impact(scene, plateRoot, 0.08)
            writer = FX.type(scene, clueText, text, { delay: 16 })
            await writer
        },

        /** O aro pisca quando a ficha fecha: a criatura foi registrada. */
        async blink() {
            paintRing(ringG, 1)
            await FX.ping(scene, RING.x, RING.y, C.aim, { radius: RING.r + 26, depth: DEPTH.ring - 1 })
            paintRing(ringG, 0)
        },

        async farewell() {
            if (!art) return
            bob?.remove()
            bob = undefined
            await FX.all(
                FX.to(scene, holder, { x: RING.r * 1.3, y: -12 }, { duration: 460, ease: 'Sine.easeIn' }),
                FX.to(scene, art, { alpha: 0 }, { duration: 420 }),
            )
            clearArt()
        },

        async hideClue() {
            writer?.skip()
            await FX.to(scene, plateRoot, { alpha: 0, scale: 0.92 }, { duration: 200 })
        },

        ringBounds() {
            return { x: RING.x, y: RING.y, w: RING.r * 2 + 46, h: RING.r * 2 + 46 }
        },

        clueBounds() {
            return { x: CLUE.x + CLUE.w / 2, y: CLUE.y + CLUE.h / 2, w: CLUE.w + 30, h: CLUE.h + 30 }
        },

        destroy() {
            writer?.skip()
            clearArt()
            scene.tweens.killTweensOf(ringRoot)
            scene.tweens.killTweensOf(plateRoot)
            ringRoot.destroy(true)
            plateRoot.destroy(true)
        },
    }
}

export type Sighting = ReturnType<typeof createSighting>
