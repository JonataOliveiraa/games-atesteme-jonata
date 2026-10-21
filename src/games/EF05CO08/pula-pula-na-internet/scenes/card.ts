import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CLUE_CELL, CLUE_SHEET, ITEM_CELL, ITEM_SHEET, cellKey, photoKey } from '../data/files'
import { CARD, DEPTH, H, W, ZOOM } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { CLUE_LABEL, KIND_NAME, LABEL } from '../data/words'
import type { ClueId, ItemDef, PhotoId, Rect, Vec } from '../types'

export interface Card {
    open(item: ItemDef, from: Vec, onPick?: (trust: boolean) => void, fast?: boolean): Promise<void>
    mark(): Promise<void>
    verdict(item: ItemDef, correct: boolean): Promise<void>
    press(trust: boolean): Promise<void>
    keep(to: Vec): Promise<void>
    block(): Promise<void>
    spread(): Promise<void>
    shake(): Promise<void>
    hide(): void
    cluesRect(): Rect
    buttonsRect(): Rect
    buttonRect(trust: boolean): Rect
    destroy(): void
}

interface Row {
    box: Phaser.GameObjects.Container
    bg: Phaser.GameObjects.Image
    mark: Phaser.GameObjects.Image
    ok: boolean
}

interface Photo {
    id: PhotoId
    pic: Phaser.GameObjects.Image
    badge: Phaser.GameObjects.Image
}

interface Zoom {
    shade: Phaser.GameObjects.Rectangle
    box: Phaser.GameObjects.Container
    from: Vec
}

const CLUES: ClueId[] = ['quem', 'quando', 'onde']
const MID = CARD.top + CARD.h / 2
const local = (y: number) => y - MID
const buttonX = (trust: boolean) => (trust ? -CARD.buttonGap / 2 : CARD.buttonGap / 2)

const KEY = {
    frame: 'cartao',
    row: (tone: 'n' | 'ok' | 'no') => `linha-${tone}`,
    tick: (ok: boolean, r: number) => `marca-${ok ? 'ok' : 'no'}-${r}`,
    button: (trust: boolean) => `botao-${trust ? 'sim' : 'nao'}`,
    ring: 'botao-borda',
    lens: 'foto-lupa',
    close: 'foto-fechar',
}

function bake(scene: Phaser.Scene, key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void) {
    if (scene.textures.exists(key)) return
    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    paint(g)
    g.generateTexture(key, w, h)
    g.destroy()
}

const paintTick = (g: Phaser.GameObjects.Graphics, x: number, y: number, ok: boolean, r: number) => {
    g.fillStyle(ok ? C.yes : C.no, 1)
    g.fillCircle(x, y, r)
    g.lineStyle(r * 0.28, C.white, 1)
    if (ok) {
        g.beginPath()
        g.moveTo(x - r * 0.45, y)
        g.lineTo(x - r * 0.1, y + r * 0.38)
        g.lineTo(x + r * 0.5, y - r * 0.38)
        g.strokePath()
    } else {
        g.lineBetween(x - r * 0.38, y - r * 0.38, x + r * 0.38, y + r * 0.38)
        g.lineBetween(x - r * 0.38, y + r * 0.38, x + r * 0.38, y - r * 0.38)
    }
}

function bakeCardArt(scene: Phaser.Scene) {
    const w = CARD.w
    const h = CARD.h
    bake(scene, KEY.frame, w + 8, h + 14, g => {
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(8, 14, w, h, 40)
        g.fillStyle(C.cardEdge, 1)
        g.fillRoundedRect(0, 0, w, h, 40)
        g.fillStyle(C.card, 1)
        g.fillRoundedRect(8, 8, w - 16, h - 16, 34)
        g.fillStyle(C.row, 1)
        g.fillRoundedRect(8, 8, w - 16, 72, { tl: 34, tr: 34, bl: 0, br: 0 })
    })
    ;([['n', C.row], ['ok', C.yesSoft], ['no', C.noSoft]] as const).forEach(([tone, color]) =>
        bake(scene, KEY.row(tone), CARD.rowW, CARD.rowH, g => {
            g.fillStyle(color, 1)
            g.fillRoundedRect(0, 0, CARD.rowW, CARD.rowH, 18)
        }),
    )
    ;[true, false].forEach(ok => {
        bake(scene, KEY.tick(ok, 20), 40, 40, g => paintTick(g, 20, 20, ok, 20))
        bake(scene, KEY.tick(ok, 26), 60, 60, g => {
            paintTick(g, 30, 30, ok, 26)
            g.lineStyle(4, C.white, 1)
            g.strokeCircle(30, 30, 26)
        })
    })
    ;[true, false].forEach(trust =>
        bake(scene, KEY.button(trust), CARD.buttonW, CARD.buttonH + 8, g => {
            const bw = CARD.buttonW
            const bh = CARD.buttonH
            g.fillStyle(trust ? C.yesDark : C.noDark, 1)
            g.fillRoundedRect(0, 7, bw, bh, bh / 2)
            g.fillStyle(trust ? C.yes : C.no, 1)
            g.fillRoundedRect(0, 0, bw, bh, bh / 2)
            g.fillStyle(C.white, 0.22)
            g.fillRoundedRect(18, 8, bw - 36, 18, 9)
        }),
    )
    bake(scene, KEY.ring, CARD.buttonW + 28, CARD.buttonH + 30, g => {
        g.lineStyle(7, C.pulse, 1)
        g.strokeRoundedRect(4, 4, CARD.buttonW + 20, CARD.buttonH + 22, (CARD.buttonH + 22) / 2)
    })
    const b = CARD.badgeR
    bake(scene, KEY.lens, b * 2 + 8, b * 2 + 12, g => {
        const c = b + 4
        g.fillStyle(C.headerLine, 1)
        g.fillCircle(c, c + 4, b)
        g.fillStyle(C.accent, 1)
        g.fillCircle(c, c, b)
        g.lineStyle(3, C.white, 1)
        g.strokeCircle(c, c, b)
        g.lineStyle(4, C.white, 1)
        g.strokeCircle(c - 3, c - 3, b * 0.4)
        g.lineStyle(5, C.white, 1)
        g.lineBetween(c + b * 0.22, c + b * 0.22, c + b * 0.52, c + b * 0.52)
    })
    const r = ZOOM.closeR
    bake(scene, KEY.close, r * 2 + 8, r * 2 + 14, g => {
        const c = r + 4
        g.fillStyle(C.noDark, 1)
        g.fillCircle(c, c + 6, r)
        g.fillStyle(C.no, 1)
        g.fillCircle(c, c, r)
        g.lineStyle(5, C.white, 1)
        g.strokeCircle(c, c, r)
        g.lineStyle(9, C.white, 1)
        g.lineBetween(c - r * 0.36, c - r * 0.36, c + r * 0.36, c + r * 0.36)
        g.lineBetween(c - r * 0.36, c + r * 0.36, c + r * 0.36, c - r * 0.36)
    })
}

export function createCard(scene: Phaser.Scene, sound: { tick(): void }): Card {
    bakeCardArt(scene)
    const veil = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.5).setDepth(DEPTH.card - 1).setAlpha(0).setVisible(false)
    const panel = scene.add.container(CARD.x, MID).setDepth(DEPTH.card).setVisible(false)
    let rows: Row[] = []
    let buttons: Phaser.GameObjects.Container[] = []
    let rings: Phaser.GameObjects.Image[] = []
    let current: ItemDef | null = null
    let picked = false
    let photo: Photo | null = null
    let zoom: Zoom | null = null

    const text = (x: number, y: number, value: string, size: number, color: string, extra: Phaser.Types.GameObjects.Text.TextStyle = {}) =>
        scene.add.text(x, y, value, { fontFamily: FONT.black, fontSize: `${size}px`, color, ...extra }).setResolution(2)

    const fit = (t: Phaser.GameObjects.Text, w: number, h = Infinity) => {
        t.setScale(Math.min(1, w / Math.max(1, t.width), h / Math.max(1, t.height)))
        return t
    }

    const header = (item: ItemDef) => {
        const y = local(CARD.barY)
        const chipText = text(58, 0, KIND_NAME[item.kind], SIZE.chip, CSS.white).setOrigin(0, 0.5)
        const chipW = chipText.width + 86
        const chip = scene.add.graphics()
        chip.fillStyle(C.accent, 1)
        chip.fillRoundedRect(0, -24, chipW, 48, 24)
        const icon = scene.add.image(30, 0, ITEM_SHEET.key, cellKey(ITEM_CELL[item.kind]))
        icon.setScale(46 / icon.width)
        const box = scene.add.container(-CARD.w / 2 + 34, y, [chip, icon, chipText])
        const from = fit(text(-CARD.w / 2 + 34 + chipW + 20, y, item.from, SIZE.from, CSS.from).setOrigin(0, 0.5), CARD.w - chipW - 100)
        return [box, from]
    }

    const body = (item: ItemDef): Phaser.GameObjects.GameObject[] => {
        const cy = local(CARD.bodyY + CARD.bodyH / 2)
        if (item.kind === 'imagem' && item.photo) {
            const px = -CARD.w / 2 + 60 + CARD.photoW / 2
            const border = scene.add.graphics()
            border.fillStyle(C.shadow, 0.2)
            border.fillRoundedRect(px - CARD.photoW / 2 - 8, cy - CARD.photoH / 2 - 2, CARD.photoW + 16, CARD.photoH + 16, 10)
            border.fillStyle(C.white, 1)
            border.fillRoundedRect(px - CARD.photoW / 2 - 8, cy - CARD.photoH / 2 - 8, CARD.photoW + 16, CARD.photoH + 16, 10)
            const pic = scene.add.image(px, cy, photoKey(item.photo)).setDisplaySize(CARD.photoW, CARD.photoH)
            const badge = scene.add.image(px + CARD.photoW / 2 - 4, cy + CARD.photoH / 2 - 2, KEY.lens).setVisible(false)
            photo = { id: item.photo, pic, badge }
            const capX = px + CARD.photoW / 2 + 36
            const room = CARD.w / 2 - 40 - capX
            const cap = text(capX, cy, item.title, SIZE.title - 4, CSS.ink, { wordWrap: { width: room, useAdvancedWrap: true } }).setOrigin(0, 0.5)
            fit(cap, room, CARD.bodyH)
            return [border, pic, badge, cap]
        }
        if (item.kind === 'alerta') {
            const bw = CARD.w - 140
            const shift = item.forwarded ? 12 : 0
            const msg = text(0, cy + shift, item.title, SIZE.title - 2, CSS.ink, {
                align: 'center',
                wordWrap: { width: bw - 60, useAdvancedWrap: true },
            }).setOrigin(0.5)
            fit(msg, bw - 60, CARD.bodyH - 34)
            const bh = Math.min(CARD.bodyH - 6, msg.displayHeight + 34)
            const bubble = scene.add.graphics()
            bubble.fillStyle(C.chatDark, 1)
            bubble.fillRoundedRect(-bw / 2, cy + shift - bh / 2 + 5, bw, bh, 26)
            bubble.fillStyle(C.chat, 1)
            bubble.fillRoundedRect(-bw / 2, cy + shift - bh / 2, bw, bh, 26)
            bubble.fillTriangle(-bw / 2 + 30, cy + shift + bh / 2 - 4, -bw / 2 + 10, cy + shift + bh / 2 + 18, -bw / 2 + 64, cy + shift + bh / 2 - 4)
            const parts: Phaser.GameObjects.GameObject[] = [bubble, msg]
            if (item.forwarded) parts.push(text(-bw / 2 + 8, cy + shift - bh / 2 - 6, `↪ ${LABEL.forwarded}`, SIZE.label, CSS.inkSoft).setOrigin(0, 1))
            return parts
        }
        const title = text(0, cy, item.title, SIZE.title, CSS.ink, { align: 'center', wordWrap: { width: CARD.w - 120, useAdvancedWrap: true } }).setOrigin(0.5)
        fit(title, CARD.w - 120, CARD.bodyH)
        return [title]
    }

    const makeRow = (item: ItemDef, id: ClueId, index: number): Row => {
        const w = CARD.rowW
        const bg = scene.add.image(0, 0, KEY.row('n'))
        const icon = scene.add.image(-w / 2 + 38, 0, CLUE_SHEET.key, cellKey(CLUE_CELL[id]))
        icon.setScale(44 / icon.width)
        const label = fit(text(-w / 2 + 72, 0, CLUE_LABEL[item.kind][id], SIZE.label, CSS.inkSoft).setOrigin(0, 0.5), 230)
        const value = fit(text(-w / 2 + 310, 0, item.clues[id].text, SIZE.value, CSS.ink).setOrigin(0, 0.5), w - 310 - 70)
        const ok = item.clues[id].ok
        const mark = scene.add.image(w / 2 - 36, 0, KEY.tick(ok, 20)).setVisible(false)
        const box = scene.add.container(0, local(CARD.rowY + index * CARD.rowGap), [bg, icon, label, value, mark]).setAlpha(0)
        return { box, bg, mark, ok }
    }

    const makeButton = (trust: boolean) => {
        const w = CARD.buttonW
        const g = scene.add.image(0, 3.5, KEY.button(trust))
        const mark = scene.add.image(-w / 2 + 50, 0, KEY.tick(trust, 26))
        const label = fit(text(22, 0, trust ? LABEL.trust : LABEL.distrust, SIZE.button, CSS.white).setOrigin(0.5), w - 120)
        const box = scene.add.container(buttonX(trust), local(CARD.buttonY), [g, mark, label]).setSize(w, CARD.buttonH).setAlpha(0).setScale(0.6)
        return box
    }

    const stopRings = () => {
        rings.forEach(r => {
            scene.tweens.killTweensOf(r)
            r.destroy()
        })
        rings = []
    }

    const onEsc = () => closeZoom()

    const closeZoom = (instant = false) => {
        const z = zoom
        if (!z) return
        zoom = null
        scene.input.keyboard?.off('keydown-ESC', onEsc)
        z.shade.disableInteractive()
        const gone = () => {
            z.shade.destroy()
            z.box.destroy()
        }
        if (instant) {
            scene.tweens.killTweensOf([z.shade, z.box])
            gone()
            return
        }
        sound.tick()
        void FX.to(scene, z.shade, { alpha: 0 }, { duration: TIMING.zoomOut })
        void FX.to(scene, z.box, { x: z.from.x, y: z.from.y, scale: CARD.photoW / ZOOM.w, alpha: 0 }, { duration: TIMING.zoomOut, ease: 'Cubic.easeIn' }).then(gone)
    }

    const openZoom = () => {
        if (!photo || zoom || picked) return
        sound.tick()
        const from = { x: CARD.x + photo.pic.x, y: MID + photo.pic.y }
        const shade = scene.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.82).setDepth(DEPTH.zoom).setAlpha(0).setInteractive()
        shade.on('pointerdown', () => closeZoom())
        const fw = ZOOM.w + ZOOM.frame * 2
        const fh = ZOOM.h + ZOOM.frame * 2
        const frame = scene.add.graphics()
        frame.fillStyle(C.shadow, 0.35)
        frame.fillRoundedRect(-fw / 2 + 10, -fh / 2 + 14, fw, fh, 22)
        frame.fillStyle(C.white, 1)
        frame.fillRoundedRect(-fw / 2, -fh / 2, fw, fh, 22)
        const pic = scene.add.image(0, 0, photoKey(photo.id)).setDisplaySize(ZOOM.w, ZOOM.h).setInteractive()
        const r = ZOOM.closeR
        const close = scene.add
            .image(fw / 2 - 14, -fh / 2 + 14, KEY.close)
            .setOrigin(0.5, (r + 4) / (r * 2 + 14))
            .setInteractive({ useHandCursor: true })
        close.on('pointerdown', () => {
            void FX.press(scene, close)
            closeZoom()
        })
        const box = scene.add.container(from.x, from.y, [frame, pic, close]).setDepth(DEPTH.zoom + 1).setScale(CARD.photoW / ZOOM.w)
        zoom = { shade, box, from }
        scene.input.keyboard?.on('keydown-ESC', onEsc)
        void FX.to(scene, shade, { alpha: 1 }, { duration: TIMING.zoomIn })
        void FX.to(scene, box, { x: ZOOM.x, y: ZOOM.y, scale: 1 }, { duration: TIMING.zoomIn, ease: 'Back.easeOut' })
    }

    const enablePhoto = () => {
        if (!photo) return
        ;[photo.pic, photo.badge].forEach(o => o.setInteractive({ useHandCursor: true }).on('pointerdown', openZoom))
        photo.badge.setVisible(true).setScale(0.4)
        void FX.to(scene, photo.badge, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
    }

    const disablePhoto = () => {
        if (!photo) return
        photo.pic.disableInteractive()
        photo.badge.disableInteractive()
        void FX.to(scene, photo.badge, { alpha: 0, scale: 0.6 }, { duration: 160 })
    }

    const clear = () => {
        closeZoom(true)
        stopRings()
        panel.list.forEach(o => scene.tweens.killTweensOf(o))
        panel.removeAll(true)
        rows = []
        buttons = []
        current = null
        photo = null
    }

    const hide = () => {
        clear()
        panel.setVisible(false)
        veil.setVisible(false)
    }

    const toScreen = (x: number, y: number, w: number, h: number): Rect => ({ x: CARD.x + x, y: MID + y, w, h })

    const markRows = async () => {
        for (const r of rows) {
            r.bg.setTexture(KEY.row(r.ok ? 'ok' : 'no'))
            r.mark.setVisible(true)
            void FX.to(scene, r.box, { scale: 1.04 }, { duration: 110, yoyo: true })
            await FX.wait(scene, 140)
        }
    }

    return {
        async open(item, from, onPick, fast = false) {
            const pace = fast ? TIMING.demo : TIMING
            clear()
            current = item
            picked = false
            panel.add(scene.add.image(4, 7, KEY.frame))
            panel.add(header(item))
            panel.add(body(item))
            rows = CLUES.map((id, i) => makeRow(item, id, i))
            rows.forEach(r => panel.add(r.box))
            buttons = [makeButton(true), makeButton(false)]
            buttons.forEach(b => panel.add(b))

            veil.setVisible(true).setAlpha(0)
            void FX.to(scene, veil, { alpha: 1 }, { duration: pace.cardIn })
            panel.setVisible(true).setAlpha(1).setRotation(0).setPosition(from.x, from.y).setScale(0.06)
            await FX.to(scene, panel, { x: CARD.x, y: MID, scale: 1 }, { duration: pace.cardIn, ease: 'Back.easeOut' })

            for (const r of rows) {
                await FX.wait(scene, pace.clue)
                r.box.setX(-30)
                void FX.to(scene, r.box, { x: 0, alpha: 1 }, { duration: 240 })
                sound.tick()
            }
            await FX.wait(scene, pace.clue)
            await FX.all(
                ...buttons.map((b, i) => FX.to(scene, b, { alpha: 1, scale: 1 }, { duration: pace.buttons, delay: i * 90, ease: 'Back.easeOut' })),
            )
            if (!onPick) return
            enablePhoto()
            buttons.forEach((b, i) => {
                const trust = i === 0
                const ring = scene.add.image(b.x, b.y + 4, KEY.ring).setAlpha(0.9)
                panel.addAt(ring, panel.getIndex(b))
                rings.push(ring)
                scene.tweens.add({ targets: ring, alpha: 0.25, scale: 1.04, duration: 620, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
                b.setInteractive({ useHandCursor: true })
                b.on('pointerdown', () => {
                    if (picked) return
                    picked = true
                    stopRings()
                    void FX.press(scene, b)
                    onPick(trust)
                })
            })
        },
        mark: markRows,
        async verdict(item, correct) {
            stopRings()
            closeZoom(true)
            disablePhoto()
            buttons.forEach(b => {
                b.disableInteractive()
                void FX.to(scene, b, { alpha: 0, scale: 0.8 }, { duration: 200 })
            })
            await markRows()
            const msg = correct ? item.why : `${LABEL.oops} ${item.why}`
            const t = fit(text(0, 0, msg, SIZE.why, correct ? CSS.yes : CSS.oops, { align: 'center' }).setOrigin(0.5), CARD.w - 120)
            const w = Math.min(CARD.w - 60, t.displayWidth + 60)
            const h = CARD.buttonH - 8
            const g = scene.add.graphics()
            g.fillStyle(correct ? C.yes : C.oops, 1)
            g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(correct ? C.yesSoft : C.noSoft, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            const footer = scene.add.container(0, local(CARD.buttonY), [g, t]).setScale(0.7).setAlpha(0)
            panel.add(footer)
            await FX.to(scene, footer, { scale: 1, alpha: 1 }, { duration: 260, ease: 'Back.easeOut' })
            if (correct) return
            const decisive = rows.every(r => r.ok) ? rows : rows.filter(r => !r.ok)
            decisive.forEach(r => scene.tweens.add({ targets: r.box, x: 10, duration: 60, yoyo: true, repeat: 3 }))
        },
        async press(trust) {
            const b = buttons[trust ? 0 : 1]
            if (!b) return
            const ring = scene.add.circle(CARD.x + b.x, MID + b.y, 50).setDepth(DEPTH.card + 2)
            ring.setStrokeStyle(8, C.pulse, 1)
            scene.tweens.add({ targets: ring, scale: 2.2, alpha: 0, duration: 520, onComplete: () => ring.destroy() })
            await FX.press(scene, b)
            await FX.wait(scene, 240)
            buttons.forEach(o => void FX.to(scene, o, { alpha: 0, scale: 0.8 }, { duration: 200 }))
        },
        async keep(to) {
            void FX.sparks(scene, CARD.x, MID, { color: C.yes, count: 16, spread: 260, size: 10, duration: 600, depth: DEPTH.card + 2 })
            await FX.wait(scene, 260)
            void FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.cardOut })
            await FX.to(scene, panel, { x: to.x, y: to.y, scale: 0.04, alpha: 0.4 }, { duration: TIMING.cardOut, ease: 'Back.easeIn' })
            hide()
        },
        async block() {
            void FX.to(scene, panel, { angle: -4 }, { duration: 120, yoyo: true })
            await FX.wait(scene, 260)
            void FX.to(scene, veil, { alpha: 0 }, { duration: TIMING.cardOut })
            await FX.to(scene, panel, { y: MID + 460, rotation: 0.35, alpha: 0 }, { duration: TIMING.cardOut, ease: 'Back.easeIn' })
            hide()
        },
        async spread() {
            if (!current) return
            const cell = cellKey(ITEM_CELL[current.kind])
            const copies = Array.from({ length: 8 }, (_, k) => {
                const a = (k / 8) * Math.PI * 2 + 0.2
                const img = scene.add.image(CARD.x, MID, ITEM_SHEET.key, cell).setDepth(DEPTH.card + 3).setScale(0.2)
                return FX.to(scene, img, { x: CARD.x + Math.cos(a) * 620, y: MID + Math.sin(a) * 380, scale: 0.55, angle: 40 }, { duration: TIMING.spread, ease: 'Cubic.easeOut' }).then(() =>
                    img.destroy(),
                )
            })
            await FX.all(...copies)
        },
        async shake() {
            await FX.shake(scene, panel, { amount: 14, times: 4 })
        },
        hide,
        cluesRect: () => toScreen(0, local(CARD.rowY + CARD.rowGap), CARD.rowW + 24, CARD.rowGap * 2 + CARD.rowH + 20),
        buttonsRect: () => toScreen(0, local(CARD.buttonY), CARD.buttonGap + CARD.buttonW + 30, CARD.buttonH + 30),
        buttonRect: trust => toScreen(buttonX(trust), local(CARD.buttonY), CARD.buttonW + 24, CARD.buttonH + 24),
        destroy() {
            clear()
            panel.destroy()
            veil.destroy()
        },
    }
}
