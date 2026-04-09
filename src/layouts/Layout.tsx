import { Link, Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

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
          </nav>
        </div>
      </header>

      <main className="container page-content">
        <Outlet />
      </main>
    </div>
  );
}