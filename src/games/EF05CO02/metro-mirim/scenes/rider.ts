import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KEY, RIDERS_SHEET, RIDER_BOX, STATIONS_SHEET, STATION_BOX, fitArt } from '../data/art'
import { DEPTH, RIDER, W } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Rider, Station } from '../types'

/**
 * O passageiro: de onde ele sai (fica ali ao lado da estação) e para onde quer
 * ir (o prediozinho dentro do balão). Nenhuma palavra, nenhum número — a
 * pressa, quando existir, são pontinhos que apagam conforme o trem anda.
 */
export function createRider(scene: Phaser.Scene, rider: Rider, from: Station, to: Station) {
    const x = from.x + RIDER.dx
    const footY = from.y + RIDER.footDy
    const root = scene.add.container(x, footY).setDepth(DEPTH.rider)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, A.shadow)
    shadow.fillEllipse(0, 0, 118, 30)
    root.add(shadow)

    let body: Phaser.GameObjects.Sprite | null = null
    if (scene.textures.exists(KEY.riders)) {
        const box = RIDER_BOX[rider.art] ?? RIDER_BOX[0]
        const fit = fitArt(box, RIDERS_SHEET, { h: RIDER.height, w: 240 })
        body = scene.add.sprite(0, 0, KEY.riders, rider.art)
        body.setOrigin(fit.originX, fit.originY)
        body.setScale(fit.scale)
        root.add(body)
    } else {
        root.add(paintRider(scene))
    }

    /* ─────────────────────────── o balão do destino ───────────────────── */

    const balloon = scene.add.container(x, footY - RIDER.height - RIDER.balloonDy).setDepth(DEPTH.balloon)

    const bubble = scene.add.graphics()
    const paintBubble = (accent: number) => {
        bubble.clear()
        bubble.fillStyle(C.ink, 1)
        bubble.fillRoundedRect(-RIDER.balloonW / 2, -RIDER.balloonH / 2 + 4, RIDER.balloonW, RIDER.balloonH, 18)
        bubble.fillStyle(accent, 1)
        bubble.fillRoundedRect(-RIDER.balloonW / 2, -RIDER.balloonH / 2, RIDER.balloonW, RIDER.balloonH, 18)
        bubble.fillStyle(C.disc, 1)
        bubble.fillRoundedRect(-RIDER.balloonW / 2 + 6, -RIDER.balloonH / 2 + 6, RIDER.balloonW - 12, RIDER.balloonH - 12, 13)
        bubble.fillStyle(accent, 1)
        bubble.fillTriangle(-14, RIDER.balloonH / 2 - 4, 14, RIDER.balloonH / 2 - 4, 4, RIDER.balloonH / 2 + 22)
    }
    paintBubble(C.ink)
    balloon.add(bubble)

    if (scene.textures.exists(KEY.stations)) {
        const box = STATION_BOX[to.art] ?? STATION_BOX[0]
        const fit = fitArt(box, STATIONS_SHEET, { h: 80, w: 108 })
        const icon = scene.add.sprite(0, 34, KEY.stations, to.art)
        icon.setOrigin(fit.originX, fit.originY)
        icon.setScale(fit.scale)
        balloon.add(icon)
    } else {
        const tag = scene.add
            .text(0, 0, to.label, { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        balloon.add(tag)
    }

    /** Os pontinhos de pressa: quantos trilhos ele aguenta. */
    const dots = scene.add.graphics()
    let dotsLeft = rider.rush ?? 0
    const paintDots = () => {
        dots.clear()
        if (!rider.rush) return
        const total = rider.rush
        const start = -((total - 1) * RIDER.dotGap) / 2
        for (let i = 0; i < total; i++) {
            const dx = start + i * RIDER.dotGap
            dots.fillStyle(C.ink, 1)
            dots.fillCircle(dx, RIDER.balloonH / 2 + 30, RIDER.dotR + 3)
            dots.fillStyle(i < dotsLeft ? C.amber : C.city, 1)
            dots.fillCircle(dx, RIDER.balloonH / 2 + 30, RIDER.dotR)
        }
    }
    paintDots()
    balloon.add(dots)

    /* ────────────────────────────── o bilhete ─────────────────────────── */

    let note: Phaser.GameObjects.Container | null = null

    const clearNote = () => {
        if (!note) return
        FX.kill(scene, note)
        note.destroy(true)
        note = null
    }

    const place = (px: number, py: number) => {
        root.setPosition(px, py)
        balloon.setPosition(px, py - RIDER.height - RIDER.balloonDy)
    }

    return {
        id: rider.id,
        name: rider.name,
        from: rider.from,
        to: rider.to,
        x,
        y: footY - RIDER.height / 2,

        /**
         * Embarcou: anda até o trem e entra nele.
         *
         * O passo é o detalhe que faz a partida parecer uma cena e não um
         * corte: sem ele o passageiro sumia no lugar.
         */
        async board(to?: { x: number; y: number }) {
            void FX.to(scene, balloon, { alpha: 0 }, { duration: 200 })
            if (to) {
                if (to.x < root.x) body?.setFlipX(true)
                void FX.wiggle(scene, root, { deg: 3, duration: 420 })
                await FX.to(scene, root, { x: to.x, y: to.y }, { duration: 420, ease: 'Sine.inOut' })
                body?.setFlipX(false)
            }
            await FX.to(scene, root, { scale: 0.1 }, { duration: 260, ease: 'Back.in' })
            root.setAlpha(0)
        },

        /**
         * Chegou — e chega NO DESTINO, do lado direito da estação.
         *
         * Comemorar parado na origem era o que mais confundia: o trem ia, e a
         * criança continuava onde estava. `slot` separa quem desce no mesmo
         * lugar.
         */
        async arriveAt(point: { x: number; y: number }, slot = 0) {
            place(point.x + 150 + slot * 118, point.y + RIDER.footDy)
            body?.setFrame(rider.art + 4)
            balloon.setAlpha(0)
            root.setAlpha(1)
            root.setScale(0.2)
            void FX.ping(scene, root.x, point.y, C.green, { radius: 130, depth: DEPTH.rider - 1 })
            await FX.to(scene, root, { scale: 1 }, { duration: 320, ease: 'Back.out' })
        },

        /** Não chegou: volta para onde estava esperando. Nunca bravo. */
        strand() {
            place(x, footY)
            root.setAlpha(1)
            root.setScale(1)
            balloon.setAlpha(1)
            paintBubble(C.amber)
            void FX.wiggle(scene, root, { deg: 4, duration: 700 })
        },

        spendDot() {
            if (!rider.rush) return
            dotsLeft = Math.max(0, dotsLeft - 1)
            paintDots()
        },

        reset() {
            dotsLeft = rider.rush ?? 0
            paintDots()
            paintBubble(C.ink)
            body?.setFrame(rider.art)
            place(x, footY)
            root.setAlpha(1)
            root.setScale(1)
            balloon.setAlpha(1)
        },

        setDim(value: boolean) {
            root.setAlpha(value ? 0.4 : 1)
            balloon.setAlpha(value ? 0.4 : 1)
        },

        /**
         * A frase da TRAVA sai da boca de quem ficou parado — mas o lugar dela
         * vem de fora: quem sabe onde há espaço vazio é a cena, que conhece
         * todas as estações.
         */
        say(text: string, spot: { x: number; y: number }) {
            clearNote()
            const width = 400
            const nx = Phaser.Math.Clamp(spot.x, width / 2 + 16, W - width / 2 - 16)
            const ny = Phaser.Math.Clamp(spot.y, 150, 500)

            note = scene.add.container(nx, ny).setDepth(DEPTH.note).setScrollFactor(0)
            const label = scene.add
                .text(0, 0, text, {
                    fontFamily: FONT.body,
                    fontSize: '23px',
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: width - 48 },
                    lineSpacing: 6,
                })
                .setOrigin(0.5)
                .setResolution(2)

            const height = label.height + 42
            const panel = scene.add.graphics()
            panel.fillStyle(C.ink, 1)
            panel.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, 20)
            panel.fillStyle(C.amber, 1)
            panel.fillRoundedRect(-width / 2, -height / 2, width, height, 20)
            panel.fillStyle(C.disc, 1)
            panel.fillRoundedRect(-width / 2 + 7, -height / 2 + 7, width - 14, height - 14, 14)
            note.add([panel, label])
            FX.popIn(scene, note)
        },

        hush: clearNote,

        destroy() {
            clearNote()
            FX.kill(scene, root)
            FX.kill(scene, balloon)
            root.destroy(true)
            balloon.destroy(true)
        },
    }
}

function paintRider(scene: Phaser.Scene) {
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-26, -96, 52, 96, 22)
    g.fillStyle(C.blue, 1)
    g.fillRoundedRect(-21, -91, 42, 86, 18)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, -104, 28)
    g.fillStyle(C.disc, 1)
    g.fillCircle(0, -104, 23)
    return g
}

export type RiderView = ReturnType<typeof createRider>
