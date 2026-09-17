import type { Answer, Choice, Headline, LevelDef, Neighbour } from '../types'
import { BETO, CACO, ICON, NINA, RITA, SOL, ZE, byId } from './cast'

/**
 * OS TRÊS NÍVEIS.
 *
 * ── A PERGUNTA É SEMPRE A MESMA ──────────────────────────────────────────
 *
 * "Quem aí podia saber disso?" Do primeiro ao último nível. O que muda é só
 * como a resposta se esconde, e cada nível estreia UMA maneira:
 *
 *   N1  dois vizinhos, e quem sabe responde          →  vá perguntar
 *   N2  três vizinhos, e dois não falam do assunto   →  não achar ≠ confirmar
 *   N3  quem confirma só ouviu falar, ou fala de     →  confirmação que não vale
 *       anos atrás                                      também não é confirmação
 *
 * ── DOIS NO NÍVEL 1, TRÊS DEPOIS ─────────────────────────────────────────
 *
 * O nível 1 ensina só o gesto — antes de responder, vá perguntar. Uma terceira
 * pessoa ali não ensinaria isso melhor: só poria mais um bloco de texto para
 * ler e encolheria a plaquinha de 430 para 296 px. O terceiro entra no nível 2
 * junto com o conceito que precisa dele: o "não falo disso" só existe quando há
 * mais gente do que assunto.
 *
 * ── ABRE E FECHA COM UMA QUE SE ESPALHA ──────────────────────────────────
 *
 * Em todo nível existe pelo menos uma notícia verdadeira. Se a criança só
 * vivesse recusas, sairia achando que o jogo é "desconfie de tudo" — e o robô,
 * que espalha sem conferir, às vezes acerta por acaso. É isso que as rodadas de
 * ESPALHAR ensinam sem precisar dizer.
 */
export const LEVELS: LevelDef[] = [

    /* ══════════════════════════════════ NÍVEL 1 — vá perguntar */
    {
        level: 1,
        goal: 'Confira antes de espalhar',
        meet: 'Ih... esses dois de novo.',
        hint: 'Toque em quem pode saber.',
        neighbours: [NINA, BETO],
        headlines: [
            {
                id: 'n1-quadra',
                icon: ICON.quadra,
                text: 'A quadra reabre segunda.',
                answers: [
                    {
                        neighbour: 'beto',
                        icon: ICON.ferramenta,
                        text: 'A obra acabou sexta.',
                        kind: 'confirms',
                        fresh: true,
                    },
                    {
                        neighbour: 'nina',
                        icon: ICON.bola,
                        text: 'Já dá pra jogar lá.',
                        kind: 'confirms',
                        fresh: true,
                    },
                ],
                close: 'A quadra está aberta mesmo.',
            },
            {
                id: 'n1-neve',
                icon: ICON.neve,
                text: 'Vai nevar no sábado!',
                answers: [
                    {
                        neighbour: 'nina',
                        icon: ICON.boia,
                        text: 'Sábado tem passeio na piscina.',
                        kind: 'denies',
                        fresh: true,
                    },
                    {
                        neighbour: 'beto',
                        icon: ICON.termometro,
                        text: 'Sábado vai dar 31 graus.',
                        kind: 'denies',
                        fresh: true,
                    },
                ],
                close: 'Vai fazer calor, não neve.',
            },
            {
                id: 'n1-rua',
                icon: ICON.obra,
                text: 'A rua da escola vai fechar.',
                answers: [
                    {
                        neighbour: 'beto',
                        icon: ICON.prancheta,
                        text: 'Vamos trocar o asfalto lá.',
                        kind: 'confirms',
                        fresh: true,
                    },
                    {
                        neighbour: 'nina',
                        icon: ICON.olho,
                        text: 'Vi as placas de aviso.',
                        kind: 'confirms',
                        fresh: true,
                    },
                ],
                close: 'A rua fecha mesmo.',
            },
        ],
    },

    /* ═════════════════════════ NÍVEL 2 — nem todo mundo sabe do assunto */
    {
        level: 2,
        goal: 'Quem sabe disso?',
        meet: 'Ih... agora são três!',
        hint: 'Nem todos sabem do assunto.',
        neighbours: [RITA, NINA, CACO],
        headlines: [
            {
                id: 'n2-refri',
                icon: ICON.refri,
                text: 'Refrigerante cura gripe.',
                answers: [
                    {
                        neighbour: 'rita',
                        icon: ICON.agua,
                        text: 'Água e descanso, só.',
                        kind: 'denies',
                        fresh: true,
                    },
                    {
                        neighbour: 'nina',
                        icon: ICON.jornal,
                        text: 'A turma foi na horta.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                    {
                        neighbour: 'caco',
                        icon: ICON.cantina,
                        text: 'Quarta tem suco.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                ],
                close: 'Quem entende de saúde disse que não.',
            },
            {
                id: 'n2-vacina',
                icon: ICON.posto,
                text: 'Tem vacina hoje no posto.',
                answers: [
                    {
                        neighbour: 'rita',
                        icon: ICON.seringa,
                        text: 'Estamos com as doses.',
                        kind: 'confirms',
                        fresh: true,
                    },
                    {
                        neighbour: 'nina',
                        icon: ICON.jornal,
                        text: 'O 3º ano ganhou.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                    {
                        neighbour: 'caco',
                        icon: ICON.cantina,
                        text: 'Amanhã tem sopa.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                ],
                close: 'Quem aplica a vacina confirmou.',
            },
            {
                id: 'n2-jacare',
                icon: ICON.jacare,
                text: 'Tem um jacaré no pátio!',
                answers: [
                    {
                        neighbour: 'nina',
                        icon: ICON.jornal,
                        text: 'Chegaram as mesas novas.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                    {
                        neighbour: 'rita',
                        icon: ICON.saude,
                        text: 'Dia normal por aqui.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                    {
                        neighbour: 'caco',
                        icon: ICON.cantina,
                        text: 'Sexta tem frango.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                ],
                close: 'Ninguém que estava lá viu nada.',
            },
        ],
    },

    /* ══════════════════ NÍVEL 3 — é de agora? e quem contou pra ele? */
    {
        level: 3,
        goal: 'É de agora? Quem viu?',
        meet: 'Ih... o Zé nunca viu nada.',
        hint: 'Veja de quando é, e quem viu.',
        neighbours: [BETO, ZE, SOL],
        headlines: [
            {
                id: 'n3-ponte',
                icon: ICON.ponte,
                text: 'A ponte do parque fechou.',
                answers: [
                    {
                        neighbour: 'ze',
                        icon: ICON.grupo,
                        text: 'Falaram que fechou.',
                        kind: 'confirms',
                        fresh: true,
                    },
                    {
                        neighbour: 'beto',
                        icon: ICON.obra,
                        text: 'Tiramos os cones de lá.',
                        kind: 'denies',
                        fresh: true,
                    },
                    {
                        neighbour: 'sol',
                        icon: ICON.tempo,
                        text: 'Sem chuva esta semana.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                ],
                close: 'Quem cuida do parque já abriu tudo.',
            },
            {
                id: 'n3-chuva',
                icon: ICON.guardachuva,
                text: 'Vai chover no dia do passeio.',
                answers: [
                    {
                        neighbour: 'sol',
                        icon: ICON.chuva,
                        text: 'Sexta com pancadas à tarde.',
                        kind: 'confirms',
                        fresh: false,
                        stamp: 'de 2019',
                    },
                    {
                        neighbour: 'beto',
                        icon: ICON.prefeitura,
                        text: 'O passeio está mantido.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                    {
                        neighbour: 'ze',
                        icon: ICON.orelha,
                        text: 'Alguém sabe da padaria?',
                        kind: 'offTopic',
                        fresh: true,
                    },
                ],
                close: 'Essa previsão é de anos atrás.',
            },
            {
                id: 'n3-museu',
                icon: ICON.museu,
                text: 'O museu abre de graça domingo.',
                answers: [
                    {
                        neighbour: 'beto',
                        icon: ICON.ingresso,
                        text: 'Domingo ninguém paga lá.',
                        kind: 'confirms',
                        fresh: true,
                    },
                    {
                        neighbour: 'sol',
                        icon: ICON.tempo,
                        text: 'Domingo vai ter sol.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                    {
                        neighbour: 'ze',
                        icon: ICON.orelha,
                        text: 'Achei que era sábado.',
                        kind: 'offTopic',
                        fresh: true,
                    },
                ],
                close: 'Ele viu, e é de hoje: pode espalhar.',
            },
        ],
    },
]

export const TOTAL_HEADLINES = LEVELS.reduce((n, l) => n + l.headlines.length, 0)

/** Vale como confirmação: é sobre o assunto, é de agora, e ele viu. */
export const confirms = (answer: Answer, who: Neighbour): boolean =>
    answer.kind === 'confirms' && answer.fresh && who.firsthand

export const shouldSpread = (headline: Headline, cast: Record<string, Neighbour>): boolean =>
    headline.answers.some(a => confirms(a, cast[a.neighbour]))

export const correctChoice = (headline: Headline, cast: Record<string, Neighbour>): Choice =>
    shouldSpread(headline, cast) ? 'spread' : 'hold'

/**
 * A resposta que decide a rodada, na ordem em que ela importa. A explicação
 * do fim sai daqui, e não de um texto guardado na manchete.
 */
export const decisive = (
    headline: Headline,
    cast: Record<string, Neighbour>,
): Answer | undefined =>
    headline.answers.find(a => confirms(a, cast[a.neighbour]))
    ?? headline.answers.find(a => a.kind === 'confirms')
    ?? headline.answers.find(a => a.kind === 'denies')

/** 30 pontos por nível, divididos pelas fases. Metade depois da TRAVA. */
export const pointsFor = (level: LevelDef, locked: boolean): number => {
    const full = Math.round(30 / level.headlines.length)
    return locked ? Math.round(full / 2) : full
}

const words = (s: string) => s.trim().split(/\s+/).length

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        const cast = byId(level.neighbours)

        if (level.neighbours.length < 2 || level.neighbours.length > 3) {
            problems.push(`nível ${level.level}: 2 ou 3 vizinhos`)
        }
        if (level.headlines.length < 1 || level.headlines.length > 5) {
            problems.push(`nível ${level.level}: de 1 a 5 manchetes`)
        }

        // A balança só existe a partir de duas manchetes: com uma fase (build
        // de teste) não há como ter espalhar E segurar no mesmo nível.
        if (level.headlines.length > 1) {
            const choices = level.headlines.map(h => correctChoice(h, cast))
            if (!choices.includes('spread') || !choices.includes('hold')) {
                problems.push(`nível ${level.level}: falta uma manchete de espalhar ou de segurar`)
            }
            const solvers = level.headlines.map(h => decisive(h, cast)?.neighbour)
            if (new Set(solvers).size === 1) {
                problems.push(`nível ${level.level}: o mesmo vizinho decide todas`)
            }
        }

        level.headlines.forEach(h => {
            if (words(h.text) > 6) problems.push(`${h.id}: manchete com mais de 6 palavras`)
            if (h.answers.length !== level.neighbours.length) {
                problems.push(`${h.id}: falta resposta de algum vizinho`)
            }
            const valid = h.answers.some(a => confirms(a, cast[a.neighbour]))
            const denied = h.answers.some(a => a.kind === 'denies')
            if (valid && denied) problems.push(`${h.id}: confirmação válida e desmentido juntos`)

            h.answers.forEach(a => {
                const who = cast[a.neighbour]
                if (!who) {
                    problems.push(`${h.id}: resposta de vizinho que não está no nível`)
                    return
                }
                if (words(a.text) > 5) problems.push(`${h.id}/${a.neighbour}: mais de 5 palavras`)
                if (a.icon === h.icon) problems.push(`${h.id}/${a.neighbour}: repete o ícone da manchete`)
                if (a.kind === 'offTopic' && a.icon !== who.icon) {
                    problems.push(`${h.id}/${a.neighbour}: quem não sabe levanta o próprio ícone`)
                }
                if (a.kind !== 'offTopic' && a.icon === who.icon) {
                    problems.push(`${h.id}/${a.neighbour}: só o offTopic usa o próprio ícone`)
                }
                if (!a.fresh && !a.stamp) problems.push(`${h.id}/${a.neighbour}: falta o carimbo de data`)
            })
        })
    })

    return problems
}
