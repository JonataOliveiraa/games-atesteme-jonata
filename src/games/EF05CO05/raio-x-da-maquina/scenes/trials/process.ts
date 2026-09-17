import Phaser from 'phaser'
import { Ease, FX } from '../../../../../shared/effects/FX'
import { C, CSS, FONT, TONE } from '../../data/theme'
import { SHEET } from '../../data/parts'
import { AREA, fx, thing, type TrialDef } from './stage'

/** Processador: a conta não sai sozinha — o chip tem de trabalhar. */
export const chipTrial: TrialDef = {
    prompt: 'Faça a conta 7 + 8.',

    run: async ctx => {
        const need = 3
        let hits = 0

        ctx.note('Toque três vezes para ele calcular.')

        const panelW = 620
        const panelH = 140
        const panelCy = AREA.y + 62

        const panel = ctx.scene.add.graphics()
        ctx.layer.add(panel)
        panel.fillStyle(C.shadow, 0.4)
        panel.fillRoundedRect(AREA.cx - panelW / 2, panelCy - panelH / 2 + 8, panelW, panelH, 22)
        panel.fillStyle(0x0d2b1d, 1)
        panel.fillRoundedRect(AREA.cx - panelW / 2, panelCy - panelH / 2, panelW, panelH, 22)
        panel.lineStyle(6, TONE.processador, 0.85)
        panel.strokeRoundedRect(AREA.cx - panelW / 2, panelCy - panelH / 2, panelW, panelH, 22)

        const display = ctx.scene.add
            .text(AREA.cx, panelCy, '7 + 8 = ?', {
                fontFamily: FONT.black,
                fontSize: '76px',
                color: '#8affc1',
            })
            .setOrigin(0.5)
            .setResolution(2)
        display.setStroke('#07301d', 8)
        ctx.layer.add(display)

        const chipCy = AREA.y + 320
        const socketR = 170

        const socket = ctx.scene.add.graphics()
        ctx.layer.add(socket)
        socket.fillStyle(C.bay, 1)
        socket.fillRoundedRect(AREA.cx - socketR, chipCy - socketR, socketR * 2, socketR * 2, 28)
        socket.lineStyle(5, C.cyan, 0.3)
        socket.strokeRoundedRect(AREA.cx - socketR, chipCy - socketR, socketR * 2, socketR * 2, 28)
        for (let i = 0; i < 7; i++) {
            const t = -130 + i * 43
            socket.fillStyle(C.gold, 0.5)
            socket.fillRect(AREA.cx + t, chipCy - socketR + 6, 22, 16)
            socket.fillRect(AREA.cx + t, chipCy + socketR - 22, 22, 16)
        }

        const ring = ctx.scene.add.graphics()
        ctx.layer.add(ring)
        const paintRing = () => {
            ring.clear()
            ring.lineStyle(18, C.screen, 1)
            ring.strokeCircle(AREA.cx, chipCy, 148)
            if (hits > 0) {
                ring.lineStyle(18, TONE.processador, 1)
                ring.beginPath()
                ring.arc(AREA.cx, chipCy, 148, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * hits) / need)
                ring.strokePath()
            }
        }
        paintRing()

        let chip: Phaser.GameObjects.Image | Phaser.GameObjects.Graphics

        if (ctx.quiet) {
            const box = ctx.scene.add.graphics()
            box.fillStyle(C.inkSoft, 1)
            box.fillRoundedRect(AREA.cx - 92, chipCy - 92, 184, 184, 24)
            box.lineStyle(6, C.cyan, 0.7)
            box.strokeRoundedRect(AREA.cx - 92, chipCy - 92, 184, 184, 24)
            box.fillStyle(C.cyan, 0.5)
            for (let i = 0; i < 3; i++) box.fillRect(AREA.cx - 54 + i * 40, chipCy - 20, 22, 40)
            ctx.layer.add(box)
            chip = box
        } else {
            const art = ctx.scene.add.image(AREA.cx, chipCy, SHEET.key, 4).setOrigin(0.502, 0.51).setScale(0.96)
            ctx.layer.add(art)
            chip = art
        }

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        ctx.tap(AREA.cx, chipCy, socketR * 2, socketR * 2, () => {
            if (hits >= need) return
            hits += 1
            paintRing()
            ctx.audio.think(hits - 1)
            display.setText(hits >= need ? '7 + 8 = ?' : `7 + 8 = ${'.'.repeat(hits)}`)
            void FX.to(ctx.scene, fx(chip), { scale: ctx.quiet ? 0.92 : 0.86 }, { duration: 80, yoyo: true })
            void FX.sparks(ctx.scene, AREA.cx, chipCy, { color: TONE.processador, count: 12, spread: 200 })
            if (hits >= need) {
                ctx.setTapsEnabled(false)
                done?.()
            }
        })

        await finished
        if (!ctx.alive()) return

        ctx.audio.right()
        display.setText('7 + 8 = 15')
        void FX.to(ctx.scene, fx(display), { scale: 1.16 }, { duration: 200, yoyo: true, ease: Ease.back(2) })
        ctx.note('O chip pensou e devolveu a resposta.')
        await ctx.wait(1300)
    },
}

/** Memória: ela enche, precisa ser liberada, e esquece tudo ao desligar. */
export const memoryTrial: TrialDef = {
    prompt: 'A memória encheu.',

    run: async ctx => {
        const slotW = 250
        const slotGap = 44
        const slotH = 290
        const slotCy = AREA.y + 210
        const left = AREA.cx - (3 * slotW + 2 * slotGap) / 2

        ctx.note('Tudo isto está aberto agora. Feche um para o novo caber.')

        const slots = ctx.scene.add.graphics()
        ctx.layer.add(slots)
        for (let i = 0; i < 3; i++) {
            const x = left + i * (slotW + slotGap)
            slots.fillStyle(C.shadow, 0.35)
            slots.fillRoundedRect(x + 4, slotCy - slotH / 2 + 8, slotW, slotH, 20)
            slots.fillStyle(C.bay, 1)
            slots.fillRoundedRect(x, slotCy - slotH / 2, slotW, slotH, 20)
            slots.lineStyle(5, TONE.memoria, 0.85)
            slots.strokeRoundedRect(x, slotCy - slotH / 2, slotW, slotH, 20)
            for (let k = 0; k < 9; k++) {
                slots.fillStyle(C.gold, 0.75)
                slots.fillRect(x + 22 + k * 24, slotCy + slotH / 2 - 22, 14, 12)
            }
        }

        const open = [0, 2, 3].map((frame, i) =>
            thing(ctx, left + i * (slotW + slotGap) + slotW / 2, slotCy - 24, frame, 150),
        )

        const waitCy = AREA.y + AREA.h - 108
        const waiting = thing(ctx, AREA.cx, waitCy, 1, 140)

        const tag = ctx.scene.add
            .text(AREA.cx, waitCy + 104, 'quer entrar', {
                fontFamily: FONT.black,
                fontSize: '30px',
                color: CSS.gold,
            })
            .setOrigin(0.5)
            .setResolution(2)
        tag.setStroke(CSS.ink, 7)
        ctx.layer.add(tag)

        await FX.to(ctx.scene, waiting, { y: waitCy - 34 }, { duration: 340, yoyo: true, repeat: 1 })
        if (!ctx.alive()) return

        let done: ((index: number) => void) | undefined
        const chosen = new Promise<number>(resolve => {
            done = resolve
        })

        open.forEach((card, i) => {
            ctx.tap(card.x, slotCy, slotW, slotH, () => {
                ctx.setTapsEnabled(false)
                done?.(i)
            })
        })

        const index = await chosen
        if (!ctx.alive()) return

        ctx.audio.tap()
        const closed = open[index]
        await FX.to(ctx.scene, closed, { scale: 0.15, alpha: 0 }, { duration: 300, ease: Ease.smooth })
        if (!ctx.alive()) return

        ctx.note('Abriu espaço. Agora o novo entra.')
        ctx.audio.right()
        void FX.to(ctx.scene, fx(tag), { alpha: 0 }, { duration: 180 })
        await FX.arcTo(ctx.scene, waiting, { x: closed.x, y: closed.y }, { height: 130, duration: 520 })
        if (!ctx.alive()) return

        await ctx.wait(650)
        if (!ctx.alive()) return

        ctx.note('Agora a máquina desliga...')
        ctx.audio.forget()
        void FX.flash(ctx.scene, C.ink, { duration: 300, peak: 0.7 })
        const rest = open.filter((_, i) => i !== index)
        await FX.all(
            ...[...rest, waiting].map((card, i) =>
                FX.wait(ctx.scene, i * 120).then(() =>
                    FX.to(ctx.scene, card, { alpha: 0, y: card.y - 40 }, { duration: 360 }),
                ),
            ),
        )
        if (!ctx.alive()) return

        ctx.note('A memória esqueceu tudo. É isso que ela faz.')
        await ctx.wait(1200)
    },
}
