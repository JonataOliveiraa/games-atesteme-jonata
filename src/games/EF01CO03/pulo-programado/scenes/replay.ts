import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { DEPTH, H, REPLAY, W } from '../data/layout'
import { createActionIcon } from './cards'
import type { ActionKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  O ALGORITMO
 * ══════════════════════════════════════════════════════════════════════
 *
 * A habilidade pede, com todas as letras, RELACIONAR a sequência à palavra
 * "algoritmo". É isto: a lista que a criança montou aparece inteira, uma
 * carta acendendo de cada vez, e só então a palavra entra grande.
 *
 * A palavra vem DEPOIS das cartas de propósito. Primeiro ela vê o que fez;
 * o nome é o fecho, não o cabeçalho.
 */
export function createReplay(scene: Phaser.Scene) {
    let parts: Phaser.GameObjects.GameObject[] = []

    function clear() {
        parts.forEach(p => {
            FX.kill(scene, fx(p))
            p.destroy()
        })
        parts = []
    }

    return {
        async play(program: ActionKind[], cheer: string, line: string) {
            clear()

            const veil = scene.add.graphics().setDepth(DEPTH.overlay - 20).setAlpha(0)
            veil.fillStyle(C.ink, 1)
            veil.fillRect(0, 0, W, H)
            parts.push(veil)

            const title = scene.add.text(W / 2, REPLAY.titleY - 92, cheer, {
                fontFamily: FONT.black,
                fontSize: SIZE.banner,
                color: CSS.cream,
                align: 'center',
            }).setOrigin(0.5).setDepth(DEPTH.overlay - 18).setResolution(2)
                .setAlpha(0).setScale(0.7)
            title.setStroke(CSS.ink, 10)
            parts.push(title)

            await FX.all(
                FX.to(scene, fx(veil), { alpha: 0.6 }, { duration: 260 }),
                FX.to(scene, fx(title), { alpha: 1, scale: 1 },
                    { duration: 320, ease: Ease.back(2.6) }),
            )

            const totalW = (program.length - 1) * REPLAY.gap
            const startX = W / 2 - totalW / 2

            for (let i = 0; i < program.length; i++) {
                const icon = createActionIcon(scene, program[i], REPLAY.size, REPLAY.size)
                icon.setPosition(startX + i * REPLAY.gap, REPLAY.cardY)
                    .setDepth(DEPTH.overlay - 16).setScale(0).setAlpha(0)
                parts.push(icon)

                await FX.to(scene, fx(icon), { scale: 1, alpha: 1 },
                    { duration: 170, ease: Ease.back(3) })
                void FX.sparks(scene, icon.x, icon.y,
                    { color: C.warn, count: 10, spread: 150, duration: 420 })
                await FX.wait(scene, 90)
            }

            await FX.wait(scene, 260)

            const word = scene.add.text(W / 2, REPLAY.titleY + 26, line, {
                fontFamily: FONT.black,
                fontSize: '34px',
                color: CSS.cream,
                align: 'center',
                wordWrap: { width: 900 },
                lineSpacing: 6,
            }).setOrigin(0.5).setDepth(DEPTH.overlay - 14).setResolution(2)
                .setAlpha(0).setScale(0.8)
            word.setStroke(CSS.ink, 9)
            parts.push(word)

            await FX.to(scene, fx(word), { alpha: 1, scale: 1 },
                { duration: 380, ease: Ease.back(2.4) })

            await FX.wait(scene, 1500)
            await FX.to(scene, parts.map(fx), { alpha: 0 }, { duration: 320 })
            clear()
        },

        destroy: clear,
    }
}
