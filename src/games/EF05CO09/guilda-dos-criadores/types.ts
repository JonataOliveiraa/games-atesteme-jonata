/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A HABILIDADE, EM TRÊS LINHAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * (EF05CO09) Usar informações considerando aplicações e LIMITES dos direitos
 * autorais. Aqui isso é um gesto: virar a obra para ver de quem ela é, e
 * copiar o que está no verso — o carimbo e a assinatura — para a plaquinha.
 *
 * Nenhuma obra guarda a sua resposta. A plaquinha certa é uma CÓPIA do verso,
 * e `avaliar` compara as duas. O verso está nos dados porque ele é o texto que
 * a criança lê, do mesmo jeito que a capa do jornal na EF05CO08 — o que não
 * existe em lugar nenhum é um campo dizendo qual plaquinha é a certa.
 */

export type Seal = 'credito' | 'fechada' | 'nenhum'

export type MarkId =
    | 'sol' | 'raio' | 'estrela' | 'coracao'
    | 'gato' | 'lua' | 'folha' | 'peixe'

export type Sign =
    | { kind: 'letras'; text: string }
    | { kind: 'marca'; id: MarkId }

export type Stamp = 'credito' | 'minha'

/**
 * O QUE CADA SELO QUER DIZER, em uma linha de criança.
 *
 * Fica escrito embaixo do selo no verso, toda vez. O © é um símbolo do mundo
 * real — ela vai encontrá-lo em rodapé de site e de livro — e não se aprende
 * um símbolo vendo o desenho dele.
 */
export const SEAL_NOTE: Record<Seal, string> = {
    credito: 'pode usar dando o crédito',
    fechada: 'fechada: peça antes de usar',
    nenhum: 'não diz de quem é',
}

/**
 * O NOME DE CADA CAMPO DO VERSO.
 *
 * Duas palavras curtas, e nenhuma delas é decoração: sem rótulo, o © e a
 * marca eram dois desenhos soltos no papel, e a criança tinha de adivinhar
 * que um era a permissão e o outro o dono. `DE QUEM É` é a frase que o jogo
 * já usa na bandeja vazia e na fala da Lia — repetir a MESMA palavra em todos
 * os lugares é o que faz ela virar vocabulário.
 */
export const VERSO_LABEL = {
    licenca: 'A LICENÇA',
    dono: 'DE QUEM É',
} as const

export interface Obra {
    id: string
    /** A célula em `obras.png`: `nível × 3 + fase`. */
    frame: number
    /** Como o enunciado chama a obra. */
    title: string
    seal: Seal
    /** `null` só quando `seal === 'nenhum'`. */
    sign: Sign | null
    note: string | null
    /** Quem atende a campainha. O índice da linha em `artistas.png`. */
    author: number | null
}

export interface Plaquinha {
    stamp: Stamp | null
    sign: Sign | null
}

export type Falha =
    | 'incompleta'
    | 'semLicenca'
    | 'semDono'
    | 'assinaturaErrada'

/**
 * A PEÇA DA BANDEJA, que não é a assinatura inteira.
 *
 * Uma assinatura de letras se monta tocando uma letra de cada vez; uma de marca
 * se resolve num toque só. As duas caem na mesma bandeja e no mesmo slot da
 * plaquinha — o que muda é quantos toques fecham a assinatura.
 */
export type Piece =
    | { kind: 'letra'; ch: string }
    | { kind: 'marca'; id: MarkId }

/**
 * A FALA DE ABERTURA — E A ARMADILHA DELA.
 *
 * Um artista aparecendo antes da fase dá presença à guilda e diz o objetivo
 * com voz de gente. Mas se ele for O AUTOR de uma obra assinada com LETRAS,
 * o nome dele na fala entrega a resposta de graça — a criança copia da fala
 * em vez do verso, e o jogo inteiro desaparece.
 *
 * Por isso a regra, afirmada na validação: numa fase de letras quem fala
 * NUNCA é o autor. Numa fase de marca o autor pode falar, porque saber que a
 * obra é da Lia não diz que a marca dela é um sol.
 */
export interface Intro {
    /** A linha em `artistas.png`. */
    who: number
    pose: number
    text: string
}

export interface PhaseDef {
    obra: Obra
    /** As peças da bandeja no passo da assinatura, na ordem em que aparecem. */
    tray: Piece[]
    /** Quem entra falando antes da obra pousar. Nem toda fase tem. */
    intro?: Intro
}

export interface LevelDef {
    level: number
    /** A frase do cabeçalho. Ela diz o OBJETIVO, não o gesto. */
    prompt: string
    /**
     * A APRESENTAÇÃO DO JOGO, antes da primeira obra pousar.
     *
     * Ela responde, nesta ordem, as três perguntas que a criança tem ao
     * abrir um jogo que nunca viu: **onde eu estou**, **o que está
     * faltando** e **o que eu vou fazer**. Cada linha para e espera o
     * Próximo — quem conta o tempo é ela.
     *
     * Só toca na primeira vez: depois que o tutorial do nível já foi visto,
     * ela é pulada inteira. Repetir a apresentação a cada partida é o jeito
     * mais rápido de fazer a criança tocar em Próximo sem ler.
     */
    opening?: Intro[]
    phases: PhaseDef[]
}

/** O estado da fase. Uma linha no começo de cada handler decide se o toque vale. */
export type Mode =
    | 'entrando'
    | 'frente'
    | 'verso'
    | 'travado'
    | 'subindo'
    | 'fim'

export const ARTIST_NAMES = ['LIA', 'TOM', 'NINA', 'DAVI'] as const

export const POSE = {
    esperando: 0,
    agradecendo: 1,
    explicando: 2,
    confuso: 3,
} as const

/** As células de `carimbos-e-marcas.png`. */
export const OBJ_FRAME = { carimbo: 0, campainha: 1, selo: 2, cadeado: 3 } as const

export const MARK_FRAME: Record<MarkId, number> = {
    sol: 4, raio: 5, estrela: 6, coracao: 7,
    gato: 8, lua: 9, folha: 10, peixe: 11,
}

export function sameSign(a: Sign, b: Sign): boolean {
    if (a.kind !== b.kind) return false
    return a.kind === 'letras'
        ? a.text === (b as { text: string }).text
        : a.id === (b as { id: MarkId }).id
}

/** O carimbo que aquele verso pede. `fechada` só vira `credito` com licença. */
export function stampFor(seal: Seal, licensed: boolean): Stamp | null {
    if (seal === 'credito') return 'credito'
    if (seal === 'fechada' && licensed) return 'credito'
    return null
}

/**
 * O veredito. Sai da COMPARAÇÃO entre a plaquinha e o verso, e `licensed` é
 * estado — é isso que permite a mesma obra mudar de resposta no nível 2.
 */
export function avaliar(p: Plaquinha, o: Obra, licensed: boolean): Falha | null {
    if (!p.stamp || !p.sign) return 'incompleta'
    if (o.seal === 'nenhum') return 'semDono'
    if (p.stamp !== stampFor(o.seal, licensed)) return 'semLicenca'
    return sameSign(p.sign, o.sign!) ? null : 'assinaturaErrada'
}

/** Quantas peças fecham a assinatura desta obra. */
export function signLength(sign: Sign): number {
    return sign.kind === 'letras' ? sign.text.length : 1
}

/** O que as peças tocadas até agora formam. `null` enquanto não fecha. */
export function signFrom(picked: Piece[], target: Sign): Sign | null {
    if (target.kind === 'marca') {
        const first = picked[0]
        return first?.kind === 'marca' ? { kind: 'marca', id: first.id } : null
    }
    if (picked.length < target.text.length) return null
    return { kind: 'letras', text: picked.map(p => (p.kind === 'letra' ? p.ch : '?')).join('') }
}

/** O texto que a plaquinha mostra enquanto a criança monta. */
export function draftText(picked: Piece[]): string {
    return picked.map(p => (p.kind === 'letra' ? p.ch : '')).join('')
}
