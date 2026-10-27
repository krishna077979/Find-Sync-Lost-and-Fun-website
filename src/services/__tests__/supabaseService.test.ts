import assert from 'node:assert';
import {
  deriveDisplayName,
  rowToItem,
  itemToInsertPayload,
  computeMatchScore,
  isUUID,
  SupabaseItemRow,
} from '../supabaseService';
import { Item } from '../../types';

console.log('--- Running FindSync Supabase Service Tests ---');

// 1. Test deriveDisplayName
{
  assert.strictEqual(
    deriveDisplayName({ user_metadata: { full_name: 'Maya Lin' }, email: 'maya@campus.edu' }),
    'Maya Lin',
    'Should prefer full_name from metadata'
  );

  assert.strictEqual(
    deriveDisplayName({ user_metadata: { name: 'Officer Ramirez' }, email: 'ramirez@bhopal.edu' }),
    'Officer Ramirez',
    'Should use name if full_name is missing'
  );

  assert.strictEqual(
    deriveDisplayName({ user_metadata: { given_name: 'Alex', family_name: 'Chen' }, email: 'alex@campus.edu' }),
    'Alex Chen',
    'Should combine given_name and family_name'
  );

  assert.strictEqual(
    deriveDisplayName({ user_metadata: {}, email: 'jordan.smith@campus.edu' }),
    'Jordan.smith',
    'Should fall back to capitalized email prefix'
  );

  assert.strictEqual(
    deriveDisplayName({ user_metadata: undefined, email: null }),
    'Campus Member',
    'Should fall back to Campus Member if nothing provided'
  );
  console.log('✓ deriveDisplayName tests passed');
}

// 2. Test isUUID
{
  assert.strictEqual(isUUID('3d22409e-9fe5-4794-9609-410b0df54ce5'), true);
  assert.strictEqual(isUUID('sage-bhopal'), false);
  assert.strictEqual(isUUID('item-1'), false);
  assert.strictEqual(isUUID(null), false);
  assert.strictEqual(isUUID(undefined), false);
  console.log('✓ isUUID validation tests passed');
}

// 3. Test itemToInsertPayload
{
  const mockItem: Partial<Item> = {
    title: 'Apple AirPods Pro 2',
    category: 'Electronics',
    brand: 'Apple',
    model: 'AirPods Pro 2nd Gen',
    colorway: 'White',
    description: 'White charging case with lanyard loop',
    campusId: 'sage-bhopal',
    locationName: 'Library 1st Floor',
    type: 'lost',
  };

  const payload = itemToInsertPayload(mockItem, 'usr-test-1234');

  assert.strictEqual(payload.reporter_id, 'usr-test-1234');
  assert.strictEqual(payload.title, 'Apple AirPods Pro 2');
  assert.strictEqual(payload.item_type, 'lost');
  assert.strictEqual(payload.category, 'Electronics');
  assert.strictEqual(payload.brand, 'Apple');
  assert.strictEqual(payload.color, 'White');
  assert.strictEqual(payload.status, 'active_search');
  assert.strictEqual(payload.latitude, null, 'Coordinates must be null if not explicitly provided');
  assert.strictEqual(payload.longitude, null);

  // Assert no forbidden / nonexistent columns
  const keys = Object.keys(payload);
  assert.strictEqual(keys.includes('report_code'), false);
  assert.strictEqual(keys.includes('type'), false);
  assert.strictEqual(keys.includes('colorway'), false);
  assert.strictEqual(keys.includes('building_area'), false);
  assert.strictEqual(keys.includes('image_url'), false);
  assert.strictEqual(keys.includes('match_score'), false);
  console.log('✓ itemToInsertPayload strict authoritative column tests passed');
}

// 4. Test rowToItem conversion
{
  const row: SupabaseItemRow = {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    reporter_id: 'usr-reporter-88',
    campus_id: null,
    item_type: 'found',
    title: 'Hydro Flask 32oz Water Bottle',
    category: 'Personal Essentials',
    brand: 'Hydro Flask',
    model: 'Wide Mouth 32oz',
    color: 'Pacific Blue',
    description: 'Found at dining table with university stickers',
    location_description: 'Food Court Lounge',
    latitude: 23.1784,
    longitude: 77.4923,
    incident_at: '2024-10-14T10:30:00Z',
    status: 'in_custody',
    created_at: '2024-10-14T11:00:00Z',
    updated_at: '2024-10-14T11:00:00Z',
  };

  const item = rowToItem(row, 'https://example.com/photo.jpg');

  assert.strictEqual(item.id, 'f47ac10b-58cc-4372-a567-0e02b2c3d479');
  assert.strictEqual(item.reportCode, '#F-F47A');
  assert.strictEqual(item.type, 'found');
  assert.strictEqual(item.status, 'in_custody');
  assert.strictEqual(item.title, 'Hydro Flask 32oz Water Bottle');
  assert.strictEqual(item.colorway, 'Pacific Blue');
  assert.strictEqual(item.ownerId, 'usr-reporter-88');
  assert.strictEqual(item.imageUrl, 'https://example.com/photo.jpg');
  assert.ok(item.locationCoordinates);
  assert.strictEqual((item.locationCoordinates as any).lat, 23.1784);
  console.log('✓ rowToItem model normalization tests passed');
}

// 5. Test computeMatchScore
{
  const lost: Item = {
    id: 'lost-1',
    reportCode: '#L-101',
    type: 'lost',
    title: 'Sony WH-1000XM4 Headphones',
    category: 'Electronics',
    brand: 'Sony',
    model: 'WH-1000XM4',
    colorway: 'Black',
    description: 'Over-ear headphones in black case',
    campusId: 'sage-bhopal',
    locationName: 'Library',
    dateLostOrFound: 'Oct 14, 2024',
    timeString: '2:00 PM',
    status: 'active_search',
    imageUrl: '',
    imageAlt: '',
    createdAt: new Date().toISOString(),
  };

  const matchingFound: Item = {
    id: 'found-1',
    reportCode: '#F-202',
    type: 'found',
    title: 'Sony Wireless ANC Headphones',
    category: 'Electronics',
    brand: 'Sony',
    model: 'WH-1000XM4',
    colorway: 'Black',
    description: 'Turned into desk, black colorway',
    campusId: 'sage-bhopal',
    locationName: 'Student Union',
    dateLostOrFound: 'Oct 14, 2024',
    timeString: '3:00 PM',
    status: 'in_custody',
    imageUrl: '',
    imageAlt: '',
    createdAt: new Date().toISOString(),
  };

  const mismatchFound: Item = {
    ...matchingFound,
    id: 'found-2',
    category: 'Clothing',
    brand: 'Nike',
    title: 'Nike Windbreaker Jacket',
  };

  const highMatch = computeMatchScore(lost, matchingFound);
  const lowMatch = computeMatchScore(lost, mismatchFound);

  assert.ok(highMatch.score >= 70, `High match score should be >= 70, got ${highMatch.score}`);
  assert.ok(lowMatch.score <= 45, `Mismatch score should be <= 45, got ${lowMatch.score}`);
  console.log(`✓ computeMatchScore passed (Matching: ${highMatch.score}%, Mismatch: ${lowMatch.score}%)`);
}

console.log('--- ALL TESTS PASSED SUCCESSFULLY ---');
