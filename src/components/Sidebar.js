import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, shadows } from '../themes/theme';

// Professional SVG Icons
const icons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
    </svg>
  ),
  buses: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
    </svg>
  ),
  drivers: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  riders: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2-2-.89-2-2-2zm4 18v-6h2.5l-2.54-7.63A1.75 1.75 0 0 0 18.3 7.5h-2.6c-.76 0-1.43.5-1.66 1.23L12.5 16H15v6h5zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5C9 8.12 7.88 7 6.5 7S4 8.12 4 9.5V15H5.5v7h2z"/>
    </svg>
  ),
  logout: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
    </svg>
  ),
  close: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  )
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

  const styles = {
    sidebar: {
      position: 'fixed',
      top: 0,
      left: isOpen ? 0 : '-280px',
      width: '280px',
      height: '100vh',
      backgroundColor: colors.background.sidebar,
      color: colors.text.light,
      boxShadow: shadows.lg,
      transition: 'left 0.3s ease',
      zIndex: isMobile ? 1000 : 900,
      overflowY: 'auto',
    },
    header: {
      padding: `${spacing.xl} ${spacing.lg}`,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: typography.fontWeightBold,
      textAlign: 'center',
      letterSpacing: '1px',
      color: colors.text.light,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    logoIcon: {
      width: '32px',
      height: '32px',
      backgroundColor: colors.accent.main,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: colors.text.light,
      fontSize: '1.2rem',
      fontWeight: 'bold',
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '32px',
      height: '32px',
      borderRadius: '4px',
      transition: 'background-color 0.2s',
    },
    nav: {
      flex: 1,
      padding: `${spacing.lg} 0`,
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      padding: `${spacing.md} ${spacing.lg}`,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeightMedium,
      textDecoration: 'none',
      color: colors.text.light,
      transition: 'all 0.2s ease',
      marginBottom: spacing.xs,
      cursor: 'pointer',
      position: 'relative',
    },
    navItemActive: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderRight: `4px solid ${colors.accent.main}`,
      fontWeight: typography.fontWeightBold,
      color: '#ffffff',
    },
    navItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    icon: {
      marginRight: spacing.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '24px',
      height: '24px',
    },
    footer: {
      padding: spacing.lg,
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'center',
    },
    footerText: {
      fontSize: '0.75rem',
      color: 'rgba(255, 255, 255, 0.6)',
      marginBottom: spacing.sm,
    },
    version: {
      fontSize: '0.7rem',
      color: 'rgba(255, 255, 255, 0.4)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      padding: `${spacing.xs} ${spacing.sm}`,
      borderRadius: '12px',
      display: 'inline-block',
    },
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNavItemHover = (e, isHover) => {
    if (isHover) {
      e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
    } else {
      const isActive = location.pathname === e.target.getAttribute('data-path');
      e.target.style.backgroundColor = isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent';
    }
  };

  const handleCloseButtonHover = (e, isHover) => {
    e.target.style.backgroundColor = isHover ? 'rgba(255, 255, 255, 0.1)' : 'transparent';
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <button 
          style={styles.closeButton} 
          onClick={onClose}
          onMouseEnter={(e) => handleCloseButtonHover(e, true)}
          onMouseLeave={(e) => handleCloseButtonHover(e, false)}
          aria-label="Close menu"
        >
          {icons.close}
        </button>
        
        <div style={styles.logo}>
          <div style={styles.logoIcon}>BC</div>
          <span>BusCollege</span>
        </div>
      </div>
      
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              data-path={item.path}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              }}
              onMouseEnter={(e) => handleNavItemHover(e, true)}
              onMouseLeave={(e) => handleNavItemHover(e, false)}
              onClick={() => {
                onClose();
              }}
            >
              <span style={styles.icon}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
        
        <div 
          style={styles.navItem}
          onMouseEnter={(e) => handleNavItemHover(e, true)}
          onMouseLeave={(e) => handleNavItemHover(e, false)}
          onClick={handleLogout}
        >
          <span style={styles.icon}>{icons.logout}</span>
          Logout
        </div>
      </nav>
      
      <div style={styles.footer}>
        <div style={styles.footerText}>
          &copy; {new Date().getFullYear()} BusCollege System
        </div>
        <div style={styles.version}>
          v1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 