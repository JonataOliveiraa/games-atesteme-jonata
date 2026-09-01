export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    scenery: 2,
    trail: 6,
    smallChest: 10,
    explorer: 20,
    chest: 30,
    /** A coluna fica ATRÁS de tudo: ela emoldura o par, não o cobre. */
    connector: 56,
    panel: 60,
    card: 70,
    hud: 80,
    legend: 90,
    balloon: 100,
    fx: 120,
    edge: 140,
    overlay: 400,
}

/**
 * O FUNDO SOBE 120 px.
 *
 * `bg-ilha.png` é 16:9 exato, então ele entra em 1280 × 720 sem deformar. Do
 * jeito que foi desenhado, a faixa de areia clara cai em y 330 — bem no meio
 * da área onde a criança joga. Subindo o desenho, a areia clara vira a trilha
 * em y 232 e todo o resto da tela fica sendo a areia molhada lisa, que é o
 * fundo certo para os painéis.
 *
 * A faixa que sobra embaixo é pintada com `sandDark`, a mesma cor do pé do
 * desenho — é emenda de cor chapada, e some.
 */
export const BG = { dy: -120, tail: 594 }

/** A ilha: mar, trilha e os três baús. Aqui não se joga, então ela é fina. */
/** O terceiro baú para em 940 para não encostar no painel da legenda (x 1000). */
export const TRAIL = { y: 232, chests: [300, 620, 940], baseY: 250 }

export const SMALL_CHEST = { w: 88 }

export const EXPLORER = { h: 132, startX: 96, exitX: 1210, baseY: 252 }

/**
 * O baú ativo fica à ESQUERDA das duas fileiras. Com quatro símbolos a
 * fileira mais larga começa em x 450, e a borda direita do baú é 364.
 */
export const CHEST = { x: 232, baseY: 512, w: 264 }

/**
 * A PISTA E A FECHADURA COMPARTILHAM PASSO E CENTRO.
 *
 * É a regra que o layout inteiro serve: o símbolo 2 da pista fica exatamente
 * em cima do encaixe 2, com qualquer quantidade de símbolos. A coluna é o
 * argumento do jogo — ela mostra que aquilo em cima e aquilo embaixo são a
 * mesma coisa dita de dois jeitos. Passo diferente aqui e o jogo perde o
 * argumento.
 */
export const PITCH = 160
export const ROW_CX = 760

export const CLUE = { cy: 316, size: 120 }
export const LOCK = { cy: 468, size: 140 }

/**
 * A FILEIRA DE QUATRO ANDA PARA A ESQUERDA E APERTA O PASSO.
 *
 * Com passo 160 e centro 760, quatro símbolos chegam a x 1083 e entram no
 * painel da legenda. O corredor livre vai do baú ativo (borda em 364) até o
 * painel (borda em 1022) — 658 px. Passo 150 e centro 695 fazem a fileira
 * caber ali inteira, e as duas fileiras continuam usando a MESMA conta, que é
 * o que mantém a pista em cima do encaixe.
 */
const wide = (n: number) => n >= 4
export const rowPitch = (n: number) => (wide(n) ? 150 : PITCH)
export const rowCenter = (n: number) => (wide(n) ? 695 : ROW_CX)
export const bandWidth = (n: number) => Math.min(LOCK.size + 26, rowPitch(n) - 8)

/** 160 px de carta dão ~48 px reais no celular. É o alvo principal do jogo. */
export const PALETTE = { cy: 634, size: 160, pitch: 190, cx: 500, panelTop: 548 }

export const KEY = { x: 1108, y: 634, r: 78 }

export const HUD = { h: 86 }
export const HELP = { x: 1216, y: 44, r: 30 }
export const LEGEND_BTN = { x: 1076, y: 44, w: 152, h: 54 }
/**
 * A legenda mora na FAIXA DA DIREITA, que é a única coluna livre: com quatro
 * símbolos a fileira da fechadura chega a x 1070, e com três para em 990. O
 * painel começa em 1000 e nunca encosta.
 */
export const LEGEND_PANEL = { cx: 1120, top: 106, w: 196, rowH: 68, pad: 26 }
export const LIVES = { x: 24, y: 44, size: 30 }

/** O x do item `i` numa fileira de `n` — a MESMA conta para a pista e para o encaixe. */
export const rowX = (i: number, n: number) =>
    rowCenter(n) + (i - (n - 1) / 2) * rowPitch(n)
