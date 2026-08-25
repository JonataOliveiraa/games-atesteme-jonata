import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * As chaves que o jogo consome.
 *
 * A capa (`cover-investigacao-dados-risco`) não entra: quem a usa é o catálogo,
 * não a cena.
 */
const WANTED = [
    'bg-investigacao',
    'icone-alerta',
    'icone-chave',
    'icone-lupa',
    'icone-usuario-desc',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e um arquivo novo entra
 * no jogo assim que for salvo na pasta, sem tocar em uma linha de código.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO09/investigacao-dados-risco/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

function found(): Array<[string, string]> {
    const byKey = new Map<string, string>()
    Object.entries(FILES).forEach(([path, url]) => {
        const key = path.split('/').pop()?.replace(/\.png$/i, '')
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
            title: 'Investigação',
            subtitle: 'Dados em Risco',
            description: 'Abrindo os casos...',
            theme: {
                background: {
                    kind: 'dots',
                    base: C.ink,
                    color: C.white,
                    alpha: 0.05,
                    size: 34,
                    radius: 2,
                },

                card: C.inkSoft,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.probe,

                title: C.paper,
                subtitle: C.probe,
                description: C.unknown,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.unknown,
                progressFill: C.probe,
                progressHighlight: C.probeSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer testar —
         * `{ level: 3, phase: 0 }` cai no primeiro caso do Nível 3. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não quebra
         * nada.
         */
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}
