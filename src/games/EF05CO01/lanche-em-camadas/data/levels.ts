import type { LevelDef } from '../types'
import { INGREDIENTS } from './ingredients'

export const POINTS = 10

export const guideKey = (level: number) => `ef05co01-lanche-l${level}`

const N1: LevelDef = {
    level: 1,
    title: 'Monte na ordem',
    message: 'A receita é uma lista: cada camada tem a sua vez, e a 1ª vai embaixo. Pegando na ordem, o lanche sai certo.',
    spawnMs: 1500,
    maxAir: 2,
    pool: ['paoBaixo', 'paoCima', 'carne', 'queijo', 'alface', 'tomate'],
    orders: [
        {
            id: 'xburguer',
            customer: 0,
            ask: 'Quero um X-Burguer!',
            recipe: ['paoBaixo', 'carne', 'paoCima'],
            fall: 150,
            yum: 'Hmm, que delícia!',
            yuck: 'Eca! Está fora da ordem!',
        },
        {
            id: 'xqueijo',
            customer: 1,
            ask: 'Um X-Queijo, por favor!',
            recipe: ['paoBaixo', 'carne', 'queijo', 'paoCima'],
            fall: 165,
            yum: 'Queijo derretido! Amei!',
            yuck: 'Eca! Está fora da ordem!',
        },
        {
            id: 'xsalada',
            customer: 2,
            ask: 'Quero um X-Salada!',
            recipe: ['paoBaixo', 'carne', 'queijo', 'alface', 'paoCima'],
            fall: 180,
            yum: 'Igualzinho ao da receita!',
            yuck: 'Eca! Está fora da ordem!',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1]

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        level.pool.forEach(id => {
            if (!INGREDIENTS[id]) problems.push(`N${level.level}: ${id} não existe`)
        })
        level.orders.forEach((o, i) => {
            const tag = `N${level.level} ${o.id}`
            if (o.recipe[0] !== 'paoBaixo') problems.push(`${tag}: não começa com o pão de baixo`)
            if (o.recipe[o.recipe.length - 1] !== 'paoCima') problems.push(`${tag}: não termina com o pão de cima`)
            if (o.recipe.length < 3) problems.push(`${tag}: receita curta demais`)
            o.recipe.forEach(id => {
                if (!level.pool.includes(id)) problems.push(`${tag}: ${id} não está na cozinha do nível`)
            })
            const prev = level.orders[i - 1]
            if (prev && o.recipe.length < prev.recipe.length) problems.push(`${tag}: a receita encolheu`)
            if (prev && o.fall < prev.fall) problems.push(`${tag}: a queda ficou mais lenta`)
            if (!o.ask || !o.yum || !o.yuck) problems.push(`${tag}: falta fala`)
        })
        if (level.pool.length < 4) problems.push(`N${level.level}: cozinha com poucos ingredientes para distrair`)
    })
    if (problems.length) throw new Error(`Lanche em Camadas — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
