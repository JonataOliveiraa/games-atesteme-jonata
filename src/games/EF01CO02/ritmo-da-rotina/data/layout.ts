export const W = 1280
export const H = 720

export const DEPTH = {
    scenery: 0,
    veil: 4,
    path: 8,
    target: 12,
    figure: 20,
    button: 30,
    panel: 60,
    hud: 70,
    balloon: 80,
    fx: 90,
    edge: 120,
    recap: 300,
    overlay: 400,
}

/**
 * O painel da rotina flutua, com margem em volta. A altura dele é curta de
 * propósito: o anel do alvo precisa caber inteiro ABAIXO dele. Painel grande
 * cortava o anel pela metade, e o corte fazia parecer defeito de desenho.
 */
export const PANEL = { x: 16, y: 10, w: 1248, h: 140, r: 30 }

/** O nome da rotina mora numa fita dentro do painel — nunca solto na tela. */
export const TITLE = { x: 36, y: 58, w: 248, h: 68, r: 22 }

/**
 * Embaixo da fita, uma linha só dela, INTEIRA dentro do painel: a plaquinha do
 * nível na esquerda e as bolinhas das fases na direita. Antes as bolinhas
 * ficavam em cima da borda de baixo da fita e pareciam um defeito do desenho.
 */
export const LEVEL_TAG = { x: 36, y: 117, w: 130, h: 34 }

/** As três fases do nível, em bolinhas embaixo do nome. */
export const PIPS = { cx: 226, y: 117, gap: 26, r: 8 }

export const MINI = { size: 104, gap: 16, cy: 80, max: 5 }

export const HELP = { x: 1208, y: 80, r: 32 }

/** O caminho do dia: a faixa clara por onde a criança do desenho passa. */
export const PATH = { top: 172, h: 240, cy: 292, r: 44 }

export const FIGURE = { size: 168, spawnX: 1400, labelDy: 104 }

/**
 * Onde a figura é julgada. O topo do anel, com brilho e tudo, fica em 152 —
 * abaixo dos 150 do painel. Esse número é a razão de o painel ser baixo.
 */
export const TARGET = { x: 300, y: 292, r: 112, glow: 26 }

export const TRAVEL = FIGURE.spawnX - TARGET.x

/** O balão de fala só aparece parado, e nasce longe do alvo. */
export const BALLOON = { x: 820, y: 286, w: 440 }

/**
 * Dois botões, e só dois. O TAMBOR fica embaixo do alvo, na esquerda: o que
 * entra no círculo desce direto para a mão que bate. O "agora não" fica na
 * ponta oposta, longe o bastante para não haver toque trocado.
 */
export const DRUM = { x: 352, y: 566, size: 292 }

export const REFUSE = { x: 1024, y: 560, r: 98 }

/**
 * O menino do tutorial fala EMBAIXO, entre o tambor e a mãozinha: o caminho e
 * o anel ficam livres para a demonstração acontecer à vista. O balão cresce
 * para cima a partir de `bottom`.
 */
export const GUIDE = { x: 712, bottom: 704, w: 404, avatar: 104, text: '28px' }

export const RECAP = { cy: 300, rowY: 470, gap: 130, size: 116, titleY: 168 }
