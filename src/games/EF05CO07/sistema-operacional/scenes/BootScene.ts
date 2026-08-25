import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * As chaves que o jogo consome.
 *
 * Aqui a arte é ILUSTRAÇÃO, e não conteúdo: quem diz que o teclado está livre é
 * o aro verde desenhado em `Graphics`, não o PNG do teclado. Por isso a falta de
 * qualquer uma destas texturas deixa o jogo feio e continua jogável — o soquete
 * fica vazio, o nome embaixo continua lá, e o estado continua legível.
 *
 * A lista é uma AUTORIZAÇÃO, não uma lista de importações: só entra no jogo o
 * que estiver aqui E na pasta.
 */
const WANTED = [
    'bg-central',
    'bg-sistemas',
    'icone-app',

    'programa-navegador',
    'programa-editor',
    'programa-jogo',
    'programa-player',
    'programa-fotos',
    'programa-impressao',

    'recurso-memoria',
    'recurso-arquivos',
    'recurso-teclado',
    'recurso-mouse',
    'recurso-monitor',
    'recurso-impressora',
] as const

/**
 * As texturas são VARRIDAS da pasta, não importadas uma a uma.
 *
 * A versão anterior tinha quinze `import ... from '.../recurso-x.png'` no topo
 * deste arquivo. Um `import` de arquivo que não existe quebra o build INTEIRO —
 * não este jogo, o site — e é assim que uma arte renomeada derruba o catálogo
 * de quarenta e cinco jogos. Com `import.meta.glob` o Vite registra o que está
 * na pasta, e o que faltar simplesmente não é carregado.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF05CO07/sistema-operacional/*.png',
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
            title: 'Controlador do Sistema',
            subtitle: 'Você é o sistema operacional desta máquina',
            description: 'Ligando os sistemas...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.ciano,
                    alpha: 0.06,
                    size: 28,
                    gap: 32,
                    angle: 'diagonal',
                },

                card: C.painel,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.edge,

                title: C.creme,
                subtitle: C.ciano,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.soquete,
                progressBorder: C.edge,
                progressFill: C.ciano,
                progressHighlight: C.cianoSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto na fase que se quer ver —
         * `{ level: 2, phase: 1 }` cai na fase de fechar programa e
         * `{ level: 3, phase: 2 }` no turno cheio. Os dois são grampeados no
         * `GameScene.init`, então número fora da faixa não quebra nada.
         *
         * E a `UIScene` NÃO é lançada aqui: ela foi aposentada, como nos outros
         * remakes. Todo o desenho mora na cena que conhece o estado.
         */
        this.scene.start('GameScene', { level: 1, phase: 0, points: 0 })
    }
}
