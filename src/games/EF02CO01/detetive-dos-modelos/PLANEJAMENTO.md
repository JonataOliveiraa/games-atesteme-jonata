# Detetive dos Modelos — EF02CO01

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Jogo de teste de modelos para 2º ano: a criança pega um veículo, escolhe um
lugar e **vê o cenário abrir** para descobrir se ele funciona ali.

O briefing original de mistério point-and-click foi simplificado. Sala cheia com
8 a 12 brinquedos, prancheta, lupa, balões e montagem de modelo viraria leitura
e busca visual demais para crianças de 7 anos. O que ficou é direto e divertido:
**veículo + lugar + cena mostrando o resultado**.

Também não usamos arrastar como controle. Para manter a sensação de "pegar e
soltar" sem exigir precisão no celular, o gesto é:

```
toque no veículo → ele levanta, brilha, e os lugares acendem
toque no lugar   → o cenário abre e ele tenta funcionar lá
```

É sempre toque, com alvos grandes.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF02CO01)** Criar e comparar modelos (representações) de objetos,
> identificando padrões e atributos essenciais.

Objeto: **Modelagem de objetos**.

O teste da bolinha: **troque avião, carro, barco e bicicleta por bolinhas
coloridas sem significado. O jogo muda?**

Muda. O lugar representa um modelo: céu pede "voa", estrada pede "anda na
terra", água pede "flutua". Sem os atributos do veículo não há como decidir
onde ele funciona — e não há cena para mostrar.

| Campo | Valor no jogo |
|---|---|
| Código | `EF02CO01` |
| Ano | 2º ano |
| Unidade | Pensamento Computacional |
| Objeto | Modelagem de objetos |
| Evidência jogável | pôr o veículo num modelo e ver, na cena, se os atributos combinam |

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF02CO01: **Hangar dos Modelos**.

| Jogo | O que a criança faz | Diferença pedagógica |
|---|---|---|
| Hangar dos Modelos | Toca em todos os veículos que combinam com uma missão textual | Seleção de conjunto por filtro; a pergunta vem pronta |
| Detetive dos Modelos | Escolhe um veículo e vê o teste acontecer num cenário | Comparação por simulação; o modelo é o lugar |

## 3. O laço

```
um veículo aparece no disco de teste
→ os lugares-modelo estão sempre na tela
→ toque no veículo: ele levanta e os lugares acendem em verde
→ toque no lugar: O CENÁRIO ABRE EM TELA CHEIA
→ o veículo entra e tenta funcionar ali
→ deu certo: atravessa a cena inteira, e um ✓ verde fecha
→ deu errado: cai, trava ou afunda, e um ✗ vermelho mostra o atributo que faltou
→ o cenário fecha; o veículo vai para o álbum ou volta para o disco
```

**O cenário aberto é o coração do jogo.** É ali que a comparação acontece na
frente da criança: o barco navegando no mar é verdade, o carro no mar afunda. O
tabuleiro só serve para escolher.

| Lugar | Cenário | Acerto | Erro |
|---|---|---|---|
| CÉU | `bg-ceu.png` em tela cheia | atravessa subindo | sobe, engasga e **cai** com poeira |
| ESTRADA | `bg-asfalto.png` | atravessa levantando poeirinha | anda um pouco, **trava** e tomba |
| ÁGUA | `bg-mar.png` | navega balançando | **afunda** soltando bolhas |

## 4. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`.

| Faixa | y | Conteúdo |
|---|---|---|
| HUD | 8 – 76 | 3 selos de caso, `CASO x de y`, botão `?` |
| Lugares-modelo | 123 – 373 | 2 ou 3 cartões de 336 × 250 |
| Disco de teste | 410 – 604 | a detetive à esquerda, o veículo no disco e o nome dele |
| Álbum | 610 – 728 | bandeja com um slot por veículo da fase |

O cenário aberto ocupa a tela inteira, por cima de tudo.

## 5. Níveis e fases

**Só existe o nível 1**, conforme a regra de teste do
[INSTRUCOES.md](../../INSTRUCOES.md). São 3 fases de 3 veículos.

| Fase | Veículos | Lugares |
|---|---|---|
| 1.1 | avião, carro, helicóptero | céu / estrada |
| 1.2 | barco, bicicleta, lancha | água / estrada |
| 1.3 | barco a vela, foguete, ônibus | céu / água / estrada |

**Cada veículo tem exatamente um lugar certo na sua fase.** Existiu um cartão
`NÃO COMBINA` para os casos sem resposta; ele **saiu a pedido**, e com razão:
num jogo cuja graça é ver o teste acontecer, pedir que a criança escolha
"nenhum" é pedir que ela abra mão da cena. Sem lugar certo não há nada para
mostrar.

## 6. As regras, em código

O veredito nasce da comparação entre atributos do veículo e regra da zona, em
`data/vehicles.ts`. **A resposta nunca fica guardada no veículo da fase**: o
mesmo veículo é certo numa zona e errado noutra, dependendo do que está na tela.

```ts
matchesZone(vehicle, zone)
  medium → vehicle.media.includes(zone.medium)
  motor  → vehicle.hasMotor === zone.hasMotor
  wheels → vehicle.hasWheels === zone.hasWheels
```

Pontuação: **+10** de primeira, **+5** depois da TRAVA. **Nenhum número na tela.**

## 7. O erro

O erro ensina atributo, não diz "errado":

1. o cenário abre e o veículo **tenta**, e falha de um jeito que se entende — o
   carro no céu sobe, engasga e cai; o carro no mar afunda; o barco na estrada
   trava e tomba;
2. um ✗ vermelho fecha a cena com **o pictograma do atributo que faltou**,
   riscado, e uma frase de no máximo quatro palavras;
3. de volta ao tabuleiro, o cadeado desce sobre o cartão errado;
4. a detetive fica pensativa e repete o pictograma;
5. o veículo volta ao disco;
6. depois de **2 erros no mesmo veículo**, o cartão certo pulsa.

Custa uma vida (`WRONG_ANSWER` + `lives.lose()`), e quem reprova é o
`shared/hud/createLives` no zero — nunca o jogo.

## 8. A detetive

`detetive.png` tem quatro poses, e cada uma tem um momento:

| Pose | Quadro | Quando |
|---|---|---|
| lupa | 0 | esperando a criança escolher |
| pensativa | 1 | erro, junto com o pictograma do atributo |
| sorrindo | 2 | acerto |
| comemorando | 3 | fim da fase |

Ela é o único lugar do tabuleiro onde entra frase, e são frases de três ou
quatro palavras dentro de um balão com rabinho.

## 9. Tutorial

Quatro passos curtos pelo `shared/tutorial/createTutorial`, com holofote e dedo:
ver o veículo, tocar nele, tocar no lugar, ver funcionar. Abre uma vez
(`once: true`) e o botão `?` reabre.

## 10. Textura

Todo consumo passa por `textures.exists()` — sem `veiculos.png` o jogo desenha
um veículo simples em Graphics, e sem os fundos o cenário abre numa cor chapada.
O jogo continua jogável em qualquer caso.

| Elemento | Fonte |
|---|---|
| 12 veículos | `veiculos.png`, grade 4 × 3 de 256 × 256 |
| a detetive | `detetive.png`, 4 quadros de 500 × 500 na vertical |
| cenário do céu | `bg-ceu.png`, tela cheia |
| cenário da estrada | `bg-asfalto.png`, tela cheia |
| cenário do mar | `bg-mar.png`, tela cheia |
| céu de fundo do tabuleiro | `bg-ceu.png` |
| cartões, disco, bandeja, HUD, cadeado, pictogramas, partículas | Graphics |

**As três fotos são de cenário, não de cartão.** Elas entraram primeiro como
recorte dentro dos cartõezinhos de 336 × 250, com máscara geométrica — 12 MB de
textura para preencher dois retângulos pequenos, e o asfalto ficava lendo como
cartão desligado. Os cartões passaram a ser desenhados, e as fotos foram para o
lugar onde valem: a cena em tela cheia.

## 11. Se for mexer, leia isto

**Este jogo não usa `FX.wait`. Use `pause()` de `scenes/timing.ts`.** No jogo
Passe da Mensagem o `FX.wait` — que marca tempo pelo relógio da cena — nunca
resolvia, e o `await` congelava a partida sem uma linha no console. A causa não
foi confirmada dentro do `shared/effects/FX`, então aqui a espera nasceu em
tween desde o começo. `settled()` protege as animações pelo mesmo motivo: um
tween morto no meio não dispara `onComplete`.

**As zonas são recriadas a cada fase** (`createZones` em `startPhase`), porque
os modelos mudam de fase para fase.

**O cenário é criado e destruído a cada teste** (`playTest` em
`scenes/theatre.ts`). Ele não guarda estado; recebe a zona, o veículo e o
veredito, e devolve uma promessa que resolve quando a cena fecha.

## 12. Registro

- pasta: `src/games/EF02CO01/detetive-dos-modelos/`
- assets: `src/assets/games/EF02CO01/detetive-dos-modelos/`
- slug `detetive-dos-modelos`, id `053`, order `85`, ícone 🔎
- registrado em `catalog.ts`, `gameInstructions.ts` e em
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`

| Arquivo | Responsabilidade |
|---|---|
| `data/vehicles.ts` | os 12 veículos, `matchesZone` e o cenário de cada lugar |
| `data/levels.ts` | as fases e os lugares de cada uma |
| `data/layout.ts` | toda coordenada, na grade de 1280 × 720 |
| `scenes/theatre.ts` | **o cenário em tela cheia e a tentativa do veículo** |
| `scenes/zones.ts` | os cartões-modelo, o cadeado e o realce |
| `scenes/stage.ts` | fundo do tabuleiro, disco e a peça do veículo |
| `scenes/album.ts` | a bandeja e os slots resolvidos |
| `scenes/detective.ts` | a mascote e o balão de fala |
| `scenes/icons.ts` | pictogramas de atributo, cadeado, dedo e poeira |
| `scenes/timing.ts` | `pause()` e `settled()` |
| `scenes/GameScene.ts` | o laço, o erro e a conversa com a plataforma |

## 13. O que mudou na construção

- **O cenário em tela cheia substituiu a animação dentro do cartão.** Era a
  peça que faltava: a criança precisa **ver** o barco navegando e o carro
  afundando, e isso não cabe num retângulo de 336 px.
- **O cartão `NÃO COMBINA` saiu.** Ver §5.
- **As três fotos mudaram de função**, de textura de cartão para cenário. Ver §10.
- **A detetive não estava no briefing** — a arte chegou com quatro poses, e ela
  virou a voz do jogo.
- **A miniatura do atributo no HUD saiu.** O pictograma já está no canto de cada
  cartão e no veredito da cena; repeti-lo no topo era ruído.
- **A espera nasceu em tween** (`scenes/timing.ts`), pela razão da §11.
