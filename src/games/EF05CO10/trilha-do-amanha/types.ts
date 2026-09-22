export type Momento = 'agora' | 'amanha'

export type SheetKey = 'invencoes' | 'veiculos' | 'instrumentos' | 'pessoas' | 'pessoas-n2'

// ── nível 1: o recado ───────────────────────────────────────────────

export type Canal = 'som' | 'escrito'

export type InvencaoId = 'megafone' | 'telefone' | 'carta'

export interface Invencao {
    id: InvencaoId
    canal: Canal
    alcance: number
    chegaEm: Momento
    /** Precisa que o outro lado também tenha o aparelho. */
    precisaAparelho: boolean
}

export interface Pessoa {
    id: string
    distancia: number
    escuta: boolean
    temTelefone: boolean
    prazo: Momento
}

// ── nível 2: a encomenda ────────────────────────────────────────────

export type Via = 'estrada' | 'agua' | 'ar'

export type VeiculoId = 'carroca' | 'barco' | 'aviao'

export interface Veiculo {
    id: VeiculoId
    via: Via
    levaPeso: boolean
    chegaEm: Momento
}

export interface Destino {
    id: string
    temEstrada: boolean
    temAgua: boolean
    prazo: Momento
}

export interface Encomenda {
    nome: string
    pesada: boolean
    /** A coluna em `encomendas.png`. */
    coluna: number
}

// ── nível 3: a pergunta ─────────────────────────────────────────────

export type InstrumentoId = 'luneta' | 'lupa' | 'detector' | 'celular'

export interface Instrumento {
    id: InstrumentoId
    /** Encurta a distância. */
    alcanca: boolean
    /** Aumenta o que é miúdo. */
    amplia: boolean
    /** Atravessa o que cobre. */
    atravessa: boolean
}

export interface Alvo {
    id: string
    distante: boolean
    miudo: boolean
    coberto: boolean
}

// ── o que os três níveis têm em comum ───────────────────────────────

export type MotivoFalha =
    | 'longe'
    | 'naoEscuta'
    | 'semTelefone'
    | 'semEstrada'
    | 'semAgua'
    | 'pesado'
    | 'tarde'
    | 'longeDemais'
    | 'pequenoDemais'
    | 'escondido'

export type Entrega =
    | { kind: 'chegou'; quando: Momento }
    | { kind: 'naoChegou'; motivo: MotivoFalha }

export interface Frase {
    texto: string
    certa: boolean
    /** Por que esta não serve. Só as erradas têm. */
    porque?: string
}

/** O que sobe na bancada da oficina: uma invenção no N1, um veículo no N2. */
export interface Item {
    id: string
    nome: string
    /**
     * O que a coisa FAZ, numa linha. Megafone e barco a criança lê no desenho;
     * luneta, lupa e detector, não — e sem isso a escolha vira chute.
     */
    faz?: string
    /**
     * Se ele carrega a coisa na mão, à vista. Os instrumentos do N3 viajam na
     * bolsa: pendurados no ar ao lado dele, eles leem como desenho solto.
     */
    naMao?: boolean
    sheet: SheetKey
    /** A grade da folha. A dos instrumentos tem quatro colunas. */
    cols: number
    rows: number
    coluna: number
    cor: number
    placa: number
}

/** Quem espera na outra margem, e onde ele mora na folha. */
export interface Quem {
    id: string
    nome: string
    sheet: SheetKey
    linha: number
    x: number
    /** A folha veio virada para a esquerda e precisa ser espelhada. */
    flip: boolean
    /** A folha veio com a resposta na primeira coluna. */
    estadoTrocado: boolean
}

export interface Fase {
    id: string
    /** O enunciado curto do cabeçalho. */
    titulo: string
    /** O que ele tenta na abertura, e que não chega. */
    abertura: string
    /** A linha da oficina: o que lembrar na hora de escolher. */
    lembrete: string
    /** A linha de `ceu.png`: a hora do dia desta fase. */
    ceu: number
    quem: Quem
    itens: Item[]
    /** O quadro de `destinos.png` desenhado na outra margem. Só o N2 tem. */
    destino?: number
    /** O que precisa chegar inteiro. Só o N2 tem. */
    encomenda?: Encomenda
    /** O quadro de `visoes.png` que o visor revela. Só o N3 tem. */
    visao?: number
    /**
     * A pergunta que a pessoa faz antes de tudo. É ela que dá o enunciado: sem
     * ela o menino reclama de uma semente que a criança nem sabe que existe.
     */
    pergunta?: string
    /** Onde está o que precisa ser visto. */
    alvoOnde?: 'mao' | 'chao' | 'longe'
    /**
     * O rio sai de cena. No N3 o que impede não é o corpo, é o olho — água no
     * meio só conta uma história que não é a da fase.
     */
    semRio?: boolean
    /** A conta do nível, já amarrada nesta fase. */
    julgar: (itemId: string) => Entrega
    falaChegou: Partial<Record<Momento, string>>
    falaFalhou: Partial<Record<MotivoFalha, string>>
    frases: Record<string, Frase[]>
}

export interface LevelDef {
    level: number
    nome: string
    fases: Fase[]
}

export type Modo = 'abertura' | 'andando' | 'oficina' | 'entregando' | 'frase' | 'pausado' | 'fim'

export interface Solid {
    x: number
    y: number
    w: number
}
