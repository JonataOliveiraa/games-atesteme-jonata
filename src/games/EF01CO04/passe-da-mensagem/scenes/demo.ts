import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import { DEPTH, H, PERSON, W } from '../data/layout'
import { GOAL_FRAMES, SUBJECTS } from '../data/levels'
import { createMessage, createPortrait, createSubjectArt } from './message'
import { createBadge, drawArrowHead, drawCheck, drawChevron, drawFinger, dustPuff } from './icons'
import { pause } from './timing'
import type { MediumId, SubjectDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

const PANEL = { x: 640, y: 424, w: 1104, h: 416, r: 40 }
const STRIP = PANEL.y - PANEL.h / 2 + 58
const PITCH = { top: PANEL.y - PANEL.h / 2 + 104, bottom: PANEL.y + PANEL.h / 2 - 18 }

const KID = 150
const FEET = 578
const HOOK = { dx: 84, dy: -108 }
const A = 300
const B = 590
const GOAL = 906
const CRATE = 812
const BUCKET = 108
const MOUTH = FEET - 96
const BALL = 78

function addKid(
    scene: Phaser.Scene,
    box: Phaser.GameObjects.Container,
    x: number,
    frame: number,
    flip: boolean,
) {
    const holder = scene.add.container(x, FEET)
    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.22)
    shadow.fillEllipse(0, -4, KID * 0.56, 20)
    holder.add(shadow)

    if (scene.textures.exists('personagens')) {
        const sprite = scene.add.sprite(0, -KID / 2, 'personagens', frame)
        sprite.setDisplaySize(KID * PERSON.ratio, KID)
        sprite.setFlipX(flip)
        holder.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-34, -KID + 2, 68, KID, 22)
        g.fillStyle(C.shirt, 1)
        g.fillRoundedRect(-29, -KID + 44, 58, KID - 50, 16)
        g.fillStyle(C.creamDeep, 1)
        g.fillCircle(0, -KID + 38, 31)
        holder.add(g)
    }
    box.add(holder)
    return holder
}

function addBucket(scene: Phaser.Scene, box: Phaser.GameObjects.Container) {
    const y = FEET - BUCKET * 0.46
    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.24)
    shadow.fillEllipse(CRATE, FEET - 2, BUCKET * 0.9, 20)
    box.add(shadow)

    if (scene.textures.exists('balde')) {
        box.add(scene.add.image(CRATE, y, 'balde').setDisplaySize(BUCKET, BUCKET))
        return
    }
    const g = scene.add.graphics()
    const hw = BUCKET / 2
    const top = y - BUCKET * 0.42
    const low = y + BUCKET * 0.44
    g.fillStyle(C.ink, 1)
    g.fillTriangle(CRATE - hw, top - 5, CRATE + hw, top - 5, CRATE + hw - 16, low)
    g.fillTriangle(CRATE - hw, top - 5, CRATE + hw - 16, low, CRATE - hw + 16, low)
    g.fillStyle(C.shirtDark, 1)
    g.fillTriangle(CRATE - hw + 5, top, CRATE + hw - 5, top, CRATE + hw - 20, low - 5)
    g.fillTriangle(CRATE - hw + 5, top, CRATE + hw - 20, low - 5, CRATE - hw + 20, low - 5)
    g.fillStyle(C.ink, 1)
    g.fillEllipse(CRATE, top, BUCKET + 5, 24)
    g.fillStyle(0x101825, 1)
    g.fillEllipse(CRATE, top + 1, BUCKET - 8, 16)
    box.add(g)
}

function addFrame(scene: Phaser.Scene, box: Phaser.GameObjects.Container) {
    const g = scene.add.graphics()
    const hw = PANEL.w / 2
    const hh = PANEL.h / 2

    g.fillStyle(C.ink, 0.4)
    g.fillRoundedRect(PANEL.x - hw + 6, PANEL.y - hh + 14, PANEL.w, PANEL.h, PANEL.r)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(PANEL.x - hw, PANEL.y - hh, PANEL.w, PANEL.h, PANEL.r)
    g.fillStyle(C.creamEdge, 1)
    g.fillRoundedRect(PANEL.x - hw + 9, PANEL.y - hh + 9, PANEL.w - 18, PANEL.h - 18, PANEL.r - 9)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(PANEL.x - hw + 9, PANEL.y - hh + 9, PANEL.w - 18, PANEL.h - 28, PANEL.r - 9)
    g.fillStyle(C.white, 0.6)
    g.fillRoundedRect(PANEL.x - hw + 26, PANEL.y - hh + 18, PANEL.w - 52, 16, 8)

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(
        PANEL.x - hw + 20, PITCH.top - 8, PANEL.w - 40, PITCH.bottom - PITCH.top + 16, 24,
    )
    g.fillStyle(C.grass, 1)
    g.fillRoundedRect(
        PANEL.x - hw + 26, PITCH.top - 2, PANEL.w - 52, PITCH.bottom - PITCH.top + 4, 19,
    )
    for (let x = PANEL.x - hw + 60; x < PANEL.x + hw - 60; x += 200) {
        g.fillStyle(C.grassDeep, 1)
        g.fillRect(x, PITCH.top + 3, 100, PITCH.bottom - PITCH.top - 2)
    }
    g.fillStyle(C.grassEdge, 0.5)
    g.fillRect(PANEL.x - hw + 26, PITCH.top - 2, PANEL.w - 52, 5)
    box.add(g)
}

function addStrip(scene: Phaser.Scene, box: Phaser.GameObjects.Container, subject: SubjectDef) {
    const art = createSubjectArt(scene, subject, 62)
    art.setPosition(524, STRIP)
    box.add(art)

    const chevrons = scene.add.graphics()
    for (let i = 0; i < 3; i++) {
        const x = 606 + i * 34
        chevrons.fillStyle(C.ink, 1)
        chevrons.fillTriangle(x - 11, STRIP - 18, x - 11, STRIP + 18, x + 14, STRIP)
        chevrons.fillStyle(C.warn, 1)
        chevrons.fillTriangle(x - 7, STRIP - 13, x - 7, STRIP + 13, x + 8, STRIP)
    }
    box.add(chevrons)

    const portrait = createPortrait(scene, GOAL_FRAMES[0], 74)
    portrait.setPosition(766, STRIP)
    box.add(portrait)
}

export function showDemo(scene: Phaser.Scene, onDone: () => void) {
    let dead = false
    const subject = SUBJECTS[0]

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 0.78)
        .setDepth(DEPTH.demo)
        .setInteractive()
        .setAlpha(0)

    const stage = scene.add.container(0, 0).setDepth(DEPTH.demo + 1)

    addFrame(scene, stage)
    addStrip(scene, stage, subject)
    addBucket(scene, stage)
    const kidA = addKid(scene, stage, A, 0, false)
    const kidB = addKid(scene, stage, B, 2, false)
    const kidC = addKid(scene, stage, GOAL, GOAL_FRAMES[0], true)

    const path = scene.add.graphics()
    stage.add(path)

    const ball = scene.add.container(A + HOOK.dx, FEET + HOOK.dy).setAlpha(0)
    ball.add(createMessage(scene, subject, 'voz', BALL))
    stage.add(ball)

    const finger = scene.add.container(0, 0).setAlpha(0)
    const fingerG = scene.add.graphics()
    drawFinger(fingerG, 76)
    finger.add(fingerG)
    stage.add(finger)

    const tick = createBadge(scene, 104).setPosition(CRATE, FEET - 178).setAlpha(0)
    stage.add(tick)

    const skip = scene.add.container(PANEL.x + PANEL.w / 2 - 74, PANEL.y + PANEL.h / 2 - 56)
        .setDepth(DEPTH.demo + 2)
    const skipG = scene.add.graphics()
    skipG.fillStyle(C.ink, 1)
    skipG.fillCircle(0, 0, 44)
    skipG.fillStyle(C.okDark, 1)
    skipG.fillCircle(0, 0, 38)
    skipG.fillStyle(C.ok, 1)
    skipG.fillCircle(0, -3, 33)
    skipG.fillStyle(C.white, 0.32)
    skipG.fillEllipse(-12, -18, 32, 12)
    const skipMark = scene.add.graphics()
    drawCheck(skipMark, 44, C.white, null)
    skip.add([skipG, skipMark])

    const skipZone = scene.add
        .zone(skip.x, skip.y, 128, 128)
        .setOrigin(0.5)
        .setDepth(DEPTH.demo + 3)
        .setInteractive({ useHandCursor: true })

    stage.setAlpha(0).setScale(0.92)
    skip.setAlpha(0).setScale(0.6)
    void FX.to(scene, fx(veil), { alpha: 1 }, { duration: 220 })
    void FX.to(scene, fx(stage), { alpha: 1, scale: 1 }, { duration: 340, ease: Ease.back(1.8) })
    void FX.to(scene, fx(skip), { alpha: 1, scale: 1 },
        { duration: 320, delay: 240, ease: Ease.back(2.6) })
        .then(() => {
            if (!dead) FX.breathe(scene, fx(skip), { grow: 1.09, duration: 820 })
        })

    function close() {
        if (dead) return
        dead = true
        FX.kill(scene, fx(skip))
        FX.kill(scene, fx(kidA))
        FX.kill(scene, fx(kidB))
        skipZone.destroy()
        void FX.to(scene, fx(skip), { alpha: 0, scale: 0.7 }, { duration: 200 })
        void FX.to(scene, fx(stage), { alpha: 0, scale: 0.94 }, { duration: 220 })
        void FX.to(scene, fx(veil), { alpha: 0 }, { duration: 240 }).then(() => {
            stage.destroy()
            veil.destroy()
            skip.destroy()
        })
        onDone()
    }

    skipZone.on('pointerdown', close)

    function drawLink(from: { x: number; y: number }, to: { x: number; y: number }) {
        const dx = to.x - from.x
        const dy = to.y - from.y
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len
        const uy = dy / len
        const a = { x: from.x + ux * 54, y: from.y + uy * 54 }
        const span = len - 54 - 58
        path.clear()
        if (span <= 26) return

        const angle = Math.atan2(uy, ux)
        for (let d = 6; d < span - 10; d += 34) {
            const t = d / span
            const x = a.x + ux * d
            const y = a.y + uy * d
            const r = 7 * (0.7 + t * 0.5)
            path.fillStyle(C.ink, 0.5)
            path.fillCircle(x, y + 2, r + 3)
            path.fillStyle(C.cream, 1)
            path.fillCircle(x, y, r)
        }
        drawChevron(path, { x: a.x + ux * span * 0.5, y: a.y + uy * span * 0.5 }, angle, 9, 0.7)
        drawArrowHead(path, { x: a.x + ux * span, y: a.y + uy * span }, angle, 27, C.ok)
    }

    async function tap(x: number, y: number) {
        finger.setPosition(x + 64, y + 52).setAlpha(0).setScale(1)
        await FX.to(scene, fx(finger), { alpha: 1, x, y }, { duration: 260 })
        if (dead) return
        await FX.to(scene, fx(finger), { scale: 0.82 }, { duration: 120, yoyo: true })
    }

    async function spin(medium: MediumId) {
        await FX.to(scene, fx(ball), { angle: 200, scaleX: 0.02, scaleY: 1.14 },
            { duration: 280, ease: 'Sine.easeIn' })
        if (dead) return
        ball.removeAll(true)
        ball.add(createMessage(scene, subject, medium, BALL))
        ball.setAngle(200).setScale(0.02, 1.14)
        await FX.to(scene, fx(ball), { angle: 360, scaleX: 1, scaleY: 1 },
            { duration: 360, ease: Ease.back(2.4) })
        ball.setAngle(0).setScale(1)
    }

    async function run() {
        await pause(scene, 460)
        if (dead) return
        await FX.to(scene, fx(ball), { alpha: 1 }, { duration: 240 })
        if (dead) return

        await tap(B + 28, FEET - 92)
        if (dead) return
        drawLink({ x: A + HOOK.dx, y: FEET + HOOK.dy }, { x: B + HOOK.dx, y: FEET + HOOK.dy })
        void FX.to(scene, fx(finger), { alpha: 0 }, { duration: 200 })
        await pause(scene, 300)
        if (dead) return

        await FX.arcTo(scene, fx(ball), { x: B + HOOK.dx, y: FEET + HOOK.dy },
            { height: 92, duration: 470 })
        if (dead) return
        path.clear()
        void FX.sparks(scene, B + HOOK.dx, FEET + HOOK.dy,
            { color: C.ok, count: 14, spread: 110, depth: DEPTH.demo + 2 })

        await spin('carta')
        if (dead) return
        await pause(scene, 440)
        if (dead) return

        await tap(GOAL + 20, FEET - 92)
        if (dead) return
        drawLink({ x: B + HOOK.dx, y: FEET + HOOK.dy }, { x: CRATE, y: MOUTH })
        void FX.to(scene, fx(finger), { alpha: 0 }, { duration: 200 })
        await pause(scene, 300)
        if (dead) return

        await FX.arcTo(scene, fx(ball), { x: CRATE, y: MOUTH }, { height: 108, duration: 470 })
        if (dead) return
        path.clear()

        await FX.to(scene, fx(ball), { y: MOUTH + 32, scale: 0.18, alpha: 0 }, { duration: 320 })
        if (dead) return

        dustPuff(scene, CRATE, MOUTH + 26, { count: 14, spread: 86, depth: DEPTH.demo + 2 })
        void FX.to(scene, fx(kidC), { y: FEET - 26 }, { duration: 160, yoyo: true })
        tick.setScale(0.4)
        await FX.to(scene, fx(tick), { alpha: 1, scale: 1 }, { duration: 300, ease: Ease.back(2.6) })
        if (dead) return
        await pause(scene, 1000)
        if (dead) return
        close()
    }

    void FX.to(scene, fx(kidA), { y: FEET - 6 }, { duration: 1400, yoyo: true, repeat: -1 })
    void FX.to(scene, fx(kidB), { y: FEET - 6 }, { duration: 1600, yoyo: true, repeat: -1, delay: 200 })
    scene.events.once(Phaser.Scenes.Events.UPDATE, () => {
        if (!dead) void run()
    })

    return {
        destroy() {
            if (dead) return
            dead = true
            FX.kill(scene, fx(skip))
            FX.kill(scene, fx(kidA))
            FX.kill(scene, fx(kidB))
            skipZone.destroy()
            stage.destroy()
            veil.destroy()
            skip.destroy()
        },
    }
}
