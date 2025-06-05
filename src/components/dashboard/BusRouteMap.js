import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { colors, spacing, borderRadius, typography } from '../../themes/theme';

// Fix Leaflet default markers
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Route colors for different buses
const ROUTE_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336',
  '#00BCD4', '#8BC34A', '#FF5722', '#673AB7', '#795548'
];

// Default coordinates for major Lebanese cities (fallback data)
const LEBANON_CITY_COORDINATES = {
  'beirut': [33.8938, 35.5018],
  'tripoli': [34.4167, 35.8333],
  'sidon': [33.5533, 35.3731],
  'saida': [33.5533, 35.3731],
  'tyre': [33.2701, 35.2039],
  'sour': [33.2701, 35.2039],
  'zahle': [33.8463, 35.9010],
  'jounieh': [33.9808, 35.6178],
  'baalbek': [34.0061, 36.2094],
  'nabatieh': [33.3788, 35.4839],
  'abbasieh': [33.2701, 35.1739], // Near Tyre
  'abbasiyeh': [33.2701, 35.1739],
  'abbassiyeh': [33.2701, 35.1739],
  'byblos': [34.1208, 35.6479],
  'jbail': [34.1208, 35.6479]
};

const createBusStopIcon = (color) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12" cy="12" r="6" fill="#fff"/>
        <rect x="9" y="8" width="6" height="8" rx="1" fill="${color}"/>
        <rect x="10" y="6" width="4" height="2" rx="1" fill="${color}"/>
      </svg>
    `)}`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
};

// Function to get coordinates for a location
const getLocationCoordinates = (location) => {
  // If location already has coordinates, use them
  if (location.latitude && location.longitude) {
    return [location.latitude, location.longitude];
  }

  // Try to find coordinates based on location name
  const locationName = (location.name || '').toLowerCase().trim();
  
  // Check for exact matches first
  for (const [cityName, coords] of Object.entries(LEBANON_CITY_COORDINATES)) {
    if (locationName.includes(cityName)) {
      console.log(`📍 Found fallback coordinates for ${location.name}: ${coords}`);
      return coords;
    }
  }

  // If no match found, use a default location in Lebanon (Beirut)
  console.warn(`⚠️ No coordinates found for location: ${location.name}, using Beirut as fallback`);
  return LEBANON_CITY_COORDINATES.beirut;
};

const BusRouteMap = ({ buses = [] }) => {
  const [selectedDays, setSelectedDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true
  });
  const [selectedRoutes, setSelectedRoutes] = useState(new Set());
  const [routeData, setRouteData] = useState([]);
  const mapRef = useRef();

  // Lebanon center coordinates
  const LEBANON_CENTER = [33.8547, 35.8623];
  const LEBANON_ZOOM = 8;

  useEffect(() => {
    // Initialize all routes as selected
    if (buses.length > 0) {
      setSelectedRoutes(new Set(buses.map((_, index) => index)));
    }
  }, [buses]);

  useEffect(() => {
    // Process bus data into route data
    const processedRoutes = buses.map((bus, index) => {
      const color = ROUTE_COLORS[index % ROUTE_COLORS.length];
      
      // Sort locations by order and ensure they have coordinates
      const sortedLocations = (bus.locations || [])
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(location => ({
          ...location,
          coordinates: getLocationCoordinates(location)
        }))
        .filter(location => location.coordinates); // Only include locations with valid coordinates
      
      return {
        id: bus.id,
        name: bus.busName,
        label: bus.busLabel,
        color,
        locations: sortedLocations,
        workingDays: bus.workingDays || {},
        driverName: bus.driverName,
        operatingTime: `${bus.operatingTimeFrom || 'N/A'} - ${bus.operatingTimeTo || 'N/A'}`,
        maxCapacity: bus.maxCapacity,
        currentRiders: bus.currentRiders?.length || 0
      };
    }).filter(route => route.locations.length > 0); // Only include routes with valid locations
    
    setRouteData(processedRoutes);
  }, [buses]);

  // Filter routes based on selected days and routes
  const getFilteredRoutes = () => {
    return routeData.filter((route, index) => {
      // Check if route is selected
      if (!selectedRoutes.has(index)) return false;
      
      // Check if route operates on any of the selected days
      const routeWorkingDays = route.workingDays;
      const hasMatchingDay = Object.keys(selectedDays).some(day => 
        selectedDays[day] && routeWorkingDays[day]
      );
      
      return hasMatchingDay;
    });
  };

  // Simulate route path calculation (in real app, you'd use routing service)
  const calculateRoutePath = (locations) => {
    if (!locations || locations.length < 2) return [];
    
    // For demo purposes, we'll create simple straight lines between points
    // In production, you'd use OpenRouteService, Mapbox, or similar for real routing
    const path = [];
    
    for (let i = 0; i < locations.length - 1; i++) {
      const start = locations[i];
      const end = locations[i + 1];
      
      if (!start.coordinates || !end.coordinates) continue;
      
      // Add intermediate points for smoother curves
      const steps = 5;
      for (let step = 0; step <= steps; step++) {
        const ratio = step / steps;
        const lat = start.coordinates[0] + (end.coordinates[0] - start.coordinates[0]) * ratio;
        const lng = start.coordinates[1] + (end.coordinates[1] - start.coordinates[1]) * ratio;
        path.push([lat, lng]);
      }
    }
    
    return path;
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  const handleRouteToggle = (routeIndex) => {
    setSelectedRoutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(routeIndex)) {
        newSet.delete(routeIndex);
      } else {
        newSet.add(routeIndex);
      }
      return newSet;
    });
  };

  const handleSelectAllRoutes = () => {
    setSelectedRoutes(new Set(routeData.map((_, index) => index)));
  };

  const handleDeselectAllRoutes = () => {
    setSelectedRoutes(new Set());
  };

  const filteredRoutes = getFilteredRoutes();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      backgroundColor: colors.background.paper,
      borderRadius: borderRadius.md,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    },
    controlsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: spacing.md,
      padding: spacing.md,
      backgroundColor: colors.background.default,
      borderBottom: `1px solid ${colors.border.light}`
    },
    filterSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacing.xs
    },
    filterTitle: {
      fontSize: `${typography.fontSize - 1}px`,
      fontWeight: typography.fontWeightMedium,
      color: colors.text.primary,
      marginBottom: spacing.xs
    },
    dayFilters: {
      display: 'flex',
      gap: spacing.xs,
      flexWrap: 'wrap'
    },
    dayButton: {
      padding: `${spacing.xs} ${spacing.sm}`,
      border: `1px solid ${colors.border.main}`,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background.paper,
      color: colors.text.secondary,
      cursor: 'pointer',
      fontSize: `${typography.fontSize - 2}px`,
      transition: 'all 0.2s ease'
    },
    dayButtonActive: {
      backgroundColor: colors.primary.main,
      borderColor: colors.primary.main,
      color: colors.text.light
    },
    routeFilters: {
      display: 'flex',
      gap: spacing.xs,
      flexWrap: 'wrap',
      maxHeight: '120px',
      overflowY: 'auto'
    },
    routeButton: {
      padding: `${spacing.xs} ${spacing.sm}`,
      border: '2px solid',
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background.paper,
      color: colors.text.primary,
      cursor: 'pointer',
      fontSize: `${typography.fontSize - 2}px`,
      fontWeight: typography.fontWeightMedium,
      transition: 'all 0.2s ease',
      minWidth: '80px',
      textAlign: 'center'
    },
    controlButtons: {
      display: 'flex',
      gap: spacing.xs
    },
    controlButton: {
      padding: `${spacing.xs} ${spacing.sm}`,
      border: `1px solid ${colors.border.main}`,
      borderRadius: borderRadius.sm,
      backgroundColor: colors.background.paper,
      color: colors.text.primary,
      cursor: 'pointer',
      fontSize: `${typography.fontSize - 2}px`,
      transition: 'all 0.2s ease'
    },
    mapWrapper: {
      flex: 1,
      position: 'relative'
    },
    mapContainer: {
      height: '100%',
      width: '100%'
    },
    legend: {
      position: 'absolute',
      top: spacing.md,
      right: spacing.md,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: spacing.md,
      borderRadius: borderRadius.sm,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000,
      maxWidth: '200px',
      maxHeight: '300px',
      overflowY: 'auto'
    },
    legendTitle: {
      fontSize: `${typography.fontSize - 1}px`,
      fontWeight: typography.fontWeightMedium,
      marginBottom: spacing.sm,
      color: colors.text.primary
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
      fontSize: `${typography.fontSize - 2}px`
    },
    legendColor: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      flexShrink: 0
    },
    stats: {
      position: 'absolute',
      bottom: spacing.md,
      right: spacing.md,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      padding: spacing.md,
      borderRadius: borderRadius.sm,
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 1000
    },
    statsTitle: {
      fontSize: `${typography.fontSize - 1}px`,
      fontWeight: typography.fontWeightMedium,
      marginBottom: spacing.sm,
      color: colors.text.primary
    },
    statsItem: {
      fontSize: `${typography.fontSize - 2}px`,
      color: colors.text.secondary,
      marginBottom: spacing.xs
    }
  };

  if (buses.length === 0) {
    return (
      <div style={styles.container}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: colors.text.secondary 
        }}>
          🚌 No bus routes available to display
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Controls */}
      <div style={styles.controlsContainer}>
        <div style={styles.filterSection}>
          <div style={styles.filterTitle}>📅 Filter by Days</div>
          <div style={styles.dayFilters}>
            {Object.entries(selectedDays).map(([day, isSelected]) => (
              <button
                key={day}
                onClick={() => handleDayToggle(day)}
                style={{
                  ...styles.dayButton,
                  ...(isSelected ? styles.dayButtonActive : {})
                }}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.filterSection}>
          <div style={styles.filterTitle}>🚌 Filter by Routes</div>
          <div style={styles.routeFilters}>
            {routeData.map((route, index) => (
              <button
                key={route.id}
                onClick={() => handleRouteToggle(index)}
                style={{
                  ...styles.routeButton,
                  borderColor: route.color,
                  backgroundColor: selectedRoutes.has(index) ? route.color : colors.background.paper,
                  color: selectedRoutes.has(index) ? '#fff' : route.color
                }}
              >
                {route.label || route.name}
              </button>
            ))}
          </div>
          
          <div style={styles.controlButtons}>
            <button onClick={handleSelectAllRoutes} style={styles.controlButton}>
              Select All
            </button>
            <button onClick={handleDeselectAllRoutes} style={styles.controlButton}>
              Deselect All
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div style={styles.mapWrapper}>
        <MapContainer
          center={LEBANON_CENTER}
          zoom={LEBANON_ZOOM}
          style={styles.mapContainer}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredRoutes.map((route, routeIndex) => {
            const routePath = calculateRoutePath(route.locations);
            
            return (
              <React.Fragment key={`${route.id}-${routeIndex}`}>
                {/* Route path */}
                {routePath.length > 1 && (
                  <Polyline
                    positions={routePath}
                    color={route.color}
                    weight={4}
                    opacity={0.8}
                  />
                )}

                {/* Bus stop markers */}
                {route.locations.map((location, locIndex) => (
                  <Marker
                    key={`${route.id}-${locIndex}`}
                    position={location.coordinates}
                    icon={createBusStopIcon(route.color)}
                  >
                    <Popup>
                      <div style={{ minWidth: '200px' }}>
                        <h4 style={{ margin: '0 0 8px 0', color: route.color }}>
                          🚌 {route.name}
                        </h4>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>📍 Stop:</strong> {location.name}
                        </p>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>📊 Order:</strong> #{(location.order || 0) + 1}
                        </p>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>🕐 Arrival:</strong> {location.arrivalTimeFrom || 'N/A'} - {location.arrivalTimeTo || 'N/A'}
                        </p>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>🏛️ Governorate:</strong> {location.address?.governorate || 'N/A'}
                        </p>
                        <p style={{ margin: '0 0 4px 0' }}>
                          <strong>👨‍✈️ Driver:</strong> {route.driverName || 'Unassigned'}
                        </p>
                        <p style={{ margin: '0' }}>
                          <strong>👥 Capacity:</strong> {route.currentRiders}/{route.maxCapacity}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </React.Fragment>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div style={styles.legend}>
          <div style={styles.legendTitle}>🗺️ Active Routes</div>
          {filteredRoutes.map((route) => (
            <div key={route.id} style={styles.legendItem}>
              <div style={{ ...styles.legendColor, backgroundColor: route.color }}></div>
              <span>{route.label || route.name}</span>
              <small style={{ color: colors.text.secondary }}>
                ({route.locations.length} stops)
              </small>
            </div>
          ))}
          {filteredRoutes.length === 0 && (
            <div style={{ color: colors.text.secondary, fontSize: `${typography.fontSize - 2}px` }}>
              No routes match the current filters
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          <div style={styles.statsTitle}>📊 Statistics</div>
          <div style={styles.statsItem}>
            Total Routes: {routeData.length}
          </div>
          <div style={styles.statsItem}>
            Active Routes: {filteredRoutes.length}
          </div>
          <div style={styles.statsItem}>
            Total Stops: {filteredRoutes.reduce((sum, route) => sum + route.locations.length, 0)}
          </div>
          <div style={styles.statsItem}>
            Active Days: {Object.values(selectedDays).filter(Boolean).length}/7
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusRouteMap; 