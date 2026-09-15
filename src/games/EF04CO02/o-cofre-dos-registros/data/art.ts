/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS EM VEZ DE SUPOSTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu a cápsula em 1024 × 512 e as criaturas em 768 × 256.
 * Vieram 800 × 300 e 1200 × 400. Os números abaixo são os da folha entregue,
 * medidos pelo canal alfa, e é por eles que o código se guia.
 */

export const SHEET = {
    room: 'vault-room',
    safe: 'vault-safe',
    life: 'vault-life',
}

/* ───────────────────────────── a cápsula-cofre ─────────────────────────── */

export const SAFE_SHEET = { frameWidth: 400, frameHeight: 300 }

export const SAFE_FRAME = { closed: 0, open: 1 } as const

/**
 * ── A ÂNCORA É A BASE, NÃO O CENTRO DA CAIXA ─────────────────────────────
 *
 * As duas caixas alfa medidas são parecidas, mas não iguais:
 *
 *     f0 fechada  x=45 y=1 w=322 h=297   base 298
 *     f1 aberta   x=32 y=1 w=346 h=297   base 298
 *
 * O que muda em f1 é a PORTA girando para fora — a cápsula em si não anda. As
 * duas bases batem em 298, que foi o que o prompt pediu e o desenho cumpriu.
 * Ancorando pela base, a cápsula continua plantada no balcão no instante em
 * que a porta abre; ancorando pelo centro de cada caixa, ela daria um pulo de
 * 6 px para cima e para o lado exatamente no quadro da abertura.
 */
export const SAFE_BODY = { x: 45, y: 1, w: 322, h: 297, base: 298 }

export const safeOrigin = () => ({ x: 0.5, y: SAFE_BODY.base / SAFE_SHEET.frameHeight })

/** Escala para o CORPO ocupar a largura pedida. */
export const safeScale = (width: number) => width / SAFE_BODY.w

/**
 * O centro da porta redonda, na célula, para os três ferrolhos caírem sobre
 * ela. Os ferrolhos não estão no PNG: o §5 do TEXTURAS.md os deixou para o
 * código justamente porque abrem um por fase.
 */
export const SAFE_DOOR = { x: 202, y: 158, r: 96 }

/* ────────────────────────────── as criaturas ───────────────────────────── */

export const LIFE_SHEET = { frameWidth: 400, frameHeight: 400 }

export const LIFE_FRAME = { octopus: 0, fish: 1, crab: 2 } as const

/**
 * Aqui cada quadro é enquadrado pela SUA caixa, ao contrário da cápsula.
 *
 * São três animais diferentes, não três estados do mesmo objeto: o polvo é
 * alto, o caranguejo é largo e baixo. Centrar todos por uma âncora comum
 * deixaria o caranguejo boiando no alto do aro.
 */
export const LIFE_BOX = [
    { x: 28, y: 70, w: 338, h: 275 },
    { x: 29, y: 74, w: 332, h: 272 },
    { x: 17, y: 107, w: 368, h: 230 },
]

export const lifeOrigin = (frame: number) => {
    const b = LIFE_BOX[frame]
    return {
        x: (b.x + b.w / 2) / LIFE_SHEET.frameWidth,
        y: (b.y + b.h / 2) / LIFE_SHEET.frameHeight,
    }
}

/** Escala para o maior lado do desenho caber na medida pedida. */
export const lifeScale = (frame: number, span: number) => {
    const b = LIFE_BOX[frame]
    return span / Math.max(b.w, b.h)
}
