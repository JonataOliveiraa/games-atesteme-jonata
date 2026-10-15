import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL } from '../data/files'
import { CARD, DEPTH, FOCUS } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { uiImage } from './art'
import type { Rect } from './guide'

/**
 * A foto é de verdade: o que estava dentro do visor naquele instante, copiado
 * numa textura. As notas não entram, porque elas são o som, e som não sai na foto.
 */
export function snapPhoto(scene: Phaser.Scene, key: string, area: Rect, parts: Phaser.GameObjects.GameObject[]): string {
    if (scene.textures.exists(key)) scene.textures.remove(key)
    const texture = scene.textures.addDynamicTexture(key, area.w, area.h)
    if (!texture) return key
    const left = area.x - area.w / 2
    const top = area.y - area.h / 2
    texture.fill(C.sky, 1)
    texture.beginDraw()
    parts.forEach(part => {
        const at = part as Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Transform
        texture.batchDraw(part, at.x - left, at.y - top)
    })
    texture.endDraw()
    return key
}

export interface Card {
    readonly box: Phaser.GameObjects.Container
    /** voa até a página do diário e some */
    flyTo(x: number, y: number, width: number): Promise<void>
    destroy(): void
}

const wrap = (scene: Phaser.Scene, box: Phaser.GameObjects.Container, width: number): Card => ({
    box,
    async flyTo(x, y, w) {
        await FX.to(scene, box, { x, y, scale: w / width }, { duration: 520, ease: 'Sine.easeInOut' })
        box.destroy()
    },
    destroy() {
        scene.tweens.killTweensOf(box)
        box.destroy()
    },
})

/** a polaroide com a foto */
export function photoCard(scene: Phaser.Scene, key: string): Card {
    const image = scene.add.image(0, -CARD.foot / 2 + CARD.frame / 2, key).setDisplaySize(FOCUS.w, FOCUS.h)
    const w = FOCUS.w + CARD.frame * 2
    const h = FOCUS.h + CARD.frame + CARD.foot
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.25)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 10)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 10)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 10)
    const box = scene.add.container(CARD.x, CARD.y, [g, image]).setDepth(DEPTH.card)
    void FX.popIn(scene, box, { from: 0.5, duration: 360 })
    return wrap(scene, box, w)
}

export interface SoundCard extends Card {
    dance(on: boolean): void
}

/** o cartão de som: o microfone, as barrinhas e o nome do que foi gravado */
export function soundCard(scene: Phaser.Scene, label: string): SoundCard {
    const w = 320
    const h = 220
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.25)
    g.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 22)
    g.fillStyle(C.paper, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
    const icon = uiImage(scene, UI_CELL.sound, 92).setPosition(-w / 2 + 64, -26)
    const bars = scene.add.graphics()
    const text = scene.add
        .text(0, h / 2 - 34, label, { fontFamily: FONT.black, fontSize: `${SIZE.card}px`, color: CSS.ink, align: 'center' })
        .setOrigin(0.5)
        .setResolution(2)
    if (text.width > w - 30) text.setScale((w - 30) / text.width)
    const box = scene.add.container(CARD.x, CARD.y, [g, icon, bars, text]).setDepth(DEPTH.card)
    void FX.popIn(scene, box, { from: 0.5, duration: 360 })

    const state = { t: 0 }
    const paint = (live: boolean) => {
        bars.clear()
        for (let i = 0; i < 8; i++) {
            const k = state.t * 30
            const level = live ? 0.3 + 0.7 * Math.abs(Math.sin(k + i * 1.3)) : 0.45 + 0.4 * Math.abs(Math.sin(i * 1.9))
            const bh = level * 90
            bars.fillStyle(C.mintDark, 1)
            bars.fillRoundedRect(-24 + i * 22, -26 - bh / 2, 12, bh, 4)
        }
    }
    paint(false)
    let tween: Phaser.Tweens.Tween | undefined
    const card = wrap(scene, box, w)
    return {
        ...card,
        dance(on) {
            tween?.remove()
            tween = undefined
            if (on) tween = scene.tweens.add({ targets: state, t: 1, duration: 1000, repeat: -1, onUpdate: () => paint(true) })
            else paint(false)
        },
        async flyTo(x, y, width) {
            tween?.remove()
            await card.flyTo(x, y, width)
        },
        destroy() {
            tween?.remove()
            card.destroy()
        },
    }
}
