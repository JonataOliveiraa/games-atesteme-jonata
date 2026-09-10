import Phaser from 'phaser'
import { DEPTH, H, PLATFORM_ART, ROCK, TILES, W, WORLD } from '../data/layout'
import { groundSegments } from '../data/rules'
import { C } from '../data/theme'
import type { RunMap, Solid } from '../types'

/**
 * O chão tem DUAS fileiras. A de cima é o bloco com grama (quadro 0); a de baixo
 * é terra pura (quadro 4) e some na borda da tela. Sem ela o chão era uma faixa
 * fina e o mundo parecia flutuar.
 *
 * A pedra (quadro 5) é sólida dos lados: ela é o único obstáculo que empurra o
 * herói de volta, e é por isso que ela existe — um pulo obrigatório que não
 * custa nada errar.
 */
export function createWorld(scene: Phaser.Scene) {
    const layer = scene.add.container(0, 0).setDepth(DEPTH.world)
    let sky: Phaser.GameObjects.Graphics | null = null
    let panels: Phaser.GameObjects.Image[] = []
    let panelWidth = W
    let parallax = WORLD.parallax
    let solids: Solid[] = []
    let blocks: Solid[] = []
    let map: RunMap | null = null

    const clear = () => {
        layer.removeAll(true)
        solids = []
        blocks = []
    }

    const clearBackground = () => {
        panels.forEach(panel => panel.destroy())
        panels = []
        sky?.destroy()
        sky = null
    }

    /**
     * UMA CÓPIA SÓ, e o parallax medido para nunca chegar no fim dela.
     *
     * O `fundo-nN.png` entregue NÃO emenda consigo mesmo: repetido, a árvore da
     * direita aparece cortada no meio da tela. E ele também não pode virar
     * `TileSprite` — 768 px de altura não é potência de dois, o WebGL não
     * consegue repetir a textura e sobra uma risca de um pixel no céu.
     *
     * A saída é aritmética: a imagem tem 1920 px de largura e a tela mostra
     * 1280, então sobram 640 px de folga. O fator de parallax é escolhido para
     * gastar essa folga exatamente ao longo do mapa inteiro — 0,30 em vez de
     * 0,35, uma diferença que ninguém enxerga, e emenda nenhuma.
     */
    const buildBackground = (key: string, mapLength: number) => {
        clearBackground()
        if (scene.textures.exists(key)) {
            const source = scene.textures.get(key).getSourceImage()
            panelWidth = source.width * (H / source.height)
            const slack = Math.max(0, panelWidth - W)
            const maxScroll = Math.max(1, mapLength - W)
            parallax = Math.min(WORLD.parallax, slack / maxScroll)
            panels = [
                scene.add
                    .image(0, 0, key)
                    .setOrigin(0, 0)
                    .setDisplaySize(panelWidth, H)
                    .setScrollFactor(0)
                    .setDepth(DEPTH.bg),
            ]
            return
        }
        const g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.bg)
        g.fillStyle(C.sky, 1)
        g.fillRect(0, 0, W, H)
        g.fillStyle(C.grass, 0.5)
        g.fillRect(0, WORLD.groundY - 90, W, 90)
        sky = g
    }

    /**
     * OS QUADROS RECORTADOS, e por que a risca aparecia.
     *
     * Cada emenda de bloco do chão vinha com uma risca escura de dois pixels, o
     * mapa inteiro listrado na vertical. Não era a arte: medido no PNG, os
     * pixels da borda do quadro da terra são terra normal. Era o filtro
     * bilinear — ao desenhar o quadro reduzido de 300 para 120, ele amostra meio
     * texel PARA FORA do retângulo do quadro e puxa o vizinho da folha, que no
     * caso da terra é o fundo transparente da pedra.
     *
     * A saída é recortar 2 px de cada lado do quadro de origem. O filtro passa a
     * ter margem para sobrar, e some a risca. Perde-se 1,3% do desenho.
     */
    const INSET = 2
    const ensureTrimmed = () => {
        if (!scene.textures.exists('chao')) return false
        const texture = scene.textures.get('chao')
        const size = TILES.frameW
        const trim = (name: string, column: number, row: number) => {
            if (texture.has(name)) return
            texture.add(
                name,
                0,
                column * size + INSET,
                row * size + INSET,
                size - INSET * 2,
                size - INSET * 2,
            )
        }
        trim('grass-tile', TILES.grass, 0)
        trim('edge-tile', TILES.edge, 0)
        trim('dirt-tile', TILES.dirt % 4, 1)
        return true
    }

    const groundRow = (
        x: number,
        w: number,
        hasArt: boolean,
        edgeLeft: boolean,
        edgeRight: boolean,
    ) => {
        if (!hasArt) {
            const g = scene.add.graphics().setDepth(DEPTH.world)
            g.fillStyle(C.dirt, 1)
            g.fillRect(x, WORLD.groundY, w, H - WORLD.groundY)
            g.fillStyle(C.grass, 1)
            g.fillRect(x, WORLD.groundY, w, 30)
            layer.add(g)
            return
        }

        // Bloco QUADRADO, sempre: `tile + 1` nos dois lados é escala uniforme,
        // então a arte não deforma e ainda sobra 1 px de sobreposição. A fileira
        // de baixo passa da borda da tela e é a tela que a corta — cortar é
        // honesto, espremer não.
        //
        // A BEIRADA DO BURACO SUBSTITUI O BLOCO, não entra por cima dele. Antes o
        // quadro da ponta era desenhado sobre o bloco comum e as duas bordas
        // apareciam ao mesmo tempo: sobrava um gancho escuro pendurado no vão.
        // Como os buracos caem na grade de 180, a última coluna do pedaço é
        // exatamente a que precisa da ponta.
        const tile = WORLD.tile
        const columns = Math.ceil(w / tile)
        for (let i = 0; i < columns; i++) {
            const left = x + i * tile
            const isFirst = i === 0
            const isLast = i === columns - 1
            const edge = (isFirst && edgeLeft) || (isLast && edgeRight)

            const top = scene.add
                .image(left, WORLD.groundY, 'chao', edge ? 'edge-tile' : 'grass-tile')
                .setOrigin(0, 0)
                .setDisplaySize(tile + 1, tile + 1)
                .setDepth(DEPTH.world + 1)
            // O quadro da ponta desenha o barranco à ESQUERDA; do lado direito
            // do pedaço ele entra espelhado.
            if (edge && isLast && edgeRight) top.setFlipX(true)
            layer.add(top)

            layer.add(
                scene.add
                    .image(left, WORLD.groundY + tile, 'chao', 'dirt-tile')
                    .setOrigin(0, 0)
                    .setDisplaySize(tile + 1, tile + 1)
                    .setDepth(DEPTH.world),
            )
        }
    }

    return {
        build(next: RunMap, backgroundKey: string) {
            clear()
            map = next
            buildBackground(backgroundKey, next.length)

            const hasArt = ensureTrimmed()
            const segments = groundSegments(next.length, next.gaps)

            segments.forEach(segment => {
                groundRow(
                    segment.x,
                    segment.w,
                    hasArt,
                    segment.x > 0,
                    segment.x + segment.w < next.length,
                )
                solids.push({ x: segment.x, y: WORLD.groundY, w: segment.w })
            })

            next.platforms.forEach(platform => {
                if (hasArt) {
                    const scale = platform.w / PLATFORM_ART.width
                    const image = scene.add
                        .image(platform.x + platform.w / 2, platform.y, 'chao', TILES.plank)
                        .setOrigin(0.5, PLATFORM_ART.top)
                        .setScale(scale)
                        .setDepth(DEPTH.platform)
                    layer.add(image)
                } else {
                    const g = scene.add.graphics().setDepth(DEPTH.platform)
                    g.fillStyle(C.wood, 1)
                    g.fillRoundedRect(platform.x, platform.y, platform.w, 30, 10)
                    layer.add(g)
                }
                solids.push(platform)
            })

            next.rocks.forEach(rock => {
                if (hasArt) {
                    const image = scene.add
                        .image(rock.x, WORLD.groundY + 6, 'chao', TILES.rock)
                        .setOrigin(0.5, 1)
                        .setDisplaySize(ROCK.size, ROCK.size)
                        .setDepth(DEPTH.platform)
                    layer.add(image)
                } else {
                    const g = scene.add.graphics().setDepth(DEPTH.platform)
                    g.fillStyle(C.sock, 1)
                    g.fillRoundedRect(
                        rock.x - ROCK.half,
                        WORLD.groundY - ROCK.top,
                        ROCK.half * 2,
                        ROCK.top + 6,
                        22,
                    )
                    layer.add(g)
                }
                const solid = {
                    x: rock.x - ROCK.half,
                    y: WORLD.groundY - ROCK.top,
                    w: ROCK.half * 2,
                }
                solids.push(solid)
                blocks.push(solid)
            })
        },

        /** O fundo anda mais devagar que a câmera. */
        update(cameraX: number) {
            if (!panels.length) return
            panels[0].x = -Math.min(cameraX * parallax, Math.max(0, panelWidth - W))
        },

        solids() {
            return solids
        },

        /** Só as pedras: elas empurram de lado, as plataformas não. */
        blocks() {
            return blocks
        },

        length() {
            return map?.length ?? W
        },

        setVisible(value: boolean) {
            layer.setVisible(value)
            panels.forEach(panel => panel.setVisible(value))
            sky?.setVisible(value)
        },

        clear,

        destroy() {
            clear()
            clearBackground()
            layer.destroy(true)
        },
    }
}

export type World = ReturnType<typeof createWorld>
