/**
 * Missão Ética Digital — EF04CO07.
 *
 * ── A RESPOSTA NÃO ESTÁ NA CONSCIÊNCIA, ESTÁ NA ETIQUETA ─────────────────
 *
 * O risco deste tema é virar sermão: "qual é a atitude certa?". Criança sente
 * sermão de longe e responde o que o adulto quer ouvir, sem aprender nada.
 *
 * Então aqui a resposta está escrita no arquivo — em quem é o autor, no que a
 * permissão libera, e no aviso de que tem gente na foto. Só que a etiqueta
 * está de COSTAS. A criança pode virar a ficha antes de agir, e pode não
 * virar: os botões estão lá dos dois jeitos.
 *
 * É isso que a habilidade pede de verdade. Postura ética não é acertar por
 * sorte, é conferir ANTES — e o relatório final sabe a diferença.
 */

export type CaseState = 'lendo' | 'impacto' | 'solved'

/**
 * Os quatro princípios do painel.
 *
 * O exemplo da BNCC pede um painel onde os alunos destacam as ações
 * importantes de quando se manipula um dado. Estes são os quatro, e cada
 * decisão do jogo acende exatamente um deles.
 */
export type Principio = 'autoria' | 'permissao' | 'privacidade' | 'guarda'

export type TipoArquivo = 'imagem' | 'musica' | 'video' | 'documento'

/** O que está escrito atrás da ficha. */
export interface Etiqueta {
    autor: string
    permissao: string
    /** O aviso que muda tudo, quando existe. */
    aviso?: string
}

export interface Arquivo {
    nome: string
    tipo: TipoArquivo
    /** Chave da textura — só quando o arquivo é uma imagem. */
    arte?: string
    etiqueta: Etiqueta
}

export interface Acao {
    rotulo: string
    /** Uma só é a certa, em cada passo. */
    certa: boolean
    /**
     * O que acontece no mundo por causa dessa escolha.
     *
     * Vale tanto para a certa quanto para as erradas: "errou" seco mandaria a
     * criança chutar, e o que ensina é a consequência.
     */
    impacto: string
}

/** Uma decisão sobre o arquivo. */
export interface Passo {
    principio: Principio
    situacao: string
    pergunta: string
    acoes: Acao[]
}

export interface Caso {
    id: string
    arquivo: Arquivo
    /**
     * Um passo nos Níveis 1 e 2; DOIS no Nível 3.
     *
     * O segundo passo é o que transforma o jogo em gestão de projeto: guardar
     * e só depois transferir, com a segunda decisão acontecendo em cima do
     * mesmo arquivo que a primeira já mexeu.
     */
    passos: Passo[]
    successLine: string
}

export interface Level {
    level: number
    title: string
    objective: string
    tip: string
    cases: Caso[]
}

/** O que o painel guarda sobre cada princípio, do começo ao fim da partida. */
export interface Marca {
    respeitado: boolean
    alertas: number
}
