import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { ART, DEPTH } from '../data/layout'
import { A, C, CSS, FONT, FONT_NOTE, SIZE, TYPE_MS } from '../data/theme'
import { SHEETS, has } from '../data/files'
import { MARK_FRAME, OBJ_FRAME, SEAL_NOTE, type Obra } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Artwork {
    container: Phaser.GameObjects.Container
    /** Põe a obra na mesa, vinda da caixa. */
    deal(obra: Obra): Promise<void>
    /** Vira. Devolve o lado que ficou para cima. */
    flip(): Promise<'frente' | 'verso'>
    readonly facing: 'frente' | 'verso'
    /** Pulsa o verso: é lá que está a resposta, e é para lá que o erro aponta. */
    pulseVerso(): Promise<void>
    /** Volta para a frente e sobe para o vão. */
    riseTo(x: number, y: number, scale: number): Promise<void>
    setEnabled(on: boolean): void
    pos(): { x: number; y: number }
    box(): { x: number; y: number; w: number; h: number }
    versoBox(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

/**
 * A OBRA — E POR QUE ELA É UM CONTAINER COM DOIS FILHOS
 *
 * A frente é o PNG de `obras.png`; o verso é `Graphics` porque ele muda de
 * selo, de assinatura e de bilhete a cada fase. `FX.flip` escala o container em
 * X e troca os dois no meio do caminho, então os dois lados têm de estar
 * desenhados EM TORNO DE (0,0) — painter em coordenadas de tela dentro de um
 * container parado na origem sai voando ao ser escalado.
 */
export function createArtwork(
    scene: Phaser.Scene,
    opts: { onTap: () => void },
): Artwork {
    const container = scene.add.container(ART.cx, ART.cy).setDepth(DEPTH.art)

    const shadow = scene.add.graphics().setDepth(DEPTH.art - 1)

    const frente = scene.add.container(0, 0)
    const verso = scene.add.container(0, 0).setVisible(false)
    container.add([frente, verso])

    /* ── a frente ───────────────────────────────────────────────────────── */

    const molduraFrente = scene.add.graphics()
    frente.add(molduraFrente)

    let foto: Phaser.GameObjects.Image | undefined
    let fotoFallback: Phaser.GameObjects.Text | undefined

    const paintMoldura = (g: Phaser.GameObjects.Graphics) => {
        g.clear()
        const w = ART.w, h = ART.h, f = ART.frame
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-w / 2 - f, -h / 2 - f, w + f * 2, h + f * 2, ART.radius + 4)
        g.lineStyle(3, C.ink, 0.5)
        g.strokeRoundedRect(-w / 2 - f, -h / 2 - f, w + f * 2, h + f * 2, ART.radius + 4)
    }

    /* ── o verso ────────────────────────────────────────────────────────── */

    const cartao = scene.add.graphics()
    const selo = scene.add.image(0, 0, SHEETS.marcas.key, OBJ_FRAME.selo).setVisible(false)
    const seloAlt = scene.add.graphics()
    const marca = scene.add.image(0, 0, SHEETS.marcas.key, 0).setVisible(false)
    const marcaAlt = scene.add.text(0, 0, '', {
        fontFamily: FONT, fontSize: '54px', color: CSS.ink,
    }).setOrigin(0.5).setResolution(2).setVisible(false)
    /**
     * A LEGENDA DO SELO — PORQUE UM © NÃO DIZ O PRÓPRIO NOME.
     *
     * A criança de 10 anos nunca viu esse símbolo. Ele é o que ela vai
     * encontrar no rodapé de site e de livro a vida inteira, então tem de
     * aparecer com o que significa escrito do lado — toda vez que ela virar a
     * obra. É a mesma regra do álbum: ícone em miniatura não ensina nada.
     */
    const legenda = scene.add.text(0, 0, '', {
        fontFamily: FONT,
        fontSize: `${SIZE.sealNote}px`,
        color: CSS.inkSoft,
        align: 'left',
        wordWrap: { width: 300 },
    }).setOrigin(0, 0).setResolution(2).setVisible(false)

    const filete = scene.add.graphics()
    const bilhete = scene.add.text(0, 0, '', {
        fontFamily: FONT_NOTE,
        fontSize: `${SIZE.note}px`,
        color: CSS.inkSoft,
        fontStyle: 'italic',
        align: 'left',
        lineSpacing: 8,
        wordWrap: { width: ART.w - 56 },
    }).setOrigin(0, 0).setResolution(2)

    verso.add([cartao, seloAlt, selo, legenda, marca, marcaAlt, filete, bilhete])

    /* O verso tem de caber em 286 px de altura: o selo e a assinatura em cima,
       o filete no meio, e ATÉ QUATRO linhas de bilhete embaixo. Com a régua
       antiga (obra de 308) a quarta linha caía fora do cartão. */
    const SEAL_X = -ART.w / 2 + 62
    const SEAL_Y = -ART.h / 2 + 56
    /** A legenda pousa embaixo do selo, e é ela que empurra o filete. */
    const LEGEND_Y = SEAL_Y + 36
    const RULE_Y = -ART.h / 2 + 150
    const NOTE_Y = RULE_Y + 16

    const paintVerso = () => {
        const w = ART.w, h = ART.h, f = ART.frame
        cartao.clear()
        cartao.fillStyle(C.cream, 1)
        cartao.fillRoundedRect(-w / 2 - f, -h / 2 - f, w + f * 2, h + f * 2, ART.radius + 4)
        cartao.lineStyle(3, C.ink, 0.5)
        cartao.strokeRoundedRect(-w / 2 - f, -h / 2 - f, w + f * 2, h + f * 2, ART.radius + 4)
        /* O papel do verso é mais quente que a moldura: é o avesso da foto. */
        cartao.fillStyle(C.paper, 1)
        cartao.fillRoundedRect(-w / 2, -h / 2, w, h, ART.radius)

        filete.clear()
        filete.lineStyle(2, C.paperEdge, 1)
        filete.lineBetween(-w / 2 + 34, RULE_Y, w / 2 - 34, RULE_Y)
    }

    /** O selo desenhado, para quando `carimbos-e-marcas.png` não chegou. */
    const paintSeloAlt = (on: boolean) => {
        seloAlt.clear()
        if (!on) return
        seloAlt.lineStyle(7, C.ink, 1)
        seloAlt.strokeCircle(SEAL_X, SEAL_Y, 26)
    }

    /* ── montagem ───────────────────────────────────────────────────────── */

    let facing: 'frente' | 'verso' = 'frente'
    let current: Obra | undefined
    let typer: { skip(): void } | undefined

    const zone = scene.add
        .zone(ART.cx, ART.cy, ART.w + ART.frame * 2, ART.h + ART.frame * 2)
        .setOrigin(0.5)
        .setDepth(DEPTH.art + 1)
        .setInteractive({ useHandCursor: true })
    zone.input!.enabled = false
    zone.on('pointerover', () => { if (zone.input!.enabled) FX.hover(scene, fx(container), 1.02) })
    zone.on('pointerout', () => { if (zone.input!.enabled) FX.to(scene, fx(container), { scale: 1 }, { duration: 160 }) })
    zone.on('pointerdown', () => { if (zone.input!.enabled) opts.onTap() })

    const paintShadow = () => {
        shadow.clear()
        shadow.fillStyle(C.shadow, A.shadow)
        shadow.fillEllipse(ART.cx, ART.cy + ART.h / 2 + 22, ART.w * 0.82, 30)
    }

    const buildFrente = (obra: Obra) => {
        foto?.destroy()
        fotoFallback?.destroy()
        foto = undefined
        fotoFallback = undefined
        paintMoldura(molduraFrente)

        if (has(scene, SHEETS.obras.key)) {
            foto = scene.add.image(0, 0, SHEETS.obras.key, obra.frame)
            foto.setDisplaySize(ART.w, ART.h)
            frente.add(foto)
        } else {
            const g = scene.add.graphics()
            g.fillStyle(C.wallDeep, 1)
            g.fillRoundedRect(-ART.w / 2, -ART.h / 2, ART.w, ART.h, ART.radius)
            frente.add(g)
            fotoFallback = scene.add
                .text(0, 0, obra.title, {
                    fontFamily: FONT, fontSize: '34px', color: CSS.inkSoft,
                    align: 'center', wordWrap: { width: ART.w - 60 },
                })
                .setOrigin(0.5).setResolution(2)
            frente.add(fotoFallback)
        }
    }

    const buildVerso = (obra: Obra) => {
        paintVerso()

        const temFolha = has(scene, SHEETS.marcas.key)

        selo.setVisible(false)
        legenda.setVisible(false)
        paintSeloAlt(false)
        if (obra.seal !== 'nenhum') {
            const frame = obra.seal === 'credito' ? OBJ_FRAME.selo : OBJ_FRAME.cadeado
            if (temFolha) {
                selo.setFrame(frame).setPosition(SEAL_X, SEAL_Y)
                selo.setDisplaySize(62, 62).setVisible(true)
            } else {
                paintSeloAlt(true)
            }
            legenda
                .setText(SEAL_NOTE[obra.seal])
                .setPosition(-ART.w / 2 + 34, LEGEND_Y)
                .setVisible(true)
        }

        marca.setVisible(false)
        marcaAlt.setVisible(false)
        const sign = obra.sign
        if (sign?.kind === 'marca') {
            if (temFolha) {
                marca.setFrame(MARK_FRAME[sign.id])
                marca.setPosition(ART.w / 2 - 78, SEAL_Y).setDisplaySize(94, 94).setVisible(true)
            } else {
                marcaAlt.setText('✶').setPosition(ART.w / 2 - 78, SEAL_Y).setVisible(true)
            }
        } else if (sign?.kind === 'letras') {
            marcaAlt
                .setText(sign.text)
                .setStyle({ fontFamily: FONT, fontSize: '56px', color: CSS.ink })
                .setPosition(ART.w / 2 - 78 - (sign.text.length - 3) * 13, SEAL_Y)
                .setVisible(true)
        }

        bilhete.setText('').setPosition(-ART.w / 2 + 34, NOTE_Y)
    }

    return {
        container,

        async deal(obra) {
            current = obra
            facing = 'frente'
            typer?.skip()
            buildFrente(obra)
            buildVerso(obra)
            frente.setVisible(true)
            verso.setVisible(false)

            /* Ela vem DA CAIXA, à esquerda: a obra tem de ter uma origem, senão
               ela aparece do nada e não parece objeto de ninguém. */
            container.setPosition(180, ART.cy + 60).setScale(0.45).setAngle(-9).setAlpha(0)
            shadow.setAlpha(0)
            await FX.all(
                FX.to(scene, fx(container), { alpha: 1 }, { duration: 180 }),
                FX.to(scene, fx(container),
                    { x: ART.cx, y: ART.cy, scale: 1, angle: 0 },
                    { duration: 620, ease: 'Back.easeOut' }),
            )
            paintShadow()
            await FX.to(scene, fx(shadow), { alpha: 1 }, { duration: 200 })
            /* O balanço curto no fim é o que diz "pousou", e não "chegou". */
            await FX.to(scene, fx(container), { angle: 1.2 }, { duration: 140, yoyo: true })
        },

        get facing() {
            return facing
        },

        async flip() {
            const indo: 'frente' | 'verso' = facing === 'frente' ? 'verso' : 'frente'
            typer?.skip()
            await FX.flip(scene, fx(container), () => {
                facing = indo
                frente.setVisible(indo === 'frente')
                verso.setVisible(indo === 'verso')
            }, 340)

            if (indo === 'verso' && current) {
                /* A ordem da leitura é a ordem da cópia: primeiro o que se
                   copia (selo e assinatura), depois o bilhete. */
                const peças = [selo, legenda, marca, marcaAlt].filter(o => o.visible)
                peças.forEach(o => o.setAlpha(0))
                await FX.stagger(scene, peças.map(fx), t =>
                    FX.to(scene, t, { alpha: 1 }, { duration: 220 }), 110)
                if (current.note) typer = FX.type(scene, bilhete, current.note, { delay: TYPE_MS })
            }
            return indo
        },

        async pulseVerso() {
            /* `setDisplaySize` mexe em scaleX/scaleY, então a escala base de
               cada peça é diferente de 1 — pulsar "para 1.16" encolheria o
               selo. O alvo sai da escala que a peça já tem. */
            const alvos = [selo, marca, marcaAlt].filter(o => o.visible)
            if (!alvos.length) return
            await FX.all(
                ...alvos.map(o =>
                    FX.to(scene, fx(o),
                        { scaleX: o.scaleX * 1.18, scaleY: o.scaleY * 1.18 },
                        { duration: 170, yoyo: true, repeat: 1 })),
            )
        },

        async riseTo(x, y, scale) {
            zone.input!.enabled = false
            if (facing === 'verso') {
                await FX.flip(scene, fx(container), () => {
                    facing = 'frente'
                    frente.setVisible(true)
                    verso.setVisible(false)
                }, 300)
            }
            void FX.to(scene, fx(shadow), { alpha: 0 }, { duration: 260 })
            await FX.to(scene, fx(container), { y: ART.cy - 26 }, { duration: 200, ease: 'Sine.easeOut' })
            await FX.to(scene, fx(container),
                { x, y, scaleX: scale, scaleY: scale },
                { duration: 620, ease: 'Cubic.easeInOut' })
        },

        setEnabled(on) {
            /* `setVisible(false)` MATA o toque numa Zone: o interruptor é
               `input.enabled`. Já foi bug caro no catálogo. */
            zone.input!.enabled = on
        },

        pos() {
            return { x: container.x, y: container.y }
        },

        box() {
            return { x: ART.cx, y: ART.cy, w: ART.w + 30, h: ART.h + 30 }
        },

        /** A faixa do verso que decide a fase: o selo e a assinatura. */
        versoBox() {
            return { x: ART.cx, y: ART.cy + SEAL_Y, w: ART.w - 16, h: 150 }
        },

        destroy() {
            typer?.skip()
            zone.destroy()
            shadow.destroy()
            container.destroy()
        },
    }
}
