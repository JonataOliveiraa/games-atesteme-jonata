import Phaser from 'phaser'
import { C } from '../data/theme'
import { HUD, LOG, SIGN, W } from '../data/layout'

export function paintHeaderBar(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.18)
    g.fillRect(0, HUD.h, W, 10)
    g.fillStyle(C.leaf, 1)
    g.fillRect(0, 0, W, HUD.h)
    g.fillStyle(C.white, 0.1)
    g.fillRect(0, 0, W, 18)
    g.fillStyle(C.leafLight, 1)
    g.fillRect(0, HUD.h - HUD.accent, W, HUD.accent)
}

export function paintPill(
    g: Phaser.GameObjects.Graphics,
    x: number, y: number, w: number, h: number,
    fill: number, border: number,
) {
    g.clear()
    g.fillStyle(C.shadow, 0.2)
    g.fillRoundedRect(x + 3, y + 4, w, h, h / 2)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(x, y, w, h, h / 2)
    g.fillStyle(C.white, 0.28)
    g.fillRoundedRect(x + 8, y + 6, w - 16, h * 0.34, h * 0.17)
    g.lineStyle(4, border, 1)
    g.strokeRoundedRect(x, y, w, h, h / 2)
}

export function paintPanel(
    g: Phaser.GameObjects.Graphics,
    w: number, h: number, r: number,
    fill: number, border: number, thickness = 5,
) {
    g.clear()
    g.fillStyle(C.shadow, 0.22)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, r)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, r)
    g.fillStyle(C.white, 0.26)
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.3, r * 0.5)
    g.lineStyle(thickness, border, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
}

export function paintDots(
    g: Phaser.GameObjects.Graphics,
    total: number, current: number,
    x: number, y: number,
) {
    g.clear()
    for (let i = 0; i < total; i += 1) {
        const cx = x + i * HUD.dotsGap
        const done = i < current
        g.fillStyle(C.shadow, 0.22)
        g.fillCircle(cx + 1, y + 2, HUD.dotsR)
        g.fillStyle(done ? C.amber : C.white, done ? 1 : 0.35)
        g.fillCircle(cx, y, HUD.dotsR)
        g.lineStyle(3, C.white, 0.85)
        g.strokeCircle(cx, y, HUD.dotsR)
    }
}

export function paintLog(g: Phaser.GameObjects.Graphics) {
    const { x1, x2, y, h } = LOG
    const w = x2 - x1
    g.clear()
    g.fillStyle(C.shadow, 0.18)
    g.fillEllipse((x1 + x2) / 2, y + h * 0.7, w * 0.98, 26)
    g.fillStyle(C.trunkDark, 1)
    g.fillRoundedRect(x1, y - h / 2, w, h, h / 2)
    g.fillStyle(C.trunk, 1)
    g.fillRoundedRect(x1 + 5, y - h / 2 + 4, w - 10, h - 12, h / 2)
    g.fillStyle(C.woodLight, 0.35)
    g.fillRoundedRect(x1 + 16, y - h / 2 + 8, w - 32, 8, 4)
    g.fillStyle(C.woodDark, 1)
    g.fillEllipse(x1 + 12, y, 20, h - 10)
    g.fillEllipse(x2 - 12, y, 20, h - 10)
    g.fillStyle(C.wood, 1)
    g.fillEllipse(x1 + 12, y, 11, h - 22)
    g.fillEllipse(x2 - 12, y, 11, h - 22)
}

export function paintSign(g: Phaser.GameObjects.Graphics, lit: boolean) {
    const { w, h, postH } = SIGN
    g.clear()

    g.fillStyle(C.trunkDark, 1)
    g.fillRoundedRect(-13, h / 2 - 10, 26, postH, 8)

    g.fillStyle(C.shadow, 0.24)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, 18)
    g.fillStyle(C.woodDark, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    g.fillStyle(C.wood, 1)
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 13)
    g.fillStyle(lit ? C.sun : C.woodLight, lit ? 0.75 : 0.4)
    g.fillRoundedRect(-w / 2 + 16, -h / 2 + 15, w - 32, h - 30, 10)

    g.lineStyle(lit ? 7 : 5, lit ? C.amber : C.trunkDark, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)

    g.fillStyle(C.woodDark, 1)
    g.fillCircle(-w / 2 + 17, -h / 2 + 17, 4)
    g.fillCircle(w / 2 - 17, -h / 2 + 17, 4)
    g.fillCircle(-w / 2 + 17, h / 2 - 17, 4)
    g.fillCircle(w / 2 - 17, h / 2 - 17, 4)
}

export function paintDropGlow(g: Phaser.GameObjects.Graphics, on: boolean, tone: number) {
    g.clear()
    g.fillStyle(C.shadow, 0.2)
    g.fillEllipse(0, 0, 190, 40)
    if (!on) return
    g.fillStyle(tone, 0.3)
    g.fillEllipse(0, 0, 236, 62)
    g.lineStyle(7, tone, 0.9)
    g.strokeEllipse(0, 0, 236, 62)
}

export function paintTouchRing(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.white, 0.32)
    g.fillCircle(0, 0, 34)
    g.lineStyle(6, C.white, 0.95)
    g.strokeCircle(0, 0, 34)
    g.fillStyle(C.white, 0.95)
    g.fillCircle(0, 0, 13)
}

export function paintHelp(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.shadow, 0.22)
    g.fillCircle(2, 3, HUD.helpR)
    g.fillStyle(C.cream, 1)
    g.fillCircle(0, 0, HUD.helpR)
    g.lineStyle(4, C.leaf, 1)
    g.strokeCircle(0, 0, HUD.helpR)
}

export function paintSkipButton(g: Phaser.GameObjects.Graphics, r: number) {
    g.clear()
    g.fillStyle(C.sun, 0.28)
    g.fillCircle(0, 0, r * 1.34)
    g.fillStyle(C.sun, 0.45)
    g.fillCircle(0, 0, r * 1.16)

    g.fillStyle(C.shadow, 0.32)
    g.fillCircle(3, 5, r)
    g.fillStyle(C.amber, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.4)
    g.fillEllipse(0, -r * 0.42, r * 1.2, r * 0.5)
    g.lineStyle(7, C.ink, 1)
    g.strokeCircle(0, 0, r)

    const s = r * 0.42
    g.fillStyle(C.ink, 1)
    g.fillTriangle(-s * 1.2, -s, -s * 1.2, s, s * 0.06, 0)
    g.fillTriangle(-s * 0.08, -s, -s * 0.08, s, s * 1.18, 0)
    g.fillRoundedRect(s * 1.3, -s, s * 0.44, s * 2, s * 0.2)
}
