import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, TRAY, W, trayCx } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { SHEETS, has } from '../data/files'
import { MARK_FRAME, OBJ_FRAME, type Piece } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/** Uma peça da bandeja: ou um carimbo, ou uma letra, ou uma marca. */
export type TrayItem =
    | { kind: 'carimbo' }
    | Piece

export interface Tray {
    container: Phaser.GameObjects.Container
    /** Troca o conteúdo da moldura. `prompt` fala quando não há peça nenhuma. */
    show(items: TrayItem[], prompt?: string): Promise<void>
    setEnabled(on: boolean): void
    /** Esmaece a peça que acabou de dar errado. */
    dim(index: number): void
    /** Faz a peça certa brilhar — só depois do segundo erro. */
    shine(index: number): Promise<void>
    /** A peça salta da bandeja até a plaquinha e some. */
    launch(index: number, to: { x: number; y: number }): Promise<void>
    posOf(index: number): { x: number; y: number }
    box(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

interface Slot {
    container: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    paint(dimmed: boolean): void
}

/**
 * A BANDEJA — MÓVEL FIXO, CONTEÚDO TROCÁVEL
 *
 * A moldura nasce na `create()` e nunca some; o que troca são as peças. Um
 * painel que aparece e morre a cada passo deixa a tela inquieta e tira o
 * endereço fixo das coisas.
 *
 * E ela mostra SÓ o que a plaquinha precisa agora: os carimbos enquanto o slot
 * do selo está vazio, as letras (ou as marcas) depois. Nunca os dois — é isso
 * que segura a conta de alvos na tela.
 *
 * ANTES DA PRIMEIRA VIRADA ELA ESTÁ VAZIA, e é aí que mora a lição: não dá
 * para creditar sem olhar. A bandeja vazia com a frase "de quem é isso?" é a
 * recusa do jogo, e ela não custa uma vida nem um ponto — custa um toque na
 * obra.
 */
export function createTray(
    scene: Phaser.Scene,
    opts: { onPick: (index: number) => void },
): Tray {
    const container = scene.add.container(0, 0).setDepth(DEPTH.tray)

    /* A prateleira usa as cores amostradas do `bg-salao.png`: ela tem de
       pertencer à mesa, não flutuar na frente dela. */
    const prateleira = scene.add.graphics()
    /* Sombra projetada NA MESA, acima da prateleira: é ela que faz a bandeja
       pousar sobre o tampo em vez de flutuar na frente dele. */
    prateleira.fillStyle(C.shadow, 0.18)
    prateleira.fillRect(0, TRAY.y - 12, W, 14)
    prateleira.fillStyle(C.woodMid, 1)
    prateleira.fillRect(0, TRAY.y, W, TRAY.h)
    /* Bisel: luz em cima, sombra embaixo — a prateleira ganha espessura sem
       uma única textura nova. */
    prateleira.fillStyle(C.wood, 1)
    prateleira.fillRect(0, TRAY.y, W, 9)
    prateleira.fillStyle(C.woodDeep, 0.55)
    prateleira.fillRect(0, TRAY.y + 9, W, 4)
    prateleira.fillStyle(C.woodDeep, 1)
    prateleira.fillRect(0, TRAY.y + TRAY.h - 11, W, 11)
    prateleira.lineStyle(2, C.woodLine, 0.6)
    prateleira.lineBetween(0, TRAY.y, W, TRAY.y)
    container.add(prateleira)

    const prompt = scene.add
        .text(W / 2, TRAY.pieceCy, '', {
            fontFamily: FONT,
            fontSize: `${SIZE.prompt}px`,
            color: CSS.cream,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0)
    container.add(prompt)

    let slots: Slot[] = []
    let enabled = false

    const clearSlots = () => {
        slots.forEach(s => {
            s.zone.destroy()
            s.container.destroy()
        })
        slots = []
    }

    const buildSlot = (item: TrayItem, index: number, count: number): Slot => {
        const cx = trayCx(index, count)
        const cy = TRAY.pieceCy
        const node = scene.add.container(cx, cy)
        const g = scene.add.graphics()
        node.add(g)

        /**
         * A PEÇA É UM AZULEJO, NÃO UM RETÂNGULO BRANCO.
         *
         * Creme chapado não pertencia a lugar nenhum desta sala. Agora ela tem
         * o papel quente do verso por cima, uma base de madeira aparecendo
         * embaixo e uma linha de luz no topo — três faixas que dão espessura e
         * casam com as cores amostradas do `bg-salao.png`.
         */
        const paint = (dimmed: boolean) => {
            const w = TRAY.pieceW, h = TRAY.pieceH, r = TRAY.radius
            const a = dimmed ? 0.4 : 1
            g.clear()

            g.fillStyle(C.shadow, dimmed ? 0.07 : 0.26)
            g.fillRoundedRect(-w / 2 + 2, -h / 2 + 6, w, h, r)

            /* a base de madeira, que sobra 5 px embaixo */
            g.fillStyle(C.woodDeep, a)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, r)

            /* a face de papel */
            g.fillStyle(C.paper, a)
            g.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 8, r - 2)

            /* a luz no topo da face */
            g.fillStyle(C.cream, dimmed ? 0.3 : 0.85)
            g.fillRoundedRect(-w / 2 + 7, -h / 2 + 6, w - 14, 13, 6)

            g.lineStyle(2, C.woodLine, dimmed ? 0.25 : 0.55)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, r)
        }
        paint(false)

        const temFolha = has(scene, SHEETS.marcas.key)

        if (item.kind === 'letra') {
            node.add(
                scene.add
                    .text(0, 2, item.ch, {
                        fontFamily: FONT,
                        fontSize: `${SIZE.piece}px`,
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
        } else {
            const frame = item.kind === 'carimbo' ? OBJ_FRAME.carimbo : MARK_FRAME[item.id]
            if (temFolha) {
                const img = scene.add.image(0, 0, SHEETS.marcas.key, frame)
                img.setDisplaySize(TRAY.pieceH - 16, TRAY.pieceH - 16)
                node.add(img)
            } else {
                node.add(
                    scene.add
                        .text(0, 2, item.kind === 'carimbo' ? '◉' : '✶', {
                            fontFamily: FONT, fontSize: '46px', color: CSS.ink,
                        })
                        .setOrigin(0.5)
                        .setResolution(2),
                )
            }
        }

        /* Zona SOLTA, porque a peça muda de escala no gesto: um container que
           cresce no hover comeria o clique na margem. */
        const zone = scene.add
            .zone(cx, cy, TRAY.pieceW, TRAY.pieceH)
            .setOrigin(0.5)
            .setDepth(DEPTH.piece)
            .setInteractive({ useHandCursor: true })
        zone.input!.enabled = false
        zone.on('pointerover', () => { if (zone.input!.enabled) FX.hover(scene, fx(node), 1.07) })
        zone.on('pointerout', () => { if (zone.input!.enabled) FX.to(scene, fx(node), { scale: 1 }, { duration: 150 }) })
        zone.on('pointerdown', () => {
            if (!zone.input!.enabled) return
            void FX.press(scene, fx(node))
            opts.onPick(index)
        })

        container.add(node)
        return { container: node, zone, paint }
    }

    return {
        container,

        async show(items, promptText) {
            enabled = false
            const saindo = slots
            slots = []
            await FX.all(
                ...saindo.map(s => {
                    s.zone.input!.enabled = false
                    return FX.to(scene, fx(s.container), { alpha: 0, scale: 0.7 }, { duration: 160 })
                }),
            )
            saindo.forEach(s => { s.zone.destroy(); s.container.destroy() })

            prompt.setText(promptText ?? '')
            void FX.to(scene, fx(prompt), { alpha: promptText ? 1 : 0 }, { duration: 220 })

            if (!items.length) return

            slots = items.map((item, i) => buildSlot(item, i, items.length))
            slots.forEach(s => s.container.setAlpha(0).setScale(0.6))
            /* Escalonado: o olho pousa numa peça de cada vez, em vez de levar
               seis na cara ao mesmo tempo. */
            await FX.stagger(
                scene,
                slots.map(s => fx(s.container)),
                t => FX.to(scene, t, { alpha: 1, scale: 1 }, { duration: 260, ease: 'Back.easeOut' }),
                55,
            )
        },

        setEnabled(on) {
            enabled = on
            slots.forEach(s => { s.zone.input!.enabled = on })
        },

        dim(index) {
            slots[index]?.paint(true)
        },

        async shine(index) {
            const s = slots[index]
            if (!s) return
            await FX.to(scene, fx(s.container), { scale: 1.12 },
                { duration: 240, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
        },

        async launch(index, to) {
            const s = slots[index]
            if (!s) return
            s.zone.input!.enabled = false
            const clone = s.container

            /* A BANDEJA SOBE DE CAMADA ENQUANTO A PEÇA VOA.
               Ela mora em `DEPTH.tray` (20) e a plaquinha em 50: sem isto o
               carimbo faz o arco inteiro POR TRÁS do painel e some no meio do
               caminho. A bandeja e a plaquinha não se cruzam no chão da tela,
               então subir a bandeja por meio segundo não esconde nada. */
            container.setDepth(DEPTH.fly)

            /* A peça sai da bandeja e voa à plaquinha: o carimbo é o mesmo
               objeto que ela tocou, e é isso que costura os dois móveis. */
            await FX.to(scene, fx(clone), { y: clone.y - 30, scale: 1.16 },
                { duration: 150, ease: 'Back.easeOut' })
            await FX.arcTo(scene, fx(clone), to, { height: 120, duration: 320 })
            await FX.to(scene, fx(clone), { alpha: 0, scale: 0.45 }, { duration: 130 })

            container.setDepth(DEPTH.tray)
            clone.setAlpha(1).setScale(1).setPosition(trayCx(index, slots.length), TRAY.pieceCy)
            if (enabled) s.zone.input!.enabled = true
        },

        posOf(index) {
            return { x: trayCx(index, Math.max(slots.length, 1)), y: TRAY.pieceCy }
        },

        box() {
            return { x: W / 2, y: TRAY.y + TRAY.h / 2, w: W - 40, h: TRAY.h + 24 }
        },

        destroy() {
            clearSlots()
            container.destroy()
        },
    }
}

