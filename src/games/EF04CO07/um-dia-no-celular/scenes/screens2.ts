import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CITY, DEPTH, SCREEN, STATUS } from '../data/layout'
import { C, CSS } from '../data/theme'
import { T } from '../data/timing'
import { COINS, FWD_LIST, FWD_NUMBER, MAP, NAME, PERMISSION, POSTER, SHARE } from '../data/words'
import type { AppId, Kid, Sender } from '../types'
import { appImage, paintAvatar, paintImage, thingImage } from './art'
import type { Picker } from './picker'
import { abs, backdrop, centered, chevron, layerAt, text, type Screen } from './screens'


const SW = SCREEN.w
const SH = SCREEN.h

const BUTTON = { w: SW - 24, h: 62, gap: 12 }

const KIDS: Kid[] = ['nina', 'caio', 'bia', 'duda', 'rafa']

function choice(scene: Phaser.Scene, label: string, w = BUTTON.w, h = BUTTON.h, tone: 'light' | 'primary' = 'light') {
    const face = tone === 'primary' ? C.accent : C.white
    const edge = tone === 'primary' ? C.accentDark : C.accent
    const lip = tone === 'primary' ? C.accentDark : C.lilac
    const back = centered(scene, w, h + 6, g => {
        g.fillStyle(C.shadow, 0.14)
        g.fillRoundedRect(-w / 2 + 2, -h / 2 + 9, w, h - 2, 20)
        g.fillStyle(lip, 1)
        g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h - 3, 20)
        g.lineStyle(3, edge, 1)
        g.strokeRoundedRect(-w / 2, -h / 2 + 4, w, h - 3, 20)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-w / 2, -h / 2 - 1, w, h - 3, 20)
        g.lineStyle(3, edge, 1)
        g.strokeRoundedRect(-w / 2, -h / 2 - 1, w, h - 3, 20)
    })
    const t = text(scene, 0, -2, label, 19, tone === 'primary' ? CSS.white : CSS.accentDark, { black: true, wrap: w - 26, align: 'center' }).setOrigin(0.5)
    return scene.add.container(0, 0, [back, t])
}

function popIn(scene: Phaser.Scene, obj: Phaser.GameObjects.Container, delay = 0) {
    obj.setScale(0.85).setAlpha(0)
    return FX.to(scene, obj, { scale: 1, alpha: 1 }, { duration: T.chip, ease: 'Back.easeOut', delay })
}

// ───────────────────────────────────────────────────────── folha de envio

export type ShareButton = 'send' | 'ask' | 'keep'

export interface ShareSheet {
    show(buttons: ShareButton[]): Promise<void>
    status(kind: 'waiting' | 'yes' | 'no' | 'sent'): void
    close(): Promise<void>
    destroy(): void
}

export async function openShare(scene: Phaser.Scene, picker: Picker, dest: Sender, owner: Sender | null): Promise<ShareSheet> {
    const layer = layerAt(scene, DEPTH.screen + 1)
    const panelH = 300
    const top = SH - panelH
    const dim = backdrop(scene, g => {
        g.fillStyle(C.shadow, 0.45)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
    }).setAlpha(0)
    const panel = paintImage(scene, SW, panelH, g => {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(0, 0, SW, panelH, { tl: 26, tr: 26, bl: SCREEN.r, br: SCREEN.r })
        g.fillStyle(C.headerRim, 1)
        g.fillRoundedRect(SW / 2 - 24, 10, 48, 6, 3)
    })
    const title = text(scene, 18, 30, SHARE.title, 16, CSS.grey, { black: true })
    const avatar = scene.add.image(42, 78, paintAvatar(scene, dest)).setDisplaySize(46, 46)
    const name = text(scene, 74, 78, NAME[dest], 20, CSS.ink, { black: true }).setOrigin(0, 0.5)
    const line = text(scene, SW / 2, 120, '', 17, CSS.inkSoft, { black: true }).setOrigin(0.5)
    const sheet = scene.add.container(0, top, [panel, title, avatar, name, line])
    layer.add([dim, sheet])
    sheet.setY(SH)
    await FX.all(FX.to(scene, dim, { alpha: 1 }, { duration: T.short }), FX.to(scene, sheet, { y: top }, { duration: T.short + 80, ease: 'Cubic.easeOut' }))

    let buttons: Array<{ id: string; box: Phaser.GameObjects.Container }> = []
    const clear = () => {
        buttons.forEach(b => {
            picker.remove(b.id)
            b.box.destroy()
        })
        buttons = []
    }
    const label = (kind: ShareButton) => (kind === 'send' ? SHARE.send(dest) : kind === 'ask' ? SHARE.ask(owner ?? dest) : SHARE.keep)

    return {
        async show(kinds) {
            clear()
            const slots = kinds.length === 1 ? [top + 220] : [top + 178, top + 178 + BUTTON.h + BUTTON.gap]
            await FX.all(
                ...kinds.map((kind, i) => {
                    const box = choice(scene, label(kind))
                    box.setPosition(SW / 2, slots[i])
                    layer.add(box)
                    const id = `share:${kind}`
                    picker.add(id, box, abs(SW / 2, slots[i], BUTTON.w, BUTTON.h))
                    buttons.push({ id, box })
                    return popIn(scene, box, i * T.chipGap)
                }),
            )
        },
        status(kind) {
            clear()
            const who = owner ?? dest
            const value = kind === 'waiting' ? SHARE.waiting : kind === 'yes' ? SHARE.yes(who) : kind === 'no' ? SHARE.no(who) : SHARE.sent
            const color = kind === 'yes' ? CSS.yes : kind === 'no' ? CSS.oops : CSS.inkSoft
            line.setText(value).setColor(color).setScale(0.8)
            void FX.to(scene, line, { scale: 1 }, { duration: 220, ease: 'Back.easeOut' })
        },
        async close() {
            clear()
            await FX.all(FX.to(scene, dim, { alpha: 0 }, { duration: T.short }), FX.to(scene, sheet, { y: SH }, { duration: T.short }))
            layer.destroy()
        },
        destroy() {
            clear()
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── contato

export interface ContactScreen extends Screen {
    rect(): { x: number; y: number }
}

export function createContact(scene: Phaser.Scene, picker: Picker, who: Kid): ContactScreen {
    const layer = layerAt(scene)
    const bar = STATUS.h + 32
    const bg = backdrop(scene, g => {
        g.fillStyle(C.chatBg, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(14, 110, SW - 28, 250, 24)
        chevron(g, 18, bar, C.ink)
    })
    const title = text(scene, 40, bar, 'Contatos', 18, CSS.ink, { black: true }).setOrigin(0, 0.5)
    const avatar = scene.add.image(SW / 2, 190, paintAvatar(scene, who)).setDisplaySize(120, 120)
    const name = text(scene, SW / 2, 278, NAME[who], 28, CSS.ink, { black: true }).setOrigin(0.5)
    const number = text(scene, SW / 2, 318, FWD_NUMBER.number, 20, CSS.inkSoft, { black: true }).setOrigin(0.5)
    const button = choice(scene, SHARE.forwardContact, BUTTON.w, BUTTON.h, 'primary').setPosition(SW / 2, SH - 70)
    layer.add([bg, title, avatar, name, number, button])
    picker.add('contact:forward', button, abs(SW / 2, SH - 70, BUTTON.w, BUTTON.h))
    return {
        layer,
        dark: false,
        rect: () => ({ x: SCREEN.x + SW / 2, y: SCREEN.y + 220 }),
        destroy() {
            picker.remove('contact:forward')
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── lista da turma

export function createDoc(scene: Phaser.Scene, picker: Picker): Screen {
    const layer = layerAt(scene)
    const bar = STATUS.h + 32
    const bg = backdrop(scene, g => {
        g.fillStyle(0xf6f2ff, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        chevron(g, 18, bar, C.ink)
        g.fillStyle(C.shadow, 0.12)
        g.fillRoundedRect(14, 120, SW - 28, 300, 18)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(14, 114, SW - 28, 300, 18)
        g.fillStyle(0xd9d2f0, 1)
        KIDS.slice(1).forEach((_, i) => g.fillRect(30, 160 + i * 56 + 28, SW - 60, 2))
    })
    const title = text(scene, 40, bar, FWD_LIST.title, 18, CSS.ink, { black: true }).setOrigin(0, 0.5)
    const rows = KIDS.map((who, i) => {
        const y = 160 + i * 56
        const face = scene.add.image(64, y, paintAvatar(scene, who)).setDisplaySize(36, 36)
        const name = text(scene, 90, y - 10, NAME[who], 18, CSS.ink, { black: true }).setOrigin(0, 0.5)
        const number = text(scene, 90, y + 12, `(11) 9${i}${i + 3}••-••${i}${i + 1}`, 15, CSS.inkSoft).setOrigin(0, 0.5)
        return [face, name, number]
    })
    const button = choice(scene, SHARE.forward, BUTTON.w, BUTTON.h, 'primary').setPosition(SW / 2, SH - 62)
    layer.add([bg, title, ...rows.flat(), button])
    picker.add('doc:forward', button, abs(SW / 2, SH - 62, BUTTON.w, BUTTON.h))
    return {
        layer,
        dark: false,
        destroy() {
            picker.remove('doc:forward')
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── permissão

export interface Permission {
    close(): Promise<void>
    destroy(): void
}

export async function openPermission(scene: Phaser.Scene, picker: Picker, app: AppId, line: string): Promise<Permission> {
    const layer = layerAt(scene, DEPTH.screen + 1)
    const dim = backdrop(scene, g => {
        g.fillStyle(C.shadow, 0.6)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
    }).setAlpha(0)
    const cardW = SW - 20
    const cardH = 330
    const card = centered(scene, cardW, cardH, g => {
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 26)
    })
    const icon = appImage(scene, app, 70).setPosition(0, -cardH / 2 + 56)
    const body = text(scene, 0, -cardH / 2 + 136, line, 20, CSS.ink, { black: true, wrap: cardW - 36, align: 'center' }).setOrigin(0.5)
    const box = scene.add.container(SW / 2, SH / 2 + 10, [card, icon, body])
    layer.add([dim, box])
    box.setScale(0.8).setAlpha(0)
    await FX.all(FX.to(scene, dim, { alpha: 1 }, { duration: T.short }), FX.to(scene, box, { scale: 1, alpha: 1 }, { duration: T.short, ease: 'Back.easeOut' }))
    const buttons = [
        { id: 'perm:allow', label: PERMISSION.allow, dy: 52 },
        { id: 'perm:deny', label: PERMISSION.deny, dy: 52 + BUTTON.h + BUTTON.gap },
    ].map(({ id, label, dy }) => {
        const b = choice(scene, label, cardW - 36)
        b.setPosition(SW / 2, SH / 2 + 10 + dy)
        layer.add(b)
        picker.add(id, b, abs(SW / 2, SH / 2 + 10 + dy, cardW - 36, BUTTON.h))
        void popIn(scene, b)
        return { id, b }
    })
    return {
        async close() {
            buttons.forEach(({ id }) => picker.remove(id))
            await FX.to(scene, [dim, box, ...buttons.map(x => x.b)], { alpha: 0 }, { duration: T.short })
            layer.destroy()
        },
        destroy() {
            buttons.forEach(({ id }) => picker.remove(id))
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── lanterna

export interface Lamp extends Screen {
    on(): Promise<void>
}

export function createLamp(scene: Phaser.Scene, picker: Picker): Lamp {
    const layer = layerAt(scene)
    const bg = backdrop(scene, g => {
        g.fillStyle(0x1a1830, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
    })
    const glow = backdrop(scene, g => {
        g.fillStyle(0xfff6c8, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
    }).setAlpha(0)
    const icon = appImage(scene, 'flashlight', 150)
    const ring = centered(scene, 190, 190, g => {
        g.lineStyle(8, C.white, 0.9)
        g.strokeCircle(0, 0, 88)
    })
    const button = scene.add.container(SW / 2, SH / 2 + 20, [ring, icon])
    layer.add([bg, glow, button])
    picker.add('lamp:on', button, abs(SW / 2, SH / 2 + 20, 190, 190))
    return {
        layer,
        dark: true,
        async on() {
            picker.remove('lamp:on')
            button.setAlpha(1)
            await FX.to(scene, glow, { alpha: 1 }, { duration: T.short })
        },
        destroy() {
            picker.remove('lamp:on')
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── mapa

export interface MapScreen extends Screen {
    locate(): Promise<void>
    lose(): Promise<void>
}

export function createMap(scene: Phaser.Scene): MapScreen {
    const layer = layerAt(scene)
    const half = CITY.road / 2
    const bg = backdrop(scene, g => {
        g.fillStyle(0xcfe8b4, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        const roads = (pad: number) => {
            CITY.cols.forEach(x => g.fillRect(x - half - pad, 0, CITY.road + pad * 2, SH))
            CITY.rows.forEach(y => g.fillRect(0, y - half - pad, SW, CITY.road + pad * 2))
        }
        g.fillStyle(0xb9d79c, 1)
        roads(3)
        g.fillStyle(0xfffaf0, 1)
        roads(0)
    })
    const you = CITY.route[0]
    const goal = CITY.route[CITY.route.length - 1]
    const route = scene.add.graphics()
    const flag = centered(scene, 40, 56, g => {
        g.fillStyle(C.shadow, 0.25)
        g.fillEllipse(0, 24, 18, 7)
        g.fillStyle(C.coral, 1)
        g.fillCircle(0, -10, 15)
        g.fillTriangle(-13, -3, 13, -3, 0, 24)
        g.fillStyle(C.white, 1)
        g.fillCircle(0, -10, 6)
    })
        .setPosition(goal.x, goal.y - 24)
        .setAlpha(0)
    const dot = centered(scene, 44, 44, g => {
        g.fillStyle(C.white, 1)
        g.fillCircle(0, 0, 18)
        g.fillStyle(0x3b82f6, 1)
        g.fillCircle(0, 0, 12)
    }).setPosition(you.x, you.y)
    const pulse = scene.add.circle(you.x, you.y, 20, 0x3b82f6, 0.25)
    const here = text(scene, you.x, you.y + 30, MAP.here, 15, CSS.ink, { black: true }).setOrigin(0.5, 0)
    here.setStroke(CSS.white, 4)
    const fog = backdrop(scene, g => {
        g.fillStyle(0x6b6680, 0.55)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
    }).setAlpha(0)
    const question = text(scene, SW / 2, SH / 2 - 20, '?', 120, CSS.white, { black: true }).setOrigin(0.5).setAlpha(0)
    const lost = text(scene, SW / 2, SH / 2 + 70, MAP.unknown, 22, CSS.white, { black: true }).setOrigin(0.5).setAlpha(0)
    ;[dot, pulse, here].forEach(o => o.setAlpha(0))
    layer.add([bg, route, flag, pulse, dot, here, fog, question, lost])
    return {
        layer,
        dark: false,
        async locate() {
            await FX.to(scene, [dot, here], { alpha: 1 }, { duration: T.short })
            pulse.setAlpha(1)
            scene.tweens.add({ targets: pulse, scale: 2.2, alpha: 0, duration: 900, repeat: -1 })
            route.fillStyle(0x3b82f6, 1)
            for (let i = 1; i < CITY.route.length; i++) {
                const a = CITY.route[i - 1]
                const b = CITY.route[i]
                const steps = Math.round(Phaser.Math.Distance.Between(a.x, a.y, b.x, b.y) / 14)
                for (let s = i === 1 ? 2 : 1; s <= steps; s++) {
                    route.fillCircle(Phaser.Math.Linear(a.x, b.x, s / steps), Phaser.Math.Linear(a.y, b.y, s / steps), 4.5)
                    await FX.wait(scene, 28)
                }
            }
            flag.setY(goal.y - 44)
            await FX.to(scene, flag, { alpha: 1, y: goal.y - 24 }, { duration: T.short, ease: 'Bounce.easeOut' })
        },
        async lose() {
            await FX.to(scene, [fog, question, lost], { alpha: 1 }, { duration: T.short })
        },
        destroy() {
            scene.tweens.killTweensOf(pulse)
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── cartaz

export interface PosterScreen extends Screen {
    sign(name: string): Promise<void>
}

export function createPoster(scene: Phaser.Scene, picker: Picker): PosterScreen {
    const layer = layerAt(scene)
    const bg = backdrop(scene, g => {
        g.fillStyle(0xfdf3e3, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
    })
    const poster = thingImage(scene, 'poster', 300)
    poster.setDisplaySize(SW - 40, 340).setPosition(SW / 2, 214)
    const title = text(scene, SW / 2, 86, POSTER.title, 20, CSS.ink, { black: true }).setOrigin(0.5)
    const drawing = thingImage(scene, 'drawing', 150).setPosition(SW / 2, 206)
    const sign = text(scene, SW / 2, 322, `${POSTER.sign} ______`, 18, CSS.inkSoft, { black: true }).setOrigin(0.5)
    const credit = choice(scene, POSTER.credit).setPosition(SW / 2, 440)
    const mine = choice(scene, POSTER.mine).setPosition(SW / 2, 440 + BUTTON.h + BUTTON.gap)
    layer.add([bg, poster, title, drawing, sign, credit, mine])
    picker.add('poster:credit', credit, abs(SW / 2, 440, BUTTON.w, BUTTON.h))
    picker.add('poster:mine', mine, abs(SW / 2, 440 + BUTTON.h + BUTTON.gap, BUTTON.w, BUTTON.h))
    return {
        layer,
        dark: false,
        async sign(name) {
            picker.remove('poster:credit')
            picker.remove('poster:mine')
            await FX.to(scene, [credit, mine], { alpha: 0 }, { duration: T.short })
            sign.setText(`${POSTER.sign} ${name}`).setColor(CSS.accentDark).setScale(1.4)
            await FX.to(scene, sign, { scale: 1 }, { duration: 320, ease: 'Back.easeOut' })
        },
        destroy() {
            picker.remove('poster:credit')
            picker.remove('poster:mine')
            layer.destroy()
        },
    }
}

// ───────────────────────────────────────────────────────── bichinho

export interface PetScreen extends Screen {
    showOffer(): Promise<void>
    keepHappy(): Promise<void>
    coinsVanish(): Promise<void>
}

export function createPet(scene: Phaser.Scene, picker: Picker): PetScreen {
    const layer = layerAt(scene)
    const bg = backdrop(scene, g => {
        g.fillStyle(0xfff3c4, 1)
        g.fillRoundedRect(0, 0, SW, SH, SCREEN.r)
        g.fillStyle(0xbfe8a0, 1)
        g.fillRoundedRect(0, SH - 150, SW, 150, { tl: 0, tr: 0, bl: SCREEN.r, br: SCREEN.r })
    })
    const chick = appImage(scene, 'pet', 170).setPosition(SW / 2, 180)
    scene.tweens.add({ targets: chick, y: 168, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    const happy = text(scene, SW / 2, 300, COINS.fine, 19, CSS.ink, { black: true, wrap: SW - 30, align: 'center' }).setOrigin(0.5).setAlpha(0)
    const cardW = SW - 20
    const cardH = 300
    const card = centered(scene, cardW, cardH, g => {
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-cardW / 2 + 3, -cardH / 2 + 6, cardW, cardH, 24)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 24)
        g.lineStyle(4, C.gold, 1)
        g.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 24)
    })
    const title = text(scene, 0, -cardH / 2 + 46, COINS.title, 24, '#d99a1c', { black: true }).setOrigin(0, 0.5)
    const coinLeft = -(56 + 10 + title.width) / 2
    const coin = thingImage(scene, 'coin', 56).setPosition(coinLeft + 28, -cardH / 2 + 46)
    title.setX(coinLeft + 56 + 10)
    const body = text(scene, 0, -cardH / 2 + 104, COINS.text, 18, CSS.ink, { black: true, wrap: cardW - 30, align: 'center' }).setOrigin(0.5)
    const popupY = SH - 170
    const popup = scene.add.container(SW / 2, popupY, [card, coin, title, body]).setAlpha(0)
    const allow = choice(scene, COINS.allow, cardW - 30)
    const deny = choice(scene, COINS.deny, cardW - 30)
    allow.setPosition(SW / 2, popupY + 26).setAlpha(0)
    deny.setPosition(SW / 2, popupY + 26 + BUTTON.h + BUTTON.gap).setAlpha(0)
    layer.add([bg, chick, happy, popup, allow, deny])
    const coins: Phaser.GameObjects.Image[] = []
    return {
        layer,
        dark: false,
        async showOffer() {
            popup.setY(popupY + 40)
            await FX.to(scene, popup, { alpha: 1, y: popupY }, { duration: T.short, ease: 'Back.easeOut' })
            picker.add('pet:allow', allow, abs(SW / 2, popupY + 26, cardW - 30, BUTTON.h))
            picker.add('pet:deny', deny, abs(SW / 2, popupY + 26 + BUTTON.h + BUTTON.gap, cardW - 30, BUTTON.h))
            await FX.all(popIn(scene, allow), popIn(scene, deny, T.chipGap))
        },
        async keepHappy() {
            picker.remove('pet:allow')
            picker.remove('pet:deny')
            await FX.to(scene, [popup, allow, deny], { alpha: 0, y: '+=40' }, { duration: T.short })
            await FX.to(scene, happy, { alpha: 1 }, { duration: T.short })
        },
        async coinsVanish() {
            picker.remove('pet:allow')
            picker.remove('pet:deny')
            await FX.to(scene, [popup, allow, deny], { alpha: 0 }, { duration: T.short })
            for (let i = 0; i < 9; i++) {
                const c = thingImage(scene, 'coin', 40).setPosition(30 + ((i * 37) % (SW - 60)), -20)
                layer.add(c)
                coins.push(c)
                void FX.to(scene, c, { y: 240 + (i % 3) * 40 }, { duration: 500, ease: 'Bounce.easeOut', delay: i * 60 })
            }
            await FX.wait(scene, 1100)
            coins.forEach(c => c.setTint(0x9c97b0))
            await FX.to(scene, coins, { alpha: 0, y: '+=60' }, { duration: 700 })
        },
        destroy() {
            scene.tweens.killTweensOf(chick)
            picker.remove('pet:allow')
            picker.remove('pet:deny')
            layer.destroy()
        },
    }
}
