import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ICON, SHEET } from '../data/art'
import { DEPTH, LANE_Y, PLACA } from '../data/layout'
import { C, COR, CSS, FONT } from '../data/theme'
import { avaliar, valeTermo } from '../data/criaturas'
import { palavraDoTermo } from '../data/ondas'
import type { Atributo, Criatura, Frase, Lane, Termo } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PLACA — o objeto mais importante da tela
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Quem decide é a frase, não a porta: a placa é mais larga que o portão e vem
 * antes dele no caminho. E é nela que a habilidade acontece de verdade, porque
 * é aqui que o valor verdade aparece PASSO A PASSO — cada termo acende ✓ ou ✗,
 * o operador junta os dois na frente da criança, o `NÃO` vira o resultado, e só
 * então o carimbo cai.
 *
 * ── A FILEIRA É MEDIDA, NÃO POSICIONADA ─────────────────────────────────
 *
 * `AZUL`, `PEQUENA` e `ÓCULOS` não têm a mesma largura. Cada ficha é construída,
 * medida e só então colocada, com o conjunto centrado na tábua. Posições fixas
 * deixariam metade das placas tortas — e a placa torta é a que a criança lê
 * errado.
 *
 * ── O `NÃO` É UMA PEÇA, NÃO UMA PALAVRA NO MEIO DA FRASE ────────────────
 *
 * Ele mora numa ficha vermelha própria, acima da fileira. Assim a placa de
 * baixo é visivelmente A MESMA placa de cima com uma peça a mais — que é
 * exatamente o que ela é — e a virada tem um objeto concreto para acontecer em
 * cima. O `NÃO` de um termo só (nível 3) é OUTRA COISA, e tem de parecer outra
 * coisa: um traço vermelho riscando aquele ícone, com a palavra dele em
 * vermelho. Os dois NÃOs juntos na mesma tela são o nível 3 inteiro, e eles só
 * ensinam se a criança conseguir ver que são diferentes.
 */

export interface PlacaOptions {
    lane: Lane
    /** A de baixo mostra a negação da frase inteira da de cima. */
    negada: boolean
}

export interface SonsDaPlaca {
    termo: (verdadeiro: boolean) => void
    vira: (paraVerdadeiro: boolean) => void
}

interface Ficha {
    container: Phaser.GameObjects.Container
    largura: number
    /** Termo com o `NÃO` grudado nele. A ficha do operador nunca é. */
    negado: boolean
    acender?: (verdadeiro: boolean) => void
}

export function createPlaca(scene: Phaser.Scene, options: PlacaOptions) {
    const cy = LANE_Y[options.lane]
    const root = scene.add.container(PLACA.cx, cy).setDepth(DEPTH.placa)

    const halfW = PLACA.w / 2
    const halfH = PLACA.h / 2

    // ── a tábua ──────────────────────────────────────────────────────────
    const board = scene.add.graphics()
    board.fillStyle(C.madeiraDark, 0.3)
    board.fillRoundedRect(-halfW + 4, -halfH + 8, PLACA.w, PLACA.h, 20)
    board.fillStyle(C.madeiraDark, 1)
    board.fillRoundedRect(-halfW, -halfH, PLACA.w, PLACA.h, 20)
    board.fillStyle(C.madeira, 1)
    board.fillRoundedRect(-halfW + 6, -halfH + 6, PLACA.w - 12, PLACA.h - 12, 15)
    board.fillStyle(C.cream, 0.35)
    board.fillRoundedRect(-halfW + 16, -halfH + 14, PLACA.w - 32, 14, 7)
    root.add(board)

    // ── a ficha do NÃO da frase inteira ──────────────────────────────────
    const naoChip = scene.add.container(0, -30).setVisible(false)
    const naoG = scene.add.graphics()
    naoG.fillStyle(C.naoDark, 1)
    naoG.fillRoundedRect(-46, -20, 92, 40, 14)
    naoG.fillStyle(C.nao, 1)
    naoG.fillRoundedRect(-42, -17, 84, 32, 11)
    const naoTxt = scene.add
        .text(0, -1, 'NÃO', { fontFamily: FONT.black, fontSize: '26px', color: CSS.nao })
        .setOrigin(0.5)
        .setResolution(2)
    naoChip.add([naoG, naoTxt])
    root.add(naoChip)

    // ── a fileira ────────────────────────────────────────────────────────
    const fileira = scene.add.container(0, 0)
    root.add(fileira)

    let fichas: Ficha[] = []
    let opFicha: Ficha | null = null
    let escalaDaFileira = 1

    const limparFileira = () => {
        fichas.forEach(f => f.container.destroy(true))
        fichas = []
        opFicha = null
        fileira.removeAll(true)
    }

    /** O ícone é uma miniatura da COISA, nunca um símbolo dela. */
    function criarIconeArt(atributo: Atributo): Phaser.GameObjects.GameObject {
        if (atributo === 'chapeu' || atributo === 'oculos') {
            const spec = ICON[atributo]
            return scene.add
                .sprite(0, 0, SHEET.criaturinhas, spec.frame)
                .setOrigin(spec.originX, spec.originY)
                .setScale((PLACA.icon - 12) / spec.box)
        }

        const g = scene.add.graphics()

        if (atributo === 'pequena') {
            // Poste com o traço e um corpinho que não o alcança: o mesmo desenho
            // que está plantado na bifurcação, em miniatura.
            g.fillStyle(C.madeiraDark, 1)
            g.fillRoundedRect(9, -21, 10, 42, 5)
            g.fillStyle(C.cream, 1)
            g.fillRoundedRect(11, -19, 6, 38, 3)
            g.fillStyle(C.nao, 1)
            g.fillRect(11, -19, 6, 9)
            g.fillRect(11, 2, 6, 9)
            g.fillStyle(C.gold, 1)
            g.fillRoundedRect(-18, -7, 38, 6, 3)
            g.fillStyle(C.verdeDark, 1)
            g.fillRoundedRect(-17, 1, 24, 20, 9)
            g.fillStyle(C.verde, 1)
            g.fillRoundedRect(-15, 3, 20, 16, 8)
            return g
        }

        const cor = COR[atributo]
        g.fillStyle(cor.line, 1)
        g.fillCircle(0, 0, 21)
        g.fillStyle(cor.fill, 1)
        g.fillCircle(0, 0, 17)
        g.fillStyle(C.white, 0.5)
        g.fillEllipse(-5, -7, 12, 8)
        return g
    }

    const pintarSelo = (g: Phaser.GameObjects.Graphics, ok: boolean) => {
        g.clear()
        g.fillStyle(ok ? C.okDark : C.naoDark, 1)
        g.fillCircle(0, 0, 17)
        g.fillStyle(ok ? C.ok : C.nao, 1)
        g.fillCircle(0, 0, 13.5)
        g.lineStyle(5, C.white, 1)
        if (ok) {
            g.beginPath()
            g.moveTo(-6, 0)
            g.lineTo(-1.5, 5.5)
            g.lineTo(7, -5.5)
            g.strokePath()
        } else {
            g.beginPath()
            g.moveTo(-5.5, -5.5)
            g.lineTo(5.5, 5.5)
            g.moveTo(5.5, -5.5)
            g.lineTo(-5.5, 5.5)
            g.strokePath()
        }
    }

    /** Uma ficha de termo: caixa com o ícone, a palavra, e o selo que acende. */
    function criarFichaTermo(t: Termo, comVerbo: boolean): Ficha {
        const item = scene.add.container(0, 0)

        const caixa = scene.add.graphics()
        caixa.fillStyle(C.madeiraDark, 1)
        caixa.fillRoundedRect(-4, -PLACA.icon / 2 - 4, PLACA.icon + 8, PLACA.icon + 8, 16)
        caixa.fillStyle(C.cream, 1)
        caixa.fillRoundedRect(0, -PLACA.icon / 2, PLACA.icon, PLACA.icon, 12)
        item.add(caixa)

        const art = criarIconeArt(t.atributo) as Phaser.GameObjects.Components.Transform &
            Phaser.GameObjects.GameObject
        art.setPosition(PLACA.icon / 2, 0)
        item.add(art)

        /*
         * O NÃO DE TERMO (nível 3) FALA POR DOIS CANAIS.
         *
         * O traço vermelho riscando o ícone é o sinal universal de "este não",
         * e ele continua legível na criaturinha de 19 px reais do celular. A
         * palavra já vem com o `NÃO` na frente e em vermelho, porque um símbolo
         * sozinho é vocabulário que a criança ainda não tem — e uma letra de
         * 5 px sozinha também não salva ninguém.
         */
        if (t.negado) {
            const risco = scene.add.graphics()
            const traco = () => {
                risco.beginPath()
                risco.moveTo(9, 21)
                risco.lineTo(PLACA.icon - 9, -21)
                risco.strokePath()
            }
            risco.lineStyle(12, C.naoDark, 1)
            traco()
            risco.lineStyle(6, C.nao, 1)
            traco()
            item.add(risco)
        }

        const texto = scene.add
            .text(PLACA.icon + PLACA.gap, 0, palavraDoTermo(t, comVerbo), {
                fontFamily: FONT.black,
                fontSize: comVerbo ? '31px' : '27px',
                color: t.negado ? CSS.naoDark : CSS.ink,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        item.add(texto)

        const selo = scene.add.graphics().setPosition(PLACA.icon - 4, -PLACA.icon / 2 - 2).setVisible(false)
        item.add(selo)

        return {
            container: item,
            largura: PLACA.icon + PLACA.gap + texto.width,
            negado: t.negado,
            acender(verdadeiro: boolean) {
                pintarSelo(selo, verdadeiro)
                selo.setVisible(true).setScale(0)
                void FX.to(scene, selo, { scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
            },
        }
    }

    /** A ficha do operador. Ela não julga um termo: ela JUNTA os dois. */
    function criarFichaOperador(op: 'e' | 'ou'): Ficha {
        const item = scene.add.container(0, 0)
        const rotulo = op === 'e' ? 'E' : 'OU'

        const texto = scene.add
            .text(0, -1, rotulo, { fontFamily: FONT.black, fontSize: '30px', color: CSS.cream })
            .setOrigin(0.5)
            .setResolution(2)

        const largura = Math.max(56, texto.width + 26)
        const fundo = scene.add.graphics()
        const pintarFundo = (cor: number, borda: number) => {
            fundo.clear()
            fundo.fillStyle(borda, 1)
            fundo.fillRoundedRect(0, -25, largura, 50, 16)
            fundo.fillStyle(cor, 1)
            fundo.fillRoundedRect(3, -22, largura - 6, 44, 13)
        }
        pintarFundo(C.inkSoft, C.ink)

        texto.setPosition(largura / 2, -1)
        item.add([fundo, texto])

        return {
            container: item,
            largura,
            negado: false,
            acender(verdadeiro: boolean) {
                pintarFundo(verdadeiro ? C.ok : C.nao, verdadeiro ? C.okDark : C.naoDark)
                void FX.impact(scene, item, 0.18)
            },
        }
    }

    // ── o carimbo ────────────────────────────────────────────────────────
    // ABAIXO da tábua, nunca por cima dela: o veredito não pode tapar a frase
    // que ele está julgando. Uma criança que lê "FALSO" sem conseguir reler
    // "É AZUL" perdeu justamente a metade que ensina.
    const carimbo = scene.add.container(0, halfH + 36).setVisible(false).setAngle(-5)
    root.add(carimbo)

    const pintarCarimbo = (verdadeiro: boolean) => {
        carimbo.removeAll(true)
        const w = verdadeiro ? 260 : 176
        const g = scene.add.graphics()
        g.fillStyle(C.white, 0.92)
        g.fillRoundedRect(-w / 2, -28, w, 56, 16)
        g.lineStyle(7, verdadeiro ? C.okDark : C.naoDark, 1)
        g.strokeRoundedRect(-w / 2, -28, w, 56, 16)
        const t = scene.add
            .text(0, 0, verdadeiro ? 'VERDADEIRO' : 'FALSO', {
                fontFamily: FONT.black,
                fontSize: '31px',
                color: verdadeiro ? CSS.ok : CSS.naoDark,
            })
            .setOrigin(0.5)
            .setResolution(2)
        carimbo.add([g, t])
    }

    let atual: Frase | null = null

    const setFrase = (f: Frase) => {
        atual = f
        limparFileira()

        const composta = Boolean(f.op && f.right)
        fichas.push(criarFichaTermo(f.left, !composta))

        if (composta && f.op && f.right) {
            opFicha = criarFichaOperador(f.op)
            fichas.push(opFicha)
            fichas.push(criarFichaTermo(f.right, false))
        }

        const total =
            fichas.reduce((soma, ficha) => soma + ficha.largura, 0) +
            PLACA.entreFichas * (fichas.length - 1)

        let x = -total / 2
        fichas.forEach(ficha => {
            ficha.container.setX(x)
            fileira.add(ficha.container)
            x += ficha.largura + PLACA.entreFichas
        })

        // `PEQUENA E ÓCULOS` é mais larga que `AZUL E BONÉ`, e uma tábua de
        // tamanho fixo não pode deixar a palavra escorrer para fora. A fileira
        // encolhe o quanto precisar — a diferença de corpo entre uma placa e
        // outra não se nota, e a palavra cortada se notaria na hora.
        const cabe = PLACA.w - 44
        escalaDaFileira = total > cabe ? cabe / total : 1
        fileira.setScale(escalaDaFileira)

        naoChip.setVisible(options.negada).setScale(1)
        fileira.setY(options.negada ? 22 : 0)
        carimbo.setVisible(false)
    }

    return {
        setFrase,

        /** O valor verdade desta placa — já com a negação, quando é a de baixo. */
        valor(c: Criatura): boolean {
            if (!atual) return false
            const bruto = avaliar(atual, c)
            return options.negada ? !bruto : bruto
        },

        /**
         * A avaliação termo a termo. É o coração do jogo: cada termo acende
         * sozinho, o operador junta os dois, o `NÃO` vira o resultado, e só
         * então o carimbo cai. Nunca tudo de uma vez.
         */
        async mostrarAvaliacao(c: Criatura, sons: SonsDaPlaca) {
            if (!atual) return

            const bruto = avaliar(atual, c)
            const final = options.negada ? !bruto : bruto

            const vlEsq = valeTermo(atual.left, c)
            fichas[0].acender?.(vlEsq)
            sons.termo(vlEsq)
            await FX.wait(scene, 520)

            if (atual.op && atual.right) {
                const vlDir = valeTermo(atual.right, c)
                fichas[2].acender?.(vlDir)
                sons.termo(vlDir)
                await FX.wait(scene, 520)

                opFicha?.acender?.(bruto)
                sons.termo(bruto)
                await FX.wait(scene, 460)
            }

            if (options.negada) {
                sons.vira(final)
                await FX.to(scene, naoChip, { scaleX: 0 }, { duration: 140 })
                naoChip.setScale(0, 1)
                await FX.to(scene, naoChip, { scaleX: 1.12 }, { duration: 160 })
                await FX.to(scene, naoChip, { scaleX: 1 }, { duration: 120 })
                await FX.wait(scene, 180)
            }

            pintarCarimbo(final)
            carimbo.setVisible(true).setScale(1.7).setAlpha(0).setY(halfH + 6)
            await FX.to(
                scene,
                carimbo,
                { scale: 1, alpha: 1, y: halfH + 36 },
                { duration: 280, ease: 'Back.easeOut' },
            )
            await FX.wait(scene, 520)
        },

        /**
         * Devolve a placa ao estado de pergunta. A fileira é REMONTADA, e não só
         * apagada: o selo de cada termo e a cor do operador são desenhados nas
         * próprias fichas, e um resto do julgamento anterior responderia a
         * pergunta seguinte antes de a criança olhar.
         */
        limpar() {
            carimbo.setVisible(false)
            naoChip.setScale(1)
            if (atual) setFrase(atual)
        },

        /** A dica depois de dois erros: a placa certa respira. */
        async piscar() {
            await FX.shake(scene, root, { amount: 7, times: 2 })
            FX.breathe(scene, root, { grow: 1.06, duration: 620 })
        },

        pararPiscar() {
            FX.kill(scene, root)
            root.setScale(1)
        },

        bounds() {
            return { x: PLACA.cx, y: cy, w: PLACA.w + 24, h: PLACA.h + 24 }
        },

        /** A ficha do primeiro termo NEGADO, para o tutorial do nível 3 apontar nela. */
        termoNegadoBounds() {
            const i = fichas.findIndex(f => f.negado)
            if (i < 0) return null
            const f = fichas[i]
            const s = escalaDaFileira
            return {
                x: PLACA.cx + (f.container.x + f.largura / 2) * s,
                y: cy + fileira.y,
                w: f.largura * s + 26,
                h: 92,
            }
        },

        /** A ficha do `NÃO` da frase inteira — a que só a placa de baixo tem. */
        naoBounds() {
            if (!options.negada) return null
            return { x: PLACA.cx, y: cy + naoChip.y, w: 116, h: 62 }
        },

        /** A ficha do operador, para o tutorial recortar o `E`/`OU` e não a tábua toda. */
        operadorBounds() {
            if (!opFicha) return null
            const s = escalaDaFileira
            return {
                x: PLACA.cx + (opFicha.container.x + opFicha.largura / 2) * s,
                y: cy + fileira.y,
                w: opFicha.largura * s + 26,
                h: 74,
            }
        },

        destroy() {
            FX.kill(scene, root)
            limparFileira()
            root.destroy(true)
        },
    }
}

export type Placa = ReturnType<typeof createPlaca>
