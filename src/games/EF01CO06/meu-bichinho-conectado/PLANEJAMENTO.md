# Meu Bichinho Conectado — EF01CO06

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Simulador de vida para 1º ano: o bichinho mostra uma necessidade por imagem,
som e expressão, e a criança escolhe qual artefato computacional resolve aquela
situação.

O briefing pedia arrastar e soltar o aparelho sobre o bichinho. A regra atual de
planejamento proíbe arrastar por padrão em jogo novo, então o gesto foi ajustado
para **um toque no artefato da prateleira**: o aparelho voa até o bichinho e a
decisão continua sendo exatamente a mesma.

A tela não pode depender de leitura constante. O pedido principal é sempre um
**pictograma grande**; o texto é só uma legenda de 1 a 3 palavras para apoiar a
mediação do professor e a criança que já lê.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF01CO06)** Reconhecer e explorar artefatos computacionais voltados a
> atender necessidades pessoais ou coletivas.

Objeto: **Uso de artefatos computacionais**.

Exemplo oficial: o professor poderá utilizar um jogo educacional em ferramentas
como computador, tablet, mesas interativas, celular, em que os alunos possam
experimentar seus recursos.

O teste da bolinha é este: **troque caixinha de som, tablet, telefone e relógio
por bolinhas coloridas sem significado. O jogo muda?**

Muda. O acerto depende de reconhecer o que cada artefato faz no mundo da criança:
caixinha toca história, tablet mostra clima e fotos, telefone conversa com a
vovó, relógio ajuda a saber a hora. Sem o significado do artefato, não sobra
critério para escolher.

A exploração aparece depois da escolha: o artefato não só "some certo"; ele é
usado em uma microcena de 2 a 3 segundos. A criança vê a necessidade sendo
atendida, que é o núcleo da habilidade.

Alinhamento obrigatório com o código BNCC:

| Campo | Valor no jogo |
|---|---|
| Código | `EF01CO06` |
| Ano | 1º ano |
| Unidade | Cultura Digital |
| Objeto | Uso de artefatos computacionais |
| Verbo da habilidade | reconhecer e explorar |
| Evidência jogável | escolher o artefato e ver sua função atendendo uma necessidade pessoal ou coletiva |

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF01CO06: **Desktop Digital Infantil**.

| Jogo | O que a criança faz | Diferença pedagógica |
|---|---|---|
| Desktop Digital Infantil | Abre apps dentro de um desktop e completa missões escolares com ferramentas digitais. | Explora aplicativos e operações internas: relógio, calculadora, gravador, pasta, desenho e player. |
| Meu Bichinho Conectado | Escolhe o artefato físico certo para uma necessidade do bichinho, pessoal ou coletiva. | Reconhece a função social de aparelhos computacionais no cotidiano antes de entrar em operações internas. |

Este jogo é mais concreto e mais cedo no conceito: **qual aparelho ajuda em
qual necessidade?** O irmão já pergunta **como usar um app para cumprir uma
missão?**

---

## 3. O laço

```
bichinho faz uma cena curta de necessidade
→ balão mostra pictograma grande + legenda curta
→ prateleira mostra 2, 3 ou 4 artefatos
→ criança toca em um artefato
→ artefato voa até o bichinho
→ função solves(pedido, artefato) decide
→ acerto: microcena divertida de uso + coração acende + próximo pedido
→ erro: TRAVA, gag visual curta, dica por contraste, tenta de novo
→ 3 pedidos concluídos: álbum visual do dia + estrelas + próximo nível
```

Um toque só no jogo inteiro: **tocar no artefato visível**. Nada de arrastar,
segurar, teclado obrigatório ou zona invisível.

O que a criança precisa entender antes de tocar cabe na cena, não numa caixa de
texto: livro aberto com ondas de som, retrato da vovó, nuvem com chuva, prato de
lanche ou três fotos no mural.

---

## 4. A grade

Tela fixa de **1280 × 720** com `Phaser.Scale.FIT`. Num celular em pé, a tela
vira uma faixa 16:9; ela não recompõe. A coluna "No celular" usa fator 0,30,
aproximando um aparelho de 390 px de largura.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| HUD | 0 – 92 | Pílula `NÍVEL n`, pílula `Fase n de N`, selos das fases, botão `?` em (1224, 46) | pílulas 56 px de altura; `?` desenhado 60 px, hitbox 96 × 96 | 17 px visual, 29 × 29 toque |
| Pedido | 92 – 214 | Balão grande com pictograma; legenda de até 3 palavras | balão 660 × 108; pictograma 84; fonte 42 | 200 × 32; pictograma 25; fonte 13 real |
| Quarto | 214 – 610 | Bichinho no centro; no pedido coletivo, três bichinhos no mesmo tapete | bichinho 220 px; grupo 480 px | 67 px; 146 px |
| Prateleira | 96 – 704 | Coluna direita com até 4 artefatos em botões visuais grandes | cada nicho 246 × 144 | 75 × 44 real |
| Rodapé | 610 – 720 | Feedback por pictograma e álbum compacto dos artefatos já usados | selos 88 px; texto só no painel final | selo 27 px |

O alvo de toque real dos artefatos é o nicho inteiro: **246 × 144** na grade,
cerca de **75 × 44 px reais** no celular. O artefato desenhado pode ser menor,
mas a área clicável não pode descer desse tamanho.

O painel de pedido não corta a área do bichinho. O bichinho nunca passa de
`y = 610`, e a prateleira começa abaixo do HUD para manter o `?` livre.

Legibilidade infantil: durante a jogada, a maior parte da tela é bichinho,
pictograma e aparelho. Não há card de explicação permanente, parágrafo, lista ou
missão longa no canvas.

---

## 5. Níveis e fases

A **fase deste jogo é um pedido**. Cada nível tem 3 pedidos, dentro do limite de
5 fases por nível.

| Nível | Fases | Artefatos visíveis | O que cresce |
|---|---|---|---|
| 1 | 3 pedidos pessoais óbvios | 2 por pedido | Reconhecer relações diretas: ouvir, falar, ver hora. |
| 2 | 2 pedidos pessoais + 1 coletivo | 3 por pedido | Separar aparelho parecido de aparelho útil e atender mais de um bichinho. |
| 3 | 3 pedidos, com 1 resposta dupla | 4 por pedido | Lidar com todos os artefatos e aceitar duas soluções quando ambas atendem. |

Conteúdo por nível. A coluna "pedido na tela" descreve o pictograma dominante;
a legenda é curta e opcional.

| Nível | Pedido na tela | Legenda máxima | Resposta válida | Distratores planejados |
|---|---|---|---|---|
| 1.1 | livro aberto + ondas de som | História | caixinha de som | relógio |
| 1.2 | retrato da vovó + coração | Vovó | telefone | caixinha de som |
| 1.3 | pratinho de lanche + ponteiro | Lanche | relógio | telefone |
| 2.1 | nuvem chovendo na janela | Chuva? | tablet | telefone, caixinha |
| 2.2 | vovó longe + bichinho falando | Vovó | telefone | relógio, tablet |
| 2.3 | três bichinhos + fotos grandes | Fotos | tablet | telefone, relógio |
| 3.1 | livro aberto + ondas de som | História | caixinha de som ou tablet | telefone, relógio |
| 3.2 | nuvem e sol alternando | Chuva? | tablet | telefone, caixinha, relógio |
| 3.3 | pratinho de lanche + bichinho esperando | Lanche | relógio | tablet, telefone, caixinha |

No nível 3.1, qualquer uma das duas escolhas certas vale. O comentário muda:

| Artefato escolhido | Comentário |
|---|---|
| caixinha de som | O livro pula para a caixinha, ondas de som aparecem. |
| tablet | O livro abre na tela do tablet, ondas de som aparecem. |

A frase-chave **"Cada aparelho ajuda de um jeito!"** aparece só no fechamento
do nível, junto do álbum visual. Durante a rodada, a conclusão vem pela cena.

---

## 6. As regras, em código

O veredito é função do pedido e do artefato escolhido no instante da decisão.
Não deve morar como `isCorrect` no item da prateleira.

```ts
type Need =
  | 'hear_story'
  | 'call_grandma'
  | 'check_weather'
  | 'know_snack_time'
  | 'share_party_photos'

type Artifact = 'speaker' | 'tablet' | 'phone' | 'watch'

const SOLUTIONS: Record<Need, Artifact[]> = {
  hear_story: ['speaker', 'tablet'],
  call_grandma: ['phone'],
  check_weather: ['tablet'],
  know_snack_time: ['watch'],
  share_party_photos: ['tablet'],
}

function solves(need: Need, artifact: Artifact) {
  return SOLUTIONS[need].includes(artifact)
}

function scoreForAttempt(wrongAttemptsOnNeed: number) {
  return wrongAttemptsOnNeed === 0 ? 10 : 5
}
```

Cada pedido também carrega dados visuais, não só texto:

```ts
type NeedVisual = {
  iconFrame: number
  shortLabel: 'História' | 'Vovó' | 'Chuva?' | 'Lanche' | 'Fotos'
  petGesture: 'listen' | 'call' | 'lookWindow' | 'hungry' | 'groupLook'
}
```

`shortLabel` nunca substitui o pictograma. Ela é apoio visual e precisa caber em
uma única palavra, exceto `Chuva?`.

Pontuação padrão do catálogo:

| Situação | Evento | Pontos internos |
|---|---|---|
| Acerto de primeira | `CORRECT_ANSWER` | +10 |
| Acerto depois de trava | `CORRECT_ANSWER` | +5 |
| Artefato incompatível | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número de ponto, acerto ou erro aparece na tela.

Telemetria específica:

| Medida | Uso |
|---|---|
| acerto de primeira por tipo de pedido | saber quais necessidades foram reconhecidas sem dica |
| tempo até escolher | medir hesitação sem pressionar a criança |
| artefato escolhido no pedido de dupla resposta | entender preferência entre caixinha e tablet |
| erros por pedido antes da dica | ajustar distratores e clareza visual |

---

## 7. O erro

A TRAVA é parte da aprendizagem, não punição de dedo.

1. A criança toca em um artefato incompatível.
2. O artefato voa até o bichinho, tenta funcionar e falha em uma cena cômica de
   até 2 segundos.
3. O mundo pausa com moldura vermelha leve, cadeado em Graphics e o balão do
   pedido pulsando.
4. A tela compara visualmente: o pictograma do pedido pulsa de um lado e o
   artefato errado faz sua função incompatível do outro.
5. O artefato volta para a prateleira.
6. A criança toca outro artefato. Só uma solução válida destrava.
7. Depois de 2 erros no mesmo pedido, o nicho correto brilha em amarelo.

A frase de erro é secundária e curta, usada no máximo em uma linha:

| Situação | Frase máxima |
|---|---|
| relógio para história | "Tic-tac não conta história." |
| telefone para chuva | "Telefone liga, não mostra chuva." |
| caixinha para vovó | "Som toca, mas não chama a vovó." |
| relógio para fotos | "Relógio não mostra fotos." |

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| Mensagem genérica "tente de novo" | Não ensina o vínculo entre necessidade e artefato. |
| Dar a resposta no texto | Tira a decisão da criança. |
| Tratar soltar fora como erro | Com toque direto não existe erro motor desse tipo. |
| Deixar a fase avançar depois do erro | O pedido precisa continuar até ser atendido. |
| Explicar tudo por texto | Criança do 1º ano deve entender pela cena e pelo pictograma. |

Exemplos de cena cômica:

| Pedido | Artefato errado | Cena |
|---|---|---|
| ouvir história | relógio | só faz "tic-tac"; o bichinho inclina a cabeça |
| previsão do tempo | telefone | chiado e uma nuvem embaralhada |
| falar com a vovó | caixinha | sai música curta, mas ninguém responde |
| ver fotos com todos | relógio | os três olham para o relógio apertado e não veem foto nenhuma |

---

## 8. Feedback

| Momento | Visual | Som |
|---|---|---|
| Pedido novo | Bichinho encena a necessidade; balão entra com pictograma grande | plim curto |
| Toque no artefato | Botão afunda e o artefato voa até o bichinho | clique macio |
| Acerto | Moldura verde nas bordas, bichinho comemora, coração acende | acorde curto |
| Uso da caixinha | Ondas de som coloridas saem da caixa | melodia de 3 notas |
| Uso do tablet | Tela mostra clima, livro ou foto em pictograma simples | brilho digital |
| Uso do telefone | Linha desenhada liga até retrato da vovó | toque de chamada curto |
| Uso do relógio | Ponteiros giram até a hora do lanche | tic-tac alegre |
| Erro | Moldura vermelha leve, artefato chacoalha, cadeado aparece | som abafado ou chiado |
| Dica após 2 erros | Nicho correto pulsa com contorno amarelo | pulso suave |
| Fim do nível | Álbum visual com 3 pares pictograma-artefato | fanfarra curta |

Áudio é sintetizado em WebAudio, sem arquivos. Respeita `mute-audio` pelo
`EventBus`.

Efeitos usados:

| Efeito | Onde |
|---|---|
| moldura de tela verde/vermelha | acerto e erro |
| botão que afunda e volta | todo toque em artefato |
| item voando | artefato sai da prateleira e volta/entra no álbum |
| brilho pela silhueta do bichinho | conclusão do nível |
| reprise/álbum | fim de cada nível |
| gag curta de incompatibilidade | todo erro real |

Diversão planejada:

| Momento | Reação divertida |
|---|---|
| pedido de história | bichinho senta e balança os pés esperando a história |
| chamada da vovó | coraçãozinho viaja pela linha do telefone |
| previsão de chuva | gotinhas aparecem na janela e somem quando o tablet mostra o clima |
| hora do lanche | pratinho desliza até o tapete quando o relógio acerta |
| fotos coletivas | três bichinhos se apertam, depois se espalham felizes olhando o tablet |
| erro | o aparelho tenta ajudar do jeito dele e falha sem assustar |

---

## 9. Tutorial

O tutorial é uma demonstração animada de 5 segundos, pulável, e pode ser
reaberto pelo `?`. Ele não deve parecer aula antes do jogo.

| Passo | Frase | Destaque |
|---|---|---|
| 1 | "Olhe o pedido." | pictograma grande pulsando |
| 2 | "Toque no aparelho." | prateleira, com um dedo animado tocando |
| 3 | "Coração aceso!" | aparelho usando sua função e coração preenchendo |

No nível 2, a primeira vez que surge pedido coletivo, entra uma microdemonstração
de 2 segundos: três bichinhos olham o mesmo pictograma de fotos e o tablet se
vira para todos. Sem novo painel de texto.

---

## 10. Antes da arte existir

O jogo precisa rodar sem PNG. Cada textura tem fallback em Graphics:

| Elemento | Placeholder |
|---|---|
| bichinho | corpo arredondado com olhos, boca e cor de emoção |
| artefato | cartão com pictograma geométrico e nome curto |
| pictograma de pedido | ícone grande desenhado em Graphics se `pedidos.png` faltar |
| prateleira | nichos desenhados em Graphics |
| cenário | quarto simples em Graphics, com parede, chão e tapete |
| álbum | selos e miniaturas em Graphics |

Todo carregamento de textura usa `import.meta.glob`, e todo consumo passa por
`textures.exists()`. Um arquivo ausente não pode quebrar `vite build`.

Ordem de produção recomendada:

1. layout, placeholders, prateleira e toque em artefato;
2. dados do nível 1 e função `solves`;
3. trava de erro e dica depois de 2 erros;
4. álbum de fim de nível e eventos da plataforma;
5. níveis 2 e 3;
6. entrada das texturas reais;
7. ajuste fino no celular, mudo, tutorial e retomada após pausa.

Para implementação inicial, seguir a regra do projeto: construir **1 nível só
para teste**, avisar o usuário e mostrar o resultado antes de expandir para os
3 níveis planejados.

---

## 11. Registro

Pasta do jogo:

```
src/games/EF01CO06/meu-bichinho-conectado/
```

Pasta de assets:

```
src/assets/games/EF01CO06/meu-bichinho-conectado/
```

Slug: `meu-bichinho-conectado`

Título: `Meu Bichinho Conectado`

Entrada futura no catálogo:

| Campo | Valor |
|---|---|
| `slug` | `meu-bichinho-conectado` |
| `module` | `EF01CO06/meu-bichinho-conectado` |
| `skill` | `EF01CO06` |
| `years` | `[1]` |
| `tags` | `["artefatos", "necessidades", "cultura digital", "toque"]` |
| `category` | `Cultura Digital` |
| `points` | `60` |
| `icon` | sugerido: aparelho digital simples no catálogo |

Também registrar:

| Arquivo | O que entra |
|---|---|
| `src/data/gameInstructions.ts` | 3 linhas: ver pedido, tocar aparelho, completar corações |
| `src/pages/GameDetailsPage.tsx` | incluir em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` se usar painel interno |

---

## 12. O que mudou na construção

Implementado o **nível 1 apenas**, como manda a regra de jogo novo em teste.
`LEVELS` tem uma entrada só, e `totalStages: LEVELS.length` acompanha — quando
os níveis 2 e 3 entrarem, nada mais precisa mudar para a plataforma aprovar no
fim do último.

### As texturas chegaram diferentes do pedido

| Pedido em TEXTURAS.md | O que existe | Consequência |
|---|---|---|
| folhas horizontais (5 × 1, 4 × 2) | tiras **verticais** de quadros 300 × 300 | `frameWidth: 300, frameHeight: 300`; o índice do quadro é a linha |
| `artefatos.png` 4 × 2 | dois arquivos: `artefato-repouso.png` e `artefato-uso.png`, 4 quadros cada | mesmo índice nos dois; a microcena troca só a textura |
| `prateleira.png` | não veio | a estante é Graphics (`paintShelf`), o que era o plano B previsto |
| `cover-meu-bichinho-conectado.png` | não veio | a entrada do catálogo está **sem `thumbnail`** |
| `bg-quarto.png` 1280 × 720 | 1672 × 941, mesma proporção 16:9 | entra com `setScale(max(W/w, H/h))` |

O tapete do fundo caiu no centro em torno de x 600, então o bichinho mora lá e
a coluna de jogo vai só até x 900 — a estante ocupa a parede da direita, que a
arte deixou limpa de propósito.

### Progresso é selo, não coração

O plano usava coração aceso para pedido atendido. Coração já é a vida da
partida (`createLives`), e dois significados para o mesmo desenho confundem.
Cada pedido virou um **selo no topo**, que enche com o pictograma da
necessidade atendida — e é ele que forma o álbum do fim de nível.

### Ajustes que os testes de tela pediram

- O passo 3 do tutorial usava holofote retangular com o balão em cima, e o
  balão tapava justamente o pedido que o passo 1 ensinou a olhar. Virou
  holofote redondo no bichinho com o balão embaixo.
- Selo vazio em creme sobre parede creme sumia: ganhou miolo e borda âmbar.
- `hover` e `hint` do nicho eram o mesmo desenho. A dica ganhou borda mais
  grossa e anel branco interno — "o dedo está aqui" não pode parecer "é este".
- O `?` só reabre o tutorial com a cena livre: chamado no meio de uma
  animação, o `onFinish` destravaria o jogo com o artefato ainda no ar.

### Segunda rodada de ajuste: o pedido e o acerto

**A fala.** A legenda de uma palavra dizia o assunto ("História") e deixava a
decisão no ar. Agora o balão tem duas linhas: a palavra grande e a fala do
bichinho, com o **verbo em caixa alta** — "Quero OUVIR uma história!". É o
verbo que aponta o aparelho sem entregar o nome dele, então a decisão continua
sendo da criança. A fala mora em `NeedDef.ask`, uma por necessidade.

**A moldura.** Era uma faixa verde chapada de 26px, que parecia moldura de
quadro colada sobre o quarto. `screenGlow` desenha 16 anéis concêntricos com
alfa caindo para dentro: a luz nasce na borda e se dissolve. Serve aos dois
casos — verde 1100ms no acerto, vermelho 520ms no erro.

**A cena de acerto, em quatro tempos.** Antes era tudo no mesmo instante e o
selo simplesmente aparecia no topo, sem a criança saber de onde veio:

1. o aparelho **liga** — troca para o quadro em uso, dá dois pulsos e solta
   três anéis coloridos (`deviceWaves`);
2. o bichinho **comemora** — dois pulinhos (`hopPet`), estrelas e três
   corações subindo (`heartBurst`);
3. o pedido é **atendido** — o pictograma sai do balão e voa em arco até o
   selo (`flyNeedToStamp`);
4. o selo **fecha** em verde e o balão se despede.

A ordem é o que ensina: a função acontece primeiro, o progresso aparece
depois, e o pictograma voando é o elo entre os dois.

`hopPet` precisa parar o balanço idle antes de pular — os dois tweens mexem no
mesmo `y`, e sem isso o bichinho pula e volta para o lugar errado.

### Nível 2

Três aparelhos na prateleira e o último pedido é de todos. O que cresce não é
a quantidade de toques: é a escolha. Com três opções, a criança precisa
descartar o aparelho **parecido** — a caixinha também faz som, mas não mostra
o tempo — antes de achar o útil.

| Pedido | Fala | Resposta | Distratores |
|---|---|---|---|
| 2.1 | Quero VER se vai chover! | tablet | telefone, caixinha |
| 2.2 | Quero FALAR com a vovó! | telefone | relógio, caixinha |
| 2.3 (coletivo) | Quero MOSTRAR as fotos! | tablet | telefone, relógio |

**O tablet não entra como distrator do pedido da vovó**, embora o planejamento
previsse isso. Chamada de vídeo em tablet é coisa que criança de 6 anos faz em
casa: ela escolheria certo pelo mundo real e o jogo diria que errou. Distrator
só vale quando a resposta é inequivocamente não. Entrou a caixinha no lugar.

**O pedido coletivo** traz os amiguinhos (`bichinhos-amigos`, quadros 0 e 2) ao
tapete, um depois do outro, e o pictograma do pedido pulsa duas vezes. É a
microdemonstração prevista no plano, e ela é toda visual — três bichinhos
olhando o mesmo pictograma dizem "isto é de todos nós" sem painel de texto
novo. No acerto o grupo pula em cascata e cada um solta corações.

Eles ficam à **esquerda** do bichinho, e não em volta: a direita do tapete é
por onde o aparelho entra em cena (`STAGE`), e um amiguinho ali fazia o
aparelho aterrissar em cima dele. O de trás é menor e mais alto que o da
frente — é o que faz três bichinhos em 174px de tapete parecerem um grupo com
profundidade em vez de dois recortes colados.

**Um ajuste que o N2 revelou:** o holofote do passo 2 do tutorial tinha a
altura de dois nichos. Com três aparelhos, o primeiro e o último ficavam no
escuro. Agora ele aponta para a estante inteira, que vale para qualquer
quantidade.

### Nível 3

Os quatro aparelhos de uma vez, e um pedido com **duas respostas**.

| Pedido | Fala | Resposta | Distratores |
|---|---|---|---|
| 3.1 | Quero OUVIR uma história! | caixinha **ou** tablet | telefone, relógio |
| 3.2 | Quero VER se vai chover! | tablet | caixinha, telefone, relógio |
| 3.3 | Que HORAS é o meu lanche? | relógio | tablet, telefone, caixinha |

A dupla resposta é o que fecha a habilidade: aparelho não é chave de
fechadura, e mais de um pode atender a mesma necessidade. **O jogo não diz
isso em texto** — quem escolhe a caixinha ouve as três notas e vê as ondas de
som; quem escolhe o tablet vê a tela acender com o arpejo digital. A cena muda
com a escolha, e é ela que responde. `SOLUTIONS.hear_story` já tinha os dois
desde o começo: o que o N3 muda é a prateleira mostrar os dois juntos.

**A prateleira virou 2 × 2.** Quatro nichos empilhados numa coluna teriam
123px de altura cada — uns 37px reais num celular de 390px, abaixo do piso de
44 que a seção 4 fixou. `shelfArrangement(count)` devolve coluna até 3 e grade
de duas colunas a partir de 4; na grade o alvo fica **maior** que na coluna
(158 × 196, uns 48 × 60 reais), e a estante ganha uma fileira em vez de
apertar quatro. Quem desenha (`paintShelf`, `paintNiche`) recebe a arrumação,
então nada mais no jogo sabe quantos aparelhos existem.

A estante da grade é mais larga, e por isso o balão do pedido encolheu de 668
para 652: são doze pixels de folga para ele não encostar na moldura de
madeira.

### O header diz nível e fase

O título do jogo saiu do canvas — ele já aparece na página em volta — e no
lugar entraram duas pílulas, como nos outros jogos do catálogo: **`NÍVEL n`**
em âmbar e **`Fase n de N`** em creme.

Os selos continuam ao lado, e ganharam um terceiro estado. Antes eles só
diziam o que já foi; agora dizem também **onde a criança está**: o selo da
fase da vez fica âmbar com um alvo no meio e respira. É a mesma informação da
pílula, em desenho — quem ainda não lê "Fase 2 de 3" vê o selo do meio pulsando.

### A lista de soluções passou a ser honesta com o mundo real

O N3 nasceu com o tablet como distrator do lanche, e isso estava errado:
tablet de verdade mostra a hora. A criança que escolhesse pelo que vê em casa
perdia vida **por estar certa**. O mesmo valia para a vovó, que o plano
original também previa com o tablet como distrator (aquele caso eu já tinha
evitado à mão, o do lanche passou).

A regra agora é: **distrator só vale quando a resposta é inequivocamente
não.**

```ts
hear_story:         ['speaker', 'tablet']   // caixinha toca, tablet também
call_grandma:       ['phone', 'tablet']     // telefone liga, tablet faz vídeo
check_weather:      ['tablet']
know_snack_time:    ['watch', 'tablet']     // relógio marca, tablet mostra
share_party_photos: ['tablet']
```

O que continua sendo escolha não é adivinhar o aparelho único: é descartar os
que de fato não servem — caixinha não marca hora, telefone não mostra chuva,
relógio não conta história. Sobram dois distratores inequívocos por pedido do
N3, e dois pedidos do nível passam a ter duas respostas certas em vez de um.

**E a cena precisou acompanhar.** O tablet ligado sozinho mostra fotos e sol,
não a hora — aceitar a escolha e mostrar a cena errada seria só metade do
conserto. Então o pictograma do pedido, que antes ia do balão direto para o
selo, agora **pousa no aparelho escolhido** e só depois segue para o selo:

```
balão → aparelho → selo
```

Com o pictograma do lanche pousado nele, a tela do tablet passa a dizer o que
a criança pediu. Vale para qualquer combinação, inclusive as que os níveis
futuros inventarem, e de graça ficou melhor até no caminho antigo: a criança
vê o pedido virar aparelho e o aparelho virar progresso.
