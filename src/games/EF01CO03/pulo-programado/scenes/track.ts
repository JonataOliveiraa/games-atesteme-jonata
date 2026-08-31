import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { DEPTH, HELP, SLOT, TRACK, W } from '../data/layout'
import { createPoseIcon } from './cards'
import type { ActionKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A TRILHA — O PROGRAMA
 * ══════════════════════════════════════════════════════════════════════
 *
 * Um quadrado por marco do chão, na mesma ordem. É aqui que a sequência
 * EXISTE antes de rodar, e é isso que separa este jogo de responder uma
 * pergunta por obstáculo.
 *
 * Tocar num quadrado cheio devolve a carta. Sem arrastar: um toque põe, um
 * toque tira — é o que dá a reorganização sem exigir precisão de dedo.
 */
export function createTrack(
    scene: Phaser.Scene,
    count: number,
    onTapSlot: (index: number) => void,
) {
    const parts: Phaser.GameObjects.GameObject[] = []

    const panel = scene.add.graphics().setDepth(DEPTH.panel)
    panel.fillStyle(C.ink, 0.22)
    panel.fillRoundedRect(TRACK.x, TRACK.y + 8, TRACK.w, TRACK.h, TRACK.r)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(TRACK.x, TRACK.y, TRACK.w, TRACK.h, TRACK.r)
    panel.fillStyle(C.creamDeep, 1)
    panel.fillRoundedRect(TRACK.x + 6, TRACK.y + 6, TRACK.w - 12, TRACK.h - 12, TRACK.r - 6)
    panel.fillStyle(C.cream, 1)
    panel.fillRoundedRect(TRACK.x + 6, TRACK.y + 6, TRACK.w - 12, TRACK.h - 20, TRACK.r - 6)
    parts.push(panel)

    /*
     * O quadrado cresce quando sao poucos. Com tres passos sobrava meia tela
     * vazia entre a pilula do nivel e o relogio, e a ordem — que e o assunto
     * do jogo — acabava sendo a coisa menor da tela.
     */
    const room = SLOT.to - SLOT.from
    const size = Math.max(
        SLOT.min,
        Math.min(SLOT.max, (room - (count - 1) * SLOT.gap) / count),
    )
    const totalW = count * size + (count - 1) * SLOT.gap
    const startX = (SLOT.from + SLOT.to) / 2 - totalW / 2 + size / 2

    const slots = Array.from({ length: count }, (_, i) => {
        const x = startX + i * (size + SLOT.gap)
        const holder = scene.add.container(x, SLOT.cy).setDepth(DEPTH.hud)
        const frame = scene.add.graphics()
        holder.add(frame)
        parts.push(holder)

        const zone = scene.add
            .zone(x, SLOT.cy, size + SLOT.gap, size + 18)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(DEPTH.hud + 4)
        zone.on('pointerdown', () => onTapSlot(i))
        parts.push(zone)

        return { holder, frame, icon: null as Phaser.GameObjects.Container | null }
    })

    function paintFrame(i: number, state: 'empty' | 'filled' | 'now' | 'wrong') {
        const { frame } = slots[i]
        const s = size
        const half = s / 2
        frame.clear()

        const ring =
            state === 'now' ? C.warn : state === 'wrong' ? C.bad : C.ink
        frame.fillStyle(ring, state === 'empty' ? 0.35 : 1)
        frame.fillRoundedRect(-half - 6, -half - 6, s + 12, s + 12, 26)

        if (state === 'empty') {
            frame.fillStyle(C.creamDeep, 1)
            frame.fillRoundedRect(-half, -half, s, s, 20)
            frame.lineStyle(5, C.creamEdge, 1)
            for (let k = 0; k < 4; k++) {
                const a = (k / 4) * Math.PI * 2 + Math.PI / 4
                frame.lineBetween(
                    Math.cos(a) * (half - 14), Math.sin(a) * (half - 14),
                    Math.cos(a) * (half - 30), Math.sin(a) * (half - 30),
                )
            }
            return
        }

        frame.fillStyle(C.white, 1)
        frame.fillRoundedRect(-half, -half, s, s, 20)
    }

    const program: (ActionKind | null)[] = Array.from({ length: count }, () => null)
    let pulsing: Phaser.GameObjects.Container | null = null

    function repaint(activeIndex = -1, wrongIndex = -1) {
        slots.forEach((slot, i) => {
            const state = i === wrongIndex
                ? 'wrong'
                : i === activeIndex
                    ? 'now'
                    : program[i]
                        ? 'filled'
                        : 'empty'
            paintFrame(i, state)
        })
    }
    repaint()

    function stopPulse() {
        if (!pulsing) return
        FX.kill(scene, fx(pulsing))
        pulsing.setScale(1)
        pulsing = null
    }

    return {
        program,
        slotSize: size,

        isFull: () => program.every(Boolean),
        firstEmpty: () => program.findIndex(card => card === null),

        at(i: number) {
            const slot = slots[i]
            return slot ? { x: slot.holder.x, y: slot.holder.y } : { x: W / 2, y: SLOT.cy }
        },

        /** A carta chega no quadrado; o encaixe é a única animação obrigatória. */
        async place(i: number, kind: ActionKind) {
            const slot = slots[i]
            if (!slot) return
            program[i] = kind
            slot.icon?.destroy()
            const icon = createPoseIcon(scene, kind, size - 10)
            icon.setScale(0)
            slot.holder.add(icon)
            slot.icon = icon
            repaint()
            await FX.to(scene, fx(icon), { scale: 1 }, { duration: 240, ease: Ease.back(3) })
        },

        clear(i: number) {
            const slot = slots[i]
            if (!slot) return
            program[i] = null
            slot.icon?.destroy()
            slot.icon = null
            repaint()
            void FX.impact(scene, fx(slot.holder), 0.22)
        },

        /** Acende o quadrado do passo que o coelho está executando agora. */
        setActive(i: number) {
            stopPulse()
            repaint(i)
            const target = slots[i]?.holder
            if (target) {
                pulsing = target
                FX.breathe(scene, fx(target), { grow: 1.1, duration: 520 })
            }
        },

        idle() {
            stopPulse()
            repaint()
        },

        /** O quadrado culpado: cadeado, tremor e brilho vermelho. */
        async blame(i: number) {
            stopPulse()
            repaint(-1, i)
            const slot = slots[i]
            if (!slot) return
            await FX.shake(scene, fx(slot.holder), { amount: 12, times: 4 })
            void FX.to(scene, fx(slot.holder), { alpha: 0.45 },
                { duration: 220, yoyo: true, repeat: 2 })
        },

        destroy() {
            stopPulse()
            slots.forEach(slot => slot.icon?.destroy())
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
