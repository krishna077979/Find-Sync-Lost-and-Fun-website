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
    id: 'sage-bhopal',
    name: 'SAGE University, Bhopal',
    tagline: 'Katara Hills Extension, Sahara Bypass Road',
    shortCode: 'SUB',
    address: 'Katara Extension, Sahara Bypass Road, Bhopal, Madhya Pradesh 462022',
    centerCoordinates: {
      lat: 23.1785,
      lng: 77.4920,
      formatted: '23.1785° N, 77.4920° E',
    },
    itemCount: 142,
    desksCount: 4,
    areas: [
      {
        id: 'sub-lib',
        name: 'Central University Library',
        code: 'LIB-CENTRAL',
        category: 'library',
        categoryLabel: 'Library',
        x: 48,
        y: 36,
        lat: 23.1787,
        lng: 77.4922,
        deskNearby: 'Main Circulation Desk (Ground Floor)',
        description: 'Multi-storey central repository with quiet reading halls and digital reference cubicles',
      },
      {
        id: 'sub-eng',
        name: 'Engineering & Technology Block (Block A)',
        code: 'ENG-BLK-A',
        category: 'academic',
        categoryLabel: 'Academic Blocks',
        x: 32,
        y: 42,
        lat: 23.1782,
        lng: 77.4914,
        deskNearby: 'Engineering Dean Office & Faculty Reception',
        description: 'Lecture halls, multimedia seminar rooms, and departmental offices',
      },
      {
        id: 'sub-mgmt',
        name: 'Management & Commerce Block (Block B)',
        code: 'MGMT-BLK-B',
        category: 'academic',
        categoryLabel: 'Academic Blocks',
        x: 65,
        y: 44,
        lat: 23.1788,
        lng: 77.4928,
        deskNearby: 'Student Support Helpdesk #1',
        description: 'Business school classrooms, conference auditoriums, and tutorial rooms',
      },
      {
        id: 'sub-canteen',
        name: 'Main Campus Food Court & Canteen',
        code: 'CANTEEN-MAIN',
        category: 'canteen',
        categoryLabel: 'Canteen & Food Court',
        x: 52,
        y: 58,
        lat: 23.1784,
        lng: 77.4923,
        deskNearby: 'Central Lost & Found Desk #2 (Open 24/7)',
        description: 'Indoor multi-vendor dining pavilion, open terrace cafeteria, and beverage counters',
      },
      {
        id: 'sub-nescafe',
        name: 'Nescafe Corner & Express Kiosk',
        code: 'KIOSK-NESC',
        category: 'canteen',
        categoryLabel: 'Canteen & Food Court',
        x: 38,
        y: 62,
        lat: 23.1781,
        lng: 77.4918,
        deskNearby: 'Student Plaza Security Kiosk',
        description: 'Outdoor shaded seating kiosk between Academic Block A and Library',
      },
      {
        id: 'sub-lab-comp',
        name: 'Advanced Computing & AI Laboratory',
        code: 'LAB-COMP-AI',
        category: 'laboratories',
        categoryLabel: 'Laboratories',
        x: 26,
        y: 52,
        lat: 23.1779,
        lng: 77.4910,
        deskNearby: 'Computing Systems Administration Lab Counter',
        description: 'High-performance computing terminals and software development clusters',
      },
      {
        id: 'sub-lab-pharma',
        name: 'Biotechnology & Pharmacy Research Labs',
        code: 'LAB-BIO-PHARM',
        category: 'laboratories',
        categoryLabel: 'Laboratories',
        x: 74,
        y: 35,
        lat: 23.1792,
        lng: 77.4932,
        deskNearby: 'Pharma Lab In-Charge Desk',
        description: 'Controlled analytical laboratories and instrumentation suites',
      },
      {
        id: 'sub-sports',
        name: 'University Sports Ground & Stadium',
        code: 'SPORTS-GRND',
        category: 'sports',
        categoryLabel: 'Sports Area',
        x: 82,
        y: 68,
        lat: 23.1790,
        lng: 77.4938,
        deskNearby: 'Athletics & Equipment Caretaker Office',
        description: 'Cricket pitch, athletic running track, and football field',
      },
      {
        id: 'sub-gym',
        name: 'Indoor Sports Arena & Gymnasium',
        code: 'SPORTS-INDOOR',
        category: 'sports',
        categoryLabel: 'Sports Area',
        x: 72,
        y: 76,
        lat: 23.1785,
        lng: 77.4934,
        deskNearby: 'Fitness Center Reception',
        description: 'Badminton courts, table tennis hall, and fitness workout gym',
      },
      {
        id: 'sub-parking-1',
        name: 'Student Vehicle Parking Zone (Gate 1)',
        code: 'PARK-GATE-1',
        category: 'parking',
        categoryLabel: 'Parking',
        x: 20,
        y: 78,
        lat: 23.1775,
        lng: 77.4908,
        deskNearby: 'Gate 1 Main Security Checkpost',
        description: 'Covered two-wheeler and four-wheeler designated parking for students',
      },
      {
        id: 'sub-parking-2',
        name: 'Faculty & Visitor Parking (Gate 2)',
        code: 'PARK-GATE-2',
        category: 'parking',
        categoryLabel: 'Parking',
        x: 60,
        y: 20,
        lat: 23.1794,
        lng: 77.4925,
        deskNearby: 'Gate 2 Administrative Security Cabin',
        description: 'Administrative parking zone adjacent to the Vice-Chancellor Secretariat',
      },
      {
        id: 'sub-amphi',
        name: 'Central Amphitheatre & Open Quad',
        code: 'QUAD-AMPHI',
        category: 'common',
        categoryLabel: 'Common Areas',
        x: 46,
        y: 48,
        lat: 23.1785,
        lng: 77.4920,
        deskNearby: 'Cultural Committee Hub',
        description: 'Open air tiered amphitheatre and landscaped green lawn gathering space',
      },
    ],
  },
  {
    id: 'sage-indore',
    name: 'SAGE University, Indore',
    tagline: 'Kailod Kartal, Indore-Dewas Bypass Road',
    shortCode: 'SUI',
    address: 'Kailod Kartal, Indore-Dewas Bypass Road, Indore, Madhya Pradesh 452020',
    centerCoordinates: {
      lat: 22.7533,
      lng: 75.8937,
      formatted: '22.7533° N, 75.8937° E',
    },
    itemCount: 48,
    desksCount: 2,
    areas: [
      {
        id: 'sui-main',
        name: 'Main Academic Complex',
        code: 'SUI-ACAD',
        category: 'academic',
        categoryLabel: 'Academic Blocks',
        x: 45,
        y: 40,
        lat: 22.7535,
        lng: 75.8939,
        deskNearby: 'Central Intake Desk',
      },
      {
        id: 'sui-lib',
        name: 'Indore Campus Central Library',
        code: 'SUI-LIB',
        category: 'library',
        categoryLabel: 'Library',
        x: 55,
        y: 50,
        lat: 22.7534,
        lng: 75.8941,
        deskNearby: 'Library Reception',
      },
      {
        id: 'sui-canteen',
        name: 'Student Cafeteria',
        code: 'SUI-CAFE',
        category: 'canteen',
        categoryLabel: 'Canteen & Food Court',
        x: 35,
        y: 65,
        lat: 22.7530,
        lng: 75.8932,
        deskNearby: 'Cafeteria Help Post',
      },
    ],
  },
  {
    id: 'all-campuses',
    name: 'All Campuses (System-Wide)',
    tagline: 'SAGE University Bhopal & Indore Campuses',
    shortCode: 'ALL',
    address: 'Central University Coordination Office, Madhya Pradesh',
    centerCoordinates: {
      lat: 23.1785,
      lng: 77.4920,
      formatted: '23.1785° N, 77.4920° E (HQ)',
    },
    itemCount: 190,
    desksCount: 6,
    areas: [
      {
        id: 'sub-lib',
        name: 'Central University Library (Bhopal)',
        code: 'SUB-LIB',
        category: 'library',
        categoryLabel: 'Library',
        x: 48,
        y: 36,
        lat: 23.1787,
        lng: 77.4922,
        deskNearby: 'Bhopal Library Counter',
      },
      {
        id: 'sub-canteen',
        name: 'Main Food Court & Canteen (Bhopal)',
        code: 'SUB-CANT',
        category: 'canteen',
        categoryLabel: 'Canteen & Food Court',
        x: 52,
        y: 58,
        lat: 23.1784,
        lng: 77.4923,
        deskNearby: 'Central Lost & Found Desk #2',
      },
      {
        id: 'sub-eng',
        name: 'Engineering Block A (Bhopal)',
        code: 'SUB-ENG',
        category: 'academic',
        categoryLabel: 'Academic Blocks',
        x: 32,
        y: 42,
        lat: 23.1782,
        lng: 77.4914,
        deskNearby: 'Dean Office Reception',
      },
      {
        id: 'sui-main',
        name: 'Main Academic Complex (Indore)',
        code: 'SUI-ACAD',
        category: 'academic',
        categoryLabel: 'Academic Blocks',
        x: 75,
        y: 60,
        lat: 22.7535,
        lng: 75.8939,
        deskNearby: 'Indore Security Post',
      },
    ],
  },
];

const STORAGE_KEY = 'findsync_campus_configuration_v2';

export function getCampusConfigurations(): CampusConfiguration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
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
  // If not found, default to SAGE University Bhopal
  return configs[0] || INITIAL_CAMPUSES_CONFIG[0];
}
