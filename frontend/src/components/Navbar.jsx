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
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/dashboard" onClick={() => setMenuOpen(false)}>
            <span> DASHBOARD</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/about" onClick={() => setMenuOpen(false)}>
            <span> ABOUT</span>
          </NavLink>
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
            <NavLink to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => <span className={isActive ? 'active' : ''}>Dashboard</span>}
            </NavLink>
            <NavLink to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
              {({ isActive }) => <span className={isActive ? 'active' : ''}>About</span>}
            </NavLink>
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
