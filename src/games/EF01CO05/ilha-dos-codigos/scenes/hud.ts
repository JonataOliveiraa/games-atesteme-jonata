import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HELP, HUD, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'

export function createHud(scene: Phaser.Scene, onHelp: () => void) {
    const strip = scene.add.graphics().setDepth(DEPTH.hud - 2)
    strip.fillStyle(C.ink, 0.18)
    strip.fillRoundedRect(-40, -40, W + 80, HUD.h + 40, 26)

    const helpG = scene.add.graphics().setPosition(HELP.x, HELP.y).setDepth(DEPTH.hud)
    helpG.fillStyle(C.ink, 0.22)
    helpG.fillCircle(2, 5, HELP.r)
    helpG.fillStyle(C.cream, 1)
    helpG.fillCircle(0, 0, HELP.r)
    helpG.lineStyle(5, C.woodDark, 1)
    helpG.strokeCircle(0, 0, HELP.r)

    const helpText = scene.add.text(HELP.x, HELP.y + 1, '?', {
        fontFamily: FONT.black,
        fontSize: SIZE.help,
        color: CSS.ink,
    }).setOrigin(0.5).setDepth(DEPTH.hud).setResolution(2)

    const zone = scene.add.zone(HELP.x, HELP.y, HELP.r * 2.4, HELP.r * 2.4)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, helpG)
        onHelp()
    })

    const edge = scene.add.graphics().setDepth(DEPTH.edge).setAlpha(0)

    return {
        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        /**
         * A moldura da tela pisca nas bordas: faz o momento parecer grande sem
         * tirar o olho do meio, que é onde estão a pista e a fechadura.
         */
        flash(color: number) {
            edge.clear()
            edge.lineStyle(22, color, 1)
            edge.strokeRoundedRect(11, 11, W - 22, H - 22, 30)
            edge.setAlpha(0.9)
            scene.tweens.add({
                targets: edge,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
            })
        },

        destroy() {
            strip.destroy()
            helpG.destroy()
            helpText.destroy()
            edge.destroy()
            zone.destroy()
        },
    }
}
