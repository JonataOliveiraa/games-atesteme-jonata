import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { preloadLives } from '../../../../shared/hud/createLives'

/**
 * As chaves que o jogo consome: o cenário e as cinco imagens do acervo.
 *
 * As cinco fotos não são interface — são CONTEÚDO. Elas são a peça que a
 * criança coloca na obra, e escolher a certa é metade do que este jogo ensina.
 * Cartão, ferramenta, carta de mídia e selo da banca têm estado e continuam
 * todos em `Graphics`.
 *
 * A capa fica de fora: quem usa ela é o catálogo, com `import` direto.
 */
const WANTED = [
    'bg-estudio',
    'foto-lixeiras',
    'foto-horta',
    'foto-festa',
    'foto-quadra',
    'foto-gato',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e cada foto entra no
 * jogo assim que for salva na pasta — até lá, a peça mostra o nome dela e o
 * jogo continua jogável.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO06/estudio-producao-digital/*.png',
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
            title: 'Estúdio de Produção Digital',
            subtitle: 'Cartaz, slides e vídeo',
            description: 'Acendendo os refletores...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.white,
                    alpha: 0.05,
                    size: 32,
                    gap: 36,
                    angle: 'diagonal',
                },

                card: C.wall,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.apresentacao,

                title: C.paper,
                subtitle: C.texto,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.edge,
                progressFill: C.apresentacao,
                progressHighlight: C.video,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
        preloadLives(this)
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no trabalho que se quer ver —
         * `{ level: 3, phase: 2 }` cai no vídeo do intervalo. Os dois são
         * grampeados no `GameScene.init`, então número fora da faixa não quebra
         * nada.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
