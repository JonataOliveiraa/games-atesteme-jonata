import type { LevelDef, ScenePlan, ThemeId } from '../types'

const SCHOOL: ScenePlan[] = [
    {
        id: 'chegada',
        title: 'A chegada',
        images: [
            { id: 'portao', frame: 0 },
            { id: 'sala', frame: 1 },
        ],
        texts: [
            { id: 'cheguei', line: 'Cheguei na escola!' },
            { id: 'novo-dia', line: 'Um novo dia começou!' },
        ],
        sounds: [
            { id: 'sininhos', sound: 'bells' },
            { id: 'palmas', sound: 'claps' },
        ],
    },
    {
        id: 'recreio',
        title: 'O recreio',
        images: [
            { id: 'amarelinha', frame: 2 },
            { id: 'quadra', frame: 3 },
        ],
        texts: [
            { id: 'brincar', line: 'Hora de brincar!' },
            { id: 'meu-recreio', line: 'Gosto do meu recreio!' },
        ],
        sounds: [
            { id: 'tambor', sound: 'drum' },
            { id: 'palmas', sound: 'claps' },
        ],
    },
    {
        id: 'leitura',
        title: 'A leitura',
        images: [
            { id: 'livro', frame: 4 },
            { id: 'estante', frame: 5 },
        ],
        texts: [
            { id: 'historias', line: 'Eu gosto de histórias!' },
            { id: 'ler-juntos', line: 'Vamos ler juntos!' },
        ],
        sounds: [
            { id: 'chocalho', sound: 'shaker' },
            { id: 'sininhos', sound: 'bells' },
        ],
    },
]

const HOME: ScenePlan[] = [
    {
        id: 'manha',
        title: 'A manhã',
        images: [
            { id: 'janela-sol', frame: 6 },
            { id: 'mesa-cafe', frame: 7 },
        ],
        texts: [
            { id: 'bom-dia', line: 'Bom dia!' },
            { id: 'meu-dia', line: 'Meu dia começou!' },
        ],
        sounds: [
            { id: 'sininhos', sound: 'bells' },
            { id: 'chocalho', sound: 'shaker' },
        ],
    },
    {
        id: 'brincadeira',
        title: 'A brincadeira',
        images: [
            { id: 'blocos', frame: 8 },
            { id: 'quintal', frame: 9 },
        ],
        texts: [
            { id: 'gosto-brincar', line: 'Gosto de brincar!' },
            { id: 'inventei', line: 'Inventei uma brincadeira!' },
        ],
        sounds: [
            { id: 'tambor', sound: 'drum' },
            { id: 'palmas', sound: 'claps' },
        ],
    },
    {
        id: 'noite',
        title: 'A noite',
        images: [
            { id: 'janela-lua', frame: 10 },
            { id: 'cama-livro', frame: 11 },
        ],
        texts: [
            { id: 'boa-noite', line: 'Boa noite!' },
            { id: 'descansar', line: 'Hora de descansar.' },
        ],
        sounds: [
            { id: 'sininhos', sound: 'bells' },
            { id: 'chocalho', sound: 'shaker' },
        ],
    },
]

const NEIGHBORHOOD: ScenePlan[] = [
    {
        id: 'minha-rua',
        title: 'A minha rua',
        images: [
            { id: 'casas', frame: 12 },
            { id: 'ciclovia', frame: 13 },
        ],
        texts: [
            { id: 'minha-rua', line: 'Esta é a minha rua!' },
            { id: 'passeio', line: 'Aqui começa meu passeio!' },
        ],
        sounds: [
            { id: 'chocalho', sound: 'shaker' },
            { id: 'tambor', sound: 'drum' },
        ],
    },
    {
        id: 'praca',
        title: 'A praça',
        images: [
            { id: 'arvores', frame: 14 },
            { id: 'brinquedos', frame: 15 },
        ],
        texts: [
            { id: 'gosto-praca', line: 'Gosto da praça!' },
            { id: 'amigos', line: 'Aqui encontro amigos!' },
        ],
        sounds: [
            { id: 'palmas', sound: 'claps' },
            { id: 'sininhos', sound: 'bells' },
        ],
    },
    {
        id: 'feira',
        title: 'A feira',
        images: [
            { id: 'barracas', frame: 16 },
            { id: 'frutas', frame: 17 },
        ],
        texts: [
            { id: 'muitas-cores', line: 'O bairro tem muitas cores!' },
            { id: 'quanta-coisa', line: 'Olha quanta coisa!' },
        ],
        sounds: [
            { id: 'tambor', sound: 'drum' },
            { id: 'chocalho', sound: 'shaker' },
        ],
    },
]

export const THEME_SCENES: Record<ThemeId, ScenePlan[]> = {
    school: SCHOOL,
    home: HOME,
    neighborhood: NEIGHBORHOOD,
}

export const THEME_LABEL: Record<ThemeId, string> = {
    school: 'MINHA ESCOLA',
    home: 'MINHA CASA',
    neighborhood: 'MEU BAIRRO',
}

export const THEME_COVER: Record<ThemeId, number> = {
    school: 0,
    home: 6,
    neighborhood: 12,
}

export const THEME_ORDER: ThemeId[] = ['school', 'home', 'neighborhood']

export const LEVELS: LevelDef[] = [
    { level: 1, label: 'MINHA ESCOLA', theme: 'school' },
    { level: 2, label: 'MEU DIA EM CASA', theme: 'home' },
    { level: 3, label: 'EU ESCOLHO O TEMA', choose: true },
]

export const scenesOf = (level: LevelDef, chosen?: ThemeId) =>
    THEME_SCENES[level.theme ?? chosen ?? 'neighborhood']

export const SCENES_PER_LEVEL = SCHOOL.length
export const LAYERS_PER_SCENE = 3
export const POINTS_PER_LAYER = 10
