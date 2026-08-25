# Investigação: Dados em Risco — Planejamento

**EF03CO09** · 3º ano · Cultura Digital · Segurança e responsabilidade no uso da tecnologia
*Reconhecer o potencial impacto do compartilhamento de informações pessoais ou de seus pares em meio digital.*

---

## 1. A ideia em uma frase

**Uma mensagem já foi postada. A criança toca no pedaço que não devia estar ali — e vê quem passou a saber aquilo.**

O impacto não é explicado, é mostrado: cada dado exposto acende um bando de desconhecidos olhando. É a coisa que a habilidade pede ("potencial impacto") virada em imagem.

## 2. Um gesto só: tocar

Sem arrastar, sem digitar, sem menu. A mensagem aparece grande no centro, quebrada em pedaços tocáveis. Tocar num pedaço perigoso:

1. o pedaço é **tarjado** na hora (borda âmbar + selo de perigo)
2. sobem **desconhecidos** do rodapé, um por um — quantos, é o tamanho do risco
3. um cartão diz a consequência em uma linha: *"Com o endereço, um estranho sabe onde você mora."*

Tocar num pedaço inofensivo custa −5 e o jogo diz por que ele é seguro. Explorar tem preço baixo, e a mensagem nunca some.

## 3. Os três níveis

| | O que a criança faz | O que aprende |
|---|---|---|
| **N1** | Uma mensagem, **um** dado exposto. Acha e toca. | Existe informação que não se posta |
| **N2** | Uma mensagem, **três** dados expostos, com impactos diferentes. Acha os três (contador `2 de 3`). | Um post pode vazar várias coisas, e cada uma pesa diferente |
| **N3** | **Duas versões** da mesma mensagem, lado a lado. Toca na que pode ir para a internet. | Dá para contar a mesma coisa sem se expor |

O N3 é a prevenção que a ficha pede, sem construtor de plano: as duas versões dizem a mesma novidade, só uma entrega dado pessoal. Escolher já é o plano.

### Os nove casos

**N1 — um erro evidente**

| # | Mensagem | Dado exposto | Impacto |
|---|---|---|---|
| 1.1 | "Oi! Meu nome é Lia e eu moro na **Rua das Flores, 42**." | endereço | um estranho sabe onde você mora |
| 1.2 | "Ganhei um celular! Meu número é **9 9999-1234**, me liga!" | telefone | qualquer pessoa pode te ligar |
| 1.3 | "Estou na **Escola Vila Nova**, saio às **17h** todo dia." | escola + horário | dá para te esperar na saída |

**N2 — três pontos de exposição na mesma mensagem**

| # | Mensagem | Os três |
|---|---|---|
| 2.1 | Post de aniversário | endereço da festa · telefone da mãe · foto do prédio |
| 2.2 | Post de viagem | "ficamos fora a semana toda" · nome do hotel · placa do carro |
| 2.3 | Post do amigo (dado **dos pares**) | nome inteiro do colega · escola dele · foto sem permissão |

O caso 2.3 é o único sobre dado de **outra pessoa**, e é de propósito: a habilidade diz "ou de seus pares", e é a parte que as crianças nunca pensam.

**N3 — qual pode ir para a internet**

| # | Versão A | Versão B | O que separa |
|---|---|---|---|
| 3.1 | "Ganhei uma bicicleta! Moro na Rua X, 42, vem ver" | "Ganhei uma bicicleta! Depois te mostro na escola" | combina em pessoa, não pelo endereço |
| 3.2 | "Meu cachorro sumiu, me liga: 9 9999-1234" | "Meu cachorro sumiu, avisa a minha mãe se achar" | adulto no meio, não o número da criança |
| 3.3 | "Olha a foto do Téo dormindo na aula 😂" | "Olha o desenho que eu fiz hoje" | não expõe o colega |

## 4. Pontos e erro

| Evento | Pontos |
|---|---|
| Achar um dado exposto | **+20** |
| Escolher a versão segura (N3) | **+20** |
| Tocar num pedaço inofensivo | −5 |

Sem cronômetro e sem game over. Fim de nível dá o **selo de investigador digital**, que é a recompensa que a ficha pede.

**O jogo nunca diz "errado".** Tocou num pedaço seguro, ele responde o que aquilo é: *"'Ganhei uma bicicleta' não conta nada sobre você. Pode postar."*

## 5. A tela

```
┌──────────────────────────────────────────────────────────┐
│ HUD   nível · progresso · caso                    ?       │  10–94
├──────────────────────────────────────────────────────────┤
│  ┌ MENSAGEM ────────────────────────────────────┐        │
│  │  ▣ de: Lia                                   │ 120–430 │
│  │  "Oi! Eu moro na [Rua das Flores, 42] ."      │        │
│  └──────────────────────────────────────────────┘        │
│  ┌ IMPACTO ─────────────────────────────────────┐        │
│  │  Com o endereço, um estranho sabe onde...    │ 450–560 │
│  └──────────────────────────────────────────────┘        │
│   QUEM PASSOU A SABER   ? ? ? ? ?                 580–700 │
└──────────────────────────────────────────────────────────┘
```

No N3 a faixa de impacto sai e as duas mensagens ocupam 120–560, lado a lado, 560×420 cada.

**Alvo de toque**: cada pedaço da mensagem é uma pastilha de no mínimo 60 px de altura. Pedaço de uma palavra só ganha padding para não virar alvo pequeno.

## 6. Texturas — 5 arquivos

Painel, balão, cartão, HUD e contador ficam em `Graphics`. Só vira PNG o que é desenho de objeto.

Todas **350×350, fundo transparente, ≤ 80 KB**, exceto o cenário. Estilo chibi achatado — **nada de render 3D**.

**Estilo comum (colar em todo prompt):**
```
flat 2D cartoon illustration, chibi style, very simple shapes, minimal detail,
bold clean silhouette, thick soft rounded outline, flat colors with a single soft
shadow, even lighting, no gradients, kids educational game asset
```

**Negativo comum:**
```
3D render, 3d, octane, blender, glossy plastic, shiny, specular highlight, realistic
lighting, photorealistic, hyperdetailed, intricate, busy, cluttered, noise, sparkles,
glow, gradient mesh, text, letters, numbers, words, watermark, frame, border, background
```

| # | Arquivo | Tamanho | Prompt |
|---|---|---|---|
| 1 | `bg-investigacao.png` | 1280×720 opaco, ≤400 KB | *(estilo comum)* — a calm children's detective office seen from the front: a dark blue-grey wall `#1b2333`, a wooden desk edge along the very bottom, a small desk lamp in the top left corner and a stack of folders in the bottom right corner. **The entire center is completely empty** — plain flat wall, nothing pinned, no papers, no screens, no phone, no monitor. |
| 2 | `estranho.png` | 350×350 | *(estilo comum)* — a simple cartoon avatar of an unknown person: a plain grey rounded silhouette of head and shoulders `#8ea3bd`, with a single white question mark shape on the face area, flat colors, neutral, **not scary, not a hacker, no hoodie, no mask**. |
| 3 | `selo-perigo.png` | 350×350 | *(estilo comum)* — a simple round sticker badge in amber `#f59e0b` with a thick white exclamation mark centered, gently scalloped edge, flat color, one soft shadow. |
| 4 | `selo-seguro.png` | 350×350 | *(estilo comum)* — a simple cartoon shield in green `#22c55e` with a thick white check mark centered, rounded corners, flat color, one soft shadow. |
| 5 | `selo-investigador.png` | 350×350 | *(estilo comum)* — a simple cartoon detective badge: a rounded gold star `#f0bc59` on a blue circular plate `#3b82f6`, with a tiny magnifying glass shape in the middle, flat colors, one soft shadow. |

**`estranho.png` não pode ser assustador.** Ele aparece cinco vezes na tela quando o dado vaza, e a lição é *"gente que você não conhece passou a saber"*, não *"um bandido vem te pegar"*. Silhueta neutra, cinza, sem capuz e sem máscara — medo não ensina, e o assunto já é delicado o bastante.

## 7. Estrutura

```
src/games/EF03CO09/investigacao-dados-risco/
├── index.ts · types.ts
├── data/    theme.ts · layout.ts · casos.ts
└── scenes/  BootScene.ts · GameScene.ts · effects.ts
```

Mesmo padrão de três camadas dos outros. Dois formatos de caso num arquivo só:

```ts
type CaseKind = 'achar' | 'escolher'

interface Chunk {
  id: string
  text: string
  risky: boolean
  /** Só quando `risky`. A frase do cartão de impacto. */
  impact?: string
  /** Quantos desconhecidos sobem. 3 a 6, conforme o peso. */
  watchers?: number
  /** Quando não é `risky`: por que este pedaço pode ser postado. */
  safe?: string
}
```

`achar` traz um `chunks: Chunk[]`; `escolher` traz dois e um `safeIndex`. Nada além disso.
