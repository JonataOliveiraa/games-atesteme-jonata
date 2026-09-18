import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { place } from '../data/files'
import { BTN, DEPTH, btnX } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import type { Place } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

interface Button {
    root: Phaser.GameObjects.Container
    back: Phaser.GameObjects.Graphics
    lock: Phaser.GameObjects.Graphics
    zone: Phaser.GameObjects.Zone
    target: Place
    pulse?: Phaser.Tweens.Tween
}

/**
 * OS BOTÕES — os únicos alvos do jogo.
 *
 * Um por lugar, com o NOME e mais nada: a criança escolhe DE ONDE quer abrir.
 *
 * Eles já mostraram miniaturas dos arquivos guardados em cada lugar, e a ideia
 * caiu por um motivo simples: um símbolo pequeno não diz o próprio nome. Quem
 * responde "o que tem aqui dentro" agora é a rolagem (`scroll.ts`), que leva a
 * criança até o lugar e mostra cada arquivo grande, com a legenda embaixo.
 *
 * Eles vivem na TELA (`setScrollFactor(0)`) — o mundo passa por baixo e eles
 * não saem do lugar.
 */
export interface Buttons {
    mount(targets: Place[]): Promise<void>
    setEnabled(on: boolean): void
    setLocked(target: Place, on: boolean): void
    press(target: Place): Promise<void>
    deny(target: Place): Promise<void>
    pointOf(target: Place): { x: number; y: number }
    pulse(targets: Place[]): void
    stopPulse(): void
    setShown(on: boolean): void
    destroy(): void
}

export interface ButtonsOptions {
    onPick(target: Place): void
    /** O toque desceu aqui — pode ser o começo de uma rolagem. */
    onDown(pointer: Phaser.Input.Pointer): void
}

/** Quanto o dedo pode escorregar e o toque ainda contar como toque. */
const SLIP = 20

export function createButtons(scene: Phaser.Scene, options: ButtonsOptions): Buttons {
    const list: Button[] = []
    const root = scene.add.container(0, 0).setScrollFactor(0).setDepth(DEPTH.button)

    const paintBack = (b: Button, state: 'on' | 'locked') => {
        const g = b.back
        g.clear()
        const w = BTN.w
        const h = BTN.h
        const face = state === 'locked' ? C.grey : C.creamSoft
        const edge = state === 'locked' ? C.greyDeep : C.navy
        g.fillStyle(C.shadow, 0.22)
        g.fillRoundedRect(-w / 2, -h / 2 + 8, w, h, 20)
        g.fillStyle(edge, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.fillStyle(face, 1)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h - 16, 15)
        g.fillStyle(C.white, 0.5)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + 11, w - 24, 14, 7)
    }

    const paintLock = (g: Phaser.GameObjects.Graphics) => {
        g.clear()
        g.fillStyle(C.navyDeep, 1)
        g.fillRoundedRect(BTN.w / 2 - 54, -18, 34, 28, 6)
        g.lineStyle(7, C.navyDeep, 1)
        g.beginPath()
        g.arc(BTN.w / 2 - 37, -20, 11, Math.PI, 0, false)
        g.strokePath()
        g.fillStyle(C.gold, 1)
        g.fillCircle(BTN.w / 2 - 37, -4, 5)
    }

    const build = (target: Place, index: number, total: number) => {
        const def = place(target)

        const container = scene.add.container(btnX(index, total), BTN.cy).setScrollFactor(0)

        const back = scene.add.graphics()
        container.add(back)

        const name = scene.add
            .text(0, -4, def.name, { fontFamily: FONT.black, fontSize: '34px', color: CSS.navy })
            .setOrigin(0.5)
            .setResolution(2)
        if (name.width > BTN.w - 46) name.setScale((BTN.w - 46) / name.width)
        container.add(name)

        const lock = scene.add.graphics().setAlpha(0)
        paintLock(lock)
        container.add(lock)

        const zone = scene.add
            .zone(btnX(index, total), BTN.cy, BTN.w, BTN.h + 20)
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(DEPTH.button + 1)
            .setInteractive({ useHandCursor: true })

        /**
         * O BOTÃO RESPONDE NO SOLTAR, e só se o dedo ficou parado.
         *
         * Desde que a tela rola, um toque que desce num botão pode ser o começo
         * de um arrasto: os botões ocupam a tira de baixo, que é justamente por
         * onde um polegar puxa. Responder no `pointerdown` transformava cada
         * tentativa de rolar dali numa resposta dada sem querer — e errar a
         * mira não pode custar uma vida.
         */
        let down: { x: number; y: number } | undefined
        zone.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            down = { x: pointer.x, y: pointer.y }
            options.onDown(pointer)
        })
        zone.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const from = down
            down = undefined
            if (!from) return
            if (Phaser.Math.Distance.Between(from.x, from.y, pointer.x, pointer.y) > SLIP) return
            options.onPick(target)
        })

        root.add(container)

        const button: Button = { root: container, back, lock, zone, target }
        paintBack(button, 'on')
        return button
    }

    const clear = () => {
        list.forEach(b => {
            b.pulse?.stop()
            b.zone.destroy()
            b.root.destroy()
        })
        list.length = 0
    }

    const find = (target: Place) => list.find(b => b.target === target)

    return {
        mount: async targets => {
            clear()
            targets.forEach((t, i) => list.push(build(t, i, targets.length)))

            await Promise.all(
                list.map(async (b, i) => {
                    b.root.setAlpha(0).setY(BTN.cy + 60)
                    await FX.wait(scene, i * 90)
                    await FX.to(scene, fx(b.root), { alpha: 1, y: BTN.cy }, { duration: 320, ease: 'Back.easeOut' })
                }),
            )
        },

        setEnabled: on => {
            list.forEach(b => {
                if (b.zone.input) b.zone.input.enabled = on
            })
        },

        setLocked: (target, on) => {
            const b = find(target)
            if (!b) return
            paintBack(b, on ? 'locked' : 'on')
            b.lock.setAlpha(on ? 0 : 0)
            if (!on) return
            b.lock.setAlpha(0).setScale(1.8)
            void FX.to(scene, fx(b.lock), { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
        },

        press: async target => {
            const b = find(target)
            if (!b) return
            await FX.to(scene, fx(b.root), { scaleX: 0.94, scaleY: 0.9 }, { duration: 90 })
            await FX.to(scene, fx(b.root), { scaleX: 1, scaleY: 1 }, { duration: 160, ease: 'Back.easeOut' })
        },

        deny: async target => {
            const b = find(target)
            if (!b) return
            await FX.shake(scene, fx(b.root), { amount: 12 })
        },

        pointOf: target => {
            const b = find(target)
            return b ? { x: b.root.x, y: b.root.y } : { x: 640, y: BTN.cy }
        },

        pulse: targets => {
            list.forEach(b => {
                b.pulse?.stop()
                b.pulse = undefined
                b.root.setScale(1)
            })
            targets.forEach(t => {
                const b = find(t)
                if (!b) return
                b.pulse = scene.tweens.add({
                    targets: b.root,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut',
                })
            })
        },

        stopPulse: () => {
            list.forEach(b => {
                b.pulse?.stop()
                b.pulse = undefined
                b.root.setScale(1)
            })
        },

        setShown: on => {
            FX.kill(scene, fx(root))
            scene.tweens.add({
                targets: root,
                alpha: on ? 1 : 0,
                y: on ? 0 : 50,
                duration: 260,
                ease: 'Sine.easeInOut',
            })
        },

        destroy: () => {
            clear()
            root.destroy()
        },
    }
}
