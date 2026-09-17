import Phaser from 'phaser'
import { PEOPLE } from '../data/elenco'
import { C } from '../data/theme'
import type { PersonId } from '../types'

export type Mood = 'calmo' | 'contente' | 'encolhido'

const SHEET_KEY = 'ge-people'
const COLUMN: Record<PersonId, number> = { teo: 0, bia: 1, rafa: 2, duda: 3, estranho: 3 }
const ROW: Record<Mood, number> = { calmo: 0, contente: 1, encolhido: 2 }

/**
 * A pessoa, em três estados. Enquanto a folha não chega ela é desenhada — e o
 * que muda entre os estados é a SILHUETA, porque no cartão do achado o retrato
 * tem 27 px reais no celular.
 */
export function createPerson(scene: Phaser.Scene, who: PersonId, height: number) {
    const root = scene.add.container(0, 0)
    const body = scene.add.graphics()
    root.add(body)

    // o de outra turma é sempre desenhado, de costas e sem rosto: é justamente
    // alguém que a turma não conhece
    const sprite = who !== 'estranho' && scene.textures.exists(SHEET_KEY)
        ? scene.add.sprite(0, 0, SHEET_KEY, COLUMN[who] + ROW.calmo * 4)
        : null
    if (sprite) {
        sprite.setDisplaySize(height * 0.9, height)
        root.add(sprite)
    }

    const skin = PEOPLE[who].skin
    const shirt = PEOPLE[who].color
    const faceless = who === 'estranho'

    const paint = (mood: Mood) => {
        body.clear()
        if (sprite) return

        const shrink = mood === 'encolhido' ? 0.86 : 1
        const h = height * shrink
        const headR = h * 0.26
        const headY = -h / 2 + headR
        const bodyTop = headY + headR * 0.72
        const bodyW = h * 0.66 * shrink
        const bodyH = h / 2 - bodyTop + h * 0.2

        body.fillStyle(shirt, 1)
        body.fillRoundedRect(-bodyW / 2, bodyTop, bodyW, bodyH, bodyW * 0.28)
        body.lineStyle(4, C.ink, 1)
        body.strokeRoundedRect(-bodyW / 2, bodyTop, bodyW, bodyH, bodyW * 0.28)

        if (mood === 'contente') {
            body.lineStyle(9, skin, 1)
            body.lineBetween(bodyW * 0.42, bodyTop + bodyH * 0.2, bodyW * 0.72, headY - headR * 0.4)
        }

        body.fillStyle(skin, 1)
        body.fillCircle(0, headY, headR)
        body.lineStyle(4, C.ink, 1)
        body.strokeCircle(0, headY, headR)

        body.fillStyle(C.ink, 1)
        body.beginPath()
        body.arc(0, headY, headR, Phaser.Math.DegToRad(190), Phaser.Math.DegToRad(350))
        body.fillPath()

        if (faceless) return

        const eyeY = headY + headR * 0.08
        const eyeX = headR * 0.38
        if (mood === 'encolhido') {
            body.lineStyle(4, C.ink, 1)
            body.beginPath()
            body.arc(-eyeX, eyeY, headR * 0.2, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340))
            body.strokePath()
            body.beginPath()
            body.arc(eyeX, eyeY, headR * 0.2, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(340))
            body.strokePath()
        } else {
            body.fillStyle(C.ink, 1)
            body.fillCircle(-eyeX, eyeY, headR * 0.13)
            body.fillCircle(eyeX, eyeY, headR * 0.13)
        }

        const mouthY = headY + headR * 0.45
        body.lineStyle(4, C.ink, 1)
        body.beginPath()
        if (mood === 'contente') {
            body.arc(0, mouthY - headR * 0.1, headR * 0.42, Phaser.Math.DegToRad(20), Phaser.Math.DegToRad(160))
        } else {
            body.arc(0, mouthY - headR * 0.1, headR * 0.3, Phaser.Math.DegToRad(30), Phaser.Math.DegToRad(150))
        }
        body.strokePath()

        if (mood === 'encolhido') {
            body.fillStyle(skin, 1)
            body.fillCircle(-headR * 0.55, mouthY + headR * 0.1, headR * 0.44)
            body.fillCircle(headR * 0.55, mouthY + headR * 0.1, headR * 0.44)
            body.lineStyle(4, C.ink, 1)
            body.strokeCircle(-headR * 0.55, mouthY + headR * 0.1, headR * 0.44)
            body.strokeCircle(headR * 0.55, mouthY + headR * 0.1, headR * 0.44)
        }
    }

    paint('calmo')

    return {
        container: root,

        setMood(mood: Mood) {
            if (sprite) {
                sprite.setFrame(COLUMN[who] + ROW[mood] * 4)
                return
            }
            paint(mood)
        },

        destroy() {
            root.destroy(true)
        },
    }
}

export type Person = ReturnType<typeof createPerson>
export const PEOPLE_TEXTURE = SHEET_KEY
