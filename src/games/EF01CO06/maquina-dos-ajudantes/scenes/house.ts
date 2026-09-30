import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PEOPLE, PERSON_CELL, PERSON_HEAD, PIECE_CELL, PIECE_SIZE, PIECES, personFrame } from '../data/files'
import { DEPTH, DEVICE, PERSON, ROOM_HIT_PAD, ROOMS } from '../data/layout'
import { A, C, CSS, FONT, SIZE } from '../data/theme'
import type { Person, Point, Pose, Rect, Side } from '../types'

export interface House {
    person(side: Side): Person | undefined
    rect(side: Side): Rect
    head(side: Side): Point
    landing(side: Side): Point
    show(rooms: [Person, Person]): Promise<void>
    clear(): Promise<void>
    setPose(side: Side, pose: Pose): void
    helped(side: Side): Promise<void>
    funny(side: Side): Promise<void>
    pulse(on: boolean): void
    hint(side: Side): void
    nod(side: Side): void
    onTap(cb: (side: Side) => void): void
    destroy(): void
}

interface Room {
    rect: Rect
    image: Phaser.GameObjects.Image
    person?: Person
    pose: Pose
    timer?: Phaser.Time.TimerEvent
    extras: Phaser.GameObjects.GameObject[]
    rim: Phaser.GameObjects.Graphics
    glow: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
}

const SIDES: Side[] = [0, 1]

export function createHouse(scene: Phaser.Scene): House {
    let tap: (side: Side) => void = () => undefined

    const rooms: Room[] = SIDES.map(side => {
        const rect = ROOMS[side]
        const image = scene.add
            .image(rect.x, PERSON.foot, PEOPLE, 0)
            .setOrigin(0.5, PERSON_CELL.foot / PERSON_CELL.h)
            .setScale(PERSON.scale)
            .setDepth(DEPTH.rooms)
            .setVisible(false)

        const rim = scene.add.graphics().setDepth(DEPTH.rim).setAlpha(0)
        rim.lineStyle(10, C.glow, 1)
        rim.strokeRoundedRect(rect.x - rect.w / 2 + 5, rect.y - rect.h / 2 + 5, rect.w - 10, rect.h - 10, 14)

        const glow = scene.add.graphics().setDepth(DEPTH.rim).setAlpha(0)
        glow.fillStyle(C.hint, 0.22)
        glow.fillRect(rect.x - rect.w / 2, rect.y - rect.h / 2, rect.w, rect.h)
        glow.lineStyle(10, C.hint, 1)
        glow.strokeRoundedRect(rect.x - rect.w / 2 + 5, rect.y - rect.h / 2 + 5, rect.w - 10, rect.h - 10, 14)

        const zone = scene.add.zone(rect.x, rect.y, rect.w + ROOM_HIT_PAD * 2, rect.h + ROOM_HIT_PAD * 2).setDepth(60).setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => tap(side))

        return { rect, image, pose: 'before' as Pose, extras: [], rim, glow, zone }
    })

    const headOf = (side: Side): Point => {
        const room = rooms[side]
        const h = room.person ? PERSON_HEAD[room.person] : { x: 192, y: 300 }
        return {
            x: room.rect.x + (h.x - PERSON_CELL.w / 2) * PERSON.scale,
            y: PERSON.foot - (PERSON_CELL.foot - h.y) * PERSON.scale,
        }
    }

    const keep = (side: Side, obj: Phaser.GameObjects.GameObject) => {
        rooms[side].extras.push(obj)
        return obj
    }

    const stopAmbient = (side: Side) => {
        const room = rooms[side]
        room.timer?.remove()
        room.timer = undefined
        scene.tweens.killTweensOf(room.image)
        room.image.setPosition(room.rect.x, PERSON.foot).setAngle(0).setScale(PERSON.scale)
    }

    const dropExtras = (side: Side) => {
        rooms[side].extras.forEach(obj => {
            scene.tweens.killTweensOf(obj)
            obj.destroy()
        })
        rooms[side].extras = []
    }

    const zee = (side: Side, big: boolean) => {
        const h = headOf(side)
        const z = scene.add
            .text(h.x + 30, h.y - 30, 'z', {
                fontFamily: FONT.black,
                fontSize: `${big ? SIZE.zzz + 10 : SIZE.zzz}px`,
                color: CSS.lilac,
                stroke: CSS.white,
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setDepth(DEPTH.roomFx)
            .setScale(0.4)
        keep(side, z)
        scene.tweens.add({
            targets: z,
            x: h.x + 80,
            y: h.y - 130,
            scale: 1,
            alpha: 0,
            duration: big ? 1100 : 1600,
            ease: 'Sine.easeOut',
            onComplete: () => {
                rooms[side].extras = rooms[side].extras.filter(o => o !== z)
                z.destroy()
            },
        })
    }

    const ambient = (side: Side) => {
        stopAmbient(side)
        const room = rooms[side]
        const { image, person, pose } = room
        if (!person) return
        const loop = (delay: number, fn: () => void) => {
            fn()
            room.timer = scene.time.addEvent({ delay, loop: true, callback: fn })
        }
        const base = PERSON.scale
        if (person === 'sleeper' && pose !== 'helped') loop(pose === 'funny' ? 520 : 900, () => zee(side, pose === 'funny'))
        else if (person === 'baby' && pose === 'before')
            loop(1100, () => scene.tweens.add({ targets: image, x: room.rect.x + 3, duration: 70, yoyo: true, repeat: 5 }))
        else if (person === 'baby' && pose === 'funny')
            scene.tweens.add({ targets: image, x: image.x + 5, duration: 55, yoyo: true, repeat: -1 })
        else if (person === 'baby' && pose === 'helped')
            scene.tweens.add({ targets: image, angle: 2, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        else if ((person === 'bored' || person === 'missing-grandma') && pose === 'before')
            scene.tweens.add({ targets: image, scaleY: base * 1.02, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        else if (person === 'bored' && pose === 'helped')
            scene.tweens.add({ targets: image, y: image.y - 5, duration: 90, yoyo: true, repeat: -1 })
        else if (person === 'party' && pose === 'helped') {
            scene.tweens.add({ targets: image, y: image.y - 16, duration: 220, yoyo: true, repeat: -1, ease: 'Sine.easeOut' })
            scene.tweens.add({ targets: image, angle: 4, duration: 440, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        }
    }

    const setPose = (side: Side, pose: Pose) => {
        const room = rooms[side]
        if (!room.person) return
        room.pose = pose
        room.image.setFrame(personFrame(room.person, pose))
        ambient(side)
    }

    const bubble = (side: Side, label: string) => {
        const h = headOf(side)
        const g = scene.add.graphics()
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, 38)
        g.lineStyle(5, C.ink, 1)
        g.strokeCircle(0, 0, 38)
        const t = scene.add
            .text(0, 2, label, { fontFamily: FONT.black, fontSize: `${SIZE.question}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const c = scene.add.container(h.x - 60, Math.max(ROOMS[side].y - ROOMS[side].h / 2 + 50, h.y - 110), [g, t]).setDepth(DEPTH.roomFx)
        keep(side, c)
        return c
    }

    let pulsing = false

    return {
        person: side => rooms[side].person,
        rect: side => rooms[side].rect,
        head: headOf,
        landing: side => ({ x: rooms[side].rect.x + DEVICE.roomDX, y: DEVICE.roomY }),
        async show(pair) {
            await Promise.all(
                SIDES.map(async side => {
                    const room = rooms[side]
                    dropExtras(side)
                    room.person = pair[side]
                    room.pose = 'before'
                    room.image.setFrame(personFrame(pair[side], 'before')).setVisible(true).setAlpha(0)
                    stopAmbient(side)
                    await FX.wait(scene, side * 140)
                    await FX.to(scene, room.image, { alpha: 1 }, { duration: 260 })
                    await FX.impact(scene, room.image, 0.08)
                    ambient(side)
                }),
            )
        },
        async clear() {
            pulsing = false
            await Promise.all(
                SIDES.map(async side => {
                    const room = rooms[side]
                    scene.tweens.killTweensOf([room.rim, room.glow])
                    room.rim.setAlpha(0)
                    room.glow.setAlpha(0)
                    dropExtras(side)
                    stopAmbient(side)
                    await FX.to(scene, room.image, { alpha: 0 }, { duration: 240 })
                    room.image.setVisible(false)
                    room.person = undefined
                }),
            )
        },
        setPose,
        async helped(side) {
            const room = rooms[side]
            setPose(side, 'helped')
            const h = headOf(side)
            const flash = scene.add
                .rectangle(room.rect.x, room.rect.y, room.rect.w, room.rect.h, C.white)
                .setDepth(DEPTH.roomFx)
                .setAlpha(0.8)
            void FX.to(scene, flash, { alpha: 0 }, { duration: 420 }).then(() => flash.destroy())
            const hx = room.rect.x - 60
            const hy = room.rect.y - room.rect.h / 2 + 44
            const heartImg = scene.add
                .image(hx, hy, PIECES, PIECE_CELL.heart)
                .setScale(70 / PIECE_SIZE)
                .setDepth(DEPTH.roomFx)
            keep(side, heartImg)
            void FX.sparks(scene, h.x, h.y, { color: C.gold, count: 18, spread: 150, depth: DEPTH.roomFx })
            await FX.popIn(scene, heartImg, { from: 0.2, duration: 360 })
            void FX.to(scene, heartImg, { y: hy - 14 }, { duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            await FX.impact(scene, room.image, 0.1)
            ambient(side)
        },
        async funny(side) {
            setPose(side, 'funny')
            const mark = bubble(side, '?')
            await FX.popIn(scene, mark, { from: 0.2, duration: 320 })
            void FX.to(scene, mark, { angle: 8 }, { duration: 260, yoyo: true, repeat: 3 })
        },
        pulse(on) {
            pulsing = on
            const rims = rooms.map(r => r.rim)
            scene.tweens.killTweensOf(rims)
            if (!on) {
                rims.forEach(r => r.setAlpha(0))
                return
            }
            rims.forEach(r => r.setAlpha(0.2))
            scene.tweens.add({ targets: rims, alpha: A.rim + 0.35, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        hint(side) {
            const glow = rooms[side].glow
            scene.tweens.killTweensOf(glow)
            glow.setAlpha(0)
            scene.tweens.add({ targets: glow, alpha: 1, duration: 360 })
        },
        nod(side) {
            if (pulsing || !rooms[side].image.visible) return
            const rim = rooms[side].rim
            scene.tweens.killTweensOf(rim)
            rim.setAlpha(0.7)
            scene.tweens.add({ targets: rim, alpha: 0, duration: 380 })
        },
        onTap(cb) {
            tap = cb
        },
        destroy() {
            rooms.forEach((room, i) => {
                stopAmbient(i as Side)
                dropExtras(i as Side)
                room.zone.destroy()
                room.rim.destroy()
                room.glow.destroy()
                room.image.destroy()
            })
        },
    }
}
