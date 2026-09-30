import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { BALLOON, CALLOUT, DEPTH, GIFT, PERSON, THOUGHT, W } from '../data/layout'
import { C, CSS, FONT, LINE } from '../data/theme'
import type { Datum, PersonId, PersonPose, Point } from '../types'
import { PEOPLE_ART, PEOPLE_COL, PEOPLE_SHEET, PIECES, TEACHER_ART, TEACHER_SHEET } from '../data/files'
import { createDatum, datumScale, type IdCard } from './card'

type G = Phaser.GameObjects.Graphics

interface Look {
    hair: number
    shirt: number
    style: 'bun' | 'short' | 'curly' | 'panda'
}

const LOOK: Record<PersonId, Look> = {
    mom: { hair: C.hair, shirt: C.blouse, style: 'bun' },
    dad: { hair: C.hair, shirt: C.leaf, style: 'short' },
    teacher: { hair: C.curly, shirt: C.yellow, style: 'bun' },
    neighbor: { hair: C.curly, shirt: C.coral, style: 'curly' },
    mascot: { hair: C.pandaDark, shirt: C.panda, style: 'panda' },
}

const HEAD = { x: -4, y: -46, r: 36 }

function limb(g: G, from: Point, to: Point, color: number) {
    g.lineStyle(15, C.ink, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
    g.lineStyle(10, color, 1)
    g.lineBetween(from.x, from.y, to.x, to.y)
}

function paintPerson(g: G, id: PersonId, pose: PersonPose, step: number) {
    const look = LOOK[id]
    const panda = look.style === 'panda'
    const skin = panda ? C.panda : C.skin
    const sleeve = panda ? C.pandaDark : look.shirt
    g.clear()
    g.fillStyle(C.shadow, 0.16)
    g.fillEllipse(0, 90, 96, 20)

    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(panda ? C.pandaDark : C.creamDark, 1)
    g.fillRoundedRect(-22 + step * 3, 40, 18, 44, 7)
    g.strokeRoundedRect(-22 + step * 3, 40, 18, 44, 7)
    g.fillRoundedRect(4 - step * 3, 40, 18, 44, 7)
    g.strokeRoundedRect(4 - step * 3, 40, 18, 44, 7)
    g.fillStyle(C.ink, 1)
    g.fillEllipse(-16 + step * 3, 86, 26, 12)
    g.fillEllipse(10 - step * 3, 86, 26, 12)

    g.fillStyle(look.shirt, 1)
    g.fillRoundedRect(-30, -12, 60, 62, 20)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeRoundedRect(-30, -12, 60, 62, 20)
    if (panda) {
        g.fillStyle(C.pandaDark, 1)
        g.fillEllipse(0, 22, 30, 34)
    }

    const shoulders = { l: { x: -24, y: 0 }, r: { x: 24, y: 0 } }
    const hands: [Point, Point] =
        pose === 'cheer'
            ? [{ x: -54, y: -40 }, { x: 50, y: -40 }]
            : pose === 'hold'
              ? [{ x: -26, y: 14 }, { x: 6, y: 14 }]
              : pose === 'worry'
                ? [{ x: -26, y: -70 }, { x: 30, y: 34 }]
                : [{ x: -6, y: 32 }, { x: 4, y: 32 }]
    limb(g, shoulders.l, hands[0], sleeve)
    limb(g, shoulders.r, hands[1], sleeve)

    g.lineStyle(LINE, C.ink, 1)
    if (look.style === 'bun') {
        g.fillStyle(look.hair, 1)
        g.fillCircle(HEAD.x + 26, HEAD.y - 26, 16)
        g.strokeCircle(HEAD.x + 26, HEAD.y - 26, 16)
    }
    if (panda) {
        g.fillStyle(C.pandaDark, 1)
        ;[-28, 22].forEach(x => {
            g.fillCircle(HEAD.x + x, HEAD.y - 30, 14)
            g.strokeCircle(HEAD.x + x, HEAD.y - 30, 14)
        })
    }
    if (look.style === 'curly') {
        g.fillStyle(look.hair, 1)
        for (let k = 0; k < 7; k++) {
            const a = Math.PI + (k / 6) * Math.PI
            const cx = HEAD.x + Math.cos(a) * 32
            const cy = HEAD.y + Math.sin(a) * 30
            g.fillCircle(cx, cy, 12)
            g.strokeCircle(cx, cy, 12)
        }
    }

    g.fillStyle(skin, 1)
    g.fillCircle(HEAD.x, HEAD.y, HEAD.r)
    g.strokeCircle(HEAD.x, HEAD.y, HEAD.r)

    if (!panda) {
        g.fillStyle(look.hair, 1)
        g.slice(HEAD.x, HEAD.y, HEAD.r, Math.PI, Math.PI * 2, false)
        g.fillPath()
        g.fillStyle(skin, 1)
        g.fillEllipse(HEAD.x - 4, HEAD.y - 2, look.style === 'short' ? 54 : 50, 18)
        g.lineStyle(LINE, C.ink, 1)
        g.beginPath()
        g.arc(HEAD.x, HEAD.y, HEAD.r, Math.PI, Math.PI * 2, false)
        g.strokePath()
    }

    const ex = [HEAD.x - 18, HEAD.x + 4]
    const ey = HEAD.y + 6
    if (panda) {
        g.fillStyle(C.pandaDark, 1)
        ex.forEach(x => g.fillEllipse(x, ey, 20, 24))
    }
    if (pose === 'cheer') {
        g.lineStyle(3, panda ? C.white : C.ink, 1)
        ex.forEach(x => {
            g.beginPath()
            g.arc(x, ey + 3, 6, Math.PI + 0.3, -0.3, false)
            g.strokePath()
        })
    } else {
        const look2 = pose === 'hold' ? { dx: -2, dy: 3 } : { dx: -1.5, dy: 0 }
        ex.forEach(x => {
            g.fillStyle(panda ? C.white : C.ink, 1)
            g.fillEllipse(x, ey, 10, 13)
            g.fillStyle(panda ? C.ink : C.white, 1)
            g.fillCircle(x + look2.dx, ey - 2 + look2.dy, panda ? 3.5 : 2.4)
        })
    }
    g.fillStyle(C.blush, 0.6)
    g.fillCircle(ex[0] - 8, ey + 12, 5)
    g.fillCircle(ex[1] + 8, ey + 12, 5)

    const mx = (ex[0] + ex[1]) / 2
    g.lineStyle(3, C.ink, 1)
    if (pose === 'worry') {
        g.beginPath()
        g.moveTo(mx - 7, ey + 20)
        g.lineTo(mx - 2, ey + 17)
        g.lineTo(mx + 3, ey + 20)
        g.lineTo(mx + 8, ey + 17)
        g.strokePath()
        g.lineBetween(ex[0] - 6, ey - 14, ex[0] + 5, ey - 10)
        g.lineBetween(ex[1] + 6, ey - 14, ex[1] - 5, ey - 10)
    } else if (pose === 'cheer') {
        g.fillStyle(C.pinkDark, 1)
        g.slice(mx, ey + 15, 8, 0, Math.PI, false)
        g.fillPath()
        g.lineStyle(2.5, C.ink, 1)
        g.strokePath()
    } else {
        g.beginPath()
        g.arc(mx, ey + 14, 7, 0.3, Math.PI - 0.3, false)
        g.strokePath()
    }

    g.lineStyle(LINE, C.ink, 1)
    g.fillStyle(skin, 1)
    hands.forEach(h => {
        g.fillCircle(h.x, h.y, 8)
        g.strokeCircle(h.x, h.y, 8)
    })
}

function paintSpeech(g: G, w: number, h: number) {
    const right = -BALLOON.tail
    const left = right - w
    const r = Math.min(24, h / 2)
    const tailTop = Math.min(h / 2 - 8, 4)
    g.clear()
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(left + 3, -h / 2 + 6, w, h, r)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(left, -h / 2, w, h, r)
    g.fillTriangle(right - 2, tailTop - 14, right - 2, tailTop + 10, 0, tailTop + 8)
    g.lineStyle(LINE, C.ink, 1)
    g.strokeRoundedRect(left, -h / 2, w, h, r)
    g.fillStyle(C.white, 1)
    g.fillRect(right - 4, tailTop - 12, 6, 20)
    g.lineBetween(right, tailTop - 12, 0, tailTop + 8)
    g.lineBetween(0, tailTop + 8, right, tailTop + 8)
}

function paintThought(g: G, w: number, h: number) {
    g.clear()
    g.fillStyle(C.white, 1)
    g.lineStyle(LINE, C.ink, 1)
    const bumps = 9
    for (let k = 0; k < bumps; k++) {
        const a = (k / bumps) * Math.PI * 2
        g.fillCircle(Math.cos(a) * (w / 2 - 18), Math.sin(a) * (h / 2 - 16), 26)
        g.strokeCircle(Math.cos(a) * (w / 2 - 18), Math.sin(a) * (h / 2 - 16), 26)
    }
    g.fillEllipse(0, 0, w - 20, h - 16)
    ;[
        { x: w / 2 + 2, y: -12, r: 10 },
        { x: w / 2 + 22, y: -26, r: 6 },
    ].forEach(b => {
        g.fillCircle(b.x, b.y, b.r)
        g.strokeCircle(b.x, b.y, b.r)
    })
}

export interface PersonView {
    readonly id: PersonId
    readonly container: Phaser.GameObjects.Container
    readonly rect: GuideRect
    readonly hands: Point
    setPose(pose: PersonPose): void
    place(x: number, y: number, scale?: number): void
    walk(points: Point[], ms: number, scale?: number, tiptoe?: boolean): Promise<void>
    say(text: string): Promise<void>
    repeat(): Promise<void>
    think(kinds: Datum[]): Promise<void>
    hold(card: IdCard): Promise<void>
    setCallout(on: boolean): void
    setGift(on: boolean): void
    clear(): void
    destroy(): void
}

const UNIT = PERSON.h / 180
const FEET_Y = 92

export const personFeet = (scale: number) => FEET_Y * UNIT * scale

interface ArtFrame {
    key: string
    frame: number
    cx: number
    feet: number
    h: number
    cell: number
}

function artFrame(scene: Phaser.Scene, id: PersonId, pose: PersonPose): ArtFrame | null {
    const reacting = pose === 'cheer' || pose === 'hold'
    if (id === 'teacher') {
        if (!scene.textures.exists(TEACHER_SHEET)) return null
        const frame = reacting ? TEACHER_ART.react : TEACHER_ART.wait
        return { key: TEACHER_SHEET, frame, cx: TEACHER_ART.cx[frame], feet: TEACHER_ART.feet[frame], h: TEACHER_ART.h, cell: TEACHER_ART.cell }
    }
    const col = (PEOPLE_COL as Partial<Record<PersonId, number>>)[id]
    if (col === undefined || !scene.textures.exists(PEOPLE_SHEET)) return null
    const frame = reacting ? col + PEOPLE_ART.react : col
    return { key: PEOPLE_SHEET, frame, cx: PEOPLE_ART.cx[frame], feet: PEOPLE_ART.feet[frame], h: PEOPLE_ART.h, cell: PEOPLE_ART.cell }
}

export function createPerson(scene: Phaser.Scene, id: PersonId, x: number, y: number, scale = 1): PersonView {
    const first = artFrame(scene, id, 'wait')
    const body = first ? null : scene.add.graphics()
    const art = first ? scene.add.image(0, FEET_Y, first.key, first.frame) : null
    const figure = scene.add.container(0, 0, [(art ?? body) as Phaser.GameObjects.GameObject])
    const container = scene.add.container(x, y, [figure]).setDepth(DEPTH.person).setScale(scale * UNIT)
    let pose: PersonPose = 'wait'
    let step = 0

    const paint = () => {
        if (art) {
            const f = artFrame(scene, id, pose) as ArtFrame
            art.setFrame(f.frame)
            art.setOrigin(f.cx / f.cell, f.feet / f.cell)
            art.setScale(180 / f.h)
            art.setAngle(pose === 'worry' ? -6 : 0)
            return
        }
        paintPerson(body as G, id, pose, step)
    }
    paint()
    const breath = scene.tweens.add({ targets: figure, scaleY: 1.025, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })

    let speech: Phaser.GameObjects.Container | null = null
    let speechArt: G | null = null
    let speechText: Phaser.GameObjects.Text | null = null
    let line = ''
    let thought: Phaser.GameObjects.Container | null = null
    let callout: Phaser.GameObjects.GameObject[] = []
    let gift: Phaser.GameObjects.GameObject | null = null

    const clear = () => {
        speech?.destroy()
        thought?.destroy()
        speech = null
        speechArt = null
        speechText = null
        thought = null
    }

    const handsAt = (): Point => ({ x: container.x - 12 * container.scale, y: container.y + 14 * container.scale })

    const onRight = () => container.x < W / 2

    const fit = () => {
        if (!speech || !speechArt || !speechText) return
        const w = Math.max(BALLOON.minW, speechText.width + BALLOON.padX * 2)
        const h = Math.max(BALLOON.font + BALLOON.padY * 2, speechText.height + BALLOON.padY * 2)
        paintSpeech(speechArt, w, h)
        const dir = onRight() ? -1 : 1
        speechArt.setScale(dir, 1)
        speechText.setPosition(dir * (-BALLOON.tail - w / 2), 0)
        const room = dir > 0 ? speech.x - BALLOON.tail - w - BALLOON.left : W - BALLOON.left - speech.x - BALLOON.tail - w
        speech.setScale(room < 0 ? Math.max(0.6, 1 + room / w) : 1)
    }

    const typeLine = async () => {
        if (!speechText || !speech) return
        speechText.setText('')
        fit()
        speech.setAlpha(0)
        await FX.to(scene, speech, { alpha: 1 }, { duration: 180 })
        if (speechText?.active) await FX.type(scene, speechText, line, { delay: 34, onChar: fit })
        fit()
    }

    return {
        id,
        container,
        get rect() {
            return { x: container.x, y: container.y, w: PERSON.hitW - 30, h: PERSON.hitH - 30 }
        },
        get hands() {
            return handsAt()
        },
        setPose(next) {
            pose = next
            paint()
            if (art && next === 'worry') void FX.to(scene, figure, { x: 4 }, { duration: 90, yoyo: true, repeat: 3 })
        },
        place(px, py, s) {
            container.setPosition(px, py)
            if (s !== undefined) container.setScale(s * UNIT)
        },
        async walk(points, ms, s, tiptoe = false) {
            const per = ms / Math.max(1, points.length)
            const stepper = scene.time.addEvent({
                delay: tiptoe ? 200 : 150,
                loop: true,
                callback: () => {
                    step = step ? 0 : 1
                    if (!art) paintPerson(body as G, id, pose, tiptoe ? step * 0.5 : step)
                    scene.tweens.add({
                        targets: figure,
                        y: tiptoe ? -9 : -6,
                        angle: step ? 4 : -4,
                        duration: tiptoe ? 100 : 75,
                        yoyo: true,
                        ease: 'Sine.easeOut',
                    })
                },
            })
            if (s !== undefined) void FX.to(scene, container, { scale: s * UNIT }, { duration: ms })
            for (const p of points) {
                await FX.to(scene, container, { x: p.x, y: p.y }, { duration: per, ease: 'Linear' })
            }
            stepper.remove()
            step = 0
            scene.tweens.add({ targets: figure, y: 0, angle: 0, duration: 120 })
            paint()
        },
        async say(text) {
            speech?.destroy()
            line = text
            speechText = scene.add
                .text(0, 0, '', {
                    fontFamily: FONT.black,
                    fontSize: `${BALLOON.font}px`,
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: BALLOON.wrap },
                })
                .setOrigin(0.5)
                .setResolution(2)
            speechArt = scene.add.graphics()
            const side = onRight() ? -1 : 1
            const tip = { x: container.x + side * BALLOON.tipX * container.scale, y: container.y + BALLOON.tipY * container.scale }
            speech = scene.add.container(tip.x, tip.y, [speechArt, speechText]).setDepth(DEPTH.balloon)
            await typeLine()
        },
        async repeat() {
            if (!speech || !speechText) return
            await typeLine()
        },
        async think(kinds) {
            thought?.destroy()
            const g = scene.add.graphics()
            paintThought(g, 230, 130)
            const icons = kinds.map((kind, i) => {
                const d = createDatum(scene, kind, datumScale(kind, 76))
                d.setPosition((i - (kinds.length - 1) / 2) * 90, 0)
                return d
            })
            const side = onRight() ? -1 : 1
            g.setScale(side, 1)
            const small = container.scale < THOUGHT.smallBelow
            const at = small
                ? { x: container.x + side * THOUGHT.smallDX, y: container.y + THOUGHT.smallDY }
                : { x: container.x + side * THOUGHT.dx * container.scale, y: container.y + THOUGHT.dy * container.scale }
            thought = scene.add.container(at.x, at.y, [g, ...icons]).setDepth(DEPTH.balloon + 1)
            await FX.popIn(scene, thought, { from: 0.4, duration: 420 })
            for (const icon of icons) void FX.impact(scene, icon, 0.2)
        },
        async hold(card) {
            speech?.destroy()
            speech = null
            speechArt = null
            speechText = null
            pose = 'hold'
            paint()
            const to = handsAt()
            card.container.setDepth(DEPTH.flying)
            await Promise.all([
                FX.arcTo(scene, card.container, to, { height: 80, duration: 560 }),
                FX.to(scene, card.container, { scale: GIFT.card * (container.scale / UNIT), angle: -8 }, { duration: 560 }),
            ])
        },
        setCallout(on) {
            callout.forEach(o => o.destroy())
            callout = []
            if (!on) return
            const s = container.scale
            const ring = scene.add.graphics({ x: container.x, y: container.y + FEET_Y * s }).setDepth(DEPTH.person - 1)
            ring.fillStyle(C.yellow, 0.35)
            ring.fillEllipse(0, 0, CALLOUT.ringW * s, CALLOUT.ringH * s)
            ring.lineStyle(5, C.yellow, 1)
            ring.strokeEllipse(0, 0, CALLOUT.ringW * s, CALLOUT.ringH * s)
            const arrowX = container.x + CALLOUT.side * s
            const arrow = scene.add.graphics({ x: arrowX, y: container.y - CALLOUT.lift * s }).setDepth(DEPTH.balloon + 2)
            const a = CALLOUT.arrow
            arrow.fillStyle(C.ink, 1)
            arrow.fillTriangle(a * 0.7 + 3, -a - 4, a * 0.7 + 3, a + 4, -a * 0.7 - 5, 0)
            arrow.fillStyle(C.yellow, 1)
            arrow.fillTriangle(a * 0.7, -a, a * 0.7, a, -a * 0.7, 0)
            arrow.fillStyle(C.white, 0.7)
            arrow.fillTriangle(a * 0.5, -a * 0.6, a * 0.5, -a * 0.15, a * 0.05, -a * 0.35)
            callout = [ring, arrow]
            scene.tweens.add({ targets: arrow, x: arrowX + 10, duration: 420, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            scene.tweens.add({ targets: ring, scaleX: 1.12, scaleY: 1.12, alpha: 0.7, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            void FX.popIn(scene, arrow as unknown as Phaser.GameObjects.Container, { from: 0.3 })
        },
        setGift(on) {
            gift?.destroy()
            gift = null
            if (!on) return
            const at = { x: container.x + (onRight() ? 1 : -1) * GIFT.side, y: container.y - GIFT.lift }
            const star = scene.textures.exists(PIECES)
                ? scene.add.image(at.x, at.y, PIECES, 'sticker').setDisplaySize(GIFT.size, GIFT.size)
                : scene.add.star(at.x, at.y, 5, GIFT.size / 4, GIFT.size / 2, C.yellow).setStrokeStyle(3, C.ink)
            star.setDepth(DEPTH.balloon - 1)
            gift = star
            void FX.popIn(scene, star, { from: 0.2 })
            scene.tweens.add({ targets: star, y: star.y - 8, angle: 12, duration: 480, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        clear,
        destroy() {
            breath.remove()
            gift?.destroy()
            callout.forEach(o => o.destroy())
            clear()
            container.destroy()
        },
    }
}
