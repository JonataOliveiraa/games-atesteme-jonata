import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Content } from '../types'
import { paintCursor, paintFace, paintFlower, paintKey, paintNote, paintPaper } from './icons'

type Point = { x: number; y: number }

function buildVoice(scene: Phaser.Scene, art: Phaser.GameObjects.Container) {
    const mouth = scene.add.graphics()
    mouth.fillStyle(C.ink, 1)
    mouth.fillCircle(-26, 0, 9)
    mouth.fillStyle(C.input, 1)
    mouth.fillCircle(-26, 0, 6)
    art.add(mouth)
    ;[16, 29, 42].forEach((radius, i) => {
        const arc = scene.add.graphics()
        arc.lineStyle(11, C.ink, 1)
        arc.beginPath()
        arc.arc(-26, 0, radius, -0.8, 0.8)
        arc.strokePath()
        arc.lineStyle(6, C.input, 1)
        arc.beginPath()
        arc.arc(-26, 0, radius, -0.8, 0.8)
        arc.strokePath()
        art.add(arc)
        scene.tweens.add({
            targets: arc,
            alpha: 0.25,
            duration: FX.ms(scene, 260),
            delay: FX.ms(scene, i * 130),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    })
    ;[
        { x: 30, y: -30, size: 34 },
        { x: 42, y: 16, size: 28 },
    ].forEach((spot, i) => {
        const note = scene.add.graphics().setPosition(spot.x, spot.y)
        paintNote(note, 0, 0, spot.size, C.inputDeep)
        art.add(note)
        scene.tweens.add({
            targets: note,
            y: spot.y - 8,
            angle: i ? -10 : 10,
            duration: FX.ms(scene, 380),
            delay: FX.ms(scene, i * 190),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    })
}

function buildDrawing(scene: Phaser.Scene, art: Phaser.GameObjects.Container) {
    const g = scene.add.graphics()
    paintPaper(g, 0, 0, 84, 66)
    paintFlower(g, -2, 2, 46)
    art.add(g)
    g.setAngle(-6)
    scene.tweens.add({ targets: g, angle: 5, duration: FX.ms(scene, 520), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
}

function buildPhoto(scene: Phaser.Scene, art: Phaser.GameObjects.Container) {
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.2)
    g.fillRoundedRect(-34, -38, 74, 84, 6)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-39, -44, 78, 88, 8)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-35, -40, 70, 80, 6)
    paintFace(g, 0, -8, 62)
    art.add(g)
    g.setAngle(6)
    scene.tweens.add({ targets: g, angle: -4, duration: FX.ms(scene, 520), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
}

function buildLetters(scene: Phaser.Scene, art: Phaser.GameObjects.Container) {
    'LIA'.split('').forEach((letter, i) => {
        const x = (i - 1) * 42
        const key = scene.add.container(x, 0)
        const g = scene.add.graphics()
        paintKey(g, 0, 0, 36, 40)
        const text = scene.add
            .text(0, -3, letter, { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        key.add([g, text])
        art.add(key)
        scene.tweens.add({
            targets: key,
            y: -9,
            duration: FX.ms(scene, 260),
            delay: FX.ms(scene, i * 120),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    })
}

function buildPointer(scene: Phaser.Scene, art: Phaser.GameObjects.Container) {
    const ring = scene.add.graphics()
    ring.lineStyle(4, C.white, 1)
    ring.strokeCircle(-12, -20, 14)
    art.add(ring)
    scene.tweens.add({
        targets: ring,
        scale: 1.8,
        alpha: 0,
        duration: FX.ms(scene, 620),
        repeat: -1,
        ease: 'Sine.easeOut',
    })
    const g = scene.add.graphics()
    paintCursor(g, 0, 0, 70)
    art.add(g)
    scene.tweens.add({ targets: g, x: 5, y: 4, duration: FX.ms(scene, 300), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
}

const BUILD: Record<Content, (scene: Phaser.Scene, art: Phaser.GameObjects.Container) => void> = {
    voice: buildVoice,
    drawing: buildDrawing,
    photo: buildPhoto,
    letters: buildLetters,
    pointer: buildPointer,
}

export function createCarrier(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.bubble).setVisible(false)
    const art = scene.add.container(0, 0)
    root.add(art)

    const trail: Phaser.GameObjects.Arc[] = []

    const clearArt = () => {
        art.each((child: Phaser.GameObjects.GameObject) => {
            scene.tweens.killTweensOf(child)
            if (child instanceof Phaser.GameObjects.Container) scene.tweens.killTweensOf(child.list)
        })
        art.removeAll(true)
    }

    const paint = (content: Content) => {
        clearArt()
        BUILD[content](scene, art)
    }

    const drip = (color: number) => {
        const dot = scene.add.circle(root.x, root.y, Phaser.Math.Between(6, 10), color, 0.85).setDepth(DEPTH.bubble - 1)
        trail.push(dot)
        scene.tweens.add({
            targets: dot,
            scale: 0.1,
            alpha: 0,
            duration: FX.ms(scene, 460),
            onComplete: () => {
                dot.destroy()
                trail.splice(trail.indexOf(dot), 1)
            },
        })
    }

    const puff = (at: Point) => {
        for (let i = 0; i < 5; i++) {
            const dot = scene.add
                .circle(at.x + Phaser.Math.Between(-24, 24), at.y + Phaser.Math.Between(-10, 16), Phaser.Math.Between(9, 15), C.plasticDeep, 0.9)
                .setDepth(DEPTH.bubble - 1)
            scene.tweens.add({
                targets: dot,
                y: dot.y - 30,
                scale: 1.6,
                alpha: 0,
                duration: FX.ms(scene, 620),
                delay: FX.ms(scene, i * 40),
                onComplete: () => dot.destroy(),
            })
        }
    }

    const reset = () => {
        scene.tweens.killTweensOf(root)
        clearArt()
        root.setVisible(false).setScale(1).setAlpha(1).setAngle(0)
    }

    return {
        async appear(content: Content, at: Point) {
            reset()
            paint(content)
            root.setPosition(at.x, at.y).setVisible(true).setScale(0.2)
            await FX.to(scene, root, { scale: 1 }, { duration: 260, ease: 'Back.easeOut' })
        },

        async travel(to: Point, color: number, duration = 460) {
            const timer = scene.time.addEvent({ delay: 45, loop: true, callback: () => drip(color) })
            await FX.arcTo(scene, root, to, { height: 70, duration })
            timer.remove()
        },

        async absorb(into: Point) {
            await FX.to(scene, root, { x: into.x, y: into.y, scale: 0.15, alpha: 0.3 }, { duration: 170 })
            root.setVisible(false)
            clearArt()
        },

        async emerge(content: Content, at: Point, color: number) {
            paint(content)
            root.setPosition(at.x, at.y).setScale(0.2).setAlpha(1).setVisible(true)
            void FX.ping(scene, at.x, at.y, color, { radius: 60, depth: DEPTH.bubble - 1 })
            await FX.to(scene, root, { scale: 1.12 }, { duration: 200, ease: 'Back.easeOut' })
            await FX.to(scene, root, { scale: 1 }, { duration: 90 })
        },

        follow(curve: Phaser.Curves.CubicBezier, color: number, duration = 560) {
            const s = { t: 0 }
            let last = 0
            return new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: s,
                    t: 1,
                    duration: FX.ms(scene, duration),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const p = curve.getPoint(s.t)
                        root.setPosition(p.x, p.y - 26)
                        if (s.t - last > 0.06) {
                            last = s.t
                            drip(color)
                        }
                    },
                    onComplete: () => resolve(),
                })
            })
        },

        async fizzle() {
            await FX.shake(scene, root, { amount: 8, times: 2 })
            puff({ x: root.x, y: root.y })
            await FX.to(scene, root, { y: root.y + 36, alpha: 0, scale: 0.7 }, { duration: 360 })
            reset()
        },

        async bounce(at: Point) {
            const back = { x: root.x - 44, y: root.y - 34 }
            await FX.to(scene, root, { x: at.x, y: at.y }, { duration: 160 })
            const mark = scene.add
                .text(at.x + 34, at.y - 56, '?', { fontFamily: FONT.black, fontSize: '50px', color: CSS.white })
                .setOrigin(0.5)
                .setDepth(DEPTH.bubble + 1)
                .setResolution(2)
            mark.setStroke(CSS.ink, 8)
            await FX.to(scene, root, back, { duration: 220, ease: 'Back.easeOut' })
            await FX.wait(scene, 380)
            puff(back)
            await FX.all(
                FX.to(scene, root, { alpha: 0, scale: 0.6 }, { duration: 300 }),
                FX.to(scene, mark, { alpha: 0, y: mark.y - 20 }, { duration: 420 }),
            )
            mark.destroy()
            reset()
        },

        hide: reset,

        destroy() {
            reset()
            trail.forEach(dot => {
                scene.tweens.killTweensOf(dot)
                dot.destroy()
            })
            root.destroy(true)
        },
    }
}

export type Carrier = ReturnType<typeof createCarrier>
