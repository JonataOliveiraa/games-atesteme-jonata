import type { Bather, BatherId, DogId, Slot, TraitId } from '../types'

export const TRAITS: TraitId[] = ['cap', 'hat', 'glasses', 'bucket', 'ring', 'ball', 'fins']

export const SLOT: Record<TraitId, Slot> = {
    cap: 'head',
    hat: 'head',
    glasses: 'eyes',
    bucket: 'hand',
    ring: 'hand',
    ball: 'hand',
    fins: 'feet',
}

const SKIN = { light: 0xffd9be, tan: 0xe8b48a, brown: 0xb7774c, dark: 0x8a5232 }
const HAIR = { brown: 0x7a4a2a, black: 0x2e2430, light: 0xb98a55, grey: 0xd6d3d8, white: 0xf4f2ee }
const SUIT = { orange: 0xff9f4a, lilac: 0xc4a8f0, teal: 0x5fc9c0, pink: 0xff9ec8, purple: 0x9a6ad8 }

export const BATHERS: Bather[] = [
    {
        id: 'leo',
        traits: ['cap', 'glasses', 'bucket'],
        look: { skin: SKIN.light, hair: HAIR.brown, hairStyle: 'short', suit: SUIT.orange, top: 'trunks', build: 'kid' },
    },
    {
        id: 'bia',
        traits: ['cap', 'ring', 'fins'],
        look: { skin: SKIN.dark, hair: HAIR.black, hairStyle: 'braids', suit: SUIT.lilac, top: 'suit', build: 'kid' },
    },
    {
        id: 'ze',
        traits: ['hat', 'glasses'],
        look: { skin: SKIN.tan, hair: HAIR.white, hairStyle: 'bald', suit: SUIT.teal, top: 'open', beard: HAIR.white, build: 'adult' },
    },
    {
        id: 'duda',
        traits: ['glasses', 'ball', 'fins'],
        look: { skin: SKIN.light, hair: HAIR.light, hairStyle: 'ponytail', suit: SUIT.pink, top: 'suit', build: 'kid' },
    },
    {
        id: 'rafa',
        traits: ['hat', 'bucket', 'fins'],
        look: { skin: SKIN.dark, hair: HAIR.black, hairStyle: 'kinky', suit: SUIT.purple, top: 'trunks', build: 'kid' },
    },
    {
        id: 'mari',
        traits: ['bucket'],
        look: { skin: SKIN.brown, hair: HAIR.black, hairStyle: 'curlyLong', suit: SUIT.teal, top: 'suit', build: 'adult' },
    },
    {
        id: 'beto',
        traits: ['cap', 'glasses', 'fins'],
        look: { skin: SKIN.light, hair: HAIR.black, hairStyle: 'short', suit: SUIT.lilac, top: 'tank', beard: HAIR.black, build: 'adult' },
    },
    {
        id: 'mei',
        traits: ['hat', 'glasses', 'ring'],
        look: { skin: SKIN.light, hair: HAIR.black, hairStyle: 'bangs', suit: SUIT.orange, top: 'suit', build: 'kid' },
    },
    {
        id: 'caio',
        traits: ['ball'],
        look: { skin: SKIN.tan, hair: HAIR.brown, hairStyle: 'curly', suit: SUIT.lilac, top: 'trunks', build: 'kid' },
    },
    {
        id: 'nena',
        traits: ['hat', 'ball', 'fins'],
        look: { skin: SKIN.dark, hair: HAIR.grey, hairStyle: 'bun', suit: SUIT.pink, top: 'suit', build: 'adult' },
    },
    {
        id: 'nico',
        traits: ['cap'],
        look: { skin: SKIN.light, hair: HAIR.black, hairStyle: 'spiky', suit: SUIT.teal, top: 'trunks', build: 'small' },
    },
    {
        id: 'tati',
        traits: ['glasses', 'ring', 'fins'],
        look: { skin: SKIN.dark, hair: HAIR.black, hairStyle: 'afro', suit: SUIT.purple, top: 'suit', build: 'adult' },
    },
]

export const BATHER: Record<BatherId, Bather> = Object.fromEntries(BATHERS.map(b => [b.id, b])) as Record<BatherId, Bather>
export const batherCell = (id: BatherId) => BATHERS.findIndex(b => b.id === id)

export const has = (id: BatherId, trait: TraitId) => BATHER[id].traits.includes(trait)

export const DOGS: DogId[] = ['pacoca', 'salsicha', 'floco']
export const DOG_NAME: Record<DogId, string> = { pacoca: 'Paçoca', salsicha: 'Salsicha', floco: 'Floco' }

/** Nina, a salva-vidas: desenhada com o mesmo pintor dos banhistas, sem nenhum traço-dado. */
export const NINA_LOOK = { skin: SKIN.brown, hair: HAIR.black, hairStyle: 'bun', suit: 0xff8a3d, top: 'suit', build: 'adult' } as const
