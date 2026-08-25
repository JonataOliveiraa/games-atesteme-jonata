/**
 * Paleta do Controlador do Sistema.
 *
 * ── O FUNDO É UMA SALA DE MÁQUINAS, E ISSO MANDA NA PALETA ───────────────
 *
 * `bg-central.png` e `bg-sistemas.png` são renders escuros, de sala de
 * servidores, com luz fria. Duas consequências que decidem o resto:
 *
 *   · o cromo é AZUL-AÇO, e não madeira nem papel. Uma placa creme aqui
 *     pareceria um bilhete colado no rack.
 *   · o fundo tem MUITO detalhe — cabos, painéis, luzinhas. Ele sai de foco e
 *     recebe véu, senão cada luz do cenário compete com as luzes que
 *     significam alguma coisa.
 *
 * ── AS TRÊS CORES QUE SIGNIFICAM ALGUMA COISA ────────────────────────────
 *
 * O jogo inteiro é sobre o ESTADO de um recurso, então as cores de estado são
 * a regra mais importante da tela. São três, e só três:
 *
 *   VERDE     LIVRE — dá para usar agora
 *   ÂMBAR     OCUPADO / ESPERANDO — existe, está bom, mas não é agora
 *   VERMELHO  DESLIGADO / IMPOSSÍVEL / ERRO — não vai dar, nem daqui a pouco
 *
 * Elas aparecem sempre no MESMO lugar: o aro do dispositivo, a borda da ficha,
 * o segmento da estabilidade. Nunca em texto corrido, nunca em botão de menu.
 *
 * ── E A QUARTA COR, QUE NÃO É DE ESTADO ──────────────────────────────────
 *
 * `foco` (ciano claro) quer dizer "este é o pedido que está na sua mão agora".
 * É a cor do CURSOR, não de um estado da máquina — do mesmo jeito que o amarelo
 * do Baralho quer dizer "aqui cabe uma carta". Para ela nunca ser lida como
 * estado, a seleção não é só cor: a ficha SOBE e ganha um aro grosso. Se o jogo
 * fosse impresso em preto e branco, ainda dava para ver qual ficha está na mão.
 *
 * ── OS PROGRAMAS NÃO TÊM COR DE ESTADO ───────────────────────────────────
 *
 * Um programa é identificado pelo ÍCONE, nunca por cor: seis programas com seis
 * cores brigariam de frente com as três cores de estado — um bloco de memória
 * verde diria "livre" quando quer dizer "o navegador mora aqui". `cor` existe
 * só para o disquinho atrás do ícone miniatura, que é identidade e não estado.
 */
export const C = {
    // ── a sala ─────────────────────────────────────────────────────────
    /** O tom mais escuro: fundo do sulco, sombra, véu. */
    ink: 0x081422,
    /** O corpo do console. */
    painel: 0x14283f,
    /** A superfície de cima do console, onde as peças pousam. */
    painelClaro: 0x1d3a58,
    /** O soquete vazio: memória livre, encaixe sem ninguém. */
    soquete: 0x0e1f33,
    /** A borda de tudo que é chapa de metal. */
    edge: 0x33608c,
    /** O metal claro: parafuso, canto, filete de luz. */
    metal: 0x7fa6cc,

    /** A luz de serviço do console — cromo, nunca estado. */
    ciano: 0x22d3ee,
    cianoSoft: 0xa5f3fc,

    // ── as três cores de estado ────────────────────────────────────────
    /** LIVRE. */
    livre: 0x51cf66,
    livreSoft: 0xd3f9d8,
    /** OCUPADO / ESPERANDO. */
    ocupado: 0xfcc419,
    ocupadoSoft: 0xffe999,
    /** DESLIGADO / IMPOSSÍVEL / ERRO. */
    parado: 0xff6b6b,
    paradoSoft: 0xffd0d0,

    /** O CURSOR: o pedido que está na sua mão. */
    foco: 0x7dd3fc,
    focoSoft: 0xe0f2fe,

    // ── tinta ──────────────────────────────────────────────────────────
    /** O papel das fichas de pedido. */
    ficha: 0xeef4fa,
    fichaSombra: 0xc3d3e2,
    creme: 0xf2f7fb,
    idle: 0x7f97ad,
    white: 0xffffff,
    shadow: 0x000000,
    /*
     * SEM `as const`, e o motivo é o mesmo do Mapas em Rede: com ele cada cor
     * vira um TIPO LITERAL, e um `let tom = C.livre` passa a só aceitar aquele
     * número exato. Aqui o aro do dispositivo troca de cor três vezes por
     * segundo — as cores precisam ser números.
     */
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * A TINTA DA MENSAGEM.
 *
 * A plaquinha do rodapé é a voz do sistema, e ela é clara. As cores de `C` são
 * feitas para brilhar sobre chapa escura e somem sobre papel, então a mensagem
 * tem tintas próprias, todas escuras.
 */
export const TINTA = {
    /** O normal: a dica da fase, o lembrete de sempre. */
    fala: 0x16324d,
    ok: 0x11703a,
    alerta: 0xa8143f,
    /** "Olhe isto agora" — sem ser erro. */
    atencao: 0x8a5a06,
}

/**
 * A BARRA DE TEMPO do header (`shared/hud/createTimeBar`).
 *
 * ── POR QUE ESTE JOGO TEM RELÓGIO ────────────────────────────────────────
 *
 * A barra aqui não é um cronômetro de prova: ela é O TURNO. Ela nasce com a
 * duração calculada a partir dos próprios pedidos da fase (ver `tempoDaFase`,
 * em `data/casos.ts`), então esvaziar significa "o expediente acabou". Se
 * sobrou pedido na fila quando ela zera, o turno acabou mal — e é isso que a
 * derrota por tempo quer dizer.
 *
 * As cores saem do CROMO — luz de serviço, âmbar de painel, vermelho de alarme.
 * Verde ficou de fora de propósito: nesta tela verde quer dizer LIVRE, e uma
 * barra verde no topo sugeriria que o tempo é um recurso a distribuir.
 */
export const BARRA = {
    warnAt: 0.5,
    dangerAt: 0.25,
    theme: {
        track: 0x061019,
        trackAlpha: 0.75,
        border: 0x33608c,
        borderAlpha: 0.85,
        /** Cheia: a luz de serviço do console. */
        fill: 0x22d3ee,
        /** Metade: âmbar de painel. */
        warn: 0xfcc419,
        /** Reta final: o vermelho de alarme. */
        danger: 0xff6b6b,
        idle: 0x7f97ad,
        icon: 0xe0f2fe,
        /** Fundo do vale do pulso: a barra quase apaga, e volta. */
        pulseTo: 0.3,
    },
}

export const A = {
    /**
     * Quanto o cenário some por trás do véu.
     *
     * Com o desfoque quase imperceptível (força 0.4), é ESTE número que faz o
     * fundo virar fundo. Se a sala parecer apagada demais, mexa aqui — não no
     * blur. 0.42 deixa o render respirar; 0.60 quase o apaga.
     */
    veil: 0.5,
    gloss: 0.16,
    dim: 0.42,
    /** O quanto uma peça desligada some. */
    desligado: 0.5,
}

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
}

/** Nada abaixo de 17px na área jogável — 5º ano, com Scale.FIT no celular. */
export const SIZE = {
    hudLevel: '19px',
    hudInstr: '22px',
    hudInstrLongo: '19px',

    /** "ESTABILIDADE DO SISTEMA", à esquerda da barra de segmentos. */
    estabRotulo: '15px',

    /** O nome embaixo de cada peça de hardware. */
    peca: '17px',
    /** "LIVRE" / "OCUPADO" / "DESLIGADO", dentro do aro. */
    pecaEstado: '13px',

    memRotulo: '15px',
    memBloco: '13px',

    /** O nome do programa, no alto da ficha. */
    fichaNome: '16px',
    /** A frase do pedido. */
    fichaFala: '19px',

    button: '20px',
    help: '30px',
    /** A voz do sistema, na plaquinha do rodapé. */
    mensagem: '20px',
}

/** Acima disso o enunciado do header encolhe. */
export const LONGO = 52

/** Texto escuro sobre fundo claro, texto claro sobre fundo escuro. */
export function inkOn(color: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? C.ink : C.creme
}
