import type { Mission } from '../types'

export const MISSIONS_L1: Mission[] = [
  {
    id: 'm1-1',
    text: 'A Lua quer guardar uma foto especial da aula!',
    steps: [
      { appId: 'camera', actionKey: 'take-photo', hint: 'Abra a Câmera e tire uma foto' },
    ],
  },
  {
    id: 'm1-2',
    text: 'Quantas estrelas são 2 + 3? Use a calculadora!',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Use a Calculadora e pressione =' },
    ],
  },
]

export const MISSIONS_L2: Mission[] = [
  {
    id: 'm2-1',
    text: 'A Lua quer mandar uma mensagem de voz para a amiga!',
    steps: [
      { appId: 'gravador', actionKey: 'save-recording', hint: 'Grave e salve sua mensagem' },
    ],
  },
  {
    id: 'm2-2',
    text: 'Desenhe algo colorido para a Lua ver!',
    steps: [
      { appId: 'desenho', actionKey: 'confirm-drawing', hint: 'Desenhe e pressione Pronto!' },
    ],
  },
  {
    id: 'm2-3',
    text: 'Tire uma foto da sala e descubra: 4 + 2 = ?',
    steps: [
      { appId: 'camera',      actionKey: 'take-photo', hint: 'Tire uma foto com a Câmera' },
      { appId: 'calculadora', actionKey: 'calculate',  hint: 'Agora calcule 4 + 2 na Calculadora' },
    ],
  },
]

export const MISSIONS_L3: Mission[] = [
  {
    id: 'm3-1',
    text: 'Grave sua voz, tire uma foto e acesse a biblioteca!',
    steps: [
      { appId: 'gravador',  actionKey: 'save-recording', hint: 'Grave uma mensagem' },
      { appId: 'camera',    actionKey: 'take-photo',     hint: 'Agora tire uma foto' },
      { appId: 'navegador', actionKey: 'navigate',       hint: 'Acesse a Biblioteca Digital' },
    ],
  },
  {
    id: 'm3-2',
    text: 'Ouça a música favorita da Lua e depois desenhe o que imaginou!',
    steps: [
      { appId: 'player',  actionKey: 'play-music',        hint: 'Toque a música no Player' },
      { appId: 'desenho', actionKey: 'confirm-drawing',   hint: 'Desenhe o que imaginou' },
    ],
  },
  {
    id: 'm3-3',
    text: 'Grave seu nome, calcule 5 + 3 e tire uma foto do resultado!',
    steps: [
      { appId: 'gravador',    actionKey: 'save-recording', hint: 'Grave seu nome' },
      { appId: 'calculadora', actionKey: 'calculate',      hint: 'Calcule 5 + 3 na Calculadora' },
      { appId: 'camera',      actionKey: 'take-photo',     hint: 'Tire uma foto do resultado' },
    ],
  },
]
