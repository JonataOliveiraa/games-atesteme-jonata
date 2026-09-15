# Guardião Ético — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF04CO07 · 4º ano · Cultura Digital · Segurança e responsabilidade no uso da
tecnologia**

---

## 0. Duas frases sobre o briefing, antes de tudo

O briefing é um teste de múltipla escolha moral: lê-se a situação e toca-se numa
das três atitudes — e a atitude certa é a que qualquer criança de nove anos
reconhece como "a resposta que o adulto quer ouvir": devolver sem ler, não
enviar, pedir permissão. **Isso não ensina postura ética com dados: ensina a
achar a carta bonitinha**, e o catálogo já tem exatamente esse jogo nesta
habilidade (§3).

**A troca:** a criança não escolhe uma atitude — ela **monta o que vai junto**.
O dado fica na mesa com as partes dele em etiquetas que se ligam e desligam, o
colega diz no balão o que ele precisa, e as pessoas que estão dentro do dado
reagem **antes** de qualquer envio. Depois ela MANDA, ou diz que NÃO DÁ. O resto
deste documento planeja essa versão.

O que mais caiu do briefing, e por quê:

| Briefing | Aqui | Por quê |
|---|---|---|
| medidor de CONFIANÇA com 5 corações | não existe | é uma segunda barra de vida por cima do `createLives`, que já é quem reprova no catálogo |
| DILEMA: a carta vantajosa dá **+10 pontos** e **−1 coração** | o pedido tentador continua, sem número nenhum | número de ponto na tela é proibido pelo `INSTRUCOES.md`, e era o placar que tornava o dilema legível |
| 5 rodadas por partida, sorteadas de um banco de 12 | 3 níveis × 3 fases, escritas | o catálogo manda no máximo 5 fases por nível, e sorteio esconde a progressão |
| 3 cartas de atitude com frase pronta | 3 etiquetas com **uma palavra** e um pictograma | três frases lado a lado viram leitura comparada, que é o que uma criança de nove anos ainda não faz de graça |
| efeito atrasado ("lembra do caderno?") no N2 | a **prateleira**: o que saiu fica lá até o fim da partida | o eco do briefing era texto; a prateleira é objeto |
| "final dourado / os colegas conversam com você" | `showLevelComplete` do catálogo, com a prateleira dentro | fechamento igual ao dos outros 49 jogos |

O que ficou inteiro do briefing: a sala do clube, os quatro colegas cuja cara
muda, a TRAVA antes de o gesto comprometer, a recusa como resposta legítima, e as
quatro ações da habilidade — coletar, guardar, transferir e usar (§2).

**As sete linhas de `gameInstructions.ts` para `guardiao-etico` já estão escritas
na árvore** e descrevem esta versão. Este plano as honra à letra, com uma
correção: quem pede é **sempre um dos quatro colegas** (§16), então "os quatro
colegas" são as quatro pessoas que estão dentro do dado — e é a cara deles que a
criança lê.

---

## 1. O jogo em três regras

1. **Um colega pede alguma coisa. O balão diz o que ele PRECISA — nunca em qual etiqueta tocar.**
2. **As três etiquetas dizem o que vai junto. Toque põe, toque tira, e a cópia na mesa muda na hora.**
3. **Olhe a cara dos quatro antes de MANDAR. Quem fica exposto encolhe. Quando não tem jeito, NÃO MANDAR é a resposta.**

Não existe mais nada para aprender, do primeiro ao último nível.

---

## 2. A habilidade, e o teste que ela precisa passar

> **(EF04CO07)** Demonstrar postura ética nas atividades de **coleta**,
> **transferência**, **guarda** e **uso** de dados.
>
> Objeto: **Segurança e responsabilidade no uso da tecnologia**. Exemplo oficial:
> um painel, feito a partir de imagens de celular e computador, em que os alunos
> destacam ações importantes de quando se manipula um dado — verificar as
> permissões, a autoria, entre outras.

| O verbo oficial | Onde ele está na mecânica |
|---|---|
| **coletar** | as etiquetas: só entra na cópia o que o pedido precisa. Ligar o que ninguém pediu já expõe alguém |
| **transferir** | o **destino** de cada pedido, e o alcance dele: a mesma etiqueta serve para o mural da sala e não serve para o site |
| **guardar** | a **prateleira**: o que saiu fica lá, do jeito que saiu, até o fim da partida — e não volta |
| **usar** | o nível 3: o desenho é de alguém, o nome do autor vai junto, e quem decide se pode é ele |
| "verificar as permissões e a autoria" | não é um cartaz na parede: é a **cara das pessoas mudando** enquanto a criança monta a cópia |

### O teste da bolinha

> Troque a foto, a lista e o desenho por bolinhas coloridas sem significado. O
> jogo muda?

**Acaba.** A regra inteira sai de quem está dentro do dado: ligar uma etiqueta é
mexer no que é de alguém, e é a reação dessa pessoa que diz se pode. **Bolinha
não tem cara.** Sem gente, sobram três interruptores e um botão verde, e não há
como saber o que está certo — nem como errar de propósito.

O contrário também vale, e é o que reprova o briefing: naquele formato, trocar as
situações por bolinhas **não muda nada**. As três cartas continuam sendo três
cartas, uma delas marcada como certa, e a criança continua tocando na que parece
mais gentil. A situação é decoração.

### O que a correção comprou

- a resposta **não está escrita em lugar nenhum** — nem na carta, nem na
  etiqueta. Ela é o cruzamento de três coisas visíveis: o que o pedido precisa,
  para onde vai, e quem está dentro;
- a mesma etiqueta é **certa numa fase e errada na outra** (o `ORIGINAL` do
  desenho, §7), porque quem mudou foi o dono e o destino;
- **recusar é uma resposta**, e recusar sempre também é errado;
- e não existe "atitude bonitinha" para chutar: as três etiquetas são neutras —
  `ROSTOS`, `NOMES` e `ONDE FOI` não têm lado moral até alguém pedir alguma coisa.

---

## 3. Como isso não vira o jogo irmão

`EF04CO07` já tem jogo publicado: **Missão Ética Digital** (id `029`,
`points: 65`). Sem esta tabela, os dois seriam o mesmo jogo com outra arte.

| | Missão Ética Digital | Guardião Ético |
|---|---|---|
| **gesto** | escolher 1 de 3 ações prontas | ligar/desligar as partes do dado e então MANDAR — ou NÃO MANDAR |
| **onde está a resposta** | na etiqueta do arquivo: autor, permissão e aviso, escritos | na cara das pessoas que estão dentro do dado, ao vivo |
| **o que a criança produz** | nada: a ação já vem escrita | a cópia — ela monta o que sai |
| **quem decide o certo** | o campo `certa: boolean` da ação | uma função do pedido + destino + dono (§8) |
| **a consequência** | acontece com o arquivo e passa | fica na prateleira até o fim da partida |
| **recusar** | não existe | é um botão, e às vezes é a única resposta certa |
| **quantos dados por partida** | seis arquivos diferentes | **um só por nível**, passando de mão em mão |

Restrições que valem para a implementação, para a distância não encolher durante
a construção: **nada de etiqueta com a permissão escrita atrás da ficha**, **nada
de ação pronta em forma de frase**, e **nenhum campo `certa` em lugar nenhum do
`levels.ts`**.

---

## 4. A tela

~~~text
┌──────────────────────────────────────────────────────────────────────┐
│ NÍVEL 1  ●○○            O que vai junto?            ♥♥♥          ?   │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────┐                                ┌──────────────┐ │
│ │ A gente podia    │   (☺)   (･_･)   (☺)   (☺)      │ PRA ONDE VAI │ │
│ │ lembrar do       │   Téo    Bia    Rafa  Duda     │  ▤ o mural   │ │
│ │ passeio todo dia │                                │    da sala   │ │
│ └────────▽─────────┘  ┌───────────────────────────┐ ├──────────────┤ │
│                       │   ▨▨ a cópia ▨▨   •nomes  │ │  PRATELEIRA  │ │
│                       │   [ conteúdo ]    •onde   │ │  ▭ ▭ ▭       │ │
│                       └───────────────────────────┘ │              │ │
├──────────────────────────────────────────────────────────────────────┤
│ [ NÃO MANDAR ]      [ROSTOS] [NOMES] [ONDE]           (  MANDAR  )   │
└──────────────────────────────────────────────────────────────────────┘
~~~

Cinco coisas, e elas não trocam de lugar em nenhuma das nove fases: **o pedido**
(balão à esquerda, com o rabicho apontando para quem falou), **os quatro
colegas** (em cima, atrás da mesa), **a cópia** (no meio da mesa, grande), **para
onde ela vai e o que já saiu** (coluna da direita) e **os controles** (embaixo).

O que compromete fica nos dois cantos de baixo, um em cada polegar: **NÃO
MANDAR** à esquerda, debaixo de quem pediu, porque é uma resposta à pessoa;
**MANDAR** à direita, debaixo da porta, porque é o que empurra a cópia para lá.

### Medidas (1280 × 720) — a última coluna é o que o dedo encontra no celular

| Faixa | y | x | Conteúdo | Tamanho | No celular (× 0,30) |
|---|---:|---|---|---:|---:|
| cabeçalho | 0–82 | 0–1280 | pílula do nível (20), bolinhas das fases (188+), "O que vai junto?" (meio), vidas (1020), `?` (1206) | alvo do `?` 136 × 136 | 41 × 41 |
| balão do pedido | 100–256 | 20–350 | até 3 linhas de 32 px; rabicho aponta para quem falou | 330 × 156 | 99 × 47 |
| os quatro colegas | 96–270 | 375–1005 | bustos, cx 450 / 610 / 770 / 930 | 150 × 174 | 45 × 52 |
| a cópia (o dado) | 286–548 | 420–980 | o que está sendo montado | 560 × 262 | 168 × 79 |
| — o conteúdo | dentro | 440–740 | a foto, a lista ou o desenho | 300 × 200 | 90 × 60 |
| — as marcas | dentro | 760–960 | uma tira por etiqueta ligada | 200 × 52 | 60 × 16 |
| a porta (o destino) | 96–248 | 1020–1264 | pictograma + duas palavras | 244 × 152 | 73 × 46 |
| a prateleira | 264–548 | 1020–1264 | 3 vagas de 88; cada cópia enviada 212 × 72 | 244 × 284 | 73 × 85 |
| **NÃO MANDAR** | cy 638 | cx 150 | o único jeito de responder "não dá" | 240 × 148 | **72 × 44** |
| **etiquetas** | cy 638 | cx 480 / 650 / 820 | uma palavra + pictograma + estado | 156 × 148 | **47 × 44** |
| **MANDAR** | cy 638 | cx 1150 | o botão que compromete | 236 × 160 | **71 × 48** |

Medidas que não se negociam:

- **A mesa de controles começa em y = 560 e a cópia termina em y = 548.** Doze
  pixels de folga, e nada desce para dentro dessa faixa: a cópia enviada sobe em
  arco **para a porta**, nunca para baixo. Painel cortando área de jogo já custou
  caro duas vezes neste projeto.
- **134 px (40 reais) entre a última etiqueta e o MANDAR**, e 132 px entre o NÃO
  MANDAR e a primeira etiqueta. Mexer é de graça; só quem compromete precisa de
  distância.
- **Os dois botões que comprometem não têm a mesma silhueta.** MANDAR é largo,
  verde, com o desenho de um envelope saindo; NÃO MANDAR é mais baixo, de
  contorno, com a mão aberta. Dois botões iguais em cantos diferentes é o erro
  que a criança comete com o polegar, não com a cabeça.
- **Os quatro colegas nunca mudam de posição**, em nenhum nível e em nenhuma
  fase: é a fileira que a criança aprende a varrer com o olho. Tocar num deles
  **não muda estado nenhum** — ele olha para a própria etiqueta e ela pulsa uma
  vez. Toque livre e sem consequência, porque a criança vai tocar.
- **A etiqueta mostra o estado dentro dela**: acesa com o pictograma cheio,
  apagada com o pictograma vazado e um risco. E a cópia mostra a consequência —
  a mesma informação nos dois lugares.
- **O balão fica sempre no mesmo canto.** O rabicho é que se dobra na direção de
  quem falou. Texto que anda pela tela é texto que a criança perde.

---

## 5. O laço

~~~text
A FASE COMEÇA
→ o colega dá um passo à frente, o balão datilografa o pedido
→ a porta da direita mostra PARA ONDE vai
→ a cópia aparece na mesa, vazia: só o conteúdo, sem nenhuma etiqueta

A CRIANÇA LIGA E DESLIGA AS ETIQUETAS
→ a cópia muda no mesmo quadro: o nome aparece, o rosto sai de trás da tarja
→ quem fica exposto ENCOLHE na hora — antes de qualquer envio
→ quem autorizou ACENA com a cabeça
→ mexer é de graça: não conta tentativa, não tira vida, não emite nada

ELA APERTA MANDAR                          ou APERTA NÃO MANDAR
→ a cópia descola da mesa                  → ela levanta a mão, a porta se fecha
  e sobe em arco até a porta
     ↳ certo : a porta abre, a cópia          ↳ certo : o colega faz cara de
               entra e cai na prateleira                quem entendeu
     ↳ errado: uma mão segura a cópia         ↳ errado: o colega fica chateado,
               na soleira e devolve                     e o bilhete diz o que
                                                        dava para mandar
~~~

**Montar e mandar são coisas separadas, e essa é a única regra fina do jogo.** Se
cada toque numa etiqueta fosse uma tentativa, experimentar — que é como a criança
descobre quem se incomoda com o quê — custaria vida, e ela pararia de
experimentar exatamente onde o jogo ensina.

**A cópia errada nunca chega na prateleira.** Ela é segurada na soleira da porta
e volta. Sem isso, "o que sai não volta mais" tornaria a fase impossível de
terminar depois de um erro — e o §5 do PLANEJAMENTO MODAL é claro: nenhum estado
sem saída. O que a criança vê, por um instante, é a cópia parada na porta com a
exposição à mostra: o quase-acontecido é o que ensina.

---

## 6. Controle — um toque

| Alvo | O que faz | Custa |
|---|---|---|
| **etiqueta** (3) | liga / desliga; a cópia muda no mesmo quadro | nada |
| **MANDAR** | envia a cópia como ela está | é a resposta |
| **NÃO MANDAR** | responde "não dá" ao pedido | é a resposta |
| colega (4) | ele olha para a própria etiqueta, que pulsa uma vez | nada |
| `?` | pausa e repete o tutorial | nada |

No computador: **1 / 2 / 3** nas etiquetas, **barra de espaço** manda, **N**
recusa — exatamente o que as instruções do catálogo já prometem.

**Nada de arrastar, em nenhum nível.** Reorganizar não existe: um toque põe, um
toque tira.

**O NÃO MANDAR aparece do nível 2 em diante, e aí aparece em TODAS as fases do
nível.** Botão que só nasce na fase em que ele é a resposta entrega a resposta.
No nível 1 ele não existe, e o jogo é só "o que vai junto".

---

## 7. Três níveis, três dados

**Fase = um pedido.** O nível acaba quando os três pedidos daquele dado foram
respondidos. **Uma partida inteira é um dado só por nível**, passando de mão em
mão — é o que faz a criança olhar a mesma coisa de três ângulos, em vez de
conhecer seis arquivos por cima.

| Nível | O dado | Etiquetas | O que entra |
|---|---|---|---|
| **1** | a **foto do passeio** ao parque, com os quatro | `ROSTOS` · `NOMES` · `ONDE FOI` | só vai o que o pedido precisa |
| **2** | a **lista da turma** para a festa junina | `NOMES` · `TELEFONES` · `ENDEREÇOS` | o dono e o alcance do destino — e o **NÃO MANDAR** |
| **3** | o **desenho do Rafa** (o dragão) | `AUTOR` · `ORIGINAL` · `CONTATO` | o autor, e a autorização dele |

### Nível 1 — a foto do passeio · *só vai o que precisa*

| Fase | Quem pede, e o que sente | Pra onde vai | Precisa de |
|---|---|---|---|
| 1.1 | **Duda:** *"A gente podia lembrar do passeio todo dia na sala."* | o mural da sala (a turma) | `ROSTOS` |
| 1.2 | **Rafa:** *"O jornal da escola perguntou pra onde a nossa turma foi."* | o jornal da escola | `ONDE FOI` |
| 1.3 | **Téo:** *"Quero combinar o próximo passeio com quem foi nesse."* | o caderno do clube | `NOMES` |

Cada fase precisa de **uma** etiqueta, e nunca a mesma — não dá para vencer o
nível decorando uma combinação. O distrator é o mesmo nas três: a cópia fica mais
bonita com tudo ligado, e ligar o que ninguém pediu faz três pessoas encolherem
de uma vez.

A 1.1 começa com o tutorial.

### Nível 2 — a lista da turma · *o dono, e até onde ele deixa*

| Fase | Quem pede | Pra onde vai | Precisa de | Resposta |
|---|---|---|---|---|
| 2.1 | **Bia:** *"Se a festa mudar de dia, alguém tem que avisar os pais."* | o grupo dos pais | `NOMES` + `TELEFONES` | mandar |
| 2.2 | **Téo:** *"O tio da van quer buscar todo mundo em casa."* | o motorista, fora da escola | `NOMES` + `ENDEREÇOS` | **NÃO MANDAR** |
| 2.3 | **Duda:** *"Preciso saber quem traz o bolo pra barraca."* | o mural da festa | `NOMES` | mandar |

A 2.1 é a primeira fase que precisa de **duas** etiquetas — e é ela que ensina
que "menos" não é a regra: a regra é "o que precisa". A 2.2 é a primeira em que
**não existe combinação que sirva**: o endereço é justamente o que o pedido
precisa, e a família da Bia não deixa o endereço dela sair da escola. Ela encolhe
assim que a etiqueta acende, e continua encolhida enquanto estiver acesa. Depois
da recusa, o Téo entende: *"É... melhor cada família falar com ele."*

### Nível 3 — o desenho do Rafa · *o autor decide*

| Fase | Quem pede | Pra onde vai | Precisa de | Resposta |
|---|---|---|---|---|
| 3.1 | **Duda:** *"Esse dragão ia ficar lindo no cartaz da festa."* | o cartaz, no pátio da escola | `AUTOR` | mandar |
| 3.2 | **Téo:** *"Um site de figurinhas dá figurinha pra turma toda se a gente mandar um desenho!"* | o site, fora | `AUTOR` + `ORIGINAL` | **NÃO MANDAR** |
| 3.3 | **Bia:** *"A cidade abriu um concurso de desenho, e o Rafa quer entrar."* | o concurso, fora | `AUTOR` + `ORIGINAL` + `CONTATO` | mandar |

**A 3.2 e a 3.3 são o jogo inteiro em duas fases.** A combinação recusada na 3.2
é a certa na 3.3 — mesmas etiquetas, mesmo alcance, resposta contrária — porque
quem mudou foi o dono: na 3.2 o Rafa encolhe quando o `ORIGINAL` acende, na 3.3
ele **acena com a cabeça** e sorri. Não é o dado que decide, é a pessoa.

E é a 3.1 que quebra o hábito construído nos dois primeiros níveis: até aqui,
ligar etiqueta incomodava alguém; agora **tem coisa que precisa ir junto**, e o
autor fica orgulhoso quando o nome dele vai. Ética de dados não é mandar o mínimo
possível — é mandar o que a pessoa combinou.

A 3.2 é o dilema do briefing, sem número nenhum: um amigo querendo muito, uma
recompensa para a turma toda, e uma pessoa que não quer. Depois da recusa, o Téo
faz cara feia por um segundo e depois dá de ombros — **recusar não faz a criança
perder amigo**, e ela precisa ver isso.

### As três fases de cada nível somam 30; os três níveis somam 90

`points: 90` na ficha do catálogo, estrelas 90 / 70, dez por fase. O valor por
fase sai de `30 / fases.length`, nunca escrito na mão: acrescentar uma quarta
fase continua fechando 90.

### O cabeçalho, no padrão da família

~~~text
[NÍVEL 1]  ●○○        O que vai junto?        ♥♥♥        ( ? )
~~~

Pílula do nível, uma bolinha por fase, o que fazer no meio, vidas e `?` — a mesma
ordem do Canhão das Coordenadas, do Cofre dos Registros e da Pista Binária. A
bolinha acende quando a fase é respondida, e **a cópia que saiu fica na
prateleira**, que é o álbum deste jogo.

---

## 8. As regras, em código

Nenhuma ação guarda se é certa. O veredito é calculado no instante em que a
criança aperta, a partir de três coisas visíveis na tela: o que o pedido precisa,
o alcance do destino e quem é dono do quê.

~~~ts
type Alcance = 'turma' | 'escola' | 'familia' | 'fora'
const LONGE: Record<Alcance, number> = { turma: 0, escola: 1, familia: 2, fora: 3 }

interface Dono {
    pessoa: PessoaId
    /** Até onde o dado DESTA pessoa pode ir, neste dado. */
    ate: Alcance
}

interface Dado {
    conteudo: 'foto' | 'lista' | 'desenho'
    etiquetas: EtiquetaDef[]        // exatamente 3
    donos: Record<EtiquetaId, Dono[]>
}

interface Pedido {
    quem: PessoaId
    fala: string                    // o que ele SENTE. Nunca o nome de uma etiqueta
    destino: DestinoId
    precisa: EtiquetaId[]
    /** O que o dono autorizou EXPRESSAMENTE neste pedido — e acena na tela. */
    autorizadas?: EtiquetaId[]
}

/** Alguém fica exposto quando o dado dele sai SEM PRECISAR, ou vai LONGE DEMAIS. */
const expoe = (id: EtiquetaId, marcadas: Set<EtiquetaId>, p: Pedido, d: Dado) =>
    marcadas.has(id)
    && !(p.autorizadas ?? []).includes(id)
    && (!p.precisa.includes(id)
        || d.donos[id].some(dono => LONGE[alcance(p.destino)] > LONGE[dono.ate]))

/** Quem encolhe AGORA, antes de qualquer envio. É isto que a tela desenha. */
const incomodados = (marcadas: Set<EtiquetaId>, p: Pedido, d: Dado) =>
    d.etiquetas
        .filter(e => expoe(e.id, marcadas, p, d))
        .flatMap(e => d.donos[e.id].map(dono => dono.pessoa))

const podeMandar = (marcadas: Set<EtiquetaId>, p: Pedido, d: Dado) =>
    p.precisa.every(id => marcadas.has(id))
    && d.etiquetas.every(e => !expoe(e.id, marcadas, p, d))

/** Recusar é a resposta quando nem o que o pedido PRECISA pode sair. */
const deveRecusar = (p: Pedido, d: Dado) =>
    !podeMandar(new Set(p.precisa), p, d)

const veredito = (acao: 'mandar' | 'recusar', marcadas: Set<EtiquetaId>, p: Pedido, d: Dado) =>
    acao === 'recusar'
        ? deveRecusar(p, d)
        : !deveRecusar(p, d) && podeMandar(marcadas, p, d)
~~~

Três consequências que valem mais que o código:

1. **`deveRecusar` é derivado, não escrito.** Nenhuma fase declara "esta é de
   recusar": isso sai do próprio pedido. Uma fase não fica com a resposta trocada
   por engano de digitação.
2. **A mesma etiqueta muda de veredito** quando muda o destino ou o dono — é o
   que o §11 do PLANEJAMENTO MODAL exige ("a regra é uma função, nunca um
   campo"), e é o que faz a 3.2 e a 3.3 serem fases diferentes com a mesma
   combinação.
3. **`autorizadas` não é gabarito escondido**, porque está na tela: a pessoa
   acena com a cabeça quando a etiqueta dela acende. A criança lê a autorização
   do mesmo jeito que lê o incômodo — na cara.

### Validação ao carregar

O nível não sobe se alguma destas falhar:

- o nível tem de 1 a 5 fases, e o dado tem exatamente 3 etiquetas;
- todo `precisa` é não-vazio e só cita etiquetas que existem no dado;
- entre as **8 combinações** possíveis, mais a recusa, **exatamente uma** passa no
  `veredito` — se duas passassem, a TRAVA seria injusta; se nenhuma passasse, a
  fase seria impossível; e se a combinação vazia passasse, não fazer nada venceria
  a fase;
- o nível 1 não tem nenhuma fase de recusar; os níveis 2 e 3 têm **pelo menos uma
  e no máximo duas** — recusa em todas ensinaria "nunca mande nada", que é tão
  errado quanto mandar tudo;
- nenhuma `fala` contém o rótulo de uma etiqueta. O balão diz a necessidade, nunca
  o botão.

---

## 9. O erro, a TRAVA e as vidas

### Mandar com a cópia errada

1. A cópia sobe até a porta e **uma mão a segura na soleira** — o gesto acontece
   inteiro, sem bronca, e a criança vê o que quase saiu.
2. Ela volta para a mesa. O balão troca para o **bilhete**, âmbar, uma linha:
   *"A Bia ia junto sem ter combinado."* / *"O jornal não pediu os nomes."* /
   *"Falta o que o Téo precisa pra saber quem foi."*
   Nunca "tente de novo", nunca o nome do botão, nunca a combinação.
3. O MANDAR ganha um cadeado. **Mexer em qualquer etiqueta destrava**, porque
   mexer é o único jeito de corrigir.
4. **No segundo erro da mesma fase**, a etiqueta que está atrapalhando pulsa — a
   primeira que estiver faltando, ou a primeira que estiver expondo alguém. Ela
   pulsa, não se resolve sozinha: quem liga ou desliga continua sendo a criança.

### Recusar quando dava para mandar

Mesma coreografia, com o bilhete do outro lado: *"Mas o que o Téo precisa dava
pra mandar sem incomodar ninguém."* **Ignorar não é responder** — recusar por
precaução é uma decisão, e custa igual.

### O que a TRAVA não pode ser

- **nunca vermelho de bronca**: o bilhete é âmbar de dica, como no resto do
  catálogo;
- **nunca a resposta**: nem o bilhete nem o pulso da etiqueta dizem ligar ou
  desligar;
- **nenhum estado sem saída**: toda etiqueta volta com um toque, e a cópia errada
  nunca chega na prateleira;
- **demorar não trava.** Não há relógio: o tempo seria contado justamente enquanto
  a criança olha a cara da Bia e decide, que é o momento em que ela aprende.

### Contabilidade

- **`WRONG_ANSWER` + `lives.lose()` uma vez por fase**, no primeiro erro. Os
  seguintes na mesma fase não custam outra vida, e **o contador zera em toda
  fase**.
- **`CORRECT_ANSWER` uma vez por fase:** **+10** de primeira, **+5** depois de
  travar. Nove fases fecham 90.
- **Não são erro:** ligar e desligar etiqueta, tocar num colega, abrir o `?`,
  demorar, mudar de ideia.
- `createLives` decide o `GAME_OVER` no zero. O jogo não o emite nunca.
- **Nenhum ponto, porcentagem ou contagem em texto na tela.** O placar é a
  prateleira.

---

## 10. Feedback

| Momento | Visual | Som |
|---|---|---|
| a fase começa | o colega dá um passo à frente e cresce 6 %; o balão datilografa; a porta mostra o destino | duas notas curtas, subindo |
| toque na etiqueta | o botão afunda e volta (`back`); a marca entra ou sai da cópia no mesmo quadro | clique seco — **agudo ao ligar, grave ao desligar** |
| **alguém fica exposto** | a pessoa **encolhe**: ombros para dentro, mãos no rosto; uma linha fina liga a etiqueta acesa até ela | nota curta e baixa, **nunca alarme** |
| **alguém autorizou** | a pessoa **acena com a cabeça** e o contorno dela pulsa em verde | duas notas, curtas e claras |
| MANDAR | a cópia descola da mesa e sobe em arco até a porta | "clac" de envelope |
| **certo** | a porta abre, a cópia entra, cai na prateleira e acende; quem pediu comemora; faíscas na **silhueta dele**; a moldura da tela pisca verde | fanfarra `[523, 659, 784, 1047]` a cada 110 ms |
| **errado** | uma mão segura a cópia na soleira, a porta fecha, a cópia volta girando; cadeado no MANDAR; bilhete âmbar | "hm?" grave curto |
| NÃO MANDAR certo | a criança levanta a mão, a porta fecha devagar, quem pediu faz cara de quem entendeu e dá de ombros | dois toques secos, calmos |
| NÃO MANDAR errado | quem pediu cruza os braços; bilhete âmbar dizendo o que dava para mandar | "hm?" grave curto |
| fase concluída | a bolinha do cabeçalho acende; a cópia fica visível na prateleira | gole curto |
| **fim do nível** | a prateleira cresce até o meio da tela e as três cópias se abrem, uma a uma, mostrando o que saiu de cada vez; os quatro colegas entram atrás | fanfarra e confete |
| painel | `showLevelComplete`, título curto, bolinhas de nível | fanfarra |

O "uau" é o penúltimo: **as três cópias que a criança montou, lado a lado, com o
que ela deixou ir em cada uma.** É a prova de que aquilo tudo era um dado só, e é
o painel que o exemplo oficial da BNCC pede — feito pela criança, não pendurado
na parede pelo jogo.

Tudo sintetizado em WebAudio, sem arquivo, respeitando `mute-audio` do
`EventBus`. Sem narração: balão e pictograma. O brilho de vitória é a **silhueta
de quem pediu** — círculo destaca um lugar, silhueta destaca ELE.

E o contrário, que também é regra: **o brilho da porta não pode cobrir os
colegas.** A cara deles é a regra do jogo; tapar a regra no instante da decisão
foi o erro que o Ritmo da Rotina já cometeu com o brilho amarelo.

---

## 11. Tutorial e `?`

**Três passos**, na fase 1.1, com a cena já montada — o tabuleiro entra **antes**
do tutorial, senão o recorte ilumina tela vazia. Cada fala diz o que FAZER ou
qual é o objetivo:

1. *"A Duda quer a foto no mural da sala."* — recorte no balão e na Duda.
2. *"Toque numa etiqueta e olhe a foto mudar."* — recorte na etiqueta `ROSTOS`,
   dedo batendo (`tap: true`).
3. *"Se ninguém ficar encolhido, é só MANDAR."* — recorte nos quatro colegas e
   depois no MANDAR.

**O balão do tutorial nunca cobre o que ele explica:** no passo 2 ele fica em
cima à esquerda, fora da cópia; no passo 3, embaixo à esquerda, fora da fileira.

Um passo extra por nível (`key: 'ef04co07ge-lN'`), com uma frase só:

- **N2:** *"Quando não tem jeito de mandar, diga NÃO DÁ."* — recorte no NÃO
  MANDAR, que estreia aqui.
- **N3:** *"Este desenho é do Rafa. Pergunte pra ele com os olhos."* — recorte no
  Rafa.

Antes do primeiro pedido do nível 1, **uma demonstração muda de 5 s, pulável**: a
mão-fantasma liga `NOMES`, a Bia encolhe, a mão desliga, a Bia relaxa. Sem uma
palavra — é a regra inteira do jogo em cinco segundos.

O `?` fica sempre visível no cabeçalho com alvo de 136 px, pausa o jogo por flag
(nunca `scene.pause()`, que mataria tween e toque) e reabre o painel.

---

## 12. Antes da arte existir

Reserva em `Graphics` para tudo, no tamanho final: o colega vira uma cápsula com
cabeça redonda e duas cores (e **encolhe do mesmo jeito**, porque a reação é
tween, não desenho); a cópia vira um cartão claro com o retângulo do conteúdo; o
conteúdo vira um retângulo com o nome do dado; o destino vira um quadrado com o
pictograma desenhado. As texturas entram por `import.meta.glob` +
`textures.exists()`, **nunca por `import` estático** — um arquivo que ainda não
existe quebraria o `vite build` inteiro.

**O jogo tem de ser jogável e vencível com zero textura carregada.** São
`Graphics`: os botões, as etiquetas, o cartão da cópia, as marcas, o balão, o
bilhete, o cadeado, a porta, a prateleira, as cópias guardadas, o `?`, o
cabeçalho, as vidas, as bolinhas, as estrelas, as faíscas e a moldura da tela.

### Ordem de produção

1. **Só o nível 1**, com reserva em `Graphics`, jogado de ponta a ponta — é o que
   o `INSTRUCOES.md` manda, e é o que o usuário avalia antes de existir arte.
2. A TRAVA vista acontecendo, e a reação de encolher vista **antes** do envio.
3. As texturas do [TEXTURAS.md](./TEXTURAS.md), medidas pela caixa alfa e
   ancoradas no layout — nunca esticadas para caber.
4. Níveis 2 e 3, que não acrescentam nenhum desenho novo: só pedidos, destinos e
   donos.

---

## 13. Arquitetura

~~~text
src/games/EF04CO07/guardiao-etico/
├── PLANEJAMENTO.md · TEXTURAS.md
├── index.ts          1280 × 720, Scale.FIT + CENTER_BOTH, [BootScene, GameScene]
├── types.ts          Alcance, Dono, Dado, Pedido, LevelDef, Fase
├── data/
│   ├── layout.ts     as coordenadas do §4, com o porquê dos números
│   ├── theme.ts      cores, fontes, tamanhos
│   ├── elenco.ts     as quatro pessoas e os destinos (nome, pictograma, alcance)
│   └── levels.ts     LEVELS + as funções puras do §8 + a validação
└── scenes/
    ├── BootScene.ts  import.meta.glob + createLoadingScreen + faseInicial
    ├── GameScene.ts  orquestra e não desenha nada
    ├── room.ts       o clube, a mesa e a luz
    ├── cast.ts       os quatro, e as reações (encolher, acenar, comemorar)
    ├── record.ts     a cópia: o conteúdo, as marcas e o voo até a porta
    ├── door.ts       o destino, a abertura, a mão que segura na soleira
    ├── shelf.ts      a prateleira e as cópias guardadas
    ├── controls.ts   etiquetas, MANDAR, NÃO MANDAR, teclado
    ├── balloon.ts    o pedido, o bilhete e o rabicho que aponta
    ├── effects.ts    painters puros e FX locais
    └── audio.ts      WebAudio direto
~~~

**A `GameScene` não desenha.** Se ela precisar de um `fillRoundedRect`, falta um
painter num módulo de `scenes/`. Todo `createX` devolve
`{ container, ...métodos, destroy() }`.

~~~ts
type Fase = 'entrando' | 'montando' | 'enviando' | 'travado' | 'resolvido' | 'pausado'
~~~

Cuidados que já custaram caro em jogos deste projeto:

- congelar com **flag**, nunca `scene.pause()`;
- as zonas de toque são **zonas soltas de cena**, criadas na posição definitiva e
  destruídas na mão no `destroy()` — nada de zona invisível maior que o desenho;
- a reação dos colegas é recalculada **a cada toque**, a partir do estado, e nunca
  guardada num campo do sprite;
- o `gen` (contador de geração) protege todo `await`, senão uma animação de envio
  atrasada escreve na fase seguinte;
- o saldo de vidas atravessa o `scene.restart` (`lives: this.livesLeft`).

Reusar sem reimplementar: `createLoadingScreen`, `faseInicial`, `vidasIniciais`,
`createLives`, `createTutorial`, `showLevelComplete`, `FX`, `runtimeGameBridge`.
`LEVELS` mora só em `data/levels.ts`.

### A conversa com a plataforma

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, com o primeiro pedido na tela |
| `CORRECT_ANSWER` | uma vez por fase respondida certo |
| `WRONG_ANSWER` | no primeiro erro de cada fase |
| `CHECKPOINT` | a cada fase, `progress: Math.round(feitas / fases * 100)` |
| `GAME_COMPLETED` | ao fim de **cada** nível, `stage: this.level.level`, `totalStages: LEVELS.length` |
| `GAME_OVER` | nunca à mão — é do `createLives` |

`stage` sai de `this.level.level`, nunca escrito na mão. Nunca escrever
`isFinalStage`. Importar `runtimeGameBridge`, nunca `gameBridge`.

**Sobre a telemetria do briefing:** "escolhas por tema, comportamento no dilema,
corações finais" não existe — a ponte tem os eventos da tabela acima e mais nada.
O que a plataforma mede é acerto e erro por fase, e é melhor dizer isso aqui do
que planejar um relatório que ninguém vai receber.

---

## 14. Registro

| Onde | O que |
|---|---|
| `src/data/catalog.ts` | entrada nova: id **`074`**, slug `guardiao-etico`, module `EF04CO07/guardiao-etico`, skill `EF04CO07`, `years: [4]`, `order: 295` (entre o 290 do irmão e o 300 do EF04CO08), `status: "draft"`, `points: 90`, ícone 🛡️, tags `["dados", "ética", "privacidade", "autoria"]`, thumbnail `coverGuardiaoEtico` |
| `src/data/gameInstructions.ts` | **já existe** — as sete linhas de `guardiao-etico`. Conferir no fim se ainda batem com o jogo construído |
| `src/pages/GameDetailsPage.tsx` | acrescentar `guardiao-etico` ao `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |
| `src/assets/games/EF04CO07/guardiao-etico/` | a pasta já existe, vazia — ver [TEXTURAS.md](./TEXTURAS.md) |

Título: **Guardião Ético**. Descrição: *"Um colega pede, e você decide o que vai
junto: ligue só as etiquetas que o pedido precisa, olhe quem fica exposto e mande
— ou diga que não dá."*

---

## 15. Critérios de aceite

### A criança entende sozinha

- [ ] a tela tem cinco coisas, e nenhuma troca de lugar nas nove fases;
- [ ] existe **um** gesto: tocar;
- [ ] o balão nunca diz o nome de um botão;
- [ ] quem entra sem ler nada liga uma etiqueta e vê alguma coisa mudar em menos
      de dois segundos;
- [ ] a demonstração muda de 5 s explica a regra inteira sem uma palavra;
- [ ] nenhum texto da tela de jogo passa de três linhas.

### É justo

- [ ] ligar e desligar é ilimitado e não custa nada;
- [ ] a cópia errada **nunca** chega na prateleira;
- [ ] uma vida por fase, no máximo, e o contador zera a cada fase;
- [ ] o NÃO MANDAR existe em todas as fases dos níveis 2 e 3, e em nenhuma do 1;
- [ ] em cada fase existe **exatamente uma** resposta aceita, verificada pela
      validação das 8 combinações;
- [ ] nenhum ponto, porcentagem ou contagem em texto na tela;
- [ ] o jogo roda e vence inteiro sem nenhum PNG carregado.

### BNCC

- [ ] nenhuma fase tem campo `certa`: o veredito é a função do §8;
- [ ] a mesma etiqueta é certa numa fase e errada em outra, e a criança consegue
      dizer por quê;
- [ ] a reação acontece **antes** do envio, sempre;
- [ ] a prateleira mostra, no fim do nível, o que saiu em cada pedido;
- [ ] recusar é certo pelo menos uma vez, e errado pelo menos uma vez;
- [ ] os quatro verbos da habilidade têm lugar na mecânica (§2), e não só no texto.

### Antes de dizer que está pronto

- [ ] `npx tsc --noEmit` limpo para os arquivos do jogo;
- [ ] `npx eslint src/games/EF04CO07/guardiao-etico` limpo;
- [ ] uma fase inteira jogada no navegador, e a TRAVA vista acontecendo;
- [ ] mudo funciona; `?` pausa e repete o tutorial; retomada por `?stage=2`;
- [ ] `?embed=1&inline=1&stage=1&points=0&lives=3` com o console aberto: um
      `GAME_COMPLETED` por nível, `totalStages: 3`, placar fechando em 90;
- [ ] nenhum gancho de depuração sobrou (`window.__algo`).

---

## 16. O que ficou para decidir

1. **Os quatro nomes.** Téo, Bia, Rafa e Duda vieram por continuidade com a Mesa
   de Edição (mesmo traço, mesma idade). Se o elenco for outro, muda só o
   `elenco.ts` e a folha de sprites.
2. **A professora saiu.** Todos os pedidos vêm dos quatro colegas, para a fileira
   de caras ser a mesma do começo ao fim. Se ela voltar, vira uma quinta coluna
   na folha e um busto a mais na esquerda.
3. **O eco da prateleira** — uma frase no começo da fase citando uma cópia que já
   saiu ("a foto que você mandou pro jornal") — está fora do primeiro corte. Ele é
   enfeite e **nunca pode mudar o veredito**; se entrar, entra depois dos três
   níveis jogados.

---

## 17. O que mudou na construção

*(a preencher depois de construir: as decisões que saíram diferentes do plano e o
motivo de cada uma — é a parte que mais serve para o próximo jogo)*
