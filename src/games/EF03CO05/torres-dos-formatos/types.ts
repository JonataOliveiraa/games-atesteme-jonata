/**
 * (EF03CO05) Compreender que dados são estruturados em formatos específicos
 * dependendo da informação armazenada.
 *
 * O formato de um arquivo NÃO é um campo escrito nele: é a forma do `payload`.
 * Amostras numa linha do tempo são som; pontos de cor numa grade são imagem;
 * símbolos em sequência são texto; quadros em fila são vídeo. É por isso que
 * `formatOf` lê a estrutura em vez de consultar uma resposta guardada.
 */

export type LevelNumber = 1 | 2 | 3

export type FormatId = 'audio' | 'image' | 'text' | 'video'

export type Payload =
    | { samples: number[] }
    | { pixels: string[][] }
    | { tokens: string[] }
    | { strip: string[] }

export interface FileDef {
    id: string
    /** Quadro de `conteudos`: o QUE está guardado, não como. */
    contentFrame: number
    payload: Payload
    /**
     * NINJA: cai devagar escondido e, no meio do caminho, se revela como um
     * destes. Enquanto não revela, não dá para decidir — e é esse o ponto.
     */
    ninja?: FileDef[]
}

export interface WaveDef {
    id: string
    name: string
    /** As pistas abertas nesta onda, na ordem em que aparecem na tela. */
    lanes: FormatId[]
    files: FileDef[]
    /**
     * Nível 3: no meio da onda as caixas se reorganizam nesta ordem. Ler uma
     * vez deixa de bastar.
     */
    swapTo?: FormatId[]
    swapAfter?: number
}

export interface LevelDef {
    level: LevelNumber
    title: string
    /** A textura de fundo deste nível. Cada nível tem a sua. */
    bg: string
    /** Pixels por segundo da queda. Cresce com o nível, nunca dentro dele. */
    fallSpeed: number
    /**
     * Chance de o arquivo vir com a SEGUNDA cara (megafone, moldura, envelope,
     * fita) em vez da primeira. Cresce por nível: o mesmo formato aparece cada
     * vez mais com outro desenho, e a criança para de decidir pelo bicho.
     */
    skinTwo: number
    waves: WaveDef[]
}

export type Mode = 'ready' | 'falling' | 'landing' | 'locked' | 'closing' | 'done'
