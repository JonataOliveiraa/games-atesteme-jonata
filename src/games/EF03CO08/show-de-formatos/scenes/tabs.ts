import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, TAB } from '../data/layout'
import { LAYER_NAME, LAYER_ORDER } from '../data/rules'
import { C, CSS, FONT, LAYER_COLOR } from '../data/theme'
import type { LayerId } from '../types'

type State = 'empty' | 'open' | 'filled'

function paintIcon(g: Phaser.GameObjects.Graphics, layer: LayerId, tone: number) {
    g.clear()
    if (layer === 'image') {
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-19, -15, 38, 30, 7)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-16, -12, 32, 24, 5)
        g.fillStyle(C.glow, 1)
        g.fillCircle(7, -5, 4)
        g.fillStyle(C.ink, 0.75)
        g.fillTriangle(-16, 12, -2, -4, 12, 12)
        return
    }
    if (layer === 'text') {
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-19, -16, 38, 27, 8)
        g.fillTriangle(-8, 9, -1, 9, -10, 17)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-16, -13, 32, 21, 6)
        g.fillStyle(C.ink, 0.8)
        for (let i = 0; i < 3; i++) g.fillRoundedRect(-11, -8 + i * 6, i === 2 ? 13 : 22, 3, 2)
        return
    }
    for (let i = 0; i < 4; i++) {
        const h = [12, 24, 17, 28][i]
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-19 + i * 10 - 1, -h / 2 - 1, 9, h + 2, 4)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-19 + i * 10, -h / 2, 7, h, 3)
    }
}

export function createTabs(scene: Phaser.Scene, onPick: (layer: LayerId) => void) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.tab)
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = false

    const state: State[] = ['empty', 'empty', 'empty']
    const span = TAB.w * 3 + TAB.gap * 2
    const xOf = (index: number) => TAB.cx - span / 2 + TAB.w / 2 + index * (TAB.w + TAB.gap)

    const tabs = LAYER_ORDER.map((layer, index) => {
        const x = xOf(index)
        const holder = scene.add.container(x, TAB.cy)
        const face = scene.add.graphics()
        const icon = scene.add.graphics().setPosition(-TAB.w / 2 + 34, 0)
        const name = scene.add
            .text(-TAB.w / 2 + 60, 1, LAYER_NAME[layer], {
                fontFamily: FONT.black,
                fontSize: '19px',
                color: CSS.ink,
            })
            .setOrigin(0, 0.5)
            .setResolution(2)
        holder.add([face, icon, name])
        root.add(holder)

        const zone = scene.add
            .zone(x, TAB.cy, TAB.w + 10, TAB.h + 14)
            .setOrigin(0.5)
            .setDepth(DEPTH.tab + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (enabled && state[index] === 'filled') onPick(layer)
        })
        zones.push(zone)

        return { layer, holder, face, icon, name }
    })

    let pulse: Phaser.Tweens.Tween | null = null

    const paint = (index: number) => {
        const tab = tabs[index]
        const tone = LAYER_COLOR[tab.layer]
        const value = state[index]
        const { w, h } = TAB
        tab.face.clear()
        tab.face.fillStyle(C.ink, 1)
        tab.face.fillRoundedRect(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6, h / 2 + 3)
        tab.face.fillStyle(value === 'empty' ? C.creamDeep : tone.deep, 1)
        tab.face.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        tab.face.fillStyle(value === 'empty' ? C.cream : tone.fill, 1)
        tab.face.fillRoundedRect(-w / 2, -h / 2, w, h - 7, h / 2)
        tab.face.fillStyle(C.white, 0.32)
        tab.face.fillRoundedRect(-w / 2 + 14, -h / 2 + 7, w - 28, 9, 5)
        paintIcon(tab.icon, tab.layer, value === 'empty' ? C.creamDeep : C.white)
        tab.name.setColor(value === 'empty' ? CSS.inkSoft : CSS.white)
        tab.name.setStroke(CSS.ink, value === 'empty' ? 0 : 4)
        tab.holder.setAlpha(value === 'empty' ? 0.82 : 1)
    }

    tabs.forEach((_, index) => paint(index))

    const stopPulse = () => {
        pulse?.remove()
        pulse = null
        tabs.forEach(tab => tab.holder.setScale(1))
    }

    return {
        set(layer: LayerId, value: State) {
            const index = LAYER_ORDER.indexOf(layer)
            state[index] = value
            paint(index)
        },

        reset() {
            stopPulse()
            state.forEach((_, index) => {
                state[index] = 'empty'
                paint(index)
            })
        },

        highlight(layer: LayerId | null) {
            stopPulse()
            if (!layer) return
            const tab = tabs[LAYER_ORDER.indexOf(layer)]
            pulse = scene.tweens.add({
                targets: tab.holder,
                scale: 1.07,
                duration: FX.ms(scene, 540),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        },

        setEnabled(value: boolean) {
            enabled = value
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
        },

        async fade(visible: boolean) {
            if (!visible) {
                enabled = false
                zones.forEach(zone => {
                    if (zone.input) zone.input.enabled = false
                })
            }
            await FX.to(scene, root, { alpha: visible ? 1 : 0, y: visible ? 0 : 46 }, { duration: 320 })
        },

        posOf(layer: LayerId) {
            const tab = tabs[LAYER_ORDER.indexOf(layer)]
            return { x: tab.holder.x, y: tab.holder.y }
        },

        bounds() {
            return { x: TAB.cx, y: TAB.cy, w: span + 36, h: TAB.h + 34 }
        },

        destroy() {
            stopPulse()
            scene.tweens.killTweensOf(root)
            zones.forEach(zone => zone.destroy())
            root.destroy(true)
        },
    }
}

export type Tabs = ReturnType<typeof createTabs>
