import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        title: 'Duas Partes',
        objective: 'Separe o pedido do café da manhã em duas partes, resolva cada uma e junte no plano.',
        missions: ['cafe'],
        useDeps: false,
        useClock: false,
        useTracks: false,
        useReuse: false,
        phases: [
            {
                id: 'l1-partir',
                kind: 'partir',
                mission: 'cafe',
                ask: 'Este pedido é grande. Toque em DIVIDIR para separar em duas partes.',
                hintDeep: 'Café da manhã tem duas coisas bem diferentes: a bebida quente e a comida.',
                task: {
                    cardTitle: 'PEDIDO DA CASA',
                    cardText: 'Preparar o café da manhã da família.',
                    slots: 2,
                    candidates: [
                        {
                            id: 'cafe',
                            label: 'Preparar o café',
                            detail: 'esquentar a água e coar',
                            fits: true,
                            reason: 'Esta é uma parte do café da manhã.',
                        },
                        {
                            id: 'sanduiche',
                            label: 'Fazer o sanduíche',
                            detail: 'montar o pão com recheio',
                            fits: true,
                            reason: 'Esta também é uma parte do café da manhã.',
                        },
                        {
                            id: 'varrer',
                            label: 'Varrer o quintal',
                            detail: 'juntar as folhas',
                            fits: false,
                            reason: 'Varrer o quintal não faz parte de preparar o café da manhã.',
                        },
                        {
                            id: 'dormir',
                            label: 'Arrumar a cama',
                            detail: 'lençol e travesseiro',
                            fits: false,
                            reason: 'Arrumar a cama é outro pedido, não é o café da manhã.',
                        },
                    ],
                    explain: 'Um pedido grande virou duas partes menores: o café e o sanduíche.',
                    hint: 'Escolha só o que serve para o café da manhã ficar pronto.',
                },
            },
            {
                id: 'l1-cafe',
                kind: 'resolver',
                mission: 'cafe',
                ask: 'Coloque os passos do café na ordem certa.',
                hintDeep: 'A água precisa estar quente antes de encontrar o pó.',
                task: {
                    partId: 'cafe',
                    title: 'Preparar o café',
                    prompt: 'Toque nos passos na ordem em que eles acontecem.',
                    steps: [
                        { id: 'agua', text: 'Colocar a água para esquentar', hint: 'Nada acontece sem água quente.' },
                        { id: 'po', text: 'Colocar o pó no filtro', hint: 'O pó espera dentro do filtro.' },
                        { id: 'coar', text: 'Despejar a água e coar', hint: 'Este passo precisa dos dois anteriores.' },
                    ],
                    answer: ['agua', 'po', 'coar'],
                    explain: 'Esta parte ficou pronta e foi guardada na caixa.',
                    hint: 'Comece pelo que demora e pode ir esquentando sozinho.',
                },
            },
            {
                id: 'l1-sanduiche',
                kind: 'resolver',
                mission: 'cafe',
                ask: 'Agora coloque os passos do sanduíche na ordem certa.',
                hintDeep: 'Primeiro o pão aberto, depois o recheio, depois fechar.',
                task: {
                    partId: 'sanduiche',
                    title: 'Fazer o sanduíche',
                    prompt: 'Toque nos passos na ordem em que eles acontecem.',
                    steps: [
                        { id: 'pao', text: 'Abrir o pão na tábua', hint: 'O pão precisa estar aberto primeiro.' },
                        { id: 'recheio', text: 'Colocar o recheio', hint: 'O recheio vai dentro do pão aberto.' },
                        { id: 'fechar', text: 'Fechar e cortar ao meio', hint: 'Este é o último passo.' },
                    ],
                    answer: ['pao', 'recheio', 'fechar'],
                    explain: 'A segunda parte também ficou pronta.',
                    hint: 'Pense na ordem em que suas mãos fariam isso.',
                },
            },
            {
                id: 'l1-combinar',
                kind: 'combinar',
                mission: 'cafe',
                ask: 'Toque nas duas partes para colocar no plano. Depois toque em SIMULAR.',
                hintDeep: 'Aqui as duas ordens funcionam. O importante é que as duas partes entrem no plano.',
                task: {
                    prompt: 'Toque em cada parte para colocar na faixa, na ordem que você quiser.',
                    tracks: ['voce'],
                    blocks: ['cafe', 'sanduiche'],
                    bestMinutes: 16,
                    parMinutes: 16,
                    explain: 'Nenhuma das duas precisava esperar a outra, então qualquer ordem servia. O que valia era colocar as duas.',
                    hint: 'Nenhuma das duas precisa esperar a outra. Escolha e simule.',
                },
            },
        ],
    },

    {
        level: 2,
        title: 'Ordem que Rende',
        objective: 'Agora são três partes, e algumas só entram depois de outras. A ordem muda o tempo do plano.',
        missions: ['festa'],
        useDeps: true,
        useClock: true,
        useTracks: false,
        useReuse: false,
        phases: [
            {
                id: 'l2-festa-partir',
                kind: 'partir',
                mission: 'festa',
                ask: 'Toque em DIVIDIR para separar o pedido da festa em três partes.',
                hintDeep: 'Decorar, cuidar do bolo e cuidar do som são trabalhos bem diferentes.',
                task: {
                    cardTitle: 'PEDIDO DA ESCOLA',
                    cardText: 'Organizar a festa do pátio para hoje à tarde.',
                    slots: 3,
                    candidates: [
                        {
                            id: 'decorar',
                            label: 'Decorar o pátio',
                            detail: 'bandeirinhas e balões',
                            fits: true,
                            reason: 'A festa precisa do pátio decorado.',
                        },
                        {
                            id: 'bolo',
                            label: 'Assar o bolo',
                            detail: 'massa no forno',
                            fits: true,
                            reason: 'O bolo é parte da festa.',
                        },
                        {
                            id: 'som',
                            label: 'Ligar o som',
                            detail: 'caixa e músicas escolhidas',
                            fits: true,
                            reason: 'A música faz parte da festa.',
                        },
                        {
                            id: 'prova',
                            label: 'Estudar para a prova',
                            detail: 'revisar o caderno',
                            fits: false,
                            reason: 'Estudar é importante, mas não monta a festa.',
                        },
                        {
                            id: 'jardim',
                            label: 'Regar o jardim',
                            detail: 'molhar as plantas',
                            fits: false,
                            reason: 'Regar o jardim não muda em nada a festa.',
                        },
                    ],
                    explain: 'A festa virou três partes: decoração, bolo e som.',
                    hint: 'Escolha só o que faz a festa acontecer.',
                },
            },
            {
                id: 'l2-festa-bolo',
                kind: 'resolver',
                mission: 'festa',
                ask: 'Coloque os passos do bolo na ordem.',
                hintDeep: 'A massa só vai ao forno depois de misturada.',
                task: {
                    partId: 'bolo',
                    title: 'Assar o bolo',
                    prompt: 'Toque nos passos na ordem em que eles acontecem.',
                    steps: [
                        { id: 'misturar', text: 'Misturar os ingredientes', hint: 'A massa nasce aqui.' },
                        { id: 'forma', text: 'Despejar na forma', hint: 'A massa precisa estar pronta.' },
                        { id: 'assar', text: 'Levar ao forno', hint: 'É o passo mais demorado.' },
                    ],
                    answer: ['misturar', 'forma', 'assar'],
                    explain: 'O bolo demora trinta minutos. Guarde isso para montar o plano.',
                    hint: 'Comece pelo que se faz com as mãos, termine no forno.',
                },
            },
            {
                id: 'l2-festa-decorar',
                kind: 'resolver',
                mission: 'festa',
                ask: 'Agora os passos da decoração.',
                hintDeep: 'Primeiro separar, depois encher, depois pendurar.',
                task: {
                    partId: 'decorar',
                    title: 'Decorar o pátio',
                    prompt: 'Toque nos passos na ordem em que eles acontecem.',
                    steps: [
                        { id: 'separar', text: 'Separar bandeirinhas e balões', hint: 'Nada se pendura sem estar separado.' },
                        { id: 'encher', text: 'Encher os balões', hint: 'Balão vazio não decora.' },
                        { id: 'pendurar', text: 'Pendurar tudo no pátio', hint: 'É o último passo.' },
                    ],
                    answer: ['separar', 'encher', 'pendurar'],
                    explain: 'A decoração ficou pronta e foi para a caixa.',
                    hint: 'Pense no que precisa estar pronto antes de subir na escada.',
                },
            },
            {
                id: 'l2-festa-som',
                kind: 'resolver',
                mission: 'festa',
                ask: 'Faltam os passos do som.',
                hintDeep: 'A caixa precisa estar ligada antes de tocar qualquer música.',
                task: {
                    partId: 'som',
                    title: 'Ligar o som',
                    prompt: 'Toque nos passos na ordem em que eles acontecem.',
                    steps: [
                        { id: 'caixa', text: 'Levar a caixa para o pátio', hint: 'A caixa precisa chegar primeiro.' },
                        { id: 'ligar', text: 'Ligar a caixa na tomada', hint: 'A caixa já está no lugar.' },
                        { id: 'musica', text: 'Escolher as músicas', hint: 'É o último passo.' },
                    ],
                    answer: ['caixa', 'ligar', 'musica'],
                    explain: 'As três partes estão resolvidas. Agora é montar o plano.',
                    hint: 'Pense na ordem em que a caixa vira música.',
                },
            },
            {
                id: 'l2-festa-combinar',
                kind: 'combinar',
                mission: 'festa',
                ask: 'Monte o plano da festa. Servir o bolo só entra depois de assar.',
                hintDeep: 'Comece pelo bolo: enquanto ele assa, o tempo passa de qualquer jeito.',
                task: {
                    prompt: 'Coloque as partes na faixa. A seta mostra o que depende de quê.',
                    tracks: ['voce'],
                    blocks: ['bolo', 'decorar', 'som', 'servir'],
                    bestMinutes: 70,
                    parMinutes: 70,
                    explain: 'Assar o bolo primeiro foi a melhor escolha: servir só existia depois dele.',
                    hint: 'Servir o bolo depende de assar o bolo.',
                },
            },
        ],
    },

    /**
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — UMA MISSÃO, UMA NOVIDADE
     * ══════════════════════════════════════════════════════════════════════
     *
     * A versão anterior tinha DUAS missões de três fases cada — seis fases — e
     * ligava tudo de uma vez: dependências, relógio, duas faixas, reaproveitar
     * módulo, e ainda uma segunda passada na divisão (dividir, e uma das partes
     * dividir de novo). Cinco ideias novas na última etapa de um jogo, com
     * texto para explicar cada uma. Ficou longo, cheio e difícil de acompanhar.
     *
     * Agora é UMA missão, o mesmo arco dos outros níveis — dividir, resolver,
     * combinar — e uma única coisa nova em relação ao nível 2: a SEGUNDA
     * FAIXA. O colega trabalha ao mesmo tempo que você, e é só isso que este
     * nível ensina: duas pessoas ao mesmo tempo terminam antes.
     *
     * Sem segunda passada, sem relógio para perseguir e sem reaproveitar. O
     * paralelo aparece nas duas faixas correndo lado a lado, que é onde ele
     * pode ser visto — não num número.
     */
    {
        level: 3,
        title: 'Duas Mãos',
        objective: 'Agora você não está sozinho. Divida o trabalho com um colega para a feira ficar pronta antes.',
        missions: ['feira'],
        useDeps: false,
        useClock: false,
        useTracks: true,
        useReuse: false,
        phases: [
            {
                id: 'l3-feira-partir',
                kind: 'partir',
                mission: 'feira',
                ask: 'Toque em DIVIDIR para separar o pedido da feira em três partes.',
                hintDeep: 'O cartaz, a bancada e o experimento são trabalhos bem diferentes.',
                task: {
                    cardTitle: 'PEDIDO DA FEIRA',
                    cardText: 'Montar a apresentação da turma na feira de ciências.',
                    slots: 3,
                    candidates: [
                        {
                            id: 'testar',
                            label: 'Testar o experimento',
                            detail: 'ver se funciona antes',
                            fits: true,
                            reason: 'O experimento é o centro da apresentação.',
                        },
                        {
                            id: 'cartaz',
                            label: 'Fazer o cartaz',
                            detail: 'título e desenhos',
                            fits: true,
                            reason: 'O cartaz explica o experimento para quem visita.',
                        },
                        {
                            id: 'bancada',
                            label: 'Arrumar a bancada',
                            detail: 'toalha e lugar das coisas',
                            fits: true,
                            reason: 'A bancada precisa estar pronta para receber tudo.',
                        },
                        {
                            id: 'lanche',
                            label: 'Comprar lanche',
                            detail: 'fila da cantina',
                            fits: false,
                            reason: 'O lanche não faz parte da apresentação.',
                        },
                        {
                            id: 'foto',
                            label: 'Ver fotos antigas',
                            detail: 'álbum da turma',
                            fits: false,
                            reason: 'Olhar fotos não ajuda a montar a feira.',
                        },
                    ],
                    explain: 'A feira virou três partes: o teste, o cartaz e a bancada.',
                    hint: 'Escolha só o que monta a apresentação.',
                },
            },
            {
                id: 'l3-feira-testar',
                kind: 'resolver',
                mission: 'feira',
                ask: 'Coloque os passos do teste na ordem certa.',
                hintDeep: 'Montar, olhar e anotar, nessa ordem.',
                task: {
                    partId: 'testar',
                    title: 'Testar o experimento',
                    prompt: 'Toque nos passos na ordem em que eles acontecem.',
                    steps: [
                        { id: 'montar', text: 'Montar o experimento na mesa', hint: 'Nada acontece sem montar.' },
                        { id: 'observar', text: 'Olhar o que acontece', hint: 'Só dá para olhar o que já está montado.' },
                        { id: 'anotar', text: 'Anotar o resultado', hint: 'A anotação vem por último.' },
                    ],
                    answer: ['montar', 'observar', 'anotar'],
                    explain: 'O teste ficou pronto e foi para a caixa.',
                    hint: 'Comece pelo que ocupa a mesa.',
                },
            },
            {
                id: 'l3-feira-combinar',
                kind: 'combinar',
                mission: 'feira',
                ask: 'Agora são duas faixas: uma sua e uma do colega.',
                hintDeep: 'Duas partes que não precisam esperar uma pela outra podem ficar em faixas diferentes e acontecer ao mesmo tempo.',
                task: {
                    prompt: 'Toque em cada parte para colocar numa faixa. As duas faixas trabalham ao mesmo tempo.',
                    tracks: ['voce', 'colega'],
                    blocks: ['testar', 'cartaz', 'bancada'],
                    bestMinutes: 30,
                    parMinutes: 45,
                    explain: 'Enquanto você testava, o colega fazia o cartaz e a bancada. Duas pessoas ao mesmo tempo terminam antes.',
                    hint: 'O cartaz não precisa esperar o experimento. Ele pode ir na outra faixa.',
                },
            },
        ],
    },
]
