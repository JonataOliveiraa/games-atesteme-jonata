export interface Point {
    x: number
    y: number
}

/**
 * A curva do arremesso, num lugar só.
 *
 * A linha pontilhada da mira e o voo da bolinha PRECISAM sair daqui os dois: no
 * dia em que cada um tiver a sua conta, a bolinha passa a cair um pouco fora da
 * linha que a criança viu, e o jogo fica com cara de ter mentido na mira.
 */

/**
 * A altura do arco.
 *
 * ── POR QUE ELE É BAIXO ──────────────────────────────────────────────────
 *
 * Era 210 − power·118, o que dava um arco alto e bonito — e errado. A bolinha
 * subia tão depressa que entrava na FAIXA DAS PLACAS ainda no meio do
 * caminho: mirando na placa da ponta, ela batia na do meio antes de chegar. A
 * mira prometia um alvo e o jogo entregava outro.
 *
 * Com o arco baixo a trajetória é quase a reta que a linha pontilhada desenha.
 * Ela ainda pode cruzar outra placa — e quando cruza, bate mesmo, que é o
 * honesto —, só que agora a criança VÊ os pontinhos passando por cima antes de
 * arremessar.
 */
export const liftOf = (power: number) => 74 - power * 30

/** Quanto mais força, mais curto o voo. */
export const flightOf = (power: number) => 620 - power * 240

export const arcAt = (from: Point, to: Point, lift: number) => {
    const control = { x: (from.x + to.x) / 2, y: Math.min(from.y, to.y) - lift }
    return (t: number): Point => {
        const inv = 1 - t
        return {
            x: inv * inv * from.x + 2 * inv * t * control.x + t * t * to.x,
            y: inv * inv * from.y + 2 * inv * t * control.y + t * t * to.y,
        }
    }
}
