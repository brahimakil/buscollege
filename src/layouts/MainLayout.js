import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { colors, spacing, breakpoints } from '../themes/theme';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < parseInt(breakpoints.md));
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  // Fixed styles
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
  };
  
  const mainContentStyle = {
    transition: 'margin-left 0.3s ease',
    paddingTop: '64px',
    paddingBottom: '50px',
    backgroundColor: colors.background.default,
    minHeight: 'calc(100vh - 114px)',
    padding: isMobile ? spacing.md : spacing.xl,
    width: isMobile ? '100%' : 'calc(100% - 250px)',
    marginLeft: isMobile ? 0 : '250px',
  };
  
  const overlayStyle = {
    display: isMobile && isMobileMenuOpen ? 'block' : 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };
  
  return (
    <div style={containerStyle}>
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} isMobile={isMobile} />
      <Header onMenuToggle={toggleMobileMenu} isMobile={isMobile} />
      <div style={overlayStyle} onClick={() => setIsMobileMenuOpen(false)} />
      <main style={mainContentStyle}>
        {children}
      </main>
      <Footer isMobile={isMobile} />
    </div>
  );
};

export default MainLayout; 