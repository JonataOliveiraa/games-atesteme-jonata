import type { ChoiceDef, LevelDef, MissionDef, QueryState, ResultType } from '../types'
import { choiceLabel, TYPE_LABEL } from '../types'
import { rankOf } from './results'

const add = (term: string, hint: string): ChoiceDef => ({ kind: 'add', term, hint })
const drop = (term: string, hint: string): ChoiceDef => ({ kind: 'remove', term, hint })
const only = (type: ResultType, hint: string): ChoiceDef => ({ kind: 'filter', type, hint })
const swap = (hint: string): ChoiceDef => ({ kind: 'engine', engine: 'bussola', hint })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Palavras melhores',
        missions: [
            {
                id: 'tucano',
                request: 'Quero uma foto de tucano.',
                visitor: 0,
                initialTerms: ['TUCANO'],
                pool: ['tucano-pelucia', 'tucano-desenho', 'tucano-real'],
                targetId: 'tucano-real',
                steps: [
                    {
                        choices: [
                            add('PELÚCIA', 'Pelúcia é brinquedo. O pedido é foto.'),
                            add('FOTO', ''),
                            add('DESENHO', 'Desenho não é foto.'),
                        ],
                    },
                ],
            },
            {
                id: 'vulcao',
                request: 'Quero ver um vulcão em erupção.',
                visitor: 1,
                initialTerms: ['VULCÃO'],
                pool: ['vulcao-calmo', 'vulcao-maquete', 'vulcao-erupcao'],
                targetId: 'vulcao-erupcao',
                steps: [
                    {
                        choices: [
                            add('ERUPÇÃO', ''),
                            add('MAQUETE', 'Maquete é de escola. O pedido é o de verdade.'),
                            add('CALMO', 'Calmo não está em erupção.'),
                        ],
                    },
                    {
                        choices: [
                            add('BRINQUEDO', 'Nenhum vulcão aqui é brinquedo.'),
                            add('VÍDEO', ''),
                            add('DESENHO', 'Desenho fica parado. O pedido é ver acontecer.'),
                        ],
                    },
                ],
            },
            {
                id: 'baleia',
                request: 'Quero uma foto de baleia de verdade.',
                visitor: 2,
                initialTerms: ['BALEIA'],
                pool: ['baleia-pelucia', 'baleia-desenho', 'baleia-real'],
                targetId: 'baleia-real',
                steps: [
                    {
                        choices: [
                            add('DESENHO', 'Desenho não é foto.'),
                            add('PELÚCIA', 'Pelúcia é brinquedo. O pedido é a de verdade.'),
                            add('FOTO', ''),
                        ],
                    },
                    {
                        choices: [
                            add('PAPEL', 'Papel trouxe o desenho para cima.'),
                            add('ANIMAL', ''),
                            add('BRINQUEDO', 'Brinquedo trouxe a pelúcia de novo.'),
                        ],
                    },
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 2 — PALAVRAS + FILTROS
     * ══════════════════════════════════════════════════════════════════════
     *
     * O assunto novo é o FILTRO, e ele entra porque as palavras sozinhas
     * passam a empatar: o acervo daqui tem a mesma coisa em vídeo, em foto e
     * em texto, e nenhuma palavra separa um do outro. É a situação em que o
     * filtro é a única saída — que é a única situação em que ele ensina.
     *
     * O filtro não soma ponto nenhum: ele AFASTA quem é de outro tipo. Ver o
     * vídeo despencar para o fim da estante é o que explica o que ele faz,
     * sem uma frase.
     *
     * A terceira missão junta os três gestos numa consulta só — tirar a
     * palavra que atrapalha, filtrar, e só então acrescentar a que falta.
     */
    {
        level: 2,
        title: 'Palavras + filtros',
        missions: [
            {
                id: 'agua',
                request: 'Quero um VÍDEO da onda do mar.',
                visitor: 0,
                initialTerms: ['ÁGUA'],
                pool: ['agua-copo', 'agua-chuva', 'agua-onda'],
                targetId: 'agua-onda',
                steps: [
                    {
                        choices: [
                            add('BEBER', 'Beber trouxe o copo para cima. O pedido é o mar.'),
                            add('MAR', ''),
                            add('CHUVA', 'Chuva é água do céu, não a onda.'),
                        ],
                    },
                    {
                        choices: [
                            only('image', 'Imagem é parada. O pedido é ver a onda acontecer.'),
                            only('video', ''),
                            add('PRAIA', 'Nenhuma carta daqui fala de praia: a busca nem se mexeu.'),
                        ],
                    },
                ],
            },
            {
                id: 'feijao',
                request: 'Quero uma FOTO da semente de feijão.',
                visitor: 1,
                initialTerms: ['FEIJÃO'],
                pool: ['feijao-comida', 'feijao-broto', 'feijao-semente'],
                targetId: 'feijao-semente',
                steps: [
                    {
                        choices: [
                            add('COMIDA', 'Comida trouxe o feijão da panela.'),
                            add('PLANTAR', ''),
                            only('video', 'Filtrar agora só deixou o vídeo, e ele não é a semente.'),
                        ],
                    },
                    {
                        choices: [
                            add('CRESCER', 'Crescer é o que o broto faz. A semente ainda não.'),
                            only('image', ''),
                            add('PANELA', 'Panela é de cozinhar. A busca ficou pior.'),
                        ],
                    },
                ],
            },
            {
                id: 'anel',
                request: 'Quero uma FOTO do planeta que tem anel.',
                visitor: 2,
                /* O FOGUETE vem na consulta e atrapalha: é a palavra que a
                   criança tem de TIRAR, e o único jeito de ver que tirar
                   também melhora uma busca. */
                initialTerms: ['PLANETA', 'FOGUETE'],
                pool: ['foguete-video', 'terra-foto', 'jupiter-video', 'saturno-foto'],
                targetId: 'saturno-foto',
                steps: [
                    {
                        choices: [
                            drop('FOGUETE', ''),
                            add('SUBIR', 'Subir é o que o foguete faz. Ficou pior.'),
                            only('video', 'Só de vídeo sobrou foguete e planeta grande.'),
                        ],
                    },
                    {
                        choices: [
                            add('GRANDE', 'Grande trouxe o planeta errado para cima.'),
                            only('image', ''),
                            add('CÉU', 'Todos aqui estão no céu: a estante nem se mexeu.'),
                        ],
                    },
                    {
                        choices: [
                            add('TERRA', 'A Terra não tem anel.'),
                            add('ANEL', ''),
                            only('video', 'Voltar para vídeo jogou a foto lá para baixo.'),
                        ],
                    },
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — FERRAMENTAS DIFERENTES
     * ══════════════════════════════════════════════════════════════════════
     *
     * O assunto é a comparação, e a descoberta é uma decepção de propósito:
     * o outro buscador tem outra cara e traz EXATAMENTE os mesmos resultados,
     * na mesma ordem. Trocar de ferramenta nunca é erro — é um passo legítimo
     * que não sobe ninguém —, e é a própria estante parada que diz por quê.
     *
     * Depois da troca a criança volta a fazer o que já sabe: refinar. A última
     * missão é a consulta completa — tirar, comparar, filtrar e acrescentar —
     * e ela roda no MESMO acervo da última do nível 2, de propósito: é a mesma
     * busca, com a outra ferramenta, dando no mesmo lugar.
     */
    {
        level: 3,
        title: 'Ferramentas diferentes',
        missions: [
            {
                id: 'foguete',
                request: 'Quero o VÍDEO do foguete subindo.',
                visitor: 0,
                initialTerms: ['ESPAÇO', 'CÉU'],
                pool: ['espaco-texto', 'terra-foto', 'foguete-video'],
                targetId: 'foguete-video',
                steps: [
                    {
                        choices: [
                            add('PLANETA', 'Planeta trouxe os outros dois para cima.'),
                            swap(''),
                            add('TERRA', 'A Terra subiu, e o foguete ficou onde estava.'),
                        ],
                    },
                    {
                        choices: [
                            add('SUBIR', ''),
                            add('SISTEMA SOLAR', 'Isso é o texto dos planetas, não o foguete.'),
                            only('image', 'Imagem é parada. O foguete que sobe é vídeo.'),
                        ],
                    },
                ],
            },
            {
                id: 'onda',
                request: 'Quero um VÍDEO da onda do mar, no outro buscador.',
                visitor: 1,
                initialTerms: ['ÁGUA'],
                pool: ['agua-copo', 'agua-chuva', 'agua-onda'],
                targetId: 'agua-onda',
                steps: [
                    {
                        choices: [
                            add('MAR', ''),
                            add('COPO', 'Copo trouxe a água de beber.'),
                            only('text', 'Não há texto nenhum nesta estante: sumiu tudo.'),
                        ],
                    },
                    {
                        choices: [
                            swap(''),
                            add('CHUVA', 'Chuva subiu a carta errada.'),
                            add('MOLHADO', 'Nenhuma carta fala de molhado: nada mudou.'),
                        ],
                    },
                    {
                        choices: [
                            only('image', 'Imagem é parada. O pedido é ver a onda.'),
                            only('video', ''),
                            add('BEBER', 'Beber trouxe o copo de volta para a frente.'),
                        ],
                    },
                ],
            },
            {
                id: 'anel-comparado',
                request: 'De novo o planeta do anel — e no outro buscador.',
                visitor: 2,
                initialTerms: ['PLANETA', 'FOGUETE'],
                pool: ['foguete-video', 'terra-foto', 'jupiter-video', 'saturno-foto'],
                targetId: 'saturno-foto',
                steps: [
                    {
                        choices: [
                            drop('FOGUETE', ''),
                            add('SUBIR', 'Subir é o que o foguete faz. Ficou pior.'),
                            only('video', 'Só de vídeo sobrou foguete e planeta grande.'),
                        ],
                    },
                    {
                        choices: [
                            swap(''),
                            add('CÉU', 'Todos aqui estão no céu: a estante nem se mexeu.'),
                            add('GRANDE', 'Grande trouxe o planeta errado para cima.'),
                        ],
                    },
                    {
                        choices: [
                            only('image', ''),
                            only('text', 'Não há texto nenhum nesta estante.'),
                            add('TERRA', 'A Terra não tem anel.'),
                        ],
                    },
                    {
                        choices: [
                            add('ANEL', ''),
                            add('GRANDE', 'Grande trouxe o planeta errado para cima.'),
                            only('video', 'Voltar para vídeo jogou a foto lá para baixo.'),
                        ],
                    },
                ],
            },
        ],
    },
]

/** A consulta com que a missão começa. */
export const startQuery = (mission: MissionDef): QueryState => ({
    terms: [...mission.initialTerms],
    engine: 'grimorio',
})

/**
 * A CONSULTA DEPOIS DE UM TOQUE.
 *
 * Pura: ela devolve um estado novo, e é isso que permite ao jogo perguntar
 * "e se?" antes de mexer na tela — que é o que `improves` faz.
 */
export function applyChoice(q: QueryState, choice: ChoiceDef): QueryState {
    switch (choice.kind) {
        case 'add':
            return q.terms.includes(choice.term)
                ? q
                : { ...q, terms: [...q.terms, choice.term] }
        case 'remove':
            return { ...q, terms: q.terms.filter(term => term !== choice.term) }
        case 'filter':
            return { ...q, filter: choice.type }
        case 'engine':
            return { ...q, engine: choice.engine === q.engine ? otherEngine(q.engine) : choice.engine }
    }
}

const otherEngine = (engine: QueryState['engine']) =>
    engine === 'grimorio' ? 'bussola' : 'grimorio'

/**
 * ESTE TOQUE MELHORA A BUSCA?
 *
 * Para palavra e filtro a resposta é a estante: o alvo subiu, ou chegou ao
 * primeiro lugar. Para o BUSCADOR a resposta é sim por definição — ele não
 * sobe ninguém, e é justamente isso que a criança precisa ver acontecer. Um
 * passo que não pode dar errado continua sendo um passo: o que ele ensina é
 * que a ferramenta não era o problema.
 */
export function improves(mission: MissionDef, q: QueryState, choice: ChoiceDef) {
    if (choice.kind === 'engine') return true
    const before = rankOf(mission.pool, q, mission.targetId)
    const after = rankOf(mission.pool, applyChoice(q, choice), mission.targetId)
    return after === 0 || after < before
}

export const solved = (mission: MissionDef, q: QueryState) =>
    rankOf(mission.pool, q, mission.targetId) === 0

/** O que a consulta virou, para o painel de fim de missão. */
export const queryText = (q: QueryState) =>
    [...q.terms, ...(q.filter ? [TYPE_LABEL[q.filter]] : [])].join(' + ')

/* ═══════════════════════════════════════════════════════════════════════
 *  A VALIDAÇÃO
 *
 *  Missão sem saída não aparece em revisão de código: a nota de cada carta
 *  é uma conta, e a ordem da estante é o resultado dela. Aqui o balconista
 *  perfeito joga as três missões de cada nível e diz onde travou.
 * ═══════════════════════════════════════════════════════════════════════ */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        level.missions.forEach(mission => {
            let q = startQuery(mission)

            if (solved(mission, q)) {
                problems.push(`${mission.id}: já começa resolvida`)
            }

            mission.steps.forEach((step, i) => {
                const onde = `${mission.id} passo ${i + 1}`

                if (step.choices.length !== 3) {
                    problems.push(`${onde}: ${step.choices.length} botões (são 3)`)
                }

                const bons = step.choices.filter(c => improves(mission, q, c))
                if (bons.length !== 1) {
                    problems.push(
                        `${onde}: ${bons.length} escolhas boas (${bons.map(choiceLabel).join(', ')})`,
                    )
                }

                step.choices.forEach(c => {
                    const bom = improves(mission, q, c)
                    if (bom && c.hint) problems.push(`${onde}: ${choiceLabel(c)} é a certa e tem dica`)
                    if (!bom && !c.hint) problems.push(`${onde}: ${choiceLabel(c)} erra sem dizer por quê`)
                })

                // Dois botões com a mesma cara são um sorteio, não uma escolha.
                const caras = step.choices.map(choiceLabel)
                if (new Set(caras).size !== caras.length) {
                    problems.push(`${onde}: dois botões dizem a mesma coisa`)
                }

                const bom = bons[0]
                if (!bom) return
                q = applyChoice(q, bom)

                const fim = i === mission.steps.length - 1
                if (fim && !solved(mission, q)) {
                    problems.push(`${mission.id}: acabam os passos e o alvo não chegou ao topo`)
                }
                if (!fim && solved(mission, q)) {
                    problems.push(`${onde}: resolve antes do último passo`)
                }
            })
        })
    })

    return problems
}
