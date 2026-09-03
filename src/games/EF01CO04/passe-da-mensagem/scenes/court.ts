import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import {
    BOX, COURT, DEPTH, GOALS, H, MATES, PERSON, TOUCH, TOUCH_GOAL, W, boxOf, goalHookOf, hookOf,
} from '../data/layout'
import { MATE_FRAMES } from '../data/levels'
import { createFinger, drawCross } from './icons'
import { pause } from './timing'
import type { Point, Target, TargetKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

interface Actor {
    foot: Point
    hook: Point
    ring: Point
    holder: Phaser.GameObjects.Container
    sprite?: Phaser.GameObjects.Sprite
    zone: Phaser.GameObjects.Zone
    mark: Phaser.GameObjects.Container
}

function drawField(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.field)
    g.fillStyle(C.grass, 1)
    g.fillRect(0, 0, W, H)
    for (let x = 0; x < W; x += 260) {
        g.fillStyle(C.grassDeep, 1)
        g.fillRect(x, COURT.top, 130, COURT.bottom - COURT.top)
    }
    g.fillStyle(C.grassEdge, 0.55)
    g.fillRect(0, COURT.top, W, 7)

    const paint = scene.add.graphics().setDepth(DEPTH.paint)
    paint.lineStyle(7, C.paint, 0.85)
    paint.strokeRoundedRect(22, COURT.top + 14, W - 44, COURT.bottom - COURT.top - 30, 12)
    paint.strokeCircle(620, (COURT.top + COURT.bottom) / 2, 92)
    paint.lineBetween(620, COURT.top + 14, 620, COURT.bottom - 16)
    paint.strokeRect(936, COURT.top + 14, W - 44 - 914, COURT.bottom - COURT.top - 30)
    return [g, paint]
}

function addBucket(scene: Phaser.Scene, foot: Point) {
    const at = boxOf(foot)
    const made: Phaser.GameObjects.GameObject[] = []

    const shadow = scene.add.graphics().setDepth(DEPTH.box - 1)
    shadow.fillStyle(C.ink, 0.24)
    shadow.fillEllipse(at.x, at.y + BOX.h * 0.46, BOX.w * 0.92, 26)
    made.push(shadow)

    if (scene.textures.exists('balde')) {
        made.push(scene.add.image(at.x, at.y, 'balde')
            .setDisplaySize(BOX.w, BOX.h)
            .setDepth(DEPTH.box))
        return made
    }

    const g = scene.add.graphics().setDepth(DEPTH.box)
    const hw = BOX.w / 2
    const top = at.y - BOX.h * 0.42
    const low = at.y + BOX.h * 0.44
    g.fillStyle(C.ink, 1)
    g.fillTriangle(at.x - hw, top - 6, at.x + hw, top - 6, at.x + hw - 20, low)
    g.fillTriangle(at.x - hw, top - 6, at.x + hw - 20, low, at.x - hw + 20, low)
    g.fillStyle(C.shirtDark, 1)
    g.fillTriangle(at.x - hw + 6, top, at.x + hw - 6, top, at.x + hw - 24, low - 6)
    g.fillTriangle(at.x - hw + 6, top, at.x + hw - 24, low - 6, at.x - hw + 24, low - 6)
    g.fillStyle(C.ink, 1)
    g.fillEllipse(at.x, top, BOX.w + 6, 30)
    g.fillStyle(0x101825, 1)
    g.fillEllipse(at.x, top + 1, BOX.w - 10, 20)
    made.push(g)
    return made
}

function createPerson(scene: Phaser.Scene, foot: Point, frame: number, flip: boolean) {
    const holder = scene.add.container(foot.x, foot.y).setDepth(DEPTH.person)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.24)
    shadow.fillEllipse(0, -6, PERSON.h * 0.58, 28)
    holder.add(shadow)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists('personagens')) {
        sprite = scene.add.sprite(0, -PERSON.h / 2, 'personagens', frame)
        sprite.setDisplaySize(PERSON.h * PERSON.ratio, PERSON.h)
        sprite.setFlipX(flip)
        holder.add(sprite)
    } else {
        const body = scene.add.graphics()
        body.fillStyle(C.ink, 1)
        body.fillRoundedRect(-46, -PERSON.h + 2, 92, PERSON.h, 28)
        body.fillStyle(C.shirt, 1)
        body.fillRoundedRect(-40, -PERSON.h + 60, 80, PERSON.h - 68, 22)
        body.fillStyle(C.creamDeep, 1)
        body.fillCircle(0, -PERSON.h + 52, 42)
        holder.add(body)
    }
    return { holder, sprite }
}

export function createCourt(
    scene: Phaser.Scene,
    onTap: (kind: TargetKind, index: number) => void,
) {
    const parts: Phaser.GameObjects.GameObject[] = [...drawField(scene)]
    GOALS.forEach(foot => parts.push(...addBucket(scene, foot)))

    const spot = scene.add.graphics().setDepth(DEPTH.spot)
    parts.push(spot)

    const finger = createFinger(scene, 74).setDepth(DEPTH.fx).setAlpha(0)
    parts.push(finger)

    function build(foot: Point, frame: number, flip: boolean, kind: TargetKind, index: number): Actor {
        const person = createPerson(scene, foot, frame, flip)
        parts.push(person.holder)

        const mark = scene.add.container(foot.x, foot.y - PERSON.h * 0.5)
            .setDepth(DEPTH.fx).setAlpha(0)
        const markG = scene.add.graphics()
        drawCross(markG, PERSON.h * 0.62)
        mark.add(markG)
        parts.push(mark)

        const box = kind === 'goal' ? TOUCH_GOAL : TOUCH
        const zone = scene.add
            .zone(foot.x + box.dx, foot.y + box.dy, box.w, box.h)
            .setOrigin(0.5)
            .setDepth(DEPTH.person + 2)
        zone.on('pointerdown', () => onTap(kind, index))
        zone.on('pointerover', () => void FX.to(scene, fx(person.holder), { scale: 1.06 }, { duration: 130 }))
        zone.on('pointerout', () => void FX.to(scene, fx(person.holder), { scale: 1 }, { duration: 170 }))
        parts.push(zone)

        const hook = kind === 'goal' ? goalHookOf(foot) : hookOf(foot)
        const ring = kind === 'goal'
            ? { x: foot.x + BOX.dx, y: foot.y + 4 }
            : { x: foot.x, y: foot.y - 8 }
        return { foot, hook, ring, holder: person.holder, sprite: person.sprite, zone, mark }
    }

    const mates = MATES.map((foot, i) => build(foot, MATE_FRAMES[i], false, 'mate', i))
    const goals = GOALS.map((foot, i) => build(foot, 4 + i, true, 'goal', i))

    const pick = (kind: TargetKind) => (kind === 'mate' ? mates : goals)

    let spotted = -1
    let phase = 0

    function paintSpot() {
        spot.clear()
        if (spotted < 0) return
        const foot = mates[spotted].foot
        const pulse = 1 + Math.sin(phase) * 0.07
        spot.fillStyle(C.warn, 0.26)
        spot.fillEllipse(foot.x, foot.y - 8, 250 * pulse, 80 * pulse)
        spot.lineStyle(7, C.warn, 0.8)
        spot.strokeEllipse(foot.x, foot.y - 8, 250 * pulse, 80 * pulse)
    }

    const ticker = scene.time.addEvent({
        delay: 40,
        loop: true,
        callback: () => {
            phase += 0.16
            paintSpot()
        },
    })

    return {
        targets(kind: TargetKind, exclude = -1): Target[] {
            return pick(kind)
                .map((actor, index) => ({
                    kind, index, hook: actor.hook, at: actor.foot, mark: actor.ring,
                }))
                .filter(target => target.index !== exclude)
        },

        hookOf: (kind: TargetKind, i: number): Point => pick(kind)[i]?.hook ?? mates[0].hook,

        footOf: (kind: TargetKind, i: number): Point => pick(kind)[i]?.foot ?? mates[0].foot,

        setGoalFace(i: number, frame: number) {
            goals[i]?.sprite?.setFrame(frame)
        },

        spotlight(i: number) {
            spotted = i
            paintSpot()
        },

        press(kind: TargetKind, i: number) {
            const actor = pick(kind)[i]
            if (!actor) return
            void FX.seq(
                () => FX.to(scene, fx(actor.holder), { scaleY: 0.9, scaleX: 1.08 }, { duration: 70 }),
                () => FX.to(scene, fx(actor.holder), { scaleY: 1, scaleX: 1 },
                    { duration: 240, ease: Ease.back(3) }),
            )
        },

        cheer(kind: TargetKind, i: number) {
            const actor = pick(kind)[i]
            if (!actor) return
            void FX.seq(
                () => FX.to(scene, fx(actor.holder), { y: actor.foot.y - 40 }, { duration: 180 }),
                () => FX.to(scene, fx(actor.holder), { y: actor.foot.y },
                    { duration: 360, ease: Ease.spring(2, 8) }),
            )
        },

        async deny(kind: TargetKind, i: number) {
            const actor = pick(kind)[i]
            if (!actor) return
            void FX.to(scene, fx(actor.holder), { angle: -8 },
                { duration: 110, yoyo: true, repeat: 2 })
            actor.mark.setAlpha(0).setScale(1.5)
            await FX.to(scene, fx(actor.mark), { alpha: 1, scale: 1 },
                { duration: 200, ease: Ease.back(2.4) })
            await pause(scene, 620)
            await FX.to(scene, fx(actor.mark), { alpha: 0 }, { duration: 220 })
            actor.holder.setAngle(0)
        },

        point(kind: TargetKind, i: number) {
            const actor = pick(kind)[i]
            if (!actor) return
            const to = { x: actor.foot.x + 74, y: actor.foot.y - PERSON.h * 0.52 }
            finger.setPosition(to.x + 60, to.y + 46).setAlpha(0).setScale(1)
            void FX.ping(scene, actor.foot.x, actor.foot.y - 90, C.warn,
                { radius: 190, duration: 700, depth: DEPTH.spot })
            void FX.seq(
                () => FX.to(scene, fx(finger), { alpha: 1, x: to.x, y: to.y }, { duration: 260 }),
                () => FX.to(scene, fx(finger), { x: to.x - 22, y: to.y - 14 },
                    { duration: 300, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' }),
                () => FX.to(scene, fx(finger), { alpha: 0 }, { duration: 240 }),
            )
            void FX.to(scene, fx(actor.holder), { scale: 1.12 },
                { duration: 240, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
        },

        setEnabled(on: boolean) {
            const all = [...mates, ...goals]
            all.forEach(actor => {
                if (on) actor.zone.setInteractive({ useHandCursor: true })
                else actor.zone.disableInteractive()
            })
        },

        destroy() {
            ticker.remove()
            const all = [...mates, ...goals]
            all.forEach(actor => {
                FX.kill(scene, fx(actor.holder))
                FX.kill(scene, fx(actor.mark))
            })
            FX.kill(scene, fx(finger))
            parts.forEach(part => part.destroy())
        },
    }
}
