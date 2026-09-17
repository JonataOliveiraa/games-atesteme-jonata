import type { Atributo, Criatura, Frase, Lane, Termo } from '../types'

/**
 * As oito, na ordem dos quadros da folha. A combinação é FIXA por criaturinha:
 * uma que trocasse de atributo entre ondas destruiria a comparação que o jogo
 * inteiro depende — a mesma turma passando por duas placas diferentes.
 *
 * Conferido quadro a quadro contra `criaturinhas.png` em 17/09/2026.
 */
export const CRIATURAS: Criatura[] = [
    { id: 'bibi', nome: 'Bibi', frame: 0, cor: 'azul', chapeu: true, oculos: false, pequena: false },
    { id: 'tuto', nome: 'Tuto', frame: 1, cor: 'azul', chapeu: false, oculos: true, pequena: true },
    { id: 'zeca', nome: 'Zeca', frame: 2, cor: 'azul', chapeu: true, oculos: true, pequena: true },
    { id: 'mila', nome: 'Mila', frame: 3, cor: 'verde', chapeu: false, oculos: false, pequena: false },
    { id: 'nino', nome: 'Nino', frame: 4, cor: 'verde', chapeu: true, oculos: false, pequena: true },
    { id: 'pipa', nome: 'Pipa', frame: 5, cor: 'vermelha', chapeu: false, oculos: true, pequena: false },
    { id: 'lele', nome: 'Lelê', frame: 6, cor: 'vermelha', chapeu: true, oculos: false, pequena: true },
    { id: 'dudu', nome: 'Dudu', frame: 7, cor: 'verde', chapeu: false, oculos: true, pequena: false },
]

const BY_ID = new Map(CRIATURAS.map(c => [c.id, c]))

export const criaturaDe = (id: string): Criatura => {
    const found = BY_ID.get(id)
    if (!found) throw new Error(`[portoes-logicos] criaturinha desconhecida: ${id}`)
    return found
}

/** A sentença crua: este atributo vale para esta criaturinha? */
export function tem(c: Criatura, atributo: Atributo): boolean {
    switch (atributo) {
        case 'azul':
        case 'verde':
        case 'vermelha':
            return c.cor === atributo
        case 'chapeu':
            return c.chapeu
        case 'oculos':
            return c.oculos
        case 'pequena':
            return c.pequena
    }
}

export const valeTermo = (t: Termo, c: Criatura) =>
    t.negado ? !tem(c, t.atributo) : tem(c, t.atributo)

/** O valor verdade da frase inteira para esta criaturinha. */
export function avaliar(f: Frase, c: Criatura): boolean {
    const l = valeTermo(f.left, c)
    if (!f.op || !f.right) return l
    const r = valeTermo(f.right, c)
    return f.op === 'e' ? l && r : l || r
}

/**
 * O portão certo, derivado — nunca guardado nos dados.
 *
 * A placa de baixo é a negação da de cima, então isto é TOTAL: para qualquer
 * criaturinha e qualquer frase existe exatamente um portão verdadeiro. Um
 * gabarito congelado em tabela seria uma cópia que envelhece na primeira vez
 * que alguém mexer numa criaturinha.
 */
export const portaoCerto = (f: Frase, c: Criatura): Lane => (avaliar(f, c) ? 'cima' : 'baixo')
