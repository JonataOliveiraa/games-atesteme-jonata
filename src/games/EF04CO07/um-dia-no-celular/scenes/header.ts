import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HEADER, ORDER, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { T } from '../data/timing'
import type { Rect, Sender } from '../types'
import { paintAvatar, paintImage } from './art'

export interface Header {
    setOrder(sender: Sender, line: string): Promise<void>
    clearOrder(): void
    orderRect(): Rect
    setShown(on: boolean): void
    destroy(): void
}

export function createHeader(scene: Phaser.Scene): Header {
    const g = paintImage(scene, W, HEADER.h + 10, p => {
        p.fillStyle(C.shadow, 0.14)
        p.fillRect(0, HEADER.h + 2, W, 8)
        p.fillStyle(C.headerFace, 1)
        p.fillRect(0, 0, W, HEADER.h)
        p.fillStyle(C.headerRim, 1)
        p.fillRect(0, HEADER.h - 6, W, 6)
        p.fillStyle(C.headerLine, 0.5)
        p.fillRect(0, HEADER.h, W, 2)
        ;[HEADER.left, HEADER.right].forEach(x => {
            p.fillStyle(C.headerRim, 1)
            p.fillRoundedRect(x - 1.5, 16, 3, HEADER.h - 36, 1.5)
        })
    })

    const avatarRing = scene.add.graphics()
    const avatar = scene.add.image(0, 0, '__WHITE').setVisible(false)
    const line = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const quote = scene.add.container(ORDER.x, ORDER.y, [avatarRing, avatar, line]).setAlpha(0)
    const bar = scene.add.container(0, 0, [g, quote]).setDepth(DEPTH.header)
    let width = 0

    const place = () => {
        const size = ORDER.avatar
        width = size + ORDER.gap + line.width
        const left = -width / 2
        avatarRing.clear()
        avatarRing.fillStyle(C.white, 1)
        avatarRing.fillCircle(left + size / 2, 0, size / 2 + 3)
        avatarRing.lineStyle(3, C.headerLine, 0.6)
        avatarRing.strokeCircle(left + size / 2, 0, size / 2 + 3)
        avatar.setPosition(left + size / 2, 0)
        line.setPosition(left + size + ORDER.gap, 1)
    }

    return {
        async setOrder(sender, value) {
            scene.tweens.killTweensOf(quote)
            if (quote.alpha > 0) await FX.to(scene, quote, { alpha: 0, y: ORDER.y - 8 }, { duration: 140 })
            avatar.setTexture(paintAvatar(scene, sender)).setDisplaySize(ORDER.avatar, ORDER.avatar).setVisible(true)
            line.setText(`“${value}”`)
            place()
            quote.setY(ORDER.y + 10)
            await FX.to(scene, quote, { alpha: 1, y: ORDER.y }, { duration: 260, ease: 'Back.easeOut' })
        },
        clearOrder() {
            scene.tweens.killTweensOf(quote)
            void FX.to(scene, quote, { alpha: 0 }, { duration: 160 })
        },
        orderRect: () => ({ x: ORDER.x, y: ORDER.y, w: Math.max(200, width + 30), h: HEADER.h - 8 }),
        setShown(on) {
            if (!bar.active) return
            scene.tweens.killTweensOf(bar)
            void FX.to(scene, bar, { y: on ? 0 : -(HEADER.h + 16), alpha: on ? 1 : 0 }, { duration: T.short, ease: on ? 'Back.easeOut' : 'Sine.easeIn' })
        },
        destroy() {
            bar.destroy()
        },
    }
}
