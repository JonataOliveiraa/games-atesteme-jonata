# Olha o Jornal! — planejamento

Documento irmão: [TEXTURAS.md](./TEXTURAS.md)

**EF05CO08 · 5º ano · Cultura Digital · Segurança e responsabilidade no uso da
tecnologia**

---

## 1. De onde este jogo veio

Este é o **quarto** desenho para esta habilidade nesta rodada. Os três
anteriores estão aqui porque é o que impede o quinto de repetir o erro.

| Tentativa | O que era | Por que caiu |
|---|---|---|
| **Briefing "Caça-Boatos"** | segurar 1,5 s na manchete para escanear 3 pistas, soltar e tocar num de dois selos | *"não parece de FPS · muito complexo · sem ideias divertidas · não conectado com a habilidade."* O gesto era composto (segurar + soltar + tocar), e a pontuação diferente para chute existia porque **dava para responder sem conferir** |
| **"Confere Aí!" (balões)** | balões de boato descendo; tocar numa de duas páginas dispara um raio que confere | a ideia da fonte-como-munição sobreviveu, mas o alvo não: **texto que se mexe não se lê** |
| **"Confere Aí!" com o balão parado** | o balão estaciona e uma plaquinha segura o texto | resolveu a leitura e mesmo assim não empolgou — a tela toda virou leitura, e a parte de jogo era um toque |

**A proposta que ficou é do dono do projeto:** *um carteiro entrega dois
jornais; o aluno lê os dois, escolhe um e sai espalhando pela praça, estilo
Angry Birds.* Ela conserta o que nenhuma das três consertou: **separa a leitura
da ação.** A criança lê com o mundo parado e joga com a leitura já feita.

Três coisas mudaram em relação ao que ele descreveu, e as três estão
justificadas no documento:

| O que ele pediu | O que ficou | Onde |
|---|---|---|
| estilingue de arrastar | **setas para o ângulo + botão redondo** | §6 |
| *"acertando todas, você perde ou ganha se for fake"* | ele **lança o jornal fraco e vê o estrago**, e conserta a praça — em vez de descobrir no fim que perdeu | §9 |
| *"explosão"* | o jornal **se abre no ar** e as páginas cobrem o grupo | §10 |

---

## 2. O jogo em três frases

1. **O carteiro traz dois jornais sobre a mesma coisa — e eles não dizem a
   mesma coisa.**
2. **Você lê os dois, parados, e escolhe um.**
3. **Aí você sai espalhando o que escolheu pela praça, e vê chegar em cada
   pessoa.**

~~~text
   TELA A — A BANCA (leitura: nada se mexe)

 NÍVEL 1  ●○○                                    ♥♥♥        ?
──────────────────────────────────────────────────────────────
              Qual jornal você vai espalhar?

   ┌──────────────────────┐      ┌──────────────────────┐
   │ JORNAL DA CIDADE     │      │ TUDO SOBRE TUDO      │
   ├──────────────────────┤      ├──────────────────────┤
   │ Piscina fecha        │      │ PISCINA FECHOU       │
   │ 2 semanas            │      │ PARA SEMPRE!!!       │
   │ para reforma         │      │                      │
   ├──────────────────────┤      ├──────────────────────┤
   │ [✍] Marina Alves     │      │ [✍] não diz quem     │
   │ [📅] hoje            │      │ [📅] hoje            │
   │ [🔎] a prefeitura     │      │ [🔎] todo mundo       │
   └──────────────────────┘      └──────────────────────┘
  (carteiro)          ← os dois únicos alvos da tela

                          ↓  toca em um

   TELA B — A PRAÇA (ação: a leitura já foi feita)

 NÍVEL 1  ●○○   "Piscina fecha 2 semanas..."     ♥♥♥        ?
──────────────────────────────────────────────────────────────
                    ·  ·  ·
                 ·           ·  ·
              ·                    · ·
           ╱                            ·  ·
       [jornal]                              ·  ·
   ╭────────╮                    (oo)      (ooo)     (oo)
   │lançador│                   grupo 1    grupo 2   grupo 3
═══╧════════╧═════════════════════════════════════════════════
  ┌─────┐┌─────┐                                      ╭─────╮
  │  ◀  ││  ▶  │   ← ângulo                 soltar →  │  ●  │
  └─────┘└─────┘                                      ╰─────╯
~~~

**Duas telas em sequência, cada uma com os 1280 × 720 inteiros.** É isso que
permite o jornal ser grande o bastante para ser lido e a praça ser larga o
bastante para ter arco. Nenhuma das duas cabe junto com a outra, e tentar isso
foi o que matou os desenhos anteriores.

---

## 3. A habilidade

> **(EF05CO08)** Acessar as informações na Internet de forma crítica para
> distinguir os conteúdos **confiáveis** dos **não confiáveis**.
>
> Objeto: **Segurança e responsabilidade no uso da tecnologia**. Exemplo
> oficial: *"um estudo comparativo entre sites de jornais oficiais e blogs para
> falar sobre as fontes de informação, considerando sua confiabilidade."*

| O que o texto pede | Onde ele está |
|---|---|
| **estudo comparativo** | são sempre **dois** jornais, sobre o **mesmo assunto**, afirmando **coisas diferentes**. Não existe fase com um só |
| **jornal oficial x blog** | é o par do nível 1 — e deixa de ser o par nos níveis 2 e 3 de propósito, senão a criança aprende "escolha o oficial" em vez de aprender a olhar |
| **distinguir** | o veredito sai de **três linhas escritas na capa** (quem escreveu, quando, de onde tirou), nunca de um selo que o jogo já deu |
| **responsabilidade** | é a tela B. A informação **chega em gente**, e a criança vê chegar |

### O teste da bolinha

> Troque os dois jornais por bolinhas coloridas sem significado. O jogo muda?

**A metade que decide acaba.** Duas bolinhas iguais não dão como escolher: a
escolha inteira mora nas três linhas da capa, e o par foi montado para que a
manchete sozinha **não** resolva — em 1.3 a manchete gritada é a falsa, e em 2.2
a manchete gritada é a **verdadeira**, com os mesmos gritos e os mesmos pontos
de exclamação.

A prova mais forte é a fase **2.1**: os dois jornais são **o mesmo jornal, com o
mesmo autor**, e só muda o ano. Nenhum traço visual separa os dois. E o
`Jornal da Cidade de 2019` **ganha** no nível 1 (contra um sem autor) e **perde**
no nível 2 (contra ele mesmo, de hoje) — sem que nada nele mude.

**Onde o teste NÃO passa, e é de propósito:** a tela B sobrevive a bolinhas —
arremessar é arremessar. Ela não é onde a habilidade mora; ela é a
**consequência**, e é o único lugar do catálogo onde a criança vê uma informação
sair da mão dela e alcançar sete pessoas. Por isso ela é curta: **2 a 3
arremessos, ~15 segundos**, contra uma leitura que não tem relógio nenhum.

### Como isso não vira o jogo irmão

`EF05CO08` já tem **Radar de Confiabilidade** publicado, e o nível 1 dele é
literalmente *"compare duas notícias sobre o mesmo assunto e escolha a
confiável"*. A diferença tem de ser dita com todas as letras:

| | Radar de Confiabilidade | **Olha o Jornal!** |
|---|---|---|
| **quem julga** | o jogo: cada notícia chega com `signals` já marcados `good: true/false`, e a resposta certa está guardada em `correctId` | **a criança**: o veredito é uma função das três linhas da capa (§7), e não existe gabarito no dado |
| **a mesma peça** | tem um valor fixo para sempre | **ganha numa fase e perde na outra** |
| **depois de escolher** | um texto de duas linhas explica | **você espalha, e vê em quem chegou** |
| **o custo de errar** | ler a explicação | **a praça inteira fica confusa e você refaz a volta** |
| **o gesto** | tocar num cartão | tocar num cartão **e depois mirar** |
| **o lado da habilidade** | distinguir | **distinguir para DIVULGAR** — a parte de *responsabilidade* do objeto de conhecimento |

E contra o vizinho de baixo, `EF04CO08` (**Caça à Fonte Confiável**): lá a
criança grifa a linha decisiva de uma página parada. Aqui ela **decide o que vai
sair espalhando**. É a diferença entre avaliar e publicar, e é a progressão
natural do 4º para o 5º ano.

---

## 4. O laço

~~~text
o carteiro entra e entrega DOIS jornais
→ TELA A: os dois abertos, grandes, parados. Sem relógio.
→ a criança toca em um
   │
   ├── escolheu o forte:
   │     o outro encolhe e sai; o escolhido dobra e voa para o lançador
   │     → TELA B: a praça, com 2 ou 3 grupos
   │     → mira com as setas, solta com o botão
   │        ├─ errou a mira: o jornal cai na calçada e o carteiro
   │        │  entrega outro NA HORA — nada acontece
   │        └─ alcançou o grupo: o jornal se abre no ar, as páginas
   │           cobrem o grupo, as pessoas ACENDEM
   │     → todos informados → a praça ergue o jornal, a manchete sobe
   │       para o varal do "jornal do dia" → próxima fase
   │
   └── escolheu o fraco:
         ele vai para o lançador do mesmo jeito
         → TELA B igual: a criança espalha, as pessoas acendem
         → A VIRADA: alguém levanta o celular, e as carinhas apagam
           uma a uma, virando confusas
         → a plaquinha âmbar diz QUAL linha da capa falhou
         → o carteiro volta com OS MESMOS DOIS jornais, o recusado
           com tarja "já espalhamos esse"
         → escolhe de novo e refaz a volta, agora acendendo em verde
           quem estava confuso
~~~

---

## 5. A grade: duas telas, 1280 × 720 cada

Multiplique por **0,30** para o celular de 390 px.

### TELA A — a banca

| Faixa | y | Conteúdo | Tamanho | No celular |
|---|---:|---|---|---:|
| **cabeçalho** | 0–82 | nível, bolinhas de fase, vidas, `?` | alvo do `?` 68 px | 20 px |
| **o enunciado** | 96–150 | *"Qual jornal você vai espalhar?"* | 42 px | 13 px |
| **os dois jornais** | 165–635 | os **únicos alvos** | **420 × 470** cada, cx **440** e **940** | **126 × 141** |
| **o carteiro** | 470–700 | à esquerda, x 0–200 | 200 × 230 | não é alvo |
| **o vão entre os dois** | x 650–730 | 80 px | | 24 px |

Dentro do cartão do jornal, de cima para baixo:

| Linha | Altura | Fonte | No celular |
|---|---:|---|---:|
| tarja com o **nome do jornal** | 56 | 30 px, caixa alta | 9 px |
| a **manchete**, até 2 linhas | 150 | **40 px** | **12 px** |
| *(filete separador)* | 2 | | |
| **[✍] quem escreveu** | 54 | 26 px | 8 px |
| **[📅] quando** | 54 | 26 px | 8 px |
| **[🔎] de onde tirou** | 54 | 26 px | 8 px |
| *(respiro)* | 100 | | |

**Três linhas de pista, sempre as mesmas, sempre na mesma ordem e na mesma
altura nos dois cartões.** É isso que faz a comparação ser de olho: a criança
varre a horizontal, não lê dois textos.

### TELA B — a praça

| Faixa | y | Conteúdo | No celular |
|---|---:|---|---:|
| **cabeçalho** | 0–82 | o de sempre + **a manchete escolhida**, 28 px | 8 px |
| **o céu e os prédios** | 82–390 | o corredor do arco. Nada tocável, e o fundo é vazio aqui | |
| **o chão e os grupos** | 390–560 | os grupos, com a base em **560** e **170 px de altura** | pessoa **51 px** |
| **a calçada da frente** | 560–720 | **só controle mora aqui** | |

| Peça | Posição | Tamanho | No celular |
|---|---|---|---:|
| o **lançador** | cx 170, base 560 | 190 × 180 | não é alvo |
| **grupo 1** | cx 600, base 560 | 3 pessoas em 180 px | |
| **grupo 2** | cx 870, base 500 (no banco) | 2 pessoas | |
| **grupo 3** | cx 1140, base 560 | 3 pessoas | |
| **seta ◀** | cx 110, cy 645 | **140 × 140** | **42 px** |
| **seta ▶** | cx 270, cy 645 | **140 × 140** | **42 px** |
| **botão soltar** | cx 1180, cy 645 | **r 66 (⌀ 132)** | **⌀ 40 px** |

**A regra que mais custou caro no catálogo — painel não corta área de jogo —
está resolvida por construção:** a faixa 560–720 é calçada desenhada, não
painel, e nenhum grupo, arco ou queda acontece dentro dela. Movimento à
esquerda, ação à direita, como controle de videogame: no celular deitado cada
polegar fica no seu canto e nada do que precisa ser lido fica sob a mão.

**Três alvos no máximo na tela B, dois na tela A.** O teto do projeto é 4.

---

## 6. Controle

**Tela A:** um toque, em um de dois cartões de 420 × 470. Nada mais é tocável.

**Tela B:** duas setas e um botão. **Sem arraste** — o estilingue de puxar já foi
reprovado neste projeto (*"arrastar fica difícil"*), e a sensação de Angry Birds
não vem do gesto de puxar: vem do arco, da espera do voo e do impacto.

- **as setas mudam o ângulo**, de 20° a 70°, em passos de 2,5° (21 posições).
  Um toque = um passo; **segurar desliza** depois de 260 ms;
- **a força é fixa.** Uma variável só. A dificuldade vem de onde os grupos
  estão, não de dominar física;
- **a linha pontilhada mostra só o começo do arco** — o primeiro terço, como
  manda a convenção do gênero. Desenhar o arco inteiro transformaria a mira em
  conferência;
- **o botão solta.** Enquanto o jornal está no ar os três controles ficam
  desligados por `input.enabled = false`, **nunca** por `setVisible(false)`:
  zona invisível não recebe toque, e esse já foi um bug caro do catálogo;
- **a colisão é perguntada quadro a quadro durante o voo**, contra a posição
  atual do grupo — não contra a posição da largada;
- **errar a mira não é resposta errada.** Nenhum evento, nenhuma vida, nenhum
  ponto: o jornal cai na calçada, o carteiro entrega outro na hora, e a fase não
  anda. O único preço é o segundo que o jornal leva para voar.

---

## 7. As regras, em código

**Nenhum jornal guarda a sua resposta.** O par é comparado no instante do toque,
por uma função das três linhas que estão escritas na capa:

~~~ts
export interface Paper {
    name: string
    headline: string
    subject: string
    author: string | null          // null = "não diz quem escreveu"
    year: number                   // o ano da edição
    origin: 'oficial' | 'testemunha' | 'ouviDizer' | null
}

/** O peso de uma capa. As três parcelas são as três linhas do cartão. */
export function weight(p: Paper, today: number): number {
    return (p.author ? 2 : 0)
         + (p.year === today ? 2 : 0)
         + (p.origin === 'oficial' ? 3 : p.origin === 'testemunha' ? 2 : 0)
}

/** Qual dos dois vale a pena espalhar. Nunca empata (validado no import). */
export function stronger(pair: [Paper, Paper], today: number): 0 | 1 {
    return weight(pair[1], today) > weight(pair[0], today) ? 1 : 0
}

/** Por que o escolhido não servia — a plaquinha sai daqui, não de um texto fixo. */
export function weakestLink(p: Paper, today: number): 'author' | 'year' | 'origin' {
    if (!p.author) return 'author'
    if (p.year !== today) return 'year'
    return 'origin'
}
~~~

É por isso que o `Jornal da Cidade de 2019` ganha na fase 1.2 e perde na 2.1,
com os mesmos dados.

### Validação ao carregar

`data/levels.ts` se valida no próprio `import` e quebra alto em desenvolvimento:

- **os dois jornais do par têm o mesmo `subject` e manchetes diferentes** — sem
  divergência não há o que comparar, e a divergência é a fase inteira;
- **`weight` nunca empata, e a diferença é ≥ 2** — nenhum par ambíguo;
- **nos níveis 2 e 3 os dois jornais têm autor** — se um não assina, quem decide
  volta a ser a pista do nível 1 e o nível não estreia nada;
- **entre 2 e 3 grupos por praça**, que é o teto do projeto;
- **todo grupo é alcançável**: o arco é simulado no import, para os 21 ângulos,
  contra a posição e os obstáculos daquela praça. Praça impossível não aparece
  em revisão de código — tem de ser simulada;
- **nenhuma fase sem saída**: todo par tem um vencedor e toda praça tem solução.

---

## 8. Níveis e fases

**Fase = uma entrega:** dois jornais + uma praça. **3 fases por nível**, 30
pontos por nível, **10 por fase**, e o valor sai de `30 / fases.length`, nunca
escrito na mão.

**Um nível, uma pista** — e a pista do nível é a linha da capa que decide:

| Nível | A pista que decide | O par |
|---|---|---|
| **1** | **[✍] quem escreveu** | um jornal que assina contra um que **não diz quem escreveu** |
| **2** | **[📅] quando** | os dois assinam, mas um é **velho** e o fato mudou |
| **3** | **[🔎] de onde tirou** | os dois assinam e são de hoje: vence o que **diz a fonte** |

**Os três níveis estão codificados** (18/09/2026). O nível 1 foi entregue
sozinho primeiro, como manda o `INSTRUCOES.md` para avaliação; os outros dois
entraram depois, junto com a arte nova.

**Cada nível tem a sua praça, o seu número de jornais e o seu tanto de gente.**
A linha do chão vem do fundo, não de uma constante:

| Nível | Fundo | Chão na folha | `groundY` | Jornais | Grupos | O mundo |
|---|---|---:|---:|---:|---:|---|
| 1 | `bg-rua.png` | 0,6716 | **484** | **2** | 2–3 | cabe na tela |
| 2 | `bg-escola.png` | 0,7354 | **529** | **3** | 3 | cabe na tela |
| 3 | `bg-praca.png` | 0,7024 | **506** | **4** | 4 | **corre**: a praça se repete e o carteiro anda |

### O nível 1, fase a fase

O que cresce **dentro** do nível é a praça, nunca a regra:

| Fase | Assunto | Grupos | O que estreia |
|---|---|---:|---|
| **1.1** | a piscina do bairro | **2** | o gesto: ler, escolher, mirar |
| **1.2** | o lanche da escola | **2** | um grupo **em cima do banco** — o arco tem de subir |
| **1.3** | a feira do bairro | **3** | a **manchete gritada**, que aqui é a falsa |

**O banco de capas do nível 1:**

| Fase | ✅ o forte | ❌ o fraco |
|---|---|---|
| **1.1** | **Jornal da Cidade** · *"Piscina fecha 2 semanas para reforma"* · ✍ Marina Alves · 📅 hoje · 🔎 a prefeitura informou | **Tudo Sobre Tudo** · *"PISCINA FECHOU PARA SEMPRE!!!"* · ✍ não diz quem escreveu · 📅 hoje · 🔎 todo mundo está comentando |
| **1.2** | **Boletim da Escola** · *"Lanche novo começa na segunda"* · ✍ Diretora Selma · 📅 hoje · 🔎 o cardápio da escola | **Zap do Bairro** · *"Vão tirar o lanche da escola!"* · ✍ não diz quem escreveu · 📅 hoje · 🔎 um amigo mandou |
| **1.3** | **Rádio Prefeitura** · *"Feira muda para o sábado"* · ✍ Equipe da Prefeitura · 📅 hoje · 🔎 o aviso oficial | **Grita Notícia** · *"A FEIRA ACABOU!!!"* · ✍ não diz quem escreveu · 📅 hoje · 🔎 ouvi dizer na rua |

**No nível 1 as outras duas linhas reforçam a pista** — quem não assina também
não diz de onde tirou, e é assim na vida. **Nos níveis 2 e 3 a pista é
isolada**, e a 2.1 chega ao extremo: mesmo jornal, mesmo autor, só o ano muda.

**E o nível 1 monta uma armadilha de propósito.** Nas três fases o jornal fraco
grita, então a criança sai dali com a regra *"grito = mentira"* na cabeça — que é
uma regra ruim. A fase **2.2** existe para quebrá-la: lá a manchete gritada é
**verdade**, assinada, de hoje e com a secretaria como fonte, e quem decidir pelo
tom erra. O tom não decide; as três linhas decidem.

---

## 9. O erro e a TRAVA

**Escolher o jornal fraco não é bloqueado.** A criança lança, e o jogo mostra o
que isso faz — é a única coisa deste jogo que uma prova escrita não consegue
ensinar.

1. **A praça se acende normalmente**, grupo por grupo. Nada avisa nada ainda.
2. **A virada:** alguém do último grupo levanta o celular, e as carinhas
   **apagam uma a uma**, da direita para a esquerda, virando confusas. Som
   neutro, descendente. Sem vermelho de bronca.
3. **A plaquinha âmbar sai do grupo.** Ela fala do jornal **que foi escolhido**,
   nunca do outro, e nunca dá a resposta:

   | `weakestLink` | A plaquinha |
   |---|---|
   | `author` | *"Esse jornal não diz quem escreveu."* |
   | `year` | *"Esse jornal é de 2019. A coisa mudou."* |
   | `origin` | *"Esse jornal só diz que todo mundo comenta."* |

4. **O carteiro volta com os mesmos dois jornais**, e o recusado leva uma tarja
   cinza: *"já espalhamos esse"*. A criança escolhe de novo.
5. **No segundo erro da mesma fase**, o cartão certo **pulsa**.
6. **O conserto:** a praça é a mesma, as pessoas continuam confusas, e cada grupo
   alcançado pelo jornal certo acende em verde. É a mesma volta de 2 a 3
   arremessos — **o preço é trabalho, não castigo.**

**Contabilidade:** `WRONG_ANSWER` + `lives.lose()` **uma vez por fase**, no
primeiro erro, com o contador zerando a cada fase. `CORRECT_ANSWER` uma vez por
fase: **+10** de primeira, **+5** depois de errar. `GAME_OVER` sai de
`createLives`. **Errar a mira não entra nessa conta em nenhuma hipótese** — é a
regra do catálogo que separa erro de dedo de erro de cabeça.

O que a TRAVA não pode ser: nunca "tente de novo"; nunca a resposta; nunca
vermelho; nenhum estado sem saída — os dois jornais continuam na mesa, e o certo
sempre está lá.

---

## 10. Feedback: momento → o que acontece

| Momento | O que acontece | Por quê |
|---|---|---|
| **o carteiro entrega** | ele entra pela esquerda gritando *"Olha o jornal!"* num balão curto, e os dois cartões **caem** na mesa com `dropIn`, escalonados em 120 ms | dá um dono à pergunta, e o escalonamento faz o olho pousar num de cada vez. O pregão é o nome do jogo dito por dentro dele |
| **o dedo no cartão** *(desktop)* | ele sobe 6 px e ganha sombra | |
| **a escolha** | o recusado **encolhe e sai**; o escolhido **dobra e voa** para o lançador | o jornal que voa é o mesmo objeto que ela leu, e é isso que costura as duas telas |
| **mirar** | a linha pontilhada refaz a cada passo, com um tique curto | |
| **o voo** | o jornal **gira** no ar, com um rastro fino | |
| **o alcance** | o jornal **se abre** e as páginas se espalham por cima do grupo, num círculo de 150 px — **papel voando, nunca estilhaço** | a pessoa **levanta e lê**; ninguém cai |
| **informado** | a pessoa acende, um cartãozinho com o ícone do jornal aparece sobre ela e sobe uma nota | |
| **a mira errada** | o jornal bate na calçada, amassa e some; o lançador recarrega em 300 ms | tem de parecer **nada**, não erro |
| **todos informados** | a praça ergue o jornal junta, a moldura da tela pisca verde nas bordas, e a manchete sobe para o **varal do jornal do dia** | é o que ela montou, e fica visível |
| **a virada do jornal fraco** | celular levantado → as carinhas apagam da direita para a esquerda, uma a cada 180 ms | apagar em fila deixa a criança **ver a informação se desfazendo**; um flash não faz isso |
| **o conserto** | quem estava confuso acende em verde, com faíscas | |
| **fim de fase** | a bolinha da fase acende no cabeçalho | |
| **fim do nível** | o varal com as três manchetes do dia, confete e as estrelas | é a reprise do que ela construiu |

**Nenhum número na tela.** Nem ponto, nem acerto, nem porcentagem — nem no
painel de fim de nível. O que a criança vê é o varal, as bolinhas e as estrelas.

**Sem relógio na tela A.** A leitura não tem pressa, e a única coisa que se move
enquanto há algo para ler é o carteiro respirando.

### Áudio

Tudo sintetizado em WebAudio, sem arquivo, respeitando `mute-audio` do
`EventBus`. Sem narração.

| Som | Como |
|---|---|
| o jornal caindo na mesa | ruído passa-banda curto, ataque seco |
| o voo | ruído filtrado subindo com a altura do jornal |
| o jornal se abrindo | ruído largo de 180 ms, com queda exponencial |
| informado | senoide curta, uma nota mais alta a cada grupo seguido |
| a virada | três notas descendentes, sem dissonância — decepção, não bronca |
| fim de fase | a fanfarra do catálogo, `[523, 659, 784, 1047]` a cada 110 ms |

---

## 11. Tutorial e `?`

**Três passos**, na fase 1.1, cada um carregando uma ação ou o objetivo, e o
balão sempre longe do que ele aponta:

1. *"O carteiro trouxe dois jornais sobre a mesma coisa. Eles não dizem a mesma
   coisa."* — recorte nos dois cartões, balão no alto.
2. *"Leia os dois e toque no que você acredita."* — recorte nas **três linhas de
   pista** de um dos cartões, com o dedo **batendo** (`tap: true`), balão no
   canto de baixo.
3. *"Agora espalhe: mire com as setas e solte o jornal em cada grupo."* — já na
   tela B, recorte nos controles, dedo batendo na seta.

Nenhum passo descreve um objeto desenhado. O `?` fica sempre visível, pausa por
flag e reabre o painel — e, por ser cena, precisa de `scene.bringToTop`.

---

## 12. O que é textura e o que é código

**É textura** (PNG, folha em grade, 256 × 256 por quadro):

| Folha | Quadros | Ordem — é contrato com o código |
|---|---:|---|
| `carteiro.png` | **4** | entregando · mirando · comemorando · cabisbaixo |
| `pessoas.png` | **12** | grade 3 × 4: a linha é a pessoa, a coluna é o estado — `frame = pessoa × 3 + estado`, com os estados em **desinformado, informado, confuso** |
| `jornal-voando.png` | **3** | dobrado · abrindo · aberto |
| `bg-praca.png` | 1 | fundo, 1672 × 941 |
| `bg-banca.png` | 1 | fundo, 1672 × 941 |

**É código (`Graphics`), sem exceção:** os dois cartões de jornal, a tarja do
nome, o filete, os pictogramas das três linhas, a tarja "já espalhamos esse", o
lançador, a linha pontilhada, o estouro de papel, as setas, o botão redondo, o
cabeçalho, as bolinhas, as vidas, o `?`, a plaquinha âmbar, o varal, as estrelas
e as faíscas.

**O cartão do jornal é Graphics e isso não é negociável:** ele muda de texto, de
estado e de tarja a cada fase, e PNG não muda. O jornal que **voa** é PNG porque
é móvel e não tem uma letra dentro — e os dois nunca se encostam, então não há
emenda para o olho achar.

**A regra da emenda:** o chão da praça é `Graphics` e as pessoas são PNG, então a
sombra de cada pessoa é desenhada pelo código, com a base medida na caixa alfa —
nunca pintada dentro do PNG.

**Meça o sprite, não chute.** Quando `pessoas.png` chegar, varra o canal alfa
célula por célula e ancore por `originY = 1` com o `footPad` medido: as 12
figuras têm de pisar na mesma linha de chão, e 4 px de diferença numa fila de
três já lê como defeito de desenho. **Uma escala só para a família**, tirada da
maior altura medida.

---

## 13. Antes da arte existir

**O jogo tem de ser jogável e avaliável com ZERO textura.** Todo PNG tem um
placeholder em `Graphics`, no tamanho final:

| Textura faltando | O placeholder |
|---|---|
| carteiro | retângulo azul com "CARTEIRO" |
| pessoa | cápsula de 170 px: cinza (desinformado) / amarela (informado) / âmbar (confuso) |
| jornal voando | retângulo branco girando |
| fundos | gradiente do tema |

As texturas entram por `import.meta.glob`, **nunca por `import` estático** — um
import de arquivo que ainda não existe derruba o `vite build` inteiro.

**Ordem de produção:**

1. `types.ts`, `data/levels.ts` com a validação, e `weight`/`stronger`;
2. tela A inteira em Graphics, jogável;
3. tela B com o arco, a mira e a colisão — testada com cápsulas;
4. a virada do jornal fraco e a trava;
5. tutorial, fim de nível, ponte com a plataforma;
6. só então o `TEXTURAS.md` e a arte.

---

## 14. Os níveis 2 e 3, para depois

**Nível 2 — [📅] quando.** Os dois assinam; um é velho e o fato mudou.

| Fase | ✅ o forte | ❌ o fraco |
|---|---|---|
| **2.1** | **Jornal da Cidade** · *"Quadra reabre nesta semana"* · ✍ Marina Alves · 📅 hoje · 🔎 a prefeitura informou | **Jornal da Cidade** · *"Quadra fechada por tempo indeterminado"* · ✍ Marina Alves · 📅 **2019** · 🔎 a prefeitura informou |
| **2.2** | **Grita Notícia** · *"URGENTE!!! A ESCOLA GANHOU ROBÔS!!!"* · ✍ Tino Rocha · 📅 hoje · 🔎 a secretaria informou | **Boletim da Escola** · *"Ainda não temos robôs na escola"* · ✍ Diretora Selma · 📅 **2019** · 🔎 o plano da escola |
| **2.3** | **Rádio Prefeitura** · *"O ônibus 12 passa na praça de novo"* · ✍ Equipe da Prefeitura · 📅 hoje · 🔎 o aviso oficial | **Jornal da Cidade** · *"O ônibus 12 não passa mais na praça"* · ✍ Marina Alves · 📅 **2018** · 🔎 a prefeitura informou |

**A 2.2 é a fase mais importante do jogo**: ela desmonta a regra que o nível 1
plantou. Quem escolher pelo tom erra.

**Nível 3 — [🔎] de onde tirou.** Os dois assinam e os dois são de hoje.

| Fase | ✅ o forte | ❌ o fraco |
|---|---|---|
| **3.1** | ✍ Marina Alves · 🔎 **a prefeitura informou** | ✍ Tino Rocha · 🔎 todo mundo está comentando |
| **3.2** | ✍ Dona Iara · 🔎 **eu estava lá e vi** | ✍ Tino Rocha · 🔎 li num grupo de mensagens |
| **3.3** | ✍ Marina Alves · 🔎 **o hospital informou** | ✍ Dona Iara · 🔎 um amigo que trabalha lá contou |

A **3.3** é a mais fina do jogo: as duas origens são gente de verdade, e a
diferença é entre **a instituição** e **alguém que ouviu de alguém lá dentro**.

**Dezoito capas no total**, seis por nível, e os seis nomes de jornal se repetem
nos três níveis de propósito — a criança aprende os personagens e para de ler o
nome como pista, que é exatamente o que se quer.

---

## 15. Registro

| Onde | O quê |
|---|---|
| pasta | `src/games/EF05CO08/olha-o-jornal/` |
| assets | `src/assets/games/EF05CO08/olha-o-jornal/` |
| `src/data/catalog.ts` | slug `olha-o-jornal`, module `EF05CO08/olha-o-jornal`, skill `EF05CO08`, years `[5]`, tags `["fonte", "confiabilidade", "checagem", "notícia"]`, icon `📰`, order **385**, category `Cultura Digital`, points **90** |
| `src/data/gameInstructions.ts` | três linhas: *"O carteiro traz dois jornais sobre a mesma coisa."* · *"Leia os dois e escolha o que você acredita."* · *"Espalhe pela praça: mire com as setas e solte."* |
| `src/pages/GameDetailsPage.tsx` | entrar em `GAMES_WITH_IN_GAME_COMPLETION_SCREEN` |

### Antes de considerar pronto

- [ ] `npx tsc --noEmit` limpo para os arquivos do jogo
- [ ] `npx eslint src/games/EF05CO08/olha-o-jornal` limpo
- [ ] joga o nível 1 inteiro **com o mouse**, do zero — não só dirigindo por JS
- [ ] a virada do jornal fraco foi **vista acontecendo**, e a praça foi
      consertada até o fim
- [ ] errar a mira dez vezes seguidas não tira vida, não emite evento e não anda
      a fase
- [ ] mudo funciona; `?` pausa e reabre o tutorial; retomada sem salto
- [ ] nenhum número de ponto na tela, nem no painel de fim de nível
- [ ] nenhum gancho de depuração sobrou (`window.__algo`)

---

## 16. O que mudou na construção

*(nível 1 construído e jogado em 18/09/2026)*

### A mira deixou de ser ÂNGULO e virou PONTO DE QUEDA

O §6 prometia setas mudando o ângulo de 20° a 70° com **força fixa**. Fiz a
conta e não fecha: com a mesma velocidade, o alcance é `v²·sen(2θ)/g`, que
**sobe até 45° e desce depois** — dois ângulos diferentes caem no mesmo lugar, e
cada toque na seta deixa de significar "mais longe". Pior: com três grupos
alinhados na mesma altura, as faixas de ângulo que acertam o grupo do MEIO
ficaram de **um passo só** em vinte e um. Fase impossível de acertar de
propósito.

O que ficou: **o ângulo é fixo em 40° e a força sai do alvo.** As setas movem um
**retículo no chão**, de 520 a 1240 em 21 posições de 36 px, e
`speedFor(alvo)` resolve a velocidade. Três ganhos:

- **cada toque na seta é sempre "mais longe"** — monotônico, sem ambiguidade;
- **todo arco tem o mesmo desenho**, só muda de tamanho, então a criança aprende
  a forma uma vez;
- um arco de 40° mirado no grupo distante **passa 140 px acima** dos grupos da
  frente, conferido na conta: nenhum grupo tapa outro por acidente.

O retículo segue a regra do catálogo: **fechado e amarelo** quando há um grupo
ainda não informado no alcance, **aberto e cinza** no vazio.

### A colisão virou ESTOURO NO PONTO DE QUEDA

O §6 falava em perguntar a colisão quadro a quadro. Com o alvo parado e o arco
resolvido, isso não acrescenta nada: o jornal cai onde a mira prometeu e o
estouro alcança todo grupo a até 150 px dali. A regra do quadro a quadro
continua valendo para alvo que se move — aqui não há nenhum.

### O chão é 506, não 560

O horizonte de `bg-praca.png` está em **0,7024 da folha**, medido com
`GetPixel`. Com o fundo em 1280 × 720 (a folha de 1672 × 941 é 16:9 exata), a
linha do chão cai em **y 506** — 54 px acima do que o plano chutava. Isso alargou
a calçada da frente para 214 px e deu mais folga aos controles.

### `originX` da pessoa sai do quadro PARADO

A regra do modal manda ancorar pelo centro da caixa alfa. Aqui isso **quebra**:
no quadro `informado` o jornal aberto alarga a caixa para um lado, e o centro
medido pula de 0,55 para 0,47 — o corpo escorregaria 20 px de lado a cada troca
de estado. O `originX` de cada pessoa vem do **quadro 0 dela**, e vale para os
três. O `footPad` é por pessoa (0, 0, 7 e 12), e é ele que põe as doze figuras na
mesma linha de chão.

### A arte veio com as quatro pessoas da MESMA altura

O `TEXTURAS.md` pedia o rapaz mais alto que a criança; a folha chegou com todas
entre 242 e 256 px de alfa. Ficou **uma escala só para a família**, como manda o
modal — as quatro continuam inconfundíveis por boné, cabelo e cor de roupa, que
era o canal principal de qualquer jeito.

### Três defeitos achados jogando, não lendo

1. **O cartão recusado voltava no destino do voo.** O `pick()` anima o cartão
   escolhido até o carteiro (x 170, escala 0,12); o `deal()` seguinte repunha só
   `alpha` e `y`. Na segunda tentativa o cartão nascia em cima do outro, meio
   fora da tela. Agora o `deal` devolve **posição, escala e alpha** dos dois.
2. **A plaquinha âmbar encostava na borda** quando o texto era longo: o clamp
   era um número fixo (320) em vez da largura real da caixa.
3. **A plaquinha tapava a manchete** ao voltar para a leitura. O motivo do erro
   precisa acompanhar a segunda escolha, então ela reaparece **abaixo dos
   cartões**, em y 668.

### O recorte do tutorial é CENTRO, não canto

`spot.erase(cut, x, y)` posiciona a máscara pelo centro. O passo 1 nasceu com
`x:260, y:160, w:780` e iluminava um cartão e meio. Os dois passos agora tiram
as medidas do próprio painter (`bothCards()` e `cluesOf(0)`), que devolvem
**centro + tamanho**.

E a regra do balão virou concreta: **passo 1 com o balão embaixo** (ele fala dos
dois jornais, e embaixo ficam as pistas, que não são o assunto dele); **passo 2
com o balão em cima** (ele fala das três linhas, que ficam embaixo). Cada balão
foge do que ele mesmo está explicando.

### O tutorial que "não disparava" era o pane congelado

Meia hora perdida: o Browser pane só desenha quadro quando se tira screenshot, e
sem loop o `await` do `deal()` nunca resolve — então o tutorial nunca chegava a
ser chamado. Não havia bug nenhum. Bombear `game.loop.step` com um relógio
próprio resolveu, e o tutorial aparecia desde o começo.

### Conferido jogando

Nível 1 inteiro no mouse: os dois tutoriais, escolher o jornal fraco, ver a
praça inteira murchar, ler a plaquinha, escolher de novo e refazer a volta.
`WRONG_ANSWER` uma vez por fase, `CORRECT_ANSWER` de **5** depois da trava e
**10** limpo, `CHECKPOINT` em 0/33/67/100 e `GAME_COMPLETED` com 25. **Errar a
mira dez vezes não tira vida, não emite evento e não anda a fase.**

Os corações não aparecem — `VIDAS_VISIVEIS` está `false` para os 49 jogos. A
contagem funciona (3 → 2 no primeiro erro) e o `GAME_OVER` sai igual.

---

## 17. A segunda volta: o carteiro arremessa, e cada nível tem a sua praça

*(18/09/2026, pedido do dono do projeto depois de jogar o nível 1)*

### O carrinho saiu; quem joga é o carteiro

O lançador em `Graphics` foi apagado. O `carteiro.png` foi refeito com **oito
poses** numa geração só, e o arremesso é `armando → soltando → acompanhando`,
com o jornal saindo no quadro `soltando`. Errar a mira agora tem um quadro
próprio: ele **recarrega** tirando outro jornal da bolsa, o que deixa claro que
nada foi perdido.

**O ponto de largada do arco sai do CORPO dele**, não de uma constante:
`handFx/handFy` (0,85 e 0,30 da célula) dizem onde a mão está no quadro
`soltando`, e o muzzle é calculado a partir da âncora do sprite. Mexer na altura
do carteiro reposiciona o arco sozinho.

### A folha veio 300 × 400, não 256 × 256

`carteiro.png` chegou 1200 × 800 — célula **300 × 400**. Duas consequências:
`SHEETS.postman` mudou de tamanho de quadro, e **o `setDisplaySize` não pode ser
quadrado** em lugar nenhum. Na tela da banca ele estava sendo forçado a
260 × 260 e teria achatado; agora a largura sai da altura pela proporção 3:4.

### O chão virou POR NÍVEL

O `bg-escola.png` chegou com a linha do chão em **0,7354**, e a praça está em
**0,7024** — 24 px de diferença na tela. Em vez de devolver a arte, o
`GROUND_Y` deixou de ser constante: cada fundo carrega a sua fração em
`BACKDROPS`, e `build()` recalcula o chão, a base das pessoas, a base do
carteiro, a linha da mira e o `speedFor` da vez.

**É melhor assim.** Um horizonte é uma decisão de desenho, e amarrar três
ilustrações a um número igual ia custar uma regeração por nível para sempre.

### `bg-rua.png` não chegou

O nível 3 pede o fundo `rua`, e `BACKDROPS.rua` tem `fallback: 'praca'`: sem a
textura, ele desenha a praça e usa a fração dela. O jogo roda inteiro, e o
nível 3 só não tem cara própria ainda.

### As pessoas foram regeradas — e as medidas antigas estavam obsoletas

A segunda `pessoas.png` trouxe **alturas de verdade diferentes** (216 px na
criança contra 253 no rapaz alto), que é o que o `TEXTURAS.md` pedia e a
primeira folha não tinha. O `PEOPLE_BOX` foi remedido inteiro. Fica o
lembrete: **arte regerada invalida toda medida**, e a folha antiga e a nova
tinham o mesmo nome e o mesmo tamanho.

### Um passo de tutorial por nível, que aponta sem responder

Os níveis 2 e 3 estreiam uma pista, e cada um ganhou **uma fala só**, com o
recorte nas três linhas dos DOIS cartões: *"Agora os dois jornais assinam. A
diferença está em outra linha."* e *"Agora os dois assinam e são de hoje. Sobra
uma linha."* Elas dizem **onde olhar**, nunca qual é a resposta.

### A validação ficou mais dura

`levels.ts` agora prova três coisas novas no import, e as três nasceram de erros
possíveis ao escrever conteúdo:

- **são exatamente 3 níveis** e no máximo 5 fases cada;
- **no nível 3 as duas capas são de hoje** — com uma velha, quem decide voltaria
  a ser a pista do nível 2;
- **o que derruba a capa fraca é a pista DAQUELE nível** (`weakestLink(perdedor)
  === level.clue`). É a regra que impede um par do nível 3 ser resolvido pela
  data por descuido.

### Conferido jogando os três níveis

Nível 1 → 2 pelo **auto-advance**, com o placar viajando (30 → 60 → 90, que é
exatamente a pontuação do catálogo). `GAME_COMPLETED` com `totalStages: 3` e
`stage` 1, 2 e 3. O arremesso foi visto quadro a quadro: `soltando` com o jornal
saindo da mão e `acompanhando` com o braço já descido.

---

## 18. A terceira volta: dois, três, quatro jornais — e uma praça que não acaba

*(18/09/2026, segundo pedido do dono do projeto)*

### O número de jornais virou a escada de dificuldade

**2 no nível 1, 3 no nível 2, 4 no nível 3.** É a escada que o `INSTRUCOES.md`
pede — *"a dificuldade cresce por combinação, ritmo, quantidade ou contexto"* —
e ela não acrescenta nenhuma regra: o gesto continua sendo um toque, e a
pergunta continua sendo a mesma.

**A primeira tentativa encolhia o cartão conforme o número**, e ela está aqui
porque foi um erro instrutivo:

| Jornais | Cartão | Manchete | Pista | No celular |
|---:|---|---:|---:|---|
| 2 | 400 × 460 | 38 px | 25 px | 11,4 / 7,5 px |
| 3 | 392 × 430 | 34 px | 24 px | 10,2 / 7,2 px |
| 4 | 470 × 252 | **30 px** | **24 px** | **9 / 7,2 px** |

Nove pixels reais é o **piso** do projeto, e sete e pouco está abaixo dele. Pior:
a legibilidade passava a depender do conteúdo da fase, porque só cabia texto
curto no nível 3.

### O cartão tem um tamanho só, e a banca ROLA DE LADO

A correção foi virar a lógica: **o cartão é sempre 400 × 460**, e o que muda é
quantos cabem na janela. Dois cabem inteiros e centralizados; três e quatro
passam a rolar. A manchete continua em 38 px e a pista em 25 px **em todos os
níveis**.

A janela recortada vai de x 218 a 1202, e a fita corre dentro dela por uma
máscara de geometria. **Três jeitos de mexer**, porque um só não serve a todo
mundo:

- **arrastar** a fita com o dedo — é um gesto de OLHAR, e nisso o arraste é
  permitido (mesma exceção do `dia-sem-internet`);
- **duas setas redondas** nas bordas da janela, que andam um cartão por toque e
  apagam quando chegam ao fim;
- uma **barrinha embaixo** dizendo onde você está e que há mais.

**Um toque escolhe; um arrasto rola.** Quem separa os dois é `tapSlop`: se o
dedo andou mais de 14 px entre o `pointerdown` e o `pointerup`, aquilo foi
rolagem e não vale como escolha. Sem essa trava, todo arrasto que começasse em
cima de um cartão escolheria por acidente.

### Os cartões trocam de conteúdo, não de objeto

Os `Card` nascem sob demanda e ficam; cada `deal()` reposiciona e repreenche.
Criar e destruir cartão a cada fase deixaria a tela inquieta e perderia o
endereço fixo das coisas (é a regra de *móvel fixo, conteúdo trocável*).

### A praça do nível 3 é um `TileSprite`, e o carteiro anda

A arte da praça foi regerada para **azulejar**: as bordas esquerda e direita
casam em céu, muro e chão — conferido com `GetPixel` em cinco alturas. Com isso
o fundo virou `TileSprite` e o mundo passou a ser **mais largo que a tela**: os
grupos do nível 3 moram em x 600 a 1980.

- `stage` guarda tudo que tem lugar no mapa e anda por `stage.x = -worldX`;
- a mira, o rastro e o carteiro ficam em **coordenada de tela** — são dele, não
  do mapa;
- quando não sobra nenhum grupo dentro da janela de mira, `walkToPending()`
  rola o mundo até o próximo grupo pousar em **x 860**.

**Sem quadros de andar na folha**, quem conta que ele anda é o mundo correndo
por trás mais um balanço curto no corpo (9 px de sobe-e-desce e 0,03 rad de
inclinação). Num desenho chapado isso lê como passo; um sprite parado sobre
fundo correndo, não.

### Quem fica para trás some devagar

Primeiro defeito da caminhada, achado na tela: os grupos já informados **se
empilhavam em cima do carteiro** quando ele passava por eles, e a esquerda
virava uma sopa de gente. A correção é uma linha no `applyWorld()`: alpha por
posição, de 1 em x 340 a 0 em x 120. Eles continuam lá — só saem da frente.

### A validação cresceu com o conteúdo

`levels.ts` agora prova, além do que já provava:

- **o número de jornais bate com o nível** (2 / 3 / 4);
- **nenhuma capa repete manchete** dentro da fase;
- **o primeiro colocado bate o SEGUNDO por 2 ou mais** — com quatro capas não
  basta o melhor ganhar do pior;
- **toda capa perdedora cai pela pista DAQUELE nível**, uma a uma. É o que
  impede um dos três distratores do nível 3 ser resolvido pela data.

### Conferido jogando os três níveis de novo

**30 → 60 → 90**, três vidas intactas, e as duas caminhadas do nível 3 vistas
acontecendo. O par do nível 2 continua sendo o mesmo jornal com o mesmo autor e
só o ano diferente; o do nível 3 é uma fonte que nomeia a instituição contra
três que dizem "todo mundo comenta", "li num grupo" e "meu primo contou".

---

## 19. Quatro acertos depois de jogar

*(18/09/2026, terceira rodada de retorno do dono do projeto)*

### A mira não se mexe sozinha

Ela reposicionava-se no grupo mais próximo depois de cada arremesso, e depois de
cada caminhada. Parecia ajuda e não era: **tirava da criança a única coisa que
ela controla na tela B**, e o alvo saltava sob o dedo dela entre um tiro e o
outro.

Agora a mira nasce **no meio da faixa** — nem em cima de um grupo, nem no canto
— e **nunca mais se move sem as setas**. Acertou um grupo? Ela fica lá. O mundo
andou? Ela fica lá, na mesma posição de TELA, porque ela é do carteiro e não do
mapa.

### A mira ficou um alvo, não um círculo

O círculo antigo era um `strokeCircle` e nada mais, e boiava sobre um chão
desenhado em perspectiva achatada. A nova:

- é uma **elipse deitada** com a mesma achatada do chão (46 × 15), com sombra
  própria;
- **fechada** quando há gente ao alcance: contorno preto grosso mais o miolo
  âmbar, quatro marcas de tique nos eixos, ponto central e um anel interno que
  **pulsa** de 1 em 1 segundo;
- **aberta** no vazio: um tracejado cinza, sem miolo e sem tique;
- ganhou uma **coluna de pontinhos** subindo do centro, que liga o alvo ao arco.

O rastro também: treze pontos que **encolhem e apagam** ao longo da parábola, e
param antes de encostar no chão em vez de atravessá-lo.

**A conta que desenha continua sendo a mesma que julga** — `speedFor` é chamada
pela mira e pelo voo.

### Ele anda ALÉM do necessário

A caminhada parava assim que o próximo grupo entrava no alcance, e o grupo
recém-informado ficava a 100 px do carteiro — colado nele. Agora o alvo da
caminhada é o **maior** entre duas contas:

~~~ts
Math.max(
  proximoGrupo - walkTo,          // trazer o próximo para x 820
  ultimoInformado + walkClear,    // e empurrar quem já leu para fora da tela
)
~~~

com um teto (`proximoGrupo - 370`) para o próximo grupo não sair da janela de
mira pelo outro lado. **Isso obrigou o mundo do nível 3 a ficar mais largo:** os
grupos passaram de 600/980/1600/1980 para 620/980/1760/2140, porque o vão entre
o último informado e o próximo tem de ser de pelo menos 630 px para as duas
contas caberem juntas.

O desvanecimento de quem fica para trás continua — mas agora é cinto e
suspensório: eles saem da tela **e** apagam.

### O jornal é enrolado na frente da criança

Escolher um cartão fazia ele encolher e sumir no carteiro. Faltava a costura
entre **a notícia que ela leu** e **o rolo que voa**: eram dois objetos sem
relação visível.

Agora a escolha é uma cena de quatro tempos: os outros cartões apagam, o
escolhido **sai da fita** (para poder voar por cima do recorte) e vai até a mão
do carteiro, ele passa para a pose de **tirar da bolsa**, e ali o
`jornal-voando.png` aparece **aberto** (quadro 2), **gira duas voltas e meia
encolhendo**, passando por *abrindo* (quadro 1) e terminando **dobrado**
(quadro 0) — que é exatamente o quadro que sai da mão dele no arremesso.

A folha do jornal voando foi desenhada como três estágios de um rolo se
abrindo; tocá-la **ao contrário** dá o rolo sendo feito, de graça.

### Conferido jogando de novo

Três níveis inteiros: **30 → 60 → 90**, três vidas. A rolagem foi usada pelas
setas e pelo arrasto, e um toque parado continua escolhendo. Na caminhada do
nível 3 o carteiro parou com a praça vazia à frente e ninguém encostado nele.

---

## 20. A chegada, e o troco de divulgar o jornal errado

*(18/09/2026, quarta rodada de retorno)*

### A praça abre APROXIMADA no carteiro

Entre a banca e a praça havia um corte seco. Agora, escolhido o jornal, a praça
entra **com zoom 1,95 no carteiro** e afasta até caber inteira, em 900 ms com
`Cubic.easeInOut`, acompanhada de um `fade` de 280 ms. É o que conta que ele
**se deslocou até ali** em vez de a tela simplesmente trocar.

**Quem cresce é a praça, não a interface.** Todas as camadas do cenário —
fundo, mundo, mira, carteiro, jornal, partículas — passaram a morar num
`viewRoot`, e é ele que é escalado em torno do carteiro. Cabeçalho, setas,
botão e plaquinha ficam de fora: uma HUD que cresce junto entrega na hora que o
zoom é truque de câmera.

**A pegadinha do container:** dentro dele a **ordem de inserção É a
profundidade** — o `setDepth` dos filhos deixa de valer. As seis camadas
passaram a ser adicionadas na ordem certa (fundo, mundo, mira, carteiro,
jornal, FX) em vez de numeradas.

### Divulgar o jornal errado acaba com a partida

Era uma trava: perdia uma vida e voltava para a escolha. Agora, quando o último
grupo se decepciona, **a praça inteira reclama por 2 segundos** e a partida
termina.

A bronca são três coisas somadas, porque a folha não tem quadro de raiva:

- todo mundo **treme junto** (7 px de amplitude, decaindo 35 % ao longo dos
  2 s, cada um com a sua fase);
- o halo de cada grupo **pisca em âmbar**;
- a tela **sacode uma vez** (`camera.shake`, 360 ms).

> **A folha de pessoas tem `chateado com gotinha`, não `raiva`** — sobrancelha
> caída, boca torta e uma gota, e foi pedida assim de propósito: o negativo de
> todo prompt bane cara brava, porque **quem errou foi a escolha, não a
> criança**. Um quarto estado com cara de bravo seria uma regeração da folha
> inteira, e vale pensar duas vezes antes: o jogo inteiro evita punir gente.

### A derrota é desenhada pela PLATAFORMA, não pelo jogo

Primeira versão desta tela: um painel próprio de derrota com botão "Tentar de
novo". Ele nasceu **por baixo** do painel que a plataforma já abre no
`GAME_OVER` ("Suas vidas acabaram · Voltando para a atividade"), e o botão de
baixo ficava inalcançável — duas telas de derrota empilhadas.

O jogo agora só **gasta o contador até o zero** (`while (lives.remaining > 0)
lives.lose()`), e o `GAME_OVER` sai de dentro do `createLives`, uma vez só,
como nos outros 48. A plaquinha âmbar continua visível por trás, dizendo qual
linha da capa falhou — é a última coisa que a criança lê antes de a plataforma
assumir.

**A consequência, dita com todas as letras:** a TRAVA do catálogo não vale mais
nesta fase. O primeiro jornal errado divulgado **encerra a partida**, e as três
vidas deixaram de ser três chances de escolher mal. Foi pedido assim; se um dia
a escada for íngreme demais, o lugar de afrouxar é aqui — bastaria trocar o
`loseRun()` por uma vida a menos e a volta para a escolha, que é o que o resto
do catálogo faz.

### Conferido jogando

A chegada foi vista quadro a quadro (praça aproximada no carteiro → praça
inteira, com a HUD parada), e a fase seguinte abriu normalmente depois dela. O
caminho da derrota foi jogado inteiro: jornal fraco divulgado nos dois grupos,
carinhas caídas, plaquinha com o motivo, tremor, e a tela da plataforma por
cima — uma só.
