import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, TRAY } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A BANDEJA DE ETIQUETAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── TODAS AS ETIQUETAS SÃO IGUAIS ────────────────────────────────────────
 *
 * Mesma cor, mesmo tamanho, mesmo acabamento, e o pictograma é o MESMO em
 * todas: um furo de etiqueta, que não diz nada sobre o valor. O §1 do
 * TEXTURAS.md proíbe pintar `LARANJA` de laranja, e um pictograma por TIPO
 * seria a mesma falha por outro caminho — a criança acertaria pelo ícone sem
 * precisar ler o nome do campo, que é justamente o que o jogo mede.
 *
 * ── O TEXTO É MEDIDO, NÃO SUPOSTO ────────────────────────────────────────
 *
 * `CARANGUEJO` tem dez letras e `SÓ AVISTADO` tem onze com espaço. Em vez de
 * escolher um corpo de fonte que "deve caber", cada etiqueta mede o próprio
 * texto e encolhe se passar da largura útil. É o que evita a quebra de linha
 * que empilha texto em cima de texto.
 *
 * ── O ÍNDICE É A POSIÇÃO NA BANDEJA, E NÃO ANDA ──────────────────────────
 *
 * Etiqueta usada não sai do vetor: ela fica marcada como `used`. Removê-la
 * faria as posições seguintes escorregarem um lugar, e os manipuladores de
 * toque, que guardaram o índice na criação, passariam a responder pela
 * etiqueta errada.
 */

const FONT_SIZE = 38
const PAD_X = 26

export interface TrayOptions {
    onPick: (index: number) => void
}

interface Tag {
    value: string
    body: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    text: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
    home: { x: number; y: number }
    used: boolean
    pulse?: Phaser.Tweens.Tween
}

function paintTag(g: Phaser.GameObjects.Graphics, picked: boolean) {
    const { w, h } = TRAY
    g.clear()
    g.fillStyle(C.ink, 0.34)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 10, w, h, 20)
    g.fillStyle(picked ? C.aimDeep : C.ink, 1)
    g.fillRoundedRect(-w / 2 - 5, -h / 2 - 5, w + 10, h + 10, 24)
    g.fillStyle(C.paperDeep, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h - 8, 18)

    // o furo de etiqueta: o mesmo em todas, sem informação nenhuma
    g.fillStyle(C.paperEdge, 1)
    g.fillCircle(-w / 2 + 22, 0, 9)
    g.fillStyle(C.hullDeep, 1)
    g.fillCircle(-w / 2 + 22, 0, 5)

    if (!picked) return
    g.lineStyle(6, C.aim, 1)
    g.strokeRoundedRect(-w / 2 - 9, -h / 2 - 9, w + 18, h + 18, 26)
}

export function createTray(scene: Phaser.Scene, options: TrayOptions) {
    // a bandeja fica acima da ficha na pilha: é o que deixa a etiqueta voar
    // POR CIMA do papel sem precisar trocar de container no meio do voo
    const root = scene.add.container(0, 0).setDepth(DEPTH.tray)
    let tags: Tag[] = []
    let enabled = false
    let picked = -1

    const live = () => tags.filter(t => !t.used)

    const clear = () => {
        tags.forEach(tag => {
            tag.pulse?.remove()
            scene.tweens.killTweensOf(tag.body)
            tag.zone.destroy()
            tag.body.destroy(true)
        })
        tags = []
        picked = -1
    }

    const repaint = () =>
        tags.forEach((tag, i) => {
            if (!tag.used) paintTag(tag.face, i === picked)
        })

    return {
        async show(values: string[]) {
            clear()

            tags = values.slice(0, TRAY.xs.length).map((value, i) => {
                const home = { x: TRAY.xs[i], y: TRAY.cy }
                const body = scene.add.container(home.x, home.y)

                const face = scene.add.graphics()
                paintTag(face, false)
                body.add(face)

                const text = scene.add
                    .text(18, -3, value, {
                        fontFamily: FONT.black,
                        fontSize: `${FONT_SIZE}px`,
                        color: CSS.ink,
                        align: 'center',
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                const room = TRAY.w - PAD_X * 2 - 18
                if (text.width > room) text.setScale(room / text.width)
                body.add(text)

                // zona INTERNA: a etiqueta sobe ao ser escolhida e voa até o
                // campo, e uma zona solta ficaria parada onde ela estava
                const zone = scene.add
                    .zone(0, 0, TRAY.w + 12, TRAY.hit)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) options.onPick(i)
                })
                body.add(zone)

                root.add(body)
                return { value, body, face, text, zone, home, used: false }
            })

            tags.forEach(tag => tag.body.setScale(0.7).setAlpha(0))
            await FX.all(
                ...tags.map((tag, i) =>
                    FX.wait(scene, i * 90).then(() =>
                        FX.to(scene, tag.body, { scale: 1, alpha: 1 }, { duration: 300, ease: 'Back.easeOut' }),
                    ),
                ),
            )
        },

        /** A etiqueta escolhida levanta 8 px e ganha contorno ciano. */
        async select(index: number) {
            const tag = tags[index]
            if (!tag || tag.used || index === picked) return
            const before = tags[picked]
            picked = index
            repaint()
            if (before && !before.used) {
                void FX.to(scene, before.body, { y: before.home.y }, { duration: 140 })
            }
            await FX.to(scene, tag.body, { y: tag.home.y - 8 }, { duration: 140, ease: 'Sine.easeOut' })
        },

        async deselect() {
            const tag = tags[picked]
            picked = -1
            repaint()
            if (tag && !tag.used) await FX.to(scene, tag.body, { y: tag.home.y }, { duration: 140 })
        },

        picked() {
            return picked
        },

        valueAt(index: number) {
            return tags[index]?.value ?? ''
        },

        /** Onde na bandeja mora este valor. -1 se ele não está lá. */
        indexOf(value: string) {
            return tags.findIndex(t => !t.used && t.value === value)
        },

        /** A etiqueta aceita voa até o campo e some lá dentro. */
        async flyTo(index: number, to: { x: number; y: number }) {
            const tag = tags[index]
            if (!tag || tag.used) return
            tag.used = true
            picked = -1
            if (tag.zone.input) tag.zone.input.enabled = false
            await FX.arcTo(scene, tag.body, to, { height: 110, duration: 460 })
            if (!tag.body.active) return
            await FX.to(scene, tag.body, { scale: 0.45, alpha: 0 }, { duration: 170 })
            repaint()
        },

        /**
         * A etiqueta recusada volta ao lugar MAS CONTINUA ESCOLHIDA.
         *
         * É a TRAVA do §10: a seleção não se desfaz sozinha, para que só
         * tocar no campo certo destrave. Devolvê-la sem seleção faria a
         * criança recomeçar a escolha a cada tentativa.
         */
        async bounce(index: number) {
            const tag = tags[index]
            if (!tag || tag.used) return
            await FX.shake(scene, tag.body, { amount: 8, times: 2 })
            if (!tag.body.active) return
            await FX.to(scene, tag.body, { y: tag.home.y - 8 }, { duration: 160 })
        },

        /** Nada escolhido ainda: a bandeja inteira pede a vez. */
        async askFirst() {
            await FX.all(
                ...live().map((tag, i) =>
                    FX.wait(scene, i * 70).then(() =>
                        FX.to(scene, tag.body, { scale: 1.06 }, { duration: 180, yoyo: true }),
                    ),
                ),
            )
        },

        pulse(index: number) {
            const tag = tags[index]
            if (!tag || tag.used || tag.pulse) return
            tag.pulse = scene.tweens.add({
                targets: tag.body,
                scale: 1.06,
                duration: FX.ms(scene, 560),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        clearPulses() {
            tags.forEach(tag => {
                tag.pulse?.remove()
                tag.pulse = undefined
                if (!tag.used) tag.body.setScale(1)
            })
        },

        setEnabled(value: boolean) {
            enabled = value
            tags.forEach(tag => {
                if (tag.zone.input) tag.zone.input.enabled = value && !tag.used
            })
        },

        async hide() {
            const rest = live()
            if (!rest.length) {
                clear()
                return
            }
            await FX.all(...rest.map(tag => FX.to(scene, tag.body, { alpha: 0, scale: 0.8 }, { duration: 200 })))
            clear()
        },

        bounds() {
            const left = TRAY.xs[0] - TRAY.w / 2
            const right = TRAY.xs[TRAY.xs.length - 1] + TRAY.w / 2
            return {
                x: (left + right) / 2,
                y: TRAY.cy,
                w: right - left + 40,
                h: TRAY.h + 40,
            }
        },

        tagBounds(index: number) {
            const x = TRAY.xs[index] ?? TRAY.xs[0]
            return { x, y: TRAY.cy, w: TRAY.w + 30, h: TRAY.h + 30 }
        },

        clear,

        destroy() {
            clear()
            root.destroy(true)
        },
    }
}

export type Tray = ReturnType<typeof createTray>
