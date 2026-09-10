import type { FormatId } from '../types'

export const C = {
    ink: 0x21324a,
    inkSoft: 0x4a5f7a,
    white: 0xffffff,

    grass: 0x8dc63f,
    grassDark: 0x5a9224,
    leaf: 0x2f6b2a,

    wood: 0xb07a3f,
    woodDark: 0x7c4f24,

    panel: 0xfff7e8,
    panelDeep: 0xf0dcc0,
    stone: 0xb9c6d4,
    stoneDark: 0x7c8da0,

    ok: 0x35d07f,
    okDark: 0x1f8f56,
    warn: 0xf59e0b,
    warnDark: 0xb46b00,
    select: 0x38bdf8,
    selectDark: 0x0d7fb4,
    gold: 0xfacc15,
}

/**
 * As cores vêm da arte: a criatura roxa é som, a verde é imagem, a azul é
 * texto e a vermelha é vídeo. `creature` é a LINHA da folha 4 x 4 e `icon` é o
 * quadro de `formatos.png` — duas folhas, duas ordens, e por isso os dois
 * índices moram aqui e em nenhum outro lugar.
 */
export const FORMAT: Record<
    FormatId,
    { tint: number; deep: number; creature: number; icon: number; name: string }
> = {
    audio: { tint: 0xb69cf0, deep: 0x7b5fc4, creature: 0, icon: 0, name: 'som' },
    image: { tint: 0x9bdc8b, deep: 0x4f9c46, creature: 1, icon: 2, name: 'imagem' },
    text: { tint: 0x9fc9f2, deep: 0x4a86c4, creature: 2, icon: 1, name: 'texto' },
    video: { tint: 0xf2907f, deep: 0xc4523f, creature: 3, icon: 3, name: 'vídeo' },
}

/** A quinta linha da folha de criaturas: o arquivo disfarçado. */
export const NINJA_ROW = 4

/** Ordem das pistas na tela. Nunca muda dentro de um nível. */
export const LANE_ORDER: FormatId[] = ['audio', 'image', 'text', 'video']

/** Códigos de cor da grade de pixels e da tira de vídeo. */
export const PIXEL: Record<string, number> = {
    '.': 0xf3f6fa,
    b: 0x6cc6f0,
    g: 0x63c34d,
    k: 0x4a6b7c,
    y: 0xf7cf46,
    r: 0xe4645a,
    p: 0xf08bb4,
    o: 0xf29b3c,
    w: 0xffffff,
}

export const CSS = {
    ink: '#21324a',
    inkSoft: '#4a5f7a',
    white: '#ffffff',
    panel: '#fff7e8',
    warn: '#b46b00',
    ok: '#1f8f56',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}
