import type { DeviceId } from '../types'
import { isInput } from './rules'

export interface Box {
    x: number
    y: number
    r: number
    b: number
}

export const SHEET = {
    lia: { key: 'personagem-lia', frameWidth: 400, frameHeight: 550 },
    computer: { key: 'computador-central', frameWidth: 400, frameHeight: 650 },
    inputs: { key: 'dispositivos-entrada', frameWidth: 350, frameHeight: 350 },
    outputs: { key: 'dispositivos-saida', frameWidth: 350, frameHeight: 350 },
}

export const LIA_FRAME = { idle: 0, speaking: 1, showing: 2, cheer: 3 }
export const LIA_ART = {
    feet: 537,
    card: { x: 214, y: 285, w: 234, h: 90 },
    mouth: { x: 214, y: 190 },
}

export const COMPUTER_FRAME = { idle: 0, receiving: 1, processing: 2, sending: 3 }
export const COMPUTER_ART = {
    cx: 202,
    bottom: 641,
    inPort: { x: 38, y: 275 },
    outPort: { x: 368, y: 278 },
    face: { x: 201, y: 194 },
}

const INPUT_FRAME: Record<string, number> = { keyboard: 0, mouse: 1, microphone: 2, camera: 3 }
const OUTPUT_FRAME: Record<string, number> = { monitor: 0, speaker: 1, printer: 2 }

const INPUT_BOX: Box[] = [
    { x: 10, y: 81, r: 343, b: 257 },
    { x: 83, y: 39, r: 285, b: 322 },
    { x: 80, y: 30, r: 274, b: 341 },
    { x: 18, y: 56, r: 327, b: 291 },
    { x: 10, y: 92, r: 343, b: 269 },
    { x: 83, y: 32, r: 285, b: 315 },
    { x: 78, y: 30, r: 272, b: 343 },
    { x: 18, y: 50, r: 327, b: 285 },
]

const OUTPUT_BOX: Box[] = [
    { x: 13, y: 91, r: 340, b: 334 },
    { x: 83, y: 74, r: 275, b: 333 },
    { x: 11, y: 114, r: 338, b: 342 },
    { x: 13, y: 91, r: 340, b: 334 },
    { x: 74, y: 69, r: 286, b: 334 },
    { x: 12, y: 89, r: 339, b: 317 },
]

export const MONITOR_SCREEN = { x: 38, y: 116, r: 314, b: 252 }
export const SPEAKER_CONE = { x: 180, y: 225 }
export const PRINTER_SLOT = { x: 175, aboveBottom: 80, w: 190 }

export const DEVICE_NAME: Record<DeviceId, string> = {
    keyboard: 'TECLADO',
    mouse: 'MOUSE',
    microphone: 'MICROFONE',
    camera: 'CÂMERA',
    monitor: 'MONITOR',
    speaker: 'ALTO-FALANTE',
    printer: 'IMPRESSORA',
}

export const sheetOf = (id: DeviceId) => (isInput(id) ? SHEET.inputs.key : SHEET.outputs.key)

export const frameOf = (id: DeviceId, active = false) =>
    isInput(id) ? INPUT_FRAME[id] + (active ? 4 : 0) : OUTPUT_FRAME[id] + (active ? 3 : 0)

export const boxOf = (id: DeviceId, active = false) =>
    isInput(id) ? INPUT_BOX[frameOf(id, active)] : OUTPUT_BOX[frameOf(id, active)]

export const fitScale = (box: Box, w: number, h: number) =>
    Math.min(w / (box.r - box.x), h / (box.b - box.y))
