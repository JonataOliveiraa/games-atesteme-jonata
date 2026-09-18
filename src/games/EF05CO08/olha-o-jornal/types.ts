import type { BackdropId } from './data/layout'

/**
 * Olha o Jornal! — EF05CO08.
 *
 * O carteiro traz DOIS jornais sobre o mesmo assunto, e eles afirmam coisas
 * diferentes. A criança lê os dois, parados, e escolhe um. Depois sai
 * espalhando o que escolheu pela praça, e vê a informação chegar em cada grupo.
 *
 * Nenhum jornal guarda a sua resposta. Quem vale mais é uma FUNÇÃO das três
 * linhas escritas na capa — quem assina, de quando é, de onde tirou —, e é por
 * isso que a mesma capa ganha numa fase e perde na outra.
 */

export type Origin = 'oficial' | 'testemunha' | 'ouviDizer' | null

export type Clue = 'author' | 'year' | 'origin'

export interface Paper {
    id: string
    name: string
    headline: string
    author: string | null
    year: number
    origin: Origin
    /** Sobrescreve o texto padrão da origem quando a fonte tem nome próprio. */
    originText?: string
}

export interface GroupDef {
    cx: number
    /** Quanto acima do chão o grupo fica. Só quando ele está num degrau. */
    lift?: number
    /** Índices de `pessoas.png`: qual pessoa é cada uma. */
    people: number[]
}

export interface PhaseDef {
    id: string
    subject: string
    /** 2 no nível 1, 3 no nível 2, 4 no nível 3. A grade da banca segue o número. */
    papers: Paper[]
    /** `cx` é coordenada de MUNDO: no nível 3 o mundo é mais largo que a tela. */
    groups: GroupDef[]
}

export interface LevelDef {
    level: 1 | 2 | 3
    /** A pista que decide neste nível. Entra no relatório, não na tela. */
    clue: Clue
    /** O aviso de uma linha que o nível estreia. Nunca dá a resposta. */
    hint?: string
    backdrop: BackdropId
    today: number
    phases: PhaseDef[]
}

export type Mode = 'reading' | 'aiming' | 'flying' | 'turning' | 'locked' | 'done'

export type PersonState = 0 | 1 | 2
