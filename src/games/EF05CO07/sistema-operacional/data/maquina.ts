import type {
    DispositivoDef, DispositivoEstado, DispositivoId,
    FaseDef, PedidoDef, ProgramaDef, ProgramaId, Veredito,
} from '../types'

/**
 * A MÁQUINA — o catálogo e as regras.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  ESTE ARQUIVO É O QUE SEPARA UM SIMULADOR DE UM QUIZ
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Na versão anterior cada pedido carregava um campo `answer` com a peça certa.
 * O jogo não sabia POR QUE aquela era a resposta — ele só sabia comparar. E um
 * jogo que só compara não tem como ter conflito, nem espera, nem "agora não dá,
 * daqui a pouco dá": as três coisas que a habilidade pede.
 *
 * Aqui não existe campo de resposta em lugar nenhum de `casos.ts`. O que dá
 * para fazer com um pedido sai de `avaliarPedido(pedido, maquina)`, lido do
 * estado NAQUELE INSTANTE. O mesmo pedido, com as mesmas letras, é "libere"
 * quando a impressora está livre e "espere" cinco segundos depois. É por isso
 * que dá para errar por pressa e acertar por paciência — e é isso que um
 * sistema operacional é.
 */

/* ═══════════════════════════════════════════════════════ o hardware */

export const DISPOSITIVOS: Record<DispositivoId, DispositivoDef> = {
    teclado: {
        id: 'teclado', nome: 'Teclado', textura: 'recurso-teclado',
        faz: 'Recebe o que você digita.',
    },
    mouse: {
        id: 'mouse', nome: 'Mouse', textura: 'recurso-mouse',
        faz: 'Move o ponteiro e clica.',
    },
    monitor: {
        id: 'monitor', nome: 'Monitor', textura: 'recurso-monitor',
        faz: 'Mostra as coisas na tela.',
    },
    arquivos: {
        id: 'arquivos', nome: 'Arquivos', textura: 'recurso-arquivos',
        faz: 'Guarda e busca os arquivos.',
    },
    impressora: {
        id: 'impressora', nome: 'Impressora', textura: 'recurso-impressora',
        faz: 'Imprime no papel.',
    },
}

/** A ordem em que as peças aparecem na fileira, sempre a mesma. */
export const ORDEM_HARDWARE: DispositivoId[] = [
    'teclado', 'mouse', 'monitor', 'arquivos', 'impressora',
]

/* ═══════════════════════════════════════════════════════ os programas */

/**
 * `blocos` é o peso do programa na memória, e ele é a única coisa que separa
 * um programa do outro nas contas.
 *
 * O JOGO pesa 5, e isso é de propósito: é o programa que a criança já sabe, na
 * vida dela, que "trava tudo". Num computador de 4 blocos ele não cabe NUNCA —
 * e é esse o único caso em que a resposta certa é negar um pedido de memória
 * que não está aberto. A criança não precisa decorar a regra: ela lê 5 no
 * selo do programa, lê 4 na régua da memória, e resolve.
 */
export const PROGRAMAS: Record<ProgramaId, ProgramaDef> = {
    navegador: {
        id: 'navegador', nome: 'Navegador', textura: 'programa-navegador',
        blocos: 2, cor: 0x4dabf7,
    },
    editor: {
        id: 'editor', nome: 'Editor', textura: 'programa-editor',
        blocos: 2, cor: 0xffa94d,
    },
    jogo: {
        id: 'jogo', nome: 'Jogo', textura: 'programa-jogo',
        blocos: 5, cor: 0xda77f2,
    },
    player: {
        id: 'player', nome: 'Player', textura: 'programa-player',
        blocos: 3, cor: 0x38d9a9,
    },
    fotos: {
        id: 'fotos', nome: 'Fotos', textura: 'programa-fotos',
        blocos: 1, cor: 0xffd43b,
    },
    impressao: {
        id: 'impressao', nome: 'Impressão', textura: 'programa-impressao',
        blocos: 1, cor: 0xff8787,
    },
}

/* ═══════════════════════════════════════════════════════ o estado */

/**
 * O estado vivo da máquina.
 *
 * ── A MEMÓRIA É COMPACTA, E ISSO É UMA DECISÃO ───────────────────────────
 *
 * `abertos` é uma LISTA em ordem, não um mapa de blocos. Quem abre entra no
 * fim; quem fecha some e todo mundo à direita desliza para a esquerda. Isso
 * elimina fragmentação: se sobram 3 blocos, um programa de 3 cabe, ponto.
 *
 * Fragmentação é real e é o que um sistema operacional de verdade enfrenta —
 * mas para uma criança de 5º ano ela transforma "sobram 3, cabe 3" em "sobram
 * 3, mas em dois pedaços, então não cabe", e a conta deixa de fechar na cabeça.
 * A régua da memória é a promessa de que a conta fecha.
 */
export interface MaquinaEstado {
    dispositivos: Map<DispositivoId, DispositivoEstado>
    /** Quantos blocos esta fase tem. Zero = a fase não é de memória. */
    blocos: number
    /** Quem está aberto, na ordem em que abriu. */
    abertos: ProgramaId[]
}

export function criarMaquina(fase: FaseDef): MaquinaEstado {
    const dispositivos = new Map<DispositivoId, DispositivoEstado>()
    fase.hardware.forEach(h => {
        dispositivos.set(h.id, {
            id: h.id,
            ligado: h.ligado !== false,
            restaMs: 0,
            duracaoMs: 0,
        })
    })
    return {
        dispositivos,
        blocos: fase.blocos,
        abertos: [...(fase.jaAbertos ?? [])],
    }
}

export const blocosUsados = (m: MaquinaEstado): number =>
    m.abertos.reduce((s, p) => s + PROGRAMAS[p].blocos, 0)

export const blocosLivres = (m: MaquinaEstado): number =>
    Math.max(0, m.blocos - blocosUsados(m))

export const estaAberto = (m: MaquinaEstado, p: ProgramaId): boolean =>
    m.abertos.includes(p)

/** Onde um programa aberto começa, em blocos, a partir da esquerda. */
export function inicioDe(m: MaquinaEstado, p: ProgramaId): number {
    let x = 0
    for (const id of m.abertos) {
        if (id === p) return x
        x += PROGRAMAS[id].blocos
    }
    return -1
}

/** Se este programa está segurando alguma peça agora, qual é. */
export function usandoQual(m: MaquinaEstado, p: ProgramaId): DispositivoId | null {
    for (const d of m.dispositivos.values()) {
        if (d.usadoPor === p) return d.id
    }
    return null
}

/* ═══════════════════════════════════════════════════════ o veredito */

/**
 * O QUE DÁ PARA FAZER COM ESTE PEDIDO, AGORA.
 *
 *   `liberar`  dá para atender neste instante
 *   `esperar`  o recurso existe e está bom, mas alguém está com ele
 *   `negar`    é impossível, e vai continuar impossível
 *   `fechar`   cabe na memória, mas só depois de fechar alguma coisa
 *
 * Repare que `esperar` e `fechar` NÃO são erros — são as duas respostas que só
 * existem porque a máquina tem estado. E repare que a função não recebe nada
 * além do pedido e da máquina: não há histórico, não há gabarito, não há
 * "número da fase". Se a máquina está num estado, a resposta é uma só.
 */
export function avaliarPedido(p: PedidoDef, m: MaquinaEstado): Veredito {
    if (p.quer.o === 'usar') {
        const d = m.dispositivos.get(p.quer.dispositivo)
        if (!d || !d.ligado) return 'negar'
        if (d.usadoPor) return 'esperar'
        return 'liberar'
    }

    const def = PROGRAMAS[p.programa]
    if (estaAberto(m, p.programa)) return 'negar'
    if (def.blocos > m.blocos) return 'negar'
    if (def.blocos <= blocosLivres(m)) return 'liberar'
    return 'fechar'
}

/**
 * POR QUE o veredito é esse — na voz do sistema, para a plaquinha do rodapé.
 *
 * Frases curtas e SEMPRE com o motivo concreto: nunca "não pode", sempre "a
 * impressora está desligada". A criança precisa poder discordar da frase e ir
 * conferir na tela — e para isso a frase tem que apontar para uma coisa
 * desenhada.
 */
export function porQueNao(p: PedidoDef, m: MaquinaEstado): string {
    if (p.quer.o === 'usar') {
        const d = m.dispositivos.get(p.quer.dispositivo)
        const nome = DISPOSITIVOS[p.quer.dispositivo].nome
        if (!d) return `Este computador não tem ${nome.toLowerCase()}.`
        if (!d.ligado) return `${nome}: está desligado. Negue este pedido.`
        if (d.usadoPor) {
            return `${nome} está com o ${PROGRAMAS[d.usadoPor].nome}.`
        }
        return `${nome} está livre.`
    }

    const def = PROGRAMAS[p.programa]
    if (estaAberto(m, p.programa)) return `${def.nome} já está aberto. Negue.`
    if (def.blocos > m.blocos) {
        return `${def.nome} pede ${def.blocos} blocos, e só há ${m.blocos}.`
    }
    const livres = blocosLivres(m)
    if (def.blocos > livres) {
        return `Sobram ${livres} blocos, e ${def.nome} pede ${def.blocos}.`
    }
    return `Cabe: sobram ${livres} blocos.`
}

/* ═══════════════════════════════════════════════════════ as mudanças */

/** Entrega uma peça a um programa por um tempo. */
export function ocupar(
    m: MaquinaEstado, id: DispositivoId, programa: ProgramaId, ms: number,
): void {
    const d = m.dispositivos.get(id)
    if (!d) return
    d.usadoPor = programa
    d.restaMs = ms
    d.duracaoMs = ms
}

export function soltar(m: MaquinaEstado, id: DispositivoId): void {
    const d = m.dispositivos.get(id)
    if (!d) return
    d.usadoPor = undefined
    d.restaMs = 0
    d.duracaoMs = 0
}

export function abrirPrograma(m: MaquinaEstado, p: ProgramaId): boolean {
    if (estaAberto(m, p)) return false
    if (PROGRAMAS[p].blocos > blocosLivres(m)) return false
    m.abertos.push(p)
    return true
}

export function fecharPrograma(m: MaquinaEstado, p: ProgramaId): boolean {
    const i = m.abertos.indexOf(p)
    if (i < 0) return false
    m.abertos.splice(i, 1)
    return true
}

/**
 * O relógio da máquina.
 *
 * Devolve as peças que ACABARAM de ficar livres neste frame — é a lista que a
 * cena usa para servir quem estava esperando. A máquina não conhece a fila de
 * pedidos e não deve conhecer: ela só sabe que uma peça vagou.
 */
export function tickMaquina(m: MaquinaEstado, delta: number): DispositivoId[] {
    const vagaram: DispositivoId[] = []
    m.dispositivos.forEach(d => {
        if (!d.usadoPor) return
        d.restaMs -= delta
        if (d.restaMs > 0) return
        d.usadoPor = undefined
        d.restaMs = 0
        d.duracaoMs = 0
        vagaram.push(d.id)
    })
    return vagaram
}
