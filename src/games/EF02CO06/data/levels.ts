import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    timeLimit: 30,
    title: 'Configurações básicas',
    objective: 'Ative ou desative cada item para deixar o dispositivo seguro.',
    tip: 'Senha forte e perfil privado devem ficar ATIVADOS. O resto, desativado.',
    rounds: [
      {
        id: 'l1-r1',
        question: 'Configure para começar a jogar com segurança 🔒',
        hint: 'Ative a senha forte. Deixe o resto desativado.',
        items: [
          { itemId: 'password', initialOn: false },
          { itemId: 'location', initialOn: false },
          { itemId: 'camera',   initialOn: false },
        ],
      },
      {
        id: 'l1-r2',
        question: 'Proteja seu perfil antes de continuar 🙈',
        hint: 'Ative o perfil privado. Deixe o resto desativado.',
        items: [
          { itemId: 'privacy',   initialOn: false },
          { itemId: 'purchases', initialOn: false },
          { itemId: 'strangers', initialOn: false },
        ],
      },
      {
        id: 'l1-r3',
        question: 'Revise as duas proteções principais 🛡️',
        hint: 'Ative a senha forte e o perfil privado.',
        items: [
          { itemId: 'password', initialOn: false },
          { itemId: 'privacy',  initialOn: false },
          { itemId: 'location', initialOn: false },
        ],
      },
    ],
  },
  {
    level: 2,
    timeLimit: 35,
    title: 'Cuidado com as armadilhas',
    objective: 'Corrija as configurações que já vêm erradas.',
    tip: 'Alguns itens já começam ligados ou desligados errado. Observe com atenção!',
    rounds: [
      {
        id: 'l2-r1',
        question: 'Esse perfil veio com configurações arriscadas. Corrija! ⚠️',
        hint: 'Senha e privacidade deveriam estar ativadas; o resto, não.',
        items: [
          { itemId: 'password',  initialOn: false }, // trap: deveria estar ON
          { itemId: 'location',  initialOn: true },  // trap: deveria estar OFF
          { itemId: 'camera',    initialOn: true },   // trap
          { itemId: 'purchases', initialOn: false },
          { itemId: 'strangers', initialOn: false },
          { itemId: 'privacy',   initialOn: false },  // trap: deveria estar ON
        ],
      },
      {
        id: 'l2-r2',
        question: 'De novo! Esse app já vem com permissões demais 🚨',
        hint: 'Verifique cada item — alguns estão certos, outros não.',
        items: [
          { itemId: 'password',  initialOn: true },
          { itemId: 'location',  initialOn: false },
          { itemId: 'camera',    initialOn: true },   // trap
          { itemId: 'purchases', initialOn: true },   // trap
          { itemId: 'strangers', initialOn: true },   // trap
          { itemId: 'privacy',   initialOn: true },
        ],
      },
      {
        id: 'l2-r3',
        question: 'Última checagem antes de continuar 🔍',
        hint: 'Compras e conversa com estranhos sempre devem ficar desativados.',
        items: [
          { itemId: 'password',  initialOn: false },  // trap
          { itemId: 'location',  initialOn: true },   // trap
          { itemId: 'camera',    initialOn: false },
          { itemId: 'purchases', initialOn: true },   // trap
          { itemId: 'strangers', initialOn: false },
          { itemId: 'privacy',   initialOn: false },  // trap
        ],
      },
    ],
  },
  {
    level: 3,
    timeLimit: 40,
    title: 'Jogo online em risco',
    objective: 'Configure tudo e reaja rápido quando um novo risco aparecer.',
    tip: 'Durante a rodada, um novo aviso pode aparecer — resolva-o também antes de confirmar.',
    rounds: [
      {
        id: 'l3-r1',
        question: 'Você entrou em um jogo online. Configure tudo! 🎮',
        hint: 'Revise os 6 itens com atenção antes de confirmar.',
        items: [
          { itemId: 'password',  initialOn: false },
          { itemId: 'location',  initialOn: true },
          { itemId: 'camera',    initialOn: true },
          { itemId: 'purchases', initialOn: false },
          { itemId: 'strangers', initialOn: false },
          { itemId: 'privacy',   initialOn: false },
        ],
      },
      {
        id: 'l3-r2',
        question: 'Tudo certo... mas fique atento a novos avisos! 👀',
        hint: 'Um novo risco pode aparecer no meio da rodada.',
        items: [
          { itemId: 'password',  initialOn: true },
          { itemId: 'location',  initialOn: false },
          { itemId: 'camera',    initialOn: false },
          { itemId: 'purchases', initialOn: false },
          { itemId: 'privacy',   initialOn: true },
        ],
        delayedItem: {
          itemId: 'strangers',
          initialOn: true,
          appearAfterMs: 3500,
          alertText: '⚠️ Um desconhecido está tentando conversar com você!',
        },
      },
      {
        id: 'l3-r3',
        question: 'Última missão: feche todas as brechas de segurança 🔐',
        hint: 'Verifique os 6 itens e o aviso que pode surgir.',
        items: [
          { itemId: 'password',  initialOn: false },
          { itemId: 'location',  initialOn: true },
          { itemId: 'privacy',   initialOn: false },
          { itemId: 'purchases', initialOn: false },
          { itemId: 'strangers', initialOn: false },
        ],
        delayedItem: {
          itemId: 'camera',
          initialOn: true,
          appearAfterMs: 4000,
          alertText: '⚠️ Um app pediu para usar sua câmera. Cuidado!',
        },
      },
    ],
  },
]
