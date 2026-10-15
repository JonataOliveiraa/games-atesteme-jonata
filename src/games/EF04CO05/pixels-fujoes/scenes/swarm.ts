import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DOT_KEY, FACE, FUJAO_BODY, cellKey, type BoxState, type Face } from '../data/files'
import { glyphKey } from '../data/glyphs'
import { AIM, DEPTH, PLAY, SHOT, TABLET } from '../data/layout'
import { C } from '../data/theme'
import type { Cell, Entry, Kind, View } from '../types'
import { ensureBox, ensureFujao, ensureLetterFujao } from './pixelart'
import type { Tablet } from './tablet'

type Point = { x: number; y: number }

/** contorno claro em volta do fujão: o escuro não some na frente das casas escuras */
const RIM = 4
const SLOTS: Point[] = [
    { x: 330, y: 300 },
    { x: 930, y: 300 },
    { x: 384, y: 470 },
    { x: 880, y: 470 },
]
/** o aro de cada caixinha no RGB diz de que luz é aquele número */
const RGB_RIMS = [C.red, C.green, C.blue]

export type FujaoState = 'escaping' | 'free' | 'held' | 'claimed' | 'home' | 'gone'

export interface Fujao {
    readonly index: number
    readonly cell: Cell
    /** o que ele é (cor, letra…) e o código dele */
    readonly entry: Entry
    /** os números já mandados, na ordem (começa com os dados, como o 010 das letras) */
    sent: string
    state: FujaoState
    /** onde ele está na tela (já com o olhar), e o tamanho */
    sx: number
    sy: number
    size: number
    z: number
}

interface Body extends Fujao {
    ax: number
    ay: number
    heading: number
    turnW: number
    turnP: number
    zMid: number
    zAmp: number
    zW: number
    zP: number
    bobP: number
    blinkIn: number
    blinking: number
    dashIn: number
    dashing: number
    given: number
    /** quanto tempo a mira está travada nele, o descanso entre duas fugas, e se está fugindo agora */
    lockT: number
    rest: number
    dodging: boolean
    img: Phaser.GameObjects.Image
    rim: Phaser.GameObjects.Image
    boxes: Phaser.GameObjects.Image[]
    marks: Phaser.GameObjects.Image[]
    /** o código em que ele virou, voando para casa */
    digits: Phaser.GameObjects.Image[]
    homeT: number
    from: Point
    fromZ: number
}

/**
 * Os fujões, em primeira pessoa. Cada um tem uma âncora na tela (sem o olhar) e uma distância `z`: o
 * tamanho é casa / z, e o olhar desloca cada um por L / z — os de perto andam mais (paralaxe). Quem guarda
 * mais de um número (cor, letra) leva em cima uma fileira de caixinhas, preenchida raio a raio.
 */
export interface Swarm {
    readonly list: Fujao[]
    paused: boolean
    configure(speed: number, dash: boolean, dodge: number): void
    /** chamado quando um fujão foge da mira */
    onDodge?: () => void
    spawn(cells: Cell[], entries: Entry[], given: number, onEach?: (i: number) => void): Promise<void>
    update(dt: number, lookX: number, lookY: number): void
    /** o fujão sob a mira; se dois cabem, o mais perto da câmera */
    pick(x: number, y: number): Fujao | null
    setLocked(f: Fujao | null): void
    /** segura o fujão enquanto o raio voa (ninguém mais mira nele) */
    hold(f: Fujao): void
    /** um número certo que ainda não fecha o código: ele entra na caixinha e o fujão recua um pouco (a letra fica fisgada) */
    hit(f: Fujao, bit: string): void
    /** o fujão pula para longe da mira (a demonstração chama direto) */
    dodge(f: Fujao): void
    claim(f: Fujao): void
    /** o raio fechou o código: o fujão vira a fila de números */
    convert(f: Fujao, code: string): void
    /** o código volta para a casa dele, encolhendo até o tamanho dela */
    home(f: Fujao): Promise<void>
    clear(): void
    destroy(): void
}

const rand = Phaser.Math.FloatBetween

export function createSwarm(scene: Phaser.Scene, tablet: Tablet, kind: Kind, view: View): Swarm {
    const bodies: Body[] = []
    const cellSize = TABLET.cell * view.zoom
    let speed = 45
    let dash = false
    let dodgeAfter = 0
    /** depois de fugir, ele descansa um pouco antes de poder fugir de novo */
    const REST = 1.2
    const HOP = 160
    let clock = 0
    let locked: Fujao | null = null
    let lookX = 0
    let lookY = 0

    const face = (b: Body): Face => {
        if (b.state === 'claimed') return 'happy'
        if (b === locked) return 'scared'
        return b.blinking > 0 ? 'blink' : 'normal'
    }

    const textureOf = (entry: Entry) => (kind === 'ascii' ? ensureLetterFujao(scene, entry.glyph ?? '?') : ensureFujao(scene, entry.color))

    const rimOf = (i: number) => (kind === 'rgb' ? RGB_RIMS[i] ?? C.textSoft : C.textSoft)

    /** a letra que já recebeu um número da criança fica fisgada: para de andar e de fugir até o código fechar */
    const hooked = (b: Body) => kind === 'ascii' && b.sent.length > b.given

    const placeBoxes = (b: Body, depth: number) => {
        const n = b.boxes.length
        if (!n) return
        const show = b.state === 'free' || b.state === 'held'
        const bw = Phaser.Math.Clamp(b.size * (n > 4 ? 0.34 : 0.38), 26, n > 4 ? 34 : 36)
        /** os números já dados (o 0100 das letras) ficam menores e separados: a vez é dos que a criança manda */
        const widths = b.boxes.map((_, i) => (i < b.given ? bw * 0.62 : bw))
        const gap = bw * 0.16
        const split = b.given > 0 ? bw * 0.4 : 0
        const total = widths.reduce((s, w) => s + w, 0) + (n - 1) * gap + split
        const y = b.sy - b.size / 2 - ((bw * 11) / 9) * 0.75
        let left = b.sx - total / 2
        b.boxes.forEach((box, i) => {
            const w = widths[i]
            if (i === b.given) left += split
            const x = left + w / 2
            left += w + gap
            const state: BoxState = i < b.sent.length ? 'done' : i === b.sent.length ? 'next' : 'empty'
            box.setTexture(ensureBox(scene, state, rimOf(i)))
                .setVisible(show)
                .setPosition(x, y + (bw - w) * 0.3)
                .setScale(w / 9)
                .setAlpha(i < b.given ? 0.6 : 1)
                .setDepth(depth + 0.004)
            const mark = b.marks[i]
            const done = i < b.sent.length
            if (done) mark.setTexture(glyphKey(b.sent[i], 'light'))
            mark.setVisible(show && done)
                .setPosition(x, y + (bw - w) * 0.3)
                .setScale((w * 11 * 0.62) / 9 / 7)
                .setAlpha(i < b.given ? 0.6 : 1)
                .setDepth(depth + 0.006)
        })
    }

    const placeDigits = (b: Body, depth: number) => {
        const n = b.digits.length
        if (!n) return
        const h = n === 1 ? b.size * 0.62 : Math.min(b.size * 0.62, (b.size * 1.3) / (n * 0.96))
        const step = h * 0.96
        b.digits.forEach((d, i) =>
            d
                .setPosition(b.sx + (i - (n - 1) / 2) * step, b.sy)
                .setScale(h / 7)
                .setDepth(depth + 0.01),
        )
    }

    const project = (b: Body) => {
        const bob = b.state === 'free' ? Math.sin(clock * 4 + b.bobP) * 3 : 0
        const par = Math.min(1 / b.z, PLAY.parallax)
        b.size = cellSize / b.z
        b.sx = b.ax - lookX * par
        b.sy = b.ay - lookY * par + bob
        const depth = DEPTH.swarm + (1 - b.z) * 10
        const frame = cellKey(FACE[face(b)])
        const scale = b.size / FUJAO_BODY
        b.img.setPosition(b.sx, b.sy).setScale(scale).setDepth(depth).setFrame(frame)
        const w = b.img.frame.width * scale
        b.rim.setPosition(b.sx, b.sy).setFrame(frame).setScale((scale * (w + RIM * 2)) / w).setDepth(depth - 0.005)
        placeBoxes(b, depth)
        placeDigits(b, depth)
    }

    const separate = () => {
        const free = bodies.filter(b => b.state === 'free')
        for (let i = 0; i < free.length; i++)
            for (let j = i + 1; j < free.length; j++) {
                const a = free[i]
                const b = free[j]
                let dx = b.ax - a.ax
                let dy = b.ay - a.ay
                let d = Math.hypot(dx, dy)
                const min = (a.size + b.size) / 2 + PLAY.gap + (a.boxes.length > 4 || b.boxes.length > 4 ? 40 : 0)
                if (d >= min) continue
                if (d < 0.01) {
                    dx = 1
                    dy = 0
                    d = 1
                }
                /** a letra fisgada não sai do lugar: quem chega perto é que se afasta */
                const wa = hooked(a) ? 0 : 1
                const wb = hooked(b) ? 0 : 1
                if (wa + wb === 0) continue
                const push = (min - d) / (wa + wb)
                a.ax -= (dx / d) * push * wa
                a.ay -= (dy / d) * push * wa
                b.ax += (dx / d) * push * wb
                b.ay += (dy / d) * push * wb
            }
    }

    const move = (b: Body, dt: number) => {
        b.heading += Math.sin(clock * b.turnW + b.turnP) * 1.3 * dt
        if (dash) {
            b.dashIn -= dt
            if (b.dashIn <= 0) {
                b.dashing = 0.45
                b.dashIn = rand(3.2, 6)
                b.heading += rand(-1.3, 1.3)
            }
        }
        b.dashing = Math.max(0, b.dashing - dt)
        const mult = b.dashing > 0 ? 2.6 : 1
        b.ax += Math.cos(b.heading) * speed * mult * dt
        b.ay += Math.sin(b.heading) * speed * 0.7 * mult * dt
        if (b.ax < PLAY.left || b.ax > PLAY.right) {
            b.ax = Phaser.Math.Clamp(b.ax, PLAY.left, PLAY.right)
            b.heading = Math.PI - b.heading
        }
        if (b.ay < PLAY.top || b.ay > PLAY.bottom) {
            b.ay = Phaser.Math.Clamp(b.ay, PLAY.top, PLAY.bottom)
            b.heading = -b.heading
        }
        b.z = Phaser.Math.Clamp(b.zMid + b.zAmp * Math.sin(clock * b.zW + b.zP), view.near, view.far)
    }

    const wander = (b: Body, dt: number) => {
        if (!hooked(b)) move(b, dt)
        b.blinkIn -= dt
        if (b.blinkIn <= 0) {
            b.blinking = 0.14
            b.blinkIn = rand(1.8, 4.2)
        }
        b.blinking = Math.max(0, b.blinking - dt)
    }

    /** pedacinhos de pixel que saem dele (a fumacinha da fuga e o número entrando) */
    const puff = (b: Body, color: number, count: number, toward?: number) => {
        for (let i = 0; i < count; i++) {
            const a = toward ?? (Math.PI * 2 * i) / count + rand(-0.3, 0.3)
            const spread = toward === undefined ? 1 : rand(0.4, 1)
            const piece = scene.add
                .image(b.sx, b.sy, DOT_KEY)
                .setScale(b.size / 8)
                .setTint(color)
                .setDepth(DEPTH.fx)
            const dist = b.size * (0.5 + i * 0.12) * spread
            void FX.to(scene, piece, { x: b.sx + Math.cos(a + rand(-0.4, 0.4)) * dist, y: b.sy + Math.sin(a + rand(-0.4, 0.4)) * dist, alpha: 0 }, { duration: 300 + i * 50 }).then(() =>
                piece.destroy(),
            )
        }
    }

    const destroyBody = (b: Body) => {
        scene.tweens.killTweensOf(b)
        b.img.destroy()
        b.rim.destroy()
        b.boxes.forEach(o => o.destroy())
        b.marks.forEach(o => o.destroy())
        b.digits.forEach(o => o.destroy())
        b.digits = []
    }

    const swarm: Swarm = {
        get list() {
            return bodies
        },
        paused: false,
        configure(s, d, dodge) {
            speed = s
            dash = d
            dodgeAfter = dodge
        },
        async spawn(cells, entries, given, onEach) {
            const jobs = cells.map(async (cell, i) => {
                await FX.wait(scene, i * 260)
                const start = tablet.cellPos(cell)
                tablet.punch(cell)
                onEach?.(i)
                const entry = entries[i]
                const key = textureOf(entry)
                const img = scene.add.image(start.x, start.y, key, cellKey(FACE.normal))
                const rim = scene.add.image(start.x, start.y, key, cellKey(FACE.normal)).setTintFill(C.textSoft)
                const n = entry.code.length > 1 ? entry.code.length : 0
                const boxes = Array.from({ length: n }, () => scene.add.image(start.x, start.y, ensureBox(scene, 'empty', C.textSoft)).setVisible(false))
                const marks = Array.from({ length: n }, () => scene.add.image(start.x, start.y, glyphKey('0', 'light')).setVisible(false))
                const slot = SLOTS[i % SLOTS.length]
                const target = { x: slot.x + rand(-26, 26), y: slot.y + rand(-20, 20) }
                const zMid = rand(view.near + (view.far - view.near) * 0.25, view.far - (view.far - view.near) * 0.25)
                const b: Body = {
                    index: i,
                    cell,
                    entry,
                    sent: entry.code.slice(0, given),
                    given,
                    state: 'escaping',
                    sx: start.x,
                    sy: start.y,
                    size: cellSize,
                    z: 1,
                    ax: start.x + lookX,
                    ay: start.y + lookY,
                    heading: rand(0, Math.PI * 2),
                    turnW: rand(0.5, 1.1),
                    turnP: rand(0, 6),
                    zMid,
                    zAmp: (view.far - view.near) * rand(0.12, 0.22),
                    zW: rand(0.35, 0.6),
                    zP: 0,
                    bobP: rand(0, 6),
                    blinkIn: rand(1, 3),
                    blinking: 0,
                    dashIn: rand(2, 5),
                    dashing: 0,
                    lockT: 0,
                    rest: 0,
                    dodging: false,
                    img,
                    rim,
                    boxes,
                    marks,
                    digits: [],
                    homeT: 0,
                    from: { x: 0, y: 0 },
                    fromZ: 1,
                }
                bodies.push(b)
                project(b)
                const from = { x: b.ax, y: b.ay }
                const s = { t: 0 }
                await new Promise<void>(resolve =>
                    scene.tweens.add({
                        targets: s,
                        t: 1,
                        duration: FX.ms(scene, 720),
                        ease: 'Sine.easeOut',
                        onUpdate: () => {
                            b.ax = Phaser.Math.Linear(from.x, target.x, s.t)
                            b.ay = Phaser.Math.Linear(from.y, target.y, s.t) - Math.sin(s.t * Math.PI) * 80
                            b.z = Phaser.Math.Linear(1, zMid, s.t)
                        },
                        onComplete: () => resolve(),
                        onStop: () => resolve(),
                    }),
                )
                if (b.state !== 'escaping') return
                b.state = 'free'
                b.zP = -clock * b.zW
            })
            await Promise.all(jobs)
        },
        update(dt, lx, ly) {
            lookX = lx
            lookY = ly
            if (!swarm.paused) clock += dt
            bodies.forEach(b => {
                if (b.state === 'gone') return
                if (b.state === 'free' && !swarm.paused && !b.dodging) wander(b, dt)
                if (b.state === 'free' && !swarm.paused && dodgeAfter > 0 && !b.dodging && !hooked(b)) {
                    b.rest = Math.max(0, b.rest - dt)
                    b.lockT = b === locked ? b.lockT + dt : 0
                    if (b.lockT >= dodgeAfter && b.rest <= 0) {
                        swarm.dodge(b)
                        swarm.onDodge?.()
                    }
                }
                if (b.state === 'home') {
                    const to = tablet.cellPos(b.cell)
                    const t = b.homeT
                    const e = t * t * (3 - 2 * t)
                    b.z = Phaser.Math.Linear(b.fromZ, 1, e)
                    b.ax = Phaser.Math.Linear(b.from.x, to.x + lookX, e)
                    b.ay = Phaser.Math.Linear(b.from.y, to.y + lookY, e) - Math.sin(t * Math.PI) * 40
                }
            })
            if (!swarm.paused) separate()
            bodies.forEach(b => b.state !== 'gone' && project(b))
        },
        pick(x, y) {
            let best: Body | null = null
            bodies.forEach(b => {
                if (b.state !== 'free' || b.dodging) return
                const half = b.size / 2 + AIM.pad
                if (Math.abs(x - b.sx) > half || Math.abs(y - b.sy) > half) return
                if (!best || b.z < best.z) best = b
            })
            return best
        },
        setLocked(f) {
            locked = f
        },
        hold(f) {
            const b = f as Body
            b.state = 'held'
            if (locked === f) locked = null
        },
        hit(f, bit) {
            const b = f as Body
            b.sent += bit
            b.state = 'free'
            b.lockT = 0
            b.rest = Math.max(b.rest, 0.6)
            if (hooked(b)) b.rim.setTintFill(C.cyan)
            else {
                b.dashing = 0.22
                b.heading += Math.PI + rand(-0.6, 0.6)
            }
            puff(b, C.cyan, 5)
            b.img.setTintFill(C.white)
            scene.time.delayedCall(FX.ms(scene, 80), () => b.img.active && b.img.clearTint())
            project(b)
        },
        dodge(f) {
            const b = f as Body
            if (b.state !== 'free') return
            b.dodging = true
            b.lockT = 0
            b.rest = REST
            if (locked === f) locked = null
            const from = { x: b.ax, y: b.ay }
            const land = (a: number) => ({
                x: Phaser.Math.Clamp(b.ax + Math.cos(a) * HOP, PLAY.left, PLAY.right),
                y: Phaser.Math.Clamp(b.ay + Math.sin(a) * HOP * 0.8, PLAY.top, PLAY.bottom),
            })
            const base = Math.atan2(b.ay - TABLET.playY, b.ax - 640) + rand(-0.8, 0.8)
            /** o pulo vai para o lado com mais espaço: perto da borda, ele não fica preso nela */
            const away = [0, Math.PI / 2, -Math.PI / 2, Math.PI]
                .map(d => base + d)
                .reduce((best, a) => (Phaser.Math.Distance.BetweenPoints(from, land(a)) > Phaser.Math.Distance.BetweenPoints(from, land(best)) + 20 ? a : best))
            const to = land(away)
            b.heading = away
            const k = { t: 0 }
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(scene, 320),
                ease: 'Cubic.easeOut',
                onUpdate: () => {
                    b.ax = Phaser.Math.Linear(from.x, to.x, k.t)
                    b.ay = Phaser.Math.Linear(from.y, to.y, k.t) - Math.sin(k.t * Math.PI) * 30
                },
                onComplete: () => {
                    b.dodging = false
                },
                onStop: () => {
                    b.dodging = false
                },
            })
            puff(b, C.textSoft, 4, away + Math.PI)
        },
        claim(f) {
            const b = f as Body
            b.state = 'claimed'
            if (locked === f) locked = null
        },
        convert(f, code) {
            const b = f as Body
            b.img.setVisible(false)
            b.rim.setVisible(false)
            b.boxes.forEach(o => o.setVisible(false))
            b.marks.forEach(o => o.setVisible(false))
            b.digits = [...code].map(d => scene.add.image(b.sx, b.sy, glyphKey(d, 'light')))
            project(b)
            b.digits.forEach(d => void FX.to(scene, d, { scale: d.scale * 1.25 }, { duration: 90, yoyo: true }))
        },
        home(f) {
            const b = f as Body
            b.state = 'home'
            b.from = { x: b.ax, y: b.ay }
            b.fromZ = b.z
            b.homeT = 0
            return new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: b,
                    homeT: 1,
                    duration: FX.ms(scene, SHOT.homeMs),
                    ease: 'Linear',
                    onComplete: () => {
                        b.state = 'gone'
                        destroyBody(b)
                        resolve()
                    },
                    onStop: () => resolve(),
                }),
            )
        },
        clear() {
            bodies.forEach(destroyBody)
            bodies.length = 0
            locked = null
        },
        destroy() {
            swarm.clear()
        },
    }
    return swarm
}
