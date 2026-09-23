import type { Eixo, SkillCode } from "../shared/types/game";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A TABELA DA BNCC COMPUTAÇÃO, DO JEITO QUE A TELA PRECISA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O catálogo já sabia QUAL habilidade cada jogo trabalha (`game.skill`), mas
 * não sabia o que a habilidade DIZ. Esta é a tabela que faltava: é dela que
 * saem o selo do card, o filtro por ano e o balão do botão "i".
 *
 * Quatro campos por habilidade, e cada um com um trabalho diferente:
 *
 *   eixo        os três eixos da BNCC.
 *   objeto      o "objeto de conhecimento" da tabela oficial.
 *   habilidade  o texto OFICIAL, palavra por palavra, sem o código na frente.
 *   resumo      UMA frase, escrita aqui, para caber num balão de hover.
 *
 * O `resumo` existe porque a "explicação da habilidade" oficial tem
 * parágrafos — ótima para o professor ler sentado, impossível de ler passando
 * o mouse. Ele é uma destilação dessa explicação, não uma citação dela.
 *
 * ── TRÊS COISAS PARA SABER ANTES DE CONFIAR NESTE ARQUIVO ────────────────
 *
 * 1. `objeto` está AUSENTE em EF01CO01 a EF01CO05. A tabela oficial dessas
 *    cinco ainda não foi transcrita para cá; o texto da `habilidade` delas
 *    veio dos PLANEJAMENTO.md dos próprios jogos, que citam o enunciado.
 *    Quando a tabela chegar, é só preencher — o balão já esconde o campo
 *    sozinho quando ele falta.
 *
 * 2. EF15CO05 a EF15CO09 existem na BNCC e NÃO estão aqui: nenhum jogo do
 *    catálogo aponta para elas, e `SkillCode` (shared/types/game.ts) só
 *    declara EF15CO01 a EF15CO04. Cadastrar um jogo numa delas exige mexer
 *    nos dois lugares.
 *
 * 3. O `eixo` daqui é o da BNCC, e o `category` do catálogo é uma cópia
 *    dele, jogo a jogo. Seis cópias divergiam e foram corrigidas em
 *    23/09/2026 pela lista de eixos que o usuário mandou (005, 007, 035,
 *    036, 037, 080). Se voltarem a divergir, quem está certo é este arquivo.
 */
export type SkillInfo = {
  eixo: Eixo;
  /** Ausente nas habilidades cujo texto oficial ainda não foi transcrito. */
  objeto?: string;
  /** Texto oficial da habilidade, sem o código. */
  habilidade: string;
  /** Uma frase. É o que cabe num balão que abre ao passar o mouse. */
  resumo: string;
};

export const SKILLS: Record<SkillCode, SkillInfo> = {
  /* ─────────────────────────────────────────────────── 1º ano ─────────── */

  EF01CO01: {
    eixo: "Pensamento Computacional",
    habilidade:
      "Organizar objetos por características, explicitando semelhanças (padrões) e diferenças.",
    resumo:
      "Separar por uma característica de cada vez — cor, forma, tamanho — e dizer o que faz um grupo ser um grupo.",
  },
  EF01CO02: {
    eixo: "Pensamento Computacional",
    habilidade:
      "Identificar e seguir sequências de passos aplicados no dia a dia para resolver problemas.",
    resumo:
      "Perceber que as tarefas do dia a dia têm uma ordem, e seguir essa ordem até o fim.",
  },
  EF01CO03: {
    eixo: "Pensamento Computacional",
    habilidade:
      "Reorganizar e criar sequências de passos em meios físicos ou digitais, relacionando essas sequências à palavra 'Algoritmos'.",
    resumo:
      "Montar a sequência de passos ANTES de executar, e poder mexer nela depois: isso é um algoritmo.",
  },
  EF01CO04: {
    eixo: "Mundo Digital",
    habilidade:
      "Reconhecer o que é a informação, que ela pode ser armazenada, transmitida como mensagem por diversos meios e descrita em várias linguagens.",
    resumo:
      "Informação é o que se guarda, se manda e se conta — e ela continua a mesma quando troca de meio.",
  },
  EF01CO05: {
    eixo: "Mundo Digital",
    habilidade: "Representar informação usando diferentes codificações.",
    resumo:
      "A mesma informação pode ser escrita em códigos diferentes, e nenhum deles é 'o verdadeiro'.",
  },
  EF01CO06: {
    eixo: "Cultura Digital",
    objeto: "Uso de artefatos computacionais",
    habilidade:
      "Reconhecer e explorar artefatos computacionais voltados a atender necessidades pessoais ou coletivas.",
    resumo:
      "Identificar e explorar tecnologias do dia a dia — computador, tablet, brinquedo eletrônico, até martelo e rampa — e para que servem.",
  },
  EF01CO07: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso de tecnologia computacional",
    habilidade:
      "Conhecer as possibilidades de uso seguro das tecnologias computacionais para proteção dos dados pessoais e para garantir a própria segurança.",
    resumo:
      "Nome, endereço, idade e onde estuda são dados a resguardar: não se compartilham com qualquer pessoa.",
  },

  /* ─────────────────────────────────────────────────── 2º ano ─────────── */

  EF02CO01: {
    eixo: "Pensamento Computacional",
    objeto: "Modelagem de objetos",
    habilidade:
      "Criar e comparar modelos (representações) de objetos, identificando padrões e atributos essenciais.",
    resumo:
      "Um modelo é feito das características essenciais de um objeto — e trocar a característica escolhida muda os agrupamentos.",
  },
  EF02CO02: {
    eixo: "Pensamento Computacional",
    objeto: "Algoritmos com repetições simples",
    habilidade:
      "Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, construídos como sequências com repetições simples (iterações definidas) com base em instruções preestabelecidas ou criadas, analisando como a precisão da instrução impacta na execução do algoritmo.",
    resumo:
      "Descrever algoritmos com precisão, usando repetições de número conhecido: 'ande um passo 10 vezes'.",
  },
  EF02CO03: {
    eixo: "Mundo Digital",
    objeto: "Instrução de máquina",
    habilidade:
      "Identificar que máquinas diferentes executam conjuntos próprios de instruções e que podem ser usadas para definir algoritmos.",
    resumo:
      "Cada máquina oferece o seu próprio conjunto de operações, e é com elas que se montam algoritmos.",
  },
  EF02CO04: {
    eixo: "Mundo Digital",
    objeto: "Hardware e software",
    habilidade:
      "Diferenciar componentes físicos (hardware) e programas que fornecem as instruções (software) para o hardware.",
    resumo:
      "Hardware é a parte física; software é a sequência de passos lógicos que manda nela.",
  },
  EF02CO05: {
    eixo: "Cultura Digital",
    objeto: "Uso de artefatos computacionais",
    habilidade:
      "Reconhecer as características e usos das tecnologias computacionais no cotidiano dentro e fora da escola.",
    resumo:
      "Comparar tamanho, tipo e uso de cada tecnologia: o celular para ligar, o computador para produzir conteúdo.",
  },
  EF02CO06: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso de tecnologia computacional",
    habilidade:
      "Reconhecer os cuidados com a segurança no uso de dispositivos computacionais.",
    resumo:
      "Os cuidados ao usar celular, tablet e computador — do roubo de dados ao rastro que os jogos deixam online.",
  },

  /* ─────────────────────────────────────────────────── 3º ano ─────────── */

  EF03CO01: {
    eixo: "Pensamento Computacional",
    objeto: "Lógica computacional",
    habilidade:
      "Associar os valores 'verdadeiro' e 'falso' a sentenças lógicas que dizem respeito a situações do dia a dia, fazendo uso de termos que indicam negação.",
    resumo:
      "Uma frase declarativa vale verdadeiro ou falso, e o NÃO inverte esse valor.",
  },
  EF03CO02: {
    eixo: "Pensamento Computacional",
    objeto: "Algoritmos com repetições condicionais simples",
    habilidade:
      "Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples com condição (iterações indefinidas), para resolver problemas de forma independente e em colaboração.",
    resumo:
      "Repetir ENQUANTO uma condição valer: o número de voltas não é conhecido de antemão.",
  },
  EF03CO03: {
    eixo: "Pensamento Computacional",
    objeto: "Decomposição",
    habilidade:
      "Aplicar a estratégia de decomposição para resolver problemas complexos, dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.",
    resumo:
      "Quebrar um problema grande em subproblemas, resolver cada um por si e combinar as soluções.",
  },
  EF03CO04: {
    eixo: "Mundo Digital",
    objeto: "Codificação da informação",
    habilidade: "Relacionar o conceito de informação com o de dado.",
    resumo:
      "Dado é o símbolo; informação é o que um conjunto de dados significa — dia, mês e ano viram uma data.",
  },
  EF03CO05: {
    eixo: "Mundo Digital",
    objeto: "Codificação da informação",
    habilidade:
      "Compreender que dados são estruturados em formatos específicos dependendo da informação armazenada.",
    resumo:
      "Cada tipo de informação tem a sua estratégia de representação: texto em ASCII, imagem em pixels.",
  },
  EF03CO06: {
    eixo: "Mundo Digital",
    objeto: "Interface física",
    habilidade:
      "Reconhecer que, para um computador realizar tarefas, ele se comunica com o mundo exterior com o uso de interfaces físicas (dispositivos de entrada e saída).",
    resumo:
      "O computador fala com o mundo por dispositivos de entrada (teclado, mouse, sensor) e de saída (monitor, alto-falante).",
  },
  EF03CO07: {
    eixo: "Cultura Digital",
    objeto: "Uso de tecnologias computacionais",
    habilidade:
      "Utilizar diferentes navegadores e ferramentas de busca para pesquisar e acessar informações.",
    resumo:
      "Explorar navegadores e buscadores com critério: palavras associadas, abas, filtros e cuidado com o resultado.",
  },
  EF03CO08: {
    eixo: "Cultura Digital",
    objeto: "Uso de tecnologias computacionais",
    habilidade:
      "Usar ferramentas computacionais em situações didáticas para se expressar em diferentes formatos digitais.",
    resumo:
      "Usar desenho, animação e jogos educacionais como meios de expressar uma ideia.",
  },
  EF03CO09: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso da tecnologia",
    habilidade:
      "Reconhecer o potencial impacto do compartilhamento de informações pessoais ou de seus pares em meio digital.",
    resumo:
      "Endereço, escola e nomes da família nas mãos erradas têm consequência — inclusive dentro de um jogo online.",
  },

  /* ─────────────────────────────────────────────────── 4º ano ─────────── */

  EF04CO01: {
    eixo: "Pensamento Computacional",
    objeto: "Matrizes e registros",
    habilidade:
      "Reconhecer objetos do mundo real e/ou digital que podem ser representados através de matrizes que estabelecem uma organização na qual cada componente está em uma posição definida por coordenadas, fazendo manipulações simples sobre estas representações.",
    resumo:
      "Matriz é linha e coluna: cada dado mora numa coordenada — batalha naval, caixa de ovos, fachada de prédio.",
  },
  EF04CO02: {
    eixo: "Pensamento Computacional",
    objeto: "Matrizes e registros",
    habilidade:
      "Reconhecer objetos do mundo real e/ou digital que podem ser representados através de registros que estabelecem uma organização na qual cada componente é identificado por um nome, fazendo manipulações sobre estas representações.",
    resumo:
      "Registro agrupa dados de tipos diferentes, e cada um é acessado pelo nome — como num documento de identidade.",
  },
  EF04CO03: {
    eixo: "Pensamento Computacional",
    objeto: "Algoritmos com repetições simples e aninhadas",
    habilidade:
      "Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências e repetições simples e aninhadas (iterações definidas e indefinidas), para resolver problemas de forma independente e em colaboração.",
    resumo:
      "Repetição dentro de repetição: lavar 20 janelas, e repetir isso em 10 andares.",
  },
  EF04CO04: {
    eixo: "Mundo Digital",
    objeto: "Codificação da informação",
    habilidade:
      "Entender que para guardar, manipular e transmitir dados deve-se codificá-los de alguma forma que seja compreendida pela máquina (formato digital).",
    resumo:
      "O processador só opera em dois níveis de tensão: para a máquina guardar e transmitir, o dado vira 0 e 1.",
  },
  EF04CO05: {
    eixo: "Mundo Digital",
    objeto: "Codificação da informação",
    habilidade:
      "Codificar diferentes informações para representação em computador (binária, ASCII, atributos de pixel, como RGB etc.).",
    resumo:
      "Cada tipo de informação tem a sua codificação: ASCII para caractere, matriz de cores para imagem.",
  },
  EF04CO06: {
    eixo: "Cultura Digital",
    objeto: "Uso de tecnologias computacionais",
    habilidade:
      "Usar diferentes ferramentas computacionais para criação de conteúdo (textos, apresentações, vídeos etc.).",
    resumo:
      "Explorar editor de texto, de imagem, de vídeo e de apresentação para produzir conteúdo próprio.",
  },
  EF04CO07: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso da tecnologia",
    habilidade:
      "Demonstrar postura ética nas atividades de coleta, transferência, guarda e uso de dados.",
    resumo:
      "Ao baixar e compartilhar imagem, música ou vídeo, verificar permissões e autoria antes.",
  },
  EF04CO08: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso da tecnologia",
    habilidade:
      "Reconhecer a importância de verificar a confiabilidade das fontes de informações obtidas na Internet.",
    resumo:
      "Toda informação da Internet tem uma fonte, e duas páginas sobre o mesmo tema podem se contradizer.",
  },

  /* ─────────────────────────────────────────────────── 5º ano ─────────── */

  EF05CO01: {
    eixo: "Pensamento Computacional",
    objeto: "Listas e grafos",
    habilidade:
      "Reconhecer objetos do mundo real e/ou digital que podem ser representados através de listas que estabelecem uma organização na qual há um número variável de itens dispostos em sequência, fazendo manipulações simples sobre estas representações.",
    resumo:
      "Lista é uma sequência sem tamanho fixo: fila de pessoas, monte de cartas, lista de alunos.",
  },
  EF05CO02: {
    eixo: "Pensamento Computacional",
    objeto: "Listas e grafos",
    habilidade:
      "Reconhecer objetos do mundo real e digital que podem ser representados através de grafos que estabelecem uma organização com uma quantidade variável de vértices conectados por arestas, fazendo manipulações simples sobre estas representações.",
    resumo:
      "Grafo é vértice (objeto) e aresta (relação): mapas, redes sociais, árvores genealógicas.",
  },
  EF05CO03: {
    eixo: "Pensamento Computacional",
    objeto: "Lógica computacional",
    habilidade:
      "Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores 'verdadeiro' e 'falso'.",
    resumo:
      "Combinar sentenças com NÃO, E e OU, e dizer o valor verdade do resultado.",
  },
  EF05CO04: {
    eixo: "Pensamento Computacional",
    objeto: "Algoritmos com seleção condicional",
    habilidade:
      "Criar e simular algoritmos representados em linguagem oral, escrita ou pictográfica, que incluam sequências, repetições e seleções condicionais para resolver problemas de forma independente e em colaboração.",
    resumo:
      "Escolher o próximo passo conforme a condição: 'se o semáforo estiver vermelho, aguardar na calçada'.",
  },
  EF05CO05: {
    eixo: "Mundo Digital",
    objeto: "Arquitetura de computadores",
    habilidade:
      "Identificar os componentes principais de um computador (dispositivos de entrada/saída, processadores e armazenamento).",
    resumo:
      "As peças que formam a máquina: entrada e saída, processador, memória e disco.",
  },
  EF05CO06: {
    eixo: "Mundo Digital",
    objeto: "Armazenamento de dados",
    habilidade:
      "Reconhecer que os dados podem ser armazenados em um dispositivo local ou remoto.",
    resumo:
      "Os dados ficam no disco do próprio computador, num dispositivo removível ou na nuvem.",
  },
  EF05CO07: {
    eixo: "Mundo Digital",
    objeto: "Sistema operacional",
    habilidade:
      "Reconhecer a necessidade de um sistema operacional para a execução de programas e gerenciamento do hardware.",
    resumo:
      "O sistema operacional é o software que gerencia memória, arquivos e dispositivos para os programas rodarem.",
  },
  EF05CO08: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso da tecnologia",
    habilidade:
      "Acessar as informações na Internet de forma crítica para distinguir os conteúdos confiáveis de não confiáveis.",
    resumo:
      "Ler a Internet com olhar crítico, separando conteúdo confiável de notícia falsa.",
  },
  EF05CO09: {
    eixo: "Cultura Digital",
    objeto: "Segurança e responsabilidade no uso da tecnologia",
    habilidade:
      "Usar informações considerando aplicações e limites dos direitos autorais em diferentes mídias digitais.",
    resumo:
      "Música, filme e livro têm autor: usar e compartilhar exige citar a fonte e respeitar o limite.",
  },
  EF05CO10: {
    eixo: "Cultura Digital",
    objeto: "Uso de tecnologias computacionais",
    habilidade:
      "Expressar-se crítica e criativamente na compreensão das mudanças tecnológicas no mundo do trabalho e sobre a evolução da sociedade.",
    resumo:
      "Falar sobre o que a tecnologia mudou no cotidiano e no trabalho — e dizer isso de forma criativa.",
  },
  EF05CO11: {
    eixo: "Cultura Digital",
    objeto: "Uso de tecnologias computacionais",
    habilidade:
      "Identificar a adequação de diferentes tecnologias computacionais na resolução de problemas.",
    resumo:
      "Cada problema pede a sua tecnologia: o computador para a história em quadrinhos, o celular para a ligação.",
  },

  /* ────────────────────────────────── transversal, 1º ao 5º ano ───────── */

  EF15CO01: {
    eixo: "Pensamento Computacional",
    objeto: "Organização e representação da informação",
    habilidade:
      "Identificar as principais formas de organizar e representar a informação de maneira estruturada (matrizes, registros, listas e grafos) ou não estruturada (números, palavras, valores verdade).",
    resumo:
      "As formas de guardar informação: matriz, registro, lista e grafo — ou solta, sem estrutura nenhuma.",
  },
  EF15CO02: {
    eixo: "Pensamento Computacional",
    objeto: "Algoritmos",
    habilidade:
      "Construir e simular algoritmos, de forma independente ou em colaboração, que resolvam problemas simples e do cotidiano com uso de sequências, seleções condicionais e repetições de instruções.",
    resumo:
      "Montar e rodar algoritmos do dia a dia com sequência, condição e repetição.",
  },
  EF15CO03: {
    eixo: "Pensamento Computacional",
    objeto: "Lógica computacional",
    habilidade:
      "Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores 'verdadeiro' e 'falso'.",
    resumo:
      "Operar sobre sentenças lógicas com NÃO, E e OU, e determinar verdadeiro ou falso.",
  },
  EF15CO04: {
    eixo: "Pensamento Computacional",
    objeto: "Decomposição",
    habilidade:
      "Aplicar a estratégia de decomposição para resolver problemas complexos, dividindo esse problema em partes menores, resolvendo-as e combinando suas soluções.",
    resumo:
      "Dividir o problema complexo em partes menores, resolver cada uma e combinar as soluções.",
  },
};

/* ─────────────────────────────────────────────── ano e agrupamento ───── */

/**
 * O prefixo do código, que é o que agrupa por ano.
 *
 * "EF15" NÃO é o 15º ano: é a etapa inteira, 1º ao 5º. Por isso a tabela
 * explícita, e nunca um parseInt no meio da string.
 */
export const YEAR_CODES = [
  { code: "EF01", label: "1º ano" },
  { code: "EF02", label: "2º ano" },
  { code: "EF03", label: "3º ano" },
  { code: "EF04", label: "4º ano" },
  { code: "EF05", label: "5º ano" },
  { code: "EF15", label: "1º ao 5º" },
] as const;

export type YearCode = (typeof YEAR_CODES)[number]["code"];

/** "EF03CO08" -> "EF03". */
export function yearCodeOf(skill: SkillCode): YearCode {
  return skill.slice(0, 4) as YearCode;
}

/** "EF03CO08" -> "3º ano". Devolve o próprio prefixo se ele for novo. */
export function yearLabelOf(skill: SkillCode): string {
  const code = yearCodeOf(skill);
  return YEAR_CODES.find((y) => y.code === code)?.label ?? code;
}

export function skillInfo(skill: SkillCode): SkillInfo | undefined {
  return SKILLS[skill];
}
