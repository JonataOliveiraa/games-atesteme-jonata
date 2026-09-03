# Esconde-Dados - EF01CO07

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

Stealth infantil para 1º ano: a criança leva um cartão de dados pessoais por
uma pracinha, escondendo o cartão de olhares curiosos e entregando só para uma
pessoa de confiança.

Melhoria sobre o briefing: não há contador regressivo visível. A criança de 7
anos precisa observar a lanterna e decidir com calma; pressa mede reflexo, não
uso seguro de tecnologia. O tempo fica apenas como telemetria.

---

## 1. A habilidade, e o teste que ela precisa passar

> **(EF01CO07)** Conhecer as possibilidades de uso seguro das tecnologias
> computacionais para proteção dos dados pessoais e para garantir a própria
> segurança.

Objeto: **Segurança e responsabilidade no uso de tecnologia computacional**.

Exemplo oficial: professor poderá fazer um jogo de imagens de dispositivos como
celular, tablet, computador dentre outros em que os alunos precisam apresentar o
que as pessoas fazem com essas tecnologias. Assim, o professor poderá destacar
os cuidados quando usamos esses dispositivos.

O teste da bolinha é este: **troque o cartão de dados, o cofre, a pessoa de
confiança e o pedido suspeito por bolinhas coloridas sem significado. O jogo
muda?**

Muda. A mecânica só faz sentido porque o objeto carregado representa dado
pessoal, e porque a decisão final diferencia "quem cuida de mim" de "quem está
curioso". Sem esse significado, vira apenas corrida entre esconderijos.

Alinhamento com o código BNCC:

| Campo | Valor no jogo |
|---|---|
| Código | `EF01CO07` |
| Ano | 1º ano |
| Unidade | Cultura Digital |
| Objeto | Segurança e responsabilidade no uso de tecnologia computacional |
| Verbo da habilidade | conhecer possibilidades de uso seguro |
| Evidência jogável | esconder dados pessoais, recusar pedido inadequado e entregar ao adulto confiável |

---

## 2. Como isso não vira o jogo irmão

Já existe um jogo publicado para EF01CO07: **Guardiões dos Dados**.

| Jogo | O que a criança faz | Diferença pedagógica |
|---|---|---|
| Guardiões dos Dados | Lê uma situação em dispositivo digital e escolhe entre duas atitudes. | É um jogo de decisão por cenário, com bastante texto e foco em várias situações digitais. |
| Esconde-Dados | Move um cartão de dados até o cofre e decide visualmente para quem pode mostrar. | É um jogo de ação visual: proteger, esperar, recusar e entregar. A leitura é apoio, não motor da jogada. |

Este jogo pega a mesma habilidade por outro lado: em vez de perguntar "qual
atitude é segura?", ele faz a criança praticar a ideia concreta de que dado
pessoal fica protegido e só sai para quem é de confiança.

---

## 3. O laço

```
cartão aparece com um dado pessoal em pictograma
→ esconderijos e lanterna entram em ciclo claro
→ criança toca no próximo esconderijo quando o caminho está livre
→ personagem corre sozinho e guarda o cartão
→ se a luz pega no caminho, volta para o esconderijo anterior sem perder vida
→ no portão, criança toca na pessoa certa
→ entrega segura abre o cofre
→ escolha insegura trava com contraste visual e pede nova escolha
→ álbum mostra o que foi protegido
```

Um gesto só no jogo inteiro: **tocar em alvo grande**. No percurso, o alvo é o
próximo esconderijo. No portão, o alvo é uma pessoa ou o botão visual de
recusar. Nada de arrastar, segurar, teclado obrigatório ou zona invisível.

O jogo deve ser claro antes de qualquer texto: luz verde no caminho livre, cone
amarelo da lanterna no caminho perigoso, cartão brilhando dentro do bolso,
escudo verde em adulto confiável e mão aberta de "não mostrar" no pedido
inadequado.

---

## 4. A grade

Tela fixa de **1280 x 720** com `Phaser.Scale.FIT`. Num celular em pé, a tela
vira uma faixa 16:9; ela não recompõe. A coluna "No celular" usa fator 0,30,
aproximando um aparelho de 390 px de largura.

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---|---|---|---|
| HUD | 0 - 84 | 3 escudos de progresso, cartão atual, botão `?` em (1210, 42) | `?` visual 60, hitbox 144 x 144 | 18 visual, 43 x 43 toque |
| Pista visual | 84 - 150 | Semáforo do caminho: livre / espere, sem frase longa | ícone 74, fonte opcional 34 | ícone 22, fonte 10 |
| Percurso | 150 - 565 | Pracinha lateral com esconderijos, personagem, cone de luz e curioso | personagem 170, esconderijo 190 x 120 | 52, 58 x 36 |
| Portão | 150 - 565 | Substitui o percurso no fim: duas pessoas grandes e cofre ao centro | pessoa 210, botão 260 x 150 | 64, 79 x 46 |
| Rodapé | 565 - 720 | Linha de esconderijos concluídos e álbum curto do cartão protegido | alvos 150 x 128 | 46 x 39 |

Alvos de toque:

| Alvo | Hitbox na grade | No celular |
|---|---|---|
| esconderijo | 190 x 150 | 58 x 46 |
| pessoa no portão | 230 x 260 | 70 x 79 |
| botão "não mostrar" | 300 x 160 | 91 x 49 |
| `?` | 144 x 144 | 43 x 43 |

Não há painel grande cobrindo a pista. A criança precisa enxergar sempre três
coisas: onde está, para onde vai e para onde a lanterna está olhando.

---

## 5. Níveis e fases

A **fase deste jogo é um cartão protegido**. Cada nível tem 3 fases, dentro do
limite de 5 fases por nível. O caminho muda pouco; o que cresce é o cuidado com
o dado e com quem pede para ver.

| Nível | Fases | Percurso | Decisão de segurança |
|---|---|---|---|
| 1 | 3 cartões: nome, foto, escola | 1 curioso, ciclo lento 4 s livre / 4 s luz, 3 esconderijos | escolher mãe/pai ou professora com escudo verde |
| 2 | 3 cartões: endereço, telefone, foto com escola | 1 curioso, ciclo 3 s livre / 3 s luz, 4 esconderijos | escolher professora entre dois adultos; escudo aparece só quando a criança chega perto |
| 3 | 3 cartões mistos | 2 curiosos alternados, 4 esconderijos | recusar pedido de um avatar de app antes do portão, depois entregar ao adulto confiável |

Conteúdo visual dos cartões:

| Dado | Pictograma no cartão | Não usar |
|---|---|---|
| nome | etiqueta com rosto simples | letras formando nome real |
| foto | retrato infantil genérico | rosto realista |
| endereço | casinha + pino de localização | rua escrita |
| escola | mochila + prédio escolar | nome de escola |
| telefone | aparelho + bolinhas sem números | número real |

Todas as fases usam os mesmos componentes. A variação vem da ordem dos cartões,
do ciclo da lanterna e da decisão final.

---

## 6. As regras, em código

O veredito é função do estado no instante do toque.

```ts
type DataKind = 'name' | 'photo' | 'address' | 'school' | 'phone'
type TrustRole = 'trustedAdult' | 'unknownAdult' | 'appAvatar'

function pathIsLit(position: number, lights: LightState[]) {
  return lights.some((light) => light.covers(position))
}

function canMoveTo(target: Hideout, runner: Runner, lights: LightState[]) {
  const path = segmentBetween(runner.hideout, target)
  return !path.some((position) => pathIsLit(position, lights))
}

function canShareWith(role: TrustRole) {
  return role === 'trustedAdult'
}

function shouldRefuse(role: TrustRole) {
  return role === 'unknownAdult' || role === 'appAvatar'
}
```

Ser visto pela lanterna não emite `WRONG_ANSWER`: é erro de tempo e observação,
não erro conceitual de segurança. O personagem volta um esconderijo, o caminho
mostra "espere" por pictograma e a criança tenta de novo.

Escolha insegura no portão ou no pedido do avatar emite `WRONG_ANSWER` e usa a
TRAVA do catálogo. É aí que a habilidade BNCC está sendo julgada.

Pontuação interna:

| Situação | Evento | Pontos |
|---|---|---|
| Chegar ao próximo esconderijo sem ser visto | `CHECKPOINT` | 0 |
| Entregar a pessoa confiável de primeira | `CORRECT_ANSWER` | +10 |
| Entregar certo depois da trava | `CORRECT_ANSWER` | +5 |
| Recusar pedido inadequado de primeira | `CORRECT_ANSWER` | +10 |
| Mostrar para pessoa ou avatar inadequado | `WRONG_ANSWER` + `lives.lose()` | 0 |

Nenhum número aparece na tela.

---

## 7. O erro

Há dois tipos de falha, porque misturar os dois deixaria o jogo injusto.

| Falha | O que acontece | Evento de plataforma |
|---|---|---|
| Ser visto pela lanterna | curioso ri de forma boba, personagem escorrega para trás e volta ao esconderijo anterior | só `CHECKPOINT` opcional de telemetria |
| Mostrar dado para quem não deve | TRAVA, cartão fecha com escudo, pessoa inadequada fica cinza, escolha segura pulsa depois de 2 erros | `WRONG_ANSWER` |

TRAVA da decisão insegura:

1. O cartão quase sai do bolso, mas um escudo fecha por cima.
2. A pessoa inadequada faz gesto de curiosidade, sem susto e sem ameaça.
3. O adulto confiável fica em tamanho normal; depois de 2 erros, ganha contorno
   verde pulsante.
4. A dica aparece primeiro por ícone: escudo verde + adulto confiável.
5. A frase, se aparecer, tem no máximo 5 palavras: **"Dados só com quem cuida."**
6. Só tocar na pessoa confiável destrava.

O erro não pode ser:

| Não fazer | Motivo |
|---|---|
| Captura, susto, perseguição agressiva | A habilidade fala de segurança, mas o jogo é para 7 anos. |
| Texto explicando a situação inteira | A criança deve entender por luz, escudo, bolso e cofre. |
| Fazer a criança decorar quem é "bom" pela cor apenas | Escudo, crachá e posição de acolhimento precisam reforçar a leitura visual. |
| Punir timing como erro BNCC | Esperar a lanterna é coordenação; compartilhar dado é o conceito avaliado. |

---

## 8. Feedback e diversão

| Momento | Visual | Som |
|---|---|---|
| Caminho livre | trilha até o próximo esconderijo fica verde suave | plim baixo |
| Caminho com luz | cone amarelo varre o chão e o alvo fica fechado | pulso abafado |
| Corrida segura | personagem corre com poeirinha e entra no esconderijo | vento curto |
| Visto pela luz | luz faz "pop", curioso ri bobamente, personagem desliza de volta | risada curta e leve |
| Chegou ao portão | cofre aparece abrindo um olhinho de luz | sino macio |
| Pessoa confiável escolhida | cartão voa para o cofre, escudo acende | fanfarra curta |
| Pessoa inadequada escolhida | cartão fecha, escudo trava, opção segura pulsa | som de bloqueio |
| Pedido do avatar recusado | mão de "não" cresce, avatar recua, caminho abre | nota de vitória curta |
| Fim do nível | escudo dourado + álbum visual dos 3 dados protegidos | fanfarra curta |

Diversão sem confusão:

| Recurso | Como usar |
|---|---|
| lanterna com ritmo previsível | a criança aprende a esperar e sente que dominou o ciclo |
| esconderijos animados | moita balança, banco abre espaço, placa gira de leve |
| cartão com brilho de tesouro | reforça que dado pessoal tem valor |
| cofre expressivo em Graphics | abre, pisca e guarda o cartão sem virar personagem falante |
| pedido-armadilha visual | avatar oferece figurinha, e a mão de "não" é maior que o avatar |

---

## 9. Tutorial

Exemplo animado de 5 segundos, pulável:

| Passo | Frase curta | Cena |
|---|---|---|
| 1 | "Guarde o cartão." | cartão entra no bolso com brilho |
| 2 | "Espere a luz virar." | cone passa; caminho muda de amarelo para verde |
| 3 | "Toque no esconderijo." | dedo toca moita; personagem corre sozinho |
| 4 | "Mostre só para quem cuida." | escudo verde aparece na pessoa confiável |

No nível 3, antes do primeiro pedido de avatar, há microdemonstração sem painel:
avatar oferece figurinha, mão de "não" pulsa, criança toca e o caminho abre.

Sem narração. Texto só como legenda curta dentro do tutorial.

---

## 10. Textura mínima e o que fica no código

Quase tudo deve ser `Graphics` do Phaser.

| Elemento | Fazer em |
|---|---|
| chão, céu, árvores simples e portão | Graphics |
| esconderijos | Graphics |
| lanterna e cone de luz | Graphics |
| cartão de dados e pictogramas | Graphics |
| cofre | Graphics |
| escudos, corações, estrelas, cadeado e brilho | Graphics/shared |
| botões e painel de tutorial | Graphics/shared |
| curioso | Graphics, com formas simples |
| adulto confiável e pessoa inadequada | spritesheet única |
| personagem principal | spritesheet única |
| capa do catálogo | PNG |

O jogo deve ser jogável mesmo sem texturas: se `crianca.png` ou `pessoas.png`
faltarem, os personagens viram bonecos simples em Graphics com cor e ícone de
papel.

Todo carregamento de textura usa `import.meta.glob`, e todo consumo passa por
`textures.exists()`.

---

## 11. Produção

Ordem recomendada:

1. percurso em Graphics, esconderijos e ciclo de lanterna;
2. movimento por toque e retorno ao esconderijo anterior;
3. cartão de dados em Graphics, com pictogramas;
4. portão, cofre e decisão de pessoa confiável;
5. TRAVA da escolha insegura;
6. pedido do avatar no nível 3;
7. tutorial de 5 segundos;
8. texturas mínimas entrando no lugar dos placeholders;
9. eventos da plataforma e painel de fim de nível.

Para implementação inicial, seguir a regra do projeto: construir **1 nível só
para teste**, avisar o usuário e mostrar o resultado antes de expandir para os
3 níveis planejados.

---

## 12. Registro

Pasta do jogo:

```
src/games/EF01CO07/esconde-dados/
```

Pasta de assets:

```
src/assets/games/EF01CO07/esconde-dados/
```

Slug: `esconde-dados`

Título: `Esconde-Dados`

Entrada futura no catálogo:

| Campo | Valor |
|---|---|
| `slug` | `esconde-dados` |
| `module` | `EF01CO07/esconde-dados` |
| `skill` | `EF01CO07` |
| `years` | `[1]` |
| `tags` | `["segurança", "dados pessoais", "privacidade", "toque"]` |
| `category` | `Cultura Digital` |
| `points` | `60` |
| `icon` | sugerido: escudo/cofre |

Também registrar:

| Arquivo | O que entra |
|---|---|
| `src/data/gameInstructions.ts` | 3 linhas: espere a luz, toque no esconderijo, entregue só para quem cuida |
| `src/pages/GameDetailsPage.tsx` | incluir em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` se usar painel interno |

---

## 13. O que mudou na construção

Implementado o **nível 1 apenas**, como manda a regra de jogo novo em teste.
`LEVELS` tem uma entrada só, e `totalStages: LEVELS.length` acompanha — quando
os níveis 2 e 3 entrarem, nada precisa mudar para a plataforma aprovar no fim
do último.

### As texturas chegaram diferentes do pedido

| Pedido em TEXTURAS.md | O que existe | Consequência |
|---|---|---|
| folhas horizontais (4 × 1, 5 × 1) | tiras **verticais** de quadros 450 × 450 | `frameWidth: 450, frameHeight: 450`; o índice do quadro é a linha |
| `crianca.png` quadro 3 "escondido" | vem com uma **moita desenhada junto** | a moita de Graphics passou a usar a paleta da sprite, e a criança escondida fica ATRÁS dela |
| `cover-esconde-dados.png` | chegou na segunda rodada | ligada no catálogo |
| `arvore.png`, `moita.png` | não estavam no plano | substituíram o cenário de Graphics |

A paleta do arbusto (`#001026` de contorno, `#5cad29` de luz, `#389630` de
corpo) veio depois e entrou no `theme.ts`: a moita de Graphics e a que vem
colada na sprite precisam ser o mesmo mato, senão a criança escondida parece
estar atrás de outra planta.

### O semáforo é a fonte de verdade, o cone é o motivo

O planejamento pedia `pathIsLit(position, lights)` por posição. Com uma
lanterna só e um ciclo global, o que a criança precisa saber é mais simples:
**o caminho inteiro está livre ou não**. A pílula do topo diz a regra ("Pode
ir!" / "Espere") e o cone desenha o porquê — ele varre a faixa de areia
durante a janela de luz e some na janela livre. Uma coisa a olhar, não duas.

O alvo fecha enquanto a luz passa, então tocar cedo demais não é possível. A
luz só alcança alguém que saiu com a janela quase virando: a corrida leva
880ms dentro de 4s de caminho livre, e é essa margem que a criança aprende a
respeitar.

### Ajustes que os testes de tela pediram

- Os estados do esconderijo eram molduras retangulares em volta da moita, e
  liam como caixa. Viraram **brilho verde no chão e uma seta por cima** quando
  dá para correr; com a luz passando, a moita escurece e a seta some.
- O cone estava fraco demais para competir com a areia clara. Ganhou faixas
  mais opacas e uma poça de luz no chão, que é o que a criança olha.
- Escondida, a criança ficava NA FRENTE da moita. Agora vai para trás dela
  (profundidade 10 contra 12) e sobe 54px, então o que aparece é a carinha por
  cima do mato.
- No portão, o cofre engolia a criança: ela chega ali com a profundidade do
  percurso. Passou a subir para 40, acima da camada do portão.
- **As zonas de toque das pessoas do portão não recebiam clique dentro do
  container da cena.** As do percurso, que são de nível superior, sempre
  funcionaram. As do portão saíram do container e ganharam profundidade
  própria — e passam a ser destruídas à mão no `clearGate`, já que não morrem
  mais junto com ele.

### Segunda rodada: as texturas do cenário e o portão refeito

`arvore.png` e `moita.png` chegaram depois e substituíram o desenho: a moita é
a mesma dos esconderijos e da entrada, e três árvores compõem o fundo. Os
estados do esconderijo continuam em Graphics **em volta** da textura — brilho
verde no chão atrás dela e seta por cima — porque estado não é arte, é
sinalização, e ela precisa acender e apagar. Quando a lanterna passa, a moita
recebe `tint` em vez de ser redesenhada. Sem `moita.png`, `paintHideout`
continua desenhando o mato, e o jogo roda igual.

**O portão estava confuso**, e a razão era simples: ele não fazia a pergunta.
A criança chegava lá, o percurso sumia pela metade, apareciam duas pessoas e
uma caixa cinza — e nada dizia o que estava sendo decidido. A tela foi
reorganizada em ordem de leitura:

| Antes | Agora |
|---|---|
| o semáforo apagava e nada tomava o lugar dele | a mesma pílula passa a perguntar **"Quem pode ver?"**, com o pictograma do dado |
| o cartão só existia no header | o cartão sobe para as **mãos da criança**, brilhando, no meio da tela |
| as moitas ficavam meio apagadas no fundo | o percurso sai de cena inteiro |
| a pessoa era clicável sem parecer | cada uma ganha um **tapete**, que é o alvo e a borda do toque |
| o escudo pendurado ao lado do corpo | o escudo vai **acima da cabeça**, grande |
| o cofre grande no centro disputava a atenção | o cofre encolheu e foi para trás: ele é o destino, não a pergunta |

O acerto também ficou legível: a pessoa escolhida acende o tapete, a outra
esmaece, o cartão vai **primeiro para a mão de quem cuida** e só então ao
cofre. No erro, o cartão dá um passo na direção de quem pediu, o escudo fecha
por cima e ele volta para as mãos da criança — o mesmo cartão o tempo todo,
nunca um cartão novo aparecendo do nada.

### Terceira rodada: o guarda, e o fim de fase que faltava

`seguranca.png` deu rosto ao vigia: é o **guarda da pracinha** fazendo a ronda,
não um vulto curioso. O cone nasce da lanterna dele — `WATCHER.handDX/handDY`
são o deslocamento da lanterna dentro da textura, senão a luz saía da barriga
do guarda. Continua valendo a regra do plano: a lanterna é o obstáculo, o
guarda não persegue ninguém.

**O fim de fase não tinha clímax**, e o escudo que aparecia sobre o cofre não
explicava nada — era uma forma abstrata pairando. A entrega virou uma sequência
de sete tempos:

| Tempo | O que acontece |
|---|---|
| 1 | quem cuida acende o tapete e dá um pulinho; a outra pessoa esmaece |
| 2 | o cartão vai para a mão dela |
| 3 | o cofre abre com raios de luz saindo de dentro |
| 4 | o cartão entra, encolhendo |
| 5 | a porta fecha, o cofre treme e um **cadeado dourado fecha na frente da criança**, com estalo |
| 6 | o pictograma do dado **sobe do cofre até o selo** do header, que enche |
| 7 | fanfarra, confete, estrelas, e a criança pula junto com quem cuida |

O cadeado é o que faltava: ele diz "guardado" de um jeito concreto, coisa que
o escudo pairando não dizia. E o selo do header parou de encher sozinho — o
pictograma faz a viagem, então a criança vê de onde veio o progresso.

**O escudo do header também ficou legível.** Vazio, ele mostra a silhueta de um
cartão: a fileira lê "três cartões para guardar". Cheio, mostra o pictograma do
dado com um cadeadinho no canto: "este está trancado". O escudo continua sendo
o símbolo de segurança do jogo — o mesmo que fica sobre a cabeça de quem cuida
—, mas agora ele carrega o que está protegido, e não só a forma.

### Quarta rodada: todo mundo no chão, e uma conversa

Duas coisas quebravam o portão, e a segunda escondia a primeira.

**As pessoas flutuavam.** Elas ficavam com os pés no ar sobre um tapete que
não era o chão delas, e o cofre pairava no céu. O cenário do percurso —
caminho de areia, grama, linha do horizonte — não servia para nada na hora que
mais importava. Agora todo mundo pisa em `PARK.footY`, o mesmo chão da
criança, com sombra embaixo dos pés; o cofre fica na grama logo atrás, também
com sombra.

**E a cena não contava nada.** Duas figuras paradas e um cofre não dizem o que
está em jogo. O portão virou uma conversa:

| Momento | O que se vê |
|---|---|
| chegada | as duas pessoas entram, cada uma no seu lugar no chão |
| pergunta | cada uma abre um **balão de fala**: "Me mostra isso?" com um olho, "Guardo no cofre?" com um escudo |
| escolha errada | a pessoa cala e fica cinza, e a CRIANÇA responde: mão aberta e um balão **"Não!"** |
| escolha certa | quem cuida diz "Deixa comigo!", depois "Vou trancar!", e por fim **"Guardado!"** |

A fala é curta e cada balão tem um ícone à esquerda, então quem ainda não lê
entende pelo desenho: olho é "quer ver", escudo é "quer proteger", cadeado é
"trancou". `PersonDef.ask` guarda o pedido de cada pessoa.

O "Não!" é a fala mais importante do jogo — é a criança recusando, e não o
jogo dizendo que ela errou.

**Um vazamento que o teste pegou:** os balões vivem fora do container do
portão (por causa da profundidade), então o "Guardado!" sobrevivia à troca de
fase e ficava pendurado no céu da fase seguinte. `clearGate` agora destrói
balão e zona de toque à mão — os dois pelo mesmo motivo de estarem fora do
container.

### Quinta rodada: o cartão ganhou contexto

A crítica mais dura, e a certa: **o jogo apresentava um "cartão" do nada**. Ele
já estava no header no primeiro segundo, sem ninguém dizer o que é, de quem é,
por que esconder nem por que existe um cofre. Só a fuga da lanterna se
sustentava sozinha.

Cada fase agora abre com uma cena curta, `introCard()`:

1. o mundo escurece;
2. o cartão aparece **grande no meio da tela**, com o pictograma do dado;
3. um painel diz o que ele é: **"Este cartão tem o SEU NOME."**;
4. na primeira fase do nível, uma segunda frase dá a missão: **"Leve até o
   cofre sem ninguém ver!"**;
5. o cartão encolhe e voa para o bolso da criança — é assim que ele entra na
   partida, e não como um ícone que sempre esteve ali.

`CardDef.intro` guarda a frase de cada dado. O tutorial perdeu o passo do
cartão, que agora era repetição: ele ficou só com o gesto — quando dá para
correr e onde tocar.

**Dois bugs junto:**

- O cadeado fechava na borda de baixo do cofre, bem em cima da cabeça do
  menino, que fica logo à frente dele. Foi para o **centro da porta**.
- O véu da abertura não escurecia nada: `add.rectangle` recebe o alfa do
  PREENCHIMENTO, e eu animava o alfa do OBJETO sobre um preenchimento zerado.
  Agora ele entra já escuro e é destruído no fim da cena.

**E o cofre foi redesenhado.** A porta antes só encolhia em largura, o que lia
como retângulo sumindo. Passou a girar numa dobradiça à esquerda, mostrando a
espessura da lateral ao abrir, com volante, parafusos nos cantos e um vão
interno escuro que acende.

## 14. Sexta rodada: o cofre virou textura

Chegou `cofre.png` — tira HORIZONTAL de quatro quadros de 256, de fechado (0)
a escancarado (3). O cofre era o último elemento importante desenhado à mão no
meio de um cenário todo ilustrado, e no clímax da fase ele era o objeto mais
pobre da tela.

`buildSafe()` devolve sprite quando a textura existe e o Graphics antigo
quando não — o desenho continua no `effects.ts` como plano B, e os dois abrem
pelo mesmo valor de 0 a 1, então nada mais no jogo precisou saber a diferença.
`paintSafeState()` traduz esse valor em quadro.

Três ajustes que a textura pediu:

- a escala se mede pelo CORPO do cofre dentro do quadro (`safeTexBody`, cerca
  de 186 de 256), não pela borda — pela borda ele encolheria pelo tanto de
  vazio que a arte tem em volta;
- o vão fica à ESQUERDA do centro, porque a porta gira para a direita. O
  cartão mira ali (`slotDX`) e os raios de luz saem dali; mirando no centro,
  o cartão bateria na porta aberta;
- abrir ficou mais lento (560ms) que fechar (300ms, com `Back.easeIn`).
  Abrir é convite e a criança precisa ver o vão; fechar é tranco.

### Selos, e o que eles contam

O álbum do rodapé virou os **escudos do header**: um por fase, que enche com o
pictograma do dado quando ele entra no cofre. É a mesma informação da pílula
"Fase 2 de 3" ao lado, em desenho, para quem ainda não lê. O rodapé ficou de
grama, e o percurso inteiro cabe na faixa do meio.
