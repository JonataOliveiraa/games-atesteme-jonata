import type { Outcome, Situation } from '../types'

const LIST: Situation[] = [
    { id: 'agua', kind: 'risk', frame: 0, label: 'Copo de água', seal: 'Bebida longe do aparelho.' },
    { id: 'sol', kind: 'risk', frame: 1, label: 'Sol forte', seal: 'Aparelho gosta de sombra.' },
    { id: 'melado', kind: 'risk', frame: 2, label: 'Mão melada', seal: 'Mão limpa antes de tocar.' },
    { id: 'beirada', kind: 'risk', frame: 3, label: 'Na beirada', seal: 'Longe da beirada.' },
    { id: 'aviso', kind: 'risk', frame: 4, label: 'Aviso estranho', seal: 'Aviso estranho? Não toque.' },
    { id: 'rosto', kind: 'risk', frame: 5, label: 'Tela no rosto', seal: 'Tela longe dos olhos.' },
    { id: 'volume', kind: 'risk', frame: 6, label: 'Volume no máximo', seal: 'Som baixinho protege o ouvido.' },
    { id: 'escuro', kind: 'risk', frame: 7, label: 'No escuro', seal: 'Acenda a luz para jogar.' },

    { id: 'sentada', kind: 'safe', frame: 8, label: 'Sentada com luz', seal: 'Sentado e com luz: pode jogar!' },
    { id: 'capa', kind: 'safe', frame: 9, label: 'Capa protetora', seal: 'A capa protege das quedas.' },
    { id: 'alongar', kind: 'safe', frame: 10, label: 'Pausa para alongar', seal: 'Parar um pouco faz bem.' },
    { id: 'atualiza', kind: 'safe', frame: 11, label: 'Adulto ajudando', seal: 'Com um adulto, pode atualizar.' },
]

export const SITUATIONS: Record<string, Situation> = Object.fromEntries(
    LIST.map(entry => [entry.id, entry]),
)

export function situation(id: string): Situation {
    const found = SITUATIONS[id]
    if (!found) throw new Error(`[bolhas] situação desconhecida: ${id}`)
    return found
}

export const shouldBubble = (target: Situation) => target.kind === 'risk'

export function outcomeOf(target: Situation, locked: boolean): Outcome {
    if (target.kind === 'safe') return 'safe-touched'
    return locked ? 'late' : 'protected'
}
