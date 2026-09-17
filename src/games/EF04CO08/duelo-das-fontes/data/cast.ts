import type { Neighbour } from '../types'

/** Frames da folha `icones.png`, em grade 6 × 5. A ordem é contrato. */
export const ICON = {
    jornal: 0,
    prefeitura: 1,
    grupo: 2,
    saude: 3,
    cantina: 4,
    tempo: 5,

    quadra: 6,
    neve: 7,
    foguete: 8,
    refri: 9,
    posto: 10,
    jacare: 11,

    ponte: 12,
    guardachuva: 13,
    museu: 14,
    bola: 15,
    ferramenta: 16,
    tenis: 17,

    boia: 18,
    termometro: 19,
    ventilador: 20,
    mochila: 21,
    prancheta: 22,
    olho: 23,

    agua: 24,
    seringa: 25,
    obra: 26,
    chuva: 27,
    ingresso: 28,
    orelha: 29,
} as const

/** Frames da folha `vizinhos.png`, em grade 3 × 2. */
export const BUST_FRAME: Record<string, number> = {
    nina: 0,
    beto: 1,
    ze: 2,
    rita: 3,
    caco: 4,
    sol: 5,
}

export const NINA: Neighbour = {
    id: 'nina', name: 'Nina', icon: ICON.jornal, firsthand: true,
    intro: 'Eu escrevo o jornal da escola.',
}
export const BETO: Neighbour = {
    id: 'beto', name: 'Beto', icon: ICON.prefeitura, firsthand: true,
    intro: 'Eu cuido dos avisos da cidade.',
}
/**
 * O Zé é o único que NÃO viu nada do que conta — ele repassa o que leu no grupo.
 * O ícone dele é a ORELHA, e é por isso: o que ele levanta na plaquinha quando
 * não sabe do assunto é a própria orelha. Quando ele "confirma", a plaquinha
 * mostra o celular — de onde a coisa veio, e não onde ela aconteceu.
 */
export const ZE: Neighbour = {
    id: 'ze', name: 'Zé', icon: ICON.orelha, firsthand: false,
    intro: 'Eu escuto tudo no grupo do bairro.',
}

export const RITA: Neighbour = {
    id: 'rita', name: 'Rita', icon: ICON.saude, firsthand: true,
    intro: 'Eu atendo no posto de saúde.',
}
export const CACO: Neighbour = {
    id: 'caco', name: 'Caco', icon: ICON.cantina, firsthand: true,
    intro: 'Eu faço a comida da cantina.',
}
export const SOL: Neighbour = {
    id: 'sol', name: 'Sol', icon: ICON.tempo, firsthand: true,
    intro: 'Eu vejo a previsão do tempo.',
}

export const byId = (list: Neighbour[]): Record<string, Neighbour> =>
    Object.fromEntries(list.map(n => [n.id, n]))
