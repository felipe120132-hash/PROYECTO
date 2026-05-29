import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Global Styles
import './index.css';
import './App.css'; // Keep App.css for any remaining base styles

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Login from './pages/Login';

function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="about" element={<About />} />
          <Route path="login" element={<Login />} />
          {/* Fallback — redirigir rutas desconocidas al inicio */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}

export default App;