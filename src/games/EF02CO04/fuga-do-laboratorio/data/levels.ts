import type { LevelDef } from '../types'

/**
 * Um nível é um laboratório: três montagens, três vãos na prateleira.
 *
 * A prateleira de cima é o progresso — não existe barra, bolinha nem
 * porcentagem. Cada máquina que funciona sobe para lá e fica morando, viva,
 * até o fim da partida. É a lição repetida sem uma palavra: aquilo só está
 * ligado porque tem PEÇA e tem PROGRAMA.
 *
 * NOTA DE CONSTRUÇÃO: só o nível 1 existe, por decisão de validar um nível
 * antes de expandir. O motor não sabe quantas montagens tem um nível.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Laboratório',
        teach: true,
        builds: [
            {
                id: '1.1',
                goal: 'music',
                hardwareId: 'caixinha',
                softwareId: 'app-musica',
                shelf: ['mouse', 'caixinha', 'app-musica', 'app-desenho'],
            },
            {
                id: '1.2',
                goal: 'photo',
                hardwareId: 'camera',
                softwareId: 'app-fotos',
                shelf: ['camera', 'teclado', 'app-musica', 'app-fotos'],
            },
            {
                id: '1.3',
                goal: 'dance',
                hardwareId: 'robo',
                softwareId: 'dancinha',
                shelf: ['impressora', 'robo', 'dancinha', 'app-escrever'],
            },
        ],
    },
]

export const buildsInLevel = (level: LevelDef) => level.builds.length
