import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    label: string
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.3)
    bar.fillRect(0, HUD.h, W, 10)
    bar.fillStyle(C.purpleDeep, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.purple, 1)
    bar.fillRect(0, 0, W, HUD.h - 7)
    bar.fillStyle(C.white, 0.12)
    bar.fillRect(0, 0, W, 16)
    bar.fillStyle(C.yellow, 1)
    bar.fillRect(0, HUD.h - 7, W, 4)
    for (let x = 26; x < W; x += 74) {
        bar.fillStyle(C.glow, 0.9)
        bar.fillCircle(x, HUD.h - 20, 5)
        bar.fillStyle(C.white, 0.55)
        bar.fillCircle(x - 1, HUD.h - 21, 2)
    }

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.coralDeep, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.coral, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 13, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.3)
    pill.fillRoundedRect(HUD.pillX + 13, HUD.pillY + 8, HUD.pillW - 26, 9, 5)

    const label = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, options.label, {
            fontFamily: FONT.black,
            fontSize: '20px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setStroke(CSS.ink, 5)
    if (label.width > HUD.pillW - 26) label.setScale((HUD.pillW - 26) / label.width)

    const title = scene.add
        .text(HUD.titleX, HUD.cy - 3, '', {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.cream,
            align: 'center',
            wordWrap: { width: HUD.titleW },
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.ink, 5)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HUD.helpR + 3)
    helpG.fillStyle(C.white, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.creamDeep, 1)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', { fontFamily: FONT.black, fontSize: '28px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)

    root.add([bar, pill, label, title, helpG, helpText])

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
        setTitle(text: string) {
            title.setText(text)
        },

        setLabel(text: string) {
            label.setScale(1)
            label.setText(text)
            if (label.width > HUD.pillW - 26) label.setScale((HUD.pillW - 26) / label.width)
        },

        async fade(visible: boolean) {
            if (zone.input) zone.input.enabled = visible && enabled
            await FX.to(scene, root, { alpha: visible ? 1 : 0, y: visible ? 0 : -HUD.h }, { duration: 320 })
        },

        setEnabled(value: boolean) {
            enabled = value
            helpG.setAlpha(value ? 1 : 0.5)
            helpText.setAlpha(value ? 1 : 0.5)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
            zone.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
