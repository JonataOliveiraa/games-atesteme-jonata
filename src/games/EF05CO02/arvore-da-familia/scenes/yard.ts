import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { YARD_KEY } from '../data/files'
import { DEPTH, W, YARD } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Rect, Vec } from '../types'

export interface Yard {
    readonly width: number
    panned(): boolean
    setEnabled(on: boolean): void
    focus(tree: number, ms?: number): Promise<void>
    nearest(): number
    toScreen(p: Vec): Vec
    screenRect(r: Rect): Rect
    reset(): void
    destroy(): void
}

const FRAME = 'body'

export function createYard(scene: Phaser.Scene, onPan: (moving: boolean) => void): Yard {
    const cam = scene.cameras.main
    let bg: Phaser.GameObjects.GameObject[]
    let width: number
    let height: number
    if (scene.textures.exists(YARD_KEY)) {
        const tex = scene.textures.get(YARD_KEY)
        const src = tex.getSourceImage()
        if (!tex.has(FRAME)) tex.add(FRAME, 0, 0, YARD.crop, src.width, src.height - YARD.crop)
        const img = scene.add.image(0, 0, YARD_KEY, FRAME).setOrigin(0, 0).setScale(YARD.zoom).setDepth(DEPTH.sky)
        width = img.displayWidth
        height = img.displayHeight
        bg = [img]
    } else {
        width = 3270
        height = 1000
        bg = [
            scene.add.rectangle(0, 0, width, height, C.yardSky).setOrigin(0, 0).setDepth(DEPTH.sky),
            scene.add.rectangle(0, 700, width, height - 700, C.yardGrass).setOrigin(0, 0).setDepth(DEPTH.sky),
        ]
    }
    cam.setBounds(0, 0, width, height)
    const maxX = width - W
    const clampX = (x: number) => Phaser.Math.Clamp(x, 0, maxX)
    cam.setScroll(clampX(YARD.trees[1] - W / 2), YARD.scrollY)

    let enabled = false
    let down = false
    let moving = false
    let moved = false
    let startX = 0
    let startScroll = 0

    const arrow = (dir: -1 | 1) => {
        const x = dir < 0 ? YARD.arrows.left : YARD.arrows.right
        const g = scene.add.graphics()
        const r = YARD.arrows.r
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(0, 4, r)
        g.fillStyle(C.paper, 1)
        g.fillCircle(0, 0, r)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(0, 0, r)
        g.fillStyle(C.ink, 1)
        g.fillTriangle(dir * 13, 0, -dir * 9, -13, -dir * 9, 13)
        const box = scene.add.container(x, YARD.arrows.y, [g]).setDepth(DEPTH.hud).setScrollFactor(0)
        const zone = scene.add
            .zone(x, YARD.arrows.y, r * 2 + 24, r * 2 + 24)
            .setDepth(DEPTH.hud + 1)
            .setScrollFactor(0)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled || moving) return
            void FX.press(scene, box)
            const now = yard.nearest()
            const next = Phaser.Math.Clamp(now + dir, 0, YARD.trees.length - 1)
            void yard.focus(next === now ? now : next)
        })
        return { box, zone }
    }
    const arrows = [arrow(-1), arrow(1)]

    const paintArrows = () => {
        const show = [enabled && !moving && cam.scrollX > 4, enabled && !moving && cam.scrollX < maxX - 4]
        arrows.forEach((a, i) => {
            a.box.setVisible(show[i])
            if (a.zone.input) a.zone.input.enabled = show[i]
        })
    }

    const onDown = (p: Phaser.Input.Pointer) => {
        down = true
        moved = false
        startX = p.x
        startScroll = cam.scrollX
    }
    const onMove = (p: Phaser.Input.Pointer) => {
        if (!down || !enabled || !p.isDown) return
        const dx = p.x - startX
        if (!moving && Math.abs(dx) > YARD.slop) {
            moving = true
            moved = true
            scene.tweens.killTweensOf(cam)
            onPan(true)
            paintArrows()
        }
        if (moving) cam.setScroll(clampX(startScroll - dx), YARD.scrollY)
    }
    const onUp = () => {
        down = false
        if (!moving) return
        moving = false
        onPan(false)
        paintArrows()
    }
    scene.input.on('pointerdown', onDown)
    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)
    scene.input.on('pointerupoutside', onUp)
    const tick = () => paintArrows()
    scene.events.on('update', tick)

    const yard: Yard = {
        width,
        panned: () => moved,
        setEnabled(on) {
            enabled = on
            if (!on && moving) onUp()
            paintArrows()
        },
        focus(tree, ms = TIMING.pan) {
            const x = clampX(YARD.trees[tree] - W / 2)
            scene.tweens.killTweensOf(cam)
            return new Promise<void>(resolve => {
                scene.tweens.add({ targets: cam, scrollX: x, duration: FX.ms(scene, ms), ease: 'Sine.easeInOut', onComplete: () => resolve(), onStop: () => resolve() })
            })
        },
        nearest() {
            const center = cam.scrollX + W / 2
            let best = 0
            YARD.trees.forEach((x, i) => {
                if (Math.abs(x - center) < Math.abs(YARD.trees[best] - center)) best = i
            })
            return best
        },
        toScreen: p => ({ x: p.x - cam.scrollX, y: p.y - cam.scrollY }),
        screenRect: r => ({ ...r, x: r.x - cam.scrollX, y: r.y - cam.scrollY }),
        reset() {
            scene.tweens.killTweensOf(cam)
            cam.removeBounds()
            cam.setScroll(0, 0)
        },
        destroy() {
            scene.input.off('pointerdown', onDown)
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            scene.input.off('pointerupoutside', onUp)
            scene.events.off('update', tick)
            scene.tweens.killTweensOf(cam)
            arrows.forEach(a => {
                a.zone.destroy()
                a.box.destroy()
            })
            bg.forEach(o => o.destroy())
        },
    }
    return yard
}
