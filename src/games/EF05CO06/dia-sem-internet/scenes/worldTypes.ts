import type Phaser from 'phaser'
import type { Place, SlotDef } from '../types'

/**
 * O CONTRATO DOS DOIS MUNDOS.
 *
 * O quarto (`world.ts`) e o ar (`worldAir.ts`) desenham coisas muito
 * diferentes — um tem cabo e pen drive, o outro tem onda e celular —, mas a
 * `GameScene` fala a mesma língua com os dois. É esta interface.
 *
 * Nada aqui recebe toque: a criança decide pelos BOTÕES (`buttons.ts`), que são
 * tela. O que o mundo faz é MOSTRAR.
 */
export interface World {
    mount(slots: SlotDef[]): Promise<void>
    /** O container que carrega o mundo inteiro. Quem viaja é ele. */
    stage(): Phaser.GameObjects.Container
    /** Onde uma coisa está, em coordenada de MUNDO. */
    cardPoint(where: Place): { x: number; y: number }
    /** Acende a ligação: o pulso no cabo, a onda no ar. */
    lightLink(): void
    /**
     * Arrebenta a ligação de `who`, com tudo a que ela tem direito.
     *
     * No quarto é sempre a nuvem, e o que se parte é o cabo da casa. No ar é um
     * APARELHO, e o que se apaga é o sinal dele — a nuvem continua acesa, porque
     * a nuvem não caiu. É a diferença que o nível 3 existe para ensinar.
     */
    breakLink(who: Place): Promise<void>
    /** O arquivo abriu em `where`, pedido a partir do botão `via`. */
    openAt(where: Place, fileId: string, via: Place): Promise<void>
    denyAt(target: Place): Promise<void>
    destroy(): void
}
