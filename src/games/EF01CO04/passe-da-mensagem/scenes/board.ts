import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, LANGUAGE_CALL, LANGUAGE_COLOR } from '../data/theme'
import {
    ARROW, BOARD, DESK, DEPTH, HELP, LEVEL_PILL, MURAL, NOTE, SEAL,
} from '../data/layout'
import { createItemCard, createLanguageSeal } from './cards'
import { itemOf } from '../data/levels'
import type { ItemId, Language } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O PAINEL DO TOPO — o recado que chegou, e a mesa que ela preenche
 * ══════════════════════════════════════════════════════════════════════
 *
 * Da esquerda para a direita, a tela conta a tarefa inteira sem uma frase:
 *
 *     O RECADO  ──seta──▶  A MESA (vazia)      [selo da linguagem]
 *
 * A seta grande no meio é o que diz "isto vira aquilo". Os quadrados vazios
 * são tracejados e têm um `+`, porque buraco tracejado é o desenho universal
 * de "põe alguma coisa aqui".
 */
export function createBoard(
    scene: Phaser.Scene,
    language: Language,
    wordHint: boolean,
    onSlot: (index: number) => void,
) {
    const parts: Phaser.GameObjects.GameObject[] = []
    const tone = LANGUAGE_COLOR[language]

    const panel = scene.add.graphics().setDepth(DEPTH.panel)
    panel.fillStyle(C.ink, 0.22)
    panel.fillRoundedRect(BOARD.x, BOARD.y + 8, BOARD.w, BOARD.h, BOARD.r)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r)
    panel.fillStyle(C.creamDeep, 1)
    panel.fillRoundedRect(BOARD.x + 6, BOARD.y + 6, BOARD.w - 12, BOARD.h - 12, BOARD.r - 6)
    panel.fillStyle(C.cream, 1)
    panel.fillRoundedRect(BOARD.x + 6, BOARD.y + 6, BOARD.w - 12, BOARD.h - 20, BOARD.r - 6)
    parts.push(panel)

    // ─────────────────────────────────────────── nível e mural

    const pill = scene.add.graphics().setDepth(DEPTH.hud)
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(LEVEL_PILL.x, LEVEL_PILL.y, LEVEL_PILL.w, LEVEL_PILL.h, LEVEL_PILL.h / 2)
    pill.fillStyle(C.blueDark, 1)
    pill.fillRoundedRect(
        LEVEL_PILL.x + 4, LEVEL_PILL.y + 4,
        LEVEL_PILL.w - 8, LEVEL_PILL.h - 8, (LEVEL_PILL.h - 8) / 2,
    )
    pill.fillStyle(C.white, 0.2)
    pill.fillRoundedRect(LEVEL_PILL.x + 14, LEVEL_PILL.y + 8, LEVEL_PILL.w - 28, 7, 4)
    parts.push(pill)

    const levelLabel = scene.add.text(
        LEVEL_PILL.x + LEVEL_PILL.w / 2, LEVEL_PILL.y + LEVEL_PILL.h / 2, 'NÍVEL 1/3',
        { fontFamily: FONT.black, fontSize: '17px', color: CSS.cream },
    ).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(levelLabel)

    /* O mural: uma vaga por recado entregue. É o progresso da fase e a parte
     * da habilidade que fala de informação GUARDADA, na mesma peça. */
    const mural = scene.add.graphics().setDepth(DEPTH.hud)
    parts.push(mural)
    const muralCards = scene.add.container(0, 0).setDepth(DEPTH.hud + 1)
    parts.push(muralCards)

    function paintMural(done: number) {
        mural.clear()
        MURAL.cx.forEach((cx, i) => {
            const half = MURAL.size / 2
            mural.fillStyle(C.ink, i < done ? 1 : 0.28)
            mural.fillRoundedRect(cx - half - 3, MURAL.cy - half - 3, MURAL.size + 6, MURAL.size + 6, 12)
            mural.fillStyle(i < done ? C.ok : C.creamDeep, 1)
            mural.fillRoundedRect(cx - half, MURAL.cy - half, MURAL.size, MURAL.size, 9)
        })
    }
    paintMural(0)

    // ─────────────────────────────────────────── o recado

    const noteLabel = scene.add.text(NOTE.labelX, NOTE.labelY, 'O RECADO', {
        fontFamily: FONT.black, fontSize: '20px', color: CSS.inkSoft,
    }).setOrigin(0, 0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(noteLabel)

    const noteBox = scene.add.container(0, 0).setDepth(DEPTH.hud + 1)
    parts.push(noteBox)
    let notePoints: Array<{ x: number; y: number }> = []

    // ─────────────────────────────────────────── a seta

    const arrow = scene.add.graphics().setDepth(DEPTH.hud)
    arrow.fillStyle(C.ink, 1)
    arrow.fillRoundedRect(ARROW.x - 40, ARROW.y - 13, 58, 26, 8)
    arrow.fillTriangle(ARROW.x + 6, ARROW.y - 34, ARROW.x + 6, ARROW.y + 34, ARROW.x + 46, ARROW.y)
    arrow.fillStyle(C.warn, 1)
    arrow.fillRoundedRect(ARROW.x - 35, ARROW.y - 9, 50, 18, 6)
    arrow.fillTriangle(ARROW.x + 5, ARROW.y - 26, ARROW.x + 5, ARROW.y + 26, ARROW.x + 37, ARROW.y)
    parts.push(arrow)
    FX.float(scene, fx(arrow), { amount: 0, duration: 1 })
    scene.tweens.add({
        targets: arrow, x: 10, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    })

    // ─────────────────────────────────────────── a mesa

    const deskLabel = scene.add.text(DESK.labelX, DESK.labelY, `MANDE ${LANGUAGE_CALL[language]}`, {
        fontFamily: FONT.black, fontSize: '22px', color: CSS.ink,
    }).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(deskLabel)

    const seal = scene.add.container(SEAL.x, SEAL.y).setDepth(DEPTH.hud + 1)
    seal.add(createLanguageSeal(scene, language, SEAL.size))
    parts.push(seal)
    FX.breathe(scene, fx(seal), { grow: 1.05, duration: 1600 })

    interface Slot {
        x: number
        holder: Phaser.GameObjects.Container
        frame: Phaser.GameObjects.Graphics
        card: Phaser.GameObjects.Container | null
        zone: Phaser.GameObjects.Zone
    }

    let slots: Slot[] = []
    let desk: (ItemId | null)[] = []
    let pulsing: Phaser.GameObjects.Container | null = null

    function paintSlot(i: number, state: 'empty' | 'filled' | 'now' | 'wrong') {
        const { frame } = slots[i]
        const half = DESK.size / 2
        frame.clear()

        const ring = state === 'now' ? C.warn : state === 'wrong' ? C.bad : tone.dark
        frame.fillStyle(ring, state === 'empty' ? 0.5 : 1)
        frame.fillRoundedRect(-half - 6, -half - 6, DESK.size + 12, DESK.size + 12, 22)
        frame.fillStyle(state === 'empty' ? C.creamDeep : C.white, 1)
        frame.fillRoundedRect(-half, -half, DESK.size, DESK.size, 17)

        if (state !== 'empty') return
        // o `+` tracejado: o desenho universal de "põe alguma coisa aqui"
        frame.lineStyle(6, C.creamEdge, 1)
        frame.lineBetween(-18, 0, 18, 0)
        frame.lineBetween(0, -18, 0, 18)
    }

    function stopPulse() {
        if (!pulsing) return
        FX.kill(scene, fx(pulsing))
        pulsing.setScale(1)
        pulsing = null
    }

    function repaint(active = -1, wrong = -1) {
        slots.forEach((_, i) => {
            paintSlot(i, i === wrong ? 'wrong' : i === active ? 'now' : desk[i] ? 'filled' : 'empty')
        })
    }

    function clearSlots() {
        stopPulse()
        slots.forEach(slot => {
            FX.kill(scene, fx(slot.holder))
            slot.zone.destroy()
            slot.holder.destroy()
        })
        slots = []
    }

    return {
        setLevel(level: number, total: number) {
            levelLabel.setText(`NÍVEL ${level}/${total}`)
        },

        /** Uma vaga verde por recado entregue neste nível. */
        async store(done: number, item: ItemId) {
            paintMural(done)
            const cx = MURAL.cx[done - 1]
            if (cx === undefined) return
            const card = createItemCard(scene, itemOf(item), 'desenho', MURAL.size - 8, MURAL.size - 8, { bare: true })
            card.setPosition(cx, MURAL.cy).setScale(0)
            muralCards.add(card)
            await FX.to(scene, fx(card), { scale: 1 }, { duration: 280, ease: Ease.back(3) })
        },

        resetMural() {
            muralCards.removeAll(true)
            paintMural(0)
        },

        /** Monta a fase: o recado à esquerda e os quadrados vazios à direita. */
        setPhase(message: ItemId[]) {
            noteBox.removeAll(true)
            clearSlots()
            desk = message.map(() => null)
            notePoints = []

            message.forEach((id, i) => {
                const x = NOTE.from + NOTE.size / 2 + i * (NOTE.size + NOTE.gap)
                const card = createItemCard(scene, itemOf(id), 'desenho', NOTE.size)
                card.setPosition(x, NOTE.cy)
                noteBox.add(card)
                notePoints.push({ x, y: NOTE.cy })
                card.setScale(0)
                void FX.to(scene, fx(card), { scale: 1 },
                    { duration: 260, delay: i * 90, ease: Ease.back(3) })
            })

            const total = message.length * DESK.size + (message.length - 1) * DESK.gap
            const startX = DESK.cx - total / 2 + DESK.size / 2

            slots = message.map((_, i) => {
                const x = startX + i * (DESK.size + DESK.gap)
                const holder = scene.add.container(x, DESK.cy).setDepth(DEPTH.slot)
                const frame = scene.add.graphics()
                holder.add(frame)

                const zone = scene.add
                    .zone(x, DESK.cy, DESK.size + DESK.gap, DESK.size + 18)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                    .setDepth(DEPTH.slot + 4)
                zone.on('pointerdown', () => onSlot(i))

                return { x, holder, frame, card: null, zone }
            })
            repaint()
        },

        desk: () => desk,
        isFull: () => desk.every(Boolean),
        firstEmpty: () => desk.findIndex(item => item === null),
        slotAt: (i: number) => ({ x: slots[i]?.x ?? DESK.cx, y: DESK.cy }),
        noteAt: (i: number) => notePoints[i] ?? { x: NOTE.from, y: NOTE.cy },

        async place(i: number, id: ItemId) {
            const slot = slots[i]
            if (!slot) return
            desk[i] = id
            slot.card?.destroy()
            const card = createItemCard(
                scene, itemOf(id), language, DESK.size - 10, DESK.size - 10, { wordHint },
            )
            card.setScale(0)
            slot.holder.add(card)
            slot.card = card
            repaint()
            await FX.to(scene, fx(card), { scale: 1 }, { duration: 230, ease: Ease.back(3) })
        },

        clear(i: number) {
            const slot = slots[i]
            if (!slot) return
            desk[i] = null
            slot.card?.destroy()
            slot.card = null
            repaint()
            void FX.impact(scene, fx(slot.holder), 0.22)
        },

        /** Acende o quadrado que o colega está lendo agora. */
        setActive(i: number) {
            stopPulse()
            repaint(i)
            const holder = slots[i]?.holder
            if (!holder) return
            pulsing = holder
            FX.breathe(scene, fx(holder), { grow: 1.1, duration: 520 })
        },

        idle() {
            stopPulse()
            repaint()
        },

        /** O quadrado culpado: vermelho, tremor e um piscar. */
        async blame(i: number) {
            stopPulse()
            repaint(-1, i)
            const holder = slots[i]?.holder
            if (!holder) return
            await FX.shake(scene, fx(holder), { amount: 12, times: 4 })
            void FX.to(scene, fx(holder), { alpha: 0.5 }, { duration: 200, yoyo: true, repeat: 2 })
        },

        /** Aponta para o item do recado daquela posição, sem dizer a carta. */
        pointNote(i: number) {
            const p = notePoints[i]
            if (!p) return
            void FX.ping(scene, p.x, p.y, C.warn, { radius: 90, duration: 520 })
            const card = noteBox.list[i] as Phaser.GameObjects.Container | undefined
            if (card) void FX.to(scene, fx(card), { scale: 1.18 }, { duration: 220, yoyo: true, repeat: 2 })
        },

        setEnabled(on: boolean) {
            slots.forEach(slot => {
                if (on) slot.zone.setInteractive({ useHandCursor: true })
                else slot.zone.disableInteractive()
            })
        },

        destroy() {
            clearSlots()
            FX.kill(scene, fx(seal))
            scene.tweens.killTweensOf(arrow)
            noteBox.removeAll(true)
            muralCards.removeAll(true)
            parts.forEach(p => p.destroy())
        },
    }
}

export function createHelpButton(scene: Phaser.Scene, onTap: () => void) {
    const box = scene.add.container(HELP.x, HELP.y).setDepth(DEPTH.hud + 2)
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, HELP.r)
    g.fillStyle(C.blueDark, 1)
    g.fillCircle(0, 0, HELP.r - 5)
    g.fillStyle(C.blue, 1)
    g.fillCircle(0, -4, HELP.r - 9)
    g.fillStyle(C.white, 0.3)
    g.fillEllipse(-HELP.r * 0.26, -HELP.r * 0.42, HELP.r * 0.7, HELP.r * 0.3)
    const mark = scene.add.text(0, 1, '?', {
        fontFamily: FONT.black, fontSize: '34px', color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    mark.setStroke(CSS.ink, 5)
    box.add([g, mark])

    const zone = scene.add
        .zone(HELP.x, HELP.y, HELP.r * 2.6, HELP.r * 2.6)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(DEPTH.hud + 3)
    zone.on('pointerdown', () => {
        void FX.impact(scene, fx(box), 0.22)
        onTap()
    })

    return {
        setEnabled(on: boolean) {
            box.setAlpha(on ? 1 : 0.4)
            if (on) zone.setInteractive({ useHandCursor: true })
            else zone.disableInteractive()
        },
        destroy() {
            zone.destroy()
            box.destroy()
        },
    }
}
