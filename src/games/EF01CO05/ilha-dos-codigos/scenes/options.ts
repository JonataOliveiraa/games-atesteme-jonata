import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    DEPTH,
    OPTION,
    optionPitch,
    optionTile,
    optionWidth,
    optionX,
} from '../data/layout'
import { C } from '../data/theme'
import { createStrip, type Tile } from './symbols'
import type { Code, Word } from '../types'

const BADGE_R = 26
const rad = Phaser.Math.DegToRad

interface Card {
    index: number
    w: number
    root: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Graphics
    tiles: Tile[]
    zone: Phaser.GameObjects.Zone
    badge: Phaser.GameObjects.Graphics | null
    badgeZone: Phaser.GameObjects.Zone | null
    dead: boolean
}

function paintCard(
    g: Phaser.GameObjects.Graphics,
    w: number,
    fill: number,
    border: number,
    width: number,
) {
    const h = OPTION.h
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillRoundedRect(-w / 2, -h / 2 + 10, w, h, 34)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 34)
    g.fillStyle(C.white, 0.7)
    g.fillRoundedRect(-w / 2 + 14, -h / 2 + 9, w - 28, 18, 9)
    g.fillStyle(C.creamEdge, 0.3)
    g.fillRoundedRect(-w / 2 + 14, h / 2 - 26, w - 28, 14, 7)
    g.lineStyle(width, border, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 34)
}

function paintBadge(g: Phaser.GameObjects.Graphics) {
    const r = BADGE_R
    g.clear()
    g.fillStyle(C.ink, 0.22)
    g.fillCircle(2, 4, r)
    g.fillStyle(C.cyan, 1)
    g.fillCircle(0, 0, r)
    g.lineStyle(4, C.cyanDark, 1)
    g.strokeCircle(0, 0, r)

    const s = r * 0.5
    g.fillStyle(C.white, 1)
    g.fillPoints([
        [-0.8, -0.3], [-0.36, -0.3], [0.04, -0.76], [0.04, 0.76], [-0.36, 0.3], [-0.8, 0.3],
    ].map(([x, y]) => new Phaser.Math.Vector2(x * s, y * s)), true)
    g.lineStyle(Math.max(3, s * 0.26), C.white, 1)
    ;[0.52, 0.9].forEach(k => {
        g.beginPath()
        g.arc(s * 0.1, 0, k * s, rad(-52), rad(52), false)
        g.strokePath()
    })
}

export function createOptions(
    scene: Phaser.Scene,
    handlers: { onPick: (index: number) => void; onPreview: (index: number) => void },
) {
    let cards: Card[] = []
    let enabled = false
    let pulsing: Phaser.Tweens.Tween | null = null
    let idle: Phaser.Time.TimerEvent | null = null

    const stopIdle = () => {
        idle?.remove()
        idle = null
    }

    const startIdle = () => {
        stopIdle()
        idle = scene.time.addEvent({
            delay: FX.ms(scene, 6500),
            loop: true,
            callback: () => {
                if (!enabled || pulsing) return
                cards.filter(card => !card.dead).forEach((card, i) => {
                    scene.time.delayedCall(FX.ms(scene, i * 140), () => {
                        if (!enabled || pulsing || card.dead) return
                        FX.popIn(scene, card.root, { from: 1.08, duration: 320 })
                    })
                })
            },
        })
    }

    const clear = () => {
        stopIdle()
        pulsing?.remove()
        pulsing = null
        cards.forEach(card => {
            card.tiles.forEach(tile => tile.destroy())
            card.zone.destroy()
            card.badge?.destroy()
            card.badgeZone?.destroy()
            card.root.destroy()
        })
        cards = []
    }

    return {
        show(list: Word[][], code: Code, withPreview: boolean) {
            clear()
            const n = list[0]?.length ?? 3
            const w = optionWidth(n)

            cards = list.map((words, index) => {
                const x = optionX(index, n)
                const root = scene.add.container(x, OPTION.cy).setDepth(DEPTH.card)
                const bg = scene.add.graphics()
                paintCard(bg, w, C.cream, C.warnDark, 7)
                root.add(bg)

                const strip = createStrip(scene, words, code, optionTile(n), optionPitch(n))
                root.add(strip.container)

                const zone = scene.add.zone(x, OPTION.cy, w, OPTION.h)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.card)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (!enabled || cards[index]?.dead) return
                    startIdle()
                    FX.press(scene, root)
                    handlers.onPick(index)
                })

                let badge: Phaser.GameObjects.Graphics | null = null
                let badgeZone: Phaser.GameObjects.Zone | null = null
                if (withPreview) {
                    const bx = x + w / 2 - BADGE_R - 6
                    const by = OPTION.cy - OPTION.h / 2 - 2
                    badge = scene.add.graphics().setPosition(bx, by).setDepth(DEPTH.glyph)
                    paintBadge(badge)
                    badgeZone = scene.add.zone(bx, by, BADGE_R * 2.3, BADGE_R * 2.3)
                        .setOrigin(0.5)
                        .setDepth(DEPTH.glyph)
                        .setInteractive({ useHandCursor: true })
                    badgeZone.on('pointerdown', () => {
                        if (!enabled || cards[index]?.dead) return
                        startIdle()
                        FX.press(scene, badge as Phaser.GameObjects.Graphics)
                        handlers.onPreview(index)
                    })
                }

                FX.popIn(scene, root, { delay: index * 110, from: 0.7, duration: 320 })

                return {
                    index, w, root, bg, tiles: strip.tiles, zone, badge, badgeZone, dead: false,
                }
            })
        },

        stopHint() {
            if (!pulsing) return
            const target = pulsing.targets[0] as Phaser.GameObjects.Container
            pulsing.remove()
            pulsing = null
            target.setScale(1)
            cards.forEach(card => {
                if (!card.dead) paintCard(card.bg, card.w, C.cream, C.warnDark, 7)
            })
        },

        hint(index: number) {
            this.stopHint()
            const card = cards[index]
            if (!card) return
            paintCard(card.bg, card.w, C.white, C.warn, 10)
            pulsing = scene.tweens.add({
                targets: card.root,
                scale: 1.06,
                duration: FX.ms(scene, 520),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        reject(index: number) {
            const card = cards[index]
            if (!card) return
            card.dead = true
            paintCard(card.bg, card.w, C.creamDeep, C.bad, 9)
            card.tiles.forEach(tile => tile.setTone('wrong'))
            FX.shake(scene, card.root, { amount: 12, times: 3 })
            scene.tweens.add({
                targets: card.root,
                alpha: 0.32,
                scale: 0.94,
                delay: FX.ms(scene, 240),
                duration: FX.ms(scene, 320),
                ease: 'Cubic.easeOut',
            })
            if (card.badge) {
                scene.tweens.add({
                    targets: card.badge,
                    alpha: 0.3,
                    duration: FX.ms(scene, 320),
                })
            }
        },

        accept(index: number) {
            this.stopHint()
            const card = cards[index]
            if (!card) return
            paintCard(card.bg, card.w, C.cream, C.ok, 10)
            card.tiles.forEach(tile => tile.setTone('ok'))
            FX.popIn(scene, card.root, { from: 1.14, duration: 320 })
            cards.forEach(other => {
                if (other.index === index) return
                scene.tweens.add({
                    targets: [other.root, other.badge].filter(Boolean),
                    alpha: 0,
                    duration: FX.ms(scene, 280),
                })
            })
        },

        point(index: number) {
            const card = cards[index]
            return { x: card?.root.x ?? OPTION.cx, y: card?.root.y ?? OPTION.cy }
        },

        setEnabled(value: boolean) {
            enabled = value
            if (value) startIdle()
            else stopIdle()
        },

        clear,

        destroy() {
            clear()
        },
    }
}
