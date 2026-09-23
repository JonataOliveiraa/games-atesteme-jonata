import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BAG, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { Datum } from '../types'

/**
 * A bolsa e as miniaturas do que já foi minerado. As miniaturas contam
 * quantas palavras entraram sem escrever nenhum número na tela.
 */
export function createBag(scene: Phaser.Scene) {
    const root = scene.add.container(BAG.explore.x, BAG.explore.y).setDepth(DEPTH.bag)

    const hasArt = scene.textures.exists('objetos-caverna')
    const body = hasArt
        ? scene.add.image(0, 0, 'objetos-caverna', 0).setDisplaySize(BAG.explore.size, BAG.explore.size)
        : null

    const fallback = hasArt ? null : scene.add.graphics()
    if (fallback) {
        const half = BAG.explore.size / 2
        fallback.fillStyle(C.leatherDark, 1)
        fallback.fillRoundedRect(-half * 0.86, -half * 0.5, half * 1.72, half * 1.3, 22)
        fallback.fillStyle(C.leather, 1)
        fallback.fillRoundedRect(-half * 0.86, -half * 0.5, half * 1.72, half * 0.8, 20)
    }

    root.add(hasArt ? body! : fallback!)

    const minis = scene.add.container(0, 0).setDepth(DEPTH.bag - 1)
    let taken: { datum: Datum; sheet: string }[] = []

    /** Desenhadas nas coordenadas da EXPLORAÇÃO: só existem naquele modo. */
    const drawMini = (item: { datum: Datum; sheet: string }, index: number) => {
        const mini = scene.add.container(BAG.explore.x - BAG.miniDX - index * BAG.miniGap, BAG.explore.y + 2)
        const disc = scene.add.graphics()
        disc.fillStyle(C.ink, 1)
        disc.fillCircle(0, 0, 25)
        disc.fillStyle(C.panel, 1)
        disc.fillCircle(0, 0, 21)
        mini.add(disc)
        if (scene.textures.exists(item.sheet)) {
            mini.add(scene.add.image(0, 0, item.sheet, item.datum.frame).setDisplaySize(32, 32))
        }
        minis.add(mini)
        return mini
    }

    return {
        /** Onde a palavra aterrissa quando é recolhida. */
        point() {
            return { x: root.x, y: root.y - 8 }
        },

        async take(datum: Datum, sheet: string) {
            taken.push({ datum, sheet })
            const mini = drawMini({ datum, sheet }, taken.length - 1)
            mini.setScale(0.2)
            await FX.to(scene, mini, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        bounce() {
            scene.tweens.add({
                targets: root,
                scaleX: root.scaleX * 1.12,
                scaleY: root.scaleY * 0.9,
                duration: 130,
                yoyo: true,
                ease: 'Sine.easeInOut',
            })
        },

        /** A bolsa abre e vai para o canto do altar; as miniaturas somem. */
        async toAltar() {
            body?.setFrame(1)
            await FX.all(
                FX.to(scene, minis, { alpha: 0 }, { duration: 220 }),
                FX.to(
                    scene,
                    root,
                    {
                        x: BAG.altar.x,
                        y: BAG.altar.y,
                        scale: BAG.altar.size / BAG.explore.size,
                    },
                    { duration: 520, ease: 'Back.easeOut' },
                ),
            )
            minis.removeAll(true)
        },

        /** Nível 3: a criança voltou para a caverna buscar o que faltou. */
        async toExplore() {
            body?.setFrame(0)
            minis.removeAll(true)
            minis.setAlpha(0)
            await FX.to(
                scene,
                root,
                { x: BAG.explore.x, y: BAG.explore.y, scale: 1 },
                { duration: 480, ease: 'Back.easeOut' },
            )
            taken.forEach((item, i) => drawMini(item, i))
            await FX.to(scene, minis, { alpha: 1 }, { duration: 240 })
        },

        /** Sai de cena junto com o altar: a porta fica sozinha na tela. */
        leave() {
            return FX.to(scene, root, { alpha: 0, y: root.y + 40 }, { duration: 380 })
        },

        reset() {
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(minis)
            minis.removeAll(true)
            minis.setAlpha(1)
            taken = []
            body?.setFrame(0)
            root.setPosition(BAG.explore.x, BAG.explore.y).setScale(1).setAlpha(1)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(minis)
            minis.destroy(true)
            root.destroy(true)
        },
    }
}

export type Bag = ReturnType<typeof createBag>
