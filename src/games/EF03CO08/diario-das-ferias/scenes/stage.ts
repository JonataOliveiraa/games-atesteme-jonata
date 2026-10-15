import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { BG_STAGE } from '../data/files'
import { DEPTH, STAGE, W, H } from '../data/layout'
import { THINGS } from '../data/things'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { STAGE_WORDS } from '../data/words'
import type { Page } from '../types'
import type { Audio } from './audio'
import { soundCard } from './cards'
import { createDuda } from './duda'

/**
 * O fim do nível: a Duda apresenta o diário no telão do teatrinho. A criança
 * escolhe o título (o texto) e assiste às fotos e aos sons que ela guardou.
 */
export interface Stage {
    /** `captions`: as duas legendas prontas de cada página (N2 e N3); sem ela, a página não pede legenda */
    play(pages: Page[], titles: string[], onCover?: () => void, captions?: (page: Page) => [string, string] | null): Promise<void>
    destroy(): void
}

export function createStage(scene: Phaser.Scene, audio: Audio): Stage {
    const objects: Phaser.GameObjects.GameObject[] = []
    const keep = <T extends Phaser.GameObjects.GameObject>(o: T): T => {
        objects.push(o)
        return o
    }
    const duda = createDuda(scene, DEPTH.stage + 6, true)
    let alive = true

    const say = (text: string, size: number = SIZE.title) =>
        keep(
            scene.add
                .text(STAGE.screen.x, STAGE.contentY, text, {
                    fontFamily: FONT.black,
                    fontSize: `${size}px`,
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: STAGE.contentW },
                })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.stage + 2),
        )

    const button = (x: number, y: number, w: number, h: number, label: string, tone: number) => {
        const g = scene.add.graphics()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        const text = scene.add
            .text(0, 0, label, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.chip}px`,
                color: inkOn(tone),
                align: 'center',
                wordWrap: { width: w - 30 },
            })
            .setOrigin(0.5)
            .setResolution(2)
        if (text.height > h - 10) text.setScale((h - 10) / text.height)
        const box = keep(scene.add.container(x, y, [g, text]).setDepth(DEPTH.stage + 4))
        const zone = keep(scene.add.zone(x, y, w, h).setDepth(DEPTH.stage + 5).setInteractive({ useHandCursor: true }))
        void FX.popIn(scene, box, { from: 0.6, duration: 320 })
        return { box, zone }
    }

    const choose = <T>(options: { label: string; value: T; tone: number; x: number; w: number }[], y: number, h: number) =>
        new Promise<{ value: T; box: Phaser.GameObjects.Container }>(resolve => {
            const made = options.map(o => ({ o, ...button(o.x, y, o.w, h, o.label, o.tone) }))
            made.forEach(m =>
                m.zone.once('pointerdown', () => {
                    made.forEach(x => {
                        x.zone.removeAllListeners()
                        x.zone.destroy()
                        if (x !== m) void FX.to(scene, x.box, { alpha: 0 }, { duration: 200 }).then(() => x.box.destroy())
                    })
                    audio.pop(1)
                    void FX.press(scene, m.box)
                    resolve({ value: m.o.value, box: m.box })
                }),
            )
        })

    const cheer = (big = false) => {
        audio.clap()
        const count = big ? 18 : 9
        for (let i = 0; i < count; i++) {
            const x = Phaser.Math.Between(60, W - 60)
            const heart = scene.add.graphics().setDepth(DEPTH.stage + 3)
            const tone = [C.coral, C.butter, C.lilac, C.mint][i % 4]
            heart.fillStyle(tone, 1)
            heart.fillCircle(-7, 0, 9)
            heart.fillCircle(7, 0, 9)
            heart.fillTriangle(-16, 3, 16, 3, 0, 20)
            heart.lineStyle(2, C.ink, 0.6)
            heart.strokeCircle(-7, 0, 9)
            heart.strokeCircle(7, 0, 9)
            heart.setPosition(x, H - 40).setAlpha(0)
            keep(heart)
            scene.tweens.add({ targets: heart, alpha: 1, duration: 150, delay: i * 60 })
            scene.tweens.add({
                targets: heart,
                y: H - 200 - Phaser.Math.Between(0, 80),
                x: x + Phaser.Math.Between(-30, 30),
                duration: 1200,
                delay: i * 60,
                ease: 'Sine.easeOut',
            })
            scene.tweens.add({ targets: heart, alpha: 0, duration: 300, delay: i * 60 + 900, onComplete: () => heart.destroy() })
        }
    }

    const showPage = async (page: Page, caption?: string, ask?: [string, string] | null) => {
        const shown: Phaser.GameObjects.GameObject[] = []
        const withText = caption !== undefined || !!ask
        const cy = withText ? STAGE.captionContentY : STAGE.contentY
        const ch = withText ? STAGE.captionContentH : STAGE.contentH
        if (page.tool === 'photo') {
            const image = scene.add.image(STAGE.screen.x, cy, page.key)
            image.setScale(Math.min(STAGE.contentW / image.width, ch / image.height))
            const g = scene.add.graphics()
            const w = image.displayWidth + 24
            const h = image.displayHeight + 24
            g.fillStyle(C.paper, 1)
            g.fillRoundedRect(STAGE.screen.x - w / 2, cy - h / 2, w, h, 10)
            g.lineStyle(4, C.ink, 1)
            g.strokeRoundedRect(STAGE.screen.x - w / 2, cy - h / 2, w, h, 10)
            g.setDepth(DEPTH.stage + 1)
            image.setDepth(DEPTH.stage + 2)
            shown.push(g, image)
            audio.shutter()
            void FX.popIn(scene, image, { from: 0.7, duration: 360 })
            void FX.popIn(scene, g, { from: 0.7, duration: 360 })
        } else {
            const card = soundCard(scene, THINGS[page.thing].label)
            card.box.setPosition(STAGE.screen.x, cy).setDepth(DEPTH.stage + 2)
            if (withText) card.box.setScale(ch / 230)
            card.dance(true)
            audio.thing(page.thing, 1)
            shown.push(card.box)
            scene.time.delayedCall(STAGE.pageMs - 200, () => card.dance(false))
        }
        objects.push(...shown)
        await FX.wait(scene, 700)
        if (!alive) return
        let text = caption
        if (ask) {
            const pick = say(STAGE_WORDS.caption, SIZE.chip)
            pick.setY(STAGE.captionY)
            const tones = [C.peach, C.mint]
            const { value, box } = await choose(
                ask.map((label, i) => ({ label, value: label, tone: tones[i], x: STAGE.chipX + (i ? 1 : -1) * (STAGE.captionGap / 2), w: STAGE.captionW })),
                STAGE.chipY,
                STAGE.chipH,
            )
            if (!alive) return
            pick.destroy()
            text = value
            chosen.push(value)
            void FX.to(scene, box, { alpha: 0 }, { duration: 200 }).then(() => box.destroy())
        }
        if (text) {
            const line = keep(
                scene.add
                    .text(STAGE.screen.x, STAGE.captionY, text, {
                        fontFamily: FONT.black,
                        fontSize: `${SIZE.chip}px`,
                        color: CSS.ink,
                        align: 'center',
                        wordWrap: { width: STAGE.contentW },
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.stage + 2),
            )
            shown.push(line)
            void FX.popIn(scene, line, { from: 0.6, duration: 320 })
        }
        cheer()
        await FX.wait(scene, STAGE.pageMs - 700)
        if (!alive) return
        await FX.to(scene, shown as unknown as FxTarget[], { alpha: 0 }, { duration: 220 })
        shown.forEach(o => o.destroy())
    }

    const chosen: string[] = []
    const replay = async (pages: Page[], captions?: (page: Page) => [string, string] | null) => {
        duda.pose('present')
        for (const [i, page] of pages.entries()) {
            if (!alive) return
            if (!captions) await showPage(page)
            else if (chosen[i] !== undefined) await showPage(page, chosen[i])
            else await showPage(page, undefined, captions(page))
        }
    }

    return {
        async play(pages, titles, onCover, captions) {
            await FX.curtain(scene, () => {
                onCover?.()
                keep(scene.add.image(W / 2, H / 2, BG_STAGE).setDepth(DEPTH.stage))
            })
            if (!alive) return
            await duda.show('talk', STAGE.duda)
            if (!alive) return

            const pick = say(STAGE_WORDS.pick)
            const xs = [-1, 0, 1].map(k => STAGE.chipX + k * STAGE.chipGap)
            const tones = [C.peach, C.mint, C.lilac]
            const { box } = await choose(
                titles.map((label, i) => ({ label, value: label, tone: tones[i % tones.length], x: xs[i], w: STAGE.chipW })),
                STAGE.chipY,
                STAGE.chipH,
            )
            if (!alive) return
            pick.destroy()
            await FX.to(scene, box, { x: STAGE.screen.x, y: STAGE.titleY, scale: 0.9 }, { duration: 480, ease: 'Sine.easeInOut' })
            if (!alive) return

            for (;;) {
                await replay(pages, captions)
                if (!alive) return
                duda.pose('bow')
                audio.win()
                cheer(true)
                await FX.wait(scene, 900)
                if (!alive) return
                const { value } = await choose(
                    [
                        { label: STAGE_WORDS.again, value: 'again', tone: C.cream, x: 470, w: STAGE.buttonW },
                        { label: STAGE_WORDS.next, value: 'next', tone: C.accent, x: 810, w: STAGE.buttonW },
                    ],
                    STAGE.buttonY,
                    STAGE.buttonH,
                )
                if (!alive) return
                objects.filter(o => o instanceof Phaser.GameObjects.Container && o !== box && o.active).forEach(o => o.destroy())
                if (value === 'next') return
            }
        },
        destroy() {
            alive = false
            duda.destroy()
            objects.forEach(o => {
                if (!o.active) return
                scene.tweens.killTweensOf(o)
                o.destroy()
            })
            objects.length = 0
        },
    }
}
