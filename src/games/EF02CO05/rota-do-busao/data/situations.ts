import type { RiderId, Situation, SituationId } from '../types'

export const SITUATIONS: Record<SituationId, Situation> = {
    time: { id: 'time', text: 'Que horas são?', owner: 'clock', place: 'home' },
    iceCream: { id: 'iceCream', text: 'O sorvete vai derreter!', owner: 'fridge', place: 'home' },
    music: { id: 'music', text: 'Quero ouvir música!', owner: 'speaker', place: 'home' },
    grandma: { id: 'grandma', text: 'Quero falar com a vovó!', owner: 'phone', place: 'home' },
    cartoon: { id: 'cartoon', text: 'Quero ver desenho!', owner: 'tv', place: 'home' },
    soup: { id: 'soup', text: 'A sopa está fria!', owner: 'microwave', place: 'home' },
    rollCall: { id: 'rollCall', text: 'Hora da chamada!', owner: 'computer', place: 'school' },
    story: { id: 'story', text: 'A história na parede!', owner: 'projector', place: 'school' },
    photo: { id: 'photo', text: 'Vamos tirar uma foto!', owner: 'camera', place: 'school' },
    fare: { id: 'fare', text: 'Pagar a passagem!', owner: 'cardMachine', place: 'town' },
    fruit: { id: 'fruit', text: 'Quanto pesam as frutas?', owner: 'scale', place: 'town' },
    cross: { id: 'cross', text: 'Posso atravessar?', owner: 'trafficLight', place: 'town' },
    notebook: { id: 'notebook', text: 'Escrever no caderno!', owner: 'pencil', place: 'school' },
    garden: { id: 'garden', text: 'A flor está murcha!', owner: 'wateringCan', place: 'town' },
}

export const SOLVES: Record<SituationId, RiderId[]> = {
    time: ['clock', 'phone', 'microwave', 'computer'],
    iceCream: ['fridge'],
    music: ['speaker', 'phone', 'tv', 'computer'],
    grandma: ['phone', 'computer'],
    cartoon: ['tv', 'phone', 'computer', 'projector'],
    soup: ['microwave'],
    rollCall: ['computer', 'phone'],
    story: ['projector'],
    photo: ['camera', 'phone'],
    fare: ['cardMachine', 'phone'],
    fruit: ['scale'],
    cross: ['trafficLight'],
    notebook: ['pencil'],
    garden: ['wateringCan'],
}

export const isRight = (situation: SituationId, rider: RiderId) => SITUATIONS[situation].owner === rider
