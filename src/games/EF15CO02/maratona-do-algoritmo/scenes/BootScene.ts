import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { C } from '../data/theme'

/**
 * As folhas vieram maiores que o pedido do TEXTURAS.md — 450 × 450 e
 * 400 × 400 por célula, em vez de 256. A grade está certa (4 × 2 e 2 × 2), e
 * o `setDisplaySize` resolve o resto: o que importa é o número da célula
 * bater com o arquivo, não com o documento.
 */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    skatista: { frameWidth: 450, frameHeight: 450 },
    decor: { frameWidth: 400, frameHeight: 400 },
    /* A caixa e o corrimão dividem uma folha de duas células. */
    'outros-da-pista': { frameWidth: 800, frameHeight: 300 },
    /* As duas rampas vieram em arquivo próprio. Entram como folha de uma
     * célula só para o resto do código tratar toda peça do mesmo jeito:
     * `(key, frame)`, sem um caminho especial para quem veio sozinho. */
    'rampa-p': { frameWidth: 800, frameHeight: 330 },
    'rampa-g': { frameWidth: 900, frameHeight: 500 },
}

/**
 * A CAPA NÃO É TEXTURA DE JOGO. Ela mora na mesma pasta porque é o lugar dos
 * assets deste jogo, mas quem a usa é o catálogo — carregá-la aqui seriam
 * 2 MB baixados para nunca aparecerem em cena.
 */
const FORA_DO_JOGO = ['cover-maratona-do-algoritmo']

/**
 * `import.meta.glob`, nunca `import` estático: um arquivo de textura que
 * ainda não existe derruba o `vite build` inteiro.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF15CO02/maratona-do-algoritmo/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Maratona do Algoritmo',
            subtitle: 'Monte o caminho do skatista!',
            description: 'Preparando o parque...',
            theme: {
                background: { kind: 'solid', color: 0x9fd8f2 },
                card: C.cream,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.okDark,
                title: C.ink,
                subtitle: C.okDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.okDark,
                progressFill: C.ok,
                progressHighlight: C.warn,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (FORA_DO_JOGO.includes(key)) return
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        /*
         * `faseInicial` não é opcional: a plataforma manda `?stage=2` e o
         * valor chega pelo `registry` antes de qualquer cena existir. Pelo
         * `START_GAME` seria tarde, com a cena já montada na fase 1.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
