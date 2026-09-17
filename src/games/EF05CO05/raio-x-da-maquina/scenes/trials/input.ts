import Phaser from 'phaser'
import { Ease, FX } from '../../../../../shared/effects/FX'
import { C, CSS, FONT, TONE, hex } from '../../data/theme'
import { FACE_SHEET } from '../../data/parts'
import { AREA, fx, trialButton, type TrialDef } from './stage'

const FACE_COUNT = 3

/** Teclado: a palavra só entra na máquina se a criança a digitar. */
export const keyboardTrial: TrialDef = {
    prompt: 'Digite a palavra SOL.',

    run: async ctx => {
        const word = 'SOL'
        const keys = ['L', 'P', 'S', 'R', 'O']
        let typed = 0

        ctx.note('Aperte as letras na ordem: S, depois O, depois L.')

        const slotW = 130
        const slotGap = 28
        const slotH = 150
        const slotLeft = AREA.cx - (word.length * slotW + (word.length - 1) * slotGap) / 2
        const slotCy = AREA.y + 130

        const slots = ctx.scene.add.graphics()
        ctx.layer.add(slots)

        const letters: Phaser.GameObjects.Text[] = []

        const paintSlots = () => {
            slots.clear()
            for (let i = 0; i < word.length; i++) {
                const x = slotLeft + i * (slotW + slotGap)
                const done = i < typed
                slots.fillStyle(C.shadow, 0.35)
                slots.fillRoundedRect(x + 3, slotCy - slotH / 2 + 7, slotW, slotH, 18)
                slots.fillStyle(done ? C.bay : C.screen, 1)
                slots.fillRoundedRect(x, slotCy - slotH / 2, slotW, slotH, 18)
                slots.lineStyle(5, done ? TONE.entrada : C.cyan, done ? 1 : 0.35)
                slots.strokeRoundedRect(x, slotCy - slotH / 2, slotW, slotH, 18)
                if (!done) {
                    slots.fillStyle(C.cyan, i === typed ? 0.5 : 0.18)
                    slots.fillRoundedRect(x + 26, slotCy + 42, slotW - 52, 8, 4)
                }
            }
        }
        paintSlots()

        const keyW = 168
        const keyGap = 26
        const keyH = 150
        const keyLeft = AREA.cx - (keys.length * keyW + (keys.length - 1) * keyGap) / 2
        const keyCy = AREA.y + AREA.h - 130

        const board = ctx.scene.add.graphics()
        ctx.layer.add(board)
        const boardW = keys.length * keyW + (keys.length - 1) * keyGap + 72
        const boardH = keyH + 74
        board.fillStyle(C.shadow, 0.4)
        board.fillRoundedRect(AREA.cx - boardW / 2, keyCy - boardH / 2 + 14, boardW, boardH, 26)
        board.fillStyle(0x2f6fb8, 1)
        board.fillRoundedRect(AREA.cx - boardW / 2, keyCy - boardH / 2, boardW, boardH, 26)
        board.fillStyle(0x4c93de, 1)
        board.fillRoundedRect(AREA.cx - boardW / 2 + 8, keyCy - boardH / 2 + 8, boardW - 16, boardH - 26, 20)
        board.fillStyle(C.white, 0.16)
        board.fillRoundedRect(AREA.cx - boardW / 2 + 14, keyCy - boardH / 2 + 12, boardW - 28, 20, 10)

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        keys.forEach((letter, i) => {
            const x = keyLeft + i * (keyW + keyGap) + keyW / 2
            const button = trialButton(ctx, {
                x,
                y: keyCy,
                w: keyW,
                h: keyH,
                label: letter,
                tone: C.cream,
                textColor: CSS.ink,
                size: 66,
                round: 20,
                onTap: () => {
                    if (typed >= word.length) return

                    if (letter !== word[typed]) {
                        ctx.audio.wrong()
                        void button.shake()
                        return
                    }

                    ctx.audio.key()
                    void button.press()

                    const slotX = slotLeft + typed * (slotW + slotGap) + slotW / 2
                    const mark = ctx.scene.add
                        .text(x, keyCy, letter, {
                            fontFamily: FONT.black,
                            fontSize: '66px',
                            color: hex(TONE.entrada),
                        })
                        .setOrigin(0.5)
                        .setResolution(2)
                    mark.setStroke(CSS.ink, 8)
                    ctx.layer.add(mark)
                    letters.push(mark)

                    typed += 1
                    paintSlots()
                    void FX.to(ctx.scene, fx(mark), { x: slotX, y: slotCy }, { duration: 320, ease: Ease.back(1.6) })

                    if (typed >= word.length) {
                        ctx.setTapsEnabled(false)
                        done?.()
                    }
                },
            })
        })

        await finished
        if (!ctx.alive()) return

        ctx.note('A palavra entrou na máquina!')
        ctx.audio.right()
        ctx.audio.whoosh()
        await FX.all(
            ...letters.map((mark, i) =>
                FX.wait(ctx.scene, i * 100).then(() =>
                    FX.to(ctx.scene, fx(mark), { y: -80, alpha: 0 }, { duration: 460, ease: Ease.smooth }),
                ),
            ),
        )
        await ctx.wait(400)
    },
}

/** Câmera: a imagem só entra se a criança enquadrar e disparar. */
export const cameraTrial: TrialDef = {
    prompt: 'Fotografe o rosto.',

    run: async ctx => {
        const need = 2
        let taken = 0

        ctx.note('Aperte o botão quando o rosto estiver na moldura.')

        const viewX = AREA.x + 60
        const viewY = AREA.y + 10
        const viewW = AREA.w - 120
        const viewH = AREA.h - 170

        const view = ctx.scene.add.graphics()
        ctx.layer.add(view)
        view.fillStyle(0x0e2a1c, 1)
        view.fillRoundedRect(viewX, viewY, viewW, viewH, 26)
        for (let y = viewY + 10; y < viewY + viewH - 6; y += 7) {
            view.fillStyle(0x6ee7a0, 0.05)
            view.fillRect(viewX + 8, y, viewW - 16, 2)
        }
        view.lineStyle(6, 0x6ee7a0, 0.6)
        view.strokeRoundedRect(viewX, viewY, viewW, viewH, 26)
        view.lineStyle(2, 0x6ee7a0, 0.18)
        for (let i = 1; i < 3; i++) {
            view.lineBetween(viewX + (viewW / 3) * i, viewY + 10, viewX + (viewW / 3) * i, viewY + viewH - 10)
            view.lineBetween(viewX + 10, viewY + (viewH / 3) * i, viewX + viewW - 10, viewY + (viewH / 3) * i)
        }

        const rec = ctx.scene.add.graphics()
        ctx.layer.add(rec)
        rec.fillStyle(0xff6b6b, 1)
        rec.fillCircle(viewX + 42, viewY + 40, 13)
        ctx.scene.tweens.add({ targets: rec, alpha: 0.25, duration: 620, yoyo: true, repeat: -1 })

        const frameW = 300
        const frameH = 330
        const frameCy = viewY + viewH / 2 - 10

        const face = ctx.scene.add.container(viewX + 150, frameCy)
        ctx.layer.add(face)

        if (ctx.scene.textures.exists(FACE_SHEET.key)) {
            const pick = Math.floor(Math.random() * FACE_COUNT)
            const art = ctx.scene.add.image(0, 0, FACE_SHEET.key, pick).setOrigin(0.5)
            art.setDisplaySize(250, 250)
            face.add(art)
        } else {
            const head = ctx.scene.add.graphics()
            head.fillStyle(0xf3c9a0, 1)
            head.fillCircle(0, 0, 96)
            head.fillStyle(C.ink, 1)
            head.fillCircle(-32, -14, 12)
            head.fillCircle(32, -14, 12)
            head.lineStyle(8, C.ink, 1)
            head.beginPath()
            head.arc(0, 16, 38, 0.25, Math.PI - 0.25)
            head.strokePath()
            face.add(head)
        }

        const guide = ctx.scene.add.graphics()
        ctx.layer.add(guide)
        const paintGuide = (hot: boolean) => {
            guide.clear()
            const x = AREA.cx - frameW / 2
            const y = frameCy - frameH / 2
            const arm = 64
            guide.lineStyle(9, hot ? C.green : C.cream, hot ? 1 : 0.65)
            guide.beginPath()
            guide.moveTo(x, y + arm); guide.lineTo(x, y); guide.lineTo(x + arm, y)
            guide.moveTo(x + frameW - arm, y); guide.lineTo(x + frameW, y); guide.lineTo(x + frameW, y + arm)
            guide.moveTo(x, y + frameH - arm); guide.lineTo(x, y + frameH); guide.lineTo(x + arm, y + frameH)
            guide.moveTo(x + frameW - arm, y + frameH); guide.lineTo(x + frameW, y + frameH)
            guide.lineTo(x + frameW, y + frameH - arm)
            guide.strokePath()
        }
        paintGuide(false)

        const drift = ctx.scene.tweens.add({
            targets: face,
            x: viewX + viewW - 150,
            y: frameCy - 70,
            duration: 2200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })

        const inFrame = () =>
            Math.abs(face.x - AREA.cx) < frameW / 2 - 50 && Math.abs(face.y - frameCy) < frameH / 2 - 50

        const shots = ctx.scene.add.graphics()
        ctx.layer.add(shots)
        const paintShots = () => {
            shots.clear()
            for (let i = 0; i < need; i++) {
                const x = AREA.cx + (i - (need - 1) / 2) * 52
                shots.fillStyle(i < taken ? C.green : C.bay, 1)
                shots.fillCircle(x, AREA.y + AREA.h - 24, 15)
            }
        }
        paintShots()

        let done: (() => void) | undefined
        const finished = new Promise<void>(resolve => {
            done = resolve
        })

        const shutter = trialButton(ctx, {
            x: AREA.cx,
            y: AREA.y + AREA.h - 110,
            w: 260,
            h: 112,
            label: 'FOTO',
            tone: TONE.entrada,
            textColor: CSS.white,
            size: 46,
            round: 56,
            onTap: () => {
                if (taken >= need) return

                if (!inFrame()) {
                    ctx.audio.wrong()
                    ctx.note('Escapou! Espere o rosto entrar na moldura.')
                    void shutter.shake()
                    return
                }

                taken += 1
                ctx.audio.shutter()
                void shutter.press()
                void FX.flash(ctx.scene, 0xffffff, { duration: 220, peak: 0.5 })
                paintShots()

                const photo = ctx.scene.add.container(face.x, face.y)
                ctx.layer.add(photo)
                const paper = ctx.scene.add.graphics()
                paper.fillStyle(C.cream, 1)
                paper.fillRoundedRect(-62, -62, 124, 124, 10)
                paper.fillStyle(TONE.entrada, 1)
                paper.fillRoundedRect(-52, -52, 104, 88, 8)
                photo.add(paper)

                void FX.arcTo(
                    ctx.scene,
                    photo,
                    { x: viewX + viewW - 96, y: viewY + 96 },
                    { height: 140, duration: 560 },
                ).then(() => FX.to(ctx.scene, photo, { alpha: 0, scale: 0.6 }, { duration: 260 }))

                ctx.note(taken >= need ? 'As duas fotos entraram!' : 'Boa! Falta uma.')
                if (taken >= need) {
                    ctx.setTapsEnabled(false)
                    done?.()
                }
            },
        })

        const watch = ctx.scene.time.addEvent({
            delay: 70,
            loop: true,
            callback: () => paintGuide(inFrame()),
        })

        await finished
        watch.remove()
        drift.remove()
        if (!ctx.alive()) return

        ctx.audio.right()
        await ctx.wait(600)
    },
}
