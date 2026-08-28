import { useEffect } from "react";

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A TECLA L — atalho de teste para pular de fase
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Existe para uma coisa só: abrir o Nível 3 de um jogo sem jogar o 1 e o 2.
 * A alternativa era editar o `BootScene` na mão a cada teste, e essa edição
 * ficava esquecida no arquivo — foi assim que o `nivel: 4` do Sistema
 * Operacional atravessou uma entrega inteira.
 *
 * ── ONDE ELE NÃO PODE EXISTIR ────────────────────────────────────────────
 *
 * Na partida real, embutida pela Atesteme. Quem chama passa `ativo`, e a
 * regra de quem pode é de lá — aqui só se decide QUANDO a tecla conta.
 *
 * Já houve um atalho neste projeto que ligava e desligava o modo embed, e ele
 * saiu a pedido: alternar o estado da tela por tecla cria um segundo jeito de
 * a tela estar, e "está assim porque alguém apertou algo" é o que ninguém
 * lembra na hora de investigar. Este é de outra natureza — ele não esconde
 * estado nenhum: abre um painel visível, que anuncia o que faz, e o resultado
 * fica escrito na barra de endereço como `?stage=N`.
 *
 * ── AS TRÊS RECUSAS ──────────────────────────────────────────────────────
 *
 * 1. Campo de texto em foco. Digitar "level" numa busca não pode abrir nada.
 * 2. Combinação com Ctrl/Alt/Meta. Ctrl+L é a barra de endereço do navegador,
 *    e roubar isso de quem só queria digitar uma URL é hostil.
 * 3. `event.repeat`. Segurar a tecla dispararia dezenas de vezes por segundo.
 */

function digitandoEm(alvo: EventTarget | null): boolean {
  if (!(alvo instanceof HTMLElement)) return false;
  if (alvo.isContentEditable) return true;

  const tag = alvo.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function useAtalhoDeFase(ativo: boolean, aoPedir: () => void) {
  useEffect(() => {
    if (!ativo) return;

    const aoTeclar = (evento: KeyboardEvent) => {
      if (evento.repeat) return;
      if (evento.ctrlKey || evento.metaKey || evento.altKey) return;
      if (digitandoEm(evento.target)) return;

      // `key` e não `code`: quem tem teclado ABNT ou AZERTY aperta a tecla
      // que TEM um L escrito nela, e é essa que a pessoa quis apertar.
      if (evento.key !== "l" && evento.key !== "L") return;

      evento.preventDefault();
      aoPedir();
    };

    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [ativo, aoPedir]);
}
