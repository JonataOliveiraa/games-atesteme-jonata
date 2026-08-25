/**
 * Controlador do Sistema — EF05CO07.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  A CRIANÇA É O SISTEMA OPERACIONAL, E A MÁQUINA ESTÁ LIGADA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * ── O QUE A HABILIDADE PEDE ──────────────────────────────────────────────
 *
 * "Reconhecer a NECESSIDADE de um sistema operacional para a execução de
 * programas e gerenciamento do hardware." E a ficha detalha o jogo: *a criança
 * assume o papel do sistema operacional, distribuindo recursos para programas e
 * dispositivos para manter o computador funcionando*; *receber solicitações →
 * gerenciar recurso → liberar ou negar → manter o sistema estável*; no Nível 3,
 * *equilibrar múltiplos pedidos simultâneos e evitar conflitos*.
 *
 * ── O QUE A VERSÃO ANTERIOR FAZIA ────────────────────────────────────────
 *
 * Um teste de múltipla escolha com ícones bonitos: aparecia UM pedido, a
 * criança tocava na peça certa, vinha o próximo. Sem relógio, sem estado que
 * sobrevivesse de um pedido para o outro, sem dois pedidos existirem ao mesmo
 * tempo — e portanto sem conflito nenhum para evitar e sem estabilidade nenhuma
 * para manter. A resposta certa vinha ESCRITA no arquivo de dados, num campo
 * `answer`, o que é a definição de quiz: o jogo não sabia por que a resposta
 * era aquela, só sabia qual era.
 *
 * ── O QUE MUDA AQUI ──────────────────────────────────────────────────────
 *
 * A máquina tem ESTADO e ele roda sozinho. Cada dispositivo está livre, ocupado
 * (com um programa e um tempo que corre) ou desligado. A memória tem um número
 * fixo de blocos e programas abertos ocupam blocos de verdade. Os pedidos
 * chegam numa fila e cada um tem PACIÊNCIA, que escorre.
 *
 * E — o ponto — **não existe campo com a resposta certa**. O que dá para fazer
 * com um pedido é deduzido do estado da máquina naquele instante
 * (`avaliarPedido` em `data/maquina.ts`). É por isso que o mesmo pedido pode ser
 * "libere" agora e "espere" cinco segundos depois: é assim que um sistema
 * operacional funciona, e é isso que a criança precisa sentir.
 */

export type NivelNum = 1 | 2 | 3

/* ═══════════════════════════════════════════════════════ o hardware */

export type DispositivoId =
    | 'teclado'
    | 'mouse'
    | 'monitor'
    | 'arquivos'
    | 'impressora'

export interface DispositivoDef {
    id: DispositivoId
    nome: string
    textura: string
    /** Uma linha, para o balão explicar o que a peça faz. */
    faz: string
}

/**
 * O estado de um dispositivo AGORA.
 *
 * `desligado` vem da fase (a impressora sem energia, por exemplo) e não muda.
 * `ocupado` é consequência do jogo: alguém está usando, e vai liberar sozinho
 * quando o tempo dele acabar.
 */
export interface DispositivoEstado {
    id: DispositivoId
    ligado: boolean
    /** Quem está usando, se alguém estiver. */
    usadoPor?: ProgramaId
    /** Quanto falta para liberar, em ms. */
    restaMs: number
    /** Quanto durava o uso inteiro — para desenhar o anel de progresso. */
    duracaoMs: number
}

/* ═══════════════════════════════════════════════════════ os programas */

export type ProgramaId =
    | 'navegador'
    | 'editor'
    | 'jogo'
    | 'player'
    | 'fotos'
    | 'impressao'

export interface ProgramaDef {
    id: ProgramaId
    nome: string
    textura: string
    /** Quantos blocos de memória ele ocupa quando aberto. */
    blocos: number
    /** A cor dele na barra de memória e no aro do dispositivo que ele usa. */
    cor: number
}

/* ═══════════════════════════════════════════════════════ os pedidos */

/**
 * O que um pedido quer.
 *
 * Só duas coisas, e é de propósito: `usar` uma peça de hardware, ou `abrir` um
 * programa (que é pedir MEMÓRIA). São as duas metades do enunciado da BNCC —
 * gerenciar dispositivos de entrada e saída, e gerenciar memória.
 */
export type Querer =
    | { o: 'usar'; dispositivo: DispositivoId }
    | { o: 'abrir' }

export interface PedidoDef {
    id: string
    programa: ProgramaId
    quer: Querer
    /** A frase que o programa diz. Teto de 52 caracteres (ver a memória). */
    fala: string
    /** Quando ele entra na fila, em ms desde o começo da fase. */
    entraMs: number
    /** Quanto ele aguenta esperar. */
    pacienciaMs: number
    /** Quanto tempo ele segura o dispositivo, se for `usar`. */
    usoMs?: number
}

/**
 * O veredito sobre um pedido, calculado a partir do ESTADO — nunca lido de um
 * campo nos dados.
 *
 *   `liberar`  dá para atender agora
 *   `esperar`  o recurso existe e está bom, mas está ocupado neste instante
 *   `negar`    é impossível, e vai continuar impossível
 *   `fechar`   cabe na memória, mas antes é preciso fechar alguma coisa
 */
export type Veredito = 'liberar' | 'esperar' | 'negar' | 'fechar'

/* ═══════════════════════════════════════════════════════ as fases */

export interface FaseDef {
    id: string
    /** O enunciado do header. */
    objetivo: string
    /** A dica, no balão, enquanto nada acontece. */
    dica: string
    /** Quais peças existem nesta fase, e quais estão desligadas. */
    hardware: Array<{ id: DispositivoId; ligado?: boolean }>
    /** O tamanho da memória. Zero esconde a barra: a fase não é de memória. */
    blocos: number
    /** Programas que já nascem abertos, ocupando memória. */
    jaAbertos?: ProgramaId[]
    pedidos: PedidoDef[]
}

export interface NivelDef {
    nivel: NivelNum
    titulo: string
    objetivo: string
    dica: string
    /** Quanto de estabilidade a fase começa e quanto ela aguenta perder. */
    estabilidade: number
    fases: FaseDef[]
}

/**
 * Em que momento a cena está.
 *
 * `rodando` é o ÚNICO estado em que o relógio da fase anda e em que um toque
 * faz alguma coisa. Os outros três existem para que nenhuma animação, tela de
 * fim ou pausa precise lembrar de desligar meia dúzia de coisas na mão: a
 * checagem é uma só, no começo de cada handler.
 */
export type EstadoCena = 'rodando' | 'pausado' | 'perdido' | 'fim'
