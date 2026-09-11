import type {
    Carrier,
    ChallengeDef,
    Content,
    DeviceId,
    InputId,
    Medium,
    Outcome,
    OutputId,
    Side,
} from '../types'

export const INPUTS: InputId[] = ['keyboard', 'mouse', 'microphone', 'camera']
export const OUTPUTS: OutputId[] = ['monitor', 'speaker', 'printer']

export const isInput = (id: DeviceId): id is InputId => (INPUTS as DeviceId[]).includes(id)

export const SOURCE_CONTENT: Record<Medium, Content> = {
    sound: 'voice',
    image: 'drawing',
    'typed-text': 'letters',
    pointer: 'pointer',
}

export const MEDIUM_OF: Record<Content, Medium> = {
    voice: 'sound',
    drawing: 'image',
    photo: 'image',
    letters: 'typed-text',
    pointer: 'pointer',
}

export const capture = (input: InputId, source: Medium): Content | null => {
    if (input === 'keyboard') return 'letters'
    if (input === 'mouse') return 'pointer'
    if (input === 'microphone') return source === 'sound' ? 'voice' : null
    return source === 'image' ? 'drawing' : 'photo'
}

const OUTPUT_SHOWS: Record<OutputId, Medium[]> = {
    monitor: ['typed-text', 'pointer', 'image'],
    speaker: ['sound'],
    printer: ['typed-text', 'image'],
}

const CARRIER_OF: Record<OutputId, Carrier> = {
    monitor: 'screen',
    speaker: 'audio',
    printer: 'paper',
}

export const renders = (output: OutputId, content: Content) =>
    OUTPUT_SHOWS[output].includes(MEDIUM_OF[content])

export const sideOf = (id: DeviceId): Side => (isInput(id) ? 'input' : 'output')

export const emptySide = (challenge: ChallengeDef): Side | null =>
    !challenge.input ? 'input' : !challenge.output ? 'output' : null

export const chainOf = (challenge: ChallengeDef, device: DeviceId | null) => ({
    input: (device && isInput(device) ? device : challenge.input) as InputId,
    output: (device && !isInput(device) ? device : challenge.output) as OutputId,
})

export const problemSide = (outcome: Outcome): Side => (outcome.captured ? 'output' : 'input')

export const runChain = (challenge: ChallengeDef, device: DeviceId | null): Outcome => {
    const { input, output } = chainOf(challenge, device)
    const captured = capture(input, challenge.source)
    const rendered = !!captured && renders(output, captured)
    const solved =
        rendered &&
        MEDIUM_OF[captured!] === challenge.goal.medium &&
        CARRIER_OF[output] === challenge.goal.carrier
    return { input, output, captured, rendered, solved }
}

export const solves = (challenge: ChallengeDef, device: DeviceId) => runChain(challenge, device).solved

const INPUT_LINE: Record<InputId, string> = {
    keyboard: 'O teclado leva letras.',
    mouse: 'O mouse leva movimento e clique.',
    microphone: 'O microfone leva sons.',
    camera: 'A câmera leva imagens.',
}

const OUTPUT_LINE: Record<OutputId, string> = {
    monitor: 'O monitor mostra na tela.',
    speaker: 'O alto-falante só faz som.',
    printer: 'A impressora põe no papel.',
}

export const explain = (challenge: ChallengeDef, outcome: Outcome, side: Side) =>
    side === 'input'
        ? `${INPUT_LINE[outcome.input]} ${challenge.need}`
        : `${OUTPUT_LINE[outcome.output]} ${challenge.need}`
