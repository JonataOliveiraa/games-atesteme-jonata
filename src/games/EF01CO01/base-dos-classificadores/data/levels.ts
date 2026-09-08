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
    verde: 'VERDE',
    amarelo: 'AMARELA',
    roxo: 'ROXA',
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
                id: 'n1-cores-novas',
                rule: 'cor',
                baskets: ['azul', 'amarelo', 'roxo'],
                stones: [
                    s('roxo', 'retangulo'),
                    s('amarelo', 'triangulo'),
                    s('azul', 'circulo'),
                    s('roxo', 'quadrado'),
                    s('amarelo', 'retangulo'),
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
                    s('roxo', 'triangulo'),
                    s('vermelho', 'circulo'),
                    s('verde', 'quadrado'),
                    s('azul', 'triangulo'),
                ],
            },
            {
                id: 'n2-cor',
                rule: 'cor',
                baskets: ['vermelho', 'verde', 'roxo'],
                stones: [
                    s('vermelho', 'retangulo'),
                    s('verde', 'circulo'),
                    s('roxo', 'quadrado'),
                    s('vermelho', 'triangulo'),
                    s('roxo', 'circulo'),
                    s('verde', 'retangulo'),
                ],
            },
            {
                id: 'n2-forma-parecidas',
                rule: 'forma',
                baskets: ['circulo', 'quadrado', 'triangulo', 'retangulo'],
                stones: [
                    s('vermelho', 'quadrado'),
                    s('azul', 'retangulo'),
                    s('amarelo', 'circulo'),
                    s('verde', 'triangulo'),
                    s('roxo', 'retangulo'),
                    s('azul', 'quadrado'),
                ],
            },
            {
                id: 'n2-cor-parecidas',
                rule: 'cor',
                baskets: ['azul', 'roxo', 'amarelo', 'verde'],
                stones: [
                    s('azul', 'circulo'),
                    s('roxo', 'circulo'),
                    s('amarelo', 'retangulo'),
                    s('verde', 'quadrado'),
                    s('roxo', 'triangulo'),
                    s('azul', 'quadrado'),
                ],
            },
        ],
    },
]
