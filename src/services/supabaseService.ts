import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Item, ClaimTracking } from '../types';
import { INITIAL_ITEMS, INITIAL_CLAIM_TRACKING } from '../data/mockData';

const LOCAL_STORAGE_ITEMS_KEY = 'findsync_supabase_items_cache';
const LOCAL_STORAGE_CLAIMS_KEY = 'findsync_supabase_claims_cache';

// Helper to get cached items from localStorage
function getLocalCachedItems(): Item[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_ITEMS;
}

// Helper to save cached items to localStorage
function setLocalCachedItems(items: Item[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// Helper to get cached claim
function getLocalCachedClaim(): ClaimTracking {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CLAIMS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return INITIAL_CLAIM_TRACKING;
}

// Helper to set cached claim
function setLocalCachedClaim(claim: ClaimTracking): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CLAIMS_KEY, JSON.stringify(claim));
  } catch {
    // ignore
  }
}

// Convert Item to Supabase row format
function itemToRow(item: Item) {
  return {
    id: item.id,
    report_code: item.reportCode,
    type: item.type,
    title: item.title,
    category: item.category,
    brand: item.brand || null,
    model: item.model || null,
    colorway: item.colorway,
    description: item.description,
    campus_id: item.campusId,
    campus_name: item.campusName || null,
    building_area: item.buildingArea || null,
    location_name: item.locationName,
    date_lost_or_found: item.dateLostOrFound,
    time_string: item.timeString,
    status: item.status,
    bin_number: item.binNumber || null,
    image_url: item.imageUrl,
    image_alt: item.imageAlt,
    match_score: item.matchScore || null,
    created_at: item.createdAt,
    raw_data: item,
  };
}

// Convert Supabase row back to Item
function rowToItem(row: any): Item {
  if (row.raw_data && typeof row.raw_data === 'object' && row.raw_data.id) {
    return {
      ...(row.raw_data as Item),
      status: (row.status as any) || row.raw_data.status,
      binNumber: row.bin_number || row.raw_data.binNumber,
    };
  }
  return {
    id: row.id,
    reportCode: row.report_code || `#L-${row.id.slice(-4)}`,
    type: row.type || 'lost',
    title: row.title || 'Untitled Report',
    category: row.category || 'Personal Essentials',
    brand: row.brand || undefined,
    model: row.model || undefined,
    colorway: row.colorway || 'Standard',
    description: row.description || '',
    campusId: row.campus_id || 'sage-bhopal',
    campusName: row.campus_name || undefined,
    buildingArea: row.building_area || undefined,
    locationName: row.location_name || 'Campus Grounds',
    dateLostOrFound: row.date_lost_or_found || 'Recently',
    timeString: row.time_string || 'N/A',
    status: row.status || 'active_search',
    binNumber: row.bin_number || undefined,
    imageUrl: row.image_url || '',
    imageAlt: row.image_alt || row.title || 'Item image',
    matchScore: row.match_score || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  };
}

/**
 * Seed initial sample items into Supabase if empty
 */
export async function seedInitialSupabaseDataIfEmpty(): Promise<void> {
  const localItems = getLocalCachedItems();
  if (localItems.length === 0) {
    setLocalCachedItems(INITIAL_ITEMS);
  }

  if (!isSupabaseConfigured) return;

  try {
    const { data, error } = await supabase.from('items').select('id').limit(1);
    if (!error && (!data || data.length === 0)) {
      const rows = INITIAL_ITEMS.map(itemToRow);
      await supabase.from('items').upsert(rows);
    }
  } catch (err) {
    console.warn('Supabase initial seed note:', err);
  }
}

/**
 * Real-time subscription to items from Supabase
 */
export function subscribeToSupabaseItems(
  onUpdate: (items: Item[]) => void,
  onError?: (err: Error) => void
): () => void {
  // Immediately provide cached data for responsive UI
  const initial = getLocalCachedItems();
  onUpdate(initial);

  if (!isSupabaseConfigured) {
    // In local fallback mode, listen to window storage events
    const storageHandler = () => {
      onUpdate(getLocalCachedItems());
    };
    window.addEventListener('storage', storageHandler);
    return () => window.removeEventListener('storage', storageHandler);
  }

  // Fetch live items from Supabase
  const fetchLiveItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        const parsed = data.map(rowToItem);
        setLocalCachedItems(parsed);
        onUpdate(parsed);
      } else {
        // Table exists but is empty; seed it
        await seedInitialSupabaseDataIfEmpty();
        onUpdate(getLocalCachedItems());
      }
    } catch (err: unknown) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      console.warn('Supabase fetch items note:', errorObj.message);
      if (onError) onError(errorObj);
      onUpdate(getLocalCachedItems());
    }
  };

  fetchLiveItems();

  // Set up Supabase Realtime channel subscription
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

/**
 * Save an item to Supabase and local cache
 */
export async function saveItemToSupabase(item: Item): Promise<void> {
  // Update local cache immediately for zero-latency response
  const current = getLocalCachedItems();
  const updated = [item, ...current.filter((i) => i.id !== item.id)];
  setLocalCachedItems(updated);

  if (!isSupabaseConfigured) return;

  try {
    const row = itemToRow(item);
    const { error } = await supabase.from('items').upsert([row]);
    if (error) {
      console.warn('Supabase save item notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase save item exception:', err);
  }
}

/**
 * Update an item in Supabase and local cache
 */
export async function updateItemInSupabase(
  itemId: string,
  updates: Partial<Item>
): Promise<void> {
  const current = getLocalCachedItems();
  const updated = current.map((i) => (i.id === itemId ? { ...i, ...updates } : i));
  setLocalCachedItems(updated);

  if (!isSupabaseConfigured) return;

  try {
    const targetItem = updated.find((i) => i.id === itemId);
    if (targetItem) {
      const row = itemToRow(targetItem);
      await supabase.from('items').upsert([row]);
    }
  } catch (err) {
    console.warn('Supabase update item exception:', err);
  }
}

/**
 * Save a claim to Supabase
 */
export async function saveClaimToSupabase(claim: ClaimTracking): Promise<void> {
  setLocalCachedClaim(claim);

  if (!isSupabaseConfigured) return;

  try {
    const { error } = await supabase.from('claims').upsert([
      {
        id: claim.claimId,
        claim_id: claim.claimId,
        item_title: claim.itemTitle,
        report_number: claim.reportNumber,
        status: claim.status,
        current_step: claim.currentStep,
        updated_ago: claim.updatedAgo,
        raw_data: claim,
      },
    ]);
    if (error) {
      console.warn('Supabase save claim notice:', error.message);
    }
  } catch (err) {
    console.warn('Supabase save claim exception:', err);
  }
}

/**
 * Subscribe to claim updates from Supabase
 */
export function subscribeToSupabaseClaims(
  onUpdate: (claim: ClaimTracking) => void
): () => void {
  onUpdate(getLocalCachedClaim());

  if (!isSupabaseConfigured) return () => {};

  const fetchLiveClaim = async () => {
    try {
      const { data, error } = await supabase
        .from('claims')
        .select('*')
        .limit(1)
        .order('id', { ascending: false });

      if (!error && data && data.length > 0) {
        const raw = data[0].raw_data as ClaimTracking;
        if (raw) {
          setLocalCachedClaim(raw);
          onUpdate(raw);
        }
      }
    } catch {
      // ignore
    }
  };

  fetchLiveClaim();

  const channel = supabase
    .channel('public:claims')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'claims' },
      () => {
        fetchLiveClaim();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
