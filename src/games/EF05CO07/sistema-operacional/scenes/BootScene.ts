import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'

/**
 * As texturas que os três níveis usam.
 *
 * `bg-sistemas`, `icone-app` e `programa-jogo` estão na pasta mas NÃO entram:
 * nenhuma tela os mostra. Carregar arte que o jogo não usa é peso de download
 * por nada.
 *
 * A falta de qualquer uma destas deixa o jogo feio e jogável: o lugar da peça
 * fica vazio, o nome embaixo continua lá, e o estado continua legível — porque
 * quem desenha estado aqui é `Graphics`, nunca a textura.
 */
const WANTED = [
    'bg-central',

    'recurso-teclado',
    'recurso-mouse',
    'recurso-monitor',
    'recurso-arquivos',
    'recurso-impressora',
    'recurso-memoria',

    'programa-editor',
    'programa-navegador',
    'programa-player',
    'programa-fotos',
    'programa-impressao',
] as const

/**
 * As texturas são VARRIDAS da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que não existe quebra o build INTEIRO — não este jogo,
 * o site — e é assim que uma arte renomeada derruba o catálogo de quarenta e
 * cinco jogos. Com `import.meta.glob` o Vite registra o que está lá.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF05CO07/sistema-operacional/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()?.replace(/(\.png)+$/i, '') ?? ''

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
            title: 'Sistema Operacional',
            subtitle: 'Tecnologia é o futuro!',
            description: 'Ligando a máquina...',
            theme: {
                background: {
                    kind: 'stripes', base: C.ink, color: C.ciano,
                    alpha: 0.06, size: 28, gap: 32, angle: 'diagonal',
                },
                card: C.vidro,
                cardShadow: C.sombra,
                cardHighlight: C.branco,
                cardBorder: C.ciano,
                title: C.creme,
                subtitle: C.ciano,
                description: C.dim,
                titleStroke: C.ink,
                progressTrack: C.fosco,
                progressBorder: C.ciano,
                progressFill: C.ciano,
                progressHighlight: C.creme,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        this.scene.start('GameScene', { nivel: 3, points: 0 })
    }
}
