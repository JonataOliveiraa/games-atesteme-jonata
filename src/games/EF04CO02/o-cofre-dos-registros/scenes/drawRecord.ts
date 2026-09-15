import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FIELD_LABEL } from '../data/levels'
import {
    DEPTH,
    FIELD,
    SHEET_BOX,
    SHEET_CX,
    SHEET_CY,
    fieldOffset,
} from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { FieldId, PartialSighting } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A FICHA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A peça jogável inteira é Graphics e Text, como manda o §8 do TEXTURAS.md.
 * Fazer a ficha como imagem e escrever os valores por cima prenderia o texto
 * a linhas inventadas pelo gerador, e a atualização do nível 3 pareceria um
 * remendo colado em cima de um desenho.
 *
 * ── O NOME DO CAMPO NÃO SAI DO LUGAR ─────────────────────────────────────
 *
 * O rótulo fica numa faixa própria, sempre no alto do campo, e não muda de
 * tamanho, cor ou posição quando o valor entra, sai ou é trocado. É a parte
 * que a criança lê para decidir; se ela se mexesse junto com o valor, o
 * registro passaria a parecer uma caixa que muda de nome, que é o oposto da
 * habilidade.
 *
 * ── OS QUATRO ESTADOS ────────────────────────────────────────────────────
 *
 *     empty   tracejado          falta preencher (nível 1)
 *     filled  valor em tinta     já preenchido, neutro (níveis 2 e 3)
 *     chosen  contorno ciano     é este que vai mudar
 *     locked  fecho verde        acabou de ser preenchido ou trocado
 *
 * `filled` é neutro de propósito. Nos níveis 2 e 3 a ficha chega cheia, e
 * pintar os campos de verde ao abrir diria "todos certos" justamente na fase
 * em que um deles não está.
 *
 * ── O CONTAINER MORA NO CENTRO ───────────────────────────────────────────
 *
 * `root` fica no centro da ficha e os campos são deslocamentos a partir dali.
 * Com o container na origem da tela e os campos em coordenadas absolutas, o
 * encolhimento final arrastaria a ficha para o canto superior esquerdo em vez
 * de encolher onde ela está.
 */

type State = 'empty' | 'filled' | 'chosen' | 'locked'

/** Quem pode ser tocado agora. */
export type Reach = 'none' | 'empty' | 'all' | 'chosen'

interface Field {
    id: FieldId
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    value: Phaser.GameObjects.Text
    ghost: Phaser.GameObjects.Text
    strike: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    state: State
    pulse?: Phaser.Tweens.Tween
}

export interface RecordOptions {
    onPick: (field: FieldId) => void
}

const VALUE_Y = 26

function paintPaper(g: Phaser.GameObjects.Graphics) {
    const { w, h } = SHEET_BOX
    g.clear()
    g.fillStyle(C.ink, 0.34)
    g.fillRoundedRect(-w / 2 + 7, -h / 2 + 12, w, h, 22)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 26)
    g.fillStyle(C.paperDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 9, 22)

    // a faixa de cabeçalho da ficha
    g.fillStyle(C.hullDeep, 1)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 14, w - 32, 44, 14)
    g.fillStyle(C.hull, 1)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 14, w - 32, 38, 14)

    // dois furos de fichário: dizem "isto é um registro arquivável"
    g.fillStyle(C.paperEdge, 1)
    g.fillCircle(-w / 2 + 34, h / 2 - 34, 9)
    g.fillCircle(w / 2 - 34, h / 2 - 34, 9)
}

function paintField(g: Phaser.GameObjects.Graphics, state: State, warn: boolean) {
    const { w, h } = FIELD
    g.clear()

    const edge = warn
        ? C.amber
        : state === 'locked'
          ? C.green
          : state === 'chosen'
            ? C.aim
            : C.paperEdge
    const thick = state === 'chosen' || warn ? 8 : 4

    g.fillStyle(edge, 1)
    g.fillRoundedRect(-w / 2 - thick, -h / 2 - thick, w + thick * 2, h + thick * 2, 18)
    g.fillStyle(state === 'locked' || state === 'chosen' ? C.paper : C.paperDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)

    // a faixa do NOME, sempre igual em todos os estados
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, 46, 14)
    g.fillRect(-w / 2, -h / 2 + 30, w, 16)

    if (state === 'empty') {
        // o tracejado de "falta preencher"
        g.lineStyle(5, C.paperEdge, 1)
        for (let x = -w / 2 + 26; x < w / 2 - 34; x += 30) {
            g.beginPath()
            g.moveTo(x, h / 2 - 34)
            g.lineTo(x + 18, h / 2 - 34)
            g.strokePath()
        }
        return
    }

    if (state !== 'locked') return

    // o fecho que acende quando o campo trava
    g.fillStyle(C.greenDeep, 1)
    g.fillCircle(w / 2 - 32, h / 2 - 30, 16)
    g.fillStyle(C.green, 1)
    g.fillCircle(w / 2 - 32, h / 2 - 30, 13)
    g.lineStyle(4, C.white, 1)
    g.beginPath()
    g.moveTo(w / 2 - 38, h / 2 - 30)
    g.lineTo(w / 2 - 34, h / 2 - 25)
    g.lineTo(w / 2 - 25, h / 2 - 36)
    g.strokePath()
}

export function createRecord(scene: Phaser.Scene, options: RecordOptions) {
    const root = scene.add.container(SHEET_CX, SHEET_CY).setDepth(DEPTH.sheet)

    const paper = scene.add.graphics()
    paintPaper(paper)
    root.add(paper)

    const heading = scene.add
        .text(0, -SHEET_BOX.h / 2 + 33, 'FICHA DE AVISTAMENTO', {
            fontFamily: FONT.black,
            fontSize: '25px',
            color: CSS.white,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    heading.setStroke(CSS.ink, 4)
    root.add(heading)

    let fields: Field[] = []
    let reach: Reach = 'none'
    let chosen: FieldId | null = null

    const find = (id: FieldId) => fields.find(f => f.id === id)

    const fit = (text: Phaser.GameObjects.Text, room: number) => {
        text.setScale(1)
        if (text.width > room) text.setScale(room / text.width)
    }

    const applyReach = () => {
        fields.forEach(f => {
            if (!f.zone.input) return
            f.zone.input.enabled =
                reach === 'all'
                    ? f.state !== 'locked'
                    : reach === 'empty'
                      ? f.state === 'empty'
                      : reach === 'chosen'
                        ? f.id === chosen
                        : false
        })
    }

    const clearFields = () => {
        fields.forEach(f => {
            f.pulse?.remove()
            scene.tweens.killTweensOf(f.body)
            f.zone.destroy()
            f.body.destroy(true)
        })
        fields = []
        chosen = null
    }

    return {
        async show(fieldIds: FieldId[], initial: PartialSighting) {
            clearFields()

            fields = fieldIds.map((id, slot) => {
                const at = fieldOffset(slot)
                const body = scene.add.container(at.x, at.y)

                const filled = initial[id]
                const state: State = filled ? 'filled' : 'empty'
                const face = scene.add.graphics()
                paintField(face, state, false)
                body.add(face)

                const label = scene.add
                    .text(0, -FIELD.h / 2 + 23, FIELD_LABEL[id], {
                        fontFamily: FONT.black,
                        fontSize: '27px',
                        color: CSS.white,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                body.add(label)

                const ghost = scene.add
                    .text(0, VALUE_Y, '', {
                        fontFamily: FONT.black,
                        fontSize: '40px',
                        color: CSS.inkSoft,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setAlpha(0)
                body.add(ghost)

                const strike = scene.add.graphics().setAlpha(0)
                body.add(strike)

                const value = scene.add
                    .text(0, VALUE_Y, filled ?? '', {
                        fontFamily: FONT.black,
                        fontSize: '40px',
                        color: CSS.ink,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                body.add(value)
                fit(value, FIELD.w - 48)

                // zona INTERNA: a ficha inteira encolhe e voa para a cápsula
                // no fim da fase, e uma zona solta ficaria parada no ar
                const zone = scene.add
                    .zone(0, 0, FIELD.w + 10, FIELD.h + 10)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (reach !== 'none') options.onPick(id)
                })
                body.add(zone)

                root.add(body)
                return { id, body, face, value, ghost, strike, zone, state }
            })
            applyReach()

            root.setScale(0.9).setAlpha(0)
            await FX.to(scene, root, { scale: 1, alpha: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        /** Onde a etiqueta precisa pousar, em coordenadas de tela. */
        slotWorld(id: FieldId) {
            const field = find(id)
            if (!field) return { x: SHEET_CX, y: SHEET_CY }
            return { x: SHEET_CX + field.body.x, y: SHEET_CY + field.body.y + VALUE_Y }
        },

        valueAt(id: FieldId) {
            return find(id)?.value.text ?? ''
        },

        /** Marca o campo que vai mudar. `null` desmarca. */
        choose(id: FieldId | null) {
            chosen = id
            fields.forEach(f => {
                if (f.state === 'locked') return
                const next: State = f.id === id ? 'chosen' : f.value.text ? 'filled' : 'empty'
                if (next === f.state) return
                f.state = next
                paintField(f.face, next, false)
            })
            applyReach()
        },

        chosen() {
            return chosen
        },

        /** O valor entra num campo vazio e trava. Só isso muda; o nome fica. */
        async place(id: FieldId, text: string) {
            const field = find(id)
            if (!field) return
            field.pulse?.remove()
            field.state = 'locked'
            chosen = null
            paintField(field.face, 'locked', false)
            field.value.setText(text).setAlpha(0)
            fit(field.value, FIELD.w - 48)
            const base = field.value.scale
            field.value.setScale(base * 0.6)
            await FX.all(
                FX.to(scene, field.value, { scale: base, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' }),
                FX.impact(scene, field.body, 0.1),
            )
            applyReach()
        },

        /**
         * A troca de valor dos níveis 2 e 3, com o ANTES visível.
         *
         * O §12 pede o campo antigo e o novo lado a lado por 1,5 s. Sem isso a
         * manipulação some: o valor simplesmente vira outro, e a criança perde
         * a única prova na tela de que foi ELA que mudou aquele campo — e só
         * aquele.
         */
        async replace(id: FieldId, text: string) {
            const field = find(id)
            if (!field) return
            field.pulse?.remove()
            const old = field.value.text

            // o valor antigo sobe, apaga e ganha um risco
            field.ghost.setText(old).setAlpha(1).setPosition(0, VALUE_Y).setScale(field.value.scale)
            field.value.setAlpha(0)
            await FX.to(scene, field.ghost, { y: VALUE_Y - 22, scale: field.ghost.scale * 0.68 }, {
                duration: 240,
                ease: 'Sine.easeOut',
            })
            if (!field.body.active) return
            const half = field.ghost.displayWidth / 2 + 6
            field.strike.clear()
            field.strike.lineStyle(4, C.inkSoft, 1)
            field.strike.beginPath()
            field.strike.moveTo(-half, VALUE_Y - 22)
            field.strike.lineTo(half, VALUE_Y - 22)
            field.strike.strokePath()
            field.strike.setAlpha(1)

            // e o novo entra por baixo dele
            field.state = 'locked'
            chosen = null
            paintField(field.face, 'locked', false)
            field.value.setText(text).setPosition(0, VALUE_Y + 26).setAlpha(0)
            fit(field.value, FIELD.w - 48)
            await FX.all(
                FX.to(scene, field.value, { alpha: 1 }, { duration: 220 }),
                FX.impact(scene, field.body, 0.1),
            )
            if (!field.body.active) return

            await FX.wait(scene, 1500)
            if (!field.body.active) return

            await FX.all(
                FX.to(scene, field.ghost, { alpha: 0 }, { duration: 260 }),
                FX.to(scene, field.strike, { alpha: 0 }, { duration: 260 }),
                FX.to(scene, field.value, { y: VALUE_Y }, { duration: 300, ease: 'Sine.easeOut' }),
            )
            applyReach()
        },

        /** O campo recusa: borda âmbar, tremida e volta ao normal. */
        async refuse(id: FieldId) {
            const field = find(id)
            if (!field) return
            paintField(field.face, field.state, true)
            await FX.shake(scene, field.body, { amount: 9, times: 3 })
            if (!field.body.active) return
            await FX.wait(scene, 520)
            if (!field.body.active) return
            paintField(field.face, field.state, false)
        },

        /** Marca o campo certo — só depois de duas tentativas, como o §10 pede. */
        pulse(id: FieldId) {
            const field = find(id)
            if (!field || field.pulse) return
            field.pulse = scene.tweens.add({
                targets: field.body,
                scale: 1.05,
                duration: FX.ms(scene, 560),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        clearPulses() {
            fields.forEach(f => {
                f.pulse?.remove()
                f.pulse = undefined
                f.body.setScale(1)
            })
        },

        /** Todos os campos estão preenchidos? É o fim da ficha do nível 1. */
        complete() {
            return fields.length > 0 && fields.every(f => f.state !== 'empty')
        },

        /** A ficha pronta encolhe e entra na cápsula. */
        async deliver(to: { x: number; y: number }) {
            this.clearPulses()
            await FX.to(scene, root, { y: SHEET_CY - 18 }, { duration: 220, ease: 'Sine.easeOut' })
            await FX.to(
                scene,
                root,
                { x: to.x, y: to.y, scale: 0.12, alpha: 0.2 },
                { duration: 640, ease: 'Back.easeIn' },
            )
            root.setPosition(SHEET_CX, SHEET_CY).setScale(1).setAlpha(0)
            clearFields()
        },

        setReach(value: Reach) {
            reach = value
            applyReach()
        },

        bounds() {
            return { x: SHEET_CX, y: SHEET_CY, w: SHEET_BOX.w + 40, h: SHEET_BOX.h + 40 }
        },

        fieldBounds(id: FieldId) {
            const field = find(id)
            const at = field ? { x: field.body.x, y: field.body.y } : { x: 0, y: 0 }
            return {
                x: SHEET_CX + at.x,
                y: SHEET_CY + at.y,
                w: FIELD.w + 26,
                h: FIELD.h + 26,
            }
        },

        destroy() {
            clearFields()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type RecordSheet = ReturnType<typeof createRecord>
