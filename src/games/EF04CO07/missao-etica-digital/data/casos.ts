import { ACERVO } from './principios'
import type { Level } from '../types'

/**
 * As nove missões, com doze decisões.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  USAR       → de quem é isso? (autoria)
 *   N2  COLETAR e GUARDAR → o que a etiqueta libera? (permissão, privacidade)
 *   N3  O PROJETO  → duas decisões no mesmo arquivo, encadeadas
 *
 * ── A REGRA QUE VALE PARA OS NOVE ────────────────────────────────────────
 *
 * Toda missão tem uma opção certa, uma que passa por cima de alguém, e uma que
 * é CUIDADOSA DEMAIS — recusar o que a etiqueta libera, pedir o que já foi
 * dado, apagar o que não precisava sumir.
 *
 * Essa terceira é a mais importante do jogo. Uma criança que só aprende a
 * dizer "não" para tudo não entendeu ética digital: entendeu medo. Saber o que
 * PODE é parte da mesma habilidade.
 *
 * ── ROTULO CURTO, IMPACTO LONGO ──────────────────────────────────────────
 *
 * O `rotulo` cabe em trinta caracteres e o `impacto` não tem teto. É de
 * propósito, e é a mudança que mais mexeu na clareza: antes a criança tinha
 * que comparar três frases de quarenta caracteres ANTES de decidir — leitura
 * comparada, que aos nove anos ainda custa caro. Agora ela escolhe entre três
 * gestos curtos e recebe a frase inteira DEPOIS, quando já tem o que comparar.
 */

export const LEVELS: Level[] = [

    /* ══════════════════════════════ NÍVEL 1 — de quem é isso? */
    {
        level: 1,
        title: 'De quem é isso?',
        objective: 'Tudo que alguém fez tem um autor — e dizer o nome dele é o mínimo.',
        tip: 'Vire a ficha antes de decidir.',
        cases: [
            {
                id: 'm1-1',
                arquivo: {
                    nome: 'foguete.png', tipo: 'imagem', arte: ACERVO.desenho,
                    etiqueta: {
                        autor: 'Marina Alves',
                        permissao: 'Pode usar na escola, com crédito',
                    },
                },
                passos: [{
                    principio: 'autoria',
                    situacao: 'Você achou este desenho na internet e quer usar no seu trabalho.',
                    pergunta: 'O que você faz?',
                    acoes: [
                        {
                            rotulo: 'Uso e dou o crédito', certa: true, efeito: 'credito',
                            impacto: 'O trabalho saiu com o crédito. Marina continua sendo a autora, e agora todo mundo que ler sabe disso.',
                        },
                        {
                            rotulo: 'Uso e não falo nada', certa: false, efeito: 'semCredito',
                            impacto: 'Quem ler vai achar que o desenho é seu. Usar sem dizer de quem é tem nome: é passar por autor de uma coisa que você não fez.',
                        },
                        {
                            rotulo: 'Não uso, por via das dúvidas', certa: false, efeito: 'trava',
                            impacto: 'A etiqueta deixava usar. Deixar de usar o que é permitido não é cuidado — é só perder um bom desenho por medo.',
                        },
                    ],
                }],
                successLine: 'Crédito dado. É a coisa mais simples do mundo digital e a mais esquecida.',
            },
            {
                id: 'm1-2',
                arquivo: {
                    nome: 'trilha-alegre.mp3', tipo: 'musica', arte: ACERVO.trilha,
                    etiqueta: {
                        autor: 'Banda Pé de Vento',
                        permissao: 'Livre na escola, com o nome da banda',
                    },
                },
                passos: [{
                    principio: 'autoria',
                    situacao: 'A turma gravou um vídeo e quer uma música tocando por baixo.',
                    pergunta: 'O que você faz?',
                    acoes: [
                        {
                            rotulo: 'Uso e cito a banda', certa: true, efeito: 'credito',
                            impacto: 'A música entrou e a banda apareceu nos créditos. Foi exatamente o que a etiqueta pedia.',
                        },
                        {
                            rotulo: 'Uso: é só música de fundo', certa: false, efeito: 'semCredito',
                            impacto: 'Música de fundo também tem autor. Ela não fica sem dono por estar tocando baixinho.',
                        },
                        {
                            rotulo: 'Peço permissão à banda', certa: false, efeito: 'trava',
                            impacto: 'A etiqueta já tinha respondido: livre para escola. Pedir de novo o que já foi liberado só trava o trabalho da turma.',
                        },
                    ],
                }],
                successLine: 'Autor de som é autor igual. O nome da banda custou uma linha.',
            },
            {
                id: 'm1-3',
                arquivo: {
                    nome: 'dinossauro.png', tipo: 'imagem', arte: ACERVO.desenho,
                    etiqueta: {
                        autor: 'Téo, da sua turma',
                        permissao: 'Não tem nada escrito',
                        aviso: 'Ele desenhou no caderno; você só fotografou',
                    },
                },
                passos: [{
                    principio: 'autoria',
                    situacao: 'O Téo fez este desenho no caderno. Você fotografou e quer pôr no mural.',
                    pergunta: 'O que você faz?',
                    acoes: [
                        {
                            rotulo: 'Pergunto ao Téo e cito ele', certa: true, efeito: 'pergunta',
                            impacto: 'Téo disse que sim, e o mural saiu com o nome dele. Autor que senta do seu lado é autor do mesmo jeito.',
                        },
                        {
                            rotulo: 'Cito, mas não pergunto', certa: false, efeito: 'credito',
                            impacto: 'Dar o crédito é metade. A outra metade é perguntar: o desenho é dele, e a decisão de mostrar também.',
                        },
                        {
                            rotulo: 'Ponho no mural sem falar', certa: false, efeito: 'semCredito',
                            impacto: 'Sem nome e sem permissão. O trabalho é do Téo e a escola inteira vai achar que é seu.',
                        },
                    ],
                }],
                successLine: 'Sem etiqueta escrita, quem responde é o autor. E ele estava na sala do lado.',
            },
        ],
    },

    /* ═══════════════════════ NÍVEL 2 — o que a etiqueta libera? */
    {
        level: 2,
        title: 'O que a etiqueta libera?',
        objective: 'Cada arquivo diz o que pode e o que não pode — e alguns liberam tudo.',
        tip: 'A permissão e o aviso estão atrás da ficha.',
        cases: [
            {
                id: 'm2-1',
                arquivo: {
                    nome: 'turma-passeio.jpg', tipo: 'imagem', arte: ACERVO.turma,
                    etiqueta: {
                        autor: 'Você mesmo',
                        permissao: 'A foto é sua',
                        aviso: 'Tem sete crianças com o rosto visível',
                    },
                },
                passos: [{
                    principio: 'privacidade',
                    situacao: 'Você tirou esta foto no passeio e quer postar num grupo aberto.',
                    pergunta: 'O que você faz?',
                    acoes: [
                        {
                            rotulo: 'Mando só para a turma', certa: true, efeito: 'protege',
                            impacto: 'A foto é sua, mas os rostos são de sete pessoas. Só é totalmente sua a decisão sobre o que é só seu.',
                        },
                        {
                            rotulo: 'Posto: a foto é minha', certa: false, efeito: 'vaza',
                            impacto: 'A foto é sua, o rosto é dos outros. Quem aparece também decide onde aparece.',
                        },
                        {
                            rotulo: 'Apago para não dar problema', certa: false, efeito: 'apaga',
                            impacto: 'Não precisava apagar. Precisava escolher para quem mandar — a lembrança do passeio era de todo mundo.',
                        },
                    ],
                }],
                successLine: 'Ser dono da foto não é ser dono dos rostos que estão nela.',
            },
            {
                id: 'm2-2',
                arquivo: {
                    nome: 'documentario.mp4', tipo: 'video', arte: ACERVO.documentario,
                    etiqueta: {
                        autor: 'Canal Terra Viva',
                        permissao: 'Todos os direitos reservados',
                        aviso: 'Proibido baixar e reenviar',
                    },
                },
                passos: [{
                    principio: 'permissao',
                    situacao: 'Este vídeo explica tudo o que a turma precisa. Você quer mandar no grupo.',
                    pergunta: 'O que você faz?',
                    acoes: [
                        {
                            rotulo: 'Não baixo. Mando o link', certa: true, efeito: 'link',
                            impacto: 'O link leva todo mundo ao original. A turma assiste igual, e quem fez o vídeo continua com ele.',
                        },
                        {
                            rotulo: 'Baixo e mando no grupo', certa: false, efeito: 'vaza',
                            impacto: 'A etiqueta proibia com todas as letras. Reenviar o arquivo tira do canal justamente quem ele precisava alcançar.',
                        },
                        {
                            rotulo: 'Baixo e guardo só para mim', certa: false, efeito: 'copia',
                            impacto: 'Proibido baixar continua proibido mesmo sem mostrar para ninguém. A regra era sobre baixar.',
                        },
                    ],
                }],
                successLine: 'Quando não dá para copiar, ainda dá para indicar. O link resolveu.',
            },
            {
                id: 'm2-3',
                arquivo: {
                    nome: 'praca-central.jpg', tipo: 'imagem', arte: ACERVO.praca,
                    etiqueta: {
                        autor: 'Prefeitura da cidade',
                        permissao: 'Domínio público: pode usar, copiar e mudar',
                    },
                },
                passos: [{
                    principio: 'permissao',
                    situacao: 'Você quer esta foto no cartaz do projeto sobre o bairro.',
                    pergunta: 'O que você faz?',
                    acoes: [
                        {
                            rotulo: 'Uso: a etiqueta libera', certa: true, efeito: 'libera',
                            impacto: 'Domínio público é isso mesmo: liberado. Saber o que PODE é parte da mesma postura que sabe o que não pode.',
                        },
                        {
                            rotulo: 'Peço permissão mesmo assim', certa: false, efeito: 'trava',
                            impacto: 'Já estava dado. Pedir de novo o que já foi liberado atrasa o cartaz e não protege ninguém.',
                        },
                        {
                            rotulo: 'Procuro outra: deve ter dono', certa: false, efeito: 'trava',
                            impacto: 'Tem dono e tem etiqueta — e a etiqueta diz que pode. Desconfiar de tudo é tão ruim quanto não desconfiar de nada.',
                        },
                    ],
                }],
                successLine: 'Nem toda etiqueta é um "não". Esta era um "pode".',
            },
        ],
    },

    /* ═════════════════════════ NÍVEL 3 — o projeto inteiro */
    {
        level: 3,
        title: 'O projeto inteiro',
        objective: 'Coletar, guardar e passar adiante: cada etapa tem a sua decisão.',
        tip: 'Agora são duas decisões por arquivo.',
        cases: [
            {
                id: 'm3-1',
                arquivo: {
                    nome: 'festa-junina.jpg', tipo: 'imagem', arte: ACERVO.turma,
                    etiqueta: {
                        autor: 'Você mesmo',
                        permissao: 'A foto é sua',
                        aviso: 'Tem crianças da turma com o rosto visível',
                    },
                },
                passos: [
                    {
                        principio: 'guarda',
                        situacao: 'Você acabou de passar a foto da festa para o computador da escola.',
                        pergunta: 'Onde ela fica guardada?',
                        acoes: [
                            {
                                rotulo: 'Na pasta da turma, com senha', certa: true, efeito: 'cofre',
                                impacto: 'Guardada onde só a turma entra. Guardar é decidir quem alcança.',
                            },
                            {
                                rotulo: 'Na área de trabalho, solta', certa: false, efeito: 'solto',
                                impacto: 'Qualquer um que sentar naquele computador abre a foto. A área de trabalho é a mesa da sala.',
                            },
                            {
                                rotulo: 'Na nuvem com link público', certa: false, efeito: 'vaza',
                                impacto: 'Link público é a internet inteira. Guardar assim já é quase publicar.',
                            },
                        ],
                    },
                    {
                        principio: 'privacidade',
                        situacao: 'A professora pediu essa foto para o jornal da escola.',
                        pergunta: 'Como você manda?',
                        acoes: [
                            {
                                rotulo: 'Mando e aviso da foto', certa: true, efeito: 'protege',
                                impacto: 'A professora recebeu a foto e o aviso junto. Quem for publicar já sabe o que precisa combinar antes.',
                            },
                            {
                                rotulo: 'Mando sem falar nada', certa: false, efeito: 'vaza',
                                impacto: 'A foto saiu do seu computador e o aviso ficou. Quem recebeu não sabe o que está recebendo.',
                            },
                            {
                                rotulo: 'Não mando', certa: false, efeito: 'trava',
                                impacto: 'Era a professora, e era o jornal da escola. Recusar tudo não é cuidado — é só não participar.',
                            },
                        ],
                    },
                ],
                successLine: 'Guardou certo e avisou certo. O aviso viajou junto com o arquivo.',
            },
            {
                id: 'm3-2',
                arquivo: {
                    nome: 'lista-familias.pdf', tipo: 'documento', arte: ACERVO.lista,
                    etiqueta: {
                        autor: 'Secretaria da escola',
                        permissao: 'Uso interno, só para montar os grupos',
                        aviso: 'Tem telefone e endereço de 28 famílias',
                    },
                },
                passos: [
                    {
                        principio: 'guarda',
                        situacao: 'A secretaria mandou esta lista para você montar os grupos do trabalho.',
                        pergunta: 'Onde você guarda?',
                        acoes: [
                            {
                                rotulo: 'Na pasta com senha', certa: true, efeito: 'cofre',
                                impacto: 'Guardada com senha e usada para o que foi pedido. Nada além disso.',
                            },
                            {
                                rotulo: 'Salvo no meu celular', certa: false, efeito: 'solto',
                                impacto: 'Celular perdido é lista perdida. Endereço de família não sai passeando no bolso.',
                            },
                            {
                                rotulo: 'Mando no grupo da turma', certa: false, efeito: 'vaza',
                                impacto: 'Vinte e oito famílias não escolheram estar num grupo de turma. Elas deram o telefone para a escola, não para a turma.',
                            },
                        ],
                    },
                    {
                        principio: 'guarda',
                        situacao: 'Os grupos ficaram prontos. A lista já fez o que tinha para fazer.',
                        pergunta: 'E agora, o que você faz com ela?',
                        acoes: [
                            {
                                rotulo: 'Apago: já não preciso', certa: true, efeito: 'apaga',
                                impacto: 'Dado que não é mais necessário não deve continuar guardado. Apagar na hora certa também é cuidar.',
                            },
                            {
                                rotulo: 'Guardo, vai que precisa', certa: false, efeito: 'solto',
                                impacto: 'Guardar "por via das dúvidas" é o jeito mais comum de um dado vazar. Quanto mais tempo parado, mais chance de escapar.',
                            },
                            {
                                rotulo: 'Devolvo para a secretaria', certa: false, efeito: 'copia',
                                impacto: 'A secretaria já tem a lista: ela que te mandou. O que sobrou é a SUA cópia, e é ela que precisa sumir.',
                            },
                        ],
                    },
                ],
                successLine: 'Guardar bem e apagar na hora certa são a mesma responsabilidade.',
            },
            {
                id: 'm3-3',
                arquivo: {
                    nome: 'capa-do-projeto.png', tipo: 'imagem', arte: ACERVO.desenho,
                    etiqueta: {
                        autor: 'Bia, da sua turma',
                        permissao: 'Bia deixou usar no projeto da turma',
                        aviso: 'A permissão foi só para este projeto',
                    },
                },
                passos: [
                    {
                        principio: 'autoria',
                        situacao: 'A Bia desenhou a capa. Você está montando o arquivo final do projeto.',
                        pergunta: 'O que vai escrito na capa?',
                        acoes: [
                            {
                                rotulo: 'Escrevo "capa: Bia"', certa: true, efeito: 'credito',
                                impacto: 'O nome da Bia entrou. Trabalho de grupo não apaga quem fez o quê.',
                            },
                            {
                                rotulo: 'Deixo sem nome', certa: false, efeito: 'semCredito',
                                impacto: 'O projeto é da turma, o desenho é da Bia. Uma coisa não dissolve a outra.',
                            },
                            {
                                rotulo: 'Ponho o meu nome', certa: false, efeito: 'credito',
                                impacto: 'Montar não é desenhar. Você fez o arquivo; ela fez a capa.',
                            },
                        ],
                    },
                    {
                        principio: 'permissao',
                        situacao: 'Uma escola de outra cidade quer usar a capa da Bia no site deles.',
                        pergunta: 'O que você responde?',
                        acoes: [
                            {
                                rotulo: 'Falo com a Bia primeiro', certa: true, efeito: 'pergunta',
                                impacto: 'Permissão tem tamanho. A Bia liberou para uma coisa, e quem decide sobre a outra também é ela.',
                            },
                            {
                                rotulo: 'Deixo usar: ela liberou', certa: false, efeito: 'vaza',
                                impacto: 'Liberou para o projeto da turma. Outro site é outro uso, e ninguém perguntou a ela.',
                            },
                            {
                                rotulo: 'Digo que não pode', certa: false, efeito: 'trava',
                                impacto: 'Quem decide é a Bia, não você. Seu papel era levar a pergunta até ela — talvez ela quisesse.',
                            },
                        ],
                    },
                ],
                successLine: 'Permissão tem tamanho: serve para o que foi combinada, e nada além.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)
