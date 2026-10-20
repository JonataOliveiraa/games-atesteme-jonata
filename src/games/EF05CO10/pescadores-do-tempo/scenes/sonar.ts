import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FISH_FRAME, FISH_SHEET, cellKey } from '../data/files'
import { DEPTH, H, SONAR, W, WATER } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { TIMING } from '../data/timing'
import type { FishKind, Rect, Vec } from '../types'

export interface Blip {
    kind: FishKind
    at: Vec
}

export interface Sonar {
    readonly open: boolean
    show(blips: Blip[], missing: FishKind | null): Promise<void>
    pickable(on: boolean): void
    posOf(kind: FishKind): Vec | null
    nope(kind: FishKind): void
    rect(): Rect
    hide(): Promise<void>
    destroy(): void
}

const FRAME: Record<FishKind, number> = { small: FISH_FRAME.small, big: FISH_FRAME.big, school: FISH_FRAME.school }
const SIZE: Record<FishKind, number> = { small: 0.42, big: 0.5, school: 0.5 }

export function createSonar(scene: Phaser.Scene, tail: Vec, onPick: (kind: FishKind) => void): Sonar {
    const { w, h, pad } = SONAR
    const sw = w - pad * 2
    const sh = h - pad * 2
    const frame = scene.add.graphics()
    frame.fillStyle(C.shadow, 0.25)
    frame.fillRoundedRect(-w / 2 + 6, -h / 2 + 8, w, h, 26)
    frame.fillStyle(C.phone, 1)
    frame.fillTriangle(-w / 2 + 30, h / 2 - 30, -w / 2 + 80, h / 2 - 4, tail.x - SONAR.x, tail.y - SONAR.y)
    frame.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
    frame.fillStyle(C.sonarBg, 1)
    frame.fillRoundedRect(-sw / 2, -sh / 2, sw, sh, 14)
    frame.lineStyle(2, C.sonarGrid, 1)
    for (let k = 1; k < 4; k++) frame.lineBetween(-sw / 2 + 8, -sh / 2 + (k * sh) / 4, sw / 2 - 8, -sh / 2 + (k * sh) / 4)
    frame.lineStyle(3, C.screen, 0.7)
    frame.lineBetween(-sw / 2 + 6, -sh / 2 + 10, sw / 2 - 6, -sh / 2 + 10)

    const sweep = scene.add.rectangle(-sw / 2, 0, 6, sh - 8, C.blip, 0.7)
    const marks = scene.add.container(0, 0)
    const ask = scene.add
        .text(0, 0, '?', { fontFamily: FONT.black, fontSize: '64px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
        .setStroke('#0f2a3a', 8)
        .setVisible(false)
    const box = scene.add.container(SONAR.x, SONAR.y, [frame, marks, sweep, ask]).setDepth(DEPTH.sonar).setVisible(false)

    const toScreen = (at: Vec) => ({
        x: Phaser.Math.Clamp(-sw / 2 + 24 + ((at.x - WATER.left) / (W - WATER.left)) * (sw - 48), -sw / 2 + 24, sw / 2 - 24),
        y: Phaser.Math.Clamp(-sh / 2 + 22 + ((at.y - WATER.y) / (H - WATER.y)) * (sh - 40), -sh / 2 + 22, sh / 2 - 18),
    })

    const icons = new Map<FishKind, Phaser.GameObjects.Image>()
    let zones: Phaser.GameObjects.Zone[] = []
    let isOpen = false
    let canPick = false

    const clear = () => {
        zones.forEach(z => z.destroy())
        zones = []
        icons.clear()
        marks.removeAll(true)
        ask.setVisible(false)
    }

    return {
        get open() {
            return isOpen
        },
        async show(blips, missing) {
            clear()
            isOpen = true
            canPick = false
            box.setVisible(true).setScale(0.6).setAlpha(0)
            await FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 280, ease: 'Back.easeOut' })
            sweep.setX(-sw / 2 + 4).setVisible(true)
            const shown = new Set<number>()
            const k = { t: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: TIMING.scan,
                    onUpdate: () => {
                        const x = -sw / 2 + 4 + k.t * (sw - 8)
                        sweep.setX(x)
                        blips.forEach((b, i) => {
                            if (shown.has(i) || icons.has(b.kind)) return
                            const p = toScreen(b.at)
                            if (p.x > x) return
                            shown.add(i)
                            const icon = scene.add.image(p.x, p.y, FISH_SHEET.key, cellKey(FRAME[b.kind])).setScale(SIZE[b.kind]).setTint(C.blip)
                            marks.add(icon)
                            icons.set(b.kind, icon)
                            void FX.popIn(scene, icon, { from: 0.2, duration: 220 })
                            const zone = scene.add
                                .zone(box.x + p.x, box.y + p.y, Math.max(84, icon.displayWidth + 30), 72)
                                .setDepth(DEPTH.sonar + 1)
                                .setInteractive({ useHandCursor: true })
                            zone.on('pointerdown', () => canPick && onPick(b.kind))
                            zones.push(zone)
                        })
                    },
                    onComplete: () => resolve(),
                    onStop: () => resolve(),
                })
            })
            sweep.setVisible(false)
            if (missing) {
                const p = toScreen({ x: 900, y: missing === 'big' ? 650 : 520 })
                ask.setPosition(p.x, p.y).setVisible(true)
                void FX.popIn(scene, ask, { from: 0.4, duration: 300 })
                await FX.wait(scene, 400)
            }
        },
        pickable(on) {
            canPick = on
        },
        posOf(kind) {
            const icon = icons.get(kind)
            return icon ? { x: box.x + icon.x, y: box.y + icon.y } : null
        },
        nope(kind) {
            const icon = icons.get(kind)
            if (icon) void FX.shake(scene, icon, { amount: 6 })
        },
        rect: () => ({ x: SONAR.x - w / 2 - 10, y: SONAR.y - h / 2 - 10, w: w + 20, h: h + 20 }),
        async hide() {
            canPick = false
            if (!isOpen) return
            isOpen = false
            zones.forEach(z => z.destroy())
            zones = []
            await FX.to(scene, box, { scale: 0.7, alpha: 0 }, { duration: 220 })
            box.setVisible(false)
            clear()
        },
        destroy() {
            clear()
            box.destroy()
        },
    }
}
