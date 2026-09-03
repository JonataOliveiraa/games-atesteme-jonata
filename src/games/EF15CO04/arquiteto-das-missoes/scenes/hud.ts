import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, HELP, STATUS, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export function createHud(scene: Phaser.Scene, onHelp: () => void) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud)

    const board = scene.add.graphics()
    board.fillStyle(C.ink, 0.22)
    board.fillRoundedRect(STATUS.x, STATUS.y + 8, STATUS.w, STATUS.h, 26)
    board.fillStyle(C.cream, 0.97)
    board.fillRoundedRect(STATUS.x, STATUS.y, STATUS.w, STATUS.h, 26)
    board.fillStyle(C.white, 0.6)
    board.fillRoundedRect(STATUS.x + 12, STATUS.y + 7, STATUS.w - 24, 15, 8)
    board.lineStyle(6, C.woodDark, 1)
    board.strokeRoundedRect(STATUS.x, STATUS.y, STATUS.w, STATUS.h, 26)

    const p = STATUS.pill
    const pill = scene.add.graphics()
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(p.x, p.y, p.w, p.h, p.r)
    pill.fillStyle(C.tealDark, 1)
    pill.fillRoundedRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8, p.r - 4)
    pill.fillStyle(C.teal, 1)
    pill.fillRoundedRect(p.x + 4, p.y + 4, p.w - 8, p.h - 12, p.r - 4)
    pill.fillStyle(C.white, 0.34)
    pill.fillRoundedRect(p.x + 14, p.y + 9, p.w - 28, 9, 5)

    const label = scene.add.text(p.x + p.w / 2, p.y + p.h / 2 - 1, '', {
        fontFamily: FONT.black,
        fontSize: '19px',
        color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    label.setStroke(CSS.ink, 5)

    const dots = scene.add.graphics()

    const helpG = scene.add.graphics().setPosition(HELP.x, HELP.y)
    helpG.fillStyle(C.ink, 0.24)
    helpG.fillCircle(2, 6, HELP.r)
    helpG.fillStyle(C.cream, 1)
    helpG.fillCircle(0, 0, HELP.r)
    helpG.fillStyle(C.white, 0.7)
    helpG.fillEllipse(-HELP.r * 0.2, -HELP.r * 0.36, HELP.r * 1.05, HELP.r * 0.5)
    helpG.lineStyle(5, C.woodDark, 1)
    helpG.strokeCircle(0, 0, HELP.r)

    const helpText = scene.add.text(HELP.x, HELP.y + 1, '?', {
        fontFamily: FONT.black,
        fontSize: '30px',
        color: CSS.ink,
    }).setOrigin(0.5).setResolution(2)

    root.add([board, pill, label, dots, helpG, helpText])

    const zone = scene.add.zone(HELP.x, HELP.y, HELP.r * 2.4, HELP.r * 2.4)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 1)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        FX.press(scene, helpG)
        onHelp()
    })

    const edge = scene.add.graphics().setDepth(DEPTH.edge).setAlpha(0)

    let phases = 4
    let current = 0

    const dotX = (i: number) =>
        STATUS.x + STATUS.w / 2 + (i - (phases - 1) / 2) * STATUS.dotGap

    const paintDots = () => {
        const r = STATUS.dotR
        dots.clear()
        for (let i = 0; i < phases; i++) {
            const x = dotX(i)
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(x, STATUS.dotY, r + 3)
            if (i < current) {
                dots.fillStyle(C.okDark, 1)
                dots.fillCircle(x, STATUS.dotY, r)
                dots.fillStyle(C.ok, 1)
                dots.fillCircle(x, STATUS.dotY - 2, r - 2)
            } else if (i === current) {
                dots.fillStyle(C.warnDark, 1)
                dots.fillCircle(x, STATUS.dotY, r)
                dots.fillStyle(C.warn, 1)
                dots.fillCircle(x, STATUS.dotY - 2, r - 2)
            } else {
                dots.fillStyle(C.creamEdge, 1)
                dots.fillCircle(x, STATUS.dotY, r)
                dots.fillStyle(C.creamDeep, 1)
                dots.fillCircle(x, STATUS.dotY - 2, r - 2)
            }
            dots.fillStyle(C.white, 0.34)
            dots.fillEllipse(x - r * 0.26, STATUS.dotY - r * 0.5, r * 0.8, r * 0.34)
        }
    }

    return {
        setLevel(level: number, levels: number) {
            label.setText(`NÍVEL ${level} de ${levels}`)
        },

        setPhases(count: number) {
            phases = count
            current = 0
            paintDots()
        },

        setPhase(index: number) {
            current = Phaser.Math.Clamp(index, 0, phases)
            paintDots()
        },

        flash(color: number) {
            edge.clear()
            edge.lineStyle(22, color, 1)
            edge.strokeRoundedRect(11, 11, W - 22, H - 22, 30)
            edge.setAlpha(0.9)
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

        fade(alpha: number, ms: number) {
            scene.tweens.add({ targets: root, alpha, duration: FX.ms(scene, ms) })
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy()
            zone.destroy()
            edge.destroy()
        },
    }
}
