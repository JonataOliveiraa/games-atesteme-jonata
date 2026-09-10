# A Busca do Bibliotecário — TEXTURAS.md

Documento irmão: `PLANEJAMENTO.md`

## 0. Estado dos arquivos

| Arquivo | Estado | Conteúdo |
|---|---|---|
| `personagens.png` | **a gerar** | bibliotecário em 4 poses + 4 visitantes |
| `resultados.png` | **a gerar** | 24 ilustrações usadas nos resultados |
| `bg-biblioteca.png` | **a gerar** | cenário da biblioteca mágica |

**Três arquivos, e só.**

Tudo o mais é `Graphics` ou texto do Phaser:

- barra de busca;
- grimórios;
- Buscador Sol;
- Buscador Lua;
- cards;
- botões;
- filtros;
- balões;
- lupa;
- estrelas;
- selos;
- bordas;
- feedback;
- partículas;
- prateleira;
- indicadores;
- tutorial.

---

## 1. A regra que decide o visual

> **A estrela visual é a busca mudando, não a biblioteca mágica.**

O cenário deve ser bonito, mas quieto.

O maior contraste da tela precisa ficar em:

**pedido → consulta → resultados → decisão**

Nada de estantes lotadas atrás dos resultados.

Nada de partículas mágicas permanentes no centro.

Nada de letras voando pelo cenário.

Nada de objetos muito brilhantes disputando atenção com a consulta.

---

## 2. O grimório não é textura

O grimório/buscador muda:

- palavras;
- filtros;
- cor;
- motor;
- resultado;
- estado;
- feedback.

Portanto ele deve ser feito em código.

PNG de grimório com interface desenhada gera:

- texto duplicado;
- escala ruim;
- estado congelado;
- dificuldade de troca de cor;
- baixa legibilidade em celular.

O mesmo vale para Buscador Sol e Buscador Lua.

A identidade dos dois deve vir de:

- cor;
- símbolo abstrato;
- animação;
- pequenas diferenças de Graphics.

Nunca de um print de navegador real.

---

## 3. Estilo comum

```text
flat 2D cartoon asset for a children's educational game, friendly chibi proportions,
chunky rounded shapes, bold readable silhouette, thick dark navy outline #1F2A37,
clean flat colors, one soft inner shadow, one small painted highlight, cheerful warm
palette, minimal detail, clear shapes at small size, polished educational game art,
no text, transparent background
```

---

## 4. Negativo comum

```text
3D render, realistic, photorealistic, hyperdetailed, complex texture, tiny details,
dark horror mood, scary face, angry face, weapon, brand logo, browser logo, Google,
Bing, Chrome, Firefox, text, letters, words, numbers, watermark, signature, interface,
button, search bar, card frame, outer border, visible grid lines, cropped, cut off,
white background
```

---

## 5. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| madeira | `#B8875B` |
| creme | `#FFF1D2` |
| azul | `#4DA3FF` |
| roxo | `#8B7BD8` |
| turquesa | `#2DD4BF` |
| tinta | `#334155` |
| acerto — código | `#35D07F` |
| erro — código | `#E66A6A` |

### Regra

Verde e vermelho são cores de feedback.

Não usar verde ou vermelho como cor dominante nos personagens ou nos resultados.

Buscador Sol usa identidade azul.

Buscador Lua usa identidade roxa.

---

# 6. `personagens.png`

## Especificação

**1024 × 512 px**

Grade:

**4 colunas × 2 linhas**

Cada frame:

**256 × 256 px**

Total:

**8 frames**

Fundo:

**transparente real**

---

## Prompt

```text
Sprite sheet with exactly 8 frames in a strict 4-column by 2-row grid.
Every frame exactly 256 by 256 pixels, total image exactly 1024 by 512 pixels.
True transparent background, no visible grid lines, no cell backgrounds and no bleed.

TOP ROW: the SAME friendly magical school librarian in all four frames.
A cheerful adult librarian with rounded chibi proportions, medium brown skin,
short curly dark hair, round glasses, cream shirt, teal vest #2DD4BF,
dark blue trousers and a small warm brown book pouch.
No hat, no wizard robe, no wand.
Same body size, colors, proportions and ground line in every frame.

1. LIBRARIAN IDLE:
standing calmly, holding one closed book against the chest, friendly smile.

2. LIBRARIAN PRESENTING:
body turned slightly to the right, one open hand presenting something outside
the frame to the right, curious encouraging expression.

3. LIBRARIAN THINKING:
one hand under the chin, other arm holding the book, eyes looking slightly up,
friendly puzzled expression, never worried or sad.

4. LIBRARIAN CELEBRATING:
one arm raised, book held safely in the other hand, cheerful smile,
small upward hop.

BOTTOM ROW: four DIFFERENT friendly elementary-school visitors, around 8 to 9
years old, standing in the same scale and on the same invisible ground line.
Each child holds a neutral school object with no writing and faces slightly RIGHT.

5. child with a blank poster tube, yellow shirt and blue shorts.
6. child holding a plain notebook, purple shirt and dark trousers.
7. child carrying a blank clipboard, orange shirt and teal trousers.
8. child holding one closed school book, blue shirt and beige shorts.

All eight figures centered with about 8 percent empty margin.
Same visual weight and shoulder scale across the whole sheet.

[common style]
[common negative]
```

---

## Contrato de frames

| Frame | Personagem | Pose |
|---:|---|---|
| 0 | bibliotecário | esperando |
| 1 | bibliotecário | apresentando |
| 2 | bibliotecário | pensando |
| 3 | bibliotecário | comemorando |
| 4 | visitante A | neutro |
| 5 | visitante B | neutro |
| 6 | visitante C | neutro |
| 7 | visitante D | neutro |

---

## As quatro coisas que mais podem estragar a folha

### 1. Linha do chão diferente

Os pés do bibliotecário precisam ficar na mesma altura nos frames 0–3.

Caso contrário, a troca de pose vira um salto involuntário.

### 2. Bibliotecário crescendo na comemoração

A cabeça e o tronco precisam manter a mesma escala.

O salto acontece pela pose, não por aumentar o corpo.

### 3. Visitantes com objetos que entregam a resposta

Os objetos segurados pelos visitantes devem ser neutros.

Nunca desenhar:

- tucano;
- baleia;
- Saturno;
- vulcão;
- símbolo de vídeo.

### 4. Texto dentro dos objetos

Caderno, cartaz, livro e prancheta devem estar completamente sem escrita.

---

# 7. `resultados.png`

## Especificação

**1536 × 1024 px**

Grade:

**6 colunas × 4 linhas**

Cada frame:

**256 × 256 px**

Total:

**24 frames**

Fundo:

**transparente real**

---

## Regra

O PNG entrega apenas a **ilustração do resultado**.

Não desenhar:

- card;
- título;
- legenda;
- botão;
- borda;
- símbolo de imagem;
- símbolo de vídeo;
- símbolo de texto;
- posição no ranking;
- selo;
- origem;
- navegador.

Tudo isso é código.

---

## Prompt

```text
Sprite sheet with exactly 24 frames in a strict 6-column by 4-row grid.
Every frame exactly 256 by 256 pixels, total image exactly 1536 by 1024 pixels.
True transparent background.

One large centered educational thumbnail illustration per frame.
No card shape, no border, no label, no interface, no text and no icons for
image, video or text. Each illustration fills about 74 percent of its frame
with generous clear margins.

Frames left to right, top to bottom:

1. a real toucan standing on a tropical tree branch.
2. a soft stuffed toucan toy.
3. a simple children's drawing of a toucan on one blank sheet of paper.
4. an erupting volcano with orange lava and a small smoke cloud.
5. the same kind of volcano calm and not erupting.
6. a small handmade school volcano model made from cardboard.

7. a blue whale swimming underwater.
8. a plush whale toy.
9. a simple children's whale drawing on blank paper.
10. a friendly view of the Solar System with several planets.
11. a small space rocket flying.
12. planet Earth seen as a friendly globe.

13. a young bean sprout growing from brown soil.
14. a bowl of cooked beans.
15. three dry bean seeds beside a small empty plant pot.
16. a simple water cycle scene: sea, cloud, rain and sunlight, no arrows or text.
17. a clear glass of drinking water.
18. a large ocean wave.

19. a maned wolf standing in Brazilian cerrado grassland.
20. a generic small fox-like animal in grassland, visually different from the maned wolf.
21. planet Saturn with clearly visible rings.
22. planet Jupiter with broad colored bands, no text.
23. several clean recyclable objects separated into groups: paper, bottle and can.
24. one mixed garbage bag with unrelated household waste.

Use natural object colors. Do not give correct items a green halo and do not give
distractors a red halo. Correctness must come entirely from game logic.

[common style]
[common negative]
```

---

## Contrato de frames

| Frame | Conteúdo |
|---:|---|
| 0 | tucano real |
| 1 | pelúcia de tucano |
| 2 | desenho de tucano |
| 3 | vulcão em erupção |
| 4 | vulcão calmo |
| 5 | maquete de vulcão |
| 6 | baleia azul |
| 7 | pelúcia de baleia |
| 8 | desenho de baleia |
| 9 | Sistema Solar |
| 10 | foguete |
| 11 | planeta Terra |
| 12 | broto de feijão |
| 13 | feijão cozido |
| 14 | sementes de feijão |
| 15 | ciclo da água |
| 16 | copo com água |
| 17 | onda |
| 18 | lobo-guará |
| 19 | outro animal semelhante |
| 20 | Saturno |
| 21 | Júpiter |
| 22 | recicláveis separados |
| 23 | lixo misturado |

---

## Regras de consistência

Os objetos não precisam ocupar exatamente a mesma caixa alfa, mas precisam ter o mesmo peso visual.

Evitar:

- Saturno muito pequeno;
- baleia ocupando 100% da célula;
- folhas brancas enormes;
- fundos próprios dentro dos frames;
- halos de cor;
- molduras.

A criança deve conseguir comparar as ilustrações rapidamente.

---

# 8. `bg-biblioteca.png`

## Especificação

**1280 × 720 px**

Imagem opaca.

Sem transparência.

---

## Prompt

```text
Wide flat 2D cartoon background for a children's educational game,
exactly 1280 by 720 pixels, fully opaque and filling the whole canvas.

A warm, friendly magical school library viewed mostly straight from the front.
Cream plaster walls, warm wooden floor, rounded wooden bookshelves pushed toward
the far left and far right edges, a few colorful books, two tall arched windows
near the outer sides, small potted plants, one low wooden librarian desk toward
the far left, and subtle blue and purple magical accents.

Keep the CENTRAL 72 percent of the scene visually calm and mostly empty because
the game draws a large search interface and result cards there.

Keep the LOWER 32 percent simple, with mostly uninterrupted wooden floor and
very little detail because large interactive choice cards occupy this area.

The shelves must stay near the edges. No giant book in the center.
No characters, no floating letters, no readable book titles, no signs,
no search interface, no computer screen, no cards and no glowing portal.

Warm daylight, friendly elementary-school atmosphere, low contrast background,
soft simplified shapes, less outline detail than foreground sprites.

No text, letters, numbers, logos or watermark.
```

---

## O miolo precisa ficar vazio

A região central recebe:

- pedido;
- consulta;
- resultados.

Por isso, não colocar atrás dela:

- estante cheia;
- mesa;
- escada;
- pilha de livros;
- lustre baixo;
- personagem;
- globo;
- mural;
- objeto com alto contraste.

O cenário não pode competir com a busca.

---

# 9. O que NÃO gerar

Não gerar textura separada para:

```text
barra de busca
grimório
Buscador Sol
Buscador Lua
lupa
filtros
cards
botões
balões
botão ?
setas
estrelas
selos
contorno de erro
contorno de acerto
brilho
prateleira de progresso
indicadores de fase
partículas
```

Todos esses elementos são feitos em código.

---

# 10. Paleta dos elementos de código

Esta seção é referência para combinar a arte com o Phaser.

| Elemento | Cor |
|---|---|
| Buscador Sol | `#4DA3FF` |
| Buscador Lua | `#8B7BD8` |
| consulta | `#FFF1D2` |
| texto | `#334155` |
| borda | `#1F2A37` |
| acerto | `#35D07F` |
| erro | `#E66A6A` |
| destaque neutro | `#2DD4BF` |

A arte não deve utilizar acerto e erro como indicação de certo/errado.

---

# 11. Entrega

| Item | Regra |
|---|---|
| formato | PNG-24 |
| transparência | alfa real em spritesheets |
| fundo | opaco em `bg-biblioteca.png` |
| recorte | grade exata |
| sangria | nenhuma |
| margem | ~8% nos personagens |
| margem dos resultados | ~13% |
| linhas de grade | proibidas |
| texto | proibido |
| números | proibidos |
| marcas | proibidas |
| borda externa | proibida |

Peso alvo:

| Arquivo | Peso alvo |
|---|---:|
| `personagens.png` | até ~650 KB |
| `resultados.png` | até ~1,2 MB |
| `bg-biblioteca.png` | até ~550 KB |

---

# 12. Transparência

Se o gerador entregar fundo branco falso:

1. refazer sobre magenta `#FF00FF`;
2. remover a cor;
3. exportar PNG-24;
4. conferir canal alfa.

Não aceitar sprite com fundo branco apenas “parecendo” transparente.

---

# 13. Depois que `personagens.png` chegar

Medir a caixa alfa de cada frame.

Conferir:

- linha dos pés;
- altura do corpo;
- altura da cabeça;
- centro horizontal;
- largura da silhueta;
- escala do bibliotecário;
- margem superior;
- margem inferior.

Principalmente nos frames 0–3.

O código deve ancorar pelo conteúdo real, não pelo tamanho nominal da célula.

---

# 14. Depois que `resultados.png` chegar

Medir:

- bounding box;
- ocupação percentual;
- centro visual.

Objetivo:

nenhum resultado deve parecer muito mais importante apenas porque foi desenhado maior.

Se necessário, criar escala por frame:

```ts
const RESULT_SCALE: Record<number, number> = {
  0: 1.00,
  1: 0.96,
  2: 0.92,
  // ...
}
```

A correção de escala deve ser pequena.

Se muitos frames exigirem correção grande, refazer a folha.

---

# 15. Checklist da arte

## `personagens.png`

- [ ] 1024×512
- [ ] 4×2
- [ ] 256×256 por frame
- [ ] alfa real
- [ ] mesma linha de chão nos frames 0–3
- [ ] mesmo bibliotecário nos quatro frames
- [ ] visitantes na mesma escala
- [ ] nenhum texto
- [ ] nenhum item que entregue a resposta
- [ ] sem grid visível

## `resultados.png`

- [ ] 1536×1024
- [ ] 6×4
- [ ] 256×256 por frame
- [ ] alfa real
- [ ] 24 frames completos
- [ ] sem card
- [ ] sem ícone de formato
- [ ] sem halo certo/errado
- [ ] peso visual semelhante
- [ ] sem grid visível

## `bg-biblioteca.png`

- [ ] 1280×720
- [ ] opaco
- [ ] centro calmo
- [ ] chão inferior limpo
- [ ] estantes nas laterais
- [ ] sem personagens
- [ ] sem letras
- [ ] sem interface
- [ ] sem marcas reais
