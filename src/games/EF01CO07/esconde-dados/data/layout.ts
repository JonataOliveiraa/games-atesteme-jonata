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
    /** Largura MÍNIMA do chip: ele cresce até caber o rótulo mais comprido. */
    cardW: 214,
    cardH: 66,
    /** Onde o rótulo começa, a partir da borda esquerda (depois do ícone). */
    cardLabelDX: 74,
    /** Folga entre o fim do rótulo e a borda direita. */
    cardPadR: 20,
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

export interface WatcherSpot {
    x: number
    y: number
    handDX: number
    handDY: number
    /** De onde para onde a lanterna varre. O segundo curioso varre ao contrário. */
    aim: [number, number]
    /** O desenho olha para a esquerda; o da direita entra espelhado. */
    flip: boolean
}

/**
 * Onde os curiosos ficam.
 *
 * Com um só, ele fica no meio e varre a pracinha inteira. Com dois, eles se
 * afastam para os cantos e cada janela de luz nasce de um lado — é a diferença
 * que a criança precisa ver para entender que agora são dois.
 */
const WATCHER_SPOTS: Record<number, WatcherSpot[]> = {
    1: [{ x: 656, y: 322, handDX: -52, handDY: -22, aim: [140, 1140], flip: false }],
    2: [
        { x: 392, y: 330, handDX: -52, handDY: -22, aim: [140, 1140], flip: false },
        { x: 918, y: 316, handDX: 52, handDY: -22, aim: [1140, 140], flip: true },
    ],
}

export function watcherSpots(count: number): WatcherSpot[] {
    return WATCHER_SPOTS[count] ?? WATCHER_SPOTS[1]
}

/** Paradas do percurso. A de índice 0 é a entrada; as demais são esconderijos. */
export const STOPS = [186, 486, 786, 1086]

/**
 * O passo do percurso muda com o tanto de paradas.
 *
 * Com quatro esconderijos são CINCO moitas na mesma largura de pracinha, e o
 * passo de 300px não cabe. Elas se aproximam e encolhem juntas — o vão entre
 * duas moitas nunca pode sumir, senão o caminho vira uma cerca viva.
 */
const STOPS_BY_COUNT: Record<number, number[]> = {
    3: [186, 486, 786, 1086],
    4: [148, 384, 620, 856, 1092],
}

export function stopsFor(hideouts: number): number[] {
    return STOPS_BY_COUNT[hideouts] ?? STOPS
}

export const HIDEOUT = {
    w: 216,
    h: 128,
    /** Centro da moita na tela. */
    y: 502,
    hitW: 232,
    hitH: 186,
}

export interface BushSize {
    w: number
    h: number
    hitW: number
    hitH: number
}

const BUSH_BY_COUNT: Record<number, BushSize> = {
    3: { w: 216, h: 128, hitW: 232, hitH: 186 },
    4: { w: 190, h: 116, hitW: 208, hitH: 174 },
}

export function bushFor(hideouts: number): BushSize {
    return BUSH_BY_COUNT[hideouts] ?? BUSH_BY_COUNT[3]
}

/**
 * O avatar que para a criança no meio do caminho.
 *
 * Ele nasce na altura das moitas, À ESQUERDA de onde a criança parou: ela
 * chega à última moita (x 1092 com quatro esconderijos), e em x 1010 o avatar
 * nascia em cima dela. O botão de recusar fica embaixo, no meio — longe do
 * avatar, para ninguém tocar num querendo o outro.
 */
export const INTERCEPT = {
    x: 846,
    y: 424,
    size: 196,
    bubbleDY: -168,
    hitW: 220,
    hitH: 250,
    noW: 268,
    noH: 84,
    noY: 646,
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
 * falando. O cofre só cai no chão quando quem cuida vai guardar.
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
    /**
     * A ponta do rabicho da fala do pedido, logo acima da cabeça. O balão
     * cresce para cima dela e, com o botão, vai até ~y 110 — fica abaixo do
     * header e fora da faixa da pílula (x 454–826).
     */
    talkDY: -126,
    /** O balão curto de reação ("Deixa comigo!"), no mesmo lugar da fala. */
    bubbleDY: -200,
    /**
     * Onde fica o cartão na mão de quem pega, a partir do centro da pessoa:
     * na altura da cintura, do lado para onde ela vai (o cofre, ou a fuga), e
     * encolhido — inteiro, no meio do peito, ele tapava o rosto.
     */
    handDX: 52,
    handDY: 30,
    stolenScale: 0.55,
    /** Para onde o estranho corre: além da borda, do lado dele. */
    fleeX: 200,

    runnerY: 486,
    runnerSize: 152,
    /**
     * O cartão erguido ACIMA da cabeça, não na frente dela. O cabelo do menino
     * começa em y 412 no portão (medido no quadro); com o centro em 398 o
     * cartão ia até 451 e tapava o rosto. Em 346 a face dele termina em 399 —
     * e o flutuar só sobe, então nunca encosta.
     */
    cardY: 346,
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
