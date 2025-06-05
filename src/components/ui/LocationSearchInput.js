import React, { useState, useEffect, useRef } from 'react';
import { searchLocationsInLebanon, searchWithAlternativeSpellings } from '../../services/locationService';
import { colors, spacing, borderRadius, typography } from '../../themes/theme';

const LocationSearchInput = ({ 
  value = '', 
  onChange, 
  onLocationSelect,
  placeholder = 'Search for a location in Lebanon...',
  disabled = false,
  error = null
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimeout = useRef(null);

  // Update search query when value prop changes
  useEffect(() => {
    setSearchQuery(value);
  }, [value]);

  // Handle search with debouncing
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchQuery.trim().length >= 1) {
      setIsLoading(true);
      
      debounceTimeout.current = setTimeout(async () => {
        console.log('🔍 Starting search for:', searchQuery);
        
        try {
          // Primary search
          let result = await searchLocationsInLebanon(searchQuery, 8);
          console.log('✅ Primary search results:', result.locations?.length || 0);
          
          // If we don't have enough results, try alternatives
          if (!result.locations || result.locations.length < 3) {
            console.log('🔄 Trying alternative spellings...');
            const alternativeResult = await searchWithAlternativeSpellings(searchQuery, 5);
            
            if (alternativeResult.locations && alternativeResult.locations.length > 0) {
              const existingIds = new Set((result.locations || []).map(loc => loc.id));
              const additionalLocations = alternativeResult.locations.filter(loc => !existingIds.has(loc.id));
              
              result.locations = [...(result.locations || []), ...additionalLocations];
              console.log('✅ Combined results:', result.locations.length);
            }
          }
          
          setSuggestions(result.locations || []);
          setShowSuggestions(true);
          console.log('📋 Showing suggestions:', result.locations?.length || 0);
          
        } catch (error) {
          console.error('❌ Search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Reduced debounce time
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    console.log('📝 Input changed to:', newValue);
    setSearchQuery(newValue);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleLocationSelect = (location) => {
    console.log('📍 Location selected:', location.shortName);
    const locationName = location.shortName || location.name;
    setSearchQuery(locationName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    if (onChange) {
      onChange(locationName);
    }
    
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleLocationSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused, suggestions:', suggestions.length);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      if (!suggestionsRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  const highlightMatchedText = (text, query) => {
    if (!query.trim()) return text;
    
    try {
      const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <strong key={index} style={{ backgroundColor: colors.primary?.light || '#e3f2fd', color: colors.primary?.main || '#1976d2' }}>
            {part}
          </strong>
        ) : part
      );
    } catch (error) {
      return text;
    }
  };

  const styles = {
    container: {
      position: 'relative',
      width: '100%'
    },
    input: {
      width: '100%',
      padding: spacing?.sm || '8px',
      border: `1px solid ${error ? (colors.status?.error || '#f44336') : (colors.border?.main || '#ccc')}`,
      borderRadius: borderRadius?.sm || '4px',
      fontSize: `${typography?.fontSize || 14}px`,
      backgroundColor: disabled ? (colors.background?.default || '#f5f5f5') : (colors.background?.paper || '#fff'),
      color: colors.text?.primary || '#333',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      boxSizing: 'border-box'
    },
    inputFocused: {
      borderColor: colors.primary?.main || '#1976d2',
      boxShadow: `0 0 0 2px ${colors.primary?.light || '#e3f2fd'}`
    },
    suggestionsContainer: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.background?.paper || '#fff',
      border: `1px solid ${colors.border?.main || '#ccc'}`,
      borderTop: 'none',
      borderRadius: `0 0 ${borderRadius?.sm || '4px'} ${borderRadius?.sm || '4px'}`,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      maxHeight: '250px',
      overflowY: 'auto',
      zIndex: 1000
    },
    suggestion: {
      padding: spacing?.sm || '8px',
      cursor: 'pointer',
      borderBottom: `1px solid ${colors.border?.light || '#eee'}`,
      transition: 'background-color 0.15s ease'
    },
    suggestionSelected: {
      backgroundColor: colors.primary?.light || '#e3f2fd',
      color: colors.primary?.main || '#1976d2'
    },
    suggestionHover: {
      backgroundColor: colors.border?.light || '#f5f5f5'
    },
    locationName: {
      fontSize: `${typography?.fontSize || 14}px`,
      fontWeight: typography?.fontWeightMedium || 500,
      marginBottom: '2px',
      color: colors.text?.primary || '#333'
    },
    locationDetails: {
      fontSize: `${(typography?.fontSize || 14) - 2}px`,
      color: colors.text?.secondary || '#666',
      lineHeight: 1.3
    },
    loadingIndicator: {
      padding: spacing?.sm || '8px',
      textAlign: 'center',
      color: colors.text?.secondary || '#666',
      fontSize: `${(typography?.fontSize || 14) - 2}px`
    },
    noResults: {
      padding: spacing?.sm || '8px',
      color: colors.text?.secondary || '#666',
      fontSize: `${(typography?.fontSize || 14) - 2}px`,
      textAlign: 'center'
    }
  };

  console.log('🎨 Rendering LocationSearchInput - Query:', searchQuery, 'Suggestions:', suggestions.length, 'Showing:', showSuggestions);

  return (
    <div style={styles.container}>
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...styles.input,
          ...(document.activeElement === inputRef.current ? styles.inputFocused : {})
        }}
      />
      
      {showSuggestions && (
        <div ref={suggestionsRef} style={styles.suggestionsContainer}>
          {isLoading && (
            <div style={styles.loadingIndicator}>
              🔍 Searching locations...
            </div>
          )}
          
          {!isLoading && suggestions.length === 0 && searchQuery.trim().length >= 1 && (
            <div style={styles.noResults}>
              No locations found for "{searchQuery}"
              <br />
              <small>Try: Beirut, Tripoli, Sidon, Tyre, Abbasieh...</small>
            </div>
          )}
          
          {!isLoading && suggestions.map((location, index) => (
            <div
              key={location.id}
              style={{
                ...styles.suggestion,
                ...(index === selectedIndex ? styles.suggestionSelected : {}),
              }}
              onClick={() => handleLocationSelect(location)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div style={styles.locationName}>
                {highlightMatchedText(location.shortName || location.name, searchQuery)}
              </div>
              <div style={styles.locationDetails}>
                {location.address.city && `${location.address.city}, `}
                {location.address.governorate && `${location.address.governorate}, `}
                Lebanon
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearchInput; 