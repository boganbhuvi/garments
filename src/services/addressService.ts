/**
 * Giriraj Garments ERP — Indian Address Autocomplete & Location Service
 * Supports offline Tamil Nadu & Pan-India locations + online Nominatim fallback
 */

export interface AddressSuggestion {
  doorNo?: string;
  street?: string;
  areaLocation: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  displayName: string;
}

// Built-in offline Indian address database (Focus on Tamil Nadu & surrounding hubs)
const LOCAL_INDIAN_LOCATIONS: AddressSuggestion[] = [
  // Vellore / Ranipet District Hubs
  {
    areaLocation: 'Melvisharam',
    city: 'Melvisharam',
    district: 'Ranipet',
    state: 'Tamil Nadu',
    pinCode: '632509',
    displayName: 'Melvisharam, Ranipet District, Tamil Nadu - 632509'
  },
  {
    areaLocation: 'CMC Hospital Area, Sathuvachari',
    city: 'Vellore',
    district: 'Vellore',
    state: 'Tamil Nadu',
    pinCode: '632009',
    displayName: 'Sathuvachari, Vellore, Tamil Nadu - 632009'
  },
  {
    areaLocation: 'Katpadi Junction',
    city: 'Vellore',
    district: 'Vellore',
    state: 'Tamil Nadu',
    pinCode: '632007',
    displayName: 'Katpadi, Vellore, Tamil Nadu - 632007'
  },
  {
    areaLocation: 'Bagayam, Near Christian Medical College',
    city: 'Vellore',
    district: 'Vellore',
    state: 'Tamil Nadu',
    pinCode: '632002',
    displayName: 'Bagayam, Vellore, Tamil Nadu - 632002'
  },
  {
    areaLocation: 'Arcot Town, Near Bus Stand',
    city: 'Arcot',
    district: 'Ranipet',
    state: 'Tamil Nadu',
    pinCode: '632503',
    displayName: 'Arcot, Ranipet District, Tamil Nadu - 632503'
  },
  {
    areaLocation: 'Walajah Road',
    city: 'Walajapet',
    district: 'Ranipet',
    state: 'Tamil Nadu',
    pinCode: '632513',
    displayName: 'Walajapet, Ranipet District, Tamil Nadu - 632513'
  },
  {
    areaLocation: 'Gudiyattam Market',
    city: 'Gudiyattam',
    district: 'Vellore',
    state: 'Tamil Nadu',
    pinCode: '632602',
    displayName: 'Gudiyattam, Vellore District, Tamil Nadu - 632602'
  },
  {
    areaLocation: 'Ambur Town',
    city: 'Ambur',
    district: 'Tirupattur',
    state: 'Tamil Nadu',
    pinCode: '635802',
    displayName: 'Ambur, Tirupattur District, Tamil Nadu - 635802'
  },
  {
    areaLocation: 'Vaniyambadi Town',
    city: 'Vaniyambadi',
    district: 'Tirupattur',
    state: 'Tamil Nadu',
    pinCode: '635751',
    displayName: 'Vaniyambadi, Tirupattur District, Tamil Nadu - 635751'
  },
  {
    areaLocation: 'Ranipet Industrial Estate',
    city: 'Ranipet',
    district: 'Ranipet',
    state: 'Tamil Nadu',
    pinCode: '632401',
    displayName: 'Ranipet, Tamil Nadu - 632401'
  },

  // Chennai Localities
  {
    areaLocation: 'Mylapore, Near Kapaleeshwarar Temple',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600004',
    displayName: 'Mylapore, Chennai, Tamil Nadu - 600004'
  },
  {
    areaLocation: 'T. Nagar, Usman Road & Panagal Park',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600017',
    displayName: 'T. Nagar, Chennai, Tamil Nadu - 600017'
  },
  {
    areaLocation: 'Anna Nagar West / Shanthi Colony',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600040',
    displayName: 'Anna Nagar, Chennai, Tamil Nadu - 600040'
  },
  {
    areaLocation: 'Adyar, Gandhi Nagar',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600020',
    displayName: 'Adyar, Chennai, Tamil Nadu - 600020'
  },
  {
    areaLocation: 'Velachery Main Road',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600042',
    displayName: 'Velachery, Chennai, Tamil Nadu - 600042'
  },
  {
    areaLocation: 'Tambaram Sanatorium',
    city: 'Chennai',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    pinCode: '600047',
    displayName: 'Tambaram, Chennai, Tamil Nadu - 600047'
  },
  {
    areaLocation: 'Chromepet, GST Road',
    city: 'Chennai',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    pinCode: '600044',
    displayName: 'Chromepet, Chennai, Tamil Nadu - 600044'
  },
  {
    areaLocation: 'Porur Junction',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600116',
    displayName: 'Porur, Chennai, Tamil Nadu - 600116'
  },
  {
    areaLocation: 'Triplicane, High Road',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    pinCode: '600005',
    displayName: 'Triplicane, Chennai, Tamil Nadu - 600005'
  },

  // Major Tamil Nadu Hubs
  {
    areaLocation: 'RS Puram, DB Road',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pinCode: '641002',
    displayName: 'RS Puram, Coimbatore, Tamil Nadu - 641002'
  },
  {
    areaLocation: 'Gandhipuram, Cross Cut Road',
    city: 'Coimbatore',
    district: 'Coimbatore',
    state: 'Tamil Nadu',
    pinCode: '641012',
    displayName: 'Gandhipuram, Coimbatore, Tamil Nadu - 641012'
  },
  {
    areaLocation: 'Simmakkal / Meenakshi Amman Temple Area',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    pinCode: '625001',
    displayName: 'Madurai Main, Tamil Nadu - 625001'
  },
  {
    areaLocation: 'KK Nagar, Madurai',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    pinCode: '625020',
    displayName: 'KK Nagar, Madurai, Tamil Nadu - 625020'
  },
  {
    areaLocation: 'Fairlands, Salem',
    city: 'Salem',
    district: 'Salem',
    state: 'Tamil Nadu',
    pinCode: '636016',
    displayName: 'Fairlands, Salem, Tamil Nadu - 636016'
  },
  {
    areaLocation: 'Thillai Nagar',
    city: 'Tiruchirappalli',
    district: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    pinCode: '620018',
    displayName: 'Thillai Nagar, Trichy, Tamil Nadu - 620018'
  },
  {
    areaLocation: 'Palayamkottai',
    city: 'Tirunelveli',
    district: 'Tirunelveli',
    state: 'Tamil Nadu',
    pinCode: '627002',
    displayName: 'Palayamkottai, Tirunelveli, Tamil Nadu - 627002'
  },
  {
    areaLocation: 'Perundurai Road',
    city: 'Erode',
    district: 'Erode',
    state: 'Tamil Nadu',
    pinCode: '638011',
    displayName: 'Erode, Tamil Nadu - 638011'
  },
  {
    areaLocation: 'Kumar Nagar, Avinashi Road',
    city: 'Tiruppur',
    district: 'Tiruppur',
    state: 'Tamil Nadu',
    pinCode: '641603',
    displayName: 'Tiruppur, Tamil Nadu - 641603'
  },
  {
    areaLocation: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560038',
    displayName: 'Indiranagar, Bengaluru, Karnataka - 560038'
  },
  {
    areaLocation: 'Jayanagar 4th Block',
    city: 'Bengaluru',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    pinCode: '560011',
    displayName: 'Jayanagar, Bengaluru, Karnataka - 560011'
  }
];

/**
 * Search Indian address locations with debounce & online fallback
 */
export async function searchIndianAddress(query: string): Promise<AddressSuggestion[]> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ || cleanQ.length < 2) {
    return [];
  }

  // 1. Search local offline database first (instant response)
  const localMatches = LOCAL_INDIAN_LOCATIONS.filter(item => {
    return (
      item.areaLocation.toLowerCase().includes(cleanQ) ||
      item.city.toLowerCase().includes(cleanQ) ||
      item.district.toLowerCase().includes(cleanQ) ||
      item.pinCode.includes(cleanQ) ||
      item.displayName.toLowerCase().includes(cleanQ)
    );
  });

  // If we have 3+ local matches or user typed pin code, return immediately
  if (localMatches.length >= 3) {
    return localMatches.slice(0, 6);
  }

  // 2. Online search fallback using OpenStreetMap Nominatim (debounced & safe)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query + ', Tamil Nadu, India'
    )}&format=json&addressdetails=1&limit=4&countrycodes=in`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GirirajGarmentsERP/1.0'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const onlineMatches: AddressSuggestion[] = data.map((item: any) => {
          const addr = item.address || {};
          const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || 'Vellore';
          const district = addr.state_district || addr.county || city;
          const state = addr.state || 'Tamil Nadu';
          const pinCode = addr.postcode || '';
          const area = addr.suburb || addr.neighbourhood || addr.road || item.name || '';

          return {
            doorNo: addr.house_number || '',
            street: addr.road || '',
            areaLocation: area || city,
            city,
            district,
            state,
            pinCode,
            displayName: item.display_name
          };
        });

        // Merge local and online matches without duplicates
        const combined = [...localMatches];
        onlineMatches.forEach(om => {
          if (!combined.some(c => c.pinCode === om.pinCode && c.city.toLowerCase() === om.city.toLowerCase())) {
            combined.push(om);
          }
        });
        return combined.slice(0, 6);
      }
    }
  } catch {
    // Network offline or aborted — return local matches
  }

  return localMatches.slice(0, 6);
}
