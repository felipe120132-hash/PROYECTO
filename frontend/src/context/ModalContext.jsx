import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();
export const useModal = () => useContext(ModalContext);

export function ModalProvider({ children }) {
  const [modal, setModal] = useState(null);

  const showAlert = useCallback((mensaje, tipo = 'info') => {
    return new Promise(resolve => {
      setModal({ tipo, mensaje, modo: 'alert', onAceptar: () => { setModal(null); resolve(); } });
    });
  }, []);

  const showConfirm = useCallback((mensaje) => {
    return new Promise(resolve => {
      setModal({
        tipo: 'confirm',
        mensaje,
        modo: 'confirm',
        onAceptar: () => { setModal(null); resolve(true); },
        onCancelar: () => { setModal(null); resolve(false); },
      });
    });
  }, []);

  const getIcono = (mensaje, modo) => {
    if (mensaje?.startsWith('✅')) return { icono: '✅', color: '#22c55e' };
    if (mensaje?.startsWith('⚠️')) return { icono: '⚠️', color: '#f97316' };
    if (mensaje?.startsWith('📅')) return { icono: '📅', color: '#3b82f6' };
    if (modo === 'confirm') return { icono: '❓', color: '#6366f1' };
    return { icono: 'ℹ️', color: '#3b82f6' };
  };

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {modal && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={modal.modo === 'alert' ? modal.onAceptar : undefined}
        >
          <div
            style={{
              background: '#fff', borderRadius: '16px',
              padding: '32px', width: '100%', maxWidth: '380px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
              display: 'flex', flexDirection: 'column', gap: '20px',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', fontSize: '42px' }}>
              {getIcono(modal.mensaje, modal.modo).icono}
            </div>

            <p style={{
              margin: 0, textAlign: 'center',
              fontSize: '15px', color: '#333',
              lineHeight: '1.6', whiteSpace: 'pre-line',
            }}>
              {modal.mensaje?.replace(/^(✅|⚠️|📅|❓|ℹ️)\s*/, '')}
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              {modal.modo === 'confirm' && (
                <button
                  onClick={modal.onCancelar}
                  style={{
                    flex: 1, padding: '11px', borderRadius: '8px',
                    background: '#f1f1f1', color: '#555',
                    border: 'none', fontWeight: '600',
                    fontSize: '14px', cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={modal.onAceptar}
                style={{
                  flex: 1, padding: '11px', borderRadius: '8px',
                  background: '#f97316', color: '#fff',
                  border: 'none', fontWeight: '700',
                  fontSize: '14px', cursor: 'pointer',
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}