import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { DEPTH, FILM, FRAME, POLAROID } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from '../types'

type Drawable = Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Visible &
    Phaser.GameObjects.Components.AlphaSingle &
    Phaser.GameObjects.Components.Depth

export function snap(scene: Phaser.Scene, key: string, area: Rect, parts: Phaser.GameObjects.GameObject[]): string {
    if (scene.textures.exists(key)) scene.textures.remove(key)
    const texture = scene.textures.addDynamicTexture(key, FRAME.w, FRAME.h)
    if (!texture) return key
    texture.camera.setZoom(FRAME.w / area.w).setScroll(area.x - FRAME.w / 2, area.y - FRAME.h / 2)
    texture.fill(C.grass, 1)
    const list = (parts as Drawable[]).filter(p => p.active && p.visible && p.alpha > 0.01).sort((a, b) => a.depth - b.depth)
    texture.beginDraw()
    list.forEach(part => texture.batchDraw(part))
    texture.endDraw()
    return key
}

export interface Card {
    readonly box: Phaser.GameObjects.Container
    readonly width: number
    flyTo(x: number, y: number, width: number): Promise<void>
    drop(): Promise<void>
    adopt(): string[]
    destroy(): void
}

export interface Print {
    readonly box: Phaser.GameObjects.Container
    readonly width: number
    readonly height: number
    readonly dx: number
    readonly dy: number
    stop(): void
}

export function polaroid(scene: Phaser.Scene, key: string): Print {
    const { w, h, photoX, photoY, photoW, photoH } = POLAROID
    const frame = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.polaroid)).setDisplaySize(w, h)
    const dx = -w / 2 + photoX + photoW / 2
    const dy = -h / 2 + photoY + photoH / 2
    const photo = scene.add.image(dx, dy, key).setDisplaySize(photoW, photoH)
    const shade = scene.add.rectangle(6, 10, w - 6, h - 6, C.shadow, 0.25)
    const box = scene.add.container(0, 0, [shade, frame, photo])
    return { box, width: w, height: h, dx, dy, stop: () => undefined }
}

export function film(scene: Phaser.Scene, keys: string[]): Print {
    const strip = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.film)).setDisplaySize(FILM.w, FILM.h)
    const shade = scene.add.rectangle(6, 10, FILM.w - 6, FILM.h - 6, C.shadow, 0.25)
    const dx = -FILM.w / 2 + FILM.openX + FILM.openW / 2
    const dy = -FILM.h / 2 + FILM.openY + FILM.openH / 2
    const screen = scene.add.image(dx, dy, keys[0])
    const fitScreen = () => {
        const tw = screen.frame.width
        const th = screen.frame.height
        const visible = Math.min(th, (tw * FILM.openH) / FILM.openW)
        screen.setScale(FILM.openW / tw).setCrop(0, (th - visible) / 2, tw, visible)
    }
    fitScreen()
    const box = scene.add.container(0, 0, [shade, strip, screen])
    let index = 0
    const timer = scene.time.addEvent({
        delay: 260,
        loop: true,
        callback: () => {
            index = (index + 1) % keys.length
            if (!scene.textures.exists(keys[index]) || !screen.active) return
            screen.setTexture(keys[index])
            fitScreen()
        },
    })
    return { box, width: FILM.w, height: FILM.h, dx, dy, stop: () => timer.remove() }
}

function wrap(scene: Phaser.Scene, print: Print, keys: string[]): Card {
    const box = print.box
    const width = print.width
    let gone = false
    let owned = true
    const card: Card = {
        box,
        width,
        async flyTo(x, y, w) {
            box.setDepth(DEPTH.card)
            await FX.to(scene, box, { x, y, scale: w / width, angle: -5 }, { duration: 560, ease: 'Sine.easeInOut' })
        },
        async drop() {
            await FX.to(scene, box, { y: box.y + 260, angle: 24, alpha: 0 }, { duration: 620, ease: 'Quad.easeIn' })
            card.destroy()
        },
        adopt() {
            owned = false
            return keys
        },
        destroy() {
            if (gone) return
            gone = true
            print.stop()
            scene.tweens.killTweensOf(box)
            box.destroy()
            if (!owned) return
            keys.forEach(k => {
                if (scene.textures.exists(k)) scene.textures.remove(k)
            })
        },
    }
    return card
}

function born(scene: Phaser.Scene, print: Print, at: Rect, inner: number) {
    const scale = at.w / inner
    print.box.setPosition(at.x - print.dx * scale, at.y - print.dy * scale).setScale(scale).setDepth(DEPTH.card)
    void FX.to(scene, print.box, { scale: scale * 0.92 }, { duration: 200, ease: 'Back.easeOut' })
}

export function photoCard(scene: Phaser.Scene, key: string, at: Rect): Card {
    const print = polaroid(scene, key)
    born(scene, print, at, POLAROID.photoW)
    return wrap(scene, print, [key])
}

export function filmCard(scene: Phaser.Scene, keys: string[], at: Rect): Card {
    const print = film(scene, keys)
    born(scene, print, at, FILM.openW)
    return wrap(scene, print, keys)
}
