import type { Casa, No, Trecho } from '../types'

export const W = 1280
export const H = 720

/**
 * O MUNDO É MAIOR QUE A TELA, e só no eixo x. A câmera anda com o dedo, como
 * no Metrô Mirim — mas aqui nunca para os lados todos: a vila é uma faixa, e
 * subir ou descer não tem para onde ir.
 *
 * Ele cresceu de 2560 para 3600 — quase três telas. A vila de antes tinha oito
 * casas na primeira tela, e casa colada em casa não é vila: é fila. Cada casa
 * agora tem pelo menos 180 px de vizinha, e o mapa ficou com espaço vazio
 * entre os aglomerados, que é o que faz "longe" significar alguma coisa.
 */
export const WORLD = { w: 3600, h: H }

export const HORIZONTE = 400

export const HUD = {
    h: 72,
    cy: 36,
    pilulaX: 20,
    bolinhasX: 176,
    livesX: 1020,
    helpX: 1206,
    helpHit: 120,
    bandX: 290,
    bandW: 32,
    bandGap: 12,
    solX: 700,
    solR: 42,
    solCy: 50,
}

/**
 * O kit. O painel desce quando a corrida começa E quando o dedo arrasta o
 * mapa — nesses dois momentos o que importa é a vila, não a mesa.
 */
export const KIT = {
    top: 545,
    h: 175,
    cardW: 200,
    cardH: 150,
    cardY: 632,
    x0: 140,
    gap: 26,
    imgY: 612,
    nomeY: 678,
    nomeSize: 28,
    okX: 1100,
    okY: 632,
    okW: 280,
    okH: 150,
}

export const cardCentros = (n: number): number[] =>
    Array.from({ length: n }, (_, i) => KIT.x0 + i * (KIT.cardW + KIT.gap))

/** Nada da área de jogo mora embaixo do painel. A casa é medida pela base. */
export const CASA_ALTURA = 88
export const LIMITE_CASA = KIT.top - CASA_ALTURA / 2
export const LIMITE_NO = KIT.top - 13

/** Onde as ferramentas que não andam se plantam. */
export const PRACA = { x: 350, y: 455 }
export const IGREJA = { x: 1310, y: 440 }

/**
 * O grafo da estrada. Um trecho = um passo de sol.
 *
 * Duas bifurcações. A de `a` é a que mais importa: o caminho de CIMA passa
 * atrás, junto das casas altas, e a RUAZINHA passa na frente, junto das
 * baixas. Com círculo pequeno não dá para servir os dois lados — e é essa a
 * decisão que o §2 chama de "a resposta está na distância entre as casas".
 */
export const NOS: No[] = [
    { id: 'p', x: 160, y: 480 },
    { id: 'a', x: 760, y: 476 },
    { id: 'u1', x: 1100, y: 400 },
    { id: 'u2', x: 1500, y: 395 },
    { id: 'l1', x: 1100, y: 528 },
    { id: 'l2', x: 1500, y: 532 },
    { id: 'c', x: 1940, y: 478 },
    { id: 'd', x: 3500, y: 474 },
    { id: 'm1', x: 2560, y: 400 },
    { id: 'm2', x: 2920, y: 330 },
    { id: 'm3', x: 3340, y: 270 },
]

export const TRECHOS: Trecho[] = [
    { de: 'p', para: 'a', ramo: 'estrada' },
    { de: 'a', para: 'u1', ramo: 'cima' },
    { de: 'u1', para: 'u2', ramo: 'cima' },
    { de: 'u2', para: 'c', ramo: 'cima' },
    { de: 'a', para: 'l1', ramo: 'baixo' },
    { de: 'l1', para: 'l2', ramo: 'baixo' },
    { de: 'l2', para: 'c', ramo: 'baixo' },
    { de: 'c', para: 'm1', ramo: 'morro' },
    { de: 'm1', para: 'm2', ramo: 'morro' },
    { de: 'm2', para: 'm3', ramo: 'morro' },
    { de: 'c', para: 'd', ramo: 'seguir' },
]

export const RAMO_NOME: Record<string, string> = {
    cima: 'por cima',
    baixo: 'pela ruazinha',
    morro: 'subir o morro',
    seguir: 'seguir reto',
    estrada: 'seguir',
}

/**
 * As doze casas, pelo CENTRO. As distâncias daqui para os trechos são o jogo
 * inteiro — mexer numa casa muda o gabarito de todos os problemas.
 *
 * Com a vila esticada, os três alcances plantados ficaram exatos, e isso é
 * desenho, não sorte: o QUADRO pega h1 e h2 (a praça), o TELÃO pega h1, h2 e
 * h3 (a praça e a casa de cima), e o SINO pega h4, h5, h6 e h7 (o meio da
 * vila) — e mais nenhuma. Qualquer casa que ande 60 px estraga isso: antes de
 * mexer numa coordenada daqui, refaça a conta de distância de cada problema
 * (a mesma que o `levels.ts` faz) e confira a tabela da PLANEJAMENTO.md §22.1.
 */
export const CASAS: Casa[] = [
    { id: 'h1', x: 210, y: 410 },
    { id: 'h2', x: 490, y: 495 },
    { id: 'h3', x: 670, y: 398 },
    { id: 'h4', x: 900, y: 500 },
    { id: 'h5', x: 1190, y: 385 },
    { id: 'h6', x: 1420, y: 498 },
    { id: 'h7', x: 1690, y: 390 },
    { id: 'h8', x: 1880, y: 500 },
    { id: 'h9', x: 2610, y: 345 },
    { id: 'h10', x: 2930, y: 275 },
    { id: 'h11', x: 3250, y: 225 },
    { id: 'h12', x: 3460, y: 300 },
]

export const CASA_POR_ID: Record<string, Casa> = Object.fromEntries(
    CASAS.map(c => [c.id, c]),
)

export const NO_POR_ID: Record<string, No> = Object.fromEntries(NOS.map(n => [n.id, n]))

/** Os pousos que o drone oferece — um por aglomerado, quatro no morro. */
export const POUSOS: Array<{ x: number; y: number; nome: string }> = [
    { x: 350, y: 450, nome: 'a praça' },
    { x: 1310, y: 420, nome: 'a igreja' },
    { x: 1420, y: 530, nome: 'a ruazinha' },
    { x: 2640, y: 330, nome: 'o pé do morro' },
    { x: 2930, y: 290, nome: 'o meio do morro' },
    { x: 3250, y: 245, nome: 'o alto do morro' },
    { x: 3450, y: 330, nome: 'a última casa' },
]

/**
 * O cenário, desenhado à mão.
 *
 * `vila.png` saiu do jogo: uma paisagem pronta não se estica para 3600 sem
 * virar colagem, e a estrada, as casas e o círculo moram por cima dela de
 * qualquer jeito — que é a emenda que o `PLANEJAMENTO MODAL.md` §7 proíbe.
 * Ficaram duas texturas, `ceu.png` e `arvore.png`, e o resto é Graphics.
 *
 * Os arbustos e as cercas saíram daqui. Eram 9 tufos e 3 cercas espalhados
 * por um chão que já tem morro, terraço, praça e estrada — enfeite que não
 * responde pergunta nenhuma e disputa o olho com a casa que precisa saber.
 */
export const MORROS = [
    { x: -100, y: 322, w: 700, h: 120, tom: 0 },
    { x: 480, y: 344, w: 760, h: 100, tom: 1 },
    { x: 1080, y: 316, w: 700, h: 130, tom: 0 },
    { x: 1560, y: 296, w: 780, h: 150, tom: 1 },
    { x: 2120, y: 334, w: 640, h: 112, tom: 0 },
]

/** O morro de verdade: o que se sobe, e o que tem casa em cima. */
export const MORRO = { x0: 2060, x1: 3700, topo: 168, base: 476 }

/** Os terraços do morro, que é o que faz ele LER como alto sem sombra. */
export const TERRACOS = [
    { y: 400, x0: 2200, x1: 3700 },
    { y: 330, x0: 2390, x1: 3700 },
    { y: 268, x0: 2660, x1: 3700 },
    { y: 212, x0: 2960, x1: 3700 },
]

/**
 * Seis árvores em 3600 px, e nenhuma em cima de casa.
 *
 * Eram onze num mundo menor. Árvore é a única coisa do cenário com textura
 * própria, então ela pesa o dobro de qualquer traço em Graphics: em excesso,
 * vira mato na frente do que a criança precisa contar.
 */
export const ARVORES = [
    { x: 90, y: 486, s: 0.95 },
    { x: 790, y: 468, s: 0.8 },
    { x: 1580, y: 480, s: 1 },
    { x: 2180, y: 452, s: 0.9 },
    { x: 3060, y: 322, s: 0.7 },
    { x: 3580, y: 404, s: 0.85 },
]
