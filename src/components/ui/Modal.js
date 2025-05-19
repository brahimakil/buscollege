import React, { useEffect } from 'react';
import { colors, spacing, borderRadius, shadows, transitions } from '../../themes/theme';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    transition: transitions.normal
  },
  modal: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    padding: 0,
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    animation: 'modalFadeIn 0.3s ease'
  },
  header: {
    padding: spacing.lg,
    borderBottom: `1px solid ${colors.border.light}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    backgroundColor: colors.background.paper,
    zIndex: 1
  },
  title: {
    margin: 0,
    fontSize: '1.25rem'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.5rem',
    color: colors.text.secondary
  },
  body: {
    padding: spacing.lg,
    maxHeight: 'calc(90vh - 120px)', // Adjust based on header/footer height
    overflow: 'auto'
  }
};

// Add animation styles to document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(styleSheet);
}

const Modal = ({ isOpen, onClose, title, children }) => {
  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      // Prevent scrolling of body when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={handleModalClick}>
        <div style={styles.header}>
          <h2 style={styles.title}>{title}</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>
        <div style={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 