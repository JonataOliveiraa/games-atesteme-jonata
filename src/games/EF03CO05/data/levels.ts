import type { DataPiece, FormatLevel, FormatOption } from "../types";

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: "date",
    title: "Campos de data",
    subtitle: "Para guardar datas",
    color: 0x38bdf8,
  },
  {
    id: "pixels",
    title: "Grade de pixels",
    subtitle: "Para guardar imagens",
    color: 0xf59e0b,
  },
  {
    id: "text",
    title: "Sequência",
    subtitle: "Para guardar códigos",
    color: 0x8b5cf6,
  },
];

const palette = {
  blue: 0x38bdf8,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  green: 0x22c55e,
  red: 0xef4444,
  yellow: 0xfacc15,
};

export const LEVELS: FormatLevel[] = [
  {
    level: 1,
    title: "Guardar uma imagem",
    scenario: "Tina quer salvar no tablet uma faixa colorida que ela pintou.",
    instruction: "Escolha a caixa de pixels e monte a faixa: vermelho, azul e amarelo.",
    timeLimit: 25,
    requiredFormat: "pixels",
    mode: "pixels",
    slots: [
      { id: "pixel-1", label: "Vermelho", accepts: "color-red" },
      { id: "pixel-2", label: "Azul", accepts: "color-blue" },
      { id: "pixel-3", label: "Amarelo", accepts: "color-yellow" },
    ],
    pieces: [
      { id: "color-red", label: "vermelho", shortLabel: "vermelho", color: palette.red, visual: "paint" },
      { id: "color-blue", label: "azul", shortLabel: "azul", color: palette.blue, visual: "paint" },
      { id: "color-yellow", label: "amarelo", shortLabel: "amarelo", color: palette.yellow, visual: "paint" },
      { id: "day-18", label: "18", shortLabel: "18", color: palette.green, visual: "calendar" },
      { id: "extra-place", label: "sala 4", shortLabel: "sala 4", color: palette.purple, visual: "place" },
    ],
    resultTitle: "Imagem recuperada",
    resultText: "Os pixels formaram uma pequena faixa colorida.",
    successMessage: "A imagem apareceu porque cada cor foi guardada em um ponto da grade.",
    hint: "Nesta imagem, cada pixel tem uma cor e uma posição.",
  },
  {
    level: 2,
    title: "Guardar uma data",
    scenario: "João quer registrar no computador quando foi a viagem de férias da família.",
    instruction: "Escolha a caixa que guarda uma data e encaixe dia, mês e ano.",
    timeLimit: 35,
    requiredFormat: "date",
    mode: "date",
    slots: [
      { id: "day", label: "Dia", accepts: "day-18" },
      { id: "month", label: "Mês", accepts: "month-june" },
      { id: "year", label: "Ano", accepts: "year-2026" },
    ],
    pieces: [
      { id: "day-18", label: "18", shortLabel: "18", color: palette.blue, visual: "calendar" },
      { id: "month-june", label: "junho", shortLabel: "junho", color: palette.orange, visual: "calendar" },
      { id: "year-2026", label: "2026", shortLabel: "2026", color: palette.green, visual: "calendar" },
      { id: "extra-street", label: "rua", shortLabel: "rua", color: palette.purple, visual: "place" },
      { id: "extra-star", label: "estrela", shortLabel: "estrela", color: palette.yellow, visual: "star" },
    ],
    resultTitle: "Data recuperada",
    resultText: "18 de junho de 2026",
    successMessage: "A data foi lida porque dia, mês e ano ficaram no formato certo.",
    hint: "Uma data precisa de campos para dia, mês e ano.",
  },
  {
    level: 3,
    title: "Guardar um código",
    scenario: "A professora quer guardar no sistema o código de acesso de cada aluno.",
    instruction: "Escolha a caixa de sequência e monte o código: A-12.",
    timeLimit: 45,
    requiredFormat: "text",
    mode: "text",
    slots: [
      { id: "char-1", label: "A", accepts: "letter-a" },
      { id: "char-2", label: "-", accepts: "dash" },
      { id: "char-3", label: "1", accepts: "number-1" },
      { id: "char-4", label: "2", accepts: "number-2" },
    ],
    pieces: [
      { id: "letter-a", label: "A", shortLabel: "A", color: palette.purple, visual: "letter" },
      { id: "dash", label: "-", shortLabel: "-", color: palette.orange, visual: "letter" },
      { id: "number-1", label: "1", shortLabel: "1", color: palette.blue, visual: "letter" },
      { id: "number-2", label: "2", shortLabel: "2", color: palette.green, visual: "letter" },
      { id: "color-red", label: "vermelho", shortLabel: "vermelho", color: palette.red, visual: "paint" },
      { id: "extra-star", label: "estrela", shortLabel: "estrela", color: palette.yellow, visual: "star" },
    ],
    resultTitle: "Código recuperado",
    resultText: "A-12",
    successMessage: "O código foi lido porque os caracteres ficaram na ordem correta.",
    hint: "Neste código, cada caractere precisa ficar na posição certa.",
  },
];

export function shufflePieces(pieces: DataPiece[]) {
  return [...pieces].sort(() => Math.random() - 0.5);
}
