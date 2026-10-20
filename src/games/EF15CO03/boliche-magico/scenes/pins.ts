import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { EXTRAS_SHEET, EXTRA_CELL, PINS_SHEET, bodyCell, cellKey, faceCell, sheetScale } from '../data/files'
import { LANE, PIN, WD } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Face, Pin, Rect, Vec } from '../types'
import { SPARK, baked } from './art'
import type { View } from './view'

export interface PinView {
    def: Pin
    x: number
    k: number
    box: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Image
    zz?: Phaser.GameObjects.Text
    down: boolean
}

export interface Pins {
    set(pins: Pin[]): Promise<void>
    list(): PinView[]
    bounce(i: number): Promise<void>
    knock(i: number): Promise<void>
    hop(i: number, ms: number): Promise<void>
    sulk(i: number): Promise<void>
    celebrate(): Promise<void>
    push(x: number): void
    head(i: number): Vec
    rowRect(): Rect
    sleepyRect(): Rect
    clear(): void
    destroy(): void
}

const SHADOW = 'bm-pin-shadow'

export function createPins(scene: Phaser.Scene, view: View, onDrop: () => void): Pins {
    baked(scene, SHADOW, PIN.shadowW, PIN.shadowH, g => {
        g.fillStyle(C.shadow, 0.22)
        g.fillEllipse(PIN.shadowW / 2, PIN.shadowH / 2, PIN.shadowW, PIN.shadowH)
    })
    let views: PinView[] = []
    let orbits: Phaser.GameObjects.Image[] = []
    let orbitTweens: Phaser.Tweens.Tween[] = []

    const reach = (v: PinView) => (PIN.foot - PIN.headY) * PIN.scale * v.k

    const placeZz = (v: PinView) => {
        if (!v.zz) return
        if (v.down) {
            const d = reach(v) * PIN.lieScale
            v.zz.setPosition(v.box.x + d + 18, v.box.y - 70)
        } else {
            v.zz.setPosition(v.box.x + PIN.zzDX * v.k, v.box.y - PIN.zzDY * v.k)
        }
    }

    const make = (def: Pin, x: number): PinView => {
        const k = def.size === 'pequeno' ? PIN.small : 1
        const s = PIN.scale * k
        const ps = s * sheetScale(scene, PINS_SHEET)
        const es = s * sheetScale(scene, EXTRAS_SHEET)
        const oy = PIN.foot / PIN.cellH
        const body = scene.add.image(0, 0, PINS_SHEET.key, cellKey(bodyCell(def.color))).setOrigin(0.5, oy).setScale(ps)
        const face = scene.add.image(0, 0, PINS_SHEET.key, cellKey(faceCell(def.sleepy ? 'sleepy' : 'awake'))).setOrigin(0.5, oy).setScale(ps)
        const layers: Phaser.GameObjects.Image[] = [body]
        if (def.star) layers.push(scene.add.image(0, 0, EXTRAS_SHEET.key, cellKey(EXTRA_CELL.star)).setOrigin(0.5, oy).setScale(es))
        layers.push(face)
        if (def.glasses) layers.push(scene.add.image(0, 0, EXTRAS_SHEET.key, cellKey(EXTRA_CELL.glasses)).setOrigin(0.5, oy).setScale(es))
        const box = view.add(scene.add.container(x, LANE.floor, layers), WD.pin)
        const shadow = view.add(scene.add.image(x, LANE.floor + 2, SHADOW).setScale(k), WD.shadow)
        const v: PinView = { def, x, k, box, face, shadow, down: false }
        if (def.sleepy) {
            v.zz = view.add(
                scene.add
                    .text(0, 0, 'Zz', { fontFamily: FONT.black, fontSize: `${SIZE.zz}px`, color: CSS.zz, stroke: '#ffffff', strokeThickness: 6 })
                    .setOrigin(0.5)
                    .setResolution(2),
                WD.zz,
            )
            placeZz(v)
        }
        return v
    }

    const setFace = (v: PinView, f: Face) => v.face.setFrame(cellKey(faceCell(f)))

    const stopOrbits = () => {
        orbitTweens.forEach(t => t.stop())
        orbitTweens = []
        orbits.forEach(o => o.destroy())
        orbits = []
    }

    const dizzyStars = (v: PinView) => {
        const center = { x: v.box.x + reach(v) * PIN.lieScale, y: v.box.y - 50 }
        for (let n = 0; n < 3; n++) {
            const star = view.add(scene.add.image(center.x, center.y, SPARK), WD.fx)
            orbits.push(star)
            const t = { a: (n * Math.PI * 2) / 3 }
            orbitTweens.push(
                scene.tweens.add({
                    targets: t,
                    a: t.a + Math.PI * 2,
                    duration: 1100,
                    repeat: -1,
                    onUpdate: () => star.setPosition(center.x + Math.cos(t.a) * 38, center.y + Math.sin(t.a) * 12),
                }),
            )
        }
    }

    const clear = () => {
        stopOrbits()
        views.forEach(v => {
            scene.tweens.killTweensOf([v.box, v.shadow, ...(v.zz ? [v.zz] : [])])
            v.box.destroy()
            v.shadow.destroy()
            v.zz?.destroy()
        })
        views = []
    }

    const toScreenBox = (vs: PinView[]): Rect => {
        const left = Math.min(...vs.map(v => v.box.x - 70 * v.k))
        const right = Math.max(...vs.map(v => v.box.x + 70 * v.k))
        const top = Math.min(...vs.map(v => v.box.y - (PIN.zzDY + 26) * v.k))
        const bottom = LANE.floor + 14
        return view.toScreenRect({ x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top })
    }

    return {
        async set(pins) {
            clear()
            views = pins.map((def, i) => make(def, PIN.xs[i]))
            await FX.all(
                ...views.map((v, i) => {
                    const lift = 560
                    v.box.setY(LANE.floor - lift)
                    v.shadow.setScale(0.2 * v.k).setAlpha(0)
                    v.zz?.setAlpha(0)
                    return FX.wait(scene, i * TIMING.dropGap).then(async () => {
                        onDrop()
                        void FX.to(scene, v.shadow, { scale: v.k, alpha: 1 }, { duration: TIMING.drop })
                        await FX.to(scene, v.box, { y: LANE.floor }, { duration: TIMING.drop, ease: 'Bounce.easeOut' })
                        if (v.zz) {
                            placeZz(v)
                            await FX.to(scene, v.zz, { alpha: 1 }, { duration: 200 })
                        }
                    })
                }),
            )
        },
        list: () => views,
        async bounce(i) {
            const v = views[i]
            if (!v) return
            await FX.to(scene, v.box, { y: LANE.floor - 14 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            v.box.setY(LANE.floor)
        },
        async knock(i) {
            const v = views[i]
            if (!v) return
            v.down = true
            v.zz?.setVisible(false)
            setFace(v, v.def.sleepy ? 'asleep' : 'dizzy')
            v.box.setDepth(WD.pin - 1)
            view.restack()
            void FX.to(scene, v.shadow, { scaleX: v.k * 2, alpha: 0.7 }, { duration: TIMING.knock })
            await FX.to(
                scene,
                v.box,
                { angle: 90, x: v.x + PIN.fallX, y: LANE.floor - PIN.lieBack, scale: PIN.lieScale },
                { duration: TIMING.knock, ease: 'Quad.easeIn' },
            )
            await FX.to(scene, v.box, { angle: 84 }, { duration: 110, yoyo: true })
            v.box.setAngle(90)
            if (v.def.sleepy && v.zz) {
                placeZz(v)
                v.zz.setVisible(true).setAlpha(0)
                void FX.to(scene, v.zz, { alpha: 1 }, { duration: 260 })
            } else if (!v.def.sleepy) dizzyStars(v)
        },
        async hop(i, ms) {
            const v = views[i]
            if (!v) return
            const up = LANE.floor - PIN.hop
            const zz = v.zz
            const zzY = zz?.y ?? 0
            void FX.to(scene, v.shadow, { scale: v.k * 0.5, alpha: 0.4 }, { duration: ms / 2, yoyo: true })
            if (zz) void FX.to(scene, zz, { y: zzY - PIN.hop }, { duration: ms / 2, ease: 'Quad.easeOut', yoyo: true })
            await FX.to(scene, v.box, { y: up, scaleY: 1.05 }, { duration: ms / 2, ease: 'Quad.easeOut' })
            await FX.to(scene, v.box, { y: LANE.floor, scaleY: 1 }, { duration: ms / 2, ease: 'Quad.easeIn' })
            zz?.setY(zzY)
            await FX.to(scene, v.box, { scaleX: 1.08, scaleY: 0.92 }, { duration: 90, yoyo: true })
            v.box.setScale(1)
        },
        async sulk(i) {
            const v = views[i]
            if (!v) return
            await FX.to(scene, v.box, { angle: -6 }, { duration: 160, yoyo: true, repeat: 2 })
            v.box.setAngle(0)
        },
        async celebrate() {
            const up = views.filter(v => !v.down)
            const lying = views.filter(v => v.down && v.zz)
            lying.forEach(v => {
                if (v.zz) void FX.to(scene, v.zz, { scale: 1.25 }, { duration: 300, yoyo: true, repeat: 1 })
            })
            await FX.all(
                ...up.map((v, n) =>
                    FX.wait(scene, n * 90).then(async () => {
                        for (let r = 0; r < 2; r++) {
                            await FX.to(scene, v.box, { y: LANE.floor - 34, angle: r % 2 ? -10 : 10 }, { duration: 180, ease: 'Quad.easeOut' })
                            await FX.to(scene, v.box, { y: LANE.floor, angle: 0 }, { duration: 180, ease: 'Quad.easeIn' })
                        }
                    }),
                ),
            )
        },
        push(x) {
            views.forEach(v => {
                const left = v.box.x - (v.down ? 20 : 50 * v.k)
                if (left >= x) return
                const dx = x - left
                v.box.x += dx
                v.shadow.x += dx
                if (v.zz) v.zz.x += dx
            })
            orbits.forEach(o => o.setVisible(false))
        },
        head(i) {
            const v = views[i]
            if (!v) return { x: 0, y: 0 }
            return view.toScreen(v.box.x, v.box.y - reach(v))
        },
        rowRect: () => toScreenBox(views),
        sleepyRect: () => toScreenBox(views.filter(v => v.def.sleepy)),
        clear,
        destroy: clear,
    }
}
