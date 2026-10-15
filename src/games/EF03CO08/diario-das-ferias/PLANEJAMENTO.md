# Diário das Férias — planejamento

EF03CO08 · 3º ano · Cultura Digital · 3ª rodada · id **111** (o `NEXT_FREE_ID` de hoje; só é cadastrado quando o código entrar).
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha original: `docs/rodada-3/EF03CO08.md` (*Teatrinho 3 em 1*).

**Por que não é a ficha (08/10/2026).** A ficha do *Teatrinho 3 em 1* repetia o **Show de Formatos (066)**: palco, uma imagem, uma frase e um som por cena, tema "minha escola" e reprise no fim. A única coisa que dava para errar era tocar uma fileira diferente da que a estrela apontava, e isso não tem a ver com a habilidade. O usuário pediu *"uma mecânica super divertida e simples… um estilo de gameplay (que não seja só arrastar ou clicks simples)"*. A escolha foi o **jogo de foto**: um visor que a criança pilota, bichos que aparecem na hora deles e um clique no momento certo. Da ficha ficaram o teatrinho com plateia no fim, a reprise do que ela criou e os três formatos (imagem, som e texto).

Regras fixas da rodada:
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro **antes**;
- tutorial com `createTutorial`, uma frase curta por balão, **sem mãozinha** (véu, recorte e anel);
- a Duda só fala no **começo e no fim** do nível (e no erro);
- "faça o jogo" = **só o N1**.

---

## 1. O jogo em uma frase

A Duda está de férias na praia com o **tablet**, e a criança é quem segura o tablet. Com o **joystick** ela leva o **visor** até o que quer guardar e escolhe **como** guardar: **FOTO** para o que se VÊ, **SOM** para o que se OUVE. Cada coisa guardada vira uma página do **diário digital**. No fim do nível, a Duda **apresenta o diário no telão do teatrinho da escola**: as fotos aparecem, os sons tocam, o título que a criança escolheu fica no alto, e a plateia aplaude.

## 2. A habilidade

> **(EF03CO08)** Usar ferramentas computacionais em situações didáticas para se expressar em diferentes formatos digitais.
> *Exemplo oficial:* criar uma figura que represente suas férias ou algum evento importante.

| O que a BNCC pede | Onde acontece |
|---|---|
| **ferramentas computacionais** | o tablet, com a câmera (FOTO) e o gravador (SOM); no fim, o telão da apresentação |
| **se expressar** | **ela escolhe o que guardar**: cada momento tem duas coisas, e só uma vai para o diário. O título da apresentação também é dela |
| **diferentes formatos digitais** | imagem (foto), som (gravação) e texto (título e legendas). O diário final mistura os três |
| **exemplo oficial: as férias** | é o tema do jogo: guardar as férias para mostrar para a turma |

**A decisão avaliada é o formato, e a escolha do conteúdo é livre.** Uma foto não guarda o canto de um passarinho escondido, e uma gravação não guarda um arco-íris. Quem aponta o tablet para uma coisa precisa pensar em como aquilo chega até a gente: pelo olho ou pelo ouvido. Isso é o pedaço da habilidade que pode dar certo ou errado. **O que** ela guarda é sempre escolha dela, então não há resposta errada nessa parte.

**O teste da bolinha.** Se trocarmos cada coisa por uma bolinha, o jogo deixa de ter solução: a criança precisa saber se aquilo **aparece** e se aquilo **faz barulho**.

**Os irmãos:**
- *Estúdio Multiformato* (021): a criança escolhe a ferramenta para um pedido e depois desenha ou escreve;
- *Show de Formatos* (066): a criança monta um microclipe com imagem, frase e som, sem certo nem errado;
- *Diário das Férias* (este): a criança **captura o mundo** com o tablet, escolhendo o formato que consegue guardar aquilo, e depois **apresenta** o que guardou.

## 3. Fácil e claro: a régua do usuário

- **O objetivo numa frase, dito no começo** pela Duda: *"Vou guardar minhas férias no tablet pra mostrar pra turma!"*.
- **O objetivo continua visível**: no meio do cabeçalho ficam as **páginas vazias do diário** (5 no N1). Cada coisa guardada preenche uma, e o nível acaba quando todas estão cheias.
- **Um momento por vez, sem relógio.** Cada momento tem **duas** coisas na praia, e as duas ficam ali até a criança guardar uma delas. Os bichos repetem o que fazem para sempre: o golfinho salta de novo, o caranguejo sai de novo.
- **O visor avisa** (memória *gesto físico precisa de trava*): ele fica **aberto e cinza** no vazio e **fecha e clareia** quando está em cima de uma coisa que dá para guardar **naquele instante**. O aviso é igual para todas as coisas, então diz *onde tem algo*, e nunca *qual botão usar*.
- **Errar a mira é de graça**: apertar FOTO ou SOM com o visor aberto não faz nada (só um "tic" e o visor dá uma tremidinha). Nenhum evento é emitido.
- **A primeira vez é guiada**: o momento 1 do N1 é o tutorial, e ensina a FOTO e o SOM com uma coisa de cada.
- **A dificuldade vem só da habilidade.** O visor é grande (260 × 200), as coisas ficam paradas no lugar delas e a janela em que elas estão "ativas" dura pelo menos 1,2 s.
- **No máximo 4 alvos**: 2 coisas na praia, mais FOTO e SOM. O joystick é controle, não alvo.

**Dá para entender sem ler?** Quase tudo: o visor fecha em cima do arco-íris, a FOTO faz flash, e a foto voa para a página. O que se lê é FOTO e SOM nos botões e a frase da Duda no erro, e isso o 3º ano lê.

## 4. O laço

```
um MOMENTO começa: duas coisas entram na praia (o arco-íris aparece,
o passarinho começa a cantar escondido no coqueiro)
        │
        ▼
a criança move o visor com o joystick ──► o visor fecha em cima de uma coisa ativa
        │
        ▼
aperta FOTO ou SOM
  ┌───────────────┬────────────────────────┬─────────────────────────┐
visor aberto      formato que serve        formato que não serve
nada acontece     FOTO: flash, a foto é    FOTO de um som escondido:
(de graça)        o que está no visor      a foto sai só com folhas
                  SOM: as barrinhas        SOM de uma coisa calada:
                  dançam e o som toca      a linha sai reta
                  de novo                  a Duda: "O passarinho não
                        │                  aparece na foto!"
                        ▼                  WRONG_ANSWER + lose()
                  a página voa para o diário · CORRECT_ANSWER
                  a outra coisa vai embora, e o próximo momento entra
```

**Quando os dois formatos servem** (o golfinho que salta e espirra água, a onda que estoura na pedra), FOTO e SOM estão certos. A criança escolhe, e a escolha aparece no diário: a página é uma foto ou um cartão de som. **Essa é a parte da expressão.**

**A foto é de verdade:** o jogo copia o que está dentro do visor naquele instante (`RenderTexture`). Se o golfinho já mergulhou, o visor está aberto e a foto não sai. Se ela fotografa o coqueiro onde o passarinho canta, a foto mostra **só folhas**, e o erro se explica sozinho.

## 5. A tela (1280 × 720)

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | nível + bolinhas em (194, 44); `?` em (1220, 56) | padrão da rodada, sem texto de fase |
| **diário** | centro do cabeçalho, 5 páginas de 74 × 56, x 460–820, y 41 | o objetivo: páginas vazias que se enchem |
| **praia** | toda a tela abaixo do cabeçalho | `bg-praia.png`; as coisas ficam entre y 110 e 520 |
| **visor** | 260 × 200, começa em (640, 300) | cantoneiras desenhadas em código; anda dentro de x 130–1150, y 110–520 |
| **joystick** | centro (140, 610), raio 90 | base + bolinha (`interface.png`) |
| **FOTO** | (1030, 618), 150 × 150 | botão com ícone de câmera e a palavra FOTO |
| **SOM** | (1190, 618), 150 × 150 | botão com ícone de microfone e a palavra SOM |
| faixa do erro | (640, 360), grande | o motivo, antes do `lose()` |

**Os lugares da praia** (fixos, desenhados no fundo; as coisas que aparecem e somem são sprites por cima):

| Lugar | Centro | Serve para |
|---|---|---|
| coqueiro (copa cheia) | (230, 165) | passarinho escondido (só SOM) |
| pedra no mar | (590, 330) | onda que estoura (FOTO e SOM) |
| mar aberto | (770, 310) | golfinho (FOTO e SOM, no salto) |
| céu da direita | (800, 170) | arco-íris (só FOTO) |
| duna alta | (1000, 320) | sorveteiro atrás dela, com a buzininha (só SOM) |
| cabana fechada | (1170, 355) | música saindo pela janela fechada (só SOM) |
| areia, esquerda | (330, 515) | castelo de areia (só FOTO) |
| areia, meio | (590, 515) | toca do caranguejo (só FOTO, quando ele sai) |

**Som "escondido" tem sempre a mesma cara:** **notas musicais** pastel sobem de trás do lugar e algumas folhinhas ou grãos de areia caem. O som também toca de verdade (WebAudio), mais forte quando o visor chega perto. As coisas caladas nunca soltam notas. Não há outro sinal.

**Câmera do Phaser:** fixa. Só a Duda (começo, fim e erro) aparece em close por cima, com a praia escurecida, e o HUD some nesse momento.

**Controles:**
- **Joystick**: toque em qualquer ponto do quarto inferior esquerdo da tela pega o joystick e o visor anda na direção do dedo (velocidade máxima 520 px/s, com aceleração curta);
- **computador**: setas ou WASD movem o visor; `F` = FOTO, `G` = SOM; `Espaço`/`Enter` respondem o balão; `H` repete a ajuda;
- **os botões FOTO e SOM** respondem ao toque e afundam (`FX.press`), com uma borda branca fixa, sem pulsar (memória *um destaque por vez*).

## 6. As coisas, os momentos e os níveis

### Os estados

Cada coisa tem um ciclo, e em cada instante ela está num destes estados:
- **se vê** (`ver`): aparece no visor;
- **se ouve** (`ouvir`): faz som;
- **as duas coisas**;
- **nada**: escondida e quieta, então o visor fica aberto.

`FOTO` vale quando `ver` é verdadeiro no instante do toque, e `SOM` vale quando `ouvir` é verdadeiro. Quem decide é uma **função do estado** (`podeGuardar(coisa, t, formato)`), e não um campo `resposta` nos dados (memória *padrão de remake*).

### N1 — Praia de dia (assunto: o que se VÊ × o que se OUVE)

| Coisa | Ciclo | Estados | Formato que serve |
|---|---|---|---|
| **arco-íris** | parado | sempre `ver` | FOTO |
| **passarinho no coqueiro** | canta 2 s, cala 3 s (`bird.mp3`) | `ouvir` (nunca `ver`) | SOM |
| **caranguejo** | sai da toca e anda 2,2 s, entra e fica 1,4 s | `ver` quando fora | FOTO |
| **sorveteiro atrás da duna** | "fon-fon" 1,4 s, cala 1,2 s | `ouvir` | SOM |
| **golfinho** | salta 1,4 s (com espirro), some 2,2 s | `ver` + `ouvir` no salto | FOTO **ou** SOM |
| **castelo de areia** | parado | sempre `ver` | FOTO |
| **onda na pedra** | estoura 1,3 s, calma 1,8 s | `ver` + `ouvir` no estouro | FOTO **ou** SOM |
| **música da cabana** | toca 2 s, para 0,8 s | `ouvir` | SOM |

| Momento | Coisas | Páginas | Observação |
|---|---|---|---|
| 1 | arco-íris · passarinho | **2** | **guiado** (tutorial): primeiro a FOTO do arco-íris, depois o SOM do passarinho |
| 2 | caranguejo · sorveteiro | 1 | o primeiro sozinho: uma de ver, uma de ouvir |
| 3 | golfinho · castelo de areia | 1 | estreia do "os dois servem" (o golfinho) |
| 4 | onda na pedra · música da cabana | 1 | — |

**5 páginas no N1.** Depois de cada página, a coisa que não foi guardada vai embora (o arco-íris some, o canto para) e o momento seguinte entra.

### N2 — Sítio do vovô (assunto: o mesmo bicho, ora se vê, ora se ouve) · *feito em 08/10/2026*

O que vale depende do **instante**. Cada bicho tem um ciclo com um trecho em que só se ouve (escondido) e outro em que só se vê (calado).

| Momento | Coisas | Ciclo |
|---|---|---|
| 1 | **sapo** · borboleta | sapo: coaxa escondido na água 1,8 s (só SOM) → pula na folha calado 1,8 s (só FOTO) → 0,7 s nada. Borboleta: só FOTO |
| 2 | **galo** · **vaca** | galo: canta atrás do celeiro (só SOM) → sai andando quieto (só FOTO). Vaca: come calada (só FOTO) → muge (FOTO ou SOM) |
| 3 | **cachorro** · abelhas | cachorro: late dentro da casinha (só SOM) → sai e senta quieto (só FOTO). Abelhas na colmeia: só SOM |
| 4 | **pato** · trator | pato: grasna no capim (só SOM) → nada no lago calado (só FOTO). Trator: passa roncando (FOTO ou SOM) |

A estreia (1ª vez, a câmera vai até o sapo): *"O sapo ora canta escondido, ora aparece calado. Guarde na hora certa!"*

**O texto estreia na apresentação:** depois do título, cada página pede uma **legenda** escolhida entre duas frases prontas (as duas valem, por formato: *"Achei o sapo na folha!"* × *"Que sapo verdinho!"*). A frase fica embaixo da página no telão e volta no "Ver de novo".

### N3 — Acampamento à noite (assunto: no escuro, só se vê o que tem luz) · *feito em 08/10/2026*

| Momento | Coisas | Ciclo |
|---|---|---|
| 1 | **coruja** · lua | coruja na árvore escura: só SOM. Lua: só FOTO, sempre |
| 2 | **grilo** · vaga-lumes | grilo no mato: só SOM. Vaga-lumes piscando: só FOTO |
| 3 | **fogueira** · estrela cadente | fogueira: brilha quieta (só FOTO) → estala (FOTO ou SOM). Estrela cadente: só FOTO, quando passa |
| 4 | **sapo na lagoa** · lanterna | sapo no escuro: só SOM. Lanterna da barraca: só FOTO |

Estreia (a câmera vai até a árvore): *"No escuro, a foto só pega o que tem luz. A coruja, só dá pra OUVIR!"* O erro mostra a foto **escura** (o mato sem grilo). Apresentação com título e legendas, como no N2.

### `validateLevels` no import (`console.error` em dev)

- todo momento tem 1 ou 2 coisas, e no máximo 4 alvos na tela;
- a distância entre as duas coisas de um momento é maior que a diagonal do visor (≈ 330), então o visor nunca cobre duas;
- toda coisa fica dentro de x 130–1150 e y 110–520, longe dos controles;
- toda coisa fica **ativa** (algum estado diferente de "nada") por pelo menos 40 % do ciclo, e cada janela ativa dura ≥ 1,2 s;
- cada nível tem ao menos uma coisa que **só se vê** e uma que **só se ouve**;
- o momento guiado do N1 tem exatamente um "só se vê" e um "só se ouve";
- o número de páginas do nível é ≤ 5 (régua do `INSTRUCOES`: no máximo 5 etapas por nível).

## 7. O tutorial (N1, uma vez) e a estreia

`createTutorial`, uma frase por balão, recorte em `shape: 'rect'` e anel no ponto, **sem mãozinha**:

| # | Recorte | Frase | Botão |
|---|---|---|---|
| 0 | — | a Duda, em close: *"Vou guardar minhas férias no tablet pra mostrar pra turma!"* | Vamos lá! |
| 1 | o joystick + o arco-íris | *"Leve o visor até o arco-íris."* | — (espera o visor fechar em cima dele; os botões ficam desligados) |
| 2 | o botão FOTO | *"O arco-íris a gente VÊ. Tire uma FOTO!"* | — (espera; **só** FOTO responde) |
| 3 | a página no diário | *"Guardou! Agora escute o coqueiro…"* | Próximo |
| 4 | o coqueiro + o botão SOM | *"O passarinho está escondido. Só dá pra OUVIR. Grave o SOM!"* | — (espera o visor no coqueiro e o toque em SOM; FOTO desligado) |
| 5 | as páginas vazias | *"Agora é com você: escolha o que guardar!"* | Vamos jogar! |

O que se faz no tutorial conta, e o diário já começa com 2 páginas cheias.

**Estreia do "os dois servem"** (momento 3, golfinho): um balão só, sem recorte de botão: *"O golfinho a gente VÊ e OUVE. Pode FOTO ou SOM!"*. Ele não aponta botão nenhum.

O `?` repete os passos 1, 2 e 4 como texto, com `buttonLabel: 'Continuar'`, e pausa os ciclos enquanto está aberto.

## 8. O erro

| Erro | O que se vê | Faixa (motivo grande) |
|---|---|---|
| **FOTO de algo que só se ouve** | flash; a foto voa até o meio da tela mostrando **o que estava no visor**: folhas do coqueiro, a duna, a cabana fechada; a Duda faz "ops" | *"O passarinho não aparece na foto!"* |
| **SOM de algo calado** | o tablet grava 1 s e a linha das barrinhas fica **reta**, em silêncio; a Duda faz "ops" | *"O arco-íris não faz barulho!"* |

Depois da cena (≤ 1,2 s), `WRONG_ANSWER` + `lose()`, uma vez. Sem vermelho, sem som áspero: só um "blom" grave curto.

**Não é erro:** apertar com o visor aberto; mover o visor para qualquer lugar; tocar fora dos controles.

## 9. O acerto e o fim

**Acerto:**
- **FOTO**: flash branco curto, clique de câmera, a foto (o recorte real do visor numa moldura polaroide) cresce no meio e voa até a página;
- **SOM**: as barrinhas do tablet dançam enquanto o som toca de novo, e um **cartão de som** (ícone do que foi gravado + barrinhas) voa até a página;
- o bicho reage, quando há bicho: o caranguejo leva um susto com o flash, e o golfinho espirra mais água;
- `CORRECT_ANSWER` (+10).

**Fim do nível: a apresentação no teatrinho:**
1. A tela vira o **palco da escola** (`bg-teatrinho.png`), com o telão vazio e a plateia de costas na frente. A Duda fica ao lado do telão.
2. **Título (texto):** três fichas grandes aparecem embaixo, e a criança toca em uma:
   - *"Minhas férias na praia"*;
   - *"Um dia muito legal!"*;
   - *"Olha o que eu vi e ouvi!"*.

   Todas valem. O título sobe para o alto do telão.
3. **A reprise:** as páginas passam no telão na ordem em que foram guardadas, 2 s cada. A foto aparece grande. O cartão de som aparece com as barrinhas dançando e o som tocando. A plateia reage a cada uma, com corações e palminhas desenhados em código e o som de palmas.
4. Dois botões: **Ver de novo** (repete a reprise) e **Continuar**, que leva ao `showLevelComplete`.

O diário fica na memória da sessão: sem nome, sem salvar arquivo e sem galeria (a ficha pedia o nome da criança no cartaz e uma galeria; isso ficou de fora por ser dado pessoal e porque a plataforma não tem cadastro).

## 10. Travas para quem mexer depois

- O formato certo sai do **estado da coisa no instante do toque**, e nunca de um campo `resposta`.
- O visor avisa do mesmo jeito para tudo; não existe cor, ícone ou som diferente que entregue o formato. A única pista do som escondido são as notas e o próprio som, que são **conteúdo**.
- Visor aberto = toque de graça. Erro só quando há coisa ativa e o formato não a guarda.
- Nada pulsa pedindo toque. O que se mexe é o mundo (bichos, notas) e a reação ao toque.
- A cena do erro vem antes do `lose()` e cabe em 1,2 s.
- A Duda não aparece durante o jogo, só no começo, no fim e no erro.
- A foto é sempre o recorte real do visor. Nunca uma imagem pronta.

## 11. Dúvidas

1. **Nome e slug.** Proponho o título **Diário das Férias** e o slug `diario-das-ferias`, no id 111. Também cabe manter **Teatrinho 3 em 1**, já que o fim é no teatrinho, mas o nome promete um jogo que não é este.
2. **Arte.** Você pediu *"leve, pastel, não tão puxada a chibi, mas cartoon"*. A linha está descrita em palavras no TEXTURAS (§1), **sem imagem de referência** (pedido de 08/10/2026).
3. **Errou o formato = perdeu?** Planejei assim, pela regra da rodada. A alternativa é a foto vazia ou a linha reta só "não contarem" e a criança tentar de novo, sem `lose()`.

## 12. Arquivos

**Código** (`src/games/EF03CO08/diario-das-ferias/`):
- `types.ts`, `index.ts`;
- `data/{levels,things,layout,theme,files}.ts` (`things.ts` = ciclos e `podeGuardar`);
- `scenes/BootScene.ts` e `scenes/GameScene.ts` (estado `mode` único: `'tutorial' | 'jogando' | 'guardando' | 'erro' | 'apresentacao'`, `gen`, bridge como na Praia dos Dados);
- `scenes/{beach,things,viewfinder,joystick,tools,diary,photo,stage,duda,banner,hud,guide,audio,art,fallback}.ts`.

O áudio é todo sintetizado em WebAudio, sem arquivo: passarinho (glissandos de seno), buzininha (dois tons quadrados), espirro e onda (ruído filtrado), música da cabana (3 notas em loop), clique de câmera e palmas.

**Texturas** (prompts no [TEXTURAS.md](./TEXTURAS.md), linha nova **cartoon pastel leve**):

| Arquivo | Para quê | N1? |
|---|---|---|
| `bg-praia.png` | a praia com os lugares fixos (coqueiro, pedra, duna, cabana, toca) | sim |
| `coisas-praia.png` | arco-íris, caranguejo, golfinho, castelo, onda | sim |
| `interface.png` | botões FOTO e SOM, joystick, moldura polaroide, cartão de som | sim |
| `duda.png` | a Duda em 6 poses | sim |
| `bg-teatrinho.png` | o palco da escola com telão e plateia | sim |
| `cover-diario-das-ferias.png` | capa com o título | por último |
| `bg-sitio.png`, `coisas-sitio.png` | N2 | depois |
| `bg-acampamento.png`, `coisas-noite.png` | N3 | depois |

**Antes da arte:** o jogo roda com arte de reserva em `Graphics`, nas mesmas chaves e grades do TEXTURAS, e os fundos são assados em textura (memória *Graphics vetorial pesa*).

## 13. A câmera que passeia (versão atual, 08/10/2026)

Pedido do usuário: *"o bg praia é super largo… use para fazer o jogador conseguir mover a camera pelo cenario… faça o jogador poder sacar a camera, dai fica com aqueles movimentos suaves, ui de camera… e de microfone melhore tambem"*. **Esta seção substitui o visor que andava na tela** (§4, §5 e §7 descrevem a versão anterior).

**O mundo.** A praia tem 2044 × 720 (o panorama inteiro). O joystick move a **mira**, e a câmera do jogo a segue com atraso suave (`AIM.follow` = 140 ms) e para nas bordas. Quando a câmera encosta, a mira sai do centro, em vez de a tela ficar presa. O que está fora da vista ganha uma **setinha na borda**, igual para todas as coisas.

**Três jeitos de segurar o tablet** (`scenes/view.ts` e `scenes/viewfinder.ts`):

| Jeito | Como sai | O que a tela mostra | Botão de agir |
|---|---|---|---|
| **livre** | começo, ou tocar de novo na ferramenta da mão | mira redonda pequena | nenhum |
| **câmera** (toque em FOTO) | zoom suave para 1,22×, som de lente, tremidinho de mão | bordas escurecidas, grade de terços, cantoneiras, quadro de foco que fecha sobre o que dá para guardar | **CLIQUE!** (obturador): o obturador pisca, flash, e a foto é o que estava no quadro de foco |
| **microfone** (toque em SOM) | zoom leve para 1,06×, borda lilás | anéis na mira que crescem com o volume; **medidor** embaixo que mexe ao vivo com o que está na mira (o passarinho escondido faz as barras pularem) | **GRAVAR**: as barras gravam 1,4 s em coral; silêncio = linha reta |

O aviso de "tem coisa aqui" (o quadro ou o anel fecham) continua igual para tudo. O medidor do microfone não é pista que entrega: ele é o próprio **som**, que só o microfone pega.

**A decisão continua a mesma**, só que agora em três gestos: escolher a ferramenta (FOTO ou SOM), mirar e agir. Agir no vazio é de graça. Formato errado (foto do que só se ouve, gravação do que é calado) = errou, perdeu.

**Tutorial (7 balões):**
1. Mexa o joystick para olhar a praia (espera a mira andar);
2. Toque em FOTO para sacar a câmera (espera a câmera sair);
3. Mire no arco-íris e aperte CLIQUE! (anel no arco-íris; quando a mira chega, o anel vai para o CLIQUE!);
4. Guardou! Agora escute o coqueiro…;
5. Saque o microfone: SOM!;
6. Mire no coqueiro e aperte GRAVAR!;
7. Agora é com você.

Na estreia do golfinho, a câmera vai até ele antes do balão.

**Duas câmeras do Phaser.** A principal desenha só o mundo (fundo, coisas, notas); a segunda desenha toda a interface sem zoom. Tudo que nasce na cena é interface por padrão (`ADDED_TO_SCENE`), e o que é do mundo passa por `view.world()`. Por isso tutorial, painéis, `FX.flash` e `showLevelComplete` não sofrem com o zoom.

**Lugares no mundo (2044 × 720):**
- coqueiro (235, 160);
- pedra/onda (603, 335);
- toca/caranguejo (940, 520);
- golfinho (1250, 330);
- arco-íris (1250, 170);
- duna/sorveteiro (1720, 330);
- cabana/música (1930, 355);
- castelo (380, 525).

## Histórico

- **08/10/2026**: a ficha *Teatrinho 3 em 1* repetia o Show de Formatos (066), e o erro dela (fileira diferente da estrela) não testava a habilidade. Ofereci três caminhos e o usuário pediu explicação; depois pediu *"uma mecânica super divertida e simples… que não seja só arrastar ou clicks simples"*. Planejado como jogo de foto: visor no joystick, FOTO/SOM pelo que se vê ou se ouve, apresentação no teatrinho. Arte pedida: *"leve, pastel, não tão puxada a chibi, mas cartoon"*.
- **08/10/2026**: **N1 feito em `Graphics`** (pedido: *"faça o jogo. com n1 apenas. use Graphics. as texturas adicionarei em breve"*). Id **111** no catálogo, com `NEXT_FREE_ID` = 112, `gameInstructions` e `GameDetailsPage`. Toda a arte é reserva assada nas chaves e grades do TEXTURAS (`scenes/fallback.ts`), e o PNG entra sem código novo. Mudanças em relação ao plano:
  - a toca do caranguejo foi para (600, 490) e o castelo para (380, 495), porque a validação exige que as duas coisas de um momento não caibam no mesmo visor;
  - o pé do coqueiro subiu para fora do canto do joystick;
  - a foto é desenhada objeto por objeto numa `DynamicTexture`, porque o `draw` com lista do Phaser 3.90 põe cada objeto NA posição dada, em vez de deslocá-lo.

  Conferido no navegador:
  - o tutorial inteiro (Duda, joystick até o arco-íris, FOTO, página, SOM no passarinho, "Agora é com você");
  - os 4 momentos e as 5 páginas;
  - apertar com o visor vazio não faz nada;
  - os dois erros, *"O sorveteiro não aparece na foto!"* (a foto sai só com a duna) e *"O arco-íris não faz barulho!"*, com `WRONG_ANSWER` e as vidas indo a 0;
  - o `?`;
  - o teatrinho com título, reprise, Ver de novo/Continuar e o painel final.
- **08/10/2026**: **texturas no jogo.** Chegaram as 5 folhas, fora do contrato, e foram ajustadas na entrega. Os originais estão no scratchpad da sessão, e as medidas no `MANIFEST.md` dos assets.
  - o `bg-praia` veio como panorama de 2112 × 744. Foi emendado em 16:9: o lado esquerdo (coqueiro e pedra) com o direito (duna e cabana), com a emenda macia no mar, e a toca do caranguejo foi recolocada na areia. As posições das coisas acima seguem essa arte, e as notas sobem de `def.notes`, em `data/things.ts`;
  - `interfacew.png` virou `interface.png`, e a bolinha do joystick perdeu o pezinho;
  - as células vieram em 350 e 390 × 650. O jogo mede cada célula na carga, então nenhum código mudou por isso;
  - as folhas tinham franja vermelha, e a borda foi limpa;
  - o telão do teatrinho foi medido. No palco a Duda fica espelhada, para apontar para o telão.
- **08/10/2026**: **câmera que passeia** (§13). O panorama inteiro voltou a ser o fundo (2044 × 720), e o emendado ficou guardado no scratchpad. Entraram o modo livre e a câmera e o microfone sacados (zoom, visor, obturador, medidor ao vivo), as setinhas de borda e duas câmeras do Phaser. Conferido no navegador: o tutorial de 7 passos, a foto saindo do quadro de foco, o microfone medindo o passarinho escondido, as 5 páginas, o teatrinho sem zoom, o clique no vazio de graça e a FOTO no coqueiro encerrando (*"O passarinho não aparece na foto!"*).
- **08/10/2026**: o canto do passarinho virou o `bird.mp3` do usuário. Ele pediu mais baixo e menos repetido: ficou a 32 % do volume, cantando 2 s e calando 3 s. Com a mira longe, o canto quase some. Ao gravar não toca mais uma segunda cópia por cima.
- **08/10/2026**: **N2 e N3 feitos** (pedido: *"adicione n2 e n3"*):
  - **N2, sítio:** 4 momentos e 8 coisas; o formato certo depende do instante.
  - **N3, acampamento à noite:** 4 momentos e 8 coisas; só se vê o que tem luz.
  - **Estreias:** a câmera vai até a coisa e um balão explica (`Moment.lesson`, que também substituiu a estreia do golfinho no N1).
  - **Legendas na apresentação:** N2 e N3 pedem uma por página, escolhida entre duas.
  - **Figuras:** genéricas por `look`, com os movimentos pular, andar, voar, boiar, dirigir, piscar, chama e cadente.
  - **Sons:** 11 sintetizados novos.
  - **Arte:** de reserva em `scenes/fallback-worlds.ts`, nas chaves e grades do TEXTURAS §10.
  - **Conferido no navegador:** N2 inteiro (sapo na folha, galo cantando, cachorro, trator, 4 legendas e avanço para o N3), estreia do N3, erro *"No escuro, o grilo não aparece na foto!"* (a foto sai escura) e N3 inteiro até o teatrinho.

