import type {
  InvestigationLevel,
  SafetyInfo,
  ConsequenceScenario,
  IncidentCase,
} from "../types";

export const SAFETY_INFOS: SafetyInfo[] = [
  {
    text: "Meu nome é Pedro",
    icon: "🏷️",
    isSafe: true,
    explanation: "Seu primeiro nome geralmente é seguro de compartilhar.",
  },
  {
    text: "Minha senha é abc123",
    icon: "🔑",
    isSafe: false,
    explanation: "Nunca compartilhe sua senha com ninguém!",
  },
  {
    text: "Tenho 9 anos",
    icon: "🎂",
    isSafe: true,
    explanation: "A sua idade sozinha raramente é um dado perigoso.",
  },
  {
    text: "Moro na Rua das Flores, 42",
    icon: "🏠",
    isSafe: false,
    explanation: "Seu endereço completo é um dado muito perigoso!",
  },
  {
    text: "Estudo na Escola Municipal Centro",
    icon: "🏫",
    isSafe: false,
    explanation: "O nome da sua escola revela onde você está todos os dias.",
  },
  {
    text: "Minha comida favorita é pizza",
    icon: "🍕",
    isSafe: true,
    explanation: "Preferências pessoais inofensivas são seguras de compartilhar.",
  },
];

export const CONSEQUENCE_SCENARIOS: ConsequenceScenario[] = [
  {
    scenario: "Ana postou seu endereço completo em um jogo online",
    personEmoji: "👧",
    correct: "Um estranho foi até a casa dela",
    wrong: ["Ela ganhou pontos no jogo", "O jogo ficou mais rápido"],
  },
  {
    scenario: "Pedro disse sua senha para um amigo da escola",
    personEmoji: "👦",
    correct: "O amigo entrou na conta dele sem permissão",
    wrong: ["Pedro ficou mais popular", "A senha ficou mais segura"],
  },
  {
    scenario: "Bia publicou o nome da sua escola nas redes sociais",
    personEmoji: "👧",
    correct: "Pessoas desconhecidas descobriram onde ela estuda",
    wrong: ["Ela fez novos amigos virtuais", "A escola ficou famosa"],
  },
];

export const INCIDENT_CASES: IncidentCase[] = [
  {
    incident:
      "Carlos participou de um sorteio online e informou seu CEP, endereço e telefone.",
    personEmoji: "👦",
    step1: {
      q: "Qual foi o erro de Carlos?",
      correct: "Compartilhar dados pessoais para ganhar prêmio",
      wrong: ["Jogar em sites online", "Pedir autorização dos pais"],
    },
    step2: {
      q: "O que Carlos deveria ter feito?",
      correct: "Pedir para um adulto verificar se o site é confiável",
      wrong: [
        "Dar menos informações e participar mesmo assim",
        "Ignorar o sorteio e contar para os amigos",
      ],
    },
  },
  {
    incident:
      "Sofia tirou foto da capa do seu caderno com o nome, turma e telefone dos pais e postou no grupo da escola.",
    personEmoji: "👧",
    step1: {
      q: "Qual informação era perigosa compartilhar?",
      correct: "O telefone dos pais na foto",
      wrong: ["O nome da turma", "A capa colorida do caderno"],
    },
    step2: {
      q: "Como Sofia poderia compartilhar a foto com segurança?",
      correct: "Cobrir os dados pessoais antes de postar",
      wrong: [
        "Mandar só para os amigos próximos",
        "Usar um apelido no caderno",
      ],
    },
  },
];

export const LEVELS: InvestigationLevel[] = [
  {
    level: 1,
    title: "Seguro ou Perigoso?",
    objective:
      "Identifique se cada informação é segura ou perigosa de compartilhar na internet.",
    detail:
      "Analise cada dado pessoal e classifique corretamente. Cuidado — alguns dados parecem inofensivos!",
    tip: "Pense: se um estranho soubesse essa informação, ele poderia te encontrar?",
    timeLimit: 30,
    safetyInfos: SAFETY_INFOS,
  },
  {
    level: 2,
    title: "Qual a Consequência?",
    objective:
      "Descubra o que pode acontecer quando dados pessoais são compartilhados de forma errada.",
    detail:
      "Leia o cenário e escolha a consequência mais provável. Um detetive deve prever as consequências!",
    tip: "Pense nas consequências reais que podem acontecer com cada informação compartilhada.",
    timeLimit: 45,
    scenarios: CONSEQUENCE_SCENARIOS,
  },
  {
    level: 3,
    title: "Investigação Completa",
    objective:
      "Analise incidentes de segurança e descubra o erro e a solução correta.",
    detail:
      "Para cada incidente: primeiro identifique o erro, depois escolha a melhor solução.",
    tip: "Um bom detetive sempre encontra o erro E a solução!",
    timeLimit: 55,
    incidents: INCIDENT_CASES,
  },
];
