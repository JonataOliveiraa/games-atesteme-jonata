import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAPTION, DEPTH, FOCUS, HEADER, SPOT } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Vec } from '../types'
import type { Caption } from './caption'
import type { Header } from './header'
import type { View } from './view'

/** O círculo claro, em pixels do mapa: um raio, ou dois quando a coisa é mais larga que alta. */
export type Spot = number | { rx: number; ry: number }

/**
 * O foco das animações. Enquanto o jogo MOSTRA (a bolinha correndo, o
 * processador pensando, a tomada nova, o erro), o cabeçalho sobe e sai, o
 * mapa fica com a tela toda e uma vinheta escurece tudo menos um círculo macio
 * em volta do que está acontecendo. O círculo anda junto com a coisa: mira um
 * ponto (`aim`) ou segue um que se move (`track`). Quando o jogo volta a
 * PEDIR, tudo volta e a mesa aparece inteira.
 */
export interface Focus {
    readonly on: boolean
    enter(): Promise<void>
    exit(): Promise<void>
    /**
     * O cabeçalho só sai do caminho, sem vinheta: enquanto a criança arrasta o
     * mapa, um cabo ou um aparelho. Vale junto com o foco (sobe o que pedir mais).
     */
    aside(on: boolean): void
    /**
     * Só a vinheta, com o cabeçalho no lugar (é ele que diz o que fazer): o
     * jogo espera um toque num lugar só ("Toque no TECLADO") e o resto escurece.
     */
    glow(on: boolean): void
    aim(at: Vec, spot?: Spot): void
    /** Segue um ponto que anda; enquanto ele devolver `null`, o círculo fica onde está. */
    track(get: () => Vec | null, spot?: Spot): void
    update(delta: number): void
    destroy(): void
}

const KEY = 'cabo-certo-veil'
const SIDE = 256
/** O raio claro dentro da textura. O escuro completo chega na borda dela, a 1,7 × ele. */
const HOLE = SIDE * 0.3
/** As faixas escuras em volta da textura, para cobrir a tela de qualquer lugar. */
const FAR = 4000

function ensureTexture(scene: Phaser.Scene) {
    if (scene.textures.exists(KEY)) return
    const tex = scene.textures.createCanvas(KEY, SIDE, SIDE)
    if (!tex) return
    const ctx = tex.getContext()
    const rgb = `${(C.shadow >> 16) & 0xff}, ${(C.shadow >> 8) & 0xff}, ${C.shadow & 0xff}`
    const half = SIDE / 2
    const grad = ctx.createRadialGradient(half, half, HOLE, half, half, half)
    grad.addColorStop(0, `rgba(${rgb}, 0)`)
    grad.addColorStop(0.35, `rgba(${rgb}, 0.22)`)
    grad.addColorStop(0.7, `rgba(${rgb}, 0.68)`)
    grad.addColorStop(1, `rgba(${rgb}, 1)`)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, SIDE, SIDE)
    tex.refresh()
}

export function createFocus(scene: Phaser.Scene, view: View, header: Header, caption: Caption): Focus {
    ensureTexture(scene)
    const half = SIDE / 2
    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 1)
    frame.fillRect(-half - FAR, -half - FAR, SIDE + FAR * 2, FAR)
    frame.fillRect(-half - FAR, half, SIDE + FAR * 2, FAR)
    frame.fillRect(-half - FAR, -half, FAR, SIDE)
    frame.fillRect(half, -half, FAR, SIDE)
    const veil = scene.add
        .container(0, 0, [scene.add.image(0, 0, KEY), frame])
        .setDepth(DEPTH.veil)
        .setVisible(false)
        .setAlpha(0)

    let t = 0
    let on = false
    let fresh = true
    let tween: Phaser.Tweens.Tween | undefined
    let follow: (() => Vec | null) | null = null
    const goal = { x: 0, y: 0, rx: SPOT.packet as number, ry: SPOT.packet as number }
    const cur = { ...goal }

    const setSpot = (spot: Spot) => {
        goal.rx = typeof spot === 'number' ? spot : spot.rx
        goal.ry = typeof spot === 'number' ? spot : spot.ry
    }

    /** Um valor de 0 a 1 que anda até o alvo em `ms` e repinta a cada passo. */
    const channel = (ms: number) => {
        let value = 0
        let goal = 0
        let tw: Phaser.Tweens.Tween | undefined
        return {
            get value() {
                return value
            },
            set(want: boolean) {
                const to = want ? 1 : 0
                if (to === goal) return
                goal = to
                tw?.stop()
                const from = value
                const k = { v: 0 }
                tw = scene.tweens.add({
                    targets: k,
                    v: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeOut',
                    onUpdate: () => {
                        value = Phaser.Math.Linear(from, to, k.v)
                        paint()
                    },
                })
            },
            stop: () => tw?.stop(),
        }
    }

    /** O cabeçalho fora do caminho por causa de um arraste. */
    const away = channel(FOCUS.asideMs)
    /** A vinheta de quando o jogo espera um toque num lugar só. */
    const hint = channel(FOCUS.hintMs)

    const paint = () => {
        const lift = FOCUS.lift * Math.max(t, away.value)
        header.setLift(lift)
        view.setTop(Math.max(0, HEADER.h - lift))
        caption.setY(Phaser.Math.Linear(CAPTION.y, CAPTION.top, t))
        const dark = Math.max(FOCUS.alpha * t, FOCUS.hintAlpha * hint.value)
        veil.setVisible(dark > 0).setAlpha(dark)
    }

    const run = (to: number) => {
        tween?.stop()
        if (t === to) return Promise.resolve()
        const from = t
        const k = { v: 0 }
        return new Promise<void>(resolve => {
            tween = scene.tweens.add({
                targets: k,
                v: 1,
                duration: FX.ms(scene, TIMING.focus),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    t = Phaser.Math.Linear(from, to, k.v)
                    paint()
                },
                onComplete: () => {
                    t = to
                    paint()
                    resolve()
                },
                onStop: () => resolve(),
            })
        })
    }

    return {
        get on() {
            return on
        },
        enter() {
            if (t === 0) fresh = true
            on = true
            return run(1)
        },
        async exit() {
            on = false
            await run(0)
            if (!on) follow = null
        },
        aside(want) {
            away.set(want)
        },
        glow(want) {
            // Acendendo do nada, o círculo nasce no lugar certo em vez de deslizar até ele.
            if (want && t === 0 && hint.value === 0) fresh = true
            hint.set(want)
        },
        aim(at, spot) {
            follow = null
            goal.x = at.x
            goal.y = at.y
            if (spot !== undefined) setSpot(spot)
        },
        track(get, spot) {
            follow = get
            const p = get()
            if (p) {
                goal.x = p.x
                goal.y = p.y
            }
            if (spot !== undefined) setSpot(spot)
        },
        update(delta) {
            if (t <= 0 && hint.value <= 0) return
            const p = follow?.()
            if (p) {
                goal.x = p.x
                goal.y = p.y
            }
            if (fresh) {
                Object.assign(cur, goal)
                fresh = false
            } else {
                const k = 1 - Math.exp(-delta / 70)
                const kr = 1 - Math.exp(-delta / 160)
                cur.x += (goal.x - cur.x) * k
                cur.y += (goal.y - cur.y) * k
                cur.rx += (goal.rx - cur.rx) * kr
                cur.ry += (goal.ry - cur.ry) * kr
            }
            const s = view.toScreen(cur)
            const z = view.zoom
            veil.setPosition(s.x, s.y).setScale((cur.rx * z) / HOLE, (cur.ry * z) / HOLE)
        },
        destroy() {
            tween?.stop()
            away.stop()
            hint.stop()
            follow = null
            veil.destroy()
        },
    }
}
