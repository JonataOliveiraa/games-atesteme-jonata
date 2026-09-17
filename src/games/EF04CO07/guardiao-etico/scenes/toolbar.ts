import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, TOOLS } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { ToolId } from '../types'

const TOOLS_KEY = 'ge-tools'

const FRAME: Record<ToolId, number> = { lupa: 0, marcador: 1, borracha: 2 }
const LABEL: Record<ToolId, string> = { lupa: 'LUPA', marcador: 'MARCADOR', borracha: 'BORRACHA' }
const ORDER: ToolId[] = ['lupa', 'marcador', 'borracha']

export interface ToolbarOptions {
    onSelect: (tool: ToolId) => void
}

/**
 * A bancada. A ferramenta escolhida é o que o toque no papel FAZ — e é ela que
 * responde "o que eu faço aqui?" sem uma frase de instrução.
 *
 * Trocar de ferramenta é de graça e não emite nada.
 */
export function createToolbar(scene: Phaser.Scene, options: ToolbarOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.bench)

    const bench = scene.add.graphics()
    bench.fillStyle(C.wood, 1)
    bench.fillRoundedRect(16, TOOLS.y - 14, 856, TOOLS.h + 26, 18)
    bench.fillStyle(C.woodTop, 1)
    bench.fillRoundedRect(16, TOOLS.y - 14, 856, TOOLS.h + 18, 18)
    bench.fillStyle(C.white, 0.12)
    bench.fillRoundedRect(28, TOOLS.y - 6, 832, 12, 6)
    root.add(bench)

    const labels = new Map<ToolId, Phaser.GameObjects.Text>()
    const drawn = new Map<ToolId, Phaser.GameObjects.Graphics>()
    const panels = new Map<ToolId, Phaser.GameObjects.Graphics>()
    const icons = new Map<ToolId, Phaser.GameObjects.Image>()
    const zones: Phaser.GameObjects.Zone[] = []

    let current: ToolId = 'lupa'
    let enabled = true

    const drawIcon = (g: Phaser.GameObjects.Graphics, tool: ToolId, x: number, y: number) => {
        g.clear()
        if (tool === 'lupa') {
            g.lineStyle(9, C.ink, 1)
            g.strokeCircle(x - 6, y - 6, 26)
            g.lineStyle(7, C.glass, 1)
            g.strokeCircle(x - 6, y - 6, 26)
            g.lineStyle(14, C.ink, 1)
            g.lineBetween(x + 12, y + 12, x + 32, y + 32)
            g.lineStyle(8, C.wood, 1)
            g.lineBetween(x + 12, y + 12, x + 32, y + 32)
            return
        }
        if (tool === 'marcador') {
            g.fillStyle(C.ink, 1)
            g.fillRoundedRect(x - 34, y + 16, 68, 16, 6)
            g.lineStyle(6, C.ink, 1)
            g.fillStyle(C.amber, 1)
            g.fillRoundedRect(x - 6, y - 34, 26, 44, 6)
            g.strokeRoundedRect(x - 6, y - 34, 26, 44, 6)
            g.fillStyle(C.metal, 1)
            g.fillRect(x - 6, y + 6, 26, 10)
            g.strokeRect(x - 6, y + 6, 26, 10)
            g.fillStyle(C.inkSoft, 1)
            g.fillTriangle(x - 6, y + 16, x + 20, y + 16, x + 7, y + 34)
            return
        }
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(x - 32, y + 20, 64, 14, 6)
        g.lineStyle(6, C.ink, 1)
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(x - 30, y - 26, 60, 40, 8)
        g.strokeRoundedRect(x - 30, y - 26, 60, 40, 8)
        g.fillStyle(C.blue, 1)
        g.fillRoundedRect(x - 30, y - 4, 60, 18, 6)
        g.strokeRoundedRect(x - 30, y - 4, 60, 18, 6)
    }

    const paintPanel = (tool: ToolId, x: number) => {
        const panel = panels.get(tool)!
        const on = current === tool
        const top = TOOLS.y + (on ? 0 : 8)
        panel.clear()
        panel.fillStyle(C.ink, 1)
        panel.fillRoundedRect(x - TOOLS.w / 2, top + 8, TOOLS.w, TOOLS.h - 10, 18)
        panel.fillStyle(on ? C.amberDeep : C.wallDeep, 1)
        panel.fillRoundedRect(x - TOOLS.w / 2, top, TOOLS.w, TOOLS.h - 10, 18)
        panel.fillStyle(on ? C.amber : C.wall, 1)
        panel.fillRoundedRect(x - TOOLS.w / 2 + 6, top + 6, TOOLS.w - 12, TOOLS.h - 28, 14)
        panel.fillStyle(C.white, 0.35)
        panel.fillRoundedRect(x - TOOLS.w / 2 + 16, top + 12, TOOLS.w - 32, 12, 6)

        const icon = icons.get(tool)
        const graphic = drawn.get(tool)
        const iconY = top + 54
        icon?.setPosition(x, iconY)
        if (graphic) drawIcon(graphic, tool, x, iconY)
        labels.get(tool)?.setPosition(x, top + 112)
    }

    ORDER.forEach((tool, index) => {
        const x = TOOLS.xs[index]

        const panel = scene.add.graphics()
        panels.set(tool, panel)
        root.add(panel)

        if (scene.textures.exists(TOOLS_KEY)) {
            const icon = scene.add.image(x, TOOLS.cy, TOOLS_KEY, FRAME[tool])
            icon.setDisplaySize(84, 84)
            icons.set(tool, icon)
            root.add(icon)
        } else {
            const graphic = scene.add.graphics()
            drawn.set(tool, graphic)
            root.add(graphic)
        }

        const label = scene.add
            .text(x, TOOLS.labelY, LABEL[tool], {
                fontFamily: FONT.black,
                fontSize: '20px',
                color: CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)
        labels.set(tool, label)
        root.add(label)

        const zone = scene.add
            .zone(x, TOOLS.cy, TOOLS.w + 16, TOOLS.h + 16)
            .setOrigin(0.5)
            .setDepth(DEPTH.bench + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!enabled || current === tool) return
            FX.press(scene, panel)
            current = tool
            ORDER.forEach((t, i) => paintPanel(t, TOOLS.xs[i]))
            options.onSelect(tool)
        })
        zones.push(zone)
    })

    ORDER.forEach((tool, index) => paintPanel(tool, TOOLS.xs[index]))

    return {
        current() {
            return current
        },

        select(tool: ToolId) {
            current = tool
            ORDER.forEach((t, i) => paintPanel(t, TOOLS.xs[i]))
        },

        /** Chama a atenção para uma ferramenta, sem trocar nada. */
        async hint(tool: ToolId) {
            const x = TOOLS.xs[ORDER.indexOf(tool)]
            await FX.ping(scene, x, TOOLS.cy, C.amber, { radius: 120, depth: DEPTH.bench + 2 })
        },

        pos(tool: ToolId) {
            return { x: TOOLS.xs[ORDER.indexOf(tool)], y: TOOLS.cy }
        },

        setEnabled(value: boolean) {
            enabled = value
            root.setAlpha(value ? 1 : 0.65)
        },

        async hide() {
            await FX.to(scene, root, { alpha: 0, y: 70 }, { duration: 260 })
        },

        destroy() {
            FX.kill(scene, root)
            zones.forEach(z => z.destroy())
            root.destroy(true)
        },
    }
}

export type Toolbar = ReturnType<typeof createToolbar>
export const TOOLS_TEXTURE = TOOLS_KEY
