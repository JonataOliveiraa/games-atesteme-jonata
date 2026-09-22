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

const FALLBACK_CONE = 'ccot-prop-cone'
const FALLBACK_BUSH = 'ccot-prop-moita'
const TUFT = 'ccot-prop-tufo'

function ensureTextures(scene: Phaser.Scene) {
    if (!scene.textures.exists('cone') && !scene.textures.exists(FALLBACK_CONE)) {
        const g = scene.make.graphics({ x: 0, y: 0 }, false)
        g.fillStyle(C.trackEdge, 1)
        g.fillEllipse(256, 452, 300, 74)
        g.fillStyle(C.track, 1)
        g.fillEllipse(256, 438, 284, 68)
        g.fillTriangle(256, 40, 400, 438, 112, 438)
        g.fillStyle(C.cream, 1)
        g.fillTriangle(256, 178, 322, 360, 190, 360)
        g.generateTexture(FALLBACK_CONE, 512, 512)
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

    const coneKey = scene.textures.exists('cone') ? 'cone' : FALLBACK_CONE
    const bushKey = scene.textures.exists('moita') ? 'moita' : FALLBACK_BUSH
    const coneBase = coneKey === 'cone' ? PROP.coneBase : 1
    const bushBase = bushKey === 'moita' ? PROP.bushBase : 1

    const zSpawn = zOf(P_PROP_SPAWN)
    const live: Prop[] = []
    const idle: Prop[] = []
    let side = 1
    let untilNext = 0
    let row = 0

    const push = (key: string, base: number, wx: number, scale: number, fade: number) => {
        const prop = idle.pop()
        if (prop) {
            prop.image.setTexture(key).setOrigin(0.5, base).setVisible(true)
            prop.z = zSpawn
            prop.wx = wx
            prop.scale = scale
            prop.fade = fade
            prop.image.setFlipX(wx > 0)
            prop.image.setAlpha(fade > 0 ? 0 : 1)
            live.push(prop)
            return prop
        }

        const image = scene.add.image(0, 0, key).setOrigin(0.5, base)
        image.setFlipX(wx > 0)
        if (fade > 0) image.setAlpha(0)
        const fresh = { image, z: zSpawn, wx, scale, fade }
        live.push(fresh)
        return fresh
    }

    /** Uma fileira: um cone em cada beira, e de vez em quando verde bem mais longe. */
    const spawn = (fade: number) => {
        const jitter = Phaser.Math.Between(PROP.coneWX[0], PROP.coneWX[1])
        push(coneKey, coneBase, -jitter, PROP.coneScale, fade)
        push(coneKey, coneBase, Phaser.Math.Between(PROP.coneWX[0], PROP.coneWX[1]), PROP.coneScale, fade)

        row++
        if (row % 2 !== 0) return

        side *= -1
        const bush = Math.random() < 0.6
        const range = bush ? PROP.bushWX : PROP.tuftWX
        push(
            bush ? bushKey : TUFT,
            bush ? bushBase : 1,
            side * Phaser.Math.Between(range[0], range[1]),
            bush ? PROP.bushScale : PROP.tuftScale,
            fade,
        )
    }

    for (let i = 0; i < 6; i++) {
        const before = live.length
        spawn(0)
        for (let j = before; j < live.length; j++) live[j].z = zSpawn - i * PROP.gapZ
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
                    if (idle.length < 20) idle.push(prop)
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
