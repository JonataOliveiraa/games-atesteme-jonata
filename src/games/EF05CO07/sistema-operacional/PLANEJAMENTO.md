# Planejamento — Sistema Operacional

## 1. A habilidade, e o teste que ela precisa passar

**Habilidade:** EF05CO07 — compreender o papel do sistema operacional como mediador entre programas, dispositivos, arquivos, memória e recursos compartilhados.

Este jogo não pode virar uma lista ilustrada de peças do computador. A criança precisa sentir que o programa sozinho não faz nada: ele pede, espera, recebe ou fica bloqueado. O conteúdo está no estado do sistema no momento do toque.

**Teste da bolinha:** se teclado, mouse, monitor, arquivos, impressora e memória virassem bolinhas coloridas, o jogo perderia a regra central. Uma bolinha pode estar livre, sem energia, ocupada ou representar memória cheia; o toque certo depende do pedido atual e do estado vivo da tela. Portanto a habilidade está na mecânica, não só na arte.

| Risco do briefing | Correção no plano |
|---|---|
| Virar “toque no item que o texto pediu” | A mesma peça pode mudar de resposta: livre atende, sem energia pede “NÃO DÁ”, ocupada pede esperar/trocar, memória cheia pede fechar alguém antes. |
| Virar jogo de reflexo com relógios simultâneos | O tempo é teto do nível, não paciência de cada pedido. Demorar não apaga luz; só ação errada apaga. |
| Memória virar painel separado cheio de texto | Memória é uma peça da mesma fileira. Os quatro encaixes aparecem acima dela porque a própria arte do pente tem quatro chips. |

## 2. Como isso não vira o jogo irmão

Não há outro jogo publicado de `EF05CO07`, mas há irmãos próximos no catálogo que também usam computador, memória ou arquivos.

| Jogo próximo | Diferença obrigatória deste jogo |
|---|---|
| `EF05CO05/monte-seu-computador` | Lá a criança monta e classifica partes de hardware. Aqui as peças já existem; o desafio é mediar pedidos de programas durante o uso. |
| `EF05CO06/missao-arquivo-seguro` | Lá o foco é onde guardar, copiar e recuperar arquivos. Aqui “arquivos” é um recurso que um programa pede ao sistema, junto de teclado, impressora, memória e monitor. |
| `EF05CO11/escolha-a-ferramenta-certa` | Lá a escolha depende do contexto da ferramenta. Aqui a escolha depende do estado operacional: livre, ocupado, sem energia, memória cheia. |

## 3. O laço

```text
programa entra no balcão
→ frase pede uma peça
→ criança toca uma peça, um encaixe de memória, um pedido da fila ou NÃO DÁ
→ o sistema julga pelo estado atual
→ acerto remove o pedido; bloqueio orienta sem tirar luz; erro real apaga uma luz
→ próximo pedido sobe da fila
```

O gesto principal é sempre um toque. No nível 3, tocar no ícone aceso da fila troca quem está sendo atendido; ainda é um toque em objeto visível, não uma zona invisível.

## 4. A grade

Grade fixa: `1280 × 720`, `Phaser.Scale.FIT`.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---:|---|---:|---:|
| Estado | 0–90 | 3 luzes, barra de tempo e botão `?` | luz 26 px, `?` 60 px, barra 230 × 24 px | luz 8 px, `?` 18 px, barra 69 × 7 px |
| Pedido | 118–324 | placa translúcida com programa e frase | painel 600 × 206 px, ícone 118 px, frase 34 px | painel 180 × 62 px, ícone 35 px, frase 10 px |
| Memória | 349–403 | 4 encaixes, só no nível 2 | cada encaixe 54 × 54 px | 16 × 16 px |
| Peças | 411–610 | 4 recursos tocáveis e nomes | toque 176 × 168 px, arte até 132 × 168 px | toque 53 × 50 px, arte até 40 × 50 px |
| Fila e decisão | 638–706 | trilho de programas e botão `NÃO DÁ` | fila 66 px por alvo, botão 224 × 68 px | fila 20 px, botão 67 × 20 px |

**Atenção de produção:** a coluna “No celular” usa o fator `0,30`. As zonas de toque reais no canvas são confortáveis, mas o botão `?`, a fila e os encaixes ficam visualmente pequenos no telefone. Por isso eles precisam de halo, animação e contraste forte; se a avaliação visual mostrar dificuldade, o primeiro ajuste deve ser aumentar esses elementos sem invadir as faixas das peças.

O painel nunca corta a área jogável. A faixa do pedido termina em `y=324`, os encaixes começam em `y=349`, e a área de toque das peças começa em `y=411`, com respiro suficiente para não misturar pedido, memória e recursos.

## 5. Níveis e fases

Aqui, **fase** é um trecho de dois pedidos encadeados. O pedido isolado é só uma rodada curta; a fase é o pequeno par que cria comparação, surpresa ou mudança de estado. Assim o jogo mantém 3 níveis × 3 fases sem transformar cada toque em fase própria.

| Nível | Ideia | Fases internas | Crescimento |
|---|---|---|---|
| 1 | Programas dependem do sistema para usar dispositivos | 1. peça livre + peça livre; 2. peça sem energia + peça livre; 3. peça ocupada + peça sem energia | mesmo gesto, estados diferentes |
| 2 | Memória guarda programas abertos e pode ficar cheia | 1. abrir na memória + usar recurso comum; 2. indisponível + abrir até encher; 3. memória cheia + arquivos | resposta pode exigir dois toques |
| 3 | Dois programas pedem ao mesmo tempo e a ordem importa | 1. conflito de peça + saída livre; 2. recurso comum + novo conflito; 3. conflito + `NÃO DÁ` | a criança escolhe a ordem |

Cada nível tem 6 pedidos, mas só 3 fases didáticas. A produção deve manter essa distinção explícita nos comentários de dados ou nos docs, para ninguém tentar “corrigir” o jogo reduzindo os pares que fazem a regra aparecer.

## 6. As regras, em código

```ts
function verdict(action, state) {
  const pedido = state.selectedRequest

  if (action.kind === 'queue') {
    return state.activeRequests.includes(action.requestId)
      ? { kind: 'switchRequest', penalize: false }
      : { kind: 'ignore', penalize: false }
  }

  if (action.kind === 'memorySlot') {
    return action.program
      ? { kind: 'closeProgram', penalize: false }
      : verdict({ kind: 'piece', piece: 'memoria' }, state)
  }

  if (action.kind === 'noCanDo') {
    return state.withoutPower.includes(pedido.piece)
      ? { kind: 'solve', penalize: false }
      : { kind: 'wrong', reason: 'Havia uma peça que resolvia.' }
  }

  if (action.piece !== pedido.piece) {
    return { kind: 'wrong', reason: 'O programa pediu outra peça.' }
  }

  if (state.withoutPower.includes(action.piece)) {
    return { kind: 'blocked', hint: 'Use NÃO DÁ.', penalize: false }
  }

  if (action.piece === 'memoria' && state.memoryFull) {
    return { kind: 'blocked', hint: 'Feche um programa aberto.', penalize: false }
  }

  if (state.occupied.has(action.piece)) {
    return { kind: 'blocked', hint: 'Atenda outro e volte depois.', penalize: false }
  }

  return { kind: 'solve', penalize: false }
}
```

Erros reais são só dois: tocar na peça errada; tocar em `NÃO DÁ` quando dava para atender. Explorar peça sem energia, peça ocupada, memória cheia, fila e encaixe não custa luz.

## 7. O erro

O jogo usa luzes, não números. A cada erro real, uma luz apaga, a tela treme levemente, a borda pisca vermelho e o jogo mostra onde estava o problema.

| Situação | Resposta |
|---|---|
| Peça errada | peça tocada treme, programa nega, perde luz |
| `NÃO DÁ` quando dava | peça correta pulsa, perde luz |
| Peça certa sem energia | peça mostra erro visual, botão `NÃO DÁ` chama, sem perder luz |
| Peça certa ocupada | peça e ocupante pulsam, fila chama, sem perder luz |
| Memória cheia | encaixes pulsam, sem perder luz |
| Dois erros até zerar luzes | computador trava, nível recomeça com mensagem curta |

Depois de dois momentos de inatividade no mesmo pedido, a ajuda avança: primeiro a frase pulsa para pedir releitura; depois o caminho certo pisca. A ajuda não entrega uma frase longa, só desloca o olhar.

## 8. Feedback

| Momento | O que acontece |
|---|---|
| Toque em qualquer lugar | ondinha ciano no ponto tocado |
| Acerto em peça livre | programa voa do pedido para a peça; peça afunda; halo verde; som ascendente |
| Recurso liberado | ocupante desaparece; halo ciano; som curto |
| Abrir na memória | programa voa para encaixe vazio; encaixe pulsa verde |
| Fechar programa | ícone achata e some; som descendente |
| Trocar pedido ativo | programa do balcão desce para a fila; outro sobe |
| Erro real | tremida, flash vermelho, luz apaga, som grave |
| Fim de nível | painel compartilhado de conclusão, progresso visual, avanço automático |
| Fim do jogo | confete discreto e mensagem de síntese |

Efeitos usados: botão que afunda e volta, item voando para onde fica guardado, moldura/flash no erro, sequência de halos por estado, reprise implícita pela fila que esvazia e pelo que fica aberto/ocupado.

## 9. Antes da arte existir

O jogo precisa continuar jogável sem PNG. O fallback é:

- cenário escuro em `Graphics`;
- peças como cartões com nome grande no lugar final;
- programas como ícones simples com a inicial ou símbolo genérico;
- estados desenhados por código: X de sem energia, halos, sombras, encaixes, trilho, botão e luzes.

As texturas entram por `import.meta.glob`, com lista `WANTED` no `BootScene`. Nenhum `import` estático deve apontar para arte de jogo.

## 10. Registro

| Item | Valor |
|---|---|
| Pasta | `src/games/EF05CO07/sistema-operacional` |
| Assets | `src/assets/games/EF05CO07/sistema-operacional` |
| Slug | `sistema-operacional` |
| Título | `Sistema Operacional` |
| Ícone | `🖥️` |
| Catálogo | `src/data/catalog.ts` |
| Instruções | `src/data/gameInstructions.ts` |
| Tela de fim interna | `src/pages/GameDetailsPage.tsx` |

Antes de considerar pronto:

- [ ] alinhar a contagem de fases com a regra 3 × 3 ou justificar pedidos como rodadas internas;
- [ ] trocar o padrão temporário de `faseInicial(this, 3)` para `faseInicial(this, 1)`;
- [ ] remover comentários longos do código e deixar a explicação nos `.md`;
- [ ] revisar telas de fim para não mostrar `x de y` pedidos atendidos;
- [ ] conferir `runtimeGameBridge` em console nos três níveis;
- [ ] jogar com `?embed=1&inline=1&stage=1&points=0&lives=3`;
- [ ] verificar mudo, `?`, tutorial e retomada sem salto;
- [ ] rodar `npx tsc --noEmit`;
- [ ] rodar `npx eslint src/games/EF05CO07/sistema-operacional --ext .ts`.

## O que mudou na construção

Este plano foi escrito depois de uma versão funcional existir, então já incorpora decisões tomadas durante a construção:

- saiu a versão com três pedidos vivos e três anéis de paciência, porque ela cobrava velocidade e podia apagar várias luzes no mesmo instante;
- saiu a régua textual de memória, porque ela criava mais uma região e mais leitura;
- a memória virou peça da fileira para manter o gesto único;
- as peças passaram a ser medidas pelo recorte alfa, não pelo tamanho total do PNG;
- a fila virou indicador de progresso nos níveis 1 e 2, e objeto tocável no nível 3;
- a arte não desenha painel, botão, trilho, estrela, X, halo, brilho ou encaixe; isso fica em `Graphics`.
