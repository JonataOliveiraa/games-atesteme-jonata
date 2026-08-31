import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { formatTime, paintClockFace } from '../../../../shared/hud/createTimeBar'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { CLOCK, DEPTH, LEVEL_PILL, PHASE_PIPS } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  NÍVEL, FASE E CRONÔMETRO
 * ══════════════════════════════════════════════════════════════════════
 *
 * Os três vivem nas pontas do painel da trilha, longe dos quadrados: à
 * esquerda quem sou eu (nível e fase), à direita quanto já andei.
 *
 * O relógio CONTA PARA CIMA, e não para baixo. Um jogo de montar sequência
 * cobra pensar antes de agir; barra esvaziando cobra o contrário, e para uma
 * criança de 6 anos as duas coisas juntas viram só pressa. Aqui o tempo mede
 * a partida — aparece no painel de fim de nível — mas não empurra ninguém.
 */
export function createHud(scene: Phaser.Scene, phaseCount: number) {
    const parts: Phaser.GameObjects.GameObject[] = []

    // ─────────────────────────────────────────────────── nível e fases

    const pill = scene.add.graphics().setDepth(DEPTH.hud)
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(LEVEL_PILL.x, LEVEL_PILL.y, LEVEL_PILL.w, LEVEL_PILL.h, LEVEL_PILL.h / 2)
    pill.fillStyle(C.okDark, 1)
    pill.fillRoundedRect(
        LEVEL_PILL.x + 4, LEVEL_PILL.y + 4,
        LEVEL_PILL.w - 8, LEVEL_PILL.h - 8, (LEVEL_PILL.h - 8) / 2,
    )
    pill.fillStyle(C.white, 0.22)
    pill.fillRoundedRect(LEVEL_PILL.x + 14, LEVEL_PILL.y + 9, LEVEL_PILL.w - 28, 9, 5)
    parts.push(pill)

    const levelLabel = scene.add.text(
        LEVEL_PILL.x + LEVEL_PILL.w / 2, LEVEL_PILL.y + LEVEL_PILL.h / 2, 'NÍVEL 1/3',
        { fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: CSS.cream },
    ).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(levelLabel)

    const pips = scene.add.graphics().setDepth(DEPTH.hud + 1)
    parts.push(pips)

    function paintPips(current: number) {
        pips.clear()
        const spread = (phaseCount - 1) * PHASE_PIPS.gap
        for (let i = 0; i < phaseCount; i++) {
            const x = PHASE_PIPS.cx - spread / 2 + i * PHASE_PIPS.gap
            const on = i === current
            pips.fillStyle(C.ink, 0.9)
            pips.fillCircle(x, PHASE_PIPS.y + 2, PHASE_PIPS.r + 3)
            pips.fillStyle(i < current ? C.ok : on ? C.warn : C.creamEdge, 1)
            pips.fillCircle(x, PHASE_PIPS.y, on ? PHASE_PIPS.r + 2 : PHASE_PIPS.r)
        }
    }
    paintPips(0)

    const phaseLabel = scene.add.text(
        PHASE_PIPS.cx, PHASE_PIPS.y + 24, 'FASE 1 DE 3',
        { fontFamily: FONT.black, fontSize: SIZE.hudPhase, color: CSS.inkSoft },
    ).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(phaseLabel)

    // ─────────────────────────────────────────────────────── o relógio

    const clock = scene.add.container(CLOCK.x, CLOCK.y).setDepth(DEPTH.hud)
    const face = scene.add.graphics()
    paintClockFace(face, CLOCK.r, C.okDark)
    const shell = scene.add.graphics()
    shell.fillStyle(C.ink, 1)
    shell.fillRoundedRect(CLOCK.r + 6, -22, CLOCK.w, 44, 22)
    shell.fillStyle(C.creamDeep, 1)
    shell.fillRoundedRect(CLOCK.r + 10, -18, CLOCK.w - 8, 36, 18)
    shell.fillStyle(C.cream, 1)
    shell.fillRoundedRect(CLOCK.r + 10, -18, CLOCK.w - 8, 28, 18)
    const value = scene.add.text(CLOCK.r + 10 + (CLOCK.w - 8) / 2, 1, '0:00', {
        fontFamily: FONT.black, fontSize: SIZE.hudClock, color: CSS.ink,
    }).setOrigin(0.5).setResolution(2)
    clock.add([shell, face, value])
    parts.push(clock)

    let elapsed = 0
    let running = false
    let shown = -1

    return {
        setLevel(level: number, total: number) {
            levelLabel.setText(`NÍVEL ${level}/${total}`)
        },

        setPhase(index: number) {
            paintPips(index)
            phaseLabel.setText(`FASE ${index + 1} DE ${phaseCount}`)
            void FX.impact(scene, fx(pips), 0.3)
        },

        /** O relógio para no tutorial e na reprise: ele mede jogo, não pausa. */
        setRunning(on: boolean) {
            running = on
        },

        tick(dtMs: number) {
            if (!running) return
            elapsed += dtMs
            const seconds = Math.floor(elapsed / 1000)
            if (seconds === shown) return
            shown = seconds
            value.setText(formatTime(elapsed))
        },

        elapsed: () => elapsed,
        formatted: () => formatTime(elapsed),

        destroy() {
            FX.kill(scene, fx(pips))
            parts.forEach(p => p.destroy())
        },
    }
}
