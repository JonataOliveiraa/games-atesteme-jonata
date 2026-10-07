import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { MOD_CELL, MOD_FRAME, MODULE_ART, MODULES, PLUG_FRAME } from '../data/files'
import { DEPTH, LIFT, PALLETS, PLUG, ROBOT } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { ModuleId, PhaseDef, Rect, Vec } from '../types'

export interface Robot {
    load(phase: PhaseDef, base: Partial<Record<ModuleId, ModuleId>>): void
    ids(): ModuleId[]
    pallet(id: ModuleId): Vec
    palletRect(id: ModuleId): Rect
    palletsRect(): Rect
    robotRect(): Rect
    plugRect(): Rect
    split(): Promise<void>
    enablePallets(ids: ModuleId[]): void
    setLit(id: ModuleId, on: boolean): void
    markDone(id: ModuleId): void
    showGhosts(on: boolean): void
    attach(id: ModuleId): Promise<void>
    drop(id: ModuleId): Promise<Vec>
    setPlug(ready: boolean): void
    powerUp(): Promise<void>
    walk(): Promise<void>
    sprite(id: ModuleId): Phaser.GameObjects.Sprite | undefined
    hide(id: ModuleId): void
    show(id: ModuleId): void
    destroy(): void
}

interface View {
    id: ModuleId
    sprite: Phaser.GameObjects.Sprite
    ghost: Phaser.GameObjects.Sprite
    zone: Phaser.GameObjects.Zone
    slot: number
}

const ORDER_DEPTH: Record<ModuleId, number> = { shoes: 0, legs: 1, arms: 2, body: 3, head: 4 }
const SHOULDER = 180

export function createRobot(scene: Phaser.Scene, onPallet: (id: ModuleId) => void, onPlug: () => void): Robot {
    const pallets = scene.add.graphics().setDepth(DEPTH.pallet)
    const marks = scene.add.graphics().setDepth(DEPTH.module + 1)
    const tags: Phaser.GameObjects.GameObject[] = []
    const plug = scene.add.sprite(PLUG.x, PLUG.y, MODULES, PLUG_FRAME.off).setScale(PLUG.scale).setDepth(DEPTH.plug)
    const plugZone = scene.add.zone(PLUG.x, PLUG.y, PLUG.hit, PLUG.hit).setDepth(DEPTH.plug + 1).setInteractive({ useHandCursor: true })
    if (plugZone.input) plugZone.input.enabled = false
    plugZone.on('pointerdown', () => onPlug())
    let plugPulse: Phaser.Tweens.Tween | undefined

    let views: View[] = []
    let base: Partial<Record<ModuleId, ModuleId>> = {}
    const done = new Set<ModuleId>()

    const art = (id: ModuleId) => MODULE_ART[id]
    const height = (id: ModuleId) => (art(id).bottom - art(id).top) * ROBOT.scale

    const bottomOf = (id: ModuleId): number => {
        const under = base[id]
        if (!under) return LIFT.top
        if (id === 'arms') return bottomOf(under) - (art(under).bottom - SHOULDER) * ROBOT.scale + (art(id).bottom - 152) * ROBOT.scale
        return bottomOf(under) - height(under) + art(id).seat * ROBOT.scale
    }

    const assembled = (id: ModuleId): Vec => ({ x: LIFT.x, y: bottomOf(id) })

    const slotPos = (slot: number): Vec => {
        const s = PALLETS.slots[slot]
        return { x: s.x, y: s.y - PALLETS.h / 2 }
    }

    const view = (id: ModuleId) => views.find(v => v.id === id)

    const drawPallets = () => {
        pallets.clear()
        marks.clear()
        views.forEach(v => {
            const s = PALLETS.slots[v.slot]
            const left = s.x - PALLETS.w / 2
            pallets.fillStyle(C.woodDark, 1)
            pallets.fillRoundedRect(left + 10, s.y - 2, PALLETS.w - 20, PALLETS.h, 10)
            pallets.fillStyle(C.wood, 1)
            pallets.fillRoundedRect(left, s.y - PALLETS.h / 2 - 4, PALLETS.w, 18, 9)
            const slat = (PALLETS.w - 24) / 3
            for (let k = 0; k < 3; k++) pallets.fillRoundedRect(left + 12 + k * slat + 4, s.y + 8, slat - 8, 16, 6)
            if (done.has(v.id)) {
                const x = s.x + PALLETS.w / 2 - 6
                const y = s.y - 128
                marks.fillStyle(C.mint, 1)
                marks.fillCircle(x, y, 22)
                marks.lineStyle(7, C.white, 1)
                marks.beginPath()
                marks.moveTo(x - 10, y)
                marks.lineTo(x - 2, y + 8)
                marks.lineTo(x + 11, y - 8)
                marks.strokePath()
            }
        })
    }

    const clearViews = () => {
        views.forEach(v => {
            scene.tweens.killTweensOf(v.sprite)
            v.sprite.destroy()
            v.ghost.destroy()
            v.zone.destroy()
        })
        tags.forEach(t => t.destroy())
        tags.length = 0
        views = []
        done.clear()
    }

    const arc = (target: Phaser.GameObjects.Sprite, to: Vec, scale: number, ms: number, lift: number) => {
        const from = { x: target.x, y: target.y, s: target.scale }
        return new Promise<void>(resolve =>
            scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: FX.ms(scene, ms),
                ease: 'Sine.easeInOut',
                onUpdate: tween => {
                    const t = tween.getValue() ?? 0
                    target
                        .setPosition(Phaser.Math.Linear(from.x, to.x, t), Phaser.Math.Linear(from.y, to.y, t) - Math.sin(t * Math.PI) * lift)
                        .setScale(Phaser.Math.Linear(from.s, scale, t))
                },
                onComplete: () => resolve(),
            }),
        )
    }

    const robotSprites = () => views.filter(v => v.sprite.getData('attached')).map(v => v.sprite)

    return {
        load(phase, links) {
            clearViews()
            base = links
            phase.modules.forEach(m => {
                const a = art(m.id)
                const origin: [number, number] = [0.5, a.bottom / MOD_CELL]
                const at = assembled(m.id)
                const depth = DEPTH.robot + ORDER_DEPTH[m.id]
                const sprite = scene.add.sprite(at.x, at.y, MODULES, MOD_FRAME[m.id].off).setOrigin(...origin).setScale(ROBOT.scale).setDepth(depth)
                const ghost = scene.add
                    .sprite(at.x, at.y, MODULES, MOD_FRAME[m.id].off)
                    .setOrigin(...origin)
                    .setScale(ROBOT.scale)
                    .setDepth(DEPTH.ghost + ORDER_DEPTH[m.id] * 0.1)
                    .setTintFill(C.shadow)
                    .setAlpha(0)
                const slot = phase.pallets[m.id] ?? 0
                const s = PALLETS.slots[slot]
                const zone = scene.add
                    .zone(s.x, s.y - PALLETS.hit.h / 2 + 20, PALLETS.hit.w, PALLETS.hit.h)
                    .setDepth(DEPTH.module + 2)
                    .setInteractive({ useHandCursor: true })
                if (zone.input) zone.input.enabled = false
                zone.on('pointerdown', () => onPallet(m.id))
                const label = scene.add
                    .text(s.x, s.y + PALLETS.tagDY, LABEL[m.id], { fontFamily: FONT.black, fontSize: `${SIZE.tag}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.pallet + 2)
                    .setAlpha(0)
                const tagBg = scene.add.graphics().setDepth(DEPTH.pallet + 1).setAlpha(0)
                const w = label.width + 26
                tagBg.fillStyle(C.white, 1)
                tagBg.fillRoundedRect(s.x - w / 2, s.y + PALLETS.tagDY - 17, w, 34, 17)
                tags.push(label, tagBg)
                views.push({ id: m.id, sprite, ghost, zone, slot })
            })
            pallets.clear()
            marks.clear()
            plug.setFrame(PLUG_FRAME.off)
            plugPulse?.stop()
            plug.setScale(PLUG.scale)
            if (plugZone.input) plugZone.input.enabled = false
            views.forEach(v => v.sprite.setData('attached', true))
        },
        ids: () => views.map(v => v.id),
        pallet(id) {
            const v = view(id)
            return slotPos(v?.slot ?? 0)
        },
        palletRect(id) {
            const s = PALLETS.slots[view(id)?.slot ?? 0]
            return { x: s.x, y: s.y - PALLETS.hit.h / 2 + 30, w: PALLETS.hit.w, h: PALLETS.hit.h + 20 }
        },
        palletsRect() {
            const used = views.map(v => PALLETS.slots[v.slot])
            const xs = used.map(s => s.x)
            const ys = used.map(s => s.y)
            const left = Math.min(...xs) - PALLETS.hit.w / 2
            const right = Math.max(...xs) + PALLETS.hit.w / 2
            const top = Math.min(...ys) - PALLETS.hit.h + 10
            const bottom = Math.max(...ys) + PALLETS.tagDY + 24
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        robotRect() {
            const top = Math.min(...views.map(v => assembled(v.id).y - height(v.id))) - 30
            return { x: LIFT.x, y: (top + LIFT.top) / 2 + 10, w: 320, h: LIFT.top - top + 30 }
        },
        plugRect: () => ({ x: PLUG.x, y: PLUG.y, w: PLUG.hit, h: PLUG.hit }),
        async split() {
            const sprites = views.map(v => v.sprite)
            await FX.to(scene, sprites, { x: LIFT.x + 8 }, { duration: 60, yoyo: true, repeat: 3 })
            void FX.sparks(scene, LIFT.x, LIFT.top - 220, { color: C.yellow, count: 14, spread: 160, depth: DEPTH.fx })
            await FX.wait(scene, 260)
            drawPallets()
            await Promise.all(
                views.map((v, k) =>
                    FX.wait(scene, k * 160).then(() => {
                        v.sprite.setData('attached', false)
                        return arc(v.sprite, slotPos(v.slot), PALLETS.moduleScale, 620, 120).then(() => FX.impact(scene, v.sprite, 0.1))
                    }),
                ),
            )
            tags.forEach(t => void FX.to(scene, t as Phaser.GameObjects.Text, { alpha: 1 }, { duration: 220 }))
        },
        enablePallets(ids) {
            views.forEach(v => {
                if (v.zone.input) v.zone.input.enabled = ids.includes(v.id)
            })
        },
        setLit(id, on) {
            const v = view(id)
            v?.sprite.setFrame(on ? MOD_FRAME[id].on : MOD_FRAME[id].off)
        },
        markDone(id) {
            done.add(id)
            drawPallets()
        },
        showGhosts(on) {
            views.forEach(v => {
                if (v.sprite.getData('attached')) return
                void FX.to(scene, v.ghost, { alpha: on ? 0.16 : 0 }, { duration: 300 })
            })
        },
        async attach(id) {
            const v = view(id)
            if (!v) return
            v.sprite.setDepth(DEPTH.robot + ORDER_DEPTH[id] + 10)
            done.delete(id)
            drawPallets()
            await arc(v.sprite, assembled(id), ROBOT.scale, 560, 140)
            v.sprite.setDepth(DEPTH.robot + ORDER_DEPTH[id])
            v.sprite.setData('attached', true)
            void FX.to(scene, v.ghost, { alpha: 0 }, { duration: 160 })
            FX.shakeCam(scene, 'leve')
            await FX.impact(scene, v.sprite, 0.08)
        },
        async drop(id) {
            const v = view(id)
            if (!v) return { x: LIFT.x, y: LIFT.top }
            v.sprite.setDepth(DEPTH.robot + 20)
            await arc(v.sprite, assembled(id), ROBOT.scale, 560, 140)
            await FX.to(scene, v.sprite, { angle: -12 }, { duration: 160, yoyo: true, repeat: 1 })
            const to = { x: LIFT.x + 170, y: 640 }
            await FX.to(scene, v.sprite, { x: to.x, y: to.y, angle: 100 }, { duration: 520, ease: 'Quad.easeIn' })
            FX.shakeCam(scene, 'medio')
            await FX.to(scene, v.sprite, { angle: 88 }, { duration: 300, ease: Ease.spring(2, 6) })
            return { x: to.x, y: to.y - 120 }
        },
        setPlug(ready) {
            plugPulse?.stop()
            plug.setScale(PLUG.scale)
            if (plugZone.input) plugZone.input.enabled = ready
            if (ready) plugPulse = scene.tweens.add({ targets: plug, scale: PLUG.scale * 1.1, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        async powerUp() {
            plugPulse?.stop()
            plug.setScale(PLUG.scale).setFrame(PLUG_FRAME.on)
            if (plugZone.input) plugZone.input.enabled = false
            await FX.impact(scene, plug, 0.12)
            const sprites = robotSprites()
            for (const s of sprites) {
                void FX.sparks(scene, s.x, s.y - 60, { color: C.yellow, count: 8, spread: 90, depth: DEPTH.fx })
                await FX.impact(scene, s, 0.08)
            }
        },
        async walk() {
            const sprites = robotSprites()
            const startX = LIFT.x
            const hop = (dx: number) =>
                new Promise<void>(resolve =>
                    scene.tweens.addCounter({
                        from: 0,
                        to: 1,
                        duration: FX.ms(scene, 900),
                        onUpdate: tween => {
                            const t = tween.getValue() ?? 0
                            sprites.forEach(s => {
                                s.x = startX + dx * t
                                s.setAngle(Math.sin(t * Math.PI * 6) * 3)
                            })
                        },
                        onComplete: () => resolve(),
                    }),
                )
            const ys = sprites.map(s => s.y)
            await hop(70)
            await FX.to(scene, sprites, { y: '-=46' }, { duration: 220, ease: 'Quad.easeOut', yoyo: true, repeat: 1 })
            sprites.forEach((s, k) => s.setY(ys[k]).setAngle(0))
        },
        sprite: id => view(id)?.sprite,
        hide(id) {
            view(id)?.sprite.setVisible(false)
        },
        show(id) {
            view(id)?.sprite.setVisible(true)
        },
        destroy() {
            clearViews()
            plugPulse?.stop()
            pallets.destroy()
            marks.destroy()
            plug.destroy()
            plugZone.destroy()
        },
    }
}
