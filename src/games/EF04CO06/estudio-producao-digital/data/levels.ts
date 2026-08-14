import type { StudioProductionLevel } from "../types";

export const LEVELS: StudioProductionLevel[] = [
  {
    level: 1,
    title: "Escolha o Formato",
    objective: "Toque no formato digital correto para cada projeto",
    detail: "Cada projeto de comunicação usa um formato diferente!",
    tip: "Texto = comunicar por escrito · Slides = apresentar visualmente · Vídeo = mostrar em ação",
    timeLimit: 35,
    n1Briefings: [
      {
        text: "Precisamos de um texto para anunciar a festa da escola",
        correct: "text",
      },
      {
        text: "O professor quer que os alunos apresentem o projeto na TV da escola",
        correct: "slides",
      },
      {
        text: "Queremos mostrar os bastidores da produção da horta escolar",
        correct: "video",
      },
      {
        text: "A diretora precisa de um comunicado escrito para os pais",
        correct: "text",
      },
    ],
  },
  {
    level: 2,
    title: "Produza o Conteúdo",
    objective: "Toque nos elementos na ordem correta para montar o conteúdo",
    detail: "Cada produção tem 3 partes — coloque-as na sequência certa!",
    tip: "Leia com atenção e pense na ordem lógica da história ou apresentação",
    timeLimit: 45,
    n2Tasks: [
      {
        format: "text",
        // Shown in scrambled order; correct sequence: index 1 → 0 → 2
        items: [
          "Os alunos trabalharam muito para preparar decorações e apresentações.",
          "Era uma vez uma escola animada que decidiu organizar uma grande festa.",
          "No final, todos ficaram felizes e prometeram fazer outro evento em breve!",
        ],
        correctOrder: [1, 0, 2],
      },
      {
        format: "slides",
        // Shown scrambled; correct sequence: index 1 → 2 → 0
        items: [
          "Conclusão: o que aprendemos com o projeto?",
          "Introdução: o tema que vamos apresentar",
          "Desenvolvimento: os detalhes e exemplos",
        ],
        correctOrder: [1, 2, 0],
      },
      {
        format: "video",
        // Shown scrambled; correct sequence: index 1 → 2 → 0
        items: [
          "Cena final: encerramento e créditos do vídeo",
          "Cena inicial: apresentação do tema e participantes",
          "Cena principal: o conteúdo em ação e depoimentos",
        ],
        correctOrder: [1, 2, 0],
      },
    ],
  },
  {
    level: 3,
    title: "Revisão e Publicação",
    objective: "Encontre os erros e corrija antes de publicar!",
    detail: "Toque nos itens marcados com ❌ para selecioná-los, depois publique",
    tip: "Sempre revise seu conteúdo antes de publicar para o público!",
    timeLimit: 55,
    n3Productions: [
      {
        type: "text",
        items: [
          "❌ Título: festa da escola  (deve começar com letra maiúscula)",
          "❌ Data: 15 de maro  (erro de ortografia: 'maro' → 'março')",
          "Local: Ginásio da escola",
          "Hora: 14h — entrada franca para todos",
        ],
        errors: [0, 1],
      },
      {
        type: "slides",
        items: [
          "Slide 1: Introdução ao projeto da horta escolar",
          "❌ Slide 2: [Foto sem legenda ou descrição]",
          "❌ Slide 3: Desenvolvimento — falta o texto explicativo",
          "Slide 4: Obrigado pela atenção! Dúvidas?",
        ],
        errors: [1, 2],
      },
    ],
  },
];
