import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, HUD, W } from '../data/layout'
import { createHelpButton } from './icons'
import { pause } from './timing'

const fx = (o: unknown) => o as unknown as FxTarget

export function createHud(scene: Phaser.Scene, onHelp: () => void) {
    const parts: Phaser.GameObjects.GameObject[] = []

    const plate = scene.add.graphics().setDepth(DEPTH.hud)
    plate.fillStyle(C.ink, 0.3)
    plate.fillRoundedRect(HUD.plate.x, HUD.plate.y + 7, HUD.plate.w, HUD.plate.h, HUD.plate.r)
    plate.fillStyle(C.ink, 1)
    plate.fillRoundedRect(HUD.plate.x, HUD.plate.y, HUD.plate.w, HUD.plate.h, HUD.plate.r)
    plate.fillStyle(C.creamEdge, 1)
    plate.fillRoundedRect(HUD.plate.x + 6, HUD.plate.y + 6, HUD.plate.w - 12, HUD.plate.h - 12, HUD.plate.r - 6)
    plate.fillStyle(C.cream, 1)
    plate.fillRoundedRect(HUD.plate.x + 6, HUD.plate.y + 6, HUD.plate.w - 12, HUD.plate.h - 20, HUD.plate.r - 6)
    parts.push(plate)

    const pill = scene.add.graphics().setDepth(DEPTH.hud + 1)
    parts.push(pill)

    const levelText = scene.add.text(0, HUD.pipCy - 1, '', {
        fontFamily: FONT.black, fontSize: '26px', color: CSS.white,
    }).setOrigin(0.5).setResolution(2).setDepth(DEPTH.hud + 2)
    levelText.setStroke(CSS.ink, 6)
    parts.push(levelText)

    const dots = scene.add.graphics().setDepth(DEPTH.hud + 1)
    parts.push(dots)

    const help = createHelpButton(scene, HUD.help.r)
        .setPosition(HUD.help.x, HUD.help.y)
        .setDepth(DEPTH.hud + 1)
    parts.push(help)

    const helpZone = scene.add
        .zone(HUD.help.x, HUD.help.y, HUD.help.r * 2.8, HUD.help.r * 2.8)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 3)
    helpZone.on('pointerdown', () => {
        void FX.press(scene, fx(help))
        onHelp()
    })
    parts.push(helpZone)

    let done = 0
    let total = 3
    let firstDot = 0

    const dotX = (i: number) => firstDot + i * HUD.dotGap

    function layout() {
        const pillW = levelText.width + 52
        const dotsW = (total - 1) * HUD.dotGap
        const groupW = pillW + HUD.groupGap + dotsW + HUD.dotR * 2
        const left = W / 2 - groupW / 2

        levelText.x = left + pillW / 2
        firstDot = left + pillW + HUD.groupGap + HUD.dotR

        pill.clear()
        pill.fillStyle(C.ink, 1)
        pill.fillRoundedRect(left, HUD.pipCy - 22, pillW, 44, 22)
        pill.fillStyle(C.skyDeep, 1)
        pill.fillRoundedRect(left + 4, HUD.pipCy - 18, pillW - 8, 36, 18)
        pill.fillStyle(C.sky, 1)
        pill.fillRoundedRect(left + 4, HUD.pipCy - 18, pillW - 8, 29, 18)
    }

    function paintDots() {
        dots.clear()
        for (let i = 0; i < total; i++) {
            const x = dotX(i)
            const filled = i < done
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(x, HUD.pipCy, HUD.dotR + 3)
            dots.fillStyle(filled ? C.okDark : C.creamEdge, 1)
            dots.fillCircle(x, HUD.pipCy, HUD.dotR)
            dots.fillStyle(filled ? C.ok : C.creamDeep, 1)
            dots.fillCircle(x, HUD.pipCy - 1, HUD.dotR - 2)
        }
    }

    return {
        setLevel(current: number, levels: number) {
            levelText.setText(`NÍVEL ${current} de ${levels}`)
            layout()
            paintDots()
        },

        setPhases(count: number) {
            total = count
            done = 0
            layout()
            paintDots()
        },

        async markPhase() {
            const index = Math.min(done, total - 1)
            done = Math.min(done + 1, total)
            paintDots()
            void FX.ping(scene, dotX(index), HUD.pipCy, C.ok,
                { radius: 34, duration: 520, depth: DEPTH.hud })
            await pause(scene, 380)
        },

        setHelpEnabled(on: boolean) {
            help.setAlpha(on ? 1 : 0.45)
            if (on) helpZone.setInteractive({ useHandCursor: true })
            else helpZone.disableInteractive()
        },

        destroy() {
            FX.kill(scene, fx(help))
            parts.forEach(part => part.destroy())
        },
    }
}
