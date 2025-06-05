import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { colors, spacing, breakpoints } from '../themes/theme';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < parseInt(breakpoints.md);
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile(); // Initial check
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  // Updated sidebar width
  const sidebarWidth = '280px';
  
  // Fixed styles with proper spacing and dynamic layout
  const containerStyle = {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
  };
  
  const mainContentStyle = {
    transition: 'margin-left 0.3s ease, width 0.3s ease',
    paddingTop: `calc(64px + ${spacing.xl})`, // Space after header
    paddingBottom: '50px',
    backgroundColor: colors.background.default,
    minHeight: 'calc(100vh - 114px)',
    padding: `calc(64px + ${spacing.xl}) ${spacing.xl} 50px ${spacing.xl}`,
    width: isMobile ? '100%' : (isSidebarOpen ? `calc(100% - ${sidebarWidth})` : '100%'),
    marginLeft: isMobile ? 0 : (isSidebarOpen ? sidebarWidth : 0),
  };
  
  const overlayStyle = {
    display: isMobile && isSidebarOpen ? 'block' : 'none',
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
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar}
        isMobile={isMobile}
      />
      
      <Header 
        onMenuToggle={toggleSidebar}
        isMobile={isMobile}
        sidebarOpen={isSidebarOpen}
      />
      
      <main style={mainContentStyle}>
        {children}
      </main>
      
      <Footer isMobile={isMobile} />
      
      {/* Mobile overlay */}
      <div 
        style={overlayStyle}
        onClick={closeSidebar}
      />
    </div>
  );
};

export default MainLayout; 