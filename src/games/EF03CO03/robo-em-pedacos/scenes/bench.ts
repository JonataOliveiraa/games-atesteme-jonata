import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { MOD_CELL, MOD_FRAME, MODULE_ART, MODULES, POINTS, pointFrame } from '../data/files'
import { BENCH, DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { ModuleDef, Rect, Vec } from '../types'

export interface Bench {
    readonly isOpen: boolean
    open(mod: ModuleDef, from: Vec, fromScale: number): Promise<void>
    close(to: Vec, toScale: number): Promise<void>
    pointRect(i: number): Rect
    moduleRect(): Rect
    enable(list: number[]): void
    fix(i: number): Promise<void>
    slip(i: number): Promise<void>
    nudge(i: number): Promise<void>
    light(): Promise<void>
    destroy(): void
}

export function createBench(scene: Phaser.Scene, onTap: (i: number) => void): Bench {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.veil).setVisible(false)
    const panel = scene.add.graphics().setDepth(DEPTH.bench).setVisible(false)
    const tagBg = scene.add.graphics().setDepth(DEPTH.bench + 1).setVisible(false)
    const tag = scene.add
        .text(BENCH.x, BENCH.tagY, '', { fontFamily: FONT.black, fontSize: `${SIZE.tagBig}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.bench + 2)
        .setVisible(false)
    const tool = scene.add.graphics().setDepth(DEPTH.tool).setVisible(false)
    tool.fillStyle(C.greyDark, 1)
    tool.fillRoundedRect(-9, 0, 18, 92, 9)
    tool.fillCircle(0, -6, 24)
    tool.fillStyle(C.white, 1)
    tool.fillCircle(0, -16, 11)
    tool.fillStyle(C.orange, 1)
    tool.fillRoundedRect(-12, 56, 24, 46, 10)

    let mod: ModuleDef | undefined
    let part: Phaser.GameObjects.Sprite | undefined
    let points: { sprite: Phaser.GameObjects.Sprite; zone: Phaser.GameObjects.Zone; at: Vec }[] = []
    let open = false

    const paintPanel = () => {
        const { x, y, w, h } = BENCH
        panel.clear()
        panel.fillStyle(C.shadow, 0.25)
        panel.fillRoundedRect(x - w / 2 + 6, y - h / 2 + 10, w, h, 34)
        panel.fillStyle(C.cream, 1)
        panel.fillRoundedRect(x - w / 2, y - h / 2, w, h, 34)
        panel.fillStyle(C.panel, 1)
        panel.fillRoundedRect(x - w / 2 + 24, y - h / 2 + 70, w - 48, h - 150, 26)
        panel.fillStyle(C.wood, 1)
        panel.fillRoundedRect(x - w / 2 + 24, BENCH.moduleY - 6, w - 48, 44, 18)
        panel.fillStyle(C.woodDark, 1)
        panel.fillRoundedRect(x - w / 2 + 40, BENCH.moduleY + 26, w - 80, 14, 7)
    }

    const at = (p: { x: number; y: number }, bottom: number): Vec => ({
        x: BENCH.moduleX + (p.x - MOD_CELL / 2) * BENCH.moduleScale,
        y: BENCH.moduleY + (p.y - bottom) * BENCH.moduleScale,
    })

    const clearPoints = () => {
        points.forEach(p => {
            scene.tweens.killTweensOf(p.sprite)
            p.sprite.destroy()
            p.zone.destroy()
        })
        points = []
    }

    const twist = async (p: Vec) => {
        tool.setPosition(p.x + 26, p.y + 6).setAngle(30).setVisible(true).setAlpha(1).setScale(0.6)
        await FX.to(scene, tool, { scale: 1, x: p.x + 10, y: p.y }, { duration: 160, ease: Ease.back(2) })
        await FX.to(scene, tool, { angle: 30 + 200 }, { duration: 360, ease: 'Sine.easeInOut' })
    }

    return {
        get isOpen() {
            return open
        },
        async open(next, from, fromScale) {
            mod = next
            open = true
            const art = MODULE_ART[next.id]
            paintPanel()
            veil.setVisible(true).setFillStyle(C.shadow, 0)
            panel.setVisible(true).setAlpha(0)
            tag.setText(LABEL[next.id]).setVisible(true).setAlpha(0)
            const w = tag.width + 44
            tagBg.clear()
            tagBg.fillStyle(C.white, 1)
            tagBg.fillRoundedRect(BENCH.x - w / 2, BENCH.tagY - 26, w, 52, 26)
            tagBg.setVisible(true).setAlpha(0)
            part?.destroy()
            part = scene.add
                .sprite(from.x, from.y, MODULES, MOD_FRAME[next.id].off)
                .setOrigin(0.5, art.bottom / MOD_CELL)
                .setScale(fromScale)
                .setDepth(DEPTH.benchPart)
            void FX.to(scene, veil, { fillAlpha: 0.55 }, { duration: 240 })
            void FX.to(scene, [panel, tag, tagBg], { alpha: 1 }, { duration: 240 })
            await FX.to(scene, part, { x: BENCH.moduleX, y: BENCH.moduleY, scale: BENCH.moduleScale }, { duration: 460, ease: Ease.back(1.3) })
            clearPoints()
            next.points.forEach((pt, i) => {
                const p = at(art.points[i], art.bottom)
                const sprite = scene.add
                    .sprite(p.x, p.y, POINTS, pointFrame(pt.type, pt.loose))
                    .setScale(BENCH.pointScale * 0.3)
                    .setDepth(DEPTH.benchPoint)
                void FX.to(scene, sprite, { scale: BENCH.pointScale }, { duration: 260, delay: i * 70, ease: Ease.back(2) })
                const zone = scene.add.zone(p.x, p.y, BENCH.pointHit, BENCH.pointHit).setDepth(DEPTH.benchPoint + 1).setInteractive({ useHandCursor: true })
                if (zone.input) zone.input.enabled = false
                zone.on('pointerdown', () => onTap(i))
                points.push({ sprite, zone, at: p })
            })
            await FX.wait(scene, 260 + next.points.length * 70)
        },
        async close(to, toScale) {
            points.forEach(p => {
                if (p.zone.input) p.zone.input.enabled = false
            })
            void FX.to(scene, points.map(p => p.sprite), { alpha: 0, scale: 0.2 }, { duration: 200 })
            void FX.to(scene, [panel, tag, tagBg], { alpha: 0 }, { duration: 260 })
            void FX.to(scene, veil, { fillAlpha: 0 }, { duration: 260 })
            if (part) await FX.to(scene, part, { x: to.x, y: to.y, scale: toScale }, { duration: 460, ease: 'Sine.easeInOut' })
            part?.destroy()
            part = undefined
            clearPoints()
            ;[veil, panel, tag, tagBg, tool].forEach(o => o.setVisible(false))
            open = false
        },
        pointRect(i) {
            const p = points[i]?.at ?? { x: BENCH.x, y: BENCH.y }
            return { x: p.x, y: p.y, w: BENCH.pointHit, h: BENCH.pointHit }
        },
        moduleRect() {
            const art = mod ? MODULE_ART[mod.id] : MODULE_ART.legs
            const h = (art.bottom - art.top + 40) * BENCH.moduleScale
            return { x: BENCH.moduleX, y: BENCH.moduleY - h / 2, w: 330 * BENCH.moduleScale, h }
        },
        enable(list) {
            points.forEach((p, i) => {
                if (p.zone.input) p.zone.input.enabled = list.includes(i)
            })
        },
        async fix(i) {
            const p = points[i]
            if (!p || !mod) return
            await twist(p.at)
            p.sprite.setFrame(pointFrame(mod.points[i].type, false))
            void FX.sparks(scene, p.at.x, p.at.y, { color: C.yellow, count: 10, spread: 90, depth: DEPTH.tool + 1 })
            void FX.impact(scene, p.sprite, 0.14)
            await FX.to(scene, tool, { alpha: 0 }, { duration: 140 })
            tool.setVisible(false)
        },
        async slip(i) {
            const p = points[i]
            if (!p || !mod) return
            tool.setPosition(p.at.x + 26, p.at.y + 6).setAngle(30).setVisible(true).setAlpha(1).setScale(1)
            await FX.to(scene, tool, { x: p.at.x + 120, y: p.at.y + 70, angle: 120 }, { duration: 260, ease: 'Quad.easeOut' })
            p.sprite.setFrame(pointFrame(mod.points[i].type, true))
            void FX.sparks(scene, p.at.x, p.at.y, { color: C.red, count: 14, spread: 110, depth: DEPTH.tool + 1 })
            FX.shakeCam(scene, 'leve')
            await FX.impact(scene, p.sprite, 0.2)
        },
        async nudge(i) {
            const p = points[i]
            if (!p) return
            await FX.to(scene, p.sprite, { angle: 10 }, { duration: 80, yoyo: true, repeat: 2 })
            p.sprite.setAngle(0)
        },
        async light() {
            if (!part || !mod) return
            part.setFrame(MOD_FRAME[mod.id].on)
            void FX.ping(scene, BENCH.moduleX, BENCH.moduleY - 120, C.yellow, { radius: 200, duration: 520, depth: DEPTH.tool })
            void FX.stars(scene, BENCH.moduleX, BENCH.moduleY - 140, { color: C.glow, count: 12, depth: DEPTH.tool + 1 })
            await FX.impact(scene, part, 0.1)
            await FX.wait(scene, 420)
        },
        destroy() {
            clearPoints()
            part?.destroy()
            ;[veil, panel, tag, tagBg, tool].forEach(o => o.destroy())
        },
    }
}
