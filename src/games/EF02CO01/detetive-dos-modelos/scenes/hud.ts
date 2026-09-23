import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { DEPTH, HUD, W } from '../data/layout'
import { createHelpButton } from './icons'
import { pause } from './timing'

const fx = (o: unknown) => o as unknown as FxTarget

export function createHud(scene: Phaser.Scene, onHelp: () => void) {
    const parts: Phaser.GameObjects.GameObject[] = []

    // barra reta de ponta a ponta: o header é moldura da tela, não mais um
    // cartão disputando o olho com os cartões do jogo
    const plate = scene.add.graphics().setDepth(DEPTH.hud)
    plate.fillStyle(C.ink, 0.18)
    plate.fillRect(0, HUD.bar.h, W, 6)
    plate.fillStyle(C.cream, 1)
    plate.fillRect(0, 0, W, HUD.bar.h)
    plate.fillStyle(C.ink, 1)
    plate.fillRect(0, HUD.bar.h - 4, W, 4)
    parts.push(plate)

    const levelText = scene.add.text(0, HUD.pipCy, '', {
        fontFamily: FONT.black, fontSize: '24px', color: CSS.ink,
    }).setOrigin(0.5).setResolution(2).setDepth(DEPTH.hud + 2)
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
        const textW = levelText.width
        const dotsW = (total - 1) * HUD.dotGap
        const groupW = textW + HUD.groupGap + dotsW + HUD.dotR * 2
        const left = W / 2 - groupW / 2

        levelText.x = left + textW / 2
        firstDot = left + textW + HUD.groupGap + HUD.dotR
    }

    function paintDots() {
        dots.clear()
        for (let i = 0; i < total; i++) {
            const x = dotX(i)
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(x, HUD.pipCy, HUD.dotR + 3)
            dots.fillStyle(i < done ? C.ok : C.white, 1)
            dots.fillCircle(x, HUD.pipCy, HUD.dotR)
        }
    }

    return {
        setLevel(current: number, levels: number) {
            levelText.setText(`Nível ${current} de ${levels}`)
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
