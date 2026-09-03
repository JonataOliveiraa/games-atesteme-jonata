import Phaser from 'phaser'
import { ISLAND } from '../data/island'
import { C } from '../data/theme'
import type { Code, Word } from '../types'

const rad = Phaser.Math.DegToRad

const DOTS: Array<[number, number, Word]> = [
    [-0.42, -0.26, 'SOL'],
    [0.42, -0.26, 'PEIXE'],
    [0, 0.44, 'LUA'],
]

function drawSpeaker(g: Phaser.GameObjects.Graphics, s: number) {
    const body = [
        [-0.78, -0.26],
        [-0.42, -0.26],
        [-0.04, -0.68],
        [-0.04, 0.68],
        [-0.42, 0.26],
        [-0.78, 0.26],
    ].map(([x, y]) => new Phaser.Math.Vector2(x * s, y * s))

    g.fillStyle(C.inkSoft, 1)
    g.fillPoints(body, true)
    g.lineStyle(Math.max(3, s * 0.17), C.cyanDark, 1)
    ;[0.42, 0.74].forEach(r => {
        g.beginPath()
        g.arc(s * 0.04, 0, r * s, rad(-54), rad(54), false)
        g.strokePath()
    })
}

function drawDrumIcon(g: Phaser.GameObjects.Graphics, s: number) {
    const w = s * 1.06
    const h = w * 0.9
    const top = -h / 2 + s * 0.18
    const bottom = top + h
    const half = w / 2
    const foot = w * 0.42

    g.fillStyle(C.inkSoft, 1)
    g.fillPoints([
        new Phaser.Math.Vector2(-half, top),
        new Phaser.Math.Vector2(half, top),
        new Phaser.Math.Vector2(foot, bottom),
        new Phaser.Math.Vector2(-foot, bottom),
    ], true)
    g.fillEllipse(0, top + h * 0.1, w * 1.02, w * 0.34)
    g.fillStyle(C.cream, 1)
    g.fillEllipse(0, top + h * 0.08, w * 0.8, w * 0.22)

    g.lineStyle(Math.max(3, s * 0.15), C.cyanDark, 1)
    g.lineBetween(s * 0.2, -s * 0.92, s * 0.6, -s * 0.34)
    g.fillStyle(C.cyanDark, 1)
    g.fillCircle(s * 0.18, -s * 0.96, s * 0.16)
}

function drawDots(g: Phaser.GameObjects.Graphics, s: number) {
    const r = s * 0.42
    DOTS.forEach(([dx, dy, word]) => {
        const x = dx * s
        const y = dy * s
        g.fillStyle(ISLAND[word].colorDark, 1)
        g.fillCircle(x, y + r * 0.16, r)
        g.fillStyle(ISLAND[word].color, 1)
        g.fillCircle(x, y, r)
        g.fillStyle(C.white, 0.5)
        g.fillCircle(x - r * 0.3, y - r * 0.34, r * 0.28)
    })
}

function drawPicture(g: Phaser.GameObjects.Graphics, s: number) {
    const w = s * 1.52
    const h = s * 1.3
    const radius = s * 0.24

    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
    g.fillStyle(C.warn, 1)
    g.fillCircle(-w * 0.16, -h * 0.14, h * 0.2)
    g.fillStyle(C.sea, 1)
    g.fillRoundedRect(-w / 2 + s * 0.1, h * 0.08, w - s * 0.2, h * 0.3, radius * 0.5)
    g.lineStyle(Math.max(3, s * 0.15), C.inkSoft, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
}

export function drawCodeIcon(g: Phaser.GameObjects.Graphics, code: Code, size: number) {
    const s = size / 2
    if (code === 'som') drawSpeaker(g, s)
    else if (code === 'batidas') drawDrumIcon(g, s)
    else if (code === 'cor') drawDots(g, s)
    else drawPicture(g, s)
}

export function createCodeIcon(scene: Phaser.Scene, code: Code, size: number) {
    const g = scene.add.graphics()
    drawCodeIcon(g, code, size)
    return g
}
