import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { DEPTH, HINT } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * A faixa de dica, entre a ficha e a bandeja.
 *
 * Ela NUNCA diz "errado". Diz o que o nome do campo guarda e a que campo o
 * valor pertence — é a diferença entre corrigir a criança e explicar o
 * registro para ela. A faixa fica vazia enquanto ninguém erra: dica sempre
 * visível vira ruído e some da atenção justamente quando é necessária.
 */

type Tone = 'warn' | 'good' | 'calm'

const FACE: Record<Tone, { fill: number; edge: number; text: string }> = {
    warn: { fill: C.amber, edge: C.amberDeep, text: CSS.amberInk },
    good: { fill: C.green, edge: C.greenDeep, text: CSS.white },
    calm: { fill: C.hull, edge: C.hullDeep, text: CSS.ink },
}

function paint(g: Phaser.GameObjects.Graphics, tone: Tone) {
    const { w, h } = HINT
    const face = FACE[tone]
    g.clear()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 18)
    g.fillStyle(face.edge, 1)
    g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 22)
    g.fillStyle(face.fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    g.fillStyle(C.white, 0.18)
    g.fillRoundedRect(-w / 2 + 12, -h / 2 + 8, w - 24, 12, 6)
}

export function createHint(scene: Phaser.Scene) {
    const root = scene.add
        .container(HINT.x + HINT.w / 2, HINT.y + HINT.h / 2)
        .setDepth(DEPTH.hint)
        .setAlpha(0)

    const face = scene.add.graphics()
    paint(face, 'calm')
    root.add(face)

    const label = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: HINT.w - 36 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(label)

    let writer: Typewriter | undefined
    let shown = false

    return {
        async say(text: string, tone: Tone = 'warn') {
            writer?.skip()
            paint(face, tone)
            label.setColor(FACE[tone].text)
            label.setText('')
            if (!shown) {
                shown = true
                root.setScale(0.94)
                void FX.to(scene, root, { alpha: 1, scale: 1 }, { duration: 200, ease: 'Back.easeOut' })
            } else {
                void FX.impact(scene, root, 0.06)
            }
            writer = FX.type(scene, label, text, { delay: 12 })
            await writer
        },

        hush() {
            if (!shown) return
            shown = false
            writer?.skip()
            void FX.to(scene, root, { alpha: 0 }, { duration: 180 })
        },

        bounds() {
            return { x: HINT.x + HINT.w / 2, y: HINT.y + HINT.h / 2, w: HINT.w + 24, h: HINT.h + 24 }
        },

        destroy() {
            writer?.skip()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Hint = ReturnType<typeof createHint>
