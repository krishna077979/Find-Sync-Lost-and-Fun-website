
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Item, ClaimTracking } from '../types';
import { INITIAL_ITEMS } from '../data/mockData';

const LOCAL_STORAGE_ITEMS_KEY = 'findsync_supabase_items_cache';
const LOCAL_STORAGE_CLAIMS_KEY = 'findsync_supabase_claims_cache';

function isLegacySampleItem(item: Partial<Item>): boolean {
  const sampleIds = new Set(['#L-2049', '#F-1082', '#LR-8821']);
  return /^item-\d+$/.test(item.id ?? '') || sampleIds.has(item.reportCode ?? '');
}

function getLocalCachedItems(): Item[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((item) => !isLegacySampleItem(item));
    }
  } catch {
    // Ignore unavailable or invalid local cache.
  }
  return [];
}

function setLocalCachedItems(items: Item[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  } catch {
    // Ignore local storage errors.
  }
}

function getLocalCachedClaim(): ClaimTracking | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CLAIMS_KEY);
    if (raw) {
      const claim = JSON.parse(raw) as ClaimTracking;
      if (claim.claimId === '#CLM-9204') return null;
      return claim;
    }
  } catch {
    // Ignore invalid cache.
  }
  return null;
}

function setLocalCachedClaim(claim: ClaimTracking): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CLAIMS_KEY, JSON.stringify(claim));
  } catch {
    // Ignore local storage errors.
  }
}

function rowToItem(row: any): Item {
  const rawData = row.raw_data && typeof row.raw_data === 'object'
    ? row.raw_data as Partial<Item>
    : {};

  return {
    ...rawData,
    id: row.id,
    ownerId: row.reporter_id ?? rawData.ownerId,
    reportCode: row.report_code ?? `#L-${String(row.id).slice(-4)}`,
    type: row.type,
    title: row.title,
    category: row.category,
    brand: row.brand ?? undefined,
    model: row.model ?? undefined,
    colorway: row.colorway ?? 'Standard',
    description: row.description,
    campusId: row.campus_id ?? '',
    campusName: row.campus_name ?? rawData.campusName,
    buildingArea: row.building_area ?? rawData.buildingArea,
    binNumber: row.bin_number ?? rawData.binNumber,
    locationName: row.location_name ?? '',
    dateLostOrFound: row.date_lost_or_found ?? '',
    timeString: row.time_string ?? rawData.timeString ?? 'N/A',
    status: row.status,
    imageUrl: row.image_url ?? rawData.imageUrl ?? '',
    imageAlt: row.image_alt ?? rawData.imageAlt ?? row.title,
    createdAt: row.created_at ?? rawData.createdAt ?? new Date().toISOString(),
  } as Item;
}

function itemToRow(item: Item, reporterId?: string) {
  const {
    confidentialClues: _confidentialClues,
    submittedProof: _submittedProof,
    officerNotes: _officerNotes,
    ownerId: _ownerId,
    ownerName: _ownerName,
    ...publicItem
  } = item;
  const row: Record<string, unknown> = {
    id: item.id,
    reporter_id: reporterId ?? null,
    report_code: item.reportCode,
    type: item.type,
    title: item.title,
    category: item.category,
    brand: item.brand || null,
    model: item.model || null,
    colorway: item.colorway || 'Standard',
    description: item.description,
    campus_id: item.campusId || null,
    campus_name: item.campusName || null,
    building_area: item.buildingArea || null,
    location_name: item.locationName || 'Campus Grounds',
    date_lost_or_found: item.dateLostOrFound || 'Recently',
    time_string: item.timeString || null,
    status: item.status,
    bin_number: item.binNumber || null,
    match_score: item.matchScore ?? null,
    image_url: item.imageUrl || null,
    image_alt: item.imageAlt || null,
    raw_data: publicItem,
  };

  return row;
}

export async function seedInitialSupabaseDataIfEmpty(): Promise<void> {
  // Do not seed mock items into the production database.
}

export function subscribeToSupabaseItems(
  onUpdate: (items: Item[]) => void,
  onError?: (err: Error) => void
): () => void {
  let active = true;

  const fetchItems = async () => {
    if (!isSupabaseConfigured) {
      if (active) onUpdate(getLocalCachedItems());
      return;
    }

    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!active) return;

    if (error) {
      onError?.(new Error(error.message));
      return;
    }

    const items = (data ?? []).map(rowToItem).filter((item) => !isLegacySampleItem(item));
    setLocalCachedItems(items);
    onUpdate(items);
  };

  void fetchItems();

  if (!isSupabaseConfigured) {
    return () => {
      active = false;
    };
  }

  const channel = supabase
    .channel('findsync-items')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' },
      () => void fetchItems()
    )
    .subscribe();

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}

export async function saveItemToSupabase(item: Item): Promise<void> {
  if (!isSupabaseConfigured) {
    const current = getLocalCachedItems();
    setLocalCachedItems([item, ...current.filter((existing) => existing.id !== item.id)]);
    return;
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('Please sign in before reporting an item.');
  }

  const row = itemToRow(item, authData.user.id);

  const { data, error } = await supabase
    .from('items')
    .upsert(row)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Could not save item: ${error.message}`);
  }

  const savedItem = rowToItem(data);
  const current = getLocalCachedItems();
  setLocalCachedItems([
    savedItem,
    ...current.filter((existing) => existing.id !== savedItem.id),
  ]);
}

export async function updateItemInSupabase(
  itemId: string,
  updates: Partial<Item>
): Promise<void> {
  if (!isSupabaseConfigured) {
    const current = getLocalCachedItems();
    setLocalCachedItems(current.map((item) => item.id === itemId ? { ...item, ...updates } : item));
    return;
  }

  const current = getLocalCachedItems();
  const target = current.find((item) => item.id === itemId);

  if (!target) {
    throw new Error('Item not found in the local cache.');
  }

  const updated = { ...target, ...updates };
  const row = itemToRow(updated, target.ownerId);

  delete row.id;
  delete row.reporter_id;


  const { error } = await supabase
    .from('items')
    .update(row)
    .eq('id', itemId);

  if (error) {
    throw new Error(`Could not update item: ${error.message}`);
  }

  setLocalCachedItems(
    current.map((item) => (item.id === itemId ? updated : item))
  );
}

export async function saveClaimToSupabase(
  claim: ClaimTracking,
  isUpdate = false
): Promise<void> {
  if (!isSupabaseConfigured) {
    setLocalCachedClaim(claim);
    return;
  }

  const row = {
    claim_id: claim.claimId,
    item_title: claim.itemTitle,
    report_number: claim.reportNumber,
    status: claim.status,
    current_step: claim.currentStep,
    updated_ago: claim.updatedAgo,
    raw_data: claim,
  };
  const { error } = isUpdate
    ? await supabase.from('claims').update(row).eq('claim_id', claim.claimId).select('claim_id').single()
    : await supabase.from('claims').insert({ id: claim.claimId, ...row });

  if (error) {
    throw new Error(`Could not save claim: ${error.message}`);
  }
  setLocalCachedClaim(claim);
}

export function subscribeToSupabaseClaims(
  onUpdate: (claim: ClaimTracking | null) => void
): () => void {
  onUpdate(isSupabaseConfigured ? null : getLocalCachedClaim());
  if (!isSupabaseConfigured) return () => {};

  let active = true;
  const fetchClaim = async () => {
    const { data, error } = await supabase
      .from('claims')
      .select('raw_data')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!active || error) return;
    if (!data?.raw_data) {
      onUpdate(null);
      return;
    }
    const claim = data.raw_data as ClaimTracking;
    if (claim.claimId === '#CLM-9204') {
      onUpdate(null);
      return;
    }
    setLocalCachedClaim(claim);
    onUpdate(claim);
  };

  void fetchClaim();
  const channel = supabase
    .channel('findsync-claims')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, () => void fetchClaim())
    .subscribe();

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}
