import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';
import { colors, spacing } from '../themes/theme';

const layoutStyles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  mainContent: {
    marginLeft: '250px', // Space for sidebar
    paddingTop: '64px', // Space for header
    paddingBottom: '50px', // Space for footer
    width: 'calc(100% - 250px)',
    backgroundColor: colors.background.default,
    minHeight: 'calc(100vh - 114px)', // 100vh - (header + footer)
    padding: spacing.xl
  }
};

const MainLayout = ({ children }) => {
  return (
    <div style={layoutStyles.container}>
      <Sidebar />
      <Header />
      <main style={layoutStyles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout; 