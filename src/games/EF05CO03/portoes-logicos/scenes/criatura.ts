import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { RECORTE, SHEET, SMALL, TALL_H, footY, scaleOf } from '../data/art'
import { DEPTH, TRACK } from '../data/layout'
import { C } from '../data/theme'
import type { Criatura } from '../types'

/** O controle da marcha em curso: acelerar com o toque, pausar com o `?`. */
export interface Marcha {
    pronta: Promise<void>
    acelerar: () => void
    pausar: () => void
    retomar: () => void
    cancelar: () => void
}

/**
 * A criaturinha da vez.
 *
 * Um ator só, reaproveitado: a onda tem oito passagens, e criar e destruir um
 * sprite por passagem faria a folha ser recortada oito vezes por onda sem
 * nenhuma necessidade.
 *
 * O contêiner marca os PÉS. O sprite mora dentro dele deslocado pelo `footPad`
 * medido, então mover o contêiner por um ponto do trajeto já põe o pé na fita —
 * e o balanço da marcha pode mexer no sprite sem tirar o ator do caminho.
 */
export function createAtor(scene: Phaser.Scene, onPasso: () => void) {
    const root = scene.add.container(TRACK.fromX, TRACK.y).setDepth(DEPTH.criatura).setVisible(false)

    const sombra = scene.add.graphics()
    root.add(sombra)

    const sprite = scene.add.sprite(0, 0, SHEET.criaturinhas, 0).setOrigin(0.5, 1)
    root.add(sprite)

    let atual: Criatura | null = null
    let escala = 1
    let passoTimer: Phaser.Time.TimerEvent | null = null

    /**
     * Onde ela está no braço da raia, de 0 (bifurcação) a 1 (boca do portão).
     *
     * Precisa ser lembrado: a passagem pelo portão são DOIS trechos — até a
     * soleira, a placa julga, e só então o resto. Sem esta memória o segundo
     * trecho recomeçaria do zero, e a criaturinha teleportava de volta para a
     * bifurcação antes de disparar para o curral.
     */
    let tNoBraco = 0

    const pararPasso = () => {
        passoTimer?.remove()
        passoTimer = null
    }

    const balanco = (ligado: boolean) => {
        FX.kill(scene, sprite)
        const base = atual ? RECORTE[atual.frame].footPad * escala : 0
        sprite.setY(base).setScale(escala).setAngle(0)
        if (!ligado) return
        scene.tweens.add({
            targets: sprite,
            y: base - 7,
            scaleY: escala * 0.96,
            duration: 190,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    const pintarSombra = () => {
        sombra.clear()
        if (!atual) return
        sombra.fillStyle(C.trilhaDark, 0.4)
        sombra.fillEllipse(0, -2, 86 * escala * 2.2, 18 * escala * 2.2)
    }

    /**
     * Anda pelo braço da raia, DO PONTO EM QUE ESTÁ até `ate`.
     *
     * `msDoBracoInteiro` é o tempo do trajeto COMPLETO, e o trecho leva a fração
     * dele. Assim a velocidade é a mesma nos dois pedaços da passagem: sem isso,
     * o trecho curto da soleira até o portão vira um disparo.
     */
    const andarNoBraco = async (path: Phaser.Curves.Path, ate: number, msDoBracoInteiro: number) => {
        const de = tNoBraco
        const trecho = Math.abs(ate - de)
        if (trecho < 0.001) {
            tNoBraco = ate
            return
        }

        const voltando = ate < de
        balanco(true)
        pararPasso()
        passoTimer = scene.time.addEvent({
            delay: voltando ? 230 : 190,
            loop: true,
            callback: onPasso,
        })
        if (voltando) sprite.setFlipX(true)

        const ponto = new Phaser.Math.Vector2()
        await new Promise<void>(resolve => {
            scene.tweens.addCounter({
                from: de,
                to: ate,
                duration: FX.ms(scene, msDoBracoInteiro * trecho),
                ease: voltando ? 'Sine.easeInOut' : 'Linear',
                onUpdate: tween => {
                    tNoBraco = tween.getValue() ?? ate
                    path.getPoint(tNoBraco, ponto)
                    root.setPosition(ponto.x, ponto.y)
                },
                onComplete: () => resolve(),
            })
        })

        tNoBraco = ate
        if (voltando) sprite.setFlipX(false)
        balanco(false)
        pararPasso()
    }

    return {
        get criatura() {
            return atual
        },

        /** Põe a criaturinha no começo da trilha, parada. */
        entrar(c: Criatura) {
            atual = c
            escala = scaleOf(c.pequena)
            sprite
                .setFrame(c.frame)
                .setOrigin(RECORTE[c.frame].originX, 1)
                .setScale(escala)
                .setAngle(0)
                .setAlpha(1)
            root.setPosition(TRACK.fromX, TRACK.y).setVisible(true).setScale(1).setAlpha(1)
            tNoBraco = 0
            pintarSombra()
            balanco(false)
        },

        /**
         * A marcha até a bifurcação. Devolve um controle: quem já entendeu toca
         * cedo, e aí a marcha ACELERA em vez de ser cancelada — a criaturinha
         * ainda precisa chegar na bifurcação para entrar por algum portão.
         */
        marchar(duracao: number): Marcha {
            balanco(true)
            pararPasso()
            passoTimer = scene.time.addEvent({
                delay: 190,
                loop: true,
                callback: onPasso,
            })

            const tween = scene.tweens.add({
                targets: root,
                x: TRACK.forkX,
                duration: FX.ms(scene, duracao),
                ease: 'Linear',
            })

            const pronta = new Promise<void>(resolve => {
                tween.once('complete', () => resolve())
                tween.once('stop', () => resolve())
            })

            return {
                pronta,
                acelerar() {
                    tween.timeScale = 3.4
                },
                /** O `?` pausa: a criaturinha fica exatamente onde estava. */
                pausar() {
                    tween.pause()
                    pararPasso()
                    FX.kill(scene, sprite)
                },
                retomar() {
                    balanco(true)
                    pararPasso()
                    passoTimer = scene.time.addEvent({ delay: 190, loop: true, callback: onPasso })
                    tween.resume()
                },
                cancelar() {
                    tween.stop()
                },
            }
        },

        /** Chegou e ninguém tocou: ela boceja e senta. Sem relógio e sem bronca. */
        async esperar() {
            balanco(false)
            pararPasso()
            await FX.wait(scene, 900)
            if (!atual) return
            await FX.to(scene, sprite, { angle: -5 }, { duration: 420, ease: 'Sine.easeInOut' })
            await FX.to(scene, sprite, { angle: 3 }, { duration: 520, ease: 'Sine.easeInOut' })
            await FX.to(scene, sprite, { angle: 0 }, { duration: 380, ease: 'Sine.easeInOut' })
            FX.breathe(scene, sprite, { grow: 1.03, duration: 1500 })
        },

        parar() {
            balanco(false)
            pararPasso()
        },

        andarNoBraco,

        /** Volta andando, calma, do ponto em que está até a bifurcação. */
        voltar(path: Phaser.Curves.Path) {
            return andarNoBraco(path, 0, 1500)
        },

        /** Entra pelo vão: encolhe e some na boca do portão. */
        async atravessar() {
            await FX.to(scene, root, { scale: 0.45, alpha: 0 }, { duration: 320, ease: 'Sine.easeIn' })
            root.setVisible(false)
        },

        async comemorar() {
            await FX.impact(scene, sprite, 0.16)
        },

        async recuar() {
            await FX.nope(scene, sprite)
        },

        esconder() {
            pararPasso()
            FX.kill(scene, sprite)
            FX.kill(scene, root)
            root.setVisible(false)
            atual = null
        },

        /** A caixa da criaturinha ONDE ELA ESTÁ agora — o tutorial recorta por aqui. */
        bounds() {
            const altura = atual ? TALL_H * (atual.pequena ? SMALL : 1) : TALL_H
            return { x: root.x, y: root.y - altura / 2, w: 200, h: altura + 74 }
        },

        posicao() {
            return { x: root.x, y: root.y }
        },

        destroy() {
            pararPasso()
            FX.kill(scene, sprite)
            FX.kill(scene, root)
            root.destroy(true)
        },
    }
}

export type Ator = ReturnType<typeof createAtor>

/** Onde o sprite tem de nascer para os pés caírem na fita — usado pela fila. */
export const yDosPes = footY
