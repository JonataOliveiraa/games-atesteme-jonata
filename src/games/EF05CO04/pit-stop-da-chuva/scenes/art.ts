import Phaser from 'phaser'
import { cellKey, type Sheet } from '../data/files'
import { CARTS, SKY } from '../data/layout'
import { C } from '../data/theme'
import type { Weather } from '../types'

export const SKY_KEY: Record<Weather, string> = { sol: 'psc-sky-sol', nublado: 'psc-sky-nublado', chuva: 'psc-sky-chuva' }
export const RAIN = 'psc-rain'
export const DROP = 'psc-drop'
export const PUFF = 'psc-puff'
export const STAR = 'psc-star'
export const STREAK = 'psc-streak'
export const RING = 'psc-ring'
export const PLATE = 'psc-plate'
export const SHADOW = 'psc-shadow'

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

const mix = (a: number, b: number, t: number) => {
    const ca = Phaser.Display.Color.ValueToColor(a)
    const cb = Phaser.Display.Color.ValueToColor(b)
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(ca, cb, 100, Math.round(t * 100))
    return Phaser.Display.Color.GetColor(c.r, c.g, c.b)
}

function gradient(scene: Phaser.Scene, key: string, top: number, bottom: number) {
    const h = SKY.h
    baked(scene, key, 64, h, g => {
        const band = 8
        for (let y = 0; y < h; y += band) {
            g.fillStyle(mix(top, bottom, y / h), 1)
            g.fillRect(0, y, 64, band)
        }
    })
}

export function ensureBits(scene: Phaser.Scene) {
    gradient(scene, SKY_KEY.sol, C.skySunTop, C.skySunBottom)
    gradient(scene, SKY_KEY.nublado, C.skyCloudTop, C.skyCloudBottom)
    gradient(scene, SKY_KEY.chuva, C.skyRainTop, C.skyRainBottom)
    baked(scene, RAIN, 256, 256, g => {
        const rnd = new Phaser.Math.RandomDataGenerator(['chuva'])
        for (let i = 0; i < 46; i++) {
            const x = rnd.between(0, 255)
            const y = rnd.between(0, 255)
            const len = rnd.between(18, 34)
            g.lineStyle(rnd.between(2, 3), C.dropLight, rnd.realInRange(0.45, 0.85))
            for (const [ox, oy] of [[0, 0], [-256, 0], [0, -256], [-256, -256], [256, 0], [0, 256]]) {
                g.lineBetween(x + ox, y + oy, x + ox - len * 0.28, y + oy + len)
            }
        }
    })
    baked(scene, DROP, 16, 16, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(8, 8, 8)
    })
    baked(scene, PUFF, 96, 96, g => {
        g.fillStyle(C.white, 0.35)
        g.fillCircle(48, 48, 46)
        g.fillStyle(C.white, 0.6)
        g.fillCircle(48, 48, 34)
        g.fillStyle(C.white, 0.9)
        g.fillCircle(48, 48, 22)
    })
    baked(scene, STAR, 48, 48, g => {
        const pts: Phaser.Types.Math.Vector2Like[] = []
        for (let i = 0; i < 10; i++) {
            const a = -Math.PI / 2 + (i * Math.PI) / 5
            const r = i % 2 ? 9 : 22
            pts.push({ x: 24 + Math.cos(a) * r, y: 24 + Math.sin(a) * r })
        }
        g.fillStyle(C.yellow, 1)
        g.fillPoints(pts, true)
        g.lineStyle(3, C.yellowDark, 1)
        g.strokePoints(pts, true)
    })
    baked(scene, STREAK, 140, 10, g => {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(0, 0, 140, 10, 5)
    })
    baked(scene, SHADOW, 128, 32, g => {
        g.fillStyle(C.shadow, 1)
        g.fillEllipse(64, 16, 124, 28)
    })
    const rw = CARTS.plateW + 22
    const rh = CARTS.plateH + 22
    baked(scene, RING, rw + 12, rh + 12, g => {
        g.lineStyle(8, C.pulse, 1)
        g.strokeRoundedRect(6, 6, rw, rh, 36)
    })
    const pw = CARTS.plateW
    const ph = CARTS.plateH
    baked(scene, PLATE, pw + 8, ph + 14, g => {
        g.fillStyle(C.shadow, 0.25)
        g.fillRoundedRect(6, 14, pw, ph, 30)
        g.fillStyle(C.creamDark, 1)
        g.fillRoundedRect(2, 10, pw, ph, 30)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(2, 2, pw, ph - 2, 30)
        g.lineStyle(4, C.headerLine, 1)
        g.strokeRoundedRect(2, 2, pw, ph + 6, 30)
    })
}

export const refOf = (scene: Phaser.Scene, sheet: Sheet) =>
    (scene.textures.get(sheet.key).customData as { ref?: number }).ref ?? sheet.cellH

export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function heightOf(scene: Phaser.Scene, sheet: Sheet, index: number) {
    return scene.textures.getFrame(sheet.key, cellKey(index))?.height ?? sheet.cellH
}
