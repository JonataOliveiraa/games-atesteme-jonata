# Rastro da Notícia — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF04CO08 · 4º ano · Cultura Digital · Segurança e responsabilidade no uso da tecnologia** · id **119** · pasta `src/games/EF04CO08/rastro-da-noticia/`

> **(EF04CO08)** Reconhecer a importância de verificar a confiabilidade das fontes de informações obtidas na Internet.

Pedido do usuário (14/10/2026): *"gostei do Rastreamento (estilo Carmen Sandiego, seguir pistas), mas a ideia precisa ser aprimorada e clara"*, e depois: *"eu tava pensando num jogo de mover só pra esquerda ou direita. o nome fica o mesmo. planeje e faça o jogo usando apenas Graphics"*, *"faça só n1"*.

---

## 0. Por que não é a ficha

A ficha *Guichê das Notícias* repetia dois irmãos da mesma habilidade:

| Irmão | O que já faz | O que a ficha repetia |
|---|---|---|
| **Duelo das Fontes (075)** | a notícia cai no balcão, a criança pergunta a 3 vizinhos e escolhe ESPALHAR/SEGURAR | o laço inteiro: revelar 3 coisas e escolher entre 2 botões. O plano do Duelo registra que o briefing dele era quase esta ficha ("3 cartas-pista AUTOR, DATA, CONFIRMA?") |
| **Caça à Fonte Confiável (030)** | páginas com as linhas *quem escreveu*, *quando* e *de onde tirou*, com bônus para quem grifa antes de escolher | as 3 janelinhas e o "chute não é conferência" |

O Rastro faz a pergunta que nenhum dos dois faz, **"de onde isso veio?"**, e vai até o começo. No caminho a criança vê a notícia **mudar a cada cópia**.

Da ficha ficam: o autor (N1), a data (N2), a confirmação e as duplas sobre o mesmo assunto (N3), o título gritado que é verdade e a piscina.

## 1. O jogo em uma frase

**A Lia recebe uma notícia no celular; o detetive entra na internet, vai até o site de onde ela veio e vê quem escreveu, e a Lia faz o que ele disser.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **verificar** | entrar na internet e andar até o site de onde a notícia veio. Sem ir lá, nada aparece |
| **a confiabilidade** | na página, *quem escreveu*: alguém com nome (professora, repórter) ou ninguém |
| **das fontes** | cada prédio é um site; no N2 a fonte é o lugar onde a notícia **começou**, e não onde ela chegou |
| **na Internet** | o detetive **mergulha no celular da Lia** e cai na cidade da internet; cada prédio tem uma tela com barra de endereço |
| **reconhecer a importância** | ele volta para o pátio e a Lia faz o que ele disse. A consequência acontece **no mundo de verdade**: ela espalha o boato para a turma ou perde o passeio |
| exemplo oficial: "informações equivocadas" | no N2, a notícia exagera a cada cópia (*"fecha 2 semanas"* → *"vai fechar!"* → *"FECHA PARA SEMPRE!!!"*) |

**Dois mundos, e a passagem entre eles é o celular.**
- **O pátio da escola** (o mundo de verdade, em close): a Lia, o detetive, o celular. Ali a notícia chega e ali a consequência acontece.
- **A cidade da internet** (dentro do celular): uma rua de prédios, e cada prédio é um site. Ali o detetive investiga.
- Para entrar, o celular cresce e a câmera mergulha na tela dele. Para sair, o pátio volta, partindo da mão da Lia.

## 3. O laço do N1

1. **Pátio.** O celular da Lia toca. Ela mostra a notícia, com a linha **veio do site: [logo] Site da Escola**, e pergunta *"É verdade?"*.
2. **Mergulho** no celular, até a cidade da internet. No alto, a ordem: **Vá até [logo] Site da Escola**.
3. **A criança anda** (só esquerda e direita). **Parou diante de um prédio, ele olha sozinho:** a câmera se aproxima da tela, que acende com a página.
   - **Prédio errado:** aparece a página de casa do site (*"Feira de livros no domingo"*) e o detetive pensa *"Aqui não tem."*. Não custa nada.
   - **O site da notícia:** a manchete é escrita letra a letra, e embaixo aparece **quem escreveu: Professora Bia** (ou **ninguém diz**).
4. A rua escurece e aparecem **PODE CONFIAR** e **NÃO CONFIE**.
5. **De volta ao pátio**, a Lia faz o que a criança disse:
   - **PODE CONFIAR, e tem nome:** a Lia lê, comemora e diz *"Oba! Vou contar pra mamãe!"*;
   - **NÃO CONFIE, e ninguém assina:** a mensagem vira bolinha de papel e cai no chão: *"Boato! Não vou espalhar."*;
   - **erro:** ver §8.

## 4. Controles

| Onde | O quê | Teclado (em silêncio) |
|---|---|---|
| canto inferior esquerdo | **◀ ▶**: segurar anda (340 px/s), e um toque dá um passinho | A/D, ←/→ |
| — | **olhar é automático**: parado diante de um prédio por ¼ de segundo, o detetive olha. Para olhar o mesmo prédio de novo, é preciso sair um pouco e voltar | — |
| na decisão | **PODE CONFIAR** 👍 e **NÃO CONFIE** ✋, lado a lado, no meio de baixo, iguais na cor e no tamanho | — |

O botão da lupa saiu: era um controle a mais para uma ação que não tem escolha.

## 5. A tela

**No pátio** (1280 × 720, tudo em close): o fundo do pátio, a Lia (300 px) à esquerda do meio e o detetive (330 px) à direita, de frente um para o outro. O celular grande fica à esquerda e o balão da Lia em cima dela. O cabeçalho mostra só o nível, as bolinhas e o `?`; na primeira abertura ele fica escondido.

**Na cidade:**
```
┌───────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │        Vá até [🏫] Site da Escola                │ (?) │  faixa 96
├───────────────────────────────────────────────────────────────────────┤
│      ┌[🏫 Site da Escola]┐          ┌[👤 @zumzum]┐                  │
│      │   (logo grande)   │          │   (logo)    │                  │
│      └───────┬──┬────────┘          └─────┬──┬────┘                  │
│ 🕵           │  │                         │  │                       │
│═══════════════════════════════════════════════════════════ chão ════════│
│  (◀)(▶)                                                                 │
└───────────────────────────────────────────────────────────────────────┘
```

- **N1 cabe numa tela só:** 2 prédios (Escola e @zumzum) num mundo de 1280 px, zoom 1. Não tem rolagem e não precisa de aviso de borda.
- **Ao olhar**, a câmera se aproxima até a tela do prédio ficar com ≈ 520 px (zoom ≈ 1,8, calculado pela tela medida de cada fachada) e a página fica grande para ler.
- **Parada, a tela mostra só o logo** do site. Texto só aparece onde o detetive olhou.
- **O cabeçalho em faixas** tem o nível e as bolinhas à esquerda, a ordem no meio (*Vá até [logo] site*; no site, *Quem escreveu?*) e o `?` à direita.

## 6. A cidade cresce com o nível

| Nível | Cidade | Prédios | O que muda |
|---|---|---|---|
| **N1** | 1 tela (zoom 1) | Site da Escola, @zumzum | a notícia **vem direto** do site: uma parada só |
| **N2** | 2 telas (2560) | Escola, Canal TopTudo, Blog da Tia Nena, @zumzum | entra o **copiou de**: uma cópia antes do começo |
| **N3** | a cidade grande (3600, ≈ 3 telas) | os 6 | rastros de 2 cópias e entra a **data** |

Um assunto novo por nível: o N1 é *quem escreveu*, o N2 é *onde começou* e o N3 é *quando*. O resto cresce por quantidade (prédios, cópias, caminhada).

## 7. Os casos do N1: QUEM ESCREVEU? (temas do dia a dia)

| | A Lia pergunta | No celular (veio do site) | A página | Certo |
|---|---|---|---|---|
| 1 | Passeio no zoológico?! É verdade? | *"Passeio ao zoológico na sexta!"* · Site da Escola | quem escreveu: **Professora Bia** | PODE CONFIAR |
| 2 | Sorvete de graça?! É verdade? | *"SORVETE DE GRAÇA HOJE!!!"* · @zumzum | quem escreveu: **ninguém diz** | NÃO CONFIE |
| 3 | Um gatinho perdido?! É verdade? | *"Gatinho perdido no pátio procura dono."* · Site da Escola | quem escreveu: **Seu Zé, porteiro** | PODE CONFIAR |

**Não existe campo "resposta certa".** O veredito é `trusts(origem, regra)`: no N1, confia quem tem nome. `validateLevels` (DEV) confere:
- a corrente fecha (cada *copiou de* aponta a próxima parada, e o último não copia);
- os sites existem na rua e não se repetem no caso;
- o celular aponta a 1ª parada;
- a notícia desincha voltando;
- existem as falas e o motivo do erro;
- o nível tem os dois desfechos.

## 8. Erros (no pátio, antes do `lose()`)

Errou, perdeu: `WRONG_ANSWER` + `lose()`, uma vez. O detetive volta ao pátio, a consequência acontece (≈ 2,4 s), com o motivo escrito grande:

| A criança disse | A página dizia | Acontece | Motivo na faixa |
|---|---|---|---|
| PODE CONFIAR | ninguém diz | aviõezinhos de papel saem do celular da Lia para fora da tela, e o boato se espalha. Lia: *"Espalhei pra turma toda!"* | *Ninguém assina essa notícia!* |
| NÃO CONFIE | alguém com nome | Lia, triste: *"Não fui... e a turma foi ao zoológico!"* (frase por caso) | *A professora Bia assinou!* (o nome do caso) |

## 9. Abertura do N1 (uma vez): onde estou → o que falta → o que vou fazer

Pedido do usuário, duas vezes: *"o jogo está muito confuso … é necessário contextualizar"* e *"ainda tá sem contexto"*. Cada passo tem uma animação, e um balão curto espera o botão.

1. **Pátio** (cabeçalho escondido). O celular toca (*plim*). **Lia:** *"Chegou uma notícia no grupo!"* [Próximo]. O celular aparece com a notícia, e a linha **veio do site: [logo] Site da Escola** sobe. **Lia:** *"Passeio no zoológico?! É verdade?"* [Próximo].
2. **Guia** (recorte no detetive): *"Você é detetive de notícias."* → (recorte na linha do site) *"Toda notícia vem de um site."* → (recorte no celular) *"Vamos entrar na internet!"* [Ver].
3. **O mergulho:** o celular cresce, o pátio afunda na tela dele e aparece a cidade.
4. **Cidade.** A ordem entra: **Vá até [logo] Site da Escola**. **Guia** (recorte nos 2 prédios): *"Cada prédio é um site."* → (recorte na ordem) *"Ache o site da notícia."*. O detetive dá uns passos sozinho, com o ▶ afundando. **Guia:** *"Sua vez!"* [Vamos!].
5. A criança anda até a Escola e para: a câmera se aproxima e a página é escrita. **Guia** (recorte em *quem escreveu*): *"Quem escreveu esta notícia?"* → *"Tem nome? Pode confiar."* → *"Ninguém assina? Não confie."*. Os botões entram. **Guia:** *"Dá pra confiar?"* [Ok].
6. **De volta ao pátio:** a consequência.

Nos casos 2 e 3: o celular toca, a Lia diz *"Chegou mais uma!"*, o celular mostra a notícia e o site, ela pergunta, e o mergulho vem sem balão.

Nenhum balão cita botão, tecla ou "toque". O `?` (só na cidade) tem dois balões: *"Ache o site da notícia."* (recorte na ordem) e *"Lá, veja quem escreveu."*.

## 10. Fim do nível

No pátio: a Lia e o detetive comemoram, confete, `GAME_COMPLETED` e `showLevelComplete` com JOGAR DE NOVO (só existe o N1). Não há quadro de resumo.

## 11. N2 e N3

### N2: COPIOU DE?

A notícia do celular foi **copiada**. O celular diz *veio do site: [logo]*; lá, a página diz *copiou de: [logo] outro site*, e o detetive segue até o começo, onde está *quem escreveu*. A cada volta a notícia **desincha** (a validação confere). A regra continua a do N1: tem nome, pode confiar.

| | A Lia pergunta | Celular (veio do site) | Cópia | Começo | Certo |
|---|---|---|---|---|---|
| 1 | A biblioteca vai fechar?! | *"A biblioteca vai FECHAR PARA SEMPRE!!!"* · Canal | Canal: *"A biblioteca vai fechar!"* | Escola: *"Biblioteca fecha 2 semanas para reforma."* · **Diretora Rosa** | PODE CONFIAR |
| 2 | Robôs na biblioteca?! | *"URGENTE!!! ROBÔS NA BIBLIOTECA!!!"* · Blog | Blog: *"URGENTE!!! Robôs na biblioteca!!"* | Canal: *"URGENTE! Biblioteca ganha robôs."* · **Duda Lima, repórter** | PODE CONFIAR (grita, mas assinou: o tom não decide) |
| 3 | Amanhã não tem aula?! | *"AMANHÃ NÃO TEM AULA!!!"* · Blog | Blog: *"Amanhã não tem aula!!"* | @zumzum: *"Amanhã não tem aula?"* · ninguém diz | NÃO CONFIE |

Estreias (uma vez por nível, só na primeira partida):
- na cidade: *"Ache o site da notícia."* (recorte na ordem);
- na primeira cópia: *"Este site copiou!"* (recorte na linha) → a ordem troca para o próximo site → *"Siga até o começo."* (recorte na ordem);
- no começo: *"Aqui a notícia começou."* (recorte na tela) → *"Quem escreveu esta notícia?"* → *"Dá pra confiar?"*;
- quando o site da vez fica fora da tela, aparece a **pílula de borda** com o logo e a seta, e a primeira vez vem com *"O site está pra lá!"*. Ela só aparece com o centro do prédio fora da tela.

### N3: QUEM E QUANDO?

A cidade grande (6 prédios), rastros de **2 cópias**, e o começo ganha uma segunda linha: **quando: [calendário] ontem / hoje / há 2 anos**. A regra passa a ser *tem nome **e** é recente* (até 7 dias; `trusts()` e `isRecent()`). A data é dita em palavras (*hoje*, *ontem*, *há 2 anos*), sem cor diferente para a velha, para a pista vir só do conteúdo. A ordem do alto diz *Quem e quando?*.

| | A Lia pergunta | Rastro | Começo | Certo |
|---|---|---|---|---|
| 1 | Um parquinho gigante?! | Grupo → Blog → Jornal | *"Praça ganha parquinho novo."* · **Ana Lima, repórter** · ontem | PODE CONFIAR |
| 2 | Passeio no zoológico?! | Canal → Grupo → Escola | *"Passeio ao zoológico na sexta."* · **Professora Bia** · **há 2 anos** | NÃO CONFIE (assinada, mas velha) |
| 3 | Chocolate faz crescer?! | Blog → Canal → @zumzum | *"Chocolate faz crescer."* · ninguém diz · hoje | NÃO CONFIE |

Estreia no primeiro começo: *"Aqui a notícia começou."* → *"Quem escreveu esta notícia?"* → *"Veja quando foi escrita."* (recorte na data) → *"Notícia velha? Não confie."* → *"Dá pra confiar?"*. O caso que ensina a data é recente; o velho vem em seguida, sem balão.

**Saiu do plano:** as *duas notícias que discordam* (antes previstas para o N3, junto com a data). Seriam um segundo assunto no mesmo nível (regra da casa: um nível, um assunto) e mudariam a decisão para "qual das duas". Se o usuário quiser, cabem num N4 ou trocando a data.

O `?` diz, por nível: *Ache o site da notícia.* → (N2/N3) *Copiou? Siga até o começo.* → *Lá, veja quem escreveu.* / (N3) *Lá, veja quem e quando.*

## 12. Dados (`data/`)

- `sites.ts`: `SITES: Record<SiteId, SiteDef>` (nome, logo, tom, página de casa).
- `levels.ts`: `LEVELS` (N1–N3), com `street` (site → x), `cases`, `rule` (`author` | `date`) e `trail` (cópias por caso); `trusts()`, `isRecent()`, `whenLabel()`, `validateLevels()` (o rastro tem o tamanho do nível, o celular aponta a 1ª parada, a notícia desincha, a data só existe no nível que olha data, e o N3 tem um caso assinado e velho e um sem autor).
- `words.ts`: falas do guia, da Lia e os rótulos.
- `layout.ts`, `theme.ts`, `files.ts` (folhas, `addFrames` com a caixa alfa medida na carga).

## 13. Arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts sites.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts guide.ts
        street.ts walkers.ts controls.ts header.ts order.ts edge.ts
        realworld.ts phone.ts bubble.ts banner.ts
```

**Arte:** as folhas do TEXTURAS estão no jogo desde 15/10/2026 (medidas no `MANIFEST.md` dos assets). A **arte de reserva** em Graphics (`scenes/fallback.ts`) só entra se um PNG faltar. Cada fachada é ancorada pela própria caixa alfa, e a tela e a placa vêm de `FACADE.boards` (px da célula); a página do site é desenhada numa caixa de 400 de largura com a altura da tela medida e escalada para caber. A página, a ordem, o aviso de borda e o cabeçalho são do código.

## 14. Dúvidas

1. **Linha de arte:** o TEXTURAS vai na **chibi voador** (`references/35-chibi-voador.webp` anexada), como os outros jogos do 4º ano. Se for outra, trocam só os blocos STYLE.
2. **Nome do detetive:** ele não tem nome no jogo, porque nenhum balão precisa.

## Histórico

- 14/10/2026: plano e N1 em Graphics. Id 119 no catálogo (order 307), `NEXT_FREE_ID` = 120. Jogado no navegador do começo ao fim: abertura em close, demonstração, os 3 casos, o prédio errado (de graça), os dois erros (`WRONG_ANSWER` + `lose()`), o `?` e o teclado (A/D, W). ≈ 4,7 ms por quadro andando.
- A Lia segue o **sentido em que o detetive anda**, e não para onde ele olha. Senão, quando ele se vira para falar com ela, ela atravessa para o outro lado.
- Na decisão, o mapa da rua some (ele ficava por baixo dos dois botões) e o balão *"Dá pra confiar?"* fica em `balloonY` 440, entre a página e os botões.
- **14/10/2026, a primeira reprovação:** *"o jogo está muito confuso, parece tudo jogado sem contexto algum, é necessário contextualizar. Além disso, o N1 tem muita coisa no mapa, e o jogo, para acelerar, joga os elementos na tela muito rápido."* O que mudou:
  - **contexto:** abertura em 3 passos (rua = internet, celular da Lia, copiou de), cada um com animação e balão que espera (§9);
  - **menos coisa:** rua de 6 para 4 prédios (2 telas), as telas paradas mostram só o logo, a fila de fichinhas do rastro e o mapa da rua saíram. No lugar entraram uma ordem só no alto (*Vá até [logo] site*) e o aviso de borda;
  - **ritmo:** o celular espera os balões da Lia, a manchete é escrita letra a letra, o detetive anda mais devagar e nenhuma peça entra antes de a anterior acabar;
  - o caso 3 virou *"Amanhã não tem aula"* (Canal → @zumzum), porque a quadra precisava do Site da Escola.
- **14/10/2026, a segunda reprovação:** *"ainda tá sem contexto, e a cidade da internet tá muito enorme, o tamanho dessa cidade deveria ser do N3, e não do N1. E o N1 deveria abordar temas mais simples."* O que mudou:
  - **contexto:** entrou o mundo de verdade. A notícia chega no pátio da escola, o detetive mergulha no celular para investigar na cidade da internet e volta para o pátio, onde a consequência acontece. A regra é dita antes da primeira decisão (*"Tem nome? Pode confiar." / "Ninguém assina? Não confie."*);
  - **cidade do tamanho do nível:** N1 numa tela só (3 prédios, zoom 0,8, sem rolagem); N2 com 2 telas; a cidade grande ficou para o N3;
  - **temas simples:** passeio ao zoológico, sorvete de graça, gatinho perdido. A notícia vem direto do site, sem cópia: o *copiou de* foi para o N2;
  - **menos controle:** o detetive olha sozinho quando para diante de um prédio, e o botão da lupa saiu;
  - a Lia saiu da rua: ela fica no pátio.
- **15/10/2026, texturas e 2 prédios.** Pedido: *"implemente as texturas … deixe 2 prédios apenas no n1"*. O que mudou:
  - as 7 folhas entraram; a névoa de alfa ≤ 24 foi zerada (originais em `outputs/rastro-da-noticia/originais/`);
  - as telas das fachadas vieram baixas e largas (≈ 2,7 : 1): a página passou a ser desenhada na proporção de cada tela, e o zoom do olhar sai da largura dela;
  - o N1 tem **só a Escola e o @zumzum**, numa tela de 1280 a zoom 1; o Jornal saiu e o caso do gatinho foi para o Site da Escola, assinado pelo **Seu Zé, porteiro**;
  - o recorte de *"Cada prédio é um site."* pega só telhado, placa e tela, e o balão desceu para baixo dele.
- **15/10/2026, N2 e N3.** Pedido: *"faça n2 e n3"*. O que entrou:
  - **N2 (copiou de):** 4 prédios em 2 telas, uma cópia antes do começo, a notícia desinchando a cada volta, o caso que grita e foi assinado, e a pílula de borda com a sua frase;
  - **N3 (quem e quando):** 6 prédios em 3600, rastros de 2 cópias e a linha *quando:* no começo (o calendário é desenhado em código). As *duas notícias que discordam* saíram do N3 para não empilhar dois assuntos;
  - o celular passou a dizer sempre *veio do site:*; *copiou de:* só aparece nas páginas;
  - a rua longa repete o `rua.png` **espelhado** a cada tela, porque a imagem não emenda (prédios e pedras cortados na borda);
  - a barra, o clarão e as faixas das páginas foram assados em textura: o N3 caiu de ≈ 6,7 ms para ≈ 1,7 ms por quadro.
