import { GRID } from './layout'
import { LEVELS } from './levels'
import type { Cell, LevelDef, PaintedCell, Task } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O VEREDITO SAI DO COMANDO, NÃO DE UMA RESPOSTA GUARDADA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Nenhuma tarefa carrega um `correctCellId`. Onde a tinta deve cair é uma
 * FUNÇÃO do pedido e, no caso de mover e copiar, da célula de origem mais o
 * deslocamento. É o que permite o nível 3 existir: se a resposta estivesse
 * escrita nos dados, "uma coluna à direita" viraria decoração em volta de uma
 * célula já decidida, e a criança poderia acertar sem contar o passo.
 *
 * ── A FACHADA É UM MAPA, NÃO UM CONJUNTO ─────────────────────────────────
 *
 * Cada célula pintada guarda QUAL tinta está nela. Sem isso o nível 3 não
 * teria como fazer a mancha laranja continuar laranja ao mudar de lugar, e
 * mover e copiar voltariam a terminar iguais na tela.
 */

export type Painted = Map<string, number>

export const sameCell = (a: Cell, b: Cell) => a.row === b.row && a.col === b.col

export const inGrid = (c: Cell) =>
    c.row >= 1 && c.row <= GRID.n && c.col >= 1 && c.col <= GRID.n

export const destinationOf = (task: Extract<Task, { source: Cell }>): Cell => ({
    row: task.source.row + task.shift.row,
    col: task.source.col + task.shift.col,
})

/** Onde a criança precisa tocar para esta tarefa estar certa. */
export const answerOf = (task: Task): Cell =>
    task.kind === 'paint'
        ? task.target
        : task.kind === 'read'
          ? task.highlighted
          : destinationOf(task)

export const keyOf = (c: Cell) => `${c.row}:${c.col}`

/** O texto que a criança lê, na convenção fixa L antes de C. */
export const label = (c: Cell) => `L${c.row}, C${c.col}`

export const correct = (task: Task, chosen: Cell) => sameCell(chosen, answerOf(task))

export const paintedFrom = (cells: PaintedCell[]): Painted =>
    new Map(cells.map(c => [keyOf(c), c.ink ?? 0]))

/** A tinta que este disparo vai usar: a da origem, ou a da tarefa. */
export const inkFor = (painted: Painted, task: Task): number => {
    // estreitamento pelo lado POSITIVO: `kind: 'move' | 'copy'` é um membro só
    // da união, e descartá-lo por eliminação não convence o compilador
    if (task.kind === 'paint' || task.kind === 'read') return task.ink ?? 0
    return painted.get(keyOf(task.source)) ?? 0
}

/**
 * O estado da fachada depois de uma tarefa cumprida.
 *
 * Devolve um mapa NOVO em vez de mexer no que recebeu: a fachada é redesenhada
 * a partir dele, e mutação em silêncio é o tipo de coisa que faz uma célula
 * pintada aparecer no mural seguinte.
 */
export const applyTask = (painted: Painted, task: Task): Painted => {
    const next = new Map(painted)
    const ink = inkFor(painted, task)
    if (task.kind === 'paint') next.set(keyOf(task.target), ink)
    else if (task.kind === 'read') next.set(keyOf(task.highlighted), ink)
    else {
        // a única diferença entre mover e copiar: um apaga a origem, o outro
        // a deixa onde está. A tinta é a mesma nos dois.
        if (task.kind === 'move') next.delete(keyOf(task.source))
        next.set(keyOf(destinationOf(task)), ink)
    }
    return next
}

const MAX_TASKS = 4

/**
 * Conferências do §9 do planejamento, rodadas ao abrir a cena.
 *
 * A que mais importa é a da origem pintada: uma tarefa de MOVER cuja origem
 * ainda não recebeu tinta é impossível, e isso não aparece lendo o arquivo de
 * dados — só simulando o mural pedido a pedido, que é o que este laço faz.
 */
export const validateLevels = (levels: LevelDef[] = LEVELS): string[] => {
    const problems: string[] = []
    levels.forEach(level => {
        if (!level.murals.length) problems.push(`nível ${level.level}: sem murais`)
        level.murals.forEach(mural => {
            const where = `${level.level}/${mural.id}`
            if (mural.tasks.length > MAX_TASKS) {
                problems.push(`${where}: ${mural.tasks.length} tarefas (máx ${MAX_TASKS})`)
            }
            mural.initialPainted.forEach(c => {
                if (!inGrid(c)) problems.push(`${where}: pintura inicial fora da grade em ${label(c)}`)
            })

            let painted = paintedFrom(mural.initialPainted)
            mural.tasks.forEach((task, i) => {
                const step = `${where}/t${i + 1}`
                const answer = answerOf(task)
                if (!inGrid(answer)) problems.push(`${step}: resposta fora da grade em ${label(answer)}`)

                if (task.kind === 'read') {
                    const hits = task.options.filter(o => sameCell(o, task.highlighted)).length
                    if (hits !== 1) problems.push(`${step}: ${hits} opções corretas no trio`)
                    const ids = new Set(task.options.map(keyOf))
                    if (ids.size !== task.options.length) problems.push(`${step}: opções repetidas`)
                    task.options.forEach(o => {
                        if (!inGrid(o)) problems.push(`${step}: opção fora da grade em ${label(o)}`)
                    })
                    if (painted.has(keyOf(task.highlighted))) {
                        problems.push(`${step}: ${label(task.highlighted)} já está pintada`)
                    }
                }

                if (task.kind === 'move' || task.kind === 'copy') {
                    if (!painted.has(keyOf(task.source))) {
                        problems.push(`${step}: origem ${label(task.source)} não está pintada`)
                    }
                    if (painted.has(keyOf(answer))) {
                        problems.push(`${step}: destino ${label(answer)} já está pintado`)
                    }
                    const steps = Math.abs(task.shift.row) + Math.abs(task.shift.col)
                    if (steps !== 1) problems.push(`${step}: deslocamento de ${steps} passos`)
                }

                if (task.kind === 'paint' && painted.has(keyOf(task.target))) {
                    problems.push(`${step}: ${label(task.target)} já estava pintada`)
                }

                painted = applyTask(painted, task)
            })
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
