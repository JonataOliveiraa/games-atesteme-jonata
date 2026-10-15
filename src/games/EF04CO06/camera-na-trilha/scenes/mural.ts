import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { DEPTH, MURAL, W, H } from '../data/layout'
import { SUBJECTS } from '../data/subjects'
import { C, CSS, FONT } from '../data/theme'
import { MURAL as WORDS } from '../data/words'
import type { Capture } from '../types'
import { film, polaroid, type Print } from './capture'

export interface MuralSounds {
    pop(): void
    whoosh(): void
}

const print = (scene: Phaser.Scene, capture: Capture): Print =>
    capture.mode === 'photo' ? polaroid(scene, capture.keys[0]) : film(scene, capture.keys)

export function openMural(scene: Phaser.Scene, captures: Capture[], subtitle: string, sounds: MuralSounds): Promise<void> {
    return new Promise(resolve => {
        const objects: Phaser.GameObjects.GameObject[] = []
        const prints: Print[] = []
        const zones: Phaser.GameObjects.Zone[] = []
        const keep = <T extends Phaser.GameObjects.GameObject>(obj: T) => {
            objects.push(obj)
            return obj
        }
        const top = MURAL.y - MURAL.h / 2
        const left = MURAL.x - MURAL.w / 2

        const veil = keep(scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0).setDepth(DEPTH.mural))
        void FX.to(scene, veil, { fillAlpha: 0.72 }, { duration: 300 })

        const board = keep(scene.add.graphics().setDepth(DEPTH.mural + 1))
        board.fillStyle(C.shadow, 0.3)
        board.fillRoundedRect(left + 8, top + 12, MURAL.w, MURAL.h, 30)
        board.fillStyle(C.headerFace, 1)
        board.fillRoundedRect(left, top, MURAL.w, MURAL.h, 30)
        board.fillStyle(C.accent, 1)
        board.fillRoundedRect(left, top, MURAL.w, 96, { tl: 30, tr: 30, bl: 0, br: 0 })
        board.fillStyle(C.headerRim, 1)
        board.fillRect(left, top + 96, MURAL.w, 6)
        const title = keep(
            scene.add
                .text(left + 40, top + 34, WORDS.title, { fontFamily: FONT.black, fontSize: '40px', color: CSS.white })
                .setOrigin(0, 0.5)
                .setResolution(2)
                .setDepth(DEPTH.mural + 2),
        )
        keep(
            scene.add
                .text(left + 42, top + 74, subtitle, { fontFamily: FONT.body, fontSize: '22px', color: '#d7fee1' })
                .setOrigin(0, 0.5)
                .setResolution(2)
                .setDepth(DEPTH.mural + 2),
        )
        keep(
            scene.add
                .text(left + MURAL.w - 40, top + 50, WORDS.note, { fontFamily: FONT.body, fontSize: '22px', color: CSS.white })
                .setOrigin(1, 0.5)
                .setResolution(2)
                .setDepth(DEPTH.mural + 2),
        )
        const boardParts = objects.slice(1) as unknown as FxTarget[]
        boardParts.forEach(p => p.setAlpha(0))
        void FX.all(...boardParts.map(p => FX.to(scene, p, { alpha: 1 }, { duration: 280 })))
        void FX.popIn(scene, title, { from: 0.8, duration: 380 })

        let enlarged: (() => void) | null = null

        const enlarge = (capture: Capture) => {
            if (enlarged) return
            sounds.whoosh()
            const def = SUBJECTS[capture.order.subject]
            const shade = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.78).setDepth(DEPTH.mural + 10)
            const big = print(scene, capture)
            const width = capture.mode === 'photo' ? MURAL.bigPhotoW : MURAL.bigFilmW
            big.box.setPosition(MURAL.x, MURAL.bigY).setScale(width / big.width).setDepth(DEPTH.mural + 11)
            const bottom = MURAL.bigY + (big.height * width) / big.width / 2
            const name = scene.add
                .text(MURAL.x, bottom + 40, def.name, { fontFamily: FONT.black, fontSize: '38px', color: CSS.white })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.mural + 11)
            const hint = scene.add
                .text(MURAL.x, bottom + 84, capture.order.hint, { fontFamily: FONT.body, fontSize: '27px', color: '#d7fee1' })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.mural + 11)
            void FX.popIn(scene, big.box, { from: 0.6, duration: 340 })
            const close = scene.add
                .zone(W / 2, H / 2, W, H)
                .setDepth(DEPTH.mural + 12)
                .setInteractive({ useHandCursor: true })
            const shut = () => {
                big.stop()
                ;[shade, big.box, name, hint, close].forEach(o => o.destroy())
                enlarged = null
            }
            close.once('pointerdown', () => {
                sounds.pop()
                shut()
            })
            enlarged = shut
        }

        captures.forEach((capture, i) => {
            const x = MURAL.cols[i % MURAL.cols.length]
            const y = MURAL.rows[Math.floor(i / MURAL.cols.length)]
            const p = print(scene, capture)
            const width = capture.mode === 'photo' ? MURAL.photoW : MURAL.filmW
            const scale = width / p.width
            p.box.setPosition(x, y).setScale(scale).setAngle(((i * 37) % 9) - 4).setDepth(DEPTH.mural + 3).setAlpha(0)
            prints.push(p)
            const pin = keep(scene.add.circle(x, y - (p.height * scale) / 2 + 6, 11, C.coral).setStrokeStyle(3, C.white).setDepth(DEPTH.mural + 4).setAlpha(0))
            const caption = keep(
                scene.add
                    .text(x, y + MURAL.captionDY, SUBJECTS[capture.order.subject].name, { fontFamily: FONT.black, fontSize: '23px', color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.mural + 4)
                    .setAlpha(0),
            )
            if (caption.width > MURAL.photoW + 60) caption.setScale((MURAL.photoW + 60) / caption.width)
            void FX.wait(scene, 380 + i * 160).then(() => {
                if (!p.box.active) return
                sounds.pop()
                p.box.setAlpha(1)
                void FX.popIn(scene, p.box, { from: 0.5, duration: 320 })
                pin.setAlpha(1)
                caption.setAlpha(1)
            })
            const zone = scene.add
                .zone(x, y + 10, width + 20, p.height * scale + 50)
                .setDepth(DEPTH.mural + 5)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => enlarge(capture))
            zones.push(zone)
        })

        const buttonArt = keep(scene.add.graphics())
        buttonArt.fillStyle(C.headerLine, 1)
        buttonArt.fillRoundedRect(-140, -27, 280, 62, 31)
        buttonArt.fillStyle(C.accent, 1)
        buttonArt.fillRoundedRect(-140, -31, 280, 62, 31)
        const buttonText = keep(
            scene.add
                .text(0, 0, WORDS.done, { fontFamily: FONT.black, fontSize: '28px', color: CSS.white })
                .setOrigin(0.5)
                .setResolution(2),
        )
        const button = keep(scene.add.container(MURAL.x, MURAL.buttonY, [buttonArt, buttonText]).setDepth(DEPTH.mural + 4).setAlpha(0))
        void FX.wait(scene, 380 + captures.length * 160 + 200).then(() => {
            if (!button.active) return
            button.setAlpha(1)
            void FX.popIn(scene, button, { from: 0.7, duration: 300 })
        })
        const go = scene.add
            .zone(MURAL.x, MURAL.buttonY, 300, 80)
            .setDepth(DEPTH.mural + 5)
            .setInteractive({ useHandCursor: true })
        zones.push(go)
        go.once('pointerdown', async () => {
            enlarged?.()
            zones.forEach(z => z.destroy())
            sounds.pop()
            void FX.press(scene, button)
            const all = [...objects, ...prints.map(p => p.box)] as unknown as FxTarget[]
            await FX.all(...all.map(o => FX.to(scene, o, { alpha: 0 }, { duration: 260 })))
            prints.forEach(p => {
                p.stop()
                p.box.destroy()
            })
            objects.forEach(o => o.destroy())
            resolve()
        })
    })
}
