import { supabase, IS_OFFLINE_MODE } from '../lib/supabaseClient';
import { getAreaCoordinates } from '../data/areaCoordinates';

// Mock data fallback for when Supabase is not available
const MOCK_CITIES = [
  {
    id: '1',
    name: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    areas: [
      { id: '1', name: 'Andheri', cityId: '1', latitude: 19.1136, longitude: 72.8697, sub_areas: [] },
      { id: '2', name: 'Bandra', cityId: '1', latitude: 19.0596, longitude: 72.8295, sub_areas: [] },
      { id: '3', name: 'Powai', cityId: '1', latitude: 19.1176, longitude: 72.9060, sub_areas: [] },
    ]
  },
  {
    id: '2',
    name: 'Delhi',
    state: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    areas: [
      { id: '4', name: 'Connaught Place', cityId: '2', latitude: 28.6315, longitude: 77.2167, sub_areas: [] },
      { id: '5', name: 'Dwarka', cityId: '2', latitude: 28.5921, longitude: 77.0460, sub_areas: [] },
      { id: '6', name: 'Rohini', cityId: '2', latitude: 28.7468, longitude: 77.0688, sub_areas: [] },
    ]
  },
  {
    id: '3',
    name: 'Bangalore',
    state: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    areas: [
      { id: '7', name: 'Koramangala', cityId: '3', latitude: 12.9352, longitude: 77.6245, sub_areas: [] },
      { id: '8', name: 'Whitefield', cityId: '3', latitude: 12.9698, longitude: 77.7499, sub_areas: [] },
      { id: '9', name: 'Indiranagar', cityId: '3', latitude: 12.9784, longitude: 77.6408, sub_areas: [] },
    ]
  }
];

/**
 * Fetch all cities with their areas and sub-areas (3-level hierarchy)
 * IMPORTANT: Distance calculations use AREA coordinates (not sub-area)
 * Sub-areas are for precise user location selection only
 */
export async function getCitiesWithAreas() {
  try {
    console.log('🌆 [Locations] Fetching cities with 3-level hierarchy (City → Area → Sub-Area)...');
    
    // Fetch cities with nested areas and sub-areas
    let { data: cities, error } = await supabase
      .from('cities')
      .select(`
        id,
        name,
        areas (
          id,
          name,
          slug,
          city_id,
          latitude,
          longitude,
          sub_areas (
            id,
            name,
            area_id,
            latitude,
            longitude,
            landmark,
            slug
          )
        )
      `)
      .order('name');

    console.log('🌆 [Locations] Raw Supabase response:', { cities, error });
    
    // Handle missing columns gracefully
    if (error && error.code === '42703') {
      console.warn('⚠️ [Locations] Some columns missing, fetching basic data...');
      const fallbackResult = await supabase
        .from('cities')
        .select(`
          id,
          name,
          areas (
            id,
            name,
            city_id
          )
        `)
        .order('name');
      
      if (fallbackResult.error) {
        console.error('❌ [Locations] Fallback fetch failed:', fallbackResult.error);
        console.log('⚠️ Using mock location data');
        return MOCK_CITIES;
      }
      
      // Transform fallback data
      cities = (fallbackResult.data || []).map((city: any) => ({
        id: city.id,
        name: city.name,
        areas: (city.areas || []).map((area: any) => ({
          id: area.id,
          name: area.name,
          city_id: area.city_id,
          latitude: null,
          longitude: null,
          sub_areas: [],
        })),
      }));
      error = null;
    }

    if (error) {
      console.error('❌ [Locations] Error fetching cities:', error);
      console.log('⚠️ Using mock location data');
      return MOCK_CITIES;
    }

    if (!cities) {
      console.log('⚠️ [Locations] No cities data, using mock');
      return MOCK_CITIES;
    }

    // City coordinates fallback (for display only)
    const cityCoordinates: Record<string, { lat: number; lng: number }> = {
      'Mumbai': { lat: 19.0760, lng: 72.8777 },
      'Delhi': { lat: 28.7041, lng: 77.1025 },
      'Bangalore': { lat: 12.9716, lng: 77.5946 },
      'Hyderabad': { lat: 17.3850, lng: 78.4867 },
      'Chennai': { lat: 13.0827, lng: 80.2707 },
      'Pune': { lat: 18.5204, lng: 73.8567 },
      'Kolkata': { lat: 22.5726, lng: 88.3639 },
      'Mysore': { lat: 12.2958, lng: 76.6394 },
      'Visakhapatnam': { lat: 17.6869, lng: 83.2185 },
    };

    // Transform data to match expected structure
    const transformed = cities.map((city: any) => {
      const coords = cityCoordinates[city.name] || { lat: 20.5937, lng: 78.9629 };
      
      const transformedCity = {
        id: city.id,
        name: city.name,
        state: city.name,
        latitude: coords.lat,
        longitude: coords.lng,
        areas: (city.areas || []).map((area: any) => {
          // Get area coordinates (used for DISTANCE CALCULATION)
          let areaLat = area.latitude ? parseFloat(area.latitude) : null;
          let areaLng = area.longitude ? parseFloat(area.longitude) : null;
          
          // Fallback to code coordinates if DB doesn't have them
          if (!areaLat || !areaLng) {
            const fallbackCoords = getAreaCoordinates(area.id);
            if (fallbackCoords) {
              areaLat = fallbackCoords.latitude;
              areaLng = fallbackCoords.longitude;
            } else {
              // Final fallback to city coordinates
              areaLat = coords.lat;
              areaLng = coords.lng;
            }
          }
          
          // Transform sub-areas (for precise user location selection)
          const transformedSubAreas = (area.sub_areas || []).map((subArea: any) => ({
            id: subArea.id,
            area_id: subArea.area_id,
            name: subArea.name,
            slug: subArea.slug,
            // Sub-area coordinates are for display/selection only
            // Distance calculation uses AREA coordinates
            latitude: subArea.latitude ? parseFloat(subArea.latitude) : areaLat,
            longitude: subArea.longitude ? parseFloat(subArea.longitude) : areaLng,
            landmark: subArea.landmark,
          }));
          
          if (transformedSubAreas.length > 0) {
            console.log(`📍 [Locations] "${area.name}" has ${transformedSubAreas.length} sub-areas:`, 
              transformedSubAreas.map((sa: any) => sa.name).join(', '));
          }
          
          return {
            id: area.id,
            name: area.name,
            slug: area.slug,
            cityId: area.city_id,
            // IMPORTANT: These coordinates are used for distance calculation
            latitude: areaLat,
            longitude: areaLng,
            sub_areas: transformedSubAreas,
          };
        }),
      };
      
      const totalSubAreas = transformedCity.areas.reduce((sum: number, a: any) => sum + a.sub_areas.length, 0);
      console.log(`🌆 [Locations] "${city.name}": ${transformedCity.areas.length} areas, ${totalSubAreas} sub-areas`);
      
      return transformedCity;
    });

    console.log(`✅ [Locations] Loaded ${transformed.length} cities with 3-level location hierarchy`);
    return transformed;
  } catch (err: any) {
    console.error('❌ [Locations] Exception:', err);
    console.log('⚠️ Using mock location data');
    return MOCK_CITIES;
  }
}

/**
 * Get sub-areas for a specific area
 */
export async function getSubAreasForArea(areaId: string) {
  try {
    const { data, error } = await supabase
      .from('sub_areas')
      .select('*')
      .eq('area_id', areaId)
      .order('name');

    if (error) {
      console.error('❌ [Locations] Error fetching sub-areas:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ [Locations] Exception fetching sub-areas:', err);
    return [];
  }
}