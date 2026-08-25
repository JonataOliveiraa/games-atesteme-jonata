/**
 * Paleta do Mapas em Rede — MADEIRA.
 *
 * ── POR QUE MADEIRA ──────────────────────────────────────────────────────
 *
 * O cromo era azul-marinho com acentos em azul-elétrico, sobre um cenário de
 * grama verde-clara e telhados vermelhos. Duas linguagens diferentes na mesma
 * tela: a arte é um bairro ilustrado, quente, e a interface era um painel de
 * ficção científica. Madeira resolve — o HUD passa a parecer uma placa de
 * parque, um letreiro de trilha, uma coisa que MORA naquele bairro.
 *
 * ── A REGRA QUE NÃO MUDA ─────────────────────────────────────────────────
 *
 * Marrom é CROMO: moldura, painel, plaqueta, barra de baixo. Nunca significa
 * nada. As cores de significado continuam sendo três, e só três:
 *
 *   VERDE    certo, partida, tempo cheio
 *   VERMELHO errado, chegada, tempo acabando
 *   ÂMBAR    selecionado, parada obrigatória, tempo pela metade
 *
 * Elas foram reafinadas para conviver com madeira e com a grama: mais
 * saturadas e um pouco mais escuras que as originais, que eram tons de
 * dashboard e sumiam contra o verde do cenário.
 */
export const C = {
    // ── a madeira ──────────────────────────────────────────────────────
    /** O tom claro, de tábua nova: botões e molduras. */
    madeira: 0xb07d46,
    /** A tábua mesmo: o corpo das placas. */
    madeiraMedia: 0x8a5a2b,
    /** A sombra da tábua, e a borda de baixo dos botões. */
    madeiraEscura: 0x5c3a19,
    /** O painel: madeira quase preta, para texto claro por cima. */
    painel: 0x33200f,
    /** A tinta escura, para texto sobre papel e para contorno de letra. */
    ink: 0x2a1a0c,

    /** O papel do letreiro, e a cor da letra sobre madeira. */
    creme: 0xf7ecd8,
    /** O creme apagado, para rótulo secundário. */
    cremeSoft: 0xd8c3a3,
    /** O latão dos parafusos e da linha de acento. */
    latao: 0xd9a441,

    // ── as três cores de significado ───────────────────────────────────
    green: 0x2f9e44,
    greenSoft: 0x69db7c,
    red: 0xc92a2a,
    redSoft: 0xff8787,
    amber: 0xe8a317,

    /** Desligado / neutro. */
    slate: 0x8b7355,
    dim: 0x6b5844,
    white: 0xffffff,
    /*
     * SEM `as const` de propósito.
     *
     * Com ele cada cor vira um TIPO LITERAL (`0xb07d46`), e um `let cor =
     * C.madeira` passa a só aceitar aquele número exato — trocar a cor de uma
     * aresta no meio do desenho vira erro de tipo. Aqui as cores são números, e
     * é isso que elas precisam ser.
     */
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** O contorno padrão de toda letra deste jogo. */
export const STROKE = hex(C.ink)

/**
 * A BARRA DE TEMPO, com as cores que o usuário pediu.
 *
 * Verde cheia, amarela na metade, vermelha piscando abaixo de um quarto. É a
 * convenção universal de relógio e não conflita aqui: nesta tela o verde e o
 * vermelho de significado aparecem em BOTÕES e em MARCADORES de partida e
 * chegada, nunca numa barra horizontal no topo.
 *
 * `warnAt` e `dangerAt` são as fronteiras: 0.5 e 0.25, exatamente "metade" e
 * "um quarto".
 */
export const BARRA = {
    warnAt: 0.5,
    dangerAt: 0.25,
    theme: {
        track: 0x2a1a0c,
        trackAlpha: 0.7,
        border: 0xd9a441,
        borderAlpha: 0.8,
        fill: 0x51cf66,
        warn: 0xfcc419,
        danger: 0xff6b6b,
        idle: 0x8b7355,
        icon: 0xf7ecd8,
        /** Fundo do vale do pulso: a barra quase apaga, e volta. */
        pulseTo: 0.28,
    },
} as const
