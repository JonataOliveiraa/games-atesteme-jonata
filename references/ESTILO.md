# Estilo de arte — bloco para colar em todo prompt de imagem

O estilo dos jogos novos são **duas imagens de referência, anexadas juntas em
toda geração**: a folha de figurinhas chibi e as tirinhas da personagem de
cabelo verde-azulado (`references/16-chibi-figurinhas.jpg` e
`references/17-chibi-tirinha.jpg`). O prompt começa mandando **usar os anexos
como referência de estilo** — o texto abaixo só descreve o que elas já mostram,
para o caso de o gerador ignorar o anexo.

Em uma frase: **chibi de figurinha** — traço limpo e de espessura uniforme,
`cel shading` chapado com um só tom de sombra, olhos enormes, paleta curta e
contorno branco de adesivo em volta da silhueta.

> **Linhas anteriores, que NÃO servem de referência:** cartoon com contorno de
> tinta (Guardião Ético, Mesa de Edição, Expedição Pixel), vetor chapado neon
> (Duelo das Fontes) e a pintura macia sem contorno usada no Revezamento em
> Lista. Arte já entregue naquele estilo continua valendo no jogo dela; quem
> começa agora usa este arquivo.

## Bloco de estilo (começa o prompt)

```
STYLE — USE THE ATTACHED IMAGES AS THE ART STYLE REFERENCE, and match their
rendering exactly: cute chibi sticker art; clean crisp line art of even weight
in a dark desaturated colour, never pure black; FLAT cel shading with ONE soft
shadow tone and no gradients; small chibi proportions, big head and little
body; big glossy expressive eyes with a bright highlight; tiny cartoon emotion
marks (small sparkles, a sweat drop, motion ticks); a short palette — one
strong accent colour over near-white and dark neutrals; a thin white sticker
keyline around the whole silhouette. Take ONLY the art style from the attached
images: do NOT copy their characters, their clothes, their poses, their scenes
or their framing.
```

**Cena inteira — fundo e capa — troca as duas últimas exigências:** sai o
`keyline` e entram `NO white sticker keyline here — this is a full scene, not a
sticker` e `crisp shapes, no painterly brushwork`. Adesivo é para o que tem
alfa; cenário com contorno branco vira figurinha colada na tela.

## Negativo mínimo (fecha o prompt)

```
DO NOT INCLUDE: text, letters, words, labels, digits, numbers, captions,
watermark, logo, title lettering, user interface, buttons, panels, frames,
speech bubbles, arrows, icons, stars, HUD, question mark button,
painterly lineless illustration, soft airbrushed gradients, heavy rendering,
western cartoon style, rough sketchy lines, uneven brush outlines, muddy
colours, 3D render, photorealistic, blur, lens flare, heavy noise,
grid lines, visible sprite-sheet borders, cell borders, gaps, cropped edges,
drop shadow on the cell, white backing in transparent assets,
sad faces, crying, angry faces, scolding adults, pointing at the viewer.
```

## O que trocar por tipo de arquivo

| Tipo | Linha extra |
|---|---|
| Personagem solto | `Full body, neutral friendly pose, single character alone, isolated on a transparent background, no ground shadow.` |
| Busto | `Head and shoulders only, centred, transparent background, no shadow.` |
| Folha de sprites | `Sprite sheet, N columns by M rows, 256x256 px per cell, same character at the same scale and lighting in every cell, transparent background, no grid lines drawn.` |
| Cenário | `Wide background illustration, 16:9, no characters in the centre, calm low-contrast areas where game elements will sit.` |
| Capa | `Cover illustration; the main action must read at thumbnail size.` |

## Três regras que valem sempre

1. **Nada de chão, água, sombra ou cenário grudado no personagem.** O fundo é
   desenhado em código; PNG com chão próprio cria uma emenda visível.
2. **Nada de interface dentro do PNG** — moldura, botão, número, estrela, balão,
   seta e brilho de estado mudam a cada toque e ficam no `Graphics`.
3. **O traço é que salva o pequeno.** Com contorno e `keyline`, a figura de
   40 px reais se destaca sozinha: a ficha em `Graphics` pode ter borda fina e
   fundo claro. Sem traço — a linha antiga — ela precisava de borda grossa e
   sombra para não sumir.

Se o gerador não entregar transparência, peça sobre magenta `#FF00FF` chapado e
remova a cor. Fundo branco é pior: branco é cor de dente, de touca e de camisa —
e agora também é a cor do `keyline`.
