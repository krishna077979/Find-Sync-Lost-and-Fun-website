import { CampusId } from '../types';

export type CampusAreaCategory =
  | 'academic'
  | 'library'
  | 'canteen'
  | 'laboratories'
  | 'sports'
  | 'parking'
  | 'common'
  | 'other';

export interface CampusLocationArea {
  id: string;
  name: string;
  code: string;
  category: CampusAreaCategory;
  categoryLabel: string;
  x: number; // percentage 0-100 on map canvas
  y: number; // percentage 0-100 on map canvas
  lat: number;
  lng: number;
  deskNearby: string;
  description?: string;
}

export interface CampusConfiguration {
  id: CampusId;
  name: string;
  tagline: string;
  shortCode: string;
  address: string;
  centerCoordinates: {
    lat: number;
    lng: number;
    formatted: string;
  };
  itemCount: number;
  desksCount: number;
  areas: CampusLocationArea[];
}

export const CAMPUS_AREA_CATEGORIES: { id: CampusAreaCategory; label: string; icon: string }[] = [
  { id: 'academic', label: 'Academic Blocks', icon: 'domain' },
  { id: 'library', label: 'Library', icon: 'local_library' },
  { id: 'canteen', label: 'Canteen & Food Court', icon: 'restaurant' },
  { id: 'laboratories', label: 'Laboratories', icon: 'science' },
  { id: 'sports', label: 'Sports Area', icon: 'sports_soccer' },
  { id: 'parking', label: 'Parking', icon: 'local_parking' },
  { id: 'common', label: 'Common Areas', icon: 'groups' },
  { id: 'other', label: 'Other', icon: 'edit_location' },
];

export const INITIAL_CAMPUSES_CONFIG: CampusConfiguration[] = [
  {
    id: 'main-campus',
    name: 'University Campus',
    tagline: 'Use live location to identify the nearby university',
    shortCode: 'UNI',
    address: 'Choose a live GPS fix or place a map pin',
    centerCoordinates: { lat: 0, lng: 0, formatted: '' },
    itemCount: 0,
    desksCount: 0,
    areas: [],
  },
];

const STORAGE_KEY = 'findsync_campus_configuration_v3';

export function getCampusConfigurations(): CampusConfiguration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((campus) => {
          if (campus.id === 'sage-bhopal') {
            return { ...campus, name: 'University Campus', tagline: 'Campus location', address: 'Use live location or place a map pin' };
          }
          if (campus.id === 'sage-indore') {
            return { ...campus, name: 'Additional Campus', tagline: 'Additional campus location', address: 'Use live location or place a map pin' };
          }
          return campus;
        });
      }
    }
  } catch (e) {
    // fallback
  }
  return INITIAL_CAMPUSES_CONFIG;
}

export function saveCampusConfigurations(configs: CampusConfiguration[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
  } catch (e) {
    console.error('Failed to save campus configs to localStorage', e);
  }
}

export function resetCampusConfigurationsToDefault(): CampusConfiguration[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignore
  }
  return INITIAL_CAMPUSES_CONFIG;
}

export function getCampusById(campusId: CampusId): CampusConfiguration {
  const configs = getCampusConfigurations();
  const found = configs.find((c) => c.id === campusId);
  if (found) return found;
  // If not found, default to University Campus
  return configs[0] || INITIAL_CAMPUSES_CONFIG[0];
}
