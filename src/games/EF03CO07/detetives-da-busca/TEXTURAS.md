# Detetives da Busca — prompts das texturas

11 arquivos. Destino: `src/assets/games/EF03CO07/detetives-da-busca/`

Documentos irmãos: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

---

## 1. Estilo comum — cole isto no começo de todo prompt

```
flat 2D cartoon illustration, chibi style, very simple shapes, minimal detail,
bold clean silhouette, thick soft rounded outline, flat colors with a single soft
shadow, even lighting, no gradients, kids educational game asset, friendly and clear
```

**A regra**: se a criança não reconhece o objeto em meio segundo a 60 px de altura, tem detalhe demais. Estes desenhos aparecem pequenos, dentro de cartões, e concorrem com texto — silhueta forte e três ou quatro cores por objeto.

## 2. Negativo comum — cole em todo prompt

```
3D render, 3d, octane, blender, cinema4d, glossy plastic, shiny, specular highlight,
realistic lighting, photorealistic, hyperdetailed, intricate, ornate, busy, cluttered,
noise, texture grain, sparkles, glow, lens flare, gradient mesh, text, letters, numbers,
words, watermark, signature, frame, border, background
```

**`text, letters, numbers` é obrigatório.** Todo texto do jogo é desenhado pelo Phaser em cima da arte, em português e com o tamanho certo. Letra dentro do PNG vira lixo por baixo do texto de verdade.

## 3. Paleta — cite os hex no prompt

| Uso | Hex |
|---|---|
| Tinta escura / contorno | `#1B2333` |
| Cortiça do mural | `#D9A566` |
| Madeira escura | `#8A5628` |
| Azul da busca | `#3B82F6` |
| Verde "serve" | `#22C55E` |
| Âmbar "fora do assunto" | `#F59E0B` |
| Vermelho do pino | `#E23B3B` |
| Creme do papel | `#FFF6E8` |

## 4. Entrega

| | |
|---|---|
| Formato | PNG-24 com transparência (exceto o cenário, que é opaco) |
| Tamanho | 350×350, ou 256×256 onde indicado; cenário 1280×720 |
| Peso | **≤ 80 KB** por arquivo; cenário ≤ 400 KB |
| Enquadramento | objeto centralizado, ocupando ~85% do quadro, com folga transparente em volta |
| Nome | exatamente como na tabela, minúsculo, sem acento |

O peso importa: os arquivos antigos tinham 1 MB cada porque eram render grande. Estes são desenhos simples — 350×350 achatado fecha em dezenas de KB.

---

## 5. Os onze prompts

### 1. `bg-escritorio.png` — 1280×720, **opaco**

> `flat 2D cartoon illustration, chibi style, very simple shapes, minimal detail, even lighting, no gradients, kids educational game background` — a cozy children's detective study room seen straight from the front. A **large empty cork board** in warm tan `#D9A566` with a simple dark wood frame fills almost the entire image, edge to edge. A narrow wooden desk edge in `#8A5628` runs along the very bottom. In the extreme top corners only, a small hanging lamp on the left and a tiny potted plant on the right. **The whole center of the cork board is completely empty** — plain, uniform, nothing pinned, nothing drawn, no papers, no cards, no screens, no browser window, no monitor.

**Negativo, além do comum:** `pinned papers, notes, photos, cards, browser window, monitor, screen, computer, string, red yarn, clutter in the center`

**Por quê assim.** O centro precisa ficar vazio porque é onde o jogo desenha: moldura, barra de busca, cartões e mural saem todos de `Graphics`. Cortiça é de propósito — é ela que dá sentido ao pino que espeta os cartões. E o cenário entra com véu escuro por cima, então ele pode ser claro e alegre sem roubar a atenção.

---

### 2. `lupa.png` — 350×350

> *(estilo comum)* — a simple cartoon magnifying glass, tilted 45 degrees, round lens with **semi-transparent pale blue glass** `#3B82F6` at low opacity, thick blue rim, short straight handle in `#E23B3B` with a small dark grip. Flat colors, one soft shadow, no shine on the glass.

**Negativo, além do comum:** `opaque lens, white lens, mirror reflection, star, sparkle, glow ring`

**Crítico: o vidro tem de ser transparente de verdade** (alfa baixo no miolo, não branco). A lupa voa por cima do cartão de resultado e o cartão precisa continuar legível por baixo dela. Vidro opaco apaga a informação justo no momento em que a criança foi lê-la.

---

### 3. `pino.png` — 256×256

> *(estilo comum)* — a simple cartoon push pin seen from slightly above and to the side, round head in `#E23B3B`, short silver needle pointing down, flat colors, one soft shadow.

**Onde entra.** Espeta cada cartão que chega ao mural e **salta** quando o cartão sai da busca. É a peça que carrega a lição do Nível 2: dá para ver o resultado ser eliminado.

---

### 4. `selo-site.png` — 350×350

> *(estilo comum)* — a simple cartoon document page in cream `#FFF6E8` with a small blue globe `#3B82F6` in front of it, rounded corners, three plain horizontal bars suggesting lines of text but **not actual letters**, flat colors.

---

### 5. `selo-imagem.png` — 350×350

> *(estilo comum)* — a simple cartoon photo frame, rounded square, cream border `#FFF6E8`, inside it a flat green hill, a small blue sky and a round yellow sun, flat colors, no detail.

---

### 6. `selo-video.png` — 350×350

> *(estilo comum)* — a simple cartoon video screen, rounded rectangle in cream `#FFF6E8` with a thick blue border `#3B82F6`, a single large white play triangle centered inside, flat colors.

**Os três selos são um conjunto.** Gere os três na mesma sessão, com a mesma espessura de contorno e o mesmo peso de silhueta — eles aparecem lado a lado como botões de filtro e qualquer diferença de traço entre eles fica evidente.

---

### 7. `marca-serve.png` — 256×256

> *(estilo comum)* — a simple cartoon round sticker badge in green `#22C55E` with a thick white check mark centered, gently scalloped edge, flat color, one soft shadow.

---

### 8. `marca-fora.png` — 256×256

> *(estilo comum)* — a simple cartoon round sticker badge in amber `#F59E0B` with a thick white exclamation mark centered, gently scalloped edge, flat color, one soft shadow.

**Par obrigatório.** Mesmo diâmetro, mesma borda, mesma espessura do símbolo — as duas marcas aparecem no mesmo canto do cartão e a criança compara uma com a outra de memória. Se uma for maior, ela lê como "mais importante".

---

### 9. `selo-caso.png` — 350×350

> *(estilo comum)* — a simple cartoon detective case folder, closed manila folder in `#F59E0B` seen slightly tilted, with a single grey paper clip on the corner, flat colors, one soft shadow.

**Onde entra.** É o ícone do cartão de pedido, o mesmo nos nove casos. Um só, e não um por assunto: ícone por assunto prenderia o conteúdo à arte — trocar um caso exigiria desenho novo.

---

### 10. `mural-vazio.png` — 350×350

> *(estilo comum)* — a simple cartoon open cardboard box, empty, seen from the front at a slight angle, flaps open, light brown `#D9A566`, flat colors, one soft shadow, calm and neutral, not sad.

**Onde entra.** No meio do mural quando a busca não devolve nada — o caso do Nível 2 em que a criança liga uma palavra específica demais. **Neutro, não triste**: zerar o mural é uma lição, não um erro, e uma caixa chorando diria o contrário.

---
a
### 11. `cover-detetives-da-busca.png` — 1024×576, **opaco**

> `flat 2D cartoon illustration, chibi style, simple shapes, bold silhouette, flat colors, kids educational game cover art` — a cheerful chibi child detective with a small hat, holding up a big magnifying glass with pale blue transparent glass, standing in front of a warm tan cork board with three simple blank cards pinned to it with red push pins. Friendly, bright, uncluttered composition, plenty of empty space.

**Negativo, além do comum:** `text, title, logo, letters`

Único arquivo em que a criança-detetive aparece — o jogo em si não tem personagem-guia. Os cartões do fundo ficam **em branco**, sem letra nenhuma.

---

## 6. Conferência antes de colocar na pasta

- [ ] Nome exato, minúsculo, sem acento
- [ ] Fundo transparente de verdade (não branco) nos nove arquivos 350×350 e 256×256
- [ ] Nenhuma letra, número ou palavra dentro da imagem
- [ ] Nenhum brilho especular, nenhum degradê, nada que pareça render 3D
- [ ] ≤ 80 KB por arquivo (cenário ≤ 400 KB)
- [ ] O centro de `bg-escritorio.png` está vazio
- [ ] O vidro de `lupa.png` deixa ver o que está atrás

Faltando um arquivo, o jogo não quebra: todo consumo passa por `textures.exists()` e cai no painter em `Graphics`. Dá para ir colocando um por um e comparar arte contra código só tirando o arquivo da pasta.
