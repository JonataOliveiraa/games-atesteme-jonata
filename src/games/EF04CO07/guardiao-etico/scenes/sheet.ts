import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, PAPER, RING_HIT } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { createPerson, type Person } from './people'
import type { ArtKey, Item, Sheet, ToolId } from '../types'

const ART_KEY = 'ge-art'
const SNAPSHOT = 'ge-sheet-rt'

const ART_FRAME: Record<ArtKey, number> = { parque: 0, quadra: 1, dragao: 2, festa: 3 }

export interface SheetOptions {
    /** O anel foi tocado: quem decide o que acontece é a ferramenta escolhida. */
    onItemTap: (item: Item) => void
    /** Um toque no papel, longe de qualquer achado. */
    onPaperTap: (x: number, y: number) => void
}

/**
 * O papel: o texto miúdo, as tarjas, os anéis do que já foi achado — e o
 * retrato dele mesmo num RenderTexture, que é o que a lupa aumenta.
 *
 * O retrato só é refeito quando uma tarja entra ou sai. Redesenhar a cada
 * quadro derreteria o celular por nada: o papel é parado.
 */
export function createSheet(scene: Phaser.Scene, options: SheetOptions) {
    const content = scene.add.container(PAPER.x, PAPER.y).setDepth(DEPTH.paper)

    const page = scene.add.graphics()
    const covers = scene.add.graphics()
    const rings = scene.add.graphics()
    const texts: Phaser.GameObjects.Text[] = []
    const itemText = new Map<string, Phaser.GameObjects.Text>()
    /** A caixa medida do texto de cada item. A declarada é só o lugar dele. */
    const bounds = new Map<string, { x: number; y: number; w: number; h: number }>()
    const zones: Phaser.GameObjects.Zone[] = []
    const faces: Person[] = []

    // a chave do retrato tem de morrer com a cena: `scene.restart` cria um
    // RenderTexture novo, e um `saveTexture` com a chave já ocupada deixa a
    // lupa presa na textura da cena anterior — ela congela no papel antigo
    if (scene.textures.exists(SNAPSHOT)) scene.textures.remove(SNAPSHOT)

    const snap = scene.add
        .renderTexture(-4000, -4000, PAPER.w, PAPER.h)
        .setVisible(false)
        .setOrigin(0)
    snap.saveTexture(SNAPSHOT)

    const paperZone = scene.add
        .zone(PAPER.x + PAPER.w / 2, PAPER.y + PAPER.h / 2, PAPER.w, PAPER.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.paper + 1)
        .setInteractive()
    paperZone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (enabled) options.onPaperTap(pointer.x, pointer.y)
    })

    let current: Sheet | null = null
    let enabled = false
    let tool: ToolId = 'lupa'
    let erased = false
    const found = new Set<string>()
    const covered = new Set<string>()
    /** O que já saiu do papel na animação final. */
    const gone = new Set<string>()

    /**
     * O retângulo do item.
     *
     * A caixa do `levels.ts` diz ONDE o item começa e serve de reserva; quem
     * manda no traço é a medida do texto depois de escrito, senão o marcador
     * risca papel vazio à direita e encosta na linha de cima.
     */
    const boxOf = (item: Item) => bounds.get(item.id) ?? item.box

    /** O container do rosto, quando o item for um. */
    const faceOf = (item: Item) => {
        const box = boxOf(item)
        return faces.find(
            f =>
                Math.abs(f.container.x - (box.x + box.w / 2)) < 2 &&
                Math.abs(f.container.y - (box.y + box.h / 2)) < 2,
        )?.container
    }

    const paintPage = () => {
        page.clear()
        page.fillStyle(C.paper, 1)
        page.fillRoundedRect(0, 0, PAPER.w, PAPER.h, 10)
        page.fillStyle(C.paperShade, 0.6)
        page.fillRoundedRect(0, PAPER.h - 26, PAPER.w, 26, 10)
        page.lineStyle(3, C.paperShade, 1)
        page.strokeRoundedRect(0, 0, PAPER.w, PAPER.h, 10)
    }

    const paintCovers = () => {
        covers.clear()
        if (!current || erased) return
        current.items.forEach(item => {
            if (!covered.has(item.id) || gone.has(item.id)) return
            strokeOver(covers, item)
        })
    }

    /** O traço do marcador: ponta grossa, sobra nas pontas e um brilho por cima. */
    const strokeOver = (g: Phaser.GameObjects.Graphics, item: Item, alpha = 1) => {
        const { x, y, w, h } = boxOf(item)
        const top = y - 3
        const height = h + 6
        g.fillStyle(C.ink, 0.94 * alpha)
        g.fillRoundedRect(x - 6, top, w + 12, height, height / 2)
        g.fillStyle(C.inkSoft, 0.5 * alpha)
        g.fillRoundedRect(x - 2, top + 3, w + 4, height * 0.28, 4)
        g.fillStyle(C.white, 0.1 * alpha)
        g.fillRoundedRect(x, top + height - 7, w, 3, 2)
    }

    const paintRings = () => {
        rings.clear()
        if (!current || erased) return
        current.items.forEach(item => {
            if (!found.has(item.id)) return
            const { x, y, w, h } = boxOf(item)
            const on = covered.has(item.id)
            const ready = (tool === 'marcador' && !on) || (tool === 'borracha' && on)
            const color = on ? C.green : C.amber
            rings.lineStyle(ready ? 8 : 5, color, 1)
            rings.strokeRoundedRect(x - 12, y - 10, w + 24, h + 20, 12)
            rings.fillStyle(color, ready ? 0.22 : 0.12)
            rings.fillRoundedRect(x - 12, y - 10, w + 24, h + 20, 12)
        })
    }

    const snapshot = () => {
        content.setPosition(0, 0)
        snap.clear()
        snap.draw(content)
        content.setPosition(PAPER.x, PAPER.y)
    }

    const clearSheet = () => {
        texts.forEach(t => t.destroy())
        texts.length = 0
        zones.forEach(z => z.destroy())
        zones.length = 0
        faces.forEach(f => f.destroy())
        faces.length = 0
        content.removeAll(false)
        itemText.clear()
        bounds.clear()
        found.clear()
        covered.clear()
        gone.clear()
        erased = false
    }

    const addText = (
        text: string,
        x: number,
        y: number,
        size: number,
        o: { black?: boolean; soft?: boolean; wrap?: number } = {},
    ) => {
        const label = scene.add
            .text(x, y, text, {
                fontFamily: o.black ? FONT.black : FONT.body,
                fontSize: `${size}px`,
                color: o.soft ? CSS.inkSoft : CSS.ink,
                ...(o.wrap ? { wordWrap: { width: o.wrap } } : {}),
                lineSpacing: 2,
            })
            .setOrigin(0)
            .setResolution(2)
        texts.push(label)
        content.add(label)
        return label
    }

    const addZone = (item: Item) => {
        const box = boxOf(item)
        const cx = PAPER.x + box.x + box.w / 2
        const cy = PAPER.y + box.y + box.h / 2
        const zone = scene.add
            .zone(cx, cy, Math.max(RING_HIT.w, box.w + 40), Math.max(RING_HIT.h, box.h + 40))
            .setOrigin(0.5)
            .setDepth(DEPTH.rings + 1)
            .setInteractive({ useHandCursor: true })
        zone.setData('item', item.id)
        zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (!enabled) return
            if (!found.has(item.id)) {
                options.onPaperTap(pointer.x, pointer.y)
                return
            }
            options.onItemTap(item)
        })
        zones.push(zone)
        return zone
    }

    return {
        render(sheet: Sheet) {
            clearSheet()
            current = sheet

            paintPage()
            content.add(page)

            if (sheet.glued) {
                const { art, x, y, w, h } = sheet.glued
                if (scene.textures.exists(ART_KEY)) {
                    const image = scene.add.image(x + w / 2, y + h / 2, ART_KEY, ART_FRAME[art])
                    image.setDisplaySize(w, h)
                    content.add(image)
                } else {
                    const box = scene.add.graphics()
                    box.fillStyle(C.wallDeep, 1)
                    box.fillRoundedRect(x, y, w, h, 8)
                    box.lineStyle(4, C.slate, 1)
                    box.strokeRoundedRect(x, y, w, h, 8)
                    box.fillStyle(C.slate, 0.5)
                    box.fillCircle(x + w * 0.32, y + h * 0.42, h * 0.16)
                    box.fillTriangle(
                        x + w * 0.12, y + h * 0.86,
                        x + w * 0.52, y + h * 0.3,
                        x + w * 0.92, y + h * 0.86,
                    )
                    content.add(box)
                }
            }

            sheet.lines.forEach(line =>
                addText(line.text, line.x, line.y, line.size, {
                    black: line.black,
                    soft: line.soft,
                    wrap: line.wrap,
                }),
            )

            sheet.items.forEach(item => {
                if (item.kind === 'rosto') {
                    // um rosto é um dado como outro qualquer: dá para achar,
                    // e a tarja cai em cima dele como cai em cima de um telefone
                    const face = createPerson(scene, item.owner, item.box.h)
                    face.container.setPosition(
                        item.box.x + item.box.w / 2,
                        item.box.y + item.box.h / 2,
                    )
                    faces.push(face)
                    content.add(face.container)
                    bounds.set(item.id, { ...item.box })
                    addZone(item)
                    return
                }

                const label = addText(item.text, item.box.x, item.box.y, 24)
                itemText.set(item.id, label)
                bounds.set(item.id, {
                    x: item.box.x,
                    y: item.box.y,
                    w: Math.ceil(label.width),
                    h: Math.ceil(label.height),
                })
                addZone(item)
            })

            content.add(covers)
            content.add(rings)
            paintCovers()
            paintRings()

            // o retrato é tirado DEPOIS de o papel voltar ao tamanho e à
            // opacidade normais: a fase anterior termina com ele encolhido
            // voando para a bolinha, e um retrato tirado ali sai minúsculo
            content.setAlpha(1).setScale(1).setPosition(PAPER.x, PAPER.y)
            snapshot()
        },

        /** O que está sob o vidro AGORA e ainda não tinha sido achado. */
        findUnder(localX: number, localY: number, radius: number): Item[] {
            if (!current) return []
            const fresh: Item[] = []
            current.items.forEach(item => {
                if (found.has(item.id)) return
                const { x, y, w, h } = boxOf(item)
                const nearestX = Phaser.Math.Clamp(localX, x, x + w)
                const nearestY = Phaser.Math.Clamp(localY, y, y + h)
                if (Math.hypot(localX - nearestX, localY - nearestY) > radius) return
                found.add(item.id)
                fresh.push(item)
            })
            if (fresh.length) {
                paintRings()
                snapshot()
            }
            return fresh
        },

        /** O achado que está debaixo deste ponto do papel, se houver algum. */
        itemAt(localX: number, localY: number): Item | null {
            if (!current) return null
            for (const item of current.items) {
                if (!found.has(item.id)) continue
                const { x, y, w, h } = boxOf(item)
                const inside =
                    localX >= x - 16 &&
                    localX <= x + w + 16 &&
                    localY >= y - 14 &&
                    localY <= y + h + 14
                if (inside) return item
            }
            return null
        },

        /** O marcador põe, a borracha tira. Não existe alternar às cegas. */
        setCover(item: Item, on: boolean) {
            if (covered.has(item.id) === on) return false
            if (on) covered.add(item.id)
            else covered.delete(item.id)
            paintCovers()
            paintRings()
            snapshot()
            return true
        },

        /** O traço entra varrendo, como marca-texto de verdade. */
        async sweepIn(item: Item) {
            const g = scene.add
                .graphics()
                .setDepth(DEPTH.rings + 2)
                .setPosition(PAPER.x, PAPER.y)
            strokeOver(g, item)

            const maskG = scene.make.graphics({ x: 0, y: 0 }, false)
            const mask = maskG.createGeometryMask()
            g.setMask(mask)

            const left = PAPER.x + item.box.x - 18
            const top = PAPER.y + item.box.y - 14
            const width = item.box.w + 36
            const height = item.box.h + 28

            await new Promise<void>(resolve => {
                scene.tweens.addCounter({
                    from: 0,
                    to: 1,
                    duration: 190,
                    onUpdate: tween => {
                        maskG.clear()
                        maskG.fillStyle(0xffffff, 1)
                        maskG.fillRect(left, top, width * (tween.getValue() ?? 0), height)
                    },
                    onComplete: () => resolve(),
                })
            })

            g.clearMask()
            mask.destroy()
            maskG.destroy()
            g.destroy()
        },

        /** A borracha: o traço esfarela para cima antes de sumir. */
        async rubOut(item: Item) {
            const g = scene.add
                .graphics()
                .setDepth(DEPTH.rings + 2)
                .setPosition(PAPER.x, PAPER.y)
            strokeOver(g, item)
            await FX.to(scene, g, { alpha: 0, y: PAPER.y - 10 }, { duration: 200 })
            g.destroy()
        },

        /**
         * O fim do carimbo: o que foi tapado SAI do papel.
         *
         * O texto some por baixo da tarja e a tarja é levantada — sobra papel
         * em branco. É a prova de que o que ela tapou não foi publicado.
         */
        async eraseCovered() {
            if (!current) return
            const list = current.items.filter(item => covered.has(item.id))
            if (!list.length) return

            erased = true
            paintRings()
            snapshot()

            for (const item of list) {
                const label = itemText.get(item.id)
                const face = item.kind === 'rosto' ? faceOf(item) : null
                if (label) await FX.to(scene, label, { alpha: 0 }, { duration: 160 })
                if (face) await FX.to(scene, face, { alpha: 0 }, { duration: 160 })

                const lift = scene.add
                    .graphics()
                    .setDepth(DEPTH.rings + 2)
                    .setPosition(PAPER.x, PAPER.y)
                strokeOver(lift, item)

                gone.add(item.id)
                paintCovers()
                snapshot()

                void FX.to(
                    scene,
                    lift,
                    { y: PAPER.y - 54, alpha: 0, angle: -5 },
                    { duration: 340 },
                ).then(() => lift.destroy())

                await FX.wait(scene, 150)
            }

            await FX.wait(scene, 220)
        },

        setTool(next: ToolId) {
            if (tool === next) return
            tool = next
            paintRings()
            snapshot()
        },

        isCovered(id: string) {
            return covered.has(id)
        },

        covered() {
            return covered
        },

        isFound(id: string) {
            return found.has(id)
        },

        worldOf(item: Item) {
            const box = boxOf(item)
            return {
                x: PAPER.x + box.x + box.w / 2,
                y: PAPER.y + box.y + box.h / 2,
            }
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        async shake() {
            const x = content.x
            await FX.to(scene, content, { x: x - 10 }, { duration: 60 })
            await FX.to(scene, content, { x: x + 10 }, { duration: 60, yoyo: true, repeat: 1 })
            await FX.to(scene, content, { x }, { duration: 60 })
        },

        async drop() {
            content.setAlpha(0).setY(PAPER.y - 40)
            await FX.to(scene, content, { alpha: 1, y: PAPER.y }, { duration: 300 })
            snapshot()
        },

        async flyTo(x: number, y: number) {
            await FX.to(
                scene,
                content,
                { x: x - 30, y: y - 20, scale: 0.06, alpha: 0.2 },
                { duration: 620 },
            )
        },

        snapshotKey: SNAPSHOT,

        destroy() {
            FX.kill(scene, content)
            clearSheet()
            snap.destroy()
            scene.textures.remove(SNAPSHOT)
            paperZone.destroy()
            content.destroy(true)
        },
    }
}

export type SheetView = ReturnType<typeof createSheet>
export const ART_TEXTURE = ART_KEY
