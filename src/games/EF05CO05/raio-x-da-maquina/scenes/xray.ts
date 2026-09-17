import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { BAY, BAY_CY, DEPTH, PIECE, STAMP, W, XRAY, bayX } from '../data/layout'
import { A, C, CSS, FONT, LABEL, SIZE, TONE, hex } from '../data/theme'
import { SHEET } from '../data/parts'
import type { Category, PartDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export interface XRay {
    mount(parts: PartDef[]): void
    scan(): Promise<void>
    setEnabled(on: boolean): void
    point(index: number): { x: number; y: number }
    stamp(index: number): Promise<void>
    refuse(index: number): Promise<void>
    pulse(index: number): void
    stopPulse(): void
    /** O fecho do nível: as cinco funções juntas, uma vez só. */
    album(): Promise<void>
    dim(on: boolean): void
    destroy(): void
}

export interface XRayOptions {
    onPick(index: number): void
    /**
     * No nível 3 as etiquetas ficam EMBAÇADAS: dá para ver que há um nome ali,
     * e não dá para ler. Acertar é o que traz o nome de volta.
     */
    blurNames?: boolean
}

export function createXRay(scene: Phaser.Scene, options: XRayOptions): XRay {
    const blurNames = options.blurNames ?? false
    const root = scene.add.container(0, 0).setDepth(DEPTH.screen)

    const shell = scene.add.graphics()
    shell.fillStyle(C.shadow, 0.35)
    shell.fillRoundedRect(XRAY.x + 6, XRAY.y + 10, XRAY.w, XRAY.h, 28)
    shell.fillStyle(C.screen, A.screen)
    shell.fillRoundedRect(XRAY.x, XRAY.y, XRAY.w, XRAY.h, 28)
    shell.lineStyle(4, C.cyan, 0.5)
    shell.strokeRoundedRect(XRAY.x, XRAY.y, XRAY.w, XRAY.h, 28)
    for (let y = XRAY.y + 14; y < XRAY.y + XRAY.h - 6; y += 8) {
        shell.fillStyle(C.cyan, 0.045)
        shell.fillRect(XRAY.x + 8, y, XRAY.w - 16, 2)
    }
    root.add(shell)

    const bays = scene.add.graphics()
    root.add(bays)

    const ring = scene.add.graphics().setAlpha(0)
    root.add(ring)

    const band = scene.add.graphics().setVisible(false)
    band.fillStyle(C.cyan, 0.16)
    band.fillRect(XRAY.x + 4, -XRAY.scanH / 2, XRAY.w - 8, XRAY.scanH)
    band.fillStyle(C.cream, 0.5)
    band.fillRect(XRAY.x + 4, -2, XRAY.w - 8, 4)
    root.add(band)

    const veil = scene.add.graphics().setDepth(DEPTH.veil).setAlpha(0)
    veil.fillStyle(C.ink, 0.66)
    veil.fillRoundedRect(XRAY.x, XRAY.y, XRAY.w, XRAY.h, 28)

    let parts: PartDef[] = []
    let images: Phaser.GameObjects.Image[] = []
    let labels: Phaser.GameObjects.Text[] = []
    let fits: number[] = []
    let zones: Phaser.GameObjects.Zone[] = []
    let named: boolean[] = []
    const albumChips: Phaser.GameObjects.Container[] = []
    let flagged: number | undefined
    let pulseTween: Phaser.Tweens.Tween | undefined
    let enabled = false

    const bayTop = BAY.top
    const bayLeft = (i: number) => bayX(i) - BAY.w / 2

    function paint() {
        bays.clear()
        parts.forEach((piece, i) => {
            const tone = TONE[piece.category]
            const lit = named[i]
            const warn = flagged === i

            bays.fillStyle(C.shadow, 0.28)
            bays.fillRoundedRect(bayLeft(i) + 4, bayTop + 6, BAY.w, BAY.h, BAY.radius)
            bays.fillStyle(C.bay, A.bay)
            bays.fillRoundedRect(bayLeft(i), bayTop, BAY.w, BAY.h, BAY.radius)

            if (lit) {
                bays.fillStyle(tone, 0.12)
                bays.fillRoundedRect(bayLeft(i), bayTop, BAY.w, BAY.h, BAY.radius)
            }

            const border = warn ? C.amber : lit ? tone : C.cyan
            bays.lineStyle(warn || lit ? 5 : 3, border, warn || lit ? 0.95 : 0.34)
            bays.strokeRoundedRect(bayLeft(i), bayTop, BAY.w, BAY.h, BAY.radius)

            const slotX = bayX(i) - STAMP.w / 2
            const slotY = STAMP.cy - STAMP.h / 2

            bays.fillStyle(C.ink, lit ? 0.6 : 0.34)
            bays.fillRoundedRect(slotX, slotY, STAMP.w, STAMP.h, 14)
            bays.lineStyle(lit ? 4 : 2, lit ? tone : C.cyan, lit ? 1 : 0.28)
            bays.strokeRoundedRect(slotX, slotY, STAMP.w, STAMP.h, 14)
        })
    }

    function clear() {
        stopPulse()
        zones.forEach(zone => zone.destroy())
        images.forEach(image => {
            FX.kill(scene, image)
            image.destroy()
        })
        labels.forEach(label => {
            FX.kill(scene, fx(label))
            label.destroy()
        })
        zones = []
        images = []
        labels = []
        fits = []
        named = []
        parts = []
        flagged = undefined
        bays.clear()
        ring.clear().setAlpha(0)
    }

    function stopPulse() {
        pulseTween?.remove()
        pulseTween = undefined
        ring.clear().setAlpha(0)
    }

    return {
        mount: list => {
            clear()
            parts = list
            named = list.map(() => false)

            list.forEach((piece, i) => {
                const image = scene.add
                    .image(bayX(i), PIECE.cy, SHEET.key, piece.frame)
                    .setOrigin(piece.originX, piece.originY)
                    .setScale(PIECE.scale)
                    .setAlpha(0)
                    .setDepth(DEPTH.piece)
                images.push(image)

                const label = scene.add
                    .text(bayX(i), STAMP.cy, piece.name, {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.stamp}px`,
                        color: CSS.dim,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.stamp)
                label.setStroke(CSS.ink, 6)
                labels.push(label)

                const fit = Math.min(1, (STAMP.w - 26) / Math.max(1, label.width))
                fits.push(fit)
                label.setScale(fit)

                if (blurNames) {
                    /*
                     * O borrão tem de ter CORPO: a criança precisa ver que há
                     * uma palavra ali e não conseguir lê-la. Letra apagada some,
                     * e aí a baia parece sem etiqueta.
                     */
                    label.setColor(CSS.cream)
                    label.preFX?.addBlur(1, 2, 2, 1.1, 0xffffff, 4)
                    label.setAlpha(label.preFX ? 1 : 0.3)
                }

                const zone = scene.add
                    .zone(bayX(i), BAY_CY, BAY.w, BAY.h)
                    .setOrigin(0.5)
                    .setDepth(DEPTH.piece + 1)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => {
                    if (enabled) options.onPick(i)
                })
                if (zone.input) zone.input.enabled = false
                zones.push(zone)
            })

            paint()
        },

        scan: async () => {
            band.setVisible(true).setY(XRAY.y)
            const reveal = images.map((image, i) =>
                FX.wait(scene, 150 + i * 135).then(() => FX.popIn(scene, image, { from: 0.66, duration: 300 })),
            )
            await FX.all(
                FX.to(scene, band, { y: XRAY.y + XRAY.h }, { duration: 680, ease: Ease.smooth }),
                ...reveal,
            )
            band.setVisible(false)
        },

        setEnabled: on => {
            enabled = on
            zones.forEach((zone, i) => {
                if (zone.input) zone.input.enabled = on && !named[i]
            })
        },

        point: index => ({ x: bayX(index), y: BAY_CY }),

        stamp: async index => {
            const label = labels[index]
            const image = images[index]
            const piece = parts[index]
            if (!label || !image || !piece) return

            label.preFX?.clear()
            label.setAlpha(1).setColor(hex(TONE[piece.category]))

            named[index] = true
            flagged = undefined
            paint()

            void FX.ping(scene, bayX(index), STAMP.cy, TONE[piece.category], { radius: 120 })
            await FX.to(scene, fx(label), { scale: fits[index] * 1.45 }, { duration: 150 })
            await FX.to(
                scene,
                fx(label),
                { scale: fits[index] },
                { duration: 220, ease: Ease.back(2.2) },
            )

            await FX.to(scene, image, { alpha: A.named }, { duration: 240 })
            if (zones[index]?.input) zones[index].input.enabled = false
        },

        refuse: async index => {
            flagged = index
            paint()
            const image = images[index]
            if (!image) return
            image.setDepth(DEPTH.veil + 1)
            const home = image.x
            await FX.to(scene, image, { x: home - 12 }, { duration: 70 })
            await FX.to(scene, image, { x: home + 12 }, { duration: 90 })
            await FX.to(scene, image, { x: home }, { duration: 90 })
        },

        pulse: index => {
            stopPulse()
            ring.clear()
            ring.lineStyle(7, C.cyan, 1)
            ring.strokeRoundedRect(bayLeft(index) - 5, bayTop - 5, BAY.w + 10, BAY.h + 10, BAY.radius + 6)
            ring.setAlpha(0.1)
            pulseTween = scene.tweens.add({
                targets: ring,
                alpha: 0.95,
                duration: 620,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        stopPulse,

        album: async () => {
            clear()

            const order: Category[] = ['entrada', 'processador', 'memoria', 'armazenamento', 'saida']
            const cy = XRAY.y + XRAY.h / 2
            const chipH = 74
            const gap = 18
            const top = cy - (order.length * chipH + (order.length - 1) * gap) / 2

            const chips = order.map((category, i) => {
                const y = top + i * (chipH + gap) + chipH / 2
                const holder = scene.add.container(W / 2, y).setDepth(DEPTH.stamp).setAlpha(0)

                const text = scene.add
                    .text(0, 0, LABEL[category], {
                        fontFamily: FONT.black,
                        fontSize: '36px',
                        color: hex(TONE[category]),
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                text.setStroke(CSS.ink, 7)

                const w = text.width + 84
                const plate = scene.add.graphics()
                plate.fillStyle(C.ink, 0.72)
                plate.fillRoundedRect(-w / 2, -chipH / 2, w, chipH, 20)
                plate.lineStyle(4, TONE[category], 0.95)
                plate.strokeRoundedRect(-w / 2, -chipH / 2, w, chipH, 20)

                holder.add([plate, text])
                albumChips.push(holder)
                return holder
            })

            await FX.all(
                ...chips.map((chip, i) =>
                    FX.wait(scene, i * 160).then(() =>
                        FX.to(scene, chip, { alpha: 1 }, { duration: 300, ease: Ease.smooth }),
                    ),
                ),
            )
        },

        dim: on => {
            if (!on) {
                flagged = undefined
                images.forEach(image => image.setDepth(DEPTH.piece))
                paint()
            }
            void FX.to(scene, veil, { alpha: on ? 1 : 0 }, { duration: on ? 180 : 260 })
        },

        destroy: () => {
            clear()
            albumChips.forEach(chip => {
                FX.kill(scene, chip)
                chip.destroy(true)
            })
            albumChips.length = 0
            FX.kill(scene, root)
            veil.destroy()
            root.destroy(true)
        },
    }
}
