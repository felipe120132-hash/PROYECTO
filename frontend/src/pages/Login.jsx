import React from 'react';
import { useAppContext } from '../context/AppContext';
import './Login.css';

function Login() {
  const {
    token,
    loginData, setLoginData,
    handleLogin,
  } = useAppContext();

  // Si ya tiene token, redirigir
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
        <span>👤</span>
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
        <button type="submit" className="btn-primary">Entrar al Panel</button>
      </form>
    </div>
  );
}

export default Login;
