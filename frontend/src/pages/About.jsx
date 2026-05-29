import React from 'react';
import './About.css';

function About() {
  return (
    <div className="about-page anim-fade">
      <div className="about-hero">
        <h1>Acerca de La Super Liga</h1>
        <p>La plataforma líder para la gestión y seguimiento del baloncesto juvenil y profesional. Conectamos talento, equipos y pasión.</p>
      </div>

      <div className="about-section">
        <h2>Nuestra Misión</h2>
        <p>
          Buscamos profesionalizar y dar visibilidad al talento emergente a través de una plataforma digital integral que facilita la gestión de torneos, estadísticas en tiempo real y perfiles de jugadores. Creemos en el deporte como herramienta de desarrollo personal y comunitario.
        </p>
      </div>

      <div className="about-section">
        <h2>La Plataforma</h2>
        <p>
          Desarrollada con las últimas tecnologías web, La Super Liga ofrece a entrenadores, jugadores y aficionados una experiencia única para seguir el desarrollo de la temporada. Desde tablas de clasificación dinámicas hasta seguimiento detallado del rendimiento de cada jugador.
        </p>
        
        <div className="about-stats-grid">
          <div className="about-stat-card">
            <span className="stat-number">+50</span>
            <span className="stat-text">Equipos</span>
          </div>
          <div className="about-stat-card">
            <span className="stat-number">+1000</span>
            <span className="stat-text">Jugadores</span>
          </div>
          <div className="about-stat-card">
            <span className="stat-number">4</span>
            <span className="stat-text">Temporadas</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
