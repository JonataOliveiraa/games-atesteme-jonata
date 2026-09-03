import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, H, MAT, VEHICLE_FRAME, W } from '../data/layout'
import { settled } from './timing'
import type { Point, VehicleModel } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export function drawBackdrop(scene: Phaser.Scene) {
    const made: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists('bg-ceu')) {
        const source = scene.textures.get('bg-ceu').getSourceImage()
        const sw = source.width || 1
        const sh = source.height || 1
        const scale = Math.max(W / sw, H / sh)
        made.push(scene.add.image(W / 2, 300, 'bg-ceu')
            .setDisplaySize(sw * scale, sh * scale)
            .setDepth(DEPTH.sky))
    } else {
        const sky = scene.add.graphics().setDepth(DEPTH.sky)
        sky.fillStyle(C.board, 1)
        sky.fillRect(0, 0, W, H)
        made.push(sky)
    }

    const ground = scene.add.graphics().setDepth(DEPTH.ground)
    ground.fillStyle(C.ink, 1)
    ground.fillRect(0, MAT.top - 16, W, 12)
    ground.fillStyle(0xc8a273, 1)
    ground.fillRect(0, MAT.top - 6, W, H - MAT.top + 6)
    ground.fillStyle(0xb38f61, 1)
    for (let x = -40; x < W; x += 190) {
        ground.fillRect(x, MAT.top - 6, 94, H - MAT.top + 6)
    }
    ground.fillStyle(C.white, 0.16)
    ground.fillRect(0, MAT.top - 6, W, 8)
    made.push(ground)

    const disc = scene.add.graphics().setDepth(DEPTH.plate)
    disc.fillStyle(C.ink, 0.28)
    disc.fillEllipse(MAT.x, MAT.y + 66, 300, 66)
    disc.fillStyle(C.ink, 1)
    disc.fillEllipse(MAT.x, MAT.y + 60, 294, 62)
    disc.fillStyle(C.creamEdge, 1)
    disc.fillEllipse(MAT.x, MAT.y + 58, 278, 52)
    disc.fillStyle(C.cream, 1)
    disc.fillEllipse(MAT.x, MAT.y + 56, 268, 46)
    disc.fillStyle(C.warn, 0.22)
    disc.fillEllipse(MAT.x, MAT.y + 55, 206, 34)
    made.push(disc)

    return made
}

export function createVehiclePiece(scene: Phaser.Scene) {
    const holder = scene.add.container(MAT.x, MAT.y).setDepth(DEPTH.vehicle)
    const pulse = scene.add.container(0, 0)
    const skin = scene.add.container(0, 0)
    const glow = scene.add.graphics()
    pulse.add([glow, skin])
    holder.add(pulse)

    const ribbon = scene.add.container(MAT.x, MAT.nameY).setDepth(DEPTH.album + 1)
    const ribbonG = scene.add.graphics()
    const name = scene.add.text(0, -1, '', {
        fontFamily: FONT.black, fontSize: '26px', color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    name.setStroke(CSS.ink, 6)
    ribbon.add([ribbonG, name])

    let idle = false
    let lifted = false

    function paintRibbon() {
        const w = Math.max(150, name.width + 52)
        ribbonG.clear()
        ribbonG.fillStyle(C.ink, 1)
        ribbonG.fillRoundedRect(-w / 2, -21, w, 42, 21)
        ribbonG.fillStyle(C.skyDeep, 1)
        ribbonG.fillRoundedRect(-w / 2 + 4, -17, w - 8, 34, 17)
        ribbonG.fillStyle(C.sky, 1)
        ribbonG.fillRoundedRect(-w / 2 + 4, -17, w - 8, 27, 17)
    }

    function paintGlow(on: boolean) {
        glow.clear()
        if (!on) return
        glow.fillStyle(C.warn, 0.28)
        glow.fillCircle(0, 0, MAT.size * 0.66)
        glow.lineStyle(8, C.warn, 0.95)
        glow.strokeCircle(0, 0, MAT.size * 0.66)
    }

    function fill(vehicle: VehicleModel, size: number) {
        skin.removeAll(true)
        if (scene.textures.exists('veiculos')) {
            const sprite = scene.add.sprite(0, 0, 'veiculos', vehicle.frame)
            sprite.setDisplaySize(size, size * (VEHICLE_FRAME.h / VEHICLE_FRAME.w))
            skin.add(sprite)
            return
        }
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-size * 0.36, -size * 0.2, size * 0.72, size * 0.4, size * 0.12)
        g.fillStyle(C.sky, 1)
        g.fillRoundedRect(-size * 0.31, -size * 0.16, size * 0.62, size * 0.3, size * 0.09)
        g.fillStyle(C.ink, 1)
        g.fillCircle(-size * 0.18, size * 0.2, size * 0.09)
        g.fillCircle(size * 0.18, size * 0.2, size * 0.09)
        skin.add(g)
    }

    function startIdle() {
        if (idle) return
        idle = true
        FX.breathe(scene, fx(pulse), { grow: 1.05, duration: 1100 })
    }

    function stopIdle() {
        idle = false
        FX.kill(scene, fx(pulse))
        pulse.setScale(1)
    }

    function reset() {
        holder.setPosition(MAT.x, MAT.y).setScale(1).setAngle(0).setAlpha(1)
        skin.setPosition(0, 0).setAlpha(1).setAngle(0).setScale(1)
    }

    return {
        at: (): Point => ({ x: holder.x, y: holder.y }),

        get lifted() {
            return lifted
        },

        show(vehicle: VehicleModel) {
            stopIdle()
            lifted = false
            paintGlow(false)
            fill(vehicle, MAT.size)
            name.setText(vehicle.name)
            paintRibbon()
            ribbon.setAlpha(0).setScale(0.7)
            reset()
            skin.setScale(0.5)
            void FX.to(scene, fx(skin), { scale: 1 }, { duration: 340, ease: Ease.back(2.4) })
            void FX.to(scene, fx(ribbon), { alpha: 1, scale: 1 },
                { duration: 300, delay: 120, ease: Ease.back(2) })
            startIdle()
        },

        lift() {
            if (lifted) return
            lifted = true
            paintGlow(true)
            void FX.to(scene, fx(holder), { scale: 1.14, y: MAT.y - 20 },
                { duration: 220, ease: Ease.back(2.6) })
        },

        drop() {
            if (!lifted) return
            lifted = false
            paintGlow(false)
            void FX.to(scene, fx(holder), { scale: 1, y: MAT.y }, { duration: 220 })
        },

        nudge() {
            void FX.to(scene, fx(holder), { y: MAT.y - 24 },
                { duration: 160, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
        },

        async flyTo(to: Point) {
            stopIdle()
            paintGlow(false)
            void FX.to(scene, fx(ribbon), { alpha: 0 }, { duration: 160 })
            await settled(scene, FX.arcTo(scene, fx(holder), to, { height: 140, duration: 460 }), 460)
            holder.setPosition(to.x, to.y).setScale(1)
        },

        async back() {
            await settled(scene, FX.arcTo(scene, fx(holder),
                { x: MAT.x, y: MAT.y }, { height: 160, duration: 480 }), 480)
            reset()
            lifted = false
            void FX.to(scene, fx(ribbon), { alpha: 1 }, { duration: 220 })
            startIdle()
        },

        async toAlbum(slot: Point, size: number) {
            stopIdle()
            void FX.to(scene, fx(ribbon), { alpha: 0 }, { duration: 160 })
            await settled(scene, FX.to(scene, fx(holder),
                { x: slot.x, y: slot.y, scale: size / MAT.size },
                { duration: 460, ease: 'Sine.easeInOut' }), 460)
            holder.setAlpha(0)
        },

        hide() {
            stopIdle()
            holder.setAlpha(0)
            ribbon.setAlpha(0)
        },

        destroy() {
            stopIdle()
            FX.kill(scene, fx(holder))
            FX.kill(scene, fx(skin))
            FX.kill(scene, fx(ribbon))
            holder.destroy()
            ribbon.destroy()
        },
    }
}
