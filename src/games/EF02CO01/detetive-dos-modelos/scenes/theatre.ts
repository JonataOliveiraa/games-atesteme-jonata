import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, H, VEHICLE_FRAME, W } from '../data/layout'
import { MISS_LINE, SCENERY, zoneAttribute } from '../data/vehicles'
import { drawAttribute, drawBan, drawCheck, drawCross, dustPuff } from './icons'
import { pause, settled } from './timing'
import type { Attribute, TestZone, VehicleModel } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

const FALLBACK: Record<string, number> = {
    air: 0x7fc9fb,
    land: 0x8b96a5,
    water: 0x2fb6e0,
    rail: 0xd8b98c,
}

const BASE: Record<string, number> = {
    air: 340,
    land: 520,
    water: 470,
    rail: 520,
}

const SIZE = 230

function addBackdrop(scene: Phaser.Scene, box: Phaser.GameObjects.Container, key: string) {
    const texture = SCENERY[key]
    if (texture && scene.textures.exists(texture)) {
        const source = scene.textures.get(texture).getSourceImage()
        const sw = source.width || 1
        const sh = source.height || 1
        const scale = Math.max(W / sw, H / sh)
        box.add(scene.add.image(W / 2, H / 2, texture).setDisplaySize(sw * scale, sh * scale))
        return
    }
    const g = scene.add.graphics()
    g.fillStyle(FALLBACK[key] ?? C.plain, 1)
    g.fillRect(0, 0, W, H)
    if (key === 'land') {
        g.fillStyle(C.white, 0.85)
        for (let x = -60; x < W + 60; x += 190) {
            g.fillRoundedRect(x, 560, 110, 16, 8)
        }
    }
    box.add(g)
}

function addVehicle(scene: Phaser.Scene, box: Phaser.GameObjects.Container, vehicle: VehicleModel) {
    const holder = scene.add.container(0, 0)
    if (scene.textures.exists('veiculos')) {
        const sprite = scene.add.sprite(0, 0, 'veiculos', vehicle.frame)
        sprite.setDisplaySize(SIZE, SIZE * (VEHICLE_FRAME.h / VEHICLE_FRAME.w))
        holder.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-SIZE * 0.34, -SIZE * 0.18, SIZE * 0.68, SIZE * 0.36, 22)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-SIZE * 0.29, -SIZE * 0.14, SIZE * 0.58, SIZE * 0.26, 16)
        holder.add(g)
    }
    box.add(holder)
    return holder
}

function addVerdict(scene: Phaser.Scene, box: Phaser.GameObjects.Container, ok: boolean, attr: Attribute) {
    const badge = scene.add.container(W / 2, 156).setAlpha(0).setScale(2.2)
    const disc = scene.add.graphics()
    disc.fillStyle(C.ink, 1)
    disc.fillCircle(0, 0, 82)
    disc.fillStyle(ok ? C.okDark : C.badDark, 1)
    disc.fillCircle(0, 0, 74)
    disc.fillStyle(ok ? C.ok : C.bad, 1)
    disc.fillCircle(0, -5, 66)
    disc.fillStyle(C.white, 0.3)
    disc.fillEllipse(-24, -34, 58, 22)
    badge.add(disc)

    const sign = scene.add.graphics()
    if (ok) drawCheck(sign, 98, C.white, null)
    else drawCross(sign, 88, C.white, null)
    badge.add(sign)

    if (!ok) {
        const pin = scene.add.container(92, 46)
        const ring = scene.add.graphics()
        ring.fillStyle(C.ink, 1)
        ring.fillCircle(0, 0, 44)
        ring.fillStyle(C.cream, 1)
        ring.fillCircle(0, -3, 38)
        pin.add(ring)
        const art = scene.add.graphics()
        drawAttribute(art, attr, 56)
        pin.add(art)
        const ban = scene.add.graphics().setPosition(22, 22)
        drawBan(ban, 46)
        pin.add(ban)
        badge.add(pin)
    }

    box.add(badge)
    return badge
}

function addLine(scene: Phaser.Scene, box: Phaser.GameObjects.Container, text: string, ok: boolean) {
    const ribbon = scene.add.container(W / 2, H - 96).setAlpha(0).setScale(0.8)
    const label = scene.add.text(0, -2, text, {
        fontFamily: FONT.black, fontSize: '38px', color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    label.setStroke(CSS.ink, 8)
    const w = label.width + 96
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 0.92)
    g.fillRoundedRect(-w / 2, -40, w, 80, 34)
    g.fillStyle(ok ? C.okDark : C.badDark, 1)
    g.fillRoundedRect(-w / 2 + 7, -33, w - 14, 66, 28)
    g.fillStyle(ok ? C.ok : C.bad, 1)
    g.fillRoundedRect(-w / 2 + 7, -33, w - 14, 56, 28)
    ribbon.add([g, label])
    box.add(ribbon)
    return ribbon
}

export async function playTest(scene: Phaser.Scene, opts: {
    zone: TestZone
    zoneKey: string
    vehicle: VehicleModel
    ok: boolean
    onAction?: () => void
}): Promise<void> {
    const { zoneKey, vehicle, ok } = opts
    const attr = zoneAttribute(opts.zone)
    const base = BASE[zoneKey] ?? 480

    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.ink, 1)
        .setDepth(DEPTH.overlay - 1)
        .setAlpha(0)
        .setInteractive()

    const box = scene.add.container(0, 0).setDepth(DEPTH.overlay).setAlpha(0)
    addBackdrop(scene, box, zoneKey)

    const frame = scene.add.graphics()
    frame.lineStyle(18, C.ink, 1)
    frame.strokeRoundedRect(9, 9, W - 18, H - 18, 26)
    box.add(frame)

    const car = addVehicle(scene, box, vehicle)
    car.setPosition(-220, base).setAlpha(0)

    void FX.to(scene, fx(veil), { alpha: 0.55 }, { duration: 220 })
    await settled(scene, FX.to(scene, fx(box), { alpha: 1 }, { duration: 280 }), 280)

    opts.onAction?.()
    car.setAlpha(1)

    if (ok) {
        if (zoneKey === 'air') {
            await settled(scene, FX.to(scene, fx(car),
                { x: W + 220, y: base - 120, angle: -9 },
                { duration: 1700, ease: 'Sine.easeInOut' }), 1700)
        } else if (zoneKey === 'water') {
            void FX.to(scene, fx(car), { angle: 7 },
                { duration: 420, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' })
            void FX.to(scene, fx(car), { y: base + 20 },
                { duration: 380, yoyo: true, repeat: 3, ease: 'Sine.easeInOut' })
            await settled(scene, FX.to(scene, fx(car), { x: W + 220 },
                { duration: 1700, ease: 'Sine.easeInOut' }), 1700)
        } else {
            const dust = scene.time.addEvent({
                delay: 260,
                repeat: 5,
                callback: () => dustPuff(scene, car.x - 90, base + 74,
                    { count: 6, spread: 70, depth: DEPTH.overlay + 1 }),
            })
            await settled(scene, FX.to(scene, fx(car), { x: W + 220 },
                { duration: 1700, ease: 'Sine.easeInOut' }), 1700)
            dust.remove()
        }
    } else if (zoneKey === 'air') {
        await settled(scene, FX.to(scene, fx(car), { x: W / 2, y: base - 30 },
            { duration: 620, ease: 'Sine.easeOut' }), 620)
        await settled(scene, FX.to(scene, fx(car), { angle: 12 },
            { duration: 120, yoyo: true, repeat: 2 }), 500)
        await settled(scene, FX.to(scene, fx(car), { y: H + 200, angle: 40 },
            { duration: 620, ease: 'Quad.easeIn' }), 620)
        dustPuff(scene, W / 2, H - 60, { count: 16, spread: 160, depth: DEPTH.overlay + 1 })
    } else if (zoneKey === 'water') {
        await settled(scene, FX.to(scene, fx(car), { x: W / 2 },
            { duration: 560, ease: 'Sine.easeOut' }), 560)
        bubbles(scene, W / 2, base + 40)
        await settled(scene, FX.to(scene, fx(car), { y: base + 260, alpha: 0.2, angle: 14 },
            { duration: 900, ease: 'Quad.easeIn' }), 900)
    } else {
        await settled(scene, FX.to(scene, fx(car), { x: W / 2 - 40 },
            { duration: 520, ease: 'Sine.easeOut' }), 520)
        dustPuff(scene, W / 2 - 120, base + 74, { count: 12, spread: 110, depth: DEPTH.overlay + 1 })
        await settled(scene, FX.to(scene, fx(car), { angle: -14, y: base - 22 },
            { duration: 200 }), 200)
        await settled(scene, FX.to(scene, fx(car), { angle: 3, y: base },
            { duration: 260, ease: Ease.back(2.2) }), 260)
        await settled(scene, FX.to(scene, fx(car), { x: W / 2 - 58 },
            { duration: 95, yoyo: true, repeat: 2 }), 400)
    }

    const badge = addVerdict(scene, box, ok, attr)
    const ribbon = addLine(scene, box, ok ? 'Funcionou!' : MISS_LINE[attr], ok)
    if (ok) void FX.sparks(scene, W / 2, 156, { color: C.ok, count: 26, spread: 260, depth: DEPTH.overlay + 1 })
    else scene.cameras.main.shake(180, 0.006)

    await settled(scene, FX.to(scene, fx(badge), { alpha: 1, scale: 1 },
        { duration: 300, ease: Ease.back(2.6) }), 300)
    void FX.to(scene, fx(ribbon), { alpha: 1, scale: 1 },
        { duration: 260, ease: Ease.back(2) })
    await pause(scene, ok ? 900 : 1250)

    await settled(scene, FX.to(scene, fx(box), { alpha: 0 }, { duration: 300 }), 300)
    void FX.to(scene, fx(veil), { alpha: 0 }, { duration: 260 })
    await pause(scene, 200)
    box.destroy()
    veil.destroy()
}

function bubbles(scene: Phaser.Scene, x: number, y: number) {
    for (let i = 0; i < 16; i++) {
        const b = scene.add.circle(
            x + Phaser.Math.Between(-90, 90),
            y + Phaser.Math.Between(-10, 40),
            Phaser.Math.Between(8, 20),
            C.white,
            0.75,
        ).setDepth(DEPTH.overlay + 1)
        void FX.to(scene, b as unknown as FxTarget, {
            y: b.y - Phaser.Math.Between(90, 200),
            alpha: 0,
        }, { duration: Phaser.Math.Between(600, 1100), ease: 'Sine.easeOut' })
            .then(() => b.destroy())
    }
}
