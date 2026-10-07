import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { LIFEGUARD_SHEET, NINA_CELL, RADIO_CELL, cellKey, type NinaPose } from '../data/files'
import { DEPTH, NINA, RADIO, SAY_BOX } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { RADIO_LABEL } from '../data/words'
import { fit, ninaImage } from './art'

export interface Lifeguard {
    pose(p: NinaPose): void
    say(text: string, button?: string): Promise<void>
    shout(text: string): void
    advance(): void
    clear(): void
    showRadio(on: boolean): Promise<void>
    pressRadio(): void
    radioContains(x: number, y: number): boolean
    radioRect(): { x: number; y: number; w: number; h: number }
    rect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

const BUTTON_H = 54

export function createLifeguard(scene: Phaser.Scene): Lifeguard {
    const art = ninaImage(scene, NINA_CELL.talk, NINA.h).setPosition(NINA.x, NINA.feet).setDepth(DEPTH.nina)
    const pose = (p: NinaPose) => art.setFrame(cellKey(NINA_CELL[p]))

    let balloon: Phaser.GameObjects.Container | undefined
    let zone: Phaser.GameObjects.Zone | undefined
    let typing: Typewriter | undefined
    let release: (() => void) | undefined
    let buttonBox: { x: number; y: number; w: number; h: number } | undefined

    const clear = () => {
        typing?.skip()
        typing = undefined
        zone?.destroy()
        zone = undefined
        balloon?.destroy()
        balloon = undefined
        buttonBox = undefined
        const done = release
        release = undefined
        done?.()
    }

    const build = (text: string, button?: string) => {
        clear()
        const inner = SAY_BOX.w - SAY_BOX.pad * 2
        const label = scene.add
            .text(-SAY_BOX.w / 2 + SAY_BOX.pad, 0, text, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.nina}px`,
                color: CSS.ink,
                wordWrap: { width: inner },
                lineSpacing: 4,
            })
            .setResolution(2)
        const textH = label.height
        const bw = 170
        const inline = !button || label.width + bw + SAY_BOX.pad * 3 <= SAY_BOX.w
        const h = inline
            ? Math.max(textH, button ? BUTTON_H : 0) + SAY_BOX.pad * 2
            : Math.max(SAY_BOX.minH, SAY_BOX.pad * 2 + textH + BUTTON_H + 14)
        label.setY(inline ? -textH / 2 : -h / 2 + SAY_BOX.pad)
        label.setText('')

        const bg = scene.add.graphics()
        const w = SAY_BOX.w
        bg.fillStyle(C.shadow, 0.18)
        bg.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 26)
        bg.fillStyle(C.white, 1)
        bg.fillTriangle(-w / 2 + 6, -h / 2 + 24, -w / 2 + 6, -h / 2 + 64, -w / 2 - 54, -h / 2 - 6)
        bg.lineStyle(4, C.ink, 1)
        bg.lineBetween(-w / 2 + 2, -h / 2 + 24, -w / 2 - 54, -h / 2 - 6)
        bg.lineBetween(-w / 2 + 2, -h / 2 + 64, -w / 2 - 54, -h / 2 - 6)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 26)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 26)
        const parts: Phaser.GameObjects.GameObject[] = [bg, label]

        if (button) {
            const by = inline ? 0 : h / 2 - SAY_BOX.pad - BUTTON_H / 2 + 6
            const bx = w / 2 - SAY_BOX.pad - bw / 2
            const btn = scene.add.graphics()
            btn.fillStyle(C.shadow, 0.2)
            btn.fillRoundedRect(bx - bw / 2 + 2, by - BUTTON_H / 2 + 4, bw, BUTTON_H, BUTTON_H / 2)
            btn.fillStyle(C.accent, 1)
            btn.fillRoundedRect(bx - bw / 2, by - BUTTON_H / 2, bw, BUTTON_H, BUTTON_H / 2)
            btn.lineStyle(3, C.ink, 1)
            btn.strokeRoundedRect(bx - bw / 2, by - BUTTON_H / 2, bw, BUTTON_H, BUTTON_H / 2)
            const btnText = scene.add
                .text(bx, by, button, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: inkOn(C.accent) })
                .setOrigin(0.5)
                .setResolution(2)
            parts.push(btn, btnText)
            buttonBox = { x: SAY_BOX.x + bx, y: SAY_BOX.y + by, w: bw + 20, h: BUTTON_H + 16 }
        }

        balloon = scene.add.container(SAY_BOX.x, SAY_BOX.y, parts).setDepth(DEPTH.balloon).setScale(0.85).setAlpha(0)
        void FX.to(scene, balloon, { scale: 1, alpha: 1 }, { duration: 220, ease: 'Back.easeOut' })
        const writer = FX.type(scene, label, text, { delay: 24 })
        typing = writer
        writer.then(() => {
            if (typing === writer) typing = undefined
        })
        return { h }
    }

    const tapped = (x: number, y: number) => {
        if (typing) {
            typing.skip()
            typing = undefined
            return
        }
        if (!buttonBox) return
        if (Math.abs(x - buttonBox.x) <= buttonBox.w / 2 && Math.abs(y - buttonBox.y) <= buttonBox.h / 2) clear()
    }

    const radioPlate = scene.add.graphics()
    radioPlate.fillStyle(C.shadow, 0.18)
    radioPlate.fillRoundedRect(-RADIO.hitW / 2 + 4, -RADIO.size / 2 - 18, RADIO.hitW - 8, RADIO.hitH - 4, 26)
    radioPlate.fillStyle(C.white, 1)
    radioPlate.fillRoundedRect(-RADIO.hitW / 2, -RADIO.size / 2 - 22, RADIO.hitW - 8, RADIO.hitH - 4, 26)
    radioPlate.lineStyle(4, C.ink, 1)
    radioPlate.strokeRoundedRect(-RADIO.hitW / 2, -RADIO.size / 2 - 22, RADIO.hitW - 8, RADIO.hitH - 4, 26)
    const radioArt = fit(scene, LIFEGUARD_SHEET, RADIO_CELL, RADIO.size)
    const radioLabel = scene.add
        .text(-4, RADIO.labelY - RADIO.y, RADIO_LABEL, { fontFamily: FONT.black, fontSize: `${SIZE.radio}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    if (radioLabel.width > RADIO.hitW - 30) radioLabel.setScale((RADIO.hitW - 30) / radioLabel.width)
    const radio = scene.add
        .container(RADIO.x, RADIO.y, [radioPlate, radioArt, radioLabel])
        .setDepth(DEPTH.nina + 1)
        .setVisible(false)

    return {
        pose,
        say(text, button = 'Ok') {
            const { h } = build(text, button)
            return new Promise<void>(resolve => {
                release = resolve
                scene.time.delayedCall(240, () => {
                    if (!balloon) return
                    zone = scene.add
                        .zone(SAY_BOX.x, SAY_BOX.y, SAY_BOX.w, h)
                        .setDepth(DEPTH.balloon + 1)
                        .setInteractive({ useHandCursor: true })
                    zone.on('pointerdown', (p: Phaser.Input.Pointer) => tapped(p.x, p.y))
                })
            })
        },
        shout(text) {
            build(text)
        },
        advance() {
            if (typing) {
                typing.skip()
                typing = undefined
            } else if (buttonBox) clear()
        },
        clear,
        async showRadio(on) {
            if (on === radio.visible) return
            if (!on) {
                radio.setVisible(false)
                return
            }
            radio.setVisible(true).setScale(0.3)
            await FX.to(scene, radio, { scale: 1 }, { duration: 340, ease: 'Back.easeOut' })
        },
        pressRadio() {
            void FX.press(scene, radio)
        },
        radioContains(x, y) {
            return radio.visible && Math.abs(x - RADIO.x) <= RADIO.hitW / 2 && Math.abs(y - (RADIO.y + 14)) <= RADIO.hitH / 2
        },
        radioRect() {
            return { x: RADIO.x - 4, y: RADIO.y + 14, w: RADIO.hitW + 10, h: RADIO.hitH + 10 }
        },
        rect() {
            return { x: NINA.x, y: NINA.feet - NINA.h / 2, w: 200, h: NINA.h + 30 }
        },
        destroy() {
            clear()
            radio.destroy()
            art.destroy()
        },
    }
}
