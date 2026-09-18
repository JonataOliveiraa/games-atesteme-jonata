import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { FOOT, FRAME } from '../data/cast'
import { TEX } from './BootScene'

export interface EncoreLane {
    /** Linha da folha `programas.png`, para a carinha no começo da faixa. */
    row: number
    color: number
    beats: boolean[]
}

export interface EncoreOptions {
    lanes: EncoreLane[]
    /** Houve dois tocando no mesmo compasso? É o que a frase de baixo conta. */
    together: boolean
    onChord(): void
    onBow(): Promise<void>
    /** O mesmo botão CONTINUAR da abertura: quem manda no tempo é a criança. */
    waitNext(): Promise<void>
}

export interface Encore {
    play(options: EncoreOptions): Promise<void>
    destroy(): void
}

export function createEncore(scene: Phaser.Scene): Encore {
    const root = scene.add.container(0, 0).setDepth(DEPTH.encore)

    const curtainL = scene.add.graphics()
    const curtainR = scene.add.graphics()
    const paintCurtain = (g: Phaser.GameObjects.Graphics, dir: number) => {
        g.clear()
        for (let i = 0; i < 5; i++) {
            const x = dir > 0 ? i * 38 : -i * 38 - 38
            g.fillStyle(i % 2 ? C.curtain : 0x7a3140, 1)
            g.fillRoundedRect(x, -20, 44, H + 40, 12)
            g.fillStyle(C.ink, 0.16)
            g.fillEllipse(x + 22, H * 0.62, 30, H * 0.5)
        }
        const edge = dir > 0 ? 5 * 38 - 10 : -5 * 38 - 28
        g.fillStyle(C.gold, 0.9)
        g.fillRoundedRect(edge, -20, 10, H + 40, 5)
        for (let i = 0; i < 6; i++) {
            g.fillStyle(C.gold, 1)
            g.fillCircle(edge + 5, 40 + i * 120, 9)
        }
    }
    paintCurtain(curtainL, 1)
    paintCurtain(curtainR, -1)
    curtainL.setPosition(-220, 0)
    curtainR.setPosition(W + 220, 0)
    root.add([curtainL, curtainR])

    const tape = scene.add.container(W / 2, 352).setAlpha(0)
    root.add(tape)

    /*
     * A FITA PRECISA DIZER O QUE É.
     *
     * Duas barras pontilhadas sem legenda não são um relatório: são um enfeite
     * que a criança tenta decifrar. Cada faixa começa com a CARINHA de quem
     * tocou, o título diz o que se está vendo, e a frase de baixo lê o desenho
     * em voz alta — que é a única parte que ela realmente precisa entender.
     */
    const paintTape = (options: EncoreOptions) => {
        const lanes = options.lanes
        const beats = Math.max(1, lanes[0]?.beats.length ?? 1)
        const laneH = 46
        const face = 56
        const padL = 40 + face + 18
        const w = Math.min(940, padL + 60 + beats * 54)
        const h = lanes.length * (laneH + 14) + 176
        const cell = (w - padL - 40) / beats
        const top = -h / 2

        const g = scene.add.graphics()
        g.fillStyle(C.ink, 0.32)
        g.fillRoundedRect(-w / 2 + 6, top + 10, w, h, 28)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-w / 2, top, w, h, 26)
        g.fillStyle(C.gold, 1)
        g.fillRoundedRect(-w / 2, top, w, 14, 7)
        tape.add(g)

        tape.add(scene.add
            .text(0, top + 48, 'QUEM TOCOU, E QUANDO', {
                fontFamily: FONT.black, fontSize: '27px', color: CSS.ink,
            })
            .setOrigin(0.5).setResolution(2))

        lanes.forEach((lane, row) => {
            const y = top + 92 + row * (laneH + 14)

            if (scene.textures.exists(TEX.programs)) {
                const art = scene.add.sprite(-w / 2 + 40 + face / 2, y + laneH / 2,
                    TEX.programs, lane.row * 4 + FRAME.asking)
                art.setDisplaySize(face, face)
                art.setOrigin(0.5, FOOT[lane.row][FRAME.asking])
                art.y = y + laneH / 2 + face * 0.34
                tape.add(art)
            } else {
                g.fillStyle(lane.color, 1)
                g.fillCircle(-w / 2 + 40 + face / 2, y + laneH / 2, face / 2.6)
            }

            g.fillStyle(C.ink, 0.1)
            g.fillRoundedRect(-w / 2 + padL, y, w - padL - 40, laneH, laneH / 2)
            lane.beats.forEach((on, i) => {
                if (!on) return
                g.fillStyle(lane.color, 1)
                g.fillRoundedRect(-w / 2 + padL + 2 + i * cell, y + 5, cell - 4, laneH - 10, 12)
            })
        })

        const line = options.together
            ? 'Teve hora em que os dois tocaram juntos!'
            : 'Cada um tocou na sua vez.'
        tape.add(scene.add
            .text(0, top + h - 46, line, {
                fontFamily: FONT.body, fontSize: '25px', color: CSS.ink,
            })
            .setOrigin(0.5).setResolution(2))
    }

    return {
        /*
         * O FIM DA MÚSICA, e não uma tarefa nova.
         *
         * A versão anterior pedia "toque para reger" depois de a peça já ter
         * acabado: um gesto sem função, no momento em que não havia mais nada
         * para reger. Agora a cortina fecha, a orquestra se curva com o acorde
         * final e a fita explica o que aconteceu.
         */
        play: async options => {
            root.setVisible(true)
            tape.removeAll(true)

            await FX.all(
                FX.to(scene, curtainL, { x: -60 }, { duration: 620, ease: 'Sine.easeOut' }),
                FX.to(scene, curtainR, { x: W + 60 }, { duration: 620, ease: 'Sine.easeOut' }),
            )

            options.onChord()
            void FX.flash(scene, 0xffe9b0, { duration: 420, peak: 0.4 })
            void FX.confetti(scene, {
                colors: [C.gold, C.coral, C.teal, C.violet, C.cream],
                count: 80,
                depth: DEPTH.encore + 2,
            })
            await options.onBow()

            paintTape(options)
            tape.setScale(0.9)
            await FX.to(scene, tape, { alpha: 1, scale: 1 }, { duration: 420, ease: 'Back.easeOut' })

            await options.waitNext()

            await FX.to(scene, tape, { alpha: 0, scale: 0.94 }, { duration: 260 })
            await FX.all(
                FX.to(scene, curtainL, { x: -220 }, { duration: 520, ease: 'Sine.easeIn' }),
                FX.to(scene, curtainR, { x: W + 220 }, { duration: 520, ease: 'Sine.easeIn' }),
            )
        },

        destroy: () => {
            FX.kill(scene, [curtainL, curtainR, tape])
            root.destroy(true)
        },
    }
}
