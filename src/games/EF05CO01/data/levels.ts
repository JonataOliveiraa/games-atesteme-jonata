import type { CardData, ListLevel } from "../types";

const hearts = (id: string, label: string, value: number): CardData => ({ id, label, value, suit: "copas" });
const spades = (id: string, label: string, value: number): CardData => ({ id, label, value, suit: "espadas" });
const joker = (id: string): CardData => ({ id, label: "Coringa", value: 7, suit: "coringa", joker: true });

export const LEVELS: ListLevel[] = [
  {
    level: 1,
    title: "Inserir na Ordem",
    objective: "Coloque o 6 entre as cartas vizinhas corretas.",
    instruction: "Toque na carta nova e depois no espaço certo da lista.",
    mode: "insert",
    timeLimit: 35,
    initialCards: [
      hearts("h2", "2", 2),
      hearts("h4", "4", 4),
      hearts("h8", "8", 8),
      hearts("h10", "10", 10),
    ],
    actionCards: [hearts("h6", "6", 6)],
    expectedCards: [
      hearts("h2", "2", 2),
      hearts("h4", "4", 4),
      hearts("h6", "6", 6),
      hearts("h8", "8", 8),
      hearts("h10", "10", 10),
    ],
    hint: "O 6 vem depois do 4 e antes do 8.",
    successMessage: "Perfeito! A carta entrou entre suas vizinhas corretas.",
  },
  {
    level: 2,
    title: "Trocar Valores",
    objective: "Substitua todos os 7 por cartas coringa.",
    instruction: "Toque nas cartas de valor 7 para transformá-las em coringa.",
    mode: "replace",
    timeLimit: 40,
    targetValue: 7,
    initialCards: [
      hearts("h3", "3", 3),
      hearts("h7a", "7", 7),
      hearts("h7b", "7", 7),
      hearts("h9", "9", 9),
      hearts("h11", "J", 11),
    ],
    actionCards: [],
    expectedCards: [
      hearts("h3", "3", 3),
      joker("j7a"),
      joker("j7b"),
      hearts("h9", "9", 9),
      hearts("h11", "J", 11),
    ],
    hint: "Procure todas as cartas com valor 7. As outras continuam iguais.",
    successMessage: "Boa busca! Todos os 7 viraram coringa sem bagunçar a lista.",
  },
  {
    level: 3,
    title: "Ajustar a Lista",
    objective: "Remova o 4 e encaixe o 9 no lugar certo.",
    instruction: "Toque no 4 para remover. Depois toque no 9 e no espaço correto.",
    mode: "mixed",
    timeLimit: 50,
    initialCards: [
      spades("s2", "2", 2),
      spades("s4", "4", 4),
      spades("s6", "6", 6),
      spades("s8", "8", 8),
      spades("s11", "J", 11),
      joker("j13"),
    ],
    actionCards: [spades("s9", "9", 9)],
    expectedCards: [
      spades("s2", "2", 2),
      spades("s6", "6", 6),
      spades("s8", "8", 8),
      spades("s9", "9", 9),
      spades("s11", "J", 11),
      joker("j13"),
    ],
    hint: "Primeiro tire o 4. O 9 fica depois do 8 e antes do J.",
    successMessage: "Lista organizada! Você removeu e inseriu mantendo a ordem.",
  },
];

export function areListsEqual(current: CardData[], expected: CardData[]) {
  if (current.length !== expected.length) return false;
  return current.every((card, index) => {
    const expectedCard = expected[index];
    return card.value === expectedCard.value && Boolean(card.joker) === Boolean(expectedCard.joker);
  });
}
