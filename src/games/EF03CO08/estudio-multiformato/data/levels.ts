import type { StudioLevel, FormatOption } from "../types";

export const FORMAT_OPTIONS: FormatOption[] = [
  { id: "drawing", label: "Desenho", icon: "", color: 0xe91e8c },
  { id: "text", label: "Texto", icon: "", color: 0x2196f3 },
  { id: "audio", label: "Som", icon: "", color: 0x9c27b0 },
  { id: "photo", label: "Foto", icon: "", color: 0x4caf50 },
];

/**
 * Textos deliberadamente curtos: a criança do 3º ano lê pouco e sob tempo.
 * `objective` e `tip` aparecem SÓ na abertura; o HUD não repete nada.
 * `goal` e `instruction` cabem em uma linha na largura do painel.
 */
export const LEVELS: StudioLevel[] = [
  {
    level: 1,
    title: "Qual Ferramenta?",
    objective: "Escolha o formato certo para cada pedido.",
    tip: "Imagem, palavra, som ou foto?",
    timeLimit: 30,
    formatMatchTasks: [
      {
        id: "t1",
        goal: "Bina quer ilustrar o pôr do sol.",
        correctFormat: "drawing",
        hint: "Ilustração pede Desenho.",
      },
      {
        id: "t2",
        goal: "Leo quer escrever um recado de aniversário.",
        correctFormat: "text",
        hint: "Palavras pedem Texto.",
      },
      {
        id: "t3",
        goal: "Maya quer gravar o barulho do rio.",
        correctFormat: "audio",
        hint: "Barulho pede Som.",
      },
    ],
  },
  {
    level: 2,
    title: "Criar e Publicar",
    objective: "Crie um desenho e um texto, e publique no mural.",
    tip: "Termine a criação para liberar o Publicar.",
    timeLimit: 50,
    drawChallenge: {
      type: "drawing",
      theme: "A natureza",
      instruction: "Pinte 8 manchas.",
      colors: [0x22c55e, 0x2196f3, 0xff9800, 0xe91e8c],
      minStrokes: 8,
    },
    textChallenge: {
      type: "text",
      theme: "Meu lugar favorito",
      instruction: "Escolha 3 palavras.",
      wordBank: ["sol", "parque", "flores", "alegre", "amigos", "brincar", "colorido", "lindo"],
      minWords: 3,
    },
  },
  {
    level: 3,
    title: "Missão Criativa",
    objective: "Toque no formato certo, crie e publique duas produções.",
    tip: "O cartão escolhido já vale como resposta.",
    timeLimit: 60,
    creationCycles: [
      {
        goal: "Fazer um desenho do seu bairro.",
        correctFormat: "drawing",
        formatOptions: ["drawing", "text", "audio"],
        challenge: {
          type: "drawing",
          theme: "Meu bairro",
          instruction: "Pinte 6 manchas.",
          colors: [0x22c55e, 0x2196f3, 0xff9800, 0xe91e8c],
          minStrokes: 6,
        },
      },
      {
        goal: "Escrever sobre seu animal favorito.",
        correctFormat: "text",
        formatOptions: ["text", "drawing", "photo"],
        challenge: {
          type: "text",
          theme: "Meu animal favorito",
          instruction: "Escolha 3 palavras.",
          wordBank: ["fofo", "rápido", "peludo", "favorito", "lindo", "grande", "pequeno", "meu"],
          minWords: 3,
        },
      },
    ],
  },
];
