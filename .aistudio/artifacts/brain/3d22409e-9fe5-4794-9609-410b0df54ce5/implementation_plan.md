# FindSync: All-Campus Expansion Plan

Expand FindSync from a single building prototype into a comprehensive, multi-facility campus-wide lost and found network. This expansion introduces a top-bar campus/site switcher, full coverage of residence halls and dormitories, campus transit shuttles, athletic complexes, and multi-desk custody intake points.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed during the clarification interview:
> - **Campus Scope**: Expand the primary campus infrastructure into an exhaustive network covering all academic halls, residence dorms, dining commons, and campus transit shuttle routes.
> - **Campus Switcher**: A persistent top-bar campus selector with a quick-change menu allowing users to switch between *Caldwell Main Campus (Central Quad)*, *Downtown Health & Medical Sciences*, *North Tech & Research Park*, and *All Campuses (System-Wide)*.
> - **Supported Facility Types**: Added deep support for:
>   1. **Campus Transit Shuttles**: Blue Line Quad Loop, Red Line Express, and parking deck hubs with bus number and stop tagging.
>   2. **Residence Halls & Dorms**: North Quad Dorms, South Tower Residences, Maple Hall, and RA front desk drop-boxes.
>   3. **Athletics & Recreation Arenas**: Gymnasium locker facilities, varsity arena courts, and fitness center concierge desks.

---

## 1. Overview & Core Concept

- **What It Does**: Provides campus-wide lost-and-found registry coverage for an entire collegiate ecosystem. Students, faculty, bus drivers, resident assistants (RAs), and safety officers can report, track, and recover items dropped in classrooms, dorm lounges, shuttle buses, or athletic locker rooms.
- **Target Audience / Persona**:
  - *Commuter & Resident Students*: Search items lost along daily commute paths (e.g. Shuttle Bus #12 to Science Quad to South Dorms).
  - *Residence Life & RA Staff*: Log items left in residential common rooms, laundry rooms, and dorm lounges with floor-level precision.
  - *Transit & Facilities Operators*: Log property found on transit shuttles and campus commuter lots directly into custody bins.
- **Key Value**: Eliminates the information silos between dormitory front desks, academic departmental offices, athletic facilities, and campus transit dispatch.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Top-Bar Campus & Site Switching**:
   - Integrated dropdown selector situated directly beside the FindSync brand logo in the header.
   - Preserves active search queries and filter settings while filtering item records and custody desk availability to the chosen campus site.
   - Sites supported:
     - `Caldwell University – Main Campus` (Academic Quad, Library, Student Union)
     - `Downtown Campus – Health Sciences & Medical` (Clinical labs, nursing simulation wing)
     - `North Campus – Engineering & Research Park` (Innovation incubator, robotics labs)
     - `All Campuses (University-Wide Network)`

2. **Expanded Campus Facility Categories**:
   - Filter sidebar and reporting forms grouped into 5 clear collegiate operational sectors:
     - **Academic Facilities**: Main Library, Science Quad, Arts Hall, Humanities Hall, Engineering Center.
     - **Residence Halls & Dorms**: North Quad Dorms, South Tower, Maple Hall, Alumni Commons.
     - **Transit & Shuttles**: Blue Line Quad Loop, Red Line Express, Commuter Parking P4, Bike Share Hub.
     - **Athletics & Recreation**: Gymnasium Locker Rooms, Varsity Arena, Fitness Center.
     - **Student Life & Dining**: Student Union, Dining Commons East/West, Campus Bookstore.

3. **Transit Shuttle Property Recovery Flow**:
   - Items found on buses display shuttle route tags (e.g. `Blue Line Shuttle #12 · Stop 4 (Library Plaza)`).
   - Transit property is automatically assigned to the Central Depot Custody Bin.

4. **Multi-Desk Custody Network (`Campus Desks`)**:
   - Expanded from 3 to 5 authorized physical handover desks:
     - Student Union Front Desk (Open 24/7)
     - Main Campus Library Circulation Desk
     - South Quad Residence Life Info Hub
     - Caldwell Health & Athletics Center Concierge
     - Downtown Health Sciences Security Desk

---

## 3. Key Product Decisions & Trade-Offs

- **Hierarchical Location Taxonomy**:
  - *Chosen Approach*: Group locations by Sector (`Academic`, `Residential`, `Transit`, `Athletics`, `Student Life`) with sub-location zones (Building, Floor/Room, or Bus Line/Stop).
  - *Why*: Allows students to quickly narrow down where they lost an item without scrolling through an unorganized list of 50+ campus rooms.
- **Campus Selector State Persistence**:
  - *Chosen Approach*: Store active campus selection in top-level state and sync across all views (Explore, Potential Matches, Report Lost, and My Items).
  - *Why*: Ensures a seamless experience where switching to "Downtown Health Sciences" filters the explore feed, map coordinates, and reporting facility dropdown simultaneously.

---

## 4. Technical Architecture & Component Structure

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FindSync App Shell                              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Brand | Campus Switcher Dropdown | Nav Tabs | Desk | User Profile│  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│             ┌───────────────────────┴───────────────────────┐          │
│             ▼                                               ▼          │
│  ┌─────────────────────────┐                     ┌──────────────────┐  │
│  │   Active Campus State   │                     │ Expanded Mock    │  │
│  │ - Main Campus           │◄───────────────────►│ Database         │  │
│  │ - Downtown Medical      │                     │ - 16+ Items      │  │
│  │ - North Research Park   │                     │ - Shuttles/Dorms │  │
│  │ - All Campuses          │                     │ - 5 Custody Desks│  │
│  └─────────────────────────┘                     └──────────────────┘  │
│             │                                                          │
│  ┌──────────┴───────────────────────────────────────────────────────┐  │
│  │ Updated Views & Modals                                           │  │
│  │  - HomeView: Dribbble-style modern hero, search, stats, feed   │  │
│  │  - ExploreView: Multi-sector filters & campus transit items      │  │
│  │  - ReportLostView: Full facility selector + transit lines        │  │
│  │  - PotentialMatchesView: Campus movement corridor & dorm transit │  │
│  │  - Ownership Claim Drawer: Serial verification & evidence upload │  │
│  │  - MyItemsView: 6-step cross-campus claim tracking               │  │
│  │  - NotificationsModal: Match alerts, claim updates, handovers    │  │
│  │  - AuthModal: Caldwell University SSO login, register, profile   │  │
│  │  - AdminPortalView: Officer Ramirez adjudication & custody bins │  │
│  │  - CampusDeskModal: 7 safe handover stations with live hours     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Complete Frontend Feature Delivery Status

1. **Home Page**: Features high-impact Collegiate Civic hero section, intuitive search with category tags, action CTA cards (Report Lost, Report Found, Check Match), live campus recovery stats, and a real-time recently reported feed.
2. **Report Lost / Report Found**: Photo upload and live preview, category, brand, colorway, campus sector picker (Academic, Residence Dorms, Transit Shuttles, Athletics, Student Life), confidential covert clues, and bin allocation.
3. **Explore and Search**: Full-text search, multi-filters for facility sector, campus location, color, and status, with rich item detail modal.
4. **AI Potential Match Page**: Side-by-side comparison of lost vs found items with 86% confidence gauge, 4-factor AI breakdown, geospatial corridor walk map, and dispute/save options.
5. **Ownership Claim**: Interactive claim drawer supporting covert markers, proof upload, and custody officer review assignment.
6. **My Items**: Personal reports dashboard, 6-step visual claim tracking stepper, resolution rate counter, and direct handover instructions.
7. **Notifications**: Dedicated notifications modal and header popover with unread counters, category tabs (Matches, Claims, Evidence, Handovers), and quick navigation.
8. **Login and Sign-up**: Full-page dedicated authentication gateway shown first to unauthenticated users, supporting **Login with Google account** (Supabase Auth with iframe-safe fallback), personal email/username login, new account registration without mandatory college email restriction, password reset, and role selector (Student/Finder vs Campus Staff).
9. **Role Isolation**: Strict role enforcement preventing student/finder logins from seeing or accessing Officer View or the Admin Portal.
10. **Admin Panel**: Officer Ramirez staff adjudication console with claim approval/rejection/evidence requests, item inventory indexed by custody bins, user directory, and immutable chain of custody audit logs.
11. **Supabase PostgreSQL & Realtime Backend**: Integrated `@supabase/supabase-js` client SDK with live database support for items and claims, realtime subscriptions, automated seeding, comprehensive SQL schema in `supabase/schema.sql`, environment variable configurations in `.env.example`, and zero-latency local fallback support.
12. **FastAPI Backend & Free APIs**: Full RESTful Python service in `api/main.py` bridged with Express (`server.ts` on port 3000), delivering:
    - **Free AI Matching Engine**: Multi-factor similarity scoring (category, Jaccard token overlap, temporal, and campus corridor geospatial proximity) with Gemini AI integration (`/api/match`).
    - **Free OpenStreetMap Geocoding API**: Reverse geocoding and campus building coordinate lookups (`/api/geocode`).
    - **Free Campus Recovery Stats API**: Live analytics for recovery rates, resolution turnaround, and desk custody volumes (`/api/stats`).
    - **Interactive Swagger Documentation**: Accessible at `/docs` and `/redoc`.



