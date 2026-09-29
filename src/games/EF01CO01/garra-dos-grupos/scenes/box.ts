import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MACHINE, MACHINE_CELL } from '../data/files'
import { BOX, CLAW, DEPTH } from '../data/layout'
import { A, C } from '../data/theme'
import { SIZE_SCALE } from '../data/items'
import type { Rule } from '../types'
import { throwInto } from './flight'
import { createFeatureIcon, createRuleIcon } from './icons'
import type { ItemView } from './tray'

export interface Box {
    readonly container: Phaser.GameObjects.Container
    readonly x: number
    readonly mouthY: number
    slotPos(i: number): { x: number; y: number }
    catch(view: ItemView, slot: number, ok: boolean, rule: Rule): Promise<void>
    reset(perBox: number): void
    tie(): Promise<void>
    glowSlot(i: number | null): void
    items(): ItemView[]
    clear(): void
    destroy(): void
}

const BASE_Y = BOX.baseY
const ART_SCALE = BOX.w / BOX.artW

function paintBack(g: Phaser.GameObjects.Graphics) {
    const l = -BOX.w / 2
    const t = -BOX.h
    g.fillStyle(C.shadow, A.shadow)
    g.fillEllipse(0, 6, BOX.w + 30, 34)
    g.fillStyle(C.box, 0.55)
    g.fillRoundedRect(l, t, BOX.w, BOX.h, 22)
    g.lineStyle(5, C.boxLine, 1)
    g.strokeRoundedRect(l, t, BOX.w, BOX.h, 22)
    g.fillStyle(C.boxLine, 0.35)
    g.fillRoundedRect(l + 14, -30, BOX.w - 28, 22, 10)
}

function paintFront(g: Phaser.GameObjects.Graphics) {
    const l = -BOX.w / 2
    g.fillStyle(C.box, 0.22)
    g.fillRoundedRect(l, -BOX.h * 0.42, BOX.w, BOX.h * 0.42, { tl: 0, tr: 0, bl: 22, br: 22 })
    g.lineStyle(6, C.boxLine, 1)
    g.strokeRoundedRect(l, -BOX.h, BOX.w, BOX.h, 22)
    g.lineStyle(4, C.boxLine, 0.8)
    g.lineBetween(l + 4, -BOX.h * 0.42, l + BOX.w - 4, -BOX.h * 0.42)
    g.fillStyle(C.white, 0.5)
    g.fillRoundedRect(l + 18, -BOX.h + 20, 14, BOX.h * 0.46, 7)
}

function paintBow(g: Phaser.GameObjects.Graphics) {
    const fill = C.cabinetLight
    g.fillStyle(C.cabinetDark, 1)
    g.fillTriangle(0, 0, -62, -34, -62, 34)
    g.fillTriangle(0, 0, 62, -34, 62, 34)
    g.fillStyle(fill, 1)
    g.fillTriangle(-4, 0, -56, -28, -56, 28)
    g.fillTriangle(4, 0, 56, -28, 56, 28)
    g.fillStyle(C.cabinetDark, 1)
    g.fillCircle(0, 0, 18)
    g.fillStyle(fill, 1)
    g.fillCircle(0, 0, 13)
}

export function createBox(scene: Phaser.Scene, initialPerBox: number): Box {
    let perBox = initialPerBox
    const hasArt = scene.textures.exists(MACHINE)
    const back = hasArt
        ? scene.add.image(0, 0, MACHINE, MACHINE_CELL.boxBack).setOrigin(0.5, BOX.artBaseY / CLAW.cell).setScale(ART_SCALE)
        : (() => {
              const g = scene.add.graphics()
              paintBack(g)
              return g
          })()
    const front = hasArt
        ? scene.add.image(0, 0, MACHINE, MACHINE_CELL.boxFront).setOrigin(0.5, BOX.artBaseY / CLAW.cell).setScale(ART_SCALE)
        : (() => {
              const g = scene.add.graphics()
              paintFront(g)
              return g
          })()

    const container = scene.add.container(BOX.cx, BASE_Y, [back]).setDepth(DEPTH.box)
    const frontBox = scene.add.container(BOX.cx, BASE_Y, [front]).setDepth(DEPTH.boxFront)
    const rings = scene.add.graphics().setDepth(DEPTH.boxFront + 1)

    let filled: boolean[] = Array.from({ length: perBox }, () => false)
    let inside: ItemView[] = []
    let next: number | null = null
    let ribbon: Phaser.GameObjects.Container | undefined
    let mark: Phaser.GameObjects.Container | undefined
    const pulse = { a: 1 }
    const pulseTween = scene.tweens.add({
        targets: pulse,
        a: 0.25,
        duration: 520,
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
            if (next !== null) paintRings()
        },
    })

    const ringX = (i: number) => BOX.cx + (i - (perBox - 1) / 2) * BOX.slotGap

    function paintRings() {
        rings.clear()
        filled.forEach((on, i) => {
            const x = ringX(i)
            const y = BOX.slotY
            if (on) {
                rings.fillStyle(C.goldDark, 1)
                rings.fillCircle(x, y + 3, BOX.slotR)
                rings.fillStyle(C.gold, 1)
                rings.fillCircle(x, y, BOX.slotR)
                rings.fillStyle(C.white, 0.9)
                const pts: Phaser.Math.Vector2[] = []
                for (let k = 0; k < 10; k++) {
                    const r = k % 2 ? 4 : 9
                    const a = -Math.PI / 2 + (k * Math.PI) / 5
                    pts.push(new Phaser.Math.Vector2(x + Math.cos(a) * r, y + Math.sin(a) * r))
                }
                rings.fillPoints(pts, true)
                return
            }
            rings.fillStyle(C.white, 0.75)
            rings.fillCircle(x, y, BOX.slotR)
            const glow = i === next
            rings.lineStyle(glow ? 5 : 3, glow ? C.gold : C.boxLine, glow ? 0.4 + 0.6 * pulse.a : 1)
            for (let k = 0; k < 8; k++) {
                const a = (k * Math.PI) / 4
                rings.beginPath()
                rings.arc(x, y, BOX.slotR, a, a + Math.PI / 6)
                rings.strokePath()
            }
        })
    }
    paintRings()

    const slotPos = (i: number) => {
        const perRow = 3
        const row = Math.floor(i / perRow)
        const inRow = Math.min(perRow, perBox - row * perRow)
        const col = i % perRow
        return {
            x: BOX.cx + (col - (inRow - 1) / 2) * BOX.colGap,
            y: BASE_Y - 62 - row * BOX.rowGap,
        }
    }

    const clear = () => {
        inside.forEach(v => v.destroy())
        inside = []
        filled = Array.from({ length: perBox }, () => false)
        next = null
        ribbon?.destroy()
        ribbon = undefined
        mark?.destroy()
        mark = undefined
        paintRings()
    }

    const createMark = (view: ItemView, rule: Rule) => {
        const bg = scene.add.graphics()
        bg.fillStyle(C.shadow, 0.25)
        bg.fillRoundedRect(-96, -38, 192, 82, 30)
        bg.fillStyle(C.amberDark, 1)
        bg.fillRoundedRect(-100, -44, 200, 84, 32)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-94, -38, 188, 72, 28)
        const sign = scene.add.graphics()
        sign.lineStyle(7, C.ink, 1)
        sign.lineBetween(-15, -10, 15, -10)
        sign.lineBetween(-15, 6, 15, 6)
        sign.lineStyle(7, C.amberDark, 1)
        sign.lineBetween(9, -22, -9, 18)
        const own = createFeatureIcon(scene, view, rule, 18).setPosition(-52, 0)
        const want = createRuleIcon(scene, rule, 18).setPosition(52, 0)
        return scene.add
            .container(BOX.cx, BASE_Y - BOX.h - 52, [bg, own, sign, want])
            .setDepth(DEPTH.boxFront + 3)
    }

    return {
        container,
        x: BOX.cx,
        mouthY: BOX.mouthY,
        slotPos,
        async catch(view, slot, ok, rule) {
            inside.push(view)
            view.setGlow(false)
            const p = slotPos(slot)
            const depth = DEPTH.box + 1 + slot * 0.01 - Math.floor(slot / 3) * 0.1
            await throwInto(scene, view, { x: p.x, y: p.y, scale: BOX.itemScale * SIZE_SCALE[view.size], depth })
            if (ok) {
                await FX.to(scene, view.container, { y: p.y - 22 }, { duration: 150, ease: 'Quad.easeOut' })
                await FX.to(scene, view.container, { y: p.y }, { duration: 320, ease: 'Bounce.easeOut' })
                filled[slot] = true
                if (next === slot) next = null
                paintRings()
                void FX.stars(scene, ringX(slot), BOX.slotY, { count: 8, rise: 70, duration: 750, depth: DEPTH.boxFront + 2 })
                void FX.sparks(scene, p.x, p.y, { color: C.gold, count: 16, spread: 120, depth: DEPTH.boxFront + 2 })
                return
            }
            const parts = [container, frontBox, ...inside.map(v => v.container)]
            await new Promise<void>(resolve =>
                scene.tweens.add({
                    targets: parts,
                    x: '+=8',
                    duration: 55,
                    yoyo: true,
                    repeat: 4,
                    ease: 'Sine.easeInOut',
                    onComplete: () => resolve(),
                }),
            )
            mark?.destroy()
            mark = createMark(view, rule)
            mark.setScale(0)
            await FX.to(scene, mark, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },
        async tie() {
            ribbon?.destroy()
            const art = hasArt
                ? scene.add.image(0, 0, MACHINE, MACHINE_CELL.ribbon).setScale(0.45)
                : (() => {
                      const g = scene.add.graphics()
                      paintBow(g)
                      return g
                  })()
            ribbon = scene.add.container(BOX.cx, BASE_Y - BOX.h + 14, [art]).setDepth(DEPTH.boxFront + 2)
            ribbon.setScale(0).setAngle(-20)
            await FX.to(scene, ribbon, { scale: 1, angle: 0 }, { duration: 420, ease: 'Back.easeOut' })
        },
        reset(count) {
            perBox = count
            clear()
        },
        glowSlot(i) {
            next = i
            paintRings()
        },
        items: () => inside.slice(),
        clear,
        destroy() {
            pulseTween.remove()
            clear()
            rings.destroy()
            frontBox.destroy()
            container.destroy()
        },
    }
}
