import Phaser from 'phaser'
import { UI_CELL, UI_SHEET, cellKey, coverFrame, type Sheet } from '../data/files'
import { DISC } from '../data/layout'
import { C } from '../data/theme'

export const SHADOW = 'rde-shadow'

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, SHADOW, 128, 40, g => {
        g.fillStyle(C.shadow, 1)
        g.fillEllipse(64, 20, 124, 36)
    })
}

export function fit(scene: Phaser.Scene, sheet: Sheet, index: number, size: number) {
    const image = scene.add.image(0, 0, sheet.key, cellKey(index))
    return fitInto(image, size)
}

export function fitInto<T extends Phaser.GameObjects.Image>(image: T, size: number): T {
    image.setScale(size / Math.max(image.frame.width, image.frame.height))
    return image
}

function drawFrame(
    scene: Phaser.Scene,
    key: string,
    name: string,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    cover: boolean,
) {
    const frame = scene.textures.getFrame(key, name)
    if (!frame) return
    const src = frame.source.image as CanvasImageSource
    const k = cover ? Math.max(w / frame.cutWidth, h / frame.cutHeight) : Math.min(w / frame.cutWidth, h / frame.cutHeight)
    const dw = frame.cutWidth * k
    const dh = frame.cutHeight * k
    ctx.drawImage(src, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
}

export function discKey(scene: Phaser.Scene, cover: number): string {
    const key = `rde-disc-${cover}`
    if (scene.textures.exists(key)) return key
    const size = 256
    const texture = scene.textures.createCanvas(key, size, size)
    if (!texture) return key
    const ctx = texture.getContext()
    const mid = size / 2
    drawFrame(scene, UI_SHEET.key, cellKey(UI_CELL.disc), ctx, 0, 0, size, size, false)
    const r = mid * DISC.label
    ctx.save()
    ctx.beginPath()
    ctx.arc(mid, mid, r, 0, Math.PI * 2)
    ctx.clip()
    const art = coverFrame(cover)
    drawFrame(scene, art.key, art.frame, ctx, mid - r, mid - r, r * 2, r * 2, true)
    ctx.restore()
    ctx.lineWidth = 4
    ctx.strokeStyle = '#3b2a22'
    ctx.beginPath()
    ctx.arc(mid, mid, r, 0, Math.PI * 2)
    ctx.stroke()
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(mid, mid, size * DISC.hole, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(mid, mid, size * DISC.hole, 0, Math.PI * 2)
    ctx.stroke()
    texture.refresh()
    return key
}
