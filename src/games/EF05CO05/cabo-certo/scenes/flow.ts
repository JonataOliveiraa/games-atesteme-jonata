import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { TIMING } from '../data/timing'
import { C } from '../data/theme'
import type { Payload, Vec } from '../types'
import type { View } from './view'

/** A bolinha de informação, que corre pelos cabos com um rastro de luz. */
export interface Flow {
    travel(points: Vec[], payload: Payload, tone?: number): Promise<void>
    /** Onde está a bolinha mais nova, para a câmera acompanhar. */
    lead(): Vec | null
    clear(): void
    destroy(): void
}

export const PAYLOAD_COLOR: Record<Payload, number> = {
    texto: 0x6fd3ff,
    cursor: 0xffffff,
    foto: 0xffcf4a,
    voz: 0xf27fa6,
    musica: 0xb79cf0,
}

export function createFlow(scene: Phaser.Scene, view: View): Flow {
    const live = new Set<Phaser.GameObjects.GameObject>()
    const heads: Phaser.GameObjects.Arc[] = []

    const add = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        live.add(obj)
        view.world(obj)
        return obj
    }

    const drop = (obj: Phaser.GameObjects.GameObject) => {
        live.delete(obj)
        scene.tweens.killTweensOf(obj)
        obj.destroy()
    }

    return {
        travel(points, payload, tone) {
            if (points.length < 2) return Promise.resolve()
            const color = tone ?? PAYLOAD_COLOR[payload]
            const lengths = [0]
            for (let i = 1; i < points.length; i++) lengths.push(lengths[i - 1] + Phaser.Math.Distance.BetweenPoints(points[i - 1], points[i]))
            const total = lengths[lengths.length - 1]
            const at = (d: number): Vec => {
                let i = 1
                while (i < lengths.length - 1 && lengths[i] < d) i++
                const seg = lengths[i] - lengths[i - 1] || 1
                const t = Phaser.Math.Clamp((d - lengths[i - 1]) / seg, 0, 1)
                return {
                    x: Phaser.Math.Linear(points[i - 1].x, points[i].x, t),
                    y: Phaser.Math.Linear(points[i - 1].y, points[i].y, t),
                }
            }
            const halo = add(scene.add.circle(points[0].x, points[0].y, 22, color, 0.35).setDepth(DEPTH.packet))
            const core = add(scene.add.circle(points[0].x, points[0].y, 12, color, 1).setDepth(DEPTH.packet + 1))
            core.setStrokeStyle(4, C.white, 1)
            heads.push(core)
            const k = { d: 0 }
            let lastTrail = 0
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    d: total,
                    duration: FX.ms(scene, (total / TIMING.packet) * 1000),
                    ease: 'Linear',
                    onUpdate: () => {
                        const p = at(k.d)
                        halo.setPosition(p.x, p.y)
                        core.setPosition(p.x, p.y)
                        if (k.d - lastTrail > 26) {
                            lastTrail = k.d
                            const dot = add(scene.add.circle(p.x, p.y, 7, color, 0.8).setDepth(DEPTH.packet - 1))
                            scene.tweens.add({ targets: dot, alpha: 0, scale: 0.3, duration: 420, onComplete: () => drop(dot) })
                        }
                    },
                    onComplete: () => {
                        heads.splice(heads.indexOf(core), 1)
                        drop(halo)
                        drop(core)
                        resolve()
                    },
                })
            })
        },
        lead() {
            const head = heads[heads.length - 1]
            return head ? { x: head.x, y: head.y } : null
        },
        clear() {
            heads.length = 0
            ;[...live].forEach(drop)
        },
        destroy() {
            heads.length = 0
            ;[...live].forEach(drop)
        },
    }
}
