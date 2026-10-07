import type { FileDef, Format, LevelDef, PhaseDef, PieceDef, PieceType, Vec } from '../types'
import { formatOf, PIECE } from './files'
import { buildWorld, overlapX, pieceRect, rests, robotRect, samplePulls, top } from './flight'
import { FLOOR, MAP } from './layout'
import { PIXEL } from './theme'

export const POINTS_SCORE = 10
export const MAX_ROBOTS = 4
export const MAX_FILES = 6
export const MIN_AIM_SAMPLES = 10

export const guideKey = (level: number) => `ef03co05-robos-l${level}`

const music = (name: string, samples: number[]): FileDef => ({ name, payload: { samples } })
const photo = (name: string, pixels: string[]): FileDef => ({ name, payload: { pixels } })

const SONG = {
    festa: music('festa', [0.3, 0.7, 1, 0.55, 0.25, 0.8, 0.95, 0.5, 0.3, 0.75, 0.45, 0.2]),
    parabens: music('parabéns', [0.5, 0.5, 0.75, 0.5, 0.95, 0.85, 0.4, 0.5, 0.5, 0.75, 0.5, 1]),
    recreio: music('recreio', [0.2, 0.45, 0.7, 0.95, 0.7, 0.45, 0.2, 0.45, 0.7, 0.95, 0.6, 0.3]),
    ninar: music('ninar', [0.6, 0.4, 0.3, 0.4, 0.6, 0.75, 0.6, 0.4, 0.3, 0.25, 0.3, 0.4]),
    roda: music('roda', [0.9, 0.3, 0.9, 0.3, 0.6, 0.6, 0.9, 0.3, 0.9, 0.3, 0.6, 1]),
    banda: music('banda', [0.35, 0.9, 0.6, 1, 0.4, 0.85, 0.5, 0.95, 0.3, 0.8, 0.55, 0.7]),
}

const PIC = {
    gato: photo('gato', ['o......o', 'oo....oo', 'oooooooo', 'okooooko', 'oooppooo', 'oooooooo', '.oo..oo.', '........']),
    sol: photo('sol', ['y..yy..y', '.y.yy.y.', '..yyyy..', 'yyyooyyy', 'yyyooyyy', '..yyyy..', '.y.yy.y.', 'y..yy..y']),
    flor: photo('flor', ['..pppp..', '.ppyypp.', '.ppyypp.', '..pppp..', '...gg...', '.gggg...', '...gggg.', '...gg...']),
    peixe: photo('peixe', ['........', '..bbbb.b', '.bbbbbbb', 'bkbbbbb.', '.bbbbbbb', '..bbbb.b', '........', '........']),
    casa: photo('casa', ['...rr...', '..rrrr..', '.rrrrrr.', 'rrrrrrrr', '.cccccc.', '.cbccnc.', '.ccccnc.', '.ccccnc.']),
    sorvete: photo('sorvete', ['..pppp..', '.pppppp.', '.pwpppp.', '.pppppp.', '..nnnn..', '..nnnn..', '...nn...', '...nn...']),
}

const text = (word: string): FileDef => ({ name: word, payload: { chars: [...word] } })
const video = (name: string, frames: string[][]): FileDef => ({ name, payload: { frames } })

const WORD = {
    gato: text('GATO'),
    bolo: text('BOLO'),
    sol: text('SOL'),
    oi: text('OI'),
    pipa: text('PIPA'),
    lua: text('LUA'),
    bola: text('BOLA'),
    mar: text('MAR'),
}

const CLIP = {
    bola: video('bola quicando', [
        ['..rr..', '..rr..', '......', '......', '......', 'gggggg'],
        ['......', '......', '..rr..', '..rr..', '......', 'gggggg'],
        ['......', '......', '......', '......', '.rrrr.', 'gggggg'],
    ]),
    passaro: video('passarinho', [
        ['b....b', '.b..b.', '..bb..', '..bb..', '......', '......'],
        ['......', '......', 'bbbbbb', '..bb..', '......', '......'],
        ['......', '......', '..bb..', '.bbbb.', 'b....b', '......'],
    ]),
    peixe: video('peixe nadando', [
        ['......', '......', 'oo....', 'ooo...', 'oo....', '......'],
        ['......', '......', '..oo..', '..ooo.', '..oo..', '......'],
        ['......', '......', '....oo', '....oo', '....oo', '......'],
    ]),
    sol: video('sol nascendo', [
        ['......', '......', '......', '......', '.yyyy.', 'gggggg'],
        ['......', '......', '.yyyy.', '.yyyy.', '.yyyy.', 'gggggg'],
        ['..yy..', '.yyyy.', '.yyyy.', '.yyyy.', '..yy..', 'gggggg'],
    ]),
    flor: video('flor crescendo', [
        ['......', '......', '......', '......', '..g...', 'nnnnnn'],
        ['......', '......', '..p...', '..g...', '..g...', 'nnnnnn'],
        ['.ppp..', '.pyp..', '.ppp..', '..g...', '..g...', 'nnnnnn'],
    ]),
}

const DISGUISE = {
    page: { ...photo('foto de uma página', ['wwwwwwww', 'wkkkkkkw', 'wwwwwwww', 'wkkkkwkw', 'wwwwwwww', 'wkkwkkkw', 'wwwwwwww', 'wkkkkwww']), disguise: true },
    singing: {
        ...video('vídeo de alguém cantando', [
            ['....l.', '.cc.l.', 'cccc..', 'ckkc..', 'cccc..', '.pp...'],
            ['...l..', '.cc...', 'cccc.l', 'crrc..', 'cccc..', '.pp...'],
            ['.....l', '.cc..l', 'cccc..', 'ckkc..', 'cccc..', '.pp...'],
        ]),
        disguise: true,
    },
    musicWord: { ...text('MÚSICA'), disguise: true },
}

const tower = (x: number, types: PieceType[]): PieceDef[] => {
    let y = FLOOR
    return types.map(type => {
        const piece = { type, x, y }
        y -= PIECE[type].h
        return piece
    })
}

const bridge = (left: number, right: number, legs: PieceType[], deck: PieceType = 'plank'): PieceDef[] => {
    const a = tower(left, legs)
    const b = tower(right, legs)
    const y = Math.min(top(a[a.length - 1]), top(b[b.length - 1]))
    return [...a, ...b, { type: deck, x: (left + right) / 2, y }]
}

const feet = (pieces: PieceDef[], x: number): Vec => {
    const under = pieces.filter(p => Math.abs(p.x - x) < PIECE[p.type].w / 2)
    return { x, y: Math.min(...under.map(top)) }
}

const phase = (pieces: PieceDef[], robots: Partial<Record<Format, number>>, files: FileDef[]): PhaseDef => ({
    pieces,
    robots: Object.fromEntries(Object.entries(robots).map(([f, x]) => [f, feet(pieces, x as number)])),
    files,
})

const MAP_1A = [...tower(575, ['crate', 'crate', 'brick']), ...tower(730, ['stage']), ...bridge(990, 1150, ['pillar']), ...tower(1070, ['barrel'])]
const MAP_1B = [...tower(600, ['barrel', 'brick']), ...tower(820, ['block', 'block']), ...tower(1000, ['crate', 'crate', 'pipe']), ...tower(1180, ['stage', 'block', 'brick'])]
const MAP_1C = [...tower(600, ['brick', 'brick']), ...bridge(790, 970, ['barrel']), ...tower(1060, ['crate', 'crate']), ...tower(1185, ['stage', 'block', 'brick'])]

const MAP_2A = [...tower(520, ['crate', 'crate']), ...tower(630, ['block']), ...tower(820, ['stage']), ...bridge(960, 1070, ['pillar']), ...tower(1205, ['block', 'block', 'block', 'block'])]
const MAP_2B = [...tower(520, ['barrel']), ...tower(630, ['block', 'block']), ...tower(820, ['brick']), ...tower(1015, ['stage']), ...tower(1205, ['block', 'block', 'block'])]
const MAP_2C = [...tower(630, ['stage']), ...bridge(780, 880, ['barrel']), ...tower(1015, ['block', 'block']), ...tower(1205, ['block', 'block', 'block'])]
const MAP_3A = [...tower(520, ['crate', 'brick']), ...tower(630, ['barrel', 'block']), ...tower(820, ['brick']), ...tower(1015, ['block']), ...tower(1205, ['block', 'block', 'block', 'block'])]
const MAP_3B = [...tower(520, ['crate', 'crate']), ...tower(630, ['brick']), ...tower(820, ['block']), ...tower(1015, ['block', 'block', 'block']), ...tower(1205, ['block', 'block', 'block', 'block'])]
const MAP_3C = [...tower(630, ['stage']), ...tower(820, ['crate', 'crate', 'crate']), ...bridge(960, 1070, ['barrel']), ...tower(1205, ['block', 'block'])]

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Som e foto',
        message: 'Barrinhas de som são música. Pontinhos de cor em grade são foto!',
        robots: ['music', 'photo'],
        phases: [
            phase(MAP_1A, { music: 730, photo: 1070 }, [SONG.festa, PIC.gato, SONG.parabens, PIC.sol]),
            phase(MAP_1B, { photo: 820, music: 1180 }, [PIC.flor, SONG.recreio, SONG.ninar, PIC.peixe]),
            phase(MAP_1C, { music: 880, photo: 1185 }, [SONG.roda, PIC.casa, PIC.sorvete, SONG.banda]),
        ],
    },
    {
        level: 2,
        title: 'Quatro leitores',
        message: 'Letras em fila são texto. Quadros em fila são vídeo!',
        robots: ['music', 'photo', 'text', 'video'],
        phases: [
            phase(MAP_2A, { text: 630, video: 820, music: 1015, photo: 1205 }, [WORD.gato, CLIP.bola, SONG.festa, PIC.gato, WORD.sol]),
            phase(MAP_2B, { photo: 630, text: 820, video: 1015, music: 1205 }, [PIC.flor, CLIP.passaro, WORD.bolo, SONG.recreio, CLIP.peixe]),
            phase(MAP_2C, { video: 630, music: 830, photo: 1015, text: 1205 }, [SONG.parabens, WORD.pipa, CLIP.sol, PIC.peixe, WORD.lua]),
        ],
    },
    {
        level: 3,
        title: 'Disfarçados',
        message: 'O assunto engana, o arranjo dos dados decide o formato!',
        robots: ['music', 'photo', 'text', 'video'],
        phases: [
            phase(MAP_3A, { music: 630, video: 820, text: 1015, photo: 1205 }, [CLIP.flor, PIC.casa, DISGUISE.page, WORD.oi, SONG.roda, CLIP.bola]),
            phase(MAP_3B, { text: 630, photo: 820, music: 1015, video: 1205 }, [WORD.bola, SONG.ninar, DISGUISE.singing, PIC.sol, WORD.mar, SONG.banda]),
            phase(MAP_3C, { photo: 630, music: 820, video: 1015, text: 1205 }, [PIC.sorvete, CLIP.passaro, WORD.gato, DISGUISE.musicWord, SONG.festa, CLIP.peixe]),
        ],
    },
]

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.robots.length > MAX_ROBOTS) problems.push(`${tag}: ${level.robots.length} robôs`)
        let previous = ''
        level.phases.forEach((phase, p) => {
            const at = `${tag}/fase ${p + 1}`
            const placed = Object.keys(phase.robots) as Format[]
            if ([...placed].sort().join() !== [...level.robots].sort().join()) problems.push(`${at}: robôs diferentes do nível`)
            const rects = phase.pieces.map(pieceRect)
            phase.pieces.forEach((p, i) => {
                const r = rects[i]
                if (r.x - r.w / 2 < MAP.left || r.x + r.w / 2 > MAP.right) problems.push(`${at}: peça ${i} fora do mapa`)
                const under = phase.pieces.filter((q, k) => k !== i && rests(p, q))
                const bearing = under.reduce((sum, q) => sum + overlapX(r, pieceRect(q)), 0)
                const straddled = under.some(q => q.x < p.x) && under.some(q => q.x > p.x)
                const held = p.y === FLOOR || bearing >= r.w * 0.4 || straddled
                if (!held) problems.push(`${at}: peça ${i} (${p.type}) solta no ar`)
                rects.forEach((o, k) => {
                    if (k > i && overlapX(r, o) > 1 && Math.min(r.y + r.h / 2, o.y + o.h / 2) - Math.max(r.y - r.h / 2, o.y - o.h / 2) > 1)
                        problems.push(`${at}: peças ${i} e ${k} se sobrepõem`)
                })
            })
            placed.forEach(f => {
                const spot = phase.robots[f] as Vec
                const body = robotRect(spot)
                const base = phase.pieces.find(p => Math.abs(top(p) - spot.y) <= 2 && Math.abs(p.x - spot.x) <= PIECE[p.type].w / 2)
                if (!base) problems.push(`${at}: robô ${f} sem apoio`)
                if (body.y - body.h / 2 < MAP.robotTop) problems.push(`${at}: robô ${f} alto demais`)
                rects.forEach((o, k) => {
                    if (overlapX(body, o) > 6 && Math.min(body.y + body.h / 2, o.y + o.h / 2) - Math.max(body.y - body.h / 2, o.y - o.h / 2) > 2)
                        problems.push(`${at}: robô ${f} atravessa a peça ${k}`)
                })
            })
            const xs = placed.map(f => (phase.robots[f] as Vec).x).sort((a, b) => a - b)
            xs.forEach((x, i) => {
                if (i && x - xs[i - 1] < MAP.robotGap) problems.push(`${at}: robôs perto demais`)
            })
            const layout = JSON.stringify(phase.pieces)
            if (layout === previous) problems.push(`${at}: mesmo mapa da fase anterior`)
            previous = layout

            if (phase.files.length > MAX_FILES) problems.push(`${at}: ${phase.files.length} arquivos`)
            const formats = phase.files.map(f => formatOf(f.payload))
            formats.forEach((f, i) => {
                if (!level.robots.includes(f)) problems.push(`${at}/${phase.files[i].name}: sem robô de ${f}`)
                if (i >= 2 && formats[i - 1] === f && formats[i - 2] === f) problems.push(`${at}: três ${f} seguidos`)
            })
            phase.files.forEach((file, i) => {
                const p = file.payload
                if (file.disguise && (level.level < 3 || i === 0)) problems.push(`${at}/${file.name}: disfarce fora do lugar`)
                if ('pixels' in p && (p.pixels.length !== 8 || p.pixels.some(r => r.length !== 8 || [...r].some(ch => ch !== '.' && !PIXEL[ch]))))
                    problems.push(`${at}/${file.name}: grade não é 8 × 8 da paleta`)
                if ('samples' in p && (p.samples.length !== 12 || p.samples.some(s => s <= 0 || s > 1))) problems.push(`${at}/${file.name}: amostras inválidas`)
                if ('chars' in p && p.chars.length > 6) problems.push(`${at}/${file.name}: texto longo`)
                if ('frames' in p && (p.frames.length !== 3 || p.frames.some(f => f.length !== 6 || f.some(r => r.length !== 6 || [...r].some(ch => ch !== '.' && !PIXEL[ch])))))
                    problems.push(`${at}/${file.name}: quadros não são 3 × (6 × 6) da paleta`)
            })
            if (phase.files.filter(f => f.disguise).length > 1) problems.push(`${at}: mais de um disfarce`)

            const hits = samplePulls(buildWorld(phase))
            placed.forEach(f => {
                const n = hits.filter(h => h.hit.kind === 'robot' && h.hit.format === f).length
                if (n < MIN_AIM_SAMPLES) problems.push(`${at}: robô ${f} quase inalcançável (${n} puxões)`)
            })
        })
    })
    return problems
}

if (import.meta.env?.DEV) {
    const problems = validateLevels(LEVELS)
    if (problems.length) console.error('[robos-famintos]', problems)
}
