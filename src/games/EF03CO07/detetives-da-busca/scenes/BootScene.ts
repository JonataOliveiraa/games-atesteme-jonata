import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As chaves que o jogo consome. Ver TEXTURAS.md.
 *
 * A capa (`cover-detetives-da-busca`) não entra: quem a usa é o catálogo, não
 * a cena.
 */
const WANTED = [
    'bg-escritorio',
    'lupa',
    'pino',
    'selo-site',
    'selo-imagem',
    'selo-video',
    'marca-serve',
    'marca-fora',
    'selo-caso',
    'mural-vazio',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe QUEBRA O BUILD, e a arte deste
 * jogo está sendo desenhada agora — com import fixo, o projeto inteiro pararia
 * de compilar até o último PNG chegar. Com `import.meta.glob` o Vite registra só
 * o que está lá, e cada arquivo novo entra no jogo assim que for salvo na
 * pasta, sem tocar em uma linha de código.
 *
 * A lista `WANTED` filtra o resultado de propósito: a pasta ainda guarda a arte
 * antiga, que não deve ser carregada nem ocupar memória.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO07/detetives-da-busca/*.png',
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
            title: 'Detetives da Busca',
            subtitle: 'Eureka!',
            description: 'Preparando o quadro de pistas...',
            theme: {
                background: {
                    kind: 'dots',
                    base: C.ink,
                    color: C.white,
                    alpha: 0.05,
                    size: 34,
                    radius: 2,
                },

                card: C.wood,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.search,

                title: C.paper,
                subtitle: C.search,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.idle,
                progressFill: C.search,
                progressHighlight: C.searchSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer testar,
         * sem jogar tudo o que vem antes — `{ level: 2, phase: 1 }` cai no
         * segundo caso do Nível 2. Os dois são grampeados no `GameScene.init`,
         * então número fora da faixa não quebra nada.
         *
         * Em produção isto fica em 1 e 0: a plataforma controla o nível pelo
         * `stage` do START_GAME, e a troca acontece no `scene.restart` do fim
         * de fase.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
