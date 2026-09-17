import { avaliar, criaturaDe, tem, valeTermo } from './criaturas'
import type { Atributo, Criatura, Frase, NivelDef, Termo } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS ONDAS, E O QUE CADA NÍVEL ESTREIA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A regra vale nos três: os dois portões de uma onda são uma frase e a negação
 * dela, e por isso existe EXATAMENTE UM portão certo para cada criaturinha. O
 * que cresce é a frase de cima.
 *
 * - **1** — um termo. `é azul` × `NÃO é azul`, o par do briefing.
 * - **2** — dois termos e um operador. As ondas 1 e 2 são a MESMA turma com a
 *   mesma dupla de termos e só o operador trocado: é ali que `E` e `OU` param
 *   de ser duas palavras e viram dois tamanhos de curral.
 * - **3** — o `NÃO` desce para DENTRO da frase e gruda num termo só. Agora há
 *   dois NÃOs na tela, e eles fazem coisas diferentes — é por isso que este é
 *   o último nível.
 *
 * Cada nível estreia no máximo dois conceitos, e nenhum deles reapresenta o
 * jogo.
 */

export const CRIATURAS_POR_ONDA = 8

const termo = (atributo: Atributo): Termo => ({ atributo, negado: false })

/** O `NÃO` grudado num termo só — o do nível 3, que não é o `NÃO` da frase inteira. */
const nao = (atributo: Atributo): Termo => ({ atributo, negado: true })

const e = (a: Termo | Atributo, b: Termo | Atributo): Frase => ({
    left: typeof a === 'string' ? termo(a) : a,
    op: 'e',
    right: typeof b === 'string' ? termo(b) : b,
})

const ou = (a: Termo | Atributo, b: Termo | Atributo): Frase => ({
    left: typeof a === 'string' ? termo(a) : a,
    op: 'ou',
    right: typeof b === 'string' ? termo(b) : b,
})

/**
 * A turma do par `E` × `OU`: as OITO, e nas duas ondas na MESMA ORDEM.
 *
 * Trocar a turma ou a ordem entre a onda do `E` e a do `OU` jogaria fora a
 * única coisa que essas duas ondas existem para mostrar — as mesmas
 * criaturinhas, os mesmos dois termos, uma palavra trocada, e os currais
 * enchendo completamente diferente (2 em cima viram 5).
 */
const TURMA_DO_PAR = ['bibi', 'tuto', 'mila', 'nino', 'zeca', 'pipa', 'lele', 'dudu']

export const NIVEIS: NivelDef[] = [
    {
        nivel: 1,
        nome: 'Uma coisa de cada vez',
        objetivo: 'Toque no portão cuja frase for verdadeira para ela',
        ondas: [
            {
                id: 'n1o1',
                frase: { left: termo('azul') },
                turma: ['bibi', 'mila', 'tuto', 'lele', 'zeca', 'dudu', 'nino', 'pipa'],
            },
            {
                id: 'n1o2',
                frase: { left: termo('chapeu') },
                turma: ['nino', 'pipa', 'bibi', 'dudu', 'lele', 'tuto', 'zeca', 'mila'],
            },
            {
                id: 'n1o3',
                frase: { left: termo('pequena') },
                turma: ['bibi', 'tuto', 'pipa', 'nino', 'dudu', 'zeca', 'mila', 'lele'],
                marco: true,
            },
        ],
    },
    {
        nivel: 2,
        nome: 'Duas coisas na mesma placa',
        objetivo: 'O E exige as duas; ao OU basta uma',
        ondas: [
            {
                id: 'n2o1',
                frase: e('azul', 'chapeu'),
                turma: TURMA_DO_PAR,
            },
            {
                id: 'n2o2',
                // Mesmos termos, mesma turma, mesma ordem. Só o operador muda.
                frase: ou('azul', 'chapeu'),
                turma: TURMA_DO_PAR,
            },
            {
                id: 'n2o3',
                frase: e('pequena', 'oculos'),
                turma: ['tuto', 'mila', 'pipa', 'zeca', 'lele', 'dudu', 'nino', 'bibi'],
                marco: true,
            },
        ],
    },
    {
        nivel: 3,
        nome: 'O NÃO de um pedaço só',
        objetivo: 'Resolva o NÃO do termo antes de juntar',
        ondas: [
            {
                id: 'n3o1',
                frase: e(nao('verde'), 'chapeu'),
                turma: TURMA_DO_PAR,
            },
            {
                /*
                 * DE MORGAN, sem dizer o nome dele.
                 *
                 * `verde OU NÃO chapéu` é exatamente a negação de
                 * `NÃO verde E chapéu`. Com a mesma turma e a mesma ordem, os
                 * dois currais simplesmente TROCAM DE CONTEÚDO de uma onda para
                 * a outra — 3 e 5 viram 5 e 3, criaturinha por criaturinha. A
                 * criança não precisa da regra: ela vê a troca acontecer.
                 */
                id: 'n3o2',
                frase: ou('verde', nao('chapeu')),
                turma: TURMA_DO_PAR,
            },
            {
                id: 'n3o3',
                frase: e(nao('azul'), 'oculos'),
                turma: ['pipa', 'bibi', 'dudu', 'nino', 'tuto', 'mila', 'zeca', 'lele'],
            },
        ],
    },
]

/** O progresso da plataforma é do NÍVEL, não do jogo inteiro. */
export const criaturasNoNivel = (nivel: NivelDef) =>
    nivel.ondas.reduce((n, onda) => n + onda.turma.length, 0)

export const pontosPor = (semErro: boolean) => (semErro ? 10 : 5)

// ─────────────────────────────────────────────────────────────── as palavras

/** `tem` para acessório, `é` para cor e tamanho — a frase da placa e a do balão. */
const VERBO: Record<Atributo, 'e' | 'tem'> = {
    azul: 'e',
    verde: 'e',
    vermelha: 'e',
    pequena: 'e',
    chapeu: 'tem',
    oculos: 'tem',
}

const PALAVRA: Record<Atributo, string> = {
    azul: 'AZUL',
    verde: 'VERDE',
    vermelha: 'VERMELHA',
    pequena: 'PEQUENA',
    chapeu: 'BONÉ',
    oculos: 'ÓCULOS',
}

const palavraMinuscula: Record<Atributo, string> = {
    azul: 'azul',
    verde: 'verde',
    vermelha: 'vermelha',
    pequena: 'pequena',
    chapeu: 'boné',
    oculos: 'óculos',
}

/**
 * A palavra da ficha do termo.
 *
 * Com UM termo a placa é uma frase inteira (`É AZUL`); com dois, a frase mora na
 * fileira — `AZUL` `E` `BONÉ` — e repetir o verbo em cada ficha estouraria a
 * tábua e ainda deixaria a leitura mais pesada do que a lógica.
 */
export const palavraDoTermo = (t: Termo, comVerbo: boolean) => {
    const corpo = comVerbo
        ? `${VERBO[t.atributo] === 'e' ? 'É' : 'TEM'} ${PALAVRA[t.atributo]}`
        : PALAVRA[t.atributo]
    return t.negado ? `NÃO ${corpo}` : corpo
}

/** O texto da frase por extenso. Serve ao relatório e às mensagens de validação. */
export function textoDaFrase(frase: Frase): string {
    const um = (t: Termo) => palavraDoTermo(t, true)
    if (!frase.op || !frase.right) return um(frase.left)
    return `${um(frase.left)} ${frase.op === 'e' ? 'E' : 'OU'} ${um(frase.right)}`
}

/**
 * O que é VERDADE sobre a criaturinha naquele atributo, em palavras de criança.
 *
 * Repare que ela fala do atributo CRU, e não do termo: quando o termo é
 * `NÃO verde` e a criaturinha é verde, o que ajuda é ouvir "ela é verde" — a
 * criança sabe o que fazer com isso. "O termo não valeu" não diz nada.
 */
const diz = (t: Termo, c: Criatura) => {
    const verbo = VERBO[t.atributo] === 'e' ? 'é' : 'tem'
    return `${tem(c, t.atributo) ? '' : 'não '}${verbo} ${palavraMinuscula[t.atributo]}`
}

/**
 * O balão do erro: uma linha, abaixo de ~35 caracteres, dizendo a CAUSA — o que
 * é verdade sobre a criaturinha — e nunca qual portão escolher.
 *
 * CADA CAUSA PRECISA DA SUA FRASE. "Não deu" serviria a cinco situações
 * diferentes e esconderia justamente a diferença entre o `E` (que reprova por
 * falta de UM) e o `OU` (que só reprova quando faltam os dois).
 */
export function balaoDoErro(frase: Frase, c: Criatura): string {
    const l = frase.left

    // Quem manda é o TERMO, já com o `NÃO` dele — mas quem fala é o atributo
    // cru. Julgar pelo atributo daria a dica errada no nível 3.
    const okEsq = valeTermo(l, c)

    if (!frase.op || !frase.right) {
        return okEsq ? `Mas ela ${diz(l, c)}!` : `Ela ${diz(l, c)}.`
    }

    const r = frase.right
    const okDir = valeTermo(r, c)

    if (frase.op === 'e') {
        if (okEsq && okDir) return 'Mas as duas estão certas!'
        if (!okEsq && !okDir) return 'As duas estão erradas.'
        return `Ela ${diz(okEsq ? r : l, c)}.`
    }

    if (okEsq || okDir) return `Basta uma: ela ${diz(okEsq ? l : r, c)}!`
    return 'Nem uma nem outra serve.'
}

// ─────────────────────────────────────────────────────────── a rede de proteção

/**
 * Onda que manda a turma inteira para o mesmo curral existe, é chata e não
 * ensina nada — os dois currais são o resultado, e um deles vazio não mostra
 * separação nenhuma. Roda no `create`, como os vizinhos fazem.
 */
export function validarNiveis(niveis: NivelDef[]): string[] {
    const problemas: string[] = []

    niveis.forEach(nivel => {
        nivel.ondas.forEach(onda => {
            if (onda.turma.length === 0) {
                problemas.push(`${onda.id}: turma vazia`)
                return
            }

            let cima = 0
            let baixo = 0
            onda.turma.forEach(id => {
                if (avaliar(onda.frase, criaturaDe(id))) cima += 1
                else baixo += 1
            })

            if (cima === 0 || baixo === 0) {
                problemas.push(
                    `${onda.id} ("${textoDaFrase(onda.frase)}"): ${cima} em cima e ${baixo} embaixo — um curral fica vazio`,
                )
            }
        })
    })

    return problemas
}
