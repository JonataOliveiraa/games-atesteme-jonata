# Lanche em Camadas — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO01 · 5º ano · Pensamento Computacional · Listas e grafos** · id **121** · pasta `src/games/EF05CO01/lanche-em-camadas/`

> **(EF05CO01)** Reconhecer objetos do mundo real e/ou digital que podem ser representados através de listas que estabelecem uma organização na qual há um número variável de itens dispostos em sequência, fazendo manipulações simples sobre estas representações.

Pedido do usuário (15/10/2026): *"jogos EF05CO01 foram muito difíceis de fazer e a maioria ficou ruim, queria uma ideia sua"*, *"queria um jogo menos complexo e que fosse divertido a gameplay"*, *"planeje e faça só n1 em Graphics"*.

---

## 0. Por que não é a ficha

A ficha *Pátio de Vagões* (trem = lista; desengatar, engatar e trocar vagões; voltinha de 8 s) era o **Revezamento em Lista (077)** com vagões no lugar de nadadores: o mesmo painel de pedidos, a mesma volta depois de cada operação, o mesmo pedido livre no N3. E o tema trem já existe no Trem Peça & Programa (101) e na Etiqueta Certa (114).

| Irmão | O que faz | O que aprendemos |
|---|---|---|
| **Baralho das Listas (031)** | inserir, remover, substituir e buscar cartas | é o exemplo da BNCC ao pé da letra, e é um exercício |
| **Revezamento em Lista (077)** | editar a escalação com toques e ver a prova nadar | 4 rodadas de correção: pegar-e-soltar confuso e um tutorial enorme para explicar que "a prova executa a lista" |

Aqui a criança **constrói** a lista com o corpo (pegando na ordem), e a ordem errada aparece no próprio objeto: um lanche montado fora de ordem.

## 1. O jogo em uma frase

**O cliente pede um lanche; a receita é uma lista; pegue os ingredientes que o chef joga, um de cada vez, na ordem da receita.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **objeto do mundo real representado por lista** | o lanche e a receita dele: o mesmo lanche, em camadas no prato e em cartões numerados no alto |
| **itens dispostos em sequência** | cada camada tem posição: 1º embaixo, 2º em cima dele… e a receita mostra 1º, 2º, 3º |
| **número variável de itens** | lanches de 3, 4 e 5 camadas no N1 |
| **manipulações simples** | N1: inserir no fim (cada ingrediente pego vai para o topo). N2 e N3 (planejados): tirar, pôr no meio, trocar, procurar |
| a ordem importa | queijo embaixo da carne é um lanche errado, e o cliente faz careta |

## 3. O laço

1. **Chega um cliente** ao balcão e pede: *"Quero um X-Burguer!"*. A **receita** aparece no alto como uma fila de cartões: `1º pão de baixo · 2º carne · 3º pão de cima`.
2. **O chef**, na janela da cozinha, joga ingredientes para o alto, um de cada vez. Eles caem devagar, cada um numa raia, com uma sombrinha no chão mostrando onde vão cair.
3. **A criança anda** só para a esquerda e a direita, segurando a bandeja, e põe a bandeja embaixo do ingrediente **da vez**.
   - **Pegou o da vez:** ele pousa no topo do lanche com um *ploc*, e o cartão dele acende na receita.
   - **Deixou cair:** quica no chão e some. **Não custa nada**; o chef joga de novo.
   - **Pegou fora da ordem:** o ingrediente pousa no lugar errado do lanche, o cliente faz careta e a faixa diz *"Era a vez da carne!"*. Errou, perdeu.
4. **Lanche completo** (o pão de cima pousou): o ajudante leva ao balcão, o cliente morde e comemora. Vem o próximo cliente.

## 4. Controle (um gesto só)

| Onde | O quê | Teclado (em silêncio) |
|---|---|---|
| canto inferior esquerdo | **◀** segurar anda para a esquerda | A, ← |
| canto inferior direito | **▶** segurar anda para a direita | D, → |

Os dois polegares, um em cada canto. Não há botão de ação: pegar é estar embaixo.

## 5. A tela (1280 × 720, sem rolagem)

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │   1º[🍞]  2º[🥩]  3º[🧀]  4º[🍞̂]   (a receita)   │ (?) │  faixa 96
├───────────────────────────────────────────────────────────────────────┤
│                    ┌──────────────┐                                    │
│                    │  👨‍🍳 janela   │      🧀                            │
│         🥩         └──────────────┘                     ┌──────────┐   │
│                                                         │ 🙂 cliente│   │
│                          ▄▄▄ ← o lanche                 │  balcão   │   │
│                         🧒  (ajudante com a bandeja)    └──────────┘   │
│ ═══════════════════ chão ═════════════════════════════════════════════│
│ (◀)                                                              (▶)  │
└───────────────────────────────────────────────────────────────────────┘
```

- **Faixa do alto** (cabeçalho em faixas): o nível e as bolinhas (um lanche por bolinha), **a receita** no meio e o `?` à direita.
  - A receita é uma fila de cartões com o número da posição em cima (1º, 2º…).
  - Cartão pego acende; os outros ficam claros. **Nenhum cartão aponta "o próximo"**: o próximo é o primeiro ainda apagado.
- **A cozinha** (fundo): a parede, a janela do chef no meio e o balcão à direita, onde o cliente espera.
- **O ajudante** anda entre x 170 e 1040, com a bandeja acima da cabeça. O lanche cresce em cima dela e balança um pouco quando ele anda.
- **5 raias** de queda (x 230, 420, 610, 800, 990).

**Teto de coisas na tela:** no máximo **2 ingredientes no ar** ao mesmo tempo, e nunca na mesma raia. Tocáveis: só ◀ ▶.

## 6. O N1 — MONTE NA ORDEM

Um assunto só: **seguir a ordem da lista**, e cada pego vai para o fim (o topo do lanche).

| | Cliente | Pede | Receita (de baixo para cima) | Queda |
|---|---|---|---|---|
| 1 | Nina | *"Quero um X-Burguer!"* | 1º pão de baixo · 2º carne · 3º pão de cima | 150 px/s |
| 2 | Caio | *"Um X-Queijo, por favor!"* | 1º pão de baixo · 2º carne · 3º queijo · 4º pão de cima | 165 px/s |
| 3 | Vovó Zezé | *"Quero um X-Salada!"* | 1º pão de baixo · 2º carne · 3º queijo · 4º alface · 5º pão de cima | 180 px/s |

**O chef joga:** a cada ~1,5 s um ingrediente, e no máximo 2 no ar. O da vez aparece **no máximo a cada 2 jogadas**. Os outros vêm do resto da cozinha (pão de cima, tomate, queijo…), inclusive coisas que já foram ou que vêm depois. A raia de um ingrediente que **não** é o da vez fica longe da bandeja quando possível. O jogo não esconde a escolha, mas também não arma emboscada.

**Validação** (`validateLevels`, DEV):
- toda receita começa com **pão de baixo** e termina com **pão de cima**;
- o tamanho cresce de lanche em lanche (3 → 4 → 5);
- os ingredientes existem;
- a velocidade cresce.

## 7. Erro (a cena antes do `lose()`)

Pegar fora da ordem: o ingrediente pousa no lanche (o erro **fica visível** na pilha). O cartão que era da vez treme na receita, o cliente faz careta (*"Eca! Fora da ordem!"*) e a faixa grande diz **"Era a vez da carne!"**. Depois de ~2 s vêm `WRONG_ANSWER` e `lose()`.

Deixar cair nunca é erro.

## 8. Abertura e tutorial do N1 (uma vez)

Cada passo tem uma animação, e o balão espera o botão. Nenhum balão fala de botão ou tecla.

1. **O cliente chega** ao balcão. Close na Nina e no ajudante. **Nina:** *"Quero um X-Burguer!"* [Próximo].
2. A receita aparece **grande** no meio da tela, cartão por cartão. **Guia:** *"A receita é uma lista."* [Próximo] → (recorte nos números) *"Cada camada tem sua vez."* [Próximo]. A receita encolhe para o alto.
3. **Demonstração, com a queda parada nos momentos certos:** o chef joga um **queijo**, e o ajudante se afasta e deixa cair (quica, some). O chef joga o **pão de baixo**, e o ajudante anda até embaixo e pega. O cartão 1º acende. **Guia** (recorte no lanche e no cartão 1º): *"O 1º vai embaixo."* [Próximo] → *"Pegue na ordem!"* [Próximo] → *"Sua vez!"* [Vamos!].
4. O pão de baixo da demonstração **fica**: a criança continua do 2º.

O `?` (no jogo) tem dois balões: *"Pegue o próximo da receita."* (recorte na receita) e *"O 1º vai embaixo."* (recorte no lanche).

## 9. Fim do nível

O último cliente morde, confete, `GAME_COMPLETED` e `showLevelComplete` com JOGAR DE NOVO (só existe o N1). Não há quadro de resumo nem replay.

## 10. N2 e N3 (só planejados; entram quando o usuário pedir)

- **N2 — O CLIENTE MUDOU O PEDIDO.** No meio da montagem o cliente grita *"sem queijo!"* (o cartão sai e os de depois andam uma casa para trás: **remover**) ou *"põe tomate depois da carne!"* (um cartão novo entra no meio: **inserir**). A criança segue a lista nova.
- **N3 — PROCURAR E TROCAR.** *"Tem picles nessa receita?"* (**buscar**: pegar o picles se tiver, deixar cair se não tiver) e *"troque o pão por pão de batata"* (**substituir**). Lanches de 6 camadas, com 2 carnes.

## 11. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts ingredients.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts guide.ts
        header.ts recipe.ts helper.ts drops.ts customer.ts chef.ts controls.ts
        bubble.ts banner.ts
```

**Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas e grades do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF05CO01/lanche-em-camadas/` substitui a reserva sem mudar código.

## 12. Dúvidas

1. **Linha de arte:** o TEXTURAS vai na **chibi voador** (`references/35-chibi-voador.webp` anexada). Se for outra, trocam só os blocos STYLE.

## Histórico

- 15/10/2026: plano e N1 em Graphics. Id 121 no catálogo (order 317), `NEXT_FREE_ID` = 122, servidor `jogos-dev-lanche` (porta 5275). Jogado no navegador do começo ao fim: a abertura em close, a receita grande, a demonstração (o queijo cai sozinho e o pão de baixo é pego), os 3 lanches até "Nível 1 completo" e o erro (`WRONG_ANSWER` + `lose()`).
- O balão do cliente sai **ao lado** do rosto (no close não cabe em cima), e o balão do *"O 1º vai embaixo"* fica em `balloonY` 200, acima do recorte da bandeja.
