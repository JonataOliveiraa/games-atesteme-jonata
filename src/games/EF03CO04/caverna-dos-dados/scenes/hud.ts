import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HUD, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface HudOptions {
    level: number
    totalLevels: number
    pages: number
    onHelp: () => void
}

/** Uma página do diário acende por porta aberta. É todo o placar que existe. */
function paintPage(g: Phaser.GameObjects.Graphics, x: number, lit: boolean) {
    const y = HUD.cy - HUD.pageH / 2
    g.fillStyle(C.ink, lit ? 1 : 0.45)
    g.fillRoundedRect(x - 2, y - 2, HUD.pageW + 4, HUD.pageH + 4, 7)
    g.fillStyle(lit ? C.panel : C.stone, 1)
    g.fillRoundedRect(x, y, HUD.pageW, HUD.pageH, 5)
    if (!lit) return
    g.fillStyle(C.stone, 0.85)
    for (let i = 0; i < 3; i++) g.fillRect(x + 5, y + 8 + i * 7, HUD.pageW - 10, 3)
}

export function createHud(scene: Phaser.Scene, options: HudOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.3)
    bar.fillRect(0, HUD.h, W, 8)
    bar.fillStyle(C.stoneDark, 1)
    bar.fillRect(0, 0, W, HUD.h)
    bar.fillStyle(C.panel, 1)
    bar.fillRect(0, 0, W, HUD.h - 5)
    bar.fillStyle(C.white, 0.7)
    bar.fillRect(0, 0, W, 14)

    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(HUD.pillX, HUD.pillY, HUD.pillW, HUD.pillH, HUD.pillH / 2)
    pill.fillStyle(C.selectDark, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 8, HUD.pillH / 2 - 4)
    pill.fillStyle(C.crystal, 1)
    pill.fillRoundedRect(HUD.pillX + 4, HUD.pillY + 4, HUD.pillW - 8, HUD.pillH - 13, HUD.pillH / 2 - 4)
    pill.fillStyle(C.white, 0.32)
    pill.fillRoundedRect(HUD.pillX + 13, HUD.pillY + 8, HUD.pillW - 26, 9, 5)

    const label =
        options.totalLevels > 1
            ? `NÍVEL ${options.level} de ${options.totalLevels}`
            : `NÍVEL ${options.level}`

    const level = scene.add
        .text(HUD.pillX + HUD.pillW / 2, HUD.cy - 1, label, {
            fontFamily: FONT.black,
            fontSize: '19px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    level.setStroke(CSS.ink, 5)

    const pages = scene.add.graphics()
    const pageX = (index: number) => HUD.pagesX + index * (HUD.pageW + HUD.pageGap)
    const paintPages = (done: number) => {
        pages.clear()
        for (let i = 0; i < options.pages; i++) paintPage(pages, pageX(i), i < done)
    }
    paintPages(0)

    const helpG = scene.add.graphics().setPosition(HUD.helpX, HUD.cy)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 5, HUD.helpR)
    helpG.fillStyle(C.panelDeep, 1)
    helpG.fillCircle(0, 0, HUD.helpR)
    helpG.fillStyle(C.white, 0.7)
    helpG.fillEllipse(-HUD.helpR * 0.2, -HUD.helpR * 0.36, HUD.helpR * 1.05, HUD.helpR * 0.5)
    helpG.lineStyle(5, C.stoneDark, 1)
    helpG.strokeCircle(0, 0, HUD.helpR)

    const helpText = scene.add
        .text(HUD.helpX, HUD.cy + 1, '?', {
            fontFamily: FONT.black,
            fontSize: '27px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)

    root.add([bar, pill, level, pages, helpG, helpText])

    const zone = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on(
        'pointerdown',
        (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event?.stopPropagation?.()
            if (!enabled) return
            void FX.press(scene, helpG)
            options.onHelp()
        },
    )

    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    return {
        setPages(done: number) {
            paintPages(done)
        },

        pagePos(index: number) {
            return { x: pageX(index) + HUD.pageW / 2, y: HUD.cy }
        },

        helpBounds() {
            return { x: HUD.helpX, y: HUD.cy, w: HUD.helpR * 2 + 16, h: HUD.helpR * 2 + 16 }
        },

        flash(color: number) {
            edge.clear()
            edge.lineStyle(20, color, 1)
            edge.strokeRoundedRect(10, 10, W - 20, H - 20, 28)
            edge.setAlpha(0.85)
            scene.tweens.add({
                targets: edge,
                alpha: 0,
                duration: FX.ms(scene, 520),
                ease: 'Cubic.easeOut',
            })
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
            edge.destroy()
        },
    }
}

export type Hud = ReturnType<typeof createHud>
