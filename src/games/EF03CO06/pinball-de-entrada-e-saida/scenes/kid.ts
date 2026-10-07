import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { ASK, DEPTH, H, KID, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import type { PoseId } from '../types'
import { kidImage, setKidPose } from './art'

export interface Kid {
    /** a Lily entra pela esquerda, com o fundo escurecido atrás */
    enter(pose: PoseId): Promise<void>
    leave(): Promise<void>
    /** escreve letra a letra e espera o botão */
    say(text: string, button: string): Promise<void>
    advance(): void
    rect(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

const BUTTON_W = 190
const TAIL = 30

export function createKid(scene: Phaser.Scene): Kid {
    const veil = scene.add.rectangle(W / 2, H / 2, W * 2, H * 2, C.shadow, 0.5).setDepth(DEPTH.veil).setAlpha(0)
    const art = kidImage(scene, 'ask', KID.h).setPosition(KID.outX, KID.feet).setDepth(DEPTH.kid).setVisible(false)

    let balloon: Phaser.GameObjects.Container | undefined
    let zone: Phaser.GameObjects.Zone | undefined
    let typing: Typewriter | undefined
    let release: (() => void) | undefined
    let button: { x: number; y: number; w: number; h: number } | undefined

    const close = () => {
        typing?.skip()
        typing = undefined
        zone?.destroy()
        zone = undefined
        button = undefined
        balloon?.destroy()
        balloon = undefined
        const done = release
        release = undefined
        done?.()
    }

    const build = (text: string, withButton: string) => {
        const inner = ASK.w - ASK.pad * 2
        const label = scene.add
            .text(0, 0, text, {
                fontFamily: FONT.black,
                fontSize: `${SIZE.kid + 4}px`,
                color: CSS.ink,
                align: 'center',
                wordWrap: { width: inner },
                lineSpacing: 6,
            })
            .setOrigin(0.5, 0)
            .setResolution(2)
        const h = ASK.pad * 2 + label.height + ASK.buttonH + 14
        label.setY(-h / 2 + ASK.pad)
        const w = ASK.w
        const bg = scene.add.graphics()
        bg.fillStyle(C.shadow, 0.18)
        bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 28)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
        bg.fillTriangle(-w / 2 + 2, 6, -w / 2 + 2, 46, -w / 2 - TAIL, 40)
        bg.lineStyle(4, C.ink, 1)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 28)
        bg.lineBetween(-w / 2, 6, -w / 2 - TAIL, 40)
        bg.lineBetween(-w / 2, 46, -w / 2 - TAIL, 40)
        bg.fillStyle(C.white, 1)
        bg.fillRect(-w / 2 - 2, 8, 6, 36)
        const by = h / 2 - ASK.pad - ASK.buttonH / 2 + 6
        const btn = scene.add.graphics()
        btn.fillStyle(C.shadow, 0.2)
        btn.fillRoundedRect(-BUTTON_W / 2 + 2, by - ASK.buttonH / 2 + 4, BUTTON_W, ASK.buttonH, ASK.buttonH / 2)
        btn.fillStyle(C.accent, 1)
        btn.fillRoundedRect(-BUTTON_W / 2, by - ASK.buttonH / 2, BUTTON_W, ASK.buttonH, ASK.buttonH / 2)
        btn.lineStyle(3, C.ink, 1)
        btn.strokeRoundedRect(-BUTTON_W / 2, by - ASK.buttonH / 2, BUTTON_W, ASK.buttonH, ASK.buttonH / 2)
        const btnText = scene.add
            .text(0, by, withButton, { fontFamily: FONT.black, fontSize: `${SIZE.button}px`, color: inkOn(C.accent) })
            .setOrigin(0.5)
            .setResolution(2)
        button = { x: ASK.x, y: ASK.y + by, w: BUTTON_W + 20, h: ASK.buttonH + 16 }
        balloon = scene.add.container(ASK.x, ASK.y, [bg, label, btn, btnText]).setDepth(DEPTH.balloon).setScale(0.8).setAlpha(0)
        void FX.to(scene, balloon, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
        const writer = FX.type(scene, label, text, { delay: 26 })
        typing = writer
        writer.then(() => {
            if (typing === writer) typing = undefined
        })
        return h
    }

    const advance = () => {
        if (typing) {
            typing.skip()
            typing = undefined
        } else if (button) close()
    }

    return {
        async enter(pose) {
            setKidPose(art, pose)
            art.setVisible(true).setX(KID.outX)
            void FX.to(scene, veil, { alpha: 1 }, { duration: 400 })
            await FX.to(scene, art, { x: KID.x }, { duration: 560, ease: 'Cubic.easeOut' })
        },
        async leave() {
            void FX.to(scene, veil, { alpha: 0 }, { duration: 420 })
            await FX.to(scene, art, { x: KID.outX }, { duration: 460, ease: 'Cubic.easeIn' })
            art.setVisible(false)
        },
        say(text, label) {
            close()
            const h = build(text, label)
            return new Promise<void>(resolve => {
                release = resolve
                scene.time.delayedCall(240, () => {
                    if (!button) return
                    zone = scene.add
                        .zone(ASK.x, ASK.y, ASK.w, h)
                        .setDepth(DEPTH.balloon + 1)
                        .setInteractive({ useHandCursor: true })
                    zone.on('pointerdown', (p: Phaser.Input.Pointer) => {
                        if (typing) return advance()
                        if (button && Math.abs(p.worldX - button.x) <= button.w / 2 && Math.abs(p.worldY - button.y) <= button.h / 2) close()
                    })
                })
            })
        },
        advance,
        rect() {
            return { x: KID.x, y: KID.feet - KID.h / 2, w: 300, h: KID.h }
        },
        destroy() {
            close()
            veil.destroy()
            art.destroy()
        },
    }
}
