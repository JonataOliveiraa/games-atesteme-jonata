import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { KEY, STATION_BOX, STATIONS_SHEET, fitArt } from '../data/art'
import { DEPTH, STATION } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import type { Station } from '../types'

export interface StationOptions {
    onTap: (id: string) => void
}

/**
 * O vértice do grafo, com cara de lugar.
 *
 * O prédio fica direto no mapa, e o alvo de toque continua sendo um círculo de
 * ⌀ 220 em volta dele (66 px reais no celular) — o alvo é maior que o desenho
 * de propósito, porque dedo de criança não mira telhado.
 *
 * O prédio é ancorado pela BASE medida da folha, nunca pelo centro do quadro:
 * é o que faz estádio, casinha e coreto pisarem na mesma linha.
 */
export function createStation(scene: Phaser.Scene, station: Station, options: StationOptions) {
    const root = scene.add.container(station.x, station.y).setDepth(DEPTH.station)

    const shadow = scene.add.graphics()
    shadow.fillStyle(C.ink, A.shadow)
    shadow.fillEllipse(0, STATION.r - 22, STATION.r * 1.62, 50)
    root.add(shadow)

    const ring = scene.add.graphics()
    root.add(ring)

    /**
     * O prédio pousa no mapa, sem disco por baixo.
     *
     * O disco branco tirava a cidade do lugar — cada estação virava uma moeda
     * colada em cima do desenho. O estado (parada, vizinha possível,
     * selecionada, piscando na TRAVA) passou para o CHÃO: uma marca oval
     * debaixo do prédio, que é onde o trilho chega e onde o dedo toca.
     */
    const paintRing = (accent: number, width: number) => {
        const w = STATION.r * 2.12
        const h = 74
        const y = STATION.r - 22
        const idle = accent === C.ink

        ring.clear()
        ring.fillStyle(accent, idle ? 0.16 : 0.3)
        ring.fillEllipse(0, y, w, h)
        ring.lineStyle(width, accent, idle ? 0.45 : 1)
        ring.strokeEllipse(0, y, w, h)
        if (idle) return
        ring.lineStyle(width - 4, C.disc, 0.9)
        ring.strokeEllipse(0, y, w + 22, h + 16)
    }
    paintRing(C.ink, 8)

    const baseY = STATION.r - 34
    const art = scene.add.container(0, 0)
    root.add(art)

    if (scene.textures.exists(KEY.stations)) {
        const box = STATION_BOX[station.art] ?? STATION_BOX[0]
        const fit = fitArt(box, STATIONS_SHEET, { h: STATION.art, w: STATION.art + 20 })
        const sprite = scene.add.sprite(0, baseY, KEY.stations, station.art)
        sprite.setOrigin(fit.originX, fit.originY)
        sprite.setScale(fit.scale)
        art.add(sprite)
    } else {
        art.add(paintPlaceholder(scene, baseY))
    }

    // um respiro de vida: o prédio balança de leve, cada estação no seu tempo
    FX.float(scene, art, { amount: 5, duration: 2400 + Math.random() * 900 })

    const label = scene.add
        .text(0, STATION.labelDy, station.label, {
            fontFamily: FONT.black,
            fontSize: `${STATION.labelSize}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)

    const plate = scene.add.graphics()
    const pw = label.width + 44
    const ph = label.height + 18
    plate.fillStyle(C.ink, 1)
    plate.fillRoundedRect(-pw / 2, STATION.labelDy - ph / 2 + 5, pw, ph, ph / 2)
    plate.fillStyle(C.disc, 1)
    plate.fillRoundedRect(-pw / 2, STATION.labelDy - ph / 2, pw, ph, ph / 2)
    root.add(plate)
    root.add(label)

    const zone = scene.add
        .zone(station.x, station.y, STATION.r * 2, STATION.r * 2)
        .setDepth(DEPTH.station + 1)
        .setInteractive({
            hitArea: new Phaser.Geom.Circle(STATION.r, STATION.r, STATION.r),
            hitAreaCallback: Phaser.Geom.Circle.Contains,
            useHandCursor: true,
        })

    let enabled = true
    zone.on('pointerdown', () => {
        if (!enabled) return
        options.onTap(station.id)
    })

    let selected = false

    return {
        id: station.id,
        x: station.x,
        y: station.y,

        setSelected(value: boolean) {
            if (selected === value) return
            selected = value
            paintRing(value ? C.blue : C.ink, value ? 11 : 8)
            FX.to(scene, root, { y: station.y - (value ? STATION.lift : 0) }, { duration: 160, ease: 'Back.out' })
        },

        /** Vizinha possível da estação selecionada: ganha contorno, não cor. */
        setCandidate(value: boolean) {
            if (selected) return
            paintRing(value ? C.amber : C.ink, value ? 11 : 8)
        },

        setEnabled(value: boolean) {
            enabled = value
        },

        setDim(value: boolean) {
            root.setAlpha(value ? 0.45 : 1)
        },

        async ping(color = C.green) {
            await FX.ping(scene, station.x, station.y, color, { radius: STATION.r + 40, depth: DEPTH.station - 1 })
        },

        async nope() {
            await FX.nope(scene, root)
        },

        async alert(times = 3) {
            for (let i = 0; i < times; i++) {
                paintRing(C.amber, 14)
                await FX.wait(scene, 170)
                paintRing(selected ? C.blue : C.ink, selected ? 11 : 8)
                await FX.wait(scene, 150)
            }
        },

        destroy() {
            FX.kill(scene, root)
            FX.kill(scene, art)
            zone.destroy()
            root.destroy(true)
        },
    }
}

function paintPlaceholder(scene: Phaser.Scene, baseY: number) {
    const g = scene.add.graphics()
    const w = 128
    const h = 100
    g.fillStyle(C.ink, 1)
    g.fillRect(-w / 2, baseY - h, w, h)
    g.fillStyle(C.amber, 1)
    g.fillRect(-w / 2 + 7, baseY - h + 7, w - 14, h - 14)
    g.fillStyle(C.ink, 1)
    g.beginPath()
    g.moveTo(-w / 2 - 12, baseY - h)
    g.lineTo(0, baseY - h - 50)
    g.lineTo(w / 2 + 12, baseY - h)
    g.closePath()
    g.fillPath()
    return g
}

export type StationView = ReturnType<typeof createStation>
