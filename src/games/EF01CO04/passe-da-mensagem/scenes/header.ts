import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { BOARD, DEPTH, FLOW, HELP, LEVEL_PILL, NOTE, PHASES, TO } from '../data/layout'
import { createPortrait, createSubjectArt } from './message'
import { createHelpButton, drawCheck } from './icons'
import { pause } from './timing'
import type { SubjectDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export function createHeader(scene: Phaser.Scene, onHelp: () => void) {
    const parts: Phaser.GameObjects.GameObject[] = []

    const board = scene.add.graphics().setDepth(DEPTH.board)
    board.fillStyle(C.ink, 0.32)
    board.fillRoundedRect(BOARD.x, BOARD.y + 9, BOARD.w, BOARD.h, BOARD.r)
    board.fillStyle(C.ink, 1)
    board.fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r)
    board.fillStyle(C.creamEdge, 1)
    board.fillRoundedRect(BOARD.x + 7, BOARD.y + 7, BOARD.w - 14, BOARD.h - 14, BOARD.r - 7)
    board.fillStyle(C.cream, 1)
    board.fillRoundedRect(BOARD.x + 7, BOARD.y + 7, BOARD.w - 14, BOARD.h - 22, BOARD.r - 7)
    board.fillStyle(C.white, 0.55)
    board.fillRoundedRect(BOARD.x + 20, BOARD.y + 15, BOARD.w - 40, 17, 9)
    parts.push(board)

    const pill = scene.add.graphics().setDepth(DEPTH.hud)
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(LEVEL_PILL.x, LEVEL_PILL.y, LEVEL_PILL.w, LEVEL_PILL.h, LEVEL_PILL.r)
    pill.fillStyle(C.shirtDark, 1)
    pill.fillRoundedRect(
        LEVEL_PILL.x + 4, LEVEL_PILL.y + 4,
        LEVEL_PILL.w - 8, LEVEL_PILL.h - 8, LEVEL_PILL.r - 4,
    )
    pill.fillStyle(C.shirt, 1)
    pill.fillRoundedRect(
        LEVEL_PILL.x + 4, LEVEL_PILL.y + 4,
        LEVEL_PILL.w - 8, LEVEL_PILL.h - 13, LEVEL_PILL.r - 4,
    )
    pill.fillStyle(C.white, 0.3)
    pill.fillRoundedRect(
        LEVEL_PILL.x + 14, LEVEL_PILL.y + 9, LEVEL_PILL.w - 28, 9, 5,
    )
    parts.push(pill)

    const levelText = scene.add.text(
        LEVEL_PILL.x + LEVEL_PILL.w / 2, LEVEL_PILL.y + LEVEL_PILL.h / 2 - 1, '', {
            fontFamily: FONT.black, fontSize: '22px', color: CSS.white,
        },
    ).setOrigin(0.5).setResolution(2).setDepth(DEPTH.hud)
    levelText.setStroke(CSS.ink, 6)
    parts.push(levelText)

    const phaseDots = scene.add.graphics().setDepth(DEPTH.hud)
    parts.push(phaseDots)

    const phaseTicks = scene.add.container(0, 0).setDepth(DEPTH.hud + 2)
    parts.push(phaseTicks)

    const note = scene.add.container(NOTE.x, NOTE.y).setDepth(DEPTH.hud)
    parts.push(note)

    const noteArt = scene.add.container(-94, 0)
    const noteWord = scene.add.text(-40, 2, '', {
        fontFamily: FONT.black, fontSize: '36px', color: CSS.ink,
    }).setOrigin(0, 0.5).setResolution(2)
    note.add([noteArt, noteWord])

    const flow = scene.add.container(FLOW.x, FLOW.y).setDepth(DEPTH.hud)
    const chevrons = [0, 1, 2].map(i => {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillTriangle(-16, -26, -16, 26, 20, 0)
        g.fillStyle(C.warn, 1)
        g.fillTriangle(-11, -19, -11, 19, 12, 0)
        g.setPosition(-46 + i * 46, 0)
        flow.add(g)
        return g
    })
    parts.push(flow)

    const toBox = scene.add.container(TO.x, TO.y).setDepth(DEPTH.hud)
    parts.push(toBox)

    const help = createHelpButton(scene, HELP.r)
        .setPosition(HELP.x, HELP.y)
        .setDepth(DEPTH.hud)
    parts.push(help)

    const helpZone = scene.add
        .zone(HELP.x, HELP.y, HELP.r * 2.8, HELP.r * 2.8)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 4)
    helpZone.on('pointerdown', () => {
        void FX.press(scene, fx(help))
        onHelp()
    })
    parts.push(helpZone)

    chevrons.forEach((g, i) => {
        FX.own(scene, fx(g))
        scene.tweens.add({
            targets: g,
            alpha: { from: 0.25, to: 1 },
            duration: 620,
            delay: i * 200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    })

    let done = 0
    let total = 3

    const dotX = (i: number) => PHASES.cx + (i - (total - 1) / 2) * PHASES.gap

    function paintPhases() {
        phaseDots.clear()
        for (let i = 0; i < total; i++) {
            const x = dotX(i)
            const filled = i < done
            phaseDots.fillStyle(C.ink, 1)
            phaseDots.fillCircle(x, PHASES.cy, PHASES.r + 3)
            phaseDots.fillStyle(filled ? C.okDark : C.creamEdge, 1)
            phaseDots.fillCircle(x, PHASES.cy, PHASES.r)
            phaseDots.fillStyle(filled ? C.ok : C.creamDeep, 1)
            phaseDots.fillCircle(x, PHASES.cy - 2, PHASES.r - 2)
            phaseDots.fillStyle(C.white, 0.32)
            phaseDots.fillEllipse(x - PHASES.r * 0.28, PHASES.cy - PHASES.r * 0.5,
                PHASES.r * 0.8, PHASES.r * 0.34)
        }
    }

    function paintTicks() {
        phaseTicks.removeAll(true)
        for (let i = 0; i < done; i++) {
            const g = scene.add.graphics()
            drawCheck(g, PHASES.r * 1.1, C.white, null)
            g.setPosition(dotX(i), PHASES.cy - 2)
            phaseTicks.add(g)
        }
    }

    return {
        setLevel(current: number, levels: number) {
            levelText.setText(`NÍVEL ${current} de ${levels}`)
        },

        setPhases(count: number) {
            total = count
            done = 0
            paintPhases()
            paintTicks()
        },

        setMessage(subject: SubjectDef) {
            noteArt.removeAll(true)
            noteArt.add(createSubjectArt(scene, subject, NOTE.art))
            noteArt.setScale(0.6).setAlpha(0)
            noteWord.setText(subject.word)
            void FX.to(scene, fx(noteArt), { scale: 1, alpha: 1 },
                { duration: 340, ease: Ease.back(2) })
        },

        setRecipient(frame: number) {
            toBox.removeAll(true)
            toBox.add(createPortrait(scene, frame, TO.size))
            toBox.setScale(0.7).setAlpha(0)
            void FX.to(scene, fx(toBox), { scale: 1, alpha: 1 },
                { duration: 340, ease: Ease.back(2) })
        },

        callRecipient() {
            void FX.ping(scene, TO.x, TO.y, C.warn, { radius: 120, duration: 620, depth: DEPTH.hud - 1 })
            void FX.to(scene, fx(toBox), { scale: 1.16 },
                { duration: 230, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
        },

        setHelpEnabled(on: boolean) {
            help.setAlpha(on ? 1 : 0.45)
            if (on) helpZone.setInteractive({ useHandCursor: true })
            else helpZone.disableInteractive()
        },

        async markPhase() {
            const index = Math.min(done, total - 1)
            const x = dotX(index)
            done = Math.min(done + 1, total)
            paintPhases()
            paintTicks()

            const tick = phaseTicks.list[index] as Phaser.GameObjects.Graphics | undefined
            void FX.ping(scene, x, PHASES.cy, C.ok, { radius: 44, duration: 560, depth: DEPTH.hud + 1 })
            void FX.sparks(scene, x, PHASES.cy, { color: C.ok, count: 14, spread: 62 })
            if (!tick) {
                await pause(scene, 380)
                return
            }
            tick.setScale(0.2)
            await Promise.race([
                FX.to(scene, fx(tick), { scale: 1 }, { duration: 320, ease: Ease.back(3) }),
                pause(scene, 580),
            ])
            tick.setScale(1)
        },

        destroy() {
            FX.kill(scene, fx(help))
            FX.kill(scene, fx(noteArt))
            FX.kill(scene, fx(toBox))
            chevrons.forEach(g => FX.kill(scene, fx(g)))
            phaseTicks.removeAll(true)
            parts.forEach(part => part.destroy())
        },
    }
}
