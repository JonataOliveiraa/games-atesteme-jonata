import Phaser from 'phaser'
import { DEPTH, H, HERO_ART, PLAN, W } from '../data/layout'
import { C } from '../data/theme'

/**
 * O QUINTAL onde a tarefa é cortada. É o mesmo lugar da corrida — a criança
 * separa a tarefa aqui e sai correndo daqui.
 *
 * A mesa e o herói parado moram nesta camada: nada aqui muda de estado, então
 * nada aqui é interface.
 */
export function createRoom(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.world).setScrollFactor(0)
    let hero: Phaser.GameObjects.Image | null = null
    let table: Phaser.GameObjects.GameObject | null = null

    const drawTable = () => {
        const left = PLAN.table.cx - PLAN.table.w / 2
        const top = PLAN.table.top
        const w = PLAN.table.w

        if (scene.textures.exists('mesa')) {
            const source = scene.textures.get('mesa').getSourceImage()
            const image = scene.add
                .image(PLAN.table.cx, top, 'mesa')
                .setOrigin(0.5, 0)
                .setScale(w / source.width)
                .setScrollFactor(0)
            root.add(image)
            table = image
            return
        }

        const g = scene.add.graphics().setScrollFactor(0)

        g.fillStyle(C.ink, 0.18)
        g.fillEllipse(PLAN.table.cx, top + 192, w * 0.88, 42)

        // Pernas grossas e para dentro: o herói e o balão passam por fora, e a
        // mesa deixa de parecer uma trave de equilíbrio.
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(left + 84, top + 52, 66, 130, 16)
        g.fillRoundedRect(left + w - 150, top + 52, 66, 130, 16)
        g.fillStyle(0x8a5c34, 1)
        g.fillRoundedRect(left + 90, top + 52, 54, 122, 13)
        g.fillRoundedRect(left + w - 144, top + 52, 54, 122, 13)

        // Saia embaixo do tampo: é ela que dá espessura à mesa.
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(left + 26, top + 42, w - 52, 40, 12)
        g.fillStyle(0x8a5c34, 1)
        g.fillRoundedRect(left + 32, top + 42, w - 64, 32, 10)

        // Tampo grosso, com a linha clara em cima
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(left - 8, top - 8, w + 16, 68, 20)
        g.fillStyle(0x9a6a3c, 1)
        g.fillRoundedRect(left, top, w, 52, 16)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(left, top, w, 34, 16)
        g.fillStyle(C.white, 0.26)
        g.fillRoundedRect(left + 22, top + 6, w - 44, 8, 4)
        root.add(g)
        table = g
    }

    return {
        show(backgroundKey: string) {
            root.removeAll(true)
            hero = null
            table = null

            if (scene.textures.exists(backgroundKey)) {
                const source = scene.textures.get(backgroundKey).getSourceImage()
                const scale = Math.max(W / source.width, H / source.height)
                const image = scene.add
                    .image(W / 2, H / 2, backgroundKey)
                    .setDisplaySize(source.width * scale, source.height * scale)
                    .setScrollFactor(0)
                root.add(image)
            } else {
                const g = scene.add.graphics().setScrollFactor(0)
                g.fillStyle(C.sky, 1)
                g.fillRect(0, 0, W, H)
                g.fillStyle(C.grass, 1)
                g.fillRect(0, 440, W, H - 440)
                root.add(g)
            }

            drawTable()

            if (scene.textures.exists('heroi')) {
                hero = scene.add
                    .image(PLAN.hero.x, PLAN.hero.feet, 'heroi', 0)
                    .setOrigin(0.5, HERO_ART.feet)
                    .setDisplaySize(
                        (HERO_ART.display * HERO_ART.frameW) / HERO_ART.frameH,
                        HERO_ART.display,
                    )
                    .setScrollFactor(0)
                root.add(hero)
            }
        },

        /** O herói reage: 0 parado, 7 comemorando, 9 entregando. */
        setHeroFrame(frame: number) {
            hero?.setFrame(frame)
        },

        heroPoint() {
            return { x: PLAN.hero.x, y: PLAN.hero.feet - HERO_ART.display * 0.62 }
        },

        setVisible(value: boolean) {
            root.setVisible(value)
        },

        /** A fase final usa o mesmo quintal, mas sem a mesa e sem o herói. */
        setSceneryVisible(value: boolean) {
            ;(table as Phaser.GameObjects.Image | null)?.setVisible(value)
            hero?.setVisible(value)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            hero = null
            table = null
            root.destroy(true)
        },
    }
}

export type Room = ReturnType<typeof createRoom>
