# Base dos Classificadores — planejamento

EF01CO01 · 1º ano · organizar objetos por características, explicitando
semelhanças (padrões) e diferenças.

Refeito em 04/09/2026. **Níveis 1 e 2 prontos**; o 3 ainda não.

## O problema que motivou o remake

No jogo antigo a base **carregava cor no corpo**. Quando a rodada pedia forma,
a criança via uma caixa vermelha e uma regra de triângulo e não tinha como
saber qual das duas mandava — ela ficava procurando um triângulo vermelho.

O conserto não é de arte, é de desenho:

- **o cesto é neutro** — palha e folha, nenhuma das cinco cores das pedras,
  nenhuma forma desenhada nele;
- **quem diz a regra é a placa** acima do cesto, e ela mostra **três exemplos
  que variam em tudo, menos no critério**.

Regra VERMELHO: círculo vermelho, quadrado vermelho, triângulo vermelho —
*qualquer forma, desde que vermelha*. Regra TRIÂNGULO: triângulo azul,
triângulo amarelo, triângulo verde — *qualquer cor, desde que triângulo*.

Isso é exatamente o verbo da habilidade: o padrão fica visível porque tudo o
que não é o padrão está variando na frente da criança.

`ruleExamples()` em `data/levels.ts` gera esses três exemplos a partir do
critério e do valor — a placa nunca é escrita à mão.

## Cenário

Uma clareira de floresta. As pedras descansam num tronco caído, os cestos
ficam na grama, e duas vinhas balançam nas laterais. A pedra verde e a grama
são parentes de cor, e é por isso que as pedras nunca ficam soltas no gramado:
o tronco é a superfície de leitura delas.

## Tela (1280 × 720)

| faixa | y | o quê |
|---|---|---|
| header | 0–82 | nível, bolinhas de fase, barra de tempo, vidas, `?` |
| aviso | 112 | a única frase da tela |
| pedras | 236 | as peças a classificar |
| tronco | 292 | onde elas descansam |
| placas | 434 | a regra de cada cesto |
| cestos | 594 | os alvos |

A faixa de aviso é móvel fixo com conteúdo trocável: normalmente diz o que
fazer, e no erro vira âmbar com o motivo. Painel que aparece e some deixaria a
tela inquieta.

## Alvo de toque

Pedra: 148 px na grade de 1280, que dá 45 px reais num celular de 390 —
acima do piso de 44. Por isso a fase tem no máximo 6 pedras: sete não caberiam
numa linha só sem apertar o alvo.

A área de soltar do cesto é 250 × 230 e sobe até a placa, de propósito: soltar
em cima da placa conta como soltar no cesto.

## Tutorial: sem uma palavra

`createTutorial` exige `text` em todo passo, então ele não serve aqui — o
tutorial deste jogo é `scenes/demo.ts`, e não escreve nada.

O mundo escurece, só uma pedra e o cesto certo dela ficam acesos, e uma mão
aparece: toca a pedra, um anel pisca na pedra, **outro anel pisca na placa**
(é o batimento que diz "estas duas coisas combinam"), a pedra sobe, viaja em
arco até o cesto, o cesto abre, engole e brilha. A pedra volta para o lugar e
tudo acontece de novo. Duas voltas.

Roda uma vez por nível e volta pelo `?`. Um botão redondo com o símbolo de
avançar aparece no canto superior direito e corta a demonstração na hora.

O corte é uma corrida (`Promise.race`) entre cada trecho da animação e um
sinal de pulo, não uma flag conferida entre os passos: matar um tween do `FX`
deixa a Promise dele pendente para sempre, e esperar o trecho em curso acabar
daria até 800 ms de botão morto.

## Erro

Errar não é "tente de novo": o cesto faz a cara de recusa (quadro 3), a placa
dele acende com os três exemplos e a faixa diz o que ele aceita — *"Este cesto
só leva pedra VERMELHA."* A pedra volta sozinha para o tronco.

Soltar fora de qualquer cesto **não é erro**: a pedra volta e nada acontece.
Erro de mira não pode custar vida.

## Tempo

`createTimeBar` no header, com orçamento tirado dos dados: 12 s por pedra, ou
72 s numa fase de seis. A barra só avisa; quando zera, a fase recomeça limpa,
**sem tirar vida**. Perder vida no relógio viraria castigo por hesitar, e
hesitar é o que a criança faz enquanto compara.

## Níveis

Os níveis **1 e 2** estão implementados. O 3 não.

**N1 — um critério só: COR.** Três fases. A forma varia de propósito em toda
pedra, para a criança aprender a ignorá-la; o tamanho fica constante, porque
ele ainda não é critério.

1. dois cestos (vermelho, azul), seis pedras
2. três cestos (vermelho, azul, amarelo), seis pedras
3. três cestos (azul, amarelo, roxo) — o conjunto de cores muda, para a fase
   não ser vencida de memória

**N2 — dois critérios, um por fase: COR e FORMA.** Quatro fases, alternando.
É aqui que a placa deixa de ser enfeite: a criança tem que olhar para ela em
toda fase, porque o que valia na anterior não vale mais.

1. forma, três cestos
2. cor, três cestos
3. forma, quatro cestos — quadrado e retângulo na mesma fase, que é o par
   difícil de separar
4. cor, quatro cestos — azul e roxo juntos, o par difícil do outro critério

Quando o critério muda de uma fase para a outra, as placas piscam uma a uma e
a faixa diz *"A regra mudou: olhe a FORMA!"*. Sem esse aviso a criança começa
a fase nova jogando com a regra velha e perde vida por uma troca que ninguém
contou para ela.

Com quatro cestos, cesto e placa encolhem (`BASKET.compact`, `SIGN.compact`):
sem isso as placas vizinhas encostariam.

**N3, quando for feito:** tamanho como critério, regra que vira no meio da
fase e cesto de exceção.

## Texturas

Quatro arquivos, descritos em `TEXTURAS.md`. As doze do jogo antigo continuam
na pasta e **não são carregadas** — a `BootScene` tem uma lista `WANTED`, senão
o `import.meta.glob` puxaria 18 MB de arte morta.

`formas.png` vem quase branca e é tingida por código: é o que permite cinco
cores com quatro quadros.
