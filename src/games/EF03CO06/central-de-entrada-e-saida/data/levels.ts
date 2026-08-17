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
    title: "Áudio: Entrada e Saída",
    instruction: "",
    timeLimit: 25,
    devices: ["microphone", "speaker"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["microphone"] },
      { id: "output", label: "Saída", accepts: ["speaker"] },
    ],
    successMessage: "O microfone captura o som e envia ao computador (entrada). O alto-falante recebe o som do computador e reproduz para a pessoa ouvir (saída).",
    hint: "Áudio: microfone → entra. Alto-falante → sai.",
  },
  {
    level: 2,
    title: "Vídeo: Entrada e Saída",
    instruction: "",
    timeLimit: 28,
    devices: ["camera", "monitor"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["camera"] },
      { id: "output", label: "Saída", accepts: ["monitor"] },
    ],
    successMessage: "A câmera captura a imagem e envia ao computador (entrada). O monitor recebe a imagem do computador e a exibe para a pessoa ver (saída).",
    hint: "Vídeo: câmera → entra. Monitor → sai.",
  },
  {
    level: 3,
    title: "Periféricos: Entrada e Saída",
    instruction: "",
    timeLimit: 35,
    devices: ["keyboard", "mouse", "monitor", "printer"],
    slots: [
      { id: "input", label: "Entrada", accepts: ["keyboard", "mouse"] },
      { id: "output", label: "Saída", accepts: ["monitor", "printer"] },
    ],
    successMessage: "Teclado e mouse enviam comandos ao computador (entrada). O monitor exibe o resultado na tela e a impressora imprime no papel (saída).",
    hint: "Periféricos: teclado e mouse → entram. Monitor e impressora → saem.",
  },
];

export function shuffleDevices(devices: DeviceId[]) {
  return [...devices].sort(() => Math.random() - 0.5);
}
