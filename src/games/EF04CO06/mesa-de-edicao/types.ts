/**
 * Mesa de Edição — EF04CO06.
 *
 * A mecânica inteira cabe em três linhas:
 *
 *      alguém traz uma peça torta   →   e diz o que incomoda, nunca qual botão
 *      a criança aperta as FERRAMENTAS do editor  →   a peça muda na hora
 *      só ENTREGAR compromete       →   mexer é de graça, e é o que a habilidade pede
 *
 * O conteúdo nunca é escolhido: ele já está lá. O que a criança decide é qual
 * RECURSO do editor aplicar — e apertar tudo no máximo estraga a peça.
 *
 * Um nível é um EDITOR: texto, slides, vídeo. Mesmos três botões na mesma
 * bancada, ferramentas diferentes dentro deles.
 */

export type Editor = 'texto' | 'slides' | 'video'

export type Passo = 1 | 2 | 3 | 4

/** Quanto de música por cima da voz: 1 sem música, 2 baixinha, 3 alta. */
export type Som = 1 | 2 | 3

export type Ferramenta =
    | 'letra'
    | 'forte'
    | 'meio'
    | 'dividir'
    | 'imagem'
    | 'girar'
    | 'legenda'
    | 'som'

/**
 * O estado da peça. Tudo que a criança muda mora aqui.
 *
 * É um registro só para os três editores, e não três tipos: o que muda de um
 * nível para o outro são os campos que aquela bancada alcança, e um registro
 * plano deixa `aplicar` e as regras serem funções simples.
 */
export interface Peca {
    editor: Editor
    titulo: string
    frase: string
    /** Índice do quadro na folha do acervo. */
    imagem: number

    /* editor de texto */
    tamanho: Passo
    forte: boolean
    centro: boolean

    /* editor de slides */
    /** As frases do slide, uma por linha. DIVIDIR passa metade para o slide seguinte. */
    texto: string[]
    dividido: boolean
    comFoto: boolean

    /* editor de vídeo */
    deitado: boolean
    legenda: boolean
    som: Som
}

/**
 * O que só se sabe olhando a peça DESENHADA.
 *
 * Sai das medidas reais na tela, não de uma conta com o número de letras: a
 * fonte é que decide, e é ela que a criança está vendo.
 *
 * São DUAS medidas, e não uma, porque o bilhete precisa dizer QUAL coisa não
 * coube. Uma medida só dava a mesma frase para o título grande demais, para o
 * texto comprido e para a foto disputando espaço — e quem joga testava tudo
 * recebendo sempre o mesmo aviso.
 */
export interface Medida {
    /** O título termina dentro da peça. */
    tituloCabe: boolean
    /** O corpo do texto termina dentro da peça. Sempre verdadeiro onde não há corpo. */
    textoCabe: boolean
}

/**
 * O que o cliente quer, dito pelo que ELE sente.
 *
 * A queixa nunca nomeia uma ferramenta — senão a fase vira procurar figurinha.
 * `aponta` existe só para o pulso depois do segundo erro.
 */
export interface Exigencia {
    queixa: string
    atendida: (peca: Peca, medida: Medida) => boolean
    aponta: Ferramenta
}

export interface Fase {
    id: string
    /** Quadro do cliente na folha de pessoas (o parado; o feliz é +4). */
    cliente: number
    pedido: string
    peca: Peca
    /** O que ESTA encomenda pede. Pode ser vazio quando o problema é uma regra do editor. */
    exigencias: Exigencia[]
    elogio: string
}

export interface LevelDef {
    level: number
    title: string
    closing: string
    editor: Editor
    /** Quais botões esta bancada tem, na ordem em que aparecem. */
    ferramentas: Ferramenta[]
    /** O que vale para toda peça deste editor — inclusive o estrago de apertar demais. */
    regras: Exigencia[]
    fases: Fase[]
}

/**
 * O estado que governa toque, animação e pausa.
 *
 *   editando    a criança mexe à vontade; nada é cobrado
 *   entregando  a peça está voando até o cliente
 *   travado     voltou com bilhete: o ENTREGAR só destrava mexendo
 */
export type Mode = 'editando' | 'entregando' | 'travado' | 'fim'
