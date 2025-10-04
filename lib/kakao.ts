/**
 * Kakao Local API geocoding helper
 * Converts address to region info and coordinates
 */

export interface GeocodeResult {
  si?: string;
  gu?: string;
  dong?: string;
  lat?: number;
  lng?: number;
  isServiceable?: boolean;
}

interface KakaoAddressResponse {
  documents: Array<{
    address?: {
      region_1depth_name?: string;
      region_2depth_name?: string;
      region_3depth_name?: string;
    };
    road_address?: {
      region_1depth_name?: string;
      region_2depth_name?: string;
      region_3depth_name?: string;
    };
    x?: string; // longitude
    y?: string; // latitude
  }>;
  meta: {
    total_count: number;
  };
}

/**
 * Check if an address is in Gwanak-gu service area
 * @param roadAddress - Road address region info
 * @param address - Address region info  
 * @param originalQuery - Original query string for fallback check
 * @returns boolean indicating if serviceable
 */
function isGwanakGuServiceable(
  roadAddress: { region_1depth_name?: string; region_2depth_name?: string } | undefined,
  address: { region_1depth_name?: string; region_2depth_name?: string } | undefined,
  originalQuery: string
): boolean {
  // Check road_address first
  if (roadAddress?.region_2depth_name === "관악구") {
    const si = roadAddress.region_1depth_name;
    if (si === "서울특별시" || si === "서울") {
      return true;
    }
  }
  
  // Check address as fallback
  if (address?.region_2depth_name === "관악구") {
    const si = address.region_1depth_name;
    if (si === "서울특별시" || si === "서울") {
      return true;
    }
  }
  
  // Fallback: check if original query contains "관악구"
  if (originalQuery.includes("관악구")) {
    return true;
  }
  
  return false;
}

/**
 * Geocode an address using Kakao Local API
 * @param addr - The address to geocode
 * @returns Promise with region info, coordinates, and serviceability
 */
export async function geocodeAddress(addr: string): Promise<GeocodeResult> {
  const kakaoClientId = process.env.KAKAO_CLIENT_ID;
  
  if (!kakaoClientId) {
    throw new Error('KAKAO_CLIENT_ID environment variable is required');
  }

  if (!addr || typeof addr !== 'string' || addr.trim().length === 0) {
    throw new Error('Valid address is required');
  }

  const trimmedAddr = addr.trim();
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second timeout

    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(trimmedAddr)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `KakaoAK ${kakaoClientId}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Kakao API error: ${response.status} ${response.statusText}`);
    }

    const data: KakaoAddressResponse = await response.json();

    if (!data.documents || data.documents.length === 0) {
      throw new Error('Address not found');
    }

    // Get the first result
    const firstResult = data.documents[0];
    
    // Check serviceability using both road_address and address
    const isServiceable = isGwanakGuServiceable(
      firstResult.road_address,
      firstResult.address,
      trimmedAddr
    );
    
    // Use road_address first, then fallback to address for region info
    const addressInfo = firstResult.road_address || firstResult.address;
    
    if (!addressInfo) {
      throw new Error('No address information available');
    }

    const result: GeocodeResult = {
      si: addressInfo.region_1depth_name,
      gu: addressInfo.region_2depth_name,
      dong: addressInfo.region_3depth_name,
      isServiceable,
    };

    // Add coordinates if available
    if (firstResult.x && firstResult.y) {
      result.lng = parseFloat(firstResult.x);
      result.lat = parseFloat(firstResult.y);
    }

    return result;

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Geocoding request timed out');
      }
      throw error;
    }
    throw new Error('Unknown error occurred during geocoding');
  }
}
