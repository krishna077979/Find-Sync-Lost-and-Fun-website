export type ItemType = 'lost' | 'found';

export type ItemStatus = 'in_custody' | 'active_search' | 'under_review' | 'reunited';

export type ItemCategory =
  | 'Electronics'
  | 'Bags & Backpacks'
  | 'Clothing'
  | 'Wallets & IDs'
  | 'Keys & Badges'
  | 'Books & Notes'
  | 'Jewelry / Watch'
  | 'Personal Essentials'
  | 'Other Asset';

export type CampusId =
  | 'sage-bhopal'
  | 'sage-indore'
  | 'all-campuses'
  | 'main-campus'
  | 'downtown-medical'
  | 'north-research'
  | string;

export type FacilitySector = 'academic' | 'residence' | 'transit' | 'athletics' | 'student_life';

export interface CampusSite {
  id: CampusId;
  name: string;
  tagline: string;
  itemCount: number;
  desksCount: number;
  shortCode?: string;
}

export interface ItemLocationCoordinates {
  lat: number;
  lng: number;
  formatted?: string;
  accuracyMeters?: number;
}

export interface Item {
  id: string;
  reportCode: string; // e.g. '#L-2049', '#F-1082', '#LR-8821'
  type: ItemType;
  title: string;
  category: ItemCategory;
  brand?: string;
  model?: string;
  colorway: string; // e.g. 'Matte Black', 'Forest Green', 'Navy Blue'
  colorHex?: string;
  description: string;
  campusId: CampusId;
  campusName?: string;
  buildingArea?: string;
  locationCategory?: string;
  isOtherLocation?: boolean;
  otherLocationDescription?: string;
  locationCoordinates?: ItemLocationCoordinates | string;
  mapPin?: { x: number; y: number };
  facilitySector?: FacilitySector;
  locationName: string;
  roomZone?: string;
  shuttleLine?: string; // e.g. 'Blue Line Shuttle #12'
  dateLostOrFound: string; // e.g. 'Oct 14, 2024'
  timeString: string; // e.g. '2:15 PM'
  status: ItemStatus;
  statusLabel?: string;
  binNumber?: string; // e.g. 'BIN #E-14'
  imageUrl: string;
  imageAlt: string;
  imageTagLabel?: string; // 'Original User Photo', 'Staff Intake Photograph'
  ownerName?: string;
  ownerId?: string;
  officerNotes?: string;
  officerName?: string;
  matchScore?: number;
  matchCaseId?: string;
  confidentialClues?: {
    uniqueMark?: string;
    internalContents?: string;
  };
  submittedProof?: string;
  createdAt: string;
}

export interface MatchFactorBreakdown {
  categoryAndType: number; // e.g. 100
  visualAndModel: number; // e.g. 90
  timeProximity: number; // e.g. 85
  geospatialProximity: number; // e.g. 80
}

export interface MatchCase {
  id: string; // e.g. 'Case #PM-8429'
  lostItem: Item;
  foundItem: Item;
  confidenceScore: number; // 86
  factorBreakdown: MatchFactorBreakdown;
  transitTime: string; // '~3 min transit time'
  distanceMeters: number; // 180
  corridorDescription: string;
  lostSiteName: string;
  lostSiteTime: string;
  foundSiteName: string;
  foundSiteTime: string;
  status: 'under_review' | 'claim_submitted' | 'verified' | 'rejected' | 'saved';
  claimDetails?: {
    claimId: string;
    covertMarkers: string;
    attachmentName?: string;
    lossContext?: string;
    submittedAt: string;
    reviewingOfficer: string;
    estimatedTurnaround: string;
  };
}

export interface ClaimTracking {
  claimId: string;
  itemId?: string;
  itemTitle: string;
  reportNumber: string;
  status: 'under_review' | 'approved' | 'rejected' | 'handover_ready' | 'closed';
  currentStep: number; // 1 to 6
  updatedAgo: string;
  submittedProof: string;
  reviewingOfficer: string;
  officeLocation: string;
  estimatedVerification: string;
  resolutionDate?: string;
}

export interface HandoverStation {
  id: string;
  name: string;
  campusId: CampusId;
  badge: string;
  hours: string;
  location: string;
  status: string;
  phone: string;
}

export type ViewTab =
  | 'home'
  | 'explore'
  | 'potential-matches'
  | 'report-lost'
  | 'report-found'
  | 'my-items'
  | 'admin-portal';

export interface AppNotification {
  id: string;
  type: 'match' | 'claim_update' | 'evidence_request' | 'handover';
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  linkTab?: ViewTab;
  linkParam?: string;
  badgeLabel?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'admin';
  studentId?: string;
  phone?: string;
  campusId: CampusId;
  department?: string;
  avatarUrl?: string;
}
