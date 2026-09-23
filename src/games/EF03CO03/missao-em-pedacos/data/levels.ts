import type { LevelDef, RunMap, Task } from '../types'

/*
 * O MAPA É UM POR TAREFA, E SERVE ÀS DUAS VIAGENS DELA.
 *
 * Ele não sabe quais itens carrega: tem VAGAS. As `tripSpots` recebem os quatro
 * itens do painel da vez — duas no chão e duas em cima de plataforma, para a
 * viagem ter subida. O `trash` é o lixo do caminho, e ele é fixo.
 *
 * SÃO SEIS MAPAS DIFERENTES, e crescendo:
 *
 * | Nível | Comprimento | Vãos | Pedras | Lixo | Como termina |
 * |---|---|---|---|---|---|
 * | 1 | 5.400 | 1 | 2 | 2 | bancada em 5.040 |
 * | 2 | 6.480 | 2 | 2 | 2 | bancada em 6.120 / estações em 5.760 e 6.120 |
 * | 3 | 6.840 | 2 | 2-3 | 2 | estações em 6.120 e 6.480 |
 *
 * Antes eram dois esqueletos repetidos seis vezes, e o nível 3 corria o mesmo
 * mapa do nível 2. Cada tarefa tem o seu agora, e o RITMO é o que muda: o bolo
 * abre com a escada e guarda o vão para o meio; o piquenique põe o vão logo no
 * começo e a escada no fim; o café sobe duas vezes; a fogueira tem duas pedras
 * seguidas, como um portão; a barraca alterna vão, escada, vão, escada.
 *
 * ── DE ONDE SAI CADA NÚMERO ──────────────────────────────────────────────
 *
 * O chão está em y 500 e o herói pisa nele. As alturas de plataforma saem daí:
 * 330 é um pulo do chão (170 de subida, contra 208 de alcance) e 240 só se
 * alcança pulando de OUTRA plataforma — do chão seriam 260, mais que o pulo.
 *
 * Nenhum salto passa de 80% do alcance (300 px) nem de 80% da altura (208 px).
 * A pedra tem 110 px de topo: passa com folga num pulo qualquer.
 *
 * O `x` da plataforma é a BORDA ESQUERDA; o da pedra é o CENTRO. O item no chão
 * fica em y 440 e o de plataforma 60 px acima do tampo dela.
 *
 * OS BURACOS CAEM NA GRADE DE 180. O chão é feito de blocos quadrados de 180 px
 * desenhados no aspecto da arte; se um buraco começasse fora da grade, o último
 * bloco do pedaço avançaria por cima do vão. Todo `gap.x`, todo `gap.w` e todo
 * `length` são múltiplos de 180.
 *
 * ── AS SEIS REGRAS QUE AS MEDIÇÕES DEIXARAM ──────────────────────────────
 *
 * 1. NENHUMA plataforma passa por cima de um buraco. Sair andando da beirada
 *    tem que cair no chão, não no vão: a plataforma é prêmio, não armadilha.
 * 2. A PRIMEIRA VAGA fica depois da primeira pedra. Antes ela nascia a 40 px do
 *    herói e o item entrava no painel sozinho, sem a criança fazer nada.
 * 3. NADA DE LIXO onde um pulo pousa: nem nos 180 px depois de um vão, nem nos
 *    340 px depois de uma pedra. O lixo mata, e morrer no ar é injusto.
 * 4. NADA DE LIXO embaixo de plataforma, nem a menos de 240 px da beirada de
 *    uma: descer da plataforma tem que dar tempo de ver o que vem.
 * 5. Lixo e item nunca dividem a mesma superfície a menos de 320 px. Antes eles
 *    ficavam a 120 e as caixas de coleta se tocavam: pegar o certo virava sorte.
 * 6. Os últimos 900 px são limpos — sem lixo, pedra ou vão. É onde fica a
 *    bancada, ou as duas estações.
 */

/** Nível 1-A — a escada primeiro, o vão no meio, a reta final livre. */
const MAP_BOLO: RunMap = {
    length: 5400,
    gaps: [{ x: 3240, w: 180 }],
    platforms: [
        { x: 1800, y: 330, w: 280 },
        { x: 2160, y: 240, w: 240 },
        { x: 4320, y: 330, w: 280 },
    ],
    rocks: [{ x: 660 }, { x: 2700 }],
    tripSpots: [
        { x: 1080, y: 440 },
        { x: 2280, y: 180 },
        { x: 3660, y: 440 },
        { x: 4460, y: 270 },
    ],
    trash: [
        { x: 1500, y: 468 },
        { x: 4020, y: 468 },
    ],
    checkpoints: [480, 2160, 3600],
    benchX: 5040,
}

/** Nível 1-B — o vão logo no começo, e a escada guardada para o fim. */
const MAP_PIQUENIQUE: RunMap = {
    length: 5400,
    gaps: [{ x: 1620, w: 180 }],
    platforms: [
        { x: 2880, y: 330, w: 280 },
        { x: 3240, y: 240, w: 240 },
        { x: 4500, y: 330, w: 280 },
    ],
    rocks: [{ x: 720 }, { x: 2520 }],
    tripSpots: [
        { x: 1140, y: 440 },
        { x: 3360, y: 180 },
        { x: 4140, y: 440 },
        { x: 4640, y: 270 },
    ],
    trash: [
        { x: 2160, y: 468 },
        { x: 3780, y: 468 },
    ],
    checkpoints: [480, 1980, 3600],
    benchX: 5040,
}

/** Nível 2-A — dois vãos, com a escada entre eles. Termina na bancada. */
const MAP_SANDUICHE: RunMap = {
    length: 6480,
    gaps: [
        { x: 1980, w: 180 },
        { x: 4320, w: 180 },
    ],
    platforms: [
        { x: 3240, y: 330, w: 280 },
        { x: 3600, y: 240, w: 240 },
        { x: 5400, y: 330, w: 280 },
    ],
    rocks: [{ x: 660 }, { x: 2700 }],
    tripSpots: [
        { x: 1080, y: 440 },
        { x: 3720, y: 180 },
        { x: 4680, y: 440 },
        { x: 5540, y: 270 },
    ],
    trash: [
        { x: 1440, y: 468 },
        { x: 5040, y: 468 },
    ],
    checkpoints: [480, 2340, 4680],
    benchX: 6120,
}

/** Nível 2-B — sobe duas vezes, e no fim ficam as duas estações do café. */
const MAP_CAFE: RunMap = {
    length: 6480,
    gaps: [{ x: 3240, w: 180 }],
    platforms: [
        { x: 1980, y: 330, w: 280 },
        { x: 4320, y: 330, w: 280 },
        { x: 4680, y: 240, w: 240 },
    ],
    rocks: [{ x: 720 }, { x: 2700 }],
    tripSpots: [
        { x: 1080, y: 440 },
        { x: 2120, y: 270 },
        { x: 4800, y: 180 },
        { x: 5220, y: 440 },
    ],
    trash: [
        { x: 1440, y: 468 },
        { x: 3960, y: 468 },
    ],
    checkpoints: [480, 2340, 3600],
    benchX: 6300,
}

/** Nível 3-A — duas pedras seguidas, como um portão, e dois vãos. */
const MAP_FOGUEIRA: RunMap = {
    length: 6840,
    gaps: [
        { x: 1800, w: 180 },
        { x: 4860, w: 180 },
    ],
    platforms: [
        { x: 3420, y: 330, w: 280 },
        { x: 3780, y: 240, w: 240 },
        { x: 5400, y: 330, w: 280 },
    ],
    rocks: [{ x: 660 }, { x: 2340 }, { x: 2880 }],
    tripSpots: [
        { x: 1080, y: 440 },
        { x: 3900, y: 180 },
        { x: 5220, y: 440 },
        { x: 5540, y: 270 },
    ],
    trash: [
        { x: 1440, y: 468 },
        { x: 4320, y: 468 },
    ],
    checkpoints: [480, 2160, 4140],
    benchX: 6660,
}

/** Nível 3-B — vão, escada, vão, escada: o mapa alterna o tempo todo. */
const MAP_BARRACA: RunMap = {
    length: 6840,
    gaps: [
        { x: 1620, w: 180 },
        { x: 4140, w: 180 },
    ],
    platforms: [
        { x: 2880, y: 330, w: 280 },
        { x: 5220, y: 330, w: 280 },
        { x: 5580, y: 240, w: 240 },
    ],
    rocks: [{ x: 660 }, { x: 3600 }],
    tripSpots: [
        { x: 1080, y: 440 },
        { x: 3020, y: 270 },
        { x: 4500, y: 440 },
        { x: 5700, y: 180 },
    ],
    trash: [
        { x: 2340, y: 468 },
        { x: 4860, y: 468 },
    ],
    checkpoints: [480, 1980, 4500],
    benchX: 6660,
}

/*
 * AS DUAS TAREFAS DO NÍVEL 1, E POR QUE ELAS SÃO DIFERENTES ENTRE SI.
 *
 * O bolo é uma RECEITA: a fase final tem ordem obrigatória, porque não se cobre
 * um bolo que ainda não assou. O piquenique é uma ARRUMAÇÃO: a fase final aceita
 * qualquer ordem. As duas juntas dizem a mesma coisa do texto oficial — dá para
 * combinar as soluções de mais de um jeito, e às vezes de um jeito só.
 */
/*
 * A MECÂNICA DE ESTAÇÃO — três das seis tarefas usam ela.
 *
 * Nas tarefas comuns a viagem termina na bancada e a receita acontece depois,
 * numa tela à parte. Nestas três a receita acontece NO MAPA: a criança junta os
 * quatro objetos da metade e leva CADA PAR até o ponto onde ele serve. A
 * chaleira e a jarra até o fogareiro; os fósforos e a luva até acender.
 *
 * Cada estação mostra, escurecido, o quadro do `final-nN` que ela vai virar —
 * e acende quando é atendida. Por isso nenhuma folha nova foi pedida: o estado
 * que antes só existia na tela final passou a existir no mundo.
 *
 * Estas tarefas NÃO têm fase final. Seria contar a mesma história duas vezes.
 */
const TASK_SANDUICHE: Task = {
    id: 'sanduiche',
    name: 'Fazer o sanduíche',
    sheetKey: 'itens-n2-a',
    finalKey: 'final-n2',
    brief: 'Corte a tarefa no meio: um painel prepara o pão, o outro leva o recheio.',
    map: MAP_SANDUICHE,
    items: [
        { id: 'pao', name: 'Pão', label: 'O pão', frame: 0, jobId: 'pao' },
        { id: 'faca', name: 'Faca de cortar', label: 'A faca', frame: 1, jobId: 'pao' },
        { id: 'tabua', name: 'Tábua', label: 'A tábua', frame: 2, jobId: 'pao' },
        { id: 'manteiga', name: 'Manteiga', label: 'A manteiga', frame: 3, jobId: 'pao' },
        { id: 'queijo', name: 'Queijo', label: 'O queijo', frame: 4, jobId: 'recheio' },
        { id: 'presunto', name: 'Presunto', label: 'O presunto', frame: 5, jobId: 'recheio' },
        { id: 'tomate', name: 'Tomate', label: 'O tomate', frame: 6, jobId: 'recheio' },
        { id: 'alface', name: 'Alface', label: 'A alface', frame: 7, jobId: 'recheio' },
    ],
    jobs: [
        // "O pão" com faca e tábua dentro dizia que as duas eram parte do pão.
        { id: 'pao', name: 'Preparar o pão', partOf: 'de preparar o pão' },
        { id: 'recheio', name: 'O recheio', partOf: 'do recheio' },
    ],
    steps: [
        { itemId: 'tabua', line: 'A tábua na bancada.', hint: 'Comece pela tábua.' },
        {
            itemId: 'pao',
            after: ['tabua'],
            line: 'O pão foi para a tábua.',
            hint: 'Ponha a tábua primeiro.',
        },
        {
            itemId: 'faca',
            after: ['pao'],
            line: 'Cortado ao meio!',
            hint: 'O pão ainda não está na tábua.',
        },
        {
            itemId: 'manteiga',
            after: ['faca'],
            line: 'Manteiga nas duas metades.',
            hint: 'Corte o pão antes de passar manteiga.',
        },
        {
            itemId: 'queijo',
            after: ['manteiga'],
            line: 'Uma fatia de queijo.',
            hint: 'Passe a manteiga primeiro.',
        },
        { itemId: 'presunto', after: ['queijo'], line: 'Presunto por cima.', hint: 'Queijo primeiro.' },
        {
            itemId: 'tomate',
            after: ['presunto'],
            line: 'Uma rodela de tomate.',
            hint: 'O recheio ainda não começou.',
        },
        {
            itemId: 'alface',
            after: ['tomate'],
            line: 'E a alface, para fechar.',
            hint: 'A alface é a última.',
        },
    ],
    states: [4, 4, 4, 5, 6, 6, 7, 7, 7],
    finalLine: 'O sanduíche ficou pronto!',
}

const TASK_CAFE: Task = {
    id: 'cafe',
    name: 'Passar o café',
    sheetKey: 'itens-n2-b',
    finalKey: 'final-n2',
    brief: 'Corte a tarefa no meio: um painel esquenta a água, o outro passa o café.',
    map: MAP_CAFE,
    items: [
        { id: 'jarra', name: 'Jarra com água', label: 'A jarra', frame: 0, jobId: 'agua' },
        { id: 'chaleira', name: 'Chaleira', label: 'A chaleira', frame: 1, jobId: 'agua' },
        { id: 'fosforos', name: 'Fósforos', label: 'Os fósforos', frame: 2, jobId: 'agua' },
        { id: 'luva', name: 'Luva de pegar', label: 'A luva', frame: 3, jobId: 'agua' },
        { id: 'po', name: 'Pó de café', label: 'O pó de café', frame: 4, jobId: 'coar' },
        { id: 'coador', name: 'Coador', label: 'O coador', frame: 5, jobId: 'coar' },
        { id: 'xicara', name: 'Xícara', label: 'A xícara', frame: 6, jobId: 'coar' },
        { id: 'acucar', name: 'Açúcar', label: 'O açúcar', frame: 7, jobId: 'coar' },
    ],
    jobs: [
        {
            id: 'agua',
            name: 'Esquentar a água',
            partOf: 'de esquentar a água',
            stations: [
                {
                    id: 'fogareiro',
                    x: 5760,
                    needs: ['chaleira', 'jarra'],
                    frame: 0,
                    line: 'Chaleira no fogareiro, cheia de água!',
                    hint: 'Traga a CHALEIRA e a JARRA para cá.',
                },
                {
                    id: 'acender',
                    x: 6120,
                    needs: ['fosforos', 'luva'],
                    after: ['fogareiro'],
                    frame: 1,
                    line: 'O fogo acendeu — a água está esquentando!',
                    hint: 'Primeiro a chaleira no fogareiro. Depois traga FÓSFOROS e LUVA.',
                },
            ],
        },
        {
            id: 'coar',
            name: 'Passar o café',
            partOf: 'de passar o café',
            stations: [
                {
                    id: 'coar',
                    x: 5760,
                    needs: ['coador', 'po'],
                    frame: 2,
                    line: 'O pó no coador, e a água quente passando.',
                    hint: 'Traga o COADOR e o PÓ DE CAFÉ para cá.',
                },
                {
                    id: 'servir',
                    x: 6120,
                    needs: ['xicara', 'acucar'],
                    after: ['coar'],
                    frame: 3,
                    line: 'Café passado, com açúcar. Pronto!',
                    hint: 'Primeiro coe o café. Depois traga XÍCARA e AÇÚCAR.',
                },
            ],
        },
    ],
    steps: [],
    states: [],
    finalLine: 'O café ficou pronto!',
}

const TASK_FOGUEIRA: Task = {
    id: 'fogueira',
    name: 'A fogueira e o lanche',
    sheetKey: 'itens-n3-a',
    finalKey: 'final-n3',
    brief: 'Corte a tarefa no meio: um painel faz a fogueira, o outro faz o lanche.',
    map: MAP_FOGUEIRA,
    items: [
        { id: 'gravetos', name: 'Gravetos', label: 'Os gravetos', frame: 0, jobId: 'fogo' },
        { id: 'tora', name: 'Tora de lenha', label: 'A tora', frame: 1, jobId: 'fogo' },
        { id: 'fosforos', name: 'Fósforos', label: 'Os fósforos', frame: 2, jobId: 'fogo' },
        { id: 'pedra', name: 'Pedra da roda', label: 'A pedra', frame: 3, jobId: 'fogo' },
        {
            id: 'marshmallow',
            name: 'Marshmallow',
            label: 'O marshmallow',
            frame: 4,
            jobId: 'lanche',
        },
        { id: 'espeto', name: 'Espeto de assar', label: 'O espeto', frame: 5, jobId: 'lanche' },
        { id: 'biscoito', name: 'Biscoitos', label: 'Os biscoitos', frame: 6, jobId: 'lanche' },
        { id: 'chocolate', name: 'Chocolate', label: 'O chocolate', frame: 7, jobId: 'lanche' },
    ],
    jobs: [
        {
            id: 'fogo',
            // os fósforos não SÃO a fogueira; acender, sim, pede fósforos
            name: 'Acender a fogueira',
            partOf: 'de acender a fogueira',
            stations: [
                {
                    id: 'roda',
                    x: 6120,
                    needs: ['pedra', 'gravetos'],
                    frame: 4,
                    line: 'As pedras em roda e os gravetos no meio.',
                    hint: 'Traga a PEDRA e os GRAVETOS para cá.',
                },
                {
                    id: 'acender',
                    x: 6480,
                    needs: ['tora', 'fosforos'],
                    after: ['roda'],
                    frame: 5,
                    line: 'A tora em cima, e o fogo acendeu!',
                    hint: 'Primeiro monte a roda de pedras. Depois traga TORA e FÓSFOROS.',
                },
            ],
        },
        {
            id: 'lanche',
            // "O lanche" com o espeto dentro dizia que o espeto se comia
            name: 'Fazer o lanche',
            partOf: 'de fazer o lanche',
            requires: 'fogo',
            stations: [
                {
                    id: 'assar',
                    x: 6120,
                    needs: ['marshmallow', 'espeto'],
                    frame: 6,
                    line: 'Marshmallow no espeto, tostando no fogo.',
                    hint: 'Traga o MARSHMALLOW e o ESPETO para cá.',
                },
                {
                    id: 'montar',
                    x: 6480,
                    needs: ['biscoito', 'chocolate'],
                    after: ['assar'],
                    frame: 7,
                    line: 'Biscoito, chocolate e marshmallow: o lanche ficou pronto!',
                    hint: 'Asse o marshmallow primeiro. Depois traga BISCOITOS e CHOCOLATE.',
                },
            ],
        },
    ],
    steps: [],
    states: [],
    finalLine: 'A fogueira e o lanche ficaram prontos!',
}

const TASK_BARRACA: Task = {
    id: 'barraca',
    name: 'Montar a barraca',
    sheetKey: 'itens-n3-b',
    finalKey: 'final-n3',
    brief: 'Corte a tarefa no meio: um painel arma a barraca, o outro prepara a hora de dormir.',
    map: MAP_BARRACA,
    items: [
        { id: 'lona', name: 'Lona da barraca', label: 'A lona', frame: 0, jobId: 'armar' },
        { id: 'vareta', name: 'Vareta', label: 'A vareta', frame: 1, jobId: 'armar' },
        { id: 'estaca', name: 'Estaca', label: 'A estaca', frame: 2, jobId: 'armar' },
        { id: 'martelo', name: 'Martelo', label: 'O martelo', frame: 3, jobId: 'armar' },
        { id: 'saco', name: 'Saco de dormir', label: 'O saco de dormir', frame: 4, jobId: 'cama' },
        { id: 'travesseiro', name: 'Travesseiro', label: 'O travesseiro', frame: 5, jobId: 'cama' },
        { id: 'colchonete', name: 'Colchonete', label: 'O colchonete', frame: 6, jobId: 'cama' },
        { id: 'lanterna', name: 'Lanterna', label: 'A lanterna', frame: 7, jobId: 'cama' },
    ],
    jobs: [
        {
            id: 'armar',
            name: 'Armar a barraca',
            partOf: 'de armar a barraca',
            stations: [
                {
                    id: 'estender',
                    x: 6120,
                    needs: ['lona', 'estaca'],
                    frame: 0,
                    line: 'A lona no chão e as estacas do lado.',
                    hint: 'Traga a LONA e a ESTACA para cá.',
                },
                {
                    id: 'levantar',
                    x: 6480,
                    needs: ['vareta', 'martelo'],
                    after: ['estender'],
                    frame: 1,
                    line: 'Vareta em pé, estaca fincada: a barraca subiu!',
                    hint: 'Primeiro estenda a lona. Depois traga VARETA e MARTELO.',
                },
            ],
        },
        {
            id: 'cama',
            // a lanterna não faz parte da cama; da hora de dormir, sim
            name: 'Hora de dormir',
            partOf: 'da hora de dormir',
            requires: 'armar',
            stations: [
                {
                    id: 'abrir',
                    x: 6120,
                    needs: ['colchonete', 'saco'],
                    frame: 2,
                    line: 'A barraca abriu, e o colchonete entrou.',
                    hint: 'Traga o COLCHONETE e o SACO DE DORMIR para cá.',
                },
                {
                    id: 'arrumar',
                    x: 6480,
                    needs: ['travesseiro', 'lanterna'],
                    after: ['abrir'],
                    frame: 3,
                    line: 'Cama feita e lanterna acesa. Boa noite!',
                    hint: 'Ponha o colchonete primeiro. Depois traga TRAVESSEIRO e LANTERNA.',
                },
            ],
        },
    ],
    steps: [],
    states: [],
    finalLine: 'A barraca ficou pronta!',
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Dois painéis',
        tasks: [
            {
                id: 'bolo',
                name: 'Fazer o bolo de aniversário',
                sheetKey: 'itens-n1-a',
                finalKey: 'final-n1',
                brief: 'Corte a tarefa no meio: um painel leva a massa, o outro a cobertura.',
                map: MAP_BOLO,
                /*
                 * SÓ O QUE É MASSA E O QUE É COBERTURA.
                 *
                 * Antes cada metade tinha quatro objetos, e para chegar a quatro
                 * entravam a tigela, a colher de pau, a espátula e a velinha. Com
                 * o painel dizendo "Cobertura", a criança lia que a vela ia
                 * MISTURADA na calda, e que a colher era ingrediente da massa.
                 * Saíram as quatro, sem nada no lugar: cada painel agora tem dois
                 * lugares (`tripSlots`). A velinha continua no bolo pronto — no
                 * desenho do fim, não como coisa que se leva.
                 *
                 * Os quadros 0, 3, 6 e 7 de `itens-n1-a` ficaram sem uso.
                 */
                items: [
                    { id: 'farinha', name: 'Farinha', label: 'A farinha', frame: 2, jobId: 'massa' },
                    { id: 'ovo', name: 'Ovo', label: 'O ovo', frame: 1, jobId: 'massa' },
                    { id: 'calda', name: 'Calda de chocolate', label: 'A calda', frame: 4, jobId: 'cobertura' },
                    { id: 'confeitos', name: 'Confeitos', label: 'Os confeitos', frame: 5, jobId: 'cobertura' },
                ],
                jobs: [
                    { id: 'massa', name: 'Massa do bolo', partOf: 'da massa' },
                    { id: 'cobertura', name: 'Cobertura', partOf: 'da cobertura' },
                ],
                /*
                 * A massa vai ao forno SOZINHA, no segundo ingrediente: sem a
                 * tigela e a colher não há quem misture nem quem leve, e o
                 * quadro do bolo assado precisa estar na tela antes da calda.
                 */
                steps: [
                    {
                        itemId: 'farinha',
                        line: 'A farinha foi para a forma.',
                        hint: 'Comece pela massa.',
                    },
                    {
                        itemId: 'ovo',
                        after: ['farinha'],
                        line: 'O ovo, e a massa foi para o forno... assou!',
                        hint: 'Comece pela farinha.',
                    },
                    {
                        itemId: 'calda',
                        after: ['ovo'],
                        line: 'Chocolate por cima do bolo!',
                        hint: 'O bolo ainda não assou.',
                    },
                    {
                        itemId: 'confeitos',
                        after: ['calda'],
                        line: 'Confeitos coloridos por cima.',
                        hint: 'Ponha a calda antes dos confeitos.',
                    },
                ],
                states: [0, 1, 2, 2, 3],
                finalLine: 'O bolo de aniversário ficou pronto!',
            },
            {
                id: 'piquenique',
                name: 'Arrumar o piquenique',
                sheetKey: 'itens-n1-b',
                finalKey: 'final-n1',
                brief: 'Corte a tarefa no meio: um painel leva a comida, o outro a brincadeira.',
                map: MAP_PIQUENIQUE,
                items: [
                    { id: 'sanduiche', name: 'Sanduíche', label: 'O sanduíche', frame: 0, jobId: 'comida' },
                    { id: 'suco', name: 'Suco', label: 'O suco', frame: 1, jobId: 'comida' },
                    { id: 'maca', name: 'Maçã', label: 'A maçã', frame: 2, jobId: 'comida' },
                    { id: 'uvas', name: 'Uvas', label: 'As uvas', frame: 3, jobId: 'comida' },
                    { id: 'bola', name: 'Bola de jogar', label: 'A bola', frame: 4, jobId: 'brincadeira' },
                    { id: 'bambole', name: 'Bambolê de rodar', label: 'O bambolê', frame: 5, jobId: 'brincadeira' },
                    { id: 'pipa', name: 'Pipa de empinar', label: 'A pipa', frame: 6, jobId: 'brincadeira' },
                    { id: 'corda', name: 'Corda de pular', label: 'A corda', frame: 7, jobId: 'brincadeira' },
                ],
                jobs: [
                    { id: 'comida', name: 'Comida', partOf: 'da comida' },
                    { id: 'brincadeira', name: 'Brincadeira', partOf: 'da brincadeira' },
                ],
                /*
                 * Sem `after` nenhum: aqui a ordem é livre de propósito. É o
                 * contraponto do bolo, e é o "outra combinação poderia
                 * intercalar os passos" do texto da habilidade.
                 */
                steps: [
                    { itemId: 'sanduiche', line: 'O sanduíche, no meio da toalha.', hint: '' },
                    { itemId: 'suco', line: 'O suco, geladinho, do lado.', hint: '' },
                    { itemId: 'maca', line: 'A maçã foi para a cesta.', hint: '' },
                    { itemId: 'uvas', line: 'As uvas também.', hint: '' },
                    { itemId: 'bola', line: 'A bola já está no gramado.', hint: '' },
                    { itemId: 'bambole', line: 'O bambolê, encostado na árvore.', hint: '' },
                    { itemId: 'pipa', line: 'A pipa, pronta para voar.', hint: '' },
                    { itemId: 'corda', line: 'E a corda de pular, esperando.', hint: '' },
                ],
                states: [4, 5, 5, 5, 6, 6, 6, 6, 7],
                finalLine: 'O piquenique ficou pronto!',
            },
        ],
    },
    {
        level: 2,
        name: 'O café da manhã',
        tasks: [TASK_SANDUICHE, TASK_CAFE],
    },
    {
        level: 3,
        name: 'Acampar no quintal',
        tasks: [TASK_FOGUEIRA, TASK_BARRACA],
    },
]

/**
 * Cada tarefa vale três etapas de progresso: duas viagens e o fecho.
 *
 * O fecho é a fase final nas tarefas comuns e a última estação nas tarefas com
 * estação — em ambos os casos, uma etapa.
 */
export const stagesInLevel = (level: LevelDef) => level.tasks.length * 3
