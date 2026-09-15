import { FIELD_ARTICLE, FIELD_LABEL, FIELD_ROLE, LEVELS } from './levels'
import type {
    CreatureId,
    FieldId,
    LevelDef,
    PartialSighting,
    SightingRecord,
    Task,
} from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O VEREDITO SAI DA PISTA, NÃO DE UMA RESPOSTA GUARDADA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Nenhuma tarefa carrega um `correctFieldId`. Qual campo está errado no nível
 * 2 é uma FUNÇÃO da comparação entre a ficha e o registro verdadeiro; qual
 * campo mudou no nível 3 é uma FUNÇÃO da diferença entre o registro anterior
 * e o novo. Com a resposta escrita nos dados, "corrija o campo que não bate
 * com a pista" viraria decoração em volta de um campo já decidido, e a criança
 * poderia acertar sem comparar nada.
 */

export const keysOf = (r: PartialSighting) => Object.keys(r) as FieldId[]

/** O valor pertence a este campo? A única pergunta que o nível 1 faz. */
export const canPlace = (value: string, field: FieldId, truth: SightingRecord) =>
    truth[field] === value

/** A qual dos campos VISÍVEIS este valor pertence. */
export const fieldOf = (value: string, truth: SightingRecord, fieldIds: FieldId[]) =>
    fieldIds.find(field => truth[field] === value)

/** Os campos mostrados que não batem com a verdade. O nível 2 vive disto. */
export const mismatchedFields = (shown: PartialSighting, truth: SightingRecord) =>
    keysOf(shown).filter(field => shown[field] !== truth[field])

/** O campo que uma novidade do nível 3 mudou. */
export const changedField = (before: SightingRecord, after: SightingRecord) =>
    keysOf(before).find(field => before[field] !== after[field])

export const applyValue = (
    shown: PartialSighting,
    field: FieldId,
    value: string,
): PartialSighting => ({ ...shown, [field]: value })

/** A criatura da fase, venha ela da pista ou da própria tarefa. */
export const creatureOf = (task: Task): CreatureId =>
    task.kind === 'update' ? task.creatureId : task.clue.creatureId

/**
 * O primeiro texto que aparece na placa.
 *
 * Nos dois primeiros verbos é a PISTA, contra a qual a ficha é conferida. No
 * terceiro é a primeira NOTA, porque ali não há nada a conferir: a ficha está
 * certa e o que chegou foi uma novidade.
 */
export const openingOf = (task: Task): string =>
    task.kind === 'update' ? (task.changes[0]?.note ?? '') : task.clue.sentence

/**
 * As etiquetas da bandeja.
 *
 * No `fill` elas são os próprios valores dos campos pedidos — derivados da
 * verdade, nunca uma segunda lista escrita à mão que poderia sair do ar com
 * ela. Nos outros verbos são as opções daquele campo.
 */
export const trayFor = (task: Task, change = 0): string[] =>
    task.kind === 'fill'
        ? task.fieldIds.map(field => task.clue.truth[field])
        : task.kind === 'correct'
          ? task.options
          : (task.changes[change]?.options ?? [])

/**
 * A dica do encaixe recusado no nível 1.
 *
 * Ela nomeia a FUNÇÃO do campo que recusou e diz a que campo o valor pertence
 * — nunca "errado" sozinho. É a frase do §5: "LOCAL conta onde ela estava;
 * laranja é a COR."
 */
export const missText = (value: string, wrong: FieldId, right: FieldId) =>
    `${FIELD_LABEL[wrong]} ${FIELD_ROLE[wrong]}; ${value.toLowerCase()} é ` +
    `${FIELD_ARTICLE[right]} ${FIELD_LABEL[right]}.`

const MAX_SENTENCE = 58
const MAX_VALUE = 12
const PHASES_PER_LEVEL = 3
const MAX_CHANGES = 2

/**
 * Conferências do §9 do planejamento, rodadas ao abrir a cena.
 *
 * As que mais importam são as que não aparecem lendo o arquivo de dados:
 * etiquetas repetidas na mesma bandeja, mais de um campo errado no nível 2, e
 * uma nota do nível 3 que mexe em dois campos de uma vez. Todas as três só
 * saem simulando a fase passo a passo, que é o que este laço faz.
 */
export const validateLevels = (levels: LevelDef[] = LEVELS): string[] => {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.phases.length !== PHASES_PER_LEVEL) {
            problems.push(`nível ${level.level}: ${level.phases.length} fases (esperado ${PHASES_PER_LEVEL})`)
        }

        level.phases.forEach(phase => {
            const where = `${level.level}/${phase.id}`
            const task = phase.task

            if (new Set(task.fieldIds).size !== task.fieldIds.length) {
                problems.push(`${where}: campo repetido na ficha`)
            }

            const checkValues = (values: string[], what: string) => {
                if (new Set(values).size !== values.length) {
                    problems.push(`${where}: etiquetas repetidas em ${what}`)
                }
                values.forEach(v => {
                    if (v.length > MAX_VALUE) {
                        problems.push(`${where}: valor "${v}" com ${v.length} caracteres (máx ${MAX_VALUE})`)
                    }
                })
            }

            if (task.kind !== 'update') {
                const { truth, sentence } = task.clue
                if (sentence.length > MAX_SENTENCE) {
                    problems.push(`${where}: pista com ${sentence.length} caracteres (máx ${MAX_SENTENCE})`)
                }
                task.fieldIds.forEach(field => {
                    if (!truth[field]) problems.push(`${where}: ${FIELD_LABEL[field]} sem valor na pista`)
                })
                checkValues(trayFor(task), 'na bandeja')
            }

            if (task.kind === 'fill') {
                task.fieldIds.forEach(field => {
                    if (task.initial[field] !== undefined) {
                        problems.push(`${where}: ${FIELD_LABEL[field]} já vem preenchido numa ficha de montar`)
                    }
                })
            }

            if (task.kind === 'correct') {
                const shown = task.fieldIds.reduce<PartialSighting>(
                    (acc, f) => ({ ...acc, [f]: task.initial[f] }),
                    {},
                )
                const wrong = mismatchedFields(shown, task.clue.truth)
                if (wrong.length !== 1) {
                    problems.push(`${where}: ${wrong.length} campos errados (esperado 1)`)
                }
                const right = wrong[0] ? task.clue.truth[wrong[0]] : ''
                const hits = task.options.filter(o => o === right).length
                if (hits !== 1) problems.push(`${where}: valor certo aparece ${hits} vezes nas opções`)
                /*
                 * A PISTA PRECISA MENCIONAR TODOS OS CAMPOS MOSTRADOS.
                 *
                 * Tocar num campo que bate com a pista custa vida. Se a pista
                 * não disser aquele valor, a criança não tem como conferi-lo,
                 * e o jogo cobraria dela uma informação que nunca deu.
                 */
                const frase = task.clue.sentence.toLowerCase()
                task.fieldIds.forEach(field => {
                    const valor = task.clue.truth[field].toLowerCase()
                    if (!frase.includes(valor)) {
                        problems.push(`${where}: a pista não diz "${valor}" (${FIELD_LABEL[field]})`)
                    }
                })
            }

            if (task.kind === 'update') {
                if (task.changes.length > MAX_CHANGES) {
                    problems.push(`${where}: ${task.changes.length} novidades (máx ${MAX_CHANGES})`)
                }
                let current = task.initial
                task.changes.forEach((change, i) => {
                    const step = `${where}/n${i + 1}`
                    if (change.note.length > MAX_SENTENCE) {
                        problems.push(`${step}: nota com ${change.note.length} caracteres (máx ${MAX_SENTENCE})`)
                    }
                    const moved = keysOf(current).filter(f => current[f] !== change.next[f])
                    if (moved.length !== 1) {
                        problems.push(`${step}: a nota muda ${moved.length} campos (esperado 1)`)
                    }
                    const field = moved[0]
                    if (field && !task.fieldIds.includes(field)) {
                        problems.push(`${step}: muda ${FIELD_LABEL[field]}, que não está na ficha`)
                    }
                    const novo = field ? change.next[field] : ''
                    const hits = change.options.filter(o => o === novo).length
                    if (hits !== 1) problems.push(`${step}: valor novo aparece ${hits} vezes nas opções`)
                    // o valor ATUAL entre as opções é intencional (§10): é o
                    // engano de quem não leu a nota, e precisa estar lá
                    checkValues(change.options, `na bandeja da nota ${i + 1}`)
                    current = change.next
                })
            }
        })
    })

    return problems
}

export const shuffled = <T>(list: T[]): T[] => {
    const out = list.slice()
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}
