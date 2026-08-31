# Planejamento Modal

Modelo para planejar um jogo novo de `src/games`. Não é um formulário para
preencher no automático: cada seção existe porque a falta dela já custou
retrabalho em jogo deste projeto.

Leia junto com [INSTRUCOES.md](./INSTRUCOES.md), que manda nas regras de
público, estrutura, tutorial, mobile, visual, animação, áudio, texto,
pontuação e código.

O planejamento vira **dois arquivos** dentro da pasta do jogo:

- `PLANEJAMENTO.md` — mecânica, grade, níveis, erro, áudio, produção;
- `TEXTURAS.md` — o que a arte precisa entregar, e o que ela NÃO deve entregar.

---

## 1. Antes de desenhar qualquer coisa: os dois testes

### O teste da bolinha

> **Troque o conteúdo do jogo por bolinhas coloridas sem significado. O jogo
> muda?**

Se não muda, a habilidade está na decoração e não na mecânica, e o jogo vai
parecer certo sem ensinar nada. Foi o que aconteceu nos primeiros desenhos de
dois jogos deste projeto:

| Jogo | Laço proposto | Por que falhava |
|---|---|---|
| Ritmo da Rotina | bater no tambor quando a figura chega | as figuras vinham já na ordem certa; qualquer toque no tempo acertava |
| Pulo Programado | escolher a carta parado no obstáculo | uma pergunta por vez, com a resposta desenhada na tela |

E como cada um passou a passar:

| Jogo | Correção |
|---|---|
| Ritmo da Rotina | dois botões: "é o próximo passo" e "agora não" — julgar virou parte do gesto |
| Pulo Programado | montar a lista inteira ANTES de rodar — a sequência passou a existir antes da execução |

### O teste do irmão

**Procure em `src/data/catalog.ts` se a habilidade já tem jogo publicado.**
Duas habilidades deste projeto já tinham, e o segundo jogo quase virou cópia:

- `EF01CO03` já tinha a Oficina dos Algoritmos (ordenar cartas). Pulo
  Programado só se justifica porque ali o acerto é provado pela EXECUÇÃO — o
  coelho atravessa ou esbarra — e não por conferir a ordem.
- `EF01CO04` já tinha o Correio Multimídia (escolher o canal certo, com
  contexto). Um jogo novo na mesma habilidade tem que pegar a outra metade do
  texto oficial.

Escreva no `PLANEJAMENTO.md` uma tabela de duas colunas mostrando a diferença.
Se você não consegue preencher essa tabela, são o mesmo jogo.

### Se o briefing não passar nos testes

Diga isso em duas frases no começo do documento, proponha a troca, e **siga
planejando com a troca**. Não peça permissão para depois começar: entregue o
plano corrigido e deixe claro o que mudou, para quem leu o briefing conseguir
discordar com o documento na mão.

---

## 2. A grade é fixa: 1280 × 720

Não existe layout relativo neste projeto. Os 45 jogos usam `Phaser.Scale.FIT`
com coordenada absoluta em `data/layout.ts`. Num celular em pé o jogo vira uma
faixa 16:9 com tarja preta — ele **não** recompõe.

Então o planejamento nunca fala em breakpoint, e sempre traz esta tabela:

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| … | … | … | px na grade | px reais |

A última coluna é o número que decide se está legível e se dá para tocar:
multiplique por **0,30** (celular de 390 px de largura). Um alvo abaixo de
~40 px reais não serve para dedo de criança.

**A regra que mais custou caro:** *painel não pode cortar a área de jogo.*
Em Ritmo da Rotina o painel do topo cortava o anel do alvo pela metade e
parecia defeito de desenho; em Pulo Programado o painel da paleta escondia o
chão inteiro e depois engolia o coelho no meio do pulo. Some as alturas antes
de escrever qualquer número, e deixe folga para o que se move.

---

## 3. Estrutura: 3 níveis × 3 fases

O [INSTRUCOES.md](./INSTRUCOES.md) limita a 5 fases por nível. Três funciona
bem e vira progressão de verdade quando a fase **cresce dentro do nível** — 3
passos, depois 4, depois 5 — em vez de repetir a mesma coisa três vezes.

Diga no documento o que conta como "fase" naquele jogo (uma rotina, um
percurso, um trecho), porque isso muda a conta.

---

## 4. Controle: um gesto

Um toque. Se o jogo precisar de dois botões, que sejam **dois objetos
diferentes e visíveis** — nunca duas metades do mesmo objeto, nem zona de
toque invisível fora do desenho. Em Ritmo da Rotina o aro do tambor virava uma
zona que ia até a borda da tela: ninguém adivinha o que não se vê.

Arrastar está proibido por padrão. Quando precisar reorganizar, use **um toque
põe, um toque tira** — dá edição sem exigir precisão de dedo.

---

## 5. O erro, e o que ele não pode ser

A TRAVA é padrão do catálogo: o mundo para, o item errado ganha destaque, e só
a ação certa destrava; depois de dois erros no mesmo item, a opção certa
pisca. A frase diz **qual** e **por quê**, nunca "tente de novo" e nunca a
resposta.

Três aprendizados que valem para qualquer jogo novo:

1. **Separe erro de dedo de erro de cabeça.** Em Ritmo da Rotina, perder o
   tempo não trava (a figura volta para a fila); errar o julgamento trava.
   Travar por dedo lento pune a coisa errada.
2. **Ignorar não é responder.** Deixar passar o que devia ser recusado conta
   como erro — senão a criança aprende que não fazer nada é seguro.
3. **Nenhum estado sem saída.** Toda combinação de erro precisa ter volta. Em
   Ritmo da Rotina um passo recusado por chegar cedo era descartado para
   sempre e a fase ficava impossível de terminar; a correção foi "agora não"
   querer dizer DEPOIS, mais uma rede de segurança que repõe o que falta.

---

## 6. Pontuação e tempo

**Nenhum número de ponto, acerto, erro ou porcentagem na tela** — a seção
Pontuação do INSTRUCOES manda nisso. Os pontos existem e saem pelo
`runtimeGameBridge`; o que a criança vê é estrela, selo, bolinha de fase e o
que ela montou.

Se o jogo tiver relógio, decida com a cabeça no que ele cobra:

- **barra que esvazia** cria pressa — serve para jogo de reflexo;
- **cronômetro que conta para cima** mede sem empurrar — serve para jogo de
  pensar. Foi a escolha de Pulo Programado, onde a criança planeja antes de
  agir e pressa só atrapalharia.

O total entra no subtítulo do painel de fim de nível
(`formatTime` de `shared/hud/createTimeBar`).

---

## 7. O que é textura e o que é código

**É textura:** personagem, objeto com identidade, cenário de fundo.

**Nunca é textura:** painel, cartão, botão, moldura, seta, cadeado, `?`,
estrela, carimbo, balão, barra, alvo, trilha, chão, marco, brilho, poeira,
partícula. Tudo isso é Graphics do Phaser, por dois motivos concretos: esses
elementos mudam de cor e tamanho a cada estado, e um PNG não muda; e manter a
interface em Graphics deixa o jogo jogável com zero textura carregada.

**A regra da emenda:** se um PNG vai encostar em algo desenhado pelo código,
desenhe os dois. Em Pulo Programado o buraco era um PNG de terra plantado num
chão em Graphics, e a costura entre as duas terras era a primeira coisa que o
olho achava.

### As folhas em grade

Peça **folha de sprites**, não um arquivo por desenho. O gerador desenha todos
os quadros na mesma passada, então o personagem sai igual porque saiu junto —
pedir um de cada vez ("faça o próximo usando o anterior") é onde a consistência
morre por volta do quinto desenho.

- **256 × 256 por quadro** basta. A figura maior aparece a ~200 px na grade e
  a ~60 px reais no celular; pedir 1024 é megabyte para jogar fora no
  `setScale`.
- A **ordem dos quadros é o índice do frame** — é contrato com o código.
- No negativo do prompt, sempre: `text, letters, numbers, grid lines`. O
  gerador desenha a moldura da grade que você pediu, e letra dentro do PNG
  vira lixo por baixo do texto de verdade.
- Transparência real. Se o gerador só entrega fundo branco, peça sobre magenta
  `#FF00FF` e remova a cor.

### Meça o sprite, não chute

Depois que a arte chegar, meça a caixa alfa de cada quadro e ancore o layout
nela. É uma execução no navegador e economiza meia hora de tentativa e erro:

```js
// desenha o PNG num canvas e devolve a caixa de cada quadro em fração da célula
```

Em Pulo Programado isso revelou que as patas do coelho ficam em 98,5 % da
altura do quadro e que a pose de abaixar ocupa só a metade de baixo — daí saiu
o "o desenho abaixa o coelho, o código não mexe no y".

---

## 8. Áudio

Tudo sintetizado em WebAudio, sem arquivo — é o padrão do projeto (ver
`corrida-dos-parecidos/scenes/GameScene.ts` e `ritmo-da-rotina/scenes/audio.ts`).
O que separa um bip de um som de jogo é o **envelope** e o **filtro**: ataque
curto, queda exponencial, e ruído passa-banda para o que é ar, terra e atrito.

Respeite `mute-audio` do `EventBus`. Se houver pulso rítmico, ele tem que sair
do **mesmo relógio** que move a imagem — tween paralelo descola em minutos.

---

## 9. Efeitos: o que faz um jogo parecer vivo

Liste no documento quais destes o jogo usa, e onde:

- moldura da tela piscando nas bordas (verde no acerto, vermelha no erro) —
  faz o momento parecer grande sem tirar o olho do meio;
- explosão que **cresce com a sequência de acertos**, com som próprio;
- botão que afunda e volta com `back` ease a cada toque;
- o item resolvido **voando** para o lugar onde ele fica guardado;
- brilho de vitória feito com a **silhueta do próprio personagem**, não com um
  círculo genérico: círculo destaca um lugar, silhueta destaca ELE;
- reprise no fim da fase mostrando o que a criança construiu, de uma vez.

E o contrário, que também é regra: brilho que toma a tela some com o que
importa. Em Ritmo da Rotina o brilho de "pode bater" era um borrão amarelo que
cobria meia tela e escondia justamente a figura a julgar; virou contorno.

---

## 10. Antes da arte existir

Todo jogo precisa de um **placeholder de código** — um cartão com o nome do
item, no tamanho final — usado quando a textura não existe. Ele deixa o jogo
jogável e ajustável antes do primeiro desenho, e impede que um arquivo faltando
derrube o `vite build`.

As texturas entram por `import.meta.glob`, nunca por `import` estático: um
import de arquivo que ainda não existe quebra o build inteiro.

---

## 11. O esqueleto de arquivos

```
src/games/<HABILIDADE>/<slug>/
    PLANEJAMENTO.md
    TEXTURAS.md
    index.ts            config do Phaser (FIT, 1280x720)
    types.ts            os tipos, e o comentário que explica a mecânica
    data/layout.ts      TODA coordenada, com o porquê dos números
    data/theme.ts       cores, fontes, tamanhos
    data/levels.ts      níveis, fases e a REGRA como função
    scenes/BootScene.ts glob das texturas + tela de carregamento
    scenes/GameScene.ts orquestração — não desenha nada
    scenes/*.ts         um módulo por peça desenhável
src/assets/games/<HABILIDADE>/<slug>/
```

**A GameScene não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
painter num módulo de `scenes/`.

**A regra é uma função, nunca um campo.** O veredito sai do estado no instante
da decisão (`shouldCollect`, `expectedHit`, `solves`), e não de um gabarito
guardado no item — é isso que permite a mesma peça pedir respostas diferentes
em momentos diferentes.

---

## 12. Registro e verificação

Registrar em três lugares:

- `src/data/catalog.ts` — entrada nova com slug, module, skill, tags, ícone e
  thumbnail;
- `src/data/gameInstructions.ts` — três linhas de instrução;
- `src/pages/GameDetailsPage.tsx` — o conjunto
  `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`.

Antes de considerar pronto:

- [ ] `npx tsc --noEmit` limpo para os arquivos do jogo
- [ ] `npx eslint <pasta do jogo>` limpo
- [ ] abre e joga uma fase inteira no navegador
- [ ] o erro e a trava foram vistos acontecendo, não só lidos no código
- [ ] mudo funciona; `?` pausa e reabre o tutorial; retomada sem salto
- [ ] nenhum número de ponto na tela
- [ ] nenhum gancho de depuração sobrou (`window.__algo`)

**Sobre testar no painel do navegador:** ele só desenha quadro quando você tira
screenshot, então o jogo fica congelado entre capturas. Para avançar de
verdade, exponha a cena temporariamente e bombeie o laço do Phaser
(`game.loop.step`), alternando com `await new Promise(r => setTimeout(r, 0))`
para as promessas resolverem. **Remova o gancho antes de terminar.**

---

## 13. O esqueleto do PLANEJAMENTO.md

1. **A habilidade, e o teste que ela precisa passar** — o texto oficial, o
   teste da bolinha aplicado, e a mudança em relação ao briefing se houver.
2. **Como isso não vira o jogo irmão** — a tabela de diferença.
3. **O laço** — um diagrama de texto com o ciclo principal.
4. **A grade** — a tabela de faixas com a coluna do celular.
5. **Níveis e fases** — a tabela, e o que cresce em cada um.
6. **As regras, em código** — a função do veredito, escrita como pseudocódigo.
7. **O erro** — a trava, passo a passo, e o que ela não pode ser.
8. **Feedback** — a tabela momento → o que acontece.
9. **Antes da arte existir** — o placeholder e a ordem de produção.
10. **Registro** — pasta, slug, ícone, onde registrar.

E, depois de construir, uma seção **"o que mudou na construção"** com as
decisões que saíram diferentes do plano e o motivo de cada uma. É a parte que
mais serve para o próximo jogo.
