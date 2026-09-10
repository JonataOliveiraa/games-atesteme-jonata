import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BENCH_ART, DEPTH, WORLD } from '../data/layout'
import { C } from '../data/theme'
import type { Item } from '../types'

/** A bancada no fim da trilha: é onde o pedaço fica pronto. */
export function createBench(scene: Phaser.Scene) {
    let art: Phaser.GameObjects.GameObject | null = null
    let arrow: Phaser.GameObjects.Graphics | null = null
    let glow: Phaser.GameObjects.Graphics | null = null
    let x = 0
    let dropped: Phaser.GameObjects.Image[] = []
    let top = WORLD.groundY

    const clear = () => {
        art?.destroy()
        art = null
        arrow?.destroy()
        arrow = null
        glow?.destroy()
        glow = null
        dropped.forEach(image => image.destroy())
        dropped = []
    }

    return {
        place(atX: number) {
            clear()
            x = atX
            if (scene.textures.exists('bancada')) {
                const source = scene.textures.get('bancada').getSourceImage()
                const image = scene.add
                    .image(atX, WORLD.groundY, 'bancada')
                    .setOrigin(0.5, 1)
                    .setScale(BENCH_ART.scale)
                    .setDepth(DEPTH.bench)
                top = WORLD.groundY - source.height * BENCH_ART.scale * (1 - BENCH_ART.topAt)
                art = image
            } else {
                const g = scene.add.graphics().setDepth(DEPTH.bench)
                g.fillStyle(C.wood, 1)
                g.fillRoundedRect(atX - 130, WORLD.groundY - 150, 260, 24, 8)
                g.fillRect(atX - 110, WORLD.groundY - 130, 22, 130)
                g.fillRect(atX + 88, WORLD.groundY - 130, 22, 130)
                art = g
                top = WORLD.groundY - 150
            }

            glow = scene.add.graphics().setDepth(DEPTH.bench - 1).setAlpha(0)
            glow.fillStyle(C.gold, 0.5)
            glow.fillEllipse(atX, top - 10, 360, 160)
            glow.fillStyle(C.white, 0.35)
            glow.fillEllipse(atX, top - 6, 260, 110)

            arrow = scene.add.graphics().setDepth(DEPTH.bench + 1).setVisible(false)
            arrow.fillStyle(C.warn, 1)
            arrow.fillTriangle(atX - 26, top - 96, atX + 26, top - 96, atX, top - 56)
            arrow.fillRoundedRect(atX - 10, top - 140, 20, 48, 8)
        },

        get x() {
            return x
        },

        topY() {
            return top
        },

        reached(heroX: number) {
            return Math.abs(heroX - x) < 90
        },

        hint(on: boolean) {
            arrow?.setVisible(on)
            if (!arrow || !on) return
            scene.tweens.killTweensOf(arrow)
            arrow.setAlpha(1)
            scene.tweens.add({
                targets: arrow,
                y: -14,
                duration: FX.ms(scene, 460),
                yoyo: true,
                repeat: -1,
            })
        },

        /**
         * A ENTREGA, um objeto de cada vez.
         *
         * Antes eram quatro arcos iguais e rápidos, e a viagem inteira terminava
         * sem que nada parecesse ter acontecido. Agora cada objeto sai do
         * cabeçalho, sobe num arco alto, POUSA no tampo com um baque, e o tampo
         * pisca. O último acende a bancada inteira. É o prêmio da viagem: ele
         * precisa durar alguns segundos.
         */
        async deliver(
            items: Item[],
            sheet: string,
            from: (item: Item) => { x: number; y: number },
            onEach: (index: number) => void,
        ) {
            const scroll = scene.cameras.main.scrollX
            const pitch = 86
            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                const start = from(item)
                const target = {
                    x: x - ((items.length - 1) * pitch) / 2 + i * pitch,
                    y: top - 46,
                }
                onEach(i)

                if (!scene.textures.exists(sheet)) {
                    await FX.wait(scene, 260)
                    continue
                }

                const image = scene.add
                    .image(start.x + scroll, start.y, sheet, item.frame)
                    .setDisplaySize(60, 60)
                    .setDepth(DEPTH.item)
                dropped.push(image)

                await FX.arcTo(scene, image, target, { duration: 480, height: 210 })
                await FX.to(
                    scene,
                    image,
                    { displayWidth: 102, displayHeight: 102 },
                    { duration: 150, ease: 'Back.easeOut' },
                )
                await FX.to(
                    scene,
                    image,
                    { displayWidth: 84, displayHeight: 84 },
                    { duration: 130 },
                )
                void FX.sparks(scene, target.x, target.y + 20, { color: C.gold, count: 12 })
                void FX.ping(scene, target.x, target.y, C.gold, { radius: 90, depth: DEPTH.item - 1 })
                await FX.wait(scene, 90)
            }

            if (glow) {
                glow.setAlpha(0)
                await FX.to(scene, glow, { alpha: 1 }, { duration: 220 })
            }
        },

        setVisible(value: boolean) {
            ;(art as Phaser.GameObjects.Image | null)?.setVisible(value)
            arrow?.setVisible(false)
        },

        clear,

        destroy() {
            if (arrow) scene.tweens.killTweensOf(arrow)
            clear()
        },
    }
}

export type Bench = ReturnType<typeof createBench>
