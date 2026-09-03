import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, ZONE_COLOR } from '../data/theme'
import { DEPTH, ZONES, zoneWidth, zoneX } from '../data/layout'
import { zoneKey, zoneName } from '../data/vehicles'
import { drawAttribute, drawLock } from './icons'
import { pause } from './timing'
import type { Point, TestZone } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

interface Card {
    cx: number
    cy: number
    w: number
    h: number
    ring: Phaser.GameObjects.Graphics
    lock: Phaser.GameObjects.Container
    hit: Phaser.GameObjects.Zone
}

function paintScene(g: Phaser.GameObjects.Graphics, key: string, w: number, h: number) {
    const hw = w / 2
    const hh = h / 2
    const r = 26

    const clip = (color: number, top: number, height: number) => {
        g.fillStyle(color, 1)
        g.fillRect(-hw, top, w, height)
    }

    if (key === 'air') {
        g.fillStyle(0x8fd4ff, 1)
        g.fillRoundedRect(-hw, -hh, w, h, r)
        clip(0x74c6fb, -hh + h * 0.34, h * 0.36)
        clip(0x5bb7f7, -hh + h * 0.7, h * 0.3 - 8)
        g.fillStyle(0xffe07a, 1)
        g.fillCircle(hw - 54, -hh + 52, 34)
        g.fillStyle(0xfff0b0, 0.55)
        g.fillCircle(hw - 54, -hh + 52, 48)
        g.fillStyle(C.white, 0.95)
        g.fillEllipse(-hw * 0.5, -hh * 0.42, w * 0.38, h * 0.17)
        g.fillEllipse(-hw * 0.24, -hh * 0.52, w * 0.26, h * 0.14)
        g.fillEllipse(hw * 0.28, hh * 0.06, w * 0.32, h * 0.15)
        g.fillEllipse(hw * 0.5, hh * 0.02, w * 0.2, h * 0.11)
        g.lineStyle(8, C.white, 0.7)
        for (let i = 0; i < 5; i++) {
            const a = Math.PI * 1.14 + i * 0.13
            const b = a + 0.08
            g.beginPath()
            g.arc(0, hh * 0.72, w * 0.4, a, b)
            g.strokePath()
        }
        return
    }

    if (key === 'land') {
        g.fillStyle(0xbfe6ff, 1)
        g.fillRoundedRect(-hw, -hh, w, h, r)
        g.fillStyle(0x7fc96b, 1)
        g.fillRect(-hw, -hh + h * 0.3, w, h * 0.7 - 8)
        g.fillStyle(0x5fae4e, 1)
        g.fillRect(-hw, -hh + h * 0.3, w, 10)
        g.fillStyle(C.ink, 1)
        g.fillTriangle(-hw, hh - 8, hw, hh - 8, w * 0.19, -hh + h * 0.3)
        g.fillTriangle(-hw, hh - 8, w * 0.19, -hh + h * 0.3, -w * 0.19, -hh + h * 0.3)
        g.fillStyle(0x8b96a5, 1)
        g.fillTriangle(-hw + 14, hh - 8, hw - 14, hh - 8, w * 0.16, -hh + h * 0.31)
        g.fillTriangle(-hw + 14, hh - 8, w * 0.16, -hh + h * 0.31, -w * 0.16, -hh + h * 0.31)
        g.fillStyle(C.white, 0.95)
        const dashes = [[0.34, 6, 16], [0.5, 9, 24], [0.7, 13, 34], [0.92, 18, 46]]
        dashes.forEach(([t, dw, dh]) => {
            const y = -hh + h * 0.3 + (h * 0.7 - 8) * (t as number)
            g.fillRoundedRect(-(dw as number) / 2, y - (dh as number) / 2, dw as number, dh as number, 4)
        })
        return
    }

    if (key === 'water') {
        g.fillStyle(0x7fe3ef, 1)
        g.fillRoundedRect(-hw, -hh, w, h, r)
        clip(0x4fd2e4, -hh + h * 0.3, h * 0.34)
        clip(0x2ab8d2, -hh + h * 0.64, h * 0.36 - 8)
        for (let row = 0; row < 4; row++) {
            const y = -hh + h * 0.2 + row * h * 0.2
            g.lineStyle(9, C.white, 0.75)
            g.beginPath()
            g.moveTo(-hw + 18, y)
            for (let i = 0; i < 4; i++) {
                const x = -hw + 18 + ((i + 0.5) * (w - 36)) / 4
                g.lineTo(x, y + (i % 2 === 0 ? -10 : 10))
            }
            g.lineTo(hw - 18, y)
            g.strokePath()
        }
        g.fillStyle(C.white, 0.4)
        g.fillEllipse(hw * 0.44, -hh * 0.56, w * 0.26, h * 0.07)
        return
    }

    if (key === 'rail') {
        g.fillStyle(0xd8b98c, 1)
        g.fillRoundedRect(-hw, -hh, w, h, r)
        g.fillStyle(C.railDeep, 1)
        for (let i = 0; i < 7; i++) {
            const y = -hh + 22 + i * (h - 44) / 6
            g.fillRoundedRect(-hw + 26, y - 8, w - 52, 16, 6)
        }
        g.fillStyle(C.ink, 1)
        g.fillRect(-w * 0.22, -hh + 12, 18, h - 24)
        g.fillRect(w * 0.14, -hh + 12, 18, h - 24)
        g.fillStyle(C.plain, 1)
        g.fillRect(-w * 0.22 + 4, -hh + 12, 10, h - 24)
        g.fillRect(w * 0.14 + 4, -hh + 12, 10, h - 24)
        return
    }

    g.fillStyle(0xd6dce5, 1)
    g.fillRoundedRect(-hw, -hh, w, h, r)
    g.fillStyle(0xc3cbd6, 1)
    for (let i = -5; i < 6; i++) {
        g.fillTriangle(
            i * 62 - 20, -hh, i * 62 + 8, -hh,
            i * 62 - 44 + h, hh - 8,
        )
    }
    g.fillStyle(C.plainDeep, 0.9)
    g.fillCircle(0, -14, 62)
    g.fillStyle(0xd6dce5, 1)
    g.fillCircle(0, -14, 50)
    g.lineStyle(16, C.plainDeep, 0.9)
    g.lineBetween(-38, -52, 38, 24)
}

export function createZones(
    scene: Phaser.Scene,
    zones: TestZone[],
    onTap: (index: number) => void,
) {
    const parts: Phaser.GameObjects.GameObject[] = []
    const count = zones.length
    const w = zoneWidth(count)
    const h = ZONES.h
    const cards: Card[] = []

    zones.forEach((zone, i) => {
        const cx = zoneX(i, count)
        const cy = ZONES.cy
        const key = zoneKey(zone)
        const tone = ZONE_COLOR[key] ?? ZONE_COLOR.none
        const r = 26

        const frame = scene.add.graphics().setDepth(DEPTH.zone)
        frame.fillStyle(C.ink, 0.3)
        frame.fillRoundedRect(cx - w / 2 - 6, cy - h / 2 + 12, w + 12, h + 14, r + 8)
        frame.fillStyle(C.ink, 1)
        frame.fillRoundedRect(cx - w / 2 - 8, cy - h / 2 - 8, w + 16, h + 16, r + 8)
        parts.push(frame)

        const art = scene.add.graphics().setDepth(DEPTH.zoneArt).setPosition(cx, cy)
        paintScene(art, key, w, h)
        parts.push(art)

        const ribbon = scene.add.graphics().setDepth(DEPTH.zoneFace)
        ribbon.fillStyle(C.ink, 1)
        ribbon.fillRoundedRect(cx - w / 2 + 10, cy + h / 2 - 62, w - 20, 50, 20)
        ribbon.fillStyle(tone.dark, 1)
        ribbon.fillRoundedRect(cx - w / 2 + 15, cy + h / 2 - 57, w - 30, 40, 16)
        ribbon.fillStyle(tone.main, 1)
        ribbon.fillRoundedRect(cx - w / 2 + 15, cy + h / 2 - 57, w - 30, 33, 16)
        parts.push(ribbon)

        const label = scene.add.text(cx, cy + h / 2 - 39, zoneName(zone), {
            fontFamily: FONT.black, fontSize: '26px', color: CSS.white,
        }).setOrigin(0.5).setResolution(2).setDepth(DEPTH.zoneFace + 1)
        label.setStroke(CSS.ink, 6)
        parts.push(label)

        const badge = scene.add.container(cx - w / 2 + 44, cy - h / 2 + 44)
            .setDepth(DEPTH.zoneFace + 1)
        const badgeG = scene.add.graphics()
        badgeG.fillStyle(C.ink, 1)
        badgeG.fillCircle(0, 0, 34)
        badgeG.fillStyle(C.creamDeep, 1)
        badgeG.fillCircle(0, 0, 29)
        badgeG.fillStyle(C.cream, 1)
        badgeG.fillCircle(0, -3, 26)
        badge.add(badgeG)
        const mark = scene.add.graphics()
        if (zone.kind === 'medium') drawAttribute(mark, zone.medium, 40)
        else drawAttribute(mark, zone.kind === 'motor' ? 'motor' : 'wheels', 40)
        badge.add(mark)
        parts.push(badge)

        const ring = scene.add.graphics().setDepth(DEPTH.zoneFace + 2).setAlpha(0)
        ring.lineStyle(11, C.ok, 1)
        ring.strokeRoundedRect(cx - w / 2 - 4, cy - h / 2 - 4, w + 8, h + 8, r + 4)
        parts.push(ring)

        const lock = scene.add.container(cx, cy).setDepth(DEPTH.lock).setAlpha(0)
        const lockBack = scene.add.graphics()
        lockBack.fillStyle(C.ink, 0.5)
        lockBack.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        lock.add(lockBack)
        const lockArt = scene.add.graphics()
        drawLock(lockArt, 96)
        lock.add(lockArt)
        parts.push(lock)

        const hit = scene.add.zone(cx, cy, w + 14, h + 14)
            .setOrigin(0.5)
            .setDepth(DEPTH.zoneFace + 4)
        hit.on('pointerdown', () => onTap(i))
        parts.push(hit)

        cards.push({ cx, cy, w, h, ring, lock, hit })
    })

    let phase = 0
    let armed = false

    const ticker = scene.time.addEvent({
        delay: 40,
        loop: true,
        callback: () => {
            if (!armed) return
            phase += 0.15
            const a = 0.45 + Math.sin(phase) * 0.35
            cards.forEach(card => card.ring.setAlpha(a))
        },
    })

    return {
        centerOf: (i: number): Point => ({ x: cards[i]?.cx ?? 0, y: cards[i]?.cy ?? 0 }),

        sizeOf: (i: number) => ({ w: cards[i]?.w ?? w, h: cards[i]?.h ?? h }),

        arm(on: boolean) {
            armed = on
            if (!on) cards.forEach(card => card.ring.setAlpha(0))
        },

        setEnabled(on: boolean) {
            cards.forEach(card => {
                if (on) card.hit.setInteractive({ useHandCursor: true })
                else card.hit.disableInteractive()
            })
        },

        press(i: number) {
            const card = cards[i]
            if (!card) return
            void FX.ping(scene, card.cx, card.cy, C.white, { radius: 96, duration: 420, depth: DEPTH.fx })
        },

        async deny(i: number) {
            const card = cards[i]
            if (!card) return
            card.lock.setAlpha(0).setScale(1.4)
            await Promise.race([
                FX.to(scene, fx(card.lock), { alpha: 1, scale: 1 },
                    { duration: 240, ease: Ease.back(2.4) }),
                pause(scene, 520),
            ])
        },

        async release(i: number) {
            const card = cards[i]
            if (!card) return
            await Promise.race([
                FX.to(scene, fx(card.lock), { alpha: 0 }, { duration: 220 }),
                pause(scene, 460),
            ])
            card.lock.setAlpha(0)
        },

        nudge(i: number) {
            const card = cards[i]
            if (!card) return
            void FX.ping(scene, card.cx, card.cy, C.warn,
                { radius: 160, duration: 700, depth: DEPTH.fx })
            card.ring.setAlpha(1)
            void FX.to(scene, fx(card.ring), { alpha: 0.2 },
                { duration: 260, yoyo: true, repeat: 3 })
        },

        destroy() {
            ticker.remove()
            cards.forEach(card => {
                FX.kill(scene, fx(card.lock))
                FX.kill(scene, fx(card.ring))
            })
            parts.forEach(part => part.destroy())
        },
    }
}
