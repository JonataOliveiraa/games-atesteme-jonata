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
 * ── E A CONSEQUÊNCIA ACONTECE COM O ARQUIVO ──────────────────────────────
 *
 * A habilidade pede "ver impacto no ambiente digital". Um cartão de texto
 * dizendo o que aconteceu não é impacto: é boletim. Aqui cada escolha MEXE na
 * ficha — o crédito é carimbado, a autoria se solta e cai, as cópias escapam
 * pelas bordas da tela, a pasta fecha com cadeado, o arquivo se desfaz em
 * pixels. A frase explica depois o que os olhos já viram.
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

/**
 * O que a escolha FAZ com o arquivo.
 *
 * Doze gestos, e nenhum deles é "certo" ou "errado" por si: quem decide isso é
 * o `certa` da ação, que também escolhe a cor. Carimbar o crédito com o nome
 * do autor e carimbar com o nome errado são o mesmo gesto — o que muda é se o
 * carimbo cola ou escorrega da ficha.
 *
 * É o que evita doze animações virarem vinte e quatro.
 */
export type Efeito =
    /** O crédito é carimbado sobre a ficha. */
    | 'credito'
    /** A etiqueta de autoria se solta e cai. */
    | 'semCredito'
    /** Um balão de pergunta sobe até o autor e volta com a resposta. */
    | 'pergunta'
    /** Nada acontece: a ficha esfria e uma ampulheta gira em cima. */
    | 'trava'
    /** Um escudo fecha sobre o arquivo. */
    | 'protege'
    /** O cadeado da etiqueta abre. */
    | 'libera'
    /** Cópias escapam pelas bordas da tela. */
    | 'vaza'
    /** Sai um elo de corrente em vez do arquivo. */
    | 'link'
    /** O arquivo se duplica e a cópia fica para trás. */
    | 'copia'
    /** Uma pasta sobe, cobre o arquivo e o cadeado fecha. */
    | 'cofre'
    /** O arquivo fica largado, e olhos aparecem em volta. */
    | 'solto'
    /** O arquivo se desfaz em pixels. */
    | 'apaga'

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
    /**
     * Chave da textura da arte.
     *
     * Vale para os QUATRO tipos, e não só para imagem: a criança precisa ver
     * que a trilha é de forró e que o documentário é de natureza, não que ela
     * é "um arquivo de música". Quando a arte ainda não está na pasta, entra o
     * ícone do tipo em `Graphics` e o jogo continua inteiro.
     */
    arte?: string
    etiqueta: Etiqueta
}

export interface Acao {
    /**
     * O rótulo, curto.
     *
     * Trinta caracteres é o teto, e não é capricho: três frases longas lado a
     * lado viram tarefa de leitura comparada, que é exatamente o que uma
     * criança de nove anos ainda não faz de graça. A explicação inteira vive
     * no `impacto`, depois da decisão — que é onde ela ensina.
     */
    rotulo: string
    /** Uma só é a certa, em cada passo. */
    certa: boolean
    /** O gesto que acontece com o arquivo. */
    efeito: Efeito
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
