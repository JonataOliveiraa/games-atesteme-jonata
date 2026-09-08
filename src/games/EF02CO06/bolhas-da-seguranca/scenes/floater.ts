import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, FIELD } from '../data/layout'
import { C } from '../data/theme'
import type { FloaterState, Situation } from '../types'
import { createSituationArt } from './situationArt'

function drawLock(g: Phaser.GameObjects.Graphics) {
    const w = 44
    const h = 38
    g.clear()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, 11)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 9)
    g.fillStyle(C.warnDark, 1)
    g.fillCircle(0, 2, 7)
    g.fillRect(-3, 2, 6, 11)
    g.lineStyle(8, C.ink, 1)
    g.beginPath()
    g.arc(0, -h / 2, 13, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false)
    g.strokePath()
    g.lineStyle(5, C.warn, 1)
    g.beginPath()
    g.arc(0, -h / 2, 13, Phaser.Math.DegToRad(180), Phaser.Math.DegToRad(360), false)
    g.strokePath()
}

export interface FloaterOptions {
    situation: Situation
    lane: number
    x: number
    speed: number
    onTap: (floater: Floater) => void
}

export function createFloater(scene: Phaser.Scene, options: FloaterOptions) {
    const root = scene.add.container(options.x, FIELD.lanes[options.lane]).setDepth(DEPTH.item)
    const art = createSituationArt(scene, options.situation, FIELD.item)
    root.add(art)

    const lock = scene.add.graphics().setPosition(0, -FIELD.item * 0.52).setVisible(false)
    drawLock(lock)
    root.add(lock)

    root.setSize(FIELD.hit, FIELD.hit)
    root.setInteractive({ useHandCursor: true })

    let state: FloaterState = 'flying'
    let enabled = true
    let lockPulse: Phaser.Tweens.Tween | null = null
    let bob = 0

    const api = {
        get situation() {
            return options.situation
        },

        get state() {
            return state
        },

        get locked() {
            return state === 'locked'
        },

        get container() {
            return root
        },

        get x() {
            return root.x
        },

        get y() {
            return root.y
        },

        bounds() {
            return { x: root.x, y: root.y, w: FIELD.hit, h: FIELD.hit }
        },

        tick(delta: number) {
            if (state !== 'flying') return
            root.x += options.speed * (delta / 1000)
            bob += delta / 1000
            art.y = Math.sin(bob * 1.6) * 7
            art.angle = Math.sin(bob * 1.1) * 3
        },

        setEnabled(value: boolean) {
            enabled = value
            if (root.input) root.input.enabled = value
        },

        markCaptured() {
            state = 'captured'
            api.setEnabled(false)
            lock.setVisible(false)
            lockPulse?.stop()
            lockPulse = null
        },

        lockHere() {
            if (state !== 'flying') return
            state = 'locked'
            root.x = FIELD.lockX
            lock.setVisible(true).setScale(0.4).setAlpha(0)
            void FX.to(scene, lock, { scale: 1, alpha: 1 }, { duration: 220, ease: Ease.back(2.2) })
            lockPulse = scene.tweens.add({
                targets: lock,
                scale: 1.18,
                duration: FX.ms(scene, 460),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        async leave() {
            if (state !== 'flying') return
            state = 'leaving'
            api.setEnabled(false)
            await FX.to(scene, root, { alpha: 0, x: root.x + 60 }, { duration: 320 })
        },

        pulse() {
            if (state === 'captured') return
            void FX.to(scene, root, { scale: 1.12 }, { duration: 200, yoyo: true, repeat: 1 })
        },

        destroy() {
            lockPulse?.stop()
            scene.tweens.killTweensOf(root)
            scene.tweens.killTweensOf(lock)
            root.destroy(true)
        },
    }

    root.on('pointerdown', () => {
        if (!enabled) return
        options.onTap(api)
    })

    root.setScale(0.4).setAlpha(0)
    void FX.to(scene, root, { scale: 1, alpha: 1 }, { duration: 300, ease: Ease.back(1.8) })

    return api
}

export type Floater = ReturnType<typeof createFloater>
