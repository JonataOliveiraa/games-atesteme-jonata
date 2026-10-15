import Phaser from 'phaser'
import { BEACH, CARD, GROUND, H, TREE, W } from '../data/layout'
import { ART, BEACH_KEY, PARK_KEY, TREE_KEY, UI_SHEET } from '../data/files'
import type { Stage } from '../types'
import { C } from '../data/theme'

export const SKY = 'adf-sky'
export const TREE_TEX = 'adf-tree'
export const CARD_TEX = 'adf-card'
export const CARD_ME = 'adf-card-me'
export const SLOT_TEX = 'adf-slot'
export const SHADOW = 'adf-shadow'
export const LEAF = 'adf-leaf'
export const FLOWER = 'adf-flower'
export const GUST = 'adf-gust'

export function baked(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void): string {
    if (scene.textures.exists(key)) return key
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, Math.ceil(w), Math.ceil(h))
    g.destroy()
    return key
}

const mix = (a: number, b: number, t: number) => {
    const c = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.IntegerToColor(a),
        Phaser.Display.Color.IntegerToColor(b),
        100,
        Math.round(t * 100),
    )
    return Phaser.Display.Color.GetColor(c.r, c.g, c.b)
}

function puff(g: Phaser.GameObjects.Graphics, blobs: number[][], fill: number, ink: number, line: number) {
    g.fillStyle(ink, 1)
    blobs.forEach(([x, y, r]) => g.fillCircle(x, y, r + line))
    g.fillStyle(fill, 1)
    blobs.forEach(([x, y, r]) => g.fillCircle(x, y, r))
}

function paintSky(g: Phaser.GameObjects.Graphics) {
    const bands = 36
    for (let i = 0; i < bands; i++) {
        g.fillStyle(mix(C.skyTop, C.skyLow, i / (bands - 1)), 1)
        g.fillRect(0, Math.floor((i * 560) / bands), W, Math.ceil(560 / bands) + 1)
    }
    g.fillStyle(C.sunGlow, 0.6)
    g.fillCircle(190, 190, 120)
    g.fillStyle(C.ink, 1)
    g.fillCircle(190, 190, 63)
    g.fillStyle(C.sun, 1)
    g.fillCircle(190, 190, 60)
    g.lineStyle(4, C.ink, 0.8)
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2
        g.lineBetween(190 + Math.cos(a) * 76, 190 + Math.sin(a) * 76, 190 + Math.cos(a) * 92, 190 + Math.sin(a) * 92)
    }
    puff(g, [[110, 330, 34], [150, 315, 44], [200, 330, 32]], C.cloud, C.ink, 3)
    puff(g, [[1120, 170, 36], [1165, 150, 46], [1215, 172, 34]], C.cloud, C.ink, 3)
    puff(g, [[960, 120, 24], [990, 108, 30], [1022, 122, 22]], C.cloud, C.ink, 3)
    g.fillStyle(C.ink, 1)
    g.beginPath()
    g.moveTo(0, H)
    for (let x = 0; x <= W; x += 32) g.lineTo(x, 520 + Math.sin(x / 190) * 22 + Math.sin(x / 71) * 6 - 3)
    g.lineTo(W, H)
    g.closePath()
    g.fillPath()
    g.fillStyle(C.hillFar, 1)
    g.beginPath()
    g.moveTo(0, H)
    for (let x = 0; x <= W; x += 32) g.lineTo(x, 520 + Math.sin(x / 190) * 22 + Math.sin(x / 71) * 6)
    g.lineTo(W, H)
    g.closePath()
    g.fillPath()
    g.fillStyle(C.ink, 1)
    g.fillRect(0, GROUND.y - 78, W, 3)
    g.fillStyle(C.grass, 1)
    g.fillRect(0, GROUND.y - 75, W, H)
    puff(g, [[40, 560, 46], [96, 570, 38]], C.bush, C.ink, 3)
    puff(g, [[1190, 566, 40], [1244, 556, 48]], C.bush, C.ink, 3)
    const rnd = new Phaser.Math.RandomDataGenerator(['grama'])
    g.lineStyle(3, C.grassTick, 1)
    for (let i = 0; i < 46; i++) {
        const x = rnd.between(10, W - 10)
        const y = rnd.between(GROUND.y - 60, H - 8)
        g.lineBetween(x, y, x - 4, y - 9)
        g.lineBetween(x + 6, y, x + 8, y - 8)
    }
}

function paintTree(g: Phaser.GameObjects.Graphics) {
    const cx = TREE.w / 2
    const base = TREE.h
    g.fillStyle(C.ink, 1)
    g.fillTriangle(cx - 66, base, cx - 34, base - 190, cx + 34, base - 190)
    g.fillTriangle(cx - 66, base, cx + 66, base, cx + 34, base - 190)
    g.fillStyle(C.trunk, 1)
    g.fillTriangle(cx - 61, base - 4, cx - 30, base - 190, cx + 30, base - 190)
    g.fillTriangle(cx - 61, base - 4, cx + 61, base - 4, cx + 30, base - 190)
    g.lineStyle(4, C.trunkDark, 1)
    g.lineBetween(cx - 10, base - 30, cx - 4, base - 140)
    g.lineBetween(cx + 18, base - 20, cx + 12, base - 100)
    const blobs = [
        [150, 300, 120], [290, 190, 150], [470, 140, 160], [640, 140, 160], [820, 190, 150], [960, 300, 120],
        [250, 360, 130], [430, 330, 170], [670, 330, 170], [860, 370, 130], [550, 420, 120],
    ]
    puff(g, blobs, C.canopyDark, C.ink, 4)
    g.fillStyle(C.canopy, 1)
    blobs.forEach(([x, y, r]) => g.fillCircle(x, y - 8, r - 14))
    g.fillStyle(C.canopyLight, 0.55)
    g.fillEllipse(cx, 280, 760, 330)
    g.lineStyle(3, C.canopyDark, 1)
    ;[[120, 240], [230, 120], [930, 250], [1000, 330], [180, 410], [880, 440], [360, 70], [760, 60]].forEach(([x, y]) => {
        g.beginPath()
        g.arc(x, y, 18, Math.PI * 1.1, Math.PI * 1.7)
        g.strokePath()
    })
}

export function ensureArt(scene: Phaser.Scene) {
    baked(scene, SKY, W, H, paintSky)
    baked(scene, TREE_TEX, TREE.w, TREE.h, paintTree)
    const frame = (key: string, strip: number) =>
        baked(scene, key, CARD.w + 6, CARD.h + 6, g => {
            const x = 3
            const y = 3
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(x - 3, y - 3, CARD.w + 6, CARD.h + 6, CARD.radius + 3)
            g.fillStyle(C.paper, 1)
            g.fillRoundedRect(x, y, CARD.w, CARD.h, CARD.radius)
            g.fillStyle(strip, 1)
            g.fillRoundedRect(x, y + CARD.face, CARD.w, CARD.h - CARD.face, { tl: 0, tr: 0, bl: CARD.radius, br: CARD.radius })
            g.fillStyle(C.ink, 1)
            g.fillRect(x, y + CARD.face - 1.5, CARD.w, 3)
        })
    frame(CARD_TEX, C.paperDark)
    frame(CARD_ME, C.me)
    baked(scene, SLOT_TEX, CARD.w + 6, CARD.h + 6, g => {
        g.fillStyle(C.paper, 0.5)
        g.fillRoundedRect(3, 3, CARD.w, CARD.h, CARD.radius)
        g.lineStyle(4, C.edge, 0.9)
        const dash = (x1: number, y1: number, x2: number, y2: number) => {
            const len = Math.hypot(x2 - x1, y2 - y1)
            const n = Math.floor(len / 18)
            for (let i = 0; i < n; i++) {
                const a = i / n
                const b = (i + 0.55) / n
                g.lineBetween(x1 + (x2 - x1) * a, y1 + (y2 - y1) * a, x1 + (x2 - x1) * b, y1 + (y2 - y1) * b)
            }
        }
        const r = CARD.radius
        dash(3 + r, 3, 3 + CARD.w - r, 3)
        dash(3 + r, 3 + CARD.h, 3 + CARD.w - r, 3 + CARD.h)
        dash(3, 3 + r, 3, 3 + CARD.h - r)
        dash(3 + CARD.w, 3 + r, 3 + CARD.w, 3 + CARD.h - r)
        ;[
            [3 + r, 3 + r, Math.PI, Math.PI * 1.5],
            [3 + CARD.w - r, 3 + r, Math.PI * 1.5, Math.PI * 2],
            [3 + CARD.w - r, 3 + CARD.h - r, 0, Math.PI * 0.5],
            [3 + r, 3 + CARD.h - r, Math.PI * 0.5, Math.PI],
        ].forEach(([x, y, a, b]) => {
            g.beginPath()
            g.arc(x, y, r, a, b)
            g.strokePath()
        })
    })
    baked(scene, SHADOW, CARD.w + 6, CARD.h + 6, g => {
        g.fillStyle(C.shadow, 1)
        g.fillRoundedRect(0, 0, CARD.w + 6, CARD.h + 6, CARD.radius + 3)
    })
    baked(scene, BASKET, 240, 150, g => {
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(10, 50, 220, 96, 24)
        g.fillStyle(C.trunk, 1)
        g.fillRoundedRect(14, 54, 212, 88, 20)
        g.lineStyle(10, C.trunkDark, 1)
        g.beginPath()
        g.arc(120, 60, 80, Math.PI, 0, false)
        g.strokePath()
    })
    baked(scene, LEAF, 36, 24, g => {
        g.fillStyle(C.ink, 1)
        g.fillEllipse(18, 12, 34, 22)
        g.fillStyle(C.leaf, 1)
        g.fillEllipse(18, 12, 29, 17)
        g.lineStyle(2, C.canopyDark, 1)
        g.lineBetween(6, 12, 30, 12)
    })
    baked(scene, FLOWER, 40, 40, g => {
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2
            g.fillStyle(C.ink, 1)
            g.fillCircle(20 + Math.cos(a) * 10, 20 + Math.sin(a) * 10, 9)
        }
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2
            g.fillStyle(C.petal, 1)
            g.fillCircle(20 + Math.cos(a) * 10, 20 + Math.sin(a) * 10, 7)
        }
        g.fillStyle(C.ink, 1)
        g.fillCircle(20, 20, 6)
        g.fillStyle(C.petalCore, 1)
        g.fillCircle(20, 20, 4.5)
    })
    baked(scene, GUST, 220, 60, g => {
        g.lineStyle(6, C.gust, 0.95)
        g.beginPath()
        g.moveTo(4, 34)
        g.lineTo(150, 34)
        g.arc(160, 24, 10, Math.PI / 2, -Math.PI * 0.9, true)
        g.strokePath()
        g.lineStyle(4, C.gust, 0.8)
        g.lineBetween(30, 50, 120, 50)
        g.lineBetween(60, 18, 110, 18)
    })
}

export type Piece = 'leaf' | 'flower' | 'gust' | 'spark' | 'shell' | 'basket'

export const BASKET = 'adf-basket'

const BAKED: Record<Piece, string> = { leaf: LEAF, flower: FLOWER, gust: GUST, spark: FLOWER, shell: FLOWER, basket: BASKET }

export const hasFrame = (scene: Phaser.Scene, key: string, frame: string) =>
    scene.textures.exists(key) && scene.textures.get(key).has(frame)

export function piece(scene: Phaser.Scene, kind: Piece, x: number, y: number, size: number) {
    const img = hasFrame(scene, UI_SHEET.key, kind) ? scene.add.image(x, y, UI_SHEET.key, kind) : scene.add.image(x, y, BAKED[kind])
    return img.setScale(size / Math.max(img.width, img.height))
}

export function backdrop(scene: Phaser.Scene, stage: Stage): Phaser.GameObjects.GameObject {
    if (stage === 'beach') {
        if (scene.textures.exists(BEACH_KEY)) return scene.add.image(BEACH.x, BEACH.y, BEACH_KEY).setOrigin(0.5, 0).setScale(BEACH.scale)
        const g = scene.add.graphics()
        g.fillStyle(C.sand, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.sea, 1)
        g.fillRect(0, 0, W, 150)
        return g
    }
    const key = scene.textures.exists(PARK_KEY) ? PARK_KEY : SKY
    return scene.add.image(0, 0, key).setOrigin(0, 0).setDisplaySize(W, H)
}

export function treeImage(scene: Phaser.Scene) {
    const key = scene.textures.exists(TREE_KEY) ? TREE_KEY : TREE_TEX
    const img = scene.add.image(TREE.x, TREE.y, key).setOrigin(0.5, 1)
    return img.setScale(TREE.h / img.height)
}

export function slotImage(scene: Phaser.Scene, x: number, y: number, size: { w: number; h: number }) {
    if (!hasFrame(scene, UI_SHEET.key, 'slot')) return scene.add.image(x, y, SLOT_TEX).setDisplaySize(size.w + 6, size.h + 6)
    const img = scene.add.image(x, y, UI_SHEET.key, 'slot')
    const fh = img.height
    img.setOrigin(0.5, (ART.slotBodyTop + ART.slotBodyH / 2) / fh)
    return img.setDisplaySize(size.w, (fh * size.h) / ART.slotBodyH)
}
