import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fitInside, SCENE_BOX, SHEET, TRACK } from '../data/art'
import { CINEMA, DEPTH, SCREEN } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { SoundId } from '../types'

const INNER = {
    x: -SCREEN.w / 2 + SCREEN.pad,
    y: -SCREEN.h / 2 + SCREEN.pad,
    w: SCREEN.w - SCREEN.pad * 2,
    h: SCREEN.h - SCREEN.pad * 2,
}

const EQ = { x: INNER.x + INNER.w - 96, y: INNER.y + 16, w: 84, h: 46, bars: 5 }

function paintShell(g: Phaser.GameObjects.Graphics) {
    const { w, h } = SCREEN
    g.clear()
    g.fillStyle(C.ink, 0.3)
    g.fillRoundedRect(-w / 2 + 8, -h / 2 + 16, w, h, 26)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
    g.fillStyle(C.inkSoft, 1)
    g.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 20)
    g.fillStyle(C.screenDeep, 1)
    g.fillRoundedRect(INNER.x, INNER.y, INNER.w, INNER.h, 12)
    g.fillStyle(C.screen, 1)
    g.fillRoundedRect(INNER.x, INNER.y, INNER.w, INNER.h - 6, 12)
}

function paintGloss(g: Phaser.GameObjects.Graphics) {
    g.clear()
    g.fillStyle(C.white, 0.06)
    g.fillTriangle(INNER.x, INNER.y, INNER.x + 150, INNER.y, INNER.x, INNER.y + INNER.h)
    g.fillStyle(C.white, 0.05)
    g.fillRoundedRect(INNER.x + 10, INNER.y + 8, INNER.w - 20, 10, 5)
}

export function createScreen(scene: Phaser.Scene) {
    const root = scene.add.container(SCREEN.cx, SCREEN.cy).setDepth(DEPTH.screen)

    const shell = scene.add.graphics()
    paintShell(shell)

    const art = scene.add.container(0, 0)
    const gloss = scene.add.graphics()
    paintGloss(gloss)

    const band = scene.add.graphics().setAlpha(0)
    const line = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '30px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: INNER.w - 70 },
            lineSpacing: 2,
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0)
    line.setStroke(CSS.ink, 6)

    const rim = scene.add.graphics().setAlpha(0)
    const eq = scene.add.graphics().setAlpha(0)

    root.add([shell, art, gloss, band, line, rim, eq])

    let picture: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics | null = null
    let shown = { w: INNER.w, h: INNER.h }
    let playing: SoundId | null = null
    let clock = 0

    const paintEq = (level: number[]) => {
        eq.clear()
        eq.fillStyle(C.ink, 0.42)
        eq.fillRoundedRect(EQ.x - 10, EQ.y - 8, EQ.w + 20, EQ.h + 16, 14)
        const step = EQ.w / EQ.bars
        for (let i = 0; i < EQ.bars; i++) {
            const h = Math.max(5, level[i] * EQ.h)
            eq.fillStyle(i % 2 ? C.yellow : C.glow, 1)
            eq.fillRoundedRect(EQ.x + i * step + 3, EQ.y + EQ.h - h, step - 6, h, 4)
        }
    }

    const tick = (_time: number, delta: number) => {
        if (!playing) return
        clock += delta / 1000
        const { period, bars } = TRACK[playing]
        const level: number[] = []
        for (let i = 0; i < EQ.bars; i++) {
            const phase = (clock / period) * Math.PI * 2 + i * (Math.PI / bars)
            level.push(0.24 + 0.38 * Math.abs(Math.sin(phase)) + 0.22 * Math.abs(Math.sin(phase * 1.7 + i)))
        }
        paintEq(level)
    }
    scene.events.on('update', tick)

    const dropPicture = () => {
        if (!picture) return
        scene.tweens.killTweensOf(picture)
        picture.destroy()
        picture = null
    }

    const placeholder = (frame: number) => {
        const g = scene.add.graphics()
        const w = INNER.w - 60
        const h = INNER.h - 40
        const tone = [C.blue, C.purple, C.ok, C.coral, C.yellowDeep, C.inkSoft][frame % 6]
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8, 16)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
        g.fillStyle(C.white, 0.3)
        g.fillCircle(-w / 4, -h / 5, 34)
        g.fillStyle(C.ink, 0.28)
        g.fillTriangle(-w / 2, h / 2, 0, -h / 8, w / 2, h / 2)
        shown = { w, h }
        return g
    }

    return {
        async show(frame: number) {
            dropPicture()
            let target = 1
            if (scene.textures.exists(SHEET.scenes)) {
                const image = scene.add.image(0, 0, SHEET.scenes, frame)
                const box = SCENE_BOX[frame]
                const scale = fitInside(box, INNER.w, INNER.h)
                image.setOrigin(
                    (box.x + box.w / 2) / image.frame.width,
                    (box.y + box.h / 2) / image.frame.height,
                )
                shown = { w: box.w * scale, h: box.h * scale }
                target = scale
                picture = image
            } else {
                picture = placeholder(frame)
            }
            art.add(picture)
            picture.setAlpha(0).setScale(target * 0.92)
            await FX.all(
                FX.to(scene, picture, { alpha: 1 }, { duration: 260 }),
                FX.to(scene, picture, { scale: target }, { duration: 300, ease: 'Back.easeOut' }),
            )
        },

        clear() {
            dropPicture()
            band.clear()
            band.setAlpha(0)
            line.setText('').setAlpha(0)
        },

        async say(text: string) {
            const h = Math.max(56, shown.h * 0.24)
            const w = shown.w
            const top = shown.h * 0.67 - shown.h / 2
            band.clear()
            band.fillStyle(C.ink, 0.3)
            band.fillRoundedRect(-w / 2, top - 12, w, h + 12, 12)
            band.fillStyle(C.ink, 0.66)
            band.fillRoundedRect(-w / 2, top, w, h, 10)
            line.setWordWrapWidth(w - 44)
            line.setText(text)
            band.setAlpha(0)
            line.setAlpha(0).setY(top + h / 2 + 14)
            await FX.all(
                FX.to(scene, band, { alpha: 1 }, { duration: 220 }),
                FX.to(scene, line, { alpha: 1, y: top + h / 2 }, { duration: 280, ease: 'Back.easeOut' }),
            )
        },

        focus(on: boolean, color = C.blue) {
            scene.tweens.killTweensOf(rim)
            rim.clear()
            if (!on) {
                rim.setAlpha(0)
                return
            }
            rim.lineStyle(7, color, 1)
            rim.strokeRoundedRect(INNER.x - 4, INNER.y - 4, INNER.w + 8, INNER.h + 8, 14)
            rim.setAlpha(1)
            scene.tweens.add({
                targets: rim,
                alpha: 0.22,
                duration: FX.ms(scene, 620),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        setPlaying(id: SoundId | null) {
            playing = id
            scene.tweens.killTweensOf(eq)
            if (!id) {
                void FX.to(scene, eq, { alpha: 0 }, { duration: 200 })
                return
            }
            clock = 0
            eq.setAlpha(1)
        },

        async cinema(on: boolean) {
            root.setDepth(on ? DEPTH.curtain - 3 : DEPTH.screen)
            await FX.all(
                FX.to(
                    scene,
                    root,
                    { x: on ? CINEMA.x : SCREEN.cx, y: on ? CINEMA.y : SCREEN.cy },
                    { duration: 520, ease: 'Cubic.easeInOut' },
                ),
                FX.to(scene, root, { scale: on ? CINEMA.scale : 1 }, { duration: 520, ease: 'Back.easeOut' }),
            )
        },

        artRect() {
            return {
                x: root.x,
                y: root.y,
                w: shown.w * root.scale,
                h: shown.h * root.scale,
            }
        },

        bounds() {
            return { x: SCREEN.cx, y: SCREEN.cy, w: SCREEN.w + 20, h: SCREEN.h + 20 }
        },

        destroy() {
            scene.events.off('update', tick)
            dropPicture()
            scene.tweens.killTweensOf([root, rim, eq, band, line])
            root.destroy(true)
        },
    }
}

export type Screen = ReturnType<typeof createScreen>
