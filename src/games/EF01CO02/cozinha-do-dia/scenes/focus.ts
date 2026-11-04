import Phaser from 'phaser'
import { DEPTH, FOCUS } from '../data/layout'
import { C } from '../data/theme'

const KEY = 'cdd-vignette'
const SIZE = 512
const FAR = 4096

export interface Focus {
    show(x: number, y: number, radius: number, strength: number): void
    follow(x: number): void
    hide(): void
    destroy(): void
}

function ensureTexture(scene: Phaser.Scene) {
    if (scene.textures.exists(KEY)) return
    const canvas = scene.textures.createCanvas(KEY, SIZE, SIZE)
    if (!canvas) return
    const ctx = canvas.getContext()
    const r = SIZE / 2
    const gradient = ctx.createRadialGradient(r, r, r / FOCUS.reach, r, r, r)
    const tone = Phaser.Display.Color.IntegerToRGB(C.shadow)
    const rgb = `${tone.r},${tone.g},${tone.b}`
    gradient.addColorStop(0, `rgba(${rgb},0)`)
    gradient.addColorStop(1, `rgba(${rgb},1)`)
    ctx.fillStyle = `rgb(${rgb})`
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(r, r, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, SIZE, SIZE)
    canvas.refresh()
}

export function createFocus(scene: Phaser.Scene): Focus {
    ensureTexture(scene)
    const half = SIZE / 2
    const edge = (x: number, y: number, w: number, h: number) => scene.add.rectangle(x, y, w, h, C.shadow, 1)
    const ring = scene.add.container(0, 0, [
        scene.add.image(0, 0, KEY),
        edge(0, -half - FAR / 2, FAR * 2 + SIZE, FAR),
        edge(0, half + FAR / 2, FAR * 2 + SIZE, FAR),
        edge(-half - FAR / 2, 0, FAR, SIZE),
        edge(half + FAR / 2, 0, FAR, SIZE),
    ])
    ring.setDepth(DEPTH.fx + 4).setAlpha(0).setVisible(false)

    return {
        show(x, y, radius, strength) {
            scene.tweens.killTweensOf(ring)
            const scale = (radius * FOCUS.reach * 2) / SIZE
            if (!ring.visible) ring.setVisible(true).setPosition(x, y).setScale(scale)
            scene.tweens.add({ targets: ring, x, y, scale, alpha: strength, duration: FOCUS.fade, ease: 'Sine.easeOut' })
        },
        follow(x) {
            ring.x += (x - ring.x) * FOCUS.followShare
        },
        hide() {
            scene.tweens.killTweensOf(ring)
            scene.tweens.add({
                targets: ring,
                alpha: 0,
                duration: FOCUS.fade,
                ease: 'Sine.easeIn',
                onComplete: () => ring.setVisible(false),
            })
        },
        destroy() {
            scene.tweens.killTweensOf(ring)
            ring.destroy()
        },
    }
}
