export const W = 1280
export const H = 720

export const DEPTH = {
    scenery: 0,
    /** A trajetória é pintada NO concreto, por baixo de tudo que se apoia nele. */
    trail: 5,
    mark: 8,
    /** O medalhão fica abaixo do skatista: o voo cruza na frente dele. */
    medal: 12,
    ghost: 16,
    skater: 20,
    featureFront: 24,
    panel: 60,
    card: 70,
    hud: 80,
    balloon: 100,
    fx: 120,
    overlay: 400,
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  DUAS FAIXAS — e o plano mora DENTRO do parque
 * ═══════════════════════════════════════════════════════════════════════
 *
 * | Faixa  | y         | No celular (× 0,30) |
 * | parque | 8 – 528   | skatista de 150 → 45 px, rodando em y 478 |
 * | paleta | 536 – 712 | carta de 190 → 57 px |
 *
 * **A faixa de quadradinhos do topo ACABOU.** Ela era o que fazia este jogo
 * parecer o Pulo Programado com outra pele: painel de slots em cima, cartas
 * embaixo, botão redondo no canto — a mesma silhueta de tela.
 *
 * No lugar dela, o plano virou uma LINHA TRAÇADA SOBRE O PARQUE: a trajetória
 * que o skatista vai fazer, desenhada por cima do concreto, com o ícone da
 * manobra pousado acima de cada marco. É literalmente "desenhar a linha", que
 * é o termo do skate — e o ganho não é só estético:
 *
 *  - o plano e o mundo passam a dividir UM espaço só, então "esta manobra ↔
 *    este pedaço do parque" deixa de ser uma correspondência que a criança
 *    precisa fazer de cabeça entre duas faixas distantes;
 *  - a trajetória é o PREVIEW real do que vai acontecer — ela sobe no ollie e
 *    escala na rampa, porque sai da mesma conta que anima o skatista
 *    (`data/moves.ts`);
 *  - o parque ganhou 120 px de altura, e com eles o voo ficou de verdade.
 */

export const HELP = { x: 1216, y: 48, r: 30 }

/**
 * As bolinhas de fase são o ÚNICO indicador de progresso da tela. Sem pílula
 * de "NÍVEL 1/3" e sem "FASE 1 DE 3" escrito: três bolinhas dizem a mesma
 * coisa sem uma palavra.
 */
export const PHASE_PIPS = { cx: 76, y: 48, gap: 30, r: 9 }

export const PARK = { top: 8, bottom: 528 }

/**
 * O MEDALHÃO da manobra: onde o ícone pousa, acima do marco, amarrado a ele
 * por um tracejado vertical. O skatista passa NA FRENTE dele — por isso o
 * medalhão fica numa profundidade abaixo da dele, e o voo pode cruzá-lo sem
 * que isso pareça defeito.
 */
export const MEDAL = { y: 172, size: 96 }

/**
 * A linha onde as rodas encostam — e ela é o DECK PINTADO, não um chão
 * desenhado por cima dele.
 *
 * O primeiro `bg-parque` veio com rampas e piso próprios, e por isso o jogo
 * desenhava o seu deck na frente. O fundo novo é uma pista limpa, então esse
 * deck saiu: duas superfícies de concreto encostando é exatamente a emenda
 * que o TEXTURAS.md manda evitar. Uma pista só, a que o desenho já trouxe.
 */
export const GROUND = { y: 478 }

/**
 * O FUNDO sobe 144 px para a base do muro pintado — medida em y 566 da arte
 * esticada para 1280 × 720 — cair em y 422, logo acima da linha do chão. Os
 * 56 px entre as duas é o que faz o skatista parecer NA FRENTE do muro, e
 * não colado nele.
 */
export const BG_OFFSET_Y = -144

/** O percurso ocupa a faixa entre a fita e a paleta, e NÃO rola. */
export const COURSE = { firstX: 260, lastX: 960 }

/**
 * As rodas do skatista ficam a 99,8 % da altura do quadro — medido no PNG,
 * não chutado. Por isso o centro dele mora a 49,8 % do tamanho acima do
 * chão: assim ele RODA no deck em vez de flutuar ou afundar.
 *
 * O quadro do tombo termina em 91,1 %, e por isso tem razão própria.
 */
export const SKATER = {
    size: 150,
    /**
     * COMEÇA DEPOIS DA RAMPA PINTADA. O fundo veio com um quarter-pipe em
     * cada borda; nascer em x 110 punha o skatista em cima do desenho dele e
     * a silhueta sumia. Daqui até 1160 o deck está limpo.
     */
    startX: 186,
    exitX: 1230,
    footRatio: 0.498,
    fallFootRatio: 0.411,
    /**
     * ═══════════════════════════════════════════════════════════════════
     *  A CONTA DO VOO — por que 130 e 142, e não 150 e 190
     * ═══════════════════════════════════════════════════════════════════
     *
     * Com o foco ligado o parque cresce 12 %, e foi aí que o ollie sumiu:
     * o skatista atravessava o teto da máscara e só o shape aparecia acima
     * do muro. O teto não é o topo da tela, é PARK.top ampliado.
     *
     * O topo do desenho fica a 3,6 % do quadro (medido no PNG), então o
     * ponto mais alto do sprite em mundo é
     *     GROUND.y − 0,962 × size − A
     * e na tela, com o chão ancorado,
     *     GROUND.y + zoom × (topo − GROUND.y) ≥ PARK.top + 12
     *
     * Com size 150, zoom 1,08, PARK.top 8 e o chão em 478 isso dá A ≤ 274 —
     * folga de sobra depois que a faixa da fita saiu do topo. Os números
     * abaixo ficam bem abaixo do teto, e mesmo assim: mexer em qualquer um
     * dos quatro obriga a refazer esta conta.
     */
    jumpH: 165,
    rampH: 195,
}

/**
 * Os quadros 3, 4 e 5 da folha (ar, meio giro, três quartos) foram medidos e
 * NÃO têm o mesmo centro: 50,2 % / 48,2 % / 52,2 % na horizontal. A diferença
 * é de 4 % da célula — 6 px na tela — e é o bastante para o giro tremer no
 * nível 2. A correção mora aqui, em px na escala de exibição.
 */
export const FRAME_NUDGE: Record<number, { dx: number; dy: number }> = {
    4: { dx: 3, dy: -3 },
    5: { dx: -3, dy: -5 },
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 *  OS OBSTÁCULOS — e por que estes números saíram do DESENHO
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Eles nasceram em `Graphics` porque a regra lê a geometria deles: o
 * `trickPath` pergunta a altura do lábio para animar a subida. Virando
 * textura, a pergunta continua a mesma — mudou quem responde.
 *
 * `box` é a CAIXA ALFA medida no PNG, em fração do quadro. Ela existe porque
 * o desenho não ocupa o quadro inteiro nem fica centrado nele: a rampa começa
 * a 6,5 % da esquerda e o corrimão só preenche da metade para baixo. Sem
 * medir, a peça flutuaria acima da pista ou afundaria nela.
 *
 * `w` e `h` são o tamanho do DESENHO na tela, e respeitam a proporção real de
 * cada peça — a caixa é 5,4 vezes mais larga que alta, e esticá-la para caber
 * num número redondo seria deformar a arte para salvar uma conta.
 */
export interface ObstacleArt {
    key: string
    frame: number
    w: number
    h: number
    box: { x0: number; x1: number; y0: number; y1: number }
}

export const OBSTACLE_ART: Record<string, ObstacleArt> = {
    rampa: {
        key: 'rampa-p', frame: 0, w: 232, h: 115,
        box: { x0: 0.065, x1: 0.886, y0: 0.012, y1: 0.997 },
    },
    /** Nível 2: é ela que dá os 3 de ar do `REPITA 3× GIRAR`. */
    mega: {
        key: 'rampa-g', frame: 0, w: 288, h: 180,
        box: { x0: 0.061, x1: 0.920, y0: 0.032, y1: 0.998 },
    },
    caixa: {
        key: 'outros-da-pista', frame: 0, w: 240, h: 45,
        box: { x0: 0.006, x1: 0.994, y0: 0.487, y1: 0.977 },
    },
    /** Nível 3: é ele que amanhece molhado ou seco. */
    corrimao: {
        key: 'outros-da-pista', frame: 1, w: 250, h: 54,
        box: { x0: 0.010, x1: 0.991, y0: 0.417, y1: 0.983 },
    },
}

/**
 * O que o `trickPath` consulta. Saem da arte, e não o contrário: a subida
 * termina exatamente no lábio desenhado.
 */
export const RAMP = { w: OBSTACLE_ART.rampa.w, h: OBSTACLE_ART.rampa.h }
export const LEDGE = { w: OBSTACLE_ART.caixa.w, h: OBSTACLE_ART.caixa.h }

export const PALETTE = { x: 16, y: 536, w: 1248, h: 176, r: 28 }

export const CARD = { w: 190, h: 128, cy: 624, xs: [250, 478, 706] }

export const GO = { x: 1046, y: 624, r: 78 }

export const BALLOON = { x: 640, y: 262, w: 520 }

export const REPLAY = { titleY: 268, cardY: 384, gap: 122, size: 104 }

/**
 * O FOCO da descida: o parque cresce 8 % e acompanha o skatista.
 *
 * **Não há vinheta.** A primeira versão escurecia as bordas para destacar a
 * descida, e o que ela destacava mesmo era a própria camada escura — a tela
 * apagava no momento em que a criança mais queria olhar. O zoom sozinho já
 * diz "agora assista", e diz sem tirar luz de nada.
 */
export const FOCUS = { zoom: 1.08, ms: 420 }
