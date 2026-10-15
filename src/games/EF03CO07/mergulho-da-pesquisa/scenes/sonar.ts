import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CHIP, DEPTH, PANEL, W } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FILTER_FRAME, FILTERS } from '../data/files'
import type { Rect } from '../types'
import { baked } from './bake'

interface Chip {
    word: string
    box: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Image
    icon?: Phaser.GameObjects.Image
    label: Phaser.GameObjects.Text
    zone: Phaser.GameObjects.Zone
    on: boolean
}

export interface Sonar {
    load(words: string[]): void
    selected(): string[]
    reset(): void
    setEnabled(words: string[] | 'all' | 'none'): void
    press(word: string): void
    chipRect(word: string): Rect
    rect(): Rect
    destroy(): void
}

const chipArt = (scene: Phaser.Scene, on: boolean) => {
    const { w, h } = CHIP
    return baked(scene, on ? 'mg-chip-on' : 'mg-chip-off', w + 8, h + 10, g => {
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(4, 7, w, h, 24)
        g.fillStyle(on ? C.pink : C.white, 1)
        g.fillRoundedRect(2, 2, w, h, 24)
        g.lineStyle(on ? 6 : 4, on ? C.lemon : C.lilac, 1)
        g.strokeRoundedRect(2, 2, w, h, 24)
    })
}

const PAD = 16
const TAB = { w: 150, h: 46, rise: 30, label: 24, title: 'FILTRO' } as const

const tabArt = (scene: Phaser.Scene) =>
    baked(scene, 'mg-filter-tab', TAB.w + 4, TAB.h + 4, g => {
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(0, 0, TAB.w, TAB.h, { tl: 18, tr: 18, bl: 0, br: 0 })
    })

const panelArt = (scene: Phaser.Scene, width: number) =>
    baked(scene, `mg-sonar-panel-${width}`, width + 8, PANEL.h + 10, g => {
        g.fillStyle(C.shadow, 0.25)
        g.fillRoundedRect(4, 6, width, PANEL.h, 26)
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(0, 0, width, PANEL.h, 26)
    })

export function createSonar(scene: Phaser.Scene, onToggle: (word: string) => void, single = false): Sonar {
    const top = PANEL.y - PANEL.h / 2
    let width = 0
    const base = scene.add.image(0, top, panelArt(scene, CHIP.w + PAD * 2)).setOrigin(0).setDepth(DEPTH.ui).setScrollFactor(0)
    const tab = scene.add.container(0, top - TAB.rise, [
        scene.add.image(0, 0, tabArt(scene)).setOrigin(0),
        scene.add
            .text(TAB.w / 2, TAB.rise / 2 + 1, TAB.title, { fontFamily: FONT.black, fontSize: `${TAB.label}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2),
    ])
    tab.setDepth(DEPTH.ui).setScrollFactor(0)
    const offKey = chipArt(scene, false)
    const onKey = chipArt(scene, true)
    let chips: Chip[] = []
    let enabled: Set<string> | 'all' = 'all'

    const hasIcon = (word: string) => {
        if (!scene.textures.exists(FILTERS)) return false
        const frame = FILTER_FRAME[word]
        return frame !== undefined && scene.textures.get(FILTERS).has(String(frame))
    }

    const paint = (c: Chip) => {
        c.bg.setTexture(c.on ? onKey : offKey)
        c.label.setColor(c.on ? CSS.white : CSS.ink)
    }

    const toggle = (chip: Chip) => {
        chip.on = !chip.on
        if (single && chip.on)
            chips.forEach(c => {
                if (c !== chip && c.on) {
                    c.on = false
                    paint(c)
                }
            })
        paint(chip)
        void FX.press(scene, chip.box)
    }

    const clear = () => {
        chips.forEach(c => {
            c.zone.destroy()
            c.box.destroy()
        })
        chips = []
    }

    return {
        load(words) {
            clear()
            width = words.length * CHIP.w + (words.length - 1) * CHIP.gap + PAD * 2
            base.setTexture(panelArt(scene, width)).setX(W / 2 - width / 2)
            tab.setX(W / 2 - width / 2 + PAD)
            const startX = W / 2 - width / 2 + PAD + CHIP.w / 2
            chips = words.map((word, i) => {
                const x = startX + i * (CHIP.w + CHIP.gap)
                const bg = scene.add.image(2, 3, offKey)
                const withIcon = hasIcon(word)
                const icon = withIcon ? scene.add.image(0, CHIP.iconY, FILTERS, FILTER_FRAME[word]).setScale(CHIP.icon) : undefined
                const label = scene.add
                    .text(0, withIcon ? CHIP.labelY : 1, word.toUpperCase(), {
                        fontFamily: FONT.black,
                        fontSize: `${withIcon ? CHIP.label : SIZE.chip}px`,
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2)
                const box = scene.add.container(x, PANEL.y, icon ? [bg, icon, label] : [bg, label]).setDepth(DEPTH.ui + 2).setScrollFactor(0)
                const zone = scene.add
                    .zone(x, PANEL.y, CHIP.w + 10, CHIP.h + 16)
                    .setDepth(DEPTH.ui + 3)
                    .setScrollFactor(0)
                    .setInteractive({ useHandCursor: true })
                const chip: Chip = { word, box, bg, icon, label, zone, on: false }
                zone.on('pointerdown', () => {
                    if (enabled !== 'all' && !enabled.has(word)) return
                    toggle(chip)
                    onToggle(word)
                })
                paint(chip)
                return chip
            })
        },
        selected() {
            return chips.filter(c => c.on).map(c => c.word)
        },
        reset() {
            chips.forEach(c => {
                c.on = false
                paint(c)
            })
        },
        setEnabled(words) {
            enabled = words === 'all' ? 'all' : new Set(words === 'none' ? [] : words)
            chips.forEach(c => {
                const on = enabled === 'all' || enabled.has(c.word)
                if (c.zone.input) c.zone.input.enabled = on
            })
        },
        press(word) {
            const chip = chips.find(c => c.word === word)
            if (chip && !chip.on) toggle(chip)
        },
        chipRect(word) {
            const c = chips.find(k => k.word === word)
            return c ? { x: c.box.x, y: c.box.y, w: CHIP.w + 16, h: CHIP.h + 16 } : this.rect()
        },
        rect() {
            return { x: W / 2, y: PANEL.y - TAB.rise / 2, w: width + 10, h: PANEL.h + 10 + TAB.rise }
        },
        destroy() {
            clear()
            tab.destroy()
            base.destroy()
        },
    }
}
