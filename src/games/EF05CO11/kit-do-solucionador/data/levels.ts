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
 * O QUE UMA FERRAMENTA CONSEGUE ACENDER, no melhor caso.
 *
 * Não é "ela resolve?", é "até onde ela chega?" — e é essa a pergunta do
 * problema que pede duas: a primeira acende o que alcança, e o que sobrou
 * escuro é o problema da segunda.
 */
export function alcanceMaximo(f: Ferramenta): Set<string> {
    if (!f.avisa) return new Set()
    if (f.andar === 'planta') return coberturaPlantada(f)

    const todas = new Set<string>()
    if (f.andar === 'voo') {
        for (const p of POUSOS) for (const casa of coberturaDosPousos(f, [p])) todas.add(casa)
        return todas
    }
    for (const r of rotas(f.sol)) for (const casa of coberturaDaRota(f, r)) todas.add(casa)
    return todas
}

/**
 * Duas ferramentas juntas dão conta?
 *
 * Cada uma faz a rota DELA — não existe rota combinada. Por isso a conta é a
 * união do que cada uma consegue sozinha, e não uma busca sobre as duas ao
 * mesmo tempo: são duas corridas, uma depois da outra.
 */
export function resolvePar(a: Ferramenta, b: Ferramenta, marcadas: string[]): boolean {
    if (!a.avisa || !b.avisa || !marcadas.length) return false
    const minhas = marcadas.filter(id => alcanceMaximo(a).has(id))
    const dela = marcadas.filter(id => alcanceMaximo(b).has(id))
    if (!minhas.length || !dela.length) return false
    if (!marcadas.every(id => minhas.includes(id) || dela.includes(id))) return false
    // cada uma tem de dar conta da SUA parte numa corrida só
    return resolve(a, minhas) && resolve(b, dela)
}

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

/*
 * ══════════════════════════════════════════════════════════════════════════
 *  NÍVEL 2 — O SOL
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O círculo já foi aprendido. O assunto agora é o COMPRIMENTO: o sol acaba, e
 * na bifurcação a ferramenta para e espera. Os problemas daqui separam as
 * casas ALTAS das casas da RUAZINHA — e com círculo pequeno não dá para servir
 * os dois lados na mesma corrida. Escolher o ramo errado não custa nada além
 * do dia: a ferramenta volta para a mesa e a criança escolhe de novo.
 */
const DIA_4: Dia = {
    id: 'd4',
    titulo: 'De que lado?',
    falaExagero: 'O telão de novo! Ele não anda, mas ele é GRANDE!',
    kit: ['bicicleta', 'bilhete', 'telao', 'palpite'],
    problemas: [
        {
            id: 'd4p1',
            fala: 'Estas três da praça: a feira mudou de dia.',
            enunciado: 'As três casas em volta da praça precisam saber.',
            vizinho: 2,
            marcadas: ['h1', 'h2', 'h3'],
        },
        {
            id: 'd4p2',
            fala: 'As duas lá de cima: o poço vai ser limpo amanhã.',
            enunciado: 'Só quem mora no caminho de cima usa aquele poço.',
            vizinho: 4,
            marcadas: ['h5', 'h7'],
        },
        {
            id: 'd4p3',
            fala: 'Só a casa da ruazinha: chegou encomenda pra ela.',
            enunciado: 'Uma casa só, e ela fica do outro lado da bifurcação.',
            vizinho: 3,
            marcadas: ['h6'],
        },
    ],
}

const DIA_5: Dia = {
    id: 'd5',
    titulo: 'O sol no morro',
    falaExagero: 'Hoje eu subo o morro com o MAIOR carro de som da vila!',
    kit: ['carro', 'drone', 'sino', 'palpite'],
    problemas: [
        {
            id: 'd5p1',
            fala: 'Estas quatro do meio: vai ter mutirão na horta.',
            enunciado: 'O miolo da vila inteiro, e nada além dele.',
            vizinho: 2,
            marcadas: ['h4', 'h5', 'h6', 'h7'],
        },
        {
            id: 'd5p2',
            fala: 'As quatro lá do alto: o ônibus escolar muda de horário.',
            enunciado: 'Só o morro — e o sol mal dá pra chegar lá em cima.',
            vizinho: 4,
            marcadas: ['h9', 'h10', 'h11', 'h12'],
        },
        {
            id: 'd5p3',
            fala: 'E estas três da praça: a feira volta pro sábado.',
            enunciado: 'De volta ao começo da estrada, com o que sobrou na mesa.',
            vizinho: 5,
            marcadas: ['h1', 'h2', 'h3'],
        },
    ],
}

const DIA_6: Dia = {
    id: 'd6',
    titulo: 'A ruazinha e o alto',
    falaExagero: 'Um dia desses eu levo o telão pro morro. Você vai ver!',
    kit: ['bicicleta', 'carro', 'quadro', 'palpite'],
    problemas: [
        {
            id: 'd6p1',
            fala: 'Estas duas da praça: o correio passa mais cedo.',
            enunciado: 'Duas casas coladas na praça — a ferramenta nem precisa sair.',
            vizinho: 3,
            marcadas: ['h1', 'h2'],
        },
        {
            id: 'd6p2',
            fala: 'A da ruazinha e a do fim da reta: vai passar caminhão.',
            enunciado: 'As duas estão no caminho de BAIXO, e só nele.',
            vizinho: 2,
            marcadas: ['h6', 'h8'],
        },
        {
            id: 'd6p3',
            fala: 'As duas lá no alto do morro: a água volta hoje.',
            enunciado: 'O fim da subida, que é onde o sol quase não chega.',
            vizinho: 4,
            marcadas: ['h10', 'h11'],
        },
    ],
}

/*
 * ══════════════════════════════════════════════════════════════════════════
 *  NÍVEL 3 — O QUE NÃO GASTA, E O QUE PEDE DUAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Duas descobertas, e as duas são sobre a MESA. A primeira: algumas
 * ferramentas voltam — o sino toca de novo, a porta continua lá, o quadro
 * fica no poste —, e elas são a resposta do dia inteiro em vez de a resposta
 * de um problema. A segunda: existe recado que nenhum círculo cobre sozinho,
 * e aí vão duas, uma depois da outra.
 */
const DIA_7: Dia = {
    id: 'd7',
    titulo: 'A mesa não esvazia',
    falaExagero: 'Eu trouxe o telão! Um telão resolve tudo! ...resolve?',
    kit: ['porta', 'telao', 'bilhete', 'palpite'],
    problemas: [
        {
            id: 'd7p1',
            fala: 'Estas três da praça: a reunião é hoje à noite.',
            enunciado: 'A praça inteira, e é o único problema que o telão pega.',
            vizinho: 2,
            marcadas: ['h1', 'h2', 'h3'],
        },
        {
            id: 'd7p2',
            fala: 'Estas duas do caminho de cima: falta luz na parte alta.',
            enunciado: 'Duas casas do ramo de cima, perto uma da outra.',
            vizinho: 4,
            marcadas: ['h4', 'h5'],
        },
        {
            id: 'd7p3',
            fala: 'Só a da ruazinha: o gás dela chegou.',
            enunciado: 'Uma casa só, do outro lado da bifurcação.',
            vizinho: 3,
            marcadas: ['h6'],
        },
    ],
}

const DIA_8: Dia = {
    id: 'd8',
    titulo: 'O sino toca de novo',
    falaExagero: 'Carro de som! Esse sim! Esse dá pra usar o dia inteiro!',
    kit: ['sino', 'carro', 'bilhete', 'palpite'],
    problemas: [
        {
            id: 'd8p1',
            fala: 'Estas quatro do meio: o médico chega ao meio-dia.',
            enunciado: 'O miolo da vila, exatamente o que o sino alcança.',
            vizinho: 2,
            marcadas: ['h4', 'h5', 'h6', 'h7'],
        },
        {
            id: 'd8p2',
            fala: 'Estas duas, de novo no meio: a consulta atrasou.',
            enunciado: 'A mesma região, outra notícia — e o sino continua lá.',
            vizinho: 3,
            marcadas: ['h5', 'h6'],
        },
        {
            id: 'd8p3',
            fala: 'As duas do meio do morro: o médico sobe depois.',
            enunciado: 'Longe, e só uma ferramenta do kit chega até lá.',
            vizinho: 4,
            marcadas: ['h9', 'h10'],
        },
    ],
}

const DIA_9: Dia = {
    id: 'd9',
    titulo: 'Duas de uma vez',
    falaExagero: 'Uma ferramenta só? Pra isso? Nem a MINHA dá conta!',
    kit: ['quadro', 'drone', 'bilhete', 'palpite'],
    problemas: [
        {
            id: 'd9p1',
            fala: 'Estas duas da praça: a escola abre mais tarde.',
            enunciado: 'A praça, com o quadro que fica no poste.',
            vizinho: 2,
            marcadas: ['h1', 'h2'],
        },
        {
            id: 'd9p2',
            fala: 'A da praça E a lá do alto: as duas ganharam horta.',
            enunciado:
                'Uma na praça e a outra no alto do morro. Nenhum círculo da vila'
                + ' cobre as duas: vão duas ferramentas, uma de cada vez.',
            vizinho: 5,
            marcadas: ['h2', 'h11'],
            duas: true,
        },
    ],
}

export const LEVELS: LevelDef[] = [
    { level: 1, nome: 'O dia da vila', dias: [DIA_1, DIA_2, DIA_3] },
    { level: 2, nome: 'O sol', dias: [DIA_4, DIA_5, DIA_6] },
    { level: 3, nome: 'O que fica na mesa', dias: [DIA_7, DIA_8, DIA_9] },
]

// ─────────────────────────────────────────────────────────── a validação

function varrerDia(dia: Dia, nivel: number) {
    const visita = (i: number, kit: string[]): boolean => {
        if (i >= dia.problemas.length) return true
        const p = dia.problemas[i]
        const aindaVem = dia.problemas.slice(i + 1)
        let saida = false

        /*
         * O PROBLEMA QUE PEDE DUAS anda de par em par.
         *
         * A ordem importa para o que sobra na mesa: mandar primeiro a que
         * gasta e depois a que fica não é o mesmo kit do contrário. Por isso
         * os dois sentidos entram na busca.
         */
        if (p.duas) {
            for (const a of kit) {
                for (const b of kit) {
                    if (a === b) continue
                    const fa = ferramenta(a)
                    const fb = ferramenta(b)
                    if (!resolvePar(fa, fb, p.marcadas)) continue
                    const resto = kit.filter(x => !(x === a && fa.gasta) && !(x === b && fb.gasta))
                    if (visita(i + 1, resto)) saida = true
                }
            }
            return saida
        }

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

                if (p.duas) {
                    if (nivel.level !== 3) {
                        throw new Error(`[kit] ${p.id}: o problema de duas é o assunto do nível 3`)
                    }
                    if (ferramentas.some(f => resolve(f, p.marcadas))) {
                        throw new Error(`[kit] ${p.id} pede duas e alguém do kit resolve sozinho`)
                    }
                    const par = ferramentas.some(a =>
                        ferramentas.some(b => a !== b && resolvePar(a, b, p.marcadas)))
                    if (!par) throw new Error(`[kit] ${p.id} pede duas e nenhum par do kit dá conta`)
                    continue
                }

                if (!ferramentas.some(f => resolve(f, p.marcadas))) {
                    throw new Error(`[kit] ${p.id} não tem ferramenta que resolva no kit do dia`)
                }
                if (!ferramentas.some(f => !resolve(f, p.marcadas))) {
                    throw new Error(`[kit] ${p.id} não tem decisão: tudo no kit resolve`)
                }
            }

            /*
             * A ROTA É DECISÃO — a regra do nível 2.
             *
             * Não basta existir solução: tem de existir um problema em que a
             * ferramenta certa ainda pode errar o RAMO. Sem isto o nível 2
             * vira o nível 1 com outras casas, e a bifurcação nunca é uma
             * pergunta de verdade.
             */
            if (nivel.level === 2) {
                const temEscolha = dia.problemas.some(p =>
                    dia.kit.map(ferramenta).some(f => {
                        if (f.andar !== 'estrada' || !resolve(f, p.marcadas)) return false
                        const possiveis = rotas(f.sol)
                        return possiveis.some(r => !cobre(coberturaDaRota(f, r), p.marcadas))
                            && possiveis.some(r => cobre(coberturaDaRota(f, r), p.marcadas))
                    }))
                if (!temEscolha) {
                    throw new Error(`[kit] o dia ${dia.id} não tem escolha de rota — é nível 1`)
                }
            }

            varrerDia(dia, nivel.level)
        }
    }
}

if (import.meta.env?.DEV) validar()
