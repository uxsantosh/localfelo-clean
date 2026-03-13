// =====================================================
// Area Coordinates - Fallback Data
// =====================================================
// This file contains representative coordinates for all areas
// Used as fallback if database doesn't have coordinates yet
// =====================================================

export const AREA_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  // =====================================================
  // BANGALORE AREAS
  // =====================================================
  'bangalore-btm-1st-stage': { latitude: 12.9116, longitude: 77.6103 },
  'bangalore-btm-2nd-stage': { latitude: 12.9165, longitude: 77.6101 },
  'bangalore-btm-layout': { latitude: 12.9141, longitude: 77.6097 },
  'bangalore-koramangala-1st-block': { latitude: 12.9352, longitude: 77.6245 },
  'bangalore-koramangala-2nd-block': { latitude: 12.9279, longitude: 77.6271 },
  'bangalore-koramangala-3rd-block': { latitude: 12.9279, longitude: 77.6271 },
  'bangalore-koramangala-4th-block': { latitude: 12.9352, longitude: 77.6245 },
  'bangalore-koramangala-5th-block': { latitude: 12.9352, longitude: 77.6245 },
  'bangalore-koramangala-6th-block': { latitude: 12.9279, longitude: 77.6271 },
  'bangalore-koramangala-7th-block': { latitude: 12.9279, longitude: 77.6271 },
  'bangalore-koramangala-8th-block': { latitude: 12.9352, longitude: 77.6245 },
  'bangalore-hsr-sector-1': { latitude: 12.9116, longitude: 77.6388 },
  'bangalore-hsr-sector-2': { latitude: 12.9080, longitude: 77.6470 },
  'bangalore-hsr-sector-3': { latitude: 12.9140, longitude: 77.6470 },
  'bangalore-hsr-sector-4': { latitude: 12.9200, longitude: 77.6470 },
  'bangalore-hsr-sector-5': { latitude: 12.9160, longitude: 77.6530 },
  'bangalore-hsr-sector-6': { latitude: 12.9100, longitude: 77.6530 },
  'bangalore-hsr-sector-7': { latitude: 12.9060, longitude: 77.6590 },
  'bangalore-whitefield': { latitude: 12.9698, longitude: 77.7499 },
  'bangalore-marathahalli': { latitude: 12.9591, longitude: 77.7011 },
  'bangalore-electronic-city': { latitude: 12.8456, longitude: 77.6603 },
  'bangalore-indiranagar': { latitude: 12.9784, longitude: 77.6408 },
  'bangalore-jayanagar': { latitude: 12.9250, longitude: 77.5900 },
  'bangalore-banashankari': { latitude: 12.9250, longitude: 77.5500 },
  'bangalore-jp-nagar': { latitude: 12.9070, longitude: 77.5850 },
  'bangalore-malleshwaram': { latitude: 13.0067, longitude: 77.5703 },
  'bangalore-rajajinagar': { latitude: 12.9916, longitude: 77.5525 },
  'bangalore-yeshwanthpur': { latitude: 13.0280, longitude: 77.5520 },
  'bangalore-hebbal': { latitude: 13.0358, longitude: 77.5970 },
  'bangalore-bellandur': { latitude: 12.9266, longitude: 77.6766 },
  'bangalore-sarjapur-road': { latitude: 12.9010, longitude: 77.6900 },

  // =====================================================
  // MUMBAI AREAS
  // =====================================================
  'mumbai-andheri-west': { latitude: 19.1136, longitude: 72.8697 },
  'mumbai-andheri-east': { latitude: 19.1136, longitude: 72.8697 },
  'mumbai-bandra-west': { latitude: 19.0596, longitude: 72.8295 },
  'mumbai-bandra-east': { latitude: 19.0596, longitude: 72.8420 },
  'mumbai-powai': { latitude: 19.1176, longitude: 72.9060 },
  'mumbai-goregaon': { latitude: 19.1653, longitude: 72.8490 },
  'mumbai-malad': { latitude: 19.1870, longitude: 72.8480 },
  'mumbai-borivali': { latitude: 19.2307, longitude: 72.8567 },
  'mumbai-dadar': { latitude: 19.0178, longitude: 72.8478 },
  'mumbai-kurla': { latitude: 19.0728, longitude: 72.8826 },
  'mumbai-ghatkopar': { latitude: 19.0860, longitude: 72.9081 },
  'mumbai-mulund': { latitude: 19.1626, longitude: 72.9560 },
  'mumbai-thane': { latitude: 19.2183, longitude: 72.9781 },
  'mumbai-navi-mumbai': { latitude: 19.0759, longitude: 72.9988 },
  'mumbai-vashi': { latitude: 19.0759, longitude: 72.9988 },
  'mumbai-worli': { latitude: 19.0176, longitude: 72.8170 },
  'mumbai-lower-parel': { latitude: 19.0004, longitude: 72.8310 },

  // =====================================================
  // DELHI NCR AREAS
  // =====================================================
  'delhi-connaught-place': { latitude: 28.6315, longitude: 77.2167 },
  'delhi-dwarka': { latitude: 28.5921, longitude: 77.0460 },
  'delhi-rohini': { latitude: 28.7468, longitude: 77.0688 },
  'delhi-janakpuri': { latitude: 28.6219, longitude: 77.0854 },
  'delhi-lajpat-nagar': { latitude: 28.5678, longitude: 77.2432 },
  'delhi-saket': { latitude: 28.5244, longitude: 77.2066 },
  'delhi-hauz-khas': { latitude: 28.5494, longitude: 77.2001 },
  'delhi-greater-kailash': { latitude: 28.5494, longitude: 77.2428 },
  'delhi-noida': { latitude: 28.5678, longitude: 77.3244 },
  'delhi-gurgaon': { latitude: 28.4595, longitude: 77.0266 },
  'delhi-faridabad': { latitude: 28.4089, longitude: 77.3178 },
  'delhi-mayur-vihar': { latitude: 28.6085, longitude: 77.2958 },
  'delhi-laxmi-nagar': { latitude: 28.6345, longitude: 77.2769 },

  // =====================================================
  // CHENNAI AREAS
  // =====================================================
  'chennai-t-nagar': { latitude: 13.0418, longitude: 80.2341 },
  'chennai-anna-nagar': { latitude: 13.0850, longitude: 80.2101 },
  'chennai-adyar': { latitude: 13.0067, longitude: 80.2570 },
  'chennai-velachery': { latitude: 12.9750, longitude: 80.2210 },
  'chennai-tambaram': { latitude: 12.9250, longitude: 80.1270 },
  'chennai-porur': { latitude: 13.0358, longitude: 80.1570 },
  'chennai-omr': { latitude: 12.9400, longitude: 80.2350 },
  'chennai-ecr': { latitude: 12.9100, longitude: 80.2500 },
  'chennai-guindy': { latitude: 13.0103, longitude: 80.2206 },
  'chennai-mylapore': { latitude: 13.0339, longitude: 80.2619 },

  // =====================================================
  // PUNE AREAS
  // =====================================================
  'pune-hinjewadi': { latitude: 18.5989, longitude: 73.7389 },
  'pune-wakad': { latitude: 18.5989, longitude: 73.7589 },
  'pune-baner': { latitude: 18.5589, longitude: 73.7889 },
  'pune-aundh': { latitude: 18.5589, longitude: 73.8089 },
  'pune-kharadi': { latitude: 18.5479, longitude: 73.9343 },
  'pune-viman-nagar': { latitude: 18.5679, longitude: 73.9143 },
  'pune-hadapsar': { latitude: 18.5089, longitude: 73.9260 },
  'pune-magarpatta': { latitude: 18.5189, longitude: 73.9310 },
  'pune-kothrud': { latitude: 18.5074, longitude: 73.8077 },
  'pune-shivajinagar': { latitude: 18.5304, longitude: 73.8567 },

  // =====================================================
  // HYDERABAD AREAS
  // =====================================================
  'hyderabad-hitech-city': { latitude: 17.4483, longitude: 78.3808 },
  'hyderabad-gachibowli': { latitude: 17.4399, longitude: 78.3483 },
  'hyderabad-madhapur': { latitude: 17.4483, longitude: 78.3915 },
  'hyderabad-kondapur': { latitude: 17.4683, longitude: 78.3615 },
  'hyderabad-kukatpally': { latitude: 17.4850, longitude: 78.4015 },
  'hyderabad-miyapur': { latitude: 17.4950, longitude: 78.3583 },
  'hyderabad-banjara-hills': { latitude: 17.4239, longitude: 78.4482 },
  'hyderabad-jubilee-hills': { latitude: 17.4239, longitude: 78.4090 },
  'hyderabad-secunderabad': { latitude: 17.4399, longitude: 78.4983 },
  'hyderabad-ameerpet': { latitude: 17.4378, longitude: 78.4482 },

  // =====================================================
  // KOLKATA AREAS
  // =====================================================
  'kolkata-salt-lake': { latitude: 22.5726, longitude: 88.4139 },
  'kolkata-new-town': { latitude: 22.6026, longitude: 88.4639 },
  'kolkata-park-street': { latitude: 22.5543, longitude: 88.3516 },
  'kolkata-ballygunge': { latitude: 22.5326, longitude: 88.3639 },
  'kolkata-jadavpur': { latitude: 22.4976, longitude: 88.3639 },
  'kolkata-howrah': { latitude: 22.5726, longitude: 88.3239 },
  'kolkata-dum-dum': { latitude: 22.6426, longitude: 88.4139 },
  'kolkata-behala': { latitude: 22.4976, longitude: 88.3139 },
};

// Function to get coordinates for an area
export function getAreaCoordinates(areaId: string): { latitude: number; longitude: number } | null {
  return AREA_COORDINATES[areaId] || null;
}

// Function to check if area has coordinates
export function hasAreaCoordinates(areaId: string): boolean {
  return areaId in AREA_COORDINATES;
}
