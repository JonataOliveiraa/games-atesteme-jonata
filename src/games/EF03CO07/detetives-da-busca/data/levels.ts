import type { SearchLevel } from "../types";

export const FILTER_LABELS = {
  all: "Todos",
  images: "Imagens",
  videos: "Vídeos",
  sites: "Sites",
  news: "Notícias",
  kids: "Infantil",
} as const;

export const LEVELS: SearchLevel[] = [
  {
    level: 1,
    title: "Escolha a Palavra",
    objective: "Missão: descobrir qual animal vive no gelo.",
    timeLimit: 25,
    keywords: [
      { id: "cold-animal", label: "animal do gelo", quality: "ok" },
      { id: "penguin", label: "pinguim", quality: "best" },
      { id: "ice-cream", label: "sorvete gelado", quality: "weak" },
    ],
    filters: [{ id: "all", label: FILTER_LABELS.all }],
    results: [
      {
        id: "penguin-info",
        title: "Pinguim",
        source: "Enciclopédia Infantil",
        snippet: "Animal que vive em lugares frios e nada muito bem.",
        type: "sites",
        baseRank: 96,
        tags: ["pinguim", "animal do gelo", "animal"],
        explanation: "Essa pista responde à missão: pinguim é um animal de lugares frios.",
      },
      {
        id: "penguin-cartoon",
        title: "Desenho de pinguim",
        source: "Vídeos Kids",
        snippet: "É divertido, mas fala de personagem, não de pesquisa.",
        type: "videos",
        baseRank: 52,
        tags: ["pinguim", "desenho"],
        explanation: "Tem pinguim, mas não é a melhor pista para responder à missão.",
      },
      {
        id: "ice-cream",
        title: "Sorvete gelado",
        source: "Receitas Kids",
        snippet: "É gelado, mas não é um animal.",
        type: "sites",
        baseRank: 34,
        tags: ["sorvete gelado", "gelo"],
        explanation: "Apareceu por causa de gelado, mas fugiu do assunto.",
      },
    ],
    correctKeywordId: "penguin",
    correctFilterId: "all",
    correctResultId: "penguin-info",
    hint: "A melhor palavra-chave fala exatamente do que você quer encontrar.",
    successMessage: "Boa! Você escolheu uma palavra-chave clara e achou a resposta.",
  },
  {
    level: 2,
    title: "Use o Filtro",
    objective: "Missão: encontrar uma foto de uma onça-pintada.",
    timeLimit: 30,
    keywords: [
      { id: "jaguar", label: "onça", quality: "ok" },
      { id: "jaguar-spotted", label: "onça-pintada", quality: "best" },
      { id: "animal", label: "animal", quality: "weak" },
    ],
    filters: [
      { id: "all", label: FILTER_LABELS.all },
      { id: "images", label: FILTER_LABELS.images },
      { id: "videos", label: FILTER_LABELS.videos },
    ],
    results: [
      {
        id: "jaguar-photo",
        title: "Foto de onça-pintada",
        source: "Galeria Animal",
        snippet: "Imagem do animal com manchas na floresta.",
        type: "images",
        baseRank: 94,
        tags: ["onça", "onça-pintada", "animal", "imagem"],
        explanation: "A palavra é específica e o filtro Imagens combina com foto.",
      },
      {
        id: "car-brand",
        title: "Carro chamado Jaguar",
        source: "Revista de Veículos",
        snippet: "Fala de carro, não do animal.",
        type: "news",
        baseRank: 58,
        tags: ["onça"],
        explanation: "Apareceu por uma palavra parecida, mas não é o animal procurado.",
      },
      {
        id: "jaguar-video",
        title: "Vídeo de onça",
        source: "Vídeos da Natureza",
        snippet: "Mostra um vídeo, mas a missão pede uma foto.",
        type: "videos",
        baseRank: 66,
        tags: ["onça", "animal"],
        explanation: "É sobre onça, mas o objetivo pede imagem/foto.",
      },
    ],
    correctKeywordId: "jaguar-spotted",
    correctFilterId: "images",
    correctResultId: "jaguar-photo",
    hint: "Para achar foto, escolha uma palavra específica e o filtro Imagens.",
    successMessage: "Excelente! Você usou palavra e filtro para melhorar a busca.",
  },
  {
    level: 3,
    title: "Melhor Pista",
    objective: "Missão: aprender como plantar feijão no algodão.",
    timeLimit: 35,
    keywords: [
      { id: "bean", label: "feijão", quality: "ok" },
      { id: "plant-bean-cotton", label: "plantar feijão algodão", quality: "best" },
      { id: "bean-recipe", label: "receita de feijão", quality: "weak" },
    ],
    filters: [
      { id: "all", label: FILTER_LABELS.all },
      { id: "sites", label: FILTER_LABELS.sites },
      { id: "videos", label: FILTER_LABELS.videos },
    ],
    results: [
      {
        id: "moon-encyclopedia",
        title: "Como plantar feijão no algodão",
        source: "Experimentos da Escola",
        snippet: "Mostra materiais, passos e cuidados para observar o broto crescer.",
        type: "sites",
        baseRank: 96,
        tags: ["feijão", "plantar feijão algodão", "experimento", "escola"],
        explanation: "É a melhor pista porque ensina exatamente o experimento pedido.",
      },
      {
        id: "moon-myth",
        title: "Receita de feijão gostoso",
        source: "Cozinha Kids",
        snippet: "Ensina a preparar feijão para comer.",
        type: "sites",
        baseRank: 54,
        tags: ["feijão", "receita de feijão"],
        explanation: "Tem feijão, mas é receita. Não ensina a plantar.",
      },
      {
        id: "moon-video",
        title: "Música do feijãozinho",
        source: "Músicas Kids",
        snippet: "Canção divertida sobre sementes e plantas.",
        type: "videos",
        baseRank: 45,
        tags: ["feijão", "vídeos"],
        explanation: "Pode ser divertido, mas tem pouca informação para fazer o experimento.",
      },
    ],
    correctKeywordId: "plant-bean-cotton",
    correctFilterId: "sites",
    correctResultId: "moon-encyclopedia",
    hint: "Procure palavras que falem da ação e do assunto: plantar, feijão e algodão.",
    successMessage: "Perfeito! Você encontrou a pista mais útil para fazer o experimento.",
  },
];

export function scoreResult(level: SearchLevel, resultId: string, keywordId: string, filterId: string) {
  const result = level.results.find((item) => item.id === resultId);
  if (!result) return 0;
  const keyword = level.keywords.find((item) => item.id === keywordId);
  const keywordBoost = keyword && result.tags.includes(keyword.label.toLowerCase()) ? 24 : 0;
  const qualityBoost = keyword?.quality === "best" ? 18 : keyword?.quality === "ok" ? 8 : 0;
  const filterBoost = filterId === "all" ? 0 : result.type === filterId ? 30 : -22;
  return Math.max(5, result.baseRank + keywordBoost + qualityBoost + filterBoost);
}
