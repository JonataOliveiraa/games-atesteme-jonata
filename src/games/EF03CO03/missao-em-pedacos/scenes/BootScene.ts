import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'
import { LEVELS } from '../data/levels'
import { C } from '../data/theme'

const FILES = import.meta.glob(
    '../../../../assets/games/EF03CO03/missao-em-pedacos/*.png',
    { eager: true, import: 'default' },
) as Record<string, string>

const keyOf = (path: string) => path.split('/').pop()!.replace(/\.png$/i, '')

/** As folhas em grade, medidas no arquivo entregue — não no que foi pedido. */
const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    heroi: { frameWidth: 300, frameHeight: 450 },
    chao: { frameWidth: 300, frameHeight: 300 },
    lixo: { frameWidth: 256, frameHeight: 256 },
}

const ITEM_FRAME = 300

/** As folhas de resultado são sempre 4 colunas por 2 linhas, venham do tamanho que vierem. */
const FINAL_COLS = 4
const FINAL_ROWS = 2

/** A margem que some com o vizinho quando o quadro não fecha em pixel inteiro. */
const FINAL_INSET = 1

/** Só o que os níveis presentes usam: cada folha passa de meio mega. */
const WANTED = new Set<string>([
    'heroi',
    'chao',
    'bancada',
    'lixo',
    'mesa',
    ...LEVELS.flatMap(level => level.tasks.map(task => task.sheetKey)),
    ...LEVELS.flatMap(level => level.tasks.map(task => task.finalKey)),
    ...LEVELS.map(level => `fundo-n${level.level}`),
])

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' })
    }

    preload() {
        createLoadingScreen(this, {
            title: 'Missão em Pedaços',
            subtitle: 'Corte a tarefa no meio!',
            description: 'Preparando o quintal...',
            theme: {
                background: { kind: 'solid', color: C.sky },
                card: C.card,
                cardShadow: C.ink,
                cardHighlight: C.white,
                cardBorder: C.warnDark,
                title: C.ink,
                subtitle: C.warnDark,
                description: C.inkSoft,
                titleStroke: C.white,
                progressTrack: C.white,
                progressBorder: C.warnDark,
                progressFill: C.warn,
                progressHighlight: C.gold,
            },
        })

        Object.entries(FILES).forEach(([path, url]) => {
            const key = keyOf(path)
            if (!WANTED.has(key)) return
            if (key.startsWith('itens-')) {
                this.load.spritesheet(key, url, {
                    frameWidth: ITEM_FRAME,
                    frameHeight: ITEM_FRAME,
                })
                return
            }
            // As folhas de resultado entram como IMAGEM e são cortadas em
            // `create`, com a medida real do arquivo. O `final-n2.png` chegou em
            // 1774 x 887 — quadro de 443,5 — e um `spritesheet` de tamanho fixo
            // teria escorregado um quadro a cada coluna.
            if (key.startsWith('final-')) {
                this.load.image(key, url)
                return
            }
            const sheet = SHEETS[key]
            if (sheet) this.load.spritesheet(key, url, sheet)
            else this.load.image(key, url)
        })
        preloadLives(this)
    }

    create() {
        this.cutFinalSheets()
        this.scene.start('GameScene', { level: faseInicial(this, 1), points: 0 })
    }

    /**
     * Corta cada `final-nN` numa grade de 4 x 2 medida no arquivo entregue.
     *
     * Os quadros ficam com os nomes '0' a '7', que é o que o jogo pede. Fazer
     * isso aqui, e não no `load`, é o que permite cada folha chegar num tamanho
     * diferente sem o carregador precisar saber de antemão.
     */
    private cutFinalSheets() {
        Object.keys(FILES).forEach(path => {
            const key = keyOf(path)
            if (!key.startsWith('final-') || !this.textures.exists(key)) return
            const texture = this.textures.get(key)
            const source = texture.getSourceImage()
            const w = source.width / FINAL_COLS
            const h = source.height / FINAL_ROWS
            for (let row = 0; row < FINAL_ROWS; row++) {
                for (let column = 0; column < FINAL_COLS; column++) {
                    const name = String(row * FINAL_COLS + column)
                    if (texture.has(name)) continue
                    // A margem de um pixel de cada lado: o `final-n2` chegou em
                    // 1774 de largura, e o quadro de 443,5 deixava uma fatia do
                    // vizinho aparecendo na borda direita do resultado.
                    texture.add(
                        name,
                        0,
                        Math.round(column * w) + FINAL_INSET,
                        Math.round(row * h) + FINAL_INSET,
                        Math.floor(w) - FINAL_INSET * 2,
                        Math.floor(h) - FINAL_INSET * 2,
                    )
                }
            }
        })
    }
}
