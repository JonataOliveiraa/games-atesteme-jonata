/**
 * Paleta do Estúdio de Produção Digital.
 *
 * ── UMA COR POR MÍDIA ────────────────────────────────────────────────────
 *
 *   ÂMBAR  = texto ilustrado   (papel)
 *   AZUL   = apresentação      (tela)
 *   ROSA   = vídeo             (filme)
 *
 * A cor não é enfeite: ela pinta a borda das peças, o rótulo da obra e a
 * abinha do HUD ao mesmo tempo. A criança sabe em qual editor está sem ler
 * uma palavra — e no Nível 3, onde ela escolhe a mídia, a tela inteira troca
 * de cor junto com a escolha.
 *
 * Verde é só "a banca aprovou". Laranja é só "reveja isto". Vermelho não
 * existe: reprovar aqui é parte do trabalho, não acidente.
 */
export const C = {
    // ── cenário ────────────────────────────────────────────────────────
    ink: 0x141a26,
    wall: 0x232d40,
    wallDark: 0x1a2231,
    wallLight: 0x35425c,
    edge: 0x4e5f80,

    /** As três mídias. */
    texto: 0xf59e0b,
    apresentacao: 0x38bdf8,
    video: 0xf472b6,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    /** Reveja isto. Laranja, nunca vermelho. */
    warn: 0xf97316,
    warnSoft: 0xffe2cc,

    // ── superfícies ────────────────────────────────────────────────────
    /** O papel de uma peça de texto. */
    paper: 0xfff6e8,
    paperEdge: 0xe3d8c4,
    /** A tela de um slide, e o quadro de um filme. */
    screen: 0x0f1622,
    slate: 0x28313f,
    panel: 0x1c2534,
    idle: 0x93a3bd,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.44,
    gloss: 0.16,
    dim: 0.45,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT no celular. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '24px',
    hudHint: '18px',
    hudTab: '15px',

    /** O título do passo, no alto do palco. */
    passoTitulo: '28px',
    passoNum: '17px',

    briefLabel: '17px',
    briefText: '22px',
    briefPublico: '20px',

    /** A barra do pedido, embaixo. */
    lembreteLabel: '14px',
    lembreteTexto: '17px',

    panelLabel: '17px',
    /** As peças, dentro da obra montada. */
    pecaTitulo: '25px',
    pecaTexto: '18px',
    pecaLegenda: '15px',

    /** As opções de um passo. */
    opcaoTexto: '21px',
    opcaoFoto: '17px',

    carimbo: '21px',

    cardName: '21px',
    cardResumo: '15px',
    cardRecursos: '14px',

    selo: '15px',
    veredito: '19px',

    button: '24px',
    help: '30px',
} as const

export const TYPE_MS = { briefing: 14 } as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Texto escuro sobre fundo claro, texto claro sobre fundo escuro. */
export function inkOn(color: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? C.slate : C.paper
}
