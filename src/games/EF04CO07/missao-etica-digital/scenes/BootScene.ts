import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * As chaves que o jogo consome: o cenário e as três fotos do acervo.
 *
 * As fotos não são interface — são CONTEÚDO. É nelas que a criança descobre
 * que tem sete rostos na foto da turma e ninguém na foto da praça, e essa
 * pergunta só a imagem responde. Ficha, etiqueta, ação, lâmpada e ícone de
 * tipo têm estado e continuam todos em `Graphics`.
 *
 * O `bg-data-center.png` antigo NÃO entra nesta lista de propósito. Ele ainda
 * está na pasta porque o `catalog.ts` o importa como miniatura com `import`
 * fixo — apagar agora derrubaria o build inteiro. Assim que a capa nova
 * existir, é uma linha lá e o arquivo pode sumir.
 */
const WANTED = [
    'bg-missao-etica',
    'arq-turma',
    'arq-desenho',
    'arq-praca',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e cada foto entra no
 * jogo assim que for salva na pasta — até lá, a ficha mostra o ícone do tipo e
 * o jogo continua inteiramente jogável.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO07/missao-etica-digital/*.png',
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
            title: 'Missão Ética Digital',
            subtitle: 'Vire a ficha antes de decidir',
            description: 'Ligando os servidores...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.permissao,
                    alpha: 0.06,
                    size: 30,
                    gap: 34,
                    angle: 'diagonal',
                },

                card: C.rack,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.permissao,

                title: C.paper,
                subtitle: C.autoria,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.edge,
                progressFill: C.guarda,
                progressHighlight: C.permissao,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto na missão que se quer ver —
         * `{ level: 3, phase: 1 }` cai na lista de telefones das famílias. Os
         * dois são grampeados no `GameScene.init`, então número fora da faixa
         * não quebra nada.
         */
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}
