import { SCENE_BOX } from './art'
import { THEME_SCENES } from './levels'
import type { ClipScene, LayerId, Picked, ScenePlan, SoundId } from '../types'

export const LAYER_ORDER: LayerId[] = ['image', 'text', 'sound']

export const LAYER_NAME: Record<LayerId, string> = {
    image: 'IMAGEM',
    text: 'FRASE',
    sound: 'SOM',
}

export const emptyClip = (plan: ScenePlan): ClipScene => ({ sceneId: plan.id })

export const chosen = (clip: ClipScene, layer: LayerId) =>
    layer === 'image' ? clip.imageId : layer === 'text' ? clip.textId : clip.soundId

export const setChoice = (clip: ClipScene, layer: LayerId, choiceId: string): ClipScene =>
    layer === 'image'
        ? { ...clip, imageId: choiceId }
        : layer === 'text'
          ? { ...clip, textId: choiceId }
          : { ...clip, soundId: choiceId }

export const isComplete = (clip: ClipScene) => Boolean(clip.imageId && clip.textId && clip.soundId)

export const firstEmpty = (clip: ClipScene): LayerId | null =>
    LAYER_ORDER.find(layer => !chosen(clip, layer)) ?? null

export const optionIds = (plan: ScenePlan, layer: LayerId): [string, string] =>
    layer === 'image'
        ? [plan.images[0].id, plan.images[1].id]
        : layer === 'text'
          ? [plan.texts[0].id, plan.texts[1].id]
          : [plan.sounds[0].id, plan.sounds[1].id]

export const frameOf = (plan: ScenePlan, id: string | undefined) =>
    plan.images.find(choice => choice.id === id)?.frame

export const lineOf = (plan: ScenePlan, id: string | undefined) =>
    plan.texts.find(choice => choice.id === id)?.line

export const soundOf = (plan: ScenePlan, id: string | undefined) =>
    plan.sounds.find(choice => choice.id === id)?.sound

export const pickedOf = (plan: ScenePlan, clip: ClipScene): Picked | null => {
    const frame = frameOf(plan, clip.imageId)
    const line = lineOf(plan, clip.textId)
    const sound = soundOf(plan, clip.soundId)
    if (frame === undefined || line === undefined || sound === undefined) return null
    return { frame, line, sound }
}

const SOUNDS: SoundId[] = ['bells', 'shaker', 'drum', 'claps']
const MAX_LINE = 34

export const validateThemes = (sets: Record<string, ScenePlan[]> = THEME_SCENES): string[] => {
    const problems: string[] = []
    Object.entries(sets).forEach(([theme, scenes]) => {
        if (scenes.length !== 3) problems.push(`${theme}: ${scenes.length} cenas`)
        scenes.forEach(plan => {
            const where = `${theme}/${plan.id}`
            if (plan.images[0].id === plan.images[1].id) problems.push(`${where}: imagens com o mesmo id`)
            if (plan.texts[0].id === plan.texts[1].id) problems.push(`${where}: frases com o mesmo id`)
            if (plan.sounds[0].id === plan.sounds[1].id) problems.push(`${where}: sons com o mesmo id`)
            plan.images.forEach(choice => {
                if (!SCENE_BOX[choice.frame]) problems.push(`${where}: frame ${choice.frame} não existe`)
            })
            if (plan.images[0].frame === plan.images[1].frame) problems.push(`${where}: as duas imagens são o mesmo frame`)
            plan.texts.forEach(choice => {
                if (choice.line.length > MAX_LINE) problems.push(`${where}: frase com ${choice.line.length} letras`)
            })
            plan.sounds.forEach(choice => {
                if (!SOUNDS.includes(choice.sound)) problems.push(`${where}: som ${choice.sound} fora da lista`)
            })
            if (plan.sounds[0].sound === plan.sounds[1].sound) problems.push(`${where}: os dois sons são iguais`)
        })
    })
    return problems
}
