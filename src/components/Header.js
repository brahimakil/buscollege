import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, shadows, typography } from '../themes/theme';

const headerStyles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md} ${spacing.xl}`,
    backgroundColor: colors.primary.main,
    color: colors.text.light,
    boxShadow: shadows.md,
    zIndex: 1000,
    position: 'fixed',
    top: 0,
    right: 0,
    left: '250px', // Space for sidebar
    height: '64px',
  },
  title: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.fontWeightMedium,
    margin: 0
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md
  },
  userText: {
    fontSize: typography.fontSize,
    fontWeight: typography.fontWeightRegular
  },
  logoutButton: {
    padding: `${spacing.xs} ${spacing.md}`,
    backgroundColor: 'transparent',
    border: `1px solid ${colors.text.light}`,
    borderRadius: '4px',
    color: colors.text.light,
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: '0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)'
    }
  }
};

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header style={headerStyles.header}>
      <h1 style={headerStyles.title}>Bus College Admin</h1>
      
      <div style={headerStyles.userInfo}>
        <span style={headerStyles.userText}>
          Welcome, {currentUser?.name || 'Admin'}
        </span>
      </div>
    </header>
  );
};

export default Header; 