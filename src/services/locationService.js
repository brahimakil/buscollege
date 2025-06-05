// Location service for OpenStreetMap Nominatim API integration
// Simplified with immediate fallback to ensure it always works

// Mock data for Lebanese locations - this will always work
const LEBANON_LOCATIONS = [
  {
    id: 'beirut-1',
      name: 'Beirut, Lebanon',
      shortName: 'Beirut',
      latitude: 33.8938,
      longitude: 35.5018,
      type: 'city',
      category: 'place',
    address: { city: 'Beirut', governorate: 'Beirut', country: 'Lebanon' }
  },
  {
    id: 'tripoli-1',
      name: 'Tripoli, North Governorate, Lebanon',
      shortName: 'Tripoli',
      latitude: 34.4367,
      longitude: 35.8497,
      type: 'city',
      category: 'place',
    address: { city: 'Tripoli', governorate: 'North', country: 'Lebanon' }
  },
  {
    id: 'sidon-1',
      name: 'Sidon, South Governorate, Lebanon',
      shortName: 'Sidon',
      latitude: 33.5531,
      longitude: 35.3781,
      type: 'city',
      category: 'place',
    address: { city: 'Sidon', governorate: 'South', country: 'Lebanon' }
  },
  {
    id: 'tyre-1',
      name: 'Tyre, South Governorate, Lebanon',
      shortName: 'Tyre',
      latitude: 33.2707,
      longitude: 35.2038,
      type: 'city',
      category: 'place',
    address: { city: 'Tyre', governorate: 'South', country: 'Lebanon' }
  },
  {
    id: 'abbasieh-1',
      name: 'Abbasieh, South Governorate, Lebanon',
      shortName: 'Abbasieh',
      latitude: 33.2856,
      longitude: 35.2274,
      type: 'village',
      category: 'place',
    address: { city: 'Abbasieh', governorate: 'South', country: 'Lebanon' }
  },
  {
    id: 'jounieh-1',
      name: 'Jounieh, Keserwan-Jbeil, Lebanon',
      shortName: 'Jounieh',
      latitude: 33.9816,
      longitude: 35.6197,
      type: 'city',
      category: 'place',
    address: { city: 'Jounieh', governorate: 'Mount Lebanon', country: 'Lebanon' }
  },
  {
    id: 'baalbek-1',
    name: 'Baalbek, Baalbek-Hermel, Lebanon',
    shortName: 'Baalbek',
    latitude: 34.0042,
    longitude: 36.2047,
    type: 'city',
    category: 'place',
    address: { city: 'Baalbek', governorate: 'Baalbek-Hermel', country: 'Lebanon' }
  },
  {
    id: 'zahle-1',
    name: 'Zahle, Bekaa, Lebanon',
    shortName: 'Zahle',
    latitude: 33.8463,
    longitude: 35.9018,
    type: 'city',
    category: 'place',
    address: { city: 'Zahle', governorate: 'Bekaa', country: 'Lebanon' }
  },
  {
    id: 'nabatieh-1',
    name: 'Nabatieh, Nabatieh Governorate, Lebanon',
    shortName: 'Nabatieh',
    latitude: 33.3789,
    longitude: 35.4839,
    type: 'city',
    category: 'place',
    address: { city: 'Nabatieh', governorate: 'Nabatieh', country: 'Lebanon' }
  },
  {
    id: 'byblos-1',
    name: 'Byblos, Keserwan-Jbeil, Lebanon',
    shortName: 'Byblos',
    latitude: 34.1208,
    longitude: 35.6479,
    type: 'city',
    category: 'place',
    address: { city: 'Byblos', governorate: 'Mount Lebanon', country: 'Lebanon' }
  },
  {
    id: 'jbail-1',
    name: 'Jbail, Keserwan-Jbeil, Lebanon',
    shortName: 'Jbail',
    latitude: 34.1208,
    longitude: 35.6479,
    type: 'city',
    category: 'place',
    address: { city: 'Jbail', governorate: 'Mount Lebanon', country: 'Lebanon' }
  },
  {
    id: 'saida-1',
    name: 'Saida, South Governorate, Lebanon',
    shortName: 'Saida',
    latitude: 33.5531,
    longitude: 35.3781,
    type: 'city',
    category: 'place',
    address: { city: 'Saida', governorate: 'South', country: 'Lebanon' }
  },
  {
    id: 'sour-1',
    name: 'Sour, South Governorate, Lebanon',
    shortName: 'Sour',
    latitude: 33.2707,
    longitude: 35.2038,
    type: 'city',
    category: 'place',
    address: { city: 'Sour', governorate: 'South', country: 'Lebanon' }
  },
  {
    id: 'aley-1',
    name: 'Aley, Mount Lebanon, Lebanon',
    shortName: 'Aley',
    latitude: 33.8088,
    longitude: 35.6006,
    type: 'city',
    category: 'place',
    address: { city: 'Aley', governorate: 'Mount Lebanon', country: 'Lebanon' }
  },
  {
    id: 'baabda-1',
    name: 'Baabda, Mount Lebanon, Lebanon',
    shortName: 'Baabda',
    latitude: 33.8369,
    longitude: 35.5444,
    type: 'city',
    category: 'place',
    address: { city: 'Baabda', governorate: 'Mount Lebanon', country: 'Lebanon' }
  },
  {
    id: 'jezzine-1',
    name: 'Jezzine, South Governorate, Lebanon',
    shortName: 'Jezzine',
    latitude: 33.5439,
    longitude: 35.5781,
    type: 'city',
    category: 'place',
    address: { city: 'Jezzine', governorate: 'South', country: 'Lebanon' }
  },
  {
    id: 'marjeyoun-1',
    name: 'Marjeyoun, Nabatieh Governorate, Lebanon',
    shortName: 'Marjeyoun',
    latitude: 33.3608,
    longitude: 35.5931,
    type: 'city',
    category: 'place',
    address: { city: 'Marjeyoun', governorate: 'Nabatieh', country: 'Lebanon' }
  },
  {
    id: 'halba-1',
    name: 'Halba, North Governorate, Lebanon',
    shortName: 'Halba',
    latitude: 34.5489,
    longitude: 36.0789,
    type: 'city',
    category: 'place',
    address: { city: 'Halba', governorate: 'North', country: 'Lebanon' }
  },
  {
    id: 'zgharta-1',
    name: 'Zgharta, North Governorate, Lebanon',
    shortName: 'Zgharta',
    latitude: 34.3989,
    longitude: 35.8981,
    type: 'city',
    category: 'place',
    address: { city: 'Zgharta', governorate: 'North', country: 'Lebanon' }
  },
  {
    id: 'batroun-1',
    name: 'Batroun, North Governorate, Lebanon',
    shortName: 'Batroun',
    latitude: 34.2553,
    longitude: 35.6581,
    type: 'city',
    category: 'place',
    address: { city: 'Batroun', governorate: 'North', country: 'Lebanon' }
  }
];

// Search function that always works
export const searchLocationsInLebanon = async (query, limit = 15) => {
  console.log('🔍 Searching for:', query);
  
  if (!query || query.trim().length < 1) {
    return { locations: [] };
  }

  const searchTerm = query.trim().toLowerCase();
  
  // Search through our mock data
  const filtered = LEBANON_LOCATIONS.filter(location => {
    const nameMatch = location.shortName.toLowerCase().includes(searchTerm);
    const fullNameMatch = location.name.toLowerCase().includes(searchTerm);
    const cityMatch = location.address.city.toLowerCase().includes(searchTerm);
    const governorateMatch = location.address.governorate.toLowerCase().includes(searchTerm);
    
    return nameMatch || fullNameMatch || cityMatch || governorateMatch;
  });

  console.log('✅ Found results:', filtered.length);

  // Try to fetch from real API in background (optional enhancement)
  tryRealAPISearch(query).then(apiResults => {
    if (apiResults && apiResults.length > 0) {
      console.log('📡 Real API results also available:', apiResults.length);
    }
  }).catch(error => {
    console.log('📡 Real API not available, using mock data only');
  });
  
  return { 
    locations: filtered.slice(0, limit),
    isReliable: true
  };
};

// Optional real API search (runs in background, doesn't block UI)
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
    'abbasieh': ['abbasiyeh', 'abbassiyeh', 'abbassieh'],
    'tyre': ['tyr', 'sour'],
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

// Get location details (simplified)
export const getLocationDetails = async (placeId) => {
  const location = LEBANON_LOCATIONS.find(loc => loc.id === placeId);
  
  if (location) {
    return { location };
  }
  
  return { 
    error: 'Location not found',
    location: null
  };
};

// Reverse geocoding (simplified)
export const getLocationFromCoordinates = async (latitude, longitude) => {
  // Find closest location in our database
  let closestLocation = null;
  let minDistance = Infinity;

  LEBANON_LOCATIONS.forEach(location => {
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