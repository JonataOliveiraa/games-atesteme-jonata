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
    title: "Conexão de Áudio",
    instruction: "",
    timeLimit: 25,
    devices: ["microphone", "speaker"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["microphone"] },
      { id: "output", label: "Saída", accepts: ["speaker"] },
    ],
    successMessage: "O microfone envia som para o computador. O alto-falante devolve som para a pessoa ouvir.",
    hint: "No áudio: microfone entra, alto-falante sai.",
  },
  {
    level: 2,
    title: "Conexão de Vídeo",
    instruction: "",
    timeLimit: 30,
    devices: ["camera", "monitor"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["camera"] },
      { id: "output", label: "Saída", accepts: ["monitor"] },
    ],
    successMessage: "A câmera envia imagem para o computador. O monitor mostra a imagem para a pessoa ver.",
    hint: "No vídeo: câmera entra, monitor sai.",
  },
  {
    level: 3,
    title: "Comandos e Impressão",
    instruction: "",
    timeLimit: 35,
    devices: ["keyboard", "mouse", "monitor", "printer"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["keyboard", "mouse"] },
      { id: "output", label: "Saída", accepts: ["monitor", "printer"] },
    ],
    successMessage: "O teclado e o mouse enviam comandos. O monitor mostra o texto e a impressora coloca no papel.",
    hint: "Para escrever e imprimir: teclado e mouse entram; monitor e impressora saem.",
  },
];

export function shuffleDevices(devices: DeviceId[]) {
  return [...devices].sort(() => Math.random() - 0.5);
}
