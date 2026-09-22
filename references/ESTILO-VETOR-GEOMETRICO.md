# Estilo de arte — vetor geométrico chapado (linha "Duolingo")

**Bloco para colar em todo prompt de imagem desta linha.** As referências são
**cinco imagens**, e **duas vão anexadas em toda geração**:
[`references/23-vetor-geometrico-a.webp`](./23-vetor-geometrico-a.webp) e
[`references/24-vetor-geometrico-b.png`](./24-vetor-geometrico-b.png). O prompt
começa mandando **usar os anexos como referência de estilo** — o texto abaixo só
descreve o que elas já mostram, para o caso de o gerador ignorar o anexo.

Em uma frase: **vetor 100 % chapado montado com formas geométricas de canto
redondo, sem contorno nenhum e sem uma única sombra** — mão, pé e cabelo soltos
do corpo, olho de quadrado arredondado com pupila preta cheia, pose exagerada e
paleta curta de cor saturada sobre branco.

## O elenco das referências entra no NEGATIVO

As cinco imagens são o elenco de uma marca, e **a coruja verde aparece em quatro
delas**. É exatamente o que o gerador vai copiar se ninguém proibir. O que se
tira daqui é **a técnica de construção**, não os personagens: nem a coruja, nem
o urso, nem nenhuma daquelas caras. Por isso todo prompt fecha com `green owl,
owl mascot, cartoon bird mascot, any character from the reference images, brand
mascots, logos` — e por isso o §6 manda **trocar o verde-assinatura** pela cor
de acento do projeto. Técnica e paleta são livres; o elenco não é.

## As imagens, e para que serve cada uma

| Arquivo | O que mostra | Quando anexar |
|---|---|---|
| **`23-…-a.webp`** | fileira de nove personagens andando, corpo inteiro, **zero coruja** | **sempre** — é a melhor aula de perna, pé, mão solta e marca de movimento |
| **`24-…-b.png`** | elenco em pé, de frente, parado | **sempre** — é a aula de pose neutra e de variedade de corpo |
| `25-…-c.jpg` | folha de figurinhas, muita cara de perto | troque pela `b` quando o arquivo for **busto** ou **folha de expressões** |
| `26-…-d.png` | grupo em ação, encavalado | só para **capa** — ensina a montar a pilha, não o personagem |
| `27-…-e.jpg` | pilha quadrada, corpos cortados | só para **capa**; tem coruja grande no meio, cuidado |

---

## 1. Isto não é nenhuma das outras três linhas da casa

| | chibi de figurinha (`ESTILO.md`) | desenho de criança (`EF05CO08`) | graphic novel (`EF05CO09`) | **aqui** |
|---|---|---|---|---|
| contorno | limpo, espessura uniforme | trêmulo, irregular | firme, espessura variável | **NENHUM** — a forma é só cor |
| sombra | `cel shading` de um tom | nenhuma | `cel shading` macio + degradê | **NENHUMA** — no máximo **um painel chapado** mais escuro |
| proporção | cabeça enorme, corpo mínimo | cabeça grande, corpo pequeno | cabeça um pouco maior | **~4 cabeças** — corpo de adulto, **não é chibi** |
| construção | desenho | desenho | desenho | **montagem de retângulos de canto redondo, cápsulas e círculos** |
| silhueta | `keyline` branca de adesivo | o contorno preto | o contorno marrom | **nada em volta** — e as extremidades ficam **soltas** |
| olho | enorme, com brilho | pontinho preto | íris, pupila e brilho | **quadrado arredondado branco, pupila preta cheia, um pontinho** |

**Sem `keyline` branca em nenhum arquivo desta linha**, nem nos que têm alfa. E
sem contorno: se aparecer uma linha em volta da figura, o estilo virou outro.

---

## 2. As sete regras da técnica

> **1. Tudo nasce de quatro formas.** Retângulo de canto redondo, cápsula
> (retângulo de ponta totalmente redonda), círculo e trapézio de canto redondo.
> O raio é **generoso e igual em tudo**. Canto vivo só em cabelo intencional.

> **2. Zero contorno, zero sombra.** A forma se separa da vizinha **pela cor**.
> Quando duas formas da mesma cor se encostam — braço na frente do tronco —,
> entra **um painel chapado de um tom mais escuro e um pouco mais saturado da
> MESMA matiz**. É um painel, com borda dura: nunca um degradê, nunca uma linha.

> **3. As extremidades são soltas.** Mão, pé e às vezes uma mecha de cabelo
> flutuam **com um vão de fundo** entre elas e o corpo. O pé é uma **cápsula
> deitada pequena**, em cor de acento, **sem tornozelo** — em vários personagens
> não existe perna nenhuma ligando o pé à saia. Esse vão é a assinatura do
> estilo: sem ele a figura vira vetor chapado comum.

> **4. A cabeça é um quadrado arredondado, e quase não tem pescoço.** Ela vale
> cerca de **um quarto da altura total**, e o corpo inteiro dá **por volta de
> quatro cabeças**. O tronco é **um trapézio grande de canto redondo**; braço e
> perna são cápsulas de **espessura constante**, sem afinar no punho.

> **5. A cara é um kit de peças sólidas.**

| Peça | Como é |
|---|---|
| olho | quadrado arredondado (ou oval) **branco**, grande, com **pupila preta cheia** e **um** pontinho branco |
| pálpebra | uma forma sólida cor de pele cortando o olho por cima — nunca uma linha |
| sobrancelha | cápsula sólida separada, flutuando acima do olho |
| boca aberta | **uma** forma sólida vinho escuro, com a língua como outra forma chapada |
| boca fechada | **traço-cápsula grosso de ponta redonda**, espessura constante |
| nariz | **em geral não existe**; nos personagens mais velhos, uma forma sólida saliente |
| bochecha | oval chapado, ou dois risquinhos-cápsula |

> **6. A roupa não tem dobra.** No máximo **um painel chapado** mais escuro e
> **dois ou três risquinhos-cápsula** para um zíper ou uma costura. A mão é uma
> **luva com polegar**; dedo separado só quando o gesto pede, e aí cada dedo é
> uma cápsula lisa.

> **7. A pose é exagerada e fora de eixo.** Corpo na diagonal, membro
> esparramado, peso que não fecha — e **algumas cápsulas escuras pequenas
> soltas** perto do pé e da mão como marca de movimento. São cápsulas, não
> riscos.

### A conferência, que vale para todo arquivo da linha

- [ ] **nenhum contorno**, em forma nenhuma;
- [ ] **nenhum degradê** — passe o zoom: cada área é uma cor só;
- [ ] mão e pé **soltos**, com vão de fundo visível;
- [ ] pé = cápsula deitada em cor de acento, sem tornozelo;
- [ ] cabeça de canto redondo, corpo de **~4 cabeças**, **não é chibi**;
- [ ] pupila **preta cheia** com um pontinho, sem íris colorida;
- [ ] **nenhuma keyline branca**;
- [ ] **nenhuma coruja, nenhum mascote, nenhuma cara das referências**;
- [ ] **nenhuma letra**.

---

## 3. Bloco de estilo (começa o prompt)

```
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE and match their
construction exactly: flat geometric vector character illustration, assembled
only from rounded rectangles, capsules and circles with a large, even corner
radius. NO OUTLINES anywhere — every shape is separated by colour alone; where a
shape must read against a same-coloured shape, use ONE flat panel of a darker,
slightly more saturated tone of the SAME hue, with a hard edge — never a
gradient, never a line. 100% flat colour: no shading, no cel shadow, no
gradient, no texture, no grain, no airbrush, no rim light, no gloss. Squarish
head with rounded corners, about a quarter of the total height, sitting on the
torso with almost no neck; the whole figure is about 4 heads tall — a real adult
or teen body, NOT chibi. The torso is one big rounded trapezoid; arms and legs
are capsules of constant thickness that do not taper. Hands, feet and some hair
pieces float DETACHED from the body, with a clean gap of background between
them. Feet are small flat horizontal capsules in an accent colour, with no
ankle. Eyes are large white rounded squares with a big solid black pupil and one
tiny white dot; eyelids and eyebrows are separate solid shapes; an open mouth is
one solid dark-maroon shape with a flat tongue; a closed smile is a thick
capsule stroke with round caps; noses are usually absent. Hands are mitten
shapes with a thumb. Clothing has no folds: at most one darker flat panel and
two or three short capsule marks for a seam or a zip. Extreme, off-balance,
full-body poses with splayed limbs, plus a few small detached dark capsules as
motion ticks. Bright, high-chroma, high-key palette, a few flat colours per
figure. Take ONLY the art style and the construction from the attached images:
do NOT copy their characters, their faces, their clothes, their poses or their
groupings, and include no owl and no mascot.
```

## 4. Negativo (fecha o prompt)

```
DO NOT INCLUDE: green owl, owl mascot, cartoon bird mascot, any character from
the reference images, brand mascots, logos;
outlines, black outlines, line art, ink lines, strokes around shapes, sketchy
lines, white sticker keyline;
gradients, soft shading, cel shading, ambient occlusion, highlights, gloss, rim
light, texture, grain, paper texture, painterly brushwork, airbrush, drop
shadow on the figure;
3D render, clay render, plasticine, isometric, photorealistic, blur, depth of
field, lens flare, noise;
chibi proportions, oversized baby head, tiny body, anime face, manga eyes,
coloured irises, realistic anatomy, realistic hands, five separated fingers,
knuckles, hair strands, cloth folds, wrinkles, muscle definition, tapered limbs;
text, letters, words, labels, digits, numbers, captions, watermark, signature,
title lettering, user interface, buttons, panels, frames, speech bubbles,
arrows, icons, stars, HUD;
background scenery, floor, ground, horizon, room, props under the feet, cast
shadow on the ground;
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
white backing in transparent assets;
sad faces, crying, angry faces, scolding adults, pointing at the viewer.
```

## 5. A linha extra, por tipo de arquivo

| Tipo | Linha extra |
|---|---|
| **Folha de sprites** | `Sprite sheet, N columns by M rows, 256x256 px per cell, the SAME character in every cell at the SAME scale, the same palette and the same flat lighting, centred in its cell with even margins, transparent background, no grid lines drawn, no cell borders.` |
| Personagem solto | `Full body, single character alone, feet flat on an invisible line, isolated on a transparent background, no ground shadow.` |
| Busto | `Head and shoulders only, centred, transparent background, no shadow.` |
| Cenário | `Wide background illustration, 16:9, built from the same flat geometric shapes, no characters, calm low-contrast areas where game elements will sit.` |
| Capa | `Cover illustration, characters overlapping in one diagonal pile, the main action must read at thumbnail size, one flat light-grey capsule as the only ground shadow, under the whole group.` |

**Para folha de sprites, três exigências valem mais que o resto:** a mesma
escala em toda célula, a mesma paleta em toda célula e a margem igual. É onde o
gerador escorrega, e é o que quebra a animação no jogo.

## 6. A paleta

O registro é **cor saturada e clara, poucas por figura, sobre branco**. As
referências andam por aqui:

| Papel | Valor |
|---|---|
| acento quente | `#FF4B4B` vermelho · `#FF9600` laranja · `#FFC800` amarelo |
| acento frio | `#1CB0F6` azul · `#CE82FF` roxo · `#FF86D0` rosa |
| verde-assinatura | `#58CC02` / `#89E219` — **troque** pela cor de acento do projeto |
| neutro escuro | `#4B4B4B` grafite · `#3C3C3C` cabelo — **nunca preto puro**, exceto a pupila |
| neutro claro | `#E5E5E5` · `#F7F7F7` · branco |
| pele | tons chapados de faixa larga, do mais claro ao mais escuro, **sem sombra** |

**Cada figura usa três ou quatro cores mais a pele e o cabelo.** A sombra de uma
área é a mesma matiz cerca de 12 % mais escura e um pouco mais saturada.

## 7. Três regras que valem sempre

1. **Nada de chão, sombra ou cenário grudado no personagem.** O fundo é
   desenhado em `Graphics`; PNG com chão próprio cria emenda visível. A cápsula
   cinza de sombra só existe na capa, e só debaixo do grupo inteiro.
2. **Nada de interface dentro do PNG** — moldura, botão, número, estrela, balão,
   seta e brilho de estado mudam a cada toque e ficam no `Graphics`.
3. **Aqui quem salva o pequeno é a silhueta, não o traço.** Não existe contorno
   para segurar a figura a 40 px reais: o que segura é **a forma grande, a cor
   saturada e o vão entre as extremidades**. Por isso a pose tem de ser legível
   de longe, e por isso a ficha em `Graphics` precisa de fundo claro e sólido
   atrás — sem contorno, figura clara sobre fundo claro some.

Se o gerador não entregar transparência, peça sobre magenta `#FF00FF` chapado e
remova a cor. Fundo branco é pior: branco é a cor do olho, do dente e de metade
das camisas desta linha.
