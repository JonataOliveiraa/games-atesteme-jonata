# Torres dos Formatos - EF03CO05

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Um arquivo por vez cai pelas pistas. A criança lê que tipo de arquivo é aquele
e usa as setas para levá-lo até a caixa do formato que guarda dados daquele
jeito: som, imagem, texto ou vídeo. Quando ele pousa na caixa errada, a trava
abre a estrutura real do dado — amostras numa linha, pontos numa grade,
símbolos em fila ou quadros numa tira — e é ela que responde.

> **O jogo mudou de mecânica na segunda rodada.** A primeira implementação era
> de leitores fixos ao lado de uma trilha (tower defense). O usuário trocou por
> uma queda em pistas, tipo Tetris com Guitar Hero, e refez a arte para isso:
> `arquivo-criatura` virou 4 x 4 — uma linha por formato — e nasceu
> `formatos.png` com os quatro ícones de caixa. O currículo não mudou: quem
> decide continua sendo a estrutura do dado.

---

## 1. A habilidade e a prova dentro do jogo

> **(EF03CO05)** Compreender que dados são estruturados em formatos específicos
> dependendo da informação armazenada.

Objeto: **Codificação da informação**.

| Parte da habilidade | Evidência no jogo |
|---|---|
| dados estruturados | na trava, a faixa desenha a organização real: barras, grade, fichas ou quadros |
| formatos específicos | quatro caixas, cada uma guardando um jeito de arrumar dados |
| informação armazenada | o conteúdo recuperado voa para dentro da caixa quando o arquivo pousa certo |
| compreender | a criança escolhe a pista antes do pouso, e o gesto tem consequência imediata |
| consequência | a caixa certa aceita; a errada trava o arquivo até ele ser levado ao lugar dele |

### As quatro estruturas

| Formato | Estrutura visível | Payload |
|---|---|---|
| **som** | barras de amostra numa linha do tempo | `{ samples: number[] }` |
| **imagem** | pontos de cor numa grade 4 x 3 | `{ pixels: string[][] }` |
| **texto** | fichas de símbolo em sequência | `{ tokens: string[] }` |
| **vídeo** | quadros em fila, com furos de fita | `{ strip: string[] }` |

O veredito nasce da FORMA do payload (`formatOf` em `data/levels.ts`). Não
existe campo `correct`, nem lista de respostas: trocar o conteúdo de um arquivo
não muda para onde ele vai; trocar a estrutura muda.

### O teste da bolinha

> **Se as estruturas virarem bolinhas iguais, o jogo ainda pode ser resolvido?**

Em parte, e isso é deliberado. A arte veste cada criatura com o ícone do
formato dela, então o reconhecimento no ar é por identidade — é o que torna o
jogo jogável na velocidade em que ele acontece. A **estrutura** entra onde ela
é necessária: na trava, ao lado da frase que explica o erro. É lá que "amostras
numa linha" deixa de ser palavra e vira desenho.

O passo que falta, para um nível 4, é a estrutura contradizer a identidade —
e o `window.ts` já desenha as quatro para isso.

---

## 2. Como este jogo não repete o irmão Formato Certo

`EF03CO05` já tem o **Formato Certo** (id 018) publicado.

| | Formato Certo | Torres dos Formatos |
|---|---|---|
| decisão | escolher, preencher e consertar uma caixa | reconhecer a estrutura de um dado que já vem pronto |
| manipulação | arrasta peças para campos | move o arquivo inteiro de pista com dois botões |
| tempo | sem pressão | o arquivo desce; decidir tarde é decidir |
| prova | aperta LER e confere | vê o pouso ser aceito ou travado |
| gesto | arrasto | dois toques, só setas |

---

## 3. O laço

```text
A ONDA ENTRA
→ as caixas de formato sobem: duas na primeira onda, três na segunda,
  quatro na terceira
→ um arquivo nasce no alto, numa pista que NUNCA é a certa
   ↳ toda queda pede pelo menos uma decisão
→ a criança lê que arquivo é aquele e toca nas setas (ou no teclado)
   ↳ um toque, uma pista; mudar de ideia no ar não é erro
→ o arquivo pousa
   ↳ caixa certa: pulinho contente, o conteúdo entra na gaveta e uma
     bolinha acende na caixa
   ↳ caixa errada: TRAVA — ele para em cima dela, cadeado, e a faixa diz o
     que ele guarda; as setas continuam funcionando e ele só sai dali
     quando chegar ao formato dele
→ próximo arquivo
→ acabaram os arquivos: a onda fecha e uma pasta acende no topo
→ três ondas fecham o nível
```

Controle: **duas setas**, uma em cada canto de baixo — e as setas do teclado
fazem exatamente o mesmo, para quem joga no computador (com `addCapture`, senão
a página rola atrás do jogo). Sem arrasto e sem precisão.

Só um arquivo se move por vez, e ele é o único que está caindo: não há dúvida
sobre onde as setas vão agir.

---

## 4. Níveis e ondas

| Nível | Pistas por onda | Arquivos | O que entra |
|---|---|---|---|
| 1 | 2, 3 e 4 | 4, 5 e 6 | as quatro estruturas, duas a duas |
| 2 | 4 | 6, 8 e 9 | caixas trocando entre ondas, queda mais rápida e o ninja |
| 3 | 4 | 7, 8 e 9 | as caixas trocam DENTRO da onda, e os ninjas dobram |

### Nível 1 — implementado

| Onda | Pistas | Arquivos |
|---|---|---|
| 1.1 Som e imagem | som, imagem | 2 sons e 2 imagens |
| 1.2 Entra o texto | som, imagem, texto | 2 textos, 2 imagens, 1 som |
| 1.3 Entra o vídeo | os quatro | 2 vídeos, 2 sons, 1 texto, 1 imagem |

Com duas pistas o alvo é enorme; com quatro ele ainda passa de 44 px reais no
celular, porque a largura da pista é calculada a partir de quantas existem.

### Nível 2 — implementado

| Onda | Ordem das caixas | Arquivos |
|---|---|---|
| 2.1 Todas as caixas | som, imagem, texto, vídeo | 6 |
| 2.2 Caixas trocadas | vídeo, texto, som, imagem | 8, com 1 ninja |
| 2.3 Sem parar | imagem, vídeo, som, texto | 9, com 2 ninjas |

Duas coisas mudam do nível 1 para o 2, e as duas são curriculares:

- **as caixas trocam de lugar entre as ondas.** Quem decorou "som é a primeira"
  perde a muleta e volta a ter que ler o ícone da caixa;
- **entra o ninja.** Ele cai devagar, disfarçado, com `? ? ?` no painel — não há
  o que decidir enquanto ele não se revela. No meio do caminho o disfarce cai,
  ele vira um dos formatos sorteados na hora e a estrutura aparece. O tempo que
  ele economizou descendo devagar é o tempo que sobra para decidir.

A queda passa de 62 para 80 px/s, e o fundo muda: cada nível tem a sua textura
em `data/levels.ts`, com o jardim como reserva se a do nível ainda não existir.

### Nível 3 — implementado

| Onda | Ordem inicial | Troca depois de | Arquivos |
|---|---|---|---|
| 3.1 Olhe de novo | som, imagem, texto, vídeo | 3 arquivos | 7 |
| 3.2 Ninjas e troca | vídeo, som, imagem, texto | 4 arquivos | 8, com 2 ninjas |
| 3.3 Tudo junto | imagem, vídeo, texto, som | 5 arquivos | 9, com 2 ninjas |

No nível 2 a criança relia as caixas a cada onda; aqui elas **deslizam no meio
da onda** e ela precisa reler com o jogo em andamento. A troca acontece SEMPRE
entre dois arquivos, nunca com um no ar, e o que já foi guardado desliza junto:
a gaveta é a mesma, só mudou de vaga. A queda vai a 92 px/s.

---

## 5. Acerto, erro e pontos

A resposta curricular é **por onda**, não por arquivo: um `CORRECT_ANSWER` ao
fechar a onda.

| Resultado | Evento | Pontos | Vida |
|---|---|---:|---:|
| onda inteira sem travar | `CORRECT_ANSWER` | +10 | — |
| onda com trava | `CORRECT_ANSWER` | +5 | — |
| primeiro pouso errado da onda | `WRONG_ANSWER` | 0 | -1 |
| travas seguintes na mesma onda | nenhum | 0 | — |
| mover de pista no ar | nenhum | 0 | — |

Máximo: **90 pontos** nas nove ondas. Nenhum número, porcentagem, acerto ou
cronômetro aparece na tela: o topo mostra três pastas por nível e as caixas
enchem de bolinhas.

---

## 6. A trava

O único erro é pousar o arquivo numa caixa de outro formato.

1. o arquivo para em cima da caixa, com a cara de quem não coube;
2. um cadeado âmbar aparece ao lado, sem cobrir o painel;
3. a faixa diz **o que o arquivo guarda**, nunca em qual caixa ele vai:
   *"Este arquivo guarda pontos de cor numa grade."*;
4. as setas continuam funcionando — mover É a correção;
5. cada pista errada tentada faz a caixa tremer, sem tirar vida;
6. depois de duas tentativas, a caixa certa respira;
7. chegando ao formato dele, o arquivo entra e a onda continua.

Não existe estado sem saída: o arquivo nunca é destruído e a onda nunca avança
sem ele.

---

## 7. Tela

Base **1280 x 720**, `Phaser.Scale.FIT`.

| Faixa | y | Conteúdo |
|---|---|---|
| header | 0–70 | nível, três pastas de onda, vidas e `?` |
| pistas | 82–496 | colunas claras e o arquivo caindo |
| caixas | 500–612 | uma caixa por formato, com o ícone de `formatos` |
| setas | 616–716 | dois botões de 300 x 96, um em cada canto |

O arquivo nasce com os pés em `y = 244` e pousa em `y = 496`. A queda do nível
1 é de 62 px/s: cerca de quatro segundos para decidir, sem teste de reflexo.

---

## 8. Arquivos

```text
index.ts            GameConfig 1280x720, Scale.FIT
types.ts            FormatId, Payload, FileDef, WaveDef, LevelDef
data/theme.ts       cores, FORMAT (linha da criatura + quadro do ícone), PIXEL
data/layout.ts      header, pistas, caixas, setas e a criatura
data/levels.ts      LEVELS e formatOf(): a única fonte de conteúdo e veredito
scenes/BootScene.ts glob + grades das folhas + loading
scenes/GameScene.ts estado e orquestração; não desenha
scenes/window.ts    A JANELA ESTRUTURAL, em quatro desenhos
scenes/lanes.ts     pistas, caixas de formato e o que já foi guardado
scenes/faller.ts    o arquivo que cai: queda, deslize, pouso e trava
scenes/controls.ts  as duas setas
scenes/lock.ts      cadeado e faixa de explicação
scenes/hud.ts       header, pastas de onda e `?`
scenes/audio.ts     WebAudio, sem arquivo de som
```

A GameScene não desenha: se ela precisar de um `fillRoundedRect`, falta um
painter em `scenes/`.

---

## 9. Plataforma

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, na criação |
| `CORRECT_ANSWER` | uma vez por onda fechada, com 10 ou 5 pontos |
| `WRONG_ANSWER` | no primeiro pouso errado de cada onda |
| `CHECKPOINT` | a cada onda, progresso de 0 a 100 |
| `GAME_COMPLETED` | fim de cada nível, `stage` = nível e `totalStages` = `LEVELS.length` |
| `GAME_OVER` | só de `createLives`, quando as vidas zeram |

Vidas atravessam `scene.restart` entre níveis. O jogo não escreve
`isFinalStage`.

---

## 10. Registro

| Campo | Valor |
|---|---|
| `id` | `063` |
| `slug` | `torres-dos-formatos` |
| `module` | `EF03CO05/torres-dos-formatos` |
| `order` | `185`, logo depois do Formato Certo |
| `points` | `90` (nove ondas x 10) |
| `icon` | `🗼` |

Também registrado em `gameInstructions.ts` e no conjunto
`GAMES_WITH_IN_GAME_COMPLETION_SCREEN` de `GameDetailsPage.tsx`.

---

## 11. O que mudou na construção

### Rodada 1 — leitores na trilha (descartada)

Torres fixas liam arquivos que passavam. Funcionava e foi jogada inteira, mas
o usuário trocou a mecânica antes da avaliação. O que sobreviveu: a janela
estrutural, a trava, o HUD, o áudio e o contrato de eventos.

### Rodada 2 — a queda nas pistas (10/09/2026)

| Decisão | Por quê |
|---|---|
| Um arquivo por vez | Com dois botões controlando o que cai, mais de um alvo ao mesmo tempo vira confusão motora, não decisão de formato. |
| O arquivo nunca nasce na pista certa | Sem isso, parte das quedas seria vencida sem nenhuma decisão. |
| Pouso errado TRAVA no lugar, em vez de perder o arquivo | Mantém o padrão do catálogo — destrava só com a ação correta — e conserva a estrutura à vista bem na hora em que ela precisa ser lida. |
| Uma vida por onda, não por arquivo | Quinze arquivos com uma vida cada esvaziariam as três vidas por erro motor, não por erro conceitual. |
| Largura da pista calculada pela quantidade | Duas pistas dão alvo enorme na primeira onda; quatro ainda passam de 44 px reais no celular. |
| O ícone de `formatos.png` entra sobre um disco branco | O PNG veio com fundo branco opaco; o disco faz esse fundo virar parte da caixa em vez de um quadrado solto. |

### Rodada 4 — teclado, realce, ninja e níveis 2 e 3 (10/09/2026)

| Decisão | Por quê |
|---|---|
| A janela estrutural saiu do corpo da criatura | A arte já traz o ícone do formato pintado no painel; o desenho de código por cima virava remendo. A estrutura passou a aparecer **na faixa da trava**, ao lado da frase — o único momento em que a criança precisa dela por inteiro. |
| Contorno branco no arquivo que cai | Só um se move por vez; o realce diz onde as setas vão agir antes de a criança tocar nelas. |
| Setas do teclado, com `addCapture` | No computador o dedo não é o único jeito de mover — e sem o capture a página rola atrás do jogo. |
| O ninja desce devagar do começo ao fim (42% da velocidade) | Ele só revela o que é na metade do caminho: a metade de baixo inteira precisa caber na decisão. Antes ele acelerava depois de revelar, que era o contrário do necessário. |
| Nível 3 troca as caixas DENTRO da onda | Era o passo que faltava depois do nível 2: lá bastava reler entre ondas; aqui é preciso reler com um arquivo já caindo. |
| Duas folhas de criatura, com a segunda crescendo por nível | 20% no nível 1, 55% no 2, 85% no 3 (`skinTwo`). Som aparece ora como alto-falante, ora como megafone; texto ora como folha de linhas, ora como envelope. A arte passa a dizer o que a janela estrutural dizia — o formato não é o desenho — e diz cada vez mais alto. |
| O contorno branco saiu | Com um arquivo só caindo por vez, ele não estava resolvendo dúvida nenhuma e competia com o desenho da criatura. |

---

## 12. Antes de considerar pronto

- [x] só o nível 1 na primeira entrega;
- [x] cada arquivo mostra dados organizados, não só um ícone de categoria;
- [x] o veredito vem da forma do payload, sem campo de resposta;
- [x] tudo por toque, sem arrasto;
- [x] mover no ar não pune;
- [x] a trava só termina com a caixa certa;
- [x] depois de duas tentativas, a caixa certa respira;
- [x] nenhum ponto, erro, porcentagem ou tempo aparece;
- [x] um `CORRECT_ANSWER` por onda, não por arquivo;
- [x] `npx tsc --noEmit` limpo;
- [x] ESLint da pasta limpo;
- [x] nenhum gancho de depuração sobrou;
- [ ] nível 1 jogado e avaliado pelo usuário;
- [ ] níveis 2 e 3 só depois da aprovação.
