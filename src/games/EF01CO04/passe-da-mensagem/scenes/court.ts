import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C } from '../data/theme'
import {
    COURT, DEPTH, DESTINATION, H, PLAQUE, PLAYER, SLOTS, W,
} from '../data/layout'
import { createMessageCard } from './cards'
import type { Message } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A QUADRA
 * ══════════════════════════════════════════════════════════════════════
 *
 * Vista de cima, ocupando tudo o que sobra do painel, e NÃO rola: a criança
 * precisa ver todas as plaquinhas ao mesmo tempo para poder comparar. Câmera
 * que segue alguém esconde metade das opções e transforma comparar em chutar.
 *
 * O campo inteiro é Graphics. Só o time, o robô e os assuntos são textura.
 */
export function createCourt(scene: Phaser.Scene) {
    const parts: Phaser.GameObjects.GameObject[] = []

    // ─────────────────────────────────────────────────────── o campo

    const field = scene.add.graphics().setDepth(DEPTH.field)
    const bottom = COURT.bottom
    const height = bottom - COURT.top

    field.fillStyle(C.fieldEdge, 1)
    field.fillRoundedRect(COURT.x - 6, COURT.top - 6, COURT.w + 12, height + 12, COURT.r + 6)
    field.fillStyle(C.field, 1)
    field.fillRoundedRect(COURT.x, COURT.top, COURT.w, height, COURT.r)

    // listras de grama cortada: dão profundidade sem competir com ninguém
    for (let i = 0; i < 8; i++) {
        if (i % 2) continue
        field.fillStyle(C.fieldDark, 0.35)
        field.fillRect(COURT.x + (COURT.w / 8) * i, COURT.top + 6, COURT.w / 8, height - 12)
    }

    field.lineStyle(7, C.fieldLine, 0.9)
    field.strokeRoundedRect(COURT.x + 22, COURT.top + 22, COURT.w - 44, height - 44, COURT.r - 10)
    field.lineBetween(W / 2, COURT.top + 22, W / 2, bottom - 22)
    field.strokeCircle(W / 2, (COURT.top + bottom) / 2, 96)
    field.fillStyle(C.fieldLine, 0.9)
    field.fillCircle(W / 2, (COURT.top + bottom) / 2, 10)
    parts.push(field)

    // ─────────────────────────────────────────────────────── as linhas de passe

    const lanes = scene.add.graphics().setDepth(DEPTH.lane)
    parts.push(lanes)

    // ─────────────────────────────────────────────────────── o destino

    const goal = scene.add.container(DESTINATION.x, DESTINATION.y).setDepth(DEPTH.plaque)
    const goalG = scene.add.graphics()
    const s = DESTINATION.size
    goalG.fillStyle(C.ink, 0.22)
    goalG.fillEllipse(6, s * 0.62, s * 1.05, 26)
    goalG.fillStyle(C.ink, 1)
    goalG.fillRoundedRect(-s / 2 - 7, -s / 2 - 7, s + 14, s + 14, 30)
    goalG.fillStyle(C.warnDark, 1)
    goalG.fillRoundedRect(-s / 2, -s / 2, s, s, 24)
    goalG.fillStyle(C.warn, 1)
    goalG.fillRoundedRect(-s / 2, -s / 2, s, s - 10, 24)
    // uma caixa de correio desenhada: a boca por onde a mensagem entra
    goalG.fillStyle(C.ink, 1)
    goalG.fillRoundedRect(-s * 0.3, -s * 0.16, s * 0.6, s * 0.17, 9)
    goalG.fillStyle(C.white, 0.5)
    goalG.fillRoundedRect(-s * 0.3, s * 0.12, s * 0.6, s * 0.1, 6)
    goal.add(goalG)
    parts.push(goal)

    let goalPulse: Phaser.Tweens.Tween | null = null

    // ─────────────────────────────────────────────────────── os colegas

    type Slot = {
        x: number
        y: number
        holder: Phaser.GameObjects.Container
        sprite: Phaser.GameObjects.Sprite | null
        plaque: Phaser.GameObjects.Container
        card: Phaser.GameObjects.Container | null
        zone: Phaser.GameObjects.Zone
        ring: Phaser.GameObjects.Graphics
    }

    let slots: Slot[] = []

    function clearSlots() {
        slots.forEach(slot => {
            FX.kill(scene, fx(slot.holder))
            FX.kill(scene, fx(slot.plaque))
            slot.zone.destroy()
            slot.holder.destroy()
            slot.plaque.destroy()
            slot.ring.destroy()
        })
        slots = []
    }

    function build(count: number, onTap: (index: number) => void) {
        clearSlots()
        const positions = SLOTS[count] ?? SLOTS[4]

        slots = positions.map(([x, y], i) => {
            const ring = scene.add.graphics().setDepth(DEPTH.shadow)
            ring.fillStyle(C.ink, 0.2)
            ring.fillEllipse(x, y + 6, PLAYER.h * 0.62, 24)
            // o holofote de quem está com a bola, apagado até chamarem por ele
            ring.fillStyle(C.warn, 0)
            ring.fillEllipse(x, y + 6, PLAYER.h * 1.05, 44)

            const holder = scene.add.container(x, y - PLAYER.h * PLAYER.footRatio)
                .setDepth(DEPTH.player)
            let sprite: Phaser.GameObjects.Sprite | null = null
            if (scene.textures.exists('personagens')) {
                sprite = scene.add.sprite(0, 0, 'personagens', i % 6)
                sprite.setDisplaySize(PLAYER.h * PLAYER.ratio, PLAYER.h)
                holder.add(sprite)
            } else {
                const g = scene.add.graphics()
                g.fillStyle(C.shirtDark, 1)
                g.fillRoundedRect(-42, -70, 84, 140, 26)
                holder.add(g)
            }

            const plaque = scene.add.container(x + PLAQUE.dx, y + PLAQUE.dy)
                .setDepth(DEPTH.plaque)

            const zone = scene.add
                .zone(x + PLAQUE.dx / 2, y - 84, 250, 210)
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .setDepth(DEPTH.plaque + 4)
            zone.on('pointerdown', () => onTap(i))

            return { x, y, holder, sprite, plaque, card: null, zone, ring }
        })
    }

    return {
        build,

        setPlaque(index: number, message: Message) {
            const slot = slots[index]
            if (!slot) return
            slot.card?.destroy()
            const card = createMessageCard(scene, message, PLAQUE.size, true)
            slot.plaque.add(card)
            slot.card = card
            card.setScale(0)
            void FX.to(scene, fx(card), { scale: 1 }, { duration: 260, ease: Ease.back(3) })
        },

        /** Onde a bola pousa quando chega neste colega. */
        at(index: number) {
            const slot = slots[index]
            return slot ? { x: slot.x, y: slot.y } : { x: W / 2, y: H / 2 }
        },

        plaqueAt(index: number) {
            const slot = slots[index]
            return slot
                ? { x: slot.plaque.x, y: slot.plaque.y }
                : { x: W / 2, y: H / 2 }
        },

        goalAt: () => ({ x: DESTINATION.x, y: DESTINATION.y }),

        count: () => slots.length,

        setEnabled(on: boolean) {
            slots.forEach(slot => {
                if (on) slot.zone.setInteractive({ useHandCursor: true })
                else slot.zone.disableInteractive()
            })
        },

        /**
         * Quem está com a bola não mostra plaquinha: a mensagem dele é a do
         * painel. Sem isso a criança poderia passar a bola para quem já está
         * com ela, e o passe não teria para onde ir.
         */
        setPlaqueVisible(index: number, on: boolean) {
            const slot = slots[index]
            if (!slot) return
            slot.plaque.setVisible(on)
            if (on) slot.zone.setInteractive({ useHandCursor: true })
            else slot.zone.disableInteractive()
        },

        /** Quem já foi recusado nesta parada fica apagado e sem toque. */
        block(index: number) {
            const slot = slots[index]
            if (!slot) return
            slot.zone.disableInteractive()
            slot.plaque.setAlpha(0.45)
            slot.holder.setAlpha(0.55)
        },

        unblockAll() {
            slots.forEach(slot => {
                slot.zone.setInteractive({ useHandCursor: true })
                slot.plaque.setAlpha(1)
                slot.holder.setAlpha(1)
            })
        },

        /**
         * O holofote. Quem esta com a bola precisa ser achado num relance —
         * antes o unico sinal era ele NAO ter plaquinha, e ausencia ninguem ve.
         */
        spotlight(index: number) {
            slots.forEach((slot, i) => {
                slot.ring.clear()
                slot.ring.fillStyle(C.ink, 0.2)
                slot.ring.fillEllipse(slot.x, slot.y + 6, PLAYER.h * 0.62, 24)
                if (i !== index) return
                slot.ring.fillStyle(C.warn, 0.32)
                slot.ring.fillEllipse(slot.x, slot.y + 8, PLAYER.h * 1.18, 52)
                slot.ring.lineStyle(7, C.warn, 0.95)
                slot.ring.strokeEllipse(slot.x, slot.y + 8, PLAYER.h * 1.18, 52)
            })
        },

        /** Depois de dois erros, o colega certo acena. */
        wave(index: number) {
            const slot = slots[index]
            if (!slot) return
            void FX.to(scene, fx(slot.holder), { angle: -8 },
                { duration: 160, yoyo: true, repeat: 5 })
            void FX.ping(scene, slot.plaque.x, slot.plaque.y, C.warn, { radius: 130 })
        },

        press(index: number) {
            const slot = slots[index]
            if (!slot) return
            void FX.seq(
                () => FX.to(scene, fx(slot.plaque), { scale: 0.9 }, { duration: 70 }),
                () => FX.to(scene, fx(slot.plaque), { scale: 1 },
                    { duration: 230, ease: Ease.back(3) }),
            )
        },

        /** O rastro do passe, desenhado enquanto a bola voa. */
        drawLane(from: { x: number; y: number }, to: { x: number; y: number }, color: number) {
            lanes.clear()
            lanes.lineStyle(16, C.ink, 0.18)
            lanes.lineBetween(from.x, from.y + 4, to.x, to.y + 4)
            lanes.lineStyle(10, color, 0.85)
            lanes.lineBetween(from.x, from.y, to.x, to.y)
        },

        /** A linha recusada fica tracejada: aquele caminho não serve mais. */
        drawBlocked(from: { x: number; y: number }, to: { x: number; y: number }) {
            lanes.clear()
            const steps = 18
            lanes.lineStyle(9, C.bad, 0.85)
            for (let i = 0; i < steps; i += 2) {
                const a = i / steps
                const b = Math.min(1, (i + 1) / steps)
                lanes.lineBetween(
                    from.x + (to.x - from.x) * a, from.y + (to.y - from.y) * a,
                    from.x + (to.x - from.x) * b, from.y + (to.y - from.y) * b,
                )
            }
        },

        clearLane() {
            lanes.clear()
        },

        armGoal(on: boolean) {
            if (goalPulse) {
                FX.kill(scene, fx(goal))
                goal.setScale(1)
                goalPulse = null
            }
            if (!on) return
            goalPulse = FX.breathe(scene, fx(goal), { grow: 1.1, duration: 620 })
        },

        destroy() {
            clearSlots()
            FX.kill(scene, fx(goal))
            parts.forEach(p => p.destroy())
        },
    }
}
