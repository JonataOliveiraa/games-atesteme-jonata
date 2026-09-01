import type { Caso, Criterio, Ficha, FieldId, Level } from '../types'

/**
 * O arquivo: doze crianças, cinco campos cada.
 *
 * Os nomes foram escolhidos para combinar com o retrato de cada uma — a ficha é
 * um documento, e documento com foto que não bate com o nome é a primeira coisa
 * que uma criança de 9 anos estranha.
 *
 * ── COMO OS CASOS SÃO ARMADOS ────────────────────────────────────────────
 *
 * Em todo caso de filtro e de identificação, os distratores compartilham UM dos
 * campos com a resposta. Se o primeiro campo já resolvesse, o segundo seria
 * enfeite — e a habilidade é justamente cruzar mais de um campo.
 */

export const FICHAS: Ficha[] = [
    { id: 'bia', nome: 'Bia', portrait: 'portrait-1', cidade: 'Recife', ano: '2015', esporte: 'Vôlei', comida: 'Tapioca', bicho: 'Gato' },
    { id: 'alice', nome: 'Alice', portrait: 'portrait-2', cidade: 'Salvador', ano: '2015', esporte: 'Vôlei', comida: 'Pizza', bicho: 'Cachorro' },
    { id: 'manu', nome: 'Manu', portrait: 'portrait-3', cidade: 'Curitiba', ano: '2016', esporte: 'Judô', comida: 'Pizza', bicho: 'Coelho' },
    { id: 'theo', nome: 'Théo', portrait: 'portrait-4', cidade: 'Recife', ano: '2016', esporte: 'Futebol', comida: 'Pizza', bicho: 'Cachorro' },
    { id: 'caio', nome: 'Caio', portrait: 'portrait-5', cidade: 'Manaus', ano: '2014', esporte: 'Futebol', comida: 'Macarrão', bicho: 'Papagaio' },
    { id: 'iara', nome: 'Iara', portrait: 'portrait-6', cidade: 'Belém', ano: '2015', esporte: 'Vôlei', comida: 'Açaí', bicho: 'Tartaruga' },
    { id: 'davi', nome: 'Davi', portrait: 'portrait-7', cidade: 'Salvador', ano: '2014', esporte: 'Futebol', comida: 'Feijoada', bicho: 'Gato' },
    { id: 'sofia', nome: 'Sofia', portrait: 'portrait-8', cidade: 'Recife', ano: '2015', esporte: 'Natação', comida: 'Macarrão', bicho: 'Coelho' },
    { id: 'malu', nome: 'Malu', portrait: 'portrait-9', cidade: 'Curitiba', ano: '2014', esporte: 'Vôlei', comida: 'Pizza', bicho: 'Gato' },
    { id: 'enzo', nome: 'Enzo', portrait: 'portrait-10', cidade: 'Manaus', ano: '2016', esporte: 'Judô', comida: 'Tapioca', bicho: 'Cachorro' },
    { id: 'yuna', nome: 'Yuna', portrait: 'portrait-11', cidade: 'Belém', ano: '2016', esporte: 'Natação', comida: 'Pizza', bicho: 'Tartaruga' },
    { id: 'nina', nome: 'Nina', portrait: 'portrait-12', cidade: 'Salvador', ano: '2016', esporte: 'Vôlei', comida: 'Feijoada', bicho: 'Papagaio' },
]

const byId = new Map(FICHAS.map(f => [f.id, f]))

export const fichaOf = (id: string): Ficha | undefined => byId.get(id)

export const valueOf = (ficha: Ficha, field: FieldId): string => ficha[field]

/** Uma ficha passa quando TODOS os critérios batem. */
export const passes = (ficha: Ficha, criterios: Criterio[]): boolean =>
    criterios.every(c => valueOf(ficha, c.field) === c.value)

/** O primeiro critério que esta ficha não atende. Serve para explicar a recusa. */
export const firstMiss = (ficha: Ficha, criterios: Criterio[]): Criterio | null =>
    criterios.find(c => valueOf(ficha, c.field) !== c.value) ?? null

const crit = (field: FieldId, value: string): Criterio => ({ field, value })

export const LEVELS: Level[] = [

    /* ────────────────────────────── NÍVEL 1 — cada campo tem um nome */
    {
        level: 1,
        title: 'Cada campo tem um nome',
        objective: 'Quem dá sentido ao valor é o nome do campo.',
        tip: 'Leia a pergunta e toque no campo que responde.',
        cases: [
            {
                id: 'a1-1',
                kind: 'campo',
                question: 'Toque no campo que responde a pergunta.',
                hint: 'O nome do campo está escrito à esquerda de cada linha.',
                fichaId: 'bia',
                asks: [
                    { prompt: 'Onde a Bia nasceu?', field: 'cidade' },
                    { prompt: 'Em que ano ela nasceu?', field: 'ano' },
                    { prompt: 'O que ela mais gosta de comer?', field: 'comida' },
                ],
                successLine: 'Cada informação mora num campo com nome. É isso que faz uma ficha ser uma ficha.',
            },
            {
                id: 'a1-2',
                kind: 'campo',
                question: 'Toque no campo que responde a pergunta.',
                hint: 'A pergunta nunca usa a mesma palavra do campo.',
                fichaId: 'theo',
                asks: [
                    { prompt: 'Que esporte o Théo pratica?', field: 'esporte' },
                    { prompt: 'De que cidade ele é?', field: 'cidade' },
                    { prompt: 'Que animal ele prefere?', field: 'bicho' },
                ],
                successLine: '"De que cidade" e "onde nasceu" perguntam a mesma coisa: o campo Cidade.',
            },
            {
                id: 'a1-3',
                kind: 'campo',
                question: 'Toque no campo que responde a pergunta.',
                hint: 'Três perguntas, três campos diferentes.',
                fichaId: 'yuna',
                asks: [
                    { prompt: 'Qual é o bicho preferido da Yuna?', field: 'bicho' },
                    { prompt: 'Quando ela nasceu?', field: 'ano' },
                    { prompt: 'Do que ela gosta de brincar na quadra?', field: 'esporte' },
                ],
                successLine: 'Você já lê uma ficha inteira sem se perder entre os campos.',
            },
        ],
    },

    /* ─────────────────────────────────── NÍVEL 2 — filtre o arquivo */
    {
        level: 2,
        title: 'Filtre o arquivo',
        objective: 'Filtrar é separar quem atende ao critério.',
        tip: 'Toque em TODAS as fichas que passam no filtro.',
        cases: [
            {
                id: 'a2-1',
                kind: 'filtrar',
                question: 'Toque em todas as fichas de quem nasceu em RECIFE.',
                hint: 'Confira o campo Cidade de cada ficha.',
                fichaIds: ['bia', 'alice', 'theo', 'davi', 'sofia', 'malu'],
                show: ['cidade', 'ano', 'esporte'],
                filters: [crit('cidade', 'Recife')],
                successLine: 'Três de seis nasceram em Recife. Filtrar é ler o mesmo campo em todas as fichas.',
            },
            {
                id: 'a2-2',
                kind: 'filtrar',
                question: 'Toque em todas as fichas de quem nasceu em 2016.',
                hint: 'Agora o campo que importa é o Ano.',
                fichaIds: ['manu', 'caio', 'iara', 'enzo', 'yuna', 'davi'],
                show: ['cidade', 'ano', 'comida'],
                filters: [crit('ano', '2016')],
                successLine: 'Mudou o campo, mudou o grupo. O arquivo é o mesmo.',
            },
            {
                id: 'a2-3',
                kind: 'filtrar',
                /*
                 * Dois campos. Quatro fichas passam em UM dos critérios e só duas
                 * passam nos dois — é o que faz a criança conferir o segundo em
                 * vez de parar no primeiro.
                 */
                question: 'Toque em quem nasceu em SALVADOR e joga VÔLEI.',
                hint: 'As duas coisas precisam bater na mesma ficha.',
                fichaIds: ['alice', 'davi', 'nina', 'bia', 'iara', 'malu'],
                show: ['cidade', 'esporte', 'ano'],
                filters: [crit('cidade', 'Salvador'), crit('esporte', 'Vôlei')],
                successLine: 'Só duas passaram nos dois campos. Vôlei sozinho deixava cinco.',
            },
        ],
    },

    /* ──────────────────────── NÍVEL 3 — de quem é este formulário? */
    {
        level: 3,
        title: 'De quem é este formulário?',
        objective: 'Cruzando campos, o conjunto revela uma pessoa só.',
        tip: 'O formulário não tem nome nem foto. Ache a ficha que bate.',
        cases: [
            {
                id: 'a3-1',
                kind: 'identificar',
                question: 'Este formulário chegou sem nome. De quem é?',
                hint: 'Compare os dois campos do formulário com cada ficha.',
                fichaIds: ['caio', 'enzo', 'davi', 'iara', 'nina', 'manu'],
                show: ['cidade', 'bicho', 'ano'],
                form: [crit('cidade', 'Manaus'), crit('bicho', 'Papagaio')],
                answerId: 'caio',
                successLine: 'Dois de Manaus, dois com papagaio — mas só um tem os dois.',
            },
            {
                id: 'a3-2',
                kind: 'identificar',
                question: 'Mais um formulário anônimo. De quem é?',
                hint: 'Quatro fichas são de 2015. Só uma delas bate na comida.',
                fichaIds: ['iara', 'bia', 'sofia', 'alice', 'yuna', 'theo'],
                show: ['ano', 'comida', 'cidade'],
                form: [crit('ano', '2015'), crit('comida', 'Açaí')],
                answerId: 'iara',
                successLine: 'O ano sozinho deixava quatro candidatas. A comida fechou o caso.',
            },
            {
                id: 'a3-3',
                kind: 'identificar',
                question: 'O último formulário do arquivo. De quem é?',
                hint: 'Agora são três campos. Nenhum resolve sozinho.',
                fichaIds: ['malu', 'manu', 'bia', 'davi', 'nina', 'caio'],
                show: ['cidade', 'esporte', 'bicho'],
                form: [crit('cidade', 'Curitiba'), crit('esporte', 'Vôlei'), crit('bicho', 'Gato')],
                answerId: 'malu',
                successLine: 'Cada campo tinha duas ou três candidatas. Juntos, sobrou uma pessoa só.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)

/** Quantas fichas do caso passam no filtro. */
export function matchCount(caso: Caso): number {
    const ids = caso.fichaIds ?? []
    const filters = caso.filters ?? []
    return ids.filter(id => {
        const f = byId.get(id)
        return f ? passes(f, filters) : false
    }).length
}
