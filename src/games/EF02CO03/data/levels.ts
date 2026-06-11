import type { FactoryLevel, FactoryStage, FactoryStageId } from "../types";

export const LEVELS: FactoryLevel[] = [
  {
    level: 1,
    title: "Fábrica de Camisas",
    objective: "Organize as máquinas para fabricar uma camisa.",
    prompt: "Arraste as máquinas para a esteira na ordem certa.",
    timeLimit: 45,
    stages: [
      { id: "shirt-separate", label: "Separar o tecido", shortLabel: "Separar tecido", icon: "TEC", color: 0x38bdf8 },
      { id: "shirt-cut", label: "Cortar o tecido", shortLabel: "Cortar tecido", icon: "CUT", color: 0xf59e0b },
      { id: "shirt-sew", label: "Costurar as partes da camisa", shortLabel: "Costurar", icon: "SEW", color: 0x8b5cf6 },
      { id: "shirt-buttons", label: "Colocar os botões", shortLabel: "Botões", icon: "BTN", color: 0x22c55e },
      { id: "shirt-iron", label: "Passar a camisa", shortLabel: "Passar", icon: "AIR", color: 0xef4444 },
    ],
    solution: ["shirt-separate", "shirt-cut", "shirt-sew", "shirt-buttons", "shirt-iron"],
    productName: "Camisa",
    productStages: [
      { label: "Tecido separado", icon: "T", color: 0x38bdf8 },
      { label: "Tecido cortado", icon: "C", color: 0xf59e0b },
      { label: "Camisa costurada", icon: "S", color: 0x8b5cf6 },
      { label: "Botões colocados", icon: "B", color: 0x22c55e },
      { label: "Camisa pronta", icon: "OK", color: 0x2563eb, assetKey: "product-shirt-final" },
    ],
    successMessage: "Camisa produzida!",
    hint: "Pense no começo: antes de cortar, é preciso separar o tecido.",
  },
  {
    level: 2,
    title: "Fábrica de Pelúcias",
    objective: "Organize as máquinas para montar uma pelúcia.",
    prompt: "Coloque cada etapa da pelúcia no lugar certo da esteira.",
    timeLimit: 55,
    stages: [
      { id: "plush-separate", label: "Separar o tecido da pelúcia", shortLabel: "Separar tecido", icon: "TEC", color: 0x38bdf8 },
      { id: "plush-cut", label: "Cortar as partes da pelúcia", shortLabel: "Cortar partes", icon: "CUT", color: 0xf59e0b },
      { id: "plush-sew", label: "Costurar as peças", shortLabel: "Costurar", icon: "SEW", color: 0x8b5cf6 },
      { id: "plush-fill", label: "Colocar o enchimento", shortLabel: "Enchimento", icon: "FILL", color: 0x22c55e },
      { id: "plush-details", label: "Adicionar olhos e detalhes", shortLabel: "Olhos e detalhes", icon: "EYE", color: 0xec4899 },
    ],
    solution: ["plush-separate", "plush-cut", "plush-sew", "plush-fill", "plush-details"],
    productName: "Pelúcia",
    productStages: [
      { label: "Tecido separado", icon: "T", color: 0x38bdf8 },
      { label: "Partes cortadas", icon: "C", color: 0xf59e0b },
      { label: "Peças costuradas", icon: "S", color: 0x8b5cf6 },
      { label: "Pelúcia fofinha", icon: "P", color: 0x22c55e },
      { label: "Pelúcia sorridente", icon: ":)", color: 0xec4899, assetKey: "product-plush-final" },
    ],
    successMessage: "Pelúcia produzida!",
    hint: "A pelúcia só recebe enchimento depois que as peças já foram costuradas.",
  },
  {
    level: 3,
    title: "Centro de Envio",
    objective: "Organize as máquinas para preparar e enviar os pedidos.",
    prompt: "Monte a sequência para as caixas chegarem ao caminhão.",
    timeLimit: 30,
    stages: [
      { id: "shipping-check", label: "Conferir o produto", shortLabel: "Conferir", icon: "OK", color: 0x38bdf8 },
      { id: "shipping-pack", label: "Embalar o produto", shortLabel: "Embalar", icon: "BOX", color: 0xf59e0b },
      { id: "shipping-label", label: "Colocar a etiqueta", shortLabel: "Etiqueta", icon: "TAG", color: 0x8b5cf6 },
      { id: "shipping-sort", label: "Separar por destino", shortLabel: "Destino", icon: "MAP", color: 0x22c55e },
      { id: "shipping-load", label: "Carregar o caminhão", shortLabel: "Caminhão", icon: "TRK", color: 0xef4444 },
    ],
    solution: ["shipping-check", "shipping-pack", "shipping-label", "shipping-sort", "shipping-load"],
    productName: "Pedidos",
    productStages: [
      { label: "Produto conferido", icon: "OK", color: 0x38bdf8 },
      { label: "Produto embalado", icon: "BOX", color: 0xf59e0b },
      { label: "Etiqueta colocada", icon: "TAG", color: 0x8b5cf6 },
      { label: "Destino separado", icon: "D", color: 0x22c55e },
      { label: "Caminhão carregado", icon: "TRK", color: 0xef4444, assetKey: "product-shipping-final" },
    ],
    successMessage: "Produtos enviados!",
    hint: "Antes de carregar o caminhão, a caixa precisa estar conferida, embalada, etiquetada e separada.",
  },
];

export function getStage(level: FactoryLevel, id: FactoryStageId) {
  return level.stages.find((stage) => stage.id === id);
}

export function shuffleStages(stages: FactoryStage[]) {
  return [...stages].sort(() => Math.random() - 0.5);
}
