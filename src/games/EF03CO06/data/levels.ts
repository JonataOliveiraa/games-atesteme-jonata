import type { Device, DeviceId, InterfaceLevel } from "../types";

const palette = {
  blue: 0x2563eb,
  cyan: 0x38bdf8,
  green: 0x22c55e,
  orange: 0xf59e0b,
  purple: 0x8b5cf6,
  red: 0xef4444,
  yellow: 0xfacc15,
};

export const DEVICES: Record<DeviceId, Device> = {
  keyboard: { id: "keyboard", name: "Teclado", kind: "input", icon: "⌨", color: palette.blue },
  mouse: { id: "mouse", name: "Mouse", kind: "input", icon: "↖", color: palette.purple },
  microphone: { id: "microphone", name: "Microfone", kind: "input", icon: "♪", color: palette.red },
  camera: { id: "camera", name: "Câmera", kind: "input", icon: "▣", color: palette.orange },
  controller: { id: "controller", name: "Controle", kind: "input", icon: "✚", color: palette.green },
  monitor: { id: "monitor", name: "Monitor", kind: "output", icon: "▭", color: palette.cyan },
  speaker: { id: "speaker", name: "Alto-falante", kind: "output", icon: "♫", color: palette.orange },
  printer: { id: "printer", name: "Impressora", kind: "output", icon: "▤", color: palette.purple },
  projector: { id: "projector", name: "Projetor", kind: "output", icon: "◎", color: palette.yellow },
  headphone: { id: "headphone", name: "Fone", kind: "output", icon: "Ω", color: palette.green },
};

export const LEVELS: InterfaceLevel[] = [
  {
    level: 1,
    title: "Entrada ou Saída",
    instruction: "",
    timeLimit: 25,
    devices: ["keyboard", "mouse", "monitor", "speaker"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["keyboard", "mouse"] },
      { id: "output", label: "Saída", accepts: ["monitor", "speaker"] },
    ],
    successMessage: "Entrada leva dados para o computador. Saída mostra ou toca a resposta.",
    hint: "Teclado e mouse entram. Monitor e alto-falante saem.",
  },
  {
    level: 2,
    title: "Videochamada",
    instruction: "",
    timeLimit: 30,
    devices: ["microphone", "speaker", "mouse", "monitor", "camera", "controller"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["microphone", "camera"] },
      { id: "output", label: "Saída", accepts: ["monitor", "speaker"] },
    ],
    successMessage: "A voz e a imagem entram no computador. A tela e o som saem para a pessoa ver e ouvir.",
    hint: "Pense no caminho da informação: o que o computador recebe? O que ele mostra ou toca?",
  },
  {
    level: 3,
    title: "Bilhete Impresso",
    instruction: "",
    timeLimit: 35,
    devices: ["keyboard", "mouse", "monitor", "printer", "microphone", "camera"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["keyboard", "mouse"] },
      { id: "output", label: "Saída", accepts: ["monitor", "printer"] },
    ],
    successMessage: "O teclado e o mouse enviaram comandos. O monitor mostrou o bilhete e a impressora colocou no papel.",
    hint: "Pense em como escrever no computador e depois entregar o bilhete em papel.",
  },
];

export function shuffleDevices(devices: DeviceId[]) {
  return [...devices].sort(() => Math.random() - 0.5);
}
