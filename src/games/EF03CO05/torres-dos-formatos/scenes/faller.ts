import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, FALLER, LANE } from '../data/layout'
import { C, FORMAT, NINJA_ROW } from '../data/theme'
import { formatOfFile } from '../data/levels'
import type { FileDef } from '../types'

/** Reserva: sem `arquivo-criatura.png`, um papel colorido com olhos. */
function drawStandIn(g: Phaser.GameObjects.Graphics, tint: number, deep: number, size: number) {
    const w = size * 0.64
    const h = size * 0.86
    g.fillStyle(deep, 1)
    g.fillRoundedRect(-w / 2, -h, w, h, 20)
    g.fillStyle(tint, 1)
    g.fillRoundedRect(-w / 2 + 5, -h + 5, w - 10, h - 12, 16)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-w * 0.16, -h * 0.78, 7)
    g.fillCircle(w * 0.16, -h * 0.78, 7)
}

/**
 * O arquivo que cai. Um de cada vez: a criança olha a estrutura no painel
 * dele, escolhe a pista e o vê pousar — decisão, gesto e consequência no
 * mesmo lugar.
 */
/**
 * As duas folhas desenham OS MESMOS quatro formatos com bichos diferentes: som
 * é alto-falante numa e megafone na outra, texto é folha de linhas numa e
 * envelope na outra. Sortear entre elas a cada arquivo diz, sem uma palavra,
 * que o formato não é o desenho — é o jeito como o dado está guardado.
 */
const SKINS = ['arquivo-criatura', 'arquivo-criatura-2']

export function createFaller(scene: Phaser.Scene) {
    const skins = SKINS.filter(key => scene.textures.exists(key))
    const hasArt = skins.length > 0
    /** A quinta linha só existe na primeira folha; sem ela, o disfarce é tinta. */
    const hasNinjaRow =
        scene.textures.exists(SKINS[0]) && scene.textures.get(SKINS[0]).has(String(NINJA_ROW * 4))
    /** Quanto do nível vem com a segunda cara. Ver `skinTwo` em levels.ts. */
    let skinTwoChance = 0.2
    const pickSkin = () => {
        if (skins.length < 2) return skins[0] ?? SKINS[0]
        return Math.random() < skinTwoChance ? SKINS[1] : SKINS[0]
    }

    let root: Phaser.GameObjects.Container | null = null
    let sprite: Phaser.GameObjects.Image | null = null
    let def: FileDef | null = null
    let hidden = false
    let sheetKey = SKINS[0]
    let lane = 0
    let flip = false
    let step = 0
    let sliding = false

    const rowOf = () =>
        hidden && hasNinjaRow ? NINJA_ROW : def ? FORMAT[formatOfFile(def)].creature : 0
    const frameOf = (pose: number) => rowOf() * 4 + pose

    const clear = () => {
        if (!root) return
        scene.tweens.killTweensOf(root)
        root.destroy(true)
        root = null
        sprite = null
        def = null
        hidden = false
    }

    return {
        /** Nasce em cima da pista `at`, já mostrando como os dados estão. */
        drop(file: FileDef, at: number, x: number) {
            clear()
            def = file
            hidden = !!file.ninja
            // O ninja mora na primeira folha; revelado, ele sorteia como todos.
            sheetKey = hidden ? SKINS[0] : pickSkin()
            lane = at
            flip = false
            step = 0

            const size = FALLER.size
            const container = scene.add.container(x, LANE.spawnY).setDepth(DEPTH.faller)
            const skin = FORMAT[formatOfFile(file)]

            sprite = hasArt
                ? scene.add
                      .image(0, 0, sheetKey, frameOf(0))
                      .setOrigin(0.5, FALLER.originY)
                      .setDisplaySize(size, size)
                : null
            if (hidden && !hasNinjaRow) sprite?.setTint(0x53627a)
            if (sprite) container.add(sprite)
            else {
                const g = scene.add.graphics()
                drawStandIn(g, skin.tint, skin.deep, size)
                container.add(g)
            }

            root = container
            container.setScale(0.6).setAlpha(0)
            void FX.to(scene, container, { scale: 1, alpha: 1 }, { duration: 280, ease: 'Back.easeOut' })
        },

        setSkinChance(chance: number) {
            skinTwoChance = Phaser.Math.Clamp(chance, 0, 1)
        },

        get file() {
            return def
        },

        get hidden() {
            return hidden
        },

        get lane() {
            return lane
        },

        get busy() {
            return sliding
        },

        get y() {
            return root?.y ?? 0
        },

        fall(dy: number) {
            if (!root) return
            root.y += dy
            step += dy
            if (step > 26) {
                step = 0
                flip = !flip
                sprite?.setFrame(frameOf(flip ? 1 : 0))
            }
        },

        /** Um toque, uma pista. O deslize é curto para o gesto ficar direto. */
        async slide(to: number, x: number) {
            if (!root || sliding) return
            sliding = true
            lane = to
            await FX.to(scene, root, { x }, { duration: LANE.slideMs, ease: 'Sine.easeOut' })
            sliding = false
        },

        /** Pousou certo: pulinho contente e some dentro da caixa. */
        async land(to: { x: number; y: number }) {
            if (!root) return
            sprite?.setFrame(frameOf(2))
            await FX.to(scene, root, { y: root.y - 22 }, { duration: 150, ease: 'Sine.easeOut' })
            await FX.to(
                scene,
                root,
                { x: to.x, y: to.y, scale: 0.34, alpha: 0 },
                { duration: 420, ease: 'Sine.easeIn' },
            )
            clear()
        },

        /** Pousou na caixa errada: para em cima dela e espera a correção. */
        stall() {
            if (!root) return
            sprite?.setFrame(frameOf(3))
            void FX.shake(scene, root, { times: 3, amount: 10 })
        },

        /**
         * O disfarce cai: fumaça, a criatura vira o formato sorteado e a
         * estrutura aparece. É aqui que a decisão da criança começa.
         */
        async reveal(pick: FileDef) {
            if (!root || !hidden) return
            hidden = false
            def = pick

            void FX.sparks(scene, root.x, root.y - FALLER.size * 0.5, {
                color: C.white,
                count: 22,
                spread: 170,
            })
            await FX.to(scene, root, { scale: 1.16 }, { duration: 130, ease: 'Back.easeOut' })

            sheetKey = pickSkin()
            sprite?.clearTint()
            sprite?.setTexture(sheetKey, frameOf(0))

            await FX.to(scene, root, { scale: 1 }, { duration: 180 })
        },

        pos() {
            return { x: root?.x ?? 640, y: root?.y ?? LANE.spawnY }
        },

        clear,

        destroy() {
            clear()
        },
    }
}

export type Faller = ReturnType<typeof createFaller>
