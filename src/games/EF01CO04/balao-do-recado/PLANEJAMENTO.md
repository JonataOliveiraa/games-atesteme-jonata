# Balão do Recado — planejamento

Jogo **094** (ou o `NEXT_FREE_ID` na hora do registro; o 093 é da Decolagem) ·
EF01CO04 · 1º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF01CO04.md`
(a mesma que foi colada no chat em 29/09/2026, sem revisão).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos: `EF01CO01/garra-dos-grupos` e
`EF01CO03/decolagem-passo-a-passo`.
A ficha é a fonte. Só muda o que o padrão obriga (§3). O que é proposta minha
está marcado e vai para as *Dúvidas*.

**Escopo:** só o **N1**, como na Garra, na Subida e na Decolagem. O N2 e o N3 da
ficha estão no §12. **O erro aqui é diferente dos três anteriores**, porque errar
o anel é erro de mira, não de resposta. Isso é a *Dúvida 1*, e o N1 sem nenhuma
decisão é a *Dúvida 2*.

---

## DECISÕES DO USUÁRIO (29/09/2026) — vencem o texto abaixo

1. **Só o N1**, mas **com uma escolha no fim de cada trecho** (o usuário não
   quis um N1 que só avalia o voo).
2. **O balão leva o recado só como DESENHO** (o bilhete com o desenho, sem forma).
   A tela de "troca de forma" (§8, passos 6–8) **sai**: a escolha é que troca a forma.
3. **Na janela, a situação de quem recebe decide a forma** (pista do conteúdo,
   nunca de cor; mesma arte e mesma moldura nas 2 opções):
   - **colega** na janela ao lado, **perto**, em casa → **voz**;
   - **vizinha que saiu**: janela fechada, **caixa de correio** na porta → **carta** (guarda o recado: o "armazenada");
   - **vovó** numa casinha **longe, no morro**; o balão para na beira → **telinha**.
   Aparecem **2 formas grandes** (a certa + 1 errada, lado sorteado) e a criança toca uma.
4. **Forma certa:** o recado vira aquela forma, chega a quem recebe, a pessoa fica feliz, e o bilhete vai para o **mural** com o carimbo da forma (§8, passos 1–5 e o fim do nível continuam).
5. **Forma errada = erro de decisão:** o **estrago acontece** (ex.: a voz não chega na vovó longe, "hã?") e **a partida acaba**: `WRONG_ANSWER` + `hud.lives.loseAll()`, igual à Garra/Subida.
6. **Erro de MIRA (anel) = trava da ficha, sem punição** (§7 como está: sopro, pontilhado, tenta de novo, sem `WRONG_ANSWER`, sem vida).
7. Um recado por nível (*'A festa é sábado!'*, troca no JOGAR DE NOVO) e o par colega/voz, vizinha/carta, vovó/telinha: **aprovados**.
8. **Estilo: chibi de figurinha (`references/19-chibi-figurinhas.jpg`)**, como o TEXTURAS já está.
9. Id: `NEXT_FREE_ID` = **094** (o 093 é a Decolagem, do Jogos A).

## N1 — a escolha na janela (proposta do Ferro, aguarda aprovação)

No fim de cada trecho, a janela de quem recebe entra e o balão para. Aparecem
**2 cartões grandes** com a mesma moldura, cada um com uma forma (voz, carta ou
telinha) e **o mesmo desenho do recado dentro**. O lado é sorteado. A criança
toca um cartão, a forma voa até quem recebe e **acontece**.

A pista é **a situação desenhada na janela**, nunca a cor do cartão. Cada
trecho oferece a forma certa e **uma** errada, e a errada falha **na frente da
criança**, pelo motivo que está desenhado.

| Trecho | Quem recebe e a situação (o que se vê) | Certa | Errada oferecida | Estrago (o que acontece) | Por que é óbvio aos 6 anos |
|---|---|---|---|---|---|
| 1 | **colega** na janela **ao lado**, pertinho do balão, com **os dois braços ocupados** segurando uma caixa grande de lápis | **voz**: o balão de fala abre ao lado da orelha dele, que sorri de olhos fechados, ainda segurando a caixa | **telinha** | o tablet chega, o colega não tem mão livre, e o tablet **escorrega e cai de cara no canteiro, "plof"**. Ele olha para baixo, sem graça (`friend-fail-drop`) | ele estava **pertinho**: era só **falar**. E com as mãos ocupadas não dá para segurar a telinha |
| 2 | **vizinha que saiu**: janela do sobrado **fechada**, cortina fechada, ninguém. Na porta, uma **caixa de correio** | **carta**: o envelope entra na caixa de correio. A vizinha volta, abre a caixa e lê feliz (`neighbor-back`) | **voz** | o balão de fala chega na **janela vazia**, bate no vidro, **murcha e cai no peitoril**. Ninguém ouve (`neighbor-fail-empty`) | **não tem ninguém** para ouvir. A carta **espera guardada** na caixa: é o "armazenada" |
| 3 | **vovó** na casinha **longe, lá no morro** (pequena). O balão **para na beira** e não passa | **telinha**: o tablet acende nas mãos dela, com o desenho na tela, e a vovó abre um sorrisão | **voz** | o balão de fala sai, vai **encolhendo**, perde força e **cai no meio do caminho**. A vovó põe a mão em concha na orelha, com cara de "hã?" (`grandma-fail-far`) | a voz **não chega longe**. A telinha chega em qualquer lugar |

**Por que "mãos ocupadas" no colega.** Perto, as três formas chegam: a voz, a
carta e a telinha. Sem outro detalhe, nenhuma errada falha de verdade, e a
criança seria punida por uma escolha que funcionaria. A caixa de lápis nos
braços faz a telinha (e a carta) **caírem de verdade**. Ao mesmo tempo, a voz
é a que **pede menos**: está perto, é só falar. Das duas erradas possíveis
ofereço a **telinha**, porque é a mais tentadora e porque ela vira a certa no
trecho 3. Assim a criança não aprende que "telinha é sempre certa".

**As formas nas escolhas:** a voz aparece nos 3 trechos (certa no 1, errada no
2 e no 3), a carta só no 2 e a telinha no 1 (errada) e no 3 (certa). Nenhuma
forma é sempre certa ou sempre errada, exceto a carta, que só aparece uma vez.

**O erro de decisão** (forma errada): o estrago acontece por ~1,5 s, com tremido
e o som `fail`. A pessoa fica na pose do estrago. Aí sai **`WRONG_ANSWER`**
**uma vez**, roda **`hud.lives.loseAll()`** e `mode = 'done'`, como na Garra e na Subida.
**O erro de mira** (anel) continua sendo a trava do §7, sem `WRONG_ANSWER`.

**Pontos:** +10 por anel de primeira, +5 depois de trava (§7), **+10 pela forma
certa**. `CORRECT_ANSWER` sai em cada anel e na escolha certa.

### Arte (vai no `destinos.png`, combinado com a Brasa)

A grade vira **3 × 3, célula 512**. A linha 0 é **antes**: `friend-wait` (com a
caixa de lápis nos braços), `neighbor-away` (janela fechada, caixa de correio) e
`grandma-wait` (casinha pequena no morro). A linha 1 é **feliz**: `friend-happy`
(ouvindo, ainda com a caixa), `neighbor-back` (na porta, lendo a carta) e
`grandma-happy`. A linha 2 é o **estrago**: `friend-fail-drop`,
`neighbor-fail-empty` e `grandma-fail-far`. O balão de fala caindo no meio do
caminho é código (a forma voa com `fall`), e não entra na célula.

### Tipos

```ts
type Form = 'voice' | 'letter' | 'screen'
type RecipientId = 'friend' | 'neighbor' | 'grandma'
type FailId = 'friend-fail-drop' | 'neighbor-fail-empty' | 'grandma-fail-far'

interface ChoiceDef { right: Form; wrong: Form; fail: FailId }
interface LegDef { recipient: RecipientId; rings: Ring[]; windowT: number; windowY: number; choice: ChoiceDef }
interface LevelDef { level: number; legs: LegDef[]; flight: FlightDef }
```

O `swapAt`, o `bird` e o `choice: boolean` saem do tipo (o N2/N3 os traz de
volta quando entrar). A forma do trecho é `choice.right`.

**`validateLevels`** (troca o que o §6 diz sobre isso):
- 3 trechos, com quem recebe na ordem `friend → neighbor → grandma`;
- `choice.right` é o da tabela fixa (`friend→voice`, `neighbor→letter`,
  `grandma→screen`), e as formas certas não se repetem;
- `choice.wrong !== choice.right`, e o `fail` é o estrago **daquele** quem
  recebe (o prefixo do id bate com o `recipient`);
- nenhuma forma é a certa ou a errada em **todos** os trechos em que aparece,
  com exceção de quem aparece uma vez só;
- os anéis e o voo seguem como no §6: 5 por trecho, y entre 240 e 500, ≥ 4 s
  entre eles, `reachable`, a janela em t 28–32 e a folga ≥ 90.

## FRASES, N2, N3 E HEADER (usuário, 29/09/2026, 4ª rodada) — vence o resto

*"coloque frases extra mt simples como 'Ela não tem celular!', 'Ela não pode
ouvir!' nas situações específicas, faça n2 e n3, e melhore o header colocando o
nível atual"*. Aprovado:

1. **Frases curtas** (texto do jogo, DynaPuff, 1 linha, ≤ 5 palavras), em 2 momentos:
   - **na chegada**, dica da situação (não diz a forma): *"Ela está pertinho!"*,
     *"Ela saiu de casa!"*, *"A vovó mora longe!"* (e as do N3);
   - **no erro**, por que não chegou: *"Ela não tem celular!"*, *"Ela não está em
     casa!"*, *"Ela não pode ouvir!"* etc. Cada `fail` tem a sua frase (dado).
   - O modo "telinha" passa a ser chamado de **celular** nas frases (é como a criança fala).
2. **Header:** pílula com o **nível atual** ("Nível 1", "Nível 2", "Nível 3") ao
   lado das bolinhas dos trechos. Continua sem "FASE n DE 3".
3. **N2 — assunto novo: os 3 modos na escolha.** Mesmas 3 pessoas e situações
   do N1, mas cada janela oferece **os 3 cartões** (falar, carta, celular); as 2
   formas erradas precisam falhar de verdade pela situação desenhada (se uma
   forma funcionaria na vida real, a situação ganha o detalhe que a faz falhar).
   Voo: 6 anéis e um **pássaro lento em linha reta** (encostar = trava, igual ao anel).
4. **N3 — assunto novo: situações trocadas.** As mesmas pessoas em situações
   diferentes, para a criança ler a situação e não decorar a pessoa: a **vovó
   veio visitar** e está pertinho → falar; a **colega viajou** para longe →
   celular; a **vizinha está dormindo** → carta (lê quando acordar). 3 cartões,
   7 anéis, folga menor, pássaro em zigue-zague. Nova arte das janelas do N3.
5. A validação cobra: cada nível com seu assunto; nenhuma forma sempre certa;
   frase existente para cada chegada e cada `fail`; alcance da voz coerente
   (quem é "falar" dentro do círculo, quem é "celular" fora) em todos os níveis.

## N2 e N3 — conteúdo (proposta do Ferro, 29/09/2026, aguarda aprovação)

### As 3 regras que fazem cada forma falhar de verdade

Toda forma errada falha **pela situação desenhada**. Três regras, sempre as mesmas, e
todas se veem no desenho:

- **Falar** precisa de alguém **perto** (dentro do círculo) e **acordado** ouvindo.
- **Carta** precisa de uma **caixa de correio** (fica guardada até a pessoa ler).
  Onde não há caixa de correio desenhada, o envelope cai.
- **Celular** é **chamada de vídeo**: precisa de alguém com **mão livre** que
  **atenda agora**, com o celular junto dela.

Nas frases, "telinha" vira **celular**. As frases são texto do jogo: DynaPuff, 1 linha,
≤ 5 palavras. A de chegada descreve a situação e **nunca diz a forma certa**.

### N1 — frases (situações de hoje, 2 cartões)

| Janela | Quem recebe / situação | Chegada | Certa | Errada → estrago | Frase do erro |
|---|---|---|---|---|---|
| 1 | colega **pertinho**, braços ocupados com a caixa de lápis | *"Ela está pertinho!"* | falar | celular → `friend-fail-drop` | *"As mãos estão ocupadas!"* |
| 2 | vizinha **saiu**: casa apagada, plaquinha "saiu", caixa de correio | *"Ela saiu de casa!"* | carta | falar → `neighbor-fail-empty` | *"Ela não está em casa!"* |
| 3 | vovó **longe**, casinha no morro, celular na mão | *"A vovó mora longe!"* | celular | falar → `grandma-fail-far` | *"Ela não pode ouvir!"* |

### N2 — os 3 modos na escolha (mesmas situações, 3 cartões)

| Janela | Situação (o que se vê) | Chegada | Certa | Errada 1 → estrago · frase | Errada 2 → estrago · frase |
|---|---|---|---|---|---|
| 1 | colega pertinho, **braços ocupados**; a janela da escola **não tem caixa de correio** | *"Ela está pertinho!"* | falar | celular → `friend-fail-drop` (tablet cai no canteiro) · *"As mãos estão ocupadas!"* | carta → `friend-fail-letter` (o envelope bate na janela e cai no canteiro) · *"Não tem caixa de correio!"* |
| 2 | vizinha **saiu**; caixa de correio; **o celular dela ficou em casa**, na mesinha atrás da janela (cortina aberta) | *"Ela saiu de casa!"* | carta | falar → `neighbor-fail-empty` · *"Ela não está em casa!"* | celular → `neighbor-fail-phone` (o celular dela toca sozinho na mesinha, ninguém atende) · *"O celular ficou em casa!"* |
| 3 | vovó **longe** no morro, celular na mão; a casinha **não tem caixa de correio** | *"A vovó mora longe!"* | celular | falar → `grandma-fail-far` · *"Ela não pode ouvir!"* | carta → `grandma-fail-letter` (o envelope cai no pé do morro, na grama) · *"Não tem caixa de correio!"* |

### N3 — situações trocadas (3 cartões, arte nova)

| Janela | Situação (o que se vê) | Chegada | Certa | Errada 1 → estrago · frase | Errada 2 → estrago · frase |
|---|---|---|---|---|---|
| 1 | **vovó veio visitar**: sentada num banco da praça, **pertinho** (dentro do círculo), **fazendo tricô com as duas mãos**; sem caixa de correio | *"A vovó veio visitar!"* | falar | celular → `grandma-near-fail-drop` (o celular escorrega e cai na grama, a lã embola) · *"As mãos estão ocupadas!"* | carta → `grandma-near-fail-letter` (o envelope cai no chão ao lado do banco) · *"Não tem caixa de correio!"* |
| 2 | **colega viajou**: pequena, **longe no mar**, num barquinho, com o celular na mão; sem caixa de correio | *"Ela viajou para longe!"* | celular | falar → `friend-far-fail-far` (mão em concha na orelha, "hã?") · *"Ela não pode ouvir!"* | carta → `friend-far-fail-letter` (o envelope cai no mar e boia) · *"Não tem caixa de correio!"* |
| 3 | **vizinha dormindo**: janela fechada com "zzz" saindo, cortina fechada, **o celular carregando na mesinha**; a caixa de correio na porta | *"Ela está dormindo!"* | carta | falar → `neighbor-asleep-fail-voice` (o balão de fala bate no vidro e murcha; os "zzz" continuam) · *"Ela não pode ouvir!"* | celular → `neighbor-asleep-fail-phone` (o celular toca na mesinha, ela continua dormindo) · *"Ela não atende dormindo!"* |

**Carta certa na vizinha dormindo:** a carta fica na caixa, ela acorda e lê. Na
encenação já existente, o sol vira lua e volta a sol, e ela aparece na porta lendo
(`neighbor-asleep-happy`).

**A vizinha continua sendo carta no N3.** A ficha pediu isso. O que a criança lê é
outro motivo: "dormindo" em vez de "saiu". A vovó e o colega é que trocam de forma.

**Formas por nível:** as 3 formas são a certa uma vez e a errada duas vezes, em
todos os níveis. Nenhuma forma é sempre certa.

### Arte NOVA

**`destinos-2.png`** (N2, grade 3 × 2, célula 512, mesmo enquadramento das colunas de `destinos.png`):

| Célula | id | Cena |
|---|---|---|
| 0 | `neighbor-away-phone` | igual a `neighbor-away`, mas a cortina da janela de cima **aberta**, e dentro, numa mesinha, **o celular dela** (tela apagada). Plaquinha "saiu" na porta, caixa de correio |
| 1 | `neighbor-back-phone` | igual à 0; a vizinha voltou, está na porta lendo a carta (como `neighbor-back`) |
| 2 | `neighbor-fail-phone` | igual à 0; o celular na mesinha **tocando sozinho** (tela acesa, tracinhos de vibração), ninguém em casa |
| 3 | `friend-fail-letter` | igual a `friend-wait`; um **envelope caído** no canteiro, a colega olhando para baixo, sem graça, ainda com a caixa de lápis |
| 4 | `grandma-fail-letter` | igual a `grandma-wait`; um **envelope caído** na grama no pé do morro, a vovó olhando na janela sem ver |
| 5 | `neighbor-fail-empty-phone` | igual à 0; um balãozinho de fala murcho no peitoril, ninguém (o erro "falar" do N2 com o mesmo enquadramento) |

**`destinos-3.png`** (N3, grade 4 × 3, célula 512: cada linha é uma cena e as colunas são antes / feliz / erro 1 / erro 2):

| Linha | Cena | antes | feliz | erro 1 | erro 2 |
|---|---|---|---|---|---|
| 0 | `grandma-near`: banco da praça, **grande e perto** como a janela do colega, a vovó tricotando | esperando, sorrindo para a esquerda | ouvindo, olhos em arco | `-fail-drop`: celular caído na grama, a lã embolada | `-fail-letter`: envelope no chão ao lado do banco |
| 1 | `friend-far`: mar, barquinho **pequeno e longe** (~170 px, como a casinha da vovó), a colega com o celular | esperando, celular apagado | vendo a tela, feliz | `-fail-far`: mão em concha na orelha | `-fail-letter`: envelope boiando na água |
| 2 | `neighbor-asleep`: o mesmo sobrado da vizinha; janela de cima fechada com "zzz", celular carregando na mesinha, caixa de correio | dormindo | na porta lendo a carta, sol de manhã | `-fail-voice`: balão de fala murcho no peitoril, "zzz" | `-fail-phone`: celular tocando, "zzz" |

**`extras.png`** ganha `friend-face` (a colega de perto acenando, para a videochamada do N3).
**Refazer:** nada do N1. O pássaro já existe (`pecas`, célula 9). Se a Aquarela
preferir, ele ganha uma 2ª pose (asa para baixo) para bater asas.

### Layout por cena (não por pessoa)

`WINDOW.place/targets/faces/reach/focus` passam a ser chaveados pela **cena**
(`friend-near`, `neighbor-away`, `grandma-far`, `grandma-near`, `friend-far`,
`neighbor-asleep`). O `LegDef` ganha `scene`. `validateLevels` cobra:
- o rosto de quem é "falar" fica dentro do círculo;
- os 4 cantos do `reachBox` de quem é "celular" ficam fora do círculo, em todos os níveis.

### Voo, anéis e pássaro

| | N1 | N2 | N3 |
|---|---|---|---|
| anéis | 5 (t 6 · 10,5 · 15 · 19,5 · 24) | **6** (t 5 · 9 · 13 · 17 · 21 · 25) | **7** (t 4 · 8 · 12 · 16 · 20 · 24 · 28) |
| janela | t 29 | t 29 | t 32 |
| folga | ±90 | ±90 | **±70** (abertura 241 ≥ 2 × 70 + 60) |
| pássaro | — | **1 por trecho, reto e lento**: voa para a esquerda a 60 px/s, numa altura fixa | **1 por trecho, zigue-zague**: 60 px/s, sobe e desce ±60 px com período de 2,4 s |
| cartões | 2 | 3 | 3 |

A subida é 200 e a descida 110 em todos os níveis. Com anéis a cada 4 s,
`reachable` permite até (4 − 1) × 110 × 0,6 = **198 px** entre anéis seguidos;
as alturas ficam bem abaixo disso.

**O pássaro** (`BirdDef { t, y, amp, period }`): `t` é o instante em que ele
cruza o x do balão, sempre **entre dois anéis**, pelo menos 1,5 s longe de cada
um. Encostar nele (distância < raio do pássaro + raio do balão) **trava igual a
perder o anel**: o pássaro tomba e volta, o balão retorna ao anel anterior, e
não sai `WRONG_ANSWER`. `validateLevels` cobra que ele dê para desviar: na hora
em que cruza, a trilha reta entre os dois anéis passa longe do pássaro, ou o
desvio que falta cabe em (tempo até o anel − 0,5 s) × 110 × 0,6. O zigue-zague
entra nessa conta pela faixa inteira (y ± amp).

### Tipos (para implementar depois da aprovação)

```ts
type SceneId = 'friend-near' | 'neighbor-away' | 'grandma-far' | 'grandma-near' | 'friend-far' | 'neighbor-asleep'
interface WrongDef { form: Form; fail: FailId }
interface ChoiceDef { right: Form; wrongs: WrongDef[] }
interface BirdDef { t: number; y: number; amp: number; period: number }
interface LegDef { recipient: RecipientId; scene: SceneId; rings: Ring[]; windowT: number; windowY: number; choice: ChoiceDef; bird: BirdDef | null }
```

As frases ficam em `data/captions.ts`: `ARRIVAL_CAPTION: Record<SceneId, string>` e
`FAIL_CAPTION: Record<FailId, string>`. `validateLevels` cobra que cada chegada e
cada `fail` tenha sua frase, com no máximo 5 palavras. Cobra também 2 cartões no N1
e 3 no N2 e no N3.

## DICA: ALCANCE DA VOZ (usuário, 29/09/2026, 3ª rodada de teste)

*"não está claro quando usar celular ou quando falar, além disso, o ícone de
falar tá meio feio e não remete a falar. deveria [ter] indicadores pra dizer qual
usar, como dica"*. Aprovado:

1. **Alcance da voz na tela:** na chegada, antes dos cartões, ondas de som saem
   do menino no balão e param num **círculo** (o alcance da voz), que fica
   visível durante a escolha. A **colega fica DENTRO** do círculo (dá para
   falar) e a **vovó fica FORA** (precisa da telinha). Sem ✔ nem cor marcando o
   certo: a criança compara onde a pessoa está com o círculo. O layout garante
   isso (colega perto do balão, vovó longe), e a posição entra na validação.
2. **Vizinha que saiu:** a casa fica apagada, com uma **plaquinha de "saiu"**
   pendurada na porta (arte, sem texto: bonequinho andando para fora / pegadas),
   e a caixa de correio à vista. Mesmo dentro do alcance, não tem ninguém para ouvir.
3. **Ícone de FALAR refeito:** **carinha chibi de perfil falando**, boca aberta
   com 3 arquinhos de som, e um **balão de fala pequeno** com o miolo vazio para
   o desenho do recado. A versão com "ondinhas de wi-fi" (14:24) foi reprovada: ela
   parece sinal de celular. O carimbo da voz no mural usa a mesma carinha.

## A COMUNICAÇÃO ACONTECENDO (usuário, 29/09/2026, 2ª rodada de teste)

*"falta mais clareza no que está acontecendo quando o balão chega no objetivo. A
proposta é comunicação em diferentes modos"*. Aprovado:

1. **Cada modo encenado** na entrega certa (sem texto):
   - **Voz:** o menino se debruça na cesta e fala (mãos em concha na boca); ondas
     de som `)))` levam o desenho até a orelha da colega.
   - **Carta:** o envelope cai na caixa de correio e a bandeirinha sobe; um sol
     vira lua e volta a sol (o tempo passa); a vizinha chega, abre a caixa e lê.
   - **Telinha:** o menino segura um tablet no balão; um sinal em arco atravessa
     até o morro; o tablet da vovó mostra o rosto do menino e o dele mostra o da
     vovó (videochamada).
2. **Pensamento que prova a chegada** (regra visual única, acerto E estrago):
   comunicou → quem recebe ganha um **balão de pensamento com o MESMO desenho**
   do bilhete; não comunicou → o pensamento mostra só **`?`**.
3. **Ícone da voz refeito** (`pecas` célula 1): balão de fala limpo com 3
   ondinhas de som; sem nota musical e sem adesivo de boca.
4. **Carimbos do mural refeitos:** ícones simples e grossos (boca falando,
   envelope, tablet), legíveis pequenos, em vez da forma em miniatura.
5. Nomes nos cartões, comparação extra no mural e mudança de textos: **não pedidos**.

## OBJETIVO CLARO (usuário, 29/09/2026, depois de jogar)

*"o jogo está meio confuso em relação ao objetivo ... quando o balão chega no final"*.
Na chegada, os 2 cartões apareciam no meio da tela, longe de quem recebe, sem
nada dizendo que a tarefa é **escolher como o recado chega a essa pessoa**. Correção
(só apresentação; a mecânica e a validação não mudam):

1. **Abertura mostrando o destino** (aprovada): no início de cada trecho a
   câmera sai do balão com o recado, corre até quem recebe (esperando, com um
   balãozinho `?`), volta, e um pontilhado liga o balão a essa pessoa. Sem texto.
2. **Chegada = a pessoa em foco:** o balão para, a câmera dá zoom em quem recebe
   por ~1,2 s mostrando a **situação** (mãos ocupadas / casa vazia com caixa de
   correio / casinha longe no morro), e volta.
3. **O bilhete vira as 2 opções:** o bilhete solta da cesta e **se divide** nos 2
   cartões (o mesmo desenho dentro de cada forma), que ficam **entre o balão e a
   pessoa**, com um pontilhado de cada cartão até ela: "como faço chegar?".
4. **Guia na 1ª escolha** (chave no registry): véu escuro acendendo só a pessoa
   e os 2 cartões; o dedo passeia pelos DOIS (nunca aponta o certo) e espera o toque.
5. O `?` durante a escolha repete o passo 2 e o 4.

## 1. O jogo em uma frase

Um balão de ar quente atravessa o céu do bairro com um **recado** pendurado na
cesta. **Segurar** acende o queimador e o balão sobe. **Soltar** apaga o
queimador e o balão desce devagar. A criança passa por **5 anéis** e, no fim do
trecho, entrega o recado na janela de quem o espera. O recado vai para o
**mural de entregas**. No trecho seguinte, o **mesmo recado** viaja de outro
jeito: primeiro **voz**, depois **carta**, depois **telinha**.

Há um gesto só: segurar e soltar em qualquer lugar da tela. Não tem mira, não tem arrasto
e não tem botão de subir.

## 2. A habilidade e os irmãos

> **(EF01CO04)** Reconhecer o que é a informação, que ela pode ser armazenada,
> transmitida como mensagem por diversos meios e descrita em várias linguagens.

| O que a BNCC pede | Onde acontece |
|---|---|
| **transmitida como mensagem** | o recado sai de um lugar e chega em outro, carregado pelo balão |
| **por diversos meios** | cada trecho usa um meio: balão de fala, envelope e tablet |
| **descrita em várias linguagens** | o mesmo desenho (e a mesma frase) aparece dentro de cada forma; na troca, as duas formas ficam lado a lado com `=` no meio |
| **armazenada** | cada entrega vira um bilhete pregado no mural, com o carimbo da forma; no fim, os 3 bilhetes estão lá |

**O teste da bolinha:** se o recado de cada trecho fosse um desenho diferente, a
troca de forma viraria só enfeite. Por isso **o conteúdo é o mesmo nos 3 trechos
do nível**, e a validação cobra isso (§6).

**Irmãos com a mesma habilidade:**
- *Correio Multimídia* (R1, 004): a criança escolhe entre áudio, texto e desenho.
- *Passe da Mensagem* (R2, 049): a criança toca no colega para passar a bola.
  A ideia do mesmo desenho numa casca nova já aparece nele.
- Aqui a mecânica central é **voar**, que nenhum dos dois tem. A casca que troca
  é a própria habilidade e fica igual ao Passe de propósito.

## 3. O que mudou da ficha, e por quê

| Ficha | Aqui | Motivo |
|---|---|---|
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | não tem título; o exemplo virou o guia visual (§9); o resultado é o `showLevelComplete` | PADRAO-R3 §2 |
| layout responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 §1 |
| `?` abre um painel ilustrado | `?` pausa e repete o guia visual | PADRAO-R3 |
| errar o anel: TRAVA com cadeado, o vento devolve, pontilhado por 2 s, destrava com +5 | **mantido como na ficha**, e **sem `WRONG_ANSWER`** (§7) | errar a mira nunca conta como resposta errada. Na Garra, na Subida e na Decolagem o erro era de decisão (*Dúvida 1*) |
| 3 níveis | só o **N1** (`LEVELS.length === 1`); N2 e N3 no §12 | decisão do usuário nos pilotos |
| balão-comparação 'a MESMA mensagem, de outro jeito!' | as duas formas lado a lado com `=`, e o letreiro **MESMA MENSAGEM!** | 1º ano: no máximo 4 palavras por vez |
| balão-síntese 'a mensagem viajou por VOZ, PAPEL e TELA!' | o mural com os 3 carimbos e o letreiro **VOZ, PAPEL E TELA!** | idem |
| síntese fixa 'O QUE a mensagem diz não muda — muda o JEITO de viajar.' | vai para a mensagem do `showLevelComplete` | é longa demais para ficar na cena |
| no topo, o recado da vez e o ícone da forma | mantido, e ganha o **retrato de quem recebe** na ponta direita | "para quem" sem ler (proposta) |
| balão com cesta e recado em 3 formas (sprite) | o balão é um sprite só; o recado pendurado é **outra peça**, trocada pelo código | 1 folha de balão em vez de 3 |
| "o anel acende" | o mesmo PNG, clareado e com brilho | um estado a menos na folha |
| sons | sintetizados em WebAudio | PADRAO-R3 |
| telemetria: anéis de primeira, travas por trecho, escolha destinatário–forma | `CORRECT_ANSWER` por anel e `CHECKPOINT` por entrega. As travas contam só para as estrelas | a bridge não tem esses campos |
| pontos +10 / +5 | contados, nunca escritos | PADRAO-R3 |

**Como li a ficha:**
- *"Sessão = 3 trechos (3 formas)"*: o N1 tem **3 fases**, um trecho por fase,
  na ordem **voz → carta → telinha** (regra 4).
- *"N1: forma única (voz) no primeiro trecho"*: no N1 **a forma não muda dentro
  do trecho**. Ela muda **entre** os trechos. A troca no meio do voo é o N2.
- *"o mesmo recado muda de forma"* × *"mural mostrando os 3 recados"*: no nível,
  é **um recado só**, entregue 3 vezes. O mural mostra **3 bilhetes com o mesmo
  desenho e 3 carimbos diferentes**. Os outros 2 recados entram no **JOGAR DE
  NOVO** (*Dúvida 3*).
- *"destinatários (3)"*: um por trecho, já casado com as duplas do N3 para o N1
  não ensinar o contrário do que o N3 vai cobrar: **voz → colega** (perto),
  **carta → vizinha** (lê amanhã), **telinha → vovó** (longe) (*Dúvida 4*).
- *"o vento devolve ao anel anterior"*: o balão volta para **logo depois do anel
  anterior**, na altura dele. No 1º anel, volta para o começo do trecho.

## 4. O laço

```
trecho começa · balão parado à esquerda · recado pendurado na forma da vez
        │ segurar = sobe (queimador aceso) · soltar = desce devagar
        ▼
   o céu rola da direita para a esquerda · um anel chega
        │
   ┌────┴─────────────────────────┐
 passou por dentro            passou por fora
 anel acende, sopro, rastro   TRAVA: tudo para · cadeado balança na cesta ·
 colorido (+10, ou +5 se      nuvem sopra o balão de volta para depois do anel
 estava travado)              anterior · pontilhado do caminho acende 2 s ·
 CORRECT_ANSWER               o voo recomeça com o cadeado na cesta
        │                     (2ª trava no mesmo anel: o anel pisca e o céu
        │                      rola 40% mais devagar até ele)
        ▼                              │
   ainda tem anel? ◄───────────────────┘
        │ não
   a janela de quem recebe entra pela direita · o balão plana até ela sozinho
   · o recado sai da cesta e chega na forma da vez · a pessoa reage
        ▼
   o mural desce · o bilhete voa para ele · o carimbo da forma bate (tum)
        ▼
   é o último trecho? ── não ──► TROCA: a forma velha e a nova, lado a lado,
        │                        mesmo desenho dentro · "=" · MESMA MENSAGEM!
        │ sim                    · o recado pendurado vira a forma nova · ▶
        ▼
   mural com os 3 bilhetes · VOZ, PAPEL E TELA! · confete · showLevelComplete
```

## 5. A tela (1280 × 720)

As chaves ficam no `data/layout.ts`, que é da Brasa. Estes números são o contrato.
O fundo é um **panorama que rola** (o céu e o bairro juntos), então **nada fixo
é pintado nele**. O cartão do recado é UI em código.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 3 bolinhas dos trechos em (120, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas, sem texto de fase |
| cartão do recado | centro (640, 60), 600 × 88 | ícone da forma (x 385, 64 px) · desenho do recado (x 455, 64 px) · frase (x 500–810, DynaPuff 30) · pontinhos · retrato de quem recebe (x 890, círculo de 64 px, recortado da célula dele) |
| faixa de voo | y 140–545 | o balão nunca sai daqui: o teto é y 140 e o piso é y 545 |
| balão | x fixo em 330; ~150 × 190 (escala ~0,38) | o ponto que passa pelo anel é o centro do conjunto (bola + cesta) |
| recado pendurado | preso na lateral **esquerda** da cesta por uma cordinha (código) | ~72 px; fica fora da conta do anel |
| anéis | abertura de 240 px no N1; o anel desenhado tem ~130 × 300; centros entre y 240 e 500 | a metade esquerda fica atrás do balão, a direita na frente (§6) |
| telhados | y ≥ 560 no panorama | o piso do voo fica acima deles; o balão encosta e para, sem bater |
| janela de quem recebe | entra pela direita no fim do trecho, com a janela em y ≈ 330 e o prédio até o pé da tela | é o fim do trecho |
| mural | desce do alto até o centro (640, 390), 900 × 540 | 3 bilhetes em x 400 / 640 / 880 |
| letreiro | (640, 250) | **MESMA MENSAGEM!** e **VOZ, PAPEL E TELA!** (código, DynaPuff) |
| ▶ | (1180, 640), 110 × 110 | depois da troca de forma |

**Densidade.** Durante o voo há **uma região tocável**, a tela inteira (segurar),
mais o `?`. Nas pausas, só o ▶. É o menor número possível.

**Teclado:** `Espaço` ou `↑` segurado sobe; `H` repete o guia, como o `?`.
O toque que começa em cima do `?` não acende o queimador.

## 6. Trechos, anéis e voo (`data/levels.ts`)

### O voo

| Parâmetro | N1 | Por quê |
|---|---|---|
| rolagem | 150 px/s | trecho de 30 s = 4 500 px |
| subida (segurando) | até 200 px/s, aceleração de 600 px/s² | responde na hora, sem tranco |
| descida (solto) | até 110 px/s, aceleração de 300 px/s² | desce "suavemente" (ficha): dá tempo de corrigir |
| folga do anel | o centro do balão a ±90 px do centro do anel | "anéis largos" |
| vento | nenhum no N1 | "vento estável" |

### O trecho (N1)

| t (s) | 0 | 6 | 10,5 | 15 | 19,5 | 24 | 29 |
|---|---|---|---|---|---|---|---|
| o quê | começa (y 360) | anel 1 | anel 2 | anel 3 | anel 4 | anel 5 | janela |

As alturas dos anéis variam por trecho: **trecho 1** quase reto (a criança só
aprende a pairar), **trecho 2** sobe e desce em onda larga, **trecho 3** tem um
anel alto e um baixo seguidos.

### Os 3 trechos do N1

| Fase | Forma | Quem recebe | Onde |
|---|---|---|---|
| 1 | **voz** (balão de fala) | colega | janela da escola |
| 2 | **carta** (envelope) | vizinha | janela do sobrado |
| 3 | **telinha** (tablet) | vovó | varanda da casinha dela |

O recado é **um só no nível**. O N1 começa com *'A festa é sábado!'*. No
JOGAR DE NOVO, o recado passa para o próximo: *'Traga o lápis amarelo'* e
depois *'O treino mudou de hora'* (*Dúvida 3*).

```ts
type Form = 'voice' | 'letter' | 'screen'
type RecipientId = 'friend' | 'neighbor' | 'grandma'
type MessageId = 'party' | 'pencil' | 'practice'

interface Message { id: MessageId; text: string; icon: number }
interface Ring { t: number; y: number }
interface LegDef { form: Form; recipient: RecipientId; rings: Ring[]; windowT: number; windowY: number; swapAt: number | null }
interface FlightDef { scroll: number; lift: number; sink: number; liftAccel: number; sinkAccel: number; slack: number }
interface LevelDef { level: number; legs: LegDef[]; flight: FlightDef; bird: BirdDef | null; choice: boolean }

passes(ring, balloonY, slack) => Math.abs(balloonY - ring.y) <= slack
rewindTo(leg, ringIndex) => ringIndex === 0 ? { t: 0, y: 360 } : { t: rings[ringIndex - 1].t + 1, y: rings[ringIndex - 1].y }
reachable(a, b, flight) => Math.abs(b.y - a.y) <= (b.t - a.t - 1) * Math.min(flight.lift, flight.sink) * 0.6
```

O anel é **um PNG só**. O código desenha duas cópias cortadas ao meio: a metade
esquerda fica atrás do balão e a direita na frente. Assim o balão passa **por
dentro** do anel.

**`validateLevels(LEVELS)` no import** (`console.error` em dev):
- `legs.length === 3` (≤ 5) e as formas são `voice → letter → screen`, sem repetir;
- N1: 5 anéis por trecho, `swapAt === null`, `bird === null`, `choice === false`;
- o par forma → quem recebe é o da tabela do N3 (`voice→friend`, `letter→neighbor`,
  `screen→grandma`) em **todos** os níveis;
- anéis entre y 240 e 500, com pelo menos 4 s entre um e outro, e a janela
  pelo menos 4 s depois do último;
- `reachable` entre o começo e o 1º anel e entre cada par seguido;
- a janela está em t 28–32 (os "30 s de voo");
- a folga do N1 é ≥ 90 e a abertura desenhada é ≥ 2 × folga + 60.

## 7. O erro: trava, sem `WRONG_ANSWER` (proposta, *Dúvida 1*)

No N1 **não existe pergunta**. O único jeito de errar é passar por fora do anel,
e isso é erro de mira: a criança de 6 anos ainda está aprendendo a dosar o
segurar. Pela regra que você deu na Ache o Suspeito (*"errar o alvo nunca é
resposta errada"*), aqui vale a trava da ficha, sem punição:

1. **Tudo para.** O balão fica parado no ar, e um **cadeado** aparece pendurado
   na cesta, balançando.
2. Uma **nuvem de bochechas cheias** entra pela direita e **sopra**. O céu rola
   para trás e o balão volta para logo depois do anel anterior, na altura dele
   (`rewindTo`).
3. Um **pontilhado** acende por 2 s, do balão até o meio do anel perdido,
   mostrando o caminho.
4. O voo recomeça. O cadeado continua na cesta. Passou pelo anel: o cadeado
   **abre e cai**, e o anel vale +5.
5. **2ª trava no mesmo anel:** o anel pisca, e o céu rola 40% mais devagar até
   ele. É o "a opção certa pisca" do catálogo.

**Não emite nada.** Não sai `WRONG_ANSWER`, não cai vida e o trecho não
recomeça. Sem vermelho, sem queda, sem som áspero ("sem queda, sem susto").

**Não é erro:** encostar no teto ou no piso (o balão para ali); segurar ou soltar
durante a entrega, a troca ou o mural (é ignorado); o `?`.

**Pontos e estrelas:** +10 no anel de primeira e +5 depois de trava.
`CORRECT_ANSWER` sai nos dois casos. As estrelas vêm dos **anéis de primeira**
(15 no nível): 3 estrelas com ≥ 14 (90%), 2 com ≥ 11 (70%) e 1 com o nível
concluído. O valor vai no `stars` do `showLevelComplete`.

**Se a resposta da Dúvida 1 for "errou, perdeu":** no 1º anel perdido, o balão
leva o sopro, sai o `WRONG_ANSWER` e roda `hud.lives.loseAll()`, como na Garra.
Muda só o `GameScene.miss()`.

## 8. Entrega, mural e troca de forma

**Entrega** (`mode = 'deliver'`, nenhum toque vale):
1. A janela entra pela direita. O céu desacelera e o balão plana sozinho até
   ela.
2. O recado solta da cordinha e voa até a pessoa **na forma da vez**:
   - **voz:** o balão de fala abre ao lado da orelha do colega, que põe a mão em
     concha e sorri;
   - **carta:** o envelope cai nas mãos da vizinha e abre, mostrando o desenho;
   - **telinha:** o tablet acende nas mãos da vovó, com o desenho na tela.
3. A pessoa troca para a pose feliz. Toca uma fanfarra curta e cai confete
   pequeno.

**Mural** (o "armazenada"):
4. O mural desce do alto. Uma cópia do recado vira **bilhete** (desenho + frase)
   e voa para o espaço do trecho. O **carimbo** da forma bate nele com um
   `tum`: é o ícone da forma, num círculo, em tom de tinta.
5. O mural sobe e sai de cena. Nos trechos seguintes ele desce já com os
   bilhetes anteriores pregados.

**Troca de forma** (antes do trecho 2 e do 3):
6. No centro, a forma velha e a nova aparecem **lado a lado**, grandes, com **o
   mesmo desenho dentro** e um `=` entre as duas. O letreiro **MESMA MENSAGEM!**
   salta.
7. As duas se juntam no recado pendurado, que gira e vira a forma nova. O ícone
   do cartão também troca, e o retrato passa a ser de quem recebe agora.
8. O ▶ entra. Um toque nele começa o trecho.

**Fim do nível:** o mural desce com os 3 bilhetes, e os 3 carimbos pulsam um de
cada vez. O letreiro **VOZ, PAPEL E TELA!** salta, cai confete e o balão
comemora. Depois vem o `showLevelComplete`, com a síntese fixa da ficha na
mensagem.

## 9. Guia visual (1º ano, sem texto)

É o `shared/guide/createVisualGuide`: véu, dedo e espera pelo gesto real.
A chave no `registry` é `ef01co04-l1`. **O guia precisa de um gesto novo,
`{ kind: 'hold', ms }`**: o dedo desce, fica apertado com um anel crescendo em
volta da ponta, e sobe. Ele entra no shared (Brasa) e não quebra quem usa
`tap`/`drag`.

1. **Para quem vai.** O véu deixa aceso o cartão do recado e o recado pendurado.
   O desenho pulsa na cesta e no cartão, e o retrato de quem recebe pulsa em
   seguida. Legenda: **Leve o recado!**
2. **Demonstração** (`demo`, real). Um **anel de treino**, que não conta, chega
   devagar. O dedo **segura**: o queimador acende e o balão sobe. O dedo
   **solta**: o balão desce. O balão passa por dentro e o anel acende.
3. **A vez da criança** (`waitFor`). Chega outro anel de treino, com o céu a 50%.
   O dedo faz o `hold` sobre a tela e espera. O guia sai assim que a criança
   segura por 300 ms. O anel de treino acende ou passa, sem trava nenhuma.
4. O trecho 1 começa de verdade em t = 0.

O `?` pausa o voo e repete os passos 1 e 2 com o balão da cena, que depois volta
exatamente para onde estava.

**Dá para entender o objetivo sem ler?** Sim. O retrato mostra para quem é, o
dedo mostra que segurar sobe e soltar desce, e o anel que acende mostra o
caminho. A frase do recado é conteúdo, não instrução, e o desenho a carrega.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| segurar | chama do queimador acesa, o balão estica um pouco | chiado de queimador enquanto segura |
| soltar | a chama some, o balão balança de leve | o chiado corta |
| voo | nuvens e bairro rolando, o recado balança na cordinha | vento de fundo baixinho (ruído filtrado) |
| anel | o anel clareia e brilha; rastro colorido curto atrás do balão (1,2 s) | sopro + plim subindo |
| trava | cadeado balança, nuvem sopra, pontilhado aceso 2 s | "tum" macio + rajada de vento |
| destrava | o cadeado abre e cai girando | clique + plim |
| entrega | a forma chega, a pessoa fica feliz, confete pequeno | fanfarra curta |
| carimbo | o carimbo bate e o bilhete treme | `tum` de carimbo |
| troca | as formas lado a lado, `=`, MESMA MENSAGEM! | dois plins iguais |
| fim | mural completo, VOZ, PAPEL E TELA! | acorde |

## 11. Ciclo da cena (`GameScene`, que não desenha nada)

Estado único `mode`: `intro · guide · fly · stuck · deliver · mural · swap · panel · done`.
O segurar só mexe no balão em `fly` (e no `waitFor` do guia). O `update` só
anda o mundo em `fly`. `startLeg` faz `++gen`, e todo `await` é seguido de
`if (gen !== this.gen) return`.

A colisão é testada **no quadro em que o anel cruza o x do balão** (`passes`),
contra a posição daquele quadro. Nunca é decidida antes.

A bridge segue a Garra: `GAME_READY` e `CHECKPOINT` no `create`,
`CORRECT_ANSWER` por anel, `CHECKPOINT` com
`progress = round(trechosFeitos / 3 × 100)` na entrega,
`GAME_COMPLETED {stage: this.level.level, totalStages: LEVELS.length}` e o
`onCommand` de START/PAUSE/RESUME (PAUSE congela o voo e o chiado). O jogo nunca
emite `GAME_OVER` e nunca escreve `isFinalStage`.

## 12. Depois do N1 (a ficha, pronta para quando vier)

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **a mensagem troca de meio no caminho** | 6 anéis; `swapAt` no meio do trecho: o recado gira de voz para carta no ar, com MESMA MENSAGEM! pequeno, e é entregue como carta. **Pássaro** lento em linha reta: encostar nele trava igual a perder o anel |
| 3 | **o jeito certo para cada um** | 7 anéis, folga menor (±70), pássaro em zigue-zague. No fim, **2 janelas**: a vovó **longe** (casinha pequena no morro, janela alta) e o colega **ao lado** (janela baixa). Com a forma da vez, a criança voa para dentro do anel da janela certa (telinha → longe, voz → perto). **Aqui existe resposta**, e o erro vira `WRONG_ANSWER` |

**A pista que não pode entregar (N3):** os dois anéis das janelas são **o mesmo
PNG**, e nenhuma cor diz qual é o certo. O que decide é a **distância**, que se
vê no desenho: longe e pequeno, ou perto e grande. A regra entra no
`validateLevels`.

A ficha deixa uma ponta solta no N3: a dupla *"recado para amanhã → carta"* não
cabe em "vovó longe × colega ao lado". Decido isso quando o N3 entrar.

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/messages.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` (voo, anéis, trava, `passes`, `rewindTo`) | `data/layout.ts`, `data/theme.ts`, `scenes/sky.ts` (panorama), `balloon.ts` (balão, queimador, cordinha, recado, cadeado), `rings.ts` (as duas metades, brilho, pontilhado), `window.ts` (quem recebe), `mural.ts`, `swap.ts`, `card.ts` (cartão do recado), `hud.ts`, `audio.ts`, `guide.ts`, o `hold` em `shared/guide`, catálogo e `gameInstructions` |

**Textura** (prompts no [TEXTURAS.md](./TEXTURAS.md); a linha é a **chibi de
figurinha** se não vier imagem de estilo, *Dúvida 5*):

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-bairro.png` | 2560 × 720, emenda horizontal | céu e bairro (casas, árvores, escola) num panorama que rola |
| `balao.png` | 2 × 2, 512 | balão com a criança na cesta: calmo, queimando, comemorando, soprado |
| `destinos.png` | 3 × 2, 512 | colega, vizinha e vovó na janela: esperando, feliz |
| `pecas.png` | 4 × 3, 320 | anel, 3 formas, 3 desenhos de recado, cadeado, nuvem que sopra, pássaro (N2), dedo do guia, bilhete |
| `mural.png` | 960 × 600 | mural de cortiça vazio |
| `cover-balao-do-recado.png` | 1672 × 941 | capa **com o título** |

**Código:** o cartão do recado, o retrato (recorte circular da célula), a
cordinha, as metades do anel e o brilho
dele, o pontilhado, o rastro, o carimbo (círculo + ícone da forma em tom de
tinta), a frase no bilhete, o `=`, os letreiros, o confete, as bolinhas, o `?`
e o ▶.
**Antes da arte:** retângulos e círculos com o id, só para testar. Isso nunca é
a entrega.

**Registro:** id = `NEXT_FREE_ID` no commit, que avança um. O slug é
`balao-do-recado`, entra em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, ganha 3
frases em `gameInstructions.ts` e `public/og/balao-do-recado.jpg`. A categoria é
**Mundo Digital**.

## 14. Travas para quem mexer depois

- O conteúdo do recado é **um por nível**. Não ponha um desenho diferente em
  cada trecho: é isso que prova que só o jeito de viajar muda.
- A forma, o desenho do recado, o ícone do cartão, o carimbo e o bilhete saem
  **do mesmo PNG**. Nunca desenhe outra versão deles.
- O par forma → quem recebe é **fixo** em todos os níveis (§6). O N1 não pode
  ensinar "voz para a vovó longe" se o N3 cobra o contrário.
- O anel perdido **nunca** emite `WRONG_ANSWER` sem a Dúvida 1 dizer isso.
- `swapAt`, `bird` e `choice` são dados do nível, não `if` na cena.
- Se a Aquarela refizer o balão, o centro do conjunto e a posição do gancho da
  cordinha são medidos de novo (MANIFEST), e a folga do anel é conferida.

## Dúvidas para o usuário

1. **O erro:** no N1 só existe erro de mira (passar por fora do anel). Propus a
   **trava da ficha sem `WRONG_ANSWER`**: o vento devolve, o pontilhado mostra o
   caminho e ela tenta de novo. Ou prefere **errou, perdeu** no 1º anel perdido,
   como nos outros três?
2. **O N1 não tem pergunta.** A troca de forma e o mural **mostram** a
   habilidade, mas a criança só decide alguma coisa no **N3** (a forma certa
   para quem está longe ou perto). Com só o N1, o jogo não avalia nada da
   EF01CO04, só o voo. Quer (a) só o N1 mesmo, (b) N1 + N3 juntos, ou (c) outra
   ideia?
3. **Um recado por nível:** o N1 leva *'A festa é sábado!'* nos 3 trechos, e o
   JOGAR DE NOVO troca para o lápis e depois para o treino. Pode?
4. **Quem recebe:** colega (voz), vizinha (carta) e vovó (telinha), casados com
   as duplas do N3. A ficha não diz quem são os 3. Pode?
5. **Estilo:** tem imagem de estilo para este jogo? Sem ela, uso a **chibi de
   figurinha** (`19`), que é o padrão do PADRAO-R3, e o TEXTURAS já está escrito
   assim.

## Histórico

- **29/09/2026.** Primeiro planejamento, a partir da ficha original.
