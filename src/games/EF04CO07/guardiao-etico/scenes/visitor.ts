import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BALLOON, DEPTH, PLATE, VISITOR } from '../data/layout'
import { DESTINATIONS, PEOPLE } from '../data/elenco'
import { C, CSS, FONT } from '../data/theme'
import { createPerson } from './people'
import type { DestinationId, PersonId } from '../types'

/**
 * A coluna da direita: para onde o papel vai, quem trouxe, e o que ele diz.
 * O balão fica sempre no mesmo canto — texto que anda pela tela é texto que a
 * criança perde.
 */
export function createVisitor(scene: Phaser.Scene, destination: DestinationId) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.visitor)

    const plate = scene.add.graphics()
    plate.fillStyle(C.ink, 0.25)
    plate.fillRoundedRect(PLATE.x + 5, PLATE.y + 8, PLATE.w, PLATE.h, 16)
    plate.fillStyle(C.cork, 1)
    plate.fillRoundedRect(PLATE.x, PLATE.y, PLATE.w, PLATE.h, 16)
    plate.lineStyle(7, C.wood, 1)
    plate.strokeRoundedRect(PLATE.x, PLATE.y, PLATE.w, PLATE.h, 16)
    plate.fillStyle(C.white, 0.18)
    plate.fillRoundedRect(PLATE.x + 12, PLATE.y + 10, PLATE.w - 24, 16, 8)
    root.add(plate)

    const where = DESTINATIONS[destination]

    const plateTitle = scene.add
        .text(PLATE.x + PLATE.w / 2, PLATE.y + 52, where.title, {
            fontFamily: FONT.black,
            fontSize: '28px',
            color: CSS.white,
            align: 'center',
            wordWrap: { width: PLATE.w - 40 },
        })
        .setOrigin(0.5)
        .setResolution(2)
    plateTitle.setStroke(CSS.ink, 6)
    root.add(plateTitle)

    const plateWho = scene.add
        .text(PLATE.x + PLATE.w / 2, PLATE.y + 100, where.who, {
            fontFamily: FONT.body,
            fontSize: '20px',
            color: CSS.ink,
            align: 'center',
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(plateWho)

    const bubble = scene.add.graphics()
    root.add(bubble)

    const speech = scene.add
        .text(BALLOON.x + 22, BALLOON.y + BALLOON.h / 2, '', {
            fontFamily: FONT.body,
            fontSize: '24px',
            color: CSS.ink,
            wordWrap: { width: BALLOON.w - 44 },
            lineSpacing: 2,
            align: 'left',
        })
        .setOrigin(0, 0.5)
        .setResolution(2)
    root.add(speech)

    const paintBubble = (accent: number) => {
        bubble.clear()
        bubble.fillStyle(C.ink, 0.22)
        bubble.fillRoundedRect(BALLOON.x + 4, BALLOON.y + 7, BALLOON.w, BALLOON.h, 16)
        bubble.fillStyle(C.white, 1)
        bubble.fillRoundedRect(BALLOON.x, BALLOON.y, BALLOON.w, BALLOON.h, 16)
        bubble.lineStyle(5, accent, 1)
        bubble.strokeRoundedRect(BALLOON.x, BALLOON.y, BALLOON.w, BALLOON.h, 16)
        bubble.fillStyle(C.white, 1)
        bubble.fillTriangle(
            VISITOR.cx - 18, BALLOON.y + BALLOON.h - 2,
            VISITOR.cx + 22, BALLOON.y + BALLOON.h - 2,
            VISITOR.cx - 6, BALLOON.y + BALLOON.h + 26,
        )
        bubble.lineStyle(5, accent, 1)
        bubble.lineBetween(
            VISITOR.cx - 18, BALLOON.y + BALLOON.h - 2,
            VISITOR.cx - 6, BALLOON.y + BALLOON.h + 26,
        )
        bubble.lineBetween(
            VISITOR.cx - 6, BALLOON.y + BALLOON.h + 26,
            VISITOR.cx + 22, BALLOON.y + BALLOON.h - 2,
        )
    }
    paintBubble(C.blue)

    let who: PersonId = 'duda'
    let person = createPerson(scene, who, VISITOR.h)
    person.container.setPosition(VISITOR.cx, VISITOR.y + VISITOR.h / 2)
    root.add(person.container)

    const name = scene.add
        .text(VISITOR.cx, VISITOR.y + VISITOR.h + 14, PEOPLE[who].name, {
            fontFamily: FONT.black,
            fontSize: '22px',
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    root.add(name)

    let typing: { skip: () => void } | null = null

    return {
        setWho(next: PersonId) {
            if (next === who) return
            who = next
            person.destroy()
            person = createPerson(scene, who, VISITOR.h)
            person.container.setPosition(VISITOR.cx, VISITOR.y + VISITOR.h / 2)
            root.add(person.container)
            name.setText(PEOPLE[who].name)
        },

        async say(text: string) {
            paintBubble(C.blue)
            typing?.skip()
            speech.setColor(CSS.ink)
            speech.setText('')
            typing = FX.type(scene, speech, text, { delay: 18 })
            await typing
        },

        async note(text: string) {
            paintBubble(C.amber)
            typing?.skip()
            speech.setColor(CSS.amberDeep)
            speech.setText('')
            typing = FX.type(scene, speech, text, { delay: 16 })
            await typing
        },

        async cheer() {
            person.setMood('contente')
            await FX.to(scene, person.container, { y: person.container.y - 18 }, { duration: 160 })
            await FX.to(scene, person.container, { y: VISITOR.y + VISITOR.h / 2 }, { duration: 220 })
        },

        async sulk() {
            person.setMood('encolhido')
            await FX.wait(scene, 240)
            person.setMood('calmo')
        },

        point() {
            return { x: VISITOR.cx, y: VISITOR.y + VISITOR.h / 2 }
        },

        destroy() {
            typing?.skip()
            FX.kill(scene, root)
            person.destroy()
            root.destroy(true)
        },
    }
}

export type Visitor = ReturnType<typeof createVisitor>
