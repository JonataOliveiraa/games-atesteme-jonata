import { C } from './theme'
import type { Field, FormatId, Level, Piece } from '../types'

/**
 * As nove missões. Ver PLANEJAMENTO.md §5.
 *
 * Substitui o antigo `levels.ts`, que descrevia um formato por nível. Aqui
 * cada NÍVEL é uma habilidade (escolher / preencher em dois formatos /
 * consertar) e o formato varia dentro dele.
 */

/* ═══════════════════════════════════════════ vocabulário dos formatos */

export const FORMAT_INFO: Record<FormatId, {
    title: string
    subtitle: string
    /** Como o leitor descreve o que esta caixa guarda, na frase de recusa. */
    guards: string
}> = {
    date: { title: 'Data', subtitle: 'dia, mês e ano', guards: 'dia, mês e ano' },
    pixels: { title: 'Pixels', subtitle: 'pontos de cor', guards: 'pontos de cor' },
    text: { title: 'Texto', subtitle: 'um pedaço por vez', guards: 'letras e números em ordem' },
}

/**
 * Como o leitor descreve o que a criança ENTREGOU, na frase de recusa.
 * É o par da mensagem: "Esta caixa guarda {guards}. Você me deu {this}."
 */
export const FORMAT_GIVEN: Record<FormatId, string> = {
    date: 'uma data',
    pixels: 'cores',
    text: 'um código escrito',
}

/* ═══════════════════════════════════════════════════ ajudas de escrita */

const num = (id: string, label: string, format: FormatId): Piece =>
    ({ id, kind: 'numero', label, reads: label, format })

const mes = (id: string, label: string): Piece =>
    ({ id, kind: 'mes', label, reads: label, format: 'date' })

const cor = (id: string, label: string, tone: number): Piece =>
    ({ id, kind: 'cor', label, reads: label, tone, format: 'pixels' })

const palavra = (id: string, label: string): Piece =>
    ({ id, kind: 'palavra', label, reads: label, format: 'text' })

/** Peça que não pertence a formato nenhum. Não encaixa em lugar algum. */
const intrusa = (id: string, label: string): Piece =>
    ({ id, kind: 'intrusa', label, reads: label, format: null })

const slot = (id: string, label: string, accepts: string): Field =>
    ({ id, label, kind: 'slot', accepts })

const ponto = (id: string, label: string, accepts: string): Field =>
    ({ id, label, kind: 'pixel', accepts })

/* ══════════════════════════════════════════════════════════ os níveis */

export const LEVELS: Level[] = [

    /* ─────────────────────────────────────── NÍVEL 1 — escolher a caixa */
    {
        level: 1,
        title: 'Escolha a caixa certa',
        objective: 'Cada informação mora num formato diferente.',
        tip: 'Olhe o pedido e escolha a caixa que sabe guardar aquilo.',
        time: 60,
        missions: [
            {
                id: 'm1-1',
                request: 'A festa da escola é em 18 de junho de 2026. Guarde essa data.',
                requestIcon: 'date',
                offer: ['date', 'pixels', 'text'],
                boxes: [{
                    id: 'b',
                    format: 'date',
                    title: FORMAT_INFO.date.title,
                    subtitle: FORMAT_INFO.date.subtitle,
                    fields: [
                        slot('dia', 'Dia', 'p-18'),
                        slot('mes', 'Mês', 'p-junho'),
                        slot('ano', 'Ano', 'p-2026'),
                    ],
                }],
                pieces: [
                    num('p-18', '18', 'date'),
                    mes('p-junho', 'junho'),
                    num('p-2026', '2026', 'date'),
                    intrusa('p-estrela', 'estrela'),
                    intrusa('p-sala', 'sala 4'),
                ],
                successLine: 'A data voltou inteira porque dia, mês e ano ficaram cada um no seu campo.',
                hint: 'Data guarda três coisas: dia, mês e ano.',
            },
            {
                id: 'm1-2',
                request: 'Guarde a faixa da bandeira: vermelho, azul e amarelo.',
                requestIcon: 'pixels',
                offer: ['date', 'pixels', 'text'],
                boxes: [{
                    id: 'b',
                    format: 'pixels',
                    title: FORMAT_INFO.pixels.title,
                    subtitle: FORMAT_INFO.pixels.subtitle,
                    fields: [
                        ponto('px1', 'Ponto 1', 'p-vermelho'),
                        ponto('px2', 'Ponto 2', 'p-azul'),
                        ponto('px3', 'Ponto 3', 'p-amarelo'),
                    ],
                }],
                pieces: [
                    cor('p-vermelho', 'vermelho', C.paintRed),
                    cor('p-azul', 'azul', C.paintBlue),
                    cor('p-amarelo', 'amarelo', C.paintYellow),
                    num('p-18', '18', 'date'),
                    intrusa('p-estrela', 'estrela'),
                ],
                successLine: 'A imagem apareceu porque cada ponto recebeu uma cor, na ordem certa.',
                hint: 'Imagem se guarda em pontos de cor, um ponto por vez.',
            },
            {
                id: 'm1-3',
                request: 'A placa da sala é A-12. Guarde esse código.',
                requestIcon: 'text',
                offer: ['date', 'pixels', 'text'],
                boxes: [{
                    id: 'b',
                    format: 'text',
                    title: FORMAT_INFO.text.title,
                    subtitle: 'um caractere por vez',
                    fields: [
                        slot('c1', '1º', 'p-a'),
                        slot('c2', '2º', 'p-traco'),
                        slot('c3', '3º', 'p-1'),
                        slot('c4', '4º', 'p-2'),
                    ],
                }],
                pieces: [
                    num('p-a', 'A', 'text'),
                    num('p-traco', '-', 'text'),
                    num('p-1', '1', 'text'),
                    num('p-2', '2', 'text'),
                    cor('p-vermelho', 'vermelho', C.paintRed),
                    intrusa('p-estrela', 'estrela'),
                ],
                successLine: 'O código voltou porque cada caractere ficou na sua posição.',
                hint: 'Texto se guarda em ordem: primeiro, segundo, terceiro.',
            },
        ],
    },

    /* ──────────────────────── NÍVEL 2 — a mesma informação, outra caixa */
    {
        level: 2,
        title: 'A mesma informação, outra caixa',
        objective: 'A estrutura muda, a informação continua a mesma.',
        tip: 'Preencha as duas caixas. A segunda abre quando a primeira encher.',
        time: 90,
        missions: [
            {
                id: 'm2-1',
                request: 'A data 18 de junho de 2026 vai no convite e no nome da foto.',
                requestIcon: 'date',
                boxes: [
                    {
                        id: 'convite',
                        format: 'date',
                        title: 'Convite',
                        subtitle: 'dia, mês e ano',
                        fields: [
                            slot('dia', 'Dia', 'p-18'),
                            slot('mes', 'Mês', 'p-junho'),
                            slot('ano', 'Ano', 'p-2026'),
                        ],
                    },
                    {
                        id: 'foto',
                        format: 'text',
                        title: 'Nome da foto',
                        subtitle: 'um pedaço por vez',
                        fields: [
                            slot('c1', '1º', 'p-t18'),
                            slot('c2', '2º', 'p-traco'),
                            slot('c3', '3º', 'p-t06'),
                        ],
                    },
                ],
                pieces: [
                    num('p-18', '18', 'date'),
                    mes('p-junho', 'junho'),
                    num('p-2026', '2026', 'date'),
                    num('p-t18', '18', 'text'),
                    num('p-traco', '-', 'text'),
                    num('p-t06', '06', 'text'),
                    intrusa('p-estrela', 'estrela'),
                ],
                successLine: 'A mesma data, guardada de dois jeitos. A forma mudou, a informação não.',
                hint: 'O convite quer o mês por extenso. O nome da foto quer o número.',
            },
            {
                id: 'm2-2',
                request: 'As cores da bandeira vão no desenho e na lista do pintor.',
                requestIcon: 'pixels',
                boxes: [
                    {
                        id: 'desenho',
                        format: 'pixels',
                        title: 'Desenho',
                        subtitle: 'pontos de cor',
                        fields: [
                            ponto('px1', 'Ponto 1', 'p-vermelho'),
                            ponto('px2', 'Ponto 2', 'p-azul'),
                            ponto('px3', 'Ponto 3', 'p-amarelo'),
                        ],
                    },
                    {
                        id: 'lista',
                        format: 'text',
                        title: 'Lista do pintor',
                        subtitle: 'uma palavra por linha',
                        fields: [
                            slot('l1', '1º', 'p-w-vermelho'),
                            slot('l2', '2º', 'p-w-azul'),
                            slot('l3', '3º', 'p-w-amarelo'),
                        ],
                    },
                ],
                pieces: [
                    cor('p-vermelho', 'vermelho', C.paintRed),
                    cor('p-azul', 'azul', C.paintBlue),
                    cor('p-amarelo', 'amarelo', C.paintYellow),
                    palavra('p-w-vermelho', 'vermelho'),
                    palavra('p-w-azul', 'azul'),
                    palavra('p-w-amarelo', 'amarelo'),
                    intrusa('p-estrela', 'estrela'),
                ],
                successLine: 'A mesma cor pode ser um ponto na imagem ou uma palavra na lista.',
                hint: 'O desenho quer a tinta. A lista quer o nome da cor.',
            },
            {
                id: 'm2-3',
                request: 'O aniversário da Luna é 12 de abril de 2026. Vai no mural e na etiqueta.',
                requestIcon: 'date',
                boxes: [
                    {
                        id: 'mural',
                        format: 'date',
                        title: 'Mural',
                        subtitle: 'só dia e mês',
                        fields: [
                            slot('dia', 'Dia', 'p-12'),
                            slot('mes', 'Mês', 'p-abril'),
                        ],
                    },
                    {
                        id: 'etiqueta',
                        format: 'text',
                        title: 'Etiqueta',
                        subtitle: 'um pedaço por vez',
                        fields: [
                            slot('c1', '1º', 'p-t12'),
                            slot('c2', '2º', 'p-barra'),
                            slot('c3', '3º', 'p-t04'),
                        ],
                    },
                ],
                pieces: [
                    num('p-12', '12', 'date'),
                    mes('p-abril', 'abril'),
                    // O ano não tem campo nenhum. Sobrar peça NÃO é erro: o
                    // mural guarda dia e mês, e o formato decide o que cabe.
                    num('p-2026', '2026', 'date'),
                    num('p-t12', '12', 'text'),
                    num('p-barra', '/', 'text'),
                    num('p-t04', '04', 'text'),
                ],
                successLine: 'O mural só tem dia e mês, então o ano ficou de fora — e está certo assim.',
                hint: 'O mural não tem campo de ano. Uma peça vai sobrar na bandeja.',
            },
        ],
    },

    /* ──────────────────────────────── NÍVEL 3 — consertar o formato */
    {
        level: 3,
        title: 'Conserte o formato',
        objective: 'A caixa chegou preenchida errado.',
        tip: 'Aperte LER primeiro para ver o que saiu, depois conserte.',
        time: 60,
        missions: [
            {
                id: 'm3-1',
                request: 'Esta placa deveria ler A-12, mas saiu embaralhada.',
                requestIcon: 'text',
                defect: 'ordem',
                boxes: [{
                    id: 'b',
                    format: 'text',
                    title: 'Placa da sala',
                    subtitle: 'um caractere por vez',
                    fields: [
                        slot('c1', '1º', 'p-a'),
                        slot('c2', '2º', 'p-traco'),
                        slot('c3', '3º', 'p-1'),
                        slot('c4', '4º', 'p-2'),
                    ],
                    preset: { c1: 'p-1', c2: 'p-a', c3: 'p-traco', c4: 'p-2' },
                }],
                pieces: [
                    num('p-a', 'A', 'text'),
                    num('p-traco', '-', 'text'),
                    num('p-1', '1', 'text'),
                    num('p-2', '2', 'text'),
                ],
                successLine: 'As peças eram as mesmas. Só a ordem estava errada — e a ordem muda o que se lê.',
                hint: 'Troque as peças de lugar até ler A-12.',
            },
            {
                id: 'm3-2',
                request: 'Esta data deveria ser 18 de junho de 2026, mas os campos se trocaram.',
                requestIcon: 'date',
                defect: 'campo',
                boxes: [{
                    id: 'b',
                    format: 'date',
                    title: 'Data da viagem',
                    subtitle: 'dia, mês e ano',
                    fields: [
                        slot('dia', 'Dia', 'p-18'),
                        slot('mes', 'Mês', 'p-junho'),
                        slot('ano', 'Ano', 'p-2026'),
                    ],
                    preset: { dia: 'p-2026', mes: 'p-junho', ano: 'p-18' },
                }],
                pieces: [
                    num('p-18', '18', 'date'),
                    mes('p-junho', 'junho'),
                    num('p-2026', '2026', 'date'),
                ],
                successLine: 'O número 18 só vira dia quando está no campo do dia. O campo dá sentido ao dado.',
                hint: 'Não existe dia 2026. Troque o dia com o ano.',
            },
            {
                id: 'm3-3',
                request: 'Esta imagem deveria ser vermelho, azul e amarelo, mas tem uma peça estranha.',
                requestIcon: 'pixels',
                defect: 'intrusa',
                boxes: [{
                    id: 'b',
                    format: 'pixels',
                    title: 'Faixa da bandeira',
                    subtitle: 'pontos de cor',
                    fields: [
                        ponto('px1', 'Ponto 1', 'p-vermelho'),
                        ponto('px2', 'Ponto 2', 'p-azul'),
                        ponto('px3', 'Ponto 3', 'p-amarelo'),
                    ],
                    // O calendário entrou num ponto de imagem. O `preset`
                    // ignora a regra de encaixe de propósito: é o defeito.
                    // Ao ser retirado ele vai para a bandeja e nunca mais
                    // consegue voltar, porque não é uma cor.
                    preset: { px1: 'p-vermelho', px2: 'p-18', px3: 'p-amarelo' },
                }],
                pieces: [
                    cor('p-vermelho', 'vermelho', C.paintRed),
                    cor('p-azul', 'azul', C.paintBlue),
                    cor('p-amarelo', 'amarelo', C.paintYellow),
                    num('p-18', '18', 'date'),
                ],
                successLine: 'Um ponto de imagem só guarda cor. O que não é cor vira buraco.',
                hint: 'Tire o 18 do ponto 2 e ponha o azul no lugar.',
            },
        ],
    },
]

export const TOTAL_MISSIONS = LEVELS.reduce((sum, l) => sum + l.missions.length, 0)

/** Embaralha a bandeja sem alterar o array de origem. */
export function shufflePieces(pieces: Piece[]): Piece[] {
    const out = [...pieces]
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}
