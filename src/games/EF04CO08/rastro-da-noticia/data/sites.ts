import type { SiteDef, SiteId } from '../types'
import { C } from './theme'

export const SITES: Record<SiteId, SiteDef> = {
    jornal: {
        id: 'jornal',
        name: 'Jornal do Bairro',
        address: 'jornaldobairro.com',
        logo: 0,
        facade: 0,
        tone: C.sky2,
        home: 'Feira de livros no domingo',
    },
    blog: {
        id: 'blog',
        name: 'Blog da Tia Nena',
        address: 'blogdatianena.com',
        logo: 1,
        facade: 1,
        tone: C.pink,
        home: 'Receita de bolo de cenoura',
    },
    grupo: {
        id: 'grupo',
        name: 'Grupo da Turma',
        address: 'grupo da turma 4ºB',
        logo: 2,
        facade: 2,
        tone: C.mint,
        home: 'Quem leva a bola amanhã?',
    },
    canal: {
        id: 'canal',
        name: 'Canal TopTudo',
        address: 'toptudo.tv',
        logo: 3,
        facade: 3,
        tone: C.coral,
        home: 'Gato tocando piano!',
    },
    perfil: {
        id: 'perfil',
        name: '@zumzum',
        address: '@zumzum',
        logo: 4,
        facade: 4,
        tone: C.grey,
        home: 'Siga para mais!!!',
    },
    escola: {
        id: 'escola',
        name: 'Site da Escola',
        address: 'escoladobairro.edu',
        logo: 5,
        facade: 5,
        tone: C.butter,
        home: 'Cardápio da semana',
    },
}
