interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    osm_key?: string;
    osm_value?: string;
    type?: string;
    amenity?: string;
    building?: string;
    [key: string]: unknown;
  };
}

interface PhotonResponse {
  features?: PhotonFeature[];
}

const UNIVERSITY_TAGS = new Set(['university', 'college', 'school', 'campus', 'institute']);
const MIN_LOOKUP_INTERVAL_MS = 60_000;
const NEARBY_SEARCH_RADIUS_METERS = 25_000;
let lastLookupStartedAt = 0;
let lookupInProgress: Promise<string | null> | null = null;

function isUniversity(feature: PhotonFeature): boolean {
  const properties = feature.properties ?? {};
  const tags = [properties.osm_value, properties.amenity, properties.building, properties.type]
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.toLowerCase());
  return tags.some((tag) => UNIVERSITY_TAGS.has(tag));
}

function distanceInMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = radians(lat2 - lat1);
  const deltaLng = radians(lng2 - lng1);
  const arc = Math.sin(deltaLat / 2) ** 2
    + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(deltaLng / 2) ** 2;
  return 6_371_000 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
}

async function requestNearbyUniversity(lat: number, lng: number): Promise<string | null> {
  const searchParams = new URLSearchParams({
    q: 'university',
    lat: String(lat),
    lon: String(lng),
    zoom: '16',
    limit: '10',
  });
  const response = await fetch(`https://photon.komoot.io/api/?${searchParams}`, {
    signal: AbortSignal.timeout(8000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Nearby university search is unavailable.');

  const result = await response.json() as PhotonResponse;
  const nearbyUniversity = result.features
    ?.filter((feature) => isUniversity(feature) && typeof feature.properties?.name === 'string')
    .map((feature) => {
      const [featureLng, featureLat] = feature.geometry?.coordinates ?? [];
      return {
        feature,
        distance: typeof featureLat === 'number' && typeof featureLng === 'number'
          ? distanceInMeters(lat, lng, featureLat, featureLng)
          : Number.POSITIVE_INFINITY,
      };
    })
    .filter(({ distance }) => distance <= NEARBY_SEARCH_RADIUS_METERS)
    .sort((first, second) => first.distance - second.distance)[0]?.feature;

  const name = nearbyUniversity?.properties?.name;
  return typeof name === 'string' ? name.trim() || null : null;
}

async function requestUniversityAtLocation(lat: number, lng: number): Promise<string | null> {
  try {
    const nearbyName = await requestNearbyUniversity(lat, lng);
    if (nearbyName) return nearbyName;
  } catch {
    // Try reverse lookup as a fallback if the nearby search is unavailable.
  }

  const reverseParams = new URLSearchParams({ lat: String(lat), lon: String(lng), limit: '5' });
  const response = await fetch(`https://photon.komoot.io/reverse?${reverseParams}`, {
    signal: AbortSignal.timeout(8000),
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Nearby university lookup is unavailable.');

  const result = await response.json() as PhotonResponse;
  const feature = result.features?.find((entry) => isUniversity(entry));
  const name = feature?.properties?.name;
  return typeof name === 'string' && name.trim() ? name.trim() : null;
}

/**
 * Look up the closest mapped university using only the device's current,
 * consented GPS fix. Requests are client-side and limited to one per minute.
 */
export function reverseGeocodeUniversity(lat: number, lng: number): Promise<string | null> {
  if (lookupInProgress) return lookupInProgress;
  const now = Date.now();
  if (now - lastLookupStartedAt < MIN_LOOKUP_INTERVAL_MS) return Promise.resolve(null);
  lastLookupStartedAt = now;
  lookupInProgress = requestUniversityAtLocation(lat, lng).finally(() => {
    lookupInProgress = null;
  });
  return lookupInProgress;
}
