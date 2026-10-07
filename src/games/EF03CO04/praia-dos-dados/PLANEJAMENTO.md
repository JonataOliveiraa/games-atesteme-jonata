# Praia dos Dados — planejamento

Jogo **108** (o 107 foi para os *Robôs Famintos*, de outra sessão) · EF03CO04 · 3º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF03CO04.md`.
Padrão: `docs/rodada-3/PADRAO-R3.md` e `src/games/INSTRUCOES.md` ("A derrota").
Modelos: `EF03CO02/fabrica-liga-desliga` (o mais recente, com `createTutorial`,
modos e arte medida) e `EF02CO05/rota-do-busao` (balões e foco na escolha).

**A mecânica não é a da ficha.** A ficha (detector quente/frio + quiosque que
funde fichas e abre o baú) repetia a *Caverna dos Dados* (062): as mesmas frases
(`quarta 14h festa`, `sábado praça piquenique` + `sapato`, `acordar às 7`), o
mesmo intruso e o mesmo dado escondido no N3. Em 05/10/2026 o usuário pediu
"outra ideia, com gameplay diferente e divertida" e escolheu **"Cadê o dono?"**:
um cachorrinho perdido na praia, dados sobre o dono chegando pelo rádio, e a
praia cheia de gente.

O plano decide o resto pela régua "simples e claro" (§15):
- N1, N2 e N3 feitos em 05/10/2026, com a arte toda em `Graphics` até os PNGs chegarem (§Histórico);
- **1 erro encerra**: `WRONG_ANSWER` + `lose()`, uma vez, com a cena do erro
  **antes** do `lose()`;
- um gesto só: **tocar**.

**Há duas dúvidas abertas no §16.** A primeira é um ajuste fino da ideia
escolhida: em vez de **tocar o dono**, a criança **tira quem não combina** (como
no *Cara a Cara*), e o dono é quem sobra. O TEXTURAS serve às duas versões e
não espera pelas respostas.

---

## 1. O jogo em uma frase

A **salva-vidas Nina** achou o **Paçoca**, um cachorrinho perdido, e alguém na
praia é o dono dele. Seis banhistas estão nas suas toalhas. Pelo rádio chegam
**dados soltos** sobre o dono: *"O dono usa BONÉ!"*. Cada dado vira uma ficha na
**prancheta** do alto, e a criança **toca em quem não combina**. Essa pessoa diz
*"Não sou eu!"* e corre para o mar, *tchibum*. Um dado só não basta, porque
sobram três de boné. Com o segundo dado sobra **uma** pessoa, e o Paçoca corre
para o colo dela. As fichas da prancheta se juntam no **cartão do dono**: os
dados, juntos, viraram a informação.

## 2. A habilidade e os irmãos

> **(EF03CO04)** Relacionar o conceito de informação com o de dado.
>
> Pode-se mostrar exemplos de dados que individualmente não possuem significado
> relevante, mas que, em conjunto, definem alguma informação. Por exemplo, cada
> um dos dados de um endereço (…), em conjunto, definem a informação de um
> endereço específico (…).

| O que a BNCC pede | Onde acontece |
|---|---|
| **dado** | cada ficha do rádio: `BONÉ`, `BALDE`, `ÓCULOS` |
| **sozinho, sem significado relevante** | depois do 1º dado ainda sobram 2 a 4 pessoas: *"boné"* não diz quem é |
| **em conjunto** | cada dado novo vale **junto** com os de antes: quem sobrou combina com **todos** |
| **define uma informação específica** | sobra **uma** pessoa; o cartão do dono junta as fichas e mostra quem ela é |
| **nem todo dado ajuda** (N3) | um dado que todos que sobraram têm não separa ninguém |

É o exemplo do endereço com outra roupa. *"Rua das Flores"* serve para cem
casas e *"número 12"* para mil; juntos, apontam uma só. Aqui *"boné"* serve para
três banhistas e *"balde"* para dois, mas juntos apontam o dono.

**O teste da bolinha.** Troque as palavras e os pictogramas das fichas por
bolinhas sem sentido: o jogo não tem solução. As seis toalhas são iguais, e
ninguém se mexe, brilha ou reage quando o dado chega. Para saber quem sai, é
preciso ler o dado e olhar a pessoa.

**Os irmãos:**

| Jogo | O que a criança faz |
|---|---|
| *Montador de Informações* (R1, 017) | **encaixa** dados soltos em campos com rótulo (dia/mês/ano, rua/número) |
| *Caverna dos Dados* (R2, 062) | **recolhe** fichas e **junta** as que contam a mesma coisa, deixando o intruso de fora |
| **Praia dos Dados** (este) | **usa** os dados para achar **uma** coisa entre várias: cada dado corta parte da praia, e só o conjunto aponta o dono |

Os dois irmãos mostram a informação nascendo de **juntar** os dados. Este mostra
o que a informação **faz**: ela identifica. E mostra também o que um dado
sozinho não faz, porque a criança vê os três de boné sobrando.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| detector quente/frio pela areia | **sai** | caçar com o dedo não é a habilidade e repete a mineração da Caverna |
| dados enterrados (`quarta`, `14h`, `festa`…) | dados sobre o **dono** chegando pelo rádio (`BONÉ`, `BALDE`…) | as frases da ficha são as da Caverna (062) |
| quiosque com painel de encaixes e baú | a **prancheta** recebe os dados, e o **cartão do dono** é a informação | o painel que funde é a mecânica da Caverna |
| intrusos plausíveis (N2/N3) | **N3: o dado que não ajuda** (todos que sobraram têm) | é o "intruso" que faz sentido aqui: um dado verdadeiro que não separa ninguém |
| dado extra-fundo, bipe fraco | **sai** | sem detector |
| TRAVA: fumaça, cadeado, intrusa treme; tirar destrava (+5) | **1 erro encerra**: tirar quem combina → a pessoa protesta, o Paçoca chora → `WRONG_ANSWER` + `lose()` | INSTRUCOES "A derrota" |
| após 2 travas, borda dourada nas certas | **sai** | com 1 erro não há segunda trava, e borda no certo é pista que entrega |
| placa "Dados são pedacinhos. Juntos, viram informação!" | vira a **fala da Nina** no fim da 1ª fase e a frase do diário | sem placa fixa disputando atenção |
| +5 por achado, +15 de primeira | `CORRECT_ANSWER` (+10) por **dono achado** | um evento por decisão inteira |
| fim: baú + diário (dados de um lado, informações do outro) | **mantido** o diário: cada linha tem as fichas → o cartão do dono | é a habilidade desenhada |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | o exemplo virou o tutorial (`createTutorial`, §9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| responsivo, retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre painel ilustrado | `?` repete os balões do tutorial | PADRAO-R3 |
| sons do detector | rádio, *tchibum*, latido (WebAudio) | sem detector |
| telemetria: intrusos, tempo, travas | `CORRECT_ANSWER` por dono; `WRONG_ANSWER` no erro | a bridge não tem esses campos |
| prévia escolhida: "toque no **dono**" | a criança tira **quem não combina**; o dono é quem sobra | §16, dúvida 1 |
| prévia escolhida: N2 com **8** banhistas | **6** em todos os níveis | teto de alvos: 6 só em grade limpa 2 × 3 |

## 4. O laço

```
fase nova · 6 banhistas nas toalhas · o cachorro chora ao pé da torre
        │
        ▼
   ┌─► chiado no rádio · a Nina fala: "O dono usa BONÉ!" [Ok]
   │   a ficha BONÉ voa para a prancheta
   │        │
   │   a criança toca em quem NÃO usa boné
   │   ┌────┴──────────────────────────────┐
   │ não combina                         combina (usa boné)
   │ "Não sou eu!" · corre para o mar     protesta "Eu uso BONÉ!", o cachorro
   │ tchibum · a toalha fica vazia        chora, a ficha treme
   │        │                             WRONG_ANSWER + lose() → done
   │ saíram todos os que não combinam?
   │ (N1/N2: o jogo vê sozinho · N3: a criança toca no RÁDIO)
   │        │
   │  sobrou mais de 1? ── sim ──┐
   │        │ não                │
   └────────┼────────────────────┘ (próximo dado)
            ▼
   sobrou 1: o cachorro corre e pula no colo do dono · as fichas se juntam
   no CARTÃO DO DONO [Próximo] · CORRECT_ANSWER · bolinha da fase acende
   fase seguinte, ou fim: diário da praia + showLevelComplete
```

**Quem sobrou combina com todos os dados.** Como cada dado tira quem não o tem,
quem continua na praia já passou por todos os dados anteriores. A criança só
precisa olhar o dado da vez, e a praia guarda o resto. É a "soma" dos dados
acontecendo diante dela.

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`. **Quando a arte chegar, o layout se ajusta
ao que for medido.**

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | 3 bolinhas das fases em (194, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| **prancheta** | (800, 118), 760 × 92 | moldura em código; à esquerda a carinha do cachorro da fase, depois as fichas que chegam (pictograma + palavra), até 3 |
| torre da salva-vidas | pintada no fundo, x 0–310 | a plataforma em y ≈ 360 |
| **Nina** | pés em (155, 360), ~200 px | fala, comemora, se preocupa |
| balão da Nina | (560, 250), até 520 × 120 | `fala espera botão`: escreve e espera o Ok |
| **rádio** (só N3) | (160, 500), 130 × 130, com "PRÓXIMO DADO" embaixo em y 585 | borda branca fixa, sem pulsar |
| cachorro | sentado em (190, 670), ~110 px | chora, corre, pula |
| **toalhas** | grade 2 × 3: x 485 / 790 / 1095; pés em y 440 / 700 | todas iguais |
| **banhistas** | um por toalha, ~200 px de altura, pés no centro da toalha | |
| zona de toque | cada baia, 270 × 225 (de pés − 210 a pés + 15) | respiro de 35 px entre baias |
| mar | faixa do alto do fundo, y ≈ 90–210 | quem sai corre para lá |
| cartão do dono | (800, 420), 620 × 320, sob véu | fim da fase |

**Densidade:** **6 alvos** numa grade limpa de 2 × 3, cada um na sua toalha,
com 35 px de respiro. É o teto (memória *densidade de alvos*), e ele diminui a
cada toque certo. No N3 entra o **rádio**, fora da grade. São duas regiões
tocáveis (a grade e o rádio), mais o `?`.

**Teclado:** `1`–`6` tocam as baias (linha de cima, depois a de baixo);
`Espaço` toca o rádio (N3); `H` repete o tutorial.

## 6. Elenco, dados e fases (`data/cast.ts`, `data/levels.ts`)

### Os 12 banhistas

Cada banhista tem **4 traços**. Os dados só falam de presença (*"usa boné"*),
nunca de ausência (negação é EF03CO01).

| id | Quem | Cabeça | Óculos escuros | Na mão | Pés |
|---|---|---|---|---|---|
| `leo` | menino | boné | ✓ | balde | — |
| `bia` | menina | boné | — | boia | pé de pato |
| `ze` | vovô | chapéu | ✓ | — | — |
| `duda` | menina | — | ✓ | bola | pé de pato |
| `rafa` | menino | chapéu | — | balde | pé de pato |
| `mari` | moça | — | — | balde | — |
| `beto` | tio | boné | ✓ | — | pé de pato |
| `mei` | menina | chapéu | ✓ | boia | — |
| `caio` | menino | — | — | bola | — |
| `nena` | vovó | chapéu | — | bola | pé de pato |
| `nico` | menino | boné | — | — | — |
| `tati` | moça | — | ✓ | boia | pé de pato |

Os 12 têm combinações diferentes. Cada traço aparece em 3 a 6 pessoas. Roupa,
cabelo e pele variam, mas **nunca** nas cores dos objetos que viram dado
(vermelho, azul, amarelo e verde-limão), para *"boné"* não se confundir com uma
roupa vermelha.

### Os 7 dados

| id | Ficha | A Nina diz | Quem tem e é tocado (erro) | Quem não tem e fica (erro do rádio, N3) |
|---|---|---|---|---|
| `cap` | BONÉ | *O dono usa BONÉ!* | *Eu uso BONÉ!* | *Opa! Eu não uso BONÉ.* |
| `hat` | CHAPÉU | *O dono usa CHAPÉU!* | *Eu uso CHAPÉU!* | *Opa! Eu não uso CHAPÉU.* |
| `glasses` | ÓCULOS | *O dono usa ÓCULOS!* | *Eu uso ÓCULOS!* | *Opa! Eu não uso ÓCULOS.* |
| `bucket` | BALDE | *O dono tem BALDE!* | *Eu tenho BALDE!* | *Opa! Eu não tenho BALDE.* |
| `ring` | BOIA | *O dono tem BOIA!* | *Eu tenho BOIA!* | *Opa! Eu não tenho BOIA.* |
| `ball` | BOLA | *O dono tem BOLA!* | *Eu tenho BOLA!* | *Opa! Eu não tenho BOLA.* |
| `fins` | PÉ DE PATO | *O dono usa PÉ DE PATO!* | *Eu uso PÉ DE PATO!* | *Opa! Eu não uso PÉ DE PATO.* |

Se a pessoa tocada for o próprio dono, a fala ganha um final: *"Eu uso BONÉ! O
Paçoca é meu!"*.

### Os três cachorros

Uma fase, um cachorro, nesta ordem em todos os níveis: **Paçoca** (vira-lata
caramelo), **Salsicha** (salsichinha marrom) e **Floco** (branquinho fofo).

### Os níveis (um assunto por nível)

| Nível | Assunto | Dados por fase | O rádio |
|---|---|---|---|
| 1 | **um dado só não basta**: dois apontam um | 2 | automático: quando saem todos os que não combinam, vem o próximo dado |
| 2 | **às vezes nem dois bastam** | 3 (com 2 dados ainda sobram 2 pessoas) | automático |
| 3 | **nem todo dado ajuda**: um dado que todos que sobraram têm não tira ninguém | 3, sendo **1 que não separa** | **a criança toca no RÁDIO** quando acabou (botão novo, junto com o assunto novo) |

### As fases

As baias contam da esquerda para a direita, na linha de cima e depois na de
baixo (0–5). Entre colchetes estão os que saem em cada dado.

| Fase | Baias 0–5 | Dados → quem sai | Dono |
|---|---|---|---|
| N1-1 Paçoca | ze, leo, mari, nico, caio, beto | BONÉ [ze, mari, caio] → BALDE [nico, beto] | leo |
| N1-2 Salsicha | bia, rafa, duda, mei, mari, nena | CHAPÉU [bia, duda, mari] → BOIA [rafa, nena] | mei |
| N1-3 Floco | tati, duda, nico, leo, ze, caio | ÓCULOS [nico, caio] → BOLA [tati, leo, ze] | duda |
| N2-1 Paçoca | duda, beto, bia, tati, leo, nico | BONÉ [duda, tati] → ÓCULOS [bia, nico] → PÉ DE PATO [leo] | beto |
| N2-2 Salsicha | ze, caio, rafa, mei, nena, duda | PÉ DE PATO [ze, caio, mei] → BOLA [rafa] → CHAPÉU [duda] | nena |
| N2-3 Floco | mari, tati, ze, bia, mei, duda | BOIA [mari, ze, duda] → ÓCULOS [bia] → PÉ DE PATO [mei] | tati |
| N3-1 Paçoca | ze, leo, caio, mari, beto, tati | BONÉ [ze, caio, mari, tati] → ÓCULOS [ninguém] → BALDE [beto] | leo |
| N3-2 Salsicha | leo, ze, duda, beto, mei, tati | ÓCULOS [ninguém] → PÉ DE PATO [leo, ze, mei] → BOIA [duda, beto] | tati |
| N3-3 Floco | bia, rafa, mari, nena, caio, nico | CHAPÉU [bia, mari, caio, nico] → PÉ DE PATO [ninguém] → BOLA [rafa] | nena |

**`validateLevels(LEVELS)` no import** (`console.error` em dev), simulando cada
fase:
- 6 banhistas diferentes do elenco; o dono está entre eles;
- dados de **traços diferentes**, e o dono tem todos;
- **cada dado sozinho** serve para pelo menos 2 dos 6 (*um dado só não basta*);
- antes do último dado sobram **pelo menos 2**; depois dele, **só o dono**;
- N1: 2 dados, e todos tiram alguém;
- N2: 3 dados, todos tiram alguém (então, com 2, ainda sobram 2);
- N3: 3 dados, **exatamente um** não tira ninguém, e ele nunca é o último;
- o dono não fica na mesma baia em duas fases seguidas;
- as falas cabem (≤ 30 letras no balão da Nina; ≤ 36 no protesto).

## 7. O erro

**Tirar quem combina = 1 erro, encerra.** A cena vem antes do `lose()` e dura
~1,2 s:

1. A pessoa tocada **não sai**: ela cruza os braços e treme, e diz no balãozinho
   *"Eu uso BONÉ!"* (o dono: *"Eu uso BONÉ! O Paçoca é meu!"*).
2. A ficha BONÉ da prancheta treme junto.
3. O cachorro deita e chora, e a Nina põe as mãos no rosto.
4. `WRONG_ANSWER` + `lose()` e `if (this.lives.remaining <= 0) return`.

**N3: tocar no rádio com alguém que não combina ainda na toalha** também
encerra. Essa pessoa treme e diz *"Opa! Eu não uso ÓCULOS."*, a ficha treme, e
o resto segue igual.

Sem vermelho de alerta e sem som áspero: o cachorro faz um "ai-ai" baixinho.

**Não é erro:**
- tocar numa toalha vazia, na areia, no mar, na Nina ou no cachorro;
- tocar durante o balão da Nina (os toques ficam travados);
- demorar. Não há relógio.

**Pontos e estrelas:** `CORRECT_ANSWER` (+10) por **dono achado**. **3
estrelas** ao concluir, porque concluir já significa zero erro.

**Pista que entrega (conferido):**
- ninguém reage quando o dado chega (nem olha para o próprio boné);
- as toalhas são iguais;
- não há brilho em quem combina, e nenhum alvo pulsa;
- no N1 e no N2, o próximo dado chega sozinho, e isso só diz "acabou este dado",
  nunca quem é o dono;
- a cor da ficha é a mesma para todos os dados, e o pictograma é o próprio
  objeto (conteúdo, não pista).

## 8. O acerto e o fim

**Toque certo:** a pessoa diz *"Não sou eu!"*, dá um pulinho, corre para o alto
encolhendo (rumo ao mar) e some num *tchibum* de espuma. A toalha fica vazia.

**Dado resolvido** (saíram todos os que não combinam): a ficha dá um "plim" e
ganha um tique pequeno. No N1 e no N2, depois de 0,6 s, o rádio chia e vem o
próximo dado. No N3, a criança toca no rádio. Quando ela toca com um dado que
não tirou ninguém, a Nina confirma depois: *"Todos usam ÓCULOS! Ninguém sai."*,
e a ficha fica clarinha (*"não ajudou"*).

**Sobrou um:**
1. O cachorro levanta, corre da torre até o dono e pula no colo dele. Saem
   coraçõezinhos, a Nina comemora e se ouve um latido feliz.
2. A tela escurece em volta, e as fichas da prancheta **voam e se juntam** no
   **cartão do dono**: o retrato do dono com o cachorro e, embaixo, as fichas
   lado a lado (*BONÉ + BALDE*). A ficha que não ajudou (N3) vem clarinha.
3. No fim da 1ª fase do N1, só uma vez, a Nina diz: *"Um dado sozinho não diz
   quem é. Juntos, eles dizem!"*.
4. [Próximo] → `CORRECT_ANSWER` e a bolinha da fase acende. O dono e o cachorro
   vão embora, e as toalhas recebem os banhistas da fase seguinte.

**Fim do nível: o diário da praia** (quadro em código). Uma linha por fase: as
fichas de um lado (**dados**), uma seta, e o retrato do dono com o cachorro do
outro (**informação**). Embaixo vem a frase *"Dados são pedacinhos. Juntos,
viram informação!"*. Depois, confete e o `showLevelComplete`.

## 9. Tutorial (`createTutorial`, uma frase por balão)

`teach(scene, key, steps)` como na Fábrica (`textSize 30`, `once: false`,
`safeTop 90`), com chave por nível. Véu escuro com recorte e anel no ponto,
**sem mãozinha** (pedido do Robô em Pedaços). O dedo nunca aponta quem sai numa
decisão avaliada: a demonstração tira **um**, e o resto é da criança.

**N1, fase 1** (Paçoca):
1. Recorte na Nina e no cachorro: *"O Paçoca se perdeu! Vamos achar o dono."*
   (Próximo)
2. O rádio chia e a ficha BONÉ voa para a prancheta. Recorte na ficha: *"Um
   dado: o dono usa BONÉ."* (Próximo)
3. Recorte em uma baia sem boné (o vovô de chapéu): *"Quem não usa boné não é o
   dono."* (Ver) → ele diz *"Não sou eu!"* e corre para o mar.
4. Recorte na grade: *"Tire os outros que não usam boné."* (Vamos lá!) → a
   criança joga, e isso conta.
5. Saíram todos, e sobram 3 de boné. Recorte nos três: *"Sobraram 3. Um dado só
   não basta!"* (Próximo) → o rádio traz BALDE, e a criança segue sozinha.

**N2, fase 1**, um balão na prancheta: *"Agora são 3 dados. Às vezes, 2 não
bastam!"* (Vamos lá!).

**N3, fase 1** (o rádio estreia sendo usado):
1. O rádio entra em cena. Recorte nele: *"Agora você chama o próximo dado."*
   (Próximo)
2. Chega BONÉ, a criança tira quem não usa, e nada acontece sozinho. Recorte no
   rádio: *"Pronto? Toque no rádio!"* (Ok) → ela toca.
3. Chega ÓCULOS, e os dois que sobraram usam. Recorte nos dois e na ficha:
   *"Os dois usam óculos. Ninguém sai: toque no rádio!"* (Ok). É o treino da
   estreia, e as fases 2 e 3 já não têm ajuda.

O `?` repete os passos 1, 2 e 5 do N1 (e o 1 do N3, no N3), sem demonstração,
com Continuar.

**Dá para entender o objetivo sem ler?** Quase: o cachorro chorando, a pessoa
correndo para o mar e o abraço no fim contam a história. O dado é escrito, mas
vem com o pictograma do próprio objeto, e o 3º ano lê.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| dado chega | chiado no rádio, balão da Nina, a ficha voa para a prancheta | "chhk" + bipe |
| toque certo | *"Não sou eu!"*, pulinho, corrida, espuma | "hop" + *tchibum* |
| dado resolvido | tique na ficha | "plim" |
| rádio (N3) | o rádio afunda | "clic" + chiado |
| sobrou um | o cachorro corre e pula; corações; a Nina comemora | latido feliz |
| cartão do dono | as fichas voam e se juntam | "fiuu" + acorde curto |
| erro | braços cruzados, a pessoa treme, a ficha treme, o cachorro chora | "ai-ai" baixinho + duas notas descendo |
| fim | diário, confete | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · radio · play · reunion · jam · finale ·
done · panel`. As baias só respondem em `play`; o rádio (N3), só em `play`.

A fase guarda `left` (os banhistas que ainda estão na praia), `dataIndex` e
`pending` (quem ainda precisa sair pelo dado da vez = `left` sem o traço).

- **toque numa baia** em `play`: se a pessoa está em `pending`, ela sai e é
  removida de `left` e de `pending`; senão vem `jam('kept')`;
- **`pending` vazio**: N1/N2 → `nextDatum()` depois de 0,6 s; N3 → espera o
  rádio;
- **rádio** (N3): `pending` vazio → `nextDatum()`; senão → `jam('missed')`,
  com o primeiro de `pending` falando;
- **`nextDatum()`**: se acabaram os dados (sobra 1, como a validação garante) →
  `reunion()`; senão → `mode = 'radio'`, a Nina fala, a ficha entra, e calcula
  `pending`;
- **`jam(kind)`**: a cena do §7 → `WRONG_ANSWER` + `lose()` → `done`.

A bridge segue a Fábrica: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por dono, `WRONG_ANSWER` + `lose()` no erro, `CHECKPOINT` com
`progress = round(fasesFeitas / fases × 100)`, `GAME_COMPLETED {stage:
this.level.level, totalStages: LEVELS.length}` e o `onCommand` de START. O jogo
nunca emite `GAME_OVER` e nunca escreve `isFinalStage`.

## 12. N2 e N3

Estão no §6 (assunto, fases e validação) e no §9 (as estreias). Mudam só os
dados e o rádio manual: nem tela nova, nem arte nova, porque tudo já está nas
folhas do N1.

## 13. Arquivos, texturas e quem mexe

| Lógica | Peças e apresentação |
|---|---|
| `types.ts`, `data/cast.ts` (elenco e traços), `data/levels.ts` (fases, validação), `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (modos, `left`/`pending`, erro, fases) | `data/layout.ts`, `data/theme.ts`, `data/words.ts`, `scenes/beach.ts` (fundo, toalhas, espuma), `bather.ts` (banhista: sair correndo, protestar), `dog.ts`, `lifeguard.ts` (Nina, balão, rádio), `board.ts` (prancheta, fichas, cartão do dono), `finale.ts` (diário), `hud.ts`, `audio.ts`, `guide.ts`, catálogo e `gameInstructions` |

**Textura** (linha **chibi de ícone**, `33`, sujeita à dúvida 2; prompts no
[TEXTURAS.md](./TEXTURAS.md)):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-praia.png` | 1280 × 720 | céu, mar no alto, areia **lisa** na área das toalhas, torre da salva-vidas à esquerda |
| `banhistas.png` | 6 × 2, 256 × 384 | os 12 banhistas de pé, de frente, com os traços **exatos** da tabela do §6 |
| `cachorros.png` | 4 × 3, 256 | Paçoca, Salsicha e Floco: sentado triste, correndo, pulando feliz, deitado chorando |
| `pecas.png` | 4 × 3, 256 | Nina (rádio, comemorando, preocupada), o rádio grande, a toalha e os 7 pictogramas dos dados |
| `cover-praia-dos-dados.png` | 1672 × 941 | capa **com o título** |

**Código:**
- a moldura da prancheta, as fichas (pictograma do PNG + palavra) e o cartão
  do dono;
- os balões e os tiques;
- a espuma do *tchibum*, os corações e o confete;
- o diário, as bolinhas do HUD e o `?`.

**Antes da arte:** retângulos e círculos com o nome, só para testar.

**Registro:** id = `NEXT_FREE_ID` no commit (**108**), e o `NEXT_FREE_ID` foi para 109. O
slug é `praia-dos-dados`. O jogo entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`,
ganha 3 frases em `gameInstructions.ts`, a página de detalhes e
`public/og/praia-dos-dados.jpg`. A categoria é **Mundo Digital** e a ordem fica
logo depois da Caverna (175).

## 14. Travas para quem mexer depois

- Os dados só falam de **presença**. Nada de *"sem óculos"*.
- Ninguém reage ao dado que chega: reagir entrega a resposta.
- Os traços de cada banhista são **dado** (`data/cast.ts`) e precisam bater
  com a arte. Se a arte vier diferente, corrija a tabela, não o desenho no
  código.
- Roupa nunca na cor de um objeto que vira dado.
- Toda fase é validada no import, simulando os dados. Fase nova sem passar na
  validação não entra.
- O erro é só **tirar quem combina** (e, no N3, **chamar o rádio cedo**). Toque
  fora da pessoa nunca conta.
- A cena do erro vem **antes** do `lose()` e cabe em ~1,2 s.
- Os toques ficam travados durante os balões da Nina, e o balão espera o Ok.
- No máximo 6 banhistas, sempre na grade 2 × 3.

## 15. Decisões (régua "simples e claro")

1. **Tirar quem não combina, em vez de tocar o dono** (dúvida 1): cada dado vira
   uma ação, e o "sobraram 3" fica visível.
2. **Rádio automático no N1 e no N2, manual no N3:** o botão só entra quando o
   assunto precisa dele (o dado que não tira ninguém).
3. **Seis banhistas em todos os níveis**, e a dificuldade cresce pelo número de
   dados e pelo dado que não ajuda.
4. **Um cachorro por fase**, sempre na mesma ordem: a fase nova tem cara nova
   sem regra nova.
5. **Sem relógio e sem dica de tempo:** nada pulsa esperando toque.
6. **O nome da planilha fica** (*Praia dos Dados*), e *"Cadê o dono?"* é a
   primeira fala da Nina.

## 16. Dúvidas

1. **Tocar o dono ou tirar quem não combina?** A prévia escolhida dizia *"toque
   no dono → o cachorro corre"*. O plano faz a criança **tirar quem não
   combina** (*Cara a Cara*), e o dono é quem sobra. Os motivos:
   - cada dado pede uma ação;
   - o *"um dado só não basta"* aparece na tela, com 3 sobrando;
   - o dado do N3 que não tira ninguém só tem sentido assim.

   A outra versão é: todos os dados chegam primeiro, e a criança toca **uma vez**
   no dono. Usa a mesma arte e é mais curta, mas o "sobraram 3" vira conta de
   cabeça, e o N3 perde o assunto.
2. **A linha de arte.** O TEXTURAS está na **chibi de ícone** (`33`), porque a
   chibi de figurinha (`19`) não está mais no disco. Se quiser outra, troco só o
   bloco de estilo dos prompts; as grades e as células ficam.

## Histórico

- **05/10/2026** — plano e texturas. A ficha repetia a Caverna dos Dados, e o
  usuário escolheu "Cadê o dono?" entre três ideias.
- **05/10/2026** — o jogo, com N1, N2 e N3, em `Graphics`. Pedido: "não desvie do foco: cumprir o propósito da habilidade". Ficou a versão do plano (tirar quem não combina), e a dúvida 1 fechou assim.
  - A arte de reserva (`scenes/fallback.ts`) é assada nas **mesmas folhas e grades** do TEXTURAS (`bg-praia`, `banhistas` 6 × 2, `cachorros` 4 × 3, `pecas` 4 × 3). O `addFrames` corta cada folha pela grade, então um PNG com a mesma grade entra sem mudar código; só o tamanho na tela pode pedir ajuste.
  - No N3 a ficha **não** ganha o tique quando o último que não combina sai: o tique só vem com o toque no rádio. Senão o tique avisaria "acabou", e apertar o rádio deixaria de ser decisão.
  - Quando sobra um, o encontro vem sozinho, também no N3.
  - Conferido no navegador: N1 → N2 → N3 seguidos (`GAME_COMPLETED` 1, 2 e 3), o tutorial do N1 até o "Sobraram 3", a apresentação do N2, a estreia do rádio no N3 com o dado que não ajuda, o erro de tirar o dono ("Eu uso BONÉ! O Paçoca é meu!" → `WRONG_ANSWER` + `GAME_OVER`), o erro do rádio cedo ("Opa! Eu não tenho BALDE."), o diário e o `?`.
  - Registro: id 108, `gameInstructions` (3 frases), `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`. Faltam a capa e o `public/og/praia-dos-dados.jpg`, que esperam o PNG.
- **06/10/2026** — texturas no jogo. Os 12 banhistas vieram com os traços certos. A Nina e o rádio chegaram numa folha própria (`salva-vidas.png`, 4 × 1) e a `pecas.png` ficou 4 × 2; o código seguiu. As folhas foram limpas de franja e pontinhos, e o `addFrames` agora mede a caixa de cada célula na carga, com a figura apoiada no pé. Ajustes: fileira de baixo em y 664, banhista com 190 px, toalha com 200, a Nina no deck da torre (pés em 360), cartão do dono com 700 de largura. Detalhes em `src/assets/.../praia-dos-dados/MANIFEST.md`. Falta a capa.
- **06/10/2026** — `bg-praia-madeira.png` (a coluna da frente da cabine) vai por cima da Nina, com a mesma escala do fundo; a Nina fica entre as duas camadas e parece estar dentro da cabine.
- **06/10/2026** — capa no catálogo (`thumbnail`) e `public/og/praia-dos-dados.jpg`. As folhas estão todas entregues.
