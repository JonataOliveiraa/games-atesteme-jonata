import type { Person, PersonId } from '../types'

export const CHILD_NAME = 'Bia'

const care = (who: string) => `Oi, ${CHILD_NAME}! Sou ${who}.\nGuarda no cofre!`

export const PEOPLE: Record<PersonId, Person> = {
    mom: { id: 'mom', trusted: true, line: care('a mamãe') },
    dad: { id: 'dad', trusted: true, line: care('o papai') },
    teacher: { id: 'teacher', trusted: true, line: care('a prô') },
    neighbor: { id: 'neighbor', trusted: false, line: 'Psiu, menina!\nMe dá seu cartão?\nÉ segredo!' },
    mascot: { id: 'mascot', trusted: false, line: 'Psiu, menina!\nMe dá seu cartão?\nTe dou um doce!' },
}

export const TRAP_LINE = 'Psiu, menina!\nMe dá seu cartão?\nTe dou uma figurinha!'

export const isTrusted = (id: PersonId): boolean => PEOPLE[id].trusted
