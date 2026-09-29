import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { EXTRA_CELL, EXTRAS, SCENE_ART, type Art2 } from '../data/files'
import { ARRIVAL, DEPTH, targetOf, WINDOW } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import type { FailId, Point, SceneId, WindowState } from '../types'
import { createPic } from './pic'

export interface RecipientWindow {
    enter(scene: SceneId, state: WindowState): Promise<void>
    show(state: WindowState, fail?: FailId): void
    leave(): Promise<void>
    ask(on: boolean): void
    readonly target: Point
    readonly bounds: GuideRect
    readonly scene: SceneId
    destroy(): void
}

const CELL = 512

export function createWindow(scene: Phaser.Scene): RecipientWindow {
    const container = scene.add.container(WINDOW.enterFrom, WINDOW.bottom).setDepth(DEPTH.window).setVisible(false)
    const image = scene.add.image(0, 0, '__MISSING').setOrigin(0.5, 1).setVisible(false)
    const drawn = scene.add.graphics()
    const label = scene.add
        .text(0, -CELL / 2, '', { fontFamily: FONT.body, fontSize: `${SIZE.placeholder + 8}px`, color: CSS.inkSoft })
        .setOrigin(0.5)
        .setResolution(2)
    const sign = createPic(scene, WINDOW.away.x - CELL / 2, WINDOW.away.y - CELL, WINDOW.away.size)
    if (scene.textures.exists(EXTRAS)) sign.set(EXTRAS, EXTRA_CELL.awaySign, 'saiu')
    else {
        const g = scene.add.graphics()
        const s = WINDOW.away.size * 0.4
        g.fillStyle(C.cream, 1)
        g.fillRoundedRect(-s, -s * 0.7, s * 2, s * 1.4, 10)
        g.lineStyle(4, C.ink, 1)
        g.strokeRoundedRect(-s, -s * 0.7, s * 2, s * 1.4, 10)
        g.lineBetween(-s * 0.5, -s * 0.7, 0, -s * 1.2)
        g.lineBetween(s * 0.5, -s * 0.7, 0, -s * 1.2)
        g.fillStyle(C.ink, 1)
        g.fillEllipse(-s * 0.45, s * 0.2, s * 0.35, s * 0.55)
        g.fillEllipse(s * 0.1, -s * 0.15, s * 0.35, s * 0.55)
        g.fillEllipse(s * 0.6, s * 0.2, s * 0.35, s * 0.55)
        sign.container.add(g)
    }
    sign.container.setVisible(false)
    const zzz = [0, 1, 2].map(i =>
        scene.add
            .text(WINDOW.zzz.x - CELL / 2 + i * 26, WINDOW.zzz.y - CELL - i * 30, 'z', {
                fontFamily: FONT.black,
                fontSize: `${34 + i * 8}px`,
                color: CSS.ink,
                stroke: CSS.white,
                strokeThickness: 6,
            })
            .setOrigin(0.5)
            .setResolution(2)
            .setVisible(false),
    )
    let zzzTween: Phaser.Tweens.Tween | undefined
    const setSleeping = (on: boolean) => {
        zzzTween?.remove()
        zzzTween = undefined
        zzz.forEach(z => z.setVisible(on).setAlpha(1))
        if (!on) return
        zzzTween = scene.tweens.add({
            targets: zzz,
            alpha: { from: 0.25, to: 1 },
            y: '-=10',
            duration: 700,
            yoyo: true,
            repeat: -1,
            delay: scene.tweens.stagger(220, {}),
            ease: 'Sine.easeInOut',
        })
    }
    container.add([drawn, image, label, sign.container, ...zzz])

    const r = ARRIVAL.askR
    const askArt = scene.add.graphics()
    askArt.fillStyle(C.shadow, 0.16)
    askArt.fillCircle(3, 5, r)
    askArt.fillStyle(C.white, 1)
    askArt.fillCircle(0, 0, r)
    askArt.fillTriangle(r * 0.2, r * 0.7, r * 0.9, r * 0.2, r * 0.9, r * 1.3)
    askArt.lineStyle(4, C.ink, 1)
    askArt.strokeCircle(0, 0, r)
    const askMark = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const askBubble = scene.add.container(0, 0, [askArt, askMark]).setDepth(DEPTH.window + 1).setVisible(false)
    let askTween: Phaser.Tweens.Tween | undefined

    let current: SceneId = 'friend-near'
    const place = () => WINDOW.place[current]

    const artFor = (state: WindowState, fail?: FailId): Art2 => {
        const set = SCENE_ART[current]
        if (state === 'happy') return set.happy
        if (state === 'fail') {
            const chosen = fail ? set.fail[fail] : undefined
            return chosen ?? Object.values(set.fail)[0] ?? set.wait
        }
        return set.wait
    }

    const paint = (state: WindowState, fail?: FailId) => {
        const away = (current === 'neighbor-away' || current === 'neighbor-away-phone') && state !== 'happy'
        sign.container.setVisible(away)
        setSleeping(current === 'neighbor-asleep' && state !== 'happy')
        const haze = away ? WINDOW.away.tint : place().haze
        const art = artFor(state, fail)
        if (scene.textures.exists(art.key)) {
            image.setTexture(art.key, art.frame).setVisible(true)
            if (haze === null) image.clearTint()
            else image.setTint(haze)
            drawn.clear()
            label.setVisible(false)
            return
        }
        image.setVisible(false)
        drawn.clear()
        drawn.fillStyle(C.cream, 1)
        drawn.fillRect(-CELL * 0.4, -CELL * 0.9, CELL * 0.8, CELL * 0.9)
        drawn.lineStyle(5, C.ink, 1)
        drawn.strokeRect(-CELL * 0.4, -CELL * 0.9, CELL * 0.8, CELL * 0.9)
        label.setVisible(true).setText(`${current}
${fail ?? state}`)
    }

    return {
        async enter(which, state) {
            current = which
            paint(state)
            FX.kill(scene, container)
            const { x, scale, sink } = place()
            container.setVisible(true).setAlpha(1).setScale(scale).setPosition(WINDOW.enterFrom, WINDOW.bottom + sink)
            await FX.to(scene, container, { x }, { duration: WINDOW.enterMs, ease: 'Sine.easeOut' })
        },
        show(state, fail) {
            paint(state, fail)
            FX.kill(scene, container)
            const { x, scale, sink } = place()
            container.setScale(scale).setPosition(x, WINDOW.bottom + sink)
            void FX.to(scene, container, { scaleY: scale * 1.03 }, { duration: 130, yoyo: true, ease: 'Sine.easeOut' })
        },
        ask(on) {
            askTween?.remove()
            askTween = undefined
            FX.kill(scene, askBubble)
            if (!on) {
                askBubble.setVisible(false)
                return
            }
            const p = this.target
            askBubble.setPosition(p.x + ARRIVAL.askDx, p.y + ARRIVAL.askDy).setVisible(true).setScale(1).setAngle(0)
            void FX.popIn(scene, askBubble, { from: 0.3 }).then(() => {
                if (!askBubble.visible) return
                askTween = scene.tweens.add({
                    targets: askBubble,
                    angle: { from: -8, to: 8 },
                    duration: 420,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            })
        },
        async leave() {
            FX.kill(scene, container)
            await FX.to(scene, container, { x: WINDOW.enterFrom }, { duration: WINDOW.enterMs * 0.7, ease: 'Sine.easeIn' })
            if (container.active) container.setVisible(false)
        },
        get bounds() {
            const { x, scale, sink } = place()
            const size = CELL * scale
            return { x, y: WINDOW.bottom + sink - size / 2, w: size, h: size }
        },
        get scene() {
            return current
        },
        get target() {
            return targetOf(current)
        },
        destroy() {
            askTween?.remove()
            zzzTween?.remove()
            FX.kill(scene, [container, askBubble])
            askBubble.destroy()
            container.destroy()
        },
    }
}
