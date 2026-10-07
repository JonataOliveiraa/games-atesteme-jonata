import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICES } from '../data/devices'
import { PIECE, SCREEN_AREA } from '../data/files'
import { BALL, DEPTH, PORT, SIDE, SLOT, TABLE } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { ContentId, DeviceId } from '../types'
import { contentView, deviceImage, emptyView, pieceImage } from './art'

const SOUND: ContentId[] = ['music', 'voice', 'story']
type Point = { x: number; y: number }

export interface DeviceView {
    readonly id: DeviceId
    show(on: boolean, pop?: boolean): Promise<void>
    awake(on: boolean): void
    contains(px: number, py: number): boolean
    rect(): { x: number; y: number; w: number; h: number }
    /** onde a bolinha nasce (entrada) ou some (saída), do lado de dentro da parede */
    mouth(): Point
    /** os dois pontos do fio: do aparelho até a parede (entrada) ou da parede até o aparelho (saída) */
    wire(): { from: Point; to: Point }
    /** entrada: o aparelho é usado e a informação sai dele até o fio */
    use(content: ContentId | null): Promise<void>
    /** a informação corre pelo fio */
    travel(content: ContentId | null, ms: number): Promise<void>
    perform(content: ContentId): Promise<void>
    clear(): void
    /** só saídas: a porta na parede e o sensor que pega a bolinha */
    door(state: 'off' | 'closed' | 'open'): void
    readonly x: number
    readonly y: number
    readonly visible: boolean
    destroy(): void
}

function makeDevice(scene: Phaser.Scene, id: DeviceId): DeviceView {
    const device = DEVICES[id]
    const isInput = device.row === 'input'
    const slot = SLOT[id]
    const x = isInput ? SIDE.inputX : SIDE.outputX
    const y = slot.y
    const tone = isInput ? C.input : C.output
    const cardTop = y - SIDE.cardH / 2 - 6

    const card = scene.add.graphics()
    const art = deviceImage(scene, id, SIDE.size).setPosition(0, -12)
    const label = scene.add
        .text(0, SIDE.plateDY, device.name, { fontFamily: FONT.black, fontSize: `${SIZE.plate}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    if (label.width > SIDE.cardW - 30) label.setScale((SIDE.cardW - 30) / label.width)
    const paintCard = (on: boolean) => {
        const w = SIDE.cardW
        const h = SIDE.cardH
        const top = -h / 2 - 6
        card.clear()
        card.fillStyle(C.shadow, 0.16)
        card.fillRoundedRect(-w / 2 + 4, top + 7, w, h, 26)
        card.fillStyle(on ? C.white : C.cream, 1)
        card.fillRoundedRect(-w / 2, top, w, h, 26)
        card.lineStyle(on ? 5 : 4, on ? tone : C.creamDark, 1)
        card.strokeRoundedRect(-w / 2, top, w, h, 26)
        const pw = w - 18
        const ph = 30
        card.fillStyle(on ? tone : C.asleep, 1)
        card.fillRoundedRect(-pw / 2, SIDE.plateDY - ph / 2, pw, ph, ph / 2)
        label.setColor(on ? CSS.white : CSS.inkSoft)
    }
    paintCard(false)
    const box = scene.add.container(x, y, [card, art, label]).setDepth(DEPTH.device).setVisible(false)

    const outer = isInput ? TABLE.left - TABLE.wall - 8 : TABLE.right + TABLE.wall + 8
    const inner = isInput ? TABLE.left : TABLE.right
    const plugX = isInput ? x + SIDE.cardW / 2 - 4 : x - SIDE.cardW / 2 + 4
    const ends = isInput ? { from: { x: plugX, y }, to: { x: outer + 6, y: slot.port } } : { from: { x: outer - 6, y: slot.port }, to: { x: plugX, y } }
    const curve = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(ends.from.x, ends.from.y),
        new Phaser.Math.Vector2(ends.from.x + 56, ends.from.y),
        new Phaser.Math.Vector2(ends.to.x - 56, ends.to.y),
        new Phaser.Math.Vector2(ends.to.x, ends.to.y),
    )
    const points = curve.getPoints(32)
    const cable = scene.add.graphics().setDepth(DEPTH.cable).setVisible(false)
    const paintCable = (state: 'off' | 'on' | 'hot') => {
        cable.clear()
        cable.lineStyle(14, C.ink, 1)
        cable.strokePoints(points)
        cable.lineStyle(8, state === 'off' ? C.cable : state === 'hot' ? C.glow : tone, 1)
        cable.strokePoints(points)
        cable.fillStyle(C.ink, 1)
        cable.fillRoundedRect(plugX - 9, y - 11, 18, 22, 6)
    }
    paintCable('off')

    const socket = scene.add.graphics().setDepth(DEPTH.walls).setVisible(false)
    let doorState: 'off' | 'closed' | 'open' = 'off'
    let isAwake = false
    const paintSocket = () => {
        socket.clear()
        const h = isInput ? PORT.h : PORT.door
        const sx = Math.min(outer, inner)
        const sw = Math.abs(inner - outer)
        const awake = isInput ? isAwake : doorState !== 'off'
        socket.fillStyle(awake ? tone : C.asleep, 1)
        socket.fillRoundedRect(sx - 2, slot.port - h / 2 - 6, sw + 4, h + 12, 8)
        socket.lineStyle(3, C.ink, 1)
        socket.strokeRoundedRect(sx - 2, slot.port - h / 2 - 6, sw + 4, h + 12, 8)
        const mouthX = isInput ? inner - 8 : inner - 2
        if (!isInput && doorState === 'open') {
            socket.fillStyle(C.glow, 0.35)
            socket.fillEllipse(inner - 10, slot.port, 64, h + 30)
            socket.fillStyle(C.glow, 1)
            socket.fillRoundedRect(mouthX - 4, slot.port - h / 2, 14, h, 6)
            socket.fillStyle(C.ink, 1)
            ;[-34, -60].forEach(dx => {
                const ax = inner + dx
                socket.fillTriangle(ax, slot.port - 12, ax, slot.port + 12, ax + 16, slot.port)
            })
            return
        }
        socket.fillStyle(C.screenOff, 1)
        socket.fillRoundedRect(mouthX - 2, slot.port - h / 2, 10, h, 4)
        if (!isInput) {
            socket.lineStyle(3, C.deviceGrey, 1)
            for (let k = 1; k < 4; k++) socket.lineBetween(mouthX - 2, slot.port - h / 2 + (k * h) / 4, mouthX + 8, slot.port - h / 2 + (k * h) / 4)
        }
    }

    let sensor: MatterJS.BodyType | undefined
    const extras: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        extras.push(obj)
        return obj
    }

    const screenRect = () => {
        const w = art.displayWidth
        const h = art.displayHeight
        return {
            x: box.x + art.x + (SCREEN_AREA.x - 0.5) * w,
            y: box.y + art.y + (SCREEN_AREA.y - 0.5) * h,
            w: SCREEN_AREA.w * w,
            h: SCREEN_AREA.h * h,
        }
    }

    const notes = async (count: number) => {
        for (let k = 0; k < count; k++) {
            const n = keep(contentView(scene, 'music', 42).setPosition(box.x + (k % 2 ? 34 : -34), box.y - 30).setDepth(DEPTH.fx))
            void FX.to(scene, n, { y: box.y - 90, x: n.x + (k % 2 ? 50 : -50), alpha: 0 }, { duration: 1100 })
            await FX.wait(scene, 180)
        }
    }

    const fizz = () => {
        const g = keep(scene.add.graphics().setDepth(DEPTH.fx))
        g.lineStyle(4, C.inkSoft, 1)
        for (let k = 0; k < 3; k++) {
            const yy = box.y - 60 - k * 16
            g.beginPath()
            g.moveTo(box.x - 34, yy)
            for (let s = 1; s <= 6; s++) g.lineTo(box.x - 34 + s * 11, yy + (s % 2 ? -7 : 7))
            g.strokePath()
        }
        void FX.to(scene, g, { alpha: 0 }, { duration: 1200, delay: 500 })
    }

    const rider = (content: ContentId | null) => {
        const glow = scene.add.circle(0, 0, 18, C.glow, 0.95).setStrokeStyle(3, C.white, 0.9)
        const icon = content ? contentView(scene, content, 52) : emptyView(scene, 52)
        icon.setY(-38)
        return keep(scene.add.container(0, 0, [glow, icon]).setDepth(DEPTH.fx))
    }

    return {
        id,
        async show(on, pop = false) {
            box.setVisible(on)
            cable.setVisible(on)
            socket.setVisible(on)
            paintSocket()
            if (!on) return
            if (pop) {
                box.setScale(0.3)
                await FX.to(scene, box, { scale: 1 }, { duration: 380, ease: 'Back.easeOut' })
            }
        },
        awake(on) {
            isAwake = on
            art.setAlpha(on ? 1 : 0.55)
            paintCard(on)
            paintCable(on ? 'on' : 'off')
            paintSocket()
        },
        contains(px, py) {
            return box.visible && Math.abs(px - box.x) <= SIDE.cardW / 2 + 10 && Math.abs(py - (cardTop + SIDE.cardH / 2)) <= SIDE.cardH / 2 + 10
        },
        rect() {
            return { x: box.x, y: cardTop + SIDE.cardH / 2, w: SIDE.cardW + 24, h: SIDE.cardH + 24 }
        },
        mouth() {
            return isInput ? { x: inner + BALL.r + 6, y: slot.port } : { x: inner - 14, y: slot.port }
        },
        wire() {
            return ends
        },
        async use(content) {
            if (id === 'camera') {
                const flash = keep(scene.add.circle(box.x, box.y - 12, 70, C.white, 0.95).setDepth(DEPTH.fx))
                void FX.to(scene, flash, { alpha: 0, scale: 1.7 }, { duration: 360 })
            } else if (id === 'mic') {
                for (let k = 0; k < 3; k++) {
                    const ring = keep(scene.add.circle(box.x, box.y - 30, 30, C.note, 0).setStrokeStyle(4, C.note, 0.8).setDepth(DEPTH.fx))
                    void FX.to(scene, ring, { scale: 2.2, alpha: 0 }, { duration: 600, delay: k * 140 })
                }
            }
            for (let k = 0; k < 3; k++) {
                void FX.impact(scene, box, 0.08)
                await FX.wait(scene, 110)
            }
            const r = keep(rider(content))
            r.setPosition(box.x, box.y - 10).setScale(0.2)
            await FX.to(scene, r, { scale: 1.4, x: box.x + 24, y: box.y - 24 }, { duration: 380, ease: 'Back.easeOut' })
            await FX.wait(scene, 260)
            await FX.to(scene, r, { x: ends.from.x, y: ends.from.y, scale: 1 }, { duration: 320, ease: 'Sine.easeInOut' })
            r.destroy()
        },
        async travel(content, ms) {
            paintCable('hot')
            const r = rider(content)
            const at = curve.getPoint(0)
            r.setPosition(at.x, at.y)
            const k = { t: 0 }
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const p = curve.getPoint(k.t)
                        r.setPosition(p.x, p.y)
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                }),
            )
            r.destroy()
            paintCable('on')
        },
        async perform(content) {
            void FX.impact(scene, box, 0.12)
            if (id === 'speaker') {
                if (SOUND.includes(content)) await notes(4)
                else fizz()
                return
            }
            if (id === 'screen') {
                const sr = screenRect()
                const glow = keep(scene.add.rectangle(sr.x, sr.y, sr.w, sr.h, C.white, 1).setDepth(DEPTH.device + 0.5))
                const view = keep(contentView(scene, content, Math.min(sr.w, sr.h) * 0.92).setPosition(sr.x, sr.y).setDepth(DEPTH.device + 0.6))
                glow.setAlpha(0)
                view.setScale(0.4)
                await FX.all(FX.to(scene, glow, { alpha: 1 }, { duration: 200 }), FX.to(scene, view, { scale: 1 }, { duration: 300, ease: 'Back.easeOut' }))
                return
            }
            if (id === 'printer') {
                const sheet = pieceImage(scene, PIECE.paper, 90)
                const view = contentView(scene, content, 58)
                const paper = keep(scene.add.container(box.x, box.y - 20, [sheet, view]).setDepth(DEPTH.device - 0.5))
                await FX.to(scene, paper, { y: box.y - 110 }, { duration: 700, ease: 'Sine.easeOut' })
                paper.setDepth(DEPTH.fx)
            }
        },
        door(state) {
            doorState = state
            paintSocket()
            if (sensor) scene.matter.world?.remove(sensor)
            sensor = undefined
            if (state !== 'open') return
            sensor = scene.matter.add.rectangle(inner - 6, slot.port, 16, PORT.door - 6, { isStatic: true, isSensor: true, label: `door-${id}` })
        },
        clear() {
            extras.forEach(e => e.destroy())
            extras.length = 0
        },
        get x() {
            return box.x
        },
        get y() {
            return box.y
        },
        get visible() {
            return box.visible
        },
        destroy() {
            extras.forEach(e => e.destroy())
            if (sensor) scene.matter.world?.remove(sensor)
            cable.destroy()
            socket.destroy()
            box.destroy()
        },
    }
}

export type Devices = Record<DeviceId, DeviceView>

export function createDevices(scene: Phaser.Scene): Devices {
    const ids: DeviceId[] = ['keyboard', 'mic', 'camera', 'speaker', 'screen', 'printer']
    return Object.fromEntries(ids.map(id => [id, makeDevice(scene, id)])) as Devices
}
