import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { C, FONT, SIZE, LONG_CARD_TITLE, hex } from '../data/theme'
import { MURAL, CARD } from '../data/layout'
import type { Result } from '../types'
import {
    TEX, hasTex, fitImage, paintResultCard, createTypeMark, createPin,
    type CardState,
} from './effects'

/*
 * O MURAL.
 *
 * Mora fora do `effects.ts` porque ali dentro ficaria maior que todo o resto
 * somado. É um construtor como qualquer outro: a GameScene chama `apply` com a
 * lista nova e não toca em nenhum objeto interno.
 *
 * A regra que governa o arquivo: A SAÍDA VEM ANTES DA ENTRADA, e nunca ao mesmo
 * tempo. Cinco cartões chegando enquanto dois caem é uma bagunça em que nada se
 * lê — e é justamente o instante em que a criança precisa ver QUAIS saíram.
 */

interface CardView {
    id: string
    node: Phaser.GameObjects.Container
    surface: Phaser.GameObjects.Graphics
    pin: Phaser.GameObjects.Container
    readMark: Phaser.GameObjects.Graphics
    w: number
    h: number
    x: number
    y: number
    angle: number
    state: CardState
    read: boolean
}

export interface Mural {
    container: Phaser.GameObjects.Container
    /** Troca a faixa que o mural ocupa. Ver VISUAL.md §3. */
    setLayout(spec: { y: number; h: number }, big: boolean): void
    /** A parede reage. `how` decide o gesto de saída. */
    apply(next: string[], how: 'palavra' | 'filtro' | 'inicio'): Promise<void>
    shown(): string[]
    setState(id: string, state: CardState): void
    markRead(id: string): void
    setEnabled(on: boolean): void
    /** Posição absoluta do cartão, para a lupa voar até ele. */
    posOf(id: string): { x: number; y: number } | null
    showPrompt(text: string): void
    destroy(): void
}

export function createMural(
    scene: Phaser.Scene,
    results: Result[],
    onTap: (id: string) => void,
): Mural {
    const container = scene.add.container(0, 0).setDepth(30)

    const board = scene.add.graphics()
    container.add(board)

    const empty = scene.add.container(0, 0).setVisible(false)
    container.add(empty)

    const prompt = scene.add.text(640, 0, '', {
        fontFamily: FONT.black, fontSize: SIZE.prompt, color: hex(C.paper),
        align: 'center', wordWrap: { width: 700 },
    }).setOrigin(0.5).setResolution(2).setVisible(false)
    container.add(prompt)

    const byId = new Map<string, Result>(results.map(r => [r.id, r]))
    const cards = new Map<string, CardView>()

    let spec = MURAL.withoutFilters
    let big = false
    let list: string[] = []
    let enabled = true
    let gen = 0

    /* ── a parede ──────────────────────────────────────────────────── */

    const paintBoard = () => {
        board.clear()
        board.fillStyle(C.ink, 0.16)
        board.fillRoundedRect(MURAL.x, spec.y, MURAL.w, spec.h, MURAL.r)
        board.lineStyle(3, C.wood, 0.45)
        board.strokeRoundedRect(MURAL.x, spec.y, MURAL.w, spec.h, MURAL.r)
    }

    const centerY = () => spec.y + spec.h / 2

    /* ── onde cada cartão assenta ──────────────────────────────────── */

    const layoutOf = (ids: string[]) => {
        const n = ids.length
        if (n === 0) return []

        const cw = big ? CARD.bigW : (n > CARD.perRowMax ? CARD.wTight : CARD.w)
        const ch = big ? CARD.bigH : CARD.h
        const gap = big ? CARD.bigGap : CARD.gap
        const total = n * cw + (n - 1) * gap
        const startX = 640 - total / 2 + cw / 2
        const cy = centerY()

        return ids.map((id, i) => ({
            id,
            x: startX + i * (cw + gap),
            y: cy,
            w: cw,
            h: ch,
            /**
             * Ângulo próprio, derivado do índice e nunca sorteado.
             *
             * Papel pregado à mão não fica reto — mas um mural que dança a cada
             * repintura é pior do que um mural quadrado.
             */
            angle: ((i * 37) % (CARD.tilt * 2 + 1)) - CARD.tilt,
        }))
    }

    /* ── construção de um cartão ───────────────────────────────────── */

    const build = (id: string, x: number, y: number, w: number, h: number, angle: number): CardView => {
        const result = byId.get(id)!
        const node = scene.add.container(x, y).setAngle(angle)

        const surface = scene.add.graphics()
        paintResultCard(surface, w, h, CARD.r, { state: 'idle' })
        node.add(surface)

        const seloSize = big ? CARD.bigSeloSize : CARD.seloSize
        const selo = createTypeMark(scene, result.type, seloSize)
        selo.setPosition(0, big ? CARD.bigSeloDY : CARD.seloDY)
        node.add(selo)

        const title = scene.add.text(0, big ? CARD.bigTitleDY : CARD.titleDY, result.title, {
            fontFamily: FONT.black,
            fontSize: result.title.length > LONG_CARD_TITLE ? SIZE.cardTitleSmall : SIZE.cardTitle,
            color: hex(C.slate), align: 'center',
            wordWrap: { width: big ? CARD.bigTitleWrap : CARD.titleWrap },
        }).setOrigin(0.5).setResolution(2)
        node.add(title)

        const source = scene.add.text(0, big ? CARD.bigSourceDY : CARD.sourceDY, result.source, {
            fontFamily: FONT.body, fontStyle: 'bold', fontSize: SIZE.cardSource,
            color: hex(C.muted), align: 'center',
            wordWrap: { width: (big ? CARD.bigTitleWrap : CARD.titleWrap) + 20 },
        }).setOrigin(0.5).setResolution(2)
        node.add(source)

        // marca de "já li", canto superior direito
        const readMark = scene.add.graphics()
        readMark.fillStyle(C.search, 0.9)
        readMark.fillCircle(w / 2 - 24, -h / 2 + 22, CARD.readR)
        readMark.lineStyle(3, C.white, 0.9)
        readMark.strokeCircle(w / 2 - 24, -h / 2 + 22, CARD.readR)
        readMark.setVisible(false)
        node.add(readMark)

        const pin = createPin(scene, CARD.pinSize)
        pin.setPosition(0, -h / 2 - 6)
        node.add(pin)

        // A zona de toque é FILHA do cartão: precisa acompanhar o voo. Zona
        // parada deixaria o cartão inalcançável enquanto ele se move.
        const hit = scene.add.zone(0, 0, w, h).setOrigin(0.5).setInteractive({ useHandCursor: true })
        node.add(hit)

        const view: CardView = {
            id, node, surface, pin, readMark,
            w, h, x, y, angle, state: 'idle', read: false,
        }

        hit.on('pointerover', () => {
            if (!enabled || view.state !== 'idle') return
            paintResultCard(surface, w, h, CARD.r, { state: 'hover' })
            FX.to(scene, node, { scale: 1.05 }, { duration: 130 })
        })
        hit.on('pointerout', () => {
            if (!enabled || view.state !== 'idle') return
            paintResultCard(surface, w, h, CARD.r, { state: 'idle' })
            FX.to(scene, node, { scale: 1 }, { duration: 130 })
        })
        hit.on('pointerup', () => {
            if (!enabled || view.state !== 'idle') return
            FX.press(scene, node)
            onTap(id)
        })

        container.add(node)
        cards.set(id, view)
        return view
    }

    /* ── chegada ───────────────────────────────────────────────────── */

    const arrive = async (
        specs: Array<{ id: string; x: number; y: number; w: number; h: number; angle: number }>,
    ) => {
        if (!specs.length) return
        const mine = gen

        await FX.stagger(
            scene,
            specs.map(s => {
                // nasce acima da parede, fora da tela, com inclinação maior
                const view = build(s.id, s.x, s.y, s.w, s.h, s.angle)
                view.node.setPosition(s.x, -140).setAngle(s.angle * 3).setScale(0.82)
                view.pin.setAlpha(0).setY(-s.h / 2 - 70)
                return view.node
            }),
            async (node, i) => {
                if (mine !== gen) return
                const s = specs[i]
                const view = cards.get(s.id)
                if (!view) return

                await FX.all(
                    FX.arcTo(scene, node, { x: s.x, y: s.y }, { height: 90, duration: 420 }),
                    FX.to(scene, node, { angle: s.angle, scale: 1 }, { duration: 420, ease: Ease.smooth }),
                )
                if (mine !== gen) return

                // o pino desce e crava
                await FX.to(scene, view.pin, { alpha: 1, y: -s.h / 2 - 6 }, { duration: 160, ease: Ease.back(2.2) })
                FX.impact(scene, node, 0.16)
                void FX.sparks(scene, s.x, s.y - s.h / 2, {
                    color: C.corkDark, count: 6, spread: 60, size: 8, duration: 420,
                })
            },
            60,
        )
    }

    /* ── saída ─────────────────────────────────────────────────────── */

    const leave = async (ids: string[], how: 'palavra' | 'filtro' | 'inicio') => {
        if (!ids.length) return
        const mine = gen

        // Filtrar ANTES do stagger: se um id já não tem cartão, `ids[i]` deixa
        // de bater com o alvo `i` e a saída erra de cartão.
        const alive = ids.filter(id => cards.has(id))
        if (!alive.length) return

        await FX.stagger(
            scene,
            alive.map(id => cards.get(id)!.node),
            async (node, i) => {
                if (mine !== gen) return
                const view = cards.get(alive[i])
                if (!view) return

                paintResultCard(view.surface, view.w, view.h, CARD.r, { state: 'leaving' })

                if (how === 'filtro') {
                    // filtro tira porque é de OUTRO TIPO: o cartão desliza para
                    // a lateral. Movimento diferente para causa diferente, e a
                    // criança percebe a distinção sem ninguém dizer.
                    const dir = view.x < 640 ? -1 : 1
                    await FX.to(scene, node,
                        { x: view.x + dir * 520, alpha: 0 },
                        { duration: 340, ease: Ease.anticipate(1.1) })
                } else {
                    // O PINO SALTA PRIMEIRO, e só então o cartão tomba.
                    // O pino saltando é a causa, o cartão caindo é o efeito;
                    // invertê-los faz o cartão parecer que escorregou sozinho.
                    await FX.to(scene, view.pin,
                        { y: view.pin.y - 30, angle: 40, alpha: 0 },
                        { duration: 140, ease: Ease.back(2) })
                    await FX.to(scene, node,
                        { y: view.y + 90, angle: 14, alpha: 0 },
                        { duration: 320, ease: Ease.anticipate(1.2) })
                }

                node.destroy()
                cards.delete(alive[i])
            },
            60,
        )
    }

    /* ── estado vazio ──────────────────────────────────────────────── */

    const buildEmpty = () => {
        empty.removeAll(true)
        if (hasTex(scene, TEX.empty)) {
            const img = scene.add.image(0, 0, TEX.empty)
            fitImage(img, 190, 190)
            empty.add(img)
            return
        }
        // caixa aberta e vazia, desenhada. Neutra, não triste: zerar o mural é
        // uma lição, não um erro.
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillEllipse(0, 74, 170, 26)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(-80, -10, 160, 84, 10)
        g.fillStyle(C.woodLight, 0.5)
        g.fillRoundedRect(-72, -2, 144, 22, 8)
        g.fillStyle(C.corkDark, 1)
        g.fillRoundedRect(-104, -46, 44, 44, 8)
        g.fillRoundedRect(60, -46, 44, 44, 8)
        empty.add(g)
    }

    const showEmpty = (on: boolean) => {
        if (!on) {
            if (empty.visible) FX.fadeOut(scene, empty, { duration: 220, destroy: false })
                .then(() => empty.setVisible(false))
            return
        }
        buildEmpty()
        empty.setPosition(640, centerY()).setVisible(true)
        FX.popIn(scene, empty, { from: 0.6, duration: 340 })
    }

    /* ── API ───────────────────────────────────────────────────────── */

    paintBoard()

    return {
        container,

        setLayout: (next, isBig) => {
            spec = next
            big = isBig
            paintBoard()
            prompt.setY(centerY())
            empty.setPosition(640, centerY())
        },

        apply: async (next, how) => {
            const mine = ++gen

            const leaving = list.filter(id => !next.includes(id))
            const staying = list.filter(id => next.includes(id))
            const positions = layoutOf(next)
            const posById = new Map(positions.map(p => [p.id, p]))

            prompt.setVisible(false)

            await leave(leaving, how)
            if (mine !== gen) return

            // quem fica se reacomoda antes de a leva nova chegar
            if (staying.length) {
                await FX.all(...staying.map(id => {
                    const view = cards.get(id)
                    const p = posById.get(id)
                    if (!view || !p) return Promise.resolve()
                    view.x = p.x
                    view.y = p.y
                    return FX.to(scene, view.node, { x: p.x, y: p.y }, { duration: 260, ease: Ease.smooth })
                }))
            }
            if (mine !== gen) return

            const arriving = positions.filter(p => !staying.includes(p.id))
            await arrive(arriving)
            if (mine !== gen) return

            list = next
            showEmpty(next.length === 0 && how !== 'inicio')
        },

        shown: () => [...list],

        setState: (id, state) => {
            const view = cards.get(id)
            if (!view) return
            view.state = state
            paintResultCard(view.surface, view.w, view.h, CARD.r, { state })
        },

        markRead: id => {
            const view = cards.get(id)
            if (!view || view.read) return
            view.read = true
            view.readMark.setVisible(true)
            FX.popIn(scene, view.readMark, { from: 0.3, duration: 260 })
        },

        setEnabled: on => { enabled = on },

        posOf: id => {
            const view = cards.get(id)
            return view ? { x: view.x, y: view.y } : null
        },

        showPrompt: text => {
            // o convite e a caixa vazia nunca convivem: são respostas a
            // perguntas diferentes ("comece" x "essa busca não achou nada")
            empty.setVisible(false)
            prompt.setText(text).setY(centerY()).setVisible(true)
            FX.fadeIn(scene, prompt, 300)
        },

        destroy: () => {
            gen += 1
            cards.clear()
            container.destroy()
        },
    }
}
