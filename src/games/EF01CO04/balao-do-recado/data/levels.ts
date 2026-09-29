import type { BirdDef, FailId, FlightDef, Form, LegDef, LevelDef, Point, RecipientId, Ring, SceneId } from '../types'
import { ARRIVAL_CAPTION, CAPTION_MAX_WORDS, FAIL_CAPTION, wordCount } from './captions'
import { RING_HOLE, SCENE_ART } from './files'
import { BALLOON, BIRD, RING, VOICE, faceOf, reachBox, voiceOrigin } from './layout'

export const RING_POINTS = 10
export const RETRY_POINTS = 5
export const CHOICE_POINTS = 10
export const SLOW_AFTER_STRIKES = 2
export const SLOW_FACTOR = 0.6
export const RING_OPENING = RING_HOLE * RING.scale
export const DELIVER_LEAD = 2
export const BIRD_SPEED = 60
export const BIRD_RING_GAP = 1.5
export const GUIDE_KEY = 'ef01co04-l1'
export const CHOICE_GUIDE_KEY = 'ef01co04-choice'

export const SCENE_RECIPIENT: Record<SceneId, RecipientId> = {
    'friend-near': 'friend',
    'neighbor-away': 'neighbor',
    'neighbor-away-phone': 'neighbor',
    'grandma-far': 'grandma',
    'grandma-near': 'grandma',
    'friend-far': 'friend',
    'neighbor-asleep': 'neighbor',
}

export const SCENE_FAILS: Record<SceneId, Partial<Record<Form, FailId>>> = {
    'friend-near': { screen: 'friend-fail-drop', letter: 'friend-fail-letter' },
    'neighbor-away': { voice: 'neighbor-fail-empty' },
    'neighbor-away-phone': { voice: 'neighbor-fail-empty', screen: 'neighbor-fail-phone' },
    'grandma-far': { voice: 'grandma-fail-far', letter: 'grandma-fail-letter' },
    'grandma-near': { screen: 'grandma-near-fail-drop', letter: 'grandma-near-fail-letter' },
    'friend-far': { voice: 'friend-far-fail-far', letter: 'friend-far-fail-letter' },
    'neighbor-asleep': { voice: 'neighbor-asleep-fail-voice', screen: 'neighbor-asleep-fail-phone' },
}

export const SCENE_FORM: Record<SceneId, Form> = {
    'friend-near': 'voice',
    'neighbor-away': 'letter',
    'neighbor-away-phone': 'letter',
    'grandma-far': 'screen',
    'grandma-near': 'voice',
    'friend-far': 'screen',
    'neighbor-asleep': 'letter',
}

export const FALLS_SHORT: FailId[] = ['grandma-fail-far', 'grandma-fail-letter', 'friend-far-fail-far', 'friend-far-fail-letter']

interface LevelRule {
    scenes: SceneId[]
    cards: number
    rings: number
    minSlack: number
    bird: 'none' | 'straight' | 'zigzag'
}

const RULES: LevelRule[] = [
    { scenes: ['friend-near', 'neighbor-away', 'grandma-far'], cards: 2, rings: 5, minSlack: 90, bird: 'none' },
    { scenes: ['friend-near', 'neighbor-away-phone', 'grandma-far'], cards: 3, rings: 6, minSlack: 90, bird: 'straight' },
    { scenes: ['grandma-near', 'friend-far', 'neighbor-asleep'], cards: 3, rings: 7, minSlack: 70, bird: 'zigzag' },
]

const FLIGHT_N1: FlightDef = {
    scroll: 150,
    lift: 200,
    sink: 110,
    liftAccel: 600,
    sinkAccel: 300,
    slack: 90,
    ceiling: 140,
    floor: 545,
    startY: 360,
}

const FLIGHT_N3: FlightDef = { ...FLIGHT_N1, slack: 70 }

const TIMES_N1 = [6, 10.5, 15, 19.5, 24]
const TIMES_N2 = [5, 9, 13, 17, 21, 25]
const TIMES_N3 = [4, 8, 12, 16, 20, 24, 28]
const ringsAt =
    (times: number[]) =>
    (...ys: number[]): Ring[] =>
        ys.map((y, i) => ({ t: times[i], y }))
const rings1 = ringsAt(TIMES_N1)
const rings2 = ringsAt(TIMES_N2)
const rings3 = ringsAt(TIMES_N3)

const straight = (t: number, y: number): BirdDef => ({ t, y, amp: 0, period: 1 })
const zigzag = (t: number, y: number): BirdDef => ({ t, y, amp: 60, period: 2.4 })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        flight: FLIGHT_N1,
        legs: [
            {
                recipient: 'friend',
                scene: 'friend-near',
                rings: rings1(340, 360, 330, 360, 340),
                windowT: 29,
                windowY: 330,
                choice: { right: 'voice', wrongs: [{ form: 'screen', fail: 'friend-fail-drop' }] },
                bird: null,
            },
            {
                recipient: 'neighbor',
                scene: 'neighbor-away',
                rings: rings1(300, 420, 300, 430, 320),
                windowT: 29,
                windowY: 330,
                choice: { right: 'letter', wrongs: [{ form: 'voice', fail: 'neighbor-fail-empty' }] },
                bird: null,
            },
            {
                recipient: 'grandma',
                scene: 'grandma-far',
                rings: rings1(360, 260, 470, 280, 460),
                windowT: 29,
                windowY: 330,
                choice: { right: 'screen', wrongs: [{ form: 'voice', fail: 'grandma-fail-far' }] },
                bird: null,
            },
        ],
    },
    {
        level: 2,
        flight: FLIGHT_N1,
        legs: [
            {
                recipient: 'friend',
                scene: 'friend-near',
                rings: rings2(340, 300, 360, 300, 380, 330),
                windowT: 29,
                windowY: 330,
                choice: {
                    right: 'voice',
                    wrongs: [
                        { form: 'screen', fail: 'friend-fail-drop' },
                        { form: 'letter', fail: 'friend-fail-letter' },
                    ],
                },
                bird: straight(15, 390),
            },
            {
                recipient: 'neighbor',
                scene: 'neighbor-away-phone',
                rings: rings2(300, 420, 300, 440, 320, 400),
                windowT: 29,
                windowY: 330,
                choice: {
                    right: 'letter',
                    wrongs: [
                        { form: 'voice', fail: 'neighbor-fail-empty' },
                        { form: 'screen', fail: 'neighbor-fail-phone' },
                    ],
                },
                bird: straight(15, 310),
            },
            {
                recipient: 'grandma',
                scene: 'grandma-far',
                rings: rings2(380, 260, 440, 280, 460, 300),
                windowT: 29,
                windowY: 330,
                choice: {
                    right: 'screen',
                    wrongs: [
                        { form: 'voice', fail: 'grandma-fail-far' },
                        { form: 'letter', fail: 'grandma-fail-letter' },
                    ],
                },
                bird: straight(15, 420),
            },
        ],
    },
    {
        level: 3,
        flight: FLIGHT_N3,
        legs: [
            {
                recipient: 'grandma',
                scene: 'grandma-near',
                rings: rings3(320, 420, 280, 440, 300, 460, 320),
                windowT: 32,
                windowY: 330,
                choice: {
                    right: 'voice',
                    wrongs: [
                        { form: 'screen', fail: 'grandma-near-fail-drop' },
                        { form: 'letter', fail: 'grandma-near-fail-letter' },
                    ],
                },
                bird: zigzag(14, 460),
            },
            {
                recipient: 'friend',
                scene: 'friend-far',
                rings: rings3(400, 260, 420, 270, 450, 290, 430),
                windowT: 32,
                windowY: 330,
                choice: {
                    right: 'screen',
                    wrongs: [
                        { form: 'voice', fail: 'friend-far-fail-far' },
                        { form: 'letter', fail: 'friend-far-fail-letter' },
                    ],
                },
                bird: zigzag(14, 250),
            },
            {
                recipient: 'neighbor',
                scene: 'neighbor-asleep',
                rings: rings3(280, 440, 300, 470, 290, 450, 330),
                windowT: 32,
                windowY: 330,
                choice: {
                    right: 'letter',
                    wrongs: [
                        { form: 'voice', fail: 'neighbor-asleep-fail-voice' },
                        { form: 'screen', fail: 'neighbor-asleep-fail-phone' },
                    ],
                },
                bird: zigzag(14, 280),
            },
        ],
    },
]

export const passes = (ring: Ring, balloonY: number, slack: number): boolean => Math.abs(balloonY - ring.y) <= slack

export function rewindTo(leg: LegDef, ringIndex: number, flight: FlightDef): Ring {
    if (ringIndex === 0) return { t: 0, y: flight.startY }
    const previous = leg.rings[ringIndex - 1]
    return { t: previous.t + 1, y: previous.y }
}

export const reachable = (a: Ring, b: Ring, flight: FlightDef): boolean =>
    Math.abs(b.y - a.y) <= (b.t - a.t - 1) * Math.min(flight.lift, flight.sink) * 0.6

export const birdClear = (): number => BIRD.hitRadius + BALLOON.hitR

export function birdAt(bird: BirdDef, t: number, flight: FlightDef): Point {
    const x = BALLOON.x + (bird.t - t) * (flight.scroll + BIRD_SPEED)
    const y = bird.y + bird.amp * Math.sin((2 * Math.PI * (t - bird.t)) / bird.period)
    return { x, y }
}

export function hitsBird(bird: BirdDef, t: number, balloonY: number, flight: FlightDef): boolean {
    const p = birdAt(bird, t, flight)
    return Math.hypot(p.x - BALLOON.x, p.y - balloonY) < birdClear()
}

export const choiceForms = (leg: LegDef): Form[] => [leg.choice.right, ...leg.choice.wrongs.map(w => w.form)]

export const failOf = (leg: LegDef, form: Form): FailId | null => leg.choice.wrongs.find(w => w.form === form)?.fail ?? null

export const shuffled = <T>(list: T[], random: () => number = Math.random): T[] => {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

function checkChoice(leg: LegDef, rule: LevelRule, where: string, problems: string[]) {
    const { choice, scene } = leg
    if (SCENE_RECIPIENT[scene] !== leg.recipient) problems.push(`${where}: cena ${scene} não é de ${leg.recipient}`)
    if (choice.right !== SCENE_FORM[scene]) problems.push(`${where}: ${scene} recebe por ${SCENE_FORM[scene]}, não ${choice.right}`)

    const forms = choiceForms(leg)
    if (forms.length !== rule.cards) problems.push(`${where}: ${forms.length} cartões, esperado ${rule.cards}`)
    if (new Set(forms).size !== forms.length) problems.push(`${where}: forma repetida nos cartões`)

    if (!ARRIVAL_CAPTION[scene]) problems.push(`${where}: sem frase de chegada`)
    else if (wordCount(ARRIVAL_CAPTION[scene]) > CAPTION_MAX_WORDS) problems.push(`${where}: frase de chegada longa`)

    choice.wrongs.forEach(({ form, fail }) => {
        if (form === choice.right) problems.push(`${where}: a errada é a certa`)
        if (SCENE_FAILS[scene][form] !== fail) problems.push(`${where}: ${form} em ${scene} não falha como ${fail}`)
        if (!SCENE_ART[scene].fail[fail]) problems.push(`${where}: ${fail} sem arte em ${scene}`)
        const text = FAIL_CAPTION[fail]
        if (!text) problems.push(`${where}: ${fail} sem frase`)
        else if (wordCount(text) > CAPTION_MAX_WORDS) problems.push(`${where}: frase de ${fail} longa`)
    })
}

function checkReach(leg: LegDef, where: string, problems: string[]) {
    const { choice, scene } = leg
    const mouth = voiceOrigin(leg.windowY)
    const face = faceOf(scene)
    const distance = Math.hypot(face.x - mouth.x, face.y - mouth.y)
    if (choice.right === 'voice' && distance > VOICE.radius - VOICE.margin) {
        problems.push(`${where}: ${scene} a ${Math.round(distance)} px do rosto, não fica dentro do alcance da voz`)
    }
    if (choice.right !== 'screen') return
    if (distance < VOICE.radius + VOICE.margin) {
        problems.push(`${where}: ${scene} a ${Math.round(distance)} px do rosto, não fica fora do alcance da voz`)
    }
    const box = reachBox(scene)
    const corners = [
        [box.x, box.y],
        [box.x + box.w, box.y],
        [box.x, box.y + box.h],
        [box.x + box.w, box.y + box.h],
    ]
    const nearest = Math.min(...corners.map(([x, y]) => Math.hypot(x - mouth.x, y - mouth.y)))
    if (nearest < VOICE.radius + VOICE.margin) {
        problems.push(`${where}: canto de ${scene} a ${Math.round(nearest)} px, o corpo entra no alcance da voz`)
    }
}

function checkBird(leg: LegDef, rule: LevelRule, flight: FlightDef, where: string, problems: string[]) {
    const { bird } = leg
    if (rule.bird === 'none') {
        if (bird) problems.push(`${where}: pássaro antes da hora`)
        return
    }
    if (!bird) {
        problems.push(`${where}: sem pássaro`)
        return
    }
    if (rule.bird === 'straight' && bird.amp !== 0) problems.push(`${where}: o pássaro do N2 voa reto`)
    if (rule.bird === 'zigzag' && bird.amp <= 0) problems.push(`${where}: o pássaro do N3 faz zigue-zague`)
    if (bird.period <= 0) problems.push(`${where}: período do pássaro`)

    const after = leg.rings.findIndex(ring => ring.t > bird.t)
    if (after <= 0) {
        problems.push(`${where}: o pássaro não fica entre dois anéis`)
        return
    }
    const a = leg.rings[after - 1]
    const b = leg.rings[after]
    if (bird.t - a.t < BIRD_RING_GAP || b.t - bird.t < BIRD_RING_GAP) problems.push(`${where}: pássaro colado num anel`)

    const clear = birdClear()
    const pathY = a.y + ((b.y - a.y) * (bird.t - a.t)) / (b.t - a.t)
    const offset = Math.abs(pathY - bird.y)
    const needed = Math.max(0, bird.amp + clear - offset)
    const room = (Math.min(bird.t - a.t, b.t - bird.t) - 0.5) * Math.min(flight.lift, flight.sink) * 0.6
    if (needed > room) problems.push(`${where}: não dá para desviar do pássaro (${Math.round(needed)} > ${Math.round(room)} px)`)

    const above = pathY < bird.y
    const edge = above ? bird.y - bird.amp - clear : bird.y + bird.amp + clear
    if (above ? edge < flight.ceiling : edge > flight.floor) problems.push(`${where}: sem corredor para passar pelo pássaro`)
}

function checkLeg(leg: LegDef, rule: LevelRule, flight: FlightDef, where: string, problems: string[]) {
    checkChoice(leg, rule, where, problems)

    if (leg.rings.length !== rule.rings) problems.push(`${where}: ${leg.rings.length} anéis, esperado ${rule.rings}`)
    let previous: Ring = { t: 0, y: flight.startY }
    leg.rings.forEach((ring, i) => {
        const tag = `${where}/anel ${i + 1}`
        if (ring.y < 240 || ring.y > 500) problems.push(`${tag}: y ${ring.y} fora de 240–500`)
        if (i > 0 && ring.t - previous.t < 4) problems.push(`${tag}: menos de 4 s do anterior`)
        if (!reachable(previous, ring, flight)) problems.push(`${tag}: inalcançável`)
        previous = ring
    })
    if (leg.windowT - previous.t < 4) problems.push(`${where}: janela a menos de 4 s do último anel`)
    if (leg.windowT < 28 || leg.windowT > 32) problems.push(`${where}: janela em t ${leg.windowT}, fora de 28–32`)
    if (leg.windowY < flight.ceiling || leg.windowY > flight.floor) problems.push(`${where}: janela fora da faixa de voo`)

    checkReach(leg, where, problems)
    checkBird(leg, rule, flight, where, problems)
}

function checkForms(level: LevelDef, tag: string, problems: string[]) {
    const roles = new Map<Form, Set<'right' | 'wrong'>>()
    const seen = new Map<Form, number>()
    level.legs.forEach(leg => {
        choiceForms(leg).forEach((form, i) => {
            const role = i === 0 ? 'right' : 'wrong'
            roles.set(form, (roles.get(form) ?? new Set<'right' | 'wrong'>()).add(role))
            seen.set(form, (seen.get(form) ?? 0) + 1)
        })
    })
    roles.forEach((set, form) => {
        if ((seen.get(form) ?? 0) > 1 && set.size === 1) problems.push(`${tag}: ${form} é sempre ${[...set][0]}`)
    })
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    if (levels.length !== RULES.length) problems.push(`${levels.length} níveis, esperado ${RULES.length}`)

    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        const rule = RULES[index]
        const { flight } = level
        if (level.level !== index + 1) problems.push(`nível ${level.level} fora de ordem`)
        if (!rule) return

        const scenes = level.legs.map(leg => leg.scene).join(',')
        if (scenes !== rule.scenes.join(',')) problems.push(`${tag}: cenas ${scenes}, esperado ${rule.scenes.join(',')}`)
        if (flight.slack < rule.minSlack) problems.push(`${tag}: folga ${flight.slack} < ${rule.minSlack}`)
        if (index > 0 && flight.slack > levels[index - 1].flight.slack) problems.push(`${tag}: folga maior que a do nível anterior`)
        if (RING_OPENING < 2 * flight.slack + 60) problems.push(`${tag}: abertura do anel pequena para a folga`)
        if (flight.ceiling >= 240 || flight.floor <= 500) problems.push(`${tag}: a faixa de voo não cobre os anéis`)

        const rights = level.legs.map(leg => leg.choice.right)
        if (new Set(rights).size !== rights.length) problems.push(`${tag}: forma certa repetida`)

        level.legs.forEach((leg, i) => checkLeg(leg, rule, flight, `${tag}/${i + 1}`, problems))
        checkForms(level, tag, problems)
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[balao-do-recado]', PROBLEMS)
