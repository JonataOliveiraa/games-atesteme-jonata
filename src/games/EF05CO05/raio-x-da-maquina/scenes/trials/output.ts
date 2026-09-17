import { Ease, FX } from '../../../../../shared/effects/FX'
import { C, CSS, FONT, TONE, hex } from '../../data/theme'
import { THING_SHEET } from '../../data/parts'
import { AREA, type TrialDef } from './stage'

/** Tela: o desenho já existe lá dentro; a saída é o que faz a turma ver. */
export const screenTrial: TrialDef = {
    prompt: 'Mostre o desenho na tela.',

    run: async ctx => {
        const bands = 3
        let shown = 0

        ctx.note('Toque em cada faixa escura, de cima para baixo.')

        const screenW = 660
        const screenH = 400
        const screenCy = AREA.y + 210
        const top = screenCy - screenH / 2
        const left = AREA.cx - screenW / 2
        const bandH = screenH / bands

        const frame = ctx.scene.add.graphics()
        ctx.layer.add(frame)
        frame.fillStyle(C.shadow, 0.42)
        frame.fillRoundedRect(left - 22, top - 18, screenW + 44, screenH + 48, 26)
        frame.fillStyle(0x6f8ba3, 1)
        frame.fillRoundedRect(left - 26, top - 22, screenW + 52, screenH + 52, 26)
        frame.fillStyle(0x93b2c9, 1)
        frame.fillRoundedRect(left - 20, top - 16, screenW + 40, screenH + 34, 22)
        frame.fillStyle(C.ink, 1)
        frame.fillRoundedRect(left, top, screenW, screenH, 10)
        frame.fillStyle(0x6f8ba3, 1)
        frame.fillRoundedRect(AREA.cx - 60, top + screenH + 36, 120, 54, 10)
        frame.fillRoundedRect(AREA.cx - 160, top + screenH + 84, 320, 28, 14)

        if (ctx.scene.textures.exists(THING_SHEET.key)) {
            const art = ctx.scene.add.image(AREA.cx, screenCy, THING_SHEET.key, 0).setOrigin(0.5)
            art.setDisplaySize(screenH - 16, screenH - 16)
            ctx.layer.add(art)
        } else {
            const drawn = ctx.scene.add.graphics()
            ctx.layer.add(drawn)
            const ix = left + 8
            const iy = top + 8
            const iw = screenW - 16
            const ih = screenH - 16
            drawn.fillStyle(0x8fd9f2, 1)
            drawn.fillRect(ix, iy, iw, ih)
            drawn.fillStyle(0xf6d98a, 1)
            drawn.fillCircle(ix + 120, iy + 90, 52)
            drawn.fillStyle(0x7ac47f, 1)
            drawn.fillRect(ix, iy + ih - 110, iw, 110)
            drawn.fillStyle(0x5aa862, 1)
            drawn.fillRect(ix + 380, iy + ih - 180, 170, 180)
            drawn.fillStyle(0xc8874f, 1)
            drawn.fillRect(ix + 150, iy + ih - 170, 30, 170)
        }

        const covers = ctx.scene.add.graphics()
        ctx.layer.add(covers)

        const paint = () => {
            covers.clear()
            for (let i = shown; i < bands; i++) {
                const y = top + i * bandH
                covers.fillStyle(C.bay, 1)
                covers.fillRect(left, y, screenW, bandH)
                covers.lineStyle(4, C.cyan, i === shown ? 0.95 : 0.25)
                covers.strokeRect(left + 4, y + 3, screenW - 8, bandH - 6)
            }
            covers.lineStyle(7, TONE.saida, 0.9)
            covers.strokeRoundedRect(left, top, screenW, screenH, 10)
        }
        paint()

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        for (let i = 0; i < bands; i++) {
            const y = top + i * bandH + bandH / 2
            ctx.tap(AREA.cx, y, screenW, bandH, () => {
                if (i !== shown) {
                    ctx.audio.wrong()
                    ctx.note('De cima para baixo! Comece pela faixa que está acesa.')
                    return
                }
                shown += 1
                paint()
                ctx.audio.note(i)
                void FX.sparks(ctx.scene, AREA.cx, y, { color: TONE.saida, count: 14, spread: 320 })
                ctx.note(shown >= bands ? 'O desenho apareceu inteiro!' : 'Boa! Continue descendo.')
                if (shown >= bands) {
                    ctx.setTapsEnabled(false)
                    done?.()
                }
            })
        }

        await finished
        if (!ctx.alive()) return

        ctx.audio.right()

        const crowd = ctx.scene.add.graphics().setAlpha(0)
        ctx.layer.add(crowd)
        const crowdY = AREA.y + AREA.h - 58
        const shirts = [0xe36a5c, 0x4eaa78, 0x57affa, 0xf6b93b, 0xa085f2]
        for (let i = 0; i < 5; i++) {
            const x = AREA.cx + (i - 2) * 132
            crowd.fillStyle(shirts[i], 1)
            crowd.fillRoundedRect(x - 44, crowdY + 24, 88, 70, 20)
            crowd.fillStyle(0xf3c9a0, 1)
            crowd.fillCircle(x, crowdY, 34)
            crowd.fillStyle(C.ink, 1)
            crowd.fillCircle(x - 12, crowdY - 4, 5)
            crowd.fillCircle(x + 12, crowdY - 4, 5)
        }

        ctx.note('A turma inteira está vendo. Isso é saída.')
        await FX.to(ctx.scene, crowd, { alpha: 1 }, { duration: 420, ease: Ease.smooth })
        await ctx.wait(1000)
    },
}

const NOTE_COLORS = [0x7adeea, 0x9ee0b0, 0xf6d98a, 0xf2a3c0, 0xa085f2]
const GLYPHS = ['♪', '♫', '♪', '♬', '♫']

/** Alto-falante: cada nota que a criança solta no tempo é um degrau da melodia. */
export const speakerTrial: TrialDef = {
    prompt: 'Toque a melodia para fora.',

    run: async ctx => {
        const need = 5
        let played = 0
        let flying = false
        let streak = 0

        ctx.note('Toque na tela quando a nota chegar no anel.')

        /* ── a caixa de som, embaixo e centrada ────────────────────────── */
        const boxW = 300
        const boxH = 280
        const boxCy = AREA.y + AREA.h - boxH / 2 - 10
        const coneCy = boxCy - 46

        const speaker = ctx.scene.add.container(AREA.cx, boxCy)
        ctx.layer.add(speaker)

        const cabinet = ctx.scene.add.graphics()
        cabinet.fillStyle(C.shadow, 0.42)
        cabinet.fillRoundedRect(-boxW / 2 + 5, -boxH / 2 + 12, boxW, boxH, 26)
        cabinet.fillStyle(0x24455a, 1)
        cabinet.fillRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 26)
        cabinet.lineStyle(7, TONE.saida, 1)
        cabinet.strokeRoundedRect(-boxW / 2, -boxH / 2, boxW, boxH, 26)
        cabinet.fillStyle(C.white, 0.07)
        cabinet.fillRoundedRect(-boxW / 2 + 12, -boxH / 2 + 10, boxW - 24, 30, 14)
        cabinet.fillStyle(C.ink, 1)
        cabinet.fillCircle(0, -46, 82)
        cabinet.fillStyle(TONE.saida, 0.85)
        cabinet.fillCircle(0, -46, 66)
        cabinet.lineStyle(4, C.ink, 0.4)
        cabinet.strokeCircle(0, -46, 44)
        cabinet.fillStyle(C.ink, 1)
        cabinet.fillCircle(0, -46, 24)
        cabinet.fillStyle(C.white, 0.35)
        cabinet.fillCircle(-9, -55, 8)
        cabinet.fillStyle(C.ink, 1)
        cabinet.fillCircle(0, 84, 40)
        cabinet.fillStyle(TONE.saida, 0.7)
        cabinet.fillCircle(0, 84, 28)
        speaker.add(cabinet)

        /* ── o anel, em cima ───────────────────────────────────────────── */
        const ringCy = AREA.y + 132
        const ringR = 84
        const hitWindow = 74

        const ring = ctx.scene.add.graphics()
        ctx.layer.add(ring)
        const paintRing = (hot: boolean) => {
            ring.clear()
            ring.lineStyle(14, hot ? C.green : TONE.saida, hot ? 1 : 0.45)
            ring.strokeCircle(AREA.cx, ringCy, ringR)
            if (hot) {
                ring.lineStyle(5, C.green, 0.45)
                ring.strokeCircle(AREA.cx, ringCy, ringR + 22)
            }
        }
        paintRing(false)

        /* ── a partitura: um degrau por nota, no alto ──────────────────── */
        const marks = ctx.scene.add.graphics()
        ctx.layer.add(marks)
        const paintMarks = () => {
            marks.clear()
            for (let i = 0; i < need; i++) {
                const x = AREA.cx + (i - (need - 1) / 2) * 76
                const y = AREA.y + 34 - i * 7
                marks.lineStyle(4, C.bay, 1)
                marks.lineBetween(x - 28, y, x + 28, y)
                marks.fillStyle(i < played ? NOTE_COLORS[i] : C.screen, 1)
                marks.fillCircle(x, y, i < played ? 17 : 12)
            }
        }
        paintMarks()

        const note = ctx.scene.add.container(AREA.cx, coneCy).setAlpha(0)
        ctx.layer.add(note)
        const glyph = ctx.scene.add
            .text(0, 0, GLYPHS[0], { fontFamily: FONT.black, fontSize: '104px', color: CSS.cream })
            .setOrigin(0.5)
            .setResolution(2)
        glyph.setStroke(CSS.ink, 11)
        note.add(glyph)

        const thump = () => {
            void FX.to(ctx.scene, speaker, { scaleY: 1.07, scaleX: 0.95 }, { duration: 110, yoyo: true })
            void FX.ping(ctx.scene, AREA.cx, coneCy, TONE.saida, { radius: 150, duration: 520 })
            void ctx.wait(90).then(() => {
                if (ctx.alive()) void FX.ping(ctx.scene, AREA.cx, coneCy, TONE.saida, { radius: 210, duration: 620 })
            })
        }

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        /** Cada nota sobe um pouco mais rápido que a anterior. */
        const launch = () => {
            if (played >= need || !ctx.alive()) return
            flying = true
            glyph.setText(GLYPHS[played % GLYPHS.length])
            glyph.setColor(hex(NOTE_COLORS[played]))
            note.setAlpha(1).setScale(1).setAngle(-8).setPosition(AREA.cx, coneCy)
            thump()

            const travel = 1320 - played * 90
            void FX.to(ctx.scene, note, { angle: 8 }, { duration: 420, yoyo: true, repeat: -1 })
            void FX.to(ctx.scene, note, { y: ringCy - 210 }, { duration: travel, ease: 'Linear' }).then(() => {
                if (!flying || !ctx.alive()) return
                flying = false
                streak = 0
                FX.kill(ctx.scene, note)
                note.setAlpha(0)
                ctx.note('Passou direto! Vem outra.')
                void ctx.wait(300).then(launch)
            })
        }

        const watch = ctx.scene.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => paintRing(flying && Math.abs(note.y - ringCy) < hitWindow),
        })

        ctx.tap(AREA.cx, AREA.cy, AREA.w, AREA.h, () => {
            if (!flying) return
            if (Math.abs(note.y - ringCy) >= hitWindow) {
                ctx.audio.wrong()
                streak = 0
                ctx.note('Ainda não! Espere ela chegar no anel.')
                return
            }

            flying = false
            FX.kill(ctx.scene, note)
            ctx.audio.note(played)
            const color = NOTE_COLORS[played]
            played += 1
            streak += 1
            paintMarks()

            void FX.ping(ctx.scene, AREA.cx, ringCy, color, { radius: 130 })
            void FX.sparks(ctx.scene, AREA.cx, ringCy, { color, count: 16, spread: 300 })
            void FX.to(ctx.scene, note, { scale: 2.3, alpha: 0 }, { duration: 320 })

            if (played >= need) {
                ctx.setTapsEnabled(false)
                done?.()
                return
            }

            ctx.note(streak >= 3 ? 'Que ritmo! Vem a próxima.' : 'Saiu! Vem a próxima.')
            void ctx.wait(300).then(launch)
        })

        void ctx.wait(500).then(launch)

        await finished
        watch.remove()
        flying = false
        if (!ctx.alive()) return

        /* ── o prêmio: a melodia inteira sai de uma vez ────────────────── */
        ctx.note('Agora tudo junto, para fora!')
        for (let i = 0; i < need; i++) {
            if (!ctx.alive()) return
            ctx.audio.note(i)
            thump()
            void FX.ping(ctx.scene, AREA.cx, coneCy, NOTE_COLORS[i], { radius: 260, duration: 640 })
            await ctx.wait(220)
        }
        if (!ctx.alive()) return

        ctx.audio.right()
        ctx.note('A música saiu para fora. Isso é saída.')
        await ctx.wait(1000)
    },
}
