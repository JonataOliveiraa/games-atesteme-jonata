import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, PIECE, PIECES } from '../data/files'
import { BELT, DEPTH, TOY } from '../data/layout'
import { C, HUE } from '../data/theme'
import type { Attribute, Collection, Rule, Size, Toy } from '../types'

export const SIZE_SCALE: Record<Size, number> = { small: 0.453, big: 0.733 }

const ROBOT_H = 150
const ANTENNA_H = 202
const BALL_R = 75

export interface ToyView {
    readonly container: Phaser.GameObjects.Container
    readonly toy: Toy
    setLit(on: boolean): void
    point(attribute: Attribute): { x: number; y: number }
    top(): number
    destroy(): void
}

function drawRobot(g: Phaser.GameObjects.Graphics, fill: number, antenna: boolean) {
    g.lineStyle(4, C.ink, 1)
    if (antenna) {
        g.lineStyle(6, C.steelDark, 1)
        g.lineBetween(0, -150, 0, -186)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, -192, 10)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(0, -192, 10)
    }
    g.fillStyle(C.steelDark, 1)
    g.fillRoundedRect(-36, -16, 28, 16, 6)
    g.fillRoundedRect(8, -16, 28, 16, 6)
    g.strokeRoundedRect(-36, -16, 28, 16, 6)
    g.strokeRoundedRect(8, -16, 28, 16, 6)

    g.fillStyle(fill, 1)
    g.fillRoundedRect(-58, -70, 18, 42, 9)
    g.fillRoundedRect(40, -70, 18, 42, 9)
    g.strokeRoundedRect(-58, -70, 18, 42, 9)
    g.strokeRoundedRect(40, -70, 18, 42, 9)
    g.fillRoundedRect(-42, -76, 84, 62, 14)
    g.strokeRoundedRect(-42, -76, 84, 62, 14)
    g.fillStyle(C.white, 0.55)
    g.fillRoundedRect(-20, -62, 40, 24, 6)

    g.fillStyle(C.steel, 1)
    g.fillRect(-10, -84, 20, 10)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-52, -150, 104, 72, 18)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-52, -150, 104, 72, 18)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-38, -140, 76, 52, 12)
    g.fillStyle(C.ink, 1)
    g.fillCircle(-16, -118, 8)
    g.fillCircle(16, -118, 8)
    g.fillStyle(C.white, 1)
    g.fillCircle(-13, -121, 3)
    g.fillCircle(19, -121, 3)
    g.lineStyle(4, C.ink, 1)
    g.beginPath()
    g.arc(0, -106, 9, 0.15 * Math.PI, 0.85 * Math.PI)
    g.strokePath()
}

function drawBall(g: Phaser.GameObjects.Graphics, fill: number, stripes: boolean) {
    const cy = -BALL_R
    g.fillStyle(fill, 1)
    g.fillCircle(0, cy, BALL_R)
    if (stripes) {
        for (const d of [-40, 0, 40]) {
            const half = Math.sqrt(BALL_R * BALL_R - d * d) - 8
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-half, cy + d - 9, half * 2, 18, 9)
            g.lineStyle(3, C.ink, 1)
            g.strokeRoundedRect(-half, cy + d - 9, half * 2, 18, 9)
        }
    }
    g.fillStyle(C.white, 0.5)
    g.fillEllipse(-28, cy - 36, 36, 20)
    g.lineStyle(5, C.ink, 1)
    g.strokeCircle(0, cy, BALL_R)
}

export function drawToy(g: Phaser.GameObjects.Graphics, toy: Toy, fill = HUE[toy.color]) {
    g.clear()
    if (toy.collection === 'robot') drawRobot(g, fill, toy.antenna)
    else drawBall(g, fill, toy.stripes)
}

function toyHeight(toy: Toy) {
    if (toy.collection === 'ball') return BALL_R * 2
    return toy.antenna ? ANTENNA_H : ROBOT_H
}

const piece = (scene: Phaser.Scene, frame: number, cx: number, cy: number, scale: number) =>
    scene.add.image(0, 0, PIECES, frame).setOrigin(cx / 300, cy / 300).setScale(scale)

export function createToyArt(scene: Phaser.Scene, toy: Toy, fill = HUE[toy.color]): Phaser.GameObjects.Container {
    const art = scene.add.container(0, 0)
    if (!scene.textures.exists(PIECES)) {
        const g = scene.add.graphics()
        drawToy(g, toy, fill)
        art.add(g)
        return art
    }
    if (toy.collection === 'robot') {
        if (toy.antenna) {
            const h = ANTENNA_H - ROBOT_H + 8
            const stick = piece(scene, PIECE.antenna, ART.antenna.cx, ART.antenna.bottom, h / ART.antenna.h)
            stick.setY(-ROBOT_H + 8)
            art.add(stick)
        }
        art.add(piece(scene, PIECE.robot, ART.robot.cx, ART.robot.bottom, TOY.unit / ART.robot.h).setTint(fill))
        return art
    }
    const ballScale = TOY.unit / 236
    art.add(piece(scene, PIECE.ball, ART.ball.cx, ART.ball.cy, ballScale).setTint(fill).setY(-BALL_R))
    if (toy.stripes) {
        const stripes = piece(scene, PIECE.stripes, ART.stripes.cx, ART.stripes.cy, (ART.ball.w * ballScale) / ART.stripes.w)
        art.add(stripes.setY(-BALL_R))
    }
    return art
}

export function createToy(scene: Phaser.Scene, toy: Toy): ToyView {
    const scale = SIZE_SCALE[toy.size]
    const height = toyHeight(toy)

    const aura = scene.add.graphics().setVisible(false)
    aura.fillStyle(C.glow, 0.6)
    aura.fillEllipse(0, -height * scale * 0.45, 130 * scale + 60, height * scale + 50)
    aura.lineStyle(5, C.white, 0.9)
    aura.strokeEllipse(0, -height * scale * 0.45, 130 * scale + 60, height * scale + 50)

    const body = createToyArt(scene, toy).setScale(scale)
    const container = scene.add.container(0, BELT.top, [aura, body]).setDepth(DEPTH.toys)

    const local = (attribute: Attribute) => {
        if (attribute === 'antenna') return { x: 0, y: -(toy.antenna ? 196 : 150) }
        if (attribute === 'size') return { x: 0, y: -height / 2 }
        if (attribute === 'stripes') return { x: 0, y: -BALL_R }
        return { x: 0, y: toy.collection === 'robot' ? -100 : -BALL_R }
    }

    let lit = false

    return {
        container,
        toy,
        setLit(on) {
            if (on === lit) return
            lit = on
            aura.setVisible(on)
            if (on) {
                aura.setScale(0.7).setAlpha(0)
                scene.tweens.add({ targets: aura, scale: 1, alpha: 1, duration: 180, ease: 'Back.easeOut' })
            }
        },
        point(attribute) {
            const p = local(attribute)
            const s = container.scale * scale
            return { x: container.x + p.x * s, y: container.y + p.y * s }
        },
        top() {
            return container.y - height * scale * container.scale
        },
        destroy() {
            scene.tweens.killTweensOf([container, aura, body])
            container.destroy()
        },
    }
}

export function createGlyph(scene: Phaser.Scene, rule: Rule, collection: Collection): Phaser.GameObjects.Container {
    const glyph = scene.add.container(0, 0)
    if (rule.attribute === 'color') {
        const g = scene.add.graphics()
        g.fillStyle(HUE[rule.value], 1)
        g.fillCircle(0, 0, 21)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(0, 0, 21)
        glyph.add(g)
        return glyph
    }
    const sample: Toy = {
        collection,
        color: 'blue',
        size: 'big',
        antenna: rule.attribute === 'antenna',
        stripes: rule.attribute === 'stripes',
    }
    if (rule.attribute === 'size') {
        const pair: [Size, number, number][] = [
            ['small', -22, 0.17],
            ['big', 14, 0.29],
        ]
        pair.forEach(([size, x, s]) => {
            const art = createToyArt(scene, { ...sample, antenna: false }, C.neutral)
            art.setPosition(x, 23).setScale(s).setAlpha(size === rule.value ? 1 : 0.3)
            glyph.add(art)
        })
        return glyph
    }
    const s = sample.collection === 'robot' ? 0.23 : 0.3
    const art = createToyArt(scene, sample, C.neutral)
    art.setPosition(0, (toyHeight(sample) * s) / 2).setScale(s)
    glyph.add(art)
    return glyph
}

export function badge(scene: Phaser.Scene, x: number, y: number, ok: boolean, depth: number, size = 1) {
    const g = scene.add.graphics({ x, y }).setDepth(depth)
    g.fillStyle(C.shadow, 0.18)
    g.fillCircle(2, 4, 24)
    g.fillStyle(ok ? C.yes : C.no, 1)
    g.fillCircle(0, 0, 24)
    g.lineStyle(4, C.white, 1)
    g.strokeCircle(0, 0, 24)
    g.lineStyle(7, C.white, 1)
    if (ok) {
        g.beginPath()
        g.moveTo(-11, 1)
        g.lineTo(-3, 10)
        g.lineTo(12, -9)
        g.strokePath()
    } else {
        g.lineBetween(-9, -9, 9, 9)
        g.lineBetween(9, -9, -9, 9)
    }
    g.setScale(0.2 * size)
    void FX.to(scene, g, { scale: size }, { duration: 220, ease: 'Back.easeOut' })
    return g
}
