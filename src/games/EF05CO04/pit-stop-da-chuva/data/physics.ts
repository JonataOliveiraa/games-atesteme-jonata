/** Velocidades em px/s e acelerações em px/s². A distância da corrida é a mesma unidade. */
export const DRIVE = {
    vmax: 620,
    accel: 380,
    coast: 150,
    brake: 1300,
    over: 650,
    /** Fração da velocidade com o pneu que a regra não manda. */
    wrong: 0.45,
} as const

/** O tranco de toda mudança de tempo: todos perdem velocidade por um instante. */
export const GUST = {
    factor: 0.55,
    ms: 900,
} as const

export const PIT = {
    /** Meia largura do retângulo de parada (centro do carro). */
    zone: 170,
    /** Entrou no retângulo até esta velocidade: estaciona sozinho. Fica abaixo de vmax × wrong, para o freio valer sempre. */
    parkV: 200,
    /**
     * A tenda escolhida fica pelo menos a distância de frenagem + `margin` à frente, e nunca
     * mais que `minAhead`: com 520 fixo, quem chamava o box logo ao sair da lama (tenda 11 000
     * do N2) passava pela tenda vazia e era mandado para a seguinte, fora da tela.
     */
    minAhead: 520,
    margin: 200,
    /** Daqui para perto, o FREIO pisca se o carro vem rápido. */
    warn: 760,
    /** A essa distância do fim da volta, o revezamento chama o box. */
    relayCall: 900,
    /** Tanto tempo com o pneu errado e o TROCAR PNEU começa a chamar. */
    nudge: 2500,
} as const

/** `spot`: a vaga do rival na faixa do box, tanto depois da tenda da Kika (as tendas são da equipe dela). */
export const RIVALS = [
    { factor: 0.9, start: 560, cell: 5, spot: 700 },
    { factor: 0.84, start: 280, cell: 6, spot: 950 },
] as const

/** A cada mudança que pede pneu, cada rival sorteia quanto demora para perceber e se vai ignorar até a próxima. */
export const RIVAL_AI = {
    reactMin: 3500,
    reactMax: 6000,
    ignore: 0.35,
    pit: 6000,
    relay: 7000,
    minAhead: 320,
} as const
