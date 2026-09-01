import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As chaves que o jogo consome: o cenário e as seis artes do acervo.
 *
 * As artes não são interface — são CONTEÚDO. É nelas que a criança descobre
 * que tem sete rostos na foto da turma, que não tem ninguém na foto da praça e
 * que a lista da secretaria está cheia de telefones. Essa pergunta só a
 * imagem responde.
 *
 * São seis e não três porque o ícone genérico de tipo saiu: um desenho de
 * clave de sol diz "isto é música", e a capa do disco diz "isto é o forró da
 * Banda Pé de Vento" — que é a informação de que a decisão precisa. Os ícones
 * de tipo continuam existindo em `Graphics`, como rede: enquanto uma arte não
 * estiver na pasta, o arquivo aparece pelo tipo e o jogo continua inteiro.
 *
 * Ficha, etiqueta, ação, selo e carimbo têm estado e são todos `Graphics`.
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
    'arq-trilha',
    'arq-documentario',
    'arq-lista',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e cada arte entra no
 * jogo assim que for salva na pasta, sem tocar em uma linha de código.
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
            subtitle: 'Cuidado ao decidir',
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
        preloadLives(this)
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
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
