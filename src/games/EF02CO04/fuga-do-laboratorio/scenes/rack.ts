import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, RACK, rackSlot } from '../data/layout'
import { C } from '../data/theme'
import { item } from '../data/items'
import { createItemIcon } from './itemIcon'
import { MOVEIS_SHEET, MOVEIS } from './furniture'

const HALF = RACK.tile / 2

interface Tile {
    id: string
    root: Phaser.GameObjects.Container
    art: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    x: number
    y: number
    taken: boolean
    chosen: boolean
}

/**
 * A FICHA NÃO É UMA CARTA.
 *
 * Cada item ganhava um retângulo creme atrás. Quatro cartas numa fileira, com
 * o desenho pequeno no meio de cada uma, e o que a criança via primeiro era a
 * carta — não a coisa. O ícone do 'itens.png' já é a ficha: azul se é peça,
 * tile roxo se é programa.
 *
 * Fica só o halo de escolhido, porque esse não é fundo: é o estado.
 */
function paintTile(g: Phaser.GameObjects.Graphics, chosen: boolean) {
    g.clear()
    if (!chosen) return
    g.fillStyle(C.gold, 0.2)
    g.fillRoundedRect(-HALF, -HALF, RACK.tile, RACK.tile, 26)
    g.lineStyle(5, C.gold, 0.95)
    g.strokeRoundedRect(-HALF + 4, -HALF + 4, RACK.tile - 8, RACK.tile - 8, 22)
}

export interface RackOptions {
    onTap: (id: string) => void
}

/**
 * O rack de peças e programas.
 *
 * Uma ficha some do rack quando entra na máquina e VOLTA para o mesmo lugar
 * quando é tirada de lá — o vazio guarda o endereço dela. Sem isso, cada
 * desencaixe rearranjaria a fileira inteira e a criança perderia o que já
 * tinha decorado com o olho.
 */
export function createRack(scene: Phaser.Scene, options: RackOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.rack)

    /* o móvel ---------------------------------------------------------- */
    const board = scene.textures.exists(MOVEIS_SHEET)
        && scene.textures.get(MOVEIS_SHEET).has(String(MOVEIS.rack))
        ? scene.add.image(RACK.cx, RACK.cy, MOVEIS_SHEET, MOVEIS.rack).setDisplaySize(RACK.w, RACK.h)
        : null

    const fallback = board ? null : scene.add.graphics()
    if (fallback) {
        const x = RACK.cx - RACK.w / 2
        const y = RACK.cy - RACK.h / 2
        // uma tábua fina sob os ícones, e não a laje que competia com eles
        // uma estante encostada na parede: fundo, batente e a sombra dela
        fallback.fillStyle(C.ink, 0.28)
        fallback.fillRoundedRect(x + 7, y + 12, RACK.w, RACK.h, 28)
        fallback.fillStyle(C.woodDeep, 1)
        fallback.fillRoundedRect(x, y, RACK.w, RACK.h, 28)
        fallback.fillStyle(C.woodDark, 1)
        fallback.fillRoundedRect(x + 9, y + 9, RACK.w - 18, RACK.h - 18, 21)
        fallback.fillStyle(C.wood, 0.55)
        fallback.fillRoundedRect(x + 9, y + 9, RACK.w - 18, 18, 9)
    }
    root.add(board ?? fallback!)

    const tiles: Tile[] = []

    const build = (ids: string[]) => {
        ids.forEach((id, i) => {
            const target = item(id)
            const at = rackSlot(i, ids.length)
            const holder = scene.add.container(at.x, at.y).setDepth(DEPTH.item)

            const art = scene.add.graphics()
            paintTile(art, false)
            const icon = createItemIcon(scene, target, RACK.icon)
            holder.add([art, icon])

            const zone = scene.add.zone(at.x, at.y, RACK.tile + 16, RACK.tile + 16)
                .setOrigin(0.5)
                .setDepth(DEPTH.item + 1)
                .setInteractive({ useHandCursor: true })

            const tile: Tile = { id, root: holder, art, zone, x: at.x, y: at.y, taken: false, chosen: false }
            tiles.push(tile)

            zone.on('pointerdown', () => {
                if (!zone.input?.enabled || tile.taken) return
                void FX.press(scene, holder)
                options.onTap(id)
            })
        })
    }

    const find = (id: string) => tiles.find(tile => tile.id === id)

    const clear = () => {
        tiles.forEach(tile => {
            scene.tweens.killTweensOf(tile.root)
            tile.zone.destroy()
            tile.root.destroy(true)
        })
        tiles.length = 0
    }

    let enabled = false

    return {
        get container() {
            return root
        },

        async load(ids: string[]) {
            clear()
            build(ids)
            await FX.all(...tiles.map((tile, i) =>
                FX.wait(scene, i * 90).then(() => {
                    tile.root.setScale(0.5).setAlpha(0)
                    return FX.to(scene, tile.root, { scale: 1, alpha: 1 },
                        { duration: 320, ease: 'Back.easeOut' })
                }),
            ))
        },

        setEnabled(on: boolean) {
            enabled = on
            tiles.forEach(tile => {
                tile.zone.input!.enabled = on && !tile.taken
            })
        },

        setChosen(id: string | null) {
            tiles.forEach(tile => {
                const next = tile.id === id && !tile.taken
                if (tile.chosen === next) return
                tile.chosen = next
                paintTile(tile.art, next)
                scene.tweens.killTweensOf(tile.root)
                void FX.to(scene, tile.root, {
                    y: next ? tile.y - RACK.lift : tile.y,
                    scale: next ? 1.08 : 1,
                }, { duration: 180, ease: 'Quad.easeOut' })
            })
        },

        /** A ficha sai do rack e o vão dela fica guardado. */
        take(id: string) {
            const tile = find(id)
            if (!tile) return
            tile.taken = true
            tile.chosen = false
            tile.zone.input!.enabled = false
            tile.root.setVisible(false).setScale(1).setY(tile.y)
            paintTile(tile.art, false)
        },

        /** E volta para o mesmo vão quando a criança desencaixa. */
        async give(id: string) {
            const tile = find(id)
            if (!tile) return
            tile.taken = false
            tile.root.setVisible(true).setScale(0.5).setAlpha(0)
            tile.zone.input!.enabled = enabled
            await FX.to(scene, tile.root, { scale: 1, alpha: 1 },
                { duration: 280, ease: 'Back.easeOut' })
        },

        tileAt(id: string) {
            const tile = find(id)
            return { x: tile?.x ?? RACK.cx, y: tile?.y ?? RACK.cy }
        },

        bounds() {
            return { x: RACK.cx, y: RACK.cy, w: RACK.w + 16, h: RACK.h + 16 }
        },

        destroy() {
            clear()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Rack = ReturnType<typeof createRack>
