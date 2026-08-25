/**
 * Layout único do Tradutor da Máquina — 1280x720.
 *
 * ── DUAS METADES E UM FIO ────────────────────────────────────────────────
 *
 *   ESQUERDA   a MÁQUINA: o robô e o visor com o que já chegou nela
 *   DIREITA    o PAINEL: o que você está montando e o botão de mandar
 *   EMBAIXO    a TABELA: o combinado entre os dois mundos
 *
 * O fio sai do botão ENVIAR e entra no visor. Ele existe para o envio ter um
 * caminho visível: sem ele, a letra apareceria do outro lado da tela por
 * teletransporte, e a criança não veria que uma coisa causou a outra.
 */
export const W = 1280
export const H = 720

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 84,
    r: 26,
    cy: 52,

    pillX: 42,
    pillY: 32,
    pillW: 134,
    pillH: 40,

    dotsX: 202,
    dotsMaxW: 190,
    dotR: 8,

    titleX: 660,
    titleY: 40,
    titleW: 560,
    hintY: 70,
    hintW: 620,

    helpX: 1216,
    helpR: 27,
}

export const QUESTION = { cx: 640, cy: 126, wrap: 1120 }

/** A máquina: o robô em cima, o visor embaixo. */
export const MACHINE = {
    robotCX: 335,
    robotCY: 245,
    robotW: 240,
    robotH: 220,

    screenCX: 335,
    screenCY: 478,
    screenW: 580,
    screenH: 212,
    screenR: 22,

    /** "A MÁQUINA RECEBEU" / "A MÁQUINA LEU". */
    labelY: 396,

    /* ── Níveis 1 e 2: as letras que já chegaram ────────────────────── */
    slotsCY: 500,
    slotW: 92,
    slotH: 108,
    slotR: 16,
    slotGap: 16,
    slotCharDY: -16,
    slotCodeDY: 30,

    /* ── Nível 3: as três fileiras que chegaram ─────────────────────── */
    rowsCY: 490,
    rowW: 500,
    rowH: 48,
    rowGap: 6,
    rowR: 14,
    /** Dentro da fileira: sete lampadinhas, uma seta, e a letra lida. */
    rowLampX: -136,
    rowLampGap: 26,
    rowLampR: 8,
    rowArrowX: 62,
    rowCharX: 112,

    /** Onde o fio encosta no visor. */
    plugX: 625,
    plugY: 478,
}

/**
 * O caminho do fio, do botão até o visor.
 *
 * Ele desce pela folga entre as duas metades (x=665), que é a única faixa
 * vertical livre da tela: à esquerda está o visor, à direita as chaves.
 */
export const WIRE: Array<[number, number]> = [
    [825, 528],
    [665, 528],
    [665, 478],
    [625, 478],
]

/** O painel de tradução. */
export const PANEL = {
    cx: 975,
    left: 707,
    right: 1243,

    /* ── as duas placas: o alvo e o que você fez ────────────────────── */
    plateCY: 204,
    plateW: 260,
    plateH: 104,
    plateGap: 16,
    plateR: 20,
    plateLabelDY: -28,
    plateBigDY: 18,
    /** Dentro da placa da direita: [número] = [letra]. */
    madeNumberDX: -40,
    madeEqualsDX: 12,
    madeCharDX: 50,

    /* ── as sete chaves ─────────────────────────────────────────────── */
    colCY: 372,
    colW: 68,
    colH: 200,
    colGap: 10,
    colR: 16,
    lampDY: -64,
    lampR: 22,
    digitDY: 2,
    valueDY: 66,
    /** A zona de toque é a coluna inteira, com folga: dedo de criança. */
    colHitW: 78,
    colHitH: 212,

    runY: 528,
    runW: 300,
    runH: 74,
}

/** A tira da tabela, embaixo. */
export const TABLE_UI = {
    barX: 20,
    barY: 598,
    barW: W - 40,
    barH: 94,
    barR: 22,

    cy: 645,
    chipW: 86,
    chipH: 74,
    chipR: 14,
    chipGap: 10,
    charDY: -14,
    codeDY: 20,
    hitPad: 8,

    /** As reticências que dizem "a tabela continua". */
    dotsLeftX: 46,
    dotsRightX: W - 46,
}

/**
 * O recado sobe DENTRO do visor, e não numa faixa qualquer da tela.
 *
 * Não sobrou nenhuma faixa horizontal livre em 1280x720: HUD, pergunta,
 * placas, chaves, botão e tabela ocupam a altura inteira. Como o recado
 * precisava cobrir alguma coisa, cobre justamente o visor — que é o que a
 * criança MENOS precisa consultar no instante em que erra a soma. De quebra,
 * parece a própria máquina falando.
 */
export const TOAST = {
    cx: MACHINE.screenCX,
    y: 478,
    hiddenY: 600,
    w: 544,
    h: 104,
    r: 18,
}
