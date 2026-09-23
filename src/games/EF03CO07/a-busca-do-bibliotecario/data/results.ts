import type { QueryState, ResultDef } from '../types'

export const RESULTS: ResultDef[] = [
    { id: 'tucano-real', frame: 0, type: 'image', terms: ['TUCANO', 'FOTO', 'ANIMAL'] },
    { id: 'tucano-pelucia', frame: 1, type: 'image', terms: ['TUCANO', 'PELÚCIA', 'BRINQUEDO'] },
    { id: 'tucano-desenho', frame: 2, type: 'image', terms: ['TUCANO', 'DESENHO', 'PAPEL'] },

    { id: 'vulcao-erupcao', frame: 3, type: 'video', terms: ['VULCÃO', 'ERUPÇÃO', 'VÍDEO', 'LAVA'] },
    { id: 'vulcao-calmo', frame: 4, type: 'image', terms: ['VULCÃO', 'CALMO', 'MONTANHA', 'FOTO'] },
    { id: 'vulcao-maquete', frame: 5, type: 'image', terms: ['VULCÃO', 'ERUPÇÃO', 'MAQUETE', 'ESCOLA'] },

    { id: 'baleia-real', frame: 6, type: 'image', terms: ['BALEIA', 'FOTO', 'ANIMAL', 'MAR'] },
    { id: 'baleia-pelucia', frame: 7, type: 'image', terms: ['BALEIA', 'PELÚCIA', 'BRINQUEDO', 'FOTO'] },
    { id: 'baleia-desenho', frame: 8, type: 'image', terms: ['BALEIA', 'DESENHO', 'PAPEL'] },

    /*
     * ── O ACERVO DOS NÍVEIS 2 E 3 ────────────────────────────────────────
     *
     * NENHUMA ARTE NOVA: são os quadros 9 a 23 da `resultados.png` que já
     * estavam na folha e ninguém usava — espaço, feijão, água, cerrado e
     * lixo. O que muda é o TIPO: a mesma palavra traz um vídeo, uma foto e
     * um texto, e é esse empate que faz o filtro ter o que separar.
     *
     * O tipo não está no desenho da carta, e não precisa estar: quem diz é
     * o selo que a estante carimba em cima dela.
     */
    { id: 'espaco-texto', frame: 9, type: 'text', terms: ['PLANETA', 'CÉU', 'SISTEMA SOLAR'] },
    { id: 'foguete-video', frame: 10, type: 'video', terms: ['FOGUETE', 'ESPAÇO', 'SUBIR'] },
    { id: 'terra-foto', frame: 11, type: 'image', terms: ['PLANETA', 'CÉU', 'TERRA'] },

    { id: 'feijao-broto', frame: 12, type: 'video', terms: ['FEIJÃO', 'PLANTAR', 'CRESCER'] },
    { id: 'feijao-comida', frame: 13, type: 'image', terms: ['FEIJÃO', 'COMIDA', 'PANELA'] },
    { id: 'feijao-semente', frame: 14, type: 'image', terms: ['FEIJÃO', 'PLANTAR', 'SEMENTE'] },

    { id: 'agua-chuva', frame: 15, type: 'image', terms: ['ÁGUA', 'CHUVA', 'MAR'] },
    { id: 'agua-copo', frame: 16, type: 'image', terms: ['ÁGUA', 'BEBER', 'COPO'] },
    { id: 'agua-onda', frame: 17, type: 'video', terms: ['ÁGUA', 'MAR', 'ONDA'] },

    { id: 'lobo-guara', frame: 18, type: 'image', terms: ['LOBO-GUARÁ', 'CERRADO', 'ANIMAL'] },
    { id: 'raposa', frame: 19, type: 'image', terms: ['RAPOSA', 'CERRADO', 'ANIMAL'] },

    { id: 'saturno-foto', frame: 20, type: 'image', terms: ['PLANETA', 'CÉU', 'ANEL'] },
    { id: 'jupiter-video', frame: 21, type: 'video', terms: ['PLANETA', 'CÉU', 'GRANDE'] },

    { id: 'lixo-separar', frame: 22, type: 'text', terms: ['LIXO', 'SEPARAR', 'RECICLAR'] },
    { id: 'lixo-saco', frame: 23, type: 'image', terms: ['LIXO', 'SACO', 'SUJEIRA'] },
]

export const resultOf = (id: string) => RESULTS.find(result => result.id === id)!

/**
 * A NOTA DE UM RESULTADO.
 *
 * Palavra que bate soma; palavra que sobra na consulta e não bate desconta —
 * é o que faz "pedir demais" custar alguma coisa. O FILTRO não soma nada: ele
 * AFASTA. Um vídeo numa busca por imagem não fica um pouco pior colocado, ele
 * cai para o fim da estante, que é o que um filtro faz no mundo real.
 */
export const scoreOf = (result: ResultDef, q: QueryState) => {
    const hits = q.terms.filter(term => result.terms.includes(term)).length
    const base = hits * 10 - (q.terms.length - hits) * 3
    return q.filter && result.type !== q.filter ? base - 100 : base
}

export const rankResults = (pool: string[], q: QueryState) =>
    pool
        .map((id, index) => ({ id, index, score: scoreOf(resultOf(id), q) }))
        .sort((a, b) => b.score - a.score || a.index - b.index)

export const rankOf = (pool: string[], q: QueryState, id: string) =>
    rankResults(pool, q).findIndex(item => item.id === id)
