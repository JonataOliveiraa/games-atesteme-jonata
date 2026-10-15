import type { AskerId, DoorId, InfoId, Request } from '../types'

export interface InfoDef {
    /** a palavra no balão */
    label: string
    /** feminino: "sua", "passada" */
    fem: boolean
    personal: boolean
}

export const INFOS: Record<InfoId, InfoDef> = {
    address: { label: 'ENDEREÇO', fem: false, personal: true },
    phone: { label: 'TELEFONE', fem: false, personal: true },
    face: { label: 'FOTO DO ROSTO', fem: true, personal: true },
    trip: { label: 'FOTO DO PASSEIO', fem: true, personal: true },
    drawing: { label: 'DESENHO', fem: false, personal: false },
    color: { label: 'COR FAVORITA', fem: true, personal: false },
    nickname: { label: 'APELIDO', fem: false, personal: true },
    friendPhoto: { label: 'FOTO COM O DAVI', fem: true, personal: false },
}

export interface AskerDef {
    /** o nome no alto do balão */
    label: string
    /** com artigo, maiúsculo: "A ESCOLA ficou sem…" */
    the: string
    /** "para a escola" */
    to: string
    /** a 1ª linha do balão */
    hello: string
    /** "Me manda" / "Manda" */
    verb: string
    /** da família: pode receber informação pessoal */
    family: boolean
    /** conhecido: pode receber o que não é pessoal */
    known: boolean
    /** o que ele recebe é passado adiante quando é pessoal */
    spreads: boolean
}

export const ASKERS: Record<AskerId, AskerDef> = {
    grandma: { label: 'VOVÓ', the: 'A VOVÓ', to: 'para a vovó', hello: 'Que saudade!', verb: 'Me manda', family: true, known: true, spreads: false },
    class: { label: 'GRUPO DA TURMA', the: 'A TURMA', to: 'para o grupo da turma', hello: 'Oi! Aqui é a turma.', verb: 'Manda', family: false, known: true, spreads: true },
    school: { label: 'ESCOLA', the: 'A ESCOLA', to: 'para o mural da escola', hello: 'Vamos montar o mural!', verb: 'Manda', family: false, known: true, spreads: false },
    stranger: { label: 'DESCONHECIDO DO JOGO', the: 'O DESCONHECIDO', to: 'para o desconhecido', hello: 'Ganhe um prêmio!', verb: 'Me manda', family: false, known: false, spreads: true },
}

/** o nome na plaquinha de cada porta */
export const PLATE: Record<DoorId, string> = {
    grandma: 'VOVÓ',
    class: 'TURMA',
    davi: 'DAVI',
    school: 'ESCOLA',
    stranger: '',
}

export const yours = (info: InfoId) => (INFOS[info].fem ? 'sua' : 'seu')

type Ask = Pick<Request, 'info' | 'owner'>

/** "APELIDO DO DAVI" quando a informação é do Davi */
export const labelOf = (r: Ask) =>
    r.owner && !INFOS[r.info].label.includes('DAVI') ? `${INFOS[r.info].label} DO DAVI` : INFOS[r.info].label
/** "seu"/"sua", ou "o"/"a" quando é do Davi */
export const whose = (r: Ask) => (r.owner ? (INFOS[r.info].fem ? 'a' : 'o') : yours(r.info))
/** "seu ENDEREÇO", "o APELIDO DO DAVI" */
export const shortOf = (r: Ask) => `${whose(r)} ${labelOf(r)}`
/** "o seu ENDEREÇO", "o APELIDO DO DAVI" */
export const theOf = (r: Ask) => (r.owner ? shortOf(r) : `${INFOS[r.info].fem ? 'a sua' : 'o seu'} ${labelOf(r)}`)
