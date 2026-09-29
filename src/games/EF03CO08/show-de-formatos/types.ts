export type LevelNumber = 1 | 2 | 3

export type ThemeId = 'school' | 'home' | 'neighborhood'
export type LayerId = 'image' | 'text' | 'sound'
export type SoundId = 'bells' | 'shaker' | 'drum' | 'claps'

export interface ImageChoice {
    id: string
    frame: number
}

export interface TextChoice {
    id: string
    line: string
}

export interface SoundChoice {
    id: string
    sound: SoundId
}

export interface ScenePlan {
    id: string
    title: string
    images: [ImageChoice, ImageChoice]
    texts: [TextChoice, TextChoice]
    sounds: [SoundChoice, SoundChoice]
}

export interface LevelDef {
    level: LevelNumber
    label: string
    theme?: ThemeId
    choose?: boolean
}

export interface ClipScene {
    sceneId: string
    imageId?: string
    textId?: string
    soundId?: string
}

export interface Picked {
    frame: number
    line: string
    sound: SoundId
}

export type Mode = 'intro' | 'choosing' | 'busy' | 'ready' | 'showing' | 'clip' | 'asking' | 'done'
