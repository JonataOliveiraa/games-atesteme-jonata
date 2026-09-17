import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BENCH, carrySlots, chipSlots, DEPTH, pinSlots, STRIP } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Hint, Swimmer, Trait } from '../types'
import { TEX } from './BootScene'

export interface RosterState {
    list: Swimmer[]
    bench: Swimmer[]
    carried?: Swimmer
    benchLocked: boolean
}

export interface RosterOptions {
    onChip(index: number): void
    onBenchChip(index: number): void
    onPin(index: number): void
    onBench(): void
    onCarried(): void
}

export interface Roster {
    render(state: RosterState, animate?: boolean): void
    renumber(onStep?: (i: number) => void): Promise<void>
    setEnabled(on: boolean): void
    chipPoint(index: number): { x: number; y: number }
    pinPoint(index: number): { x: number; y: number }
    benchPoint(): { x: number; y: number }
    blink(hint: Hint): void
    /** Acende a ficha de quem está na água agora. `undefined` apaga todas. */
    highlight(index: number | undefined): void
    destroy(): void
}

const CHIP_H = STRIP.h
const BENCH_SCALE = 0.62

function drawTrait(g: Phaser.GameObjects.Graphics, trait: Trait, cx: number, cy: number, r: number) {
    g.fillStyle(C.white, 1)
    g.fillCircle(cx, cy, r)
    g.fillStyle(C.ink, 1)

    if (trait === 'listrada') {
        for (let i = -1; i <= 1; i++) g.fillRect(cx - 9 + i * 7, cy - 9, 4, 18)
        return
    }
    if (trait === 'oculos') {
        g.fillCircle(cx - 7, cy, 6)
        g.fillCircle(cx + 7, cy, 6)
        g.fillRect(cx - 2, cy - 2, 4, 4)
        return
    }
    if (trait === 'alta') {
        g.fillTriangle(cx, cy - 11, cx - 9, cy - 1, cx + 9, cy - 1)
        g.fillRect(cx - 3, cy - 1, 6, 12)
        return
    }
    if (trait === 'ruiva') {
        g.fillCircle(cx, cy - 4, 7)
        g.fillRoundedRect(cx - 4, cy + 1, 8, 11, 4)
        return
    }
    if (trait === 'chama') {
        g.fillTriangle(cx, cy - 12, cx - 8, cy + 8, cx + 8, cy + 8)
        g.fillStyle(C.white, 1)
        g.fillTriangle(cx, cy - 2, cx - 4, cy + 8, cx + 4, cy + 8)
        return
    }
    g.fillCircle(cx - 7, cy - 4, 4)
    g.fillCircle(cx + 6, cy - 6, 4)
    g.fillCircle(cx - 1, cy + 6, 4)
}

interface Chip {
    root: Phaser.GameObjects.Container
    body: Phaser.GameObjects.Graphics
    face?: Phaser.GameObjects.Sprite
    number: Phaser.GameObjects.Text
    name: Phaser.GameObjects.Text
    width: number
    paint(width: number, lifted: boolean): void
}

export function createRoster(scene: Phaser.Scene, options: RosterOptions): Roster {
    const root = scene.add.container(0, 0).setDepth(DEPTH.chip)
    const deck = scene.add.graphics().setDepth(DEPTH.deck)
    const pins = scene.add.graphics().setDepth(DEPTH.deck + 1)

    const chips = new Map<string, Chip>()
    const zones: Phaser.GameObjects.Zone[] = []
    const pinZones: Phaser.GameObjects.Zone[] = []
    let enabled = false
    let current: RosterState = { list: [], bench: [], benchLocked: false }

    const benchCX = BENCH.x + BENCH.w / 2
    const benchCY = BENCH.y + BENCH.h / 2

    const paintBench = () => {
        deck.clear()
        deck.fillStyle(C.ink, A.shadow)
        deck.fillRoundedRect(BENCH.x + 4, BENCH.y + 8, BENCH.w, BENCH.h, 20)
        deck.fillStyle(C.tile, 1)
        deck.fillRoundedRect(BENCH.x, BENCH.y, BENCH.w, BENCH.h, 20)
        deck.fillStyle(C.ink, current.benchLocked ? 0.16 : 0.08)
        deck.fillRoundedRect(BENCH.x + 10, BENCH.y + 10, BENCH.w - 20, BENCH.h - 20, 14)

        deck.fillStyle(C.rope, 1)
        deck.fillRoundedRect(BENCH.x + 18, BENCH.y + BENCH.h - 46, BENCH.w - 36, 12, 6)
        deck.fillStyle(C.ink, 0.35)
        deck.fillRect(BENCH.x + 30, BENCH.y + BENCH.h - 34, 10, 22)
        deck.fillRect(BENCH.x + BENCH.w - 40, BENCH.y + BENCH.h - 34, 10, 22)

        if (current.benchLocked) {
            deck.fillStyle(C.ink, 0.75)
            deck.fillRoundedRect(benchCX - 16, benchCY - 8, 32, 26, 6)
            deck.lineStyle(6, C.ink, 0.75)
            deck.strokeCircle(benchCX, benchCY - 10, 11)
        }
    }

    const makeChip = (who: Swimmer): Chip => {
        const container = scene.add.container(0, 0)
        const body = scene.add.graphics()
        container.add(body)

        const face = scene.textures.exists(TEX.face)
            ? scene.add.sprite(0, 0, TEX.face, who.frame)
            : undefined
        if (face) container.add(face)

        const number = scene.add
            .text(0, 0, '', { fontFamily: FONT.black, fontSize: '34px', color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        number.setStroke(CSS.ink, 6)
        container.add(number)

        const name = scene.add
            .text(0, 0, who.name, { fontFamily: FONT.black, fontSize: '22px', color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        container.add(name)

        root.add(container)

        const chip: Chip = {
            root: container,
            body,
            face,
            number,
            name,
            width: 0,
            paint: (width, lifted) => {
                const h = CHIP_H
                const half = width / 2
                chip.width = width

                body.clear()
                body.fillStyle(C.ink, A.shadow)
                body.fillRoundedRect(-half + 4, -h / 2 + 8, width, h, 18)
                body.fillStyle(C.ink, 1)
                body.fillRoundedRect(-half, -h / 2, width, h, 18)
                body.fillStyle(lifted ? C.cardLift : C.card, 1)
                body.fillRoundedRect(-half + 4, -h / 2 + 4, width - 8, h - 8, 15)
                body.fillStyle(who.color, 1)
                body.fillRoundedRect(-half + 4, -h / 2 + 4, width - 8, h - 54, 15)
                body.fillStyle(C.white, 0.18)
                body.fillRoundedRect(-half + 12, -h / 2 + 12, width - 24, 16, 8)

                drawTrait(body, who.trait, half - 26, -h / 2 + 26, 15)

                body.fillStyle(C.ink, 1)
                body.fillCircle(-half + 26, -h / 2 + 26, 19)

                if (face) {
                    const faceH = h - 62
                    face.setDisplaySize(faceH * 0.75, faceH)
                    face.setPosition(0, -h / 2 + 4 + faceH / 2)
                }

                number.setPosition(-half + 26, -h / 2 + 25)
                name.setPosition(0, h / 2 - 24)
                name.setFontSize(width < 150 ? 18 : 22)
            },
        }

        chip.paint(150, false)
        return chip
    }

    const chipOf = (who: Swimmer) => {
        let chip = chips.get(who.id)
        if (!chip) {
            chip = makeChip(who)
            chips.set(who.id, chip)
        }
        return chip
    }

    const ensureZones = (count: number) => {
        while (zones.length < count) {
            const zone = scene.add.zone(0, 0, 10, 10).setOrigin(0.5).setDepth(DEPTH.chip + 1)
            zone.setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (!enabled) return
                const kind = zone.getData('kind') as string
                const i = zone.getData('index') as number
                if (kind === 'chip') options.onChip(i)
                else if (kind === 'bench') {
                    // Com alguém na mão, a ficha do banco deixa de ser um item
                    // e passa a ser o próprio banco: o toque ali é SAIR.
                    if (current.carried) options.onBench()
                    else options.onBenchChip(i)
                } else if (kind === 'carried') options.onCarried()
            })
            zones.push(zone)
        }
        zones.forEach((zone, i) => {
            const on = i < count
            zone.setVisible(on)
            if (zone.input) zone.input.enabled = on && enabled
        })
    }

    const pinLabels: Phaser.GameObjects.Text[] = []
    const pinLabel = (i: number) => {
        while (pinLabels.length <= i) {
            const label = scene.add
                .text(0, 0, '', { fontFamily: FONT.black, fontSize: '30px', color: CSS.white })
                .setOrigin(0.5)
                .setResolution(2)
                .setDepth(DEPTH.deck + 2)
                .setVisible(false)
            label.setStroke(CSS.ink, 6)
            pinLabels.push(label)
        }
        return pinLabels[i]
    }

    const ensurePinZones = (count: number) => {
        while (pinZones.length < count) {
            const zone = scene.add.zone(0, 0, 10, 10).setOrigin(0.5).setDepth(DEPTH.deck + 2)
            zone.setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (!enabled) return
                options.onPin(zone.getData('index') as number)
            })
            pinZones.push(zone)
        }
        pinZones.forEach((zone, i) => {
            const on = i < count
            zone.setVisible(on)
            if (zone.input) zone.input.enabled = on && enabled
        })
    }

    const benchZone = scene.add
        .zone(benchCX, benchCY, BENCH.w + 12, BENCH.h + 12)
        .setOrigin(0.5)
        .setDepth(DEPTH.deck + 2)
        .setInteractive({ useHandCursor: true })
    benchZone.on('pointerdown', () => {
        if (!enabled) return
        options.onBench()
    })

    const render = (state: RosterState, animate = true) => {
        current = state
        paintBench()

        const carry = state.carried ? carrySlots(state.list.length) : undefined
        const slots = carry ? carry.chips : chipSlots(state.list.length)
        const cy = STRIP.y + CHIP_H / 2
        let zoneIndex = 0
        ensureZones(state.list.length + state.bench.length + (state.carried ? 1 : 0))

        state.list.forEach((who, i) => {
            const chip = chipOf(who)
            const slot = slots[i]
            chip.paint(slot.w, false)
            chip.root.setScale(carry ? 0.86 : 1).setAlpha(1).setDepth(DEPTH.chip)
            chip.number.setText(`${i + 1}`)
            chip.number.setVisible(true)
            chip.name.setVisible(true)

            if (animate) {
                void FX.to(scene, chip.root, { x: slot.x, y: cy }, { duration: 260, ease: 'Back.easeOut' })
            } else {
                chip.root.setPosition(slot.x, cy)
            }

            // Com alguém na mão a ficha deixa de ser alvo: quem manda na tira
            // são os pinos, e a zona dela não pode comer o toque deles.
            const zone = zones[zoneIndex++]
            zone.setPosition(slot.x, cy).setSize(slot.w, CHIP_H)
            zone.setData('kind', 'chip').setData('index', i)
            zone.setVisible(!carry)
            if (zone.input) zone.input.enabled = !carry && enabled
        })

        state.bench.forEach((who, i) => {
            const chip = chipOf(who)
            chip.paint(124, false)
            chip.number.setVisible(false)
            chip.name.setVisible(true)
            const x = benchCX + (i - (state.bench.length - 1) / 2) * 26
            const y = benchCY - 6
            chip.root.setScale(BENCH_SCALE).setAlpha(1).setDepth(DEPTH.chip - 1 + i)
            if (animate) void FX.to(scene, chip.root, { x, y }, { duration: 260, ease: 'Back.easeOut' })
            else chip.root.setPosition(x, y)

            const zone = zones[zoneIndex++]
            const w = 124 * BENCH_SCALE
            zone.setPosition(x, y).setSize(w, CHIP_H * BENCH_SCALE)
            zone.setData('kind', 'bench').setData('index', i)
        })

        pins.clear()
        if (state.carried) {
            const chip = chipOf(state.carried)
            const w = chipSlots(Math.max(state.list.length, 1))[0]?.w ?? 150
            chip.paint(w, true)
            chip.number.setVisible(false)
            chip.root.setDepth(DEPTH.carried).setScale(0.92).setAlpha(1)
            const x = Phaser.Math.Clamp(chip.root.x, STRIP.x0, STRIP.x1)
            const lift = STRIP.y - 108
            void FX.to(scene, chip.root, { x, y: lift }, { duration: 220, ease: 'Back.easeOut' })

            const zone = zones[zoneIndex++]
            zone.setPosition(x, lift).setSize(w, CHIP_H)
            zone.setData('kind', 'carried').setData('index', -1)

            const slotList = carry ? carry.pins : pinSlots(state.list.length)
            ensurePinZones(slotList.length)
            slotList.forEach((slot, i) => {
                pins.fillStyle(C.ink, 0.22)
                pins.fillRoundedRect(slot.x - slot.w / 2 + 3, STRIP.y + 14, slot.w, CHIP_H - 28, 14)
                pins.fillStyle(C.pin, 0.95)
                pins.fillRoundedRect(slot.x - slot.w / 2, STRIP.y + 10, slot.w, CHIP_H - 28, 14)
                pins.fillStyle(C.white, 0.35)
                pins.fillRoundedRect(slot.x - slot.w / 2 + 8, STRIP.y + 18, slot.w - 16, 12, 6)

                const label = pinLabel(i)
                label.setText(`${i + 1}º`)
                label.setPosition(slot.x, STRIP.y + CHIP_H / 2 - 4)
                label.setVisible(true)

                const zonePin = pinZones[i]
                const tile = carry?.pinHit ?? STRIP.w / slotList.length
                zonePin.setPosition(slot.x, STRIP.y + CHIP_H / 2).setSize(tile, CHIP_H)
                zonePin.setData('index', i)
            })
            pinLabels.forEach((label, i) => label.setVisible(i < slotList.length))
        } else {
            ensurePinZones(0)
            pinLabels.forEach(label => label.setVisible(false))
        }
    }

    const setEnabled = (on: boolean) => {
        enabled = on
        zones.forEach(zone => {
            if (zone.input) zone.input.enabled = on && zone.visible
        })
        pinZones.forEach(zone => {
            if (zone.input) zone.input.enabled = on && zone.visible
        })
        if (benchZone.input) benchZone.input.enabled = on
    }

    return {
        render,
        setEnabled,

        renumber: async onStep => {
            const list = current.list
            await FX.stagger(scene, list.map(who => chipOf(who).number), async (text, i) => {
                onStep?.(i)
                await FX.to(scene, text, { scaleY: 0 }, { duration: 90 })
                text.setText(`${i + 1}`)
                await FX.to(scene, text, { scaleY: 1 }, { duration: 140, ease: 'Back.easeOut' })
            }, 90)
        },

        chipPoint: index => {
            const who = current.list[index]
            const chip = who ? chips.get(who.id) : undefined
            return { x: chip?.root.x ?? STRIP.x0, y: chip?.root.y ?? STRIP.y + CHIP_H / 2 }
        },

        pinPoint: index => {
            const slots = pinSlots(current.list.length)
            const slot = slots[Math.min(index, slots.length - 1)]
            return { x: slot?.x ?? STRIP.x0, y: STRIP.y + CHIP_H / 2 }
        },

        benchPoint: () => ({ x: benchCX, y: benchCY }),

        highlight: index => {
            current.list.forEach((who, i) => {
                const chip = chips.get(who.id)
                if (!chip) return
                const on = i === index
                FX.kill(scene, chip.root)
                void FX.to(scene, chip.root, {
                    scale: on ? 1.08 : 1,
                    y: STRIP.y + CHIP_H / 2 - (on ? 16 : 0),
                }, { duration: 200, ease: 'Back.easeOut' })
            })
        },

        blink: hint => {
            if (hint.kind === 'chip') {
                const who = current.list[hint.index]
                const chip = who ? chips.get(who.id) : undefined
                if (chip) void FX.to(scene, chip.root, { scale: 1.1 }, { duration: 220, yoyo: true, repeat: 3 })
                return
            }
            const point = hint.kind === 'bench'
                ? { x: benchCX, y: benchCY }
                : { x: pinSlots(current.list.length)[hint.index]?.x ?? benchCX, y: STRIP.y + CHIP_H / 2 }
            void FX.ping(scene, point.x, point.y, C.pin, { radius: 90 })
        },

        destroy: () => {
            zones.forEach(zone => zone.destroy())
            pinZones.forEach(zone => zone.destroy())
            pinLabels.forEach(label => label.destroy())
            benchZone.destroy()
            pins.destroy()
            deck.destroy()
            root.destroy(true)
        },
    }
}
