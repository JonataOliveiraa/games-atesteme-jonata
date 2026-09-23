export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    world: 10,
    platform: 20,
    bench: 24,
    item: 30,
    hazard: 34,
    shadow: 38,
    hero: 40,
    fx: 200,
    board: 300,
    plan: 310,
    zones: 420,
    pad: 440,
    lock: 500,
    hud: 600,
    overlay: 5000,
}

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 22,
    pillY: 18,
    pillW: 198,
    pillH: 46,
    livesX: 244,
    titleX: 636,
    titleY: 40,
    titleW: 540,
    /** Os quatro espaços da viagem, no canto direito do cabeçalho. */
    slotsRight: 1180,
    slotSize: 58,
    slotGap: 10,
    helpX: 1226,
    helpR: 28,
    helpHit: 116,
}

/**
 * O CORTE acontece no MESMO quintal da corrida: a criança separa a tarefa ali e
 * sai correndo dali. Não é uma página de interface — é um lugar, com mesa,
 * os dois painéis no gramado e o herói de pé esperando.
 *
 * São até OITO objetos numa fileira só (o bolo tem quatro): duas fileiras exigiriam uma estante, e a
 * fileira única deixa cada objeto com a mesma importância — que é o ponto, já
 * que a criança precisa comparar todos entre si.
 *
 * Cada objeto tem uma PLAQUINHA com o nome dele. Sem ela, a vareta e a estaca
 * da barraca são dois palitos: a criança não erra a
 * decomposição, erra a leitura do desenho, e as duas coisas não são a mesma.
 */
export const PLAN = {
    table: { cx: 540, top: 250, w: 1020 },
    /** O objeto se apoia no tampo: a base dele encosta em `table.top`. */
    shelf: { cy: 196, size: 102, pitch: 124 },
    /**
     * A plaquinha fica na beirada da mesa, como etiqueta de prateleira.
     *
     * A fonte é 17, não 14: em 14 os nomes ficavam apertados na tela pequena, e
     * eles existem justamente para serem LIDOS — é a etiqueta que separa a
     * vareta da estaca.
     */
    caption: { cy: 320, w: 114, h: 48, wrap: 106, font: 17 },
    /**
     * Os dois painéis do corte: borda interna pontilhada e um lugar por objeto
     * da metade (`tripSlots`), em fila.
     */
    panels: { cx: 520, cy: 566, w: 440, h: 168, gap: 56, slot: 96, slotGap: 12 },
    /**
     * A tarja com o nome do grupo, em cima do painel.
     *
     * O pé dela fica ATRÁS do painel, que é desenhado por cima — então o que
     * a criança vê é só a face clara, e é nela que o nome se centra. Antes o
     * texto se centrava na tarja inteira, metade escondida, e a base das
     * letras encostava na borda do card.
     *
     * `rise` é quanto o topo sobe acima do painel; `face` é a altura da face
     * clara, onde o texto mora.
     */
    tab: { rise: 50, h: 52, face: 34 },
    hero: { x: 1096, feet: 700 },
    go: { cx: 1096, cy: 424, w: 276, h: 100 },
}

/**
 * A ESCOLHA DA VIAGEM. Com os dois painéis cheios, o quintal escurece e eles
 * vêm para a frente, lado a lado, com uma pergunta em cima: qual das duas
 * metades você vai fazer primeiro?
 *
 * O corte já aconteceu; este é o momento de olhar as duas partes prontas e
 * escolher por onde começar — e escolher merece uma tela só dela.
 */
export const FOCUS = {
    cy: 402,
    gap: 92,
    scale: 1.14,
    titleY: 216,
    veil: 0.66,
}

/** O cartão que abre a tarefa: o que a gente vai fazer, com os oito objetos. */
export const INTRO = {
    cx: 640,
    cy: 350,
    w: 900,
    h: 316,
    icon: 88,
    iconPitch: 100,
}

/**
 * A FASE FINAL. A bancada no meio, os objetos trazidos numa fileira embaixo, e o
 * que já foi usado empilhado no tampo.
 */
export const FINALE = {
    bench: { cx: 640, feet: 520, width: 430 },
    /**
     * Os objetos ainda por usar. GRANDES e SEM legenda: aqui a criança já sabe o
     * que cada coisa é — ela mesma cortou a tarefa e foi buscar. O nome embaixo
     * de cada um só apertava o desenho e enchia a tela de texto.
     */
    tray: { cy: 604, size: 148, pitch: 152 },
    /** Os já usados, em duas fileiras sobre a bancada. */
    used: { size: 84, pitch: 108, rowGap: 96 },
    result: { size: 260 },
}

/**
 * O MUNDO. A câmera mostra 1280 de um mapa mais longo; o herói pisa em 540.
 *
 * O chão tem DUAS fileiras de 120: a de cima é o bloco com grama, a de baixo é
 * terra pura, cortada pela borda da tela. São 180 px de chão — antes eram 124,
 * com bloco de 96, e o mundo inteiro parecia encolhido: uma faixa fina de terra
 * embaixo de um céu enorme. Bloco grande e chão fundo é o que faz um jogo de
 * plataforma parecer um jogo de plataforma.
 */
export const WORLD = {
    groundY: 500,
    /**
     * O BLOCO É QUADRADO E NUNCA É ESTICADO.
     *
     * A versão anterior recortava a grama e espremia o recorte na fileira: 296
     * px de largura viravam 121, e 156 de altura viravam 121 também — quase 2,5
     * vezes de deformação horizontal. Ficava borrado e mal desenhado. Agora todo
     * bloco entra QUADRADO, no aspecto da arte, e a fileira de baixo simplesmente
     * passa da borda da tela.
     */
    tile: 180,
    /** O fundo anda mais devagar que a câmera. */
    parallax: 0.35,
    /** Quanto do mapa fica à esquerda do herói. */
    cameraLead: 480,
    fallY: 820,
    startX: 480,
}

/**
 * A FÍSICA, e de onde cada número vem.
 *
 * altura do pulo = JUMP² / (2 x GRAVITY) = 208 px   → passa a plataforma de 176
 * tempo no ar    = 2 x JUMP / GRAVITY   = 0,83 s
 * alcance        = SPEED x tempo        = 300 px    → o buraco de 200 é 67% disso
 */
export const PHYS = {
    gravity: 2400,
    jump: 1000,
    speed: 360,
    maxFall: 1500,
    /** Ainda dá para pular logo depois de sair da beirada. */
    coyoteMs: 110,
    /** Apertou pular um pouco antes de encostar no chão: vale. */
    bufferMs: 140,
    heroW: 70,
    heroH: 150,
}

/**
 * O FEDOR DA MEIA: o herói fica lento e o desenho pisca com o quadro "eca".
 *
 * A lentidão vale só NO CHÃO. O pulo cobre 300 px na velocidade cheia e os
 * buracos têm 180; lento no ar ele cobriria 160 e cairia — e em dois mapas
 * (sanduíche e fogueira) a meia fica a 360–540 px de um buraco. Fedendo, ele
 * anda devagar, mas pula igual.
 */
export const STINK = {
    ms: 3000,
    /** Fração da velocidade enquanto fede, andando no chão. */
    slow: 0.45,
    /** O quadro do herói tapando o nariz, e o ritmo em que ele pisca. */
    frame: 8,
    flickerMs: 200,
    /** De quanto em quanto tempo sobe uma ondinha verde da cabeça. */
    puffMs: 260,
}

/** O herói na folha: quadro de 300 x 450, pés em 91,2% da altura do quadro. */
export const HERO_ART = {
    frameW: 300,
    frameH: 450,
    feet: 0.912,
    /** Altura do QUADRO na tela. O boneco fica com ~150. */
    display: 208,
}

/** A bancada: 500 x 300, tampo em 20% da altura. */
export const BENCH_ART = {
    scale: 0.62,
    topAt: 0.2,
}

/**
 * `chao.png` — 1200 x 600, grade 4 x 2 de 300.
 *
 * 0 bloco com grama · 1 ponta esquerda · 2 plataforma · 3 caixote
 * 4 terra pura (a fileira de baixo) · 5 pedra (o obstáculo)
 */
export const TILES = {
    grass: 0,
    edge: 1,
    plank: 2,
    crate: 3,   // sem uso: o corte virou painel desenhado
    dirt: 4,
    rock: 5,
    frameW: 300,
}

/** A tábua mora no quadro 2, e não ocupa o quadro inteiro. */
export const PLATFORM_ART = {
    /** O topo da tábua, em fração da altura do quadro. */
    top: 191 / 300,
    /** Largura visível da tábua dentro do quadro. */
    width: 261,
}

/** A pedra: quanto ela mede na tela e onde fica o topo em que dá para pisar. */
export const ROCK = {
    size: 148,
    /** Meia largura sólida: menor que o desenho, para não travar de raspão. */
    half: 54,
    /** Altura do topo acima do chão: 53% da altura do pulo. */
    top: 110,
}

/** A estação do mapa: o tamanho na tela e o quanto o herói precisa chegar perto. */
export const STATION = {
    size: 240,
    /** Meia largura de alcance: generosa, porque parar em cima é o objetivo. */
    reach: 120,
    /** O tom da silhueta do que ainda não aconteceu. */
    shadow: 0x4a5568,
}

/** O lixo do caminho: a folha `lixo.png`, 768 x 256, três quadros de 256. */
export const TRASH = {
    size: 116,
    frames: 3,
    /** Meia caixa de colisão, generosa para o lado do herói. */
    halfX: 52,
    halfY: 58,
    /**
     * Quanto o centro do lixo fica acima da superfície em que ele pousa.
     *
     * Medido na folha: o desenho acaba em 77,7% da altura do quadro — o resto é
     * o espaço das ondinhas de fedor. Com 116 px na tela, o pé do lixo fica 32
     * px abaixo do centro. Com os 46 de antes, ele boiava acima da tábua.
     */
    lift: 32,
}

export const PAD = {
    left: { x: 120, y: 606, r: 78 },
    right: { x: 296, y: 606, r: 78 },
    jump: { x: 1150, y: 596, r: 92 },
}
