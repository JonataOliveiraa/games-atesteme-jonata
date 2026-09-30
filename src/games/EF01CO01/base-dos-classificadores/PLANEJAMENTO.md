# Base dos Classificadores — planejamento

EF01CO01 · 1º ano · organizar objetos por características, explicitando
semelhanças (padrões) e diferenças.

Refeito em 04/09/2026. **Os 3 níveis estão prontos** (o N3 entrou em 30/09/2026).

## O problema que motivou o remake

No jogo antigo a base **carregava cor no corpo**. Quando a rodada pedia forma,
a criança via uma caixa vermelha e uma regra de triângulo e não tinha como
saber qual das duas mandava — ela ficava procurando um triângulo vermelho.

O conserto não é de arte, é de desenho:

- **o cesto é neutro** — palha e folha, nenhuma das três cores das pedras,
  nenhuma forma desenhada nele;
- **quem diz a regra é a placa** acima do cesto, e ela mostra **três exemplos
  que variam em tudo, menos no critério**.

Regra VERMELHO: círculo vermelho, quadrado vermelho, triângulo vermelho —
*qualquer forma, desde que vermelha*. Regra TRIÂNGULO: triângulo azul,
triângulo amarelo, triângulo vermelho — *qualquer cor, desde que triângulo*.

Isso é exatamente o verbo da habilidade: o padrão fica visível porque tudo o
que não é o padrão está variando na frente da criança.

`ruleExamples()` em `data/levels.ts` gera esses três exemplos a partir do
critério e do valor — a placa nunca é escrita à mão.

## Cenário

Uma clareira de floresta. As pedras descansam num tronco caído, os cestos
ficam na grama, e duas vinhas balançam nas laterais. As pedras nunca ficam
soltas no gramado: o tronco é a superfície de leitura delas.

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

Os três níveis estão implementados. Cada um estreia **uma** característica:
cor, forma e tamanho.

**N1 — um critério só: COR.** Três fases. A forma varia de propósito em toda
pedra, para a criança aprender a ignorá-la; o tamanho fica constante, porque
ele ainda não é critério.

O jogo inteiro usa **só três cores: vermelho, azul e amarelo** (pedido do
usuário, 29/09/2026). São 3 fases por nível, até 6 pedras por fase, e no máximo
3 cestos de cor.

1. dois cestos (vermelho, azul), seis pedras
2. três cestos (vermelho, azul, amarelo), seis pedras
3. os mesmos três cestos em **outra ordem** (amarelo, vermelho, azul), para a
   fase não ser vencida de memória

**N2 — dois critérios, um por fase: COR e FORMA.** Três fases, alternando.
É aqui que a placa deixa de ser enfeite: a criança tem que olhar para ela em
toda fase, porque o que valia na anterior não vale mais.

1. forma: círculo, quadrado, triângulo
2. cor: azul, amarelo, vermelho
3. forma: quadrado, retângulo, triângulo. Quadrado e retângulo na mesma fase
   são o par difícil. Com 3 cores, o par difícil de cor deixou de existir.

`validateLevels` (no import, `console.error` em dev) cobra:
- só as 3 cores;
- até 6 pedras;
- até 3 cestos de cor;
- cada pedra com exatamente 1 cesto, e cada cesto com pelo menos 1 pedra;
- o N1 só com cor;
- do N2 em diante, a regra alternando de uma fase para a outra;
- o tamanho como critério só no N3, que o estreia na 1ª fase;
- o tamanho **constante** (médio) nos níveis que não o usam como critério;
- **nada entrega a regra**: um cesto com 2 pedras ou mais recebe pedras que
  variam em todo atributo que não é o critério (cor e forma, e também o
  tamanho no N3).

Quando o critério muda de uma fase para a outra, **e também na virada de um
nível para o outro**, as placas piscam uma a uma e a faixa diz *"A regra mudou:
olhe a FORMA!"* (ou *"olhe o TAMANHO!"*). Se é a primeira vez no nível, a
demonstração vem logo depois. Sem esse aviso a criança começa
a fase nova jogando com a regra velha e perde vida por uma troca que ninguém
contou para ela.

Com quatro cestos, cesto e placa encolhem (`BASKET.compact`, `SIGN.compact`):
sem isso as placas vizinhas encostariam.

**N3 — o terceiro critério: TAMANHO.** Três fases, alternando como no N2. Nos
níveis anteriores toda pedra é média. Aqui o tamanho varia em **todas** as
fases, e na fase de forma ele vira o que a criança tem de ignorar.

1. tamanho: pequena e grande, com a cor e a forma variando
2. forma: triângulo, círculo e quadrado, em três tamanhos misturados
3. tamanho: grande, pequena e **média**. A média é o par difícil, como o
   quadrado × retângulo do N2.

As pedras usam `SIZE_SCALE` (0,72 · 1,02 · 1,3). A placa usa uma escala mais
separada, `SIGN_SIZE_SCALE` (0,6 · 0,98 · 1,38), e um espaço maior entre os
exemplos (`SIGN.sizeGap`). Com a escala das pedras, os exemplos de 48 px
deixavam o grande e o médio a 11 px um do outro, parecidos demais.

Ficaram de fora a regra que vira no meio da fase e o cesto de exceção, da nota
antiga. Junto com o tamanho, seriam três novidades no mesmo nível.

## Texturas

Quatro arquivos, descritos em `TEXTURAS.md`. As doze do jogo antigo continuam
na pasta e **não são carregadas** — a `BootScene` tem uma lista `WANTED`, senão
o `import.meta.glob` puxaria 18 MB de arte morta.

`formas.png` vem quase branca e é tingida por código: é o que permite três
cores com quatro quadros.

## Histórico

- **29/09/2026, só 3 cores e o N2 revisto (pedido do usuário).** *"faça ter
  cores apenas AZUL, VERMELHO e AMARELO. adicione nível 2"*.
  - Verde e roxo saíram de tudo: tipo `Color`, `COLOR_LABEL`, tema e fases.
  - O N1 ficou com 3 fases de cor; a 3ª repete as 3 cores com os cestos em
    outra ordem.
  - O N2 ficou com 3 fases (forma → cor → forma). O par difícil agora é só o de
    forma (quadrado × retângulo), e a fase de 4 cestos saiu.
  - Entrou o `validateLevels`.
  - A passagem N1 → N2 já existia (`autoAdvance`), e o N2 é o último nível,
    então aprova. As linhas de tempo esgotado da GameScene não foram tocadas.
- **30/09/2026, o N3 (pedido do usuário: "faça o n3").**
  - Entrou o N3, com o tamanho como critério (tamanho → forma → 3 tamanhos).
  - A regra nova também é anunciada na virada de nível. Antes, só entre fases.
  - A frase de troca ganhou o artigo certo: *olhe o TAMANHO*.
  - `validateLevels` passou a cobrar que nenhum cesto receba só pedras
    iguais num atributo que não é o critério.
  - O N2 deixou de ser o último: agora ele avança sozinho para o N3, e é o N3
    que aprova.
