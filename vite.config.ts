import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const ARQUIVO_POSICOES = 'lives-positions.json'

/**
 * O AJUSTE DA POSIÇÃO DOS CORAÇÕES, DIRETO NO ARQUIVO.
 *
 * O modo de edição do `createLives` (tecla M) manda a posição para cá quando
 * termina, e isto grava em `lives-positions.json`. Sem copiar coordenada do
 * console: você percorre os jogos e o arquivo se preenche sozinho.
 *
 * Só existe no dev server. Não vai para o bundle e não existe em produção.
 */
function posicoesDasVidas(): Plugin {
  return {
    name: 'lives-positions',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__lives', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('só POST')
          return
        }

        let corpo = ''
        req.on('data', (pedaco) => { corpo += pedaco })
        req.on('end', () => {
          try {
            const { gameId, ...posicao } = JSON.parse(corpo)
            if (!gameId) throw new Error('faltou gameId')

            const atual = existsSync(ARQUIVO_POSICOES)
              ? JSON.parse(readFileSync(ARQUIVO_POSICOES, 'utf8'))
              : {}

            atual[gameId] = posicao
            const ordenado = Object.fromEntries(
              Object.keys(atual).sort().map((k) => [k, atual[k]])
            )

            writeFileSync(ARQUIVO_POSICOES, JSON.stringify(ordenado, null, 2) + '\n', 'utf8')
            console.log(`[vidas] ${gameId}: ${JSON.stringify(posicao)}`)

            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ ok: true, total: Object.keys(ordenado).length }))
          } catch (erro) {
            res.statusCode = 400
            res.end(String(erro))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), posicoesDasVidas()],
})
