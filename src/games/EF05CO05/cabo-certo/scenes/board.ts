import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEVICES, KIND_NAME } from '../data/devices'
import { FLOOR_KEY, PC_KEY, PIECE_CELL, PIECE_SHEET, cellKey } from '../data/files'
import { DEPTH, PC, SOCKET, WORLD } from '../data/layout'
import type { Net } from '../data/route'
import { C, FONT, KIND_COLOR, SIZE, inkOn } from '../data/theme'
import { LABEL } from '../data/words'
import type { Kind, Rect, Vec } from '../types'
import type { View } from './view'

/** O chão, o computador com o processador e todas as tomadas (as do computador e as dos aparelhos). */
export interface Board {
    socketAt(id: string): Vec
    chip(): Vec
    pcRect(): Rect
    /** As tomadas de uma família no computador, com a placa. */
    groupRect(kind: Kind): Rect
    socketRect(id: string): Rect
    think(on: boolean): void
    blink(): void
    refresh(net: Net): void
    dragging(net: Net | null): void
    hover(id: string | null): void
    point(id: string | null): void
    destroy(): void
}

interface SocketView {
    id: string
    kind: Kind
    at: Vec
    sprite: Phaser.GameObjects.Image
    plate?: Phaser.GameObjects.Container
    owned: boolean
}

export function createBoard(scene: Phaser.Scene, view: View, net: Net): Board {
    const floor = view.world(scene.add.image(0, 0, FLOOR_KEY).setOrigin(0).setDepth(DEPTH.floor))
    floor.setDisplaySize(WORLD.w, WORLD.h)

    const pc = view.world(scene.add.image(PC.x, PC.y, PC_KEY).setDepth(DEPTH.pc))
    pc.setDisplaySize(PC.w + 40, PC.h + 40)

    const chipAt = { x: PC.x + PC.chip.x, y: PC.y + PC.chip.y }
    const glow = view.world(scene.add.graphics().setDepth(DEPTH.pc + 1))
    glow.fillStyle(C.think, 1)
    glow.fillRoundedRect(-PC.chipSize / 2 - 14, -PC.chipSize / 2 - 14, PC.chipSize + 28, PC.chipSize + 28, 26)
    glow.setPosition(chipAt.x, chipAt.y).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD)
    let thinking: Phaser.Tweens.Tween | undefined

    const chipLabel = plate(LABEL.chip, C.graphite, { x: PC.x, y: PC.y + 22 }, 0.85)

    function plate(text: string, tone: number, at: Vec, scale = 1) {
        const label = scene.add
            .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.plate}px`, color: inkOn(tone) })
            .setOrigin(0.5)
            .setResolution(2)
        const w = label.width + 30
        const h = label.height + 10
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.18)
        g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, h / 2)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        const box = scene.add.container(at.x, at.y, [g, label]).setDepth(DEPTH.plate).setScale(scale)
        return view.world(box)
    }

    const sockets = new Map<string, SocketView>()
    net.sockets.forEach(info => {
        const owner = info.owner === 'pc' ? { x: PC.x, y: PC.y } : DEVICES[info.owner].at
        const at = { x: owner.x + info.at.x, y: owner.y + info.at.y }
        const sprite = view.world(
            scene.add
                .image(at.x, at.y, PIECE_SHEET.key, cellKey(PIECE_CELL[info.kind]))
                .setDisplaySize(SOCKET.size, SOCKET.size)
                .setDepth(DEPTH.socket),
        )
        const owned = info.owner !== 'pc'
        const s: SocketView = { id: info.id, kind: info.kind, at, sprite, owned }
        if (owned) s.plate = plate(KIND_NAME[info.kind], KIND_COLOR[info.kind], { x: at.x, y: at.y - 58 }, 0.72)
        sockets.set(info.id, s)
    })

    const pcOf = (kind: Kind) => [...sockets.values()].filter(s => !s.owned && s.kind === kind)
    const groupPlate: Partial<Record<Kind, Phaser.GameObjects.Container>> = {}
    ;(['entrada', 'saida', 'armazenamento'] as Kind[]).forEach(kind => {
        const list = pcOf(kind)
        if (!list.length) return
        const xs = list.map(s => s.at.x)
        const ys = list.map(s => s.at.y)
        const x = (Math.min(...xs) + Math.max(...xs)) / 2
        const at =
            kind === 'armazenamento' ? { x, y: Math.max(...ys) + 58 } : { x: x + (kind === 'entrada' ? -40 : 40), y: Math.min(...ys) - 64 }
        groupPlate[kind] = plate(KIND_NAME[kind], KIND_COLOR[kind], at)
    })

    const base = SOCKET.size
    let hovered: string | null = null
    let pointed: string | null = null
    const pulses = new Map<string, Phaser.Tweens.Tween>()

    const stopPulse = (id: string) => {
        pulses.get(id)?.stop()
        pulses.delete(id)
    }

    const board: Board = {
        socketAt: id => sockets.get(id)?.at ?? { x: PC.x, y: PC.y },
        chip: () => chipAt,
        pcRect: () => ({ x: PC.x, y: PC.y, w: PC.w + 140, h: PC.h + 150 }),
        groupRect(kind) {
            const list = pcOf(kind)
            const items: Rect[] = list.map(s => ({ x: s.at.x, y: s.at.y, w: base + 20, h: base + 20 }))
            const p = groupPlate[kind]
            if (p) items.push({ x: p.x, y: p.y, w: p.getBounds().width + 20, h: p.getBounds().height + 20 })
            const left = Math.min(...items.map(r => r.x - r.w / 2))
            const right = Math.max(...items.map(r => r.x + r.w / 2))
            const top = Math.min(...items.map(r => r.y - r.h / 2))
            const bottom = Math.max(...items.map(r => r.y + r.h / 2))
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        socketRect(id) {
            const s = sockets.get(id)
            const at = s?.at ?? { x: PC.x, y: PC.y }
            return { x: at.x, y: at.y - 20, w: base + 60, h: base + 110 }
        },
        think(on) {
            thinking?.stop()
            thinking = undefined
            if (!on) {
                FX.to(scene, glow, { alpha: 0 }, { duration: 200 })
                return
            }
            glow.setAlpha(0.2)
            thinking = scene.tweens.add({ targets: glow, alpha: 0.75, duration: 220, yoyo: true, repeat: -1 })
        },
        blink() {
            scene.tweens.killTweensOf(chipLabel)
            chipLabel.setScale(0.85)
            void FX.to(scene, chipLabel, { scale: 1 }, { duration: 140, yoyo: true })
        },
        refresh(current) {
            sockets.forEach(s => {
                if (!s.owned) return
                const on = current.open(s.id)
                s.sprite.setVisible(on)
                s.plate?.setVisible(on)
            })
        },
        dragging(current) {
            sockets.forEach(s => {
                stopPulse(s.id)
                s.sprite.setDisplaySize(base, base)
                s.sprite.setAlpha(1)
                if (!current || !s.sprite.visible) return
                if (current.occupant(s.id)) {
                    s.sprite.setAlpha(0.55)
                    return
                }
                const k = { t: 0 }
                pulses.set(
                    s.id,
                    scene.tweens.add({
                        targets: k,
                        t: 1,
                        duration: 520,
                        yoyo: true,
                        repeat: -1,
                        onUpdate: () => {
                            if (s.id === hovered) return
                            const size = base * (1 + 0.1 * k.t)
                            s.sprite.setDisplaySize(size, size)
                        },
                    }),
                )
            })
        },
        hover(id) {
            if (id === hovered) return
            const old = hovered ? sockets.get(hovered) : undefined
            old?.sprite.setDisplaySize(base, base)
            hovered = id
            const s = id ? sockets.get(id) : undefined
            s?.sprite.setDisplaySize(base * 1.32, base * 1.32)
        },
        point(id) {
            if (pointed) stopPulse(`point-${pointed}`)
            const old = pointed ? sockets.get(pointed) : undefined
            old?.plate?.setScale(0.72)
            pointed = id
            const s = id ? sockets.get(id) : undefined
            if (!s?.plate) return
            pulses.set(`point-${id}`, scene.tweens.add({ targets: s.plate, scale: 0.9, duration: 420, yoyo: true, repeat: -1 }))
        },
        destroy() {
            pulses.forEach(t => t.stop())
            thinking?.stop()
            sockets.forEach(s => {
                s.sprite.destroy()
                s.plate?.destroy()
            })
            Object.values(groupPlate).forEach(p => p?.destroy())
            chipLabel.destroy()
            glow.destroy()
            pc.destroy()
            floor.destroy()
        },
    }
    board.refresh(net)
    return board
}
