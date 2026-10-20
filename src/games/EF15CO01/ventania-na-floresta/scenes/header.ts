import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { ANT_CELL, ANT_SHEET, BUG_SHEET, FLOWER_SHEET, PIECE_SHEET, bugCell, cellKey, flowerCell, pieceCell, sheetData } from '../data/files'
import { DEPTH, HEADER, HUD, PIECE_TEXT_AT, REQUEST, W } from '../data/layout'
import { C, CSS, FONT, SIZE, TONE, inkOn } from '../data/theme'
import { HOME_LABEL, LABEL, PIECE_TEXT, RULE } from '../data/words'
import type { Bug, Edge, Home, Piece, Rect, Structure } from '../types'
import { paintImage } from './art'

export interface Header {
    readonly lives: Lives
    setPhase(index: number): void
    celebrate(index: number): Promise<void>
    setRequest(type: Structure): void
    setPair(edge: Edge): void
    setPiece(piece: Piece): void
    lightHome(home: Home): Promise<void>
    iconRect(): Rect
    bounceRequest(): Promise<void>
    requestRect(): Rect
    setHelpEnabled(on: boolean): void
    visible(on: boolean): void
    destroy(): void
}

export interface HeaderOptions {
    level: number
    phases: number
    livesTotal: number
    livesLeft: number
    gameId: string
    stage: () => number
    onHelp: () => void
}

export function createHeader(scene: Phaser.Scene, opts: HeaderOptions): Header {
    const band = paintImage(scene, W, HEADER.h + 10, g => {
        g.fillStyle(C.shadow, 0.16)
        g.fillRect(0, HEADER.h + 2, W, 8)
        g.fillStyle(C.headerFace, 1)
        g.fillRect(0, 0, W, HEADER.h)
        g.fillStyle(C.headerRim, 1)
        g.fillRect(0, HEADER.h - 6, W, 6)
        g.fillStyle(C.headerLine, 0.55)
        g.fillRect(0, HEADER.h, W, 2)
        HEADER.dividers.forEach(x => {
            g.fillStyle(C.headerRim, 1)
            g.fillRoundedRect(x - 1.5, 18, 3, HEADER.h - 40, 1.5)
        })
    })
        .setOrigin(0, 0)
        .setDepth(DEPTH.header)

    const top = HUD.y - HUD.levelH / 2
    const pill = paintImage(scene, HUD.levelW, HUD.levelH + 4, g => {
        g.fillStyle(C.headerLine, 1)
        g.fillRoundedRect(0, 4, HUD.levelW, HUD.levelH, HUD.levelH / 2)
        g.fillStyle(C.accent, 1)
        g.fillRoundedRect(0, 0, HUD.levelW, HUD.levelH, HUD.levelH / 2)
    })
        .setOrigin(0, 0)
        .setPosition(HUD.levelX, top)
        .setDepth(DEPTH.hud)
    const levelText = scene.add
        .text(HUD.levelX + HUD.levelW / 2, HUD.y, `${LABEL.level} ${opts.level}`, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.level}px`,
            color: inkOn(C.accent),
        })
        .setOrigin(0.5)
        .setResolution(2)
        .setDepth(DEPTH.hud + 1)

    const pips = Array.from({ length: opts.phases }, (_, i) =>
        scene.add.circle(HUD.pipsX + i * HUD.pipGap, HUD.y, HUD.pipR, C.headerSoft).setDepth(DEPTH.hud + 1),
    )
    let current = 0
    const paint = () =>
        pips.forEach((pip, i) => {
            const done = i < current
            const now = i === current
            pip.setFillStyle(done ? C.yes : now ? C.butter : C.white)
            pip.setStrokeStyle(3, C.headerLine, done || now ? 1 : 0.5)
            pip.setScale(now ? 1.15 : 1)
        })
    paint()

    const request = scene.add.container(REQUEST.x, REQUEST.y).setDepth(DEPTH.hud)
    let requestW = 0

    const antIcon = (scale: number) => {
        const data = sheetData(scene, ANT_SHEET)
        const img = scene.add.image(0, 0, ANT_SHEET.key, cellKey(ANT_CELL.idle)).setOrigin(0.5, 1)
        const k = (REQUEST.iconH / (data.maxH ?? img.height)) * scale
        return img.setScale(k)
    }

    const chevron = () =>
        paintImage(scene, 18, 24, g => {
            g.lineStyle(5, C.inkSoft, 1)
            g.beginPath()
            g.moveTo(4, 3)
            g.lineTo(14, 12)
            g.lineTo(4, 21)
            g.strokePath()
        })

    const lineIcon = () => {
        const parts: Phaser.GameObjects.GameObject[] = []
        const sizes = [1, 0.74, 0.52]
        let x = 0
        sizes.forEach((s, i) => {
            const ant = antIcon(s)
            ant.setPosition(x + ant.displayWidth / 2, REQUEST.iconH / 2)
            parts.push(ant)
            x += ant.displayWidth
            if (i < sizes.length - 1) {
                const c = chevron().setOrigin(0, 0.5).setPosition(x + 4, 4)
                parts.push(c)
                x += 26
            }
        })
        const box = scene.add.container(0, 0, parts)
        return { box, w: x }
    }

    const gridIcon = () => {
        const s = 25
        const size = s * 3 + 8
        const at = (r: number, c: number) => ({ x: 4 + c * s + (s - 3) / 2, y: -size / 2 + 4 + r * s + (s - 3) / 2 })
        const grid = paintImage(scene, size, size, g => {
            for (let r = 1; r < 3; r++)
                for (let c = 1; c < 3; c++) {
                    g.fillStyle(C.soil, 1)
                    g.fillRoundedRect(4 + c * s, 4 + r * s, s - 3, s - 3, 5)
                }
            g.fillStyle(TONE.amarela.fill, 1)
            g.fillCircle(4 + s * 1.5 - 1.5, 4 + s / 2 - 1.5, 8)
            g.fillStyle(TONE.azul.fill, 1)
            g.fillCircle(4 + s * 2.5 - 1.5, 4 + s / 2 - 1.5, 8)
            g.lineStyle(2, C.headerLine, 0.8)
            g.strokeCircle(4 + s * 1.5 - 1.5, 4 + s / 2 - 1.5, 8)
            g.strokeCircle(4 + s * 2.5 - 1.5, 4 + s / 2 - 1.5, 8)
        }).setOrigin(0, 0.5)
        const k = 24 / (sheetData(scene, FLOWER_SHEET).maxH ?? 200)
        const flowerAt = (r: number, c: number, kind: 'margarida' | 'tulipa', silhouette: boolean) => {
            const p = at(r, c)
            const img = scene.add.image(p.x, p.y, FLOWER_SHEET.key, cellKey(flowerCell(kind, 'amarela'))).setScale(k)
            if (silhouette) img.setTintFill(C.silhouette)
            return img
        }
        const box = scene.add.container(0, 0, [
            grid,
            flowerAt(1, 0, 'margarida', true),
            flowerAt(2, 0, 'tulipa', true),
            flowerAt(1, 1, 'margarida', false),
        ])
        return { box, w: size }
    }

    const chipOf = (text: string) => {
        const label = scene.add
            .text(0, 0, text, { fontFamily: FONT.black, fontSize: `${SIZE.chip}px`, color: inkOn(C.chip) })
            .setOrigin(0.5)
            .setResolution(2)
        const w = label.width + REQUEST.chipPad * 2
        const h = REQUEST.chipH
        const art = paintImage(scene, w, h + 5, g => {
            g.fillStyle(C.chipDark, 1)
            g.fillRoundedRect(0, 5, w, h, h / 2)
            g.fillStyle(C.chip, 1)
            g.fillRoundedRect(0, 0, w, h, h / 2)
            g.fillStyle(C.white, 0.18)
            g.fillRoundedRect(8, 5, w - 16, h * 0.32, h * 0.16)
        }).setOrigin(0.5, 0.5)
        art.setY(2)
        label.setY(-1)
        const box = scene.add.container(0, 0, [art, label])
        return { box, w }
    }

    const fichaIcon = () => {
        const w = 74
        const h = 62
        const art = paintImage(scene, w, h, g => {
            g.fillStyle(C.creamDark, 1)
            g.fillRoundedRect(0, 3, w, h - 3, 10)
            g.fillStyle(C.board, 1)
            g.fillRoundedRect(0, 0, w, h - 4, 10)
            g.lineStyle(3, C.woodDark, 1)
            g.strokeRoundedRect(1.5, 1.5, w - 3, h - 7, 9)
            ;[C.laranja, C.verde].forEach((fill, r) => {
                const y = 17 + r * 23
                g.fillStyle(C.labelRing, 1)
                g.fillCircle(20, y, 9)
                g.lineStyle(2, C.labelIcon, 0.8)
                g.strokeCircle(20, y, 9)
                g.fillStyle(C.labelIcon, 1)
                g.fillRect(16, y - 1.5, 8, 3)
                g.fillStyle(fill, 1)
                g.fillCircle(52, y, 8)
            })
        }).setOrigin(0, 0.5)
        return { box: scene.add.container(0, 0, [art]), w }
    }

    const bugIcon = (bug: Bug, x: number) => {
        const img = scene.add.image(x, 0, BUG_SHEET.key, cellKey(bugCell(bug)))
        return img.setScale(44 / (sheetData(scene, BUG_SHEET).maxW ?? img.width))
    }

    const pairIcon = (edge?: Edge) => {
        const w = 156
        const h = 64
        const card = paintImage(scene, w, h, g => {
            g.fillStyle(C.shadeDark, 1)
            g.fillRoundedRect(0, 3, w, h - 3, 18)
            g.fillStyle(C.shade, 1)
            g.fillRoundedRect(0, 0, w, h - 4, 18)
            g.lineStyle(5, C.thread, 1)
            g.lineBetween(34, (h - 4) / 2, w - 34, (h - 4) / 2)
        }).setOrigin(0, 0.5)
        const parts: Phaser.GameObjects.GameObject[] = [card]
        if (edge) parts.push(bugIcon(edge[0], 32), bugIcon(edge[1], w - 32))
        return { box: scene.add.container(0, 0, parts), w }
    }

    const pieceIcon = (p?: Piece) => {
        if (!p) return { box: scene.add.container(0, 0, []), w: 0 }
        const img = scene.add.image(0, 0, PIECE_SHEET.key, cellKey(pieceCell(p)))
        img.setScale(Math.min(96 / img.width, 66 / img.height))
        const size = img.displayWidth
        img.setX(size / 2)
        const parts: Phaser.GameObjects.GameObject[] = [img]
        const at = PIECE_TEXT_AT[p]
        const text = (PIECE_TEXT as Record<string, string>)[p]
        if (at && text)
            parts.push(
                scene.add
                    .text(size / 2 + at.x * img.displayWidth, at.y * img.displayHeight, text, {
                        fontFamily: FONT.black,
                        fontSize: `${Math.round(at.size * size)}px`,
                        color: CSS.ink,
                    })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
        return { box: scene.add.container(0, 0, parts), w: size }
    }

    let chip: Phaser.GameObjects.Container | undefined
    let kind: Structure = 'fila'
    let lit: Home | undefined
    let pair: Edge | undefined
    let piece: Piece | undefined
    let iconBox: Rect = { x: REQUEST.x, y: REQUEST.y, w: 100, h: HEADER.h - 16 }

    const compose = () => {
        request.removeAll(true)
        chip = undefined
        const parts: { box: Phaser.GameObjects.Container | Phaser.GameObjects.Text; w: number; icon?: boolean }[] = []
        if (kind !== 'redemoinho') {
            const c = chipOf(LABEL[kind])
            parts.push(c)
            chip = c.box
        } else if (lit) {
            const c = chipOf(HOME_LABEL[lit])
            parts.push(c)
            chip = c.box
        }
        const icon =
            kind === 'fila'
                ? lineIcon()
                : kind === 'grade'
                  ? gridIcon()
                  : kind === 'ficha'
                    ? fichaIcon()
                    : kind === 'teia'
                      ? pairIcon(pair)
                      : pieceIcon(piece)
        if (icon.w > 0) parts.push({ ...icon, icon: true })
        const text = scene.add
            .text(0, 0, RULE[kind], { fontFamily: FONT.black, fontSize: `${SIZE.request}px`, color: CSS.inkSoft })
            .setOrigin(0, 0.5)
            .setResolution(2)
        parts.push({ box: text, w: text.width })
        const total = parts.reduce((s, p) => s + p.w, 0) + REQUEST.gap * (parts.length - 1)
        let x = -total / 2
        parts.forEach(p => {
            const isChip = p.box === chip
            p.box.setX(isChip ? x + p.w / 2 : x)
            if (p.icon) iconBox = { x: REQUEST.x + x + p.w / 2, y: REQUEST.y, w: p.w + 20, h: HEADER.h - 16 }
            x += p.w + REQUEST.gap
        })
        request.add(parts.map(p => p.box))
        requestW = total
    }

    const lives = createLives(scene, {
        total: opts.livesTotal,
        remaining: opts.livesLeft,
        gameId: opts.gameId,
        x: HUD.livesX,
        y: HUD.livesY,
        size: HUD.livesSize,
        stage: opts.stage,
        depth: DEPTH.hud + 1,
    })
    lives.container.setVisible(false)

    const helpArt = scene.add.graphics()
    helpArt.fillStyle(C.shadow, 0.25)
    helpArt.fillCircle(0, 4, HUD.helpR)
    helpArt.fillStyle(C.headerLine, 1)
    helpArt.fillCircle(0, 0, HUD.helpR)
    const helpText = scene.add
        .text(0, 1, '?', { fontFamily: FONT.black, fontSize: `${SIZE.help - 4}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const help = scene.add.container(HUD.helpX, HUD.helpY, [helpArt, helpText]).setDepth(DEPTH.hud)
    const helpZone = scene.add
        .zone(HUD.helpX, HUD.helpY, HUD.helpHit, HUD.helpHit)
        .setDepth(DEPTH.hud + 2)
        .setInteractive({ useHandCursor: true })
    let helpOn = false
    let shown = true
    const askHelp = () => {
        if (!helpOn || !shown) return
        scene.tweens.killTweensOf(help)
        help.setScale(1)
        void FX.press(scene, help)
        opts.onHelp()
    }
    helpZone.on('pointerdown', askHelp)
    const onKey = (event: KeyboardEvent) => {
        if (event.key === 'h' || event.key === 'H') askHelp()
    }
    scene.input.keyboard?.on('keydown', onKey)

    const paintHelp = () => {
        if (helpZone.input) helpZone.input.enabled = helpOn && shown
        help.setAlpha(shown ? (helpOn ? 1 : 0.45) : 0)
    }
    paintHelp()

    const header: Header = {
        lives,
        setPhase(index) {
            current = Phaser.Math.Clamp(index, 0, opts.phases)
            paint()
        },
        async celebrate(index) {
            current = index + 1
            paint()
            const pip = pips[index]
            if (!pip) return
            void FX.sparks(scene, pip.x, pip.y, { color: C.yes, count: 12, spread: 50, size: 8, duration: 500, depth: DEPTH.hud + 2 })
            await FX.to(scene, pip, { y: HUD.y - 10 }, { duration: 150, yoyo: true })
            pip.setY(HUD.y)
        },
        setRequest(type) {
            kind = type
            lit = undefined
            pair = undefined
            piece = undefined
            compose()
        },
        setPair(edge) {
            pair = edge
            compose()
        },
        setPiece(next) {
            piece = next
            lit = undefined
            compose()
        },
        async lightHome(home) {
            lit = home
            compose()
            await header.bounceRequest()
        },
        async bounceRequest() {
            if (!chip) return
            void FX.sparks(scene, REQUEST.x + chip.x, REQUEST.y, { color: C.butter, count: 14, spread: 70, size: 9, duration: 560, depth: DEPTH.hud + 2 })
            await FX.to(scene, chip, { scale: 1.22 }, { duration: 160, yoyo: true, ease: 'Sine.easeOut' })
            chip.setScale(1)
        },
        requestRect: () => ({ x: REQUEST.x, y: REQUEST.y, w: requestW + 24, h: HEADER.h - 16 }),
        iconRect: () => iconBox,
        setHelpEnabled(on) {
            helpOn = on
            paintHelp()
        },
        visible(on) {
            shown = on
            ;[band, pill, levelText, request, ...pips].forEach(o => o.setVisible(on))
            paintHelp()
        },
        destroy() {
            scene.input.keyboard?.off('keydown', onKey)
            helpZone.destroy()
            help.destroy()
            request.destroy()
            levelText.destroy()
            pips.forEach(p => p.destroy())
            pill.destroy()
            band.destroy()
            lives.destroy()
        },
    }
    return header
}
