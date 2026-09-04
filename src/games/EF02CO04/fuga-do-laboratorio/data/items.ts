import type { Build, Goal, ItemKind, LabItem, Outcome, Pair, Slot } from '../types'

/**
 * Os quadros vêm de `itens.png`, 4 colunas por 5 linhas. As duas primeiras
 * linhas são peças; as três seguintes, programas.
 */
const LIST: LabItem[] = [
    { id: 'mouse', label: 'Mouse', kind: 'hardware', frame: 0 },
    { id: 'teclado', label: 'Teclado', kind: 'hardware', frame: 1 },
    { id: 'tela', label: 'Tela', kind: 'hardware', frame: 2 },
    { id: 'caixinha', label: 'Caixinha de som', kind: 'hardware', frame: 3 },
    { id: 'camera', label: 'Câmera', kind: 'hardware', frame: 4 },
    { id: 'robo', label: 'Robô', kind: 'hardware', frame: 5 },
    { id: 'controle', label: 'Controle', kind: 'hardware', frame: 6 },
    { id: 'impressora', label: 'Impressora', kind: 'hardware', frame: 7 },

    { id: 'app-musica', label: 'App de música', kind: 'software', frame: 8, verb: 'tocar música' },
    { id: 'app-desenho', label: 'App de desenho', kind: 'software', frame: 9, verb: 'desenhar' },
    { id: 'app-fotos', label: 'App de fotos', kind: 'software', frame: 10, verb: 'tirar foto' },
    { id: 'joguinho', label: 'Joguinho', kind: 'software', frame: 11, verb: 'abrir o jogo' },
    { id: 'dancinha', label: 'Dancinha', kind: 'software', frame: 12, verb: 'dançar' },
    { id: 'despertador', label: 'Despertador', kind: 'software', frame: 13, verb: 'despertar' },
    { id: 'navegador', label: 'Navegador', kind: 'software', frame: 14, verb: 'abrir a internet' },
    { id: 'app-escrever', label: 'App de escrever', kind: 'software', frame: 15, verb: 'escrever' },
]

export const ITEMS: Record<string, LabItem> = Object.fromEntries(
    LIST.map(entry => [entry.id, entry]),
)

export function item(id: string): LabItem {
    const found = ITEMS[id]
    if (!found) throw new Error(`[fuga] item desconhecido: ${id}`)
    return found
}

/** Cada entrada do chassi aceita UM tipo. É a regra inteira do jogo. */
export const SLOT_KIND: Record<Slot, ItemKind> = {
    tray: 'hardware',
    reader: 'software',
}

/** Entra na bandeja? Entra no leitor? A forma responde antes do adulto. */
export const fits = (target: LabItem, slot: Slot) => target.kind === SLOT_KIND[slot]

/** Quem manda em quem. É a lista do jogo inteiro, não a da montagem. */
export const PAIRS: Pair[] = [
    { softwareId: 'app-musica', hardwareId: 'caixinha' },
    { softwareId: 'app-fotos', hardwareId: 'camera' },
    { softwareId: 'joguinho', hardwareId: 'controle' },
    { softwareId: 'dancinha', hardwareId: 'robo' },
    { softwareId: 'app-desenho', hardwareId: 'tela' },
    { softwareId: 'app-escrever', hardwareId: 'impressora' },
]

export const commands = (softwareId: string, hardwareId: string) =>
    PAIRS.some(pair => pair.softwareId === softwareId && pair.hardwareId === hardwareId)

/**
 * O veredito do TESTAR.
 *
 * Ele é FUNÇÃO do que está encaixado no instante do toque — não existe campo
 * `correto` em botão nenhum. A mesma caixinha de som é o acerto do pedido de
 * música e o fracasso engraçado do pedido de foto.
 */
export function outcomeOf(build: Build, hardwareId: string, softwareId: string): Outcome {
    if (hardwareId === build.hardwareId && softwareId === build.softwareId) return 'ok'
    if (commands(softwareId, hardwareId)) return 'off-goal'
    return 'mismatch'
}

/** O pedido, em infinitivo, para caber em "Faça esta máquina ___". */
export const GOAL_ASK: Record<Goal, string> = {
    music: 'tocar música',
    photo: 'tirar uma foto',
    print: 'imprimir',
    dance: 'dançar',
    draw: 'desenhar',
    write: 'escrever',
}

/** O que a máquina fez de errado, dito com o nome das duas coisas. */
export function wrongLine(hardwareId: string, softwareId: string): string {
    const hardware = item(hardwareId)
    const software = item(softwareId)
    if (commands(softwareId, hardwareId)) return 'Funcionou, mas eu pedi outra coisa.'
    return `${hardware.label} não sabe ${software.verb}.`
}
