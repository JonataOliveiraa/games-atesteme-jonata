import Phaser from 'phaser'
import { FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, CSS, FONT, SIZE } from '../data/theme'
import {
    DEPTH, HEADER_CARD, HEADER_TEXT, HELP, HINT, LEVEL_PILL, PANEL, PHASE_PIPS,
} from '../data/layout'
import { createMeaningCard } from './cards'
import type { SubjectDef } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

/**
 * O painel do topo. Ele responde três perguntas que a criança faz o tempo
 * todo: onde estou (nível e fase), o que estou levando (a mensagem de agora) e
 * como pedir ajuda.
 *
 * A mensagem fica GRANDE e no meio porque é o termo de comparação: tudo o que
 * ela vai fazer em quadra é procurar quem diz aquilo de outro jeito.
 */
export function createHeader(scene: Phaser.Scene, phaseCount: number, onHelp: () => void) {
    const parts: Phaser.GameObjects.GameObject[] = []

    const panel = scene.add.graphics().setDepth(DEPTH.panel)
    panel.fillStyle(C.ink, 0.22)
    panel.fillRoundedRect(PANEL.x, PANEL.y + 8, PANEL.w, PANEL.h, PANEL.r)
    panel.fillStyle(C.ink, 1)
    panel.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
    panel.fillStyle(C.creamDeep, 1)
    panel.fillRoundedRect(PANEL.x + 6, PANEL.y + 6, PANEL.w - 12, PANEL.h - 12, PANEL.r - 6)
    panel.fillStyle(C.cream, 1)
    panel.fillRoundedRect(PANEL.x + 6, PANEL.y + 6, PANEL.w - 12, PANEL.h - 20, PANEL.r - 6)
    parts.push(panel)

    const pill = scene.add.graphics().setDepth(DEPTH.hud)
    pill.fillStyle(C.ink, 1)
    pill.fillRoundedRect(LEVEL_PILL.x, LEVEL_PILL.y, LEVEL_PILL.w, LEVEL_PILL.h, LEVEL_PILL.h / 2)
    pill.fillStyle(C.shirtDark, 1)
    pill.fillRoundedRect(
        LEVEL_PILL.x + 4, LEVEL_PILL.y + 4,
        LEVEL_PILL.w - 8, LEVEL_PILL.h - 8, (LEVEL_PILL.h - 8) / 2,
    )
    pill.fillStyle(C.white, 0.22)
    pill.fillRoundedRect(LEVEL_PILL.x + 14, LEVEL_PILL.y + 9, LEVEL_PILL.w - 28, 9, 5)
    parts.push(pill)

    const levelLabel = scene.add.text(
        LEVEL_PILL.x + LEVEL_PILL.w / 2, LEVEL_PILL.y + LEVEL_PILL.h / 2, 'NÍVEL 1/3',
        { fontFamily: FONT.black, fontSize: SIZE.hudLevel, color: CSS.cream },
    ).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(levelLabel)

    const pips = scene.add.graphics().setDepth(DEPTH.hud + 1)
    parts.push(pips)

    function paintPips(current: number) {
        pips.clear()
        const spread = (phaseCount - 1) * PHASE_PIPS.gap
        for (let i = 0; i < phaseCount; i++) {
            const x = PHASE_PIPS.cx - spread / 2 + i * PHASE_PIPS.gap
            const on = i === current
            pips.fillStyle(C.ink, 0.9)
            pips.fillCircle(x, PHASE_PIPS.y + 2, PHASE_PIPS.r + 3)
            pips.fillStyle(i < current ? C.ok : on ? C.warn : C.creamEdge, 1)
            pips.fillCircle(x, PHASE_PIPS.y, on ? PHASE_PIPS.r + 2 : PHASE_PIPS.r)
        }
    }
    paintPips(0)

    const phaseLabel = scene.add.text(
        PHASE_PIPS.cx, PHASE_PIPS.y + 24, 'FASE 1 DE 3',
        { fontFamily: FONT.black, fontSize: SIZE.hudPhase, color: CSS.inkSoft },
    ).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(phaseLabel)

    const intro = scene.add.text(HEADER_CARD.x - 74, HEADER_CARD.y - 26, 'MANDE ESTE RECADO', {
        fontFamily: FONT.black, fontSize: '17px', color: CSS.inkSoft, align: 'right',
    }).setOrigin(1, 0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(intro)

    const cardHolder = scene.add.container(HEADER_CARD.x, HEADER_CARD.y).setDepth(DEPTH.hud + 1)
    parts.push(cardHolder)
    let card: Phaser.GameObjects.Container | null = null

    /* A frase por extenso, ao lado do desenho: o desenho é para a criança, a
     * frase é para quem lê com ela. */
    const phrase = scene.add.text(HEADER_TEXT.x, HEADER_CARD.y, '', {
        fontFamily: FONT.black,
        fontSize: SIZE.word,
        color: CSS.ink,
        wordWrap: { width: HEADER_TEXT.w },
        lineSpacing: 2,
    }).setOrigin(0, 0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(phrase)

    /*
     * A FAIXA DE INSTRUÇÃO, sempre na tela. É ela que responde "o que eu faço
     * aqui" sem a criança ter que lembrar do tutorial — e foi a falta dela que
     * fez o jogo parecer mudo.
     */
    const hintG = scene.add.graphics().setDepth(DEPTH.hud)
    hintG.fillStyle(C.ink, 1)
    hintG.fillRoundedRect(HINT.x - HINT.w / 2, HINT.y - HINT.h / 2, HINT.w, HINT.h, HINT.h / 2)
    hintG.fillStyle(C.warn, 1)
    hintG.fillRoundedRect(
        HINT.x - HINT.w / 2 + 4, HINT.y - HINT.h / 2 + 4,
        HINT.w - 8, HINT.h - 8, (HINT.h - 8) / 2,
    )
    hintG.fillStyle(C.white, 0.34)
    hintG.fillRoundedRect(HINT.x - HINT.w / 2 + 18, HINT.y - HINT.h / 2 + 9, HINT.w - 36, 10, 5)
    parts.push(hintG)

    const hintText = scene.add.text(HINT.x, HINT.y, 'Toque em quem diz a MESMA coisa', {
        fontFamily: FONT.black, fontSize: '23px', color: CSS.ink,
    }).setOrigin(0.5).setDepth(DEPTH.hud + 1).setResolution(2)
    parts.push(hintText)

    // ─────────────────────────────────────────────────────── o `?`

    const help = scene.add.container(HELP.x, HELP.y).setDepth(DEPTH.hud + 2)
    const helpG = scene.add.graphics()
    const mark = scene.add.text(0, 1, '?', {
        fontFamily: FONT.black, fontSize: SIZE.help, color: CSS.white,
    }).setOrigin(0.5).setResolution(2)
    mark.setStroke(CSS.ink, 5)
    helpG.fillStyle(C.ink, 1)
    helpG.fillCircle(0, 0, HELP.r)
    helpG.fillStyle(C.shirtDark, 1)
    helpG.fillCircle(0, 0, HELP.r - 5)
    helpG.fillStyle(C.shirt, 1)
    helpG.fillCircle(0, -4, HELP.r - 9)
    helpG.fillStyle(C.white, 0.3)
    helpG.fillEllipse(-HELP.r * 0.26, -HELP.r * 0.42, HELP.r * 0.7, HELP.r * 0.3)
    help.add([helpG, mark])
    parts.push(help)

    const helpZone = scene.add
        .zone(HELP.x, HELP.y, HELP.r * 2.6, HELP.r * 2.6)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setDepth(DEPTH.hud + 3)
    helpZone.on('pointerdown', () => {
        void FX.impact(scene, fx(help), 0.22)
        onHelp()
    })
    parts.push(helpZone)

    return {
        setLevel(level: number, total: number) {
            levelLabel.setText(`NÍVEL ${level}/${total}`)
        },

        setPhase(index: number) {
            paintPips(index)
            phaseLabel.setText(`FASE ${index + 1} DE ${phaseCount}`)
            void FX.impact(scene, fx(pips), 0.3)
        },

        /**
         * O topo mostra o SIGNIFICADO, e ele não muda durante a fase. A lição
         * — a mesma coisa dita de vários jeitos — aparece nas plaquinhas que a
         * criança escolhe, e não numa carta que troca sozinha no cabeçalho.
         */
        setMessage(subject: SubjectDef) {
            card?.destroy()
            card = createMeaningCard(scene, subject, HEADER_CARD.size)
            cardHolder.add(card)
            phrase.setText(subject.phrase)
            card.setScale(0.3)
            void FX.to(scene, fx(card), { scale: 1 }, { duration: 300, ease: 'Back.easeOut' })
        },

        setHint(text: string) {
            hintText.setText(text)
            void FX.impact(scene, fx(hintText), 0.2)
        },

        setHelpEnabled(on: boolean) {
            help.setAlpha(on ? 1 : 0.4)
            if (on) helpZone.setInteractive({ useHandCursor: true })
            else helpZone.disableInteractive()
        },

        destroy() {
            FX.kill(scene, fx(pips))
            card?.destroy()
            parts.forEach(p => p.destroy())
        },
    }
}
