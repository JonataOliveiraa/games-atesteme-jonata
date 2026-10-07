# Cantinho do Tablet — planejamento

_EF02CO06 · 2º ano · Cultura Digital · slug `cantinho-do-tablet`_

> Substitui a ficha **Guarda-Chuva Digital** (`docs/rodada-3/EF02CO06.md`), a pedido do
> usuário: a ficha repetia a *Bolhas da Segurança* (058) — o mesmo tablet, os mesmos
> itens e a mesma pergunta "isto é perigoso?", só que com outro gesto.

## 1. A habilidade

**(EF02CO06)** Reconhecer os cuidados com a segurança no uso de dispositivos computacionais.
O exemplo oficial pede um *portfólio de cuidados* ao jogar no celular ou no tablet; o jogo
fecha cada nível montando esse portfólio (o **cartaz de cuidados**, §9).

## 2. Os irmãos, e por que este jogo é outro

| Jogo | Decisão da criança | Gesto |
|---|---|---|
| Bolhas da Segurança (058) | "este item que passa é perigo?" — um por vez, com o relógio correndo | tocar o que passa |
| Checklist do Jogador Seguro (013) | configurações e privacidade, em lista | marcar |
| **Cantinho do Tablet** | **prever**: olhar a cena parada, achar o que vai dar errado e arrumar **antes** do teste | tocar para mudar + ▶ JOGAR |

Aqui ninguém pergunta "isto é perigoso?" item a item. A criança olha um cantinho inteiro
e **prepara**: o perigo só aparece quando o dia acontece. Errar não é tocar no item errado,
é **deixar um descuido para trás** — ou **estragar o que já estava certo** (as pegadinhas).

## 3. O jogo em 1 frase

Arrume o cantinho da Lia tocando no que pode estragar o tablet, aperte **▶ JOGAR** e veja o
dia acontecer: cada coisa que você cuidou ganha um selinho; a que ficou para trás dá errado.

## 4. Como joga (com as quatro coisas, no N3)

**Preparar.** O quarto da Lia está parado. Há **4 coisas tocáveis**, e todas brilham igual
(o brilho diz "dá para tocar", nunca "isto está errado"). Cada uma tem **dois jeitos**:

| Coisa | Jeito perigoso | Jeito seguro | O que acontece no dia |
|---|---|---|---|
| copo de suco | do lado do tablet | na prateleira, longe | o gato Pipoca pula na mesa |
| fio do carregador | solto no chão, no caminho | preso rente à parede | o Beto entra correndo |
| tablet | na beirada da mesa | no meio da mesa | o Beto esbarra na mesa |
| cortina | aberta, sol forte em cima do tablet | fechada | chega o sol do meio-dia |

Um toque troca o jeito, com animação (o copo voa para a prateleira, o fio se recolhe, o
tablet desliza, a cortina corre). Outro toque desfaz. Nada vale até o JOGAR.

**Testar.** O botão **▶ JOGAR** fica sempre disponível. Ao apertar, o HUD some, a câmera
chega perto de **uma coisa por vez**, na ordem copo → fio → beirada → sol, e o evento dela
acontece:
- se está segura: o evento passa sem estrago e a coisa ganha um **selinho** com a frase do
  cuidado ("Suco longe do tablet!");
- se ficou perigosa: o **estrago acontece** (o suco molha, o Beto tropeça e o tablet cai, a
  tela esquenta), a Lia se assusta, e o balão diz o que foi ("Molhou o tablet!"). É o erro.

Tudo seguro → a Lia comemora, o tablet toca musiquinha, a bolinha da fase acende e o quarto
volta arrumado de outro jeito para a fase seguinte.

**Por que a criança não ganha tocando em tudo:** em toda fase **pelo menos uma coisa já começa
segura** — o copo já está na prateleira, a cortina já está fechada. Tocar nela **estraga**
(o copo volta para o lado do tablet). Isso é a "pegadinha" da ficha original (cuidado é
discernimento, não bloquear tudo), sem precisar de item especial: o próprio estado inicial
muda de fase para fase.

## 5. Erro

Padrão da rodada: **errou, perdeu** ([[errou-bloqueia]]). O primeiro estrago do teste emite
`WRONG_ANSWER` e `lives.lose()`, uma vez. A cena do estrago toca **antes** do `lose()`, e o
balão fica à vista nos 1,35 s em que a plataforma espera.

O guia nunca encerra a partida: o estrago que o tutorial mostra é de mentira e volta atrás.

## 6. Níveis — os perigos chegam aos poucos

Pedido do usuário depois do primeiro teste (05/10/2026): *"ta mt imprevisível, seria interessante
introduzir aos poucos nos níveis os perigos"*. Com as quatro coisas desde o começo, a criança não
sabia o que ia acontecer no dia. Agora cada nível **estreia** perigos novos, sempre do mesmo
jeito, e o mesmo quarto serve aos três níveis:

| Nível | Coisas tocáveis | Estreia |
|---|---|---|
| **N1 — Água e beirada** | copo, beirada | copo **e** beirada |
| **N2 — O fio no caminho** | copo, fio, beirada | fio |
| **N3 — O cantinho seguro** | copo, fio, beirada, sol | sol |

O que ainda não estreou fica **seguro e parado**: cortina fechada, fio preso, sem brilho, sem
zona de toque e fora do teste.

**A estreia** (`introduce` na GameScene), igual para cada perigo novo:
1. balão "O fio está no caminho. Veja!" → **Ver**: o evento acontece e dá errado;
2. a cena volta atrás (flash + rebobinar);
3. balão "Toque no fio para prender na parede." → **treino**: só aquela coisa responde, com o
   dedo batendo nela;
4. o evento acontece de novo, agora sem estrago, e a coisa ganha o selinho.

**Fases** (`data/levels.ts`; `risk` = começa perigosa):

| Nível | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| N1 | copo, beirada | beirada (copo já seguro) | copo (beirada já segura) |
| N2 | fio, copo | fio, beirada | copo, beirada (fio já seguro) |
| N3 | sol, copo, fio | sol, beirada | copo, fio, beirada (sol já seguro) |

**Validação** (`validateLevels`, roda em dev):
- todo perigo aparece primeiro como estreia, e a estreia começa perigosa na fase 1;
- toda fase tem ≥ 1 perigo; da fase 2 em diante, ≥ 1 coisa começa segura (pegadinha);
- duas fases seguidas nunca começam iguais;
- no nível, cada coisa começa perigosa em ≥ 1 fase e segura em ≥ 1 fase;
- no máximo 4 coisas tocáveis ([[densidade-de-alvos-no-celular]]).

Os antigos rascunhos de N2 (luz, volume, distância, pausa) e N3 (tomada, toalha, travesseiro)
ficam como ideia para um jogo futuro; não entram aqui.

## 7. Tela (1280 × 720)

```
┌────────────────────────────────────────────────────────────── HUD ─┐
│ [Nível 1 ● ○ ○]                                              (?)   │
│  ┌─────────┐                                    ═══ prateleira ═══ │
│  │ janela  │                                                       │
│  │ cortina │          ▭ tablet   🥤                                 │
│  └─────────┘     ┌──────────── mesa ────────────┐      ▣ tomada     │
│  🐱   Lia        │                              │  ~~~ fio ~~~   ←Beto│
│ ─────────────────┴──────────────────────────────┴────────────────── │
│                                                     [ ▶ JOGAR ]     │
└────────────────────────────────────────────────────────────────────┘
```

- **HUD** de ponta a ponta, só com chip de nível, bolinhas de fase ([[fase-sem-texto-no-hud]])
  e `?`. Some durante o teste.
- **▶ JOGAR**: botão grande no canto de baixo à direita, sempre ligado na preparação.
- As 4 zonas de toque têm folga entre si; a do copo e a do tablet andam junto com eles.

## 8. Tutorial (texto curto, claro e discreto)

`createTutorial` ([[tutorial-com-createtutorial]]): uma frase curta por balão, recorte no
que a frase cita, dedo onde há toque. A demonstração **acontece de verdade** entre os balões.

- **N1:** "Deixe o cantinho seguro para a Lia jogar." → estreia do copo → estreia da beirada →
  "Agora é você: arrume só o que é perigo." → "Depois, aperte JOGAR e veja o dia da Lia."
- **N2 e N3:** "Tem um perigo novo no quarto!" → estreia do fio (N2) ou do sol (N3) →
  "Agora é você: arrume só o que é perigo."

| Perigo | "Veja!" | Conserto (treino) |
|---|---|---|
| copo | O suco está perto do tablet. Veja! | Toque no copo para levar o suco longe. |
| beirada | O tablet está na beirada. Veja! | Toque no tablet para pôr no meio. |
| fio | O fio está no caminho. Veja! | Toque no fio para prender na parede. |
| sol | O sol forte bate no tablet. Veja! | Toque na cortina para fechar. |

O `?` repete o essencial, sem demonstração: objetivo → "Toque para mudar. De novo, desfaz." →
JOGAR (`Continuar`). Cada nível guarda a sua chave no `registry`.

**Selinho em destaque** (pedido do usuário): a tela escurece em volta, o selinho aparece grande
com raios girando e a frase em letra grande, fica 0,8 s e depois encolhe para o lugar dele.

**O sol, mais claro** (pedido do usuário): com a cortina aberta, o sol cresce na janela com
raios girando, o raio de luz fica forte e aponta para o tablet, um **termômetro** aparece ao
lado do tablet e sobe até o vermelho, saem ondas de calor e o tablet fica vermelho e suado. Com
a cortina fechada, a janela só brilha nas bordas, o termômetro fica **azul** e o tablet comemora.

## 9. Fim do nível — o cartaz de cuidados

Depois da 3ª fase, um cartaz de cortiça desce com os 4 selinhos do nível, um por linha
(ícone + frase do cuidado). É o portfólio do exemplo oficial. Depois, `showLevelComplete`
com **JOGAR DE NOVO** (o N1 é o último nível por enquanto).

## 10. Textos (`data/words.ts`)

| Coisa | Selinho (seguro) | Balão do estrago |
|---|---|---|
| copo | Suco longe do tablet! | Molhou o tablet! |
| fio | Fio longe do caminho! | Tropeçou no fio! |
| beirada | Tablet no meio da mesa! | O tablet caiu! |
| sol | Tablet longe do sol forte! | O tablet esquentou! |

Fase completa: **"Oba! Agora dá pra jogar!"**

## 11. Arte

Linha nova: **chibi de ícone** (referência `references/33-chibi-icone.jpg`, enviada pelo
usuário em 05/10/2026). Quatro arquivos (§ TEXTURAS): fundo do quarto, folha de objetos,
folha de personagens e capa. Até chegarem, **tudo é desenhado em `Graphics`** e assado nas
mesmas chaves e grades (`scenes/fallback.ts`), como na Nave Multiuso: quando o PNG existe,
ele toma o lugar do desenho sem mudar código.

Fica sempre em `Graphics`: o fio (é uma curva que muda de forma), os raios de sol, o brilho
das coisas tocáveis, gotas, vapor, o botão JOGAR, balões, HUD, cartaz.

## 12. Plataforma

- `GAME_READY` → `CHECKPOINT` (progresso = fases feitas / 3);
- fase segura → `CORRECT_ANSWER` (+10);
- estrago → `WRONG_ANSWER` (−5) + `lives.lose()`;
- fim do nível → `GAME_COMPLETED` e tela própria (slug em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`).

## 13. Arquivos

```
types.ts · index.ts
data/  files.ts layout.ts levels.ts theme.ts words.ts
scenes/ BootScene.ts GameScene.ts fallback.ts room.ts cast.ts spots.ts
        hud.ts guide.ts audio.ts balloon.ts finale.ts
```

## 14. Decisões tomadas pela régua "simples e claro"

- **4 coisas no N1**, todas com o mesmo brilho, para não entregar a resposta.
- **Teste uma coisa por vez**, com a câmera chegando perto: a criança liga cada estrago à
  sua causa.
- **O teste para no primeiro estrago** (errou, perdeu), e o balão diz qual foi.
- **Sem contador de "faltam N"**: olhar tudo faz parte da habilidade.
- **Sem texto no HUD**, fase só por bolinhas.

## 15. Histórico

- 05/10/2026 — ideia escolhida entre *Cantinho do Tablet* e *Hospital dos Tablets*; o usuário
  pediu tutorial com texto claro e discreto, arte em `Graphics` até chegarem os PNGs e
  prompts no estilo chibi de ícone. N1 feito com toda a arte em `Graphics` (reserva) e testado no
  navegador: tutorial com demonstração e treino, passagem das 3 fases, os 4 estragos e o cartaz.
- 05/10/2026 — chegaram `bg-quarto`, `objetos` (células de 350) e `personagens`; medidas em
  `src/assets/games/EF02CO06/cantinho-do-tablet/MANIFEST.md`. Layout refeito pela arte (chão em 528,
  mesa, tablet sem suporte, sol à direita da janela); tablet quebrado cai de frente; gotas e poça em
  código saíram (a arte já tem). Capa chegou no mesmo dia e foi ligada ao catálogo + OG.
- 05/10/2026 — depois de jogar: perigos chegam aos poucos (N1 copo + beirada, N2 + fio, N3 + sol),
  cada um com estreia demonstrada e treino; selinho em destaque; cena do sol com sol crescendo,
  raio no tablet, termômetro e ondas de calor. Os três níveis usam a mesma arte.
