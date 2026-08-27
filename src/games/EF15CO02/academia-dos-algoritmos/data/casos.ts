import type {
  Acao,
  Batida,
  Caso,
  Condicao,
  Mundo,
  Nivel,
  Peca,
  Resultado,
} from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O MUNDO, AS AÇÕES E OS NOVE CASOS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Nada aqui sabe desenhar. É a lógica do jogo inteira, e ela roda sem Phaser —
 * por isso dá para simular os nove casos num script e provar que todos têm
 * solução antes de qualquer criança abrir a tela.
 */

const mundoVazio = (extra: Partial<Mundo> = {}): Mundo => ({
  naMao: null,
  fatos: new Set<string>(),
  contador: 0,
  ...extra,
})

/* ─────────────────────────────────────────── as ações ─────────── */

/**
 * Cada ação tem uma PRÉ-CONDIÇÃO, e é dela que sai o ensino.
 *
 * "Escovar" recusa quando a escova está sem pasta. A criança não leu isso em
 * lugar nenhum: ela mandou escovar, viu o boneco parar, e leu o motivo. É a
 * diferença entre uma regra decorada e uma descoberta.
 *
 * As frases de recusa falam do MUNDO, nunca do jogo. "A escova está sem
 * pasta" ensina; "ação inválida" não ensina nada.
 */
function acao(
  id: string,
  rotulo: string,
  textura: string,
  aplicar: (m: Mundo) => string | null
): Acao {
  return { id, rotulo, textura, aplicar }
}

/** Pegar só funciona com a mão livre — é a regra que dá ordem à sequência. */
const pegar = (id: string, rotulo: string, textura: string, oQue: string) =>
  acao(id, rotulo, textura, (m) => {
    if (m.naMao) return `A mão já está ocupada com ${m.naMao}.`
    m.naMao = oQue
    return null
  })

export const ACOES: Record<string, Acao> = {}
const reg = (a: Acao) => {
  ACOES[a.id] = a
  return a
}

/* ── Nível 1: a sala de treino ─────────────────────────────────── */

reg(pegar('pegar-escova', 'pegar escova', 'item-escova', 'a escova'))

reg(
  acao('por-pasta', 'pôr pasta', 'item-pasta-dente', (m) => {
    if (m.naMao !== 'a escova') return 'A escova não está na mão.'
    m.fatos.add('pasta-na-escova')
    return null
  })
)

reg(
  acao('escovar', 'escovar', 'item-escova', (m) => {
    if (m.naMao !== 'a escova') return 'A escova não está na mão.'
    if (!m.fatos.has('pasta-na-escova')) return 'A escova está sem pasta.'
    m.fatos.add('dentes-limpos')
    return null
  })
)

reg(
  acao('abrir-mochila', 'abrir mochila', 'item-mochila', (m) => {
    if (m.fatos.has('mochila-aberta')) return 'A mochila já está aberta.'
    m.fatos.add('mochila-aberta')
    return null
  })
)

const guardarNaMochila = (id: string, rotulo: string, textura: string, oQue: string) =>
  reg(
    acao(id, rotulo, textura, (m) => {
      if (!m.fatos.has('mochila-aberta')) return 'A mochila está fechada.'
      m.fatos.add(oQue)
      return null
    })
  )

guardarNaMochila('por-caderno', 'pôr caderno', 'item-caderno', 'caderno-guardado')
guardarNaMochila('por-lanche', 'pôr lanche', 'item-lanche', 'lanche-guardado')

reg(
  acao('fechar-mochila', 'fechar mochila', 'item-mochila', (m) => {
    if (!m.fatos.has('mochila-aberta')) return 'A mochila já está fechada.'
    m.fatos.delete('mochila-aberta')
    m.fatos.add('mochila-fechada')
    return null
  })
)

reg(pegar('pegar-regador', 'pegar regador', 'item-regador', 'o regador'))

/**
 * Encher RECUSA quando já está cheio — e é essa recusa que o Nível 3 usa.
 *
 * Parece um detalhe chato, e é o que faz um algoritmo fixo travar quando o
 * mundo já vem meio pronto. Sem ela, "encher" seria inofensivo em qualquer
 * situação e a condição não teria por que existir.
 */
reg(
  acao('encher-regador', 'encher', 'item-regador', (m) => {
    if (m.naMao !== 'o regador') return 'O regador não está na mão.'
    if (m.fatos.has('regador-cheio')) return 'O regador já está cheio.'
    m.fatos.add('regador-cheio')
    return null
  })
)

/**
 * Regar é a ação que o Nível 2 repete.
 *
 * O regador esvazia a cada três plantas — é o que torna a conta interessante
 * sem exigir um segundo laço.
 */
reg(
  acao('regar', 'regar', 'item-planta', (m) => {
    if (m.naMao !== 'o regador') return 'O regador não está na mão.'
    if (!m.fatos.has('regador-cheio')) return 'O regador está vazio.'
    m.contador += 1
    m.fatos.add(`planta-${m.contador}-regada`)
    return null
  })
)

/* ── Nível 2: o jardim ─────────────────────────────────────────── */

reg(
  acao('abrir-caixa', 'abrir caixa', 'item-bloco-montar', (m) => {
    if (m.fatos.has('caixa-aberta')) return 'A caixa já está aberta.'
    m.fatos.add('caixa-aberta')
    return null
  })
)

reg(
  acao('guardar-brinquedo', 'guardar', 'item-brinquedo', (m) => {
    if (!m.fatos.has('caixa-aberta')) return 'A caixa está fechada.'
    m.contador += 1
    return null
  })
)

reg(pegar('pegar-blocos', 'pegar blocos', 'item-bloco-montar', 'os blocos'))

reg(
  acao('empilhar', 'empilhar', 'item-bloco-montar', (m) => {
    if (m.naMao !== 'os blocos') return 'Os blocos não estão na mão.'
    m.contador += 1
    return null
  })
)

/* ─────────────────────────────────────────── as condições ─────────── */

/**
 * O NÍVEL 3 NÃO TEM UM BONECO ANDANDO — a dúvida é sobre o ESTADO das coisas.
 *
 * A primeira versão tinha um caminho, uma poça e uma criança que pulava. Duas
 * coisas estavam erradas nisso: a tela ficava com dois personagens sem motivo
 * (o treinador e o boneco), e a lição virava sobre pular obstáculos em vez de
 * sobre decidir.
 *
 * Agora a incerteza é a mesma das ações que já existem: às vezes a mochila já
 * está aberta, às vezes o regador já está cheio. `abrir-mochila` e
 * `encher-regador` RECUSAM quando já foi feito — então um algoritmo fixo trava
 * na metade das execuções, e só o `SE` serve sempre.
 *
 * Nada de arte nova, nenhum personagem a mais, e a condição passa a ser sobre
 * o mundo, que é do que ela trata de verdade.
 */
export const CONDICOES: Record<string, Condicao> = {
  'mochila-fechada': {
    id: 'mochila-fechada',
    rotulo: 'está fechada?',
    avaliar: (m) => !m.fatos.has('mochila-aberta'),
  },
  'regador-vazio': {
    id: 'regador-vazio',
    rotulo: 'está vazio?',
    avaliar: (m) => !m.fatos.has('regador-cheio'),
  },
}

/* ─────────────────────────────────────────── a simulação ─────────── */

/** Quantas batidas uma execução pode ter antes de a gente desistir dela. */
const TETO_DE_BATIDAS = 60

/**
 * Roda a trilha no mundo e conta o que aconteceu, batida por batida.
 *
 * A cena não decide nada — ela encena esta lista. Simular antes de animar é
 * regra do projeto, e aqui ela também é o que permite conferir os nove casos
 * fora do navegador.
 */
export function simular(
  trilha: (Peca | null)[],
  caso: Caso,
  mundo: Mundo = caso.mundoInicial()
): { resultado: Resultado; batidas: Batida[] } {
  const batidas: Batida[] = []
  const usados: number[] = []

  const rodar = (idAcao: string, espaco: number, extra: Partial<Batida> = {}) => {
    const a = ACOES[idAcao]
    if (!a) return `O passo "${idAcao}" não existe.`

    const erro = a.aplicar(mundo)
    batidas.push({ espaco, acao: idAcao, ...extra, ...(erro ? { erro } : {}) })
    return erro
  }

  for (let espaco = 0; espaco < trilha.length; espaco++) {
    const peca = trilha[espaco]
    if (!peca) continue

    usados.push(espaco)

    if (batidas.length > TETO_DE_BATIDAS) break

    if (peca.tipo === 'acao') {
      const erro = rodar(peca.acao, espaco)
      if (erro) {
        return {
          resultado: { fim: 'travou', emEspaco: espaco, motivo: erro, trilha: usados },
          batidas,
        }
      }
      continue
    }

    if (peca.tipo === 'repetir') {
      for (let volta = 1; volta <= peca.vezes; volta++) {
        const erro = rodar(peca.acao, espaco, {
          volta: { atual: volta, de: peca.vezes },
        })
        if (erro) {
          return {
            resultado: { fim: 'travou', emEspaco: espaco, motivo: erro, trilha: usados },
            batidas,
          }
        }
      }
      continue
    }

    /* peca.tipo === 'se' */
    const cond = CONDICOES[peca.condicao]
    const deu = cond ? cond.avaliar(mundo) : false
    const escolhido = deu ? peca.entao : peca.senao

    if (!escolhido) {
      // "se não tiver poça, não faça nada" é um ramo legítimo e vazio
      batidas.push({ espaco, acao: '', ramo: deu ? 'entao' : 'senao' })
      continue
    }

    const erro = rodar(escolhido, espaco, { ramo: deu ? 'entao' : 'senao' })
    if (erro) {
      return {
        resultado: { fim: 'travou', emEspaco: espaco, motivo: erro, trilha: usados },
        batidas,
      }
    }
  }

  if (caso.chegou(mundo)) {
    return { resultado: { fim: 'chegou', trilha: usados }, batidas }
  }

  return { resultado: { fim: 'faltou', motivo: caso.faltou, trilha: usados }, batidas }
}

/* ─────────────────────────────────────────── os casos ─────────── */

const A = (acaoId: string): Peca => ({ tipo: 'acao', acao: acaoId })

export const NIVEIS: Nivel[] = [
  {
    numero: 1,
    ideia: 'ordem',
    palco: 'sala',
    casos: [
      {
        pedido: 'Escove os dentes.',
        oferta: [A('escovar'), A('pegar-escova'), A('por-pasta')],
        espacos: 3,
        mundoInicial: () => mundoVazio(),
        chegou: (m) => m.fatos.has('dentes-limpos'),
        faltou: 'Os dentes ainda não foram escovados.',
      },
      {
        pedido: 'Guarde o caderno e o lanche, e feche a mochila.',
        oferta: [A('por-lanche'), A('fechar-mochila'), A('abrir-mochila'), A('por-caderno')],
        espacos: 4,
        mundoInicial: () => mundoVazio(),
        chegou: (m) =>
          m.fatos.has('caderno-guardado') &&
          m.fatos.has('lanche-guardado') &&
          m.fatos.has('mochila-fechada'),
        faltou: 'Ainda falta alguma coisa na mochila.',
      },
      {
        pedido: 'Regue a planta.',
        oferta: [A('regar'), A('encher-regador'), A('pegar-regador')],
        espacos: 3,
        mundoInicial: () => mundoVazio(),
        chegou: (m) => m.fatos.has('planta-1-regada'),
        faltou: 'A planta continua sem água.',
      },
    ],
  },

]

export const TOTAL_CASOS = NIVEIS.reduce((n, nivel) => n + nivel.casos.length, 0)

/* ─────────────────────────────────────────── o estado visível ─────────── */

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O QUE CADA OBJETO DIZ DE SI
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Uma escova na tela não informa nada; "escova — sem pasta" informa tudo. Esta
 * tabela é o que separa um ícone de enfeite de um painel de estado.
 *
 * É também o que faz o erro fazer sentido: quando o algoritmo trava dizendo "a
 * escova está sem pasta", a criança olha para a escova e lê exatamente isso
 * embaixo dela. A mecânica não pode contradizer os olhos.
 *
 * `oculto` é o Nível 3: enquanto o mundo não foi revelado, o objeto de que a
 * dúvida trata mostra "?" em vez do estado. Sem isso a criança montaria o
 * algoritmo olhando a resposta.
 */
export function estadoDoObjeto(textura: string, m: Mundo, oculto = false): string | null {
  const tem = (f: string) => m.fatos.has(f)

  switch (textura) {
    case 'item-escova':
      return tem('dentes-limpos') ? 'dentes limpos' : tem('pasta-na-escova') ? 'com pasta' : 'sem pasta'

    case 'item-mochila':
      if (oculto) return '?'
      return tem('mochila-fechada') ? 'fechada' : tem('mochila-aberta') ? 'aberta' : 'fechada'

    case 'item-caderno':
      return tem('caderno-guardado') ? 'guardado' : 'na mesa'

    case 'item-lanche':
      return tem('lanche-guardado') ? 'guardado' : 'na mesa'

    case 'item-regador':
      if (oculto) return '?'
      return tem('regador-cheio') ? 'cheio' : 'vazio'

    case 'item-planta':
      return m.contador > 0 ? `${m.contador} regada${m.contador > 1 ? 's' : ''}` : 'com sede'

    case 'item-brinquedo':
      return m.contador > 0 ? `${m.contador} na caixa` : 'no chão'

    case 'item-bloco-montar':
      return tem('caixa-aberta') ? 'caixa aberta' : m.contador > 0 ? `${m.contador} empilhados` : 'no chão'

    case 'item-pasta-dente':
      return tem('pasta-na-escova') ? 'usada' : 'fechada'

    default:
      return null
  }
}

/** O objeto sobre o qual a dúvida do Nível 3 fala. */
export function objetoDaDuvida(caso: Caso): string | null {
  if (!caso.mundoIncerto) return null
  const cond = caso.oferta.find((p) => p.tipo === 'se')
  if (!cond || cond.tipo !== 'se') return null
  return ACOES[cond.entao]?.textura ?? null
}
