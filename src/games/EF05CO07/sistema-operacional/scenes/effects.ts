import Phaser from 'phaser'
import { FX, Ease, type FxTarget } from '../../../../shared/effects/FX'
import { C, A, FONT, SIZE, hex } from '../data/theme'
import { W, H, LUZES, PEDIDO, PECAS, SLOTS, FILA, BOTAO } from '../data/layout'
import { PROGRAMAS, RECORTE, RECORTE_CHEIO } from '../data/niveis'
import type { PecaDef, PecaId, Pedido, ProgramaId } from '../types'

export const temTex = (scene: Phaser.Scene, key: string) => scene.textures.exists(key)

export interface Posta {
    img: Phaser.GameObjects.Image
    largura: number
    altura: number
}

export function porConteudo(
    scene: Phaser.Scene, key: string, cx: number, cy: number,
    maxAlt: number, maxLarg = Number.POSITIVE_INFINITY,
): Posta | null {
    if (!temTex(scene, key)) return null
    const img = scene.add.image(cx, cy, key)
    const src = img.texture.getSourceImage() as { width: number; height: number }
    const rec = RECORTE[key] ?? RECORTE_CHEIO

    const escala = Math.min(maxAlt / (rec.h * src.height), maxLarg / (rec.w * src.width))
    img.setScale(escala)

    // com origin 0.5 o centro da IMAGEM cai em (cx, cy); o centro do CONTEÚDO
    // está deslocado disso, e é ele que precisa pousar no ponto pedido
    const dx = (rec.x + rec.w / 2 - 0.5) * src.width * escala
    const dy = (rec.y + rec.h / 2 - 0.5) * src.height * escala
    img.setPosition(cx - dx, cy - dy)

    return { img, largura: rec.w * src.width * escala, altura: rec.h * src.height * escala }
}

/* ═══════════════════════════════════════════════════ efeitos de toque */

/**
 * A ONDINHA DE TOQUE.
 *
 * Sai de ONDE O DEDO ENCOSTOU, em qualquer lugar da tela, mesmo que o toque não
 * tenha acertado nada. É o retorno mais barato que existe e o mais importante:
 * sem ele, um toque que erra o alvo por dez pixels não produz nada, e a criança
 * não sabe se o jogo travou ou se ela errou.
 *
 * Ciano, sempre — é a cor da sala, não das duas cores de significado. Uma
 * ondinha verde diria "acertou" antes de o jogo saber.
 */
export function ondinha(scene: Phaser.Scene, x: number, y: number, cor = C.ciano) {
    const g = scene.add.graphics({ x, y }).setDepth(9300)
    g.lineStyle(4, cor, 0.9)
    g.strokeCircle(0, 0, 16)
    g.setScale(0.4)
    void FX.to(scene, g as unknown as FxTarget, { scale: 2.1, alpha: 0 },
        { duration: 420, ease: Ease.smooth }).then(() => g.destroy())
}

/* ═══════════════════════════════════════════════════════ o cenário */

export function createCenario(scene: Phaser.Scene, key: string): void {
    if (temTex(scene, key)) {
        const bg = scene.add.image(W / 2, H / 2, key).setDepth(-20)
        const src = bg.texture.getSourceImage() as { width: number; height: number }
        bg.setScale(Math.max(W / src.width, H / src.height))
        /*
         * SEM DESFOQUE, e com véu de 15%.
         *
         * O usuário pediu o cenário mais visível. A arte é uma sala de controle
         * limpa, de tons escuros — ela nunca esteve competindo com o conteúdo, e
         * borrá-la só fazia parecer defeito. Quem garante a leitura do texto é a
         * placa de vidro atrás dele, não escurecer a sala inteira.
         */
        FX.fadeIn(scene, bg, 420)
    } else {
        const g = scene.add.graphics().setDepth(-20)
        g.fillStyle(C.ink, 1)
        g.fillRect(0, 0, W, H)
    }

    const veu = scene.add.graphics().setDepth(-19)
    veu.fillStyle(C.ink, A.veu)
    veu.fillRect(0, 0, W, H)
}

/* ═══════════════════════════════════════════════════════ as luzes */

export interface Luzes {
    set(acesas: number): void
    entrar(): void
    destroy(): void
}

/**
 * As três luzes. Zero texto, e dá para contar sem saber ler.
 *
 * Quando uma apaga ela não some: ela ESTOURA — o halo cresce, a luz encolhe e o
 * vidro apagado fica no lugar. A criança precisa ver a luz que perdeu, senão o
 * placar muda sem que nada tenha acontecido na tela.
 */
export function createLuzes(scene: Phaser.Scene, total: number): Luzes {
    const container = scene.add.container(0, 0).setDepth(80)
    const g = scene.add.graphics()
    container.add(g)

    let acesas = total

    const centro = (i: number) => ({ x: LUZES.x + i * LUZES.gap, y: LUZES.cy })

    const pintar = () => {
        g.clear()
        for (let i = 0; i < total; i += 1) {
            const { x, y } = centro(i)
            const on = i < acesas
            if (on) {
                g.fillStyle(C.ciano, 0.18)
                g.fillCircle(x, y, LUZES.halo)
            }
            g.fillStyle(C.sombra, 0.3)
            g.fillCircle(x, y + 2, LUZES.r)
            g.fillStyle(on ? C.ciano : C.fosco, 1)
            g.fillCircle(x, y, LUZES.r)
            g.lineStyle(2, on ? C.creme : C.dim, on ? 0.85 : 0.5)
            g.strokeCircle(x, y, LUZES.r)
            if (on) {
                g.fillStyle(C.branco, 0.5)
                g.fillCircle(x - LUZES.r * 0.3, y - LUZES.r * 0.34, LUZES.r * 0.3)
            }
        }
    }
    pintar()

    return {
        set: n => {
            const alvo = Math.max(0, n)
            if (alvo < acesas) {
                // a luz que vai apagar estoura no lugar dela
                const { x, y } = centro(alvo)
                const est = scene.add.graphics({ x, y }).setDepth(81)
                est.fillStyle(C.vermelho, 0.5)
                est.fillCircle(0, 0, LUZES.r)
                est.lineStyle(3, C.vermelho, 1)
                est.strokeCircle(0, 0, LUZES.r + 4)
                void FX.to(scene, est as unknown as FxTarget, { scale: 2.4, alpha: 0 },
                    { duration: 420, ease: Ease.smooth }).then(() => est.destroy())
                void FX.shake(scene, container, { axis: 'x', amount: 7, times: 3 })
            }
            acesas = alvo
            pintar()
        },

        entrar: () => {
            container.setAlpha(0)
            void FX.to(scene, container, { alpha: 1 }, { duration: 300, delay: 120 })
        },

        destroy: () => container.destroy(),
    }
}

/* ═══════════════════════════════════════════════════════ botões */

export interface Botao {
    container: Phaser.GameObjects.Container
    setAtivo(on: boolean): void
    chamar(): void
    entrar(delay?: number): void
    destroy(): void
}

export function createRedondo(
    scene: Phaser.Scene, x: number, y: number, r: number,
    label: string, onClick: () => void,
): Botao {
    const container = scene.add.container(x, y).setDepth(80)
    const g = scene.add.graphics()
    g.fillStyle(C.sombra, 0.35)
    g.fillCircle(0, 4, r)
    g.fillStyle(C.fosco, 0.92)
    g.fillCircle(0, 0, r)
    g.lineStyle(3, C.ciano, 0.7)
    g.strokeCircle(0, 0, r)
    const t = scene.add.text(0, -1, label, {
        fontFamily: FONT.black, fontSize: SIZE.ajuda, color: hex(C.creme),
    }).setOrigin(0.5).setResolution(2)
    container.add([g, t])

    let ativo = true
    // zona SOLTA e parada: o container muda de escala no gesto, e área que
    // encolhe no meio do toque come o clique
    const zona = scene.add.zone(x, y, r * 2 + 18, r * 2 + 18).setOrigin(0.5).setDepth(81)
    zona.setInteractive({ useHandCursor: true })
    zona.on('pointerover', () => { if (ativo) FX.to(scene, container, { scale: 1.12 }, { duration: 120 }) })
    zona.on('pointerout', () => { if (ativo) FX.to(scene, container, { scale: 1 }, { duration: 120 }) })
    zona.on('pointerdown', () => { if (ativo) FX.to(scene, container, { scale: 0.9 }, { duration: 80 }) })
    zona.on('pointerup', () => {
        if (!ativo) return
        void FX.to(scene, container, { scale: 1 }, { duration: 140, ease: Ease.back(2.4) })
        onClick()
    })

    return {
        container,
        setAtivo: on => { ativo = on; container.setAlpha(on ? 1 : 0.45) },
        chamar: () => void FX.to(scene, container, { scale: 1.14 }, { duration: 180, yoyo: true }),
        entrar: (delay = 0) => { void FX.popIn(scene, container, { from: 0.5, delay, duration: 380 }) },
        destroy: () => { zona.destroy(); container.destroy() },
    }
}

/**
 * O botão NÃO DÁ.
 *
 * `chamar()` existe porque, quando a criança toca na peça sem energia, o jogo
 * precisa dizer "a resposta é ali" sem escrever uma frase. O botão pulsa e solta
 * um halo. É a única forma de aviso desta tela, e ela não gasta texto nenhum.
 */
export function createBotaoNaoDa(scene: Phaser.Scene, onClick: () => void): Botao {
    const container = scene.add.container(BOTAO.cx, BOTAO.cy).setDepth(30)
    const g = scene.add.graphics()
    const w = BOTAO.w, h = BOTAO.h
    const fundo = Phaser.Display.Color.ValueToColor(C.vermelho).darken(30).color

    let ativo = true
    let preso = false
    const queda = 5

    const t = scene.add.text(0, -2, 'NÃO DÁ', {
        fontFamily: FONT.black, fontSize: SIZE.botao, color: hex(C.creme),
    }).setOrigin(0.5).setResolution(2)

    const pintar = () => {
        const dy = preso ? queda : 0
        g.clear()
        g.fillStyle(C.sombra, 0.4)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + queda + 6, w, h, h / 2)
        g.fillStyle(ativo ? fundo : C.fosco, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h + queda, h / 2)
        g.fillStyle(ativo ? C.vermelho : C.fosco, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        g.fillStyle(C.branco, ativo ? 0.24 : 0.06)
        g.fillRoundedRect(-w / 2 + 14, -h / 2 + dy + 7, w - 28, h * 0.26, h / 4)
        g.lineStyle(3, C.branco, ativo ? 0.7 : 0.2)
        g.strokeRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        t.setY(-2 + dy)
        t.setAlpha(ativo ? 1 : 0.5)
    }
    container.add([g, t])
    pintar()

    const zona = scene.add.zone(BOTAO.cx, BOTAO.cy, w + 24, h + 24).setOrigin(0.5).setDepth(31)
    zona.setInteractive({ useHandCursor: true })
    zona.on('pointerover', () => { if (ativo) FX.to(scene, container, { scale: 1.05 }, { duration: 120 }) })
    zona.on('pointerout', () => {
        if (preso) { preso = false; pintar() }
        if (ativo) FX.to(scene, container, { scale: 1 }, { duration: 120 })
    })
    zona.on('pointerdown', () => { if (ativo) { preso = true; pintar() } })
    zona.on('pointerup', () => {
        if (!ativo || !preso) return
        preso = false; pintar()
        void FX.to(scene, container, { scale: 1.08 }, { duration: 130, yoyo: true, ease: Ease.back(2) })
        onClick()
    })

    return {
        container,
        setAtivo: on => { ativo = on; preso = false; pintar() },
        chamar: () => {
            void FX.to(scene, container, { scale: 1.12 }, { duration: 200, yoyo: true, repeat: 1 })
            void FX.ping(scene, BOTAO.cx, BOTAO.cy, C.vermelho, { radius: 110, duration: 620 })
        },
        entrar: (delay = 0) => { void FX.slideIn(scene, container, { dy: 40, delay, duration: 420 }) },
        destroy: () => { zona.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ o pedido */

export interface PainelPedido {
    /** `origem` é de onde o ícone do programa vem voando (a fila). */
    mostrar(p: Pedido, origem?: { x: number; y: number }): Promise<void>
    /** Tira o ícone do painel e devolve, já em coordenadas de tela. */
    soltarIcone(): Phaser.GameObjects.Image | null
    esconder(ok: boolean): Promise<void>
    /** "Releia" — quando a criança fica parada. */
    releia(): void
    /** O programa balança a cabeça: o pedido não foi resolvido. */
    negar(): void
    /** Devolve o ícone para a fila: a criança escolheu atender outro antes. */
    devolver(destino: { x: number; y: number }): Promise<void>
    posIcone(): { x: number; y: number }
    entrar(): void
    destroy(): void
}

export function createPedido(scene: Phaser.Scene): PainelPedido {
    const container = scene.add.container(0, 0).setDepth(20).setAlpha(0)

    const vidro = scene.add.graphics()
    vidro.fillStyle(C.vidro, A.vidro)
    vidro.fillRoundedRect(PEDIDO.x, PEDIDO.y, PEDIDO.w, PEDIDO.h, PEDIDO.r)
    vidro.lineStyle(2, C.ciano, 0.45)
    vidro.strokeRoundedRect(PEDIDO.x, PEDIDO.y, PEDIDO.w, PEDIDO.h, PEDIDO.r)
    container.add(vidro)

    const estilo = (cor: number) => ({
        fontFamily: FONT.black, fontSize: `${SIZE.frase}px`, color: hex(cor),
        stroke: hex(C.ink), strokeThickness: 4,
    })
    const t1 = scene.add.text(0, PEDIDO.fraseCY, '', estilo(C.creme)).setOrigin(0, 0.5).setResolution(2)
    const t2 = scene.add.text(0, PEDIDO.fraseCY, '', estilo(C.ciano)).setOrigin(0, 0.5).setResolution(2)
    const t3 = scene.add.text(0, PEDIDO.fraseCY, '', estilo(C.creme)).setOrigin(0, 0.5).setResolution(2)
    container.add([t1, t2, t3])

    let icone: Phaser.GameObjects.Image | null = null

    /**
     * A frase é montada com TRÊS textos lado a lado, para o nome da peça sair em
     * outra cor. Ela encolhe até caber numa linha — e cabe, porque o teto de
     * caracteres em `niveis.ts` garante isso.
     */
    const montarFrase = (p: Pedido) => {
        for (let tam = SIZE.frase; tam >= SIZE.fraseMin; tam -= 2) {
            ;[t1, t2, t3].forEach(t => t.setFontSize(tam))
            t1.setText(p.frase.antes); t2.setText(p.frase.palavra); t3.setText(p.frase.depois)
            const total = t1.width + t2.width + t3.width
            if (total <= PEDIDO.fraseMaxW || tam === SIZE.fraseMin) {
                let x = PEDIDO.cx - total / 2
                t1.setX(x); x += t1.width
                t2.setX(x); x += t2.width
                t3.setX(x)
                return
            }
        }
    }

    /** A frase entra letra por bloco, deslizando de baixo. */
    const entrarFrase = () => {
        [t1, t2, t3].forEach((t, i) => {
            const y = PEDIDO.fraseCY
            t.setY(y + 16).setAlpha(0)
            void FX.to(scene, t, { y, alpha: 1 }, { duration: 300, delay: 90 + i * 70, ease: Ease.back(1.6) })
        })
    }

    return {
        mostrar: async (p, origem) => {
            icone?.destroy(); icone = null
            const posta = porConteudo(
                scene, PROGRAMAS[p.programa].textura, PEDIDO.cx, PEDIDO.iconeCY, PEDIDO.iconeAlt,
            )
            if (posta) { icone = posta.img; icone.setDepth(21) }
            montarFrase(p)

            container.setAlpha(0)
            void FX.to(scene, container, { alpha: 1 }, { duration: 240 })
            entrarFrase()

            if (!icone) { await FX.wait(scene, 340); return }

            if (origem) {
                /*
                 * O PRÓXIMO PROGRAMA SAI DA FILA E SOBE.
                 *
                 * A transição mais importante do jogo: em vez de o pedido
                 * "aparecer", a criança vê o próximo da fila levantar do trilho
                 * e voar até a placa. A fila deixa de ser um enfeite de canto e
                 * passa a ser de onde as coisas vêm.
                 */
                const destino = { x: icone.x, y: icone.y }
                const escala = icone.scale
                icone.setPosition(origem.x, origem.y).setScale(escala * 0.34)
                await FX.all(
                    FX.arcTo(scene, icone, destino, { height: 150, duration: 620, ease: Ease.smooth }),
                    FX.to(scene, icone, { scale: escala, alpha: 1 }, { duration: 620 }),
                )
                void FX.to(scene, icone, { scale: escala * 1.08 }, { duration: 140, yoyo: true })
            } else {
                await FX.popIn(scene, icone, { from: 0.6, duration: 420 })
            }
        },

        soltarIcone: () => {
            const i = icone
            icone = null
            return i
        },

        esconder: async ok => {
            await FX.all(
                FX.to(scene, container, { alpha: 0 }, { duration: 220 }),
                icone
                    ? FX.to(scene, icone, { alpha: 0, scale: icone.scale * (ok ? 1.15 : 0.8) }, { duration: 220 })
                    : Promise.resolve(),
            )
            icone?.destroy(); icone = null
        },

        releia: () => {
            void FX.to(scene, [t1, t2, t3], { scale: 1.06 }, { duration: 260, yoyo: true, repeat: 1 })
        },

        negar: () => {
            if (icone) void FX.shake(scene, icone, { amount: 9, times: 3 })
        },

        /*
         * DEVOLVER: o programa volta para a fila porque a criança escolheu
         * atender outro antes.
         *
         * Ele desce voando até a vaga dele no trilho — e é esse voo que faz o
         * "escolher a ordem" ser uma coisa VISÍVEL, e não um estado interno.
         */
        devolver: async destino => {
            const i = icone
            icone = null
            void FX.to(scene, container, { alpha: 0 }, { duration: 200 })
            if (!i) return
            await FX.all(
                FX.arcTo(scene, i, destino, { height: 90, duration: 340 }),
                FX.to(scene, i, { scale: i.scale * 0.34, alpha: 0.7 }, { duration: 340 }),
            )
            i.destroy()
        },

        posIcone: () => ({ x: icone?.x ?? PEDIDO.cx, y: icone?.y ?? PEDIDO.iconeCY }),

        entrar: () => {
            container.setAlpha(0)
            void FX.slideIn(scene, container, { dy: -40, duration: 420 })
        },

        destroy: () => { icone?.destroy(); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ as peças */

export interface Fileira {
    container: Phaser.GameObjects.Container
    posDe(id: PecaId): { x: number; y: number }
    /** Um programa pousa na peça e fica lá enquanto usa. */
    ocupar(id: PecaId, icone: Phaser.GameObjects.Image): Promise<void>
    liberar(id: PecaId): void
    ocupada(id: PecaId): boolean
    acerto(id: PecaId): void
    erro(id: PecaId): void
    /** "Ainda não" — a peça está em uso. Não é erro, e não pisca vermelho. */
    aguarde(id: PecaId): void
    /** "Olhe aqui" — a ajuda de quem travou. */
    apontar(id: PecaId): void
    entrar(): void
    setAtivo(on: boolean): void
    destroy(): void
}

export function createPecas(
    scene: Phaser.Scene,
    { pecas, semEnergia, onPeca }: {
        pecas: PecaDef[]
        semEnergia: PecaId[]
        onPeca: (id: PecaId) => void
    },
): Fileira {
    const container = scene.add.container(0, 0).setDepth(10)

    interface Slot {
        id: PecaId
        x: number
        img: Phaser.GameObjects.Image | null
        base: number
        largura: number
        desligada: boolean
        zona: Phaser.GameObjects.Zone
        ocupante: Phaser.GameObjects.Image | null
        respiro: Phaser.Tweens.Tween | null
        corpo: Phaser.GameObjects.GameObject[]
    }

    const slots: Slot[] = []
    let ativo = true

    pecas.forEach((def, i) => {
        const x = PECAS.xs[i]
        const desligada = semEnergia.includes(def.id)

        const sombra = scene.add.graphics()
        container.add(sombra)

        const posta = porConteudo(scene, def.textura, x, PECAS.cy, PECAS.alt, PECAS.maxW)
        const largura = posta?.largura ?? PECAS.alt
        const altura = posta?.altura ?? PECAS.alt
        if (posta) {
            container.add(posta.img)
            if (desligada) {
                // sem energia: escura e sem vida. Nenhuma outra peça tem marca
                // nenhuma — o normal não se pinta, a exceção sim
                posta.img.setTint(0x415d78)
                posta.img.setAlpha(A.desligada)
            }
        }

        sombra.fillStyle(C.sombra, desligada ? 0.22 : 0.34)
        sombra.fillEllipse(x, PECAS.cy + altura / 2 + 12, largura * PECAS.sombraRX * 2, PECAS.sombraRY * 2)

        const marcas: Phaser.GameObjects.GameObject[] = []
        if (desligada) {
            const selo = scene.add.graphics()
            const sx = x + largura * PECAS.seloDX
            const sy = PECAS.cy - altura * PECAS.seloDY
            selo.fillStyle(C.sombra, 0.3)
            selo.fillCircle(sx, sy + 3, PECAS.seloR)
            selo.fillStyle(C.vermelho, 1)
            selo.fillCircle(sx, sy, PECAS.seloR)
            selo.lineStyle(3, C.creme, 0.9)
            selo.strokeCircle(sx, sy, PECAS.seloR)
            selo.lineStyle(5, C.creme, 1)
            selo.lineBetween(sx - 9, sy - 9, sx + 9, sy + 9)
            selo.lineBetween(sx - 9, sy + 9, sx + 9, sy - 9)
            container.add(selo)
            marcas.push(selo)
        }

        const nome = scene.add.text(x, PECAS.nomeCY, def.nome, {
            fontFamily: FONT.black, fontSize: SIZE.peca,
            color: hex(desligada ? C.dim : C.creme),
            stroke: hex(C.ink), strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)
        container.add(nome)

        const zona = scene.add.zone(x, PECAS.cy, PECAS.toqueW, PECAS.toqueH)
            .setOrigin(0.5).setDepth(15)
        zona.setInteractive({ useHandCursor: true })

        const base = posta?.img.scale ?? 1
        const escalar = (f: number, dur = 120) => {
            if (posta) void FX.to(scene, posta.img, { scale: base * f }, { duration: dur })
        }
        zona.on('pointerover', () => { if (ativo) escalar(1.07) })
        zona.on('pointerout', () => { if (ativo) escalar(1) })
        /*
         * O AFUNDA-E-VOLTA DO TOQUE.
         *
         * `pointerdown` encolhe a peça, `pointerup` devolve com uma mola. É o
         * gesto que faz um botão parecer botão — e aqui as peças SÃO os botões,
         * então elas precisam responder ao dedo antes de o jogo julgar se a
         * resposta estava certa.
         */
        zona.on('pointerdown', () => { if (ativo) escalar(0.92, 80) })
        zona.on('pointerup', () => {
            if (!ativo) return
            if (posta) void FX.to(scene, posta.img, { scale: base }, { duration: 220, ease: Ease.back(3) })
            onPeca(def.id)
        })

        /*
         * O RESPIRO: a peça flutua 4px, cada uma com um atraso diferente.
         *
         * É a regra §2 da memória do projeto — "o que aceita toque se mexe" —
         * resolvida sem gastar um aro, um brilho ou uma palavra.
         */
        slots.push({
            id: def.id, x, img: posta?.img ?? null, base, largura, desligada,
            zona, ocupante: null, respiro: null,
            corpo: [sombra, nome, ...marcas, ...(posta ? [posta.img] : [])],
        })
    })

    const acha = (id: PecaId) => slots.find(s => s.id === id)

    const halo = (id: PecaId, cor: number, raio: number) => {
        const s = acha(id)
        if (!s) return
        void FX.ping(scene, s.x, PECAS.cy, cor, { radius: raio, duration: 620, depth: 12 })
    }

    return {
        container,
        posDe: id => ({ x: acha(id)?.x ?? W / 2, y: PECAS.cy }),

        ocupar: async (id, icone) => {
            const s = acha(id)
            if (!s) { icone.destroy(); return }
            const alvo = { x: s.x, y: PECAS.cy + PECAS.ocupanteDY }
            icone.setDepth(22)
            await FX.all(
                FX.arcTo(scene, icone, alvo, { height: 130, duration: 620 }),
                FX.to(scene, icone, { scale: icone.scale * (PECAS.ocupanteAlt / PEDIDO.iconeAlt) }, { duration: 620 }),
            )
            // o baque: a peça recebe o programa e afunda um pouco
            if (s.img) void FX.impact(scene, s.img, 0.18)
            void FX.ping(scene, s.x, PECAS.cy, C.ciano, { radius: 96, duration: 480, depth: 12 })
            s.ocupante = icone
            FX.float(scene, icone, { amount: 5, duration: 1400 })
        },

        liberar: id => {
            const s = acha(id)
            if (!s?.ocupante) return
            const i = s.ocupante
            s.ocupante = null
            void FX.ping(scene, s.x, PECAS.cy, C.ciano, { radius: 70, duration: 420, depth: 12 })
            void FX.burstOut(scene, i, { duration: 340 })
        },

        ocupada: id => !!acha(id)?.ocupante,

        acerto: id => {
            const s = acha(id)
            halo(id, C.verde, 130)
            if (s?.img) void FX.impact(scene, s.img, 0.16)
            void FX.sparks(scene, s?.x ?? W / 2, PECAS.cy, {
                color: C.verde, count: 16, spread: 150, depth: 13,
            })
        },

        erro: id => {
            const s = acha(id)
            halo(id, C.vermelho, 110)
            if (s?.img) void FX.shake(scene, s.img, { amount: 10, times: 3 })
        },

        aguarde: id => {
            const s = acha(id)
            halo(id, C.ciano, 110)
            if (s?.ocupante) void FX.to(scene, s.ocupante, { scale: s.ocupante.scale * 1.16 }, { duration: 160, yoyo: true })
        },

        apontar: id => {
            halo(id, C.ciano, 140)
            const s = acha(id)
            if (s?.img) void FX.to(scene, s.img, { scale: s.base * 1.12 }, { duration: 280, yoyo: true, repeat: 1 })
        },

        /** As peças caem na mesa uma depois da outra quando o nível abre. */
        entrar: () => {
            slots.forEach((s, i) => {
                s.corpo.forEach(o => {
                    const alvo = o as unknown as FxTarget
                    alvo.setAlpha(0)
                    void FX.to(scene, alvo, { alpha: 1 }, { duration: 260, delay: 180 + i * 110 })
                })
                if (!s.img) return
                const y = s.img.y
                s.img.setY(y - 60)
                void FX.to(scene, s.img, { y }, {
                    duration: 520, delay: 180 + i * 110, ease: 'Bounce.easeOut',
                }).then(() => {
                    // o respiro só começa DEPOIS do salto: dois tweens no mesmo
                    // `y` se atropelam, e a peça fica subindo alguns pixels a
                    // cada ciclo até sair do lugar
                    if (!s.desligada && s.img) {
                        s.respiro = FX.float(scene, s.img, { amount: 4, duration: 2200 + i * 180 })
                    }
                })
            })
        },

        setAtivo: on => { ativo = on },

        destroy: () => {
            slots.forEach(s => { s.respiro?.remove(); s.zona.destroy(); s.ocupante?.destroy() })
            container.destroy()
        },
    }
}

/* ═══════════════════════════════════════════════ os encaixes da memória */

export interface Encaixes {
    /** Quem está aberto, POR ENCAIXE — `null` é encaixe vazio. */
    set(abertos: Array<ProgramaId | null>): void
    /** Põe um programa no encaixe `i`, com o ícone voando até lá. */
    guardar(i: number, quem: ProgramaId, icone: Phaser.GameObjects.Image): Promise<void>
    /** Tira o programa do encaixe `i` — ele desliga e some. */
    soltar(i: number): Promise<void>
    /** "Está cheia": os quatro encaixes pulsam. */
    cheia(): void
    posDe(i: number): { x: number; y: number }
    entrar(): void
    setAtivo(on: boolean): void
    destroy(): void
}

/**
 * OS QUATRO ENCAIXES DA MEMÓRIA.
 *
 * Sem rótulo e sem número: encaixe vazio é lugar livre, encaixe com ícone é
 * programa aberto, e dá para contar. Foi assim que a memória entrou no jogo sem
 * gastar nenhum dos sete blocos de texto.
 *
 * São quatro porque o pente de RAM desenhado tem quatro chips — a mecânica não
 * pode contradizer os olhos.
 */
export function createEncaixes(
    scene: Phaser.Scene,
    { cx, total, onEncaixe }: {
        cx: number
        total: number
        onEncaixe: (i: number, quem: ProgramaId | null) => void
    },
): Encaixes {
    const container = scene.add.container(0, 0).setDepth(16)
    const g = scene.add.graphics()
    container.add(g)
    const icones = scene.add.container(0, 0)
    container.add(icones)

    const passo = SLOTS.lado + SLOTS.gap
    const x0 = cx - ((total - 1) * passo) / 2
    const pos = (i: number) => ({ x: x0 + i * passo, y: SLOTS.cy })

    let dentro: Array<ProgramaId | null> = new Array(total).fill(null)
    let ativo = true

    const pintar = () => {
        g.clear()
        for (let i = 0; i < total; i += 1) {
            const { x, y } = pos(i)
            const l = SLOTS.lado
            g.fillStyle(C.sombra, 0.3)
            g.fillRoundedRect(x - l / 2 + 2, y - l / 2 + 3, l, l, SLOTS.r)
            g.fillStyle(dentro[i] ? C.vidro : C.ink, dentro[i] ? 0.95 : 0.55)
            g.fillRoundedRect(x - l / 2, y - l / 2, l, l, SLOTS.r)
            /*
             * O ENCAIXE VAZIO PRECISA SER CONTÁVEL.
             *
             * Ele nasceu com borda em `C.fosco` e, sobre a sala escura, os dois
             * encaixes livres simplesmente sumiam — a criança via dois programas
             * abertos e nenhuma vaga, que é o contrário do que a tela queria
             * dizer. A borda do vazio é mais clara que a do cheio de propósito:
             * quem tem ícone dentro já se anuncia sozinho.
             */
            g.lineStyle(2, dentro[i] ? C.ciano : C.dim, dentro[i] ? 0.8 : 0.75)
            g.strokeRoundedRect(x - l / 2, y - l / 2, l, l, SLOTS.r)
        }
    }

    const redesenhar = () => {
        pintar()
        icones.removeAll(true)
        dentro.forEach((id, i) => {
            if (!id) return
            const { x, y } = pos(i)
            const posta = porConteudo(scene, PROGRAMAS[id].textura, x, y, SLOTS.iconeAlt, SLOTS.iconeAlt)
            if (posta) icones.add(posta.img)
        })
    }

    const zonas: Phaser.GameObjects.Zone[] = []
    for (let i = 0; i < total; i += 1) {
        const { x, y } = pos(i)
        const z = scene.add.zone(x, y, SLOTS.lado + 10, SLOTS.lado + 10)
            .setOrigin(0.5).setDepth(17)
        z.setInteractive({ useHandCursor: true })
        z.on('pointerdown', () => { if (ativo) void FX.to(scene, container, { scale: 0.99 }, { duration: 70 }) })
        z.on('pointerup', () => {
            if (!ativo) return
            void FX.to(scene, container, { scale: 1 }, { duration: 130 })
            onEncaixe(i, dentro[i])
        })
        zonas.push(z)
    }

    redesenhar()

    return {
        /*
         * Recebe o vetor POR ENCAIXE, e não a lista de quem está aberto.
         *
         * Parece detalhe e não é: depois de fechar o programa do encaixe 0 com o
         * 1 ainda cheio, uma lista compactada faria o programa do 1 aparecer
         * desenhado no 0. O encaixe vazio precisa continuar vazio no lugar dele.
         */
        set: abertos => {
            dentro = new Array(total).fill(null)
            abertos.slice(0, total).forEach((id, i) => { dentro[i] = id ?? null })
            redesenhar()
        },

        guardar: async (i, quem, icone) => {
            const { x, y } = pos(i)
            icone.setDepth(22)
            await FX.all(
                FX.arcTo(scene, icone, { x, y }, { height: 110, duration: 560 }),
                FX.to(scene, icone, { scale: icone.scale * (SLOTS.iconeAlt / PEDIDO.iconeAlt) }, { duration: 560 }),
            )
            void FX.ping(scene, x, y, C.verde, { radius: 60, duration: 420, depth: 18 })
            icone.destroy()
            dentro[i] = quem
            redesenhar()
            const alvo = icones.list[icones.list.length - 1] as unknown as FxTarget
            if (alvo) void FX.popIn(scene, alvo, { from: 0.5, duration: 300 })
        },

        soltar: async i => {
            const { x, y } = pos(i)
            const alvo = icones.list.find(o => {
                const im = o as Phaser.GameObjects.Image
                return Math.abs(im.x - x) < SLOTS.lado && Math.abs(im.y - y) < SLOTS.lado
            }) as Phaser.GameObjects.Image | undefined

            void FX.ping(scene, x, y, C.ciano, { radius: 56, duration: 380, depth: 18 })
            if (alvo) {
                // desligar: o ícone achata na horizontal e some, como uma tela
                // de tubo antiga apagando
                await FX.to(scene, alvo, { scaleY: 0.02, alpha: 0.2 }, { duration: 220, ease: Ease.smooth })
            } else {
                await FX.wait(scene, 120)
            }
            dentro[i] = null
            redesenhar()
        },

        cheia: () => {
            for (let i = 0; i < total; i += 1) {
                const { x, y } = pos(i)
                void FX.ping(scene, x, y, C.vermelho, { radius: 46, duration: 460, depth: 18 })
            }
            void FX.shake(scene, container, { axis: 'x', amount: 6, times: 3 })
        },

        posDe: i => pos(i),

        entrar: () => {
            container.setAlpha(0)
            void FX.to(scene, container, { alpha: 1 }, { duration: 320, delay: 620 })
        },

        setAtivo: on => { ativo = on },

        destroy: () => { zonas.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ a fila */

export interface ItemFila {
    textura: string
    /**
     * `true`  = está esperando AGORA: aceso, com halo, e aceita toque.
     * `false` = ainda nem chegou: apagado e inerte.
     *
     * São os dois estados do mesmo trilho, sem nenhuma legenda. Se o apagado
     * não for visivelmente mais fraco (`A.fila`), os dois grupos viram um só e
     * a criança acha que tem seis programas esperando.
     *
     * Aqui morava um `frac` de 1 a 0 — a paciência de cada um, desenhada como
     * um anel que encolhia. Ele saiu junto com o relógio: virou um `boolean`
     * porque a única coisa que a criança precisa saber sobre um ícone do
     * trilho é se dá para tocar nele.
     */
    esperando: boolean
}

export interface FilaView {
    set(itens: ItemFila[]): void
    /** "A saída está aqui embaixo": quem espera pulsa. */
    chamar(): void
    posDe(i: number): { x: number; y: number }
    entrar(): void
    setAtivo(on: boolean): void
    destroy(): void
}

/**
 * A FILA.
 *
 * Nos Níveis 1 e 2 ela é quem AINDA VAI pedir: ícones apagados que encolhem a
 * cada pedido resolvido. É o indicador de progresso E a "fila de processos" da
 * planilha, sem escrever nenhum dos dois.
 *
 * No Nível 3 ela vira a FILA VIVA: quem está esperando fica aceso, ganha um
 * halo e aceita toque — tocar nele o traz para o balcão. O mesmo objeto, uma
 * coisa a mais, nenhuma palavra a mais. Foi assim que "dois pedidos ao mesmo
 * tempo" coube numa tela de sete blocos de texto.
 *
 * E ela é DE ONDE O PEDIDO VEM: o ícone escolhido sobe voando até a placa de
 * vidro, e volta para cá se a criança escolher outro antes.
 */
export function createFila(
    scene: Phaser.Scene, onToque?: (i: number) => void,
): FilaView {
    const container = scene.add.container(0, 0).setDepth(15)
    const trilho = scene.add.graphics()
    const halos = scene.add.graphics()
    const icones = scene.add.container(0, 0)
    container.add([trilho, halos, icones])

    const posDe = (i: number) => ({ x: FILA.x + FILA.padX + i * FILA.gap, y: FILA.cy })

    let zonas: Phaser.GameObjects.Zone[] = []
    /** Os ícones de quem está esperando agora — é neles que `chamar()` bate. */
    let acesos: Phaser.GameObjects.Image[] = []
    let ativo = true

    return {
        set: itens => {
            icones.removeAll(true)
            zonas.forEach(z => z.destroy())
            zonas = []
            acesos = []
            trilho.clear()
            halos.clear()
            if (!itens.length) return

            const larg = itens.length * FILA.gap + FILA.padX
            trilho.fillStyle(C.ink, 0.45)
            trilho.fillRoundedRect(FILA.x, FILA.cy - FILA.h / 2, larg, FILA.h, FILA.r)
            trilho.lineStyle(2, C.ciano, 0.22)
            trilho.strokeRoundedRect(FILA.x, FILA.cy - FILA.h / 2, larg, FILA.h, FILA.r)

            itens.forEach((it, i) => {
                const { x, y } = posDe(i)
                const posta = porConteudo(scene, it.textura, x, y, FILA.alt, FILA.alt)
                if (!posta) return
                posta.img.setAlpha(it.esperando ? 1 : A.fila)
                icones.add(posta.img)

                if (!it.esperando) return

                /*
                 * O HALO DE QUEM ESTÁ ESPERANDO AGORA.
                 *
                 * Ciano — a cor da sala, não uma das duas cores de significado.
                 * Ele não conta tempo, não enche nem esvazia: só diz "este aqui
                 * aceita toque", que é a única coisa que a criança precisa
                 * saber sobre um ícone do trilho.
                 */
                halos.fillStyle(C.ciano, 0.16)
                halos.fillCircle(x, y, FILA.haloR)
                halos.lineStyle(3, C.ciano, 0.7)
                halos.strokeCircle(x, y, FILA.haloR)

                acesos.push(posta.img)
                // quem está esperando respira: é o que se mexe que se toca
                FX.float(scene, posta.img, { amount: 3, duration: 1500 })

                /*
                 * Só quem ESTÁ ESPERANDO ganha zona.
                 *
                 * Não dar zona é melhor que recusar o toque: quem ainda nem
                 * chegou simplesmente não responde, e não existe bronca sobre
                 * uma regra que a criança não podia saber.
                 */
                if (!onToque) return
                const base = posta.img.scale
                const z = scene.add.zone(x, y, FILA.toque, FILA.toque)
                    .setOrigin(0.5).setDepth(16)
                z.setInteractive({ useHandCursor: true })
                // a escala volta sempre para `base`, e nunca para "o que estava
                // antes": encadear multiplicação e divisão vai empilhando erro
                // e o ícone acaba de tamanho diferente dos vizinhos
                z.on('pointerover', () => { if (ativo) FX.to(scene, posta.img, { scale: base * 1.14 }, { duration: 120 }) })
                z.on('pointerout', () => { if (ativo) FX.to(scene, posta.img, { scale: base }, { duration: 120 }) })
                z.on('pointerdown', () => { if (ativo) FX.to(scene, posta.img, { scale: base * 0.9 }, { duration: 80 }) })
                z.on('pointerup', () => {
                    if (!ativo) return
                    void FX.to(scene, posta.img, { scale: base }, { duration: 220, ease: Ease.back(3) })
                    onToque(i)
                })
                zonas.push(z)
            })
        },

        /**
         * A peça pedida está em uso, e a resposta é o trilho.
         *
         * Chamado quando a criança insiste numa peça ocupada: em vez de uma
         * frase dizendo "atenda outro", o outro programa pula e solta um halo.
         */
        chamar: () => {
            acesos.forEach(img => {
                void FX.to(scene, img, { scale: img.scale * 1.2 },
                    { duration: 200, yoyo: true, repeat: 1 })
            })
            const primeiro = acesos[0]
            if (primeiro) {
                void FX.ping(scene, primeiro.x, FILA.cy, C.ciano,
                    { radius: 96, duration: 560, depth: 18 })
            }
        },

        posDe,

        entrar: () => {
            container.setAlpha(0)
            void FX.to(scene, container, { alpha: 1 }, { duration: 320, delay: 500 })
        },

        setAtivo: on => { ativo = on },

        destroy: () => { zonas.forEach(z => z.destroy()); container.destroy() },
    }
}

/* ═══════════════════════════════════════════════════════ o travamento */

/**
 * O COMPUTADOR TRAVA.
 *
 * Sem as três luzes, a sala pisca e escurece. Não tem parágrafo explicando o
 * que aconteceu: um computador travando na frente da criança já é a frase
 * inteira, e é a frase que o nível passou inteiro construindo.
 */
export async function travar(scene: Phaser.Scene): Promise<void> {
    for (const a of [0.85, 0.2, 0.9, 0.35]) {
        const g = scene.add.graphics().setDepth(8000)
        g.fillStyle(C.ink, a)
        g.fillRect(0, 0, W, H)
        await FX.wait(scene, 90)
        g.destroy()
    }
    FX.shakeCam(scene, 'medio')
    const g = scene.add.graphics().setDepth(7999).setAlpha(0)
    g.fillStyle(C.ink, 0.72)
    g.fillRect(0, 0, W, H)
    await FX.to(scene, g as unknown as FxTarget, { alpha: 1 }, { duration: 260, ease: Ease.smooth })
}
