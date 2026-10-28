import { AppNotification, CampusSite, ClaimTracking, HandoverStation, Item, MatchCase, UserProfile } from '../types';

// These collections are populated from authenticated user input and the live
// Supabase/local data source. Keep them empty so new installs show no fake records.
export const CAMPUS_SITES: CampusSite[] = [
  {
    id: 'main-campus',
    name: 'University Campus',
    tagline: 'Campus location',
    shortCode: 'UNI',
    itemCount: 0,
    desksCount: 0,
  },
];

export const INITIAL_ITEMS: Item[] = [];
export const CURRENT_MATCH_CASE: MatchCase | null = null;
export const INITIAL_CLAIM_TRACKING: ClaimTracking | null = null;
export const HANDOVER_STATIONS: HandoverStation[] = [];
export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
export const INITIAL_USERS: UserProfile[] = [];
