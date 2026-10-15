import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, H, W } from '../data/layout'
import { C } from '../data/theme'

const DARK = 0.72

export interface Veil {
    show(): Promise<void>
    hide(): Promise<void>
    destroy(): void
}

/**
 * O fundo escuro da pergunta: só o pedido, a pergunta, o rolo, as etiquetas e o varal
 * ficam acima dele (pela profundidade). Não pega toque.
 */
export function createVeil(scene: Phaser.Scene): Veil {
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 1).setDepth(DEPTH.veil).setAlpha(0)
    const fade = (alpha: number) => {
        scene.tweens.killTweensOf(veil)
        return FX.to(scene, veil, { alpha }, { duration: 320 })
    }
    return {
        show: () => fade(DARK),
        hide: () => fade(0),
        destroy() {
            veil.destroy()
        },
    }
}
