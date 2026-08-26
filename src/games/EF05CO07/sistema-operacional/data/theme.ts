/**
 * Paleta do Controlador do Sistema.
 *
 * ── DUAS CORES COM SIGNIFICADO. DUAS. ────────────────────────────────────
 *
 * A versão anterior tinha onze cores dizendo coisas: verde livre, âmbar
 * ocupado, vermelho desligado, ciano de serviço, ciano de seleção e seis cores
 * de programa. A regra §7 da memória do projeto pede TRÊS, e mesmo três só se
 * ganham o lugar.
 *
 *   VERDE     deu certo
 *   VERMELHO  não deu / não dá
 *
 * E só. "Livre" não tem cor — livre é o normal, e o normal não se pinta. Quem
 * ganha marca é a EXCEÇÃO: a peça sem energia. Pintar um aro verde em três
 * peças para dizer "estas estão normais" é gastar a tela inteira para informar
 * nada.
 *
 * ── O RESTO É CROMO, E CROMO NÃO QUER DIZER NADA ─────────────────────────
 *
 * Ciano e creme são a sala: moldura da tela, luzes, contorno de letra, trilho
 * da fila. Aparecem em toda parte justamente porque não significam nada — se
 * um dia o ciano quiser dizer alguma coisa, ele já está gasto.
 *
 * ── O FUNDO FICA VISÍVEL ─────────────────────────────────────────────────
 *
 * `A.veu` é 0.15 (era 0.50) e NÃO existe desfoque. O usuário pediu o cenário
 * mais visível, e a arte é uma sala de controle limpa, sem textura ruidosa —
 * ela não estava competindo com nada. Quem garante a leitura do texto é a
 * placa translúcida atrás dele, e não escurecer a sala inteira.
 */
export const C = {
    /** O fundo do véu e o contorno de toda letra. */
    ink: 0x08131f,
    /** A placa translúcida atrás do pedido. */
    vidro: 0x0a1626,

    /** A luz da sala: moldura, luzes acesas, a palavra realçada. */
    ciano: 0x6ee7f9,
    /** O texto. */
    creme: 0xe8f4ff,
    /** Rótulo secundário e peça sem energia. */
    dim: 0x7d97ae,
    /** A luz apagada, e o miolo dos sulcos. */
    fosco: 0x142942,

    // ── as duas cores com significado ──────────────────────────────────
    verde: 0x51cf66,
    vermelho: 0xff6b6b,

    branco: 0xffffff,
    sombra: 0x000000,
    /*
     * SEM `as const`: com ele cada cor vira um tipo literal e um
     * `let tom = C.verde` passa a só aceitar aquele número exato. Aqui as
     * cores são números.
     */
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export const A = {
    /** O véu sobre o cenário. Baixo de propósito — ver o cabeçalho. */
    veu: 0.15,
    /** A placa de vidro atrás do pedido. */
    vidro: 0.58,
    /** Quanto a peça sem energia some. */
    desligada: 0.9,
    /**
     * Quem ainda NEM CHEGOU, no trilho.
     *
     * Baixo de propósito: no Nível 3 o trilho mostra duas coisas ao mesmo tempo
     * — quem já está esperando (aceso, com halo, tocável) e quem ainda vai
     * pedir. Se os apagados não forem visivelmente mais fracos, os dois grupos
     * viram um só e a criança acha que tem seis programas esperando.
     */
    fila: 0.45,
}

/**
 * ── A BARRA DE TEMPO USA O CROMO, E NÃO AS DUAS CORES DE SIGNIFICADO ─────
 *
 * A convenção universal de relógio é verde → amarelo → vermelho, e em vários
 * jogos deste projeto é isso que a barra faz. Aqui não pode: nesta tela VERDE
 * quer dizer "deu certo" e VERMELHO quer dizer "não dá". Uma barra que nasce
 * verde diria que o tempo é uma resposta certa, e uma barra que fica vermelha
 * no fim diria "não dá" no canto de cima da tela o tempo todo.
 *
 * Então ela é feita da luz da sala: creme quando sobra tempo, ciano quando
 * está baixando. O aviso crítico não é uma terceira cor — é o PULSO, que o
 * `createTimeBar` liga sozinho em `dangerAt`. Numa tela parada, a coisa que se
 * mexe é para onde o olho vai, e isso não custa cor nenhuma.
 */
export const TEMPO_TEMA = {
    track: C.fosco,
    trackAlpha: 0.85,
    shadow: C.sombra,
    shadowAlpha: 0.35,
    border: C.ciano,
    borderAlpha: 0.5,
    fill: C.creme,
    warn: C.ciano,
    danger: C.ciano,
    idle: C.dim,
    icon: C.ciano,
    gloss: C.branco,
    glossAlpha: 0.28,
    pulseTo: 0.35,
}

/**
 * ── A PILHA É ESCRITA AQUI, E NÃO IMPORTADA ──────────────────────────────
 *
 * Quem BAIXA a fonte é `shared/fonts/gameFont.ts` (canvas não baixa fonte
 * sozinho, e texto medido cedo demais fica em Arial para sempre). Mas a pilha
 * é escrita à mão em cada jogo, igual nos outros 44 — e por um motivo prático:
 * `scripts/check-so.mjs` lê este arquivo com o Node puro, que não resolve
 * `import` sem extensão como o Vite resolve. Um import aqui derruba o
 * verificador.
 *
 * A pilha termina em Arial de propósito: é o que aparece se o download falhar,
 * e o jogo continua jogável. Fonte é acabamento.
 */
export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

/**
 * ESTA TELA É JOGADA NO CELULAR, DE PÉ, POR UMA CRIANÇA DE DEZ ANOS.
 *
 * A tela tem sete blocos de texto no total, e seis deles são de uma palavra —
 * sobra espaço, então a letra pode ser grande. Num jogo de 5º ano ela DEVE ser:
 * 1280x720 numa tela de celular vira letra de bula se a gente economizar.
 *
 * Nada abaixo de 24px, e o piso de encolhimento da frase subiu junto.
 */
export const SIZE = {
    /** A frase do pedido: a ÚNICA coisa para ler na tela. */
    frase: 34,
    fraseMin: 28,
    /** O nome da peça, embaixo dela. */
    peca: '24px',
    botao: '28px',
    ajuda: '30px',
}
