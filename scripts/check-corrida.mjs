/**
 * ══════════════════════════════════════════════════════════════════════════
 *  check-corrida — a Corrida dos Parecidos sem abrir o navegador
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Medir a tela não basta neste jogo: a placa é sorteada e os itens são
 * gerados na hora, então uma rodada IMPOSSÍVEL (placa que só produz itens
 * para pegar, ou nenhum item que combine) não aparece em revisão de código.
 * Este script roda as rodadas de verdade, com as funções de verdade.
 *
 *   node scripts/check-corrida.mjs
 */
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import ts from 'typescript'

const GAME = 'src/games/EF01CO01/corrida-dos-parecidos'
const OUT = '/tmp/check-corrida'
const failures = []
const check = (label, condition, detail = '') => {
    if (!condition) failures.push(`${label}${detail ? ` — ${detail}` : ''}`)
}

// ── transpila os arquivos de dados (sem esbuild: o próprio tsc já está aqui)
mkdirSync(OUT, { recursive: true })
const port = (name) => {
    const source = readFileSync(`${GAME}/data/${name}.ts`, 'utf8')
    const js = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText.replace(/from '\.\/(\w+)'/g, "from './$1.mjs'")
    writeFileSync(`${OUT}/${name}.mjs`, js)
    return import(pathToFileURL(`${OUT}/${name}.mjs`).href)
}

await port('items')
const items = await port('items')
const levels = await port('levels')
const layout = await port('layout')
const theme = await port('theme')

const {
    LEVELS, TOTAL_ITEMS, itemsInLevel, makeRule, isPlayable, candidatesFor,
    pickCandidate, nextDecision, nextLane, shouldCollect, ruleSentence,
    mistakeSentence, starsFor, WORD_ONE,
} = levels
const { poolOf } = items

const mulberry = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

// ── 1. estrutura ─────────────────────────────────────────────────────────
check('três níveis', LEVELS.length === 3, `são ${LEVELS.length}`)
check('36 itens no total', TOTAL_ITEMS === 36, `são ${TOTAL_ITEMS}`)
for (const level of LEVELS) {
    const tag = `nível ${level.level}`
    check(`${tag}: três trechos`, level.stretches.length === 3, `${level.stretches.length}`)
    check(`${tag}: a arrancada é no último trecho`,
        level.sprintFrom === level.stretches.length - 1 && level.sprintFactor > 1)
    check(`${tag}: 2 ou 3 faixas`, level.lanes === 2 || level.lanes === 3)
    check(`${tag}: a primeira placa entra no trecho 0`, level.rulePlan[0].fromStretch === 0)
    check(`${tag}: itens por trecho entre 3 e 5`, level.stretches.every(n => n >= 3 && n <= 5))
}

// ── 2. nenhuma placa impossível ──────────────────────────────────────────
for (const level of LEVELS) {
    for (const option of level.rulePlan) {
        const pool = poolOf(option.sheets)
        for (const value of option.values) {
            const rule = makeRule(option, value)
            const yes = candidatesFor(pool, rule, true).length
            const no = candidatesFor(pool, rule, false).length
            check(
                `nível ${level.level}: placa "${rule.word}" tem os dois lados`,
                isPlayable(pool, rule),
                `pegar=${yes} deixar=${no}`,
            )
        }
    }
}

// ── 3. simula as rodadas ─────────────────────────────────────────────────
/** Repete o laço da GameScene: mesma ordem, mesmas funções. */
function playRound(level, seed) {
    const rng = mulberry(seed)
    const total = itemsInLevel(level)
    let stretch = 0
    let inStretch = 0
    let decisions = []
    let lanes = []
    let collected = 0
    let option = level.rulePlan[0]
    let pool = poolOf(option.sheets)
    let rule = makeRule(option, option.values[Math.floor(rng() * option.values.length)])

    for (let i = 0; i < total; i++) {
        if (inStretch >= level.stretches[stretch]) {
            stretch += 1
            inStretch = 0
            const slot = level.rulePlan.findIndex(o => o.fromStretch === stretch)
            if (slot > 0) {
                option = level.rulePlan[slot]
                pool = poolOf(option.sheets)
                rule = makeRule(option, option.values[Math.floor(rng() * option.values.length)])
                decisions = []
            }
        }
        const collect = nextDecision(decisions, rng)
        const candidate = pickCandidate(pool, rule, collect, rng)
        if (!candidate) return { fatal: `sem item para "${rule.word}" (${collect ? 'pegar' : 'deixar'})` }
        if (shouldCollect(candidate.def, candidate.size, rule) !== collect) {
            return { fatal: `item ${candidate.def.id}/${candidate.size} não obedece "${rule.word}"` }
        }
        const lane = nextLane(level.lanes, lanes, rng)
        decisions.push(collect)
        lanes.push(lane)
        if (collect) collected += 1
        inStretch += 1

        const d = decisions
        if (d.length >= 3 && d.at(-1) === d.at(-2) && d.at(-2) === d.at(-3)) {
            return { fatal: 'três decisões iguais seguidas' }
        }
        if (lanes.length >= 3 && lanes.at(-1) === lanes.at(-2) && lanes.at(-2) === lanes.at(-3)) {
            return { fatal: 'três itens seguidos na mesma faixa' }
        }
    }
    return { ratio: collected / total }
}

for (const level of LEVELS) {
    let worstLow = 1
    let worstHigh = 0
    for (let seed = 1; seed <= 800; seed++) {
        const result = playRound(level, seed)
        if (result.fatal) {
            check(`nível ${level.level}: rodada jogável`, false, `semente ${seed}: ${result.fatal}`)
            break
        }
        worstLow = Math.min(worstLow, result.ratio)
        worstHigh = Math.max(worstHigh, result.ratio)
    }
    check(
        `nível ${level.level}: equilíbrio entre pegar e deixar passar`,
        worstLow >= 0.28 && worstHigh <= 0.72,
        `de ${(worstLow * 100).toFixed(0)}% a ${(worstHigh * 100).toFixed(0)}%`,
    )
}

// ── 4. teto de caracteres das frases ─────────────────────────────────────
const TETO_FALA = 52
for (const level of LEVELS) {
    for (const option of level.rulePlan) {
        const pool = poolOf(option.sheets)
        for (const value of option.values) {
            const rule = makeRule(option, value)
            const sentence = ruleSentence(rule)
            check(`fala da placa cabe (${sentence})`, sentence.length <= TETO_FALA, `${sentence.length}`)
            const album = rule.mode === 'include'
                ? `Olha só: todos ${rule.word}!`
                : `Nenhum ${WORD_ONE[String(rule.value)]} no carrinho!`
            check(`título do álbum cabe (${album})`, album.length <= 44, `${album.length}`)
            for (const def of pool) {
                for (const size of ['small', 'big']) {
                    for (const took of [true, false]) {
                        const line = mistakeSentence(def, size, rule, took)
                        check(`recado de erro cabe (${line})`, line.length <= TETO_FALA, `${line.length}`)
                    }
                }
            }
        }
    }
}

// ── 4b. a fala cabe na plaquinha do copiloto ─────────────────────────────
const copilotPx = parseInt(theme.SIZE.copilot, 10)
const copilotWrap = layout.COPILOT.w - 100
const fitsPlate = (line) => {
    const linhas = Math.ceil((line.length * copilotPx * 0.6) / copilotWrap)
    return linhas <= 3 && linhas * (copilotPx + 6) <= layout.COPILOT.h - 20
}
for (const level of LEVELS) {
    for (const option of level.rulePlan) {
        const pool = poolOf(option.sheets)
        for (const value of option.values) {
            const rule = makeRule(option, value)
            check(`fala cabe na plaquinha (${ruleSentence(rule)})`, fitsPlate(ruleSentence(rule)))
            for (const def of pool) {
                for (const size of ['small', 'big']) {
                    for (const took of [true, false]) {
                        const line = mistakeSentence(def, size, rule, took)
                        check(`recado cabe na plaquinha (${line})`, fitsPlate(line))
                    }
                }
            }
        }
    }
}

// ── 5. estrelas ──────────────────────────────────────────────────────────
check('10 de 10 dá 3 estrelas', starsFor(10, 10) === 3)
check('8 de 10 dá 2 estrelas', starsFor(8, 10) === 2)
check('5 de 10 dá 1 estrela', starsFor(5, 10) === 1)

// ── 6. a tela ────────────────────────────────────────────────────────────
const {
    W, H, HEADER, COPILOT, SIGN, PROGRESS, HELP, ROAD, ROAD_RIGHT,
    CAR, CAR_H, ITEM, TOUCH_Y, TRAVEL, ALBUM, laneWidth,
} = layout

const dotsRight = PROGRESS.dotsX + (LEVELS[0].stretches.length - 1) * PROGRESS.gap + 15
check('pílula do nível não encosta nas bolinhas',
    PROGRESS.pillX + PROGRESS.pillW + 12 < PROGRESS.dotsX - PROGRESS.dotR, `${dotsRight}`)
check('bolinhas não encostam na placa',
    dotsRight + 12 < SIGN.x - SIGN.w / 2, `${dotsRight} vs ${SIGN.x - SIGN.w / 2}`)
check('placa não encosta no ?',
    SIGN.x + SIGN.w / 2 + 12 < HELP.x - HELP.r)
check('o ? cabe na tela', HELP.x + HELP.r <= W)
check('a pista cabe com acostamento', ROAD.x - ROAD.shoulder > 0 && ROAD_RIGHT + ROAD.shoulder < W)
check('item nasce abaixo do header',
    ITEM.spawnY - ITEM.big / 2 >= HEADER.h + HEADER.accent, `${ITEM.spawnY - ITEM.big / 2}`)
check('o carro cabe inteiro na tela',
    CAR.y + CAR_H / 2 < H, `${CAR.y + CAR_H / 2}`)
check('o item alcança o carro dentro da tela',
    TOUCH_Y > HEADER.h + HEADER.accent && TOUCH_Y < CAR.y, `${TOUCH_Y}`)
check('a pista de reação não fica curta demais', TRAVEL >= 240, `${TRAVEL}px`)
check('item que passou ainda está visível',
    CAR.y + 10 + ITEM.big / 2 <= H, `${CAR.y + 10 + ITEM.big / 2}`)
check('plaquinha do copiloto fica na grama, fora da pista',
    COPILOT.x + COPILOT.w / 2 <= ROAD.x - ROAD.shoulder,
    `${COPILOT.x + COPILOT.w / 2}`)
check('plaquinha do copiloto cabe na tela',
    COPILOT.x - COPILOT.w / 2 >= 0 && COPILOT.y + COPILOT.h / 2 <= H)
for (const lanes of [2, 3]) {
    check(`faixa de ${lanes} é alvo confortável no celular`, laneWidth(lanes) >= 180,
        `${laneWidth(lanes)}px`)
}
check('álbum de 8 peças cabe na largura',
    7 * ALBUM.gap + ALBUM.size <= W - 80, `${7 * ALBUM.gap + ALBUM.size}`)
check('estrelas do álbum cabem na tela', ALBUM.y + 106 + 34 <= H)
check('álbum não bate no header', ALBUM.titleY - 24 > HEADER.h + HEADER.accent)

// ── 7. fonte mínima na área jogável ──────────────────────────────────────
for (const [name, value] of Object.entries(theme.SIZE)) {
    check(`fonte ${name} tem pelo menos 17px`, parseInt(value, 10) >= 17, value)
}

// ── 8. tutorial ──────────────────────────────────────────────────────────
const scene = readFileSync(`${GAME}/scenes/GameScene.ts`, 'utf8')
const stepStart = scene.indexOf('private tutorialSteps()')
const stepBlock = scene.slice(stepStart, scene.indexOf('private runTutorial(', stepStart))
const steps = [...stepBlock.matchAll(/'([^'\r\n]{14,})'/g)].map(m => m[1])
check('o tutorial tem de 3 a 6 falas', steps.length >= 3 && steps.length <= 6, `${steps.length}`)
check('o tutorial fala das duas regras',
    steps.some(s => s.includes('NÃO')) && steps.some(s => s.includes('combina')),
    steps.join(' | '))
for (const step of steps) {
    check(`passo do tutorial cabe (${step})`, step.length <= 80, `${step.length}`)
}
const pointers = [...scene.matchAll(/pointer: \{[\s\S]*?\}/g)].map(m => m[0])
for (const pointer of pointers) {
    check('todo ponteiro do tutorial é TOQUE, não arrasto', pointer.includes('tap: true'))
}

// ── veredito ─────────────────────────────────────────────────────────────
if (failures.length) {
    console.error(`\n${failures.length} problema(s):\n`)
    failures.forEach(f => console.error(`  ✗ ${f}`))
    process.exit(1)
}
console.log('check-corrida: tudo certo.')
