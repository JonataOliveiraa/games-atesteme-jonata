import type { InfoLevel, InfoPiece } from "../types";

const palette = {
  blue: 0x38bdf8,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  green: 0x22c55e,
  red: 0xef4444,
  pink: 0xec4899,
  yellow: 0xfacc15,
};

export const LEVELS: InfoLevel[] = [
  {
    level: 1,
    title: "Convite da Festa",
    instruction: "Escolha os dados certos para completar o convite.",
    timeLimit: 25,
    mode: "invite",
    fields: [
      { id: "day", label: "Dia", accepts: "date-day" },
      { id: "month", label: "Mês", accepts: "date-month" },
      { id: "year", label: "Ano", accepts: "date-year" },
    ],
    pieces: [
      { id: "date-day", label: "12", shortLabel: "12", color: palette.blue },
      { id: "date-month", label: "abril", shortLabel: "abril", color: palette.orange },
      { id: "date-year", label: "2026", shortLabel: "2026", color: palette.green },
      { id: "date-place-extra", label: "Rua das Flores", shortLabel: "Rua das Flores", color: palette.purple },
      { id: "date-color-extra", label: "azul", shortLabel: "azul", color: palette.pink },
    ],
    resultTitle: "Convite completo",
    resultText: "Festa em 12 de abril de 2026.",
    successMessage: "O convite agora tem uma data completa!",
    hint: "Para completar a data do convite, use dia, mês e ano. Rua e cor são dados verdadeiros, mas não formam essa data.",
  },
  {
    level: 2,
    title: "Envelope de Entrega",
    instruction: "Monte o endereço para a encomenda chegar ao destino.",
    timeLimit: 35,
    mode: "address",
    fields: [
      { id: "street", label: "Rua", accepts: "address-street" },
      { id: "number", label: "Número", accepts: "address-number" },
      { id: "neighborhood", label: "Bairro", accepts: "address-neighborhood" },
      { id: "city", label: "Cidade", accepts: "address-city" },
      { id: "zip", label: "CEP", accepts: "address-zip" },
    ],
    pieces: [
      { id: "address-street", label: "Rua Ipê Amarelo", shortLabel: "Rua Ipê", color: palette.blue },
      { id: "address-number", label: "120", shortLabel: "120", color: palette.orange },
      { id: "address-neighborhood", label: "Jardim Sol", shortLabel: "Jardim Sol", color: palette.green },
      { id: "address-city", label: "Recife", shortLabel: "Recife", color: palette.purple },
      { id: "address-zip", label: "50000-000", shortLabel: "50000-000", color: palette.red },
      { id: "address-age-extra", label: "8 anos", shortLabel: "8 anos", color: palette.pink },
      { id: "address-month-extra", label: "abril", shortLabel: "abril", color: palette.yellow },
    ],
    resultTitle: "Envelope pronto",
    resultText: "Rua Ipê Amarelo, 120 - Jardim Sol, Recife - CEP 50000-000.",
    successMessage: "A encomenda agora tem endereço completo!",
    hint: "Um endereço precisa de dados de lugar. Idade e mês podem ser dados, mas não completam este envelope.",
  },
  {
    level: 3,
    title: "Ficha da Luna",
    instruction: "Complete a ficha para conhecer a personagem.",
    timeLimit: 45,
    mode: "character",
    fields: [
      { id: "name", label: "Nome", accepts: "character-name" },
      { id: "age", label: "Idade", accepts: "character-age" },
      { id: "city", label: "Cidade", accepts: "character-city" },
      { id: "favorite-color", label: "Cor favorita", accepts: "character-color" },
      { id: "pet", label: "Pet", accepts: "character-pet" },
    ],
    pieces: [
      { id: "character-name", label: "Luna", shortLabel: "Luna", color: palette.purple },
      { id: "character-age", label: "8 anos", shortLabel: "8 anos", color: palette.orange },
      { id: "character-city", label: "Recife", shortLabel: "Recife", color: palette.blue },
      { id: "character-color", label: "azul", shortLabel: "azul", color: palette.cyan },
      { id: "character-pet", label: "gato", shortLabel: "gato", color: palette.green },
      { id: "character-street-extra", label: "Rua Ipê", shortLabel: "Rua Ipê", color: palette.red },
    ],
    resultTitle: "Ficha completa",
    resultText: "Luna tem 8 anos, mora em Recife, gosta de azul e tem um gato.",
    successMessage: "Agora os dados contam quem é a Luna!",
    hint: "A ficha pede dados sobre a personagem. Rua é um dado verdadeiro, mas é extra para esta missão.",
  },
];

export function shufflePieces(pieces: InfoPiece[]) {
  return [...pieces].sort(() => Math.random() - 0.5);
}
