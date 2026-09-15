import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DELIVER, DEPTH, TOOL } from '../data/layout'
import { NOME, aceso } from '../data/levels'
import { C, CSS, FONT } from '../data/theme'
import type { Ferramenta, Peca } from '../types'
import { drawToolIcon } from './toolIcons'

interface BenchOptions {
    tools: Ferramenta[]
    onTool: (tool: Ferramenta) => void
    onDeliver: () => void
}

/**
 * A BANCADA — os botões de ferramenta e o ENTREGAR.
 *
 * Cada botão MOSTRA o estado atual dentro dele: o `A` do LETRA tem o tamanho em
 * que a letra está, o do FORTE está fino ou gordo, as barras do MEIO estão no
 * canto ou no meio. É o que permite a criança ler a ferramenta e a peça no mesmo
 * lugar, e é por isso que estes ícones são desenhados e nunca um PNG.
 *
 * As zonas de toque são soltas de cena, na posição definitiva: o botão muda de
 * escala no gesto, e uma zona dentro do contêiner seria comida pela animação.
 */
export function createBench(scene: Phaser.Scene, options: BenchOptions) {
    const zones: Phaser.GameObjects.Zone[] = []

    const panel = (
        g: Phaser.GameObjects.Graphics,
        w: number,
        h: number,
        face: number,
        border: number,
        pressed = false,
    ) => {
        const drop = pressed ? 2 : 7
        g.fillStyle(C.ink, 0.3)
        g.fillRoundedRect(-w / 2, -h / 2 + drop, w, h, 22)
        g.fillStyle(border, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 14, 17)
        g.fillStyle(C.white, 0.35)
        g.fillRoundedRect(-w / 2 + 16, -h / 2 + 13, w - 32, 12, 6)
    }

    const buildTool = (tool: Ferramenta, x: number) => {
        const root = scene.add.container(x, TOOL.cy).setDepth(DEPTH.bench)

        const face = scene.add.graphics()
        root.add(face)

        const icon = scene.add.graphics()
        root.add(icon)

        const glyph = scene.add
            .text(0, TOOL.iconDY, '', { fontFamily: FONT.body, fontSize: '32px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        root.add(glyph)

        const label = scene.add
            .text(0, TOOL.labelDY, NOME[tool], {
                fontFamily: FONT.black,
                fontSize: '19px',
                color: CSS.ink,
            })
            .setOrigin(0.5)
            .setResolution(2)
        root.add(label)

        let calling = false

        const paint = (peca: Peca) => {
            face.clear()
            if (calling) {
                face.fillStyle(C.amber, 0.85)
                face.fillRoundedRect(-TOOL.w / 2 - 11, -TOOL.h / 2 - 11, TOOL.w + 22, TOOL.h + 22, 28)
            }
            panel(face, TOOL.w, TOOL.h, aceso(peca, tool) ? C.amber : C.wall, C.ink)

            icon.clear()
            drawToolIcon(tool, peca, icon, glyph)
        }

        const zone = scene.add
            .zone(x, TOOL.cy, TOOL.w, TOOL.h)
            .setOrigin(0.5)
            .setDepth(DEPTH.benchHit)
            .setInteractive({ useHandCursor: true })
        zones.push(zone)
        zone.on('pointerdown', () => {
            if (!zone.input?.enabled) return
            FX.press(scene, root)
            options.onTool(tool)
        })

        return {
            tool,
            root,
            paint,
            setCalling(value: boolean) {
                calling = value
            },
        }
    }

    const tools = options.tools.map((tool, index) => buildTool(tool, TOOL.xs[index]))

    /* ─────────────────────────────────────────────────────── o ENTREGAR */

    const deliverRoot = scene.add.container(DELIVER.cx, DELIVER.cy).setDepth(DEPTH.bench)
    const deliverFace = scene.add.graphics()
    deliverRoot.add(deliverFace)

    const deliverText = scene.add
        .text(0, -6, 'ENTREGAR', { fontFamily: FONT.black, fontSize: '32px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    deliverText.setStroke(CSS.ink, 5)
    deliverRoot.add(deliverText)

    const deliverIcon = scene.add.graphics()
    deliverRoot.add(deliverIcon)

    let locked = false

    const paintDeliver = () => {
        deliverFace.clear()
        panel(deliverFace, DELIVER.w, DELIVER.h, locked ? C.slate : C.green, C.ink)
        deliverText.setAlpha(locked ? 0.55 : 1)

        deliverIcon.clear()
        if (locked) {
            // cadeado: o gesto continua visível, mas ele não vale enquanto nada mudar
            deliverIcon.lineStyle(7, C.wall, 1)
            deliverIcon.beginPath()
            deliverIcon.arc(0, 34, 13, Math.PI, 0)
            deliverIcon.strokePath()
            deliverIcon.fillStyle(C.wall, 1)
            deliverIcon.fillRoundedRect(-18, 34, 36, 26, 6)
            return
        }
        deliverIcon.fillStyle(C.white, 0.9)
        deliverIcon.fillTriangle(-16, 36, 16, 36, 0, 56)
    }
    paintDeliver()

    const deliverZone = scene.add
        .zone(DELIVER.cx, DELIVER.cy, DELIVER.w, DELIVER.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.benchHit)
        .setInteractive({ useHandCursor: true })
    zones.push(deliverZone)
    deliverZone.on('pointerdown', () => {
        if (!deliverZone.input?.enabled) return
        FX.press(scene, deliverRoot)
        options.onDeliver()
    })

    const keys = scene.input.keyboard?.addKeys('ONE,TWO,THREE,SPACE') as
        | Record<string, Phaser.Input.Keyboard.Key>
        | undefined
    const pressTool = (index: number) => () => {
        const target = tools[index]
        if (!target || !target.root.active) return
        if (!zones[index]?.input?.enabled) return
        FX.press(scene, target.root)
        options.onTool(target.tool)
    }
    keys?.ONE?.on('down', pressTool(0))
    keys?.TWO?.on('down', pressTool(1))
    keys?.THREE?.on('down', pressTool(2))
    keys?.SPACE?.on('down', () => {
        if (!deliverZone.input?.enabled) return
        FX.press(scene, deliverRoot)
        options.onDeliver()
    })

    return {
        render(peca: Peca) {
            tools.forEach(item => item.paint(peca))
        },

        setEnabled(value: boolean) {
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
        },

        setLocked(value: boolean) {
            locked = value
            paintDeliver()
            if (deliverZone.input) deliverZone.input.enabled = !value
        },

        /** Depois do segundo erro, a ferramenta que resolve chama — sem dizer o valor. */
        call(tool: Ferramenta, peca: Peca) {
            tools.forEach(item => {
                item.setCalling(item.tool === tool)
                item.paint(peca)
                if (item.tool !== tool) {
                    FX.kill(scene, item.root)
                    item.root.setScale(1)
                    return
                }
                FX.kill(scene, item.root)
                scene.tweens.add({
                    targets: item.root,
                    scaleX: 1.06,
                    scaleY: 1.06,
                    duration: 380,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            })
        },

        hush(peca: Peca) {
            tools.forEach(item => {
                item.setCalling(false)
                FX.kill(scene, item.root)
                item.root.setScale(1)
                item.paint(peca)
            })
        },

        pos(tool: Ferramenta) {
            const found = tools.find(item => item.tool === tool)
            return { x: found?.root.x ?? TOOL.xs[0], y: TOOL.cy }
        },

        deliverPos() {
            return { x: DELIVER.cx, y: DELIVER.cy }
        },

        async hide() {
            this.setEnabled(false)
            await FX.all(
                ...tools.map(item => FX.to(scene, item.root, { alpha: 0, y: TOOL.cy + 60 }, { duration: 260 })),
                FX.to(scene, deliverRoot, { alpha: 0, y: DELIVER.cy + 60 }, { duration: 260 }),
            )
        },

        destroy() {
            keys?.ONE?.removeAllListeners()
            keys?.TWO?.removeAllListeners()
            keys?.THREE?.removeAllListeners()
            keys?.SPACE?.removeAllListeners()
            zones.forEach(zone => zone.destroy())
            tools.forEach(item => {
                FX.kill(scene, item.root)
                item.root.destroy(true)
            })
            FX.kill(scene, deliverRoot)
            deliverRoot.destroy(true)
        },
    }
}

export type Bench = ReturnType<typeof createBench>
