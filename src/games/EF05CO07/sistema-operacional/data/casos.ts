import type { NivelDef, FaseDef } from '../types'

/**
 * Os três níveis do Controlador do Sistema.
 *
 * ── NÃO EXISTE GABARITO AQUI ─────────────────────────────────────────────
 *
 * Procure por um campo com a resposta certa: não tem. Um pedido diz quem pede,
 * o que quer, quando chega e quanto aguenta esperar — e mais nada. Se libera,
 * se espera ou se nega sai de `avaliarPedido`, em `data/maquina.ts`, lendo a
 * máquina no instante do toque.
 *
 * A consequência boa disso aparece no Nível 2: o terceiro pedido da fase 2 é
 * "abra o navegador", e a resposta certa depende de a criança ter fechado o
 * navegador dois pedidos antes. Nenhum arquivo de dados saberia disso.
 *
 * ── O TETO DE 52 CARACTERES ──────────────────────────────────────────────
 *
 * Toda `fala` e todo `objetivo` cabem em 52 caracteres. É a regra que vem da
 * memória do projeto e ela não é estética: a ficha do pedido tem 244px de
 * texto, e a 19px de Arial isso são duas linhas de 26 caracteres. Frase maior
 * não encolhe — ela vaza da ficha, ou a ficha come a barra de paciência.
 *
 * ── OS TEMPOS ────────────────────────────────────────────────────────────
 *
 * `entraMs` é medido do começo da fase, e o relógio da fase só anda quando a
 * criança pode agir: durante o tutorial, a pausa e as animações de fim ele
 * fica parado. Então "entra aos 9 segundos" quer dizer nove segundos DE JOGO.
 */

/* ═════════════════════════════════════════ Nível 1 — uma peça por vez */

const N1_F1: FaseDef = {
    id: 'n1-f1',
    objetivo: 'Entregue a peça que cada programa pediu.',
    dica: 'Toque no pedido, depois na peça que ele quer.',
    hardware: [{ id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' }],
    blocos: 0,
    pedidos: [
        {
            id: 'p1', programa: 'editor', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Preciso do teclado para escrever.',
            entraMs: 0, pacienciaMs: 22_000, usoMs: 6_000,
        },
        {
            id: 'p2', programa: 'navegador', quer: { o: 'usar', dispositivo: 'mouse' },
            fala: 'Quero o mouse para clicar nos links.',
            entraMs: 9_000, pacienciaMs: 22_000, usoMs: 6_000,
        },
        {
            id: 'p3', programa: 'fotos', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Posso usar o monitor para ver a foto?',
            entraMs: 18_000, pacienciaMs: 22_000, usoMs: 6_000,
        },
    ],
}

/**
 * A fase que ensina ESPERAR.
 *
 * O navegador pede o teclado três segundos depois de o editor levar o teclado.
 * Negar seria errado — o teclado existe e está bom. A resposta é encaixar
 * mesmo assim: o pedido entra na fila DAQUELA peça e é servido sozinho quando
 * ela vaga. É a primeira vez que "não é agora" deixa de ser "não".
 */
const N1_F2: FaseDef = {
    id: 'n1-f2',
    objetivo: 'Ocupado não é impossível. Encaixe e espere.',
    dica: 'Peça ocupada? Encaixe assim mesmo: ele entra na fila.',
    hardware: [{ id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' }],
    blocos: 0,
    pedidos: [
        {
            id: 'p1', programa: 'editor', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Vou digitar um texto. Me dá o teclado?',
            entraMs: 0, pacienciaMs: 20_000, usoMs: 9_000,
        },
        {
            id: 'p2', programa: 'navegador', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Também preciso do teclado. Eu espero.',
            entraMs: 3_000, pacienciaMs: 26_000, usoMs: 6_000,
        },
        {
            id: 'p3', programa: 'player', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Quero o monitor para tocar o vídeo.',
            entraMs: 12_000, pacienciaMs: 20_000, usoMs: 7_000,
        },
        {
            id: 'p4', programa: 'fotos', quer: { o: 'usar', dispositivo: 'mouse' },
            fala: 'Só um clique no mouse, por favor.',
            entraMs: 18_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
    ],
}

/**
 * A fase que ensina NEGAR.
 *
 * A impressora está sem energia, e isso está DESENHADO: aro vermelho, arte
 * apagada, cadeado. Os dois pedidos de impressão não têm conserto — nem agora
 * nem daqui a pouco. Negar deixa de ser desistir e passa a ser a resposta certa.
 */
const N1_F3: FaseDef = {
    id: 'n1-f3',
    objetivo: 'A impressora está sem energia. Nem tudo dá.',
    dica: 'Peça desligada não fica livre nunca. Use o NEGAR.',
    hardware: [
        { id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' },
        { id: 'impressora', ligado: false },
    ],
    blocos: 0,
    pedidos: [
        {
            id: 'p1', programa: 'impressao', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Preciso imprimir esta página.',
            entraMs: 0, pacienciaMs: 18_000, usoMs: 8_000,
        },
        {
            id: 'p2', programa: 'editor', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Me empresta o teclado?',
            entraMs: 7_000, pacienciaMs: 20_000, usoMs: 7_000,
        },
        {
            id: 'p3', programa: 'fotos', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Quero imprimir a foto da turma.',
            entraMs: 14_000, pacienciaMs: 18_000, usoMs: 6_000,
        },
        {
            id: 'p4', programa: 'navegador', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Posso mostrar a página no monitor?',
            entraMs: 21_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
    ],
}

/* ═════════════════════════════════════════ Nível 2 — a memória */

const N2_F1: FaseDef = {
    id: 'n2-f1',
    objetivo: 'Abrir um programa gasta memória. Veja a régua.',
    dica: 'Para abrir, toque na régua da memória.',
    hardware: [{ id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' }, { id: 'arquivos' }],
    blocos: 6,
    pedidos: [
        {
            id: 'p1', programa: 'fotos', quer: { o: 'abrir' },
            fala: 'Quero abrir. Ocupo 1 bloco só.',
            entraMs: 0, pacienciaMs: 22_000,
        },
        {
            id: 'p2', programa: 'navegador', quer: { o: 'abrir' },
            fala: 'Posso abrir? Preciso de 2 blocos.',
            entraMs: 8_000, pacienciaMs: 22_000,
        },
        {
            id: 'p3', programa: 'editor', quer: { o: 'abrir' },
            fala: 'Abro aqui? São 2 blocos.',
            entraMs: 16_000, pacienciaMs: 22_000,
        },
        {
            id: 'p4', programa: 'player', quer: { o: 'usar', dispositivo: 'arquivos' },
            fala: 'Preciso dos arquivos para achar o vídeo.',
            entraMs: 24_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
    ],
}

/**
 * A fase que ensina FECHAR.
 *
 * Ela começa com o navegador e o editor já abertos: 4 dos 6 blocos ocupados, e
 * isso está na régua antes de qualquer pedido chegar. O player pede 3 e sobram
 * 2 — a conta não fecha, e a saída não é negar: é fechar alguma coisa.
 *
 * E o terceiro pedido é o motivo pelo qual este jogo não tem gabarito: o
 * navegador pede para abrir. Se a criança fechou o navegador para caber o
 * player, a resposta é abrir; se fechou o editor, o navegador ainda está lá e a
 * resposta é negar. As duas coisas são certas, em mundos diferentes que a
 * própria criança criou.
 */
const N2_F2: FaseDef = {
    id: 'n2-f2',
    objetivo: 'Sem espaço? Feche um programa tocando nele.',
    dica: 'Toque no bloco de um programa aberto para fechá-lo.',
    hardware: [{ id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' }, { id: 'arquivos' }],
    blocos: 6,
    jaAbertos: ['navegador', 'editor'],
    pedidos: [
        {
            id: 'p1', programa: 'player', quer: { o: 'abrir' },
            fala: 'Preciso de 3 blocos para abrir.',
            entraMs: 0, pacienciaMs: 26_000,
        },
        {
            id: 'p2', programa: 'fotos', quer: { o: 'abrir' },
            fala: 'Um bloquinho só. Posso entrar?',
            entraMs: 12_000, pacienciaMs: 22_000,
        },
        {
            id: 'p3', programa: 'navegador', quer: { o: 'abrir' },
            fala: 'Posso abrir? Preciso de 2 blocos.',
            entraMs: 20_000, pacienciaMs: 22_000,
        },
        {
            id: 'p4', programa: 'editor', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Me dá o teclado para escrever.',
            entraMs: 28_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
    ],
}

/**
 * A fase do computador pequeno.
 *
 * Quatro blocos, e o Jogo pede cinco. Não cabe agora, não cabe depois, não
 * cabe fechando tudo. É o único caso do jogo em que um pedido de memória
 * precisa ser negado por TAMANHO — e a criança resolve olhando dois números
 * desenhados na tela, o 5 no selo do programa e os 4 blocos da régua.
 */
const N2_F3: FaseDef = {
    id: 'n2-f3',
    objetivo: 'Só 4 blocos aqui. Veja o que cabe, e o que não.',
    dica: 'Compare o número do programa com os blocos livres.',
    hardware: [{ id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' }, { id: 'arquivos' }],
    blocos: 4,
    pedidos: [
        {
            id: 'p1', programa: 'jogo', quer: { o: 'abrir' },
            fala: 'Sou pesado: preciso de 5 blocos.',
            entraMs: 0, pacienciaMs: 20_000,
        },
        {
            id: 'p2', programa: 'fotos', quer: { o: 'abrir' },
            fala: 'Ocupo 1 bloco. Posso abrir?',
            entraMs: 8_000, pacienciaMs: 22_000,
        },
        {
            id: 'p3', programa: 'navegador', quer: { o: 'abrir' },
            fala: 'Preciso de 2 blocos para abrir.',
            entraMs: 15_000, pacienciaMs: 22_000,
        },
        {
            id: 'p4', programa: 'editor', quer: { o: 'abrir' },
            fala: 'Também são 2 blocos. Dá para abrir?',
            entraMs: 23_000, pacienciaMs: 24_000,
        },
        {
            id: 'p5', programa: 'player', quer: { o: 'usar', dispositivo: 'arquivos' },
            fala: 'Quero abrir um vídeo dos arquivos.',
            entraMs: 32_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
    ],
}

/* ═════════════════════════════════════════ Nível 3 — tudo junto */

const N3_F1: FaseDef = {
    id: 'n3-f1',
    objetivo: 'Três pedidos ao mesmo tempo. Pense na ordem.',
    dica: 'Comece pelo que tem menos paciência na barrinha.',
    hardware: [
        { id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' },
        { id: 'arquivos' }, { id: 'impressora' },
    ],
    blocos: 6,
    pedidos: [
        {
            id: 'p1', programa: 'editor', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Teclado, por favor. É rapidinho.',
            entraMs: 0, pacienciaMs: 16_000, usoMs: 6_000,
        },
        {
            id: 'p2', programa: 'navegador', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Preciso do monitor agora.',
            entraMs: 1_500, pacienciaMs: 16_000, usoMs: 7_000,
        },
        {
            id: 'p3', programa: 'fotos', quer: { o: 'usar', dispositivo: 'mouse' },
            fala: 'Um clique no mouse e eu saio.',
            entraMs: 3_000, pacienciaMs: 16_000, usoMs: 5_000,
        },
        {
            id: 'p4', programa: 'impressao', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Imprimir uma página, por favor.',
            entraMs: 9_000, pacienciaMs: 18_000, usoMs: 8_000,
        },
        {
            id: 'p5', programa: 'player', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Monitor de novo? Eu espero.',
            entraMs: 12_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
    ],
}

const N3_F2: FaseDef = {
    id: 'n3-f2',
    objetivo: 'Memória e peças ao mesmo tempo. Sem atropelo.',
    dica: 'Um pedido esperando não some. Resolva o mais curto.',
    hardware: [
        { id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' },
        { id: 'arquivos' }, { id: 'impressora' },
    ],
    blocos: 6,
    jaAbertos: ['navegador'],
    pedidos: [
        {
            id: 'p1', programa: 'editor', quer: { o: 'abrir' },
            fala: 'Preciso de 2 blocos.',
            entraMs: 0, pacienciaMs: 18_000,
        },
        {
            id: 'p2', programa: 'impressao', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Vou imprimir. Me dá a impressora.',
            entraMs: 2_500, pacienciaMs: 18_000, usoMs: 9_000,
        },
        {
            id: 'p3', programa: 'fotos', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Também quero imprimir. Eu espero.',
            entraMs: 6_000, pacienciaMs: 24_000, usoMs: 5_000,
        },
        {
            id: 'p4', programa: 'jogo', quer: { o: 'abrir' },
            fala: 'São 5 blocos. Cabe aí?',
            entraMs: 12_000, pacienciaMs: 22_000,
        },
        {
            id: 'p5', programa: 'player', quer: { o: 'usar', dispositivo: 'arquivos' },
            fala: 'Preciso pegar um vídeo nos arquivos.',
            entraMs: 20_000, pacienciaMs: 18_000, usoMs: 6_000,
        },
    ],
}

const N3_F3: FaseDef = {
    id: 'n3-f3',
    objetivo: 'O turno cheio. Segure a estabilidade até o fim.',
    dica: 'Encaixe, feche, negue. Você já sabe as três coisas.',
    hardware: [
        { id: 'teclado' }, { id: 'mouse' }, { id: 'monitor' },
        { id: 'arquivos' }, { id: 'impressora' },
    ],
    blocos: 6,
    pedidos: [
        {
            id: 'p1', programa: 'navegador', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Monitor, por favor.',
            entraMs: 0, pacienciaMs: 16_000, usoMs: 6_000,
        },
        {
            id: 'p2', programa: 'editor', quer: { o: 'usar', dispositivo: 'teclado' },
            fala: 'Teclado para escrever.',
            entraMs: 2_000, pacienciaMs: 16_000, usoMs: 7_000,
        },
        {
            id: 'p3', programa: 'fotos', quer: { o: 'abrir' },
            fala: 'Só 1 bloco. Posso abrir?',
            entraMs: 4_500, pacienciaMs: 18_000,
        },
        {
            id: 'p4', programa: 'impressao', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Uma página para imprimir.',
            entraMs: 9_000, pacienciaMs: 18_000, usoMs: 8_000,
        },
        {
            id: 'p5', programa: 'player', quer: { o: 'usar', dispositivo: 'monitor' },
            fala: 'Monitor quando der. Eu espero.',
            entraMs: 11_000, pacienciaMs: 20_000, usoMs: 6_000,
        },
        {
            id: 'p6', programa: 'jogo', quer: { o: 'abrir' },
            fala: '5 blocos. Vai caber aqui?',
            entraMs: 16_000, pacienciaMs: 18_000,
        },
        {
            id: 'p7', programa: 'fotos', quer: { o: 'usar', dispositivo: 'impressora' },
            fala: 'Quero imprimir a foto.',
            entraMs: 22_000, pacienciaMs: 18_000, usoMs: 5_000,
        },
    ],
}

/* ═══════════════════════════════════════════════════════ os níveis */

export const NIVEIS: NivelDef[] = [
    {
        nivel: 1,
        titulo: 'Cada pedido, uma peça',
        objetivo: 'Receber o pedido e entregar a peça certa.',
        dica: 'Leia quem pede e o que ele quer. Depois entregue.',
        estabilidade: 100,
        fases: [N1_F1, N1_F2, N1_F3],
    },
    {
        nivel: 2,
        titulo: 'A memória tem fundo',
        objetivo: 'Abrir programa gasta memória — e ela acaba.',
        dica: 'Blocos livres na régua: é essa a conta.',
        estabilidade: 100,
        fases: [N2_F1, N2_F2, N2_F3],
    },
    {
        nivel: 3,
        titulo: 'Todo mundo ao mesmo tempo',
        objetivo: 'Vários pedidos juntos, sem deixar travar.',
        dica: 'Quem tem menos paciência vai primeiro.',
        estabilidade: 100,
        fases: [N3_F1, N3_F2, N3_F3],
    },
]

export const TOTAL_FASES = NIVEIS.reduce((s, n) => s + n.fases.length, 0)

/**
 * QUANTO DURA O TURNO.
 *
 * ── A BARRA DE TEMPO NÃO É UMA PROVA CRONOMETRADA ────────────────────────
 *
 * A duração sai dos PRÓPRIOS PEDIDOS: o último a chegar, mais a paciência
 * dele, mais uma folga. Ou seja, a barra é sempre grande o bastante para
 * atender todo mundo com sobra — ela não está medindo velocidade de raciocínio.
 *
 * O que ela mede é o TURNO. Enquanto ela desce, é expediente. Quando ela zera,
 * o expediente acabou: se ainda houver pedido na fila, o turno terminou mal e a
 * fase recomeça. Na prática a fase acaba muito antes, porque ela acaba quando o
 * último pedido é resolvido — a barra só pega quem congelou.
 *
 * A folga é generosa de propósito. Ela é o que garante que a criança que ficou
 * olhando a tela por dez segundos tentando entender não seja punida por isso.
 */
export function tempoDaFase(fase: FaseDef): number {
    const fim = fase.pedidos.reduce(
        (max, p) => Math.max(max, p.entraMs + p.pacienciaMs), 0,
    )
    return fim + 8_000
}
