import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BAND, DEPTH, DOOR, PLACA, altarWidth } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

type Tone = 'calm' | 'warn' | 'info'

const TONE: Record<Tone, { face: number; border: number; color: string }> = {
    calm: { face: C.panel, border: C.stoneDark, color: CSS.ink },
    warn: { face: C.warn, border: C.warnDark, color: CSS.white },
    info: { face: C.info, border: C.infoDark, color: CSS.white },
}

/**
 * A faixa e a porta.
 *
 * A porta NÃO existe enquanto a criança escolhe. Ela aparece no instante em
 * que os dados viram informação, recebe a faixa no selo e abre — assim a porta
 * é consequência da relação, e não um cenário esperando ali desde o começo.
 */
export function createDoor(scene: Phaser.Scene) {
    const hasArt = scene.textures.exists('objetos-caverna')

    const door = scene.add.container(DOOR.niche.x, DOOR.niche.y).setDepth(DEPTH.door).setAlpha(0)
    const light = scene.add.graphics()
    const slab = hasArt ? scene.add.image(0, 0, 'objetos-caverna', 5) : null
    const fallback = hasArt ? null : scene.add.graphics()

    if (slab) slab.setDisplaySize(DOOR.niche.h * 1.13, DOOR.niche.h)
    if (fallback) {
        const h = DOOR.niche.h
        fallback.fillStyle(C.stoneDark, 1)
        fallback.fillRoundedRect(-h * 0.5, -h * 0.5, h, h, 40)
        fallback.fillStyle(C.stone, 1)
        fallback.fillRoundedRect(-h * 0.36, -h * 0.34, h * 0.72, h * 0.84, 30)
    }

    door.add(light)
    door.add((hasArt ? slab : fallback)!)

    const band = scene.add.container(BAND.x, BAND.y).setDepth(DEPTH.band).setAlpha(0)
    const bandG = scene.add.graphics()
    const sentence = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '34px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: BAND.w - 80 },
            lineSpacing: 2,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0)
    band.add([bandG, sentence])

    const placa = scene.add.container(PLACA.x, PLACA.y).setDepth(DEPTH.band).setAlpha(0)
    const placaG = scene.add.graphics()
    const placaText = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: CSS.ink,
            align: 'center',
            wordWrap: { width: PLACA.w - 60 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    placa.add([placaG, placaText])

    let pieces = 3
    let filledNow = 0
    /** A faixa tem a largura da bancada embaixo dela: as duas se leem como uma coluna. */
    let bandW = altarWidth(pieces)

    /** Faixa quebrada: um pedaço por encaixe, aceso conforme a seleção cresce. */
    const paintBroken = (filled: number, cracked = -1) => {
        filledNow = filled
        bandG.clear()
        const gap = 16
        const w = (bandW - gap * (pieces - 1)) / pieces
        const hw = bandW / 2
        for (let i = 0; i < pieces; i++) {
            const x = -hw + i * (w + gap)
            const lit = i < filled
            const broke = i === cracked
            bandG.fillStyle(broke ? C.warnDark : C.ink, 0.95)
            bandG.fillRoundedRect(x, -BAND.h / 2, w, BAND.h, 16)
            bandG.fillStyle(broke ? C.warn : lit ? C.crystalLit : C.stone, lit ? 0.95 : 0.8)
            bandG.fillRoundedRect(x + 6, -BAND.h / 2 + 6, w - 12, BAND.h - 12, 11)
            if (!lit) continue
            bandG.fillStyle(C.white, 0.5)
            bandG.fillRoundedRect(x + 16, -BAND.h / 2 + 14, w - 32, 12, 6)
        }
    }

    const paintWhole = () => {
        bandG.clear()
        const hw = bandW / 2
        bandG.fillStyle(C.infoDark, 1)
        bandG.fillRoundedRect(-hw, -BAND.h / 2, bandW, BAND.h, 20)
        bandG.fillStyle(C.panel, 1)
        bandG.fillRoundedRect(-hw + 7, -BAND.h / 2 + 7, bandW - 14, BAND.h - 14, 14)
        bandG.fillStyle(C.info, 0.22)
        bandG.fillRoundedRect(-hw + 7, -BAND.h / 2 + 7, bandW - 14, 20, 10)
    }

    const paintPlaca = (tone: Tone) => {
        const skin = TONE[tone]
        placaG.clear()
        const w = Math.min(PLACA.w, placaText.width + 64)
        const h = placaText.height + 26
        placaG.fillStyle(C.ink, 0.25)
        placaG.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, h / 2)
        placaG.fillStyle(skin.border, 1)
        placaG.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        placaG.fillStyle(skin.face, 1)
        placaG.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, h / 2 - 5)
        placaText.setColor(skin.color)
    }

    const paintLight = (spread: number) => {
        const h = DOOR.niche.h
        light.clear()
        light.fillStyle(C.doorLight, 0.9)
        light.fillEllipse(0, 8, h * 0.62 * spread, h * 0.78 * spread)
    }

    return {
        doorPos() {
            return { x: door.x, y: door.y }
        },

        bandPos() {
            return { x: band.x, y: band.y }
        },

        reset(slots: number) {
            pieces = slots
            bandW = altarWidth(slots)
            // A frase mais longa de 3 encaixes mede 633 px; em 692 - 40 ela cabe numa linha.
            sentence.setWordWrapWidth(bandW - 40)
            slab?.setFrame(5)
            scene.tweens.killTweensOf(door)
            scene.tweens.killTweensOf(band)
            door.setPosition(DOOR.niche.x, DOOR.niche.y).setScale(1).setAlpha(0)
            light.clear()
            band.setPosition(BAND.x, BAND.y).setAlpha(0).setScale(1)
            sentence.setText('').setAlpha(0)
            paintBroken(0)
            placa.setAlpha(0)
        },

        /** A faixa quebrada entra junto com o altar. */
        showBand() {
            return FX.to(scene, band, { alpha: 1 }, { duration: 380 })
        },

        hideBand() {
            return FX.to(scene, band, { alpha: 0 }, { duration: 300 })
        },

        setFilled(filled: number) {
            if (sentence.alpha > 0) return
            paintBroken(filled)
        },

        /** A faixa tentou nascer e quebrou naquele pedaço. */
        crack(index: number) {
            paintBroken(filledNow, index)
        },

        say(text: string, tone: Tone = 'calm') {
            placaText.setText(text)
            paintPlaca(tone)
            scene.tweens.killTweensOf(placa)
            placa.setAlpha(1).setScale(0.9)
            scene.tweens.add({ targets: placa, scale: 1, duration: 260, ease: 'Back.easeOut' })
        },

        hush() {
            scene.tweens.killTweensOf(placa)
            scene.tweens.add({ targets: placa, alpha: 0, duration: 200 })
        },

        /** As bordas somem e nasce uma faixa só, com a frase. */
        async form(text: string) {
            paintWhole()
            sentence.setText(text).setAlpha(0).setScale(0.9)
            void FX.ping(scene, band.x, band.y, C.info, { radius: 280 })
            await FX.all(
                FX.to(scene, band, { scale: 1.05 }, { duration: 200, ease: 'Sine.easeOut' }),
                FX.to(scene, sentence, { alpha: 1, scale: 1 }, { duration: 340, ease: 'Back.easeOut' }),
            )
            await FX.to(scene, band, { scale: 1 }, { duration: 200 })
        },

        /**
         * A porta nasce agora: a faixa recua para o lado, a pedra surge no vão
         * escuro, recebe a informação no selo e desliza.
         */
        async open() {
            await FX.to(scene, band, { x: 452, scale: 0.68 }, { duration: 420, ease: 'Sine.easeInOut' })

            door.setAlpha(0).setScale(0.72).setY(DOOR.niche.y - 26)
            await FX.all(
                FX.to(scene, door, { alpha: 1 }, { duration: 260 }),
                FX.to(
                    scene,
                    door,
                    { scale: 1, y: DOOR.niche.y },
                    { duration: 420, ease: 'Back.easeOut' },
                ),
            )
            void FX.sparks(scene, door.x, door.y + DOOR.niche.h * 0.45, {
                color: C.stone,
                count: 16,
                spread: 190,
                size: 9,
            })

            await FX.wait(scene, 220)
            await FX.to(
                scene,
                band,
                { x: door.x, y: door.y, scale: 0.18, alpha: 0 },
                { duration: 600, ease: 'Sine.easeIn' },
            )

            slab?.setFrame(6)
            paintLight(0.4)
            await FX.wait(scene, 280)
            slab?.setFrame(7)
            paintLight(1)
            await FX.to(scene, door, { scale: 1.05 }, { duration: 260, yoyo: true })
        },

        destroy() {
            scene.tweens.killTweensOf(door)
            scene.tweens.killTweensOf(band)
            scene.tweens.killTweensOf(placa)
            door.destroy(true)
            band.destroy(true)
            placa.destroy(true)
        },
    }
}

export type Door = ReturnType<typeof createDoor>
