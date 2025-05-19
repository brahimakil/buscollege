import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, shadows, typography } from '../themes/theme';

const Header = ({ onMenuToggle, isMobile }) => {
  const { currentUser } = useAuth();
  
  const styles = {
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: isMobile ? `${spacing.md} ${spacing.md}` : `${spacing.md} ${spacing.xl}`,
      backgroundColor: colors.primary.main,
      color: colors.text.light,
      boxShadow: shadows.md,
      zIndex: 1000,
      position: 'fixed',
      top: 0,
      right: 0,
      left: isMobile ? 0 : '250px',
      height: '64px',
    },
    title: {
      fontSize: isMobile ? '1.2rem' : typography.h4.fontSize,
      fontWeight: typography.fontWeightMedium,
      margin: 0,
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md
    },
    userText: {
      fontSize: isMobile ? '0.875rem' : typography.fontSize,
      fontWeight: typography.fontWeightRegular,
    },
    menuButton: {
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text.light,
      fontSize: '1.5rem',
      cursor: 'pointer',
      marginRight: spacing.sm,
      display: isMobile ? 'block' : 'none',
    }
  };

  return (
    <header style={styles.header}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button 
          style={styles.menuButton} 
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <h1 style={styles.title}>Bus College Admin</h1>
      </div>
      
      <div style={styles.userInfo}>
        <span style={styles.userText}>
          Welcome, {currentUser?.name || 'Admin'}
        </span>
      </div>
    </header>
  );
};

export default Header; 