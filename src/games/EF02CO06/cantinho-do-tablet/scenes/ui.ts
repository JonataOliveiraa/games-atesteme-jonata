import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { OBJ, OBJECTS } from '../data/files'
import { BALLOON, BOARD, DEPTH, H, PLAY, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { BOARD_TITLE, PLAY as PLAY_LABEL } from '../data/words'
import type { Rect, Vec } from '../types'

const SEAL_BIG = 0.46
const REST = 0.62
const LABEL_DY = 96
const HOLD_MS = 800
const BOARD_SEAL = 0.19

export interface PlayButton {
    rect(): Rect
    setEnabled(on: boolean): void
    show(on: boolean): Promise<void>
    destroy(): void
}

export function createPlayButton(scene: Phaser.Scene, onPress: () => void): PlayButton {
    const art = scene.add.graphics()
    const paint = (on: boolean) => {
        art.clear()
        const tone = on ? C.mint : C.creamDark
        art.fillStyle(C.shadow, 0.2)
        art.fillRoundedRect(-PLAY.w / 2 + 3, -PLAY.h / 2 + 7, PLAY.w, PLAY.h, PLAY.h / 2)
        art.fillStyle(tone, 1)
        art.fillRoundedRect(-PLAY.w / 2, -PLAY.h / 2, PLAY.w, PLAY.h, PLAY.h / 2)
        art.fillStyle(C.white, 0.35)
        art.fillRoundedRect(-PLAY.w / 2 + 16, -PLAY.h / 2 + 8, PLAY.w - 32, 20, 10)
        art.lineStyle(5, C.ink, 1)
        art.strokeRoundedRect(-PLAY.w / 2, -PLAY.h / 2, PLAY.w, PLAY.h, PLAY.h / 2)
        art.fillStyle(C.white, 1)
        art.lineStyle(4, C.ink, 1)
        const cx = -PLAY.w / 2 + 52
        art.fillCircle(cx, 0, 26)
        art.strokeCircle(cx, 0, 26)
        art.fillStyle(on ? C.mintDark : C.inkSoft, 1)
        art.fillTriangle(cx - 8, -13, cx - 8, 13, cx + 14, 0)
    }
    const label = scene.add
        .text(30, 2, PLAY_LABEL, { fontFamily: FONT.black, fontSize: `${SIZE.play}px`, color: inkOn(C.mint) })
        .setOrigin(0.5)
        .setResolution(2)
    const box = scene.add.container(PLAY.x, PLAY.y, [art, label]).setDepth(DEPTH.play)
    const zone = scene.add
        .zone(PLAY.x, PLAY.y, PLAY.w + 20, PLAY.h + 20)
        .setDepth(DEPTH.play + 1)
        .setInteractive({ useHandCursor: true })
    let on = false
    let breath: Phaser.Tweens.Tween | undefined
    zone.on('pointerdown', () => {
        if (!on) return
        void FX.press(scene, box)
        onPress()
    })
    paint(false)

    return {
        rect: () => ({ x: PLAY.x, y: PLAY.y, w: PLAY.w, h: PLAY.h }),
        setEnabled(value) {
            on = value
            if (zone.input) zone.input.enabled = value
            paint(value)
            breath?.stop()
            box.setScale(1)
            if (value) breath = scene.tweens.add({ targets: box, scale: 1.04, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        show(value) {
            return FX.to(scene, box, { alpha: value ? 1 : 0 }, { duration: 260 })
        },
        destroy() {
            breath?.stop()
            zone.destroy()
            box.destroy()
        },
    }
}

export interface Balloon {
    say(at: Vec, text: string, tone?: 'ok' | 'oops'): Promise<void>
    hide(): void
    destroy(): void
}

export function createBalloon(scene: Phaser.Scene): Balloon {
    let box: Phaser.GameObjects.Container | undefined
    const hide = () => {
        if (!box) return
        scene.tweens.killTweensOf(box)
        box.destroy()
        box = undefined
    }
    return {
        say(at, text, tone = 'ok') {
            hide()
            const color = tone === 'oops' ? CSS.coralDark : CSS.ink
            const label = scene.add
                .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.balloon}px`, color })
                .setOrigin(0.5)
                .setResolution(2)
            const w = Math.max(BALLOON.minW, label.width + 48)
            const h = BALLOON.h
            const bg = scene.add.graphics()
            bg.fillStyle(C.shadow, 0.16)
            bg.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
            bg.fillStyle(C.white, 1)
            bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            bg.fillTriangle(-14, h / 2 - 2, 14, h / 2 - 2, 0, h / 2 + 20)
            bg.lineStyle(4, tone === 'oops' ? C.coralDark : C.ink, 1)
            bg.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            const x = Phaser.Math.Clamp(at.x, w / 2 + 14, W - w / 2 - 14)
            const y = Phaser.Math.Clamp(at.y, h / 2 + 100, H - h / 2 - 30)
            box = scene.add.container(x, y, [bg, label]).setDepth(DEPTH.balloon).setScale(0.7).setAlpha(0)
            return FX.to(scene, box, { alpha: 1, scale: 1 }, { duration: 240, ease: Ease.back(1.8) })
        },
        hide,
        destroy: hide,
    }
}

export interface Seals {
    add(at: Vec, text: string): Promise<void>
    clear(): Promise<void>
    destroy(): void
}

export function createSeals(scene: Phaser.Scene): Seals {
    let list: Phaser.GameObjects.Container[] = []
    return {
        async add(at, text) {
            const cam = scene.cameras.main
            const view = cam.worldView
            const veil = scene.add.rectangle(view.centerX, view.centerY, view.width + 40, view.height + 40, C.shadow, 0).setDepth(DEPTH.seals - 2)
            const rays = scene.add.graphics()
            for (let k = 0; k < 12; k++) {
                const a0 = (k / 12) * Math.PI * 2
                rays.fillStyle(k % 2 ? C.glow : C.white, 0.75)
                rays.slice(0, 0, 150, a0, a0 + Math.PI / 12, false)
                rays.fillPath()
            }
            rays.setAlpha(0)
            const badge = scene.add.image(0, 0, OBJECTS, OBJ.seal).setScale(SEAL_BIG)
            const label = scene.add
                .text(0, LABEL_DY, text, { fontFamily: FONT.black, fontSize: `${SIZE.sealBig}px`, color: CSS.mintDark })
                .setOrigin(0.5)
                .setResolution(2)
            const pill = scene.add.graphics()
            const w = label.width + 40
            const h = SIZE.sealBig + 26
            pill.fillStyle(C.shadow, 0.2)
            pill.fillRoundedRect(-w / 2 + 3, LABEL_DY - h / 2 + 6, w, h, h / 2)
            pill.fillStyle(C.white, 1)
            pill.fillRoundedRect(-w / 2, LABEL_DY - h / 2, w, h, h / 2)
            pill.lineStyle(5, C.mintDark, 1)
            pill.strokeRoundedRect(-w / 2, LABEL_DY - h / 2, w, h, h / 2)
            const half = (w / 2) * REST + 10
            const x = Phaser.Math.Clamp(at.x, view.x + w / 2 + 16, view.right - w / 2 - 16)
            const y = Phaser.Math.Clamp(at.y, view.y + 110, view.bottom - LABEL_DY - h)
            const box = scene.add.container(x, y, [rays, pill, label, badge]).setDepth(DEPTH.seals).setScale(0.2).setAlpha(0)
            list.push(box)
            const spin = scene.tweens.add({ targets: rays, angle: 360, duration: 4000, repeat: -1 })
            void FX.to(scene, veil, { fillAlpha: 0.5 }, { duration: 220 })
            void FX.to(scene, rays, { alpha: 1 }, { duration: 260 })
            void FX.ping(scene, x, y, C.mint, { radius: 160, duration: 560, depth: DEPTH.seals + 1 })
            void FX.stars(scene, x, y, { color: C.glow, count: 12, rise: 140, duration: 900, depth: DEPTH.seals + 1 })
            await FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: 380, ease: Ease.back(2.2) })
            await FX.wait(scene, HOLD_MS)
            void FX.to(scene, veil, { fillAlpha: 0 }, { duration: 260 }).then(() => veil.destroy())
            await FX.to(scene, rays, { alpha: 0 }, { duration: 200 })
            spin.stop()
            rays.destroy()
            const rx = Phaser.Math.Clamp(at.x, half, W - half)
            await FX.to(scene, box, { scale: REST, x: rx, y: at.y }, { duration: 320, ease: 'Sine.easeInOut' })
        },
        async clear() {
            const old = list
            list = []
            await FX.to(scene, old, { alpha: 0, scale: 0.6 }, { duration: 220 })
            old.forEach(b => b.destroy())
        },
        destroy() {
            list.forEach(b => b.destroy())
            list = []
        },
    }
}

export interface Coach {
    show(hole: Rect, tap: Vec): void
    hide(): void
    destroy(): void
}

export function createCoach(scene: Phaser.Scene): Coach {
    const veil = scene.add.graphics().setDepth(DEPTH.veil)
    const hand = scene.add.graphics().setDepth(DEPTH.hand)
    hand.fillStyle(C.cream, 1)
    hand.lineStyle(4, C.ink, 1)
    hand.fillRoundedRect(-12, -2, 30, 40, 12)
    hand.strokeRoundedRect(-12, -2, 30, 40, 12)
    hand.fillRoundedRect(-8, -40, 14, 44, 7)
    hand.strokeRoundedRect(-8, -40, 14, 44, 7)
    hand.fillRoundedRect(-24, 8, 16, 14, 7)
    hand.strokeRoundedRect(-24, 8, 16, 14, 7)
    hand.setVisible(false)
    let tap: Phaser.Tweens.Tween | undefined
    let ring: Phaser.Time.TimerEvent | undefined

    const hide = () => {
        veil.clear()
        tap?.stop()
        ring?.remove()
        hand.setVisible(false)
    }

    return {
        show(hole, at) {
            hide()
            const l = hole.x - hole.w / 2
            const t = hole.y - hole.h / 2
            veil.fillStyle(C.shadow, 0.5)
            veil.fillRect(0, 0, W, t)
            veil.fillRect(0, t + hole.h, W, H - t - hole.h)
            veil.fillRect(0, t, l, hole.h)
            veil.fillRect(l + hole.w, t, W - l - hole.w, hole.h)
            veil.lineStyle(4, C.glow, 0.9)
            veil.strokeRoundedRect(l, t, hole.w, hole.h, 14)
            hand.setPosition(at.x + 6, at.y + 44).setVisible(true).setAngle(-12)
            tap = scene.tweens.add({ targets: hand, y: at.y + 30, duration: 360, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            ring = scene.time.addEvent({
                delay: 720,
                loop: true,
                callback: () => void FX.ping(scene, at.x, at.y, C.glow, { radius: 46, duration: 480, depth: DEPTH.hand - 1 }),
            })
        },
        hide,
        destroy() {
            hide()
            veil.destroy()
            hand.destroy()
        },
    }
}

export interface Board {
    show(lines: string[]): Promise<void>
    destroy(): void
}

export function createBoard(scene: Phaser.Scene): Board {
    let box: Phaser.GameObjects.Container | undefined
    return {
        async show(lines) {
            const g = scene.add.graphics()
            const { w, h } = BOARD
            g.fillStyle(C.shadow, 0.25)
            g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 26)
            g.fillStyle(C.corkDark, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
            g.fillStyle(C.cork, 1)
            g.fillRoundedRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 18)
            g.lineStyle(5, C.ink, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 26)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(-w / 2 + 40, -h / 2 + 34, w - 80, h - 68, 10)
            g.lineStyle(3, C.ink, 1)
            g.strokeRoundedRect(-w / 2 + 40, -h / 2 + 34, w - 80, h - 68, 10)
            ;[-w / 2 + 58, w / 2 - 58].forEach(x => {
                g.fillStyle(C.coral, 1)
                g.fillCircle(x, -h / 2 + 50, 11)
                g.lineStyle(3, C.ink, 1)
                g.strokeCircle(x, -h / 2 + 50, 11)
            })
            const title = scene.add
                .text(0, -h / 2 + 84, BOARD_TITLE, { fontFamily: FONT.black, fontSize: `${SIZE.board}px`, color: CSS.ink })
                .setOrigin(0.5)
                .setResolution(2)
            const top = -h / 2 + 160
            const rows = lines.flatMap((line, i) => {
                const y = top + i * BOARD.row
                const badge = scene.add.image(-w / 2 + 110, y, OBJECTS, OBJ.seal).setScale(BOARD_SEAL).setAlpha(0)
                const text = scene.add
                    .text(-w / 2 + 160, y + 2, line, { fontFamily: FONT.black, fontSize: `${SIZE.boardLine}px`, color: CSS.ink })
                    .setOrigin(0, 0.5)
                    .setResolution(2)
                    .setAlpha(0)
                return [badge, text]
            })
            box = scene.add.container(BOARD.x, -h, [g, title, ...rows]).setDepth(DEPTH.finale)
            await FX.to(scene, box, { y: BOARD.y }, { duration: 620, ease: Ease.back(1.3) })
            for (let i = 0; i < rows.length; i += 2) {
                const badge = rows[i] as Phaser.GameObjects.Image
                badge.setScale(BOARD_SEAL * 0.4)
                void FX.to(scene, badge, { alpha: 1, scale: BOARD_SEAL }, { duration: 300, ease: Ease.back(2.4) })
                await FX.to(scene, rows[i + 1] as Phaser.GameObjects.Text, { alpha: 1 }, { duration: 260 })
                await FX.wait(scene, 140)
            }
        },
        destroy() {
            box?.destroy()
            box = undefined
        },
    }
}
