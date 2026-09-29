import type { FailId, Form, SceneId } from '../types'

export const BG = 'bg-bairro'
export const BALLOON = 'balao'
export const DEST = 'destinos'
export const PIECES = 'pecas'
export const MURAL = 'mural'
export const BALLOON_2 = 'balao-2'
export const EXTRAS = 'extras'
export const DEST_2 = 'destinos-2'
export const DEST_3 = 'destinos-3'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [BALLOON]: { frameWidth: 512, frameHeight: 512 },
    [DEST]: { frameWidth: 512, frameHeight: 512 },
    [PIECES]: { frameWidth: 320, frameHeight: 320 },
    [BALLOON_2]: { frameWidth: 512, frameHeight: 512 },
    [EXTRAS]: { frameWidth: 256, frameHeight: 256 },
    [DEST_2]: { frameWidth: 512, frameHeight: 512 },
    [DEST_3]: { frameWidth: 512, frameHeight: 512 },
}

export const BALLOON_CELL = {
    idle: 0,
    burn: 1,
    cheer: 2,
    blown: 3,
} as const

export const PIECE_CELL = {
    ring: 0,
    voice: 1,
    letter: 2,
    screen: 3,
    party: 4,
    pencil: 5,
    practice: 6,
    lock: 7,
    gust: 8,
    bird: 9,
    guideHand: 10,
    note: 11,
} as const

export const FORM_CELL: Record<Form, number> = {
    voice: PIECE_CELL.voice,
    letter: PIECE_CELL.letter,
    screen: PIECE_CELL.screen,
}

export const RING_HOLE = 171

export const BALLOON2_CELL = {
    talk: 0,
    tablet: 1,
} as const

export const EXTRA_CELL = {
    thought: 0,
    sun: 1,
    moon: 2,
    mailboxUp: 3,
    stampVoice: 4,
    stampLetter: 5,
    stampScreen: 6,
    grandmaFace: 7,
    awaySign: 8,
    friendFace: 9,
    birdFlap: 10,
} as const

export const STAMP_CELL: Record<Form, number> = {
    voice: EXTRA_CELL.stampVoice,
    letter: EXTRA_CELL.stampLetter,
    screen: EXTRA_CELL.stampScreen,
}

export interface Art2 {
    key: string
    frame: number
}

export interface SceneArt {
    wait: Art2
    happy: Art2
    fail: Partial<Record<FailId, Art2>>
}

const art = (key: string, frame: number): Art2 => ({ key, frame })

export const SCENE_ART: Record<SceneId, SceneArt> = {
    'friend-near': {
        wait: art(DEST, 0),
        happy: art(DEST, 3),
        fail: { 'friend-fail-drop': art(DEST, 6), 'friend-fail-letter': art(DEST_2, 3) },
    },
    'neighbor-away': {
        wait: art(DEST, 1),
        happy: art(DEST, 4),
        fail: { 'neighbor-fail-empty': art(DEST, 7) },
    },
    'neighbor-away-phone': {
        wait: art(DEST_2, 0),
        happy: art(DEST_2, 1),
        fail: { 'neighbor-fail-empty': art(DEST_2, 5), 'neighbor-fail-phone': art(DEST_2, 2) },
    },
    'grandma-far': {
        wait: art(DEST, 2),
        happy: art(DEST, 5),
        fail: { 'grandma-fail-far': art(DEST, 8), 'grandma-fail-letter': art(DEST_2, 4) },
    },
    'grandma-near': {
        wait: art(DEST_3, 0),
        happy: art(DEST_3, 1),
        fail: { 'grandma-near-fail-drop': art(DEST_3, 2), 'grandma-near-fail-letter': art(DEST_3, 3) },
    },
    'friend-far': {
        wait: art(DEST_3, 4),
        happy: art(DEST_3, 5),
        fail: { 'friend-far-fail-far': art(DEST_3, 6), 'friend-far-fail-letter': art(DEST_3, 7) },
    },
    'neighbor-asleep': {
        wait: art(DEST_3, 8),
        happy: art(DEST_3, 9),
        fail: { 'neighbor-asleep-fail-voice': art(DEST_3, 10), 'neighbor-asleep-fail-phone': art(DEST_3, 11) },
    },
}
