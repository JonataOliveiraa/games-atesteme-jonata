import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, MEL } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import { TEX } from './BootScene'

/** 2 é ela de perfil com a mão levantada; 1 é o joinha. */
const FRAME = { aside: 2, cheer: 1 } as const

export interface Mel {
    /** Entra deslizando, fala uma frase e fica. Nada de painel por cima do jogo. */
    say(line: string, cheer?: boolean): void
    hide(): void
    destroy(): void
}

/**
 * A Mel mora no alto da direita e aparece pouco: uma frase na hora de escolher
 * e uma quando o plano falha. Ela não conduz o jogo — quem conduz é a criança.
 */
export function createMel(scene: Phaser.Scene): Mel {
    const root = scene.add.container(60, 0).setDepth(DEPTH.tip).setAlpha(0)

    const art = scene.textures.exists(TEX.mel)
        ? scene.add.sprite(MEL.x, MEL.base, TEX.mel, FRAME.aside)
        : undefined
    if (art) {
        art.setOrigin(0.5, 1)
        art.setDisplaySize(MEL.h * (500 / 550), MEL.h)
        // O perfil da folha olha para a DIREITA, e ela mora na borda direita:
        // sem espelhar, a Mel fala virada para fora da tela.
        art.setFlipX(true)
        root.add(art)
    }

    const balloon = scene.add.graphics()
    const half = MEL.balloonW / 2
    const top = MEL.balloonY - MEL.balloonH / 2
    balloon.fillStyle(C.ink, A.shadow)
    balloon.fillRoundedRect(MEL.balloonX - half + 5, top + 8, MEL.balloonW, MEL.balloonH, 24)
    balloon.fillStyle(C.ink, 1)
    balloon.fillRoundedRect(MEL.balloonX - half, top, MEL.balloonW, MEL.balloonH, 24)
    balloon.fillStyle(C.card, 1)
    balloon.fillRoundedRect(MEL.balloonX - half + 6, top + 6, MEL.balloonW - 12, MEL.balloonH - 12, 20)
    /*
     * O RABICHO DESCE DO BALÃO ATÉ A CABEÇA DELA, E O BALÃO FICA ACIMA.
     *
     * Ao lado, o balão cobria a Mel: ela some atrás da própria fala. Em cima,
     * só a pontinha encosta no cabelo, e ela aparece inteira.
     */
    const tailX = MEL.x - 42
    const bottom = MEL.balloonY + MEL.balloonH / 2
    balloon.fillStyle(C.ink, 1)
    balloon.fillTriangle(tailX - 46, bottom - 16, tailX + 4, bottom - 16, tailX + 46, bottom + 58)
    balloon.fillStyle(C.card, 1)
    balloon.fillTriangle(tailX - 38, bottom - 22, tailX - 2, bottom - 22, tailX + 32, bottom + 42)
    root.add(balloon)

    const text = scene.add
        .text(MEL.balloonX, MEL.balloonY, '', {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: MEL.wrap },
            lineSpacing: 4,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(text)

    let visible = false

    return {
        say: (line, cheer = false) => {
            text.setText(line)
            art?.setFrame(cheer ? FRAME.cheer : FRAME.aside)
            FX.kill(scene, root)

            if (!visible) {
                visible = true
                root.setAlpha(0).setX(90)
                void FX.to(scene, root, { alpha: 1, x: 0 }, { duration: 320, ease: 'Back.easeOut' })
                return
            }
            // Já estava em cena: um pulinho avisa que ela falou de novo.
            root.setAlpha(1).setX(0).setY(0)
            void FX.to(scene, root, { y: -10 }, { duration: 140, yoyo: true })
        },

        hide: () => {
            if (!visible) return
            visible = false
            FX.kill(scene, root)
            void FX.to(scene, root, { alpha: 0, x: 90 }, { duration: 260 })
        },

        destroy: () => {
            art?.destroy()
            root.destroy(true)
        },
    }
}
