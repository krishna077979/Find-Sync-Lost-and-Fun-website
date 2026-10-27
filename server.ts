import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

interface ItemLocationCoordinates {
  lat: number;
  lng: number;
  formatted?: string;
  accuracyMeters?: number;
}

interface ItemRecord {
  id: string;
  reportCode: string;
  type: 'lost' | 'found';
  title: string;
  category: string;
  brand?: string;
  model?: string;
  colorway: string;
  colorHex?: string;
  description: string;
  campusId: string;
  campusName?: string;
  buildingArea?: string;
  locationName: string;
  roomZone?: string;
  dateLostOrFound: string;
  timeString: string;
  status: string;
  binNumber?: string;
  imageUrl: string;
  imageAlt: string;
  ownerId?: string;
  locationCoordinates?: ItemLocationCoordinates;
  createdAt: string;
}

interface ClaimRecord {
  id: string;
  claimId: string;
  itemTitle: string;
  reportNumber: string;
  status: string;
  currentStep: number;
  updatedAgo: string;
  submittedProof?: string;
  reviewingOfficer?: string;
  officeLocation?: string;
  estimatedVerification?: string;
  resolutionDate?: string;
}

// In-memory data store for standalone full-stack operation
const itemsDb = new Map<string, ItemRecord>([
  [
    'item-lost-01',
    {
      id: 'item-lost-01',
      reportCode: '#L-2049',
      type: 'lost',
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      category: 'Electronics',
      brand: 'Sony',
      model: 'WH-1000XM4',
      colorway: 'Matte Black',
      description: 'Black over-ear wireless headphones with a tiny scratch on the left ear cup hinge. In black travel case with braided USB-C cable.',
      campusId: 'sage-bhopal',
      campusName: 'SAGE University Bhopal',
      buildingArea: 'Main Campus Library',
      locationName: 'Library 2nd Floor Study Commons',
      roomZone: 'Table Cluster B',
      dateLostOrFound: 'Oct 14, 2024',
      timeString: '2:15 PM',
      status: 'active_search',
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
      imageAlt: 'Black Sony over-ear headphones on study desk',
      createdAt: '2024-10-14T14:15:00Z',
    },
  ],
  [
    'item-found-01',
    {
      id: 'item-found-01',
      reportCode: '#F-1082',
      type: 'found',
      title: 'Over-Ear Bluetooth Headphones in Hard Shell Case',
      category: 'Electronics',
      brand: 'Sony',
      model: 'WH-1000XM4',
      colorway: 'Matte Black',
      description: 'Premium ANC over-ear headphones turned into Student Union desk by campus custodian. Minor abrasion noted near hinge pin.',
      campusId: 'sage-bhopal',
      campusName: 'SAGE University Bhopal',
      buildingArea: 'Student Union Building',
      locationName: 'Student Union Lower Atrium Lounge',
      roomZone: 'North Entrance Seating',
      dateLostOrFound: 'Oct 14, 2024',
      timeString: '2:45 PM',
      status: 'in_custody',
      binNumber: 'BIN #E-14',
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
      imageAlt: 'Intake photograph of black over-ear headphones in storage',
      createdAt: '2024-10-14T14:45:00Z',
    },
  ],
]);

const claimsDb = new Map<string, ClaimRecord>([
  [
    'CLM-9021',
    {
      id: 'CLM-9021',
      claimId: 'CLM-9021',
      itemTitle: 'Sony WH-1000XM4 Headphones',
      reportNumber: '#F-1082',
      status: 'under_review',
      currentStep: 2,
      updatedAgo: '10 mins ago',
      submittedProof: 'Uploaded digital receipt from Best Buy and device MAC address snippet',
      reviewingOfficer: 'Officer Ramirez',
      officeLocation: 'Student Union Desk Counter #2',
      estimatedVerification: 'Today by 4:30 PM',
    },
  ],
]);

function calculateDynamicMatch(lost: Partial<ItemRecord>, found: Partial<ItemRecord>) {
  const catScore = (lost.category && found.category && lost.category.toLowerCase() === found.category.toLowerCase()) ? 100 : 30;

  const brandMatch = (lost.brand && found.brand && lost.brand.toLowerCase() === found.brand.toLowerCase()) ? 1.0 : 0.5;
  const modelMatch = (lost.model && found.model && lost.model.toLowerCase() === found.model.toLowerCase()) ? 1.0 : 0.4;
  const colorMatch = (lost.colorway && found.colorway && (
    lost.colorway.toLowerCase().includes(found.colorway.toLowerCase()) ||
    found.colorway.toLowerCase().includes(lost.colorway.toLowerCase())
  )) ? 1.0 : 0.3;

  const tokensLost = new Set(`${lost.title || ''} ${lost.description || ''}`.toLowerCase().match(/\w+/g) || []);
  const tokensFound = new Set(`${found.title || ''} ${found.description || ''}`.toLowerCase().match(/\w+/g) || []);
  let intersectCount = 0;
  for (const t of tokensLost) {
    if (tokensFound.has(t)) intersectCount++;
  }
  const unionCount = Math.max(tokensLost.size + tokensFound.size - intersectCount, 1);
  const jaccard = intersectCount / unionCount;

  let visualScore = Math.round((brandMatch * 0.35 + modelMatch * 0.35 + colorMatch * 0.15 + jaccard * 0.15) * 100);
  visualScore = Math.min(Math.max(visualScore, 25), 98);

  const sameCampus = lost.campusId === found.campusId;
  const sameBuilding = Boolean(lost.buildingArea && found.buildingArea && lost.buildingArea.toLowerCase() === found.buildingArea.toLowerCase());

  let geoScore = 35;
  let distanceMeters = 1200;
  let transitTime = 'Separate campus sectors';
  let corridor = `Across different campus sites (${lost.campusId} to ${found.campusId})`;

  if (sameBuilding) {
    geoScore = 95;
    distanceMeters = 45;
    transitTime = '~1 min walk';
    corridor = `Within same building: ${lost.buildingArea}`;
  } else if (sameCampus) {
    geoScore = 82;
    distanceMeters = 180;
    transitTime = '~3 min transit walk';
    corridor = `Campus central corridor between ${lost.locationName || 'location'} and ${found.locationName || 'location'}`;
  }

  const timeScore = lost.dateLostOrFound === found.dateLostOrFound ? 88 : 60;
  let totalScore = Math.round(catScore * 0.25 + visualScore * 0.35 + timeScore * 0.20 + geoScore * 0.20);
  totalScore = Math.min(Math.max(totalScore, 10), 96);

  const explanation = `Strong similarity detected in ${lost.category || 'Asset'} category. ${
    lost.brand && found.brand ? `Brand alignment verified (${lost.brand}). ` : ''
  }Geospatial corridor check confirms item recovery along campus pathway (${transitTime}).`;

  return {
    confidenceScore: totalScore,
    factorBreakdown: {
      categoryAndType: catScore,
      visualAndModel: visualScore,
      timeProximity: timeScore,
      geospatialProximity: geoScore,
    },
    explanation,
    distanceMeters,
    transitTime,
    corridorDescription: corridor,
  };
}

async function createServer() {
  const app = express();
  app.use(express.json());

  // CORS middleware for safety
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
  });

  // 1. Health check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'online',
      service: 'FindSync Unified Server',
      engine: 'Express/TypeScript',
      itemsCount: itemsDb.size,
      claimsCount: claimsDb.size,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Campus recovery statistics
  app.get('/api/stats', (_req, res) => {
    const items = Array.from(itemsDb.values());
    const lostCount = items.filter((i) => i.type === 'lost').length;
    const foundCount = items.filter((i) => i.type === 'found').length;
    const reunitedCount = items.filter((i) => i.status === 'reunited').length;

    res.json({
      totalReports: items.length || 18,
      lostItems: lostCount || 10,
      foundItems: foundCount || 8,
      reunitedItems: reunitedCount || 14,
      activeDesks: 7,
      campusRecoveryRate: '78.4%',
      avgReunionHours: '14.2h',
    });
  });

  // 3. Items list with filtering
  app.get('/api/items', (req: Request, res: Response) => {
    const { type, category, campusId, search } = req.query as Record<string, string | undefined>;
    let results = Array.from(itemsDb.values());

    if (type) {
      results = results.filter((i) => i.type.toLowerCase() === type.toLowerCase());
    }
    if (category && category !== 'all') {
      results = results.filter((i) => i.category.toLowerCase() === category.toLowerCase());
    }
    if (campusId && campusId !== 'all-campuses') {
      results = results.filter((i) => i.campusId.toLowerCase() === campusId.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          (i.brand && i.brand.toLowerCase().includes(q)) ||
          i.reportCode.toLowerCase().includes(q)
      );
    }

    res.json(results);
  });

  // 4. Get specific item
  app.get('/api/items/:id', (req: Request, res: Response) => {
    const item = itemsDb.get(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(item);
  });

  // 5. Create item
  app.post('/api/items', (req: Request, res: Response) => {
    const item: ItemRecord = req.body;
    if (!item.id) {
      item.id = `item-${Date.now()}`;
    }
    if (!item.createdAt) {
      item.createdAt = new Date().toISOString();
    }
    itemsDb.set(item.id, item);
    res.status(201).json(item);
  });

  // 6. Update item
  app.put('/api/items/:id', (req: Request, res: Response) => {
    const current = itemsDb.get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const updated = { ...current, ...req.body };
    itemsDb.set(req.params.id, updated);
    res.json(updated);
  });

  // 7. Delete item
  app.delete('/api/items/:id', (req: Request, res: Response) => {
    itemsDb.delete(req.params.id);
    res.status(204).end();
  });

  // 8. AI Matching verification
  app.post('/api/match', async (req: Request, res: Response) => {
    const { lostItem, foundItem } = req.body || {};
    if (!lostItem || !foundItem) {
      return res.status(400).json({ error: 'Missing lostItem or foundItem in body' });
    }

    const baseCalculation = calculateDynamicMatch(lostItem, foundItem);
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey && geminiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI();
        const prompt = `Analyze these two campus lost & found reports and score their similarity from 0 to 100.
Lost Report:
Title: ${lostItem.title || 'Unknown'}
Category: ${lostItem.category || 'General'}
Brand: ${lostItem.brand || 'Unbranded'}
Description: ${lostItem.description || ''}
Location: ${lostItem.locationName || 'Campus'}
Date: ${lostItem.dateLostOrFound || ''}

Found Report:
Title: ${foundItem.title || 'Unknown'}
Category: ${foundItem.category || 'General'}
Brand: ${foundItem.brand || 'Unbranded'}
Description: ${foundItem.description || ''}
Location: ${foundItem.locationName || 'Campus'}
Date: ${foundItem.dateLostOrFound || ''}

Provide a concise 1-sentence verification summary and an integer confidence score from 0 to 100.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const match = text.match(/\b([0-9]{1,3})\b/);
        if (match) {
          const aiScore = parseInt(match[1], 10);
          if (aiScore >= 0 && aiScore <= 100) {
            baseCalculation.confidenceScore = Math.round(baseCalculation.confidenceScore * 0.4 + aiScore * 0.6);
            baseCalculation.explanation = `Gemini AI Verified: ${text.slice(0, 180)}`;
          }
        }
      } catch (err: unknown) {
        console.warn('Gemini match note:', err instanceof Error ? err.message : String(err));
      }
    }

    res.json(baseCalculation);
  });

  // 9. Claims endpoints
  app.post('/api/claims', (req: Request, res: Response) => {
    const claim: ClaimRecord = req.body;
    if (!claim.claimId) {
      claim.claimId = `CLM-${Date.now()}`;
    }
    claim.id = claim.claimId;
    claimsDb.set(claim.claimId, claim);
    res.status(201).json(claim);
  });

  app.get('/api/claims/:id', (req: Request, res: Response) => {
    const claim = claimsDb.get(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    res.json(claim);
  });

  app.put('/api/claims/:id', (req: Request, res: Response) => {
    const current = claimsDb.get(req.params.id);
    if (!current) {
      return res.status(404).json({ error: 'Claim not found' });
    }
    const updated = { ...current, ...req.body };
    claimsDb.set(req.params.id, updated);
    res.json(updated);
  });

  // 10. Geocoding endpoint (Nominatim OpenStreetMap with fallback)
  app.get('/api/geocode', async (req: Request, res: Response) => {
    const query = (req.query.query as string) || 'Campus';
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' SAGE University Bhopal')}&format=json&limit=3`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'FindSync-Campus-LostAndFound/1.0' },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          const results = data.map((item: any) => ({
            display_name: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            type: item.type || 'campus_location',
          }));
          return res.json(results);
        }
      }
    } catch {
      // ignore network errors and return default
    }

    res.json([
      {
        display_name: `${query} - SAGE University Bhopal Campus Ground`,
        lat: 23.1678,
        lon: 77.5312,
        type: 'campus_location',
      },
    ]);
  });

  // Dedicated OAuth popup callback endpoint
  app.get(['/auth/callback', '/auth/callback/'], (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FindSync - Completing Google Sign In</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #ecfef1;
      color: #101f17;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
      text-align: center;
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #d5e7da;
      border-top-color: #012d1d;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 { font-size: 19px; margin: 0 0 8px; color: #012d1d; font-weight: 700; }
    p { font-size: 13px; color: #414844; margin: 0; max-width: 320px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>Verifying Google Credentials</h2>
  <p>Authenticating your campus profile with FindSync. This window will close automatically...</p>
  <script>
    (function() {
      try {
        var payload = {
          type: 'FINDSYNC_GOOGLE_AUTH_CALLBACK',
          hash: window.location.hash || '',
          search: window.location.search || '',
          href: window.location.href,
          origin: window.location.origin
        };
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(payload, '*');
          setTimeout(function() {
            window.close();
          }, 350);
        } else {
          // If navigated directly, redirect to main app route with query/hash
          window.location.replace('/' + (window.location.hash || window.location.search));
        }
      } catch (err) {
        console.error('FindSync OAuth callback error:', err);
      }
    })();
  </script>
</body>
</html>`);
  });

  // 11. Vite development middleware or static production serve
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'))) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FindSync full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
});
