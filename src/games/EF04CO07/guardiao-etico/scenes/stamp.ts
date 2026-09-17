import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PAPER, STAMP } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { SHEET } from '../data/art'

export interface StampOptions {
    onPress: () => void
}

const SEAL = { x: PAPER.x + 110, y: PAPER.y + 400, r: 52 }

/**
 * O carimbo. É o único gesto que compromete, e fica longe do papel: o dedo que
 * varre não pode esbarrar nele.
 *
 * No erro ele desce e sobe SEM TINTA — o gesto acontece inteiro, sem bronca, e
 * o papel não é desfeito.
 */
export function createStamp(scene: Phaser.Scene, options: StampOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.stamp)
    const button = scene.add.graphics()
    root.add(button)

    const label = scene.add
        .text(STAMP.cx, STAMP.cy + 44, 'APROVAR', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setStroke(CSS.ink, 6)
    root.add(label)

    const lock = scene.add.graphics().setVisible(false)
    root.add(lock)

    // o ícone do carimbo é a quarta célula da folha de ferramentas
    const mark = scene.textures.exists(SHEET.tools)
        ? scene.add.image(STAMP.cx, STAMP.cy - 26, SHEET.tools, 3).setDisplaySize(76, 76)
        : null
    if (mark) root.add(mark)

    const tool = scene.add.container(SEAL.x, -200).setDepth(DEPTH.stamp + 2).setVisible(false)
    const toolG = scene.add.graphics()
    toolG.fillStyle(C.wood, 1)
    toolG.fillRoundedRect(-26, -96, 52, 54, 14)
    toolG.fillStyle(C.ink, 1)
    toolG.fillRoundedRect(-14, -48, 28, 20, 4)
    toolG.fillStyle(C.metalDeep, 1)
    toolG.fillRoundedRect(-52, -30, 104, 34, 10)
    tool.add(toolG)

    const seal = scene.add.graphics().setDepth(DEPTH.rings + 1).setVisible(false)

    let enabled = false
    let locked = false

    const paintButton = () => {
        button.clear()
        const x = STAMP.cx - STAMP.w / 2
        const y = STAMP.cy - STAMP.h / 2
        const base = locked ? C.slate : C.green
        button.fillStyle(C.ink, 1)
        button.fillRoundedRect(x, y + 8, STAMP.w, STAMP.h, 22)
        button.fillStyle(locked ? C.metalDeep : C.greenDeep, 1)
        button.fillRoundedRect(x, y, STAMP.w, STAMP.h, 22)
        button.fillStyle(base, 1)
        button.fillRoundedRect(x + 6, y + 6, STAMP.w - 12, STAMP.h - 20, 18)
        button.fillStyle(C.white, 0.22)
        button.fillRoundedRect(x + 16, y + 14, STAMP.w - 32, 18, 9)

        if (!mark) {
            button.fillStyle(C.wood, 1)
            button.fillRoundedRect(STAMP.cx - 20, STAMP.cy - 58, 40, 26, 8)
            button.fillStyle(C.ink, 1)
            button.fillRoundedRect(STAMP.cx - 12, STAMP.cy - 34, 24, 10, 3)
            button.fillStyle(C.metalDeep, 1)
            button.fillRoundedRect(STAMP.cx - 46, STAMP.cy - 26, 92, 16, 6)
        }
        mark?.setAlpha(locked ? 0.6 : 1)

        lock.clear()
        if (locked) {
            lock.fillStyle(C.amber, 1)
            lock.fillRoundedRect(STAMP.cx + STAMP.w / 2 - 46, STAMP.cy - STAMP.h / 2 - 12, 44, 44, 10)
            lock.lineStyle(7, C.amberDeep, 1)
            lock.beginPath()
            lock.arc(
                STAMP.cx + STAMP.w / 2 - 24,
                STAMP.cy - STAMP.h / 2 + 2,
                12,
                Phaser.Math.DegToRad(180),
                Phaser.Math.DegToRad(360),
            )
            lock.strokePath()
        }
        lock.setVisible(locked)
    }
    paintButton()

    const zone = scene.add
        .zone(STAMP.cx, STAMP.cy, STAMP.w + 20, STAMP.h + 20)
        .setOrigin(0.5)
        .setDepth(DEPTH.stamp + 1)
        .setInteractive({ useHandCursor: true })

    zone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, button)
        options.onPress()
    })

    return {
        setEnabled(value: boolean) {
            enabled = value
            root.setAlpha(value ? 1 : 0.6)
        },

        setLocked(value: boolean) {
            locked = value
            paintButton()
        },

        /** Desce no papel. Com tinta quando passou; sem tinta quando não. */
        async press(ink: boolean) {
            tool.setVisible(true).setPosition(SEAL.x, PAPER.y - 120).setAngle(-8)
            await FX.to(scene, tool, { y: SEAL.y - 30, angle: 0 }, { duration: 200 })
            if (ink) {
                seal.clear()
                seal.fillStyle(C.green, 0.9)
                seal.fillCircle(SEAL.x, SEAL.y, SEAL.r)
                seal.lineStyle(8, C.greenDeep, 1)
                seal.strokeCircle(SEAL.x, SEAL.y, SEAL.r - 6)
                seal.fillStyle(C.paper, 1)
                seal.fillCircle(SEAL.x, SEAL.y, SEAL.r * 0.44)
                seal.setAlpha(0).setVisible(true)
                await FX.to(scene, seal, { alpha: 1 }, { duration: 120 })
            }
            await FX.to(scene, tool, { y: PAPER.y - 160 }, { duration: 260 })
            tool.setVisible(false)
        },

        clearSeal() {
            seal.setVisible(false)
        },

        async hide() {
            await FX.to(scene, root, { alpha: 0, y: 60 }, { duration: 260 })
        },

        destroy() {
            FX.kill(scene, [root, tool, seal])
            zone.destroy()
            tool.destroy(true)
            seal.destroy()
            root.destroy(true)
        },
    }
}

export type Stamp = ReturnType<typeof createStamp>
