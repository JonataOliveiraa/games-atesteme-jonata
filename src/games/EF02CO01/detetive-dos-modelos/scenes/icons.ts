import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH } from '../data/layout'
import type { Attribute } from '../types'

export function drawWing(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.ink, 1)
    g.fillTriangle(-s * 0.52, -s * 0.1, s * 0.52, -s * 0.34, s * 0.16, s * 0.3)
    g.fillStyle(C.sky, 1)
    g.fillTriangle(-s * 0.42, -s * 0.11, s * 0.42, -s * 0.29, s * 0.13, s * 0.21)
    g.fillStyle(C.white, 0.45)
    g.fillTriangle(-s * 0.3, -s * 0.13, s * 0.16, -s * 0.24, s * 0.02, -s * 0.02)
}

export function drawWheel(g: Phaser.GameObjects.Graphics, s: number) {
    const r = s * 0.44
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.plain, 1)
    g.fillCircle(0, 0, r * 0.66)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, r * 0.2)
    g.lineStyle(s * 0.06, C.ink, 1)
    for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 4
        g.lineBetween(-Math.cos(a) * r * 0.6, -Math.sin(a) * r * 0.6,
            Math.cos(a) * r * 0.6, Math.sin(a) * r * 0.6)
    }
}

export function drawMotor(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-s * 0.42, -s * 0.3, s * 0.84, s * 0.62, s * 0.12)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(-s * 0.35, -s * 0.24, s * 0.7, s * 0.5, s * 0.09)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-s * 0.16, -s * 0.44, s * 0.32, s * 0.2, s * 0.06)
    g.fillCircle(-s * 0.16, s * 0.02, s * 0.09)
    g.fillCircle(s * 0.16, s * 0.02, s * 0.09)
}

export function drawWater(g: Phaser.GameObjects.Graphics, s: number) {
    for (let i = 0; i < 3; i++) {
        const y = -s * 0.24 + i * s * 0.24
        g.lineStyle(s * 0.13, C.ink, 1)
        g.beginPath()
        g.moveTo(-s * 0.46, y)
        g.lineTo(-s * 0.16, y - s * 0.11)
        g.lineTo(s * 0.16, y + s * 0.11)
        g.lineTo(s * 0.46, y)
        g.strokePath()
        g.lineStyle(s * 0.07, C.water, 1)
        g.beginPath()
        g.moveTo(-s * 0.46, y)
        g.lineTo(-s * 0.16, y - s * 0.11)
        g.lineTo(s * 0.16, y + s * 0.11)
        g.lineTo(s * 0.46, y)
        g.strokePath()
    }
}

export function drawRail(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.railDeep, 1)
    for (let i = -2; i <= 2; i++) {
        g.fillRoundedRect(-s * 0.42, i * s * 0.19 - s * 0.04, s * 0.84, s * 0.09, s * 0.03)
    }
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-s * 0.3, -s * 0.48, s * 0.11, s * 0.96, s * 0.04)
    g.fillRoundedRect(s * 0.19, -s * 0.48, s * 0.11, s * 0.96, s * 0.04)
}

export function drawRoad(g: Phaser.GameObjects.Graphics, s: number) {
    g.fillStyle(C.ink, 1)
    g.fillTriangle(-s * 0.46, s * 0.44, s * 0.46, s * 0.44, s * 0.16, -s * 0.46)
    g.fillTriangle(-s * 0.46, s * 0.44, s * 0.16, -s * 0.46, -s * 0.16, -s * 0.46)
    g.fillStyle(C.road, 1)
    g.fillTriangle(-s * 0.38, s * 0.38, s * 0.38, s * 0.38, s * 0.13, -s * 0.4)
    g.fillTriangle(-s * 0.38, s * 0.38, s * 0.13, -s * 0.4, -s * 0.13, -s * 0.4)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-s * 0.04, -s * 0.34, s * 0.08, s * 0.2, s * 0.03)
    g.fillRoundedRect(-s * 0.05, -s * 0.04, s * 0.1, s * 0.24, s * 0.04)
}

export function drawAttribute(g: Phaser.GameObjects.Graphics, attr: Attribute, s: number) {
    if (attr === 'air') drawWing(g, s)
    else if (attr === 'land') drawRoad(g, s)
    else if (attr === 'water') drawWater(g, s)
    else if (attr === 'rail') drawRail(g, s)
    else if (attr === 'motor') drawMotor(g, s)
    else drawWheel(g, s)
}

export function drawCross(
    g: Phaser.GameObjects.Graphics,
    s: number,
    color = C.bad,
    outline: number | null = C.ink,
) {
    const arm = s * 0.5
    if (outline !== null) {
        g.lineStyle(s * 0.3, outline, 1)
        g.lineBetween(-arm, -arm, arm, arm)
        g.lineBetween(arm, -arm, -arm, arm)
    }
    g.lineStyle(s * 0.18, color, 1)
    g.lineBetween(-arm, -arm, arm, arm)
    g.lineBetween(arm, -arm, -arm, arm)
}

export function drawBan(g: Phaser.GameObjects.Graphics, s: number) {
    const r = s * 0.44
    g.lineStyle(s * 0.16, C.ink, 1)
    g.strokeCircle(0, 0, r)
    g.lineBetween(-r * 0.7, -r * 0.7, r * 0.7, r * 0.7)
    g.lineStyle(s * 0.09, C.bad, 1)
    g.strokeCircle(0, 0, r)
    g.lineBetween(-r * 0.7, -r * 0.7, r * 0.7, r * 0.7)
}

export function drawCheck(
    g: Phaser.GameObjects.Graphics,
    s: number,
    color = C.ok,
    outline: number | null = C.ink,
) {
    const path = () => {
        g.beginPath()
        g.moveTo(-s * 0.42, s * 0.02)
        g.lineTo(-s * 0.1, s * 0.34)
        g.lineTo(s * 0.46, -s * 0.36)
        g.strokePath()
    }
    if (outline !== null) {
        g.lineStyle(s * 0.3, outline, 1)
        path()
    }
    g.lineStyle(s * 0.17, color, 1)
    path()
}

export function drawLock(g: Phaser.GameObjects.Graphics, s: number) {
    g.lineStyle(s * 0.15, C.ink, 1)
    g.beginPath()
    g.arc(0, -s * 0.16, s * 0.24, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-s * 0.38, -s * 0.16, s * 0.76, s * 0.56, s * 0.1)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(-s * 0.31, -s * 0.1, s * 0.62, s * 0.44, s * 0.07)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, s * 0.1, s * 0.08)
}

export function drawFinger(g: Phaser.GameObjects.Graphics, s: number) {
    const w = s * 0.5
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w * 0.62, -s * 0.5, w * 1.24, s * 0.66, w * 0.34)
    g.fillRoundedRect(-w * 0.68, -s * 0.06, w * 1.36, s * 0.6, w * 0.3)
    g.fillStyle(C.creamDeep, 1)
    g.fillRoundedRect(-w * 0.5, -s * 0.44, w, s * 0.6, w * 0.28)
    g.fillRoundedRect(-w * 0.56, -s * 0.02, w * 1.12, s * 0.52, w * 0.24)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w * 0.5, -s * 0.44, w, s * 0.5, w * 0.28)
}

export function createAttributeBadge(scene: Phaser.Scene, attr: Attribute, size: number) {
    const box = scene.add.container(0, 0)
    const g = scene.add.graphics()
    const r = size * 0.5
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.creamEdge, 1)
    g.fillCircle(0, 0, r - size * 0.06)
    g.fillStyle(C.cream, 1)
    g.fillCircle(0, -size * 0.03, r - size * 0.1)
    box.add(g)

    const art = scene.add.graphics()
    drawAttribute(art, attr, size * 0.62)
    box.add(art)

    const ban = scene.add.graphics().setPosition(r * 0.62, r * 0.62)
    drawBan(ban, size * 0.52)
    box.add(ban)
    return box
}

export function createHelpButton(scene: Phaser.Scene, r: number) {
    const box = scene.add.container(0, 0)
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.warnDark, 1)
    g.fillCircle(0, 0, r - 4)
    g.fillStyle(C.warn, 1)
    g.fillCircle(0, -3, r - 8)
    g.fillStyle(C.white, 0.32)
    g.fillEllipse(-r * 0.26, -r * 0.44, r * 0.7, r * 0.24)
    const mark = scene.add.text(0, -2, '?', {
        fontFamily: FONT.black, fontSize: `${Math.round(r * 1.1)}px`, color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    mark.setStroke(CSS.ink, Math.max(4, r * 0.2))
    box.add([g, mark])
    return box
}

export function dustPuff(
    scene: Phaser.Scene,
    x: number,
    y: number,
    { count = 12, spread = 92, depth = DEPTH.fx, color = C.dust } = {},
) {
    for (let i = 0; i < count; i++) {
        const angle = Math.PI + (i / count) * Math.PI + Phaser.Math.FloatBetween(-0.2, 0.2)
        const reach = spread * Phaser.Math.FloatBetween(0.35, 1)
        const puff = scene.add.circle(
            x + Phaser.Math.Between(-10, 10),
            y + Phaser.Math.Between(-6, 8),
            Phaser.Math.Between(7, 15),
            i % 3 === 0 ? C.dustDeep : color,
            0.8,
        ).setDepth(depth)

        void FX.to(scene, puff as unknown as FxTarget, {
            x: puff.x + Math.cos(angle) * reach,
            y: puff.y + Math.sin(angle) * reach * 0.5,
            scale: Phaser.Math.FloatBetween(1.4, 2.2),
            alpha: 0,
        }, {
            duration: Phaser.Math.Between(440, 720),
            ease: 'Sine.easeOut',
        }).then(() => puff.destroy())
    }
}
