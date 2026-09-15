import { ART_FRAME, PEOPLE } from './art'
import type { Editor, Exigencia, Fase, Ferramenta, LevelDef, Medida, Peca } from '../types'

/**
 * ── A REGRA É FUNÇÃO, NUNCA GABARITO ─────────────────────────────────────
 *
 * Nenhuma fase guarda a resposta. O que ela guarda é o que o CLIENTE sente, e o
 * veredito é calculado da peça no instante em que a criança entrega.
 *
 * Cada NÍVEL também tem `regras`: o que vale para qualquer peça daquele editor.
 * São elas que impedem resolver no tapa — apertar todos os botões sempre quebra
 * pelo menos uma. Uma fase pode não ter exigência própria: aí o problema dela é
 * uma regra do editor que a peça chega violando.
 */

export const NOME: Record<Ferramenta, string> = {
    letra: 'LETRA',
    forte: 'FORTE',
    meio: 'MEIO',
    dividir: 'DIVIDIR',
    imagem: 'FOTO',
    girar: 'GIRAR',
    legenda: 'LEGENDA',
    som: 'SOM',
}

/** O modelo cheio, para cada fase só dizer o que é diferente nela. */
const BASE: Peca = {
    editor: 'texto',
    titulo: '',
    frase: '',
    imagem: ART_FRAME.teatro,
    tamanho: 1,
    forte: false,
    centro: false,
    texto: [],
    dividido: false,
    comFoto: false,
    deitado: false,
    legenda: false,
    som: 2,
}

/* ─────────────────────────────── o slide que está no telão, a partir do estado */

/**
 * O telão mostra UM slide, como numa apresentação de verdade.
 *
 * DIVIDIR manda a segunda metade das frases para um slide novo — o que fica à
 * vista é a primeira metade, e as bolinhas no alto do slide contam quantos
 * slides existem agora.
 */
export function frasesDoSlide(peca: Peca): string[] {
    if (!peca.dividido) return peca.texto
    return peca.texto.slice(0, Math.ceil(peca.texto.length / 2))
}

export const totalDeSlides = (peca: Peca) => (peca.dividido ? 2 : 1)

/** Slide com uma frase só é slide que não valia a pena existir. */
export const slideVazio = (peca: Peca) => frasesDoSlide(peca).length <= 1

/* ──────────────────────────────────────────────── as regras de cada editor */

const REGRAS_TEXTO: Exigencia[] = [
    {
        queixa: 'A palavra não cabe no cartaz!',
        atendida: (_peca: Peca, medida: Medida) => medida.tituloCabe,
        aponta: 'letra',
    },
]

/*
 * TRÊS QUEIXAS, PORQUE SÃO TRÊS CAUSAS.
 *
 * A primeira versão tinha uma frase só — "não cabe tudo isso num slide" — para
 * o título grande demais, para o texto comprido e para a foto disputando o
 * espaço do texto. Quem jogava testava combinação atrás de combinação recebendo
 * sempre o mesmo aviso, sem jeito de saber qual das três coisas arrumar.
 *
 * As duas do meio são complementares de propósito: sem foto o culpado é o
 * texto; com foto, são os dois brigando pelo mesmo espaço, e aí é a foto que o
 * bilhete cita, porque foi ela que chegou por último.
 */
const REGRAS_SLIDES: Exigencia[] = [
    {
        queixa: 'O título não cabe na linha!',
        atendida: (_peca: Peca, medida: Medida) => medida.tituloCabe,
        aponta: 'letra',
    },
    {
        queixa: 'O texto não termina dentro do slide!',
        atendida: (peca, medida) => medida.textoCabe || peca.comFoto,
        aponta: 'dividir',
    },
    {
        queixa: 'A foto e todo esse texto não cabem juntos.',
        atendida: (peca, medida) => medida.textoCabe || !peca.comFoto,
        aponta: 'imagem',
    },
    {
        queixa: 'Assim o slide fica vazio demais.',
        atendida: peca => !slideVazio(peca),
        aponta: 'dividir',
    },
]

const REGRAS_VIDEO: Exigencia[] = [
    {
        queixa: 'O vídeo está deitado!',
        atendida: peca => !peca.deitado,
        aponta: 'girar',
    },
    {
        queixa: 'A música está tapando a voz.',
        atendida: peca => peca.som <= 2,
        aponta: 'som',
    },
]

/* ─────────────────────────────────────────────────────────────── os níveis */

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Oficina do cartaz',
        closing: 'Você mexeu na ferramenta e o cartaz ficou do jeito que pediram.',
        editor: 'texto',
        ferramentas: ['letra', 'forte', 'meio'],
        regras: REGRAS_TEXTO,
        fases: [
            {
                id: 'me1-1',
                cliente: PEOPLE.teo,
                pedido: 'Ninguém consegue ler o meu cartaz!',
                peca: {
                    ...BASE,
                    editor: 'texto',
                    titulo: 'TEM TEATRO!',
                    frase: 'Sexta, às 15h, no pátio da escola.',
                    imagem: ART_FRAME.teatro,
                },
                exigencias: [
                    {
                        queixa: 'Ainda não dá pra ler.',
                        atendida: peca => peca.tamanho >= 3,
                        aponta: 'letra',
                    },
                ],
                elogio: 'Agora sim! Dá pra ler de longe.',
            },
            {
                id: 'me1-2',
                cliente: PEOPLE.bia,
                pedido: 'O meu título some no desenho.',
                peca: {
                    ...BASE,
                    editor: 'texto',
                    titulo: 'CUIDADO: HORTA',
                    frase: 'As mudas são pequenas. Não pise!',
                    imagem: ART_FRAME.horta,
                    tamanho: 3,
                    centro: true,
                },
                exigencias: [
                    {
                        queixa: 'O título continua fraquinho.',
                        atendida: peca => peca.forte,
                        aponta: 'forte',
                    },
                ],
                elogio: 'Agora ele aparece de verdade!',
            },
            {
                id: 'me1-3',
                cliente: PEOPLE.zila,
                pedido: 'Está tudo torto e miúdo no cantinho.',
                peca: {
                    ...BASE,
                    editor: 'texto',
                    titulo: 'FESTA JUNINA',
                    frase: 'Sábado, no pátio. Traga a família!',
                    imagem: ART_FRAME.festa,
                },
                exigencias: [
                    {
                        queixa: 'De longe ainda não dá pra ler.',
                        atendida: peca => peca.tamanho >= 3,
                        aponta: 'letra',
                    },
                    {
                        queixa: 'Ainda está tudo encostado no canto.',
                        atendida: peca => peca.centro,
                        aponta: 'meio',
                    },
                ],
                elogio: 'Ficou bonito e bem no meio!',
            },
        ],
    },

    {
        level: 2,
        title: 'Oficina dos slides',
        closing: 'Slide bom é slide que a turma lê de relance.',
        editor: 'slides',
        ferramentas: ['letra', 'dividir', 'imagem'],
        regras: REGRAS_SLIDES,
        fases: [
            {
                id: 'me2-1',
                cliente: PEOPLE.bia,
                pedido: 'Esse slide não acaba mais!',
                peca: {
                    ...BASE,
                    editor: 'slides',
                    titulo: 'O FEIJÃO',
                    frase: '',
                    imagem: ART_FRAME.feijao,
                    tamanho: 3,
                    texto: [
                        'Pegue um copo.',
                        'Ponha algodão dentro.',
                        'Coloque o feijão.',
                        'Molhe todo dia.',
                        'Deixe perto da janela.',
                        'Espere ele brotar.',
                    ],
                },
                exigencias: [],
                elogio: 'Agora cabe, e a turma lê até o fim!',
            },
            {
                id: 'me2-2',
                cliente: PEOPLE.zila,
                pedido: 'A turma quer VER a horta, não só ler.',
                peca: {
                    ...BASE,
                    editor: 'slides',
                    titulo: 'A HORTA',
                    frase: '',
                    imagem: ART_FRAME.horta,
                    tamanho: 3,
                    texto: ['A nossa horta cresceu.', 'Olha como ela ficou!'],
                },
                exigencias: [
                    {
                        queixa: 'Continua só palavra, sem nada pra ver.',
                        atendida: peca => peca.comFoto,
                        aponta: 'imagem',
                    },
                ],
                elogio: 'Com a foto todo mundo entende na hora!',
            },
            {
                id: 'me2-3',
                cliente: PEOPLE.teo,
                pedido: 'Lá do fundo ninguém lê esse slide!',
                peca: {
                    ...BASE,
                    editor: 'slides',
                    titulo: 'O PASSEIO',
                    frase: '',
                    imagem: ART_FRAME.trilha,
                    tamanho: 1,
                    texto: [
                        'Fomos de ônibus.',
                        'Subimos a trilha.',
                        'Achamos uma cachoeira.',
                        'Comemos na sombra.',
                        'Voltamos cansados.',
                        'Foi o melhor dia!',
                    ],
                },
                exigencias: [
                    {
                        queixa: 'O título continua miudinho.',
                        atendida: peca => peca.tamanho >= 3,
                        aponta: 'letra',
                    },
                ],
                elogio: 'Grande e curtinho. Ficou perfeito!',
            },
        ],
    },

    {
        level: 3,
        title: 'Oficina do vídeo',
        closing: 'Vídeo bom é o que dá pra ver e ouvir até o fim.',
        editor: 'video',
        ferramentas: ['girar', 'legenda', 'som'],
        regras: REGRAS_VIDEO,
        fases: [
            {
                id: 'me3-1',
                cliente: PEOPLE.bia,
                pedido: 'Filmei sem querer virada!',
                peca: {
                    ...BASE,
                    editor: 'video',
                    titulo: 'PARABÉNS, VOVÓ!',
                    frase: 'Um beijo da Bia.',
                    imagem: ART_FRAME.bolo,
                    deitado: true,
                    legenda: false,
                    som: 2,
                },
                exigencias: [],
                elogio: 'Agora dá pra ver em pé!',
            },
            {
                id: 'me3-2',
                cliente: PEOPLE.teo,
                pedido: 'A minha vó é surda. Mas sabe ler',
                peca: {
                    ...BASE,
                    editor: 'video',
                    titulo: 'RECADO PRA VOVÓ',
                    frase: 'Saudade! Beijo do Téo.',
                    imagem: ART_FRAME.bolo,
                    som: 2,
                },
                exigencias: [
                    {
                        queixa: 'Ela ainda não tem como acompanhar a fala.',
                        atendida: peca => peca.legenda,
                        aponta: 'legenda',
                    },
                ],
                elogio: 'Com a legenda ela acompanha tudo!',
            },
            {
                id: 'me3-3',
                cliente: PEOPLE.vovo,
                pedido: 'Preciso ouvir e ler! E a musica tá alta!',
                peca: {
                    ...BASE,
                    editor: 'video',
                    titulo: 'A TRILHA DA TURMA',
                    frase: 'Olha o que a gente achou!',
                    imagem: ART_FRAME.trilha,
                    som: 3,
                },
                exigencias: [
                    {
                        queixa: 'Assim eu me perco no que vocês falam.',
                        atendida: peca => peca.legenda,
                        aponta: 'legenda',
                    },
                ],
                elogio: 'Agora escuto vocês e ainda leio!',
            },
        ],
    },
]

export const TOTAL_FASES = LEVELS.reduce((soma, nivel) => soma + nivel.fases.length, 0)

/** Tudo que ainda incomoda, na ordem em que o bilhete vai falar. */
export const pendencias = (peca: Peca, fase: Fase, regras: Exigencia[], medida: Medida): Exigencia[] =>
    [...fase.exigencias, ...regras].filter(exigencia => !exigencia.atendida(peca, medida))

export const pointsFor = (travou: boolean) => (travou ? 5 : 10)

/** O toque numa ferramenta: um passo, e sempre com volta. */
export function aplicar(peca: Peca, ferramenta: Ferramenta): Peca {
    switch (ferramenta) {
        case 'letra':
            return { ...peca, tamanho: peca.tamanho >= 4 ? 1 : ((peca.tamanho + 1) as Peca['tamanho']) }
        case 'forte':
            return { ...peca, forte: !peca.forte }
        case 'meio':
            return { ...peca, centro: !peca.centro }
        case 'dividir':
            return { ...peca, dividido: !peca.dividido }
        case 'imagem':
            return { ...peca, comFoto: !peca.comFoto }
        case 'girar':
            return { ...peca, deitado: !peca.deitado }
        case 'legenda':
            return { ...peca, legenda: !peca.legenda }
        case 'som':
            return { ...peca, som: peca.som >= 3 ? 1 : ((peca.som + 1) as Peca['som']) }
    }
}

/**
 * O que a bancada acende de âmbar.
 *
 * Só os liga-desliga em que ligado quer dizer "pus uma coisa a mais". `girar`,
 * `letra` e `som` não acendem: neles o estado é a FIGURA do botão, e acender
 * diria que estar ligado é o certo — o que nem sempre é verdade.
 */
export function aceso(peca: Peca, ferramenta: Ferramenta): boolean {
    if (ferramenta === 'forte') return peca.forte
    if (ferramenta === 'meio') return peca.centro
    if (ferramenta === 'imagem') return peca.comFoto
    if (ferramenta === 'legenda') return peca.legenda
    if (ferramenta === 'dividir') return peca.dividido
    return false
}

/**
 * Conferências que só quem monta os dados pode errar.
 *
 * A mais importante é a última: uma fase que já nasce resolvida seria entregue
 * sem a criança tocar em nada, e ninguém perceberia lendo o código.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problemas: string[] = []
    const nomes = Object.values(NOME)
    const editores = new Set<Editor>()

    levels.forEach(nivel => {
        if (!nivel.fases.length) problemas.push(`nível ${nivel.level} sem fases`)
        if (nivel.fases.length > 5) problemas.push(`nível ${nivel.level} com mais de 5 fases`)
        if (nivel.ferramentas.length > 3) problemas.push(`nível ${nivel.level} com mais de 3 ferramentas`)
        if (editores.has(nivel.editor)) problemas.push(`editor ${nivel.editor} repetido`)
        editores.add(nivel.editor)

        const todas = [...nivel.regras, ...nivel.fases.flatMap(fase => fase.exigencias)]
        todas.forEach(exigencia => {
            if (!exigencia.queixa.trim()) problemas.push(`nível ${nivel.level}: queixa vazia`)
            const alvo = exigencia.queixa.toUpperCase()
            if (nomes.some(nome => alvo.includes(nome))) {
                problemas.push(`nível ${nivel.level}: a queixa "${exigencia.queixa}" nomeia uma ferramenta`)
            }
            if (!nivel.ferramentas.includes(exigencia.aponta)) {
                problemas.push(`nível ${nivel.level}: aponta para ferramenta que a bancada não tem`)
            }
        })

        nivel.fases.forEach(fase => {
            if (fase.peca.editor !== nivel.editor) problemas.push(`${fase.id}: peça de outro editor`)
            /*
             * A conferência tem de olhar as DUAS medidas possíveis.
             *
             * `cabe` só se sabe com a peça desenhada, e aqui ninguém desenhou
             * nada. Assumindo que cabe, toda fase cujo único problema é o texto
             * que transborda — a 2.1 é assim — seria acusada de já começar
             * pronta. Fase de verdade resolvida não tem pendência em nenhuma das
             * duas; a conferência com a medida REAL é a do `startFase`.
             */
            const comFolga = pendencias(fase.peca, fase, nivel.regras, { tituloCabe: true, textoCabe: true })
            const semFolga = pendencias(fase.peca, fase, nivel.regras, { tituloCabe: false, textoCabe: false })
            if (!comFolga.length && !semFolga.length) {
                problemas.push(`${fase.id}: a peça já começa pronta`)
            }
        })
    })

    return problemas
}
