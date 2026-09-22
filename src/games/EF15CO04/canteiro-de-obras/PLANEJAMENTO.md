# Canteiro de Obras — planejamento

**EF15CO04 · 1º ao 5º ano · Pensamento Computacional · Decomposição**

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

---

## 1. O jogo em uma frase

**A praça inteira é grande demais: corte o terreno, faça um pedaço de cada vez
com as peças dele, e a praça fica pronta.**

~~~text
 ●○○                                                    ♥♥♥      ?
────────────────────────────────────────────────────────────────────

  ┌───────────────────────┬╌╌╌╌┬───────────────────────┐
  │                       ╎ ✂  ╎                       │
  │    ░escorregador░     ╎    ╎     ░árvore░          │   ← o PROJETO, em
  │    ░balanço░ ░gira░   ╎    ╎     ░flores░ ░banco░  │     transparência
  │                       ╎    ╎                       │
  └───────────────────────┴╌╌╌╌┴───────────────────────┘

        ↓ tocou na tesoura: o terreno se parte em DOIS
        ↓ tocou no pedaço da esquerda: A CÂMERA APROXIMA DELE

  ┌ ─ ─ ┐  ┌─────────────────────────────────────────────┐  ┌ ─ ─ ┐
   apagado │      ░░░         ░░░          ░░░           │   apagado
  └ ─ ─ ┘  └─────────────────────────────────────────────┘  └ ─ ─ ┘
            o pedaço escolhido, grande, ainda no lugar dele

         🛝        🎠        🌳        🪑          ← as peças, soltas no chão.
      (pulsando, porque é nelas que é para tocar)      uma é de outro pedaço
~~~

**Um gesto só: tocar.** Na tesoura, no pedaço, na peça.

**Zero texto fixo na tela.** Sem etiqueta na peça, sem rótulo de obra, sem
placar, sem painel. A única palavra do jogo sai da boca da Tuca, e ela fala
**duas vezes por canteiro**.

## 2. O que estava confuso na primeira versão, e o que foi feito

Três coisas, e as três eram interface por cima do jogo:

| O que atrapalhava | Por quê | O que ficou |
|---|---|---|
| **a segunda tela** — o pedaço abria em close, e uma miniatura no alto dizia onde a criança estava | duas telas pedem que ela guarde a primeira na cabeça, e a miniatura era um painel existindo só para consertar isso | **uma tela só**: a câmera **aproxima** do pedaço escolhido, e os outros continuam na tela, apagados e no lugar deles (§6) |
| **as fichas com o nome da peça** — `BALANÇO`, `GIRA-GIRA` | cinco retângulos com texto para uma criança de 6 anos que ainda não lê, e o nome nunca foi necessário: o projeto fantasma já mostra o desenho da peça | **a peça é o desenho**, solta no chão do canteiro, sem caixa e sem palavra (§7) |
| **falava demais** — abertura, tutorial de 5 passos, comentário, placa âmbar de erro | e a placa âmbar era uma segunda caixa de fala, ao lado do balão | **um balão só**, e ele aparece **duas vezes por canteiro**: no começo e no fim (§10) |

Junto com isso saíram quatro caixas: a miniatura, a prateleira da caçamba, a
ficha de cada peça e a faixa de inauguração apagada no alto. **O que diz o que
falta é o próprio projeto fantasma** — o que ainda está transparente é o que
ainda não foi feito. Não existe barra de progresso porque o terreno já é uma.

## 3. A habilidade

> **(EF15CO04)** Aplicar a estratégia de decomposição para resolver problemas
> complexos, dividindo esse problema em partes menores, resolvendo-as e
> combinando suas soluções.
>
> Objeto: **Decomposição**. O exemplo oficial é o café da manhã dividido em
> café e sanduíche, resolvidos separadamente e combinados **em qualquer ordem**.

| O verbo | Onde ele acontece |
|---|---|
| **dividir** | o corte. A criança toca nas juntas do projeto e a praça deixa de ser uma coisa só |
| **resolver** | o pedaço aproximado. Ele pede **as peças dele**, e no chão tem uma que é de outro |
| **combinar** | a inauguração. Os pedaços voltam a se encostar e a praça existe |

**Construir os pedaços em qualquer ordem sempre vale** (níveis 1 e 2). O nível 3
mostra a exceção: a quadra precisa da calçada pronta.

### O teste da bolinha

> Troque as peças por bolinhas coloridas iguais. O jogo muda?

**Muda, e acaba.** O que decide cada toque é se aquela peça **pertence àquele
pedaço**, e quem responde é o projeto fantasma desenhado dentro dele. Bolinha
não pertence a lugar nenhum.

**Onde o teste NÃO passa, e é de propósito:** escolhida a peça certa, **ela voa
sozinha até o lugar**. Mira não é a habilidade. E a pergunta grande do jogo não
está aí: está no corte, que é o que o nível 2 transforma em decisão (§9).

## 4. Como isso não vira os dois jogos irmãos

| | Arquiteto das Missões | Missão em Pedaços | **Canteiro de Obras** |
|---|---|---|---|
| **a divisão** | escolher, entre 4 cartas, as 2 que pertencem ao pedido | repartir 8 objetos em 2 painéis fixos | **escolher ONDE cortar** — e é o corte que decide o tamanho de cada parte |
| **quem decide o tamanho da parte** | o jogo | o jogo (sempre metade) | **a criança**, no nível 2 |
| **a parte** | uma receita de 3 passos em ordem | uma fase de plataforma | **um pedaço de terreno que pede as peças dele** |
| **a combinação** | as partes entram no plano e o VAI! roda | a fase final executa a tarefa | **os pedaços se reencostam e a praça existe** |
| **a ordem entre partes** | ficou de fora, de propósito | não existe | **existe no nível 3**, e só lá |
| **o gesto** | tocar em cartas | correr e pular | tocar na tesoura, no pedaço e na peça |

No Arquiteto a criança **reconhece** as partes de um pedido pronto; aqui ela
**produz** as partes cortando, e descobre que o corte muda o tamanho do
trabalho.

## 5. A abertura: o contexto, contado em imagem

Roda **uma vez**, antes da primeira partida, e é pulável a qualquer toque. O
`?` a repete. Doze segundos, e **duas falas** — o resto acontece na tela:

| Tempo | O que a criança vê | A Tuca diz |
|---:|---|---|
| 0–3 s | o terreno **vazio**, de terra batida, tapumes em volta. A Tuca entra pela direita com um rolo de papel debaixo do braço | — |
| 3–6 s | ela **desenrola o projeto** sobre o terreno, da esquerda para a direita: a praça inteira aparece em transparência — o parquinho, o jardim | 🗨️ *Olha o que a gente vai construir aqui!* |
| 6–9 s | ela olha do papel para o terreno vazio, **o projeto inteiro pisca uma vez**, e ela coça o capacete | 🗨️ *Tudo de uma vez é demais. Vamos cortar em pedaços.* |
| 9–12 s | as **linhas pontilhadas** entram com um tique, a **tesoura pousa** em cima da primeira e começa a pulsar | — |

Quando a abertura acaba, o jogo já está jogável e a tesoura já está pulsando. A
criança não precisa de mais nada para o primeiro toque.

**Cada nível também abre**, com uma fala só, e sempre em cima do que mudou:

| Nível | A fala |
|---|---|
| 1 | *(nenhuma — a abertura é a do jogo)* |
| 2 | 🗨️ *A linha clarinha é opcional: corte se quiser, e veja o que acontece.* |
| 3 | 🗨️ *Hoje tem obra que precisa de outra pronta antes.* |

## 6. Uma tela só, e a câmera

Não existe segunda tela, painel que abre, nem janela. **O canteiro é o jogo
inteiro**, e o que muda é de onde a criança está olhando.

~~~text
LONGE (o canteiro)                    PERTO (um pedaço)
─────────────────────                 ─────────────────────
o terreno inteiro                     o pedaço escolhido, grande no meio
as linhas e as tesouras               os vizinhos nas bordas, a 45 % de opacidade
os pedaços, tocáveis                  as peças no chão, pulsando
~~~

A passagem é **um movimento contínuo de 420 ms** — a câmera empurra e o pedaço
cresce —, nunca um corte seco. É isso que faz a criança entender que ela não
mudou de lugar: ela **chegou mais perto**. E os vizinhos apagados continuam
dizendo, o tempo todo, que a praça tem mais partes.

A volta é automática, quando a última peça assenta: a câmera **afasta** e o
pedaço aparece pronto e colorido, no lugar dele, ao lado dos que ainda faltam.

## 7. O que existe na tela, e por quê

**Inventário completo.** Se não está aqui, não existe:

| O que | É caixa? | Quando aparece |
|---|---|---|
| o **terreno** com o projeto fantasma | não — é o mundo | sempre |
| as **linhas pontilhadas** e a **tesoura** | não | enquanto houver corte por fazer |
| as **peças**, soltas no chão de terra | não — são objetos, sem ficha e sem nome | só com um pedaço escolhido |
| o **cabeçalho**: bolinhas de fase, vidas, `?` | é a única barra | sempre |
| o **balão da Tuca** | sim, e é o único | 2 vezes por canteiro (§10) |
| o **painel do `?`** | sim | só se a criança tocar nele |
| o **fim de nível** | sim | uma vez por nível |

**Nada de moldura, prateleira, bandeja, ficha, etiqueta, placar, medidor,
relógio, miniatura ou faixa de progresso.** A faixa de inauguração existe, mas
ela **desce só na hora da festa** — antes disso ela não fica pendurada apagada
ocupando o alto da tela.

### Como o jogo diz o que fazer, sem escrever

Três regras, e elas valem em todo instante do jogo:

1. **O que é para tocar respira.** Em qualquer momento, **um único tipo de
   coisa** pulsa devagar: ou as tesouras, ou os pedaços, ou as peças. O resto
   fica parado. Não existe um instante do jogo com dois tipos pulsando.
2. **O que falta está transparente.** Peça não feita é fantasma; pedaço não
   feito é fantasma. Quando não sobrar nada transparente, acabou.
3. **Depois de 4 segundos sem toque, uma mãozinha aparece** em cima de uma das
   coisas que pulsam, bate uma vez e some. Sem fala, sem seta, sem texto.

## 8. O laço

~~~text
o projeto está no terreno, em transparência · AS TESOURAS PULSAM
→ toca numa tesoura: som de serra, poeira, o terreno se parte e os pedaços
  se afastam 16 px · AGORA OS PEDAÇOS PULSAM
→ toca num pedaço: A CÂMERA APROXIMA. as peças entram no chão · ELAS PULSAM
   │
   ├── peça deste pedaço → voa, assenta com 'toc' e poeirinha; o fantasma
   │                       daquele lugar vira desenho colorido
   ├── peça de outro     → ela sobe, não encaixa, e A CÂMERA DÁ UM PASSO ATRÁS
   │                       para mostrar de qual pedaço ela é, que PISCA. A peça
   │                       volta para o chão
   └── pedaço com cadeado (nível 3) → balança, e a setinha aponta o que vem antes
   │
→ última peça: a câmera afasta, o pedaço volta colorido para o lugar dele
→ todos prontos: INAUGURAÇÃO — os cortes se fecham, a faixa desce, confete
~~~

**Tocar no terreno antes de cortar não é erro:** as linhas pulsam mais forte e
a tesoura salta. É o gesto mais provável da primeira partida — é a criança
tentando resolver o problema grande de uma vez, que é justamente o hábito que o
jogo existe para desfazer. Punir isso ensinaria a evitar a tela.

## 9. Níveis e fases

**Fase = um canteiro, do projeto à inauguração.** Três fases por nível.

| Nível | O assunto | O que estreia |
|---|---|---|
| **1** | **cada pedaço tem as coisas dele** | o ciclo: cortar, construir, inaugurar — e a peça que é de outro pedaço |
| **2** | **cortar melhor deixa cada parte menor** | a linha clara, opcional |
| **3** | **às vezes uma parte precisa de outra antes** | o cadeado e a setinha |

> **A primeira entrega vai com o NÍVEL 1 só**, conforme a regra de teste do
> [INSTRUCOES.md](../../INSTRUCOES.md). Os níveis 2 e 3 ficam escritos aqui e em
> `data/levels.ts`, sem cena construída.

### Nível 1 — uma coisa de cada vez

Um corte, dois pedaços, três peças cada, e **quatro peças no chão**: as três
daquele pedaço mais uma do vizinho.

| # | O canteiro | Pedaço A | Pedaço B |
|---|---|---|---|
| **1.1** | **A Praça** | parquinho — escorregador, balanço, gira-gira | jardim — árvore, flores, banco |
| **1.2** | **A Festa Junina** | comes — barraca, pipoca, maçã do amor | pescaria — tanque, vara, peixinhos |
| **1.3** | **A Horta** | canteiro — caixote, mudas, plaquinha | cuidado — regador, mangueira, espantalho |

### Nível 2 — dá para cortar mais

Dois cortes obrigatórios e **um opcional**, sempre entre dois lotes de 2 peças:
cortar dá dois pedaços de 2 (três peças no chão), não cortar dá um pedaço de 4
(**cinco** peças no chão).

| # | O canteiro | Os lotes, na ordem | A linha clara |
|---|---|---|---|
| **2.1** | A Praça Grande | parquinho (3) · canteiro (2) ~ fonte (2) · quadra (3) | entre canteiro e fonte |
| **2.2** | A Festa Junina | comes (3) · pescaria (2) ~ argolas (2) · palco (3) | entre pescaria e argolas |
| **2.3** | A Horta | canteiro (3) · regador (2) ~ mangueira (2) · bichos (3) | entre regador e mangueira |

**A diferença é sentida antes de ser dita.** Cinco peças no chão é o ponto em
que este catálogo já mediu que a tela fica pesada num celular de 390 px. Aqui
isso não é descuido: **é a consequência da escolha dela**, e é o único lugar do
jogo em que o teto de quatro alvos é ultrapassado — sempre por decisão da
criança, nunca por imposição do jogo.

Na inauguração a Tuca comenta, e comenta **os dois casos** — um jogo que só
elogia quem cortou ensinou "corte sempre", que é uma regra tão ruim quanto a
outra:

| O que ela fez | O balão |
|---|---|
| cortou a linha clara | *"Cortando, cada pedaço ficou pequenininho!"* |
| não cortou | *"Esse pedação deu trabalho, né? Dava para cortar no meio."* |

### Nível 3 — uma coisa antes da outra

Três cortes fixos, quatro pedaços, uma dependência.

| # | O canteiro | Os quatro lotes | A dependência |
|---|---|---|---|
| **3.1** | A Praça | calçada (2) · quadra (3) · parquinho (3) · jardim (2) | quadra **depois da** calçada |
| **3.2** | A Festa Junina | palco (2) · dança (3) · comes (3) · pescaria (2) | dança **depois do** palco |
| **3.3** | A Horta | terra (2) · plantio (3) · cuidado (3) · cerca (2) | plantio **depois da** terra |

**Tocar no pedaço travado não custa nada.** O cadeado não é erro da criança: é o
jogo dizendo a ordem, e ele diz com uma setinha.

## 10. Quando a Tuca fala, e quando ela cala

**Duas falas por canteiro**, e nada mais:

| Quando | O quê |
|---|---|
| no começo do canteiro | uma linha dizendo o que é aquele lugar: *"Agora a festa junina!"* |
| na inauguração | uma linha sobre o que ela fez: *"Você cortou, fez um de cada vez, e olha a praça!"* |

Fora disso ela **aparece sem falar**: acena quando um pedaço fica pronto,
comemora na festa, aponta quando a peça é de outro pedaço. **Pose em vez de
frase** é a regra.

**Ela só ganha uma terceira fala no segundo erro da mesma obra** — uma linha
curta que diz a causa e nunca a solução: *"essa é do outro pedaço"*.

**A fala espera o botão.** A frase é escrita letra a letra e a cena **para** até
a criança tocar em **Próximo**, dentro do balão. Balão que sai por relógio não é
lido. E onde não há palavra não há botão: na inauguração ela comemora sem balão,
e o replay não tem Próximo nenhum.

## 11. O erro, e os três casos que não são erro

**Existe um erro só no jogo inteiro: pôr num pedaço uma peça que é de outro.**

1. a peça **sobe e fica no ar**;
2. **nada a aceita** — os lugares vazios balançam de leve, juntos;
3. **a câmera dá um passo atrás** e o pedaço a que ela pertence **pisca duas
   vezes**, do outro lado do terreno. É a parte que ensina: a peça não é lixo,
   ela tem dono, e o dono é outra parte do mesmo projeto;
4. a câmera volta, a peça pousa de novo no chão, inteira;
5. `WRONG_ANSWER` + `lives.lose()` **uma vez por pedaço**, no primeiro erro, e o
   contador **zera a cada pedaço**;
6. **no segundo erro do mesmo pedaço**, a Tuca diz a linha curta e **uma peça
   certa brilha**;
7. nunca "tente de novo", nunca a resposta, **nunca vermelho**.

### Os três casos que não custam nada

| O que ela fez | O que acontece |
|---|---|
| **tocou no terreno antes de cortar** | as linhas pulsam mais forte e a tesoura salta |
| **tocou num pedaço com cadeado** *(nível 3)* | ele balança e a setinha aponta, piscando, o que vem antes |
| **ficou olhando** | nada, e depois de 4 s a mãozinha mostra onde tocar |

Nenhum emite evento, tira vida ou conta ponto.

## 12. A tela

Grade fixa **1280 × 720** com `Phaser.Scale.FIT`. A coluna da direita é o
tamanho real aproximado num celular de 390 px (fator ≈ 0,30).

| Faixa | y | Conteúdo | No celular |
|---|---:|---|---:|
| cabeçalho | `0–84` | bolinhas · vidas em `(40, 40)` · `?` em `(1216, 44)` | `?` 18 px |
| **o terreno** | `130–470` | 1080 × 340, de `x 100` a `x 1180` | 324 × 102 |
| **o chão das peças** | `490–700` | a terra batida do canteiro, sem prateleira | |
| a Tuca | entra pela direita, base `640` | 260 de largura | 78 px |

| Alvo | Tamanho | No celular |
|---|---:|---:|
| a **tesoura**, em cima da linha, em `y 230` | círculo de **150** | **45 px** |
| o **pedaço**, no terreno | de 260 × 340 (4 lotes) a 1080 × 340 | 78 px de largura, no pior caso |
| a **peça**, no chão | **170 × 170**, vão de 30 | **51 px** |
| a peça, com 5 no chão *(só no nível 2)* | **150 × 150**, vão de 22 | **45 px** |

**Quantos alvos acesos ao mesmo tempo:** três tesouras mais o terreno, no pior
caso do nível 3 — **4**. Com um pedaço escolhido, só as peças respondem: 4, ou
5 no caso que a criança escolheu.

**Com a câmera perto**, o pedaço escolhido ocupa 760 × 300 no centro e os
vizinhos ficam nas bordas a 45 % de opacidade. O lugar de cada peça sai do
`spot` do lote (§13), pela **mesma conta** que faz a peça voar até lá.

## 13. As regras, em código

Os níveis moram em `data/levels.ts`, e esse é o único lugar.

**O lote é o átomo do terreno; o pedaço é derivado dos cortes.** É essa
distinção que faz o nível 2 funcionar sem nenhum caso especial escrito à mão.

~~~ts
export interface PecaDef {
    id: string
    icon: string                  // o frame em pecas-*.png
    spot: [number, number]        // 0–1, onde ela mora DENTRO do lote
}

export interface LoteDef {
    id: string
    pecas: PecaDef[]              // 2 ou 3
}

export interface CorteDef {
    depoisDe: string              // id do lote à esquerda da linha
    opcional: boolean
}

export interface CanteiroDef {
    id: string
    fala: string                  // a linha da Tuca ao abrir o canteiro
    lotes: LoteDef[]              // 2 a 4, na ordem do terreno
    cortes: CorteDef[]
    dependencia?: { antes: string; depois: string }   // ids de LOTE
}

export interface LevelDef {
    level: 1 | 2 | 3
    canteiros: CanteiroDef[]      // 3 por nível — a fase é o canteiro
}
~~~

**`PecaDef` não tem `label`.** Não é economia: é a regra. Uma etiqueta na peça
responderia a pergunta do jogo por escrito, e metade do público não lê.

~~~ts
/** Um pedaço é uma sequência de lotes vizinhos sem corte feito entre eles. */
export function pedacos(c: CanteiroDef, feitos: ReadonlySet<string>): LoteDef[][] {
    const out: LoteDef[][] = [[]]
    c.lotes.forEach((lote, i) => {
        out[out.length - 1].push(lote)
        const ultimo = i === c.lotes.length - 1
        if (!ultimo && feitos.has(lote.id)) out.push([])
    })
    return out
}

export const pecasDo = (pedaco: LoteDef[]) => pedaco.flatMap(l => l.pecas)

/**
 * O que vai para o chão: o que falta neste pedaço, MAIS uma peça de outro.
 * A intrusa é derivada — a primeira ainda não usada do pedaço mais cheio —,
 * nunca escrita nos dados.
 */
export function noChao(
    aberto: LoteDef[],
    outros: LoteDef[][],
    prontas: ReadonlySet<string>,
): PecaDef[] {
    const faltam = pecasDo(aberto).filter(p => !prontas.has(p.id))
    const intrusa = outros
        .map(p => pecasDo(p).filter(x => !prontas.has(x.id)))
        .sort((a, b) => b.length - a.length)[0]?.[0]
    return intrusa ? [...faltam, intrusa] : faltam
}

export const daquiEh = (peca: PecaDef, pedaco: LoteDef[]) =>
    pecasDo(pedaco).some(p => p.id === peca.id)

export const travado = (
    pedaco: LoteDef[],
    c: CanteiroDef,
    prontos: ReadonlySet<string>,
) =>
    !!c.dependencia &&
    pedaco.some(l => l.id === c.dependencia!.depois) &&
    !prontos.has(c.dependencia!.antes)
~~~

**Nenhum gabarito nos dados.** Não existe campo dizendo quais peças são de qual
obra: o pedaço **é** um conjunto de lotes, e o lote já carrega as peças dele. Foi
o corte que montou a pergunta — `daquiEh` é função do estado, e o corte é estado.

### Validação ao carregar

`data/levels.ts` se valida no próprio `import` e quebra alto em desenvolvimento:

- **3 canteiros por nível**, **2 a 4 lotes** por canteiro, **2 ou 3 peças** por
  lote, e **no máximo 4 peças** em qualquer pedaço possível;
- **nível 1: exatamente 1 corte, obrigatório**;
- **nível 2: exatamente 1 corte opcional**, entre dois lotes que, juntos, dão um
  pedaço de 4 peças — senão cortar e não cortar dá no mesmo;
- **nível 3: nenhum corte opcional, exatamente 1 dependência**, com `antes` e
  `depois` em pedaços diferentes, e nunca no primeiro pedaço da esquerda;
- **`spot` dentro de 0,12–0,88**, e duas peças do mesmo lote nunca a menos de
  0,22 uma da outra — lugares encostados viram uma mancha só;
- **nenhuma peça repete `icon` dentro do mesmo canteiro**: dois desenhos iguais
  em pedaços diferentes tornariam a pergunta do jogo impossível de responder
  olhando.

## 14. Feedback

| Momento | O que acontece | Som |
|---|---|---|
| a abertura | §5 | sopro, tique das linhas |
| o projeto aparece | o fantasma sobe de `alpha` 0 a 0,35, da esquerda para a direita | sopro curto |
| **o corte** | a lâmina fecha, sai poeira e os dois pedaços **se afastam 16 px** | serra: ruído curto e seco |
| toque no terreno por cortar | as linhas pulsam forte e as tesouras saltam | plim baixo |
| **a câmera aproxima** | 420 ms, com os vizinhos caindo para 45 % | uóp |
| as peças entram | elas **rolam para dentro da tela** pela esquerda e pousam na terra | três toques de madeira |
| **a peça escolhida** | salta, faz um arco e **afunda 4 px** no lugar, com poeirinha | **toc** grave e cheio — o som mais gostoso do jogo |
| cada peça assentada | o fantasma daquele lugar vira desenho colorido | uma nota mais alta a cada peça |
| o pedaço fecha | a câmera afasta e ele volta **colorido** para o lugar dele | duas notas subindo |
| peça de outro pedaço | ela para no ar, a câmera recua, o dono **pisca** | nota baixa e abafada, nunca agressiva |
| pedaço com cadeado | ele balança e a setinha pisca | clique seco |
| **a inauguração** | os cortes **se fecham**, a faixa desce, confete, e a Tuca comemora | fanfarra `[523, 659, 784, 1047]` a cada 110 ms |
| o replay, 4 s | projeto → os cortes → os pedaços acendendo um a um → a praça inteira | um tique por etapa |
| fim do nível | as três praças do nível, e as estrelas | selo |

**Nenhum número na tela**, nem no painel de fim de nível.

**Sem narração.** Áudio 100 % sintetizado em WebAudio, respeitando o
`mute-audio` do `EventBus`.

**A Tuca tem vida parada:** respira, flutua e ginga em três ondas de períodos
diferentes — 1,3 s, 1,7 s e 2,3 s —, para as três nunca somarem no mesmo
instante e virarem pulso mecânico. E ela **anda** até o que está apontando.

## 15. Tutorial e `?`

Depois da abertura (§5), o tutorial da **fase 1.1 é feito jogando**: **três
instruções**, e cada uma para até o gesto de verdade acontecer.

| # | A Tuca diz | O jogo espera |
|---:|---|---|
| 1 | *Toque na tesoura para cortar.* | **o corte** |
| 2 | *Agora são dois pedaços. Toque num.* | **o pedaço escolhido** |
| 3 | *Estas peças são deste pedaço — menos uma!* | **a primeira peça certa** |

O guia **acaba aí**. O halo nunca fica em cima da peça certa: quando aponta,
aponta para o **projeto fantasma**, que é onde a resposta está.

O escuro do guia é um véu que **deixa o toque passar** (um `Graphics` sem
`setInteractive` não captura ponteiro), e o buraco de luz **escorrega** de um
alvo ao outro em vez de piscar.

O **`?`** fica sempre visível, pausa o jogo e **repete a abertura do §5** — que
é a explicação do jogo em imagem — e não um painel de três cartelas de texto.
Ele **dorme enquanto o guia conduz**: os dois no ar ao mesmo tempo travam a tela.

## 16. O que é textura e o que é código

| Textura (PNG) | Código (`Graphics`) |
|---|---|
| `pecas-praca.png` · `pecas-festa.png` · `pecas-horta.png` | **o terreno, os lotes, as linhas pontilhadas e a tesoura** |
| `tuca.png` — a mestra de obras, 4 estados | **a faixa, o cadeado, a setinha, o balão, a mãozinha** |
| `bg-canteiro.png` — os tapumes e o fundo, com o meio vazio | o cabeçalho, as bolinhas, as vidas, o `?`, as estrelas, o confete e a poeira |

**O projeto fantasma não é um arquivo.** Ele é a **própria peça**, desenhada no
`spot` dela com `alpha 0,35`. Isso mata um asset e garante que projeto e peça
nunca divirjam — o fantasma é o desenho do que vai ali porque é o mesmo pixel.

**O terreno é `Graphics`** porque é **geometria que a regra lê**: a largura do
lote, a posição da linha, o centro do lugar vazio e o destino do voo saem da
mesma conta. Um terreno pintado dentro do `bg` criaria um contrato de
alinhamento para a arte cumprir.

Carregamento por `import.meta.glob` com lista `WANTED` no `BootScene`, **nunca**
`import` estático.

## 17. Antes da arte existir

**O jogo tem de ser jogável e avaliável com ZERO textura.**

| Faltando | O placeholder em `Graphics` |
|---|---|
| peça | forma de canto redondo, com uma silhueta simples por dentro |
| projeto fantasma | a mesma forma, em `alpha 0,35`, só contorno |
| Tuca | cápsula de 220 px com um capacete |
| fundo | gradiente de ocre e areia |

**Ordem de produção:**

1. `types.ts`, `data/levels.ts` com a validação, `pedacos`, `noChao`, `daquiEh`;
2. o terreno, as linhas e o corte;
3. a câmera que aproxima, as peças no chão e o voo;
4. a intrusa, a TRAVA, a câmera que recua, e as vidas;
5. a abertura, o guia, a inauguração, o replay, o `?`, o fim de nível, a ponte;
6. só então a arte.

## 18. Telemetria

Pelo payload do `CHECKPOINT`, sem tela nova:

- **quantos cortes** por canteiro, e no nível 2 se ela cortou a linha opcional;
- **peças de outro pedaço** tocadas, por pedaço e por canteiro;
- **toques no pedaço travado** antes da hora (não custa vida, mas diz muito);
- **canteiros inaugurados sem nenhuma trava**.

## 19. Registro

| Item | Valor |
|---|---|
| Pasta | `src/games/EF15CO04/canteiro-de-obras` |
| Assets | `src/assets/games/EF15CO04/canteiro-de-obras` |
| `id` | `086` — o `NEXT_FREE_ID` do `catalog.ts` sobe para `087` |
| Slug | `canteiro-de-obras` |
| Módulo | `EF15CO04/canteiro-de-obras` |
| Título | `Canteiro de Obras` |
| Ícone | `🚧` |
| `order` | `455` (o Arquiteto das Missões é 450) |
| `years` | `[1, 2, 3, 4, 5]` |
| `tags` | `["decomposição", "partes", "construir", "toque"]` |
| `points` | **90** — 9 canteiros × 10, e o corte opcional não muda esse número |

**Pontos:** **+10** por canteiro inaugurado sem trava, **+5** com trava. Não são
por pedaço, de propósito: se cortar mais desse mais pontos, o jogo estaria
pagando pela decisão que ele quer que a criança tome sozinha.

**Ponte**, por `runtimeGameBridge`:

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez |
| `CORRECT_ANSWER` | a cada canteiro inaugurado, com `pointsEarned` 10 ou 5 |
| `WRONG_ANSWER` | a primeira peça de outro pedaço em cada pedaço — e só ela |
| `CHECKPOINT` | a cada pedaço concluído e a cada canteiro |
| `GAME_COMPLETED` | ao fim de **cada** nível, com `totalStages: LEVELS.length` |
| `GAME_OVER` | sai de `shared/hud/createLives`, nunca daqui |

### Antes de considerar pronto

- [ ] a validação do §13 passando sobre `LEVELS` inteiro;
- [ ] o jogo roda inteiro com **zero PNG**;
- [ ] **nenhum texto na tela** fora do balão da Tuca e do painel do `?`;
- [ ] em todo instante, **um único tipo de coisa pulsa**;
- [ ] a mãozinha aparece depois de 4 s sem toque, e some ao primeiro toque;
- [ ] a abertura roda **uma vez**, é pulável, e o `?` a repete;
- [ ] a câmera nunca corta seco: sempre os 420 ms;
- [ ] tocar no terreno antes de cortar **não** emite evento e **não** tira vida;
- [ ] tocar no pedaço travado do nível 3 **não** tira vida;
- [ ] o contador de erro **zera** a cada pedaço;
- [ ] a peça de outro pedaço faz **o dono piscar no terreno**;
- [ ] a fala só avança com o **Próximo**;
- [ ] nenhuma zona desligada por `setVisible(false)`;
- [ ] entrada em `src/data/catalog.ts` e em `src/data/gameInstructions.ts`;
- [ ] slug em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN`, em `src/pages/GameDetailsPage.tsx`;
- [ ] `faseInicial` no `BootScene.create()`, e `?stage=2` abrindo no nível 2;
- [ ] vidas por `createLives`, com o saldo atravessando o `scene.restart`;
- [ ] conferido no console com `?embed=1&inline=1&stage=1&points=0&lives=3`;
- [ ] `npx tsc --noEmit` e `npx eslint src/games/EF15CO04/canteiro-de-obras --ext .ts`;
- [ ] jogado no Browser pane **com o pane visível**.

## 20. Sete travas, para quem mexer depois

1. **Uma tela só.** Nada de painel que abre por cima, janela, aba ou segunda
   cena de jogo. Se algo precisar de destaque, é a câmera que aproxima.
2. **Nenhuma etiqueta na peça.** O nome escrito responderia a pergunta do jogo
   para quem lê, e não responderia nada para quem não lê.
3. **Um tipo de coisa pulsando por vez.** É isso, e não uma frase, que diz o que
   fazer.
4. **A linha de corte só existe numa junta do projeto.** Corte livre produz uma
   parte que não fecha sozinha.
5. **Nenhum relógio, em nível nenhum.**
6. **Qualquer ordem de pedaços vale** — menos o cadeado do nível 3. É o texto da
   BNCC.
7. **Nenhum gabarito nos dados.** Tudo sai de `pedacos()`, `noChao()` e
   `daquiEh()`.

## 21. Histórico

| Data | O que aconteceu |
|---|---|
| 22/09/2026 | Ficha "Canteiro de Obras" (R2 do EF15CO04): corte livre, arrastar 3 peças por obra, 15–20 s por obra, inauguração com buraco, placa com o nome da criança. |
| 22/09/2026 | **Primeira versão do plano.** Saíram o arraste, o relógio, o buraco e o corte livre; entraram a linha opcional (nível 2), a peça de outro pedaço (nível 1) e o cadeado (nível 3). |
| 22/09/2026 | **Segunda rodada, a pedido do dono do projeto:** *"o jogo está confuso? é necessário apelar mais pelo visual, sem muitos textos, e na interface deve haver poucas boxes, painel etc."* Saíram a segunda tela, a miniatura, a prateleira da caçamba, as fichas com nome e a faixa apagada no alto; entraram **a câmera que aproxima**, **a regra do pulso**, **a mãozinha depois de 4 s** e **a abertura de 12 s com contexto** (§5). A fala caiu para **duas por canteiro**. |

## 22. O que mudou na construção (22/09/2026)

O nível 1 foi codificado e jogado do começo ao painel de fim. Estas são as
decisões que saíram diferentes do plano, e o motivo de cada uma.

### Quem manda no tamanho da célula é o arquivo

As folhas chegaram **1600 × 1200** (4 × 3 de **400**, não de 256) e a Tuca,
**2048 × 512** (4 × 1 de **512**). O `data/files.ts` fala o que o disco tem; o
TEXTURAS.md pedia outra coisa e o pedido é que estava errado.

### O terreno encolheu de 920 para 850

O balão da Tuca cobria a ponta direita do terreno — e a ponta direita é onde
mora o fantasma do banco. A folga saiu da largura do terreno (agora `x 90` a
`x 940`) e da largura do balão (360 → 300), não do tamanho das peças.

### O balão sumia sozinho

`hideBalloon` agenda a saída num tween e devolve na hora; a fala seguinte
reacendia o balão **enquanto o tween antigo ainda levava o `alpha` a 0**, e a
frase nascia invisível. Duas correções: a fala mata o tween pendente
(`FX.kill`), e o `setVisible(false)` do `hideBalloon` só vale se nenhuma fala
nova tiver começado — um token, comparado na hora de apagar.

### A Tuca aponta para a esquerda

O desenho da célula 3 aponta para a **direita**, e ela mora na direita da tela:
apontando assim, ela mandava a criança olhar para fora do jogo. `setPose` liga o
`flipX` sempre que a pose é a de apontar, porque o terreno está sempre à
esquerda dela.

### A zona da tesoura subiu para `DEPTH.piece`

Tocar no terreno antes de cortar precisa de resposta (§10), então o pedaço
inteiro é tocável durante o corte. Só que a zona do pedaço vive dentro do
container do terreno e **ficava por cima da tesoura**, engolindo o toque que
importa. A zona do corte passou a nascer acima do terreno.

### O `?` ficou contextual, em vez de repetir a abertura

O §15 dizia que o `?` repete a abertura. Na prática, repetir a abertura no meio
do canteiro mostraria o projeto sendo desenrolado e as linhas entrando — linhas
que a criança já cortou. O `?` agora **abre o véu no que está pulsando agora** e
a Tuca diz o gesto daquela fase: *"Toque na tesoura para cortar o terreno"*,
*"Toque num pedaço para trabalhar nele"*, *"Toque nas peças que são deste
pedaço"*. É a mesma ideia — mostrar ONDE —, no estado em que o jogo está.

### O replay virou um desfile dos pedaços

Rebobinar projeto → cortes → obras exigiria guardar o canteiro inteiro em três
estados. O que ficou na inauguração é o `sweep`: os pedaços acendem **um a um**,
na ordem, depois de a faixa descer. É a mesma frase — o todo é a soma das partes
—, e ela cabe em 12 linhas.

### Entrega de teste: um nível

`LEVELS` traz **só o nível 1**, como manda o [INSTRUCOES.md](../../INSTRUCOES.md),
então `totalStages` é 1 e a criança é aprovada ao fechar os três canteiros. Os
níveis 2 e 3 estão escritos aqui (§9) e entram com a cena que já existe — a
linha opcional e o cadeado são as duas únicas coisas que faltam em código.

### Conferido jogando

Abertura inteira (duas falas, com Próximo), guia de três passos parando em cada
gesto de verdade, corte, câmera aproximando, peça certa voando e assentando,
**peça de outro pedaço** (a câmera recua, o dono pisca, a peça volta, uma vida),
**segundo erro no mesmo pedaço** (a Tuca aparece com a linha curta e uma peça
certa brilha), pedaço fechando e voltando verde, inauguração com faixa, confete
e desfile, os três canteiros — praça, festa junina e horta — e o painel de fim.
No console: `GAME_READY`, `WRONG_ANSWER` uma vez por pedaço, `CORRECT_ANSWER`
de **5** no canteiro com trava e **10** nos outros dois, `CHECKPOINT` em 33/67/100
e um `GAME_COMPLETED` com `stage: 1`.
