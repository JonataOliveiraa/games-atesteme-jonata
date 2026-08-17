import { C } from './theme'
import type { FileDef, FileId, StorageDef, StorageId, StorageKind } from '../types'

export const STORAGES: Record<StorageId, StorageDef> = {
    disco: {
        id: 'disco',
        label: 'Disco Local',
        kind: 'local',
        icon: 'dest-disco',
        slots: 6,
        needsInternet: false,
        funcao: 'Fica dentro do computador, para sempre.',
        vantagem: 'Rápido e funciona sem internet.',
        limite: 'Só dá para abrir neste computador.',
    },
    pendrive: {
        id: 'pendrive',
        label: 'Pen Drive',
        kind: 'remoto',
        icon: 'dest-pendrive',
        slots: 3,
        needsInternet: false,
        funcao: 'Você desconecta e leva no bolso.',
        vantagem: 'Leva o arquivo para outro computador sem internet.',
        limite: 'Cabe pouco e pode ser perdido.',
    },
    nuvem: {
        id: 'nuvem',
        label: 'Nuvem',
        kind: 'remoto',
        icon: 'dest-nuvem',
        slots: 8,
        needsInternet: true,
        funcao: 'Fica num computador da internet, longe de você.',
        vantagem: 'Abre de qualquer aparelho, em qualquer lugar.',
        limite: 'Sem internet, você não alcança.',
    },
}

export const KIND_LABEL: Record<StorageKind, string> = {
    local: 'LOCAL',
    remoto: 'REMOTO',
}

export const KIND_COLOR: Record<StorageKind, number> = {
    local: C.creme,
    remoto: C.ouro,
}

export const KIND_TEXT: Record<StorageKind, number> = {
    local: C.preto,
    remoto: C.preto,
}

export const KIND_ICON: Record<StorageKind, string> = {
    local: 'selo-local',
    remoto: 'selo-remoto',
}

export const FILES: Record<FileId, FileDef> = {
    'dever-casa': {
        id: 'dever-casa', label: 'Dever de casa', icon: 'arq-texto', size: 1,
        descricao: 'Um texto pequeno que você escreve todo dia.',
    },
    boletim: {
        id: 'boletim', label: 'Boletim', icon: 'arq-boletim', size: 1,
        descricao: 'Documento importante: não pode ser perdido.',
    },
    'foto-turma': {
        id: 'foto-turma', label: 'Foto da turma', icon: 'arq-foto', size: 1,
        descricao: 'Uma foto que a turma toda quer ver.',
    },
    'video-festa': {
        id: 'video-festa', label: 'Vídeo da festa', icon: 'arq-video', size: 3,
        descricao: 'Vídeo grande, ocupa muito espaço.',
    },
    desenho: {
        id: 'desenho', label: 'Desenho', icon: 'arq-desenho', size: 1,
        descricao: 'Um desenho feito no computador da sala.',
    },
    musica: {
        id: 'musica', label: 'Música', icon: 'arq-musica', size: 2,
        descricao: 'Áudio que você quer ouvir no celular.',
    },
    apresentacao: {
        id: 'apresentacao', label: 'Apresentação', icon: 'arq-apresentacao', size: 2,
        descricao: 'Slides para mostrar na frente da turma.',
    },
    jogo: {
        id: 'jogo', label: 'Jogo', icon: 'arq-jogo', size: 3,
        descricao: 'Programa que só roda instalado no computador.',
    },
    diario: {
        id: 'diario', label: 'Diário secreto', icon: 'arq-texto', size: 1,
        descricao: 'Ninguém mais pode ler isso.',
    },
    'trabalho-ciencias': {
        id: 'trabalho-ciencias', label: 'Trabalho de ciências', icon: 'arq-apresentacao', size: 2,
        descricao: 'Trabalho em grupo, feito por quatro pessoas.',
    },
}

export const isRemote = (id: StorageId) => STORAGES[id].kind === 'remoto'