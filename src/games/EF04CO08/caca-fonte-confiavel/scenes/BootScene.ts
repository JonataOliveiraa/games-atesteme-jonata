import Phaser from 'phaser'
import { createLoadingScreen } from '../../../../shared/loading/createLoadingScreen'
import { C } from '../data/theme'
import { faseInicial } from '../../../../shared/level/faseInicial'

/**
 * As chaves que o jogo consome: o cenário e as três ilustrações de tema.
 *
 * Uma ilustração por NÍVEL, não por caso — os três casos de um nível são três
 * perguntas sobre o mesmo assunto. Além de caber no orçamento de arte, é o que
 * faz a criança reconhecer os sites que erram sempre, que é metade do que se
 * aprende verificando fontes.
 *
 * Cartão, barra de endereço, ícone de critério, traço de marca-texto e carimbo
 * têm estado e são todos `Graphics`. Nada disso pode virar PNG: o traço do
 * marca-texto varre a linha, o carimbo cai e gira, e as linhas mudam de cor na
 * revelação.
 *
 * A pasta hoje tem oito PNGs de 1×1 pixel — placeholders de 70 bytes de uma
 * geração anterior deste jogo. Só o `cover-caca-fonte-confiavel.png` está
 * preso a um `import` fixo no `catalog.ts`; os outros sete podem sumir sem
 * ninguém sentir falta.
 */
const WANTED = [
    'bg-pesquisa',
    'tema-baleia',
    'tema-bertha',
    'tema-dino',
] as const

/**
 * As texturas são varridas da pasta, não importadas uma a uma.
 *
 * Um `import` de arquivo que ainda não existe quebra o build inteiro. Com
 * `import.meta.glob` o Vite registra só o que está lá, e cada ilustração entra
 * no jogo assim que for salva na pasta — até lá, o cartão mostra um bloco
 * neutro no lugar dela e o jogo continua inteiramente jogável.
 */
const FILES = import.meta.glob(
    '../../../../assets/games/EF04CO08/caca-fonte-confiavel/*.png',
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
            title: 'Caça à Fonte Confiável',
            subtitle: 'Quem escreveu? De onde tirou?',
            description: 'Abrindo as páginas...',
            theme: {
                background: {
                    kind: 'stripes',
                    base: C.ink,
                    color: C.marca,
                    alpha: 0.05,
                    size: 32,
                    gap: 36,
                    angle: 'diagonal',
                },

                card: C.estante,
                cardShadow: C.shadow,
                cardHighlight: C.white,
                cardBorder: C.marca,

                title: C.paper,
                subtitle: C.marca,
                description: C.idle,
                titleStroke: C.ink,

                progressTrack: C.ink,
                progressBorder: C.edge,
                progressFill: C.marca,
                progressHighlight: C.marcaSoft,
            },
        })

        found().forEach(([key, url]) => this.load.image(key, url))
    }

    create() {
        /*
         * `level` é 1-based, `phase` é 0-based.
         *
         * Trocar estes números abre o jogo direto no caso que se quer ver —
         * `{ level: 3, phase: 0 }` cai nas três páginas do tiranossauro, que é
         * onde a maioria está errada. Os dois são grampeados no
         * `GameScene.init`, então número fora da faixa não quebra nada.
         */
        this.scene.start('GameScene', { level: faseInicial(this, 1), phase: 0, points: 0 })
    }
}
