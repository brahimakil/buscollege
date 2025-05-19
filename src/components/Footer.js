import React from 'react';
import { colors, spacing, typography } from '../themes/theme';

const footerStyles = {
  footer: {
    padding: spacing.md,
    backgroundColor: colors.background.paper,
    color: colors.text.secondary,
    borderTop: `1px solid ${colors.border.light}`,
    textAlign: 'center',
    fontSize: typography.fontSize * 0.85,
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: '250px', // Space for sidebar
    zIndex: 900
  }
};

const Footer = () => {
  return (
    <footer style={footerStyles.footer}>
      <p>&copy; {new Date().getFullYear()} Bus College Administration System. All rights reserved.</p>
    </footer>
  );
};

export default Footer; 