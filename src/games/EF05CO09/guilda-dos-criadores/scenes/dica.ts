import type Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A DICA — "É AQUI", SEM TIRAR A TELA DA CRIANÇA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O tutorial de sobreposição (`createTutorial`) escurece a tela, recorta um
 * alvo e BLOQUEIA o toque: ele conta o que vai acontecer. Serve para o lembrete
 * do botão `?`, e não serve para ensinar fazendo — a criança olha, toca em
 * Próximo e continua sem ter feito nada.
 *
 * Aqui é o contrário: um halo que repete em cima do alvo enquanto o jogo
 * continua inteiro tocável. Quem faz é ela; o halo só diz onde.
 *
 * ── POR QUE UM `ping` REPETIDO, E NÃO UM ANEL PARADO ─────────────────────
 *
 * Anel parado vira parte do desenho em dois segundos e some da atenção. O
 * pulso reaparece, e reaparecer é o que o olho persegue. O intervalo é longo
 * de propósito: um halo a cada segundo pisca, um a cada dois segundos chama.
 */
export function dica(
    scene: Phaser.Scene,
    x: number,
    y: number,
    { raio = 90, cor = C.gold, intervalo = 1900 } = {},
): () => void {
    let vivo = true

    const bater = () => {
        if (!vivo) return
        void FX.ping(scene, x, y, cor, { radius: raio, duration: 900, depth: DEPTH.fx })
    }

    bater()
    const timer = scene.time.addEvent({ delay: intervalo, loop: true, callback: bater })

    const parar = () => {
        if (!vivo) return
        vivo = false
        timer.remove()
    }

    /* A cena pode morrer com a dica no ar — troca de fase, saída do jogo. */
    scene.events.once('shutdown', parar)
    return parar
}
