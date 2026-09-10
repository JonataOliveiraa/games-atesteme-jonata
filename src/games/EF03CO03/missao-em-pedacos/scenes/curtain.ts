import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * A CORTINA entre um momento e o outro.
 *
 * Sem ela, sair da corrida e cair na fase final era um corte seco: o mundo
 * inteiro trocava num quadro e a criança perdia o fio. A cortina fecha, o jogo
 * troca de cenário atrás dela, e ela abre — com uma frase no meio dizendo o que
 * vem agora.
 *
 * São duas metades que se encontram no meio da tela. Encontro é mais legível que
 * um véu que só escurece: dá para ver que uma coisa terminou.
 */
export function createCurtain(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.overlay - 100).setScrollFactor(0)
    root.setVisible(false)

    /** Um pouco mais larga que a tela, para nunca sobrar canto. */
    const half = W / 2 + 40
    const leaf = H / 2

    const top = scene.add.graphics().setScrollFactor(0)
    const bottom = scene.add.graphics().setScrollFactor(0)

    /**
     * CADA METADE É DESENHADA A PARTIR DA BEIRADA QUE ENCOSTA NO MEIO.
     *
     * A de cima cresce para cima do seu ponto; a de baixo, para baixo. É isso
     * que faz as duas se encontrarem no centro com a mesma conta em `place`, e
     * é isso que estava errado: as duas cresciam para CIMA, então, fechadas, as
     * duas paravam na metade de cima da tela — uma em cima da outra — e a
     * metade de baixo do jogo continuava aparecendo por baixo da cortina, com a
     * troca de cenário acontecendo à vista.
     *
     * A tarja dourada vai na beirada que encosta: é o lábio da cortina, e é o
     * que faz o encontro no meio ser visível em vez de só escurecer.
     */
    const paint = (g: Phaser.GameObjects.Graphics, isTop: boolean) => {
        g.clear()
        g.fillStyle(C.ink, 1)
        g.fillRect(-half, isTop ? -leaf : 0, half * 2, leaf)
        g.fillStyle(C.warnDark, 1)
        g.fillRect(-half, isTop ? -8 : 0, half * 2, 8)
    }
    paint(top, true)
    paint(bottom, false)

    const label = scene.add
        .text(W / 2, H / 2, '', {
            fontFamily: FONT.black,
            fontSize: '40px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: 900 },
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setScrollFactor(0)
    label.setStroke(CSS.ink, 8)

    root.add([top, bottom, label])

    // progresso 0 = aberta (as duas fora da tela), 1 = fechada (encostadas no meio)
    const place = (progress: number) => {
        top.setPosition(W / 2, progress * leaf)
        bottom.setPosition(W / 2, H - progress * leaf)
    }
    place(0)

    /*
     * UM MOVIMENTO DE CADA VEZ, E NINGUÉM FICA PENDURADO.
     *
     * Fechar enquanto uma abertura ainda corre deixava as duas contas brigando
     * pela posição das folhas. Agora o novo movimento mata o anterior — e, ao
     * matar, RESOLVE a promessa dele: um `await curtain.close()` cancelado no
     * meio travava a cena inteira, esperando um `onComplete` que não vinha
     * mais.
     */
    let motion: Phaser.Tweens.Tween | null = null
    let settle: (() => void) | null = null

    const stopMotion = () => {
        if (motion) {
            scene.tweens.remove(motion)
            motion = null
        }
        const pending = settle
        settle = null
        pending?.()
    }

    const slide = (from: number, to: number, duration: number, delay = 0) =>
        new Promise<void>(resolve => {
            stopMotion()
            const ms = FX.ms(scene, duration)
            if (ms <= 0) {
                place(to)
                resolve()
                return
            }
            settle = resolve
            motion = scene.tweens.addCounter({
                from,
                to,
                duration: ms,
                delay: FX.ms(scene, delay),
                ease: to > from ? 'Cubic.easeIn' : 'Cubic.easeOut',
                onUpdate: tween => place(tween.getValue() ?? from),
                onComplete: () => {
                    motion = null
                    const done = settle
                    settle = null
                    place(to)
                    done?.()
                },
            })
        })

    return {
        async close(text = '') {
            root.setVisible(true)
            label.setText(text).setAlpha(0)
            await slide(0, 1, 380)
            if (text) await FX.to(scene, label, { alpha: 1 }, { duration: 200 })
        },

        /** Abrir uma cortina que já está aberta não faz nada. */
        async open() {
            if (!root.visible) return
            void FX.to(scene, label, { alpha: 0 }, { duration: 160 })
            await slide(1, 0, 420, 120)
            root.setVisible(false)
        },

        hide() {
            stopMotion()
            scene.tweens.killTweensOf(label)
            place(0)
            root.setVisible(false)
        },

        destroy() {
            stopMotion()
            scene.tweens.killTweensOf(label)
            root.destroy(true)
        },
    }
}

export type Curtain = ReturnType<typeof createCurtain>
