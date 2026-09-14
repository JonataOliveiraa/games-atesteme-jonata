import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { LIA_ART, LIA_FRAME, SHEET } from '../data/devices'
import { DEPTH, LIA, REQUEST } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Medium } from '../types'
import { paintFlower } from './icons'

export function createLia(scene: Phaser.Scene) {
    const hasArt = scene.textures.exists(SHEET.lia.key)
    const scale = LIA.h / (LIA_ART.feet - 7)
    const root = scene.add.container(LIA.x, LIA.feetY).setDepth(DEPTH.lia)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.2)
    shadow.fillEllipse(0, 0, 170, 26)
    root.add(shadow)

    let sprite: Phaser.GameObjects.Image | null = null
    if (hasArt) {
        sprite = scene.add
            .image(0, 0, SHEET.lia.key, LIA_FRAME.idle)
            .setOrigin(0.5, LIA_ART.feet / 550)
            .setScale(scale)
        root.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(0x3b5ba5, 1)
        g.fillRoundedRect(-55, -LIA.h * 0.62, 110, LIA.h * 0.62, 30)
        g.fillStyle(0xf2c9a0, 1)
        g.fillCircle(0, -LIA.h * 0.78, LIA.h * 0.16)
        root.add(g)
    }

    const local = (p: { x: number; y: number }) => ({
        x: LIA.x + (p.x - 200) * scale,
        y: LIA.feetY - (LIA_ART.feet - p.y) * scale,
    })

    const card = scene.add.graphics().setDepth(DEPTH.lia + 1).setVisible(false)
    const cardAt = local(LIA_ART.card)
    paintFlower(card, 0, 0, 60)
    card.setPosition(cardAt.x, cardAt.y + 4)

    const balloon = scene.add.container(REQUEST.x, REQUEST.y).setDepth(DEPTH.balloon).setAlpha(0)
    const balloonG = scene.add.graphics()
    const request = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: REQUEST.w - 70 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    balloon.add([balloonG, request])

    const tailPoints = (h: number, grow: number, dx = 0, dy = 0) => {
        const { from, to, tipX, tipY } = REQUEST.tail
        const base = h / 2 - 10
        const left = new Phaser.Math.Vector2(from - REQUEST.x - grow, base)
        const right = new Phaser.Math.Vector2(to - REQUEST.x + grow, base)
        const tip = new Phaser.Math.Vector2(tipX - REQUEST.x - grow * 0.6, tipY - REQUEST.y + grow * 0.9)
        const down = new Phaser.Curves.QuadraticBezier(
            left,
            new Phaser.Math.Vector2(left.x - 4 - grow, h / 2 + 22),
            tip,
        )
        const up = new Phaser.Curves.QuadraticBezier(
            tip,
            new Phaser.Math.Vector2(right.x - 30, h / 2 + 30 + grow),
            right,
        )
        return [...down.getPoints(14), ...up.getPoints(14)].map(p => new Phaser.Math.Vector2(p.x + dx, p.y + dy))
    }

    const paintBalloon = () => {
        const w = REQUEST.w
        const h = Math.max(REQUEST.h, request.height + 30)
        const r = h / 2
        balloonG.clear()

        balloonG.fillStyle(C.ink, 0.16)
        balloonG.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, r)
        balloonG.fillPoints(tailPoints(h, 0, 5, 8), true)

        balloonG.fillStyle(C.ink, 1)
        balloonG.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, r + 5)
        balloonG.fillPoints(tailPoints(h, 5), true)

        balloonG.fillStyle(C.white, 1)
        balloonG.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        balloonG.fillPoints(tailPoints(h, 0), true)

        const stripX = REQUEST.tail.to - REQUEST.x + 26
        balloonG.fillStyle(C.plastic, 1)
        balloonG.fillRoundedRect(stripX, h / 2 - 12, w / 2 - r * 0.7 - stripX, 6, 3)
    }

    const setFrame = (frame: number) => {
        sprite?.setFrame(frame)
        card.setVisible(frame === LIA_FRAME.showing)
    }

    return {
        async say(text: string) {
            request.setText(text)
            paintBalloon()
            scene.tweens.killTweensOf(balloon)
            balloon.setAlpha(0).setScale(0.92)
            await FX.to(scene, balloon, { alpha: 1, scale: 1 }, { duration: 280, ease: 'Back.easeOut' })
        },

        async hush() {
            scene.tweens.killTweensOf(balloon)
            await FX.to(scene, balloon, { alpha: 0 }, { duration: 180 })
        },

        present(source: Medium) {
            setFrame(source === 'image' ? LIA_FRAME.showing : LIA_FRAME.speaking)
        },

        idle() {
            setFrame(LIA_FRAME.idle)
        },

        async cheer() {
            setFrame(LIA_FRAME.cheer)
            await FX.to(scene, root, { y: LIA.feetY - 22 }, { duration: 170, yoyo: true, ease: 'Sine.easeOut' })
            root.setY(LIA.feetY)
        },

        sourcePos(source: Medium) {
            return source === 'image' ? { x: cardAt.x, y: cardAt.y } : local(LIA_ART.mouth)
        },

        requestBounds() {
            return { x: REQUEST.x, y: REQUEST.y, w: REQUEST.w + 30, h: REQUEST.h + 40 }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(balloon)
            root.destroy(true)
            card.destroy()
            balloon.destroy(true)
        },
    }
}

export type Lia = ReturnType<typeof createLia>
