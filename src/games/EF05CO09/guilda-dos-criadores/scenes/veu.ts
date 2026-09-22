import type Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { ART, H, W } from '../data/layout'
import { C } from '../data/theme'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Alvo {
    x: number
    y: number
    w: number
    h: number
}

export interface Veu {
    /**
     * Escurece a sala.
     *
     * SEM alvo o escuro é inteiro, sem buraco nenhum — é assim que a
     * apresentação começa, quando a mesa ainda está vazia e a única coisa que
     * há para olhar é a menina falando. O buraco nasce fechado no meio da
     * mesa, então o `focar` seguinte ABRE a luz no lugar onde a figura pousou,
     * em vez de acender um retângulo do nada.
     */
    abrir(alvo?: Alvo): Promise<void>
    /** A luz ESCORREGA até o alvo novo. Nunca corta. */
    focar(alvo: Alvo): Promise<void>
    fechar(): Promise<void>
    destroy(): void
}

/** A folga entre o alvo e a borda da luz. */
const FOLGA = 18
const RAIO = 16

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O VÉU — ESCURO EM VOLTA, E O TOQUE PASSANDO NO MEIO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * *"com background escuro como tutorial, pq assim o botão fica mais claro e
 * fica mais perceptível onde focar e clicar."*
 *
 * O véu do `createTutorial` faz isso, mas ele BLOQUEIA o toque: ele serve para
 * contar, e o guia da primeira fase existe justamente para a criança FAZER.
 * Este aqui é o contrário — todo o resto da tela escurece, o alvo fica na cor
 * cheia, e o dedo continua chegando nele.
 *
 * ── COMO O TOQUE PASSA ───────────────────────────────────────────────────
 *
 * Um `Graphics` sem `setInteractive` não captura ponteiro nenhum: ele é
 * pintura, não porta. Então o véu pode cobrir a tela inteira sem tirar um
 * toque sequer do jogo embaixo dele.
 *
 * ── POR QUE QUATRO RETÂNGULOS, E NÃO UMA MÁSCARA ─────────────────────────
 *
 * O buraco é sempre um retângulo, e quatro faixas em volta dele dão o mesmo
 * resultado sem gerar textura, sem `BitmapMask` e sem uma segunda câmera. A
 * borda arredondada fica por conta do filete dourado desenhado por cima.
 *
 * ── A LUZ ESCORREGA ──────────────────────────────────────────────────────
 *
 * Trocar o buraco de lugar num quadro só pisca, e piscar apaga a relação entre
 * o alvo velho e o novo. Aqui o retângulo é TWEENADO: a criança vê a luz sair
 * da figura e ir até a bandeja, e isso conta "agora é ali" sem uma palavra.
 */
export function createVeu(
    scene: Phaser.Scene,
    { depth, alpha = 0.62 }: { depth: number; alpha?: number },
): Veu {
    const g = scene.add.graphics().setDepth(depth).setAlpha(0)
    const luz = scene.add.graphics().setDepth(depth + 1).setAlpha(0)

    /* O buraco de agora. Ele é tweenado, então precisa ser um objeto solto. */
    const furo = { x: W / 2, y: H / 2, w: 10, h: 10 }

    const pintar = () => {
        const { x, y, w, h } = furo
        const e = x - w / 2, d = x + w / 2
        const c = y - h / 2, b = y + h / 2

        g.clear()
        g.fillStyle(C.shadow, 1)
        /* Quatro faixas em volta: em cima, embaixo, à esquerda e à direita. */
        g.fillRect(0, 0, W, Math.max(0, c))
        g.fillRect(0, Math.min(H, b), W, Math.max(0, H - b))
        g.fillRect(0, c, Math.max(0, e), Math.max(0, h))
        g.fillRect(d, c, Math.max(0, W - d), Math.max(0, h))

        luz.clear()
        /* Buraco fechado não tem borda: um filete de tamanho zero vira um
           pontinho dourado no meio da tela escura. */
        if (w < 4 || h < 4) return
        luz.lineStyle(3, C.gold, 0.55)
        luz.strokeRoundedRect(e, c, w, h, RAIO)
    }

    const medir = (alvo: Alvo) => ({
        x: alvo.x,
        y: alvo.y,
        w: alvo.w + FOLGA * 2,
        h: alvo.h + FOLGA * 2,
    })

    pintar()

    return {
        async abrir(alvo) {
            Object.assign(furo, alvo ? medir(alvo) : { x: ART.cx, y: ART.cy, w: 0, h: 0 })
            pintar()
            await FX.all(
                FX.to(scene, fx(g), { alpha }, { duration: 320 }),
                FX.to(scene, fx(luz), { alpha: 1 }, { duration: 320 }),
            )
        },

        /* Tween CRU, e não `FX.to`, por um motivo só: aqui é preciso repintar
           a cada quadro, e quem dá isso é o `onUpdate` — que o `FX.to` não
           expõe. Sem ele o buraco só apareceria no lugar novo no fim, que é
           exatamente o piscar que este tween existe para evitar. */
        focar(alvo) {
            const destino = medir(alvo)
            return new Promise<void>(pronto => {
                scene.tweens.add({
                    targets: furo,
                    ...destino,
                    duration: FX.ms(scene, 460),
                    ease: 'Sine.easeInOut',
                    onUpdate: pintar,
                    onComplete: () => { pintar(); pronto() },
                })
            })
        },

        async fechar() {
            await FX.all(
                FX.to(scene, fx(g), { alpha: 0 }, { duration: 260 }),
                FX.to(scene, fx(luz), { alpha: 0 }, { duration: 260 }),
            )
        },

        destroy() {
            g.destroy()
            luz.destroy()
        },
    }
}
