import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, LENS, PAPER } from '../data/layout'
import { LENS_ART, SHEET } from '../data/art'
import { A, C } from '../data/theme'

const LENS_KEY = SHEET.lens

export interface LensOptions {
    /** Chamado a cada movimento: é quem procura o que entrou no vidro. */
    onMove: () => void
    /**
     * Um toque no vidro, sem arrastar.
     *
     * A lente fica POR CIMA do que a criança quer marcar, e um dedo não
     * atravessa vidro: sem isto, o marcador nunca alcançaria o item que está
     * debaixo da lupa. Aqui o vidro vira o cursor da ferramenta.
     */
    onTap: (x: number, y: number) => void
}

/**
 * A lupa.
 *
 * Ela é um OBJETO na mesa: a criança agarra e arrasta. Não persegue o dedo, não
 * responde nada, não custa vida — errar a mira aqui não é errar a resposta.
 *
 * O aumento é a cópia do papel em escala, posicionada para que o ponto embaixo
 * do vidro continue sendo o mesmo ponto: P = c − z · (c − papel).
 */
export function createLens(scene: Phaser.Scene, textureKey: string, options: LensOptions) {
    const under = scene.add.graphics().setDepth(DEPTH.zoom - 1)
    const glass = scene.add.graphics().setDepth(DEPTH.zoom)
    const zoom = scene.add.image(0, 0, textureKey).setOrigin(0).setDepth(DEPTH.zoom + 1)
    const shine = scene.add.graphics().setDepth(DEPTH.lens - 1)
    const rim = scene.add.graphics().setDepth(DEPTH.lens)

    const art = scene.textures.exists(LENS_KEY)
        ? scene.add.image(0, 0, LENS_KEY).setDepth(DEPTH.lens)
        : null

    const maskG = scene.make.graphics({ x: 0, y: 0 }, false)
    maskG.fillStyle(0xffffff, 1)
    maskG.fillCircle(0, 0, LENS.r)
    const mask = maskG.createGeometryMask()
    zoom.setMask(mask)
    glass.setMask(mask)

    zoom.setScale(LENS.zoom)

    if (art) {
        // a arte é enquadrada pelo vidro dela, não pela caixa do PNG
        art.setScale(LENS.r / (art.width * LENS_ART.glassR))
        art.setOrigin(LENS_ART.glassX, LENS_ART.glassY)
    }

    let cx = PAPER.x + LENS.parkX
    let cy = PAPER.y + LENS.parkY
    let hot = false

    const HANDLE = Phaser.Math.DegToRad(42)

    const paintRim = () => {
        rim.clear()
        if (art) {
            art.setPosition(cx, cy)
            art.setTint(hot ? C.amber : 0xffffff)
            return
        }

        const gx = cx + Math.cos(HANDLE) * (LENS.r + 4)
        const gy = cy + Math.sin(HANDLE) * (LENS.r + 4)
        const hx = gx + Math.cos(HANDLE) * 104
        const hy = gy + Math.sin(HANDLE) * 104

        rim.lineStyle(34, C.ink, 1)
        rim.lineBetween(gx, gy, hx, hy)
        rim.lineStyle(24, C.wood, 1)
        rim.lineBetween(gx, gy, hx, hy)
        rim.lineStyle(10, C.woodLight, 0.7)
        rim.lineBetween(gx + 4, gy - 6, hx - 6, hy - 14)

        rim.lineStyle(16, C.ink, 1)
        rim.lineBetween(gx - 6, gy - 6, gx + 26, gy + 26)
        rim.lineStyle(9, C.metal, 1)
        rim.lineBetween(gx - 6, gy - 6, gx + 26, gy + 26)

        rim.lineStyle(LENS.rim + 8, C.ink, 1)
        rim.strokeCircle(cx, cy, LENS.r + LENS.rim / 2)
        rim.lineStyle(LENS.rim, hot ? C.amber : C.metal, 1)
        rim.strokeCircle(cx, cy, LENS.r + LENS.rim / 2)

        rim.lineStyle(5, C.white, 0.6)
        rim.beginPath()
        rim.arc(cx, cy, LENS.r + LENS.rim / 2, Phaser.Math.DegToRad(190), Phaser.Math.DegToRad(265))
        rim.strokePath()
        rim.lineStyle(5, C.metalDeep, 0.8)
        rim.beginPath()
        rim.arc(cx, cy, LENS.r + LENS.rim / 2, Phaser.Math.DegToRad(10), Phaser.Math.DegToRad(85))
        rim.strokePath()
    }

    const place = () => {
        under.clear()
        under.fillStyle(C.ink, A.shadow)
        under.fillCircle(cx + 10, cy + 14, LENS.r + LENS.rim)

        glass.clear()
        glass.fillStyle(C.paper, 1)
        glass.fillCircle(cx, cy, LENS.r)

        maskG.setPosition(cx, cy)
        zoom.setPosition(cx - LENS.zoom * (cx - PAPER.x), cy - LENS.zoom * (cy - PAPER.y))

        // com a arte, o reflexo já vem desenhado nela: dois brilhos brigam
        shine.clear()
        shine.fillStyle(C.glass, art ? 0.08 : 0.18)
        shine.fillCircle(cx, cy, LENS.r)
        if (!art) {
            shine.fillStyle(C.white, 0.35)
            shine.slice(
                cx, cy, LENS.r - 6,
                Phaser.Math.DegToRad(196), Phaser.Math.DegToRad(250),
            )
            shine.fillPath()
        }

        paintRim()
    }

    const clampTo = (x: number, y: number) => ({
        x: Phaser.Math.Clamp(x, PAPER.x, PAPER.x + PAPER.w),
        y: Phaser.Math.Clamp(y, PAPER.y, PAPER.y + PAPER.h),
    })

    const setCenter = (x: number, y: number) => {
        const p = clampTo(x, y)
        cx = p.x
        cy = p.y
        place()
        options.onMove()
    }

    place()

    const R = LENS.r + LENS.rim + 20
    const zone = scene.add.zone(cx, cy, R * 2, R * 2).setDepth(DEPTH.lens + 1)
    zone.setInteractive(new Phaser.Geom.Circle(R, R, R), Phaser.Geom.Circle.Contains)
    scene.input.setDraggable(zone)

    let enabled = true
    let grabX = 0
    let grabY = 0
    let downX = 0
    let downY = 0
    let dragged = false

    const syncZone = () => zone.setPosition(cx, cy)

    zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        if (!enabled) return
        downX = pointer.x
        downY = pointer.y
        dragged = false
        const inGlass = Math.hypot(pointer.x - cx, pointer.y - cy) < LENS.r
        // o dedo que agarra o vidro tapa o que a lente aumenta: ela sobe
        if (pointer.wasTouch && inGlass) {
            grabX = 0
            grabY = -LENS.grabLift
            setCenter(pointer.x + grabX, pointer.y + grabY)
        } else {
            grabX = cx - pointer.x
            grabY = cy - pointer.y
        }
        syncZone()
    })

    zone.on('drag', (pointer: Phaser.Input.Pointer) => {
        if (!enabled) return
        if (Math.hypot(pointer.x - downX, pointer.y - downY) > 10) dragged = true
        setCenter(pointer.x + grabX, pointer.y + grabY)
        syncZone()
    })

    zone.on('pointerup', () => {
        if (!enabled || dragged) return
        options.onTap(cx, cy)
    })

    return {
        center() {
            return { x: cx, y: cy }
        },

        local() {
            return { x: cx - PAPER.x, y: cy - PAPER.y }
        },

        /** O que cabe no vidro, em coordenada de papel. */
        radius() {
            return LENS.r / LENS.zoom
        },

        /** Um toque no papel chama a lupa até lá: ninguém precisa mirar. */
        glide(x: number, y: number) {
            const p = clampTo(x, y)
            const fromX = cx
            const fromY = cy
            scene.tweens.addCounter({
                from: 0,
                to: 1,
                duration: 260,
                ease: 'Cubic.easeOut',
                onUpdate: tween => {
                    const t = tween.getValue() ?? 0
                    setCenter(fromX + (p.x - fromX) * t, fromY + (p.y - fromY) * t)
                    syncZone()
                },
            })
        },

        park() {
            setCenter(PAPER.x + LENS.parkX, PAPER.y + LENS.parkY)
            syncZone()
        },

        /** O convite: no começo da fase ela balança um pouco, pedindo para ser puxada. */
        async nudge() {
            for (let i = 0; i < 2; i++) {
                await FX.wait(scene, 90)
                setCenter(cx + 16, cy)
                syncZone()
                await FX.wait(scene, 90)
                setCenter(cx - 16, cy)
                syncZone()
            }
        },

        async pulse() {
            hot = true
            paintRim()
            await FX.wait(scene, 300)
            hot = false
            paintRim()
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        setVisible(value: boolean) {
            under.setVisible(value)
            glass.setVisible(value)
            zoom.setVisible(value)
            shine.setVisible(value)
            rim.setVisible(value)
            art?.setVisible(value)
            zone.setVisible(value)
        },

        /** Ela sai da mesa quando a ferramenta é outra, e volta onde estava. */
        async show(value: boolean) {
            const parts: Phaser.GameObjects.GameObject[] = [under, glass, zoom, shine, rim]
            if (art) parts.push(art)
            zone.setVisible(value)
            if (value) {
                parts.forEach(o => (o as Phaser.GameObjects.Image).setVisible(true))
            }
            await Promise.all(
                parts.map(o =>
                    FX.to(scene, o as Phaser.GameObjects.Image, { alpha: value ? 1 : 0 }, { duration: 160 }),
                ),
            )
            if (!value) parts.forEach(o => (o as Phaser.GameObjects.Image).setVisible(false))
        },

        /** A dica do segundo erro: uma lupa-fantasma varre onde está a pendência. */
        async ghost(x: number, y: number) {
            const ghost = scene.add.graphics().setDepth(DEPTH.lens + 2).setAlpha(0)
            ghost.lineStyle(12, C.amber, 0.9)
            ghost.strokeCircle(0, 0, LENS.r * 0.8)
            ghost.setPosition(x - 150, y)
            await FX.to(scene, ghost, { alpha: 1 }, { duration: 160 })
            await FX.to(scene, ghost, { x: x + 150 }, { duration: 900, yoyo: true })
            await FX.to(scene, ghost, { alpha: 0 }, { duration: 200 })
            ghost.destroy()
        },

        destroy() {
            FX.kill(scene, zoom)
            zoom.clearMask()
            glass.clearMask()
            mask.destroy()
            maskG.destroy()
            zone.destroy()
            art?.destroy()
            zoom.destroy()
            under.destroy()
            glass.destroy()
            shine.destroy()
            rim.destroy()
        },
    }
}

export type Lens = ReturnType<typeof createLens>
export const LENS_TEXTURE = LENS_KEY
