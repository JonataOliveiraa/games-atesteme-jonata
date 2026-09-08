import Phaser from 'phaser'
import { CARD, DEPTH } from '../data/layout'
import { C, CSS, FONT } from '../data/theme'
import { SIGNAL_FRAME } from '../data/rules'
import type { Rule } from '../types'

const splitKeyword = (text: string) => {
    const upper = text.toUpperCase()
    for (const word of ['ENQUANTO', 'ATÉ']) {
        const at = upper.indexOf(word)
        if (at < 0) continue
        return {
            before: text.slice(0, at).trim(),
            keyword: word,
            after: text.slice(at + word.length).trim(),
        }
    }
    return { before: '', keyword: '', after: text }
}

const signalIcon = (scene: Phaser.Scene, rule: Rule, size: number) => {
    if (!scene.textures.exists('sinais')) return null
    const frames = SIGNAL_FRAME[rule.watches]
    return scene.add
        .image(0, 0, 'sinais', rule.keepsWhile ? frames.on : frames.off)
        .setDisplaySize(size, size)
}

const loopGlyph = (scene: Phaser.Scene) => {
    const g = scene.add.graphics()
    g.lineStyle(9, C.blueDark, 1)
    g.beginPath()
    g.arc(0, 0, 20, Math.PI * 0.35, Math.PI * 1.75)
    g.strokePath()
    g.fillStyle(C.blueDark, 1)
    g.fillTriangle(20, -14, 30, 4, 10, 6)
    return g
}

export function createRuleCard(scene: Phaser.Scene) {
    const hw = CARD.w / 2
    const hh = CARD.h / 2

    const root = scene.add.container(CARD.cx, CARD.cy).setDepth(DEPTH.card).setAlpha(0)
    const panel = scene.add.graphics()

    const paint = (alert: boolean) => {
        panel.clear()
        panel.fillStyle(C.ink, 0.24)
        panel.fillRoundedRect(-hw + 5, -hh + 10, CARD.w, CARD.h, 26)
        panel.fillStyle(alert ? C.warnDark : C.ink, 1)
        panel.fillRoundedRect(-hw, -hh, CARD.w, CARD.h, 26)
        panel.fillStyle(alert ? C.warn : C.cream, 1)
        panel.fillRoundedRect(-hw + 7, -hh + 7, CARD.w - 14, CARD.h - 14, 20)
        panel.fillStyle(C.white, 0.7)
        panel.fillRoundedRect(-hw + 20, -hh + 15, CARD.w - 40, 16, 8)

        panel.fillStyle(alert ? C.warnDark : C.blue, 1)
        panel.fillRoundedRect(-hw + 7, -hh + 7, 118, CARD.h - 14, 20)
        panel.fillRect(-hw + 88, -hh + 7, 38, CARD.h - 14)
        panel.fillStyle(C.white, 1)
        panel.fillCircle(-hw + 66, 0, 40)
    }

    paint(false)

    const chip = scene.add.graphics()
    const keyword = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '34px',
            color: CSS.white,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)

    const rest = scene.add
        .text(0, 0, '', {
            fontFamily: FONT.black,
            fontSize: '34px',
            color: CSS.ink,
        })
        .setOrigin(0, 0.5)
        .setResolution(2)

    const spinner = loopGlyph(scene).setPosition(hw - 62, 0).setAlpha(0.25)

    root.add([panel, chip, keyword, rest, spinner])

    let icon: Phaser.GameObjects.Image | null = null
    let spin: Phaser.Tweens.Tween | null = null

    return {
        show(rule: Rule) {
            const parts = splitKeyword(rule.text)
            const x0 = -hw + 140

            keyword.setText(parts.keyword)
            rest.setText(parts.after)

            keyword.setX(x0 + 18)
            chip.clear()
            chip.fillStyle(C.ink, 1)
            chip.fillRoundedRect(x0, -25, keyword.width + 36, 50, 14)
            rest.setX(x0 + keyword.width + 52)

            icon?.destroy()
            icon = signalIcon(scene, rule, 78)
            if (icon) {
                icon.setPosition(-hw + 66, 0)
                root.add(icon)
                root.sendToBack(panel)
            }

            scene.tweens.killTweensOf(root)
            root.setAlpha(0).setScale(0.92)
            scene.tweens.add({
                targets: root,
                alpha: 1,
                scale: 1,
                duration: 380,
                ease: 'Back.easeOut',
            })
        },

        /** O laço está rodando: o símbolo gira enquanto o dedo está lá. */
        setLooping(value: boolean) {
            if (value && !spin) {
                spinner.setAlpha(1)
                spin = scene.tweens.add({
                    targets: spinner,
                    rotation: Math.PI * 2,
                    duration: 900,
                    repeat: -1,
                })
                return
            }
            if (!value && spin) {
                spin.stop()
                spin = null
                spinner.setAlpha(0.25).setRotation(0)
            }
        },

        pulse() {
            scene.tweens.killTweensOf(root)
            root.setAlpha(1).setScale(1)
            scene.tweens.add({
                targets: root,
                scale: 1.045,
                duration: 210,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut',
            })
        },

        alert(on: boolean) {
            paint(on)
            keyword.setColor(CSS.white)
            rest.setColor(on ? CSS.white : CSS.ink)
        },

        bounds() {
            return { x: CARD.cx, y: CARD.cy, w: CARD.w + 20, h: CARD.h + 20 }
        },

        hide() {
            scene.tweens.killTweensOf(root)
            scene.tweens.add({ targets: root, alpha: 0, duration: 200 })
        },

        destroy() {
            spin?.stop()
            scene.tweens.killTweensOf(root)
            root.destroy(true)
        },
    }
}

export type RuleCard = ReturnType<typeof createRuleCard>
