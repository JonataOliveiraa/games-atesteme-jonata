import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fitInside, originOf, PHOTO_BOX, SHEET } from '../data/art'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

const ORDER = 'Toque no compartilhamento suspeito.'

function paintDot(g: Phaser.GameObjects.Graphics, x: number, done: boolean) {
    const y = HUD.cy
    const r = HUD.dotR
    g.fillStyle(C.ink, done ? 1 : 0.4)
    g.fillCircle(x, y, r + 3)
    g.fillStyle(done ? C.green : C.paperDeep, 1)
    g.fillCircle(x, y, r)
    if (!done) return
    g.lineStyle(4, C.white, 1)
    g.beginPath()
    g.moveTo(x - 6, y)
    g.lineTo(x - 2, y + 5)
    g.lineTo(x + 7, y - 5)
    g.strokePath()
}

export interface HudOptions {
    waves: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.28)
    bar.fillRect(0, HUD.h, W, 9)
    bar.fillStyle(C.blueDeep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.blue, 1)
    bar.fillRect(0, 0, W, HUD.h - 7)
    bar.fillStyle(C.white, 0.14)
    bar.fillRect(0, 0, W, 18)
    bar.fillStyle(C.cyan, 1)
    bar.fillRect(0, HUD.h - 7, W, 4)
    root.add(bar)

    const frame = scene.add.graphics()
    frame.fillStyle(C.ink, 1)
    frame.fillCircle(HUD.avatarX, HUD.cy, HUD.avatarR + 4)
    frame.fillStyle(C.paper, 1)
    frame.fillCircle(HUD.avatarX, HUD.cy, HUD.avatarR)
    root.add(frame)

    if (scene.textures.exists(SHEET.photo)) {
        const photo = scene.add.image(HUD.avatarX, HUD.cy, SHEET.photo)
        const origin = originOf(PHOTO_BOX, 500, 500)
        photo.setOrigin(origin.x, origin.y)
        photo.setScale(fitInside(PHOTO_BOX, HUD.avatarR * 2.1, HUD.avatarR * 2.1))
        const mask = scene.add.graphics().setVisible(false)
        mask.fillStyle(0xffffff, 1)
        mask.fillCircle(HUD.avatarX, HUD.cy, HUD.avatarR)
        photo.setMask(mask.createGeometryMask())
        root.add(photo)
    }

    const chip = scene.add.graphics()
    chip.fillStyle(C.ink, 1)
    chip.fillRoundedRect(HUD.ownerX, HUD.cy - HUD.ownerH / 2, HUD.ownerW, HUD.ownerH, HUD.ownerH / 2)
    chip.fillStyle(C.amber, 1)
    chip.fillRoundedRect(HUD.ownerX + 3, HUD.cy - HUD.ownerH / 2 + 3, HUD.ownerW - 6, HUD.ownerH - 6, HUD.ownerH / 2 - 3)
    root.add(chip)

    const owner = scene.add
        .text(HUD.ownerX + HUD.ownerW / 2 + 8, HUD.cy, 'VOCÊ', {
            fontFamily: FONT.black,
            fontSize: '18px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(owner)

    const dots = scene.add.graphics()
    const dotX = (index: number) => HUD.dotX + index * HUD.dotGap
    const paintDots = (done: number) => {
        dots.clear()
        for (let i = 0; i < options.waves; i++) paintDot(dots, dotX(i), i < done)
    }
    paintDots(0)
    root.add(dots)

    const order = scene.add
        .text(HUD.orderX, HUD.cy, ORDER, {
            fontFamily: FONT.black,
            fontSize: '23px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: HUD.orderW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    order.setStroke(CSS.ink, 5)
    root.add(order)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.26)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.white, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.paperDeep, 1)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    root.add(helpG)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '28px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(helpText)

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        void FX.press(scene, helpG)
        options.onHelp()
    })

    return {
        setDone(done: number) {
            paintDots(done)
        },

        async celebrate(index: number) {
            paintDots(index + 1)
            await FX.ping(scene, dotX(index), HUD.cy, C.green, { radius: 32, depth: DEPTH.hud + 2 })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        orderBounds() {
            return { x: HUD.orderX, y: HUD.cy, w: HUD.orderW + 40, h: 62 }
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
            zone.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
