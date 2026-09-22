import type { Ferramenta } from '../types'

/**
 * O baralho. Dois atributos mandam no veredito — o que ela faz (`avisa`) e até
 * onde ela chega (`raio`) —, e nenhum dos dois é escrito na carta: o `raio` vira
 * o anel desenhado em volta do desenho, e o resto sai de saber o que a coisa é.
 *
 * `frame` é o índice em `ferramentas.png`, e é contrato com a folha. `frente`
 * é para que lado o DESENHO olha: quem anda vira para o rumo da viagem, senão
 * o carro de som atravessa a vila inteira de ré.
 *
 * Os três raios plantados cresceram junto com o mapa (a vila foi de 2560 para
 * 3600 px). Eles não são números soltos: cada um encosta num aglomerado e para
 * — quadro na praça, telão na praça mais a casa de cima, sino no meio da vila.
 */
export const FERRAMENTAS: Ferramenta[] = [
    {
        id: 'carro',
        frente: 'esquerda',
        nome: 'carro de som',
        frame: 0,
        avisa: true,
        raio: 150,
        andar: 'estrada',
        sol: 8,
        gasta: true,
    },
    {
        id: 'bicicleta',
        frente: 'direita',
        nome: 'bicicleta',
        frame: 1,
        avisa: true,
        raio: 95,
        andar: 'estrada',
        sol: 5,
        gasta: true,
    },
    {
        id: 'porta',
        nome: 'bater na porta',
        frame: 2,
        avisa: true,
        raio: 90,
        andar: 'estrada',
        sol: 5,
        gasta: false,
    },
    {
        id: 'bilhete',
        frente: 'direita',
        nome: 'levar bilhete',
        frame: 3,
        avisa: true,
        raio: 90,
        andar: 'estrada',
        sol: 4,
        gasta: true,
        so: 'uma-casa',
    },
    {
        id: 'drone',
        frente: 'esquerda',
        nome: 'drone',
        frame: 4,
        avisa: true,
        raio: 110,
        andar: 'voo',
        sol: 5,
        gasta: true,
    },
    {
        id: 'telao',
        nome: 'telão',
        frame: 5,
        avisa: true,
        raio: 380,
        andar: 'planta',
        sol: 0,
        gasta: true,
        planta: 'praca',
    },
    {
        id: 'sino',
        nome: 'sino da igreja',
        frame: 6,
        avisa: true,
        raio: 430,
        andar: 'planta',
        sol: 0,
        gasta: false,
        planta: 'igreja',
    },
    {
        id: 'quadro',
        nome: 'quadro de avisos',
        frame: 7,
        avisa: true,
        raio: 175,
        andar: 'planta',
        sol: 0,
        gasta: false,
        planta: 'praca',
    },
    {
        id: 'radio',
        nome: 'rádio da vila',
        frame: 8,
        avisa: true,
        raio: 0,
        andar: 'planta',
        sol: 0,
        gasta: false,
        planta: 'praca',
    },
    {
        id: 'celular',
        nome: 'grupo no celular',
        frame: 9,
        avisa: true,
        raio: 0,
        andar: 'planta',
        sol: 0,
        gasta: false,
        planta: 'praca',
    },
    {
        id: 'impressora',
        nome: 'impressora',
        frame: 10,
        avisa: false,
        raio: 0,
        andar: 'planta',
        sol: 0,
        gasta: true,
        planta: 'praca',
    },
    {
        id: 'palpite',
        nome: 'palpite do vizinho',
        frame: 11,
        avisa: false,
        raio: 0,
        andar: 'planta',
        sol: 0,
        gasta: false,
        planta: 'praca',
    },
]

export const FERRAMENTA_POR_ID: Record<string, Ferramenta> = Object.fromEntries(
    FERRAMENTAS.map(f => [f.id, f]),
)

export const ferramenta = (id: string): Ferramenta => {
    const f = FERRAMENTA_POR_ID[id]
    if (!f) throw new Error(`[kit] ferramenta desconhecida: ${id}`)
    return f
}

/** O que o vizinho responde quando a ferramenta nem sai da mesa. */
export const NAO_AVISA: Record<string, string> = {
    impressora: 'Faz o papel bonito. Só que papel não anda sozinho até lá.',
    palpite: 'Achar que a gente sabe não é a mesma coisa que a gente saber.',
}
