import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fitInside, SCENE_BOX, SHEET, SOUND_BOX, SOUND_SHEET, soundFrame } from '../data/art'
import { CARD, DEPTH, PRESENT } from '../data/layout'
import { C, CSS, FONT, LAYER_COLOR } from '../data/theme'
import type { LayerId, SoundId } from '../types'

export type TrayOption =
    | { kind: 'image'; id: string; frame: number }
    | { kind: 'text'; id: string; line: string }
    | { kind: 'sound'; id: string; sound: SoundId }

interface Card {
    option: TrayOption
    root: Phaser.GameObjects.Container
    face: Phaser.GameObjects.Graphics
    ring: Phaser.GameObjects.Graphics
    wave: Phaser.GameObjects.Graphics
    body: Phaser.GameObjects.Container
    art: Phaser.GameObjects.GameObject | null
    zone: Phaser.GameObjects.Zone
    w: number
    h: number
}

const sizeOf = (kind: TrayOption['kind']) => (kind === 'text' ? CARD.wide : CARD.tall)

export function createTray(scene: Phaser.Scene, onPick: (index: number) => void, onPresent: () => void) {
    let cards: Card[] = []
    let enabled = false

    const paint = (card: Card, pressed: boolean) => {
        const { w, h } = card
        const dy = pressed ? 7 : 0
        const tone = LAYER_COLOR[card.option.kind]
        card.face.clear()
        card.face.fillStyle(C.ink, 0.26)
        card.face.fillRoundedRect(-w / 2 + 5, -h / 2 + 10, w, h, 26)
        card.face.fillStyle(C.ink, 1)
        card.face.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, 28)
        card.face.fillStyle(tone.deep, 1)
        card.face.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, 24)
        card.face.fillStyle(C.cream, 1)
        card.face.fillRoundedRect(-w / 2 + 6, -h / 2 + 6 + dy, w - 12, h - 18, 20)
        card.body.setY(dy)
    }

    const buildArt = (option: TrayOption, w: number, h: number) => {
        if (option.kind === 'text') {
            const text = scene.add
                .text(0, 0, option.line, {
                    fontFamily: FONT.black,
                    fontSize: '30px',
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: w - 60 },
                    lineSpacing: 4,
                })
                .setOrigin(0.5)
                .setResolution(2)
            return text
        }
        if (option.kind === 'image') {
            if (!scene.textures.exists(SHEET.scenes)) {
                const g = scene.add.graphics()
                const tone = [C.blue, C.purple, C.ok, C.coral, C.yellowDeep, C.inkSoft][option.frame % 6]
                g.fillStyle(tone, 1)
                g.fillRoundedRect(-(w - 56) / 2, -(h - 48) / 2, w - 56, h - 48, 12)
                return g
            }
            const image = scene.add.image(0, 0, SHEET.scenes, option.frame)
            const box = SCENE_BOX[option.frame]
            const scale = fitInside(box, w - 46, h - 44)
            image.setOrigin((box.x + box.w / 2) / image.frame.width, (box.y + box.h / 2) / image.frame.height)
            image.setScale(scale)
            return image
        }
        if (!scene.textures.exists(SHEET.sounds)) {
            const g = scene.add.graphics()
            g.fillStyle(C.yellow, 1)
            g.fillCircle(0, 0, 52)
            g.fillStyle(C.ink, 1)
            g.fillCircle(0, 0, 18)
            return g
        }
        const image = scene.add.image(0, 0, SHEET.sounds, soundFrame(option.sound))
        const box = SOUND_BOX[option.sound]
        const scale = fitInside(box, w - 120, h - 60)
        image.setOrigin(
            (box.x + box.w / 2) / SOUND_SHEET.frameWidth,
            (box.y + box.h / 2) / SOUND_SHEET.frameHeight,
        )
        image.setScale(scale)
        return image
    }

    const clear = () => {
        cards.forEach(card => {
            scene.tweens.killTweensOf([card.root, card.ring, card.wave])
            card.zone.destroy()
            card.root.destroy(true)
        })
        cards = []
    }

    const build = (option: TrayOption, index: number, total: number): Card => {
        const { w, h } = sizeOf(option.kind)
        const span = w * total + CARD.gap * (total - 1)
        const x = 640 - span / 2 + w / 2 + index * (w + CARD.gap)
        const root = scene.add.container(x, CARD.cy).setDepth(DEPTH.card)

        const ring = scene.add.graphics().setAlpha(0)
        ring.lineStyle(9, C.yellow, 1)
        ring.strokeRoundedRect(-w / 2 - 13, -h / 2 - 13, w + 26, h + 26, 34)
        const face = scene.add.graphics()
        const wave = scene.add.graphics()
        const art = buildArt(option, w, h)
        const body = scene.add.container(0, 0, [art])
        root.add([ring, face, body, wave])

        const zone = scene.add
            .zone(x, CARD.cy, w + 20, h + 24)
            .setOrigin(0.5)
            .setDepth(DEPTH.card + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (enabled) onPick(index)
        })

        const card: Card = { option, root, face, ring, wave, body, art, zone, w, h }
        paint(card, false)
        return card
    }

    const present = scene.add.container(PRESENT.cx, PRESENT.cy).setDepth(DEPTH.card).setVisible(false)
    const presentFace = scene.add.graphics()
    const presentLabel = scene.add
        .text(18, 0, 'APRESENTAR', { fontFamily: FONT.black, fontSize: '28px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    presentLabel.setStroke(CSS.ink, 5)
    present.add([presentFace, presentLabel])

    let presentOn = false
    let presentPressed = false

    const paintPresent = () => {
        const { w, h } = PRESENT
        const dy = presentPressed ? 7 : 0
        const fill = presentOn ? C.ok : C.creamDeep
        const deep = presentOn ? 0x2b7f42 : C.inkSoft
        presentFace.clear()
        presentFace.fillStyle(C.ink, 0.26)
        presentFace.fillRoundedRect(-w / 2 + 5, -h / 2 + 10, w, h, h / 2)
        presentFace.fillStyle(C.ink, 1)
        presentFace.fillRoundedRect(-w / 2 - 4, -h / 2 - 4 + dy, w + 8, h + 8, h / 2 + 4)
        presentFace.fillStyle(deep, 1)
        presentFace.fillRoundedRect(-w / 2, -h / 2 + dy, w, h, h / 2)
        presentFace.fillStyle(fill, 1)
        presentFace.fillRoundedRect(-w / 2, -h / 2 + dy, w, h - 9, h / 2)
        presentFace.fillStyle(C.white, 0.3)
        presentFace.fillRoundedRect(-w / 2 + 26, -h / 2 + 12 + dy, w - 52, 14, 7)
        presentFace.fillStyle(C.ink, presentOn ? 1 : 0.45)
        presentFace.fillTriangle(-w / 2 + 54, -20 + dy, -w / 2 + 54, 20 + dy, -w / 2 + 92, dy)
        presentLabel.setY(dy)
        presentLabel.setAlpha(presentOn ? 1 : 0.55)
    }
    paintPresent()

    const presentZone = scene.add
        .zone(PRESENT.cx, PRESENT.cy, PRESENT.w + 24, PRESENT.h + 24)
        .setOrigin(0.5)
        .setDepth(DEPTH.card + 1)
        .setInteractive({ useHandCursor: true })
        .setVisible(false)
    presentZone.on('pointerdown', () => {
        if (!presentOn) return
        presentPressed = true
        paintPresent()
        void FX.wait(scene, 140).then(() => {
            presentPressed = false
            paintPresent()
        })
        onPresent()
    })
    presentZone.input!.enabled = false

    return {
        async show(_layer: LayerId, options: TrayOption[], selected?: string) {
            clear()
            cards = options.map((option, index) => build(option, index, options.length))
            cards.forEach(card => card.root.setScale(0.86).setAlpha(0))
            await FX.all(
                ...cards.map((card, index) =>
                    FX.wait(scene, index * 100).then(() =>
                        FX.to(scene, card.root, { scale: 1, alpha: 1 }, { duration: 300, ease: 'Back.easeOut' }),
                    ),
                ),
            )
            if (selected) this.mark(options.findIndex(option => option.id === selected))
        },

        mark(index: number) {
            cards.forEach((card, i) => {
                scene.tweens.killTweensOf(card.ring)
                card.ring.setAlpha(i === index ? 1 : 0)
            })
        },

        press(index: number) {
            const card = cards[index]
            if (!card) return
            paint(card, true)
            void FX.wait(scene, 150).then(() => card.root.active && paint(card, false))
        },

        async ripple(index: number) {
            const card = cards[index]
            if (!card || card.option.kind !== 'sound') return
            const image = card.art
            if (image instanceof Phaser.GameObjects.Image) image.setFrame(soundFrame(card.option.sound, true))
            const pulse = { v: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: pulse,
                    v: 1,
                    duration: FX.ms(scene, 760),
                    onUpdate: () => {
                        if (!card.wave.active) return
                        card.wave.clear()
                        for (let i = 0; i < 3; i++) {
                            const t = (pulse.v + i / 3) % 1
                            card.wave.lineStyle(6, C.yellowDeep, 1 - t)
                            card.wave.beginPath()
                            card.wave.arc(card.w / 2 - 46, 0, 18 + t * 40, -0.9, 0.9)
                            card.wave.strokePath()
                        }
                    },
                    onComplete: () => resolve(),
                })
            })
            card.wave.clear()
            if (image instanceof Phaser.GameObjects.Image) image.setFrame(soundFrame(card.option.sound, false))
        },

        artOf(index: number) {
            const card = cards[index]
            const art = card.art as Phaser.GameObjects.Image
            return { x: card.root.x, y: card.root.y, scale: art?.scale ?? 1 }
        },

        setEnabled(value: boolean, dim = !value) {
            enabled = value
            cards.forEach(card => {
                if (card.zone.input) card.zone.input.enabled = value
                card.root.setAlpha(dim ? 0.7 : 1)
            })
        },

        showPresent(visible: boolean, ready = false) {
            present.setVisible(visible)
            presentZone.setVisible(visible)
            presentOn = ready
            paintPresent()
            if (presentZone.input) presentZone.input.enabled = visible && ready
            if (!visible) return
            present.setScale(0.88).setAlpha(0)
            void FX.to(scene, present, { scale: 1, alpha: 1 }, { duration: 280, ease: 'Back.easeOut' })
        },

        bounds() {
            return { x: 640, y: CARD.cy, w: 1040, h: CARD.tall.h + 44 }
        },

        async hide() {
            await FX.all(
                ...cards.map(card => FX.to(scene, card.root, { alpha: 0, scale: 0.9 }, { duration: 200 })),
                present.visible ? FX.to(scene, present, { alpha: 0, scale: 0.9 }, { duration: 200 }) : Promise.resolve(),
            )
            clear()
            present.setVisible(false)
            presentZone.setVisible(false)
            if (presentZone.input) presentZone.input.enabled = false
        },

        clear,

        destroy() {
            clear()
            scene.tweens.killTweensOf(present)
            present.destroy(true)
            presentZone.destroy()
        },
    }
}

export type Tray = ReturnType<typeof createTray>
