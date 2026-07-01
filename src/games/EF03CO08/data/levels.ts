import type { StudioLevel, FormatOption } from "../types";

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: "drawing", label: "Desenho", icon: "🎨", color: 0xe91e8c },
  { id: "text", label: "Texto", icon: "📝", color: 0x2196f3 },
  { id: "audio", label: "Som", icon: "🎵", color: 0x9c27b0 },
  { id: "photo", label: "Foto", icon: "📷", color: 0x4caf50 },
];

export const LEVELS: StudioLevel[] = [
  {
    level: 1,
    title: "Qual Ferramenta?",
    objective: "Escolha o formato digital certo para cada tarefa!",
    detail: "Cada tarefa criativa precisa de uma ferramenta diferente. Leia e toque no formato que melhor serve.",
    tip: "Pense: a tarefa precisa de imagem, palavra, som ou foto?",
    timeLimit: 30,
    formatMatchTasks: [
      {
        id: "t1",
        goal: "Bina quer criar um retrato colorido do pôr do sol para o mural da escola.",
        correctFormat: "drawing",
        hint: "Para criar imagens e retratos, use o Editor de Desenho! 🎨",
      },
      {
        id: "t2",
        goal: "Leo quer escrever uma mensagem de aniversário para o seu amigo.",
        correctFormat: "text",
        hint: "Para escrever palavras e frases, use o Editor de Texto! 📝",
      },
      {
        id: "t3",
        goal: "Maya quer registrar o barulho de um rio para um projeto de ciências.",
        correctFormat: "audio",
        hint: "Para capturar sons e barulhos, use o Gravador de Som! 🎵",
      },
    ],
  },
  {
    level: 2,
    title: "Criar e Publicar",
    objective: "Use as ferramentas para criar e publicar no mural da turma!",
    detail: "Primeiro desenhe sobre um tema. Depois escreva uma mensagem. Publique cada criação!",
    tip: "Complete a criação e toque em Publicar para enviar ao mural.",
    timeLimit: 50,
    drawChallenge: {
      type: "drawing",
      theme: "A natureza",
      instruction: "Pinte pelo menos 8 manchas para criar seu desenho da natureza!",
      colors: [0x22c55e, 0x2196f3, 0xff9800, 0xe91e8c],
      minStrokes: 8,
    },
    textChallenge: {
      type: "text",
      theme: "Meu lugar favorito",
      instruction: "Selecione pelo menos 3 palavras para criar sua mensagem!",
      wordBank: ["sol", "parque", "flores", "alegre", "amigos", "brincar", "colorido", "lindo"],
      minWords: 3,
    },
  },
  {
    level: 3,
    title: "Missão Criativa",
    objective: "Escolha o formato, crie e publique duas produções no mural!",
    detail: "Para cada missão: escolha o melhor formato digital, crie sua produção e publique.",
    tip: "Cada missão tem um objetivo diferente — leia com atenção antes de escolher.",
    timeLimit: 60,
    creationCycles: [
      {
        goal: "Mostrar visualmente como é o seu bairro para a turma.",
        correctFormat: "drawing",
        formatOptions: ["drawing", "text", "audio"],
        challenge: {
          type: "drawing",
          theme: "Meu bairro",
          instruction: "Pinte 6 manchas para criar seu desenho do bairro!",
          colors: [0x22c55e, 0x2196f3, 0xff9800, 0xe91e8c],
          minStrokes: 6,
        },
      },
      {
        goal: "Descrever com palavras qual é o seu animal favorito.",
        correctFormat: "text",
        formatOptions: ["text", "drawing", "photo"],
        challenge: {
          type: "text",
          theme: "Meu animal favorito",
          instruction: "Selecione 3 palavras para descrever seu animal!",
          wordBank: ["fofo", "rápido", "peludo", "favorito", "lindo", "grande", "pequeno", "meu"],
          minWords: 3,
        },
      },
    ],
  },
];
