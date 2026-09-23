import type { LevelDef } from '../types'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        waves: [
            {
                id: 'endereco',
                movement: 'still',
                cards: [
                    {
                        id: 'endereco-premio',
                        message: 'Mandar meu endereço para ganhar um prêmio.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'address',
                        note: 'O endereço mostraria a desconhecidos onde você mora.',
                    },
                    {
                        id: 'desenho-professora',
                        message: 'Enviar meu desenho para a professora.',
                        destination: 'PROFESSORA',
                        owner: 'self',
                        audience: 'teacher',
                        kind: 'school-work',
                        note: 'O desenho é seu e vai para a professora num espaço fechado.',
                    },
                ],
            },
            {
                id: 'telefone',
                movement: 'still',
                cards: [
                    {
                        id: 'telefone-desconhecido',
                        message: 'Dar meu telefone para alguém que não conheço.',
                        destination: 'PESSOA DESCONHECIDA',
                        owner: 'self',
                        audience: 'unknown',
                        kind: 'phone',
                        note: 'Um desconhecido poderia ligar ou mandar mensagens para você.',
                    },
                    {
                        id: 'animal-turma',
                        message: 'Contar meu animal favorito no grupo da turma.',
                        destination: 'GRUPO DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'preference',
                        note: 'Um gosto seu no grupo da turma não diz onde você está.',
                    },
                ],
            },
            {
                id: 'localizacao',
                movement: 'still',
                cards: [
                    {
                        id: 'localizacao-publica',
                        message: 'Mostrar onde estou agora no meu perfil público.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'live-location',
                        note: 'Qualquer pessoa saberia onde você está neste momento.',
                    },
                    {
                        id: 'experimento-site',
                        message: 'Postar o experimento sem mostrar rostos.',
                        destination: 'SITE DA ESCOLA',
                        owner: 'self',
                        audience: 'school-site',
                        kind: 'school-work',
                        note: 'O trabalho não tem rostos e o site é da escola.',
                    },
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 2 — TRÊS PLACAS, E ELAS NÃO PARAM MAIS
     * ══════════════════════════════════════════════════════════════════════
     *
     * O dado continua sendo da própria criança; o que muda é que agora o
     * DESTINO decide o risco. O mesmo trabalho de escola é seguro no site da
     * escola e a mesma rotina é perigosa no perfil público.
     *
     * Duas ondas de vaivém e a terceira em carrossel, que é quando a placa
     * some por uma borda e volta pela outra.
     *
     * Nenhuma onda repete o mesmo pictograma: dois ícones iguais na tela
     * mandariam a criança comparar desenho em vez de ler o que está escrito.
     */
    {
        level: 2,
        waves: [
            {
                id: 'rotina',
                movement: 'horizontal',
                cards: [
                    {
                        id: 'horario-publico',
                        message: 'Contar meu horário de saída da escola no perfil público.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'school-routine',
                        note: 'Quem vê o perfil saberia onde e a que horas te encontrar.',
                    },
                    {
                        id: 'desenho-mural',
                        message: 'Postar meu desenho no mural fechado da turma.',
                        destination: 'MURAL DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'school-work',
                        note: 'O desenho é seu e o mural da turma é um espaço fechado.',
                    },
                    {
                        id: 'time-turma',
                        message: 'Contar meu esporte favorito no grupo da turma.',
                        destination: 'GRUPO DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'preference',
                        note: 'Um gosto seu no grupo da turma não diz onde você está.',
                    },
                ],
            },
            {
                id: 'casa',
                movement: 'horizontal',
                cards: [
                    {
                        id: 'fachada-grupo-aberto',
                        message: 'Postar a foto da frente da minha casa em grupo aberto.',
                        destination: 'GRUPO ABERTO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'address',
                        note: 'A fachada mostra a estranhos exatamente onde você mora.',
                    },
                    {
                        id: 'artes-site',
                        message: 'Mostrar meu trabalho de artes no site da escola.',
                        destination: 'SITE DA ESCOLA',
                        owner: 'self',
                        audience: 'school-site',
                        kind: 'school-work',
                        note: 'O trabalho é seu e o site da escola é um lugar cuidado.',
                    },
                    {
                        id: 'duvida-professora',
                        message: 'Mandar uma dúvida da lição para a professora.',
                        destination: 'PROFESSORA',
                        owner: 'self',
                        audience: 'teacher',
                        kind: 'preference',
                        note: 'Perguntar para a professora é conversa de escola.',
                    },
                ],
            },
            {
                id: 'carro',
                movement: 'carousel',
                cards: [
                    {
                        id: 'placa-carro',
                        message: 'Postar a foto da placa do carro da família em público.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'vehicle-plate',
                        note: 'A placa do carro ajuda estranhos a seguir a sua família.',
                    },
                    {
                        id: 'maquete-site',
                        message: 'Postar a foto da minha maquete no site da escola.',
                        destination: 'SITE DA ESCOLA',
                        owner: 'self',
                        audience: 'school-site',
                        kind: 'school-work',
                        note: 'A maquete é um trabalho seu e não mostra pessoas.',
                    },
                    {
                        id: 'cor-favorita',
                        message: 'Dizer minha cor favorita no grupo da turma.',
                        destination: 'GRUPO DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'preference',
                        note: 'Uma cor favorita não mostra onde você mora ou estuda.',
                    },
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — DADO DOS OUTROS, E A PLACA VEM COBERTA
     * ══════════════════════════════════════════════════════════════════════
     *
     * Aqui entra a PERMISSÃO, que é a metade da EF03CO09 que os níveis 1 e 2
     * não tocam: o dado deixa de ser só seu, e o que decide não é mais o
     * destino, e sim se o dono do dado concordou.
     *
     * As placas chegam cobertas e em carrossel. Descobrir o que está escrito
     * custa um arremesso, e esse arremesso NÃO é resposta — é investigação. A
     * criança abre quantas quiser antes de acusar; o que ela não pode é acusar
     * sem ter lido, que é exatamente o hábito que o jogo quer combater.
     */
    {
        level: 3,
        covered: true,
        waves: [
            {
                id: 'foto-do-teo',
                movement: 'carousel',
                cards: [
                    {
                        id: 'foto-teo-sem-permissao',
                        message: 'Postar a foto do Téo sem a permissão dele.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'peer',
                        consent: false,
                        audience: 'public',
                        kind: 'peer-image',
                        note: 'A foto é do Téo, e ele não disse que podia ser publicada.',
                    },
                    {
                        id: 'desenho-bia-autorizado',
                        message: 'Mostrar o desenho que a Bia deixou.',
                        destination: 'SITE DA ESCOLA',
                        owner: 'peer',
                        consent: true,
                        audience: 'school-site',
                        kind: 'school-work',
                        note: 'A Bia autorizou, e o site da escola é um espaço cuidado.',
                    },
                    {
                        id: 'time-venceu',
                        message: 'Contar no grupo da turma que o nosso time venceu.',
                        destination: 'GRUPO DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'preference',
                        note: 'É uma notícia do time e não mostra dado de ninguém.',
                    },
                ],
            },
            {
                id: 'apelido-da-bia',
                movement: 'carousel',
                cards: [
                    {
                        id: 'apelido-bia',
                        message: 'Usar o apelido que a Bia não gosta.',
                        destination: 'GRUPO DA ESCOLA',
                        owner: 'peer',
                        consent: false,
                        audience: 'closed-group',
                        kind: 'peer-story',
                        note: 'O apelido é sobre a Bia, e ela não quer que seja contado.',
                    },
                    {
                        id: 'foto-grupo-autorizada',
                        message: 'Postar a foto que todos deixaram.',
                        destination: 'GRUPO DAS FAMÍLIAS',
                        owner: 'peer',
                        consent: true,
                        audience: 'closed-group',
                        kind: 'peer-image',
                        note: 'Todo mundo da foto concordou, e o grupo é conhecido.',
                    },
                    {
                        id: 'parabens-teo',
                        message: 'Dar parabéns para o Téo no grupo da turma.',
                        destination: 'GRUPO DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'preference',
                        note: 'Um parabéns não conta nenhum dado pessoal do Téo.',
                    },
                ],
            },
            {
                id: 'endereco-do-colega',
                movement: 'carousel',
                cards: [
                    {
                        id: 'endereco-teo',
                        message: 'Mandar o endereço do Téo a um estranho.',
                        destination: 'PESSOA DESCONHECIDA',
                        owner: 'peer',
                        consent: false,
                        audience: 'unknown',
                        kind: 'address',
                        note: 'O endereço é do Téo e iria para alguém que ninguém conhece.',
                    },
                    {
                        id: 'trabalho-da-dupla',
                        message: 'Enviar o trabalho da dupla, que concordou.',
                        destination: 'PROFESSORA',
                        owner: 'peer',
                        consent: true,
                        audience: 'teacher',
                        kind: 'school-work',
                        note: 'Os dois fizeram o trabalho e os dois concordaram.',
                    },
                    {
                        id: 'gincana-site',
                        message: 'Contar no site da escola que a turma ganhou a gincana.',
                        destination: 'SITE DA ESCOLA',
                        owner: 'self',
                        audience: 'school-site',
                        kind: 'preference',
                        note: 'A notícia é da turma toda e não mostra dado de ninguém.',
                    },
                ],
            },
        ],
    },
]

export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5
