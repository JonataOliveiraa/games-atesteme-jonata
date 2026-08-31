import type {
    ItemDef,
    LevelDef,
    Rule,
    RuleOption,
    TraitKind,
    TraitValue,
} from '../types'
import { poolOf } from './items'

/**
 * Três níveis, TRÊS trechos cada. O trecho é a "fase" deste jogo: tem começo,
 * fim e um portal quadriculado que a criança vê passar, e três bandeirinhas no
 * topo dizem o quanto falta sem precisar de um contador.
 *
 * No último trecho o mundo acelera (`sprintFrom`/`sprintFactor`): a corrida
 * termina mais rápido do que começou, e isso se sente sem precisar de aviso.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        biome: 'forest',
        lanes: 2,
        stretches: [3, 3, 3],
        fallMs: 2100,
        spawnGapMs: 650,
        sprintFrom: 2,
        sprintFactor: 1.1,
        hint: 'Uma cor por rodada, duas faixas largas.',
        rulePlan: [
            {
                fromStretch: 0,
                kind: 'color',
                mode: 'include',
                values: ['vermelho', 'amarelo', 'verde', 'roxo'],
                sheets: ['item-formas', 'item-frutas'],
            },
        ],
    },
    {
        level: 2,
        biome: 'snow',
        lanes: 3,
        stretches: [4, 4, 4],
        fallMs: 1800,
        spawnGapMs: 480,
        sprintFrom: 2,
        sprintFactor: 1.14,
        hint: 'A placa troca de cor para forma no meio da corrida.',
        rulePlan: [
            {
                fromStretch: 0,
                kind: 'color',
                mode: 'include',
                values: ['vermelho', 'azul', 'amarelo', 'verde', 'roxo'],
                sheets: ['item-formas', 'item-frutas'],
            },
            {
                fromStretch: 1,
                kind: 'shape',
                mode: 'include',
                values: ['redondo', 'quadrado', 'triangulo', 'estrela'],
                sheets: ['item-formas', 'item-frutas'],
            },
        ],
    },
    {
        level: 3,
        biome: 'autumn',
        lanes: 3,
        stretches: [5, 5, 5],
        fallMs: 1400,
        spawnGapMs: 380,
        sprintFrom: 2,
        sprintFactor: 1.18,
        hint: 'A placa passa a mostrar quem NÃO entra.',
        rulePlan: [
            {
                fromStretch: 0,
                kind: 'shape',
                mode: 'exclude',
                values: ['redondo', 'quadrado', 'estrela'],
                sheets: ['item-formas'],
            },
        ],
    },
]

export const TOTAL_ITEMS = LEVELS.reduce(
    (sum, level) => sum + level.stretches.reduce((a, b) => a + b, 0),
    0,
)

export const itemsInLevel = (level: LevelDef) =>
    level.stretches.reduce((a, b) => a + b, 0)

export const itemsBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, l) => sum + itemsInLevel(l), 0)

// ─────────────────────────────────────────────────────────── palavras

export const WORD_MANY: Record<string, string> = {
    vermelho: 'VERMELHOS', azul: 'AZUIS', amarelo: 'AMARELOS',
    roxo: 'ROXOS', verde: 'VERDES', laranja: 'LARANJAS',
    redondo: 'REDONDOS', quadrado: 'QUADRADOS', triangulo: 'TRIÂNGULOS',
    estrela: 'ESTRELAS', retangulo: 'RETÂNGULOS', comprido: 'COMPRIDOS',
}

export const WORD_ONE: Record<string, string> = {
    vermelho: 'VERMELHO', azul: 'AZUL', amarelo: 'AMARELO',
    roxo: 'ROXO', verde: 'VERDE', laranja: 'LARANJA',
    redondo: 'REDONDO', quadrado: 'QUADRADO', triangulo: 'TRIÂNGULO',
    estrela: 'ESTRELA', retangulo: 'RETÂNGULO', comprido: 'COMPRIDO',
}

// ─────────────────────────────────────────────────── a regra é um teste

export const traitOf = (def: ItemDef, kind: TraitKind): TraitValue =>
    kind === 'color' ? def.color : def.shape

/** O veredito é uma FUNÇÃO do item e da placa do momento — nunca um campo. */
export function shouldCollect(def: ItemDef, rule: Rule): boolean {
    const has = traitOf(def, rule.kind) === rule.value
    return rule.mode === 'include' ? has : !has
}

export const makeRule = (option: RuleOption, value: TraitValue): Rule => ({
    mode: option.mode,
    kind: option.kind,
    value,
    word: WORD_MANY[String(value)] ?? String(value).toUpperCase(),
})

export const candidatesFor = (pool: ItemDef[], rule: Rule, collect: boolean): ItemDef[] =>
    pool.filter(def => shouldCollect(def, rule) === collect)

/**
 * Uma rodada só é jogável se as DUAS respostas existirem. Placa que só produz
 * itens para pegar transforma o jogo em "toque em tudo" e some com a
 * habilidade — por isso o valor é escolhido entre os que passam neste teste.
 */
export const isPlayable = (pool: ItemDef[], rule: Rule) =>
    candidatesFor(pool, rule, true).length > 0 && candidatesFor(pool, rule, false).length > 0

export function pickRule(
    option: RuleOption,
    rng: () => number,
    avoid?: TraitValue,
): Rule {
    const pool = poolOf(option.sheets)
    const usable = option.values.filter(v => isPlayable(pool, makeRule(option, v)))
    const safe = usable.length ? usable : option.values
    const fresh = safe.filter(v => v !== avoid)
    const list = fresh.length ? fresh : safe
    return makeRule(option, list[Math.floor(rng() * list.length) % list.length])
}

export function pickCandidate(
    pool: ItemDef[],
    rule: Rule,
    collect: boolean,
    rng: () => number,
): ItemDef | null {
    const list = candidatesFor(pool, rule, collect)
    if (!list.length) return null
    return list[Math.floor(rng() * list.length) % list.length]
}

/**
 * Metade dos itens entra e metade passa, sem três iguais seguidos: a criança
 * precisa DECIDIR a cada item, e não descobrir um ritmo e repeti-lo.
 */
export function nextDecision(history: boolean[], rng: () => number): boolean {
    const n = history.length
    if (n >= 2 && history[n - 1] === history[n - 2]) return !history[n - 1]
    const collected = history.filter(Boolean).length
    if (n >= 4 && collected * 2 > n + 1) return false
    if (n >= 4 && collected * 2 < n - 1) return true
    return rng() < 0.5
}

export function nextLane(lanes: number, history: number[], rng: () => number): number {
    const n = history.length
    const banned = n >= 2 && history[n - 1] === history[n - 2] ? history[n - 1] : -1
    const options = Array.from({ length: lanes }, (_, i) => i).filter(i => i !== banned)
    return options[Math.floor(rng() * options.length) % options.length]
}

// ─────────────────────────────────────────────────────────── as frases

/**
 * Na regra de negação a frase precisa dizer AS DUAS COISAS. "Pegue tudo,
 * menos os X" foi lido como "só desvie dos X", e quem deixava o resto passar
 * levava erro sem entender por quê — a placa não estava mentindo, estava
 * calada sobre metade do trabalho.
 */
export const ruleSentence = (rule: Rule) =>
    rule.mode === 'include'
        ? `Pegue só os ${rule.word}.`
        : `Não pegue ${rule.word}. Pegue o resto!`

export const OK_COLLECT = 'Boa! Esse combina com a placa.'
export const OK_PASS = 'Isso! O diferente passa direto.'

/** Erro nunca é "tente de novo": diz QUAL peça e por quê. */
export function mistakeSentence(
    def: ItemDef,
    rule: Rule,
    tookIt: boolean,
): string {
    const mine = WORD_ONE[String(traitOf(def, rule.kind))] ?? ''
    const asked = WORD_ONE[String(rule.value)] ?? ''
    if (tookIt) {
        return rule.mode === 'include'
            ? `Esse é ${mine}. Pegue só os ${rule.word}.`
            : `Esse é ${asked}. Esse fica de fora!`
    }
    return rule.mode === 'include'
        ? `Esse é ${mine}! Ele entra no carrinho.`
        : `Não é ${asked}. Ele entra no carrinho.`
}

export const starsFor = (firstTry: number, total: number) => {
    const pct = total > 0 ? firstTry / total : 0
    return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
}
