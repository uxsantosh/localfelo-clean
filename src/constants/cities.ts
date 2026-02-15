// OldCycle Cities and Areas (Matching Database)

import { City } from '../types';

export const CITIES: City[] = [
  {
    id: 'mumbai',
    name: 'Mumbai',
    areas: [
      { id: '1', city_id: 'mumbai', name: 'Andheri', slug: 'mumbai-andheri' },
      { id: '2', city_id: 'mumbai', name: 'Bandra', slug: 'mumbai-bandra' },
      { id: '3', city_id: 'mumbai', name: 'Thane', slug: 'mumbai-thane' },
      { id: '4', city_id: 'mumbai', name: 'Powai', slug: 'mumbai-powai' },
    ],
  },
  {
    id: 'bangalore',
    name: 'Bangalore',
    areas: [
      { id: '5', city_id: 'bangalore', name: 'Koramangala', slug: 'bangalore-koramangala' },
      { id: '6', city_id: 'bangalore', name: 'Whitefield', slug: 'bangalore-whitefield' },
      { id: '7', city_id: 'bangalore', name: 'Indiranagar', slug: 'bangalore-indiranagar' },
      { id: '8', city_id: 'bangalore', name: 'HSR Layout', slug: 'bangalore-hsr-layout' },
    ],
  },
  {
    id: 'delhi',
    name: 'Delhi',
    areas: [
      { id: '9', city_id: 'delhi', name: 'Connaught Place', slug: 'delhi-connaught-place' },
      { id: '10', city_id: 'delhi', name: 'Saket', slug: 'delhi-saket' },
      { id: '11', city_id: 'delhi', name: 'Dwarka', slug: 'delhi-dwarka' },
      { id: '12', city_id: 'delhi', name: 'Rohini', slug: 'delhi-rohini' },
    ],
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    areas: [
      { id: '13', city_id: 'hyderabad', name: 'Hitech City', slug: 'hyderabad-hitech-city' },
      { id: '14', city_id: 'hyderabad', name: 'Gachibowli', slug: 'hyderabad-gachibowli' },
      { id: '15', city_id: 'hyderabad', name: 'Banjara Hills', slug: 'hyderabad-banjara-hills' },
      { id: '16', city_id: 'hyderabad', name: 'Madhapur', slug: 'hyderabad-madhapur' },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    areas: [
      { id: '17', city_id: 'pune', name: 'Koregaon Park', slug: 'pune-koregaon-park' },
      { id: '18', city_id: 'pune', name: 'Hinjewadi', slug: 'pune-hinjewadi' },
      { id: '19', city_id: 'pune', name: 'Viman Nagar', slug: 'pune-viman-nagar' },
      { id: '20', city_id: 'pune', name: 'Kothrud', slug: 'pune-kothrud' },
    ],
  },
];
