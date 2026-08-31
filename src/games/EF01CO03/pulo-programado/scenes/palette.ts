import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { CARD, DEPTH, GO, PALETTE, W } from '../data/layout'
import { createActionIcon } from './cards'
import type { ActionKind } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * A paleta e o VAI. As cartas são repetíveis: a mesma PULAR serve em quantos
 * marcos precisar — o que a criança monta é uma lista, não uma distribuição.
 *
 * O VAI só acende com a trilha cheia, e quando acende ele é a única coisa
 * pulsando na tela. Botão que pulsa sempre não convida para nada.
 */
export function createPalette(
    scene: Phaser.Scene,
    kinds: ActionKind[],
    onCard: (kind: ActionKind) => void,
    onGo: () => void,
) {
    const parts: Phaser.GameObjects.GameObject[] = []

    const panel = scene.add.graphics().setDepth(DEPTH.panel)
    panel.fillStyle(C.ink, 0.24)
    panel.fillRoundedRect(PALETTE.x, PALETTE.y + 8, PALETTE.w, PALETTE.h, PALETTE.r)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(PALETTE.x, PALETTE.y, PALETTE.w, PALETTE.h, PALETTE.r)
    panel.fillStyle(C.creamDeep, 1)
    panel.fillRoundedRect(PALETTE.x + 6, PALETTE.y + 6, PALETTE.w - 12, PALETTE.h - 12, PALETTE.r - 6)
    panel.fillStyle(C.cream, 1)
    panel.fillRoundedRect(PALETTE.x + 6, PALETTE.y + 6, PALETTE.w - 12, PALETTE.h - 20, PALETTE.r - 6)
    parts.push(panel)

    const spread = kinds.length === 3 ? CARD.xs : [CARD.xs[0] + 110, CARD.xs[1] + 110]

    const cards = kinds.map((kind, i) => {
        const x = spread[i] ?? CARD.xs[i]
        const holder = scene.add.container(x, CARD.cy).setDepth(DEPTH.card)
        const icon = createActionIcon(scene, kind, CARD.w, CARD.h)
        holder.add(icon)
        parts.push(holder)

        const zone = scene.add
            .zone(x, CARD.cy, CARD.w + 22, CARD.h + 22)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(DEPTH.card + 4)
        zone.on('pointerdown', () => {
            void FX.seq(
                () => FX.to(scene, fx(holder), { scaleY: 0.9, scaleX: 1.06 }, { duration: 70 }),
                () => FX.to(scene, fx(holder), { scaleY: 1, scaleX: 1 },
                    { duration: 220, ease: Ease.back(3) }),
            )
            onCard(kind)
        })
        parts.push(zone)

        return { kind, holder, x }
    })

    // ───────────────────────────────────────────────────────── o VAI

    const go = scene.add.container(GO.x, GO.y).setDepth(DEPTH.card)
    const goG = scene.add.graphics()
    const goText = scene.add.text(0, 2, 'VAI!', {
        fontFamily: FONT.black, fontSize: SIZE.go, color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    goText.setStroke(CSS.ink, 7)
    go.add([goG, goText])
    parts.push(go)

    function paintGo(on: boolean) {
        goG.clear()
        goG.fillStyle(C.ink, 0.24)
        goG.fillEllipse(0, GO.r * 0.46, GO.r * 1.9, GO.r * 0.4)
        goG.fillStyle(C.ink, 1)
        goG.fillCircle(0, 0, GO.r)
        goG.fillStyle(on ? C.okDark : 0x8b93a0, 1)
        goG.fillCircle(0, 0, GO.r - 7)
        goG.fillStyle(on ? C.ok : 0xa9b1bd, 1)
        goG.fillCircle(0, -6, GO.r - 12)
        goG.fillStyle(C.white, 0.26)
        goG.fillEllipse(-GO.r * 0.26, -GO.r * 0.44, GO.r * 0.72, GO.r * 0.3)
    }
    paintGo(false)

    const goZone = scene.add
        .zone(GO.x, GO.y, GO.r * 2.6, GO.r * 2.6)
        .setOrigin(0.5)
        .setDepth(DEPTH.card + 4)
    goZone.on('pointerdown', () => {
        void FX.seq(
            () => FX.to(scene, fx(go), { scale: 0.9 }, { duration: 70 }),
            () => FX.to(scene, fx(go), { scale: 1 }, { duration: 240, ease: Ease.back(3) }),
        )
        onGo()
    })
    parts.push(goZone)

    let ready = false
    let pulsing = false

    return {
        setReady(on: boolean) {
            if (ready === on) return
            ready = on
            paintGo(on)
            goText.setAlpha(on ? 1 : 0.7)
            if (on) {
                goZone.setInteractive({ useHandCursor: true })
                if (!pulsing) {
                    pulsing = true
                    FX.breathe(scene, fx(go), { grow: 1.07, duration: 620 })
                }
            } else {
                goZone.disableInteractive()
                if (pulsing) {
                    pulsing = false
                    FX.kill(scene, fx(go))
                    go.setScale(1)
                }
            }
        },

        setEnabled(on: boolean) {
            parts.forEach(p => {
                if (p instanceof Phaser.GameObjects.Zone) {
                    if (on) p.setInteractive({ useHandCursor: true })
                    else p.disableInteractive()
                }
            })
            if (!on) goZone.disableInteractive()
            else if (ready) goZone.setInteractive({ useHandCursor: true })
            cards.forEach(card => card.holder.setAlpha(on ? 1 : 0.55))
        },

        /** Pisca a carta certa depois de dois erros no mesmo quadrado. */
        hint(kind: ActionKind) {
            const card = cards.find(c => c.kind === kind)
            if (!card) return
            void FX.to(scene, fx(card.holder), { alpha: 0.4 },
                { duration: 180, yoyo: true, repeat: 3 })
            void FX.ping(scene, card.x, CARD.cy, C.warn, { radius: 130, duration: 420 })
        },

        at(kind: ActionKind) {
            const card = cards.find(c => c.kind === kind)
            return card ? { x: card.x, y: CARD.cy } : { x: W / 2, y: CARD.cy }
        },

        destroy() {
            FX.kill(scene, fx(go))
            cards.forEach(card => FX.kill(scene, fx(card.holder)))
            parts.forEach(p => p.destroy())
        },
    }
}
