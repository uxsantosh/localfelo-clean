// City and area data

import { supabase } from '../lib/supabaseClient';

/**
 * Get all unique cities from areas table
 * @returns {Promise<Array>} List of all cities
 */
export async function getAllCities() {
  console.log('[Service] getAllCities called');
  
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('city')
      .order('city', { ascending: true });
    
    if (error) {
      console.error('[Service] Error fetching cities:', error);
      throw error;
    }
    
    // Get unique cities
    const uniqueCities = [...new Set(data.map(item => item.city))];
    
    return uniqueCities.map((city, index) => ({
      id: (index + 1).toString(),
      name: city,
    }));
  } catch (error) {
    console.error('[Service] getAllCities error:', error);
    // Fallback cities
    return [
      { id: '1', name: 'Mumbai' },
      { id: '2', name: 'Delhi' },
      { id: '3', name: 'Bangalore' },
      { id: '4', name: 'Hyderabad' },
      { id: '5', name: 'Pune' },
    ];
  }
}

/**
 * Get areas by city name
 * @param {string} cityName - City name
 * @returns {Promise<Array>} List of areas in the city
 */
export async function getAreasByCity(cityName) {
  console.log('[Service] getAreasByCity called with city:', cityName);
  
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('city', cityName)
      .order('area_name', { ascending: true });
    
    if (error) {
      console.error('[Service] Error fetching areas:', error);
      throw error;
    }
    
    return data.map(area => ({
      id: area.id.toString(),
      cityName: area.city,
      name: area.area_name,
    }));
  } catch (error) {
    console.error('[Service] getAreasByCity error:', error);
    return [];
  }
}

/**
 * Get city by name
 * @param {string} cityName - City name
 * @returns {Promise<Object|null>} City object or null
 */
export async function getCityByName(cityName) {
  console.log('[Service] getCityByName called with name:', cityName);
  
  const cities = await getAllCities();
  return cities.find((city) => city.name === cityName) || null;
}

/**
 * Get area by ID
 * @param {string} areaId - Area ID
 * @returns {Promise<Object|null>} Area object or null
 */
export async function getAreaById(areaId) {
  console.log('[Service] getAreaById called with id:', areaId);
  
  try {
    const { data, error } = await supabase
      .from('areas')
      .select('*')
      .eq('id', parseInt(areaId))
      .single();
    
    if (error) {
      console.error('[Service] Error fetching area:', error);
      return null;
    }
    
    return {
      id: data.id.toString(),
      cityName: data.city,
      name: data.area_name,
    };
  } catch (error) {
    console.error('[Service] getAreaById error:', error);
    return null;
  }
}