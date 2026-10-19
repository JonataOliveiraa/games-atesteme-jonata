import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICE_SHEET, PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { CABLE, DEPTH, DEVICE, MONITOR_SCREEN, PC, PLUG } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { SCREEN } from '../data/words'
import type { DeviceDef, DeviceId, Payload, Rect, Vec } from '../types'
import type { View } from './view'

/**
 * Os aparelhos do mapa, cada um com o seu cabo e o seu plugue. O cabo é uma
 * curva com barriga que vai do aparelho até o plugue, onde quer que ele esteja:
 * na mão da criança, descansando no chão ou encaixado numa tomada.
 */
export interface Gear {
    ids(): DeviceId[]
    def(id: DeviceId): DeviceDef
    rect(id: DeviceId): Rect
    plugAt(id: DeviceId): Vec
    /** O aparelho cujo plugue está debaixo do ponto (no mapa). */
    plugUnder(at: Vec): DeviceId | null
    deviceUnder(at: Vec): DeviceId | null
    awake(id: DeviceId): boolean
    wake(id: DeviceId): Promise<void>
    /** Leva o plugue até o ponto, sem animação (durante o arraste). */
    hold(id: DeviceId, at: Vec): void
    snap(id: DeviceId, socket: Vec): Promise<void>
    retract(id: DeviceId): Promise<void>
    setPowered(id: DeviceId, on: boolean): void
    /** Os pontos do cabo, do aparelho até o plugue. */
    cable(id: DeviceId): Vec[]
    press(id: DeviceId): void
    nope(id: DeviceId): void
    /** O aparelho manda: o teclado digita, o microfone capta, a câmera fotografa. */
    send(id: DeviceId): void
    /** O aparelho recebe: o monitor mostra, o alto-falante toca, o pendrive guarda. */
    take(id: DeviceId, payload: Payload): Promise<void>
    hint(id: DeviceId | null): void
    destroy(): void
}

interface Unit {
    def: DeviceDef
    size: number
    dir: Vec
    port: Vec
    rest: Vec
    sprite: Phaser.GameObjects.Image
    name: Phaser.GameObjects.Container
    led: Phaser.GameObjects.Arc
    zzz?: Phaser.GameObjects.Text
    cable: Phaser.GameObjects.Graphics
    plug: Phaser.GameObjects.Image
    plugPos: Vec
    plugged: boolean
    awake: boolean
    badge?: Phaser.GameObjects.Container
}

const SAMPLES = 26

const lerp = (a: Vec, b: Vec, t: number): Vec => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

function curve(from: Vec, to: Vec): Vec[] {
    const dist = Phaser.Math.Distance.BetweenPoints(from, to)
    const sag = Math.min(CABLE.maxSag, dist * CABLE.sag)
    const mid = lerp(from, to, 0.5)
    const ctrl = { x: mid.x, y: mid.y + sag }
    const pts: Vec[] = []
    for (let i = 0; i <= SAMPLES; i++) {
        const t = i / SAMPLES
        const a = lerp(from, ctrl, t)
        const b = lerp(ctrl, to, t)
        pts.push(lerp(a, b, t))
    }
    return pts
}

export function createGear(scene: Phaser.Scene, view: View, defs: DeviceDef[], asleep: DeviceId[]): Gear {
    const units = new Map<DeviceId, Unit>()
    const toScreen = (at: Vec) => view.toScreen(at)
    let hinted: { id: DeviceId; tween: Phaser.Tweens.Tween } | null = null

    defs.forEach(def => {
        const size = def.size ?? DEVICE.size
        const toPc = new Phaser.Math.Vector2(PC.x - def.at.x, PC.y - def.at.y).normalize()
        const dir = { x: toPc.x, y: toPc.y }
        const reach = size * (DEVICE.port / DEVICE.size)
        const port = { x: def.at.x + dir.x * reach, y: def.at.y + dir.y * reach }
        const rest = { x: port.x + dir.x * DEVICE.rest, y: port.y + dir.y * DEVICE.rest + 18 }

        const cable = view.world(scene.add.graphics().setDepth(DEPTH.cable))
        const sprite = view.world(
            scene.add.image(def.at.x, def.at.y, DEVICE_SHEET.key, cellKey(def.cell)).setDisplaySize(size, size).setDepth(DEPTH.device),
        )
        const label = scene.add
            .text(0, 0, def.name, { fontFamily: FONT.black, fontSize: `${SIZE.name}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const lw = label.width + 54
        const lh = label.height + 10
        const pill = scene.add.graphics()
        pill.fillStyle(C.shadow, 0.16)
        pill.fillRoundedRect(-lw / 2, -lh / 2 + 4, lw, lh, lh / 2)
        pill.fillStyle(C.white, 1)
        pill.fillRoundedRect(-lw / 2, -lh / 2, lw, lh, lh / 2)
        label.setX(10)
        const led = scene.add.circle(-lw / 2 + 18, 0, 7, C.asleep)
        const name = view.world(
            scene.add.container(def.at.x, def.at.y + size * (DEVICE.name / DEVICE.size) * 0.62 + 30, [pill, led, label]).setDepth(DEPTH.device + 1),
        )
        const plug = view.world(
            scene.add
                .image(rest.x, rest.y, PIECE_SHEET.key, cellKey(PIECE_CELL.plug))
                .setOrigin(0.72, 0.5)
                .setDisplaySize(PLUG.size, PLUG.size)
                .setDepth(DEPTH.plug),
        )
        const unit: Unit = {
            def,
            size,
            dir,
            port,
            rest,
            sprite,
            name,
            led,
            cable,
            plug,
            plugPos: { ...rest },
            plugged: false,
            awake: !asleep.includes(def.id),
        }
        units.set(def.id, unit)
        if (!unit.awake) sleep(unit)
        draw(unit)
    })

    function sleep(u: Unit) {
        u.sprite.setTint(C.asleep).setAlpha(0.75)
        u.plug.setAlpha(0.5)
        u.zzz = view.world(
            scene.add
                .text(u.def.at.x + u.size * 0.32, u.def.at.y - u.size * 0.45, 'z z z', {
                    fontFamily: FONT.black,
                    fontSize: '30px',
                    color: CSS.inkSoft,
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.fx),
        )
        scene.tweens.add({ targets: u.zzz, y: u.zzz.y - 14, alpha: 0.4, duration: 900, yoyo: true, repeat: -1 })
    }

    function cableEnd(u: Unit): Vec {
        const angle = u.plug.rotation
        const back = PLUG.size * 0.62
        return { x: u.plugPos.x - Math.cos(angle) * back, y: u.plugPos.y - Math.sin(angle) * back }
    }

    function draw(u: Unit) {
        const pts = curve(u.port, cableEnd(u))
        const n = pts.length
        const a = pts[n - 2]
        const b = pts[n - 1]
        if (Phaser.Math.Distance.BetweenPoints(a, u.plugPos) > 4) u.plug.setRotation(Math.atan2(u.plugPos.y - a.y, u.plugPos.x - a.x))
        const g = u.cable
        g.clear()
        g.lineStyle(CABLE.width + 6, C.shadow, 0.12)
        g.strokePoints(
            pts.map(p => ({ x: p.x + 3, y: p.y + 6 })),
            false,
        )
        g.lineStyle(CABLE.width, C.cable, 1)
        g.strokePoints(pts, false)
        g.lineStyle(CABLE.inner - 2, C.cableLight, 1)
        g.strokePoints(
            pts.map(p => ({ x: p.x - 1, y: p.y - 2 })),
            false,
        )
        g.fillStyle(C.cable, 1)
        g.fillCircle(u.port.x, u.port.y, CABLE.width * 0.9)
        g.fillCircle(b.x, b.y, CABLE.width * 0.5)
    }

    const get = (id: DeviceId) => {
        const u = units.get(id)
        if (!u) throw new Error(`aparelho ${id} não existe`)
        return u
    }

    const tweenPlug = (u: Unit, to: Vec, ms: number, ease: string) =>
        new Promise<void>(resolve => {
            const from = { ...u.plugPos }
            const k = { t: 0 }
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(scene, ms),
                ease,
                onUpdate: () => {
                    u.plugPos = lerp(from, to, k.t)
                    u.plug.setPosition(u.plugPos.x, u.plugPos.y)
                    draw(u)
                },
                onComplete: () => resolve(),
            })
        })

    const screenRect = (u: Unit): Rect => {
        const s = u.size / 256
        return {
            x: u.def.at.x + MONITOR_SCREEN.x * s,
            y: u.def.at.y + MONITOR_SCREEN.y * s,
            w: MONITOR_SCREEN.w * s,
            h: MONITOR_SCREEN.h * s,
        }
    }

    let screenStuff: Phaser.GameObjects.GameObject[] = []
    const clearScreen = () => {
        screenStuff.forEach(o => {
            scene.tweens.killTweensOf(o)
            o.destroy()
        })
        screenStuff = []
    }

    async function show(u: Unit, payload: Payload) {
        clearScreen()
        const r = screenRect(u)
        const lit = view.world(scene.add.graphics().setDepth(DEPTH.screen))
        lit.fillStyle(C.screenOn, 1)
        lit.fillRoundedRect(r.x - r.w / 2, r.y - r.h / 2, r.w, r.h, 8)
        screenStuff.push(lit)
        if (payload === 'texto') {
            const text = view.world(
                scene.add
                    .text(r.x, r.y, '', { fontFamily: FONT.black, fontSize: `${SIZE.screen}px`, color: CSS.screen })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.screen + 1),
            )
            screenStuff.push(text)
            await FX.type(scene, text, SCREEN.texto, { delay: 110 })
            return
        }
        const g = view.world(scene.add.graphics().setDepth(DEPTH.screen + 1))
        screenStuff.push(g)
        if (payload === 'foto') {
            const { w, h } = r
            g.fillStyle(0x8fd3ff, 1)
            g.fillRoundedRect(-w / 2 + 10, -h / 2 + 8, w - 20, h - 16, 6)
            g.fillStyle(C.accentYellow, 1)
            g.fillCircle(w * 0.25, -h * 0.18, 12)
            g.fillStyle(C.plant, 1)
            g.fillTriangle(-w * 0.42, h * 0.4, -w * 0.12, -h * 0.2, w * 0.18, h * 0.4)
            g.fillStyle(C.plantDark, 1)
            g.fillTriangle(-w * 0.05, h * 0.4, w * 0.18, 0, w * 0.42, h * 0.4)
            g.setPosition(r.x, r.y).setScale(0.2)
            await FX.to(scene, g, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
            return
        }
        if (payload === 'cursor') {
            g.fillStyle(C.white, 1)
            g.fillTriangle(0, 0, 0, 26, 18, 18)
            g.fillRect(4, 16, 6, 14)
            g.setPosition(r.x - r.w * 0.3, r.y - r.h * 0.25)
            await FX.to(scene, g, { x: r.x + r.w * 0.2, y: r.y + r.h * 0.05 }, { duration: 520, ease: 'Sine.easeInOut' })
            await FX.to(scene, g, { x: r.x - r.w * 0.05, y: r.y - r.h * 0.2 }, { duration: 420, ease: 'Sine.easeInOut' })
            return
        }
        g.destroy()
        screenStuff.pop()
        const notes = view.world(
            scene.add
                .text(r.x, r.y, '♪ ♫ ♪', { fontFamily: FONT.black, fontSize: `${SIZE.screen}px`, color: CSS.screen })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.screen + 1),
        )
        screenStuff.push(notes)
        scene.tweens.add({ targets: notes, y: r.y - 6, duration: 260, yoyo: true, repeat: 3 })
        await FX.wait(scene, 400)
    }

    async function play(u: Unit) {
        const at = toScreen(u.def.at)
        void FX.impact(scene, u.sprite, 0.08)
        const glyphs = ['♪', '♫', '♪', '♬']
        for (let i = 0; i < glyphs.length; i++) {
            void FX.popText(scene, at.x + (i % 2 ? 40 : -30), at.y - u.size * 0.35, glyphs[i], {
                color: '#ffcf4a',
                size: '42px',
                rise: 110,
                duration: 1100,
            })
            await FX.wait(scene, 240)
            void FX.impact(scene, u.sprite, 0.06)
        }
    }

    async function store(u: Unit) {
        await FX.impact(scene, u.sprite, 0.2)
        u.badge?.destroy()
        const g = scene.add.graphics()
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, 26)
        g.fillStyle(C.accentBlue, 1)
        g.fillRoundedRect(-6, -14, 12, 20, 6)
        g.fillRect(-1.5, 6, 3, 6)
        g.fillRoundedRect(-9, 11, 18, 4, 2)
        u.badge = view.world(scene.add.container(u.def.at.x + u.size * 0.32, u.def.at.y - u.size * 0.3, [g]).setDepth(DEPTH.fx))
        await FX.popIn(scene, u.badge, { from: 0.3, duration: 320 })
    }

    const gear: Gear = {
        ids: () => [...units.keys()],
        def: id => get(id).def,
        rect(id) {
            const u = get(id)
            return { x: u.def.at.x, y: u.def.at.y + 14, w: u.size + 30, h: u.size + 60 }
        },
        plugAt: id => ({ ...get(id).plugPos }),
        plugUnder(at) {
            let best: DeviceId | null = null
            let bestD = PLUG.hit / 2
            units.forEach((u, id) => {
                if (!u.awake) return
                const d = Phaser.Math.Distance.BetweenPoints(at, u.plugPos)
                if (d < bestD) {
                    bestD = d
                    best = id
                }
            })
            return best
        },
        deviceUnder(at) {
            let best: DeviceId | null = null
            units.forEach((u, id) => {
                const half = (DEVICE.hit * (u.size / DEVICE.size)) / 2
                if (Math.abs(at.x - u.def.at.x) < half && Math.abs(at.y - u.def.at.y) < half) best = id
            })
            return best
        },
        awake: id => get(id).awake,
        async wake(id) {
            const u = get(id)
            if (u.awake) return
            u.awake = true
            if (u.zzz) {
                scene.tweens.killTweensOf(u.zzz)
                u.zzz.destroy()
                u.zzz = undefined
            }
            u.sprite.clearTint().setAlpha(1)
            u.plug.setAlpha(1)
            const at = toScreen(u.def.at)
            void FX.sparks(scene, at.x, at.y, { color: C.spark, count: 16, spread: 120, depth: DEPTH.fx })
            await FX.impact(scene, u.sprite, 0.2)
        },
        hold(id, at) {
            const u = get(id)
            u.plugPos = { ...at }
            u.plug.setPosition(at.x, at.y)
            draw(u)
        },
        async snap(id, socket) {
            const u = get(id)
            u.plugged = true
            await tweenPlug(u, socket, 140, 'Back.easeOut')
        },
        async retract(id) {
            const u = get(id)
            u.plugged = false
            await tweenPlug(u, u.rest, 320, 'Cubic.easeOut')
            u.plug.setRotation(Math.atan2(u.dir.y, u.dir.x))
            draw(u)
        },
        setPowered(id, on) {
            const u = get(id)
            u.led.setFillStyle(on ? C.accentYellow : C.asleep)
            if (!on && u.def.id === 'monitor') clearScreen()
        },
        cable(id) {
            const u = get(id)
            return [...curve(u.port, cableEnd(u)), { ...u.plugPos }]
        },
        press(id) {
            void FX.impact(scene, get(id).sprite, 0.12)
        },
        nope(id) {
            void FX.nope(scene, get(id).sprite)
        },
        send(id) {
            const u = get(id)
            const at = toScreen(u.def.at)
            void FX.impact(scene, u.sprite, 0.14)
            if (id === 'camera') void FX.flash(scene, C.white, { duration: 220, peak: 0.6 })
            if (id === 'microfone' || id === 'teclado' || id === 'mouse' || id === 'camera')
                void FX.ping(scene, at.x, at.y - u.size * 0.2, C.white, { radius: u.size * 0.6, duration: 500, depth: DEPTH.fx })
        },
        async take(id, payload) {
            const u = get(id)
            if (id === 'monitor') await show(u, payload)
            else if (id === 'altofalante') await play(u)
            else if (id === 'pendrive') await store(u)
            else await FX.impact(scene, u.sprite, 0.12)
        },
        hint(id) {
            if (hinted) {
                hinted.tween.stop()
                const old = units.get(hinted.id)
                old?.sprite.setDisplaySize(old.size, old.size)
                hinted = null
            }
            if (!id) return
            const u = get(id)
            const k = { t: 0 }
            hinted = {
                id,
                tween: scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: 420,
                    yoyo: true,
                    repeat: -1,
                    onUpdate: () => u.sprite.setDisplaySize(u.size * (1 + 0.08 * k.t), u.size * (1 + 0.08 * k.t)),
                }),
            }
        },
        destroy() {
            gear.hint(null)
            clearScreen()
            units.forEach(u => {
                if (u.zzz) scene.tweens.killTweensOf(u.zzz)
                ;[u.sprite, u.name, u.cable, u.plug, u.zzz, u.badge].forEach(o => o?.destroy())
            })
            units.clear()
        },
    }

    units.forEach(u => {
        u.plug.setRotation(Math.atan2(u.dir.y, u.dir.x))
        draw(u)
    })
    return gear
}
