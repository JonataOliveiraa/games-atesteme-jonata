import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * As chaves que o jogo consome.
 *
 * Aqui as texturas são o conteúdo INTEIRO: a carta É o dado da lista, e não
 * uma ilustração ao lado dele. Por isso este é o único jogo do conjunto em que
 * a arte não é enfeite — sem ela, não há baralho.
 *
 * O baralho que existe na pasta: copas 2, 3, 4, 6, 7, 8, 9, 10 e J; espadas 2,
 * 4, 6, 8, 9 e J; e o curinga. Não há 5 em naipe nenhum, nem 3, 7 ou 10 de
 * espadas — e os nove casos foram escritos em cima dessa lista, e não o
 * contrário. Se algum dia faltar uma, `createCarta` desenha a carta em
 * `Graphics` com o valor no meio e o jogo continua jogável; só fica feio.
 *
 * `bg-table-2` está na lista mas AINDA NÃO está na pasta. Não é problema: o
 * glob registra o que existe, e o Nível 3 cai de volta na mesa 1.
 */
const WANTED = [
    'bg-table-1',
    'bg-table-2',
    'p-1',
    'p-2',
    'p-3',
    'slot-insert-card',
    /**
     * O VERSO da carta, para o Nível 2.
     *
     * Ainda não existe na pasta — e não precisa existir para o jogo funcionar:
     * `paintVerso` desenha um verso azul-marinho com losangos. No dia em que o
     * PNG chegar, ele entra sozinho pelo glob.
     */
    'card-back',
    'card-joker',
    'card-heart-2', 'card-heart-3', 'card-heart-4', 'card-heart-6',
    'card-heart-7', 'card-heart-8', 'card-heart-9', 'card-heart-10',
    'card-heart-j',
    'card-spade-2', 'card-spade-4', 'card-spade-6', 'card-spade-8',
    'card-spade-9', 'card-spade-j',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro — e com
 * vinte e duas chaves, das quais uma ainda não foi desenhada, isso deixaria de
 * ser detalhe. Com `import.meta.glob` o Vite registra só o que está lá, e a
 * `bg-table-2` entra no jogo assim que for salva na pasta, sem tocar em uma
 * linha de código.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF05CO01/baralho-das-listas/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) =>
    path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

function found(): Array<[string, string]> {
    const byKey = new Map<string, string>()
    Object.entries(FILES).forEach(([path, url]) => {
        const key = keyOf(path)
        if (key) byKey.set(key, url)
    })
    return WANTED
        .map(key => [key, byKey.get(key)] as [string, string | undefined])
        .filter((pair): pair is [string, string] => !!pair[1])
}

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Baralho das Listas',
                subtitle: 'Cada carta é única',
            description: 'Embaralhando...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.espaco,
                    alpha: 0.05,
                    size: 30,
                    gap: 34,
                    angle: 'diagonal',
                },

                card: C.painel,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.madeira,

                title: C.creme,
                subtitle: C.espaco,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.edge,
                progressFill: C.espaco,
                progressHighlight: C.espacoSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer ver —
         * `{ level: 2, phase: 1 }` cai na busca da carta que NÃO está, e
         * `{ level: 3, phase: 2 }` no caso de três ações. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não
         * quebra nada.
         */
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}
