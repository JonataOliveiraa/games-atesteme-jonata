import Phaser from 'phaser'
import { FX, type Typewriter } from '../../../../shared/effects/FX'
import { DEPTH, TUT } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'
import { TEX } from './BootScene'

export interface Teacher {
    say(line: string): Promise<void>
    /** Completa a frase que está sendo escrita. Devolve `true` se havia uma. */
    skipSay(): boolean
    setButton(label: string, on: boolean): void
    step(): void
    leave(): Promise<void>
    comeBack(): Promise<void>
    destroy(): void
}

export interface TeacherOptions {
    onNext(): void
    onSkip(): void
}

/** Os dois quadros de frente: 3 é a explicação, 4 é o convite. */
const FACING = { explain: 3, invite: 4 } as const

export function createTeacher(scene: Phaser.Scene, options: TeacherOptions): Teacher {
    const root = scene.add.container(0, 0).setDepth(DEPTH.hud + 20)

    const art = scene.textures.exists(TEX.coach)
        ? scene.add.sprite(TUT.teacherX, TUT.teacherBase, TEX.coach, FACING.invite)
        : undefined
    if (art) {
        art.setOrigin(0.5, 1)
        art.setDisplaySize(TUT.teacherH * (500 / 550), TUT.teacherH)
        root.add(art)
    }

    const panel = scene.add.graphics()
    panel.fillStyle(C.ink, A.shadow)
    panel.fillRoundedRect(TUT.panelX + 6, TUT.panelY + 10, TUT.panelW, TUT.panelH, 30)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(TUT.panelX, TUT.panelY, TUT.panelW, TUT.panelH, 30)
    panel.fillStyle(C.card, 1)
    panel.fillRoundedRect(TUT.panelX + 6, TUT.panelY + 6, TUT.panelW - 12, TUT.panelH - 12, 26)
    panel.fillStyle(C.ink, 1)
    panel.fillTriangle(
        TUT.panelX + 4, TUT.panelY + 96,
        TUT.panelX + 4, TUT.panelY + 156,
        TUT.panelX - 42, TUT.panelY + 126,
    )
    panel.fillStyle(C.card, 1)
    panel.fillTriangle(
        TUT.panelX + 10, TUT.panelY + 104,
        TUT.panelX + 10, TUT.panelY + 148,
        TUT.panelX - 28, TUT.panelY + 126,
    )
    root.add(panel)

    const text = scene.add
        .text(TUT.textX, TUT.panelY + TUT.panelH / 2, '', {
            fontFamily: FONT.black,
            fontSize: '40px',
            color: CSS.ink,
            wordWrap: { width: TUT.textWrap },
            lineSpacing: 6,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    root.add(text)

    const button = scene.add.container(TUT.btnX, TUT.btnY)
    const btnBody = scene.add.graphics()
    const btnLabel = scene.add
        .text(0, 0, 'PRÓXIMO', { fontFamily: FONT.black, fontSize: '30px', color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    btnLabel.setStroke(CSS.ink, 6)
    button.add(btnBody)
    button.add(btnLabel)
    button.setAlpha(0)
    root.add(button)

    const paintButton = () => {
        btnBody.clear()
        btnBody.fillStyle(C.ink, A.shadow)
        btnBody.fillRoundedRect(-TUT.btnW / 2 + 4, -TUT.btnH / 2 + 8, TUT.btnW, TUT.btnH, 22)
        btnBody.fillStyle(C.ink, 1)
        btnBody.fillRoundedRect(-TUT.btnW / 2, -TUT.btnH / 2, TUT.btnW, TUT.btnH, 22)
        btnBody.fillStyle(C.green, 1)
        btnBody.fillRoundedRect(-TUT.btnW / 2 + 5, -TUT.btnH / 2 + 5, TUT.btnW - 10, TUT.btnH - 10, 18)
        btnBody.fillStyle(C.white, 0.22)
        btnBody.fillRoundedRect(-TUT.btnW / 2 + 14, -TUT.btnH / 2 + 12, TUT.btnW - 28, 16, 8)
    }
    paintButton()

    // O clique olha uma FLAG, não o alpha. O botão é filho da treinadora, e
    // quando ela sai de cena o alpha local dele continua 1 — dava para clicar
    // num botão invisível e pular um tempo do tutorial.
    let ready = false
    let writer: Typewriter | undefined

    const btnZone = scene.add
        .zone(TUT.btnX, TUT.btnY, TUT.btnW + 40, TUT.btnH + 30)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 22)
        .setInteractive({ useHandCursor: true })
    if (btnZone.input) btnZone.input.enabled = false
    btnZone.on('pointerdown', () => {
        if (!ready || root.alpha < 0.9) return
        void FX.press(scene, button)
        options.onNext()
    })

    const skip = scene.add
        .text(TUT.skipX, TUT.skipY, 'PULAR', { fontFamily: FONT.black, fontSize: '24px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
        .setAlpha(0.7)
    skip.setStroke(CSS.white, 6)
    root.add(skip)

    const skipZone = scene.add
        .zone(TUT.skipX, TUT.skipY, 160, 90)
        .setOrigin(0.5)
        .setDepth(DEPTH.hud + 22)
        .setInteractive({ useHandCursor: true })
    skipZone.on('pointerdown', () => options.onSkip())

    return {
        // A frase é ESCRITA, não aparece pronta: o ritmo da leitura passa a ser
        // visível, e um toque na tela completa a linha para quem lê rápido.
        say: async line => {
            FX.kill(scene, text)
            text.setAlpha(1)
            art?.setFrame(FACING.explain)
            writer = FX.type(scene, text, line, { delay: 26 })
            await writer
            writer = undefined
            art?.setFrame(FACING.invite)
        },

        skipSay: () => {
            if (!writer) return false
            writer.skip()
            return true
        },

        step: () => {
            if (!art) return
            art.setFrame(art.frame.name === String(FACING.invite) ? FACING.explain : FACING.invite)
        },

        setButton: (label, on) => {
            ready = on
            btnLabel.setText(label)
            paintButton()
            if (btnZone.input) btnZone.input.enabled = on
            FX.kill(scene, button)
            button.setScale(1)
            void FX.to(scene, button, { alpha: on ? 1 : 0 }, { duration: 180 })
        },

        leave: async () => {
            ready = false
            if (btnZone.input) btnZone.input.enabled = false
            FX.kill(scene, root)
            await FX.to(scene, root, { alpha: 0 }, { duration: 260 })
        },

        comeBack: async () => {
            FX.kill(scene, root)
            await FX.to(scene, root, { alpha: 1 }, { duration: 260 })
        },

        destroy: () => {
            btnZone.destroy()
            skipZone.destroy()
            art?.destroy()
            root.destroy(true)
        },
    }
}
