# Rio de Chocolate — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO03 · 5º ano · Pensamento Computacional · Lógica computacional** · id **124** · pasta `src/games/EF05CO03/rio-de-chocolate/`

> **(EF05CO03)** Realizar operações de negação, conjunção e disjunção sobre sentenças lógicas e valores 'verdadeiro' e 'falso'.

Pedido do usuário (15/10/2026): colou a ficha *Doceria Lógica*; avisei que o N3 (pedido-espelho) repetia o Portões Lógicos (078) e o Achados e Perdidos (081), e que o laço era o da Fábrica de Carimbos (099). Ele respondeu *"queria um estilo de gameplay bem divertido"*, escolheu o **Rio de Chocolate** entre três ideias e pediu *"planeje e faça. use apenas Graphics, as texturas e adicionarei em breve"*, *"apenas com n1"*.

---

## 0. Por que não é a ficha, e o que ficou dela

| Irmão | O que a criança faz |
|---|---|
| Arena da Lógica (033) | julga frases soltas num circuito |
| Circuito da Verdade (044) | julga frases de conhecimento do mundo |
| Portões Lógicos (078) | olha uma criaturinha e abre o portão da frase verdadeira |
| Achados e Perdidos (081) | olha um bichinho e pendura as frases verdadeiras sobre ele |

Nos quatro, a criança parte do **objeto** e julga a **frase**. Aqui ela parte da **frase** (a placa) e procura o **objeto** que a deixa verdadeira, que é a parte nova da ficha. O que muda é o gesto: em vez de tocar num doce da vitrine, ela **pula** nele. E a resposta é física: o doce aguenta, ou afunda com ela.

Da ficha ficaram os doces e os atributos (cor, forma, cobertura, tamanho), as frases do N1 e o letreiro que confere parte por parte.

## 1. O jogo em uma frase

**A Mel precisa atravessar o rio de chocolate pulando em doces que boiam. A placa diz qual doce aguenta: pule só nos doces que deixam a frase verdadeira.**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **sentença lógica** | a placa no alto: *"Aguenta o doce que tem GRANULADO"* |
| **valor verdadeiro / falso** | cada doce deixa a frase verdadeira (aguenta) ou falsa (afunda). O letreiro marca ✓ ou ✗ quando a Mel pousa |
| **negação** (N1) | *"Aguenta o doce que NÃO é ROSA"*: o letreiro confere *é ROSA* (✓/✗) e o NÃO **vira** a marca |
| **conjunção e disjunção** (N2, planejado) | *"é ROSA E é REDONDO"*, *"é LISTRADO OU é PEQUENO"*: duas marcas, e o E ou o OU juntam as duas |

## 3. O laço

1. **Começa uma travessia.** A Mel está na margem da esquerda; a festa, na da direita. Entre as duas boiam **3 fileiras de 3 doces**, uma atrás da outra. A placa entra grande no meio da tela e depois sobe para o alto.
2. **A fileira da vez acende**: os 3 doces dela ganham o mesmo anel amarelo pulsando. As fileiras de depois ficam esmaecidas.
3. **A criança toca num doce**, e a Mel pula nele.
   - **A frase vale para ele:** o doce balança e aguenta. A peça do letreiro e o doce pulam juntos e aparece o ✓ (com NÃO: primeiro a marca de *é ROSA*, depois o NÃO a vira). Faísca verde, e a tela anda para a próxima fileira.
   - **A frase não vale:** a mesma conferência termina em ✗. O doce treme e afunda, a Mel cai no chocolate (*plof*!) e sai lambuzada. A peça culpada treme, a faixa diz o motivo (*"Esse doce é rosa!"*) e a partida acaba.
4. **Depois da 3ª fileira** a Mel pula sozinha para a margem da festa, e a bolinha da fase acende. Começa a próxima travessia, com outra placa.

Não há relógio: a Mel espera em cima do doce o tempo que for preciso.

## 4. Controle

| Onde | O quê |
|---|---|
| os 3 doces da fileira da vez | tocar = pular nele |

É um gesto só, e não há mira para errar: só os 3 doces da vez têm zona de toque. Tocar na água, numa fileira de depois ou no doce em que a Mel está não faz nada. No computador, o mouse basta; o doce sob o ponteiro cresce um pouco, parado.

## 5. A tela (1280 × 720)

```
┌───────────────────────────────────────────────────────────────────────┐
│ [Nível 1] ●○○ │   Aguenta o doce que  [NÃO] [🩷 é ROSA]   │     (?)  │  faixa 96
├──────────┬────────────────────────────────────────────────┬───────────┤
│ margem   │   (◯)        ◯           ◯           ◯        │  margem   │
│ de       │                                                │  da festa │
│ partida  │   (◯)        ◯           ◯           ◯        │  🎂 🎈    │
│   🧒     │  ↑ da vez   esmaecidas →                       │           │
│          │   (◯)        ◯           ◯           ◯        │           │
└──────────┴────────────────────────────────────────────────┴───────────┘
              rio de chocolate (corre de cima para baixo)
```

- **Cabeçalho em faixas**, de ponta a ponta: o nível e 3 bolinhas (uma por travessia) à esquerda, **a placa** no meio exato (x 640) e o `?` à direita.
- **A placa** é uma frase com peças: *"Aguenta o doce que"* em letra pequena, a pílula **NÃO** (violeta, nunca rosa: rosa é cor de doce) e a peça do termo com ícone e palavra (*é ROSA*, *tem GRANULADO*, *é GRANDE*). As marcas ✓ (verde) e ✗ (laranja) aparecem no canto da peça.
- **O rio** ocupa o meio e corre devagar para baixo. A Mel descansa sempre em x 260; a fileira da vez fica em x 520 e as de depois em 780 e 1040. A cada pulo certo, o mundo anda 260 px para a esquerda.
- **As 3 raias** (y 285, 450, 615). Doce grande com 170 px de largura e pequeno com 64 % disso, cada um com um anel de espuma creme em volta (para o doce caramelo não sumir no chocolate).
- **Teto de alvos:** 3 tocáveis por vez, numa coluna limpa. As regiões tocáveis da tela são 2: a fileira da vez e o `?`.

## 6. Os doces

| Atributo | Valores | Como se vê |
|---|---|---|
| cor | rosa · verde · marrom | rosa-chiclete, verde-pistache e **caramelo** (bem mais claro que o rio) |
| forma | redondo · quadrado | a face de cima é um círculo ou um quadrado |
| cobertura | granulado · listrado · liso | confeitinhos brancos, amarelos e azuis (nunca rosa, verde ou marrom) · três fios de calda creme · lisinho com brilho |
| tamanho | grande · pequeno | 170 px · 109 px de largura |

Os doces ficam em duas folhas, redondos e quadrados (3 cores × 3 coberturas cada). O tamanho é escala do código.

## 7. O N1 — O NÃO TROCA A RESPOSTA

Assunto único: **o valor de uma frase simples e o NÃO que o troca.** A fase 1 não tem NÃO, para a criança aprender o rio com a frase mais simples; o NÃO estreia na fase 2 com demonstração. Em cada fase, só **2 atributos** mudam de doce para doce (a ficha pede "6 doces de 2 atributos"); os outros ficam iguais.

| Fase | Placa | Mudam | Iguais |
|---|---|---|---|
| 1 | Aguenta o doce que **tem GRANULADO** | cobertura, cor | redondo, grande |
| 2 | Aguenta o doce que **NÃO é ROSA** | cor, forma | liso, grande |
| 3 | Aguenta o doce que **NÃO é GRANDE** | tamanho, cor | redondo, granulado |

As fileiras (de cima para baixo; ✔ = aguenta):

| Fase | 1ª fileira | 2ª fileira | 3ª fileira |
|---|---|---|---|
| 1 | rosa liso · **verde granulado ✔** · marrom listrado | **marrom granulado ✔** · verde listrado · **rosa granulado ✔** | rosa listrado · marrom liso · **verde granulado ✔** |
| 2 | rosa redondo · **verde quadrado ✔** · rosa quadrado | **marrom quadrado ✔** · rosa redondo · **verde redondo ✔** | **marrom redondo ✔** · rosa quadrado · rosa redondo |
| 3 | verde grande · **rosa pequeno ✔** · marrom grande | **marrom pequeno ✔** · rosa grande · **verde pequeno ✔** | **verde pequeno ✔** · marrom grande · rosa grande |

**Validação** (`validateLevels`, só em DEV):
- toda fileira tem 3 doces diferentes, pelo menos 1 que aguenta e 1 que afunda;
- toda fase tem uma fileira com **1** certo e outra com **2**;
- a raia dos certos muda de uma fileira para a seguinte;
- em cada fase mudam exatamente 2 atributos, e um deles é o da placa;
- o outro atributo que muda varia entre os certos (o certo nunca é "sempre o verde");
- N1: frase de um termo só; a fase 1 sem NÃO e as outras com NÃO;
- nas fases que ensinam, a 1ª fileira tem exatamente 1 certo.

Com NÃO, todo doce que afunda é uma armadilha: ele tem o atributo escrito na placa. Quem lê só *"ROSA"* pula no rosa.

## 8. Erro (a cena antes do `lose()`)

A Mel pousa, o letreiro confere e termina em ✗. O doce treme, afunda devagar com bolhas e leva a Mel junto (*plof*, respingos). Ela reaparece no chocolate até a cintura, lambuzada. A peça culpada treme no letreiro (a pílula NÃO também, se ela foi ignorada), e a faixa grande diz o motivo:

- *"Esse doce não tem granulado!"* (fase sem NÃO);
- *"Esse doce é rosa!"*, *"Esse doce é grande!"* (fases com NÃO).

Depois de ~2,3 s vêm `WRONG_ANSWER` e `lose()`, uma vez. Não existe outro erro: tocar fora dos doces da vez não faz nada.

## 9. Abertura e tutorial do N1 (uma vez)

1. **A cena começa na festa** (margem da direita, bolo e bandeirinhas) e a câmera corre sobre o rio até a Mel, na margem da esquerda. Close nela. **Mel:** *"A festa é do outro lado!"* [Próximo] → *"Vou pular de doce em doce!"* [Próximo].
2. A câmera abre, o cabeçalho volta, e a **placa** entra grande. **Guia** (recorte na placa): *"A placa diz qual aguenta."* [Ver]. A placa sobe para o alto.
3. **Demonstração, sem balão:** a Mel vai pela margem até a raia do doce **liso** e testa com a ponta do pé. O letreiro confere (✗), o doce afunda e ela pula para trás. Depois ela pula no doce **com granulado**: ✓, o doce aguenta. A tela anda.
4. **Guia** (recorte na fileira da vez, os 3 doces por igual): *"Sua vez!"* [Vamos!].
5. **Fase 2, estreia do NÃO:** a placa entra grande. **Guia** (recorte na placa): *"O NÃO troca a resposta."* [Ver]. Demonstração: o pé no doce **rosa** (*é ROSA* ✓, o NÃO vira para ✗, afunda), depois o pulo no **verde** (*é ROSA* ✗, o NÃO vira para ✓, aguenta). *"Sua vez!"*.

O que a demonstração fez conta: a criança continua da 2ª fileira. Numa partida repetida, a abertura e as demonstrações não aparecem, e a 1ª fileira é jogada.

O `?` (em jogo) tem um balão sobre a placa, *"A placa diz qual aguenta."*, e um segundo, *"O NÃO troca a resposta."*, quando a placa tem NÃO.

## 10. Fim de travessia e de nível

A Mel chega à margem da festa: o mundo anda até a festa aparecer inteira, ela comemora, faíscas sobre o bolo, a bolinha da fase acende (`CORRECT_ANSWER`, 10 pontos por travessia). A tela escurece e abre na próxima travessia, com a Mel de volta à margem de partida.

Na 3ª travessia: confete, `GAME_COMPLETED` e `showLevelComplete` com JOGAR DE NOVO (só existe o N1). Sem quadro de resumo.

## 11. N2 e N3 (só planejados; entram quando o usuário pedir)

- **N2 — E e OU.** Placas da ficha: *"é ROSA **E** é REDONDO"*, *"é LISTRADO **OU** é PEQUENO"*, *"é QUADRADO **E** NÃO é MARROM"*. O letreiro ganha duas peças de termo e a pílula do operador (E azul, OU âmbar). Ao pousar, cada termo recebe a sua marca e o operador junta as duas numa marca final. Armadilhas obrigatórias na validação: no **E**, toda fileira tem um doce com só uma das duas coisas; no **OU**, nenhum doce tem as duas e há um com só uma (quem acha que OU é E fica sem saída). Três atributos mudam por fase.
- **N3 — frases compostas.** *"NÃO é VERDE **E** tem GRANULADO"*, *"é GRANDE **OU** NÃO é LISO"*, com 4 fileiras por travessia. O pedido-espelho da ficha fica de fora: ele é o Portões Lógicos.

## 12. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| vitrine giratória; tocar no doce quando ele passa | rio com fileiras paradas; tocar no doce faz a Mel pular nele | o usuário pediu gameplay divertido; sem tempo nem mira |
| turno de 6 clientes | 3 travessias de 3 fileiras | uma placa por travessia |
| 6–8 doces por rodada | 3 tocáveis por vez (9 por travessia) | teto de 4 alvos no celular |
| TRAVA com cadeado, +5, os válidos brilham depois de 2 travas | o doce afunda com a Mel: `WRONG_ANSWER` + `lose()` | errou, perdeu; brilho entregaria a resposta |
| painel de conferência termo a termo | o letreiro do alto confere ao pousar, e o NÃO vira a marca | é a parte da ficha que mostra a lógica |
| pinça, caixinha com laço, 4 clientes | a Mel e a festa do outro lado | a ficção do rio |
| pedidos do N1 na ordem NÃO é rosa · tem granulado · NÃO é grande | tem granulado · NÃO é rosa · NÃO é grande | o rio se aprende sem NÃO; o NÃO estreia sozinho, com demonstração |
| pedido-espelho no N3 | fora | é o Portões Lógicos (078) |
| bandeja do turno, taxa por operador, estrelas | festa na margem, confete, `showLevelComplete` | sem quadro de resumo |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | abertura em close, demonstração e `?` | fluxo da plataforma |
| marrom | caramelo, com espuma creme em volta | marrom-chocolate sumiria no rio |
| NÃO/E/OU "em cores de destaque" | NÃO violeta | rosa já é cor de doce |

## 13. Dados e arquivos

```
index.ts  types.ts
data/   files.ts layout.ts theme.ts timing.ts logic.ts levels.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts art.ts audio.ts view.ts world.ts
        sweets.ts mel.ts header.ts sign.ts guide.ts bubble.ts banner.ts
```

A resposta certa não fica nos dados: `holds(rule, sweet)` em `data/logic.ts` decide no instante do pouso, e o letreiro anima a mesma conta.

**Arte:** o N1 roda inteiro com a **arte de reserva** em Graphics, assada nas mesmas folhas, grades e ordem de células do TEXTURAS (`scenes/fallback.ts`). Um PNG com o mesmo nome em `src/assets/games/EF05CO03/rio-de-chocolate/` substitui a reserva sem mudar código. **O rio é sempre do código** (pedido do usuário): não há `rio.png`, e o `IMAGES` de `data/files.ts` não o carrega.

## 14. Dúvidas

1. ~~Linha de arte.~~ **Resolvida:** doodle de lápis de cor, com `references/39-doodle-lapis-de-cor.webp` anexada em toda geração (TEXTURAS, topo).
2. **"NÃO é GRANDE" (fase 3, da ficha):** aqui o doce pequeno aguenta e o grande afunda, o contrário do que a física sugere. Isso obriga a ler a placa, mas pode confundir. Se confundir, a troca é *"NÃO é REDONDO"*.
3. **A Mel testa com o pé só na demonstração.** A criança não pode testar antes de pular; se ela estranhar, a demonstração pode usar outra coisa para mostrar o doce afundando.

## Histórico

- 15/10/2026: plano e N1 em Graphics. Id 124 no catálogo (order 332), `NEXT_FREE_ID` = 125; o 123 foi para o Pit Stop da Chuva (EF05CO04), cadastrado por outra sessão no mesmo minuto. Servidor `jogos-dev-rio` (porta 5283).
- Jogado no navegador: a abertura (a festa, a câmera correndo até a Mel, o close e as duas falas), a placa grande, as duas demonstrações (granulado e NÃO), um pulo certo, o erro (o doce afunda, a Mel cai, a faixa *"Esse doce não tem granulado!"*, `lose()`), o `?` com os dois balões e o nível inteiro até "Nível 1 completo!" (30 pontos).
- Ajustes depois de ver: a Mel passou de 150 para 170 px; as fileiras de depois ficaram escurecidas por tinta (com transparência, o chocolate aparecia através delas); as raias desceram para y 285/450/615, porque o chapéu encostava no cabeçalho; o ícone de *é GRANDE* mostra um doce grande e um pequeno.
- Mesmo dia, pedido do usuário: o rio fica só em Graphics (saiu o `rio.png`), e os prompts foram refeitos na linha **doodle de lápis de cor** (referência `39`). A arte de reserva em código não mudou.
