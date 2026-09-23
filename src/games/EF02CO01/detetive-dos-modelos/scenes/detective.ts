import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT } from '../data/theme'
import { BUBBLE, DEPTH, DETECTIVE } from '../data/layout'

const fx = (o: unknown) => o as unknown as FxTarget

export type Mood = 'watch' | 'think' | 'smile' | 'cheer'

const FRAME: Record<Mood, number> = { watch: 0, think: 1, smile: 2, cheer: 3 }

export function createDetective(scene: Phaser.Scene) {
    const holder = scene.add.container(DETECTIVE.x, DETECTIVE.y).setDepth(DEPTH.detective)

    let sprite: Phaser.GameObjects.Sprite | undefined
    if (scene.textures.exists('detetive')) {
        sprite = scene.add.sprite(0, 0, 'detetive', 0)
        sprite.setDisplaySize(DETECTIVE.size, DETECTIVE.size)
        holder.add(sprite)
    } else {
        const g = scene.add.graphics()
        g.fillStyle(C.ink, 1)
        g.fillCircle(0, 0, DETECTIVE.size * 0.4)
        g.fillStyle(C.creamDeep, 1)
        g.fillCircle(0, -4, DETECTIVE.size * 0.34)
        g.fillStyle(C.ink, 1)
        g.fillCircle(-DETECTIVE.size * 0.12, -DETECTIVE.size * 0.06, 9)
        g.fillCircle(DETECTIVE.size * 0.12, -DETECTIVE.size * 0.06, 9)
        holder.add(g)
    }

    FX.float(scene, fx(holder), { amount: 7, duration: 2400 })

    const bubble = scene.add.container(BUBBLE.left + BUBBLE.w / 2, BUBBLE.cy)
        .setDepth(DEPTH.fx)
        .setAlpha(0)
        .setScale(0.8)
    const skin = scene.add.graphics()
    const text = scene.add.text(0, 0, '', {
        fontFamily: FONT.black,
        fontSize: '25px',
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: BUBBLE.w - 34 },
        lineSpacing: 2,
    }).setOrigin(0.5).setResolution(2)
    bubble.add([skin, text])

    const PAD = 18

    /**
     * A detetive é enfeite: ela reage, não ensina. O balão é sempre do mesmo
     * creme e só diz bobagem ("Oba!", "Eita!"). Quem explica o erro é a
     * animação do teste, com o veículo caindo, afundando ou travando.
     */
    function paint() {
        const w = Math.min(BUBBLE.w, Math.max(120, text.width + 56))
        const h = PAD * 2 + text.height + 6
        const top = Math.max(BUBBLE.minTop, BUBBLE.cy - h / 2)
        const cy = top + h / 2
        bubble.setPosition(BUBBLE.left + w / 2, cy)

        // a ponta sai da lateral esquerda na altura da boca, presa dentro do balão
        const tipY = BUBBLE.tailY - cy
        const baseY = Phaser.Math.Clamp(tipY - 20, -h / 2 + 20, h / 2 - 58)
        const tipX = BUBBLE.tailX - (BUBBLE.left + w / 2)

        skin.clear()
        skin.fillStyle(C.ink, 0.28)
        skin.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 24)
        skin.fillStyle(C.ink, 1)
        skin.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
        skin.fillTriangle(-w / 2 + 8, baseY - 4, -w / 2 + 8, baseY + 44, tipX - 8, tipY + 3)
        skin.fillStyle(C.creamEdge, 1)
        skin.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12, 18)
        skin.fillStyle(C.cream, 1)
        skin.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 18, 18)
        skin.fillTriangle(-w / 2 + 12, baseY + 4, -w / 2 + 12, baseY + 34, tipX + 6, tipY + 1)

        text.setPosition(0, -3)
        return { w, h }
    }

    return {
        mood(next: Mood) {
            sprite?.setFrame(FRAME[next])
            void FX.to(scene, fx(holder), { scale: 1.07 },
                { duration: 190, yoyo: true, ease: 'Sine.easeOut' })
        },

        say(line: string) {
            text.setText(line)
            paint()
            FX.kill(scene, fx(bubble))
            void FX.to(scene, fx(bubble), { alpha: 1, scale: 1 },
                { duration: 220, ease: Ease.back(2.2) })
        },

        hush() {
            FX.kill(scene, fx(bubble))
            void FX.to(scene, fx(bubble), { alpha: 0, scale: 0.85 }, { duration: 180 })
        },

        destroy() {
            FX.kill(scene, fx(holder))
            FX.kill(scene, fx(bubble))
            bubble.destroy()
            holder.destroy()
        },
    }
}
