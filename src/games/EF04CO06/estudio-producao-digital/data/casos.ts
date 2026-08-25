import { ACERVO } from './formatos'
import type { Level } from '../types'

/**
 * Os nove trabalhos.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  texto ilustrado    → uma mídia só, com parte da peça já montada
 *   N2  slides e vídeo     → as ferramentas próprias de cada mídia
 *   N3  projeto autoral    → escolher a mídia, e aí produzir
 *
 * Toda opção ruim tem uma crítica CONCRETA. "Está errado" mandaria a criança
 * chutar; "COISAS LEGAIS não diz do que se trata" ensina o que um título faz.
 */

export const LEVELS: Level[] = [

    /* ───────────────────────────────── NÍVEL 1 — texto ilustrado */
    {
        level: 1,
        title: 'Oficina do texto ilustrado',
        objective: 'Quem lê precisa entender na primeira olhada de que aquilo se trata.',
        tip: 'Um passo de cada vez. Leia o pedido embaixo e escolha o que combina com ele.',
        escolhe: false,
        cases: [
            {
                id: 'e1-1', formato: 'texto',
                briefing: 'O pátio vive com o lixo todo misturado. A escola quer um cartaz que ensine a separar.',
                publico: 'Quem passa pelo pátio, andando',
                pronto: [{ slot: 0, opcao: 0 }],
                slots: [
                    {
                        papel: 'TÍTULO', tipo: 'texto',
                        opcoes: [
                            { valor: 'SEPARE O SEU LIXO', bom: true },
                            {
                                valor: 'COISAS LEGAIS', bom: false,
                                critica: 'COISAS LEGAIS não diz do que se trata. Quem passa andando não vai parar para descobrir.',
                            },
                            {
                                valor: 'AVISO', bom: false,
                                critica: 'Aviso de quê? O título é a primeira coisa lida: ele precisa entregar o assunto.',
                            },
                        ],
                    },
                    {
                        papel: 'IMAGEM', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.lixeiras, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'O gatinho é o mais bonito do acervo, e não tem nada a ver com separar lixo. Bonito não é o mesmo que adequado.',
                            },
                            {
                                valor: ACERVO.quadra, bom: false,
                                critica: 'A quadra não mostra nada sobre coleta seletiva. A imagem tem que mostrar o assunto.',
                            },
                        ],
                    },
                    {
                        papel: 'FRASE', tipo: 'texto',
                        opcoes: [
                            { valor: 'Papel no azul. Plástico no vermelho.', bom: true },
                            {
                                valor: 'Obrigado!', bom: false,
                                critica: 'Agradecer não ensina ninguém a separar. O cartaz existe para ensinar.',
                            },
                            {
                                valor: 'Não faça bagunça.', bom: false,
                                critica: 'Vago demais. Diga exatamente o que fazer, e não o que não fazer.',
                            },
                        ],
                    },
                ],
                successLine: 'Título que entrega o assunto, imagem que mostra, frase que ensina. Cartaz resolvido.',
            },
            {
                id: 'e1-2', formato: 'texto',
                briefing: 'A turma plantou uma horta e as mudas são pequenas. Precisa avisar as outras turmas para não pisarem nos canteiros.',
                publico: 'As outras turmas da escola',
                pronto: [{ slot: 1, opcao: 0 }],
                slots: [
                    {
                        papel: 'TÍTULO', tipo: 'texto',
                        opcoes: [
                            { valor: 'CUIDADO: HORTA NOVA', bom: true },
                            {
                                valor: 'OI, GENTE!', bom: false,
                                critica: 'Cumprimento não é assunto. Quem lê ainda não sabe o que aconteceu.',
                            },
                            {
                                valor: 'IMPORTANTE', bom: false,
                                critica: 'Importante o quê? Falta justamente a parte que importa.',
                            },
                        ],
                    },
                    {
                        papel: 'IMAGEM', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.horta, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'De novo o gatinho. Ele continua fofo e continua sem relação com a horta.',
                            },
                            {
                                valor: ACERVO.lixeiras, bom: false,
                                critica: 'As lixeiras são de outro projeto. Quem ler vai achar que o bilhete é sobre lixo.',
                            },
                        ],
                    },
                    {
                        papel: 'RECADO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Plantamos mudas nos canteiros. Não pise: elas ainda são pequenas.', bom: true },
                            {
                                valor: 'A horta ficou muito legal.', bom: false,
                                critica: 'Isso não pede nada. O bilhete existe para pedir um cuidado.',
                            },
                            {
                                valor: 'Tomem cuidado por favor.', bom: false,
                                critica: 'Cuidado com o quê? Sem dizer o que evitar, ninguém consegue obedecer.',
                            },
                        ],
                    },
                ],
                successLine: 'Um bilhete que diz o que houve e o que fazer. É isso que separa recado de conversa.',
            },
            {
                id: 'e1-3', formato: 'texto',
                briefing: 'A festa junina é sábado, às 15h, no pátio. A escola quer um convite para as famílias.',
                publico: 'As famílias dos alunos',
                slots: [
                    {
                        papel: 'TÍTULO', tipo: 'texto',
                        opcoes: [
                            { valor: 'FESTA JUNINA DA ESCOLA', bom: true },
                            {
                                valor: 'VENHAM!', bom: false,
                                critica: 'Venham para onde, fazer o quê? O convite começa dizendo o que é.',
                            },
                            {
                                valor: 'SÁBADO', bom: false,
                                critica: 'Sábado é a data, não o assunto. A data vai no corpo do convite.',
                            },
                        ],
                    },
                    {
                        papel: 'IMAGEM', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.festa, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'O gatinho não vai à festa. A imagem precisa mostrar do que a festa é.',
                            },
                            {
                                valor: ACERVO.horta, bom: false,
                                critica: 'A horta é bonita, mas o convite é da festa. A família vai chegar esperando outra coisa.',
                            },
                        ],
                    },
                    {
                        papel: 'QUANDO E ONDE', tipo: 'texto',
                        opcoes: [
                            { valor: 'Sábado, às 15h, no pátio da escola.', bom: true },
                            {
                                valor: 'Vai ser muito divertido!', bom: false,
                                critica: 'Convite sem dia, hora e lugar ninguém consegue seguir.',
                            },
                            {
                                valor: 'Tragam a família toda.', bom: false,
                                critica: 'Falta o principal: quando e onde. Sem isso o convite não funciona.',
                            },
                        ],
                    },
                ],
                successLine: 'Todo convite responde três perguntas: o quê, quando e onde. O seu respondeu.',
            },
        ],
    },

    /* ────────────────────────── NÍVEL 2 — slides e vídeo */
    {
        level: 2,
        title: 'Oficinas de slides e vídeo',
        objective: 'Cada mídia tem ferramentas próprias, e cada ferramenta serve para uma coisa.',
        tip: 'Alguns passos dá para PULAR. Mas os jurados percebem quando você caprichou.',
        escolhe: false,
        cases: [
            {
                id: 'e2-1', formato: 'apresentacao',
                briefing: 'A turma vai contar sobre a horta na reunião de pais. Monte a apresentação.',
                publico: 'Os pais, na reunião, com alguém falando',
                slots: [
                    {
                        papel: 'CAPA', tipo: 'texto',
                        opcoes: [
                            { valor: 'A HORTA DA NOSSA TURMA', bom: true },
                            {
                                valor: 'APRESENTAÇÃO', bom: false,
                                critica: 'Apresentação de quê? A capa é o título do trabalho, não o nome do formato.',
                            },
                            {
                                valor: 'SLIDE 1', bom: false,
                                critica: 'Isso é o número do slide. Ninguém veio à reunião para saber o número.',
                            },
                        ],
                    },
                    {
                        papel: 'IMAGEM', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.horta, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'O gatinho de novo. Os pais vieram ver a horta.',
                            },
                            {
                                valor: ACERVO.quadra, bom: false,
                                critica: 'A quadra é de outro projeto da escola.',
                            },
                        ],
                    },
                    {
                        papel: 'TÓPICOS', tipo: 'texto',
                        opcoes: [
                            { valor: 'O que plantamos · Quem rega · O que já colhemos', bom: true },
                            {
                                valor: 'Muitas coisas legais aconteceram na nossa horta neste ano todo.', bom: false,
                                critica: 'Tópico é lista curta. Texto corrido no slide faz a plateia ler em vez de ouvir.',
                            },
                            {
                                valor: 'A horta.', bom: false,
                                critica: 'Um tópico só, e sem dizer nada. Quem apresenta fica sem apoio nenhum.',
                            },
                        ],
                    },
                    {
                        papel: 'ENCERRAMENTO', tipo: 'texto', opcional: true,
                        opcoes: [
                            { valor: 'Obrigado! Venham ver a horta no pátio.', bom: true },
                            {
                                valor: 'FIM', bom: false,
                                critica: 'FIM não convida a nada. O último slide é o que fica na cabeça.',
                            },
                        ],
                    },
                ],
                successLine: 'Capa que nomeia, tópicos que apoiam quem fala, e um fecho que convida. Isso é uma apresentação.',
            },
            {
                id: 'e2-2', formato: 'video',
                briefing: 'A escola quer um vídeo curto para passar na tela do intervalo, ensinando a separar o lixo.',
                publico: 'Os alunos, de passagem, no intervalo',
                slots: [
                    {
                        papel: 'CENA', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.lixeiras, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'Todo mundo vai olhar o gatinho e ninguém vai lembrar das lixeiras.',
                            },
                            {
                                valor: ACERVO.festa, bom: false,
                                critica: 'A festa não ensina nada sobre lixo. A cena é o que a pessoa vê enquanto ouve.',
                            },
                        ],
                    },
                    {
                        papel: 'NARRAÇÃO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Papel no azul. Plástico no vermelho. Só isso.', bom: true },
                            {
                                valor: 'Oi gente, tudo bem? Então, hoje a gente vai falar sobre...', bom: false,
                                critica: 'Vídeo de intervalo não tem tempo para enrolar. Comece pelo que interessa.',
                            },
                            {
                                valor: 'Separe.', bom: false,
                                critica: 'Separe o quê, onde? Curto demais deixa de ensinar.',
                            },
                        ],
                    },
                    {
                        papel: 'TRANSIÇÃO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Corte seco entre as cenas', bom: true },
                            {
                                valor: 'Girar, piscar e explodir', bom: false,
                                critica: 'Transição chamativa demais rouba a atenção justamente do que você quer ensinar.',
                            },
                            {
                                valor: 'Nenhuma: as cenas grudam', bom: false,
                                critica: 'Sem nenhuma marca de troca, ninguém percebe que a cena mudou.',
                            },
                        ],
                    },
                    {
                        papel: 'TRILHA', tipo: 'texto', opcional: true,
                        opcoes: [
                            { valor: 'Música baixinha, sem letra', bom: true },
                            {
                                valor: 'Música alta, com letra', bom: false,
                                critica: 'A letra da música briga com a narração. Quem assiste não entende nenhuma das duas.',
                            },
                        ],
                    },
                ],
                successLine: 'Cena que mostra, narração que vai direto, corte que não atrapalha. Vinte segundos bem gastos.',
            },
            {
                id: 'e2-3', formato: 'video',
                briefing: 'Um vídeo de vinte segundos convidando as famílias para a festa junina. Vai no celular delas.',
                publico: 'As famílias, no celular, sem som às vezes',
                slots: [
                    {
                        papel: 'CENA', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.festa, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'Última chance do gatinho, e ele continua sem ter ido a festa nenhuma.',
                            },
                            {
                                valor: ACERVO.quadra, bom: false,
                                critica: 'A quadra vazia não parece festa. A família vai achar que é outro evento.',
                            },
                        ],
                    },
                    {
                        papel: 'NARRAÇÃO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Sábado, quinze horas, no pátio. Venham!', bom: true },
                            {
                                valor: 'Vai ter festa na escola.', bom: false,
                                critica: 'Sem dia, hora e lugar, ninguém consegue ir. Convite precisa dos três.',
                            },
                            {
                                valor: 'A nossa escola tem uma história muito bonita que começou há muitos anos.', bom: false,
                                critica: 'Vinte segundos não cabem uma história. Cabe um convite.',
                            },
                        ],
                    },
                    {
                        papel: 'TRANSIÇÃO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Fade suave', bom: true },
                            {
                                valor: 'Flashes piscando forte', bom: false,
                                critica: 'Piscada forte incomoda, e pode passar mal quem assiste. Transição não é enfeite.',
                            },
                            {
                                valor: 'Nenhuma: as cenas grudam', bom: false,
                                critica: 'Sem marca de troca, o vídeo parece um erro em vez de uma escolha.',
                            },
                        ],
                    },
                    {
                        papel: 'LEGENDA', tipo: 'texto', opcional: true,
                        opcoes: [
                            { valor: 'SÁBADO · 15H · PÁTIO', bom: true },
                            {
                                valor: 'Festa!', bom: false,
                                critica: 'A legenda serve para quem assiste sem som. Ela precisa carregar a informação.',
                            },
                        ],
                    },
                ],
                successLine: 'Com legenda, o convite funciona mesmo mudo — e no celular, quase sempre está mudo.',
            },
        ],
    },

    /* ─────────────────────────── NÍVEL 3 — o projeto autoral */
    {
        level: 3,
        title: 'Projeto autoral',
        objective: 'Antes de produzir, decidir: cada pedido pede uma mídia diferente.',
        tip: 'Antes de tudo, escolha a mídia. Quem vai ver, e onde? É isso que decide.',
        escolhe: true,
        cases: [
            {
                id: 'e3-1', formato: 'texto',
                briefing: 'A escola marcou um torneio na quadra e precisa avisar todo mundo hoje, no mural do corredor.',
                publico: 'Quem passa no corredor entre uma aula e outra',
                porque: {
                    apresentacao: 'Apresentação precisa de alguém apresentando. No mural não tem ninguém falando.',
                    video: 'No mural do corredor não existe botão de play. O vídeo não seria visto.',
                },
                slots: [
                    {
                        papel: 'TÍTULO', tipo: 'texto',
                        opcoes: [
                            { valor: 'TORNEIO NA QUADRA', bom: true },
                            {
                                valor: 'NOVIDADE!', bom: false,
                                critica: 'Novidade não é assunto. No corredor a pessoa lê de passagem: entregue logo o que é.',
                            },
                            {
                                valor: 'LEIAM ISTO', bom: false,
                                critica: 'Pedir para ler não faz ninguém ler. Dizer o assunto, sim.',
                            },
                        ],
                    },
                    {
                        papel: 'IMAGEM', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.quadra, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'O gatinho não joga. A imagem tem que mostrar onde o torneio acontece.',
                            },
                            {
                                valor: ACERVO.festa, bom: false,
                                critica: 'A festa junina é outro evento. Duas festas no mural confundem a escola inteira.',
                            },
                        ],
                    },
                    {
                        papel: 'QUANDO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Quinta-feira, no recreio, na quadra.', bom: true },
                            {
                                valor: 'Em breve.', bom: false,
                                critica: 'Em breve não é data. Ninguém consegue se organizar com isso.',
                            },
                            {
                                valor: 'Vai ser demais!', bom: false,
                                critica: 'Empolgação não é informação. Falta dizer quando.',
                            },
                        ],
                    },
                ],
                successLine: 'Mural pede coisa que se lê parada e de longe. Cartaz foi a escolha certa.',
            },
            {
                id: 'e3-2', formato: 'apresentacao',
                briefing: 'A turma quer mostrar aos pais, na reunião, tudo o que fez no ano — com imagem e por partes, para poder conversar em cada uma.',
                publico: 'Os pais, sentados, com a professora conduzindo',
                porque: {
                    texto: 'Um ano inteiro não cabe num cartaz. E cartaz não se divide em partes para conversar.',
                    video: 'Vídeo passa e não volta. Na reunião é preciso parar em cada parte e conversar.',
                },
                slots: [
                    {
                        papel: 'CAPA', tipo: 'texto',
                        opcoes: [
                            { valor: 'O QUE A NOSSA TURMA FEZ ESTE ANO', bom: true },
                            {
                                valor: 'REUNIÃO DE PAIS', bom: false,
                                critica: 'Os pais já sabem que é a reunião. A capa é o assunto do trabalho.',
                            },
                            {
                                valor: 'OLÁ', bom: false,
                                critica: 'Cumprimento não é capa. A capa precisa dizer sobre o que é.',
                            },
                        ],
                    },
                    {
                        papel: 'IMAGEM', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.horta, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'O gatinho não estudou com vocês este ano.',
                            },
                            {
                                valor: ACERVO.lixeiras, bom: false,
                                critica: 'Lixeiras sozinhas não mostram o que a turma fez. Escolha uma imagem do trabalho de vocês.',
                            },
                        ],
                    },
                    {
                        papel: 'TÓPICOS', tipo: 'texto',
                        opcoes: [
                            { valor: 'A horta · O torneio · A festa junina', bom: true },
                            {
                                valor: 'Foi um ano muito bom e a gente aprendeu bastante coisa nova.', bom: false,
                                critica: 'Texto corrido no slide faz a plateia ler em silêncio em vez de ouvir vocês.',
                            },
                            {
                                valor: 'Várias coisas', bom: false,
                                critica: 'Várias quais? Tópico serve para dividir a conversa em partes.',
                            },
                        ],
                    },
                    {
                        papel: 'ENCERRAMENTO', tipo: 'texto', opcional: true,
                        opcoes: [
                            { valor: 'Perguntas? A gente adora contar.', bom: true },
                            {
                                valor: 'Acabou.', bom: false,
                                critica: 'O último slide fica na tela enquanto os pais conversam. Aproveite ele.',
                            },
                        ],
                    },
                ],
                successLine: 'Slides deixam parar em cada parte. Numa reunião, isso vale mais do que qualquer efeito.',
            },
            {
                id: 'e3-3', formato: 'video',
                briefing: 'A escola quer ensinar a separar o lixo mostrando os passos, numa tela que fica ligada no intervalo.',
                publico: 'Alunos de passagem, tela ligada sozinha',
                porque: {
                    texto: 'Passo a passo em cartaz vira uma parede de texto que ninguém lê de passagem.',
                    apresentacao: 'Na tela do intervalo não tem ninguém para clicar e passar o slide.',
                },
                slots: [
                    {
                        papel: 'CENA', tipo: 'imagem',
                        opcoes: [
                            { valor: ACERVO.lixeiras, bom: true },
                            {
                                valor: ACERVO.gato, bom: false,
                                critica: 'O gatinho encerra a carreira aqui: continua fofo, continua fora do assunto.',
                            },
                            {
                                valor: ACERVO.horta, bom: false,
                                critica: 'A horta é sobre plantar, não sobre separar lixo.',
                            },
                        ],
                    },
                    {
                        papel: 'NARRAÇÃO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Primeiro: olhe o material. Depois: a cor da lixeira. Pronto.', bom: true },
                            {
                                valor: 'É importante cuidar do planeta e do meio ambiente sempre.', bom: false,
                                critica: 'Verdade, mas não ensina o passo a passo que o pedido pediu.',
                            },
                            {
                                valor: 'Joguem certo!', bom: false,
                                critica: 'Certo como? O vídeo foi feito justamente para mostrar como.',
                            },
                        ],
                    },
                    {
                        papel: 'TRANSIÇÃO', tipo: 'texto',
                        opcoes: [
                            { valor: 'Corte seco, um passo por vez', bom: true },
                            {
                                valor: 'Tudo ao mesmo tempo na tela', bom: false,
                                critica: 'Passo a passo com tudo junto deixa de ser passo a passo.',
                            },
                            {
                                valor: 'Girar e explodir a cada troca', bom: false,
                                critica: 'O efeito vira o assunto, e o assunto some.',
                            },
                        ],
                    },
                    {
                        papel: 'LEGENDA', tipo: 'texto', opcional: true,
                        opcoes: [
                            { valor: 'PASSO 1 · PASSO 2 · PRONTO', bom: true },
                            {
                                valor: 'Vídeo da escola', bom: false,
                                critica: 'A legenda podia repetir os passos para quem assiste sem som. Ela está desperdiçada.',
                            },
                        ],
                    },
                ],
                successLine: 'Tela que roda sozinha pede vídeo. E passo a passo pede um corte por passo.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)
