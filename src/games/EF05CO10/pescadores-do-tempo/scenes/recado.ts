import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MARKET_SHEET, cellKey, cellScale } from '../data/files'
import { DEPTH, MARKET_BUBBLE, SHOUT, WIRE } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Rect, Vec } from '../types'
import type { Audio } from './audio'

export interface Recado {
    readonly shown: boolean
    showMarket(frame: number): Promise<void>
    setMarket(frame: number): void
    hideMarket(): Promise<void>
    hits(x: number, y: number): boolean
    center(): Vec
    rect(): Rect
    shout(from: Vec, to: Vec, reach: boolean): Promise<void>
    wire(from: Vec, to: Vec): Promise<void>
    ring(): Promise<void>
    sendAudio(from: Vec, to: Vec): Promise<Phaser.GameObjects.Container>
    play(chip: Phaser.GameObjects.Container): Promise<void>
    clear(): void
    destroy(): void
}

const lerp = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

const curve = (a: Vec, b: Vec, t: number): Vec => {
    const mid = { x: (a.x + b.x) / 2, y: Math.max(a.y, b.y) + WIRE.sag }
    const u = 1 - t
    return { x: u * u * a.x + 2 * u * t * mid.x + t * t * b.x, y: u * u * a.y + 2 * u * t * mid.y + t * t * b.y }
}

const run = (scene: Phaser.Scene, duration: number, step: (t: number) => void) =>
    new Promise<void>(resolve => {
        const k = { t: 0 }
        scene.tweens.add({ targets: k, t: 1, duration, ease: 'Sine.easeInOut', onUpdate: () => step(k.t), onComplete: () => resolve(), onStop: () => resolve() })
    })

export function createRecado(scene: Phaser.Scene, audio: Audio): Recado {
    const { x, y, r, ring: rim } = MARKET_BUBBLE
    const trail = scene.add.graphics()
    ;[
        { x: 1215, y: 420, r: 7 },
        { x: 1200, y: 398, r: 10 },
    ].forEach(d => {
        trail.fillStyle(C.shadow, 0.2)
        trail.fillCircle(d.x + 2, d.y + 3, d.r)
        trail.fillStyle(C.cream, 1)
        trail.fillCircle(d.x, d.y, d.r)
    })
    trail.setDepth(DEPTH.sonar).setVisible(false)
    const back = scene.add.graphics()
    back.fillStyle(C.shadow, 0.25)
    back.fillCircle(4, 7, r + rim)
    back.fillStyle(C.time, 1)
    back.fillCircle(0, 0, r + rim)
    back.fillStyle(C.cream, 1)
    back.fillCircle(0, 0, r)
    const face = scene.add.image(0, 0, MARKET_SHEET.key, cellKey(0))
    const fit = () => face.setScale(((r * 2) / MARKET_SHEET.cellW) * cellScale(scene.textures, MARKET_SHEET) * 1.06)
    fit()
    const marks = scene.add.graphics().setVisible(false)
    const box = scene.add.container(x, y, [back, face, marks]).setDepth(DEPTH.sonar).setVisible(false)

    const line = scene.add.graphics().setDepth(DEPTH.line)
    const loose: Phaser.GameObjects.GameObject[] = []
    let shown = false

    const paintMarks = (k: number) => {
        marks.clear()
        marks.lineStyle(6, C.white, 1)
        ;[-1, 1].forEach(side => {
            for (let i = 0; i < 3; i++) {
                const a = -Math.PI / 2 + side * (0.55 + i * 0.32)
                const r0 = r + rim + 10 + k * 6
                marks.lineBetween(Math.cos(a) * r0, Math.sin(a) * r0, Math.cos(a) * (r0 + 22), Math.sin(a) * (r0 + 22))
            }
        })
    }

    const wave = (from: Vec, to: Vec, reach: boolean, delay: number) =>
        FX.wait(scene, delay).then(() => {
            const g = scene.add.graphics().setDepth(DEPTH.sonar - 1)
            const angle = Math.atan2(to.y - from.y, to.x - from.x)
            g.lineStyle(13, C.time, 0.55)
            g.beginPath()
            g.arc(0, 0, 26, angle - 0.7, angle + 0.7)
            g.strokePath()
            g.lineStyle(7, C.white, 1)
            g.beginPath()
            g.arc(0, 0, 26, angle - 0.7, angle + 0.7)
            g.strokePath()
            g.setPosition(from.x, from.y)
            const end = reach ? to : lerp(from, to, Phaser.Math.Clamp((SHOUT.short - from.x) / (to.x - from.x), 0.2, 0.9))
            return FX.to(scene, g, { x: end.x, y: end.y, scale: reach ? 1.8 : 1.3, alpha: reach ? 0.85 : 0 }, { duration: TIMING.shout, ease: reach ? 'Sine.easeOut' : 'Sine.easeIn' }).then(() =>
                FX.to(scene, g, { alpha: 0, scale: 2.2 }, { duration: 200 }).then(() => g.destroy()),
            )
        })

    return {
        get shown() {
            return shown
        },
        async showMarket(frame) {
            face.setFrame(cellKey(frame))
            fit()
            if (shown) return
            shown = true
            trail.setVisible(true).setAlpha(0)
            box.setVisible(true)
            void FX.to(scene, trail, { alpha: 1 }, { duration: 300 })
            await FX.popIn(scene, box, { from: 0.3, duration: 420 })
        },
        setMarket(frame) {
            face.setFrame(cellKey(frame))
            fit()
        },
        async hideMarket() {
            if (!shown) return
            shown = false
            void FX.to(scene, trail, { alpha: 0 }, { duration: 220 })
            await FX.to(scene, box, { scale: 0.5, alpha: 0 }, { duration: 260 })
            box.setVisible(false).setScale(1).setAlpha(1)
            trail.setVisible(false)
        },
        hits: (px, py) => shown && Phaser.Math.Distance.Between(px, py, x, y) <= r + rim + 30,
        center: () => ({ x, y }),
        rect: () => ({ x: x - r - rim - 14, y: y - r - rim - 14, w: (r + rim) * 2 + 28, h: (r + rim) * 2 + 28 }),
        async shout(from, to, reach) {
            await FX.all(...Array.from({ length: SHOUT.rings }, (_, i) => wave(from, to, reach, i * SHOUT.gap)))
        },
        async wire(from, to) {
            const pulse = scene.add.circle(from.x, from.y, WIRE.pulse, C.butter).setDepth(DEPTH.line + 1)
            loose.push(pulse)
            const draw = (upto: number) => {
                line.clear()
                line.lineStyle(4, C.wire, 1)
                line.beginPath()
                line.moveTo(from.x, from.y)
                for (let i = 1; i <= 30; i++) {
                    const p = curve(from, to, (i / 30) * upto)
                    line.lineTo(p.x, p.y)
                }
                line.strokePath()
            }
            await run(scene, TIMING.wire * 0.6, draw)
            draw(1)
            audio.send()
            await run(scene, TIMING.wire, t => {
                const p = curve(from, to, t)
                pulse.setPosition(p.x, p.y)
            })
            pulse.destroy()
        },
        async ring() {
            marks.setVisible(true)
            for (let i = 0; i < TIMING.rings; i++) {
                audio.ring()
                paintMarks(0)
                void FX.shake(scene, box, { amount: 5 })
                await FX.wait(scene, TIMING.ring * 0.5)
                paintMarks(1)
                await FX.wait(scene, TIMING.ring * 0.5)
            }
            marks.setVisible(false)
        },
        async sendAudio(from, to) {
            const g = scene.add.graphics()
            g.fillStyle(C.shadow, 0.25)
            g.fillRoundedRect(-46 + 3, -24 + 5, 92, 48, 24)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(-46, -24, 92, 48, 24)
            g.fillStyle(C.note, 1)
            g.fillCircle(-24, 0, 15)
            g.fillStyle(C.white, 1)
            g.fillTriangle(-29, -8, -29, 8, -17, 0)
            const bars = [8, 16, 11, 18, 9].map((h, i) => scene.add.rectangle(-2 + i * 9, 0, 5, h, C.note))
            const chip = scene.add.container(from.x, from.y, [g, ...bars]).setDepth(DEPTH.sonar + 2).setScale(0.4)
            loose.push(chip)
            audio.send()
            void FX.to(scene, chip, { scale: 1 }, { duration: 260 })
            await FX.arcTo(scene, chip, to, { height: 120, duration: TIMING.note })
            audio.plop()
            await FX.to(scene, chip, { scale: 1.12 }, { duration: 120, yoyo: true })
            return chip
        },
        async play(chip) {
            const bars = chip.list.slice(1) as Phaser.GameObjects.Rectangle[]
            await FX.all(...bars.map((b, i) => FX.to(scene, b, { scaleY: 1.8 }, { duration: 160, yoyo: true, repeat: 3, delay: i * 60 })))
        },
        clear() {
            line.clear()
            loose.splice(0).forEach(o => o.destroy())
        },
        destroy() {
            loose.forEach(o => o.destroy())
            ;[trail, box, line].forEach(o => o.destroy())
        },
    }
}
