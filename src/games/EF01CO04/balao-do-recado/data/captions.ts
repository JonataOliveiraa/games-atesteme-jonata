import type { FailId, SceneId } from '../types'

export const CAPTION_MAX_WORDS = 5

export const ARRIVAL_CAPTION: Record<SceneId, string> = {
    'friend-near': 'Ela está pertinho!',
    'neighbor-away': 'Ela saiu de casa!',
    'neighbor-away-phone': 'Ela saiu de casa!',
    'grandma-far': 'A vovó mora longe!',
    'grandma-near': 'A vovó veio visitar!',
    'friend-far': 'Ela viajou para longe!',
    'neighbor-asleep': 'Ela está dormindo!',
}

export const FAIL_CAPTION: Record<FailId, string> = {
    'friend-fail-drop': 'As mãos estão ocupadas!',
    'friend-fail-letter': 'Não tem caixa de correio!',
    'neighbor-fail-empty': 'Ela não está em casa!',
    'neighbor-fail-phone': 'O celular ficou em casa!',
    'grandma-fail-far': 'Ela não pode ouvir!',
    'grandma-fail-letter': 'Não tem caixa de correio!',
    'grandma-near-fail-drop': 'As mãos estão ocupadas!',
    'grandma-near-fail-letter': 'Não tem caixa de correio!',
    'friend-far-fail-far': 'Ela não pode ouvir!',
    'friend-far-fail-letter': 'Não tem caixa de correio!',
    'neighbor-asleep-fail-voice': 'Ela não pode ouvir!',
    'neighbor-asleep-fail-phone': 'Ela não atende dormindo!',
}

export const wordCount = (text: string): number => text.trim().split(/\s+/).filter(Boolean).length
