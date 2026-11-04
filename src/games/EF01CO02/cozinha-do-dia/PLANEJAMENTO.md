# Cozinha do Dia — planejamento

Jogo **092** · EF01CO02 · 1º ano · Pensamento Computacional · 3ª rodada.
Substitui a *Subida do Dia*, refeita do zero em 04/11/2026 (o código antigo está no git, até o commit `985c2bc`).
Documento irmão: [TEXTURAS.md](./TEXTURAS.md).

**Escopo agora:** N1, N2 e N3 jogáveis, todos com a arte definitiva. A reserva em código continua para o caso de faltar um PNG.

---

## 1. O jogo em uma frase

Um animal faminto chega à cozinha, a **receita em figuras** fica na parede e a criança **segue a receita tocando nos objetos da bancada**, um passo de cada vez, até o animal comer.

## 2. A habilidade

> **(EF01CO02)** Identificar e seguir sequências de passos aplicados no dia a dia para resolver problemas.
>
> **Exemplo oficial:** o professor fornece a sequência (receita, caminho, origami, Tangram) e o aluno executa.

| O que a BNCC pede | Onde acontece |
|---|---|
| a sequência é **dada** | a receita fica na parede, inteira, o tempo todo |
| **identificar** o passo | a criança olha o cartão aceso e acha o objeto igual na bancada |
| **seguir** | cada toque executa o passo, e a comida muda na frente dela |
| **no dia a dia** | cereal com leite, cachorro-quente e vitamina de banana |
| **para resolver problemas** | o animal está com fome; o problema acaba quando ele come o que pensava |

**A diferença para os irmãos:** a *Decolagem* (EF01CO03) e a *Oficina dos Algoritmos* pedem para **ordenar**; o *Ritmo da Rotina* é tempo; a *Trilha* é quiz. Aqui a ordem já vem pronta e a habilidade é **segui-la**. Nenhum jogo pede para a criança adivinhar a ordem.

## 3. O laço

```
animal entra com fome · nuvem de pensamento mostra o prato pronto
receita aparece na parede · objetos entram na bancada
        │
        ▼
cartão da vez aceso · todos os objetos com a mesma borda amarela pulsando
        │ toque num objeto
   ┌────┴─────────────────────────┐
 é o da vez                    não é o da vez
 o passo acontece              o estrago acontece (§7)
 cartão ganha ✓                animal faz careta, o cartão certo treme
 próximo cartão acende         "Era a vez do cereal!"
   │                           WRONG_ANSWER + lose()
   ▼
 último passo → o prato desliza até o animal, ele come, corações
 bolinha da fase acende → animal vai embora → próximo pedido
 3 pedidos → os 3 animais comemoram juntos, confete, showLevelComplete
```

## 4. O gesto

**Escolher é sempre tocar.** Três ações depois do toque no objeto:

| Ação | Objetos | O que acontece |
|---|---|---|
| **pôr** (1 toque) | tigela, pão, salsicha, banana, tampa | a peça voa em arco até o preparo e encaixa |
| **derramar** (segurar e arrastar) | cereal, leite, ketchup | a peça vai até o preparo; segurar em qualquer lugar da tela derrama, arrastar mira, soltar para |
| **ligar** (1 toque) | botão do liquidificador | o liquidificador bate, tremendo, e a vitamina vai para o copo |

**O controle é instável de propósito** (`scenes/pouring.ts`, números em `POUR`). Enquanto a criança segura, a peça balança cada vez mais, sem seguir um lado fixo, e o bico sai da boca do preparo se ninguém corrigir. Cada pingo cai de verdade: dentro da boca, enche; fora, suja a bancada e o animal faz careta.

**Derramar fora nunca é erro.** A habilidade é seguir a receita; a mira é a parte divertida. Só custa tempo e sujeira. Por isso também não há limite de cheio: encheu, acabou. Solta, a peça se acalma e volta devagar para cima do preparo, então a criança nunca fica presa. Medido com robô: 2 a 7 s, em qualquer jeito de segurar.

**Foco:** ao derramar e ao comer, o cabeçalho sobe, a receita esmaece e uma vinheta acompanha a ação (`scenes/focus.ts`).

## 5. A tela (1280 × 720)

| Região | Onde | O quê |
|---|---|---|
| Cabeçalho | faixa de ponta a ponta, y 0–72 | nível, bolinhas das fases e `?` |
| Receita | na parede, centro (760, 142) | cartões de 118 × 100 com número, figura e setinha entre eles |
| Animal | centro x 190, atrás da bancada | do peito para cima, 340 px de altura |
| Nuvem | (350, 158) | o prato pronto: é o objetivo, sempre à vista |
| Preparo | centro x 640, base em y 490 | tigela, prato ou liquidificador, sempre no mesmo lugar |
| Bancada | do y 390 para baixo | superfície onde tudo acontece |
| Objetos | y 600, x 360 / 640 / 920 | 170 px, zona de toque de 200 × 180 |
| Botão de ligar | na base do liquidificador | zona de 120 × 110 |

**Densidade:** no máximo 4 alvos (3 objetos + botão de ligar), mais o `?`.

**O que fica na bancada:** só a tigela, o pão e a tampa saem depois de usados, porque só existe um de cada. A caixa de cereal, o leite, o ketchup, as salsichas e as bananas **ficam**, como numa cozinha de verdade. Por isso, mesmo no último passo existe escolha.

## 6. Os pedidos do N1

Pede-se o menos possível: primeiro 3 passos, depois 4.

| Fase | Animal | Prato | Receita |
|---|---|---|---|
| 1 | **gato** | cereal com leite | tigela → cereal → leite |
| 2 | **cachorro** | cachorro-quente | pão → salsicha → ketchup |
| 3 | **macaco** | vitamina de banana | banana → leite → tampa → ligar |

Os animais são **de verdade**, reconhecíveis e sem roupa. Não há monstrinho, nem personagem inventado.

## 7. Os estragos (o erro é a consequência acontecendo)

Toda combinação objeto errado × passo tem um estrago escrito em `data/levels.ts`, e a validação cobra que nenhuma falte.

| Pedido | Passo | Toque errado | O que acontece |
|---|---|---|---|
| Cereal | tigela | cereal | bolinhas caem na mesa e rolam para fora |
| | | leite | o leite faz uma poça na mesa |
| | cereal | leite | tigela só com leite; o cereal cai e espirra na cara do gato |
| | leite | cereal | mais cereal: a tigela transborda |
| Cachorro-quente | pão | salsicha | a salsicha cai no prato vazio e rola para fora |
| | | ketchup | poça de ketchup no prato |
| | salsicha | ketchup | o pão fica só com ketchup, e o cachorro faz careta |
| | ketchup | salsicha | duas salsichas: a de cima escorrega e cai |
| Vitamina | banana | leite | copo só com leite; a banana cai e espirra |
| | | tampa | o copo fecha vazio; a banana bate na tampa e cai |
| | | ligar | o liquidificador vazio treme e anda sozinho pela bancada |
| | leite | banana | banana demais: não cabe, e uma cai |
| | | tampa | o copo fecha; o leite bate na tampa e derrama |
| | | ligar | sem tampa, a banana sai voando e suja a parede |
| | tampa | banana | não cabe: uma banana cai para fora |
| | | leite | transborda |
| | | ligar | **sem tampa, a vitamina voa até o teto e suja tudo, até o macaco** |
| | ligar | banana | bate na tampa e cai |
| | | leite | bate na tampa e derrama |

O erro segue a regra do catálogo (`errou-bloqueia`): mostra o estrago, faz o cartão certo tremer, diz *"Era a vez do …!"* e então `WRONG_ANSWER` + `lose()`.

Não é erro: toque fora dos objetos, toque durante uma animação, o `?`, e o **primeiro passo da criança no tutorial**, em que um objeto errado só balança, sem custo.

## 8. Tutorial (`createTutorial`, balões curtos)

1. **Close no gato** (cabeçalho e bancada fora de cena). *"O gatinho está com fome!"* → *"Ele quer cereal com leite."*
2. A cozinha abre. A receita e os objetos entram. *"Esta é a receita."* [Ver] → os cartões acendem um a um, e o objeto de cada um pula junto.
3. *"Um passo de cada vez!"* [Ver] → o próprio jogo toca na tigela (bolinha que afunda). O cartão ganha ✓ e o próximo acende.
4. *"Fora da receita, vira bagunça!"* [Ver] → o jogo toca no leite: espirra, o gato faz careta. A cena é desfeita com uma fumacinha.
5. *"Sua vez!"* [Vamos!]. A criança toca no cereal, sem custo se errar.
6. O cereal vai até a tigela. *"Segure para derramar!"* [Ver] → o próprio jogo segura, a caixa balança e derrama um pouco fora, e a bolinha corrige a mira. *"Arraste para acertar!"* [Vamos!] → a criança termina.

Depois do *Pular*, os balões 5 e 6 não aparecem: fica só a bolinha que afunda em cima da peça, indicando onde segurar. `?` abre um balão só, com recorte na receita: *"Siga a receita, um passo de cada vez."* [Continuar]. O botão *Pular* é o do componente.

## 9. Fim de pedido e de nível

- **Pedido pronto:** o cabeçalho sobe e a vinheta vai para o animal. O prato desliza até ele, ele fecha os olhos e come com 3 mordidas, sobem corações e ele pula. O cabeçalho volta, a bolinha acende e ele sai.
- **Nível:** os 3 animais voltam lado a lado e pulam, confete, `showLevelComplete`. Os N1 e N2 avançam sozinhos; o N3 oferece JOGAR DE NOVO. Sem quadro-resumo.
- **Pontos:** +10 por pedido, nunca escritos. `CORRECT_ANSWER` por pedido; `CHECKPOINT` com o progresso; `GAME_COMPLETED` com `stage` e `totalStages`.

## 10. Áudio (WebAudio)

Sacudir, leite, ketchup, encaixar, botão, liquidificador, *splat*, mordida, sininho do animal chegando, fanfarrinha. Sem narração.

## 11. N2 e N3

Um nível, um assunto, cada um ligado a um verbo da habilidade:

| Nível | Verbo | Assunto | O que muda |
|---|---|---|---|
| N1 | **seguir** | cada passo na sua vez | o cartão da vez acende |
| N2 | **seguir, sem ajuda** | saber onde parou | nada acende: só o ✓ marca o que foi feito, e o mesmo objeto volta na receita |
| N3 | **identificar** | qual sequência resolve o problema | duas receitas na parede, e só uma faz o prato da nuvem |

### N2, acompanhar

| Fase | Animal | Prato | Receita |
|---|---|---|---|
| 1 | gato | sanduíche | pão → queijo → ketchup → **pão** |
| 2 | cachorro | taça de sorvete | taça → sorvete → calda → **sorvete** → **calda** |
| 3 | macaco | pavê | biscoito → creme → **biscoito** → **creme** → morango |

Olhar para a bancada não basta, porque o objeto que já foi usado continua lá. Com 5 cartões, a fita encolhe para caber entre a nuvem e a janela. O prato cresce em camadas, então o ponto onde a comida cai sobe junto (`DISH.stack`). O erro é simples, sem folha de estrago: a peça errada bate e cai, e o líquido errado faz poça. A validação cobra que todo pedido do N2 tenha um objeto repetido.

**Tutorial:** *"Agora nada acende!"* [Ver] → o jogo faz o 1º passo e o cartão ganha ✓ → *"O ✓ mostra o que já foi."* → *"Tem coisa que volta!"* → *"Sua vez!"*. O primeiro passo da criança não custa.

### N3, identificar

Usa os 3 pratos do N1, com os estragos que a criança já viu. A receita errada tem **o mesmo tamanho e os mesmos objetos** da certa, e erra só a ordem:

| Prato | Receita errada | O que acontece |
|---|---|---|
| Cereal | **cereal** → tigela → leite | o cereal cai na mesa |
| Cachorro-quente | pão → **ketchup** → salsicha | o pão fica só com ketchup |
| Vitamina | banana → leite → **ligar** → tampa | sem tampa, a vitamina suja tudo |

Tocar numa receita a leva para o lugar de sempre, e a outra cai da parede.

- **Escolheu a certa:** a criança executa, com o cartão aceso, como no N1. O assunto é escolher, não acompanhar.
- **Escolheu a errada:** o jogo executa a receita sozinho até o passo do estrago, e então `WRONG_ANSWER` + `lose()`. Quem escolheu não fica preso seguindo uma receita ruim, e o resultado aparece logo.

**Travas (cobradas em `validateLevels`):** mesmo tamanho (senão "escolha a maior" vira atalho), mesmos objetos, existe estrago no passo em que a receita diverge, e a certa não fica sempre em cima.

**Tutorial:** *"Duas receitas!"* → *"Só uma faz este prato."* [Ver] → o jogo escolhe a errada e o cereal cai → tudo se desfaz → *"Qual faz o prato?"* [Vamos!]. A primeira escolha da criança não custa: a receita errada só treme.

### Vale para todos os níveis

**A bancada nunca está na ordem da receita.** Na 1ª versão do N1, tocar da esquerda para a direita resolvia tudo, sem ler a receita. A validação agora cobra isso.

## 12. Arquivos

| Arquivo | O quê |
|---|---|
| `data/levels.ts` | pedidos, passos, estragos, regra pura (`benchAt`) e `validateLevels` |
| `data/files.ts` | folhas, células, quadros do preparo e `addFrames` |
| `data/layout.ts` `theme.ts` `timing.ts` `words.ts` | números, cores, durações, textos da tela |
| `scenes/GameScene.ts` | estado único e bridge; não desenha |
| `scenes/fallback.ts` | toda a arte de reserva, assada nas chaves do TEXTURAS |
| `scenes/world.ts` | parede + animal + bancada, com o close |
| `scenes/client.ts` | o animal e a nuvem |
| `scenes/recipe.ts` | os cartões |
| `scenes/bench.ts` | os objetos e os toques |
| `scenes/dish.ts` | o preparo |
| `scenes/pouring.ts` | o controle de derramar: segurar, arrastar, balanço, pingos e enchimento |
| `scenes/focus.ts` | a vinheta que acompanha a ação |
| `scenes/mess.ts` | despejar, voar, espirrar, sujar |
| `scenes/header.ts` `banner.ts` `guide.ts` `audio.ts` `art.ts` | HUD, faixa, tutorial, som e assados |

## 13. Travas para quem mexer depois

- **Nada no objeto diz que ele é o certo.** A borda é igual em todos; só o cartão da receita aponta o passo.
- **O preparo não pula.** Os quadros de uma folha têm o mesmo enquadramento e a base no mesmo lugar (a folha do preparo não é cortada pelo alfa).
- **Os passos e os estragos moram em `data/levels.ts`.** A cena não decide o estrago.
- **Figura do cartão = figura do objeto na bancada**, a mesma célula.

## Decisões

1. **Nome e endereço.** `Cozinha do Dia`, slug `cozinha-do-dia`, id 092 mantido.
2. **Sem fogo.** As receitas não usam fogão: é um jogo para 6 anos.
3. **Cachorro comendo cachorro-quente** é de propósito: é a piada que a criança entende sozinha.
4. **Capa e og definitivos.** Vieram do PNG entregue (TEXTURAS §8).
5. **Arte em livro ilustrado** (`references/34-livro-ilustrado.jpg`), pedido do usuário em 04/11/2026, no lugar do chibi de figurinha. Só os prompts mudaram. Com os PNGs, o que o código desenha (cartões, apoios, nuvem, respingos) perdeu o contorno escuro para não destoar.

6. **Derramar virou jogo** (pedido do usuário em 04/11/2026): segurar e arrastar com controle instável, no lugar dos 3 toques. Vale para cereal, leite e ketchup. Pôr e ligar seguem com um toque, e um objeto errado despeja sozinho, porque a decisão já foi tomada.

## Histórico

- **04/11/2026.** Subida do Dia descartada (a criança adivinhava a ordem, sem nunca ver a sequência). Entre 4 propostas, o usuário escolheu a Cozinha, com a condição de que o cliente seja **um animal que exista**. N1 em `Graphics`; texturas com o usuário. Jogado do começo ao fim com cliques reais: tutorial, Pular, `?`, os 3 pedidos e os tipos de estrago. Servidor `jogos-dev-cozinha` (porta 5343).
