import type { LevelConfig, TileKind, WorldState } from '../types'

const at = (c: number, r: number) => ({ c, r })

const TILE: Record<string, TileKind> = {
    a: 'asfalto',
    c: 'calcada',
    g: 'grama',
}

const mapa = (...rows: string[]) => ({
    width: rows[0].length,
    height: rows.length,
    tiles: rows.flatMap(r => [...r].map(ch => TILE[ch])),
})

const S = (o: Partial<WorldState> = {}): WorldState => ({
    semaforoVerde: true,
    portaAberta: true,
    chovendo: false,
    temChave: true,
    caminhoLivre: true,
    ...o,
})

const RUA = mapa(
    'ggggg',
    'ccccc',
    'aaaaa',
    'ccccc',
    'ggggg',
)

const QUADRA = mapa(
    'ggggg',
    'ccccc',
    'accca',
    'ccccc',
    'ggggg',
)

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        title: 'Qual caminho o SE escolhe?',
        objective: 'O programa já está pronto. Olhe a cidade e diga qual ramo vai rodar: ENTÃO ou SENÃO.',
        tip: 'A condição é uma pergunta. Se a resposta for sim, roda o ENTÃO. Se for não, roda o SENÃO.',
        challenges: [
            {
                id: 'l1-c1',
                mode: 'prever-decisao',
                ...RUA,
                props: [
                    { kind: 'semaforo', at: at(3, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                    scenarios: [S({ semaforoVerde: true }), S({ semaforoVerde: false })],
                given: [
                    {
                        kind: 'se', condition: 'semaforo_verde',
                        entao: ['andar', 'andar'],
                        senao: ['esperar', 'andar', 'andar'],
                    },
                ],
                solution: [
                    {
                        kind: 'se', condition: 'semaforo_verde',
                        entao: ['andar', 'andar'],
                        senao: ['esperar', 'andar', 'andar'],
                    },
                ],
                explanation: 'A mesma regra serve para os dois casos: com verde ela atravessa direto; com vermelho ela espera primeiro e só depois atravessa.',
            },
            {
                id: 'l1-c2',
                mode: 'prever-decisao',
                ...RUA,
                props: [
                    { kind: 'porta', at: at(2, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ portaAberta: false }), S({ portaAberta: true })],
                given: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: 'porta_aberta', entao: ['andar'], senao: ['abrir', 'andar'] },
                ],
                solution: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: 'porta_aberta', entao: ['andar'], senao: ['abrir', 'andar'] },
                ],
                explanation: 'O passo antes do SE sempre acontece. Só depois dele o programa olha para a porta e decide.',
            },
            {
                id: 'l1-c3',
                mode: 'prever-decisao',
                ...RUA,
                props: [
                    { kind: 'item', at: at(2, 3), item: 'guarda-chuva' },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ chovendo: true }), S({ chovendo: false })],
                given: [
                    { kind: 'se', condition: 'chovendo', entao: ['pegar'], senao: ['esperar'] },
                    { kind: 'acao', action: 'andar' },
                    { kind: 'acao', action: 'andar' },
                ],
                solution: [
                    { kind: 'se', condition: 'chovendo', entao: ['pegar'], senao: ['esperar'] },
                    { kind: 'acao', action: 'andar' },
                    { kind: 'acao', action: 'andar' },
                ],
                explanation: 'Os dois passos depois do SE rodam sempre. O que muda é só o que acontece dentro da decisão.',
            },
            {
                id: 'l1-c4',
                mode: 'prever-decisao',
                ...RUA,
                props: [
                    { kind: 'porta', at: at(2, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ temChave: true, portaAberta: false }), S({ temChave: false, portaAberta: true })],
                given: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: 'tem_chave', entao: ['abrir', 'andar'], senao: ['andar'] },
                ],
                solution: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: 'tem_chave', entao: ['abrir', 'andar'], senao: ['andar'] },
                ],
                explanation: 'Aqui a condição não olha para a cidade, e sim para a mochila. Sem a chave, sobra o SENÃO.',
            },
        ],
    },

    // ═════════════════════════════════════════════════════════════════════
    //  NÍVEL 2 — a criança escolhe a condição entre três
    // ═════════════════════════════════════════════════════════════════════
    {
        level: 2,
        title: 'Escolha a pergunta certa',
        objective: 'Os dois ramos já estão prontos. Falta a condição — e ela precisa funcionar em TODOS os cenários.',
        tip: 'Um cenário só não basta. Teste a pergunta contra os dois.',
        challenges: [
            {
                id: 'l2-c1',
                mode: 'escolher-condicao',
                ...RUA,
                props: [
                    { kind: 'semaforo', at: at(3, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ semaforoVerde: true }), S({ semaforoVerde: false })],
                given: [
                    { kind: 'se', condition: null, entao: ['andar', 'andar'], senao: ['esperar', 'andar', 'andar'] },
                ],
                conditionOptions: ['chovendo', 'semaforo_verde', 'tem_chave'],
                solution: [
                    { kind: 'se', condition: 'semaforo_verde', entao: ['andar', 'andar'], senao: ['esperar', 'andar', 'andar'] },
                ],
                explanation: 'Só a pergunta sobre o semáforo enxerga a diferença entre os dois cenários. As outras davam sempre a mesma resposta.',
            },
            {
                id: 'l2-c2',
                mode: 'escolher-condicao',
                ...RUA,
                props: [
                    { kind: 'porta', at: at(2, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ portaAberta: true }), S({ portaAberta: false })],
                given: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: null, entao: ['andar'], senao: ['abrir', 'andar'] },
                ],
                conditionOptions: ['porta_aberta', 'semaforo_verde', 'caminho_livre'],
                solution: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: 'porta_aberta', entao: ['andar'], senao: ['abrir', 'andar'] },
                ],
                explanation: 'Abrir uma porta que já estava aberta trava o programa. Por isso a pergunta tem que ser sobre a porta.',
            },
            {
                id: 'l2-c3',
                mode: 'escolher-condicao',
                ...QUADRA,
                props: [
                    { kind: 'pedra', at: at(2, 2) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ caminhoLivre: true }), S({ caminhoLivre: false })],
                given: [
                    {
                        kind: 'se', condition: null,
                        entao: ['andar', 'andar'],
                        senao: ['virar-dir', 'andar', 'virar-esq', 'andar', 'andar', 'virar-esq', 'andar', 'virar-dir'],
                    },
                ],
                conditionOptions: ['tem_chave', 'chovendo', 'caminho_livre'],
                solution: [
                    {
                        kind: 'se', condition: 'caminho_livre',
                        entao: ['andar', 'andar'],
                        senao: ['virar-dir', 'andar', 'virar-esq', 'andar', 'andar', 'virar-esq', 'andar', 'virar-dir'],
                    },
                ],
                explanation: 'O desvio é longo e só compensa quando a pedra está lá. A condição decide qual dos dois caminhos vale a pena.',
            },
            {
                id: 'l2-c4',
                mode: 'escolher-condicao',
                ...RUA,
                props: [
                    { kind: 'item', at: at(2, 3), item: 'guarda-chuva' },
                    { kind: 'semaforo', at: at(3, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ chovendo: true }), S({ chovendo: false })],
                given: [
                    { kind: 'se', condition: null, entao: ['pegar', 'andar', 'andar'], senao: ['andar', 'andar'] },
                ],
                conditionOptions: ['chovendo', 'porta_aberta', 'caminho_livre'],
                solution: [
                    { kind: 'se', condition: 'chovendo', entao: ['pegar', 'andar', 'andar'], senao: ['andar', 'andar'] },
                ],
                explanation: 'Repare que "andar, andar" aparece nos dois ramos. O que a condição decide é só se o guarda-chuva entra na mochila antes.',
            },
        ],
    },

    // ═════════════════════════════════════════════════════════════════════
    //  NÍVEL 3 — a criança monta o programa inteiro
    // ═════════════════════════════════════════════════════════════════════
    {
        level: 3,
        title: 'Monte o programa',
        objective: 'Sequência, repetição e decisão nas suas mãos. O programa precisa funcionar em todos os cenários.',
        tip: 'Ações que valem sempre ficam fora do SE. Só o que muda entra nos ramos.',
        challenges: [
            {
                id: 'l3-c1',
                mode: 'montar-programa',
                ...RUA,
                props: [
                    { kind: 'semaforo', at: at(3, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ semaforoVerde: true }), S({ semaforoVerde: false })],
                allowedActions: ['andar', 'esperar', 'virar-esq', 'virar-dir'],
                allowedConditions: ['semaforo_verde', 'chovendo', 'tem_chave'],
                maxStatements: 2,
                allowRepeat: false,
                solution: [
                    { kind: 'se', condition: 'semaforo_verde', entao: ['andar', 'andar'], senao: ['esperar', 'andar', 'andar'] },
                ],
                explanation: 'Um SE só, com a pergunta certa, resolve os dois cenários de uma vez.',
            },
            {
                id: 'l3-c2',
                mode: 'montar-programa',
                ...RUA,
                props: [
                    { kind: 'porta', at: at(2, 1) },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [S({ portaAberta: false, temChave: true }), S({ portaAberta: true, temChave: true })],
                allowedActions: ['andar', 'abrir', 'esperar', 'pegar'],
                allowedConditions: ['porta_aberta', 'tem_chave', 'chovendo'],
                maxStatements: 3,
                allowRepeat: false,
                solution: [
                    { kind: 'acao', action: 'andar' },
                    { kind: 'se', condition: 'porta_aberta', entao: ['andar'], senao: ['abrir', 'andar'] },
                ],
                explanation: 'O primeiro passo é igual nos dois cenários, então ficou fora do SE. Dentro dele só entrou o que muda.',
            },
            {
                id: 'l3-c3',
                mode: 'montar-programa',
                ...mapa(
                    'ggggg',
                    'ccccc',
                    'aaaaa',
                    'aaaaa',
                    'ccccc',
                ),
                props: [
                    { kind: 'semaforo', at: at(3, 1) },
                ],
                start: at(2, 4), startDir: 0, goal: at(2, 1),
                scenarios: [S({ semaforoVerde: true }), S({ semaforoVerde: false })],
                allowedActions: ['andar', 'esperar'],
                allowedConditions: ['semaforo_verde', 'caminho_livre'],
                maxStatements: 3,
                allowRepeat: true,
                solution: [
                    { kind: 'se', condition: 'semaforo_verde', entao: ['andar'], senao: ['esperar', 'andar'] },
                    { kind: 'repita', times: 2, corpo: ['andar'] },
                ],
                explanation: 'A avenida tem três faixas iguais. Em vez de repetir "andar" três vezes, o laço faz o trabalho.',
            },
            {
                id: 'l3-c4',
                mode: 'montar-programa',
                ...RUA,
                props: [
                    { kind: 'semaforo', at: at(3, 1) },
                    { kind: 'item', at: at(2, 3), item: 'guarda-chuva' },
                ],
                start: at(2, 3), startDir: 0, goal: at(2, 1),
                scenarios: [
                    S({ chovendo: true, semaforoVerde: false }),
                    S({ chovendo: false, semaforoVerde: true }),
                    S({ chovendo: true, semaforoVerde: true }),
                ],
                allowedActions: ['andar', 'esperar', 'pegar'],
                allowedConditions: ['chovendo', 'semaforo_verde', 'tem_chave'],
                maxStatements: 3,
                allowRepeat: false,
                solution: [
                    { kind: 'se', condition: 'chovendo', entao: ['pegar'], senao: ['esperar'] },
                    { kind: 'se', condition: 'semaforo_verde', entao: ['andar', 'andar'], senao: ['esperar', 'andar', 'andar'] },
                ],
                explanation: 'Duas decisões seguidas, uma para a chuva e outra para o semáforo. Cada uma olha para a sua própria pergunta.',
            },
        ],
    },
]