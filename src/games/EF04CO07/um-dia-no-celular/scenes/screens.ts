import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BANNER, CAMERA, CHAT, DEPTH, GALLERY, HOME, LOCK, SCREEN, STATUS } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { T } from '../data/timing'
import { APP_NAME, NAME, PHONE_TEXT, SHARE } from '../data/words'
import type { AppId, Message, Rect, Sender, Shot } from '../types'
import { appImage, paintAvatar, paintHomeWall, paintImage, paintLockWall, paintShot } from './art'
import type { Picker } from './picker'

type G = Phaser.GameObjects.Graphics

const SX = SCREEN.x
const SY = SCREEN.y
const SW = SCREEN.w
const SH = SCREEN.h

export interface Screen {
    readonly layer: Phaser.GameObjects.Container
    readonly dark: boolean
    destroy(): void
}

export const abs = (x: number, y: number, w: number, h: number): Rect => ({ x: SX + x, y: SY + y, w, h })

export function text(scene: Phaser.Scene, x: number, y: number, value: string, size: number, color: string, opts: { black?: boolean; wrap?: number; align?: string } = {}) {
    return scene.add
        .text(x, y, value, {
            fontFamily: opts.black ? FONT.black : FONT.body,
            fontSize: `${size}px`,
            color,
            align: opts.align ?? 'left',
            wordWrap: opts.wrap ? { width: opts.wrap, useAdvancedWrap: true } : undefined,
            lineSpacing: 2,
        })
        .setResolution(2)
}

export function layerAt(scene: Phaser.Scene, depth = DEPTH.screen) {
    return scene.add.container(SX, SY).setDepth(depth)
}

export const backdrop = (scene: Phaser.Scene, draw: (g: G) => void) => paintImage(scene, SW, SH, draw)

export const centered = (scene: Phaser.Scene, w: number, h: number, draw: (g: G) => void) => paintImage(scene, w, h, draw, w / 2, h / 2)

export function chevron(g: G, x: number, y: number, color: number) {
    g.lineStyle(4, color, 1)
    g.beginPath()
    g.moveTo(x + 8, y - 10)
    g.lineTo(x, y)
    g.lineTo(x + 8, y + 10)
    g.strokePath()
}

// ───────────────────────────────────────────────────────── tela inicial

export interface Home extends Screen {
    iconRect(app: AppId): Rect
    setClock(value: string): void
    popIcons(): Promise<void>
}

export function createHome(scene: Phaser.Scene, picker: Picker, apps: AppId[], clock: string, day: string, wallpaper: string | null): Home {
    const layer = layerAt(scene)
    const wall = scene.add.image(SW / 2, SH / 2, wallpaper ?? paintHomeWall(scene)).setDisplaySize(SW, SH)
    const clockText = text(scene, SW / 2, HOME.clockY, clock, SIZE.clock, CSS.white, { black: true }).setOrigin(0.5)
    clockText.setShadow(0, 3, 'rgba(43,36,64,0.35)', 6, false, true)
    const dateText = text(scene, SW / 2, HOME.dateY, day, SIZE.date, CSS.white).setOrigin(0.5)
    dateText.setShadow(0, 2, 'rgba(43,36,64,0.35)', 4, false, true)
    layer.add([wall, clockText, dateText])
    const grid = apps.length <= 4 ? HOME.grids.small : HOME.grids.full
    const at = (i: number) => ({ x: grid.cols[i % grid.cols.length], y: grid.rows[Math.floor(i / grid.cols.length)] })
    const icons: Phaser.GameObjects.Container[] = []
    apps.forEach((app, i) => {
        const { x, y } = at(i)
        const shadow = scene.add.ellipse(0, grid.icon / 2 - 2, grid.icon * 0.8, 12, C.shadow, 0.16)
        const icon = appImage(scene, app, grid.icon)
        const label = text(scene, 0, grid.labelDy, APP_NAME[app], grid.label, CSS.white, { black: true }).setOrigin(0.5)
        label.setStroke(CSS.ink, 4)
        const box = scene.add.container(x, y, [shadow, icon, label])
        layer.add(box)
        icons.push(box)
        picker.add(`app:${app}`, box, abs(x, y + 10, grid.icon + 22, grid.icon + 44))
    })
    return {
        layer,
        dark: false,
        iconRect: app => {
            const { x, y } = at(Math.max(0, apps.indexOf(app)))
            return abs(x, y, grid.icon + 12, grid.icon + 12)
        },
        setClock(value) {
            clockText.setText(value)
        },
        async popIcons() {
            icons.forEach(icon => icon.setScale(0).setAlpha(0))
            await FX.all(
                ...icons.map((icon, i) =>
                    FX.wait(scene, i * 140).then(() => FX.to(scene, icon, { scale: 1, alpha: 1 }, { duration: T.chip, ease: 'Back.easeOut' })),
                ),
            )
        },
        destroy() {
            apps.forEach(app => picker.remove(`app:${app}`))
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── conversa

export interface Chat extends Screen {
    push(message: Message, by?: Sender): Promise<void>
    setReplies(lines: string[] | null): void
}

interface Bubble {
    box: Phaser.GameObjects.Container
    h: number
}

export function createChat(scene: Phaser.Scene, picker: Picker, contact: Sender, history: Array<{ message: Message; by?: Sender }>): Chat {
    const layer = layerAt(scene)
    const barY = STATUS.h + CHAT.barH / 2
    const inputY = SH - CHAT.inputH / 2
    const bg = backdrop(scene, g => {
        g.fillStyle(C.chatBg, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        g.fillStyle(C.chatTop, 1)
        g.fillRoundedRect(0, 0, SW, STATUS.h + CHAT.barH, { tl: SCREEN.r, tr: SCREEN.r, bl: 0, br: 0 })
        g.fillStyle(C.headerRim, 1)
        g.fillRect(0, STATUS.h + CHAT.barH, SW, 2)
        g.fillStyle(C.inputBg, 1)
        g.fillRoundedRect(0, SH - CHAT.inputH, SW, CHAT.inputH, { tl: 0, tr: 0, bl: SCREEN.r, br: SCREEN.r })
        g.fillStyle(C.headerRim, 1)
        g.fillRect(0, SH - CHAT.inputH, SW, 2)
        chevron(g, CHAT.backX, barY, C.ink)
        g.fillStyle(C.inputPill, 1)
        g.fillRoundedRect(CHAT.pillX, inputY - 19, CHAT.pillW, 38, 19)
        g.fillStyle(C.accentSoft, 1)
        g.fillCircle(CHAT.sendX, inputY, 20)
        g.fillStyle(C.accent, 1)
        g.fillTriangle(CHAT.sendX - 8, inputY - 9, CHAT.sendX + 10, inputY, CHAT.sendX - 8, inputY + 9)
    })
    const avatar = scene.add.image(CHAT.avatarX, barY, paintAvatar(scene, contact)).setDisplaySize(42, 42)
    const name = text(scene, CHAT.nameX, barY, NAME[contact], SIZE.chatName, CSS.ink, { black: true }).setOrigin(0, 0.5)
    const typing = text(scene, CHAT.pillX + 16, inputY, PHONE_TEXT.typing, 17, CSS.grey).setOrigin(0, 0.5)
    const camArt = centered(scene, 50, 50, g => {
        g.fillStyle(C.accent, 1)
        g.fillCircle(0, 0, 23)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-13, -8, 26, 18, 5)
        g.fillRoundedRect(-6, -12, 12, 6, 2)
        g.fillStyle(C.accent, 1)
        g.fillCircle(0, 1, 6)
    })
    const cam = scene.add.container(CHAT.camX, inputY, [camArt])
    layer.add([bg, avatar, name, typing, cam])
    picker.add('chat:camera', cam, abs(CHAT.camX, inputY, 72, 72))

    const bubbles: Bubble[] = []
    let replies: Phaser.GameObjects.Container[] = []
    let bottom = SH - CHAT.inputH - 12

    const makeBubble = (message: Message, by?: Sender): Bubble => {
        const mine = message.from === 'me'
        const parts: Phaser.GameObjects.GameObject[] = []
        let w: number
        let h: number
        const showName = !mine && by && by !== contact
        if ('text' in message) {
            const label = text(scene, 0, 0, message.text, SIZE.bubble, mine ? CSS.mineInk : CSS.ink, { wrap: CHAT.bubbleMaxW - 28 })
            const nameText = showName ? text(scene, 0, 0, NAME[by], 15, CSS.accent, { black: true }) : null
            w = Math.max(label.width, nameText?.width ?? 0) + 28
            h = label.height + 22 + (nameText ? nameText.height + 2 : 0)
            const bw = w
            const bh = h
            parts.push(
                paintImage(scene, bw, bh + 4, g => {
                    g.fillStyle(C.shadow, 0.08)
                    g.fillRoundedRect(0, 3, bw, bh, 18)
                    g.fillStyle(mine ? C.mine : C.theirs, 1)
                    g.fillRoundedRect(0, 0, bw, bh, { tl: 18, tr: 18, bl: mine ? 18 : 4, br: mine ? 4 : 18 })
                }),
            )
            if (nameText) {
                nameText.setPosition(14, 9)
                parts.push(nameText)
            }
            label.setPosition(14, 11 + (nameText ? nameText.height + 2 : 0))
            parts.push(label)
        } else {
            w = CHAT.photoW + 12
            h = CHAT.photoH + 12
            const bw = w
            const bh = h
            const frame = paintImage(scene, bw, bh + 4, g => {
                g.fillStyle(C.shadow, 0.1)
                g.fillRoundedRect(0, 4, bw, bh, 16)
                g.fillStyle(mine ? C.mine : C.theirs, 1)
                g.fillRoundedRect(0, 0, bw, bh, 16)
            })
            const photo = scene.add.image(w / 2, h / 2, message.photo).setDisplaySize(CHAT.photoW, CHAT.photoH)
            parts.push(frame, photo)
        }
        const x = mine ? SW - 12 - w : 12
        const box = scene.add.container(x, 0, parts)
        layer.add(box)
        return { box, h }
    }

    const layout = (animate: boolean) => {
        let y = bottom
        for (let i = bubbles.length - 1; i >= 0; i--) {
            const b = bubbles[i]
            y -= b.h
            const visible = y >= CHAT.listTop
            if (animate) FX.to(scene, b.box, { y, alpha: visible ? 1 : 0 }, { duration: T.push })
            else b.box.setY(y).setAlpha(visible ? 1 : 0)
            y -= 10
        }
    }

    history.forEach(({ message, by }) => bubbles.push(makeBubble(message, by)))
    layout(false)

    return {
        layer,
        dark: false,
        async push(message, by) {
            const bubble = makeBubble(message, by)
            bubble.box.setY(bottom - bubble.h + 24).setAlpha(0)
            bubbles.push(bubble)
            layout(true)
            await FX.wait(scene, T.push)
        },
        setReplies(lines) {
            replies.forEach((r, i) => {
                picker.remove(`reply:${i}`)
                r.destroy()
            })
            replies = []
            bottom = SH - CHAT.inputH - 12
            if (lines) {
                let y = SH - CHAT.inputH - 10
                for (let i = lines.length - 1; i >= 0; i--) {
                    const cy = y - CHAT.replyH / 2
                    const back = centered(scene, CHAT.replyW, CHAT.replyH + 6, g => {
                        const w = CHAT.replyW
                        const h = CHAT.replyH
                        g.fillStyle(C.shadow, 0.14)
                        g.fillRoundedRect(-w / 2 + 2, -h / 2 + 8, w, h - 2, 20)
                        g.fillStyle(C.lilac, 1)
                        g.fillRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, 20)
                        g.lineStyle(3, C.accent, 1)
                        g.strokeRoundedRect(-w / 2, -h / 2 + 3, w, h - 3, 20)
                        g.fillStyle(C.white, 1)
                        g.fillRoundedRect(-w / 2, -h / 2 - 2, w, h - 3, 20)
                        g.lineStyle(3, C.accent, 1)
                        g.strokeRoundedRect(-w / 2, -h / 2 - 2, w, h - 3, 20)
                    })
                    const label = text(scene, 0, 0, lines[i], SIZE.reply, CSS.accentDark, { black: true, wrap: CHAT.replyW - 30, align: 'center' }).setOrigin(0.5)
                    const chip = scene.add.container(SW / 2, cy, [back, label])
                    layer.add(chip)
                    replies[i] = chip
                    picker.add(`reply:${i}`, chip, abs(SW / 2, cy, CHAT.replyW, CHAT.replyH))
                    chip.setScale(0.8).setAlpha(0)
                    FX.to(scene, chip, { scale: 1, alpha: 1 }, { duration: T.chip, ease: 'Back.easeOut', delay: (lines.length - 1 - i) * T.chipGap })
                    y -= CHAT.replyH + CHAT.replyGap
                }
                bottom = y - 4
            }
            layout(true)
        },
        destroy() {
            picker.remove('chat:camera')
            replies.forEach((_, i) => picker.remove(`reply:${i}`))
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── câmera

export interface Camera extends Screen {
    show(shot: Shot): void
    pan(shot: Shot): Promise<void>
    flash(): Promise<void>
    setThumb(key: string | null): void
}

const VF_KEY = 'cel-vf'

export function createCamera(scene: Phaser.Scene, picker: Picker, shot: Shot, thumb: string | null): Camera {
    const layer = layerAt(scene)
    const vfY = CAMERA.vfY + CAMERA.vfH / 2
    const bg = backdrop(scene, g => {
        g.fillStyle(C.cameraBar, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        g.lineStyle(3, C.white, 0.9)
        g.strokeRoundedRect(CAMERA.thumbX - 25, CAMERA.shutterY - 25, 50, 50, 10)
        g.fillStyle(0x2c2838, 1)
        g.fillRoundedRect(CAMERA.thumbX - 23, CAMERA.shutterY - 23, 46, 46, 9)
        g.fillStyle(0x2c2838, 1)
        g.fillCircle(CAMERA.flipX, CAMERA.shutterY, 24)
        g.lineStyle(3, C.white, 0.9)
        g.beginPath()
        g.arc(CAMERA.flipX, CAMERA.shutterY, 11, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(500), false)
        g.strokePath()
        g.fillStyle(C.white, 0.9)
        g.fillTriangle(CAMERA.flipX + 9, CAMERA.shutterY - 12, CAMERA.flipX + 16, CAMERA.shutterY - 3, CAMERA.flipX + 4, CAMERA.shutterY - 2)
    })
    paintShot(scene, VF_KEY, shot)
    const view = scene.add.image(SW / 2, vfY, VF_KEY).setDisplaySize(SW, CAMERA.vfH)
    const grid = paintImage(scene, SW, CAMERA.vfH, g => {
        g.lineStyle(1.5, C.white, 0.28)
        ;[1, 2].forEach(k => {
            g.lineBetween((SW * k) / 3, 0, (SW * k) / 3, CAMERA.vfH)
            g.lineBetween(0, (CAMERA.vfH * k) / 3, SW, (CAMERA.vfH * k) / 3)
        })
    }).setPosition(0, CAMERA.vfY)
    const fw = 120
    const focus = centered(scene, fw + 8, fw + 8, g => {
        g.lineStyle(4, C.butter, 1)
        ;[
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
        ].forEach(([dx, dy]) => {
            const x = (dx * fw) / 2
            const y = (dy * fw) / 2
            g.lineBetween(x, y, x - dx * 22, y)
            g.lineBetween(x, y, x, y - dy * 22)
        })
    })
    const focusBox = scene.add.container(SW / 2, vfY - 30, [focus])
    const flashRect = scene.add.rectangle(SW / 2, vfY, SW, CAMERA.vfH, C.white, 1).setAlpha(0)
    const mode = text(scene, SW / 2, CAMERA.modeY, PHONE_TEXT.photo, SIZE.camMode, CSS.camera, { black: true }).setOrigin(0.5)
    const r = CAMERA.shutterR + 9
    const ring = centered(scene, r * 2, r * 2, g => {
        g.lineStyle(6, C.white, 1)
        g.strokeCircle(0, 0, CAMERA.shutterR + 6)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, CAMERA.shutterR - 4)
    })
    const shutter = scene.add.container(SW / 2, CAMERA.shutterY, [ring])
    const thumbImage = scene.add.image(CAMERA.thumbX, CAMERA.shutterY, '__WHITE').setVisible(false)
    layer.add([bg, view, grid, focusBox, flashRect, mode, thumbImage, shutter])
    picker.add('cam:shutter', shutter, abs(SW / 2, CAMERA.shutterY, 100, 100))

    const setThumb = (key: string | null) => {
        if (!key) {
            thumbImage.setVisible(false)
            return
        }
        thumbImage.setTexture(key).setVisible(true)
        const tw = thumbImage.frame.width
        const th = thumbImage.frame.height
        thumbImage.setCrop(0, (th - tw) / 2, tw, tw).setScale(44 / tw)
    }
    setThumb(thumb)
    const settle = () => {
        focusBox.setScale(1.3).setAlpha(0)
        FX.to(scene, focusBox, { scale: 1, alpha: 1 }, { duration: T.focus, ease: 'Back.easeOut' })
    }
    settle()

    return {
        layer,
        dark: true,
        show(next) {
            paintShot(scene, VF_KEY, next)
            settle()
        },
        async pan(next) {
            await FX.to(scene, view, { x: SW / 2 - 60, alpha: 0.2 }, { duration: T.pan })
            paintShot(scene, VF_KEY, next)
            view.setX(SW / 2 + 60)
            await FX.to(scene, view, { x: SW / 2, alpha: 1 }, { duration: T.pan })
            settle()
        },
        async flash() {
            flashRect.setAlpha(0.95)
            await FX.to(scene, flashRect, { alpha: 0 }, { duration: T.flash })
        },
        setThumb,
        destroy() {
            picker.remove('cam:shutter')
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── galeria

export interface Gallery extends Screen {
    crumple(): Promise<void>
    setPhoto(key: string | null): Promise<void>
}

export type GalleryAction = 'erase' | 'wall' | 'forward'

export function createGallery(scene: Phaser.Scene, picker: Picker, photo: string, actions: GalleryAction[] = ['erase', 'wall']): Gallery {
    const layer = layerAt(scene)
    const top = STATUS.h + 12
    const bg = backdrop(scene, g => {
        g.fillStyle(C.galleryBg, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        chevron(g, 18, top, C.white)
    })
    const title = text(scene, 40, top, 'Fotos', 18, CSS.white, { black: true }).setOrigin(0, 0.5)
    const py = GALLERY.photoY + GALLERY.photoH / 2
    const image = scene.add.image(SW / 2, py, photo).setDisplaySize(SW, GALLERY.photoH)
    const makeButton = (x: number, label: string, icon: (g: G) => void, w = GALLERY.buttonW) => {
        const h = GALLERY.buttonH
        const back = centered(scene, w, h, g => {
            g.fillStyle(0x2a2638, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
            g.lineStyle(3, C.white, 0.35)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
            icon(g)
        })
        const t = text(scene, 0, 0, label, SIZE.galleryButton, CSS.white, { black: true, wrap: w - 10, align: 'center' }).setOrigin(0.5, 0)
        return scene.add.container(x, GALLERY.buttonY, [back, t])
    }
    const trashIcon = (g: G) => {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-13, -36, 26, 30, 4)
        g.fillRoundedRect(-17, -42, 34, 6, 3)
        g.fillRoundedRect(-5, -46, 10, 5, 2)
        g.fillStyle(0x2a2638, 1)
        g.fillRect(-6, -32, 3, 22)
        g.fillRect(3, -32, 3, 22)
    }
    const wallIcon = (g: G) => {
        g.lineStyle(3, C.white, 1)
        g.strokeRoundedRect(-12, -48, 24, 42, 5)
        g.fillStyle(C.white, 1)
        g.fillTriangle(-9, -12, -2, -24, 5, -12)
        g.fillCircle(4, -36, 4)
    }
    const forwardIcon = (g: G) => {
        g.lineStyle(5, C.white, 1)
        g.beginPath()
        g.moveTo(-16, -10)
        g.lineTo(-16, -18)
        g.arc(-2, -18, 14, Math.PI, Math.PI * 1.5, false)
        g.lineTo(10, -32)
        g.strokePath()
        g.fillStyle(C.white, 1)
        g.fillTriangle(8, -42, 22, -32, 8, -22)
    }
    const KIND: Record<GalleryAction, { label: string; icon: (g: G) => void }> = {
        erase: { label: PHONE_TEXT.erase, icon: trashIcon },
        wall: { label: PHONE_TEXT.wallpaper, icon: wallIcon },
        forward: { label: SHARE.forward, icon: forwardIcon },
    }
    const single = actions.length === 1
    const buttons = actions.map((action, i) => {
        const x = single ? SW / 2 : GALLERY.buttons[i]
        const w = single ? 190 : GALLERY.buttonW
        const button = makeButton(x, KIND[action].label, KIND[action].icon, w)
        picker.add(`gal:${action}`, button, abs(x, GALLERY.buttonY, w, GALLERY.buttonH))
        return button
    })
    const erase = buttons[actions.indexOf('erase')] ?? buttons[0]
    layer.add([bg, title, image, ...buttons])

    return {
        layer,
        dark: true,
        async crumple() {
            const target = { x: GALLERY.buttons[0], y: GALLERY.buttonY - 20 }
            await FX.to(scene, image, { scaleX: image.scaleX * 0.9, scaleY: image.scaleY * 0.9, angle: -4 }, { duration: 220 })
            await FX.to(scene, image, { x: target.x, y: target.y, scaleX: 0.02, scaleY: 0.02, angle: -220, alpha: 0.2 }, { duration: 700, ease: 'Cubic.easeIn' })
            image.setVisible(false)
            void FX.to(scene, erase, { angle: 8 }, { duration: 80, yoyo: true, repeat: 2 }).then(() => erase.active && erase.setAngle(0))
        },
        async setPhoto(key) {
            if (!key) return
            image.setTexture(key).setDisplaySize(SW, GALLERY.photoH).setAngle(0).setAlpha(0).setVisible(true).setPosition(SW / 2 + 80, py)
            await FX.to(scene, image, { x: SW / 2, alpha: 1 }, { duration: T.short })
        },
        destroy() {
            actions.forEach(action => picker.remove(`gal:${action}`))
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── bloqueio

export function createLock(scene: Phaser.Scene, clock: string): Screen {
    const layer = layerAt(scene)
    const wall = scene.add.image(SW / 2, SH / 2, paintLockWall(scene)).setDisplaySize(SW, SH)
    const time = text(scene, SW / 2, LOCK.clockY, clock, SIZE.lock + 12, CSS.white, { black: true }).setOrigin(0.5)
    const night = text(scene, SW / 2, LOCK.textY, PHONE_TEXT.night, 26, CSS.white, { black: true }).setOrigin(0.5)
    layer.add([wall, time, night])
    return { layer, dark: true, destroy: () => layer.destroy() }
}

// ───────────────────────────────────────────────────────── notificação

export interface Banner {
    readonly box: Phaser.GameObjects.Container
    readonly rect: Rect
    hide(): Promise<void>
    destroy(): void
}

export async function showBanner(scene: Phaser.Scene, picker: Picker, sender: Sender, line: string, alert = false, tap = false): Promise<Banner> {
    const cx = SX + SW / 2
    const w = BANNER.w
    const body = text(scene, 0, 0, line, SIZE.banner, alert ? CSS.oops : CSS.inkSoft, { wrap: BANNER.textW })
    const h = Math.max(BANNER.h, 40 + body.height + 18)
    const cy = SY + BANNER.y + h / 2
    const back = centered(scene, w, h + 8, g => {
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, 22)
        g.fillStyle(alert ? 0xfff1e8 : C.white, 0.98)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        if (alert) {
            g.lineStyle(3, C.oops, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
        }
    })
    const left = -w / 2
    const avatar = scene.add.image(left + BANNER.avatarX, -h / 2 + 34, paintAvatar(scene, sender)).setDisplaySize(44, 44)
    const name = text(scene, left + BANNER.textX, -h / 2 + 14, NAME[sender], SIZE.bannerName, CSS.ink, { black: true })
    const now = text(scene, w / 2 - 14, -h / 2 + 16, 'agora', 14, CSS.grey).setOrigin(1, 0)
    now.setVisible(name.x + name.width + 10 < now.x - now.width)
    body.setPosition(left + BANNER.textX, -h / 2 + 40)
    const box = scene.add.container(cx, cy - 26, [back, avatar, name, now, body]).setDepth(DEPTH.banner).setAlpha(0)
    const rect = { x: cx, y: cy, w, h }
    await FX.to(scene, box, { y: cy, alpha: 1 }, { duration: T.banner, ease: 'Back.easeOut' })
    if (tap) picker.add('banner', box, rect)
    return {
        box,
        rect,
        async hide() {
            if (tap) picker.remove('banner')
            await FX.to(scene, box, { y: cy - 30, alpha: 0 }, { duration: T.short })
            box.destroy()
        },
        destroy() {
            if (tap) picker.remove('banner')
            box.destroy()
        },
    }
}
