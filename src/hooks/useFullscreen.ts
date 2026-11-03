import { useCallback, useEffect, useState } from "react";

type FsDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
};

type FsElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: string) => Promise<void>;
  unlock?: () => void;
};

function destravarOrientacao() {
  try {
    const orientation = screen.orientation as LockableOrientation | undefined;
    orientation?.unlock?.();
  } catch {
    // navegador sem trava de orientação: não há o que destravar
  }
}

async function sairDaTelaCheiaNativa() {
  const doc = document as FsDocument;
  try {
    if (doc.fullscreenElement && doc.exitFullscreen) await doc.exitFullscreen();
    else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    }
  } catch {
    // já tinha saído (Esc, voltar do Android)
  }
}

/**
 * Tela cheia da PÁGINA inteira (`documentElement`), e não de um elemento.
 *
 * Com um elemento em tela cheia, só ele e os filhos dele aparecem — e os
 * modais da plataforma (fim de jogo, parabéns, sair) moram fora do palco do
 * jogo. Ficariam abertos por baixo, invisíveis, com a criança presa na frente.
 * Quem faz o jogo ocupar a tela é o CSS (`.game-stage.is-cheia`).
 *
 * No iPhone o Safari não tem tela cheia para página: o `requestFullscreen`
 * não existe e sobra só o CSS, com a barra do navegador à vista.
 *
 * ── O CSS ENTRA NA HORA; O NATIVO VEM POR CIMA ──────────────────────────
 *
 * O estado liga no clique, sem esperar o `requestFullscreen`. Esperar era
 * arriscado: há navegador embutido (webview, o próprio painel de teste) em
 * que a promessa nunca resolve nem rejeita, e o botão parecia não fazer nada.
 * Se o nativo vier, ele só esconde as barras; se não vier, o jogo já ocupa a
 * janela do mesmo jeito.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enter = useCallback(() => {
    setIsFullscreen(true);

    const el = document.documentElement as FsElement;
    let pedido: Promise<void> | undefined;
    try {
      pedido = el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.();
    } catch {
      // iOS Safari não permite fullscreen nativo — segue só com o CSS
    }

    /*
     * Os jogos são 16:9. No Android, deitar o celular é o que faz o jogo
     * ocupar a tela; em pé ele vira uma tira. O navegador só aceita travar a
     * orientação DEPOIS de entrar em tela cheia — por isso a ordem.
     */
    void Promise.resolve(pedido).then(
      async () => {
        try {
          const orientation = screen.orientation as LockableOrientation | undefined;
          await orientation?.lock?.("landscape");
        } catch {
          // PC e iPhone não travam a orientação
        }
      },
      () => {
        // nativo recusado — segue só com o CSS
      }
    );
  }, []);

  const exit = useCallback(() => {
    setIsFullscreen(false);
    destravarOrientacao();
    void sairDaTelaCheiaNativa();
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen) void exit();
    else void enter();
  }, [isFullscreen, enter, exit]);

  useEffect(() => {
    const syncState = () => {
      const doc = document as FsDocument;
      const active = !!(doc.fullscreenElement || doc.webkitFullscreenElement);
      if (!active) setIsFullscreen(false);
    };

    document.addEventListener("fullscreenchange", syncState);
    document.addEventListener("webkitfullscreenchange", syncState);
    return () => {
      document.removeEventListener("fullscreenchange", syncState);
      document.removeEventListener("webkitfullscreenchange", syncState);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) void exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, exit]);

  /*
   * Quem entrou sai junto. O palco desmonta quando a partida acaba ("Voltar",
   * "Jogar de novo", desbloquear) — sem isto a capa e a lista de jogos
   * abririam em tela cheia, sem o botão para sair.
   */
  useEffect(
    () => () => {
      destravarOrientacao();
      void sairDaTelaCheiaNativa();
    },
    []
  );

  return { isFullscreen, toggle, exit };
}
