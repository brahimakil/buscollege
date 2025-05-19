import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, typography, transitions } from '../themes/theme';

// Dashboard icons (you can replace with actual SVG icons)
const icons = {
  dashboard: '📊',
  buses: '🚌',
  drivers: '👨‍✈️',
  riders: '👥',
  logout: '🚪'
};

const sidebarStyles = {
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
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)'
  },
  logo: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.xl,
    padding: `0 ${spacing.md}`,
    letterSpacing: '1px'
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
  navItemHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)'
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

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
  { path: '/buses', label: 'Buses', icon: icons.buses },
  { path: '/drivers', label: 'Drivers', icon: icons.drivers },
  { path: '/riders', label: 'Riders', icon: icons.riders }
];

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div style={sidebarStyles.sidebar}>
      <div style={sidebarStyles.logo}>BusCollege</div>
      
      <nav>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...sidebarStyles.navItem,
              ...(location.pathname === item.path ? sidebarStyles.navItemActive : {})
            }}
          >
            <span style={sidebarStyles.icon}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
        
        <div 
          style={sidebarStyles.navItem}
          onClick={handleLogout}
        >
          <span style={sidebarStyles.icon}>{icons.logout}</span>
          Logout
        </div>
      </nav>
      
      <div style={sidebarStyles.footer}>
        &copy; {new Date().getFullYear()} Bus College System
      </div>
    </div>
  );
};

export default Sidebar; 