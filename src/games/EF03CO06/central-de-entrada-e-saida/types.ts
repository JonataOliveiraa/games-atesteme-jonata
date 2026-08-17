export type DeviceKind = "input" | "output";

export type DeviceId =
  | "keyboard"
  | "mouse"
  | "microphone"
  | "camera"
  | "controller"
  | "monitor"
  | "speaker"
  | "printer"
  | "projector"
  | "headphone";

export type SlotId = "input" | "output" | "device";

export interface Device {
  id: DeviceId;
  name: string;
  kind: DeviceKind;
  icon: string;
  color: number;
}

export interface DeviceSlot {
  id: SlotId;
  label: string;
  accepts: DeviceId[];
}

export interface InterfaceLevel {
  level: 1 | 2 | 3;
  title: string;
  instruction: string;
  timeLimit: number;
  devices: DeviceId[];
  slots: DeviceSlot[];
  successMessage: string;
  hint: string;
}
