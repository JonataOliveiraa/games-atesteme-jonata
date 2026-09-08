import type { Situation, SituationId, Tech, TechId } from '../types'

export const TECH: Record<TechId, Tech> = {
    relogio: { id: 'relogio', label: 'relógio', frame: 0, use: 'O relógio mostra as horas.' },
    geladeira: { id: 'geladeira', label: 'geladeira', frame: 1, use: 'A geladeira deixa a comida gelada.' },
    caixinha: { id: 'caixinha', label: 'caixinha de som', frame: 2, use: 'A caixinha de som toca música.' },
    televisao: { id: 'televisao', label: 'televisão', frame: 3, use: 'A televisão passa desenhos e programas.' },
    microondas: { id: 'microondas', label: 'micro-ondas', frame: 4, use: 'O micro-ondas esquenta a comida.' },
    'maquina-de-lavar': { id: 'maquina-de-lavar', label: 'máquina de lavar', frame: 5, use: 'A máquina de lavar lava a roupa.' },
    telefone: { id: 'telefone', label: 'telefone', frame: 6, use: 'O telefone serve para falar com quem está longe.' },
    camera: { id: 'camera', label: 'câmera', frame: 7, use: 'A câmera guarda as fotos.' },
    computador: { id: 'computador', label: 'computador', frame: 8, use: 'O computador procura e mostra o que a gente quer saber.' },
    liquidificador: { id: 'liquidificador', label: 'liquidificador', frame: 9, use: 'O liquidificador serve para bater frutas.' },
    ventilador: { id: 'ventilador', label: 'ventilador', frame: 10, use: 'O ventilador serve para refrescar.' },
    vassoura: { id: 'vassoura', label: 'vassoura', frame: 11, use: 'A vassoura serve para varrer o chão.' },
}

const USES: Record<TechId, SituationId[]> = {
    relogio: ['horas', 'recreio'],
    geladeira: ['gelar', 'merenda', 'gelo'],
    caixinha: ['musica', 'festa'],
    televisao: ['desenho', 'jornal'],
    microondas: ['leite', 'marmita', 'pipoca'],
    'maquina-de-lavar': ['roupa', 'uniforme', 'lencol'],
    telefone: ['vo', 'aviso', 'recado'],
    camera: ['foto', 'mural', 'aniversario'],
    computador: ['bolo', 'chamada', 'planetas'],
    liquidificador: ['suco'],
    ventilador: ['calor'],
    vassoura: ['folhas'],
}

export const solves = (tech: TechId, situation: SituationId) =>
    USES[tech].includes(situation)

export const SITUATIONS: Record<SituationId, Situation> = {
    horas: { id: 'horas', prompt: 'Que horas são?', options: ['relogio', 'liquidificador'] },
    gelar: { id: 'gelar', prompt: 'Guardar a comida gelada', options: ['geladeira', 'ventilador'] },
    musica: { id: 'musica', prompt: 'Ouvir uma música', options: ['caixinha', 'vassoura'] },
    desenho: { id: 'desenho', prompt: 'Assistir ao desenho', options: ['televisao', 'ventilador'] },
    leite: { id: 'leite', prompt: 'Esquentar o leite', options: ['microondas', 'vassoura'] },
    roupa: { id: 'roupa', prompt: 'Lavar a roupa suja', options: ['maquina-de-lavar', 'caixinha'] },
    vo: { id: 'vo', prompt: 'Falar com a vó que mora longe', options: ['telefone', 'geladeira'] },
    foto: { id: 'foto', prompt: 'Guardar a foto do passeio', options: ['camera', 'ventilador'] },
    bolo: { id: 'bolo', prompt: 'Descobrir como se faz o bolo', options: ['computador', 'liquidificador'] },

    recreio: { id: 'recreio', prompt: 'Saber a hora do recreio', options: ['relogio', 'computador'] },
    merenda: { id: 'merenda', prompt: 'Guardar a merenda gelada', options: ['geladeira', 'microondas'] },
    marmita: { id: 'marmita', prompt: 'Esquentar a marmita', options: ['microondas', 'geladeira'] },
    chamada: { id: 'chamada', prompt: 'Fazer a chamada da turma', options: ['computador', 'televisao'] },
    festa: { id: 'festa', prompt: 'Tocar a música da festa', options: ['caixinha', 'televisao'] },
    aviso: { id: 'aviso', prompt: 'Avisar em casa que a aula acabou', options: ['telefone', 'computador'] },
    planetas: { id: 'planetas', prompt: 'Pesquisar sobre os planetas', options: ['computador', 'caixinha'] },
    mural: { id: 'mural', prompt: 'Guardar a foto do mural', options: ['camera', 'televisao'] },
    uniforme: { id: 'uniforme', prompt: 'Lavar o uniforme sujo', options: ['maquina-de-lavar', 'geladeira'] },

    suco: { id: 'suco', prompt: 'Bater o suco de morango', options: ['liquidificador', 'microondas'] },
    calor: { id: 'calor', prompt: 'Refrescar o quarto no calor', options: ['ventilador', 'geladeira'] },
    folhas: { id: 'folhas', prompt: 'Varrer as folhas da sala', options: ['vassoura', 'maquina-de-lavar'] },
    gelo: { id: 'gelo', prompt: 'Fazer gelo para a festa', options: ['geladeira', 'liquidificador'] },
    pipoca: { id: 'pipoca', prompt: 'Esquentar a pipoca', options: ['microondas', 'liquidificador'] },
    aniversario: { id: 'aniversario', prompt: 'Guardar a foto do aniversário', options: ['camera', 'televisao'] },
    jornal: { id: 'jornal', prompt: 'Ver o jornal da noite', options: ['televisao', 'computador'] },
    recado: { id: 'recado', prompt: 'Mandar um recado para o vovô', options: ['telefone', 'camera'] },
    lencol: { id: 'lencol', prompt: 'Lavar o lençol da cama', options: ['maquina-de-lavar', 'vassoura'] },
}
