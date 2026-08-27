/**
 * ══════════════════════════════════════════════════════════════════════════
 *  ACADEMIA DOS ALGORITMOS — EF15CO02
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A habilidade: construir e simular algoritmos que resolvem problemas do
 * cotidiano, usando SEQUÊNCIA, REPETIÇÃO e CONDIÇÃO — e depurar quando eles
 * não funcionam.
 *
 * Aqui isso é literal: a criança monta uma fila de passos, aperta EXECUTAR, e
 * o boneco faz exatamente o que ela mandou. Quando dá errado, ela vê ONDE deu.
 *
 * ── A DECISÃO QUE SEGURA O JOGO EM PÉ ────────────────────────────────────
 *
 * Não existe resposta guardada em lugar nenhum. Nenhum caso diz "a ordem certa
 * é 2,1,3".
 *
 * Cada ação é uma FUNÇÃO que mexe no mundo e pode recusar ("não dá para
 * escovar: a escova está sem pasta"). O caso termina quando o mundo chega numa
 * certa condição. Se o algoritmo chega lá, está certo — não importa como.
 *
 * Isso custa caro e paga: um caso impossível não aparece em revisão de código,
 * tem que ser simulado (é o que `scripts/check-academia.mjs` faz). Em troca, o
 * jogo aceita soluções que ninguém previu, o erro tem MOTIVO em vez de ser
 * "errado", e o Nível 3 — onde o mundo muda entre uma execução e outra —
 * simplesmente é possível. Com uma resposta guardada, ele não seria.
 */

/* ─────────────────────────────────────────── o mundo ─────────── */

/**
 * Tudo que a cena sabe sobre si mesma.
 *
 * É o que as ações leem e escrevem, e é o que decide se o caso terminou.
 * Deliberadamente pequeno: cinco campos cobrem os nove casos.
 */
export type Mundo = {
  /** O que está na mão. Uma coisa por vez, como na vida. */
  naMao: string | null
  /**
   * Os fatos que já valem: `'pasta-na-escova'`, `'mochila-aberta'`.
   *
   * Conjunto, e não lista, porque a pergunta é sempre "isto já é verdade?" —
   * e porque fazer duas vezes a mesma coisa não deve contar como duas.
   *
   * É também onde mora a INCERTEZA do Nível 3: alguns fatos já podem estar
   * valendo quando o caso começa, e a criança não sabe quais. Não existe um
   * campo especial para isso — o mundo é um só, e a dúvida é sobre ele.
   */
  fatos: Set<string>
  /** Quantas vezes a ação de contar foi executada. Nível 2. */
  contador: number
}

/* ─────────────────────────────────────────── as peças ─────────── */

/**
 * Uma ação simples: um passo que o boneco faz.
 *
 * `aplicar` devolve `null` quando deu certo, ou a FRASE do que impediu. Essa
 * frase é o que a criança lê quando o algoritmo trava — por isso ela fala do
 * mundo ("a escova está sem pasta"), e nunca do jogo ("comando inválido").
 */
export type Acao = {
  id: string
  /** O que vai escrito no bloco. Duas palavras, no máximo três. */
  rotulo: string
  /** A chave da textura carregada no BootScene. */
  textura: string
  aplicar: (m: Mundo) => string | null
}

/** O que ocupa um espaço da trilha. */
export type Peca =
  | { tipo: 'acao'; acao: string }
  /**
   * O laço. Repete UMA ação, sem aninhar.
   *
   * Aninhar laço é a próxima habilidade, não esta — e um colchete dentro de
   * outro colchete numa tela de 1280x720 vira desenho ilegível para quem tem
   * sete anos.
   */
  | { tipo: 'repetir'; vezes: number; acao: string }
  /**
   * A condição. Um teste, dois caminhos, uma ação em cada.
   *
   * `senao` pode ser `null` — "se tiver poça, desvie; se não, siga" é a mesma
   * coisa que "se não tiver poça, não faça nada de especial".
   */
  | { tipo: 'se'; condicao: string; entao: string; senao: string | null }

/** O teste de uma condição. Lê o mundo, não mexe nele. */
export type Condicao = {
  id: string
  /** Como o bloco se lê: "tem poça?" */
  rotulo: string
  avaliar: (m: Mundo) => boolean
}

/* ─────────────────────────────────────────── o caso ─────────── */

export type Caso = {
  /** O pedido do treinador. UMA frase, e é a única coisa para ler. */
  pedido: string
  /**
   * Os blocos oferecidos. Três ou quatro, nunca uma paleta.
   *
   * Sobrar bloco é bom — obriga a escolher. Sobrar MUITO bloco é o defeito
   * que esta versão veio consertar.
   */
  oferta: Peca[]
  /**
   * Quantos espaços a trilha tem.
   *
   * É o número que ensina o laço no Nível 2: regar três plantas são cinco
   * passos, e só há três espaços. Não cabe sem repetir — e a criança descobre
   * isso contando, não lendo uma regra.
   */
  espacos: number
  mundoInicial: () => Mundo
  /**
   * O MUNDO SÓ SE REVELA NA HORA DE EXECUTAR.
   *
   * Quando isto é `true`, a cena esconde o estado do objeto atrás de uma
   * interrogação até a criança apertar EXECUTAR — e o mundo é sorteado de novo
   * a cada execução.
   *
   * Sem isso o Nível 3 não ensina nada. A criança olharia a mochila aberta,
   * montaria sem o "abrir", venceria; no caso seguinte veria fechada, poria o
   * "abrir", venceria de novo — e nunca precisaria do bloco que decide. Só
   * comprometer-se ANTES de saber é que dá sentido a uma condição.
   */
  mundoIncerto?: boolean
  /**
   * A frase que a cena mostra enquanto o mundo está escondido.
   *
   * "A mochila pode estar aberta ou fechada." Sem ela a interrogação seria só
   * um enfeite: a criança precisa saber SOBRE O QUÊ é a dúvida para escolher a
   * condição certa.
   */
  duvida?: string
  /** O caso acabou bem? Roda no mundo depois da última peça. */
  chegou: (m: Mundo) => boolean
  /**
   * A frase para quando o algoritmo rodou inteiro sem travar e mesmo assim
   * não chegou. Diz o que FALTOU, nunca "errado".
   */
  faltou: string
}

export type Nivel = {
  numero: 1 | 2 | 3
  /** A ideia nova deste nível, em duas palavras. Aparece no HUD. */
  ideia: string
  /** Qual cenário o palco veste. Cada nível troca de lugar. */
  palco: 'sala' | 'jardim' | 'caminho'
  casos: Caso[]
}

/* ─────────────────────────────────────────── a simulação ─────────── */

/** Onde a execução parou, e por quê. */
export type Resultado =
  | { fim: 'chegou'; trilha: number[] }
  | { fim: 'travou'; emEspaco: number; motivo: string; trilha: number[] }
  | { fim: 'faltou'; motivo: string; trilha: number[] }

/**
 * Um passo da execução, para a animação seguir.
 *
 * A cena não decide nada: ela ENCENA esta lista. É a regra do projeto de
 * simular antes de animar — a lógica resolve, a animação só mostra.
 */
export type Batida = {
  /** Que espaço da trilha está aceso agora. */
  espaco: number
  /** Qual ação rodou nesta batida. */
  acao: string
  /** `1/3`, `2/3` — só quando a peça é um laço. */
  volta?: { atual: number; de: number }
  /** Que ramo o `SE` escolheu. */
  ramo?: 'entao' | 'senao'
  /** O que travou aqui, se travou. */
  erro?: string
}
