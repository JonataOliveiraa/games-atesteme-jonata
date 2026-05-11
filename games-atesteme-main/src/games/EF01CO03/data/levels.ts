import type { AlgorithmLevel } from "../types";

export const LEVELS: AlgorithmLevel[] = [
  {
    level: 1,
    title: "Fazer um sanduíche",
    objective: "Organize os passos para preparar o sanduíche.",
    timeLimit: 15,
    cards: [
      {
        id: "pegar-pao",
        label: "Pegar o pão",
        emoji: "🍞",
        type: "start",
        description: "Primeiro precisamos pegar o pão.",
      },
      {
        id: "colocar-recheio",
        label: "Colocar recheio",
        emoji: "🧀",
        type: "build",
        description: "Depois colocamos o recheio.",
      },
      {
        id: "fechar-sanduiche",
        label: "Fechar sanduíche",
        emoji: "🥪",
        type: "finish",
        description: "Por fim, fechamos o sanduíche.",
      },
    ],
    correctOrder: ["pegar-pao", "colocar-recheio", "fechar-sanduiche"],
  },

  {
    level: 2,
    title: "Plantar uma flor",
    objective: "Organize os passos para plantar uma florzinha.",
    timeLimit: 18,
    cards: [
      {
        id: "pegar-vaso",
        label: "Pegar o vaso",
        emoji: "🏺",
        type: "start",
        description: "Primeiro pegamos o vaso.",
      },
      {
        id: "colocar-terra",
        label: "Colocar terra",
        emoji: "🟤",
        type: "prepare",
        description: "Depois colocamos terra no vaso.",
      },
      {
        id: "plantar-semente",
        label: "Plantar semente",
        emoji: "🌱",
        type: "build",
        description: "Agora colocamos a semente.",
      },
      {
        id: "regar-planta",
        label: "Regar",
        emoji: "💧",
        type: "test",
        description: "Depois regamos a plantinha.",
      },
      {
        id: "flor-crescer",
        label: "Ver a flor crescer",
        emoji: "🌸",
        type: "finish",
        description: "A flor começa a crescer.",
      },
    ],
    correctOrder: [
      "pegar-vaso",
      "colocar-terra",
      "plantar-semente",
      "regar-planta",
      "flor-crescer",
    ],
  },

  {
  level: 3,
  title: "Escovar os dentes",
  objective: "Organize os passos para escovar os dentes na ordem correta.",
  timeLimit: 23,
  cards: [
    {
      id: "pegar-escova",
      label: "Pegar escova",
      emoji: "🦷",
      type: "start",
      description: "Primeiro pegamos a escova.",
    },
    {
      id: "colocar-pasta",
      label: "Colocar pasta",
      emoji: "🧴",
      type: "prepare",
      description: "Depois colocamos a pasta de dente.",
    },
    {
      id: "escovar-dentes",
      label: "Escovar dentes",
      emoji: "😁",
      type: "build",
      description: "Agora escovamos os dentes.",
    },
    {
      id: "enxaguar-boca",
      label: "Enxaguar a boca",
      emoji: "💧",
      type: "test",
      description: "Depois enxaguamos a boca.",
    },
    {
      id: "guardar-escova",
      label: "Guardar escova",
      emoji: "✅",
      type: "finish",
      description: "Por fim, guardamos a escova.",
    },
  ],
  correctOrder: [
    "pegar-escova",
    "colocar-pasta",
    "escovar-dentes",
    "enxaguar-boca",
    "guardar-escova",
  ],
}]