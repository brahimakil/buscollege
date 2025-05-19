import React from 'react';
import { colors, spacing, typography } from '../themes/theme';

const Footer = ({ isMobile }) => {
  const styles = {
    footer: {
      padding: isMobile ? spacing.sm : spacing.md,
      backgroundColor: colors.background.paper,
      color: colors.text.secondary,
      borderTop: `1px solid ${colors.border.light}`,
      textAlign: 'center',
      fontSize: isMobile ? typography.fontSize * 0.75 : typography.fontSize * 0.85,
      position: 'fixed',
      bottom: 0,
      right: 0,
      left: isMobile ? 0 : '250px', 
      zIndex: 900,
    }
  };

  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Bus College Administration System. All rights reserved.</p>
    </footer>
  );
};

export default Footer; 