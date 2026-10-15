import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICES } from '../data/devices'
import { PIECE, SCREEN_AREA } from '../data/files'
import { COMPUTER, DEPTH, DOOR, DOOR_AT } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { DeviceId, InfoId } from '../types'
import { deviceImage, infoImage, pieceImage } from './art'

export interface DoorView {
    readonly id: DeviceId
    readonly x: number
    readonly y: number
    readonly visible: boolean
    show(on: boolean, pop?: boolean): Promise<void>
    awake(on: boolean): void
    contains(px: number, py: number): boolean
    rect(): { x: number; y: number; w: number; h: number }
    /** o aparelho funciona: a informação vai passar */
    open(): Promise<void>
    /** a informação bateu e voltou */
    refuse(): Promise<void>
    /** a informação corre pelo fio: para dentro (entrada) ou para fora (saída) */
    pulse(ms: number): Promise<void>
    /** saída: o aparelho faz o que faz com a informação (toca, mostra, imprime) */
    perform(info: InfoId): Promise<void>
    /** some com o que sobrou da última jogada */
    clear(): void
    destroy(): void
}

function makeDoor(scene: Phaser.Scene, id: DeviceId): DoorView {
    const device = DEVICES[id]
    const at = DOOR_AT[id]
    const tone = device.side === 'input' ? C.input : C.output
    const frame = scene.add.graphics()
    const glow = scene.add.graphics().setAlpha(0)
    const art = deviceImage(scene, id, DOOR.size).setPosition(0, -14)
    const label = scene.add
        .text(0, DOOR.plateDY, device.name, { fontFamily: FONT.black, fontSize: `${SIZE.plate}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    if (label.width > DOOR.w - 26) label.setScale((DOOR.w - 26) / label.width)
    const w = DOOR.w
    const h = DOOR.h
    const paint = (on: boolean) => {
        frame.clear()
        frame.fillStyle(C.shadow, 0.18)
        frame.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 28)
        frame.fillStyle(on ? C.white : C.cream, 1)
        frame.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
        frame.lineStyle(on ? 7 : 5, on ? tone : C.creamDark, 1)
        frame.strokeRoundedRect(-w / 2, -h / 2, w, h, 28)
        frame.fillStyle(on ? tone : C.asleep, 1)
        frame.fillRoundedRect(-w / 2 + 10, DOOR.plateDY - DOOR.plateH / 2, w - 20, DOOR.plateH, DOOR.plateH / 2)
        label.setColor(on ? CSS.white : CSS.inkSoft)
        art.setAlpha(on ? 1 : 0.5)
        paintCable(on)
    }
    glow.fillStyle(C.glow, 0.9)
    glow.fillRoundedRect(-w / 2 - 10, -h / 2 - 10, w + 20, h + 20, 34)
    const box = scene.add.container(at.x, at.y, [glow, frame, art, label]).setDepth(DEPTH.door).setVisible(false)

    const inward = device.side === 'input' ? 1 : -1
    const from = at.x + (inward * w) / 2
    const to = COMPUTER.x - inward * (COMPUTER.side - 6)
    const cable = scene.add.graphics().setDepth(DEPTH.cable).setVisible(false)
    const paintCable = (on: boolean) => {
        cable.clear()
        cable.lineStyle(16, C.ink, 1)
        cable.lineBetween(from, at.y, to, at.y)
        cable.lineStyle(9, on ? tone : C.deviceGrey, 1)
        cable.lineBetween(from, at.y, to, at.y)
        cable.fillStyle(on ? tone : C.deviceGrey, 1)
        cable.fillRoundedRect(to - DOOR.socketW / 2, at.y - DOOR.socketH / 2, DOOR.socketW, DOOR.socketH, 6)
        cable.lineStyle(3, C.ink, 1)
        cable.strokeRoundedRect(to - DOOR.socketW / 2, at.y - DOOR.socketH / 2, DOOR.socketW, DOOR.socketH, 6)
    }
    paint(false)
    const extras: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
        extras.push(obj)
        return obj
    }

    const act = async () => {
        if (id === 'mic') {
            for (let k = 0; k < 3; k++) {
                const ring = keep(scene.add.circle(at.x, at.y - 30, 28, C.note, 0).setStrokeStyle(5, C.note, 0.9).setDepth(DEPTH.fx))
                void FX.to(scene, ring, { scale: 2.4, alpha: 0 }, { duration: 620, delay: k * 140 })
            }
        } else if (id === 'camera') {
            const flash = keep(scene.add.circle(at.x, at.y - 14, 80, C.white, 1).setDepth(DEPTH.fx))
            void FX.to(scene, flash, { alpha: 0, scale: 1.8 }, { duration: 380 })
        } else if (id === 'keyboard') {
            for (let k = 0; k < 4; k++) {
                void FX.impact(scene, art, 0.12)
                await FX.wait(scene, 90)
            }
        }
    }

    return {
        id,
        get x() {
            return box.x
        },
        get y() {
            return box.y
        },
        get visible() {
            return box.visible
        },
        async show(on, pop = false) {
            box.setVisible(on)
            cable.setVisible(on)
            if (!on || !pop) return
            box.setScale(0.2)
            await FX.to(scene, box, { scale: 1 }, { duration: 420, ease: 'Back.easeOut' })
        },
        awake(on) {
            paint(on)
        },
        contains(px, py) {
            return box.visible && Math.abs(px - box.x) <= w / 2 + 8 && Math.abs(py - box.y) <= h / 2 + 8
        },
        rect() {
            return { x: box.x, y: box.y, w: w + 26, h: h + 26 }
        },
        async open() {
            glow.setAlpha(1)
            void FX.impact(scene, box, 0.1)
            await act()
            void FX.to(scene, glow, { alpha: 0 }, { duration: 700, delay: 300 })
        },
        async refuse() {
            const x = box.x
            await FX.to(scene, box, { x: x - 10 }, { duration: 50 })
            await FX.to(scene, box, { x: x + 10 }, { duration: 70, yoyo: true, repeat: 1 })
            box.setX(x)
        },
        async pulse(ms) {
            const [a, b] = device.side === 'input' ? [from, to] : [to, from]
            paintCable(true)
            const dot = keep(scene.add.circle(a, at.y, 15, C.glow, 1).setStrokeStyle(3, C.white).setDepth(DEPTH.fx))
            await FX.to(scene, dot, { x: b }, { duration: ms, ease: 'Sine.easeIn' })
            void FX.to(scene, dot, { scale: 2.2, alpha: 0 }, { duration: 260 })
        },
        async perform(info) {
            glow.setAlpha(1)
            void FX.to(scene, glow, { alpha: 0 }, { duration: 900, delay: 500 })
            void FX.impact(scene, box, 0.12)
            if (id === 'speaker') {
                if (info !== 'note') {
                    const g = keep(scene.add.graphics().setDepth(DEPTH.fx))
                    g.lineStyle(5, C.inkSoft, 1)
                    for (let k = 0; k < 3; k++) {
                        const yy = at.y - 60 - k * 18
                        g.beginPath()
                        g.moveTo(at.x - 40, yy)
                        for (let s = 1; s <= 7; s++) g.lineTo(at.x - 40 + s * 12, yy + (s % 2 ? -8 : 8))
                        g.strokePath()
                    }
                    await FX.to(scene, g, { alpha: 0 }, { duration: 900, delay: 400 })
                    return
                }
                for (let k = 0; k < 4; k++) {
                    const n = keep(pieceImage(scene, PIECE.music, 44).setPosition(at.x + (k % 2 ? 34 : -34), at.y - 30).setDepth(DEPTH.fx))
                    void FX.to(scene, n, { y: at.y - 120, x: n.x + (k % 2 ? 60 : -30), alpha: 0 }, { duration: 1100 })
                    await FX.wait(scene, 170)
                }
                await FX.wait(scene, 500)
                return
            }
            if (id === 'screen') {
                const w2 = art.displayWidth
                const h2 = art.displayHeight
                const sx = at.x + art.x + (SCREEN_AREA.x - 0.5) * w2
                const sy = at.y + art.y + (SCREEN_AREA.y - 0.5) * h2
                const sw = SCREEN_AREA.w * w2
                const sh = SCREEN_AREA.h * h2
                const light = keep(scene.add.rectangle(sx, sy, sw, sh, C.white, 1).setDepth(DEPTH.door + 0.5).setAlpha(0))
                const pic = keep(infoImage(scene, info, 'happy', sh * 0.95).setPosition(sx, sy + sh * 0.47).setDepth(DEPTH.door + 0.6).setScale(0.1))
                const scale = (sh * 0.95) / pic.height
                await FX.all(FX.to(scene, light, { alpha: 1 }, { duration: 200 }), FX.to(scene, pic, { scale }, { duration: 320, ease: 'Back.easeOut' }))
                await FX.wait(scene, 500)
                return
            }
            if (id === 'printer') {
                const sheet = pieceImage(scene, PIECE.paper, 84)
                const pic = infoImage(scene, info, 'happy', 50).setPosition(0, 25)
                const paper = keep(scene.add.container(at.x, at.y - 20, [sheet, pic]).setDepth(DEPTH.door - 0.5))
                await FX.to(scene, paper, { y: at.y - 118 }, { duration: 760, ease: 'Sine.easeOut' })
                paper.setDepth(DEPTH.fx)
                await FX.wait(scene, 300)
            }
        },
        clear() {
            extras.forEach(e => e.destroy())
            extras.length = 0
        },
        destroy() {
            extras.forEach(e => e.destroy())
            cable.destroy()
            box.destroy()
        },
    }
}

export type Doors = Record<DeviceId, DoorView>

export function createDoors(scene: Phaser.Scene): Doors {
    const ids: DeviceId[] = ['mic', 'camera', 'keyboard', 'speaker', 'screen', 'printer']
    return Object.fromEntries(ids.map(id => [id, makeDoor(scene, id)])) as Doors
}
