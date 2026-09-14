import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DANCE, DEPTH, TRAY } from '../data/layout'
import { C, CSS, FONT, MOVE_NAME, SIGNAL_NAME } from '../data/theme'
import { drawMove } from './pictogram'
import type { SlotValue } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A BANDEJA MOSTRA AS OPÇÕES DO ESPAÇO ATIVO, E SÓ DELE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O §5 é explícito: os cartões não ficam todos na tela ao mesmo tempo. Tocar
 * num espaço troca a bandeja pelas até três escolhas DAQUELE espaço. É o que
 * mantém o alvo grande — três cartões de 302 px em vez de nove de 100 — e o
 * que deixa claro que a escolha pertence a um lugar da ficha.
 *
 * Todos os cartões têm a mesma cara. Um cartão mais claro, maior ou destacado
 * viraria dica involuntária.
 *
 * ── A LINHA DE CIMA É A VOZ DO JOGO ──────────────────────────────────────
 *
 * Enquanto a criança monta, ela diz o que escolher. Depois de DANÇAR, ela diz
 * o que houve. Uma faixa só, sempre no mesmo lugar: painel que nasce e morre
 * a cada passo tira o endereço das coisas.
 */

const CARD = { w: 302, h: 128, gap: 20 }
const LINE_Y = TRAY.y + 22
const CARD_Y = TRAY.y + 106

export interface OptionsHandlers {
    onPick: (value: SlotValue, index: number) => void
    onDance: () => void
}

interface Card {
    value: SlotValue
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    pulse?: Phaser.Tweens.Tween
}

function paintCard(g: Phaser.GameObjects.Graphics, pressed: boolean) {
    const { w, h } = CARD
    const dy = pressed ? 5 : 0
    g.clear()
    g.fillStyle(C.ink, 0.26)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 10 + dy, w, h, 22)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, 24)
    g.fillStyle(C.sheetDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 20)
    g.fillStyle(C.sheet, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h - 9, 20)
    g.fillStyle(C.white, 0.7)
    g.fillRoundedRect(-w / 2 + 18, -h / 2 + 12 + dy, w - 36, 11, 6)
}

function paintDance(g: Phaser.GameObjects.Graphics, on: boolean, pressed: boolean) {
    const { x, y, w, h } = DANCE
    const dy = pressed ? 6 : 0
    const face = on ? C.good : C.inkSoft
    const deep = on ? C.goodDeep : C.wall
    g.clear()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(x + 5, y + 11 + dy, w, h, 30)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(x - 5, y - 5 + dy, w + 10, h + 10, 34)
    g.fillStyle(deep, 1)
    g.fillRoundedRect(x, y + dy, w, h, 28)
    g.fillStyle(face, 1)
    g.fillRoundedRect(x, y + dy, w, h - 11, 28)
    g.fillStyle(C.white, on ? 0.26 : 0.12)
    g.fillRoundedRect(x + 22, y + 14 + dy, w - 44, 14, 7)

    // o triângulo de tocar, que diz "isto executa" sem palavra em inglês
    const cx = x + w / 2
    const cy = y + h / 2 + 28 + dy
    g.fillStyle(C.ink, on ? 1 : 0.45)
    g.beginPath()
    g.moveTo(cx - 15, cy - 17)
    g.lineTo(cx + 19, cy)
    g.lineTo(cx - 15, cy + 17)
    g.closePath()
    g.fillPath()
}

export function createOptions(scene: Phaser.Scene, handlers: OptionsHandlers) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.tray)

    const bed = scene.add.graphics()
    bed.fillStyle(C.ink, 0.22)
    bed.fillRoundedRect(TRAY.x, TRAY.y + 6, TRAY.w, TRAY.h, 26)
    bed.fillStyle(C.curtain, 0.92)
    bed.fillRoundedRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 24)
    root.add(bed)

    const line = scene.add
        .text(TRAY.x + TRAY.w / 2, LINE_Y, '', {
            fontFamily: FONT.body,
            fontStyle: 'bold',
            fontSize: '26px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: TRAY.w - 60 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(line)

    const danceG = scene.add.graphics()
    paintDance(danceG, false, false)
    root.add(danceG)

    const danceText = scene.add
        .text(DANCE.x + DANCE.w / 2, DANCE.y + 52, 'DANÇAR', {
            fontFamily: FONT.black,
            fontSize: '38px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    danceText.setStroke(CSS.ink, 6)
    root.add(danceText)

    const danceZone = scene.add
        .zone(DANCE.x + DANCE.w / 2, DANCE.y + DANCE.h / 2, DANCE.w + 26, DANCE.h + 26)
        .setOrigin(0.5)
        .setDepth(DEPTH.tray + 2)
        .setInteractive({ useHandCursor: true })

    let cards: Card[] = []
    let danceOn = false

    danceZone.on('pointerdown', () => {
        if (!danceOn) return
        paintDance(danceG, true, true)
        danceText.setY(DANCE.y + 58)
        void FX.wait(scene, 130).then(() => {
            if (!danceG.active) return
            paintDance(danceG, danceOn, false)
            danceText.setY(DANCE.y + 52)
        })
        handlers.onDance()
    })

    const clearCards = () => {
        cards.forEach(card => {
            card.pulse?.remove()
            scene.tweens.killTweensOf(card.body)
            card.zone.destroy()
            card.body.destroy(true)
        })
        cards = []
    }

    const fillCard = (body: Phaser.GameObjects.Container, value: SlotValue) => {
        if (value.kind === 'move') {
            const icon = scene.add.graphics().setPosition(-88, -2)
            drawMove(icon, value.move, 84, C.ink, C.inkSoft)
            body.add(icon)
            const name = scene.add
                .text(22, 0, MOVE_NAME[value.move], {
                    fontFamily: FONT.black,
                    fontSize: '44px',
                    color: CSS.ink,
                })
                .setOrigin(0.5)
                .setResolution(2)
            body.add(name)
            return
        }
        if (value.kind === 'times') {
            const n = scene.add
                .text(-56, -2, String(value.times), {
                    fontFamily: FONT.black,
                    fontSize: '72px',
                    color: CSS.ink,
                })
                .setOrigin(0.5)
                .setResolution(2)
            body.add(n)
            const vezes = scene.add
                .text(-6, 2, 'VEZES', { fontFamily: FONT.black, fontSize: '40px', color: CSS.ink })
                .setOrigin(0, 0.5)
                .setResolution(2)
            body.add(vezes)
            return
        }
        const t = scene.add
            .text(0, 0, SIGNAL_NAME[value.signal], {
                fontFamily: FONT.black,
                fontSize: '36px',
                color: CSS.ink,
                align: 'center',
                wordWrap: { width: CARD.w - 40 },
            })
            .setOrigin(0.5)
            .setResolution(2)
        body.add(t)
    }

    return {
        /** Troca a bandeja pelas opções do espaço que acabou de ser tocado. */
        async show(values: SlotValue[]) {
            clearCards()
            const list = values.slice(0, 3)
            const total = list.length * CARD.w + (list.length - 1) * CARD.gap
            const left = TRAY.x + (TRAY.w - total) / 2

            cards = list.map((value, i) => {
                const x = left + i * (CARD.w + CARD.gap) + CARD.w / 2
                const body = scene.add.container(x, CARD_Y)
                const face = scene.add.graphics()
                paintCard(face, false)
                body.add(face)
                fillCard(body, value)
                root.add(body)

                const zone = scene.add
                    .zone(x, CARD_Y, CARD.w + 16, CARD.h + 16)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.tray + 2)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (!zone.input?.enabled) return
                    paintCard(face, true)
                    void FX.wait(scene, 140).then(() => {
                        if (body.active) paintCard(face, false)
                    })
                    handlers.onPick(value, i)
                })

                return { value, body, face, zone }
            })

            cards.forEach(card => card.body.setScale(0.75).setAlpha(0))
            await FX.all(
                ...cards.map((card, i) =>
                    FX.wait(scene, i * 70).then(() =>
                        FX.to(scene, card.body, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' }),
                    ),
                ),
            )
        },

        async hide() {
            if (!cards.length) return
            await FX.all(...cards.map(card => FX.to(scene, card.body, { alpha: 0, scale: 0.8 }, { duration: 180 })))
            clearCards()
        },

        /** A ajuda do §9: a opção certa pulsa depois de duas tentativas. */
        pulseValue(match: (value: SlotValue) => boolean) {
            const card = cards.find(c => match(c.value))
            if (!card) return
            card.pulse?.remove()
            card.pulse = scene.tweens.add({
                targets: card.body,
                scale: 1.06,
                duration: FX.ms(scene, 560),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        say(text: string) {
            line.setText(text)
            scene.tweens.killTweensOf(line)
            line.setAlpha(0)
            return FX.to(scene, line, { alpha: 1 }, { duration: 200 })
        },

        /** DANÇAR só acende com a ficha inteira preenchida — §4. */
        setDance(on: boolean) {
            danceOn = on
            paintDance(danceG, on, false)
            danceText.setAlpha(on ? 1 : 0.55)
            if (danceZone.input) danceZone.input.enabled = on
            if (!on) return
            scene.tweens.killTweensOf(danceText)
            danceText.setScale(0.9)
            void FX.to(scene, danceText, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        setEnabled(value: boolean) {
            cards.forEach(card => {
                if (card.zone.input) card.zone.input.enabled = value
            })
            if (danceZone.input) danceZone.input.enabled = value && danceOn
        },

        bounds() {
            return { x: TRAY.x + TRAY.w / 2, y: TRAY.y + TRAY.h / 2, w: TRAY.w + 26, h: TRAY.h + 26 }
        },

        danceBounds() {
            return { x: DANCE.x + DANCE.w / 2, y: DANCE.y + DANCE.h / 2, w: DANCE.w + 40, h: DANCE.h + 40 }
        },

        destroy() {
            clearCards()
            scene.tweens.killTweensOf([root, line, danceText])
            danceZone.destroy()
            root.destroy(true)
        },
    }
}

export type Options = ReturnType<typeof createOptions>
