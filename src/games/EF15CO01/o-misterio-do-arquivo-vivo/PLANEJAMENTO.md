# O Mistério do Arquivo Vivo — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF15CO01 · 1º ao 5º ano · Pensamento Computacional · Organização e
representação da informação**

---

## 1. O jogo em uma frase

**Uma bagunça em cima, uma prateleira vazia embaixo. Toque numa coisa, toque
num buraco, e ela encaixa.**

Não tem mais nada. Uma estrutura por vez na tela, quatro ou cinco coisas soltas,
e o gesto é sempre o mesmo: **coisa → buraco**.

~~~text
 ●○○○○                                                 ?
────────────────────────────────────────────────────────────
              a bagunça (4 coisas soltas)

               🧸    🧸      🧸     🧸

────────────────────────────────────────────────────────────

     ┌────┐  ┌────┐  ┌────┐  ┌────┐      ← a prateleira,
     │ ▓▓ │  │    │  │    │  │    │        com os buracos
     └────┘  └────┘  └────┘  └────┘
       ▲ só o próximo buraco fica aceso
~~~

## 2. A habilidade, e o exemplo que eu tinha ignorado

> **(EF15CO01)** **Identificar** as principais formas de **organizar e
> representar a informação** de maneira estruturada (matrizes, registros,
> listas e grafos) ou não estruturada (números, palavras, valores verdade).

E o exemplo oficial da BNCC, que é de onde este jogo saiu:

> *"O professor pode pedir que os alunos **organizem um conjunto de
> personagens** por gênero, cor dos olhos, idade, **tamanho**, nacionalidade
> etc. Também pode sugerir que os alunos **organizem um conjunto de figuras
> geométricas por cor, por tipo de figura**, por tamanho das figuras etc."*

O verbo é **organizar**, e o exemplo entrega o conteúdo pronto: **pôr em ordem
de tamanho** e **cruzar tipo com cor**. É exatamente isso que a criança faz
aqui, sem nenhuma camada em cima:

| O que a BNCC diz | O que a criança faz | Que estrutura é |
|---|---|---|
| organizar por **tamanho** | põe quatro ursinhos do menor para o maior | **LISTA** — um depois do outro |
| organizar por **tipo e cor** | põe cada fichinha no cruzamento do bicho com a cor | **MATRIZ** — linha e coluna |

**Teste da bolinha:** troque os buracos por botões sem forma. O jogo muda?

Acaba. O que a criança lê é **o formato do lugar vazio**: uma fileira pede
ordem, uma grade pede duas coordenadas. Sem a forma do lugar não há o que
identificar — e a forma do lugar *é* a representação.

| Campo | Valor no jogo |
|---|---|
| Código | `EF15CO01` |
| Ano | 1º ao 5º |
| Unidade | Pensamento Computacional |
| Objeto | Organização e representação da informação |
| Evidência jogável | arrumar um mesmo conjunto dentro da estrutura, seguindo a regra que aquela estrutura impõe |

## 3. As três tentativas que morreram

Este documento já teve três versões, e as três foram descartadas pelo dono do
projeto. Elas ficam registradas porque o erro foi sempre o mesmo, e é fácil
repetir:

| Versão | O que era | Por que morreu |
|---|---|---|
| Estantes | a pista aparece, toque na estante certa | era o nível 2 do **Museu das Estruturas**, o jogo irmão |
| Corrida | escolha a rota e corra contra um rato | os toques depois da escolha não decidiam nada — quiz com animação por cima |
| Esteira | as coisas descem com etiqueta, toque no bicho certo | **quatro saltos de abstração**: o `1` pendurado significa ordem, ordem é lista, lista é a centopeia |

**O erro comum:** eu punha uma camada entre a criança e o conceito. Uma
estante que *representa* uma lista. Uma etiqueta que *significa* ordem. Nesta
versão não há camada: **a criança põe as coisas em ordem com o dedo dela**, e a
ordem está ali, visível, sendo construída.

## 4. O laço

~~~text
a fase abre: a bagunça em cima, a prateleira vazia embaixo
→ a criança TOCA NUMA COISA: ela levanta e cresce
→ os buracos onde ela CABE acendem
→ a criança TOCA NUM BURACO: a coisa voa e encaixa com um clique
→ errou o buraco: a coisa balança, volta para a bagunça, e a dica aparece
→ prateleira cheia: a estrutura GANHA VIDA e o jogo diz o nome dela
~~~

**Dois toques, sempre os mesmos dois**, em todas as fases e em todas as
estruturas. Nunca há um terceiro elemento na tela.

## 5. A tela

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`. Duas faixas, e só.

| Faixa | y | O que tem |
|---|---|---|
| Cabeçalho | 0 – 70 | cinco bolinhas de fase, `♥♥♥`, botão `?`. Nada escrito |
| **A bagunça** | 90 – 300 | as 4 a 9 coisas soltas, espalhadas sem ordem |
| **A prateleira** | 330 – 700 | a estrutura da fase, com os buracos |

**Tamanho é regra, não gosto.** A grade de 1280 encolhe para 30 % num celular
de 390 px, então **nada que a criança precise ver fica abaixo de 130 px aqui.**
Coisa solta: 150. Coisa na mão: 190. Buraco: 150.

## 6. Nível 1 — "A bagunça do recreio"

Cinco fases. **Uma estrutura por vez na tela** — a criança nunca escolhe entre
duas, porque escolher entre duas é a habilidade do *nível 3*, não do primeiro
contato.

| Fase | Estrutura | O conjunto | A regra do lugar |
|---|---|---|---|
| **1.1** | FILA de 4 | quatro ursinhos, de tamanhos bem diferentes | do **menor para o maior** |
| **1.2** | FILA de 5 | cinco bolas de meia | do **menor para o maior** |
| **1.3** | GRADE 2 × 2 | quatro fichinhas: 2 bichos × 2 cores | o **cruzamento** do bicho com a cor |
| **1.4** | GRADE 3 × 2 | seis fichinhas | idem |
| **1.5** | GRADE 3 × 3 | nove fichinhas | idem |

### O que deixa cada regra óbvia sem uma palavra

**Na fila**, só **o próximo buraco fica aceso**; os outros ficam apagados e não
aceitam toque. Então a criança nunca erra *onde* — ela só decide *qual coisa*
vem agora. E o que já entrou fica na tela, do lado, mostrando a ordem crescendo.

**Na grade**, cada linha tem **um bichinho** na borda esquerda e cada coluna tem
**uma cor com forma própria** no alto (⬤ azul, ▲ verde, ■ vermelho — cor e forma
juntas, para quem não distingue cor continuar jogando). A fichinha que a criança
segura **mostra o bichinho e a cor dela**. É casar figura com figura.

~~~text
            ⬤azul   ▲verde   ■vermelho
   🐰    ┌────────┬────────┬────────┐
         │  🐰⬤   │        │        │
         ├────────┼────────┼────────┤
   🐟    │        │        │        │
         ├────────┼────────┼────────┤
   🐝    │        │        │        │
         └────────┴────────┴────────┘
~~~

## 6.1. Nível 2 — "A ficha e os amigos"

Entram as duas estruturas que exigem leitura. **Uma por vez na tela, como no
nível 1.**

| Fase | Estrutura | O que a criança encaixa | A regra do lugar |
|---|---|---|---|
| **2.1** | FICHA de 2 campos | um bichinho e uma cor | o **rótulo igual** ao desenho da peça |
| **2.2** | FICHA de 3 campos | bichinho, cor e tamanho | idem |
| **2.3** | TEIA de 3 pontos | três fios | o fio **entre as duas pontas do cartão** |
| **2.4** | TEIA de 4 pontos | quatro fios | idem |
| **2.5** | FICHA de 3 campos | outros três valores | idem |

**A ficha:** cada campo é uma linha com o **rótulo à esquerda** e o **buraco à
direita**, ligados por um tracinho. O rótulo é um pictograma — uma patinha para
*qual bicho*, três manchas para *que cor*, três círculos crescendo para *de que
tamanho* — e o valor certo carrega o **mesmo pictograma**. É casar desenho com
desenho, e é exatamente o que um registro é: cada informação com o nome dela ao
lado.

**A teia:** os pontos já estão na moldura, ligados por **fios pontilhados**, e o
que falta é o pedaço do meio de cada fio. A peça é um cartãozinho com **as duas
pontas lado a lado** e um traço entre elas. Encaixar é dizer *"este par se
liga"* — a única coisa que um grafo guarda.

No erro, a ficha **acende a linha inteira** do campo certo, e a teia **acende o
fio de ponta a ponta**. Nas duas, o destaque explica sozinho; a frase só vem no
segundo erro.

## 6.2. Nível 3 — "Cada coisa na sua prateleira"

**Duas estruturas na tela ao mesmo tempo, e a bagunça mistura as peças das
duas.** É aqui que a criança **identifica** — o verbo da habilidade — e ela só
consegue porque passou dois níveis montando cada uma com a mão.

| Fase | As duas prateleiras |
|---|---|
| **3.1** | fila de 3 · grade 2 × 2 |
| **3.2** | ficha de 3 campos · fila de 3 |
| **3.3** | teia de 3 pontos · grade 2 × 2 |
| **3.4** | ficha de 2 campos · teia de 3 pontos |
| **3.5** | grade 2 × 2 · fila de 4 |

**As peças se entregam pela forma**, sem legenda nenhuma: a coisa de tamanho é
um objeto solto, a fichinha tem contorno colorido em círculo, triângulo ou
quadrado, o valor de campo é um cartão quadrado com moldura creme, e o fio é um
cartão comprido com duas pontas. De longe já se vê qual prateleira pede qual.

**Tocar na prateleira errada conta como erro**, igual a errar o buraco: nos dois
casos a criança disse *"é aqui"* e não era. E o destaque da prateleira certa
mostra onde era.

**As duas encolhem para 62 % e vão para as laterais.** Foi só isso que o nível 3
precisou mudar no jogo — as quatro estruturas falam a mesma interface, então o
laço não soube a diferença. **A peça encolhe junto ao encaixar**: ela é grande
na bagunça, onde a criança compara e decide, e assume a escala da prateleira
dentro do buraco. Sem isso, uma coisa de 158 px entraria num buraco de 112 e
vazaria por fora.

## 7. O erro

O erro só existe **no buraco**, nunca na coisa: tocar numa coisa da bagunça
jamais é errado, é só escolher outra.

Na fila é impossível errar o lugar (só um buraco aceita). Então o erro da fila
é **a ordem**: pôr o ursinho grande quando o pequeno ainda está na bagunça.

1. a coisa **balança e volta** para a bagunça, de onde saiu;
2. o buraco dá um pulso e **as coisas menores que sobraram piscam** — a dica é
   um destaque, não uma frase;
3. **só depois do segundo erro** aparece uma linha: *"comece pela menorzinha."*

Na grade, o mesmo: a fichinha volta, e **a linha e a coluna certas acendem** —
os dois feixes se cruzando mostram onde ela morava.

Cada erro emite `WRONG_ANSWER` e custa uma vida. **Nenhum relógio, nenhuma
pressa**: neste jogo não existe tempo, e a criança pode olhar o quanto quiser.

## 8. Fim de fase: a estrutura ganha vida

É a recompensa, e é a hora em que o nome aparece. Com o último buraco cheio:

- **a fila** vira uma centopeia de verdade: os vagões ganham perninhas e ela
  **anda pela tela**, um vagão puxando o outro;
- **a grade** vira a coruja: as nove janelinhas acendem uma a uma, em ondas de
  linha e de coluna, e ela **pisca os olhos**.

E só então, na faixa de baixo, uma linha:

| Estrutura | O que a faixa escreve |
|---|---|
| fila | **isso é uma FILA** · em computação: lista |
| grade | **isso é uma GRADE** · em computação: matriz |
| ficha | **isso é uma FICHA** · em computação: registro |
| teia | **isso é uma TEIA** · em computação: grafo |

No nível 3, com duas prateleiras cheias, **as duas faixas saem em sequência** —
uma por estrutura.

A BNCC pede os nomes; eles saem **depois** de a criança ter montado a coisa com
a mão. Nome sem experiência é decoreba; experiência sem nome não atende à
habilidade.

## 9. Feedback: momento → o que acontece

| Momento | Visual | Som |
|---|---|---|
| a fase abre | as coisas caem na bagunça, quicando | chuvinha de madeira |
| toque numa coisa | ela sobe, cresce e fica pulsando | plup |
| buracos válidos | acendem em âmbar, com respiração | tique |
| encaixe certo | ela voa em arco e **crava** com um tranco | clique de encaixe |
| encaixe errado | balança, volta girando devagar | nota grave curta, nunca agressiva |
| prateleira cheia | a estrutura ganha vida (§8) | fanfarra curta |
| o nome aparece | a faixa sobe de baixo | selo |

## 10. Tutorial e `?`

**Um passo só, sem frase.** A fase 1.1 abre com a bagunça e a fila vazia; uma
mão desenhada toca o ursinho menor, e depois toca o primeiro buraco. A coisa
encaixa. Fim — a criança repete o que viu.

O texto do balão é **uma linha de três palavras**, e existe para o adulto que
estiver ao lado: *"Toque e encaixe."*

O botão `?` fica sempre visível no canto superior direito e repete essa
demonstração.

## 11. As regras, em código

Os níveis moram em `data/levels.ts`, e esse é o único lugar.

~~~ts
type Forma = 'fila' | 'grade'

type Peca = {
    id: string
    /** Quadro em `achados.png`, ou a fichinha desenhada em Graphics. */
    objeto: number
    /** `fila`: o tamanho, de 1 a 5. */
    tamanho?: number
    /** `grade`: em que linha e coluna ela mora. */
    linha?: number
    coluna?: number
}

type Fase = {
    id: string
    forma: Forma
    /** `fila`: quantos buracos. `grade`: linhas × colunas. */
    buracos: number | { linhas: number; colunas: number }
    pecas: Peca[]
    dica: string
}
~~~

**A resposta nunca é um campo à parte.** Na fila o lugar certo sai da ordem dos
`tamanho`; na grade, do par `linha`/`coluna` da própria peça. Um campo
`buracoCerto` escrito à mão poderia mentir, e a habilidade morreria em silêncio.

Pontuação: **+10** de primeira, **+5** depois do erro. **Nenhum número na
tela**, em lugar nenhum, nem no painel de fim de nível.

Eventos: `GAME_READY` uma vez; `CORRECT_ANSWER` a cada encaixe certo;
`WRONG_ANSWER` a cada buraco errado; `GAME_COMPLETED` ao fim de cada nível, com
`stage: this.level.level` e `totalStages: LEVELS.length`. Vidas por
`createLives`.

## 12. O que é textura e o que é código

**A arte anterior foi descartada inteira**, por decisão do dono do projeto
(21/09/2026), e o [TEXTURAS.md](./TEXTURAS.md) foi refeito: quatro arquivos para
o nível 1, mais a capa.

| Textura (imagem) | Código (desenhado em Phaser) |
|---|---|
| `coisas.png` — as seis coisas que se põem em ordem | **as quatro prateleiras e todos os buracos** |
| `bichinhos.png` — coelho, peixe, abelha | as fichinhas, os valores de campo e os fios |
| `arquivista.png` — o mascote, em oito estados | os rótulos de linha, coluna e campo; os fios pontilhados |
| `bg-arquivo.png` e a capa | a faixa do rodapé, as estrelas, o confete |

**Os três níveis rodam com essas quatro folhas.** A ficha, a teia e as duas
prateleiras do nível 3 não pediram arte nova — os pontos da teia são os mesmos
bichinhos e as mesmas coisas, e os rótulos de campo são pictogramas em
`Graphics`.

**A prateleira é `Graphics`, e isso é decisão de engenharia.** Na versão
anterior a grade 3 × 3 tinha de ser desenhada dentro do vão da barriga de uma
coruja — e o vão mudava de lugar entre os quadros da folha, então a grade
desencaixava. Com os buracos nascendo na mesma conta que posiciona as peças,
eles encaixam sempre, e a arte deixa de ter um contrato de alinhamento para
cumprir.

**O "vivo" do título mudou de endereço:** saiu dos móveis e foi para o
arquivista, que reage, comemora e aponta a dica — e não tem nada encaixando em
cima dele.

## 13. Três travas, para quem mexer depois

**1. Uma estrutura por vez na tela, nos níveis 1 e 2.** Duas ao mesmo tempo é a
decisão do nível 3, e foi o excesso de opções que derrubou as versões
anteriores.

**2. Nenhuma camada entre a criança e o conceito.** Nada de etiqueta que
*significa* ordem, nem de móvel que *representa* uma lista. A criança põe em
ordem; a ordem aparece. Se aparecer um símbolo que precisa ser traduzido, a
versão morreu — foi assim com as três anteriores (§3).

**3. Nada abaixo de 130 px, e nada que vaze do buraco.** A peça assume a escala
da prateleira ao encaixar (§6.2), então o teto de tamanho vale em qualquer
nível. E **nunca encolha um objeto antes de `FX.popIn`**: ele anima até a escala
ATUAL do alvo, então um `setScale(0.3)` antes da chamada deixa a peça em 30 %
para sempre. Foi esse bug que deixou a versão da esteira ilegível.

**4. Toda palavra do jogo sai na faixa do rodapé, nunca num balão.** O balão ao
lado do Tuca caía por cima da prateleira em toda fase — e a prateleira é
justamente o que a frase manda olhar. O rodapé está sempre livre. O balão ficou
só na introdução, onde o Tuca está no centro e há espaço.

## 14. Telemetria

- acerto por estrutura — fila e grade separadas;
- na fila, **qual peça ela tentou pôr fora de ordem** (pular do menor para o
  maior é o erro esperado);
- na grade, se o erro foi de **linha** ou de **coluna** — são confusões
  diferentes e pedem intervenções diferentes;
- quantas fases ela fechou sem nenhum erro.

## 15. Registro

| Data | O que aconteceu |
|---|---|
| 20/09/2026 | Primeira versão: estantes. Morreu por ser o nível 2 do Museu das Estruturas. |
| 20/09/2026 | Segunda: corrida contra um rato. Morreu porque os toques não decidiam nada. |
| 21/09/2026 | Terceira: esteira com etiquetas. Construída, jogada e reprovada — quatro saltos de abstração entre a etiqueta e a estrutura, e três bugs de escala que deixaram as peças ilegíveis. |
| 21/09/2026 | **Níveis 2 e 3 construídos.** Entraram a FICHA e a TEIA (§6.1), e o nível 3 pôs **duas prateleiras na mesma tela** (§6.2). As quatro estruturas passaram a nascer da mesma fábrica e a falar a mesma interface, então o laço do jogo não precisou saber com qual está lidando — foi isso que deixou o nível 3 sair sem reescrever nada. Dois ajustes que a montagem exigiu: **a peça encolhe ao encaixar**, senão vazava do buraco menor; e **toda palavra foi para a faixa do rodapé**, porque o balão do Tuca cobria a prateleira. Nenhuma arte nova. |
| 21/09/2026 | **Quarta e atual: encaixe.** Refeita a pedido, **partindo do exemplo oficial da BNCC** em vez de uma ideia — *organizar por tamanho* e *organizar por tipo e cor* (§2). Sumiram as etiquetas, os símbolos a traduzir, o adversário, o relógio e a escolha entre móveis. Sobrou: bagunça em cima, prateleira embaixo, toque e encaixe. |
