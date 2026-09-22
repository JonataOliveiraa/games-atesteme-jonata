import Phaser from 'phaser'
import { KIT, W, cardCentros } from '../data/layout'
import { C, FONT, HEX } from '../data/theme'
import { ferramenta } from '../data/ferramentas'
import { boxOf, cutSheet, type Sheet } from './sheet'

export interface Kit {
    montar(ids: string[], fala: string): Promise<void>
    subir(): void
    descer(): void
    setEnabled(v: boolean): void
    selecionar(id: string | null): void
    esmaecer(id: string): void
    limparEsmaecidos(): void
    tremer(id: string): void
    pulsar(id: string): void
    pararPulso(): void
    gastar(id: string): Promise<void>
    piscar(id: string): void
    posDa(id: string): { x: number; y: number }
    posDoOk(): { x: number; y: number }
    calarExagero(): void
    exageroFrame(frame: number): void
    destroy(): void
}

interface Hooks {
    onPick: (id: string) => void
    onConfirm: () => void
}

/**
 * O anel saiu da carta. A previsão de alcance agora é o círculo DE VERDADE
 * desenhado no mapa quando a criança toca — um anel em escala dentro de um
 * cartão de 200 px nunca ia dizer "até onde", e ainda enchia a mesa.
 */
export function createKit(scene: Phaser.Scene, hooks: Hooks): Kit {
    const sheetF: Sheet | null = cutSheet(scene, 'ferramentas', 4, 3)
    const sheetE: Sheet | null = cutSheet(scene, 'exagero', 5, 1)

    /*
     * ELE NASCE EMBAIXO DA TELA.
     *
     * Antes o painel já estava montado no primeiro quadro, vazio, e ficava ali
     * durante a volta da vila até o dia começar — uma tábua marrom atravessada
     * na paisagem que o jogo estava justamente apresentando. Quem manda ele
     * subir é a cena, depois que as casas acendem.
     */
    const root = scene.add.container(0, KIT.h + 26).setDepth(200).setScrollFactor(0)

    const painel = scene.add.graphics()
    painel.fillStyle(C.ink, 0.22)
    painel.fillRect(0, KIT.top - 10, W, 10)
    painel.fillStyle(C.terraEscura, 1)
    painel.fillRect(0, KIT.top, W, KIT.h)
    painel.fillStyle(C.warnDark, 0.45)
    painel.fillRect(0, KIT.top, W, 6)
    root.add(painel)

    interface Carta {
        id: string
        cx: number
        container: Phaser.GameObjects.Container
        corpo: Phaser.GameObjects.Graphics
        img?: Phaser.GameObjects.Image
        nome: Phaser.GameObjects.Text
        zona: Phaser.GameObjects.Zone
        fraca: boolean
    }

    let cartas: Carta[] = []
    let habilitado = false
    let selecionada: string | null = null

    // ── o botão de confirmar ──────────────────────────────────────────────
    const ok = scene.add.container(KIT.okX, KIT.okY).setScrollFactor(0).setVisible(false)
    root.add(ok)
    const okBg = scene.add.graphics()
    ok.add(okBg)
    const okSeta = scene.add.graphics()
    ok.add(okSeta)
    const okTexto = scene.add
        .text(0, 32, 'IR!', { fontFamily: FONT.black, fontSize: '38px', color: HEX.white })
        .setOrigin(0.5)
    ok.add(okTexto)

    okBg.fillStyle(C.ink, 0.3)
    okBg.fillRoundedRect(-KIT.okW / 2 + 5, -KIT.okH / 2 + 7, KIT.okW, KIT.okH, 22)
    okBg.fillStyle(C.ok, 1)
    okBg.fillRoundedRect(-KIT.okW / 2, -KIT.okH / 2, KIT.okW, KIT.okH, 22)
    okBg.lineStyle(5, C.white, 0.9)
    okBg.strokeRoundedRect(-KIT.okW / 2, -KIT.okH / 2, KIT.okW, KIT.okH, 22)
    okSeta.fillStyle(C.white, 1)
    okSeta.fillTriangle(-28, -54, -28, -8, 30, -31)

    const okZona = scene.add
        .zone(KIT.okX, KIT.okY, KIT.okW, KIT.okH)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(222)
        .setInteractive({ useHandCursor: true })
    okZona.on('pointerdown', () => {
        if (!habilitado || !selecionada) return
        scene.tweens.add({ targets: ok, scale: 0.92, duration: 90, yoyo: true })
        hooks.onConfirm()
    })
    if (okZona.input) okZona.input.enabled = false

    // ── o Sr. Exagero ─────────────────────────────────────────────────────
    const exagero = scene.add.container(0, 0).setDepth(210).setScrollFactor(0)
    const carrinho = scene.add.image(0, 0, 'exagero', '4').setOrigin(0.5, 1).setVisible(false)
    const vendedor = scene.add.image(0, 0, 'exagero', '0').setOrigin(0.5, 1).setVisible(false)
    exagero.add([carrinho, vendedor])

    if (scene.textures.exists('exagero') && sheetE) {
        const escala = (frame: number, alvo: number) => {
            const box = boxOf(sheetE, frame)
            return alvo / (box.height * sheetE.frameH)
        }
        carrinho.setScale(escala(4, 68)).setVisible(true)
        vendedor.setScale(escala(0, 112)).setVisible(true)
    }

    const falaExagero = scene.add.container(0, 0).setDepth(230).setScrollFactor(0).setVisible(false)
    const falaBg = scene.add.graphics()
    const falaTexto = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: '22px',
            color: HEX.ink,
            align: 'left',
            wordWrap: { width: 330 },
        })
        .setOrigin(0, 0.5)
    falaExagero.add([falaBg, falaTexto])

    const desenharCorpo = (c: Carta) => {
        const w = KIT.cardW
        const h = KIT.cardH
        const sel = selecionada === c.id
        const g = c.corpo
        g.clear()
        g.fillStyle(C.ink, 0.3)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 18)
        g.fillStyle(c.fraca ? C.terra : C.card, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
        g.lineStyle(sel ? 8 : 4, sel ? C.ok : c.fraca ? C.terraEscura : C.cardBorda, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)
    }

    const criarCarta = (id: string, cx: number): Carta => {
        const f = ferramenta(id)
        const container = scene.add.container(cx, KIT.cardY)
        root.add(container)

        const corpo = scene.add.graphics()
        container.add(corpo)

        let img: Phaser.GameObjects.Image | undefined
        if (scene.textures.exists('ferramentas') && sheetF) {
            const box = boxOf(sheetF, f.frame)
            const escala = Math.min(
                126 / (box.width * sheetF.frameW),
                86 / (box.height * sheetF.frameH),
            )
            const dx = (box.left + box.width / 2 - 0.5) * sheetF.frameW * escala
            const dy = (box.top + box.height / 2 - 0.5) * sheetF.frameH * escala
            img = scene.add
                .image(-dx, KIT.imgY - KIT.cardY - dy, 'ferramentas', String(f.frame))
                .setOrigin(0.5)
                .setScale(escala)
            container.add(img)
        }

        const nome = scene.add
            .text(0, KIT.nomeY - KIT.cardY, f.nome, {
                fontFamily: FONT.black,
                fontSize: `${KIT.nomeSize}px`,
                color: HEX.ink,
                align: 'center',
            })
            .setOrigin(0.5)
        if (nome.width > KIT.cardW - 18) nome.setScale((KIT.cardW - 18) / nome.width)
        container.add(nome)

        const zona = scene.add
            .zone(cx, KIT.cardY, KIT.cardW, KIT.cardH)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(220)
            .setInteractive({ useHandCursor: true })

        const carta: Carta = { id, cx, container, corpo, img, nome, zona, fraca: false }
        desenharCorpo(carta)

        zona.on('pointerdown', () => {
            if (!habilitado) return
            scene.tweens.add({
                targets: container,
                y: KIT.cardY - 8,
                duration: 110,
                yoyo: true,
                ease: 'Back.easeOut',
            })
            hooks.onPick(id)
        })

        return carta
    }

    const acharCarta = (id: string) => cartas.find(c => c.id === id)

    const api: Kit = {
        montar: (ids, fala) =>
            new Promise(resolve => {
                cartas.forEach(c => {
                    c.zona.destroy()
                    c.container.destroy()
                })
                cartas = []
                selecionada = null
                ok.setVisible(false)
                if (okZona.input) okZona.input.enabled = false

                const centros = cardCentros(ids.length)
                cartas = ids.map((id, i) => criarCarta(id, centros[i]))

                /* O container guarda o deslocamento da saída do dia anterior. */
                scene.tweens.killTweensOf([exagero, falaExagero])
                exagero.setPosition(0, 0).setAlpha(0)
                carrinho.setPosition(W - 92, KIT.top - 4)
                vendedor.setPosition(W - 182, KIT.top - 2)
                scene.tweens.add({ targets: exagero, alpha: 1, duration: 260 })

                cartas.forEach((c, i) => {
                    c.container.setAlpha(0).setY(KIT.cardY - 44)
                    scene.tweens.add({
                        targets: c.container,
                        alpha: 1,
                        y: KIT.cardY,
                        duration: 240,
                        delay: i * 90,
                        ease: 'Back.easeOut',
                    })
                })

                if (fala) {
                    falaTexto.setText(fala)
                    const w = falaTexto.width + 34
                    const h = falaTexto.height + 26
                    falaBg.clear()
                    falaBg.fillStyle(C.card, 1)
                    falaBg.fillRoundedRect(-17, -h / 2, w, h, 14)
                    falaBg.lineStyle(3, C.cardBorda, 1)
                    falaBg.strokeRoundedRect(-17, -h / 2, w, h, 14)
                    falaExagero
                        .setPosition(W - 196 - w, KIT.top - 126)
                        .setVisible(true)
                        .setAlpha(0)
                    scene.tweens.add({ targets: falaExagero, alpha: 1, duration: 200, delay: 280 })
                }

                /* Ele entrega o kit e vai embora, e a fala vai junto. */
                scene.time.delayedCall(3000, () => {
                    scene.tweens.add({
                        targets: [exagero, falaExagero],
                        alpha: 0,
                        duration: 380,
                        ease: 'Cubic.easeIn',
                        onComplete: () => falaExagero.setVisible(false),
                    })
                    scene.tweens.add({ targets: exagero, x: 300, duration: 380, ease: 'Cubic.easeIn' })
                })

                scene.time.delayedCall(ids.length * 90 + 340, () => resolve())
            }),

        subir: () => {
            root.setVisible(true)
            scene.tweens.add({ targets: root, y: 0, duration: 280, ease: 'Cubic.easeOut' })
        },

        descer: () => {
            api.setEnabled(false)
            falaExagero.setVisible(false)
            scene.tweens.add({ targets: root, y: KIT.h + 26, duration: 260, ease: 'Cubic.easeIn' })
        },

        setEnabled: v => {
            habilitado = v
            cartas.forEach(c => {
                if (c.zona.input) c.zona.input.enabled = v
            })
            if (okZona.input) okZona.input.enabled = v && selecionada !== null
        },

        selecionar: id => {
            selecionada = id
            cartas.forEach(desenharCorpo)
            if (okZona.input) okZona.input.enabled = habilitado && id !== null

            if (!id) {
                ok.setVisible(false)
                return
            }
            if (!ok.visible) {
                ok.setVisible(true).setAlpha(0).setScale(0.8)
                scene.tweens.add({
                    targets: ok,
                    alpha: 1,
                    scale: 1,
                    duration: 240,
                    ease: 'Back.easeOut',
                })
            }
        },

        esmaecer: id => {
            const c = acharCarta(id)
            if (!c) return
            c.fraca = true
            desenharCorpo(c)
            c.img?.setAlpha(0.4)
            c.nome.setAlpha(0.45)
        },

        limparEsmaecidos: () => {
            cartas.forEach(c => {
                c.fraca = false
                desenharCorpo(c)
                c.img?.setAlpha(1)
                c.nome.setAlpha(1)
            })
        },

        tremer: id => {
            const c = acharCarta(id)
            if (!c) return
            scene.tweens.add({
                targets: c.container,
                x: { from: c.cx - 9, to: c.cx + 9 },
                duration: 55,
                yoyo: true,
                repeat: 4,
                onComplete: () => c.container.setX(c.cx),
            })
        },

        pulsar: id => {
            const c = acharCarta(id)
            if (!c) return
            scene.tweens.add({
                targets: c.container,
                scale: { from: 1, to: 1.07 },
                duration: 420,
                yoyo: true,
                repeat: -1,
            })
        },

        pararPulso: () => {
            cartas.forEach(c => {
                scene.tweens.killTweensOf(c.container)
                c.container.setScale(1).setPosition(c.cx, KIT.cardY)
            })
        },

        gastar: id =>
            new Promise(resolve => {
                const c = acharCarta(id)
                if (!c) return resolve()
                scene.tweens.add({
                    targets: c.container,
                    y: KIT.cardY - 80,
                    alpha: 0,
                    scale: 0.65,
                    angle: 14,
                    duration: 360,
                    ease: 'Cubic.easeIn',
                    onComplete: () => {
                        if (c.zona.input) c.zona.input.enabled = false
                        resolve()
                    },
                })
            }),

        piscar: id => {
            const c = acharCarta(id)
            if (!c) return
            scene.tweens.add({
                targets: c.container,
                scale: { from: 1, to: 1.1 },
                duration: 170,
                yoyo: true,
            })
        },

        posDa: id => {
            const c = acharCarta(id)
            return { x: c?.cx ?? W / 2, y: KIT.cardY }
        },

        posDoOk: () => ({ x: KIT.okX, y: KIT.okY }),

        /* O tutorial e o vendedor não falam ao mesmo tempo. */
        calarExagero: () => {
            scene.tweens.killTweensOf(falaExagero)
            falaExagero.setVisible(false)
        },

        exageroFrame: frame => {
            if (!scene.textures.exists('exagero') || !sheetE) return
            const box = boxOf(sheetE, frame)
            vendedor.setFrame(String(frame)).setScale(112 / (box.height * sheetE.frameH))
        },

        destroy: () => {
            scene.tweens.killTweensOf([root, exagero, falaExagero, ok])
            cartas.forEach(c => {
                c.zona.destroy()
                c.container.destroy()
            })
            cartas = []
            okZona.destroy()
            falaExagero.destroy()
            exagero.destroy()
            root.destroy()
        },
    }

    return api
}
