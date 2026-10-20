# Circuito de Bolinha — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF15CO02 · 1º ao 5º ano · Pensamento Computacional · Algoritmos** · id **133** · pasta `src/games/EF15CO02/circuito-de-bolinha/`

> **(EF15CO02)** Construir e simular algoritmos, de forma independente ou em colaboração, que resolvam problemas simples e do cotidiano com uso de sequências, seleções condicionais e repetições de instruções.

Pedido do usuário (20/10/2026): colou a ficha *Circuito de Bolinha* (a bolinha desce e para nos pontos que brilham; toque na peça certa). Avisei que escolher a peça com a bolinha já parada não constrói algoritmo (é o mesmo motivo pelo qual a Maratona recusou a ficha dela) e que o sorteio do sensor repetia o corredor molhado da Maratona. Entre três ideias com o exemplo oficial do Lego, ele escolheu **montar o manual**: *"siga com a ideia 1. e ja faça o jogo so com n1, mas planejamento completo é claro. use Graphics. as texturas eu adicionarei em breve"*.

---

## 0. Por que não é a ficha, e o que ficou dela

O exemplo oficial da BNCC traz, quase palavra por palavra, o que este jogo faz: *"o professor pode fornecer imagens que descrevem os passos para construir um objeto usando peças do tipo 'Lego' e solicitar que os alunos as organizem em uma sequência que permita construir o objeto"*. **O algoritmo é o manual de montagem.** O circuito de bolinha é o objeto, e a bolinha descendo é o teste de que o manual funciona.

| Irmão | O algoritmo é | A ordem importa porque |
|---|---|---|
| Academia dos Algoritmos (043) | uma rotina de casa | há pré-condição de estado (pegar a escova antes de escovar) |
| Maratona do Algoritmo (090) | as manobras de um skatista | há tempo de ar (o giro precisa de voo) |
| **Circuito de Bolinha (133)** | **os passos para montar um objeto** | **peça sem nada embaixo cai** |

Nos dois irmãos o algoritmo é uma lista de ações de alguém. Aqui ele é uma lista de passos que **constrói uma coisa**, e a coisa fica de pé ou desaba na frente da criança. Quem executa é outro (o Nico), e ele faz exatamente o que o manual mostra, nem mais nem menos.

Da ficha ficaram: o circuito de bolinha, o sino no fim, as três estruturas (sequência no N1, repetição no N2, seleção no N3), o contador do "×3" girando e o mundo que muda a cada descida no N3 (lá, o sensor; aqui, o gato). Saíram o toque durante a descida, os pontos que brilham, a peça certa piscando e a trava (ver §12).

## 1. O jogo em uma frase

**O Nico ganhou um circuito de bolinha e vai montar igual ao da caixa, mas ele só faz o que o manual mostra. Ponha as páginas do manual na ordem certa e veja o circuito ficar de pé e a bolinha tocar o sino.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **construir** um algoritmo | a criança monta o manual: escolhe e ordena as páginas na fita |
| **simular** | MONTAR: o Nico executa página por página, e a página da vez acende |
| **problema do cotidiano** | montar um brinquedo pelo manual, igual a um Lego |
| **sequência** (N1) | a ordem das páginas: peça sem bloco embaixo cai |
| **repetição** (N2) | a página **×3**: o Nico põe 3 blocos, um em cima do outro, e o contador gira 1, 2, 3 |
| **seleção condicional** (N3) | a página **SE**: *se o gato estiver dormindo no sino da direita, rampa para a esquerda; senão, para a direita* |

## 3. O laço

1. **A foto da caixa** aparece na mesa como um desenho claro e tracejado (o *fantasma*): é o circuito pronto, com o sino no fim. O sino já está na mesa de verdade.
2. **As páginas do manual** ficam na bandeja da direita, embaralhadas. Cada página mostra a mesa com o fantasma clarinho e **uma peça só, colorida, no lugar dela**.
3. **A criança monta o manual**: tocar numa página da bandeja a leva para o primeiro espaço vazio da fita (páginas 1, 2, 3…). Tocar numa página da fita a devolve para a bandeja.
4. Com a fita cheia, o botão **MONTAR** acende.
5. **O Nico executa**: a página 1 sobe e acende, a peça sai da página e voa até a mesa; depois a página 2, e assim por diante.
   - **Peça apoiada:** encaixa com um clique de madeira.
   - **Peça sem bloco embaixo:** chega, balança e cai da mesa (*tum, tum*). A página culpada treme, o Nico faz cara de ops, a faixa diz o motivo (*"Faltou um bloco embaixo da rampa!"*) e a partida acaba.
6. **Tudo montado:** o Nico põe a bolinha no alto da primeira rampa. Ela rola, cai de rampa em rampa e toca o **sino**. Faíscas, a bolinha da fase acende, e a próxima caixa começa.

Não há relógio. A fita aceita quantas trocas a criança quiser antes do MONTAR.

**Mais de uma ordem dá certo.** A resposta não fica nos dados: a montagem é simulada (`data/logic.ts`) e julgada peça por peça, no instante em que o Nico a põe. Na fase de duas torres, qualquer ordem que ponha cada bloco antes do que vai em cima dele funciona.

## 4. Controle

| Onde | O quê |
|---|---|
| página na bandeja | tocar = ir para o primeiro espaço vazio da fita |
| página na fita | tocar = voltar para a bandeja |
| MONTAR | tocar = o Nico executa o manual (só com a fita cheia) |
| `?` | ajuda |

Um toque, nada de arrastar. Não existe toque errado: só o MONTAR é julgado. No computador o mouse basta; a página sob o ponteiro cresce um pouco, parada.

## 5. A tela (1280 × 720)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │        Em que ordem o Nico monta?          │   (?)  │  faixa 96
├──────────────────────────────────────────────────┬───────────────────┤
│   quarto de brinquedos (parede, janela, estante) │  BANDEJA          │
│                                                  │  ┌────┐ ┌────┐    │
│     🧒        ┌─┐ ← fantasma tracejado           │  │pág │ │pág │    │
│    Nico       ├─┤◣                               │  └────┘ └────┘    │
│               ├─┤ ◣      🔔                      │  ┌────┐ ┌────┐    │
│   ════════════ MESA ═══════════════              │  │pág │ │pág │    │
├──────────────────────────────────────────────────┴───────────────────┤
│ MANUAL  [1 ····] [2 ····] [3 ····] [4 ····]           [🔨 MONTAR]    │
└──────────────────────────────────────────────────────────────────────┘
```

- **Cabeçalho em faixas**, de ponta a ponta: nível e bolinhas de fase à esquerda, o pedido no meio (*"Em que ordem o Nico monta?"*) e o `?` à direita. Sem texto de fase.
- **A mesa** ocupa a esquerda (tampo em y 440, de x 210 a 830). A grade da montagem tem células de **100 px**; cada fase se centra na mesa. Até 3 andares (o alto chega a y 140, abaixo do cabeçalho).
- **O Nico** fica em pé à esquerda da mesa (x ≈ 120, pés em y 530).
- **A bandeja** é uma grade de 2 colunas à direita (cartas de 168 × 116, centros x 970 e 1150, linhas em y 180, 310 e 440). Até 6 páginas.
- **O manual** é a faixa de baixo (y 540–712): até 5 espaços do tamanho de uma página, numerados, e o **MONTAR** verde à direita, com martelo e degrau. Desligado (cinza) até a fita encher; ligado, ganha a borda amarela.
- **Teto de alvos:** no N1 há no máximo 5 páginas na bandeja, numa grade limpa, mais as da fita e o MONTAR.

**Foco ao montar:** quando o Nico executa, o cabeçalho sobe, o quarto e a bandeja escurecem, e só a mesa, o Nico e o manual ficam claros. Voltam quando a fase acaba.

## 6. As peças

| Peça | Como é | Regra |
|---|---|---|
| **bloco** | cubo de madeira colorido (a cor muda por coluna) | vai na mesa ou em cima de outro bloco |
| **rampa** | cunha com canaleta, desce para a direita | vai na mesa ou em cima de um bloco; nada vai em cima dela |
| **sino** | sino dourado num suporte com copinho | já está na mesa; não é página |
| **bolinha** | bolinha de gude | o Nico põe no alto da rampa mais alta, no fim |

**A página** é um papel de manual com o cantinho dobrado. Dentro: a linha da mesa, o fantasma clarinho de todas as peças da fase, o sino e a peça da página em cor cheia. Não mostra as peças "já montadas" como o Lego de verdade faz, porque isso entregaria a ordem (a página com mais peças seria sempre a última).

**O caminho da bolinha** sai das rampas: da mais alta para a mais baixa, cada uma uma coluna à direita da anterior, e a última termina na coluna do sino. A bolinha rola pela canaleta, cai na ponta alta da rampa seguinte e, no fim, cai no copinho do sino.

## 7. O N1 — A ORDEM DE MONTAR

Assunto único: **a sequência**. Toda página da bandeja vai para o manual; o que a criança decide é só a ordem.

| Fase | Peças (coluna, andar) | Páginas | O que obriga a ordem |
|---|---|---|---|
| 1 · rampa no bloco | bloco (0,0) · rampa (0,1) · rampa (1,0) · sino na coluna 2 | 3 | o bloco antes da rampa de cima |
| 2 · torre | bloco (0,0) · bloco (0,1) · rampa (0,2) · rampa (1,0) · sino na coluna 2 | 4 | bloco de baixo → bloco do meio → rampa; as duas páginas de bloco só diferem na altura |
| 3 · duas torres | bloco (0,0) · bloco (0,1) · rampa (0,2) · bloco (1,0) · rampa (1,1) · sino na coluna 2 | 5 | duas pilhas que podem se intercalar |

A bandeja, em ordem de leitura (esquerda → direita, de cima para baixo):

| Fase | Bandeja |
|---|---|
| 1 | rampa (0,1) · rampa (1,0) · bloco (0,0) |
| 2 | bloco (0,1) · rampa (1,0) · rampa (0,2) · bloco (0,0) |
| 3 | rampa (1,1) · bloco (0,1) · bloco (1,0) · rampa (0,2) · bloco (0,0) |

**Validação** (`validateLevels`, só em DEV):
- nenhuma célula repetida; toda peça acima do andar 0 tem um **bloco** embaixo no modelo; nada em cima de rampa;
- o caminho existe: rampas do andar mais alto ao mais baixo, colunas consecutivas, e a última ao lado do sino;
- a bandeja, lida em ordem, **não** monta o circuito (copiar a ordem da bandeja derruba uma peça);
- existe pelo menos uma ordem que monta (a ordenação de baixo para cima);
- toda fase tem pelo menos uma peça que depende de outra;
- N1: só blocos e rampas, de 3 a 5 páginas, nenhuma página sobrando.

## 8. Erro (a cena antes do `lose()`)

O Nico pega a peça da página da vez e a põe no lugar. Não há bloco embaixo: a peça balança duas vezes, tomba e cai da frente da mesa, quicando, com poeirinha (*tum, tum*). A página culpada sobe e treme na fita, o Nico faz a pose de ops, e a faixa grande diz o motivo:

- *"Faltou um bloco embaixo da rampa!"*
- *"Faltou um bloco embaixo do bloco!"*

Depois de ~1,8 s vêm `WRONG_ANSWER` e `lose()`, uma vez. Não existe outro erro no N1: tocar fora das páginas não faz nada, e a fita incompleta não deixa o MONTAR ligar.

## 9. Abertura e tutorial do N1 (uma vez)

A história tem uma cena para cada parte da ideia, e cada fala espera o botão:

1. **Close no Nico** com a caixa nas mãos. *"Ganhei um circuito de bolinha!"* [Próximo]
2. A caixa abre, a foto da caixa voa para a mesa e vira o fantasma; a câmera abre. *"Vou montar igual ao da caixa."* [Próximo]
3. O manual sobe e as páginas saem da caixa para a bandeja. *"Eu só faço o que o manual mostra."* [Próximo]
4. **A regra, com a peça de verdade:** o Nico põe a rampa no alto sem nada embaixo, e ela cai. *"Sem bloco embaixo, cai!"* [Próximo]. Ele põe o bloco e depois a rampa: ela fica. *"Com bloco embaixo, fica!"* [Próximo]. As duas peças voltam para a caixa.
5. **Os toques, sem balão:** a bolinha de toque bate numa página da bandeja e ela vai para o espaço 1; bate no espaço 1 e ela volta.
6. **Guia** (recorte na bandeja e no manual juntos): *"Sua vez!"* [Vamos!]

Numa partida repetida (`registry`), nada disso aparece. O `?` mostra um balão sobre a mesa: *"Peça sem bloco embaixo cai."* [Continuar].

## 10. Fim de fase e de nível

O sino toca, faíscas sobre ele, o Nico comemora, a bolinha da fase acende (`CORRECT_ANSWER`, 10 pontos por fase). A tela escurece e abre na próxima caixa: mesa vazia, fantasma novo, páginas novas.

Na última fase do nível: confete, `GAME_COMPLETED` (`stage` = nível, `totalStages: LEVELS.length`) e `showLevelComplete`. Com mais níveis, o painel passa sozinho (`autoAdvance`); no último, JOGAR DE NOVO. Sem quadro de resumo.

## 11. N2 e N3 (planejados; feitos só quando pedido)

### O N2 — A PÁGINA QUE REPETE

Assunto: **repetição**. A fita fica **menor que o número de peças**, então a pilha de blocos não cabe página por página. Entra a página **×**: um bloco com o selo *×2*, *×3* ou *×4*. O Nico põe aquele bloco e repete, cada um em cima do anterior, e o selo gira o contador (1… 2… 3…) a cada bloco.

A bandeja traz a mesma página com contagens diferentes (*×2*, *×3*, *×4*) e a criança escolhe a que bate com a altura da torre na foto. Contar errado tem consequência na mesa:

- **pouco** (*×2* numa torre de 3): a rampa de cima fica sem bloco embaixo e cai: *"Faltou um bloco!"*;
- **demais** (*×4*): o 4º bloco ocupa o lugar da rampa, e a rampa bate e cai: *"Bloco demais!"*.

| Fase | Torres | Fita | Bandeja |
|---|---|---|---|
| 1 | torre de 3 + rampa no topo · rampa (1,0) | 3 | bloco ×2 · bloco ×3 · bloco ×4 · rampa (0,3) · rampa (1,0) |
| 2 | torres de 3 e de 2, cada uma com rampa no topo | 4 | ×2, ×3 e ×4 da coluna 0 · ×2 da coluna 1 · as duas rampas |
| 3 | escada de 3, 2 e 1, com rampa em cada uma | 5 | ×3 e ×2 com vizinhos errados (×2/×4, ×1/×3) · as três rampas |

Validação extra: a fita é menor que o total de peças; cada coluna tem uma contagem só que dá certo e pelo menos uma vizinha que dá errado; a soma das peças executadas tem de bater com o modelo.

Tutorial do N2 (estreia do ×): o Nico executa uma página *bloco ×3* com o contador girando. *"×3 é fazer 3 vezes."* [Ver] → a torre sobe → *"Sua vez!"*.

### O N3 — A PÁGINA SE

Assunto: **seleção**. O gato da casa, a Pipoca, gosta de dormir **na frente de um dos dois sinos**, e cada descida ela escolhe um. O circuito tem uma torre no meio e um sino de cada lado; a rampa do alto pode descer para a esquerda ou para a direita.

A página **SE** tem a foto da condição (a Pipoca no sino da direita) e dois bolsos: **SE sim** e **SENÃO**. A criança põe uma página de rampa em cada bolso. O MONTAR só liga com os dois bolsos cheios.

Cada fase tem **duas descidas**, em ordem sorteada: numa a Pipoca dorme no sino da direita, na outra no da esquerda. Antes de cada descida ela entra andando e se enrola no lugar, à vista. O Nico lê a página SE, olha a Pipoca e monta o bolso que vale. Decorar não funciona: o manual tem de servir para os dois casos.

- **Bolso certo:** a bolinha desce para o lado livre e toca o sino. Na 2ª descida, a Pipoca troca de lado, o Nico tira só a rampa do alto e lê a página SE de novo.
- **Bolso errado:** a bolinha rola para o lado da Pipoca, bate nela, ela acorda num pulo (*Miau!*) e a bolinha cai da mesa: *"A Pipoca estava nesse sino!"*. `lose()`.

| Fase | Onde fica o SE | Fita |
|---|---|---|
| 1 | a rampa do alto da torre do meio | bloco · bloco · SE |
| 2 | a rampa do meio, com uma rampa fixa em cima dela | 4 |
| 3 | o SE no meio do manual, com páginas comuns antes e depois | 5 |

Validação extra: as duas descidas são possíveis; trocar os bolsos derruba a bolinha nas duas; nenhuma fase pode ser vencida com a mesma rampa nos dois bolsos.

Tutorial do N3 (estreia do SE): a Pipoca entra e dorme num sino. *"Se a Pipoca estiver aqui…"* [Próximo] → a bolinha de toque põe a rampa no bolso SE sim → *"…a bolinha vai pelo outro lado."* [Ver] → descida → *"Sua vez!"*.

## 12. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| a bolinha para nos pontos brilhantes e a criança escolhe a peça ali | a criança monta o manual inteiro antes; o Nico executa | escolher na hora não constrói algoritmo; a habilidade pede construir **e** simular |
| sem montagem prévia | montagem prévia é o jogo | o exemplo oficial (organizar as imagens dos passos de um Lego) |
| RAMPA, CURVA, LOOPING 3x, CHAVE SE | bloco, rampa, página ×, página SE | o looping de verdade não repete trecho; o × é o "×3" que os manuais de Lego usam |
| sensor aceso/apagado a cada descida | a Pipoca dorme num dos dois sinos a cada descida | a condição mora no mundo, visível, e não é um sensor inventado |
| peça inadequada TRAVA com cadeado; a certa pisca; +5 | a peça cai da mesa; `WRONG_ANSWER` + `lose()` | errou, perdeu; piscar entregaria a resposta |
| bônus de circuito esperto (+15) | a fita do N2 é menor que o número de peças | a repetição vira necessidade, não bônus (e o bônus se contradizia: cada ponto só tinha uma peça) |
| régua lateral com o plano | a fita do manual | é o plano, e acende página por página enquanto o Nico monta |
| REPLAY com "SEU CIRCUITO = SEU ALGORITMO" | a descida da bolinha no fim de cada fase | o circuito montado já é o replay; sem quadro de resumo |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | abertura em close, demonstração e `?` | fluxo da plataforma |
| estrelas 90-70 | `showLevelComplete` com 3 estrelas | padrão da rodada |

## 13. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts logic.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts
        room.ts board.ts pages.ts nico.ts header.ts guide.ts bubble.ts banner.ts tap.ts
```

- `logic.ts` — `build(pieces, order)` devolve onde cada peça parou e qual caiu; `path(phase)` devolve os pontos da descida. A resposta certa nunca fica nos dados.
- `levels.ts` — os níveis e `validateLevels`.
- **Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas, grades e ordem de células do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF15CO02/circuito-de-bolinha/` substitui a reserva sem mudar código. O fantasma e as miniaturas das páginas são as mesmas imagens das peças (tingidas e reduzidas), então funcionam igual com a arte nova.

## 14. Dúvidas

1. **Linha de arte.** O TEXTURAS está na linha padrão da rodada, **chibi de figurinha** (`references/19`). Se quiser outra, os prompts trocam só o bloco de estilo.
2. **Borda pulsante.** As páginas da bandeja e o MONTAR ligado ganham a borda amarela pulsante (igual em todas as páginas, para não apontar a certa). Se a tela ficar agitada, a borda sai das páginas e fica só no MONTAR.
3. **O nome do Nico e da Pipoca** são provisórios.

## Histórico

- 20/10/2026: plano completo e N1 em Graphics. Id 133 no catálogo, `NEXT_FREE_ID` = 134. Servidor `jogos-dev-circuito` (porta 5317).
- Jogado no Chrome headless (o Browser pane travou em "policy check"): a abertura inteira (close, caixa, fantasma, páginas, a demonstração da regra), as três fases até "Nível 1 completo!" (`CORRECT_ANSWER` por fase e `GAME_COMPLETED` `stage: 1`), o erro na fase 2 (*"Faltou um bloco embaixo do bloco!"*, `WRONG_ANSWER` + `GAME_OVER`) e o `?`.
- Ajustes depois de ver: o fantasma ganhou contorno marrom (branco puro sumia na parede), a peça que cai fica deitada em cima da mesa (antes sumia atrás do manual), o balão do Nico ficou mais estreito e acima da cabeça dele para não cobrir a mesa, e o balão do `?` desceu para baixo da mesa.
