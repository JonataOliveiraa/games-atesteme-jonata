import type { Bit, LevelDef, PhaseDef } from '../types'

/**
 * ── NÍVEIS E FASES ────────────────────────────────────────────────────────
 *
 *   N1  2 fases   5 × 5   fila calma        conhecer o jogo
 *   N2  3 fases   5 × 5   fila mais rápida  o mesmo jogo, com ritmo
 *   N3  2 fases   6 × 6   fila rápida       a mensagem MAIOR: 36 pedaços
 *
 * Fase = uma entrega: um desenho inteiro atravessando o túnel. Cada fase
 * concluída vira uma figurinha no álbum do cabeçalho, e no fim do nível a nave
 * leva o álbum embora.
 *
 * A mecânica não muda uma vírgula do primeiro ao último nível — o que cresce é
 * o tamanho da mensagem e a velocidade da fila. É a regra do INSTRUCOES: a
 * dificuldade cresce por ritmo e quantidade, nunca por interface nova.
 */

const art = (rows: string[]): Bit[][] =>
    rows.map(row => row.split('').map(n => (n === '1' ? 1 : 0)) as Bit[])

const phase = (rows: string[]): PhaseDef => ({ art: art(rows) })

/** Cada nível vale 30. Três níveis fecham os 90 da ficha do catálogo. */
const LEVEL_WORTH = 30

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Duas entregas!',
        speed: 170,
        phases: [
            phase([
                '00100',
                '01110',
                '11111',
                '11011',
                '11011',
            ]),
            phase([
                '00100',
                '11111',
                '01110',
                '01010',
                '11011',
            ]),
        ],
        closing: 'A máquina só entende cheio e vazio — e mesmo assim os seus desenhos chegaram inteiros.',
    },
    {
        level: 2,
        title: 'Três entregas!',
        speed: 215,
        phases: [
            phase([
                '10001',
                '11111',
                '10101',
                '11111',
                '01010',
            ]),
            phase([
                '00100',
                '01110',
                '11111',
                '00100',
                '00100',
            ]),
            phase([
                '00010',
                '01111',
                '11111',
                '01111',
                '00010',
            ]),
        ],
        closing: 'Mais rápido, e os três chegaram do mesmo jeito: pedaço por pedaço, na ordem.',
    },
    {
        level: 3,
        title: 'Entregas grandes!',
        speed: 250,
        phases: [
            phase([
                '001100',
                '011110',
                '011110',
                '011110',
                '111111',
                '010010',
            ]),
            phase([
                '011110',
                '101101',
                '111111',
                '011110',
                '010010',
                '110011',
            ]),
        ],
        closing: 'Trinta e seis pedaços por desenho — e do outro lado eles voltaram a ser figura.',
    },
]

/** Quantas linhas e colunas o nível usa. Sai do próprio desenho. */
export const sizeOf = (level: LevelDef) => level.phases[0].art.length

/** O que este quadradinho vale. Sai do desenho, nunca de um campo da caixa. */
export const expectedBit = (phaseDef: PhaseDef, row: number, col: number): Bit => phaseDef.art[row][col]

/** O veredito, no instante do impacto. */
export const solves = (shot: Bit | null, phaseDef: PhaseDef, row: number, col: number) =>
    shot !== null && shot === expectedBit(phaseDef, row, col)

/**
 * Quanto vale uma fase.
 *
 * Dividir os 30 do nível pelo número de fases é o que mantém os 90 do catálogo
 * com níveis de tamanhos diferentes: 15 por fase no nível de duas, 10 no de
 * três.
 */
export const pointsFor = (level: LevelDef, stalled: boolean) => {
    const clean = Math.round(LEVEL_WORTH / level.phases.length)
    return stalled ? Math.max(1, Math.floor(clean / 2)) : clean
}

/**
 * Um desenho quase vazio some no fundo; um quase cheio vira bloco de tinta.
 * Nos dois casos a criança para de olhar o quadradinho e passa a chutar.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        if (!level.phases.length || level.phases.length > 5) {
            problems.push(`nível ${level.level}: ${level.phases.length} fases`)
        }
        const size = sizeOf(level)
        level.phases.forEach((phaseDef, p) => {
            if (phaseDef.art.length !== size) problems.push(`nível ${level.level}, fase ${p}: grade diferente`)
            phaseDef.art.forEach((row, i) => {
                if (row.length !== size) problems.push(`nível ${level.level}, fase ${p}, linha ${i}: ${row.length}`)
            })
            const cells = size * size
            const ones = phaseDef.art.flat().filter(bit => bit === 1).length
            if (ones < cells * 0.35 || ones > cells * 0.72) {
                problems.push(`nível ${level.level}, fase ${p}: ${ones} de ${cells} cheios`)
            }
        })
    })
    return problems
}
