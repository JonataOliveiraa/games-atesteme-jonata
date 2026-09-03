export const W = 1280
export const H = 720

/**
 * O header diz o nível e a fase, como nos outros jogos do catálogo, e mostra o
 * cartão que está sendo carregado agora.
 */
export const HUD = {
    y: 14,
    h: 58,
    cy: 43,
    levelX: 24,
    levelW: 178,
    phaseX: 214,
    phaseW: 196,
    shieldX: 428,
    shieldSize: 62,
    shieldGap: 16,
    cardX: 688,
    cardW: 214,
    cardH: 66,
    livesX: 1096,
    helpX: 1222,
    helpR: 30,
}

/** O semáforo do caminho. Só ele decide se dá para correr. */
export const CUE = {
    cx: 640,
    cy: 122,
    w: 372,
    h: 60,
    r: 30,
    iconX: -128,
}

/**
 * A pracinha. O caminho é uma faixa de areia atravessando a tela, e as paradas
 * ficam em cima dela. O curioso mora atrás, na grama, e a lanterna dele varre
 * a faixa de areia — que é exatamente por onde a criança corre.
 */
export const PARK = {
    horizon: 424,
    pathTop: 470,
    pathBottom: 578,
    footY: 556,
}

/**
 * O guarda da pracinha. A lanterna dele é o obstáculo — ele não é.
 *
 * `handDX/handDY` são o deslocamento da lanterna dentro da textura, medidos do
 * centro dela: é de lá que o cone tem que nascer, senão a luz sai da barriga
 * do guarda.
 */
export const WATCHER = {
    x: 656,
    y: 322,
    size: 208,
    handDX: -52,
    handDY: -22,
}

/** Paradas do percurso. A de índice 0 é a entrada; as demais são esconderijos. */
export const STOPS = [186, 486, 786, 1086]

export const HIDEOUT = {
    w: 216,
    h: 128,
    /** Centro da moita na tela. */
    y: 502,
    hitW: 232,
    hitH: 186,
}

export const RUNNER = {
    size: 172,
    /** Centro do sprite. Os pés caem em PARK.footY. */
    y: 472,
}

/**
 * O portão substitui o percurso no fim da fase: duas pessoas grandes, o cofre
 * no meio e a criança na frente dele.
 */
/**
 * O portão.
 *
 * A leitura tem que caber numa olhada: EU tenho o cartão (embaixo, no meio),
 * ELES estão esperando (nos tapetes, dos dois lados), e o cofre é para onde o
 * cartão vai (atrás). Quem cuida tem escudo em cima da cabeça — não pendurado
 * ao lado, onde parecia enfeite.
 */
/**
 * O portão.
 *
 * TODO MUNDO PISA NO CHÃO. As pessoas ficam no caminho de areia com os pés em
 * `PARK.footY`, igual à criança; o cofre fica na grama logo atrás, com sombra
 * embaixo. Antes eles flutuavam no céu, e o cenário inteiro do percurso não
 * servia para nada.
 *
 * A leitura, de baixo para cima: o menino com o cartão → as duas pessoas
 * falando → o cofre esperando.
 */
export const GATE = {
    /** Cofre: na grama, atrás de todo mundo. */
    safeX: 640,
    safeY: 356,
    safeW: 156,
    safeH: 142,
    /** A sombra dele no chão, para não parecer pendurado. */
    safeShadowY: 432,

    /*
     * O cofre é textura: `cofre.png`, quatro quadros de 256 na horizontal, de
     * fechado (0) a escancarado (3). O corpo ocupa cerca de 186px dentro do
     * quadro — a escala se mede POR ELE, não pela borda do quadro, senão o
     * cofre encolhe pelo tanto de vazio que a arte tem em volta.
     */
    safeTexBody: 186,
    /**
     * O vão fica à ESQUERDA do centro, porque a porta gira para a direita. É
     * ali que o cartão entra; mirar no centro faria ele bater na porta.
     */
    slotDX: -26,
    slotDY: -4,

    personY: 438,
    personSize: 236,
    xs: [252, 1028],
    /** A sombra dos pés, exatamente na linha do chão. */
    matY: 556,
    matW: 236,

    hitW: 264,
    hitH: 300,
    badgeDY: -148,
    badgeSize: 72,
    /** O balão de fala, acima do escudo. */
    bubbleDY: -238,

    runnerY: 486,
    runnerSize: 152,
    cardY: 398,
    cardW: 88,
    cardH: 106,
}

export const TOAST = {
    cx: 640,
    y: 650,
    w: 640,
    h: 78,
    r: 26,
}

export const ALBUM = {
    cx: 640,
    cy: 372,
    w: 820,
    h: 330,
    r: 34,
    cardW: 210,
    cardH: 196,
    gap: 28,
}
