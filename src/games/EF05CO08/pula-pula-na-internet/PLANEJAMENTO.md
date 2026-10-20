# Pula-Pula na Internet — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO08 · 5º ano · Cultura Digital · Segurança e responsabilidade no uso da tecnologia** · id **127** · pasta `src/games/EF05CO08/pula-pula-na-internet/`

> **(EF05CO08)** Acessar as informações na Internet de forma crítica para distinguir os conteúdos confiáveis de não confiáveis.
>
> Exemplo oficial: um estudo comparativo entre sites de jornais oficiais e blogs para falar sobre as fontes de informação, considerando sua confiabilidade.

Pedidos do usuário (20/10/2026): *"um jogo onde o jogador controla um celular que vai pulando toda hora, e o jogador deve ir subindo cada vez mais alto. cair não perde a fase, só teleporta pro último local que tinha pisado. nas plataformas pode ter um jornal, ou uma exclamação, ou uma imagem, e ao encostar o jogador para numa tela com uma notícia que deve responder se é verdadeira ou falsa. o jogador deve pegar até 4 itens pra responder por nível. considere essa subida com plataformas como a internet."* E: *"planeje o jogo e faça o N1, usando Graphics, as texturas adiciono depois."* Depois do N1: *"acho que o jogo nem precisa de textura, ele é muito simples. Talvez só algumas imagens e estilo vetorial. Mude o TEXTURAS.md e faça N2 e N3."*

Ele veio no lugar da ficha *Garimpo de Notícias*, que repetia o briefing *Caça-Boatos*, já recusado no planejamento do Olha o Jornal!.

---

## 0. Por que não é nenhum dos irmãos

| Irmão | O que a criança faz | O que o Pula-Pula faz diferente |
|---|---|---|
| **Olha o Jornal! (EF05CO08)** | lê **dois** jornais parados, escolhe um e o arremessa pela praça | **um** conteúdo por vez, e ele é **achado** no caminho. A pergunta não é *"qual dos dois?"*, é *"este aqui merece confiança?"* |
| **Radar de Confiabilidade (EF05CO08)** | lê cartões com os sinais já marcados como bons ou ruins | as três pistas chegam **neutras**: nenhuma cor diz se a pista é boa. A cor só aparece **depois** da escolha, para explicar |
| **Rastro da Notícia (EF04CO08)** | anda pela rua da internet até o site de onde a notícia veio, e vê quem escreveu | aqui a internet é **vertical** e o conteúdo vem em **três formatos** (notícia, mensagem, foto). O Rastro pergunta *"de onde veio?"*; aqui as três pistas pesam juntas |
| **Ficha Garimpo de Notícias** | segurar 1,5 s para revelar as pistas e tocar OURO ou PIRITA, com ponto menor para quem chuta | não há gesto de revelar, e **a leitura é com o mundo parado**: o celular congela e o cartão ocupa a tela. Os dois defeitos que derrubaram o Caça-Boatos (texto que se mexe, resposta sem conferir) não existem |

## 1. O jogo em três frases

1. **O celular pula sozinho, e a criança o leva para a esquerda e para a direita, subindo pelas abas da internet.**
2. **No caminho estão uma notícia, uma mensagem ou uma foto. Encostou, o mundo para e o conteúdo abre na tela.**
3. **Olhe as três pistas (quem fez, quando, de onde veio) e diga se PODE CONFIAR ou NÃO CONFIE. Acertou, a nuvem abre e o celular é lançado para cima.**

~~~text
 ┌───────────────────────────────────────────────────────────────────────┐
 │ [Nível 1] ●○○○ │         Suba até a NOTÍCIA!                   │ (?) │  faixa 96
 ├───────────┬───────────────────────────────────────────┬───────────────┤
 │           │ ░░░░░░░░░ NUVEM (fechada) ░░░░░░░░░░░░░░ │               │
 │           │                                           │               │
 │           │                 [📰]                       │               │
 │           │        ╔═══════ PARADA ═══════╗           │               │
 │  painel   │                    ┌──aba──┐              │   painel      │
 │           │        ┌──aba──┐                          │               │
 │           │                     (celular) ↕            │               │
 │           │                  ┌──aba──┐                │               │
 │   ┌───┐   │ ┌──aba──┐                                 │    ┌───┐      │
 │   │ ◀ │   │ ════════════ CHÃO (tela inicial) ════════ │    │ ▶ │      │
 │   └───┘   │                                           │    └───┘      │
 └───────────┴───────────────────────────────────────────┴───────────────┘
   x 0–250          coluna da subida, x 250–1030             x 1030–1280
~~~

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **acessar** informações | o celular sobe **por dentro da internet**: cada plataforma é uma aba do navegador, e o chão é a tela inicial do aparelho |
| **na Internet** | os conteúdos têm os formatos que a criança encontra de verdade: a **notícia** de um site, a **mensagem** encaminhada, a **foto** postada |
| **de forma crítica** | o conteúdo **não chega com veredito**. Ele traz três linhas: **quem fez**, **quando** e **de onde veio**. Quem julga é a criança |
| **distinguir confiável de não confiável** | os dois botões, **PODE CONFIAR** e **NÃO CONFIE** |
| exemplo oficial: *jornal oficial × blog* | no N1, o *Jornal da Cidade* (repórter, data, a Prefeitura informou) e o *Blog Fofoca Total* (ninguém assina, sem data, "ouvi dizer") estão no mesmo nível, os dois em formato de notícia |

**A regra é uma só, e o código a calcula:** pode confiar quando as **três** pistas estão boas. Uma pista ruim já basta para não confiar. Os dados não guardam a resposta certa: cada pista tem `ok`, e `trusts()` em `data/levels.ts` decide. O tom da manchete **não** é pista: no N1 uma manchete gritada é a falsa (*"CHOCOLATE CURA TUDO!!!"*) e uma manchete calma também é falsa (*"As férias vão durar 3 meses"*). No N2 entra a manchete gritada e verdadeira.

### O teste da bolinha

> Troque cada conteúdo por uma bolinha colorida sem significado. O jogo muda?

**A decisão acaba.** A notícia confiável e a não confiável do N1 têm o mesmo formato, o mesmo ícone e o mesmo cartão. O único jeito de separar uma da outra são as três linhas.

**A subida sobrevive a bolinhas, e é de propósito.** Ela é o caminho até o conteúdo, e é o que faz o jogo ser divertido entre uma decisão e outra. Por isso ela não tem pergunta nenhuma, nem custo: cair não perde nada.

## 3. O que mudou em relação ao pedido

| O pedido | O que ficou | Por quê |
|---|---|---|
| *"responder se é verdadeira ou falsa"* | **PODE CONFIAR** / **NÃO CONFIE** (as palavras do Rastro da Notícia) | a criança não tem como saber se o chocolate cura ou não; ela tem como saber que **ninguém assina**. A habilidade diz *confiável*, e é isso que as pistas permitem julgar. Trocar de volta é mudar duas palavras em `data/words.ts` |
| *"pegar até 4 itens"* | **4 conteúdos por nível**, um em cada trecho | 4 fases por nível (o máximo do catálogo é 5) |
| — (como garantir que a criança pegue o item) | uma **nuvem** fecha a subida logo acima de cada conteúdo. O celular bate a cabeça nela e volta. **Acertou, ela abre** e o celular é lançado | sem a nuvem dava para passar ao lado do item e chegar ao topo sem responder nada |
| — (o que é erro) | **cair não custa nada.** A resposta errada encerra a partida | é o padrão do catálogo: erro de decisão encerra, erro de dedo não emite nada |

## 4. Controles

| Onde | O quê | Teclado |
|---|---|---|
| **metade esquerda** da tela (abaixo do cabeçalho) | segurar leva o celular para a **esquerda** | ← ou A |
| **metade direita** | segurar leva para a **direita** | → ou D |
| — | o pulo é **automático**: o celular quica em toda plataforma em que cai | — |
| no cartão | **PODE CONFIAR** (verde, ✔) e **NÃO CONFIE** (vermelho, ✖), lado a lado, 360 × 92 | — |

Os botões ◀ e ▶ desenhados nos painéis laterais são o lembrete visual. A área de toque é a metade inteira da tela, para o dedo não precisar mirar. Soltou, o celular freia rápido: nada de escorregar para fora da plataforma.

**Sem volta pelos lados.** A coluna tem paredes: sair por um lado e aparecer do outro confunde a criança.

## 5. O laço

1. **Subida.** O cabeçalho diz aonde ir: *"Suba até a NOTÍCIA!"* (ou MENSAGEM, ou FOTO). O conteúdo flutua sobre a **parada**, a plataforma larga e dourada do trecho, e acima dela a nuvem está fechada.
2. **Encostou no conteúdo ou caiu na parada:** o mundo para. O conteúdo voa até o celular, o celular faz cara de quem lê, e o **cartão** cresce a partir dele até ocupar a tela.
3. **O cartão:** no alto, o formato e o nome do site; no meio, a manchete (ou a mensagem, ou a foto com a legenda); embaixo, as três pistas, que entram **uma de cada vez** com um tique. Os dois botões só aparecem depois da terceira. O cabeçalho pergunta: *"Dá para confiar?"*
4. **Acertou:** cada pista ganha a cor e a marquinha dela (verde ✔ ou laranja ✖), e a frase do porquê aparece no lugar dos botões.
   - **PODE CONFIAR:** o cartão encolhe para dentro do celular, com brilho: **GUARDADO!**
   - **NÃO CONFIE:** o carimbo **BLOQUEADO!** bate no cartão, e ele cai e some.
5. A bolinha do cabeçalho fica verde, a **nuvem se abre** pelos dois lados, e o celular é **lançado** para o trecho seguinte.
6. Depois do 4º conteúdo, a última nuvem abre para o **topo da internet**: a antena com a estrela. Pousou nela, o nível acaba.

## 6. A tela

| Peça | Posição (grade 1280 × 720) |
|---|---|
| cabeçalho | faixa de 96 px: pílula do nível, 4 bolinhas, o pedido no meio, o `?` à direita |
| coluna da subida | x de 250 a 1030 (780 px). O fundo dela tem a rede de pontinhos, que sobe mais devagar que as plataformas |
| painéis laterais | x 0–250 e 1030–1280, um pouco mais escuros. O ◀ em (125, 600) e o ▶ em (1155, 600), 150 × 150 |
| câmera | só sobe. Quando o celular passa da altura de 440 px na tela, o mundo desce atrás dele. Antes de a nuvem abrir, a câmera sobe até a parada ficar a 600 px do alto, para a nuvem aparecer inteira |
| cartão | 860 × 588, centrado em x, de y 112 a 700. A pergunta fica no cabeçalho, que continua aceso por cima do véu |

## 7. A física e o percurso

| Parâmetro | Valor | O que dá |
|---|---|---|
| gravidade | 1900 px/s² | — |
| pulo | 240 px de altura | ~1 s entre um quique e outro |
| lançamento (nuvem aberta) | 640 px | passa a nuvem e cai no primeiro degrau do trecho seguinte |
| andar | até 520 px/s, aceleração 3400, freio 3000 | para em ~0,17 s ao soltar |
| celular | 72 × 110 px (área de colisão) | — |
| nuvem | começa 300 px acima da parada e tem 140 de espessura | o pulo comum (240 + a altura do celular) bate nela |
| primeiro degrau depois da nuvem | 70 px acima dela | o lançamento chega com folga |

O percurso é **gerado com semente fixa** (`data/course.ts`): sempre o mesmo para o mesmo nível. Cada trecho tem N abas, uma acima da outra; o degrau e o deslocamento lateral de cada nível estão no §8. O limite é um degrau de 180 px (o pulo é de 240) e o alcance lateral que o celular cobre nesse pulo. A validação em desenvolvimento recusa um percurso fora desses limites, e também um nível em que todos os conteúdos tenham a mesma resposta.

**Cair:** se o pé do celular passa 80 px da borda de baixo da tela, ele **pisca e reaparece** quicando na última plataforma em que pisou. Não custa ponto, não emite nada.

## 8. Os níveis

Mesma mecânica nos três, 4 conteúdos em cada. Muda o que as pistas exigem e o percurso.

| | N1 | N2 | N3 |
|---|---|---|---|
| o que as pistas exigem | **escancaradas**: o não confiável tem as três ruins | **o tom não decide**: manchete gritada e confiável, calma e não confiável, e a **data velha** | **uma pista basta**: o não confiável tem só **uma** ruim; e um **alerta confiável** |
| abas por trecho | 2, 4, 4, 5 | 3, 4, 5, 5 | 4, 5, 5, 5 |
| degrau | 135 a 165 px | 145 a 180 px | 150 a 178 px |
| largura das abas | 210 a 260 px | 190 a 230 px | 170 a 210 px |
| deslocamento lateral | até 230 px | até 250 px | até 270 px |
| abas que andam | nenhuma | 1 a cada 3, ±70 px em 2,6 s | 1 a cada 2, ±90 px em 2,2 s |

As abas que andam vão de um lado para o outro sem parar. A primeira aba depois de cada nuvem nunca anda, para o lançamento sempre ter onde cair. `bad` em `LevelDef` diz quantas pistas ruins o conteúdo não confiável deve ter no nível (3 no N1, 1 no N3), e a validação confere.

### N1 — pistas escancaradas

| # | Conteúdo | Formato | Quem fez | Quando | De onde veio | Resposta |
|---|---|---|---|---|---|---|
| 1 | *Vacina da gripe chega ao posto do bairro* · Jornal da Cidade | notícia | Marina Alves, repórter | hoje | a Prefeitura informou | PODE CONFIAR |
| 2 | *CHOCOLATE CURA TUDO!!! Mande para todo mundo!* · mensagem encaminhada | mensagem | ninguém assina | não diz | "todo mundo está falando" | NÃO CONFIE |
| 3 | *A turma do 5º ano plantou 20 árvores* · Site da Escola | foto | Professor Rui | ontem | fotos da turma, na escola | PODE CONFIAR |
| 4 | *As férias vão durar 3 meses* · Blog Fofoca Total | notícia | não diz quem escreveu | sem data | "ouvi dizer" | NÃO CONFIE |

O 1 e o 4 são o par do exemplo oficial: os dois são **notícias**, um de jornal e outro de blog. E a manchete calma (4) é a falsa, para a criança não sair do N1 achando que "gritou = falso".

### N2 — o grito não decide

| # | Conteúdo | Formato | Quem fez | Quando | De onde veio | Resposta |
|---|---|---|---|---|---|---|
| 1 | *URGENTE!!! A ESCOLA GANHOU ROBÔS!!!* · Grita Notícia | notícia | Tino Rocha, repórter | hoje | a Secretaria de Educação informou | PODE CONFIAR |
| 2 | *Amanhã não vai ter aula. Avise todo mundo.* · mensagem encaminhada | mensagem | ninguém assina | não diz | "a mãe de um colega falou" | NÃO CONFIE |
| 3 | *Olha a enchente na nossa rua HOJE!* · Perfil @noticiasja | foto | Ana Lima, fotógrafa | **a foto é de 2015** | Jornal da Cidade, 2015 | NÃO CONFIE |
| 4 | *Biblioteca abre aos sábados a partir de hoje* · Site da Prefeitura | notícia | Secretaria de Cultura | hoje | a Prefeitura publicou | PODE CONFIAR |

O 1 grita e é confiável; o 2 é calmo e não é. O 3 é a armadilha do nível: a foto é **de verdade** e tem autora, mas é velha, e a legenda diz que é de hoje.

### N3 — uma pista basta

| # | Conteúdo | Formato | Quem fez | Quando | De onde veio | Resposta |
|---|---|---|---|---|---|---|
| 1 | *Dormir tarde deixa a gente mais inteligente* · Site Saber Tudo | notícia | Carla Dias, repórter | ontem | **copiou de um perfil sem nome** | NÃO CONFIE |
| 2 | *ALERTA: chuva forte hoje à noite. Fique em casa.* · Defesa Civil | mensagem | Defesa Civil | hoje, às 14h | o número oficial da Defesa Civil | PODE CONFIAR |
| 3 | *A piscina do clube fechou PARA SEMPRE!!!* · Perfil @fofoqueiro | foto | Rafa, sócio do clube | hoje | **"ouvi no vestiário"** | NÃO CONFIE |
| 4 | *A lua cheia de ontem, vista do pátio* · Site da Escola | foto | Professora Bia | ontem à noite | foto da professora, na escola | PODE CONFIAR |

Os dois não confiáveis têm nome e data, e caem por **uma** linha. O alerta (2) é o único conteúdo do jogo em formato de mensagem que **pode** ser confiado, para o formato não virar resposta.

## 9. Acerto e erro

| Situação | O que acontece | Emite |
|---|---|---|
| resposta certa | as pistas ganham cor, a frase do porquê, GUARDADO ou BLOQUEADO, a nuvem abre | `CORRECT_ANSWER` (+10) e `CHECKPOINT` |
| resposta errada | o celular fica triste, o cartão treme, as pistas ganham cor (as que decidiam piscam) e, no lugar dos botões, aparece *"Ops! Ninguém assina, …"*. Depois de 1,7 s, a partida acaba | `WRONG_ANSWER` (−5) e `lose()` |
| caiu | pisca e volta para a última plataforma | nada |
| bateu na nuvem fechada | a nuvem balança e o celular volta | nada |
| tocou nos botões antes das pistas | os botões ainda não existem | nada |

## 10. A demonstração

Abre na primeira vez do nível e toda vez que se toca no **?** (ou na tecla H). Um toque pula. O celular continua quicando no chão o tempo todo.

| Passo | O que se vê | Legenda |
|---|---|---|
| 1 | a mãozinha segura o ▶; o botão acende e o celular anda para a direita | **SEGURE PARA ANDAR** |
| 2 | a mãozinha segura o ◀; o celular volta | — |
| 3 | o conteúdo do trecho pisca com um anel | **SUBA ATÉ A NOTÍCIA** |
| 4 | — | **SUA VEZ!** |

Parado por 8 segundos sem tocar em nada, a mãozinha volta a segurar o lado em que está o conteúdo.

## 11. Telemetria e pontos

- `CORRECT_ANSWER` (+10) a cada resposta certa; `WRONG_ANSWER` (−5) na errada, seguido de `lose()`.
- `CHECKPOINT` a cada conteúdo respondido, com o progresso em conteúdos.
- `GAME_COMPLETED` ao pousar no topo, com `totalStages: LEVELS.length` e 3 estrelas (quem chega ao topo não errou).

## 12. A arte

**O jogo não tem folha de textura: a arte final é o Graphics** (decisão do usuário, 20/10/2026). Tudo é forma chapada de vetor geométrico, sem contorno. Só viram imagem as **fotos de dentro do cartão** (`fotos.png`, 4 cenas) e a **capa**. Ver [TEXTURAS.md](./TEXTURAS.md).

## 13. Arquivos

| Arquivo | O quê |
|---|---|
| `data/levels.ts` | os 3 níveis: o percurso e os 4 conteúdos de cada um, a regra `trusts()` e a validação em dev |
| `data/course.ts` | a lógica pura que monta o percurso: abas, paradas, nuvens e o topo |
| `data/physics.ts` | gravidade, pulo, lançamento, andar, o tamanho do celular e da nuvem |
| `scenes/view.ts` | as camadas do mundo e a câmera que só sobe |
| `scenes/world.ts` | o fundo, as abas, os conteúdos flutuando, as nuvens e o topo |
| `scenes/phone.ts` | o celular: poses, esticar e achatar, piscar ao reaparecer |
| `scenes/controls.ts` | as metades da tela, o teclado e os botões ◀ ▶ |
| `scenes/card.ts` | o cartão do conteúdo, as pistas, os botões e o resultado |
| `scenes/header.ts` `caption.ts` `hand.ts` `audio.ts` | cabeçalho, legenda da demonstração, mãozinha e os sons sintetizados |
| `scenes/fallback.ts` | a arte do jogo, em Graphics (é a final; só as fotos e a capa viram imagem) |
