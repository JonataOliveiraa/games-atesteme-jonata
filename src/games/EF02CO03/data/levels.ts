import type { CommandDefinition, FactoryLevel, MachineDefinition } from "../types";

export const MACHINES: MachineDefinition[] = [
  {
    id: "calculator",
    name: "Calculadora",
    shortName: "Calculadora",
    icon: "+",
    color: 0x2563eb,
    acceptedCommands: ["add2", "double"],
  },
  {
    id: "folder",
    name: "Dobradeira",
    shortName: "Dobradeira",
    icon: "V",
    color: 0x8b5cf6,
    acceptedCommands: ["fold", "crease"],
  },
  {
    id: "stamper",
    name: "Carimbadora",
    shortName: "Carimbadora",
    icon: "*",
    color: 0xf59e0b,
    acceptedCommands: ["stampStar", "stampOk"],
  },
  {
    id: "mixer",
    name: "Mixer",
    shortName: "Mixer",
    icon: "~",
    color: 0x22c55e,
    acceptedCommands: ["addFruit", "blend"],
  },
];

export const COMMANDS: CommandDefinition[] = [
  { id: "add2", label: "Somar 2", icon: "+2", machine: "calculator" },
  { id: "double", label: "Dobrar", icon: "x2", machine: "calculator" },
  { id: "fold", label: "Dobrar papel", icon: "V", machine: "folder" },
  { id: "crease", label: "Apertar dobra", icon: "!", machine: "folder" },
  { id: "stampStar", label: "Estrela", icon: "*", machine: "stamper" },
  { id: "stampOk", label: "OK", icon: "OK", machine: "stamper" },
  { id: "addFruit", label: "Fruta", icon: "+", machine: "mixer" },
  { id: "blend", label: "Misturar", icon: "~", machine: "mixer" },
];

export const LEVELS: FactoryLevel[] = [
  {
    level: 1,
    title: "Estação da Calculadora",
    objective: "Monte os comandos da calculadora.",
    prompt: "Meta: transformar 3 em 10. Use: Somar 2, depois Dobrar.",
    timeLimit: 55,
    availableMachines: ["calculator"],
    availableCommands: ["add2", "double"],
    solution: [
      { machine: "calculator", command: "add2" },
      { machine: "calculator", command: "double" },
    ],
    startLabel: "3",
    successProduct: "Resultado 10 pronto!",
    hint: "A calculadora entende comandos de número. Primeiro some, depois dobre.",
  },
  {
    level: 2,
    title: "Máquina do Papel",
    objective: "Escolha a máquina certa para fazer um papel dobrado.",
    prompt: "Meta: dobrar o papel e apertar a dobra para ele ficar pronto.",
    timeLimit: 60,
    availableMachines: ["calculator", "folder"],
    availableCommands: ["add2", "double", "fold", "crease"],
    solution: [
      { machine: "folder", command: "fold" },
      { machine: "folder", command: "crease" },
    ],
    startLabel: "papel",
    successProduct: "Papel dobrado com capricho!",
    hint: "A calculadora cuida de números. Para papel, use a dobradeira.",
  },
  {
    level: 3,
    title: "Linha de Produção",
    objective: "Use duas máquinas na ordem certa.",
    prompt: "Meta: preparar uma bebida e colocar o selo de estrela.",
    timeLimit: 75,
    availableMachines: ["mixer", "stamper", "folder"],
    availableCommands: ["addFruit", "blend", "stampStar", "stampOk", "fold"],
    solution: [
      { machine: "mixer", command: "addFruit" },
      { machine: "mixer", command: "blend" },
      { machine: "stamper", command: "stampStar" },
    ],
    successProduct: "Bebida pronta com selo de estrela!",
    hint: "Algumas tarefas precisam passar por mais de uma máquina.",
  },
];

export function getMachine(id: string) {
  return MACHINES.find((machine) => machine.id === id);
}

export function getCommand(id: string) {
  return COMMANDS.find((command) => command.id === id);
}
