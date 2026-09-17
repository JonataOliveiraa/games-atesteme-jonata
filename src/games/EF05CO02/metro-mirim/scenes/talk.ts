import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KEY, RIDERS_SHEET, RIDER_BOX, STATIONS_SHEET, STATION_BOX, fitArt } from '../data/art'
import { DEPTH, H, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Rider, Station } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PRIMEIRO ATO: A CONVERSA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Antes de qualquer trilho, a criança conhece QUEM precisa viajar e PARA ONDE.
 * Isso morava num balãozinho de 100 px ao lado da estação e passava
 * despercebido; aqui cada passageiro chega andando, fala, e mostra o destino
 * num quadro grande. A fase só começa depois que todos falaram.
 *
 * Toque em qualquer lugar avança — quem já sabe não espera.
 */
export function createTalk(scene: Phaser.Scene) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.talk).setScrollFactor(0).setVisible(false)

    const veil = scene.add.graphics()
    veil.fillStyle(C.ink, 0.86)
    veil.fillRect(0, 0, W, H)
    veil.fillStyle(C.inkSoft, 1)
    veil.fillRect(0, H - 150, W, 150)
    veil.fillStyle(C.amber, 0.9)
    veil.fillRect(0, H - 150, W, 6)
    // a faixa amarela do chão de plataforma: detalhe pequeno que diz "estação"
    veil.fillStyle(C.amber, 0.25)
    for (let x = 0; x < W; x += 80) veil.fillRect(x, H - 132, 44, 10)
    root.add(veil)

    const title = scene.add
        .text(W / 2, 92, 'QUEM VAI VIAJAR HOJE', {
            fontFamily: FONT.black,
            fontSize: '34px',
            color: CSS.disc,
        })
        .setOrigin(0.5)
        .setResolution(2)
    title.setStroke(CSS.ink, 8)
    root.add(title)

    const stage = scene.add.container(0, 0)
    root.add(stage)

    const hint = scene.add
        .text(W / 2, H - 52, 'toque para continuar', {
            fontFamily: FONT.body,
            fontSize: '24px',
            color: CSS.disc,
        })
        .setOrigin(0.5)
        .setAlpha(0.75)
        .setResolution(2)
    root.add(hint)

    const tapZone = scene.add
        .zone(W / 2, H / 2, W, H)
        .setDepth(DEPTH.talk + 1)
        .setScrollFactor(0)
        .setInteractive()
        .setVisible(false)

    let pending: (() => void) | null = null
    let gen = 0

    const waitTap = () =>
        new Promise<void>(resolve => {
            const done = () => {
                tapZone.off('pointerdown', done)
                pending = null
                resolve()
            }
            pending = done
            tapZone.on('pointerdown', done)
        })

    return {
        async play(riders: Rider[], stationOf: (id: string) => Station) {
            const mine = ++gen
            root.setVisible(true)
            tapZone.setVisible(true)
            root.setAlpha(0)
            await FX.to(scene, root, { alpha: 1 }, { duration: 320 })

            for (const rider of riders) {
                if (mine !== gen) return
                stage.removeAll(true)
                FX.breathe(scene, hint, { grow: 1.06, duration: 1200 })

                const person = makePerson(scene, rider)
                person.setPosition(-180, H - 132)
                stage.add(person)

                const bubble = makeBubble(scene, rider, stationOf(rider.to))
                bubble.setPosition(790, 330).setAlpha(0)
                stage.add(bubble)

                await FX.to(scene, person, { x: 330 }, { duration: 620, ease: 'Sine.out' })
                FX.float(scene, person, { amount: 7, duration: 1600 })
                FX.popIn(scene, bubble)
                await FX.wait(scene, 240)

                await waitTap()
            }

            if (mine !== gen) return
            await FX.to(scene, root, { alpha: 0 }, { duration: 300 })
            root.setVisible(false)
            tapZone.setVisible(false)
            stage.removeAll(true)
        },

        /**
         * Corta a conversa pela raiz.
         *
         * Sem isto, uma fase que troca no meio da fala deixa um `await` que
         * nunca volta — e a próxima conversa fica dividindo o mesmo palco com
         * a anterior, cada toque resolvendo a espera errada.
         */
        cancel() {
            gen += 1
            pending?.()
            pending = null
            FX.kill(scene, root)
            root.setVisible(false)
            root.setAlpha(0)
            tapZone.setVisible(false)
            stage.removeAll(true)
        },

        destroy() {
            FX.kill(scene, root)
            tapZone.destroy()
            root.destroy(true)
        },
    }
}

/** O passageiro em tamanho de cena: 360 px de altura, pisando na plataforma. */
function makePerson(scene: Phaser.Scene, rider: Rider) {
    const person = scene.add.container(0, 0)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, 0.35)
    shadow.fillEllipse(0, 6, 190, 38)
    person.add(shadow)

    if (scene.textures.exists(KEY.riders)) {
        const box = RIDER_BOX[rider.art] ?? RIDER_BOX[0]
        const fit = fitArt(box, RIDERS_SHEET, { h: 360, w: 420 })
        const body = scene.add.sprite(0, 0, KEY.riders, rider.art)
        body.setOrigin(fit.originX, fit.originY)
        body.setScale(fit.scale)
        person.add(body)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-70, -260, 140, 260, 60)
        g.fillStyle(C.blue, 1)
        g.fillRoundedRect(-60, -250, 120, 240, 52)
        g.fillStyle(C.disc, 1)
        g.fillCircle(0, -286, 62)
        person.add(g)
    }

    const plate = scene.add.graphics()
    plate.fillStyle(C.ink, 1)
    plate.fillRoundedRect(-92, 14, 184, 52, 26)
    plate.fillStyle(C.amber, 1)
    plate.fillRoundedRect(-88, 18, 176, 44, 22)
    person.add(plate)

    const name = scene.add
        .text(0, 40, rider.name, { fontFamily: FONT.black, fontSize: '28px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    person.add(name)

    return person
}

/** O balão da fala, com o destino desenhado ao lado do texto. */
function makeBubble(scene: Phaser.Scene, rider: Rider, to: Station) {
    const bubble = scene.add.container(0, 0)
    const width = 640

    const line = scene.add
        .text(-width / 2 + 40, -40, rider.line, {
            fontFamily: FONT.body,
            fontSize: '30px',
            color: CSS.ink,
            wordWrap: { width: width - 220 },
            lineSpacing: 8,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)

    const height = Math.max(200, line.height + 150)

    const panel = scene.add.graphics()
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(-width / 2, -height / 2 + 8, width, height, 30)
    panel.fillStyle(C.disc, 1)
    panel.fillRoundedRect(-width / 2, -height / 2, width, height, 30)
    panel.fillStyle(C.disc, 1)
    panel.fillTriangle(-width / 2 + 10, -20, -width / 2 + 10, 60, -width / 2 - 64, 34)
    bubble.add([panel, line])

    const strip = scene.add.graphics()
    strip.fillStyle(C.cityDeep, 1)
    strip.fillRoundedRect(-width / 2 + 24, height / 2 - 108, width - 48, 88, 22)
    bubble.add(strip)

    const wants = scene.add
        .text(-width / 2 + 52, height / 2 - 64, 'quero ir', {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.inkSoft,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    bubble.add(wants)

    if (scene.textures.exists(KEY.stations)) {
        const box = STATION_BOX[to.art] ?? STATION_BOX[0]
        const fit = fitArt(box, STATIONS_SHEET, { h: 74, w: 100 })
        const icon = scene.add.sprite(-width / 2 + 258, height / 2 - 24, KEY.stations, to.art)
        icon.setOrigin(fit.originX, fit.originY)
        icon.setScale(fit.scale)
        bubble.add(icon)
    }

    const place = scene.add
        .text(-width / 2 + 330, height / 2 - 64, to.label, {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.ink,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    bubble.add(place)

    return bubble
}

export type Talk = ReturnType<typeof createTalk>
