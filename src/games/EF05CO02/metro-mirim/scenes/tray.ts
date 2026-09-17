import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KEY, PIECE_BOX, fitArt } from '../data/art'
import { BENCH, DEPTH, GO, TRAY, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

export interface TrayOptions {
    onGo: () => void
    onDragStart: () => void
    onDragMove: (x: number, y: number) => void
    onDragEnd: (x: number, y: number) => void
}

/**
 * A bancada: as peças de trilho, quem ainda falta chegar, e o apito.
 *
 * A bandeja é o "contador" do jogo sem ser número: peça é objeto, e a criança
 * vê quanto falta gastar. E é daqui que a peça SAI — ela arrasta uma peça até
 * a ligação tracejada que quer construir.
 *
 * Tudo aqui é `setScrollFactor(0)`: a bancada não anda quando o mapa anda.
 */
export function createTray(scene: Phaser.Scene, options: TrayOptions) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.bench).setScrollFactor(0)

    const bench = scene.add.graphics()
    bench.fillStyle(C.ink, 1)
    bench.fillRect(0, BENCH.y, W, BENCH.h)
    bench.fillStyle(C.inkSoft, 1)
    bench.fillRect(0, BENCH.y + 6, W, BENCH.h - 6)
    bench.fillStyle(C.white, 0.06)
    bench.fillRect(0, BENCH.y + 6, W, 14)
    bench.fillStyle(C.amber, 1)
    bench.fillRect(0, BENCH.y, W, 5)
    root.add(bench)

    const slot = scene.add.graphics()
    slot.fillStyle(C.ink, 0.55)
    slot.fillRoundedRect(TRAY.x, TRAY.y, TRAY.w, TRAY.h, 22)
    slot.lineStyle(4, C.white, 0.12)
    slot.strokeRoundedRect(TRAY.x + 4, TRAY.y + 4, TRAY.w - 8, TRAY.h - 8, 18)
    root.add(slot)

    const label = scene.add
        .text(TRAY.x + 22, TRAY.y + 10, 'TRILHOS', {
            fontFamily: FONT.black,
            fontSize: '17px',
            color: CSS.white,
        })
        .setAlpha(0.6)
        .setResolution(2)
    root.add(label)

    const pieceAt = (index: number) => ({ x: TRAY.x0 + index * TRAY.pitch, y: TRAY.cy })

    const stack: Phaser.GameObjects.GameObject[] = []
    let left = 0

    const paintPieces = () => {
        stack.forEach(p => p.destroy())
        stack.length = 0
        for (let i = 0; i < left; i++) {
            const p = pieceAt(i)
            const piece = makePiece(scene, p.x, p.y)
            piece.setScrollFactor(0).setDepth(DEPTH.bench + 1)
            stack.push(piece)
        }
    }

    /* ──────────────────────────────── o apito ─────────────────────────── */

    const button = scene.add.container(GO.cx, GO.cy).setDepth(DEPTH.bench + 2).setScrollFactor(0)
    const face = scene.add.graphics()
    button.add(face)

    const text = scene.add
        .text(0, 0, 'PARTIR', { fontFamily: FONT.black, fontSize: '44px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    text.setStroke(CSS.ink, 8)
    button.add(text)

    const badge = scene.add.graphics()
    button.add(badge)

    let ready = false
    let locked = false
    const paintButton = () => {
        const color = locked || !ready ? C.rail : C.green
        face.clear()
        face.fillStyle(C.ink, 1)
        face.fillRoundedRect(-GO.w / 2, -GO.h / 2 + 7, GO.w, GO.h, 28)
        face.fillStyle(color, 1)
        face.fillRoundedRect(-GO.w / 2, -GO.h / 2, GO.w, GO.h, 28)
        face.fillStyle(C.white, ready && !locked ? 0.28 : 0.12)
        face.fillRoundedRect(-GO.w / 2 + 14, -GO.h / 2 + 11, GO.w - 28, 28, 14)
        text.setAlpha(ready && !locked ? 1 : 0.55)

        badge.clear()
        if (!locked) return
        badge.fillStyle(C.ink, 1)
        badge.fillRoundedRect(GO.w / 2 - 48, -GO.h / 2 - 18, 60, 56, 13)
        badge.fillStyle(C.amber, 1)
        badge.fillRoundedRect(GO.w / 2 - 44, -GO.h / 2 - 14, 52, 48, 11)
        badge.lineStyle(8, C.ink, 1)
        badge.beginPath()
        badge.arc(GO.w / 2 - 18, -GO.h / 2 - 14, 14, Math.PI, 0)
        badge.strokePath()
    }
    paintButton()

    const goZone = scene.add
        .zone(GO.cx, GO.cy, GO.w + 20, GO.h + 20)
        .setDepth(DEPTH.bench + 3)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    let enabled = true
    goZone.on('pointerdown', () => {
        if (!enabled) return
        options.onGo()
    })

    /* ─────────────────────────── arrastar a peça ──────────────────────── */

    const grab = scene.add
        .zone(TRAY.x + TRAY.w / 2, TRAY.y + TRAY.h / 2, TRAY.w, TRAY.h)
        .setDepth(DEPTH.bench + 3)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true })

    let ghost: Phaser.GameObjects.GameObject | null = null

    const dropGhost = () => {
        ghost?.destroy()
        ghost = null
    }

    grab.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!enabled || left === 0 || ghost) return
        ghost = makePiece(scene, pointer.x, pointer.y)
            .setScrollFactor(0)
            .setDepth(DEPTH.frame - 1)
            .setScale(1.15)
        options.onDragStart()
    })

    const onMove = (pointer: Phaser.Input.Pointer) => {
        if (!ghost) return
        ;(ghost as Phaser.GameObjects.Container).setPosition(pointer.x, pointer.y)
        options.onDragMove(pointer.x, pointer.y)
    }

    const onUp = (pointer: Phaser.Input.Pointer) => {
        if (!ghost) return
        dropGhost()
        options.onDragEnd(pointer.x, pointer.y)
    }

    scene.input.on('pointermove', onMove)
    scene.input.on('pointerup', onUp)

    return {
        setPieces(value: number) {
            left = value
            paintPieces()
        },

        pieces: () => left,

        /** A peça sai da bandeja e voa até o trilho que vai nascer. */
        async fly(to: { x: number; y: number }) {
            const from = pieceAt(Math.max(0, left - 1))
            const flying = makePiece(scene, from.x, from.y).setScrollFactor(0).setDepth(DEPTH.frame - 1)
            await FX.to(scene, flying, { x: to.x, y: to.y, scale: 1.3 }, { duration: 260, ease: 'Quad.out' })
            flying.destroy()
        },

        /** E volta, quando a criança desfaz. */
        async back(from: { x: number; y: number }) {
            const to = pieceAt(Math.max(0, left))
            const flying = makePiece(scene, from.x, from.y).setScrollFactor(0).setDepth(DEPTH.frame - 1)
            await FX.to(scene, flying, { x: to.x, y: to.y, scale: 1 }, { duration: 240, ease: 'Quad.in' })
            flying.destroy()
        },


        setGoReady(value: boolean) {
            ready = value
            paintButton()
            if (value) void FX.to(scene, button, { scale: 1.06 }, { duration: 160, yoyo: true })
        },

        setLocked(value: boolean) {
            locked = value
            paintButton()
        },

        async press() {
            await FX.to(scene, button, { scale: 0.92 }, { duration: 90, yoyo: true })
        },

        async nudge() {
            await FX.shake(scene, slot, { amount: 8 })
        },

        setEnabled(value: boolean) {
            enabled = value
            if (!value) dropGhost()
        },

        /** Some inteira: a partida é cena, e cena não tem interface por cima. */
        async setShown(value: boolean, instant = false) {
            const targets = [root, button, ...stack]
            if (instant) {
                targets.forEach(t => (t as Phaser.GameObjects.Container).setAlpha(value ? 1 : 0))
                return
            }
            await FX.all(
                ...targets.map(t =>
                    FX.to(scene, t as Phaser.GameObjects.Container, { alpha: value ? 1 : 0 }, { duration: 260 }),
                ),
            )
        },

        destroy() {
            scene.input.off('pointermove', onMove)
            scene.input.off('pointerup', onUp)
            dropGhost()
            FX.kill(scene, button)
            stack.forEach(p => p.destroy())
            goZone.destroy()
            grab.destroy()
            button.destroy(true)
            root.destroy(true)
        },
    }
}

/**
 * A peça de trilho: `icone-trilho.png` quando existir, senão desenhada. É a
 * mesma peça na bandeja, no arraste e no voo — a criança tem de reconhecer que
 * é a mesma coisa nos três lugares.
 */
function makePiece(scene: Phaser.Scene, x: number, y: number) {
    const piece = scene.add.container(x, y)

    if (scene.textures.exists(KEY.piece)) {
        const image = scene.add.image(0, 0, KEY.piece)
        const fit = fitArt(PIECE_BOX, { frameWidth: image.width, frameHeight: image.height }, { h: TRAY.icon * 0.62, w: TRAY.icon })
        image.setOrigin(fit.originX, PIECE_BOX.base - PIECE_BOX.h / 2)
        image.setScale(fit.scale)
        piece.add(image)
        return piece
    }

    const g = scene.add.graphics()
    const w = TRAY.icon
    const h = TRAY.icon * 0.52
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2 + 4, w, h, 12)
    g.fillStyle(C.tie, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
    g.fillStyle(C.railLight, 1)
    g.fillRect(-w / 2 + 8, -12, w - 16, 6)
    g.fillRect(-w / 2 + 8, 6, w - 16, 6)
    g.fillStyle(C.ink, 0.5)
    for (let i = -1; i <= 1; i++) g.fillRect(i * 20 - 3, -h / 2 + 6, 6, h - 12)
    piece.add(g)
    return piece
}

export type Tray = ReturnType<typeof createTray>
