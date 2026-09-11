import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, QUERY } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

interface Chip {
    term: string
    root: Phaser.GameObjects.Container
    w: number
}

export function createQuery(scene: Phaser.Scene) {
    const root = scene.add.container(QUERY.x, QUERY.y).setDepth(DEPTH.query)

    const hw = QUERY.w / 2
    const hh = QUERY.h / 2
    const bar = scene.add.graphics()
    bar.fillStyle(C.ink, 0.22)
    bar.fillRoundedRect(-hw + 5, -hh + 8, QUERY.w, QUERY.h, 22)
    bar.fillStyle(C.goldDeep, 1)
    bar.fillRoundedRect(-hw, -hh, QUERY.w, QUERY.h, 22)
    bar.fillStyle(C.white, 1)
    bar.fillRoundedRect(-hw + 5, -hh + 5, QUERY.w - 10, QUERY.h - 10, 18)
    root.add(bar)

    const lens = scene.add.graphics()
    lens.lineStyle(6, C.woodDark, 1)
    lens.strokeCircle(-hw + 40, -3, 13)
    lens.lineBetween(-hw + 49, 6, -hw + 60, 17)
    root.add(lens)

    const shine = scene.add.graphics().setAlpha(0)
    shine.fillStyle(C.gold, 0.5)
    shine.fillRoundedRect(-hw + 5, -hh + 5, 90, QUERY.h - 10, 18)
    root.add(shine)

    let chips: Chip[] = []

    const chipWidth = (term: string) => term.length * 15 + 34

    const layout = () => {
        const total = chips.reduce((sum, chip) => sum + chip.w, 0) + QUERY.chipGap * (chips.length - 1)
        const room = QUERY.w - 90
        const scale = Math.min(1, room / Math.max(total, 1))
        let x = -hw + 74
        chips.forEach(chip => {
            chip.root.setScale(scale)
            chip.root.setX(x + (chip.w * scale) / 2)
            x += chip.w * scale + QUERY.chipGap * scale
        })
    }

    const makeChip = (term: string): Chip => {
        const w = chipWidth(term)
        const container = scene.add.container(0, 0)
        const g = scene.add.graphics()
        g.fillStyle(C.magicDeep, 1)
        g.fillRoundedRect(-w / 2, -QUERY.chipH / 2, w, QUERY.chipH, 12)
        g.fillStyle(C.magic, 1)
        g.fillRoundedRect(-w / 2 + 3, -QUERY.chipH / 2 + 3, w - 6, QUERY.chipH - 8, 9)
        container.add(g)
        container.add(
            scene.add
                .text(0, -1, term, { fontFamily: FONT.black, fontSize: '21px', color: CSS.white })
                .setOrigin(0.5)
                .setResolution(2),
        )
        root.add(container)
        return { term, root: container, w }
    }

    return {
        set(terms: string[]) {
            chips.forEach(chip => chip.root.destroy(true))
            chips = terms.map(makeChip)
            layout()
        },

        async add(term: string, from: { x: number; y: number }) {
            const chip = makeChip(term)
            chips.push(chip)
            layout()

            const target = { x: chip.root.x, y: chip.root.y }
            const scale = chip.root.scaleX
            chip.root.setPosition(from.x - QUERY.x, from.y - QUERY.y).setScale(scale * 1.4)
            await FX.arcTo(scene, chip.root, target, { height: 70, duration: 380 })
            await FX.to(scene, chip.root, { scale }, { duration: 140, ease: 'Back.easeOut' })
        },

        async remove(term: string, to?: { x: number; y: number }) {
            const chip = chips.find(item => item.term === term)
            if (!chip) return
            chips = chips.filter(item => item !== chip)
            if (to) {
                await FX.arcTo(scene, chip.root, { x: to.x - QUERY.x, y: to.y - QUERY.y }, { height: 60, duration: 360 })
                chip.root.destroy(true)
            } else {
                await FX.to(scene, chip.root, { y: -40, alpha: 0, scale: 0.6 }, { duration: 300 })
                chip.root.destroy(true)
            }
            layout()
        },

        async run() {
            shine.setAlpha(1).setX(0)
            await FX.to(scene, shine, { x: QUERY.w - 100 }, { duration: 420, ease: 'Sine.easeInOut' })
            await FX.to(scene, shine, { alpha: 0 }, { duration: 140 })
            shine.setX(0)
        },

        destroy() {
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type Query = ReturnType<typeof createQuery>
