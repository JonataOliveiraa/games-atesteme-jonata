import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import { DEPTH, DRUM, H, REFUSE, W } from '../data/layout'
import type { HitKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  DOIS BOTÕES, E SÓ DOIS
 * ══════════════════════════════════════════════════════════════════════
 *
 * O tambor fica EMBAIXO DO ALVO, na esquerda: o que entra no círculo desce
 * direto para a mão que bate, e a criança não precisa cruzar a tela com o
 * olho. O "agora não" fica na ponta oposta, longe o bastante para não haver
 * toque trocado.
 *
 * A mão aberta diz "espera" melhor que um X: X é símbolo de escola, mão é
 * gesto, e gesto uma criança de 6 anos já sabe ler.
 */

const HEAD_DY = -DRUM.size * 0.21
const HEAD_RX = DRUM.size * 0.40
const HEAD_RY = DRUM.size * 0.19

export function createControls(scene: Phaser.Scene, onPress: (kind: HitKind) => void) {
    // ─────────────────────────────────────────────────────── o tambor

    const drum = scene.add.container(DRUM.x, DRUM.y).setDepth(DEPTH.button)

    const drumShadow = scene.add.graphics()
    drumShadow.fillStyle(C.ink, 0.18)
    drumShadow.fillEllipse(0, DRUM.size * 0.42, DRUM.size * 0.9, DRUM.size * 0.15)
    drum.add(drumShadow)

    /** O aro aceso é um CONTORNO, não um borrão: ele mostra o tambor, não o apaga. */
    const drumGlow = scene.add.graphics().setAlpha(0)
    for (let i = 0; i < 3; i++) {
        drumGlow.lineStyle(10 - i * 2, C.warn, 0.5 - i * 0.13)
        drumGlow.strokeEllipse(0, HEAD_DY, HEAD_RX * 2 + 26 + i * 20, HEAD_RY * 2 + 22 + i * 16)
    }
    drum.add(drumGlow)

    if (scene.textures.exists('tambor')) {
        const sprite = scene.add.image(0, 0, 'tambor')
        sprite.setDisplaySize(DRUM.size, DRUM.size)
        drum.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.coralDark, 1)
        g.fillEllipse(0, DRUM.size * 0.08, DRUM.size * 0.84, DRUM.size * 0.48)
        g.fillStyle(C.warn, 1)
        g.fillEllipse(0, HEAD_DY + 8, DRUM.size * 0.84, HEAD_RY * 2.3)
        g.fillStyle(C.cream, 1)
        g.fillEllipse(0, HEAD_DY, HEAD_RX * 2, HEAD_RY * 2)
        drum.add(g)
    }

    const headTint = scene.add.graphics().setAlpha(0)
    headTint.fillStyle(C.warn, 0.35)
    headTint.fillEllipse(0, HEAD_DY, HEAD_RX * 2 - 6, HEAD_RY * 2 - 6)
    drum.add(headTint)

    // ─────────────────────────────────────────────────────── o "agora não"

    const refuse = scene.add.container(REFUSE.x, REFUSE.y).setDepth(DEPTH.button)
    const r = REFUSE.r

    const refuseGlow = scene.add.graphics().setAlpha(0)
    for (let i = 0; i < 3; i++) {
        refuseGlow.lineStyle(9 - i * 2, C.bad, 0.5 - i * 0.13)
        refuseGlow.strokeCircle(0, 0, r + 16 + i * 15)
    }
    refuse.add(refuseGlow)

    const refuseG = scene.add.graphics()
    refuseG.fillStyle(C.ink, 0.2)
    refuseG.fillEllipse(0, r * 0.5, r * 1.9, r * 0.4)
    refuseG.fillStyle(C.ink, 1)
    refuseG.fillCircle(0, 0, r)
    refuseG.fillStyle(C.badDark, 1)
    refuseG.fillCircle(0, 0, r - 7)
    refuseG.fillStyle(C.bad, 1)
    refuseG.fillCircle(0, -6, r - 12)
    refuseG.fillStyle(C.white, 0.26)
    refuseG.fillEllipse(-r * 0.26, -r * 0.44, r * 0.72, r * 0.3)

    refuse.add(refuseG)

    // a mão aberta diz "espera" melhor que um X: X é símbolo de escola, mão é
    // gesto, e gesto uma criança de 6 anos já sabe ler
    if (scene.textures.exists('mao-silhueta')) {
        const hand = scene.add.image(0, -4, 'mao-silhueta')
        hand.setDisplaySize(r * 1.28, r * 1.28)
        refuse.add(hand)
    } else {
        const palmW = r * 0.62
        const palmH = r * 0.66
        refuseG.fillStyle(C.white, 1)
        refuseG.fillRoundedRect(-palmW / 2, -palmH * 0.18, palmW, palmH, palmW * 0.34)
        for (let i = 0; i < 4; i++) {
            const fx0 = -palmW / 2 + palmW * 0.12 + i * (palmW * 0.25)
            const len = palmH * (i === 0 || i === 3 ? 0.5 : 0.62)
            refuseG.fillRoundedRect(fx0, -palmH * 0.18 - len, palmW * 0.19, len + 8, palmW * 0.1)
        }
        refuseG.fillRoundedRect(palmW * 0.42, -palmH * 0.02, palmW * 0.3, palmW * 0.19, palmW * 0.1)
    }

    // ─────────────────────────────────────────────────────── o toque

    const zones: Phaser.GameObjects.Zone[] = []
    const addZone = (x: number, y: number, w: number, h: number, kind: HitKind) => {
        const zone = scene.add
            .zone(x, y, w, h)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(DEPTH.button + 5)
        zone.on('pointerdown', () => onPress(kind))
        zones.push(zone)
    }

    addZone(DRUM.x, DRUM.y + 30, DRUM.size * 1.2, H - DRUM.y + 150, 'yes')
    addZone(REFUSE.x, REFUSE.y + 10, r * 2.7, r * 2.9, 'no')

    function bounce(target: Phaser.GameObjects.Container, squash: number) {
        FX.kill(scene, fx(target))
        void FX.seq(
            () => FX.to(scene, fx(target), { scaleY: 1 - squash, scaleX: 1 + squash * 0.6 },
                { duration: 70 }),
            () => FX.to(scene, fx(target), { scaleY: 1, scaleX: 1 },
                { duration: 240, ease: Ease.back(3) }),
        )
    }

    return {
        /** Acende junto com o alvo. Os dois piscando dizem "pode bater". */
        arm() {
            FX.kill(scene, fx(drumGlow))
            FX.kill(scene, fx(headTint))
            drumGlow.setAlpha(1)
            headTint.setAlpha(0.7)
            FX.breathe(scene, fx(drumGlow), { grow: 1.06, duration: 420 })
        },
        disarm() {
            FX.kill(scene, fx(drumGlow))
            FX.kill(scene, fx(headTint))
            FX.kill(scene, fx(refuseGlow))
            drumGlow.setAlpha(0)
            headTint.setAlpha(0)
            refuseGlow.setAlpha(0)
        },

        /** A resposta ao toque acontece SEMPRE, mesmo quando o toque erra. */
        press(kind: HitKind) {
            if (kind === 'yes') {
                bounce(drum, 0.13)
                void FX.ping(scene, DRUM.x, DRUM.y + HEAD_DY, C.cream,
                    { radius: 82, duration: 300 })
                void FX.sparks(scene, DRUM.x, DRUM.y + HEAD_DY,
                    { color: C.warn, count: 8, spread: 110, duration: 380 })
            } else {
                bounce(refuse, 0.11)
                void FX.ping(scene, REFUSE.x, REFUSE.y, C.bad,
                    { radius: 72, duration: 300 })
            }
        },

        /** Pisca o botão certo depois de dois erros no mesmo passo. */
        hint(kind: HitKind) {
            const glow = kind === 'yes' ? drumGlow : refuseGlow
            FX.kill(scene, fx(glow))
            glow.setAlpha(1)
            FX.breathe(scene, fx(glow), { grow: 1.22, duration: 300 })
        },

        at(kind: HitKind) {
            return kind === 'yes'
                ? { x: DRUM.x, y: DRUM.y + HEAD_DY }
                : { x: REFUSE.x, y: REFUSE.y }
        },

        destroy() {
            FX.kill(scene, fx(drumGlow))
            FX.kill(scene, fx(headTint))
            FX.kill(scene, fx(refuseGlow))
            FX.kill(scene, fx(drum))
            FX.kill(scene, fx(refuse))
            zones.forEach(z => z.destroy())
            drum.destroy()
            refuse.destroy()
        },
    }
}

void W
