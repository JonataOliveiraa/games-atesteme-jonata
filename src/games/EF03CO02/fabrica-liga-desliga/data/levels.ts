import type { LevelDef, StepDef } from '../types'
import { RULES } from './rules'

export const guideKey = (level: number) => `__fabricaLigaDesligaGuide-l${level}`
export const POINTS = 10
export const SPARK_MS = 1000
export const WARN_MS = 1000
export const IDLE_HINT_MS = 2000
export const TEXT_MAX = 30
export const TRAY_CAP = 6

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Liga enquanto está aceso',
        message: 'A repetição continua ENQUANTO a condição vale, e para quando ela muda.',
        grace: 1200,
        speed: 120,
        spacing: 220,
        phases: [
            { id: 'n1-fornada-1', steps: [{ rule: 'ovenLit', lead: 2500, lit: 6000, out: 4000, quota: 6 }] },
            { id: 'n1-fornada-2', steps: [{ rule: 'ovenLit', lead: 2000, lit: 5600, out: 3500, quota: 6 }] },
        ],
    },
    {
        level: 2,
        title: 'Liga até encher',
        message: 'ATÉ é o mesmo laço: a esteira roda enquanto a bandeja ainda não encheu.',
        grace: 1000,
        speed: 120,
        spacing: 220,
        phases: [
            { id: 'n2-bandeja-1', steps: [{ rule: 'trayFull' }] },
            { id: 'n2-forno', steps: [{ rule: 'ovenLit', lead: 2000, lit: 4000, out: 4000, quota: 4 }] },
            { id: 'n2-bandeja-2', steps: [{ rule: 'trayFull' }] },
        ],
    },
    {
        level: 3,
        title: 'A regra muda',
        message: 'Leia a regra toda vez: ENQUANTO vale, repete; quando muda, para.',
        grace: 900,
        speed: 120,
        spacing: 220,
        phases: [
            {
                id: 'n3-trecho-1',
                steps: [{ rule: 'ovenLit', lead: 2000, lit: 4000, out: 3000, quota: 2 }, { rule: 'trayFull' }],
            },
            {
                id: 'n3-trecho-2',
                steps: [{ rule: 'whistle', whistleAt: 5000 }, { rule: 'ovenLit', lead: 1500, lit: 4000, out: 3000, quota: 2 }],
            },
        ],
    },
]

function checkStep(step: StepDef, level: LevelDef, where: string, problems: string[]) {
    const rule = RULES[step.rule]
    rule.text.forEach(part => {
        if (part.length > TEXT_MAX) problems.push(`${where}: a frase "${part}" não cabe na ficha`)
    })
    if (rule.watch === 'oven') {
        const { lead = 0, lit = 0, out = 0, quota = 0 } = step
        const cookieMs = (level.spacing / level.speed) * 1000
        if (lead < SPARK_MS + 500) problems.push(`${where}: a abertura não cabe a faísca`)
        if (lit < (level.level === 1 ? 4000 : 3000)) problems.push(`${where}: o forno fica aceso pouco tempo`)
        if (out < SPARK_MS + level.grace + 1000) problems.push(`${where}: o forno apagado não cabe folga e faísca`)
        const perLit = Math.floor(lit / cookieMs)
        if (quota < 1 || perLit * 2 < quota) problems.push(`${where}: a cota não fecha em 2 trechos acesos (${perLit} por trecho)`)
        if (quota > TRAY_CAP) problems.push(`${where}: a bandeja tem ${TRAY_CAP} lugares`)
    }
    if (rule.watch === 'whistle' && (step.whistleAt ?? 0) < 3000 + WARN_MS) problems.push(`${where}: o apito vem cedo demais`)
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.phases.length < 1 || level.phases.length > 5) problems.push(`${tag}: ${level.phases.length} fases`)
        const rules = level.phases.flatMap(phase => phase.steps.map(step => step.rule))

        level.phases.forEach(phase => {
            const where = `${tag}/${phase.id}`
            if (!phase.steps.length) problems.push(`${where}: fase sem trecho`)
            phase.steps.forEach((step, i) => checkStep(step, level, `${where}/${i + 1}`, problems))
            for (let i = 1; i < phase.steps.length; i++) {
                if (phase.steps[i].rule === phase.steps[i - 1].rule) problems.push(`${where}: a regra não muda no trecho ${i + 1}`)
            }
            if (level.level < 3 && phase.steps.length !== 1) problems.push(`${where}: só o N3 muda a regra no meio`)
        })

        if (level.level === 1 && rules.some(rule => rule !== 'ovenLit')) problems.push(`${tag}: o N1 é só ENQUANTO o forno`)
        if (level.level === 2) {
            if (!rules.includes('trayFull') || !rules.includes('ovenLit')) problems.push(`${tag}: o N2 alterna ATÉ e ENQUANTO`)
            if (rules.includes('whistle')) problems.push(`${tag}: o apito é do N3`)
            for (let i = 1; i < rules.length; i++) {
                if (rules[i] === rules[i - 1]) problems.push(`${tag}: duas fases seguidas com a mesma regra`)
            }
        }
        if (level.level === 3) {
            if (!rules.includes('whistle')) problems.push(`${tag}: o N3 tem o apito do chef`)
            if (!level.phases.some(phase => phase.steps.length > 1)) problems.push(`${tag}: a regra tem de mudar no meio`)
        }
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[fabrica-liga-desliga]', PROBLEMS)
