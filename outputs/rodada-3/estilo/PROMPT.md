# Prompt — calibração de estilo da 3ª rodada

Imagem gerada com a ferramenta integrada de geração de imagens, usando
`references/19-chibi-figurinhas.jpg` apenas como referência de estilo.

```text
Use case: stylized-concept
Asset type: calibration sprite sheet for a Phaser 3 educational game for Brazilian children aged 6–7.
Input image: references/19-chibi-figurinhas.jpg is a STYLE REFERENCE ONLY. Match its cute chibi sticker rendering, but do not copy or reproduce any character, costume, pose, composition, symbols, or other content from the reference.

Primary request: Create ONE exact 4 columns × 1 row sprite sheet on a 2048 × 512 px transparent canvas. Each cell is exactly 512 × 512 px. Show the SAME full-body child astronaut protagonist once in every cell, at identical scale and consistent design. The child is 6–7 years old, gender-neutral presentation, medium-brown skin, short dark curly hair visible inside the helmet, and a friendly rounded face. The spacesuit is simple near-white with a short palette of turquoise and warm orange accents; boots and gloves are simple and child-friendly. The astronaut helmet is worn in every pose with the clear visor OPEN, leaving the entire face unobstructed.

Exact cell order from left to right:
1. standing calmly, relaxed friendly posture, arms naturally at the sides, gentle confident smile;
2. pointing clearly sideways with one arm, guiding pose, bright encouraging expression, NOT pointing at the viewer;
3. celebrating while jumping, both feet visibly off the ground, arms raised, huge joyful smile, energetic motion ticks kept inside the cell;
4. surprised and mildly worried, leaning back slightly, wide glossy eyes, small sweat drop, hands close to the chest; concerned but not sad, crying, terrified, or distressed.

STYLE — match the attached reference's rendering: cute chibi / kawaii anime sticker art; very large head and very small body; huge glossy expressive eyes with bright highlights; tiny nose and mouth; clean crisp line art of even weight in a dark desaturated navy colour, never pure black; SIMPLE artwork with few shapes and few details; FLAT cel shading with only ONE hard-edged shadow tone, no gradients; short cohesive palette; highly readable and very expressive pose and face; thin continuous white sticker keyline around the whole silhouette of each pose.

Composition and technical constraints: exact 4×1 horizontal sheet; every pose is full-body and entirely contained within its own 512×512 cell with at least 8% transparent margin on all sides, including helmet, boots, hands, keyline, emotion marks, and jump motion ticks; no pose may cross or overlap a cell boundary; same character identity, costume, proportions, line weight, lighting, and scale in all four cells; centered independently in each cell; genuinely transparent background; no ground plane and no ground shadow; no drawn grid lines, no visible sprite-sheet borders, no cell dividers, no white backing.

DO NOT INCLUDE: the cast or recognizable characters from the style reference; text, letters, words, labels, digits, numbers, captions, watermark, logo, title lettering; scenery, stars, planets, rockets, tools, props, flags; user interface, buttons, panels, frames, speech bubbles, arrows, icons, HUD, question mark button; closed or tinted visor; realistic adult anatomy; complex mechanical suit details; painterly lineless illustration, soft airbrushed gradients, multiple shadow tones, heavy rendering, western cartoon style, rough sketchy lines, uneven brush outlines, muddy colours, 3D render, photorealism, blur, lens flare, heavy noise; gaps or white rectangles behind cells; cropped edges; drop shadows; sad faces, crying, angry faces, scolding adults, or pointing at the viewer.
```

## Pós-processamento técnico

A geração original saiu em 2172 × 724 px. As quatro regiões foram separadas,
redimensionadas com a mesma escala e centralizadas em células de 512 × 512 px,
preservando o canal alfa e uma margem mínima de 41 px (8%) em cada célula. Não
houve alteração criativa do desenho.
