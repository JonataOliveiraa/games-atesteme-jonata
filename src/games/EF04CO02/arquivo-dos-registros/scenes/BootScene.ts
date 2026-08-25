import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * As chaves que o jogo consome.
 *
 * A capa (`cover-arquivo-registros`) não entra: quem a usa é o catálogo, não a
 * cena.
 */
const WANTED = [
    'bg-escritorio',
    'pino',
    ...Array.from({ length: 12 }, (_, i) => `portrait-${i + 1}`),
]

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e um arquivo novo entra
 * no jogo assim que for salvo na pasta, sem tocar em uma linha de código.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO02/arquivo-dos-registros/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

/**
 * Tira TODAS as extensões repetidas do fim do nome.
 *
 * O arquivo do pino está salvo como `pino.png.png` — o `.png` entrou duas
 * vezes. Cortar só a última deixaria a chave `pino.png`, e o jogo procura por
 * `pino`. Cortar todas resolve sem depender de alguém renomear o arquivo, e
 * continua funcionando depois que renomearem.
 */
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
            title: 'Arquivo dos Registros',
            subtitle: 'Fichas',
            description: 'Abrindo as gavetas...',
            theme: {
                background: {
                    kind: 'grid',
                    base: C.ink,
                    color: C.white,
                    alpha: 0.06,
                    size: 64,
                    width: 2,
                },

                card: C.inkSoft,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.stamp,

                title: C.paper,
                subtitle: C.stamp,
                description: C.line,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.line,
                progressFill: C.stamp,
                progressHighlight: C.stampSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer testar —
         * `{ level: 3, phase: 2 }` cai no último caso do Nível 3. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não quebra
         * nada.
         */
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}
