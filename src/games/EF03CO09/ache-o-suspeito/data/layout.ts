export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    board: 6,
    sign: 20,
    signFx: 26,
    aim: 34,
    controls: 36,
    trail: 40,
    ball: 44,
    dust: 48,
    rescue: 50,
    band: 60,
    fx: 200,
    hud: 500,
}

export const HUD = {
    h: 92,
    cy: 46,
    avatarX: 56,
    avatarR: 30,
    dotX: 122,
    dotGap: 40,
    dotR: 13,
    orderX: 640,
    orderW: 620,
    livesX: 1058,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PLACA PENDURA DO PIVÔ, E É O PIVÔ QUE FICA NO `container`
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A placa balança. Quem balança gira em torno do ponto onde os fios prendem,
 * não do próprio centro — então o container mora no PIVÔ (topo dos fios) e
 * todo o desenho acontece abaixo de (0, 0). Girar `root.angle` basta.
 *
 * Consequência que vale lembrar na hora de mirar: o centro da placa NÃO é
 * `root.y`. Ele é o pivô mais o corpo girado — `centerOf()` faz essa conta.
 */
export const SIGN = {
    pivotY: 106,
    cord: 58,
    h: 244,
    /** A moldura de madeira, que sobra para fora de `w`/`h` dos dois lados. */
    edge: 17,
    sway: 1.6,
}

/**
 * Largura e posições mudam com a quantidade.
 *
 * As contas saem do quadro da parede (214 a 1080, centro em 647), e não do
 * centro da tela: é nele que as placas moram, e três placas de 356 + moldura
 * não caberiam ali de jeito nenhum.
 */
export const SIGN_BY_COUNT: Record<number, { w: number; xs: number[] }> = {
    2: { w: 356, xs: [420, 860] },
    3: { w: 232, xs: [347, 647, 947] },
}

/**
 * O chão onde a placa derrubada bate.
 *
 * Deitada, a placa fica TÃO ALTA quanto era larga. Com o pouso lá embaixo ela
 * saía pela borda de baixo da tela e a criança via metade da queda — por isso
 * o chão é aqui, e não no rodapé da sala.
 */
export const GROUND = { y: 530 }

/** A bandeja de papéis: de onde a bolinha sai e para onde ela volta. */
export const LAUNCH = { x: 640, y: 596 }

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS CONTROLES: DUAS MÃOS, DUAS FUNÇÕES
 * ══════════════════════════════════════════════════════════════════════════
 *
 * As duas setas ficam JUNTAS à esquerda e o botão de arremesso, redondo e
 * maior, à direita. É a divisão do controle de videogame: o polegar esquerdo
 * move, o direito age. No celular deitado, cada polegar cai no seu canto sem a
 * mão atravessar a tela — e nada do que importa ler fica debaixo dos dedos.
 */
export const PREV = { x: 136, y: 642, r: 58 }
export const NEXT = { x: 272, y: 642, r: 58 }
export const FIRE = { x: 1118, y: 634, r: 82 }

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A MIRA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um retículo que a criança move pela parede. A bolinha voa até ele, e o que
 * estiver no caminho é o que ela acerta.
 *
 * Isto NÃO é o mesmo que escolher uma placa numa lista. A diferença aparece
 * quando as placas começarem a andar: com seleção, a resposta ficava presa à
 * peça e o movimento era enfeite; com mira, a criança aponta para um LUGAR e o
 * acerto depende de a placa estar lá quando a bolinha chegar.
 *
 * `y` acompanha o centro das placas, para a mira nascer na altura em que elas
 * vivem. O movimento vertical do nível 3 vai mexer neste valor.
 */
export const AIM = {
    y: SIGN.pivotY + SIGN.cord + SIGN.h / 2,
    /*
     * O curso cobre a LARGURA VISÍVEL, e não só o quadro da parede.
     *
     * No carrossel as placas passam por toda a tela. Com o curso parando em
     * 196 e 1084 havia placas à vista e fora de alcance, e a criança ficava
     * batendo na seta contra um limite invisível enquanto o alvo desfilava do
     * outro lado. A mira vive na altura das placas, bem acima dos botões, então
     * chegar perto das bordas não atrapalha ninguém.
     */
    minX: 130,
    maxX: 1150,
    /** Um toque anda isto; segurar passa a `speed` px por segundo. */
    step: 34,
    speed: 400,
    holdAfter: 260,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  COMO AS PLACAS SE MEXEM
 * ══════════════════════════════════════════════════════════════════════════
 *
 * `sway` é o vaivém do nível 2, e ele acontece em BLOCO: as três placas andam
 * juntas, mantendo a distância. Com 279 px de placa dentro de 866 px de quadro
 * sobram 14 px entre uma e outra — fases diferentes fariam uma entrar na
 * outra, e amplitude maior jogaria a das pontas em cima da janela pintada no
 * fundo.
 *
 * `carousel` atravessa: a placa anda sempre para o mesmo lado e, ao sair por
 * uma borda, reaparece pela outra. A volta inteira é `1280 + largura`, e as
 * placas nascem espaçadas por um terço disso — assim nunca some tudo da tela
 * ao mesmo tempo.
 *
 * ── O PERÍODO DO VAIVÉM É LONGO POR JUSTIÇA, NÃO POR ESTILO ──────────────
 *
 * Entre o arremesso e o impacto passam cerca de 0,58 s, e nesse tempo a parede
 * inteira anda. Se a placa derivar mais do que o VÃO entre duas placas, uma
 * criança que mirou na borda da suspeita acerta a vizinha — e perde uma vida
 * por um erro que não é de leitura.
 *
 * A conta que mantém isso seguro, e que precisa ser refeita se algum destes
 * números mudar:
 *
 *     deriva = 2·π·swayAmp / (swayMs/1000) · 0,58  ≈  26 px
 *     vão    = espaçamento (300) − placa com moldura (266)  =  34 px
 *
 * No carrossel o mesmo risco não existe: lá as placas ficam a 520 px uma da
 * outra, e a deriva de ~53 px não chega nem perto da vizinha.
 */
export const MOTION = {
    swayAmp: 58,
    swayMs: 8000,
    carouselSpeed: 92,
    coveredSpeed: 78,
}

export const BAND = { cx: 640, cy: 492, w: 900, h: 80 }

export const BIN = { x: 1118, y: 452 }
