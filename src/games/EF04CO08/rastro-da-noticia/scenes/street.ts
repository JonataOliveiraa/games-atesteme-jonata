import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { FACADE_SHEET, LOGO_CELL, LOGO_SHEET, STREET_KEY, cellKey, type FigureData } from '../data/files'
import { CAMERA, DEPTH, FACADE, GROUND, H, PAGE, type Box } from '../data/layout'
import { isOrigin, whenLabel } from '../data/levels'
import { SITES } from '../data/sites'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { LABEL } from '../data/words'
import type { LevelDef, Page, Rect, SiteId } from '../types'
import { CAL, baked, fit, fitInto } from './art'
import { union } from './guide'
import type { View } from './view'

export interface Street {
    readonly lots: { site: SiteId; x: number }[]
    near(x: number): SiteId | null
    xOf(site: SiteId): number
    showHome(site: SiteId): Promise<void>
    showPage(site: SiteId, page: Page, typed: boolean): Promise<void>
    resetAll(): Promise<void>
    focus(site: SiteId | null): void
    glow(site: SiteId): void
    screenRect(site: SiteId): Rect
    lookZoom(site: SiteId): number
    rowRect(site: SiteId): Rect
    whenRect(site: SiteId): Rect
    bounds(): Rect
    bounceRow(site: SiteId): Promise<void>
    destroy(): void
}

interface Lot {
    site: SiteId
    x: number
    facade: Phaser.GameObjects.Image
    sign: Phaser.GameObjects.Container
    signLogo: Phaser.GameObjects.Image
    rect: Rect
    k: number
    hd: number
    screen: Phaser.GameObjects.Container
    content: Phaser.GameObjects.Container
    flash: Phaser.GameObjects.Image
    rowIcon: Phaser.GameObjects.Image | null
    rowYs: number[]
    rowH: number
    idle: boolean
}

const text = (scene: Phaser.Scene, size: number, color: string, black = true) =>
    scene.add
        .text(0, 0, '', { fontFamily: black ? FONT.black : FONT.body, fontSize: `${size}px`, color, align: 'center' })
        .setOrigin(0.5)
        .setResolution(3)

const RES = 2

export function createStreet(scene: Phaser.Scene, view: View, level: LevelDef): Street {
    const art = (key: string, w: number, h: number, paint: (g: Phaser.GameObjects.Graphics) => void) => {
        baked(scene, key, w * RES, h * RES, g => {
            g.scaleCanvas(RES, RES)
            paint(g)
        })
        return scene.add.image(0, 0, key).setScale(1 / RES)
    }

    const deep = (obj: Phaser.GameObjects.GameObject) => {
        view.world(obj)
        if (obj instanceof Phaser.GameObjects.Container) obj.list.forEach(deep)
    }
    const source = scene.textures.get(STREET_KEY).getSourceImage()
    const tileW = (H * source.width) / source.height
    const backdrop = Array.from({ length: Math.ceil(level.width / tileW) }, (_, i) =>
        view.world(
            scene.add
                .image(i * tileW, 0, STREET_KEY)
                .setOrigin(0, 0)
                .setDisplaySize(tileW + 1, H)
                .setFlipX(i % 2 === 1)
                .setDepth(DEPTH.backdrop),
        ),
    )
    const sky = view.world(scene.add.rectangle(level.width / 2, -300, level.width, 600, C.sky).setDepth(DEPTH.backdrop))
    const floor = view.world(scene.add.rectangle(level.width / 2, H + 300, level.width, 600, C.walk).setDepth(DEPTH.backdrop))
    const veil = view.world(scene.add.rectangle(level.width / 2, H / 2, level.width, H * 3, C.veil, 0.62).setDepth(DEPTH.veil).setAlpha(0))
    const reserve = (scene.textures.get(FACADE_SHEET.key).customData as { baked?: boolean }).baked
    const boardsOf = (cell: number) => (reserve ? FACADE.reserve : (FACADE.boards[cell] ?? FACADE.reserve))

    const place = (facade: Phaser.GameObjects.Image, b: Box): Rect => {
        const f = facade.frame.customData as FigureData
        const s = facade.scaleX
        const footX = f.ox + facade.frame.width / 2
        const footY = f.oy + facade.frame.height
        return { x: facade.x + (b[0] + b[2] / 2 - footX) * s, y: facade.y + (b[1] + b[3] / 2 - footY) * s, w: b[2] * s, h: b[3] * s }
    }

    const lots: Lot[] = level.street.map(({ site, x }) => {
        const def = SITES[site]
        const facade = view.world(
            scene.add.image(x, GROUND, FACADE_SHEET.key, cellKey(def.facade)).setOrigin(0.5, 1).setDepth(DEPTH.facade),
        )
        facade.setScale(FACADE.width / (facade.frame.customData as FigureData).cellW)
        const boards = boardsOf(def.facade)

        const board = place(facade, boards.sign)
        const signLogo = fit(scene, LOGO_SHEET, def.logo, FACADE.signLogo)
        const signText = text(scene, SIZE.sign, CSS.ink).setText(def.name).setOrigin(0, 0.5)
        const total = FACADE.signLogo + 10 + signText.width
        signLogo.setPosition(-total / 2 + FACADE.signLogo / 2, 0)
        signText.setPosition(-total / 2 + FACADE.signLogo + 10, 0)
        const sign = scene.add
            .container(board.x, board.y, [signLogo, signText])
            .setScale(Math.min(1, (board.w * FACADE.signFill) / total, (board.h * 0.92) / FACADE.signLogo))
            .setDepth(DEPTH.sign)
        deep(sign)

        const rect = place(facade, boards.screen)
        const k = rect.w / PAGE.w
        const hd = rect.h / k
        const content = scene.add.container(0, 0)
        const flash = art(`rdn-flash-${Math.round(hd)}`, PAGE.w, Math.round(hd), g => {
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(0, 0, PAGE.w, Math.round(hd), PAGE.radius)
        }).setAlpha(0)
        const screen = scene.add.container(rect.x, rect.y, [content, flash]).setScale(k).setDepth(DEPTH.screen)
        deep(screen)
        return { site, x, facade, sign, signLogo, rect, k, hd, screen, content, flash, rowIcon: null, rowYs: [hd / 2 - PAGE.gap - PAGE.rowH / 2], rowH: PAGE.rowH, idle: false }
    })
    const lotOf = (site: SiteId) => lots.find(l => l.site === site) as Lot

    const chrome = (lot: Lot) => {
        const def = SITES[lot.site]
        const left = -PAGE.w / 2
        const top = -lot.hd / 2
        const mid = top + PAGE.bar / 2
        const bar = art('rdn-bar', PAGE.w, PAGE.bar, g => {
            g.fillStyle(C.bar, 1)
            g.fillRoundedRect(0, 0, PAGE.w, PAGE.bar, { tl: PAGE.radius, tr: PAGE.radius, bl: 0, br: 0 })
            g.fillStyle(C.barDark, 1)
            g.fillRect(0, PAGE.bar - 2, PAGE.w, 2)
            ;[C.coral, C.butter, C.mint].forEach((c, i) => {
                g.fillStyle(c, 1)
                g.fillCircle(18 + i * 16, PAGE.bar / 2, 5)
            })
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(72, 5, PAGE.w - 88, PAGE.bar - 10, 9)
        })
            .setOrigin(0.5, 0)
            .setPosition(0, top)
        const icon = fit(scene, LOGO_SHEET, def.logo, 16).setPosition(left + 88, mid)
        const address = scene.add
            .text(left + 102, mid, def.address, { fontFamily: FONT.body, fontSize: `${SIZE.address}px`, color: CSS.inkSoft })
            .setOrigin(0, 0.5)
            .setResolution(3)
        return [bar, icon, address]
    }

    const fill = (lot: Lot, parts: Phaser.GameObjects.GameObject[]) => {
        lot.content.removeAll(true)
        lot.rowIcon = null
        lot.content.add([...chrome(lot), ...parts])
        deep(lot.content)
    }

    const idle = (lot: Lot) => {
        const size = Math.min(PAGE.idleLogo, lot.hd - PAGE.bar - 20)
        fill(lot, [fit(scene, LOGO_SHEET, SITES[lot.site].logo, size).setPosition(0, PAGE.bar / 2)])
        lot.idle = true
    }

    const home = (lot: Lot) => {
        const top = -lot.hd / 2 + PAGE.bar + PAGE.gap
        const logo = fit(scene, LOGO_SHEET, SITES[lot.site].logo, PAGE.homeLogo).setPosition(0, top + PAGE.homeLogo / 2)
        const line = text(scene, SIZE.home, CSS.inkSoft, false)
            .setText(SITES[lot.site].home)
            .setPosition(0, lot.hd / 2 - PAGE.homeTextFromBottom)
        if (line.width > PAGE.textW) line.setScale(PAGE.textW / line.width)
        fill(lot, [logo, line])
        lot.idle = false
    }

    const row = (label: string, icon: Phaser.GameObjects.Image, value: string, y: number, h: number, size: number) => {
        const left = text(scene, size, CSS.inkSoft, false).setText(label).setOrigin(0, 0.5)
        const right = text(scene, size + 1, CSS.ink).setText(value).setOrigin(0, 0.5)
        const iconSize = h - 10
        fitInto(icon, iconSize)
        const total = left.width + 10 + iconSize + 8 + right.width
        const scale = Math.min(1, (PAGE.w - 28) / total)
        const x0 = -total / 2
        left.setPosition(x0, 0)
        icon.setPosition(x0 + left.width + 10 + iconSize / 2, 0)
        right.setPosition(x0 + left.width + 10 + iconSize + 8, 0)
        const bw = PAGE.w - 16
        const band = art(`rdn-band-${h}`, bw, h, g => {
            g.fillStyle(C.headerSoft, 1)
            g.fillRoundedRect(0, 0, bw, h, Math.min(14, h / 2 - 2))
        })
        band.setScale(1 / RES / scale)
        return { box: scene.add.container(0, y, [band, left, icon, right]).setScale(scale), icon }
    }

    const page = (lot: Lot, p: Page) => {
        const origin = isOrigin(p)
        const days = origin ? p.daysAgo : undefined
        const dated = days !== undefined
        const h = dated ? PAGE.rowHSmall : PAGE.rowH
        const size = dated ? SIZE.rowSmall : SIZE.row
        const last = lot.hd / 2 - PAGE.gap - h / 2
        const ys = dated ? [last - h - PAGE.rowGap, last] : [last]
        lot.rowYs = ys
        lot.rowH = h
        const top = -lot.hd / 2 + PAGE.bar + PAGE.gap
        const bottom = ys[0] - h / 2 - PAGE.gap
        const headline = text(scene, SIZE.headline, CSS.ink).setPosition(0, (top + bottom) / 2).setText(p.headline)
        if (dated) headline.setScale(Math.min(1, PAGE.textW / headline.width, (bottom - top) / headline.height))
        else {
            headline.setWordWrapWidth(PAGE.textW, true)
            if (headline.height > bottom - top) headline.setScale((bottom - top) / headline.height)
        }
        const who = origin
            ? row(LABEL.wrote, fit(scene, LOGO_SHEET, LOGO_CELL.pen, 1), p.author ?? LABEL.nobody, ys[0], h, size)
            : row(LABEL.copied, fit(scene, LOGO_SHEET, SITES[p.from].logo, 1), SITES[p.from].name, ys[0], h, size)
        const rows = [who.box]
        if (dated) rows.push(row(LABEL.when, scene.add.image(0, 0, CAL), whenLabel(days), ys[1], h, size).box)
        fill(lot, [headline, ...rows])
        lot.rowIcon = who.icon
        lot.idle = false
        return { headline, rows }
    }

    const flashOn = async (lot: Lot) => {
        lot.flash.setAlpha(1)
        await FX.to(scene, lot.flash, { alpha: 0 }, { duration: 420 })
    }

    const street: Street = {
        lots: lots.map(l => ({ site: l.site, x: l.x })),
        near(x) {
            const lot = lots.find(l => Math.abs(l.x - x) <= FACADE.reach)
            return lot?.site ?? null
        },
        xOf: site => lotOf(site).x,
        async showHome(site) {
            const lot = lotOf(site)
            home(lot)
            await flashOn(lot)
        },
        async showPage(site, p, typed) {
            const lot = lotOf(site)
            const { headline, rows } = page(lot, p)
            if (!typed) {
                await flashOn(lot)
                return
            }
            const full = p.headline
            headline.setText('')
            rows.forEach(r => r.setAlpha(0))
            await flashOn(lot)
            await FX.type(scene, headline, full, { delay: PAGE.typeMs })
            for (const r of rows) {
                await FX.wait(scene, 260)
                const y = r.y
                r.setY(y + 14)
                await FX.to(scene, r, { alpha: 1, y }, { duration: 360, ease: 'Sine.easeOut' })
            }
        },
        async resetAll() {
            street.focus(null)
            const lit = lots.filter(l => !l.idle)
            lit.forEach(idle)
            await FX.all(...lit.map(flashOn))
        },
        focus(site) {
            lots.forEach(l => l.screen.setDepth(l.site === site ? DEPTH.focus : DEPTH.screen))
            scene.tweens.killTweensOf(veil)
            void FX.to(scene, veil, { alpha: site ? 1 : 0 }, { duration: 320 })
        },
        glow(site) {
            const lot = lotOf(site)
            scene.tweens.killTweensOf(lot.signLogo)
            lot.signLogo.setY(0)
            void FX.to(scene, lot.signLogo, { y: -16 }, { duration: 180, yoyo: true, ease: 'Sine.easeOut' })
            void flashOn(lot)
        },
        screenRect: site => ({ ...lotOf(site).rect }),
        lookZoom(site) {
            return Phaser.Math.Clamp(CAMERA.lookW / lotOf(site).rect.w, CAMERA.lookMin, CAMERA.lookMax)
        },
        rowRect(site) {
            const lot = lotOf(site)
            return { x: lot.rect.x, y: lot.rect.y + lot.rowYs[0] * lot.k, w: (PAGE.w - 8) * lot.k, h: (lot.rowH + 10) * lot.k }
        },
        whenRect(site) {
            const lot = lotOf(site)
            const y = lot.rowYs[lot.rowYs.length - 1]
            return { x: lot.rect.x, y: lot.rect.y + y * lot.k, w: (PAGE.w - 8) * lot.k, h: (lot.rowH + 10) * lot.k }
        },
        bounds() {
            return lots
                .map(l => {
                    const b = l.facade.getBounds()
                    return { x: b.centerX, y: b.centerY, w: b.width, h: b.height }
                })
                .reduce(union)
        },
        async bounceRow(site) {
            const icon = lotOf(site).rowIcon
            if (!icon) return
            scene.tweens.killTweensOf(icon)
            icon.setY(0)
            await FX.to(scene, icon, { y: -14 }, { duration: 180, yoyo: true, ease: 'Sine.easeOut' })
            icon.setY(0)
        },
        destroy() {
            lots.forEach(l => {
                scene.tweens.killTweensOf([l.signLogo, l.flash])
                l.screen.destroy()
                l.sign.destroy()
                l.facade.destroy()
            })
            veil.destroy()
            sky.destroy()
            floor.destroy()
            backdrop.forEach(b => b.destroy())
        },
    }
    lots.forEach(idle)
    return street
}
