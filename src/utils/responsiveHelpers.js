/**
 * Utility function to apply media queries to inline styles
 * This is needed because inline styles don't natively support media queries
 */
export const applyMediaQueries = (baseStyles, mediaStyles) => {
  // Create a style element if it doesn't exist
  let styleEl = document.getElementById('responsive-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'responsive-styles';
    document.head.appendChild(styleEl);
  }

  // Generate unique class name
  const uniqueClassName = `responsive-${Math.random().toString(36).substring(2, 9)}`;
  
  // Build CSS rules
  let cssRules = `.${uniqueClassName} {`;
  
  // Add base styles as !important to override inline styles
  Object.keys(baseStyles).forEach(prop => {
    // Convert camelCase to kebab-case
    const kebabProp = prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    cssRules += `${kebabProp}: ${baseStyles[prop]} !important;`;
  });
  
  cssRules += '}';
  
  // Add media query styles
  Object.keys(mediaStyles).forEach(mediaQuery => {
    cssRules += `${mediaQuery} {`;
    cssRules += `.${uniqueClassName} {`;
    
    Object.keys(mediaStyles[mediaQuery]).forEach(prop => {
      const kebabProp = prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
      cssRules += `${kebabProp}: ${mediaStyles[mediaQuery][prop]} !important;`;
    });
    
    cssRules += '}}';
  });
  
  // Add the CSS to the style element
  styleEl.innerHTML += cssRules;
  
  // Return the class name to be applied to the element
  return uniqueClassName;
}; 