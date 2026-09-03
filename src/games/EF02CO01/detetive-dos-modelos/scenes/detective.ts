import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, DETECTIVE } from '../data/layout'
import type { Attribute } from '../types'
import { drawAttribute, drawBan } from './icons'

const fx = (o: unknown) => o as unknown as FxTarget

export type Mood = 'watch' | 'think' | 'smile' | 'cheer'

const FRAME: Record<Mood, number> = { watch: 0, think: 1, smile: 2, cheer: 3 }

const BUBBLE = { x: 476, y: 462, w: 344 }

export function createDetective(scene: Phaser.Scene) {
    const holder = scene.add.container(DETECTIVE.x, DETECTIVE.y).setDepth(DEPTH.detective)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists('detetive')) {
        sprite = scene.add.sprite(0, 0, 'detetive', 0)
        sprite.setDisplaySize(DETECTIVE.size, DETECTIVE.size)
        holder.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillCircle(0, 0, DETECTIVE.size * 0.4)
        g.fillStyle(C.creamDeep, 1)
        g.fillCircle(0, -4, DETECTIVE.size * 0.34)
        g.fillStyle(C.ink, 1)
        g.fillCircle(-DETECTIVE.size * 0.12, -DETECTIVE.size * 0.06, 9)
        g.fillCircle(DETECTIVE.size * 0.12, -DETECTIVE.size * 0.06, 9)
        holder.add(g)
    }

    FX.float(scene, fx(holder), { amount: 7, duration: 2400 })

    const bubble = scene.add.container(BUBBLE.x, BUBBLE.y)
        .setDepth(DEPTH.fx)
        .setAlpha(0)
        .setScale(0.8)
    const skin = scene.add.graphics()
    const text = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: '28px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: BUBBLE.w - 56 },
        lineSpacing: 4,
    }).setOrigin(0.5).setResolution(2)
    const badge = scene.add.container(0, 0)
    bubble.add([skin, text, badge])

    function paint(accent: number, withBadge: boolean) {
        const w = Math.max(240, text.width + 64) + (withBadge ? 84 : 0)
        const h = Math.max(84, text.height + 44)
        skin.clear()
        skin.fillStyle(C.ink, 0.28)
        skin.fillRoundedRect(-w / 2 + 4, -h / 2 + 9, w, h, 26)
        skin.fillStyle(C.ink, 1)
        skin.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
        skin.fillTriangle(-w / 2 + 18, h / 2 - 12, -w / 2 + 62, h / 2 - 12, -w / 2 - 26, h / 2 + 30)
        skin.fillStyle(accent, 1)
        skin.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 20)
        skin.fillStyle(C.cream, 1)
        skin.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 20, 20)
        skin.fillTriangle(-w / 2 + 24, h / 2 - 16, -w / 2 + 56, h / 2 - 16, -w / 2 - 14, h / 2 + 20)
        text.setPosition(withBadge ? 34 : 0, 0)
        badge.setPosition(-w / 2 + 54, 0)
        return { w, h }
    }

    return {
        mood(next: Mood) {
            sprite?.setFrame(FRAME[next])
            void FX.to(scene, fx(holder), { scale: 1.07 },
                { duration: 190, yoyo: true, ease: 'Sine.easeOut' })
        },

        say(line: string, accent = C.warn, attr?: Attribute) {
            badge.removeAll(true)
            text.setText(line)
            if (attr) {
                const ring = scene.add.graphics()
                ring.fillStyle(C.ink, 1)
                ring.fillCircle(0, 0, 34)
                ring.fillStyle(C.white, 1)
                ring.fillCircle(0, -2, 29)
                badge.add(ring)
                const art = scene.add.graphics()
                drawAttribute(art, attr, 44)
                badge.add(art)
                const ban = scene.add.graphics().setPosition(20, 20)
                drawBan(ban, 34)
                badge.add(ban)
            }
            paint(accent, !!attr)
            FX.kill(scene, fx(bubble))
            void FX.to(scene, fx(bubble), { alpha: 1, scale: 1 },
                { duration: 220, ease: Ease.back(2.2) })
        },

        hush() {
            FX.kill(scene, fx(bubble))
            void FX.to(scene, fx(bubble), { alpha: 0, scale: 0.85 }, { duration: 180 })
        },

        destroy() {
            FX.kill(scene, fx(holder))
            FX.kill(scene, fx(bubble))
            badge.removeAll(true)
            bubble.destroy()
            holder.destroy()
        },
    }
}
