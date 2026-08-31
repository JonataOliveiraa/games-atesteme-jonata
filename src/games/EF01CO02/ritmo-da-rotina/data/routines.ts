import type {
    Cue, HitKind, LevelDef, PhaseDef, RoutineDef, Scenery, StepDef,
} from '../types'

const step = (id: string, label: string, texture: string): StepDef => ({ id, label, texture })

const S = {
    acordar: step('acordar', 'acordar', 'p-cama'),
    escovar: step('escovar', 'escovar os dentes', 'p-escovar-dente'),
    roupa: step('roupa', 'vestir a roupa', 'p-roupa-escola'),
    cafe: step('cafe', 'tomar café', 'p-cafe-da-manha'),
    escola: step('escola', 'ir para a escola', 'p-escola'),
    lavar: step('lavar', 'lavar as mãos', 'p-lava-mao'),
    pegar: step('pegar', 'pegar o pão', 'p-pega-pao'),
    manteiga: step('manteiga', 'passar manteiga', 'p-passando-manteiga'),
    comer: step('comer', 'comer o pão', 'p-comendo-pao'),
    guardar: step('guardar', 'guardar o prato', 'p-colocando-prato'),
}

/**
 * Distrator não é "coisa errada": é coisa que não faz parte DESTA rotina.
 * Sorvete, bola e televisão não são problema — só não são o próximo passo.
 */
const D = {
    sorvete: step('sorvete', 'tomar sorvete', 'p-sorvete'),
    futebol: step('futebol', 'jogar bola', 'p-futebol'),
    tv: step('tv', 'ver televisão', 'p-assiste-tv'),
    carrinho: step('carrinho', 'brincar de carrinho', 'p-brincando-de-carrinho'),
    voltar: step('voltar', 'voltar da escola', 'p-indo-pra-casa'),
}

export const HAPPY_TEXTURE = 'p-feliz'

const routine = (
    id: string, name: string, scenery: Scenery, steps: StepDef[],
): RoutineDef => ({ id, name, scenery, steps })

const R = {
    acordar3: routine('acordar3', 'Acordar', 'quarto', [S.acordar, S.escovar, S.cafe]),
    arrumar4: routine('arrumar4', 'Se arrumar', 'quarto', [S.acordar, S.escovar, S.roupa, S.cafe]),
    escola5: routine('escola5', 'Ir para a escola', 'quarto',
        [S.acordar, S.escovar, S.roupa, S.cafe, S.escola]),

    lanche3: routine('lanche3', 'Comer o pão', 'cozinha', [S.lavar, S.pegar, S.comer]),
    lanche4: routine('lanche4', 'Fazer o lanche', 'cozinha',
        [S.lavar, S.pegar, S.manteiga, S.comer]),
    lanche5: routine('lanche5', 'Hora do lanche', 'cozinha',
        [S.lavar, S.pegar, S.manteiga, S.comer, S.guardar]),
}

const phase = (
    r: RoutineDef,
    distractors: StepDef[],
    outOfOrder: number,
    beatsBetween: number,
    windowPx: number,
): PhaseDef => ({ routine: r, distractors, outOfOrder, beatsBetween, windowPx })

/**
 * Três níveis, TRÊS FASES cada. A fase é uma rotina inteira, e dentro do nível
 * ela CRESCE: três passos, depois quatro, depois cinco. A criança não repete a
 * mesma coisa três vezes — ela vê a rotina ganhar um passo novo de cada vez.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'De manhã',
        phases: [
            phase(R.acordar3, [], 0, 3, 132),
            phase(R.arrumar4, [], 0, 3, 132),
            phase(R.escola5, [], 0, 2.5, 120),
        ],
    },
    {
        level: 2,
        name: 'Na cozinha',
        phases: [
            phase(R.lanche3, [D.sorvete], 0, 3, 126),
            phase(R.lanche4, [D.tv, D.carrinho], 0, 2.5, 114),
            phase(R.lanche5, [D.sorvete, D.futebol], 0, 2.5, 114),
        ],
    },
    {
        level: 3,
        name: 'O dia todo',
        phases: [
            phase(R.arrumar4, [D.futebol], 1, 2.5, 112),
            phase(R.lanche5, [D.tv, D.voltar], 1, 2, 106),
            phase(R.escola5, [D.carrinho, D.sorvete], 2, 2, 106),
        ],
    },
]

export const BPM = 72
export const BEAT_MS = 60000 / BPM
/** A travessia dura sempre 4 tempos: a velocidade do caminho não muda. */
export const TRAVEL_BEATS = 4

export const cuesInPhase = (p: PhaseDef) =>
    p.routine.steps.length + p.distractors.length + p.outOfOrder

export const cuesInLevel = (level: LevelDef) =>
    level.phases.reduce((sum, p) => sum + cuesInPhase(p), 0)

export const TOTAL_CUES = LEVELS.reduce((sum, l) => sum + cuesInLevel(l), 0)

export const cuesBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, l) => sum + cuesInLevel(l), 0)

// ─────────────────────────────────────────────── a regra é um teste

/**
 * O veredito. `done` é quantos passos da rotina já foram marcados — é ele, e
 * não a figura, que decide a resposta certa.
 */
export const expectedHit = (cue: Cue, done: number): HitKind =>
    cue.routineIndex === done ? 'yes' : 'no'

export const stepAt = (p: PhaseDef, index: number): StepDef | null =>
    p.routine.steps[index] ?? null

// ─────────────────────────────────────────────── montagem da rodada

/**
 * A rodada é montada de uma vez, antes de começar: os passos entram na ordem,
 * e os distratores (e os passos fora de hora) são encaixados ENTRE eles, sem
 * nunca trocar a ordem dos passos de verdade.
 */
export function buildCues(p: PhaseDef, rng: () => number): Cue[] {
    const cues: Cue[] = p.routine.steps.map((s, i) => ({
        step: s,
        routineIndex: i,
        beat: 0,
    }))

    const extras: Cue[] = p.distractors.map(s => ({
        step: s,
        routineIndex: -1,
        beat: 0,
    }))

    for (let i = 0; i < p.outOfOrder; i++) {
        const from = Math.min(
            p.routine.steps.length - 1,
            2 + Math.floor(rng() * Math.max(1, p.routine.steps.length - 2)),
        )
        extras.push({ step: p.routine.steps[from], routineIndex: from, beat: 0 })
    }

    /*
     * Cada extra cai numa posição sorteada, mas nunca na primeira: a rodada
     * precisa começar com o passo 1 para a criança pegar o ritmo antes de
     * precisar recusar alguma coisa.
     */
    for (const extra of extras) {
        const at = 1 + Math.floor(rng() * cues.length)
        cues.splice(at, 0, extra)
    }

    return cues.map((cue, i) => ({ ...cue, beat: i * p.beatsBetween }))
}

// ─────────────────────────────────────────────── as frases

export const OK_YES = ['Isso!', 'Boa!', 'É esse mesmo!', 'Muito bem!']
export const OK_NO = ['Boa, esse não é agora!', 'Isso! Ele fica de fora.']

export function mistakeSentence(cue: Cue, next: StepDef | null, kind: HitKind): string {
    if (kind === 'yes') {
        return next ? `Agora é ${next.label}.` : 'A rotina já acabou!'
    }
    return `Espera! ${cue.step.label} é agora.`
}

export const PHASE_CHEER = [
    'Seu dia deu certo!',
    'Tudo na ordem certa!',
    'Que rotina caprichada!',
]

export const starsFor = (firstTry: number, total: number) => {
    const pct = total > 0 ? firstTry / total : 0
    return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
}
