import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C } from '../data/theme'

const SHEET = 'itens'
const PETS = 'gato-e-peixe'

/** Quadros de `gato-e-peixe.png`. */
export const PET = { cat: 0, fish: 1 }

/** Ordem dos quadros em `itens.png`: problema em cima, resolvido embaixo. */
export const ITEM = {
    leafPile: 0,
    doughRaw: 1,
    boxClosed: 2,
    leafOne: 3,
    doughBaked: 4,
    boxOpen: 5,
}

export const hasItems = (scene: Phaser.Scene) => scene.textures.exists(SHEET)

/**
 * O sprite vai dentro de um container de escala 1.
 *
 * A escala do quadro é do desenho, não do objeto: com o sprite solto, um
 * `FX.to(leaf, { scale: 0.5 })` deixaria de encolher pela metade e passaria a
 * INCHAR a folha, porque 0.5 é maior que os 0.34 que o ajuste ao quadro pediu.
 */
export function itemBox(scene: Phaser.Scene, frame: number, box: number) {
    const root = scene.add.container(0, 0)
    const image = scene.add.image(0, 0, SHEET, frame)
    image.setScale(box / image.width)
    root.add(image)
    return { root, image }
}

function drawLeaf(scene: Phaser.Scene, color: number, size: number) {
    const root = scene.add.container(0, 0)
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillEllipse(0, 0, size * 1.55 + 7, size + 7)
    g.fillStyle(color, 1)
    g.fillEllipse(0, 0, size * 1.55, size)
    g.lineStyle(3, C.ink, 0.5)
    g.beginPath()
    g.moveTo(-size * 0.62, 0)
    g.lineTo(size * 0.62, 0)
    g.strokePath()
    root.add(g)
    return root
}

/**
 * Uma folha solta, para espalhar pela calçada.
 *
 * `tint` é MULTIPLICADO por cima do sprite, que já vem laranja — por isso os
 * valores usados são quase brancos. Sem a folha, o desenho em `Graphics` pinta
 * a cor cheia, e aí ela é a cor da folha.
 */
export function makeLeaf(scene: Phaser.Scene, box: number, tint?: number) {
    if (!hasItems(scene)) return drawLeaf(scene, C.leafA, box * 0.62)
    const { root, image } = itemBox(scene, ITEM.leafOne, box)
    if (tint && tint !== 0xffffff) image.setTint(tint)
    return root
}

export function makeLeafPile(scene: Phaser.Scene, box: number) {
    if (!hasItems(scene)) return drawLeaf(scene, C.leafB, box * 0.5)
    return itemBox(scene, ITEM.leafPile, box).root
}

/** A massa que doura: dois quadros sobrepostos, e `bake()` troca um pelo outro. */
export function makeBread(scene: Phaser.Scene, box: number) {
    const root = scene.add.container(0, 0)

    if (!hasItems(scene)) {
        const body = scene.add.graphics()
        const paint = (t: number) => {
            const w = 118 + t * 18
            const h = 50 + t * 16
            const mix = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(C.doughRaw),
                Phaser.Display.Color.ValueToColor(C.doughBaked),
                100,
                Phaser.Math.Clamp(t, 0, 1) * 100,
            )
            body.clear()
            body.fillStyle(C.ink, 1)
            body.fillEllipse(0, 0, w + 8, h + 8)
            body.fillStyle(Phaser.Display.Color.GetColor(mix.r, mix.g, mix.b), 1)
            body.fillEllipse(0, 0, w, h)
        }
        paint(0)
        root.add(body)

        return {
            root,
            bake: () => new Promise<void>(resolve => {
                const value = { t: 0 }
                scene.tweens.add({
                    targets: value,
                    t: 1,
                    duration: FX.ms(scene, 900),
                    ease: 'Sine.easeOut',
                    onUpdate: () => paint(value.t),
                    onComplete: () => resolve(),
                })
            }),
        }
    }

    const raw = scene.add.image(0, 0, SHEET, ITEM.doughRaw)
    const baked = scene.add.image(0, 0, SHEET, ITEM.doughBaked)
    raw.setScale(box / raw.width)
    baked.setScale(box / baked.width).setAlpha(0)
    root.add([raw, baked])

    return {
        root,
        async bake() {
            void FX.to(scene, root, { scale: 1.1 }, { duration: 420, yoyo: true, ease: Ease.back(1.6) })
            await Promise.all([
                FX.to(scene, baked, { alpha: 1 }, { duration: 620 }),
                FX.to(scene, raw, { alpha: 0 }, { duration: 620 }),
            ])
        },
    }
}

/** O pacote que o drone leva. `open()` mostra o petisco lá dentro. */
export function makeBox(scene: Phaser.Scene, box: number) {
    const root = scene.add.container(0, 0)

    if (!hasItems(scene)) {
        const g = scene.add.graphics()
        const half = box / 2
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-half - 4, -half - 4, box + 8, box + 8, 12)
        g.fillStyle(0xd9a465, 1)
        g.fillRoundedRect(-half, -half, box, box, 9)
        g.fillStyle(0xb87b3f, 1)
        g.fillRect(-6, -half, 12, box)
        g.fillRect(-half, -6, box, 12)
        root.add(g)
        return { root, open: () => FX.impact(scene, root, 0.24) }
    }

    const image = scene.add.image(0, 0, SHEET, ITEM.boxClosed)
    image.setScale(box / image.width)
    root.add(image)

    return {
        root,
        async open() {
            image.setFrame(ITEM.boxOpen)
            await FX.to(scene, root, { scale: 1.18 }, { duration: 200, yoyo: true, ease: Ease.back(2.4) })
        },
    }
}

function drawCat(scene: Phaser.Scene, box: number) {
    const cat = scene.add.container(0, 0)
    const g = scene.add.graphics()
    const fur = 0x9aa3ad
    const dark = 0x6f7885
    const s = box / 108

    g.lineStyle(11 * s, C.ink, 1)
    g.beginPath()
    g.arc(30 * s, 4 * s, 22 * s, Phaser.Math.DegToRad(-110), Phaser.Math.DegToRad(70), false)
    g.strokePath()
    g.lineStyle(7 * s, dark, 1)
    g.beginPath()
    g.arc(30 * s, 4 * s, 22 * s, Phaser.Math.DegToRad(-110), Phaser.Math.DegToRad(70), false)
    g.strokePath()

    g.fillStyle(C.ink, 1)
    g.fillEllipse(0, 8 * s, 56 * s, 48 * s)
    g.fillStyle(fur, 1)
    g.fillEllipse(0, 8 * s, 48 * s, 40 * s)

    g.fillStyle(C.ink, 1)
    g.fillTriangle(-24 * s, -32 * s, -8 * s, -32 * s, -19 * s, -52 * s)
    g.fillTriangle(24 * s, -32 * s, 8 * s, -32 * s, 19 * s, -52 * s)
    g.fillCircle(0, -24 * s, 27 * s)
    g.fillStyle(fur, 1)
    g.fillTriangle(-21 * s, -32 * s, -10 * s, -32 * s, -18 * s, -47 * s)
    g.fillTriangle(21 * s, -32 * s, 10 * s, -32 * s, 18 * s, -47 * s)
    g.fillCircle(0, -24 * s, 23 * s)

    g.fillStyle(C.ink, 1)
    g.fillCircle(-9 * s, -27 * s, 4 * s)
    g.fillCircle(9 * s, -27 * s, 4 * s)
    g.fillStyle(0xe2725b, 1)
    g.fillTriangle(-4 * s, -18 * s, 4 * s, -18 * s, 0, -13 * s)

    cat.add(g)
    return cat
}

/** O gatinho do telhado. */
export function makeCat(scene: Phaser.Scene, box: number) {
    if (!scene.textures.exists(PETS)) return drawCat(scene, box)
    const root = scene.add.container(0, 0)
    const image = scene.add.image(0, 0, PETS, PET.cat)
    image.setScale(box / image.width)
    root.add(image)
    return root
}

/**
 * O petisco do balão de desejo.
 *
 * Antes de chegar ele é um vulto: o mesmo peixe, apagado e sem cor. É o que
 * diz "ele quer isto" sem precisar de dois desenhos diferentes.
 */
export function makeFish(scene: Phaser.Scene, box: number) {
    const root = scene.add.container(0, 0)

    if (!scene.textures.exists(PETS)) {
        const g = scene.add.graphics()
        const s = box / 56
        const paint = (color: number) => {
            g.clear()
            g.fillStyle(C.ink, 1)
            g.fillEllipse(-3 * s, 0, 52 * s, 30 * s)
            g.fillTriangle(20 * s, 0, 34 * s, -13 * s, 34 * s, 13 * s)
            g.fillStyle(color, 1)
            g.fillEllipse(-3 * s, 0, 44 * s, 23 * s)
            g.fillTriangle(19 * s, 0, 30 * s, -10 * s, 30 * s, 10 * s)
        }
        paint(C.grey)
        root.add(g)
        return { root, grant: () => paint(0xf0a860) }
    }

    const image = scene.add.image(0, 0, PETS, PET.fish)
    image.setScale(box / image.width).setTint(0x8f98a6).setAlpha(0.5)
    root.add(image)

    return {
        root,
        grant() {
            image.clearTint()
            image.setAlpha(1)
        },
    }
}
