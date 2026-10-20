import Phaser from 'phaser'
import { STARS_KEY } from '../data/files'
import { DEPTH, H, W } from '../data/layout'
import { COMET, DECOR, SKIES, STARS, type Decor } from '../data/scenery'

export interface Backdrop {
    update(top: number, time: number): number
    destroy(): void
}

const smooth = (from: number, to: number, v: number) => {
    const t = Phaser.Math.Clamp((v - from) / (to - from), 0, 1)
    return t * t * (3 - 2 * t)
}

const WRAP = 320

export function createBackdrop(scene: Phaser.Scene, altOf: (y: number) => number): Backdrop {
    const skies = SKIES.map(s => scene.add.image(0, 0, s.key).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.sky).setVisible(false))
    const stars = scene.add.tileSprite(0, 0, W, H, STARS_KEY).setOrigin(0).setDepth(DEPTH.stars).setAlpha(0)

    const decor = DECOR.map((d: Decor) => {
        const img = scene.add
            .image(d.x, 0, d.key)
            .setOrigin(0.5, d.originY ?? 1)
            .setScale(d.scale ?? 1)
            .setFlipX(!!d.flip)
            .setDepth(DEPTH[d.layer])
            .setVisible(false)
        return { d, img }
    })

    const comet = scene.add.image(-400, 0, 'cometa').setDepth(DEPTH.far).setVisible(false)
    let nextComet = 0

    const fadeOf = (d: Decor, alt: number) => {
        if (!d.fade) return 1
        const [a, b, c, e] = d.fade
        return smooth(a, b, alt) * (1 - smooth(c, e, alt))
    }

    return {
        update(top, time) {
            const alt = altOf(top + H)

            let i = 0
            while (i < SKIES.length - 1 && alt >= SKIES[i + 1].at) i++
            const next = Math.min(i + 1, SKIES.length - 1)
            const t = next === i ? 0 : smooth(SKIES[i].at, SKIES[next].at, alt)
            skies.forEach((img, k) => {
                const on = k === i || (k === next && t > 0)
                img.setVisible(on)
                if (on) img.setAlpha(k === i ? 1 : t)
            })
            skies[next].setDepth(DEPTH.sky + 0.5)
            skies[i].setDepth(DEPTH.sky)

            const starAlpha = smooth(STARS.from, STARS.to, alt)
            stars.setVisible(starAlpha > 0).setAlpha(starAlpha)
            stars.tilePositionY = -alt * STARS.parallax

            decor.forEach(({ d, img }) => {
                const y = H - (d.at - alt) * d.k
                const h = img.displayHeight
                const above = y - h * (d.originY ?? 1)
                const alpha = (d.alpha ?? 1) * fadeOf(d, alt)
                const on = alpha > 0.01 && above < H && above + h > 0
                img.setVisible(on)
                if (!on) return
                let x = d.x
                if (d.drift) x = Phaser.Math.Wrap(d.x + (d.drift * time) / 1000, -WRAP, W + WRAP)
                img.setPosition(x, y).setAlpha(alpha)
            })

            if (!nextComet) nextComet = time + COMET.every[0]
            if (alt >= COMET.from && time >= nextComet && !comet.visible) {
                const y = Phaser.Math.Between(150, 330)
                comet.setPosition(-300, y).setRotation(0.08).setVisible(true).setAlpha(0.95)
                scene.tweens.add({
                    targets: comet,
                    x: W + 300,
                    y: y + 140,
                    duration: 2600,
                    onComplete: () => comet.setVisible(false),
                })
                nextComet = time + Phaser.Math.Between(COMET.every[0], COMET.every[1])
            }
            if (alt < COMET.from && comet.visible) {
                scene.tweens.killTweensOf(comet)
                comet.setVisible(false)
            }
            return alt
        },
        destroy() {
            scene.tweens.killTweensOf(comet)
            comet.destroy()
            skies.forEach(s => s.destroy())
            stars.destroy()
            decor.forEach(({ img }) => img.destroy())
        },
    }
}
