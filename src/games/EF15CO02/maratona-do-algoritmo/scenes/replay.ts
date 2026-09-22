import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, H, REPLAY, W } from '../data/layout'
import { createPoseIcon } from './cards'
import type { TrickKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * A REPRISE — "SUA LINHA".
 *
 * A fase não acaba no último marco: acaba quando a criança VÊ o que ela
 * montou, inteiro e de uma vez. Enquanto a linha estava sendo executada, cada
 * manobra era um momento; aqui elas viram UMA COISA SÓ, e é essa coisa que
 * tem nome de algoritmo.
 *
 * É o único lugar do jogo onde a palavra ALGORITMO aparece — e ela aparece
 * depois de a criança ter feito um, nunca antes.
 */
export function createReplay(scene: Phaser.Scene) {
    const layer = scene.add.container(0, 0).setDepth(DEPTH.overlay).setAlpha(0)
    const shade = scene.add.graphics()
    shade.fillStyle(C.ink, 0.62)
    shade.fillRect(0, 0, W, H)
    layer.add(shade)

    const title = scene.add.text(W / 2, REPLAY.titleY, '', {
        fontFamily: FONT.black, fontSize: '52px', color: CSS.cream,
    }).setOrigin(0.5).setResolution(2)
    title.setStroke(CSS.ink, 9)
    layer.add(title)

    const word = scene.add.text(W / 2, REPLAY.cardY + 138, '', {
        fontFamily: FONT.black, fontSize: '30px', color: CSS.white, align: 'center',
        wordWrap: { width: 900 },
    }).setOrigin(0.5).setResolution(2)
    word.setStroke(CSS.ink, 7)
    layer.add(word)

    let icons: Phaser.GameObjects.Container[] = []

    return {
        async play(line: TrickKind[], cheer: string, closing: string) {
            icons.forEach(icon => icon.destroy())
            icons = []

            title.setText(cheer)
            word.setText('').setAlpha(0)

            const width = line.length * REPLAY.size + (line.length - 1) * (REPLAY.gap - REPLAY.size)
            const startX = W / 2 - width / 2 + REPLAY.size / 2

            line.forEach((kind, i) => {
                const icon = createPoseIcon(scene, kind, REPLAY.size)
                icon.setPosition(startX + i * REPLAY.gap, REPLAY.cardY).setAlpha(0.35).setScale(0.9)
                layer.add(icon)
                icons.push(icon)
            })

            await FX.to(scene, fx(layer), { alpha: 1 }, { duration: 260 })

            /* Cada manobra acende na ORDEM em que foi executada: é a mesma
             * sequência, vista agora como um objeto só. */
            for (const icon of icons) {
                await FX.to(scene, fx(icon), { alpha: 1, scale: 1.1 }, {
                    duration: 200, ease: Ease.back(2),
                })
                await FX.to(scene, fx(icon), { scale: 1 }, { duration: 120 })
            }

            word.setText(closing)
            await FX.to(scene, fx(word), { alpha: 1 }, { duration: 260 })
            await FX.wait(scene, 1500)
            await FX.to(scene, fx(layer), { alpha: 0 }, { duration: 300 })

            icons.forEach(icon => icon.destroy())
            icons = []
        },

        destroy() {
            FX.kill(scene, fx(layer))
            layer.destroy(true)
        },
    }
}
