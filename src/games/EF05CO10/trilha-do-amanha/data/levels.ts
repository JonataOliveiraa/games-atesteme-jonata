import { INVENCOES, ITENS_N1 } from './invencoes'
import { ITENS_N2, VEICULOS } from './veiculos'
import { INSTRUMENTOS, ITENS_N3, ITENS_N3_FINAL } from './instrumentos'
import { PHYS, PROPS, TRAIL } from './layout'
import type {
    Alvo,
    Destino,
    Encomenda,
    Entrega,
    Fase,
    Frase,
    Instrumento,
    Invencao,
    LevelDef,
    MotivoFalha,
    Pessoa,
    Quem,
    Veiculo,
} from '../types'

/**
 * As duas contas. Nenhuma fase guarda qual é a resposta: ela cai da comparação
 * entre o que a coisa faz e o limite do outro lado.
 */
export function entregarRecado(inv: Invencao, p: Pessoa): Entrega {
    if (inv.alcance < p.distancia) return { kind: 'naoChegou', motivo: 'longe' }
    if (inv.canal === 'som' && !p.escuta) return { kind: 'naoChegou', motivo: 'naoEscuta' }
    if (inv.precisaAparelho && !p.temTelefone) return { kind: 'naoChegou', motivo: 'semTelefone' }
    if (p.prazo === 'agora' && inv.chegaEm === 'amanha') return { kind: 'naoChegou', motivo: 'tarde' }
    return { kind: 'chegou', quando: inv.chegaEm }
}

export function enxergar(i: Instrumento, a: Alvo): Entrega {
    if (a.distante && !i.alcanca) return { kind: 'naoChegou', motivo: 'longeDemais' }
    if (a.miudo && !i.amplia) return { kind: 'naoChegou', motivo: 'pequenoDemais' }
    if (a.coberto && !i.atravessa) return { kind: 'naoChegou', motivo: 'escondido' }
    return { kind: 'chegou', quando: 'agora' }
}

export function entregarEncomenda(v: Veiculo, d: Destino, e: Encomenda): Entrega {
    if (v.via === 'estrada' && !d.temEstrada) return { kind: 'naoChegou', motivo: 'semEstrada' }
    if (v.via === 'agua' && !d.temAgua) return { kind: 'naoChegou', motivo: 'semAgua' }
    if (e.pesada && !v.levaPeso) return { kind: 'naoChegou', motivo: 'pesado' }
    if (d.prazo === 'agora' && v.chegaEm === 'amanha') return { kind: 'naoChegou', motivo: 'tarde' }
    return { kind: 'chegou', quando: v.chegaEm }
}

// ── nível 1 ─────────────────────────────────────────────────────────

const mae: Pessoa = { id: 'mae', distancia: 25, escuta: true, temTelefone: false, prazo: 'amanha' }
const bento: Pessoa = { id: 'bento', distancia: 20, escuta: false, temTelefone: true, prazo: 'amanha' }
const ari: Pessoa = { id: 'ari', distancia: 300, escuta: true, temTelefone: true, prazo: 'agora' }

/** A folha do N1 veio virada para a esquerda, e com o estado na ordem certa. */
const quemN1 = (id: string, nome: string, linha: number, x: number): Quem => ({
    id,
    nome,
    sheet: 'pessoas',
    linha,
    x,
    flip: true,
    estadoTrocado: false,
})

const faseRecado = (
    fase: Omit<Fase, 'itens' | 'julgar'> & { pessoa: Pessoa },
): Fase => ({
    ...fase,
    itens: ITENS_N1,
    julgar: id => entregarRecado(INVENCOES[id as keyof typeof INVENCOES], fase.pessoa),
})

const NIVEL_1: Fase[] = [
    faseRecado({
        id: '1-1',
        titulo: 'A sua mãe está do outro lado do rio.',
        abertura: 'Mãããe! Vai chover!',
        lembrete: 'Ela está do outro lado do rio, e na roça não tem telefone.',
        ceu: 0,
        quem: quemN1('mae', 'a sua mãe', 0, 300),
        pessoa: mae,
        falaChegou: {
            agora: 'Eu escutei daqui! Já estou indo!',
            amanha: 'Chegou hoje de manhã. Eu li tudo!',
        },
        falaFalhou: {
            longe: 'Eu vi a sua boca mexendo. Não chegou até aqui.',
            naoEscuta: 'Eu não entendi nada daqui.',
            semTelefone: 'Aqui na roça não tem telefone, meu filho!',
            tarde: 'Chegou tarde demais.',
        },
        frases: {
            megafone: [
                { texto: 'O megafone deixou a minha voz atravessar o rio.', certa: true },
                {
                    texto: 'O megafone guardou o recado para amanhã.',
                    certa: false,
                    porque: 'Quem guarda o recado escrito é a carta.',
                },
                {
                    texto: 'O megafone levou o meu papel até lá.',
                    certa: false,
                    porque: 'Megafone leva voz, não leva papel.',
                },
            ],
            carta: [
                { texto: 'A carta atravessou o rio, mas o recado chega amanhã.', certa: true },
                {
                    texto: 'A carta gritou bem alto.',
                    certa: false,
                    porque: 'Quem faz barulho é o megafone. Carta é para ler.',
                },
                {
                    texto: 'A carta só serve para quem está perto.',
                    certa: false,
                    porque: 'Ela atravessou o rio inteiro.',
                },
            ],
        },
    }),
    faseRecado({
        id: '1-2',
        titulo: 'O Bento está logo ali, e não respondeu.',
        abertura: 'Bento! Guarda as ferramentas!',
        lembrete: 'Ele está a vinte passos, olhando para o caderninho dele.',
        ceu: 1,
        quem: quemN1('bento', 'o Bento', 1, 340),
        pessoa: bento,
        falaChegou: { agora: 'Entendi na hora!', amanha: 'Eu li tudinho. Pode deixar!' },
        falaFalhou: {
            longe: 'Nem sinal de recado aqui.',
            naoEscuta: 'Eu não escuto. Mas eu leio.',
            semTelefone: 'Não tem telefone na oficina.',
            tarde: 'Chegou tarde demais.',
        },
        frases: {
            carta: [
                { texto: 'O Bento não escuta, mas ele lê.', certa: true },
                {
                    texto: 'O Bento estava longe demais.',
                    certa: false,
                    porque: 'Ele estava a vinte passos de você.',
                },
                {
                    texto: 'A carta gritou mais alto.',
                    certa: false,
                    porque: 'Carta não faz som nenhum.',
                },
            ],
        },
    }),
    faseRecado({
        id: '1-3',
        titulo: 'O seu Ari está lá longe, e fecha a feira hoje.',
        abertura: 'Seu Aaari! Guarda duas mangas!',
        lembrete: 'A feira é longe daqui, e ele fecha a barraca ainda hoje.',
        ceu: 2,
        quem: quemN1('ari', 'o seu Ari', 2, 200),
        pessoa: ari,
        falaChegou: { agora: 'Deu tempo! Já vou separar.', amanha: 'Chegou. Eu guardei para você.' },
        falaFalhou: {
            longe: 'Daqui da feira eu só vi a sua boca mexendo.',
            naoEscuta: 'Eu não entendi nada daqui.',
            semTelefone: 'Não tem telefone na barraca.',
            tarde: 'Chegou bonito. Só que a feira já fechou.',
        },
        frases: {
            telefone: [
                { texto: 'O telefone levou a minha voz longe e na hora certa.', certa: true },
                {
                    texto: 'O telefone deixou a minha voz mais alta aqui do lado.',
                    certa: false,
                    porque: 'Quem deixa a voz mais alta por perto é o megafone.',
                },
                {
                    texto: 'O telefone guardou o recado para amanhã.',
                    certa: false,
                    porque: 'Quem chega só amanhã é a carta.',
                },
            ],
        },
    }),
]

// ── nível 2 ─────────────────────────────────────────────────────────

const posto: Destino = { id: 'posto', temEstrada: false, temAgua: true, prazo: 'amanha' }
const galpao: Destino = { id: 'galpao', temEstrada: true, temAgua: false, prazo: 'amanha' }
const escola: Destino = { id: 'escola', temEstrada: true, temAgua: false, prazo: 'agora' }

const remedio: Encomenda = { nome: 'a caixa de remédio', pesada: false, coluna: 0 }
const sementes: Encomenda = { nome: 'o saco de sementes', pesada: true, coluna: 1 }
const giz: Encomenda = { nome: 'a caixa de giz', pesada: false, coluna: 2 }

/**
 * A folha do N2 veio com as COLUNAS TROCADAS: a primeira é a resposta e a
 * segunda é a espera. Está no dado, e não na arte, porque trocar no arquivo
 * quebraria a grade que o `sheet.ts` já mede.
 */
const quemN2 = (id: string, nome: string, linha: number, x: number): Quem => ({
    id,
    nome,
    sheet: 'pessoas-n2',
    linha,
    x,
    flip: true,
    estadoTrocado: true,
})

const faseEncomenda = (
    fase: Omit<Fase, 'itens' | 'julgar'> & { alvo: Destino; encomenda: Encomenda },
): Fase => ({
    ...fase,
    itens: ITENS_N2,
    julgar: id => entregarEncomenda(VEICULOS[id as keyof typeof VEICULOS], fase.alvo, fase.encomenda),
})

const NIVEL_2: Fase[] = [
    faseEncomenda({
        id: '2-1',
        titulo: 'O remédio precisa chegar no posto.',
        abertura: 'Não dá! O rio é fundo!',
        lembrete: 'O posto é do outro lado da água, e não tem estrada até lá.',
        ceu: 0,
        quem: quemN2('zuma', 'a dona Zuma', 0, 290),
        destino: 0,
        alvo: posto,
        encomenda: remedio,
        falaChegou: {
            agora: 'O remédio chegou a tempo!',
            amanha: 'Chegou de manhã. Deu certo!',
        },
        falaFalhou: {
            semEstrada: 'Aqui só se chega pela água.',
            semAgua: 'Não tem como vir por terra, moço.',
            pesado: 'Isso não coube. Voltou pela metade.',
            tarde: 'Chegou tarde demais.',
        },
        frases: {
            barco: [
                { texto: 'O barco vai por onde a água vai.', certa: true },
                {
                    texto: 'O barco passou por cima do rio.',
                    certa: false,
                    porque: 'Quem passa por cima é o avião.',
                },
                {
                    texto: 'O barco achou uma estrada até lá.',
                    certa: false,
                    porque: 'Quem precisa de estrada é a carroça.',
                },
            ],
            aviao: [
                { texto: 'O avião passou por cima do rio inteiro.', certa: true },
                {
                    texto: 'O avião foi flutuando na água.',
                    certa: false,
                    porque: 'Quem vai na água é o barco.',
                },
                {
                    texto: 'O avião levou a carga mais pesada.',
                    certa: false,
                    porque: 'O avião só leva o que é leve.',
                },
            ],
        },
    }),
    faseEncomenda({
        id: '2-2',
        titulo: 'O saco de sementes é pesado, e o seu Nilo espera.',
        abertura: 'Ufa! Pesado demais!',
        lembrete: 'O galpão fica na estrada de terra, e o saco é bem pesado.',
        ceu: 1,
        quem: quemN2('nilo', 'o seu Nilo', 1, 320),
        destino: 1,
        alvo: galpao,
        encomenda: sementes,
        falaChegou: {
            agora: 'É isso! Já vou plantar.',
            amanha: 'Chegou no sol de amanhã. Está ótimo!',
        },
        falaFalhou: {
            semEstrada: 'Não tem caminho por aí.',
            semAgua: 'Não passa rio nenhum aqui atrás.',
            pesado: 'Isso não aguentou o peso. Voltou pela metade.',
            tarde: 'Chegou tarde demais.',
        },
        frases: {
            carroca: [
                { texto: 'A carroça aguenta o peso, e tem estrada até lá.', certa: true },
                {
                    texto: 'A carroça foi voando por cima do morro.',
                    certa: false,
                    porque: 'Quem voa é o avião.',
                },
                {
                    texto: 'A carroça chegou na mesma hora.',
                    certa: false,
                    porque: 'Ela é devagar. Chegou só no outro dia.',
                },
            ],
        },
    }),
    faseEncomenda({
        id: '2-3',
        titulo: 'O giz é para a aula de hoje, lá na serra.',
        abertura: 'É muito alto! Não subo a tempo!',
        lembrete: 'A escola é no alto da serra, e a aula é hoje.',
        ceu: 2,
        quem: quemN2('rita', 'a dona Rita', 2, 180),
        destino: 2,
        alvo: escola,
        encomenda: giz,
        falaChegou: {
            agora: 'Giz novo! Pode começar a aula.',
            amanha: 'Chegou. Mas a aula foi ontem.',
        },
        falaFalhou: {
            semEstrada: 'Não tem caminho de roda até aqui.',
            semAgua: 'Aqui em cima não tem água nenhuma.',
            pesado: 'Isso não subiu o morro.',
            tarde: 'Chegou. Mas a aula foi ontem.',
        },
        frases: {
            aviao: [
                { texto: 'Só o avião chega hoje lá em cima.', certa: true },
                {
                    texto: 'O avião subiu pela estrada da serra.',
                    certa: false,
                    porque: 'Ele foi por cima. Quem sobe a estrada é a carroça.',
                },
                {
                    texto: 'O avião levou o mais pesado de todos.',
                    certa: false,
                    porque: 'O giz é leve. É por isso que ele coube.',
                },
            ],
        },
    }),
]

// ── nível 3 ─────────────────────────────────────────────────────────

const semente: Alvo = { id: 'semente', distante: false, miudo: true, coberto: false }
const cano: Alvo = { id: 'cano', distante: false, miudo: false, coberto: true }
const ninho: Alvo = { id: 'ninho', distante: true, miudo: false, coberto: false }

const faseOlhar = (
    fase: Omit<Fase, 'julgar' | 'semRio'> & { alvo: Alvo },
): Fase => ({
    ...fase,
    semRio: true,
    julgar: id => enxergar(INSTRUMENTOS[id as keyof typeof INSTRUMENTOS], fase.alvo),
})

const NIVEL_3: Fase[] = [
    faseOlhar({
        id: '3-1',
        titulo: 'A semente da sua mãe pode estar seca.',
        abertura: 'Assim eu não sei! É pequenininha demais.',
        pergunta: 'Vou plantar amanhã. Olha se essa semente tem broto ou se secou.',
        alvoOnde: 'mao',
        lembrete: 'O broto fica dentro da semente, e a semente cabe na sua unha.',
        ceu: 0,
        quem: quemN1('mae', 'a sua mãe', 0, 300),
        itens: ITENS_N3,
        alvo: semente,
        visao: 0,
        falaChegou: { agora: 'Tem broto! Está viva. Planto amanhã cedinho.' },
        falaFalhou: {
            pequenoDemais: 'Do mesmo tamanho! Precisa de algo que AUMENTE.',
            longeDemais: 'Ela está na sua mão, menino. Não é de longe.',
            escondido: 'Não tem nada enterrado aí.',
        },
        frases: {
            lupa: [
                { texto: 'A lupa deixou a semente grande o bastante para eu ver.', certa: true },
                {
                    texto: 'A lupa trouxe a serra lá de longe para perto.',
                    certa: false,
                    porque: 'Quem traz o longe para perto é a luneta.',
                },
                {
                    texto: 'A lupa achou o que estava enterrado.',
                    certa: false,
                    porque: 'Quem acha o que está debaixo da terra é o detector.',
                },
            ],
        },
    }),
    faseOlhar({
        id: '3-2',
        titulo: 'O Bento precisa saber onde cavar.',
        abertura: 'Está tudo igual! Eu não vejo cano nenhum.',
        pergunta: 'O cano de água passa por aí? Onde eu cavo?',
        alvoOnde: 'chao',
        lembrete: 'O cano está debaixo da terra, aqui mesmo na sua margem.',
        ceu: 1,
        quem: quemN1('bento', 'o Bento', 1, 340),
        itens: ITENS_N3,
        alvo: cano,
        visao: 1,
        falaChegou: { agora: 'Achou! Eu cavo bem aí, então.' },
        falaFalhou: {
            escondido: 'Só terra! O cano está DEBAIXO dela.',
            pequenoDemais: 'Só terra! O cano está debaixo dela.',
            longeDemais: 'Só terra! O cano está debaixo dela.',
        },
        frases: {
            detector: [
                { texto: 'O detector achou o que estava debaixo da terra.', certa: true },
                {
                    texto: 'O detector deixou a coisa maior para eu ver.',
                    certa: false,
                    porque: 'Quem aumenta o que é miúdo é a lupa.',
                },
                {
                    texto: 'O detector enxergou até o outro lado do rio.',
                    certa: false,
                    porque: 'Quem enxerga longe é a luneta.',
                },
            ],
        },
    }),
    faseOlhar({
        id: '3-3',
        titulo: 'O seu Ari quer saber do ninho lá longe.',
        abertura: 'Daqui é um pontinho! Não dá para ver.',
        pergunta: 'Tem passarinho no ninho lá do meu lado?',
        alvoOnde: 'longe',
        lembrete: 'O ninho está lá no alto, do outro lado do rio.',
        ceu: 2,
        quem: quemN1('ari', 'o seu Ari', 2, 200),
        itens: ITENS_N3_FINAL,
        alvo: ninho,
        visao: 2,
            falaChegou: { agora: 'Dois filhotes! Então eu não mexo nesse galho.' },
        falaFalhou: {
            longeDemais: 'Continua um pontinho! Precisa TRAZER PARA PERTO.',
            pequenoDemais: 'Continua um pontinho! Precisa trazer para perto.',
            escondido: 'Não está enterrado. Está no alto, bem à vista.',
        },
        frases: {
            luneta: [
                { texto: 'A luneta trouxe o galho lá de longe para perto dos meus olhos.', certa: true },
                {
                    texto: 'A luneta cavou o barro para achar o ninho.',
                    certa: false,
                    porque: 'Quem acha o que está enterrado é o detector.',
                },
                {
                    texto: 'A luneta só serve para o que está na minha mão.',
                    certa: false,
                    porque: 'Quem serve para o que está na mão é a lupa.',
                },
            ],
            celular: [
                { texto: 'O celular fez o que a luneta faz, e ainda guardou a foto.', certa: true },
                {
                    texto: 'O celular precisou chegar perto do galho.',
                    certa: false,
                    porque: 'Ele viu daqui mesmo, da beira do rio.',
                },
                {
                    texto: 'O celular cavou o barro para achar o ninho.',
                    certa: false,
                    porque: 'O ninho estava no alto, à vista. Ninguém cavou nada.',
                },
            ],
        },
    }),
]

export const LEVELS: LevelDef[] = [
    { level: 1, nome: 'Leve o recado', fases: NIVEL_1 },
    { level: 2, nome: 'Leve a encomenda', fases: NIVEL_2 },
    { level: 3, nome: 'Veja por mim', fases: NIVEL_3 },
]

function validarTrilha() {
    PROPS.forEach(prop => {
        if (prop.height > 80) throw new Error(`[trilha] "${prop.key}" passa de 80 px de altura`)
    })

    const degraus = TRAIL.filter(item => PROPS[item.prop].key === 'degrau').map(item => item.x)

    TRAIL.forEach(item => {
        const prop = PROPS[item.prop]
        if (!prop.solid || prop.height <= PHYS.stepUp) return
        const temDegrau = degraus.some(x => Math.abs(x - item.x) <= 140)
        if (!temDegrau) throw new Error(`[trilha] o "${prop.key}" em ${item.x} não tem degrau ao lado`)
    })
}

function validarFrases(fase: Fase, chegam: string[]) {
    chegam.forEach(id => {
        const frases: Frase[] | undefined = fase.frases[id]
        if (!frases || frases.length !== 3) {
            throw new Error(`[trilha] fase ${fase.id} × ${id} precisa de três frases`)
        }
        if (frases.filter(frase => frase.certa).length !== 1) {
            throw new Error(`[trilha] fase ${fase.id} × ${id} precisa de uma frase certa só`)
        }
        frases
            .filter(frase => !frase.certa)
            .forEach(frase => {
                if (!frase.porque) {
                    throw new Error(`[trilha] frase errada sem porquê em ${fase.id} × ${id}`)
                }
            })
    })

    Object.keys(fase.frases).forEach(id => {
        if (!chegam.includes(id)) {
            throw new Error(`[trilha] fase ${fase.id} tem frases de "${id}", que não chega`)
        }
    })
}

function validar() {
    validarTrilha()

    LEVELS.forEach(level => {
        const motivos = new Set<MotivoFalha>()

        level.fases.forEach(fase => {
            const chegam: string[] = []
            let falham = 0

            fase.itens.forEach(item => {
                const resultado = fase.julgar(item.id)
                if (resultado.kind === 'chegou') chegam.push(item.id)
                else {
                    falham++
                    motivos.add(resultado.motivo)
                    if (!fase.falaFalhou[resultado.motivo]) {
                        throw new Error(
                            `[trilha] fase ${fase.id} não tem fala para o motivo "${resultado.motivo}"`,
                        )
                    }
                }
            })

            if (!chegam.length) throw new Error(`[trilha] fase ${fase.id} não tem opção que chegue`)
            if (!falham) throw new Error(`[trilha] fase ${fase.id} não tem opção que falhe`)

            validarFrases(fase, chegam)
        })

        if (motivos.size < 3) {
            throw new Error(`[trilha] o nível ${level.level} só mostra ${motivos.size} motivos de falha`)
        }
    })
}

if (import.meta.env?.DEV) validar()
