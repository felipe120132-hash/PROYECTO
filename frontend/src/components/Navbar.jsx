import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Loader from './Loader';
import './Navbar.css';

function Navbar() {
  const {
    temporada, setTemporada,
    temporadas,
    token,
    menuOpen, setMenuOpen,
    formatearTemporada,
    handleLogout,
    searchTerm, setSearchTerm,
    loading,
    equipos,
    verJugadores,
  } = useAppContext();

  const navigate = useNavigate();

  return (
    <div className="app-layout">
      {loading && <Loader />}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>}

      <aside className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}>
        <nav className="sidebar-nav">
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/" end onClick={() => setMenuOpen(false)}>
            <span>INICIO</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/calendario" onClick={() => setMenuOpen(false)}>
            <span>CALENDARIO</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/equipos" onClick={() => setMenuOpen(false)}>
            <span>EQUIPOS</span>
          </NavLink>
          <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/estadisticas" onClick={() => setMenuOpen(false)}>
            <span>ESTADÍSTICAS</span>
          </NavLink>
          {token && (
            <>
              <div style={{ borderTop: '1px solid #e2e8f0', margin: '8px 0' }}></div>
              <p className="sidebar-label" style={{ paddingLeft: '16px' }}>Administración</p>
              <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/gestion" onClick={() => setMenuOpen(false)}>
                <span>GESTIÓN</span>
              </NavLink>
              <NavLink className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} to="/temporadas" onClick={() => setMenuOpen(false)}>
                <span>TEMPORADAS</span>
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
            <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
            <div className="brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>LA SUPER LIGA</div>
          </div>

          <div className="search-bar-container">
            <input
              type="text"
              placeholder=" Buscar equipos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="top-search-input"
            />
            {searchTerm && (
              <div className="search-dropdown">
                {(() => {
                  const filtered = equipos.filter(eq =>
                    eq.nombre.toLowerCase().includes(searchTerm.toLowerCase())
                  );
                  return filtered.length > 0 ? (
                    filtered.map(eq => (
                      <div
                        key={eq.id ?? eq.equipo_id}
                        className="search-dropdown-item"
                        onClick={() => {
                          verJugadores(eq);
                          setSearchTerm('');
                        }}
                      >
                        <div className="team-icon-sm" style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                          {eq.logo ? (
                            <img src={eq.logo} alt={eq.nombre} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                          ) : (
                            eq.nombre.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <span>{eq.nombre}</span>
                      </div>
                    ))
                  ) : (
                    <div className="search-dropdown-no-results">No se encontraron equipos</div>
                  );
                })()}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {token ? (
              <button className="login-btn" onClick={handleLogout}>Cerrar Sesión</button>
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>
                 Iniciar Sesión
              </button>
            )}
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>

        <footer className="footer">
          <div className="footer-content">
            <div className="brand">LA SUPER LIGA</div>
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