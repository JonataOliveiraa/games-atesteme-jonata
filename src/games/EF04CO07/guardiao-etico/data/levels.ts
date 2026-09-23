import { ITEM_GAP, PAPER, PAPER_PAD } from './layout'
import type { DestinationId, Item, LevelDef, Reach, Sheet } from '../types'

const FAR: Record<Reach, number> = { ninguem: 0, turma: 1, escola: 2, mundo: 3 }

/**
 * Até onde cada destino publica.
 *
 * É a única ponte entre a placa que a criança lê e o veredito. Ela vive aqui
 * para que a validação possa afirmar que as duas coisas dizem o mesmo.
 */
const REACH_OF: Record<DestinationId, Reach> = {
    muralDaSala: 'turma',
    jornalDaEscola: 'escola',
    siteDaEscola: 'mundo',
}

/** Precisa de tarja quando o papel vai mais longe do que aquele dado pode ir. */
export const needsCover = (item: Item, level: LevelDef) => FAR[level.reach] > FAR[item.reach]

/** Cada item tapado exatamente quando devia. Nada além disso é o veredito. */
export const canStamp = (sheet: Sheet, covered: Set<string>, level: LevelDef) =>
    sheet.items.every(item => needsCover(item, level) === covered.has(item.id))

export const pending = (sheet: Sheet, covered: Set<string>, level: LevelDef) =>
    sheet.items.filter(item => needsCover(item, level) !== covered.has(item.id))

export const pointsFor = (locked: boolean) => (locked ? 5 : 10)

const center = (item: Item) => ({
    x: item.box.x + item.box.w / 2,
    y: item.box.y + item.box.h / 2,
})

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS NÍVEIS SÃO TRÊS DESTINOS, E MAIS NADA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A mecânica não muda uma linha entre eles: passa a lupa, acha, tapa o que é
 * de outra pessoa, aprova. O que muda é PARA ONDE o papel vai, e o veredito
 * inteiro sai daí — `needsCover` compara o alcance do nível com o do dado, e
 * nenhum papel guarda a sua resposta.
 *
 *   N1  mural da sala  · `turma`   · só a turma vê
 *   N2  jornal da escola · `escola` · a escola inteira vê
 *   N3  site da escola · `mundo`   · o mundo vê
 *
 * É por isso que a MESMA informação muda de resposta de um nível para o outro,
 * sem ninguém explicar: o rosto de um colega podia ficar no mural e precisa de
 * tarja no jornal; o nome completo que ia até a escola precisa de tarja no
 * site. A assinatura é o único dado que alcança `mundo` — ela se acha e não se
 * tapa, e é ela que impede o jogo de virar "tape tudo" nos três níveis.
 *
 * A fase 1.1 é estreia e tem UM dado sensível; a 1.2 tem dois e estreia a
 * assinatura; a 1.3 troca texto por ROSTO — quem aparece na foto é um dado
 * como qualquer outro.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Mural da sala',
        closing: 'O que é de outra pessoa você tapou. O resto pode ser visto.',
        goal: 'Confira antes de aprovar',
        destination: 'muralDaSala',
        reach: 'turma',
        sheets: [
            {
                id: '1.1',
                who: 'duda',
                ask: 'Posso pôr o cartaz do campeonato no mural?',
                praise: 'Agora sim! Todo mundo vai querer jogar.',
                glued: { art: 'quadra', x: 40, y: 44, w: 230, h: 165 },
                lines: [
                    { text: 'CAMPEONATO DE QUEIMADA', x: 300, y: 44, size: 32, black: true, wrap: 520 },
                    { text: 'quinta, no recreio, na quadra', x: 302, y: 96, size: 24 },
                    { text: 'Faça um time com cinco pessoas.', x: 40, y: 246, size: 20 },
                    { text: 'A lista dos times fica no tablet da sala.', x: 300, y: 170, size: 18, soft: true },
                    { text: 'Senha do tablet:', x: 300, y: 204, size: 18, soft: true },
                    { text: 'Organiza:', x: 40, y: 320, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'senha',
                        kind: 'senha',
                        text: 'pipoca7',
                        reading: 'pipoca7',
                        owner: 'duda',
                        reach: 'ninguem',
                        box: { x: 470, y: 200, w: 120, h: 34 },
                    },
                    {
                        id: 'nome',
                        kind: 'nome',
                        text: 'Duda Lima',
                        reading: 'Duda Lima',
                        owner: 'duda',
                        reach: 'escola',
                        box: { x: 150, y: 316, w: 160, h: 34 },
                    },
                ],
            },
            {
                id: '1.2',
                who: 'bia',
                ask: 'A ficha do passeio já pode ir pro mural?',
                praise: 'Ficou do jeito que a turma precisa saber.',
                glued: { art: 'parque', x: 40, y: 44, w: 210, h: 150 },
                lines: [
                    { text: 'FICHA DO PASSEIO AO PARQUE', x: 290, y: 44, size: 30, black: true, wrap: 530 },
                    { text: 'sexta, saída às 8h', x: 292, y: 92, size: 24 },
                    { text: 'Levar lanche, boné e água.', x: 40, y: 230, size: 20 },
                    { text: 'Cuidado especial:', x: 300, y: 150, size: 18, soft: true },
                    { text: 'Mora em:', x: 40, y: 300, size: 18, soft: true },
                    { text: 'Desenho do cartaz:', x: 440, y: 338, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'alergia',
                        kind: 'saude',
                        text: 'Bia: alergia a amendoim',
                        reading: 'Bia: alergia a amendoim',
                        owner: 'bia',
                        reach: 'ninguem',
                        box: { x: 300, y: 186, w: 320, h: 34 },
                    },
                    {
                        id: 'casa',
                        kind: 'endereco',
                        text: 'R. das Flores, 12',
                        reading: 'R. das Flores, 12',
                        owner: 'teo',
                        reach: 'ninguem',
                        box: { x: 150, y: 296, w: 250, h: 34 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Rafa',
                        reading: 'Rafa',
                        owner: 'rafa',
                        reach: 'mundo',
                        box: { x: 440, y: 372, w: 90, h: 34 },
                    },
                ],
            },
            {
                id: '1.3',
                who: 'teo',
                ask: 'Tirei essa foto no passeio! Dá pra pôr no mural?',
                praise: 'Agora é só a nossa turma na parede.',
                glued: { art: 'parque', x: 40, y: 56, w: 390, h: 260 },
                lines: [
                    { text: 'A TURMA NO PASSEIO', x: 470, y: 60, size: 32, black: true, wrap: 350 },
                    { text: 'foi no parque, e foi demais', x: 472, y: 152, size: 22 },
                    { text: 'Quem aparece:', x: 470, y: 250, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'rosto1',
                        kind: 'rosto',
                        text: '',
                        reading: 'alguém de outra turma',
                        owner: 'estranho',
                        reach: 'ninguem',
                        box: { x: 96, y: 150, w: 80, h: 120 },
                    },
                    {
                        id: 'rosto2',
                        kind: 'rosto',
                        text: '',
                        reading: 'alguém de outra turma',
                        owner: 'estranho',
                        reach: 'ninguem',
                        box: { x: 286, y: 158, w: 80, h: 120 },
                    },
                    {
                        id: 'nomes',
                        kind: 'nome',
                        text: 'Bia e Téo',
                        reading: 'Bia e Téo',
                        owner: 'bia',
                        reach: 'escola',
                        box: { x: 470, y: 286, w: 180, h: 34 },
                    },
                ],
            },
        ],
    },

    /*
     * N2 — O JORNAL DA ESCOLA.
     *
     * O degrau novo é o `turma`: o rosto de um colega podia ficar no mural,
     * onde só quem está na foto passa na frente, e não pode ir para o jornal,
     * que a escola inteira lê. Nada nas regras mudou — mudou a placa.
     *
     * O nome completo AINDA fica: ele alcança `escola`, e este papel para na
     * escola. É o que prepara a virada do nível 3, quando o mesmo nome passa
     * a pedir tarja.
     */
    {
        level: 2,
        title: 'Jornal da escola',
        closing: 'A escola inteira lê isto. O que é de dentro da turma ficou tapado.',
        goal: 'Confira antes de aprovar',
        destination: 'jornalDaEscola',
        reach: 'escola',
        sheets: [
            {
                id: '2.1',
                who: 'bia',
                ask: 'A lista de quem leva o quê pode sair no jornal?',
                praise: 'Agora dá pra todo mundo ler sem problema.',
                glued: { art: 'festa', x: 40, y: 56, w: 230, h: 165 },
                lines: [
                    { text: 'QUEM LEVA O QUÊ', x: 300, y: 50, size: 32, black: true, wrap: 520 },
                    { text: 'festa junina, sexta, no pátio', x: 302, y: 100, size: 24 },
                    { text: 'Cuidado com a comida:', x: 470, y: 142, size: 18, soft: true },
                    { text: 'Combine com a professora antes de trazer.', x: 40, y: 262, size: 20, wrap: 400 },
                    { text: 'Quem organiza:', x: 40, y: 320, size: 18, soft: true },
                    { text: 'Cartaz de:', x: 400, y: 360, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'leite',
                        kind: 'saude',
                        text: 'Rafa: não pode leite',
                        reading: 'Rafa: não pode leite',
                        owner: 'rafa',
                        reach: 'ninguem',
                        box: { x: 470, y: 172, w: 260, h: 36 },
                    },
                    {
                        id: 'nome',
                        kind: 'nome',
                        text: 'Duda Lima',
                        reading: 'Duda Lima',
                        owner: 'duda',
                        reach: 'escola',
                        box: { x: 120, y: 312, w: 220, h: 36 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Bia',
                        reading: 'Bia',
                        owner: 'bia',
                        reach: 'mundo',
                        box: { x: 510, y: 354, w: 240, h: 36 },
                    },
                ],
            },
            {
                id: '2.2',
                who: 'rafa',
                ask: 'Essa é a nossa página. Já pode entrar no jornal?',
                praise: 'Ficou a notícia, sem entregar ninguém.',
                glued: { art: 'dragao', x: 40, y: 56, w: 230, h: 165 },
                lines: [
                    { text: 'O DRAGÃO DA NOSSA TURMA', x: 300, y: 50, size: 30, black: true, wrap: 530 },
                    { text: 'a turma do 4º B fez um dragão de papel', x: 302, y: 100, size: 22 },
                    { text: 'Segurando o dragão:', x: 470, y: 90, size: 18, soft: true },
                    { text: 'Oficina na casa de:', x: 135, y: 252, size: 18, soft: true },
                    { text: 'Reportagem de:', x: 520, y: 260, size: 18, soft: true },
                    { text: 'Quem quiser fazer um, a receita está na sala.', x: 330, y: 360, size: 20, wrap: 420 },
                ],
                items: [
                    {
                        id: 'rosto',
                        kind: 'rosto',
                        text: '',
                        reading: 'o Téo, da nossa turma',
                        owner: 'teo',
                        reach: 'turma',
                        box: { x: 96, y: 96, w: 80, h: 110 },
                    },
                    {
                        id: 'legenda',
                        kind: 'nome',
                        text: 'Téo Martins',
                        reading: 'Téo Martins',
                        owner: 'teo',
                        reach: 'escola',
                        box: { x: 470, y: 120, w: 260, h: 36 },
                    },
                    {
                        id: 'casa',
                        kind: 'endereco',
                        text: 'R. das Flores, 12',
                        reading: 'R. das Flores, 12',
                        owner: 'teo',
                        reach: 'ninguem',
                        box: { x: 135, y: 282, w: 230, h: 36 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Rafa',
                        reading: 'Rafa',
                        owner: 'rafa',
                        reach: 'mundo',
                        box: { x: 520, y: 290, w: 230, h: 36 },
                    },
                ],
            },
            {
                id: '2.3',
                who: 'duda',
                ask: 'O aviso do passeio sai no jornal desta semana?',
                praise: 'Assim a escola fica sabendo e mais ninguém.',
                glued: { art: 'parque', x: 40, y: 56, w: 230, h: 165 },
                lines: [
                    { text: 'PASSEIO AO PARQUE', x: 300, y: 50, size: 32, black: true, wrap: 520 },
                    { text: 'sexta, saída às 8h, volta às 12h', x: 302, y: 100, size: 22 },
                    { text: 'Quem já foi ano passado:', x: 470, y: 90, size: 18, soft: true },
                    { text: 'Dúvidas, ligue para:', x: 135, y: 252, size: 18, soft: true },
                    { text: 'Organiza:', x: 520, y: 260, size: 18, soft: true },
                    { text: 'Aviso feito por:', x: 330, y: 360, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'rosto',
                        kind: 'rosto',
                        text: '',
                        reading: 'a Bia, da nossa turma',
                        owner: 'bia',
                        reach: 'turma',
                        box: { x: 96, y: 96, w: 80, h: 110 },
                    },
                    {
                        id: 'nome',
                        kind: 'nome',
                        text: 'Duda Lima',
                        reading: 'Duda Lima',
                        owner: 'duda',
                        reach: 'escola',
                        box: { x: 470, y: 120, w: 260, h: 36 },
                    },
                    {
                        id: 'fone',
                        kind: 'telefone',
                        text: '9 9 9 0 - 1 1 2 2',
                        reading: '9 9 9 0 - 1 1 2 2',
                        owner: 'duda',
                        reach: 'ninguem',
                        box: { x: 135, y: 282, w: 230, h: 36 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Téo',
                        reading: 'Téo',
                        owner: 'teo',
                        reach: 'mundo',
                        box: { x: 520, y: 290, w: 230, h: 36 },
                    },
                ],
            },
        ],
    },

    /*
     * N3 — O SITE DA ESCOLA.
     *
     * A virada do nível está numa linha só de dado: o papel agora alcança
     * `mundo`, e o NOME COMPLETO — que ficou à mostra nos dois níveis
     * anteriores — passa a pedir tarja. A criança que aprendeu "nome pode"
     * descobre aqui que a resposta nunca foi do dado sozinho.
     *
     * Só a assinatura sobrevive, nos três papéis. É de propósito: é o que
     * ainda impede a estratégia de tapar tudo, e é a diferença entre esconder
     * dados e apagar a autoria de alguém.
     */
    {
        level: 3,
        title: 'Site da escola',
        closing: 'Isto o mundo inteiro pode abrir. Só ficou quem assinou.',
        goal: 'Confira antes de aprovar',
        destination: 'siteDaEscola',
        reach: 'mundo',
        sheets: [
            {
                id: '3.1',
                who: 'teo',
                ask: 'O cartaz do concurso pode ir pro site?',
                praise: 'Agora o mundo vê o concurso e não a minha vida.',
                glued: { art: 'dragao', x: 40, y: 56, w: 230, h: 165 },
                lines: [
                    { text: 'CONCURSO DE DRAGÕES', x: 300, y: 50, size: 32, black: true, wrap: 520 },
                    { text: 'inscrições até sexta, na secretaria', x: 302, y: 100, size: 22 },
                    { text: 'Inscrito nº 1:', x: 470, y: 142, size: 18, soft: true },
                    { text: 'Traga o seu dragão pronto no dia.', x: 40, y: 262, size: 20, wrap: 400 },
                    { text: 'Quem quiser saber mais, ligue:', x: 40, y: 320, size: 18, soft: true },
                    { text: 'Cartaz de:', x: 400, y: 360, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'nome',
                        kind: 'nome',
                        text: 'Téo Martins',
                        reading: 'Téo Martins',
                        owner: 'teo',
                        reach: 'escola',
                        box: { x: 470, y: 172, w: 260, h: 36 },
                    },
                    {
                        id: 'fone',
                        kind: 'telefone',
                        text: '9 8 8 8 - 4 3 2 1',
                        reading: '9 8 8 8 - 4 3 2 1',
                        owner: 'teo',
                        reach: 'ninguem',
                        box: { x: 120, y: 312, w: 220, h: 36 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Téo',
                        reading: 'Téo',
                        owner: 'teo',
                        reach: 'mundo',
                        box: { x: 510, y: 354, w: 240, h: 36 },
                    },
                ],
            },
            {
                id: '3.2',
                who: 'bia',
                ask: 'A ficha de inscrição vai ficar no site. Pode?',
                praise: 'Ficou a ficha, sem me entregar pro mundo.',
                glued: { art: 'festa', x: 40, y: 56, w: 230, h: 165 },
                lines: [
                    { text: 'FICHA DE INSCRIÇÃO', x: 300, y: 50, size: 32, black: true, wrap: 520 },
                    { text: 'mostra de trabalhos da escola', x: 302, y: 100, size: 22 },
                    { text: 'Nome do participante:', x: 470, y: 142, size: 18, soft: true },
                    { text: 'Preencha e entregue na secretaria.', x: 40, y: 262, size: 20, wrap: 400 },
                    { text: 'Mora em:', x: 40, y: 320, size: 18, soft: true },
                    { text: 'Ficha feita por:', x: 400, y: 360, size: 18, soft: true },
                ],
                items: [
                    {
                        id: 'nome',
                        kind: 'nome',
                        text: 'Bia Souza',
                        reading: 'Bia Souza',
                        owner: 'bia',
                        reach: 'escola',
                        box: { x: 470, y: 172, w: 260, h: 36 },
                    },
                    {
                        id: 'casa',
                        kind: 'endereco',
                        text: 'R. do Sol, 40',
                        reading: 'R. do Sol, 40',
                        owner: 'bia',
                        reach: 'ninguem',
                        box: { x: 120, y: 312, w: 220, h: 36 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Bia',
                        reading: 'Bia',
                        owner: 'bia',
                        reach: 'mundo',
                        box: { x: 510, y: 354, w: 240, h: 36 },
                    },
                ],
            },
            {
                id: '3.3',
                who: 'rafa',
                ask: 'A foto da turma na capa do site. Pode ser?',
                praise: 'A foto ficou, e a gente também ficou em paz.',
                glued: { art: 'parque', x: 40, y: 56, w: 400, h: 270 },
                lines: [
                    { text: 'A NOSSA TURMA', x: 480, y: 60, size: 32, black: true, wrap: 340 },
                    { text: 'Foto de:', x: 530, y: 82, size: 18, soft: true },
                    { text: 'Aparecem na foto:', x: 520, y: 270, size: 18, soft: true },
                    { text: 'o 4º B no dia do passeio', x: 482, y: 372, size: 22, wrap: 340 },
                ],
                items: [
                    {
                        id: 'rosto1',
                        kind: 'rosto',
                        text: '',
                        reading: 'a Bia, da nossa turma',
                        owner: 'bia',
                        reach: 'turma',
                        box: { x: 96, y: 150, w: 80, h: 120 },
                    },
                    {
                        id: 'rosto2',
                        kind: 'rosto',
                        text: '',
                        reading: 'o Téo, da nossa turma',
                        owner: 'teo',
                        reach: 'turma',
                        box: { x: 296, y: 150, w: 80, h: 120 },
                    },
                    {
                        id: 'autor',
                        kind: 'assinatura',
                        text: 'Rafa',
                        reading: 'Rafa',
                        owner: 'rafa',
                        reach: 'mundo',
                        box: { x: 530, y: 110, w: 110, h: 36 },
                    },
                    {
                        id: 'nomes',
                        kind: 'nome',
                        text: 'Bia e Téo',
                        reading: 'Bia e Téo',
                        owner: 'bia',
                        reach: 'escola',
                        box: { x: 520, y: 300, w: 200, h: 36 },
                    },
                ],
            },
        ],
    },
]

/**
 * A conferência que impede as duas estratégias preguiçosas: carimbar sem olhar
 * e tapar tudo. Sem ela, um papel mal escrito passa e ninguém percebe.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach((level, i) => {
        if (level.sheets.length < 1 || level.sheets.length > 5) {
            problems.push(`nível ${level.level}: ${level.sheets.length} papéis`)
        }

        // O nível É o destino: se a placa e o alcance discordarem, a criança lê
        // uma coisa na tela e o veredito julga outra.
        if (REACH_OF[level.destination] !== level.reach) {
            problems.push(
                `nível ${level.level}: a placa diz ${level.destination} e o alcance é ${level.reach}`,
            )
        }

        // E o destino só cresce. Um nível que publica MENOS longe que o
        // anterior faz a mesma informação voltar a poder, e a régua desanda.
        const before = levels[i - 1]
        if (before && FAR[level.reach] <= FAR[before.reach]) {
            problems.push(
                `nível ${level.level}: publica em ${level.reach}, que não é mais longe que ${before.reach}`,
            )
        }

        level.sheets.forEach(sheet => {
            // A assinatura nunca se tapa — é o que separa proteger um dado de
            // apagar a autoria de alguém. Nos níveis mais curtos outros dados
            // também sobrevivem e ela é opcional; no destino `mundo` ela é a
            // ÚNICA coisa que alcança tão longe, e sem ela o papel inteiro
            // vira tarja.
            const signatures = sheet.items.filter(item => item.kind === 'assinatura')
            if (level.reach === 'mundo' && signatures.length !== 1) {
                problems.push(`${sheet.id}: ${signatures.length} assinaturas num papel que vai ao mundo`)
            }
            signatures.forEach(sign => {
                if (needsCover(sign, level)) {
                    problems.push(`${sheet.id}/${sign.id}: assinatura pedindo tarja`)
                }
            })

            const toCover = sheet.items.filter(item => needsCover(item, level))
            if (!toCover.length) problems.push(`${sheet.id}: nenhum item pede tarja`)
            if (toCover.length === sheet.items.length) {
                problems.push(`${sheet.id}: todo item pede tarja`)
            }

            sheet.items.forEach(item => {
                const { x, y, w, h } = item.box
                const fits =
                    x >= PAPER_PAD &&
                    y >= PAPER_PAD &&
                    x + w <= PAPER.w - PAPER_PAD &&
                    y + h <= PAPER.h - PAPER_PAD
                if (!fits) problems.push(`${sheet.id}/${item.id}: a caixa sai do papel`)
            })

            sheet.items.forEach((a, i) => {
                sheet.items.slice(i + 1).forEach(b => {
                    const pa = center(a)
                    const pb = center(b)
                    const distance = Math.hypot(pa.x - pb.x, pa.y - pb.y)
                    if (distance < ITEM_GAP) {
                        problems.push(`${sheet.id}: ${a.id} e ${b.id} a ${Math.round(distance)}px`)
                    }
                })
            })
        })
    })

    return problems
}
