import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    CHEST,
    CLUE,
    DEPTH,
    clueTile,
    cluePanelHeight,
    cluePanelWidth,
    clueX,
} from '../data/layout'
import { C } from '../data/theme'
import { createTile, type Tile } from './symbols'
import type { Code, Word } from '../types'

const CHEST_SHEET = 'bau'
const BADGE_R = 30
const rad = Phaser.Math.DegToRad

function paintPadlock(g: Phaser.GameObjects.Graphics, size: number) {
    const w = size
    const h = size * 0.86
    g.clear()
    g.lineStyle(size * 0.2, C.metal, 1)
    g.beginPath()
    g.arc(0, -h * 0.5, w * 0.3, Math.PI, 0, false)
    g.strokePath()
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-w / 2, -h * 0.24, w, h, w * 0.18)
    g.fillStyle(C.warnDark, 1)
    g.fillRoundedRect(-w / 2, -h * 0.3, w, h, w * 0.18)
    g.fillStyle(C.metal, 1)
    g.fillRoundedRect(-w / 2 + 3, -h * 0.3 + 3, w - 6, h - 6, w * 0.15)
    g.fillStyle(C.white, 0.4)
    g.fillRoundedRect(-w / 2 + 7, -h * 0.24, w - 14, h * 0.22, w * 0.1)
    g.fillStyle(C.warnDark, 1)
    g.fillCircle(0, h * 0.08, w * 0.13)
    g.fillTriangle(-w * 0.07, h * 0.08, w * 0.07, h * 0.08, 0, h * 0.4)
}

function paintReplay(g: Phaser.GameObjects.Graphics, r: number) {
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillCircle(2, 5, r)
    g.fillStyle(C.cyan, 1)
    g.fillCircle(0, 0, r)
    g.fillStyle(C.white, 0.5)
    g.fillEllipse(-r * 0.2, -r * 0.36, r * 1.05, r * 0.46)
    g.lineStyle(5, C.cyanDark, 1)
    g.strokeCircle(0, 0, r)

    const s = r * 0.52
    g.fillStyle(C.white, 1)
    g.fillPoints([
        [-0.8, -0.3], [-0.36, -0.3], [0.04, -0.76], [0.04, 0.76], [-0.36, 0.3], [-0.8, 0.3],
    ].map(([x, y]) => new Phaser.Math.Vector2(x * s, y * s)), true)
    g.lineStyle(Math.max(3, s * 0.24), C.white, 1)
    ;[0.5, 0.86].forEach(k => {
        g.beginPath()
        g.arc(s * 0.1, 0, k * s, rad(-52), rad(52), false)
        g.strokePath()
    })
}

export function createClue(scene: Phaser.Scene, onReplay: () => void) {
    const chest = scene.add.sprite(CHEST.x, CHEST.baseY, CHEST_SHEET, 0)
        .setOrigin(0.5, 0.95)
        .setDepth(DEPTH.chest)
    if (scene.textures.exists(CHEST_SHEET)) {
        chest.setDisplaySize(CHEST.w, CHEST.w * (250 / 300))
    } else {
        chest.setVisible(false)
    }

    const shadow = scene.add.ellipse(CHEST.x, CHEST.baseY + 8, CHEST.w * 0.78, 24, C.ink, 0.16)
        .setDepth(DEPTH.chest - 1)

    const glow = scene.add.graphics().setDepth(DEPTH.chest - 1).setAlpha(0)
    glow.fillStyle(C.warn, 0.5)
    glow.fillCircle(CHEST.x, CHEST.baseY - CHEST.w * 0.3, CHEST.w * 0.66)

    const padlock = scene.add.graphics()
        .setPosition(CHEST.x, CHEST.baseY - CHEST.w * 0.3)
        .setDepth(DEPTH.chest + 2)
    paintPadlock(padlock, 54)

    const panel = scene.add.graphics().setDepth(DEPTH.panel)
    const row = scene.add.container(0, CLUE.cy).setDepth(DEPTH.card)

    const badge = scene.add.graphics().setDepth(DEPTH.card + 1).setVisible(false)
    paintReplay(badge, BADGE_R)
    const badgeZone = scene.add.zone(0, 0, BADGE_R * 2.4, BADGE_R * 2.4)
        .setOrigin(0.5)
        .setDepth(DEPTH.card + 1)
        .setVisible(false)
        .setInteractive({ useHandCursor: true })

    let tiles: Tile[] = []
    let enabled = true
    let accent = C.cyanDark

    chest.setInteractive({ useHandCursor: true })
    const replay = () => {
        if (!enabled) return
        FX.press(scene, chest)
        onReplay()
    }
    chest.on('pointerdown', replay)
    badgeZone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, badge)
        onReplay()
    })

    const paintFrame = (n: number, color: number) => {
        const w = cluePanelWidth(n)
        const h = cluePanelHeight(n)
        const x = CLUE.cx - w / 2
        const y = CLUE.cy - h / 2

        panel.clear()
        panel.fillStyle(C.ink, 0.2)
        panel.fillRoundedRect(x, y + 9, w, h, 30)
        panel.fillStyle(C.ink, 0.2)
        panel.fillTriangle(x + 6, CLUE.cy - 22 + 9, x + 6, CLUE.cy + 30 + 9, x - 42, CLUE.cy + 16 + 9)

        panel.fillStyle(C.white, 0.94)
        panel.fillTriangle(x + 6, CLUE.cy - 22, x + 6, CLUE.cy + 30, x - 42, CLUE.cy + 16)
        panel.fillRoundedRect(x, y, w, h, 30)
        panel.fillStyle(C.white, 0.7)
        panel.fillRoundedRect(x + 12, y + 8, w - 24, 16, 8)
        panel.lineStyle(7, color, 1)
        panel.strokeRoundedRect(x, y, w, h, 30)

        badge.setPosition(x + w - 4, y + 4)
        badgeZone.setPosition(x + w - 4, y + 4)
    }

    return {
        show(message: Word[], code: Code, hasSound: boolean) {
            tiles.forEach(tile => tile.destroy())
            row.removeAll(true)
            accent = C.cyanDark
            paintFrame(message.length, accent)

            tiles = message.map((word, i) => {
                const tile = createTile(scene, word, code, clueTile(message.length))
                tile.container.setPosition(clueX(i, message.length), 0)
                row.add(tile.container)
                return tile
            })

            badge.setVisible(hasSound)
            badgeZone.setVisible(hasSound)
            tiles.forEach((tile, i) => FX.popIn(scene, tile.container, { delay: i * 90 }))
        },

        async say(speak: (word: Word) => number) {
            for (let i = 0; i < tiles.length; i++) {
                const tile = tiles[i]
                tile.setTone('hot')
                const ms = speak(tile.word)
                FX.popIn(scene, tile.container, { from: 1.16, duration: 240 })
                await FX.wait(scene, Math.max(380, ms))
                tile.setTone('idle')
                await FX.wait(scene, 110)
            }
        },

        tone(value: 'idle' | 'ok' | 'wrong') {
            accent = value === 'ok' ? C.ok : value === 'wrong' ? C.bad : C.cyanDark
            paintFrame(tiles.length, accent)
            tiles.forEach(tile => tile.setTone(value === 'idle' ? 'idle' : value))
        },

        words() {
            return tiles.map(tile => tile.word)
        },

        chestPoint() {
            return { x: CHEST.x, y: CHEST.baseY - CHEST.w * 0.34 }
        },

        rowPoint() {
            return { x: CLUE.cx, y: CLUE.cy }
        },

        shakeChest() {
            FX.shake(scene, padlock, { amount: 9, times: 3 })
            return FX.shake(scene, chest, { amount: 11, times: 3 })
        },

        flashWrong() {
            paintFrame(tiles.length, C.bad)
            tiles.forEach(tile => FX.popIn(scene, tile.container, {
                from: 1.12, duration: 280,
            }))
            scene.time.delayedCall(FX.ms(scene, 900), () => {
                if (tiles.length) paintFrame(tiles.length, accent)
            })
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        async open() {
            scene.tweens.add({
                targets: padlock,
                y: padlock.y + 90,
                alpha: 0,
                angle: 40,
                duration: FX.ms(scene, 420),
                ease: 'Back.easeIn',
            })
            chest.setFrame(1)
            await FX.wait(scene, 180)
            chest.setFrame(2)
            scene.tweens.add({
                targets: glow,
                alpha: { from: 0.9, to: 0 },
                duration: FX.ms(scene, 900),
                ease: 'Cubic.easeOut',
            })
            await FX.popIn(scene, chest, { from: 1.12, duration: 320 })
        },

        close() {
            chest.setFrame(0)
            glow.setAlpha(0)
            padlock.setAlpha(1).setAngle(0).setPosition(CHEST.x, CHEST.baseY - CHEST.w * 0.3)
        },

        hidePanel() {
            panel.clear()
            row.removeAll(true)
            tiles.forEach(tile => tile.destroy())
            tiles = []
            badge.setVisible(false)
            badgeZone.setVisible(false)
        },

        destroy() {
            tiles.forEach(tile => tile.destroy())
            row.destroy()
            panel.destroy()
            badge.destroy()
            badgeZone.destroy()
            padlock.destroy()
            glow.destroy()
            shadow.destroy()
            chest.destroy()
        },
    }
}
