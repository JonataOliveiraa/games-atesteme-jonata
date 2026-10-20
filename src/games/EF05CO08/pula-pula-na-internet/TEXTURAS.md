# Pula-Pula na Internet — texturas

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Destino: `src/assets/games/EF05CO08/pula-pula-na-internet/`

**Este jogo não tem folha de textura. A arte final é o Graphics.** Decisão do usuário (20/10/2026): *"o jogo nem precisa de textura, ele é muito simples. Talvez só algumas imagens e estilo vetorial."* O celular, as abas, a nuvem, a antena, os ícones e o céu são formas simples (retângulo de canto redondo, cápsula, círculo), e é assim que o Graphics já os desenha em `scenes/fallback.ts`. Gerar imagem para eles só trocaria uma forma chapada por outra igual.

**Viram imagem só duas coisas:**

| Arquivo | Grade | Célula | Tamanho final | Alfa | Por quê |
|---|---|---|---|---|---|
| `fotos.png` | 2 × 2 | 400 × 260 | 800 × 520 | opaco | as fotos que aparecem **dentro do cartão**. Uma cena (crianças plantando, rua alagada) é o que o Graphics não desenha bem, e a foto precisa parecer uma foto de verdade para a criança levar a pista a sério |
| `cover-pula-pula-na-internet.png` | — | — | 1672 × 941 | opaco | a capa do catálogo, **com o título** |

Enquanto o `fotos.png` não chegar, o jogo usa as cenas de reserva do Graphics, nas mesmas células.

## 1. A linha de arte: vetor geométrico chapado

A mesma do Cabo Certo ([`references/ESTILO-VETOR-GEOMETRICO.md`](../../../../references/ESTILO-VETOR-GEOMETRICO.md)). Anexe em **toda geração** `references/23-vetor-geometrico-a.webp` e `references/24-vetor-geometrico-b.png`. Ela casa com o que o Graphics já desenha: forma chapada, sem contorno, sem sombra, cor saturada. O elenco das referências (a coruja verde, o urso, as pessoas da marca) vai no negativo.

O Graphics segue as mesmas regras, e é isso que mantém a foto e o resto do jogo na mesma família:
- **sem contorno** em nada; as formas se separam pela cor;
- **no máximo um painel chapado mais escuro** por peça (a base da aba, a lateral do celular);
- **raio de canto generoso e igual** em tudo;
- paleta curta: lilás e turquesa no mundo, verde e vermelho **só** nos botões e nas marcas de resultado.

## 2. Regras das fotos

- **Nenhum texto.** Nem placa, nem letreiro, nem marca d'água. A legenda e as pistas são do código.
- **Nenhuma foto parece verdadeira ou falsa.** A foto da enchente de 2015 é uma foto de verdade, e é isso que o N2 ensina: a imagem é real, a **data** é que derruba. Nada de montagem, recorte torto ou coisa absurda desenhada; o absurdo, quando existe, está no texto.
- Enquadrada de ponta a ponta na célula, sem moldura (o código põe a moldura branca).
- Gente aparece pequena e sem rosto em destaque, como numa foto de longe.

## 3. `fotos.png` — 2 × 2 células de 400 × 260 (800 × 520), opaco

**A ordem das células é contrato com o código** (`photo` em `data/levels.ts`).

| Célula | Cena | Usada em |
|---|---|---|
| 0 | crianças de uniforme plantando mudas de árvore no pátio da escola, regadores, dia de sol | N1, *"A turma do 5º ano plantou 20 árvores"* |
| 1 | a piscina azul de um clube, vista da borda, vazia, dia de sol | N3, *"A piscina do clube fechou PARA SEMPRE!!!"* |
| 2 | uma rua de casas baixas alagada depois de chuva forte, céu cinza, ninguém em perigo | N2, *"Olha a enchente na nossa rua HOJE!"* (a foto é de 2015) |
| 3 | o céu à noite com a lua cheia sobre telhados e uma árvore | N3, *"A lua cheia de ontem, vista do pátio"* |

~~~text
STYLE — USE THE TWO ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
construction exactly: 100% flat vector built only from rounded rectangles,
capsules, circles and rounded trapezoids with one generous corner radius;
NO outlines at all, NO shading, NO gradients — shapes are separated only by
colour, with at most one flat darker panel; a short, saturated palette. Take
ONLY the construction technique: do NOT copy any character, mascot, bird, bear
or person from the reference images.

A picture sheet, fully OPAQUE: a grid of 2 columns x 2 rows, each cell 400 x 260
(total 800 x 520), read left to right, top row first. Each cell is one
full-bleed little scene, edge to edge, no frame, like a simple flat-vector photo:
1. Small schoolchildren in uniforms planting young tree seedlings in a sunny
   school yard, two watering cans, seen from a distance.
2. An empty blue club swimming pool seen from its edge, a few lounge chairs,
   sunny sky.
3. A street of low houses flooded after heavy rain, brown water up to the
   doors, grey sky, calm, nobody in danger.
4. A night sky with a big full moon over rooftops and one round tree.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, text, letters, words, signs
with writing, numbers, watermarks, outlines, black ink lines, shading,
gradients, 3D render, photorealistic, sharks, monsters, anything scary or
absurd, borders between cells.
~~~

## 4. `cover-pula-pula-na-internet.png` — 1672 × 941, opaco

O celular turquesa de olhos grandes no meio de um pulo, subindo por abas de navegador brancas num céu lilás; um jornal, um balão amarelo com exclamação e uma foto flutuando sobre as plataformas; uma nuvem se abrindo em cima. O título **PULA-PULA NA INTERNET** no alto, centralizado, em letras grandes, redondas e coloridas com contorno escuro (a única exceção ao "sem contorno" e ao "sem texto").

~~~text
[mesmo bloco STYLE da seção 3]

A wide game cover, 1672 x 941, fully opaque. In the middle, a cute turquoise
SMARTPHONE character with a big friendly face on its screen and two little
white feet, jumping up between floating white browser-tab platforms in a soft
lilac sky. On the platforms float a folded newspaper, a yellow chat bubble with
an exclamation mark and a small framed photo. At the top a fluffy white cloud
opens in two halves. Big, round, colorful title "PULA-PULA NA INTERNET" centered
at the top, with a dark outline around the letters.

DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, bear, any character
from the reference images, brand mascots, logos, other text besides the title,
outlines on the drawing, shading, gradients, 3D render, photorealistic.
~~~

## 5. O que fica no Graphics, e como se ajusta

Tudo o mais é desenhado em `scenes/fallback.ts`, e **é a arte final**. Para mudar uma peça, mude ali:

| Chave | O que é | Função em `fallback.ts` |
|---|---|---|
| `celular` | o celular em 6 poses (subindo, caindo, lendo, feliz, triste, tonto), pé em y = 240 da célula | `phone` |
| `itens` | notícia, mensagem, foto (os ícones que flutuam) | `item` |
| `pistas` | pessoinha, calendário, globo | `clue` |
| `plataformas` | aba, parada, chão, topo (esticadas pelo meio, 48 px de ponta) | `platform` |
| `nuvem` | as duas metades da nuvem | `cloudHalf` |
| `topo` | a antena com a estrela | `summit` |
| `fundo`, `rede` | o céu e a rede de pontinhos | `sky`, `net` |
| `mao` | a mãozinha da demonstração | `hand` |

O código ainda aceita um PNG com qualquer uma dessas chaves na pasta de destino (ele substitui o desenho sem mexer em código), mas nenhuma está prevista.
