import type { AskerId, Choice, InfoId, Request } from '../types'
import { ASKERS, INFOS, shortOf, theOf } from './requests'

export const BUTTON = { send: 'ENVIAR', keep: 'NÃO ENVIAR', ask: 'PERGUNTAR\nAO DAVI' }

/** o selo no balão quando a informação é do Davi */
export const OWNER_TAG = 'É DO DAVI'

/** o que o Davi responde, e o lembrete que fica no balão de quem pediu */
export const REPLY = {
    yes: 'Pode mandar!',
    no: 'Não! É segredo.',
    note: (yes: boolean) => (yes ? 'DAVI: Pode mandar!' : 'DAVI: Não! É segredo.'),
}

export const SAY = {
    /** enviou o que era pessoal: foi passado adiante */
    forwarded: (r: Request) => `${cap(shortOf(r))} foi ${INFOS[r.info].fem ? 'passada' : 'passado'} adiante!`,
    /** enviou a informação do Davi sem perguntar */
    unasked: (r: Request) => `Você enviou ${theOf(r)} sem perguntar!`,
    /** enviou depois do "Não!" */
    refused: () => 'O Davi disse NÃO, e você enviou!',
    /** não enviou o que era para enviar */
    missed: (r: Request, asked: boolean) =>
        `${ASKERS[r.asker].the} ficou sem ${theOf(r)}!${r.owner && !asked ? ' Era só perguntar.' : ''}`,
}

/** a explicação da demonstração: quem é, o que pede, por que pode ou não pode */
export const TEACH = {
    yourTurn: 'Sua vez!',
    who: {
        stranger: 'Você NÃO conhece essa pessoa. Ela é de um jogo da internet.',
        class: 'Esse é o grupo da sua TURMA. Você conhece!',
        school: 'Essa é a sua ESCOLA. Você conhece!',
        grandma: 'Essa é a sua VOVÓ. Ela é da sua família!',
    } satisfies Record<AskerId, string>,
    ask: (r: Request) =>
        r.asker === 'stranger' ? `Ela promete um prêmio só para pegar ${theOf(r)}.` : `Ela quer ${theOf(r)}${PURPOSE[r.asker]}.`,
    why: (r: Request, answer: Choice) => (answer === 'keep' ? DANGER[r.info] : r.asker === 'grandma' && INFOS[r.info].personal ? FAMILY : SAFE[r.info]),
    then: (answer: Choice) => (answer === 'send' ? 'Por isso, o certo é ENVIAR!' : 'Por isso, o certo é NÃO ENVIAR.'),
    owner: 'Essa informação é do Davi. Só ele pode dizer se você pode enviar.',
    askFirst: 'Por isso, primeiro toque em PERGUNTAR AO DAVI.',
    replied: (yes: boolean) => (yes ? 'O Davi deixou. Então, o certo é ENVIAR!' : 'O Davi disse NÃO. Então, o certo é NÃO ENVIAR.'),
    erase: {
        sent: (info: InfoId) => `Ontem você enviou ${INFOS[info].fem ? 'a sua' : 'o seu'} ${INFOS[info].label} para um desconhecido.`,
        still: 'Sumiu do SEU tablet. Mas os outros ainda têm a foto!',
        rule: 'Apagar daqui não apaga de lá. Pense antes de enviar!',
    },
}

const PURPOSE: Record<AskerId, string> = { stranger: '', class: ' para mostrar à turma', school: ' para pôr no mural', grandma: ' para matar a saudade' }

const DANGER: Record<InfoId, string> = {
    address: 'Com o ENDEREÇO, um estranho descobre onde você mora. É perigoso!',
    phone: 'Com o TELEFONE, um estranho pode ligar e mandar mensagem para você. É perigoso!',
    face: 'A FOTO DO ROSTO mostra quem você é. Um estranho pode espalhar.',
    trip: 'A FOTO DO PASSEIO mostra a sua família e aonde vocês vão.',
    drawing: 'Um estranho não precisa do seu DESENHO.',
    color: 'Um estranho não precisa saber a sua COR FAVORITA.',
    nickname: 'O APELIDO é do Davi. Só ele pode contar.',
    friendPhoto: 'A FOTO COM O DAVI também é dele.',
}

const SAFE: Record<InfoId, string> = {
    address: 'Pode mandar.',
    phone: 'Pode mandar.',
    face: 'Pode mandar.',
    trip: 'Pode mandar.',
    drawing: 'O DESENHO não conta onde você mora nem quem você é. Pode mandar!',
    color: 'A COR FAVORITA não conta nada perigoso sobre você. Pode mandar!',
    nickname: 'O Davi deixou. Pode mandar!',
    friendPhoto: 'O Davi deixou. Pode mandar!',
}

const FAMILY = 'A vovó é da família e já sabe disso. Pode mandar!'

export const HELP = {
    balloon: 'Quem pede? E o que pede?',
    buttons: 'Enviar ou não enviar?',
}

function cap(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
