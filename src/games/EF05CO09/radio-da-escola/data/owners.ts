import type { Owner, OwnerId } from '../types'

export const OWNERS: Record<OwnerId, Owner> = {
    bia: { name: 'Bia', cell: 0 },
    teo: { name: 'Téo', cell: 3 },
    malu: { name: 'Malu', cell: 6 },
    caio: { name: 'Caio', cell: 9 },
    iara: { name: 'Iara', cell: 12 },
    juca: { name: 'Juca', cell: 15 },
    rosa: { name: 'Rosa', cell: 18 },
    zeca: { name: 'Zeca', cell: 21 },
    lia: { name: 'Lia', cell: 24 },
    davi: { name: 'Davi', cell: 27 },
    nina: { name: 'Nina', cell: 30 },
    beto: { name: 'Beto', cell: 33 },
    gabi: { name: 'Gabi', cell: 36 },
    pedro: { name: 'Pedro', cell: 39 },
    kaua: { name: 'Kauã', cell: 42 },
    sofia: { name: 'Sofia', cell: 45 },
}

export const OWNER_IDS = Object.keys(OWNERS) as Array<keyof typeof OWNERS>
