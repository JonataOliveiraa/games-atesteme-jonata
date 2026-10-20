import Phaser from 'phaser'
import { DEPTH } from '../data/layout'
import type { Vec } from '../types'

export type Layer = 'platform' | 'summit' | 'item' | 'phone' | 'cloud' | 'fx'

export interface View {
    add<T extends Phaser.GameObjects.GameObject>(obj: T, layer: Layer): T
    top(): number
    setTop(y: number): void
    panTo(y: number, ms: number): Promise<void>
    toScreen(at: Vec): Vec
    destroy(): void
}

export function createView(scene: Phaser.Scene, startTop: number): View {
    const layers: Record<Layer, Phaser.GameObjects.Container> = {
        platform: scene.add.container(0, 0).setDepth(DEPTH.platform),
        summit: scene.add.container(0, 0).setDepth(DEPTH.summit),
        item: scene.add.container(0, 0).setDepth(DEPTH.item),
        phone: scene.add.container(0, 0).setDepth(DEPTH.phone),
        cloud: scene.add.container(0, 0).setDepth(DEPTH.cloud),
        fx: scene.add.container(0, 0).setDepth(DEPTH.fx),
    }
    let top = startTop

    const apply = () => Object.values(layers).forEach(c => c.setY(-top))
    apply()

    return {
        add(obj, layer) {
            layers[layer].add(obj)
            return obj
        },
        top: () => top,
        setTop(y) {
            top = y
            apply()
        },
        panTo(y, ms) {
            const k = { top }
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    top: y,
                    duration: ms,
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        top = k.top
                        apply()
                    },
                    onComplete: () => resolve(),
                })
            })
        },
        toScreen: at => ({ x: at.x, y: at.y - top }),
        destroy() {
            Object.values(layers).forEach(c => c.destroy())
        },
    }
}
