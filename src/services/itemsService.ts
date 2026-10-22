import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Item, ClaimTracking } from '../types';
import { INITIAL_ITEMS, INITIAL_CLAIM_TRACKING } from '../data/mockData';

const ITEMS_COLLECTION = 'items';
const CLAIMS_COLLECTION = 'claims';

/**
 * Seed initial sample items if Firestore collection is empty
 */
export async function seedInitialItemsIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, ITEMS_COLLECTION));
    if (snap.empty) {
      // Seed initial mock items
      for (const item of INITIAL_ITEMS) {
        await setDoc(doc(db, ITEMS_COLLECTION, item.id), item);
      }
    }
  } catch (err) {
    console.warn('Initial seeding note:', err);
  }
}

/**
 * Listen for real-time items updates from Firestore
 */
export function subscribeToItems(
  onUpdate: (items: Item[]) => void,
  onError?: (err: Error) => void
): () => void {
  const q = query(collection(db, ITEMS_COLLECTION));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (!snapshot.empty) {
        const itemsList: Item[] = [];
        snapshot.forEach((docSnap) => {
          itemsList.push(docSnap.data() as Item);
        });
        // Sort newest first
        itemsList.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        onUpdate(itemsList);
      } else {
        // Fallback to initial items while seeding
        onUpdate(INITIAL_ITEMS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, ITEMS_COLLECTION);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Save a newly created item (lost report or turned-in found item) to Firestore
 */
export async function saveItemToFirestore(item: Item): Promise<void> {
  try {
    await setDoc(doc(db, ITEMS_COLLECTION, item.id), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ITEMS_COLLECTION}/${item.id}`);
  }
}

/**
 * Update an item's custody status, bin, or match in Firestore
 */
export async function updateItemInFirestore(
  itemId: string,
  updates: Partial<Item>
): Promise<void> {
  try {
    await updateDoc(doc(db, ITEMS_COLLECTION, itemId), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ITEMS_COLLECTION}/${itemId}`);
  }
}

/**
 * Save a claim submission to Firestore
 */
export async function saveClaimToFirestore(claim: ClaimTracking): Promise<void> {
  try {
    await setDoc(doc(db, CLAIMS_COLLECTION, claim.claimId), claim);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${CLAIMS_COLLECTION}/${claim.claimId}`);
  }
}

/**
 * Subscribe to claims
 */
export function subscribeToClaims(
  onUpdate: (claim: ClaimTracking) => void
): () => void {
  const unsub = onSnapshot(
    doc(db, CLAIMS_COLLECTION, INITIAL_CLAIM_TRACKING.claimId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as ClaimTracking);
      } else {
        onUpdate(INITIAL_CLAIM_TRACKING);
      }
    },
    (err) => {
      console.warn('Claims sync notice:', err);
    }
  );
  return unsub;
}
