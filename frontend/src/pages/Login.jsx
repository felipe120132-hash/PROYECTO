import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Login.css';

function Login() {
  const {
    token,
    loginData, setLoginData,
    handleLogin,
  } = useAppContext();

  if (token) {
    return (
      <div className="table-card anim-fade" style={{ maxWidth: '400px', margin: '60px auto', textAlign: 'center' }}>
        <p style={{ color: '#64748b' }}>Ya tenés una sesión activa.</p>
      </div>
    );
  }

  return (
    <div className="table-card anim-fade login-card">
      <div className="section-header">
        <span></span>
        <h2>Acceso Administrativo</h2>
      </div>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Usuario</label>
          <input
            type="text" placeholder="Tu nombre de usuario"
            onChange={e => setLoginData({ ...loginData, usuario: e.target.value })}
            className="season-select"
            required
          />
        </div>
        <div className="input-group">
          <label>Contraseña</label>
          <input
            type="password" placeholder="Tu clave de acceso"
            onChange={e => setLoginData({ ...loginData, password: e.target.value })}
            className="season-select"
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: '100%',
            marginTop: '8px',
            cursor: 'pointer',
            backgroundColor: '#1b1c3f',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            border: 'none',
            borderBottom: '4px solid #0d0e24',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: '"Segoe UI", sans-serif',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.filter = 'brightness(1.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderBottomWidth = '6px';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.filter = 'brightness(1)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderBottomWidth = '4px';
          }}
          onMouseDown={e => {
            e.currentTarget.style.filter = 'brightness(0.9)';
            e.currentTarget.style.transform = 'translateY(2px)';
            e.currentTarget.style.borderBottomWidth = '2px';
          }}
          onMouseUp={e => {
            e.currentTarget.style.filter = 'brightness(1.2)';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.borderBottomWidth = '6px';
          }}
        >
           Entrar al Panel
        </button>
      </form>
    </div>
  );
}

export default Login;