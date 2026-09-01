import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As chaves que o jogo consome — o cenário e as duas caras do robô.
 *
 * Chaves, lâmpadas, placas, fichas da tabela, visor e fio são todos
 * `Graphics`: cada um tem estado (acesa/apagada, alvo/feito, certa/errada) e
 * como PNG viraria uma pilha de variantes por peça. Textura aqui é só desenho
 * que nunca muda.
 *
 * A capa fica de fora: quem usa ela é o catálogo, com `import` direto.
 */
const WANTED = [
    'bg-tradutor',
    'maquina-esperando',
    'maquina-recebeu',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro — foi
 * exatamente o que a versão antiga deste jogo fazia, com sete `import` fixos.
 * Com `import.meta.glob` o Vite registra só o que está lá, e um arquivo novo
 * entra no jogo assim que for salvo na pasta, sem tocar em uma linha de código.
 *
 * A lista `WANTED` filtra de propósito: a pasta guarda arte que este remake
 * não usa mais, e ela não deve ocupar memória.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO04/tradutor-da-maquina/*.png',
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
            title: 'Tradutor da Máquina',
            subtitle: 'Letra, número, lâmpada',
            description: 'Ligando o painel...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.bit,
                    alpha: 0.06,
                    size: 30,
                    gap: 34,
                    angle: 'diagonal',
                },

                card: C.steel,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.bit,

                title: C.paper,
                subtitle: C.letra,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.edge,
                progressFill: C.bit,
                progressHighlight: C.bitSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer ver —
         * `{ level: 3, phase: 0 }` cai na mensagem torta. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não
         * quebra nada.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
