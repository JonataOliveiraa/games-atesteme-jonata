# Texturas — Arquiteto das Missões

## Como funciona

`scenes/cards.ts` procura a textura `icone-<id>` antes de desenhar. Se o PNG
existir na pasta de assets, ele é usado; se não existir, cai no desenho de
`scenes/icons.ts`. **Basta soltar o arquivo na pasta e recarregar** — o
`BootScene` já carrega qualquer PNG por glob, sem precisar registrar nada.

Pasta: `src/assets/games/EF15CO04/arquiteto-das-missoes/`

## O que já existe e é usado

| arquivo | uso |
|---|---|
| `missao-cafe-antes.png` | o palco do nível 1: cozinha com a mesa vazia |
| `missao-cafe-depois.png` | a revelação do fim: a mesa posta |
| `icones-cafe.png` | os 11 ícones do nível 1, em grade 4 × 3 de 256 × 256 |
| `cover-arquiteto-das-missoes.png` | capa no catálogo |

Existem e **não são usados hoje**: `bg-central-missoes.png`,
`caixa-modulos.png`, e os pares antes/depois de `festa`, `feira` e
`acampamento` — esses três viram os níveis 2, 3 e 4 quando o nível 1 estiver
aprovado.

## Os 11 ícones do nível 1 — ENTREGUES

Estão em `icones-cafe.png` (1024 × 768, grade 4 × 3, células de 256 × 256).
O que segue é a especificação, mantida para quando fizermos as próximas missões.

Todos **256 × 256**, PNG com fundo transparente, objeto centralizado com uns
10% de respiro nas bordas.

### O pedido e as partes

| arquivo | o que mostra | aparece em |
|---|---|---|
| `icone-mesa.png` | mesa posta: xícara fumegando e sanduíche no prato | a carta grande do PEDIDO |
| `icone-cafe.png` | xícara de café cheia, com vapor | a carta da parte CAFÉ |
| `icone-sanduiche.png` | sanduíche triangular, recheio à mostra | a carta da parte SANDUÍCHE |

### As duas distratoras

Precisam ser **obviamente** de outro assunto — a criança tem que descartar sem
pensar duas vezes.

| arquivo | o que mostra |
|---|---|
| `icone-vassoura.png` | vassoura (varrer o quintal) |
| `icone-cama.png` | cama arrumada, com travesseiro |

### Os três passos do café

**O par de risco é `filtro` e `coar`** — na minha versão desenhada os dois
ficaram parecidos demais. Vale exagerar a diferença: no filtro ninguém está
despejando nada; no coar a água está caindo e a xícara já tem café.

| arquivo | o que mostra |
|---|---|
| `icone-agua.png` | chaleira no fogo, vapor saindo |
| `icone-filtro.png` | filtro de papel com o pó dentro, parado |
| `icone-coar.png` | água caindo do filtro na xícara, xícara enchendo |

### Os três passos do sanduíche

| arquivo | o que mostra |
|---|---|
| `icone-pao.png` | pão aberto ao meio sobre a tábua |
| `icone-recheio.png` | recheio (queijo, presunto, alface) sendo posto na fatia de baixo |
| `icone-cortar.png` | sanduíche fechado e cortado em dois triângulos |

## Regras que valem para todos

- **Silhueta forte, pouco detalhe.** O ícone aparece a 110–160 px na tela do
  jogo, e num celular deitado isso vira uns 60 px reais. Detalhe fino some.
- **Contorno grosso e escuro**, no acabamento das cenas de missão que já
  existem — é a mesma família visual.
- **Nada de texto dentro da arte.**
- **Fundo transparente.** O ícone senta numa carta creme.
- Cada trio de passos precisa se separar **na silhueta**, não só na cor: a
  criança ordena olhando de relance.

## Duas formas de entregar — as duas funcionam

O código tenta nesta ordem: **arquivo solto → frame do sheet → desenho**.

**1. Arquivos soltos.** `icone-mesa.png`, `icone-cafe.png`, e assim por diante.
Trocar um ícone depois não mexe nos outros.

**2. Um sheet só** — é o que está em uso: `icones-cafe.png`, **1024 × 768**,
grade de **4 colunas × 3 linhas**, células de **256 × 256**. Os 11 ícones
ocupam as 11 primeiras células, lendo da esquerda para a direita e de cima
para baixo; a última fica transparente. O tamanho da célula está em
`ICON_FRAME` (`scenes/BootScene.ts`) e a ordem dos frames em `SHEET_FRAME`
(`scenes/cards.ts`):

| frame | ícone | frame | ícone |
|---|---|---|---|
| 0 | mesa | 6 | filtro |
| 1 | cafe | 7 | coar |
| 2 | sanduiche | 8 | pao |
| 3 | vassoura | 9 | recheio |
| 4 | cama | 10 | cortar |
| 5 | agua | 11 | vazia |

Arquivo solto vence o sheet, então dá para mandar o sheet primeiro e depois
substituir um ícone específico por um PNG solto sem reexportar nada.

## O que eu deixaria em Graphics

- **as cartas, o painel de nível, o botão VAI e o `?`** — são a moldura da
  família de 50 jogos, esticam em qualquer tamanho e mudam de cor por estado
  (normal, certo, errado, pulsando). Virar textura aqui daria trabalho e
  tiraria flexibilidade.
- **`icone-vazio`** (cantos + interrogação do encaixe vazio) — é sinal de
  interface, não objeto do mundo.

Se você discordar de qualquer um desses, é só falar que eu troco.

## Quando formos para os níveis 2, 3 e 4

Mesma estrutura, e eu mando a lista igual a esta. Por alto:

- **Festa** (`missao-festa-*`): decoração, bolo, som + 3 passos de cada;
- **Feira** (`missao-feira-*`): experimento, cartaz, bancada;
- **Acampamento** (`missao-acampamento-*`): barracas, fogueira, jantar.
