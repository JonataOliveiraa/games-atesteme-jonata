import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PLACA, TRACK } from '../data/layout'
import { C } from '../data/theme'
import type { Lane } from '../types'

/**
 * O exemplo animado: uma mão fantasma resolve a PRIMEIRA criaturinha do nível.
 *
 * Ela não demonstra num palco à parte — resolve a rodada de verdade, com a
 * criaturinha de verdade, no portão de verdade. Um exemplo que acontece fora do
 * jogo obriga a criança a traduzir duas telas em uma.
 *
 * E é pulável a qualquer instante: `cancelar()` some com a mão na hora, porque
 * quem já entendeu não deve esperar cinco segundos para poder jogar.
 */
export function runDemo(scene: Phaser.Scene, lane: Lane, alvo: { x: number; y: number }, onTap: () => void) {
    let cancelado = false

    const mao = scene.add.graphics().setDepth(DEPTH.fx + 10).setPosition(TRACK.forkX + 30, TRACK.y - 40)
    mao.fillStyle(C.white, 0.34)
    mao.fillCircle(0, 0, 30)
    mao.lineStyle(6, C.white, 0.95)
    mao.strokeCircle(0, 0, 30)
    mao.fillStyle(C.white, 0.95)
    mao.fillCircle(0, 0, 9)
    mao.setAlpha(0)

    const onda = scene.add.graphics().setDepth(DEPTH.fx + 9).setAlpha(0)
    onda.lineStyle(6, C.white, 0.95)
    onda.strokeCircle(0, 0, 32)

    const limpar = () => {
        FX.kill(scene, mao)
        FX.kill(scene, onda)
        mao.destroy()
        onda.destroy()
    }

    const corrida = (async () => {
        await FX.to(scene, mao, { alpha: 1 }, { duration: 220 })
        if (cancelado) return

        await FX.wait(scene, 420)
        if (cancelado) return

        // O dedo passa pela placa antes do portão: quem decide é a frase.
        await FX.to(scene, mao, { x: PLACA.cx, y: alvo.y }, { duration: 520, ease: 'Sine.easeInOut' })
        if (cancelado) return

        await FX.wait(scene, 620)
        if (cancelado) return

        await FX.to(scene, mao, { x: alvo.x, y: alvo.y }, { duration: 380, ease: 'Sine.easeInOut' })
        if (cancelado) return

        onda.setPosition(alvo.x, alvo.y).setScale(0.5).setAlpha(0.9)
        void FX.to(scene, onda, { scale: 2.1, alpha: 0 }, { duration: 460 })
        await FX.to(scene, mao, { scale: 0.74 }, { duration: 120 })
        if (cancelado) return

        onTap()
        await FX.to(scene, mao, { scale: 1, alpha: 0 }, { duration: 220 })
    })()

    return {
        lane,
        pronta: corrida.then(() => limpar()),
        cancelar() {
            if (cancelado) return
            cancelado = true
            limpar()
        },
    }
}

export type Demo = ReturnType<typeof runDemo>
