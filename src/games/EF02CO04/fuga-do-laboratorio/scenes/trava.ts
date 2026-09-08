import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SLOT_PHRASE } from '../data/theme'
import type { LabItem, Slot } from '../types'
import { SLOT_KIND } from '../data/items'
import { createItemIcon } from './itemIcon'
import { createKindIcon } from './glyphs'

export type TravaSpec =
    /** A entrada recusou o tipo: é a regra da habilidade, dita na própria entrada. */
    | { kind: 'slot'; slot: Slot; target: LabItem }
    /** O TESTAR rodou e deu errado: a peça e a ordem, lado a lado, e o porquê. */
    | { kind: 'run'; hardware: LabItem; software: LabItem; line: string }

const PANEL = { cx: W / 2, cy: 360, w: 700, h: 330, r: 34 }

/**
 * A TRAVA.
 *
 * O mundo para e a criança vê a COMPARAÇÃO, não um aviso. Nos dois casos ela
 * fica olhando para as duas coisas que estavam em jogo, com a frase concreta
 * embaixo — e depois volta para a MESMA decisão, com a bancada limpa.
 */
export function showTrava(scene: Phaser.Scene, spec: TravaSpec): Promise<void> {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.66)
        .setDepth(DEPTH.overlay)
        .setInteractive()

    const root = scene.add.container(PANEL.cx, PANEL.cy).setDepth(DEPTH.overlay + 1)
    const half = { w: PANEL.w / 2, h: PANEL.h / 2 }

    const tone = spec.kind === 'slot'
        ? (spec.slot === 'tray' ? C.hardDark : C.softDark)
        : C.warnDark

    const shell = scene.add.graphics()
    shell.fillStyle(C.ink, 0.4)
    shell.fillRoundedRect(-half.w, -half.h + 14, PANEL.w, PANEL.h, PANEL.r)
    shell.fillStyle(C.ink, 1)
    shell.fillRoundedRect(-half.w, -half.h, PANEL.w, PANEL.h, PANEL.r)
    shell.fillStyle(tone, 1)
    shell.fillRoundedRect(-half.w + 8, -half.h + 8, PANEL.w - 16, PANEL.h - 16, PANEL.r - 7)
    shell.fillStyle(C.cream, 1)
    shell.fillRoundedRect(-half.w + 8, -half.h + 22, PANEL.w - 16, PANEL.h - 38, PANEL.r - 7)

    const stage = scene.add.container(0, -22)
    const phrase = scene.add.text(0, half.h - 62, '', {
        fontFamily: FONT.black,
        fontSize: '30px',
        color: CSS.warn,
        align: 'center',
        wordWrap: { width: PANEL.w - 90 },
    }).setOrigin(0.5).setResolution(2)

    const arrow = scene.add.graphics()

    if (spec.kind === 'slot') {
        const icon = createItemIcon(scene, spec.target, 140)
        icon.setPosition(-158, 0)

        const glyph = createKindIcon(scene, SLOT_KIND[spec.slot], 158).setPosition(140, 0)

        // a seta cortada: aquilo não entra ali
        arrow.fillStyle(C.warn, 1)
        arrow.fillRoundedRect(-64, -9, 66, 18, 9)
        arrow.lineStyle(12, C.warnDark, 1)
        arrow.lineBetween(12, -30, 56, 30)
        arrow.lineBetween(56, -30, 12, 30)

        stage.add([icon, arrow, glyph])
        phrase.setText(SLOT_PHRASE[spec.slot])
        phrase.setColor(spec.slot === 'tray' ? CSS.hard : CSS.soft)
    } else {
        const hardware = createItemIcon(scene, spec.hardware, 132)
        hardware.setPosition(-158, 0)
        const software = createItemIcon(scene, spec.software, 132)
        software.setPosition(158, 0)

        arrow.fillStyle(C.warn, 1)
        arrow.fillRoundedRect(-58, -9, 62, 18, 9)
        arrow.lineStyle(12, C.warnDark, 1)
        arrow.lineBetween(14, -30, 58, 30)
        arrow.lineBetween(58, -30, 14, 30)

        stage.add([software, arrow, hardware])
        phrase.setText(spec.line)
    }

    root.add([shell, stage, phrase])
    root.setScale(0.72).setAlpha(0)

    return new Promise<void>(resolve => {
        let done = false
        const finish = () => {
            if (done) return
            done = true
            scene.tweens.killTweensOf(root)
            veil.destroy()
            root.destroy(true)
            resolve()
        }

        veil.once('pointerdown', () => {
            // só depois que o painel chegou; senão o toque do erro fecha a dica
            if (root.alpha < 1) return
            finish()
        })

        void FX.seq(
            () => FX.to(scene, root, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' }),
            () => FX.wait(scene, 2500),
            () => finish(),
        )
    })
}
