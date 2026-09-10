import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BENCH_ART, DEPTH, FINALE, W } from '../data/layout'
import { C } from '../data/theme'
import type { Item, Task } from '../types'

export interface FinaleCallbacks {
    onTap: (itemId: string) => void
}

/**
 * A FASE FINAL: fazer a tarefa com o que foi trazido.
 *
 * Os oito objetos ficam numa bandeja embaixo; o que já pode ser usado acende.
 * Um toque e o objeto voa para a bancada e fica lá — a pilha que cresce É o
 * resultado, e é ela que faz a criança ver que os dois painéis viraram uma
 * coisa só.
 *
 * Quando `final-nN.png` existir, o quadro do estado entra por cima da bancada e
 * a pilha some: o desenho do resultado diz melhor do que oito ícones.
 */
export function createFinale(scene: Phaser.Scene, callbacks: FinaleCallbacks) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.plan).setScrollFactor(0)
    const halo = scene.add.graphics().setScrollFactor(0)
    root.add(halo)
    root.setVisible(false)

    let task: Task | null = null
    let bench: Phaser.GameObjects.GameObject | null = null
    let benchTop = FINALE.bench.feet
    let result: Phaser.GameObjects.Image | null = null
    let tray = new Map<string, Phaser.GameObjects.Image>()
    let used: Phaser.GameObjects.Image[] = []
    let zones: Phaser.GameObjects.Zone[] = []
    let ready: string[] = []
    let glow: Phaser.Tweens.Tween | null = null

    const trayX = (index: number, total: number) => {
        const span = (total - 1) * FINALE.tray.pitch
        return W / 2 - span / 2 + index * FINALE.tray.pitch
    }

    const clearAll = () => {
        glow?.remove()
        glow = null
        zones.forEach(zone => zone.destroy())
        zones = []
        tray.forEach(image => {
            scene.tweens.killTweensOf(image)
            image.destroy()
        })
        tray = new Map()
        used.forEach(image => image.destroy())
        used = []
        result?.destroy()
        result = null
        bench?.destroy()
        bench = null
        halo.clear()
    }

    const drawBench = () => {
        if (scene.textures.exists('bancada')) {
            const source = scene.textures.get('bancada').getSourceImage()
            const scale = FINALE.bench.width / source.width
            const image = scene.add
                .image(FINALE.bench.cx, FINALE.bench.feet, 'bancada')
                .setOrigin(0.5, 1)
                .setScale(scale)
                .setScrollFactor(0)
            benchTop = FINALE.bench.feet - source.height * scale * (1 - BENCH_ART.topAt)
            bench = image
            root.add(image)
            return
        }
        const g = scene.add.graphics().setScrollFactor(0)
        const w = FINALE.bench.width
        const top = FINALE.bench.feet - 190
        g.fillStyle(C.ink, 0.2)
        g.fillEllipse(FINALE.bench.cx, FINALE.bench.feet + 8, w * 0.94, 34)
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(FINALE.bench.cx - w / 2 - 6, top - 6, w + 12, 40, 16)
        g.fillStyle(C.wood, 1)
        g.fillRoundedRect(FINALE.bench.cx - w / 2, top, w, 28, 12)
        g.fillStyle(0x9a6a3c, 1)
        g.fillRect(FINALE.bench.cx - w / 2 + 34, top + 28, 34, 162)
        g.fillRect(FINALE.bench.cx + w / 2 - 68, top + 28, 34, 162)
        benchTop = top
        bench = g
        root.add(g)
    }

    const paintHalo = () => {
        halo.clear()
        if (!task) return
        ready.forEach(id => {
            const image = tray.get(id)
            if (!image) return
            halo.fillStyle(C.gold, 0.26)
            halo.fillCircle(image.x, FINALE.tray.cy, FINALE.tray.size * 0.62)
            halo.lineStyle(7, C.gold, 1)
            halo.strokeCircle(image.x, FINALE.tray.cy, FINALE.tray.size * 0.62)
        })
    }

    const buildZones = () => {
        zones.forEach(zone => zone.destroy())
        zones = []
        tray.forEach((image, id) => {
            const zone = scene.add
                .zone(image.x, FINALE.tray.cy, FINALE.tray.pitch, FINALE.tray.size + 34)
                .setOrigin(0.5)
                .setDepth(DEPTH.zones)
                .setScrollFactor(0)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => callbacks.onTap(id))
            zones.push(zone)
        })
    }

    const breathe = () => {
        glow?.remove()
        glow = null
        tray.forEach(image => {
            scene.tweens.killTweensOf(image)
            image.setScale(image.getData('baseScale') as number)
        })
        const targets = ready.map(id => tray.get(id)).filter(Boolean) as Phaser.GameObjects.Image[]
        if (!targets.length) return
        glow = scene.tweens.add({
            targets,
            y: FINALE.tray.cy - 16,
            duration: FX.ms(scene, 720),
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    }

    return {
        show(next: Task, sheetKey: string, items: Item[]) {
            clearAll()
            task = next
            root.setVisible(true)
            drawBench()

            if (scene.textures.exists(next.finalKey)) {
                const size = FINALE.result.size
                result = scene.add
                    .image(FINALE.bench.cx, benchTop - size / 2 + 34, next.finalKey, next.states[0])
                    .setDisplaySize(size, size)
                    .setScrollFactor(0)
                root.add(result)
            }

            // SEM legenda aqui: a criança já cortou a tarefa e já foi buscar cada
            // um destes objetos. O nome embaixo só apertava o desenho.
            items.forEach((item, index) => {
                const x = trayX(index, items.length)
                if (!scene.textures.exists(sheetKey)) return
                const image = scene.add
                    .image(x, FINALE.tray.cy, sheetKey, item.frame)
                    .setDisplaySize(FINALE.tray.size, FINALE.tray.size)
                    .setScrollFactor(0)
                image.setData('baseScale', image.scaleX)
                root.add(image)
                tray.set(item.id, image)
            })
            buildZones()
        },

        setReady(ids: string[]) {
            ready = ids
            paintHalo()
            breathe()
        },

        /**
         * O passo aconteceu: o objeto voa para a bancada.
         *
         * Com `final-nN.png` na pasta ele DESAPARECE dentro do resultado — quem
         * conta a história é o desenho do estado. Sem a folha, ele fica na
         * bancada e a pilha que cresce faz esse papel.
         */
        async use(itemId: string) {
            const image = tray.get(itemId)
            if (!image) return
            tray.delete(itemId)
            ready = ready.filter(id => id !== itemId)
            paintHalo()
            scene.tweens.killTweensOf(image)

            if (result) {
                await FX.arcTo(
                    scene,
                    image,
                    { x: result.x, y: result.y + 30 },
                    { duration: 400, height: 170 },
                )
                void FX.sparks(scene, result.x, result.y + 30, { color: C.gold, count: 14 })
                await FX.to(scene, image, { scale: 0.2, alpha: 0 }, { duration: 200 })
                image.destroy()
                buildZones()
                breathe()
                return
            }

            const index = used.length
            const row = Math.floor(index / 4)
            const column = index % 4
            const target = {
                x: FINALE.bench.cx - 1.5 * FINALE.used.pitch + column * FINALE.used.pitch,
                y: benchTop - 46 - row * FINALE.used.rowGap,
            }

            await FX.arcTo(scene, image, target, { duration: 420, height: 170 })
            await FX.to(
                scene,
                image,
                { displayWidth: FINALE.used.size, displayHeight: FINALE.used.size },
                { duration: 200 },
            )
            void FX.sparks(scene, target.x, target.y, { color: C.gold, count: 12 })
            used.push(image)
            buildZones()
            breathe()
        },

        /** O estado do resultado anda por CONTAGEM de passos, nunca por item. */
        setState(frame: number) {
            // `frame.name` vem como número na folha em grade: comparar com
            // String() aqui nunca casaria, e o resultado pulsava a cada toque.
            if (!result || Number(result.frame.name) === frame) return
            result.setFrame(frame)
            void FX.popIn(scene, result, { from: 1.14, duration: 260 })
        },

        /** Fora de hora: o objeto balança e volta. Não custa vida. */
        async refuse(itemId: string) {
            const image = tray.get(itemId)
            if (!image) return
            void FX.ping(scene, image.x, FINALE.tray.cy, C.coral, { radius: 140, depth: DEPTH.fx })
            await FX.shake(scene, image, { amount: 14 })
            breathe()
        },

        trayBounds(itemId: string) {
            const image = tray.get(itemId)
            const x = image?.x ?? W / 2
            return { x, y: FINALE.tray.cy, w: FINALE.tray.pitch, h: FINALE.tray.size + 34 }
        },

        benchPoint() {
            return { x: FINALE.bench.cx, y: benchTop - 60 }
        },

        setEnabled(value: boolean) {
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
        },

        hide() {
            root.setVisible(false)
            clearAll()
        },

        destroy() {
            clearAll()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Finale = ReturnType<typeof createFinale>
