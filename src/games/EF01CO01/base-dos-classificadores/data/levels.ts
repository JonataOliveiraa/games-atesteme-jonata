import type { Attribute, Color, LevelConfig, Shape, Size, Stone } from '../types'

export const SHAPE_FRAME: Record<Shape, number> = {
    circulo: 0,
    quadrado: 1,
    triangulo: 2,
    retangulo: 3,
}

export const SIZE_SCALE: Record<Size, number> = {
    pequena: 0.78,
    media: 1.02,
    grande: 1.26,
}

export const COLOR_LABEL: Record<Color, string> = {
    vermelho: 'VERMELHA',
    azul: 'AZUL',
    amarelo: 'AMARELA',
}

export const SHAPE_LABEL: Record<Shape, string> = {
    circulo: 'REDONDA',
    quadrado: 'QUADRADA',
    triangulo: 'TRIANGULAR',
    retangulo: 'COMPRIDA',
}

export const SIZE_LABEL: Record<Size, string> = {
    pequena: 'PEQUENA',
    media: 'MÉDIA',
    grande: 'GRANDE',
}

export function stoneValue(stone: Stone, rule: Attribute): string {
    if (rule === 'cor') return stone.color
    if (rule === 'forma') return stone.shape
    return stone.size
}

export function matches(stone: Stone, rule: Attribute, value: string): boolean {
    return stoneValue(stone, rule) === value
}

export const RULE_WORD: Record<Attribute, string> = {
    cor: 'COR',
    forma: 'FORMA',
    tamanho: 'TAMANHO',
}

export function ruleLabel(rule: Attribute, value: string): string {
    if (rule === 'cor') return COLOR_LABEL[value as Color]
    if (rule === 'forma') return SHAPE_LABEL[value as Shape]
    return SIZE_LABEL[value as Size]
}

const EXAMPLE_SHAPES: Shape[] = ['circulo', 'quadrado', 'triangulo']
const EXAMPLE_COLORS: Color[] = ['vermelho', 'azul', 'amarelo']

export function ruleExamples(rule: Attribute, value: string): Stone[] {
    if (rule === 'cor') {
        return EXAMPLE_SHAPES.map(shape => ({
            color: value as Color, shape, size: 'media' as Size,
        }))
    }
    if (rule === 'forma') {
        return EXAMPLE_COLORS.map(color => ({
            color, shape: value as Shape, size: 'media' as Size,
        }))
    }
    return EXAMPLE_SHAPES.map((shape, i) => ({
        color: EXAMPLE_COLORS[i], shape, size: value as Size,
    }))
}

const s = (color: Color, shape: Shape, size: Size = 'media'): Stone => ({ color, shape, size })

export const MAX_STONES = 6
export const MAX_COLOR_BASKETS = 3

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        title: 'Guarde pela cor',
        message: 'Cada cesto mostra o que aceita!',
        phases: [
            {
                id: 'n1-duas-cores',
                rule: 'cor',
                baskets: ['vermelho', 'azul'],
                stones: [
                    s('vermelho', 'circulo'),
                    s('azul', 'triangulo'),
                    s('vermelho', 'retangulo'),
                    s('azul', 'quadrado'),
                    s('vermelho', 'quadrado'),
                    s('azul', 'circulo'),
                ],
            },
            {
                id: 'n1-tres-cores',
                rule: 'cor',
                baskets: ['vermelho', 'azul', 'amarelo'],
                stones: [
                    s('amarelo', 'quadrado'),
                    s('vermelho', 'triangulo'),
                    s('azul', 'retangulo'),
                    s('amarelo', 'circulo'),
                    s('azul', 'triangulo'),
                    s('vermelho', 'circulo'),
                ],
            },
            {
                id: 'n1-cestos-trocados',
                rule: 'cor',
                baskets: ['amarelo', 'vermelho', 'azul'],
                stones: [
                    s('azul', 'circulo'),
                    s('amarelo', 'retangulo'),
                    s('vermelho', 'quadrado'),
                    s('amarelo', 'triangulo'),
                    s('vermelho', 'retangulo'),
                    s('azul', 'quadrado'),
                ],
            },
        ],
    },
    {
        level: 2,
        title: 'Cor e forma',
        message: 'A placa diz o que muda!',
        phases: [
            {
                id: 'n2-forma',
                rule: 'forma',
                baskets: ['circulo', 'quadrado', 'triangulo'],
                stones: [
                    s('azul', 'circulo'),
                    s('amarelo', 'quadrado'),
                    s('vermelho', 'triangulo'),
                    s('vermelho', 'circulo'),
                    s('azul', 'quadrado'),
                    s('amarelo', 'triangulo'),
                ],
            },
            {
                id: 'n2-cor',
                rule: 'cor',
                baskets: ['azul', 'amarelo', 'vermelho'],
                stones: [
                    s('vermelho', 'retangulo'),
                    s('azul', 'circulo'),
                    s('amarelo', 'triangulo'),
                    s('vermelho', 'quadrado'),
                    s('amarelo', 'retangulo'),
                    s('azul', 'triangulo'),
                ],
            },
            {
                id: 'n2-forma-parecidas',
                rule: 'forma',
                baskets: ['quadrado', 'retangulo', 'triangulo'],
                stones: [
                    s('vermelho', 'quadrado'),
                    s('azul', 'retangulo'),
                    s('amarelo', 'quadrado'),
                    s('vermelho', 'retangulo'),
                    s('azul', 'triangulo'),
                    s('amarelo', 'retangulo'),
                ],
            },
        ],
    },
]

export function validateLevels(levels: LevelConfig[]): string[] {
    const problems: string[] = []
    const colors = Object.keys(COLOR_LABEL)

    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.phases.length !== 3) problems.push(`${tag}: ${level.phases.length} fases`)

        level.phases.forEach((phase, i) => {
            const where = `${tag}/${phase.id}`
            if (phase.stones.length > MAX_STONES) problems.push(`${where}: ${phase.stones.length} pedras`)
            if (phase.stones.some(stone => !colors.includes(stone.color))) problems.push(`${where}: cor fora das 3`)
            if (phase.rule === 'cor' && phase.baskets.length > MAX_COLOR_BASKETS) {
                problems.push(`${where}: cestos de cor demais`)
            }
            phase.stones.forEach(stone => {
                const homes = phase.baskets.filter(value => matches(stone, phase.rule, value)).length
                if (homes !== 1) problems.push(`${where}: pedra ${stone.color}/${stone.shape} com ${homes} cestos`)
            })
            phase.baskets.forEach(value => {
                if (!phase.stones.some(stone => matches(stone, phase.rule, value))) {
                    problems.push(`${where}: cesto ${value} sem pedra`)
                }
            })
            if (level.level === 1 && phase.rule !== 'cor') problems.push(`${where}: o N1 é só cor`)
            const previous = level.phases[i - 1]
            if (level.level === 2 && previous && previous.rule === phase.rule) {
                problems.push(`${where}: a regra não alternou`)
            }
        })
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[base-dos-classificadores]', PROBLEMS)
