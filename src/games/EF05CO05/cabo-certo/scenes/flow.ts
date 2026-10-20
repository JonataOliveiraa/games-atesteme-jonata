import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PACKET } from '../data/layout'
import { TIMING } from '../data/timing'
import { C } from '../data/theme'
import type { Payload, Vec } from '../types'
import type { View } from './view'

/**
 * A bolinha de informação, que corre pelos cabos. Ela é um disco com o desenho
 * do que leva (letras, voz, música, foto, a setinha do mouse), e o cabo por
 * onde passou acende atrás dela, como um rastro de luz. Sai do aparelho com um
 * pulinho, freia antes de cada parada e é engolida por quem a recebe.
 */
export interface Flow {
    travel(points: Vec[], payload: Payload, tone?: number): Promise<void>
    /** Onde está a bolinha mais nova, para a câmera e o foco acompanharem. */
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

/** A cor do desenho dentro do disco branco: a do rastro, mais escura. */
const PAYLOAD_INK: Record<Payload, number> = {
    texto: 0x1f63ad,
    cursor: C.ink,
    foto: 0x8a5a00,
    voz: 0xc23d72,
    musica: 0x7650c2,
}

/** O desenho do que a bolinha leva, em volta de (0, 0), para um disco de raio ~20. */
function paintPayload(g: Phaser.GameObjects.Graphics, payload: Payload) {
    const ink = PAYLOAD_INK[payload]
    if (payload === 'texto') {
        g.fillStyle(ink, 1)
        g.fillRoundedRect(-10, -8, 20, 4, 2)
        g.fillRoundedRect(-10, -2, 20, 4, 2)
        g.fillRoundedRect(-10, 4, 12, 4, 2)
        return
    }
    if (payload === 'cursor') {
        g.fillStyle(ink, 1)
        g.fillTriangle(-6, -11, -6, 7, 7, 3)
        g.fillTriangle(-1, 3, 3, 1, 4, 11)
        return
    }
    if (payload === 'foto') {
        g.fillStyle(0x8fd3ff, 1)
        g.fillRoundedRect(-11, -9, 22, 18, 4)
        g.fillStyle(C.plantDark, 1)
        g.fillTriangle(-9, 7, -2, -3, 5, 7)
        g.fillStyle(C.accentYellow, 1)
        g.fillCircle(5, -3, 3.5)
        return
    }
    if (payload === 'voz') {
        g.fillStyle(ink, 1)
        ;[
            [-9, 6],
            [-3, 16],
            [3, 11],
            [9, 5],
        ].forEach(([x, h]) => g.fillRoundedRect(x - 2, -h / 2, 4, h, 2))
        return
    }
    g.fillStyle(ink, 1)
    g.fillCircle(-3, 6, 5)
    g.fillRect(0.5, -10, 3, 16)
    g.fillTriangle(3.5, -10, 10, -4, 3.5, -3)
}

export function createFlow(scene: Phaser.Scene, view: View): Flow {
    const live = new Set<Phaser.GameObjects.GameObject>()
    const heads: Phaser.GameObjects.Container[] = []

    const add = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        live.add(obj)
        view.world(obj)
        return obj
    }

    const drop = (obj: Phaser.GameObjects.GameObject) => {
        live.delete(obj)
        scene.tweens.killTweensOf(obj)
        if (obj instanceof Phaser.GameObjects.Container) scene.tweens.killTweensOf(obj.list)
        obj.destroy()
    }

    /** O rastro: os últimos pontos da bolinha, do mais velho (fino e apagado) ao mais novo. */
    const paintTrail = (g: Phaser.GameObjects.Graphics, pts: Vec[], color: number, fade = 1) => {
        g.clear()
        const n = pts.length
        for (let i = 1; i < n; i++) {
            const k = i / (n - 1)
            g.lineStyle(6 + 18 * k, color, 0.5 * k * fade)
            g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y)
            g.lineStyle(3 + 5 * k, C.white, 0.7 * k * fade)
            g.lineBetween(pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y)
        }
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
            const start = points[0]
            const trail = add(scene.add.graphics().setDepth(DEPTH.packet - 1))
            const halo = add(scene.add.circle(start.x, start.y, PACKET.halo, color, 0.32).setDepth(DEPTH.packet))
            const disc = scene.add.graphics()
            disc.fillStyle(C.shadow, 0.2)
            disc.fillCircle(2, 4, PACKET.r)
            disc.fillStyle(color, 1)
            disc.fillCircle(0, 0, PACKET.r)
            disc.fillStyle(C.white, 1)
            disc.fillCircle(0, 0, PACKET.r - PACKET.ring)
            const icon = scene.add.graphics()
            paintPayload(icon, payload)
            const body = add(scene.add.container(start.x, start.y, [disc, icon]).setDepth(DEPTH.packet + 1))
            heads.push(body)
            body.setScale(0.2)
            void FX.to(scene, body, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
            scene.tweens.add({ targets: halo, scale: 1.35, alpha: 0.16, duration: 300, yoyo: true, repeat: -1 })

            const past: Vec[] = [{ ...start }]
            const k = { d: 0 }
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    d: total,
                    duration: FX.ms(scene, Math.max(420, (total / TIMING.packet) * 1000)),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        if (!body.active) return
                        const p = at(k.d)
                        halo.setPosition(p.x, p.y)
                        body.setPosition(p.x, p.y)
                        const last = past[past.length - 1]
                        if (Phaser.Math.Distance.BetweenPoints(last, p) > 8) {
                            past.push(p)
                            if (past.length > PACKET.trail) past.shift()
                        }
                        paintTrail(trail, [...past, p], color)
                    },
                    onComplete: () => {
                        const i = heads.indexOf(body)
                        if (i >= 0) heads.splice(i, 1)
                        if (!body.active) {
                            resolve()
                            return
                        }
                        // Quem recebe engole a bolinha; o rastro apaga devagar atrás dela.
                        scene.tweens.killTweensOf(halo)
                        scene.tweens.add({
                            targets: [body, halo],
                            scale: 0,
                            duration: 160,
                            ease: 'Back.easeIn',
                            onComplete: () => {
                                drop(body)
                                drop(halo)
                            },
                        })
                        const fade = { v: 1 }
                        scene.tweens.add({
                            targets: fade,
                            v: 0,
                            duration: 380,
                            onUpdate: () => {
                                if (trail.active) paintTrail(trail, past, color, fade.v)
                            },
                            onComplete: () => drop(trail),
                        })
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
