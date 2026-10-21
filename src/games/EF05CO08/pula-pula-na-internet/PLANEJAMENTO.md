# Pula-Pula na Internet — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO08 · 5º ano · Cultura Digital · Segurança e responsabilidade no uso da tecnologia** · id **127** · pasta `src/games/EF05CO08/pula-pula-na-internet/`

> **(EF05CO08)** Acessar as informações na Internet de forma crítica para distinguir os conteúdos confiáveis de não confiáveis.
>
> Exemplo oficial: um estudo comparativo entre sites de jornais oficiais e blogs para falar sobre as fontes de informação, considerando sua confiabilidade.

Pedidos do usuário (20/10/2026): *"um jogo onde o jogador controla um celular que vai pulando toda hora, e o jogador deve ir subindo cada vez mais alto. cair não perde a fase, só teleporta pro último local que tinha pisado. nas plataformas pode ter um jornal, ou uma exclamação, ou uma imagem, e ao encostar o jogador para numa tela com uma notícia que deve responder se é verdadeira ou falsa. o jogador deve pegar até 4 itens pra responder por nível. considere essa subida com plataformas como a internet."* Depois: *"acho que o jogo nem precisa de textura, ele é muito simples. Talvez só algumas imagens e estilo vetorial."*

**Reforma (20/10/2026):** *"Deixe mais demorado pra aparecer as noticias. Faça quanto mais alto ele estiver, coisas da cena mudem. n1: começa na floresta e vai pulando, qnd estiver na ultima fase, ele ja deve estar no ceu (com visão de montanhas no plano de fundo). n2: começa no msm lugar (ceu), e vai pulando. ao chegar na ultima fase, ja estara no espaço, com pulos mais afetados pela gravidade. n3: começa no msm lugar (espaço) [...] ainda deve estar no espaço. considere se o jogador ignorar uma noticia, ele perde o jogo. ele deve pegar todas as noticias que aparecer. [...] melhore tbm todos os desenhos feitos no graphics."*

Ele veio no lugar da ficha *Garimpo de Notícias*, que repetia o briefing *Caça-Boatos*, já recusado no planejamento do Olha o Jornal!.

---

## 0. Por que não é nenhum dos irmãos

| Irmão | O que a criança faz | O que o Pula-Pula faz diferente |
|---|---|---|
| **Olha o Jornal! (EF05CO08)** | lê **dois** jornais parados, escolhe um e o arremessa pela praça | **um** conteúdo por vez, e ele é **achado** no caminho. A pergunta não é *"qual dos dois?"*, é *"este aqui merece confiança?"* |
| **Radar de Confiabilidade (EF05CO08)** | lê cartões com os sinais já marcados como bons ou ruins | as três pistas chegam **neutras**: nenhuma cor diz se a pista é boa. A cor só aparece **depois** da escolha, para explicar |
| **Rastro da Notícia (EF04CO08)** | anda pela rua da internet até o site de onde a notícia veio, e vê quem escreveu | aqui a internet é **vertical** e o conteúdo vem em **três formatos** (notícia, mensagem, foto). O Rastro pergunta *"de onde veio?"*; aqui as três pistas pesam juntas |
| **Ficha Garimpo de Notícias** | segurar 1,5 s para revelar as pistas e tocar OURO ou PIRITA | não há gesto de revelar, e **a leitura é com o mundo parado**: o celular congela e o cartão ocupa a tela |

## 1. O jogo em três frases

1. **O celular pula sozinho, e a criança o leva para a esquerda e para a direita, subindo pelas abas da internet, da floresta até o espaço.**
2. **No caminho, numa aba dourada fora da trilha, estão uma notícia, uma mensagem ou uma foto. Ela tem de ser pega: se ficar para trás, a partida acaba.**
3. **Pegou, o mundo para e o conteúdo abre: olhe as três pistas (quem fez, quando, de onde veio) e diga PODE CONFIAR ou NÃO CONFIE.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **acessar** informações | o celular sobe **por dentro da internet**: cada plataforma é uma aba do navegador |
| **na Internet** | os conteúdos têm os formatos que a criança encontra de verdade: a **notícia** de um site, a **mensagem** de um grupo, a **foto** postada |
| **de forma crítica** | o conteúdo **não chega com veredito**. Ele traz três linhas: **quem fez**, **quando** e **de onde veio**. Quem julga é a criança |
| **distinguir confiável de não confiável** | os dois botões, **PODE CONFIAR** e **NÃO CONFIE** |
| exemplo oficial: *jornal oficial × blog* | no N1, o *Jornal da Cidade* e o *Blog Fofoca Total* estão no mesmo nível, os dois em formato de notícia |

**A regra é uma só, e o código a calcula:** pode confiar quando as **três** pistas estão boas. Os dados não guardam a resposta: cada pista tem `ok`, e `trusts()` em `data/levels.ts` decide. O tom da manchete **não** é pista. O selo **↪ Encaminhada** só aparece na mensagem que foi mesmo passada adiante (`forwarded`), e a validação proíbe uma encaminhada confiável; o alerta da Defesa Civil (N3) chega sem o selo.

### O teste da bolinha

> Troque cada conteúdo por uma bolinha colorida sem significado. O jogo muda?

**A decisão acaba.** A notícia confiável e a não confiável têm o mesmo formato, o mesmo ícone e o mesmo cartão. O único jeito de separar uma da outra são as três linhas. **A subida sobrevive a bolinhas, e é de propósito**: ela é o caminho até o conteúdo e o que muda de cenário.

## 3. O que mudou em relação ao pedido

| O pedido | O que ficou | Por quê |
|---|---|---|
| *"responder se é verdadeira ou falsa"* | **PODE CONFIAR** / **NÃO CONFIE** | a criança não tem como saber se o chocolate cura; ela tem como saber que **ninguém assina**. Trocar de volta é mudar duas palavras em `data/words.ts` |
| *"pegar até 4 itens"* | **4 conteúdos por nível**, um em cada trecho | 4 fases por nível |
| *"se o jogador ignorar uma notícia, ele perde"* | a notícia fica numa **aba dourada fora da trilha**, e ao lado dela há uma **aba de atalho** que deixa passar reto. Se a notícia **sai pela borda de baixo** da tela sem ser pega, a partida acaba (`WRONG_ANSWER` + `lose()`) | ignorar só é possível se houver caminho que não passe pela notícia. A nuvem que fechava a subida saiu |
| *"mais demorado pra aparecer as notícias"* | **5 a 7 abas** antes de cada notícia (antes: 2 a 5) | — |
| *"quanto mais alto, coisas da cena mudem"* | o cenário é função da **altitude** (§7): floresta → céu com montanhas → espaço | — |
| *"pulos mais afetados pela gravidade"* (espaço) | no espaço a gravidade cai para menos da metade: o pulo fica **mais alto e mais lento** (flutua) | é o que a criança espera do espaço. Se a intenção era o contrário, é trocar `SPACE` em `data/physics.ts` |
| — (o que é erro) | **cair não custa nada.** Resposta errada e notícia que passa encerram a partida | erro de decisão e de omissão encerram; erro de dedo não |

## 4. Controles

| Onde | O quê | Teclado |
|---|---|---|
| **metade esquerda** da tela (abaixo do cabeçalho) | segurar leva o celular para a **esquerda** | ← ou A |
| **metade direita** | segurar leva para a **direita** | → ou D |
| — | o pulo é **automático**: o celular quica em toda plataforma em que cai | — |
| no cartão | **PODE CONFIAR** (verde, ✔) e **NÃO CONFIE** (vermelho, ✖), lado a lado, com a mesma borda amarela pulsando nos dois | — |

Os botões ◀ e ▶ nos cantos têm degrau e borda branca parada; acendem quando seguros. **Sem volta pelos lados**: a coluna tem paredes.

## 5. O laço

1. **Subida.** O cabeçalho diz o que pegar: *"Pegue a NOTÍCIA!"* (ou MENSAGEM, ou FOTO).
2. **O desvio.** Depois de 5 a 7 abas, a trilha se abre em duas: de um lado a **aba dourada** com o conteúdo flutuando, do outro uma aba comum. As duas levam à aba de cima.
3. **Ficou para trás?** Quando o celular já passou a notícia e ela chega perto da borda de baixo, ela treme e fica laranja, e o cabeçalho diz *"Volte! A NOTÍCIA vai passar!"*. Dá para descer de volta. Se ela sai da tela, o painel *"A NOTÍCIA ficou para trás!"* aparece grande no meio e a partida acaba.
4. **Encostou no conteúdo ou caiu na aba dourada:** o mundo para, o conteúdo voa até o celular, o celular faz cara de quem lê, e o **cartão** cresce a partir dele.
5. **O cartão:** formato e nome do site no alto; a manchete (ou a mensagem, ou a foto com a legenda) no meio; as três pistas entram **uma de cada vez**. Os botões só aparecem depois da terceira.
6. **Acertou:** cada pista ganha a cor e a marquinha dela, e a frase do porquê aparece no lugar dos botões (3 s). **PODE CONFIAR:** o cartão encolhe para dentro do celular, com brilho. **NÃO CONFIE:** o cartão balança e cai. Sem carimbo: o resultado é o cartão indo para o lugar dele.
7. A bolinha do cabeçalho fica verde e o celular volta a quicar de onde estava.
8. Depois do 4º conteúdo, 3 abas levam ao **topo** (a antena com a estrela). Pousou nela, o nível acaba.
9. **Passagem de nível sem recarregar** (pedido de 20/10/2026): o painel *Nível N completo!* aparece, fica 2,4 s e some em fade. A cena **não reinicia**: o celular continua em cima da antena, o próximo percurso é montado a partir dela (`buildCourse(def, altitude, { y, w })`, com a largura do topo, e a validação confere esse começo estreito), as abas novas aparecem de baixo para cima, o cabeçalho troca para *Nível N+1* e as bolinhas renascem. A altitude segue somando (`knots` acumulados), então o cenário continua do ponto em que estava. Só quem começa direto no N2 ou N3 (fase inicial da plataforma) nasce no chão de nuvem ou de lua.

## 6. A tela

| Peça | Posição (grade 1280 × 720) |
|---|---|
| cabeçalho | faixa de 96 px (assada numa textura): pílula do nível, 4 bolinhas, o pedido no meio, o `?` à direita |
| coluna da subida | x de 250 a 1030 (780 px) |
| painéis laterais | x 0–250 e 1030–1280: um véu escuro **translúcido** (o cenário aparece por trás) e uma borda branca do lado da coluna. O ◀ em (125, 600) e o ▶ em (1155, 600) |
| câmera | só sobe: quando o celular passa da altura de 440 px na tela, o mundo desce atrás dele |
| cartão | 860 × 588, centrado, de y 112 a 700 |
| faixa de zona | *CÉU!* / *ESPAÇO!* em (640, 170), 1,6 s, quando o celular cruza a fronteira |

## 7. Altitude, cenário e física

A altitude vai de **0 a 3** e é contínua entre os níveis: **N1 de 0 a 1, N2 de 1 a 2, N3 de 2 a 3**. Dentro do nível, cada fase é um quarto: a fase *k* vai da notícia *k−1* à notícia *k* (`knots` do percurso, `altAt()` em `data/course.ts`).

| Altitude | Cenário | Física |
|---|---|---|
| 0 – 0,45 | **floresta**: chão de grama com flores e cogumelos, pinheiros e árvores redondas passando dos lados | normal |
| 0,3 – 1,6 | **céu**: as árvores ficam para baixo, as **montanhas** aparecem no fundo (a partir de 0,5 bem visíveis, e afundam devagar até 1,6), nuvens, pássaros, balão, avião | normal |
| 1,5 – 1,76 | o céu escurece, as estrelas acendem, a **Terra** curva aparece embaixo | a gravidade cai entre 1,6 e 1,74 |
| 1,76 – 3 | **espaço**: abas no modo escuro, satélites, planetas, a lua, asteroides, cometas a cada 5–9 s, nebulosa e foguete no fim | **gravidade baixa**: pulo de 300 px em vez de 240, ~1,7 s por quique em vez de ~1 s, aceleração lateral menor |

Então: **N1** começa na floresta e a 4ª fase é céu com montanhas; **N2** começa no céu e a 4ª fase já é espaço, com o pulo leve; **N3** é espaço do começo ao fim. O chão de largada muda com o nível: grama (N1), nuvem (N2), solo lunar com bandeirinha (N3).

Cada enfeite do fundo (`DECOR` em `data/scenery.ts`) tem uma altitude e uma velocidade de paralaxe; os do céu somem antes do espaço e os do espaço só aparecem nele (`fade`). Os céus são degradês assados numa textura de 4 px de largura, esticados e trocados em fade.

### O percurso

Gerado com semente fixa (`data/course.ts`): sempre o mesmo para o mesmo nível. Cada trecho tem N abas em zigue-zague; a última fica no meio da coluna e abre o **desvio**: aba dourada de um lado, aba de atalho do outro, as duas na mesma altura; acima delas, uma aba no meio junta os dois caminhos. No espaço o degrau e o deslocamento lateral crescem junto com o pulo.

`checkCourse()` confere **cada ligação** (`links`): degrau até o pulo − 60 px na gravidade daquela altura, alcance lateral (contando o vaivém das abas que andam), coluna, e que a aba dourada não encoste na de atalho. A validação em dev roda isso nos três níveis.

| Parâmetro | Terra | Espaço |
|---|---|---|
| gravidade | 1900 px/s² | 820 px/s² |
| pulo | 240 px | 300 px |
| aceleração / freio | 3400 / 3000 | 2300 / 1700 |
| andar | até 520 px/s | igual |

**Cair:** se o pé do celular passa 80 px da borda de baixo da tela, ele **pisca e reaparece** na última plataforma em que pisou. Não custa nada.

## 8. Os níveis

| | N1 | N2 | N3 |
|---|---|---|---|
| cenário | floresta → céu com montanhas | céu → espaço | espaço |
| o que as pistas exigem | **escancaradas**: o não confiável tem as três ruins | **o tom não decide**: manchete gritada e confiável, calma e não confiável, e a **data velha** | **uma pista basta**: o não confiável tem só **uma** ruim; e um **alerta confiável** |
| abas antes de cada notícia | 5, 6, 6, 7 | 6, 6, 7, 7 | 5, 6, 6, 6 |
| degrau (na Terra) | 135 a 165 px | 145 a 180 px | 150 a 178 px |
| largura das abas | 210 a 260 px | 190 a 230 px | 170 a 210 px |
| abas que andam | nenhuma | 1 a cada 3, ±70 px em 2,6 s | 1 a cada 2, ±90 px em 2,2 s |

### N1 — pistas escancaradas

| # | Conteúdo | Formato | Quem fez | Quando | De onde veio | Resposta |
|---|---|---|---|---|---|---|
| 1 | *Vacina da gripe chega ao posto do bairro* · Jornal da Cidade | notícia | Marina Alves, repórter | hoje | a Prefeitura informou | PODE CONFIAR |
| 2 | *CHOCOLATE CURA TUDO!!! Mande para todo mundo!* · Grupo da família, encaminhada | mensagem | ninguém assina | não diz | "todo mundo está falando" | NÃO CONFIE |
| 3 | *A turma do 5º ano plantou 20 árvores* · Site da Escola | notícia | Professor Rui | ontem | a escola publicou | PODE CONFIAR |
| 4 | *ALIENÍGENAS POUSARAM NA PRAÇA!!!* · Perfil @misterios | foto | ninguém assina | sem data | "um amigo mandou" | NÃO CONFIE |

### N2 — o grito não decide

| # | Conteúdo | Formato | Quem fez | Quando | De onde veio | Resposta |
|---|---|---|---|---|---|---|
| 1 | *UAU!!! CAPIVARAS PARAM O TRÂNSITO NO LAGO!!!* · Grita Notícia | foto | Tino Rocha, fotógrafo | hoje | o Parque do Lago confirmou | PODE CONFIAR |
| 2 | *Amanhã não vai ter aula. Avise todo mundo.* · Grupo da escola, encaminhada | mensagem | ninguém assina | não diz | "a mãe de um colega falou" | NÃO CONFIE |
| 3 | *Olha a enchente na nossa rua HOJE!* · Perfil @noticiasja | foto | Ana Lima, fotógrafa | **a foto é de 2015** | Jornal da Cidade, 2015 | NÃO CONFIE |
| 4 | *Biblioteca abre aos sábados a partir de hoje* · Site da Prefeitura | notícia | Secretaria de Cultura | hoje | a Prefeitura publicou | PODE CONFIAR |

### N3 — uma pista basta

| # | Conteúdo | Formato | Quem fez | Quando | De onde veio | Resposta |
|---|---|---|---|---|---|---|
| 1 | *Dinossauro escapou do museu e passeia pelo centro* · Site Saber Tudo | foto | Carla Dias, repórter | ontem | **copiou de um perfil sem nome** | NÃO CONFIE |
| 2 | *ALERTA: chuva forte hoje à noite. Fique em casa.* · Defesa Civil | mensagem | Defesa Civil | hoje, às 14h | o número oficial da Defesa Civil | PODE CONFIAR |
| 3 | *A piscina do clube fechou PARA SEMPRE!!!* · Perfil @fofoqueiro | foto | Rafa, sócio do clube | hoje | **"ouvi no vestiário"** | NÃO CONFIE |
| 4 | *A lua cheia de ontem, vista do pátio* · Site da Escola | foto | Professora Bia | ontem à noite | foto da professora, na escola | PODE CONFIAR |

## 9. Acerto e erro

| Situação | O que acontece | Emite |
|---|---|---|
| resposta certa | as pistas ganham cor, a frase do porquê, o cartão entra no celular ou cai | `CORRECT_ANSWER` (+10) e `CHECKPOINT` |
| resposta errada | o celular fica triste, o cartão treme, as pistas ganham cor (as que decidiam tremem) e aparece *"Ops! Ninguém assina, …"*. Se confiou num boato, cópias do cartão **se espalham** pela tela. Depois de 1,9 s, a partida acaba | `WRONG_ANSWER` (−5) e `lose()` |
| a notícia ficou para trás | treme e fica laranja perto da borda (*"Volte!"*); saiu da tela: painel grande *"A NOTÍCIA ficou para trás!"* e, 1,7 s depois, a partida acaba | `WRONG_ANSWER` (−5) e `lose()` |
| caiu | pisca e volta para a última plataforma | nada |
| tocou nos botões antes das pistas | os botões ainda não respondem | nada |

## 10. O tutorial (`createTutorial`), curto

Pedido de 20/10/2026: *"faça o tutorial ser rapido, sem mtas delongas"*. Desde 21/10/2026 (*"remova o tutorial do n2 e n3"*) **só o N1 tem tutorial**, na primeira vez (chave `ef05co08-pula-l1` no `__tutorialsSeen`); o celular fica parado. N2 e N3 entram direto no jogo, venham da passagem contínua ou da fase inicial da plataforma.

| Quando | O que roda | Toques |
|---|---|---|
| primeira vez no N1 | a câmera sobe até a 1ª notícia (0,5 s): **"Pegue todas! Nenhuma pode passar."** → volta; cartão de exemplo rápido (pistas a cada 0,14 s, já coloridas) com **"Pistas boas? PODE CONFIAR. Ruim? NÃO CONFIE."** → o jogo aperta PODE CONFIAR; os botões ◀ ▶ acendem e o celular anda (sem balão); **"Sua vez!"** | 3 |

O balão *"O que você faz?"* na primeira decisão saiu (o exemplo já mostrou os dois botões). O **?** repete o cartão de exemplo do nível (no N2 *"Gritou, mas tem as três pistas!"*, no N3 *"Uma pista ruim já basta!"*). Parado por 8 s, um anel acende o botão do lado da próxima aba.

**Foto ampliada** (pedido de 21/10/2026): quando os botões do cartão aparecem, a foto ganha uma lupinha no canto e passa a ser tocável. Tocar nela (ou na lupa) faz a foto crescer do cartão até 900 × 585 no meio da tela, sobre um véu escuro que cobre até o cabeçalho; o **X** vermelho no canto, o toque no véu ou o Esc fecham, e a foto encolhe de volta para o cartão. Enquanto ela está aberta os botões PODE CONFIAR / NÃO CONFIE não respondem. Depois da resposta a lupa some e a foto deixa de abrir. No cartão de exemplo (tutorial e **?**) a foto não abre.

## 11. Telemetria e pontos

- `CORRECT_ANSWER` (+10) a cada resposta certa; `WRONG_ANSWER` (−5) na errada e na notícia perdida, seguido de `lose()`.
- `CHECKPOINT` a cada conteúdo respondido, com o progresso em conteúdos.
- `GAME_COMPLETED` ao pousar no topo, com `totalStages: LEVELS.length` e 3 estrelas.

## 12. A arte

**O jogo não tem folha de textura: a arte final é o Graphics** (decisão do usuário, 20/10/2026), refeita na reforma no vetor geométrico chapado: celular com mãos e pés soltos e tela escura com olhos de quadrado arredondado, abas de navegador com barra de endereço, cenário inteiro (floresta, montanhas, nuvens, Terra, planetas). Só viram imagem as **fotos de dentro do cartão** (6 arquivos `foto-<nome>.png`: **1 no N1, 2 no N2, 3 no N3**, pedido de 20/10/2026; a validação confere) e a **capa**. As fotos falsas mostram o absurdo (discos voadores, dinossauro) e há foto estranha mas verdadeira (capivaras), para a imagem nunca decidir sozinha. Ver [TEXTURAS.md](./TEXTURAS.md).

## 13. Arquivos

| Arquivo | O quê |
|---|---|
| `data/levels.ts` | os 3 níveis: percurso, altitude, os 4 conteúdos, os cartões de exemplo, `trusts()` e a validação em dev |
| `data/course.ts` | o percurso com o desvio, as ligações, a altitude (`altAt`) e `checkCourse()` |
| `data/physics.ts` | gravidade e pulo da Terra e do espaço, e a mistura entre os dois (`feelAt`) |
| `data/scenery.ts` | céus, enfeites do fundo por altitude, cometa, faixas de zona, abas escuras, chão de cada nível |
| `scenes/backdrop.ts` | o fundo que muda com a altura |
| `scenes/world.ts` | painéis, chão, abas, conteúdos (com o aviso de que vão passar) e o topo |
| `scenes/phone.ts` | o celular: poses, esticar e achatar, piscar ao reaparecer |
| `scenes/controls.ts` | as metades da tela, o teclado e os botões ◀ ▶ (assados) |
| `scenes/card.ts` | o cartão (moldura, linhas e botões assados), as pistas, o veredito, os cartões de exemplo |
| `scenes/guide.ts` | `teach()` sobre o `createTutorial` |
| `scenes/header.ts` `caption.ts` `audio.ts` | cabeçalho, faixa de zona e os sons sintetizados |
| `scenes/fallback.ts` | a arte do jogo, em Graphics (é a final) |
