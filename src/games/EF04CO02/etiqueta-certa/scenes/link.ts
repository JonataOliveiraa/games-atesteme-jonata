import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import { fade } from './art'

type Point = { x: number; y: number }

const GAP = 20
const DOT = 6

export interface Link {
    /** desenha a linha de pontinhos crescendo ao longo do caminho */
    draw(path: Point[], duration?: number): Promise<void>
    /** recolhe a última linha */
    retract(duration?: number): Promise<void>
    clear(): void
    /** some com a placa e a etiqueta enquanto a criança arrasta o pátio */
    setShown(on: boolean): void
    destroy(): void
}

export function createLink(scene: Phaser.Scene): Link {
    let lines: Phaser.GameObjects.Graphics[] = []
    let shown = true

    const total = (path: Point[]) => path.slice(1).reduce((sum, p, i) => sum + Phaser.Math.Distance.BetweenPoints(path[i], p), 0)

    /** os pontinhos caem sempre no mesmo passo ao longo do caminho, mesmo nas curvas */
    const paint = (g: Phaser.GameObjects.Graphics, path: Point[], t: number) => {
        g.clear()
        const reach = total(path) * t
        let walked = 0
        let next = 0
        for (let i = 1; i < path.length; i++) {
            const a = path[i - 1]
            const b = path[i]
            const len = Phaser.Math.Distance.BetweenPoints(a, b)
            while (next <= walked + len && next <= reach) {
                const k = len ? (next - walked) / len : 0
                const x = Phaser.Math.Linear(a.x, b.x, k)
                const y = Phaser.Math.Linear(a.y, b.y, k)
                g.fillStyle(C.white, 1)
                g.fillCircle(x, y, DOT + 3)
                g.fillStyle(C.link, 1)
                g.fillCircle(x, y, DOT)
                next += GAP
            }
            walked += len
        }
    }

    const tween = (g: Phaser.GameObjects.Graphics, path: Point[], a: number, b: number, duration: number) =>
        new Promise<void>(resolve => {
            const s = { t: a }
            scene.tweens.add({
                targets: s,
                t: b,
                duration: FX.ms(scene, duration),
                ease: 'Sine.easeInOut',
                onUpdate: () => g.active && paint(g, path, s.t),
                onComplete: () => resolve(),
                onStop: () => resolve(),
            })
        })

    const ends = new Map<Phaser.GameObjects.Graphics, Point[]>()

    return {
        async draw(path, duration = 520) {
            const g = scene.add.graphics().setDepth(DEPTH.fx).setScrollFactor(0).setAlpha(shown ? 1 : 0)
            lines.push(g)
            ends.set(g, path)
            await tween(g, path, 0, 1, duration)
        },
        async retract(duration = 260) {
            const g = lines.pop()
            if (!g) return
            await tween(g, ends.get(g) ?? [], 1, 0, duration)
            ends.delete(g)
            g.destroy()
        },
        clear() {
            lines.forEach(g => {
                scene.tweens.killTweensOf(g)
                g.destroy()
            })
            lines = []
            ends.clear()
        },
        setShown(on) {
            shown = on
            lines.forEach(g => fade(scene, g, on ? 1 : 0))
        },
        destroy() {
            this.clear()
        },
    }
}
