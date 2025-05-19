import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, transitions } from '../themes/theme';

// Dashboard icons
const icons = {
  dashboard: '📊',
  buses: '🚌',
  drivers: '👨‍✈️',
  riders: '👥',
  logout: '🚪',
  close: '✕'
};

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { path: '/buses', label: 'Buses', icon: icons.buses },
  { path: '/drivers', label: 'Drivers', icon: icons.drivers },
  { path: '/riders', label: 'Riders', icon: icons.riders }
];

const Sidebar = ({ isOpen, onClose, isMobile }) => {
  const location = useLocation();
  const { logout } = useAuth();

  // Simplified styles
  const styles = {
    sidebar: {
      width: '250px',
      height: '100vh',
      backgroundColor: colors.background.sidebar,
      color: colors.text.light,
      position: 'fixed',
      top: 0,
      left: 0,
      padding: `${spacing.xl} 0`,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
      transition: 'transform 0.3s ease',
    },
    logo: {
      fontSize: typography.h4.fontSize,
      fontWeight: typography.fontWeightBold,
      textAlign: 'center',
      marginBottom: spacing.xl,
      padding: `0 ${spacing.md}`,
      letterSpacing: '1px'
    },
    closeButton: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: 'transparent',
      border: 'none',
      color: colors.text.light,
      fontSize: '1.2rem',
      cursor: 'pointer',
      display: isMobile ? 'block' : 'none'
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing.md} ${spacing.xl}`,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeightRegular,
      textDecoration: 'none',
      color: colors.text.light,
      transition: transitions.normal,
      marginBottom: spacing.xs,
      cursor: 'pointer'
    },
    navItemActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderLeft: `4px solid ${colors.accent.main}`,
      fontWeight: typography.fontWeightMedium
    },
    icon: {
      marginRight: spacing.md,
      fontSize: '1.2rem'
    },
    footer: {
      marginTop: 'auto',
      padding: spacing.md,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.5)'
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={styles.sidebar}>
      <button 
        style={styles.closeButton} 
        onClick={onClose}
        aria-label="Close menu"
      >
        {icons.close}
      </button>
      
      <div style={styles.logo}>BusCollege</div>
      
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.navItem,
              ...(location.pathname === item.path ? styles.navItemActive : {})
            }}
            onClick={() => {
              if (isMobile) {
                onClose();
              }
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        
        <div 
          style={styles.navItem}
          onClick={handleLogout}
        >
          <span style={styles.icon}>{icons.logout}</span>
          Logout
        </div>
      </nav>
      
      <div style={styles.footer}>
        &copy; {new Date().getFullYear()} Bus College System
      </div>
    </div>
  );
};

export default Sidebar; 