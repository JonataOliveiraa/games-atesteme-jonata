import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        timeLimit: 30,
        title: 'Configurações básicas',
        objective: 'Ative ou desative cada item para deixar o dispositivo seguro.',
        tip: 'Senha forte e perfil privado devem ficar ativados. O resto, desativado.',
        rounds: [
            {
                id: 'l1-r1',
                question: 'Deixe o dispositivo pronto para jogar com segurança',
                hint: 'Ative a senha forte. Deixe o resto desativado.',
                items: [
                    { itemId: 'password', initialOn: false },
                    { itemId: 'location', initialOn: false },
                    { itemId: 'camera', initialOn: false },
                ],
            },
            {
                id: 'l1-r2',
                question: 'Proteja seu perfil antes de continuar',
                hint: 'Ative o perfil privado. Deixe o resto desativado.',
                items: [
                    { itemId: 'privacy', initialOn: false },
                    { itemId: 'purchases', initialOn: false },
                    { itemId: 'strangers', initialOn: false },
                ],
            },
            {
                id: 'l1-r3',
                question: 'Revise as duas proteções principais',
                hint: 'Ative a senha forte e o perfil privado.',
                items: [
                    { itemId: 'password', initialOn: false },
                    { itemId: 'privacy', initialOn: false },
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
        tip: 'Alguns itens começam ligados ou desligados errado. Observe com atenção.',
        rounds: [
            {
                id: 'l2-r1',
                question: 'Este perfil veio com configurações arriscadas. Corrija',
                hint: 'Senha e privacidade deveriam estar ativadas; o resto, não.',
                items: [
                    { itemId: 'password', initialOn: false },
                    { itemId: 'location', initialOn: true },
                    { itemId: 'camera', initialOn: true },
                    { itemId: 'purchases', initialOn: false },
                    { itemId: 'strangers', initialOn: false },
                    { itemId: 'privacy', initialOn: false },
                ],
            },
            {
                id: 'l2-r2',
                question: 'Este app já vem com permissões demais',
                hint: 'Verifique cada item. Alguns estão certos, outros não.',
                items: [
                    { itemId: 'password', initialOn: true },
                    { itemId: 'location', initialOn: false },
                    { itemId: 'camera', initialOn: true },
                    { itemId: 'purchases', initialOn: true },
                    { itemId: 'strangers', initialOn: true },
                    { itemId: 'privacy', initialOn: true },
                ],
            },
            {
                id: 'l2-r3',
                question: 'Última checagem antes de continuar',
                hint: 'Compras e conversa com estranhos sempre ficam desativados.',
                items: [
                    { itemId: 'password', initialOn: false },
                    { itemId: 'location', initialOn: true },
                    { itemId: 'camera', initialOn: false },
                    { itemId: 'purchases', initialOn: true },
                    { itemId: 'strangers', initialOn: false },
                    { itemId: 'privacy', initialOn: false },
                ],
            },
        ],
    },
    {
        level: 3,
        timeLimit: 40,
        title: 'Jogo online em risco',
        objective: 'Configure tudo e reaja quando um novo risco aparecer.',
        tip: 'Durante a rodada pode surgir um aviso novo. Resolva ele também.',
        rounds: [
            {
                id: 'l3-r1',
                question: 'Você entrou em um jogo online. Configure tudo',
                hint: 'Revise os seis itens com atenção antes de conferir.',
                items: [
                    { itemId: 'password', initialOn: false },
                    { itemId: 'location', initialOn: true },
                    { itemId: 'camera', initialOn: true },
                    { itemId: 'purchases', initialOn: false },
                    { itemId: 'strangers', initialOn: false },
                    { itemId: 'privacy', initialOn: false },
                ],
            },
            {
                id: 'l3-r2',
                question: 'Configure e fique atento a novos avisos',
                hint: 'Um novo risco pode aparecer no meio da rodada.',
                items: [
                    { itemId: 'password', initialOn: true },
                    { itemId: 'location', initialOn: false },
                    { itemId: 'camera', initialOn: false },
                    { itemId: 'purchases', initialOn: false },
                    { itemId: 'privacy', initialOn: true },
                ],
                delayedItem: {
                    itemId: 'strangers',
                    initialOn: true,
                    appearAfterMs: 3500,
                    alertText: 'Um desconhecido está tentando conversar com você',
                },
            },
            {
                id: 'l3-r3',
                question: 'Feche todas as brechas de segurança',
                hint: 'Verifique os itens e o aviso que pode surgir.',
                items: [
                    { itemId: 'password', initialOn: false },
                    { itemId: 'location', initialOn: true },
                    { itemId: 'privacy', initialOn: false },
                    { itemId: 'purchases', initialOn: false },
                    { itemId: 'strangers', initialOn: false },
                ],
                delayedItem: {
                    itemId: 'camera',
                    initialOn: true,
                    appearAfterMs: 4000,
                    alertText: 'Um app pediu para usar sua câmera',
                },
            },
        ],
    },
]