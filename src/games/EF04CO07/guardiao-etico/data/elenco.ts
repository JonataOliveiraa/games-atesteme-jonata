import { C } from './theme'
import type { DestinationId, ItemKind, PersonId } from '../types'

/**
 * O elenco. A cor é o que separa um do outro enquanto não há textura, e
 * continua separando depois — ela é a borda do retrato no cartão do achado.
 */
export const PEOPLE: Record<PersonId, { name: string; color: number; skin: number }> = {
    teo: { name: 'Téo', color: 0x4b8fe0, skin: 0xe8b98c },
    bia: { name: 'Bia', color: 0xe07ba0, skin: 0x8a5a3c },
    rafa: { name: 'Rafa', color: 0x4eaa78, skin: 0x6b4430 },
    duda: { name: 'Duda', color: 0xe59a52, skin: 0xf0c9a0 },
    estranho: { name: 'alguém de outra turma', color: C.slate, skin: 0xd8b48f },
}

export const DESTINATIONS: Record<DestinationId, { title: string; who: string }> = {
    muralDaSala: { title: 'MURAL DA SALA', who: 'a nossa turma vê' },
    jornalDaEscola: { title: 'JORNAL DA ESCOLA', who: 'a escola inteira vê' },
    siteDaEscola: { title: 'SITE DA ESCOLA', who: 'o mundo vê' },
}

/** A frase do bilhete quando aquele tipo ficou à mostra sem poder. */
export const LEAK_NOTE: Record<ItemKind, string> = {
    telefone: 'Tem um telefone nesse papel.',
    endereco: 'Tem o endereço da casa de alguém aí.',
    rosto: 'Tem alguém de outra turma nessa foto.',
    nome: 'Tem nome demais nesse papel pra ir tão longe.',
    assinatura: 'Tem uma assinatura nesse papel.',
    senha: 'Senha não fica escrita na parede.',
    saude: 'Tem coisa de saúde de alguém nesse papel.',
}

/** E quando a criança tapou o que devia ficar à mostra. */
export const COVERED_NOTE: Record<ItemKind, string> = {
    telefone: 'Esse telefone podia ficar.',
    endereco: 'Esse endereço podia ficar.',
    rosto: 'Esse rosto podia ficar.',
    nome: 'Assim ninguém vai saber quem organizou.',
    assinatura: 'Assim ninguém vai saber quem desenhou.',
    senha: 'Essa parte podia ficar.',
    saude: 'Essa parte podia ficar.',
}
