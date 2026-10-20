# Rádio da Escola — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO09 · 5º ano · Cultura Digital · Segurança e responsabilidade no uso da tecnologia** · id **129** · pasta `src/games/EF05CO09/radio-da-escola/`

> **(EF05CO09)** Usar informações considerando aplicações e limites dos direitos autorais em diferentes mídias digitais.

Pedido do usuário (20/10/2026): *"poderiamos fazer um jogo estilo Muse Dash / Guitar Hero, onde temos 4 linhas e vem as notas e o jogador deve clicar nos lugares certos. cada fase o jogo mostra 2 cds no n1, 4 no n2, e 6 no n3. o jogador deve escolher apenas 1 que permite tocar."* — *"planeje o jogo, faça o jogo, com apenas n1 por enquanto, e faça usando Graphics."* Arte na linha **pop chapado** (`references/30`, `31`, `32`).

**Refeito no mesmo dia** depois de jogar a 1ª versão: *"nao gostei da interface, e o personagem nao deveria ficar fixo la, e sim aparecer so umas vezes… o jogo é de musica, entao espero um ambiente mais voltado a isso… o painel de tocar as musicas… deveria ser estilo da imagem que estou enviando* [duas telas do Project Sekai]*… a personagem duda deve usar roupas de uma cantora… o bg deveria ser algo meio roxo com estrelas e luzes e universo."* Saíram o estúdio da escola, a janela do bairro, o aparelho de CD e o letreiro de parede. A Duda deixou de ficar parada na tela.

---

## 0. Por que não é a ficha

A ficha *Rádio da Escola* era a ficha original da **A Guilda dos Criadores (088)** com outra roupa: os mesmos quatro selos, as cinco cartas de atitude, o medidor, o mini-carimbo de criação (aqui, o REC) e até a mesma "música da chuva" e a mesma obra "misteriosa". O gesto central (tocar na faixa e escolher 1 de 5 cartas) é o menu de múltipla escolha do **Curadoria com Créditos (039)**, e o selo desenhado em cada faixa entregava a carta certa.

| Irmão | O que faz | O que fica de fora daqui |
|---|---|---|
| **Curadoria com Créditos (039)** | completar a etiqueta de crédito escolhendo num menu | o menu: aqui a criança lê o que o **dono** escreveu |
| **A Guilda dos Criadores (088)** | virar a obra, copiar carimbo e nome; pedir com a campainha; criar a sua | o "virar e copiar": aqui o bilhete está à vista e a decisão é **tocar ou não** |

O que este jogo traz de novo: **o dono decide se a música dele vai ao ar**, o dono **ouve ao vivo** e reage, e, no N2, **misturar** a música de alguém (o remix).

## 1. O jogo em uma frase

**O show da rádio vai ao ar do palco no espaço: escolha o CD cujo dono deixa tocar e toque a música com as notas que descem pela pista de 4 linhas.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **toda obra tem dono** | cada CD tem a capa e um **bilhete do dono**, escrito por ele |
| **limites** | o dono pode dizer **não** ("Fiz só pra minha avó. Não toca na rádio!"), e o não vale |
| **aplicações** | o CD que pode vai ao ar, e o cabeçalho mostra **NO AR · ♪ música da Bia**: tocar com permissão é tocar dizendo de quem é |
| **mídias digitais** | a música sai do CD (que gira no fundo da pista) e vai ao ar, ao vivo |
| **consequência social** | o dono está ouvindo: aparece numa bolha **ao vivo**. Se ele deixou, dança. Se não deixou: *"Ei! Eu não deixei tocar!"* |

**O teste da bolinha.** Trocando os CDs por bolinhas sem bilhete, a escolha vira chute: tudo o que decide está escrito pelo dono. Nenhum selo, cor ou lado marca o certo. O jogo de ritmo, sozinho, não ensina a habilidade: ele é o **prêmio** de ter escolhido certo.

## 3. O laço

1. **Chegam os CDs.** Os 2 CDs da fase flutuam até o meio do palco, grandes, cada um com a capa e o bilhete do dono preso embaixo. O resto escurece. No alto: *"Qual CD pode tocar na rádio?"*
2. **A criança toca num CD.** O disco sai do estojo e voa até o **fundo da pista**, onde fica girando: é dali que as notas saem.
3. **No ar.** Vinheta, o cabeçalho acende **● NO AR · ♪ música da Bia**, e a **bolha ao vivo** da dona aparece à esquerda, ouvindo. A Duda entra rapidinho pela direita, cantando, e sai (pela direita para não tapar a bolha do dono).
4. **Se o dono deixou: a música toca.** As notas descem pela pista em perspectiva, e a criança toca cada uma quando ela chega na **linha de acerto**. Cada nota tocada soa a melodia, acende um facho de luz na linha, mostra **PERFEITO!** ou **BOA!** e soma o **COMBO**. A cada 8 de combo a dona reaparece dançando. **Nota perdida não custa nada**: ela passa apagada, o combo volta a zero e aquele pedacinho da melodia fica mudo.
5. **Fim da música.** A bolha da dona volta: *"Tocou! E falou meu nome!"*, a bolinha da fase acende e o disco some.
6. **Se o dono não deixou:** a música começa, a bolha do dono aparece **brava** (*"Ei! Eu não deixei tocar!"*), o disco **trava com um risco**, o NO AR pisca e apaga, as notas caem apagadas, a Duda entra assustada e a faixa diz *"O Téo não deixou tocar."* — errou, perdeu.

## 4. Controle

| Momento | Gesto | Teclado (em silêncio) |
|---|---|---|
| escolher o CD | tocar no CD (estojo ou bilhete) | — |
| tocar a música | tocar na **linha** da nota (a faixa de baixo da pista inteira vale) | A S D F · ← ↓ ↑ → · 1 2 3 4 |

Tocar uma linha sem nota por perto só acende a linha: nada é cobrado. Errar a mira nunca é erro. Nenhum controle tem etiqueta de tecla.

## 5. A tela (1280 × 720, sem rolagem)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │   ● NO AR  ♪ música da Bia  (ou a pergunta)   │    (?)   │  faixa 76
│  ✦        ✧        ╭─◎─╮  ← o disco girando           ✦          ✧      │
│   ╲ luz            ╱    ╲                                    luz ╱       │
│  (bolha ao       ╱  ▬    ╲                               COMBO           │
│   vivo do       ╱      ▬  ╲                                23            │
│   dono)        ╱   ▬        ╲                                            │
│              ╱   PERFEITO!    ╲                                          │
│   ✧ plateia ╞════╪════╪════╪════╡ ← linha de acerto       plateia ✧     │
│            ╱      ╱      ╲      ╲                                        │
└──────────────────────────────────────────────────────────────────────────┘
```

| Região | Onde | O quê |
|---|---|---|
| **cabeçalho** | y 0–76, faixa escura translúcida | nível + bolinhas · a pergunta (na escolha) ou **● NO AR · ♪ crédito** (no ar) · `?` |
| **o palco** | fundo inteiro | universo roxo com nebulosa, estrelas, torres de luz nos cantos de cima, plataforma do palco embaixo e a plateia com bastões de luz nos cantos de baixo. Em código: estrelas piscando e dois fachos de luz que varrem devagar |
| **a pista** | centro, em perspectiva | ponto de fuga em (640, 73); o fundo da pista em y 170 (140 de largura); a **linha de acerto** em y 600 (760 de largura, 4 linhas de 190) |
| **o disco** | (640, 132) | o CD escolhido gira no fundo da pista |
| **o acerto** | (640, 520) | **PERFEITO!** / **BOA!** saltando sobre a linha |
| **o combo** | (1130, 300–380) | "COMBO" e o número grande |
| **a bolha ao vivo** | (150, 330), círculo de 200 | o dono ouvindo, dançando ou bravo, com o nome embaixo; aparece e some |
| **a Duda** | entra e sai | grande pela esquerda na abertura e no fim do nível; rapidinho pela direita no início da música e no susto do erro |
| **a escolha** | centro | 2 estojos de 268 em x 460 e 840, y 318, com o bilhete embaixo; o resto sob véu escuro |

**Tocáveis por vez:** na escolha, 2 (os CDs). Na música, 4 (as linhas). O `?` só funciona na escolha.

**Nota sobre os destaques:** o pedido foi o visual do Project Sekai (PERFEITO, COMBO, facho de luz). Isso contraria o "um destaque por vez" dos outros jogos, mas só durante a música, e a pedido. Na escolha, que é a decisão avaliada, continua valendo: o véu escurece o resto e a borda é igual nos dois CDs.

## 6. O N1 — QUEM DEIXA TOCAR?

Um assunto só: **o dono decide**. Duas músicas por fase, um dono deixa e o outro não. O bilhete é claro (para 5º ano, a pista mora no conteúdo e pode ser direta).

| Fase | CD da esquerda | CD da direita | Música | Queda |
|---|---|---|---|---|
| 1 | **Chuva no Telhado** · Bia · *"Pode tocar na rádio! Só fala que é minha."* ✅ | **Parabéns, Vovó!** · Téo · *"Fiz só pra minha avó. Não toca na rádio!"* | 96 BPM · 12 notas, uma a cada 2 tempos | 2,3 s |
| 2 | **Canção do Gato** · Malu · *"Ainda não terminei. Não pode tocar!"* | **Batuque do Recreio** · Caio · *"Gravei pra rádio da escola. Pode tocar!"* ✅ | 100 BPM · 16 notas | 2,2 s |
| 3 | **Foguete Dançante** · Iara · *"É segredo da minha banda. Não toca!"* | **Pula-Corda** · Juca · *"Pode tocar! E fala meu nome no ar."* ✅ | 104 BPM · 19 notas | 2,1 s |

- O certo muda de lado (E, D, D). A capa mais chamativa (o foguete) é de quem **não** deixa.
- Nunca há duas notas ao mesmo tempo no N1, e o menor intervalo é 1 tempo (~0,58 s).
- Cada linha é uma nota da música (grave → agudo, da esquerda para a direita): tocar a linha certa toca a melodia certa.
- **PERFEITO!** até 70 ms da linha, **BOA!** até 170 ms. Fora disso, a nota passa.
- **Validação** (`validateLevels`, DEV): exatamente 1 CD deixa por fase; o bilhete de quem deixa diz "Pode" e o de quem não deixa diz "Não"; o certo não fica do mesmo lado nas 3 fases; a música tem só `1–4` e `.`, começa depois da contagem, sem notas a menos de 1 tempo; a queda não fica mais lenta de fase em fase.

## 7. Erro (a cena antes do `lose()`)

O CD de quem não deixou vai ao ar como o outro: o disco gira, o NO AR mostra o nome dele e as primeiras notas começam a descer. ~1,5 s depois a bolha do dono aparece **brava** com o balão *"Ei! Eu não deixei tocar!"*, o disco **trava com um risco**, o NO AR pisca e apaga, as notas caem apagadas, a Duda entra assustada, e a faixa grande diz **"O Téo não deixou tocar."** Depois de ~2,6 s vêm `WRONG_ANSWER` e `lose()`.

Perder notas nunca é erro.

## 8. Abertura e tutorial do N1 (uma vez)

Cada passo tem uma animação, o balão espera o botão, e nenhum balão fala de botão ou tecla.

1. **A Duda entra grande** pela esquerda, com o palco escurecido. Duda: *"Oi! Eu sou a Duda, a cantora da rádio!"* [Próximo] → *"Hoje você toca as músicas comigo!"* [Próximo]. Ela sai.
2. Chegam 2 CDs de exemplo (Rosa: *"Não toca, é surpresa pra festa!"* · Zeca: *"Pode tocar! É pra todo mundo ouvir."*). Guia (recorte nos estojos): *"Toda música tem um dono."* [Próximo] → (recorte nos bilhetes) *"O bilhete diz se pode tocar."* [Ver]
3. **Demonstração:** o jogo toca no CD do Zeca, o disco voa para o fundo da pista, o cabeçalho acende **NO AR · ♪ música do Zeca**. Guia (recorte no cabeçalho): *"No ar, o nome do dono!"* [Próximo] → a bolha do Zeca aparece; (recorte na bolha) *"O dono ouve ao vivo!"* [Ver]
4. Quatro notas descem e são tocadas sozinhas (PERFEITO!, o combo sobe, o Zeca dança). Sem balão.
5. *"Sua vez!"* [Vamos!] — o disco some e chegam os CDs da fase 1.

O `?` (na escolha) é um balão só: *"Leia o bilhete de cada dono."* com o recorte nos bilhetes. Na 1ª escolha de quem já viu o tutorial: *"Qual CD pode tocar?"* com o recorte nos bilhetes.

## 9. Fim do nível

A última dona agradece, a Duda entra comemorando, confete, `GAME_COMPLETED` e `showLevelComplete` com **estrelas pelas notas tocadas** (≥ 90 % = 3, ≥ 70 % = 2, senão 1) e avança sozinho para o próximo nível (JOGAR DE NOVO só no fim do N3). Não há quadro de resumo nem replay de créditos.

Pontos da plataforma: 10 por CD certo (30 no N1). As notas não dão nem tiram pontos.

## 10. O N2 e o N3 (feitos em 20/10/2026, a pedido)

Um assunto novo por nível. Os donos do N1 voltam com **o mesmo bilhete sobre tocar** (quem disse não continua dizendo não), e entram 8 donos novos (`donos2.png`) e 11 capas novas (`capas2.png`).

### 10.1 N2 — QUEM DEIXA MISTURAR? (4 CDs em fila)

**O assunto:** deixar **tocar** não é deixar **mexer**. A pergunta é *"Qual CD pode MISTURAR?"*. Em cada fase há um dono que deixa misturar, pelo menos um que deixa tocar mas **não** deixa mexer (a armadilha), e os que não deixam nada.

**O gesto é o mesmo, e o sentido muda:** a melodia do CD toca sozinha, e as 4 linhas da pista viram as **batidas da Duda** (bumbo, caixa, palmas e prato, com o ícone de cada uma na linha de acerto). Tocar as notas é misturar. O NO AR diz **♪ remix da música da Lia**: o remix também leva o nome do dono.

| Fase | CDs (o certo em negrito) | Queda |
|---|---|---|
| 1 | Bia *"Pode tocar! Mas não mexe na minha música."* · Téo · **Lia** *"Pode tocar e pode misturar! Faz um remix!"* · Malu | 2,2 s |
| 2 | **Davi** *"Pode misturar à vontade! Só fala que é meu."* · Iara · Caio *"Pode tocar. Misturar, não!"* · Rosa | 2,1 s |
| 3 | Juca *"Pode tocar, mas não muda nada!"* · Beto *"Não toca! Ainda tô gravando."* · Zeca *"Pode tocar. Mexer, não!"* · **Nina** *"Pode tocar e misturar com batida!"* | 2,0 s |

- **Erro de quem deixa tocar mas não mexer:** a música dele começa com as batidas por cima, o dono aparece bravo (*"Ei! Eu não deixei mexer!"*) e a faixa diz *"A Bia deixou tocar, mas não deixou misturar."*. Quem não deixa nem tocar reclama como no N1.
- **Abertura (1ª vez):** a Duda entra: *"Agora a gente faz remix!"* → *"Remix é pôr batida na música."*. Na 1ª escolha: *"Só se o dono deixar misturar!"* com o recorte nos bilhetes. No 1º remix certo, antes da música: *"As linhas viram batidas!"* com o recorte na pista.

### 10.2 N3 — SEM BILHETE NÃO TOCA (6 CDs em grade)

**O assunto:** sem o dono dizer que pode, não toca, por mais bonita que seja a capa; e a **música livre** é de quem fez, mas todo mundo pode tocar.

Os 6 CDs ficam numa **grade 3 × 2**, só as capas. Tocar num CD abre o **cartão**: o estojo grande, o bilhete e os botões **TOCAR** e **VOLTAR**. VOLTAR não custa nada. O CD **sem bilhete** mostra no cartão só o contorno tracejado de onde o bilhete estaria, e as capas sem bilhete (unicórnio, dragão roqueiro, castelo de doces) são as mais bonitas do jogo.

| Fase | O certo | Os outros | Queda |
|---|---|---|---|
| 1 | **Gabi**, música livre: *"Música livre! Todo mundo pode tocar. Só fala que é minha."* | Téo, Malu, Iara, Sofia, unicórnio sem bilhete | 2,1 s |
| 2 | **Pedro**: *"Pode tocar na rádio! Eu deixo."* | Rosa, Beto, Téo, Malu, dragão sem bilhete | 2,0 s |
| 3 | **Kauã**, música livre: *"É música livre: pode tocar! Só lembra de mim."* | Iara, Sofia, Rosa, Beto, castelo sem bilhete | 1,9 s |

- **Erro do CD sem bilhete:** a bolha ao vivo mostra a **silhueta com interrogação** (ninguém para dizer sim), o NO AR diz *"♪ música de quem?"* e a faixa: *"Esse CD não tinha bilhete. Sem o dono deixar, não toca."*.
- **Abertura (1ª vez):** a Duda: *"Agora são seis CDs!"*. Com a grade na tela: *"Toque no CD para ler."* (recorte nos estojos), o jogo abre o 1º cartão: *"Leia o bilhete."* (recorte no cartão), fecha, e a dica da fase: *"Sem bilhete, não toca!"*.
- A música livre vai ao ar com o crédito igual (*♪ música livre da Gabi*): livre não quer dizer sem dono.

### 10.3 Validação (`validateLevels`, DEV)

Além do N1: 2, 4 e 6 CDs; exatamente 1 certo por fase (o que deixa **misturar** no N2, o que deixa **tocar** no N1/N3); no N2, pelo menos um "toca mas não mexe" por fase, e quem deixa misturar diz "misturar"; no N3, exatamente 1 CD sem bilhete por fase, e CD sem bilhete só existe na grade; um mesmo CD não muda de bilhete dentro do nível; o certo não fica sempre no mesmo lugar; a queda não fica mais lenta.

## 11. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts levels.ts owners.ts song.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts guide.ts
        header.ts bubble.ts banner.ts stage.ts highway.ts judge.ts live.ts cutin.ts crate.ts
```

- `data/levels.ts`: os níveis, as fases, os CDs (capa, dono, bilhete, se deixa, música) e o par do tutorial.
- A música de cada CD é uma linha de texto (`'1.2.3.4.'`: um caractere por tempo, `1–4` = linha, `.` = pausa), um andamento e as 4 notas das linhas. O acompanhamento (bumbo, chimbal e baixo) sai do andamento. Tudo é sintetizado com WebAudio, sem arquivo de som.
- **A perspectiva da pista** é uma projeção simples: cada nota tem uma profundidade `z` que vai de ~5,4 (no fundo) a 1 (na linha); a escala é `1/z` e a altura na tela sai daí. Por isso as notas nascem pequenas e aceleram ao chegar, como no Project Sekai.
- **O relógio da música é o da cena**: ele só anda no estado `air`, então o tutorial e o congelamento da plataforma param a música junto com as notas.

**Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas e grades do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF05CO09/radio-da-escola/` substitui a reserva sem mudar código. A pista, os fachos, o acerto e o combo são de código e ficam.

## 12. Dúvidas

1. **O nome.** Sem a escola no cenário, *Rádio da Escola* virou o nome do programa que vai ao ar do palco. Se preferir outro título (ex.: *Show nas Estrelas*), troco no catálogo e na capa.
2. **Perder nota não perde a partida.** Só o CD errado encerra; as notas viram as estrelas do fim. A barra de LIFE do Project Sekai ficou de fora por isso.
3. **CD, e não disco de vinil:** o "risco da agulha" da ficha virou o CD travando.
4. O **N2 com remix** (as linhas viram batidas por cima da música) está só planejado.

## Histórico

- 20/10/2026: plano, TEXTURAS e N1 em Graphics. Id 129 no catálogo (order 392), `NEXT_FREE_ID` = 130, servidor `jogos-dev-radio` (porta 5295). Primeira versão (estúdio da escola, janela do bairro, DJ fixa) jogada até o fim e reprovada no visual; refeita no mesmo dia com o palco no espaço, a pista em perspectiva e a Duda cantora em entradas rápidas. Linha de arte trocada de chibi de caderno para pop chapado.
- 20/10/2026 (tarde): texturas geradas pelo time (Codex, linha pop chapado) e montadas pelo Editor: `palco`, `duda`, `capas`, `ui` e a capa `cover-radio-da-escola.png` (registrada no catálogo, og em `public/og/`). O texto do bilhete desceu para baixo da fita (`CRATE.noteTop`). `donos.png` saiu em duas metades (fileiras 1–2 e 3–4) montadas pelo Editor numa escala só. A assinatura do dono foi para a **esquerda** do bilhete: na direita a ponta amassada do papel a escondia (pedido do usuário).
