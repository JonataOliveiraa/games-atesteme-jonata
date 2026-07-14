import Phaser from 'phaser'

import carregandoUrl from '../../../assets/games/EF01CO04/carregando.png'

import bgMapaUrl from '../../../assets/games/EF01CO04/bg_mapa.png'
import painelOrigemUrl from '../../../assets/games/EF01CO04/painel_origem.png'
import painelDestinoUrl from '../../../assets/games/EF01CO04/painel_destino.png'
import balaoPensamentoUrl from '../../../assets/games/EF01CO04/balao_pensamento.png'
import coverUrl from '../../../assets/games/EF01CO04/cover-correio-multimidia.png'

import estacaoMicrofoneUrl from '../../../assets/games/EF01CO04/estacao_microfone.png'
import estacaoMicrofoneAtivaUrl from '../../../assets/games/EF01CO04/estacao_microfone_ativa.png'
import estacaoLapisUrl from '../../../assets/games/EF01CO04/estacao_lapis.png'
import estacaoLapisAtivaUrl from '../../../assets/games/EF01CO04/estacao_lapis_ativa.png'
import estacaoEnvelopeUrl from '../../../assets/games/EF01CO04/estacao_envelope.png'
import estacaoEnvelopeAtivaUrl from '../../../assets/games/EF01CO04/estacao_envelope_ativa.png'
import estacaoAltoFalanteUrl from '../../../assets/games/EF01CO04/estacao_alto_falante.png'
import estacaoAltoFalanteAtivaUrl from '../../../assets/games/EF01CO04/estacao_alto_falante_ativa.png'

import infoCachorroUrl from '../../../assets/games/EF01CO04/info_cachorro.png'
import infoGatoUrl from '../../../assets/games/EF01CO04/info_gato.png'
import infoSolUrl from '../../../assets/games/EF01CO04/info_sol.png'
import infoCarroUrl from '../../../assets/games/EF01CO04/info_carro.png'
import infoMacaUrl from '../../../assets/games/EF01CO04/info_maca.png'
import infoCasaUrl from '../../../assets/games/EF01CO04/info_casa.png'

import botaoAvancarUrl from '../../../assets/games/EF01CO04/botao_avancar.png'
import botaoConfirmarUrl from '../../../assets/games/EF01CO04/botao_confirmar.png'
import cursorTutorialUrl from '../../../assets/games/EF01CO04/cursor_tutorial.png'
import indicadorPerdaUrl from '../../../assets/games/EF01CO04/indicador_perda.png'
import indicadorProgressoUrl from '../../../assets/games/EF01CO04/indicador_progresso.png'
import microfoneIndisponivelUrl from '../../../assets/games/EF01CO04/microfone_indisponivel.png'
import quadroDesenhoUrl from '../../../assets/games/EF01CO04/quadro_desenho.png'
import efeitoStarburstUrl from '../../../assets/games/EF01CO04/efeito-starburst.png'
import ondaDeSom from '../../../assets/games/EF01CO04/onda_de_som.png'
import papelDesenhado from '../../../assets/games/EF01CO04/papel_desenhado.png'
import destinoAnalisaDesenho from '../../../assets/games/EF01CO04/destino_analisa_desenho.png'

import somLatidoUrl from '../../../assets/games/EF01CO04/audio/som_latido.ogg'
import somMiadoUrl from '../../../assets/games/EF01CO04/audio/som_miado.ogg'
import somBuzinaUrl from '../../../assets/games/EF01CO04/audio/som_buzina.ogg'
import somTransmissaoUrl from '../../../assets/games/EF01CO04/audio/som_transmissao.ogg'
import somSucessoUrl from '../../../assets/games/EF01CO04/audio/som_sucesso.ogg'
import somPerdaUrl from '../../../assets/games/EF01CO04/audio/som_perda.ogg'
import somClickUiUrl from '../../../assets/games/EF01CO04/audio/som_click_ui.ogg'

export class BootScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics

  constructor() {
    super({ key: 'BootScene' })
  }

  preload() {
    // Carrega só o essencial pra poder mostrar a tela de loading primeiro.
    this.load.image('carregando', carregandoUrl)
  }

  create() {
    this.showLoadingScreen()
    this.loadRemainingAssets()
  }

  private showLoadingScreen() {
    const { width, height } = this.scale

    this.add.image(width / 2, height / 2, 'carregando').setDisplaySize(width, height)

    const progressBox = this.add.graphics()
    progressBox.fillStyle(0xffffff, 0.3)
    progressBox.fillRect(width / 2 - 160, height - 80, 320, 24)

    this.progressBar = this.add.graphics()

    this.load.on('progress', (value: number) => {
      this.progressBar.clear()
      this.progressBar.fillStyle(0xffb703, 1)
      this.progressBar.fillRect(width / 2 - 155, height - 76, 310 * value, 16)
    })
  }

  private loadRemainingAssets() {
    this.load.image('bg_mapa', bgMapaUrl)
    this.load.image('painel_origem', painelOrigemUrl)
    this.load.image('painel_destino', painelDestinoUrl)
    this.load.image('balao_pensamento', balaoPensamentoUrl)
    this.load.image('cover_correio_multimidia', coverUrl)

    this.load.image('estacao_microfone', estacaoMicrofoneUrl)
    this.load.image('estacao_microfone_ativa', estacaoMicrofoneAtivaUrl)
    this.load.image('estacao_lapis', estacaoLapisUrl)
    this.load.image('estacao_lapis_ativa', estacaoLapisAtivaUrl)
    this.load.image('estacao_envelope', estacaoEnvelopeUrl)
    this.load.image('estacao_envelope_ativa', estacaoEnvelopeAtivaUrl)
    this.load.image('estacao_alto_falante', estacaoAltoFalanteUrl)
    this.load.image('estacao_alto_falante_ativa', estacaoAltoFalanteAtivaUrl)

    this.load.image('info_cachorro', infoCachorroUrl)
    this.load.image('info_gato', infoGatoUrl)
    this.load.image('info_sol', infoSolUrl)
    this.load.image('info_carro', infoCarroUrl)
    this.load.image('info_maca', infoMacaUrl)
    this.load.image('info_casa', infoCasaUrl)

    this.load.image('botao_avancar', botaoAvancarUrl)
    this.load.image('botao_confirmar', botaoConfirmarUrl)
    this.load.image('cursor_tutorial', cursorTutorialUrl)
    this.load.image('indicador_perda', indicadorPerdaUrl)
    this.load.image('indicador_progresso', indicadorProgressoUrl)
    this.load.image('microfone_indisponivel', microfoneIndisponivelUrl)
    this.load.image('quadro_desenho', quadroDesenhoUrl)
    this.load.image('efeito_starburst', efeitoStarburstUrl)
    this.load.image('onda_de_som', ondaDeSom)
    this.load.image('papel_desenhado', papelDesenhado)
    this.load.image('destino_analisa_desenho', destinoAnalisaDesenho)
    

    this.load.audio('som_latido', somLatidoUrl)
    this.load.audio('som_miado', somMiadoUrl)
    this.load.audio('som_buzina', somBuzinaUrl)
    this.load.audio('som_transmissao', somTransmissaoUrl)
    this.load.audio('som_sucesso', somSucessoUrl)
    this.load.audio('som_perda', somPerdaUrl)
    this.load.audio('som_click_ui', somClickUiUrl)

    this.load.once('complete', () => {
      this.scene.start('GameScene')
      this.scene.launch('UIScene')
    })

    this.load.start()
  }
}