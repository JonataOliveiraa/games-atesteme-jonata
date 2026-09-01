import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As chaves que o jogo consome — os três céus e as duas poses do limpador.
 *
 * Prédio, janelas, blocos e botões continuam todos em `Graphics`: eles mudam de
 * estado o tempo todo (janela suja/lavando/limpa, bloco pulsando na cor do laço)
 * e como PNG virariam dezenas de variantes.
 *
 * O limpador é a exceção justamente porque tem só DUAS poses, e um boneco chibi
 * desenhado à mão vale mais que qualquer soma de retângulos. Se as duas faltarem
 * na pasta, `createBuilding` volta sozinho para o boneco de `Graphics`.
 */
const WANTED = [
    'bg-building-day',
    'bg-building-sunset',
    'bg-building-night',
    'personagem-parado',
    'personagem-limpando',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e um arquivo novo entra
 * no jogo assim que for salvo na pasta, sem tocar em uma linha de código.
 *
 * A lista `WANTED` filtra de propósito: a pasta guarda arte que este remake não
 * usa mais, e ela não deve ocupar memória.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO03/predio-dos-lacos/*.png',
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
            title: 'Prédio dos Laços',
            subtitle: 'Repita, repita',
            description: 'Montando o andaime...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.white,
                    alpha: 0.05,
                    size: 36,
                    gap: 36,
                    angle: 'diagonal',
                },

                card: C.roof,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.outer,

                title: C.paper,
                subtitle: C.inner,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.idle,
                progressFill: C.outer,
                progressHighlight: C.outerSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no prédio que se quer testar —
         * `{ level: 3, phase: 2 }` cai no prédio de dez andares. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não quebra
         * nada.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
