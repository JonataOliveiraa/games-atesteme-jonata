import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH } from '../data/layout'

export function drawFinger(g: Phaser.GameObjects.Graphics, size: number) {
    const w = size * 0.5
    const h = size

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w * 0.62, -h * 0.5, w * 1.24, h * 0.66, w * 0.34)
    g.fillRoundedRect(-w * 0.68, -h * 0.06, w * 1.36, h * 0.6, w * 0.3)
    g.fillStyle(C.creamDeep, 1)
    g.fillRoundedRect(-w * 0.5, -h * 0.44, w, h * 0.6, w * 0.28)
    g.fillRoundedRect(-w * 0.56, -h * 0.02, w * 1.12, h * 0.52, w * 0.24)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-w * 0.5, -h * 0.44, w, h * 0.5, w * 0.28)
}

export function createFinger(scene: Phaser.Scene, size: number) {
    const box = scene.add.container(0, 0)
    const g = scene.add.graphics()
    drawFinger(g, size)
    box.add(g)
    return box
}

export function drawCross(g: Phaser.GameObjects.Graphics, size: number) {
    const arm = size * 0.5
    g.lineStyle(size * 0.3, C.ink, 1)
    g.lineBetween(-arm, -arm, arm, arm)
    g.lineBetween(arm, -arm, -arm, arm)
    g.lineStyle(size * 0.18, C.bad, 1)
    g.lineBetween(-arm, -arm, arm, arm)
    g.lineBetween(arm, -arm, -arm, arm)
}

export function drawCheck(
    g: Phaser.GameObjects.Graphics,
    size: number,
    color = C.ok,
    outline: number | null = C.ink,
) {
    const path = () => {
        g.beginPath()
        g.moveTo(-size * 0.42, size * 0.02)
        g.lineTo(-size * 0.1, size * 0.34)
        g.lineTo(size * 0.46, -size * 0.36)
        g.strokePath()
    }
    if (outline !== null) {
        g.lineStyle(size * 0.3, outline, 1)
        path()
    }
    g.lineStyle(size * 0.17, color, 1)
    path()
}

export function drawArrowHead(
    g: Phaser.GameObjects.Graphics,
    tip: { x: number; y: number },
    angle: number,
    size: number,
    color: number,
) {
    const wing = 0.54
    const lx = tip.x - Math.cos(angle - wing) * size
    const ly = tip.y - Math.sin(angle - wing) * size
    const rx = tip.x - Math.cos(angle + wing) * size
    const ry = tip.y - Math.sin(angle + wing) * size

    g.fillStyle(color, 1)
    g.fillTriangle(tip.x, tip.y, lx, ly, rx, ry)
    g.lineStyle(Math.max(5, size * 0.19), C.ink, 1)
    g.strokeTriangle(tip.x, tip.y, lx, ly, rx, ry)
    g.lineStyle(Math.max(2, size * 0.09), C.white, 0.55)
    g.lineBetween(
        Phaser.Math.Linear(tip.x, lx, 0.26), Phaser.Math.Linear(tip.y, ly, 0.26),
        Phaser.Math.Linear(tip.x, lx, 0.78), Phaser.Math.Linear(tip.y, ly, 0.78),
    )
}

export function drawChevron(
    g: Phaser.GameObjects.Graphics,
    at: { x: number; y: number },
    angle: number,
    size: number,
    alpha: number,
) {
    const wing = 0.72
    const lx = at.x - Math.cos(angle - wing) * size
    const ly = at.y - Math.sin(angle - wing) * size
    const rx = at.x - Math.cos(angle + wing) * size
    const ry = at.y - Math.sin(angle + wing) * size
    g.lineStyle(size * 0.44, C.white, alpha)
    g.beginPath()
    g.moveTo(lx, ly)
    g.lineTo(at.x, at.y)
    g.lineTo(rx, ry)
    g.strokePath()
}

export function createBadge(scene: Phaser.Scene, size: number) {
    const box = scene.add.container(0, 0)
    const g = scene.add.graphics()
    const r = size * 0.5

    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.okDark, 1)
    g.fillCircle(0, 0, r - size * 0.07)
    g.fillStyle(C.ok, 1)
    g.fillCircle(0, -size * 0.035, r - size * 0.12)
    g.fillStyle(C.white, 0.34)
    g.fillEllipse(-r * 0.3, -r * 0.46, r * 0.78, r * 0.3)
    box.add(g)

    const mark = scene.add.graphics()
    drawCheck(mark, size * 0.56, C.white, null)
    box.add(mark)
    return box
}

export function dustPuff(
    scene: Phaser.Scene,
    x: number,
    y: number,
    { count = 16, spread = 104, depth = DEPTH.fx } = {},
) {
    for (let i = 0; i < count; i++) {
        const angle = Math.PI + (i / count) * Math.PI + Phaser.Math.FloatBetween(-0.2, 0.2)
        const reach = spread * Phaser.Math.FloatBetween(0.35, 1)
        const puff = scene.add.circle(
            x + Phaser.Math.Between(-10, 10),
            y + Phaser.Math.Between(-6, 10),
            Phaser.Math.Between(8, 17),
            i % 3 === 0 ? C.dustDeep : C.dust,
            0.8,
        ).setDepth(depth)

        void FX.to(scene, puff as unknown as FxTarget, {
            x: puff.x + Math.cos(angle) * reach,
            y: puff.y + Math.sin(angle) * reach * 0.5,
            scale: Phaser.Math.FloatBetween(1.5, 2.3),
            alpha: 0,
        }, {
            duration: Phaser.Math.Between(460, 760),
            ease: 'Sine.easeOut',
        }).then(() => puff.destroy())
    }
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
