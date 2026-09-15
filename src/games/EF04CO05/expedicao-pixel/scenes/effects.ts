import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { MASTER, SHEET } from '../data/art'
import { DEPTH, H, HINT, MASTER_AT, W } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'

/**
 * A praça, o mestre da festa e o balão de fala.
 *
 * O fundo entregue já é a cena inteira: céu vazio em cima, bandeirinhas e
 * telhados no meio, multidão olhando para cima e chão livre embaixo. O jogo não
 * escurece nada — a noite dele já está pronta, e um véu por cima só apagaria a
 * luz quente das barracas, que é o que faz a cena parecer festa.
 */

export function createFair(scene: Phaser.Scene) {
    const objects: Phaser.GameObjects.GameObject[] = []

    if (scene.textures.exists(SHEET.fair)) {
        const bg = scene.add.image(W / 2, H / 2, SHEET.fair).setDepth(DEPTH.bg)
        bg.setScale(Math.max(W / bg.width, H / bg.height))
        objects.push(bg)
    } else {
        const g = scene.add.graphics().setDepth(DEPTH.bg)
        // céu em degradê, por faixas: é reserva, não entrega
        for (let i = 0; i < 26; i++) {
            const t = i / 25
            const color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(C.skyHigh),
                Phaser.Display.Color.ValueToColor(C.skyLow),
                25,
                i,
            )
            g.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b), 1)
            g.fillRect(0, t * 360, W, 16)
        }
        g.fillStyle(C.roof, 1)
        for (let x = -40; x < W + 80; x += 150) {
            g.fillRect(x, 300, 120, 80)
            g.fillTriangle(x - 10, 300, x + 130, 300, x + 60, 258)
        }
        g.fillStyle(C.crowd, 1)
        g.fillRect(0, 380, W, 114)
        for (let x = 20; x < W; x += 58) g.fillCircle(x, 388, 26)
        g.fillStyle(C.wood, 1)
        g.fillRect(0, 494, W, H - 494)
        objects.push(g)
    }

    return {
        destroy() {
            objects.forEach(o => o.destroy())
        },
    }
}

export type Fair = ReturnType<typeof createFair>

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O MESTRE DA FESTA — QUE SÓ ENTRA QUANDO TEM O QUE COMEMORAR
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Ele aparece UMA VEZ por nível: quando as três rodadas fecham e o céu está
 * cheio dos fogos que a criança fez. Em cena o tempo todo ele seria mobília —
 * uma folha de 500 × 750 por quadro desenhada pequena num canto, sem fazer nada.
 *
 * Como só entra na hora da festa, ele pode entrar **grande**, e por cima do véu
 * do painel de fim de nível: ali ele não disputa espaço com peça nenhuma, e a
 * comemoração tem alguém comemorando.
 *
 * O balão continua existindo sozinho: a dica de erro é uma frase da festa, não
 * precisa de ninguém em cena para ser lida. Por isso o rabicho é uma peça
 * separada, que só aparece quando há uma boca de onde a fala sai.
 */
export function createMaster(scene: Phaser.Scene) {
    const hasArt = scene.textures.exists(SHEET.master)

    const guy = hasArt
        ? scene.add
              .image(MASTER_AT.cx, MASTER_AT.cy, SHEET.master, MASTER.talking)
              .setDisplaySize(MASTER_AT.w, MASTER_AT.h)
              .setDepth(DEPTH.console)
              .setVisible(false)
        : undefined

    const balloon = scene.add.container(HINT.cx, HINT.cy).setDepth(DEPTH.hint).setAlpha(0)
    const bubble = scene.add.graphics()
    bubble.fillStyle(C.ink, 0.55)
    bubble.fillRoundedRect(-HINT.w / 2 + 5, -HINT.h / 2 + 8, HINT.w, HINT.h, 22)
    bubble.fillStyle(C.warm, 1)
    bubble.fillRoundedRect(-HINT.w / 2, -HINT.h / 2, HINT.w, HINT.h, 22)
    bubble.fillStyle(0xfff6e2, 1)
    bubble.fillRoundedRect(-HINT.w / 2 + 7, -HINT.h / 2 + 7, HINT.w - 14, HINT.h - 14, 16)

    // o rabicho aponta para o mestre; sem ele em cena, a fala é da festa e o
    // balão fica sem bico, como uma faixa
    const tail = scene.add.graphics().setVisible(false)
    tail.fillStyle(0xfff6e2, 1)
    tail.fillTriangle(-HINT.w / 2 + 12, 10, -HINT.w / 2 - 30, 34, -HINT.w / 2 + 12, -20)

    const text = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.body,
            fontSize: '27px',
            color: CSS.wood,
            align: 'center',
            wordWrap: { width: HINT.w - 48 },
            lineSpacing: 5,
        })
        .setOrigin(0.5)
        .setResolution(2)

    balloon.add([bubble, tail, text])
    let visible = false
    let onStage = false

    const enter = () => {
        if (!guy || onStage) return
        onStage = true
        guy.setVisible(true).setAlpha(0)
        void FX.to(scene, guy, { alpha: 1 }, { duration: 200 })
        void FX.popIn(scene, guy, { from: 0.86, duration: 320 })
    }

    return {
        /**
         * Entra comemorando. É a única hora em que ele aparece.
         *
         * `depth` sobe ele acima do véu do fim de nível: sem isso ele
         * comemoraria por baixo do painel, no escuro.
         */
        cheer(depth?: number) {
            if (!guy) return
            guy.setFrame(MASTER.cheering)
            guy.setDepth(depth ?? DEPTH.console)
            enter()
            void FX.to(scene, guy, { y: MASTER_AT.cy - 16 }, { duration: 180, yoyo: true, repeat: 3 })
        },

        /**
         * A fala. `comMestre` pede o rabicho — e só a virada de rodada pede,
         * porque só nela ele está em cena.
         */
        async say(message: string, comMestre = false) {
            text.setText(message)
            tail.setVisible(comMestre && !!guy && onStage)
            if (visible) {
                await FX.shake(scene, balloon, { amount: 6, times: 2 })
                return
            }
            visible = true
            balloon.setScale(0.82)
            await FX.to(scene, balloon, { alpha: 1, scale: 1 }, { duration: 230, ease: 'Back.easeOut' })
        },

        hush() {
            if (!visible) return
            visible = false
            void FX.to(scene, balloon, { alpha: 0, scale: 0.9 }, { duration: 160 })
        },

        /** Sai de cena. Chamado no começo de toda rodada. */
        leave() {
            if (!guy || !onStage) return
            onStage = false
            void FX.to(scene, guy, { alpha: 0 }, { duration: 200 }).then(() => {
                if (!onStage) guy.setVisible(false).setY(MASTER_AT.cy).setDepth(DEPTH.console)
            })
        },

        bounds() {
            return { x: MASTER_AT.cx, y: MASTER_AT.cy, w: MASTER_AT.w + 20, h: MASTER_AT.h + 20 }
        },

        destroy() {
            scene.tweens.killTweensOf(balloon)
            if (guy) scene.tweens.killTweensOf(guy)
            balloon.destroy(true)
            guy?.destroy()
        },
    }
}

export type Master = ReturnType<typeof createMaster>
