# Ilha dos Códigos — EF01CO05

**Representar informação usando diferentes codificações.**

O baú fala uma mensagem num código. Embaixo aparecem **três cartões**, cada um
com a mensagem inteira escrita em **outro** código. Um toque no cartão certo
abre o baú. É só isso — um gesto, nenhuma leitura obrigatória.

## Estado: 3 níveis, completo

**Praia** (batidas → cor), **Trilha** (cor → desenho) e **Gruta**
(desenho → som), cinco baús cada. `LEVELS.length` é 3, então a plataforma
recebe `totalStages: 3` e a criança é aprovada ao terminar a Gruta.

## O laço com a habilidade

A mesma informação (SOL, PEIXE, LUA) existe em quatro vistas, e nenhuma
delas é "a verdadeira":

| Informação | Batidas | Cor      | Desenho | Som       | Frame do sheet |
|------------|---------|----------|---------|-----------|----------------|
| SOL        | 1       | vermelho | sol     | chocalho  | 0              |
| PEIXE      | 2       | azul     | peixe   | splash    | 1              |
| LUA        | 3       | amarelo  | lua     | tambor    | 2              |

A ficha da habilidade fala em "banana" no lugar da lua. Quem manda aqui é a
arte: `simbolos-ilha.png` traz sol, peixe, **lua** e coco — não tem banana.
Trocar o nome não muda nada para a criança (ela vê um medalhão, não uma
palavra) e evita ter um símbolo desenhado à mão no meio de três de pedra.

**Nível 1 — Praia (batidas → cor).** O baú bate o tambor, a criança responde em
cores. Cinco baús de **2 símbolos**, com a dificuldade crescendo pelas
distratoras — não pelo tamanho da mensagem:

- **baús 1 a 3:** as duas distratoras erram nas duas posições;
- **baús 4 e 5:** cada distratora acerta uma posição e erra a outra, então a
  criança precisa comparar símbolo por símbolo.

**Nível 2 — Trilha (cor → desenho).** Cinco baús de **3 símbolos**, e a legenda
só aparece nos **5 s iniciais de cada baú** — depois disso é preciso reabrir
pelo botão. Mesma progressão de distratoras:

- **baús 1 e 2:** as distratoras erram nas três posições;
- **baús 3 a 5:** cada distratora erra uma posição só, e as mensagens passam a
  repetir símbolo (`SOL, PEIXE, PEIXE`) — não dá para resolver contando cores
  diferentes.

**Nível 3 — Gruta (desenho → som).** Cinco baús de 3 símbolos, **sem legenda
depois do primeiro baú**, e as distratoras erram uma posição só do começo ao
fim. É o único nível em que a resposta é sonora, então cada cartão ganha um
**alto-falante** que toca os três instrumentos antes de escolher (`playsOnTap`)
— de graça e sem limite, como reouvir a pista. O corpo do cartão escolhe; o
crachá só ouve.

A resposta certa gira entre os três lugares (`correctAt` 0,1,2,0,1 na Praia,
1,2,0,2,0 na Trilha e 2,0,1,2,1 na Gruta) para não virar "é sempre a do meio",
e nenhum nível repete a sequência do outro.

**O tamanho das peças se ajusta sozinho.** Com 2 símbolos a pista usa peças de
136 px e o cartão fica largo; com 3, tudo cai para 120/92 px para as três
opções caberem lado a lado em 1280 (`clueTile`, `optionTile` em
`data/layout.ts`).

## Sem texto

A criança do 1º ano não lê. Então nada do que ela precisa para jogar está
escrito:

- a **barra do topo** diz o par de códigos com dois ícones e uma seta;
- a **legenda** é uma tabela de figuras com um `=` no meio, e o botão que a
  abre também é `[ícone] = [ícone]`;
- a **seta piscando** entre a pista e os cartões diz para onde olhar;
- o **cadeado** no baú mostra que ele está fechado, e cai quando abre;
- o **painel do canto superior esquerdo** mostra o nível e, embaixo, uma
  bolinha por baú: verde o que já abriu, amarela o de agora, creme o que falta;
- parado por 6 s, os **três cartões dão um pulinho em sequência** — é o jogo
  dizendo "escolhe um destes" sem uma palavra;
- no acerto, o cartão certo fica verde junto com a moldura da pista, o cadeado
  cai e a moeda voa para o baú da trilha. **Nenhum painel interrompe** — o
  "pista = resposta" é dito pela cor das duas molduras, e a reprise no fim do
  nível mostra os cinco pares de uma vez;
- e então vem a **viagem**: o HUD apaga, a câmera fecha em 1,34× sobre a ilha e
  o explorador **anda até o próximo baú com a animação de andar**, antes de a
  câmera abrir de novo. É o único momento em que o jogo tira a mão da criança —
  e é o que dá a sensação de estar percorrendo a ilha.

Texto só existe em três lugares que a criança pode ignorar: o tutorial (3
frases curtas, uma vez), o botão `?` que o repete e o painel de fim de nível.

## Erro: TRAVA, não punição

O baú **não abre** no toque errado. O cartão errado balança, esmaece e sai de
jogo; a moldura da pista pisca em vermelho; a legenda reacende sozinha; o baú
treme e o cadeado sacode. Depois de **2 erros no mesmo baú**, o cartão certo
pulsa — só o toque certo destrava.

Reouvir a pista (o baú ou o botão de alto-falante na moldura) e reabrir a
legenda **não custam nada**.

## Pontos

+10 no acerto de primeira, +5 depois da trava. Nenhum número aparece na tela —
o progresso são os cinco baús da trilha, que abrem e ganham um brilho.

## Conversa com a plataforma

`runtimeGameBridge`, sempre. `stage` é o número do NÍVEL, nunca o baú.

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez |
| `CORRECT_ANSWER` | a cada baú aberto |
| `WRONG_ANSWER` | a cada cartão errado — custa uma vida |
| `CHECKPOINT` | a cada baú e a cada trava |
| `GAME_COMPLETED` | ao fim de **cada** nível, com `totalStages: LEVELS.length` |

`GAME_OVER` nunca sai daqui: quem emite é `shared/hud/createLives` quando as
vidas zeram. O saldo atravessa o `scene.restart` por `lives: this.livesLeft`;
só o botão "Jogar de novo" devolve as vidas cheias.

## Se for mexer

**O código `figura` vem do sprite sheet; os outros três são Graphics.**
`simbolos-ilha.png` é uma tira **vertical** de quatro medalhões de pedra
(250 × 250 cada: sol, peixe, lua, coco) e o jogo usa os frames 0, 1 e 2 — o
coco sobra. As contas de cor, os tambores das batidas e os instrumentos são
desenhados em `scenes/symbols.ts`, porque não existe arte para eles.

`buildGlyph` é quem decide: `figura` com a textura carregada vira sprite, e
qualquer outro caso cai no `drawSymbol`. O desenho à mão de sol, peixe e lua
continua ali como reserva — se o PNG faltar, o jogo roda igual, só mais
pobre.

**As figuras não podem vazar a cor.** Os medalhões são todos do mesmo tom de
pedra, e é por isso que a Trilha (cor → desenho) funciona: se o sol fosse
amarelo, a criança resolveria pela cor e o código deixaria de ser código. Na
reserva desenhada vale a mesma regra — tudo sai em `C.glyph`.

**Os níveis moram em `data/levels.ts`, e só ali.** Cada baú guarda a mensagem,
duas distratoras e em que posição a resposta certa entra. Nada é sorteado: o
que a criança vê é o que está escrito no arquivo.

**A pista e os cartões compartilham a mesma função de desenho**
(`createStrip`). É isso que faz "🥁🥁 = azul" parecer a mesma coisa dita duas
vezes, e não duas listas soltas.

**O cartão muda de tamanho com o tamanho da mensagem** (`optionWidth` em
`data/layout.ts`). Com 2 símbolos ele fica largo e as peças grandes — que é o
caso do nível 1. Com 3, tudo encolhe para as três opções caberem lado a lado
em 1280.

## O que falta conferir com gente

- ouvir 1, 2 e 3 batidas num fone e confirmar que uma criança as separa;
- ouvir chocalho, splash e tambor no mesmo fone — são os três da Gruta, e é lá
  que a confusão custa vida;
- jogar os três níveis no mudo, só pelos desenhos (todo som tem grafismo
  próprio: os tambores das batidas, o maracá, a gota e o tambor com baquetas);
- ver se uma criança de 1º ano entende, sem ninguém explicar, que os três
  cartões são a mesma mensagem em outro código.
