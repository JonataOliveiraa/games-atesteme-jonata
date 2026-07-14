import type { SourceLevel, SimulatedPage, N2Comparison, N3Ranking } from "../types";
import { CRITERIA as CRITERIA_DEF } from "../types";

export { CRITERIA_DEF as CRITERIA };

// ── N1 Pages ─────────────────────────────────────────────────────────────────

const N1_PAGES: SimulatedPage[] = [
  {
    title: "Como fazer um vulcão de bicarbonato",
    url: "www.experimentos-escolares.edu.br",
    author: "Profa. Ana Lima",
    date: "2023-05-10",
    siteType: "educational",
    language: "clear",
    citesSources: true,
    snippet:
      "Neste experimento, vamos aprender sobre reações químicas de forma segura e divertida. Você precisará de bicarbonato, vinagre e corante alimentar.",
    credibilityScore: 5,
    criteriaResults: { author: true, date: true, site: true, language: true, sources: true },
  },
  {
    title: "CIENTISTAS DESCOBREM CURA MILAGROSA!!!",
    url: "www.noticias-quentes-agora.com",
    author: null,
    date: "2024-01-20",
    siteType: "unknown",
    language: "sensational",
    citesSources: false,
    snippet:
      "Você não vai acreditar! Uma descoberta incrível está revolucionando tudo que você sabia. Clique aqui para saber mais sobre este milagre da ciência!",
    credibilityScore: 1,
    criteriaResults: { author: false, date: true, site: false, language: false, sources: false },
  },
  {
    title: "História do Brasil - República Velha",
    url: "www.historia.gov.br",
    author: "Ministério da Educação",
    date: "2021-08-15",
    siteType: "official",
    language: "clear",
    citesSources: true,
    snippet:
      "A República Velha (1889-1930) foi marcada pelo domínio político das oligarquias estaduais, especialmente de São Paulo e Minas Gerais.",
    credibilityScore: 5,
    criteriaResults: { author: true, date: true, site: true, language: true, sources: true },
  },
];

// ── N2 Pages ─────────────────────────────────────────────────────────────────

function makePage(
  title: string, url: string, credScore: number, summary: string,
  criteriaResults: SimulatedPage["criteriaResults"],
): SimulatedPage {
  return {
    title,
    url,
    author: credScore >= 4 ? "Equipe Editorial" : null,
    date: credScore >= 4 ? "2023-06-01" : "2019-03-10",
    siteType: credScore >= 4 ? "official" : "unknown",
    language: credScore >= 4 ? "clear" : "sensational",
    citesSources: credScore >= 4,
    snippet: "",
    credibilityScore: credScore,
    criteriaResults,
    summary,
  };
}

const N2_COMPARISONS: N2Comparison[] = [
  {
    pageA: makePage(
      "Alimentação Saudável",
      "www.saude.gov.br",
      5,
      "✓✓✓✓✓",
      { author: true, date: true, site: true, language: true, sources: true },
    ),
    pageB: makePage(
      "Dieta Incrível!",
      "www.blog-dietas.net",
      2,
      "✗✗✓✗✗",
      { author: false, date: false, site: false, language: true, sources: false },
    ),
    correct: "A",
  },
  {
    pageA: makePage(
      "Animais em Extinção",
      "www.ibama.gov.br",
      5,
      "✓✓✓✓✓",
      { author: true, date: true, site: true, language: true, sources: true },
    ),
    pageB: makePage(
      "Animais Fantásticos",
      "www.curiosidades123.com",
      1,
      "✗✓✗✗✗",
      { author: false, date: true, site: false, language: false, sources: false },
    ),
    correct: "A",
  },
  {
    pageA: makePage(
      "Blog de Ciências",
      "www.ciencias-legais.blog",
      3,
      "✓✓✗✓✗",
      { author: true, date: true, site: false, language: true, sources: false },
    ),
    pageB: makePage(
      "Ciências Hoje",
      "www.cienciahoje.com.br",
      4,
      "✓✓✓✓✗",
      { author: true, date: true, site: true, language: true, sources: false },
    ),
    correct: "B",
  },
];

// ── N3 Rankings ───────────────────────────────────────────────────────────────

const N3_RANKINGS: N3Ranking[] = [
  {
    pages: [
      {
        title: "Matemática Básica",
        url: "matematica.mec.gov.br",
        author: "MEC",
        date: "2023-01-01",
        siteType: "official",
        language: "clear",
        citesSources: true,
        snippet: "",
        credibilityScore: 5,
        criteriaResults: { author: true, date: true, site: true, language: true, sources: true },
        label: "A",
        summary: "✓✓✓✓✓",
      },
      {
        title: "Dicas de Matemática",
        url: "blog-math.blogspot.com",
        author: null,
        date: "2019-06-01",
        siteType: "blog",
        language: "vague",
        citesSources: false,
        snippet: "",
        credibilityScore: 2,
        criteriaResults: { author: false, date: false, site: false, language: false, sources: false },
        label: "B",
        summary: "✗✗✗✗✗",
      },
      {
        title: "Exercícios de Matemática",
        url: "escolavirtual.edu.br",
        author: "Prof. Carlos",
        date: "2022-03-10",
        siteType: "educational",
        language: "clear",
        citesSources: true,
        snippet: "",
        credibilityScore: 4,
        criteriaResults: { author: true, date: true, site: true, language: true, sources: false },
        label: "C",
        summary: "✓✓✓✓✗",
      },
    ],
    correctOrder: ["A", "C", "B"],
  },
  {
    pages: [
      {
        title: "Meio Ambiente 2019",
        url: "greenplanet.com",
        author: null,
        date: "2019-01-10",
        siteType: "unknown",
        language: "sensational",
        citesSources: false,
        snippet: "",
        credibilityScore: 2,
        criteriaResults: { author: false, date: false, site: false, language: false, sources: false },
        label: "A",
        summary: "✗✗✗✗✗",
      },
      {
        title: "Meio Ambiente Gov",
        url: "mma.gov.br",
        author: "Ministério do Meio Ambiente",
        date: "2023-09-05",
        siteType: "official",
        language: "clear",
        citesSources: true,
        snippet: "",
        credibilityScore: 5,
        criteriaResults: { author: true, date: true, site: true, language: true, sources: true },
        label: "B",
        summary: "✓✓✓✓✓",
      },
      {
        title: "Natureza e Cia",
        url: "natureza.ong.br",
        author: "Equipe Natureza",
        date: "2022-04-22",
        siteType: "educational",
        language: "clear",
        citesSources: false,
        snippet: "",
        credibilityScore: 3,
        criteriaResults: { author: true, date: true, site: true, language: false, sources: false },
        label: "C",
        summary: "✓✓✓✗✗",
      },
    ],
    correctOrder: ["B", "C", "A"],
  },
];

// ── Level Definitions ─────────────────────────────────────────────────────────

export const LEVELS: SourceLevel[] = [
  {
    level: 1,
    title: "Avalie a Fonte",
    objective: "Marque quais critérios de confiabilidade a página cumpre",
    detail: "Leia as informações da página e marque cada critério que ela satisfaz com ✓",
    tip: "Preste atenção ao autor, à data e ao tipo de site!",
    timeLimit: 35,
    n1Pages: N1_PAGES,
  },
  {
    level: 2,
    title: "Compare as Fontes",
    objective: "Qual fonte é mais confiável para sua pesquisa?",
    detail: "Analise as duas páginas e seus critérios. Toque na mais confiável.",
    tip: "Mais critérios cumpridos = mais confiável!",
    timeLimit: 45,
    n2Comparisons: N2_COMPARISONS,
  },
  {
    level: 3,
    title: "Classifique por Confiabilidade",
    objective: "Ordene as fontes da MAIS para MENOS confiável",
    detail: "Toque nas páginas em ordem: 1ª mais confiável, 2ª, depois 3ª",
    tip: "Compare o placar de critérios (✓) de cada página!",
    timeLimit: 55,
    n3Rankings: N3_RANKINGS,
  },
];
