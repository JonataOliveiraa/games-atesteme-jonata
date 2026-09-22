import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { BALLOON, DEPTH, H, W } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * O BALÃO, e ele é raro de propósito.
 *
 * A tela não tem enunciado, não tem legenda de painel e não tem placar
 * escrito: o que a criança lê o tempo todo são desenhos. O balão só aparece
 * em dois momentos — quando ela cai (para dizer O QUE estava ali) e quando a
 * fase fecha. Uma frase que aparece sempre vira paisagem e ninguém lê.
 *
 * A moldura da tela piscando é o outro canal: verde acertou, vermelho caiu.
 * Ela dá o veredito antes de qualquer palavra, e para quem ainda não lê é o
 * único veredito.
 */
export function createTalk(scene: Phaser.Scene) {
    const container = scene.add.container(BALLOON.x, BALLOON.y).setDepth(DEPTH.balloon)
    const g = scene.add.graphics()
    const label = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: SIZE.balloon,
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: BALLOON.w - 60 },
    }).setOrigin(0.5).setResolution(2)
    container.add([g, label])
    container.setAlpha(0).setScale(0.9)

    const edge = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)

    let hideIn = 0

    function paint(accent: number) {
        const h = label.height + 44
        const w = Math.max(240, label.width + 64)
        g.clear()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 26)
        g.fillStyle(accent, 1)
        g.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 24)
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        g.fillTriangle(-18, h / 2 - 2, 18, h / 2 - 2, 0, h / 2 + 24)
    }

    return {
        /**
         * `atX` ancora o balão em quem está falando. Sem isso, a fala de
         * apresentação do skatista saía do meio da tela e o rabicho apontava
         * para o concreto vazio — o balão não tinha dono.
         */
        async say(text: string, accent = C.ok, holdMs = 2100, atX?: number) {
            label.setText(text)
            paint(accent)
            const meia = Math.max(240, label.width + 64) / 2
            container.x = atX === undefined
                ? BALLOON.x
                : Phaser.Math.Clamp(atX, 24 + meia, W - 24 - meia)
            hideIn = holdMs
            await FX.to(scene, fx(container), { alpha: 1, scale: 1 }, {
                duration: 220, ease: Ease.back(2),
            })
        },

        hush() {
            hideIn = 0
            if (container.alpha <= 0) return
            void FX.to(scene, fx(container), { alpha: 0, scale: 0.92 }, { duration: 160 })
        },

        /** Moldura da tela piscando: o veredito sem uma palavra. */
        flash(color: number) {
            edge.clear()
            for (let i = 0; i < 9; i++) {
                edge.fillStyle(color, 0.075)
                edge.fillRect(0, 0, W, 16 * (i + 1))
                edge.fillRect(0, H - 16 * (i + 1), W, 16 * (i + 1))
                edge.fillRect(0, 0, 20 * (i + 1), H)
                edge.fillRect(W - 20 * (i + 1), 0, 20 * (i + 1), H)
            }
            edge.setAlpha(0)
            void FX.to(scene, fx(edge), { alpha: 1 }, { duration: 140, yoyo: true })
        },

        update(delta: number) {
            if (hideIn <= 0) return
            hideIn -= delta
            if (hideIn <= 0) this.hush()
        },

        destroy() {
            FX.kill(scene, fx(container))
            FX.kill(scene, fx(edge))
            container.destroy(true)
            edge.destroy()
        },
    }
}
