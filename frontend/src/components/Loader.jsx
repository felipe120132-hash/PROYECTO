/**
 * Componente Loader.
 * Muestra una animaci�n de carga mientras se obtienen datos del servidor.
 */
import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="ball">
          <div className="inner">
            <div className="line" />
            <div className="line line--two" />
            <div className="oval" />
            <div className="oval oval--two" />
          </div>
        </div>
        <div className="shadow" />
      </div>
      <div className="loader-text">Cargando datos de la liga...</div>
    </div>
  );
};

export default Loader;
