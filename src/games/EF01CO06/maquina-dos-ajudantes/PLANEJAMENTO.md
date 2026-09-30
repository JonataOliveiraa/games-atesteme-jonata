# Máquina dos Ajudantes — planejamento

Jogo **096** (o `NEXT_FREE_ID` de hoje; confirmar no registro) · EF01CO06 ·
1º ano · 3ª rodada.
Documento irmão: [TEXTURAS.md](./TEXTURAS.md). Ficha: `docs/rodada-3/EF01CO06.md`,
**mudada pelo usuário em 30/09/2026** para a mecânica do **Aparelho-surpresa**
(§3), porque a ficha original repetia o *Meu Bichinho Conectado* (R2, 051).
Padrão: `docs/rodada-3/PADRAO-R3.md`. Modelos: `EF01CO04/balao-do-recado` e
`EF01CO05/pescaria-dos-codigos`.

**Três regras do usuário para este jogo:**
- **1º ano:** nada de texto, e nada de coisa meio complexa. Cada aparelho faz
  **uma coisa só, que a criança já viu em casa**: a caixinha toca música, o
  despertador acorda, o telefone chama a vovó e o tablet passa desenho. Nada de
  "previsão do tempo".
- **Só o N1.**
- **Errou, perdeu** (`WRONG_ANSWER` + `lives.loseAll()`).

---

## 1. O jogo em uma frase

A máquina de fichas solta um **presente embrulhado**. A criança **toca no
presente**: o papel estoura, e aparece um aparelho **funcionando** (o
despertador tocando trrrim, a caixinha cantando uma música de ninar). Ao lado
da máquina está uma **casinha com 2 quartos**, e em cada quarto alguém precisa
de alguma coisa: um menino **dormindo** que precisa acordar, um **bebê
chorando**… A criança **toca no quarto de quem esse aparelho ajuda**. O
aparelho voa até lá, e o problema **se resolve na frente dela**.

Um gesto só: **tocar**. Primeiro no presente (para descobrir), depois no
quarto (para decidir).

## 2. A habilidade, e por que não repete o Bichinho

> **(EF01CO06)** Reconhecer e explorar artefatos computacionais voltados a
> atender necessidades pessoais ou coletivas.

| O que a BNCC pede | Onde acontece |
|---|---|
| **explorar** | a criança **abre** o aparelho e o vê funcionando antes de decidir; pode tocar nele de novo para ver outra vez |
| **reconhecer** a que ele serve | ela liga o que viu (trrrim!) a quem precisa disso (quem está dormindo) |
| **atender** uma necessidade | o aparelho chega e a necessidade some: o menino acorda, o bebê dorme |
| necessidade **coletiva** | N2 (§12): a festa com 3 crianças paradas, sem música |

| | *Meu Bichinho Conectado* (R2) | **Máquina dos Ajudantes** |
|---|---|---|
| começa por | a **necessidade** | o **aparelho** (surpresa) |
| a criança escolhe | **qual aparelho** | **para quem** ele serve |
| explorar | não tem | **abrir e ver funcionar** antes de decidir |

**O teste da bolinha:** se o presente fosse uma bolinha, não haveria como saber
a quem ela ajuda. O acerto depende de ver **o que o aparelho faz**.

## 3. O que mudou da ficha, e por quê

| Ficha original | Aqui | Motivo |
|---|---|---|
| ler o pedido e tocar no botão do aparelho (4 botões) | tocar no **presente**, ver o aparelho funcionar e tocar em **quem** ele ajuda | repetia o Bichinho (decisão do usuário) |
| balões de ícone para a necessidade | **a situação desenhada** no quarto: dormindo, chorando, com a foto da vovó na mão, bocejando | nada para decifrar, e o ícone viraria "junte figuras iguais" |
| ouvir história, previsão do tempo, hora do lanche | **acordar, fazer o bebê dormir, falar com a vovó e ver desenho** | coisas que toda criança de 6 anos já viu (pedido do usuário) |
| TRAVA com cadeado, +5, o certo acende após 2 travas | **errou, perdeu**: a cena engraçada acontece, o quarto certo acende de leve (a dica chega **depois**) e sai `WRONG_ANSWER` + `lives.loseAll()` | padrão da rodada |
| TÍTULO → exemplo 5 s → JOGO → RESULTADO | sem título; o exemplo virou o guia visual (§9); `showLevelComplete` | PADRAO-R3 |
| 1280 × 720 responsivo, paisagem e retrato | 1280 × 720 fixo, `Scale.FIT` | PADRAO-R3 |
| prateleira dos pares no fim | um **varal de fotos**: a cada acerto, uma foto de quem foi ajudado, com o aparelho, é pendurada | se lê sem texto e vai enchendo durante o jogo |
| balão-síntese 'cada aparelho ajuda de um jeito!' | letreiro **CADA UM AJUDA!**; a frase inteira vai no `showLevelComplete` | 1º ano: no máximo 4 palavras por vez |
| 3 níveis | só o **N1** | pedido do usuário |

## 4. O laço

```
a ficha cai sozinha na máquina · a portinhola abre · o PRESENTE rola até a
bancada · os 2 quartos da casinha acendem com quem precisa de algo
        │ toque no presente
        ▼
   o papel estoura · o aparelho aparece FUNCIONANDO (3 s) · os 2 quartos
   pulsam de leve (os dois iguais)
        │ (tocar no aparelho de novo = ver funcionar de novo, sem custo)
        │ toque num quarto
        ▼
   o aparelho voa até o quarto e funciona lá
   ┌───────────────────┴────────────────────┐
 ajuda                                   não ajuda
 o problema some (acorda, dorme, fala     cena engraçada (1,5 s): o bebê chora
 com a vovó, ri) · coração · a foto vai   mais alto com o trrrim · o aparelho volta
 para o varal · CORRECT_ANSWER (+10)      para a bancada · o quarto certo acende
        │                                 de leve · WRONG_ANSWER +
        ▼                                 lives.loseAll() → done
   ainda tem presente? ── sim ──► próximo
        │ não
   o varal balança com as 4 fotos · CADA UM AJUDA! · confete · showLevelComplete
```

## 5. A tela (1280 × 720)

Há só **três coisas** na tela: a máquina, o presente e a casinha.

| Região | Caixa / centro | O quê |
|---|---|---|
| HUD | vidas em (40, 40), ocultas; 4 bolinhas em (150, 44); `?` em (1220, 56), 96 × 96 | só as bolinhas |
| varal | pintado de (60, 100) a (640, 190), 4 pregadores em x 140 / 280 / 420 / 560 | as fotos dos ajudados |
| máquina | de (50, 210) a (370, 700), ~320 × 490 | sprite `maquina.png`: luzinhas, fenda, portinhola |
| bancada | tampo em (520, 580), pintada no fundo | o presente para aqui, e o aparelho funciona em cima dela (~170 px) |
| casinha | pintada de (690, 110) a (1260, 700): telhado em cima e **2 quartos vazios** lado a lado | quarto A de (715, 270) a (970, 680); quarto B de (990, 270) a (1245, 680) |
| pessoa no quarto | a célula de `pessoas.png` ocupa o quarto inteiro, com os pés em y 670 | a pessoa **e os móveis dela** (cama, berço, sofá, poltrona) |
| letreiro | (640, 130) | **CADA UM AJUDA!** (código, DynaPuff) |

**Densidade:** o presente/aparelho + **2 quartos** + o `?` = **4 alvos**, o teto.
Os quartos são alvos grandes (255 × 410).

**Teclado:** `Espaço` abre o presente ou repete o aparelho; `1` e `2` tocam os
quartos A e B; `H` repete o guia.

## 6. Aparelhos, pessoas e rodadas (`data/levels.ts`)

### Os 4 aparelhos (cada um mostra **uma** coisa)

| id | Aparelho | O que ele mostra ao sair do presente (3 s) |
|---|---|---|
| `clock` | despertador | chacoalha e toca **trrrim!**, com ondinhas |
| `speaker` | caixinha de som | toca uma **música de ninar**, com uma luazinha e notas lentas |
| `phone` | telefone | toca **trim-trim** e aparece um balãozinho com o **rostinho da vovó** |
| `tablet` | tablet | a tela acende com um **coelhinho de desenho animado** pulando |

### As 4 pessoas (a situação se vê, não se lê)

| id | Quem, no quarto | Antes | Ajudado |
|---|---|---|---|
| `sleeper` | menino na **cama**, com o sol entrando pela janela | dormindo, "zzz" | acorda espreguiçando, feliz |
| `baby` | **bebê** no berço | chorando (lagriminhas de desenho) | dorme sorrindo |
| `missing-grandma` | menina no sofá, segurando a **foto da vovó** | olhando a foto, com saudade | ri, falando com a vovó |
| `bored` | menino jogado na **poltrona** | bocejando, entediado | rindo muito |

### As 4 rodadas do N1

| Fase | Presente | Quartos | Certo | Cena engraçada do errado |
|---|---|---|---|---|
| 1 | despertador | dormindo · bebê | dormindo | o trrrim faz o **bebê chorar mais alto**, e o despertador pula de susto |
| 2 | caixinha de ninar | bebê · dormindo | bebê | o menino **dorme ainda mais**, com uma bolha no nariz e ronco |
| 3 | telefone | com saudade · bebê | com saudade | o trim-trim faz o **bebê chorar mais alto** |
| 4 | tablet | entediado · dormindo | entediado | o desenho passa, e o menino **continua dormindo**, roncando |

Cada aparelho e cada pessoa são **o certo uma vez**. O lado do certo é sorteado,
com no máximo 2 vezes seguidas do mesmo lado.

**Honestidade (a lição do Bichinho):** o distrator tem de ser um "não" sem
discussão **para o que o aparelho acabou de mostrar**. O tablet faz chamada de
vídeo, então ele **nunca** divide a tela com quem está com saudade. A caixinha
toca música, e música anima quem está entediado, então ela **nunca** divide a
tela com o entediado.

```ts
type Device = 'clock' | 'speaker' | 'phone' | 'tablet'
type Person = 'sleeper' | 'baby' | 'missing-grandma' | 'bored' | 'party'

const HELPS: Record<Device, Person[]> = {
    clock: ['sleeper'],
    speaker: ['baby', 'party'],
    phone: ['missing-grandma'],
    tablet: ['bored'],
}
const NEVER_BESIDE: Record<Device, Person[]> = {
    tablet: ['missing-grandma'],
    speaker: ['bored'],
}

interface RoundDef { id: string; device: Device; rooms: [Person, Person] }
interface LevelDef { level: number; rounds: RoundDef[] }

helps(device, person) => HELPS[device].includes(person)
```

**`validateLevels(LEVELS)` no import:**
- 4 rodadas (≤ 5); cada rodada com 2 quartos e **exatamente 1** ajudado;
- o outro quarto não está em `HELPS` nem em `NEVER_BESIDE` do aparelho;
- no N1, cada aparelho e cada pessoa são o certo **uma vez**; `party` não entra;
- as duas pessoas do par são diferentes.

## 7. O erro

1. O aparelho voa até o quarto errado e funciona lá. **Cena engraçada de 1,5 s**
   (§6): a necessidade **não some**, e às vezes piora de um jeito engraçado. Um
   "?" aparece sobre a pessoa.
2. O aparelho volta para a bancada. O **quarto certo acende de leve**, e a dica
   chega **depois** do erro.
3. `WRONG_ANSWER` + `hud.lives.loseAll()`. A cena vai para `done`.

Sem vermelho, sem som áspero (um "fom-fom" de trombone macio).

**Não é erro:** tocar num quarto **antes** de abrir o presente (só balança); tocar
no aparelho de novo (ele funciona de novo); a máquina, o varal, o `?`.

**Pontos:** +10 por rodada. **Estrelas:** 3 ao concluir.

**Pista que entrega (conferido):** os 2 quartos pulsam **iguais**; ninguém olha
nem aponta para o aparelho; o aparelho fica no meio, entre a máquina e a casa,
e não mais perto de um quarto; a única pista é **o que o aparelho mostrou** e
**o que a pessoa está vivendo**.

## 8. O acerto e o fim

1. O aparelho voa em arco até o quarto, pousa ao lado da pessoa e funciona.
2. A necessidade some: o menino acorda, o bebê dorme, a menina conversa com a
   vovó, o entediado ri. Aparecem um **coração** e brilhinhos.
3. O quarto "tira uma foto" (flash), e a foto (a pessoa feliz com o aparelho)
   voa para o **varal**. A bolinha da fase se enche.
4. Os quartos apagam, e a próxima ficha cai.

**Fim do nível:** as 4 fotos do varal balançam uma de cada vez, com o som de cada
aparelho. O letreiro **CADA UM AJUDA!** salta e cai confete. Depois vem o
`showLevelComplete`: *"Cada aparelho ajuda de um jeito!"*

## 9. Guia visual (sem texto)

É o `shared/guide/createVisualGuide`, com a chave `ef01co06-l1`.

1. **Rodada de treino** (`demo`, não conta). A ficha cai e o presente rola. O
   dedo **toca o presente**: sai uma **caixinha tocando música animada**. Os
   quartos acendem: a **festa** (3 crianças paradas, de chapéu de festa) e o
   **menino dormindo**. O dedo toca a festa, e todos **dançam**.
2. **A vez da criança.** A 1ª rodada de verdade começa. O dedo pulsa **sobre o
   presente** (`waitFor`: abrir não tem erro). Quando o aparelho aparece, o dedo
   **passeia pelos 2 quartos, sem parar em nenhum**, e sai no primeiro toque.

O `?` repete o passo 1.

**Dá para entender sem ler?** Sim: abre o presente → vê o que ele faz → leva
para quem precisa daquilo.

## 10. Feedback e áudio (WebAudio)

| Momento | Visual | Som |
|---|---|---|
| ficha | cai na fenda, luzinhas da máquina piscam | tlim + trrr |
| presente | rola e para na bancada, balança | toc-toc |
| abrir | o papel estoura em confetes | "pof!" |
| despertador | chacoalha, ondinhas | trrrim! |
| caixinha | notas lentas e luazinha | 4 notas de ninar |
| telefone | pula, balãozinho da vovó | trim-trim |
| tablet | a tela acende, coelhinho pula | "boing" |
| voo | arco até o quarto | fiuu |
| ajudou | coração, brilhos, flash | plim + sininho |
| engraçado | "?" na pessoa | o som do aparelho + trombone "fom-fom" |
| fim | fotos balançando, letreiro, confete | os 4 sons + acorde |

## 11. Ciclo da cena

`mode`: `intro · guide · deliver · closed · open · fly · done · panel`. Só dá para tocar
no presente em `closed`; o aparelho (para repetir) e os quartos, em `open`. Cada `startRound` faz
`++gen`. A bridge segue a Garra: `CORRECT_ANSWER` por rodada, `WRONG_ANSWER` no
erro, `CHECKPOINT` com `progress = round(feitas / 4 × 100)`, `GAME_COMPLETED`.
O jogo nunca emite `GAME_OVER`.

## 12. Depois do N1

| Nível | Assunto | O que entra |
|---|---|---|
| 2 | **ajudar todo mundo** | a casinha ganha um 3º cômodo. Entra a **festa** (3 crianças paradas): a caixinha de música animada ajuda **todas de uma vez** |
| 3 | **mais de um serve** | um aparelho ajuda **dois** quartos (o tablet: desenho para o entediado **e** chamada de vídeo com a vovó), e os dois valem |

## 13. Arquivos, texturas e quem mexe

| Ferro | Brasa |
|---|---|
| `types.ts`, `data/levels.ts`, `data/devices.ts`, `data/files.ts`, `index.ts`, `scenes/BootScene.ts`, `scenes/GameScene.ts` | `data/layout.ts`, `data/theme.ts`, `scenes/machine.ts` (ficha, portinhola), `gift.ts` (presente, abrir, cada aparelho funcionando), `house.ts` (quartos, pessoas, cenas), `line.ts` (varal e fotos), `hud.ts`, `audio.ts`, `guide.ts`, catálogo |

| Arquivo | Grade | Conteúdo |
|---|---|---|
| `bg-casinha.png` | 1280 × 720 | quintal com o varal, a bancada e a casinha de 2 quartos **vazios** |
| `maquina.png` | 640 × 980 | a máquina de fichas (sem botões) |
| `aparelhos.png` | 2 × 2, 384 | despertador, caixinha, telefone, tablet (tela vazia) |
| `pessoas.png` | 5 × 3, 384 × 576 | 4 pessoas + a festa do treino, cada uma com os seus móveis × antes, ajudada, engraçada |
| `pecas.png` | 3 × 3, 256 | presente, notas animadas, notas de ninar, zzz, coração, coelhinho, rostinho da vovó, dedo, 1 livre |
| `cover-maquina-dos-ajudantes.png` | 1672 × 941 | capa **com o título** |

**Código:** abrir o presente (estouro de confete), as ondinhas, o "?", o flash, a
moldura da foto do varal (recorte da célula "ajudada"), o letreiro, o confete, as
bolinhas.

**Registro:** id `NEXT_FREE_ID` (hoje **096**), slug `maquina-dos-ajudantes`,
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, 3 frases em `gameInstructions.ts`,
`public/og/maquina-dos-ajudantes.jpg`, categoria **Cultura Digital**.

## 14. Travas

- O veredito é `helps(device, person)`. Nunca marque "o certo" na rodada.
- Cada aparelho mostra **uma** função. Não junte duas no mesmo presente.
- Necessidade é situação desenhada, **nunca** texto nem ícone de aparelho.
- Distrator nunca está em `HELPS` nem em `NEVER_BESIDE`.

## Dúvidas para o usuário

1. **Estilo:** chibi de figurinha (`19`), como no Balão e na Pescaria?
2. **Bebê chorando:** é a única cena com choro (de desenho, com lagriminhas
   engraçadas), porque é a necessidade dele. Pode?

## Histórico

- **30/09/2026.** Primeiro plano pela ficha original (botões-aparelho), refeito
  no mesmo dia: o usuário apontou que repetia o *Meu Bichinho Conectado* e
  escolheu a mecânica do **Aparelho-surpresa**, com o cuidado de ficar simples
  para o 1º ano ("nada de previsão do tempo").

## Decisões depois do N1 (30/09/2026)

- **Sem letreiro no fim.** O usuário pediu para tirar o "CADA UM AJUDA!": o fim do
  nível é o varal balançando, o confete e o `showLevelComplete`.
- **N2 — ajudar muita gente de uma vez.** Sem 3º cômodo (pediria outro fundo e
  passaria do teto de 4 alvos). A **festa** (3 crianças) está em todas as rodadas
  e é o certo uma vez; a caixinha aparece com as duas músicas (animada = festa,
  ninar = bebê), então é preciso ouvir o que ela faz.
  dance [festa, saudade] · lullaby [bebê, festa] · clock [dormindo, festa] · phone [saudade, festa].
- **N3 — um aparelho faz mais de uma coisa.** O `tablet-call` passa o desenho **e**
  depois mostra a vovó na tela. Rodada 1: [entediado, saudade], os dois valem.
  Depois o tablet aparece contra quem ele não ajuda, e a criança precisa lembrar
  das duas funções: [saudade, dormindo] · [entediado, dormindo] · phone [saudade, entediado].
- Sem guia novo no N2/N3: o gesto é o mesmo; o `?` repete o treino.
- A capa foi refeita com o título numa cor só (coral) e fonte arredondada nova.
