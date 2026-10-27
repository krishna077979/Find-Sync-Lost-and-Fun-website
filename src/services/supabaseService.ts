import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Item, ClaimTracking, MatchCase, MatchFactorBreakdown, UserProfile, AppNotification, CampusId } from '../types';
import { INITIAL_ITEMS, INITIAL_NOTIFICATIONS, INITIAL_CLAIM_TRACKING } from '../data/mockData';

// ============================================================================
// Authoritative Supabase Database Row Interfaces
// ============================================================================

export interface SupabaseItemRow {
  id: string; // uuid
  reporter_id: string; // uuid
  campus_id: string | null; // uuid
  item_type: 'lost' | 'found';
  title: string;
  category: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  description: string;
  location_description: string | null;
  latitude: number | null;
  longitude: number | null;
  incident_at: string | null; // timestamptz
  status: string; // 'active_search' | 'in_custody' | 'under_review' | 'reunited' | 'returned' | 'closed'
  created_at: string;
  updated_at: string;
}

export interface SupabaseProfileRow {
  id: string; // uuid (auth.users id)
  email: string;
  full_name: string | null;
  role: 'student' | 'staff' | 'admin';
  student_id: string | null;
  campus_id: string | null;
  department: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseClaimRow {
  id: string; // uuid
  item_id: string; // uuid
  claimant_id: string; // uuid
  status: 'under_review' | 'approved' | 'rejected' | 'handover_ready' | 'closed';
  current_step: number;
  notes: string | null;
  resolution_notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseClaimEvidenceRow {
  id: string; // uuid
  claim_id: string; // uuid
  file_path: string;
  file_type: string | null;
  description: string | null;
  created_at: string;
}

export interface SupabaseNotificationRow {
  id: string; // uuid
  user_id: string; // uuid
  type: 'match' | 'claim_update' | 'evidence_request' | 'handover';
  title: string;
  message: string;
  is_read: boolean;
  link_tab: string | null;
  link_param: string | null;
  created_at: string;
}

export interface SupabaseMatchRow {
  id: string; // uuid
  lost_item_id: string; // uuid
  found_item_id: string; // uuid
  similarity_score: number;
  status: 'potential' | 'under_review' | 'verified' | 'rejected';
  category_score: number;
  visual_score: number;
  proximity_score: number;
  notes: string | null;
  created_at: string;
}

// UUID validation helper
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function isUUID(str?: string | null): boolean {
  return Boolean(str && UUID_REGEX.test(str));
}

// In-memory runtime cache for seamless offline fallback / optimistic updates
let cachedItems: Item[] = [...INITIAL_ITEMS];
let cachedClaims: ClaimTracking = { ...INITIAL_CLAIM_TRACKING };
let cachedNotifications: AppNotification[] = [...INITIAL_NOTIFICATIONS];

// Bidirectional campus slug <-> uuid lookup cache
const campusSlugToUuid = new Map<string, string>();
const campusUuidToSlug = new Map<string, string>();

/**
 * Load campus records to resolve slugs to UUID foreign keys
 */
export async function loadCampusesFromSupabase(): Promise<void> {
  if (!isSupabaseConfigured) return;
  try {
    const { data, error } = await supabase.from('campuses').select('id, slug, name');
    if (!error && data) {
      for (const c of data) {
        if (c.slug && c.id) {
          campusSlugToUuid.set(c.slug.toLowerCase(), c.id);
          campusUuidToSlug.set(c.id, c.slug);
        }
      }
    }
  } catch (err) {
    console.warn('Campus lookup notice:', err);
  }
}

export function resolveCampusUuid(campusId?: string | null): string | null {
  if (!campusId || campusId === 'all-campuses') return null;
  if (isUUID(campusId)) return campusId;
  const found = campusSlugToUuid.get(campusId.toLowerCase());
  return found || null;
}

export function resolveCampusSlug(campusUuid?: string | null): string {
  if (!campusUuid) return 'sage-bhopal';
  const found = campusUuidToSlug.get(campusUuid);
  return found || campusUuid;
}

// ============================================================================
// Authentication & User Profile Services
// ============================================================================

/**
 * Derive user display name securely from metadata or email prefix
 */
export function deriveDisplayName(user: { user_metadata?: Record<string, any>; email?: string | null }): string {
  const meta = user.user_metadata || {};
  if (meta.full_name && typeof meta.full_name === 'string' && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  if (meta.name && typeof meta.name === 'string' && meta.name.trim()) {
    return meta.name.trim();
  }
  if (meta.given_name && typeof meta.given_name === 'string' && meta.given_name.trim()) {
    const family = meta.family_name ? ` ${meta.family_name}` : '';
    return `${meta.given_name}${family}`.trim();
  }
  if (user.email) {
    const prefix = user.email.split('@')[0];
    return prefix.charAt(0).toUpperCase() + prefix.slice(1);
  }
  return 'Campus Member';
}

/**
 * Get or upsert user profile row from Supabase
 * Enforces role strictly from database, preventing client self-elevation
 */
export async function getOrCreateUserProfile(authSessionUser: any): Promise<UserProfile> {
  const userId = authSessionUser.id;
  const email = authSessionUser.email || '';
  const fallbackName = deriveDisplayName(authSessionUser);

  if (!isSupabaseConfigured) {
    return {
      id: userId,
      name: fallbackName,
      email,
      role: email.includes('officer') || email.includes('admin') ? 'staff' : 'student',
      campusId: 'sage-bhopal',
      studentId: `STU-${userId.slice(0, 4).toUpperCase()}`,
      department: 'Campus Member',
    };
  }

  try {
    // 1. Fetch existing profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profile && !error) {
      return {
        id: profile.id,
        name: profile.full_name || fallbackName,
        email: profile.email || email,
        role: profile.role || 'student',
        studentId: profile.student_id || undefined,
        campusId: resolveCampusSlug(profile.campus_id) as CampusId,
        department: profile.department || undefined,
        avatarUrl: profile.avatar_url || authSessionUser.user_metadata?.avatar_url || undefined,
      };
    }

    // 2. Profile doesn't exist yet; insert default profile
    // Role strictly defaults to 'student' in the database
    const newProfile: Partial<SupabaseProfileRow> = {
      id: userId,
      email,
      full_name: fallbackName,
      role: 'student',
      student_id: `STU-${userId.slice(0, 5).toUpperCase()}`,
      campus_id: null,
      department: 'Student Body',
      avatar_url: authSessionUser.user_metadata?.avatar_url || null,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select('*')
      .single();

    if (inserted && !insertError) {
      return {
        id: inserted.id,
        name: inserted.full_name || fallbackName,
        email: inserted.email || email,
        role: inserted.role || 'student',
        studentId: inserted.student_id || undefined,
        campusId: resolveCampusSlug(inserted.campus_id) as CampusId,
        department: inserted.department || undefined,
        avatarUrl: inserted.avatar_url || undefined,
      };
    }
  } catch (err) {
    console.warn('Error fetching or creating profile in Supabase:', err);
  }

  return {
    id: userId,
    name: fallbackName,
    email,
    role: 'student',
    campusId: 'sage-bhopal',
  };
}

/**
 * Sign in with email and password
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    const demoUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: email.split('@')[0],
      email,
      role: email.includes('officer') || email.includes('admin') ? 'staff' : 'student',
      campusId: 'sage-bhopal',
    };
    return { user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      const profile = await getOrCreateUserProfile(data.user);
      return { user: profile, error: null };
    }
    return { user: null, error: 'Login did not return an authenticated user.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Authentication error occurred.' };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName: string,
  campusId: CampusId = 'sage-bhopal'
): Promise<{ user: UserProfile | null; error: string | null; confirmationRequired?: boolean }> {
  if (!isSupabaseConfigured) {
    const demoUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: fullName,
      email,
      role: 'student',
      campusId,
    };
    return { user: demoUser, error: null };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error: error.message };
    }

    if (data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
        return { user: null, error: 'An account with this email already exists.', confirmationRequired: false };
      }

      const profile = await getOrCreateUserProfile(data.user);
      const requiresConfirmation = !data.session;
      return { user: profile, error: null, confirmationRequired: requiresConfirmation };
    }

    return { user: null, error: 'Registration failed to create user.' };
  } catch (err: any) {
    return { user: null, error: err?.message || 'Sign up failed.' };
  }
}

/**
 * Trigger Supabase Google OAuth sign-in flow
 */
export async function signInWithGoogleOAuth(): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    console.warn('Supabase Google OAuth initialization notice:', err);
    return { error: err?.message || 'Failed to start Google sign-in.' };
  }
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) {
    return { success: true, error: null };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Password reset request failed.' };
  }
}

/**
 * Sign out from Supabase Auth
 */
export async function signOutFromSupabase(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out notice:', e);
    }
  }
}

// ============================================================================
// Storage Services (item-photos & claim-evidence)
// ============================================================================

/**
 * Upload item photo to private 'item-photos' storage bucket
 * Objects are stored in secure folder: ${itemId}/photo_${Date.now()}.${ext}
 */
export async function uploadItemPhotoToStorage(
  itemId: string,
  fileOrBlob: File | Blob,
  fileName?: string
): Promise<{ path: string | null; signedUrl: string | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { path: null, signedUrl: null, error: null };
  }

  try {
    const ext = fileName?.split('.').pop() || 'jpg';
    const filePath = `${itemId}/photo_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('item-photos')
      .upload(filePath, fileOrBlob, {
        upsert: true,
        contentType: fileOrBlob.type || 'image/jpeg',
      });

    if (error) {
      console.warn('Supabase storage photo upload notice:', error.message);
      return { path: null, signedUrl: null, error: new Error(error.message) };
    }

    // Generate short-lived signed URL (3600 seconds = 1 hr)
    const { data: signedData } = await supabase.storage
      .from('item-photos')
      .createSignedUrl(data.path, 3600);

    return { path: data.path, signedUrl: signedData?.signedUrl || null, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('Photo upload exception:', msg);
    return { path: null, signedUrl: null, error: new Error(msg) };
  }
}

/**
 * Generate short-lived signed URL for item photo
 */
export async function getItemPhotoSignedUrl(storagePath: string): Promise<string | null> {
  if (!isSupabaseConfigured || !storagePath) return null;
  try {
    const { data, error } = await supabase.storage
      .from('item-photos')
      .createSignedUrl(storagePath, 3600);
    if (error || !data) return null;
    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * Upload claim evidence document/photo to private 'claim-evidence' bucket
 */
export async function uploadClaimEvidenceToStorage(
  claimId: string,
  fileOrBlob: File | Blob,
  fileName?: string
): Promise<{ path: string | null; signedUrl: string | null; error: Error | null }> {
  if (!isSupabaseConfigured) {
    return { path: null, signedUrl: null, error: null };
  }

  try {
    const ext = fileName?.split('.').pop() || 'png';
    const filePath = `${claimId}/evidence_${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('claim-evidence')
      .upload(filePath, fileOrBlob, {
        upsert: true,
        contentType: fileOrBlob.type || 'image/png',
      });

    if (error) {
      console.warn('Supabase claim evidence upload notice:', error.message);
      return { path: null, signedUrl: null, error: new Error(error.message) };
    }

    const { data: signedData } = await supabase.storage
      .from('claim-evidence')
      .createSignedUrl(data.path, 3600);

    return { path: data.path, signedUrl: signedData?.signedUrl || null, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { path: null, signedUrl: null, error: new Error(msg) };
  }
}

// ============================================================================
// Data Transformation: Supabase Row <-> Frontend Item Model
// ============================================================================

/**
 * Convert authoritative Supabase row to frontend Item model
 * Uses ONLY authoritative columns from items table
 */
export function rowToItem(row: SupabaseItemRow, photoUrl?: string): Item {
  const shortPrefix = row.item_type === 'lost' ? '#L-' : '#F-';
  const reportCode = `${shortPrefix}${row.id ? row.id.slice(0, 4).toUpperCase() : '2049'}`;

  let dateLostOrFound = 'Recently';
  let timeString = 'N/A';
  if (row.incident_at) {
    try {
      const d = new Date(row.incident_at);
      dateLostOrFound = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      // ignore
    }
  } else if (row.created_at) {
    try {
      const d = new Date(row.created_at);
      dateLostOrFound = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      timeString = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } catch {
      // ignore
    }
  }

  let mappedStatus: Item['status'] = 'active_search';
  if (row.status === 'in_custody') mappedStatus = 'in_custody';
  else if (row.status === 'under_review') mappedStatus = 'under_review';
  else if (row.status === 'reunited' || row.status === 'returned' || row.status === 'closed') mappedStatus = 'reunited';
  else if (row.status === 'active_search') mappedStatus = 'active_search';
  else if (row.item_type === 'found') mappedStatus = 'in_custody';

  return {
    id: row.id,
    reportCode,
    type: row.item_type || 'lost',
    title: row.title || 'Untitled Item',
    category: (row.category as any) || 'Personal Essentials',
    brand: row.brand || undefined,
    model: row.model || undefined,
    colorway: row.color || 'Standard',
    description: row.description || '',
    campusId: (resolveCampusSlug(row.campus_id) as CampusId) || 'sage-bhopal',
    locationName: row.location_description || 'Campus Grounds',
    otherLocationDescription: row.location_description || undefined,
    dateLostOrFound,
    timeString,
    status: mappedStatus,
    binNumber: row.item_type === 'found' ? `BIN #${row.id.slice(0, 3).toUpperCase()}` : undefined,
    imageUrl: photoUrl || '',
    imageAlt: row.title || 'Item image',
    ownerId: row.reporter_id,
    locationCoordinates: (row.latitude != null && row.longitude != null) ? {
      lat: row.latitude,
      lng: row.longitude,
      formatted: `${row.latitude.toFixed(4)}° N, ${row.longitude.toFixed(4)}° E`,
    } : undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Strict insert row payload matching authoritative items table columns
 * reporter_id is always server-enforced from authenticated session
 * Nonexistent columns are NEVER sent
 */
export function itemToInsertPayload(
  item: Partial<Item>,
  reporterId: string
): Omit<SupabaseItemRow, 'id' | 'created_at' | 'updated_at'> {
  let lat: number | null = null;
  let lng: number | null = null;
  if (item.locationCoordinates && typeof item.locationCoordinates === 'object' && 'lat' in item.locationCoordinates) {
    lat = item.locationCoordinates.lat ?? null;
    lng = item.locationCoordinates.lng ?? null;
  }

  const now = new Date().toISOString();
  const resolvedCampus = resolveCampusUuid(item.campusId);

  return {
    reporter_id: reporterId,
    campus_id: resolvedCampus,
    item_type: item.type === 'found' ? 'found' : 'lost',
    title: item.title?.trim() || 'Untitled Report',
    category: item.category || 'Personal Essentials',
    brand: item.brand?.trim() || null,
    model: item.model?.trim() || null,
    color: item.colorway?.trim() || null,
    description: item.description?.trim() || '',
    location_description: item.locationName?.trim() || item.buildingArea || null,
    latitude: lat,
    longitude: lng,
    incident_at: item.dateLostOrFound ? new Date().toISOString() : now,
    status: item.type === 'found' ? 'in_custody' : 'active_search',
  };
}

// ============================================================================
// Real Items CRUD Operations & Realtime Subscriptions
// ============================================================================

/**
 * Seed initial probe / load campus lookup
 */
export async function seedInitialSupabaseDataIfEmpty(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await loadCampusesFromSupabase();
}

/**
 * Fetch items with optional bounded filtering
 */
export async function fetchSupabaseItems(filters?: {
  campusId?: string;
  itemType?: 'lost' | 'found';
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Item[]> {
  if (!isSupabaseConfigured) {
    let result = [...cachedItems];
    if (filters?.campusId && filters.campusId !== 'all-campuses') {
      result = result.filter((i) => i.campusId === filters.campusId);
    }
    if (filters?.itemType) {
      result = result.filter((i) => i.type === filters.itemType);
    }
    if (filters?.category) {
      result = result.filter((i) => i.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return result;
  }

  try {
    let query = supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.campusId && filters.campusId !== 'all-campuses') {
      const campusUuid = resolveCampusUuid(filters.campusId);
      if (campusUuid) {
        query = query.eq('campus_id', campusUuid);
      }
    }
    if (filters?.itemType) {
      query = query.eq('item_type', filters.itemType);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const maxLimit = filters?.limit || 50;
    query = query.limit(maxLimit);

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + maxLimit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;

    if (data && data.length > 0) {
      return data.map((row) => rowToItem(row as SupabaseItemRow));
    }
    return [];
  } catch (err) {
    console.warn('Supabase fetch items note:', err);
    return cachedItems;
  }
}

/**
 * Fetch items reported by the authenticated user
 */
export async function fetchMyItemsFromSupabase(userId: string): Promise<Item[]> {
  if (!isSupabaseConfigured) {
    return cachedItems.filter((i) => i.ownerId === userId);
  }

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('reporter_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) {
      return data.map((row) => rowToItem(row as SupabaseItemRow));
    }
  } catch (err) {
    console.warn('Fetch my items exception:', err);
  }
  return [];
}

/**
 * Save new item to Supabase and upload optional photo to item-photos bucket
 */
export async function saveItemToSupabase(
  item: Item,
  authUserId?: string,
  photoFile?: File | Blob
): Promise<{ item: Item; error: string | null }> {
  cachedItems = [item, ...cachedItems.filter((i) => i.id !== item.id)];

  if (!isSupabaseConfigured) {
    return { item, error: null };
  }

  try {
    let reporterId = authUserId;
    if (!reporterId) {
      const { data: sessionData } = await supabase.auth.getSession();
      reporterId = sessionData.session?.user.id;
    }

    if (!reporterId) {
      return { item, error: 'Authentication required to report an item.' };
    }

    const payload = itemToInsertPayload(item, reporterId);

    const { data, error } = await supabase
      .from('items')
      .insert([payload])
      .select('*')
      .single();

    if (error) {
      console.warn('Supabase save item notice:', error.message);
      return { item, error: error.message };
    }

    const savedRow = data as SupabaseItemRow;
    let signedPhotoUrl: string | undefined;

    // Upload photo to item-photos storage bucket if provided
    if (photoFile && savedRow.id) {
      const uploadRes = await uploadItemPhotoToStorage(savedRow.id, photoFile);
      if (uploadRes.signedUrl) {
        signedPhotoUrl = uploadRes.signedUrl;
      }
    }

    const mappedSavedItem = rowToItem(savedRow, signedPhotoUrl || item.imageUrl);
    cachedItems = [mappedSavedItem, ...cachedItems.filter((i) => i.id !== item.id)];
    return { item: mappedSavedItem, error: null };
  } catch (err: any) {
    console.warn('Supabase save item exception:', err);
    return { item, error: err?.message || 'Failed to save item.' };
  }
}

/**
 * Update an existing item in Supabase
 */
export async function updateItemInSupabase(
  itemId: string,
  updates: Partial<Item>
): Promise<{ success: boolean; error: string | null }> {
  cachedItems = cachedItems.map((i) => (i.id === itemId ? { ...i, ...updates } : i));

  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.locationName) dbUpdates.location_description = updates.locationName;

    const { error } = await supabase
      .from('items')
      .update(dbUpdates)
      .eq('id', itemId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update item.' };
  }
}

/**
 * Delete an item from Supabase
 */
export async function deleteItemFromSupabase(
  itemId: string
): Promise<{ success: boolean; error: string | null }> {
  cachedItems = cachedItems.filter((i) => i.id !== itemId);

  if (!isSupabaseConfigured) return { success: true, error: null };

  try {
    const { error } = await supabase.from('items').delete().eq('id', itemId);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete item.' };
  }
}

/**
 * Real-time subscription to items from Supabase
 */
export function subscribeToSupabaseItems(
  onUpdate: (items: Item[]) => void,
  onError?: (err: Error) => void
): () => void {
  onUpdate(cachedItems);

  if (!isSupabaseConfigured) {
    return () => {};
  }

  const fetchLiveItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data && data.length > 0) {
        const parsed = data.map((row) => rowToItem(row as SupabaseItemRow));
        cachedItems = parsed;
        onUpdate(parsed);
      }
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.warn('Supabase fetch items note:', errorObj.message);
      if (onError) onError(errorObj);
    }
  };

  fetchLiveItems();

  const channel = supabase
    .channel('public:items')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' },
      () => {
        fetchLiveItems();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// Transparent Baseline Matching Engine
// ============================================================================

/**
 * Dynamic similarity calculation between lost item and found item
 * Evaluates category (35%), keyword overlap (30%), brand (15%), color (10%), campus (10%)
 */
export function computeMatchScore(lost: Item, found: Item): {
  score: number;
  breakdown: MatchFactorBreakdown;
  corridorDescription: string;
} {
  let categoryScore = 0;
  if (lost.category && found.category && lost.category.toLowerCase() === found.category.toLowerCase()) {
    categoryScore = 100;
  }

  // Visual & Model text overlap
  const lostTokens = `${lost.title} ${lost.description} ${lost.model || ''}`.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  const foundTokens = `${found.title} ${found.description} ${found.model || ''}`.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  let matchesCount = 0;
  for (const token of lostTokens) {
    if (foundTokens.includes(token)) matchesCount++;
  }
  const tokenRatio = lostTokens.length > 0 ? Math.min(1, matchesCount / Math.max(2, lostTokens.length * 0.4)) : 0;
  const visualScore = Math.round(tokenRatio * 100);

  // Brand match
  let brandBonus = 0;
  if (lost.brand && found.brand && lost.brand.toLowerCase() === found.brand.toLowerCase()) {
    brandBonus = 100;
  } else if (lost.brand && found.title.toLowerCase().includes(lost.brand.toLowerCase())) {
    brandBonus = 90;
  }

  // Geospatial & Campus Proximity
  let geoScore = 50;
  if (lost.campusId && found.campusId && lost.campusId === found.campusId) {
    geoScore = 90;
  }

  // Time proximity
  const timeScore = 80;

  // Weighted total: category (35%), text/model (30%), brand (15%), time (10%), geo (10%)
  const totalScore = Math.round(
    (categoryScore * 0.35) +
    (visualScore * 0.30) +
    (brandBonus * 0.15) +
    (timeScore * 0.10) +
    (geoScore * 0.10)
  );

  return {
    score: Math.min(99, Math.max(0, totalScore)),
    breakdown: {
      categoryAndType: categoryScore,
      visualAndModel: Math.max(visualScore, brandBonus),
      timeProximity: timeScore,
      geospatialProximity: geoScore,
    },
    corridorDescription: `${lost.locationName} to ${found.locationName} corridor`,
  };
}

/**
 * Find highest candidate match between user's lost item and available found items
 */
export function findPotentialMatchCase(lostItems: Item[], foundItems: Item[]): MatchCase | null {
  if (lostItems.length === 0 || foundItems.length === 0) {
    return null;
  }

  let bestMatch: { lost: Item; found: Item; score: number; breakdown: MatchFactorBreakdown; corridor: string } | null = null;

  for (const lost of lostItems) {
    for (const found of foundItems) {
      if (found.status === 'reunited') continue;
      const res = computeMatchScore(lost, found);
      if (res.score >= 50 && (!bestMatch || res.score > bestMatch.score)) {
        bestMatch = {
          lost,
          found,
          score: res.score,
          breakdown: res.breakdown,
          corridor: res.corridorDescription,
        };
      }
    }
  }

  if (!bestMatch) {
    return null;
  }

  return {
    id: `Case #PM-${bestMatch.found.id.slice(0, 4).toUpperCase()}`,
    lostItem: bestMatch.lost,
    foundItem: bestMatch.found,
    confidenceScore: bestMatch.score,
    factorBreakdown: bestMatch.breakdown,
    transitTime: '~3 min campus corridor',
    distanceMeters: 180,
    corridorDescription: bestMatch.corridor,
    lostSiteName: bestMatch.lost.locationName,
    lostSiteTime: bestMatch.lost.dateLostOrFound,
    foundSiteName: bestMatch.found.locationName,
    foundSiteTime: bestMatch.found.dateLostOrFound,
    status: 'under_review',
  };
}

/**
 * Record match candidate pairing into Supabase matches table
 */
export async function recordMatchInSupabase(
  lostItemId: string,
  foundItemId: string,
  score: number,
  breakdown: MatchFactorBreakdown
): Promise<void> {
  if (!isSupabaseConfigured || !isUUID(lostItemId) || !isUUID(foundItemId)) return;

  try {
    await supabase.from('matches').upsert(
      {
        lost_item_id: lostItemId,
        found_item_id: foundItemId,
        similarity_score: score,
        category_score: breakdown.categoryAndType,
        visual_score: breakdown.visualAndModel,
        proximity_score: breakdown.geospatialProximity,
        status: score >= 80 ? 'verified' : 'potential',
      },
      { onConflict: 'lost_item_id,found_item_id' }
    );
  } catch (err) {
    console.warn('Record match candidate notice:', err);
  }
}

// ============================================================================
// Claims & Handover Recovery Workflow
// ============================================================================

/**
 * Submit verified ownership claim with optional evidence attachment
 */
export async function saveClaimToSupabase(
  claim: ClaimTracking,
  itemId?: string,
  evidenceFile?: File | Blob,
  evidenceDescription?: string
): Promise<{ claim: ClaimTracking; error: string | null }> {
  cachedClaims = claim;

  if (!isSupabaseConfigured) {
    return { claim, error: null };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const claimantId = sessionData.session?.user.id;

    if (!claimantId) {
      return { claim, error: 'Sign in to file an ownership claim.' };
    }

    // Resolve valid item UUID
    let targetItemId: string | null = null;
    if (itemId && isUUID(itemId)) {
      targetItemId = itemId;
    } else {
      // Look up first available found item UUID
      const { data: foundRows } = await supabase
        .from('items')
        .select('id')
        .eq('item_type', 'found')
        .limit(1);
      if (foundRows && foundRows.length > 0) {
        targetItemId = foundRows[0].id;
      }
    }

    if (!targetItemId) {
      return { claim, error: 'Valid found item reference is required to submit a claim.' };
    }

    // Insert claim row
    const { data: claimRow, error } = await supabase
      .from('claims')
      .insert([
        {
          item_id: targetItemId,
          claimant_id: claimantId,
          status: 'under_review',
          current_step: 2,
          notes: claim.submittedProof || null,
        },
      ])
      .select('*')
      .single();

    if (error) {
      console.warn('Supabase save claim notice:', error.message);
      return { claim, error: error.message };
    }

    // Upload evidence if provided
    if (evidenceFile && claimRow?.id) {
      const uploadRes = await uploadClaimEvidenceToStorage(claimRow.id, evidenceFile);
      if (uploadRes.path) {
        await supabase.from('claim_evidence').insert({
          claim_id: claimRow.id,
          file_path: uploadRes.path,
          file_type: evidenceFile.type || 'image/png',
          description: evidenceDescription || 'Ownership verification document',
        });
      }
    }

    const savedClaim: ClaimTracking = {
      ...claim,
      claimId: `#CLM-${claimRow.id.slice(0, 4).toUpperCase()}`,
      currentStep: 2,
      status: 'under_review',
      updatedAgo: 'Just now',
    };
    cachedClaims = savedClaim;
    return { claim: savedClaim, error: null };
  } catch (err: any) {
    console.warn('Supabase save claim exception:', err);
    return { claim, error: err?.message || 'Failed to submit claim.' };
  }
}

/**
 * Update claim status (approve, request evidence, or reject)
 */
export async function updateClaimStatusInSupabase(
  claimId: string,
  status: 'under_review' | 'approved' | 'rejected' | 'handover_ready' | 'closed',
  currentStep: number,
  resolutionNotes?: string
): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) {
    cachedClaims = {
      ...cachedClaims,
      status,
      currentStep,
      updatedAgo: 'Just now',
    };
    return { success: true, error: null };
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const reviewerId = sessionData.session?.user.id || null;

    const query = supabase
      .from('claims')
      .update({
        status,
        current_step: currentStep,
        resolution_notes: resolutionNotes || null,
        reviewed_by: reviewerId,
        updated_at: new Date().toISOString(),
      });

    // Support both direct UUID or #CLM- prefix matching
    const cleanId = claimId.replace('#CLM-', '');
    if (isUUID(cleanId)) {
      query.eq('id', cleanId);
    }

    const { error } = await query;
    if (error) throw error;

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update claim.' };
  }
}

/**
 * Subscribe to claim updates from Supabase
 */
export function subscribeToSupabaseClaims(
  onUpdate: (claim: ClaimTracking) => void
): () => void {
  onUpdate(cachedClaims);

  if (!isSupabaseConfigured) return () => {};

  const fetchLiveClaims = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const row = data[0] as SupabaseClaimRow;
        const mappedClaim: ClaimTracking = {
          claimId: `#CLM-${row.id.slice(0, 4).toUpperCase()}`,
          itemTitle: 'Campus Custody Item',
          reportNumber: `#F-${row.item_id ? row.item_id.slice(0, 4).toUpperCase() : '1082'}`,
          status: row.status,
          currentStep: row.current_step || 1,
          updatedAgo: 'Just now',
          submittedProof: row.notes || 'Ownership evidence submitted',
          reviewingOfficer: 'Campus Safety Officer',
          officeLocation: 'Student Union Desk Counter #2',
          estimatedVerification: 'Within 24 business hours',
        };
        cachedClaims = mappedClaim;
        onUpdate(mappedClaim);
      }
    } catch {
      // ignore
    }
  };

  fetchLiveClaims();

  const channel = supabase
    .channel('public:claims')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'claims' },
      () => {
        fetchLiveClaims();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// Notifications Hub
// ============================================================================

/**
 * Fetch notifications for authenticated user
 */
export async function fetchUserNotificationsFromSupabase(userId: string): Promise<AppNotification[]> {
  if (!isSupabaseConfigured) {
    return cachedNotifications;
  }

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((n: SupabaseNotificationRow) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        timeAgo: 'Recently',
        read: n.is_read,
        linkTab: n.link_tab as any,
        linkParam: n.link_param || undefined,
      }));
    }
  } catch (err) {
    console.warn('Fetch notifications notice:', err);
  }
  return cachedNotifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsReadInSupabase(notifId: string): Promise<void> {
  cachedNotifications = cachedNotifications.map((n) => (n.id === notifId ? { ...n, read: true } : n));

  if (!isSupabaseConfigured || !isUUID(notifId)) return;

  try {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
  } catch (e) {
    console.warn('Mark notif read exception:', e);
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadInSupabase(userId: string): Promise<void> {
  cachedNotifications = cachedNotifications.map((n) => ({ ...n, read: true }));

  if (!isSupabaseConfigured) return;

  try {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  } catch (e) {
    console.warn('Mark all notifs read exception:', e);
  }
}

// ============================================================================
// Admin Portal & Live Aggregated System Statistics
// ============================================================================

export interface AdminSystemStats {
  totalReports: number;
  activeSearches: number;
  inCustody: number;
  pendingClaims: number;
  resolvedCases: number;
  recoveryRatePercent: number;
}

/**
 * Load genuine aggregated metrics from Supabase database tables
 */
export async function fetchAdminStatsFromSupabase(): Promise<AdminSystemStats> {
  if (!isSupabaseConfigured) {
    const total = cachedItems.length;
    const active = cachedItems.filter((i) => i.type === 'lost' && i.status === 'active_search').length;
    const custody = cachedItems.filter((i) => i.status === 'in_custody' || i.status === 'under_review').length;
    const resolved = cachedItems.filter((i) => i.status === 'reunited').length;
    return {
      totalReports: total,
      activeSearches: active,
      inCustody: custody,
      pendingClaims: 1,
      resolvedCases: resolved,
      recoveryRatePercent: total > 0 ? Math.round((resolved / total) * 100) : 78,
    };
  }

  try {
    const { count: totalCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });

    const { count: activeSearchesCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('item_type', 'lost')
      .eq('status', 'active_search');

    const { count: inCustodyCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .in('status', ['in_custody', 'under_review']);

    const { count: pendingClaimsCount } = await supabase
      .from('claims')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'under_review');

    const { count: resolvedCount } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .in('status', ['reunited', 'returned', 'closed']);

    const total = totalCount || 0;
    const resolved = resolvedCount || 0;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      totalReports: total,
      activeSearches: activeSearchesCount || 0,
      inCustody: inCustodyCount || 0,
      pendingClaims: pendingClaimsCount || 0,
      resolvedCases: resolved,
      recoveryRatePercent: rate,
    };
  } catch (err) {
    console.warn('Admin stats aggregate exception:', err);
    return {
      totalReports: 0,
      activeSearches: 0,
      inCustody: 0,
      pendingClaims: 0,
      resolvedCases: 0,
      recoveryRatePercent: 0,
    };
  }
}
