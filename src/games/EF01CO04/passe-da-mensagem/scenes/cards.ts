import Phaser from 'phaser'
import { C, CSS, FONT, LANGUAGE_COLOR } from '../data/theme'
import type { ItemDef, Language } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A CARTA — o mesmo objeto, escrito de três jeitos
 * ══════════════════════════════════════════════════════════════════════
 *
 * Um módulo só desenha as três linguagens, e todo mundo usa ele: o recado do
 * topo, os quadrados da mesa, as cartas da paleta e a bancada do colega. Se
 * cada um desenhasse do seu jeito, a criança veria quatro coisas diferentes
 * onde o jogo precisa que ela veja UMA.
 *
 * O desenho de dentro tem o mesmo tamanho relativo nos três. É essa igualdade
 * que a habilidade pede que fique evidente.
 */

/** O desenho do objeto, ou o nome escrito quando a textura ainda não existe. */
function addArt(
    scene: Phaser.Scene,
    box: Phaser.GameObjects.Container,
    item: ItemDef,
    size: number,
    y: number,
) {
    if (scene.textures.exists(item.texture)) {
        const art = scene.add.image(0, y, item.texture)
        art.setDisplaySize(size, size)
        box.add(art)
        return
    }
    const label = scene.add.text(0, y, item.word, {
        fontFamily: FONT.black,
        fontSize: `${Math.round(size * 0.26)}px`,
        color: CSS.inkSoft,
        align: 'center',
    }).setOrigin(0.5).setResolution(2)
    box.add(label)
}

/** A palavra, encolhida até caber. Nome vazando da carta é o que mais suja. */
function addWord(
    scene: Phaser.Scene,
    box: Phaser.GameObjects.Container,
    word: string,
    maxWidth: number,
    startPx: number,
    y: number,
    color = CSS.ink,
) {
    const text = scene.add.text(0, y, word, {
        fontFamily: FONT.black, fontSize: `${startPx}px`, color,
    }).setOrigin(0.5).setResolution(2)
    for (let px = startPx; px > 8; px -= 1) {
        text.setFontSize(`${px}px`)
        if (text.width <= maxWidth) break
    }
    box.add(text)
    return text
}

export interface CardOptions {
    /** Carta de PALAVRA com o desenho pequeno no canto: o degrau do nível 2. */
    wordHint?: boolean
    /** Sem a moldura colorida — usado na bancada do colega, que é só o objeto. */
    bare?: boolean
}

export function createItemCard(
    scene: Phaser.Scene,
    item: ItemDef,
    language: Language,
    w: number,
    h = w,
    options: CardOptions = {},
) {
    const box = scene.add.container(0, 0)
    const tone = LANGUAGE_COLOR[language]
    const g = scene.add.graphics()
    const hw = w / 2
    const hh = h / 2
    const r = Math.min(w, h) * 0.16

    if (!options.bare) {
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-hw - 5, -hh - 5, w + 10, h + 10, r + 4)
        g.fillStyle(tone.dark, 1)
        g.fillRoundedRect(-hw, -hh, w, h, r)
        g.fillStyle(tone.main, 1)
        g.fillRoundedRect(-hw, -hh, w, h - h * 0.05, r)
        g.fillStyle(C.white, 1)
        g.fillRoundedRect(-hw + w * 0.07, -hh + h * 0.07, w - w * 0.14, h - h * 0.2, r * 0.8)
    }
    box.add(g)

    // ─────────────────────────────────────────── desenho

    if (language === 'desenho') {
        addArt(scene, box, item, Math.min(w, h) * 0.6, -h * 0.02)
        return box
    }

    // ─────────────────────────────────────────── fala

    if (language === 'fala') {
        const art = Math.min(w, h) * 0.44
        const bubbleR = art * 0.78
        const cy = -h * 0.08

        const bubble = scene.add.graphics()
        bubble.fillStyle(C.ink, 1)
        bubble.fillCircle(0, cy, bubbleR + 5)
        bubble.fillStyle(C.white, 1)
        bubble.fillCircle(0, cy, bubbleR)
        bubble.fillStyle(C.ink, 1)
        bubble.fillTriangle(
            -bubbleR * 0.5, cy + bubbleR * 0.72,
            bubbleR * 0.08, cy + bubbleR * 0.78,
            -bubbleR * 0.34, cy + bubbleR * 1.42,
        )
        bubble.fillStyle(C.white, 1)
        bubble.fillTriangle(
            -bubbleR * 0.44, cy + bubbleR * 0.66,
            bubbleR * 0.0, cy + bubbleR * 0.7,
            -bubbleR * 0.3, cy + bubbleR * 1.24,
        )
        // ondinhas de som: é o que diz "alguém está DIZENDO isto"
        for (let i = 1; i <= 3; i++) {
            bubble.lineStyle(Math.max(3, w * 0.022), tone.dark, 0.95 - i * 0.2)
            bubble.beginPath()
            bubble.arc(bubbleR + w * 0.05, cy - bubbleR * 0.2, bubbleR * 0.34 * i, -0.8, 0.8)
            bubble.strokePath()
        }
        box.add(bubble)
        addArt(scene, box, item, art, cy)
        addWord(scene, box, item.word, w * 0.76, Math.round(h * 0.13), hh - h * 0.15)
        return box
    }

    // ─────────────────────────────────────────── palavra

    if (options.wordHint) {
        addArt(scene, box, item, Math.min(w, h) * 0.3, -h * 0.16)
        addWord(scene, box, item.word, w * 0.78, Math.round(h * 0.18), h * 0.14)
    } else {
        addWord(scene, box, item.word, w * 0.78, Math.round(h * 0.22), -h * 0.02)
    }
    return box
}

/**
 * O SELO da linguagem, ao lado da mesa. Ele repete em desenho o que a etiqueta
 * escreve — para quem ainda não lê "EM PALAVRAS", o selo é a instrução.
 */
export function createLanguageSeal(scene: Phaser.Scene, language: Language, size: number) {
    const box = scene.add.container(0, 0)
    const tone = LANGUAGE_COLOR[language]
    const g = scene.add.graphics()
    const half = size / 2

    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 0, half + 5)
    g.fillStyle(tone.dark, 1)
    g.fillCircle(0, 0, half)
    g.fillStyle(tone.main, 1)
    g.fillCircle(0, -3, half - 4)

    g.fillStyle(C.white, 1)
    if (language === 'fala') {
        g.fillRoundedRect(-half * 0.52, -half * 0.5, half * 1.04, half * 0.78, half * 0.22)
        g.fillTriangle(
            -half * 0.3, half * 0.24, half * 0.04, half * 0.26, -half * 0.24, half * 0.66,
        )
        g.fillStyle(tone.dark, 1)
        for (let i = 0; i < 3; i++) g.fillCircle(-half * 0.26 + i * half * 0.26, -half * 0.12, 4)
    } else if (language === 'palavra') {
        g.fillRoundedRect(-half * 0.5, -half * 0.42, half, half * 0.2, 4)
        g.fillRoundedRect(-half * 0.5, -half * 0.08, half, half * 0.2, 4)
        g.fillRoundedRect(-half * 0.5, half * 0.26, half * 0.62, half * 0.2, 4)
    } else {
        g.lineStyle(5, C.white, 1)
        g.strokeRoundedRect(-half * 0.52, -half * 0.46, half * 1.04, half * 0.92, 8)
        g.fillTriangle(-half * 0.3, half * 0.3, half * 0.02, -half * 0.2, half * 0.34, half * 0.3)
        g.fillCircle(-half * 0.2, -half * 0.2, 5)
    }

    box.add(g)
    return box
}
