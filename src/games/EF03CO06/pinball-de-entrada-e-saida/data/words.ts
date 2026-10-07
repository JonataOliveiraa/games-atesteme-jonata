import type { ContentId, DeviceId } from '../types'
import { CONTENT_WORD, DEVICES } from './devices'

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const PROCESSING = 'PROCESSANDO…'
export const PROCESSOR_LABEL = 'PROCESSADOR'

const WANTED: Record<DeviceId, string> = {
    keyboard: '',
    mic: '',
    camera: '',
    speaker: 'A Lily queria OUVIR!',
    screen: 'A Lily queria VER!',
    printer: 'A Lily queria no PAPEL!',
}

export const VISOR_HEAD = { ask: 'PEDIDO DA LILY', hint: 'DICA', oops: 'OPS!', yay: 'PRONTO!' }

export const SAY = {
    wrongInput: (device: DeviceId, carries: ContentId) => `${cap(DEVICES[device].art)} não pega ${CONTENT_WORD[carries]}!`,
    wrongOutput: (wanted: DeviceId) => WANTED[wanted],
    pickOutput: 'Toque numa SAÍDA para abrir a porta dela!',
    aim: 'Bata a bolinha na porta aberta!',
    yay: 'Deu certo!',
}

export const SIDE_LABEL = { input: 'ENTRADA', output: 'SAÍDA' }

export const TEACH = {
    table: 'Esta mesa é o computador por dentro.',
    sides: 'O teclado fica fora do computador, ligado nele por um fio.',
    visor: 'Aqui aparece o pedido da Lily.',
    input: 'A informação ENTRA pelo fio de um aparelho de ENTRADA. Toque no teclado!',
    process: 'O processador transforma as letras em música.',
    output: 'A informação SAI por um aparelho de SAÍDA. A Lily quer OUVIR: toque no alto-falante!',
    flippers: 'A porta abriu! Bata a bolinha nela: toque na esquerda ou na direita da tela.',
    flow: 'Sempre assim: ENTRA, PROCESSA, SAI.',
    printer: 'Uma saída nova: a IMPRESSORA põe no PAPEL.',
    inputs: 'Agora a informação pode entrar por três aparelhos.',
    keyboard: 'O TECLADO leva LETRAS.',
    mic: 'O MICROFONE leva a VOZ.',
    camera: 'A CÂMERA leva a IMAGEM.',
    chooseInput: 'Leia o pedido e escolha a entrada!',
    both: 'Agora você escolhe a ENTRADA e a SAÍDA.',
}

export const HELP = {
    ask: 'Leia o pedido da Lily no visor.',
    input: 'Toque na ENTRADA que pega o que ela vai fazer.',
    output: 'Depois, toque na SAÍDA que dá o que ela quer: a porta dela abre.',
    flippers: 'Toque na esquerda ou na direita para bater a bolinha na porta aberta.',
}

export const FINALE = {
    title: 'Os caminhos da informação',
    line: (input: DeviceId, output: DeviceId, carries: ContentId, becomes: ContentId) =>
        `${cap(DEVICES[input].art)} fez ${CONTENT_WORD[carries]} ENTRAR, e ${DEVICES[output].art} fez ${CONTENT_WORD[becomes]} SAIR.`,
    synth: 'O computador conversa com o mundo: a informação ENTRA por um aparelho, é PROCESSADA e SAI por outro.',
}
