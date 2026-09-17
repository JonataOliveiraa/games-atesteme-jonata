import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, MAP, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export type Gesture =
    | { kind: 'drag'; from: { x: number; y: number }; to: { x: number; y: number } }
    | { kind: 'tap'; at: { x: number; y: number } }
    | { kind: 'none' }

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O GUIA — ensina FAZENDO, e não lendo
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O tutorial de painel estava certo no conteúdo e errado na forma: quatro
 * telas de texto com botão "Próximo" ANTES de a criança tocar em qualquer
 * coisa, e depois a fase começava do zero, sem nada do que ela acabou de ler
 * na frente.
 *
 * Aqui não há painel, não há botão e **não há bloqueio**: uma frase curta em
 * cima, um dedo que repete o gesto exatamente onde ele acontece, e um anel
 * pulsando no alvo. A dica some sozinha no instante em que a criança faz —
 * quem já sabe nunca chega a ler.
 *
 * Tudo é `setScrollFactor(0)`: quem converte o mundo em tela é a GameScene,
 * que é quem conhece a câmera.
 */
export function createCoach(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.note).setScrollFactor(0).setAlpha(0)

    /* ─────────────────────────────── a frase ──────────────────────────── */

    const strip = scene.add.container(W / 2, MAP.y + 56)
    const plate = scene.add.graphics()
    const label = scene.add
        .text(0, 0, '', { fontFamily: FONT.black, fontSize: '27px', color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    strip.add([plate, label])
    root.add(strip)

    const paintPlate = () => {
        const w = label.width + 76
        const h = 68
        plate.clear()
        plate.fillStyle(C.ink, 1)
        plate.fillRoundedRect(-w / 2, -h / 2 + 5, w, h, h / 2)
        plate.fillStyle(C.amber, 1)
        plate.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        plate.fillStyle(C.disc, 1)
        plate.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, (h - 12) / 2)
    }

    /* ─────────────────────────── o dedo e o rastro ────────────────────── */

    const trail = scene.add.graphics()
    root.add(trail)

    const ring = scene.add.graphics()
    root.add(ring)

    const finger = scene.add.container(0, 0)
    const hand = scene.add.graphics()
    hand.fillStyle(C.ink, 0.35)
    hand.fillCircle(3, 5, 30)
    hand.fillStyle(C.disc, 1)
    hand.fillCircle(0, 0, 28)
    hand.fillStyle(C.blue, 1)
    hand.fillCircle(0, 0, 17)
    hand.fillStyle(C.white, 0.85)
    hand.fillCircle(-6, -7, 6)
    finger.add(hand)
    root.add(finger)

    let gesture: Gesture = { kind: 'none' }
    let loop: Phaser.Time.TimerEvent | null = null
    let target: { x: number; y: number } | null = null
    let pulse = 0

    const stopLoop = () => {
        loop?.remove()
        loop = null
        FX.kill(scene, finger)
    }

    const playOnce = () => {
        if (gesture.kind === 'none') return
        FX.kill(scene, finger)

        if (gesture.kind === 'tap') {
            finger.setPosition(gesture.at.x, gesture.at.y).setScale(1).setAlpha(1)
            void FX.to(scene, finger, { scale: 0.72 }, { duration: 340, yoyo: true, ease: 'Sine.inOut' })
            return
        }

        const { from, to } = gesture
        finger.setPosition(from.x, from.y).setScale(0.6).setAlpha(0)
        void FX.to(scene, finger, { scale: 1, alpha: 1 }, { duration: 260 }).then(() =>
            FX.to(scene, finger, { x: to.x, y: to.y }, { duration: 1000, ease: 'Sine.inOut' }).then(() =>
                FX.to(scene, finger, { alpha: 0, scale: 0.7 }, { duration: 280 }),
            ),
        )
    }

    const paintTrail = () => {
        trail.clear()
        if (gesture.kind !== 'drag') return
        const { from, to } = gesture
        const len = Math.hypot(to.x - from.x, to.y - from.y)
        const ux = (to.x - from.x) / len
        const uy = (to.y - from.y) / len
        for (let d = 34; d < len - 30; d += 30) {
            trail.fillStyle(C.disc, 0.55)
            trail.fillCircle(from.x + ux * d, from.y + uy * d, 5)
        }
    }

    const beat = () => {
        if (!target || root.alpha < 0.05) return
        pulse += 0.05
        const r = 66 + Math.sin(pulse) * 12
        ring.clear()
        ring.lineStyle(9, C.blue, 0.85)
        ring.strokeCircle(target.x, target.y, r)
        ring.lineStyle(5, C.disc, 0.7)
        ring.strokeCircle(target.x, target.y, r + 9)
    }
    scene.events.on('update', beat)

    return {
        /**
         * A dica inteira de uma vez: o que fazer, onde, e o anel do alvo.
         * Chamar de novo com os mesmos valores é barato — a GameScene refaz
         * isto a cada arraste do mapa, porque o alvo anda com a câmera.
         */
        show(text: string, next: Gesture, aim: { x: number; y: number } | null) {
            const changed = text !== label.text
            if (changed) {
                label.setText(text)
                paintPlate()
            }
            gesture = next
            target = aim
            if (!aim) ring.clear()
            paintTrail()

            if (root.alpha < 1) void FX.to(scene, root, { alpha: 1 }, { duration: 280 })
            if (changed || !loop) {
                stopLoop()
                playOnce()
                loop = scene.time.addEvent({ delay: 1900, loop: true, callback: playOnce })
            }
            if (changed) void FX.to(scene, strip, { scale: 1.06 }, { duration: 200, yoyo: true })
        },

        async hide() {
            stopLoop()
            gesture = { kind: 'none' }
            target = null
            ring.clear()
            trail.clear()
            await FX.to(scene, root, { alpha: 0 }, { duration: 260 })
        },

        destroy() {
            stopLoop()
            scene.events.off('update', beat)
            FX.kill(scene, root)
            root.destroy(true)
        },
    }
}

export type Coach = ReturnType<typeof createCoach>
