import Phaser from 'phaser'
import {
    ADULTS_SHEET,
    ADULT_CELL,
    APPS_SHEET,
    APP_CELL,
    BACKDROPS,
    THING_LOOK,
    cellKey,
    lookOf,
    pinOf,
    refOf,
    type Sheet,
} from '../data/files'
import { H, PHOTO, SCREEN, W } from '../data/layout'
import { ADULT_TONE, C, KID_TONE } from '../data/theme'
import type { Kid, Mood, Place, Sender, Shot, Thing } from '../types'

export const RING = 'cel-ring'
export const DOT = 'cel-dot'
export const HEART = 'cel-heart'
export const SHADOW = 'cel-shadow'

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

let bakes = 0
const BAKE_PAD = 10

export function paintImage(
    scene: Phaser.Scene,
    w: number,
    h: number,
    draw: (g: Phaser.GameObjects.Graphics) => void,
    ox = 0,
    oy = 0,
): Phaser.GameObjects.Image {
    bakes += 1
    const key = `cel-bake-${bakes}`
    const tw = Math.ceil(w + BAKE_PAD * 2)
    const th = Math.ceil(h + BAKE_PAD * 2)
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    g.translateCanvas(ox + BAKE_PAD, oy + BAKE_PAD)
    draw(g)
    g.generateTexture(key, tw, th)
    g.destroy()
    const image = scene.add.image(0, 0, key).setOrigin((ox + BAKE_PAD) / tw, (oy + BAKE_PAD) / th)
    image.once(Phaser.GameObjects.Events.DESTROY, () => {
        if (scene.textures.exists(key)) scene.textures.remove(key)
    })
    return image
}

export function ensureBits(scene: Phaser.Scene) {
    baked(scene, RING, 128, 128, g => {
        g.lineStyle(8, C.white, 1)
        g.strokeCircle(64, 64, 56)
    })
    baked(scene, DOT, 16, 16, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(8, 8, 8)
    })
    baked(scene, SHADOW, 256, 64, g => {
        g.fillStyle(C.shadow, 1)
        g.fillEllipse(128, 32, 250, 58)
    })
    baked(scene, HEART, 64, 60, g => {
        const pts: Array<{ x: number; y: number }> = []
        for (let i = 0; i <= 40; i++) {
            const t = (i / 40) * Math.PI * 2
            pts.push({
                x: 32 + (28 * Math.pow(Math.sin(t), 3) * 16) / 17,
                y: 30 - (28 * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))) / 17,
            })
        }
        g.fillStyle(C.white, 1)
        g.fillPoints(pts, true)
    })
}

export function cellImage(scene: Phaser.Scene, sheet: Sheet, cell: number) {
    return scene.add.image(0, 0, sheet.key, cellKey(cell))
}

export function kidImage(scene: Phaser.Scene, who: Kid, mood: Mood, height: number) {
    const look = lookOf(who, mood)
    const image = scene.add.image(0, 0, look.sheet.key, cellKey(look.cell)).setOrigin(pinOf(scene.textures, look.sheet, look.cell), 1)
    return image.setScale(height / refOf(scene.textures, look.sheet))
}

export function setKid(scene: Phaser.Scene, image: Phaser.GameObjects.Image, who: Kid, mood: Mood, height: number) {
    const look = lookOf(who, mood)
    image.setTexture(look.sheet.key, cellKey(look.cell))
    image.setOrigin(pinOf(scene.textures, look.sheet, look.cell), 1)
    image.setScale(height / refOf(scene.textures, look.sheet))
}

export function thingImage(scene: Phaser.Scene, thing: Thing, size: number) {
    const look = THING_LOOK[thing]
    const image = scene.add.image(0, 0, look.sheet.key, cellKey(look.cell))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

export function appImage(scene: Phaser.Scene, app: keyof typeof APP_CELL, size: number) {
    const image = scene.add.image(0, 0, APPS_SHEET.key, cellKey(APP_CELL[app]))
    return image.setScale(size / Math.max(image.frame.width, image.frame.height))
}

type Ctx = CanvasRenderingContext2D

function canvasOf(scene: Phaser.Scene, key: string, w: number, h: number): { tex: Phaser.Textures.CanvasTexture; ctx: Ctx } | null {
    if (scene.textures.exists(key)) {
        const old = scene.textures.get(key)
        if (old instanceof Phaser.Textures.CanvasTexture && old.width === w && old.height === h) {
            old.context.clearRect(0, 0, w, h)
            return { tex: old, ctx: old.context }
        }
        scene.textures.remove(key)
    }
    const tex = scene.textures.createCanvas(key, w, h)
    if (!tex) return null
    return { tex, ctx: tex.context }
}

function drawCell(scene: Phaser.Scene, ctx: Ctx, sheet: Sheet, cell: number, dx: number, dy: number, dw: number, dh: number) {
    const frame = scene.textures.getFrame(sheet.key, cellKey(cell))
    if (!frame) return
    ctx.drawImage(frame.source.image as CanvasImageSource, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, dx, dy, dw, dh)
}

function frameSize(scene: Phaser.Scene, sheet: Sheet, cell: number) {
    const frame = scene.textures.getFrame(sheet.key, cellKey(cell))
    return { w: frame?.cutWidth ?? sheet.cellW, h: frame?.cutHeight ?? sheet.cellH }
}

function drawBackdrop(scene: Phaser.Scene, ctx: Ctx, place: Place, cx: number, cy: number, cropW: number, w: number, h: number) {
    const frame = scene.textures.getFrame(BACKDROPS[place])
    if (!frame) return
    const sx = frame.cutWidth / W
    const sy = frame.cutHeight / H
    const cropH = (cropW * h) / w
    const left = Phaser.Math.Clamp(cx - cropW / 2, 0, W - cropW)
    const top = Phaser.Math.Clamp(cy - cropH / 2, 0, H - cropH)
    ctx.drawImage(
        frame.source.image as CanvasImageSource,
        frame.cutX + left * sx,
        frame.cutY + top * sy,
        cropW * sx,
        cropH * sy,
        0,
        0,
        w,
        h,
    )
}

const FOCUS: Record<Place, Record<Shot['kind'], [number, number]>> = {
    sala: { kid: [270, 420], thing: [300, 450], place: [420, 380] },
    patio: { kid: [300, 420], thing: [340, 470], place: [420, 400] },
    quarto: { kid: [240, 420], thing: [700, 360], place: [380, 380] },
    festa: { kid: [260, 420], thing: [690, 430], place: [420, 380] },
}

const THING_FILL: Record<Thing, number> = {
    diaryOpen: 0.94,
    diaryClosed: 0.7,
    cake: 0.82,
    drawing: 0.86,
    key: 0.6,
    trash: 0.6,
    coin: 0.6,
    poster: 0.86,
    spam: 0.7,
    list: 0.86,
    stranger: 0.8,
}

export function paintShot(scene: Phaser.Scene, key: string, shot: Shot): string {
    const w = PHOTO.w * PHOTO.res
    const h = PHOTO.h * PHOTO.res
    const made = canvasOf(scene, key, w, h)
    if (!made) return key
    const { tex, ctx } = made
    ctx.save()
    const focus = FOCUS[shot.place][shot.kind]
    ctx.filter = 'blur(3px)'
    drawBackdrop(scene, ctx, shot.place, focus[0], focus[1], shot.kind === 'thing' ? 330 : shot.kind === 'kid' ? 420 : 560, w, h)
    ctx.filter = 'none'
    ctx.fillStyle = 'rgba(255,255,255,0.12)'
    ctx.fillRect(0, 0, w, h)
    if (shot.kind === 'kid') {
        const look = lookOf(shot.who, shot.mood)
        const size = frameSize(scene, look.sheet, look.cell)
        const ref = refOf(scene.textures, look.sheet)
        const scale = (h * 1.02) / ref
        const dw = size.w * scale
        const dh = size.h * scale
        const px = pinOf(scene.textures, look.sheet, look.cell)
        drawCell(scene, ctx, look.sheet, look.cell, w / 2 - px * dw, h * 0.08 + (ref - size.h) * scale, dw, dh)
    } else if (shot.kind === 'thing') {
        const look = THING_LOOK[shot.thing]
        const size = frameSize(scene, look.sheet, look.cell)
        const scale = (w * THING_FILL[shot.thing]) / Math.max(size.w, size.h * 0.75)
        const dw = size.w * scale
        const dh = size.h * scale
        drawCell(scene, ctx, look.sheet, look.cell, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }
    const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.75)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(20,10,40,0.28)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, w, h)
    ctx.restore()
    tex.refresh()
    return key
}

function hex(color: number, alpha = 1) {
    const c = Phaser.Display.Color.IntegerToColor(color)
    return `rgba(${c.red},${c.green},${c.blue},${alpha})`
}

function lighten(color: number, t: number) {
    const c = Phaser.Display.Color.IntegerToColor(color)
    const f = (v: number) => Math.round(v + (255 - v) * t)
    return Phaser.Display.Color.GetColor(f(c.red), f(c.green), f(c.blue))
}

function toneOf(sender: Sender): number {
    if (sender in KID_TONE) return KID_TONE[sender as Kid]
    if (sender in ADULT_TONE) return ADULT_TONE[sender as keyof typeof ADULT_TONE]
    if (sender === 'pet') return 0xffa24a
    if (sender === 'unknown') return 0x8e88a6
    return C.accent
}

function clipCircle(ctx: Ctx, size: number) {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
    ctx.closePath()
    ctx.clip()
}

export function paintAvatar(scene: Phaser.Scene, sender: Sender): string {
    const key = `cel-av-${sender}`
    if (scene.textures.exists(key)) return key
    const size = 128
    const made = canvasOf(scene, key, size, size)
    if (!made) return key
    const { tex, ctx } = made
    ctx.save()
    clipCircle(ctx, size)
    const tone = toneOf(sender)
    ctx.fillStyle = hex(lighten(tone, 0.55))
    ctx.fillRect(0, 0, size, size)
    if (sender === 'unknown') {
        const look = THING_LOOK.stranger
        const s = frameSize(scene, look.sheet, look.cell)
        ctx.fillStyle = '#cfcbe0'
        ctx.fillRect(0, 0, size, size)
        const scale = (size * 1.05) / Math.max(s.w, s.h)
        drawCell(scene, ctx, look.sheet, look.cell, (size - s.w * scale) / 2, size * 0.08, s.w * scale, s.h * scale)
    } else if (sender === 'turma' || sender === 'escola') {
        const heads: Array<[number, number, number]> = [
            [40, 62, KID_TONE.nina],
            [88, 62, KID_TONE.caio],
            [64, 50, KID_TONE.bia],
        ]
        ctx.fillStyle = hex(sender === 'escola' ? C.yes : C.accent)
        ctx.fillRect(0, 0, size, size)
        heads.forEach(([x, y, c]) => {
            ctx.fillStyle = hex(c)
            ctx.beginPath()
            ctx.arc(x, y + 44, 30, Math.PI, 0)
            ctx.fill()
            ctx.fillStyle = '#ffe9d6'
            ctx.beginPath()
            ctx.arc(x, y, 20, 0, Math.PI * 2)
            ctx.fill()
        })
    } else if (sender === 'pet') {
        const s = frameSize(scene, APPS_SHEET, APP_CELL.pet)
        drawCell(scene, ctx, APPS_SHEET, APP_CELL.pet, -6, -6, size + 12, ((size + 12) * s.h) / s.w)
    } else if (sender in ADULT_CELL) {
        const cell = ADULT_CELL[sender as keyof typeof ADULT_CELL]
        const s = frameSize(scene, ADULTS_SHEET, cell)
        const scale = (size * 1.12) / Math.max(s.w, s.h)
        drawCell(scene, ctx, ADULTS_SHEET, cell, (size - s.w * scale) / 2, size * 0.06, s.w * scale, s.h * scale)
    } else {
        const who = sender as Kid
        const look = lookOf(who, who === 'nina' ? 'idle' : who === 'duda' ? 'closed' : who === 'bia' ? 'hug' : who === 'caio' ? 'thumb' : 'thumb')
        const s = frameSize(scene, look.sheet, look.cell)
        const scale = (size * 1.3) / s.w
        drawCell(scene, ctx, look.sheet, look.cell, (size - s.w * scale) / 2, -size * 0.06, s.w * scale, s.h * scale)
    }
    ctx.restore()
    tex.refresh()
    return key
}

export function paintGlow(scene: Phaser.Scene): string {
    const key = 'cel-glow'
    if (scene.textures.exists(key)) return key
    const size = 128
    const made = canvasOf(scene, key, size, size)
    if (!made) return key
    const { tex, ctx } = made
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(255,236,170,0.9)')
    grad.addColorStop(0.5, 'rgba(255,214,130,0.35)')
    grad.addColorStop(1, 'rgba(255,200,120,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    tex.refresh()
    return key
}

export function paintStranger(scene: Phaser.Scene): string {
    const key = 'cel-rw-unknown'
    const size = 340
    const made = canvasOf(scene, key, size, size)
    if (!made) return key
    const { tex, ctx } = made
    ctx.save()
    clipCircle(ctx, size)
    const grad = ctx.createLinearGradient(0, 0, 0, size)
    grad.addColorStop(0, '#d9d5e8')
    grad.addColorStop(1, '#a29cbd')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    const look = THING_LOOK.stranger
    const s = frameSize(scene, look.sheet, look.cell)
    const scale = (size * 0.95) / Math.max(s.w, s.h)
    drawCell(scene, ctx, look.sheet, look.cell, (size - s.w * scale) / 2, size - s.h * scale, s.w * scale, s.h * scale)
    ctx.restore()
    tex.refresh()
    return key
}

export function paintRemote(scene: Phaser.Scene, who: Kid, mood: Mood, place: Place): string {
    const key = `cel-rw-${who}-${mood}`
    const size = 340
    const made = canvasOf(scene, key, size, size)
    if (!made) return key
    const { tex, ctx } = made
    ctx.save()
    clipCircle(ctx, size)
    ctx.filter = 'blur(4px)'
    drawBackdrop(scene, ctx, place, 300, 380, 520, size, size)
    ctx.filter = 'none'
    ctx.fillStyle = hex(lighten(KID_TONE[who], 0.7), 0.35)
    ctx.fillRect(0, 0, size, size)
    const look = lookOf(who, mood)
    const s = frameSize(scene, look.sheet, look.cell)
    const ref = refOf(scene.textures, look.sheet)
    const scale = (size * 1.5) / ref
    const px = pinOf(scene.textures, look.sheet, look.cell)
    drawCell(scene, ctx, look.sheet, look.cell, size / 2 - px * s.w * scale, size * 0.07, s.w * scale, s.h * scale)
    ctx.restore()
    tex.refresh()
    return key
}

function roundedClip(ctx: Ctx, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.arcTo(w, 0, w, h, r)
    ctx.arcTo(w, h, 0, h, r)
    ctx.arcTo(0, h, 0, 0, r)
    ctx.arcTo(0, 0, w, 0, r)
    ctx.closePath()
    ctx.clip()
}

export function paintHomeWall(scene: Phaser.Scene): string {
    const key = 'cel-wall-home'
    if (scene.textures.exists(key)) return key
    const res = PHOTO.res
    const w = SCREEN.w * res
    const h = SCREEN.h * res
    const made = canvasOf(scene, key, w, h)
    if (!made) return key
    const { tex, ctx } = made
    ctx.save()
    roundedClip(ctx, w, h, SCREEN.r * res)
    const grad = ctx.createLinearGradient(0, 0, w * 0.4, h)
    grad.addColorStop(0, hex(C.wallTop))
    grad.addColorStop(1, hex(C.wallBottom))
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    const blobs: Array<[number, number, number, number, number]> = [
        [0.12, 0.62, 0.42, 0xffffff, 0.16],
        [0.92, 0.3, 0.36, 0xffd2f0, 0.3],
        [0.7, 0.92, 0.5, 0xffffff, 0.14],
        [0.2, 0.08, 0.22, 0xfff3b0, 0.35],
    ]
    blobs.forEach(([x, y, r, c, a]) => {
        ctx.fillStyle = hex(c, a)
        ctx.beginPath()
        ctx.arc(x * w, y * h, r * w, 0, Math.PI * 2)
        ctx.fill()
    })
    ctx.fillStyle = 'rgba(255,255,255,0.75)'
    for (let i = 0; i < 14; i++) {
        const x = ((i * 97) % 100) / 100
        const y = ((i * 61) % 100) / 100
        ctx.beginPath()
        ctx.arc(x * w, y * h, (2 + (i % 3)) * res, 0, Math.PI * 2)
        ctx.fill()
    }
    ctx.restore()
    tex.refresh()
    return key
}

export function paintLockWall(scene: Phaser.Scene): string {
    const key = 'cel-wall-lock'
    if (scene.textures.exists(key)) return key
    const res = PHOTO.res
    const w = SCREEN.w * res
    const h = SCREEN.h * res
    const made = canvasOf(scene, key, w, h)
    if (!made) return key
    const { tex, ctx } = made
    ctx.save()
    roundedClip(ctx, w, h, SCREEN.r * res)
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#1d2259')
    grad.addColorStop(1, '#6b4fb8')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    for (let i = 0; i < 26; i++) {
        const x = ((i * 89) % 100) / 100
        const y = ((i * 37) % 70) / 100
        ctx.beginPath()
        ctx.arc(x * w, y * h, (1.5 + (i % 3)) * res, 0, Math.PI * 2)
        ctx.fill()
    }
    ctx.fillStyle = '#fff3b0'
    ctx.beginPath()
    ctx.arc(w * 0.72, h * 0.62, 44 * res, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#4f3e9a'
    ctx.beginPath()
    ctx.arc(w * 0.72 + 22 * res, h * 0.62 - 12 * res, 40 * res, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
    tex.refresh()
    return key
}

export function paintWallpaper(scene: Phaser.Scene, photo: string): string {
    const key = 'cel-wall'
    const w = SCREEN.w * PHOTO.res
    const h = SCREEN.h * PHOTO.res
    const made = canvasOf(scene, key, w, h)
    if (!made) return key
    const { tex, ctx } = made
    const src = scene.textures.get(photo).getSourceImage() as CanvasImageSource & { width: number; height: number }
    ctx.save()
    const r = SCREEN.r * PHOTO.res
    ctx.beginPath()
    ctx.moveTo(r, 0)
    ctx.arcTo(w, 0, w, h, r)
    ctx.arcTo(w, h, 0, h, r)
    ctx.arcTo(0, h, 0, 0, r)
    ctx.arcTo(0, 0, w, 0, r)
    ctx.closePath()
    ctx.clip()
    const scale = Math.max(w / src.width, h / src.height) * 1.6
    const dh = src.height * scale
    const top = Math.min(0, Math.max(h - dh, h * 0.3 - dh * 0.4))
    ctx.drawImage(src, (w - src.width * scale) / 2, top, src.width * scale, dh)
    ctx.restore()
    tex.refresh()
    return key
}
