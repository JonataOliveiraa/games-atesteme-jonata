import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, PIECE, PIECES } from '../data/files'
import { BOX, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { ToyView } from './toy'

export interface Box {
    add(toy: ToyView): Promise<void>
    close(): Promise<void>
    reset(): void
    readonly count: number
    destroy(): void
}

const FRONT_W = ART.box.w * BOX.scale
const FRONT_H = (ART.box.bottom - ART.box.frontTop) * BOX.scale

export function createBox(scene: Phaser.Scene, slots: number): Box {
    const hasArt = scene.textures.exists(PIECES)

    const back: Phaser.GameObjects.GameObject[] = []
    const front: Phaser.GameObjects.GameObject[] = []
    if (hasArt) {
        const image = () =>
            scene.add
                .image(0, 0, PIECES, PIECE.box)
                .setOrigin(ART.box.cx / 300, ART.box.bottom / 300)
                .setScale(BOX.scale)
        back.push(image())
        front.push(image().setCrop(0, ART.box.frontTop, 300, 300 - ART.box.frontTop))
    } else {
        const b = scene.add.graphics()
        b.fillStyle(C.woodDark, 1)
        b.fillRect(-FRONT_W / 2 + 8, -FRONT_H - 26, FRONT_W - 16, 40)
        b.lineStyle(4, C.ink, 1)
        b.strokeRect(-FRONT_W / 2 + 8, -FRONT_H - 26, FRONT_W - 16, 40)
        back.push(b)
        const f = scene.add.graphics()
        f.fillStyle(C.wood, 1)
        f.fillRoundedRect(-FRONT_W / 2, -FRONT_H, FRONT_W, FRONT_H, 10)
        f.lineStyle(4, C.ink, 1)
        f.strokeRoundedRect(-FRONT_W / 2, -FRONT_H, FRONT_W, FRONT_H, 10)
        front.push(f)
    }

    const dots = scene.add.graphics()
    const ribbon = scene.add.graphics().setVisible(false)
    ribbon.fillStyle(C.ribbon, 1)
    ribbon.fillRect(-12, -FRONT_H - 34, 24, FRONT_H + 34)
    ribbon.fillRect(-FRONT_W / 2, -FRONT_H - 34, FRONT_W, 22)
    ribbon.lineStyle(3, C.ink, 1)
    ribbon.strokeRect(-12, -FRONT_H - 34, 24, FRONT_H + 34)
    ribbon.strokeRect(-FRONT_W / 2, -FRONT_H - 34, FRONT_W, 22)
    ribbon.fillCircle(-18, -FRONT_H - 44, 14)
    ribbon.fillCircle(18, -FRONT_H - 44, 14)
    ribbon.strokeCircle(-18, -FRONT_H - 44, 14)
    ribbon.strokeCircle(18, -FRONT_H - 44, 14)

    const backLayer = scene.add.container(BOX.x, BOX.base, back).setDepth(DEPTH.boxBack)
    const frontLayer = scene.add.container(BOX.x, BOX.base, [...front, dots, ribbon]).setDepth(DEPTH.boxFront)

    let inside: ToyView[] = []

    const paintDots = () => {
        dots.clear()
        for (let i = 0; i < slots; i++) {
            const x = (i - (slots - 1) / 2) * BOX.dotGap
            dots.fillStyle(i < inside.length ? C.yes : C.cream, 1)
            dots.fillCircle(x, BOX.dotsY, BOX.dotR)
            dots.lineStyle(3, C.ink, 1)
            dots.strokeCircle(x, BOX.dotsY, BOX.dotR)
        }
    }
    paintDots()

    return {
        async add(toy) {
            const k = inside.length
            inside.push(toy)
            toy.container.setDepth(DEPTH.boxToys)
            toy.container.list
                .filter((child): child is Phaser.GameObjects.Text => child instanceof Phaser.GameObjects.Text)
                .forEach(label => void FX.to(scene, label, { alpha: 0 }, { duration: 260 }))
            const to = { x: BOX.x + (k - (slots - 1) / 2) * BOX.toyGap, y: BOX.base - BOX.toyLift }
            await Promise.all([
                FX.arcTo(scene, toy.container, to, { height: 160, duration: 620 }),
                FX.to(scene, toy.container, { scale: BOX.toyScale }, { duration: 620 }),
            ])
            paintDots()
            void FX.impact(scene, frontLayer, 0.12)
            void FX.ping(scene, BOX.x, BOX.base - FRONT_H / 2, C.yes, { radius: 100, depth: DEPTH.marks })
        },
        async close() {
            ribbon.setVisible(true).setAlpha(0)
            await FX.to(scene, ribbon, { alpha: 1 }, { duration: 200 })
            await FX.impact(scene, frontLayer, 0.14)
            const parts = [backLayer, frontLayer, ...inside.map(t => t.container)]
            await Promise.all(parts.map(p => FX.to(scene, p, { x: p.x + 320, alpha: 0 }, { duration: 520, ease: 'Sine.easeIn' })))
        },
        reset() {
            inside.forEach(t => t.destroy())
            inside = []
            ribbon.setVisible(false)
            backLayer.setX(BOX.x).setAlpha(1)
            frontLayer.setX(BOX.x).setAlpha(1)
            paintDots()
        },
        get count() {
            return inside.length
        },
        destroy() {
            inside.forEach(t => t.destroy())
            inside = []
            backLayer.destroy()
            frontLayer.destroy()
        },
    }
}
