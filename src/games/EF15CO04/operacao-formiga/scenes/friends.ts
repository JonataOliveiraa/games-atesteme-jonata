import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FRIEND_SHEET, cellKey, friendCell, sheetScale } from '../data/files'
import { ANT, FRIEND, WD } from '../data/layout'
import { C, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import type { FriendPose, Rect, Vec } from '../types'
import type { View } from './view'

/**
 * AS AMIGAS do N3. Cochilam pelo jardim (zzz), acordam quando a formiga
 * encosta e seguem o rastro dela em fila, uma atrás da outra, como os
 * pontinhos de feromônio. Com a folha erguida, andam em volta da formiga.
 */
export interface Friends {
    spawn(points: Vec[]): void
    clear(): void
    count(): number
    allAwake(): boolean
    /** Os índices (na ordem de nascer) das que ainda dormem. */
    sleeping(): number[]
    nearSleeping(x: number, y: number): number
    wake(index: number): Promise<void>
    /** Guarda mais um passo do rastro da formiga. */
    record(x: number, y: number): void
    follow(dt: number): void
    gather(x: number, y: number): Promise<void>
    carry(x: number, y: number, dir: 1 | -1, moved: boolean, dt: number): void
    cheer(): Promise<void>
    away(): Promise<void>
    pos(index: number): Vec
    rect(index: number): Rect
    destroy(): void
}

type Mode = 'sleep' | 'waking' | 'follow' | 'carry'

interface Friend {
    sprite: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Ellipse
    zzz: Phaser.GameObjects.Text[]
    mode: Mode
    x: number
    y: number
    rank: number
    dir: 1 | -1
    clock: number
    stride: number
}

const TRAIL_MAX = 600

export function createFriends(scene: Phaser.Scene, view: View): Friends {
    let list: Friend[] = []
    let trail: Vec[] = []
    let awake = 0

    const scale = () => (FRIEND.w / FRIEND_SHEET.cellW) * sheetScale(scene, FRIEND_SHEET)

    const show = (f: Friend, p: FriendPose) => f.sprite.setFrame(cellKey(friendCell(p)))

    const sync = (f: Friend) => {
        f.sprite.setPosition(f.x, f.y).setFlipX(f.dir < 0).setDepth(WD.actor + f.y)
        f.shadow.setPosition(f.x, f.y - 2).setDepth(WD.actor + f.y - 1)
        view.restack()
    }

    const stepAnim = (f: Friend, moving: boolean, dt: number, carrying: boolean) => {
        if (!moving) {
            f.clock = 0
            show(f, carrying ? 'carryA' : 'walkA')
            return
        }
        f.clock += dt
        if (f.clock < ANT.step) return
        f.clock = 0
        f.stride = 1 - f.stride
        if (carrying) show(f, f.stride ? 'carryA' : 'carryB')
        else show(f, f.stride ? 'walkA' : 'walkB')
    }

    /** O ponto do rastro a esta distância da cabeça da fila. */
    const along = (d: number): Vec | undefined => {
        if (!trail.length) return undefined
        let left = d
        for (let i = 1; i < trail.length; i++) {
            const a = trail[i - 1]
            const b = trail[i]
            const seg = Math.hypot(b.x - a.x, b.y - a.y)
            if (seg >= left) {
                const t = seg ? left / seg : 0
                return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
            }
            left -= seg
        }
        return trail[trail.length - 1]
    }

    const snooze = (f: Friend) => {
        f.zzz.forEach((z, i) => {
            z.setPosition(f.x + FRIEND.zzz.dx, f.y + FRIEND.zzz.dy).setAlpha(0).setScale(0.6)
            view.add(z, WD.wind + 2)
            scene.tweens.add({
                targets: z,
                x: f.x + FRIEND.zzz.dx + 22,
                y: f.y + FRIEND.zzz.dy - 34,
                alpha: { from: 1, to: 0 },
                scale: { from: 0.6, to: 1.2 },
                duration: 1500,
                delay: i * 750,
                repeat: -1,
            })
        })
    }

    const kill = (f: Friend) => {
        scene.tweens.killTweensOf([f.sprite, f.shadow, ...f.zzz])
        f.sprite.destroy()
        f.shadow.destroy()
        f.zzz.forEach(z => z.destroy())
    }

    const friends: Friends = {
        spawn(points) {
            friends.clear()
            const k = scale()
            list = points.map((p, i) => {
                const sprite = scene.add
                    .image(p.x, p.y, FRIEND_SHEET.key, cellKey(friendCell('sleep')))
                    .setOrigin(0.5, ANT.foot / ANT.cell)
                    .setScale(k)
                const shadow = scene.add.ellipse(p.x, p.y, FRIEND.w * 0.8, 16, C.shadow, 0.2)
                view.add(shadow, WD.actor + p.y - 1)
                view.add(sprite, WD.actor + p.y)
                const zzz = [0, 1].map(() =>
                    scene.add.text(0, 0, 'z', { fontFamily: FONT.black, fontSize: '26px', color: '#ffffff', stroke: '#3a2a24', strokeThickness: 5 }).setOrigin(0.5),
                )
                const f: Friend = { sprite, shadow, zzz, mode: 'sleep', x: p.x, y: p.y, rank: -1, dir: i % 2 ? -1 : 1, clock: 0, stride: 0 }
                sync(f)
                snooze(f)
                return f
            })
            trail = []
            awake = 0
        },
        clear() {
            list.forEach(kill)
            list = []
            trail = []
            awake = 0
        },
        count: () => list.length,
        allAwake: () => list.length > 0 && list.every(f => f.mode === 'follow' || f.mode === 'carry'),
        sleeping: () => list.map((f, i) => (f.mode === 'sleep' ? i : -1)).filter(i => i >= 0),
        nearSleeping(x, y) {
            return list.findIndex(f => f.mode === 'sleep' && Math.hypot(f.x - x, f.y - y) < FRIEND.wake)
        },
        async wake(index) {
            const f = list[index]
            if (!f || f.mode !== 'sleep') return
            f.mode = 'waking'
            f.rank = awake++
            f.zzz.forEach(z => {
                scene.tweens.killTweensOf(z)
                z.setVisible(false)
            })
            show(f, 'wake')
            await FX.to(scene, f.sprite, { y: f.y - 26 }, { duration: TIMING.wake / 2, yoyo: true, ease: 'Sine.easeOut' })
            if (!f.sprite.active) return
            f.sprite.setY(f.y)
            show(f, 'walkA')
            f.mode = 'follow'
        },
        record(x, y) {
            const head = trail[0]
            if (head && Math.hypot(head.x - x, head.y - y) < 4) return
            trail.unshift({ x, y })
            if (trail.length > TRAIL_MAX) trail.length = TRAIL_MAX
        },
        follow(dt) {
            list.forEach(f => {
                if (f.mode !== 'follow') return
                const to = along((f.rank + 1) * FRIEND.gap)
                if (!to) return
                const dx = to.x - f.x
                const dy = to.y - f.y
                const d = Math.hypot(dx, dy)
                const moving = d > 1.5
                if (moving) {
                    const speed = FRIEND.speed * (d > 120 ? 2 : 1) * dt
                    const k = Math.min(1, speed / d)
                    f.x += dx * k
                    f.y += dy * k
                    if (Math.abs(dx) > 1) f.dir = dx > 0 ? 1 : -1
                }
                stepAnim(f, moving, dt, false)
                sync(f)
            })
        },
        async gather(x, y) {
            const jobs = list.map((f, i) => {
                f.mode = 'carry'
                const spot = FRIEND.ring[i % FRIEND.ring.length]
                f.x = x + spot.x
                f.y = y + spot.y
                show(f, 'carryA')
                return FX.to(scene, f.sprite, { x: f.x, y: f.y }, { duration: TIMING.gather, ease: 'Sine.easeInOut' }).then(() => sync(f))
            })
            await FX.all(...jobs)
        },
        carry(x, y, dir, moved, dt) {
            list.forEach((f, i) => {
                const spot = FRIEND.ring[i % FRIEND.ring.length]
                f.x = x + spot.x
                f.y = y + spot.y
                f.dir = dir
                stepAnim(f, moved, dt, true)
                sync(f)
            })
        },
        async cheer() {
            await FX.all(
                ...list.map((f, i) => {
                    show(f, 'happy')
                    return FX.to(scene, f.sprite, { y: f.y - 24 }, { duration: 200, delay: i * 90, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
                }),
            )
            list.forEach(f => f.sprite.active && f.sprite.setY(f.y))
        },
        async away() {
            await FX.all(...list.map(f => FX.to(scene, [f.sprite, f.shadow], { alpha: 0 }, { duration: 420 })))
            friends.clear()
        },
        pos: index => ({ x: list[index]?.x ?? 0, y: list[index]?.y ?? 0 }),
        rect(index) {
            const f = list[index]
            return f ? { x: f.x, y: f.y - 30, w: FRIEND.w + 40, h: 90 } : { x: 0, y: 0, w: 0, h: 0 }
        },
        destroy() {
            friends.clear()
        },
    }
    return friends
}
