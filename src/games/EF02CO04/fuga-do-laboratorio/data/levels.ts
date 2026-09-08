import type { LevelDef } from '../types'

/**
 * Um nível é um laboratório: três montagens, três vãos na prateleira.
 *
 * A prateleira de cima é o progresso — não existe barra, bolinha nem
 * porcentagem. Cada máquina que funciona sobe para lá e fica morando, viva,
 * até o fim da partida. É a lição repetida sem uma palavra: aquilo só está
 * ligado porque tem PEÇA e tem PROGRAMA.
 *
 * ── O QUE MUDA DO 1 PARA O 2 ─────────────────────────────────────────────
 *
 * No nível 1 o rack tem 4 fichas e UM par que funciona: acertar o tipo de cada
 * entrada já resolve quase tudo. No 2 o rack tem 6 e mais de um par COMPLETO —
 * a caixinha com o app de música funciona de verdade, só que o visor pediu uma
 * foto. A decisão deixa de ser "o que cabe aqui" e vira "o que faz o que foi
 * pedido".
 *
 * É esse nível que finalmente usa o veredito 'off-goal': até aqui ele era um
 * ramo do 'outcomeOf' que nenhuma partida alcançava, porque nunca havia um
 * segundo par certo no rack para a criança montar por engano.
 *
 * ── E DO 2 PARA O 3 ──────────────────────────────────────────────────────
 *
 * No 2 a criança ainda escolhe pela PEÇA: cada pedido tinha a sua. No 3 a mesma
 * peça aparece em dois pedidos diferentes — a tela desenha e a tela escreve, a
 * caixinha toca música e a caixinha desperta. Olhar a peça deixa de bastar, e
 * quem decide passa a ser o programa.
 *
 * O motor não sabe quantas montagens tem um nível.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Laboratório',
        teach: true,
        builds: [
            { id: '1.1', goal: 'music', shelf: ['mouse', 'caixinha', 'app-musica', 'app-desenho'] },
            { id: '1.2', goal: 'photo', shelf: ['camera', 'teclado', 'app-musica', 'app-fotos'] },
            { id: '1.3', goal: 'dance', shelf: ['impressora', 'robo', 'dancinha', 'app-escrever'] },
        ],
    },
    {
        level: 2,
        name: 'Galpão',
        /** A regra das entradas já foi aprendida no 1: aqui ela não é reensinada. */
        teach: false,
        builds: [
            /*
             * Três pares completos no mesmo rack. Montar a caixinha com o app
             * de música FUNCIONA — e é justamente por funcionar que ela ensina:
             * a máquina liga, toca, e não era isso que tinham pedido.
             */
            {
                id: '2.1',
                goal: 'photo',
                shelf: ['caixinha', 'camera', 'robo', 'app-musica', 'app-fotos', 'dancinha'],
            },
            /*
             * O mouse não obedece a nada que esteja aqui: é o erro que vira
             * frase concreta, "Mouse não sabe desenhar". O app de escrever e o
             * joguinho mandam na tela e na impressora — funcionam, mas não é
             * desenhar que foi pedido.
             */
            {
                id: '2.2',
                goal: 'draw',
                shelf: ['impressora', 'mouse', 'tela', 'app-escrever', 'joguinho', 'app-desenho'],
            },
            /*
             * DUAS RESPOSTAS CERTAS. O app de escrever manda no teclado e na
             * tela, e as duas estão no rack: a criança escolhe uma, a máquina
             * escreve, e a montagem fecha. Não existe a peça "que era para
             * ser" — existe a que funciona.
             */
            {
                id: '2.3',
                goal: 'write',
                shelf: ['teclado', 'tela', 'robo', 'app-desenho', 'app-escrever', 'dancinha'],
            },
        ],
    },
    {
        level: 3,
        name: 'Depósito',
        teach: false,
        builds: [
            /*
             * A tela está no rack uma vez só, e serve para os dois programas
             * que estão ali. Pegar a peça certa não decide nada: o que decide é
             * qual ordem entra no leitor.
             */
            {
                id: '3.1',
                goal: 'draw',
                shelf: ['tela', 'robo', 'caixinha', 'app-desenho', 'app-escrever', 'dancinha'],
            },
            /*
             * O mesmo app de escrever, agora com DUAS peças que ele comanda no
             * rack: a tela e a impressora. As duas fecham a montagem.
             */
            {
                id: '3.2',
                goal: 'write',
                shelf: ['tela', 'impressora', 'camera', 'app-desenho', 'app-escrever', 'app-fotos'],
            },
            /*
             * O despertador também manda na caixinha, e também funciona — só
             * que despertar não é tocar música. É o 'off-goal' no seu caso mais
             * fino: nada de errado com o par, errado é o pedido.
             */
            {
                id: '3.3',
                goal: 'music',
                shelf: ['caixinha', 'controle', 'tela', 'despertador', 'app-musica', 'joguinho'],
            },
        ],
    },
]

export const buildsInLevel = (level: LevelDef) => level.builds.length
