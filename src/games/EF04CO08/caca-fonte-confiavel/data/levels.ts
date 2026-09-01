import type { Level } from '../types'

/**
 * Os nove casos.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  a baleia-azul   → duas páginas, e uma delas grita sem assinar
 *   N2  Bertha Benz     → duas páginas sérias; o que separa é sutil
 *   N3  os dinossauros  → três páginas, e a MAIORIA está errada
 *
 * ── A REGRA QUE VALE PARA OS NOVE ────────────────────────────────────────
 *
 * As páginas de um caso discordam num fato. Não existe caso em que baste
 * "escolher a mais bonita": é sempre preciso olhar quem assina, de quando é,
 * que endereço é aquele e de onde a página tirou o que diz.
 *
 * ── O QUE O NÍVEL 3 ENSINA E OS OUTROS NÃO ───────────────────────────────
 *
 * Que duas páginas concordarem não faz elas terem razão. Nos três casos do
 * Nível 3, duas fontes dizem a mesma coisa porque COPIARAM UMA DA OUTRA, ou a
 * mesma fonte velha. A criança tem que aprender a perguntar não "quantas
 * dizem isso?", mas "de onde cada uma tirou?".
 */

export const LEVELS: Level[] = [

    /* ══════════════════════════════ NÍVEL 1 — a baleia-azul */
    {
        level: 1,
        title: 'Quem escreveu isso?',
        objective: 'Página que ninguém assina e não diz de onde tirou não dá para conferir.',
        tip: 'Grife as pistas e depois escolha em quem confiar.',
        tema: 'tema-baleia',
        cases: [
            {
                id: 'f1-1',
                pergunta: 'Do que a baleia-azul se alimenta?',
                paginas: [
                    {
                        endereco: { texto: 'museudomar.org.br · museu', bom: true },
                        autor: { texto: 'Rita Nogueira, bióloga marinha', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita pesquisa do Instituto Oceanográfico', bom: true, decisiva: true },
                        resposta: 'De krill: uns camarõezinhos de 2 cm.',
                        confiavel: true,
                        veredito: 'Museu, com bióloga que assina e pesquisa citada.',
                    },
                    {
                        endereco: { texto: 'curiosidadeschocantes.com', bom: false },
                        autor: { texto: 'não diz quem escreveu', bom: false, decisiva: true },
                        data: { texto: 'sem data', bom: false },
                        fonte: { texto: 'não diz de onde tirou', bom: false, decisiva: true },
                        resposta: 'De navios inteiros! Ela engole tudo!!!',
                        confiavel: false,
                        veredito: 'Ninguém assina e não diz de onde tirou.',
                    },
                ],
                certa: 0,
                porque: 'A segunda página não tem autor nem fonte: não há a quem perguntar de onde veio aquilo.',
                successLine: 'A baleia-azul come krill. Quem assina e mostra de onde tirou dá para conferir.',
            },
            {
                id: 'f1-2',
                pergunta: 'Qual é o tamanho de uma baleia-azul adulta?',
                paginas: [
                    {
                        endereco: { texto: 'megafatos10.com · curiosidades', bom: false, decisiva: true },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'de 2016', bom: false },
                        fonte: { texto: 'não diz de onde tirou', bom: false },
                        resposta: 'Até 100 metros, do tamanho de um prédio!',
                        confiavel: false,
                        veredito: 'Lista de curiosidades, feita para impressionar.',
                    },
                    {
                        endereco: { texto: 'oceano.usp.br · universidade', bom: true, decisiva: true },
                        autor: { texto: 'equipe do Instituto Oceanográfico', bom: true },
                        data: { texto: 'atualizado em 2024', bom: true },
                        fonte: { texto: 'cita medições feitas no mar', bom: true },
                        resposta: 'Até 30 metros — um prédio de dez andares.',
                        confiavel: true,
                        veredito: 'Universidade, com medições de verdade.',
                    },
                ],
                certa: 1,
                porque: 'Olhe o endereço: uma é uma lista de curiosidades, a outra é uma universidade que mede baleias.',
                successLine: 'Trinta metros já é enorme. Quem exagera para impressionar não está interessado em acertar.',
            },
            {
                id: 'f1-3',
                pergunta: 'Quantas baleias-azuis existem hoje no mundo?',
                paginas: [
                    {
                        endereco: { texto: 'icmbio.gov.br · órgão do governo', bom: true },
                        autor: { texto: 'equipe de Fauna Marinha', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita o censo internacional de baleias', bom: true, decisiva: true },
                        resposta: 'Entre 10 e 25 mil.',
                        confiavel: true,
                        veredito: 'Órgão do governo, citando o censo internacional.',
                    },
                    {
                        endereco: { texto: 'super-animais-incriveis.net', bom: false },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'sem data', bom: false },
                        fonte: { texto: 'diz que "todo mundo sabe"', bom: false, decisiva: true },
                        resposta: 'Só restam 12 no mundo inteiro!!!',
                        confiavel: false,
                        veredito: '"Todo mundo sabe" não é fonte de nada.',
                    },
                ],
                certa: 0,
                porque: '"Todo mundo sabe" não é fonte. A outra página diz exatamente de onde tirou: o censo internacional.',
                successLine: 'Dá para contar baleias, e alguém conta. Quem sabe de onde veio o número, mostra.',
            },
        ],
    },

    /* ══════════════════════════════ NÍVEL 2 — Bertha Benz */
    {
        level: 2,
        title: 'As duas parecem sérias',
        objective: 'Assinar e estar no ar não basta: importa de quando é e de onde tirou.',
        tip: 'Agora as duas têm autor. Olhe a data e a fonte.',
        tema: 'tema-bertha',
        cases: [
            {
                id: 'f2-1',
                pergunta: 'Em que ano Bertha Benz fez a primeira viagem longa de carro?',
                paginas: [
                    {
                        endereco: { texto: 'historiadocarro.com.br · revista', bom: true },
                        autor: { texto: 'Marcos Dias, jornalista', bom: true },
                        data: { texto: 'de 2009, sem atualizar', bom: false, decisiva: true },
                        fonte: { texto: 'cita um livro de 1998', bom: false },
                        resposta: 'Em 1885.',
                        confiavel: false,
                        veredito: 'Revista séria, mas parada em 2009 e num livro de 1998.',
                    },
                    {
                        endereco: { texto: 'museubenz.org.br · museu', bom: true },
                        autor: { texto: 'Dra. Elke Braun, historiadora', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita o diário da própria Bertha', bom: true, decisiva: true },
                        resposta: 'Em 1888.',
                        confiavel: true,
                        veredito: 'Museu que leu o diário da própria Bertha.',
                    },
                ],
                certa: 1,
                porque: 'As duas são sérias. Só que uma cita o diário da própria Bertha — não dá para chegar mais perto do que aconteceu.',
                successLine: '1888. Quando alguém guardou o que escreveu na época, é nisso que se olha primeiro.',
            },
            {
                id: 'f2-2',
                pergunta: 'Quantos quilômetros teve aquela viagem?',
                paginas: [
                    {
                        endereco: { texto: 'carrosantigos.blog · colecionador', bom: true },
                        autor: { texto: 'José Prado, colecionador', bom: true },
                        data: { texto: 'atualizado em 2024', bom: true },
                        fonte: { texto: 'diz que ouviu de um amigo', bom: false, decisiva: true },
                        resposta: 'Uns 400 km.',
                        confiavel: false,
                        veredito: 'Assinado e atualizado — mas a fonte é um amigo.',
                    },
                    {
                        endereco: { texto: 'museubenz.org.br · museu', bom: true },
                        autor: { texto: 'Dra. Elke Braun, historiadora', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita o mapa do trajeto até Pforzheim', bom: true },
                        resposta: 'Cerca de 106 km.',
                        confiavel: true,
                        veredito: 'Museu, com o mapa do trajeto na mão.',
                    },
                ],
                certa: 1,
                porque: 'O blog tem nome, tem data e está no ar. O que falta é o principal: de onde ele tirou o número.',
                successLine: '106 km. Ter autor e estar atualizado não substitui dizer de onde veio.',
            },
            {
                id: 'f2-3',
                pergunta: 'Quem inventou a pastilha de freio?',
                paginas: [
                    {
                        endereco: { texto: 'museubenz.org.br · museu', bom: true },
                        autor: { texto: 'Dra. Elke Braun, historiadora', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita o diário e a patente da época', bom: true },
                        resposta: 'Bertha, no meio da viagem, com um sapateiro.',
                        confiavel: true,
                        veredito: 'Museu, com diário e patente.',
                    },
                    {
                        endereco: { texto: 'enciclopedia-rapida.net · aberta', bom: false },
                        autor: { texto: 'escrita por vários usuários', bom: false },
                        data: { texto: 'editada ontem', bom: true },
                        fonte: { texto: 'sem fonte nesta parte', bom: false, decisiva: true },
                        resposta: 'Karl Benz, o marido dela.',
                        confiavel: false,
                        veredito: 'Recentíssima, e mesmo assim sem fonte no trecho.',
                    },
                ],
                certa: 0,
                porque: 'A enciclopédia foi editada ontem e ainda assim não diz de onde tirou. Estar atualizado não é garantia de nada.',
                successLine: 'Foi Bertha. Uma página novinha em folha pode estar tão errada quanto uma velha.',
            },
        ],
    },

    /* ══════════════════════════════ NÍVEL 3 — os dinossauros */
    {
        level: 3,
        title: 'Duas dizem o mesmo',
        objective: 'Duas páginas concordarem não faz elas terem razão — às vezes é a mesma fonte repetida.',
        tip: 'Não conte quantas dizem. Olhe de onde cada uma tirou.',
        tema: 'tema-dino',
        cases: [
            {
                id: 'f3-1',
                pergunta: 'A que velocidade o tiranossauro corria?',
                paginas: [
                    {
                        endereco: { texto: 'museunacional.br · museu', bom: true },
                        autor: { texto: 'Dr. Ivo Rangel, paleontólogo', bom: true },
                        data: { texto: 'atualizado em 2024', bom: true },
                        fonte: { texto: 'cita estudo de 2023 sobre os ossos', bom: true },
                        resposta: 'Uns 20 km/h — o de uma bicicleta.',
                        confiavel: true,
                        veredito: 'Museu, com estudo recente dos ossos das pernas.',
                    },
                    {
                        endereco: { texto: 'dinossauros-radicais.com', bom: false },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'de 2015', bom: false },
                        fonte: { texto: 'copiado de um livro de 1993', bom: false, decisiva: true },
                        resposta: '60 km/h!',
                        confiavel: false,
                        veredito: 'Copiou o livro de 1993 sem conferir.',
                    },
                    {
                        endereco: { texto: 'tudosobredino.net · blog', bom: false },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'de 2017', bom: false },
                        fonte: { texto: 'copiado do MESMO livro de 1993', bom: false, decisiva: true },
                        resposta: '60 km/h!',
                        confiavel: false,
                        veredito: 'Copiou o MESMO livro de 1993.',
                    },
                ],
                certa: 0,
                porque: 'Duas páginas dizem 60 km/h porque copiaram o mesmo livro de 1993. Duas cópias da mesma fonte não são duas fontes.',
                successLine: 'Não é voto: é de onde veio. Uma fonte que mediu os ossos vale mais que duas que copiaram.',
            },
            {
                id: 'f3-2',
                pergunta: 'O tiranossauro tinha penas?',
                paginas: [
                    {
                        endereco: { texto: 'dinolegal.blog', bom: false },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'de 2012', bom: false },
                        fonte: { texto: 'copiado de uma enciclopédia velha', bom: false, decisiva: true },
                        resposta: 'Não, era só couro escamoso.',
                        confiavel: false,
                        veredito: 'Cópia de enciclopédia velha, sem assinatura.',
                    },
                    {
                        endereco: { texto: 'museunacional.br · museu', bom: true },
                        autor: { texto: 'Dr. Ivo Rangel, paleontólogo', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita fósseis com penas, na China', bom: true },
                        resposta: 'Parentes dele tinham; ele devia ter algumas.',
                        confiavel: true,
                        veredito: 'Museu, com fósseis achados de verdade.',
                    },
                    {
                        endereco: { texto: 'curiosidadesjurassicas.com', bom: false },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'de 2014', bom: false },
                        fonte: { texto: 'copiado da MESMA enciclopédia velha', bom: false, decisiva: true },
                        resposta: 'Não, era só couro escamoso.',
                        confiavel: false,
                        veredito: 'Cópia da MESMA enciclopédia velha.',
                    },
                ],
                certa: 1,
                porque: 'A primeira e a terceira copiaram a MESMA enciclopédia velha. A do meio foi olhar fóssil.',
                successLine: 'Quando duas páginas repetem a mesma coisa velha, elas não se confirmam: se repetem.',
            },
            {
                id: 'f3-3',
                pergunta: 'Por que os dinossauros desapareceram?',
                paginas: [
                    {
                        endereco: { texto: 'dinomania.com · lista', bom: false },
                        autor: { texto: 'sem autor', bom: false },
                        data: { texto: 'atualizado hoje', bom: true },
                        fonte: { texto: 'diz "especialistas", sem nomear', bom: false, decisiva: true },
                        resposta: 'Um vulcão gigante cobriu a Terra de fogo.',
                        confiavel: false,
                        veredito: '"Especialistas" que a página não nomeia.',
                    },
                    {
                        endereco: { texto: 'museunacional.br · museu', bom: true },
                        autor: { texto: 'Dra. Vera Pinto, geóloga', bom: true },
                        data: { texto: 'atualizado em 2025', bom: true },
                        fonte: { texto: 'cita a cratera de Chicxulub', bom: true },
                        resposta: 'Um meteoro gigante, há 66 milhões de anos.',
                        confiavel: true,
                        veredito: 'Museu, com a cratera que dá para ir ver.',
                    },
                    {
                        endereco: { texto: 'escoladofuturo.net · escola', bom: true },
                        autor: { texto: 'turma do 5º ano', bom: true },
                        data: { texto: 'de 2024', bom: true },
                        fonte: { texto: 'copiou do dinomania.com', bom: false, decisiva: true },
                        resposta: 'Um vulcão gigante cobriu a Terra de fogo.',
                        confiavel: false,
                        veredito: 'Turma caprichada — que copiou a página errada.',
                    },
                ],
                certa: 1,
                porque: 'A terceira página é honesta e diz de onde copiou: da primeira, que não nomeia especialista nenhum. Copiar não conserta a fonte.',
                successLine: 'Foi o meteoro. Dizer de onde copiou é honesto — mas não melhora o que foi copiado.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)
