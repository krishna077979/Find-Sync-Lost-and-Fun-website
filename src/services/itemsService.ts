
import { supabase } from '../lib/supabase';
import { Item, ClaimTracking } from '../types';

const toItem = (row: any): Item => ({
  id: row.id,
  reportCode: row.report_code ?? `#L-${String(row.id).slice(-4)}`,
  ownerId: row.reporter_id,
  type: row.item_type,
  title: row.title,
  category: row.category,
  brand: row.brand ?? '',
  model: row.model ?? '',
  colorway: row.color ?? '',
  description: row.description,
  campusId: row.campus_id ?? '',
  locationName: row.location_description ?? '',
  dateLostOrFound: row.incident_at ?? row.date_lost_or_found ?? '',
  timeString: row.time_string ?? 'N/A',
  status: row.status,
  imageUrl: row.image_url ?? '',
  imageAlt: row.image_alt ?? row.title ?? 'Item image',
  createdAt: row.created_at,
});

const toItemRow = (item: Item) => ({
  reporter_id: (item as any).reporterId,
  campus_id: (item as any).campusId || null,
  item_type: (item as any).type,
  title: item.title,
  category: item.category,
  brand: item.brand || null,
  model: item.model || null,
  color: (item as any).colorway || null,
  description: item.description,
  location_description: (item as any).locationName || null,
  incident_at: (item as any).dateLostOrFound || null,
  status: item.status,
});

export async function seedInitialItemsIfEmpty(): Promise<void> {
  // Production items should come from real user reports, not mock data.
}

export function subscribeToItems(
  onUpdate: (items: Item[]) => void,
  onError?: (err: Error) => void
): () => void {
  let active = true;

  const loadItems = async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (!active) return;

    if (error) {
      onError?.(new Error(error.message));
      return;
    }

    onUpdate((data ?? []).map(toItem));
  };

  void loadItems();

  const channel = supabase
    .channel('findsync-items')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'items' },
      () => void loadItems()
    )
    .subscribe();

  return () => {
    active = false;
    void supabase.removeChannel(channel);
  };
}

export async function saveItemToFirestore(item: Item): Promise<void> {
  const { error } = await supabase
    .from('items')
    .insert(toItemRow(item));

  if (error) {
    throw new Error(`Could not save item: ${error.message}`);
  }
}

export async function updateItemInFirestore(
  itemId: string,
  updates: Partial<Item>
): Promise<void> {
  const row: Record<string, unknown> = {};

  if (updates.title !== undefined) row.title = updates.title;
  if (updates.category !== undefined) row.category = updates.category;
  if (updates.brand !== undefined) row.brand = updates.brand || null;
  if (updates.model !== undefined) row.model = updates.model || null;
  if (updates.description !== undefined) row.description = updates.description;
  if (updates.status !== undefined) row.status = updates.status;

  if ((updates as any).colorway !== undefined) {
    row.color = (updates as any).colorway || null;
  }
  if ((updates as any).locationName !== undefined) {
    row.location_description = (updates as any).locationName || null;
  }
  if ((updates as any).dateLostOrFound !== undefined) {
    row.incident_at = (updates as any).dateLostOrFound || null;
  }

  const { error } = await supabase
    .from('items')
    .update(row)
    .eq('id', itemId);

  if (error) {
    throw new Error(`Could not update item: ${error.message}`);
  }
}

export async function saveClaimToFirestore(
  claim: ClaimTracking
): Promise<void> {
  throw new Error(
    'Claim saving needs to be mapped to the Supabase claims schema before use.'
  );
}

export function subscribeToClaims(
  onUpdate: (claim: ClaimTracking) => void
): () => void {
  console.warn(
    'Claim subscription is not connected yet. Implement it against the Supabase claims schema.'
  );

  return () => {};
}
