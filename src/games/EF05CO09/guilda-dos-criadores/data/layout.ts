export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    mural: 10,
    tray: 20,
    art: 40,
    plaque: 50,
    piece: 62,
    /* A peça que VOA da bandeja até a plaquinha. A bandeja mora em 20 e a
       plaquinha em 50, então sem uma camada própria o carimbo faz o arco por
       TRÁS do painel — que foi exatamente o que apareceu jogando. */
    fly: 66,
    artist: 70,
    fx: 80,
    hud: 100,
    sign: 120,
    frame: 140,
} as const

export const HUD = {
    h: 82,
    accent: 3,
    levelX: 24,
    levelY: 30,
    dotsY: 60,
    dotR: 7,
    dotGap: 22,
    livesX: 1084,
    livesY: 41,
    helpCx: 1232,
    helpCy: 41,
    helpR: 27,
    /** O vão livre do meio. O enunciado tem largura própria, nunca "a tela". */
    midX: 300,
    midW: 740,
} as const

/**
 * O FUNDO MANDA NA GRADE.
 *
 * `bg-salao.png` é 1672 × 941 e cobre a tela inteira, então a escala é
 * 1280 / 1672 = 0,7656. Medido com `GetPixel` na coluna x 900:
 *
 *   - a parede vai até bg y 696  → tela **533**
 *   - o tampo da mesa vai de bg y 700 a 792 → tela **536 a 606**
 *   - abaixo de tela 609 já é o saiote e as pernas
 *
 * Por isso a obra fica ACIMA de 533 (encostada na parede), a plaquinha pousa em
 * cima do tampo, e a bandeja é desenhada como uma prateleira de madeira sobre o
 * saiote — com as cores amostradas do próprio PNG, senão ela flutua na frente
 * da mesa em vez de pertencer a ela.
 */
export const SCENE = {
    tableTop: 536,
    tableFront: 609,
} as const

/** Os vãos guardam a proporção da célula de `obras.png`: 512 / 352. */
export const RATIO = 512 / 352

/**
 * O ORÇAMENTO VERTICAL, QUE É O QUE MANDA NESTA TELA.
 *
 * Segunda passada (18/09/2026), depois de o dono do projeto pedir para
 * ajustar o enquadramento: o mural estava colado no cabeçalho e lia como
 * barra de interface, e a obra quase encostava nele.
 *
 * A folga saiu de três cortes, e NENHUM deles foi na obra — ela é a
 * superfície de leitura do jogo e encolher o verso seria pagar no lugar
 * errado:
 *
 *   - a plaquinha dourada do vão virou parte da MOLDURA dele, em vez de um
 *     objeto separado logo abaixo;
 *   - a plaquinha da mesa perdeu 4 px;
 *   - a prateleira da bandeja perdeu 22 px e a peça, 10.
 *
 * O que se ganhou foram os 22 px de parede VISÍVEL entre o cabeçalho e o
 * mural — é isso que faz o mural pousar numa parede em vez de pender da
 * barra — e os 20 px entre o mural e a obra.
 *
 *   parede  85 – 107
 *   mural 107 – 242   (moldura + plaquinha dourada, um objeto só)
 *   obra  262 – 564
 *   plaquinha da mesa 572 – 624
 *   bandeja 630 – 720
 *
 * Os três vãos também se espalharam: de 348–932 para 323–957. O mural puxa
 * o olho pela largura da parede, e a tela deixa de ser uma coluna no meio.
 */
export const MURAL = {
    cy: 162,
    w: 144,
    h: 99,
    cxs: [400, 640, 880],
    radius: 7,
    /** A moldura branca em volta da figura. */
    frame: 5,
    /** O centro da plaquinha dourada, medido do centro da figura. */
    plaqueDY: 68,
    plaqueH: 24,
} as const

export const ART = {
    cx: 640,
    cy: 413,
    w: 416,
    h: 286,
    radius: 10,
    /** A moldura que o `Graphics` desenha em volta do PNG. */
    frame: 8,
} as const

/**
 * O VERSO, EM DOIS CAMPOS COM NOME.
 *
 * Primeira versão: o © de 62 px sozinho no canto, a legenda dele encostada na
 * margem do cartão (e não no símbolo), e a marca de 94 px do outro lado, maior
 * que o selo e sem nada dizendo o que era. O dono do projeto reprovou — *"a
 * trás da plaquinha está mt mal organizado, com a logo de copyright (©) está
 * grande"* —, e ele tem razão: o verso é a ÚNICA superfície de leitura do
 * jogo, e ali estavam três coisas soltas, sem hierarquia, quase se tocando.
 *
 * Agora são dois campos lado a lado, cada um com um rótulo curto, separados
 * por um filete vertical:
 *
 *     A LICENÇA          │        DE QUEM É
 *         ©              │          [sol]
 *   pode usar dando      │
 *      o crédito         │
 *   ─────────────────────────────────────────
 *   "Tirei no quintal da vovó. Põe minha marca!"
 *
 * ── POR QUE ESTA ORDEM, E NÃO OUTRA ──────────────────────────────────────
 *
 * A leitura tem de ser a ordem da CÓPIA: a licença fica à esquerda porque o
 * carimbo mora à esquerda da plaquinha (`PLAQUE.stampDX`), e o dono à direita
 * porque a assinatura mora à direita (`PLAQUE.signDX`). O verso vira o mapa
 * da plaquinha, e copiar deixa de ter ordem para decorar.
 *
 * ── O © ENCOLHEU DE 62 PARA 40 ───────────────────────────────────────────
 *
 * Tamanho não é ênfase. O © grande roubava a página de tudo o mais sendo o
 * elemento que a criança MENOS entende — quem ensina é a legenda embaixo dele
 * e a fala da Lia no guia, não o corpo do glifo. Em 40 px ele fica do tamanho
 * do que é: um símbolo com uma legenda, dentro de um campo com nome.
 */
export const VERSO = {
    /** O rótulo de cada campo, em cima do conteúdo. */
    labelY: -126,
    labelSize: 18,
    /** O filete que separa os dois campos. */
    divisor: { x: 34, y1: -102, y2: -6 },
    licenca: {
        cx: -81,
        seloY: -76,
        seloSize: 40,
        /** A legenda mora EMBAIXO do selo e centrada com ele — não na margem. */
        notaY: -26,
        notaWrap: 200,
    },
    dono: {
        cx: 121,
        cy: -53,
        marcaSize: 72,
        letraSize: 46,
    },
    /** O filete que separa o que se copia do bilhete, que é só recado. */
    ruleY: 14,
    noteY: 30,
    noteWrap: 348,
    /** Três linhas de bilhete cabem; a quarta encosta na borda do cartão. */
    noteLines: 3,
} as const

export const PLAQUE = {
    cx: 640,
    cy: 598,
    w: 416,
    h: 52,
    radius: 10,
    /** Onde o carimbo pousa, e onde a assinatura começa. */
    stampDX: -152,
    signDX: 24,
} as const
export const SIGN_Y = 158

/**
 * SEIS PEÇAS, E O NÚMERO NÃO É ESTÉTICO.
 *
 * 147 × 0,30 = 44 px reais no celular de 390, que é o alvo mínimo de dedo.
 * Seis cabem em 962 px (6 × 147 + 5 × 16); oito só caberiam encolhendo a peça
 * abaixo desse piso.
 */
export const TRAY = {
    y: 630,
    h: 90,
    pieceW: 147,
    pieceH: 82,
    pieceCy: 676,
    gap: 16,
    max: 6,
    radius: 12,
} as const

export function trayCx(index: number, count: number): number {
    const total = count * TRAY.pieceW + (count - 1) * TRAY.gap
    return (W - total) / 2 + TRAY.pieceW / 2 + index * (TRAY.pieceW + TRAY.gap)
}

export const ARTIST = {
    cx: 1090,
    /** Ele fica em pé SOBRE o tampo, que começa em 536. */
    baseY: 556,
    h: 286,
    /**
     * ATÉ ONDE ELE PODE ANDAR.
     *
     * A obra vai até 856 com a moldura, e ele mede 286 de largura — meia
     * largura é 143. Em `minX` 1004 sobra um vão de 5 px entre o ombro dele e
     * o canto da obra: perto o bastante para "ele está apontando AQUILO", e
     * longe o bastante para não tapar a coisa que ele está apontando.
     *
     * Para a direita ele para em 1128, antes de o ombro sair da tela.
     */
    minX: 200,
    maxX: 1128,
} as const

/**
 * OS POSTOS — OS LUGARES ONDE ELA PARA, E O QUE CADA UM QUER DIZER.
 *
 * *"o certo seria fazer a personagem (…) ficar se movendo pra diferentes
 * lados pra um tutorial mais dinâmico."* Andar 86 px era um passo lateral, não
 * uma travessia: os dois primeiros postos ficavam do mesmo lado da mesa.
 *
 * Agora são três, e o da ESQUERDA é o que faz a criança virar a cabeça — ela
 * atravessa a sala por trás da figura e reaparece do outro lado, no momento em
 * que o trabalho deixa de ser em cima (a figura) e passa a ser embaixo (a
 * plaquinha e a bandeja).
 *
 * `esquerda: 280` sai da mesma conta do `perto`: ela mede 286 de largura, meia
 * largura é 143, e a figura começa em 424 com a moldura — em 280 sobra um vão
 * de 1 px. A caixa de fotos do fundo fica em 132 e ela passa na frente, que é
 * o certo: a caixa é cenário pintado.
 */
export const POSTO = {
    /** Em pé ao lado da mesa, onde ela mora. */
    casa: ARTIST.cx,
    /** Colada na figura, para apontar o © e a marca. */
    perto: 1004,
    /** Do outro lado da sala, quando o trabalho é na plaquinha. */
    esquerda: 280,
} as const

export const BOX = { cx: 132, cy: 440 } as const

/**
 * `artistas.png` CHEGOU 1200 × 1200 — célula de 300, não os 256 do
 * `TEXTURAS.md`. Os números abaixo são a caixa alfa medida célula a célula.
 *
 * `originX` sai da caixa de CADA quadro porque o braço muda de lado entre os
 * estados e a cabeça não: sem isso a criança escorrega de lado ao agradecer.
 * `footPad` é `300 - base`, e com `originY = 1` ele desce já escalado.
 */
export const ARTIST_BOX = [
    { originX: 0.4833, footPad: 2 }, { originX: 0.5167, footPad: 3 },
    { originX: 0.5, footPad: 0 }, { originX: 0.5133, footPad: 0 },
    { originX: 0.4683, footPad: 1 }, { originX: 0.51, footPad: 0 },
    { originX: 0.4967, footPad: 0 }, { originX: 0.5133, footPad: 1 },
    { originX: 0.4617, footPad: 0 }, { originX: 0.53, footPad: 1 },
    { originX: 0.5233, footPad: 4 }, { originX: 0.51, footPad: 3 },
    { originX: 0.505, footPad: 2 }, { originX: 0.5017, footPad: 3 },
    { originX: 0.515, footPad: 3 }, { originX: 0.485, footPad: 3 },
] as const

/**
 * As marcas ancoram pelo CENTRO DA CÉLULA, nunca pela caixa alfa.
 *
 * As oito têm massas muito diferentes (o sol mede 219 px de largura, o raio
 * 136). Ancorar pelo alfa faria a mesma marca pousar num lugar no verso e em
 * outro na bandeja — e comparar as duas é o jogo inteiro.
 */
export const MARK_CELL = 256
