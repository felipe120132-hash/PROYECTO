import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ModalProvider } from './context/ModalContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Global Styles
import './index.css';
import './App.css'; 

// Pages
import Home from './pages/Home';
import Calendario from './pages/Calendario';
import Equipos from './pages/Equipos';
import Estadisticas from './pages/Estadisticas';
import DetalleEquipo from './pages/DetalleEquipo';
import Login from './pages/Login';
import CargarResultado from './pages/CargarResultado';
import Gestion from './pages/Gestion';
import Temporadas from './pages/Temporadas';

function App() {
  return (
    <ModalProvider>
      <AppProvider>
        <Routes>
          <Route element={<Navbar />}>
            <Route index element={<Home />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="equipos" element={<Equipos />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="clasificacion" element={<Estadisticas />} />
            <Route path="dashboard" element={<Estadisticas />} />
            <Route path="equipo/:equipoId" element={<DetalleEquipo />} />
            <Route path="login" element={<Login />} />
            
            {/* Rutas Protegidas (Solo Administradores) */}
            <Route path="cargar/:partidoId" element={
              <ProtectedRoute>
                <CargarResultado />
              </ProtectedRoute>
            } />
            <Route path="gestion" element={
              <ProtectedRoute>
                <Gestion />
              </ProtectedRoute>
            } />
            <Route path="temporadas" element={
              <ProtectedRoute>
                <Temporadas />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </AppProvider>
    </ModalProvider>
  );
}

export default App;