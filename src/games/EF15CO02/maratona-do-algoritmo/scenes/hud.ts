import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE, TRICK_COLOR } from '../data/theme'
import { DEPTH, HELP, PHASE_PIPS } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * O QUE SOBROU DE INTERFACE FIXA: três bolinhas e um `?`.
 *
 * Sem pílula de "NÍVEL 1/3", sem rótulo de "FASE 1 DE 3", sem cronômetro na
 * tela. As bolinhas dizem onde a criança está sem uma palavra, e o relógio
 * continua contando por dentro para aparecer uma vez só, no painel de fim de
 * nível. Com isso a única palavra permanente da tela é o `?`.
 *
 * Os dois flutuam sobre o céu do parque, e por isso ganham um fundo próprio:
 * sem ele a bolinha apagada some no azul claro.
 */
export function createHud(scene: Phaser.Scene, phaseCount: number) {
    const pips = scene.add.graphics().setDepth(DEPTH.hud)

    function paintPips(current: number) {
        pips.clear()
        const spread = (phaseCount - 1) * PHASE_PIPS.gap
        const left = PHASE_PIPS.cx - spread / 2

        pips.fillStyle(C.ink, 0.28)
        pips.fillRoundedRect(
            left - 26, PHASE_PIPS.y - 22, spread + 52, 44, 22,
        )

        for (let i = 0; i < phaseCount; i++) {
            const x = left + i * PHASE_PIPS.gap
            const on = i === current
            pips.fillStyle(C.ink, 0.9)
            pips.fillCircle(x, PHASE_PIPS.y + 2, PHASE_PIPS.r + 3)
            pips.fillStyle(i < current ? C.ok : on ? C.warn : C.cream, 1)
            pips.fillCircle(x, PHASE_PIPS.y, on ? PHASE_PIPS.r + 2 : PHASE_PIPS.r)
        }
    }

    return {
        setPhase(index: number) {
            paintPips(index)
            void FX.impact(scene, fx(pips), 0.3)
        },
        destroy() {
            FX.kill(scene, fx(pips))
            pips.destroy()
        },
    }
}

/** O `?` fica sempre visível, e é a única palavra permanente da tela. */
export function createHelpButton(scene: Phaser.Scene, onTap: () => void) {
    const container = scene.add.container(HELP.x, HELP.y).setDepth(DEPTH.hud + 2)
    const g = scene.add.graphics()
    const mark = scene.add.text(0, 1, '?', {
        fontFamily: FONT.black, fontSize: SIZE.help, color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    mark.setStroke(CSS.ink, 5)

    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, HELP.r)
    g.fillStyle(TRICK_COLOR.pular.dark, 1)
    g.fillCircle(0, 0, HELP.r - 5)
    g.fillStyle(TRICK_COLOR.pular.main, 1)
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
