import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useSearchParams } from "react-router-dom";
import { parseEmbedParams } from "../platform/embed/embedParams";
import { useEmbedAtivo } from "../platform/embed/embedMode";
import IntegracaoPanel from "../platform/components/IntegracaoPanel";

export default function Layout() {
  const location = useLocation();
  const [query] = useSearchParams();

  const embed = useEmbedAtivo(parseEmbedParams(query).embed);
  const [integracaoAberta, setIntegracaoAberta] = useState(false);

  /*
   * A PÁGINA NÃO ROLA EM MODO EMBED.
   *
   * O iframe já tem o tamanho que a plataforma deu. Se o documento aqui
   * dentro tiver barra de rolagem, a criança arrasta a tela em vez de arrastar
   * a peça do jogo — e num celular isso acontece no primeiro toque.
   */
  useEffect(() => {
    document.body.classList.toggle("embed-active", embed);
    return () => document.body.classList.remove("embed-active");
  }, [embed]);

  if (embed) {
    return (
      <div className="embed-shell">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <div className="logo-icon">🎮</div>
            <span>Atesteme</span>
          </div>

          <nav className="nav">
            <Link
              to="/"
              className={location.pathname === "/" ? "nav-link active" : "nav-link"}
            >
              Jogos
            </Link>

            <Link
              to="/recursos"
              className={
                location.pathname === "/recursos" ? "nav-link active" : "nav-link"
              }
            >
              Recursos
            </Link>

            <Link
              to="/ranking"
              className={
                location.pathname === "/ranking" ? "nav-link active" : "nav-link"
              }
            >
              Ranking
            </Link>
            {/*
              Cadastrar um desafio automático na Atesteme pede endereço, id, total de
              fases, nome, frase e capa — informação que só existe aqui. O botão evita
              que alguém digite isso à mão 45 vezes, que é onde o slug troca e o
              vínculo quebra.
            */}
            <button
              type="button"
              className="nav-link"
              onClick={() => setIntegracaoAberta(true)}
            >
              Integração
            </button>
          </nav>
        </div>
      </header>

      {integracaoAberta ? (
        <IntegracaoPanel onClose={() => setIntegracaoAberta(false)} />
      ) : null}

      <main className="container page-content">
        <Outlet />
      </main>
    </div>
  );
}
