import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './AlertContext.css';

const AlertContext = createContext(null);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // { title, message, type, placeholder, resolve, inputValue }
  
  const toastIdSeq = useRef(0);
  const activeTimeouts = useRef(new Map());

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      activeTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      activeTimeouts.current.clear();
    };
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && modal) {
        if (modal.type === 'confirm' || modal.type === 'prompt') {
          modal.resolve(null);
        } else {
          modal.resolve(true);
        }
        setModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = toastIdSeq.current++;
    setToasts(prev => [...prev, { id, message, type }]);
    
    const timeoutId = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      activeTimeouts.current.delete(id);
    }, duration);
    
    activeTimeouts.current.set(id, timeoutId);
  }, []);

  const showAlert = useCallback((message, title = 'Notification') => {
    return new Promise(resolve => {
      setModal({
        title,
        message,
        type: 'alert',
        resolve: (val) => {
          setModal(null);
          resolve(val);
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = 'Confirm Action', options = {}) => {
    return new Promise(resolve => {
      setModal({
        title,
        message,
        type: 'confirm',
        resolve: (val) => {
          setModal(null);
          resolve(val);
        },
        okText: options.okText || 'CONFIRM',
        cancelText: options.cancelText || 'CANCEL',
        danger: options.danger || false
      });
    });
  }, []);

  const showPrompt = useCallback((message, placeholder = '', title = 'Input Required') => {
    return new Promise(resolve => {
      setModal({
        title,
        message,
        type: 'prompt',
        placeholder,
        inputValue: '',
        resolve: (val) => {
          setModal(null);
          resolve(val);
        }
      });
    });
  }, []);

  const handleModalSubmit = useCallback((e) => {
    e.preventDefault();
    if (!modal) return;
    if (modal.type === 'prompt') {
      modal.resolve(modal.inputValue);
    } else {
      modal.resolve(true);
    }
  }, [modal]);

  const handleModalCancel = useCallback(() => {
    if (!modal) return;
    if (modal.type === 'confirm' || modal.type === 'prompt') {
      modal.resolve(null); // or false
    } else {
      modal.resolve(true);
    }
  }, [modal]);

  return (
    <AlertContext.Provider value={{ showToast, showAlert, showConfirm, showPrompt }}>
      {children}
      
      {/* Toast Overlay */}
      <div className="toast-container" aria-live="polite">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              className={`toast-item toast-${toast.type}`}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              role="alert"
            >
              <div className="toast-icon">
                {toast.type === 'success' && '✓'}
                {toast.type === 'error' && '✕'}
                {toast.type === 'info' && 'i'}
              </div>
              <span className="toast-message">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {modal && (
          <motion.div 
            className="dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalCancel}
          >
            <motion.div 
              className={`dialog-box ${modal.danger ? 'dialog-danger' : ''}`}
              initial={{ y: 50, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 50, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-message"
            >
              <div className="dialog-header">
                <span id="dialog-title" className="dialog-title">{modal.title}</span>
              </div>
              
              <div className="dialog-body">
                <p id="dialog-message" className="dialog-message">{modal.message}</p>
                {modal.type === 'prompt' && (
                  <form onSubmit={handleModalSubmit}>
                    <input 
                      type="text" 
                      className="dialog-input"
                      placeholder={modal.placeholder}
                      autoFocus
                      value={modal.inputValue}
                      onChange={e => {
                        const val = e.target.value;
                        setModal(prev => ({ ...prev, inputValue: val }));
                      }}
                    />
                  </form>
                )}
              </div>

              <div className="dialog-footer">
                {(modal.type === 'confirm' || modal.type === 'prompt') && (
                  <button 
                    type="button" 
                    className="btn-ghost dialog-btn-cancel" 
                    onClick={handleModalCancel}
                  >
                    {modal.cancelText || 'CANCEL'}
                  </button>
                )}
                <button 
                  type="button" 
                  className={`btn-primary dialog-btn-ok ${modal.danger ? 'btn-danger' : ''}`}
                  onClick={() => {
                    if (modal.type === 'prompt') {
                      modal.resolve(modal.inputValue);
                    } else {
                      modal.resolve(true);
                    }
                  }}
                >
                  {modal.type === 'confirm' ? (modal.okText || 'CONFIRM') : 'OK'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
}
