import Phaser from 'phaser'
import { HUD, W } from '../data/layout'
import { C, FONT, HEX } from '../data/theme'

export interface Hud {
    setDias(total: number, feitos: number): void
    setBandeiras(total: number, atual: number, feitas: number): void
    balancarBandeira(indice: number): void
    setSol(restante: number, total: number): void
    mostrarSol(v: boolean): void
    setTitulo(t: string): void
    setEnabled(v: boolean): void
    /** Some enquanto o dedo arrasta o mapa: o que importa ali é a vila. */
    setOculto(v: boolean, imediato?: boolean): void
    destroy(): void
}

interface Opts {
    nivel: number
    onHelp: () => void
}

export function createHud(scene: Phaser.Scene, opts: Opts): Hud {
    const root = scene.add.container(0, 0).setDepth(400).setScrollFactor(0)

    const faixa = scene.add.graphics()
    faixa.fillStyle(C.ink, 0.92)
    faixa.fillRect(0, 0, W, HUD.h)
    faixa.fillStyle(C.warn, 1)
    faixa.fillRect(0, HUD.h - 4, W, 4)
    root.add(faixa)

    const pilula = scene.add.graphics()
    pilula.fillStyle(C.warn, 1)
    pilula.fillRoundedRect(HUD.pilulaX, 16, 130, 40, 20)
    root.add(pilula)
    root.add(
        scene.add
            .text(HUD.pilulaX + 65, HUD.cy, `NÍVEL ${opts.nivel}`, {
                fontFamily: FONT.black,
                fontSize: '22px',
                color: HEX.ink,
            })
            .setOrigin(0.5),
    )

    const bolinhas = scene.add.graphics()
    root.add(bolinhas)

    /* As bandeirinhas do dia moraram no cabeçalho: uma faixa a menos na tela. */
    const bandeiras = scene.add.graphics()
    root.add(bandeiras)
    let bandeiraShake = 0

    const TITULO_CX = 880
    const TITULO_MAX = 260
    const titulo = scene.add
        .text(TITULO_CX, HUD.cy, '', {
            fontFamily: FONT.black,
            fontSize: '24px',
            color: HEX.card,
        })
        .setOrigin(0.5)
    root.add(titulo)

    const solGfx = scene.add.graphics()
    root.add(solGfx)
    let solVisivel = false
    let solRestante = 0
    let solTotal = 0

    const help = scene.add.graphics()
    help.fillStyle(C.card, 1)
    help.fillCircle(HUD.helpX, HUD.cy, 24)
    help.lineStyle(4, C.warnDark, 1)
    help.strokeCircle(HUD.helpX, HUD.cy, 24)
    root.add(help)
    root.add(
        scene.add
            .text(HUD.helpX, HUD.cy + 1, '?', {
                fontFamily: FONT.black,
                fontSize: '30px',
                color: HEX.warnDark,
            })
            .setOrigin(0.5),
    )

    const helpZona = scene.add
        .zone(HUD.helpX, HUD.cy, HUD.helpHit, HUD.helpHit)
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(420)
        .setInteractive({ useHandCursor: true })
    helpZona.on('pointerdown', () => opts.onHelp())

    const desenharBandeiras = (total: number, atual: number, feitas: number) => {
        bandeiras.clear()
        for (let i = 0; i < total; i++) {
            const x = HUD.bandX + i * (HUD.bandW + HUD.bandGap) + (i === atual ? bandeiraShake : 0)
            const feita = i < feitas
            const agora = i === atual
            bandeiras.fillStyle(C.card, 0.4)
            bandeiras.fillRect(x - 2, 16, 3, 40)
            bandeiras.fillStyle(feita ? C.ok : agora ? C.warn : C.card, agora || feita ? 1 : 0.42)
            bandeiras.fillTriangle(x + 1, 17, x + 1, 39, x + HUD.bandW, 28)
            if (agora) {
                bandeiras.lineStyle(3, C.white, 0.95)
                bandeiras.strokeTriangle(x + 1, 17, x + 1, 39, x + HUD.bandW, 28)
            }
        }
    }

    const desenharSol = () => {
        solGfx.clear()
        if (!solVisivel || solTotal <= 0) return
        const cx = HUD.solX
        const cy = HUD.solCy
        const r = HUD.solR

        solGfx.lineStyle(4, C.card, 0.3)
        solGfx.beginPath()
        solGfx.arc(cx, cy, r, Phaser.Math.DegToRad(195), Phaser.Math.DegToRad(345))
        solGfx.strokePath()

        const t = Phaser.Math.Clamp(1 - solRestante / solTotal, 0, 1)
        const ang = Phaser.Math.DegToRad(195 + 150 * t)
        const sx = cx + Math.cos(ang) * r
        const sy = cy + Math.sin(ang) * r

        solGfx.fillStyle(solRestante <= 1 ? C.coral : C.luz, 1)
        solGfx.fillCircle(sx, sy, 12)
        solGfx.lineStyle(3, C.ink, 0.7)
        solGfx.strokeCircle(sx, sy, 12)
    }

    let totalBand = 0
    let atualBand = 0
    let feitasBand = 0

    const api: Hud = {
        setDias: (total, feitos) => {
            bolinhas.clear()
            for (let i = 0; i < total; i++) {
                const x = HUD.bolinhasX + i * 28
                if (i < feitos) {
                    bolinhas.fillStyle(C.warn, 1)
                    bolinhas.fillCircle(x, HUD.cy, 8)
                } else {
                    bolinhas.lineStyle(3, C.card, 0.6)
                    bolinhas.strokeCircle(x, HUD.cy, 8)
                }
            }
        },

        setBandeiras: (total, atual, feitas) => {
            totalBand = total
            atualBand = atual
            feitasBand = feitas
            bandeiraShake = 0
            desenharBandeiras(total, atual, feitas)
        },

        balancarBandeira: indice => {
            const estado = { v: 0 }
            scene.tweens.add({
                targets: estado,
                v: 12,
                duration: 70,
                yoyo: true,
                repeat: 5,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    bandeiraShake = estado.v
                    desenharBandeiras(totalBand, indice, feitasBand)
                },
                onComplete: () => {
                    bandeiraShake = 0
                    desenharBandeiras(totalBand, atualBand, feitasBand)
                },
            })
        },

        setSol: (restante, total) => {
            solRestante = restante
            solTotal = total
            desenharSol()
        },

        mostrarSol: v => {
            solVisivel = v
            desenharSol()
        },

        setTitulo: t => {
            titulo.setScale(1).setText(t)
            if (titulo.width > TITULO_MAX) titulo.setScale(TITULO_MAX / titulo.width)
        },

        setEnabled: v => {
            if (helpZona.input) helpZona.input.enabled = v
        },

        setOculto: (v, imediato) => {
            if (helpZona.input) helpZona.input.enabled = !v
            scene.tweens.killTweensOf(root)
            /* Sem tween na abertura: 190 ms de cabeçalho sumindo É o piscado. */
            if (imediato) {
                root.setAlpha(v ? 0 : 1).setY(v ? -HUD.h : 0)
                return
            }
            scene.tweens.add({
                targets: root,
                alpha: v ? 0 : 1,
                y: v ? -HUD.h : 0,
                duration: 190,
                ease: 'Cubic.easeOut',
            })
        },

        destroy: () => {
            scene.tweens.killTweensOf(root)
            helpZona.destroy()
            root.destroy()
        },
    }

    api.setDias(3, 0)
    return api
}
