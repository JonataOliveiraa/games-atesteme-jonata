import Phaser from 'phaser'
import { PROP, P_PROP_CULL, P_PROP_SPAWN, W, depthOf, pOf, xOf, yOf, zOf } from '../data/layout'
import { C } from '../data/theme'

interface Prop {
    image: Phaser.GameObjects.Image
    z: number
    wx: number
    scale: number
    fade: number
}

const FALLBACK_HOUSE = 'ccot-prop-casa'
const FALLBACK_BUSH = 'ccot-prop-moita'
const TUFT = 'ccot-prop-tufo'

function ensureTextures(scene: Phaser.Scene) {
    if (!scene.textures.exists('casa') && !scene.textures.exists(FALLBACK_HOUSE)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.ink, 1)
        g.fillRect(10, 90, 320, 146)
        g.fillStyle(C.cream, 1)
        g.fillRect(22, 102, 296, 122)
        g.fillStyle(C.warnDark, 1)
        g.fillTriangle(0, 96, 170, 8, 340, 96)
        g.generateTexture(FALLBACK_HOUSE, 340, 240)
        g.destroy()
    }
    if (!scene.textures.exists('moita') && !scene.textures.exists(FALLBACK_BUSH)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.grassDark, 1)
        g.fillEllipse(170, 160, 300, 150)
        g.fillStyle(C.grass, 1)
        g.fillEllipse(150, 130, 210, 120)
        g.generateTexture(FALLBACK_BUSH, 340, 240)
        g.destroy()
    }
    if (!scene.textures.exists(TUFT)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.grassDark, 1)
        for (const [x, h, w] of [[40, 120, 26], [86, 156, 30], [134, 110, 24], [174, 140, 28]] as const) {
            g.fillTriangle(x, 200, x + w, 200, x + w / 2, 200 - h)
        }
        g.fillStyle(C.grass, 1)
        for (const [x, h, w] of [[52, 92, 18], [98, 122, 20], [146, 84, 18]] as const) {
            g.fillTriangle(x, 200, x + w, 200, x + w / 2, 200 - h)
        }
        g.generateTexture(TUFT, 220, 200)
        g.destroy()
    }
}

export function createProps(scene: Phaser.Scene) {
    ensureTextures(scene)

    const houseKey = scene.textures.exists('casa') ? 'casa' : FALLBACK_HOUSE
    const bushKey = scene.textures.exists('moita') ? 'moita' : FALLBACK_BUSH
    const houseBase = houseKey === 'casa' ? PROP.houseBase : 1
    const bushBase = bushKey === 'moita' ? PROP.bushBase : 1

    const zSpawn = zOf(P_PROP_SPAWN)
    const live: Prop[] = []
    const idle: Prop[] = []
    let side = 1
    let untilNext = 0

    const spawn = (fade: number) => {
        side *= -1
        const roll = Math.random()
        const house = roll < 0.34
        const bush = !house && roll < 0.72

        const key = house ? houseKey : bush ? bushKey : TUFT
        const base = house ? houseBase : bush ? bushBase : 1
        const range = house ? PROP.houseWX : bush ? PROP.bushWX : ([470, 560] as const)
        const scale = house ? PROP.houseScale : bush ? PROP.bushScale : 0.55
        const wx = side * Phaser.Math.Between(range[0], range[1])

        const prop = idle.pop()
        if (prop) {
            prop.image.setTexture(key).setOrigin(0.5, base).setVisible(true)
            prop.z = zSpawn
            prop.wx = wx
            prop.scale = scale
            prop.fade = fade
            prop.image.setFlipX(house && wx > 0)
            prop.image.setAlpha(fade > 0 ? 0 : 1)
            live.push(prop)
            return
        }

        const image = scene.add.image(0, 0, key).setOrigin(0.5, base)
        image.setFlipX(house && wx > 0)
        if (fade > 0) image.setAlpha(0)
        live.push({ image, z: zSpawn, wx, scale, fade })
    }

    for (let i = 0; i < 5; i++) {
        spawn(0)
        live[live.length - 1].z = zSpawn - i * PROP.gapZ
    }

    return {
        advance(dz: number, dt: number) {
            untilNext -= dz
            while (untilNext <= 0) {
                spawn(1)
                untilNext += PROP.gapZ
            }

            for (let i = live.length - 1; i >= 0; i--) {
                const prop = live[i]
                prop.z -= dz

                const p = pOf(prop.z)
                const x = xOf(p, prop.wx)

                if (p > P_PROP_CULL || x < -520 || x > W + 520) {
                    prop.image.setVisible(false)
                    live.splice(i, 1)
                    if (idle.length < 12) idle.push(prop)
                    else prop.image.destroy()
                    continue
                }

                prop.image.setPosition(x, yOf(p))
                prop.image.setScale(p * prop.scale)
                prop.image.setDepth(depthOf(p))

                if (prop.fade > 0) {
                    prop.fade -= dt * 2.2
                    if (prop.fade < 0) prop.fade = 0
                    prop.image.setAlpha(1 - prop.fade)
                }
            }
        },

        destroy() {
            live.forEach(prop => prop.image.destroy())
            idle.forEach(prop => prop.image.destroy())
            live.length = 0
            idle.length = 0
        },
    }
}

export type Props = ReturnType<typeof createProps>
