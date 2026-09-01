import type { Case, Level, Query, Result, Word } from '../types'

/**
 * Os nove casos. Ver PLANEJAMENTO.md §3.
 *
 * ── COMO ESTE CONTEÚDO É ORGANIZADO ──────────────────────────────────────
 *
 * Não existe `correctKeywordId` nem `correctFilterId` aqui. O arquivo de dados
 * do jogo antigo marcava as três respostas certas, e era exatamente isso que o
 * transformava num quiz: a criança não descobria nada, adivinhava qual das três
 * opções o arquivo tinha marcado.
 *
 * Aqui o dado declara só FATOS — que palavras cada resultado carrega, de que
 * tipo ele é, qual deles responde ao pedido. Se uma palavra é boa ou não, o jogo
 * calcula na hora (MECANICA.md §4.3): boa é a que corta resultado E mantém a
 * resposta dentro.
 *
 * ── AS TRÊS PALAVRAS DA BANDEJA (N2) ─────────────────────────────────────
 *
 * Cada caso do Nível 2 oferece exatamente uma de cada:
 *
 *   certa    → está só nos resultados que interessam; corta o lixo
 *   larga    → está em TODOS os resultados; não corta ninguém
 *   estreita → não está em nenhum; zera o mural
 *
 * A "larga" precisa ser honesta, e não um enfeite: `jaguar` está mesmo no carro
 * Jaguar e no time; `bonita` cabe mesmo na borboleta de papel e na loja. Palavra
 * larga que só finge ser larga ensina a coisa errada.
 */

/* ═══════════════════════════════════════════════ ajudas de escrita */

const w = (id: string, label: string): Word => ({ id, label })

const site = (
    id: string, title: string, source: string, snippet: string,
    tags: string[], verdict: string,
): Result => ({ id, title, source, snippet, type: 'site', tags, verdict })

const imagem = (
    id: string, title: string, source: string, snippet: string,
    tags: string[], verdict: string,
): Result => ({ id, title, source, snippet, type: 'imagem', tags, verdict })

const video = (
    id: string, title: string, source: string, snippet: string,
    tags: string[], verdict: string,
): Result => ({ id, title, source, snippet, type: 'video', tags, verdict })

/* ═══════════════════════════════════════════════════════ os níveis */

export const LEVELS: Level[] = [

    /* ─────────────────────────────── NÍVEL 1 — uma palavra muda tudo */
    {
        level: 1,
        title: 'Uma palavra muda tudo',
        objective: 'A palavra que você escreve decide o que volta.',
        tip: 'Toque numa palavra e veja o que o buscador traz.',
        cases: [
            {
                id: 'c1-1',
                question: 'Que animal vive no gelo?',
                answerId: 'pinguim-info',
                baseWords: [],
                slots: 1,
                filters: [],
                tray: [w('bicho', 'bicho'), w('pinguim', 'pinguim'), w('sorvete', 'sorvete')],
                hint: 'Palavra larga traz muita coisa. Palavra certa traz o que você quer.',
                results: [
                    site('pinguim-info', 'Pinguim', 'Enciclopédia Infantil',
                        'Ave que vive no *gelo* e nada muito bem.',
                        ['pinguim', 'bicho'],
                        'É essa! O pinguim é o animal que vive no gelo.'),
                    video('pinguim-desenho', 'O pinguim dançarino', 'Vídeos Kids',
                        'Um *pinguim* de desenho que canta e dança na neve.',
                        ['pinguim', 'bicho'],
                        'Esse tem pinguim, mas fala de desenho. A pergunta é sobre o animal.'),
                    site('cachorro', 'Cachorro', 'Enciclopédia Infantil',
                        '*Bicho* de estimação que late e abana o rabo.',
                        ['bicho'],
                        'É um bicho, mas não é ele que vive no gelo.'),
                    site('peixe', 'Peixe', 'Enciclopédia Infantil',
                        '*Bicho* que vive na água e respira por guelras.',
                        ['bicho'],
                        'É um bicho, mas não é ele que vive no gelo.'),
                    site('formiga', 'Formiga', 'Enciclopédia Infantil',
                        '*Bicho* pequeno que carrega folhas para o formigueiro.',
                        ['bicho'],
                        'É um bicho, mas não é ele que vive no gelo.'),
                    site('sorvete-receita', 'Sorvete de morango', 'Receitas Kids',
                        'Um doce *sorvete* feito com leite e fruta.',
                        ['sorvete'],
                        'É gelado, mas não é um animal.'),
                    video('sorvete-video', 'Fazendo sorvete em casa', 'Vídeos Kids',
                        'Passo a passo para fazer *sorvete* na geladeira.',
                        ['sorvete'],
                        'É gelado, mas não é um animal.'),
                ],
            },
            {
                id: 'c1-2',
                question: 'Quem faz o mel?',
                answerId: 'abelha-info',
                baseWords: [],
                slots: 1,
                filters: [],
                tray: [w('doce', 'doce'), w('abelha', 'abelha'), w('urso', 'urso')],
                hint: 'Nem tudo que aparece responde à pergunta.',
                results: [
                    site('abelha-info', 'Abelha', 'Enciclopédia Infantil',
                        'A *abelha* recolhe o néctar das flores e faz o mel na colmeia.',
                        ['abelha', 'doce'],
                        'É essa! A abelha é quem faz o mel.'),
                    video('abelha-video', 'Por dentro da colmeia', 'Vídeos da Natureza',
                        'Imagens da colmeia cheia de *abelha*, sem explicação.',
                        ['abelha'],
                        'É sobre abelha, mas não responde quem faz o mel.'),
                    site('bala-mel', 'Bala de mel', 'Receitas Kids',
                        'Um *doce* feito com mel e açúcar.',
                        ['doce'],
                        'Tem mel, mas não diz quem faz o mel.'),
                    site('bolo-mel', 'Bolo de mel', 'Receitas Kids',
                        'Receita de um *doce* macio de fazer em casa.',
                        ['doce'],
                        'Tem mel, mas não diz quem faz o mel.'),
                    site('brigadeiro', 'Brigadeiro', 'Receitas Kids',
                        'O *doce* mais famoso das festas de aniversário.',
                        ['doce'],
                        'É um doce, mas não tem nada a ver com mel.'),
                    video('urso-desenho', 'O ursinho e o pote de mel', 'Vídeos Kids',
                        'Desenho do *urso* que adora comer mel.',
                        ['urso'],
                        'O urso come o mel, mas não é ele que faz.'),
                    site('urso-info', 'Urso', 'Enciclopédia Infantil',
                        'O *urso* é um animal grande e gosta muito de mel.',
                        ['urso'],
                        'O urso come o mel, mas não é ele que faz.'),
                ],
            },
            {
                id: 'c1-3',
                question: 'Que planeta tem anéis em volta?',
                answerId: 'saturno-info',
                baseWords: [],
                slots: 1,
                filters: [],
                tray: [w('ceu', 'céu'), w('saturno', 'Saturno'), w('estrela', 'estrela')],
                hint: 'A palavra certa é o nome exato do que você procura.',
                results: [
                    site('saturno-info', 'Saturno', 'Enciclopédia Infantil',
                        'O planeta *Saturno* tem anéis de gelo e pedra em volta dele.',
                        ['saturno', 'ceu'],
                        'É essa! Saturno é o planeta dos anéis.'),
                    imagem('saturno-foto', 'Foto de Saturno', 'Galeria do Espaço',
                        'Imagem do planeta *Saturno* vista pelo telescópio.',
                        ['saturno', 'ceu'],
                        'É uma foto de Saturno, mas não explica os anéis.'),
                    site('nuvem', 'Por que a nuvem é branca', 'Ciência Kids',
                        'O *céu* fica cheio de nuvens quando vai chover.',
                        ['ceu'],
                        'É sobre o céu, mas não fala de planeta.'),
                    site('aviao', 'Avião', 'Enciclopédia Infantil',
                        'A máquina que voa pelo *céu* levando pessoas.',
                        ['ceu'],
                        'Voa pelo céu, mas não é um planeta.'),
                    site('estrela-cadente', 'Estrela cadente', 'Ciência Kids',
                        'O risco de luz que cruza o *céu* à noite.',
                        ['estrela', 'ceu'],
                        'É do céu, mas não é um planeta.'),
                    site('estrela-mar', 'Estrela-do-mar', 'Enciclopédia Infantil',
                        'Bicho do mar em forma de *estrela*, com cinco braços.',
                        ['estrela'],
                        'Tem a palavra estrela, mas é um bicho do mar!'),
                ],
            },
        ],
    },

    /* ──────────────────────── NÍVEL 2 — uma palavra a mais corta o lixo */
    {
        level: 2,
        title: 'Uma palavra a mais corta o lixo',
        objective: 'Mais palavra é menos resultado — e o filtro escolhe o tipo.',
        tip: 'Some uma palavra para tirar o que não serve, depois escolha o tipo.',
        cases: [
            {
                id: 'c2-1',
                question: 'Ache uma FOTO de onça-pintada.',
                answerId: 'onca-foto',
                baseWords: ['onca'],
                slots: 2,
                filters: ['all', 'imagem', 'video', 'site'],
                tray: [w('pintada', 'pintada'), w('jaguar', 'jaguar'), w('preta', 'preta')],
                hint: 'A foto é do tipo Imagens. Some uma palavra e depois filtre.',
                results: [
                    imagem('onca-foto', 'Foto de onça-pintada', 'Galeria Animal',
                        'A *onça* *pintada* com as manchas, andando na floresta.',
                        ['onca', 'pintada', 'jaguar'],
                        'É essa! Uma foto da onça-pintada, que é o que o pedido queria.'),
                    video('onca-video', 'Vídeo da onça-pintada', 'Vídeos da Natureza',
                        'A *onça* *pintada* caminhando devagar pela mata.',
                        ['onca', 'pintada', 'jaguar'],
                        'É a onça certa, mas é um vídeo. O pedido queria uma foto.'),
                    site('onca-info', 'Onça-pintada', 'Enciclopédia Infantil',
                        'A maior *onça* da América, com o pelo cheio de manchas.',
                        ['onca', 'pintada', 'jaguar'],
                        'Explica a onça-pintada, mas não é uma foto.'),
                    site('carro-jaguar', 'Carro Jaguar', 'Revista de Carros',
                        'Um carro que leva o nome da *onça* na frente.',
                        ['onca', 'jaguar'],
                        'Apareceu por causa do nome, mas é um carro.'),
                    site('time-onca', 'Onças FC venceu', 'Notícias do Esporte',
                        'O time chamado *onça* ganhou a partida de ontem.',
                        ['onca', 'jaguar'],
                        'Apareceu por causa do nome, mas é um time de futebol.'),
                ],
            },
            {
                id: 'c2-2',
                question: 'Ache um VÍDEO de como a borboleta nasce.',
                answerId: 'borboleta-video',
                baseWords: ['borboleta'],
                slots: 2,
                filters: ['all', 'video', 'imagem', 'site'],
                tray: [w('casulo', 'casulo'), w('bonita', 'bonita'), w('azul', 'azul')],
                hint: 'Pense numa palavra que só aparece quando o assunto é nascer.',
                results: [
                    video('borboleta-video', 'Como a borboleta nasce', 'Vídeos da Natureza',
                        'Do *casulo* até as asas abrirem, filmado dia a dia.',
                        ['borboleta', 'casulo', 'bonita'],
                        'É essa! O vídeo mostra a borboleta nascendo, do casulo às asas.'),
                    site('borboleta-info', 'Borboleta', 'Enciclopédia Infantil',
                        'A *borboleta* sai do *casulo* depois de virar pupa.',
                        ['borboleta', 'casulo', 'bonita'],
                        'Explica como ela nasce, mas o pedido queria um vídeo.'),
                    imagem('borboleta-foto', 'Foto de borboleta', 'Galeria Animal',
                        'Uma *borboleta* pousada numa flor amarela.',
                        ['borboleta', 'bonita'],
                        'É uma foto bonita, mas não mostra a borboleta nascendo.'),
                    site('borboleta-enfeite', 'Enfeite de borboleta', 'Artesanato Kids',
                        'Como fazer uma *borboleta* de papel para a festa.',
                        ['borboleta', 'bonita'],
                        'É borboleta de papel. Não é o bicho nascendo.'),
                    site('loja-borboleta', 'Loja Borboleta abriu', 'Notícias da Cidade',
                        'A loja *Borboleta* abriu as portas no centro.',
                        ['borboleta', 'bonita'],
                        'Apareceu por causa do nome da loja.'),
                ],
            },
            {
                id: 'c2-3',
                question: 'Ache um SITE que explique o ciclo da água.',
                answerId: 'agua-ciclo-site',
                baseWords: ['agua'],
                slots: 2,
                filters: ['all', 'site', 'video', 'imagem'],
                tray: [w('ciclo', 'ciclo'), w('limpa', 'limpa'), w('oceano', 'oceano')],
                hint: 'O site é do tipo Sites. Some a palavra do assunto e filtre.',
                results: [
                    site('agua-ciclo-site', 'O ciclo da água', 'Ciência da Escola',
                        'A *água* evapora, vira nuvem e volta como chuva. É o *ciclo*.',
                        ['agua', 'ciclo', 'limpa'],
                        'É essa! Um site que explica o ciclo da água inteiro.'),
                    video('agua-ciclo-video', 'Vídeo do ciclo da água', 'Vídeos da Escola',
                        'Animação mostrando o *ciclo* da *água* passo a passo.',
                        ['agua', 'ciclo', 'limpa'],
                        'Explica o ciclo, mas é um vídeo. O pedido queria um site.'),
                    imagem('agua-ciclo-desenho', 'Desenho do ciclo da água', 'Galeria da Escola',
                        'Ilustração com as etapas do *ciclo* da *água*.',
                        ['agua', 'ciclo', 'limpa'],
                        'Mostra o ciclo, mas é um desenho. O pedido queria um site.'),
                    site('garrafa-agua', 'Garrafa de água', 'Loja Kids',
                        'Garrafinha para levar *água* limpa na mochila.',
                        ['agua', 'limpa'],
                        'Fala de água, mas é uma loja vendendo garrafa.'),
                    site('parque-aquatico', 'Parque aquático abriu', 'Notícias da Cidade',
                        'O parque de *água* abriu os toboáguas para o verão.',
                        ['agua', 'limpa'],
                        'Tem água, mas é notícia de parque.'),
                ],
            },
        ],
    },

    /* ────────────────────── NÍVEL 3 — duas pistas, uma serve melhor */
    {
        level: 3,
        title: 'Duas pistas, uma serve melhor',
        objective: 'A pista útil é a que responde o que você perguntou.',
        tip: 'Leia as duas com a lupa e escolha a que serve para o pedido.',
        cases: [
            {
                id: 'c3-1',
                question: 'Você quer aprender a fazer um vulcão de bicarbonato.',
                criterion: 'APRENDER A FAZER',
                answerId: 'vulcao-como',
                baseWords: ['vulcao'],
                slots: 0,
                filters: [],
                tray: [],
                hint: 'As duas falam de vulcão. Só uma ensina a fazer.',
                results: [
                    site('vulcao-como', 'Como fazer um vulcão de bicarbonato', 'Experimentos da Escola',
                        'Os materiais, os passos e os cuidados para a erupção funcionar.',
                        ['vulcao'],
                        'É essa! Ela ensina o passo a passo de fazer o seu.'),
                    site('vulcao-oque', 'O que é um vulcão', 'Enciclopédia Infantil',
                        'Montanha por onde sai a lava quente de dentro da Terra.',
                        ['vulcao'],
                        'Essa explica o que é um vulcão, mas não ensina a fazer o seu.'),
                ],
            },
            {
                id: 'c3-2',
                question: 'A professora pediu para descobrir quantas patas tem a aranha.',
                criterion: 'QUANTAS PATAS',
                answerId: 'aranha-patas',
                baseWords: ['aranha'],
                slots: 0,
                filters: [],
                tray: [],
                hint: 'As duas são sobre aranha. Só uma responde a sua pergunta.',
                results: [
                    site('aranha-patas', 'Quantas patas tem a aranha', 'Enciclopédia Infantil',
                        'A aranha tem oito patas, duas a mais que os insetos.',
                        ['aranha'],
                        'É essa! Ela responde exatamente o que você perguntou.'),
                    site('aranha-teia', 'Como a aranha faz a teia', 'Ciência Kids',
                        'O fio sai do corpo dela e vira uma rede para pegar insetos.',
                        ['aranha'],
                        'Essa é sobre aranha, mas responde outra pergunta.'),
                ],
            },
            {
                id: 'c3-3',
                question: 'Você quer saber se vai chover hoje na sua cidade.',
                criterion: 'HOJE',
                answerId: 'chuva-hoje',
                baseWords: ['chuva'],
                slots: 0,
                filters: [],
                tray: [],
                hint: 'As duas falam de chuva. Só uma fala de hoje.',
                results: [
                    site('chuva-hoje', 'Previsão do tempo de hoje', 'Tempo Agora',
                        'Céu nublado de manhã e chuva à tarde na sua cidade.',
                        ['chuva'],
                        'É essa! Ela é de hoje, que é o que você precisava saber.'),
                    site('chuva-como', 'Como se forma a chuva', 'Ciência da Escola',
                        'A água evapora, junta em nuvem e cai de volta como chuva.',
                        ['chuva'],
                        'Essa explica a chuva, mas vale para sempre — não diz o tempo de hoje.'),
                ],
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)

/* ═══════════════════════════════════════════════════════════ a busca */

/**
 * A regra inteira do buscador.
 *
 * AS PALAVRAS SE SOMAM COM E, NUNCA COM OU. Acrescentar palavra só pode tirar
 * resultado, nunca trazer. Isso não é uma simplificação: é a lição do Nível 2
 * escrita como regra. Se somar palavra pudesse trazer coisa nova, o percurso
 * 5 → 3 → 1 deixaria de significar alguma coisa.
 */
export function matches(result: Result, query: Query): boolean {
    const wordsOk = query.words.every(word => result.tags.includes(word))
    const typeOk = query.filter === 'all' || result.type === query.filter
    return wordsOk && typeOk
}

/**
 * Quem está na parede agora.
 *
 * Busca sem nenhuma palavra devolve NADA, e não tudo. `every` num array vazio é
 * `true`, então sem esta guarda o Nível 1 abriria com os sete resultados na
 * parede antes de a criança tocar em coisa alguma — e a primeira coisa que ela
 * veria seria o resultado de uma busca que ninguém fez.
 */
export function search(results: Result[], query: Query): string[] {
    if (query.words.length === 0) return []
    return results.filter(r => matches(r, query)).map(r => r.id)
}

/**
 * Rótulo de uma palavra.
 *
 * As da bandeja trazem o próprio; as de `baseWords` (que já nascem na barra e
 * não têm ficha) vêm daqui. É a única tabela do arquivo, e ela existe para o
 * `id` continuar sendo um identificador sem acento enquanto a criança lê a
 * palavra escrita direito.
 */
const BASE_LABELS: Record<string, string> = {
    onca: 'onça',
    borboleta: 'borboleta',
    agua: 'água',
    vulcao: 'vulcão',
    aranha: 'aranha',
    chuva: 'chuva',
}

export function labelOf(id: string, caso: Case): string {
    return caso.tray.find(word => word.id === id)?.label ?? BASE_LABELS[id] ?? id
}
