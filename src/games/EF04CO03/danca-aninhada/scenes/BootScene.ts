import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { CUTS, SHEET } from '../data/art'
import { C } from '../data/theme'

/**
 * As imagens são OPCIONAIS.
 *
 * O `import.meta.glob` não quebra o build quando um PNG ainda não existe, e
 * cada peça confere `textures.exists` antes de desenhar. É o que deixa o
 * nível 1 rodar inteiro com o desenho de reserva, como pede o §6 do
 * TEXTURAS.md.
 */
const ART = import.meta.glob('../../../../assets/games/EF04CO03/danca-aninhada/*.png', {
    eager: true,
    import: 'default',
}) as Record<string, string>

const KEY_OF: Record<string, string> = {
    'bg-palco-escolar': SHEET.stage,
    dancarino: SHEET.dancer,
}

const nameOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Dança Aninhada',
            subtitle: 'Monte a coreografia e veja o dançarino executar!',
            description: 'Afinando a música...',
            theme: {
                background: { kind: 'solid', color: C.curtain },
                card: C.sheet,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.ink,
                title: C.ink,
                subtitle: C.outerDeep,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.ink,
                progressFill: C.outer,
                progressHighlight: C.inner,
            },
        })

        Object.entries(ART).forEach(([path, url]) => {
            const name = nameOf(path)
            // a capa é do catálogo, não da cena
            if (name.startsWith('cover-')) return
            const key = KEY_OF[name]
            if (key) this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        /*
         * OS QUADROS SÃO RECORTES, NÃO UMA GRADE.
         *
         * A folha entregue tem as quatro poses em posições irregulares — as
         * medidas estão em `data/art.ts` — então cada quadro é declarado pela
         * caixa alfa dele. `load.spritesheet` com largura fixa cortaria o
         * dançarino do giro no meio.
         */
        if (this.textures.exists(SHEET.dancer)) {
            const texture = this.textures.get(SHEET.dancer)
            CUTS.forEach(cut => {
                if (!texture.has(cut.key)) texture.add(cut.key, 0, cut.x, cut.y, cut.w, cut.h)
            })
        }

        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }
}
