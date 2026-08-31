import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { DEPTH, HELP, MINI, PANEL, PIPS, TITLE, W } from '../data/layout'
import { createFigure } from './figures'
import type { RoutineDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * A partitura da rotina. É ela que transforma o jogo em "seguir uma
 * sequência": sem a fileira no topo, bater no tambor viraria adivinhação.
 *
 * Tudo mora DENTRO de um painel com moldura, inclusive o nome da rotina —
 * texto solto por cima do cenário não parecia parte do jogo, parecia legenda
 * esquecida.
 */
export function createSequence(
    scene: Phaser.Scene,
    routine: RoutineDef,
    phaseIndex: number,
    phaseCount: number,
) {
    const parts: Phaser.GameObjects.GameObject[] = []

    const panel = scene.add.graphics().setDepth(DEPTH.panel)
    panel.fillStyle(C.ink, 0.22)
    panel.fillRoundedRect(PANEL.x, PANEL.y + 8, PANEL.w, PANEL.h, PANEL.r)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
    panel.fillStyle(C.creamDeep, 1)
    panel.fillRoundedRect(PANEL.x + 6, PANEL.y + 6, PANEL.w - 12, PANEL.h - 12, PANEL.r - 6)
    panel.fillStyle(C.cream, 1)
    panel.fillRoundedRect(PANEL.x + 6, PANEL.y + 6, PANEL.w - 12, PANEL.h - 20, PANEL.r - 6)
    parts.push(panel)

    const title = scene.add.graphics().setDepth(DEPTH.hud)
    title.fillStyle(C.ink, 1)
    title.fillRoundedRect(TITLE.x, TITLE.y - TITLE.h / 2, TITLE.w, TITLE.h, TITLE.r)
    title.fillStyle(C.coralDark, 1)
    title.fillRoundedRect(TITLE.x + 5, TITLE.y - TITLE.h / 2 + 5, TITLE.w - 10, TITLE.h - 10, TITLE.r - 5)
    title.fillStyle(C.coral, 1)
    title.fillRoundedRect(TITLE.x + 5, TITLE.y - TITLE.h / 2 + 5, TITLE.w - 10, TITLE.h - 18, TITLE.r - 5)
    title.fillStyle(C.white, 0.3)
    title.fillRoundedRect(TITLE.x + 18, TITLE.y - TITLE.h / 2 + 14, TITLE.w - 36, 12, 6)
    parts.push(title)

    const name = scene.add.text(TITLE.x + TITLE.w / 2, TITLE.y - 3, routine.name, {
        fontFamily: FONT.black,
        fontSize: SIZE.routine,
        color: CSS.cream,
        align: 'center',
        wordWrap: { width: TITLE.w - 34 },
        lineSpacing: 0,
    }).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    name.setStroke(CSS.ink, 5)

    // a fita tem tamanho fixo e os nomes das rotinas não: encolhe até caber,
    // porque letra vazando de dentro do quadro é o que mais faz a tela parecer
    // solta
    for (let px = parseInt(SIZE.routine, 10); px > 15; px -= 1) {
        name.setFontSize(`${px}px`)
        if (name.width <= TITLE.w - 34 && name.height <= TITLE.h - 26) break
    }
    parts.push(name)

    // as três fases do nível, em bolinhas: a criança vê quanto falta sem ler
    const pips = scene.add.graphics().setDepth(DEPTH.hud + 1)
    const spread = (phaseCount - 1) * PIPS.gap
    for (let i = 0; i < phaseCount; i++) {
        const x = PIPS.cx - spread / 2 + i * PIPS.gap
        pips.fillStyle(C.ink, 0.55)
        pips.fillCircle(x, PIPS.y + 2, PIPS.r + 2)
        pips.fillStyle(i < phaseIndex ? C.ok : i === phaseIndex ? C.warn : C.cream, 1)
        pips.fillCircle(x, PIPS.y, i === phaseIndex ? PIPS.r + 2 : PIPS.r)
    }
    parts.push(pips)

    const count = routine.steps.length
    const totalW = count * MINI.size + (count - 1) * MINI.gap
    const free = { left: TITLE.x + TITLE.w + 26, right: HELP.x - HELP.r - 26 }
    const startX = (free.left + free.right) / 2 - totalW / 2 + MINI.size / 2

    const slots = routine.steps.map((step, i) => {
        const x = startX + i * (MINI.size + MINI.gap)
        const holder = scene.add.container(x, MINI.cy).setDepth(DEPTH.hud)
        const frame = scene.add.graphics()
        const icon = createFigure(scene, step, MINI.size * 0.86)
        const check = scene.add.graphics().setAlpha(0)

        const half = MINI.size / 2
        check.fillStyle(C.ink, 1)
        check.fillCircle(half - 6, half - 6, 25)
        check.fillStyle(C.ok, 1)
        check.fillCircle(half - 6, half - 8, 21)
        check.lineStyle(7, C.white, 1)
        check.beginPath()
        check.moveTo(half - 17, half - 8)
        check.lineTo(half - 9, half + 1)
        check.lineTo(half + 5, half - 18)
        check.strokePath()

        holder.add([frame, icon, check])
        parts.push(holder)
        return { holder, frame, icon, check }
    })

    function paintFrame(i: number, state: 'done' | 'now' | 'next') {
        const { frame } = slots[i]
        const half = MINI.size / 2
        const s = MINI.size
        frame.clear()

        if (state === 'now') {
            frame.fillStyle(C.warn, 1)
            frame.fillRoundedRect(-half - 10, -half - 10, s + 20, s + 20, 30)
            frame.fillStyle(C.ink, 1)
            frame.fillRoundedRect(-half - 4, -half - 4, s + 8, s + 8, 26)
            frame.fillStyle(C.white, 1)
            frame.fillRoundedRect(-half, -half, s, s, 22)
            return
        }

        frame.fillStyle(C.ink, state === 'done' ? 0.9 : 0.35)
        frame.fillRoundedRect(-half - 4, -half - 4, s + 8, s + 8, 26)
        frame.fillStyle(state === 'done' ? C.white : C.creamDeep, state === 'done' ? 1 : 0.75)
        frame.fillRoundedRect(-half, -half, s, s, 22)
    }

    let pulsing: Phaser.GameObjects.Container | null = null

    function setCurrent(index: number) {
        slots.forEach((slot, i) => {
            const state = i < index ? 'done' : i === index ? 'now' : 'next'
            paintFrame(i, state)
            slot.icon.setAlpha(state === 'next' ? 0.5 : 1)
            slot.check.setAlpha(i < index ? 1 : 0)
        })
        if (pulsing) {
            FX.kill(scene, fx(pulsing))
            pulsing.setScale(1)
        }
        const target = slots[index]?.holder
        if (target) {
            pulsing = target
            FX.breathe(scene, fx(target), { grow: 1.07, duration: 880 })
        }
    }

    setCurrent(0)

    return {
        setCurrent,

        /** O carimbo cai junto com a peça que voa da trilha até aqui. */
        async stamp(index: number) {
            const slot = slots[index]
            if (!slot) return
            slot.check.setAlpha(1).setScale(0)
            await FX.all(
                FX.to(scene, fx(slot.check), { scale: 1 }, { duration: 300, ease: Ease.back(3.4) }),
                FX.impact(scene, fx(slot.holder), 0.26),
            )
        },

        /** Chama o olho para o passo certo depois de dois erros. */
        blink(index: number) {
            const slot = slots[index]
            if (!slot) return
            void FX.to(scene, fx(slot.holder), { alpha: 0.3 },
                { duration: 170, yoyo: true, repeat: 3 })
        },

        at(index: number) {
            const slot = slots[index]
            return slot
                ? { x: slot.holder.x, y: slot.holder.y }
                : { x: W / 2, y: MINI.cy }
        },

        miniScale: (MINI.size * 0.86),

        destroy() {
            if (pulsing) FX.kill(scene, fx(pulsing))
            parts.forEach(p => p.destroy())
        },
    }
}

export function createHelpButton(scene: Phaser.Scene, onTap: () => void) {
    const container = scene.add.container(HELP.x, HELP.y).setDepth(DEPTH.hud + 2)
    const g = scene.add.graphics()
    const mark = scene.add.text(0, 1, '?', {
        fontFamily: FONT.black, fontSize: SIZE.help, color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    mark.setStroke(CSS.ink, 5)

    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, HELP.r)
    g.fillStyle(C.cyanDark, 1)
    g.fillCircle(0, 0, HELP.r - 5)
    g.fillStyle(C.cyan, 1)
    g.fillCircle(0, -4, HELP.r - 9)
    g.fillStyle(C.white, 0.3)
    g.fillEllipse(-HELP.r * 0.26, -HELP.r * 0.42, HELP.r * 0.7, HELP.r * 0.3)
    container.add([g, mark])

    const zone = scene.add
        .zone(HELP.x, HELP.y, HELP.r * 2.6, HELP.r * 2.6)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(DEPTH.hud + 3)
    zone.on('pointerdown', () => {
        void FX.impact(scene, fx(container), 0.22)
        onTap()
    })

    return {
        setEnabled(on: boolean) {
            container.setAlpha(on ? 1 : 0.4)
            if (on) zone.setInteractive({ useHandCursor: true })
            else zone.disableInteractive()
        },
        destroy() {
            zone.destroy()
            container.destroy()
        },
    }
}
