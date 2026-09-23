import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, FIELD } from '../data/layout'
import { C } from '../data/theme'
import { showCareRibbon } from './seal'

const darker = (color: number, amount = 26) =>
    Phaser.Display.Color.IntegerToColor(color).darken(amount).color

function drawBubble(scene: Phaser.Scene, x: number, y: number, radius: number, color: number) {
    const rim = darker(color, 22)
    const g = scene.add.graphics({ x, y }).setDepth(DEPTH.bubble)
    g.fillStyle(color, 0.32)
    g.fillCircle(0, 0, radius)
    g.lineStyle(6, color, 0.95)
    g.strokeCircle(0, 0, radius)
    g.lineStyle(3, C.white, 0.85)
    g.strokeCircle(0, 0, radius - 9)
    g.lineStyle(2, rim, 0.5)
    g.strokeCircle(0, 0, radius + 3)
    g.fillStyle(C.white, 0.8)
    g.fillEllipse(-radius * 0.36, -radius * 0.42, radius * 0.5, radius * 0.3)
    g.fillCircle(radius * 0.34, -radius * 0.5, radius * 0.1)
    return g
}

function trail(scene: Phaser.Scene, from: Phaser.GameObjects.Graphics, color: number) {
    for (let i = 0; i < 7; i++) {
        scene.time.delayedCall(120 * i + 240, () => {
            if (!from.active) return
            const radius = Phaser.Math.Between(6, 14)
            const dot = drawBubble(
                scene,
                from.x + Phaser.Math.Between(-34, 34),
                from.y + FIELD.item * 0.4,
                radius,
                color,
            )
            dot.setDepth(DEPTH.bubble - 1)
            void FX.to(scene, dot, { y: dot.y + 70, alpha: 0, scale: 0.5 }, { duration: 780 })
                .then(() => dot.destroy())
        })
    }
}

export async function captureAndRise(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.Container,
    strong: boolean,
    careText: string,
    color: number,
) {
    const radius = FIELD.item * (strong ? 0.72 : 0.64)
    const bubble = drawBubble(scene, target.x, target.y, radius, color)
    bubble.setScale(0.25).setAlpha(0)

    await FX.to(scene, bubble, { scale: 1, alpha: 1 }, { duration: 240, ease: Ease.back(2.2) })

    // O recado fica PARADO onde o perigo estava; só a bolha sobe. Ele não é
    // esperado aqui: some sozinho, depois de dar tempo de ler.
    void showCareRibbon(scene, target.x, target.y + FIELD.item * 0.2, careText, { delay: 200 })

    trail(scene, bubble, color)

    const drift = Phaser.Math.Between(-40, 40)
    const top = -FIELD.item

    await FX.all(
        FX.to(scene, bubble, { y: top, x: bubble.x + drift }, { duration: 1000, ease: Ease.smooth }),
        FX.to(scene, target, { y: top, x: target.x + drift }, { duration: 1000, ease: Ease.smooth }),
    )

    bubble.destroy()
}

export async function popAt(scene: Phaser.Scene, x: number, y: number, color: number) {
    const radius = FIELD.item * 0.6
    const bubble = drawBubble(scene, x, y, radius, color)
    bubble.setScale(0.3).setAlpha(0)

    await FX.to(scene, bubble, { scale: 1, alpha: 1 }, { duration: 150, ease: Ease.back(2) })
    await FX.to(scene, bubble, { scale: 1.35, alpha: 0 }, { duration: 200 })
    bubble.destroy()

    await FX.sparks(scene, x, y, { color, count: 12, spread: 150, duration: 480, size: 8 })
}

export function riseFrom(scene: Phaser.Scene, x: number, y: number, colors: number[]) {
    for (let i = 0; i < 12; i++) {
        scene.time.delayedCall(70 * i, () => {
            const color = colors[i % colors.length]
            const radius = Phaser.Math.Between(10, 24)
            const dot = drawBubble(scene, x + Phaser.Math.Between(-140, 140), y, radius, color)
            dot.setDepth(DEPTH.fx)
            void FX.to(
                scene,
                dot,
                { y: y - Phaser.Math.Between(240, 420), x: dot.x + Phaser.Math.Between(-50, 50), alpha: 0 },
                { duration: Phaser.Math.Between(900, 1400), ease: Ease.smooth },
            ).then(() => dot.destroy())
        })
    }
}
