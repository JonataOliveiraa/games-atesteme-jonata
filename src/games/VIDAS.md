# As vidas dos jogos — onde isto parou

Anotação de trabalho em andamento. As vidas foram para 11 dos 49 jogos;
faltam 38. Este arquivo existe para você retomar sem precisar reconstruir o
raciocínio.

Última mexida: 01/09/2026.

---

## O que se quer

Uma regra só, igual para os 49: a criança começa a partida com as vidas que a
plataforma mandou em `?lives=`, cada erro real custa uma, e no zero sai o
`GAME_OVER` — que é o que reprova o desafio.

As vidas valem pela **partida inteira**, não por nível. Trocar de nível não
devolve vida nenhuma.

O tempo esgotado continua reprovando na hora, sem passar pelas vidas. Isso é
decisão de projeto, não esquecimento.

---

## Como funciona

### O valor chega pelo `registry`, não pelo `START_GAME`

`PhaserCanvas` grava `vidasIniciais` no registry do Phaser dentro do
`preBoot`, antes de qualquer cena existir. É o mesmo caminho do `faseInicial`,
e pela mesma razão: o `START_GAME` chega **depois** do boot, com a cena já
montada, e um jogo que só descobrisse as vidas ali teria que se reiniciar na
frente da criança para desenhar o número certo.

`shared/level/vidasIniciais.ts` lê esse valor. `lives=0` vira 1 e registra o
caso no console: zero reprovaria antes do primeiro toque, o que nunca é o que
se quis dizer.

### A regra mora no componente, não nos jogos

`shared/hud/createLives.ts` desenha o ícone e o número **e** guarda a regra:
no zero, emite `GAME_OVER`, uma vez só. Nenhum jogo decide quando reprovar.

Isso é de propósito. São 49 jogos; 49 contadores escritos à mão seriam 49
chances de errar o mesmo detalhe — e já aconteceu uma vez, no
`desktop-digital-infantil`, onde um contador que não zerava cobrava uma vida
por toque a partir do terceiro.

O jogo continua emitindo o `WRONG_ANSWER` dele (cada um tem o seu
`pointsEarned`). O contrato é:

```ts
runtimeGameBridge.emit({ type: 'WRONG_ANSWER', ... })   // o jogo
this.lives.lose()                                       // e depois isto
```

### O que entra em cada jogo

```ts
// BootScene.preload()
preloadLives(this)

// GameScene.init()
this.livesTotal = vidasIniciais(this, 3)
this.livesLeft = data?.lives ?? this.livesTotal

// GameScene.create() — FORA de container que sofra removeAll()
this.lives = createLives(this, {
    total: this.livesTotal,
    remaining: this.livesLeft,
    gameId: GAME_ID,
    x: 40, y: 40, size: 30,
    stage: () => this.level.level,
})
this.events.once('shutdown', () => this.lives.destroy())

// no erro real
this.lives.lose(); this.livesLeft = this.lives.remaining

// em cada scene.restart que troca de nível
this.scene.restart({ ..., lives: this.livesLeft })
```

O `depth` padrão é **50**: acima do conteúdo do jogo e ABAIXO de qualquer
overlay — tutorial (9000+), intro e fim de nível (180+). Os corações são parte
do header e não flutuam por cima dele.

---

## Ajustar a posição: a tecla M

Só no dev server. Abra o jogo:

```
http://localhost:5174/jogos/<slug>?embed=1&inline=1&stage=1&points=0&lives=3
```

- **M** liga o ajuste: aparece uma moldura verde com as coordenadas
- **WASD** ou **setas** movem de 1 em 1 px
- **Shift** junto move de 10 em 10
- **M** de novo desliga e grava em `lives-positions.json`, na raiz

A moldura mostra a caixa real que o componente ocupa — é assim que se vê se
está encostando em outra coisa do header.

Para aplicar o JSON nos arquivos, um script percorre cada `createLives` e
troca `x`, `y` e `size`. Ele não está versionado; peça que eu refaça.

---

## Onde parou

### Prontos (11)

`base-dos-classificadores` · `corrida-dos-parecidos` · `ritmo-da-rotina` ·
`trilha-do-passo-a-passo` · `oficina-dos-algoritmos` · `pulo-programado` ·
`correio-multimidia` · `passe-da-mensagem` · `pixel-secreto` ·
`desktop-digital-infantil` · `hangar-dos-modelos`

Todos com posição ajustada à mão e gravada no `lives-positions.json`.

### Faltam (38)

Todo o resto de `src/games/`.

---

## O que ainda precisa de decisão

### O ícone está branco em todos

`hp-icon.png` é branco de propósito, para ser tingido pelo `tint` de cada
jogo. Nenhum dos 11 recebeu cor ainda. Em fundo escuro fica bom; no
`pixel-secreto`, de fundo claro e rosado, ele quase some.

Duas saídas: puxar a cor de destaque do `theme.ts` de cada jogo, ou fixar uma
cor só para os 49.

### Sete jogos vão precisar de mão

Estes emitem `acerto ? CORRECT_ANSWER : WRONG_ANSWER` na mesma linha. Chamar
`lose()` ali cegamente puniria o acerto:

`radar-de-confiabilidade` · `curadoria-com-creditos` · `futuro-em-cena` ·
`escolha-a-ferramenta-certa` · `museu-das-estruturas` · `circuito-da-verdade` ·
`arquiteto-das-missoes`

### Quatro jogos têm um segundo sistema de vidas

`cidade-das-decisoes`, `labirinto-do-enquanto`, `monte-seu-computador` e
`missao-arquivo-seguro` reprovam por `consecutiveErrors >=
MAX_CONSECUTIVE_ERRORS`, uma regra própria que ignora as vidas da plataforma.
Com `lives=5`, a criança ainda seria reprovada no 3º erro seguido. Precisa
sumir quando as vidas entrarem.

### A `EmbedGamePage` ainda conta por fora

Enquanto nem todos os jogos contam, [`EmbedGamePage.tsx`][embed] continua
contando os `WRONG_ANSWER` e emitindo o `GAME_OVER` pelos que não sabem
perder. Quando os 49 estiverem prontos, **essa contagem tem que sair** — senão
a partida é julgada duas vezes, e as duas contas podem discordar.

Junto com ela sai a questão do `inline`: hoje o modo `inline=1` desliga a
contagem inteira, porque quem hospeda tem a economia dele. Com a contagem
dentro do jogo, isso deixa de existir — o jogo conta sempre, em qualquer modo.

[embed]: ../pages/EmbedGamePage.tsx

---

## Um bug que não é deste trabalho

O `hangar-dos-modelos` trava depois de responder: mostra o resultado e não
avança para a missão seguinte. Reproduzi com as vidas e **sem** elas, no
código original — não é daqui.

O `nextMission()` nunca roda: a seleção da criança não é limpa, e só ele
limpa. O `this.time.delayedCall(1800, ...)` no fim do `confirmSelection()` não
dispara. Descartei exceção (o console fica limpo e as linhas seguintes rodam),
cena pausada (o jogo responde a toques) e o tutorial (não mexe em `time`).
Sobra o relógio da cena ou os canais `timer-*` do `EventBus`.
