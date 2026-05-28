import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import './BottomSheet.css';

export default function BottomSheet({
  onClose,
  title,
  header,
  footer,
  children,
  className = "",
  contentClassName = "",
  footerClassName = ""
}) {
  return createPortal(
    <motion.div
      className="bottom-sheet-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`bottom-sheet standard-sheet ${className}`}
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0.1, bottom: 0.8 }}
        onDragEnd={(event, info) => {
          if (info.offset.y > 100) {
            onClose();
          }
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="bottom-sheet-handle" />

        {header ? (
          <div className="bottom-sheet-header-wrapper">{header}</div>
        ) : title ? (
          <div className="bottom-sheet-header">
            <h3 className="sheet-title">{title}</h3>
            {onClose && (
              <button className="sheet-close-btn" onClick={onClose} aria-label="Close sheet">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        ) : null}

        <div className={`bottom-sheet-content ${contentClassName}`}>
          {children}
        </div>

        {footer && (
          <div className={`bottom-sheet-footer ${footerClassName}`}>
            {footer}
          </div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
