import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DIRT_CELL, DIRT_SHEET, GIANT_KEY, cellKey, sheetScale } from '../data/files'
import { plateScale } from '../data/fruits'
import { GIANT, HEADER, PLATE, WD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Dirt, Rect, Vec } from '../types'
import type { View } from './view'

/**
 * A FOLHA GIGANTE do N3, com a sujeira por cima. Folha e sujeira moram num
 * container só: erguida pelo grupo ou voando para o prato, vão juntas. No
 * modo esfregar, o dedo apaga cada sujeira aos poucos (raspadinha).
 */
export interface Giant {
    build(dirt: Dirt[]): void
    clear(): void
    /** O ponto (o corpo da formiga) encosta na folha. */
    touches(x: number, y: number, pad?: number): boolean
    dirty(): number
    center(): Vec
    rect(): Rect
    /** Onde está uma sujeira que ainda resta, no mundo. */
    dirtAt(): Vec | undefined
    drop(): Promise<void>
    raise(on: boolean): void
    /** Passa o dedo de `a` a `b` (na tela): se esfregou alguma sujeira, e quantas sumiram agora. */
    rub(a: Vec, b: Vec): { touched: boolean; erased: number }
    startScrub(onErase: (left: number) => void, onRub: () => void): void
    stopScrub(): void
    shine(): Promise<void>
    lift(x: number, y: number, depth: number): Promise<void>
    follow(x: number, y: number, depth: number): void
    place(): Promise<void>
    showDirt(): Promise<void>
    destroy(): void
}

interface Spot {
    img: Phaser.GameObjects.Image
    rubbed: number
    gone: boolean
}

const ART = GIANT.w / GIANT.leafW

export function createGiant(scene: Phaser.Scene, view: View): Giant {
    const box = scene.add.container(GIANT.at.x, GIANT.at.y).setVisible(false)
    view.add(box, WD.actor + GIANT.at.y)
    const shadow = scene.add.ellipse(6, 10, GIANT.w * 1.02, GIANT.leafH * ART * 1.02, C.shadow, 0.18)
    const leaf = scene.add.image(0, 0, GIANT_KEY)
    box.add([shadow, leaf])
    let spots: Spot[] = []
    let owner: number | null = null
    let last: Vec = { x: 0, y: 0 }
    let erase: ((left: number) => void) | null = null
    let rubbing: (() => void) | null = null

    const live = () => spots.filter(s => !s.gone)

    const worldOf = (s: Spot): Vec => ({ x: box.x + s.img.x * box.scale, y: box.y + s.img.y * box.scale })

    const toSeg = (p: Vec, a: Vec, b: Vec) => {
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len2 = dx * dx + dy * dy
        const t = len2 ? Phaser.Math.Clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2, 0, 1) : 0
        return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t))
    }

    const giant: Giant = {
        build(list) {
            giant.clear()
            const src = scene.textures.get(GIANT_KEY).getSourceImage() as HTMLImageElement | HTMLCanvasElement
            leaf.setScale(ART * (GIANT.imageW / src.width))
            box.setPosition(GIANT.at.x, GIANT.at.y).setScale(1).setAngle(0).setAlpha(1).setVisible(true)
            box.setDepth(WD.actor + GIANT.at.y)
            shadow.setVisible(true)
            const k = (GIANT.dirtW / DIRT_SHEET.cellW) * sheetScale(scene, DIRT_SHEET)
            spots = list.map(d => {
                const img = scene.add.image(d.x * ART, d.y * ART, DIRT_SHEET.key, cellKey(DIRT_CELL[d.kind]))
                img.setScale(k).setAngle(d.angle)
                box.add(img)
                return { img, rubbed: 0, gone: false }
            })
            view.restack()
        },
        clear() {
            giant.stopScrub()
            spots.forEach(s => {
                scene.tweens.killTweensOf(s.img)
                s.img.destroy()
            })
            spots = []
            scene.tweens.killTweensOf(box)
            box.setVisible(false)
        },
        touches(x, y, pad = GIANT.touch) {
            if (!box.visible) return false
            const rx = GIANT.w / 2 + pad
            const ry = (GIANT.leafH * ART) / 2 + pad
            return ((x - box.x) / rx) ** 2 + ((y - box.y) / ry) ** 2 < 1
        },
        dirty: () => live().length,
        center: () => ({ x: box.x, y: box.y }),
        rect: () => ({ x: box.x, y: box.y, w: GIANT.w * box.scale, h: GIANT.leafH * ART * box.scale }),
        dirtAt() {
            const s = live()[0]
            return s ? worldOf(s) : undefined
        },
        async drop() {
            box.setAlpha(0).setY(GIANT.at.y - 160)
            await FX.to(scene, box, { y: GIANT.at.y, alpha: 1 }, { duration: TIMING.drop, ease: 'Bounce.easeOut' })
        },
        raise(on) {
            box.setDepth(on ? WD.cutting : WD.actor + box.y)
            view.restack()
        },
        rub(a, b) {
            const len = Math.hypot(b.x - a.x, b.y - a.y)
            if (len < 0.5) return { touched: false, erased: 0 }
            const r = GIANT.hit * view.root.scale
            let erased = 0
            let touched = false
            live().forEach(s => {
                const w = worldOf(s)
                const at = view.toScreen(w.x, w.y)
                if (toSeg(at, a, b) > r) return
                touched = true
                s.rubbed += len
                const k = Math.min(1, s.rubbed / GIANT.rub)
                s.img.setAlpha(1 - k * 0.75)
                if (k < 1) return
                s.gone = true
                erased += 1
                void FX.sparks(scene, at.x, at.y, { color: C.white, count: 8, spread: 40, size: 6, duration: 380, depth: 130 })
                void FX.to(scene, s.img, { alpha: 0, scale: s.img.scale * 1.4 }, { duration: TIMING.rubOut }).then(() => s.img.setVisible(false))
            })
            return { touched, erased }
        },
        startScrub(onErase, onRub) {
            erase = onErase
            rubbing = onRub
            owner = null
        },
        stopScrub() {
            erase = null
            rubbing = null
            owner = null
        },
        async shine() {
            const at = view.toScreen(box.x, box.y)
            void FX.sparks(scene, at.x, at.y, { color: C.butter, count: 22, spread: 260, size: 10, duration: 620, depth: 130 })
            await FX.to(scene, box, { scale: 1.06 }, { duration: TIMING.shine / 2, yoyo: true, ease: 'Sine.easeInOut' })
            box.setScale(1)
        },
        async lift(x, y, depth) {
            shadow.setVisible(false)
            box.setDepth(depth)
            view.restack()
            await FX.to(scene, box, { x, y }, { duration: TIMING.raise, ease: 'Back.easeOut' })
        },
        follow(x, y, depth) {
            box.setPosition(x, y).setDepth(depth)
        },
        async place() {
            const ps = plateScale('gigante') / ART
            box.setDepth(WD.placed)
            view.restack()
            void FX.to(scene, box, { scale: ps }, { duration: TIMING.fly })
            await FX.arcTo(scene, box, { x: PLATE.x, y: PLATE.y }, { height: 90, duration: TIMING.fly })
            await FX.to(scene, box, { scale: ps * 1.1 }, { duration: TIMING.snap / 2, yoyo: true })
            box.setScale(ps)
        },
        async showDirt() {
            const jobs = live().map(s => {
                s.img.setAlpha(1)
                return FX.to(scene, s.img, { scale: s.img.scale * 2.4 }, { duration: 360, ease: 'Back.easeOut' })
            })
            await FX.all(...jobs)
        },
        destroy() {
            giant.clear()
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            box.destroy()
        },
    }

    const onDown = (p: Phaser.Input.Pointer, over: Phaser.GameObjects.GameObject[]) => {
        if (!erase || owner !== null || over.length || p.y < HEADER.h) return
        owner = p.id
        last = { x: p.x, y: p.y }
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (p.id !== owner || !erase) return
        const now = { x: p.x, y: p.y }
        const res = giant.rub(last, now)
        last = now
        if (res.touched) rubbing?.()
        if (res.erased) erase(giant.dirty())
    }
    const onUp = (p: Phaser.Input.Pointer) => {
        if (p.id === owner) owner = null
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)

    return giant
}
