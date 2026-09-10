import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CAVE, DEPTH, H, W, WORD } from '../data/layout'
import { C } from '../data/theme'
import { createWordArt } from './word'
import type { Datum, DatumId } from '../types'

interface Crystal {
    datum: Datum
    root: Phaser.GameObjects.Container
    body: Phaser.GameObjects.Image | null
    glow: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    x: number
    y: number
}

/** Reserva: sem `objetos-caverna.png`, o cristal é um losango com base. */
function drawCrystal(g: Phaser.GameObjects.Graphics, size: number) {
    const half = size / 2
    const face = [
        new Phaser.Geom.Point(0, -half * 0.92),
        new Phaser.Geom.Point(half * 0.5, -half * 0.2),
        new Phaser.Geom.Point(half * 0.36, half * 0.5),
        new Phaser.Geom.Point(-half * 0.36, half * 0.5),
        new Phaser.Geom.Point(-half * 0.5, -half * 0.2),
    ]
    g.fillStyle(C.stoneDark, 1)
    g.fillRoundedRect(-half * 0.62, half * 0.42, half * 1.24, half * 0.4, 10)
    g.fillStyle(C.crystal, 1)
    g.fillPoints(face, true)
    g.lineStyle(5, C.ink, 1)
    g.strokePoints(face, true, true)
}

export interface CaveOptions {
    onPick: (id: DatumId) => void
}

export function createCave(scene: Phaser.Scene, options: CaveOptions) {
    const bg = scene.textures.exists('bg-caverna')
        ? scene.add.image(W / 2, H / 2, 'bg-caverna').setDisplaySize(W, H + 2).setDepth(DEPTH.bg)
        : null

    if (!bg) {
        const floor = scene.add.graphics().setDepth(DEPTH.bg)
        floor.fillStyle(C.shadow, 1)
        floor.fillRect(0, 0, W, H)
        floor.fillStyle(C.stoneDark, 1)
        floor.fillEllipse(W / 2, H - 40, W * 1.3, 380)
    }
    bg?.preFX?.addBlur(1, 2, 2, 0.35)

    const veilG = scene.add.graphics().setDepth(DEPTH.veil).setAlpha(0)
    veilG.fillStyle(C.shadow, 1)
    veilG.fillRect(0, 0, W, H)

    let crystals: Crystal[] = []
    let pickable = false
    let only: DatumId[] | null = null

    const find = (id: DatumId) => crystals.find(item => item.datum.id === id)

    const clear = () => {
        crystals.forEach(crystal => {
            scene.tweens.killTweensOf(crystal.glow)
            scene.tweens.killTweensOf(crystal.root)
            crystal.zone.destroy()
            crystal.root.destroy(true)
        })
        crystals = []
    }

    const build = (datum: Datum, at: { x: number; y: number }): Crystal => {
        // Profundidade pela altura na trilha: a pedra da frente cobre a de
        // trás E ganha o toque quando as zonas se encostam.
        const depth = DEPTH.crystal + at.y / 100
        const root = scene.add.container(at.x, at.y).setDepth(depth)

        const glow = scene.add.graphics()
        glow.fillStyle(C.crystalLit, 0.28)
        glow.fillCircle(0, 0, CAVE.crystal * 0.46)
        glow.setAlpha(0.5)

        const hasArt = scene.textures.exists('objetos-caverna')
        const body = hasArt
            ? scene.add.image(0, 0, 'objetos-caverna', 3).setDisplaySize(CAVE.crystal, CAVE.crystal)
            : null

        root.add(glow)
        if (body) root.add(body)
        else {
            const g = scene.add.graphics()
            drawCrystal(g, CAVE.crystal)
            root.add(g)
        }

        const zone = scene.add
            .zone(at.x, at.y, CAVE.hitW, CAVE.hitH)
            .setOrigin(0.5)
            .setDepth(depth + 0.5)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerdown', () => {
            if (!pickable) return
            if (only && !only.includes(datum.id)) return
            options.onPick(datum.id)
        })

        scene.tweens.add({
            targets: glow,
            alpha: 0.95,
            scale: 1.12,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
            delay: Phaser.Math.Between(0, 500),
        })

        return { datum, root, body, glow, zone, x: at.x, y: at.y }
    }

    return {
        setGallery(data: Datum[], positions: { x: number; y: number }[]) {
            clear()
            crystals = data.map((datum, i) => build(datum, positions[i]))
            crystals.forEach((crystal, i) => {
                crystal.root.setScale(0.2).setAlpha(0)
                void FX.wait(scene, 100 + i * 120).then(() =>
                    FX.to(
                        scene,
                        crystal.root,
                        { scale: 1, alpha: 1 },
                        { duration: 420, ease: 'Back.easeOut' },
                    ),
                )
            })
        },

        /**
         * Nível 3: a pedra que faltava acende no fundo da caverna. Ela entra
         * sozinha, com estalo e luz, para a criança saber onde ir.
         */
        revealHidden(datum: Datum, at: { x: number; y: number }) {
            const crystal = build(datum, at)
            crystals.push(crystal)
            crystal.root.setScale(0.1).setAlpha(0)
            void FX.ping(scene, at.x, at.y, C.doorLight, { radius: 190 })
            void FX.sparks(scene, at.x, at.y, { color: C.doorLight, count: 20, spread: 170 })
            return FX.to(
                scene,
                crystal.root,
                { scale: 1, alpha: 1 },
                { duration: 560, ease: 'Back.easeOut' },
            )
        },

        setPickable(value: boolean, restrict?: DatumId[]) {
            pickable = value
            only = restrict ?? null
            crystals.forEach(crystal => {
                const on = value && (!only || only.includes(crystal.datum.id))
                if (crystal.zone.input) crystal.zone.input.enabled = on
                crystal.glow.setVisible(value)
            })
        },

        posOf(id: DatumId) {
            const crystal = find(id)
            return crystal ? { x: crystal.x, y: crystal.y } : { x: W / 2, y: H / 2 }
        },

        /** Uma picaretada que ainda não abriu: a pedra treme e solta lascas. */
        hit(id: DatumId) {
            const crystal = find(id)
            if (!crystal) return
            void FX.shake(scene, crystal.root, { times: 2, amount: 7 })
            void FX.sparks(scene, crystal.x - 30, crystal.y + 20, {
                color: C.stone,
                count: 8,
                spread: 90,
                size: 8,
                duration: 480,
            })
        },

        /** A pedra racha e a luz de dentro escapa. */
        crack(id: DatumId) {
            const crystal = find(id)
            if (!crystal) return
            crystal.body?.setFrame(4)
            crystal.glow.setAlpha(1)
            void FX.ping(scene, crystal.x, crystal.y, C.crystalLit, { radius: 130 })
            void FX.sparks(scene, crystal.x, crystal.y, {
                color: C.crystalLit,
                count: 18,
                spread: 150,
            })
        },

        /**
         * A palavra sai de dentro da pedra, fica um instante no ar para ser
         * lida, e só então entra na bolsa.
         */
        async dropWord(id: DatumId, sheet: string, to: { x: number; y: number }) {
            const crystal = find(id)
            if (!crystal) return
            crystal.zone.destroy()
            crystals = crystals.filter(item => item !== crystal)
            scene.tweens.killTweensOf(crystal.glow)

            const word = createWordArt(scene, crystal.datum, sheet, WORD)
            word.root.setPosition(crystal.x, crystal.y).setDepth(DEPTH.crystal + 2).setScale(0.2)

            await FX.all(
                FX.to(scene, word.root, { y: crystal.y - 96, scale: 1 }, { duration: 420, ease: 'Back.easeOut' }),
                FX.to(scene, crystal.root, { alpha: 0, scale: 0.86 }, { duration: 420, delay: 140 }),
            )
            crystal.root.destroy(true)

            await FX.wait(scene, 420)
            await FX.arcTo(scene, word.root, to, { height: 130, duration: 480 })
            await FX.to(scene, word.root, { scale: 0.12, alpha: 0 }, { duration: 150 })
            word.root.destroy(true)
        },

        remaining() {
            return crystals.length
        },

        veil(on: boolean) {
            return FX.to(scene, veilG, { alpha: on ? 0.72 : 0 }, { duration: 420 })
        },

        /** Sem tween: usado atrás da cortina, quando a galeria é remontada. */
        setVeil(on: boolean) {
            scene.tweens.killTweensOf(veilG)
            veilG.setAlpha(on ? 0.72 : 0)
        },

        clear,

        destroy() {
            clear()
            scene.tweens.killTweensOf(veilG)
            veilG.destroy()
            bg?.destroy()
        },
    }
}

export type Cave = ReturnType<typeof createCave>
