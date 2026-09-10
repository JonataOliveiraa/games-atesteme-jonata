import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ALTAR, BACK, BAG, BAGROW, DEPTH, FICHA } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { createWordArt } from './word'
import type { Datum, DatumId } from '../types'

type FichaState = 'bag' | 'slot' | 'locked' | 'dim'

interface Ficha {
    datum: Datum
    root: Phaser.GameObjects.Container
    paint: (border: number, face: number) => void
    ring: Phaser.GameObjects.Graphics
    home: { x: number; y: number }
    state: FichaState
}

export interface AltarOptions {
    onFicha: (id: DatumId) => void
    onJoin: () => void
    /** Nível 3: a criança percebe que falta dado e volta para a caverna. */
    onBack: () => void
}

/**
 * O altar não completa frases: os encaixes dizem apenas QUANTOS dados a porta
 * precisa. Sem rótulo, sem silhueta e sem ordem — a criança escolhe um
 * conjunto, e JUNTAR é o momento em que ela afirma que ele já conta algo.
 */
export function createAltar(scene: Phaser.Scene, options: AltarOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.altar)

    const slab = scene.add.graphics()
    const slotsG = scene.add.graphics()
    const wires = scene.add.graphics()
    root.add([slab, slotsG, wires])

    const paintSlab = () => {
        const { x, y, w, h } = ALTAR.slab
        slab.clear()
        slab.fillStyle(C.ink, 0.35)
        slab.fillRoundedRect(x - w / 2 + 6, y - h / 2 + 12, w, h, 30)
        slab.fillStyle(C.stoneDark, 1)
        slab.fillRoundedRect(x - w / 2, y - h / 2, w, h, 30)
        slab.fillStyle(C.stone, 1)
        slab.fillRoundedRect(x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 20, 24)
        slab.fillStyle(C.white, 0.16)
        slab.fillRoundedRect(x - w / 2 + 22, y - h / 2 + 18, w - 44, 18, 9)
    }
    paintSlab()

    // ── botão JUNTAR ───────────────────────────────────────────────────────
    const join = scene.add.container(ALTAR.join.x, ALTAR.join.y).setDepth(DEPTH.altar + 2)
    const joinG = scene.add.graphics()
    const joinLabel = scene.add
        .text(26, 0, 'JUNTAR', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    join.add([joinG, joinLabel])

    let joinOn = false

    /** Duas peças que se encaixam: o símbolo do que o botão faz. */
    const paintJoin = () => {
        const { w, h } = ALTAR.join
        const face = joinOn ? C.select : C.panelDeep
        const border = joinOn ? C.selectDark : C.stoneDark
        joinG.clear()
        joinG.fillStyle(C.ink, 0.3)
        joinG.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 22)
        joinG.fillStyle(border, 1)
        joinG.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        joinG.fillStyle(face, 1)
        joinG.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 16, 17)
        joinG.fillStyle(C.white, 0.35)
        joinG.fillRoundedRect(-w / 2 + 18, -h / 2 + 13, w - 36, 12, 6)

        const glyph = joinOn ? C.white : C.stoneDark
        joinG.fillStyle(glyph, 1)
        joinG.fillRoundedRect(-w / 2 + 16, -16, 28, 32, 8)
        joinG.fillRoundedRect(-w / 2 + 52, -16, 28, 32, 8)
        joinG.fillRect(-w / 2 + 42, -7, 12, 14)
        joinLabel.setColor(joinOn ? CSS.white : CSS.inkSoft)
    }
    paintJoin()

    const joinZone = scene.add
        .zone(ALTAR.join.x, ALTAR.join.y, ALTAR.joinHitW, ALTAR.joinHitH)
        .setOrigin(0.5)
        .setDepth(DEPTH.altar + 3)
        .setInteractive({ useHandCursor: true })
    joinZone.on('pointerdown', () => {
        if (!joinOn) return
        void FX.press(scene, join)
        options.onJoin()
    })

    // ── VOLTAR ─────────────────────────────────────────────────────────────
    const back = scene.add.container(BACK.x, BACK.y).setDepth(DEPTH.altar + 2).setAlpha(0)
    const backG = scene.add.graphics()
    backG.fillStyle(C.ink, 0.3)
    backG.fillRoundedRect(-BACK.w / 2 + 4, -BACK.h / 2 + 7, BACK.w, BACK.h, 20)
    backG.fillStyle(C.warnDark, 1)
    backG.fillRoundedRect(-BACK.w / 2, -BACK.h / 2, BACK.w, BACK.h, 20)
    backG.fillStyle(C.warn, 1)
    backG.fillRoundedRect(-BACK.w / 2 + 6, -BACK.h / 2 + 6, BACK.w - 12, BACK.h - 16, 15)
    backG.fillStyle(C.white, 0.35)
    backG.fillRoundedRect(-BACK.w / 2 + 16, -BACK.h / 2 + 12, BACK.w - 32, 10, 5)
    backG.fillStyle(C.white, 1)
    backG.fillTriangle(-70, 0, -50, -14, -50, 14)
    backG.fillRect(-52, -6, 20, 12)

    const backLabel = scene.add
        .text(28, 0, 'VOLTAR', {
            fontFamily: FONT.black,
            fontSize: '21px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    back.add([backG, backLabel])

    const backZone = scene.add
        .zone(BACK.x, BACK.y, BACK.hitW, BACK.hitH)
        .setOrigin(0.5)
        .setDepth(DEPTH.altar + 3)
        .setInteractive({ useHandCursor: true })
    if (backZone.input) backZone.input.enabled = false
    backZone.on('pointerdown', () => {
        void FX.press(scene, back)
        options.onBack()
    })

    // ── encaixes ───────────────────────────────────────────────────────────
    let slots = 3
    let occupied: (DatumId | null)[] = []
    let pulse = 0

    const slotX = (index: number) => ALTAR.slab.x + (index - (slots - 1) / 2) * ALTAR.slotGap

    const paintSlots = () => {
        slotsG.clear()
        for (let i = 0; i < slots; i++) {
            const x = slotX(i)
            const y = ALTAR.slotY
            const w = ALTAR.slotW
            const h = ALTAR.slotH
            const free = !occupied[i]
            slotsG.fillStyle(C.shadow, free ? 0.45 : 0.2)
            slotsG.fillRoundedRect(x - w / 2, y - h / 2, w, h, 18)
            slotsG.lineStyle(free ? 5 : 4, C.select, free ? 0.35 + pulse * 0.5 : 0.85)
            slotsG.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 18)
        }
    }

    const paintWires = () => {
        wires.clear()
        const taken: number[] = []
        occupied.forEach((id, i) => {
            if (id) taken.push(i)
        })
        if (taken.length < 2) return
        // O fio nasce sob as fichas e só aparece no vão entre duas: é a
        // relação ficando visível, não um enfeite ao redor do encaixe.
        wires.lineStyle(11, C.crystalLit, 0.95)
        for (let i = 0; i < taken.length - 1; i++) {
            const from = slotX(taken[i]) + FICHA.w / 2 - 20
            const to = slotX(taken[i + 1]) - FICHA.w / 2 + 20
            wires.lineBetween(from, ALTAR.slotY, to, ALTAR.slotY)
            wires.fillStyle(C.crystalLit, 1)
            wires.fillCircle((from + to) / 2, ALTAR.slotY, 10)
        }
    }

    const breath = scene.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onUpdate: counter => {
            pulse = counter.getValue() ?? 0
            paintSlots()
        },
    })

    // ── fichas ─────────────────────────────────────────────────────────────
    let fichas: Ficha[] = []
    let enabled = false
    let only: DatumId[] | null = null

    const paintFicha = (ficha: Ficha) => {
        const selected = ficha.state === 'slot'
        const locked = ficha.state === 'locked'
        ficha.paint(
            locked ? C.warnDark : selected ? C.selectDark : C.ink,
            locked ? C.warn : C.panel,
        )
        ficha.root.setAlpha(ficha.state === 'dim' ? 0.45 : 1)
    }

    let hitH = FICHA.hitTall

    const buildFicha = (datum: Datum, sheet: string, home: { x: number; y: number }): Ficha => {
        const art = createWordArt(scene, datum, sheet, FICHA)
        const container = art.root.setPosition(home.x, home.y).setDepth(DEPTH.ficha)
        const ring = scene.add.graphics().setAlpha(0)
        container.addAt(ring, 0)

        const zone = scene.add
            .zone(0, 0, FICHA.hitW, hitH)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled) return
            if (only && !only.includes(datum.id)) return
            options.onFicha(datum.id)
        })
        container.add(zone)

        const ficha: Ficha = { datum, root: container, paint: art.paint, ring, home, state: 'bag' }
        paintFicha(ficha)
        return ficha
    }

    const homeOf = (index: number, total: number) => {
        const perRow = total > BAGROW.perRow ? Math.ceil(total / 2) : total
        const row = Math.floor(index / perRow)
        const col = index % perRow
        const inRow = Math.min(perRow, total - row * perRow)
        const rows = Math.ceil(total / perRow)
        return {
            x: BAGROW.cx + (col - (inRow - 1) / 2) * BAGROW.gap,
            y: BAGROW.y + (row - (rows - 1) / 2) * BAGROW.rowGap,
        }
    }

    const find = (id: DatumId) => fichas.find(item => item.datum.id === id)

    const clear = () => {
        fichas.forEach(ficha => {
            scene.tweens.killTweensOf(ficha.root)
            scene.tweens.killTweensOf(ficha.ring)
            ficha.root.destroy(true)
        })
        fichas = []
        occupied = []
        paintWires()
    }

    return {
        async enter(data: Datum[], sheet: string, count: number) {
            clear()
            slots = count
            occupied = new Array(count).fill(null)
            paintSlots()
            paintWires()

            hitH = data.length > BAGROW.perRow ? FICHA.hitH : FICHA.hitTall
            fichas = data.map((datum, i) => buildFicha(datum, sheet, homeOf(i, data.length)))

            // A bancada sobe do chão e as palavras SAEM DA BOLSA, uma a uma:
            // é a mesma peça que caiu da pedra chegando à mesa de decisão.
            root.setAlpha(0)
            join.setAlpha(0).setScale(0.8)
            fichas.forEach(ficha => {
                ficha.root.setPosition(BAG.altar.x, BAG.altar.y).setScale(0.25).setAlpha(0)
            })

            await FX.all(
                FX.to(scene, root, { alpha: 1 }, { duration: 340 }),
                FX.wait(scene, 240).then(() =>
                    FX.to(scene, join, { alpha: 1, scale: 1 }, { duration: 300, ease: 'Back.easeOut' }),
                ),
                ...fichas.map((ficha, i) =>
                    FX.wait(scene, 120 + i * 130).then(async () => {
                        ficha.root.setAlpha(1)
                        await FX.all(
                            FX.arcTo(scene, ficha.root, ficha.home, { height: 110, duration: 420 }),
                            FX.to(scene, ficha.root, { scale: 1 }, { duration: 420, ease: 'Back.easeOut' }),
                        )
                    }),
                ),
            )
        },

        slotPos(index: number) {
            return { x: slotX(index), y: ALTAR.slotY }
        },

        fichaPos(id: DatumId) {
            const ficha = find(id)
            return ficha ? { x: ficha.root.x, y: ficha.root.y } : { x: ALTAR.slab.x, y: ALTAR.slab.y }
        },

        homePos(id: DatumId) {
            const ficha = find(id)
            return ficha ? ficha.home : { x: BAGROW.cx, y: BAGROW.y }
        },

        joinPos() {
            return { x: ALTAR.join.x, y: ALTAR.join.y }
        },

        rowBounds() {
            const rows = fichas.length > BAGROW.perRow ? 2 : 1
            return {
                x: BAGROW.cx,
                y: BAGROW.y,
                w: Math.min(1200, BAGROW.gap * Math.min(fichas.length, BAGROW.perRow) + 40),
                h: rows * FICHA.h + (rows - 1) * (BAGROW.rowGap - FICHA.h) + 48,
            }
        },

        /** A ficha sobe para o primeiro encaixe livre e o fio nasce. */
        async put(id: DatumId) {
            const ficha = find(id)
            if (!ficha) return
            const index = occupied.indexOf(null)
            if (index < 0) return
            occupied[index] = id
            ficha.state = 'slot'
            paintFicha(ficha)
            ficha.root.setDepth(DEPTH.ficha + 1)
            await FX.to(
                scene,
                ficha.root,
                { x: slotX(index), y: ALTAR.slotY },
                { duration: 300, ease: 'Back.easeOut' },
            )
            paintSlots()
            paintWires()
        },

        async take(id: DatumId) {
            const ficha = find(id)
            if (!ficha) return
            const index = occupied.indexOf(id)
            if (index >= 0) occupied[index] = null
            ficha.state = 'bag'
            paintFicha(ficha)
            ficha.root.setDepth(DEPTH.ficha)
            paintSlots()
            paintWires()
            await FX.to(scene, ficha.root, { x: ficha.home.x, y: ficha.home.y }, { duration: 280 })
        },

        slotIndexOf(id: DatumId) {
            return occupied.indexOf(id)
        },

        selectedCount() {
            return occupied.filter(Boolean).length
        },

        setEnabled(value: boolean, restrict?: DatumId[]) {
            enabled = value
            only = restrict ?? null
        },

        /** Fora do modo altar o VOLTAR continua visível, mas não responde. */
        setBackEnabled(value: boolean) {
            if (backZone.input) backZone.input.enabled = value && back.alpha > 0.5
        },

        /** O VOLTAR só aparece quando há dado esperando lá fora. */
        showBack(value: boolean) {
            if (backZone.input) backZone.input.enabled = value
            scene.tweens.killTweensOf(back)
            if (!value) {
                back.setAlpha(0)
                return
            }
            back.setAlpha(0).setScale(0.8)
            void FX.to(scene, back, { alpha: 1, scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        setJoinEnabled(value: boolean) {
            joinOn = value
            paintJoin()
            if (joinZone.input) joinZone.input.enabled = value
        },

        /** O intruso treme, ganha o âmbar e fica sendo o único tocável. */
        async lock(id: DatumId) {
            const target = find(id)
            fichas.forEach(ficha => {
                if (ficha.datum.id === id) return
                ficha.state = ficha.state === 'slot' ? 'slot' : 'bag'
                paintFicha(ficha)
                ficha.root.setAlpha(0.42)
            })
            if (!target) return
            target.state = 'locked'
            paintFicha(target)
            await FX.shake(scene, target.root, { times: 3, amount: 12 })
        },

        unlock() {
            fichas.forEach(ficha => {
                if (ficha.state === 'locked') ficha.state = 'slot'
                paintFicha(ficha)
                ficha.root.setAlpha(1)
            })
        },

        /** Depois de dois erros, o que falta na bolsa respira em azul. */
        hint(ids: DatumId[]) {
            ids.forEach(id => {
                const ficha = find(id)
                if (!ficha) return
                ficha.ring.clear()
                ficha.ring.lineStyle(8, C.select, 1)
                ficha.ring.strokeRoundedRect(
                    -FICHA.w / 2 - 8,
                    -FICHA.h / 2 - 8,
                    FICHA.w + 16,
                    FICHA.h + 16,
                    24,
                )
                ficha.ring.setAlpha(0)
                scene.tweens.add({
                    targets: ficha.ring,
                    alpha: 1,
                    duration: 620,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            })
        },

        /** As fichas do altar convergem para a faixa e deixam de ser peças. */
        async fuse(to: { x: number; y: number }) {
            const chosen = occupied.filter(Boolean).map(id => find(id!)).filter(Boolean) as Ficha[]
            wires.clear()
            void FX.sparks(scene, to.x, to.y, { color: C.crystalLit, count: 26, spread: 240 })
            await FX.all(
                ...chosen.map(ficha =>
                    FX.to(
                        scene,
                        ficha.root,
                        { x: to.x, y: to.y, scale: 0.2, alpha: 0 },
                        { duration: 520, ease: 'Sine.easeIn' },
                    ),
                ),
            )
            chosen.forEach(ficha => ficha.root.setVisible(false))
        },

        /** Fumacinha curta onde a fusão quebrou. */
        smoke(x: number, y: number) {
            for (let i = 0; i < 7; i++) {
                const puff = scene.add.graphics().setDepth(DEPTH.fx)
                puff.fillStyle(C.stone, 0.55)
                puff.fillCircle(0, 0, Phaser.Math.Between(12, 22))
                puff.setPosition(x + Phaser.Math.Between(-50, 50), y + Phaser.Math.Between(-14, 14))
                scene.tweens.add({
                    targets: puff,
                    y: puff.y - Phaser.Math.Between(40, 90),
                    alpha: 0,
                    scale: 1.6,
                    duration: Phaser.Math.Between(420, 720),
                    onComplete: () => puff.destroy(),
                })
            }
        },

        /** A bancada sai de cena para a porta ter a tela só para ela. */
        leave() {
            if (backZone.input) backZone.input.enabled = false
            void FX.to(scene, back, { alpha: 0 }, { duration: 300 })
            void FX.to(scene, root, { alpha: 0 }, { duration: 420 })
            void FX.to(scene, join, { alpha: 0, scale: 0.85 }, { duration: 320 })
            fichas
                .filter(ficha => ficha.root.visible && ficha.root.alpha > 0)
                .forEach((ficha, i) =>
                    FX.to(scene, ficha.root, { alpha: 0, y: ficha.root.y + 30 }, {
                        duration: 340,
                        delay: i * 60,
                    }),
                )
        },

        clear,

        hide() {
            root.setAlpha(0)
            join.setAlpha(0)
            back.setAlpha(0)
            if (backZone.input) backZone.input.enabled = false
        },

        destroy() {
            breath.stop()
            clear()
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(join)
            joinZone.destroy()
            backZone.destroy()
            back.destroy(true)
            join.destroy(true)
            root.destroy(true)
        },
    }
}

export type Altar = ReturnType<typeof createAltar>
