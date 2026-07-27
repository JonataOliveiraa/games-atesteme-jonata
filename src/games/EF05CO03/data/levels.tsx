import type { LevelConfig } from '../types'
import { e, folha, nao, ou } from './logic'

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        title: 'Verdadeiro ou Falso',
        objective: 'Descubra se cada frase é verdadeira e faça o portão abrir.',
        phases: [
            {
                id: 'l1f1',
                kind: 'valor',
                name: 'A primeira placa',
                instruction: 'Esta frase é verdadeira ou falsa?',
                expr: folha('a', 'Cinco é maior que seis', false),
                explanation: 'Cinco vem antes do seis, então cinco é menor. A frase é falsa.',
            },
            {
                id: 'l1f2',
                kind: 'operador',
                name: 'O NÃO inverte',
                instruction: 'Agora entrou um NÃO no mecanismo.',
                expr: nao(folha('a', 'Cinco é maior que seis', false)),
                explanation: 'A frase sozinha é falsa. O NÃO inverte, então o resultado é verdadeiro.',
            },
            {
                id: 'l1f3',
                kind: 'operador',
                name: 'O E exige as duas',
                instruction: 'O E só deixa passar quando as duas partes são verdadeiras.',
                expr: e(
                    folha('a', 'Cinco é maior que dois', true),
                    folha('b', 'Cinco é menor que dez', true),
                ),
                explanation: 'As duas frases são verdadeiras, então o E deixa a energia passar.',
            },
            {
                id: 'l1f4',
                kind: 'operador',
                name: 'Ao OU basta uma',
                instruction: 'O OU abre dois caminhos. Basta um deles funcionar.',
                expr: ou(
                    folha('a', 'Cinco é maior que seis', false),
                    folha('b', 'Cinco é maior que dois', true),
                ),
                explanation: 'A primeira parte é falsa, mas a segunda é verdadeira. Para o OU, uma já basta.',
            },
        ],
    },
    {
        level: 2,
        title: 'Combinando operadores',
        objective: 'Duas peças no mesmo mecanismo. Resolva por partes, sem pressa.',
        phases: [
            {
                id: 'l2f1',
                kind: 'cadeia',
                name: 'NÃO antes do E',
                instruction: 'Resolva o NÃO primeiro e depois aplique o E.',
                showGrouping: true,
                expr: e(
                    nao(folha('a', 'Sete é um número par', false)),
                    folha('b', 'Sete é maior que cinco', true),
                ),
                explanation: 'Sete é ímpar, então a primeira frase é falsa e o NÃO a transforma em verdadeira. Com as duas partes verdadeiras, o E abre o portão.',
            },
            {
                id: 'l2f2',
                kind: 'cadeia',
                name: 'A moldura resolve primeiro',
                instruction: 'A moldura mostra qual pedaço você resolve antes.',
                showGrouping: true,
                expr: e(
                    folha('a', 'O ano tem doze meses', true),
                    ou(
                        folha('b', 'Uma hora tem cem minutos', false),
                        folha('c', 'Um minuto tem cem segundos', false),
                    ),
                ),
                explanation: 'As duas frases de dentro da moldura são falsas, então o OU também dá falso. E o E precisa das duas partes verdadeiras — o portão trava.',
            },
            {
                id: 'l2f3',
                kind: 'cadeia',
                name: 'O NÃO pega o grupo inteiro',
                instruction: 'Cuidado: o NÃO está agindo sobre a moldura toda.',
                showGrouping: true,
                expr: nao(
                    ou(
                        folha('a', 'Três é maior que oito', false),
                        folha('b', 'Três é maior que um', true),
                    ),
                ),
                explanation: 'Três é maior que um, então a segunda frase é verdadeira e o OU já dá verdadeiro. O NÃO inverte o resultado da moldura inteira, e o portão trava.',
            },
            {
                id: 'l2f4',
                kind: 'cadeia',
                name: 'Portão duplo',
                instruction: 'Resolva o E de dentro da moldura antes de olhar o OU.',
                showGrouping: true,
                expr: ou(
                    e(
                        folha('a', 'Dez é maior que dois', true),
                        folha('b', 'Dez é menor que cinco', false),
                    ),
                    folha('c', 'Dez é maior que vinte', false),
                ),
                explanation: 'O E deu falso, porque uma das partes é falsa. A última frase também é falsa. Sem nenhum caminho verdadeiro, o OU não abre o portão.',
            },
        ],
    },
    {
        level: 3,
        title: 'Cadeias da Arena',
        objective: 'Agora são três peças e o tempo está correndo. Explique o que você fez.',
        timeLimit: 60,
        phases: [
            {
                id: 'l3f1',
                kind: 'cadeia',
                name: 'Três peças',
                instruction: 'Resolva as duas molduras e junte no E.',
                showGrouping: true,
                expr: e(
                    nao(folha('a', 'O Brasil fica na Europa', false)),
                    ou(
                        folha('b', 'Um triângulo tem quatro lados', false),
                        folha('c', 'Um círculo tem quatro lados', false),
                    ),
                ),
                explanation: 'A primeira frase é falsa e o NÃO a torna verdadeira. Mas no OU as duas partes são falsas, então ele dá falso. O E precisa dos dois lados verdadeiros — o portão trava.',
            },
            {
                id: 'l3f2',
                kind: 'incognita',
                name: 'A peça escondida',
                instruction: 'Uma placa está coberta. Descubra o que ela precisa ser.',
                showGrouping: true,
                targetValue: true,
                question: 'Para o portão abrir, a placa ? precisa ser:',
                expr: e(
                    nao(folha('x', 'placa coberta', false, true)),
                    folha('a', 'Vinte é maior que dez', true),
                ),
                explanation: 'A frase da direita é verdadeira, e o E precisa dos dois lados verdadeiros. Então o NÃO tem que entregar verdadeiro — e ele só faz isso quando recebe falso.',
            },
            {
                id: 'l3f3',
                kind: 'cadeia',
                name: 'Explique a jogada',
                instruction: 'Resolva a cadeia e depois diga por que deu esse resultado.',
                showGrouping: true,
                expr: e(
                    ou(
                        folha('a', 'Uma dúzia tem doze unidades', true),
                        folha('b', 'Uma dúzia tem vinte unidades', false),
                    ),
                    nao(folha('c', 'Zero é maior que um', false)),
                ),
                explanation: 'No OU, a primeira parte é verdadeira e já basta. Do outro lado, a frase é falsa e o NÃO a inverte. Os dois lados verdadeiros fazem o E abrir o portão.',
                justify: {
                    options: [
                        'O OU deu verdadeiro porque uma parte já basta, e o NÃO virou o falso em verdadeiro',
                        'O E deu verdadeiro porque pelo menos uma das partes é verdadeira',
                        'O NÃO deu verdadeiro porque a frase dele já era verdadeira',
                    ],
                    correctIndex: 0,
                },
            },
            {
                id: 'l3f4',
                kind: 'cadeia',
                name: 'Portão-mestre',
                instruction: 'A última cadeia da arena. Resolva e explique.',
                showGrouping: true,
                expr: e(
                    nao(
                        ou(
                            folha('a', 'Cem é maior que mil', false),
                            folha('b', 'Cem é maior que duzentos', false),
                        ),
                    ),
                    folha('c', 'Cem é menor que cinquenta', false),
                ),
                explanation: 'As duas frases da moldura são falsas, o OU dá falso e o NÃO inverte para verdadeiro. Mas a última frase é falsa, e o E precisa das duas partes. O portão-mestre trava.',
                justify: {
                    options: [
                        'O NÃO deu verdadeiro, mas o E pr   ecisa dos dois lados — e o de baixo é falso',
                        'Como o NÃO deu verdadeiro, o resultado final também é verdadeiro',
                        'O E deu falso porque as duas partes que chegam nele são falsas',
                    ],
                    correctIndex: 0,
                },
            },
        ],
    },
]