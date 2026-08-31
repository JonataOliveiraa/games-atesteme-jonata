import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { DEPTH, H, RECAP, W } from '../data/layout'
import { createFigure } from './figures'
import type { StepDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A REPRISE DO DIA
 * ══════════════════════════════════════════════════════════════════════
 *
 * No fim de cada fase o dia inteiro passa de novo, rápido: cada passo aparece
 * grande no meio, dá um estalo e vai se encaixar na fileira de baixo. É folha
 * de sprites feita à mão — um quadro por passo, no ritmo de um filme curto.
 *
 * Isso não é enfeite. É a única hora em que a criança vê a SEQUÊNCIA INTEIRA
 * de uma vez, e é ela quem a habilidade cobra.
 */
export function createRecap(scene: Phaser.Scene) {
    let parts: Phaser.GameObjects.GameObject[] = []

    function clear() {
        parts.forEach(p => {
            FX.kill(scene, fx(p))
            p.destroy()
        })
        parts = []
    }

    return {
        async play(steps: StepDef[], cheer: string) {
            clear()

            const veil = scene.add.graphics().setDepth(DEPTH.recap).setAlpha(0)
            veil.fillStyle(C.ink, 1)
            veil.fillRect(0, 0, W, H)
            parts.push(veil)

            const title = scene.add.text(W / 2, RECAP.titleY, cheer, {
                fontFamily: FONT.black,
                fontSize: SIZE.banner,
                color: CSS.cream,
                align: 'center',
            }).setOrigin(0.5).setDepth(DEPTH.recap + 2).setResolution(2).setAlpha(0).setScale(0.7)
            title.setStroke(CSS.ink, 10)
            parts.push(title)

            await FX.all(
                FX.to(scene, fx(veil), { alpha: 0.55 }, { duration: 260 }),
                FX.to(scene, fx(title), { alpha: 1, scale: 1 },
                    { duration: 340, ease: Ease.back(2.6) }),
            )

            const totalW = (steps.length - 1) * RECAP.gap
            const startX = W / 2 - totalW / 2
            const icons: Phaser.GameObjects.Container[] = []

            for (let i = 0; i < steps.length; i++) {
                const icon = createFigure(scene, steps[i], RECAP.size * 1.9)
                icon.setPosition(W / 2, RECAP.cy).setDepth(DEPTH.recap + 3).setScale(0.3).setAlpha(0)
                parts.push(icon)
                icons.push(icon)

                void FX.sparks(scene, W / 2, RECAP.cy,
                    { color: C.warn, count: 12, spread: 190, duration: 480 })

                /*
                 * Um tween de cada vez no mesmo alvo. Sobrepondo o estalo com
                 * o encaixe, a escala do PRIMEIRO quadro ficava pelo caminho e
                 * ele terminava gigante no meio da fileira.
                 */
                await FX.to(scene, fx(icon), { scale: 1, alpha: 1 },
                    { duration: 160, ease: Ease.back(3) })
                await FX.wait(scene, 90)

                await FX.to(scene, fx(icon),
                    {
                        x: startX + i * RECAP.gap,
                        y: RECAP.rowY,
                        scale: 1 / 1.9,
                    },
                    { duration: 200, ease: 'Quad.easeInOut' })
            }

            /*
             * A fileira pronta dá um pulinho junto: é o fecho que diz "isto
             * aqui é UMA coisa só", e não cinco desenhos soltos.
             */
            await FX.wait(scene, 220)
            await FX.stagger(scene, icons.map(fx), target =>
                FX.seq(
                    () => FX.to(scene, target, { y: RECAP.rowY - 26 }, { duration: 130 }),
                    () => FX.to(scene, target, { y: RECAP.rowY },
                        { duration: 220, ease: Ease.back(3) }),
                ), 70)

            await FX.wait(scene, 420)
            await FX.to(scene, parts.map(fx), { alpha: 0 }, { duration: 300 })
            clear()
        },

        destroy: clear,
    }
}
