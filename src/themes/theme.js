// Global theme configuration

// Color Palette
export const colors = {
  // Primary Colors
  primary: {
    main: '#5E35B1', // Deep Purple
    light: '#7E57C2',
    dark: '#4527A0',
    contrastText: '#FFFFFF'
  },
  // Secondary Colors
  secondary: {
    main: '#2196F3', // Blue
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF'
  },
  // Accent Colors
  accent: {
    main: '#FF4081', // Pink
    light: '#FF80AB',
    dark: '#C51162',
    contrastText: '#FFFFFF'
  },
  // Background Colors
  background: {
    default: '#F5F5F5', // Light Grey
    paper: '#FFFFFF',
    sidebar: '#241750' // Dark Purple for sidebar
  },
  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9E9E9E',
    hint: '#9E9E9E',
    light: '#FFFFFF'
  },
  // Status Colors
  status: {
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3'
  },
  // Border Colors
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#9E9E9E'
  }
};

// Typography
export const typography = {
  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 500
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 500
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 500
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 500
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 500
  }
};

// Spacing
export const spacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  xxl: '3rem'       // 48px
};

// Border radius
export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '24px',
  round: '50%'
};

// Shadows
export const shadows = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  md: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
  lg: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  xl: '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  xxl: '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)'
};

// Transitions
export const transitions = {
  fast: '0.2s ease',
  normal: '0.3s ease',
  slow: '0.5s ease'
};

// Breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '600px',
  md: '960px',
  lg: '1280px',
  xl: '1920px'
};

// Z-Index
export const zIndex = {
  mobileStepper: 1000,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500
};

// Export all theme variables as default
export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex
}; 