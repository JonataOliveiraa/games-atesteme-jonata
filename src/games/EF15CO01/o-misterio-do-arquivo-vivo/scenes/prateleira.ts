import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { C, LINHAS } from '../data/theme'
import { DEPTH, FICHA, FILA, GRADE, TEIA } from '../data/layout'
import { SHEETS, has } from '../data/files'
import { desenharRotuloCampo, desenharRotuloColuna } from './pecas'
import type { Estrutura } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PRATELEIRA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Desenhada em `Graphics`, **na mesma conta que posiciona as peças**. Foi essa
 * a lição da segunda versão do jogo: quando a grade era pintada dentro do vão
 * da barriga de um móvel-bicho, ela desencaixava, porque o vão andava de um
 * quadro da folha para outro. Aqui não há o que desencaixar.
 *
 * Todas as quatro nascem da mesma fábrica e falam a mesma interface, então a
 * `GameScene` não sabe com qual está lidando — ela só pede buracos e enche.
 * **É por isso que o nível 3 pôde pôr duas na tela sem tocar no laço do jogo.**
 */

export interface Buraco {
    indice: number
    x: number
    y: number
    lado: number
    cheio: boolean
    /** Na fila, só o próximo aceita — os outros nem acendem. */
    aberto: boolean
}

export interface Prateleira {
    readonly forma: Estrutura['forma']
    readonly buracos: Buraco[]
    acharBuraco(x: number, y: number): Buraco | undefined
    destacar(quais: number[]): void
    apagar(): void
    encher(indice: number): { x: number; y: number }
    /** Mostra onde era, quando a estrutura tem como mostrar. */
    mostrarOnde(indice: number): Promise<void>
    entrar(): Promise<void>
    destroy(): void
}

/** Onde e de que tamanho a estrutura nasce. O nível 3 encolhe e desloca. */
export interface Posto {
    cx: number
    cy?: number
    escala: number
}

export function criarPrateleira(scene: Phaser.Scene, est: Estrutura, posto: Posto): Prateleira {
    switch (est.forma) {
        case 'fila': return prateleiraFila(scene, est, posto)
        case 'grade': return prateleiraGrade(scene, est, posto)
        case 'ficha': return prateleiraFicha(scene, est, posto)
        case 'teia': return prateleiraTeia(scene, est, posto)
    }
}

/* ══════════════════════════════════════ FILA ═══════════════════════════ */

function prateleiraFila(scene: Phaser.Scene, est: Estrutura, posto: Posto): Prateleira {
    const e = posto.escala
    const n = est.fila ?? 4
    const passo = FILA.passo * e
    const lado = FILA.buraco * e
    const largura = n * passo
    const y = posto.cy ?? FILA.y
    const x0 = posto.cx - largura / 2 + passo / 2

    const tabua = scene.add.graphics().setDepth(DEPTH.prateleira)
    const vazios = scene.add.graphics().setDepth(DEPTH.buraco)
    const luz = scene.add.graphics().setDepth(DEPTH.buraco)
    const guia = scene.add.graphics().setDepth(DEPTH.buraco)

    const yBase = y + lado / 2 + 26 * e
    tabua.fillStyle(C.madeiraEscura, 1)
    tabua.fillRoundedRect(x0 - passo / 2 - FILA.aba * e, yBase, largura + FILA.aba * 2 * e, 34 * e, 14)
    tabua.fillStyle(C.madeira, 1)
    tabua.fillRoundedRect(x0 - passo / 2 - 16 * e, yBase + 5 * e, largura + 32 * e, 22 * e, 10)

    /**
     * A GUIA "DO MENOR PARA O MAIOR": uma escadinha de bolinhas crescendo com a
     * seta apontando para onde cresce. É a regra da fase dita em desenho — quem
     * não lê a frase do Tuca lê isto.
     */
    const gx0 = x0 - passo / 2 + 10 * e
    const gx1 = x0 + largura - passo / 2 - 10 * e
    const gy = y - lado / 2 - 48 * e
    guia.fillStyle(C.tinta, 0.26)
    guia.fillRoundedRect(gx0 - 14 * e, gy - 28 * e, gx1 - gx0 + 28 * e, 56 * e, 28 * e)
    for (let i = 0; i < 5; i++) {
        guia.fillStyle(C.tinta, 0.75)
        guia.fillCircle(gx0 + (gx1 - gx0 - 80 * e) * (i / 4), gy, (6 + i * 4.5) * e)
    }
    const ponta = gx1 - 6 * e
    guia.fillTriangle(ponta, gy, ponta - 34 * e, gy - 24 * e, ponta - 34 * e, gy + 24 * e)

    const buracos: Buraco[] = Array.from({ length: n }, (_, i) => ({
        indice: i, x: x0 + i * passo, y, lado, cheio: false, aberto: i === 0,
    }))

    const redesenhar = () => {
        vazios.clear()
        for (const b of buracos) {
            if (b.cheio) continue
            const r = b.lado / 2
            vazios.fillStyle(C.sombra, b.aberto ? 0.3 : 0.16)
            vazios.fillRoundedRect(b.x - r, b.y - r, b.lado, b.lado, 22 * e)
            vazios.lineStyle((b.aberto ? 7 : 4) * e, C.tinta, b.aberto ? 0.85 : 0.3)
            vazios.strokeRoundedRect(b.x - r, b.y - r, b.lado, b.lado, 22 * e)
        }
    }
    redesenhar()

    return {
        forma: 'fila',
        buracos,
        acharBuraco: perto(buracos, 14),
        destacar: aceso(scene, luz, buracos, 10, 26),
        apagar: apagador(scene, luz),
        encher(indice) {
            const b = buracos[indice]
            b.cheio = true
            const prox = buracos.find(o => !o.cheio)
            buracos.forEach(o => { o.aberto = o === prox })
            redesenhar()
            return { x: b.x, y: b.y }
        },
        /* A fila não tem o que mostrar: só um buraco aceita, então errar o
           lugar é impossível — o erro dela é de ORDEM, e quem explica isso é a
           peça menor piscando, lá na `GameScene`. */
        async mostrarOnde() {},
        entrar: entrada(scene, [tabua, vazios, guia]),
        destroy() { [tabua, vazios, luz, guia].forEach(o => o.destroy()) },
    }
}

/* ═════════════════════════════════════ GRADE ═══════════════════════════ */

function prateleiraGrade(scene: Phaser.Scene, est: Estrutura, posto: Posto): Prateleira {
    const e = posto.escala
    const linhas = est.grade?.linhas ?? 3
    const colunas = est.grade?.colunas ?? 3
    const cel = GRADE.cel * e
    const passo = cel + GRADE.vao * e
    const larg = colunas * passo - GRADE.vao * e
    const alt = linhas * passo - GRADE.vao * e
    const x0 = posto.cx - larg / 2 + cel / 2
    const y0 = (posto.cy ?? GRADE.y) - alt / 2 + cel / 2

    const moldura = scene.add.graphics().setDepth(DEPTH.prateleira)
    const vazios = scene.add.graphics().setDepth(DEPTH.buraco)
    const luz = scene.add.graphics().setDepth(DEPTH.buraco)
    const rotulos = scene.add.container(0, 0).setDepth(DEPTH.buraco)

    moldura.fillStyle(C.madeiraEscura, 1)
    moldura.fillRoundedRect(x0 - cel / 2 - 20 * e, y0 - cel / 2 - 20 * e, larg + 40 * e, alt + 40 * e, 24 * e)
    moldura.fillStyle(C.madeira, 1)
    moldura.fillRoundedRect(x0 - cel / 2 - 12 * e, y0 - cel / 2 - 12 * e, larg + 24 * e, alt + 24 * e, 18 * e)

    const cx = (c: number) => x0 + c * passo
    const cy = (l: number) => y0 + l * passo
    const fora = GRADE.rotuloFora * e

    /* AS ETIQUETAS FICAM FORA DA MOLDURA. Dentro, cairiam por cima das células
       que elas servem para explicar. */
    const gr = scene.add.graphics()
    rotulos.add(gr)
    for (let c = 0; c < colunas; c++) desenharRotuloColuna(gr, c, cx(c), y0 - cel / 2 - fora, 32 * e)
    for (let l = 0; l < linhas; l++) {
        const x = x0 - cel / 2 - fora
        if (has(scene, SHEETS.bichinhos.key)) {
            const b = scene.add.image(x, cy(l), SHEETS.bichinhos.key, LINHAS[l].frame)
            b.setDisplaySize(78 * e, 78 * e)
            rotulos.add(b)
        } else {
            gr.fillStyle(C.madeiraEscura, 1)
            gr.fillCircle(x, cy(l), 32 * e)
        }
    }

    const buracos: Buraco[] = []
    for (let l = 0; l < linhas; l++) {
        for (let c = 0; c < colunas; c++) {
            buracos.push({ indice: l * 3 + c, x: cx(c), y: cy(l), lado: cel, cheio: false, aberto: true })
        }
    }

    const redesenhar = () => {
        vazios.clear()
        for (const b of buracos) {
            if (b.cheio) continue
            const r = b.lado / 2
            vazios.fillStyle(C.sombra, 0.24)
            vazios.fillRoundedRect(b.x - r, b.y - r, b.lado, b.lado, 18 * e)
            vazios.lineStyle(5 * e, C.tinta, 0.4)
            vazios.strokeRoundedRect(b.x - r, b.y - r, b.lado, b.lado, 18 * e)
        }
    }
    redesenhar()

    return {
        forma: 'grade',
        buracos,
        acharBuraco: perto(buracos, 8),
        destacar: aceso(scene, luz, buracos, 8, 22),
        apagar: apagador(scene, luz),
        encher(indice) {
            const b = buracos.find(o => o.indice === indice)!
            b.cheio = true
            redesenhar()
            return { x: b.x, y: b.y }
        },
        /**
         * A CRUZ. Uma faixa acende a linha inteira, outra a coluna inteira, e
         * onde se cruzam está o lugar. É a matriz se explicando sozinha — por
         * isso o erro da grade não precisa de frase.
         */
        async mostrarOnde(indice) {
            const l = Math.floor(indice / 3)
            const c = indice % 3
            const g = scene.add.graphics().setDepth(DEPTH.buraco + 1)
            g.fillStyle(C.ambar, 0.4)
            g.fillRoundedRect(x0 - cel / 2, cy(l) - cel / 2, larg, cel, 16 * e)
            g.fillRoundedRect(cx(c) - cel / 2, y0 - cel / 2, cel, alt, 16 * e)
            g.fillStyle(C.ambar, 0.85)
            g.fillRoundedRect(cx(c) - cel / 2, cy(l) - cel / 2, cel, cel, 16 * e)
            await piscaEsome(scene, g)
        },
        entrar: entrada(scene, [moldura, vazios, rotulos]),
        destroy() { [moldura, vazios, luz, rotulos].forEach(o => o.destroy()) },
    }
}

/* ═════════════════════════════════════ FICHA ═══════════════════════════ */

/**
 * A FICHA É A ESTRUTURA MAIS FÁCIL DE LER, e por isso abre o nível 2.
 *
 * Cada campo é uma linha com o **rótulo à esquerda** e o **buraco à direita**.
 * O rótulo mostra o mesmo pictograma que o valor certo carrega — patinha para
 * "qual bicho", manchas para "que cor", círculos crescendo para "de que
 * tamanho". É casar desenho com desenho, e é exatamente o que um registro é:
 * cada informação com o nome dela ao lado.
 */
function prateleiraFicha(scene: Phaser.Scene, est: Estrutura, posto: Posto): Prateleira {
    const e = posto.escala
    const campos = est.ficha ?? []
    const larg = FICHA.larg * e
    const alturaCampo = FICHA.campoH * e
    const vao = FICHA.vao * e
    const alt = campos.length * alturaCampo + (campos.length - 1) * vao
    const x = posto.cx
    const y0 = (posto.cy ?? FICHA.y) - alt / 2 + alturaCampo / 2

    const cartao = scene.add.graphics().setDepth(DEPTH.prateleira)
    const vazios = scene.add.graphics().setDepth(DEPTH.buraco)
    const luz = scene.add.graphics().setDepth(DEPTH.buraco)

    cartao.fillStyle(C.madeiraEscura, 1)
    cartao.fillRoundedRect(x - larg / 2 - 18 * e, y0 - alturaCampo / 2 - 18 * e, larg + 36 * e, alt + 36 * e, 22 * e)
    cartao.fillStyle(C.creme, 1)
    cartao.fillRoundedRect(x - larg / 2 - 10 * e, y0 - alturaCampo / 2 - 10 * e, larg + 20 * e, alt + 20 * e, 16 * e)

    const linhaY = (i: number) => y0 + i * (alturaCampo + vao)
    const buracoX = x + larg / 2 - FICHA.buraco * e / 2 - 18 * e
    const lado = FICHA.buraco * e

    campos.forEach((tipo, i) => {
        const yy = linhaY(i)
        cartao.fillStyle(C.papel, 1)
        cartao.fillRoundedRect(x - larg / 2, yy - alturaCampo / 2, larg, alturaCampo, 14 * e)
        desenharRotuloCampo(cartao, tipo, x - larg / 2 + FICHA.rotulo * e / 2 + 18 * e, yy, FICHA.rotulo * e / 2)
        /* O tracinho entre o rótulo e o buraco liga os dois: "este nome vale
           para aquele lugar". */
        cartao.lineStyle(5 * e, C.tinta, 0.28)
        cartao.lineBetween(x - larg / 2 + FICHA.rotulo * e + 34 * e, yy, buracoX - lado / 2 - 16 * e, yy)
    })

    const buracos: Buraco[] = campos.map((_, i) => ({
        indice: i, x: buracoX, y: linhaY(i), lado, cheio: false, aberto: true,
    }))

    const redesenhar = () => {
        vazios.clear()
        for (const b of buracos) {
            if (b.cheio) continue
            const r = b.lado / 2
            vazios.fillStyle(C.sombra, 0.2)
            vazios.fillRoundedRect(b.x - r, b.y - r, b.lado, b.lado, 14 * e)
            vazios.lineStyle(5 * e, C.tinta, 0.45)
            vazios.strokeRoundedRect(b.x - r, b.y - r, b.lado, b.lado, 14 * e)
        }
    }
    redesenhar()

    return {
        forma: 'ficha',
        buracos,
        acharBuraco: perto(buracos, 12),
        destacar: aceso(scene, luz, buracos, 9, 18),
        apagar: apagador(scene, luz),
        encher(indice) {
            const b = buracos[indice]
            b.cheio = true
            redesenhar()
            return { x: b.x, y: b.y }
        },
        /** Acende a LINHA inteira do campo certo: o rótulo e o buraco juntos. */
        async mostrarOnde(indice) {
            const yy = linhaY(indice)
            const g = scene.add.graphics().setDepth(DEPTH.buraco + 1)
            g.fillStyle(C.ambar, 0.55)
            g.fillRoundedRect(x - larg / 2, yy - alturaCampo / 2, larg, alturaCampo, 14 * e)
            await piscaEsome(scene, g)
        },
        entrar: entrada(scene, [cartao, vazios]),
        destroy() { [cartao, vazios, luz].forEach(o => o.destroy()) },
    }
}

/* ══════════════════════════════════════ TEIA ═══════════════════════════ */

/**
 * A TEIA: pontos espalhados e um buraco no MEIO de cada fio que falta.
 *
 * O fio pontilhado já liga os dois pontos; o que falta é o pedaço do meio. A
 * peça é um cartãozinho com as duas pontas lado a lado, então encaixar é dizer
 * "este par se liga" — que é a única coisa que um grafo guarda.
 */
function prateleiraTeia(scene: Phaser.Scene, est: Estrutura, posto: Posto): Prateleira {
    const e = posto.escala
    const nos = est.teia?.nos ?? []
    const ligacoes = est.teia?.ligacoes ?? []
    const larg = TEIA.larg * e
    const alt = TEIA.alt * e
    const x = posto.cx
    const y = posto.cy ?? TEIA.y

    const moldura = scene.add.graphics().setDepth(DEPTH.prateleira)
    const fios = scene.add.graphics().setDepth(DEPTH.prateleira + 1)
    const pontos = scene.add.container(0, 0).setDepth(DEPTH.buraco - 1)
    const vazios = scene.add.graphics().setDepth(DEPTH.buraco)
    const luz = scene.add.graphics().setDepth(DEPTH.buraco)

    moldura.fillStyle(C.madeiraEscura, 1)
    moldura.fillRoundedRect(x - larg / 2 - 16 * e, y - alt / 2 - 16 * e, larg + 32 * e, alt + 32 * e, 22 * e)
    moldura.fillStyle(C.papel, 1)
    moldura.fillRoundedRect(x - larg / 2 - 8 * e, y - alt / 2 - 8 * e, larg + 16 * e, alt + 16 * e, 16 * e)

    const px = (n: { x: number }) => x - larg / 2 + n.x * larg
    const py = (n: { y: number }) => y - alt / 2 + n.y * alt

    /* O fio pontilhado mostra QUE existe uma ligação ali; o buraco no meio dele
       é o pedaço que a criança põe. */
    ligacoes.forEach(([a, b]) => {
        const ax = px(nos[a]), ay = py(nos[a])
        const bx = px(nos[b]), by = py(nos[b])
        const passos = 14
        for (let i = 0; i < passos; i += 2) {
            const t0 = i / passos, t1 = (i + 1) / passos
            fios.lineStyle(8 * e, C.tinta, 0.22)
            fios.lineBetween(
                ax + (bx - ax) * t0, ay + (by - ay) * t0,
                ax + (bx - ax) * t1, ay + (by - ay) * t1,
            )
        }
    })

    nos.forEach(n => {
        const key = n.coisa ? SHEETS.coisas.key : SHEETS.bichinhos.key
        const gx = px(n), gy = py(n)
        const anel = scene.add.graphics()
        anel.fillStyle(C.creme, 1)
        anel.lineStyle(6 * e, C.tinta, 1)
        anel.fillCircle(gx, gy, TEIA.no * e / 2)
        anel.strokeCircle(gx, gy, TEIA.no * e / 2)
        pontos.add(anel)
        if (has(scene, key)) {
            const img = scene.add.image(gx, gy, key, n.frame)
            img.setDisplaySize(TEIA.no * e * 0.74, TEIA.no * e * 0.74)
            pontos.add(img)
        }
    })

    const lado = TEIA.buraco * e
    const buracos: Buraco[] = ligacoes.map(([a, b], i) => ({
        indice: i,
        x: (px(nos[a]) + px(nos[b])) / 2,
        y: (py(nos[a]) + py(nos[b])) / 2,
        lado,
        cheio: false,
        aberto: true,
    }))

    const redesenhar = () => {
        vazios.clear()
        for (const b of buracos) {
            if (b.cheio) continue
            const r = b.lado / 2
            vazios.fillStyle(C.sombra, 0.2)
            vazios.fillCircle(b.x, b.y, r)
            vazios.lineStyle(5 * e, C.tinta, 0.45)
            vazios.strokeCircle(b.x, b.y, r)
        }
    }
    redesenhar()

    return {
        forma: 'teia',
        buracos,
        acharBuraco: perto(buracos, 14),
        destacar(quais) {
            luz.clear()
            for (const i of quais) {
                const b = buracos.find(o => o.indice === i)
                if (!b || b.cheio) continue
                luz.lineStyle(9 * e, C.ambar, 1)
                luz.strokeCircle(b.x, b.y, b.lado / 2 + 9 * e)
            }
            pulsar(scene, luz)
        },
        apagar: apagador(scene, luz),
        encher(indice) {
            const b = buracos[indice]
            b.cheio = true
            redesenhar()
            return { x: b.x, y: b.y }
        },
        /** Acende o FIO inteiro, de ponta a ponta: "era entre estes dois". */
        async mostrarOnde(indice) {
            const [a, b] = ligacoes[indice]
            const g = scene.add.graphics().setDepth(DEPTH.buraco + 1)
            g.lineStyle(16 * e, C.ambar, 0.8)
            g.lineBetween(px(nos[a]), py(nos[a]), px(nos[b]), py(nos[b]))
            g.fillStyle(C.ambar, 0.5)
            g.fillCircle(px(nos[a]), py(nos[a]), TEIA.no * e / 2 + 8 * e)
            g.fillCircle(px(nos[b]), py(nos[b]), TEIA.no * e / 2 + 8 * e)
            await piscaEsome(scene, g)
        },
        entrar: entrada(scene, [moldura, fios, pontos, vazios]),
        destroy() { [moldura, fios, pontos, vazios, luz].forEach(o => o.destroy()) },
    }
}

/* ═══════════════════════════════ peças comuns ══════════════════════════ */

type Alvo = Phaser.GameObjects.Graphics | Phaser.GameObjects.Container

const perto = (buracos: Buraco[], folga: number) =>
    (x: number, y: number) =>
        buracos.find(
            b => !b.cheio &&
                Math.abs(x - b.x) <= b.lado / 2 + folga &&
                Math.abs(y - b.y) <= b.lado / 2 + folga,
        )

const aceso = (
    scene: Phaser.Scene,
    luz: Phaser.GameObjects.Graphics,
    buracos: Buraco[],
    folga: number,
    raio: number,
) => (quais: number[]) => {
    luz.clear()
    for (const i of quais) {
        const b = buracos.find(o => o.indice === i)
        if (!b || b.cheio) continue
        const r = b.lado / 2 + folga
        luz.lineStyle(9, C.ambar, 1)
        luz.strokeRoundedRect(b.x - r, b.y - r, r * 2, r * 2, raio)
    }
    pulsar(scene, luz)
}

const apagador = (scene: Phaser.Scene, luz: Phaser.GameObjects.Graphics) => () => {
    scene.tweens.killTweensOf(luz)
    luz.clear()
    luz.setAlpha(1)
}

const entrada = (scene: Phaser.Scene, partes: Alvo[]) => async () => {
    partes.forEach(p => p.setAlpha(0))
    await FX.all(
        ...partes.map((p, i) => FX.to(scene, p, { alpha: 1 }, { duration: 280, delay: i * 90 })),
    )
}

async function piscaEsome(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics) {
    g.setAlpha(0)
    await FX.to(scene, g, { alpha: 1 }, { duration: 200 })
    await FX.wait(scene, 900)
    await FX.to(scene, g, { alpha: 0 }, { duration: 260 })
    g.destroy()
}

function pulsar(scene: Phaser.Scene, g: Phaser.GameObjects.Graphics) {
    scene.tweens.killTweensOf(g)
    g.setAlpha(1)
    scene.tweens.add({
        targets: g,
        alpha: { from: 1, to: 0.35 },
        duration: 620,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })
}
