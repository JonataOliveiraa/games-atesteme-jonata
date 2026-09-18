import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, PLAQUE } from '../data/layout'
import { A, C, CSS, FONT, SIZE } from '../data/theme'
import { SHEETS, has } from '../data/files'
import { MARK_FRAME, OBJ_FRAME, type MarkId, type Piece } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export interface Plaque {
    container: Phaser.GameObjects.Container
    reset(): void
    /** A tinta do carimbo aparece: afunda, respinga, fica.
     *  `silent` repõe sem animação, para depois de um erro. */
    ink(silent?: boolean): Promise<void>
    /** Mostra o que as peças formam até agora. */
    setDraft(picked: Piece[]): void
    /** Fecha em dourado. */
    lock(): Promise<void>
    /** Escorrega, cai e se desfaz. A plaquinha que não gruda. */
    drop(): Promise<void>
    setEnabled(on: boolean): void
    pos(): { x: number; y: number }
    box(): { x: number; y: number; w: number; h: number }
    stampPos(): { x: number; y: number }
    signPos(): { x: number; y: number }
    destroy(): void
}

/**
 * A PLAQUINHA — O FORMATO, QUE É SEMPRE O MESMO
 *
 * `[carimbo] · [assinatura]`, em toda fase e em todo nível. É o "formato que
 * considera os direitos autorais" do exemplo oficial da habilidade, e ele só
 * ensina porque não muda: a criança repete até virar hábito.
 *
 * Ela nasce VAZIA e visível — endereço fixo. Painel que aparece e some a cada
 * passo deixa a tela inquieta e tira o lugar das coisas.
 */
export function createPlaque(
    scene: Phaser.Scene,
    opts: { onTap: () => void },
): Plaque {
    const container = scene.add.container(PLAQUE.cx, PLAQUE.cy).setDepth(DEPTH.plaque)

    const shadow = scene.add.graphics()
    const corpo = scene.add.graphics()
    const slotStamp = scene.add.graphics()
    const tinta = scene.add.image(0, 0, SHEETS.marcas.key, OBJ_FRAME.selo).setVisible(false)
    const tintaAlt = scene.add.graphics()
    const marca = scene.add.image(0, 0, SHEETS.marcas.key, 0).setVisible(false)
    const nome = scene.add
        .text(PLAQUE.signDX, 0, '', {
            fontFamily: FONT,
            fontSize: `${SIZE.plaqueName}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)

    container.add([shadow, corpo, slotStamp, tintaAlt, tinta, marca, nome])

    let dourada = false

    const paint = () => {
        const w = PLAQUE.w, h = PLAQUE.h, r = PLAQUE.radius

        shadow.clear()
        shadow.fillStyle(C.shadow, A.shadow)
        shadow.fillRoundedRect(-w / 2 + 4, -h / 2 + 7, w, h, r)

        corpo.clear()
        corpo.fillStyle(dourada ? C.goldSoft : C.cream, 1)
        corpo.fillRoundedRect(-w / 2, -h / 2, w, h, r)
        corpo.lineStyle(dourada ? 5 : 3, dourada ? C.gold : C.paperEdge, 1)
        corpo.strokeRoundedRect(-w / 2, -h / 2, w, h, r)

        /* O lugar do carimbo é desenhado ANTES de existir tinta: a plaquinha
           mostra o que ainda falta, em vez de crescer quando chega. */
        slotStamp.clear()
        if (!tinta.visible && !tintaAlt.visible) {
            slotStamp.lineStyle(3, C.paperEdge, 1)
            slotStamp.strokeCircle(PLAQUE.stampDX, 0, 21)
        }
    }

    const zone = scene.add
        .zone(PLAQUE.cx, PLAQUE.cy, PLAQUE.w, PLAQUE.h + 14)
        .setOrigin(0.5)
        .setDepth(DEPTH.plaque + 1)
        .setInteractive({ useHandCursor: true })
    zone.input!.enabled = false
    zone.on('pointerdown', () => { if (zone.input!.enabled) opts.onTap() })

    paint()

    const clearInk = () => {
        tinta.setVisible(false)
        tintaAlt.clear()
        tintaAlt.setVisible(false)
    }

    return {
        container,

        reset() {
            dourada = false
            clearInk()
            marca.setVisible(false)
            nome.setText('').setVisible(true).setStyle({ color: CSS.ink })
            container.setPosition(PLAQUE.cx, PLAQUE.cy).setAngle(0).setAlpha(1).setScale(1)
            paint()
        },

        async ink(silent = false) {
            const temFolha = has(scene, SHEETS.marcas.key)

            if (temFolha) {
                tinta.setFrame(OBJ_FRAME.selo).setPosition(PLAQUE.stampDX, 0)
                tinta.setDisplaySize(46, 46).setVisible(true).setAlpha(0)
            } else {
                tintaAlt.clear()
                tintaAlt.lineStyle(5, C.ink, 1)
                tintaAlt.strokeCircle(PLAQUE.stampDX, 0, 19)
                tintaAlt.setVisible(true).setAlpha(0)
            }
            paint()

            /* A tinta chega GRANDE e assenta: é o único gesto com impacto no
               jogo, e é de propósito — carimbar tem de soar. A escala de
               repouso é a que o `setDisplaySize` deixou, então ela é lida
               ANTES de inflar. */
            const alvo = temFolha ? tinta : tintaAlt
            const sx = alvo.scaleX, sy = alvo.scaleY

            /* REPOR NÃO É CARIMBAR. Depois de um erro a plaquinha cai e se
               desfaz, mas o carimbo não foi o erro — ele volta calado, sem
               impacto e sem som, senão o jogo parece cobrar duas vezes. */
            if (silent) {
                alvo.setAlpha(1)
                return
            }

            alvo.setScale(sx * 1.7, sy * 1.7)

            await FX.all(
                FX.to(scene, fx(alvo), { alpha: 1 }, { duration: 100 }),
                FX.to(scene, fx(alvo), { scaleX: sx, scaleY: sy },
                    { duration: 260, ease: 'Back.easeOut' }),
            )
            void FX.ping(scene, PLAQUE.cx + PLAQUE.stampDX, PLAQUE.cy, C.gold,
                { radius: 54, duration: 420, depth: DEPTH.fx })
        },

        setDraft(picked) {
            const marcaPeça = picked.find(p => p.kind === 'marca') as
                | { kind: 'marca'; id: MarkId } | undefined

            if (marcaPeça) {
                nome.setText('')
                if (has(scene, SHEETS.marcas.key)) {
                    marca.setFrame(MARK_FRAME[marcaPeça.id])
                    marca.setPosition(PLAQUE.signDX, 0).setDisplaySize(52, 52).setVisible(true)
                } else {
                    nome.setText('✶')
                    marca.setVisible(false)
                }
            } else {
                marca.setVisible(false)
                nome.setText(picked.map(p => (p.kind === 'letra' ? p.ch : '')).join(''))
            }
        },

        async lock() {
            dourada = true
            paint()
            await FX.to(scene, fx(container), { scaleX: 1.05, scaleY: 1.05 },
                { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
            void FX.shine(scene, fx(container), { w: PLAQUE.w, h: PLAQUE.h, radius: PLAQUE.radius, duration: 620 })
        },

        async drop() {
            /* Ela ESCORREGA e cai — peça que não encaixa, nunca bronca. */
            await FX.to(scene, fx(container), { angle: -4, x: PLAQUE.cx - 10 }, { duration: 130 })
            await FX.to(scene, fx(container),
                { y: PLAQUE.cy + 120, angle: -16, alpha: 0 },
                { duration: 340, ease: 'Quad.easeIn' })
            clearInk()
            marca.setVisible(false)
            nome.setText('')
            paint()
            container.setPosition(PLAQUE.cx, PLAQUE.cy).setAngle(0)
            await FX.to(scene, fx(container), { alpha: 1 }, { duration: 220 })
        },

        setEnabled(on) {
            zone.input!.enabled = on
        },

        pos() {
            return { x: PLAQUE.cx, y: PLAQUE.cy }
        },

        box() {
            return { x: PLAQUE.cx, y: PLAQUE.cy, w: PLAQUE.w + 24, h: PLAQUE.h + 28 }
        },

        stampPos() {
            return { x: PLAQUE.cx + PLAQUE.stampDX, y: PLAQUE.cy }
        },

        signPos() {
            return { x: PLAQUE.cx + PLAQUE.signDX, y: PLAQUE.cy }
        },

        destroy() {
            zone.destroy()
            container.destroy()
        },
    }
}
