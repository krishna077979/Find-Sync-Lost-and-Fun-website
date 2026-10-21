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
│  │  - ExploreView: Multi-sector filters & campus transit items      │  │
│  │  - ReportLostView: Full facility selector + transit lines        │  │
│  │  - PotentialMatchesView: Campus movement corridor & dorm transit │  │
│  │  - MyItemsView: Cross-campus claim tracking                      │  │
│  │  - CampusDeskModal: 5 safe handover stations with live hours     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```
