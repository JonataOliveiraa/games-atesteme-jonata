import {
    CASAS,
    CASA_POR_ID,
    IGREJA,
    LIMITE_CASA,
    LIMITE_NO,
    NOS,
    NO_POR_ID,
    POUSOS,
    PRACA,
    TRECHOS,
} from './layout'
import { ferramenta } from './ferramentas'
import type { Dia, Ferramenta, LevelDef, Problema, Veredito } from '../types'

type P = { x: number; y: number }

const dist = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y)

/** Distância de um ponto ao trecho, que é o que o círculo varre andando. */
export function distSegmento(p: P, a: P, b: P): number {
    const vx = b.x - a.x
    const vy = b.y - a.y
    const len = vx * vx + vy * vy
    if (len === 0) return dist(p, a)
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len))
    return dist(p, { x: a.x + t * vx, y: a.y + t * vy })
}

export const pontoDePlanta = (f: Ferramenta): P => (f.planta === 'igreja' ? IGREJA : PRACA)

const saidas = (no: string) => TRECHOS.filter(t => t.de === no)

export interface Rota {
    trechos: string[]
    nos: string[]
}

/** Toda rota que parte da praça e cabe no sol da ferramenta. */
export function rotas(sol: number): Rota[] {
    const out: Rota[] = []
    const trechos: string[] = []
    const nos: string[] = ['p']

    const anda = (no: string) => {
        out.push({ trechos: [...trechos], nos: [...nos] })
        if (trechos.length >= sol) return
        for (const t of saidas(no)) {
            if (nos.includes(t.para)) continue
            trechos.push(`${t.de}>${t.para}`)
            nos.push(t.para)
            anda(t.para)
            trechos.pop()
            nos.pop()
        }
    }

    anda('p')
    return out
}

/**
 * Todo trecho que a ferramenta CONSEGUE pisar com o sol que tem.
 *
 * É a união das rotas — os dois lados da bifurcação entram, porque os dois
 * estão ao alcance dela. Serve para a previsão desenhar o caminho possível
 * antes de a criança gastar, que é a outra metade da pergunta "até onde": o
 * círculo diz a LARGURA do alcance, e isto diz o COMPRIMENTO.
 */
export function trechosAoAlcance(sol: number): Array<{ de: string; para: string }> {
    const vistos = new Set<string>()
    for (const rota of rotas(sol)) for (const chave of rota.trechos) vistos.add(chave)
    return Array.from(vistos).map(chave => {
        const [de, para] = chave.split('>')
        return { de, para }
    })
}

const distDaRota = (casaId: string, rota: Rota): number => {
    const casa = CASA_POR_ID[casaId]
    let d = dist(casa, NO_POR_ID.p)
    for (const key of rota.trechos) {
        const [de, para] = key.split('>')
        d = Math.min(d, distSegmento(casa, NO_POR_ID[de], NO_POR_ID[para]))
    }
    return d
}

/** Quais casas o círculo acende percorrendo esta rota. */
export function coberturaDaRota(f: Ferramenta, rota: Rota): Set<string> {
    const acesas = new Set<string>()
    for (const casa of CASAS) {
        if (distDaRota(casa.id, rota) <= f.raio) acesas.add(casa.id)
    }
    return acesas
}

export function coberturaDosPousos(f: Ferramenta, pousos: P[]): Set<string> {
    const acesas = new Set<string>()
    for (const casa of CASAS) {
        if (pousos.some(p => dist(casa, p) <= f.raio)) acesas.add(casa.id)
    }
    return acesas
}

export function coberturaPlantada(f: Ferramenta): Set<string> {
    const p = pontoDePlanta(f)
    const acesas = new Set<string>()
    for (const casa of CASAS) {
        if (dist(casa, p) <= f.raio) acesas.add(casa.id)
    }
    return acesas
}

const cobre = (acesas: Set<string>, marcadas: string[]) => marcadas.every(id => acesas.has(id))

const subconjuntos = <T,>(lista: T[], max: number): T[][] => {
    const out: T[][] = []
    const atual: T[] = []
    const anda = (i: number) => {
        out.push([...atual])
        if (atual.length >= max) return
        for (let j = i; j < lista.length; j++) {
            atual.push(lista[j])
            anda(j + 1)
            atual.pop()
        }
    }
    anda(0)
    return out
}

/**
 * Existe algum jeito de esta ferramenta acender todas as marcadas?
 *
 * É a única pergunta que separa erro de ROTA de erro de FERRAMENTA (§9), e é
 * por isso que ela é uma busca, e não um campo guardado na fase.
 */
export function existeRota(f: Ferramenta, marcadas: string[]): boolean {
    if (!f.avisa || marcadas.length === 0) return false

    if (f.so === 'uma-casa') {
        if (marcadas.length !== 1) return false
        return rotas(f.sol).some(r => distDaRota(marcadas[0], r) <= f.raio)
    }

    if (f.andar === 'planta') return cobre(coberturaPlantada(f), marcadas)

    if (f.andar === 'voo') {
        return subconjuntos(POUSOS, f.sol).some(ps => cobre(coberturaDosPousos(f, ps), marcadas))
    }

    return rotas(f.sol).some(r => cobre(coberturaDaRota(f, r), marcadas))
}

export const resolve = existeRota

/**
 * O que o jogo pega ANTES de a ferramenta sair da mesa. Só duas coisas: uma
 * ferramenta que não alcança ninguém, e gastar a que vai fazer falta.
 * Tudo o mais se descobre correndo.
 */
export function jogar(
    f: Ferramenta,
    problema: Problema,
    kit: string[],
    aindaVem: Problema[],
): Veredito {
    if (!f.avisa) return { tipo: 'naoAvisa' }

    if (f.gasta && resolve(f, problema.marcadas)) {
        const sobra = kit.filter(id => id !== f.id).map(ferramenta)
        const orfao = aindaVem.find(p => !sobra.some(s => resolve(s, p.marcadas)))
        if (orfao) return { tipo: 'fazFalta', para: orfao.id }
    }

    return { tipo: 'pode' }
}

// ─────────────────────────────────────────────────────────── os níveis

/*
 * A `fala` é a faixa fina que entra no começo do problema, e ela tem uma forma
 * só: QUEM precisa saber, dois-pontos, O QUE é a notícia. Era o contrário — a
 * notícia sozinha, "O caminhão-pipa chega às dez!" — e aí a criança lia um aviso
 * que não pedia nada. O "quem" tem referênte na tela: são as casas de porta
 * aberta, com a luz caindo no chão.
 *
 * O `enunciado` não vai para a tela em lugar nenhum. Ele fica porque descreve o
 * problema para quem lê este arquivo.
 */
const DIA_1: Dia = {
    id: 'd1',
    titulo: 'O caminhão-pipa',
    falaExagero: 'Trouxe o MAIOR telão que existe! Olha o tamanho disso!',
    kit: ['carro', 'telao', 'sino', 'palpite'],
    problemas: [
        {
            id: 'd1p1',
            fala: 'A vila inteira precisa saber: o caminhão-pipa chega às dez.',
            enunciado: 'A vila TODA tem que descer com balde — até quem mora no morro.',
            vizinho: 2,
            marcadas: CASAS.map(c => c.id),
        },
        {
            id: 'd1p2',
            fala: 'Só estas quatro do meio: vai faltar água aqui amanhã.',
            enunciado: 'Estas quatro casas ficam sem água amanhã cedo.',
            vizinho: 3,
            marcadas: ['h4', 'h5', 'h6', 'h7'],
        },
    ],
}

const DIA_2: Dia = {
    id: 'd2',
    titulo: 'O morro',
    falaExagero: 'Hoje eu trouxe o drone! Voa por cima de TUDO!',
    kit: ['drone', 'bicicleta', 'quadro', 'palpite'],
    problemas: [
        {
            id: 'd2p1',
            fala: 'As casas lá do alto: o médico sobe o morro amanhã.',
            enunciado: 'As quatro casas lá de cima precisam saber.',
            vizinho: 4,
            marcadas: ['h9', 'h10', 'h11', 'h12'],
        },
        {
            id: 'd2p2',
            fala: 'E estas três da praça: o médico passa aqui também.',
            enunciado: 'Estas três casas também querem o recado do médico.',
            vizinho: 2,
            marcadas: ['h1', 'h2', 'h3'],
        },
    ],
}

const DIA_3: Dia = {
    id: 'd3',
    titulo: 'O dia do grandão',
    falaExagero: 'Eu avisei! O telão é o MAIOR! Hoje ele vai brilhar!',
    kit: ['telao', 'bilhete', 'quadro', 'palpite'],
    problemas: [
        {
            id: 'd3p1',
            fala: 'Estas três da praça: a festa mudou de hora.',
            enunciado: 'Quem mora em volta da praça precisa saber agora.',
            vizinho: 5,
            marcadas: ['h1', 'h2', 'h3'],
        },
        {
            id: 'd3p2',
            fala: 'Só o seu Ari: ele esqueceu o remédio em casa.',
            enunciado: 'É só avisar ele, naquela casa lá da ruazinha.',
            vizinho: 5,
            marcadas: ['h6'],
        },
        {
            id: 'd3p3',
            fala: 'Estas duas vão juntas: a horta comunitária abre cedo.',
            enunciado: 'Estas duas casas da praça combinaram de ir junto.',
            vizinho: 2,
            marcadas: ['h1', 'h2'],
        },
    ],
}

export const LEVELS: LevelDef[] = [
    { level: 1, nome: 'O dia da vila', dias: [DIA_1, DIA_2, DIA_3] },
]

// ─────────────────────────────────────────────────────────── a validação

function varrerDia(dia: Dia, nivel: number) {
    const visita = (i: number, kit: string[]): boolean => {
        if (i >= dia.problemas.length) return true
        const p = dia.problemas[i]
        const aindaVem = dia.problemas.slice(i + 1)
        let saida = false

        for (const id of kit) {
            const f = ferramenta(id)
            if (!resolve(f, p.marcadas)) continue
            const v = jogar(f, p, kit, aindaVem)
            if (v.tipo !== 'pode') {
                if (nivel === 1 && v.tipo === 'fazFalta') {
                    throw new Error(
                        `[kit] nível 1 não pode ter "faz falta": ${dia.id}/${p.id} com ${id}`,
                    )
                }
                continue
            }
            if (visita(i + 1, f.gasta ? kit.filter(x => x !== id) : kit)) saida = true
        }

        return saida
    }

    if (!visita(0, dia.kit)) throw new Error(`[kit] o dia ${dia.id} não tem saída`)
}

function validar() {
    for (const casa of CASAS) {
        if (casa.y > LIMITE_CASA) {
            throw new Error(`[kit] a casa ${casa.id} cai embaixo do painel do kit`)
        }
    }
    for (const no of NOS) {
        if (no.y > LIMITE_NO) {
            throw new Error(`[kit] o nó ${no.id} cai embaixo do painel do kit`)
        }
    }

    for (const nivel of LEVELS) {
        if (nivel.dias.length > 5) throw new Error(`[kit] o nível ${nivel.level} passa de 5 dias`)

        for (const dia of nivel.dias) {
            if (dia.kit.length > 4) throw new Error(`[kit] o kit do dia ${dia.id} passa de 4`)
            if (dia.problemas.length > 3) {
                throw new Error(`[kit] o dia ${dia.id} passa de 3 problemas`)
            }

            for (const p of dia.problemas) {
                if (!p.marcadas.length) throw new Error(`[kit] ${p.id} não marcou casa nenhuma`)
                for (const id of p.marcadas) {
                    if (!CASA_POR_ID[id]) throw new Error(`[kit] ${p.id} marca casa inexistente: ${id}`)
                }
                const ferramentas = dia.kit.map(ferramenta)
                if (!ferramentas.some(f => resolve(f, p.marcadas))) {
                    throw new Error(`[kit] ${p.id} não tem ferramenta que resolva no kit do dia`)
                }
                if (!ferramentas.some(f => !resolve(f, p.marcadas))) {
                    throw new Error(`[kit] ${p.id} não tem decisão: tudo no kit resolve`)
                }
            }

            varrerDia(dia, nivel.level)
        }
    }
}

if (import.meta.env?.DEV) validar()
