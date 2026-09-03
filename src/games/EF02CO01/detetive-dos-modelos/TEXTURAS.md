# Detetive dos Modelos — prompts das texturas

Destino: `src/assets/games/EF02CO01/detetive-dos-modelos/`

Documento irmão: [PLANEJAMENTO.md](./PLANEJAMENTO.md)

Este jogo tem pouca textura. Veículos e a detetive precisam de identidade
visual; cartões, bandeja, HUD, água, trilho, oficina, cadeado, selos e
pictogramas são desenhados em `Graphics`.

---

## 1. Arquivos entregues

| Arquivo | Grade | Tamanho | Uso |
|---|---|---|---|
| `veiculos.png` | 4 × 3 | 1024 × 768 | 12 veículos, quadro de 256 × 256 |
| `detetive.png` | 1 × 4 | 500 × 2000 | a mascote, quadro de 500 × 500 |
| `bg-ceu.png` | — | 1672 × 941 | fundo do cartão CÉU |
| `bg-asfalto.png` | — | 1672 × 941 | fundo do cartão ESTRADA |
| `cover-detetive-dos-modelos.png` | — | 1431 × 940 | capa do catálogo |

`detetive.png`, `bg-ceu.png` e `bg-asfalto.png` **não estavam no pedido
original** — o TEXTURAS pedia céu e estrada em Graphics e não previa mascote.
Os três entraram no jogo; ver §13 do PLANEJAMENTO.

**A ordem dos quadros é contrato com o código.** O Phaser lê da esquerda para a
direita e de cima para baixo.

### `veiculos.png`

| Quadro | Veículo | media | motor | rodas |
|---|---|---|---|---|
| 0 | avião | air | sim | sim |
| 1 | carro | land | sim | sim |
| 2 | barco | water | não | não |
| 3 | bicicleta | land | não | sim |
| 4 | helicóptero | air | sim | não |
| 5 | ônibus | land | sim | sim |
| 6 | lancha | water | sim | não |
| 7 | foguete | air | sim | não |
| 8 | barco a vela | water | não | não |
| 9 | patinete | land | não | sim |
| 10 | trem | rail | sim | sim |
| 11 | hidroavião | air + water | sim | não |

### `detetive.png`

| Quadro | Pose | Quando aparece |
|---|---|---|
| 0 | com a lupa no olho | esperando a criança escolher |
| 1 | mão no queixo, pensativa | no erro |
| 2 | sorrindo | no acerto |
| 3 | comemorando, levantando o chapéu | no fim da fase |

---

## 2. Estilo comum

```
flat 2D cartoon vehicle illustration, first-grade and second-grade educational game
asset, simple toy-like shape, bold readable silhouette, thick dark outline, flat
colors, minimal detail, no brand, no text, transparent background
```

## 3. Negativo comum

```
3D render, realistic, photorealistic, hyperdetailed, complex mechanical details,
brand logo, license plate, text, letters, numbers, words, watermark, signature, frame,
border, grid lines, UI panel, button, checkmark, x mark, cropped, cut off, white
background
```

Nada de letras, números, placas ou marcas nos veículos.

## 4. Paleta

| Uso | Hex |
|---|---|
| contorno | `#1F2A37` |
| avião | `#4DA3FF` |
| carro | `#FF6B6B` |
| barco | `#2DD4BF` |
| bicicleta | `#F59E0B` |
| helicóptero | `#8B5CF6` |
| ônibus | `#FACC15` |
| lancha | `#06B6D4` |
| foguete | `#EF4444` |
| barco a vela | `#34D399` |
| patinete | `#A3E635` |
| trem | `#64748B` |
| hidroavião | `#60A5FA` |

## 5. Prompt do `veiculos.png` — 1024 × 768, grade 4 × 3

```
Sprite sheet with 12 frames in a strict 4-column by 3-row grid, every frame exactly
256 by 256 pixels, transparent background.

Twelve toy-like vehicles for a children's educational game. Each vehicle is centered,
large, full object visible, same scale, side or three-quarter view, thick dark outline
#1F2A37, flat colors, very simple shapes. Attributes must be easy to read at small
size: wings, wheels, propeller, sail, rails or boat hull clearly visible. No brands,
no text, no letters, no numbers.

Frames, left to right then top to bottom:
1. airplane, blue #4DA3FF, clear wings and small wheels.
2. car, red #FF6B6B, four wheels.
3. simple boat, teal #2DD4BF, hull only, no sail, no wheels.
4. bicycle, orange #F59E0B, two large wheels, no motor.
5. helicopter, purple #8B5CF6, top rotor, no wings.
6. bus, yellow #FACC15, many windows as simple blank shapes, wheels.
7. speedboat, cyan #06B6D4, motor at back, water vehicle silhouette.
8. rocket, red #EF4444, fins and flame shape, no wheels.
9. sailboat, green #34D399, sail and hull, no motor.
10. scooter, lime #A3E635, handlebar, two small wheels, no motor.
11. train, slate #64748B, front engine, wheels aligned, small rail hint under it.
12. seaplane, light blue #60A5FA, wings plus floating pontoons.

[estilo comum] [negativo comum]
```

## 6. O que fica em Graphics

| Elemento | Como é desenhado |
|---|---|
| água | forma azul com quatro fileiras de ondas |
| trilho | dormentes e dois trilhos paralelos |
| oficina sem motor | bancada verde com brilho |
| NÃO COMBINA | cartão cinza com círculo proibido |
| nuvens e arco de voo do CÉU | por cima da foto |
| faixas brancas da ESTRADA | por cima da foto |
| pictogramas | asa, roda, motor, água, trilho e estrada |
| cartões, bandeja, HUD, cadeado, dedo, poeira | tudo |

**As duas fotos entram recortadas dentro do cartão**, com máscara geométrica. O
céu é ampliado 1,6× e empurrado 70 px para baixo: a silhueta de cidade no pé da
imagem aparecia como uma listra colorida sob a plaquinha do cartão. O asfalto é
ampliado 1,15× e recebe um véu branco de 12% para não ler como cartão desligado.

## 7. Sons

Sem arquivos. Tudo sintetizado em WebAudio, respeitando `mute-audio`:

| Som | Síntese |
|---|---|
| toque | seno curto |
| pegar veículo | pop com pitch ascendente |
| enviar | ruído filtrado subindo |
| voo | ruído filtrado longo + seno subindo |
| estrada | pulso grave + ruído baixo |
| água | ruído descendente + seno |
| sem motor | dois senos curtos |
| erro | dois quadrados graves descendo |
| fim de fase | fanfarra de quatro notas |

## 8. Entrega

| | |
|---|---|
| Formato | PNG-24 |
| Transparência | canal alfa real em `veiculos.png` e `detetive.png` |
| Recorte | grade exata, sem sangria entre quadros |
| Sem | texto, número, marca, placa, moldura, linha de grade, interface |

## 9. O que ainda não existe

Nada bloqueante. O jogo roda com tudo que já está na pasta. Se um arquivo for
removido, `textures.exists()` cobre: o veículo vira uma forma em Graphics com o
nome escrito, a detetive vira um círculo, e os cartões de céu e estrada ficam só
com a cor de fundo e o desenho por cima.
