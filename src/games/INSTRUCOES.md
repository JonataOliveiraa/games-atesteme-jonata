# Instruções Para Jogos

Este documento orienta a criação e manutenção dos jogos em `src/games`.
As regras abaixo valem para jogos novos e para ajustes em jogos existentes.

## Público

Os jogos são feitos para crianças do Ensino Fundamental I. A experiência deve
ser clara, acolhedora e fácil de entender sem explicações longas.

Priorize:

- comandos simples;
- pouco texto por tela;
- leitura fácil em celular;
- resposta imediata a cada toque;
- baixa carga cognitiva por fase.

## Estrutura Do Jogo

Cada jogo deve ter 3 níveis.

Cada nível deve ter no máximo 5 fases, desafios, rodadas ou etapas jogáveis.
Se o conteúdo precisar de mais exemplos, distribua melhor entre os níveis ou
reduza a duração de cada interação.

Os níveis moram em `data/levels.ts`, e esse é o único lugar. Ao refazer um
jogo, reescreva esse arquivo — não crie um `casos.ts` ou `missions.ts` ao lado
dele. Dois arquivos exportando `LEVELS` na mesma pasta compilam, rodam e não
avisam nada: quem for ler depois abre o errado, e um `from '../data/levels'`
digitado por engano troca o conteúdo do jogo sem quebrar nada.

O loop principal deve ser simples e bem acabado:

1. o jogo apresenta uma situação;
2. a criança toma uma decisão ou executa uma ação;
3. o jogo responde com feedback visual e sonoro;
4. o progresso avança, ou a criança tenta de novo;
5. ao concluir o nível, o jogo mostra fechamento claro e passa para o próximo.

Evite mecânicas com muitas regras simultâneas. A dificuldade deve crescer por
combinação, ritmo, quantidade ou contexto, não por confusão de interface.

## Tutorial

Todo jogo deve ter um tutorial curto.

O tutorial deve explicar apenas o que a criança precisa para começar a jogar.
Prefira uma demonstração guiada, com destaque visual no elemento relevante, em
vez de blocos grandes de texto.

Regras práticas:

- no máximo 3 a 5 passos;
- frases curtas;
- exemplos visuais sempre que possível;
- botão ou ícone `?` para repetir o tutorial;
- o tutorial não deve interromper demais o ritmo depois que a criança já sabe jogar.

## Mobile Primeiro

A maioria das partidas acontece em dispositivos móveis. Todo jogo deve ser
desenhado primeiro para toque e telas pequenas.

Cuidados obrigatórios:

- alvos de toque grandes;
- botões distantes o bastante para evitar toque acidental;
- textos legíveis sem zoom;
- fonte maior que o padrão de interfaces desktop;
- layout sem elementos importantes nas bordas extremas;
- nenhum texto cortado em telas estreitas;
- nenhuma ação essencial dependente de hover ou teclado.

Quando houver dúvida entre caber mais informação ou deixar a tela mais clara,
escolha clareza.

## Visual

Os jogos devem ser visualmente atrativos, com acabamento consistente entre si.
Eles não precisam ser idênticos, mas devem parecer parte da mesma família.

Padrões recomendados:

- painéis com volume, brilho ou reflexo de luz;
- botões com estados visuais claros: normal, pressionado, desabilitado e destaque;
- componentes com contraste forte e leitura fácil;
- verde para confirmar, correto, sim, verdadeiro ou sucesso;
- vermelho para negar, errado, não, falso, perigo ou falha;
- amarelo/laranja para alerta, atenção ou dica;
- azul/ciano para informação, foco ou seleção;
- elementos importantes com profundidade, sombra ou contorno;
- feedback visual forte para acerto, erro, bloqueio e conclusão.

Evite telas estáticas demais. Mesmo interfaces simples devem ter pequenos sinais
de vida: entrada suave dos elementos, pulso em botões importantes, brilho em
áreas interativas ou movimento leve no cenário.

## Animação

As animações devem ser bem feitas e ajudar a entender o que aconteceu.

Use animação para:

- mostrar entrada e saída de elementos;
- confirmar toque;
- indicar acerto;
- indicar erro;
- guiar o olhar da criança;
- mostrar transição de fase;
- celebrar conclusão.

Evite animações longas demais ou que atrasem repetidamente a jogabilidade.
O ideal é que o jogo pareça vivo sem ficar lento.

## Áudio

Os jogos devem ter efeitos sonoros.

No mínimo, considere sons para:

- toque em botão;
- acerto;
- erro;
- conclusão de fase;
- conclusão do jogo;
- alerta ou bloqueio importante.

Os efeitos devem ser curtos, leves e não irritantes em repetição. Sempre respeite
os mecanismos de mudo/pausa existentes no projeto.

## Texto E Legibilidade

Use textos curtos, diretos e adequados para crianças.

Regras:

- frases pequenas;
- vocabulário simples;
- tamanho de fonte maior que o padrão web comum;
- contraste alto entre texto e fundo;
- evitar parágrafos dentro do canvas;
- nunca depender apenas de cor para explicar resultado.

Quando o jogo tiver termos técnicos, explique pelo contexto visual ou com uma
frase curta.

## Anotações

Nunca coloque comentários enormes no código. Toda anotação deve ser criada num arquivo .md separado na pasta do jogo.

## Pontuação

Nunca escreva pontos, acertos, erros ou porcentagem em texto na tela.

Isso vale principalmente para o painel de fim de nível: nada de frases como
`12 decisões certas · 80 pontos`. Criança do Fundamental I não lê placar; ela
lê que ganhou ou que precisa tentar de novo, e um número solto só serve para
comparar com o colega.

O progresso e o resultado devem aparecer de forma visual:

- estrelas, selos ou medalhas;
- barra ou bolinhas de fase concluída;
- o que ela juntou, montou ou consertou, mostrado na tela;
- animação de acerto no momento em que acontece.

Pontos continuam existindo no código, porque a plataforma os recebe pelo
`runtimeGameBridge`. O que não pode é virar texto para a criança.

## Conversa Com A Plataforma

O jogo não conhece a Atesteme. Ele só avisa o que aconteceu na partida. Quem
traduz isso em aprovado ou reprovado é a camada de embed, em
`src/pages/EmbedGamePage.tsx`. Nunca decida aprovação dentro do jogo.

Sempre use `runtimeGameBridge`. Existe um `gameBridge` parecido que só fala com
a própria página: um jogo que importa ele roda perfeito na tela e não entrega
nada para a plataforma. Nada denuncia o erro, e a criança joga sem receber nota.

```ts
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
```

### Nível é o que a plataforma chama de `stage`

Esta é a confusão mais fácil de cometer. `stage` é o número do **nível**, de 1 a
3 — não a fase, rodada ou desafio dentro do nível. Concluir o último nível é o
que aprova a criança.

Todo evento com `stage` usa o número do nível atual, começando em 1, nunca um
índice de array começando em 0.

### Declare quantos níveis o jogo tem

Sem isso a plataforma chuta 3. Hoje o chute acerta, porque todo jogo tem 3
níveis — mas é sorte, não garantia. Derive do próprio array de níveis, nunca
escreva o número na mão:

```ts
runtimeGameBridge.emit({
  type: 'GAME_COMPLETED',
  gameId: GAME_ID,
  stage: this.level.level,
  totalStages: LEVELS.length,
})
```

`LEVELS.length` continua certo se alguém mexer nos níveis; um `3` escrito na mão
vira mentira silenciosa.

### Os eventos

| Evento | Quando |
|---|---|
| `GAME_READY` | uma vez, quando dá para jogar |
| `GAME_COMPLETED` | ao concluir **cada** nível, não só o último |
| `CORRECT_ANSWER` | a cada acerto real |
| `WRONG_ANSWER` | a cada erro real |
| `CHECKPOINT` | fim de nível ou marco de progresso |
| `GAME_OVER` | só se o jogo tiver derrota própria |

`WRONG_ANSWER` não é telemetria: cada um custa uma vida. Não emita em erro de
arrastar, toque fora ou tentativa cancelada.

Não invente derrota. Na maioria dos jogos insistir até acertar é o exercício, e
a camada de embed já reprova sozinha quando os erros passam das vidas. Emita
`GAME_OVER` apenas se existir derrota de verdade — tempo esgotado, vidas
próprias, sequência quebrada.

O `progress` do `CHECKPOINT` é porcentagem de 0 a 100, arredondada:

```ts
progress: Math.round((concluidos / total) * 100)
```

### Quatro armadilhas que já custaram conserto

Nenhuma destas dá erro de compilação. Todas deixam o jogo funcionando na tela e
errado para a plataforma.

**1. O `return` que engole os níveis do meio.** O fim de nível costuma ser
escrito assim:

```ts
if (!isLastLevel) {
    showLevelComplete(/* ...avança para o próximo... */)
    return                    // <- o emit abaixo nunca roda nos níveis 1 e 2
}
runtimeGameBridge.emit({ type: 'GAME_COMPLETED', /* ... */ })
```

O evento só sai no último nível. A aprovação continua certa, mas a plataforma
nunca fica sabendo dos níveis 1 e 2. Emita **antes** da condição, ou dentro dos
dois ramos.

**2. Nunca escreva `isFinalStage` no jogo.** Ele é calculado fora, comparando
`stage` com `totalStages`. Um `isFinalStage: true` fixo no código aprova a
criança no primeiro nível assim que alguém mover o emit de lugar.

**3. Nunca escreva o número do nível na mão.** `stage: 3` está certo hoje e
vira mentira no dia em que o jogo ganhar um quarto nível — a criança
terminaria o nível 3, o total seria 4, e ela nunca seria aprovada. Use
`this.level.level` para o atual e `LEVELS.length` para o total.

**4. Contador de tolerância precisa zerar.** Se o jogo perdoa os dois primeiros
desvios e só cobra no terceiro, o contador tem que voltar a zero depois de
cobrar. Sem isso, o terceiro desvio e **todos os seguintes** custam uma vida
cada, e a regra generosa vira a mais dura do jogo.

### Como conferir

Abra o jogo em `?embed=1&inline=1&stage=1&points=0&lives=3` e jogue com o
console aberto. Se nenhum evento aparecer, o jogo está mudo.

Jogue os três níveis até o fim e confira que sai um `GAME_COMPLETED` por nível,
com `stage` 1, 2 e 3 — não só um no final.

## Código

O código dos jogos deve usar nomes em inglês para variáveis, funções, métodos,
classes e arquivos novos quando fizer sentido.

Use:

```ts
increaseScore()
showSuccessFeedback()
createAnswerButton()
currentLevel
remainingLives
```

Não use:

```ts
FuncaoQueAumentaOsPontos()
mostrarBotaoVerdadeiro()
faseAtualDoJogo
vidasRestantesDoJogador
```

Comentários devem ser poucos e úteis. Comente apenas quando a intenção não for
óbvia pelo nome, pela estrutura ou pelo contexto. Evite comentários que apenas
repitam o que o código já diz.

Prefira código organizado e legível a comentários longos.

## Critérios De Aceite

Antes de considerar um jogo pronto, confira:

- tem 3 níveis;
- cada nível tem no máximo 5 fases ou rodadas;
- roda bem em mobile;
- textos estão grandes e legíveis;
- tutorial é curto;
- botões e áreas de toque são confortáveis;
- acertos, erros e conclusão têm feedback visual;
- há efeitos sonoros;
- as animações ajudam a jogabilidade;
- nenhuma tela mostra texto de pontos, acertos ou erros;
- o código novo usa nomes em inglês;
- não foram adicionados comentários desnecessários;
- os níveis estão em `data/levels.ts`, e não há outro `LEVELS` na pasta;
- o jogo importa `runtimeGameBridge`, não `gameBridge`;
- `GAME_COMPLETED` sai ao fim de cada nível, com `totalStages: LEVELS.length`;
- `stage` é o número do nível, de 1 a 3, e não está escrito na mão;
- o jogo não escreve `isFinalStage` em lugar nenhum;
- todo contador de tolerância zera depois de cobrar;
- jogou os três níveis e viu um `GAME_COMPLETED` por nível no console.
