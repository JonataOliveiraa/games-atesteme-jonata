import Phaser from 'phaser'
import { C, CSS, FONT, LANGUAGE_COLOR } from '../data/theme'
import type { Message, SubjectDef } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════
 *  A MESMA COISA, DITA DE TRÊS JEITOS
 * ══════════════════════════════════════════════════════════════════════
 *
 * Uma mensagem é sempre um par: o assunto e a linguagem. Este módulo é quem
 * sabe desenhar cada linguagem — e é por isso que a plaquinha, o painel do
 * topo e o mural usam a mesma função: se as três desenhassem por conta
 * própria, a criança teria três jeitos diferentes de ver a mesma ideia, o que
 * é exatamente o contrário do que o jogo quer ensinar.
 *
 * A carta é DESENHADA. Só o assunto lá dentro é textura.
 */
export function createMessageCard(
    scene: Phaser.Scene,
    message: Message,
    size: number,
    tail = false,
) {
    const container = scene.add.container(0, 0)
    const tone = LANGUAGE_COLOR[message.language]
    const half = size / 2
    const g = scene.add.graphics()

    /*
     * O BICO. Sem ele o cartao flutua ao lado do colega, e cartao flutuando
     * nao tem dono: a crianca nao lia "este colega esta dizendo isto", que e a
     * frase inteira do jogo.
     */
    if (tail) {
        g.fillStyle(C.ink, 1)
        g.fillTriangle(-half + 6, half * 0.1, -half + 6, half * 0.72, -half - 34, half * 0.62)
    }

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-half - 5, -half - 5, size + 10, size + 10, size * 0.22)
    g.fillStyle(tone.dark, 1)
    g.fillRoundedRect(-half, -half, size, size, size * 0.18)
    g.fillStyle(tone.main, 1)
    g.fillRoundedRect(-half, -half, size, size - size * 0.07, size * 0.18)
    g.fillStyle(C.white, 0.9)
    g.fillRoundedRect(-half + size * 0.08, -half + size * 0.08, size * 0.84, size * 0.72, size * 0.12)
    if (tail) {
        g.fillStyle(tone.main, 1)
        g.fillTriangle(-half + 4, half * 0.16, -half + 4, half * 0.64, -half - 25, half * 0.58)
    }
    container.add(g)

    const inner = size * 0.62

    if (message.language === 'palavra') {
        const word = scene.add.text(0, -size * 0.03, message.subject.word, {
            fontFamily: FONT.black,
            fontSize: `${Math.round(size * 0.2)}px`,
            color: CSS.ink,
            align: 'center',
        }).setOrigin(0.5).setResolution(2)
        // a palavra encolhe até caber: nome comprido vazando da carta é o que
        // mais faz a tela parecer solta
        for (let px = Math.round(size * 0.2); px > 9; px -= 1) {
            word.setFontSize(`${px}px`)
            if (word.width <= size * 0.76) break
        }
        container.add(word)
    } else if (!scene.textures.exists(message.subject.texture)) {
        // sem a arte do assunto, entra o nome escrito: a fase continua
        // jogável e o build não cai por causa de um arquivo que falta
        const fallback = scene.add.text(0, -size * 0.03, message.subject.word, {
            fontFamily: FONT.black,
            fontSize: `${Math.round(size * 0.15)}px`,
            color: CSS.inkSoft,
            align: 'center',
        }).setOrigin(0.5).setResolution(2)
        container.add(fallback)
    } else {
        const art = scene.add.image(0, -size * 0.04, message.subject.texture)
        const scale = message.language === 'fala' ? inner * 0.72 : inner
        art.setDisplaySize(scale, scale)
        if (message.language === 'fala') {
            const bubble = scene.add.graphics()
            const r = inner * 0.56
            bubble.fillStyle(C.ink, 1)
            bubble.fillCircle(0, -size * 0.04, r + 5)
            bubble.fillStyle(C.white, 1)
            bubble.fillCircle(0, -size * 0.04, r)
            bubble.fillStyle(C.ink, 1)
            bubble.fillTriangle(
                -r * 0.5, -size * 0.04 + r * 0.7,
                r * 0.1, -size * 0.04 + r * 0.75,
                -r * 0.35, -size * 0.04 + r * 1.5,
            )
            // ondinhas de som: é o que diz "alguém está FALANDO isso"
            for (let i = 1; i <= 3; i++) {
                bubble.lineStyle(4, tone.dark, 0.9 - i * 0.18)
                bubble.beginPath()
                bubble.arc(r + size * 0.06, -size * 0.06, r * 0.32 * i, -0.9, 0.9)
                bubble.strokePath()
            }
            container.add(bubble)
        }
        container.add(art)
    }

    return container
}

/**
 * O RECADO do topo: o desenho e a frase, sem cor de linguagem nenhuma. Ele
 * responde "o que eu tenho que mandar", e por isso mostra o SIGNIFICADO — a
 * criança que ainda não lê precisa ver a coisa, não a palavra.
 */
export function createMeaningCard(scene: Phaser.Scene, subject: SubjectDef, size: number) {
    const container = scene.add.container(0, 0)
    const half = size / 2
    const g = scene.add.graphics()

    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-half - 5, -half - 5, size + 10, size + 10, size * 0.2)
    g.fillStyle(C.creamEdge, 1)
    g.fillRoundedRect(-half, -half, size, size, size * 0.16)
    g.fillStyle(C.white, 1)
    g.fillRoundedRect(-half, -half, size, size - size * 0.06, size * 0.16)
    container.add(g)

    if (scene.textures.exists(subject.texture)) {
        const art = scene.add.image(0, 0, subject.texture)
        art.setDisplaySize(size * 0.76, size * 0.76)
        container.add(art)
    } else {
        const word = scene.add.text(0, 0, subject.word, {
            fontFamily: FONT.black,
            fontSize: `${Math.round(size * 0.18)}px`,
            color: CSS.ink,
        }).setOrigin(0.5).setResolution(2)
        container.add(word)
    }

    return container
}

/** O cartão de reserva, para antes de a arte existir. */
export function createSubjectCard(scene: Phaser.Scene, label: string, size: number) {
    const container = scene.add.container(0, 0)
    const half = size / 2
    const g = scene.add.graphics()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-half - 4, -half - 4, size + 8, size + 8, 22)
    g.fillStyle(C.cream, 1)
    g.fillRoundedRect(-half, -half, size, size, 18)
    const text = scene.add.text(0, 0, label, {
        fontFamily: FONT.black,
        fontSize: `${Math.round(size * 0.15)}px`,
        color: CSS.ink,
        align: 'center',
        wordWrap: { width: size * 0.82 },
    }).setOrigin(0.5).setResolution(2)
    container.add([g, text])
    return container
}
