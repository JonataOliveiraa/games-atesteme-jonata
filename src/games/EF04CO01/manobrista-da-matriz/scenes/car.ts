import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAR, DRIVE, GATE, spotCenter } from '../data/layout'
import type { Cell } from '../types'
import { carImage } from './art'
import type { Rect, Yard } from './yard'

type Point = { x: number; y: number }

const STEER = Phaser.Math.DegToRad(DRIVE.maxSteer)
const PARK_ANGLE = Phaser.Math.DegToRad(DRIVE.parkAngle)

/** rumo 0 = nariz para cima; positivo gira no sentido do relógio */
const ahead = (h: number) => ({ x: Math.sin(h), y: -Math.cos(h) })

function circleHitsRect(cx: number, cy: number, r: number, rect: Rect) {
    const nx = Phaser.Math.Clamp(cx, rect.x, rect.x + rect.w)
    const ny = Phaser.Math.Clamp(cy, rect.y, rect.y + rect.h)
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r
}

/**
 * O carro dirigido: física própria e simples. Só vira enquanto anda; bater desfaz o
 * passo e para (nunca é erro).
 */
export function createCar(scene: Phaser.Scene, yard: Yard, color: number) {
    const image = carImage(scene, color, CAR.len)
    yard.add(image)
    const s: { x: number; y: number; h: number; v: number } = { x: GATE.x, y: GATE.startY, h: 0, v: 0 }
    const sync = () => image.setPosition(s.x, s.y).setRotation(s.h)
    sync()

    const hits = (x: number, y: number, h: number, rects: Rect[]) => {
        const d = ahead(h)
        return [-CAR.spine, 0, CAR.spine].some(k => rects.some(r => circleHitsRect(x + d.x * k, y + d.y * k, CAR.r, r)))
    }

    const towards = (v: number, target: number, rate: number) => (v < target ? Math.min(target, v + rate) : Math.max(target, v - rate))

    return {
        image,
        get x() {
            return s.x
        },
        get y() {
            return s.y
        },
        get heading() {
            return s.h
        },
        get speed() {
            return s.v
        },
        /** um passo de física; devolve onde bateu, ou nada */
        step(dt: number, throttle: number, steer: number): Point | null {
            if (throttle > 0) s.v = s.v < 0 ? towards(s.v, 0, DRIVE.brake * dt) : towards(s.v, DRIVE.vmax, DRIVE.accel * dt)
            else if (throttle < 0) s.v = s.v > 0 ? towards(s.v, 0, DRIVE.brake * dt) : towards(s.v, -DRIVE.vrev, DRIVE.accel * dt)
            else s.v = towards(s.v, 0, DRIVE.coast * dt)
            if (Math.abs(s.v) < 0.5) {
                s.v = 0
                return null
            }
            const h = s.h + ((s.v * Math.tan(steer * STEER)) / CAR.wheelbase) * dt
            const d = ahead(h)
            const x = s.x + d.x * s.v * dt
            const y = s.y + d.y * s.v * dt
            const rects = yard.obstacles()
            // já encostado (nunca deveria, mas se acontecer): deixa sair, senão o carro fica preso para sempre
            if (hits(x, y, h, rects) && !hits(s.x, s.y, s.h, rects)) {
                const front = Math.sign(s.v) * (CAR.len / 2)
                const at = { x: s.x + ahead(s.h).x * front, y: s.y + ahead(s.h).y * front }
                const hard = Math.abs(s.v) > 40
                s.v = 0
                return hard ? at : null
            }
            s.x = x
            s.y = y
            s.h = h
            sync()
            return null
        },
        /** parado, dentro de uma vaga livre e mais ou menos alinhado: a vaga onde pode estacionar */
        parkCell(): Cell | null {
            if (s.v !== 0) return null
            const cell = yard.cellAt(s.x, s.y)
            if (!cell || !yard.isFree(cell)) return null
            const up = Math.abs(Phaser.Math.Angle.Wrap(s.h))
            const down = Math.abs(Phaser.Math.Angle.Wrap(s.h - Math.PI))
            return Math.min(up, down) <= PARK_ANGLE ? cell : null
        },
        /** o encaixe: desliza até o centro da vaga, alinhado */
        snap(cell: Cell): Promise<void> {
            const to = spotCenter(cell)
            const up = Math.abs(Phaser.Math.Angle.Wrap(s.h)) <= Math.PI / 2
            const target = s.h + Phaser.Math.Angle.Wrap((up ? 0 : Math.PI) - s.h)
            s.v = 0
            return new Promise(resolve =>
                scene.tweens.add({
                    targets: s,
                    x: to.x,
                    y: to.y,
                    h: target,
                    duration: FX.ms(scene, 320),
                    ease: 'Sine.easeInOut',
                    onUpdate: sync,
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
        },
        /** entra pelo portão, subindo, e para pronto para dirigir */
        arrive(): Promise<void> {
            s.x = GATE.x
            s.y = GATE.startY
            s.h = 0
            s.v = 0
            sync()
            return new Promise(resolve =>
                scene.tweens.add({
                    targets: s,
                    y: GATE.y,
                    duration: FX.ms(scene, 900),
                    ease: 'Sine.easeOut',
                    onUpdate: sync,
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
        },
        /** a demonstração: o carro segue um caminho, e `onTurn` recebe o quanto ele está virando */
        follow(points: Point[], ms: number, onTurn: (turn: number) => void): Promise<void> {
            const curve = new Phaser.Curves.Spline(points.map(p => new Phaser.Math.Vector2(p.x, p.y)))
            const k = { t: 0 }
            let last = s.h
            return new Promise(resolve =>
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const p = curve.getPointAt(k.t)
                        const tan = curve.getTangentAt(Math.min(0.999, k.t))
                        s.x = p.x
                        s.y = p.y
                        s.h = Math.atan2(tan.x, -tan.y)
                        onTurn(Phaser.Math.Angle.Wrap(s.h - last))
                        last = s.h
                        sync()
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
        },
        destroy() {
            image.destroy()
        },
    }
}

export type Car = ReturnType<typeof createCar>
