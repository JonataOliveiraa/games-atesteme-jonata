import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { boxOf, MONITOR_SCREEN, PRINTER_SLOT, SPEAKER_CONE } from '../data/devices'
import { DEPTH, STATION, TABLE } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { DeviceId, Side } from '../types'
import { createDeviceView, type DeviceView } from './device'

function dashedRect(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    const dash = 16
    const gap = 11
    const edge = (x1: number, y1: number, x2: number, y2: number) => {
        const len = Math.hypot(x2 - x1, y2 - y1)
        const ux = (x2 - x1) / len
        const uy = (y2 - y1) / len
        for (let d = 0; d < len; d += dash + gap) {
            const e = Math.min(d + dash, len)
            g.lineBetween(x1 + ux * d, y1 + uy * d, x1 + ux * e, y1 + uy * e)
        }
    }
    edge(x, y, x + w, y)
    edge(x + w, y, x + w, y + h)
    edge(x + w, y + h, x, y + h)
    edge(x, y + h, x, y)
}

function paintLock(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.lineStyle(7, C.ink, 1)
    g.beginPath()
    g.arc(0, -8, 13, Math.PI, 0)
    g.strokePath()
    g.lineStyle(4, C.warn, 1)
    g.beginPath()
    g.arc(0, -8, 13, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-21, -11, 42, 34, 8)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(-18, -8, 36, 28, 6)
    g.fillStyle(C.warnDeep, 1)
    g.fillCircle(0, 3, 5)
    g.fillRect(-2, 3, 4, 10)
}

function paintHalo(g: Phaser.GameObjects.Graphics, w: number, h: number) {
    g.clear()
    for (const [grow, alpha] of [[34, 0.14], [22, 0.2], [10, 0.28]] as const) {
        g.fillStyle(C.warn, alpha)
        g.fillRoundedRect(-w / 2 - grow, -h - grow, w + grow * 2, h + grow * 2, 30 + grow)
    }
    g.lineStyle(6, C.warn, 0.85)
    g.strokeRoundedRect(-w / 2 - 10, -h - 10, w + 20, h + 20, 30)
}

interface Station {
    x: number
    fit: { w: number; h: number }
    view: DeviceView | null
    slot: Phaser.GameObjects.Container
    halo: Phaser.GameObjects.Graphics
    marked: boolean
}

export function createStations(scene: Phaser.Scene) {
    const makeSlot = (x: number) => {
        const { w, h } = STATION.slot
        const g = scene.add.graphics()
        g.fillStyle(C.white, 0.42)
        g.fillRoundedRect(-w / 2, -h, w, h, 22)
        g.lineStyle(5, C.ink, 0.75)
        dashedRect(g, -w / 2 + 6, -h + 6, w - 12, h - 12)
        const mark = scene.add
            .text(0, -h / 2, '?', { fontFamily: FONT.black, fontSize: '76px', color: CSS.ink })
            .setOrigin(0.5)
            .setAlpha(0.55)
            .setResolution(2)
        return scene.add.container(x, TABLE.top - 2, [g, mark]).setDepth(DEPTH.slot).setVisible(false)
    }

    const makeHalo = (x: number, fit: { w: number; h: number }) => {
        const g = scene.add.graphics().setPosition(x, TABLE.top).setDepth(DEPTH.device - 1).setVisible(false)
        paintHalo(g, fit.w, fit.h)
        return g
    }

    const stations: Record<Side, Station> = {
        input: {
            x: STATION.input.x,
            fit: STATION.inputBox,
            view: null,
            slot: makeSlot(STATION.input.x),
            halo: makeHalo(STATION.input.x, STATION.inputBox),
            marked: false,
        },
        output: {
            x: STATION.output.x,
            fit: STATION.outputBox,
            view: null,
            slot: makeSlot(STATION.output.x),
            halo: makeHalo(STATION.output.x, STATION.outputBox),
            marked: false,
        },
    }

    const lock = scene.add.graphics().setDepth(DEPTH.fx).setVisible(false)
    paintLock(lock)

    const stopSlot = (station: Station) => {
        scene.tweens.killTweensOf(station.slot)
        station.slot.setVisible(false).setScale(1).setAlpha(1)
    }

    const stopHalo = (station: Station) => {
        scene.tweens.killTweensOf(station.halo)
        station.halo.setVisible(false).setAlpha(1).setScale(1)
    }

    const drop = (station: Station) => {
        stopHalo(station)
        station.marked = false
        if (!station.view) return
        scene.tweens.killTweensOf(station.view.root)
        station.view.destroy()
        station.view = null
    }

    const liftOf = (view: DeviceView, scale: number) => ((boxOf(view.id).b - boxOf(view.id).y) / 2) * view.scale * scale

    const place = (side: Side, id: DeviceId) => {
        const station = stations[side]
        drop(station)
        stopSlot(station)
        const view = createDeviceView(scene, id, station.fit)
        view.root.setPosition(station.x, TABLE.top).setDepth(DEPTH.device)
        station.view = view
        return view
    }

    return {
        async showFixed(side: Side, id: DeviceId) {
            const station = stations[side]
            if (station.view?.id === id) return
            const view = place(side, id)
            view.root.setScale(0.6).setAlpha(0)
            await FX.to(scene, view.root, { scale: 1, alpha: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },

        async remove(side: Side) {
            const station = stations[side]
            const view = station.view
            if (!view) return
            view.setActive(false)
            await FX.to(scene, view.root, { y: TABLE.top - 70, alpha: 0, scale: 0.7, angle: -12 }, { duration: 260 })
            drop(station)
        },

        showEmpty(side: Side) {
            const station = stations[side]
            drop(station)
            station.slot.setVisible(true).setAlpha(1).setScale(1)
            scene.tweens.add({
                targets: station.slot,
                alpha: 0.6,
                duration: FX.ms(scene, 700),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async dock(side: Side, id: DeviceId, from: { x: number; y: number; scale: number }) {
            const station = stations[side]
            const view = place(side, id)
            const b = boxOf(id)
            const lift = ((b.b - b.y) / 2) * view.scale
            view.root.setPosition(from.x, from.y + lift * from.scale).setScale(from.scale)
            await FX.all(
                FX.arcTo(scene, view.root, { x: station.x, y: TABLE.top }, { height: 90, duration: 400 }),
                FX.to(scene, view.root, { scale: 1 }, { duration: 400 }),
            )
            await FX.to(scene, view.root, { scaleY: 0.9, scaleX: 1.06 }, { duration: 80, yoyo: true })
            view.root.setScale(1)
        },

        async undock(side: Side, to: { x: number; y: number; scale: number }) {
            const station = stations[side]
            const view = station.view
            if (!view) return
            const b = boxOf(view.id)
            const lift = ((b.b - b.y) / 2) * view.scale
            view.setActive(false)
            await FX.all(
                FX.arcTo(scene, view.root, { x: to.x, y: to.y + lift * to.scale }, { height: 70, duration: 400 }),
                FX.to(scene, view.root, { scale: to.scale }, { duration: 400 }),
            )
            drop(station)
        },

        mark(side: Side, on: boolean) {
            const station = stations[side]
            const view = station.view
            if (!on && !station.marked) return
            station.marked = on
            stopHalo(station)
            if (!view) return
            view.setDull(on)
            void FX.to(scene, view.root, { angle: on ? -3.5 : 0 }, { duration: 260 })
            if (!on) return
            station.halo.setVisible(true).setAlpha(0).setScale(0.86)
            scene.tweens.add({
                targets: station.halo,
                alpha: 1,
                scale: 1,
                duration: FX.ms(scene, 260),
                ease: 'Back.easeOut',
                onComplete: () => {
                    scene.tweens.add({
                        targets: station.halo,
                        alpha: 0.45,
                        duration: FX.ms(scene, 760),
                        yoyo: true,
                        repeat: -1,
                        ease: 'Sine.easeInOut',
                    })
                },
            })
        },

        async swap(side: Side, id: DeviceId, from: { x: number; y: number; scale: number }) {
            const station = stations[side]
            const old = station.view
            stopHalo(station)
            station.marked = false
            station.view = null

            const view = place(side, id)
            view.root.setPosition(from.x, from.y + liftOf(view, from.scale)).setScale(from.scale)

            const leave = old
                ? (() => {
                      old.setActive(false)
                      old.setDull(false)
                      scene.tweens.killTweensOf(old.root)
                      return FX.all(
                          FX.arcTo(
                              scene,
                              old.root,
                              { x: from.x, y: from.y + liftOf(old, from.scale) },
                              { height: -64, duration: 440 },
                          ),
                          FX.to(scene, old.root, { scale: from.scale, angle: 0 }, { duration: 440 }),
                      ).then(() => FX.to(scene, old.root, { alpha: 0, scale: from.scale * 0.6 }, { duration: 180 }))
                  })()
                : Promise.resolve()

            await FX.all(
                leave,
                FX.arcTo(scene, view.root, { x: station.x, y: TABLE.top }, { height: 116, duration: 440 }),
                FX.to(scene, view.root, { scale: 1 }, { duration: 440 }),
            )
            old?.destroy()
            await FX.to(scene, view.root, { scaleY: 0.9, scaleX: 1.06 }, { duration: 80, yoyo: true })
            view.root.setScale(1)
        },

        activate(side: Side, on: boolean) {
            stations[side].view?.setActive(on)
        },

        center(side: Side) {
            const station = stations[side]
            return { x: station.x, y: TABLE.top - station.fit.h / 2 }
        },

        screen() {
            const view = stations.output.view
            if (!view || view.id !== 'monitor') return null
            const b = boxOf('monitor')
            const s = view.scale
            return {
                x: STATION.output.x + ((MONITOR_SCREEN.x + MONITOR_SCREEN.r) / 2 - (b.x + b.r) / 2) * s,
                y: TABLE.top - (b.b - (MONITOR_SCREEN.y + MONITOR_SCREEN.b) / 2) * s,
                w: (MONITOR_SCREEN.r - MONITOR_SCREEN.x) * s,
                h: (MONITOR_SCREEN.b - MONITOR_SCREEN.y) * s,
            }
        },

        printerSlot() {
            const view = stations.output.view
            if (!view || view.id !== 'printer') return null
            const b = boxOf('printer')
            return {
                x: STATION.output.x + (PRINTER_SLOT.x - (b.x + b.r) / 2) * view.scale,
                y: TABLE.top - PRINTER_SLOT.aboveBottom * view.scale,
                w: PRINTER_SLOT.w * view.scale,
            }
        },

        cone() {
            const view = stations.output.view
            if (!view) return this.center('output')
            const b = boxOf(view.id)
            return {
                x: STATION.output.x + (SPEAKER_CONE.x - (b.x + b.r) / 2) * view.scale,
                y: TABLE.top - (b.b - SPEAKER_CONE.y) * view.scale,
            }
        },

        async bump(side: Side) {
            const view = stations[side].view
            if (!view) return
            await FX.shake(scene, view.root, { amount: 9, times: 2 })
        },

        async hop(side: Side) {
            const view = stations[side].view
            if (!view) return
            await FX.to(scene, view.root, { y: TABLE.top - 16 }, { duration: 140, yoyo: true, ease: 'Sine.easeOut' })
            view.root.setY(TABLE.top)
        },

        showLock(side: Side) {
            const station = stations[side]
            scene.tweens.killTweensOf(lock)
            lock
                .setPosition(station.x + STATION.slot.w / 2 - 6, TABLE.top - STATION.slot.h + 8)
                .setVisible(true)
                .setScale(0.3)
            void FX.to(scene, lock, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        async openLock() {
            if (!lock.visible) return
            scene.tweens.killTweensOf(lock)
            await FX.to(scene, lock, { y: lock.y - 30, alpha: 0, angle: 20 }, { duration: 300 })
            lock.setVisible(false).setAlpha(1).setAngle(0)
        },

        hideLock() {
            scene.tweens.killTweensOf(lock)
            lock.setVisible(false).setAlpha(1).setAngle(0)
        },

        clear(side: Side) {
            const station = stations[side]
            drop(station)
            stopSlot(station)
        },

        destroy() {
            ;(['input', 'output'] as Side[]).forEach(side => {
                drop(stations[side])
                scene.tweens.killTweensOf(stations[side].slot)
                stations[side].slot.destroy(true)
                stations[side].halo.destroy()
            })
            scene.tweens.killTweensOf(lock)
            lock.destroy()
        },
    }
}

export type Stations = ReturnType<typeof createStations>
