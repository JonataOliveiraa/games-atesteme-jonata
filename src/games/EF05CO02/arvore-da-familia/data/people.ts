import type { Animal, Kin, Look, PersonDef, Role, Species } from '../types'
import { HAIR, SHIRT, SKIN } from './theme'

const HUMANS: PersonDef[] = [
    {
        role: 'me',
        label: 'João',
        link: 'João',
        look: { skin: SKIN.brown, hair: HAIR.black, style: 'short', tuft: true, shirt: SHIRT.mustard, kid: true },
        why: '',
    },
    {
        role: 'grandpa',
        label: 'Avô',
        link: 'Pai do Pai',
        look: { skin: SKIN.brown, hair: HAIR.white, style: 'short', glasses: 'round', mustache: true, shirt: SHIRT.cocoa },
        why: 'O Avô é pai do Pai!',
        whyLink: 'O Pai do Pai fica em cima do Pai!',
    },
    {
        role: 'grandma',
        label: 'Avó',
        link: 'Mãe do Pai',
        look: { skin: SKIN.brown, hair: HAIR.white, style: 'bun', glasses: 'half', shirt: SHIRT.moss },
        why: 'A Avó é mãe do Pai!',
        whyLink: 'A Mãe do Pai fica em cima do Pai!',
    },
    {
        role: 'dad',
        label: 'Pai',
        link: 'Pai',
        look: { skin: SKIN.brown, hair: HAIR.black, style: 'short', mustache: true, shirt: SHIRT.sage },
        why: 'O João é filho do Pai!',
        whyLink: 'O Pai fica embaixo dos pais dele!',
    },
    {
        role: 'mom',
        label: 'Mãe',
        link: 'Mãe',
        look: { skin: SKIN.tan, hair: HAIR.brown, style: 'long', earrings: true, shirt: SHIRT.pink },
        why: 'O João é filho da Mãe!',
        whyLink: 'A Mãe fica embaixo dos pais dela!',
    },
    {
        role: 'uncle',
        label: 'Tio',
        link: 'Irmão do Pai',
        look: { skin: SKIN.brown, hair: HAIR.black, style: 'curly', beard: true, shirt: SHIRT.petrol },
        why: 'O Tio é irmão do Pai!',
        whyLink: 'O Irmão do Pai fica ao lado do Pai!',
    },
    {
        role: 'aunt',
        label: 'Tia',
        look: { skin: SKIN.fair, hair: HAIR.copper, style: 'pony', freckles: true, shirt: SHIRT.mustard },
        why: 'A Tia é casada com o Tio!',
    },
    {
        role: 'sister',
        label: 'Irmã',
        link: 'Irmã',
        look: { skin: SKIN.brown, hair: HAIR.brown, style: 'pigtails', shirt: SHIRT.lilac, kid: true },
        why: 'A Irmã é filha do Pai e da Mãe!',
        whyLink: 'A Irmã é filha do Pai e da Mãe!',
    },
    {
        role: 'brother',
        label: 'Irmão',
        link: 'Irmão',
        look: { skin: SKIN.brown, hair: HAIR.black, style: 'cap', cap: SHIRT.slate, shirt: SHIRT.white, kid: true },
        why: 'O Irmão é filho do Pai e da Mãe!',
        whyLink: 'O Irmão é filho do Pai e da Mãe!',
    },
    {
        role: 'cousinBoy',
        label: 'Primo',
        look: { skin: SKIN.light, hair: HAIR.copper, style: 'spiky', freckles: true, shirt: SHIRT.orange, kid: true },
        why: 'O Primo é filho do Tio!',
    },
    {
        role: 'cousinGirl',
        label: 'Prima',
        look: { skin: SKIN.light, hair: HAIR.copper, style: 'bob', bow: SHIRT.sage, freckles: true, shirt: SHIRT.pink, kid: true },
        why: 'A Prima é filha do Tio!',
    },
    {
        role: 'grandpaM',
        label: 'Avô',
        link: 'Pai da Mãe',
        look: { skin: SKIN.tan, hair: HAIR.white, style: 'short', shirt: SHIRT.white },
        why: 'O Avô é pai da Mãe!',
        whyLink: 'O Pai da Mãe fica em cima da Mãe!',
    },
    {
        role: 'grandmaM',
        label: 'Avó',
        link: 'Mãe da Mãe',
        look: { skin: SKIN.tan, hair: HAIR.white, style: 'curly', shirt: SHIRT.slate },
        why: 'A Avó é mãe da Mãe!',
        whyLink: 'A Mãe da Mãe fica em cima da Mãe!',
    },
    {
        role: 'auntM',
        label: 'Tia',
        link: 'Irmã da Mãe',
        look: { skin: SKIN.tan, hair: HAIR.brown, style: 'bob', glasses: 'round', shirt: SHIRT.pink },
        why: 'A Tia é irmã da Mãe!',
        whyLink: 'A Irmã da Mãe fica ao lado da Mãe!',
    },
    {
        role: 'baby',
        label: 'Primo',
        link: 'Filho da Tia',
        look: { skin: SKIN.tan, hair: HAIR.black, style: 'curly', shirt: SHIRT.white, kid: true },
        why: 'O Primo é filho da Tia!',
        whyLink: 'O Filho da Tia fica embaixo da Tia!',
    },
]

export const SPECIES: Record<Species, { kid: string; girl: boolean; family: string; fur: number; ear: number }> = {
    cat: { kid: 'Mimi', girl: true, family: 'dos gatos', fur: 0xe8964a, ear: 0xf2b8b0 },
    dog: { kid: 'Totó', girl: false, family: 'dos cachorros', fur: 0xe9cfa6, ear: 0x8a5a3c },
    rabbit: { kid: 'Pipoca', girl: true, family: 'dos coelhos', fur: 0xc9c4c0, ear: 0xf2b8b0 },
}

export const KINS: Kin[] = ['grandpa', 'grandma', 'dad', 'mom', 'kid', 'brother']

function animal(species: Species, kin: Kin): PersonDef {
    const s = SPECIES[species]
    const look: Look = { skin: s.fur, hair: s.ear, style: 'short', shirt: s.fur, kid: kin === 'kid' || kin === 'brother' }
    const filho = s.girl ? `A ${s.kid} é filha` : `O ${s.kid} é filho`
    const label: Record<Kin, string> = { grandpa: 'Avô', grandma: 'Avó', dad: 'Pai', mom: 'Mãe', kid: s.kid, brother: 'Irmão' }
    const why: Record<Kin, string> = {
        grandpa: 'O Avô é pai do Pai!',
        grandma: 'A Avó é mãe do Pai!',
        dad: `${filho} do Pai!`,
        mom: `${filho} da Mãe!`,
        kid: '',
        brother: 'O Irmão é filho do Pai e da Mãe!',
    }
    return { role: `${species}.${kin}` as Animal, label: label[kin], look, why: why[kin], species }
}

const ANIMALS: PersonDef[] = (Object.keys(SPECIES) as Species[]).flatMap(sp => KINS.map(k => animal(sp, k)))

export const PEOPLE = Object.fromEntries([...HUMANS, ...ANIMALS].map(p => [p.role, p])) as Record<Role, PersonDef>

export const speciesOf = (role: Role): Species | undefined => PEOPLE[role].species

export const wrongFamily = (role: Role) => {
    const sp = speciesOf(role)
    return sp ? `É da família ${SPECIES[sp].family}!` : ''
}
