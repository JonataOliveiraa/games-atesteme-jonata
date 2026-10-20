# Bairro das Permissões — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO07 · 5º ano · Mundo Digital · Sistema operacional** · id **128** · pasta `src/games/EF05CO07/bairro-das-permissoes/`

> **(EF05CO07)** Reconhecer a necessidade de um sistema operacional para a execução de programas e gerenciamento do hardware.
>
> Exemplo oficial: os dispositivos físicos que compõem um computador não funcionam sozinhos. É preciso mostrar que a operação desses dispositivos é controlada por um software que denominamos Sistema Operacional (gerenciamento da memória, de sistemas de arquivos, de dispositivos de entrada e saída…).

**De onde veio (20/10/2026).** A ficha *Torre de Comando* repetia o Maestro do Sistema (082): programas pedindo recurso, fila, travado, botão de caos. O usuário escolheu, de uma lista de sete ideias, o *Porteiro das Permissões*, e mudou a forma: *"o jogador [...] está num bairro de componentes, e ele precisa ir nas casas que chamarem"*. Depois trocou a moto por *"uma criança mesmo correndo, e ela desliza um pouco enquanto corre, pra dificultar um pouco, mas ela deve ir andando até as casas, o bairro poderia ser maior, permitindo que a criança ande e explore mais e tenha mais casas (mas não deixe as casas uma perto da outra)"*. E mandou: *"faça o jogo só com N1, usando Graphics, as texturas eu adicionarei em breve"*.

---

## 0. Por que não é nenhum dos irmãos

| Irmão | O que a criança faz | O que o Bairro faz diferente |
|---|---|---|
| **Maestro do Sistema (082)** | dá a vez a programas que disputam uma peça só | ninguém disputa nada: a questão é **quem pode chegar perto da peça**, e a peça mora longe |
| **Sistema Operacional (037)** | toca na peça que atende o pedido, olhando o estado dela | o pedido já diz a peça. O que se julga é **se o programa precisa dela**, e quem atende é o corpo da criança indo até lá |
| **Um Dia no Celular (EF04CO07)** | no N3, uma janela de *Permitir / Não permitir* dentro de um celular simulado, como **dona** dos dados | aqui a criança **é o sistema**, não a dona. A permissão é o pedaço visível de uma coisa maior: os programas **não alcançam** as peças sem ela. No N2/N3 o NÃO também vem do estado da peça (ocupada, desligada pelo dono), que é gerenciamento de hardware e não ética de dados |
| **Kit do Solucionador (EF05CO11)** | anda pela vila com um raio de alcance | lá o verbo é cobrir casas; aqui é **levar ou recusar um pedido**, uma casa de cada vez |

---

## 1. O jogo em uma frase

**O bairro é o computador: os programas moram de um lado, as peças do outro, e só você, o SISTEMA, pode andar entre eles. Corra até a casa que chama e decida: PODE ou NÃO PODE?**

## 2. A habilidade na tela

| A habilidade pede | Onde está |
|---|---|
| **a necessidade** do SO | a abertura mostra o bairro **sem a criança**: os programas pedem das janelas, as oficinas das peças ficam de portão fechado, e nada acontece. Sem o sistema, ninguém se fala |
| o SO **executa programas** | o programa só funciona quando a peça chega: as Fotos tiram a foto, a Música toca |
| o SO **gerencia o hardware** | a peça mora numa oficina de portão fechado, e só o sistema abre. Quem decide quem usa a câmera é ele |
| dispositivos de entrada e saída | câmera e microfone (entram), alto-falante (sai) |
| sistema de arquivos | os CONTATOS moram numa casa de guardados: o sistema também cuida do que está salvo |

## 3. As três regras

1. **A casa que chama solta fumaça e tem uma seta em cima.** Corra até a porta dela.
2. **Na porta, o programa diz o que quer.** Se ele **precisa** daquilo para fazer o que faz, **PODE**. Se não precisa, **NÃO PODE**.
3. **PODE: vá buscar a peça na oficina dela.** O portão abre, a peça chega no programa, e ele funciona.

## 4. O corpo: correr e deslizar

O pedido do usuário foi um corpo no bairro, com um pouco de dificuldade de controle. Esse controle é **diversão e caminho**, nunca a prova: o catálogo encerra a partida em um erro, e **erro de dedo não pode encerrar** ([INSTRUCOES](../../INSTRUCOES.md#o-que-é-erro-e-o-que-não-é)).

| Plataforma | Gesto |
|---|---|
| **celular** | **segure o dedo** em qualquer ponto do bairro: a criança corre naquela direção. **Solte**, e ela desliza um pouco até parar |
| **computador** | o mesmo com o mouse, **ou** setas / WASD |

- **O deslize** é inércia: a criança acelera, tem velocidade máxima e, sem comando, perde velocidade aos poucos (uns 2 metros de tela). Na curva ela derrapa: a velocidade antiga demora a virar. Os números ficam em `RUN`, em `data/layout.ts`, para afinar jogando.
- **Bater** numa casa, árvore ou cerca só empurra de volta, com *boing* e um amassadinho. Nunca custa nada.
- **Chegar na porta freia sozinho.** A porta tem um raio largo; entrou nele, a criança para com uma derrapadinha. Assim o deslize não passa direto pela casa.
- **Entrar numa casa nunca é resposta.** A resposta é um botão (§6), e os botões só ligam meio segundo depois de o painel abrir: um dedo que vinha segurando para correr não aperta nada sem querer.
- **Sem cronômetro.** Com deslize e mapa grande, relógio vira prova de coordenação, e tempo esgotado encerra. A pressa é só de enfeite: a fumaça da casa que chama.

## 5. O bairro

**Mapa de 3000 × 1900**, cerca de três telas de largura. A câmera segue a criança.

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│   FOTOS          CÂMERA          CONTATOS         LANTERNA           │
│   (app)          (peça)          (guardado)       (app)              │
│ ═════════════════ rua de cima ═════════════════════════════════════  │
│  ║        🌳          🌳     ║     🌳         🌳           ║          │
│ ═╬══════════════ avenida ═══( ⛲ praça )════════════════════╬═════  │
│  ║    🌳           🌳        ║  ☺ começa aqui    🌳          ║          │
│ ═════════════════ rua de baixo ════════════════════════════════════  │
│   MÚSICA        ALTO-FALANTE      MICROFONE      CALCULADORA         │
│   (app)          (peça)           (peça)          (app)              │
└──────────────────────────────────────────────────────────────────────┘
~~~

- **Duas famílias de casa, que não se confundem.** **Casa de programa**: casinha colorida com telhado, porta redonda e uma **placa** no telhado com o desenho do que o programa faz. **Oficina de peça**: galpão cinza-azulado com **portão de enrolar** e a placa da peça. O nome de cada uma vai logo abaixo da placa, no beiral, escrito pelo código.
- **Casas longe umas das outras**, como pediu o usuário: no mínimo **650** de distância entre centros (a validação de `data/levels.ts` reclama em dev se ficar menos).
- **As ruas são do código**, e não da arte, porque dependem de onde as casas estão. A criança pode correr na grama também: rua é para se orientar, não é trilho.
- **Achar quem chama:** a casa que chama solta **fumacinha** e tem uma **seta que pula** em cima. Fora da vista, uma **setinha na borda da tela** aponta para ela (o mesmo módulo do Cabo Certo).

## 6. O laço de um chamado

1. **Uma casa de programa chama.** Fumaça, seta em cima, setinha na borda, e o alto diz **"As FOTOS estão chamando!"**.
2. **A criança corre até a porta.** Ao chegar, freia, e abre o **painel da porta**: o desenho do programa, uma seta e o desenho da peça; a frase *"O app de FOTOS quer a CÂMERA."*; e dois botões grandes e afastados, **PODE** (verde, ✔) e **NÃO PODE** (vermelho, ✖).
3. **PODE (e podia):** `CORRECT_ANSWER`. Um pedido com o desenho da peça passa a **flutuar em cima da criança**, a oficina da peça acende, e o alto diz **"Busque a CÂMERA!"**. Ela corre até o portão; ele **abre**, uma bolinha de luz sai da oficina e voa até a casa do programa (a câmera recua para mostrar as duas), e o programa **funciona**: flash nas Fotos, notas na Música. Legenda **PODE!**
4. **NÃO PODE (e não podia):** `CORRECT_ANSWER`. Um **carimbo NÃO** bate no desenho da peça, o programa murcha e a legenda diz **PROTEGIDO!**. A peça nem sai de casa.
5. **Chamado cumprido:** a bolinha do cabeçalho fica verde, e outra casa começa a chamar.
6. **Parou 7 segundos sem correr:** a mãozinha aparece segurando o dedo na direção da casa que chama.

## 7. O N1

| Chamado | Casa que chama | Quer | Resposta | Por quê, em palavra de criança |
|---|---|---|---|---|
| 1 | FOTOS (alto, esq.) | CÂMERA (alto, ao lado) | **PODE** | para tirar foto, precisa da câmera |
| 2 | LANTERNA (alto, dir.) | CONTATOS | **NÃO PODE** | a lanterna só ilumina: não precisa saber quem são seus amigos |
| 3 | CALCULADORA (baixo, dir.) | MICROFONE | **NÃO PODE** | a calculadora faz conta: não precisa ouvir você |
| 4 | MÚSICA (baixo, esq.) | ALTO-FALANTE (baixo, ao lado) | **PODE** | para tocar música, precisa do alto-falante |

- **Começa com PODE, perto de casa:** o primeiro chamado ensina o caminho inteiro (porta, botão, buscar a peça, o programa funcionando), e a oficina fica ao lado.
- **Os dois NÃO vêm no meio**, e são de peças diferentes (um guardado e um aparelho de entrada). Dizer "sempre PODE" ou "sempre NÃO" erra no N1.
- **O último PODE é o mais longe da criança** (ela atravessa o bairro inteiro): é a corrida mais gostosa, e vem quando ela já entendeu tudo.
- As outras casas do bairro existem, mas **não chamam** no N1. Elas são cenário e obstáculo, e mostram que o bairro é grande.

## 8. Acerto e erro

| Situação | O que acontece | Cobra? |
|---|---|---|
| PODE num pedido que precisa | pedido em cima da cabeça, buscar a peça, o programa funciona | acerto (+10) |
| NÃO PODE num pedido que não precisa | carimbo NÃO, PROTEGIDO! | acerto (+10) |
| **PODE num pedido que não precisa** | a peça voa até o programa, a casa dele treme contente e a faixa explica: *"A LANTERNA só ilumina. Ela não precisa dos seus CONTATOS!"* **A partida acaba** | `WRONG_ANSWER` + `lose()` |
| **NÃO PODE num pedido que precisa** | carimbo NÃO, a casa do programa apaga e a faixa explica: *"As FOTOS precisam da CÂMERA para tirar foto!"* **A partida acaba** | `WRONG_ANSWER` + `lose()` |
| bateu numa casa, árvore ou cerca | *boing*, volta um pouco | não |
| entrou na porta de uma casa que não chama | nada: a casa não abre | não |
| chegou no portão de uma oficina que ninguém pediu | o portão balança fechado | não |

A cena do erro **mostra antes e perde depois** (o padrão da 3ª rodada): a faixa fica 2,4 s na tela e só então sai o `lose()`.

## 9. A demonstração

Abre na primeira vez do nível e no **?** (ou tecla H). **Um toque no bairro pula.** O texto é uma legenda de poucas palavras no alto.

| Passo | Câmera | O que se vê | Legenda |
|---|---|---|---|
| 1 | recua para mostrar o bairro | os programas pedem com balões que tremem; os portões das oficinas ficam fechados com cadeado | **SEM O SISTEMA…** |
| 2 | — | os balões tremem mais, nada acontece | **NINGUÉM SE FALA!** |
| 3 | volta para a praça | a criança cai na praça com um pulinho | **VOCÊ É O SISTEMA!** |
| 4 | — | a mãozinha segura o dedo ao lado da criança; ela corre até lá; a mão solta e ela desliza | **SEGURE PARA CORRER** |
| 5 | — | — | **SUA VEZ!** (verde) |

O painel PODE / NÃO PODE não precisa de demonstração: ele mesmo é a pergunta, com os dois botões.

## 10. Telemetria e pontos

- `CORRECT_ANSWER` (+10) em cada decisão certa, na hora do toque.
- `WRONG_ANSWER` (−5) + `lose()` na decisão errada.
- `CHECKPOINT` a cada chamado cumprido, com o progresso em chamados.
- `GAME_COMPLETED` no fim do nível, com `totalStages: LEVELS.length` e 3 estrelas (quem chega ao fim não errou).

## 11. O que vem depois (N2 e N3, ainda não feitos)

Mesma mecânica; o bairro cresce e o NÃO ganha um segundo motivo.

- **N2 — o bairro abre a praça de cima.** Mapa maior (cerca de 3800 × 2400), duas casas novas (MAPA e JOGUINHO), e a peça LOCALIZAÇÃO. Pedidos que pedem mais de uma coisa: a **Videochamada quer a CÂMERA e o MICROFONE**, e a criança busca as duas, uma de cada vez. E pedidos menos óbvios: o Mapa quer a Localização (pode), o Joguinho quer os Contatos (não pode).
- **N3 — o dono manda.** Uma oficina amanhece com **cadeado do dono** (*"Microfone desligado"*): mesmo quem precisa recebe NÃO PODE, e a criança só descobre **indo até lá** (a exploração passa a contar). E uma peça **ocupada**: a Câmera está com as Fotos, a Videochamada pede, e a resposta é **ESPERAR**, um terceiro botão. Aqui entra o gerenciamento de hardware de verdade: o sistema não só autoriza, ele **organiza quem usa a peça agora**.

O código já está montado para isso: cada nível traz o próprio mapa (`world`, `houses`, `roads`, `trees`) e a lista de chamados, e o chamado tem `ok` para a resposta. Um chamado com várias peças e os estados de cadeado/ocupada ainda precisam entrar.

## 12. Arquivos

| Arquivo | O quê |
|---|---|
| `data/places.ts` | as casas: família (programa ou peça), nome, ícone, cor |
| `data/levels.ts` | o N1: tamanho do bairro, onde fica cada casa, ruas, árvores, os 4 chamados e a validação em dev |
| `data/layout.ts` | a grade da tela, a física da corrida (`RUN`), tamanhos das casas e do painel |
| `scenes/town.ts` | o chão, as ruas, as casas, as árvores, a fumaça, o portão, a bolinha de luz e as colisões |
| `scenes/runner.ts` | a criança: física, deslize, batida e animação |
| `scenes/door.ts` | o painel da porta: os dois desenhos, a frase, PODE e NÃO PODE, e o carimbo |
| `scenes/view.ts` | a câmera do bairro: seguir a criança, recuar para mostrar o bairro |
| `scenes/markers.ts` | a setinha da borda apontando a casa que chama |
| `scenes/hand.ts` | a mãozinha que segura o dedo para correr |
| `scenes/fallback.ts` | a arte de reserva em Graphics, nas mesmas chaves do [TEXTURAS.md](./TEXTURAS.md) |
