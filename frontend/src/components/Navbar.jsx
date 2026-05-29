import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import './Navbar.css';

function Navbar() {
  const {
    temporada, setTemporada,
    temporadas,
    token,
    menuOpen, setMenuOpen,
    formatearTemporada,
    handleLogout,
  } = useAppContext();

  const navigate = useNavigate();

  return (
    <div className="app-layout">
      {/* Overlay para cerrar menu mobile */}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

      <aside className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}>
        <div className="user-profile">
          <div className="avatar">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Usuario" />
          </div>
          <div className="user-info">
            <h4>PRO DIVISION</h4>
            <p>Temporada {temporada}</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/" end onClick={() => setMenuOpen(false)}>
            <span> INICIO</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/calendario" onClick={() => setMenuOpen(false)}>
            <span> CALENDARIO</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/equipos" onClick={() => setMenuOpen(false)}>
            <span> EQUIPOS</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/estadisticas" onClick={() => setMenuOpen(false)}>
            <span> ESTADÍSTICAS</span>
          </NavLink>
          {token && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }}></div>
              <p className="sidebar-label" style={{ paddingLeft: '16px' }}>Administración</p>
              <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/gestion" onClick={() => setMenuOpen(false)}>
                <span>⚙️ GESTIÓN</span>
              </NavLink>
              <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/temporadas" onClick={() => setMenuOpen(false)}>
                <span>📅 TEMPORADAS</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-label">Temporada activa</p>
          <select className="season-select sidebar-select" value={temporada} onChange={(e) => setTemporada(e.target.value)}>
            {temporadas.map(temp => (
              <option key={temp} value={temp}>{formatearTemporada(temp)}</option>
            ))}
          </select>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="navbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
              ☰
            </button>
            <div className="brand">LA SUPER LIGA</div>
          </div>
          
          <nav className="top-nav">
            <NavLink to="/" end style={{ textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => <span className={isActive ? 'active' : ''}>Inicio</span>}
            </NavLink>
            <NavLink to="/calendario" style={{ textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => <span className={isActive ? 'active' : ''}>Calendario</span>}
            </NavLink>
            <NavLink to="/equipos" style={{ textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => <span className={isActive ? 'active' : ''}>Equipos</span>}
            </NavLink>
            <NavLink to="/estadisticas" style={{ textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => <span className={isActive ? 'active' : ''}>Estadísticas</span>}
            </NavLink>
            {token && (
              <>
                <NavLink to="/gestion" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {({ isActive }) => <span className={isActive ? 'active' : ''}>Gestión</span>}
                </NavLink>
                <NavLink to="/temporadas" style={{ textDecoration: 'none', color: 'inherit' }}>
                  {({ isActive }) => <span className={isActive ? 'active' : ''}>Temporadas</span>}
                </NavLink>
              </>
            )}
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ cursor: 'pointer', fontSize: '20px' }}></span>
            {token ? (
              <button className="login-btn" onClick={handleLogout}>Cerrar Sesión</button>
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>
                👤 Iniciar Sesión
              </button>
            )}
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="brand">LA SUPER LIGA </div>
            <div className="footer-links">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          <p className="copyright"></p>
        </footer>
      </div>
    </div>
  );
}

export default Navbar;
