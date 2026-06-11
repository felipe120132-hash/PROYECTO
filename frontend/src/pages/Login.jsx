import React from 'react';
import { useAppContext } from '../context/AppContext';
import styled from 'styled-components';
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
        <StyledWrapper>
          <button type="submit" className="beautiful-button">
            🔐 Entrar al Panel
          </button>
        </StyledWrapper>
      </form>
    </div>
  );
}

const StyledWrapper = styled.div`
  margin-top: 8px;

  .beautiful-button {
    position: relative;
    width: 100%;
    display: inline-block;
    background: linear-gradient(135deg, #1b1c3f, #4a4e91, #1b1c3f);
    background-size: 200% 200%;
    color: white;
    font-family: "Segoe UI", sans-serif;
    font-weight: bold;
    font-size: 16px;
    border: none;
    border-radius: 30px;
    padding: 14px 28px;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    animation: button-shimmer 2s ease infinite;
    transition: all 0.3s ease-in-out;
  }

  .beautiful-button:hover {
    background: linear-gradient(135deg, #2c2f63, #5b67b7, #2c2f63);
    background-size: 200% 200%;
    animation: button-particles 1s ease-in-out infinite;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(74, 78, 145, 0.5);
  }

  .beautiful-button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  @keyframes button-shimmer {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes button-particles {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;

export default Login;