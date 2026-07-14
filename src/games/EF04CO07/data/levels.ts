import type { EthicLevel, EthicSituation, EthicScenario, EthicDilemma } from "../types";

export const N1_SITUATIONS: EthicSituation[] = [
  {
    file: "foto 📸",
    owner: "sua amiga",
    emoji: "👧",
    situation: "Você encontrou uma foto da sua amiga no computador da escola.",
    actions: [
      { label: "Pedir permissão para usar", isEthical: true },
      { label: "Compartilhar com todos", isEthical: false },
      { label: "Guardar no meu dispositivo", isEthical: false },
    ],
  },
  {
    file: "redação 📝",
    owner: "seu colega",
    emoji: "👦",
    situation: "Você encontrou a redação do seu colega salva no computador da escola.",
    actions: [
      { label: "Copiar como se fosse minha", isEthical: false },
      { label: "Ignorar e não mexer", isEthical: true },
      { label: "Publicar no mural da escola", isEthical: false },
    ],
  },
  {
    file: "mensagem 💬",
    owner: "sua irmã",
    emoji: "👩",
    situation: "Você viu acidentalmente uma mensagem privada no celular da sua irmã.",
    actions: [
      { label: "Ler todas as mensagens", isEthical: false },
      { label: "Fechar e não ler mais", isEthical: true },
      { label: "Mostrar para os amigos", isEthical: false },
    ],
  },
  {
    file: "vídeo 🎬",
    owner: "seu professor",
    emoji: "👨‍🏫",
    situation: "Você encontrou um vídeo pessoal do professor na pasta compartilhada.",
    actions: [
      { label: "Avisar o professor e não assistir", isEthical: true },
      { label: "Assistir com a turma", isEthical: false },
      { label: "Deletar sem avisar ninguém", isEthical: false },
    ],
  },
];

export const N2_SCENARIOS: EthicScenario[] = [
  {
    decisions: [
      {
        situation: "Você tem fotos do projeto da turma e quer usar no trabalho.",
        actions: [
          { label: "Usar com créditos 'Foto: Turma 4A'", isEthical: true },
          { label: "Usar sem citar", isEthical: false },
          { label: "Não usar nenhuma foto", isEthical: false },
        ],
      },
      {
        situation: "Um colega quer copiar seu trabalho. Você:",
        actions: [
          { label: "Explica e ajuda ele a fazer o próprio", isEthical: true },
          { label: "Deixa copiar tudo", isEthical: false },
          { label: "Ignora e não ajuda", isEthical: false },
        ],
      },
      {
        situation: "Você encontrou um erro nos dados do amigo. Você:",
        actions: [
          { label: "Avisa o amigo discretamente", isEthical: true },
          { label: "Corrige sem avisar", isEthical: false },
          { label: "Conta para o professor sem avisar", isEthical: false },
        ],
      },
    ],
  },
  {
    decisions: [
      {
        situation: "Você tirou fotos no aniversário de um amigo. Ele pede para não postar.",
        actions: [
          { label: "Respeito e não posto nada", isEthical: true },
          { label: "Posto só as melhores", isEthical: false },
          { label: "Mando no grupo da turma", isEthical: false },
        ],
      },
      {
        situation: "Uma foto sua foi postada sem permissão. Você:",
        actions: [
          { label: "Peço para a pessoa remover", isEthical: true },
          { label: "Faço o mesmo com foto dela", isEthical: false },
          { label: "Ignoro", isEthical: false },
        ],
      },
      {
        situation: "Você quer usar a música favorita no vídeo da festa. Você:",
        actions: [
          { label: "Uso música de uso livre (Creative Commons)", isEthical: true },
          { label: "Baixo e uso qualquer música", isEthical: false },
          { label: "Grave sem música", isEthical: false },
        ],
      },
    ],
  },
];

export const N3_DILEMMAS: EthicDilemma[] = [
  {
    context:
      "Você encontrou dados pessoais de colegas (nome, endereço, telefone) num arquivo abandonado no computador da escola.",
    q1: {
      q: "O que você faz com esses dados?",
      correct: "Aviso a escola e não anoto nem repasso nada",
      options: [
        "Aviso a escola e não anoto nem repasso nada",
        "Guardo pra caso precisar um dia",
        "Mando no grupo para alertar a todos",
      ],
    },
    q2: {
      q: "Por que não deve repassar esses dados?",
      correct:
        "Porque dados pessoais pertencem às pessoas e divulgá-los sem permissão pode causar danos",
      options: [
        "Porque dados pessoais pertencem às pessoas e divulgá-los sem permissão pode causar danos",
        "Porque a escola pode me punir",
        "Porque os dados podem estar errados",
      ],
    },
  },
  {
    context:
      "Você criou um desenho muito bonito usando um aplicativo da escola. Um site quer comprar e usar seu trabalho.",
    q1: {
      q: "Antes de responder, o que você deve verificar?",
      correct: "Se o aplicativo permite uso comercial dos trabalhos criados nele",
      options: [
        "Se o aplicativo permite uso comercial dos trabalhos criados nele",
        "Se o preço é bom",
        "Se meus amigos aprovam",
      ],
    },
    q2: {
      q: "Se você usar trabalho de outra pessoa na sua criação, deve:",
      correct: "Pedir permissão e dar os créditos ao criador original",
      options: [
        "Pedir permissão e dar os créditos ao criador original",
        "Modificar um pouco para ficar diferente",
        "Só usar se for da internet",
      ],
    },
  },
];

export const LEVELS: EthicLevel[] = [
  {
    level: 1,
    title: "Ação Correta",
    objective: "Escolha a ação ética diante de cada situação com arquivos digitais!",
    detail: "Você encontrará arquivos de outras pessoas. Decida o que é correto fazer.",
    tip: "Respeitar a privacidade dos outros é sempre a escolha ética.",
    timeLimit: 35,
    n1Situations: N1_SITUATIONS,
  },
  {
    level: 2,
    title: "Sequência de Decisões",
    objective: "Complete os cenários tomando decisões éticas a cada passo!",
    detail: "Cada cenário tem 3 momentos de decisão. A barra de reputação registra suas escolhas.",
    tip: "Pense nas consequências antes de agir com dados de outras pessoas.",
    timeLimit: 45,
    n2Scenarios: N2_SCENARIOS,
  },
  {
    level: 3,
    title: "Dilema Ético",
    objective: "Resolva dilemas complexos sobre privacidade e autoria digital!",
    detail: "Cada dilema tem 2 perguntas encadeadas. Analise o contexto com atenção.",
    tip: "Dados pessoais pertencem às pessoas — protegê-los é um dever ético.",
    timeLimit: 55,
    n3Dilemmas: N3_DILEMMAS,
  },
];
