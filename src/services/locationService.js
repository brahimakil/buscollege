// Location service for OpenStreetMap Nominatim API integration
// Enhanced with comprehensive Tyre District locations from JSON

// Import locations from JSON file
import locationsData from '../locations.json';

// Extract Tyre District locations from JSON
const TYRE_DISTRICT_LOCATIONS = locationsData.tyre_district.locations;

// Combine all locations (JSON + any future additions)
const ALL_LOCAL_LOCATIONS = [
  ...TYRE_DISTRICT_LOCATIONS
];

// Search function that uses both JSON data and API
export const searchLocationsInLebanon = async (query, limit = 15) => {
  console.log('🔍 Searching for:', query);
  
  if (!query || query.trim().length < 1) {
    return { locations: [] };
  }

  const searchTerm = query.trim().toLowerCase();
  
  // First search through our comprehensive JSON data
  const jsonResults = ALL_LOCAL_LOCATIONS.filter(location => {
    const nameMatch = location.shortName.toLowerCase().includes(searchTerm);
    const fullNameMatch = location.name.toLowerCase().includes(searchTerm);
    const arabicNameMatch = location.arabic_name && location.arabic_name.includes(searchTerm);
    const cityMatch = location.address.city.toLowerCase().includes(searchTerm);
    const governorateMatch = location.address.governorate.toLowerCase().includes(searchTerm);
    
    return nameMatch || fullNameMatch || arabicNameMatch || cityMatch || governorateMatch;
  });

  console.log('✅ Found JSON results:', jsonResults.length);

  // Try to fetch from real API in background for additional results
  let apiResults = [];
  try {
    const apiResponse = await tryRealAPISearch(query);
    if (apiResponse && apiResponse.length > 0) {
      // Convert API results to our format and filter out duplicates
      const convertedApiResults = apiResponse.map(result => ({
        id: `api-${result.place_id || Math.random()}`,
        name: result.display_name,
        shortName: result.name || result.display_name.split(',')[0],
        latitude: parseFloat(result.lat),
        longitude: parseFloat(result.lon),
        type: result.type || 'place',
        category: result.class || 'place',
        address: {
          city: result.name || result.display_name.split(',')[0],
          governorate: 'Lebanon', // API results are from Lebanon
          country: 'Lebanon'
        }
      }));

      // Filter out API results that are already in our JSON data
      const existingNames = new Set(jsonResults.map(loc => loc.shortName.toLowerCase()));
      apiResults = convertedApiResults.filter(result => 
        !existingNames.has(result.shortName.toLowerCase())
      );
      
      console.log('📡 Additional API results:', apiResults.length);
    }
  } catch (error) {
    console.log('📡 API search failed, using JSON data only');
  }
  
  // Combine results, prioritizing JSON data
  const combinedResults = [...jsonResults, ...apiResults];
  
  return { 
    locations: combinedResults.slice(0, limit),
    isReliable: true
  };
};

// Real API search function
const tryRealAPISearch = async (query) => {
  try {
    // Use a simpler CORS proxy
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=lb&limit=5`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Alternative spelling search
export const searchWithAlternativeSpellings = async (query, limit = 10) => {
  const alternatives = generateAlternativeSpellings(query);
  console.log('🔄 Trying alternatives:', alternatives);
  
  let allResults = [];
  const usedIds = new Set();

  for (const alternative of alternatives) {
    const result = await searchLocationsInLebanon(alternative, 5);
    
    if (result.locations) {
      result.locations.forEach(location => {
        if (!usedIds.has(location.id)) {
          allResults.push(location);
          usedIds.add(location.id);
        }
      });
    }

    if (allResults.length >= limit) break;
  }

  return { locations: allResults.slice(0, limit) };
};

// Generate alternative spellings
const generateAlternativeSpellings = (query) => {
  const alternatives = [query.trim()];
  const lowerQuery = query.toLowerCase().trim();

  const variations = {
    'tair harfa': ['tayr harfa', 'tyre harfa', 'tair harfeh'],
    'tayr harfa': ['tair harfa', 'tyre harfa', 'tayr harfeh'],
    'jbein': ['jibbain', 'al-jibbain', 'jibein'],
    'majdalzoun': ['majdal zoun', 'majdal zoon', 'majdalzoon'],
    'shhabeye': ['shihabiyeh', 'chehabiyeh', 'ash-shihabiyah'],
    'tyre': ['tyr', 'sour', 'sur'],
    'sidon': ['saida'],
    'tripoli': ['tarabulus'],
    'beirut': ['bayrut'],
    'jounieh': ['juniyah'],
    'baalbek': ['baalbeck'],
    'zahle': ['zahleh'],
    'nabatieh': ['nabatiyeh'],
    'byblos': ['jbail']
  };

  Object.keys(variations).forEach(key => {
    if (lowerQuery.includes(key)) {
      alternatives.push(...variations[key]);
    }
  });

  // Also try reverse lookup
  Object.values(variations).flat().forEach(variant => {
    if (lowerQuery.includes(variant)) {
      const mainKey = Object.keys(variations).find(key => 
        variations[key].includes(variant)
      );
      if (mainKey) alternatives.push(mainKey);
    }
  });

  return [...new Set(alternatives)];
};

// Simple coordinate validation
export const isLocationInLebanon = (latitude, longitude) => {
  const LEBANON_BOUNDS = {
    north: 34.7,
    south: 33.0,
    east: 36.7,
    west: 35.0
  };

  return (
    latitude >= LEBANON_BOUNDS.south &&
    latitude <= LEBANON_BOUNDS.north &&
    longitude >= LEBANON_BOUNDS.west &&
    longitude <= LEBANON_BOUNDS.east
  );
};

// Get location details
export const getLocationDetails = async (placeId) => {
  // First check in our JSON data
  const location = ALL_LOCAL_LOCATIONS.find(loc => loc.id === placeId);
  
  if (location) {
    return { location };
  }
  
  return { 
    error: 'Location not found',
    location: null
  };
};

// Reverse geocoding
export const getLocationFromCoordinates = async (latitude, longitude) => {
  // Find closest location in our database
  let closestLocation = null;
  let minDistance = Infinity;

  ALL_LOCAL_LOCATIONS.forEach(location => {
    const distance = Math.sqrt(
      Math.pow(location.latitude - latitude, 2) + 
      Math.pow(location.longitude - longitude, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestLocation = location;
    }
  });

  if (closestLocation && minDistance < 0.1) { // Within reasonable range
    return { location: closestLocation };
  }

  return { 
    error: 'No nearby location found',
    location: null
  };
};